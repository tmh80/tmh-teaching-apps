// Builds Adapt Lab from src/ into single self-contained files. Run: node adapt-lab/build.js
//   dist/Adapt-Lab-Rebuild-offline.html  the clean file (no internet requests)
//   dist/test.html                        the same page plus the test hook window.__adapt
// Every src/js/*.js is syntax-checked on its own first, so an error names the right file.
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const D = __dirname, S = p => fs.readFileSync(path.join(D, 'src', p), 'utf8');
const files = fs.readdirSync(path.join(D, 'src', 'js')).filter(f => f.endsWith('.js')).sort();
for (const f of files) {
  try { execFileSync(process.execPath, ['--check', path.join(D, 'src', 'js', f)], { stdio: 'pipe' }); }
  catch (e) { console.error(String(e.stderr)); process.exit(1); }
}
const js = files.map(f => `/* ---- ${f} ---- */\n` + S('js/' + f)).join('\n');
if (/<\/script/i.test(js)) { console.error('A source file contains </script, which would end the page script early.'); process.exit(1); }
const css = ['tokens.css', 'app.css'].map(S).join('\n');
const page = test => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Adapt Lab</title>
<style>
${css}
</style>
</head>
<body>
${S('index.html')}
<script>
${test ? 'window.__ADAPT_TEST=true;\n' : ''}${js}
</script>
</body>
</html>
`;
fs.mkdirSync(path.join(D, 'dist'), { recursive: true });
fs.writeFileSync(path.join(D, 'dist', 'Adapt-Lab-Rebuild-offline.html'), page(false));
fs.writeFileSync(path.join(D, 'dist', 'test.html'), page(true));
console.log(`built dist/Adapt-Lab-Rebuild-offline.html (${Math.round(page(false).length / 1024)} KB, ${files.length} modules) and dist/test.html`);
