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

function layout({ title, activeHref, body }) {
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

export function renderIgPage(ig, profiles) {
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
  <table>
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
  `;

  return layout({ title: `${ig.displayName} — bindings HL7 Europe`, activeHref: ig.id, body });
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
  <h2>Vue d'ensemble</h2>
  <p>Terminologies (CodeSystem) référencées par les bindings des profils des IG FHIR HL7 Europe, tous IG confondus.</p>
  <table>
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

  <h2>IG couverts</h2>
  <ul>
    ${igListItems}
  </ul>
  `;

  return layout({ title: 'HL7 Europe — bindings & terminologies', activeHref: 'index', body });
}

export const STYLE_CSS = `
:root {
  color-scheme: light dark;
  --border: #d0d7de;
  --muted: #6e7781;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
  line-height: 1.5;
}
header h1 {
  font-size: 1.3rem;
}
header h1 a {
  text-decoration: none;
  color: inherit;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0 2rem;
}
th, td {
  border: 1px solid var(--border);
  padding: 0.4rem 0.6rem;
  text-align: left;
  vertical-align: top;
}
th {
  background: rgba(0, 0, 0, 0.04);
}
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
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8em;
  border: 1px solid var(--border);
}
.badge-required { background: #fde8e8; }
.badge-extensible { background: #fff4d6; }
.badge-preferred { background: #e6f4ea; }
.badge-example { background: #e8eefd; }
`;
