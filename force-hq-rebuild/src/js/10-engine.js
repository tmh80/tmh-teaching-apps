/* ===== Arena physics (Main Arena tug-of-war; built to extend to the other arenas) ===== */
const PUL = {
  kid: { n: 60, label: 'Kid', w: 36 }, dog: { n: 70, label: 'Dog', w: 54 }, adult: { n: 130, label: 'Adult', w: 36 },
  strong: { n: 200, label: 'Strong adult', w: 38 }, pony: { n: 260, label: 'Pony', w: 80 }, horse: { n: 650, label: 'Horse', w: 104 },
  husky: { n: 90, label: 'Husky', w: 56 }
};
const FLOORS = {
  air: { name: 'Air floor', mu: 0, mus: 0, note: 'μ = 0' }, ice: { name: 'Ice', mu: 0.03, mus: 0.05, note: 'μ = 0.03' },
  smooth: { name: 'Smooth floor', mu: 0.1, mus: 0.15, note: 'μ = 0.1' }, concrete: { name: 'Rough concrete', mu: 0.4, mus: 0.5, note: 'μ = 0.4' }
};
const PXM = 39, CX = 450, GROUND = 300, ROPEY = 262, CW = 88, CRH = 64, LIM = 9, MAXT = 6;
const PULL_RAMP = 0.4, SHOVE_T = 0.6, SHOVE_F = 250;
const S = {
  left: [], right: [], mass: 50, floor: 'concrete', x: 0, v: 0, a: 0, t: 0, pullT: 0, shoveT: -1, lastShoveT: null,
  running: false, hist: [], msg: '', flags: null, frozen: false
};
const newFlags = () => ({ ran: false, shoved: false, moved: false, stuck: false, pulled: false });
S.flags = newFlags();
const tot = a => a.reduce((s, p) => s + PUL[p].n, 0);

function forces() {
  const u = S.running ? Math.min(1, S.pullT / PULL_RAMP) : 1, k = sstep(u), m = S.mass, fl = FLOORS[S.floor];
  const L = tot(S.left) * k, R = tot(S.right) * k, W = m * G, N = W, fs = fl.mus * W, fk = fl.mu * W;
  const shove = S.shoveT >= 0 && S.shoveT < SHOVE_T ? SHOVE_F * Math.pow(Math.sin(Math.PI * S.shoveT / SHOVE_T), 2) : 0;
  const app = R - L + shove;
  let fr;
  if (Math.abs(S.v) < 1e-6) fr = Math.abs(app) <= fs ? -app : -Math.sign(app) * fk;
  else fr = -Math.sign(S.v) * fk;
  if (Math.abs(fr) < 1e-9) fr = 0;
  const net = app + fr;
  return { L, R, shove, app, fr, net, W, N, m, a: net / m, fmax: fs, fk };
}
/* forces for a still, set-up arena (no ramp) — used by guided checks and FBD comparisons */
function staticForces() { const keep = S.running; S.running = false; const f = forces(); S.running = keep; return f; }

function stepSim(dt) {
  const f = forces(); S.a = f.a;
  let v2 = S.v + f.a * dt;
  if (S.v !== 0 && v2 * S.v < 0) v2 = 0;
  if (Math.abs(v2) < 1e-5 && Math.abs(f.app) <= f.fmax) v2 = 0;
  S.x += (S.v + v2) / 2 * dt; S.v = v2; S.t += dt; S.pullT += dt;
  if (S.shoveT >= 0) { S.shoveT += dt; if (S.shoveT >= SHOVE_T) { S.shoveT = -1; S.lastShoveT = S.t; } }
  S.hist.push([S.t, S.v]); if (S.hist.length > 4000) S.hist.shift();
  const fl = S.flags; fl.ran = true;
  if (Math.abs(S.v) > 0.05) fl.moved = true;
  if (S.running && (f.L > 0 || f.R > 0)) fl.pulled = true;
  if (S.running && S.v === 0 && f.app !== 0 && S.pullT > PULL_RAMP) fl.stuck = true;
  if (Math.abs(S.x) >= LIM) { S.x = Math.sign(S.x) * LIM; S.running = false; S.v = 0; S.msg = 'The crate reached the end of the arena. Press Reset to go again.'; syncRun(); }
}
function updateSim(dt) { for (let i = 0; i < 3 && S.running; i++) stepSim(dt / 3); }
function resetSim() { S.x = 0; S.v = 0; S.a = 0; S.t = 0; S.pullT = 0; S.shoveT = -1; S.lastShoveT = null; S.hist = []; S.msg = ''; S.running = false; syncRun(); }
function shove() { if (S.msg) resetSim(); S.shoveT = 0; S.flags.shoved = true; S.running = true; syncRun(); }
