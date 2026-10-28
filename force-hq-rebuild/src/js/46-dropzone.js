/* ===== Chapter 5: the Drop Zone (S.scene = 'drop') =====
   Physics (must match tools/dropzone_model.py): air resistance D = c × airFactor × v², c set from each object's Earth terminal velocity,
   a canopy adds its own constant over 3 s, fixed 0.01 s steps (semi-implicit Euler: v += a·dt, then y -= v·dt).
   Fast-forward only runs more steps per frame, so the numbers never change.
   Two lanes (A and B) share the drop height; each has its own world, object, canopy and air setting.
   The run history is stored every 0.1 s (lane.hist) for the pause / step-back buttons, the snapshots and the v–t graph. */
const DZ_DT = 0.01, DZ_OPEN = 3.0, DZ_SC = 3, DZ_H = 500, DZ_REFY = 250, DZ_GY = 450, DZ_WARP = 8;   // the Drop Zone canvas is 900 × 500: the camera keeps the falling object at y = 250 until the ground comes into view
const DZ_WORLDS = {
  earth: { name: 'Earth', on: 'on Earth', g: 9.8, air: 1, txt: 'Air: normal', short: 'all the air' },
  moon: { name: 'Moon', on: 'on the Moon', g: 1.6, air: 0, txt: 'Air: none', short: 'no air' },
  mars: { name: 'Mars', on: 'on Mars', g: 3.7, air: 0.016, txt: 'Air: very thin (about 1/60 of Earth\'s)', short: 'very thin air' },
  venus: { name: 'Venus', on: 'on Venus', g: 8.9, air: 53, txt: 'Air: very thick (about 53 times Earth\'s)', short: 'very thick air' },
  titan: { name: 'Titan', on: 'on Titan', g: 1.4, air: 4.4, txt: 'Air: thick (about 4 times Earth\'s)', short: 'thick air' },
  jupiter: { name: 'Jupiter', on: 'on Jupiter', g: 24.8, air: 0.13, txt: 'Air: thin; no ground, so drops stop at a cloud-top platform', short: 'thin air' }
};
const DZ_OBJ = {
  feather: { name: 'Feather', noun: 'feather', m: 0.002, vt: 0.6, can: false },
  basketball: { name: 'Basketball', noun: 'basketball', m: 0.6, vt: 20, can: false },
  crate: { name: 'Crate', noun: 'crate', m: 40, vt: 38, can: true },
  para: { name: 'Skydiver', noun: 'skydiver', m: 75, vt: 54, can: true }
};
const DZ_CAN = { small: 9, medium: 6, large: 4.5 };   // the SKYDIVER's Earth terminal velocity with this canopy open (m/s)
const DZ_CANW = { small: 66, medium: 104, large: 150 };   // drawn width of the open canopy (px)
const dzMassTxt = o => `${fmt(DZ_OBJ[o].m, 3)} kg ${DZ_OBJ[o].noun}`;

const DZ = { lanes: [], two: false, edit: 0, height: 600, started: false, paused: false, ended: false, viewT: 0, n: 0, acc: 0, snapSeq: 0 };
function dzNewLane(id) {
  return { id, obj: 'crate', world: 'earth', removed: 0, canopy: 'none', autoOpen: null, run: null, t: 0, n: 0, y: 600, v: 0, a: 0, W: 0, D: 0, R: 0, fr: 0, opened: null, openY: null, openV: null, hist: [], top: 0, vt1: null, vt2: null, peakDec: 0, peakD: 0, landed: false, landV: null, landT: null, landReal: 0, started: false };
}
DZ.lanes = [dzNewLane('A'), dzNewLane('B')];
const dzActive = () => DZ.two ? DZ.lanes : [DZ.lanes[0]];
const dzWorld = L => DZ_WORLDS[L.world];
const dzFactor = L => dzWorld(L).air * (1 - L.removed / 100);
function dzCoef(L) {
  const o = DZ_OBJ[L.obj], c0 = o.m * G / (o.vt * o.vt), has = L.canopy !== 'none' && o.can;
  return { c0, c1: has ? c0 + 75 * G / (DZ_CAN[L.canopy] * DZ_CAN[L.canopy]) - 75 * G / (54 * 54) : c0, has };
}
const dzFrac = L => L.opened == null ? 0 : Math.min(1, (L.t - L.opened) / DZ_OPEN);
/* the forces at this moment (at the lane's t and v), stored on the lane */
function dzCalc(L) {
  const o = DZ_OBJ[L.obj], k = dzCoef(L), fr = dzFrac(L), c = k.c0 + (k.c1 - k.c0) * fr;
  L.fr = fr; L.W = o.m * dzWorld(L).g; L.D = c * dzFactor(L) * L.v * Math.abs(L.v); L.R = L.W - L.D; L.a = L.R / o.m; return L;
}
/* one fixed step of 0.01 s */
function dzStep(L) {
  const k = dzCoef(L);
  if (k.has && L.opened == null && L.autoOpen != null && L.y <= L.autoOpen) dzOpenNow(L);
  dzCalc(L);
  if (L.n % 10 === 0) L.hist.push({ n: L.n, t: L.t, y: L.y, v: L.v, a: L.a, W: L.W, D: L.D, R: L.R, fr: L.fr, op: L.opened });
  L.peakDec = Math.max(L.peakDec, -L.a); L.peakD = Math.max(L.peakD, L.D);
  if (L.t > 0.2 && Math.abs(L.R) <= 0.01 * L.W) { if (L.opened == null) L.vt1 = Math.max(L.vt1 || 0, L.v); else if (L.fr >= 1) L.vt2 = L.v; }   // balanced: terminal velocity
  L.v += L.a * DZ_DT; L.y -= L.v * DZ_DT; L.t += DZ_DT; L.n++; if (L.v > L.top) L.top = L.v;
  if (L.y <= 0) {
    L.landed = true; L.landV = L.v; L.landT = L.t; L.landReal = performance.now(); dzCalc(L);
    L.hist.push({ n: L.n, t: L.t, y: 0, v: L.v, a: L.a, W: L.W, D: L.D, R: L.R, fr: L.fr, op: L.opened, land: true });
  }
}
function dzOpenNow(L) {
  if (L.opened != null || L.landed) return false; const k = dzCoef(L); if (!k.has) return false;
  L.opened = L.t; L.openY = Math.max(0, L.y); L.openV = L.v; return true;
}
function dzLaneReset(L, H) {
  Object.assign(L, { t: 0, n: 0, y: H, v: 0, a: 0, W: 0, D: 0, R: 0, fr: 0, opened: null, openY: null, openV: null, hist: [], top: 0, vt1: null, vt2: null, peakDec: 0, peakD: 0, landed: false, landV: null, landT: null, landReal: 0, started: false, run: null });
  dzCalc(L);
}
/* headless run to the ground, used by the tests and by the challenge checks: returns what tools/dropzone_model.py's run() / run_h() return */
function dzSimulate(cfg) {
  const L = dzNewLane('T'); Object.assign(L, { obj: cfg.obj, world: cfg.world || 'earth', removed: cfg.removed || 0, canopy: cfg.canopy || 'none', autoOpen: cfg.openH == null ? null : cfg.openH });
  dzLaneReset(L, cfg.height); L.started = true; const snaps = [], pts = [], want = (cfg.snaps || []).slice(); let guard = 0, nextP = 0;
  while (!L.landed && guard++ < 600000) {
    if (cfg.openAt != null && L.opened == null && L.t >= cfg.openAt - 1e-9) dzOpenNow(L);
    if (want.length && L.t >= want[0] - 1e-9) { dzCalc(L); snaps.push({ t: L.t, y: L.y, v: L.v, a: L.a, W: L.W, D: L.D, R: L.R }); want.shift(); }
    if (cfg.every && L.t >= nextP - 1e-9) { pts.push([Math.round(L.t * 1000) / 1000, L.v]); nextP += cfg.every; }
    dzStep(L);
  }
  return { pts, top: L.top, land: L.landV, time: L.landT, peakDec: L.peakDec, peakD: L.peakD, peakG: L.peakDec / G, vt1: L.vt1, vt2: L.vt2, snaps };
}
/* the terminal velocity the model predicts (same formula as tools/dropzone_model.py vterm()) */
function dzVterm(obj, world, removed, canopy) {
  const L = dzNewLane('T'); Object.assign(L, { obj, world, removed: removed || 0, canopy: canopy || 'none' }); const k = dzCoef(L), f = dzFactor(L); if (f === 0) return Infinity;
  return Math.sqrt(DZ_OBJ[obj].m * dzWorld(L).g / (k.c1 * f));
}

/* the same shape as forces() in 10-engine.js, so the shared code (runs, step checks) has something to read in the Drop Zone */
function dropForces() { const L = DZ.lanes[0]; return { L: 0, R: 0, shove: 0, app: 0, fr: 0, brk: 0, net: L.R, W: L.W, N: 0, m: DZ_OBJ[L.obj].m, a: L.a, fmax: 0, fk: 0 }; }

/* ---- what is on screen: the live state, or the stored state at the paused time ---- */
const dzLatest = () => Math.max(0, ...dzActive().map(L => L.t));
function dzAt(L) {
  if (!DZ.paused || DZ.viewT >= L.t - 1e-9) return dzCalc(Object.assign({}, L, { hist: L.hist }));
  const e = L.hist[Math.round(DZ.viewT * 10)]; if (!e) return dzCalc(Object.assign({}, L));
  return Object.assign({}, L, { t: e.t, y: e.y, v: e.v, a: e.a, W: e.W, D: e.D, R: e.R, fr: e.fr, opened: e.op, landed: !!e.land });
}
const dzViewT = () => DZ.paused ? Math.min(DZ.viewT, dzLatest()) : dzLatest();

/* ---- start, pause, step, rewind ---- */
function dzSyncRunBtn() { /* the shared Pull! button is not used in the Drop Zone */ }
function dzReset() {
  dzFinishRuns('reset');
  DZ.started = false; DZ.paused = false; DZ.ended = false; DZ.viewT = 0; DZ.n = 0; DZ.acc = 0; S.running = false; S.t = 0; S.msg = '';
  DZ.lanes.forEach(L => dzLaneReset(L, DZ.height));
  S.flags.dropped = false; S.flags.landed = false; S.flags.paused = false; S.flags.stepped = false; S.flags.snapped = false; S.flags.opened = false;
}
function dzDrop() {
  if (DZ.started && !DZ.ended) return false;
  if (DZ.started) dzReset();
  DZ.started = true; DZ.paused = false; DZ.ended = false; DZ.n = 0; DZ.acc = 0;
  dzActive().forEach(L => { dzLaneReset(L, DZ.height); L.started = true; dzRunStart(L); });
  DZ.lanes.filter(L => !dzActive().includes(L)).forEach(L => dzLaneReset(L, DZ.height));
  S.running = true; S.flags.dropped = true; S.flags.ran = true; S.flags.compare = DZ.two; return true;
}
function dzPause() {
  if (!DZ.started || DZ.ended) return false;
  if (DZ.paused) return dzPlay();
  DZ.paused = true; DZ.viewT = Math.round(dzLatest() * 10) / 10; S.running = false; S.flags.paused = true; return true;
}
/* go back to the stored state at time T (the run carries on from there) */
function dzRewind(T) {
  dzActive().forEach(L => {
    if (T >= L.t - 1e-9) return;
    const idx = Math.round(T * 10), e = L.hist[idx]; if (!e) return;
    L.n = e.n; L.t = e.t; L.y = e.y; L.v = e.v; L.opened = e.op; L.hist.length = idx;
    L.landed = false; L.landV = null; L.landT = null;
    L.top = Math.max(e.v, ...L.hist.map(h => h.v)); L.peakDec = Math.max(0, ...L.hist.map(h => -h.a)); L.peakD = Math.max(0, ...L.hist.map(h => h.D));
    L.vt1 = null; L.vt2 = null; L.hist.concat([e]).forEach(h => { if (h.t > 0.2 && Math.abs(h.R) <= 0.01 * h.W) { if (h.op == null) L.vt1 = Math.max(L.vt1 || 0, h.v); else if (h.fr >= 1) L.vt2 = h.v; } });
    if (L.opened != null) { L.openY = L.openY; } else { L.openY = null; L.openV = null; }
    if (L.run) { L.run.live = true; L.run.out = 'running'; L.run.landV = null; L.run.time = null; dzRunSync(L); }
  });
  DZ.n = Math.round(T * 100); DZ.ended = false;
}
function dzPlay() {
  if (!DZ.started || DZ.ended || !DZ.paused) return false;
  if (DZ.viewT < dzLatest() - 1e-9) dzRewind(DZ.viewT);
  DZ.paused = false; DZ.acc = 0; S.running = true; return true;
}
function dzStepView(dir) {
  if (!DZ.paused) return false;
  DZ.viewT = clamp(Math.round((DZ.viewT + dir * 0.5) * 10) / 10, 0, Math.round(dzLatest() * 10) / 10); S.flags.stepped = true; return true;
}
/* Open canopy!: while paused the run first carries on from the stored time, then the canopy opens at that moment */
function dzOpenAll() {
  if (!DZ.started || DZ.ended) return false;
  if (DZ.paused && DZ.viewT < dzLatest() - 1e-9) dzRewind(DZ.viewT);
  let any = false; dzActive().forEach(L => { if (dzOpenNow(L)) { any = true; dzRunSync(L); } });
  if (any) S.flags.opened = true; return any;
}
const dzCanOpen = () => DZ.started && !DZ.ended && dzActive().some(L => !L.landed && L.opened == null && dzCoef(L).has);
/* advance the simulation: called every frame while a run is going */
function dzUpdate(dt) {
  DZ.acc += dt * S.warp; let guard = 0;
  while (DZ.acc >= DZ_DT - 1e-12 && guard++ < 800) {
    DZ.acc -= DZ_DT; DZ.n++;
    const live = dzActive().filter(L => !L.landed); live.forEach(dzStep);
    if (!dzActive().some(L => !L.landed)) { dzEnd(); break; }
  }
  dzActive().forEach(dzRunSync);
  const sig = (dzCanOpen() ? 1 : 0) + '' + (DZ.ended ? 1 : 0); if (sig !== DZ.sig) { DZ.sig = sig; labChanged(); }   // keep the buttons in step (landing, canopy opened by itself)
}
function dzEnd() {
  DZ.ended = true; S.running = false; S.t = dzLatest(); S.flags.landed = true;
  dzActive().forEach(L => { dzRunSync(L); });
  dzFinishRuns('landed');
}

/* ---- runs: one run per lane per drop, saved with the others in DB.runs ---- */
function dzDownsample(L) { const n = L.hist.length, st = Math.max(1, Math.ceil(n / 150)); const out = []; for (let i = 0; i < n; i += st) out.push([Math.round(L.hist[i].t * 10) / 10, Math.round(L.hist[i].v * 100) / 100]); const l = L.hist[n - 1]; if (l && out.length && out[out.length - 1][0] !== Math.round(l.t * 10) / 10) out.push([Math.round(l.t * 10) / 10, Math.round(l.v * 100) / 100]); return out; }
function dzRunStart(L) {
  const R = runsAll(); RUNSEQ = Math.max(RUNSEQ, R.reduce((a, r) => Math.max(a, r.n || 0), 0)) + 1;
  const r = Object.assign({ n: RUNSEQ, kind: 'drop', scene: 'drop', at: Date.now(), live: true, lane: L.id, two: DZ.two, obj: L.obj, world: L.world, air: L.removed, height: DZ.height, canopy: L.canopy, autoOpen: L.autoOpen, openT: null, openH: null, openV: null, top: 0, vt1: null, vt2: null, landV: null, time: null, out: 'running', peakG: 0, h: [] }, runWhere());
  L.run = r; R.push(r); if (R.length > 200) R.splice(0, R.length - 200); dbSet('runs', R); RUNDIRTY = 1;
}
function dzRunSync(L) {
  const r = L.run; if (!r) return;
  r.top = L.top; r.vt1 = L.vt1; r.vt2 = L.vt2; r.openT = L.opened; r.openH = L.openY; r.openV = L.openV; r.peakG = L.peakDec / G; r.t = L.t;
  if (L.landed) { r.landV = L.landV; r.time = L.landT; }
  RUNDIRTY = 1;
}
function dzFinishRuns(why) {
  DZ.lanes.forEach(L => {
    const r = L.run; if (!r || !r.live) return;
    dzRunSync(L); r.live = false; r.out = L.landed ? 'landed' : 'reset'; r.h = dzDownsample(L); L.run = null;
  });
  const R = runsAll(); dbSet('runs', R); RUNDIRTY = 1;
}

/* ---- snapshots: saved in DB.dz.snaps and shown in the Journal's Runs tab ---- */
const dzCanopyState = v => v.opened == null ? 'closed' : v.fr >= 1 ? 'open' : 'opening';
const dzMakeSnap = (L, T, R) => { const v = dzAt(L); return { id: ++DZ.snapSeq + '-' + Date.now(), run: L.run ? L.run.n : (R.length ? R[R.length - 1].n : 0), lane: L.id, obj: L.obj, world: L.world, air: L.removed, canopy: L.canopy, cstate: dzCanopyState(v), t: Math.round(T * 10) / 10, y: Math.max(0, v.y), v: v.v, a: v.a, W: v.W, D: v.D, R: v.R, height: DZ.height }; };
/* save the paused moment as a snapshot (one per lane, or just the lanes in `only`); returns the snapshots made */
function dzSnapNow(only) {
  if (!DZ.started) return false;
  const T = dzViewT(), snaps = dbGet('dz.snaps', []), R = runsAll(), made = [];
  dzActive().filter(L => !only || only.includes(L)).forEach(L => {
    const s = dzMakeSnap(L, T, R); made.push(s);
    snaps.push(s); if (snaps.length > 50) snaps.splice(0, snaps.length - 50);
    RUNSEQ = Math.max(RUNSEQ, R.reduce((a, r) => Math.max(a, r.n || 0), 0)) + 1;
    R.push(Object.assign({ n: RUNSEQ, kind: 'snap', scene: 'drop', at: Date.now(), live: false, out: 'snap', lane: L.id, two: DZ.two, snap: s }, runWhere()));
  });
  if (R.length > 200) R.splice(0, R.length - 200);
  dbSet('dz.snaps', snaps); dbSet('runs', R); RUNDIRTY = 1; S.flags.snapped = true; return made;
}
/* the snapshot of this lane at the paused time: the one already saved, or a new one (a question's "Use this moment" button) */
function dzSnapHere(L) {
  const T = Math.round(dzViewT() * 10) / 10, have = dbGet('dz.snaps', []).filter(s => s.lane === L.id && s.t === T && s.obj === L.obj && s.world === L.world && s.run === (L.run ? L.run.n : s.run));
  return have.length ? have[have.length - 1] : dzSnapNow([L])[0];
}

/* ---- helpers for the steps and questions: the student's own saved runs and snapshots ---- */
function dzMatch(r, f) { return Object.keys(f || {}).every(k => typeof f[k] === 'function' ? f[k](r[k], r) : r[k] === f[k]); }
const dzRun = (f, live) => { const R = runsFor().filter(r => r.scene === 'drop' && r.kind === 'drop' && (live || r.out === 'landed') && dzMatch(r, f)); return R.length ? R[R.length - 1] : null; };
const dzTop = f => { const r = dzRun(f); return r ? r.top : null; };
const dzLand = f => { const r = dzRun(f); return r ? r.landV : null; };
const dzTime = f => { const r = dzRun(f); return r ? r.time : null; };
const dzSnap = (f, test) => { const S2 = dbGet('dz.snaps', []).filter(s => dzMatch(s, f) && (!test || test(s))); return S2.length ? S2[S2.length - 1] : null; };
/* set up the Drop Zone from a step: dropSetup({ height, two, a:{obj,world,removed,canopy,autoOpen}, b:{...} }) */
function dropSetup(o) {
  o = o || {}; clearCh2(); S.scene = 'drop'; S.left = []; S.right = []; S.floor = 'air'; S.warp = 1;
  DZ.height = o.height || 600; DZ.two = !!o.two; DZ.edit = 0; DZ.lanes[1].touched = !!o.b;
  [o.a || {}, o.b || o.a || {}].forEach((c, i) => Object.assign(DZ.lanes[i], { obj: 'crate', world: 'earth', removed: 0, canopy: 'none', autoOpen: null }, c));
}
/* Readouts the student has to work out stay hidden until the question that asks for them has been answered: a step lists mask: [{ q, keys, when(lane) }]. Keys: fbdR, fbdW, readV, readA. */
function dzMasked() {
  const out = new Set(); if (typeof CH === 'undefined' || !CH || LAB.mode !== 'guided') return out;
  const st = CHDATA[CH.id] && CHDATA[CH.id].steps[GI]; if (!st || !st.mask) return out;
  st.mask.forEach(M => { if (dzActive().some(L => M.when(L, DZ))) { const q = dbGet(stepKey(CH.id, GI) + '.' + M.q, null); if (!(q && q.done)) M.keys.forEach(k => out.add(k)); } });
  return out;
}

/* ---- the sentences and chips in the Journal ---- */
const dzAirPhrase = r => { const w = DZ_WORLDS[r.world]; return w.air === 0 ? 'no air' : r.air >= 100 ? 'all the air removed' : r.air > 0 ? `${fmt(r.air, 0)}% of the air removed` : r.world === 'earth' ? 'all the air' : w.short; };
const dz1 = v => (Math.round(v * 10) / 10).toFixed(1);
const dzTimeTxt = t => fmt(t, t >= 100 ? 0 : 1) + ' s';
function dropText(r) {
  const mk = dzMasked(), noV = mk.has('readV');
  if (r.kind === 'snap') {
    const s = r.snap, o = DZ_OBJ[s.obj], f = [];
    let t = `${r.two ? 'Lane ' + r.lane + ': ' : ''}At ${fmt(s.t, 1)} s the ${o.noun} was ${fmt(s.y, 0)} m up`;
    t += noV ? '.' : ` and ${s.v >= 0 ? 'falling' : 'rising'} at ${dz1(Math.abs(s.v))} m/s.`;
    if (!mk.has('fbdW')) f.push('weight ' + dzN(s.W)); f.push('air resistance ' + dzN(s.D));
    const fs = f.join(', '); return t + ' ' + fs.charAt(0).toUpperCase() + fs.slice(1) + '.';
  }
  const o = DZ_OBJ[r.obj], w = DZ_WORLDS[r.world], live = r.live && r.out === 'running', lane = r.two ? `Lane ${r.lane}: ` : '';
  const head = `${lane}You dropped the ${dzMassTxt(r.obj)} from ${fmt(r.height, 0)} m ${w.on} (${dzAirPhrase(r)}).`;
  const open = r.openH != null ? ` You opened the ${r.canopy} canopy at ${fmt(r.openH, 0)} m.` : r.canopy !== 'none' && !live ? ' You did not open the canopy.' : '';
  if (live) return head + open + ' It is falling…';
  if (r.out !== 'landed') return head + open + ` The run was reset after ${fmt(r.t || 0, 1)} s.`;
  const tm = dzTimeTxt(r.time);
  if (noV) return head + open + ` It landed after ${tm}.`;
  let mid;
  if (r.openH != null) mid = r.vt2 != null ? ` The ${o.noun} slowed to ${dz1(r.vt2)} m/s and landed after ${tm}.` : ` The ${o.noun} landed at ${dz1(r.landV)} m/s after ${tm}.`;
  else mid = r.vt1 != null ? ` It sped up to a terminal velocity of ${dz1(r.vt1)} m/s and landed after ${tm}.` : ` It sped up to ${dz1(r.top)} m/s and landed at ${dz1(r.landV)} m/s after ${tm}.`;
  return head + open + mid;
}
function dropChips(r) {
  const mk = dzMasked();
  if (r.kind === 'snap') { const s = r.snap, c = [['Time', fmt(s.t, 1) + ' s'], ['Height', fmt(s.y, 0) + ' m']]; if (!mk.has('readV')) c.push(['Velocity', dz1(Math.abs(s.v)) + ' m/s']); if (!mk.has('fbdW')) c.push(['Weight', dzN(s.W)]); c.push(['Air resistance', dzN(s.D)]); if (!mk.has('fbdR')) c.push(['Resultant', dzN(Math.abs(s.R)) + (s.R >= 0 ? ' ↓' : ' ↑')]); return c; }
  const c = [['World', DZ_WORLDS[r.world].name], ['Object', DZ_OBJ[r.obj].name], ['Height', fmt(r.height, 0) + ' m'], ['Air removed', fmt(r.air, 0) + '%']];
  if (r.canopy !== 'none') c.push(['Canopy', r.canopy + (r.openH != null ? ', opened at ' + fmt(r.openH, 0) + ' m' : ', not opened')]);
  if (!mk.has('readV')) { c.push(['Top velocity', dz1(r.top) + ' m/s']); if (r.out === 'landed') c.push(['Landing velocity', dz1(r.landV) + ' m/s']); }
  if (r.out === 'landed') c.push(['Time', dzTimeTxt(r.time)]);
  return c;
}
function dzN(v) { v = Math.abs(v); return (v < 1 ? v.toFixed(3) : v < 10 ? fmt(v, 2) : fmt(v, 0)) + ' N'; }

/* ================= controls (the kit panels, the buttons under the arena) ================= */
const dzLocked = () => DZ.started && !DZ.ended;
const dzEditLane = () => DZ.lanes[DZ.two ? DZ.edit : 0];
function dzCfg(fn) {
  if (dzLocked()) { toast('Press Reset first to change the set-up.', ''); return false; }
  if (DZ.two && DZ.edit === 1) DZ.lanes[1].touched = true;
  fn(); dzReset(); labChanged(); return true;
}
function dzRenderControls() {
  const E = dzEditLane(), lock = dzLocked(), o = DZ_OBJ[E.obj], w = dzWorld(E);
  const seg = (id, items, cur, attr, dis) => { const el = $(id); if (!el) return; const html = items.map(([k, l, sm, d]) => `<button type="button" data-${attr}="${k}" aria-pressed="${cur === k}"${lock || d ? ' disabled' : ''}>${l}${sm ? `<small>${sm}</small>` : ''}</button>`).join(''); if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; } };
  seg('#dzObjs', Object.entries(DZ_OBJ).map(([k, v]) => [k, v.name, fmt(v.m, 3) + ' kg']), E.obj, 'dzobj');
  seg('#dzWorlds', Object.entries(DZ_WORLDS).map(([k, v]) => [k, v.name, 'g ' + v.g]), E.world, 'dzworld');
  seg('#dzCans', [['none', 'None'], ['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']].map(([k, l]) => [k, l, '', k !== 'none' && !o.can]), E.canopy, 'dzcan');
  const wi = $('#dzWorldInfo'); if (wi) wi.textContent = `g = ${w.g} N/kg · ${w.txt}`;
  const set = (id, v) => { const e = $(id); if (e && document.activeElement !== e) e.value = v; if (e) e.disabled = lock; };
  set('#dzAir', E.removed); set('#dzAirNum', E.removed); set('#dzH', DZ.height); set('#dzHNum', DZ.height); set('#dzOpenNum', E.autoOpen == null ? '' : E.autoOpen);
  const on = $('#dzOpenNum'); if (on) on.disabled = lock || !o.can || E.canopy === 'none';
  const two = $('#dzTwo'); if (two) { two.checked = DZ.two; two.disabled = lock; }
  const ed = $('#dzEdit'); if (ed) { ed.hidden = !DZ.two; ed.innerHTML = DZ.lanes.map((L, i) => `<button type="button" data-dzedit="${i}" aria-pressed="${DZ.edit === i}">Lane ${L.id}</button>`).join(''); }
  const el = $('#dzEditNote'); if (el) el.textContent = DZ.two ? `The controls change lane ${E.id}.` : '';
  const b = (id, f) => { const e = $(id); if (e) f(e); };
  b('#dzDrop', e => { e.disabled = lock; e.textContent = DZ.ended ? 'Drop again!' : 'Drop!'; });
  b('#dzPause', e => { e.disabled = !lock; e.textContent = DZ.paused ? '▶ Play' : '⏸ Pause'; e.classList.toggle('pause', !DZ.paused && lock); e.setAttribute('aria-pressed', String(DZ.paused)); });
  b('#dzBack', e => e.disabled = !DZ.paused || DZ.viewT <= 0); b('#dzFwd', e => e.disabled = !DZ.paused || DZ.viewT >= Math.round(dzLatest() * 10) / 10 - 1e-9);
  b('#dzSnap', e => e.disabled = !DZ.started); b('#dzOpen', e => e.disabled = !dzCanOpen());
}
function initDrop() {
  const on = (id, ev, fn) => { const e = $(id); if (e) e.addEventListener(ev, fn); };
  on('#dzDrop', 'click', () => { if (dzDrop()) labChanged(); });
  on('#dzPause', 'click', () => { dzPause(); labChanged(); });
  on('#dzBack', 'click', () => { dzStepView(-1); labChanged(); }); on('#dzFwd', 'click', () => { dzStepView(1); labChanged(); });
  on('#dzSnap', 'click', () => { if (dzSnapNow()) { S.flags.snapBtn = true; toast('📸 Snapshot saved in your Journal (Runs tab).', 'good'); labChanged(); } });
  on('#dzOpen', 'click', () => { dzOpenAll(); labChanged(); });
  document.addEventListener('click', e => {
    if (S.scene !== 'drop') return;
    const ob = e.target.closest('[data-dzobj]'); if (ob) { dzCfg(() => { const E = dzEditLane(); E.obj = ob.dataset.dzobj; if (!DZ_OBJ[E.obj].can) { E.canopy = 'none'; E.autoOpen = null; } }); return; }
    const wb = e.target.closest('[data-dzworld]'); if (wb) { dzCfg(() => { dzEditLane().world = wb.dataset.dzworld; }); return; }
    const cb = e.target.closest('[data-dzcan]'); if (cb) { dzCfg(() => { const E = dzEditLane(); E.canopy = cb.dataset.dzcan; if (E.canopy === 'none') E.autoOpen = null; }); return; }
    const eb = e.target.closest('[data-dzedit]'); if (eb) { DZ.edit = +eb.dataset.dzedit; labChanged(); return; }
  });
  on('#dzTwo', 'change', e => dzCfg(() => { DZ.two = e.target.checked; DZ.edit = 0; if (DZ.two && !DZ.lanes[1].touched) { const A = DZ.lanes[0]; Object.assign(DZ.lanes[1], { obj: A.obj, world: A.world, removed: A.removed, canopy: A.canopy, autoOpen: A.autoOpen }); } }));
  const typed = (id, lo, hi, set) => { const inp = $(id); if (!inp) return; const go = () => { const v = parseNum(inp.value); if (isNaN(v)) { labChanged(); return; } dzCfg(() => set(clamp(Math.round(v), lo, hi))); }; inp.addEventListener('change', go); inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); inp.blur(); } }); };
  on('#dzAir', 'input', e => dzCfg(() => { dzEditLane().removed = +e.target.value; })); typed('#dzAirNum', 0, 100, v => { dzEditLane().removed = v; });
  on('#dzH', 'input', e => dzCfg(() => { DZ.height = +e.target.value; })); typed('#dzHNum', 10, 3000, v => { DZ.height = v; });
  const oh = $('#dzOpenNum'); if (oh) { const go = () => { const raw = oh.value.trim(); dzCfg(() => { const E = dzEditLane(); if (raw === '') E.autoOpen = null; else { const v = parseNum(raw); E.autoOpen = isNaN(v) ? null : clamp(Math.round(v), 0, 3000); } }); }; oh.addEventListener('change', go); oh.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); oh.blur(); } }); }
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || S.scene !== 'drop' || !$('#lab').offsetParent || !LAB.show.has('dpause')) return;
    const t = e.target; if (t && t.closest && t.closest('input, select, textarea, button, [contenteditable], summary')) return;
    e.preventDefault(); if (DZ.started && !DZ.ended) { dzPause(); labChanged(); }
  });
}

/* ---- Explore: the Drop Zone with every control ---- */
const DZ_EXPLORE_TRY = [
  ['Drop the crate from 600 m on Earth and watch until the air resistance arrow is as long as the weight arrow.', () => DZ.lanes.some(L => L.obj === 'crate' && L.world === 'earth' && L.vt1 != null)],
  ['Drop a feather on the Moon, then drop it on Earth. Compare the two velocity–time graphs.', () => dzRun({ obj: 'feather', world: 'moon' }) && dzRun({ obj: 'feather', world: 'earth' })],
  ['Open a canopy on the skydiver and find out what the new terminal velocity is.', () => !!dzRun({ obj: 'para', canopy: c => c !== 'none', vt2: v => v != null })]
];
function openExploreDrop() {
  show('vExplore'); placeLab($('#exploreHost')); exploreHead('Explore · Drop Zone', 'Drop Zone sandbox');
  dropSetup({ height: 600, a: { obj: 'crate', world: 'earth' } }); S.flags = newFlags(); resetSim();
  LAB.mode = 'explore'; LAB.show = new Set(['drop', 'dobj', 'dworld', 'dair', 'dheight', 'dcanopy', 'dopenh', 'dlanes', 'dpause', 'dvt', 'dft', 'dfbd', 'readH', 'readV', 'readA', 'readT', 'warp']); LAB.sides = []; LAB.pullers = []; LAB.floors = null; LAB.idle = null; LAB.showVert = true; LAB.showRes = true;
  applyPanels(); $('#qCard').hidden = true; hideCards(); closeDesk();
  const done = new Set(dbGet('tryDoneDz', []));
  const draw = () => { $('#rail').innerHTML = `${exploreSwitch('drop')}<span class="lbl">Explore · Drop Zone</span><h2>Test your own ideas</h2><p class="gl">Every control, readout and diagram is switched on. Tap any <b>ⓘ</b> to find out how to read a panel.</p><div class="lbl">Try this</div><ul class="tasks gl">${DZ_EXPLORE_TRY.map((t, i) => `<li class="${done.has(i) ? 'ok' : ''}"><span class="box">✓</span><span>${t[0]}</span></li>`).join('')}</ul><p class="scaleNote">Change one thing at a time and keep everything else the same. That way you know what caused the difference.</p><button type="button" class="jbtn" data-journal><span>📓 My Journal</span></button><button type="button" class="ghost" data-act="home">← Home</button>`; };
  draw();
  LAB.onChange = null; LAB.tick = () => { DZ_EXPLORE_TRY.forEach((t, i) => { if (!done.has(i) && t[1]()) { done.add(i); dbSet('tryDoneDz', [...done]); addEvidence('challenge', 'Explore: ' + t[0]); toast('Nice experiment! That one is ticked off.', 'good'); draw(); } }); };
}
