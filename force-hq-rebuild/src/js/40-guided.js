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
  show('vChapter'); setCTab(tab || (learnProgress(id).done === learnProgress(id).total ? (d.challenge && !challengeDone(id) ? 'challenge' : 'review') : 'learn'));
}
function setCTab(t) {
  CTAB = t; $$('#chTabs [data-ctab]').forEach(b => { b.setAttribute('aria-selected', b.dataset.ctab === t); });
  $('#learnHost').hidden = t !== 'learn'; $('#challengeHost').hidden = t !== 'challenge'; $('#reviewHost').hidden = t !== 'review';
  hideCards(); closeDesk(); qUnpop();
  if (t === 'learn') { placeLab($('#learnHost')); LAB.mode = 'guided'; const d = dbGet('learnDone.' + CH.id, {}); const first = CHDATA[CH.id].steps.findIndex(s => !d[s.id]); setStep(dbGet('learnAt.' + CH.id, first < 0 ? 0 : first)); }
  else if (t === 'challenge') renderChallenge(CH.id);
  else renderReview(CH.id);
  tabTicks(); renderOnPage();
}
function tabTicks() { if (!CH) return; const L = learnProgress(CH.id), R = reviewProgress(CH.id); $('[data-ctab=learn]').classList.toggle('ok', L.done === L.total); $('[data-ctab=challenge]').classList.toggle('ok', challengeDone(CH.id)); $('[data-ctab=review]').classList.toggle('ok', R.done === R.total); }
function renderOnPage() {
  if (!CH) return; const el = $('#onPage');
  if (CTAB === 'learn') { const L = learnProgress(CH.id); el.innerHTML = `<span class="lbl">On this page</span> <b>${L.done} of ${L.total}</b> Learn steps done ${CHDATA[CH.id].steps.map((s, i) => `<button type="button" class="chip ${stepDone(CH.id, i) ? 'done' : ''}" data-goto="${i}" title="${esc(s.title)}">${stepDone(CH.id, i) ? '✓' : i + 1}</button>`).join('')}`; }
  else if (CTAB === 'challenge') { const c = challengeState(CH.id); el.innerHTML = `<span class="lbl">On this page</span> <b>${c.tried} of ${c.total}</b> missions tried · <b>${c.score} of ${c.max}</b> objectives met. Trying every mission is enough to finish the Challenge.`; }
  else { const R = reviewProgress(CH.id); el.innerHTML = `<span class="lbl">On this page</span> <b>${R.done} of ${R.total}</b> questions done. A question turns green when you have answered it, even if it isn't right yet.`; }
}

function setStep(i) {
  const chd = CHDATA[CH.id]; GI = clamp(i, 0, chd.steps.length - 1); dbSet('learnAt.' + CH.id, GI);
  const st = chd.steps[GI]; LASTSIG = '';
  // arena state
  clearCh2(); S.left = []; S.right = []; S.mass = 50; S.floor = 'concrete'; S.flags = newFlags(); PSEL = null; ADDLOG = []; CALC_USED = false; JOURNAL_OPENED = false;
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
  showCards(cards, { title: st.title, journalKey: `${CH.id}:${st.id}`, where: `Chapter ${CH.n}: ${CH.title}`, onDone: cardsDone });
}
function cardsDone() {
  const st = CHDATA[CH.id].steps[GI]; const seen = dbGet('cardsSeen.' + CH.id, {}); seen[st.id] = true; dbSet('cardsSeen.' + CH.id, seen); CARDS_SEEN = true;
  checkStep(true);
  if (st.tour && !dbGet('tourDone')) setTimeout(startTour, 200);
}
function renderRail() {
  const chd = CHDATA[CH.id], st = chd.steps[GI];
  $('#rail').innerHTML = `<div class="row" style="justify-content:space-between"><span class="lbl">Step ${GI + 1} of ${chd.steps.length}</span><div class="dots">${chd.steps.map((s, i) => `<button type="button" aria-label="Step ${i + 1}: ${esc(s.title)}" class="${stepDone(CH.id, i) ? 'done' : ''} ${i === GI ? 'cur' : ''}" data-goto="${i}"></button>`).join('')}</div></div>
    <h2>${st.title}</h2>
    <button type="button" class="rerun" id="gReread">Show the information cards again</button>
    ${st.predict ? predictBox(st) : ''}
    ${st.tasks && st.tasks.length ? `<div class="lbl">Do this</div><ul class="tasks gl">${st.tasks.map((t, i) => `<li id="tk${i}"><span class="box">✓</span><span>${t[0]}</span></li>`).join('')}</ul>` : ''}
    <div id="stepDoneBox"></div>
    <button type="button" class="jbtn" data-journal><span>📓 My Journal</span><span class="jc">${dbGet('journal', { order: [] }).order.length}</span></button>
    <div class="gnav"><button type="button" class="ghost" id="gPrev" ${GI === 0 ? 'disabled' : ''}>← Back</button>${GI < chd.steps.length - 1 ? '<button type="button" class="go" id="gNext">Next →</button>' : `<button type="button" class="go" id="gNext">${chd.challenge ? 'To the Challenge →' : 'To the Check →'}</button>`}</div>`;
  $('#gReread').addEventListener('click', playStepCards);
  $$('#rail [data-pred]').forEach(b => b.addEventListener('click', () => { dbSet(stepKey(CH.id, GI) + '.pred', +b.dataset.pred); renderRail(); checkStep(); }));
  $('#gPrev').addEventListener('click', () => setStep(GI - 1));
  $('#gNext').addEventListener('click', tryNext);
}
/* "Predict first": the student locks in a prediction before testing it in the arena */
const predOf = () => dbGet(stepKey(CH.id, GI) + '.pred', null);
function predictBox(st) {
  const P = st.predict, v = predOf();
  return v == null ? `<div class="predict"><span class="lbl">Predict first</span><p class="gl">${P.q}</p><div class="popts">${P.opts.map((o, i) => `<button type="button" class="mini" data-pred="${i}">${o}</button>`).join('')}</div></div>`
    : `<div class="predict done"><span class="lbl">Your prediction</span><p class="gl"><b>${P.opts[v]}</b></p><p class="scaleNote">${P.then || 'Now test it in the arena and see if you were right!'}</p></div>`;
}
function renderStepQs() {
  const st = CHDATA[CH.id].steps[GI], qc = $('#qCard'); qc.innerHTML = '';
  const qs = st.qs || [];
  qc.appendChild(h('div', { class: 'qhead' }));
  qs.forEach(q => renderQuestion(qc, q, { store: stepKey(CH.id, GI), mode: 'learn', onDone: () => checkStep(true) }));
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
    const old = $('.qruns', qc); if (old) old.remove();
    if (['run', 'shove', 'launch'].some(k => LAB.show.has(k))) hd.insertAdjacentHTML('afterend', qRunsHTML());
  } else {
    hd.innerHTML = `<button type="button" class="qopen2" id="qOpen" aria-label="Open the questions"><span><b>Your turn</b><small>${done ? '✓ All answered' : `${c.done} of ${c.total} done`}</small></span><span class="qgo">⤢ Open</span></button>`;
    $('#qOpen').addEventListener('click', () => qPlace('pop')); const old = $('.qruns', qc); if (old) old.remove();
    ft.innerHTML = '';
  }
  const n = $('#gNext'); if (n && !stepDone(CH.id, GI) && hasQs() && !done) n.textContent = 'Next: questions →';
}
function taskState() { const st = CHDATA[CH.id].steps[GI]; const done = stepDone(CH.id, GI); return (st.tasks || []).map(t => done || !!t[1]()); }
function qsDone() { const st = CHDATA[CH.id].steps[GI]; return (st.qs || []).every(q => { const s = dbGet(stepKey(CH.id, GI) + '.' + q.id, null); return s && s.done; }); }
function checkStep(force) {
  if (VIEW !== 'vChapter' || CTAB !== 'learn' || !CH) return;
  const ts = taskState(), qd = qsDone(), all = ts.every(Boolean) && qd && CARDS_SEEN, sig = ts.join() + qd + all + CARDS_SEEN;
  if (sig === LASTSIG && !force) return; LASTSIG = sig;
  ts.forEach((ok, i) => { const li = $('#tk' + i); if (li) li.classList.toggle('ok', ok); });
  if (all && !stepDone(CH.id, GI)) {
    const d = dbGet('learnDone.' + CH.id, {}); d[CHDATA[CH.id].steps[GI].id] = true; dbSet('learnDone.' + CH.id, d);
    renderRail(); renderOnPage(); tabTicks(); toast('Step complete! Press Next when you\'re ready.', 'good'); maybeStamp(CH.id);
  }
  qChrome();
  const n = $('#gNext'); if (n) n.classList.toggle('ready', all || stepDone(CH.id, GI) || (hasQs() && !qsDone() && ts.every(Boolean) && CARDS_SEEN));
  const box = $('#stepDoneBox'); if (box) box.innerHTML = stepDone(CH.id, GI) ? '<div class="stepdone">✓ Step complete</div>' : '';
  $$('#rail .tasks li').forEach((li, i) => li.classList.toggle('ok', ts[i]));
}
function tryNext() {
  const chd = CHDATA[CH.id], last = GI === chd.steps.length - 1;
  const go = () => { if (last) setCTab(chd.challenge ? 'challenge' : 'review'); else setStep(GI + 1); };
  if (stepDone(CH.id, GI)) { go(); return; }
  if (hasQs() && !qsDone() && QSTATE !== 'pop') {
    const left = []; if (!CARDS_SEEN) left.push('read the information cards'); taskState().forEach((ok, i) => { if (!ok) left.push(plain(chd.steps[GI].tasks[i][0])); });
    if (!left.length) { qPlace('pop'); return; }
    openModal(`<div class="modal"><h2>Have you finished the Do this list?</h2><p>The questions are about what you see in the arena, so it helps to finish these first:</p><ul>${left.map(t => `<li>${esc(t)}</li>`).join('')}</ul><div class="row" style="justify-content:space-between"><button type="button" class="ghost" data-close>Go back to the arena</button><button type="button" class="go" id="contAnyway">Continue anyway →</button></div></div>`);
    $('#contAnyway').addEventListener('click', () => { closeModal(); qPlace('pop'); });
    return;
  }
  const todo = []; if (!CARDS_SEEN) todo.push('read the information cards'); taskState().forEach((ok, i) => { if (!ok) todo.push(plain(chd.steps[GI].tasks[i][0])); });
  (chd.steps[GI].qs || []).forEach(q => { const s = dbGet(stepKey(CH.id, GI) + '.' + q.id, null); if (!(s && s.done)) todo.push('answer: ' + plain(q.p).slice(0, 80)); });
  openModal(`<div class="modal"><h2>This step isn't finished yet</h2><p>You still need to:</p><ul>${todo.map(t => `<li>${esc(t)}</li>`).join('')}</ul><p>You can carry on anyway and come back later.</p><div class="row" style="justify-content:space-between"><button type="button" class="ghost" data-close>Stay here</button><button type="button" class="go" id="contAnyway">Continue anyway →</button></div></div>`);
  $('#contAnyway').addEventListener('click', () => { closeModal(); qUnpop(); go(); });
}

/* ---------- short first-run tour ---------- */
const TOUR = [
  ['#cvScene', 'This is the Main Arena. Everything you change shows up here straight away.'],
  ['#rail .tasks', 'Your jobs for each step are in the Do this list. They tick themselves when you have done them.'],
  ['#gNext', 'When you have done the jobs, press Next. Your questions pop up in the middle of the screen. Minimise them whenever you need the arena again.'],
  ['#rail [data-journal]', 'Every information card you read is saved in your Journal. Open it whenever you need a reminder.'],
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
function maybeStamp(id) { const L = learnProgress(id), R = reviewProgress(id); if (L.done === L.total && challengeDone(id) && R.done === R.total) awardStamp(id); }

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
