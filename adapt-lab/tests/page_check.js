// Loads the built page in headless Chrome and checks it: no errors, no internet requests, every organism in
// every biome draws its bars, no sideways scrolling on a phone. Saves screenshots to /tmp/adapt-shots/.
// Run after `node adapt-lab/build.js`: node adapt-lab/tests/page_check.js
'use strict';
const path = require('path'), fs = require('fs');
const { chromium } = require(fs.existsSync('/opt/npm-tools/node_modules/playwright') ? '/opt/npm-tools/node_modules/playwright' : 'playwright');
(async () => {
  const out = '/tmp/adapt-shots'; fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined, args: ['--no-sandbox'] });
  const problems = [];
  for (const [file, w, h] of [['test.html', 1366, 768], ['Adapt-Lab-Rebuild-offline.html', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    page.on('console', m => { if (m.type() === 'error') problems.push(`${file}: console error ${m.text()}`); });
    page.on('pageerror', e => problems.push(`${file}: ${e.message}`));
    page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) problems.push(`${file}: internet request ${r.url()}`); });
    await page.goto('file://' + path.join(__dirname, '..', 'dist', file));
    if (file === 'test.html') {
      const n = await page.evaluate(() => { const A = window.__adapt; let n = 0;
        for (const id of Object.keys(A.M.PRESETS)) for (const bk of Object.keys(A.M.BIOMES)) { A.pick(id, bk); if (!document.querySelectorAll('.bar').length) throw new Error('no bars for ' + id + ' in ' + bk); n++; }
        A.pick('zebra', 'grassland'); return n; });
      console.log(`  ok  ${n} organism-and-biome pairs drew their bars`);
    }
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > w) problems.push(`${file}: page is ${sw}px wide at ${w}px (sideways scrolling)`);
    await page.screenshot({ path: path.join(out, `page-${w}.png`), fullPage: true });
    await page.close();
  }
  await browser.close();
  if (problems.length) { console.log(problems.join('\n')); process.exit(1); }
  console.log('page_check: no errors, no internet requests, no sideways scrolling. Screenshots in ' + out);
})();
