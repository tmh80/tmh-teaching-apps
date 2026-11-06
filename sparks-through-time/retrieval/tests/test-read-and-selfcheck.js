// The read-first OK button, I can cards and the self-check before the Foundation review.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../../Sparks-Through-Time.html');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({viewport: {width: 1000, height: 900}}); const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto(FILE); await pg.evaluate(() => localStorage.setItem('sparks-through-time-v1', JSON.stringify({studentName: 'Check', studentClass: '6X'}))); await pg.reload(); await pg.waitForTimeout(500);
  const data = await pg.evaluate(() => STOPS.map(s => [s.id, (ICAN[s.id] || []).length]));
  for (const [id, n] of data) ok(n >= 3 && n <= 4, id + ' has 3 or 4 I can statements: ' + n);
  await pg.evaluate(() => renderStop(STOPS.find(s => s.id === 'electromagnets'), 'learn')); await pg.waitForSelector('.ican-pop');
  ok(await pg.locator('.learn-card').count() === 0, 'step 1 waits behind the I can screen');
  ok(await pg.locator('.ican-pop li').count() === 4, 'I can statements open as a pop-up');
  ok(await pg.evaluate(() => document.querySelector('.ican-card:not(.ican-pop)').style.visibility) === 'hidden', 'its place stays empty until OK');
  { const box = await pg.locator('.ican-pop h3').boundingBox(); await pg.mouse.move(box.x + 20, box.y + 8); await pg.mouse.down(); await pg.mouse.move(box.x + 60, box.y + 48); await pg.mouse.up(); const moved = await pg.locator('.ican-pop h3').boundingBox(); ok(moved.x > box.x + 30, 'pop-up can be dragged'); }
  await pg.locator('.ican-ok').click(); await pg.waitForSelector('.ican-back', {state: 'detached'});
  ok(await pg.evaluate(() => { const c = document.querySelector('.ican-card'); return c.style.visibility === '' && !!c.offsetParent; }), 'OK moves them into place');
  ok(await pg.locator('.ican-card li').count() === 4 && await pg.locator('.learn-card').count() === 0, 'I can statements have their own first screen');
  await pg.locator('.ican-next').click(); await pg.waitForSelector('.learn-card');
  ok(await pg.locator('.ican-card').count() === 0, 'Next opens step 1 on its own');
  ok(await pg.locator('.learn-card .rg-blur').count() >= 3, 'rest of step blurred before OK');
  ok(await pg.evaluate(() => [...document.querySelectorAll('.learn-card .rg-blur')].every(x => x.inert)), 'blurred parts cannot be used');
  await pg.locator('.say-ok').click();
  ok(await pg.locator('.rg-blur').count() === 0 && await pg.locator('.say-ok').count() === 0, 'OK clears the blur');
  await pg.evaluate(() => renderStop(STOPS.find(s => s.id === 'electromagnets'), 'learn')); await pg.waitForSelector('.learn-card');
  ok(await pg.locator('.rg-blur').count() === 0, 'an OK is remembered');
  ok(await pg.locator('.ican-back').count() === 0, 'the pop-up shows once');
  await pg.locator('.learn-card .btn:has-text("Back")').click(); ok(await pg.locator('.ican-card').count() === 1 && await pg.locator('.ican-back').count() === 0, 'Back on step 1 returns to the I can screen'); await pg.locator('.ican-next').click();
  await pg.evaluate(() => { prog('electromagnets').learn = true; Store.save(); renderStop(STOPS.find(s => s.id === 'electromagnets'), 'review'); }); await pg.waitForSelector('.sa-card');
  ok(await pg.locator('.rv-card:visible').count() === 0, 'questions hidden until the self-check is done');
  const go = pg.locator('.sa-card button:has-text("Save and start")'); ok(await go.isDisabled(), 'start waits for every X');
  const tracks = pg.locator('.sa-track'); ok(await tracks.count() === 4, 'one line per statement');
  ok((await pg.locator('.sa-labels').first().innerText()).replace(/\s+/g, ' ').trim() === 'Beginning Developing Proficient Mastering', 'four levels in order');
  ok(!(await pg.locator('.sa-x').first().isVisible()), 'no X until the student places one');
  for (let i = 0; i < 4; i++){ const t = tracks.nth(i); await t.scrollIntoViewIfNeeded(); const box = await t.boundingBox(); await pg.mouse.click(box.x + box.width * (0.1 + i * 0.25), box.y + box.height / 2); }
  await tracks.nth(0).focus(); await pg.keyboard.press('ArrowRight');
  ok(await pg.locator('.sa-x').first().isVisible(), 'X appears');
  const v = await pg.evaluate(() => saStore('electromagnets').v); ok(v[0] === 15 && v[3] === 85, 'positions saved: ' + v);
  ok(await tracks.nth(3).getAttribute('aria-valuetext') === 'Mastering', 'level read out');
  await go.click();
  ok(await pg.locator('.rv-card:visible').count() === 6, 'questions appear after the self-check');
  ok(await pg.locator('.sa-done').count() === 1, 'self-check kept in a fold-out');
  await pg.evaluate(() => renderStop(STOPS.find(s => s.id === 'electromagnets'), 'review')); await pg.waitForSelector('.rv-card');
  ok(await pg.locator('.rv-card:visible').count() === 6 && await pg.locator('.sa-done .sa-x').count() === 4, 'saved self-check is not asked again');
  ok(errs.length === 0, 'no page errors ' + errs[0]);
  await b.close(); console.log(`test-read-and-selfcheck: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
