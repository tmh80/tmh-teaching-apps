/* ===== Chapter 6: the Workshop engine (S.scene = 'shop') =====
   Machine maths (must match tools/workshop_model.py), the Pull! animation, runs and masks, and the control panels.
   Script: docs/Chapter6_Workshop_Script.md sections C1 to C5. All Workshop machines are perfect (no friction) unless WS.real is on (Part 5, Explore).
   Judging uses the numbers students see: forces to 0.1 N, distances to 0.01 m, MA to 0.01. "At most" limits are inclusive.
   Names to avoid reusing elsewhere (one shared scope): WS, WS_*, ws*, shop*, SMOOSHY. */
const SMOOSHY = { name: 'Captain Smooshy', ship: 'the Gumdrop', planet: 'Glimmer-9', g: 4.2, pull: 60, base: 'Gummy Base One' };
const WS_H = 430, WS_WORLDS = { earth: { n: 'Earth', g: 9.8 }, moon: { n: 'the Moon', g: 1.6 }, mars: { n: 'Mars', g: 3.7 }, glim: { n: 'Glimmer-9', g: 4.2 } };
const WS_EFF = { lever: .95, winch: .90, ramp: .75, wedge: .40, screw: .30 }, WS_PEFF = { 1: .95, 2: .90, 3: .85, 4: .80, 5: .75, 6: .70 };
const WS_MACH = { hand: 'By hand (no machine)', lever: 'Lever', pulley: 'Pulley system', winch: 'Wheel and axle (winch)', ramp: 'Ramp', wedge: 'Wedge', screw: 'Screw jack', build: 'Compound machine' };
const WS_ICON = { hand: '✋', lever: '⚖️', pulley: '🪢', winch: '⚙️', ramp: '📐', wedge: '🪓', screw: '🔩', build: '🏗️' };
const WS_VERB = { hand: 'Lift!', lever: 'Pull!', pulley: 'Pull!', winch: 'Turn!', ramp: 'Pull!', wedge: 'Push!', screw: 'Turn!', build: 'Turn!' };
const WS_DONE = { wedge: 'Split!' };
const WS_BAR = 2, WS_T1 = 0.8, WS_WEDGE_OPEN = 0.05;
/* Part 1 names the three lever set-ups by what sits in the middle; the class numbers are only shown once step lv5 has taught them (WS.clsNames). */
const WS_SETUP = { 1: 'fulcrum in the middle', 2: 'load in the middle', 3: 'effort in the middle' };
const WS_LIFT3 = 0.40;   // whenever a lever moves the load further than your hand (MA below 1: the effort in the middle, or the fulcrum close to your hand), the rock rises 0.40 m so your hand's movement is big enough to see
const wsR1 = x => Math.round((x + 1e-9) * 10) / 10, wsR2 = x => Math.round((x + 1e-9) * 100) / 100;
const wsNear = (a, b) => typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-6 : a === b;

/* the Workshop's settings. A step sets them with wsSetup({...}). `loads` is { machine: { id, N, name, short } } so each machine can have its own load. */
const WS = {
  mach: 'lever', allow: ['lever'], cls: 1, arm: 1.0, ropes: 1, R: 0.1, axle: 0.05, L: 2, h: 1, thick: 10, per: 120, pitch: 1.0, lift: 0.10,
  load: 294, loadName: '30 kg rock', loadShort: 'rock', loadId: 'rock', loads: {}, loadOpts: null, world: 'earth', real: false, cap: null, maxTravel: 1.5,
  lim: {}, classPick: false, rampH: false, axleEdit: false, lift3: WS_LIFT3, clsNames: false,
  bw: 0, bn: 0, br: 0, bWinches: [2, 4, 6, 8, 10], bRopes: [0, 2, 3, 4], bRoutes: [[0, 'Straight up']], site: 'shop', who: null, mass: null, massOpts: null, worldPick: false, worldOpts: null,
  busy: false, ph: 0, pt: 0, T2: 2.2, c: null, done: false, msg: '', reading: 0, prog: 0, effort: 0, last: null, bubble: null, bubbleAt: 0, lastBub: -1, shown: false
};
/* ---------- the maths ---------- */
function wsArms() {
  if (WS.cls === 1) return { la: WS.arm, ea: WS_BAR - WS.arm };
  if (WS.cls === 2) return { la: WS.arm, ea: WS_BAR };
  return { la: WS_BAR, ea: WS.arm };
}
function wsParts(o) {   // machine settings -> { ma, eff, rise, ... } for the CURRENT settings (or the overrides in o)
  const s = Object.assign({}, WS, o || {}), m = s.mach; let ma, eff = 1, rise = s.lift, ex = {};
  if (m === 'hand') { ma = 1; }
  else if (m === 'lever') { const a = s.cls === 1 ? { la: s.arm, ea: WS_BAR - s.arm } : s.cls === 2 ? { la: s.arm, ea: WS_BAR } : { la: WS_BAR, ea: s.arm }; ma = a.ea / a.la; eff = WS_EFF.lever; ex = a; if (ma < 1 - 1e-9) rise = s.lift3 != null ? s.lift3 : WS_LIFT3; }
  else if (m === 'pulley') { ma = s.ropes; eff = WS_PEFF[s.ropes] || .7; }
  else if (m === 'winch') { ma = Math.round(s.R / s.axle * 1e6) / 1e6; eff = WS_EFF.winch; }
  else if (m === 'ramp') { ma = Math.round(s.L / s.h * 1e6) / 1e6; eff = WS_EFF.ramp; rise = s.h; }
  else if (m === 'wedge') { ma = 20 / s.thick; eff = WS_EFF.wedge; rise = WS_WEDGE_OPEN; }
  else if (m === 'build') { const H = s.lift, Lr = s.br || H, n = s.bn || 1, w = s.bw || 1; ma = Math.round(Lr / H * n * w * 1e6) / 1e6; eff = (s.br ? WS_EFF.ramp : 1) * (s.bn ? (WS_PEFF[s.bn] || .7) : 1) * (s.bw ? WS_EFF.winch : 1); ex = { cable: n * Lr, parts: (s.br ? 1 : 0) + (s.bn ? 1 : 0) + (s.bw ? 1 : 0) }; }
  else { ma = Math.round(s.per / s.pitch * 1e6) / 1e6; eff = WS_EFF.screw; ex = { turns: Math.round(s.lift * 100 / s.pitch * 1e6) / 1e6 }; }
  return Object.assign({ ma, eff: s.real ? eff : 1, rise }, ex);
}
function wsCalc(o) {
  const s = Object.assign({}, WS, o || {}), P = wsParts(o), load = s.load, ma = P.ma, E = wsR1(load / (ma * P.eff)); let rise = P.rise, capped = false, short = false, need = E;
  if (s.cap != null && E > s.cap) { capped = true; rise = 0; }
  if (!capped && s.mach === 'lever' && s.maxTravel != null && ma * rise > s.maxTravel + 1e-9) { rise = Math.round(s.maxTravel / ma * 1000) / 1000; short = true; }
  const eDist = wsR2(ma * rise), out = Math.round(load * rise * 100) / 100, win = P.eff < 1 ? Math.round(out / P.eff) : out;
  return { mach: s.mach, ma, eff: P.eff, E: capped ? s.cap : E, need, capped, short, rise: wsR2(rise), eDist, workOut: out, workIn: win, wasted: wsR2(win - out), effPct: out ? Math.round(out / win * 1000) / 10 : 0,
    turns: P.turns != null && !capped ? Math.round(P.turns * 100) / 100 : null, la: P.la, ea: P.ea, ropes: s.ropes, cable: P.cable != null ? P.cable : s.ropes * s.lift, travel: eDist, parts: P.parts };
}
const wsRecord = c => ({ mach: WS.mach, cls: WS.mach === 'lever' ? WS.cls : null, la: c.la != null ? wsR2(c.la) : null, ea: c.ea != null ? wsR2(c.ea) : null, ropes: WS.mach === 'pulley' ? WS.ropes : null,
  R: WS.mach === 'winch' ? WS.R : null, L: WS.mach === 'ramp' ? WS.L : null, h: WS.mach === 'ramp' ? WS.h : null, thick: WS.mach === 'wedge' ? WS.thick : null,
  per: WS.mach === 'screw' ? WS.per : null, pitch: WS.mach === 'screw' ? WS.pitch : null, loadN: WS.load, loadName: WS.loadName, loadShort: WS.loadShort, world: WS.world, real: !!WS.real, cap: WS.cap, bt: typeof BT_CUR !== 'undefined' && VIEW === 'vExplore' ? BT_CUR : null,
  bw: WS.mach === 'build' ? WS.bw : null, bn: WS.mach === 'build' ? WS.bn : null, br: WS.mach === 'build' ? WS.br : null, cable: WS.mach === 'build' ? c.cable : null, parts: WS.mach === 'build' ? c.parts : null, site: WS.site,
  liftSet: WS.mach === 'lever' && c.ma < 1 - 1e-9 ? WS.lift3 : WS.lift, E: c.E, need: c.need, capped: c.capped, short: c.short, ma: wsR2(c.ma), rise: c.rise, eDist: c.eDist, workIn: c.workIn, workOut: c.workOut, wasted: c.wasted, effPct: c.effPct, turns: c.turns });

/* ---------- the student's own runs (a question never forces a re-run) ---------- */
const shopRuns = () => runsFor().filter(r => r.scene === 'shop' && !r.live);
function shopRun(f) {
  const R = shopRuns().filter(r => !r.capped && (('real' in f) || !r.real) && Object.keys(f).every(k => k === 'load' ? wsNear(r.loadN, f[k]) : k === 'rise' ? wsNear(r.rise, f[k]) : wsNear(r[k], f[k])));
  return R.length ? R[R.length - 1] : null;
}
const shopE = f => { const r = shopRun(f); return r ? r.E : null; };
const shopDist = f => { const r = shopRun(f); return r ? r.eDist : null; };
const shopHas = f => shopRun(f) != null;
/* masks: a step lists mask: [{ q, keys, when(run-like) }]. Keys: readE, readMA, readWork, turns (more in later parts). */
function wsMasked(rec) {
  const out = new Set(); if (typeof CH === 'undefined' || !CH || LAB.mode !== 'guided') return out;
  const st = CHDATA[CH.id] && CHDATA[CH.id].steps[GI]; if (!st || !st.mask) return out;
  const r = rec || Object.assign(wsRecord(wsCalc()));
  st.mask.forEach(M => { if (M.when(r)) { const q = dbGet(stepKey(CH.id, GI) + '.' + M.q, null); if (!(q && q.done)) M.keys.forEach(k => out.add(k)); } });
  return out;
}

/* ---------- state changes ---------- */
function wsLoadFor(m) { const l = WS.loads[m]; if (l) { WS.load = l.N; WS.loadName = l.name; WS.loadShort = l.short; WS.loadId = l.id; } }
function wsSetLoad(id) { const l = WS.loadOpts && WS.loadOpts.find(x => x.id === id); if (!l) return; WS.load = l.N; WS.loadName = l.name; WS.loadShort = l.short; WS.loadId = l.id; wsResetLoad(); wsRenderControls(); if (LAB.onChange) LAB.onChange(); }
function wsSetWorld(w) { if (!WS_WORLDS[w] || w === WS.world) return; WS.world = w; if (WS.mass != null) WS.load = Math.round(WS.mass * WS_WORLDS[w].g * 10) / 10; wsResetLoad(); wsRenderControls(); if (LAB.onChange) LAB.onChange(); }
function wsSetMass(kg) { WS.mass = kg; WS.load = Math.round(kg * WS_WORLDS[WS.world].g * 10) / 10; if (WS.massOpts) { WS.loadName = kg + ' kg load'; WS.loadShort = 'load'; WS.loadId = 'mass' + kg; } wsResetLoad(); wsRenderControls(); if (LAB.onChange) LAB.onChange(); }
function wsResetLoad() { WS.busy = false; WS.ph = 0; WS.pt = 0; WS.prog = 0; WS.reading = 0; WS.done = false; WS.msg = ''; WS.c = null; if (typeof RUN !== 'undefined' && RUN && RUN.scene === 'shop' && RUN.live) runEnd('reset'); }
function wsSetup(o) {
  const d = { mach: 'lever', allow: ['lever'], cls: 1, arm: 1.0, ropes: 1, R: 0.1, axle: 0.05, L: 2, h: 1, thick: 10, per: 120, pitch: 1.0, lift: 0.10, load: 294, loadName: '30 kg rock', loadShort: 'rock', loadId: 'rock', loads: {}, loadOpts: null,
    world: 'earth', real: false, cap: null, maxTravel: 1.5, lim: {}, classPick: false, rampH: false, axleEdit: false, realPick: false, worldPick: false, worldOpts: null, mass: null, massOpts: null, lifts: null, loadFree: false, lift3: WS_LIFT3, clsNames: false, bw: 0, bn: 0, br: 0, bWinches: [2, 4, 6, 8, 10], bRopes: [0, 2, 3, 4], bRoutes: [[0, 'Straight up']], site: 'shop', who: null, pullLabel: null, hatch: 0, noShip: false, budget: null };
  Object.assign(WS, d, o || {}); WS.siteT0 = performance.now() / 1000; wsLoadFor(WS.mach); if (o && o.load != null) { WS.load = o.load; } wsResetLoad(); WS.last = null; WS.bubble = null;
}
function wsSetMach(m) {
  if (!WS.allow.includes(m) || m === WS.mach) return; WS.mach = m; wsLoadFor(m); const d = WS.lim[m]; if (d) Object.assign(WS, d); WS.lift = ({ hand: 0.10, lever: 0.10, pulley: 1.0, winch: 1.0, ramp: WS.h, wedge: WS_WEDGE_OPEN, screw: 0.20 })[m] || WS.lift;
  if (WS.lifts && WS.lifts[m] != null) WS.lift = WS.lifts[m];
  wsResetLoad(); wsRenderControls(); if (LAB.onChange) LAB.onChange();
}
function wsSet(k, v) {
  const lim = wsLimits(k); if (lim) v = clamp(Math.round(v / lim.step) * lim.step, lim.min, lim.max);
  v = Math.round(v * 1000) / 1000; if (WS[k] === v) { wsRenderControls(); return; }
  if (k === 'cls') { WS.cls = v; WS.arm = v === 3 ? 0.5 : 1.0; } else WS[k] = v;
  wsResetLoad(); wsRenderControls(); if (LAB.onChange) LAB.onChange();
}
function wsLimits(k) {
  if (k === 'arm') return WS.lim.arm ? { min: WS.lim.arm[0], max: WS.lim.arm[1], step: 0.05 } : { min: 0.2, max: 1.8, step: 0.05 };
  if (k === 'R') return { min: WS.lim.winchR ? WS.lim.winchR[0] : 0.1, max: WS.lim.winchR ? WS.lim.winchR[1] : 0.6, step: 0.05 };
  if (k === 'axle') return { min: 0.04, max: 0.10, step: 0.01 };
  if (k === 'L') return WS.lim.rampL ? { min: WS.lim.rampL[0], max: WS.lim.rampL[1], step: WS.lim.rampL[2] } : { min: 1, max: 6, step: 0.5 };
  if (k === 'h') return { min: 0.6, max: 1.5, step: 0.2 };
  if (k === 'ropes') return { min: 1, max: WS.lim.ropesMax || 6, step: 1 };
  if (k === 'lift') return { min: 0.5, max: 2, step: 0.5 };
  return null;
}

/* ---------- Pull! ---------- */
function wsPull() {
  if (WS.busy || (LAB.pullGate && !LAB.pullGate())) return false; wsResetLoad(); const c = wsCalc(); WS.c = c; WS.busy = true; WS.ph = 1; WS.pt = 0; WS.done = false; WS.msg = ''; WS.prog = 0; WS.reading = 0;
  WS.T2 = RMOTION ? 0.3 : clamp(1.6 + Math.min(c.rise || 1, 3) * 0.4, 1.8, 3.4);
  S.running = false; runMark('pull'); if (RUN) Object.assign(RUN, wsRecord(c), { scene: 'shop' });
  if (typeof lsAfterPull === 'function') lsAfterPull();
  S.flags.shopRan = true; WS.shown = true; return true;
}
function wsUpdate(dt) {
  if (!WS.busy || !WS.c) return; const c = WS.c, t1 = RMOTION ? 0.2 : WS_T1;
  WS.pt += dt;
  if (WS.ph === 1) { WS.reading = c.E * sstep(clamp(WS.pt / t1, 0, 1)); if (WS.pt >= t1) { WS.reading = c.E; WS.ph = 2; WS.pt = 0; if (c.capped) { WS.ph = 3; wsFinish(); } } }
  else if (WS.ph === 2) { WS.prog = clamp(WS.pt / WS.T2, 0, 1); WS.reading = c.E; if (WS.pt >= WS.T2) { WS.prog = 1; WS.ph = 3; wsFinish(); } }
}
function wsFinish() {
  const c = WS.c; WS.busy = false; WS.done = true; WS.last = c;
  const verb = WS.mach === 'wedge' ? 'Split!' : 'Lifted!';
  if (c.capped) WS.msg = `${SMOOSHY.name} pulled as hard as he can (${SMOOSHY.pull} N), but this set-up needs ${fmt(c.need, 1)} N.`;
  else if (c.short) WS.msg = `The lever only lifted the load ${fmt(c.rise, 2)} m before your end hit the floor.`;
  else WS.msg = verb;
  if (c.capped || c.short) WS.prog = c.capped ? 0 : 1;
  S.flags.shopDone = true; if (!c.capped && !c.short) S.flags.shopLifted = true;
  if (RUN) { RUN.done = true; runEnd(c.capped ? 'capped' : c.short ? 'short' : 'lifted'); }
  wsBubble(c.E <= SMOOSHY.pull && !c.capped);
  if (typeof checkStep === 'function') checkStep();
}
const WS_SAY_OK = ['Yes! Even my gummy arms could do that!', 'Sweet! That one\'s Smooshy-sized.', 'Now that\'s a gummy-friendly pull!'], WS_SAY_BAD = ['Too much for my gummy arms!', 'Ooh, that would turn me to jelly.', 'I\'d be a puddle of jelly after that one!'];
function wsBubble(ok) {
  const L = ok ? WS_SAY_OK : WS_SAY_BAD; let i = Math.floor(Math.random() * L.length); const key = (ok ? 0 : 10) + i; if (key === WS.lastBub) i = (i + 1) % L.length;
  WS.lastBub = (ok ? 0 : 10) + i; WS.bubble = L[i]; WS.bubbleAt = performance.now();
}
const wsForces = () => ({ L: 0, R: 0, shove: 0, app: 0, fr: 0, brk: 0, net: 0, W: WS.load, N: 0, m: WS.load / G, a: 0, fmax: 0, fk: 0 });
function wsReset() { wsResetLoad(); WS.bubble = null; }

/* ---------- run sentences and chips ---------- */
const wsBuildTxt = r => { const p = []; if (r.bw) p.push(`a winch ×${r.bw}`); if (r.bn) p.push(`a pulley block with ${r.bn} supporting ropes`); if (r.br) p.push(`a ${fmt(r.br, 0)} m ${r.site === 'rescue' ? 'track' : 'ramp'}`); return p.length ? p.length > 1 ? p.slice(0, -1).join(', ') + ' and ' + p[p.length - 1] : p[0] : 'no machine parts'; };
const wsLoadTxt = r => `${fmt(r.loadN, r.loadN % 1 ? 1 : 0)} N ${r.loadShort || 'load'}`;
function wsText(r) {
  if (r.live && r.out === 'running') return `You are working the ${WS_MACH[r.mach].toLowerCase()}…`;
  const mk = wsMasked(r), hideE = mk.has('readE'), E = hideE ? 'hidden until you answer' : fmt(r.E, 1) + ' N', obj = r.loadShort || 'load', num = v => fmt(v, 2) + ' m';
  const lev = r.mach === 'hand' ? 'your bare hands (no machine)' : r.mach === 'lever' ? `a lever with the ${WS_SETUP[r.cls]} (the ${obj} ${fmt(r.la, 2)} m from the fulcrum, your hand ${fmt(r.ea, 2)} m from it)` : r.mach === 'build' ? wsBuildTxt(r) : r.mach === 'pulley' ? `${r.ropes} supporting rope${r.ropes === 1 ? '' : 's'}` : r.mach === 'winch' ? `a winch with a handle radius of ${fmt(r.R, 2)} m` : r.mach === 'ramp' ? `a ${fmt(r.L, 1)} m ramp that rises ${fmt(r.h, 1)} m` : r.mach === 'wedge' ? `a wedge ${r.thick} cm thick` : `a screw jack (${fmt(r.per, 0)} cm per turn, threads ${fmt(r.pitch, 1)} cm apart)`;
  const verb = r.mach === 'wedge' ? `You pushed the ${wsLoadTxt(r)} apart with` : r.mach === 'ramp' ? `You pulled the ${wsLoadTxt(r)} up` : `You lifted the ${wsLoadTxt(r)} with`;
  const worldNote = r.world && r.world !== 'earth' ? ` (on ${WS_WORLDS[r.world].n})` : '';
  if (r.capped) return `With ${lev}, the load needed ${fmt(r.need, 1)} N, which is more than ${SMOOSHY.name}'s ${r.cap} N, so it didn't move.`;
  const handMove = r.mach === 'lever' ? ` The ${obj} rose ${num(r.rise)} and your hand moved ${num(r.eDist)}.` : r.mach === 'hand' ? ` The ${obj} rose ${num(r.rise)}.` : '';
  const move = handMove ? handMove : r.mach === 'ramp' ? ` The ${obj} rose ${num(r.rise)} and you pulled it ${num(r.eDist)} along the ramp.` : r.mach === 'pulley' ? ` The ${obj} rose ${num(r.rise)} and you pulled ${num(r.eDist)} of rope.` : r.mach === 'wedge' ? ` The halves opened ${fmt(r.rise * 100, 0)} cm and you pushed the wedge ${num(r.eDist)}.` : r.mach === 'screw' ? ` The ${obj} rose ${fmt(r.rise * 100, 0)} cm.${mk.has('turns') ? '' : ` It took ${fmt(r.turns, 0)} turns.`}` : ` The ${obj} rose ${num(r.rise)} and ${r.mach === 'lever' ? 'your end' : 'your hand'} moved ${num(r.eDist)}.${r.mach === 'build' && !mk.has('bCable') ? ` Cable used: ${num(r.cable)}.` : ''}`;
  const sh = r.short ? ` The lever only lifted the load ${num(r.rise)} before your end hit the floor.` : '';
  return `${verb} ${lev}${worldNote}. The effort was ${E}.${sh || move}`.replace('.. ', '. ');
}
function wsChips(r) {
  const mk = wsMasked(r), c = [['Machine', WS_MACH[r.mach]]];
  if (r.mach === 'lever') c.push(['Set-up', WS_SETUP[r.cls]], ['Fulcrum to load', fmt(r.la, 2) + ' m'], ['Fulcrum to effort', fmt(r.ea, 2) + ' m']);
  if (r.mach === 'pulley') c.push(['Supporting ropes', String(r.ropes)]);
  if (r.mach === 'build') c.push(['Winch', r.bw ? '×' + r.bw : 'none'], ['Supporting ropes', r.bn ? String(r.bn) : 'no block'], ['Route', r.br ? fmt(r.br, 0) + ' m' : 'straight up']);
  if (r.mach === 'winch') c.push(['Handle radius', fmt(r.R, 2) + ' m']);
  if (r.mach === 'ramp') c.push(['Ramp length', fmt(r.L, 1) + ' m'], ['Height', fmt(r.h, 1) + ' m']);
  if (r.mach === 'wedge') c.push(['Thickness', r.thick + ' cm']);
  if (r.mach === 'screw') { c.push(['Per turn', fmt(r.per, 0) + ' cm'], ['Thread gap', fmt(r.pitch, 1) + ' cm']); if (r.turns != null && !mk.has('turns')) c.push(['Turns', fmt(r.turns, 0)]); }
  c.push(['Load', fmt(r.loadN, r.loadN % 1 ? 1 : 0) + ' N']);
  if (!r.capped && !mk.has('readE')) c.push(['Effort', fmt(r.E, 1) + ' N']);
  if (r.capped) c.push(['Needed', fmt(r.need, 1) + ' N'], ['Result', 'too much']);
  else { c.push([r.mach === 'wedge' ? 'Opened' : 'Load rise', fmt(r.rise, 2) + ' m'], [r.mach === 'pulley' ? 'Rope pulled' : 'Your hand moved', fmt(r.eDist, 2) + ' m']); if (r.mach === 'build') { if (!mk.has('bTotMA') && !mk.has('readMA') && (wsHas('bTotMA') || wsHas('readMA'))) c.push(['Total MA', fmt(r.ma, 2)]); if (!mk.has('bCable') && wsHas('bCable')) c.push(['Cable', fmt(r.cable, 0) + ' m']); } else if (!mk.has('readMA') && wsHas('readMA')) c.push(['Mechanical advantage', fmt(r.ma, 2)]); if (!mk.has('readWork') && wsHas('readWork')) c.push(['Work in', fmt(r.workIn, 0) + ' J'], ['Work out', fmt(r.workOut, 0) + ' J']); }
  return c;
}
const wsHas = k => LAB.show.has(k) || VIEW === 'vExplore';

/* ---------- controls ---------- */
const wsFmt = (k, v) => k === 'ropes' ? String(v) : fmt(v, k === 'arm' || k === 'R' || k === 'axle' ? 2 : 1);
function wsRenderControls() {
  if (!$('#wsMachs')) return;
  $$('#lab [data-wsm]').forEach(el => { el.hidden = !el.dataset.wsm.split(' ').includes(WS.mach) || (!!el.dataset.panel && !el.dataset.panel.split(' ').some(k => LAB.show.has(k))); });   /* a panel the step has not switched on stays hidden even when its machine is on the bench (Part 4 step 1 showed an empty builder; Tom, 3 Nov 2026) */   // only the controls of the machine on the bench
  const seg = (id, items, cur, attr) => { const el = $(id); if (!el) return; const sig = items.map(i => i[0] + ':' + i[1]).join('|') + cur; if (el.dataset.sig === sig) return; el.dataset.sig = sig; el.innerHTML = items.map(([v, l]) => `<button type="button" ${attr}="${v}" aria-pressed="${String(v) === String(cur)}">${l}</button>`).join(''); };
  const A = WS.allow; $('#wsMachs').className = 'seg ' + (A.length > 3 ? 'three' : A.length > 2 ? 'three' : 'two'); seg('#wsMachs', A.map(m => [m, `${WS_ICON[m]} ${WS_MACH[m].replace(' (winch)', '')}`]), WS.mach, 'data-mach');
  if (WS.loadOpts) seg('#wsLoads', WS.loadOpts.map(l => [l.id, l.name]), WS.loadId, 'data-load');
  else if (WS.massOpts) seg('#wsLoads', WS.massOpts.map(k => [k, k + ' kg']), WS.mass, 'data-mass');
  seg('#wsWorlds', Object.keys(WS_WORLDS).filter(k => !WS.worldOpts || WS.worldOpts.includes(k)).map(k => [k, WS_WORLDS[k].n.replace(/^the /, '').replace(/^./, ch => ch.toUpperCase())]), WS.world, 'data-world');
  seg('#wsCls', [1, 2, 3].map(n => [n, (WS.clsNames ? `Class ${n}: ` : '') + WS_SETUP[n].replace(/^./, ch => ch.toUpperCase())]), WS.cls, 'data-cls');
  seg('#wsThick', [[10, '10 cm'], [5, '5 cm'], [4, '4 cm'], [2, '2 cm']].filter(x => !WS.lim.thick || WS.lim.thick.includes(x[0])), WS.thick, 'data-thick');
  seg('#wsPer', [[60, '60 cm'], [120, '120 cm'], [180, '180 cm']], WS.per, 'data-per'); seg('#wsPitch', [[0.2, '0.2 cm'], [0.5, '0.5 cm'], [1.0, '1.0 cm']].filter(x => !WS.lim.pitch || WS.lim.pitch.includes(x[0])), WS.pitch, 'data-pitch');
  seg('#wsReal', [[0, 'Perfect machine'], [1, 'Real machine']], WS.real ? 1 : 0, 'data-real'); { const rn = $('#wsRealNote'); if (rn) rn.textContent = WS.real ? 'Friction turns some of your work into heat.' : 'No friction at all: every joule you put in comes out.'; }
  seg('#bWinch', [[0, 'No winch']].concat(WS.bWinches.map(v => [v, '×' + v])), WS.bw, 'data-bw'); seg('#bRopes', WS.bRopes.map(v => [v, v ? v + ' ropes' : 'No block']), WS.bn, 'data-bn'); seg('#bRoute', WS.bRoutes.map(([v, l]) => [v, l]), WS.br, 'data-br');
  const bp = $('#bWinchRow'); if (bp) { bp.hidden = !WS.bWinches.length; $('#bRopesRow').hidden = WS.bRopes.length < 2; $('#bRouteRow').hidden = WS.bRoutes.length < 2; }
  seg('#wsH', [[0.6, '0.6 m'], [0.8, '0.8 m'], [1.0, '1.0 m'], [1.2, '1.2 m']], WS.h, 'data-h');
  seg('#wsLift', [[1, '1 m'], [2, '2 m']], WS.lift, 'data-lift');
  const num = (id, v) => { const e = $(id); if (e && document.activeElement !== e) e.value = v; };
  const al = wsLimits('arm'), lab = WS.cls === 1 ? 'Move the fulcrum' : WS.cls === 2 ? 'Move the rock' : 'Move your hand'; const t = $('#wsArmTitle'); if (t) t.textContent = lab; $('#wsArm').min = al.min; $('#wsArm').max = al.max; $('#wsArm').step = al.step; $('#wsArm').value = WS.arm; num('#wsArmNum', fmt(WS.arm, 2));
  const arms = wsArms(), note = $('#wsArmNote'); if (note) note.textContent = `${WS.loadShort.replace(/^./, ch => ch.toUpperCase())} to fulcrum: ${fmt(arms.la, 2)} m · your hand to fulcrum: ${fmt(arms.ea, 2)} m`;
  const rl = wsLimits('R'); [$('#wsR'), $('#wsRNum')].forEach(e => { e.min = rl.min; e.max = rl.max; }); $('#wsR').step = 0.05; $('#wsR').value = WS.R; num('#wsRNum', fmt(WS.R, 2));
  const ll = wsLimits('L'); [$('#wsL'), $('#wsLNum')].forEach(e => { e.min = ll.min; e.max = ll.max; }); $('#wsL').step = ll.step; $('#wsL').value = WS.L; num('#wsLNum', fmt(WS.L, 1));
  $('#wsRopesN').textContent = WS.ropes; $('#wsRopesDn').disabled = WS.ropes <= 1; $('#wsRopesUp').disabled = WS.ropes >= (WS.lim.ropesMax || 6);
  const ax = $('#wsAxleRow'); if (ax) { ax.hidden = !WS.axleEdit || WS.mach !== 'winch'; num('#wsAxleNum', fmt(WS.axle, 2)); }
  $('#wsClsRow').hidden = !WS.classPick || WS.mach !== 'lever'; $('#wsHRow').hidden = !WS.rampH || WS.mach !== 'ramp'; $('#wsLiftRow').hidden = !WS.lifts || WS.lifts.pick !== true || !['pulley'].includes(WS.mach);
  const pb = $('#wsPull'); if (pb) { pb.textContent = (LS.on ? '▶ ' : '') + (WS.pullLabel || WS_VERB[WS.mach]); pb.disabled = WS.busy || !!(LAB.pullGate && !LAB.pullGate()); }
  if (LS.on) lsRender();
  const tn = $('#wsTurnNote'); if (tn) tn.textContent = WS.mach === 'screw' ? `One turn moves the handle ${fmt(WS.per, 0)} cm and lifts the jack ${fmt(WS.pitch, 1)} cm (the gap between threads).` : '';
}
function initShop() {
  if (!$('#wsMachs')) return;
  const dl = (sel, attr, fn) => document.addEventListener('click', e => { const b = e.target.closest(sel); if (b && $('#lab').contains(b)) fn(b.getAttribute(attr), b); });
  dl('#wsMachs [data-mach]', 'data-mach', v => wsSetMach(v)); dl('#wsWorlds [data-world]', 'data-world', v => wsSetWorld(v)); dl('#wsLoads [data-mass]', 'data-mass', v => wsSetMass(+v)); dl('#wsLoads [data-load]', 'data-load', v => wsSetLoad(v)); dl('#wsCls [data-cls]', 'data-cls', v => wsSet('cls', +v));
  dl('#wsThick [data-thick]', 'data-thick', v => wsSet('thick', +v)); dl('#wsPer [data-per]', 'data-per', v => wsSet('per', +v)); dl('#wsPitch [data-pitch]', 'data-pitch', v => wsSet('pitch', +v));
  dl('#wsReal [data-real]', 'data-real', v => wsSet('real', +v)); dl('#wsH [data-h]', 'data-h', v => wsSet('h', +v)); dl('#bWinch [data-bw]', 'data-bw', v => wsSet('bw', +v)); dl('#bRopes [data-bn]', 'data-bn', v => wsSet('bn', +v)); dl('#bRoute [data-br]', 'data-br', v => wsSet('br', +v)); dl('#wsLift [data-lift]', 'data-lift', v => wsSet('lift', +v));
  const pair = (r, n, k) => { $(r).addEventListener('input', () => wsSet(k, +$(r).value)); const go = () => { const v = parseNum($(n).value); if (isNaN(v)) { wsRenderControls(); return; } wsSet(k, v); }; $(n).addEventListener('change', go); $(n).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); $(n).blur(); } }); };
  pair('#wsArm', '#wsArmNum', 'arm'); pair('#wsR', '#wsRNum', 'R'); pair('#wsL', '#wsLNum', 'L');
  const ax = $('#wsAxleNum'); if (ax) { const go = () => { const v = parseNum(ax.value); if (!isNaN(v)) wsSet('axle', v); else wsRenderControls(); }; ax.addEventListener('change', go); }
  $('#wsRopesDn').addEventListener('click', () => wsSet('ropes', WS.ropes - 1)); $('#wsRopesUp').addEventListener('click', () => wsSet('ropes', WS.ropes + 1));
  $('#wsPull').addEventListener('click', () => { if (wsPull()) labChanged(); });
}
