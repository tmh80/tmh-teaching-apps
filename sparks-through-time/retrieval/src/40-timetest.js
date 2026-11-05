/* 40-timetest.js: the Time Test (56 marks, 26 questions) and its paper version.
   Needs 01-data.js, 10-families.js, 20-paragraph.js, the sim's reviewCard, wsItem, nameGate, printAs, rvItems.
   Hook needed in 90-home.js or the sim's home card: show rtTimeTestBest() (a percentage or null) instead of Store.data.testBest. */

const RT_TT_PARTS = [['launch', 'atom', 'static', 'circuits'], ['electromagnets', 'ohm', 'generators', 'bulb'], ['series', 'acdc', 'power', 'future']];
const RT_TT_CALC = ['F3', 'F7', 'F10', 'F13', 'F15', 'F19', 'F20', 'F23', 'F26', 'F30', 'F31'];
/* first and second cell for each stop; {r} = recall pool, {f, d} = family and direction. In a choice cell, calc comes first. */
const RT_TT_CELLS = {
  launch: [[{r: 1}, {f: 'F2'}], [{f: 'F1', d: 'B'}]], atom: [[{f: 'F4'}], [{f: 'F3'}]],
  static: [[{f: 'F6'}], [{f: 'F7'}, {f: 'F8'}]], circuits: [[{f: 'F11'}], [{f: 'F10'}, {f: 'F9'}]],
  electromagnets: [[{f: 'F14'}], [{f: 'F13'}, {f: 'F12'}]], ohm: [[{f: 'F17'}], [{f: 'F15'}, {f: 'F16'}]],
  generators: [[{r: 1}], [{f: 'F19'}, {f: 'F18', d: 'A'}]], bulb: [[{f: 'F21'}], [{f: 'F20'}, {f: 'F22'}]],
  series: [[{r: 1}], [{f: 'F23'}, {f: 'F24', d: 'A'}]], acdc: [[{f: 'F25'}], [{f: 'F26'}, {f: 'F27'}]],
  power: [[{f: 'F28', d: 'A'}, {f: 'F29'}], [{f: 'F30'}, {f: 'F28', d: 'B'}]], future: [[{f: 'F32', d: 'A'}], [{f: 'F31'}, {f: 'F32', d: 'B'}]]
};
const RT_TT_CHOICE = ['static', 'circuits', 'electromagnets', 'ohm', 'generators', 'bulb', 'series', 'acdc', 'power'];

function rtTtRt(){
  const d = Store.data; if (!d.rt || typeof d.rt !== 'object') d.rt = {};
  const r = d.rt; if (!r.cards) r.cards = {}; if (!r.practised) r.practised = {}; if (!Array.isArray(r.lastFams)) r.lastFams = []; if (typeof r.reviews !== 'number') r.reviews = 0;
  return r;
}
function rtTimeTestBest(){ try { const r = Store.data && Store.data.rt; return r && typeof r.ttBest === 'number' ? r.ttBest : null; } catch (e) { return null; } }
function rtTtNewSeed(){ const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }
const rtTtStop = id => STOPS.find(s => s.id === id);
const rtTtToday = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

function rtTtRecall(r, stop, ch){
  const re = RT_REUSE[stop], st = rtTtStop(stop), cand = [];
  ['f', 'c'].forEach(k => {
    if (k === 'c' && !ch) return;
    const src = re && re[k]; if (!src || !st) return;
    const list = (k === 'f' && st.reviewArchive) || rvItems(st, k);
    src.recall.concat(src.pool).forEach(p => { const it = list[p - 1]; if (it && !SELF(it.t) && it.t !== 'num') cand.push([k, p, it]); });
  });
  if (!cand.length) return null;
  const [k, p, src] = rtPick(r, cand), it = Object.assign({}, src, {topic: stop, slot: 'Recall', fam: 'R' + stop + k + p, pool: true});
  if (RT_LABELLED.some(x => x[0] === k && x[1] === stop && x[2] === p)){
    it.q = String(it.q).replace(/^[^:<]{1,40}:\s*/, ''); if (it.q && !/^</.test(it.q)) it.q = it.q.charAt(0).toUpperCase() + it.q.slice(1);
  }
  return it;
}

/* Returns {seed, challenge, marks, items:[26]}. Each item has n, part (0 to 3), topic, slot, marks; paragraphs have t:'para' and task. */
function rtBuildTimeTest(seed, opts){
  opts = opts || {};
  seed = String(seed == null ? rtTtNewSeed() : seed).toUpperCase();
  const r = rtRng('tt' + seed), ch = {};
  STOPS.forEach(s => { ch[s.id] = opts.challenge ? !!opts.challenge[s.id] : false; });
  if (!opts.challenge && opts.challenge !== null) STOPS.forEach(s => { ch[s.id] = !!(prog(s.id) && prog(s.id).challenge); });
  const k = 5 + (r() < 0.5 ? 0 : 1), calcSet = new Set(rtShuf(r, RT_TT_CHOICE).slice(0, k)), used = new Set(), items = [];
  const fam = n => RT_FAMILIES.find(f => f.n === n);
  const make = (o, stop) => {
    if (o.r){ const x = rtTtRecall(r, stop, ch[stop]); if (x) return x; o = {f: rtPick(r, RT_SLOTS[stop].apply.map(a => rtFamN(a[0])))}; }
    const f = fam(o.f), dir = o.d || (r() < 0.5 ? 'A' : 'B'); let it;
    for (let i = 0; i < 3 && !it; i++){ try { it = rtGen(f.id, dir, r, {challenge: !!ch[stop]}); } catch (e) { it = null; } }
    if (!it) it = rtGen(f.id, dir, rtRng(seed + o.f), {});
    it.topic = stop; it.slot = f.slots[dir]; used.add(it.fam); return it;
  };
  const free = list => list.filter(o => o.r || !used.has(o.f)).concat(list)[0];
  RT_TT_PARTS.forEach((stops, pi) => stops.forEach(stop => {
    const c = RT_TT_CELLS[stop]; let a = c[0], b = c[1], first, second;
    if (stop === 'power') first = calcSet.has('power') ? rtPick(r, a) : a[1];
    else first = a.length > 1 ? rtPick(r, a) : a[0];
    const x1 = make(first, stop); x1.part = pi; items.push(x1);
    const pick2 = RT_TT_CHOICE.includes(stop) ? (calcSet.has(stop) ? b[0] : b[1]) : free(b);
    second = pick2.f && used.has(pick2.f) ? free(b) : pick2;
    const x2 = make(second, stop); x2.part = pi; items.push(x2);
  }));
  /* Part D */
  const ids = STOPS.map(s => s.id);
  let c = null, d = null;
  for (let i = 0; i < 30 && !(c && d && c.topic !== d.topic); i++){
    c = rtParagraphTask('C', ids, r, {}); d = rtParagraphTask('D', ids, r, {});
  }
  items.push({t: 'para', slot: 'Data paragraph', topic: c.topic, task: c, kind: 'C', q: c.prompt, part: 3}, {t: 'para', slot: 'Reading paragraph', topic: d.topic, task: d, kind: 'D', q: d.prompt, part: 3});
  items.forEach((it, i) => { it.n = i + 1; it.marks = it.t === 'para' ? 4 : 2; });
  return {seed, challenge: ch, marks: items.reduce((s, i) => s + i.marks, 0), items};
}
const rtTtMark = (it, a) => !a ? 0 : it.t === 'para' ? Math.min(4, a.pts || 0) : (a.max ? Math.min(2, Math.round(2 * (a.pts || 0) / a.max)) : 0);

/* ---------- css ---------- */
function rtTtCss(){
  if (document.getElementById('rtTtCss')) return;
  const s = document.createElement('style'); s.id = 'rtTtCss';
  s.textContent = `
.rt-tt{max-width:820px; margin:0 auto}
.rt-tt .row{flex-wrap:wrap}
.rt-tt-facts{display:flex; gap:8px; flex-wrap:wrap; margin:8px 0}
.rt-tt-acts{display:grid; gap:10px; margin:14px 0}
.rt-tt-bar{display:grid; grid-template-columns:minmax(0,1.3fr) minmax(0,2fr) auto; gap:10px; align-items:center; margin:8px 0}
.rt-tt-bar .track{height:16px; border-radius:8px; background:var(--panel-2,#eee); border:1px solid var(--line); overflow:hidden}
.rt-tt-bar .fill{height:100%; background:var(--accent,#3b6ef5)}
.rt-tt-bar .fill.s4{background:#2a9d5c} .rt-tt-bar .fill.s2{background:#d98a1c} .rt-tt-bar .fill.s0{background:#c4473d}
.rt-tt-bar small{display:block; color:var(--muted)}
@media (max-width:620px){ .rt-tt-bar{grid-template-columns:minmax(0,1fr)} }
.rt-paper{filter:grayscale(1); color:#000; background:#fff; max-width:718px; margin:0 auto; padding:14px; font-size:13px; line-height:1.4}
.rt-paper .ws-q{border:1px solid #000; border-radius:4px; padding:8px 10px; margin:8px 0; break-inside:avoid; page-break-inside:avoid}
.rt-paper .ws-qhead{display:flex; gap:8px; align-items:center}
.rt-paper .rt-mk{margin-left:auto; font-weight:700}
.rt-paper h2,.rt-paper h3{margin:12px 0 6px}
.rt-paper .rt-ptitle{font-size:22px; font-weight:800; margin:0}
.rt-paper .rt-pmeta{display:flex; gap:16px; flex-wrap:wrap; margin:6px 0; font-weight:600}
.rt-paper .rt-foot{border-top:1px solid #000; margin-top:14px; padding-top:4px; font-size:11px; display:flex; justify-content:space-between}
.rt-paper .rt-data{break-before:page; page-break-before:always}
.rt-paper .rt-els{display:grid; grid-template-columns:repeat(5,1fr); gap:4px}
.rt-paper .rt-els div{border:1px solid #000; padding:3px 5px; font-size:11px}
.rt-paper .rt-els b{font-size:16px}
.rt-paper .ws-rule{height:22px; border-bottom:1px solid #000}
.rt-paper .ws-q svg{max-width:100%; height:auto}
.rt-ask{position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.5); display:grid; place-items:center; padding:16px}
.rt-ask > div{background:var(--panel,#fff); color:var(--ink,#111); border-radius:14px; padding:18px; max-width:420px; width:100%; display:grid; gap:10px}
.rt-ask input{font:inherit; padding:8px 10px; border-radius:8px; border:1px solid var(--line); width:100%; box-sizing:border-box}
`;
  document.head.appendChild(s);
}

/* the teacher code prompt, used for answer keys and answers on the projector */
function rtAskTeacherCode(cb, why){
  rtTtCss();
  const inp = h('input', {type: 'password', 'aria-label': 'Teacher code', autocomplete: 'off', placeholder: 'Teacher code'}), msg = h('small', {role: 'status'});
  const ov = h('div', {class: 'rt-ask no-print', role: 'dialog', 'aria-modal': 'true'});
  const go = () => {
    if (inp.value.trim().toUpperCase() === TEACHER_CODE){ Store.data.teacherOK = true; Store.save(); ov.remove(); cb(); }
    else msg.textContent = 'That code isn’t right.';
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  ov.append(h('div', {}, h('b', {}, 'Teacher code needed'), h('p', {}, why || 'Type the teacher code to see the answers.'), inp, msg,
    h('div', {class: 'row'}, h('button', {class: 'btn primary', type: 'button', id: 'rtAskGo', onclick: go}, 'Unlock'), h('button', {class: 'btn', type: 'button', onclick: () => ov.remove()}, 'Cancel'))));
  document.body.append(ov); setTimeout(() => inp.focus(), 30);
}

/* ---------- start screen ---------- */
function renderRtTimeTest(){
  rtTtCss(); if (typeof rtFcCss === 'function') rtFcCss(); if (typeof rtRvCss === 'function') rtRvCss();
  document.body.classList.remove('wide', 'story-focus');
  if (typeof setDial === 'function') setDial(2026, 'The Time Test'); if (typeof setEra === 'function') setEra(null);
  const root = app(); root.innerHTML = ''; window.scrollTo(0, 0);
  const rt = rtTtRt(), tt = rt.tt && rt.tt.seed && rt.tt.part < 4 ? rt.tt : null, best = rtTimeTestBest(), ready = rt.reviews >= 3;
  const acts = h('div', {class: 'rt-tt-acts'});
  if (tt) acts.append(h('button', {class: 'btn primary', type: 'button', id: 'rtTtCarry', onclick: () => rtTtRun()}, `Carry on with Part ${'ABCD'[tt.part]}`));
  acts.append(h('button', {class: tt ? 'btn' : 'btn primary', type: 'button', id: 'rtTtStart', onclick: () => {
    const seed = rtTtNewSeed(), t = rtBuildTimeTest(seed); rt.tt = {seed, part: 0, answers: {}, challenge: t.challenge}; Store.save(); rtTtRun();
  }}, tt ? 'Start a new test' : 'Start the Time Test'),
  h('button', {class: 'btn', type: 'button', id: 'rtTtPaper', onclick: () => rtPrintTimeTest(rtTtNewSeed(), 'student')}, 'Print as a paper test'),
  h('button', {class: 'btn small ghost', type: 'button', onclick: renderHome}, 'Back to the time machine'));
  root.append(h('div', {class: 'rt-fc rt-tt'},
    h('section', {class: 'stop-hero'}, h('span', {class: 'eyebrow'}, 'Final stop · Every era'), h('h2', {}, 'The Time Test'),
      pipSay('<p>The Time Test has questions from every stop on our journey. It takes <b>approx. 45 minutes</b> and is worth <b>56 marks</b>. You get a new test every time, so it is great practice for your test.</p>')),
    h('div', {class: 'rt-tt-facts'}, h('span', {class: 'chip'}, '56 marks'), h('span', {class: 'chip'}, 'approx. 45 minutes'), h('span', {class: 'chip'}, '26 questions'), h('span', {class: 'chip'}, '4 parts'),
      best != null ? h('span', {class: 'chip', id: 'rtTtBestChip'}, `Best ${best}%`) : null, ready ? h('span', {class: 'chip', id: 'rtTtReady'}, 'Ready when you are') : null),
    h('p', {}, 'You can stop at the end of any part and carry on later. Parts A to C have 8 short questions each, and Part D has two paragraphs. You will need a calculator for some questions.'),
    ready ? null : h('p', {class: 'legend'}, 'Tip: try three Reviews first and you will feel more ready. The Time Test is never locked, so start whenever you like.'),
    acts));
}

/* ---------- running the test ---------- */
function rtTtRun(){
  rtTtCss(); const rt = rtTtRt(), tt = rt.tt; if (!tt) return renderRtTimeTest();
  const test = rtBuildTimeTest(tt.seed, {challenge: tt.challenge || {}}), part = Math.min(tt.part, 3), mine = test.items.filter(i => i.part === part);
  const root = app(); root.innerHTML = ''; window.scrollTo(0, 0);
  const bar = h('div', {class: 'rt-rv-bar', role: 'status'}), fin = h('div', {class: 'rt-tt-acts'});
  const done = it => !!(tt.answers[it.n] && tt.answers[it.n].done);
  const upd = () => {
    const got = test.items.reduce((s, i) => s + rtTtMark(i, tt.answers[i.n]), 0), n = mine.filter(done).length;
    bar.innerHTML = ''; bar.append(h('span', {id: 'rtTtPts'}, `Part ${'ABCD'[part]} · marks so far: ${got}`), h('span', {}, `${n} of ${mine.length} done`));
    fin.innerHTML = '';
    if (n === mine.length){
      if (part < 3) fin.append(h('button', {class: 'btn primary', type: 'button', id: 'rtTtNext', onclick: () => { tt.part = part + 1; Store.save(); rtTtRun(); }}, `Go on to Part ${'ABCD'[part + 1]}`),
        h('button', {class: 'btn', type: 'button', id: 'rtTtStop', onclick: () => { tt.part = part + 1; Store.save(); renderHome(); }}, 'Stop here and carry on later'));
      else fin.append(h('button', {class: 'btn primary', type: 'button', id: 'rtTtFinish', onclick: () => rtTtFinish(test, tt)}, 'See my results'));
    }
  };
  const box = h('div', {class: 'rt-fc rt-rv rt-tt'}, h('button', {class: 'btn small back', type: 'button', onclick: renderRtTimeTest}, '← Back'), h('h2', {}, `The Time Test · Part ${'ABCD'[part]}`), bar);
  mine.forEach(it => {
    const s = rtTtStop(it.topic), wrap = h('div', {class: 'rt-q', 'data-q': it.n});
    box.append(h('div', {class: 'rt-slot'}, `Question ${it.n} · ${it.marks} marks${s && it.t !== 'para' ? ' · ' + s.topic : ''}`), wrap);
    const save = v => { tt.answers[it.n] = v; Store.save(); upd(); };
    if (it.t === 'para') rtParagraphCard(wrap, it.task, it.n, tt.answers[it.n] || null, save);
    else reviewCard(wrap, it, it.n, tt.answers[it.n] || null, save);
  });
  box.append(fin); root.append(box); upd();
}

function rtTtResults(test, ans){
  const total = test.items.reduce((s, i) => s + rtTtMark(i, ans[i.n]), 0), topics = {};
  STOPS.forEach(s => { topics[s.id] = 0; });
  test.items.forEach(i => { if (i.t !== 'para') topics[i.topic] = (topics[i.topic] || 0) + rtTtMark(i, ans[i.n]); });
  return {total, topics, pct: Math.round(total / test.marks * 100)};
}
function rtTtFinish(test, tt){
  const rt = rtTtRt(), res = rtTtResults(test, tt.answers), ans = tt.answers;
  rt.ttBest = Math.max(typeof rt.ttBest === 'number' ? rt.ttBest : 0, res.pct); rt.tt = null; Store.save();
  const root = app(); root.innerHTML = ''; window.scrollTo(0, 0);
  const box = h('div', {class: 'rt-fc rt-tt'}, h('h2', {}, 'Time Test finished'),
    h('div', {class: 'quiz-card'}, h('span', {class: 'eyebrow'}, 'Your score'), h('div', {class: 'score-big', id: 'rtTtScore'}, `${res.total} / ${test.marks}`), h('p', {}, `That is ${res.pct}%. Your best is ${rt.ttBest}%.`)),
    h('h3', {}, 'How you did on each topic'));
  STOPS.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(s => {
    const v = res.topics[s.id] || 0, lvl = v >= 4 ? 4 : v >= 2 ? 2 : 0, lab = v >= 4 ? 'Secure' : v >= 2 ? 'Nearly there' : 'Practise this';
    box.append(h('div', {class: 'rt-tt-bar', 'data-topic': s.id}, h('span', {}, h('b', {}, s.topic), h('small', {}, `${v} out of 4 · ${lab}`)),
      h('div', {class: 'track', role: 'img', 'aria-label': `${s.topic}: ${v} out of 4`}, h('div', {class: 'fill s' + lvl, style: {width: (v / 4 * 100) + '%'}})),
      v < 4 && typeof renderRtFlashcards === 'function' ? h('button', {class: 'btn small', type: 'button', 'data-practise': s.id, onclick: () => renderRtFlashcards([s.id])}, 'Practise this') : h('span', {})));
  });
  box.append(h('div', {class: 'rt-tt-acts'}, h('button', {class: 'btn primary', type: 'button', id: 'rtTtPdf', onclick: () => rtTtSheet(test, ans)}, 'Save my PDF'),
    h('button', {class: 'btn', type: 'button', id: 'rtTtAgain', onclick: renderRtTimeTest}, 'New Time Test'),
    h('button', {class: 'btn small ghost', type: 'button', onclick: renderHome}, 'Back to the time machine')));
  root.append(box);
}

/* ---------- shared sheet pieces ---------- */
function rtTtParaBlock(task, n, mode, a){
  const box = h('div', {class: 'ws-q'});
  box.append(h('div', {class: 'ws-qhead'}, h('span', {class: 'ws-n'}, n), h('span', {class: 'ws-type'}, task.title), h('span', {class: 'rt-mk'}, '(4)')), h('p', {class: 'ws-qtext'}, task.prompt));
  if (task.passage) box.append(h('p', {class: 'ws-note'}, h('b', {}, task.passage.title + '. '), task.passage.text));
  if (task.data){
    if (task.showTable) box.append(h('table', {class: 'ws-table'}, h('thead', {}, h('tr', {}, task.data.head.map(x => h('th', {}, x)))), h('tbody', {}, task.data.rows.map(row => h('tr', {}, row.map(x => h('td', {}, x)))))));
    if (task.data.note) box.append(h('p', {class: 'ws-note'}, task.data.note));
    if (task.graph) rtGraph(box, task.graph);
  }
  if (mode === 'blank') box.append(h('div', {class: 'ws-lines'}, Array.from({length: 10}, () => h('div', {class: 'ws-rule'}))));
  else {
    if (mode === 'done') box.append(h('p', {class: 'ws-note'}, h('b', {}, 'My answer:')), h('div', {class: 'ws-written'}, (a && a.text) || ''));
    box.append(h('p', {class: 'ws-note'}, h('b', {}, 'Model answer:')), h('div', {class: 'ws-written'}, task.model),
      h('p', {class: 'ws-note'}, h('b', {}, mode === 'done' ? `My ticks (${(a && a.pts) || 0} of 4): ` : 'Ticks (4): '), task.ticks.map((t, j) => ((mode === 'done' && a && a.ticks && a.ticks[j]) ? '[x] ' : '[ ] ') + t).join('   ')));
  }
  return box;
}
function rtTtPerm(it, seed){
  if (it.t !== 'mcq' && it.t !== 'multi') return it;
  const perm = rtShuf(rtRng(seed + it.q), it.options.map((_, i) => i)), c = Object.assign({}, it);
  c.options = perm.map(k => it.options[k]);
  if (it.t === 'mcq') c.answer = perm.indexOf(it.answer); else c.answers = it.answers.map(k => perm.indexOf(k));
  return c;
}

/* ---------- the PDF after finishing ---------- */
function rtTtSheetBody(test, ans){
  const name = Store.data.studentName || '', cls = Store.data.studentClass || '', res = rtTtResults(test, ans);
  const root = h('div', {class: 'ws ws-student'});
  root.append(h('div', {class: 'ws-header'}, h('div', {class: 'ws-brand'}, pipSVG(46), h('div', {}, h('div', {class: 'ws-kicker'}, 'Sparks Through Time · Time Test'), h('div', {class: 'ws-title'}, 'My Time Test')))));
  root.append(h('div', {class: 'ws-namebar'}, h('span', {}, 'Name: ', h('b', {class: 'ws-name'}, name)), h('span', {}, 'Class: ', h('b', {class: 'ws-name'}, cls)), h('span', {}, 'Date: ', rtTtToday())));
  root.append(h('p', {class: 'ws-student-note'}, 'Everything printed in blue was added by the student in the sim.'), h('p', {}, h('b', {}, `Score: ${res.total} out of ${test.marks}`)));
  test.items.forEach(it => {
    const a = ans[it.n] || {};
    if (it.t === 'para'){ root.append(rtTtParaBlock(it.task, it.n, 'done', a)); return; }
    const box = wsItem(it, it.n, 'student', a), key = wsItem(it, it.n, 'key', null);
    key.querySelectorAll('.ws-qhead, .ws-qtext, .ws-myp').forEach(x => x.remove());
    box.append(h('p', {class: 'ws-note'}, h('b', {}, `Right answer (I got ${rtTtMark(it, a)} of 2 marks):`)), key); root.append(box);
  });
  return root;
}
function rtTtOverlay(label, body){
  const prev = document.documentElement.getAttribute('data-theme');
  const ov = h('div', {id: 'ws-root', class: 'ws-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': label}), holder = h('div', {class: 'ws-holder'});
  const close = () => { ov.remove(); document.body.classList.remove('printing'); const p = document.getElementById('rtPageCss'); if (p) p.remove();
    if (prev) document.documentElement.setAttribute('data-theme', prev); else document.documentElement.removeAttribute('data-theme'); };
  return {ov, holder, close};
}
function rtTtSheet(test, ans){
  const {ov, holder, close} = rtTtOverlay('My Time Test'), make = () => rtTtSheetBody(test, ans), rebuild = () => { holder.innerHTML = ''; holder.append(make()); };
  const fileName = () => cleanFileName(`Time Test - ${rtTtToday()} - ${(Store.data.studentName || '').trim() || 'Student'}`);
  const gate = nameGate(ov, 'student', rebuild, {what: 'Time Test', fileName, makeSheet: make});
  ov.append(h('div', {class: 'ws-toolbar no-print'}, gate.fields, gate.btn, gate.printBtn, h('button', {class: 'btn', type: 'button', onclick: close}, 'Close'), gate.msg, gate.info), holder);
  document.documentElement.setAttribute('data-theme', 'light'); document.body.classList.add('printing');
  document.body.append(ov); rebuild(); gate.upd();
}

/* ---------- the paper test ---------- */
function rtTtPaper(seed, mode){
  const key = mode === 'key', test = rtBuildTimeTest(seed, {challenge: null}), code = test.seed;
  const root = h('div', {class: 'ws rt-paper', 'data-code': code});
  root.append(h('p', {class: 'rt-ptitle'}, 'Time Test' + (key ? ': answer key' : '')),
    h('div', {class: 'rt-pmeta'}, h('span', {}, 'Total: 56 marks'), h('span', {}, 'approx. 45 minutes'), h('span', {}, 'You may use a calculator.')),
    h('div', {class: 'ws-namebar'}, h('span', {}, 'Name: ', h('span', {class: 'ws-line'})), h('span', {}, 'Class: ', h('span', {class: 'ws-line short'})), h('span', {}, 'Date: ', h('span', {class: 'ws-line short'}))));
  const heads = ['Part A · Questions 1 to 8', 'Part B · Questions 9 to 16', 'Part C · Questions 17 to 24', 'Part D · Two paragraphs (4 marks each)'];
  let last = -1;
  test.items.forEach(it => {
    if (it.part !== last){ last = it.part; root.append(h('h3', {class: 'ws-part'}, heads[last])); }
    if (it.t === 'para'){ root.append(rtTtParaBlock(it.task, it.n, key ? 'key' : 'blank')); return; }
    const box = wsItem(rtTtPerm(it, code), it.n, key ? 'key' : 'blank', null);
    box.querySelectorAll('.ws-myp').forEach(x => x.remove());
    const hd = box.querySelector('.ws-qhead'); if (hd) hd.append(h('span', {class: 'rt-mk'}, '(2)'));
    root.append(box);
  });
  const data = h('div', {class: 'rt-data'}, h('h2', {}, 'Data sheet'), h('h3', {}, 'Elements'), h('div', {class: 'rt-els'}, RT_ELEMENTS.map(e =>
    h('div', {}, h('b', {}, e.sym), ' ', e.name, h('br'), 'Atomic number ' + e.p, h('br'), 'Mass number ' + e.mass))),
  h('h3', {}, 'Electron ladder (top to bottom)'), h('ol', {}, RT_LADDER.map(m => h('li', {}, m))),
  h('p', {}, 'Materials higher up lose electrons more easily. Materials lower down grab electrons more easily.'), h('h3', {}, 'V = I × R'));
  const tri = h('div', {}); rtTriangle()(tri); data.append(tri, h('p', {}, 'V is voltage in volts (V). I is current in amperes (A). R is resistance in ohms (Ω). V = I × R, I = V ÷ R and R = V ÷ I.'));
  root.append(data, h('div', {class: 'rt-foot'}, h('span', {}, 'Time Test · code ' + code + (key ? ' · key' : '')), h('span', {}, 'Page numbers print at the foot of each page')));
  return root;
}
function rtPrintTimeTest(seed, mode){
  mode = mode === 'key' ? 'key' : 'student'; rtTtCss();
  if (mode === 'key' && !(typeof teacherMode === 'function' && teacherMode())) return rtAskTeacherCode(() => rtPrintTimeTest(seed, mode), 'The answer key is for teachers. Type the teacher code.');
  const code = String(seed || rtTtNewSeed()).toUpperCase(), {ov, holder, close} = rtTtOverlay('Time Test paper');
  const name = cleanFileName(`Time Test ${code}${mode === 'key' ? ' - answer key' : ''}`);
  const pg = document.createElement('style'); pg.id = 'rtPageCss';
  pg.textContent = `@page{size:A4; margin:11mm 11mm 15mm; @bottom-left{content:"Time Test · code ${code}"; font-size:9pt} @bottom-right{content:"Page " counter(page); font-size:9pt}}`;
  document.head.appendChild(pg);
  holder.append(rtTtPaper(code, mode));
  ov.append(h('div', {class: 'ws-toolbar no-print'}, h('b', {}, `Time Test ${code} · ${mode === 'key' ? 'answer key' : 'student paper'}`),
    h('button', {class: 'btn primary', type: 'button', 'data-act': 'print', onclick: () => printAs(name)}, 'Print or save as PDF'), h('button', {class: 'btn', type: 'button', onclick: close}, 'Close')), holder);
  document.documentElement.setAttribute('data-theme', 'light'); document.body.classList.add('printing'); document.body.append(ov);
}
