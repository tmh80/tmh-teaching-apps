/* Review mode and paragraph tasks. Run: node sparks-through-time/retrieval/tests/test-review.js
   Builds a test copy first, then drives it with Playwright. */
const {chromium} = require('playwright'), {execFileSync} = require('child_process'), path = require('path'), os = require('os');
const OUT = process.env.RV_OUT || path.join(os.tmpdir(), 'rv-test.html');
execFileSync('node', [path.join(__dirname, '..', 'build-retrieval.js'), '--out', OUT], {stdio: 'pipe'});
let fails = 0, passes = 0;
const ok = (c, m) => { if (c){ passes++; } else { fails++; console.log('FAIL: ' + m); } };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({viewport: {width: 1000, height: 900}});
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('seeded')){ sessionStorage.setItem('seeded', '1'); localStorage.setItem('sparks-through-time-v1', JSON.stringify({studentName: 'Check', studentClass: '6X'})); } });
  const page = await ctx.newPage(), errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + OUT); await page.waitForSelector('#rtHome');

  /* ---------- pure checks inside the page ---------- */
  const pure = await page.evaluate(() => {
    const res = {};
    /* models match the data, 50 seeds, every template, both prompts and both hypotheses */
    const bad = [], nums = s => (s.match(/\d[\d,]*(?:\.\d+)?/g) || []).map(x => x.replace(/,/g, ''));
    const num = s => parseFloat(String(s).replace(/,/g, ''));
    const claim = (n, d) => {
      const rows = d.rows.map(r => r.slice(n === 'C1' ? 0 : 1).map(num));
      const inc = a => a.every((v, i) => !i || v > a[i - 1]), dec = a => a.every((v, i) => !i || v < a[i - 1]);
      if (n === 'C2' || n === 'C3' || n === 'C6') return inc(rows[0]);
      if (n === 'C5' || n === 'C7') return dec(rows[0]);
      if (n === 'C4') return rows[0][0] > rows[0][1] && rows[0][1] > Math.max(rows[0][2], rows[0][3], rows[0][4]);
      if (n === 'C8') return rows[0].every((v, i) => rows[1][i] > v);
      if (n === 'C10') return rows[1][2] > rows[0][2] && rows[1][4] < rows[0][4];
      if (n === 'C9'){ const names = d.head.slice(1), v = rows[0], f = names.map((x, i) => /Coal|Gas/.test(x) ? v[i] : 0); return Math.max(...v) === Math.max(...f) && names.some(x => /Solar|Hydro|Wind|Tidal|Geothermal/.test(x)); }
      if (n === 'C1'){ const r = rows[0]; return r[3] >= 1 && r[3] <= 3 && r[0] === r[1] + r[2] + r[3]; }
      return true;
    };
    for (const c of RT_C) for (let s = 0; s < 50; s++) for (const pr of ['p1', 'p2']){
      const t = rtParagraphTask('C', c.stops, rtRng('m' + c.n + s + pr), {n: c.n, prompt: pr});
      const allowed = new Set([].concat(t.data.head, ...t.data.rows, t.data.note || '', (t.extra || []).map(String)).flatMap(x => nums(String(x))));
      const stray = nums(t.model).filter(x => !allowed.has(x));
      if (stray.length) bad.push(c.n + ' numbers ' + stray.join('/') + ' | ' + t.model);
      if (!claim(c.n, t.data)) bad.push(c.n + ' claim false ' + JSON.stringify(t.data.rows));
      if (t.ticks.length !== 4 || t.ticks[2] !== c.sci) bad.push(c.n + ' ticks');
      if (pr === 'p2' && t.hyp === 'S' && !t.model.startsWith('The data support this hypothesis.')) bad.push(c.n + ' S opener');
      if (pr === 'p2' && t.hyp === 'X' && !t.model.startsWith('The data contradict this hypothesis.')) bad.push(c.n + ' X opener');
      if (/graph|chart/i.test(c.show) && !t.graph) bad.push(c.n + ' graph missing');
    }
    res.bad = bad.slice(0, 5); res.badN = bad.length;
    /* pin */
    res.pinBad = [];
    for (const c of RT_C){
      const a = rtParagraphTask('C', null, rtRng(1), {pin: {n: c.n, promptLabel: 'p1'}}), b = rtParagraphTask('C', null, rtRng(1), {pin: {n: c.n, promptLabel: 'p2'}});
      if (JSON.stringify(a.data) !== JSON.stringify(c.sample) || a.prompt !== c.p1 || a.model !== c.m1 || b.prompt !== c.p2 || b.model !== c.m2) res.pinBad.push(c.n);
    }
    for (const d of RT_D){
      const a = rtParagraphTask('D', null, rtRng(1), {pin: {n: d.n, promptLabel: 'E'}}), b = rtParagraphTask('D', null, rtRng(1), {pin: {n: d.n, promptLabel: 'B'}});
      if (a.prompt !== d.pE || a.model !== d.mE || b.prompt !== d.pB || b.model !== d.mB) res.pinBad.push(d.n);
    }
    res.titles = [rtParagraphTask('C', null, rtRng(2), {}).title, rtParagraphTask('D', null, rtRng(2), {}).title];
    res.none = rtParagraphTask('D', ['nonexistent'], rtRng(1), {});
    /* all topics: distinct topics, kinds alternate, no repeated families */
    const all = STOPS.map(s => s.id); let lastFams = [], lastKind = undefined, kinds = [], dupTopic = 0, famRep = 0, shape = 0;
    for (let i = 0; i < 40; i++){
      const it = rtBuildReview(all, rtRng('all' + i), {lastFams, lastKind});
      if (it.length !== 6) shape++;
      if (new Set(it.map(x => x.topic)).size !== 6) dupTopic++;
      const fams = it.map(x => x.fam).filter(f => /^F\d/.test(f || ''));
      if (fams.some(f => lastFams.includes(f))) famRep++;
      lastFams = fams; lastKind = it[5].kind; kinds.push(lastKind);
    }
    res.dupTopic = dupTopic; res.famRep = famRep; res.shape = shape; res.alt = kinds.every((k, i) => !i || k !== kinds[i - 1]);
    /* one topic and calc fallback */
    const one = rtBuildReview(['launch'], rtRng('one'), {lastFams: []});
    res.oneOk = one.length === 6 && one.every(x => x && x.topic === 'launch') && one[3].slot === 'Apply';
    res.slots = rtBuildReview(all, rtRng('s'), {}).map(x => x.slot).join();
    return res;
  });
  ok(pure.badN === 0, 'C models/claims: ' + pure.badN + ' problems, e.g. ' + JSON.stringify(pure.bad));
  ok(!pure.pinBad.length, 'pin returns the sample: ' + pure.pinBad);
  ok(pure.titles[0] === 'Data paragraph' && pure.titles[1] === 'Reading paragraph', 'student names');
  ok(pure.none === null, 'null when no template fits');
  ok(pure.shape === 0 && pure.dupTopic === 0, 'six items, no topic twice with all ticked');
  ok(pure.famRep === 0, 'no family repeats from the previous review');
  ok(pure.alt, 'C and D alternate across reviews');
  ok(pure.oneOk, 'one topic works, Apply replaces Calculate');
  ok(/Word,Recall,Apply,Calculate,Predict,Paragraph/.test(pure.slots), 'slot order: ' + pure.slots);

  /* ---------- UI: one topic ---------- */
  const answer = async q => {
    if (await q.locator('textarea').count()){
      await q.locator('textarea').fill('The data show that something happens because of the science idea here.');
      await q.locator('button', {hasText: 'Check'}).click(); return;
    }
    if (await q.locator('.opt').count()){ await q.locator('.opt').first().click(); const b = q.locator('button', {hasText: /^Check$/}); if (await b.count() && await b.isEnabled()) await b.click(); return; }
    if (await q.locator('.rv-num-in').count()){ await q.locator('.rv-num-in').fill('1'); await q.locator('button', {hasText: 'Check'}).click(); return; }
    if (await q.locator('.rv-blank').count()){ const n = await q.locator('.rv-blank').count(); for (let i = 0; i < n; i++) await q.locator('.rv-blank').nth(i).fill('x'); await q.locator('button', {hasText: 'Check'}).click(); return; }
    const b = q.locator('button', {hasText: 'Check'}); await b.click(); if (await b.isEnabled()) await b.click();
  };
  const runThrough = async () => {
    for (let i = 1; i <= 6; i++){
      const q = page.locator(`.rt-q[data-q="${i}"]`); await q.scrollIntoViewIfNeeded(); if (await q.locator('.rv-card.done').count()) continue; await answer(q);
      await page.waitForFunction(i2 => { const e = document.querySelector(`.rt-q[data-q="${i2}"] .rv-card`); return e && e.classList.contains('done'); }, i, {timeout: 4000}).catch(() => {});
    }
  };
  await page.evaluate(() => { Store.data.p = {}; renderRtReview(); });
  const boxes = page.locator('.rt-topic input');
  const nbox = await boxes.count();
  ok(nbox === 12, 'pick screen lists 12 topics');
  ok(/approx\. 12 minutes/.test(await page.locator('#app, main, body').first().innerText()), 'approx. 12 minutes shown');
  for (let i = 0; i < nbox; i++) if (await boxes.nth(i).isChecked()) await boxes.nth(i).uncheck();
  await boxes.nth(1).check();
  ok(/Tick a few more/.test(await page.locator('.rt-rv').innerText()), 'gentle nudge with one topic');
  await page.click('#rtRvStart');
  ok(await page.locator('.rt-q').count() === 6, 'six questions (one topic)');
  /* one go locks: first card */
  const first = page.locator('.rt-q[data-q="1"]');
  await answer(first);
  ok(await first.locator('.rv-card.locked').count() === 1, 'one go locks question 1');
  const sizeBefore = await first.locator('.rv-pill').innerText();
  const o2 = first.locator('.opt, .rv-blank'); if (await o2.count()) await o2.last().click({force: true, timeout: 1000}).catch(() => {});
  ok(sizeBefore === await first.locator('.rv-pill').innerText(), 'second go does nothing');
  await runThrough();
  ok(/Points so far: \d+ out of \d+/.test(await page.locator('#rtRvPts').innerText()), 'points so far shown');
  /* paragraph ticks score */
  const pc = page.locator('.rt-q[data-q="6"]');
  const boxesP = pc.locator('.rt-ticks input'); ok(await boxesP.count() === 4, 'four ticks after Check');
  ok(await pc.locator('.rt-model').count() === 1, 'model shown after Check');
  await boxesP.nth(0).check(); await boxesP.nth(1).check(); await boxesP.nth(3).check();
  ok(/3 of 4 points/.test(await pc.locator('.rv-pill').innerText()), 'ticks count as points');
  ok(await pc.locator('textarea').isDisabled(), 'paragraph box locked after Check');
  await page.click('#rtRvFinish');
  const end = await page.locator('.rt-rv').innerText();
  ok(/Review finished/.test(end) && /out of/.test(end) && /Topics to practise/.test(end), 'end screen');
  ok(await page.locator('#rtRvNew').count() === 1 && await page.locator('#rtRvPdf').count() === 1, 'New review and PDF buttons');
  const saved = await page.evaluate(() => ({r: Store.data.rt.reviews, p: Store.data.rt.practised, k: Store.data.rt.lastKind, f: Store.data.rt.lastFams}));
  ok(saved.r === 1 && Object.keys(saved.p).length === 1 && /^[CD]$/.test(saved.k), 'rt saved: ' + JSON.stringify(saved));
  /* PDF view */
  await page.click('#rtRvPdf');
  await page.waitForSelector('#ws-root .ws-q');
  const pdfTxt = await page.locator('#ws-root').innerText(), pdfAll = await page.locator('#ws-root').textContent();
  ok(/Model answer/.test(pdfTxt) && /My answer/.test(pdfTxt) && /Right answer/.test(pdfTxt), 'PDF view has answers and model');
  ok(await page.locator('#ws-root .ws-holder > .ws > .ws-q').count() === 6, 'PDF view has six questions');
  ok(!/MYP/i.test(pdfAll), 'no MYP in PDF view');
  ok(/Check/.test(pdfTxt) && /6X/.test(pdfTxt), 'name and class on the sheet');
  ok(/No name, no worksheet!/.test(pdfAll), 'name gate present');
  const fname = await page.evaluate(() => cleanFileName(`Review - ${rtRvToday()} - ${Store.data.studentName}`));
  ok(/^Review - \d{4}-\d{2}-\d{2} - Check$/.test(fname), 'file name ' + fname);
  await page.evaluate(() => document.querySelector('#ws-root').remove());

  /* ---------- UI: all topics, a second review follows the first ---------- */
  await page.evaluate(() => renderRtReview());
  await page.getByText('Tick all').click(); await page.click('#rtRvStart');
  const tops = await page.locator('.rt-slot').allInnerTexts();
  ok(new Set(tops.map(t => t.split('·')[2])).size === 6, 'all topics: six different topics on screen');
  await runThrough(); await page.click('#rtRvFinish');
  ok(await page.evaluate(() => Store.data.rt.reviews) === 2, 'second review counted');

  /* ---------- phone width ---------- */
  await page.setViewportSize({width: 390, height: 800});
  const noSide = async label => ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'sideways scroll at 390 px: ' + label);
  await noSide('end screen');
  await page.evaluate(() => renderRtReview()); await noSide('pick screen');
  await page.getByText('Tick all').click(); await page.click('#rtRvStart'); await noSide('review');
  const wide = [];
  for (const n of ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'D1', 'D6']){
    const w = await page.evaluate(n2 => {
      const root = app(); root.innerHTML = '';
      const t = rtParagraphTask(n2[0], null, rtRng(n2), {n: n2, prompt: n2[0] === 'C' ? 'p1' : 'E'});
      rtParagraphCard(root, t, 1, null, () => {});
      const g = root.querySelector('svg.rt-g'); const exp = /graph|chart/i.test((RT_C.find(c => c.n === n2) || {show: ''}).show);
      return [document.documentElement.scrollWidth <= document.documentElement.clientWidth, !exp || !!g];
    }, n);
    if (!w[0]) wide.push(n + ' scroll'); if (!w[1]) wide.push(n + ' graph');
  }
  ok(!wide.length, 'paragraph cards at 390 px: ' + wide);
  /* graph in dark theme: axis text is not the page background colour */
  await page.setViewportSize({width: 1000, height: 900});
  const dark = await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const root = app(); root.innerHTML = ''; rtParagraphCard(root, rtParagraphTask('C', null, rtRng(3), {n: 'C8', prompt: 'p1'}), 1, null, () => {});
    const t = root.querySelector('svg.rt-g text'), bg = getComputedStyle(document.body).backgroundColor, fill = getComputedStyle(t).fill;
    document.documentElement.removeAttribute('data-theme'); return fill !== bg;
  });
  ok(dark, 'graph text readable in dark theme');

  ok(!errs.length, 'page errors: ' + errs.slice(0, 3).join(' | '));
  await browser.close();
  console.log(`${passes} passed, ${fails} failed`); process.exit(fails ? 1 : 0);
})();
