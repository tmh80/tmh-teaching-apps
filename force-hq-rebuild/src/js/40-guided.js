/* ===== Guided (Learn) engine ===== */
const CHDATA = {}; // filled by chapter modules: CHDATA.c1 = {steps, challenge, review, ...}
let GI = 0, CARDS_SEEN = false, LASTSIG = '';
const stepKey = (ch, i) => `learn.${ch}.${CHDATA[ch].steps[i].id}`;
function learnProgress(ch) { const st = CHDATA[ch] ? CHDATA[ch].steps : []; const d = dbGet('learnDone.' + ch, {}); return { done: st.filter(s => d[s.id]).length, total: st.length }; }
function stepDone(ch, i) { return !!dbGet('learnDone.' + ch, {})[CHDATA[ch].steps[i].id]; }
function panelsFor(ch, i) { const d = CHDATA[ch], all = d.allSteps || d.steps, st = d.steps[i], gi = all.indexOf(st), set = new Set(); all.slice(0, gi + 1).forEach(s => (s.adds || []).forEach(p => set.add(p))); (st.hide || []).forEach(p => set.delete(p)); return set; }

function openChapter(id, tab) {
  const sec = secOf(id); if (!sec || !CHDATA[id]) return; CH = sec; const d = CHDATA[id], M = secMins(id);
  $('#chKicker').textContent = `Force Arenas · Chapter ${sec.n} · ${sec.part}`; $("#chTitle").textContent = sec.title;
  const sibs = SECTIONS.filter(s => s.ch === sec.ch);
  $('#partSw').innerHTML = sibs.map(s => `<button type="button" data-open="${s.id}" aria-pressed="${s.id === id}">${s.part}<small>approx. ${secMins(s.id).total} min</small></button>`).join('');
  $('[data-ctab=challenge]').hidden = !d.challenge;
  $('[data-ctab=learn]').textContent = `1 · Learn (approx. ${M.learn} min)`;
  if (d.challenge) $('[data-ctab=challenge]').textContent = `2 · Challenge (approx. ${M.challenge} min)`;
  $('[data-ctab=review]').textContent = `${d.challenge ? 3 : 2} · Check + worksheet (approx. ${M.review} min)`;
  if (sec.needs && !tab) { const P = learnProgress(sec.needs), need = secOf(sec.needs); if (P.done < P.total) setTimeout(() => { openModal(`<div class="modal"><h2>Have you done the ${need.part}?</h2><p>The ${sec.part} builds on the Chapter ${need.n} ${need.part}. You have finished ${P.done} of ${P.total} ${need.part} Learn steps.</p><p>It's best to finish those first, but you can carry on anyway.</p><div class="row" style="justify-content:space-between"><button type="button" class="ghost" data-open="${need.id}">Go to the ${need.part}</button><button type="button" class="go" data-close>Continue anyway →</button></div></div>`); }, 50); }
  show('vChapter'); if (sec.ch === 'c6' && !dbGet('ws.briefed', false)) setTimeout(openTransmission, 250);
  setCTab(tab || (learnProgress(id).done === learnProgress(id).total ? (d.challenge && !challengeDone(id) ? 'challenge' : 'review') : 'learn'));
}
function setCTab(t) {
  CTAB = t; $$('#chTabs [data-ctab]').forEach(b => { b.setAttribute('aria-selected', b.dataset.ctab === t); });
  $('#learnHost').hidden = t !== 'learn'; $('#challengeHost').hidden = t !== 'challenge'; $('#reviewHost').hidden = t !== 'review';
  hideCards(); closeDesk(); qUnpop();
  INTRO = false; if (t !== 'learn') parkIntro();
  if (t === 'learn') { if (!icanSeen(CH.id)) { showIntro(); tabTicks(); return; } parkIntro(); placeLab($('#learnHost')); LAB.mode = 'guided'; const d = dbGet('learnDone.' + CH.id, {}); const first = CHDATA[CH.id].steps.findIndex(s => !d[s.id]); setStep(dbGet('learnAt.' + CH.id, first < 0 ? 0 : first)); }
  else if (t === 'challenge') renderChallenge(CH.id);
  else renderReview(CH.id);
  tabTicks(); renderOnPage(); renderPeek();
}
function parkIntro() { const c = $('#icanCard'); if (c) c.remove(); }
function tabTicks() { if (!CH) return; const L = learnProgress(CH.id), R = reviewProgress(CH.id); $('[data-ctab=learn]').classList.toggle('ok', L.done === L.total); $('[data-ctab=challenge]').classList.toggle('ok', challengeDone(CH.id)); $('[data-ctab=review]').classList.toggle('ok', R.done === R.total); }
function renderOnPage() {
  if (!CH) return; if (typeof renderRescue === 'function') renderRescue(); const el = $('#onPage');
  if (CTAB === 'learn') { const L = learnProgress(CH.id); el.innerHTML = `<span class="lbl">On this page</span> <b>${L.done} of ${L.total}</b> Learn steps done ${CHDATA[CH.id].steps.map((s, i) => `<button type="button" class="chip ${stepDone(CH.id, i) ? 'done' : ''}" data-goto="${i}" title="${esc(s.title)}">${stepDone(CH.id, i) ? '✓' : i + 1}</button>`).join('')}`; }
  else if (CTAB === 'challenge') { const c = challengeState(CH.id); el.innerHTML = `<span class="lbl">On this page</span> <b>${c.tried} of ${c.total}</b> missions tried · <b>${c.score} of ${c.max}</b> objectives met. Trying every mission is enough to finish the Challenge.`; }
  else { const R = reviewProgress(CH.id); el.innerHTML = `<span class="lbl">On this page</span> <b>${R.done} of ${R.total}</b> questions done. A question turns green when you have answered it, even if it isn't right yet.`; }
}

function setStep(i) {
  leaveIntro(); gateOn(false);
  const chd = CHDATA[CH.id]; GI = clamp(i, 0, chd.steps.length - 1); dbSet('learnAt.' + CH.id, GI);
  const st = chd.steps[GI]; LASTSIG = ''; if (typeof renderFormulas === 'function' && $('#calcForm') && !$('#calcForm').hidden) renderFormulas();   // keep the glowing formulas in step with the chapter
  // arena state
  clearCh2(); S.left = []; S.right = []; S.mass = 50; S.floor = 'concrete'; S.flags = newFlags(); PSEL = null; ADDLOG = []; CALC_USED = false; JOURNAL_OPENED = false; JRUNS_SEEN = journalOpen() && JTAB === 'runs';
  LAB.sides = st.sides || ['left', 'right']; LAB.pullers = st.pullers || ['kid', 'dog', 'adult', 'strong', 'pony', 'horse']; LAB.floors = st.floors || null; LAB.showVert = true; LAB.showRes = true; LAB.idle = st.idle || null;
  if (st.setup) st.setup(); resetSim();
  LAB.show = panelsFor(CH.id, GI);
  if (!LAB.sides.length) LAB.show.delete('pal');
  applyPanels();
  LAB.onChange = () => checkStep(); LAB.tick = f => { if (st.tick) st.tick(f); checkStep(); };
  renderRail(); renderStepQs();
  const seen = dbGet('cardsSeen.' + CH.id, {});
  CARDS_SEEN = !!seen[st.id];
  qPlace(hasQs() && (stepDone(CH.id, GI) || anyAnswered()) ? 'dock' : 'hidden');
  if (!CARDS_SEEN || !stepDone(CH.id, GI)) playStepCards();
  renderOnPage(); window.scrollTo(0, 0);
}
function stepCards(ch, i) {
  const st = CHDATA[ch].steps[i]; const cards = (st.cards || []).slice();
  (st.info || []).forEach(k => INFO[k].cards.forEach(c => cards.push({ ...c, kicker: INFO[k].title })));
  return cards;
}
function playStepCards() {
  const st = CHDATA[CH.id].steps[GI], cards = stepCards(CH.id, GI);
  if (!cards.length) { cardsDone(); return; }
  const gate = readNeeded();
  showCards(cards, { title: st.title, journalKey: `${CH.id}:${st.id}`, where: `Chapter ${CH.n}: ${CH.title}`, onDone: cardsDone, readGate: readNeeded, readOK });
  if (gate) gateOn(true);
}
function cardsDone() {
  const st = CHDATA[CH.id].steps[GI]; const seen = dbGet('cardsSeen.' + CH.id, {}); seen[st.id] = true; dbSet('cardsSeen.' + CH.id, seen); CARDS_SEEN = true;
  checkStep(true); if (typeof lsAfterCards === 'function') lsAfterCards();
  if (st.tour && !dbGet('tourDone')) setTimeout(startTour, 200);
}
/* A task can carry a third item {q:'q1'}: the question it is about. The question is shown in the task (so the student always knows what to work out)
   and a number-and-unit box sits under it. What is typed there is copied into the matching "Your turn" question (draftSave in 35-questions.js). */
const taskQ = t => (t[2] && t[2].q) ? ((CHDATA[CH.id].steps[GI].qs || []).find(q => q.id === t[2].q) || null) : null;
/* The number box only suits a typed number. A pick, tick, fix or reason question has real answer controls that live in "Your turn", so its task shows the sentence with ___ for each gap and says where to answer (Tom, 3 Nov 2026: the {0} gaps and an empty tick list were confusing). */
const taskNum = q => !!q && (q.type === 'num' || q.type === 'reading');
/* a task with { reveal: flagName, answer } has a one-tap "Show the answer" (the answer stays once shown; it ticks the task together with its done()) */
const taskReveal = t => { const o = t[2] || {}; if (!o.reveal) return ''; const on = !!S.flags[o.reveal];
  return ` <button type="button" class="ghost sm" data-tkrev="${o.reveal}" ${on ? 'hidden' : ''}>Show the answer</button><span class="tkrev" ${on ? '' : 'hidden'}><b>${o.answer}</b></span>`; };
const taskHTML = t => { const q = taskQ(t); if (!q) return t[0] ? `<span class="tkdo">${t[0]}</span>${taskReveal(t)}` : '';
  const p = taskNum(q) ? q.p : String(q.p).replace(/\{\d+\}/g, '___');
  return (t[2].ask !== false ? `<span class="tkq">${p}</span>` : '') + (t[0] ? `<span class="tkdo">${t[0]}</span>` : '') + (!taskNum(q) && t[2].ask !== false ? `<span class="tkdo">${q.type === 'pick' ? 'Choose the words' : q.type === 'tick' ? 'Tick your answers' : 'Answer it'} in <b>Your turn</b>: press <b>Next: questions</b>.</span>` : ''); };
const taskPlain = t => plain(taskHTML(t).replace(/<\/span><span/g, '</span> <span'));
function hasAns(id) {
  const q = (CHDATA[CH.id].steps[GI].qs || []).find(x => x.id === id), store = stepKey(CH.id, GI), s = dbGet(store + '.' + id, null);
  return !!(q && s && s.done);   // a calculation task is finished once its answer has been checked
}
function tkAnsHTML(q) {
  const store = stepKey(CH.id, GI), s = dbGet(store + '.' + q.id, null), d = draftOf(store, q.id) || {}, U = q.units && q.units.length, done = !!(s && s.done);
  const v = done ? s.v : (d.v || ''), u = done ? (s.u || '') : (d.u || ''), dk = ` data-draft="${store}|${q.id}"`, dis = done ? ' disabled' : '';
  return `<span class="tkans${done ? ' locked ' + (s.ok ? 'ok' : 'no') : ''}" data-qid="${q.id}"><label>Your answer</label><span class="tkrow"><input class="tkin" inputmode="decimal" autocomplete="off" aria-label="Your answer to this puzzle" placeholder="number"${dk} data-dk="v" value="${esc(v)}"${dis}>${U ? `<select class="tksel" aria-label="Unit"${dk} data-dk="u"${dis}><option value="">unit?</option>${q.units.map(x => `<option value="${esc(x)}"${u === x ? ' selected' : ''}>${x}</option>`).join('')}</select>` : `<span class="unit">${q.unit || ''}</span>`}</span>${/^c6/.test(CH.id) && q.type === 'num' ? `<label class="tkwork"><span>Working (not marked)</span><textarea class="numworkin tkwk" rows="3" aria-label="Your working"${dk} data-dk="w"${dis} placeholder="Step 1: find each mechanical advantage. Step 2: multiply them. Then check with the calculator.">${esc(done ? (s.w || d.w || '') : (d.w || ''))}</textarea></label>` : ''}${done ? `<small class="tkmsg ${s.ok ? 'ok' : 'no'}">${s.ok ? '✓ ' : ''}${esc(s.msg || (s.ok ? 'Correct!' : 'Checked.'))}</small>` : `<button type="button" class="mini tkchk" data-chkq="${q.id}">Check</button><small class="tkmsg" aria-live="polite"></small>`}</span>`;
}
function bindTkAns() {
  const st = CHDATA[CH.id].steps[GI], store = stepKey(CH.id, GI);
  $$('#rail .tkans').forEach(box => {
    const q = (st.qs || []).find(x => x.id === box.dataset.qid); if (!q) return;
    const inp = $('.tkin', box), sel = $('.tksel', box), cb = $('[data-chkq]', box);
    if (inp) inp.addEventListener('input', e => draftSave(store, q.id, 'v', e.target.value, e.target));
    const wk = $('.tkwk', box); if (wk) wk.addEventListener('input', e => draftSave(store, q.id, 'w', e.target.value, e.target));
    if (sel) sel.addEventListener('change', e => draftSave(store, q.id, 'u', e.target.value, e.target));
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter' && cb) { e.preventDefault(); cb.click(); } });
    /* Check here: press the matching question's own Check button (its answer is already copied in), so Your turn shows it done. Any problem message comes back to this box. */
    if (cb) cb.addEventListener('click', () => {
      const qi = $(`#qCard .qitem[data-q="${q.id}"], #dataCard .qitem[data-q="${q.id}"]`), chk = qi && $('.qchk', qi); if (!chk) return;
      if (qi.querySelector('.ansin') && qi.querySelector('.ansin').value !== (inp ? inp.value : '')) qi.querySelector('.ansin').value = inp ? inp.value : '';
      chk.click();
      const m = $('.tkmsg', box), fb = $('.fb', qi); if (m && !qi.classList.contains('locked') && fb) { m.textContent = fb.textContent; m.className = 'tkmsg no'; }
    });
  });
}
/* after a question is checked, re-draw the answer boxes in the task list (they lock and show the result) */
function refreshTkAns() {
  const st = CHDATA[CH.id].steps[GI];
  (st.tasks || []).forEach((t, i) => { const q = taskQ(t); const li = $('#tk' + i); if (!q || !li || t[2].box === false || !taskNum(q)) return; const old = $('.tkans', li); if (old) old.outerHTML = tkAnsHTML(q); });
  bindTkAns();
}
function renderRail() {
  const chd = CHDATA[CH.id], st = chd.steps[GI];
  $('#rail').innerHTML = `<div class="row" style="justify-content:space-between"><span class="lbl">Step ${GI + 1} of ${chd.steps.length}</span><div class="dots">${chd.steps.map((s, i) => `<button type="button" aria-label="Step ${i + 1}: ${esc(s.title)}" class="${stepDone(CH.id, i) ? 'done' : ''} ${i === GI ? 'cur' : ''}" data-goto="${i}"></button>`).join('')}</div></div>
    <h2>${st.title}</h2>
    ${st.ask ? `<div class="stepask"><span class="lbl">Our question</span><p class="gl">${st.ask}</p></div>` : ''}
    <button type="button" class="rerun" id="gReread">Show the information cards again</button>
    ${st.predict ? predictBox(st) : ''}
    ${/^c6/.test(CH.id) && (st.qs || []).some(q => q.type === 'num') ? remindersHTML() : ''}
    ${st.tasks && st.tasks.length ? `<div class="lbl">Do this</div><ul class="tasks gl">${st.tasks.map((t, i) => { const q = taskQ(t); return `<li id="tk${i}"><span class="box">✓</span><span class="tkbody">${taskHTML(t)}${q && t[2].box !== false && taskNum(q) ? tkAnsHTML(q) : ''}</span></li>`; }).join('')}</ul>` : ''}
    <div id="stepDoneBox"></div>
    <button type="button" class="jbtn" data-journal><span>📓 My Journal</span></button>
    <div class="gnav"><button type="button" class="ghost" id="gPrev" ${GI === 0 && !hasICAN(CH.id) ? 'disabled' : ''}>← Back</button>${GI < chd.steps.length - 1 ? '<button type="button" class="go" id="gNext">Next →</button>' : `<button type="button" class="go" id="gNext">${chd.challenge ? 'To the Challenge →' : 'To the Check →'}</button>`}</div>`;
  $('#gReread').addEventListener('click', playStepCards);
  bindTkAns();
  { const st = CHDATA[CH.id].steps[GI]; if (st && st.predict && st.predict.kind === 'sketch' && !predSketch()) predSketchBind(st.predict); }
  $$('#rail [data-tkrev]').forEach(b => b.addEventListener('click', () => { S.flags[b.dataset.tkrev] = true; renderRail(); checkStep(); }));
  $$('#rail [data-pred]').forEach(b => b.addEventListener('click', () => { dbSet(stepKey(CH.id, GI) + '.pred', +b.dataset.pred); renderRail(); checkStep(); }));
  $('#gPrev').addEventListener('click', () => { if (GI === 0) { if (hasICAN(CH.id)) showIntro(); } else setStep(GI - 1); });
  $('#gNext').addEventListener('click', tryNext);
}
/* "Predict first": the student locks in a prediction before testing it in the arena */
const predOf = () => dbGet(stepKey(CH.id, GI) + '.pred', null);
function predictBox(st) {
  const P = st.predict, v = predOf();
  if (P.kind === 'sketch') return predSketchHTML(P, predSketch());
  return v == null ? `<div class="predict"><span class="lbl">Predict first</span><p class="gl">${P.q}</p><div class="popts">${P.opts.map((o, i) => `<button type="button" class="mini" data-pred="${i}">${o}</button>`).join('')}</div></div>`
    : `<div class="predict done"><span class="lbl">Your prediction</span><p class="gl"><b>${P.opts[v]}</b></p><p class="scaleNote">${P.then || 'Now test it in the arena and see if you were right!'}</p></div>`;
}
function renderStepQs() {
  const st = CHDATA[CH.id].steps[GI], qc = $('#qCard'), dc = $('#dataCard'); qc.innerHTML = ''; dc.innerHTML = '';
  const qs = st.qs || [];
  qc.appendChild(h('div', { class: 'qhead' }));
  if (st.ctx) qc.appendChild(h('div', { class: 'qctx' }, st.ctx()));   // the question and the student's own graph, beside the questions
  /* a question marked early collects data while the student works the arena (the freeze-frame table), so it sits under the arena from the start instead of waiting in the Your turn box */
  const early = qs.filter(q => q.early); dc.hidden = !early.length;
  if (early.length) dc.appendChild(h('div', { class: 'dchead' }, st.dataHead || '<b>Collect your data here</b><span>Pause the drop at each moment listed. The row fills itself in; then type its numbers from the free-body diagram.</span>'));
  qs.forEach(q => renderQuestion(q.early ? dc : qc, q, { store: stepKey(CH.id, GI), mode: 'learn', onDone: () => { refreshTkAns(); checkStep(true); if (typeof labChanged === 'function') labChanged(); if (typeof journalOpen === 'function' && journalOpen()) renderJournal(); } }));
  if (st.more) {   // "Another one": fresh seeded questions from the maths bank (not scored; every right answer goes into the Journal as evidence)
    const wrap = h('div', { class: 'more' }, `<p class="scaleNote">Want more practice? Every new question you get right is saved in your Journal.</p><div class="morebtns">${st.more.map(L => `<button type="button" class="mini" data-more="${L}">Another level ${L} question</button>`).join('')}</div><div class="morehost"></div>`);
    wrap.addEventListener('click', e => { const b = e.target.closest('[data-more]'); if (!b) return; const n = dbGet('moreN', 0) + 1; dbSet('moreN', n); renderQuestion($('.morehost', wrap), MBMORE(+b.dataset.more, n), { store: 'more.' + CH.id }); });
    qc.appendChild(wrap);
  }
  if (stepDone(CH.id, GI) && (qs.length || (st.tasks || []).length)) { const b = h('button', { type: 'button', class: 'again' }, '↺ Try this step again'); b.addEventListener('click', () => { dbDel(stepKey(CH.id, GI)); const d = dbGet('learnDone.' + CH.id, {}); delete d[st.id]; dbSet('learnDone.' + CH.id, d); setStep(GI); }); qc.appendChild(b); }
  qc.appendChild(h('div', { class: 'qfoot' }));
  qChrome();
}

/* ---------- the Your turn box: hidden until Next, then front and centre; it can be minimised to the left column ---------- */
let QSTATE = 'hidden';
const hasQs = () => !!(CH && (CHDATA[CH.id].steps[GI].qs || []).length);
function anyAnswered() { const st = CHDATA[CH.id].steps[GI]; return (st.qs || []).some(q => dbGet(stepKey(CH.id, GI) + '.' + q.id, null)); }
function qCounts() { const st = CHDATA[CH.id].steps[GI], qs = st.qs || []; return { done: qs.filter(q => { const v = dbGet(stepKey(CH.id, GI) + '.' + q.id, null); return v && v.done; }).length, total: qs.length }; }
function qPlace(state) {
  if (state !== 'hidden' && !hasQs()) state = 'hidden';
  QSTATE = state; const qc = $('#qCard'), pop = $('#qPop');
  if (state === 'pop') { $('#qPopBox').appendChild(qc); qc.hidden = false; pop.hidden = false; $('#qPopBox').scrollTop = 0; qPosApply(); }
  else { $('#lab .leftcol').appendChild(qc); pop.hidden = true; qc.hidden = state === 'hidden'; }
  qc.classList.toggle('popped', state === 'pop'); qc.classList.toggle('docked', state === 'dock');
  qChrome();
  if (state === 'pop') { const f = qc.querySelector('.qitem input, .qitem select, .qitem button'); if (f) setTimeout(() => f.focus({ preventScroll: true }), 40); }
}
/* the pop-up is dragged by its header with the shared makeDraggable helper (00-util.js) */
function qPosApply() { const b = $('#qPopBox'); if (b) dragPlace(b, 'qpop', '.qhead'); }
function qDragInit() { makeDraggable($('#qPopBox'), '.qhead', 'qpop', () => QSTATE === 'pop'); }
function qUnpop() { if (QSTATE === 'pop') qPlace('dock'); }
function qChrome() {
  const qc = $('#qCard'), hd = qc && $('.qhead', qc), ft = qc && $('.qfoot', qc); if (!hd || !CH) return;
  const c = qCounts(), done = stepDone(CH.id, GI) || (c.total && c.done === c.total);
  if (QSTATE === 'pop') {
    hd.innerHTML = `<span class="qgrip" aria-hidden="true">⠿</span><span>Your turn</span><small>${c.done} of ${c.total} done</small><button type="button" class="qmin" id="qMin" aria-label="Minimise the questions">▾ Minimise</button><p class="qtip">Need to see the arena? Drag this bar to move the box out of the way, or minimise it and tap Your turn to bring it back.</p>`;
    $('#qMin').addEventListener('click', () => qPlace('dock'));
    const last = GI === CHDATA[CH.id].steps.length - 1, chd = CHDATA[CH.id];
    ft.innerHTML = `<button type="button" class="ghost" id="qBack">← Back to the arena</button><button type="button" class="go ${done ? 'ready' : ''}" id="qNext">${last ? (chd.challenge ? 'To the Challenge →' : 'To the Check →') : 'Next step →'}</button>`;
    $('#qBack').addEventListener('click', () => qPlace('dock')); $('#qNext').addEventListener('click', tryNext);
    const old = $('.qrunsbtn', qc); if (old) old.remove();
    if (['run', 'shove', 'launch', 'drop'].some(k => LAB.show.has(k))) hd.insertAdjacentHTML('afterend', qRunsHTML());
  } else {
    hd.innerHTML = `<button type="button" class="qopen2" id="qOpen" aria-label="Open the questions"><span><b>Your turn</b><small>${done ? '✓ All answered' : `${c.done} of ${c.total} done`}</small></span><span class="qgo">⤢ Open</span></button>`;
    $('#qOpen').addEventListener('click', () => qPlace('pop')); const old = $('.qrunsbtn', qc); if (old) old.remove();
    ft.innerHTML = '';
  }
  const n = $('#gNext'); if (n && !stepDone(CH.id, GI) && hasQs() && !done) n.textContent = 'Next: questions →';
}
function taskState() { const st = CHDATA[CH.id].steps[GI]; const done = stepDone(CH.id, GI); return (st.tasks || []).map(t => done || !!t[1]()); }
function qsDone() { const st = CHDATA[CH.id].steps[GI]; return (st.qs || []).every(q => { const s = dbGet(stepKey(CH.id, GI) + '.' + q.id, null); return s && s.done; }); }
/* "Check it" reading questions (q.auto) complete themselves once the student has made the run happen in the simulation, so nobody has to type a number they have just worked out */
function autoQs() {
  const st = CHDATA[CH.id].steps[GI], store = stepKey(CH.id, GI); let n = 0;
  (st.qs || []).forEach(q => {
    if (!q.auto || !q.need || !q.live) return; const old = dbGet(store + '.' + q.id, null); if (old && old.done) return;
    if (!q.need()) return; const v = q.live(); if (v == null || isNaN(v)) return;
    dbSet(store + '.' + q.id, { tries: 1, first: true, ok: true, v: String(fmt(v, 2)), ans: v, max: simMax(q), score: simMax(q), msg: q.ok || 'Checked in the simulation.', done: true, auto: true }); n++;
  });
  if (n) { renderStepQs(); refreshTkAns(); }
}
function checkStep(force) {
  if (VIEW !== 'vChapter' || CTAB !== 'learn' || !CH) return;
  if (typeof frzAuto === 'function') frzAuto();
  autoQs();
  const ts = taskState(), qd = qsDone(), all = ts.every(Boolean) && qd && CARDS_SEEN, sig = ts.join() + qd + all + CARDS_SEEN;
  if (sig === LASTSIG && !force) return; LASTSIG = sig;
  ts.forEach((ok, i) => { const li = $('#tk' + i); if (li) li.classList.toggle('ok', ok); });
  if (all && !stepDone(CH.id, GI)) {
    const d = dbGet('learnDone.' + CH.id, {}); d[CHDATA[CH.id].steps[GI].id] = true; dbSet('learnDone.' + CH.id, d);
    renderRail(); renderOnPage(); tabTicks(); toast('Step complete! Press Next when you\'re ready.' + (CHDATA[CH.id].steps[GI].rescue ? ' Rescue log: ' + CHDATA[CH.id].steps[GI].rescue : ''), 'good'); maybeStamp(CH.id);
  }
  qChrome(); qRefresh();
  const n = $('#gNext'); if (n) n.classList.toggle('ready', all || stepDone(CH.id, GI) || (hasQs() && !qsDone() && ts.every(Boolean) && CARDS_SEEN));
  const box = $('#stepDoneBox'); if (box) { const rl = CHDATA[CH.id].steps[GI].rescue; box.innerHTML = stepDone(CH.id, GI) ? '<div class="stepdone">✓ Step complete</div>' + (CHDATA[CH.id].steps[GI].finish ? `<p class="gl stepfin">${CHDATA[CH.id].steps[GI].finish}</p>` : '') + (rl ? `<div class="rlog">📡 Rescue log: ${rl}</div>` : '') : ''; }
  $$('#rail .tasks li').forEach((li, i) => li.classList.toggle('ok', ts[i]));
}
function tryNext() {
  const chd = CHDATA[CH.id], last = GI === chd.steps.length - 1;
  const go = () => { if (last) setCTab(chd.challenge ? 'challenge' : 'review'); else setStep(GI + 1); };
  if (stepDone(CH.id, GI)) { go(); return; }
  if (hasQs() && !qsDone() && QSTATE !== 'pop') {
    const left = []; if (!CARDS_SEEN) left.push('read the information cards'); taskState().forEach((ok, i) => { if (!ok && !taskQ(chd.steps[GI].tasks[i])) left.push(taskPlain(chd.steps[GI].tasks[i])); });   // a task that is a question is answered in Your turn, which Next opens, so it is not nagged about (Tom, 3 Nov 2026)
    if (!left.length) { qPlace('pop'); return; }
    openModal(`<div class="modal"><h2>Have you finished the Do this list?</h2><p>The questions are about what you see in the arena, so it helps to finish these first:</p><ul>${left.map(t => `<li>${esc(t)}</li>`).join('')}</ul><div class="row" style="justify-content:space-between"><button type="button" class="ghost" data-close>Go back to the arena</button><button type="button" class="go" id="contAnyway">Continue anyway →</button></div></div>`);
    $('#contAnyway').addEventListener('click', () => { closeModal(); qPlace('pop'); });
    return;
  }
  const todo = []; if (!CARDS_SEEN) todo.push('read the information cards'); taskState().forEach((ok, i) => { if (!ok) todo.push(taskPlain(chd.steps[GI].tasks[i])); });
  (chd.steps[GI].qs || []).forEach(q => { const s = dbGet(stepKey(CH.id, GI) + '.' + q.id, null); if (!(s && s.done)) todo.push('answer: ' + plain(q.p).slice(0, 80)); });
  openModal(`<div class="modal"><h2>This step isn't finished yet</h2><p>You still need to:</p><ul>${todo.map(t => `<li>${esc(t)}</li>`).join('')}</ul><p>You can carry on anyway and come back later.</p><div class="row" style="justify-content:space-between"><button type="button" class="ghost" data-close>Stay here</button><button type="button" class="go" id="contAnyway">Continue anyway →</button></div></div>`);
  $('#contAnyway').addEventListener('click', () => { closeModal(); qUnpop(); go(); });
}

/* ---------- short first-run tour ---------- */
const TOUR = [
  ['#cvScene', 'This is the Main Arena. Everything you change shows up here straight away.'],
  ['#rail .tasks', 'Your jobs for each step are in the Do this list. They tick themselves when you have done them.'],
  ['#gNext', 'When you have done the jobs, press Next. Your questions pop up in the middle of the screen. Minimise them whenever you need the arena again.'],
  ['#rail [data-journal]', 'Your Journal keeps your runs, the cards you read and the key words you meet. Open it whenever you need a reminder.'],
  ['#calcFab', 'Need to do some maths? Open the calculator here. Its g key is 9.8 N/kg.'],
  ['#saveWorkBtn', 'Press Save my work at any time to save everything you have done so far as a PDF.']
];
let tourEl = null;
function startTour(k = 0) {
  endTour(); const vis = TOUR.filter(t => { const e = $(t[0]); return e && e.offsetParent; }); if (k >= vis.length) { dbSet('tourDone', true); if (LAB.onChange) LAB.onChange(); return; }
  const [sel, text] = vis[k], el = $(sel); el.classList.add('coachhi'); el.scrollIntoView({ block: 'nearest' });
  tourEl = h('div', { class: 'chunk', style: 'position:fixed;z-index:80;max-width:340px' }, `<div class="chead"><span class="lbl">Quick tour · ${k + 1} of ${vis.length}</span><button type="button" class="cx" aria-label="Skip the tour">✕</button></div><div class="gbody">${text}</div><div class="cnav"><span class="cdots"></span><button type="button" class="go">${k === vis.length - 1 ? 'Finish ✓' : 'Next ›'}</button></div>`);
  document.body.appendChild(tourEl);
  const r = el.getBoundingClientRect(), w = Math.min(340, innerWidth - 20); tourEl.style.width = w + 'px';
  let top = r.bottom + 10; if (top + 170 > innerHeight) top = Math.max(10, r.top - 180); tourEl.style.top = top + 'px'; tourEl.style.left = clamp(r.left, 10, innerWidth - w - 10) + 'px';
  $('.go', tourEl).addEventListener('click', () => startTour(k + 1)); $('.cx', tourEl).addEventListener('click', () => { endTour(); dbSet('tourDone', true); if (LAB.onChange) LAB.onChange(); });
}
function endTour() { if (tourEl) tourEl.remove(); tourEl = null; unhi(); }
function maybeTour() { }

/* ---------- stamps: every part of the chapter finished ---------- */
/* the stamp comes when the Check has been finished with the Finish button (never in the middle of a Check) and Learn and the Challenge are done.
   Called when the last Learn step or the Challenge is completed; the Finish button's results pop-up gives the stamp itself when everything is already done. */
function maybeStamp(id) { const L = learnProgress(id); if (L.done === L.total && challengeDone(id) && dbGet('review.' + id, {}).finished) awardStamp(id); }

/* ---------- the diagram desk (FBD builder over the stage card) ---------- */
function openDesk(q, store) {
  qUnpop();
  const d = $('#desk'); d.hidden = false; $('#lab .stagecard').classList.add('desking'); window.scrollTo(0, 0);
  d.innerHTML = `<div class="deskhead"><div><span class="lbl">Diagram desk</span><h3>${q.deskTitle || 'Draw the free-body diagram'}</h3></div><button type="button" class="ghost sm" id="deskClose">Back to the arena</button></div><div class="deskbody"></div>`;
  const body = $('.deskbody', d); renderQuestion(body, { ...q, type: 'fbd', p: '' }, { store, mode: 'learn', onDone: () => { renderStepQs(); checkStep(true); } });
  $('#deskClose').addEventListener('click', () => { closeDesk(); renderStepQs(); checkStep(true); });
}
function closeDesk() { const d = $('#desk'); if (d) { d.hidden = true; d.innerHTML = ''; $('#lab .stagecard').classList.remove('desking'); } }
QT.desk = {
  html(q, s) { const st = s && s.v && s.v.lastRes; return `<div class="chipsrow">${st ? st.chips.map(([, l, ok]) => `<span class="ck ${ok ? 'on' : ''}">${ok ? '✓ ' : ''}${l}</span>`).join('') : '<span class="ck">Not drawn yet</span>'}</div><button type="button" class="go sm qopen" style="align-self:flex-start">✏️ ${s && s.v && s.v.arrows && s.v.arrows.length ? 'Open my diagram' : 'Open the diagram desk'}</button>`; },
  bind(el, q, api) { $('.qopen', el).addEventListener('click', () => openDesk(q, api.storePath)); },
  show: QT.fbd.show, model: QT.fbd.model
};
QLABEL.desk = 'Draw it: free-body diagram';
