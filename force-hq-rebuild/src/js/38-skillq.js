/* ===== Skills question types (Reading and Writing plan, section 10, parts 2 to 6):
   teach (a worked example, then a short reminder), rtable (typed readings checked against the sim), graph (the graph maker as a question),
   mark (Mark it: Claim, Evidence, Reasoning), tappts (tap two points: My evidence) and para (a paragraph with starters, a side panel and ticks). ===== */
Object.assign(QLABEL, { teach: 'Learn this', rtable: 'Collect your data', graph: 'Make a graph', mark: 'Mark it', tappts: 'Pick your evidence', para: 'Write it' });
const fmtRow = (spec, r) => `${gmFmt(r[0])}${spec.xUnit ? ' ' + spec.xUnit : ''}: ${gmFmt(r[1])}${spec.yUnit ? ' ' + spec.yUnit : ''}`;
/* question items that wait for something (q.needs) show a short message until it is true; typed tables repaint as the sim runs */
function qRefresh() {
  $$('#qCard .qitem[data-needs], #dataCard .qitem[data-needs], #qPopBox .qitem[data-needs]').forEach(b => { const q = (CHDATA[CH.id].steps[GI].qs || []).find(x => x.id === b.dataset.q); if (q && q.needs) b.classList.toggle('gated', !q.needs()); });
  $$('#qCard .qbody, #dataCard .qbody').forEach(b => { if (b._refresh) b._refresh(); });
}

/* ---------- teach: the full worked example the first time, then a short reminder with the example one tap away ---------- */
QT.teach = {
  html(q, s) {
    const seen = !!dbGet('teachSeen.' + q.tid, false) || !!(s && s.done);
    return seen ? `<div class="teach short">${q.reminder}<details class="teacheg"><summary>Show the worked example</summary>${q.full()}</details></div>`
      : `<div class="teach">${q.full()}<button type="button" class="go sm teachgo" style="align-self:flex-start">Got it. Let me try</button></div>`;
  },
  bind(el, q, api) { api.reg({ blank: () => true, check() { } }); const b = $('.teachgo', el); if (b) b.addEventListener('click', () => { dbSet('teachSeen.' + q.tid, true); api.answer(1, true, '', { score: 1 }); }); },
  lock(el, q) { el.innerHTML = QT.teach.html(q, { done: true }); },
  show() { return ''; }, model() { return ''; }
};
/* ---------- rtable: type each reading; a row ticks when it matches the sim ---------- */
QT.rtable = {
  html(q, s) {
    const v = (s && s.v) || [];
    return `<table class="tbl rtbl"><tr><th>${q.head[0]}</th><th>${q.head[1]}</th><th></th></tr>${q.rows.map((r, i) => `<tr data-i="${i}"><th>${r}</th><td><input class="rtin" inputmode="decimal" autocomplete="off" aria-label="${esc(q.head[1])} for ${r}" value="${esc(v[i] == null ? '' : v[i])}"></td><td class="rtok"></td></tr>`).join('')}</table>`;
  },
  bind(el, q, api) {
    const rows = $$('tr[data-i]', el), vals = () => rows.map(r => $('.rtin', r).value);
    const state = i => { const x = parseNum($('.rtin', rows[i]).value), L = q.live(q.rows[i]); return isNaN(x) ? (L == null ? 'wait' : 'none') : L == null ? 'wait' : near(x, L, q.tol) ? 'ok' : 'bad'; };
    const paint = () => { let all = true;
      rows.forEach((r, i) => { const e = state(i); r.classList.toggle('ok', e === 'ok'); r.classList.toggle('bad', e === 'bad'); $('.rtok', r).textContent = e === 'ok' ? '✓' : e === 'bad' ? 'Not quite: check the readout' : e === 'wait' ? q.waitMsg(q.rows[i]) : ''; if (e !== 'ok') all = false; });
      if (all && !api.locked()) api.answer(vals(), true, q.ok || 'Every reading matches the sim!', { score: q.rows.length }); };
    el._refresh = () => { if (!api.locked()) paint(); };
    rows.forEach(r => $('.rtin', r).addEventListener('input', () => { if (api.locked()) return; const cur = api.state() || {}; cur.v = vals(); api.setRaw(cur); paint(); }));
    api.reg({ blank: () => vals().every(x => !x.trim()), check: paint, blankV: [] });
    paint();
  },
  lock(el, q, s) { $$('tr[data-i]', el).forEach((r, i) => { r.classList.add('ok'); $('.rtok', r).textContent = '✓'; }); lockInputs(el); },
  show(q, v) { return (v || []).map((x, i) => `${q.rows[i]}: ${esc(x)}`).join('<br>'); }, model(q) { return q.rows.map((r, i) => `${r}: ${q.live(r) == null ? '' : fmt(q.live(r), 2)}`).join('<br>'); }
};
/* ---------- graph: the graph maker as a question (Learn: live help; Check: one go, 5 marks) ---------- */
const gmSpecOf = q => typeof q.spec === 'function' ? q.spec() : q.spec;
QT.graph = {
  html(q, s) { return `${q.learn ? '' : gmHowHTML(false)}<div class="gmhost"></div>${q.learn ? '' : '<button type="button" class="ghost sm qchk" style="align-self:flex-start">Check my graph</button>'}`; },
  bind(el, q, api) {
    const spec = gmSpecOf(q), s = api.state(), done = !!(s && s.done), host = $('.gmhost', el);
    const gm = graphMaker(host, spec, { help: !!q.learn, locked: done, saved: s && s.v, onChange: (S, e) => {
      if (api.locked()) return; const cur = api.state() || {}; cur.v = S; api.setRaw(cur);
      if (q.learn && e.score === 5) { api.answer(S, true, q.ok || 'Brilliant graph! All five checks are green.', { score: 5 }); } } });
    el._gm = gm;
    const go = () => { if (api.locked()) return; const e = gm.eval(); api.answer(JSON.parse(JSON.stringify(gm.S)), e.score === 5, e.score === 5 ? (q.ok || 'A perfect graph: 5 out of 5.') : `You scored ${e.score} of 5. The checks below show what to change next time.`, { score: e.score }); };
    api.reg({ blank: () => !(gm.S.type || gm.S.title || gm.S.xl || gm.S.yl || gm.S.ymax || Object.keys(gm.S.pts).length || Object.keys(gm.S.bars).length), check: go, blankV: gmBlank() });
    const b = $('.qchk', el); if (b) b.addEventListener('click', go);
    if (done) QT.graph.lock(el, q, s);
  },
  lock(el, q, s) {
    const gm = el._gm; if (gm) { Object.assign(gm.S, gmBlank(), JSON.parse(JSON.stringify(s.v || {}))); gm.lock(); }
    const host = $('.gmhost', el); if (!q.learn && host && !$('.gmmodel', el)) host.insertAdjacentHTML('afterend', `<div class="gmmodel"><div class="lbl">A correct graph</div>${gmSVG(gmSpecOf(q), gmModel(gmSpecOf(q)), { alt: 'A correct graph', maxW: 460 })}</div>`);
    lockInputs(el);
  },
  show(q, v) { return v ? gmSVG(gmSpecOf(q), v, { print: true, alt: 'My graph', maxW: 360 }) : ''; }, model(q) { return gmSVG(gmSpecOf(q), gmModel(gmSpecOf(q)), { maxW: 360 }); }
};
/* ---------- mark: tap a sentence to go through every label and back to No label. One go. ---------- */
const MK_NONE = -1;
QT.mark = {
  html(q, s) {
    const v = s && Array.isArray(s.v) ? s.v : q.sents.map(() => MK_NONE), tag = l => `<span class="mktag mk${l < 0 ? 'no' : l}">${l < 0 ? 'No label' : q.labels[l]}</span>`;
    return `${q.title ? `<div class="mktitle">${q.title}</div>` : ''}<div class="mkkey" role="note" aria-label="The labels"><span class="lbl">Labels</span>${q.labels.map((l, i) => tag(i)).join('')}${tag(MK_NONE)}</div><p class="scaleNote">Tap a sentence to give it a label. Keep tapping to go through every label and back to No label.</p><div class="mksents noglos">${q.sents.map((x, i) => `<div class="mkrow" data-i="${i}"><button type="button" class="mksent" data-i="${i}" data-l="${v[i]}">${tag(v[i])}<span class="mkt">${x.t}</span></button></div>`).join('')}</div><button type="button" class="ghost sm qchk" style="align-self:flex-start">Check</button>`;
  },
  bind(el, q, api) {
    const cur = () => $$('.mksent', el).map(b => +b.dataset.l);
    el.addEventListener('click', e => { const b = e.target.closest('.mksent'); if (!b || api.locked()) return; const l = +b.dataset.l, n = l + 1 >= q.labels.length ? MK_NONE : l + 1; b.dataset.l = n;
      $('.mktag', b).className = 'mktag mk' + (n < 0 ? 'no' : n); $('.mktag', b).textContent = n < 0 ? 'No label' : q.labels[n]; const st = api.state() || {}; st.v = cur(); api.setRaw(st); });
    const go = () => { if (api.locked()) return; const v = cur(), right = v.filter((x, i) => x === q.sents[i].a).length, ok = right === q.sents.length;
      api.answer(v, ok, ok ? (q.ok || 'Every sentence is marked correctly!') : `Whoops! ${q.sents.length - right} sentence${q.sents.length - right > 1 ? 's' : ''} weren't right. Each one now shows the right label and the reason.`, { score: right }); };
    api.reg({ blank: () => { const st = api.state(); return !(st && Array.isArray(st.v)); }, check: go, blankV: q.sents.map(() => MK_NONE) });
    $('.qchk', el).addEventListener('click', go);
  },
  lock(el, q, s) {
    $$('.mkrow', el).forEach(r => { const i = +r.dataset.i, a = q.sents[i].a, ok = (s.v || [])[i] === a, b = $('.mksent', r); b.classList.add(ok ? 'right' : 'wrong'); b.dataset.l = (s.v || [])[i] == null ? MK_NONE : s.v[i];
      r.insertAdjacentHTML('beforeend', `<div class="mkwhy ${ok ? 'ok' : 'no'}"><b>${ok ? '✓' : '→'} ${a < 0 ? 'No label' : q.labels[a]}.</b> ${q.sents[i].why}</div>`); });
    lockInputs(el);
  },
  show(q, v) { return Array.isArray(v) ? v.map((l, i) => `${i + 1}. ${l < 0 ? 'No label' : q.labels[l]}`).join('<br>') : ''; },
  model(q) { return q.sents.map((x, i) => `${i + 1}. ${x.a < 0 ? 'No label' : q.labels[x.a]}`).join('<br>'); }
};
/* ---------- tappts: tap two points on a graph; they are shown as My evidence ---------- */
function gmDotsFor(spec, S, hitR) {   // transparent hit circles over each point of a graph, for tapping
  const X = gmIsScatter(spec) ? gmAxis(S, 'x') : null, Y = gmAxis(S, 'y'), { L, R, T, B } = GM;
  return gmData(spec).map(d => `<circle class="tapdot" data-i="${d.i}" cx="${L + (d.x - X.min) / (X.max - X.min) * (R - L)}" cy="${B - (d.y - Y.min) / (Y.max - Y.min) * (B - T)}" r="${hitR || 18}" fill="rgba(0,0,0,0)" stroke="none" style="cursor:pointer"/>`).join('');
}
const myEvidenceHTML = (spec, sel) => `<div class="myev"><b>My evidence</b>${sel && sel.length ? `<ul>${sel.map(i => `<li>${fmtRow(spec, spec.rows[i])}</li>`).join('')}</ul>` : '<p class="scaleNote">Nothing tapped yet.</p>'}</div>`;
QT.tappts = {
  html(q, s) {
    const spec = q.spec(), M = gmModel(spec), sel = s && Array.isArray(s.v) ? s.v : [];
    return `<div class="tapfig">${gmSVG(spec, M, { alt: 'Your graph', maxW: 420 }).replace('</svg>', gmDotsFor(spec, M) + '</svg>')}</div><div class="tapev">${myEvidenceHTML(spec, sel)}</div><button type="button" class="ghost sm qchk" style="align-self:flex-start">That's my evidence</button>`;
  },
  bind(el, q, api) {
    const spec = q.spec(), M = gmModel(spec); let sel = (api.state() || {}).v; sel = Array.isArray(sel) ? sel.slice() : [];
    const paint = () => { $$('.tapdot', el).forEach(c => { const on = sel.includes(+c.dataset.i); c.setAttribute('fill', on ? 'rgba(227,165,28,.35)' : 'rgba(0,0,0,0)'); c.setAttribute('stroke', on ? '#e3a51c' : 'none'); c.setAttribute('stroke-width', '4'); }); $('.tapev', el).innerHTML = myEvidenceHTML(spec, sel); };
    paint();
    $('.tapfig', el).addEventListener('click', e => { const c = e.target.closest('.tapdot'); if (!c || api.locked()) return; const i = +c.dataset.i; sel = sel.includes(i) ? sel.filter(x => x !== i) : sel.concat(i).slice(-2); const st = api.state() || {}; st.v = sel.slice(); api.setRaw(st); paint(); });
    const go = () => { if (api.locked()) return; if (sel.length < 2 && !api.auto) { api.say('Tap two points first.', 'no'); return; } api.answer(sel.slice().sort((a, b) => a - b), true, q.ok || 'Good choices.', { score: 1 }); };
    api.reg({ blank: () => !sel.length, check: go, blankV: [] });
    $('.qchk', el).addEventListener('click', go);
  },
  lock(el, q) { lockInputs(el); $$('.tapdot', el).forEach(c => { c.style.pointerEvents = 'none'; }); },
  show(q, v) { return Array.isArray(v) ? v.map(i => fmtRow(q.spec(), q.spec().rows[i])).join('<br>') : ''; }, model(q) { return ''; }
};
/* ---------- para: a paragraph with starters, a CER reminder, a side panel with the question and the data, and ticks that wait for the model ---------- */
const CER_REMIND = `<p><b>Claim:</b> answer the question.</p><p><b>Evidence:</b> numbers from the data, each with its unit, like 2 N or 6.4 m.</p><p><b>Reasoning:</b> the science that explains why.</p>`;
const paraSel = (q, v) => (v && Array.isArray(v.sel) && v.sel.length === 2 ? v.sel.slice().sort((a, b) => a - b) : [0, q.data.rows.length - 1]);
QT.para = {
  html(q, s) {
    const v = (s && s.v) || {}, ticks = v.ticks || [], done = !!(s && s.done), sel = Array.isArray(v.sel) ? v.sel : [];
    const side = `<aside class="parside"><div class="lbl">${q.sideHead || 'The question and the data'}</div><p class="parq">${q.question}</p>${q.data ? (q.tapRows ? `<p class="scaleNote">Tap two rows of the table.</p>` : '') + `<table class="tbl partbl"><tr>${q.data.head.map(x => `<th>${x}</th>`).join('')}</tr>${q.data.rows.map((r, i) => `<tr class="${q.tapRows ? 'taprow' : ''}${sel.includes(i) ? ' on' : ''}" data-i="${i}">${r.map(c => `<td>${typeof c === 'number' ? gmFmt(c) : c}</td>`).join('')}</tr>`).join('')}</table>` : ''}${q.sideHTML ? q.sideHTML() : ''}${q.tapRows ? `<div class="paev">${myEvidenceHTML(q.data, sel)}</div>` : ''}</aside>`;
    const main = `<div class="parmain">${q.starters ? `<div class="starters"><span class="lbl">Starters: tap one to begin</span>${q.starters.map((t, i) => `<button type="button" class="mini starter" data-s="${i}">${t}</button>`).join('')}</div>` : ''}${q.reminder ? `<details class="cerhow"${q.reminder === 'open' ? ' open' : ''}><summary>Reminder: Claim, Evidence, Reasoning</summary>${CER_REMIND}</details>` : ''}${q.words ? `<div class="wordsuse"><span class="lbl">Words to use</span><div>${q.words.map(w => `<b>${w}</b>`).join('')}</div></div>` : ''}<textarea class="explain parta" aria-label="Your paragraph" placeholder="Write your answer in full sentences.">${esc(v.text || '')}</textarea><div class="exck" ${done && q.check && q.check.length ? '' : 'hidden'}><div class="lbl exckhd">Did you include…? Tick what you included. You get a point for each one.</div><div class="checklist">${(q.check || []).map((c, i) => `<label><input type="checkbox" data-ck="${i}" ${ticks.includes(i) ? 'checked' : ''}> ${c}</label>`).join('')}</div></div><button type="button" class="ghost sm qchk" style="align-self:flex-start">Check: show the model answer</button><div class="modelwrap"></div></div>`;
    return `<div class="pargrid">${main}${side}</div>`;
  },
  bind(el, q, api) {
    const textNow = () => $('.parta', el).value, ticksNow = () => $$('[data-ck]', el).filter(x => x.checked).map(x => +x.dataset.ck);
    let sel = ((api.state() || {}).v || {}).sel; sel = Array.isArray(sel) ? sel.slice() : [];
    const draft = () => { const cur = api.state() || {}; cur.v = { text: textNow(), ticks: ticksNow(), sel }; api.setRaw(cur); };
    const paintSel = () => { $$('.taprow', el).forEach(r => r.classList.toggle('on', sel.includes(+r.dataset.i))); const pe = $('.paev', el); if (pe) pe.innerHTML = myEvidenceHTML(q.data, sel); };
    const model = () => typeof q.model === 'function' ? q.model(paraSel(q, { sel })) : q.model;
    const reveal = () => { $('.modelwrap', el).innerHTML = `<div class="model"><div class="lbl">Model answer</div><p>${model()}</p></div>`; if (q.check && q.check.length) $('.exck', el).hidden = false; $('.qchk', el).hidden = true; };
    const go = () => { const t = textNow().trim(); if (!t && !api.auto) { api.say('Write your answer first, then compare it with the model answer.', 'no'); return; }
      if (q.tapRows && sel.length < 2 && !api.auto) { api.say('Tap two rows of the table first: they are your evidence.', 'no'); return; }
      const tk = ticksNow(); reveal(); api.answer({ text: t, ticks: tk, sel: sel.slice() }, null, 'Now compare your answer with the model answer.' + (q.check && q.check.length ? ' You can still change your ticks.' : ''), { score: tk.length }); };
    api.reg({ blank: () => !textNow().trim() && !ticksNow().length, check: go, reveal, blankV: { text: '', ticks: [], sel: [] } });
    $('.qchk', el).addEventListener('click', go);
    $('.parta', el).addEventListener('input', () => { if (!api.locked() || !(api.state() || {}).done) draft(); });
    $$('.starter', el).forEach(b => b.addEventListener('click', () => { const ta = $('.parta', el); if ((api.state() || {}).done) return; const t = q.starters[+b.dataset.s]; ta.value = (ta.value && !/\s$/.test(ta.value) ? ta.value + ' ' : ta.value) + t.replace(/…$/, '') + (/…$/.test(t) ? '' : ' '); ta.focus(); draft(); }));
    if (q.tapRows) $('.partbl', el).addEventListener('click', e => { const r = e.target.closest('.taprow'); if (!r || (api.state() || {}).done) return; const i = +r.dataset.i; sel = sel.includes(i) ? sel.filter(x => x !== i) : sel.concat(i).slice(-2); paintSel(); draft(); });
    $$('[data-ck]', el).forEach(c => c.addEventListener('change', () => { const st = api.state(); if (st && st.done) api.answer({ text: textNow(), ticks: ticksNow(), sel: sel.slice() }, null, null, { quiet: true, score: ticksNow().length }); else draft(); }));
    const s = api.state(); if (s && s.done) reveal();
  },
  show(q, v) { return v ? esc(v.text || '').replace(/\n/g, '<br>') : ''; }, model(q) { return typeof q.model === 'function' ? q.model(paraSel(q, null)) : q.model; }
};
