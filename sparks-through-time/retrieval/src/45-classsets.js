/* 45-classsets.js: the 12 class review sets (S01 to S12), custom codes, the projector view, the student view and the A5 slips.
   Needs 01-data.js (RT_SETS), 10-families.js, 20-paragraph.js, 25-review.js (rtRvWord), 40-timetest.js (rtAskTeacherCode, rtTtOverlay, rtTtCss) and the sim's asGrid, gridOptions, teacherMode, renderTeacher. */

const RT_CS_ORDER = ['launch', 'atom', 'static', 'circuits', 'electromagnets', 'ohm', 'generators', 'bulb', 'series', 'acdc', 'power', 'future'];
const RT_CS_MATHS = ['F3', 'F7', 'F10', 'F13', 'F23'];
const RT_CS_MARKS = [1, 2, 2, 2];
const rtCsEsc = t => String(t == null ? '' : t).replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));
const rtCsTopic = t => t === 'cond' ? 'ohm' : t;
function rtCsTopicName(t){ if (t === 'skill') return 'Investigation skill'; const s = STOPS.find(x => x.id === rtCsTopic(t)); return s ? s.topic : t; }

/* ---------- finding a set ---------- */
function rtCsMakeCode(ids){
  let mask = 0; RT_CS_ORDER.forEach((id, i) => { if (ids.includes(id)) mask |= 1 << i; });
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = mask.toString(36).toUpperCase().padStart(3, '0');
  for (let i = 0; i < 3; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}
/* turn a review item into plain text for the projector and the slips */
function rtCsConv(it, r){
  const o = {q: it.q, a: '', opts: null, vis: it.vis || null, topic: it.topic};
  if (it.t === 'mcq'){ o.opts = it.options.slice(); o.a = it.options[it.answer]; }
  else if (it.t === 'multi'){ o.opts = it.options.slice(); o.q += ' (Pick all that apply.)'; o.a = it.answers.map(k => it.options[k]).join('; '); }
  else if (it.t === 'num'){ o.a = String(it.answer) + (it.unit ? ' ' + it.unit : ''); }
  else if (it.t === 'fill'){ o.q = it.q + '<br>' + it.text.replace(/___/g, '______'); o.a = it.blanks.map(b => b[0]).join(', '); }
  else if (it.t === 'match'){
    const g = asGrid(it), ans = g.rows.map(rw => rw.ans[0]), uniq = ans.filter((x, i) => ans.indexOf(x) === i); let order = uniq, n = 0;
    do { order = rtShuf(r, uniq); n++; } while (n < 40 && ans.some((x, i) => order.indexOf(x) === i));
    o.q = it.q + '<br>' + g.rows.map((rw, i) => `${i + 1}. ${rw.label}`).join('<br>'); o.opts = order;
    o.a = g.rows.map((rw, i) => (i + 1) + 'ABCDEFGH'[order.indexOf(rw.ans[0])]).join(', ');
  }
  else if (it.t === 'table' || it.t === 'sort'){
    const g = asGrid(it); o.q = it.q + '<br>' + g.rows.map(rw => `${rw.label}: ______`).join('<br>');
    o.a = g.rows.map(rw => rw.label + ': ' + rw.ans.join(', ')).join('; ');
    const ch = gridOptions(g, 0); if (ch && ch.length) o.q += '<br><i>Choose from: ' + ch.join(', ') + '</i>';
  }
  else if (it.t === 'order'){
    const idx = rtShuf(r, it.items.map((_, i) => i)); o.q = it.q + '<br>' + idx.map((k, i) => `${'ABCDEFGH'[i]}. ${it.items[k]}`).join('<br>');
    o.a = it.items.map((_, p) => 'ABCDEFGH'[idx.indexOf(p)]).join(', ');
  }
  else o.a = it.explain || '';
  return o;
}
function rtCsCustom(code){
  const mask = parseInt(code.slice(0, 3), 36);
  let ids = RT_CS_ORDER.filter((id, i) => mask > 0 && mask < 4096 && ((mask >> i) & 1)); if (!ids.length) ids = RT_CS_ORDER.slice();
  const r = rtRng('cs' + code), used = new Set(), cnt = {}, fn = id => (RT_FAMILIES.find(f => f.id === id) || {}).n;
  const gen = (id, dirs) => { const dir = rtPick(r, dirs); let it; try { it = rtGen(id, dir, r, {}); } catch (e) { it = rtGen(id, 'A', r, {}); } used.add(it.fam); return it; };
  const pickFam = (key, only) => {
    const c = ids.filter(t => (cnt[t] || 0) < 2 && RT_SLOTS[t][key].some(([id]) => !only || only.includes(fn(id))));
    const t = c.length ? rtPick(r, c) : null; if (!t) return null;
    const l = RT_SLOTS[t][key].filter(([id]) => !only || only.includes(fn(id))); const [id, dir] = rtPick(r, l);
    cnt[t] = (cnt[t] || 0) + 1; const it = gen(id, [dir]); it.topic = t; return it;
  };
  let q3 = pickFam('calc', RT_CS_MATHS); if (!q3){ q3 = gen('atom-numbers', ['A', 'B']); q3.topic = 'atom'; cnt.atom = (cnt.atom || 0) + 1; }
  const q4 = pickFam('predict') || gen('charge-rules', ['B']);
  const wc = ids.filter(t => (cnt[t] || 0) < 2 && t !== q3.topic).concat(ids.filter(t => (cnt[t] || 0) < 2)), wt = wc.length ? wc[0] : ids[0];
  const q1 = rtRvWord(r, wt) || rtRvWord(r, 'atom'); q1.topic = q1.topic || wt;
  const q2 = gen('think-like-a-scientist', ['A', 'B']);
  const qs = [q1, q2, q3, q4].map((it, i) => { const o = rtCsConv(it, r); o.topic = i === 1 ? 'skill' : it.topic; o.form = it.t; return o; });
  const task = rtParagraphTask(r() < 0.5 ? 'C' : 'D', ids, r, {}) || rtParagraphTask(null, [], r, {});
  return {code, custom: true, before: 'Custom code', topics: ids, marks: 11, mins: 12, qs, task};
}
function rtFindSet(code){
  const c = String(code == null ? '' : code).trim().toUpperCase();
  if (/^S(0[1-9]|1[0-2])$/.test(c)){
    const s = RT_SETS.find(x => x.code === c); if (!s) return null;
    const task = rtParagraphTask(null, [], rtRng('cs' + c), {pin: {n: s.para.n, promptLabel: s.para.prompt}});
    return {code: c, custom: false, before: s.before, topics: s.topics.map(rtCsTopic), marks: 11, mins: 12,
      qs: s.qs.map(q => ({q: rtCsEsc(q.q), a: rtCsEsc(q.a), form: q.form, topic: rtCsTopic(q.topic), opts: null, vis: null})), task};
  }
  if (/^[A-Z0-9]{6}$/.test(c)) return rtCsCustom(c);
  return null;
}

/* ---------- css ---------- */
function rtCsCss(){
  if (document.getElementById('rtCsCss')) return;
  const s = document.createElement('style'); s.id = 'rtCsCss';
  s.textContent = `
.rt-proj{position:fixed; inset:0; z-index:90; background:#10142a; display:flex; flex-direction:column}
.rt-stage{flex:1; position:relative; overflow:hidden; min-height:0}
.rt-sq{position:absolute; left:0; top:0; width:1080px; height:1080px; transform-origin:0 0; background:#fff; color:#111; box-sizing:border-box; padding:30px 30px 44px; overflow:hidden; line-height:1.25}
.rt-grid{display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:20px; height:100%}
.rt-cell{border:3px solid #2b3568; border-radius:18px; padding:18px 24px; font-size:34px; overflow:hidden; display:flex; flex-direction:column; gap:10px; min-width:0}
.rt-cell .qn{font-weight:800; color:#2b3568; font-size:26px}
.rt-cell .opt{font-size:30px; margin:0}
.rt-cell .ans,.rt-q5 .ans{background:#dff5e6; border-radius:12px; padding:8px 14px; font-weight:700; color:#0b5d2a}
.rt-cell .ans{font-size:32px}
.rt-q5{font-size:34px; display:flex; flex-direction:column; gap:14px; height:100%}
.rt-q5 .passage{font-size:30px}
.rt-q5 table{border-collapse:collapse; font-size:30px} .rt-q5 th,.rt-q5 td{border:2px solid #2b3568; padding:6px 14px}
.rt-q5 svg{max-height:430px; width:auto; max-width:100%; align-self:center}
.rt-q5 .ans{font-size:26px}
.rt-code{position:absolute; right:16px; bottom:8px; font-size:18px; color:#667}
.rt-pctrl{display:flex; gap:10px; justify-content:center; align-items:center; padding:8px; flex-wrap:wrap; background:#1b2040; color:#fff}
.rt-cs{max-width:820px; margin:0 auto}
.rt-cs input[type=text]{font:inherit; width:100%; box-sizing:border-box; padding:8px 10px; border-radius:8px; border:1px solid var(--line); background:var(--panel); color:var(--ink)}
.rt-cs .row{flex-wrap:wrap}
.rt-cs .rt-optl{margin:4px 0 4px 1.2em; padding:0}
.rt-tsec .rt-set{display:grid; grid-template-columns:4.2em minmax(0,1fr); gap:4px 10px; padding:8px 0; border-top:1px solid var(--line); min-width:0}
.rt-tsec .rt-set > div{min-width:0; overflow-wrap:anywhere}
.rt-tsec .rt-set small{display:block; color:var(--muted)}
.rt-tsec .rt-topics{display:flex; gap:6px; flex-wrap:wrap}
.rt-tsec .rt-topics label{display:flex; gap:4px; align-items:center; border:1px solid var(--line); border-radius:8px; padding:3px 8px; font-size:.9rem}
.rt-tsec .row{flex-wrap:wrap}
.rt-slips{background:#fff; color:#000; max-width:718px; margin:0 auto; filter:grayscale(1)}
.rt-slippage{break-after:page; page-break-after:always}
.rt-slippage:last-child{break-after:auto; page-break-after:auto}
.rt-slip{height:132mm; box-sizing:border-box; border-bottom:1px dashed #000; padding:5mm 6mm; overflow:hidden; font-size:11pt; line-height:1.3}
.rt-slip p{margin:3px 0} .rt-slip .rt-aline{border-bottom:1px solid #000; height:7mm}
.rt-slip svg{max-height:50mm; width:auto; max-width:100%}
.rt-slip table{border-collapse:collapse} .rt-slip th,.rt-slip td{border:1px solid #000; padding:1px 6px}
`;
  document.head.appendChild(s);
}

/* ---------- projector ---------- */
function rtCsQHtml(q, n, showAns){
  const c = h('div', {class: 'rt-cell', 'data-q': n}, h('div', {class: 'qn'}, `Q${n} · ${RT_CS_MARKS[n - 1]} mark${RT_CS_MARKS[n - 1] > 1 ? 's' : ''}`), h('div', {html: q.q}));
  if (q.vis){ const v = h('div', {}); q.vis(v); c.append(v); }
  if (q.opts) q.opts.forEach((o, i) => c.append(h('p', {class: 'opt', html: 'ABCDEFGH'[i] + '. ' + o})));
  if (showAns) c.append(h('div', {class: 'ans', html: q.a}));
  return c;
}
function rtCsProject(set, opts){
  rtCsCss(); rtTtCss();
  let screen = 1, showing = false;
  const ov = h('div', {class: 'rt-proj', id: 'rtProj', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Class review ' + set.code});
  const stage = h('div', {class: 'rt-stage'}), sq = h('div', {class: 'rt-sq', id: 'rtSq'}), ctrl = h('div', {class: 'rt-pctrl'});
  stage.append(sq); ov.append(stage, ctrl);
  const fit = () => { const w = stage.clientWidth, hh = stage.clientHeight, s = Math.max(0.05, Math.min(w, hh) / 1080); sq.style.transform = `scale(${s})`; sq.style.left = ((w - 1080 * s) / 2) + 'px'; sq.style.top = ((hh - 1080 * s) / 2) + 'px'; };
  const close = () => { window.removeEventListener('resize', fit); ov.remove(); if (document.fullscreenElement && document.exitFullscreen) { try { document.exitFullscreen(); } catch (e) {} } (opts.back || (() => (teacherMode() ? renderTeacher() : renderHome())))(); };
  const draw = () => {
    sq.innerHTML = '';
    if (screen === 1){
      const g = h('div', {class: 'rt-grid'}); set.qs.forEach((q, i) => g.append(rtCsQHtml(q, i + 1, showing))); sq.append(g);
    } else {
      const t = set.task, b = h('div', {class: 'rt-q5', 'data-screen': 2});
      b.append(h('div', {class: 'qn', style: {fontWeight: 800, color: '#2b3568', fontSize: '26px'}}, `Q5 · ${t.title} · 4 marks`), h('div', {style: {fontWeight: 700}}, t.prompt));
      if (t.passage) b.append(h('div', {class: 'passage'}, h('b', {}, t.passage.title + '. '), t.passage.text));
      if (t.data){
        if (t.showTable) b.append(h('table', {}, h('thead', {}, h('tr', {}, t.data.head.map(x => h('th', {}, x)))), h('tbody', {}, t.data.rows.map(row => h('tr', {}, row.map(x => h('td', {}, x)))))));
        if (t.data.note) b.append(h('div', {class: 'passage'}, t.data.note));
        if (t.graph) rtGraph(b, t.graph);
      }
      if (showing) b.append(h('div', {class: 'ans'}, h('b', {}, 'Model answer: '), t.model), h('div', {class: 'ans'}, h('b', {}, 'Ticks: '), t.ticks.join(' · ')));
      sq.append(b);
    }
    sq.append(h('div', {class: 'rt-code'}, `Class code ${set.code}`));
    ctrl.innerHTML = '';
    ctrl.append(h('button', {class: 'btn small', type: 'button', id: 'rtProjBack', style: {color: '#1a2140', background: '#fff'}, disabled: screen === 1, onclick: () => { screen = 1; showing = false; draw(); }}, '← Back'),
      h('span', {}, `Screen ${screen} of 2`),
      h('button', {class: 'btn small', type: 'button', id: 'rtProjNext', style: {color: '#1a2140', background: '#fff'}, disabled: screen === 2, onclick: () => { screen = 2; showing = false; draw(); }}, 'Next →'),
      h('button', {class: 'btn small primary', type: 'button', id: 'rtProjAns', onclick: () => {
        if (showing){ showing = false; draw(); return; }
        if (teacherMode()){ showing = true; draw(); } else rtAskTeacherCode(() => { showing = true; draw(); });
      }}, showing ? 'Hide answers' : (teacherMode() ? '' : '🔒 ') + 'Show answers'),
      h('button', {class: 'btn small ghost', type: 'button', id: 'rtProjStudent', onclick: () => { ov.remove(); window.removeEventListener('resize', fit); renderRtClassSet(set.code, {view: 'student', back: opts.back}); }}, 'Student view'),
      h('button', {class: 'btn small ghost', type: 'button', id: 'rtProjClose', onclick: close}, 'Close'));
    fit();
  };
  window.addEventListener('resize', fit);
  document.body.append(ov); draw();
  if (opts.full && ov.requestFullscreen) { try { ov.requestFullscreen().catch(() => {}); } catch (e) {} }
}

/* ---------- student view ---------- */
function rtCsStudent(set, opts){
  rtCsCss(); rtTtCss(); if (typeof rtRvCss === 'function') rtRvCss();
  document.body.classList.remove('wide', 'story-focus');
  const root = app(); root.innerHTML = ''; window.scrollTo(0, 0);
  const got = [null, null, null, null], para = {pts: null}, bar = h('div', {class: 'rt-rv-bar', role: 'status'});
  const upd = () => {
    const pts = got.reduce((s, g, i) => s + (g ? RT_CS_MARKS[i] : 0), 0) + (para.pts || 0), n = got.filter(g => g !== null).length + (para.pts !== null ? 1 : 0);
    bar.innerHTML = ''; bar.append(h('span', {id: 'rtCsPts'}, `Marks so far: ${pts} out of ${set.marks}`), h('span', {}, `${n} of 5 done`));
  };
  const box = h('div', {class: 'rt-fc rt-rv rt-cs'}, h('button', {class: 'btn small back', type: 'button', onclick: () => (opts.back || renderHome)()}, '← Back'),
    h('h2', {}, 'Class review'), h('p', {class: 'legend'}, `Code ${set.code} · ${set.marks} marks · approx. ${set.mins} minutes. Nothing you type here is sent anywhere.`), bar);
  set.qs.forEach((q, i) => {
    const n = i + 1, card = h('div', {class: 'rv-card', 'data-q': n}), inp = h('input', {type: 'text', 'aria-label': 'Your answer to question ' + n, placeholder: 'Type your answer', autocomplete: 'off'});
    const after = h('div', {}), btn = h('button', {class: 'btn small primary', type: 'button', 'data-show': n}, 'Show the answer');
    card.append(h('div', {class: 'rv-head'}, h('span', {class: 'rv-num'}, n), h('span', {class: 'rv-type'}, `${RT_CS_MARKS[i]} mark${RT_CS_MARKS[i] > 1 ? 's' : ''}`)), h('p', {class: 'quiz-q', html: q.q}));
    if (q.vis){ const v = h('div', {class: 'rv-vis'}); q.vis(v); card.append(v); }
    if (q.opts) card.append(h('ul', {class: 'rt-optl'}, q.opts.map((o, k) => h('li', {html: 'ABCDEFGH'[k] + '. ' + o}))));
    card.append(inp, h('div', {class: 'row'}, btn), after);
    btn.addEventListener('click', () => {
      btn.disabled = true; inp.disabled = true;
      const mark = ok => { got[i] = ok; after.querySelectorAll('button').forEach(b => { b.disabled = true; }); after.append(h('p', {class: 'legend'}, ok ? 'Marked right.' : 'Marked not yet. Have another look at this idea.')); card.classList.add('done'); upd(); };
      after.append(h('div', {class: 'rt-model'}, h('h4', {}, 'Answer'), h('p', {html: q.a})), h('p', {}, 'How did you do?'),
        h('div', {class: 'row'}, h('button', {class: 'btn small', type: 'button', 'data-mark': 'right', onclick: () => mark(true)}, 'Right'), h('button', {class: 'btn small', type: 'button', 'data-mark': 'notyet', onclick: () => mark(false)}, 'Not yet')));
    });
    box.append(card);
  });
  const wrap = h('div', {class: 'rt-q', 'data-q': 5}); box.append(wrap);
  if (set.task) rtParagraphCard(wrap, set.task, 5, null, v => { para.pts = v.pts || 0; upd(); });
  box.append(h('div', {class: 'row'}, h('button', {class: 'btn small ghost', type: 'button', onclick: () => (opts.back || renderHome)()}, 'Back')));
  root.append(box); upd();
}

function renderRtClassSet(code, opts){
  opts = opts || {}; rtCsCss();
  const set = rtFindSet(code);
  if (!set){
    const root = app(); root.innerHTML = '';
    root.append(h('div', {class: 'rt-fc rt-cs'}, h('h2', {}, 'Code not found'), h('p', {}, 'That code was not found. Check it and try again.'), h('button', {class: 'btn', type: 'button', onclick: renderHome}, 'Back')));
    return;
  }
  try { const rt = rtTtRt(); rt.lastSet = set.code; Store.save(); } catch (e) {}
  const view = opts.view || (teacherMode() ? 'project' : 'student');
  if (view === 'project') rtCsProject(set, opts); else rtCsStudent(set, opts);
}

/* ---------- A5 slips: Q1 to Q4 on the front, Q5 on the back, no answers ---------- */
function rtCsSlipFront(set){
  const s = h('div', {class: 'rt-slip'}, h('p', {}, h('b', {}, 'Class review · code ' + set.code), '    Name: ______________________    Date: __________'));
  set.qs.forEach((q, i) => {
    s.append(h('p', {html: `<b>${i + 1}.</b> ${q.q} <i>(${RT_CS_MARKS[i]})</i>`}));
    if (q.opts) q.opts.forEach((o, k) => s.append(h('p', {html: '&nbsp;&nbsp;' + 'ABCDEFGH'[k] + '. ' + o})));
    s.append(h('div', {class: 'rt-aline'}));
  });
  return s;
}
function rtCsSlipBack(set){
  const t = set.task, s = h('div', {class: 'rt-slip'}, h('p', {}, h('b', {}, `5. ${t.title} (4)`), '    code ' + set.code), h('p', {}, t.prompt));
  if (t.passage) s.append(h('p', {}, h('b', {}, t.passage.title + '. '), t.passage.text));
  if (t.data){
    if (t.showTable) s.append(h('table', {}, h('thead', {}, h('tr', {}, t.data.head.map(x => h('th', {}, x)))), h('tbody', {}, t.data.rows.map(row => h('tr', {}, row.map(x => h('td', {}, x)))))));
    if (t.graph) rtGraph(s, t.graph);
  }
  for (let i = 0; i < 5; i++) s.append(h('div', {class: 'rt-aline'}));
  return s;
}
function rtCsPrintSlips(code){
  const set = rtFindSet(code); if (!set) return; rtCsCss(); rtTtCss();
  const {ov, holder, close} = rtTtOverlay('Print class review ' + set.code), sheet = h('div', {class: 'rt-slips'});
  sheet.append(h('div', {class: 'rt-slippage', 'data-side': 'front'}, rtCsSlipFront(set), rtCsSlipFront(set)), h('div', {class: 'rt-slippage', 'data-side': 'back'}, rtCsSlipBack(set), rtCsSlipBack(set)));
  holder.append(sheet);
  ov.append(h('div', {class: 'ws-toolbar no-print'}, h('b', {}, `Class review ${set.code}: 2 to a page`), h('span', {class: 'legend'}, 'Print double-sided, then cut along the dashed line.'),
    h('button', {class: 'btn primary', type: 'button', 'data-act': 'print', onclick: () => printAs(cleanFileName('Class review ' + set.code + ' slips'))}, 'Print or save as PDF'), h('button', {class: 'btn', type: 'button', onclick: close}, 'Close')), holder);
  document.documentElement.setAttribute('data-theme', 'light'); document.body.classList.add('printing'); document.body.append(ov);
}

/* ---------- the card on the teacher page ---------- */
function rtTeacherSection(){
  rtCsCss(); rtTtCss();
  const open = (code, full) => renderRtClassSet(code, {view: 'project', full, back: renderTeacher});
  const setButtons = code => h('div', {class: 'row'}, h('button', {class: 'btn small', type: 'button', 'data-act': 'preview', onclick: () => open(code, false)}, 'Preview'),
    h('button', {class: 'btn small', type: 'button', 'data-act': 'project', onclick: () => open(code, true)}, 'Project'),
    h('button', {class: 'btn small', type: 'button', 'data-act': 'slips', onclick: () => rtCsPrintSlips(code)}, 'Print 2 to a page'));
  const card = h('section', {class: 'card rt-tsec', id: 'rtTeacher'}, h('h2', {}, 'Class review sets and the Time Test'),
    h('p', {class: 'legend'}, 'Each set has 5 questions, 11 marks and takes approx. 12 minutes. A code works the same way in class or on a student’s device. Answers on the projector sit behind the teacher code.'),
    h('h3', {}, 'The 12 class sets'));
  RT_SETS.forEach(s => {
    const names = s.topics.map(rtCsTopicName);
    card.append(h('div', {class: 'rt-set', 'data-set': s.code}, h('b', {}, s.code), h('div', {}, h('b', {}, 'Before ' + s.before), h('small', {}, names.length > 4 ? names.length + ' topics: ' + names.join(', ') : names.join(', ')), setButtons(s.code))));
  });
  /* custom code */
  const ticks = new Set(), boxes = h('div', {class: 'rt-topics'}), out = h('div', {id: 'rtCustomOut'});
  RT_CS_ORDER.forEach(id => { const cb = h('input', {type: 'checkbox', 'aria-label': rtCsTopicName(id)}); cb.addEventListener('change', () => { cb.checked ? ticks.add(id) : ticks.delete(id); });
    boxes.append(h('label', {}, cb, rtCsTopicName(id))); });
  card.append(h('h3', {}, 'Make a custom code'), h('p', {class: 'legend'}, 'Tick the topics you have taught. The code holds your topics, so it gives the same questions every time.'), boxes,
    h('div', {class: 'row'}, h('button', {class: 'btn small primary', type: 'button', id: 'rtMakeCode', onclick: () => {
      const code = rtCsMakeCode(ticks.size ? [...ticks] : RT_CS_ORDER); out.innerHTML = '';
      out.append(h('p', {}, 'Your code: ', h('b', {class: 'rt-newcode', style: {fontSize: '1.4rem', letterSpacing: '.1em'}}, code)), setButtons(code));
    }}, 'Make a code')), out);
  /* class Time Test */
  const tOut = h('div', {id: 'rtTtOut'}), tIn = h('input', {type: 'text', 'aria-label': 'Existing Time Test code', placeholder: 'Or type a code', maxlength: 6, style: {textTransform: 'uppercase', maxWidth: '12em'}});
  const showTt = code => {
    tOut.innerHTML = '';
    tOut.append(h('p', {}, 'Time Test code: ', h('b', {class: 'rt-ttcode', style: {fontSize: '1.4rem', letterSpacing: '.1em'}}, code)),
      h('div', {class: 'row'}, h('button', {class: 'btn small', type: 'button', 'data-act': 'tt-student', onclick: () => rtPrintTimeTest(code, 'student')}, 'Student paper'),
        h('button', {class: 'btn small', type: 'button', 'data-act': 'tt-key', onclick: () => rtPrintTimeTest(code, 'key')}, (teacherMode() ? '' : '🔒 ') + 'Answer key')));
  };
  card.append(h('h3', {}, 'Print a class Time Test'), h('p', {class: 'legend'}, 'The same paper for the whole class: 56 marks, approx. 45 minutes. The student paper and the key use the same code. The key needs the teacher code.'),
    h('div', {class: 'row'}, h('button', {class: 'btn small primary', type: 'button', id: 'rtMakeTt', onclick: () => showTt(rtTtNewSeed())}, 'Make a test code'), tIn,
      h('button', {class: 'btn small', type: 'button', onclick: () => { const c = tIn.value.trim().toUpperCase(); if (/^[A-Z0-9]{6}$/.test(c)) showTt(c); }}, 'Use this code')), tOut);
  return card;
}
