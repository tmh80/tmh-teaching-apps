/* ===== Chapter 6 Part 5: Operation Gummy Lift, the rescue model (stage 1 of docs/Force_HQ_Rescue_Rebuild_Brief.md) =====
   Pure maths and data, no drawing: the crater's height profile, dynamite blasts, the rig (parts + cables), tracing the legs,
   pulls, hand travel, work, damage and the score out of 10. The builder (4g) and Run Rescue (4h) read everything from glEvaluate(rig).
   Units: metres and newtons. x runs left to right across the crater; y is height above the crater floor.

   The rig, as saved in chal.c6e.gl.rig:
     { v: 2, parts: [ ...see below ], cables: [ { a: partId|'hand'|'boulder'|'ship', b: partId|'boulder'|'ship' } ] }
   'ship' is the Gumdrop's hook: the ship at the start of the leg that the other end of the cable belongs to (the real ship for leg 1, the ghost Gumdrop after that).
   A ramp or a crane only lifts the Gumdrop when a cable joins the machine (or one of its add-ons) to 'ship'. A lever or a screw jack carries the Gumdrop on its end, so it needs no rope.
   Rigs saved before ropes existed have no v: glMigrate() ropes every ramp and crane to 'ship' so they still work.
   Lift machines (one leg each):
     ramp   { id, type:'ramp', x1, y1, L, rise }          foot at (x1, y1); head = foot + (√(L² − rise²), rise)
     crane  { id, type:'crane', x, rise }                 stands on whatever is under x; lifts straight up
     lever  { id, type:'lever', x, arm, rise, dir }       x = the load end; arm = load arm (fulcrum distance); the beam reaches
                                                          10 m towards dir (+1 right, −1 left); MA = (10 − arm) ÷ arm
     jack   { id, type:'jack', x, rise }
     A lift machine with role:'boulder' works on the boulder instead of the ship.
   Add-ons, joined to a machine by cables: block { id, type:'block', ropes 1–4 }, winch { id, type:'winch', ratio }.
     Cable chain for a leg: machine — block — winch — winch (Smooshy holds the last one). Order along the chain does not change the maths.
   platform { id, type:'platform', size:'S'|'M'|'L', x (centre), h (height above the ground under it) }
   dyn      { id, type:'dyn', big:true|false, x }       blasts the surface at x, in the order placed
*/
const GL = { g: 4.2, ship: 6300, rock: 2100, boulderN: 252, pullOk: 60, budget: 475, oxy: 1500, W: 96, shipX: 14, boulderX: 19,
  hzX: 3, hzY: 0.5, rampMax: 30, slopeMax: 0.5, beam: 10, leverMAmax: 9, leverRise: 2, jackMA: 120, jackRise: 2, craneRise: 8, platMaxH: 8,
  winchRatios: [2, 4, 6, 7, 8, 10], ropesMax: 4, winchMax: 2, nearShip: 6, sit: 0.3, bed: 0.6, dig: 0.2, rimFrom: 44, rimTo: 76 };
const GL_COST = { ramp: 3, crane: 40, lever: 25, jack: 60, rope: 10, winch: 15, cablePer5: 1, small: 20, big: 40 };
const GL_PLAT = { S: { holds: 4000, base: 10, w: 3, name: 'Small' }, M: { holds: 7000, base: 20, w: 4, name: 'Medium' }, L: { holds: 10000, base: 35, w: 5, name: 'Large' } };
const GL_WT = { crane: 1000, lever: 500, jack: 400, winch: 100, block: 100, ramp: 0 };
const GL_BLAST = { small: 1.5, big: 3 };
const GL_LIFT = { ramp: 1, crane: 1, lever: 1, jack: 1 };
const GL_ROPED = { ramp: 1, crane: 1 };   // the machines that must be roped to the Gumdrop's hook
const GL_HOOK = 5.6;   // the Gumdrop's hook is this many metres above its base
/* the crater, side-on (tuned so every route in brief section 9 can be built; tests/rescue_numbers.py checks them on this ground) */
const GL_PROFILE = [[0, 8], [3, 4.5], [6, 0.8], [8, 0], [22, 0], [28, 0.8], [32, 2.2], [35, 4], [37, 5.2], [38.6, 6], [44, 6], [47, 6.5], [50, 7.6],
  [53, 8.7], [55, 9.1], [57, 9.1], [59, 9.6], [61, 10.6], [63, 11.5], [64, 12], [66, 12], [67, 13.5], [68, 15], [69, 13.5], [70, 12], [72, 10], [75, 8], [96, 8]];
function glBaseGround() {
  const h = [];
  for (let x = 0; x <= GL.W; x++) { let i = 0; while (i < GL_PROFILE.length - 2 && GL_PROFILE[i + 1][0] < x) i++; const [x0, y0] = GL_PROFILE[i], [x1, y1] = GL_PROFILE[i + 1]; h.push(+(y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0), 0, 1)).toFixed(3)); }
  return h;
}
const glAt = (g, x) => { if (x <= 0) return g[0]; if (x >= GL.W) return g[GL.W]; const i = Math.floor(x), f = x - i; return f ? g[i] + (g[i + 1] - g[i]) * f : g[i]; };
/* a blast carves a round dip like Worms, centred on the surface: no tunnels, no overhangs */
function glBlast(g, bx, big) {
  const r = big ? GL_BLAST.big : GL_BLAST.small, by = glAt(g, bx), out = g.slice();
  for (let x = Math.ceil(bx - r); x <= Math.floor(bx + r); x++) { if (x < 0 || x > GL.W) continue; const d = Math.sqrt(Math.max(0, r * r - (x - bx) * (x - bx))); out[x] = Math.max(0, Math.min(out[x], +(by - d).toFixed(3))); }
  return { g: out, at: { x: bx, y: by }, r };
}
function glGround(rig) { let g = glBaseGround(); const blasts = []; (rig.parts || []).filter(p => p.type === 'dyn').forEach(p => { const b = glBlast(g, p.x, p.big); g = b.g; blasts.push(Object.assign({ id: p.id, big: !!p.big }, b.at, { r: b.r })); }); return { g, blasts }; }
const glCrest = g => { let m = 0; for (let x = GL.rimFrom; x <= GL.rimTo; x++) m = Math.max(m, g[x]); return m; };
const glMaxRight = (g, x) => { let m = glAt(g, x); for (let i = Math.ceil(x); i <= GL.W; i++) m = Math.max(m, g[i]); return m; };

/* ---------- supports: the ground, or the top of a platform ---------- */
function glPlatforms(rig, g) {
  return (rig.parts || []).filter(p => p.type === 'platform').map(p => { const P = GL_PLAT[p.size] || GL_PLAT.M, x0 = p.x - P.w / 2, x1 = p.x + P.w / 2; let base = 0;
    for (let x = x0; x <= x1 + 1e-9; x += 0.5) base = Math.max(base, glAt(g, x)); return { id: p.id, part: p, x0, x1, base, top: +(base + p.h).toFixed(3), holds: P.holds }; });
}
/* what holds up a point: a platform top it sits on, else the ground (within GL.sit metres), else nothing */
function glSupport(x, y, g, plats) {
  const pl = plats.find(q => x >= q.x0 - 0.05 && x <= q.x1 + 0.05 && Math.abs(y - q.top) <= GL.sit);
  if (pl) return { kind: 'platform', id: pl.id, y: pl.top };
  const gy = glAt(g, x); if (Math.abs(y - gy) <= GL.sit) return { kind: 'ground', y: gy };
  return null;
}
/* the level something standing at x rests on: the highest platform top over x, else the ground */
function glFloorAt(x, g, plats) { const tops = plats.filter(q => x >= q.x0 - 0.05 && x <= q.x1 + 0.05).map(q => q.top); return tops.length ? Math.max(...tops) : glAt(g, x); }
function glFloorKind(x, g, plats) { const pl = plats.filter(q => x >= q.x0 - 0.05 && x <= q.x1 + 0.05).sort((a, b) => b.top - a.top)[0]; return pl ? { kind: 'platform', id: pl.id, y: pl.top } : { kind: 'ground', y: glAt(g, x) }; }

/* ---------- one machine: its start, end, MA and any rule it breaks ---------- */
const glRun = p => Math.sqrt(Math.max(0, p.L * p.L - p.rise * p.rise));
const glLeverMA = p => (GL.beam - p.arm) / p.arm;
function glMachine(p, g, plats) {
  const m = { id: p.id, type: p.type, part: p, faults: [] };
  if (p.type === 'ramp') {
    const run = glRun(p); m.start = { x: p.x1, y: p.y1 }; m.end = { x: p.x1 + run, y: p.y1 + p.rise }; m.rise = p.rise; m.ma = p.rise > 0 ? p.L / p.rise : 0; m.dist = p.L; m.L = p.L; m.run = run;
    if (p.L > GL.rampMax + 1e-9) m.faults.push('long');
    if (p.rise <= 0 || p.rise / p.L > GL.slopeMax + 1e-9) m.faults.push('steep');
    /* the deck may bed into the ground by a little near each end, never pass through it */
    for (let t = 0.02; t < 0.98; t += 0.01) { const x = m.start.x + run * t, y = m.start.y + p.rise * t, gy = glAt(g, x), endish = Math.min(t, 1 - t) * p.L < GL.bed;
      if (gy - y > (endish ? GL.dig + 0.25 : GL.dig)) { m.faults.push('ground'); m.hit = { x, y: gy }; break; } }
    m.footOn = glSupport(m.start.x, m.start.y, g, plats); m.headOn = glSupport(m.end.x, m.end.y, g, plats);
    if (!m.headOn) m.faults.push('head');
    m.base = m.headOn;   // the pulley block and winches bolt on at the top of the ramp
  } else {
    const fl = glFloorKind(p.x, g, plats), cap = p.type === 'crane' ? GL.craneRise : p.type === 'lever' ? GL.leverRise : GL.jackRise;
    m.start = { x: p.x, y: fl.y }; m.rise = p.rise; m.end = { x: p.x, y: +(fl.y + p.rise).toFixed(3) }; m.base = fl; m.dist = p.rise;
    if (p.rise <= 0 || p.rise > cap + 1e-9) m.faults.push('rise');
    if (p.type === 'crane') m.ma = 1;
    if (p.type === 'jack') m.ma = GL.jackMA;
    if (p.type === 'lever') { m.ma = glLeverMA(p); if (m.ma > GL.leverMAmax + 1e-9 || p.arm <= 0 || p.arm >= GL.beam) m.faults.push('fulcrum'); m.dist = m.ma * p.rise; }
  }
  return m;
}
/* follow the cables out from a machine: pulley block and winches (any order), stopping at Smooshy's hand */
function glAddons(rig, id) {
  const byId = {}; (rig.parts || []).forEach(p => byId[p.id] = p);
  const nb = n => (rig.cables || []).filter(c => c.a === n || c.b === n).map(c => c.a === n ? c.b : c.a);
  const seen = new Set([id]), chain = []; let cur = id, guard = 0, faults = [];
  while (guard++ < 8) { const nx = nb(cur).filter(n => !seen.has(n) && byId[n] && (byId[n].type === 'block' || byId[n].type === 'winch'));
    if (nx.length > 1) faults.push('tangle'); if (!nx.length) break; seen.add(nx[0]); chain.push(byId[nx[0]]); cur = nx[0]; }
  const blocks = chain.filter(p => p.type === 'block'), winches = chain.filter(p => p.type === 'winch');
  if (blocks.length > 1) faults.push('blocks'); if (winches.length > GL.winchMax) faults.push('winches');
  const ropes = blocks.length ? clamp(blocks[0].ropes | 0, 1, GL.ropesMax) : 1, wm = winches.slice(0, GL.winchMax).reduce((a, w) => a * w.ratio, 1);
  return { chain, blocks, winches, ropes, wm, faults, cabled: chain.length > 0 };
}

/* is a cable joining this machine (or an add-on in its chain) to the Gumdrop's hook? */
function glRoped(rig, id, ad) { const ids = new Set([id].concat(ad.chain.map(p => p.id))); return (rig.cables || []).some(c => (c.a === 'ship' && ids.has(c.b)) || (c.b === 'ship' && ids.has(c.a))); }
/* old saves had no ropes to the Gumdrop: add them so a route that worked before still works */
function glMigrate(rig) {
  if (!rig || rig.v >= 2) return rig; rig.cables = rig.cables || [];
  (rig.parts || []).forEach(p => { if (GL_ROPED[p.type] && !rig.cables.some(c => (c.a === 'ship' && c.b === p.id) || (c.b === 'ship' && c.a === p.id))) rig.cables.push({ a: p.id, b: 'ship' }); });
  rig.v = 2; return rig;
}

/* ---------- the whole rig: blasts, boulder, legs in order, run, damage, score ---------- */
function glEvaluate(rig, opts) {
  opts = opts || {}; rig = rig || { parts: [], cables: [] };
  const { g, blasts } = glGround(rig), plats = glPlatforms(rig, g), parts = rig.parts || [];
  const ship0 = { x: GL.shipX, y: glAt(g, GL.shipX) };
  /* the boulder: a lever or jack set on it, a rope and winch from it, or a blast that reaches it */
  const bShip = blasts.filter(b => Math.hypot(b.x - GL.shipX, b.y - ship0.y) <= GL.nearShip);
  const bRock = blasts.filter(b => Math.abs(b.x - GL.boulderX) <= b.r + 0.6);
  let boulder = { how: null, pull: null, ok: false, ma: 0 };
  const bm = parts.find(p => p.role === 'boulder' && (p.type === 'lever' || p.type === 'jack'));
  const bc = (rig.cables || []).find(c => c.a === 'boulder' || c.b === 'boulder');
  if (bRock.length) boulder = { how: 'blast', ok: true, pull: 0, ma: 0 };
  else if (bm) { const ad = glAddons(rig, bm.id), ma = (bm.type === 'jack' ? GL.jackMA : glLeverMA(bm)) * (bm.type === 'jack' ? 1 : ad.ropes * ad.wm); boulder = { how: bm.type, id: bm.id, ma, pull: GL.boulderN / ma, ok: GL.boulderN / ma <= GL.pullOk + 1e-9 }; }
  else if (bc) { const ad = glAddons({ parts, cables: (rig.cables || []).map(c => ({ a: c.a === 'boulder' ? '__b' : c.a, b: c.b === 'boulder' ? '__b' : c.b })) }, '__b'), ma = ad.ropes * ad.wm; if (ad.cabled) boulder = { how: 'winch', ma, pull: GL.boulderN / ma, ok: GL.boulderN / ma <= GL.pullOk + 1e-9 }; }
  const rockOn = !boulder.ok, load = GL.ship + (rockOn ? GL.rock : 0);
  /* the ship's legs: start at the Gumdrop, each next machine must start in the handover zone (3 m across, 0.5 m up or down) of the last end */
  const ms = parts.filter(p => GL_LIFT[p.type] && p.role !== 'boulder').map(p => glMachine(p, g, plats)), used = new Set(), legs = [];
  let at = ship0, stop = null, arrived = false;
  const inZone = (a, b) => Math.abs(a.x - b.x) <= GL.hzX + 1e-9 && Math.abs(a.y - b.y) <= GL.hzY + 1e-9;
  const beamSees = p => p.y >= glMaxRight(g, p.x) - GL.hzY - 1e-9;   // the Big Jelly's tractor beam needs the Gumdrop level with everything between it and the plain
  for (let guard = 0; guard < 12; guard++) {
    if (legs.length && beamSees(at)) { arrived = true; break; }
    const cand = ms.filter(m => !used.has(m.id) && m.rise > 0 && inZone(at, m.start)).sort((a, b) => (b.end.y - a.end.y) || (Math.hypot(a.start.x - at.x, a.start.y - at.y) - Math.hypot(b.start.x - at.x, b.start.y - at.y)));
    if (!cand.length) { stop = { why: legs.length ? 'gap' : 'none', at: Object.assign({}, at), leg: legs.length }; break; }
    const m = cand[0]; used.add(m.id);
    const ad = glAddons(rig, m.id), faults = m.faults.concat(ad.faults);
    if (m.type === 'jack' && ad.cabled) faults.push('jackcable');
    const ma = m.type === 'jack' ? m.ma : m.ma * ad.ropes * ad.wm, pull = load / ma, hand = ma * m.rise;
    const cable = m.type === 'jack' ? 0 : (m.type === 'crane' || ad.cabled) ? ad.ropes * m.dist : 0;
    const roped = GL_ROPED[m.type] ? glRoped(rig, m.id, ad) : true;
    const leg = { i: legs.length, id: m.id, roped, at: Object.assign({}, at), type: m.type, m, start: m.start, end: m.end, rise: +m.rise.toFixed(3), mma: m.ma, ropes: m.type === 'jack' ? 1 : ad.ropes, winches: ad.winches.map(w => w.ratio), ma, load, pull, hand, cable, work: load * Math.max(0, m.rise), faults, addons: ad.chain.map(p => p.id) };
    legs.push(leg);
    if (faults.length) { stop = { why: 'broken', at: Object.assign({}, at), leg: leg.i, faults }; leg.stopped = true; break; }
    if (!roped) { stop = { why: 'norope', at: Object.assign({}, at), leg: leg.i }; leg.stopped = true; break; }
    if (pull > 180 + 1e-9) { stop = { why: 'heavy', at: Object.assign({}, at), leg: leg.i }; leg.stopped = true; break; }
    at = m.end;
  }
  if (!stop && !arrived) stop = { why: 'gap', at: Object.assign({}, at), leg: legs.length };
  /* platforms: the Gumdrop (and the rock, if still on) plus every machine standing on it */
  const onPlat = (pt, pl) => pl && pt && pt.kind === 'platform' && pt.id === pl.id;
  const loads = plats.map(pl => { let n = 0, ship = false;
    ms.concat(parts.filter(p => p.role === 'boulder' && GL_LIFT[p.type]).map(p => glMachine(p, g, plats))).forEach(m => { if (m.type !== 'ramp' && onPlat(m.base, pl)) n += GL_WT[m.type]; const ad = glAddons(rig, m.id); if (onPlat(m.base, pl)) n += ad.chain.reduce((a, p) => a + GL_WT[p.type], 0); });
    legs.forEach(l => { [l.start, l.end].forEach(pt => { const s = glSupport(pt.x, pt.y, g, plats); if (s && s.kind === 'platform' && s.id === pl.id) ship = true; }); });
    return { id: pl.id, top: pl.top, base: pl.base, x0: pl.x0, x1: pl.x1, holds: pl.holds, machines: n, ship, load: n + (ship ? load : 0) }; });
  loads.forEach(L => { L.over = L.load > L.holds + 1e-9; });
  /* the run stops at the first leg that puts the Gumdrop on an overloaded platform (or the first overloaded platform under a machine) */
  for (const l of legs) { if (stop && l.i > stop.leg) break;
    const s = glSupport(l.end.x, l.end.y, g, plats), s0 = glSupport(l.start.x, l.start.y, g, plats), base = l.m.base;
    const bad = [s0, base, s].map(q => q && q.kind === 'platform' && loads.find(L => L.id === q.id && L.over)).find(Boolean);
    if (bad) { if (!stop || l.i <= stop.leg) { stop = { why: 'collapse', at: Object.assign({}, l.start), leg: l.i, plat: bad.id }; arrived = false; l.stopped = true; } break; } }
  if (stop && stop.why === 'collapse') { legs.forEach(l => { if (l.i > stop.leg) l.skipped = true; }); }
  const ran = legs.filter(l => !l.skipped && !(stop && l.i === stop.leg && stop.why !== 'gap'));
  const done = arrived && !stop;
  /* numbers for the receipt */
  const hardest = legs.length ? Math.max(...legs.map(l => l.pull)) : load;
  const hand = legs.reduce((a, l) => a + l.hand, 0), workJ = legs.reduce((a, l) => a + l.work, 0);
  let thr = 0; legs.forEach(l => { l.thruster = l.pull > GL.pullOk + 1e-9 ? Math.min(100, (l.pull - GL.pullOk) / 120 * 100) : 0; thr += l.thruster; });
  const dmg = { thrusters: thr, rock: rockOn ? 25 : 0, blasts: bShip.length * 15 }; dmg.total = Math.min(100, dmg.thrusters + dmg.rock + dmg.blasts);
  const cost = glCost(rig, legs, boulder), crest = glCrest(g);
  const ghost = !done && stop && stop.leg >= 1 ? Object.assign({}, stop.at) : null;   // where the Gumdrop waits for the next machine
  const ghosts = []; const addG = (q, after) => { if (!ghosts.some(g => Math.hypot(g.x - q.x, g.y - q.y) < 0.01)) ghosts.push({ x: q.x, y: q.y, after }); };
  legs.forEach(l => { if (l.i >= 1) addG(l.at, l.i); }); if (ghost) addG(ghost, stop.leg);   // a ghost Gumdrop at the start of every leg after the first
  const res = { ok: done, arrived: done, stop: done ? null : stop, ghost, ghosts, legs, ran, hardest, hand, work: workJ, load, rockOn, boulder, blasts, bShip: bShip.length, dmg, cost, crest, plats: loads, ground: g, ship0,
    final: legs.length ? legs[legs.length - 1].end : ship0, used: [...used], spare: ms.filter(m => !used.has(m.id)).map(m => m.id) };
  res.score = glScore(res, opts.hints || 0);
  return res;
}
/* crystals: every part bought counts, used or not */
function glCost(rig, legs, boulder) {
  const parts = rig.parts || [], items = []; let total = 0;
  const add = (what, n) => { items.push([what, n]); total += n; };
  parts.forEach(p => {
    if (p.type === 'ramp') add(`Ramp ${fmt(p.L, 1)} m`, Math.ceil(GL_COST.ramp * p.L - 1e-9));
    else if (p.type === 'crane' || p.type === 'lever' || p.type === 'jack') add(p.type === 'crane' ? 'Crane gantry' : p.type === 'lever' ? 'Lever' : 'Screw jack', GL_COST[p.type]);
    else if (p.type === 'block') add(`Pulley block, ${p.ropes} rope${p.ropes > 1 ? 's' : ''}`, GL_COST.rope * p.ropes);
    else if (p.type === 'winch') add(`Winch ×${p.ratio}`, GL_COST.winch);
    else if (p.type === 'dyn') add(p.big ? 'Big dynamite' : 'Small dynamite', p.big ? GL_COST.big : GL_COST.small);
    else if (p.type === 'platform') { const P = GL_PLAT[p.size] || GL_PLAT.M; add(`${P.name} platform ${fmt(p.h, 1)} m`, Math.ceil(P.base + 2 * p.h - 1e-9)); }
  });
  const cab = legs.reduce((a, l) => a + l.cable, 0);   // the boulder's short rope is free
  if (cab > 0) add(`Cable ${fmt(cab, 1)} m`, Math.ceil(cab / 5 - 1e-9) * GL_COST.cablePer5);
  return { total, items, cable: cab };
}
/* the score out of 10 (brief section 6). Returns null points and notYet:true for a route that does not finish or pulls over 180 N. */
const GL_PULL_PTS = p => p > 180 ? null : p > 120 ? 0 : p > 80 ? 1 : p > 60 + 1e-9 ? 2 : p >= 54 ? 5 : p >= 45 ? 4 : 3;
function glScore(r, hints) {
  const notYet = !r.arrived || r.hardest > 180 + 1e-9;
  const pts = { pull: 0, cond: 0, boulder: 0, oxy: 0, budget: 0 };
  if (!notYet) { pts.pull = GL_PULL_PTS(r.hardest); if (r.rockOn) pts.pull = Math.min(2, pts.pull); }
  pts.cond = r.dmg.total <= 1e-9 ? 2 : r.dmg.total <= 25 + 1e-9 ? 1 : 0;
  pts.boulder = r.boulder.ok ? 1 : 0; pts.oxy = r.hand <= GL.oxy + 1e-9 ? 1 : 0; pts.budget = r.cost.total <= GL.budget ? 1 : 0;
  if (notYet) return { notYet: true, total: null, pts, hintCost: 0, ending: 'notyet' };
  const raw = pts.pull + pts.cond + pts.boulder + pts.oxy + pts.budget, hintCost = Math.max(0, (hints || 0) - 1), total = Math.max(1, raw - hintCost);
  return { notYet: false, raw, total, pts, hintCost, ending: r.dmg.total <= 1e-9 ? 'spotless' : 'dented' };
}
/* is run a better than run b? (best run counts: rescued beats not yet, then score, then smaller hardest pull) */
const glBetter = (a, b) => !b || (a.total != null && b.total == null) || (a.total != null && b.total != null && (a.total > b.total || (a.total === b.total && a.hardest < b.hardest)));
