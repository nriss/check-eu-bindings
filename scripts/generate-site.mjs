import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

import { IG_LIST } from './ig-list.mjs';
import { createLoader, loadWithDependencies } from './lib/load-package.mjs';
import { extractIgProfiles, buildTerminologySummary } from './lib/extract-bindings.mjs';
import { renderIgPage, renderIndexPage, STYLE_CSS } from './lib/render.mjs';

const OUT_DIR = path.resolve('_site');

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(path.join(OUT_DIR, 'ig'), { recursive: true });
  await mkdir(path.join(OUT_DIR, 'assets'), { recursive: true });
  await writeFile(path.join(OUT_DIR, 'assets', 'style.css'), STYLE_CSS);

  const loader = await createLoader();
  const seen = new Set();
  const valueSetCache = new Map();
  const igResults = [];

  for (const ig of IG_LIST) {
    console.log(`\n=== ${ig.displayName} (${ig.packageName}#${ig.packageVersion}) ===`);
    await loadWithDependencies(loader, ig.packageName, ig.packageVersion, seen, ig.fallbackTgzUrl ?? null);

    const profiles = await extractIgProfiles(loader, ig, valueSetCache);
    const bindingCount = profiles.reduce((n, p) => n + p.bindings.length, 0);
    console.log(`  ${profiles.length} profil(s), ${bindingCount} binding(s)`);

    igResults.push({ ig, profiles });
    const html = renderIgPage(ig, profiles);
    await writeFile(path.join(OUT_DIR, 'ig', `${ig.id}.html`), html);
  }

  const terminologySummary = buildTerminologySummary(igResults);
  const indexHtml = renderIndexPage(IG_LIST, terminologySummary);
  await writeFile(path.join(OUT_DIR, 'index.html'), indexHtml);

  console.log(`\nSite généré dans ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
