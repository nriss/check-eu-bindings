function stripVersion(canonical) {
  return canonical.split('|')[0];
}

// Extrait, pour un package IG déjà chargé (lui + ses dépendances), la liste de ses profils
// et pour chacun les bindings (ElementDefinition.binding) trouvés dans son snapshot, avec
// résolution du ValueSet cible et des terminologies (CodeSystem) qu'il référence.
export function extractIgProfiles(loader, { packageName, packageVersion }) {
  const scope = `${packageName}|${packageVersion}`;
  const profileInfos = loader.findResourceInfos('*', { type: ['Profile'], scope });

  const profiles = [];
  for (const info of profileInfos) {
    const key = info.url ?? info.id;
    const sd = loader.findResourceJSON(key, { type: ['StructureDefinition'], scope });
    if (!sd) {
      continue;
    }

    // On préfère le differential : il ne contient que les éléments que le profil définit/contraint
    // réellement (dont les bindings qu'il fixe ou resserre), alors que le snapshot inclut aussi
    // tous les éléments hérités tels quels de la ressource de base, ce qui noierait le tableau.
    const elements = sd.differential?.element ?? sd.snapshot?.element ?? [];
    const bindings = [];
    for (const element of elements) {
      const binding = element.binding;
      if (!binding?.valueSet) {
        continue;
      }
      const valueSetUrl = stripVersion(binding.valueSet);
      const valueSet = loader.findResourceJSON(valueSetUrl, { type: ['ValueSet'] });
      const codeSystems = valueSet
        ? [...new Set((valueSet.compose?.include ?? []).map((inc) => inc.system).filter(Boolean))]
        : null;

      bindings.push({
        path: element.path,
        strength: binding.strength ?? null,
        valueSetUrl,
        valueSetName: valueSet?.name ?? valueSet?.title ?? null,
        codeSystems // null = ValueSet non résolu, [] = résolu mais sans CodeSystem explicite (ex: composé d'un autre ValueSet)
      });
    }

    profiles.push({
      name: sd.name ?? sd.id,
      url: sd.url,
      bindings
    });
  }

  profiles.sort((a, b) => a.name.localeCompare(b.name));
  return profiles;
}

// Agrège, à travers tous les IG, la liste des terminologies (CodeSystem) rencontrées
// et les IG qui les référencent (pour la page de résumé).
export function buildTerminologySummary(igResults) {
  const bySystem = new Map();

  for (const { ig, profiles } of igResults) {
    for (const profile of profiles) {
      for (const binding of profile.bindings) {
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
