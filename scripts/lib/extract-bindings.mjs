function stripVersion(canonical) {
  return canonical.split('|')[0];
}

// Certains ValueSet référencés par les IG (ex: les ValueSet eHDSI/MyHealth@EU utilisés par HDR,
// EPS...) ne sont publiés dans aucun package FHIR chargé : ce sont des ValueSet hébergés en direct
// sur un serveur de terminologie. On tente de les résoudre en dernier recours via ces serveurs.
const TERMINOLOGY_SERVERS = ['https://tx.hl7europe.eu/r4', 'https://tx.fhir.org/r4'];

async function fetchValueSetFromServers(url) {
  for (const server of TERMINOLOGY_SERVERS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(`${server}/ValueSet?url=${encodeURIComponent(url)}`, {
        headers: { Accept: 'application/fhir+json' },
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!response.ok) {
        continue;
      }
      const bundle = await response.json();
      const match = bundle.entry?.find((e) => e.resource?.resourceType === 'ValueSet');
      if (match) {
        return match.resource;
      }
    } catch {
      // Serveur injoignable ou timeout : on tente le suivant.
    }
  }
  return null;
}

// Recherche un ValueSet d'abord dans les packages chargés, puis (si absent) sur les serveurs
// de terminologie de secours. Les résultats (y compris les échecs) sont mis en cache pour tout
// le run, un même ValueSet pouvant être référencé par de nombreux profils/IG.
async function findValueSet(loader, url, cache) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  let valueSet = loader.findResourceJSON(url, { type: ['ValueSet'] }) ?? null;
  if (!valueSet) {
    valueSet = await fetchValueSetFromServers(url);
  }
  cache.set(url, valueSet);
  return valueSet;
}

// Résout récursivement les CodeSystem référencés par un ValueSet. Un ValueSet peut lister
// des systems directement (compose.include[].system) et/ou importer d'autres ValueSet
// (compose.include[].valueSet), auquel cas il faut redescendre dans ceux-ci pour trouver
// les vrais CodeSystem (ex: ValueSet "allergy-intolerance-uv-ips" de l'IPS, composé uniquement
// d'autres ValueSet). Retourne `null` si le ValueSet lui-même est introuvable (localement et sur
// les serveurs de secours), ou si toutes ses inclusions renvoient vers des ValueSet eux-mêmes
// introuvables (résolution impossible).
async function resolveCodeSystems(loader, valueSetUrl, cache, visited = new Set()) {
  if (visited.has(valueSetUrl)) {
    return [];
  }
  visited.add(valueSetUrl);

  const valueSet = await findValueSet(loader, valueSetUrl, cache);
  if (!valueSet) {
    return null;
  }

  const systems = new Set();
  let anyUnresolved = false;

  for (const include of valueSet.compose?.include ?? []) {
    if (include.system) {
      systems.add(include.system);
    }
    for (const nestedUrl of include.valueSet ?? []) {
      const nested = await resolveCodeSystems(loader, stripVersion(nestedUrl), cache, visited);
      if (nested === null) {
        anyUnresolved = true;
      } else {
        nested.forEach((s) => systems.add(s));
      }
    }
  }

  if (systems.size === 0 && anyUnresolved) {
    return null;
  }
  return [...systems];
}

// Construit la liste des bindings à partir d'une liste d'ElementDefinition (celles d'un
// differential ou d'un snapshot — même logique dans les deux cas).
async function computeBindings(loader, elements, valueSetCache) {
  const bindings = [];
  for (const element of elements) {
    const binding = element.binding;
    if (!binding?.valueSet) {
      continue;
    }
    const valueSetUrl = stripVersion(binding.valueSet);
    const valueSet = await findValueSet(loader, valueSetUrl, valueSetCache);
    const codeSystems = await resolveCodeSystems(loader, valueSetUrl, valueSetCache);

    bindings.push({
      path: element.path,
      sliceName: element.sliceName ?? null,
      description: element.short ?? element.definition ?? null,
      strength: binding.strength ?? null,
      valueSetUrl,
      valueSetName: valueSet?.name ?? valueSet?.title ?? null,
      codeSystems // null = ValueSet (ou ses ValueSet imbriqués) non résolu, [] = résolu mais sans CodeSystem
    });
  }
  return bindings;
}

// Profils avec bindings d'abord (ordre alphabétique), profils sans binding à la fin.
function sortProfilesForSource(profiles, source) {
  return [...profiles].sort((a, b) => {
    const aCount = a.bySource[source].length;
    const bCount = b.bySource[source].length;
    if (aCount === 0 && bCount > 0) return 1;
    if (aCount > 0 && bCount === 0) return -1;
    return a.name.localeCompare(b.name);
  });
}

// Extrait, pour un package IG déjà chargé (lui + ses dépendances), la liste de ses profils et,
// pour chacun, les bindings (ElementDefinition.binding) trouvés à la fois dans son differential
// (ce que le profil définit/contraint réellement) et dans son snapshot (tous les éléments, y
// compris ceux hérités tels quels de la ressource de base), pour permettre de basculer entre les
// deux vues côté site.
export async function extractIgProfiles(loader, { packageName, packageVersion }, valueSetCache) {
  const scope = `${packageName}|${packageVersion}`;
  const profileInfos = loader.findResourceInfos('*', { type: ['Profile'], scope });

  const profiles = [];
  for (const info of profileInfos) {
    const key = info.url ?? info.id;
    const sd = loader.findResourceJSON(key, { type: ['StructureDefinition'], scope });
    if (!sd) {
      continue;
    }

    const [differential, snapshot] = await Promise.all([
      computeBindings(loader, sd.differential?.element ?? [], valueSetCache),
      computeBindings(loader, sd.snapshot?.element ?? [], valueSetCache)
    ]);

    profiles.push({
      name: sd.name ?? sd.id,
      url: sd.url,
      bySource: { differential, snapshot }
    });
  }

  return {
    differential: sortProfilesForSource(profiles, 'differential'),
    snapshot: sortProfilesForSource(profiles, 'snapshot')
  };
}

// Agrège, à travers tous les IG, la liste des terminologies (CodeSystem) rencontrées
// et les IG qui les référencent (pour la page de résumé), pour la source demandée
// ('differential' ou 'snapshot').
export function buildTerminologySummary(igResults, source) {
  const bySystem = new Map();

  for (const { ig, profiles } of igResults) {
    for (const profile of profiles[source]) {
      for (const binding of profile.bySource[source]) {
        if (!binding.codeSystems) {
          continue;
        }
        for (const system of binding.codeSystems) {
          if (!bySystem.has(system)) {
            bySystem.set(system, new Map());
          }
          const igUsage = bySystem.get(system);
          igUsage.set(ig.id, (igUsage.get(ig.id) ?? 0) + 1);
        }
      }
    }
  }

  return [...bySystem.entries()]
    .map(([system, igUsage]) => ({
      system,
      usages: [...igUsage.entries()].map(([igId, count]) => ({ igId, count }))
    }))
    .sort((a, b) => a.system.localeCompare(b.system));
}
