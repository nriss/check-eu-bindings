import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import * as tar from 'tar';

import { defaultPackageLoader, LoadStatus, DiskBasedVirtualPackage } from 'fhir-package-loader';

export async function createLoader() {
  const log = (level, message) => {
    if (level === 'error' || level === 'warn') {
      console.error(`[fhir-package-loader:${level}] ${message}`);
    }
  };
  return defaultPackageLoader({ log });
}

// Certains IG ne sont pas (encore, ou plus) mirrorés sur le registre FHIR standard
// (packages.fhir.org / packages2.fhir.org). Dans ce cas, on télécharge directement
// le package.tgz publié et on le charge comme "package virtuel".
async function loadFromTgzFallback(loader, name, version, tgzUrl) {
  console.error(`  Registre FHIR indisponible pour ${name}#${version}, tentative via ${tgzUrl}`);

  const response = await fetch(tgzUrl);
  if (!response.ok) {
    console.error(`  Échec du téléchargement de ${tgzUrl} (HTTP ${response.status})`);
    return LoadStatus.FAILED;
  }

  const extractDir = await mkdtemp(path.join(tmpdir(), 'check-eu-bindings-'));
  const buffer = Buffer.from(await response.arrayBuffer());
  await pipeline(Readable.from(buffer), tar.extract({ cwd: extractDir }));

  const packageDir = path.join(extractDir, 'package');
  const packageJSON = JSON.parse(await readFile(path.join(packageDir, 'package.json'), 'utf-8'));

  const virtualPackage = new DiskBasedVirtualPackage(packageJSON, [packageDir], { recursive: true });
  return loader.loadVirtualPackage(virtualPackage);
}

// Charge un package et, récursivement, toutes ses dépendances déclarées dans son package.json,
// afin de pouvoir résoudre les ValueSet référencés par les profils même quand ils sont définis
// dans un package tiers (core FHIR, hl7.terminology, IG dont l'IG dépend, ...).
export async function loadWithDependencies(loader, name, version, seen = new Set(), fallbackTgzUrl = null) {
  const key = `${name}#${version}`;
  if (seen.has(key)) {
    return;
  }
  seen.add(key);

  let status = await loader.loadPackage(name, version);
  if (status !== LoadStatus.LOADED && fallbackTgzUrl) {
    status = await loadFromTgzFallback(loader, name, version, fallbackTgzUrl);
  }
  if (status !== LoadStatus.LOADED) {
    console.error(`Avertissement : impossible de charger la dépendance ${key} (status=${status})`);
    return;
  }

  const packageJSONs = loader.findPackageJSONs(name);
  const packageJSON =
    packageJSONs.find((pkg) => pkg.version === version) ?? packageJSONs[packageJSONs.length - 1] ?? {};
  const dependencies = packageJSON.dependencies ?? {};

  for (const [depName, depVersion] of Object.entries(dependencies)) {
    await loadWithDependencies(loader, depName, depVersion, seen);
  }
}
