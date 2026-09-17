function escapeHtml(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderNav(igList, activeHref) {
  const onIndex = activeHref === 'index';
  const homeHref = onIndex ? 'index.html' : '../index.html';
  const igHrefPrefix = onIndex ? 'ig/' : '';

  const options = igList
    .map((ig) => {
      const href = `${igHrefPrefix}${ig.id}.html`;
      const selected = ig.id === activeHref ? ' selected' : '';
      return `<option value="${escapeHtml(href)}"${selected}>${escapeHtml(ig.displayName)}</option>`;
    })
    .join('');

  return `
  <nav class="site-nav">
    <a class="nav-home" href="${escapeHtml(homeHref)}">← Accueil</a>
    <label class="nav-ig-select">
      Aller à un IG :
      <select onchange="if (this.value) { window.location.href = this.value; }">
        <option value=""${onIndex ? ' selected' : ''}>— Choisir un IG —</option>
        ${options}
      </select>
    </label>
  </nav>`;
}

function layout({ title, activeHref, body, igList }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="${activeHref === 'index' ? '' : '../'}assets/style.css" />
</head>
<body>
<header>
  <h1><a href="${activeHref === 'index' ? '' : '../'}index.html">HL7 Europe — bindings &amp; terminologies</a></h1>
  ${renderNav(igList, activeHref)}
</header>
<main>
${body}
</main>
<footer>
  <p>Généré automatiquement depuis les packages FHIR publiés des IG HL7 Europe.</p>
</footer>
</body>
</html>
`;
}

function renderBindingStrength(strength) {
  if (!strength) {
    return '<span class="muted">—</span>';
  }
  return `<span class="badge badge-${escapeHtml(strength)}">${escapeHtml(strength)}</span>`;
}

function renderCodeSystems(codeSystems) {
  if (codeSystems === null) {
    return '<span class="muted">non résolu</span>';
  }
  if (codeSystems.length === 0) {
    return '<span class="muted">aucun (ValueSet composé)</span>';
  }
  return `<ul class="code-systems">${codeSystems
    .map((system) => `<li><code>${escapeHtml(system)}</code></li>`)
    .join('')}</ul>`;
}

export function renderIgPage(ig, profiles, igList) {
  const rows = [];
  for (const profile of profiles) {
    if (profile.bindings.length === 0) {
      rows.push(`<tr>
        <td><a href="${escapeHtml(profile.url)}">${escapeHtml(profile.name)}</a></td>
        <td colspan="4" class="muted">Aucun binding</td>
      </tr>`);
      continue;
    }
    profile.bindings.forEach((binding, index) => {
      rows.push(`<tr>
        ${
          index === 0
            ? `<td rowspan="${profile.bindings.length}"><a href="${escapeHtml(profile.url)}">${escapeHtml(
                profile.name
              )}</a></td>`
            : ''
        }
        <td><code>${escapeHtml(binding.path)}</code></td>
        <td>${renderBindingStrength(binding.strength)}</td>
        <td><a href="${escapeHtml(binding.valueSetUrl)}">${escapeHtml(binding.valueSetName ?? binding.valueSetUrl)}</a></td>
        <td>${renderCodeSystems(binding.codeSystems)}</td>
      </tr>`);
    });
  }

  const body = `
  <h2>${escapeHtml(ig.displayName)}</h2>
  <p><a href="${escapeHtml(ig.publicationUrl)}">Page de publication de l'IG</a> — package <code>${escapeHtml(
    ig.packageName
  )}#${escapeHtml(ig.packageVersion)}</code></p>
  <div class="table-scroll">
  <table class="ig-table">
    <thead>
      <tr>
        <th>Profil</th>
        <th>Élément</th>
        <th>Force du binding</th>
        <th>ValueSet</th>
        <th>Terminologies (CodeSystem)</th>
      </tr>
    </thead>
    <tbody>
      ${rows.join('\n')}
    </tbody>
  </table>
  </div>
  `;

  return layout({ title: `${ig.displayName} — bindings HL7 Europe`, activeHref: ig.id, body, igList });
}

export function renderIndexPage(igList, terminologySummary) {
  const igIndex = new Map(igList.map((ig) => [ig.id, ig]));

  const rows = terminologySummary.map(({ system, usages }) => {
    const igCells = usages
      .sort((a, b) => (igIndex.get(a.igId)?.displayName ?? '').localeCompare(igIndex.get(b.igId)?.displayName ?? ''))
      .map(
        ({ igId, count }) =>
          `<li><a href="ig/${escapeHtml(igId)}.html">${escapeHtml(igIndex.get(igId)?.displayName ?? igId)}</a> (${count})</li>`
      )
      .join('');
    return `<tr>
      <td><code>${escapeHtml(system)}</code></td>
      <td>${usages.length}</td>
      <td><ul class="ig-usages">${igCells}</ul></td>
    </tr>`;
  });

  const igListItems = igList
    .map((ig) => `<li><a href="ig/${escapeHtml(ig.id)}.html">${escapeHtml(ig.displayName)}</a></li>`)
    .join('');

  const body = `
  <h2>IG couverts</h2>
  <ul>
    ${igListItems}
  </ul>

  <h2>Vue d'ensemble</h2>
  <p>Terminologies (CodeSystem) référencées par les bindings des profils des IG FHIR HL7 Europe, tous IG confondus.</p>
  <div class="table-scroll">
  <table class="summary-table">
    <thead>
      <tr>
        <th>Terminologie (CodeSystem)</th>
        <th>Nb d'IG l'utilisant</th>
        <th>Détail par IG (nb de bindings)</th>
      </tr>
    </thead>
    <tbody>
      ${rows.join('\n')}
    </tbody>
  </table>
  </div>
  `;

  return layout({ title: 'HL7 Europe — bindings & terminologies', activeHref: 'index', body, igList });
}

export const STYLE_CSS = `
:root {
  color-scheme: light dark;
  --border: #d0d7de;
  --muted: #6e7781;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  max-width: 1800px;
  margin: 0 auto;
  padding: 1.5rem;
  line-height: 1.5;
}
header h1 {
  font-size: 1.3rem;
  margin-bottom: 0.6rem;
}
header h1 a {
  text-decoration: none;
  color: inherit;
}
.site-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.8rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.9em;
}
.nav-home {
  white-space: nowrap;
}
.nav-ig-select select {
  margin-left: 0.4rem;
}
.table-scroll {
  overflow-x: auto;
  margin: 1rem 0 2rem;
}
table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}
th, td {
  border: 1px solid var(--border);
  padding: 0.4rem 0.6rem;
  text-align: left;
  vertical-align: top;
  overflow-wrap: anywhere;
}
th {
  background: rgba(0, 0, 0, 0.04);
}
/* Largeurs fixes par colonne : évite qu'une valeur longue (ValueSet, CodeSystem...)
   ne fasse exploser la largeur de la table et impose un défilement horizontal. */
.ig-table th:nth-child(1), .ig-table td:nth-child(1) { width: 14%; }
.ig-table th:nth-child(2), .ig-table td:nth-child(2) { width: 19%; }
.ig-table th:nth-child(3), .ig-table td:nth-child(3) { width: 9%; }
.ig-table th:nth-child(4), .ig-table td:nth-child(4) { width: 20%; }
.ig-table th:nth-child(5), .ig-table td:nth-child(5) { width: 38%; }
.summary-table th:nth-child(1), .summary-table td:nth-child(1) { width: 30%; }
.summary-table th:nth-child(2), .summary-table td:nth-child(2) { width: 10%; }
.summary-table th:nth-child(3), .summary-table td:nth-child(3) { width: 60%; }
code {
  font-size: 0.85em;
}
.muted {
  color: var(--muted);
  font-style: italic;
}
.code-systems, .ig-usages {
  margin: 0;
  padding-left: 1.1rem;
}
.badge {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8em;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}
.badge-required { background: #b3221f; }
.badge-extensible { background: #a15c00; }
.badge-preferred { background: #1a7f37; }
.badge-example { background: #33459e; }
`;
