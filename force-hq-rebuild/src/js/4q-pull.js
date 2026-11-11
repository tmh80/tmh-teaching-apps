/* ===== Chapter 6 Part 5: the rescue on real pulling physics (docs/Rescue_Pulling_Physics_Spec.md) =====
   Pure maths, no drawing. gpEvaluate(rig, opts) replaces glEvaluate(rig, opts) from 4f-gummylift.js and returns the same shape, plus the extras below.
   It reuses 4f's data and helpers (GL, glGround, glPlatforms, glMachine, glAddons, glCost, glScore), and reads the same saved rig, unchanged.

   The idea: the Gumdrop is a body resting on a surface (crater ground, a platform top or a ramp deck). A rope pulls it towards the rope's anchor,
   and it moves along whatever is under it, one small step at a time. At every step the model works out the force the rope needs:
       force = load × (slope part + friction part)        slope part = rise ÷ distance along; friction part = μ × run ÷ distance along
   Rough crater ground has friction and scrapes the hull. Platform decks are smooth. Ramp decks are rollers (no friction), so a ramp's
   mechanical advantage is still exactly length ÷ rise. Only a real wall stops the Gumdrop: a rise of more than GP.wallRise within GP.wallRun.

   Who pulls (each is one leg, used once, nearest first):
     ramp roped to 'ship'    anchor = the ramp's head. The Gumdrop is nudged or dragged to the foot, then rolls up the deck.
     crane roped to 'ship'   drags the Gumdrop under its hook if it has to, lifts it, the trolley carries it across and sets it down.
                             With across 0 the Gumdrop stays on the hook until the next rope takes it.
     lever, screw jack       lifts the Gumdrop when it rests within GP.reach of the machine. No rope needed.
     drag anchor (new)       a pulley block or winch that is roped to 'ship' and belongs to no machine. The Gumdrop is dragged to where it stands,
                             and every metre costs: there is no free nudge for a drag.
   Extra fields on each leg: force (the biggest force the rope needed, N), ropeMA (ropes × winches), dist (metres moved), path [{x,y,k}],
     segs [{k, len, rise, peak}], simple (the textbook sum gives the same pull), scrape/bump/fall (hull damage, %).
   Tipping: see gpTip. leg.tips [{x,y,idx,why}], leg.lying (on its side at the end of the leg), path points carry t: 1 while it lies down, dmg.tips.
   The boulder: see gpStrain. result.torn = { leg, x, y, strain } when the landing leg ripped off; dmg.torn is its damage.
   Extra fields on the result: dmg.scrape, dmg.bumps, dmg.falls (all inside dmg.total), stop.why 'wall', score.ending 'wrecked'. */
const GP = { muGround: 1 / 3, muPlat: 0.1, step: 0.25, wallRise: 1, wallRun: 0.5, kerbRun: 2, nudge: 3, level: 0.5, dropFree: 0.5, heldSlide: 3, reach: 1.5, heavy: 180,
  scrape: 1.2, bump: 6, fall: 8, wreck: 60, wreckCap: 3, legHold: 500, tear: 100, tornCap: 2, tip: 10, tipDrag: 1, tipScrape: 2 };
const gpMu = k => k === 'ramp' ? 0 : k === 'platform' ? GP.muPlat : GP.muGround;
const gpPt = S => ({ x: +S.x.toFixed(3), y: +S.y.toFixed(3) });

/* ---------- the world: ground, platforms, ramp decks ---------- */
function gpWorld(rig) {
  const { g, blasts } = glGround(rig), plats = glPlatforms(rig, g), parts = rig.parts || [];
  const ms = parts.filter(p => GL_LIFT[p.type] && p.role !== 'boulder').map(p => { const m = glMachine(p, g, plats); m.faults = m.faults.filter(f => f !== 'drop'); return m; });
  const ramps = ms.filter(m => m.type === 'ramp' && !m.faults.length && m.run > 0.01).map(m => ({ id: m.id, x0: m.start.x, y0: m.start.y, x1: m.end.x, y1: m.end.y, L: m.L, rise: m.rise }));
  return { g, blasts, plats, parts, ms, ramps };
}
/* the solid thing under x: the highest platform top, else the ground */
function gpSolid(W, x) {
  const gy = glAt(W.g, x); let best = { y: gy, kind: 'ground' };
  W.plats.forEach(q => { if (x >= q.x0 - 0.05 && x <= q.x1 + 0.05 && q.top > best.y) best = { y: q.top, kind: 'platform', id: q.id }; });
  return best;
}
const gpDeck = (r, x) => r.y0 + (r.y1 - r.y0) * clamp((x - r.x0) / (r.x1 - r.x0), 0, 1);
/* everything the Gumdrop could rest on at x: the solid, and any ramp deck over it */
function gpSurfaces(W, x, skip) {
  const s = gpSolid(W, x), out = [s];
  W.ramps.forEach(r => { if (r.id === skip || x < r.x0 - 1e-6 || x > r.x1 + 1e-6) return; const y = gpDeck(r, x); if (y >= s.y - 0.45) out.push({ y, kind: 'ramp', id: r.id }); });
  return out;
}
/* where the Gumdrop goes next: it stays on its ramp, else it takes the highest surface it can get onto (no more than wallRise above it) */
function gpPick(W, x, y, sup, skip) {
  const c = gpSurfaces(W, x, skip).filter(s => s.y <= y + GP.wallRise + 1e-6);
  if (!c.length) return null;
  if (sup && sup.kind === 'ramp') { const same = c.find(s => s.kind === 'ramp' && s.id === sup.id); if (same) return same; }
  return c.sort((a, b) => b.y - a.y)[0];
}

/* ---------- moving the Gumdrop ---------- */
function gpPush(C, S, k, F) { const L = C.leg, last = L.path[L.path.length - 1]; if (last && Math.abs(last.x - S.x) < 1e-9 && Math.abs(last.y - S.y) < 1e-9) return; L.path.push({ x: +S.x.toFixed(3), y: +S.y.toFixed(3), k, F: Math.round(F || 0), t: C.tipS.tipped ? 1 : 0 }); }
function gpLand(C, S, sup) {   // put the Gumdrop on a surface; a platform that cannot hold it gives way
  S.sup = sup; S.held = null;
  if (sup.kind === 'platform') { C.shipOn.add(sup.id); if (C.over(sup.id)) return { why: 'collapse', plat: sup.id }; }
  return null;
}
/* Tipping (Tom, 11 Nov): the Gumdrop is tall, so it falls over when it is dragged over rough crater ground (after GP.tipDrag metres), bumped over a kerb,
   or dropped more than GP.dropFree. Falling over costs GP.tip % hull. While it lies on its side, scraping over the ground costs GP.tipScrape times as much.
   A crane lift stands it up again (it hangs straight from the hook). C.tipS = { tipped, dragged } is shared by every leg of a run. */
function gpTip(C, S, why) { const T = C.tipS; if (T.tipped) return; T.tipped = true; T.dragged = 0; C.leg.tip += GP.tip; C.leg.tips.push({ x: +S.x.toFixed(2), y: +S.y.toFixed(2), idx: C.leg.path.length, why }); }
function gpFall(C, S, toY) { const d = S.y - toY; S.y = toY; if (d > GP.dropFree) { C.leg.fall += GP.fall * d; C.leg.fell += d; gpTip(C, S, 'fall'); } }
/* let go of whatever is holding the Gumdrop up: drop onto the highest surface under it */
function gpDrop(C, S) { const fl = gpSurfaces(C.W, S.x, C.skip).filter(s => s.y <= S.y + 0.05).sort((a, b) => b.y - a.y)[0] || gpSolid(C.W, S.x); gpFall(C, S, fl.y); gpPush(C, S, 'fall', 0); return gpLand(C, S, fl); }
/* the Gumdrop is on a hook, or up on a lever or jack: the new rope pulls it sideways until it is over something to stand on */
function gpUnhold(C, S, tx) {
  const dir = Math.sign(tx - S.x); let slid = 0;
  while (S.held) {
    if (Math.abs(tx - S.x) < 1e-6) return null;
    if (slid >= S.held.slide - 1e-9) return gpDrop(C, S);
    const dx = dir * Math.min(GP.step, Math.abs(tx - S.x), S.held.slide - slid), nx = S.x + dx;
    if (gpSolid(C.W, nx).y > S.y + 0.05) return { why: 'wall', wall: { x: +nx.toFixed(2), y: +gpSolid(C.W, nx).y.toFixed(2) } };
    slid += Math.abs(dx); C.leg.walked += Math.abs(dx); S.x = nx; gpPush(C, S, 'slide', 0);
    const land = gpSurfaces(C.W, nx, C.skip).filter(s => s.y <= S.y + 0.05 && s.y >= S.y - GP.dropFree).sort((a, b) => b.y - a.y)[0];
    if (land) { S.y = land.y; gpPush(C, S, 'slide', 0); return gpLand(C, S, land); }
  }
  return null;
}
/* The boulder, if it was not cleared, is jammed on the landing leg and hangs off the Gumdrop wherever it goes. The leg carries the boulder's share of
   every pull (strain = force × boulder ÷ whole load). Above GP.legHold the leg rips off: the boulder stays behind, the load drops to the ship alone,
   and the hull takes GP.tear % damage. Returns true if it just tore. */
function gpStrain(C, S, F) {
  if (!C.rock) return false; const st = F * GL.rock / C.load; C.leg.strain = Math.max(C.leg.strain, Math.min(st, GP.legHold));
  if (st <= GP.legHold + 1e-9) return false;
  C.rock = false; C.torn = { leg: C.leg.i, x: +S.x.toFixed(2), y: +S.y.toFixed(2), idx: C.leg.path.length, strain: Math.round(st) }; C.load = GL.ship; C.leg.torn = true; return true;
}
/* one bit of pulling: the force for it, whether Smooshy can manage it, and what it does to the hull */
function gpPull(C, S, nx, ny, kind, abrupt) {
  const L = C.leg, dx = nx - S.x, dy = ny - S.y, ds = Math.hypot(dx, dy);
  const free = C.nudge && kind !== 'ramp' && L.walked + Math.abs(dx) <= GP.nudge + 1e-9 && Math.abs(ny - L.y0) <= GP.level + 1e-9;   // the free nudge at the start of a leg
  let F = 0;
  if (!free && ds > 1e-9) { const sin = abrupt ? dy / Math.hypot(dy, GP.kerbRun) : dy / ds, cos = Math.sqrt(Math.max(0, 1 - sin * sin)), k = Math.max(0, sin + gpMu(kind) * cos); F = C.load * k; if (gpStrain(C, S, F)) F = C.load * k; }
  if (F / C.ropeMA > GP.heavy + 1e-9) { L.force = Math.max(L.force, F); L.forceAt = gpPt(S); return { why: 'heavy' }; }
  if (!free) { L.dist += ds; L.work += F * ds; if (F > L.force + 1e-9) { L.force = F; L.forceAt = { x: +nx.toFixed(2), y: +ny.toFixed(2) }; L.forceOn = kind; }
    if (abrupt) L.bump += GP.bump * dy; if (kind !== 'ramp') L.rough += ds;
    if (kind === 'ground') { const T = C.tipS; L.scrape += GP.scrape * ds * (T.tipped ? GP.tipScrape : 1); if (!T.tipped) T.dragged += ds; } }
  L.walked += Math.abs(dx); S.x = nx; S.y = ny;
  if (!free && (abrupt || (kind === 'ground' && C.tipS.dragged >= GP.tipDrag - 1e-9))) gpTip(C, S, abrupt ? 'bump' : 'drag');
  gpPush(C, S, free ? 'nudge' : kind, F);
  return null;
}
/* drag the Gumdrop along the surface until it is at tx. Returns why it stopped, or null if it got there. */
function gpWalk(C, S, tx) {
  if (S.held) { const r = gpUnhold(C, S, tx); if (r) return r; if (S.held) return null; }
  const dir = Math.sign(tx - S.x); let guard = 0;
  while (Math.abs(tx - S.x) > 1e-6 && guard++ < 4000) {
    const left = Math.abs(tx - S.x), nx = S.x + dir * Math.min(GP.step, left), c = gpPick(C.W, nx, S.y, S.sup, C.skip);
    const lx = S.x + dir * Math.min(GP.wallRun, left), la = gpPick(C.W, lx, S.y, S.sup, C.skip);
    if (!c || !la) { const wx = c ? lx : nx; return { why: 'wall', wall: { x: +wx.toFixed(2), y: +gpSolid(C.W, wx).y.toFixed(2) } }; }
    const dy = c.y - S.y;
    if (dy < -GP.dropFree) { C.leg.walked += Math.abs(nx - S.x); S.x = nx; gpFall(C, S, c.y); gpPush(C, S, 'fall', 0); const r = gpLand(C, S, c); if (r) return r; continue; }
    if (c.kind === 'platform' && C.over(c.id)) { C.shipOn.add(c.id); return { why: 'collapse', plat: c.id }; }
    const r = gpPull(C, S, nx, c.y, c.kind, dy > 0.3 && dy / Math.abs(nx - S.x) > 2); if (r) return r;
    S.sup = c; if (c.kind === 'platform') C.shipOn.add(c.id);
  }
  return null;
}

/* ---------- the four kinds of leg ---------- */
function gpRampLeg(C, S, m) {
  const r = C.W.ramps.find(q => q.id === m.id), L = C.leg; L.mma = m.ma;
  if (S.x > r.x1 + 1e-6) return gpWalk(C, S, r.x1) || (S.held ? gpDrop(C, S) : null);   // the Gumdrop is already past the top: just a drag back to it
  const inside = !S.held && S.x >= r.x0 - 1e-6, nearFoot = Math.abs(S.x - r.x0) <= GP.nudge + 1e-9 && Math.abs(S.y - r.y0) <= GP.level + 1e-9;
  if (inside && !nearFoot && Math.abs(gpDeck(r, S.x) - S.y) <= GP.wallRise) { S.y = gpDeck(r, S.x); gpPush(C, S, 'nudge', 0); }   // it joins the ramp part-way up
  else {
    C.skip = r.id; const w = gpWalk(C, S, r.x0) || (S.held ? gpDrop(C, S) : null); C.skip = null; if (w) return w;
    const dy = r.y0 - S.y;
    if (dy > GP.wallRise + 1e-6) return { why: 'wall', wall: { x: r.x0, y: r.y0 } };
    if (dy < -GP.dropFree) gpFall(C, S, r.y0);
    else if (dy > GP.level) { const q = gpPull(C, S, S.x, r.y0, 'platform', true); if (q) return q; }
    S.y = r.y0; gpPush(C, S, 'nudge', 0);
    L.full = true;
  }
  S.sup = { kind: 'ramp', id: r.id }; S.held = null;
  const F = C.load * r.rise / r.L; let guard = 0;
  while (S.x < r.x1 - 1e-6 && guard++ < 400) { const nx = Math.min(r.x1, S.x + GP.step), q = gpPull(C, S, nx, gpDeck(r, nx), 'ramp', false); if (q) return q; }
  L.simple = !!L.full && L.rough < 1e-9 && Math.abs(L.force - F) < 0.5;
  const top = glSupport(r.x1, r.y1, C.W.g, C.W.plats); if (top) { const q = gpLand(C, S, top); if (q) return q; }   // at the top it rests on whatever holds the ramp's head
  return null;
}
function gpCraneLeg(C, S, m) {
  const p = m.part, L = C.leg, ac = p.across || 0; L.mma = 1;
  if (m.base && m.base.kind === 'platform' && C.over(m.base.id)) return { why: 'collapse', plat: m.base.id };
  const w = gpWalk(C, S, p.x); if (w) return w;
  gpStrain(C, S, C.load);   // a straight lift hangs the whole boulder off the leg
  if (C.load / C.ropeMA > GP.heavy + 1e-9) { L.force = Math.max(L.force, C.load); L.forceAt = gpPt(S); return { why: 'heavy' }; }
  L.simple = L.rough < 1e-9;
  const top = S.y + p.rise; L.dist += p.rise; L.work += C.load * p.rise; if (C.load > L.force) { L.force = C.load; L.forceAt = gpPt(S); L.forceOn = 'lift'; }
  C.tipS.tipped = false; C.tipS.dragged = 0;   // hanging from the hook, it is upright again
  while (S.y < top - 1e-6) { S.y = Math.min(top, S.y + GP.step); gpPush(C, S, 'lift', C.load); }
  S.sup = null; S.held = { slide: GL.craneAcross, by: p.id }; L.lifted = gpPt(S);
  if (!ac) return null;
  const tx = clamp(p.x + ac, 0, GL.W), dir = Math.sign(tx - S.x);
  while (Math.abs(tx - S.x) > 1e-6) { const nx = S.x + dir * Math.min(GP.step, Math.abs(tx - S.x)), sol = gpSolid(C.W, nx); if (sol.y > S.y + 0.05) return { why: 'wall', wall: { x: +nx.toFixed(2), y: +sol.y.toFixed(2) } }; S.x = nx; gpPush(C, S, 'across', 0); }
  const fl = gpSurfaces(C.W, S.x, null).filter(s => s.y <= S.y + 0.05).sort((a, b) => b.y - a.y)[0]; S.y = fl.y; gpPush(C, S, 'lower', 0);
  return gpLand(C, S, fl);
}
function gpLiftLeg(C, S, m) {   // lever or screw jack under the Gumdrop
  const p = m.part, L = C.leg; L.mma = m.ma; L.simple = true;
  if (m.base && m.base.kind === 'platform' && C.over(m.base.id)) return { why: 'collapse', plat: m.base.id };
  gpStrain(C, S, C.load);
  if (C.load / (m.ma * C.ropeMA) > GP.heavy + 1e-9) { L.force = C.load; return { why: 'heavy' }; }
  L.force = C.load; L.forceAt = gpPt(S); L.forceOn = 'lift'; L.dist = p.rise; L.work = C.load * p.rise;
  const top = S.y + p.rise; while (S.y < top - 1e-6) { S.y = Math.min(top, S.y + GP.step); gpPush(C, S, 'lift', C.load); }
  S.sup = null; S.held = { slide: GP.heldSlide, by: p.id }; return null;
}
const gpDragLeg = (C, S, a) => { C.leg.mma = 1; return gpWalk(C, S, a.x) || (S.held ? gpDrop(C, S) : null); };

/* pulley blocks and winches that are roped to the Gumdrop and belong to no machine: each chain is a drag anchor, standing where its first part stands */
function gpAnchors(rig, W) {
  const owned = new Set(); W.ms.forEach(m => glAddons(rig, m.id).chain.forEach(p => owned.add(p.id)));
  (rig.parts || []).filter(p => p.role === 'boulder').forEach(p => glAddons(rig, p.id).chain.forEach(q => owned.add(q.id)));
  const roped = id => (rig.cables || []).some(c => (c.a === 'ship' && c.b === id) || (c.b === 'ship' && c.a === id)), out = [], seen = new Set();
  (rig.parts || []).forEach(p => { if ((p.type !== 'block' && p.type !== 'winch') || owned.has(p.id) || seen.has(p.id) || !roped(p.id) || p.x == null) return;
    const ad = glAddons(rig, p.id), chain = [p].concat(ad.chain); chain.forEach(q => seen.add(q.id));
    const blocks = chain.filter(q => q.type === 'block'), winches = chain.filter(q => q.type === 'winch'), faults = ad.faults.slice();
    if (blocks.length > 1 && !faults.includes('blocks')) faults.push('blocks'); if (winches.length > GL.winchMax && !faults.includes('winches')) faults.push('winches');
    out.push({ id: p.id, type: 'drag', x: p.x, base: glFloorKind(p.x, W.g, W.plats), chain, faults, ropes: blocks.length ? clamp(blocks[0].ropes | 0, 1, GL.ropesMax) : 1, winches: winches.slice(0, GL.winchMax).map(w => w.ratio) }); });
  return out;
}
function gpBoulder(rig, parts, blasts, ship0) {
  const bRock = blasts.filter(b => Math.abs(b.x - GL.boulderX) <= b.r + 0.6); let boulder = { how: null, pull: null, ok: false, ma: 0 };
  const bm = parts.find(p => p.role === 'boulder' && (p.type === 'lever' || p.type === 'jack')), bc = (rig.cables || []).find(c => c.a === 'boulder' || c.b === 'boulder');
  if (bRock.length) boulder = { how: 'blast', ok: true, pull: 0, ma: 0 };
  else if (bm) { const ad = glAddons(rig, bm.id), ma = (bm.type === 'jack' ? GL.jackMA : glLeverMA(bm)) * (bm.type === 'jack' ? 1 : ad.ropes * ad.wm); boulder = { how: bm.type, id: bm.id, ma, pull: GL.boulderN / ma, ok: GL.boulderN / ma <= GL.pullOk + 1e-9 }; }
  else if (bc) { const ad = glAddons({ parts, cables: (rig.cables || []).map(c => ({ a: c.a === 'boulder' ? '__b' : c.a, b: c.b === 'boulder' ? '__b' : c.b })) }, '__b'), ma = ad.ropes * ad.wm; if (ad.cabled) boulder = { how: 'winch', ma, pull: GL.boulderN / ma, ok: GL.boulderN / ma <= GL.pullOk + 1e-9 }; }
  return boulder;
}
/* the path as a few plain stretches, for the route strip */
function gpSegs(path, at) {
  const segs = []; let px = at.x, py = at.y;
  path.forEach(q => { const len = Math.hypot(q.x - px, q.y - py); let s = segs[segs.length - 1]; if (!s || s.k !== q.k) { s = { k: q.k, len: 0, rise: 0, peak: 0 }; segs.push(s); } s.len += len; s.rise += q.y - py; s.peak = Math.max(s.peak, q.F); px = q.x; py = q.y; });
  return segs.filter(s => s.len > 0.01).map(s => ({ k: s.k, len: +s.len.toFixed(2), rise: +s.rise.toFixed(2), peak: s.peak }));
}

/* ---------- the whole rig ---------- */
function gpEvaluate(rig, opts) {
  opts = opts || {}; rig = rig || { parts: [], cables: [] };
  const W = gpWorld(rig), { g, blasts, plats, parts, ms } = W, ship0 = { x: GL.shipX, y: glAt(g, GL.shipX) };
  const bShip = blasts.filter(b => Math.hypot(b.x - GL.shipX, b.y - ship0.y) <= GL.nearShip), boulder = gpBoulder(rig, parts, blasts, ship0);
  const rockOn = !boulder.ok, anchors = gpAnchors(rig, W); let load = GL.ship + (rockOn ? GL.rock : 0), torn = null;
  /* what each platform already carries: the machines standing on it */
  const onPlat = (b, pl) => b && b.kind === 'platform' && b.id === pl.id, wt = {};
  plats.forEach(pl => { let n = 0;
    ms.concat(parts.filter(p => p.role === 'boulder' && GL_LIFT[p.type]).map(p => glMachine(p, g, plats))).forEach(m => { if (!onPlat(m.base, pl)) return; if (m.type !== 'ramp') n += GL_WT[m.type]; n += glAddons(rig, m.id).chain.reduce((a, p) => a + GL_WT[p.type], 0); });
    anchors.forEach(a => { if (onPlat(a.base, pl)) n += a.chain.reduce((s, p) => s + GL_WT[p.type], 0); }); wt[pl.id] = n; });
  const shipOn = new Set(), over = id => { const pl = plats.find(q => q.id === id); return !!pl && wt[id] + load > pl.holds + 1e-9; };
  /* every rope that could pull the Gumdrop */
  const pullers = [];
  ms.forEach(m => { const ad = glAddons(rig, m.id), faults = m.faults.concat(ad.faults); if (m.type === 'jack' && ad.cabled) faults.push('jackcable');
    const roped = GL_ROPED[m.type] ? glRoped(rig, m.id, ad) : true;
    pullers.push({ id: m.id, type: m.type, m, roped, faults, ropes: m.type === 'jack' ? 1 : ad.ropes, winches: ad.winches.slice(0, GL.winchMax).map(w => w.ratio), addons: ad.chain.map(p => p.id) }); });
  anchors.forEach(a => pullers.push({ id: a.id, type: 'drag', a, roped: true, faults: a.faults, ropes: a.ropes, winches: a.winches, addons: a.chain.slice(1).map(p => p.id) }));
  const S = { x: ship0.x, y: ship0.y, sup: gpSolid(W, ship0.x), held: null }, used = new Set(), legs = [], tipS = { tipped: false, dragged: 0 };
  const beamSees = p => p.y >= glMaxRight(g, p.x) - GL.hzY - 1e-9;
  const target = u => u.type === 'ramp' ? u.m.end : u.type === 'drag' ? { x: u.a.x, y: u.a.base.y } : u.type === 'crane' ? { x: u.m.part.x + (u.m.part.across || 0), y: S.y + u.m.rise } : { x: u.m.part.x, y: S.y + u.m.rise };
  const gap = u => u.type === 'ramp' ? (S.x < u.m.start.x ? u.m.start.x - S.x : S.x > u.m.end.x ? S.x - u.m.end.x : 0) : Math.abs((u.type === 'drag' ? u.a.x : u.m.part.x) - S.x);
  let stop = null, arrived = false;
  for (let guard = 0; guard < 14; guard++) {
    if (legs.length && beamSees(S)) { arrived = true; break; }
    const cand = pullers.filter(u => { if (used.has(u.id) || !u.roped) return false; const t = target(u);
      if (u.type === 'lever' || u.type === 'jack') return !S.held && gap(u) <= GP.reach + 1e-9 && Math.abs(u.m.start.y - S.y) <= GP.wallRise && u.m.rise > 0;
      if (u.type === 'ramp' && u.m.faults.length) return gap(u) <= GP.nudge + 1e-9;   // a broken ramp only matters if it is the next thing in the route
      if (Math.abs(t.x - S.x) < 0.01 && u.type !== 'crane') return false;             // nothing to pull: the Gumdrop is already there
      return t.x > S.x - 0.01 || t.y > S.y - GP.level; })                              // Smooshy never works a machine that only drags the ship back down
      .sort((a, b) => (gap(a) - gap(b)) || (target(b).y - target(a).y));
    if (!cand.length) break;
    const u = cand[0]; used.add(u.id);
    const ropeMA = u.ropes * u.winches.reduce((a, w) => a * w, 1);
    const leg = { i: legs.length, id: u.id, type: u.type, roped: true, at: gpPt(S), y0: S.y, m: u.m || null, ropes: u.ropes, winches: u.winches, ropeMA, load, addons: u.addons, faults: u.faults.slice(),
      path: [], strain: 0, torn: false, tip: 0, tips: [], lying: false, force: 0, forceAt: null, forceOn: null, dist: 0, work: 0, walked: 0, rough: 0, scrape: 0, bump: 0, fall: 0, fell: 0, mma: 1, simple: false, full: false };
    legs.push(leg); leg.start = gpPt(S);
    let r = null;
    if (leg.faults.length) r = { why: 'broken', faults: leg.faults };
    else { const C = { W, load, ropeMA, leg, shipOn, over, tipS, skip: null, rock: rockOn && !torn, torn: null, nudge: u.type !== 'drag' };   // a winch post gets no free nudge: a bare rope moves nothing
      r = u.type === 'ramp' ? gpRampLeg(C, S, u.m) : u.type === 'crane' ? gpCraneLeg(C, S, u.m) : u.type === 'drag' ? gpDragLeg(C, S, u.a) : gpLiftLeg(C, S, u.m);
      if (C.torn) { torn = C.torn; load = GL.ship; leg.simple = false; } }
    const lift = u.type === 'lever' || u.type === 'jack';
    leg.lying = tipS.tipped; leg.end = gpPt(S); leg.rise = +(leg.end.y - leg.start.y).toFixed(3); leg.held = !!S.held; leg.segs = gpSegs(leg.path, leg.start);
    leg.ma = lift ? leg.mma * ropeMA : leg.simple ? leg.mma * ropeMA : ropeMA;      // simple legs: machine MA × ropes × winches, as students work it out
    leg.pull = lift ? load / leg.ma : leg.force / ropeMA;
    leg.hand = lift ? leg.ma * leg.dist : ropeMA * leg.dist; leg.cable = u.type === 'jack' ? 0 : u.ropes * leg.dist;
    leg.given = !leg.simple;                                                          // the route strip has to give this leg's force: students cannot work it out
    ['dist', 'work', 'hand', 'scrape', 'bump', 'fall', 'fell', 'rough', 'tip'].forEach(k => { leg[k] = +leg[k].toFixed(3); });
    if (r) { stop = Object.assign({ at: gpPt(S), leg: leg.i }, r); leg.stopped = true; break; }
  }
  if (!stop && !arrived) { if (beamSees(S) && legs.length) arrived = true; else { const idle = pullers.filter(u => !used.has(u.id) && !u.roped && (u.type === 'ramp' || u.type === 'crane'));
    const bust = pullers.filter(u => !used.has(u.id) && u.roped && u.faults.length);   // nothing ran, and a roped machine is broken: say so
    stop = { why: bust.length ? 'broken' : legs.length ? 'gap' : idle.length ? 'norope' : 'none', at: gpPt(S), leg: legs.length, unroped: idle.map(u => u.id) }; if (stop.why === 'broken') { stop.faults = bust[0].faults; stop.id = bust[0].id; } } }
  const done = arrived && !stop;
  const loads = plats.map(pl => ({ id: pl.id, top: pl.top, base: pl.base, x0: pl.x0, x1: pl.x1, holds: pl.holds, machines: wt[pl.id], ship: shipOn.has(pl.id), load: wt[pl.id] + (shipOn.has(pl.id) ? load : 0) }));
  loads.forEach(L => { L.over = L.load > L.holds + 1e-9; });
  const moved = legs.filter(l => l.dist > 0 || l.path.length), hardest = moved.length ? Math.max(...moved.map(l => l.pull)) : load;
  const hand = legs.reduce((a, l) => a + l.hand, 0), workJ = legs.reduce((a, l) => a + l.work, 0);
  let thr = 0; legs.forEach(l => { l.thruster = l.pull > GL.pullOk + 1e-9 ? Math.min(100, (Math.min(l.pull, GP.heavy) - GL.pullOk) / 120 * 100) : 0; thr += l.thruster; });
  const sum = k => legs.reduce((a, l) => a + l[k], 0);
  const dmg = { thrusters: thr, rock: rockOn && !torn ? 25 : 0, torn: torn ? GP.tear : 0, blasts: bShip.length * 15, scrape: sum('scrape'), bumps: sum('bump'), falls: sum('fall'), tips: sum('tip') };
  dmg.total = Math.min(100, dmg.thrusters + dmg.rock + dmg.torn + dmg.blasts + dmg.scrape + dmg.bumps + dmg.falls + dmg.tips);
  const cost = glCost(rig, legs, boulder), ghosts = legs.filter(l => l.i >= 1).map(l => ({ x: l.at.x, y: l.at.y, after: l.i }));
  const res = { ok: done, arrived: done, stop: done ? null : stop, ghost: !done && stop && legs.length ? gpPt(S) : null, ghosts, legs, ran: legs.filter(l => !l.stopped), hardest, hand, work: workJ, load: GL.ship + (rockOn ? GL.rock : 0), rockOn, torn, boulder, blasts,
    bShip: bShip.length, dmg, tipped: tipS.tipped, tips: [].concat(...legs.map(l => l.tips.map(t => Object.assign({ leg: l.i }, t)))), cost, crest: glCrest(g), plats: loads, ground: g, ship0, final: gpPt(S), held: !!S.held, used: [...used], spare: pullers.filter(u => !used.has(u.id)).map(u => u.id) };
  res.score = gpScore(res, opts.hints || 0, !!opts.maths);
  return res;
}
/* the score: as glScore, and a rescue that leaves the hull GP.wreck % damaged or worse is "wrecked" and can score GP.wreckCap at most */
function gpScore(r, hints, maths) {
  const s = glScore(r, hints, maths); if (s.notYet) return s;
  if (r.dmg.total >= GP.wreck - 1e-9) { s.ending = 'wrecked'; s.total = Math.max(1, Math.min(s.total, GP.wreckCap)); }
  if (r.torn) { s.ending = 'torn'; s.total = Math.max(1, Math.min(s.total, GP.tornCap)); }   // pulled apart by the boulder: always below any rescue that cleared it
  return s;
}
