// Screenshots the art galleries for the "look before you ship" check (plan 4.4), then VIEW the images.
// Run: node prototype/build.js && node tests/art_shots.js [outDir]   (default /tmp/adapt-art)
// Writes gallery and predator gallery at 1100 px and 390 px wide. Exits with an error on any page error.
'use strict';
const path = require('path'), fs = require('fs');
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const out = process.argv[2] || '/tmp/adapt-art'; fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errs = [];
  for (const w of [1100, 390]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + path.join(__dirname, '..', 'prototype', 'Adapt-Lab-Art-Prototype.html')); await p.waitForTimeout(1500);
    for (const id of ['gal', 'predgal']) { const el = await p.$('#' + id); if (el) await el.screenshot({ path: `${out}/${id}-${w}.png` }); }
    const sw = await p.evaluate(() => document.documentElement.scrollWidth); if (sw > w) errs.push(`page is ${sw}px wide at ${w}px`);
  }
  await b.close();
  if (errs.length) { console.log('FAIL\n' + errs.join('\n')); process.exit(1); }
  console.log('art_shots: saved to ' + out + '. Now look at them.');
})();
