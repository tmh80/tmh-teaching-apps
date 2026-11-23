/* ===== My runs: a history of every push, pull and launch =====
   Each button action starts a run. The run updates live while the crate moves, then is saved with a
   plain-English sentence and the key numbers, so students can answer questions without re-running.
   Shown in a pop-out side panel ("📋 My runs"), in the Journal, and under the Your turn questions. */
let RUN = null, RUNSEQ = 0, RUNDIRTY = 0, RUNHOLD = false;
const runsAll = () => dbGet('runs', []);
function runWhere() {
  if (VIEW === 'vExplore') return { sec: 'explore', label: 'Explore' };
  if (VIEW === 'vChapter' && CH) {
    const st = CHDATA[CH.id].steps[GI];
    if (CTAB === 'challenge') return { sec: CH.id, step: 'challenge', label: `Chapter ${CH.n} ${CH.part} · Challenge` };
    return { sec: CH.id, step: st && st.id, label: `Chapter ${CH.n} ${CH.part} · step ${GI + 1}` };
  }
  return { sec: 'other', label: 'Force HQ' };
}
/* start a run: called by the Pull!, push and launch buttons */
function runMark(kind) {
  if (RUN) runEnd('new');
  const R = runsAll(); RUNSEQ = Math.max(RUNSEQ, R.reduce((a, r) => Math.max(a, r.n || 0), 0)) + 1;
  const f = forces();
  RUN = Object.assign({ n: RUNSEQ, kind, at: Date.now(), live: true, mass: S.mass, floor: S.floor, L: tot(S.left), R: tot(S.right), x0: S.x, t0: S.t,
    v0: kind === 'launch' ? S.v0 : 0, brakeF: S.brakeF, brakeOn: S.brakeX != null, top: 0, lastV: 0, dist: 0, dir: 0, fs: 0, fk: 0, push: 0, stuckT: 0, moved: false, bd: null, bt: null, out: 'running', W: f.W, scene: S.scene, nR: S.right.length, a: null, net: null, Rst: null, frS: null, v1: null, v2: null, v3: null, v4: null, finT: null, finV: null, astro: S.astro, pushF: S.pushF, vp: null, va: null, bursts: [], dockV: null }, runWhere());
  R.push(RUN); if (R.length > 200) R.splice(0, R.length - 200); dbSet('runs', R); RUNDIRTY = 1;
}
/* update the live run every frame */
function runTick(f, dt) {
  if (!RUN) return;
  const av = Math.abs(S.v);
  if (av > RUN.top) RUN.top = av;
  if (av > 0.005) { RUN.moved = true; RUN.lastV = av; }
  RUN.dist = Math.abs(S.x - RUN.x0); RUN.dir = Math.sign(S.x - RUN.x0) || RUN.dir;
  if (f.shove > RUN.push) RUN.push = f.shove;
  if (av < 1e-6 && Math.abs(f.fr) > 0.5) { RUN.fs = Math.max(RUN.fs, Math.abs(f.fr)); if (S.running) RUN.stuckT += dt; }
  if (av > 0.005 && Math.abs(f.fr) > 0.5) RUN.fk = Math.abs(f.fr);
  RUN.L = Math.max(RUN.L, f.L); RUN.R = Math.max(RUN.R, f.R);
  if (S.brakeFrom != null) { RUN.bd = S.x - S.brakeFrom; RUN.bt = S.t - S.brakeT; }
  RUN.t = S.t - RUN.t0;
  /* Chapter 3: the steady acceleration, resultant and friction once the huskies are pulling at full strength, and the velocity at 2 s and 4 s */
  if (S.running && S.pullT > PULL_RAMP + 0.05 && f.R > 0) { RUN.a = f.a; RUN.net = f.net; RUN.Rst = f.R; RUN.frS = Math.abs(f.fr); }
  [1, 2, 3, 4].forEach(k => { if (RUN['v' + k] == null && RUN.t >= k) RUN['v' + k] = S.v; });
  if (S.flags.finished) { RUN.finT = S.finT - RUN.t0; RUN.finV = S.finV; }
  /* Chapter 4: the velocities the pod and the astronaut reached when the push ended, any thruster bursts, and the docking velocity */
  if (S.scene === 'space') { if (S.pushDone && RUN.vp == null) { RUN.vp = S.pushDone.vp; RUN.va = S.pushDone.va; } RUN.bursts = S.bursts.slice(); if (S.flags.docked) RUN.dockV = S.dockV; RUN.curV = S.v; }
  if (S.scene === 'shop') { RUNDIRTY = 1; return; }   // the Workshop ends its own runs when the pull finishes
  if (!S.running) runEnd(S.flags.docked ? 'dock' : S.flags.finished ? 'finish' : S.msg && /end of the arena/.test(S.msg) ? 'end' : S.msg && /drifted/.test(S.msg) ? 'drift' : S.flags.stopped && S.brakeFrom != null ? 'braked' : 'paused');
  else if (S.scene !== 'space' && av < 1e-6 && f.L < 0.5 && f.R < 0.5 && f.shove < 0.5 && RUN.t > 0.7) runEnd(RUN.moved ? 'friction' : 'still');   // a push that has died away
  RUNDIRTY = 1;
}
function runEnd(why) {
  if (!RUN) return; RUN.live = false; RUN.out = why === 'new' || why === 'reset' ? (RUN.out === 'running' ? 'reset' : RUN.out) : why;
  const R = runsAll(), i = R.findIndex(r => r.n === RUN.n && r.at === RUN.at); if (i >= 0) R[i] = RUN; dbSet('runs', R); RUN = null; RUNDIRTY = 1;
}
/* the sentence a student reads */
const m2 = v => fmt(v, 2) + ' m', ms = v => fmt(v, 2) + ' m/s', NN = v => fmt(v, v < 100 && v % 1 ? 1 : 0) + ' N';
const SNOWPH = { snow0: 'with friction switched off', snow: 'on packed snow', powder: 'on fresh powder' };
function sledText(r) {
  const hk = `${r.nR} husk${r.nR === 1 ? 'y' : 'ies'}`, live = r.live && r.out === 'running';
  const head = `${hk} pulled the ${r.mass} kg sled with ${NN(r.R)} ${SNOWPH[r.floor] || ''}.`.replace(' .', '.');
  if (!r.moved && !live) return head + (r.fs ? ` Friction held the sled still with ${NN(r.fs)}, so the resultant force was 0 N and the acceleration was 0 m/s².` : ' It did not move.');
  const mk = sledMasked(r.nR, r.mass, r.floor);
  const body = r.a == null ? '' : mk.has('readA') && mk.has('readRes') ? '' : mk.has('readA') ? ` The resultant force was ${NN(r.net)}.` : mk.has('readRes') ? ` The acceleration was ${fmt(r.a, 2)} m/s².` : ` The resultant force was ${NN(r.net)}, so the acceleration was ${fmt(r.a, 2)} m/s².`;
  if (live) return head + body + ` It is moving at ${ms(Math.abs(S.v))} and has gone ${m2(r.dist)} so far…`;
  if (r.out === 'finish') return head + body + ` It crossed the finish line after ${fmt(r.finT, 1)} s, moving at ${ms(r.finV)}.`;
  return head + body + ` Its top velocity was ${ms(r.top)} and it went ${m2(r.dist)} before you ${r.out === 'paused' ? 'paused' : 'stopped'} it.`;
}
function spaceText(r) {
  const live = r.live && r.out === 'running', mk = spaceMasked(r.pushF, r.mass, r.astro), hv = k => mk.has(k);
  if (r.kind === 'thrust') {
    const head = `You fired the thrusters on the ${r.mass} kg pod.`, n = r.bursts.length;
    if (!n) return head + (live ? ' The burst is happening…' : ' No burst finished.');
    return head + ` After ${n === 1 ? 'one burst' : n + ' bursts'}, the pod's velocity was ${r.bursts.map(ms).join(', then ')}.` + (r.dockV != null ? ` It docked at ${ms(r.dockV)}.` : '');
  }
  const head = `The ${r.astro} kg astronaut pushed the ${r.mass} kg pod with ${NN(r.pushF)}.`;
  if (r.vp == null) return head + (live ? ' The push is happening…' : ' The run stopped before the push finished.');
  const bits = [hv('readV') ? '' : ` The pod sped up to ${ms(r.vp)} to the right.`, hv('readAV') ? '' : ` The astronaut sped up to ${ms(r.va)} to the left.`].join('');
  const end = r.dockV != null ? (hv('readV') ? ' The pod docked.' : ` The pod docked at ${ms(r.dockV)}.`) : r.out === 'drift' ? ' The pod drifted off into space.' : live ? ' The pod is gliding towards the dock…' : '';
  return head + bits + end;
}
function runText(r) {
  if (r.scene === 'drop') return dropText(r);
  if (r.scene === 'shop') return wsText(r);
  if (r.scene === 'sled') return sledText(r);
  if (r.scene === 'space') return spaceText(r);
  const crate = `the ${r.mass} kg crate ${FLOORPH[r.floor] || ''}`.trim(), steady = r.floor === 'air' && Math.abs(r.lastV - r.top) < 0.02;
  const dirw = r.dir > 0 ? 'right' : 'left', live = r.live && r.out === 'running';
  if (r.kind === 'launch') {
    const head = `You launched ${crate} at ${ms(r.v0)}${r.brakeOn ? ` with a ${NN(r.brakeF)} brake` : ''}.`;
    if (live) return head + (r.bd != null ? ` The brake is on: it has slid ${m2(r.bd)} so far…` : ' It is gliding towards the brake line…');
    if (r.out === 'braked') return head + ` It stopped ${m2(r.bd)} after the brake line, ${fmt(r.bt, 1)} s after the brake came on.`;
    if (r.out === 'end') return head + ` It reached the end of the arena before it could stop${r.bd != null ? ` (it slid ${m2(r.bd)} after the brake line)` : ''}.`;
    return head + ` The run stopped early after ${m2(r.dist)}.`;
  }
  if (r.kind === 'push') {
    const head = `You pushed ${crate}.`;
    if (live) return head + ` It is moving at ${ms(Math.abs(S.v))} and has travelled ${m2(r.dist)} so far…`;
    if (!r.moved || r.out === 'still') return head + ` It didn't move: friction held it still${r.fs ? ` with up to ${NN(r.fs)}` : ''}.`;
    if (r.out === 'end') return head + (Math.abs(r.lastV - r.top) < 0.02 ? ` It reached ${ms(r.top)} and kept that steady velocity for ${m2(r.dist)}, all the way to the end of the arena.` : ` Its top velocity was ${ms(r.top)}, and it travelled ${m2(r.dist)} to the end of the arena.`);
    if (r.out === 'friction') return head + ` Its top velocity was ${ms(r.top)}. Friction${r.fk ? ` (${NN(r.fk)})` : ''} slowed it down and it stopped after ${m2(r.dist)}, ${fmt(r.t, 1)} s after the push.`;
    return head + (steady ? ` It glided at a steady ${ms(r.top)} and had travelled ${m2(r.dist)} when the run was stopped.` : ` Its top velocity was ${ms(r.top)}, and it travelled ${m2(r.dist)} before the run was stopped.`);
  }
  const head = r.L < 0.5 ? `The right team pulled ${crate} with ${NN(r.R)}.` : r.R < 0.5 ? `The left team pulled ${crate} with ${NN(r.L)}.` : `Tug-of-war on ${crate}: left team ${NN(r.L)}, right team ${NN(r.R)}.`;
  if (!r.moved) return head + (Math.abs(r.L - r.R) < 0.5 ? ' The pulls were balanced, so the crate stayed still.' : ` Friction held the crate still with ${NN(r.fs || Math.abs(r.L - r.R))}.`) + (live ? '' : '');
  if (live) return head + ` The crate is moving ${dirw} at ${ms(Math.abs(S.v))} and has travelled ${m2(r.dist)} so far…`;
  if (r.out === 'end') return head + ` The crate moved ${dirw}, reached ${ms(r.top)} and travelled ${m2(r.dist)} to the end of the arena.`;
  return head + ` The crate moved ${dirw}, reached ${ms(r.top)} and travelled ${m2(r.dist)} before you ${r.out === 'paused' ? 'paused' : 'stopped'} it.`;
}
function runChips(r) {
  if (r.scene === 'drop') return dropChips(r);
  if (r.scene === 'shop') return wsChips(r);
  if (r.scene === 'space') {
    const mk = spaceMasked(r.pushF, r.mass, r.astro), c = [['Pod mass', r.mass + ' kg'], ['Astronaut mass', r.astro + ' kg']];
    if (r.kind === 'push') c.push(['Push', NN(r.pushF)]);
    if (r.vp != null && !mk.has('readV')) c.push(['Pod velocity', ms(r.vp)]); if (r.va != null && !mk.has('readAV')) c.push(['Astronaut velocity', ms(r.va)]);
    r.bursts.forEach((v, i) => c.push(['Velocity after burst ' + (i + 1), ms(v)])); if (r.dockV != null && !mk.has('readV')) c.push(['Docking velocity', ms(r.dockV)]);
    return c;
  }
  if (r.scene === 'sled') {
    const c = [['Huskies', String(r.nR)], ['Mass', r.mass + ' kg'], ['Snow', FLOORS[r.floor] ? FLOORS[r.floor].name : r.floor], ['Pull', NN(r.R)]];
    if (r.frS != null && r.frS > 0.5) c.push(['Friction', NN(r.frS)]); else if (r.fs) c.push(['Friction', NN(r.fs)]);
    const mk = sledMasked(r.nR, r.mass, r.floor);
    if (r.net != null && !mk.has('readRes')) c.push(['Resultant', NN(Math.abs(r.net))]); if (r.a != null && !mk.has('readA')) c.push(['Acceleration', fmt(r.a, 2) + ' m/s²']);
    c.push(['Top velocity', ms(r.top)], ['Distance', m2(r.dist)]); [1, 2, 3, 4].forEach(k => { if (r['v' + k] != null) c.push(['Velocity at ' + k + ' s', ms(r['v' + k])]); });
    if (r.finT != null) c.push(['Finish time', fmt(r.finT, 1) + ' s']);
    return c;
  }
  const c = [['Mass', r.mass + ' kg'], ['Floor', FLOORS[r.floor] ? FLOORS[r.floor].name : r.floor]];
  if (r.kind === 'pull') { c.push(['Left', NN(r.L)], ['Right', NN(r.R)]); }
  if (r.kind === 'launch') { c.push(['Launch velocity', ms(r.v0)]); if (r.brakeOn) c.push(['Brake', NN(r.brakeF)]); }
  if (r.fs && !r.moved) c.push(['Friction', NN(r.fs)]); else if (r.fk) c.push(['Friction', NN(r.fk)]);
  c.push(['Top velocity', ms(r.top)], ['Distance', m2(r.dist)]);
  if (r.bd != null) c.push(['After brake line', m2(r.bd)], ['Time to stop', fmt(r.bt, 1) + ' s']);
  return c;
}
const FLOORPH = { air: 'on the air floor', ice: 'on ice', smooth: 'on the smooth floor', concrete: 'on rough concrete' };
const KINDICON = { push: '👋', pull: '🪢', launch: '🚀', thrust: '🔥', drop: '🪂', snap: '📸' };
/* one run: this step's runs are open; earlier runs fold to a one-line summary (the student can open any of them) */
const RUNOPEN = {};
function runItem(r, open) {
  const tm = new Date(r.at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }), id = r.n + '-' + r.at;
  const isOpen = RUNOPEN[id] != null ? RUNOPEN[id] : open;
  return `<li><details class="run ${r.live ? 'live' : ''}" data-run="${id}" ${isOpen ? 'open' : ''}><summary class="rh"><b>${KINDICON[r.kind] || ''} ${r.kind === 'snap' ? 'Snapshot' : 'Run'} ${r.n}</b><span>${esc(r.label || '')}</span><span class="tm">${r.live ? 'running…' : tm}</span></summary><p>${runText(r)}</p>${r.kind === 'snap' && r.snap && r.snap.img ? `<button type="button" class="snapthumb" data-snapimg="${id}" aria-label="Expand the picture of this snapshot"><img src="${r.snap.img}" alt="The arena at this moment"><span>⤢ Tap to expand</span></button>` : ''}<div class="rchips">${runChips(r).map(([k, v]) => `<span><small>${k}</small>${v}</span>`).join('')}</div></details></li>`;
}
const sameStep = r => { const w = runWhere(); return r.sec === w.sec && r.step === w.step; };
function runsTabHTML() {
  const R = runsAll().slice().reverse(), here = R.filter(sameStep), rest = R.filter(r => !sameStep(r)), w = runWhere();
  if (!R.length) return `<p class="rempty">No runs yet. Press <b>Pull!</b>, give the crate a push or launch it, and every result is saved here with its numbers, so you can look back at it while you answer questions.</p>`;
  return `<p class="scaleNote">Every push, pull and launch is saved here, newest first. Runs from this step are open. Tap any older run to open it.</p>
    <h3 class="jh3">${w.step === 'challenge' ? 'This Challenge' : w.sec === 'explore' ? 'Explore' : 'This step'}</h3>${here.length ? `<ol class="runlist">${here.map(r => runItem(r, true)).join('')}</ol>` : '<p class="scaleNote">No runs in this step yet.</p>'}
    ${rest.length ? `<h3 class="jh3">Earlier runs</h3><ol class="runlist">${rest.map(r => runItem(r, false)).join('')}</ol>` : ''}
    ${clearBtnHTML()}`;
}
/* Clear all my runs: two taps. The "are you sure?" state is kept here, not on the button, because the Journal redraws several times a second while a run is going (Tom, 23 Nov 2026: during a run the second tap never worked). A run that is still going is kept. */
let CLEAR_ARM = 0, CLEAR_MSG = '';
function clearBtnHTML() {
  const armed = Date.now() - CLEAR_ARM < 6000, live = !!RUN;
  return `${CLEAR_MSG ? `<p class="scaleNote rpcleared">${CLEAR_MSG}</p>` : ''}<button type="button" class="mini" id="rpClear">${armed ? (live ? 'Tap again to clear every finished run' : 'Tap again to clear every run') : live ? 'Clear my finished runs' : 'Clear all my runs'}</button>${live && !armed ? '<span class="scaleNote"> (1 run underway: it will be kept)</span>' : ''}`;
}
function clearRuns() {
  if (Date.now() - CLEAR_ARM >= 6000) { CLEAR_ARM = Date.now(); CLEAR_MSG = ''; runsRefresh(true); setTimeout(() => runsRefresh(true), 6050); return; }
  CLEAR_ARM = 0; const keep = RUN ? runsAll().filter(r => r.n === RUN.n && r.at === RUN.at) : [];
  dbSet('runs', keep); CLEAR_MSG = keep.length ? 'Your finished runs are cleared. 1 run is underway, so it has been kept. Tap Clear again when it ends to clear it too.' : 'All your runs are cleared.';
  RUNDIRTY = 1; runsRefresh(true); setTimeout(() => { CLEAR_MSG = ''; }, 8000);
}
const runsFor = () => runsAll().filter(sameStep);
function runsRefresh(force) {
  if (!RUNDIRTY && !force) return; if (RUNHOLD && !force) return; RUNDIRTY = 0;
  if (typeof journalOpen === 'function' && journalOpen() && JTAB === 'runs') renderJournal();
  const b = $('#qCard .qrunsbtn .rc'); if (b) b.textContent = runsFor().length;
}
/* the big "See my runs" button in the Your turn box */
function qRunsHTML() {
  const n = runsFor().length;
  return `<button type="button" class="qrunsbtn" data-runs><span class="ic">📋</span><span><b>See my runs</b><small>Your results are saved in your Journal</small></span><span class="rc">${n}</span></button>`;
}
function initRuns() {
  document.addEventListener('click', e => {
    const sb = e.target.closest('.snapthumb');
    if (sb) { const r = runsAll().find(x => x.n + '-' + x.at === sb.dataset.snapimg); if (r && r.snap && r.snap.img) openModal(`<div class="modal snapbig"><h2>Snapshot ${r.n}</h2><img src="${r.snap.img}" alt="The arena at this moment"><p>${runText(r)}</p><div class="row"><button type="button" class="go" data-close>Close</button></div></div>`); return; }
    if (e.target.closest('#rpClear')) clearRuns();
  });
  /* hold off the live redraw while a finger or mouse button is down in the Journal, so a tap there is never lost to a redraw */
  document.addEventListener('pointerdown', e => { RUNHOLD = !!e.target.closest('.jpanel, #journal, .journal'); }, true);
  const release = () => { if (RUNHOLD) setTimeout(() => { RUNHOLD = false; }, 60); };
  document.addEventListener('pointerup', release, true); document.addEventListener('pointercancel', release, true);
  setInterval(() => runsRefresh(), 250);
}
