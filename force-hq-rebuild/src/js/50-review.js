/* ===== Review questions (data drives the sim, worksheets, answer keys and marking schemes) ===== */
CHDATA.c1.review = [
  { id: 'r1', obj: ['Ai'], type: 'match', p: 'Match each force to what causes it.', rows: [['Weight', 'The Earth\'s gravity pulling on an object'], ['Normal force', 'A surface pushing back on an object resting on it'], ['Friction', 'Two surfaces rubbing or trying to slide past each other'], ['Tension', 'A stretched rope or string pulling'], ['Air resistance', 'Air pushing against something moving through it']] },
  { id: 'r2', obj: ['Ai'], type: 'sort', p: 'Sort these forces into contact and non-contact forces.', groups: ['Contact force', 'Non-contact force'], items: [['The pull of a magnet on a paper clip', 1], ['Friction on a sliding sledge', 0], ['The Moon\'s gravity pulling on the oceans', 1], ['The push of a foot on a football', 0], ['The upward push of a chair on you', 0], ['The weight of a parachutist', 1], ['Water resistance on a swimmer', 0]] },
  { id: 'r3', obj: ['Aii'], type: 'num', p: 'A husky has a mass of 23.5 kg. What is its weight on Earth?', ans: 230.3, unit: 'N', tol: 0.15, work: 'Weight = mass × 9.8 = 23.5 × 9.8 = 230.3 N', hints: ['Weight = mass × 9.8.', 'Type 23.5 × 9.8 into the calculator.'] },
  { id: 'r4', obj: ['Aii'], type: 'num', p: 'A crate on the arena floor has a weight of 1078 N. What is its mass?', ans: 110, unit: 'kg', tol: 0.15, work: 'Mass = weight ÷ 9.8 = 1078 ÷ 9.8 = 110 kg', hints: ['This time you know the weight. Divide it by 9.8.', 'Type 1078 ÷ 9.8 into the calculator.'] },
  { id: 'r13', obj: ['Aii'], type: 'num', p: 'In a tug-of-war, the left team pulls with 190 N and the right team pulls with 265 N. What is the size of the resultant force?', ans: 75, unit: 'N', tol: 0.5, work: 'Opposite directions, so subtract: 265 − 190 = 75 N (to the right)', hints: ['The teams pull in opposite directions.', 'Take the smaller pull away from the bigger one.'] },
  { id: 'r5', obj: ['Ai'], seed: '0', type: 'mcq', p: 'A book is lying still on a table. Which statement is true?', opts: ['Two forces act on it: its weight down and the normal force up, and they are the same size', 'No forces act on it at all, because it is not moving and nothing is pushing it', 'Only its weight acts on it, pulling it down onto the table, and nothing pushes back', 'Two forces act on it, but the normal force is bigger than its weight, so it stays put'], a: 0, work: 'Still objects still have forces on them. The weight and normal force are equal and opposite, so they cancel out.', why: { 1: 'Still things still have forces on them. What would happen if the table vanished?', 2: 'If only weight acted, the book would fall through the table.', 3: 'If the normal force were bigger, the book would rise up off the table.' } },
  { id: 'r6', obj: ['Ai'], type: 'tick', p: 'A crate is being dragged to the right across rough concrete by a rope. Tick every force acting on the crate.', opts: ['Weight', 'Normal force', 'Tension (the pull of the rope)', 'Friction', 'The force of motion', 'The crate\'s inertia force'], a: [0, 1, 2, 3], work: 'Weight, normal force, the pull of the rope and friction. "Force of motion" and "inertia force" are not real forces.' },
  { id: 'r7', type: 'fbd', p: 'Draw the free-body diagram of this crate.', scen: { id: 'c1r7', obj: 'crate', label: '34 kg', brief: '<p>A <b>34 kg crate</b> on the air floor is pulled to the right by a rope with a force of <b>150 N</b>. There is no friction on the air floor.</p>', forces: [{ type: 'weight', dir: 'down', value: 333.2 }, { type: 'normal', dir: 'up', value: 333.2 }, { type: 'pull', dir: 'right', value: 150 }] } },
  { id: 'r8', obj: ['Aii'], type: 'fbd', p: 'Draw the free-body diagram of this crate.', scen: { id: 'c1r8', obj: 'crate', label: '50 kg', brief: '<p>A <b>50 kg crate</b> is in a tug-of-war on the smooth floor. The left team pulls with <b>130 N</b> and a pony pulls right with <b>260 N</b>. The crate slides to the right, and friction on the sliding crate is <b>49 N</b>.</p><p>Draw all five forces.</p>', forces: [{ type: 'weight', dir: 'down', value: 490 }, { type: 'normal', dir: 'up', value: 490 }, { type: 'pull', dir: 'left', value: 130 }, { type: 'pull', dir: 'right', value: 260 }, { type: 'friction', dir: 'left', value: 49 }] } },
  { id: 'r9', obj: ['Ai'], type: 'gap', p: 'Forces are measured in ___. To find an object\'s weight, multiply its mass by ___. Friction always acts ___ the way an object is moving.', ans: [['newtons', 'newton', 'n'], ['9.8', 'g'], ['against', 'opposite', 'opposite to', 'the opposite way to']] },
  { id: 'r10', obj: ['Ai'], type: 'table', p: 'Complete the table to compare mass and weight.', cols: ['Mass', 'Weight'], choices: [['kilograms (kg)', 'newtons (N)', 'metres (m)'], ['kilograms (kg)', 'newtons (N)', 'metres (m)']], rows: [['Unit', [0, 1]], ['Is it a force?', [null, null]], ['Measured with', [null, null]], ['Changes on the Moon?', [null, null]]],
    build() { this.cols = ['Mass', 'Weight']; this.choices = [['kilograms (kg)', 'newtons (N)', 'No, it is not a force', 'Yes, it is a force', 'a balance (scales)', 'a newtonmeter', 'No, it stays the same', 'Yes, it gets smaller'], ['kilograms (kg)', 'newtons (N)', 'No, it is not a force', 'Yes, it is a force', 'a balance (scales)', 'a newtonmeter', 'No, it stays the same', 'Yes, it gets smaller']]; this.rows = [['Unit', [0, 1]], ['Is it a force?', [2, 3]], ['Measured with', [4, 5]], ['Changes on the Moon?', [6, 7]]]; return this; } },
  { id: 'r11', obj: ['Aii'], type: 'explain', p: 'One kid pulls a crate on rough concrete and it won\'t move. On the air floor, the same pull slides the crate easily. Explain why.', words: ['friction', 'against', 'balanced', 'unbalanced', 'resultant force'],
    model: 'On rough concrete, friction acts against the kid\'s pull. Friction matches the 60 N pull, so the forces are balanced and the resultant force is 0 N. The crate stays still. The air floor has no friction, so nothing acts against the pull. The forces are unbalanced, so there is a resultant force and the crate starts to move.',
    check: ['Says that on concrete, friction acts against the kid\'s pull', 'Says the pull and friction are balanced (the same size), so the resultant force is 0 N and the crate stays still', 'Says the air floor has no friction to act against the pull', 'Says that on the air floor the forces are unbalanced, so there is a resultant force and the crate starts to move'] }
];
CHDATA.c1.review.forEach(q => { if (q.build) q.build(); });
function reviewProgress(ch) { const R = CHDATA[ch] ? CHDATA[ch].review || [] : []; const st = dbGet('review.' + ch, {}); return { done: R.filter(q => st[q.id] && st[q.id].done).length, total: R.length, right: R.filter(q => st[q.id] && st[q.id].ok).length, points: R.reduce((a, q) => a + qPoints(q, st[q.id]).score, 0), maxPoints: R.reduce((a, q) => a + simMax(q), 0) }; }
function renderReview(ch) {
  parkLab(); const host = $('#reviewHost'), R = CHDATA[ch].review; host.innerHTML = '';
  const wrap = h('div', { class: 'review' }); host.appendChild(wrap);
  const hasCh = !!CHDATA[ch].challenge, LP = learnProgress(ch), ready = hasCh ? challengeDone(ch) : LP.done === LP.total;
  if (!ready) wrap.appendChild(h('div', { class: 'gate' }, hasCh ? `<b>The Check opens after the Challenge.</b> It checks what you learned in Learn and the Challenge. <div class="row" style="margin-top:8px"><button type="button" class="go sm" data-ctab-go="challenge">Go to the Challenge</button><button type="button" class="ghost sm" id="revAnyway">Continue anyway</button></div>` : `<b>The Check opens after the Learn steps.</b> You have done ${LP.done} of ${LP.total} so far. <div class="row" style="margin-top:8px"><button type="button" class="go sm" data-ctab-go="learn">Go to Learn</button><button type="button" class="ghost sm" id="revAnyway">Continue anyway</button></div>`));
  const body = h('div', { class: 'review', id: 'revBody' }); wrap.appendChild(body); body.hidden = !ready && !DB['revOpen_' + ch];
  const anyway = $('#revAnyway', wrap); if (anyway) anyway.addEventListener('click', () => { DB['revOpen_' + ch] = true; saveDB(); body.hidden = false; anyway.closest('.gate').remove(); });
  const bar = h('div', { class: 'revbar' }); body.appendChild(bar);
  const drawBar = () => { const P = reviewProgress(ch), st = dbGet('review.' + ch, {}); bar.innerHTML = `<b>${P.done} of ${P.total} done</b><span class="scaleNote">Points so far: ${P.points} of ${P.maxPoints}</span>${R.map((q, i) => `<button type="button" class="chip ${st[q.id] && st[q.id].done ? 'done' : ''}" data-jump="${q.id}">${i + 1}</button>`).join('')}<span style="flex:1"></span><button type="button" class="go sm" id="finishCheckTop">${finLabel(ch, true)}</button><button type="button" class="ghost sm" id="mkWs">Make my worksheet</button><button type="button" class="ghost sm" id="blankWs">Blank copy</button>`; };
  drawBar();
  body.appendChild(h('p', { class: 'scaleNote revhint' }, 'You can check each answer as you go, or answer everything and press <b>Finish</b> at the end to check them all at once.'));
  const items = [];
  R.forEach((q, i) => {
    const card = h('section', { class: 'panel revq', id: 'rq-' + q.id }); body.appendChild(card);
    const st = dbGet('review.' + ch, {})[q.id];
    card.innerHTML = `<div class="qhd"><span class="qno">Question ${i + 1}</span><span class="tlbl">${QLABEL[q.type]}</span><span class="state ${st && st.done ? 'done' : ''}">${st && st.done ? (p => `${p.score === p.max ? "✓ " : ""}${p.score} of ${p.max} point${p.max > 1 ? 's' : ''}`)(qPoints(q, st)) : 'To do'}</span></div><div class="qh"></div><p class="scaleNote">${q.type === 'explain' ? 'Write your answer, then press Check to see the model answer. Then tick each thing you included: you get a point for each one.' : q.type === 'fbd' ? 'You get one check. You score a point for each check your diagram passes.' : 'You get one go, so check your answer carefully before you press Check.'}</p>`;
    const box = renderQuestion($('.qh', card), q, { store: 'review.' + ch, mode: 'review', onDone: (qq, s) => { card.classList.toggle('done', !!s.done); $('.state', card).className = 'state ' + (s.done ? 'done' : ''); $('.state', card).textContent = s.done ? (p => `${p.score === p.max ? "✓ " : ""}${p.score} of ${p.max} point${p.max > 1 ? 's' : ''}`)(qPoints(qq, s)) : 'To do'; drawBar(); renderOnPage(); tabTicks(); } });
    items.push({ q, i, card, box });
    if (st && st.done) card.classList.add('done');
  });
  body.appendChild(h('div', { class: 'finishrow' }, `<button type="button" class="go big" id="finishCheck">${finLabel(ch, false)}</button><span class="scaleNote">Finish checks every answer you have not checked yet, then shows your score${SECTIONS.find(x => x.id === ch) ? ' and your stamp' : ''}.</span>`));
  body.appendChild(h('div', { class: 'row' }, `<button type="button" class="go" id="mkWs2">Make my worksheet</button><button type="button" class="ghost" data-act="home">Back to the home page</button>`));
  const next = SECTIONS.find(s => s.needs === ch); if (next) body.appendChild(h('div', { class: 'keepgoing' }, `<b>Finished? You can stop here and upload your ${CH.part} worksheet.</b><span>Or, if you'd like to go further, try the <b>${next.part}</b>. It takes approx. ${secMins(next.id).total} minutes and makes its own worksheet that you can upload too.</span><button type="button" class="go sm" data-open="${next.id}" style="align-self:flex-start">Go to the ${next.part} →</button>`));
  host.onclick = e => { if (e.target.closest('#finishCheck, #finishCheckTop')) { revFinish(ch, items); return; } const j = e.target.closest('[data-jump]'); if (j) $('#rq-' + j.dataset.jump).scrollIntoView({ behavior: RMOTION ? 'auto' : 'smooth', block: 'start' });
    if (e.target.id === 'mkWs' || e.target.id === 'mkWs2') makeWorksheet(ch); if (e.target.id === 'blankWs') openSheet(ch, 'blank'); };
}

/* ===== Finish: check everything, then show the score (and the stamp) ===== */
const revFinished = ch => !!dbGet('review.' + ch, {}).finished;
const finLabel = (ch, small) => revFinished(ch) ? 'See my score again' : small ? '✓ Finish: see my score' : '✓ I\'m finished: see my score and collect my stamp';
function revRefreshFinish(ch) { $$('#finishCheck, #finishCheckTop').forEach(b => { b.textContent = finLabel(ch, b.id === 'finishCheckTop'); }); }
function revGoto(id) { const el = $('#rq-' + id); if (el) { el.scrollIntoView({ behavior: RMOTION ? 'auto' : 'smooth', block: 'start' }); el.style.outline = '3px solid var(--bad)'; setTimeout(() => el.style.outline = '', 2500); } }
const finList = a => a.length < 3 ? a.join(' and ') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
function revFinish(ch, items) {
  if (revFinished(ch)) { revResults(ch); return; }                        // already marked: just show the score again
  const blanks = items.filter(it => it.box.isBlank());
  if (!blanks.length) { revRun(ch, items); return; }
  const names = blanks.map(it => 'Question ' + (it.i + 1));
  openModal(`<div class="modal finmodal" role="dialog" aria-label="Some questions are blank"><div class="fin-head">Some questions are blank</div><p><b>${blanks.length} question${blanks.length > 1 ? 's are' : ' is'} still blank:</b> ${finList(names)}. A blank question scores 0.</p><div class="row">${blanks.map((it, k) => `<button type="button" class="ghost sm" data-fgo="${it.q.id}">Go to ${names[k]}</button>`).join('')}</div><div class="row" style="justify-content:space-between"><button type="button" class="ghost" data-close>Go back</button><button type="button" class="go" id="finAnyway">Finish anyway</button></div></div>`);
  makeDraggable($('#modal .finmodal'), '.fin-head', 'fin');
  $$('#modal [data-fgo]').forEach(b => b.addEventListener('click', () => { closeModal(); revGoto(b.dataset.fgo); }));
  $('#finAnyway').addEventListener('click', () => { closeModal(); revRun(ch, items); });
}
function revRun(ch, items) {
  items.forEach(it => {                                                   // page order, the same marking as each question's own Check button
    if (it.box.isDone()) return;
    if (it.box.isBlank()) it.box.blankDone(); else it.box.autoCheck();
    if (!it.box.isDone()) it.box.blankDone();                             // safety net: nothing is left unmarked
  });
  const st = dbGet('review.' + ch, {}); st.finished = true; dbSet('review.' + ch, st);
  revRefreshFinish(ch); renderOnPage(); tabTicks();
  revResults(ch);
}
function revResults(ch) {
  const R = CHDATA[ch].review, st = dbGet('review.' + ch, {}), P = reviewProgress(ch), LP = learnProgress(ch), sec = secOf(ch), hasCh = !!CHDATA[ch].challenge;
  const learnOk = LP.done === LP.total, chalOk = challengeDone(ch), ready = learnOk && chalOk;
  const next = SECTIONS.find(s => s.needs === ch);
  const fresh = ready && giveStamp(ch);                                   // the stamp arrives with the score
  const stamped = !!dbGet('stamps', {})[ch];
  const rows = R.map((q, i) => { const p = qPoints(q, st[q.id]), cls = p.score === p.max ? 'full' : p.score ? 'part' : 'none'; return `<li class="${cls}"><span>Question ${i + 1} · ${QLABEL[q.type]}${st[q.id] && st[q.id].blank ? ' · left blank' : ''}</span><b>${p.score} of ${p.max}${p.score === p.max ? ' ✓' : ''}</b></li>`; }).join('');
  let need = '';
  if (!stamped) {
    if (!learnOk) need = `<p class="finneed">Your Check score is saved. Finish the <b>Learn steps</b> (${LP.total - LP.done} left) to collect your stamp.</p><div class="row"><button type="button" class="go sm" id="finToLearn">Go to Learn</button></div>`;
    else if (!chalOk) { const c = challengeState(ch); need = `<p class="finneed">Your Check score is saved. Finish the <b>Challenge</b> (${c.total - c.tried} left) to collect your stamp.</p><div class="row"><button type="button" class="go sm" id="finToChal">Go to the Challenge</button></div>`; }
  }
  const stampHTML = stamped ? `<div class="finstamp"><div class="stamp on ${fresh ? 'drop' : ''}" style="width:110px;height:110px;font-size:17px">${sec.stamp}</div><b>Stamp earned!</b></div>` : '';
  const stampNote = stamped ? `<p>You've finished every part of Chapter ${sec.n} ${sec.part}. Brilliant work. Your stamp is on the home page.</p>${ch === EXPLORE_AFTER ? '<p><b>Explore is now open!</b> Every control and readout is switched on, so you can test your own ideas in the Main Arena.</p>' : ''}` : '';
  openModal(`<div class="modal finmodal" role="dialog" aria-label="Your Check score"><div class="fin-head">✓ Check finished</div>
    <div class="finscore"><div><span class="lbl">Your Check score</span><h2 id="finTotal">You scored <b>${P.points} of ${P.maxPoints}</b> points</h2></div>${stampHTML}</div>
    <ul class="finlist">${rows}</ul>${stampNote}${need}
    <div class="row" style="flex-wrap:wrap"><button type="button" class="go" id="finWs">Make my worksheet</button><button type="button" class="ghost" id="finLook">Look at my answers</button>${next ? `<button type="button" class="ghost" id="finNext">Go on to ${next.part}</button>` : ''}</div></div>`);
  makeDraggable($('#modal .finmodal'), '.fin-head', 'fin');
  const on = (id, f) => { const b = $('#' + id); if (b) b.addEventListener('click', f); };
  on('finWs', () => { closeModal(); makeWorksheet(ch); });
  on('finLook', () => { closeModal(); const it = R.find(q => { const p = qPoints(q, st[q.id]); return p.score < p.max; }); revGoto(it ? it.id : R[0].id); });
  on('finNext', () => { closeModal(); openChapter(next.id); });
  on('finToLearn', () => { closeModal(); setCTab('learn'); });
  on('finToChal', () => { closeModal(); setCTab('challenge'); });
}
