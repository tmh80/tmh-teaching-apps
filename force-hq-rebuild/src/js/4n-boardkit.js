/* ===== Shared by lesson mode (4m) and the rescue builder (4g to 4i) (Tom, 8 Nov 2026; spec section 10) =====
   One drawing per piece (the lever's bar-on-a-triangle), the hook dot every load and every rope end wears, a rope drawn between two pixel points,
   board labels that are placed so they never overlap each other or a handle and fade while something is dragged, and the HTML of the docked settings panel.
   Names to avoid reusing elsewhere (one shared scope): LBL, lbl*, drawHookDot, drawRopePx, drawLeverShape, dk*. */

/* ---------- board labels ----------
   Draw code calls lblAdd() for each label and lblAvoid() for each handle or dot; lblFlush() then places every label in the first free spot
   (the label's own spot, then above, below and to the sides), draws it (with a thin leader line to its object when it was pushed away: give the label tx, ty), and leaves the boxes in LBL.boxes (the tests read them). */
const LBL = { list: [], avoid: [], boxes: [] };
function lblBegin() { LBL.list = []; LBL.avoid = []; }
function lblAvoid(x, y, r) { LBL.avoid.push({ x0: x - r, y0: y - r, x1: x + r, y1: y + r }); }
function lblAdd(text, x, y, o) { LBL.list.push(Object.assign({ text, x, y, align: 'center', size: 12, col: '#fffaf2', bg: 'rgba(31,29,38,.62)', prio: 5 }, o || {})); }
function lblFlush(c, W, H, fade) {
  const placed = [], L = LBL.list.slice().sort((a, b) => a.prio - b.prio), clash = b => placed.concat(LBL.avoid).some(q => b.x0 < q.x1 && b.x1 > q.x0 && b.y0 < q.y1 && b.y1 > q.y0);
  LBL.boxes = [];
  L.forEach(l => {
    c.font = `800 ${l.size}px ${C.fb || 'sans-serif'}`; const w = c.measureText(l.text).width + 12, h = Math.round(l.size * 1.55), bx = l.align === 'left' ? l.x - 6 : l.align === 'right' ? l.x - w + 6 : l.x - w / 2, by = l.y - h / 2;
    let best = null;
    for (const dy of [0, -1, 1, -2, 2, -3, 3, -4, 4]) { for (const dx of [0, -0.6, 0.6, -1.2, 1.2]) {
      const x0 = clamp(bx + dx * w, 2, Math.max(2, W - w - 2)), y0 = clamp(by + dy * (h + 3), 2, Math.max(2, H - h - 2)), b = { x0, y0, x1: x0 + w, y1: y0 + h };
      if (!clash(b)) { best = b; break; } } if (best) break; }
    if (!best) best = { x0: clamp(bx, 2, Math.max(2, W - w - 2)), y0: clamp(by, 2, Math.max(2, H - h - 2)), x1: 0, y1: 0 };
    best.x1 = best.x0 + w; best.y1 = best.y0 + h; placed.push(best); LBL.boxes.push({ text: l.text, x0: best.x0, y0: best.y0, x1: best.x1, y1: best.y1 });
    c.save(); c.globalAlpha = fade == null || l.nofade ? 1 : fade;
    if (l.tx != null) {   // a label that has been pushed away from its object gets a thin leader line to it (Tom, 8 Nov 2026)
      const nx = clamp(l.tx, best.x0, best.x1), ny = clamp(l.ty, best.y0, best.y1);
      if (Math.hypot(l.tx - nx, l.ty - ny) > 14) { c.strokeStyle = l.border || l.col; c.globalAlpha *= .8; c.lineWidth = 1.2; c.beginPath(); c.moveTo(nx, ny); c.lineTo(l.tx, l.ty); c.stroke(); c.fillStyle = l.border || l.col; c.beginPath(); c.arc(l.tx, l.ty, 2.2, 0, 7); c.fill(); c.globalAlpha = fade == null || l.nofade ? 1 : fade; }
    }
    c.fillStyle = l.bg; c.beginPath(); c.roundRect(best.x0, best.y0, w, h, 6); c.fill(); if (l.border) { c.strokeStyle = l.border; c.lineWidth = 1.5; c.stroke(); }
    txt(c, l.text, best.x0 + w / 2, best.y0 + h / 2 + 0.5, l.col, `800 ${l.size}px ${C.fb || 'sans-serif'}`, 'center'); c.restore();
  });
}

/* ---------- a hook: the dot every load and rope end has. Drag a rope from one to another. ---------- */
function drawHookDot(c, X, Y, o) {
  o = o || {}; const r = o.r || 7, pulse = o.glow ? (RMOTION ? 0.5 : 0.5 + 0.5 * Math.sin(performance.now() / 160)) : 0;
  c.save(); if (o.glow) { c.shadowColor = '#7ef0a8'; c.shadowBlur = 8 + 10 * pulse; }
  c.fillStyle = 'rgba(31,29,38,.62)'; c.beginPath(); c.arc(X, Y, r, 0, 7); c.fill(); c.strokeStyle = o.glow ? '#7ef0a8' : (o.roped ? '#9be8b8' : '#f4e7c8'); c.lineWidth = 2.5; c.beginPath(); c.arc(X, Y, r - 2, 0, 7); c.stroke(); c.restore();
}
/* a rope between two pixel points with a little sag */
function drawRopePx(c, a, b, w, sag) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + (sag == null ? Math.min(12, Math.hypot(b.x - a.x, b.y - a.y) * 0.05) : sag);
  c.save(); c.strokeStyle = '#f4e7c8'; c.lineWidth = w || 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo(mx, my, b.x, b.y); c.stroke(); c.restore();
}

/* ---------- the lever: ONE drawing for the Workshop bench and the crater ----------
   o = { a, b (the two ends of the bar), fx, fy (the pivot on the bar), floor (the pixel row the triangle stands on), thick (bar thickness in px), bad } */
function drawLeverShape(c, o) {
  const th = o.thick, hw = th * 2.15, apex = o.fy + th * 0.6;
  c.fillStyle = GLC.steelD; c.beginPath(); c.moveTo(o.fx, apex); c.lineTo(o.fx + hw, o.floor); c.lineTo(o.fx - hw, o.floor); c.closePath(); c.fill();
  c.lineCap = 'round'; c.strokeStyle = o.bad ? GLC.bad : GLC.wood2; c.lineWidth = th; c.beginPath(); c.moveTo(o.a.x, o.a.y); c.lineTo(o.b.x, o.b.y); c.stroke();
  if (!o.bad) { c.strokeStyle = GLC.wood; c.lineWidth = th / 2; c.beginPath(); c.moveTo(o.a.x, o.a.y - th * 0.07); c.lineTo(o.b.x, o.b.y - th * 0.07); c.stroke(); }
  c.fillStyle = '#e3a51c'; c.beginPath(); c.arc(o.fx, o.fy, Math.max(2.5, th * 0.5), 0, 7); c.fill();
}

/* ---------- the docked settings panel (replaces the floating menus) ----------
   dkHTML builds the inside of a panel: the piece's icon and name, its "?" replay (when it has first-time cards), its settings, any warning, and its buttons. */
function dkHTML(o) {
  return `<div class="dkhd"><span class="dkic" aria-hidden="true">${o.icon || ''}</span><b>${o.title}</b>${o.help ? `<button type="button" class="lsq dkq" data-dk="help:${o.help}" aria-label="How does the ${esc(o.title.toLowerCase())} work?">?</button>` : ''}</div>
    <div class="dkbody">${o.body || ''}</div>${o.fb ? `<div class="fb hint dkfb">${o.fb}</div>` : ''}${o.actions ? `<div class="glrow dkact">${o.actions}</div>` : ''}`;
}
/* the empty panel text */
const DK_EMPTY = '<div class="dkhd"><b>Settings</b></div><p class="glnote">Tap a machine to change it.</p>';
/* set a panel's HTML only when it changed, and keep keyboard focus on the same button */
function dkSet(el, html) {
  if (!el || el._h === html) return; const f = document.activeElement, k = f && el.contains(f) ? (f.dataset.lm || f.dataset.gm) : null; el._h = html; el.innerHTML = html;
  if (k) { const n = el.querySelector(`[data-lm="${k}"],[data-gm="${k}"]`); if (n) n.focus(); }
}

/* ---------- "do this next" (Tom, 9 Nov 2026): the one tray tile or panel control the current task needs gets a gentle pulse and a glow ring ----------
   ndApply(els, roots) puts the classes ndneed (the static glow ring) and ndpulse (the pulse: left off when the student asks for reduced motion) on exactly the elements given, and
   takes them off anything else inside the root containers (lesson mode: #lsTray and #lsDock; the rescue: #glTray and #glDock). Callers decide WHICH element from data, never from text. */
function ndApply(els, roots) {
  els = (els || []).filter(Boolean); const cur = [].concat(...(roots || []).filter(Boolean).map(r => [...r.querySelectorAll('.ndneed')]));
  if (cur.length === els.length && cur.every(e => els.includes(e)) && els.every(e => e.classList.contains('ndpulse') === !RMOTION)) return;
  cur.forEach(e => { if (!els.includes(e)) e.classList.remove('ndneed', 'ndpulse'); });
  els.forEach(e => { e.classList.add('ndneed'); e.classList.toggle('ndpulse', !RMOTION); });
}

/* ---------- the drag ghost (Tom, 9 Nov 2026): while a tray tile is dragged, a 60% see-through picture of the piece, drawn by the piece's own board drawing at board scale, follows the pointer ----------
   ndGhostBegin(W, H, sc, draw): draw(c) paints the piece alone (board units, transparent background) on a W x H board; sc is screen pixels per board unit. The picture is cropped to the piece.
   ndGhostMove(clientX, clientY) moves it; ndGhostEnd() removes it (drop, cancel, or a step change). It works the same for mouse, pen and touch, and with reduced motion. */
const NDG = { el: null, w: 0, h: 0 };
function ndGhostEnd() { if (NDG.el) { NDG.el.remove(); NDG.el = null; } }
function ndGhostBegin(W, H, sc, draw) {
  ndGhostEnd();
  try {
    if (typeof readColors === 'function') readColors();
    const off = document.createElement('canvas'); off.width = Math.max(1, Math.ceil(W * sc)); off.height = Math.max(1, Math.ceil(H * sc)); const c = off.getContext('2d'); c.scale(sc, sc); draw(c);
    const px = c.getImageData(0, 0, off.width, off.height).data; let x0 = off.width, y0 = off.height, x1 = -1, y1 = -1;
    for (let y = 0; y < off.height; y++) for (let x = 0; x < off.width; x++) if (px[(y * off.width + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return; const w = x1 - x0 + 1, h = y1 - y0 + 1, el = document.createElement('canvas'); el.width = w; el.height = h; el.getContext('2d').drawImage(off, x0, y0, w, h, 0, 0, w, h);
    el.id = 'ndGhost'; el.setAttribute('aria-hidden', 'true'); el.style.cssText = `position:fixed;left:0;top:0;width:${w}px;height:${h}px;pointer-events:none;opacity:.6;z-index:80;display:none`; document.body.appendChild(el); NDG.el = el; NDG.w = w; NDG.h = h;
  } catch (e) { NDG.el = null; }
}
function ndGhostMove(x, y) { if (!NDG.el) return; NDG.el.style.display = 'block'; NDG.el.style.transform = `translate(${Math.round(x - NDG.w / 2)}px,${Math.round(y - NDG.h / 2)}px)`; }
