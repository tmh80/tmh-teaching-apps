/* 25-review.js: the Review mode for Sparks retrieval. Six questions, easy to hard, mixed across the ticked topics.
   Needs 01-data.js, 10-families.js (rtGen, RT_SLOTS, RT_FAMILIES, rtMcq), 20-paragraph.js and the sim's reviewCard, wsItem, nameGate. */

function rtRvCss(){
  if (document.getElementById('rtRvCss')) return;
  const s = document.createElement('style'); s.id = 'rtRvCss';
  s.textContent = `
.rt-rv{max-width:820px; margin:0 auto}
.rt-rv-bar{position:sticky; top:0; z-index:5; background:var(--panel); border:2px solid var(--line); border-radius:12px; padding:8px 14px; margin:10px 0; font-weight:700; display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap}
.rt-slot{font-size:.85rem; font-weight:700; color:var(--muted); margin:16px 0 2px; text-transform:uppercase; letter-spacing:.04em}
.rt-rv-end{display:grid; gap:10px; margin:12px 0}
.rt-rv-list{margin:4px 0 4px 1.2em; padding:0}
.rt-rv .row{flex-wrap:wrap}
`;
  document.head.appendChild(s);
}
function rtRvRt(){
  const d = Store.data; if (!d.rt || typeof d.rt !== 'object') d.rt = {};
  const r = d.rt; if (!r.cards) r.cards = {}; if (!r.practised) r.practised = {}; if (!Array.isArray(r.lastFams)) r.lastFams = []; if (typeof r.reviews !== 'number') r.reviews = 0;
  return r;
}
function rtRvToday(){ if (typeof rtFcToday === 'function') return rtFcToday(); const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function rtRvWeight(id){
  const last = typeof rtLastPractised === 'function' ? rtLastPractised(id) : null;
  if (!last) return 8;
  const days = Math.max(0, (Date.parse(rtRvToday()) - Date.parse(last)) / 864e5);
  return 1 + Math.min(30, isNaN(days) ? 0 : days) / 5;
}
function rtRvDraw(r, ids){
  const w = ids.map(rtRvWeight), tot = w.reduce((a, b) => a + b, 0); let x = r() * tot;
  for (let i = 0; i < ids.length; i++){ x -= w[i]; if (x <= 0) return ids[i]; }
  return ids[ids.length - 1];
}
const rtFamN = id => (RT_FAMILIES.find(f => f.id === id) || {}).n;
const rtStopOf = id => STOPS.find(s => s.id === id);

/* ---------- the six question makers ---------- */
function rtRvWord(r, stopId){
  const ws = RT_WORDS.filter(w => w.stops.includes(stopId)), qs = RT_QA.filter(q => q.stop === stopId), kinds = [];
  if (ws.length) kinds.push('wA', 'wA', 'wB'); if (qs.length) kinds.push('qa');
  const extra = {topic: stopId, slot: 'Word', fam: 'W'};
  if (!kinds.length) return null;
  const k = rtPick(r, kinds);
  if (k === 'qa'){
    const q = rtPick(r, qs), pool = RT_QA.filter(x => x.a !== q.a).map(x => x.a);
    return rtMcq(r, q.q, q.a, rtShuf(r, pool).slice(0, 3), 'The answer is: ' + q.a, extra);
  }
  const w = rtPick(r, ws);
  if (k === 'wA'){
    if (r() < 0.45) return Object.assign({t: 'fill', q: 'Type the word that matches this meaning.', text: w.def_ + ' This is called ___.', blanks: [[w.w, w.w.toLowerCase()]],
      explain: `The word is <b>${w.w}</b>.`}, extra);
    return rtMcq(r, `Which word means: “${w.def_}”?`, w.w, rtShuf(r, RT_WORDS.filter(x => x.w !== w.w).map(x => x.w)).slice(0, 3), `The word is <b>${w.w}</b>.`, extra);
  }
  return rtMcq(r, `What does “${w.w}” mean?`, w.def_, rtShuf(r, RT_WORDS.filter(x => x.def_ !== w.def_).map(x => x.def_)).slice(0, 3), `<b>${w.w}</b> means: ${w.def_}`, extra);
}
function rtRvRecall(r, stopId){
  const stop = rtStopOf(stopId), re = RT_REUSE[stopId] && RT_REUSE[stopId].f, items = stop ? (stop.reviewArchive || rvItems(stop, 'f')) : [];
  if (!re) return null;
  const ok = p => items[p - 1] && !SELF(items[p - 1].t);
  const pos = re.recall.filter(ok).length ? re.recall.filter(ok) : re.pool.filter(ok);
  if (!pos.length) return null;
  const p = rtPick(r, pos);
  return Object.assign({}, items[p - 1], {topic: stopId, slot: 'Recall', recallPos: p, fam: 'R' + stopId + p});
}
function rtRvFam(r, stopId, key, avoid, used){
  const list = (RT_SLOTS[stopId][key] || []).map(([id, dir]) => ({id, dir, n: rtFamN(id)}));
  if (!list.length) return null;
  let good = list.filter(x => !avoid.includes(x.n) && !used.has(x.n));
  if (!good.length) good = list.filter(x => !used.has(x.n));
  if (!good.length) good = list;
  const f = rtPick(r, good), ch = !!(prog(stopId) && prog(stopId).challenge);
  let it; try { it = rtGen(f.id, f.dir, r, {challenge: ch}); } catch (e) { it = rtGen(f.id, f.dir, r, {}); }
  used.add(it.fam); return it;
}
function rtRvHas(kind, id){ return (kind === 'C' ? RT_C : RT_D).some(t => t.stops.includes(id)); }

/* stops: ids or stop objects. Returns six items. */
function rtBuildReview(stops, rng, opts){
  opts = opts || {};
  const r = typeof rng === 'function' ? rng : rtRng(rng == null ? Math.random() : rng), rt = rtRvRt();
  const ids = stops.map(s => s && s.id ? s.id : s).filter((x, i, a) => a.indexOf(x) === i);
  const avoid = opts.lastFams || rt.lastFams || [], lastKind = opts.lastKind !== undefined ? opts.lastKind : rt.lastKind;
  const unused = ids.slice(), usedF = new Set(), out = new Array(6);
  const take = f => {
    let c = unused.filter(f); if (!c.length) c = ids.filter(f); if (!c.length) return null;
    const id = rtRvDraw(r, c), i = unused.indexOf(id); if (i >= 0) unused.splice(i, 1);
    return id;
  };
  /* 6: paragraph */
  const want = lastKind === 'C' ? 'D' : 'C', other = want === 'C' ? 'D' : 'C';
  let kind = ids.some(i => rtRvHas(want, i)) ? want : ids.some(i => rtRvHas(other, i)) ? other : null, ptopic = null;
  if (kind){ ptopic = take(i => rtRvHas(kind, i)); }
  if (ptopic){
    const task = rtParagraphTask(kind, [ptopic], r, {});
    out[5] = {t: 'para', slot: 'Paragraph', topic: ptopic, task, kind: task.kind, q: task.prompt};
  } else {
    const id = take(() => true), stop = rtStopOf(id);
    const w = stop && (stop.reviewArchive || rvItems(stop, 'f')).find(x => x.t === 'write');
    out[5] = Object.assign({}, w || {t: 'write', q: 'Explain one idea you learned about this topic.', words: [], checklist: ['I explained the idea.']}, {topic: id, slot: 'Paragraph', kind: null});
  }
  const fresh = (i, key) => RT_SLOTS[i][key].some(([id]) => !avoid.includes(rtFamN(id)));
  const takeFam = key => take(i => RT_SLOTS[i][key].length && fresh(i, key)) || take(i => RT_SLOTS[i][key].length);
  /* 4: calculate, or apply */
  const cid = takeFam('calc');
  if (cid){ out[3] = rtRvFam(r, cid, 'calc', avoid, usedF); out[3].slot = 'Calculate'; }
  else { const a = takeFam('apply'); out[3] = rtRvFam(r, a, 'apply', avoid, usedF); out[3].slot = 'Apply'; }
  /* 5: predict or diagnose, 3: apply, 2: recall, 1: word */
  const pid = takeFam('predict'); out[4] = rtRvFam(r, pid, 'predict', avoid, usedF); out[4].slot = 'Predict';
  const aid = takeFam('apply'); out[2] = rtRvFam(r, aid, 'apply', avoid, usedF); out[2].slot = 'Apply';
  const rid = take(i => !!rtRvRecall(rtRng('probe' + i), i));
  out[1] = (rid && rtRvRecall(r, rid)) || null;
  const wid = take(i => RT_WORDS.some(w => w.stops.includes(i)) || RT_QA.some(q => q.stop === i));
  out[0] = (wid && rtRvWord(r, wid)) || null;
  if (!out[1]) out[1] = rtRvFam(r, ids[0], 'apply', avoid, usedF), out[1].slot = 'Apply';
  if (!out[0]) out[0] = rtRvWord(r, ids[0]) || rtRvFam(r, ids[0], 'apply', avoid, usedF);
  return out;
}

/* ---------- the screens ---------- */
function renderRtReview(){
  rtRvCss(); if (typeof rtFcCss === 'function') rtFcCss();
  document.body.classList.remove('wide', 'story-focus');
  const root = app(); root.innerHTML = ''; window.scrollTo(0, 0);
  const stops = STOPS.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const ticked = new Set(stops.filter(s => prog(s.id).learn || prog(s.id).challenge).map(s => s.id));
  const list = h('div', {class: 'rt-topics'}), nudge = h('p', {class: 'scaleNote'}), startBtn = h('button', {class: 'btn primary', type: 'button', id: 'rtRvStart'});
  function draw(){
    list.innerHTML = '';
    stops.forEach(s => {
      const last = typeof rtLastPractised === 'function' ? rtLastPractised(s.id) : null, cb = h('input', {type: 'checkbox', checked: ticked.has(s.id), 'aria-label': s.topic});
      cb.addEventListener('change', () => { cb.checked ? ticked.add(s.id) : ticked.delete(s.id); draw(); });
      list.append(h('label', {class: 'rt-topic' + (ticked.has(s.id) ? ' on' : '')}, cb, h('span', {}, h('b', {}, s.topic),
        h('small', {}, last ? 'Last practised: ' + (typeof rtFcNice === 'function' ? rtFcNice(last) : last) : 'Not practised yet'))));
    });
    nudge.textContent = ticked.size === 1 ? 'One topic is fine. Tick a few more if you can, and your review will be more mixed.' : '';
    startBtn.disabled = !ticked.size; startBtn.textContent = ticked.size ? 'Start my review' : 'Pick a topic to start';
  }
  startBtn.addEventListener('click', () => rtRvRun([...ticked]));
  root.append(h('div', {class: 'rt-fc rt-rv'},
    h('button', {class: 'btn small back', type: 'button', onclick: renderHome}, '← Back to the time machine'),
    h('h2', {}, 'Review'),
    pipSay('<p>Six questions, from easy to hard, mixed across your topics. It takes approx. 12 minutes.</p>'),
    h('h3', {}, 'Topics'), list,
    h('div', {class: 'row'}, h('button', {class: 'btn small ghost', type: 'button', onclick: () => { stops.forEach(s => ticked.add(s.id)); draw(); }}, 'Tick all'),
      h('button', {class: 'btn small ghost', type: 'button', onclick: () => { ticked.clear(); draw(); }}, 'Clear')),
    nudge, startBtn));
  draw();
}

function rtRvRun(ids){
  const root = app(); root.innerHTML = ''; window.scrollTo(0, 0);
  const rt = rtRvRt(), items = rtBuildReview(ids, rtRng('rv' + Date.now() + Math.random()), {});
  rt.lastFams = items.map(i => i.fam).filter(f => /^F\d+|^X/.test(f || '')); const para = items[5];
  if (para && para.kind) rt.lastKind = para.kind; Store.save();
  const ans = new Array(6).fill(null), bar = h('div', {class: 'rt-rv-bar', role: 'status'}), fin = h('div', {class: 'rt-rv-end'});
  const upd = () => {
    const done = ans.filter(a => a && a.done), pts = done.reduce((s, a) => s + (a.pts || 0), 0), max = done.reduce((s, a) => s + (a.max || 0), 0);
    bar.innerHTML = ''; bar.append(h('span', {id: 'rtRvPts'}, `Points so far: ${pts} out of ${max}`), h('span', {}, `${done.length} of 6 questions done`));
    fin.innerHTML = '';
    if (done.length === 6) fin.append(h('button', {class: 'btn primary', type: 'button', id: 'rtRvFinish', onclick: () => rtRvEnd(ids, items, ans)}, 'Finish my review'));
  };
  const box = h('div', {class: 'rt-fc rt-rv'}, h('button', {class: 'btn small back', type: 'button', onclick: renderRtReview}, '← Back'), h('h2', {}, 'Review'), bar);
  items.forEach((it, i) => {
    const s = rtStopOf(it.topic), wrap = h('div', {class: 'rt-q', 'data-q': i + 1});
    box.append(h('div', {class: 'rt-slot'}, `Question ${i + 1} · ${it.slot}${s ? ' · ' + s.topic : ''}`), wrap);
    if (it.t === 'para') rtParagraphCard(wrap, it.task, i + 1, null, v => { ans[i] = v; upd(); });
    else reviewCard(wrap, it, i + 1, null, v => { ans[i] = v; upd(); });
  });
  box.append(fin); root.append(box); upd();
}

function rtRvEnd(ids, items, ans){
  const root = app(); root.innerHTML = ''; window.scrollTo(0, 0);
  const rt = rtRvRt(), pts = ans.reduce((s, a) => s + (a.pts || 0), 0), max = ans.reduce((s, a) => s + (a.max || 0), 0);
  ids.forEach(id => { if (typeof rtMarkPractised === 'function') rtMarkPractised(id); });
  rt.reviews = (rt.reviews || 0) + 1; Store.save();
  const weak = []; items.forEach((it, i) => { const a = ans[i]; const low = it.t === 'para' ? (a.pts || 0) < 3 : (a.pts || 0) < (a.max || 1); if (low && it.topic && !weak.includes(it.topic)) weak.push(it.topic); });
  const names = weak.map(id => rtStopOf(id).topic);
  const box = h('div', {class: 'rt-fc rt-rv'}, h('h2', {}, 'Review finished'),
    pipSay(`<p>You scored <b>${pts} out of ${max}</b>. ${pts === max ? 'Perfect!' : 'Well done for finishing.'}</p>`),
    h('h3', {}, 'Topics to practise'),
    names.length ? h('ul', {class: 'rt-rv-list'}, names.map(n => h('li', {}, n))) : h('p', {}, 'Nothing to flag this time. Great work!'));
  const acts = h('div', {class: 'rt-rv-end'});
  if (names.length && typeof renderRtFlashcards === 'function') acts.append(h('button', {class: 'btn primary', type: 'button', id: 'rtRvFlash', onclick: () => renderRtFlashcards(weak)}, 'Practise these with flashcards'));
  acts.append(h('button', {class: 'btn', type: 'button', id: 'rtRvPdf', onclick: () => rtRvSheet(items, ans, ids)}, 'Save my review (PDF)'),
    h('button', {class: 'btn', type: 'button', id: 'rtRvNew', onclick: renderRtReview}, 'New review'),
    h('button', {class: 'btn small ghost', type: 'button', onclick: renderHome}, 'Back to the time machine'));
  box.append(acts); root.append(box);
}

/* ---------- the printable review ---------- */
function rtRvSheetBody(items, ans, ids){
  const name = Store.data.studentName || '', cls = Store.data.studentClass || '', date = rtRvToday();
  const root = h('div', {class: 'ws ws-student'});
  root.append(h('div', {class: 'ws-header'}, h('div', {class: 'ws-brand'}, pipSVG(46), h('div', {}, h('div', {class: 'ws-kicker'}, 'Sparks Through Time · Review'), h('div', {class: 'ws-title'}, 'My review')))));
  root.append(h('div', {class: 'ws-namebar'}, h('span', {}, 'Name: ', h('b', {class: 'ws-name'}, name)), h('span', {}, 'Class: ', h('b', {class: 'ws-name'}, cls)), h('span', {}, 'Date: ', date)));
  root.append(h('p', {class: 'ws-student-note'}, 'Everything printed in blue was added by the student in the sim.'));
  const tot = ans.reduce((s, a) => s + (a.pts || 0), 0), mx = ans.reduce((s, a) => s + (a.max || 0), 0);
  root.append(h('p', {}, h('b', {}, `Score: ${tot} out of ${mx}`)));
  items.forEach((it, i) => {
    const a = ans[i] || {};
    if (it.t === 'para'){
      const k = it.task, box = h('div', {class: 'ws-q'});
      box.append(h('div', {class: 'ws-qhead'}, h('span', {class: 'ws-n'}, i + 1), h('span', {class: 'ws-type'}, k.title)), h('p', {class: 'ws-qtext'}, k.prompt));
      if (k.passage) box.append(h('p', {class: 'ws-note'}, h('b', {}, k.passage.title + '. '), k.passage.text));
      if (k.data){
        if (k.showTable) box.append(h('table', {class: 'ws-table'}, h('thead', {}, h('tr', {}, k.data.head.map(x => h('th', {}, x)))), h('tbody', {}, k.data.rows.map(row => h('tr', {}, row.map(x => h('td', {}, x)))))));
        if (k.data.note) box.append(h('p', {class: 'ws-note'}, k.data.note));
        if (k.graph) rtGraph(box, k.graph);
      }
      box.append(h('p', {class: 'ws-note'}, h('b', {}, 'My answer:')), h('div', {class: 'ws-written'}, a.text || ''),
        h('p', {class: 'ws-note'}, h('b', {}, 'Model answer:')), h('div', {class: 'ws-written'}, k.model),
        h('p', {class: 'ws-note'}, h('b', {}, `My ticks (${a.pts || 0} of 4): `), k.ticks.map((t, j) => ((a.ticks && a.ticks[j]) ? '[x] ' : '[ ] ') + t).join('   ')));
      root.append(box); return;
    }
    if (it.t === 'write'){
      const box = wsItem(it, i + 1, 'student', a);
      root.append(box); return;
    }
    const box = wsItem(it, i + 1, 'student', a);
    const key = wsItem(it, i + 1, 'key', null);
    key.querySelectorAll('.ws-qhead, .ws-qtext, .ws-myp').forEach(x => x.remove());
    box.append(h('p', {class: 'ws-note'}, h('b', {}, `Right answer (I got ${a.pts || 0} of ${a.max || 0}):`)), key);
    root.append(box);
  });
  return root;
}
function rtRvSheet(items, ans, ids){
  const prevTheme = document.documentElement.getAttribute('data-theme');
  const ov = h('div', {id: 'ws-root', class: 'ws-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'My review'}), holder = h('div', {class: 'ws-holder'});
  const make = () => rtRvSheetBody(items, ans, ids), rebuild = () => { holder.innerHTML = ''; holder.append(make()); };
  const close = () => { ov.remove(); document.body.classList.remove('printing'); if (prevTheme) document.documentElement.setAttribute('data-theme', prevTheme); else document.documentElement.removeAttribute('data-theme'); };
  const fileName = () => cleanFileName(`Review - ${rtRvToday()} - ${(Store.data.studentName || '').trim() || 'Student'}`);
  const gate = nameGate(ov, 'student', rebuild, {what: 'review', fileName, makeSheet: make});
  ov.append(h('div', {class: 'ws-toolbar no-print'}, gate.fields, gate.btn, gate.printBtn, h('button', {class: 'btn', type: 'button', onclick: close}, 'Close'), gate.msg, gate.info), holder);
  document.documentElement.setAttribute('data-theme', 'light'); document.body.classList.add('printing');
  document.body.append(ov); rebuild(); gate.upd();
}
