/* ===== Maths Gym: adaptive F = m × a practice (the screens) =====
   Questions come from prGen (66-practice-gen.js). This file is the view (vPractice), the home card, the Chapter 3 reminder, the level meter,
   the question card with its picture and force sketch, the adaptive engine (plan section 2), two tries per question, the "Changing units" teach card,
   the end screen, the summary PDF, the Gym section of "My work so far" and the teacher-page row. Plan: docs/Force_HQ_Practice_Plan.md.
   Everything is saved in DB.prac (see pgData), so the 💾 Save progress backup carries it automatically. */
const PG_GO = 10;          // questions in one go (approx. 15 min)
let PG_MIX = 0.2;          // about 1 question in 5 comes from the level below (the tests set this to 0)
const PG_LEVELS = ['Find the force', 'Divide to find a or m', 'Decimals', 'Two steps: resultant first', 'Two steps: weight or velocity', 'Stretch'];
const PG_UP = ['', 'Level 2 unlocked: dividing to find a or m!', 'Level 3 unlocked: decimals!', 'Level 4 unlocked: two-step problems!', 'Level 5 unlocked: weight and velocity problems!', 'Level 6 unlocked: stretch problems!'];
const PG_TARGETS = { none: 'Free practice (no target)', l3: 'Reach level 3', l4: 'Reach level 4', l5: 'Reach level 5', l6: 'Reach level 6', r10: 'Get 10 questions right', r20: 'Get 20 questions right', r30: 'Get 30 questions right' };
const PG_TMIN = { l3: 15, r10: 15, l4: 20, r20: 20, l5: 30, l6: 30, r30: 30 };   // teacher page: approx. minutes for each target
const PG_TRAPNAME = {
  mult: 'Multiplied instead of dividing', flip: 'Divided the wrong way round', div: 'Divided instead of multiplying', add: 'Added instead of multiplying',
  weightAsMass: 'Used the weight as the mass', oneForce: 'Used one force, not the resultant force', noWeight: 'Forgot the weight', addOpp: 'Added forces that point opposite ways',
  g10: 'Used g = 10 instead of 9.8', earthG: 'Used Earth\'s g on another world', noConvert: 'Forgot to change the units to kg', convWay: 'Changed the units the wrong way',
  earlyRound: 'Rounded too early', noFriction: 'Forgot to add the friction on', subFric: 'Took the friction away instead of adding it', gaveResultant: 'Gave the resultant force, not the friction',
  noStart: 'Forgot the starting velocity', noTime: 'Forgot to divide by the time', dvTimes: 'Multiplied by the time instead of dividing', notDiff: 'Gave one acceleration, not the difference',
  unit: 'Right number, wrong unit'
};
const PG_QTY = { N: 'force', kg: 'mass', 'm/s²': 'acceleration', 'm/s': 'velocity' };
const PGV = { mode: 'play', q: null, uStep: 0, uAuto: false, uBack: 'play', triOpen: null, gapOk: false };

/* ---------- saved data (every read tolerates missing or odd data) ---------- */
function pgData() {
  const d = dbGet('prac', null), o = d && typeof d === 'object' ? d : {};
  const n = (x, lo, hi, df) => { const v = Math.round(+x); return isFinite(v) ? clamp(v, lo, hi) : df; }, obj = x => x && typeof x === 'object' && !Array.isArray(x) ? x : {};
  const P = {
    level: n(o.level, 1, 6, 1), run: n(o.run, 0, 3, 0), wrongRun: n(o.wrongRun, 0, 2, 0), best: n(o.best, 1, 6, 1), seedN: n(o.seedN, 0, 1e9, 0), goes: n(o.goes, 0, 1e6, 0),
    target: PG_TARGETS[o.target] ? o.target : 'none', tAt: n(o.tAt, 0, 1e9, 0), unitsDone: !!o.unitsDone, unitsSeen: !!o.unitsSeen, right: n(o.right, 0, 1e9, 0), asked: n(o.asked, 0, 1e9, 0),
    hist: Array.isArray(o.hist) ? o.hist.filter(x => x && typeof x === 'object') : [], skills: obj(o.skills), traps: obj(o.traps),
    cur: o.cur && typeof o.cur === 'object' && o.cur.seed != null ? o.cur : null, go: o.go && typeof o.go === 'object' ? o.go : null, lastGo: o.lastGo && typeof o.lastGo === 'object' ? o.lastGo : null,
    twin: o.twin && typeof o.twin === 'object' ? o.twin : null
  };
  P.best = Math.max(P.best, P.level);
  return P;
}
const pgSave = P => dbSet('prac', P);
const pgPlural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
const pgLearnDone = id => { if (!CHDATA[id]) return false; const L = learnProgress(id); return L.total > 0 && L.done === L.total; };
/* Chapter 3 Foundation counts as finished once its stamp is earned or its Learn steps are all done (that is where F = m × a and the triangle are taught) */
const pgC3Done = () => !!dbGet('stamps', {}).c3f || pgLearnDone('c3f');
const pgWorldsOk = () => isTeacher() || (pgLearnDone('c5f') && pgLearnDone('c5x'));
const pgOpts = P => ({ worlds: pgWorldsOk(), units: isTeacher() || P.unitsDone, recent: P.hist.slice(-3).map(x => x.kind) });
const pgNewGo = P => ({ n: 0, right: 0, top: P.level, start: P.level, skills: {}, traps: {}, t: Date.now() });

/* ---------- targets ---------- */
function pgTargetState(P) {
  const t = P.target; if (t === 'none') return { on: false };
  const k = +t.slice(1);
  if (t[0] === 'l') return { on: true, lvl: true, n: k, have: P.best, done: P.best >= k, label: PG_TARGETS[t], prog: `best so far: level ${P.best}` };
  const have = Math.max(0, P.right - P.tAt);
  return { on: true, lvl: false, n: k, have, done: have >= k, label: PG_TARGETS[t], prog: `${Math.min(have, k)} of ${k} right` };
}

/* ---------- the engine ---------- */
/* the next question: a twin after a level down, sometimes one from the level below, otherwise one at the student's level */
function pgNewQ(P) {
  const opts = pgOpts(P); let q = null, lvl = P.level, low = false, twin = false;
  if (P.twin) {
    const tw = P.twin; P.twin = null;
    if (PR_LEVEL_KINDS[tw.lvl - 1] && PR_LEVEL_KINDS[tw.lvl - 1].includes(tw.kind)) {
      const o2 = Object.assign({}, opts, { recent: PR_LEVEL_KINDS[tw.lvl - 1].filter(k => k !== tw.kind).slice(0, 3) });
      for (let i = 0; i < 400; i++) { const s = ++P.seedN, g = prGen(tw.lvl, s, o2); if (g && g.kind === tw.kind) { q = g; lvl = tw.lvl; twin = true; P.cur = { seed: s, opts: o2 }; break; } }
    }
  }
  if (!q) {
    const prevLow = P.cur && P.cur.low;
    if (lvl > 1 && !prevLow && rng(P.seedN * 7919 + 13)() < PG_MIX) { lvl--; low = true; }
    const s = ++P.seedN; q = prGen(lvl, s, opts); P.cur = { seed: s, opts };
  }
  Object.assign(P.cur, { lvl, low, twin, tries: 0, clue: 0, hints: 0, done: false, ok: null, v: '', u: '', w: [], traps: [], fb: null, up: 0, down: false, end: false, tgt: false });
  if (!P.go) P.go = pgNewGo(P);
  PGV.q = q; return q;
}
/* the question on screen, rebuilt from its seed and opts */
function pgQ(P) {
  const c = P.cur; if (!c) return null;
  if (!PGV.q || PGV.q.seed !== c.seed || PGV.q.level !== c.lvl) PGV.q = prGen(c.lvl, c.seed, c.opts || {});
  return PGV.q;
}
/* copy what is typed on screen into the saved question (before any re-draw) */
function pgGrab(c) {
  const i = $('#pgIn'), u = $('#pgU'); if (!c || c.done) return;
  if (i) c.v = i.value; if (u) c.u = u.value;
  const ws = $$('#pgHost .pg-workin'); if (ws.length) c.w = ws.map(x => x.value);
}
const pgWorkText = (c, q) => { const w = (c.w || []).map(x => String(x || '').trim()); if (!w.some(Boolean)) return ''; return q && q.steps > 1 ? w.map((x, i) => x ? `Step ${i + 1}: ${x}` : '').filter(Boolean).join('\n') : w.join('\n'); };

/* mark the typed answer. Returns what happened (the tests read it). */
function pgCheck() {
  const P = pgData(), c = P.cur, q = pgQ(P); if (!c || c.done || !q) return null;
  pgGrab(c);
  const v = parseNum(c.v);
  if (!String(c.v || '').trim() || isNaN(v)) { pgSay('Type your answer as a number, for example 42.5.', 'no'); pgSave(P); return { err: 'num' }; }
  if (!c.u) { pgSay('Choose a unit for your answer from the list.', 'no'); pgSave(P); return { err: 'unit' }; }
  c.tries++;
  const numOk = near(v, q.ans, q.tol), unitOk = c.u === q.unit, ok = numOk && unitOk, trap = numOk ? null : prMatchTrap(q, v);
  if (trap && !c.traps.includes(trap.key)) c.traps.push(trap.key);
  if (numOk && !unitOk && !c.traps.includes('unit')) c.traps.push('unit');
  let res;
  if (ok) res = pgFinish(P, q, true);
  else if (c.tries < 2) {
    let msg;
    if (numOk) msg = `Your number is right! Now check the unit. What is ${PG_QTY[q.unit] || 'this'} measured in?`;
    else if (trap) msg = trap.say + ' Have another go.';
    else if (c.hints < q.hints.length) { msg = 'Not quite. Here is a clue: ' + plain(q.hints[c.hints]) + ' Have another go.'; c.hints++; }
    else msg = 'Not quite. Check each step again, then have another go.';
    c.fb = { cls: 'hint', msg }; res = { ok: false, tries: 1, trap: trap ? trap.key : null, unit: numOk && !unitOk };
  } else res = pgFinish(P, q, false, trap, numOk && !unitOk);
  pgSave(P); pgRender();
  return Object.assign({ ok }, res);
}
/* a question is over: right (on try 1 or 2) or wrong twice. Moves the level up or down, saves the history. */
function pgFinish(P, q, ok, trap, unitOnly) {
  const c = P.cur, go = P.go || (P.go = pgNewGo(P)), wtxt = pgWorkText(c, q);
  c.done = true; c.ok = ok; P.asked++;
  P.hist.push({ t: Date.now(), seed: c.seed, opts: c.opts, lvl: c.lvl, kind: q.kind, skill: q.skill, ok, tries: c.tries, clue: c.clue > 0, trap: c.traps[0] || null, traps: c.traps.slice(), ans: `${String(c.v).trim()} ${c.u}`, w: wtxt, low: !!c.low, twin: !!c.twin });
  if (P.hist.length > 300) P.hist.splice(0, P.hist.length - 300);
  const sk = P.skills[q.skill] || { right: 0, tries: 0 }; sk.tries++; if (ok) sk.right++; P.skills[q.skill] = sk;
  const gs = go.skills[q.skill] || { right: 0, tries: 0 }; gs.tries++; if (ok) gs.right++; go.skills[q.skill] = gs;
  c.traps.forEach(k => { const t = P.traps[k] || { met: 0, fixed: 0 }; t.met++; if (ok) t.fixed++; P.traps[k] = t; const g = go.traps[k] || { met: 0, fixed: 0 }; g.met++; if (ok) g.fixed++; go.traps[k] = g; });
  const tgtBefore = pgTargetState(P).done;
  go.n++;
  if (ok) {
    P.right++; go.right++; P.wrongRun = 0;
    if (c.tries === 1 && !c.clue) {
      P.run++;
      if (P.run >= 3 && P.level < 6) { P.level++; P.run = 0; P.best = Math.max(P.best, P.level); c.up = P.level; go.top = Math.max(go.top || 1, P.level); }
      P.run = Math.min(P.run, 3);
    }
    c.fb = { cls: 'ok', msg: (c.tries === 1 ? pgPraise(P.asked) : 'Yes! You fixed it on your second try.') + ` The answer is ${q.ansText} ${q.unit}.` };
    addEvidence('maths', `Maths Gym level ${q.level}: ${plain(q.p)} I got ${String(c.v).trim()} ${c.u}.`);
  } else {
    P.run = 0; P.wrongRun++;
    const say = trap ? trap.say + ' ' : unitOnly ? `Your number was right, but the unit is ${q.unit}. ` : '';
    c.fb = { cls: 'no', msg: `${say}The answer is ${q.ansText} ${q.unit}. Read the worked answer below to see how.` };
    if (P.wrongRun >= 2) {
      P.wrongRun = 0; P.twin = { lvl: c.lvl, kind: q.kind };
      if (P.level > 1) { P.level--; c.down = true; } else c.down = 'same';
    }
  }
  c.tgt = !tgtBefore && pgTargetState(P).done;
  if (go.n >= PG_GO) c.end = true;
  return { ok, tries: c.tries, up: c.up || 0, down: c.down, level: P.level };
}
const pgPraise = n => ['That\'s right! Great work.', 'Spot on!', 'Yes, that\'s right!', 'Brilliant, that\'s it!', 'Correct! Nicely done.'][n % 5];
/* Next: the end screen after 10, the units cards on first reaching level 6, otherwise a new question */
function pgNext() {
  const P = pgData(), c = P.cur;
  if (c && !c.done) return null;
  if (c && c.end) { P.lastGo = P.go; P.go = null; P.goes++; P.cur = null; pgSave(P); PGV.mode = 'end'; pgRender(); window.scrollTo(0, 0); return 'end'; }
  if (P.level === 6 && !P.unitsDone && !P.unitsSeen && !isTeacher()) { P.unitsSeen = true; pgSave(P); pgUnitsOpen(true); return 'units'; }
  pgNewQ(P); pgSave(P); PGV.mode = 'play'; pgRender(); window.scrollTo(0, 0); return PGV.q;
}
function pgClue() {
  const P = pgData(), c = P.cur, q = pgQ(P); if (!c || c.done || !q || c.hints >= q.hints.length) return;
  pgGrab(c); c.hints++; c.clue++; pgSave(P); pgRender();
  const b = $('#pgHost [data-pg=clue]'); if (b && !b.disabled) b.focus({ preventScroll: true });
}

/* ---------- opening ---------- */
function pgOpen() {
  if (typeof hideCards === 'function') hideCards(); if (typeof closeDesk === 'function') closeDesk(); if (typeof closeJournal === 'function') closeJournal();
  parkLab(); LAB.onChange = null;   // no chapter step is open, so the formula triangle and calculator have nothing to tell
  PGV.mode = !pgC3Done() && !isTeacher() ? 'remind' : 'play'; show('vPractice');
}
/* make sure there is a question to show (starts a go if needed) */
function pgEnsure() {
  const P = pgData(); if (P.cur && P.cur.seed != null && pgQ(P)) return;
  if (P.level === 6 && !P.unitsDone && !P.unitsSeen && !isTeacher()) { P.unitsSeen = true; pgSave(P); PGV.mode = 'units'; PGV.uStep = 0; PGV.uAuto = true; PGV.uBack = 'next'; PGV.gapOk = false; return; }
  P.go = P.go || pgNewGo(P); pgNewQ(P); pgSave(P);
}

/* ---------- drawing the page ---------- */
function pgRender() {
  const host = $('#pgHost'); if (!host) return;
  if (PGV.mode === 'play') pgEnsure();
  const P = pgData();
  host.innerHTML = `<div class="pg">${pgHeadHTML()}${PGV.mode === 'remind' ? pgRemindHTML() : `${pgBarHTML(P)}${PGV.mode === 'end' ? pgEndHTML(P) : PGV.mode === 'units' ? pgUnitsHTML() : pgPlayHTML(P)}`}</div>`;
  $('#crumb').textContent = 'Maths Gym';
  if (PGV.mode === 'play') pgWire(P);
}
const pgHeadHTML = () => `<div class="chhead"><div><span class="lbl">Maths practice · F = m × a</span><h1>🏋️ Maths Gym</h1></div><button type="button" class="ghost" data-pg="home">← Home</button></div>`;
function pgRemindHTML() {
  return `<section class="panel pg-remind"><div class="pg-rmicon" aria-hidden="true">${chIcon('tri')}</div><div><h2>Before you start</h2><p>We recommend doing Chapter 3 first. That's where you meet F = m × a and the formula triangle.</p>
    <div class="row"><button type="button" class="go" data-open="c3f">Go to Chapter 3</button><button type="button" class="ghost" data-pg="anyway">Practise anyway</button></div></div></section>`;
}
function pgBarHTML(P) {
  const T = pgTargetState(P), lv = P.level;
  const rungs = PG_LEVELS.map((n, i) => `<li class="${i + 1 === lv ? 'on' : i + 1 < lv ? 'past' : ''}"${i + 1 === lv ? ' aria-current="step"' : ''}><b>${i + 1}</b><span>${n}</span></li>`).join('');
  const dots = [0, 1, 2].map(i => `<i class="${i < P.run ? 'on' : ''}"></i>`).join('');
  const opts = Object.keys(PG_TARGETS).map(k => `<option value="${k}"${k === P.target ? ' selected' : ''}>${PG_TARGETS[k]}</option>`).join('');
  const tline = !T.on ? '<span class="pg-tprog">Pick a target if your teacher set one.</span>'
    : `<span class="pg-tprog ${T.done ? 'done' : ''}">${T.done ? '✓ Target reached!' : T.prog}</span><span class="pg-tbar" aria-hidden="true"><i style="width:${Math.round(Math.min(1, (T.lvl ? (T.have - 1) / Math.max(1, T.n - 1) : T.have / T.n)) * 100)}%"></i></span>`;
  const units = P.level === 6 && !P.unitsDone && !isTeacher() && PGV.mode !== 'units' ? '<button type="button" class="mini pg-ulink" data-pg="units">📏 Learn to change units</button>' : '';
  return `<section class="panel pg-bar" aria-label="Your level">
    <div class="pg-lvhd"><span class="lbl">Your level</span><b class="pg-lvname">Level ${lv}: ${PG_LEVELS[lv - 1]}</b></div>
    <ol class="pg-rungs">${rungs}</ol>
    <div class="pg-barrow">
      <div class="pg-run" role="img" aria-label="${P.run} right in a row out of 3"><span>Right in a row</span><span class="pg-dots">${dots}</span></div>
      <label class="pg-target"><span>My target</span><select data-pg="target" aria-label="My target">${opts}</select></label>${tline}${units}
    </div>
    <p class="pg-rule">Get 3 right in a row without a clue to move up a level. A go is ${PG_GO} questions (approx. 15 min). Your progress saves after every question.</p>
  </section>`;
}
function pgPlayHTML(P) {
  const c = P.cur, q = pgQ(P); if (!c || !q) return '<p>Loading…</p>';
  const go = P.go || { n: 0 }, num = Math.min(PG_GO, go.n + (c.done ? 0 : 1));
  const chips = (c.low ? `<span class="pg-chip">A quick look back: level ${c.lvl}</span>` : '') + (c.twin ? '<span class="pg-chip tw">Twin question: same kind, new numbers</span>' : '');
  const U = q.units || UNITS, lock = c.done ? ' disabled' : '', vcls = c.done ? (c.ok ? ' right' : ' wrong') : '';
  const ucls = c.done ? (c.u === q.unit ? ' right' : ' wrong') : '';
  const steps = Math.max(1, q.steps || 1), w = c.w || [];
  const work = steps > 1 ? Array.from({ length: steps }, (_, i) => `<label class="pg-step"><span>Step ${i + 1}</span><textarea class="pg-workin" rows="2" aria-label="Working for step ${i + 1}"${lock} placeholder="${i === 0 ? 'Write your first step here' : 'Then the next step'}">${esc(w[i] || '')}</textarea></label>`).join('')
    : `<textarea class="pg-workin" rows="2" aria-label="Your working"${lock} placeholder="For example: F = m × a = 45 × 2.5">${esc(w[0] || '')}</textarea>`;
  const shown = q.hints.slice(0, c.hints).map(x => `<li>${esc(x)}</li>`).join('');
  const clueBtn = c.done ? '' : c.hints >= q.hints.length ? '<button type="button" class="mini" data-pg="clue" disabled>No more clues</button>' : `<button type="button" class="mini pg-cluebtn" data-pg="clue">${c.hints ? 'Need another clue?' : 'Need a clue?'}</button>`;
  const worked = c.done ? (c.ok ? `<details class="pg-worked ok"><summary>See the worked answer</summary><div class="pg-workans">${esc(q.work)}</div></details>`
    : `<div class="pg-worked"><div class="lbl">Worked answer</div><div class="pg-workans">${esc(q.work)}</div></div>`) : '';
  const cele = c.done && c.up ? `<div class="pg-cele" role="status"><span class="pg-conf" aria-hidden="true">${'<i></i>'.repeat(14)}</span><b>🎉 ${PG_UP[c.up - 1]}</b><span>Three right in a row with no clue. Next up: level ${c.up}, ${PG_LEVELS[c.up - 1].toLowerCase()}.</span></div>` : '';
  const down = c.done && c.down ? `<div class="pg-down" role="status"><b>${c.down === true ? 'Let\'s go back a step and build it up again.' : 'Let\'s practise this one again.'}</b><span>${c.down === true ? `You're on level ${P.level} now. ` : ''}Read the worked answer, then try a twin question: the same kind of problem with new numbers.</span></div>` : '';
  const tgt = c.done && c.tgt ? '<div class="pg-tgt" role="status">🎯 You reached your target! Press <b>📄 Save my practice</b> on the end screen, or keep practising.</div>' : '';
  const next = c.done ? `<button type="button" class="go big" data-pg="next" id="pgNext">${c.end ? 'See how you did →' : c.down ? 'Try the twin question →' : c.up ? `Start level ${c.up} →` : 'Next question →'}</button>` : '';
  const retry = !c.done && c.tries === 1 ? '<button type="button" class="ghost" data-pg="retry">Try again</button>' : '';
  const units = q.units2 ? `<details class="clue pg-unitsfold"><summary>How do I change units?</summary><p>1 kg = 1,000 g, so to change grams to kilograms, divide by 1,000.</p><p>1 tonne = 1,000 kg, so to change tonnes to kilograms, multiply by 1,000.</p><button type="button" class="mini" data-pg="units">Open the Changing units cards</button></details>` : '';
  const wTri = q.skill === 'weight' || q.kind === 'fall' || q.kind === 'weightFric';
  const triOpen = PGV.triOpen != null ? PGV.triOpen : matchMedia('(min-width:960px)').matches;
  return `<div class="pg-main">
    <section class="panel pg-card${c.done ? (c.ok ? ' ok' : ' bad') : ''}" aria-labelledby="pgQp">
      <div class="pg-qhd"><span class="pg-qn">Question ${num} of ${PG_GO}</span><span class="pg-lv">Level ${c.lvl} · ${PG_LEVELS[c.lvl - 1]}</span>${chips}</div>
      <div class="pg-story"><figure class="pg-pic">${pgPic(q.pic)}</figure><p class="pg-p" id="pgQp">${esc(q.p)}</p></div>
      ${q.pic.arrows && q.pic.arrows.length ? `<figure class="pg-fbd"><figcaption>The forces on ${esc(PR_THING[q.pic.thing] ? PR_THING[q.pic.thing].the : 'it')}</figcaption>${pgFbd(q.pic)}</figure>` : ''}
      ${units}
      <div class="pg-work"><span class="lbl">Working (optional, not marked)</span>${work}</div>
      <div class="pg-ans"><span class="lbl">Your answer</span><div class="numin noglos"><input class="ansin${vcls}" id="pgIn" inputmode="decimal" autocomplete="off" aria-label="Your answer" value="${esc(c.v || '')}"${lock}><select class="unitsel${ucls}" id="pgU" aria-label="Unit"${lock}><option value="">unit?</option>${U.map(u => `<option value="${esc(u)}"${c.u === u ? ' selected' : ''}>${u}</option>`).join('')}</select>${c.done ? '' : '<button type="button" class="go" data-pg="check" id="pgCheck">Check</button>'}${retry}</div></div>
      <p class="fb ${c.fb ? c.fb.cls : ''}" id="pgFb" role="status" aria-live="polite">${c.fb ? esc(c.fb.msg) : ''}</p>
      <div class="pg-clues">${shown ? `<ol class="clist">${shown}</ol>` : ''}${clueBtn}${c.clue && !c.done ? '<span class="pg-cnote">Clues help you learn. A right answer still counts, but it does not add to your run of 3.</span>' : ''}</div>
      ${worked}${cele}${down}${tgt}
      ${next ? `<div class="pg-acts">${next}</div>` : ''}
    </section>
    <aside class="pg-side"><details class="panel pg-tri"${triOpen ? ' open' : ''}><summary>Formula triangle</summary>${triHTML('fma')}${wTri ? `<p class="scaleNote">Weight = mass × g, so mass = weight ÷ g.</p>${triHTML('w')}` : ''}<p class="scaleNote">Tap a letter to cover it. What is left is the sum. The 🧮 calculator is at the bottom right.</p></details></aside>
  </div>`;
}
function pgWire(P) {
  const i = $('#pgIn'), c = P.cur; if (!i || !c) return;
  const save = () => { const D = pgData(); if (D.cur && !D.cur.done && D.cur.seed === c.seed) { pgGrab(D.cur); pgSave(D); } };
  i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); pgCheck(); } });
  i.addEventListener('change', save); $('#pgU').addEventListener('change', save); $$('#pgHost .pg-workin').forEach(t => t.addEventListener('change', save));
  const tri = $('#pgHost .pg-tri'); if (tri) tri.addEventListener('toggle', () => { PGV.triOpen = tri.open; });
  if (c.done) { const n = $('#pgNext'); if (n) n.focus({ preventScroll: true }); }
  else if (matchMedia('(pointer:fine)').matches) { i.focus({ preventScroll: true }); if (c.tries) i.select(); }
}
function pgSay(msg, cls) { const f = $('#pgFb'); if (f) { f.className = 'fb ' + cls; f.textContent = msg; } }

/* ---------- the end of a go ---------- */
function pgNextTime(P, go) {
  const sk = Object.entries(go.skills || {}).filter(([, s]) => s.tries && s.right < s.tries).sort((a, b) => (a[1].right / a[1].tries) - (b[1].right / b[1].tries) || b[1].tries - a[1].tries);
  if (sk.length) { const [k, s] = sk[0]; return `Next time, practise the “${PR_SKILLS[k] || k}” questions. You got ${s.right} of ${s.tries} right this go.`; }
  const tr = Object.entries(go.traps || {}).filter(([, t]) => t.fixed < t.met);
  if (tr.length) return `Next time, watch out for this mistake: ${(PG_TRAPNAME[tr[0][0]] || tr[0][0]).toLowerCase()}.`;
  return P.level < 6 ? `Next time, keep going until you reach level ${P.level + 1}: ${PG_LEVELS[P.level].toLowerCase()}.` : 'Next time, keep your run going on the stretch problems. You are at the top level!';
}
const pgSkillRows = sk => Object.keys(PR_SKILLS).filter(k => sk[k] && sk[k].tries).map(k => [PR_SKILLS[k], sk[k].right, sk[k].tries]);
const pgTrapRows = tr => Object.keys(tr || {}).filter(k => tr[k] && tr[k].met).sort((a, b) => tr[b].met - tr[a].met).map(k => [PG_TRAPNAME[k] || k, tr[k].met, tr[k].fixed]);
function pgEndHTML(P) {
  const go = P.lastGo || pgNewGo(P), T = pgTargetState(P), sk = pgSkillRows(go.skills), tr = pgTrapRows(go.traps);
  const skills = sk.length ? `<table class="tbl pg-tbl"><tr><th>Skill</th><th>Right</th></tr>${sk.map(([n, r, t]) => `<tr><td>${esc(n)}</td><td><b>${r}</b> of ${t}${r === t ? ' <span class="pg-star">★</span>' : ''}</td></tr>`).join('')}</table>` : '<p>No questions in this go yet.</p>';
  const traps = tr.length ? `<ul class="pg-traps">${tr.map(([n, m, f]) => `<li><b>${esc(n)}</b>: ${pgPlural(m, 'time')}${f ? `, fixed ${f === m ? 'every time' : f + ' time' + (f > 1 ? 's' : '')} on your second try` : ''}</li>`).join('')}</ul>` : '<p>None this go. Brilliant!</p>';
  return `<section class="panel pg-end"><h2>${go.right >= 8 ? 'Brilliant workout!' : go.right >= 5 ? 'Great workout!' : 'Well done for practising!'}</h2>
    <div class="pg-stats"><div><b>${go.right}<small> of ${go.n}</small></b><span>questions right</span></div><div><b>${go.top || P.level}</b><span>highest level reached</span><em>${esc(PG_LEVELS[(go.top || P.level) - 1])}</em></div><div><b>${P.level}</b><span>your level now</span></div></div>
    ${T.on ? `<p class="pg-tline ${T.done ? 'done' : ''}">Target: ${esc(T.label.toLowerCase())}. ${T.done ? '✓ Reached!' : 'Not reached yet (' + T.prog + '). Keep going!'}</p>` : ''}
    <div class="pg-endgrid"><div><h3>Skills this go</h3>${skills}</div><div><h3>Mistakes you met</h3>${traps}</div></div>
    <p class="pg-nexttime">💡 ${esc(pgNextTime(P, go))}</p>
    <div class="row pg-endbtns"><button type="button" class="go big" data-pg="again">Keep going</button><button type="button" class="ghost big" data-pg="home">Home</button><button type="button" class="ghost big" data-pg="pdf">📄 Save my practice</button></div></section>`;
}

/* ---------- the "Changing units" teach card ---------- */
const PG_UCARDS = [
  { h: 'Grams and kilograms', pic: 'sugar', p: ['Small masses are often given in grams (g).', 'A bag of sugar has a mass of about 1 kg. That is the same as 1,000 g.'], key: '1 kg = 1,000 g' },
  { h: 'Tonnes and kilograms', pic: 'car', p: ['Big masses are often given in tonnes.', 'A small car has a mass of about 1 tonne. That is the same as 1,000 kg.'], key: '1 tonne = 1,000 kg' },
  { h: 'Change to kg first', pic: 'ex', p: ['F = m × a only works when the mass is in kg. So change the units first.', 'A tennis ball has a mass of 57 g. 57 ÷ 1,000 = 0.057 kg.', 'A rhino has a mass of 2.3 tonnes. 2.3 × 1,000 = 2,300 kg.'], key: 'Grams: divide by 1,000. Tonnes: multiply by 1,000.' },
  { h: 'Check it', gap: true }
];
function pgUnitsOpen(auto) { const P = pgData(); PGV.uBack = P.cur && !P.cur.done ? 'play' : 'next'; PGV.uAuto = !!auto; PGV.uStep = 0; PGV.gapOk = false; PGV.mode = 'units'; pgRender(); window.scrollTo(0, 0); }
function pgUnitPic(k) {
  if (k === 'sugar') return `<svg viewBox="0 0 200 120" role="img" aria-label="A bag of sugar labelled 1 kg"><rect width="200" height="120" rx="10" fill="#eef5f8"/><rect x="0" y="100" width="200" height="20" fill="#e2cfa9"/><path d="M70 30h60l6 72H64z" fill="#fbfaf4" stroke="#22313a" stroke-width="2.5" stroke-linejoin="round"/><path d="M70 30l6-10h48l6 10" fill="#e9e4d4" stroke="#22313a" stroke-width="2.5" stroke-linejoin="round"/><rect x="74" y="50" width="52" height="34" rx="4" fill="#3d7fc1"/><text x="100" y="65" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">SUGAR</text><text x="100" y="79" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">1 kg</text></svg>`;
  if (k === 'car') return `<svg viewBox="0 0 200 120" role="img" aria-label="A small car labelled about 1 tonne"><rect width="200" height="120" rx="10" fill="#e3eff5"/><rect x="0" y="100" width="200" height="20" fill="#9aa3a6"/>${pgCar(100, 100, '#d9534f', 1)}<rect x="62" y="12" width="76" height="22" rx="11" fill="#fff" stroke="#22313a" stroke-width="2"/><text x="100" y="27" text-anchor="middle" font-size="11" font-weight="800" fill="#22313a">about 1 tonne</text></svg>`;
  return `<svg viewBox="0 0 200 120" role="img" aria-label="A tennis ball of 57 g and a rhino of 2.3 tonnes"><rect width="200" height="120" rx="10" fill="#eef5f8"/><rect x="0" y="100" width="200" height="20" fill="#cfe2c3"/>${pgBall('tennis', 44, 100)}<text x="44" y="56" text-anchor="middle" font-size="12" font-weight="800" fill="#22313a">57 g</text>${pgAnimal('rhino', 136, 100, 0.8)}<text x="136" y="40" text-anchor="middle" font-size="12" font-weight="800" fill="#22313a">2.3 tonnes</text></svg>`;
}
function pgUnitsHTML() {
  const i = PGV.uStep, C = PG_UCARDS[i], last = i === PG_UCARDS.length - 1, dots = PG_UCARDS.map((_, k) => `<i class="${k === i ? 'on' : k < i ? 'past' : ''}"></i>`).join('');
  const back = PGV.uBack === 'play' ? 'Back to my question' : 'Back to practice';
  let body;
  if (C.gap) body = `<p class="pg-uq">Fill the gap with one word.</p><p class="pg-gap noglos">To change grams to kilograms, you <input class="gapin${PGV.gapOk ? ' right' : ''}" id="pgGap" autocomplete="off" aria-label="The missing word"${PGV.gapOk ? ' disabled value="divide"' : ''}> by 1,000.</p>
    ${PGV.gapOk ? '' : '<button type="button" class="ghost sm" data-pg="ugap">Check</button>'}<p class="fb ${PGV.gapOk ? 'ok' : ''}" id="pgUfb" role="status" aria-live="polite">${PGV.gapOk ? 'Yes! A gram is tiny, so you divide by 1,000. And to change tonnes to kilograms, you multiply by 1,000.' : ''}</p>`;
  else body = `<div class="pg-ubody"><figure class="pg-upic">${pgUnitPic(C.pic)}</figure><div>${C.p.map(x => `<p>${x}</p>`).join('')}<p class="pg-ukey">${C.key}</p></div></div>`;
  const nextBtn = last ? (PGV.gapOk ? `<button type="button" class="go" data-pg="udone">${PGV.uBack === 'play' ? back + ' →' : 'Start practising →'}</button>` : '') : '<button type="button" class="go" data-pg="unext">Next →</button>';
  return `<section class="panel pg-units" aria-labelledby="pgUh"><div class="pg-uhd"><span class="lbl">Changing units · card ${i + 1} of ${PG_UCARDS.length}</span><span class="pg-udots" aria-hidden="true">${dots}</span></div>
    <h2 id="pgUh">${C.h}</h2>${body}
    <div class="row pg-uacts">${i ? '<button type="button" class="ghost" data-pg="uprev">← Back</button>' : ''}${nextBtn}<button type="button" class="mini" data-pg="uskip">${PGV.uAuto ? 'Skip for now' : back}</button></div></section>`;
}
function pgUnitsGap() {
  const g = $('#pgGap'); if (!g) return false; const raw = g.value.trim(), v = /^[÷\/]$/.test(raw) ? 'divide' : gapNorm(raw), f = $('#pgUfb');
  if (!v) { f.className = 'fb no'; f.textContent = 'Type one word in the gap first.'; return false; }
  if (/^(divide|divided|divides|dividing|div|divide it|divided it)$/.test(v)) {
    PGV.gapOk = true; const P = pgData(); P.unitsDone = true; P.unitsSeen = true; pgSave(P); pgRender(); return true;
  }
  f.className = 'fb hint'; f.textContent = /multipl|times|×/.test(v) ? 'Not quite. A gram is tiny, so 1 kg has lots of them. Is the number of kilograms bigger or smaller than the number of grams?' : 'Not quite. Do you multiply or divide? A gram is tiny, so the number of kilograms is smaller.';
  return false;
}
function pgUnitsLeave() {
  PGV.mode = 'play'; const P = pgData();
  if (PGV.uBack === 'next' || !P.cur || P.cur.done) { if (P.cur && P.cur.end) { pgNext(); return; } pgNewQ(P); pgSave(P); }
  pgRender(); window.scrollTo(0, 0);
}

/* ---------- clicks (called from 99-init.js) ---------- */
function pgClick(el) {
  const a = el.dataset.pg;
  if (a === 'open') { pgOpen(); return; }
  if (a === 'home') { show('vHome'); return; }
  if (a === 'anyway') { PGV.mode = 'play'; pgRender(); return; }
  if (a === 'check') { pgCheck(); return; }
  if (a === 'clue') { pgClue(); return; }
  if (a === 'retry') { const i = $('#pgIn'); if (i) { i.value = ''; i.classList.remove('wrong'); i.focus({ preventScroll: true }); } return; }
  if (a === 'next') { pgNext(); return; }
  if (a === 'again') { const P = pgData(); P.go = pgNewGo(P); P.cur = null; pgSave(P); PGV.mode = 'play'; pgRender(); window.scrollTo(0, 0); return; }
  if (a === 'pdf') { pgPdf(); return; }
  if (a === 'units') { const P = pgData(); if (P.cur) { pgGrab(P.cur); pgSave(P); } pgUnitsOpen(false); return; }
  if (a === 'unext') { PGV.uStep = Math.min(PG_UCARDS.length - 1, PGV.uStep + 1); pgRender(); return; }
  if (a === 'uprev') { PGV.uStep = Math.max(0, PGV.uStep - 1); pgRender(); return; }
  if (a === 'ugap') { pgUnitsGap(); return; }
  if (a === 'udone' || a === 'uskip') { pgUnitsLeave(); return; }
}
function pgChange(el) {
  if (el.dataset.pg !== 'target') return;
  const P = pgData(); if (P.cur && !P.cur.done) pgGrab(P.cur);
  P.target = PG_TARGETS[el.value] ? el.value : 'none'; P.tAt = P.right; pgSave(P); pgRender();
  const s = $('#pgHost [data-pg=target]'); if (s) s.focus({ preventScroll: true });
}
function pgKey(e) {
  if (VIEW !== 'vPractice' || e.key !== 'Enter' || !$('#modal').hidden) return;
  if (e.target && e.target.id === 'pgGap') { e.preventDefault(); pgUnitsGap(); }
}
/* the PDF: name and class first (no name, no worksheet) */
function pgPdf() {
  const u = user();
  if (!isTeacher() && (!(u.name || '').trim() || !(u.cls || '').trim())) {
    openModal(`<div class="modal"><h2>No name, no worksheet!</h2><p>Your practice PDF needs your name and your class, so your teacher knows it is yours.</p><div class="row" style="justify-content:space-between"><button type="button" class="ghost" data-close>Not now</button><button type="button" class="go" data-act="who">Add my name and class</button></div></div>`);
    return false;
  }
  openSheet(null, 'gym'); return true;
}

/* ---------- the home page card ---------- */
function pgHomeCard() {
  const el = $('#gymCard'); if (!el) return;
  const P = pgData(), started = P.asked > 0, T = pgTargetState(P);
  const msg = started ? `<b>You're on level ${P.level}: ${esc(PG_LEVELS[P.level - 1].toLowerCase())}.</b> Best so far: level ${P.best} · ${pgPlural(P.right, 'question')} right${T.on ? ` · Target: ${esc(T.label.toLowerCase())}${T.done ? ' ✓' : ''}` : ''}` : '<b>Start at level 1 and work your way up to level 6.</b>';
  el.innerHTML = `<div class="hcicon">${pgIconSvg()}</div><div class="hcbody"><span class="kicker2">Maths practice · F = m × a</span><h3>🏋️ Maths Gym</h3><p>Practise force, mass and acceleration. The questions get harder as you get better.</p><p class="pg-hcsub">${msg}</p><div class="row"><button type="button" class="go" data-pg="open">${started ? 'Carry on practising' : 'Open the Maths Gym'} →</button></div></div>`;
}
const pgIconSvg = () => `<svg class="chicon" viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h16" stroke-width="3"/><rect x="7" y="12" width="5" height="16" rx="1.5"/><rect x="28" y="12" width="5" height="16" rx="1.5"/><path d="M4 16v8M36 16v8" stroke-width="3"/></svg>`;

/* ---------- pictures: small flat drawings for each pic.draw key (fixed colours, like an illustration, so they read the same in dark mode) ---------- */
const PG_OL = 'stroke="#22313a" stroke-width="2" stroke-linejoin="round"';
const pgWheel = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2b3338" ${PG_OL}/><circle cx="${x}" cy="${y}" r="${r * 0.4}" fill="#c9d1d5"/>`;
function pgCar(x, gy, col, s = 1, kind) {
  const k = kind || 'car';
  if (k === 'rover') return `<g transform="translate(${x} ${gy}) scale(${s})"><rect x="-38" y="-34" width="76" height="20" rx="4" fill="#d5dde2" ${PG_OL}/><rect x="-30" y="-46" width="44" height="8" fill="#2b5d8f" ${PG_OL}/><path d="M24 -34v-18" stroke="#22313a" stroke-width="2"/><circle cx="24" cy="-54" r="3" fill="#e3a51c"/>${pgWheel(-28, -9, 9)}${pgWheel(0, -9, 9)}${pgWheel(28, -9, 9)}</g>`;
  if (k === 'kart') return `<g transform="translate(${x} ${gy}) scale(${s})"><path d="M-40 -14h80l-6 -10h-52z" fill="${col}" ${PG_OL}/><circle cx="2" cy="-34" r="10" fill="#e9eef1" ${PG_OL}/><rect x="0" y="-38" width="12" height="6" rx="2" fill="#3d7fc1"/><path d="M-6 -24l-8 10" stroke="#22313a" stroke-width="3"/>${pgWheel(-28, -9, 9)}${pgWheel(28, -9, 9)}</g>`;
  return `<g transform="translate(${x} ${gy}) scale(${s})"><path d="M-48 -12v-14q0-6 6-7l14-2 12-14h34l16 14 10 2q6 1 6 7v14z" fill="${col}" ${PG_OL}/><path d="M-12 -35h14v12h-24zM6 -35h12l12 12h-24z" fill="#cde6f2" ${PG_OL}/>${pgWheel(-28, -10, 10)}${pgWheel(28, -10, 10)}</g>`;
}
function pgBall(t, x, gy, s = 1) {
  const r = 17 * s;
  if (t === 'puck') return `<ellipse cx="${x}" cy="${gy - 6}" rx="${20 * s}" ry="${6 * s}" fill="#1e2428" ${PG_OL}/><rect x="${x - 20 * s}" y="${gy - 12}" width="${40 * s}" height="6" fill="#1e2428"/><ellipse cx="${x}" cy="${gy - 12}" rx="${20 * s}" ry="${6 * s}" fill="#3a444a" ${PG_OL}/>`;
  const cy = gy - r - 1, fill = { tennis: '#c9dd3a', bowling: '#2c4f9e', football: '#f7f7f4' }[t] || '#f7f7f4';
  let deco = '';
  if (t === 'tennis') deco = `<path d="M${x - r * 0.75} ${cy - r * 0.6}q${r * 0.7} ${r * 0.6} 0 ${r * 1.2}M${x + r * 0.75} ${cy - r * 0.6}q${-r * 0.7} ${r * 0.6} 0 ${r * 1.2}" fill="none" stroke="#fff" stroke-width="2.2"/>`;
  else if (t === 'bowling') deco = `<circle cx="${x - 4 * s}" cy="${cy - 6 * s}" r="${2.6 * s}" fill="#0f1c3a"/><circle cx="${x + 4 * s}" cy="${cy - 7 * s}" r="${2.6 * s}" fill="#0f1c3a"/><circle cx="${x}" cy="${cy + 1 * s}" r="${3 * s}" fill="#0f1c3a"/>`;
  else deco = `<path d="M${x} ${cy - 6 * s}l${5.7 * s} ${4.1 * s}-${2.2 * s} ${6.7 * s}h-${7 * s}l-${2.2 * s}-${6.7 * s}z" fill="#22313a"/><path d="M${x} ${cy - 6 * s}v-${r - 6 * s}M${x + 5.7 * s} ${cy - 1.9 * s}l${r * 0.6} -${r * 0.3}M${x - 5.7 * s} ${cy - 1.9 * s}l-${r * 0.6} -${r * 0.3}M${x + 3.5 * s} ${cy + 4.8 * s}l${r * 0.35} ${r * 0.55}M${x - 3.5 * s} ${cy + 4.8 * s}l-${r * 0.35} ${r * 0.55}" stroke="#22313a" stroke-width="1.6"/>`;
  return `<circle cx="${x}" cy="${cy}" r="${r}" fill="${fill}" ${PG_OL}/>${deco}`;
}
function pgAnimal(t, x, gy, s = 1) {
  const A = { rhino: ['#8d989e', 1.15, 0.8], elephant: ['#8d989e', 1.25, 1.05], horse: ['#8a5a33', 1, 1.05], cheetah: ['#d9a640', 0.95, 0.85] }[t] || ['#8d989e', 1, 1], col = A[0], w = 30 * A[1], lg = 18 * A[2];
  const by = -lg - 14, bx = 0;
  let head = `<ellipse cx="${bx + w + 6}" cy="${by - 4}" rx="11" ry="9" fill="${col}" ${PG_OL}/>`, extra = '';
  if (t === 'rhino') extra = `<path d="M${bx + w + 14} ${by - 8}l7 -10 -1 12z" fill="#e9e4d4" ${PG_OL}/>`;
  if (t === 'elephant') { head = `<ellipse cx="${bx + w + 4}" cy="${by - 6}" rx="12" ry="12" fill="${col}" ${PG_OL}/>`; extra = `<ellipse cx="${bx + w - 6}" cy="${by - 4}" rx="9" ry="13" fill="#7a858b" ${PG_OL}/><path d="M${bx + w + 14} ${by - 4}q6 14 -2 26" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round"/><path d="M${bx + w + 14} ${by - 4}q6 14 -2 26" fill="none" stroke="#22313a" stroke-width="1"/>`; }
  if (t === 'horse') { head = `<path d="M${bx + w - 4} ${by - 6}l10 -16 12 4 -2 8 -10 2 -2 10z" fill="${col}" ${PG_OL}/>`; extra = `<path d="M${bx + w - 2} ${by - 10}l6 -12" stroke="#3b2414" stroke-width="4" stroke-linecap="round"/><path d="M${bx - w} ${by - 4}q-10 4 -8 16" fill="none" stroke="#3b2414" stroke-width="4" stroke-linecap="round"/>`; }
  if (t === 'cheetah') extra = [[-14, -2], [-2, 4], [10, -3], [-20, 6], [18, 3], [4, -6]].map(([dx, dy]) => `<circle cx="${bx + dx}" cy="${by + dy}" r="2.2" fill="#3b2a12"/>`).join('') + `<path d="M${bx - w} ${by}q-14 2 -16 -10" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round"/>`;
  const legs = [-w * 0.7, -w * 0.35, w * 0.35, w * 0.7].map((dx, i) => `<rect x="${bx + dx - 4}" y="${by + 6}" width="8" height="${lg + 8}" rx="3" fill="${i % 2 ? col : '#77838a'}" ${PG_OL}/>`).join('');
  return `<g transform="translate(${x} ${gy}) scale(${s})">${legs}<ellipse cx="${bx}" cy="${by}" rx="${w}" ry="14" fill="${col}" ${PG_OL}/>${t === 'elephant' ? head + extra : extra + head}<circle cx="${bx + w + 9}" cy="${by - 7}" r="1.8" fill="#22313a"/></g>`;
}
function pgPerson(t, x, gy, s = 1) {
  const shirt = { sprinter: '#d9534f', wheelchair: '#3d7fc1', astro: '#f2f4f5', skate: '#2a9d8f', bike: '#e3a51c', canoe: '#d9534f' }[t] || '#3d7fc1';
  const L = (x1, y1, x2, y2, c, w = 7) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  if (t === 'wheelchair') return `<g transform="translate(${x} ${gy}) scale(${s})"><circle cx="-4" cy="-20" r="20" fill="none" stroke="#22313a" stroke-width="4"/><circle cx="-4" cy="-20" r="4" fill="#22313a"/>${pgWheel(22, -6, 6)}<path d="M-12 -30h22v8" fill="none" stroke="#22313a" stroke-width="3"/>${L(-6, -32, -2, -58, shirt, 10)}${L(-2, -34, 16, -26, '#22313a', 6)}${L(-4, -54, 10, -40, shirt, 6)}<circle cx="0" cy="-68" r="8" fill="#c68b5e" ${PG_OL}/></g>`;
  if (t === 'astro') return `<g transform="translate(${x} ${gy}) scale(${s})"><rect x="-22" y="-62" width="12" height="26" rx="3" fill="#9aa6ad" ${PG_OL}/><path d="M-20 -46l-14 6" stroke="#f0bf4c" stroke-width="5" stroke-linecap="round"/>${L(-6, -24, -10, -4, shirt, 10)}${L(4, -24, 8, -4, shirt, 10)}<rect x="-14" y="-58" width="26" height="36" rx="10" fill="${shirt}" ${PG_OL}/>${L(10, -50, 22, -42, shirt, 8)}<circle cx="0" cy="-70" r="13" fill="${shirt}" ${PG_OL}/><path d="M-2 -76h10a5 5 0 0 1 0 12h-10z" fill="#e3a51c" ${PG_OL}/></g>`;
  /* a runner, leaning forward */
  return `<g transform="translate(${x} ${gy}) scale(${s})">${L(-2, -34, -16, -18, '#2b3a44')}${L(-16, -18, -22, -2, '#2b3a44')}${L(-2, -34, 12, -22, '#2b3a44')}${L(12, -22, 8, -4, '#2b3a44')}${L(-2, -34, 6, -60, shirt, 11)}${L(4, -54, 18, -46, '#c68b5e', 5)}${L(18, -46, 24, -56, '#c68b5e', 5)}${L(4, -54, -10, -48, '#c68b5e', 5)}${L(-10, -48, -14, -38, '#c68b5e', 5)}<circle cx="10" cy="-70" r="8" fill="#c68b5e" ${PG_OL}/></g>`;
}
/* one object, standing with its base on y = gy, centred on x */
function pgThing(t, draw, x, gy, s = 1) {
  const sc = (inner) => `<g transform="translate(${x} ${gy}) scale(${s})">${inner}</g>`;
  switch (draw) {
    case 'sled': return sc(`<path d="M-56 -2h62q8 0 10 -8" fill="none" stroke="#22313a" stroke-width="3" stroke-linecap="round"/><rect x="-52" y="-28" width="52" height="22" rx="3" fill="#b8763a" ${PG_OL}/><path d="M-52 -18h52" stroke="#7a5426" stroke-width="2"/><path d="M4 -16h24" stroke="#8a6a3c" stroke-width="2"/>`
      + [30, 56].map(dx => `<ellipse cx="${dx}" cy="-20" rx="12" ry="7" fill="#6b7a83" ${PG_OL}/><circle cx="${dx + 13}" cy="-27" r="6" fill="#6b7a83" ${PG_OL}/><path d="M${dx + 10} -32l2 -6 3 5zM${dx + 15} -32l3 -6 1 6z" fill="#6b7a83" ${PG_OL}/><path d="M${dx - 7} -14v12M${dx + 7} -14v12" stroke="#4d5a62" stroke-width="3" stroke-linecap="round"/><ellipse cx="${dx + 2}" cy="-17" rx="6" ry="3" fill="#eef2f4"/>`).join(''));
    case 'crate': return sc(`<rect x="-26" y="-46" width="52" height="46" rx="2" fill="#c99a5b" stroke="#7a5426" stroke-width="2.5"/><path d="M-26 -46l52 46M26 -46l-52 46" stroke="#7a5426" stroke-width="2"/><rect x="-26" y="-46" width="52" height="46" fill="none" stroke="#7a5426" stroke-width="5"/>`);
    case 'gummy': return sc(`<ellipse cx="-18" cy="-6" rx="9" ry="6" fill="#e8505b" ${PG_OL}/><ellipse cx="18" cy="-6" rx="9" ry="6" fill="#e8505b" ${PG_OL}/><ellipse cx="0" cy="-26" rx="22" ry="22" fill="#e8505b" ${PG_OL}/><ellipse cx="0" cy="-22" rx="12" ry="13" fill="#f28a92"/><ellipse cx="-22" cy="-30" rx="6" ry="9" fill="#e8505b" ${PG_OL}/><ellipse cx="22" cy="-30" rx="6" ry="9" fill="#e8505b" ${PG_OL}/><circle cx="-12" cy="-60" r="7" fill="#e8505b" ${PG_OL}/><circle cx="12" cy="-60" r="7" fill="#e8505b" ${PG_OL}/><circle cx="0" cy="-54" r="15" fill="#e8505b" ${PG_OL}/><circle cx="-5" cy="-56" r="2" fill="#22313a"/><circle cx="5" cy="-56" r="2" fill="#22313a"/><path d="M-4 -49q4 3 8 0" fill="none" stroke="#22313a" stroke-width="1.6"/><path d="M-12 -66h24l-3 -7h-18z" fill="#1f3a6b" ${PG_OL}/><path d="M22 -30h24" stroke="#8a6a3c" stroke-width="2.5"/>`);
    case 'pod': return sc(`<path d="M-48 -30l-14 -8v28l14 -8z" fill="#f0bf4c"/><path d="M-50 -27l-8 -4v14l8 -4z" fill="#e8505b"/><rect x="-46" y="-42" width="80" height="36" rx="18" fill="#d5dde2" ${PG_OL}/><path d="M34 -38q16 14 0 28" fill="#9aa6ad" ${PG_OL}/><circle cx="12" cy="-24" r="8" fill="#6aaedc" ${PG_OL}/><path d="M-30 -42l-8 -10h16zM-30 -6l-8 10h16z" fill="#2b5d8f" ${PG_OL}/>`);
    case 'person': return pgPerson(t, x, gy, s);
    case 'car': return pgCar(x, gy, t === 'kart' ? '#f0bf4c' : '#d9534f', s, t === 'rover' ? 'rover' : t === 'kart' ? 'kart' : 'car');
    case 'ball': return pgBall(t === 'tennis' ? 'tennis' : t === 'bowling' ? 'bowling' : t === 'puck' ? 'puck' : 'football', x, gy, s);
    case 'trolley': return sc(`<path d="M-30 -48h56l-6 30h-44z" fill="#c9d6dd" ${PG_OL}/><path d="M-24 -38h44M-22 -28h40M-12 -48v30M2 -48v30M16 -48v30" stroke="#7d8d96" stroke-width="1.5"/><path d="M-30 -48l-8 -10h-8" fill="none" stroke="#22313a" stroke-width="3" stroke-linecap="round"/><path d="M-24 -18v10h40v-10" fill="none" stroke="#22313a" stroke-width="2.5"/>${pgWheel(-20, -5, 5)}${pgWheel(14, -5, 5)}`);
    case 'bike': return sc(`<circle cx="-24" cy="-16" r="15" fill="none" stroke="#22313a" stroke-width="3"/><circle cx="24" cy="-16" r="15" fill="none" stroke="#22313a" stroke-width="3"/><path d="M-24 -16l12 -20h24l12 20M-12 -36l10 20h0l14 -20M-2 -16l-22 0" fill="none" stroke="#2a7d48" stroke-width="3" stroke-linejoin="round"/><path d="M-14 -40h8M14 -40l2 -6" stroke="#22313a" stroke-width="3" stroke-linecap="round"/><path d="M-10 -42l6 -24 18 8" fill="none" stroke="#e3a51c" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M-8 -42l4 14 -2 12" fill="none" stroke="#2b3a44" stroke-width="6" stroke-linecap="round"/><circle cx="-2" cy="-74" r="7.5" fill="#c68b5e" ${PG_OL}/><path d="M-10 -78q8 -10 16 0z" fill="#e8505b" ${PG_OL}/>`);
    case 'skateboard': return sc(`${pgWheel(-18, -4, 4)}${pgWheel(18, -4, 4)}<path d="M-34 -12h68q4 0 6 -4M-34 -12q-4 0 -6 -4" fill="none" stroke="#22313a" stroke-width="2"/><rect x="-32" y="-14" width="64" height="5" rx="2" fill="#e3a51c" ${PG_OL}/><path d="M-12 -14l4 -22 8 22M-8 -36l2 -24" fill="none" stroke="#2b3a44" stroke-width="6" stroke-linecap="round"/><path d="M-6 -36l2 -24" stroke="#2a9d8f" stroke-width="12" stroke-linecap="round"/><path d="M-4 -54l16 6M-4 -54l-16 8" stroke="#c68b5e" stroke-width="5" stroke-linecap="round"/><circle cx="-2" cy="-70" r="8" fill="#c68b5e" ${PG_OL}/>`);
    case 'train': return sc(`<rect x="-80" y="-44" width="76" height="36" rx="6" fill="#3d7fc1" ${PG_OL}/><path d="M0 -44h52q20 0 26 20v16h-78z" fill="#3d7fc1" ${PG_OL}/>${[-72, -52, -32, 8, 26].map(dx => `<rect x="${dx}" y="-36" width="14" height="12" rx="2" fill="#cde6f2" ${PG_OL}/>`).join('')}<path d="M48 -36h14l8 12h-22z" fill="#cde6f2" ${PG_OL}/><rect x="-80" y="-14" width="160" height="5" fill="#f0bf4c"/><path d="M20 -44l8 -10 8 10M28 -54h-14" fill="none" stroke="#22313a" stroke-width="2"/>${[-66, -20, 14, 60].map(dx => pgWheel(dx, -6, 6)).join('')}`);
    case 'animal': return pgAnimal(t, x, gy, s);
    case 'lift': return sc(`<path d="M0 -96v26" stroke="#22313a" stroke-width="2.5"/><rect x="-28" y="-72" width="56" height="64" rx="3" fill="#c9d6dd" ${PG_OL}/><rect x="-22" y="-64" width="44" height="50" fill="#e9eef1" ${PG_OL}/><path d="M0 -64v50" stroke="#22313a" stroke-width="2"/><circle cx="18" cy="-70" r="2.5" fill="#e3a51c"/>`);
    case 'rocket': return sc(`<path d="M-62 -40l-26 -6 6 12 -6 12 26 -6z" fill="#f0bf4c"/><path d="M-62 -36l-14 -2 4 6 -4 6 14 -2z" fill="#e8505b"/><rect x="-62" y="-50" width="80" height="28" rx="6" fill="#e9eef1" ${PG_OL}/><path d="M18 -50q30 14 0 28z" fill="#d9534f" ${PG_OL}/><path d="M-50 -50l-8 -12h16zM-50 -22l-8 10h16z" fill="#d9534f" ${PG_OL}/><rect x="-70" y="-14" width="100" height="8" rx="2" fill="#6b7a83" ${PG_OL}/><circle cx="-4" cy="-36" r="6" fill="#6aaedc" ${PG_OL}/>`);
    case 'truck': return t === 'bus' ? sc(`<rect x="-78" y="-50" width="150" height="40" rx="7" fill="#f0b429" ${PG_OL}/>${[-70, -48, -26, -4, 18, 40].map(dx => `<rect x="${dx}" y="-44" width="16" height="13" rx="2" fill="#cde6f2" ${PG_OL}/>`).join('')}<rect x="-78" y="-24" width="150" height="4" fill="#22313a"/>${pgWheel(-50, -8, 9)}${pgWheel(46, -8, 9)}`)
      : sc(`<rect x="-70" y="-58" width="96" height="46" rx="3" fill="#f2f4f5" ${PG_OL}/><path d="M26 -46h24l16 16v18h-40z" fill="#11806f" ${PG_OL}/><path d="M32 -42h16l10 12h-26z" fill="#cde6f2" ${PG_OL}/><text x="-22" y="-30" text-anchor="middle" font-size="12" font-weight="800" fill="#11806f">DELIVERY</text>${pgWheel(-46, -9, 9)}${pgWheel(46, -9, 9)}`);
    case 'boat': return t === 'canoe' ? sc(`<path d="M-62 -14h124q-10 14 -40 14h-44q-30 0 -40 -14z" fill="#d0743c" ${PG_OL}/>${pgPerson('canoe', 0, -10, 0.7)}<path d="M18 -54l-30 60" stroke="#8a5a33" stroke-width="3" stroke-linecap="round"/><ellipse cx="-14" cy="8" rx="5" ry="9" transform="rotate(26 -14 8)" fill="#8a5a33"/>`)
      : sc(`<path d="M-60 -20h112l14 -10q-6 30 -40 30h-60q-20 0 -26 -20z" fill="#f2f4f5" ${PG_OL}/><path d="M-60 -20h126" stroke="#d9534f" stroke-width="4"/><path d="M-16 -20v-18h30l14 18z" fill="#cde6f2" ${PG_OL}/><path d="M-76 -6q8 -4 14 0M-90 0q8 -4 14 0" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`);
    case 'diver': return sc(`<path d="M-30 -52l-14 -10M30 -52l14 -10M-22 -40l-18 12M22 -40l18 12" stroke="#c68b5e" stroke-width="6" stroke-linecap="round"/><path d="M-18 -46h36" stroke="#3d7fc1" stroke-width="16" stroke-linecap="round"/><path d="M-26 -52l-14 -8M26 -52l14 -8" stroke="#3d7fc1" stroke-width="7" stroke-linecap="round"/><path d="M-14 -40l-20 12M14 -40l20 12" stroke="#2b3a44" stroke-width="7" stroke-linecap="round"/><circle cx="0" cy="-60" r="9" fill="#c68b5e" ${PG_OL}/><path d="M-9 -63q9 -10 18 0z" fill="#e8505b" ${PG_OL}/><rect x="-6" y="-62" width="12" height="4" rx="2" fill="#22313a"/>`);
  }
  return sc(`<rect x="-24" y="-40" width="48" height="40" rx="6" fill="#c9d6dd" ${PG_OL}/>`);
}
/* where the object is: sky and ground colours */
const PG_WORLDBG = { moon: ['#1b2233', '#9a9fa6'], mars: ['#e7b48f', '#b5552f'], venus: ['#e9c77b', '#c99a49'], titan: ['#d8a85a', '#a8783c'], jupiter: ['#e2c29a', '#c48a5c'] };
function pgBg(thing, world) {
  if (world && PG_WORLDBG[world]) return PG_WORLDBG[world];
  const k = thing;
  if (k === 'sled') return ['#dbe9f1', '#f4f8fa'];
  if (k === 'crate' || k === 'smooshy' || k === 'modeltrain') return ['#e8eef0', '#e2cfa9'];
  if (k === 'pod' || k === 'astro') return ['#10182b', null];
  if (k === 'rover') return ['#f0d9c4', '#c97b4a'];
  if (k === 'dropcrate' || k === 'skydiver') return ['#cfe6f3', null];
  if (k === 'sprinter' || k === 'wheelchair') return ['#e3eff5', '#c8553d'];
  if (k === 'football') return ['#e3eff5', '#7fbf6a'];
  if (k === 'tennis') return ['#e3eff5', '#4f9d69'];
  if (k === 'puck') return ['#e3eff5', '#dff1f8'];
  if (k === 'bowling') return ['#e8eef0', '#e2c08a'];
  if (k === 'rhino' || k === 'elephant' || k === 'cheetah') return ['#f3e6c4', '#d8c37a'];
  if (k === 'horse') return ['#e3eff5', '#9cc77f'];
  if (k === 'elevator') return ['#d6dde1', null];
  if (k === 'rocketsled') return ['#f4e4c8', '#e3c99a'];
  if (k === 'motorboat' || k === 'canoe') return ['#e3eff5', '#6fb4d2'];
  if (k === 'trolley') return ['#eef2f3', '#d9dfe2'];
  return ['#e3eff5', '#9aa3a6'];   // road
}
function pgMotion(dir, x, y) {
  const L = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#22313a" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>`;
  if (dir === 'down') return L(x - 14, y - 4, x - 14, y - 18) + L(x, y - 2, x, y - 22) + L(x + 14, y - 4, x + 14, y - 18);   // y: the top of the object
  if (dir === 'up') return L(x - 12, y + 6, x - 12, y + 22) + L(x + 12, y + 6, x + 12, y + 22);
  return L(x - 10, y - 30, x - 30, y - 30) + L(x - 4, y - 18, x - 30, y - 18) + L(x - 10, y - 6, x - 30, y - 6);
}
/* the picture for q.pic: { thing, draw, dir, world, thing2 } */
function pgPic(pic) {
  const t = PR_THING[pic.thing] || {}, name = t.name || 'the object';
  if (pic.thing2) {
    const t2 = PR_THING[pic.thing2] || {};
    return `<svg viewBox="0 0 220 130" role="img" aria-label="${esc(name)} and ${esc(t2.name || '')}"><rect width="220" height="130" rx="10" fill="#e3eff5"/><rect x="0" y="108" width="220" height="22" fill="#cfd8dc"/><path d="M110 18v88" stroke="#9aa6ad" stroke-width="2" stroke-dasharray="4 4"/>${pgThing(pic.thing, t.pic, 56, 108, 0.62)}${pgThing(pic.thing2, t2.pic, 166, 108, 0.62)}</svg>`;
  }
  const [sky, gnd] = pgBg(pic.thing, pic.world), dir = pic.dir || 'right', air = !gnd;
  const big = { train: 0.82, truck: 0.85, rocket: 0.95, bus: 0.85 }[t.pic] || 1, s = pic.thing === 'bus' ? 0.85 : big;
  const gy = air ? (dir === 'down' ? 96 : 92) : 108, cx = dir === 'up' ? 110 : 116;
  let bg = `<rect width="220" height="130" rx="10" fill="${sky}"/>`;
  if (sky === '#10182b' || pic.world === 'moon') bg += [[20, 18], [60, 34], [176, 22], [200, 60], [36, 70], [150, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#e6ecff"/>`).join('');
  if (pic.thing === 'skydiver' || pic.thing === 'dropcrate') bg += '<ellipse cx="40" cy="104" rx="26" ry="8" fill="#fff" opacity=".8"/><ellipse cx="186" cy="30" rx="22" ry="7" fill="#fff" opacity=".8"/>';
  if (pic.thing === 'elevator') bg += '<path d="M70 0v130M150 0v130" stroke="#9aa6ad" stroke-width="3"/>';
  if (gnd) bg += `<rect x="0" y="108" width="220" height="22" fill="${gnd}"/>` + (gnd === '#9aa3a6' ? '<path d="M10 120h20M50 120h20M90 120h20M130 120h20M170 120h20" stroke="#f4f4f4" stroke-width="2.5"/>' : gnd === '#c8553d' ? '<path d="M0 116h220M0 124h220" stroke="#f4e6dc" stroke-width="1.5"/>' : gnd === '#6fb4d2' ? '<path d="M14 118q6 -4 12 0t12 0M120 122q6 -4 12 0t12 0" fill="none" stroke="#e3f3fa" stroke-width="2"/>' : '');
  if (pic.thing === 'rocketsled') bg += '<path d="M0 104h220" stroke="#6b7a83" stroke-width="3"/>';
  const wl = pic.world && DZ_WORLDS[pic.world] ? `<rect x="8" y="8" width="${DZ_WORLDS[pic.world].name.length * 7 + 22}" height="20" rx="10" fill="#fff" opacity=".9"/><text x="18" y="22" font-size="11" font-weight="800" fill="#22313a">${DZ_WORLDS[pic.world].name}</text>` : '';
  return `<svg viewBox="0 0 220 130" role="img" aria-label="A picture of ${esc(name)}${pic.world && DZ_WORLDS[pic.world] ? ' ' + DZ_WORLDS[pic.world].on : ''}">${bg}${pgMotion(dir, dir === 'right' ? cx - 52 * s : cx, dir === 'down' ? gy - (t.pic === 'diver' ? 72 : 50) : gy)}${pgThing(pic.thing, t.pic, cx, gy, s)}${wl}</svg>`;
}
/* the free-body sketch: arrows from the centre, labelled with their values (? N for the unknown) */
function pgFbd(pic) {
  const A = pic.arrows || [], val = a => parseNum(String(a.label).replace(/\s*N$/, '')), known = A.map(val).filter(v => !isNaN(v)), mx = Math.max(1, ...known);
  const fwd = pic.dir || 'right', vert = A.some(a => a.dir === 'up' || a.dir === 'down'), W = 300, H = vert ? 170 : 92, cx = 150, cy = vert ? 85 : 48;
  const len = a => { const v = val(a), horiz = a.dir === 'left' || a.dir === 'right', LMAX = horiz ? 96 : 60, LMIN = horiz ? 34 : 24;
    if (isNaN(v)) return a.dir === fwd ? LMAX : LMIN + (LMAX - LMIN) * 0.35;          // an unknown force: longer if it points the way the object speeds up
    const L = LMIN + (LMAX - LMIN) * v / mx; return known.length === A.length ? L : (a.dir === fwd ? L : Math.min(L, LMAX * 0.7)); };
  const col = a => /weight|gravity/.test(a.name) ? 'var(--vert)' : a.dir === fwd ? 'var(--right)' : 'var(--fric)';
  const arrows = A.map((a, i) => {
    const L = len(a), d = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] }[a.dir] || [1, 0], x2 = cx + d[0] * L, y2 = cy + d[1] * L, c = col(a), unk = isNaN(val(a));
    const hx = d[0], hy = d[1], h1 = `${x2 - hx * 10 - hy * 7},${y2 - hy * 10 - hx * 7}`, h2 = `${x2 - hx * 10 + hy * 7},${y2 - hy * 10 + hx * 7}`;
    let tx, ty, anchor;
    if (hx) { tx = cx + hx * 27; ty = cy - 14; anchor = hx > 0 ? 'start' : 'end'; }   /* just outside the box, so labels never cover it */ else { tx = cx + 30; ty = cy + hy * Math.max(24, L * 0.75); anchor = 'start'; }
    return `<g><path d="M${cx} ${cy}L${x2 - hx * 6} ${y2 - hy * 6}" stroke="${c}" stroke-width="5" stroke-linecap="round"${unk ? ' stroke-dasharray="7 5"' : ''}/><polygon points="${x2},${y2} ${h1} ${h2}" fill="${c}"/>
      <text x="${tx}" y="${ty}" text-anchor="${anchor}" font-size="14" font-weight="800" fill="var(--ink)" font-family="var(--f-num)">${esc(a.label)}</text><text x="${tx}" y="${hx ? cy + 26 : ty + 15}" text-anchor="${anchor}" font-size="12" fill="var(--muted)">${esc(a.name)}</text></g>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Force sketch: ${A.map(a => `${a.name} ${a.label} ${a.dir}`).join(', ')}"><rect x="${cx - 22}" y="${cy - 18}" width="44" height="36" rx="7" fill="var(--chip)" stroke="var(--ink)" stroke-width="2"/>${arrows}<circle cx="${cx}" cy="${cy}" r="4" fill="var(--ink)"/></svg>`;
}

/* ---------- the summary PDF and the Gym part of "My work so far" ---------- */
function pgSummaryRows(P) {
  const T = pgTargetState(P);
  return { T, tLine: T.on ? `Target: ${esc(T.label.toLowerCase())}. ${T.done ? '✓ Reached' : 'Not reached yet'}${T.lvl ? '' : ` (${Math.min(T.have, T.n)} of ${T.n} right since choosing this target)`}` : 'Target: free practice (no target chosen).' };
}
function pgSheetHTML() {
  const P = pgData(), u = user(), today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), { T, tLine } = pgSummaryRows(P), B = x => `<span class="stu">${x}</span>`;
  const sk = pgSkillRows(P.skills), tr = pgTrapRows(P.traps), last = P.hist.slice(-10);
  const qrow = (hh, i) => { let q = null; try { q = prGen(hh.lvl, hh.seed, hh.opts || {}); } catch (e) { } const story = q ? q.p : '(question)';
    return `<tr><td>${i + 1}</td><td>${hh.lvl}</td><td style="font-size:8.5pt">${esc(story)}</td><td style="white-space:nowrap">${B(esc(hh.ans || ''))}</td><td style="white-space:nowrap">${hh.ok ? '✓' : '✗'}${hh.ok && hh.tries > 1 ? ' (2nd try)' : ''}${!hh.ok && q ? `<br><span style="font-size:8.5pt">Answer: ${esc(q.ansText + ' ' + q.unit)}</span>` : ''}</td><td style="font-size:8.5pt;white-space:pre-line">${hh.w ? B(esc(hh.w)) : '–'}</td></tr>`; };
  return `<div class="ws"><div class="page">
    <div class="hd"><div class="l"><b>FORCE HQ</b><div style="font-size:10pt;color:#cfe0ea">Maths Gym · F = m × a practice</div></div><div class="r"><div style="font-size:14pt;font-weight:800">My Maths Gym practice</div><div style="font-size:10pt">Force, mass and acceleration</div></div></div>
    <div class="namebar"><div>Name: ${B(esc(u.teacher ? 'Teacher copy' : u.name || ''))}</div><div>Class: ${B(esc(u.cls || ''))}</div><div>Date: ${today}</div></div>
    <p class="note">Everything printed in blue was added by the student in the sim. Every question was made and marked by the sim.</p>
    <p style="font-size:12.5pt;font-weight:800;margin:6px 0;padding:6px 10px;border:2px solid ${T.on && T.done ? '#2a7d48' : '#9aa9b0'};border-radius:6px">${B(tLine)}</p>
    <table><tr><th>Highest level reached</th><th>Level now</th><th>Questions right</th><th>Questions answered</th><th>Goes of 10 finished</th></tr>
      <tr><td>${B('Level ' + P.best + ': ' + esc(PG_LEVELS[P.best - 1]))}</td><td>${B(P.level)}</td><td>${B(P.right)}</td><td>${B(P.asked)}</td><td>${B(P.goes)}</td></tr></table>
    <h2>Skills</h2>${sk.length ? `<table><tr><th>Skill</th><th>Questions</th><th>Right</th></tr>${sk.map(([n, r, t]) => `<tr><td>${esc(n)}</td><td>${B(t)}</td><td>${B(r)}</td></tr>`).join('')}</table>` : '<p class="note">No questions answered yet.</p>'}
    <h2>Mistakes met and fixed</h2>${tr.length ? `<table><tr><th>Mistake the sim spotted</th><th>Times met</th><th>Fixed on the second try</th></tr>${tr.map(([n, m, f]) => `<tr><td>${esc(n)}</td><td>${B(m)}</td><td>${B(f)}</td></tr>`).join('')}</table>` : '<p class="note">No common mistakes spotted.</p>'}
    <h2>My last ${last.length || 10} questions</h2>${last.length ? `<table style="font-size:9pt"><tr><th style="width:4%">#</th><th style="width:6%">Level</th><th style="width:46%">Question</th><th>My answer</th><th>Right?</th><th style="width:22%">My working</th></tr>${last.map(qrow).join('')}</table>` : '<p class="note">No questions answered yet.</p>'}
  </div></div>`;
}
function pgProgressHTML() {
  const P = pgData(); if (!P.asked) return '';
  const { tLine } = pgSummaryRows(P), sk = pgSkillRows(P.skills), tr = pgTrapRows(P.traps), B = x => `<span class="stu">${x}</span>`;
  return `<div class="page"><h2>Maths Gym (F = m × a practice)</h2><p>${B(tLine)}</p>
    <p>Highest level reached: ${B('level ' + P.best + ', ' + esc(PG_LEVELS[P.best - 1].toLowerCase()))} · Level now: ${B(P.level)} · Questions right: ${B(P.right + ' of ' + P.asked)}</p>
    ${sk.length ? `<table><tr><th>Skill</th><th>Questions</th><th>Right</th></tr>${sk.map(([n, r, t]) => `<tr><td>${esc(n)}</td><td>${B(t)}</td><td>${B(r)}</td></tr>`).join('')}</table>` : ''}
    ${tr.length ? `<p style="margin-top:6px">Mistakes met: ${tr.map(([n, m, f]) => `${esc(n)} (${B(m + '×')}${f ? ', fixed ' + B(f) : ''})`).join('; ')}</p>` : ''}
    <p class="note">Use "📄 Save my practice" in the Maths Gym for the full summary.</p></div>`;
}

/* ---------- the teacher page row, prompt lines and AI feedback text ---------- */
const PG_TCHOICE = ['l3', 'l4', 'l5', 'l6', 'r10', 'r20', 'r30'];
const pgGymOf = T => T && T.gym && T.gym.on ? { on: true, target: PG_TCHOICE.includes(T.gym.target) ? T.gym.target : 'l4' } : null;
const pgTeachMins = g => g ? PG_TMIN[g.target] || 20 : 0;
function pgTeacherRow(T0) {
  const g = T0.gym || {}, tg = PG_TCHOICE.includes(g.target) ? g.target : 'l4';
  return `<h3 style="margin:10px 0 2px">🏋️ Maths Gym (F = m × a practice)</h3><p class="scaleNote">Adaptive practice from the home page: questions get harder as students get them right. Students pick the same target in the Gym and upload their practice summary PDF. Best after Chapter 3 Foundation.</p>
    <div class="row pg-trow" style="border-bottom:1px dashed var(--line);padding:4px 0;justify-content:space-between"><label><input type="checkbox" data-gym ${g.on ? 'checked' : ''}> <span><b>🏋️ Maths Gym</b> · approx. <span id="tGymMin">${PG_TMIN[tg]}</span> min</span></label><label>Target <select id="tGymT" style="font:inherit;padding:4px 6px;border:1.5px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink)">${PG_TCHOICE.map(k => `<option value="${k}"${k === tg ? ' selected' : ''}>${PG_TARGETS[k]}</option>`).join('')}</select></label></div>`;
}
const pgTargetVerb = t => t[0] === 'l' ? `until you reach level ${t.slice(1)}` : `until you have got ${t.slice(1)} questions right`;
/* lines for teacherPrompt (no answers: the questions are generated) */
function pgPromptParts(g, n) {
  const T = PG_TARGETS[g.target];
  return {
    title: `Maths Gym (${T.toLowerCase()})`,
    step: `${n}. Maths Gym: on the home page press "Open the Maths Gym". At the top, set "My target" to "${T}". Practise F = m × a ${pgTargetVerb(g.target)} (the target shows ✓ when you get there). Then press "📄 Save my practice" and "⬇ Download my practice (PDF)".`,
    submit: `- The Maths Gym practice PDF (from "📄 Save my practice"), showing the target "${T}".`,
    goal: '- Maths Gym: use F = m × a and the formula triangle to find force, mass or acceleration, including problems with more than one step, and give each answer with the right unit.',
    note: 'The Maths Gym makes and marks its own questions, so there is no answer key for it. Each student gets different numbers.'
  };
}
function pgAiText(g, alone) {
  const T = PG_TARGETS[g.target], L = [];
  if (alone) { L.push('All written feedback should be grade 7-8 appropriate language, short and to-the-point, and enthusiastic.'); L.push(''); }
  L.push('MATHS GYM (F = m × a PRACTICE) · MYP: A ii');
  L.push('The student uploads a "Force HQ Maths Gym" summary PDF. The sim made and marked every question, so there is no answer key: trust its ticks and crosses. What the student typed (answers and working) is printed in blue.');
  L.push(`Target set by the teacher: ${T}. Levels: ${PG_LEVELS.map((n, i) => `${i + 1} ${n}`).join(', ')}.`);
  L.push('Check the summary page against the target:');
  L.push(`- Target: the line at the top says "${T.toLowerCase()}" with "✓ Reached" or "Not reached yet". If the student chose a different target, say so kindly.`);
  L.push(g.target[0] === 'l' ? `- Level reached: "Highest level reached" must be level ${g.target.slice(1)} or higher.` : `- Questions right: the target line counts the questions right since the student chose the target. It must be at least ${g.target.slice(1)}.`);
  L.push('- Working shown: look at "My working" for the last 10 questions. Praise a formula written first and clear steps (Step 1, Step 2). If there is no working, suggest writing the formula and the numbers before the answer.');
  L.push('- Mistakes met and fixed: the table lists common mistakes the sim spotted (for example "Multiplied instead of dividing") and how many were fixed on the second try. Name a fixed mistake as a strength, and a mistake that is still not fixed as the next step, with a hint rather than the answer.');
  L.push('Feedback: say clearly whether the target was reached, give one or two strengths, and give one next step. If the target was not reached, encourage the student to keep practising.');
  L.push(`MYP: this practice is evidence for Criterion A, strand ii (${MYP_STRANDS.Aii}). It has no marks of its own${alone ? ', so give feedback only, with no level' : ', so do not add it to the worksheet marks; mention it in the A ii sentence'}.`);
  return L.join('\n');
}
