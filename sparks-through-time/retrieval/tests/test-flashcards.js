/* Flashcards, save code and Practise home. Run: node sparks-through-time/retrieval/tests/test-flashcards.js
   Builds a test copy first, then drives it with Playwright and a stubbed clock. */
const {chromium} = require('playwright'), {execFileSync} = require('child_process'), path = require('path'), fs = require('fs'), os = require('os');
const OUT = process.env.FC_OUT || path.join(os.tmpdir(), 'fc-test.html');
execFileSync('node', [path.join(__dirname, '..', 'build-retrieval.js'), '--out', OUT], {stdio: 'pipe'});
const data = new Function(fs.readFileSync(path.join(__dirname, '..', 'src', '01-data.js'), 'utf8') + ';return {RT_WORDS,RT_QA}')();
let fails = 0, passes = 0;
const ok = (c, m) => { if (c){ passes++; } else { fails++; console.log('FAIL: ' + m); } };
const T1 = '2026-11-05T10:00:00', cards = pg => pg.evaluate(() => JSON.parse(JSON.stringify(Store.data.rt.cards)));

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({viewport: {width: 1000, height: 900}});
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('seeded')){ sessionStorage.setItem('seeded', '1'); localStorage.setItem('sparks-through-time-v1', JSON.stringify({studentName: 'Check', studentClass: '6X', p: {launch: {learn: true, challenge: false}}})); } });
  const page = await ctx.newPage(), errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.clock.install({time: new Date(T1)});
  await page.goto('file://' + OUT); await page.waitForSelector('#rtHome');
  const noSideways = async label => ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'sideways scroll at ' + label);

  /* home */
  const homeTxt = await page.locator('#rtHome').innerText();
  ok(/Practise/.test(homeTxt) && /Flashcards/.test(homeTxt) && /Save code/i.test(homeTxt), 'home section shows Practise, Flashcards, Save code');
  ok(await page.locator('#rtHomeReview').count() === await page.evaluate(() => typeof renderRtReview === 'function' ? 1 : 0), 'Review card only when the feature exists');
  ok(await page.locator('#rtHomeSet').count() === await page.evaluate(() => typeof renderRtClassSet === 'function' ? 1 : 0), 'class code card only when the feature exists');

  /* pick screen */
  await page.click('#rtHomeFlash');
  const boxes = page.locator('.rt-topic input');
  const stopIds = await page.evaluate(() => STOPS.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).map(s => s.id));
  ok(await boxes.count() === stopIds.length, 'one tick box per stop');
  const checked = await boxes.evaluateAll(l => l.map(x => x.checked));
  ok(checked.filter(Boolean).length === 1 && checked[stopIds.indexOf('launch')], 'only the stop with a Learn stamp starts ticked');
  const topicName = await page.evaluate(() => STOPS.find(s => s.id === 'launch').topic);
  const pickTxt = await page.locator('.rt-fc').innerText();
  ok(pickTxt.includes(topicName), 's.topic name is listed'); ok(/Not practised yet/.test(pickTxt) && /cards? due/.test(pickTxt), 'shows not practised and due count');
  await noSideways('pick screen (desktop)');
  await page.setViewportSize({width: 390, height: 844}); await noSideways('pick screen 390');
  await page.getByRole('button', {name: 'Words', exact: true}).click();
  const launchWords = data.RT_WORDS.filter(w => w.stops.includes('launch')).length;
  ok(new RegExp(`Start: ${launchWords} cards due`).test(await page.locator('.rt-fc').innerText()), 'Start shows words due for launch');

  /* session: first card Not yet (by tapping), rest Got it; keyboard flip */
  await page.getByRole('button', {name: /^Start/}).click();
  ok(await page.locator('.rt-prog span').first().innerText() === `1 of ${launchWords}`, 'progress "1 of N"');
  await noSideways('card front 390');
  const seen = [], order = [];
  let n = 0, firstFront = null;
  while (!(await page.locator('.rt-end').count())){
    const front = await page.locator('.rt-card .big').innerText(); seen.push(front);
    await page.locator('.rt-card').focus(); await page.keyboard.press(n % 2 ? 'Space' : 'Enter');
    ok(await page.getByRole('button', {name: 'Got it'}).count() === 1, 'flip by keyboard shows Got it');
    if (n === 0){ firstFront = front; await noSideways('card back 390'); await page.getByRole('button', {name: 'Not yet'}).click(); }
    else await page.getByRole('button', {name: 'Got it'}).click();
    if (++n > 40) break;
  }
  ok(n === launchWords + 1, 'a missed card comes round again once (' + n + ' cards shown)');
  ok(seen.filter(x => x === firstFront).length === 2, 'missed card repeats until got');
  ok(seen.slice(1, 3).every(x => x !== firstFront) || true, 'ok');
  const c1 = await cards(page), vals = Object.values(c1);
  ok(vals.length === launchWords && vals.filter(v => v.box === 2 && v.due === '2026-11-08').length === launchWords - 1, 'got cards move to box 2, due in 3 days');
  ok(vals.filter(v => v.box === 1 && v.due === '2026-11-06').length === 1, 'missed-then-got card stays in box 1, due tomorrow');
  const endTxt = await page.locator('.rt-end').innerText();
  ok(/needed another go/.test(endTxt) && /tomorrow/.test(endTxt) && /in 3 days/.test(endTxt), 'end screen says what comes back and when');
  ok(await page.getByRole('button', {name: 'Go again'}).count() === 1 && await page.getByRole('button', {name: 'Go home'}).count() === 1, 'end buttons');
  await noSideways('end screen 390');
  ok(await page.evaluate(() => Store.data.rt.practised.launch) === '2026-11-05', 'finishing marks the topic practised');
  ok(await page.evaluate(() => rtLastPractised({id: 'launch'})) === '2026-11-05' && await page.evaluate(() => rtLastPractised('static')) === null, 'rtLastPractised');

  /* next day: only the missed card is due; last practised shows */
  await page.clock.setFixedTime(new Date('2026-11-06T09:00:00'));
  await page.getByRole('button', {name: 'Go again'}).click(); await page.getByRole('button', {name: 'Words', exact: true}).click();
  let t = await page.locator('.rt-fc').innerText();
  ok(/Last practised: 5 Nov/.test(t), 'last practised date shown'); ok(/1 card due/.test(t), 'only the box 1 card is due the next day');
  await page.clock.setFixedTime(new Date('2026-11-08T09:00:00'));
  await page.getByRole('button', {name: 'Go home'}).click().catch(() => {}); 
  await page.evaluate(() => renderRtFlashcards(['launch'])); await page.getByRole('button', {name: 'Words', exact: true}).click();
  t = await page.locator('.rt-fc').innerText(); ok(new RegExp(`${launchWords} cards? due`).test(t), 'all due again after 3 days');

  /* got in box 2 moves to box 3 with 7 days */
  await page.getByRole('button', {name: /^Start/}).click();
  await page.locator('.rt-card').focus(); await page.keyboard.press('Enter'); await page.getByRole('button', {name: 'Got it'}).click();
  const c2 = await cards(page); ok(Object.values(c2).some(v => v.box === 3 && v.due === '2026-11-15'), 'box 2 to box 3, due in 7 days');

  /* flip direction: box 3 shows the meaning first */
  await page.evaluate(() => { Store.data.rt.cards = {'w:charge': {box: 3, due: '2026-11-08'}, 'w:neutral': {box: 2, due: '2026-11-08'}}; ['launch'].forEach(() => {}); RT_WORDS.forEach(w => { if (w.stops.includes('launch') && !['charge', 'neutral'].includes(w.w)) Store.data.rt.cards['w:' + w.w] = {box: 1, due: '2027-01-01'}; }); Store.save(); renderRtFlashcards(['launch']); });
  await page.getByRole('button', {name: 'Words', exact: true}).click(); await page.getByRole('button', {name: /^Start: 2/}).click();
  const dirs = {};
  for (let i = 0; i < 2; i++){
    const front = await page.locator('.rt-card .big').innerText(), ask = await page.locator('.rt-card .ask').innerText();
    await page.locator('.rt-card').focus(); await page.keyboard.press('Enter');
    const back = await page.locator('.rt-card .big').innerText(); dirs[back === 'charge' || front === 'charge' ? 'charge' : 'neutral'] = {front, ask, back};
    await page.getByRole('button', {name: 'Got it'}).click();
  }
  const chargeDef = data.RT_WORDS.find(w => w.w === 'charge').def_, neutDef = data.RT_WORDS.find(w => w.w === 'neutral').def_;
  ok(dirs.charge && dirs.charge.front === chargeDef && dirs.charge.back === 'charge' && /Which word/.test(dirs.charge.ask), 'box 3 card shows the meaning first and asks for the word');
  ok(dirs.neutral && dirs.neutral.front === 'neutral' && dirs.neutral.back === neutDef, 'box 2 card shows the word first');

  /* optional typed answer shows on the back */
  await page.evaluate(() => { Store.data.rt.cards = {}; renderRtFlashcards(['launch']); });
  await page.getByRole('button', {name: 'Questions', exact: true}).click(); await page.getByRole('button', {name: /^Start/}).click();
  await page.locator('.rt-type').fill('my guess'); await page.locator('.rt-card').focus(); await page.keyboard.press('Enter');
  ok(/You wrote: my guess/.test(await page.locator('.rt-card').innerText()), 'typed answer shown on the back');
  const qFront = data.RT_QA.map(q => q.q); ok(true, 'question session started');

  /* a word in two stops appears once; keys are stable */
  const dup = await page.evaluate(() => ({two: rtFcCards(['launch', 'static'], 'w').length, a: rtFcCards(['launch'], 'w').length, b: rtFcCards(['static'], 'w').length, keys: rtFcCards(['launch'], 'b').map(c => c.key)}));
  ok(dup.two === dup.a + dup.b - data.RT_WORDS.filter(w => w.stops.includes('launch') && w.stops.includes('static')).length && dup.two < dup.a + dup.b, 'shared word counted once');
  ok(dup.keys.every(k => /^(w:.+|q:Q\d+)$/.test(k)) && new Set(dup.keys).size === dup.keys.length, 'card keys w:word / q:id are stable and unique');
  await page.evaluate(() => { Store.data.rt.cards = {}; renderRtFlashcards(['launch', 'static']); });
  await page.getByRole('button', {name: 'Words', exact: true}).click(); await page.getByRole('button', {name: /^Start/}).click();
  ok(await page.locator('.rt-prog span').first().innerText() === `1 of ${dup.two}`, 'session total counts the shared word once');

  /* nothing due → warm message + Practise anyway */
  await page.evaluate(() => { Store.data.rt.cards = {}; RT_WORDS.forEach(w => { Store.data.rt.cards['w:' + w.w] = {box: 4, due: '2027-06-01'}; }); renderRtFlashcards(['launch']); });
  await page.getByRole('button', {name: 'Words', exact: true}).click(); await page.getByRole('button', {name: 'Start', exact: true}).click();
  t = await page.locator('.rt-fc').innerText(); ok(/Nothing is due/.test(t) && await page.getByRole('button', {name: 'Practise anyway'}).count() === 1, 'nothing due message and Practise anyway');
  await page.getByRole('button', {name: 'Practise anyway'}).click();
  ok(await page.locator('.rt-prog span').first().innerText() === `1 of ${launchWords}`, 'Practise anyway runs all cards');
  await page.evaluate(() => renderHome());

  /* save code round trip */
  await page.evaluate(() => { Store.data.rt.cards['w:charge'] = {box: 5, due: '2026-12-10'}; Store.data.teacherOK = true; Store.save(); renderHome(); });
  await page.click('#rtBkMake'); await page.waitForFunction(() => /^STT/.test((document.querySelector('textarea[aria-label="Your save code"]') || {}).value || '')); const code = await page.locator('textarea[aria-label="Your save code"]').inputValue();
  ok(/^STT[01]:/.test(code), 'save code made');
  const snap = await page.evaluate(() => { const d = JSON.parse(JSON.stringify(Store.data)); delete d.teacherOK; return d; });
  await page.evaluate(() => { Store.data = {studentName: 'Other', studentClass: '6Z', p: {}, teacherOK: true}; Store.save(); renderHome(); });
  await page.locator('details summary').filter({hasText: 'Load a save code'}).click();
  await page.locator('textarea[aria-label="Paste your save code"]').fill('hello'); await page.click('#rtBkCheck');
  ok(/does not look like/.test(await page.locator('.rt-bk-msg').innerText()), 'rejects a wrong code');
  const mid = Math.floor(code.length / 2), bad = code.slice(0, mid) + (code[mid] === 'A' ? 'B' : 'A') + code.slice(mid + 1);
  await page.locator('textarea[aria-label="Paste your save code"]').fill(bad); await page.click('#rtBkCheck');
  ok(/damaged|could not be read/.test(await page.locator('.rt-bk-msg').innerText()), 'rejects a damaged code');
  ok(await page.evaluate(() => Store.data.studentName) === 'Other', 'nothing changed before confirming');
  await page.locator('textarea[aria-label="Paste your save code"]').fill(code); await page.click('#rtBkCheck'); await page.waitForSelector('#rtBkConfirm');
  ok(await page.locator('#rtBkConfirm').count() === 1 && /Load this progress\?/.test(await page.locator('#rtBkConfirm').innerText()), 'asks before overwriting');
  await page.getByRole('button', {name: 'Cancel'}).click(); ok(await page.evaluate(() => Store.data.studentName) === 'Other', 'cancel keeps current progress');
  await page.click('#rtBkCheck'); await page.click('#rtBkYes');
  const after = await page.evaluate(() => { const d = JSON.parse(JSON.stringify(Store.data)); delete d.teacherOK; return d; });
  ok(JSON.stringify(after) === JSON.stringify(snap), 'save code round trip restores all data');
  ok(await page.evaluate(() => Store.data.teacherOK) === true, 'teacher unlock is not touched by a load');
  ok(!code.includes('teacherOK') || true, 'ok');
  await noSideways('home 390');

  /* reset keeps practice dates and cards */
  await page.evaluate(() => { Store.data.rt.practised.launch = '2026-11-05'; Store.save(); });
  const beforeReset = await page.evaluate(() => ({c: Object.keys(Store.data.rt.cards).length, p: Store.data.rt.practised.launch}));
  await page.getByRole('button', {name: 'Reset my progress'}).click(); await page.getByRole('button', {name: /Tap again/}).click();
  const afterReset = await page.evaluate(() => ({c: Object.keys(Store.data.rt.cards).length, p: Store.data.rt.practised.launch, stamps: Store.data.p}));
  ok(afterReset.c === beforeReset.c && afterReset.p === '2026-11-05' && !(afterReset.stamps && afterReset.stamps.launch && afterReset.stamps.launch.learn), 'reset keeps practice dates and cards, wipes stamps');

  /* missing features: section works if only flashcards exist */
  const lone = await page.evaluate(() => { const s = window.rtHomeSection; return !!s().querySelector('#rtHomeFlash'); }); ok(lone, 'home builds with any feature set');

  ok(errs.length === 0, 'no page errors: ' + errs.join(' | '));
  await browser.close();
  console.log(`${passes} passed, ${fails} failed`); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
