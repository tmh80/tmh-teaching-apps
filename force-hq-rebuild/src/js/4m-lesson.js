/* ===== Chapter 6: lesson mode (Tom, 8 Nov 2026: "the engine they use when learning about a ramp, lever, pulley should be the same as the rescue") =====
   Spec: docs/Workshop_Lesson_Mode_Spec.md. A small version of the rescue builder on the Workshop bench: a parts tray (drag a piece in, tap a piece for its menu),
   things you drag on the board, and the same flat style. EVERY change goes through the Workshop's own model (wsSet / wsSetMach in 4a-workshop.js), so every number, task check
   and answer stays exactly as it was. The ▶ button is the Workshop's own #wsPull button and calls wsPull().
   The board is the Workshop canvas (900 x 430 units, 120 px per metre). The builder's colours (GLC) and the builder's menu and tray styles are shared; the lever is drawn here
   because the bench lever has three set-ups and a 2 m bar. A step switches lesson mode on with lessonStage({ ...wsSetup options, lesson: { tray: [...], pre: [...], lock: [...] } }).
   To add a piece for Parts 2 to 4: add it to LS_PIECES (name, icon, three cards), draw it in lsDrawMachine, give it a hit test in lsHit and a drop rule in lsDrop.
   ROPES TO THE LOAD (Tom, 8 Nov 2026): every load wears a hook ◉. A machine that pulls on the load needs a rope joining its rope end to that hook: LS.cab is the list of ropes
   the student has joined, [[endA, endB], ...], and lsEnds() lists every rope end on the bench this frame ({ id: {x, y} }; the load's hook is 'load'). lsNeedRopes() lists the pairs the current
   machine needs; the ▶ button stays off until they are all joined (LAB.pullGate). Drag from one ◉ to another to rope them, drag a rope off its ◉ into empty space to take it off, or use the
   panel's button. lsAutoRope(a, b) is for a drop rule that snaps a piece beside the load and clips its rope on. The lever needs none: the rock sits on the bar. A new piece adds its ends to
   lsEnds(), its pairs to lsNeedRopes() and its drawing to lsDrawMachine().
   THE PANEL: #lsDock beside the board (below it on a phone) always shows the step's piece (lsDockHTML), with its settings, "?" replay and Remove. No floating menus.
   Names to avoid reusing elsewhere (one shared scope): LS, LS_*, ls*, lessonStage. */
const LS = { cardQ: [], used: null, needKey: '', thT: 0, on: false, o: null, drag: null, place: null, dragPiece: null, bound: false, flash: 0, tdrag: false, cab: [], ropeMach: null, ropeLine: null };
const LS_K = 120, LS_X0 = 214, LS_FLOOR = 350;
const lsCap = s => s.replace(/^./, ch => ch.toUpperCase());
/* every piece: its tray tile and its three "first time" cards (the exact student text is in the spec, section 4) */
const LS_PIECES = {
  lever: { name: 'Lever', icon: '⚖️', note: 'drag it under the rock',
    cards: [
      { t: 'This is a lever: a long bar that turns on a <b>fulcrum</b> (the triangle).', ghost: 'point' },
      { t: 'Drag the fulcrum along the bar. Watch the two numbers: how far the rock is from the fulcrum, and how far your hand is.', ghost: 'drag' },
      { t: 'Press <b>▶ Pull!</b> to push down on the end. In the rescue, a lever under the boulder will knock it clear.', ghost: 'press', hi: '#wsPull' }] }
};
const lsSeen = () => dbGet('lsSeen', {});
const lsHas = t => t === 'lever' ? WS.mach === 'lever' : lsHasP(t);
const lsLocked = t => !!(LS.o && (LS.o.lock || []).includes(t));
const lsCanvas = () => $('#cvScene');
function lessonStage(o) {
  shopStage(o); LS.on = true; LS.o = Object.assign({ tray: [], pre: [], lock: [] }, o.lesson || {}); LS.drag = null; LS.place = null; LS.dragPiece = null; LS.ropeMach = null; LS.ropeLine = null; LS.cardQ = []; LS.used = null; LS.needKey = ''; LAB.pullGate = lsGate;
  LS.pl = {}; (LS.o.pre || []).forEach(t => { LS.pl[t] = true; }); LS.stage = 'main'; LS.two = null; LS.run = null; LS.cabBy = {}; LS.cabMain = null; LS.flashMsg = null; LS.across = 0; LS.adir = 0;
  if (WS.mach === 'pulley' && !LS.pl.block && LS.o.tray.includes('block')) WS.ropes = 1;   // no pulley block on the bench yet: the crane alone gives 1 rope
  const cv = lsCanvas(); if (cv) cv.style.touchAction = 'none';
  lsRender();
}
function lsOff() { if (!LS.on) return; LS.on = false; LS.o = null; LS.drag = null; LS.place = null; LS.dragPiece = null; LS.cab = []; LS.pl = {}; LS.stage = 'main'; LS.two = null; LS.run = null; LS.ropeMach = null; const cv = lsCanvas(); if (cv) cv.style.touchAction = ''; lsRender(); ndApply([], [$('#lsTray'), $('#lsDock')]); }

/* ---------- the tray and the status line ---------- */
function lsRender() {
  const tr = $('#lsTray'), st = $('#lsStatus'); if (!tr) return;
  const on = LS.on && S.scene === 'shop' && !!LS.o, TL = on ? (lsIsTwo() ? ['crane', 'ramp'] : LS.o.tray) : []; tr.hidden = !(on && TL.length > 0); if (st) st.hidden = !on;
  const row = $('#boardRow'), dk = $('#lsDock'), pb = $('#wsPull'), bx = $('#boardCv'); if (row) row.classList.toggle('ls', on); if (dk) dk.hidden = !on;
  if (pb && bx) { if (on && pb.parentElement !== bx) { pb.classList.add('inboard'); bx.appendChild(pb); } else if (!on && pb.parentElement === bx) { pb.classList.remove('inboard'); const bar = $('.scenebar'); if (bar) bar.insertBefore(pb, $('#dzPause')); } }   // ▶ sits inside the board, bottom right
  if (!on) return;
  if (pb) pb.style.display = lsIsTwo() ? 'none' : '';
  if (LS.ropeMach !== WS.mach && !lsIsTwo()) { if (LS.ropeMach) LS.cabBy[LS.ropeMach] = LS.cab; LS.ropeMach = WS.mach; LS.cab = LS.cabBy[WS.mach] || lsInitCab(WS.mach); }   // just a rope starts roped; take it off and the ▶ stays off until it goes back on
  const sig = TL.map(t => t + lsHas(t) + lsWait(t) + (LS.place === t)).join('|') + (lsIsTwo() ? 'two' : '');
  if (tr.dataset.sig !== sig) { tr.dataset.sig = sig; tr.innerHTML = TL.map(t => { const P = LS_PIECES[t], has = lsHas(t), wt = lsWait(t); return `<div class="lsit"><button type="button" class="gltry ${LS.place === t ? 'on' : ''}" data-lsadd="${t}" ${has || wt ? 'disabled' : ''}><span class="ic" aria-hidden="true">${P.icon}</span><b>${P.name}</b><small>${has ? '✓ on the bench' : wt ? lsWaitNote() : lsIsTwo() ? (t === 'crane' ? 'leg 1' : 'leg 2') : P.note}</small></button><button type="button" class="lsq" data-lsq="${t}" aria-label="How does the ${P.name.toLowerCase()} work?">?</button></div>`; }).join(''); }
  if (st) st.textContent = LS.place ? (LS.place === 'lever' ? 'Now tap the rock to put the lever there.' : `Now tap the glowing spot to put the ${LS_PIECES[LS.place].name.toLowerCase()} there.`) : lsStatus();
  if (dk) dkSet(dk, lsDockHTML());
  lsThrob();
}
function lsStatus() {
  const o = LS.o; if (!o) return ''; if (lsSc() || lsIsTwo()) return lsStatusSc();
  if (o.tray.includes('lever') && !lsHas('lever')) return 'Just a rope: Smooshy pulls the rock straight up. Drag the ⚖️ Lever from the tray under the rock to try a machine.';
  if (WS.mach === 'lever') return WS.cls === 1 ? 'Drag the fulcrum (the triangle) along the bar, or use the Lever panel.' : WS.cls === 2 ? 'Drag the rock along the bar, or use the Lever panel.' : 'Drag your hand along the bar, or use the Lever panel.';
  if (!lsGate()) return 'The rock isn\'t roped to the newtonmeter yet. Drag a rope from one ◉ to the other.';
  return '';
}

/* ---------- where things are on the bench (same numbers as the old bench: 120 px per metre) ---------- */
function lsLever(riseNow, cur) {
  const k = LS_K, X0 = LS_X0, cls = WS.cls, la = cur.la, ea = cur.ea, fx = cls === 1 ? X0 + la * k : X0, fy = cls === 1 ? 140 : 296;
  const th = cls === 1 ? riseNow / la : cls === 2 ? -riseNow / la : -riseNow / 2, P = d => ({ x: fx + d * k * Math.cos(th), y: fy + d * k * Math.sin(th) });
  const d0 = cls === 1 ? -la : 0, d1 = cls === 1 ? ea : WS_BAR, dl = cls === 1 ? -la : cls === 2 ? la : WS_BAR, de = cls === 1 ? ea : cls === 2 ? WS_BAR : ea;
  return { k, X0, fx, fy, th, a: P(d0), b: P(d1), L: P(dl), E: P(de), la, ea };
}
const lsDropZone = () => ({ x0: 200, x1: 540, y0: 190, y1: 372 });   // where the lever can go: under and around the rock
const lsInZone = (x, y) => { const z = lsDropZone(); return x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1; };

/* ---------- drawing ---------- */
function lsRoom(c) {   // the GASA Training Simulator: an indoor room with a faint blue grid, in the builder's flat style (no Glimmer-9 sky or crystals)
  c.fillStyle = '#eef4fa'; c.fillRect(0, 0, 900, WS_H);
  c.strokeStyle = 'rgba(70,130,200,.13)'; c.lineWidth = 1; c.beginPath();
  for (let x = LS_X0 % 30 + 0.5; x < 900; x += 30) { c.moveTo(x, 0); c.lineTo(x, 350); }
  for (let y = 350.5; y > 0; y -= 30) { c.moveTo(0, y); c.lineTo(900, y); }
  c.stroke();
  c.fillStyle = '#d7e3ee'; c.fillRect(0, 350, 900, WS_H - 350); c.strokeStyle = 'rgba(70,130,200,.18)'; c.beginPath(); for (let x = 0.5; x < 900; x += 60) { c.moveTo(x, 354); c.lineTo(x, WS_H); } c.stroke();
  c.fillStyle = '#9db4c8'; c.fillRect(0, 348, 900, 5);
}
/* the board label sits in the strip under the rulers (y 419 to 430), and is drawn last so nothing can cover it */
function lsBoardLabel(c) { txt(c, 'GASA TRAINING SIMULATOR · THE WORKSHOP', 14, 424.5, '#3d6a99', `800 10px ${C.fb}`, 'left'); }
function lsLoadBox(c, x, y, label, hookOn) {   // the load with its weight: "Rock 294 N" (x, y = the middle of the bottom edge) and its hook ◉ on top
  c.font = `800 12px ${C.fn}`; const w = Math.max(62, c.measureText(label).width + 22);
  wsLoadBlock(c, x, y, w, 40, WS.loadId, ''); txt(c, label, x, y - 20, '#fffaf2', `800 12px ${C.fn}`);
  lblAvoid(x, y - 20, Math.max(w / 2 + 2, 34)); lsHookDot(c, x, y - 47, hookOn);
}
/* a hook: glows while a rope is being dragged, and shows green once a rope is on it */
function lsHookDot(c, X, Y, roped) { lblAvoid(X, Y, 14); drawHookDot(c, X, Y, { glow: !!LS.ropeLine, roped }); }
const lsRopeGeo = riseNow => { const cx = 360, by = LS_FLOOR - (riseNow || 0) * 300; return { cx, by, load: { x: cx, y: by - 47 }, end: { x: cx, y: by - 78 } }; };
/* every rope end on the bench right now (canvas units) */
function lsEnds() { if (lsIsTwo()) return lsTwoEnds(); if (lsSc()) return lsEndsSc(); const e = {}; if (WS.mach === 'hand') { const g = lsRopeGeo(0); e.load = g.load; e.end = g.end; } else if (WS.mach === 'lever') { const G = lsLever(0, WS.c || wsCalc()); e.load = { x: G.L.x, y: G.L.y - 54 }; } return e; }
const lsNeedRopes = () => lsIsTwo() ? [['c', 'ch'], ['g', 'rt']] : lsSc() ? lsNeed() : WS.mach === 'hand' ? [['load', 'end']] : [];
const lsJoined = (a, b) => LS.cab.some(c => (c[0] === a && c[1] === b) || (c[0] === b && c[1] === a));
const lsGate = () => !lsIsTwo() && (!lsSc() || lsReady()) && lsNeedRopes().every(([a, b]) => lsJoined(a, b));
function lsRope(a, b) { const need = lsNeedRopes().some(([x, y]) => (x === a && y === b) || (x === b && y === a)); if (!need || lsJoined(a, b)) return false; LS.cab.push([a, b]); WS.shown = true; wsRenderControls(); if (lsIsTwo()) lsTwoCheck(); return true; }
const lsAutoRope = (a, b) => { if (lsRope(a, b)) toast('✓ Roped!', 'ok'); };
function lsUnrope(a) { const n = LS.cab.length; LS.cab = LS.cab.filter(c => c[0] !== a && c[1] !== a); if (LS.cab.length !== n) wsRenderControls(); return LS.cab.length !== n; }
const lsLoadLabel = () => `${lsCap(WS.loadShort)} ${fmt(WS.load, WS.load % 1 ? 1 : 0)} N`;
/* the lever is drawn by drawLeverShape (4n-boardkit.js), the same function the crater uses, at this bench's scale */
function lsBarAndFulcrum(c, G) { drawLeverShape(c, { a: G.a, b: G.b, fx: G.fx, fy: G.fy, floor: LS_FLOOR, thick: 14 }); }
/* a measuring bracket along the bar; its words go through the label placer so they never overlap */
function lsBracket(c, x1, x2, y, label, col) {
  c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x1, y - 5); c.lineTo(x1, y + 5); c.moveTo(x2, y - 5); c.lineTo(x2, y + 5); c.moveTo(x1, y); c.lineTo(x2, y); c.stroke();
  lblAdd(label, (x1 + x2) / 2, y - 14, { size: 11, col, bg: '#fff', border: col, prio: 3, tx: (x1 + x2) / 2, ty: y });
}
function lsDrawLever(c, cur, riseNow) {
  const G = lsLever(riseNow, cur), { fx, fy, L, E } = G, cls = WS.cls, yb = cls === 1 ? 58 : 318;
  lsBracket(c, Math.min(L.x, fx), Math.max(L.x, fx), yb + 26, `${WS.loadShort} to fulcrum ${fmt(cur.la, 2)} m`, WSC.green);   // the two distances along the bar, in plain words
  lsBracket(c, Math.min(fx, E.x), Math.max(fx, E.x), yb, `hand to fulcrum ${fmt(cur.ea, 2)} m`, WSC.red);
  lsBarAndFulcrum(c, G); lsLoadBox(c, L.x, L.y - 7, lsLoadLabel());
  const down = cls === 1, hy = down ? Math.min(E.y + 84, 330) : Math.max(E.y - 84, 52);
  wsSpring(c, E.x, E.y + (down ? 6 : -6), E.x, hy, null);
  { const uy = down ? 1 : -1, ay = E.y + (down ? 6 : -6), Lh = Math.abs(hy - ay), hook = Math.min(14, Lh * .18), body = Math.max(26, Math.min(58, Lh - hook - 22)); lblAdd(down ? 'pull down' : 'pull up', E.x + 16, ay + uy * (hook + body / 2), { size: 11, col: WSC.red, bg: '#fff', border: WSC.red, align: 'left', prio: 3 }); }
  lblAdd('fulcrum', down ? fx : fx - 34, 338, { size: 11, col: WSC.steel2, bg: '#fff', border: WSC.steel2, align: down ? 'center' : 'right', prio: 4 });
  return { x: E.x, y: hy };
}
/* just a rope: it runs from the rock up to Smooshy's hand, with the newtonmeter in the line */
function lsDrawRope(c, riseNow) {
  const g = lsRopeGeo(riseNow), cx = g.cx, by = g.by, roped = lsJoined('load', 'end');
  lsLoadBox(c, cx, by, lsLoadLabel(), roped);
  if (roped) drawRopePx(c, g.load, g.end, 4, 0);
  wsSpring(c, cx, by - 76, cx, by - 150, null); lsHookDot(c, g.end.x, g.end.y, roped);
  lblAdd('pull up', cx + 16, by - 109, { size: 11, col: WSC.red, bg: '#fff', border: WSC.red, align: 'left', prio: 3 });
  lblAdd('just a rope', cx + 60, by - 20, { size: 11, col: WSC.steel2, bg: '#fff', border: WSC.steel2, align: 'left', prio: 4 });
  return { x: cx, y: by - 150 };
}
function lsDrawMachine(c, cur, riseNow) { if (lsIsTwo()) { lsTwoDraw(c); return null; } if (lsSc()) return lsDrawScene(c, cur, riseNow, WS.c && !WS.c.capped ? WS.prog : 0); return WS.mach === 'lever' ? lsDrawLever(c, cur, riseNow) : lsDrawRope(c, riseNow); }

/* the things drawn on top of the bench: what can be dragged, the "Drop here" glow, and the ghost hand of the first-time cards */
function lsOverlay(c) {
  if (!LS.on || !LS.o) return; const t = performance.now() / 1000, pulse = RMOTION ? .5 : .5 + .5 * Math.sin(t * 5), cur = WS.c || wsCalc();
  if (WS.mach === 'lever' && !WS.busy) {   // a dashed ring and arrows on the part you can drag
    const G = lsLever(0, cur), p = lsGrab(G); lblAvoid(p.x, p.y, 34); lblAvoid(p.x, p.y + 35, 28);
    c.save(); c.strokeStyle = `rgba(255,226,138,${.55 + .4 * pulse})`; c.lineWidth = 2.5; c.setLineDash([6, 4]); c.beginPath(); c.arc(p.x, p.y, 33, 0, 7); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(31,29,38,.7)'; c.beginPath(); c.roundRect(p.x - 27, p.y + 26, 54, 17, 8); c.fill(); txt(c, '◀ drag ▶', p.x, p.y + 35, '#ffe28a', `800 10px ${C.fb}`); c.restore();
  }
  if ((LS.dragPiece || LS.place) === 'lever' && !lsHas('lever')) {   // the glow where the lever goes
    const z = lsDropZone(); c.save(); c.shadowColor = GLC.glow; c.shadowBlur = 10 + 14 * pulse; c.strokeStyle = `rgba(126,240,168,${.6 + .4 * pulse})`; c.lineWidth = 3; c.setLineDash([7, 5]); c.beginPath(); c.roundRect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0, 12); c.stroke(); c.restore();
    c.fillStyle = `rgba(126,240,168,${.1 + .1 * pulse})`; c.beginPath(); c.roundRect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0, 12); c.fill(); wsLabel(c, 'Drop here', (z.x0 + z.x1) / 2, z.y0 - 12, '#2a7d48', 'center');
  }
  if (LS.ropeLine) { drawRopePx(c, LS.ropeLine.a, LS.ropeLine.b, 3, 0); }
  if (lsSc() || lsIsTwo()) lsOverlaySc(c, pulse);
  lsFlashHint(c); if (performance.now() - LS.thT > 150) { LS.thT = performance.now(); lsThrob(); }
  if (typeof CARDS !== 'undefined' && CARDS && CARDS.opt && CARDS.opt.lsPiece) lsGhost(c, CARDS.opt.lsPiece, CARDS.cards[CARDS.k].ghost, t);
}
/* the red "drop it here" hint after a missed drop: a little note in the free strip on the left, under the video. It goes as soon as the piece is placed, and never sits over the newtonmeter or other labels. */
function lsFlashHint(c) {
  if (!LS.flash || performance.now() - LS.flash > 1800) return; const piece = LS.flashPiece || 'lever'; if (lsHas(piece)) { LS.flash = 0; return; }
  const msg = LS.flashMsg || 'The lever goes under the rock'; c.save(); c.font = `700 11px ${C.fn}`; const W = 150, lines = []; let cur = '';
  msg.split(' ').forEach(w => { if (c.measureText(cur ? cur + ' ' + w : w).width > W - 14 && cur) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; }); if (cur) lines.push(cur);
  const h = lines.length * 15 + 10, y0 = 162; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(8, y0, W, h, 6); c.fill(); c.strokeStyle = WSC.red; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = WSC.red; c.textAlign = 'left'; c.textBaseline = 'middle'; lines.forEach((l, i) => c.fillText(l, 15, y0 + 14 + i * 15)); c.restore();
}
const lsGrab = G => WS.cls === 1 ? { x: G.fx, y: G.fy + 40 } : WS.cls === 2 ? { x: G.L.x, y: G.L.y - 27 } : { x: G.E.x, y: G.E.y - 40 };   // the part you drag
function lsGhost(c, piece, kind, t) {
  if (piece !== 'lever') return lsGhostNew(c, piece, kind, t);
  const real = WS.mach === 'lever', cur = real ? (WS.c || wsCalc()) : { la: 1, ea: 1 };
  if (!real) { c.save(); c.globalAlpha = .5; lsBarAndFulcrum(c, lsLever(0, cur)); c.restore(); }   // the lever is not on the bench yet: show a faint one under the rock
  const G = lsLever(0, cur), g = real ? lsGrab(G) : { x: G.fx, y: G.fy + 40 };
  let x = g.x + 6, y = g.y + 14 + 5 * Math.sin(t * 5), down = false;
  if (kind === 'drag') {   // grab the part and slide it along the bar and back
    const X = g.x + 0.5 * LS_K * Math.sin(t * 1.7); x = X + 6; y = g.y + 14; down = true;
    if (!real) { c.save(); c.globalAlpha = .45; c.fillStyle = GLC.steelD; c.beginPath(); c.moveTo(X, G.fy + 8); c.lineTo(X + 30, LS_FLOOR); c.lineTo(X - 30, LS_FLOOR); c.closePath(); c.fill(); c.restore(); }
  } else if (kind === 'press') { const bt = $('#wsPull'); if (bt && bt.offsetParent) { const r = bt.getBoundingClientRect(), cr = lsCanvas().getBoundingClientRect(); x = clamp((r.left + r.width / 2 - cr.left) * 900 / cr.width, 40, 860); y = clamp((r.top - cr.top) * WS_H / cr.height - 12, 20, 410); } }
  c.save(); c.font = '34px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; if (down) { c.strokeStyle = 'rgba(255,190,40,.95)'; c.lineWidth = 3; c.beginPath(); c.arc(x - 4, y - 16, 11, 0, 7); c.stroke(); } c.fillText('👆', x, y); c.restore();   /* pressing: a ring at the fingertip (never a fist emoji) */
}

/* ---------- the pointer: tap, drag, and drop from the tray ---------- */
const lsXY = e => { const r = lsCanvas().getBoundingClientRect(); return { x: (e.clientX - r.left) * 900 / r.width, y: (e.clientY - r.top) * WS_H / r.height }; };
function lsHit(p) {   // what is under the pointer on the lever
  if (lsSc()) return lsHitSc(p); if (WS.mach !== 'lever') return null; const G = lsLever(0, wsCalc()), cls = WS.cls, near = (x, y, rx, up, dn) => Math.abs(p.x - x) <= rx && p.y >= y - up && p.y <= y + dn;
  if (cls === 1 && near(G.fx, G.fy, 34, 18, LS_FLOOR - G.fy + 4)) return { what: 'part', v0: WS.arm, x0: p.x };
  if (cls === 2 && near(G.L.x, G.L.y, 44, 58, 14)) return { what: 'part', v0: WS.arm, x0: p.x };
  if (cls === 3 && near(G.E.x, G.E.y, 36, 96, 14)) return { what: 'part', v0: WS.arm, x0: p.x };
  if (p.x >= G.a.x - 12 && p.x <= G.b.x + 12 && Math.abs(p.y - G.a.y) <= 34) return { what: 'bar' };
  return null;
}
function lsBind() {
  if (LS.bound) return; LS.bound = true; const cv = lsCanvas();
  cv.addEventListener('pointerdown', e => {
    if (!LS.on || S.scene !== 'shop' || WS.busy) return; const p = lsXY(e);
    if (LS.place) { const t = LS.place; LS.place = null; lsRender(); lsDrop(t, p.x, p.y); return; }
    const dot = lsDotAt(p);
    if (dot) { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {} LS.drag = { what: 'rope', from: dot, p0: p, moved: false, id: e.pointerId }; return; }
    const h = lsHit(p); if (!h) return;
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    LS.drag = Object.assign({ p0: p, moved: false, id: e.pointerId }, h);
  });
  cv.addEventListener('pointermove', e => {
    const d = LS.drag; if (!d || e.pointerId !== d.id) return; const p = lsXY(e);
    if (!d.moved && Math.hypot(p.x - d.p0.x, p.y - d.p0.y) < 5) return;
    if (d.what === 'rope') { d.moved = true; const A = lsEnds()[d.from]; LS.ropeLine = { a: { x: A.x, y: A.y }, b: p }; return; }
    if (d.what === 'rampL' || d.what === 'rampH') { d.moved = true; lsMoveSc(d, p); return; }
    if (d.what !== 'part') return; d.moved = true;
    lsMark('arm'); wsSet('arm', d.v0 + (p.x - d.x0) / LS_K);   // the same call the old slider made: it snaps to 0.05 m and keeps to the limits
  });
  const up = e => { const d = LS.drag; if (!d || e.pointerId !== d.id) return; LS.drag = null; LS.ropeLine = null;
    if (d.what === 'rope') { const to = lsDotAt(lsXY(e), d.from);
      if (!d.moved) { if (WS.mach === 'lever') toast('The rock sits on the lever, so it needs no rope.'); return; }
      if (to) { if (!lsRope(d.from, to)) toast(lsJoined(d.from, to) ? 'Those two are already roped.' : (lsSc() || lsIsTwo() ? 'Those two don\'t go together. Rope the load to the machine.' : 'Those two don\'t go together. Rope the rock to the newtonmeter.')); else toast('✓ Roped!', 'ok'); }
      else if (!lsUnrope(d.from)) toast('Drop the rope on another ◉ to join them.');
      return; } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { LS.drag = null; LS.ropeLine = null; });
  /* drag straight from the tray onto the bench; a tap picks the piece up, then tap the rock */
  const tr = $('#lsTray');
  tr.addEventListener('pointerdown', e => { const a = e.target.closest('[data-lsadd]'); if (!a || a.disabled) return; const t = a.dataset.lsadd, x0 = e.clientX, y0 = e.clientY; LS.tdrag = false; lsPick(t);
    let ghosted = false;
    const mv = ev2 => { if (Math.hypot(ev2.clientX - x0, ev2.clientY - y0) > 10) { LS.tdrag = true; LS.dragPiece = t; if (!ghosted) { ghosted = true; lsGhostStart(t); } ndGhostMove(ev2.clientX, ev2.clientY); } };
    const stop = () => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', upf); document.removeEventListener('pointercancel', cx); ndGhostEnd(); };
    const cx = () => { stop(); LS.dragPiece = null; setTimeout(() => { LS.tdrag = false; }, 0); };
    const upf = ev2 => { stop(); const r = cv.getBoundingClientRect(); LS.dragPiece = null;
      if (LS.tdrag && ev2.clientX >= r.left && ev2.clientX <= r.right && ev2.clientY >= r.top && ev2.clientY <= r.bottom) { const p = lsXY(ev2); lsDrop(t, p.x, p.y); }
      setTimeout(() => { LS.tdrag = false; }, 0); };
    document.addEventListener('pointermove', mv); document.addEventListener('pointerup', upf); document.addEventListener('pointercancel', cx); });
  tr.addEventListener('click', e => {
    const q = e.target.closest('[data-lsq]'); if (q) { lsShowCards(q.dataset.lsq); return; }
    const a = e.target.closest('[data-lsadd]'); if (a && !a.disabled && !LS.tdrag) { lsPick(a.dataset.lsadd); LS.place = LS.place === a.dataset.lsadd ? null : a.dataset.lsadd; tr.dataset.sig = ''; lsRender(); }
  });
  const dk = $('#lsDock');
  dk.addEventListener('click', e => { const b = e.target.closest('[data-lm]'); if (b) lsMenuAct(b.dataset.lm); const q = e.target.closest('[data-dk^="help:"]'); if (q) lsShowCards(q.dataset.dk.slice(5)); });
}
/* the rope end under a point (a hook ◉ within 18 units), apart from the one it started on */
function lsDotAt(p, not) { const E = lsEnds(); let best = null, bd = 18; Object.keys(E).forEach(k => { if (k === not) return; const d = Math.hypot(E[k].x - p.x, E[k].y - p.y); if (d < bd) { bd = d; best = k; } }); return best; }
function initLesson() { if ($('#lsTray')) lsBind(); }
/* a piece dropped on the bench: the lever has to go under the rock (the glowing box) */
function lsDrop(t, x, y) {
  if (t !== 'lever') return lsDropSc(t, x, y);
  if (lsHas('lever')) return; LS.flashMsg = null;
  if (!lsInZone(x, y)) { LS.flash = performance.now(); LS.flashPiece = 'lever'; toast('Drop the lever under the rock. It glows where it goes.'); return; }
  LS.flash = 0; wsSetMach('lever'); toast('✓ Lever under the rock!', 'ok'); lsRender();
  if (!lsSeen().lever && !FAST) lsShowCards('lever', true);
}

/* ---------- the docked settings panel: always the step's piece ---------- */
function lsDockHTML() {
  if (lsSc() || lsIsTwo()) return lsDockSc();
  const pm = (k, lab, val) => `<div class="glrow"><span>${lab}</span><button type="button" class="ghost sm" data-lm="${k}-" aria-label="Less">−</button><b>${val}</b><button type="button" class="ghost sm" data-lm="${k}+" aria-label="More">+</button></div>`;
  if (WS.mach === 'lever') {
    const lab = WS.cls === 1 ? 'Fulcrum' : WS.cls === 2 ? `${lsCap(WS.loadShort)} to fulcrum` : 'Hand to fulcrum';
    const cls = WS.classPick ? `<div class="glrow wrap"><span>Set-up</span></div><div class="glrow wrap" style="margin-top:0">${[1, 2, 3].map(n => `<button type="button" class="ghost sm ${WS.cls === n ? 'on' : ''}" data-lm="cls${n}">${WS.clsNames ? `Class ${n}: ` : ''}${lsCap(WS_SETUP[n])}</button>`).join('')}</div>` : '';
    return dkHTML({ icon: '⚖️', title: 'Lever', help: 'lever', body: `${cls}${pm('arm', lab, fmt(WS.arm, 2) + ' m')}<p class="glnote">Drag it on the bench, or use − and +. It moves 0.05 m at a time. The ${WS.loadShort} sits on the bar, so it needs no rope.</p>`, actions: lsLocked('lever') ? '' : '<button type="button" class="ghost sm" data-lm="del">🗑 Remove</button>' });
  }
  const roped = lsGate();
  return dkHTML({ icon: '🪢', title: 'Just a rope', body: `<div class="glrow"><span>Rope</span><b class="dkrope ${roped ? 'ok' : 'no'}">${roped ? '✓ rock roped to the newtonmeter' : 'not roped yet'}</b></div><p class="glnote">The rope joins the ${WS.loadShort}'s ◉ to the newtonmeter in Smooshy's hand. Drag from one ◉ to the other to rope them, and drag a rope off to take it away.</p>`,
    actions: roped ? '<button type="button" class="ghost sm" data-lm="unrope">✂ Take the rope off</button>' : '<button type="button" class="ghost sm" data-lm="rope">🪢 Rope the rock</button>' });
}
function lsMenuAct(k) {
  lsMark(k);
  if ((lsSc() || lsIsTwo()) && lsSceneAct(k)) return;
  if (k === 'del') { if (!lsLocked('lever') && WS.allow.includes('hand')) { wsSetMach('hand'); lsRender(); } return; }
  if (k === 'rope') { lsAutoRope('load', 'end'); return; }
  if (k === 'unrope') { lsUnrope('load'); return; }
  if (k.startsWith('cls')) return wsSet('cls', +k.slice(3));
  if (k === 'arm-' || k === 'arm+') wsSet('arm', WS.arm + (k === 'arm+' ? 0.05 : -0.05));
}

/* ---------- first-time cards: three short cards with OK, and a ghost hand on the board (a "?" on each tray tile plays them again) ---------- */
function lsShowCards(piece, auto) {
  const P = LS_PIECES[piece]; if (!P) return;
  /* a first-time card never replaces cards that are already open (they are not modal, so a student can drop another piece meanwhile): it waits its turn in LS.cardQ */
  if (auto && typeof CARDS !== 'undefined' && CARDS) { if (!(CARDS.opt && CARDS.opt.lsPiece === piece) && !LS.cardQ.includes(piece)) LS.cardQ.push(piece); return; }
  showCards(P.cards.map(c => ({ html: `<p>${c.t}</p>`, ghost: c.ghost, hi: c.hi })), { title: `New piece: ${P.name}`, journal: false, nextLabel: 'OK', lsPiece: piece, onDone: () => { const s = lsSeen(); s[piece] = true; dbSet('lsSeen', s); lsAfterCards(); } });
}
/* after cards close: any piece whose cards were waiting, then the pieces already on the bench (or, with introTray, in the tray) that this student has not met yet. The crane gantry always comes first. */
function lsAfterCards() {
  if (!LS.on || FAST || S.scene !== 'shop' || !LS.o) return; const seen = lsSeen();
  while (LS.cardQ.length) { const q = LS.cardQ.shift(); if (!seen[q]) { lsShowCards(q); return; } }
  const c = (LS.o.pre || []).concat(LS.o.introTray ? LS.o.tray : []).filter(t => LS_PIECES[t] && LS_PIECES[t].cards.length && !seen[t]).sort((a, b) => (b === 'crane') - (a === 'crane'));
  if (c.length) lsShowCards(c[0]);
}

/* ---------- "do this next" (Tom, 9 Nov 2026) ----------
   A task's third item can carry need: { need: 'crane' } or { need: ['crane', 'block', { ctl: 'ropes', sel: '[data-lm="ropes+"]', is: () => WS.ropes >= 4, when: () => ... }] }.
   A string is a tray piece (it throbs until lsHas(piece)); an object is a control in the docked panel (sel is a CSS selector, or a function giving one; is() says it is done; when() says it is time
   to use it). The first unticked task is the one the student is on: a prediction ({ pred: true }) is skipped, any other task without need, or a question, means nothing throbs. A control stops
   throbbing once the student has used it for this task. Only one element throbs. Nothing throbs while cards are open. */
const lsMark = k => { LS.used = { ctl: (String(k).match(/^[A-Za-z]+/) || [''])[0], key: LS.needKey }; };
const lsRoped = () => lsNeed().every(([a, b]) => lsJoined(a, b));
function lsNeedTask() {
  /* a challenge mission on the shared builder (y1 to y3, h1 to h3, spec section 14): its lesson.need list throbs until the mission is done */
  if (typeof VIEW !== 'undefined' && VIEW === 'vChapter' && typeof CTAB !== 'undefined' && CTAB === 'challenge' && LS.o && LS.o.need) { const d = (dbGet('chal.' + LS.o.ch, {}) || {})[LS.o.mid] || {}; return d.done ? null : { i: 0, need: LS.o.need }; }
  if (typeof VIEW === 'undefined' || VIEW !== 'vChapter' || CTAB !== 'learn' || !CH) return null;
  const st = CHDATA[CH.id].steps[GI]; if (!st || !st.tasks || stepDone(CH.id, GI)) return null; const two = lsIsTwo(), ts = taskState();
  for (let i = 0; i < st.tasks.length; i++) { const o = st.tasks[i][2] || {};
    if (two) { if (o.stage === 'two' && !ts[i]) return { i, need: o.need }; continue; }
    if (ts[i] || o.pred) continue;
    return { i, need: o.need }; }
  return null;
}
function lsNeedNow() {
  if (!LS.on || !LS.o || S.scene !== 'shop' || (typeof CARDS !== 'undefined' && CARDS)) return null;
  const T = lsNeedTask(); if (!T || !T.need) return null; const list = [].concat(T.need);
  for (let j = 0; j < list.length; j++) { const e = list[j], key = T.i + ':' + j;
    if (typeof e === 'string') { if (lsHas(e)) continue; LS.needKey = key; return { kind: 'tile', id: e }; }
    if (e.when && !e.when()) return null; if (e.is && e.is()) continue;
    LS.needKey = key; if (LS.used && LS.used.key === key && LS.used.ctl === e.ctl) return null;
    return { kind: 'ctl', sel: typeof e.sel === 'function' ? e.sel() : e.sel }; }
  return null;
}
function lsThrob() {
  const roots = [$('#lsTray'), $('#lsDock')]; if (!LS.on) { ndApply([], roots); return; }
  const t = lsNeedNow(); let el = null;
  if (t && t.kind === 'tile') el = $(`#lsTray [data-lsadd="${t.id}"]`); else if (t) el = $(t.sel, $('#lsDock'));
  if (el && (el.disabled || !el.offsetParent)) el = null;
  ndApply(el ? [el] : [], roots);
}
