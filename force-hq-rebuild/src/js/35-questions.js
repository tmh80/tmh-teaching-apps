/* ===== Question engine shared by Learn steps and Reviews =====
   Every question: {id, type, p, ...}. Saved state: {v, ok, tries, done}.
   Types: mcq, tap, num, reading, gap, sort, match, table, tick, fbd, explain. More types (order, pick, reason, fix) are in 36-qtypes.js. */
/* ---- answer drafts: a number and unit typed under a Do-this task are copied into the matching question's answer box (and the other way round) ---- */
const draftOf = (store, id) => (dbGet(store + '.draft', {}) || {})[id] || null;
function draftSave(store, id, part, val, src) {
  const d = dbGet(store + '.draft', {}), cur = d[id] || {}; cur[part] = val; d[id] = cur; dbSet(store + '.draft', d);
  $$('[data-draft="' + store + '|' + id + '"]').forEach(el => { if (el === src || el.disabled || el.dataset.dk !== part) return; if (el.value !== val) el.value = val; });
  if (typeof checkStep === 'function') checkStep();
}
const QLABEL = { mcq: 'Choose one', tap: 'Tap the sentence', num: 'Calculate', reading: 'Read the arena', gap: 'Fill the gaps', sort: 'Sort it', match: 'Match it up', table: 'Complete the table', tick: 'Tick all that apply', fbd: 'Draw it: free-body diagram', explain: 'Explain it' };
const normWord = s => String(s || '').toLowerCase().replace(/[^a-z0-9.]+/g, ' ').trim();
/* Gap answers accept sensible synonyms: if any accepted answer is in a group, every word in that group counts.
   Leading "a", "an" and "the" are ignored, so "the middle" matches "middle". */
const SYNS = [
  ['bigger', 'more', 'larger', 'greater', 'stronger', 'higher', 'more powerful'],
  ['smaller', 'less', 'weaker', 'lower'],
  ['centre', 'center', 'middle', 'centre point', 'middle point'],
  ['against', 'opposite', 'opposite to', 'the opposite way to', 'opposing', 'in the opposite direction to', 'opposite direction to'],
  ['newtons', 'newton', 'n'],
  ['harder', 'more difficult', 'tougher'],
  ['still', 'at rest', 'stationary', 'not moving'],
  ['speed', 'velocity'],
  ['9.8', 'g', '9.8 n kg']
];
const gapNorm = x => normWord(x).replace(/^(a|an|the) /, '');
function gapAccepts(list) { const out = new Set(list.map(gapNorm)); SYNS.forEach(g => { if (g.some(w => out.has(gapNorm(w)))) g.forEach(w => out.add(gapNorm(w))); }); return [...out]; }
const gapOk = (list, x) => gapAccepts(list).includes(gapNorm(x));
function optOrder(q) { return q.noShuffle ? q.opts.map((_, i) => i) : shuffled(q.opts.map((_, i) => i), hashStr(q.id + (q.seed || ''))); }
function hashStr(s) { let x = 7; for (const ch of String(s)) x = (x * 31 + ch.charCodeAt(0)) | 0; return x; }
function sortItems(q) { return shuffled(q.items.map((_, i) => i), hashStr(q.id) + 3); }

/* One go at every question. A right answer locks green; a wrong one locks and shows the right answer.
   Questions with several parts score a point per part; diagrams score a point per check. */
const art = g => (/^[aeiou]/i.test(g) ? 'an ' : 'a ') + g.toLowerCase();
const qq = t => '“' + plain(t) + '”';
function corr(after, text) { const c = document.createElement('span'); c.className = 'corr'; c.textContent = '→ ' + plain(text); after.after(c); }
function lockInputs(el) { $$('input,select,textarea,button', el).forEach(x => { if (!x.classList.contains('qopen')) x.disabled = true; }); $$('.qchk', el).forEach(b => b.hidden = true); }
function simMax(q) { switch (q.type) { case 'tick': case 'order': case 'reason': case 'fix': return 2; case 'pick': return q.picks.length; case 'gap': return q.ans.length; case 'sort': return q.items.length; case 'match': return q.rows.length; case 'table': return q.rows.length * q.cols.length; case 'fbd': case 'desk': return 6; case 'explain': return q.check.length; default: return 1; } }
/* "How sure are you?" (opt-in: sure:true on mcq, reason and pick). Three buttons; the student must choose one before checking.
   Not marked. Saved as st.sure ('guess' | 'fair' | 'cert') so the feedback page can show answers that were certain but wrong. */
const SURE_LABEL = { guess: 'Guessing', fair: 'Fairly sure', cert: 'Certain' };
const sureHTML = (q, s) => q.sure ? `<div class="surerow" role="group" aria-label="How sure are you?"><span class="sq">How sure are you?</span>${Object.entries(SURE_LABEL).map(([k, l]) => `<button type="button" class="surebtn${s && s.sure === k ? ' on' : ''}" data-sure="${k}" aria-pressed="${!!(s && s.sure === k)}">${l}</button>`).join('')}</div>` : '';
const sureGet = el => { const b = $('.surebtn.on', el); return b ? b.dataset.sure : null; };

const QT = {
  mcq: {
    html(q, s) { return `${sureHTML(q, s)}<div class="opts">${optOrder(q).map(i => `<button type="button" data-o="${i}">${q.opts[i]}</button>`).join('')}</div>`; },
    bind(el, q, api) { el.addEventListener('click', e => { const b = e.target.closest('[data-o]'); if (!b || api.locked()) return; const i = +b.dataset.o, ok = i === q.a;
      if (q.sure && !sureGet(el)) { api.say('Choose how sure you are first, then pick your answer.', 'no'); return; }
      api.answer(i, ok, ok ? (q.ok || 'That\'s right!') : `Whoops! The answer is ${qq(q.opts[q.a])}. ${(q.why && q.why[i]) || q.work || ''}`.trim(), { score: ok ? 1 : 0, sure: q.sure ? sureGet(el) : null }); }); },
    lock(el, q, s) { $$('[data-o]', el).forEach(b => { const i = +b.dataset.o; b.className = i === s.v ? (s.ok ? 'right' : 'wrong') : i === q.a ? 'answer' : ''; }); lockInputs(el); },
    show(q, v) { return v == null ? '' : q.opts[v]; }, model(q) { return q.opts[q.a]; }
  },
  tap: {
    html(q) { return `<div class="sentences">${optOrder(q).map(i => `<button type="button" data-o="${i}">${q.opts[i]}</button>`).join('')}</div>`; },
    bind(el, q, api) { QT.mcq.bind(el, q, api); }, lock(el, q, s) { QT.mcq.lock(el, q, s); }, show(q, v) { return v == null ? '' : q.opts[v]; }, model(q) { return q.opts[q.a]; }
  },
  num: {
    /* q.units: a unit picker (the student chooses the unit as well as typing the number).
       q.ladder + q.hints: a "Need a clue?" fold-out that shows one hint at a time, never the final answer. */
    html(q, s, api) {
      const U = q.units && q.units.length, L = q.ladder && q.hints && q.hints.length, D = api && api.draft ? api.draft.get() || {} : {}, dk = api && api.draft ? ` data-draft="${api.draft.key}"` : '';
      const v0 = s && s.v != null ? s.v : D.v || '', u0 = s && s.u ? s.u : D.u || '';
      return `<div class="numin"><input class="ansin" inputmode="decimal" autocomplete="off" aria-label="Your answer"${dk} data-dk="v" value="${esc(v0)}">${U ? `<select class="unitsel" aria-label="Unit"${dk} data-dk="u"><option value="">unit?</option>${q.units.map(u => `<option value="${esc(u)}"${u0 === u ? ' selected' : ''}>${u}</option>`).join('')}</select><span class="unit"></span>` : `<span class="unit">${q.unit || ''}</span>`}<button type="button" class="ghost sm qchk">Check</button></div>${L ? `<details class="clue ladder"><summary>Need a clue?</summary><ol class="clist"></ol><button type="button" class="mini cluebtn">Show a hint</button></details>` : ''}`;
    },
    bind(el, q, api) {
      const U = q.units && q.units.length;
      const lb = $('.cluebtn', el); if (lb) { let k = 0; lb.addEventListener('click', () => { if (api.locked()) return; const li = document.createElement('li'); li.innerHTML = q.hints[k]; $('.clist', el).appendChild(li); k++; if (k >= q.hints.length) { lb.disabled = true; lb.textContent = 'No more hints'; } else lb.textContent = 'Show another hint'; }); }
      const go = () => { if (api.locked()) return; const raw = $('.ansin', el).value, v = parseNum(raw), u = U ? $('.unitsel', el).value : null; if (isNaN(v)) { api.say('Type your answer as a number.', 'no'); return; }
        if (U && !u) { api.say('Choose a unit for your answer first.', 'no'); return; }
        if (q.need && !q.need()) { api.say(q.needMsg || 'Set up the arena first.', 'no'); return; }
        const ans = q.live ? q.live() : q.ans, numOk = near(v, ans, q.tol != null ? q.tol : Math.max(0.6, Math.abs(ans) * 0.01)), unitOk = !U || u === q.unit, ok = numOk && unitOk;
        const help = q.work || (q.hints && q.hints[q.hints.length - 1]) || '';
        api.answer(raw, ok, ok ? (q.ok || 'That\'s right!') : numOk ? `Whoops! The number is right, but the unit should be ${q.unit}. ${help}`.trim() : `Whoops! The answer is ${fmt(ans, 2)} ${q.unit || ''}. ${help}`.trim(), { score: ok ? 1 : 0, ans, u }); };
      $('.qchk', el).addEventListener('click', go); $('.ansin', el).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      if (api.draft) { const D = api.draft; $('.ansin', el).addEventListener('input', e => { if (!api.locked()) D.set('v', e.target.value, e.target); }); const sel = $('.unitsel', el); if (sel) sel.addEventListener('change', e => { if (!api.locked()) D.set('u', e.target.value, e.target); }); }
    },
    lock(el, q, s) { const i = $('.ansin', el); i.classList.add(s.ok ? 'right' : 'wrong'); const sel = $('.unitsel', el); if (sel) { sel.value = s.u || ''; sel.classList.add(s.u === q.unit ? 'right' : 'wrong'); }
      if (!s.ok && s.ans != null) corr($('.unit', el), fmt(s.ans, 2) + ' ' + (q.unit || '')); lockInputs(el); },
    show(q, v, s) { return v == null ? '' : v + ' ' + ((s && s.u) || q.unit || ''); }, model(q) { return (q.ans != null ? fmt(q.ans, 2) : '(the arena reading)') + ' ' + (q.unit || ''); }
  },
  gap: {
    html(q, s) { let k = 0; return `<div class="gl noglos">${q.p.replace(/___/g, () => `<input class="gapin" data-g="${k}" aria-label="Gap ${k + 1}" autocomplete="off" value="${s && s.v ? esc(s.v[k++] || '') : (k++, '')}">`)}</div><button type="button" class="ghost sm qchk" style="align-self:flex-start">Check</button>`; },
    bind(el, q, api) {
      const go = () => { if (api.locked()) return; const v = $$('.gapin', el).map(i => i.value.trim()); if (v.some(x => !x)) { api.say('Fill in every gap first.', 'no'); return; }
        let res = v.map((x, i) => gapOk(q.ans[i], x));
        if (q.swap && !res.every(Boolean)) { const [a, b] = q.swap, alt = v.slice(); alt[a] = v[b]; alt[b] = v[a]; const r2 = alt.map((x, i) => gapOk(q.ans[i], x)); if (r2.every(Boolean)) res = r2; }   // two gaps that can go in either order (a × b = b × a)
        const bad = res.map((r, i) => r ? -1 : i).filter(i => i >= 0);
        api.answer(v, !bad.length, !bad.length ? (q.ok || 'All correct!') : bad.length === 1 ? `Whoops! The missing word is ${qq(q.ans[bad[0]][0])}.` : `Whoops! ${bad.length} gaps weren't right. The right words are shown in green.`, { score: res.filter(Boolean).length }); };
      $('.qchk', el).addEventListener('click', go); $$('.gapin', el).forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } }));
    },
    lock(el, q, s) { $$('.gapin', el).forEach((inp, i) => { const ok = gapOk(q.ans[i], (s.v || [])[i]); inp.classList.add(ok ? 'right' : 'wrong'); if (!ok) corr(inp, q.ans[i][0]); }); lockInputs(el); },
    show(q, v) { let k = 0; return q.p.replace(/___/g, () => `<u>${esc((v || [])[k++] || '______')}</u>`); }, model(q) { let k = 0; return q.p.replace(/___/g, () => `<u>${esc(q.ans[k++][0])}</u>`); }
  },
  sort: {
    html(q, s) { return `<div class="sortgrid">${sortItems(q).map(i => `<div class="sortrow" data-i="${i}"><span>${q.items[i][0]}</span><select aria-label="Group for ${esc(plain(q.items[i][0]))}"><option value="">Choose…</option>${q.groups.map((g, gi) => `<option value="${gi}" ${s && s.v && s.v[i] === gi ? 'selected' : ''}>${g}</option>`).join('')}</select></div>`).join('')}</div><button type="button" class="ghost sm qchk" style="align-self:flex-start">Check</button>`; },
    bind(el, q, api) { $('.qchk', el).addEventListener('click', () => { if (api.locked()) return; const v = q.items.map((_, i) => { const s = $(`.sortrow[data-i="${i}"] select`, el).value; return s === '' ? null : +s; });
      if (v.some(x => x == null)) { api.say('Choose a group for every item first.', 'no'); return; }
      const bad = q.items.map((it, i) => v[i] === it[1] ? -1 : i).filter(i => i >= 0);
      api.answer(v, !bad.length, !bad.length ? (q.ok || 'All sorted correctly!') : bad.length === 1 ? `Whoops! ${qq(q.items[bad[0]][0])} is ${art(plain(q.groups[q.items[bad[0]][1]]))}.` : `Whoops! ${bad.length} of these weren't right. Each red one now shows the group it belongs in.`, { score: q.items.length - bad.length }); }); },
    lock(el, q, s) { $$('.sortrow', el).forEach(r => { const i = +r.dataset.i, ok = s.v && s.v[i] === q.items[i][1]; r.className = 'sortrow ' + (ok ? 'right' : 'wrong'); if (!ok) corr($('select', r), q.groups[q.items[i][1]]); }); lockInputs(el); },
    show(q, v) { return q.groups.map((g, gi) => `<b>${g}:</b> ${q.items.filter((_, i) => v && v[i] === gi).map(x => x[0]).join(', ') || '–'}`).join('<br>'); },
    model(q) { return q.groups.map((g, gi) => `<b>${g}:</b> ${q.items.filter(x => x[1] === gi).map(x => x[0]).join(', ')}`).join('<br>'); }
  },
  match: {
    html(q, s) { const ch = shuffled(q.rows.map((_, i) => i), hashStr(q.id) + 9); return `<div class="sortgrid">${q.rows.map((r, i) => `<div class="matchrow" data-i="${i}"><span>${r[0]}</span><select aria-label="Match for ${esc(plain(r[0]))}"><option value="">Choose…</option>${ch.map(j => `<option value="${j}" ${s && s.v && s.v[i] === j ? 'selected' : ''}>${q.rows[j][1]}</option>`).join('')}</select></div>`).join('')}</div><button type="button" class="ghost sm qchk" style="align-self:flex-start">Check</button>`; },
    bind(el, q, api) { $('.qchk', el).addEventListener('click', () => { if (api.locked()) return; const v = q.rows.map((_, i) => { const s = $(`.matchrow[data-i="${i}"] select`, el).value; return s === '' ? null : +s; });
      if (v.some(x => x == null)) { api.say('Choose a match for every row first.', 'no'); return; }
      const bad = v.map((x, i) => x === i ? -1 : i).filter(i => i >= 0);
      api.answer(v, !bad.length, !bad.length ? (q.ok || 'All matched!') : bad.length === 1 ? `Whoops! ${qq(q.rows[bad[0]][0])} goes with ${qq(q.rows[bad[0]][1])}.` : `Whoops! ${bad.length} matches weren't right. Each red one now shows the right match.`, { score: q.rows.length - bad.length }); }); },
    lock(el, q, s) { $$('.matchrow', el).forEach(r => { const i = +r.dataset.i, ok = s.v && s.v[i] === i; r.className = 'matchrow ' + (ok ? 'right' : 'wrong'); if (!ok) corr($('select', r), q.rows[i][1]); }); lockInputs(el); },
    show(q, v) { return q.rows.map((r, i) => `${r[0]} → ${v && v[i] != null ? q.rows[v[i]][1] : '–'}`).join('<br>'); }, model(q) { return q.rows.map(r => `${r[0]} → ${r[1]}`).join('<br>'); }
  },
  table: { // q.cols, q.rows:[[label, [answerIndex per col]]], q.choices: per col list
    html(q, s) { return `<table class="tbl"><tr><th></th>${q.cols.map(c => `<th>${c}</th>`).join('')}</tr>${q.rows.map((r, i) => `<tr><th>${r[0]}</th>${q.cols.map((_, j) => `<td data-c="${i}-${j}"><select aria-label="${esc(plain(r[0]))}, ${esc(plain(q.cols[j]))}"><option value="">Choose…</option>${q.choices[j].map((o, k) => `<option value="${k}" ${s && s.v && s.v[i] && s.v[i][j] === k ? 'selected' : ''}>${o}</option>`).join('')}</select></td>`).join('')}</tr>`).join('')}</table><button type="button" class="ghost sm qchk" style="align-self:flex-start">Check</button>`; },
    bind(el, q, api) { $('.qchk', el).addEventListener('click', () => { if (api.locked()) return; const v = q.rows.map((_, i) => q.cols.map((_, j) => { const s = $(`td[data-c="${i}-${j}"] select`, el).value; return s === '' ? null : +s; }));
      if (v.flat().some(x => x == null)) { api.say('Fill in every cell first.', 'no'); return; }
      let wrong = 0; q.rows.forEach((r, i) => q.cols.forEach((_, j) => { if (v[i][j] !== r[1][j]) wrong++; }));
      api.answer(v, !wrong, !wrong ? (q.ok || 'Table complete and correct!') : `Whoops! ${wrong} cell${wrong > 1 ? 's weren\'t' : ' wasn\'t'} right. The right answer${wrong > 1 ? 's are' : ' is'} shown in green.`, { score: q.rows.length * q.cols.length - wrong }); }); },
    lock(el, q, s) { q.rows.forEach((r, i) => q.cols.forEach((_, j) => { const td = $(`td[data-c="${i}-${j}"]`, el), ok = s.v && s.v[i] && s.v[i][j] === r[1][j]; td.className = ok ? 'right' : 'wrong'; if (!ok) corr($('select', td), q.choices[j][r[1][j]]); })); lockInputs(el); },
    show(q, v) { return `<table class="wtbl"><tr><th></th>${q.cols.map(c => `<th>${c}</th>`).join('')}</tr>${q.rows.map((r, i) => `<tr><th>${r[0]}</th>${q.cols.map((_, j) => `<td>${v && v[i] && v[i][j] != null ? q.choices[j][v[i][j]] : ''}</td>`).join('')}</tr>`).join('')}</table>`; },
    model(q) { return QT.table.show(q, q.rows.map(r => r[1])); }
  },
  tick: {
    html(q, s) { return `<div class="ticklist">${optOrder(q).map(i => `<label><input type="checkbox" data-o="${i}" ${s && s.v && s.v.includes(i) ? 'checked' : ''}> ${q.opts[i]}</label>`).join('')}</div><button type="button" class="ghost sm qchk" style="align-self:flex-start">Check</button>`; },
    bind(el, q, api) { $('.qchk', el).addEventListener('click', () => { if (api.locked()) return; const v = $$('[data-o]', el).filter(c => c.checked).map(c => +c.dataset.o).sort((a, b) => a - b);
      if (!v.length) { api.say('Tick at least one box first.', 'no'); return; }
      const errs = v.filter(i => !q.a.includes(i)).length + q.a.filter(i => !v.includes(i)).length, ok = !errs;
      api.answer(v, ok, ok ? (q.ok || 'All correct!') : `Whoops! The right answer${q.a.length > 1 ? 's are' : ' is'} ${q.a.map(i => qq(q.opts[i])).join(' and ')}. Green ticks were right, red ones were wrong, and amber ones were missed.`, { score: Math.max(0, 2 - errs) }); }); },
    lock(el, q, s) { $$('[data-o]', el).forEach(c => { const i = +c.dataset.o, should = q.a.includes(i), was = (s.v || []).includes(i); c.parentElement.className = was ? (should ? 'right' : 'wrong') : (should ? 'missed' : ''); }); lockInputs(el); },
    show(q, v) { return (v || []).map(i => '☑ ' + q.opts[i]).join('<br>') || '–'; }, model(q) { return q.a.map(i => '☑ ' + q.opts[i]).join('<br>'); }
  },
  explain: {
    html(q, s) { return `${q.words ? `<div class="wordsuse"><span class="lbl">Words to use in a good answer</span><div>${q.words.map(w => `<b>${w}</b>`).join('')}</div></div>` : ''}<textarea class="explain" aria-label="Your explanation" placeholder="Write your answer in full sentences.">${s && s.v ? esc(s.v.text || '') : ''}</textarea><button type="button" class="ghost sm qchk" style="align-self:flex-start">Show the model answer</button><div class="modelwrap"></div>`; },
    bind(el, q, api) {
      const showModel = (ticks) => { $('.modelwrap', el).innerHTML = `<div class="model"><div class="lbl">Model answer</div><p>${q.model}</p><div class="lbl">Did you include…? Tick what you included. You get a point for each one.</div><div class="checklist">${q.check.map((c, i) => `<label><input type="checkbox" data-ck="${i}" ${ticks && ticks.includes(i) ? 'checked' : ''}> ${c}</label>`).join('')}</div></div>`;
        $$('[data-ck]', el).forEach(c => c.addEventListener('change', () => { const t = $$('[data-ck]', el).filter(x => x.checked).map(x => +x.dataset.ck); api.answer({ text: $('.explain', el).value, ticks: t }, null, null, { quiet: true, score: t.length }); })); };
      $('.qchk', el).addEventListener('click', () => { const t = $('.explain', el).value.trim(); if (!t) { api.say('Write your answer first, then compare it with the model answer.', 'no'); return; } $('.qchk', el).hidden = true; api.answer({ text: t, ticks: [] }, null, 'Now compare your answer with the model answer and tick each point you included.', { score: 0 }); showModel([]); });
      $('.explain', el).addEventListener('input', () => { const s = api.state(); if (s && s.v) { s.v.text = $('.explain', el).value; api.persist(); } });
      const s = api.state(); if (s && s.done) { showModel(s.v.ticks); $('.qchk', el).hidden = true; }
    },
    show(q, v) { return v ? esc(v.text || '').replace(/\n/g, '<br>') : ''; }, model(q) { return q.model; }
  },
  fbd: {
    html(q, s) { return `<div class="fbdhost"></div>`; },
    bind(el, q, api) {
      const s = api.state(); if (s && s.done) return;
      FBDB.mount($('.fbdhost', el), q.scen, { state: s && s.v, onChange: st => { const cur = api.state() || {}; cur.v = st; api.setRaw(cur); },
        onCheck: (st, res) => api.answer(st, res.ok, res.ok ? 'Perfect diagram! Every check is green.' : `You scored ${res.score} of 6 points. Compare your diagram with the correct one to see what to change next time.`, { score: res.score }) });
    },
    lock(el, q, s) { el.innerHTML = fbdCompare(q.scen, s.v); },
    show(q, v) { return v && v.arrows && v.arrows.length ? FBDB.svg(q.scen, v.arrows, { blue: true, noDot: true }) : ''; }, model(q) { return FBDB.svg(q.scen, FBDB.model(q.scen), { noDot: true }); }
  }
};
/* your diagram beside the correct one, with the six checks */
function fbdCompare(scen, v) {
  const res = v && v.lastRes;
  return `<div class="fbdlock"><figure><figcaption>Your diagram</figcaption>${FBDB.svg(scen, (v && v.arrows) || [], { noDot: true })}</figure><figure><figcaption>The correct diagram</figcaption>${FBDB.svg(scen, FBDB.model(scen), { noDot: true })}</figure></div>
    ${res ? `<div class="chipsrow">${res.chips.map(([, l, ok]) => `<span class="ck ${ok ? 'on' : 'off'}">${ok ? '✓' : '✗'} ${l}</span>`).join('')}</div>` : ''}`;
}
QT.reading = QT.num;
QT.tap.show = QT.mcq.show;

/* Render one question card. ctx: {store:'path', mode:'learn'|'review', onDone} */
function renderQuestion(host, q, ctx) {
  const path = ctx.store + '.' + q.id; let s = dbGet(path, null);
  const box = h('div', { class: 'qitem' + (s && s.done ? ' locked' + (s.ok ? ' ok' : '') : ''), 'data-q': q.id });
  box.innerHTML = `<div class="qtype"><span>${QLABEL[q.type] || ''}</span><span class="pts"></span></div>${q.type === 'gap' || q.type === 'pick' ? '' : `<div class="qp gl">${q.p}</div>`}<div class="qbody"></div><div class="fb"></div>`;   // gap and pick put the sentence inside the answer area
  host.appendChild(box);
  const body = $('.qbody', box), fbEl = $('.fb', box);
  const pts = st => { const m = st.max || simMax(q), sc = st.score != null ? st.score : st.ok ? m : 0; $('.pts', box).innerHTML = st.done ? `<span class="ptsb ${sc === m ? 'full' : sc ? 'part' : 'none'}">${sc} of ${m} point${m > 1 ? 's' : ''}</span>` : ''; };
  const api = {
    storePath: ctx.store,
    draft: ctx.mode === 'learn' ? { key: ctx.store + '|' + q.id, get: () => draftOf(ctx.store, q.id), set: (part, val, src) => draftSave(ctx.store, q.id, part, val, src) } : null,
    state: () => dbGet(path, null),
    setRaw: v => dbSet(path, v),
    persist: () => dbSet(path, dbGet(path, null)),
    tries: () => (dbGet(path, null) || {}).tries || 0,
    locked: () => { const st = dbGet(path, null); return !!(st && st.done && q.type !== 'explain'); },
    say: (m, cls) => { fbEl.className = 'fb ' + cls; fbEl.textContent = m; },
    answer(v, ok, msg, x = {}) {
      const st = dbGet(path, null) || { tries: 0 }; st.v = v;
      if (!x.quiet) st.tries = (st.tries || 0) + 1;
      if (ok != null) st.ok = ok; if (ok && st.tries === 1) st.first = true;
      st.max = simMax(q); if (x.score != null) st.score = x.score; if (x.ans != null) st.ans = x.ans; if (x.u != null) st.u = x.u; if (x.sure != null) st.sure = x.sure; if (msg) st.msg = msg;
      const wasDone = st.done; st.done = true;
      dbSet(path, st);
      if (msg) api.say(msg, ok ? 'ok' : ok === false ? (st.score ? 'hint' : 'no') : 'hint');
      if (ok && q.type === 'num' && q.evidence !== false) addEvidence('maths', `${plain(q.p)} I got ${v} ${q.unit || ''}.`);
      box.classList.add('locked'); box.classList.toggle('ok', !!st.ok);
      if (!wasDone && QT[q.type].lock) QT[q.type].lock(body, q, st);
      pts(st);
      if (ctx.onDone) ctx.onDone(q, st);
    }
  };
  body.innerHTML = QT[q.type].html(q, s, api);
  QT[q.type].bind(body, q, api);
  if (q.sure) body.addEventListener('click', e => { const b = e.target.closest('.surebtn'); if (!b || api.locked()) return; $$('.surebtn', body).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); });
  if (s && s.done) {
    if (QT[q.type].lock) QT[q.type].lock(body, q, s);
    pts(s);
    const m = s.msg || (s.ok ? (q.ok || 'That\'s right!') : q.type === 'explain' ? '' : 'Done.');
    if (m) api.say(m, s.ok ? 'ok' : s.ok === false ? (s.score ? 'hint' : 'no') : 'hint');
  }
  return box;
}
/* points for one saved answer (older saves without a score count as all or nothing) */
function qPoints(q, s) { const m = simMax(q); if (!s || !s.done) return { score: 0, max: m }; return { score: s.score != null ? s.score : s.ok ? m : 0, max: m }; }
