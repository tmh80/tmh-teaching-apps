/* ===== Operation Gummy Lift: the builder (stage 2). Free-form drag and drop like Poly Bridge: a tray of parts, handles,
   stretchy cables, tap-a-part menus, a ruler, zoom and pan, and the sugar-crystal budget. Mouse and touch (pointer events).
   The rig autosaves to chal.c6e.gl.rig after every change (stage 4 adds resume details and the snapshot). Run Rescue lives in 4i. */
const GL_TRAY = [
  { t: 'ramp', name: 'Ramp', cost: '3 per m', icon: '📐' }, { t: 'crane', name: 'Crane gantry', cost: '40', wt: '1,000 N', icon: '🏗️' },
  { t: 'lever', name: 'Lever', cost: '25', wt: '500 N', icon: '⚖️' }, { t: 'jack', name: 'Screw jack', cost: '60', wt: '400 N', icon: '🔩' },
  { t: 'block', name: 'Pulley block', cost: '10 per rope', wt: '100 N', icon: '⚙️' }, { t: 'winch', name: 'Winch', cost: '15', wt: '100 N', icon: '🎡' },
  { t: 'platS', name: 'Small platform', cost: '10 + 2 per m', icon: '▫️' }, { t: 'platM', name: 'Medium platform', cost: '20 + 2 per m', icon: '◻️' },
  { t: 'platL', name: 'Large platform', cost: '35 + 2 per m', icon: '⬜' }, { t: 'dynS', name: 'Small dynamite', cost: '20', icon: '🧨' }, { t: 'dynB', name: 'Big dynamite', cost: '40', icon: '💥' }];
const GL_FAULT = { long: 'This ramp is longer than 30 m.', steep: 'Too steep! A ramp can rise at most half its length.', ground: 'This ramp runs into the ground. Move it, use a platform, or blast the ground away.',
  head: 'The top of this ramp is floating in mid-air. Rest it on the ground or on a platform.', rise: 'This machine can\'t lift that far.', fulcrum: 'A lever\'s mechanical advantage can be 9 at most. Move the fulcrum.',
  norope: 'This machine isn\'t roped to the Gumdrop yet. Drag a rope from its ◉ to the Gumdrop\'s ◉, or press the rope button.', tangle: 'Its cables branch off two ways. Each machine needs one chain of cables.', blocks: 'Only one pulley block per machine.', winches: 'Two winches per machine at most.', jackcable: 'A screw jack works on its own, with no cable.' };
const GLR = { on: false };   // Run Rescue state (4i-glrun.js fills it in)
const GL_PLATMSG = 'Move the machine first, then add the platform.';
const GLB = { rig: null, ev: null, dockId: null, flash: null, hist: [], sel: null, drag: null, ruler: null, rulerOn: false, place: null, cv: null, raf: 0, onChange: null, readOnly: false, mid: 'gl', ch: 'c6e' };
const glNewId = t => t[0] + Math.random().toString(36).slice(2, 7);
const glSnap = (v, s) => Math.round(v / (s || 0.5)) * (s || 0.5);
const glState = () => (dbGet('chal.' + GLB.ch, {})[GLB.mid]) || {};
function glSaveRig() { const st = dbGet('chal.' + GLB.ch, {}); st[GLB.mid] = Object.assign(st[GLB.mid] || {}, { rig: GLB.rig, at: Date.now(), view: { z: GLV.z, cx: GLV.cx, cy: GLV.cy, LH: GLV.LH } }); dbSet('chal.' + GLB.ch, st); }
/* winches are bolted down: they sit on the ground or a platform, so Smooshy can stand at the handle */
function glSettle() { const g = glGround(GLB.rig).g, pl = glPlatforms(GLB.rig, g);
  /* an add-on with no spot yet (from an older save or a test rig) parks beside its machine's cable dot */
  GLB.rig.parts.filter(p => GL_LIFT[p.type]).forEach(m => { const cp = glCablePoint(m, glMachine(m, g, pl)); if (cp) glChainOf(m.id).forEach((id, i) => { const q = glPart(id); if (q.x == null) { q.x = cp.x + 1.6 * (i + 1); q.y = cp.y; } }); });
  GLB.rig.parts.filter(p => glIsAddon(p) && p.x == null).forEach((p, i) => { p.x = 20 + i * 2; p.y = 12; });
  GLB.rig.parts.filter(p => p.type === 'winch').forEach(p => { p.y = +(glFloorAt(p.x, g, pl) + 0.75).toFixed(2); }); }
function glChanged(noHist) {
  glSettle(); GLB.ev = glEvaluate(GLB.rig, { hints: glState().hints || 0 }); glSaveRig(); glPaintSide(); glPaintDock(); if (GLB.onChange) GLB.onChange();
}
function glPush() { GLB.hist.push(JSON.stringify(GLB.rig)); if (GLB.hist.length > 40) GLB.hist.shift(); }
const glPart = id => GLB.rig.parts.find(p => p.id === id);
const glGround0 = () => GLB.ev ? GLB.ev.ground : glGround(GLB.rig).g;
const glPlats0 = () => glPlatforms(GLB.rig, glGround0());
/* the add-on chain hanging off a machine (or the boulder), in cable order */
function glChainOf(id) { const ad = glAddons(GLB.rig, id); return ad.chain.map(p => p.id); }
function glChainEnd(id) { const ch = glChainOf(id); return ch.length ? ch[ch.length - 1] : id; }
const glIsAddon = p => p && (p.type === 'block' || p.type === 'winch');
const glOwner = id => { for (const p of GLB.rig.parts) if (GL_LIFT[p.type] && glChainOf(p.id).includes(id)) return p.id; if (glChainOf('boulder').includes(id)) return 'boulder'; return null; };
function glConnect(a, b) {
  if (a === b || GLB.rig.cables.some(c => (c.a === a && c.b === b) || (c.a === b && c.b === a))) return false;
  if (a === 'ship' || b === 'ship') {   /* a rope to the Gumdrop's hook: a ramp, a crane, or one of their pulley blocks or winches */
    const o = glPart(a === 'ship' ? b : a);
    if (!o || o.role === 'boulder' || !(GL_ROPED[o.type] || glIsAddon(o))) { toast(o && (o.type === 'lever' || o.type === 'jack') ? 'The Gumdrop rests on a lever or a screw jack, so it needs no rope.' : 'The Gumdrop\'s rope goes on a ramp, a crane gantry, a pulley block or a winch.'); return false; }
    GLB.rig.cables.push({ a: 'ship', b: o.id }); return true; }
  const pa = glPart(a), pb = glPart(b), mach = x => x === 'boulder' || (glPart(x) && GL_LIFT[glPart(x).type]);
  if ((mach(a) && mach(b)) || (!glIsAddon(pa) && !glIsAddon(pb))) { toast('Cables join a machine to a pulley block or a winch, or one add-on to the next.'); return false; }
  GLB.rig.cables.push({ a, b }); return true;
}
/* ---------- placing a new part ---------- */
/* the loads a machine can be roped to: the Gumdrop at the start, and the ghost Gumdrop after the last leg that works */
function glLoadSpots() { const ev = GLB.ev; return [{ x: ev.ship0.x, y: ev.ship0.y, leg: 0 }].concat((ev.ghosts || []).map(g => ({ x: g.x, y: g.y, leg: g.after }))); }
const glShipDots = () => glLoadSpots().map(sp => ({ x: sp.x, y: sp.y + GL_HOOK, spot: sp }));
/* would a platform here sit under a machine that is already placed? (machines that stand on THIS platform are fine) */
function glPlatBlocked(c) {
  const g = glGround0(), others = GLB.rig.parts.filter(p => p.id !== c.id), pl0 = glPlatforms({ parts: others, cables: [] }, g), P = GL_PLAT[c.size] || GL_PLAT.M, x0 = c.x - P.w / 2, x1 = c.x + P.w / 2; let base = 0;
  for (let x = x0; x <= x1 + 1e-9; x += 0.5) base = Math.max(base, glAt(g, x)); const top = base + c.h;
  return others.filter(p => GL_LIFT[p.type]).some(p => { const m = glMachine(p, g, pl0), mine = !!c.id && [m.base, m.footOn, m.headOn].some(q => q && q.id === c.id);
    if (mine) return false;
    if (p.type === 'ramp') { for (let t = 0; t <= 1.0001; t += 0.02) { const x = m.start.x + (m.end.x - m.start.x) * t, y = m.start.y + (m.end.y - m.start.y) * t; if (x >= x0 - 0.1 && x <= x1 + 0.1 && y >= base - 0.2 && y <= top + 0.35) return true; } return false; }
    const b = glBounds(p, m, g, pl0); return b.x1 >= x0 && b.x0 <= x1 && b.y1 >= base && b.y0 <= top + 0.3; });
}
function glPlatFlash(c) { GLB.flash = { c, until: performance.now() + 1800 }; toast(GL_PLATMSG); }
function glAddPart(t, wx, wy) {
  const g = glGround0(), pl = glPlats0(), fl = x => glFloorAt(x, g, pl), x = clamp(glSnap(wx), 1, GL.W - 1); let p, roped = false;
  if (t === 'ramp') p = { type: 'ramp', x1: x, y1: fl(x), L: 12, rise: 3 };
  else if (t === 'crane') p = { type: 'crane', x, rise: 4 };
  else if (t === 'lever') p = { type: 'lever', x, arm: 2, rise: 1, dir: 1 };
  else if (t === 'jack') p = { type: 'jack', x, rise: 1 };
  else if (t === 'block') p = { type: 'block', ropes: 2, x: glSnap(wx, 0.25), y: glSnap(wy, 0.25) };
  else if (t === 'winch') p = { type: 'winch', ratio: 4, x: glSnap(wx, 0.25), y: glSnap(wy, 0.25) };
  else if (t.startsWith('plat')) { p = { type: 'platform', size: t[4], x, h: 2 }; if (glPlatBlocked(p)) { glPlatFlash(p); return; } }
  else if (t.startsWith('dyn')) p = { type: 'dyn', big: t === 'dynB', x };
  if (!p) return; glPush(); p.id = glNewId(p.type); GLB.rig.parts.push(p);
  if (p.type === 'lever' || p.type === 'jack') glBoulderSnap(p);
  /* dropped by a load: a ramp's foot and a crane's legs snap to the Gumdrop (or the ghost) and the rope clips on */
  if (GL_ROPED[p.type]) { const sp = glLoadSpots().filter(q => Math.abs(q.x - wx) <= 6 && Math.abs(q.y - wy) <= 7).sort((a, b) => Math.hypot(a.x - wx, a.y - wy) - Math.hypot(b.x - wx, b.y - wy))[0];
    if (sp) { if (p.type === 'ramp') { p.x1 = +(sp.x + 1.5).toFixed(2); p.y1 = +glFloorAt(p.x1, g, pl).toFixed(2); } else p.x = +sp.x.toFixed(2); GLB.rig.cables.push({ a: p.id, b: 'ship' }); roped = true; } }
  let hooked = false;
  if (p.type === 'block') { const dot = glShipDots().filter(d => Math.hypot(d.x - wx, d.y - wy) <= 2.6).sort((a, b) => Math.hypot(a.x - wx, a.y - wy) - Math.hypot(b.x - wx, b.y - wy))[0];
    if (dot) { p.x = +dot.x.toFixed(2); p.y = +(dot.y + 1.1).toFixed(2); GLB.rig.cables.push({ a: p.id, b: 'ship' }); roped = true; hooked = true;
      const m = GLB.rig.parts.find(q => GL_ROPED[q.type] && !glChainOf(q.id).length && Math.abs(glMachine(q, g, pl).start.x - dot.spot.x) <= GL.hzX + 1e-9 && Math.abs(glMachine(q, g, pl).start.y - dot.spot.y) <= GL.hzY + 1e-9);
      if (m) { GLB.rig.cables = GLB.rig.cables.filter(c => !(c.b === 'ship' && c.a === m.id) && !(c.a === 'ship' && c.b === m.id)); GLB.rig.cables.push({ a: m.id, b: p.id }); } } }
  if (glIsAddon(p) && !hooked) glAutoAttach(p);
  GLB.sel = p.id; GLB.dockId = p.id; glChanged(); if (roped) toast('✓ Roped to the Gumdrop!', 'ok');
}
/* a lever or jack works on the boulder when ANY part of it overlaps the boulder (Tom, 8 Nov 2026: it used to test only the lever's load end, so a bar lying across the boulder did not snap).
   Returns true the moment it newly snaps on, so the caller can show the tick. */
const GL_ROCK = { x0: 17.4, x1: 20.3 };
function glOverRock(p) {
  const d = p.dir || 1, a = p.type === 'lever' ? Math.min(p.x, p.x + d * GL.beam) - 0.3 : p.x - 0.8, b = p.type === 'lever' ? Math.max(p.x, p.x + d * GL.beam) + 0.3 : p.x + 0.8;
  return a <= GL_ROCK.x1 && b >= GL_ROCK.x0 && glAt(glGround0(), 18.2) < 0.5;
}
function glBoulderSnap(p) { const was = p.role === 'boulder';
  if (glOverRock(p)) { p.role = 'boulder'; p.x = 18.2; if (p.type === 'lever') p.dir = 1; if (!was) { toast(`✓ ${p.type === 'lever' ? 'Lever' : 'Screw jack'} on the boulder!`); return true; } } else delete p.role;
  return false; }
/* an add-on dropped near a machine's cable point (or the end of its chain) clips on */
function glAutoAttach(p) {
  if (glOwner(p.id)) return; let best = null, bd = 4.5;
  const g = glGround0(), pl = glPlats0(), byId = {}; GLB.rig.parts.forEach(q => byId[q.id] = q);
  GLB.rig.parts.filter(q => GL_LIFT[q.type] && q.type !== 'jack').concat([{ id: 'boulder' }]).forEach(q => {
    const end = glChainEnd(q.id), ep = end === 'boulder' ? { x: 18.9, y: glAt(g, 18.7) + 1 } : glCablePoint(byId[end], GL_LIFT[byId[end].type] ? glMachine(byId[end], g, pl) : null);
    const d = Math.hypot(ep.x - p.x, ep.y - p.y); if (d < bd) { bd = d; best = { end, ep }; } });
  if (best) { GLB.rig.cables.push({ a: best.end, b: p.id }); p.x = glSnap(best.ep.x + 1.6, 0.25); p.y = glSnap(best.ep.y + (p.type === 'winch' ? -0.6 : 0.4), 0.25); }
}
function glRemove(id) {
  glPush(); GLB.rig.parts = GLB.rig.parts.filter(p => p.id !== id); GLB.rig.cables = GLB.rig.cables.filter(c => c.a !== id && c.b !== id);
  glDropOrphans(); GLB.sel = null; glCloseMenu(); glChanged();
}
/* Tom, 9 Nov 2026: take a machine away and the pulley block or winch clipped to it must not hang in mid-air. Any add-on with nothing holding it up (no cable chain to a machine, the Gumdrop or the boulder)
   falls to the floor under it, ground or platform, with a short drop (instant with reduced motion; GLB.fall holds the animation, the rig already has the final spot). A cable that no longer joins two things is removed. */
function glDropOrphans() {
  const rig = GLB.rig, ids = new Set(rig.parts.map(p => p.id).concat(['ship', 'boulder']));
  rig.cables = (rig.cables || []).filter(c => ids.has(c.a) && ids.has(c.b));
  const held = new Set(['ship', 'boulder'].concat(rig.parts.filter(p => GL_LIFT[p.type]).map(p => p.id))); let grew = true;
  while (grew) { grew = false; rig.cables.forEach(c => { if (held.has(c.a) !== held.has(c.b)) { held.add(c.a); held.add(c.b); grew = true; } }); }
  const orphans = rig.parts.filter(p => glIsAddon(p) && !held.has(p.id)); if (!orphans.length) return [];
  const g = glGround(rig).g, pl = glPlatforms(rig, g), now = performance.now(); GLB.fall = GLB.fall || {};
  orphans.forEach(p => { const y1 = +(glFloorAt(p.x, g, pl) + (p.type === 'winch' ? 0.7 : 0.8)).toFixed(2); if (y1 < p.y - 1e-6) { if (!RMOTION) GLB.fall[p.id] = { y0: p.y, t0: now, dur: Math.min(900, 300 + 140 * Math.sqrt(p.y - y1)) }; p.y = y1; } });
  return orphans.map(p => p.id);
}
/* ---------- the canvas: sizing, the draw loop and hit tests ---------- */
function glSize() {
  const cv = GLB.cv; if (!cv) return; const w = cv.getBoundingClientRect().width || 900, narrow = w < 560, LH = narrow ? 760 : GLV.wide;
  if (GLV.LH !== LH) { GLV.LH = LH; if (narrow) { GLV.z = 3.2; GLV.cx = 24; GLV.cy = 10; } else { GLV.z = 1; GLV.cx = 48; GLV.cy = 12; } }
  glClampView();
}
function glFrameOpts() {
  const ev = GLB.ev, st = glState(), hz = !ev ? null : ev.arrived ? null : ev.stop ? ev.stop.at : null;
  return { rig: GLB.rig, ev, ground: ev.ground, ghost: GLB.rig.parts.some(p => p.type === 'dyn') ? glBaseGround() : null, sel: GLB.sel,
    ship: { x: GL.shipX, y: glAt(ev.ground, GL.shipX), tilt: 0, inside: true, mood: 'worried', dmg: st.lastDmg || 0 }, rock: !(st.boulderGone),
    hz, hzLabel: '', labels: true, fade: GLB.drag && GLB.drag.moved && !String(GLB.drag.kind).match(/pan|ruler/) || GLB.trayDrag ? 0.18 : 1, hookGlow: !!(GLB.drag && GLB.drag.kind === 'cable' && GLB.drag.moved), badPlat: GLB.drag && GLB.drag.bad ? GLB.drag.id : null, flashPlat: GLB.flash && performance.now() < GLB.flash.until ? GLB.flash.c : null, dropGlow: !!((GLB.trayType && (GLB.trayType === 'lever' || GLB.trayType === 'jack')) || (GLB.drag && GLB.drag.moved && GLB.drag.id && glPart(GLB.drag.id) && ['lever', 'jack'].includes(glPart(GLB.drag.id).type) && !GLB.drag.kind.match(/cable|pan|ruler/))), ruler: GLB.rulerOn ? GLB.ruler : null, cableDrag: GLB.drag && GLB.drag.kind === 'cable' ? GLB.drag.line : null };
}
function glLoop() {
  cancelAnimationFrame(GLB.raf); const step = () => { const cv = GLB.cv; if (!cv || !cv.isConnected) return;
    if (cv.offsetParent && !(GLR && GLR.on)) { glSize(); const c = fit(cv, GLV.LW, GLV.LH), keep = [], now = performance.now();
      Object.keys(GLB.fall || {}).forEach(id => { const f = GLB.fall[id], p = glPart(id), k = (now - f.t0) / f.dur; if (!p || k >= 1) { delete GLB.fall[id]; return; } keep.push([p, p.y]); p.y = f.y0 + (keep[keep.length - 1][1] - f.y0) * k * k; });   // gravity: slow, then faster
      try { glDrawWorld(c, glFrameOpts()); } finally { keep.forEach(([p, y]) => { p.y = y; }); } }
    GLB.raf = requestAnimationFrame(step); }; step();
}
const glPt = e => { const r = GLB.cv.getBoundingClientRect(), sx = (e.clientX - r.left) * GLV.LW / r.width, sy = (e.clientY - r.top) * GLV.LH / r.height; return { sx, sy, x: glWX(sx), y: glWY(sy) }; };
function glHit(P) {
  const g = glGround0(), pl = glPlats0(), byId = {}; GLB.rig.parts.forEach(q => byId[q.id] = q); const ms = {}; GLB.rig.parts.filter(q => GL_LIFT[q.type]).forEach(q => ms[q.id] = glMachine(q, g, pl));
  const near = (q, r) => Math.hypot(glSX(q.x) - P.sx, glSY(q.y) - P.sy) <= (r || 14);
  /* dynamite first: its tap area is at least 22 px across on screen (44 px for a finger), tested before cable dots and platform edges
     (Tom, 8 Nov 2026: it was only 1.2 m wide, tiny on a phone, and a cable dot or a ramp handle beside it won the tap) */
  { const sc = (GLB.cv.getBoundingClientRect().width || GLV.LW) / GLV.LW, minL = (GLB.touch ? 44 : 22) / sc, u = glU();
    for (const p of GLB.rig.parts.filter(q => q.type === 'dyn').slice().reverse()) { const cx = glSX(p.x), y0 = glSY(glAt(g, p.x)), y1 = glSY(glAt(g, p.x) + 1.9), w = Math.max(1.2 * u, minL) / 2, mid = (y0 + y1) / 2, h = Math.max(Math.abs(y0 - y1), minL) / 2;
      if (Math.abs(P.sx - cx) <= w && Math.abs(P.sy - mid) <= h) return { id: p.id, what: 'body' }; } }
  /* the nearest small target wins: cable dots and ramp-top handles sit close together */
  let best = null, bd = 14; const cand = (d, r) => { if (d < bd) { bd = d; best = r; } }, dist = q => Math.hypot(glSX(q.x) - P.sx, glSY(q.y) - P.sy);
  glShipDots().forEach(d => cand(dist(d), { id: 'ship', what: 'cable', at: { x: d.x, y: d.y }, spot: d.spot }));
  for (const p of GLB.rig.parts) { const q = glCablePoint(p, ms[p.id]); if (q) cand(dist(q), { id: p.id, what: 'cable', at: q }); if (p.type === 'ramp') cand(dist(ms[p.id].end) - 2, { id: p.id, what: 'head' }); }
  if (best) return best;
  const bcp = { x: 18.9, y: glAt(g, 18.7) + 1 }; if (!GLB.drag && near(bcp, 12)) return { id: 'boulder', what: 'cable', at: bcp };
  for (const pf of pl.slice().reverse()) if (P.x >= pf.x0 && P.x <= pf.x1 && Math.abs(glSY(pf.top) - P.sy) <= 12) return { id: pf.id, what: 'top' };
  const order = ['block', 'winch', 'dyn', 'jack', 'lever', 'crane', 'ramp', 'platform'];
  for (const t of order) for (const p of GLB.rig.parts.filter(q => q.type === t).slice().reverse()) {
    if (t === 'ramp') { const m = ms[p.id], a = m.start, b = m.end, ax = glSX(a.x), ay = glSY(a.y), bx = glSX(b.x), by = glSY(b.y), L2 = (bx - ax) ** 2 + (by - ay) ** 2, k = clamp(((P.sx - ax) * (bx - ax) + (P.sy - ay) * (by - ay)) / L2, 0, 1);
      if (Math.hypot(ax + k * (bx - ax) - P.sx, ay + k * (by - ay) - P.sy) <= 12) return { id: p.id, what: 'body' }; continue; }
    const b = glBounds(p, ms[p.id], g, pl); if (P.x >= b.x0 - 0.3 && P.x <= b.x1 + 0.3 && P.y >= b.y0 - 0.4 && P.y <= b.y1 + 0.4) return { id: p.id, what: 'body' };
  }
  return null;
}
/* ---------- pointer handling on the board ---------- */
function glBindBoard() {
  const cv = GLB.cv;
  cv.addEventListener('pointerdown', e => {
    if (GLB.readOnly || (GLR && GLR.on)) return; GLB.touch = e.pointerType === 'touch' || e.pointerType === 'pen'; const P = glPt(e); e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    if (GLB.place) { const t = GLB.place; GLB.place = null; glTrayMark(); glAddPart(t, P.x, P.y); return; }
    if (GLB.rulerOn && GLB.ruler) for (const k of ['a', 'b']) if (Math.hypot(glSX(GLB.ruler[k].x) - P.sx, glSY(GLB.ruler[k].y) - P.sy) <= 16) { GLB.drag = { kind: 'ruler', k, P0: P, moved: false }; return; }
    const hit = glHit(P);
    if (!hit) { GLB.drag = { kind: 'pan', P0: P, cx: GLV.cx, cy: GLV.cy, moved: false }; return; }
    if (hit.what === 'cable') { GLB.drag = { kind: 'cable', from: hit.id, spot: hit.spot, P0: P, line: { a: hit.at, b: { x: P.x, y: P.y } }, moved: false }; return; }
    const p = glPart(hit.id); GLB.drag = { kind: hit.what, id: hit.id, P0: P, orig: JSON.parse(JSON.stringify(p)), chain: GL_LIFT[p.type] ? glChainOf(p.id).map(i => [i, glPart(i).x, glPart(i).y]) : [], moved: false, pushed: false };
  });
  cv.addEventListener('pointermove', e => {
    const d = GLB.drag; if (!d) return; const P = glPt(e);
    if (!d.moved && Math.hypot(P.sx - d.P0.sx, P.sy - d.P0.sy) < 6) return; d.moved = true;
    if (d.kind === 'pan') { if (GLV.z > 1.01 || GLV.LH > GLV.wide) { GLV.cx = d.cx - (P.sx - d.P0.sx) / glU(); GLV.cy = d.cy + (P.sy - d.P0.sy) / glU(); glClampView(); } return; }
    if (d.kind === 'ruler') { GLB.ruler[d.k] = glRulerSnap(P); return; }
    if (d.kind === 'cable') { d.line.b = { x: P.x, y: P.y }; return; }
    const p = glPart(d.id); if (!p) return; if (!d.pushed) { glPush(); d.pushed = true; }
    const g = glGround0(), pl = glPlats0().filter(q => q.id !== p.id), dx = P.x - d.P0.x;
    if (d.kind === 'head') { const a = { x: p.x1, y: p.y1 }, vx = Math.max(0.5, P.x - a.x), vy = Math.max(0.5, P.y - a.y); let L = clamp(glSnap(Math.hypot(vx, vy)), 1, GL.rampMax), rise = clamp(glSnap(vy), 0.5, L / 2);
      GLB.hintLine = Math.hypot(vx, vy) > GL.rampMax + 0.3 ? 'That\'s as long as a ramp can be: 30 m.' : vy > L / 2 + 0.3 ? 'That\'s as steep as a ramp can go: it can rise half its length.' : ''; p.L = L; p.rise = rise; }
    else if (d.kind === 'top') { const pf = glPlats0().find(q => q.id === p.id); p.h = clamp(glSnap(P.y - pf.base), 0.5, GL.platMaxH); }
    else if (p.type === 'ramp') { p.x1 = clamp(glSnap(d.orig.x1 + dx), 0.5, GL.W - 2); p.y1 = +glFloorAt(p.x1, g, pl).toFixed(2); }
    else if (glIsAddon(p)) { p.x = clamp(glSnap(d.orig.x + dx, 0.25), 0, GL.W); p.y = clamp(glSnap(d.orig.y + (P.y - d.P0.y), 0.25), -1, 28); }
    else { p.x = clamp(glSnap(d.orig.x + dx), 0.5, GL.W - 0.5); if (p.type === 'lever' || p.type === 'jack') glBoulderSnap(p); }
    if (p.type === 'platform') { d.bad = glPlatBlocked(p); if (d.bad) d.badC = { size: p.size, x: p.x, h: p.h }; }
    /* add-ons ride along with their machine */
    if (d.chain.length) { const nx = p.type === 'ramp' ? p.x1 - d.orig.x1 : (p.x - d.orig.x), ny = p.type === 'ramp' ? p.y1 - d.orig.y1 : 0; d.chain.forEach(([i, x0, y0]) => { const q = glPart(i); if (q) { q.x = x0 + nx; q.y = y0 + ny; } }); }
    GLB.ev = glEvaluate(GLB.rig, { hints: glState().hints || 0 }); if (GLB.dockId === p.id) glPaintDock();
  });
  const up = e => {
    const d = GLB.drag; GLB.drag = null; if (!d) return; const P = glPt(e); GLB.hintLine = '';
    if (d.kind === 'cable') { if (!d.moved) { if (d.from !== 'boulder' && d.from !== 'ship') { GLB.sel = d.from; glOpenMenu(d.from); } return; }
      const hit = glHit(P), to = hit && hit.id !== d.from ? hit.id : null; if (to) { glPush(); if (glConnect(d.from, to)) glChanged(); else GLB.hist.pop(); }
      else if (d.from === 'ship' && d.spot) glUnrope(d.spot); return; }   /* a rope dragged off the Gumdrop's hook and let go in empty space comes off again */
    if (d.kind === 'pan') { if (!d.moved) GLB.sel = null; else glSaveRig(); return; }
    if (d.kind === 'ruler') return;
    if (!d.moved) { GLB.sel = d.id; glOpenMenu(d.id); return; }
    const p = glPart(d.id); if (p && glIsAddon(p)) glAutoAttach(p);
    if (d.bad && p) { Object.assign(p, { x: d.orig.x, h: d.orig.h }); glPlatFlash(d.badC); }   /* a platform let go under a machine goes back to where it was */
    glChanged();
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { GLB.drag = null; });
}
function glRulerSnap(P) { const g = glGround0(); let x = glSnap(P.x, 0.1), y = glSnap(P.y, 0.1); const gy = glAt(g, x); if (Math.abs(y - gy) < 0.5) y = +gy.toFixed(1);
  glPlats0().forEach(q => { if (x >= q.x0 && x <= q.x1 && Math.abs(y - q.top) < 0.5) y = q.top; }); return { x, y }; }
/* ---------- the docked settings panel (no floating menus: Tom, 8 Nov 2026) ----------
   It shows the piece you tapped last, beside the board (below it on a phone). Tap a machine to change it. */
function glCloseMenu() { GLB.dockId = null; glPaintDock(); }
function glOpenMenu(id) { GLB.dockId = id; glPaintDock(); }
function glPaintDock() {
  const d = GLB.dock; if (!d) return; const id = GLB.dockId, p = id && glPart(id);
  if (!p) { GLB.dockId = null; dkSet(d, DK_EMPTY); return; }
  const ev = GLB.ev, leg = ev && ev.legs.find(l => l.id === id), g = glGround0(), pl = glPlats0();
  const mach = GL_LIFT[p.type] ? glMachine(p, g, pl) : null, faults = (leg ? leg.faults : mach ? mach.faults.concat(glAddons(GLB.rig, id).faults) : []).filter((f, i, a) => a.indexOf(f) === i);
  const pm = (k, lab, val) => `<div class="glrow"><span>${lab}</span><button type="button" class="ghost sm" data-gm="${k}-" aria-label="Less">−</button><b>${val}</b><button type="button" class="ghost sm" data-gm="${k}+" aria-label="More">+</button></div>`;
  const cabled = GLB.rig.cables.some(c => c.a === id || c.b === id), roped = GLB.rig.cables.some(c => (c.a === 'ship' && c.b === id) || (c.b === 'ship' && c.a === id)) || (leg && leg.roped && GL_ROPED[p.type]);
  let body = '', title = '', icon = '', help = '', acts = '', fb = faults.map(f => GL_FAULT[f] || f).join(' ');
  if (GL_ROPED[p.type]) { body += `<div class="glrow"><span>Rope</span><b class="dkrope ${roped ? 'ok' : 'no'}">${roped ? '✓ roped to the Gumdrop' : 'not roped yet'}</b></div>`;
    acts += roped ? '' : '<button type="button" class="ghost sm" data-gm="rope">🪢 Rope it to the Gumdrop</button>';
    if (!roped && !faults.length) fb = GL_FAULT.norope + (fb ? ' ' + fb : ''); }
  if (p.type === 'ramp') { title = 'Ramp'; icon = '📐'; body = pm('L', 'Length', `${fmt(p.L, 1)} m`) + `<p class="glnote">Drag the round handle at the top to make it longer or steeper.</p>` + body; }
  else if (p.type === 'crane') { title = 'Crane gantry'; icon = '🏗️'; body = pm('rise', 'Lifts', `${fmt(p.rise, 1)} m`) + body; }
  else if (p.type === 'jack') { title = p.role === 'boulder' ? 'Screw jack (on the boulder)' : 'Screw jack'; icon = '🔩'; body = pm('rise', 'Lifts', `${fmt(p.rise, 1)} m`); }
  else if (p.type === 'lever') { title = p.role === 'boulder' ? 'Lever (on the boulder)' : 'Lever'; icon = '⚖️'; help = 'lever'; body = pm('arm', 'Load arm', `${fmt(p.arm, 1)} m`) + `<p class="glnote">Effort arm: <b>${fmt(GL.beam - p.arm, 1)} m</b>. The beam is 10 m long.</p>` + (p.role === 'boulder' ? '' : pm('rise', 'Lifts', `${fmt(p.rise, 1)} m`)); acts += '<button type="button" class="ghost sm" data-gm="flip">↔ Turn it around</button>'; }
  else if (p.type === 'platform') { title = `${GL_PLAT[p.size].name} platform`; icon = '◻️'; body = pm('h', 'Height', `${fmt(p.h, 1)} m`) + `<div class="glrow">${['S', 'M', 'L'].map(s => `<button type="button" class="ghost sm ${p.size === s ? 'on' : ''}" data-gm="size${s}">${GL_PLAT[s].name}</button>`).join('')}</div><p class="glnote">Holds <b>${GL_PLAT[p.size].holds.toLocaleString('en-GB')} N</b>. Drag its top edge to change the height. The Gumdrop lands on platforms.</p>`; }
  else if (p.type === 'block') { title = 'Pulley block'; icon = '⚙️'; body = `<div class="glrow"><span>Ropes</span>${[1, 2, 3, 4].map(n => `<button type="button" class="ghost sm ${p.ropes === n ? 'on' : ''}" data-gm="ropes${n}">${n}</button>`).join('')}</div><p class="glnote">${p.ropes} supporting rope${p.ropes > 1 ? 's' : ''}.</p>`; }
  else if (p.type === 'winch') { title = 'Winch'; icon = '🎡'; body = `<div class="glrow wrap"><span>Gear</span>${GL.winchRatios.map(n => `<button type="button" class="ghost sm ${p.ratio === n ? 'on' : ''}" data-gm="ratio${n}">×${n}</button>`).join('')}</div>`; }
  else if (p.type === 'dyn') { title = p.big ? 'Big dynamite' : 'Small dynamite'; icon = p.big ? '💥' : '🧨'; body = `<p class="glnote">Blasts a hole ${p.big ? '3' : '1.5'} m deep and ${p.big ? '6' : '3'} m wide when the rescue launches. Careful near the Gumdrop!</p>`; acts += `<button type="button" class="ghost sm" data-gm="big">Swap to ${p.big ? 'small' : 'big'}</button>`; }
  if (cabled) acts += '<button type="button" class="ghost sm" data-gm="cut">✂ Cut its cables</button>';
  acts += '<button type="button" class="ghost sm" data-gm="del">🗑 Remove</button>';
  dkSet(d, dkHTML({ icon, title, help, body, fb, actions: acts })); if (typeof glGuideThrob === 'function') glGuideThrob();
}
function glMenuAct(k) {
  const id = GLB.dockId, p = id && glPart(id); if (!p) return;
  if (k === 'del') return glRemove(id);
  if (k.startsWith('size') && glPlatBlocked(Object.assign({}, p, { size: k[4] }))) return glPlatFlash(Object.assign({}, p, { size: k[4] }));
  if (k === 'h+' && glPlatBlocked(Object.assign({}, p, { h: Math.min(GL.platMaxH, p.h + 0.5) }))) return glPlatFlash(Object.assign({}, p, { h: Math.min(GL.platMaxH, p.h + 0.5) }));
  glPush();
  if (k === 'cut') GLB.rig.cables = GLB.rig.cables.filter(c => c.a !== id && c.b !== id);
  else if (k === 'rope') { if (!GLB.rig.cables.some(c => (c.a === 'ship' && c.b === id) || (c.b === 'ship' && c.a === id))) GLB.rig.cables.push({ a: 'ship', b: id }); }
  else if (k === 'flip') p.dir = -(p.dir || 1);
  else if (k === 'big') p.big = !p.big;
  else if (k.startsWith('size')) p.size = k[4];
  else if (k.startsWith('ropes')) p.ropes = +k.slice(5);
  else if (k.startsWith('ratio')) p.ratio = +k.slice(5);
  else { const key = k.slice(0, -1), up = k.endsWith('+') ? 1 : -1;
    if (key === 'L') { p.L = clamp(p.L + 0.5 * up, 1, GL.rampMax); p.rise = Math.min(p.rise, p.L / 2); }
    if (key === 'rise') p.rise = clamp(p.rise + 0.5 * up, 0.5, p.type === 'crane' ? GL.craneRise : p.type === 'lever' ? GL.leverRise : GL.jackRise);
    if (key === 'arm') p.arm = clamp(p.arm + 0.5 * up, 0.5, 5);
    if (key === 'h') p.h = clamp(p.h + 0.5 * up, 0.5, GL.platMaxH); }
  glChanged();
}
/* take a rope off the Gumdrop's hook (the most recent one at that spot) */
function glUnrope(spot) {
  const mine = GLB.rig.cables.filter(c => (c.a === 'ship' || c.b === 'ship') && (() => { const S = glShipSpot(GLB.ev, c.a === 'ship' ? c.b : c.a); return Math.hypot(S.x - spot.x, S.y - spot.y) < 0.05; })());
  if (!mine.length) return false; glPush(); GLB.rig.cables = GLB.rig.cables.filter(c => c !== mine[mine.length - 1]); glChanged(); return true;
}
/* ---------- the side bits: crystals, the tray, tools ---------- */
/* the drag ghost for a rescue tray tile: the real drawing of a default piece, at the board's current zoom (Tom, 9 Nov 2026) */
function glGhostStart(t) {
  const cv = GLB.cv; if (!cv) return; const g = glGround0(), pl = glPlats0(), x = clamp(glSnap(GLV.cx), 1, GL.W - 1), fl = glFloorAt(x, g, pl);
  const P = { id: '_ghost', x, x1: x, y1: fl, y: fl + 4, L: 12, rise: 3, arm: 2, dir: 1, ropes: 2, ratio: 4, size: (t || '').slice(4) || 'M', h: 2, big: t === 'dynB' };
  ndGhostBegin(GLV.LW, GLV.LH, cv.getBoundingClientRect().width / GLV.LW, c => {
    if (t === 'ramp') { const p = Object.assign({ type: 'ramp' }, P); glDrawRamp(c, p, glMachine(p, g, pl), false, g); }
    else if (t === 'crane') { const p = Object.assign({ type: 'crane', rise: 4 }, P); glDrawCrane(c, p, glMachine(p, g, pl), false, undefined); }
    else if (t === 'lever') { const p = Object.assign({ type: 'lever', rise: 1 }, P); glDrawLever(c, p, glMachine(p, g, pl), false, undefined); }
    else if (t === 'jack') { const p = Object.assign({ type: 'jack', rise: 1 }, P); glDrawJack(c, p, glMachine(p, g, pl), false, undefined); }
    else if (t === 'block') glDrawBlock(c, Object.assign({ type: 'block', y: fl + 6 }, P), false);
    else if (t === 'winch') glDrawWinch(c, Object.assign({ type: 'winch', y: fl + 6 }, P), false, 0);
    else if (t.startsWith('plat')) { const p = Object.assign({ type: 'platform' }, P); const q = glPlatforms({ parts: [p] }, g)[0]; if (q) glDrawPlatform(c, q, false); }
    else if (t.startsWith('dyn')) glDrawDyn(c, Object.assign({ type: 'dyn', x }, P), g, true);
  });
}
function glTrayMark() { $$('#glTray [data-add]').forEach(b => b.classList.toggle('on', b.dataset.add === GLB.place)); if (typeof glGuideThrob === 'function') glGuideThrob(); const s = $('#glStatus'); if (s) s.textContent = GLB.place ? `Now tap the crater where the ${GL_TRAY.find(i => i.t === GLB.place).name.toLowerCase()} should go.` : 'Tap a part to see what you can do with it. Drag a part\'s ◉ to run a cable to another part.'; }
function glPaintSide() {
  const ev = GLB.ev, el = $('#glCrys'); if (!el || !ev) return; const c = ev.cost.total, over = c > GL.budget;
  el.innerHTML = `<span class="${over ? 'bad' : ''}">💎 <b>${c}</b> of ${GL.budget} ${T('sugarcrystal', 'sugar crystals')} (gummy money)</span>`;
  const rc = $('#glReceipt'); if (rc) rc.innerHTML = ev.cost.items.length ? ev.cost.items.map(([w, n]) => `<li><span>${esc(w)}</span><b>${n}</b></li>`).join('') + `<li class="tot"><span>Total</span><b>${c}</b></li>` : '<li>Nothing bought yet.</li>';
}
function glClearAsk(on) {
  let ask = $('#glClearAsk'); if (ask) ask.remove(); const row = $('.gltools'); if (!on || !row) return;
  ask = document.createElement('div'); ask.id = 'glClearAsk'; ask.className = 'row glclearask'; ask.setAttribute('role', 'alertdialog'); ask.setAttribute('aria-label', 'Clear the whole route?');
  ask.innerHTML = '<span><b>Clear every piece you placed?</b> The boulder, the Gumdrop and the ground stay.</span> <button type="button" class="go sm" data-gt="clear-yes">Yes, clear all</button> <button type="button" class="ghost sm" data-gt="clear-no">Keep my route</button>';
  row.insertAdjacentElement('afterend', ask); const k = ask.querySelector('[data-gt=clear-no]'); if (k) k.focus({ preventScroll: true });
}
function glToolAct(k) {
  if (k === 'undo') { const s = GLB.hist.pop(); if (s) { GLB.rig = JSON.parse(s); GLB.sel = null; glCloseMenu(); glChanged(); } else toast('Nothing to undo.'); }
  /* Clear all (Tom, 9 Nov 2026: it did nothing). It used window.confirm(), and browser dialogs are blocked where this app runs (Toddle's frame), so confirm() answered "no" at once. It now asks in the page itself. */
  else if (k === 'clear') { if (!GLB.rig.parts.length) { toast('The board is already empty.'); return; } glClearAsk(true); }
  else if (k === 'clear-no') glClearAsk(false);
  else if (k === 'clear-yes') { glClearAsk(false); glPush(); GLB.rig = { v: 2, parts: [], cables: [] }; GLB.sel = null; GLB.dockId = null; glCloseMenu(); glChanged();
    if (typeof glwPut === 'function') { glwPut(w => { w.rows = {}; }); if (typeof glwPaint === 'function') glwPaint(); }   // the route strip starts again, empty, like the board
    toast('✓ Cleared. The boulder, the Gumdrop and the ground are as they were.', 'ok'); }
  else if (k === 'ruler') { GLB.rulerOn = !GLB.rulerOn; if (!GLB.ruler) GLB.ruler = { a: { x: glSnap(GLV.cx - 6, 0.1), y: 0 }, b: { x: glSnap(GLV.cx + 4, 0.1), y: 6 } }; if (GLB.rulerOn) { GLB.ruler.a = glRulerSnap({ x: GLB.ruler.a.x, y: GLB.ruler.a.y }); } $('[data-gt=ruler]').classList.toggle('on', GLB.rulerOn); }
  else if (k === 'zin' || k === 'zout') { GLV.z = clamp(GLV.z * (k === 'zin' ? 1.5 : 1 / 1.5), 1, 4); glClampView(); glSaveRig(); }
  else if (k === 'zall') { GLV.z = 1; GLV.cx = 48; GLV.cy = GLV.LH > GLV.wide ? 15 : 12; glClampView(); }
}
/* the board, built into a host element */
function glBoardHTML() {
  return `<div class="glstats"><span id="glCrys"></span><details class="glrec"><summary>Receipt</summary><ul id="glReceipt"></ul></details></div>
    <div class="glarea"><div class="glboard"><div class="glcv"><div class="glmchd" aria-hidden="true"><i class="glled"></i><i class="glled"></i><span>GUMMY MISSION CONTROL · RESCUE SIMULATOR</span><i class="glled"></i><i class="glled"></i></div><canvas id="glCv" role="img" aria-label="Glimmer-9's crater, side-on. The Gumdrop is stuck on the crater floor with a boulder against its landing leg. The crater wall rises to a shelf at 6 m, then a bulge, then the crest at 15 m. The Big Jelly waits beyond the crest."></canvas>
      <div class="glzoom"><button type="button" class="ghost sm" data-gt="zin" aria-label="Zoom in">＋</button><button type="button" class="ghost sm" data-gt="zout" aria-label="Zoom out">−</button><button type="button" class="ghost sm" data-gt="zall" aria-label="See the whole crater">⤢</button></div>
      <button type="button" class="go glplay" id="glRun">▶ Test in simulator</button><div class="glrunctl" id="glRunCtl" hidden><button type="button" class="ghost sm" data-gr="skip">⏭ Skip</button><button type="button" class="go sm" data-gr="edit">🔧 Back to building</button></div><div class="glaccept" id="glAccept" role="status" hidden><b>Mission accepted 🚀</b><span>GASA approves your maths!</span></div></div>
      <div class="gltray" id="glTray" role="toolbar" aria-label="Parts tray: tap a part, then tap the crater (or drag it in)">${GL_TRAY.map(i => `<button type="button" class="gltry" data-add="${i.t}"><span class="ic" aria-hidden="true">${i.icon}</span><b>${i.name}</b><small>💎 ${i.cost}${i.wt ? ` · ${i.wt}` : ''}</small></button>`).join('')}</div></div>
      <aside class="dock" id="glDock" aria-label="Settings for the machine you tapped" aria-live="polite"></aside></div>
    <p class="scaleNote" id="glStatus"></p>
    <div class="row gltools"><button type="button" class="ghost sm" data-gt="ruler">📏 Ruler</button><button type="button" class="ghost sm" data-gt="undo">↶ Undo</button><button type="button" class="ghost sm" data-gt="clear">Clear all</button></div>`;
}
function glMountBoard(host, opts) {
  opts = opts || {}; host.insertAdjacentHTML('beforeend', glBoardHTML());
  GLB.cv = $('#glCv', host); GLB.dock = $('#glDock', host); GLB.onChange = opts.onChange || null; GLB.readOnly = false;
  const st = glState(); GLB.rig = glMigrate(st.rig ? JSON.parse(JSON.stringify(st.rig)) : { v: 2, parts: [], cables: [] }); GLB.hist = []; GLB.sel = null; GLB.dockId = null;
  GLB.ev = glEvaluate(GLB.rig, { hints: st.hints || 0 }); glPaintSide(); glTrayMark(); glBindBoard(); glPaintDock();
  GLB.dock.addEventListener('click', e => { const b = e.target.closest('[data-gm]'); if (b) glMenuAct(b.dataset.gm); const q = e.target.closest('[data-dk^="help:"]'); if (q && typeof lsShowCards === 'function') lsShowCards(q.dataset.dk.slice(5)); });
  host.addEventListener('click', e => { const b = e.target.closest('[data-gt]'); if (b) glToolAct(b.dataset.gt); const a = e.target.closest('[data-add]'); if (a && !GLB.trayDrag) { GLB.place = GLB.place === a.dataset.add ? null : a.dataset.add; glTrayMark(); } });
  /* drag straight from the tray onto the crater */
  $('#glTray', host).addEventListener('pointerdown', e => { const a = e.target.closest('[data-add]'); if (!a) return; const t = a.dataset.add, x0 = e.clientX, y0 = e.clientY; GLB.trayDrag = false;
    let ghosted = false;
    const mv = ev2 => { if (Math.hypot(ev2.clientX - x0, ev2.clientY - y0) > 10) { GLB.trayDrag = true; GLB.trayType = t; if (!ghosted) { ghosted = true; glGhostStart(t); } ndGhostMove(ev2.clientX, ev2.clientY); } };
    const cx = () => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', upf); document.removeEventListener('pointercancel', cx); ndGhostEnd(); GLB.trayType = null; setTimeout(() => { GLB.trayDrag = false; }, 0); };
    const upf = ev2 => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', upf); document.removeEventListener('pointercancel', cx); ndGhostEnd(); GLB.trayType = null;
      const r = GLB.cv.getBoundingClientRect(); if (GLB.trayDrag && ev2.clientX >= r.left && ev2.clientX <= r.right && ev2.clientY >= r.top && ev2.clientY <= r.bottom) { const P = glPt(ev2); GLB.place = null; glAddPart(t, P.x, P.y); glTrayMark(); }
      setTimeout(() => { GLB.trayDrag = false; }, 0); };
    document.addEventListener('pointermove', mv); document.addEventListener('pointerup', upf); document.addEventListener('pointercancel', cx); });
  glSize(); if (st.view && st.view.LH === GLV.LH) { GLV.z = st.view.z; GLV.cx = st.view.cx; GLV.cy = st.view.cy; glClampView(); }
  glLoop();
}

/* ---------- the Part 5 Challenge card ---------- */
function renderGummyLift(ch, m, host, save) {
  GLB.ch = ch; GLB.mid = m.id; GLB.save = save; const st = glState();
  const card = h('section', { class: 'panel mission glwrap', id: 'mi-gl' }); host.appendChild(card);
  card.innerHTML = `${remindersHTML()}<details class="glbrief"${st.runs ? '' : ' open'}><summary>📋 Your mission</summary><div class="gl">
      <p>The Gumdrop weighs <b>6,300 N</b>. Smooshy can only pull <b>60 N</b>. If he has to pull harder, he fires the broken thrusters, and they damage the ship.</p>
      <p>Lift the Gumdrop up to the dotted line. The Big Jelly's tractor beam does the rest. Build a route of machines up to that line. Each machine starts in the glowing box where the last one finished.</p>
      <p>💎 ${T('sugarcrystal', 'Sugar crystals')} are gummy money. You have <b>475</b> to spend. Smooshy has enough oxygen for <b>1,500 m</b> of pulling.</p>
      <p>First, free the Gumdrop: a <b>252 N</b> boulder is stuck against its leg.</p>
      <p>Test your route in the simulator, work out the maths for every leg in your route strip, then send it to GASA. When GASA approves your maths, the rescue launches!</p></div></details>
    <div id="glGuideHost"></div><div id="glBoardHost"></div><div id="glStripHost"></div><div id="glRunHost"></div>`;
  glMountBoard($('#glBoardHost', card), { onChange: () => { if (typeof glRunPaint === 'function') glRunPaint(); } });
  if (typeof glMountGuide === 'function') glMountGuide($('#glGuideHost', card));
  if (typeof glMountStrip === 'function') glMountStrip($('#glStripHost', card));
  if (typeof glMountRun === 'function') glMountRun($('#glRunHost', card));
}
