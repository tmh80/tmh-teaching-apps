/* ===== Chapter 6: lesson mode pieces for Parts 2 to 4 (spec section 2, 3, 4 and 10; stage 3) =====
   Extends 4m-lesson.js. Pieces: crane gantry, pulley block, winch, ramp, screw jack, wedge (a demonstration), compound (cables between ◉ dots), and the k3 two-leg practice.
   EVERY change goes through wsSet / wsSetMach (4a-workshop.js), so all numbers, task checks, questions and marks stay exactly as they were.
   One drawing per piece: the pieces are drawn by the rescue's own functions (glDrawCrane, glDrawBlock, glDrawWinch, glDrawRamp, glDrawJack, glDrawPlatform in 4g-glscene.js)
   through lsGL(), which points the rescue's world frame (GLV) at this bench: world x = pixels / K from the board's left edge, world y = metres up from the floor.
   Which scene is on the bench is decided by WS.mach: pulley, winch, ramp and build are "lift" scenes (a crane gantry or a ramp, plus an optional pulley block and winch), wedge and screw
   are their own scenes. A step with two machines (u2: winch and ramp, pl4: wedge and screw jack) shows ONE machine at a time, with a visible tab row in the panel; tapping a tray piece of the
   other machine switches to it. LS.pl is the set of pieces placed; LS.cab (4m) is the ropes joined. Rope ends of a lift scene: 'load' (the load's hook), 'top' (the crane's hook, or the ramp's
   top ◉), 'blk' (the top of the pulley block hanging on the load's hook) and 'wd' (the loose end of the rope: the winch's drum once a winch is clipped on).
   Names to avoid reusing elsewhere (one shared scope): LS, LS_*, ls*. */
const LS_CX = 330, LS_KC = 60, LS_KR = 50, LS_FX = 196, LS_PLW = 80;
Object.assign(LS, { pl: {}, stage: 'main', cabBy: {}, two: null, cabMain: null });
Object.assign(LS_PIECES, {
  crane: { name: 'Crane gantry', icon: '🏗️', note: 'drag it over the load', mach: null,
    cards: [{ t: 'This is a crane gantry: a tall frame with a hook at the top.', ghost: 'point' },
      { t: 'The rope goes from the load, up over the top, and down to Smooshy. When he pulls down, the load goes straight up.', ghost: 'point' },
      { t: 'On its own it doesn\'t make the pull smaller. Hang a pulley block on its hook to do that.', ghost: 'point' },
      { t: 'The trolley rolls along the top beam. It carries the load across, then sets it down on a shelf or platform.', ghost: 'point' }] },
  block: { name: 'Pulley block', icon: '🪢', note: 'hang it on a hook', mach: 'pulley',
    cards: [{ t: 'A pulley block is a set of wheels that hangs from a hook.', ghost: 'point' },
      { t: 'Drag it onto the crane\'s hook (the ◉ dot). It glows and clips on.', ghost: 'drop' },
      { t: 'Tap the block to add supporting ropes. More ropes share the load, so Smooshy\'s pull gets smaller.', ghost: 'point' }] },
  winch: { name: 'Winch', icon: '⚙️', note: 'clip it on the rope end', mach: 'winch',
    cards: [{ t: 'A winch is a wheel and axle. The rope wraps round the small axle, and Smooshy turns the big handle.', ghost: 'point' },
      { t: 'Drag it onto the end of the rope (the ◉ dot), so the rope winds onto it.', ghost: 'drop' },
      { t: 'Tap the winch to change the handle size. A bigger handle means an easier turn, but more turning.', ghost: 'point' }] },
  ramp: { name: 'Ramp', icon: '📐', note: 'its top rests on the platform', mach: 'ramp',
    cards: [{ t: 'A ramp lets you push or pull a load up a slope instead of lifting it straight up.', ghost: 'point' },
      { t: 'Drag the ramp in so its top rests on the platform. Drag the white handle at the top to make it longer.', ghost: 'drag' },
      { t: 'A longer ramp means a smaller pull, but further to go.', ghost: 'point' }] },
  jack: { name: 'Screw jack', icon: '🔩', note: 'drag it under the car', mach: 'screw',
    cards: [{ t: 'A screw jack is a ramp wrapped round a pole, called a thread.', ghost: 'point' },
      { t: 'Drag it under the car. It glows and snaps into place.', ghost: 'drop' },
      { t: 'Turn the handle round and round. Each turn lifts the car by one gap between the threads, so it\'s very easy but very slow.', ghost: 'point' }] },
  wedge: { name: 'Wedge', icon: '🪓', note: 'a demonstration', mach: 'wedge', cards: [] },
  cables: { name: 'Cables', icon: '🔗', note: '', mach: null,
    cards: [{ t: 'Machines can work together. Every machine has a ◉ dot where its rope comes out.', ghost: 'point' },
      { t: 'Drag from one ◉ dot to the next to join them with a cable. Add-ons like a pulley block or a winch also clip straight on when you drop them on a ◉ dot.', ghost: 'cable' },
      { t: 'Smooshy always works the last machine in the chain.', ghost: 'point' }] },
  platform: { name: 'Platforms and the handover box', icon: '🟩', note: '', mach: null,
    cards: [{ t: 'When a load reaches the top of one machine, it stops on a platform.', ghost: 'point' },
      { t: 'The glowing box shows where the next machine must start. Put the foot of your next ramp, or your crane, inside it.', ghost: 'point' },
      { t: 'You\'ll use this in the rescue to build a route up the crater.', ghost: 'point' }] }
});
const LS_SCENES = ['pulley', 'winch', 'ramp', 'build', 'wedge', 'screw'];
const lsSc = () => LS.on && LS.o && LS.stage !== 'two' && LS_SCENES.includes(WS.mach) ? WS.mach : null;
const lsIsTwo = () => !!(LS.on && LS.o && LS.stage === 'two');
const lsTouch = () => { wsResetLoad(); wsRenderControls(); if (LAB.onChange) LAB.onChange(); };
const lsRmax = () => WS.lifts && WS.lifts.pick ? 2 : Math.max(WS.lift, 1);
function lsRoute() { const m = WS.mach; if (m === 'ramp') return 'ramp'; if (m === 'build') return LS.pl.ramp ? 'ramp' : LS.pl.crane ? 'crane' : 'none'; return m === 'pulley' || m === 'winch' ? 'crane' : null; }
/* a step with the crane gantry in its tray starts without it: the pulley block and winch wait until it is on the bench (Tom, 9 Nov 2026) */
const lsNoCrane = () => !!(LS.o && LS.o.tray.includes('crane') && !LS.pl.crane && (lsRoute() === 'crane' || (WS.mach === 'build' && lsRoute() === 'none')));
const lsWait = t => !lsIsTwo() && (t === 'block' || t === 'winch') && lsNoCrane();
const lsWaitNote = () => LS.o.tray.includes('ramp') ? 'pick a route first' : 'add the crane first';
const lsWaitMsg = () => LS.o.tray.includes('ramp') ? 'Pick a route first: drag in the crane gantry or the ramp.' : `Add the crane gantry first: drag it from the tray over the ${WS.loadShort}.`;
const lsUseBlock = () => (WS.mach === 'pulley' || WS.mach === 'build') && !!LS.pl.block;
const lsWinchSlot = () => WS.mach === 'winch' || WS.mach === 'build';
const lsPutWinch = () => lsWinchSlot() && !!LS.pl.winch;
/* the ropes this machine needs before ▶ works */
function lsNeed() {
  const r = lsRoute(), A = []; if (!r || r === 'none' || (r === 'crane' && !LS.pl.crane)) return A;
  A.push(r === 'crane' && lsUseBlock() ? ['blk', 'top'] : ['load', 'top']);
  if (lsPutWinch()) A.push(['top', 'wd']);
  return A;
}
function lsReady() { const m = WS.mach; if ((m === 'pulley' || m === 'winch') && !LS.pl.crane) return false; if (lsTro() && !lsTroOk()) return false; return m === 'winch' ? !!LS.pl.winch : m === 'ramp' ? !!LS.pl.ramp : m === 'build' ? lsRoute() !== 'none' : m === 'screw' ? !!LS.pl.jack : true; }
function lsInitCab(m) {
  if (m === 'hand') return [['load', 'end']];
  if (m === 'pulley' || m === 'winch') return LS.pl.crane ? [['load', 'top']] : [];
  if (m === 'build' && LS.pl.crane && !LS.pl.ramp) { const A = [LS.pl.block ? ['blk', 'top'] : ['load', 'top']]; if (LS.pl.winch) A.push(['top', 'wd']); return A; }
  return [];
}
/* run fn with the rescue's drawing frame set to this bench */
function lsGL(K, fn) {
  const keep = Object.assign({}, GLV); Object.assign(GLV, { LW: 900, LH: WS_H, K, z: 1, cx: 450 / K, cy: (LS_FLOOR - WS_H / 2) / K });
  try { return fn(); } finally { Object.assign(GLV, keep); }
}
const lsFlat = () => new Array(100).fill(0);

/* ---------- the trolley in lesson mode (spec section 14) ----------
   A step with lesson: { trolley: { shelf: { across, h, w } } } gives the crane Move across (LS.across, signed metres) and puts a shelf on the bench. The load lifts by the lift height, the trolley carries it
   across, then sets it down on whatever is under it there: the shelf (if the spot is over it) or the floor. It must be within GL.hzY (0.5 m) of the lifted height, like the rescue. The maths (WS) does not change. */
/* a pull that carried the load across onto the shelf is what ticks the u3 practice (the maths record is untouched) */
function lsAfterPull() { const T = lsTro(); if (T && lsAcross() && lsTroOk() && lsTroSurface(lsAcross()) === T.shelf.h) S.flags.u3carried = true; }
const lsTro = () => (LS.on && LS.o && LS.o.trolley && (WS.mach === 'pulley' || WS.mach === 'winch' || (WS.mach === 'build' && !LS.pl.ramp)) && LS.pl.crane) ? LS.o.trolley : null;
const lsVf = () => Math.min(1, 2.4 / Math.max(WS.lift, 2.4));   // a tall lift (the 6 m and 10 m jobs) is drawn squashed so it fits the bench: the board shows the real height in words
const lsHoldName = () => { const T = lsTro(); return (T && T.shelf.name) || 'shelf'; };
const lsAcross = () => lsTro() ? (LS.across || 0) : 0;
function lsTroSurface(a) { const T = lsTro(), sh = T && T.shelf; return sh && Math.abs(a - sh.across) <= sh.w / 2 + 1e-9 ? sh.h : 0; }
const lsTroOk = () => { const T = lsTro(); if (!T) return true; const a = lsAcross(); if (!a) return !T.required; return Math.abs(lsTroSurface(a) - WS.lift) <= GL.hzY + 1e-9; };
function lsTroStep(k) { const d = LS.adir || (LS.across < 0 ? -1 : 1), mag = clamp(Math.abs(LS.across || 0) + (k === 'across+' ? 0.5 : -0.5), 0, 4); LS.across = mag ? mag * d : 0; LS.adir = d; }
/* where the load is at a point in the pull: lift (0 to 0.6), roll across (0.6 to 0.85), lower (0.85 to 1) */
function lsTroPhase(prog) { const a = lsAcross(); if (!a) return { lift: prog, dx: 0, low: 0 }; return { lift: clamp(prog / 0.6, 0, 1), dx: clamp((prog - 0.6) / 0.25, 0, 1), low: clamp((prog - 0.85) / 0.15, 0, 1) }; }

/* ---------- where things are: a crane (or gantry) lift ---------- */
function lsGeoCrane(riseNow, prog, dx) {
  const K = LS_KC, f = lsVf(), R = lsRmax() * f, topY = Math.max(52, LS_FLOOR - R * K - 168), cx = LS_CX, hw = 1.6 * K, ly = LS_FLOOR - (riseNow || 0) * K * f, hiPx = Math.max(0, lsAcross()) * K, useB = lsUseBlock(), n = WS.mach === 'pulley' ? WS.ropes : (WS.bn || 1), tx = cx + (dx || 0);   // tx: the trolley
  const load = { x: tx, y: ly - 47 }, blkC = { x: tx, y: load.y - 26 }, blk = { x: tx, y: blkC.y - 15 }, top = { x: tx, y: topY + 26 }, xr = cx + hw + 6 + hiPx, slot = lsWinchSlot(), winch = lsPutWinch();
  const wc = { x: xr + 66, y: LS_FLOOR - 44 }, T = { x: xr, y: slot ? 250 + (prog || 0) * 50 : topY + 36 + (prog || 0) * 100 }, wd = winch ? { x: wc.x, y: wc.y } : { x: xr, y: slot ? 292 : T.y };
  return { K, R, topY, cx, tx, hw, ly, load, blkC, blk, top, xr, n, useB, slot, winch, wc, T, wd };
}
/* a lift up a ramp: the foot on the floor, the top resting on the platform */
function lsGeoRamp(prog) {
  const build = WS.mach === 'build', L = build ? (WS.br || 6) : WS.L, h = build ? WS.lift : WS.h, run = Math.sqrt(Math.max(.01, L * L - h * h)), K = Math.min(LS_KR, 540 / Math.max(run, 1)), fx = LS_FX,   // a long ramp (the 18 m job) is drawn smaller so it fits the bench
    tx = fx + run * K, ty = LS_FLOOR - h * K;
  const lp = Math.hypot(tx - fx, ty - LS_FLOOR), cs = (tx - fx) / lp, sn = (ty - LS_FLOOR) / lp, placed = !!LS.pl.ramp, t = placed ? clamp(prog || 0, 0, 1) : 0, d = 34 + (lp - 68) * t;
  const th = Math.max(5, 0.42 * K * 0.32), nx = sn, ny = -cs;   // the normal that points up the screen
  const cart = placed ? { x: fx + cs * d + nx * (th + 17), y: LS_FLOOR + sn * d + ny * (th + 17) } : { x: fx + 44, y: LS_FLOOR - 17 }, ang = placed ? Math.atan2(sn, cs) : 0;
  const hook = placed ? { x: cart.x + cs * 22 + nx * 15, y: cart.y + sn * 22 + ny * 15 } : { x: cart.x + 20, y: cart.y - 24 }, top = { x: tx + 12, y: ty - 30 };
  const slot = lsWinchSlot(), winch = lsPutWinch(), wc = { x: tx + 54, y: ty - 26 }, T = { x: tx + 62, y: ty - 44 }, wd = winch ? wc : T;
  return { K, L, h, run, fx, tx, ty, lp, cs, sn, th, placed, t, cart, ang, hook, top, slot, winch, wc, T, wd, n: WS.bn || 0 };
}
/* every rope end on the bench right now */
function lsEndsSc() {
  const r = lsRoute(), m = WS.mach, E = {};
  if (r === 'crane') { const g = lsGeoCrane(0, 0); E.load = g.load; if (LS.pl.crane) { E.top = g.top; if (g.useB) E.blk = g.blk; if (g.slot) E.wd = g.wd; } }
  else if (r === 'ramp') { const g = lsGeoRamp(0); E.load = g.hook; E.top = g.top; if (g.slot && g.winch) E.wd = g.wd; }
  else if (m === 'build' && r === 'none') { if (LS.o.tray.includes('ramp')) { const g = lsGeoRamp(0); E.load = g.hook; } else { const g = lsGeoCrane(0, 0); E.load = g.load; } }
  return E;
}

/* ---------- drawing ---------- */
function lsHandDown(c, x, y) { wsSpring(c, x, y, x, y + 66, null); return { x, y: y + 66 }; }
function lsSheaves(c, cx, y, n, s) {
  const w = (n - 1) * 18, K = LS_KC; c.fillStyle = GLC.steel2; c.beginPath(); c.roundRect(cx - w / 2 - 13, y - 14, w + 26, 20, 6); c.fill();
  lsGL(K, () => { for (let i = 0; i < n; i++) glDrawBlock(c, { x: (cx - w / 2 + i * 18) / K, y: (LS_FLOOR - y) / K, s: s || 0.3 }, false); });
}
function lsDrawCraneScene(c, cur, riseNow, prog) {
  const tro = lsTro(), ac = lsAcross(), ph = lsTroPhase(prog || 0), tdx = ac ? ac * LS_KC * ph.dx : 0;
  if (ac) { riseNow = (riseNow || 0) ? WS.lift * ph.lift : 0; if (ph.low) riseNow = WS.lift + (lsTroSurface(ac) - WS.lift) * ph.low; prog = ph.lift; }   // the rope only winds while the load goes up
  const g = lsGeoCrane(riseNow, prog, tdx), K = g.K, roped = g.useB ? lsJoined('blk', 'top') : lsJoined('load', 'top'), showCrane = !!LS.pl.crane;
  if (!showCrane) { lsLoadBox(c, g.cx, g.ly, lsLoadLabel(), false); return { x: g.cx, y: 200 }; }
  if (tro) lsGL(K, () => { const sh = tro.shelf, x0 = (g.cx + (sh.across - sh.w / 2) * K) / K, x1 = (g.cx + (sh.across + sh.w / 2) * K) / K; glDrawPlatform(c, { x0, x1, top: sh.h * lsVf(), base: 0, s: 0.32 }, false);
    if ((ac || tro.required) && !prog) glDrawSetDown(c, { end: { x: (g.cx + (ac || sh.across) * K) / K, y: lsTroSurface(ac || sh.across) * lsVf() } }, performance.now() / 1000, !!ac && !lsTroOk()); });
  if (tro && tro.shelf.name) lblAdd(`${tro.shelf.name}${tro.shelf.h > 2.4 ? ' (' + fmt(tro.shelf.h, 0) + ' m up)' : ''}`, g.cx + tro.shelf.across * K, LS_FLOOR - tro.shelf.h * lsVf() * K - 44, { size: 11, col: '#fff', bg: 'rgba(80,60,140,.85)', prio: 3 });
  const half = 1.6, lo = Math.min(0, ac) * K, hi = Math.max(0, ac) * K, legs = ac ? { legL: { x: (g.cx + lo) / K - half, y: 0 }, legR: { x: (g.cx + hi) / K + half, y: 0 } } : {};
  lsGL(K, () => glDrawCrane(c, { x: g.cx / K, rise: (LS_FLOOR - g.topY) / K - 1.3, s: 0.5 }, Object.assign({ start: { x: 0, y: 0 } }, legs), false, (LS_FLOOR - g.top.y) / K, ac ? g.tx / K : undefined));
  lsLoadBox(c, g.tx, g.ly, lsLoadLabel(), g.useB ? lsJoined('blk', 'top') : roped);
  if (g.useB) {   // the pulley block hangs on the load's hook; N strands run up to the crane's hook
    c.strokeStyle = GLC.rope; c.lineWidth = 3; c.beginPath(); c.moveTo(g.load.x, g.load.y); c.lineTo(g.blkC.x, g.blkC.y + 6); c.stroke();
    lsSheaves(c, g.tx, g.top.y + 18, g.n); lsSheaves(c, g.tx, g.blkC.y + 6, g.n);
    if (roped) { const w = (g.n - 1) * 18; c.strokeStyle = '#d9c28a'; c.lineWidth = 3; c.lineCap = 'round'; for (let i = 0; i < g.n; i++) { const x = g.tx - w / 2 + i * 18; c.beginPath(); c.moveTo(x, g.blkC.y - 8); c.lineTo(x, g.top.y + 26); c.stroke(); } }
  } else if (lsJoined('load', 'top')) drawRopePx(c, g.load, g.top, 4, 0);
  let ep, tail = roped, winchOn = g.winch && lsJoined('top', 'wd');
  if (tail) {   // over the top and down the right-hand side
    c.strokeStyle = '#d9c28a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.top.x, g.top.y); c.lineTo(g.tx, g.topY); c.lineTo(g.xr + (ac > 0 ? hi : 0), g.topY);
    if (winchOn) c.lineTo(g.wc.x, g.wc.y - 20); else c.lineTo(g.xr, g.T.y); c.stroke();
  }
  if (g.winch) {
    const cl = WS.mach === 'winch' ? 0.9 + 6 * WS.R : 1 + 0.35 * (WS.bw || 2), spin = WS.mach === 'winch' ? riseNow / WS.axle : prog * 4 * Math.PI, r = Math.max(8, 0.55 * K * 0.5);
    c.fillStyle = GLC.steel2; c.fillRect(g.wc.x - 7, g.wc.y + r * 1.1, 14, LS_FLOOR - g.wc.y - r * 1.1); c.beginPath(); c.roundRect(g.wc.x - 28, LS_FLOOR - 6, 56, 6, 3); c.fill();
    lsGL(K, () => glDrawWinch(c, { x: g.wc.x / K, y: (LS_FLOOR - g.wc.y) / K, s: 0.5, crank: cl }, false, spin));
    const gx = g.wc.x + Math.cos(spin) * r * cl, gy = g.wc.y + Math.sin(spin) * r * cl, tx = -Math.sin(spin), ty = Math.cos(spin);
    if (lsGate()) arrow(c, gx - tx * 4, gy - ty * 4, gx + tx * 40, gy + ty * 40, WSC.red, 4);
    ep = { x: gx + tx * 40, y: gy + ty * 40 }; lblAdd('turn the handle', g.wc.x, g.wc.y - 62, { size: 11, col: WSC.red, bg: '#fff', border: WSC.red, prio: 3, tx: gx, ty: gy });
  } else if (lsReady() && tail) { ep = lsHandDown(c, g.T.x, g.T.y); lblAdd('pull down', g.T.x + 16, g.T.y + 33, { size: 11, col: WSC.red, bg: '#fff', border: WSC.red, align: 'left', prio: 3 }); }
  if (g.slot && !g.winch) lsHookDot(c, g.wd.x, g.wd.y, false);
  lsHookDot(c, g.top.x, g.top.y, roped); if (g.useB) lsHookDot(c, g.blk.x, g.blk.y, roped);
  if (g.winch) lsHookDot(c, g.wd.x, g.wd.y, winchOn);
  return ep || { x: g.xr, y: g.T.y };
}
function lsCartDraw(c, G, label) {
  const p = G.cart; c.save(); c.translate(p.x, p.y); c.rotate(G.ang); c.fillStyle = WSC.crate; c.beginPath(); c.roundRect(-26, -15, 52, 26, 5); c.fill(); c.fillStyle = WSC.crate2; c.fillRect(-21, -10, 42, 4);
  c.fillStyle = WSC.ink; [[-15, 11], [15, 11]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 6, 0, 7); c.fill(); }); c.restore();
  lblAdd(label, p.x, p.y - 44, { size: 12, prio: 2, tx: p.x, ty: p.y - 8 });
}
function lsDrawRampScene(c, cur, riseNow, prog) {
  const g = lsGeoRamp(prog), K = g.K, r = lsRoute(), gen = WS.loadId !== 'cart' ? lsCap(WS.loadShort) : 'Cart';
  lsGL(K, () => { glDrawPlatform(c, { x0: g.tx / K, x1: (g.tx + LS_PLW) / K, top: g.h, base: 0, s: 0.32 }, false);
    if (g.placed) glDrawRamp(c, { L: g.L, rise: g.h, x1: g.fx / K, y1: 0, s: 0.32 }, { start: { x: g.fx / K, y: 0 }, end: { x: g.fx / K + g.run, y: g.h } }, false, lsFlat()); });
  lsCartDraw(c, g, `${gen} ${fmt(WS.load, WS.load % 1 ? 1 : 0)} N`);
  const roped = lsJoined('load', 'top'), winchOn = g.winch && lsJoined('top', 'wd'); let ep = { x: g.T.x, y: g.T.y };
  if (g.placed) { lblAvoid(g.tx, g.ty, 16); c.fillStyle = '#fffaf2'; c.strokeStyle = GLC.ink; c.lineWidth = 2; c.beginPath(); c.arc(g.tx, g.ty, 7, 0, 7); c.fill(); c.stroke(); }   // the white top handle (drag it to change the length)
  if (roped) drawRopePx(c, g.hook, g.top, 3, 0);
  if (WS.mach === 'build' && LS.pl.block && g.n) { lsSheaves(c, g.top.x + 12, g.top.y - 22, g.n); }
  if (g.winch) {
    const cl = 1 + 0.35 * (WS.bw || 2), spin = prog * 4 * Math.PI, rr = Math.max(8, 0.55 * K * 0.5);
    lsGL(K, () => glDrawWinch(c, { x: g.wc.x / K, y: (LS_FLOOR - g.wc.y) / K, s: 0.5, crank: cl }, false, spin));
    const gx = g.wc.x + Math.cos(spin) * rr * cl, gy = g.wc.y + Math.sin(spin) * rr * cl, tx = -Math.sin(spin), ty = Math.cos(spin);
    if (lsGate()) arrow(c, gx - tx * 4, gy - ty * 4, gx + tx * 40, gy + ty * 40, WSC.red, 4);
    ep = { x: gx + tx * 40, y: gy + ty * 40 }; if (winchOn) drawRopePx(c, g.top, g.wc, 3, 0);
  } else if (lsReady() && roped) { wsSpring(c, g.top.x, g.top.y, g.T.x + 20, g.T.y - 6, null); ep = { x: g.T.x + 20, y: g.T.y - 6 }; lblAdd('pull', g.T.x - 8, g.T.y - 46, { size: 11, col: WSC.red, bg: '#fff', border: WSC.red, prio: 3 }); }
  if (r === 'ramp' || WS.mach === 'ramp') { lsHookDot(c, g.hook.x, g.hook.y, roped); if (g.placed || WS.mach !== 'ramp') lsHookDot(c, g.top.x, g.top.y, roped); }
  if (g.winch) lsHookDot(c, g.wd.x, g.wd.y, winchOn); else if (g.slot && g.placed) lsHookDot(c, g.T.x, g.T.y, false);
  return ep;
}
/* wedge: the Workshop's old wedge picture is kept as the demonstration (thickness is set in the panel) */
const lsDrawWedgeScene = (c, cur, riseNow, prog) => wsDrawWedge(c, cur, riseNow, prog);
function lsDrawJackScene(c, cur, riseNow, prog) {
  const cx = 330, K = 60, liftPx = riseNow * 300, turnsNow = cur.turns != null ? cur.turns * prog : 0, placed = !!LS.pl.jack, py = 322 - liftPx;
  c.fillStyle = WSC.red; c.beginPath(); c.roundRect(cx - 90, py - 50, 180, 38, 12); c.fill(); c.fillStyle = WSC.glass; c.beginPath(); c.roundRect(cx - 50, py - 78, 110, 32, 10); c.fill();
  c.fillStyle = WSC.ink; [[-52, 0], [52, 0]].forEach(([a]) => { c.beginPath(); c.arc(cx + a, py - 12 + (placed ? 0 : 20), 17, 0, 7); c.fill(); });
  lblAdd(`Car ${fmt(WS.load, 0)} N`, cx + 8, py - 100, { size: 12, prio: 2, tx: cx + 8, ty: py - 52 });
  if (placed) {
    lsGL(K, () => glDrawJack(c, { x: cx / K, rise: WS.lift, s: 0.5, vis: 10, gap: 0.1 + 0.28 * WS.pitch }, { start: { x: 0, y: 0 } }, false, prog));
    const a = Math.min(turnsNow, 8) * 6.2832, hl = (WS.per / 120) * 74 * Math.abs(Math.cos(a)), hx = cx + 14 + hl * Math.sign(Math.cos(a) || 1), hy = 334;
    c.strokeStyle = WSC.wood2; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx + 12, hy); c.lineTo(hx, hy); c.stroke(); c.fillStyle = WSC.red; c.beginPath(); c.arc(hx, hy, 9, 0, 7); c.fill();
    arrow(c, hx + 6, hy - 14, hx + 6, hy - 50, WSC.red, 4);
    const mk = wsMasked(), tn = Math.floor(turnsNow + 1e-6); c.fillStyle = '#0d171d'; c.beginPath(); c.roundRect(cx + 108, 280, 108, 40, 8); c.fill(); txt(c, 'TURNS', cx + 162, 291, '#cfd8dd', `800 9px ${C.fb}`); txt(c, mk.has('turns') ? '?' : String(tn), cx + 162, 308, '#9ef0b2', `700 18px ${C.fn}`);
    return { x: hx + 8, y: hy - 50 };
  }
  return { x: cx, y: 200 };
}
function lsDrawScene(c, cur, riseNow, prog) {
  const m = lsSc(); if (m === 'wedge') return lsDrawWedgeScene(c, cur, riseNow, prog); if (m === 'screw') return lsDrawJackScene(c, cur, riseNow, prog);
  return lsRoute() === 'ramp' || (m === 'build' && lsRoute() === 'none' && LS.o.tray.includes('ramp')) ? lsDrawRampScene(c, cur, riseNow, prog) : lsDrawCraneScene(c, cur, riseNow, prog);
}
/* the rope strands of a joined pair are drawn inside the scene drawings; this draws every end's dot is done there too */

/* ---------- where a piece can be dropped ---------- */
function lsZones(t) {
  if (lsIsTwo()) return lsTwoZones(t);
  const r = lsRoute(), box = (x, y, rr) => ({ x0: x - rr, y0: y - rr, x1: x + rr, y1: y + rr }), Z = [];
  if (t === 'block') { if (r === 'crane') { const g = lsGeoCrane(0, 0); Z.push(box(g.load.x, g.load.y - 14, 46), box(g.top.x, g.top.y, 46)); } else if (r === 'ramp') { const g = lsGeoRamp(0); Z.push(box(g.top.x, g.top.y - 10, 50)); } }
  else if (t === 'winch') { if (r === 'crane') { const g = lsGeoCrane(0, 0); Z.push({ x0: g.xr - 40, x1: g.wc.x + 52, y0: 236, y1: LS_FLOOR }); } else if (r === 'ramp') { const g = lsGeoRamp(0); Z.push({ x0: g.tx - 10, x1: g.tx + LS_PLW + 20, y0: g.ty - 96, y1: g.ty + 6 }); } }
  else if (t === 'ramp') { const g = lsGeoRamp(0); Z.push({ x0: LS_FX - 30, x1: g.tx + LS_PLW + 20, y0: g.ty - 54, y1: LS_FLOOR + 6 }); }
  else if (t === 'crane') { const g = lsGeoCrane(0, 0); Z.push({ x0: g.cx - 130, x1: g.cx + 130, y0: g.topY, y1: LS_FLOOR + 6 }); }
  else if (t === 'jack') Z.push({ x0: 270, x1: 390, y0: 296, y1: LS_FLOOR + 6 });
  return Z;
}
const lsInZones = (t, x, y) => lsZones(t).some(z => x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1);
function lsHasP(t) { if (lsIsTwo()) return !!(LS.two && LS.two[t]); return !!LS.pl[t]; }
function lsPick(t) {   // a tray piece of the other machine switches the bench to that machine first
  if (t === 'crane' && !lsIsTwo() && WS.mach === 'ramp' && WS.allow.includes('winch')) { wsSetMach('winch'); return; }
  const P = LS_PIECES[t]; if (lsIsTwo() || !P || !P.mach || WS.mach === P.mach || !WS.allow.includes(P.mach)) return; wsSetMach(P.mach);
}
const lsZoneMsg = t => ({ block: 'Drop the pulley block on a ◉ hook. It glows where it goes.', winch: 'Drop the winch on the end of the rope. It glows where it goes.', ramp: 'Drop the ramp so its foot is on the floor and its top is on the platform.', jack: 'Drop the screw jack under the car.', crane: `Drop the crane gantry over the ${WS.loadShort}.` })[t] || 'Drop it on the glowing spot.';
function lsDropSc(t, x, y) {
  if (lsIsTwo()) return lsTwoDrop(t, x, y);
  if (lsHasP(t)) return;
  if (lsWait(t)) { toast(lsWaitMsg()); return; }
  if (!lsInZones(t, x, y)) { LS.flash = performance.now(); LS.flashPiece = t; LS.flashMsg = lsZoneMsg(t); toast(lsZoneMsg(t)); return; }
  lsPlace(t);
}
function lsPlace(t) {
  LS.flash = 0; const m = WS.mach, r = lsRoute();
  if (t === 'block') { LS.pl.block = true; if (m === 'pulley') wsSet('ropes', Math.max(2, WS.ropes)); else if (m === 'build') wsSet('bn', WS.bn || 2); if (r === 'crane') { lsUnropePair('load', 'top'); lsRope('blk', 'top'); } }
  else if (t === 'winch') { LS.pl.winch = true; if (m === 'build') wsSet('bw', WS.bw || 2); lsRope('top', 'wd'); }
  else if (t === 'ramp') { LS.pl.ramp = true; LS.pl.crane = false; if (m === 'build') { wsSet('br', 6); LS.cab = LS.cab.filter(q => !(q.includes('blk'))); if (lsJoined('load', 'top')) LS.cab = LS.cab.filter(q => !(q.includes('top') && q.includes('load'))); } }
  else if (t === 'crane') { LS.pl.crane = true; LS.pl.ramp = false; if (m === 'build') wsSet('br', 0); LS.cab = []; lsRope('load', 'top'); if (LS.pl.block) { lsUnropePair('load', 'top'); lsRope('blk', 'top'); } if (LS.pl.winch) lsRope('top', 'wd'); }
  else if (t === 'jack') { LS.pl.jack = true; wsSetMach('screw'); }
  lsTouch(); toast(t === 'crane' ? '✓ Crane gantry on the bench. Roped!' : `✓ ${LS_PIECES[t].name} on the bench!`, 'ok'); lsRender();
  if (!lsSeen()[t] && !FAST) lsShowCards(t, true);
}
function lsUnropePair(a, b) { const n = LS.cab.length; LS.cab = LS.cab.filter(q => !((q[0] === a && q[1] === b) || (q[0] === b && q[1] === a))); return LS.cab.length !== n; }
function lsRemove(t) {
  if (lsLocked(t)) return; const m = WS.mach;
  if (t === 'block') { LS.pl.block = false; if (m === 'pulley') wsSet('ropes', 1); else if (m === 'build') wsSet('bn', 0); lsUnropePair('blk', 'top'); if (lsRoute() === 'crane') lsRope('load', 'top'); }
  else if (t === 'winch') { LS.pl.winch = false; if (m === 'build') wsSet('bw', 0); lsUnropePair('top', 'wd'); }
  else if (t === 'ramp') { LS.pl.ramp = false; if (m === 'build') wsSet('br', 0); lsUnropePair('load', 'top'); }
  else if (t === 'crane') { LS.pl.crane = false; LS.cab = []; if (m === 'build') wsSet('br', 0); if (LS.o.tray.includes('crane') && !LS.o.tray.includes('ramp')) { if (LS.pl.block) { LS.pl.block = false; wsSet(m === 'pulley' ? 'ropes' : 'bn', m === 'pulley' ? 1 : 0); } if (LS.pl.winch) { LS.pl.winch = false; if (m === 'build') wsSet('bw', 0); } } }
  else if (t === 'jack') { LS.pl.jack = false; if (WS.allow.includes('wedge')) wsSetMach('wedge'); }
  lsTouch(); lsRender();
}

/* ---------- the pointer: the ramp's white handle and the platform's top edge ---------- */
function lsHitSc(p) {
  const m = lsSc(); if (m === 'ramp' && LS.pl.ramp) {
    const g = lsGeoRamp(0); if (Math.hypot(p.x - g.tx, p.y - g.ty) <= 18) return { what: 'rampL' };
    if (WS.rampH && p.x >= g.tx - 4 && p.x <= g.tx + LS_PLW + 4 && Math.abs(p.y - g.ty) <= 14) return { what: 'rampH' };
  }
  return null;
}
function lsMoveSc(d, p) {
  const g = lsGeoRamp(0);
  if (d.what === 'rampL') wsSet('L', Math.hypot(Math.max(.05, (p.x - g.fx) / g.K), g.h));
  else if (d.what === 'rampH') wsSet('h', (LS_FLOOR - p.y) / g.K);
}

/* ---------- the glow where a piece goes, the drag handles, and the first-time cards' ghost hand ---------- */
function lsOverlaySc(c, pulse) {
  const t = LS.dragPiece || LS.place;
  if (t && !lsHasP(t)) { lsZones(t).forEach((z, i) => { c.save(); c.shadowColor = GLC.glow; c.shadowBlur = 10 + 14 * pulse; c.strokeStyle = `rgba(126,240,168,${.6 + .4 * pulse})`; c.lineWidth = 3; c.setLineDash([7, 5]); c.beginPath(); c.roundRect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0, 12); c.stroke(); c.restore();
    c.fillStyle = `rgba(126,240,168,${.1 + .1 * pulse})`; c.beginPath(); c.roundRect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0, 12); c.fill(); if (i === 0) wsLabel(c, 'Drop here', (z.x0 + z.x1) / 2, Math.max(14, z.y0 - 12), '#2a7d48', 'center'); }); }
  if (lsSc() === 'ramp' && LS.pl.ramp && !WS.busy) {   // a ring and arrows on the white handle
    const g = lsGeoRamp(0); lblAvoid(g.tx, g.ty, 34); c.save(); c.strokeStyle = `rgba(255,226,138,${.55 + .4 * pulse})`; c.lineWidth = 2.5; c.setLineDash([6, 4]); c.beginPath(); c.arc(g.tx, g.ty, 15, 0, 7); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(31,29,38,.7)'; c.beginPath(); c.roundRect(g.tx - 27, g.ty + 18, 54, 17, 8); c.fill(); txt(c, '◀ drag ▶', g.tx, g.ty + 27, '#ffe28a', `800 10px ${C.fb}`); c.restore();
    if (WS.rampH) { c.save(); c.strokeStyle = `rgba(255,226,138,${.55 + .4 * pulse})`; c.lineWidth = 2.5; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(g.tx + 6, g.ty - 3); c.lineTo(g.tx + LS_PLW - 6, g.ty - 3); c.stroke(); c.restore(); lblAvoid(g.tx + 40, g.ty - 12, 30); }
  }
  if (lsIsTwo()) lsTwoOverlay(c, pulse);
}
function lsAnchor(piece) {
  const z = lsZones(piece)[0]; if (z && !lsHasP(piece)) return { x: (z.x0 + z.x1) / 2, y: (z.y0 + z.y1) / 2 };
  if (piece === 'crane') { const g = lsGeoCrane(0, 0); return { x: g.cx, y: g.topY + 12 }; }
  if (piece === 'ramp' && lsSc() === 'ramp') { const g = lsGeoRamp(0); return { x: g.tx, y: g.ty }; }
  if (piece === 'cables') { const E = lsEndsSc(), k = Object.keys(E)[0]; if (k) return E[k]; }
  if (piece === 'block') { const g = lsGeoCrane(0, 0); return { x: g.cx, y: g.blkC.y }; }
  if (piece === 'winch') { const g = lsGeoCrane(0, 0); return { x: g.wc.x, y: g.wc.y }; }
  if (piece === 'jack') return { x: 330, y: 330 };
  return { x: 360, y: 240 };
}
function lsGhostNew(c, piece, kind, t) {
  const A = lsAnchor(piece), P = LS_PIECES[piece]; let x = A.x + 6, y = A.y + 14 + 5 * Math.sin(t * 5), down = false;
  if (kind === 'drop' && !lsHasP(piece)) { const e = (t % 2.6) / 2.6, k = e < .15 ? 0 : e > .85 ? 1 : (e - .15) / .7; x = A.x + 120 * (1 - k) + 6; y = A.y + 70 * (1 - k) + 14; down = true; c.save(); c.globalAlpha = .55; c.font = '30px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(P.icon, x - 8, y - 22); c.restore(); }
  else if (kind === 'drag') { x = A.x + 34 * Math.sin(t * 1.7) + 6; y = A.y + 14; down = true; }
  else if (kind === 'cable') { const E = lsEndsSc(), ks = Object.keys(E); if (ks.length > 1) { const a = E[ks[0]], b = E[ks[1]], k = (t % 2.4) / 2.4; x = a.x + (b.x - a.x) * k + 6; y = a.y + (b.y - a.y) * k + 14; down = true; drawRopePx(c, a, { x: x - 6, y: y - 14 }, 3, 0); } }
  else if (kind === 'press') { const bt = $('#wsPull'); if (bt && bt.offsetParent) { const r = bt.getBoundingClientRect(), cr = lsCanvas().getBoundingClientRect(); x = clamp((r.left + r.width / 2 - cr.left) * 900 / cr.width, 40, 860); y = clamp((r.top - cr.top) * WS_H / cr.height - 12, 20, 410); } }
  c.save(); c.font = '34px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(down ? '✊' : '👆', x, y); c.restore();
}

/* ---------- the drag ghost: the piece's own board drawing, alone on a clear board, at the board's screen scale (ndGhostBegin in 4n-boardkit.js) ---------- */
function lsGhostDraw(t, c) {
  if (lsIsTwo()) { const g = lsTwoGeo(), K = g.K;
    if (t === 'ramp') lsGL(K, () => glDrawRamp(c, { L: g.L, rise: g.h, x1: g.fx / K, y1: 0, s: 0.32 }, { start: { x: g.fx / K, y: 0 }, end: { x: g.fx / K + g.run, y: g.h } }, false, lsFlat()));
    else if (t === 'crane') lsGL(K, () => glDrawCrane(c, { x: g.gx / K, rise: 2.2, s: 0.5 }, { start: { x: 0, y: g.h } }, false, (LS_FLOOR - g.craneHook.y) / K)); return; }
  if (t === 'lever') { const G = lsLever(0, { la: 1, ea: 1 }); lsBarAndFulcrum(c, G); }
  else if (t === 'crane') { const g = lsGeoCrane(0, 0), K = g.K; lsGL(K, () => glDrawCrane(c, { x: g.cx / K, rise: (LS_FLOOR - g.topY) / K - 1.3, s: 0.5 }, { start: { x: 0, y: 0 } }, false, (LS_FLOOR - g.top.y) / K)); }
  else if (t === 'block') lsSheaves(c, LS_CX, 200, 2);
  else if (t === 'winch') { const g = lsGeoCrane(0, 0), K = g.K; lsGL(K, () => glDrawWinch(c, { x: g.wc.x / K, y: (LS_FLOOR - g.wc.y) / K, s: 0.5, crank: 1.7 }, false, 0)); }
  else if (t === 'ramp') { const g = lsGeoRamp(0), K = g.K; lsGL(K, () => glDrawRamp(c, { L: g.L, rise: g.h, x1: g.fx / K, y1: 0, s: 0.32 }, { start: { x: g.fx / K, y: 0 }, end: { x: g.fx / K + g.run, y: g.h } }, false, lsFlat())); }
  else if (t === 'jack') lsGL(60, () => glDrawJack(c, { x: LS_CX / 60, rise: WS.lift, s: 0.5, vis: 10, gap: 0.1 + 0.28 * WS.pitch }, { start: { x: 0, y: 0 } }, false, 0));
}
const lsGhostStart = t => { const cv = lsCanvas(); if (!cv) return; ndGhostBegin(900, WS_H, cv.getBoundingClientRect().width / 900, c => lsGhostDraw(t, c)); };

/* ---------- the docked panel ---------- */
const lsTroRows = () => { const a = lsAcross(), d = LS.adir || (a < 0 ? -1 : 1);
  return lsPM('across', 'Move across', a ? `${fmt(Math.abs(a), 1)} m ${a < 0 ? 'left' : 'right'}` : '0 m', !a, Math.abs(a) >= 4 - 1e-9) + `<div class="glrow"><span>Direction</span><button type="button" class="ghost sm ${d < 0 ? 'on' : ''}" data-lm="adir:-1">Left</button><button type="button" class="ghost sm ${d > 0 ? 'on' : ''}" data-lm="adir:1">Right</button></div>`
    + (a ? (lsTroOk() ? '<p class="glnote">The trolley carries the load across, then sets it down on the glowing spot. Carrying it across adds no lifting work.</p>' : `<p class="glnote">Nothing to set it on there. Move across until the glow is on the ${lsHoldName()}${WS.lifts && WS.lifts.pick ? ', and lift the same height as it' : ''}.</p>`) : `<p class="glnote">The trolley rolls along the top beam. Move across, then it sets the load down on the ${lsHoldName()}.</p>`); };
const lsPM = (k, lab, val, atMin, atMax) => `<div class="glrow"><span>${lab}</span><button type="button" class="ghost sm" data-lm="${k}-" aria-label="Less" ${atMin ? 'disabled' : ''}>−</button><b>${val}</b><button type="button" class="ghost sm" data-lm="${k}+" aria-label="More" ${atMax ? 'disabled' : ''}>+</button></div>`;
const lsChoice = (k, lab, opts, cur) => `<div class="glrow wrap"><span>${lab}</span></div><div class="glrow wrap" style="margin-top:0">${opts.map(([v, l]) => `<button type="button" class="ghost sm ${String(v) === String(cur) ? 'on' : ''}" data-lm="${k}:${v}" aria-pressed="${String(v) === String(cur)}">${l}</button>`).join('')}</div>`;
const lsRm = t => lsLocked(t) ? '' : `<button type="button" class="ghost sm" data-lm="rm:${t}">🗑 Remove</button>`;
const lsMAshown = () => wsHas('readMA') && !wsMasked(wsRecord(wsCalc())).has('readMA');
function lsRopeRow(label) {
  const need = lsNeed(); if (!need.length) return ''; const ok = need.every(([a, b]) => lsJoined(a, b)), what = label || 'The load is roped';
  return `<div class="glrow"><span>Rope</span><b class="dkrope ${ok ? 'ok' : 'no'}">${ok ? '✓ ' + what : 'not roped yet'}</b></div>`;
}
const lsRopeAct = () => { const need = lsNeed(); return need.length ? (need.every(([a, b]) => lsJoined(a, b)) ? '<button type="button" class="ghost sm" data-lm="unrope">✂ Take the rope off</button>' : '<button type="button" class="ghost sm" data-lm="rope">🪢 Join the ropes</button>') : ''; };
function lsTabs() {
  if (WS.allow.length < 2) return '';
  return `<div class="glrow wrap lstabs" role="tablist">${WS.allow.map(m => `<button type="button" class="ghost sm ${WS.mach === m ? 'on' : ''}" role="tab" aria-selected="${WS.mach === m}" data-lm="tab:${m}">${WS_ICON[m]} ${({ winch: 'Winch', ramp: 'Ramp', wedge: 'Wedge', screw: 'Screw jack' })[m] || WS_MACH[m]}</button>`).join('')}</div>`;
}
function lsDockSc() {
  const m = WS.mach, ml = lsMAshown(), S_ = [], tabs = lsTabs(), roped = lsRopeRow();
  const sec = (icon, title, help, body, actions) => dkHTML({ icon, title, help, body, actions });
  if (lsIsTwo()) return lsTwoDock();
  if (m === 'wedge') return tabs + sec('🪓', 'Wedge', '', lsChoice('thick', 'Thickness', [[10, '10 cm'], [5, '5 cm'], [4, '4 cm'], [2, '2 cm']].filter(x => !WS.lim.thick || WS.lim.thick.includes(x[0])), WS.thick) + (ml ? `<div class="glrow"><span>MA</span><b>×${fmt(wsCalc().ma, 2)}</b></div>` : '') + '<p class="glnote">The wedge is 20 cm long. A thinner wedge is a longer, gentler ramp. Press ▶ Push! to split the log.</p>', '');
  if (m === 'screw') return tabs + sec('🔩', 'Screw jack', 'jack', LS.pl.jack ? lsChoice('per', 'Handle circle', [[60, '60 cm'], [120, '120 cm'], [180, '180 cm']], WS.per) + lsChoice('pitch', 'Gap between threads', [[0.2, '0.2 cm'], [0.5, '0.5 cm'], [1.0, '1.0 cm']].filter(x => !WS.lim.pitch || WS.lim.pitch.includes(x[0])), WS.pitch) + (ml ? `<div class="glrow"><span>MA</span><b>×${fmt(wsCalc().ma, 2)}</b></div>` : '') + `<p class="glnote">One turn moves the handle ${fmt(WS.per, 0)} cm and lifts the car ${fmt(WS.pitch, 1)} cm, the gap between threads.</p>` : '<p class="glnote">Drag the ⚙ screw jack from the tray under the car. It glows and snaps into place.</p>', LS.pl.jack ? lsRm('jack') : '');
  const r = lsRoute(), out = [];
  const cw = lsNoCrane(), cwNote = `<p class="glnote">${lsWaitMsg()}</p>`, craneNone = `<p class="glnote">Drag the 🏗️ crane gantry from the tray over the ${WS.loadShort}. It snaps on and ropes to the hook.</p>`;
  if (m === 'pulley') {
    out.push(sec('🏗️', 'Crane gantry', 'crane', LS.pl.crane || !LS.o.tray.includes('crane') ? lsRopeRow('the crate is roped to the hook') .replace('the crate', `the ${WS.loadShort}`) + (WS.lifts && WS.lifts.pick ? lsChoice('lift', 'Lift height', [[1, '1 m'], [2, '2 m']], WS.lift) : '') + (lsTro() ? lsTroRows() : '') + '<p class="glnote">The rope goes from the load, up over the top, and down to Smooshy.</p>' : craneNone, LS.pl.crane ? lsRm('crane') : ''));
    out.push(sec('🪢', 'Pulley block', 'block', LS.pl.block ? lsPM('ropes', 'Supporting ropes', WS.ropes, WS.ropes <= 1, WS.ropes >= (WS.lim.ropesMax || 6)) + (ml ? `<div class="glrow"><span>MA</span><b>×${WS.ropes}</b></div>` : '') + '<p class="glnote">More supporting ropes share the load, so Smooshy pulls less (and pulls more rope).</p>' : cw ? cwNote : `<p class="glnote">Drag the 🪢 pulley block from the tray onto a ◉ hook. With no block there is 1 rope.</p>`, LS.pl.block ? lsRm('block') : ''));
  } else if (m === 'winch') {
    out.push(sec('🏗️', 'Crane gantry', 'crane', LS.pl.crane || !LS.o.tray.includes('crane') ? lsRopeRow('the rope runs to the winch') + (lsTro() ? lsTroRows() : '') + '<p class="glnote">The rope runs from the load, up over the top, and down to the ◉ rope end.</p>' : craneNone, LS.pl.crane ? lsRm('crane') : ''));
    out.push(sec('⚙️', 'Winch', 'winch', LS.pl.winch ? lsPM('R', 'Handle radius', fmt(WS.R, 2) + ' m', WS.R <= wsLimits('R').min + 1e-9, WS.R >= wsLimits('R').max - 1e-9) + (WS.axleEdit ? lsPM('axle', 'Axle radius', fmt(WS.axle, 2) + ' m', WS.axle <= 0.04 + 1e-9, WS.axle >= 0.1 - 1e-9) : `<div class="glrow"><span>Axle radius</span><b>${fmt(WS.axle, 2)} m</b></div>`) + (ml ? `<div class="glrow"><span>MA</span><b>×${fmt(wsCalc().ma, 2)}</b></div>` : '') + '<p class="glnote">A bigger handle means an easier turn, but more turning.</p>' : cw ? cwNote : '<p class="glnote">Drag the ⚙ winch from the tray onto the ◉ end of the rope.</p>', LS.pl.winch ? lsRm('winch') : ''));
  } else if (m === 'ramp') {
    const lm = wsLimits('L'), hm = wsLimits('h');
    out.push(sec('📐', 'Ramp', 'ramp', LS.pl.ramp ? lsPM('L', 'Length', fmt(WS.L, 1) + ' m', WS.L <= lm.min + 1e-9, WS.L >= lm.max - 1e-9) + (WS.rampH ? lsPM('h', 'Height', fmt(WS.h, 1) + ' m', WS.h <= hm.min + 1e-9, WS.h >= hm.max - 1e-9) : `<div class="glrow"><span>Height</span><b>${fmt(WS.h, 1)} m</b></div>`) + (ml ? `<div class="glrow"><span>MA</span><b>×${fmt(wsCalc().ma, 2)}</b></div>` : '') + lsRopeRow('the cart is roped to the top') + '<p class="glnote">Drag the white handle at the top of the ramp, or use − and +. A longer ramp means a smaller pull, but further to go.</p>' : '<p class="glnote">Drag the 📐 ramp from the tray in. Its foot sits on the floor and its top rests on the platform.</p>', (LS.pl.ramp ? lsRopeAct() : '') + (LS.pl.ramp ? lsRm('ramp') : '')));
  } else if (m === 'build') {
    const tot = wsCalc(); out.push(sec('🔗', 'Machine chain', 'cables', `<div class="glrow"><span>Route</span><b>${r === 'ramp' ? '6 m ramp' : r === 'crane' ? 'crane gantry' : LS.o.tray.includes('ramp') ? 'choose one' : 'add the crane gantry'}</b></div>` + lsRopeRow() + (lsTro() ? lsTroRows() : '') + ((wsHas('bTotMA') || wsHas('readMA')) && !wsMasked(wsRecord(tot)).has('bTotMA') && !wsMasked(wsRecord(tot)).has('readMA') ? `<div class="glrow"><span>Total MA</span><b>${fmt(tot.ma, 2)}</b></div>` : '') + '<p class="glnote">Drag from one ◉ to the next to join them. Smooshy works the last machine in the chain.</p>', lsRopeAct() + (r !== 'none' && !lsLocked(r) ? lsRm(r) : '')));
    if (LS.pl.ramp && WS.bRoutes.filter(q => q[0] > 0).length > 1) out.push(sec('📐', 'Ramp', 'ramp', lsChoice('br', 'Ramp length', WS.bRoutes.filter(q => q[0] > 0).map(q => [q[0], q[0] + ' m']), WS.br) + '<p class="glnote">A longer ramp means a smaller pull, but more cable.</p>', ''));
    if (LS.o.tray.includes('block') || LS.pl.block) out.push(sec('🪢', 'Pulley block', 'block', LS.pl.block ? lsChoice('bn', 'Supporting ropes', WS.bRopes.filter(v => v > 0).map(v => [v, String(v)]), WS.bn) + '<p class="glnote">More supporting ropes share the load.</p>' : cw ? cwNote : '<p class="glnote">Drag the 🪢 pulley block from the tray onto a ◉ hook.</p>', LS.pl.block ? lsRm('block') : ''));
    if (LS.o.tray.includes('winch') || LS.pl.winch) out.push(sec('⚙️', 'Winch', 'winch', LS.pl.winch ? lsChoice('bw', 'Winch ×', WS.bWinches.map(v => [v, '×' + v]), WS.bw) + '<p class="glnote">Smooshy turns the winch handle. Its rope winds round the axle.</p>' : cw ? cwNote : '<p class="glnote">Drag the ⚙ winch from the tray onto the ◉ end of the rope.</p>', LS.pl.winch ? lsRm('winch') : ''));
    if (LS.o.tray.includes('ramp') && LS.stage !== 'two') out.push(`<button type="button" class="go sm" data-lm="two:start" style="margin-top:8px" ${lsK3Open() ? '' : 'disabled'}>➡ Two-leg practice</button><p class="glnote">${lsK3Open() ? 'Next: a crane lifts a crate onto a shelf, then a ramp takes it up.' : 'Finish the generator job first.'}</p>`);
  }
  return tabs + out.join('<hr class="dkhr">');
}
function lsSceneAct(k) {
  const [a, v] = k.split(':'), num = +v;
  if (a === 'tab') { wsSetMach(v); lsRender(); return true; }
  if (a === 'rm') { lsRemove(v); return true; }
  if (a === 'thick' || a === 'per' || a === 'pitch' || a === 'lift' || a === 'bn' || a === 'bw' || a === 'br') { wsSet(a, num); return true; }
  if (k === 'across-' || k === 'across+') { lsTroStep(k); wsRenderControls(); lsRender(); return true; }
  if (a === 'adir') { LS.adir = num; if (LS.across) LS.across = Math.abs(LS.across) * num; wsRenderControls(); lsRender(); return true; }
  if (k === 'two:start') { lsTwoStart(); return true; }
  if (k === 'two:back') { lsTwoBack(); return true; }
  if (k === 'ropes-' || k === 'ropes+') { wsSet('ropes', WS.ropes + (k === 'ropes+' ? 1 : -1)); return true; }
  if (k === 'R-' || k === 'R+') { wsSet('R', WS.R + (k === 'R+' ? 0.05 : -0.05)); return true; }
  if (k === 'axle-' || k === 'axle+') { wsSet('axle', WS.axle + (k === 'axle+' ? 0.01 : -0.01)); return true; }
  if (k === 'L-' || k === 'L+') { wsSet('L', WS.L + (k === 'L+' ? 1 : -1) * wsLimits('L').step); return true; }
  if (k === 'h-' || k === 'h+') { wsSet('h', WS.h + (k === 'h+' ? 0.2 : -0.2)); return true; }
  if (k === 'rope') { const n = lsNeed().find(([x, y]) => !lsJoined(x, y)); if (n) lsAutoRope(n[0], n[1]); return true; }
  if (k === 'unrope') { const n = lsNeed()[0]; if (n) { lsUnropePair(n[0], n[1]); wsRenderControls(); } return true; }
  return false;
}
function lsStatusSc() {
  const m = WS.mach, o = LS.o;
  if (lsIsTwo()) return lsTwoStatus();
  if (lsNoCrane() && !LS.o.tray.includes('ramp')) return `Drag the 🏗️ crane gantry from the tray over the ${WS.loadShort}.`;
  if (lsTro() && !lsTroOk()) return lsAcross() ? `Nothing to set the load on there. Move across until the glow is on the ${lsHoldName()}${WS.lifts && WS.lifts.pick ? ', and lift the same height as it' : ''}.` : `Move across until the glow sits on the ${lsHoldName()}, then press the button.`;
  if (m === 'wedge') return 'The wedge is a demonstration: pick a thickness in the panel, then press ▶ Push!';
  if (m === 'screw') return LS.pl.jack ? 'Pick the handle circle and the thread gap in the panel, then press ▶ Turn!' : 'Drag the ⚙ screw jack from the tray under the car.';
  if (m === 'winch' && !LS.pl.winch) return 'Drag the ⚙ winch from the tray onto the ◉ end of the rope.';
  if (m === 'ramp' && !LS.pl.ramp) return 'Drag the 📐 ramp from the tray in: its foot on the floor, its top on the platform.';
  if (m === 'pulley' && o.tray.includes('block') && !LS.pl.block) return 'Just the crane: 1 rope, so Smooshy pulls the full weight. Drag the 🪢 pulley block onto a ◉ hook to try more ropes.';
  if (m === 'build' && lsRoute() === 'none') return 'Choose a route: drag the 🏗️ crane gantry over the generator, or the 📐 ramp in beside it.';
  if (!lsGate()) return m === 'ramp' ? 'Rope the cart to the top of the ramp: drag from one ◉ to the other.' : 'The load isn\'t roped up yet. Drag a rope from one ◉ to the next, or press Join the ropes in the panel.';
  return m === 'ramp' ? 'Drag the white handle at the top of the ramp to change its length.' : m === 'build' ? 'Pick the winch and the supporting ropes in the panel, then press ▶ Turn!' : '';
}

/* ---------- the k3 two-leg practice (spec section 14): leg 1, the crane lifts the crate and its trolley sets it on a shelf; leg 2, a ramp from the shelf up to the platform ---------- */
const lsK3Open = () => !!(typeof shopHas === 'function' && shopHas({ mach: 'build', bw: 4, bn: 2, br: 6 })) || !!S.flags.k3built;
const lsK3Done = () => !!dbGet('k3two', false);
function lsTwoGeo() {
  const K = 36, cr = 170, h1 = 1.5, h2 = 3, sAc = 3, sw = 2.5, sx = cr + sAc * K, ty = LS_FLOOR - h1 * K, L = 4, rise = h2 - h1, run = Math.sqrt(L * L - rise * rise), fx = sx + 14, tx = fx + run * K, py = LS_FLOOR - h2 * K;
  return { K, cr, h1, h2, sAc, sw, sx, ty, L, rise, run, fx, tx, py, plx1: tx + 150, crate: { x: cr, y: LS_FLOOR }, cHook: { x: cr, y: LS_FLOOR - 47 }, craneHook: { x: cr, y: 244 }, gHook: { x: sx, y: ty - 47 },
    rampTop: { x: tx + 10, y: py - 26 }, craneRise: 2.4 };
}
const lsTwoAcross = () => (lsIsTwo() && LS.across) || 0;
/* the set-down must be on the shelf (the only surface within 0.5 m of the 1.5 m lift) */
const lsTwoAcrossOk = () => { const g = lsTwoGeo(), a = lsTwoAcross(); return a > 0 && Math.abs(a - g.sAc) <= g.sw / 2 + 1e-9; };
const lsTwoLeg1 = () => !!(LS.two && LS.two.crane && lsJoined('c', 'ch') && lsTwoAcrossOk());
function lsTwoStart() {
  if (!lsK3Open()) return; LS.cabMain = LS.cab; LS.cab = []; LS.stage = 'two'; LS.two = { ramp: false, crane: false }; LS.place = null; LS.across = 0; LS.adir = 0;
  wsResetLoad(); lsRender(); if (!FAST && !lsSeen().platform) lsShowCards('platform');
}
function lsTwoBack() { LS.stage = 'main'; LS.two = null; LS.across = 0; LS.adir = 0; LS.cab = LS.cabMain || []; LS.place = null; wsResetLoad(); wsRenderControls(); lsRender(); }
function lsTwoZones(t) {
  const g = lsTwoGeo(), Z = [];
  if (t === 'crane') Z.push({ x0: g.cr - 70, x1: g.cr + 70, y0: LS_FLOOR - 120, y1: LS_FLOOR + 6 });
  if (t === 'ramp' && lsTwoLeg1()) Z.push({ x0: g.sx - 40, x1: g.sx + 70, y0: g.ty - 44, y1: g.ty + 8 });
  return Z;
}
function lsTwoDrop(t, x, y) {
  if (!LS.two || LS.two[t]) return;
  if (t === 'ramp' && !lsTwoLeg1()) { toast('Build leg 1 first: the crane lifts the crate, and Move across sets it on the shelf.'); return; }
  if (!lsInZones(t, x, y)) { LS.flash = performance.now(); LS.flashPiece = t; LS.flashMsg = t === 'crane' ? 'Put the crane in the glowing box, over the crate.' : 'Put the foot of the ramp in the glowing box, on the shelf.'; toast(LS.flashMsg); return; }
  LS.flash = 0; LS.two[t] = true; if (t === 'crane') lsRope('c', 'ch'); toast(`✓ ${t === 'ramp' ? 'Ramp' : 'Crane gantry'} in the box!`, 'ok'); lsTwoCheck(); lsRender();
}
const lsTwoPairs = () => LS.two ? [LS.two.crane ? ['c', 'ch'] : null, LS.two.ramp ? ['g', 'rt'] : null].filter(Boolean) : [];
function lsTwoEnds() { const g = lsTwoGeo(), E = { c: g.cHook }; if (LS.two && LS.two.crane) E.ch = g.craneHook; if (lsTwoLeg1()) E.g = g.gHook; if (LS.two && LS.two.ramp) E.rt = g.rampTop; return E; }
function lsTwoCheck() {
  if (!LS.two || lsK3Done()) return; if (lsTwoLeg1() && LS.two.ramp && lsJoined('g', 'rt')) { dbSet('k3two', true); toast('✓ Two-leg route built! The crane sets the crate on the shelf, then the ramp takes it up.', 'ok'); if (typeof checkStep === 'function') checkStep(); }
}
function lsTwoStatus() {
  const T = LS.two || {};
  if (!T.crane) return 'Leg 1: drag the 🏗️ crane gantry into the glowing box over the crate.';
  if (!lsJoined('c', 'ch')) return 'Rope the crate to the crane: drag from its ◉ to the crane\'s ◉ hook.';
  if (!lsTwoAcrossOk()) return 'Use Move across in the panel until the glow sits on the shelf.';
  if (!T.ramp) return 'Leg 2: the crate on the shelf is where leg 1 ends. Drag the 📐 ramp into the glowing box beside it.';
  if (!lsJoined('g', 'rt')) return 'Rope the crate on the shelf to the top of the ramp: drag from one ◉ to the other.';
  return 'Two legs built: the crane, then the ramp. In the rescue you will build routes like this.';
}
function lsTwoDock() {
  const T = LS.two || {}, a = lsTwoAcross(), d = LS.adir || (a < 0 ? -1 : 1), row = (ok, s) => `<div class="glrow"><b class="dkrope ${ok ? 'ok' : 'no'}" style="text-align:left">${ok ? '✓' : '○'} ${s}</b></div>`;
  const mv = T.crane ? lsPM('across', 'Move across', a ? `${fmt(Math.abs(a), 1)} m ${a < 0 ? 'left' : 'right'}` : '0 m', !a, Math.abs(a) >= 4 - 1e-9) + `<div class="glrow"><span>Direction</span><button type="button" class="ghost sm ${d < 0 ? 'on' : ''}" data-lm="adir:-1">Left</button><button type="button" class="ghost sm ${d > 0 ? 'on' : ''}" data-lm="adir:1">Right</button></div>` + `<p class="glnote">The crane lifts the crate 1.5 m, to the height of the shelf.</p>` : '';
  return dkHTML({ icon: '🟩', title: 'Two-leg practice', help: 'platform', body: row(T.crane, 'Leg 1: crane gantry over the crate') + row(lsJoined('c', 'ch'), 'The crate is roped to the crane\'s hook') + mv + row(lsTwoAcrossOk(), 'Move across: the crate is set down on the shelf')
      + row(T.ramp, 'Leg 2: ramp from the shelf to the platform') + row(lsJoined('g', 'rt'), 'The crate on the shelf is roped to the ramp\'s top') + (lsK3Done() ? '<p class="glnote">Done! Nothing here is marked. It is practice for the rescue.</p>' : '<p class="glnote">Nothing here is marked. It is practice for the rescue.</p>'),
    actions: '<button type="button" class="ghost sm" data-lm="two:back">◀ Back to the generator</button>' });
}
function lsTwoDraw(c) {
  const g = lsTwoGeo(), K = g.K, T = LS.two || {}, t = performance.now() / 1000, a = lsTwoAcross(), ok = lsTwoAcrossOk();
  lsGL(K, () => { glDrawPlatform(c, { x0: (g.sx - g.sw * K / 2) / K, x1: (g.sx + g.sw * K / 2) / K, top: g.h1, base: 0, s: 0.32 }, false);   // the shelf
    glDrawPlatform(c, { x0: g.tx / K, x1: g.plx1 / K, top: g.h2, base: 0, s: 0.32 }, false);   // the platform
    if (T.ramp) glDrawRamp(c, { L: g.L, rise: g.rise, x1: g.fx / K, y1: g.h1, s: 0.32 }, { start: { x: g.fx / K, y: g.h1 }, end: { x: g.fx / K + g.run, y: g.h2 } }, false, lsFlat());
    const keep = [GL.hzX, GL.hzY]; GL.hzX = 1.6; GL.hzY = 0.6;
    try { if (!T.crane) glDrawZone(c, { x: g.cr / K, y: 0.4 }, t, null); else if (ok && !T.ramp && lsJoined('c', 'ch')) glDrawZone(c, { x: (g.sx + 30) / K, y: g.h1 }, t, null); } finally { GL.hzX = keep[0]; GL.hzY = keep[1]; }
    if (T.crane) { const lo = Math.min(0, a) * K, hi = Math.max(0, a) * K;
      glDrawCrane(c, { x: g.cr / K, rise: g.craneRise, s: 0.5 }, { start: { x: 0, y: 0 }, legL: { x: (g.cr + lo) / K - 1.6, y: 0 }, legR: { x: (g.cr + hi) / K + 1.6, y: 0 } }, false, (LS_FLOOR - g.craneHook.y) / K, a ? undefined : undefined);
      if (a) glDrawSetDown(c, { end: { x: (g.cr + a * K) / K, y: ok ? g.h1 : 0 } }, t, !ok); } });
  // the crate, the crate on the shelf (where leg 1 ends) with its hook, and the goal line
  lsLoadBox(c, g.crate.x, g.crate.y, 'Crate 235 N', lsJoined('c', 'ch'));
  if (lsTwoLeg1()) { c.save(); c.globalAlpha = .5; wsLoadBlock(c, g.sx, g.ty, 66, 40, 'crate', ''); c.restore(); c.strokeStyle = GLC.rope; c.lineWidth = 2; c.beginPath(); c.moveTo(g.sx, g.ty - 40); c.lineTo(g.gHook.x, g.gHook.y); c.stroke();
    lblAdd('Crate after leg 1', g.sx, g.ty - 86, { size: 11, col: '#c9ffdc', prio: 4, tx: g.sx, ty: g.ty - 24 }); }
  if (T.ramp) { lblAvoid(g.rampTop.x, g.rampTop.y, 14); }
  if (T.crane && lsJoined('c', 'ch')) drawRopePx(c, g.cHook, g.craneHook, 3, 0);
  if (T.ramp && lsJoined('g', 'rt')) drawRopePx(c, g.gHook, g.rampTop, 3, 0);
  const E = lsTwoEnds(); Object.keys(E).forEach(k => lsHookDot(c, E[k].x, E[k].y, lsTwoPairs().some(q => q.includes(k))));
}
function lsTwoOverlay(c, pulse) { /* the glowing boxes are drawn with the scene (glDrawZone) */ }
