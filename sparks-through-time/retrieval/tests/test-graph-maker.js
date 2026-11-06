/* Graph maker (graphMaker) and the new `graph` Check question type.
   Drives the real tool with pointer events (mouse down, move, up) in the three Check questions (Electromagnets, Generators, Power) and the Electromagnets Learn step.
   Run:  node sparks-through-time/retrieval/tests/test-graph-maker.js   (needs Playwright; set SHOTS=<folder> to keep the screenshots) */
const {chromium} = require('playwright'), GH = require('./graph-helpers.js'), path = require('path'), fs = require('fs'), os = require('os');
const FILE = path.resolve(__dirname, '..', '..', 'Sparks-Through-Time.html');
const SHOTS = process.env.SHOTS || fs.mkdtempSync(path.join(os.tmpdir(), 'gm-shots-'));
let fails = 0, passes = 0;
const ok = (c, m) => { if (c){ passes++; } else { fails++; console.log('FAIL: ' + m); } };
const errs = [];

const CASES = {
  electromagnets: {idx: 5, rows: [[1, 500], [2, 1000], [3, 1500], [4, 2000]], good: {type: 'scatter', title: 'Number of cells vs Mass of steel lifted', xl: 'Number of cells', yl: 'Mass of steel lifted (kg)', y: [0, 2500, 500], x: [0, 5, 1]}},
  generators: {idx: 5, rows: [[2, 1.6], [4, 3.2], [6, 4.8], [8, 6.4]], good: {type: 'scatter', title: 'Wheel turns each second vs Peak voltage', xl: 'Wheel turns each second', yl: 'Peak voltage (V)', y: [0, 8, 2], x: [0, 10, 2]}},
  power: {idx: 5, rows: [['Coal', 820], ['Natural gas', 490], ['Biomass', 230], ['Wind', 11]], good: {type: 'bar', title: 'Energy source vs CO2 released', xl: 'Energy source', yl: 'CO2 released (g per kWh)', y: [0, 1000, 200]}}
};
const spec = (id, over) => Object.assign({rows: CASES[id].rows}, CASES[id].good, over || {});

(async () => {
  const browser = await chromium.launch();
  const mk = async (w, h) => {
    const ctx = await browser.newContext({viewport: {width: w || 1280, height: h || 1600}}), page = await ctx.newPage();
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.addInitScript(() => { new MutationObserver(() => { const b = document.querySelector('.ican-next') || document.querySelector('.say-ok'); if (b) b.click(); }).observe(document, {subtree: true, childList: true}); });
    await page.goto('file://' + FILE); await page.evaluate(() => localStorage.setItem('sparks-through-time-v1', JSON.stringify({studentName: 'Graph Tester', studentClass: '6X'}))); await page.waitForTimeout(1000); await page.reload(); await page.waitForTimeout(400);
    return page;
  };
  const openReview = (page, id) => page.evaluate(id => { prog(id).learn = true; Store.data.selfA = Store.data.selfA || {}; Store.data.selfA[id] = {v: [], done: true}; renderStop(STOPS.find(s => s.id === id), 'review'); }, id).then(() => page.waitForSelector('.rv-card'));
  const cardOf = (page, id) => page.locator('.rv-card').nth(CASES[id].idx);
  const marksOf = async card => (await card.locator('.gm-marks li').evaluateAll(l => l.map(x => x.classList.contains('ok') ? 1 : 0))).join('');
  const check = async (card) => { await card.locator('button:has-text("Check my graph")').click(); await card.locator('.gm-marks').waitFor(); };
  const stateOf = (page, id) => page.evaluate(([id]) => { const s = STOPS.find(x => x.id === id), st = rvStore(rvKey(s, 'f')); return st[5]; }, [id]);

  /* ---------- 1. words, units and capitals are accepted; the data and marks are right ---------- */
  {
    const page = await mk(); const r = await page.evaluate(() => {
      const xw = ['cell', 'battery', 'batteries'], yw = ['mass', 'steel', 'lifted', 'lift', 'weight', 'load'], out = {};
      out.titles = ['Number of cells vs Mass of steel lifted', 'CELLS VS MASS', 'cells v mass lifted', 'Cell vs weight of steel', 'Mass of steel against number of cells', 'cells versus steel'].map(t => gmTitleOK(t, xw, yw));
      out.badTitles = ['', 'Mass vs Cells', 'cells and mass', 'Number of cells', 'vs', 'cells vs', 'Graph of my results'].map(t => gmTitleOK(t, xw, yw));
      const H = ['Number of cells', 'Mass of steel lifted (kg)'];
      out.xl = ['Number of cells', 'NUMBER OF CELLS', 'cells', 'Batteries (cells)'].map(t => gmLabelOK(t, xw, H[0]));
      out.yl = ['Mass of steel lifted (kg)', 'mass (KG)', 'Steel lifted (kilograms)', 'weight [kg]'].map(t => gmLabelOK(t, yw, H[1]));
      out.badYl = ['Mass of steel lifted', 'Mass of steel lifted in kg', 'Mass (g)', 'Number of cells (kg)', '(kg)', ''].map(t => gmLabelOK(t, yw, H[1]));
      const V = ['Peak voltage (V)'], vw = ['voltage', 'volt', 'peak']; out.volt = ['Peak voltage (V)', 'peak voltage (volts)', 'Voltage (v)'].map(t => gmLabelOK(t, vw, V[0])); out.badVolt = ['Peak voltage', 'Voltage (A)'].map(t => gmLabelOK(t, vw, V[0]));
      const C = 'CO₂ released (g per kWh)', cw = ['co2', 'carbon', 'dioxide', 'release', 'emission']; out.co2 = ['CO₂ released (g per kWh)', 'CO2 released (g/kWh)', 'Carbon dioxide released (grams per kWh)', 'co2 emissions (G PER KWH)'].map(t => gmLabelOK(t, cw, C)); out.badCo2 = ['CO2 released (g)', 'CO2 released'].map(t => gmLabelOK(t, cw, C));
      out.noUnit = gmLabelOK('Number of cells', xw, 'Number of cells') && !gmLabelOK('Height', xw, 'Number of cells');
      /* the three model graphs score 5, and one change loses one mark */
      const specs = {em: {head: ['Number of cells', 'Mass of steel lifted (kg)'], rows: [[1, 500], [2, 1000], [3, 1500], [4, 2000]], kind: 'scatter', xWord: xw, yWord: yw}};
      const m = gmModel(specs.em), e = gmEval(specs.em, m); out.model = e.marks.map(x => x ? 1 : 0).join(''); out.axes = [m.ymin, m.ymax, m.ystep, m.xmin, m.xmax, m.xstep].join();
      const t = (f) => { const c = JSON.parse(JSON.stringify(m)); f(c); return gmEval(specs.em, c).marks.map(x => x ? 1 : 0).join(''); };
      out.var = {type: t(c => { c.type = 'bar'; c.slots = [0, 1, 2, 3]; c.bars = {0: 500, 1: 1000, 2: 1500, 3: 2000}; }), title: t(c => { c.title = ''; }), xl: t(c => { c.xl = 'Cells'; c.yl = 'Mass'; }), top: t(c => { c.ymax = 1500; }), gap: t(c => { c.ymax = 2600; }), big: t(c => { c.ymax = 100000; c.ystep = 10000; }), tiny: t(c => { c.ystep = 5; }), edge: t(c => { c.ymax = 2000; }), point: t(c => { c.pts[2] = {x: 3, y: 1000}; }), missing: t(c => { delete c.pts[1]; }), near: t(c => { c.pts[1].y = 1000 + 2500 * 0.03; }), far: t(c => { c.pts[1].y = 1000 + 2500 * 0.04; }) };
      return out; });
    ok(r.titles.every(Boolean), 'titles with any capitals, v / vs / versus and synonyms are accepted: ' + r.titles); ok(r.badTitles.every(x => !x), 'titles without x vs y with the key words are refused: ' + r.badTitles);
    ok(r.xl.every(Boolean) && r.yl.every(Boolean), 'labels: capitals, synonyms and unit spellings accepted: ' + r.xl + ' ' + r.yl); ok(r.badYl.every(x => !x), 'a label needs its key word and the unit in brackets: ' + r.badYl);
    ok(r.volt.every(Boolean) && r.badVolt.every(x => !x), 'volt units: ' + r.volt + ' / ' + r.badVolt); ok(r.co2.every(Boolean) && r.badCo2.every(x => !x), 'CO2 units and the subscript: ' + r.co2 + ' / ' + r.badCo2); ok(r.noUnit, 'a unit is only needed where the column has one');
    ok(r.model === '11111' && r.axes === '0,2500,500,0,5,1', 'the model graph scores 5: ' + r.model + ' ' + r.axes);
    ok(r.var.type === '01111' && r.var.title === '10111' && r.var.xl === '11011' && r.var.top === '11101' && r.var.gap === '11101' && r.var.big === '11101' && r.var.tiny === '11100' && r.var.edge === '11111' && r.var.point === '11110' && r.var.missing === '11110', 'one change loses one mark: ' + JSON.stringify(r.var));
    ok(r.var.near === '11111' && r.var.far === '11110', 'points count as right within 3.5% of the axis range: ' + r.var.near + ' ' + r.var.far);
    await page.context().close();
  }

  /* ---------- 2. each Check question, with real drags ---------- */
  const SC = {}; // scores for the report
  for (const id of ['electromagnets', 'generators', 'power']){
    const page = await mk(); await openReview(page, id); const card = cardOf(page, id), root = card.locator('.gm');
    const q = await card.locator('.quiz-q').innerText(), tname = (await card.locator('.rv-type').innerText()).toLowerCase();
    ok(tname === 'make a graph' && q === {electromagnets: 'The scrapyard workers recorded these results. Make a graph of them.', generators: 'The cyclist recorded these results. Make a graph of them.', power: 'Make a graph of the CO₂ released by each energy source.'}[id], id + ' prompt and label: ' + tname + ' / ' + q);
    ok(await card.locator('.gm-table tbody tr').count() === 4 && await card.locator('.gm-table').isVisible(), id + ' data table is on screen');
    ok(await card.locator('.gm-check').count() === 0 && await card.locator('.gm-marks').count() === 0, id + ' Check mode: no checklist before Check');
    const dump = async () => await root.locator('canvas.gm-cv').evaluate(c => c.toDataURL());
    // the type, title, labels and axis numbers are one screen: drag a chip with a ghost
    const g = spec(id); await GH.setup(page, root, g);
    ok(await root.locator('.gm-chip').count() === 4, id + ' four chips in the tray');
    // ghost chip appears while dragging
    { const chip = root.locator('.gm-chip').first(); const c0 = await GH.centre(chip); await page.mouse.move(c0.x, c0.y); await page.mouse.down(); await page.mouse.move(c0.x + 60, c0.y - 40, {steps: 3});
      ok(await page.locator('.gm-ghost').count() === 1, id + ' a ghost chip follows the pointer'); await page.mouse.up(); ok(await page.locator('.gm-ghost').count() === 0, id + ' ghost removed on drop'); }
    // dropping outside the canvas places nothing
    ok(await root.locator('.gm-chip.placed').count() === 0, id + ' a drop outside the graph places nothing');
    // no rings in Check mode before Check
    await GH.plot(page, root, g);
    const ringPx = (cx, cy) => root.locator('canvas.gm-cv').evaluate((c, [cx, cy]) => { const d = c.getContext('2d').getImageData(cx, cy, 1, 1).data; return [d[0], d[1], d[2]]; }, [cx * 1, cy * 1]);
    if (g.type === 'scatter'){ const [x, y] = g.rows[1]; const px = GH.mapX(g, x) + 20, py = GH.mapY(g, y); const c = await ringPx(px, py); ok(!(c[1] > 100 && c[0] < 90) && !(c[0] > 150 && c[1] < 80), id + ' no ring before Check: ' + c); }
    ok(await marksOf(card) === '', id + ' no marks before Check');
    await page.screenshot({path: path.join(SHOTS, `check-${id}-before.png`)});
    await check(card);
    ok(await marksOf(card) === '11111', id + ' right graph earns 5: ' + await marksOf(card)); SC[id] = 5;
    ok(/5 of 5 point/.test(await card.locator('.rv-pill').innerText()), id + ' pill shows 5 of 5: ' + await card.locator('.rv-pill').innerText());
    if (g.type === 'scatter'){ const [x, y] = g.rows[1]; const c = await ringPx(GH.mapX(g, x) + 20, GH.mapY(g, y)); ok(c[1] > 100 && c[0] < 90, id + ' green ring shows after Check: ' + c); }
    ok(await root.locator('.gm-in:not([disabled])').count() === 0 && await root.locator('.gm-opt:not([disabled])').count() === 0 && await root.evaluate(r => r.classList.contains('gm-locked')), id + ' locked after Check');
    // one go: a drag on the canvas does nothing
    const before = await dump(); const rr = g.type === 'scatter' ? [GH.mapX(g, g.rows[0][0]), GH.mapY(g, g.rows[0][1])] : [GH.GEO.L + 90, GH.GEO.B]; await GH.drag(page, await GH.toPage(root, rr[0], rr[1]), await GH.toPage(root, rr[0] + 100, rr[1] - 150));
    ok(before === await dump(), id + ' locked graph cannot be dragged');
    const st = await stateOf(page, id); ok(st && st.done === true && st.ok === true && st.pts === 5 && st.max === 5 && st.resp.m.join('') === '11111' && st.resp.s.title === g.title, id + ' saved answer holds the graph and the marks');
    const img1 = await dump();
    // reload: it redraws and stays locked
    await page.waitForTimeout(1200); await page.reload(); await page.waitForTimeout(500); await openReview(page, id);
    const card2 = cardOf(page, id), root2 = card2.locator('.gm');
    ok(await root2.locator('canvas.gm-cv').evaluate(c => c.toDataURL()) === img1, id + ' graph redraws exactly after a reload');
    ok(await marksOf(card2) === '11111' && /5 of 5/.test(await card2.locator('.rv-pill').innerText()) && await card2.locator('.feedback').innerText().then(t => /5 of 5 marks/.test(t)), id + ' marks and feedback come back after a reload');
    ok(await root2.locator('.gm-in:not([disabled])').count() === 0 && await card2.locator('button:has-text("Check my graph")').isDisabled(), id + ' still locked after a reload');
    ok(await page.locator('.rv-bar').innerText().then(t => /1 of 7 done/.test(t) && /Points so far: 5 of 5/.test(t)), id + ' sticky bar counts it');
    // worksheets
    const ws = await page.evaluate(([id]) => { const s = STOPS.find(x => x.id === id), o = {}; ['student', 'blank', 'key'].forEach(m => { showWorksheet(s, m, 'f'); const el = document.querySelector('#ws-root .ws'), q = [...el.querySelectorAll('.ws-q')].find(x => /Make a graph/.test(x.textContent));
      o[m] = {img: q.querySelectorAll('.ws-gimg').length, src: (q.querySelector('.ws-gimg') || {}).src && q.querySelector('.ws-gimg').src.slice(0, 22), len: q.querySelector('.ws-gimg').src.length, rows: q.querySelectorAll('.ws-gtable tbody tr').length, marks: [...q.querySelectorAll('.ws-gmarks tbody tr')].map(r => r.cells[2].innerText.trim()).join('|'), text: q.innerText, tall: q.getBoundingClientRect().height, part: !!([...el.querySelectorAll('.ws-part')].find(h => /Part B/.test(h.innerText))), myp: /MYP|strand/i.test(el.innerText), feedback: (el.querySelector('.ws-feedback') || {innerText: ''}).innerText };
      document.getElementById('ws-root').remove(); });
      const it = s.review.find(x => x.t === 'graph'); o.mark = markItem(it); o.keyLine = keyAnswerLine(it); o.scheme = schemeForStop(s, 'f').text; o.ai = aiFeedbackText([s], [], false); o.gsrc = [gmImageURL(it.graph, gmModel(it.graph)), gmGridURL()]; return o; }, [id]);
    ok(ws.student.img === 1 && /^data:image\/png/.test(ws.student.src) && ws.student.len > 5000 && ws.student.marks === '✓ 1|✓ 1|✓ 1|✓ 1|✓ 1', id + ' student sheet prints the graph picture and the five marks: ' + ws.student.marks);
    ok(ws.blank.img === 1 && ws.blank.marks === '||||' && ws.blank.rows === 4 && ws.blank.text.includes('Draw your graph on the grid'), id + ' blank sheet prints the data table and an empty grid');
    ok(ws.key.img === 1 && ws.key.marks === '✓ 1|✓ 1|✓ 1|✓ 1|✓ 1' && /Look for/.test(ws.key.text), id + ' answer key prints a correct graph and the five marks');
    ok(ws.gsrc[0] !== ws.gsrc[1], id + ' model picture differs from the blank grid');
    ok(!ws.student.myp && !ws.blank.myp, id + ' no strands on the student or blank sheet'); ok(ws.student.tall < 1000 && ws.blank.tall < 1000 && ws.key.tall < 1000, id + ' graph block fits a page: ' + [ws.student.tall, ws.blank.tall, ws.key.tall].map(Math.round));
    ok(ws.student.part && /Graph: 5 of 5 marks/.test(ws.student.feedback), id + ' graph is in Part B and the feedback page gives the marks');
    ok(ws.mark.marks === 5 && /sim marks this question automatically/.test(ws.mark.lines.join(' ')) && ws.mark.lines.join(' ').includes(CASES[id].rows[0][1]), id + ' marking scheme: 5 marks, says the sim marks it, lists the data');
    ok(/The sim marks this automatically/.test(ws.keyLine) && /marks appear under the student/.test(ws.keyLine) && ws.keyLine.includes(String(CASES[id].rows[3][1])), id + ' AI key line says the sim marks it and lists the data');
    ok(/Make a graph, 5 marks \[C i\]/.test(ws.ai) && /C i: present collected and transformed data/.test(ws.ai) && /Make a graph, 5 marks/.test(ws.scheme) && /MYP: C i/.test(ws.scheme), id + ' AI text and scheme carry the type, 5 marks and strand C i');
    if (id === 'electromagnets'){ await card2.locator('.gm-marks').scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy({top: -250, behavior: 'instant'})); await page.waitForTimeout(700); await page.screenshot({path: path.join(SHOTS, 'check-finished.png')}); }
    // the paragraph is a table question now
    const para = cardOf(page, id === 'power' ? 'power' : id).locator('xpath=following-sibling::div[1]');
    if (id !== 'power'){ const pt = await para.innerText(); ok(/Tap two rows of the table/.test(pt) && !/\bgraphs?\b/i.test(pt) && await para.locator('tr.rw-row').count() === 4, id + ' paragraph says rows and shows a table'); }
    else { const pt = await para.innerText(); ok(/CO₂|wind|coal/i.test(pt) && !/\bgraphs?\b/i.test(pt), 'power paragraph reads properly: ' + pt.slice(0, 80).replace(/\n/g, ' ')); }
    await page.context().close();
  }

  /* ---------- 3. each mark is lost on its own ---------- */
  const variants = [
    ['electromagnets', 'wrong type (bar for numbers)', '01111', g => Object.assign({}, g, {type: 'bar', y: [0, 2500, 500]}), {bar: true}],
    ['generators', 'blank title', '10111', g => Object.assign({}, g, {title: ''})],
    ['generators', 'uneven axis gap', '11101', g => Object.assign({}, g, {y: [0, 7, 2]})],
    ['electromagnets', 'axis too small for the data', '11101', g => Object.assign({}, g, {y: [0, 1500, 500]}), {noPlot: 1}],
    ['electromagnets', 'a misplaced point', '11110', g => g, {place: i => i === 2 ? [3, 1000] : null}],
    ['electromagnets', 'a point 4.8% off', '11110', g => g, {place: i => i === 1 ? [2, 1120] : null}],
    ['electromagnets', 'a point 2.4% off', '11111', g => g, {place: i => i === 1 ? [2, 1060] : null}],
    ['power', 'unit left out', '11011', g => Object.assign({}, g, {yl: 'CO2 released'})],
    ['power', 'a bar at the wrong height', '11110', g => g, {height: (i, v) => i === 3 ? 150 : v}],
    ['power', 'bars placed in a different order', '11111', g => g, {order: [3, 1, 0, 2]}],
    ['power', 'bar axis not starting at 0', '11100', g => Object.assign({}, g, {y: [200, 1000, 200]})]
  ];
  for (const [id, label, want, f, extra0] of variants){
    const page = await mk(); await openReview(page, id); const card = cardOf(page, id), root = card.locator('.gm');
    let g = f(spec(id)); const extra = extra0 || {};
    if (extra.place) g.place = (i, r) => extra.place(i) || r;
    if (extra.height) g.height = extra.height; if (extra.order) g.order = extra.order;
    await GH.setup(page, root, g);
    if (extra.bar){ const gb = Object.assign({}, g, {type: 'bar', order: [0, 1, 2, 3]}); await GH.plot(page, root, gb); }
    else if (extra.noPlot){ await GH.plot(page, root, Object.assign({}, g, {y: [0, 2500, 500]})); }  // drag as if the axis were the right one: the points cannot sit right
    else await GH.plot(page, root, g);
    await check(card);
    const got = await marksOf(card), n = want.split('').filter(x => x === '1').length;
    ok(extra.noPlot ? got[3] === '0' && got.slice(0, 3) === '111' : got === want, `${id}: ${label} gives ${want}: ${got}`);
    if (!extra.noPlot) ok(new RegExp(`${n} of 5 point`).test(await card.locator('.rv-pill').innerText()), `${id}: ${label} pill shows ${n} of 5`);
    ok(extra.noPlot || /Whoops/.test(await card.locator('.feedback').innerText()) === (n < 5), `${id}: ${label} feedback`);
    if (label.startsWith('wrong type')) await page.screenshot({path: path.join(SHOTS, 'check-lost-marks.png')});
    if (n < 5 && !extra.noPlot){ const t = await card.locator('.gm-marks li.bad').first().innerText(); ok(t.length > 25, `${id}: ${label} says what to fix: ${t.replace(/\n/g, ' ')}`); }
    await page.context().close();
  }

  /* ---------- 4. draft saves before Check; wrong type of data for a scatter graph ---------- */
  {
    const page = await mk(); await openReview(page, 'power'); const card = cardOf(page, 'power'), root = card.locator('.gm');
    await root.locator('.gm-opt[data-type="scatter"]').click();
    ok(/names, so this data needs a different type/.test(await card.locator('.gm-tray').innerText()) && await root.locator('.gm-chip').count() === 0, 'a scatter graph of names is refused and no chips appear');
    await root.locator('.gm-opt[data-type="bar"]').click(); await root.locator('input[aria-label="Graph title"]').fill('Energy source vs CO2'); await root.locator('.gm-axrow[data-ax="y"] input').nth(1).fill('1000');
    ok(await root.locator('.gm-chip.cat').count() === 4, 'bar graph: four name chips');
    ok(await root.locator('.gm-axrow[data-ax="x"]').isHidden(), 'bar graph has no x-axis numbers');
    // chips cannot be dragged before the axes are set
    await page.waitForTimeout(100);
    const draft = await stateOf(page, 'power'); ok(draft && draft.done !== true && draft.resp.s.title === 'Energy source vs CO2', 'a draft is saved before Check');
    await page.waitForTimeout(1200); await page.reload(); await page.waitForTimeout(500); await openReview(page, 'power');
    ok(await cardOf(page, 'power').locator('input[aria-label="Graph title"]').inputValue() === 'Energy source vs CO2' && await cardOf(page, 'power').locator('.gm-opt.on').innerText() === 'Bar graph' && /To do/.test(await cardOf(page, 'power').locator('.rv-pill').innerText()), 'a draft comes back after a reload and the card is still to do');
    // Check with nothing made warns once, then goes ahead
    await page.context().close();
    const p2 = await mk(); await openReview(p2, 'generators'); const c2 = cardOf(p2, 'generators');
    await c2.locator('button:has-text("Check my graph")').click(); ok(/Make your graph first/.test(await c2.locator('.feedback').innerText()) && await c2.locator('.gm-marks').count() === 0, 'an empty Check warns first');
    await c2.locator('button:has-text("Check my graph")').click(); await c2.locator('.gm-marks').waitFor(); ok(await marksOf(c2) === '00000', 'a second press checks it anyway: 0 marks');
    await p2.context().close();
  }

  /* ---------- 5. touch: the same drag with pointerType touch ---------- */
  {
    const page = await mk(); await openReview(page, 'electromagnets'); const card = cardOf(page, 'electromagnets'), root = card.locator('.gm'), g = spec('electromagnets');
    await GH.setup(page, root, g); const chip = root.locator('.gm-chip').first(), c0 = await GH.centre(chip), to = await GH.toPage(root, GH.mapX(g, 1), GH.mapY(g, 500));
    await page.evaluate(([c0, to]) => { const ev = (t, x, y, tgt) => (tgt || window).dispatchEvent(new PointerEvent(t, {pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0, buttons: t === 'pointerup' ? 0 : 1}));
      const chip = document.elementFromPoint(c0.x, c0.y); ev('pointerdown', c0.x, c0.y, chip); ev('pointermove', (c0.x + to.x) / 2, (c0.y + to.y) / 2); ev('pointermove', to.x, to.y); ev('pointerup', to.x, to.y); }, [c0, to]);
    ok(await root.locator('.gm-chip.placed').count() === 1 && await root.locator('canvas.gm-cv').evaluate(c => getComputedStyle(c).touchAction) === 'none' && await chip.evaluate(c => getComputedStyle(c).touchAction) === 'none', 'a touch pointer drags a chip onto the graph (touch-action none on chips and canvas)');
    // tapping a placed grey chip takes the point back
    await root.locator('.gm-chip.placed').first().dispatchEvent('pointerdown', {button: 0}); ok(await root.locator('.gm-chip.placed').count() === 0, 'pressing a placed chip takes the point back');
    await page.context().close();
  }

  /* ---------- 6. Learn: Electromagnets, Run your fair test ---------- */
  {
    const page = await mk(); await page.evaluate(() => { Store.data.teacherOK = true; renderStop(STOPS.find(s => s.id === 'electromagnets'), 'learn'); }); await page.waitForSelector('.learn-card');
    for (let k = 0; k < 4; k++) await page.locator('.learn-card .btn.primary:has-text("Next step")').click();
    const say = await page.locator('.step-say').innerText(); ok(/make a graph of it/.test(say), 'the step says you will make a graph: ' + say.slice(-50));
    await page.locator('.rw-part:has-text("the number of coils")').click(); await page.locator('.rw-part:has-text("how strong")').click(); await page.locator('.rw-typed').first().fill('Coils may change the clips.');
    ok(await page.locator('.gm, .rw-teach').count() === 0, 'no graph or lesson before the table is full');
    for (let k = 0; k < 5; k++){ const c = (k + 1) * 10; await page.locator('input[type=range]').first().fill(String(c)); await page.locator('.rt-in').nth(0).fill(String(c / 10 * 4)); await page.locator('.rt-row button:has-text("Check")').first().click(); if (k < 4) ok(await page.locator('.rw-teach').count() === 0, 'the lesson waits for row ' + (k + 1) + ' of 5'); }
    ok(await page.locator('.rw-teach').count() === 1 && await page.locator('.gm').count() === 0, 'when the table is full, the lesson shows first');
    const teach = await page.locator('.rw-teach').innerText(); ok(/How to make a good graph/.test(teach) && /Current vs Temperature of the bulb/.test(teach) && /Temperature of the bulb \(°C\)/.test(teach) && !/coil/i.test(teach), 'worked example is a bulb, current against temperature, not coils');
    ok(await page.locator('.rw-teach .rw-teach-row').count() === 5 && (await page.locator('.rw-teach-name').allInnerTexts()).join() === 'Type,Title,Axes,Numbers,Points' && await page.locator('.rw-teach img.gm-eg').count() === 1, 'five parts and a picture of the worked example');
    ok(await page.locator('.learn-card.step-done').count() === 0, 'the step is not complete yet');
    await page.screenshot({path: path.join(SHOTS, 'learn-teach-card.png'), fullPage: false});
    await page.locator('button:has-text("Got it")').click(); ok(await page.locator('.gm').count() === 0, 'graph type practice comes before the graph');
    for (const [k, w] of ['Bar graph', 'Scatter graph', 'Bar graph'].entries()){ await page.locator(`.ask button.opt:has-text("${w}"):not([disabled])`).first().click(); if (k < 2) await page.locator('.ask button:has-text("Next question")').click(); }
    ok(await page.locator('.ask .opt.wrong').count() === 0, 'graph type answers are right');
    const root = page.locator('.gm'); await root.waitFor();
    ok(await root.evaluate(r => r.classList.contains('gm-help')) && await root.locator('.gm-check li').count() === 7 && await root.locator('.gm-check li.ok').count() === 0, 'Learn mode: live checklist of 7 items, none ticked yet');
    ok(await root.locator('.gm-table tbody tr').count() === 5, 'the coil table is on screen');
    const names = ['I chose the right type', 'My title', 'My x-axis label', 'My y-axis label', 'My axis numbers', 'All my data is plotted', 'Every point'];
    const lis = async () => root.locator('.gm-check li').evaluateAll(l => l.map(x => x.className + ':' + x.innerText.replace(/\n/g, ' ')));
    const G = {type: 'scatter', title: 'Coils of wire vs Paperclips held', xl: 'Coils of wire', yl: 'Paperclips held (clips)', y: [0, 25, 5], x: [0, 60, 10], rows: [[10, 4], [20, 8], [30, 12], [40, 16], [50, 20]]};
    await root.locator('.gm-opt[data-type="bar"]').click(); ok((await lis())[0].startsWith('todo') && /scatter graph/i.test((await lis())[0]), 'wrong type gets a hint'); await root.locator('.gm-opt[data-type="scatter"]').click();
    await root.locator('input[aria-label="Graph title"]').fill('Coils'); ok((await lis())[1].startsWith('todo'), 'a short title is not enough');
    await GH.setup(page, root, G); let l = await lis(); ok(l.slice(0, 5).every(x => x.startsWith('ok')), 'type, title, labels and axes tick as they are right: ' + l.slice(0, 5).map(x => x.slice(0, 2)));
    await root.locator('.gm-axrow[data-ax="y"] input').nth(1).fill('15'); l = await lis(); ok(l[4].startsWith('todo') && /does not fit|Make the highest/.test(l[4]), 'axes that cut off the data say so'); await root.locator('.gm-axrow[data-ax="y"] input').nth(1).fill('25');
    await GH.plot(page, root, Object.assign({}, G, {place: (i, r) => i === 2 ? [30, 14.5] : r}));
    l = await lis(); ok(l[5].startsWith('ok') && l[6].startsWith('todo'), 'all plotted but one wrong: only the last item is open');
    const ring = (x, y) => root.locator('canvas.gm-cv').evaluate((c, [x, y]) => { const d = c.getContext('2d').getImageData(x, y, 1, 1).data; return [d[0], d[1], d[2]]; }, [x, y]);
    const red = await ring(GH.mapX(G, 30) + 20, GH.mapY(G, 14.5)), green = await ring(GH.mapX(G, 10) + 20, GH.mapY(G, 4));
    ok(red[0] > 150 && red[1] < 80, 'a red ring on the wrong point: ' + red); ok(green[1] > 100 && green[0] < 90, 'a green ring on a right point: ' + green);
    await page.screenshot({path: path.join(SHOTS, 'learn-rings.png')});
    ok(await page.locator('.learn-card.step-done').count() === 0, 'the step is still open with a wrong point');
    // drag the wrong point to the right place
    await GH.drag(page, await GH.toPage(root, GH.mapX(G, 30), GH.mapY(G, 14.5)), await GH.toPage(root, GH.mapX(G, 30), GH.mapY(G, 12)));
    await page.waitForSelector('.learn-card.step-done', {timeout: 3000}).then(() => ok(true, 'finishing the graph completes the step'), () => ok(false, 'finishing the graph completes the step'));
    ok(await root.locator('.gm-check li.ok').count() === 7 && /finished/.test(await root.locator('.gm-done').innerText()), 'all seven ticks and a finished message');
    // snapping in Learn: a point 5% off lands exactly
    await GH.drag(page, await GH.toPage(root, GH.mapX(G, 30), GH.mapY(G, 12)), await GH.toPage(root, GH.mapX(G, 30) + 0.05 * 756, GH.mapY(G, 12)));
    { const pt = await page.evaluate(() => { const LR = Store.data.lr.electromagnets; const k = Object.keys(LR.mem).find(k => LR.mem[k].graph); return LR.mem[k].graph.pts[2]; }); ok(pt.x === 30 && pt.y === 12, 'in Learn a point dropped 5% off snaps to the exact place: ' + JSON.stringify(pt)); }
    const mem = await page.evaluate(() => { const LR = Store.data.lr.electromagnets; const k = Object.keys(LR.mem).find(k => LR.mem[k].graph); return k ? [LR.mem[k].graph.type, Object.keys(LR.mem[k].graph.pts).length, LR.mem[k].gdone, LR.mem[k].teach] : null; });
    ok(mem && mem[0] === 'scatter' && mem[1] === 5 && mem[2] === 1 && mem[3] === 1, 'the graph and the lesson are saved with the step (lrSlot): ' + JSON.stringify(mem));
    const png = await root.locator('canvas.gm-cv').evaluate(c => c.toDataURL());
    await page.waitForTimeout(1200); await page.reload(); await page.waitForTimeout(500); await page.evaluate(() => { Store.data.teacherOK = true; renderStop(STOPS.find(s => s.id === 'electromagnets'), 'learn'); }); await page.waitForSelector('.learn-card');
    for (let k = 0; k < 4; k++) await page.locator('.learn-card .btn.primary:has-text("Next step")').click();
    await page.locator('.gm').waitFor(); ok(await page.locator('.gm canvas').evaluate(c => c.toDataURL()) === png, 'the graph redraws after a reload, with no need to see the lesson again');
    ok(await page.locator('.learn-card.step-done').count() === 1 && await page.locator('.gm .gm-check li.ok').count() === 7, 'the step stays complete after a reload');
    // the next step still works
    await page.locator('.learn-card .btn.primary:has-text("Next step")').click(); await page.locator('tr.rw-row').nth(0).click(); await page.locator('tr.rw-row').nth(4).click();
    await page.locator('.ask .opt:has-text("With 10 coils it picked up 4 clips")').click(); await page.waitForSelector('.learn-card.step-done', {timeout: 3000}).then(() => ok(true, 'Mark your evidence still works'), () => ok(false, 'Mark your evidence still works'));
    await page.context().close();
  }
  /* a new student with the table already saved (and no graph) sees the lesson as soon as the step opens */
  {
    const page = await mk(); await page.evaluate(() => { Store.data.teacherOK = true; renderStop(STOPS.find(s => s.id === 'electromagnets'), 'learn'); }); await page.waitForSelector('.learn-card');
    for (let k = 0; k < 4; k++) await page.locator('.learn-card .btn.primary:has-text("Next step")').click();
    await page.evaluate(() => { const LR = lrStore('electromagnets'); LR.mem['rw1'] = {tbl: {10: 4, 20: 8, 30: 12, 40: 16, 50: 20}, parts: ['the number of coils', 'how strong'], know: 'I know it.'}; Store.save(); });
    await page.evaluate(() => renderStop(STOPS.find(s => s.id === 'electromagnets'), 'learn')); await page.waitForSelector('.learn-card');
    for (let k = 0; k < 4; k++) await page.locator('.learn-card .btn.primary:has-text("Next step")').click();
    ok(await page.locator('.rw-teach').count() === 1 && await page.locator('.learn-card.step-done').count() === 0, 'a saved full table shows the lesson, and the step waits for the graph');
    await page.context().close();
  }

  /* ---------- 7. a phone: 390 px wide ---------- */
  {
    const page = await mk(390, 800); const wide = async () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await openReview(page, 'electromagnets'); const card = cardOf(page, 'electromagnets'), root = card.locator('.gm'); await root.scrollIntoViewIfNeeded();
    ok(await wide() <= 1, 'Check graph card: no sideways scroll at 390 px (' + await wide() + ')');
    const order = await root.evaluate(r => { const c = r.querySelector('.gm-canvas'), s = r.querySelector('.gm-side'); return [!!(c.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING), getComputedStyle(r).display]; }); ok(order[0] && order[1] === 'block', 'on a phone the canvas sits above the controls (one column, canvas first): ' + order);
    const g = spec('electromagnets'); await GH.setup(page, root, g); await GH.plot(page, root, g); await page.screenshot({path: path.join(SHOTS, 'phone-check.png')});
    await root.locator('.gm-canvas').evaluate(e => { e.scrollIntoView({block: 'start', behavior: 'instant'}); window.scrollBy({top: 300, behavior: 'instant'}); }); await page.waitForTimeout(900); const sticky = await root.locator('.gm-canvas').evaluate(e => e.getBoundingClientRect().top); ok(sticky >= 0 && sticky < 120, 'the canvas stays on screen while the controls scroll: top ' + Math.round(sticky));
    await check(card); ok(await marksOf(card) === '11111' && await wide() <= 1, 'a full graph made with drags at 390 px earns 5, no sideways scroll');
    ok(await page.evaluate(() => { const c = document.querySelector('.gm-cv').getBoundingClientRect(); return c.width <= 390 && c.width > 300; }), 'the canvas is scaled to fit');
    await page.evaluate(() => { showWorksheet(STOPS.find(s => s.id === 'electromagnets'), 'student', 'f'); }); const imgW = await page.locator('#ws-root .ws-gimg').first().evaluate(i => i.getBoundingClientRect().right); ok(imgW <= 392, 'worksheet picture fits a phone: ' + Math.round(imgW));
    await page.evaluate(() => document.getElementById('ws-root').remove());
    await openReview(page, 'power'); await page.locator('.rv-card').nth(5).locator('.gm').scrollIntoViewIfNeeded(); ok(await wide() <= 1, 'Power bar graph card: no sideways scroll at 390 px');
    await page.evaluate(() => { Store.data.teacherOK = true; renderStop(STOPS.find(s => s.id === 'electromagnets'), 'learn'); }); await page.waitForSelector('.learn-card');
    for (let k = 0; k < 4; k++) await page.locator('.learn-card .btn.primary:has-text("Next step")').click();
    await page.evaluate(() => { const LR = lrStore('electromagnets'); LR.mem['rw1'] = {tbl: {10: 4, 20: 8, 30: 12, 40: 16, 50: 20}, teach: 1, gtype: 3}; Store.save(); renderStop(STOPS.find(s => s.id === 'electromagnets'), 'learn'); }); await page.waitForSelector('.learn-card');
    for (let k = 0; k < 4; k++) await page.locator('.learn-card .btn.primary:has-text("Next step")').click();
    await page.locator('.gm').scrollIntoViewIfNeeded(); ok(await wide() <= 1, 'Learn graph step: no sideways scroll at 390 px (' + await wide() + ')');
    await page.evaluate(() => { const LR = lrStore('electromagnets'); LR.mem['rw1'].teach = undefined; Store.save(); renderStop(STOPS.find(s => s.id === 'electromagnets'), 'learn'); }); await page.waitForSelector('.learn-card');
    for (let k = 0; k < 4; k++) await page.locator('.learn-card .btn.primary:has-text("Next step")').click();
    await page.locator('.rw-teach').scrollIntoViewIfNeeded(); ok(await wide() <= 1, 'Learn lesson card: no sideways scroll at 390 px (' + await wide() + ')');
    await page.context().close();
  }

  /* ---------- 8. a student worksheet with lost marks, and the student's picture ---------- */
  {
    const page = await mk(); await openReview(page, 'generators'); const card = cardOf(page, 'generators'), root = card.locator('.gm'), g = Object.assign(spec('generators'), {y: [0, 7, 2], place: (i, r) => i === 3 ? [8, 4] : r});
    await GH.setup(page, root, g); await GH.plot(page, root, g); await check(card); const got = await marksOf(card); ok(got === '11100' || got === '11101' || got === '11110', 'lost marks: ' + got);
    await page.evaluate(() => { showWorksheet(STOPS.find(s => s.id === 'generators'), 'student', 'f'); }); await page.waitForSelector('#ws-root .ws-gimg');
    const tx = await page.locator('#ws-root .ws-gmarks').innerText(); ok(/✗ 0/.test(tx) && /✓ 1/.test(tx), 'student sheet shows ticks and crosses: ' + tx.replace(/\s+/g, ' ').slice(0, 120));
    const q = page.locator('#ws-root .ws-q', {hasText: /make a graph/i}); await q.scrollIntoViewIfNeeded(); await page.screenshot({path: path.join(SHOTS, 'worksheet-student.png')});
    await page.evaluate(() => document.getElementById('ws-root').remove());
    await page.evaluate(() => { Store.data.teacherOK = true; showWorksheet(STOPS.find(s => s.id === 'power'), 'key', 'f'); }); await page.waitForSelector('#ws-root .ws-gimg');
    await page.locator('#ws-root .ws-q', {hasText: /make a graph/i}).scrollIntoViewIfNeeded(); await page.screenshot({path: path.join(SHOTS, 'worksheet-key.png')});
    await page.evaluate(() => document.getElementById('ws-root').remove());
    await page.evaluate(() => { showWorksheet(STOPS.find(s => s.id === 'power'), 'blank', 'f'); }); await page.waitForSelector('#ws-root .ws-gimg');
    await page.locator('#ws-root .ws-q', {hasText: /make a graph/i}).scrollIntoViewIfNeeded(); await page.screenshot({path: path.join(SHOTS, 'worksheet-blank.png')});
    await page.context().close();
  }

  /* ---------- 9. the time test and retrieval never draw a graph question; strand wording ---------- */
  {
    const page = await mk(); const r = await page.evaluate(() => ({self: SELF('graph'), order: STRAND_ORDER.join(), ci: STRAND_WORDING.Ci, types: RTYPES.graph, lbl: strandsLabel(['Ci', 'Cii', 'Ai']), mins: STOPS.filter(s => ['electromagnets', 'generators', 'power'].includes(s.id)).map(s => [s.id, s.learnMins, s.reviewMins].join(':')).join(), tt: (() => { let n = 0; for (let i = 0; i < 60; i++){ const t = rtBuildTimeTest('G' + i, {challenge: null}); t.items.forEach(it => { if (it.t === 'graph') n++; }); } return n; })() }));
    ok(r.self && r.order === 'Ai,Aii,Aiii,Ci,Cii,Ciii,Di,Dii,Diii' && r.ci === 'present collected and transformed data' && r.types === 'Make a graph' && r.lbl === 'A i · C i, ii', 'SELF, strand order and wording: ' + JSON.stringify(r));
    ok(r.mins === 'electromagnets:23:15,generators:23:16,power:17:16', 'minutes: ' + r.mins); ok(r.tt === 0, 'the Time Test never draws a graph question (' + r.tt + ')');
    await page.context().close();
  }

  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  await browser.close();
  console.log('screenshots in ' + SHOTS);
  console.log(`test-graph-maker: ${passes} passed, ${fails} failed`); process.exit(fails ? 1 : 0);
})();
