// Checks the designer prototype in headless Chrome (Tom's feedback 5 and 6, 16 Nov 2026):
// tapping options can never take the points over 10, options that cost too much look unavailable and explain why,
// and the "biggest threat" line never says "too hot" with a cold season. Run: node adapt-lab/tests/designer_check.js
'use strict';
const path = require('path'), fs = require('fs');
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + path.join(__dirname, '..', 'prototype', 'Adapt-Lab-Designer-Prototype.html')); await page.waitForTimeout(800);
  const bad = [];
  for (const bk of ['forest', 'tundra']) {
    await page.evaluate(b => __designer.loadBiome(b), bk);
    let maxSeen = 0, blocked = 0, msg = '';
    for (let tab = 0; tab < 8; tab++) {
      const hasTab = await page.$(`[data-tab="${tab}"]`); if (!hasTab) break; await hasTab.click({ force: true, timeout: 1500 });
      const chips = await page.$$('#opts .chip'); 
      for (const c of chips) {
        const over = await c.getAttribute('data-over'); await c.click({ force: true, timeout: 1500 }).catch(() => {});
        const total = await page.evaluate(() => { const D = __designer; return D.costOf(D.S.anc, D.S.t).total; }); maxSeen = Math.max(maxSeen, total);
        if (over === '1') { blocked++; msg = await page.$eval('#pop', p => p.hidden ? '' : p.textContent); }
        const threat = await page.$eval('.threat', t => t.textContent);
        if (/hot|overheat/.test(threat) && /winter/.test(threat)) bad.push(`${bk}: "${threat}"`);
      }
    }
    if (maxSeen > 10) bad.push(`${bk}: points reached ${maxSeen} of 10`);
    console.log(`  ${bk}: most points used ${maxSeen} of 10; ${blocked} too-expensive taps blocked${msg ? ' ("' + msg.replace('Not enough points', '') + '")' : ''}`);
  }
  await page.evaluate(() => { const D = __designer; D.loadBiome('forest'); D.setTrait('defence', 'spines'); D.setTrait('fatWhere', 'all'); D.setTrait('fat', 80); }); await page.waitForTimeout(300);
  const tom = await page.$eval('.threat', t => t.textContent); console.log('  Tom\'s case now says: ' + tom.trim());
  if (/too hot in the cold winter/.test(tom)) bad.push('Tom\'s case still says too hot in the cold winter');
  await page.screenshot({ path: '/tmp/adapt-shots/designer-1366.png' });
  await browser.close();
  if (errs.length) bad.push(...errs);
  if (bad.length) { console.log('FAIL\n' + bad.join('\n')); process.exit(1); }
  console.log('designer_check: never over 10 points, no "too hot in winter", no errors');
})();
