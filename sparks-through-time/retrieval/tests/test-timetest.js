/* Playwright test for 40-timetest.js and 45-classsets.js, on a built copy.
   node sparks-through-time/retrieval/tests/test-timetest.js [out.html] */
const {chromium} = require('playwright'), path = require('path'), {execFileSync} = require('child_process');
const OUT = process.argv[2] || '/tmp/claude-0/-home-claude/68b65913-3589-50c7-9c95-4c47d29b1ff9/scratchpad/tt-test.html';
execFileSync('node', [path.join(__dirname, '..', 'build-retrieval.js'), '--out', OUT], {stdio: 'pipe'});
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('FAIL:', m); } };

(async () => {
  const browser = await chromium.launch(), errors = [];
  const ctx = await browser.newContext({viewport: {width: 390, height: 800}}), page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  await page.addInitScript(() => { if (!localStorage.getItem('sparks-through-time-v1')) localStorage.setItem('sparks-through-time-v1', '{"studentName":"Check","studentClass":"6X"}'); });
  await page.goto('file://' + OUT);
  const noScroll = async m => ok(await page.evaluate(() => document.documentElement.scrollWidth <= 390 && document.body.scrollWidth <= 390), 'sideways scroll: ' + m);

  /* 1. twenty seeds */
  const seeds = await page.evaluate(() => {
    const out = [];
    for (let i = 0; i < 20; i++){
      const t = rtBuildTimeTest('SEED' + (10 + i), {challenge: null}), fams = t.items.filter(x => x.t !== 'para').map(x => x.fam);
      out.push({n: t.items.length, marks: t.items.reduce((s, x) => s + x.marks, 0), total: t.marks, dup: fams.length - new Set(fams).size,
        calc: t.items.filter(x => x.slot === 'Calculate').length, pool: t.items.filter(x => x.pool).length, parts: [0, 1, 2, 3].map(p => t.items.filter(x => x.part === p).length).join(),
        paras: t.items.filter(x => x.t === 'para').map(x => x.kind).join(), diffTopic: t.items[24].topic !== t.items[25].topic, label: t.items.some(x => /^[A-Z][a-z]+ [a-z]+: /.test(String(x.q).slice(0, 30)) && x.pool)});
    }
    return out;
  });
  seeds.forEach((s, i) => {
    ok(s.n === 26 && s.marks === 56 && s.total === 56, 'seed ' + i + ' size ' + JSON.stringify(s));
    ok(s.dup === 0, 'seed ' + i + ' family twice'); ok(s.calc === 7 || s.calc === 8, 'seed ' + i + ' calc ' + s.calc);
    ok(s.pool <= 6, 'seed ' + i + ' pool'); ok(s.parts === '8,8,8,2' && s.paras === 'C,D' && s.diffTopic, 'seed ' + i + ' parts/paragraphs'); ok(!s.label, 'seed ' + i + ' mission label');
  });
  const chal = await page.evaluate(() => { const c = {}; STOPS.forEach(s => { c[s.id] = true; }); let bad = 0; for (let i = 0; i < 8; i++){ const t = rtBuildTimeTest('CH' + i, {challenge: c}); if (t.items.length !== 26) bad++; } return bad; });
  ok(chal === 0, 'challenge builds');

  /* 2. run, stop after Part A, reload, carry on, finish (reviewCard and paragraph cards are stubbed so answers are quick) */
  const stub = () => page.evaluate(() => {
    window.reviewCard = (el, it, n, saved, onSave) => { const b = document.createElement('button'); b.className = 'stub'; b.textContent = 'answer ' + n; b.onclick = () => { b.disabled = true; onSave({done: true, pts: window.__pts && window.__pts(it) != null ? window.__pts(it) : 1, max: 1, resp: {}}); }; if (saved && saved.done) b.disabled = true; el.append(b); };
    window.rtParagraphCard = (el, task, n, saved, onSave) => { const b = document.createElement('button'); b.className = 'stub'; b.textContent = 'answer ' + n; b.onclick = () => { b.disabled = true; onSave({done: true, pts: 2, max: 4, ticks: [true, true, false, false], text: 'x'}); }; el.append(b); };
  });
  await page.evaluate(() => { Store.data.rt = {reviews: 3}; Store.save(); renderRtTimeTest(); });
  const start = await page.innerText('body');
  ok(/approx\. 45 minutes/.test(start) && /56 marks/.test(start), 'start screen text'); ok(/Ready when you are/.test(start), 'ready after 3 reviews');
  await noScroll('start');
  await page.evaluate(() => { Store.data.rt.reviews = 1; renderRtTimeTest(); });
  ok(!/Ready when you are/.test(await page.innerText('body')), 'not ready before 3 reviews');
  await stub(); await page.click('#rtTtStart');
  ok(await page.locator('.rt-q').count() === 8, 'part A has 8 questions'); await noScroll('part A');
  ok(await page.locator('#rtTtNext').count() === 0, 'no next until part done');
  const btns = page.locator('button.stub'); for (let i = 0; i < 8; i++) await btns.nth(i).click();
  ok(await page.locator('#rtTtStop').count() === 1 && await page.locator('#rtTtNext').count() === 1, 'stop and next appear');
  await page.click('#rtTtStop');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sparks-through-time-v1')).rt.tt);
  ok(saved && saved.part === 1 && Object.keys(saved.answers).length === 8 && saved.seed, 'saved test: seed, answers, part');
  await page.evaluate(() => { Store.data = {}; Store.load(); renderRtTimeTest(); });
  ok(await page.locator('#rtTtCarry').count() === 1 && /Part B/.test(await page.textContent('#rtTtCarry')), 'carry on offered for Part B');
  await stub(); await page.click('#rtTtCarry');
  ok(/Part B/.test(await page.textContent('h2')), 'resumes at Part B');
  /* answer: part B wrong for 'electromagnets' items (pts 0) */
  await page.evaluate(() => { window.__pts = it => it.topic === 'electromagnets' ? 0 : 1; });
  for (let p = 1; p <= 3; p++){
    const b = page.locator('button.stub'); const c = await b.count(); for (let i = 0; i < c; i++) await b.nth(i).click();
    await page.click(p < 3 ? '#rtTtNext' : '#rtTtFinish');
  }
  ok(/\/ 56/.test(await page.textContent('#rtTtScore')), 'score out of 56: ' + await page.textContent('#rtTtScore'));
  ok(await page.locator('.rt-tt-bar').count() === 12, '12 topic bars');
  const bars = await page.evaluate(() => [...document.querySelectorAll('.rt-tt-bar')].map(b => [b.dataset.topic, b.textContent]));
  ok(bars.find(b => b[0] === 'electromagnets')[1].includes('Practise this') && bars.find(b => b[0] === 'atom')[1].includes('Secure'), 'bar labels');
  ok(await page.locator('[data-practise]').count() === 1, 'one Practise this button'); await noScroll('results');
  ok(await page.evaluate(() => rtTimeTestBest()) > 0 && await page.evaluate(() => Store.data.rt.ttBest === rtTimeTestBest() && Store.data.rt.tt === null), 'ttBest saved, test cleared');
  await page.click('[data-practise="electromagnets"]'); ok(await page.locator('.rt-fc').count() > 0, 'Practise this opens flashcards');
  await page.evaluate(() => renderRtTimeTest());

  /* 3. print HTML */
  await page.evaluate(() => { Store.data.teacherOK = false; });
  await page.evaluate(() => rtPrintTimeTest('ABC234', 'key'));
  ok(await page.locator('.rt-ask').count() === 1 && await page.locator('#ws-root').count() === 0, 'key is behind the teacher code');
  await page.evaluate(() => document.querySelector('.rt-ask').remove());
  await page.evaluate(() => rtPrintTimeTest('ABC234', 'student'));
  const stu = await page.evaluate(() => { const r = document.getElementById('ws-root'); return {html: r.outerHTML, q: [...r.querySelectorAll('.ws-q')].length, texts: [...r.querySelectorAll('.ws-qtext')].map(x => x.textContent)}; });
  await page.evaluate(() => { document.getElementById('ws-root').remove(); document.body.classList.remove('printing'); Store.data.teacherOK = true; });
  await page.evaluate(() => rtPrintTimeTest('ABC234', 'key'));
  const key = await page.evaluate(() => { const r = document.getElementById('ws-root'); return {html: r.outerHTML, q: [...r.querySelectorAll('.ws-q')].length, texts: [...r.querySelectorAll('.ws-qtext')].map(x => x.textContent)}; });
  ok(stu.q === 26 && key.q === 26, 'paper has 26 questions'); ok(!/MYP/i.test(stu.html) && !/MYP/i.test(key.html), 'no MYP in print HTML');
  ok(/Data sheet/.test(stu.html) && /approx\. 45 minutes/.test(stu.html) && /calculator/.test(stu.html) && /code ABC234/.test(stu.html), 'paper header, data sheet and code');
  ok(!/Model answer/.test(stu.html) && /Model answer/.test(key.html) && /Ticks \(4\)/.test(key.html), 'model answers only on the key');
  ok(JSON.stringify(stu.texts) === JSON.stringify(key.texts), 'student paper and key match');
  ok(!/Words to use|word bank/i.test(stu.html), 'no word bank or checklist on the student paper');
  await page.evaluate(() => { document.getElementById('ws-root').remove(); document.body.classList.remove('printing'); document.getElementById('rtPageCss') && document.getElementById('rtPageCss').remove(); Store.data.teacherOK = false; });

  /* 4. class sets (reload to drop the stubs) */
  await page.reload();
  for (let i = 1; i <= 12; i++){
    const code = 'S' + String(i).padStart(2, '0');
    const info = await page.evaluate(c => { const s = rtFindSet(c.toLowerCase()); return s && {n: s.qs.length, task: !!s.task, marks: s.marks, kind: s.task && s.task.kind, same: rtFindSet(c).qs[0].q === s.qs[0].q}; }, code);
    ok(info && info.n === 4 && info.task && info.marks === 11 && info.same, code + ' found in any case');
    await page.evaluate(c => renderRtClassSet(c, {view: 'student'}), code);
    ok(await page.locator('.rt-cs input[type=text]').count() === 4 && await page.locator('.rt-pg').count() === 1, code + ' student view');
    await noScroll(code + ' student');
    await page.click('[data-show="1"]'); ok(await page.locator('[data-mark="right"]').count() === 1, code + ' reveal then tick'); await page.click('[data-mark="right"]');
    ok(/Marks so far: 1 out of 11/.test(await page.textContent('#rtCsPts')), code + ' score counts');
    await page.evaluate(c => renderRtClassSet(c, {view: 'project'}), code);
    ok(await page.locator('#rtSq .rt-cell').count() === 4 && await page.locator('#rtSq .ans').count() === 0, code + ' projection screen 1, no answers');
    const box = await page.evaluate(() => { const r = document.getElementById('rtSq').getBoundingClientRect(); return [r.width, r.height, innerWidth, innerHeight]; });
    ok(Math.abs(box[0] - box[1]) < 1 && box[0] <= box[2] + 1 && box[1] <= box[3] + 1, code + ' square fits ' + box);
    ok(await page.evaluate(() => getComputedStyle(document.getElementById('rtSq')).width === '1080px'), code + ' 1080 square');
    await page.click('#rtProjAns'); ok(await page.locator('.rt-ask').count() === 1 && await page.locator('#rtSq .ans').count() === 0, code + ' answers locked');
    await page.evaluate(() => document.querySelector('.rt-ask').remove());
    await page.click('#rtProjNext'); ok(await page.locator('#rtSq .rt-q5').count() === 1, code + ' screen 2');
    await page.evaluate(() => { Store.data.teacherOK = true; }); await page.click('#rtProjAns');
    ok(await page.locator('#rtSq .rt-q5 .ans').count() === 2, code + ' screen 2 answers when unlocked');
    await page.click('#rtProjBack'); await page.click('#rtProjAns'); ok(await page.locator('#rtSq .rt-cell .ans').count() === 4, code + ' screen 1 answers');
    await page.evaluate(() => { document.getElementById('rtProj').remove(); Store.data.teacherOK = false; });
  }
  /* matching letters never sit on the right row */
  ok(await page.evaluate(() => { for (let i = 0; i < 40; i++){ const r = rtRng('m' + i), n = 4; const ans = ['a', 'b', 'c', 'd']; let order, t = 0; do { order = rtShuf(r, ans); t++; } while (t < 40 && ans.some((x, k) => order.indexOf(x) === k)); if (ans.some((x, k) => order.indexOf(x) === k)) return false; } return true; }), 'derangement pattern');

  /* 5. custom codes */
  const cu = await page.evaluate(() => {
    const code = rtCsMakeCode(['static', 'circuits', 'series']), a = rtFindSet(code), b = rtFindSet(code.toLowerCase());
    const bad = rtFindSet('12345'), any = rtFindSet('QQQQQQ');
    return {code, ok: !!a && a.custom && a.qs.length === 4 && !!a.task && a.topics.join() === 'static,circuits,series', same: JSON.stringify(a.qs.map(q => q.q)) === JSON.stringify(b.qs.map(q => q.q)), bad: bad === null, any: !!any && any.qs.length === 4, a1: a.qs.map(q => q.a).every(x => x !== undefined)};
  });
  ok(cu.ok && cu.same && cu.bad && cu.any && cu.a1, 'custom code ' + JSON.stringify(cu));
  await page.evaluate(c => renderRtClassSet(c, {view: 'student'}), cu.code); ok(await page.locator('.rt-cs input[type=text]').count() === 4, 'custom student view'); await noScroll('custom student');
  for (let i = 0; i < 25; i++){
    const r = await page.evaluate(i => { const c = rtCsMakeCode(['atom', 'static', 'ohm', 'power', 'future'].slice(0, 1 + i % 5)); const s = rtFindSet(c); return s && s.qs.length === 4 && !!s.task; }, i);
    ok(r, 'custom code build ' + i);
  }

  /* 6. slips and the teacher card */
  await page.evaluate(() => rtCsPrintSlips('S01'));
  const sl = await page.evaluate(() => ({pages: document.querySelectorAll('.rt-slippage').length, slips: document.querySelectorAll('.rt-slip').length, html: document.getElementById('ws-root').outerHTML}));
  ok(sl.pages === 2 && sl.slips === 4 && !/MYP/i.test(sl.html) && !/Answer:/.test(sl.html), 'A5 slips: front and back, no answers');
  await page.evaluate(() => { document.getElementById('ws-root').remove(); document.body.classList.remove('printing'); });
  await page.evaluate(() => renderTeacher());
  ok(await page.locator('#rtTeacher .rt-set').count() === 12 && await page.locator('#rtMakeCode').count() === 1 && await page.locator('#rtMakeTt').count() === 1, 'teacher card');
  await page.click('#rtMakeTt'); ok(await page.locator('[data-act="tt-key"]').count() === 1 && await page.locator('[data-act="tt-student"]').count() === 1, 'class Time Test buttons');
  await page.click('#rtMakeCode'); ok(await page.locator('.rt-newcode').count() === 1, 'custom code made');

  ok(errors.length === 0, 'page errors: ' + errors.join(' | '));
  console.log(`${passes} passed, ${fails} failed`);
  await browser.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('CRASH', e); process.exit(1); });
