/* Reading and writing chapters (electromagnets, generators, acdc, power).
   Run: node sparks-through-time/retrieval/tests/test-chapters.js  (builds a test copy, drives it with Playwright) */
const {chromium} = require('playwright'), GH = require('./graph-helpers.js'), {execFileSync} = require('child_process'), path = require('path'), os = require('os');
const OUT = process.env.CH_OUT || path.join(os.tmpdir(), 'ch-test.html');
execFileSync('node', [path.join(__dirname, '..', 'build-retrieval.js'), '--out', OUT], {stdio: 'pipe'});
let fails = 0, passes = 0;
const ok = (c, m) => { if (c){ passes++; } else { fails++; console.log('FAIL: ' + m); } };
const IDS = ['electromagnets', 'generators', 'acdc', 'power'];
const NEW = {electromagnets: 3, generators: 3, acdc: 3, power: 2};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({viewport: {width: 1000, height: 1000}});
  const page = await ctx.newPage(), errs = [];
  await page.addInitScript(() => { new MutationObserver(() => { const b = document.querySelector('.ican-next') || document.querySelector('.say-ok'); if (b) b.click(); }).observe(document, {subtree: true, childList: true}); }); // the OK gate has its own test
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + OUT); await page.evaluate(() => localStorage.setItem('sparks-through-time-v1', JSON.stringify({studentName: 'Check', studentClass: '6X'}))); await page.waitForTimeout(1000); await page.reload(); await page.waitForTimeout(500);
  const open = (id, tab) => page.evaluate(([id, tab]) => { Store.data.rv = Store.data.rv || {}; if (tab !== 'learn') prog(id).learn = true; if (tab === 'review'){ Store.data.selfA = Store.data.selfA || {}; Store.data.selfA[id] = {v: [], done: true}; } renderStop(STOPS.find(s => s.id === id), tab); }, [id, tab]);
  const teacher = on => page.evaluate(on => { Store.data.teacherOK = on; }, on);

  /* ---------- data shape ---------- */
  const shape = await page.evaluate(([IDS]) => IDS.map(id => { const s = STOPS.find(x => x.id === id), it = s.review;
    return {id, n: it.length, arch: (s.reviewArchive || []).length, key: rvKey(s, 'f'), keys: (s.learnKeys || []).length, steps: s.learn.length, tagged: it.every(x => x.obj && x.obj.length), types: it.map(x => x.t).join(), strands: strandsLabel(sheetStrands(s, 'f')), noMyp: !/MYP|objective|criteri|strand/i.test(JSON.stringify(s.learn.map(l => [l.title, l.say])))}; }), [IDS]);
  shape.forEach(s => {
    const graphed = s.id !== 'acdc';
    ok(s.n === (graphed ? 7 : 6) && s.arch > 6, s.id + ' Check has ' + (graphed ? 7 : 6) + ' items and the old list is archived');
    ok(s.key === s.id + ({electromagnets: '~f4', generators: '~f4', power: '~f3'}[s.id] || '~f2'), s.id + ' new review key'); ok(s.keys === s.steps, s.id + ' learnKeys match steps');
    ok(s.tagged, s.id + ' items tagged'); ok(graphed ? /mark,graph,write$/.test(s.types) : /mark,write$/.test(s.types), s.id + ' ends ' + (graphed ? 'mark, graph, write' : 'mark, write')); ok(s.noMyp, s.id + ' no MYP words in Learn text');
  });
  ok(shape[0].steps === 7 && shape[1].steps === 8 && shape[2].steps === 7 && shape[3].steps === 5, 'step counts');
  ok(shape[0].strands === 'A i, ii, iii · C i, ii · D i' && shape[1].strands === 'A i, ii · C i, ii, iii · D i', 'strand labels C');

  /* ---------- old saves ---------- */
  await page.evaluate(() => {
    Store.data.rv = {electromagnets: {0: {done: true, ok: true, pts: 1, max: 1, resp: {k: 0}}, 1: {done: true}, 2: {done: true}, 3: {done: true}, 4: {done: true}, 5: {done: true}}};
    Store.data.lr = {generators: {mem: {4: {}}, done: {0: true, 1: true, 2: true, 3: 'x', 4: 'hamster done', 5: true}}, electromagnets: {mem: {}, done: {0: true, 1: true, 2: true, 3: true}}};
    Store.save();
  });
  await open('electromagnets', 'review');
  ok(await page.locator('.rv-card.done').count() === 0, 'old review answers do not land on the new questions');
  await open('generators', 'learn'); await page.waitForSelector('.learn-card');
  const dots = await page.evaluate(() => [...document.querySelectorAll('.steps-dots span')].map(s => s.classList.contains('done')));
  ok(dots.join() === 'true,true,true,false,false,false,true,true', 'old Learn answers stay on the right steps: ' + dots.join());
  await page.evaluate(() => { Store.data.rv = {}; Store.data.lr = {}; Store.save(); });

  /* ---------- Learn steps ---------- */
  await teacher(true);
  const goStep = async (id, idx) => { await open(id, 'learn'); await page.waitForSelector('.learn-card'); for (let k = 0; k < idx; k++){ await page.locator('.learn-card .btn.primary:has-text("Next step")').click(); } };
  const complete = async (m) => { await page.waitForSelector('.learn-card.step-done', {timeout: 4000}).then(() => ok(true, m), () => ok(false, m + ' (step did not complete)')); };
  const markAll = async (labelIdx) => { const sents = page.locator('.mk-sent'); for (let i = 0; i < labelIdx.length; i++) for (let k = 0; k <= labelIdx[i]; k++) await sents.nth(i).click(); };
  const gotIt = async (title) => { ok(await page.locator('.rw-teach').count() === 1 && await page.locator('.mk-sent, .rv-grid, .ask').count() === 0, title + ' teaches first, task hidden'); await page.locator('button:has-text("Got it")').click(); };
  const model = async () => { await page.locator('.rw-typed').last().fill('A sentence I wrote myself.'); await page.locator('button:has-text("Show me a model")').click(); };

  // 1A
  await goStep('electromagnets', 4);
  ok(await page.locator('.rw-strip .rw-w.on').innerText() === 'Read it', '1A strip lit Read it');
  await page.locator('.rw-part:has-text("an electromagnet")').click();
  await page.locator('.rw-part:has-text("the number of coils")').click(); await page.locator('.rw-part:has-text("how strong")').click();
  await page.locator('.rw-typed').first().fill('Coils may change the clips.');
  for (let k = 0; k < 5; k++){ const c = (k + 1) * 10; await page.locator('input[type=range]').first().fill(String(c)); await page.locator('.rt-in').nth(0).fill(String(c / 10 * 4)); await page.locator('.rt-row button:has-text("Check")').first().click(); }
  ok(await page.locator('.gm').count() === 0 && await page.locator('.rw-teach').count() === 1 && /How to make a good graph/.test(await page.locator('.rw-teach').innerText()), '1A teaches "How to make a good graph" once the table is full, graph still hidden');
  await page.locator('button:has-text("Got it")').click();
  for (const [k, w] of ['Bar graph', 'Scatter graph', 'Bar graph'].entries()){ await page.locator(`.ask button.opt:has-text("${w}"):not([disabled])`).first().click(); if (k < 2) await page.locator('.ask button:has-text("Next question")').click(); }
  await GH.makeGraph(page, page.locator('.gm'), {type: 'scatter', title: 'Coils of wire vs Paperclips held', xl: 'Coils of wire', yl: 'Paperclips held (clips)', y: [0, 25, 5], x: [0, 60, 10], rows: [[10, 4], [20, 8], [30, 12], [40, 16], [50, 20]]});
  await complete('1A Run your fair test');
  // 1B
  await goStep('electromagnets', 5);
  await page.locator('tr.rw-row').nth(0).click(); await page.locator('tr.rw-row').nth(4).click();
  await page.locator('.ask .opt:has-text("With 10 coils it picked up 4 clips")').click(); await complete('1B Mark your evidence');
  // 1C
  await goStep('electromagnets', 6);
  await gotIt('1C');
  ok(/CER/.test(await page.locator('.rw-teach').innerText()) && /Dark shirts/.test(await page.locator('.rw-teach').innerText()), '1C names CER and gives an example');
  ok((await page.locator('.mk-lab').allInnerTexts()).join() === 'Claim,Evidence,Reasoning', '1C uses the real labels from the start');
  { const s0 = page.locator('.mk-sent').nth(0), tag = page.locator('.mk-tag').nth(0), seen = [await tag.innerText()]; for (let k = 0; k < 4; k++){ await s0.click(); seen.push(await tag.innerText()); } ok(seen.join() === 'No label,Claim,Evidence,Reasoning,No label', 'tap cycles through every label: ' + seen.join()); }
  await markAll([0, 1, 2]); await page.locator('.mk-check').click();
  ok(await page.locator('.rw-side .rw-graph').count() === 1 && /number of coils/.test(await page.locator('.learn-card, body').first().innerText()), '1C graph and question beside the box');
  ok(!/My evidence/.test(await page.locator('body').innerText()), '1C no My evidence label on the model'); ok(await page.locator('.rw-strip .rw-w.on').innerText() === 'Write it', '1C strip moves to Write it');
  await page.locator('.rw-typed').fill('My results show that more coils make a stronger electromagnet.'); await page.locator('button:has-text("Show me a model")').click(); await complete('1C Take apart');
  // 2A
  await goStep('generators', 3);
  await page.locator('.ask .opt:has-text("The highest voltage the wave reaches")').click(); await page.locator('.ask .row button:has-text("Next question")').click();
  await page.locator('.ask .opt:has-text("The loops of wire in the coil")').click();
  for (let k = 0; k < 5; k++){ await page.locator('input[type=range]').first().fill(String((k + 1) * 100)); await page.locator('.rt-in').nth(0).fill((1.2 * (k + 1)).toFixed(1)); await page.locator('.rt-row button:has-text("Plot")').first().click(); }
  ok(await page.locator('.rw-graph .rw-pt').count() === 5, '2A five points plotted'); await complete('2A Crack a tricky word');
  // 2B
  await goStep('generators', 4);
  await page.locator('.rw-typed').fill('Peak voltage goes up with more turns.');
  await page.locator('.rw-graph g[data-i="0"]').click(); await page.locator('.rw-graph g[data-i="2"]').click();
  ok(await page.locator('.feedback.hint').count() > 0 && await page.locator('.rv-num-in').count() === 0, '2B wrong pair gets a hint and no question');
  await page.locator('.rw-graph g[data-i="2"]').click(); await page.locator('.rw-graph g[data-i="1"]').focus(); await page.keyboard.press('Enter');
  ok(await page.locator('.rv-num-in').count() === 1, '2B keyboard pick of a doubling pair opens the question');
  await page.locator('.rv-num-in').fill('2'); await page.locator('.ask, .rv-num-in').first(); await page.locator('button:has-text("Check")').last().click(); await complete('2B Test the hypothesis');
  // 2C
  await goStep('generators', 5);
  await gotIt('2C'); await page.locator('.ask .opt:has-text("At 2 turns each second")').click(); await page.locator('.rw-cards .opt:has-text("It says support or contradict")').click(); await page.locator('.rw-cards .opt:has-text("It uses two numbers")').click(); await page.locator('.rw-cards .opt:has-text("It explains the science")').click();
  await page.locator('button:has-text("Check my cards")').click(); await complete('2C Weak or strong');
  ok((await page.locator('.rw-key-txt').allInnerTexts()).some(t => /Say support or contradict/.test(t)), '2C key idea');
  ok((await page.evaluate(() => STOPS.find(s => s.id === 'generators').learn.map(l => l.title))).indexOf('Read the wave') < 0, 'Read the wave removed');
  // 3A, 3B, 3C
  await goStep('acdc', 4);
  await gotIt('3A'); ok((await page.locator('.mk-lab').allInnerTexts()).join() === 'Problem,Science,Solution', '3A real labels'); await markAll([0, 1, 1, 2]); await page.locator('.mk-check').click(); await complete('3A Spot the structure');
  await goStep('acdc', 5); await page.locator('button:has-text("Check my order")').click(); await complete('3B Put the cards in order');
  await goStep('acdc', 6);
  for (const t of ['The problem', 'The science idea', 'A number from the text']) await page.locator('.rw-plain .opt', {hasText: t}).click();
  await page.locator('.rw-plain button:has-text("Check")').click(); await model(); await complete('3C Fix a weak paragraph');
  // 4A, 4B
  await goStep('power', 3);
  await gotIt('4A'); const vals = ['Fact', 'Opinion', 'Fact', 'Opinion']; for (let i = 0; i < 4; i++) await page.locator('.rv-grid select').nth(i).selectOption(vals[i]);
  await page.locator('.rw-plain button:has-text("Check")').click(); await model(); await complete('4A Fact or opinion');
  await goStep('power', 4); await gotIt('4B'); await markAll([0, 0, 1]); await page.locator('.mk-check').click(); await model(); await complete('4B Sum it up');
  // saved after reload (Learn mark)
  await page.waitForTimeout(700); await page.waitForTimeout(1200); await page.reload(); await page.waitForTimeout(500); await teacher(true); await open('power', 'learn'); await page.waitForSelector('.learn-card');
  for (let k = 0; k < 4; k++) await page.locator('.learn-card .btn.primary:has-text("Next step")').click();
  await page.waitForSelector('.mk-item', {timeout: 3000}).catch(() => {}); ok(await page.locator('.mk-item.right').count() === 3, 'Learn mark saved after reload');
  await teacher(false);

  /* ---------- Check: mark right, wrong, one go, saved ---------- */
  const rightIdx = id => page.evaluate(id => STOPS.find(s => s.id === id).review[4].sents.map(s => s.a), id);
  for (const id of IDS){
    await open(id, 'review'); await page.waitForSelector('.rv-card');
    const idxs = await rightIdx(id); const card = page.locator('.rv-card').nth(4);
    ok((await card.locator('.rv-type').innerText()).toLowerCase() === 'mark it', id + ' type label');
    const wrong = id === 'power' || id === 'acdc';
    for (let i = 0; i < idxs.length; i++){ let want = idxs[i]; if (wrong && i === 0) want = idxs[0] === 0 ? 1 : 0; for (let k = 0; k <= want; k++) await card.locator('.mk-sent').nth(i).click(); }
    if (id === 'electromagnets'){ for (let k = 0; k < 4; k++) await card.locator('.mk-sent').nth(0).click(); } // four taps go all the way round
    await card.locator('.mk-sent').nth(1).focus(); await page.keyboard.press('Enter');
    await card.locator('.mk-check').click();
    const pill = await card.locator('.rv-pill').innerText(); const n = idxs.length;
    ok(new RegExp(`of ${n} point`).test(pill), id + ' one point per sentence: ' + pill);
    ok(await card.locator('.mk-sent[aria-disabled="true"]').count() === n && await card.locator('.mk-check').isHidden(), id + ' one go: locked');
    ok(await card.locator('.mk-why').count() === n, id + ' every sentence shows its reason');
    ok(await card.locator('.mk-fix').count() >= (wrong ? 1 : 0), id + ' right labels shown for wrong sentences');
    if (id === 'acdc') ok(await card.locator('.mk-note').count() === 1 && /1896/.test(await card.locator('.mk-note').innerText()), 'acdc DC note with 1896');
    // paragraph
    const pi = id === 'acdc' ? 5 : 6; const para = page.locator('.rv-card').nth(pi);
    ok(/paragraph/.test((await para.locator('.rv-type').innerText()).toLowerCase()), id + ' paragraph label');
    const needsPick = (id === 'electromagnets' || id === 'generators');
    if (needsPick){
      ok(await para.locator('textarea').evaluate(t => t.readOnly), id + ' box locked until points are tapped');
      const pick = para.locator('tr.rw-row'); ok(await pick.count() === 4 && await para.locator('.rw-graph').count() === 0, id + ' paragraph shows a table of four rows, not a graph');
      ok(/Tap two rows of the table/.test(await para.locator('.quiz-q').innerText()) && !/graph|points/i.test(await para.locator('.quiz-q').innerText() + await para.locator('.rw-starters').innerText()), id + ' prompt says rows, no graph');
      ok(!/your own results|your graph/i.test(await para.innerText()), id + ' paragraph is a new context');
      await pick.nth(0).click(); await pick.nth(1).click();
      ok(await para.locator('.rw-side li').count() === 2, id + ' tapped evidence beside the box');
    } else ok(await para.locator('.rw-side .mk-tag').count() === idxs.filter(a => a >= 0).length, id + ' marked evidence with right labels beside the box');
    const starters = await para.locator('.rw-starters .chip').count(); ok(starters === {electromagnets: 3, generators: 2, acdc: 1, power: 0}[id], id + ' starters fade: ' + starters);
    const rem = await para.locator('.rw-remind').count(), open_ = rem ? await para.locator('.rw-remind').evaluate(d => d.open) : null;
    ok(id === 'electromagnets' ? open_ === true : id === 'power' ? rem === 0 : open_ === false, id + ' reminder fold-out');
    await para.locator('textarea').fill('The data support this because the numbers go up together.'); await para.locator('button:has-text("finished")').click();
    ok(await para.locator('.rv-checklist input').count() === 4, id + ' four ticks');
    const strip = await para.locator('.rw-strip .rw-w.on').innerText(); ok(strip === 'Write it', id + ' paragraph strip');
    // reload
    await page.waitForTimeout(1200); await page.reload(); await page.waitForTimeout(500); await open(id, 'review'); await page.waitForSelector('.rv-card');
    ok(await page.locator('.rv-card').nth(4).locator('.mk-sent[aria-disabled="true"]').count() === n, id + ' mark saved after reload');
    ok((await page.locator('.rv-card').nth(pi).locator('textarea').inputValue()).length > 10, id + ' paragraph saved after reload');
  }

  /* ---------- worksheets ---------- */
  for (const id of ['electromagnets', 'generators']){ const r = await page.evaluate(id => { const st = STOPS.find(x => x.id === id); showWorksheet(st, 'blank', 'f'); const el = document.querySelector('#ws-root .ws'); const res = {graphs: el.querySelectorAll('.rw-graph').length, imgs: el.querySelectorAll('.ws-gimg').length, tables: el.querySelectorAll('.ws-gtable').length, white: /\bwhite\b/i.test(el.innerText)}; document.getElementById('ws-root').remove(); return res; }, id); ok(r.graphs === 0 && r.imgs === 1 && r.tables >= 2, id + ' blank sheet prints the data table and a grid for the graph question (' + JSON.stringify(r) + ')'); ok(!r.white, id + ' no white on the sheet'); }
  { const r = await page.evaluate(() => { const keep = Store.data.rv; Store.data.rv = {'electromagnets~f2': {0: {done: 1}, 4: {done: 1}, 5: {done: 1, text: 'old'}}}; const k = Object.keys(rvStore('electromagnets~f4')).join(); Store.data.rv = keep; return k; }); ok(r === '0,4', 'from ~f2: old Check answers kept, old paragraph cleared: ' + r); }
  { const r = await page.evaluate(() => { const keep = Store.data.rv; const out = {};
      Store.data.rv = {'generators~f3': {0: {done: 1}, 3: {done: 1}, 4: {done: 1}, 5: {done: 1, resp: {text: 'mine', ev: [0, 3]}}}, 'generators~f2': {1: {done: 1}}}; out.gen = Object.keys(rvStore('generators~f4')).join() + '|' + rvStore('generators~f4')[6].resp.text + '|' + Object.keys(Store.data.rv['generators~f3']).join();
      Store.data.rv = {'power~f2': {0: {done: 1}, 4: {done: 1}, 5: {done: 1, resp: {text: 'wind'}}}}; out.pow = Object.keys(rvStore('power~f3')).join() + '|' + rvStore('power~f3')[6].resp.text;
      Store.data.rv = {'electromagnets~f3': {5: {done: 1}}, 'electromagnets~f2': {1: {done: 1}}}; out.pref = Object.keys(rvStore('electromagnets~f4')).join();
      Store.data.rv = {}; out.none = Object.keys(rvStore('power~f3')).length; Store.data.rv = keep; return out; });
    ok(r.gen === '0,3,4,6|mine|0,3,4,5', 'from ~f3: items 0-4 keep their index and the paragraph moves to 6, and ~f3 is left alone: ' + r.gen); ok(r.pow === '0,4,6|wind', 'power ~f2 to ~f3 keeps items and moves the paragraph: ' + r.pow);
    ok(r.pref === '6', '~f3 is used before ~f2 when both exist: ' + r.pref); ok(r.none === 0, 'a new student starts empty'); }
  await teacher(true);
  const ws = await page.evaluate(() => IDS_ => IDS_, 0);
  for (const id of IDS){
    const r = await page.evaluate(id => { const s = STOPS.find(x => x.id === id), o = {}; ['key', 'student', 'blank'].forEach(m => { showWorksheet(s, m, 'f'); const el = document.querySelector('#ws-root .ws'); const t = el.innerText; o[m] = {marks: el.querySelectorAll('.ws-mark').length, rows: el.querySelectorAll('.ws-mark tbody tr').length, ticked: el.querySelectorAll('.ws-mark .ws-box').length, ticks: [...el.querySelectorAll('.ws-mark .ws-box')].filter(b => b.textContent === '✓').length, myp: /MYP|objective|criteri|strand|\bC ii\b/i.test(t), tall: Math.max(...[...el.querySelectorAll('.ws-q')].map(q => q.offsetHeight)), starters: /Sentence starters/.test(t)}; document.getElementById('ws-root').remove(); });
      o.scheme = schemeForStop(s, 'f').text; o.keyText = answerKeyText(s, 'f'); o.ai = aiFeedbackText([s], [], false); o.task = document.querySelector('.hw-out') ? 1 : 0; return o; }, id);
    ok(r.student.marks === 1 && r.blank.marks === 1 && r.key.marks === 1, id + ' mark table in all modes ' + JSON.stringify([r.student.marks, r.blank.marks, r.key.marks, r.key.myp]));
    ok(r.blank.ticks === 0, id + ' blank has no ticks'); ok(r.key.ticks === r.key.rows, id + ' key ticks one box per sentence'); ok(r.student.ticks === r.student.rows, id + ' student ticks saved answers');
    ok(!r.student.myp && !r.blank.myp, id + ' no MYP text on student or blank sheets'); ok(r.key.myp, id + ' key may show strands');
    ok(r.student.tall < 1000 && r.blank.tall < 1000, id + ' no question taller than a page: ' + r.student.tall + '/' + r.blank.tall);
    ok(/Mark it, \d+ marks/.test(r.scheme) && /Mark it/.test(r.keyText) && /Mark it/.test(r.ai), id + ' marking scheme, key and AI text name Mark it');
    if (id === 'electromagnets' || id === 'generators') ok(/Criterion C/.test(r.ai) && /Cii|C ii/.test(r.ai), id + ' AI text counts criterion C');
  }
  const exp = await page.evaluate(() => { const L = aiFeedbackText(asSheets([STOPS.find(s => s.id === 'generators')]), [], false); return /Ciii: discuss the validity/.test(L) || /C iii: discuss the validity/.test(L); });
  ok(exp, 'Ciii wording in AI text');

  /* ---------- retrieval still draws displaced questions ---------- */
  const rt = await page.evaluate(() => {
    const out = {review: 0, tt: 0, errs: 0}; const arch = {}; STOPS.forEach(s => { if (s.reviewArchive){ const nw = new Set(s.review.map(x => x.q)); arch[s.id] = new Set(s.reviewArchive.filter(x => !nw.has(x.q)).map(x => x.q)); } });
    for (let i = 0; i < 80; i++){ try {
      const t = rtBuildTimeTest('CHAP' + i, {challenge: null}); t.items.forEach(it => { if (Object.values(arch).some(set => set.has(it.q))) out.tt++; });
      for (const id of Object.keys(arch)){ const x = rtRvRecall(rtRng('R' + i + id), id); if (x && arch[id].has(x.q)) out.review++; }
      rtBuildReview(STOPS.map(s => s.id), rtRng('RV' + i), {}); } catch (e) { out.errs++; out.msg = String(e); } }
    return out; });
  ok(rt.errs === 0, 'retrieval builds without errors ' + (rt.msg || '')); ok(rt.review > 0, 'Review recall draws displaced questions (' + rt.review + ')'); ok(rt.tt > 0, 'Time Test draws displaced questions (' + rt.tt + ')');

  /* ---------- phone width ---------- */
  await page.setViewportSize({width: 390, height: 800}); await teacher(true);
  const wide = [];
  for (const id of IDS){
    for (const tab of ['review']){ await open(id, tab); await page.waitForTimeout(100); wide.push([id + ' ' + tab, await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)]); }
    for (let k = 0; k < NEW[id]; k++){ const idx = (await page.evaluate(id => STOPS.find(s => s.id === id).learn.length, id)) - (id === 'generators' ? 3 : 0) - NEW[id] + k - (id === 'generators' ? 2 : 0) + (id === 'generators' ? 0 : 0);
      await open(id, 'learn'); await page.waitForSelector('.learn-card'); const target = id === 'generators' ? 3 + k : (await page.evaluate(id => STOPS.find(s => s.id === id).learn.length, id)) - NEW[id] + k;
      for (let j = 0; j < target; j++) await page.locator('.learn-card .btn.primary:has-text("Next step")').click();
      await page.waitForTimeout(100); wide.push([id + ' learn ' + target, await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)]); }
  }
  wide.forEach(([n, d]) => ok(d <= 1, 'no sideways scroll at 390px: ' + n + ' (' + d + ')'));
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  await browser.close();
  console.log(`test-chapters: ${passes} passed, ${fails} failed`); process.exit(fails ? 1 : 0);
})();
