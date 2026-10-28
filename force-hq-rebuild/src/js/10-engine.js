/* ===== Arena physics (Main Arena tug-of-war; built to extend to the other arenas) ===== */
const PUL = {
  kid: { n: 60, label: 'Kid', w: 36 }, dog: { n: 70, label: 'Dog', w: 54 }, adult: { n: 130, label: 'Adult', w: 36 },
  strong: { n: 200, label: 'Strong adult', w: 38 }, pony: { n: 260, label: 'Pony', w: 80 }, horse: { n: 650, label: 'Horse', w: 104 },
  husky: { n: 90, label: 'Husky', w: 56 }
};
const FLOORS = {
  air: { name: 'Air floor', mu: 0, mus: 0, note: 'μ = 0' }, ice: { name: 'Ice', mu: 0.03, mus: 0.05, note: 'μ = 0.03' },
  smooth: { name: 'Smooth floor', mu: 0.1, mus: 0.15, note: 'μ = 0.1' }, concrete: { name: 'Rough concrete', mu: 0.4, mus: 0.5, note: 'μ = 0.4' },
  /* Chapter 3, Snow Arena. 'snow0' is packed snow with the friction switched off, so the husky pull is the whole resultant. */
  snow0: { name: 'Friction off', mu: 0, mus: 0, note: 'μ = 0 (switched off)' }, snow: { name: 'Packed snow', mu: 0.05, mus: 0.07, note: 'μ = 0.05' },
  powder: { name: 'Fresh powder', mu: 0.15, mus: 0.18, note: 'μ = 0.15' }
};
const FLOOR_MAIN = ['air', 'ice', 'smooth', 'concrete'];   // the Main Arena floors (Explore, Chapter 1 build missions)
const SLED_X0 = -9, SLED_FIN = 6;                           // the Snow Arena: start line and finish line, in metres
/* Chapter 4, the Space Dome: the pod, the astronaut, the dock and the tether (positions in metres). The push builds up, holds and eases off: it counts as 1 s at full strength, so a pod of mass m gains F / m m/s. */
const SP_PUSH_T = 1.2, SP_THR_F = 50, DOCK_X = 4.5, POD_X0 = -3, AST_X0 = -4.55, TETHER_X = -9.3, SP_WARP = 8;
const pprof = t => { if (t < 0 || t >= SP_PUSH_T) return 0; const r = 0.2; if (t < r) return sstep(t / r); if (t > SP_PUSH_T - r) return sstep((SP_PUSH_T - t) / r); return 1; };
const PXM = 39, CX = 450, GROUND = 300, ROPEY = 262, CW = 88, CRH = 64, LIM = 9, MAXT = 6;
const PULL_RAMP = 0.4, SHOVE_T = 0.6, SHOVE_F = 250;
const S = {
  left: [], right: [], mass: 50, floor: 'concrete', x: 0, v: 0, a: 0, t: 0, pullT: 0, shoveT: -1, lastShoveT: null,
  running: false, hist: [], msg: '', flags: null, frozen: false,
  /* Chapter 2: a launcher and a brake. The crate starts at x0, Launch sets it moving at v0, and once it
     passes the brake line (brakeX) a brake pushes against the motion with brakeF newtons until it stops. */
  x0: 0, v0: 2, brakeX: null, brakeF: 40, brakeFrom: null, brakeT: null,
  /* Chapter 3: scene = 'sled' swaps the crate and the two teams for the husky sled in the Snow Arena */
  scene: null,
  /* Chapter 4: scene = 'space'. The pod is the "crate" (S.x, S.v, S.mass); the astronaut has a mass, a position and a speed of their own. */
  astro: 100, pushF: 100, ax: AST_X0, av: 0, avPeak: 0, thrT: -1, thrDir: 0, warp: 1, pushEndT: null, pushDone: null, lastPush: 0, lastThr: 0, lastKind: null, dockV: null, bursts: []
};
const newFlags = () => ({ ran: false, shoved: false, moved: false, stuck: false, pulled: false, launched: false, stopped: false });
S.flags = newFlags();
const tot = a => a.reduce((s, p) => s + PUL[p].n, 0);

/* the Space Dome: no friction. The astronaut pushes the pod (push) and the pod pushes the astronaut back with exactly the same force (react, the other way). Thrusters act on the pod only. */
function spaceForces() {
  const m = S.mass, W = m * G, push = S.pushF * pprof(S.shoveT), thr = S.thrDir * SP_THR_F * pprof(S.thrT), app = push + thr;
  return { L: 0, R: 0, shove: push, thr, react: -push, app, fr: 0, brk: 0, net: app, W, N: W, m, a: app / m, fmax: 0, fk: 0, am: S.astro };
}
function forces() {
  if (S.scene === 'drop') return dropForces();
  if (S.scene === 'space') return spaceForces();
  const u = S.running ? Math.min(1, S.pullT / PULL_RAMP) : 1, k = sstep(u), m = S.mass, fl = FLOORS[S.floor];
  const L = tot(S.left) * k, R = tot(S.right) * k, W = m * G, N = W, fs = fl.mus * W, fk = fl.mu * W;
  const shove = S.shoveT >= 0 && S.shoveT < SHOVE_T ? SHOVE_F * Math.pow(Math.sin(Math.PI * S.shoveT / SHOVE_T), 2) : 0;
  const app = R - L + shove;
  let fr;
  if (Math.abs(S.v) < 1e-6) fr = Math.abs(app) <= fs ? -app : -Math.sign(app) * fk;
  else fr = -Math.sign(S.v) * fk;
  if (Math.abs(fr) < 1e-9) fr = 0;
  const brk = S.brakeFrom != null && Math.abs(S.v) > 1e-6 ? -Math.sign(S.v) * S.brakeF : 0;   // brakes only act while moving
  const net = app + fr + brk;
  return { L, R, shove, app, fr, brk, net, W, N, m, a: net / m, fmax: fs, fk };
}
/* forces for a still, set-up arena (no ramp) — used by guided checks and FBD comparisons */
function staticForces() { const keep = S.running; S.running = false; const f = forces(); S.running = keep; return f; }

function stepSpace(dt) {
  const f = forces(); S.a = f.a;
  const v2 = S.v + f.a * dt, av2 = S.av + (f.react / S.astro) * dt;
  S.x += (S.v + v2) / 2 * dt; S.v = v2; S.ax += (S.av + av2) / 2 * dt; S.av = av2; S.t += dt; S.pullT += dt;
  S.avPeak = Math.max(S.avPeak, -S.av);
  const wasPush = S.shoveT >= 0, wasThr = S.thrT >= 0;
  if (S.shoveT >= 0) { S.shoveT += dt; if (S.shoveT >= SP_PUSH_T) S.shoveT = -1; }
  if (S.thrT >= 0) { S.thrT += dt; if (S.thrT >= SP_PUSH_T) { S.thrT = -1; S.thrDir = 0; } }
  if (S.ax <= TETHER_X && S.av < 0) { S.ax = TETHER_X; S.av = 0; S.flags.tether = true; }
  if (wasPush && S.shoveT < 0) { S.pushEndT = S.t; S.lastPush = S.pushF; S.pushDone = { F: S.pushF, mp: S.mass, ma: S.astro, vp: S.v, va: S.avPeak }; }
  if (wasThr && S.thrT < 0) S.bursts.push(S.v);
  S.hist.push([S.t, S.v, S.av]); if (S.hist.length > 4000) S.hist.shift();
  const fl = S.flags; fl.ran = true; if (Math.abs(S.v) > 0.01) fl.moved = true;
  if (S.x >= DOCK_X) { S.x = DOCK_X; S.running = false; fl.docked = true; S.dockV = S.v; S.msg = `The pod docked at ${fmt(S.v, 2)} m/s. Press Reset to go again.`; syncRun(); }
  else if (S.x <= -9.6) { S.running = false; S.msg = 'The pod drifted off into space! Press Reset to try again.'; syncRun(); }
}
function stepSim(dt) {
  if (S.scene === 'space') { stepSpace(dt); return; }
  const f = forces(); S.a = f.a;
  let v2 = S.v + f.a * dt;
  if (S.v !== 0 && v2 * S.v < 0) v2 = 0;
  if (Math.abs(v2) < 1e-5 && Math.abs(f.app) <= f.fmax) v2 = 0;
  S.x += (S.v + v2) / 2 * dt; S.v = v2; S.t += dt; S.pullT += dt;
  if (S.brakeX != null && S.brakeFrom == null && S.v > 0 && S.x >= S.brakeX) { S.brakeFrom = S.brakeX; S.brakeT = S.t; }
  if (S.brakeFrom != null && S.v === 0 && S.running) { S.running = false; S.flags.stopped = true; S.msg = `The crate stopped ${fmt(S.x - S.brakeFrom, 2)} m past the brake line.`; syncRun(); }
  if (S.scene === 'sled' && S.running && S.x >= SLED_FIN) { S.running = false; S.flags.finished = true; S.finT = S.t; S.finV = S.v; S.msg = `The sled crossed the finish line after ${fmt(S.t, 1)} s, moving at ${fmt(S.v, 1)} m/s. Press Reset to go again.`; syncRun(); }
  if (S.shoveT >= 0) { S.shoveT += dt; if (S.shoveT >= SHOVE_T) { S.shoveT = -1; S.lastShoveT = S.t; } }
  S.hist.push([S.t, S.v]); if (S.hist.length > 4000) S.hist.shift();
  const fl = S.flags; fl.ran = true;
  if (Math.abs(S.v) > 0.05) fl.moved = true;
  if (S.running && (f.L > 0 || f.R > 0)) fl.pulled = true;
  if (S.running && S.v === 0 && f.app !== 0 && S.pullT > PULL_RAMP) fl.stuck = true;
  if (S.scene === 'sled' ? S.x >= LIM : Math.abs(S.x) >= LIM) { S.x = Math.sign(S.x) * LIM; S.running = false; S.v = 0; S.msg = 'The crate reached the end of the arena. Press Reset to go again.'; syncRun(); }
}
function updateSim(dt) {
  if (S.scene === 'drop') { dzUpdate(dt); return; }
  if (S.scene === 'space') { const n = Math.max(3, Math.ceil(dt * S.warp / 0.01)); for (let i = 0; i < n && S.running; i++) stepSim(dt * S.warp / n); return; }   // fixed small steps, so the speeds come out exact even when time is sped up
  for (let i = 0; i < 3 && S.running; i++) stepSim(dt / 3);
}
function resetSim() { if (RUN) runEnd('reset'); if (S.scene === 'drop') dzReset(); S.fall = null; S.flags.finished = false; S.finT = null; S.finV = null; S.brakeFrom = null; S.brakeT = null; S.x = S.x0; S.v = 0; S.a = 0; S.t = 0; S.pullT = 0; S.shoveT = -1; S.lastShoveT = null; S.hist = []; S.msg = ''; S.running = false;
  S.ax = AST_X0; S.av = 0; S.avPeak = 0; S.thrT = -1; S.thrDir = 0; S.pushEndT = null; S.pushDone = null; S.lastPush = 0; S.lastThr = 0; S.lastKind = null; S.dockV = null; S.bursts = []; S.flags.docked = false; S.flags.tether = false;
  syncRun(); }
/* Space Dome: the astronaut pushes off the pod. One push per run: pressing the button again starts a fresh run. */
function spacePush() { if (S.msg || S.pushEndT != null || S.shoveT >= 0) { if (S.shoveT >= 0) return false; resetSim(); } S.shoveT = 0; S.lastKind = 'push'; S.flags.shoved = true; S.running = true; syncRun(); return true; }
/* thrusters: dir +1 pushes the pod to the right (speeds it up), -1 to the left. A burst lasts as long as a push. */
function thrust(dir) { if (S.thrT >= 0) return false; if (S.msg) resetSim(); S.thrDir = dir; S.thrT = 0; S.lastThr = dir * SP_THR_F; S.lastKind = 'thr'; S.flags.thrUsed = true; S.running = true; syncRun(); return true; }
function shove() { if (S.scene === 'space') return spacePush(); if (S.msg) resetSim(); S.shoveT = 0; S.flags.shoved = true; S.running = true; syncRun(); }
function launch() { resetSim(); S.launchN = (S.launchN || 0) + 1; S.launchMass = S.mass; S.flags.stopped = false; S.v = S.v0; S.running = true; S.flags.launched = true; S.flags.moved = true; syncRun(); }
function clearCh2() { if (S.scene === 'drop') { dzFinishRuns('reset'); S.running = false; } S.scene = null; S.warp = 1; S.noAstro = false; S.pushF = 100; S.astro = 100; if (typeof LAB !== 'undefined') LAB.sledHi = null; if (typeof LAB !== 'undefined') LAB.bmarks = null; S.target = null; S.x0 = 0; S.v0 = 2; S.brakeX = null; S.brakeF = 40; S.brakeFrom = null; S.brakeT = null; }
/* after a braked run aimed at a target distance, move the too-high / too-low markers */
function brakeMark(B, d, F) { if (!B) return; if (d == null || d > B.target + B.tol) B.lo = B.lo == null ? F : Math.max(B.lo, F); else if (d < B.target - B.tol) B.hi = B.hi == null ? F : Math.min(B.hi, F); }
