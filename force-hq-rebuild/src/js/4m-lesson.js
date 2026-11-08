/* ===== Chapter 6: lesson mode (Tom, 8 Nov 2026: "the engine they use when learning about a ramp, lever, pulley should be the same as the rescue") =====
   Spec: docs/Workshop_Lesson_Mode_Spec.md. A small version of the rescue builder on the Workshop bench: a parts tray (drag a piece in, tap a piece for its menu),
   things you drag on the board, and the same flat style. EVERY change goes through the Workshop's own model (wsSet / wsSetMach in 4a-workshop.js), so every number, task check
   and answer stays exactly as it was. The ▶ button is the Workshop's own #wsPull button and calls wsPull().
   The board is the Workshop canvas (900 x 430 units, 120 px per metre). The builder's colours (GLC) and the builder's menu and tray styles are shared; the lever is drawn here
   because the bench lever has three set-ups and a 2 m bar. A step switches lesson mode on with lessonStage({ ...wsSetup options, lesson: { tray: [...], pre: [...], lock: [...] } }).
   To add a piece for Parts 2 to 4: add it to LS_PIECES (name, icon, three cards), draw it in lsDrawMachine, give it a hit test in lsHit and a drop rule in lsDrop.
   Names to avoid reusing elsewhere (one shared scope): LS, LS_*, ls*, lessonStage. */
const LS = { on: false, o: null, drag: null, place: null, dragPiece: null, menu: false, bound: false, flash: 0, tdrag: false };
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
const lsHas = t => t === 'lever' ? WS.mach === 'lever' : false;
const lsLocked = t => !!(LS.o && (LS.o.lock || []).includes(t));
const lsCanvas = () => $('#cvScene');
function lessonStage(o) {
  shopStage(o); LS.on = true; LS.o = Object.assign({ tray: [], pre: [], lock: [] }, o.lesson || {}); LS.drag = null; LS.place = null; LS.dragPiece = null; lsCloseMenu();
  const cv = lsCanvas(); if (cv) cv.style.touchAction = 'none';
  lsRender();
}
function lsOff() { if (!LS.on) return; LS.on = false; LS.o = null; LS.drag = null; LS.place = null; LS.dragPiece = null; lsCloseMenu(); const cv = lsCanvas(); if (cv) cv.style.touchAction = ''; lsRender(); }

/* ---------- the tray and the status line ---------- */
function lsRender() {
  const tr = $('#lsTray'), st = $('#lsStatus'); if (!tr) return;
  const on = LS.on && S.scene === 'shop' && !!LS.o; tr.hidden = !(on && LS.o.tray.length > 0); if (st) st.hidden = !on;
  if (!on) return;
  const sig = LS.o.tray.map(t => t + lsHas(t) + (LS.place === t)).join('|');
  if (tr.dataset.sig !== sig) { tr.dataset.sig = sig; tr.innerHTML = LS.o.tray.map(t => { const P = LS_PIECES[t], has = lsHas(t); return `<div class="lsit"><button type="button" class="gltry ${LS.place === t ? 'on' : ''}" data-lsadd="${t}" ${has ? 'disabled' : ''}><span class="ic" aria-hidden="true">${P.icon}</span><b>${P.name}</b><small>${has ? '✓ on the bench' : P.note}</small></button><button type="button" class="lsq" data-lsq="${t}" aria-label="How does the ${P.name.toLowerCase()} work?">?</button></div>`; }).join(''); }
  if (st) st.textContent = LS.place ? 'Now tap the rock to put the lever there.' : lsStatus();
  if (LS.menu) lsOpenMenu(LS.menu.t, true);
}
function lsStatus() {
  const o = LS.o; if (!o) return '';
  if (o.tray.includes('lever') && !lsHas('lever')) return 'Just a rope: Smooshy pulls the rock straight up. Drag the ⚖️ Lever from the tray under the rock to try a machine.';
  if (WS.mach === 'lever') return WS.cls === 1 ? 'Drag the fulcrum (the triangle) along the bar. Tap the lever for its menu.' : WS.cls === 2 ? 'Drag the rock along the bar. Tap the lever for its menu.' : 'Drag your hand along the bar. Tap the lever for its menu.';
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
function lsRoom(c) {
  const sk = c.createLinearGradient(0, 0, 0, 350); sk.addColorStop(0, GLC.sky0); sk.addColorStop(1, GLC.sky1); c.fillStyle = sk; c.fillRect(0, 0, 900, WS_H);
  c.fillStyle = 'rgba(255,255,255,.75)'; [[190, 30], [260, 70], [330, 22], [430, 58], [520, 24], [590, 66], [800, 30], [850, 76]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 1.6, 0, 7); c.fill(); });
  /* the floor of the Workshop at Gummy Base One: the same crust and crystals as the crater */
  const gr = c.createLinearGradient(0, 350, 0, WS_H); gr.addColorStop(0, GLC.rock0); gr.addColorStop(1, GLC.rock1); c.fillStyle = gr; c.fillRect(0, 350, 900, WS_H - 350);
  c.fillStyle = GLC.crust; c.fillRect(0, 348, 900, 5);
  c.fillStyle = 'rgba(255,255,255,.9)'; [[640, 350, 1], [668, 350, .7], [850, 350, .9], [878, 350, .6]].forEach(([x, y, s]) => { [-.5, 0, .45].forEach((dx, i) => { const hh = (i === 1 ? 26 : 16) * s, ww = 7 * s, X = x + dx * 26 * s; c.beginPath(); c.moveTo(X, y - hh); c.lineTo(X + ww, y - hh * .3); c.lineTo(X + ww * .6, y + 1); c.lineTo(X - ww * .6, y + 1); c.lineTo(X - ww, y - hh * .3); c.closePath(); c.fill(); }); });
  txt(c, 'THE WORKSHOP · GUMMY BASE ONE', 14, 418, '#fffaf2', `800 11px ${C.fb}`, 'left');
}
function lsLoadBox(c, x, y, label) {   // the load with its weight: "Rock 294 N" (x, y = the middle of the bottom edge)
  c.font = `800 12px ${C.fn}`; const w = Math.max(62, c.measureText(label).width + 22);
  wsLoadBlock(c, x, y, w, 40, WS.loadId, ''); txt(c, label, x, y - 20, '#fffaf2', `800 12px ${C.fn}`);
}
const lsLoadLabel = () => `${lsCap(WS.loadShort)} ${fmt(WS.load, WS.load % 1 ? 1 : 0)} N`;
function lsBarAndFulcrum(c, G) {
  c.fillStyle = GLC.steel2; c.beginPath(); c.moveTo(G.fx, G.fy + 8); c.lineTo(G.fx + 30, LS_FLOOR); c.lineTo(G.fx - 30, LS_FLOOR); c.closePath(); c.fill();   // the fulcrum: a triangle, like the rescue's lever
  c.strokeStyle = GLC.wood2; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(G.a.x, G.a.y); c.lineTo(G.b.x, G.b.y); c.stroke(); c.strokeStyle = GLC.wood; c.lineWidth = 7; c.beginPath(); c.moveTo(G.a.x, G.a.y - 1); c.lineTo(G.b.x, G.b.y - 1); c.stroke();
  c.fillStyle = '#e3a51c'; c.beginPath(); c.arc(G.fx, G.fy, 7, 0, 7); c.fill();
}
function lsDrawLever(c, cur, riseNow) {
  const G = lsLever(riseNow, cur), { fx, fy, L, E } = G, cls = WS.cls, yb = cls === 1 ? 58 : 318;
  wsBracket(c, Math.min(L.x, fx), Math.max(L.x, fx), yb + 26, `${WS.loadShort} to fulcrum ${fmt(cur.la, 2)} m`, WSC.green, true);   // the two distances along the bar, in plain words
  wsBracket(c, Math.min(fx, E.x), Math.max(fx, E.x), yb, `hand to fulcrum ${fmt(cur.ea, 2)} m`, WSC.red, true);
  lsBarAndFulcrum(c, G); lsLoadBox(c, L.x, L.y - 7, lsLoadLabel());
  const down = cls === 1, hy = down ? Math.min(E.y + 84, 330) : Math.max(E.y - 84, 52);
  wsSpring(c, E.x, E.y + (down ? 6 : -6), E.x, hy, down ? 'pull down' : 'pull up');
  if (down) wsLabel(c, 'fulcrum', fx, 338, WSC.steel2, 'center', [fx, 322]); else wsLabel(c, 'fulcrum', fx - 34, 334, WSC.steel2, 'right', [fx - 14, 330]);
  return { x: E.x, y: hy };
}
/* just a rope: it runs from the rock up to Smooshy's hand, with the newtonmeter in the line */
function lsDrawRope(c, riseNow) {
  const cx = 360, by = LS_FLOOR - riseNow * 300;
  lsLoadBox(c, cx, by, lsLoadLabel());
  c.strokeStyle = GLC.rope; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, by - 40); c.lineTo(cx, by - 76); c.stroke();
  wsSpring(c, cx, by - 76, cx, by - 150, 'pull up'); wsLabel(c, 'just a rope', cx + 60, by - 20, WSC.steel2, 'left', [cx + 4, by - 56]);
  return { x: cx, y: by - 150 };
}
function lsDrawMachine(c, cur, riseNow) { return WS.mach === 'lever' ? lsDrawLever(c, cur, riseNow) : lsDrawRope(c, riseNow); }

/* the things drawn on top of the bench: what can be dragged, the "Drop here" glow, and the ghost hand of the first-time cards */
function lsOverlay(c) {
  if (!LS.on || !LS.o) return; const t = performance.now() / 1000, pulse = RMOTION ? .5 : .5 + .5 * Math.sin(t * 5), cur = WS.c || wsCalc();
  if (WS.mach === 'lever' && !WS.busy) {   // a dashed ring and arrows on the part you can drag
    const G = lsLever(0, cur), p = lsGrab(G);
    c.save(); c.strokeStyle = `rgba(255,226,138,${.55 + .4 * pulse})`; c.lineWidth = 2.5; c.setLineDash([6, 4]); c.beginPath(); c.arc(p.x, p.y, 33, 0, 7); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(31,29,38,.7)'; c.beginPath(); c.roundRect(p.x - 27, p.y + 26, 54, 17, 8); c.fill(); txt(c, '◀ drag ▶', p.x, p.y + 35, '#ffe28a', `800 10px ${C.fb}`); c.restore();
  }
  if ((LS.dragPiece || LS.place) && !lsHas(LS.dragPiece || LS.place)) {   // the glow where the lever goes
    const z = lsDropZone(); c.save(); c.shadowColor = GLC.glow; c.shadowBlur = 10 + 14 * pulse; c.strokeStyle = `rgba(126,240,168,${.6 + .4 * pulse})`; c.lineWidth = 3; c.setLineDash([7, 5]); c.beginPath(); c.roundRect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0, 12); c.stroke(); c.restore();
    c.fillStyle = `rgba(126,240,168,${.1 + .1 * pulse})`; c.beginPath(); c.roundRect(z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0, 12); c.fill(); wsLabel(c, 'Drop here', (z.x0 + z.x1) / 2, z.y0 - 12, '#2a7d48', 'center');
  }
  if (LS.flash && performance.now() - LS.flash < 900) wsLabel(c, 'The lever goes under the rock', 360, 200, WSC.red, 'center');
  if (typeof CARDS !== 'undefined' && CARDS && CARDS.opt && CARDS.opt.lsPiece) lsGhost(c, CARDS.opt.lsPiece, CARDS.cards[CARDS.k].ghost, t);
}
const lsGrab = G => WS.cls === 1 ? { x: G.fx, y: G.fy + 40 } : WS.cls === 2 ? { x: G.L.x, y: G.L.y - 27 } : { x: G.E.x, y: G.E.y - 40 };   // the part you drag
function lsGhost(c, piece, kind, t) {
  if (piece !== 'lever') return;
  const real = WS.mach === 'lever', cur = real ? (WS.c || wsCalc()) : { la: 1, ea: 1 };
  if (!real) { c.save(); c.globalAlpha = .5; lsBarAndFulcrum(c, lsLever(0, cur)); c.restore(); }   // the lever is not on the bench yet: show a faint one under the rock
  const G = lsLever(0, cur), g = real ? lsGrab(G) : { x: G.fx, y: G.fy + 40 };
  let x = g.x + 6, y = g.y + 14 + 5 * Math.sin(t * 5), down = false;
  if (kind === 'drag') {   // grab the part and slide it along the bar and back
    const X = g.x + 0.5 * LS_K * Math.sin(t * 1.7); x = X + 6; y = g.y + 14; down = true;
    if (!real) { c.save(); c.globalAlpha = .45; c.fillStyle = GLC.steel2; c.beginPath(); c.moveTo(X, G.fy + 8); c.lineTo(X + 30, LS_FLOOR); c.lineTo(X - 30, LS_FLOOR); c.closePath(); c.fill(); c.restore(); }
  } else if (kind === 'press') { const bt = $('#wsPull'); if (bt && bt.offsetParent) { const r = bt.getBoundingClientRect(), cr = lsCanvas().getBoundingClientRect(); x = clamp((r.left + r.width / 2 - cr.left) * 900 / cr.width, 40, 860); y = clamp((r.top - cr.top) * WS_H / cr.height - 12, 20, 410); } }
  c.save(); c.font = '34px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(down ? '✊' : '👆', x, y); c.restore();
}

/* ---------- the pointer: tap, drag, and drop from the tray ---------- */
const lsXY = e => { const r = lsCanvas().getBoundingClientRect(); return { x: (e.clientX - r.left) * 900 / r.width, y: (e.clientY - r.top) * WS_H / r.height }; };
function lsHit(p) {   // what is under the pointer on the lever
  if (WS.mach !== 'lever') return null; const G = lsLever(0, wsCalc()), cls = WS.cls, near = (x, y, rx, up, dn) => Math.abs(p.x - x) <= rx && p.y >= y - up && p.y <= y + dn;
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
    const h = lsHit(p); if (!h) { lsCloseMenu(); return; }
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    LS.drag = Object.assign({ p0: p, moved: false, id: e.pointerId }, h);
  });
  cv.addEventListener('pointermove', e => {
    const d = LS.drag; if (!d || e.pointerId !== d.id) return; const p = lsXY(e);
    if (!d.moved && Math.hypot(p.x - d.p0.x, p.y - d.p0.y) < 5) return; if (d.what !== 'part') return; d.moved = true; lsCloseMenu();
    wsSet('arm', d.v0 + (p.x - d.x0) / LS_K);   // the same call the old slider made: it snaps to 0.05 m and keeps to the limits
  });
  const up = e => { const d = LS.drag; if (!d || e.pointerId !== d.id) return; LS.drag = null; if (!d.moved) lsOpenMenu('lever'); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { LS.drag = null; });
  /* drag straight from the tray onto the bench; a tap picks the piece up, then tap the rock */
  const tr = $('#lsTray');
  tr.addEventListener('pointerdown', e => { const a = e.target.closest('[data-lsadd]'); if (!a || a.disabled) return; const t = a.dataset.lsadd, x0 = e.clientX, y0 = e.clientY; LS.tdrag = false;
    const mv = ev2 => { if (Math.hypot(ev2.clientX - x0, ev2.clientY - y0) > 10) { LS.tdrag = true; LS.dragPiece = t; } };
    const upf = ev2 => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', upf); const r = cv.getBoundingClientRect(); LS.dragPiece = null;
      if (LS.tdrag && ev2.clientX >= r.left && ev2.clientX <= r.right && ev2.clientY >= r.top && ev2.clientY <= r.bottom) { const p = lsXY(ev2); lsDrop(t, p.x, p.y); }
      setTimeout(() => { LS.tdrag = false; }, 0); };
    document.addEventListener('pointermove', mv); document.addEventListener('pointerup', upf); });
  tr.addEventListener('click', e => {
    const q = e.target.closest('[data-lsq]'); if (q) { lsShowCards(q.dataset.lsq); return; }
    const a = e.target.closest('[data-lsadd]'); if (a && !a.disabled && !LS.tdrag) { LS.place = LS.place === a.dataset.lsadd ? null : a.dataset.lsadd; tr.dataset.sig = ''; lsRender(); }
  });
  const m = $('#lsMenu'); makeDraggable(m, '.glmhd', 'lsmenu');
  m.addEventListener('click', e => { const b = e.target.closest('[data-lm]'); if (b) lsMenuAct(b.dataset.lm); });
}
function initLesson() { if ($('#lsTray')) lsBind(); }
/* a piece dropped on the bench: the lever has to go under the rock (the glowing box) */
function lsDrop(t, x, y) {
  if (t !== 'lever' || lsHas('lever')) return;
  if (!lsInZone(x, y)) { LS.flash = performance.now(); toast('Drop the lever under the rock. It glows where it goes.'); return; }
  wsSetMach('lever'); toast('✓ Lever under the rock!', 'ok'); lsRender();
  if (!lsSeen().lever && !FAST) lsShowCards('lever'); else lsOpenMenu('lever');
}

/* ---------- the lever's menu: the same pop-up as the rescue's ---------- */
function lsCloseMenu() { LS.menu = false; const m = $('#lsMenu'); if (m) m.hidden = true; }
function lsOpenMenu(t, keep) {
  const m = $('#lsMenu'); if (!m || t !== 'lever' || WS.mach !== 'lever') { if (!keep) lsCloseMenu(); return; }
  const first = !LS.menu; LS.menu = { t };
  const pm = (k, lab, val) => `<div class="glrow"><span>${lab}</span><button type="button" class="ghost sm" data-lm="${k}-" aria-label="Less">−</button><b>${val}</b><button type="button" class="ghost sm" data-lm="${k}+" aria-label="More">+</button></div>`;
  const lab = WS.cls === 1 ? 'Fulcrum' : WS.cls === 2 ? `${lsCap(WS.loadShort)} to fulcrum` : 'Hand to fulcrum';
  const cls = WS.classPick ? `<div class="glrow wrap"><span>Set-up</span></div><div class="glrow wrap" style="margin-top:0">${[1, 2, 3].map(n => `<button type="button" class="ghost sm ${WS.cls === n ? 'on' : ''}" data-lm="cls${n}">${WS.clsNames ? `Class ${n}: ` : ''}${lsCap(WS_SETUP[n])}</button>`).join('')}</div>` : '';
  m.innerHTML = `<div class="glmhd"><span aria-hidden="true">⠿</span> <b>Lever</b><button type="button" class="glx" data-lm="close" aria-label="Close">✕</button></div>${cls}${pm('arm', lab, fmt(WS.arm, 2) + ' m')}
    <p class="glnote">Drag it on the bench, or use − and +. It moves 0.05 m at a time.</p>${lsLocked('lever') ? '' : '<div class="glrow"><button type="button" class="ghost sm" data-lm="del">🗑 Remove</button></div>'}`;
  m.hidden = false;
  if (first) { const r = lsCanvas().getBoundingClientRect(), G = lsLever(0, wsCalc()), x = r.left + (G.b.x + 20) * r.width / 900, y = r.top + 30 * r.height / WS_H;
    m.style.left = clamp(x, 4, Math.max(4, innerWidth - m.offsetWidth - 4)) + 'px'; m.style.top = clamp(y, 4, Math.max(4, innerHeight - m.offsetHeight - 4)) + 'px'; }
}
function lsMenuAct(k) {
  if (k === 'close') return lsCloseMenu();
  if (k === 'del') { if (!lsLocked('lever') && WS.allow.includes('hand')) { wsSetMach('hand'); lsCloseMenu(); lsRender(); } return; }
  if (k.startsWith('cls')) return wsSet('cls', +k.slice(3));
  if (k === 'arm-' || k === 'arm+') wsSet('arm', WS.arm + (k === 'arm+' ? 0.05 : -0.05));
}

/* ---------- first-time cards: three short cards with OK, and a ghost hand on the board (a "?" on each tray tile plays them again) ---------- */
function lsShowCards(piece) {
  const P = LS_PIECES[piece]; if (!P) return; lsCloseMenu();
  showCards(P.cards.map(c => ({ html: `<p>${c.t}</p>`, ghost: c.ghost, hi: c.hi })), { title: `New piece: ${P.name}`, journal: false, nextLabel: 'OK', lsPiece: piece, onDone: () => { const s = lsSeen(); s[piece] = true; dbSet('lsSeen', s); lsAfterCards(); } });
}
/* after a step's own cards: the pieces already on the bench that this student has not met yet */
function lsAfterCards() {
  if (!LS.on || FAST || S.scene !== 'shop' || !LS.o) return; const seen = lsSeen(), p = (LS.o.pre || []).find(t => LS_PIECES[t] && !seen[t]);
  if (p) lsShowCards(p);
}
