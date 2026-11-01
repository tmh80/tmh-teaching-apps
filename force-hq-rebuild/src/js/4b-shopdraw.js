/* ===== Chapter 6: drawing for the Workshop (Smooshy, the Gumdrop, the machines, the newtonmeter, the rulers) =====
   Flat, rounded, outline-free shapes, like the rest of Force HQ. The Workshop interior has its own fixed palette (like the Drop Zone sky). Script: section B6 and C2. */
const WSC = { wall: '#d9e0e4', wall2: '#c9d3d9', floor: '#8a6a45', floor2: '#76593a', bench: '#a98456', peg: '#b9c4cb', hole: '#9aa7af', beam: '#5d6b74', wood: '#c9a36a', wood2: '#a98456', steel: '#8e9ca5', steel2: '#6c7b84', rock: '#8b8f93', rock2: '#a3a7ab',
  crate: '#c58a4a', crate2: '#a46f36', ice: '#bfe6f5', ice2: '#8cc8e0', ink: '#243038', red: '#d6402c', amber: '#e3a51c', green: '#2a7d48', glass: 'rgba(255,255,255,.55)' };
const SMOO = { jelly: '#3b82f6', hi: '#9cc4ff', ear: '#2563c9', dark: '#1d4ed8' };

/* ---------- Captain Smooshy: a blue gummy bear astronaut. (x, y) = the middle of the body; s = scale (1 = about 120 px tall). Moods: wave, cheer, strain, worried. ---------- */
function drawSmooshy(c, x, y, s, mood, tt) {
  mood = mood || 'wave'; tt = tt == null ? performance.now() / 1000 : tt; const sw = RMOTION ? 0 : Math.sin(tt * 5) * (mood === 'strain' ? 2.2 : 0), wob = mood === 'cheer' && !RMOTION ? Math.sin(tt * 7) * 3 : 0;
  c.save(); c.translate(x + sw, y); c.scale(s, s); c.rotate(wob * Math.PI / 180);
  const J = SMOO.jelly; c.globalAlpha = .88;
  /* legs, body, arms */
  c.fillStyle = J; c.beginPath(); c.roundRect(-26, 22, 20, 32, 9); c.fill(); c.beginPath(); c.roundRect(6, 22, 20, 32, 9); c.fill();
  c.beginPath(); c.ellipse(0, 6, 33, 36, 0, 0, 7); c.fill();
  const arm = (side, up) => { c.save(); c.translate(side * 30, -6); c.rotate(side * (up ? -2.5 : mood === 'strain' ? 0.5 : 0.7)); c.beginPath(); c.roundRect(-8, -4, 16, 36, 8); c.fill(); c.restore(); };
  arm(-1, mood === 'cheer'); arm(1, mood === 'cheer' || mood === 'wave');
  /* head and ears */
  c.beginPath(); c.arc(0, -36, 28, 0, 7); c.fill(); [-1, 1].forEach(sd => { c.beginPath(); c.arc(sd * 22, -58, 11, 0, 7); c.fill(); });
  c.globalAlpha = 1; c.fillStyle = SMOO.ear; [-1, 1].forEach(sd => { c.beginPath(); c.arc(sd * 22, -58, 5.5, 0, 7); c.fill(); });
  /* highlight down the left side */
  c.strokeStyle = SMOO.hi; c.lineWidth = 4; c.lineCap = 'round'; c.globalAlpha = .75; c.beginPath(); c.arc(0, 6, 26, 2.3, 3.2); c.stroke(); c.globalAlpha = 1;
  /* chest patch with a star */
  c.fillStyle = '#fffaf2'; c.beginPath(); c.roundRect(-11, 4, 22, 20, 6); c.fill(); c.fillStyle = '#e3a51c'; star5(c, 0, 14, 7, 3);
  /* face */
  c.fillStyle = '#1f1d26';
  if (mood === 'strain') { c.strokeStyle = '#1f1d26'; c.lineWidth = 2.6; [-1, 1].forEach(sd => { c.beginPath(); c.moveTo(sd * 15 - 4, -40); c.lineTo(sd * 15 + 4, -37); c.stroke(); }); c.beginPath(); c.moveTo(-7, -23); c.lineTo(7, -23); c.stroke(); }
  else { [-1, 1].forEach(sd => { c.beginPath(); c.arc(sd * 13, -39, 3.4, 0, 7); c.fill(); });
    c.strokeStyle = '#1f1d26'; c.lineWidth = 2.6; c.beginPath();
    if (mood === 'worried') { c.moveTo(-8, -22); c.quadraticCurveTo(0, -27, 8, -22); c.stroke(); c.beginPath(); c.moveTo(-18, -44); c.lineTo(-8, -48); c.moveTo(18, -44); c.lineTo(8, -48); c.stroke(); }
    else if (mood === 'cheer') { c.moveTo(-9, -26); c.quadraticCurveTo(0, -12, 9, -26); c.closePath(); c.fillStyle = '#1f1d26'; c.fill(); }
    else { c.moveTo(-8, -26); c.quadraticCurveTo(0, -18, 8, -26); c.stroke(); } }
  c.fillStyle = '#1f1d26'; c.beginPath(); c.arc(0, -32, 2, 0, 7); c.fill();
  /* the bubble helmet with a glint */
  c.fillStyle = 'rgba(255,255,255,.22)'; c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 3; c.beginPath(); c.arc(0, -38, 36, 0, 7); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 3.4; c.beginPath(); c.arc(0, -38, 29, 3.7, 4.5); c.stroke();
  /* a soft white rim glow so Smooshy reads against dark or violet backgrounds */
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 6, 35.5, 38, 0, 0, 7); c.stroke();
  c.restore();
}
function star5(c, x, y, R, r) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); }
/* the Gumdrop: a dome-shaped ship like a gumdrop sweet. (x, y) = the middle of the base; tilt in radians. */
function drawGumdrop(c, x, y, s, tilt) {
  c.save(); c.translate(x, y); c.rotate(tilt || 0); c.scale(s, s);
  c.fillStyle = '#6c7b84'; [[-34, 0], [0, 4], [34, 0]].forEach(([lx]) => { c.beginPath(); c.roundRect(lx - 4, 0, 8, 22, 4); c.fill(); c.beginPath(); c.roundRect(lx - 10, 20, 20, 5, 3); c.fill(); });
  const g = c.createLinearGradient(0, -80, 0, 6); g.addColorStop(0, '#ff9ec4'); g.addColorStop(1, '#e8639b'); c.fillStyle = g;
  c.beginPath(); c.moveTo(-52, 4); c.quadraticCurveTo(-52, -86, 0, -86); c.quadraticCurveTo(52, -86, 52, 4); c.closePath(); c.fill();
  c.fillStyle = '#c94a82'; c.beginPath(); c.roundRect(-56, -6, 112, 14, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,.85)'; [[-30, -50], [24, -62], [34, -28], [-18, -22], [0, -72], [-40, -30], [10, -40]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 2.4, 0, 7); c.fill(); });
  c.fillStyle = '#bfe6f5'; c.beginPath(); c.arc(0, -42, 15, 0, 7); c.fill(); c.strokeStyle = '#fffaf2'; c.lineWidth = 4; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(-5, -47, 4, 0, 7); c.fill();
  c.restore();
}

/* ---------- the Workshop room ---------- */
function wsRoom(c) {
  c.fillStyle = WSC.wall; c.fillRect(0, 0, 900, WS_H); c.fillStyle = WSC.wall2; for (let i = 0; i < 900; i += 60) c.fillRect(i, 0, 2, 350);
  c.fillStyle = WSC.floor; c.fillRect(0, 350, 900, WS_H - 350); c.fillStyle = WSC.floor2; c.fillRect(0, 350, 900, 6);
  /* the hoist beam across the ceiling */
  c.fillStyle = WSC.beam; c.fillRect(0, 0, 900, 22); c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(0, 0, 900, 5);
  /* the pegboard of tools, on the left */
  c.fillStyle = WSC.peg; c.beginPath(); c.roundRect(14, 205, 142, 128, 6); c.fill(); c.fillStyle = WSC.hole; for (let i = 0; i < 9; i++) for (let j = 0; j < 6; j++) { c.beginPath(); c.arc(24 + i * 15.5, 216 + j * 20, 1.6, 0, 7); c.fill(); }
  c.strokeStyle = WSC.steel2; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(34, 230); c.lineTo(34, 290); c.stroke(); c.beginPath(); c.arc(34, 222, 8, 0, 7); c.stroke();
  c.fillStyle = WSC.red; c.beginPath(); c.roundRect(60, 236, 44, 12, 4); c.fill(); c.fillStyle = WSC.steel2; c.fillRect(60, 248, 6, 36);
  c.strokeStyle = WSC.steel2; c.lineWidth = 5; c.beginPath(); c.arc(128, 262, 14, 0.4, 5.9); c.stroke(); c.beginPath(); c.moveTo(138, 276); c.lineTo(140, 308); c.stroke();
  /* the Force HQ hangar door, far right, and a workbench */
  c.fillStyle = WSC.beam; c.fillRect(884, 120, 16, 230); c.fillStyle = WSC.amber; for (let i = 0; i < 6; i++) c.fillRect(884, 128 + i * 38, 16, 12);
}
function wsMonitor(c) {
  const x = 12, y = 30, w = 146, h = 112, tt = performance.now() / 1000;
  c.fillStyle = '#1f2a30'; c.beginPath(); c.roundRect(x, y, w, h, 9); c.fill(); c.fillStyle = '#26364a'; c.beginPath(); c.roundRect(x + 6, y + 6, w - 12, h - 12, 6); c.fill();
  c.save(); c.beginPath(); c.roundRect(x + 6, y + 6, w - 12, h - 12, 6); c.clip();
  const sk = c.createLinearGradient(0, y, 0, y + h); sk.addColorStop(0, '#5d3f99'); sk.addColorStop(1, '#8b6bd0'); c.fillStyle = sk; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(255,255,255,.7)'; [[24, 46], [140, 52], [118, 40], [40, 66]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 1.5, 0, 7); c.fill(); });
  const bub = WS.bubble && performance.now() - WS.bubbleAt < 5200, last = WS.last, mood = WS.busy ? (WS.c && WS.c.capped ? 'strain' : 'strain') : bub ? (last && !last.capped && last.E <= SMOOSHY.pull ? 'cheer' : 'worried') : 'wave';
  drawSmooshy(c, x + 68, y + 66, 0.62, mood, tt); c.restore();
  if (!RMOTION && !bub) { c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(x + 6, y + ((tt * 40) % (h - 12)) + 6, w - 12, 3); }
  /* the sticky note */
  c.save(); c.translate(x + w - 12, y + h - 6); c.rotate(.12); c.fillStyle = '#f6e27a'; c.fillRect(-52, -22, 56, 30); txt(c, '60 N max!', -24, -7, '#5a4a10', `800 11px ${C.fb}`); c.restore();
  txt(c, 'CAPTAIN SMOOSHY · LIVE', x + 6, y - 9, WSC.ink, `800 10px ${C.fb}`, 'left');
  if (bub) wsBubbleDraw(c, WS.bubble, x, y + h + 10, w);
}
function wsBubbleDraw(c, s, x, y, w) {
  c.font = `700 12px ${C.fb}`; const words = s.split(' '), lines = []; let cur = '';
  words.forEach(wd => { const t = cur ? cur + ' ' + wd : wd; if (c.measureText(t).width > w - 18 && cur) { lines.push(cur); cur = wd; } else cur = t; }); lines.push(cur);
  const h = lines.length * 15 + 14; c.fillStyle = '#fffaf2'; c.strokeStyle = SMOO.ear; c.lineWidth = 2; c.beginPath(); c.roundRect(x, y, w, h, 9); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(x + 30, y); c.lineTo(x + 40, y - 9); c.lineTo(x + 50, y); c.fillStyle = '#fffaf2'; c.fill();
  lines.forEach((l, i) => txt(c, l, x + w / 2, y + 14 + i * 15, WSC.ink, `700 12px ${C.fb}`));
}

/* ---------- the newtonmeter: a dial with a red band from 60 N ("Smooshy's limit") and a digital window ---------- */
const WS_DIALS = [100, 200, 500, 1000, 2000, 5000, 10000, 20000];
function wsDialMax(need) { return WS_DIALS.find(v => v >= Math.max(need, 60) * 1.05) || WS_DIALS[WS_DIALS.length - 1]; }
function wsNewtonmeter(c, cx, cy, M, val, hideVal, ex, ey) {
  const r = 50, a0 = Math.PI * 0.75, sw = Math.PI * 1.5, ang = v => a0 + clamp(v / M, 0, 1) * sw;
  c.fillStyle = '#243038'; c.beginPath(); c.roundRect(cx - 62, cy - 62, 124, 148, 14); c.fill(); c.fillStyle = '#e9eef1'; c.beginPath(); c.arc(cx, cy, r + 4, 0, 7); c.fill();
  c.lineCap = 'butt'; c.lineWidth = 9; c.strokeStyle = '#cfd8dd'; c.beginPath(); c.arc(cx, cy, r - 10, a0, a0 + sw); c.stroke();
  c.strokeStyle = WSC.red; c.beginPath(); c.arc(cx, cy, r - 10, ang(Math.min(SMOOSHY.pull, M)), a0 + sw); c.stroke();
  c.strokeStyle = WSC.ink; c.lineWidth = 2; for (let i = 0; i <= 10; i++) { const a = a0 + i / 10 * sw; c.beginPath(); c.moveTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4)); c.lineTo(cx + Math.cos(a) * (r - (i % 5 ? 8 : 14) - 4), cy + Math.sin(a) * (r - (i % 5 ? 8 : 14) - 4)); c.stroke(); }
  [0, M / 2, M].forEach((v, i) => { const a = ang(v); txt(c, v >= 1000 ? (v / 1000) + 'k' : String(v), cx + Math.cos(a) * (r - 24), cy + Math.sin(a) * (r - 24), WSC.ink, `700 9px ${C.fn}`); });
  if (!hideVal) { const a = ang(val); c.strokeStyle = WSC.ink; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * (r - 12), cy + Math.sin(a) * (r - 12)); c.stroke(); }
  c.fillStyle = WSC.ink; c.beginPath(); c.arc(cx, cy, 5, 0, 7); c.fill();
  c.fillStyle = '#0d171d'; c.beginPath(); c.roundRect(cx - 44, cy + 36, 88, 26, 5); c.fill(); txt(c, hideVal ? '? N' : fmt(val, 1) + ' N', cx, cy + 49.5, '#9ef0b2', `700 17px ${C.fn}`);
  txt(c, 'NEWTONMETER READING', cx, cy + 74, '#cfd8dd', `800 9px ${C.fb}`);
  c.fillStyle = WSC.red; c.fillRect(cx - 52, cy + 79, 7, 7); txt(c, 'Smooshy\'s limit: 60 N', cx - 42, cy + 82.5, '#cfd8dd', `700 8.5px ${C.fb}`, 'left');
}

/* ---------- little shared bits ---------- */
function wsLoadBlock(c, x, y, w, h, id, label) {   // x,y = the middle of the bottom edge
  const ice = id === 'ice', rock = id === 'rock', car = id === 'car';
  c.fillStyle = ice ? WSC.ice : rock ? WSC.rock : WSC.crate; c.beginPath(); c.roundRect(x - w / 2, y - h, w, h, rock ? h / 2.2 : 6); c.fill();
  c.fillStyle = ice ? WSC.ice2 : rock ? WSC.rock2 : WSC.crate2; if (!rock) { c.fillRect(x - w / 2 + 5, y - h + 5, w - 10, 4); c.fillRect(x - w / 2 + 5, y - 9, w - 10, 4); } else { c.beginPath(); c.ellipse(x - w * .18, y - h * .62, w * .18, h * .14, -.4, 0, 7); c.fill(); }
  if (label) txt(c, label, x, y - h / 2 + 0.5, '#fffaf2', `800 12px ${C.fn}`);
}
function wsBracket(c, x1, x2, y, label, col, above) {
  c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x1, y - 5); c.lineTo(x1, y + 5); c.moveTo(x2, y - 5); c.lineTo(x2, y + 5); c.moveTo(x1, y); c.lineTo(x2, y); c.stroke(); txt(c, label, (x1 + x2) / 2, above ? y - 10 : y + 12, col, `700 11px ${C.fn}`);
}
const wsHand = (c, x, y, down) => { c.fillStyle = '#e8b896'; c.beginPath(); c.roundRect(x - 11, y - 11, 22, 22, 9); c.fill(); c.fillStyle = '#b8916f'; c.fillRect(x - 11, y + (down ? 6 : -9), 22, 4); };
function wsEffArrow(c, x, y, down) { const col = WSC.red; if (down) arrow(c, x, y - 54, x, y - 14, col, 4); else arrow(c, x, y + 54, x, y + 14, col, 4); }

/* ---------- the machines. Each returns the effort point { x, y } so the newtonmeter can be joined to it ---------- */
/* a spring-balance newtonmeter on the line from the machine (ax, ay) to the puller's hand (hx, hy): hook, body with a scale, ring and hand,
   and a red arrow past the hand pointing the way the hand pulls. It always reads as a PULL (Tom, 1 Nov 2026). */
function wsSpring(c, ax, ay, hx, hy, label) {
  const dx = hx - ax, dy = hy - ay, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, ang = Math.atan2(dy, dx);
  const hook = Math.min(14, L * .18), body = Math.max(26, Math.min(58, L - hook - 22));
  c.strokeStyle = WSC.steel2; c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + ux * hook, ay + uy * hook); c.stroke();
  c.save(); c.translate(ax + ux * hook, ay + uy * hook); c.rotate(ang);
  c.fillStyle = '#e3a51c'; c.beginPath(); c.roundRect(0, -9, body, 18, 6); c.fill(); c.fillStyle = '#fff3cc'; c.fillRect(4, -4, body - 8, 8);
  c.strokeStyle = WSC.ink; c.lineWidth = 1; for (let k = 6; k < body - 4; k += 5) { c.beginPath(); c.moveTo(k, -4); c.lineTo(k, k % 10 < 5 ? 1 : -1); c.stroke(); }
  c.strokeStyle = WSC.steel2; c.lineWidth = 2.5; c.beginPath(); c.moveTo(body, 0); c.lineTo(L - hook - 10, 0); c.stroke(); c.beginPath(); c.arc(L - hook - 4, 0, 6, 0, 7); c.stroke();
  c.restore();
  wsHand(c, hx, hy, uy > 0);
  arrow(c, hx + ux * 14, hy + uy * 14, hx + ux * 50, hy + uy * 50, WSC.red, 4);
  if (label) { const mx = ax + ux * (hook + body / 2), my = ay + uy * (hook + body / 2); if (Math.abs(uy) > .7) txt(c, label, mx + 16, my, WSC.red, `800 11px ${C.fb}`, 'left'); else txt(c, label, mx - uy * 18, my + ux * 18 - 4, WSC.red, `800 11px ${C.fb}`, 'center'); }
}
/* the lever. A wider pivot height for each set-up keeps the bar, the spring balance and the hand above the floor at every slider setting:
   fulcrum in the middle (class 1): your end goes DOWN, so the bar sits high and the newtonmeter hangs below it;
   load or effort in the middle (classes 2 and 3): your hand pulls UP, so the bar sits low and the newtonmeter is above it. */
function wsDrawLever(c, cur, riseNow) {
  const k = 120, arms = { la: cur.la, ea: cur.ea }, X0 = 214, fx = WS.cls === 1 ? X0 + arms.la * k : X0, fy = WS.cls === 1 ? 140 : 296;
  const th = WS.cls === 1 ? riseNow / arms.la : WS.cls === 2 ? -riseNow / arms.la : -riseNow / 2;
  const P = d => ({ x: fx + d * k * Math.cos(th), y: fy + d * k * Math.sin(th) });
  const d0 = WS.cls === 1 ? -arms.la : 0, d1 = WS.cls === 1 ? arms.ea : WS_BAR, dl = WS.cls === 1 ? -arms.la : WS.cls === 2 ? arms.la : WS_BAR, de = WS.cls === 1 ? arms.ea : WS.cls === 2 ? WS_BAR : arms.ea;
  /* the two distances along the bar, in plain words (drawn first, so a rising rock passes in front of them) */
  { const lx = fx + dl * k, ex = fx + de * k, yb = WS.cls === 1 ? 58 : 318;
    wsBracket(c, Math.min(lx, fx), Math.max(lx, fx), yb + 26, `${WS.loadShort} to fulcrum ${fmt(arms.la, 2)} m`, WSC.green, true);
    wsBracket(c, Math.min(fx, ex), Math.max(fx, ex), yb, `hand to fulcrum ${fmt(arms.ea, 2)} m`, WSC.red, true); }
  /* the fulcrum: a steel stand from the floor up to the pivot */
  c.fillStyle = WSC.steel2; c.beginPath(); c.moveTo(fx - 26, 350); c.lineTo(fx + 26, 350); c.lineTo(fx + 5, fy + 9); c.lineTo(fx - 5, fy + 9); c.closePath(); c.fill();
  const a = P(d0), b = P(d1); c.strokeStyle = WSC.wood2; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); c.strokeStyle = WSC.wood; c.lineWidth = 8; c.beginPath(); c.moveTo(a.x, a.y - 1); c.lineTo(b.x, b.y - 1); c.stroke();
  c.fillStyle = WSC.steel; c.beginPath(); c.arc(fx, fy, 6, 0, 7); c.fill();
  const L = P(dl), E = P(de); wsLoadBlock(c, L.x, L.y - 7, 54, 40, WS.loadId === 'rock' ? 'rock' : WS.loadId, fmt(WS.load, WS.load % 1 ? 1 : 0) + ' N');
  /* the newtonmeter and the hand: below the bar for a pull down, above it for a pull up */
  const down = WS.cls === 1, hy = down ? Math.min(E.y + 84, 330) : Math.max(E.y - 84, 52);
  wsSpring(c, E.x, E.y + (down ? 6 : -6), E.x, hy, down ? 'pull down' : 'pull up');
  /* labels: the three parts of a lever, then the two distances along the bar in plain words */
  if (down) txt(c, 'fulcrum', fx, 342, '#fff', `800 10px ${C.fb}`); else txt(c, 'fulcrum', fx - 30, 334, WSC.steel2, `800 11px ${C.fb}`, 'right');
  return { x: E.x, y: hy };
}
/* lifting by hand: the newtonmeter hooks onto the rock and the hand pulls straight up */
function wsDrawHand(c, cur, riseNow) {
  const cx = 360, by = 350 - riseNow * 300;
  wsLoadBlock(c, cx, by, 70, 52, WS.loadId, fmt(WS.load, WS.load % 1 ? 1 : 0) + ' N');
  wsSpring(c, cx, by - 52, cx, by - 150, 'pull up');
  return { x: cx, y: by - 150 };
}
function wsDrawPulley(c, cur, riseNow, prog) {
  const N = WS.ropes, cx = 330, w = Math.max(40, N * 28), pxM = 70, bY = 250 - riseNow * pxM, top = 84;
  c.fillStyle = WSC.beam; c.fillRect(190, 22, 400, 8); c.fillStyle = WSC.steel2; c.fillRect(cx - 3, 30, 6, 40);
  c.fillStyle = WSC.steel2; c.beginPath(); c.roundRect(cx - w / 2 - 6, 68, w + 12, 18, 6); c.fill();
  const xs = []; for (let i = 0; i < N; i++) xs.push(cx - w / 2 + (i + .5) * w / N);
  xs.forEach(x => { c.fillStyle = WSC.steel; c.beginPath(); c.arc(x, 77, 7.5, 0, 7); c.fill(); c.fillStyle = WSC.steel2; c.beginPath(); c.arc(x, 77, 2.5, 0, 7); c.fill(); });
  /* the moving block and the supporting ropes */
  if (N > 1) { c.fillStyle = WSC.steel2; c.beginPath(); c.roundRect(cx - w / 2 - 6, bY - 14, w + 12, 18, 6); c.fill(); xs.forEach(x => { c.fillStyle = WSC.steel; c.beginPath(); c.arc(x, bY - 5, 7.5, 0, 7); c.fill(); c.fillStyle = WSC.steel2; c.beginPath(); c.arc(x, bY - 5, 2.5, 0, 7); c.fill(); }); }
  c.strokeStyle = '#d9c28a'; c.lineWidth = 3; c.lineCap = 'round';
  xs.forEach((x, i) => { c.beginPath(); c.moveTo(x, 84); c.lineTo(x, bY - (N > 1 ? 14 : 4)); c.stroke(); txt(c, String(i + 1), x + (N > 1 ? 11 : 12), (84 + bY) / 2 - (i % 2 ? 14 : 0), WSC.green, `800 12px ${C.fn}`); });
  c.fillStyle = WSC.steel; c.fillRect(cx - 2, bY - (N > 1 ? 0 : 4), 4, 14);
  wsLoadBlock(c, cx, bY + 62, 64, 50, WS.loadId, fmt(WS.load, WS.load % 1 ? 1 : 0) + ' N');
  /* the free end comes down over the last wheel to the puller's hand */
  const hx = 500, ry = 150 + prog * 110; c.strokeStyle = '#d9c28a'; c.lineWidth = 3; c.beginPath(); c.moveTo(xs[N - 1], 70); c.quadraticCurveTo(xs[N - 1] + 18, 62, xs[N - 1] + 26, 78); c.lineTo(xs[N - 1] + 26, 78); c.lineTo(hx, 78); c.lineTo(hx, ry); c.stroke();
  wsSpring(c, hx, ry, hx, ry + 66, 'pull down'); txt(c, 'the end you pull', hx + 10, 110, WSC.ink, `700 10px ${C.fb}`, 'left'); txt(c, '(not counted)', hx + 10, 122, WSC.ink, `700 10px ${C.fb}`, 'left');
  return { x: hx, y: ry + 66 };
}
function wsDrawWinch(c, cur, riseNow) {
  const ax = 330, ay = 165, pxm = 185, ar = Math.max(8, WS.axle * pxm), hr = WS.R * pxm, rot = riseNow / WS.axle;
  c.fillStyle = WSC.beam; c.fillRect(ax - 6, 22, 12, ay - 22);
  c.setLineDash([6, 5]); c.strokeStyle = WSC.steel2; c.lineWidth = 2; c.beginPath(); c.arc(ax, ay, hr, 0, 7); c.stroke(); c.setLineDash([]);
  c.fillStyle = WSC.steel; c.beginPath(); c.arc(ax, ay, ar, 0, 7); c.fill(); c.fillStyle = WSC.steel2; c.beginPath(); c.arc(ax, ay, 3, 0, 7); c.fill();
  /* the cable winds off the axle and the bucket rises */
  const by = 326 - riseNow * 70, rx = ax + ar - 1; c.strokeStyle = '#d9c28a'; c.lineWidth = 3; c.beginPath(); c.moveTo(rx, ay); c.lineTo(rx, by - 30); c.stroke();
  c.fillStyle = WSC.steel2; c.beginPath(); c.moveTo(rx - 24, by - 30); c.lineTo(rx + 24, by - 30); c.lineTo(rx + 18, by + 18); c.lineTo(rx - 18, by + 18); c.closePath(); c.fill(); txt(c, fmt(WS.load, WS.load % 1 ? 1 : 0) + ' N', rx, by - 6, '#fffaf2', `800 12px ${C.fn}`);
  /* the crank handle turning */
  const a = rot, gx = ax + Math.cos(a) * hr, gy = ay + Math.sin(a) * hr; c.strokeStyle = WSC.wood2; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(ax, ay); c.lineTo(gx, gy); c.stroke(); c.fillStyle = WSC.red; c.beginPath(); c.arc(gx, gy, 9, 0, 7); c.fill();
  const tx = -Math.sin(a), ty = Math.cos(a); arrow(c, gx - tx * 4, gy - ty * 4, gx + tx * 42, gy + ty * 42, WSC.red, 4);
  wsBracket(c, ax - hr, ax, ay, '', WSC.red); txt(c, `handle radius ${fmt(WS.R, 2)} m`, ax - hr - 10, ay, WSC.red, `700 11px ${C.fn}`, 'right'); txt(c, `axle radius ${fmt(WS.axle, 2)} m`, ax + hr + 14, ay + 4, WSC.green, `700 11px ${C.fn}`, 'left');
  return { x: gx, y: gy };
}
function wsDrawRamp(c, cur, riseNow, prog) {
  const run = Math.sqrt(Math.max(.01, WS.L * WS.L - WS.h * WS.h)), sc = Math.min(85, 440 / run, 200 / WS.h), A = { x: 50, y: 340 }, B = { x: 50 + run * sc, y: 340 - WS.h * sc };
  c.fillStyle = WSC.wood; c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y); c.lineTo(B.x, A.y); c.closePath(); c.fill(); c.fillStyle = WSC.wood2; c.fillRect(B.x, B.y, 60, A.y - B.y); c.fillStyle = WSC.steel; c.fillRect(B.x, B.y - 4, 60, 5);
  wsBracket(c, A.x, B.x, 232, `ramp length ${fmt(WS.L, 1)} m`, WSC.red, true); txt(c, `height ${fmt(WS.h, 1)} m`, B.x + 30, (A.y + B.y) / 2 + 4, '#fffaf2', `700 10.5px ${C.fn}`);
  const ang = Math.atan2(B.y - A.y, B.x - A.x), t = clamp(prog, 0, 1), px = A.x + (B.x - A.x) * t, py = A.y + (B.y - A.y) * t, cs = Math.cos(ang), sn = Math.sin(ang);
  c.save(); c.translate(px, py); c.rotate(ang); c.fillStyle = WSC.crate; c.beginPath(); c.roundRect(2, -36, 54, 28, 5); c.fill(); c.fillStyle = WSC.ink; [[13, -6], [45, -6]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 6, 0, 7); c.fill(); }); txt(c, fmt(WS.load, WS.load % 1 ? 1 : 0) + ' N', 29, -22, '#fffaf2', `800 11px ${C.fn}`); c.restore();
  /* the pull is up the slope, along a rope from the front of the cart to the puller's hand on the platform */
  const fx = px + cs * 56 - sn * 20 * -1 * 0 + 0, fy = py + sn * 56 - cs * 20, hx = Math.min(B.x + 120, 590), hy = B.y - 40;
  const rx = px + cs * 54 + sn * 20, ry = py + sn * 54 - cs * 20, rl = Math.hypot(hx - rx, hy - ry), sx = hx - (hx - rx) / rl * 70, sy = hy - (hy - ry) / rl * 70;
  c.strokeStyle = '#d9c28a'; c.lineWidth = 3; c.beginPath(); c.moveTo(rx, ry); c.lineTo(sx, sy); c.stroke();
  if (rl > 80) wsSpring(c, sx, sy, hx, hy, 'pull'); else wsHand(c, hx, hy, false);
  return { x: hx, y: hy };
}
function wsDrawWedge(c, cur, riseNow, prog) {
  const cx = 330, sc = 5, wd = WS.thick * sc, ht = 20 * sc, open = riseNow / WS_WEDGE_OPEN * 14, ice = WS.loadId === 'ice', tip = 218 + prog * 82, top = tip - ht;
  c.fillStyle = WSC.wood2; c.beginPath(); c.roundRect(cx - 130, 320, 260, 30, 6); c.fill();
  const col = ice ? WSC.ice : WSC.wood, col2 = ice ? WSC.ice2 : WSC.wood2;
  [-1, 1].forEach(sd => { const x0 = sd < 0 ? cx - 100 - open : cx + open + 1; c.fillStyle = col; c.beginPath(); c.roundRect(x0, 250, 99, 70, 8); c.fill(); c.fillStyle = col2; c.fillRect(x0 + 8, 262, 83, 3); });
  txt(c, (ice ? 'ice block' : 'log') + ' · needs ' + fmt(WS.load, 0) + ' N to split', cx, 336, '#fffaf2', `700 11px ${C.fn}`);
  c.fillStyle = WSC.steel; c.beginPath(); c.moveTo(cx - wd / 2, top); c.lineTo(cx + wd / 2, top); c.lineTo(cx, tip); c.closePath(); c.fill();
  c.fillStyle = WSC.steel2; c.beginPath(); c.moveTo(cx + wd / 2, top); c.lineTo(cx, tip); c.lineTo(cx + wd / 2 - 3, top); c.fill();
  wsBracket(c, cx - wd / 2, cx + wd / 2, top - 8, '', WSC.red); txt(c, `thickness ${WS.thick} cm`, cx - wd / 2 - 10, top - 8, WSC.red, `700 11px ${C.fn}`, 'right'); txt(c, 'length 20 cm', cx + wd / 2 + 10, top + ht / 2, WSC.green, `700 11px ${C.fn}`, 'left');
  const hy = top - 62; wsHand(c, cx, hy, true); arrow(c, cx, hy + 16, cx, hy + 50, WSC.red, 4);
  return { x: cx + 14, y: hy };
}
function wsDrawScrew(c, cur, riseNow, prog) {
  const cx = 330, liftPx = riseNow * 300, py = 250 - liftPx, turnsNow = cur.turns != null ? cur.turns * prog : 0;
  c.fillStyle = WSC.steel2; c.beginPath(); c.roundRect(cx - 70, 334, 140, 16, 6); c.fill();
  c.fillStyle = WSC.steel; c.fillRect(cx - 18, py + 12, 36, 334 - py - 12); c.strokeStyle = WSC.steel2; c.lineWidth = 3; const off = (turnsNow * 14) % 14; for (let y = py + 20 + off; y < 332; y += 14) { c.beginPath(); c.moveTo(cx - 18, y + 5); c.lineTo(cx + 18, y - 5); c.stroke(); }
  c.fillStyle = WSC.beam; c.beginPath(); c.roundRect(cx - 78, py, 156, 14, 5); c.fill();
  /* a car's corner on the jack (or the supply pod) */
  c.fillStyle = WSC.red; c.beginPath(); c.roundRect(cx - 90, py - 50, 180, 50, 12); c.fill(); c.fillStyle = WSC.glass; c.beginPath(); c.roundRect(cx - 50, py - 78, 110, 32, 10); c.fill(); c.fillStyle = WSC.ink; c.beginPath(); c.arc(cx - 52, py - 2, 17, 0, 7); c.fill(); txt(c, fmt(WS.load, 0) + ' N', cx + 30, py - 24, '#fffaf2', `800 13px ${C.fn}`);
  const a = Math.min(turnsNow, 8) * 6.2832, hl = 74 * Math.abs(Math.cos(a)), hx = cx + 20 + hl * Math.sign(Math.cos(a) || 1), hy = 306;
  c.strokeStyle = WSC.wood2; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx + 18, hy); c.lineTo(hx, hy); c.stroke(); c.fillStyle = WSC.red; c.beginPath(); c.arc(hx, hy, 9, 0, 7); c.fill();
  arrow(c, hx + 6, hy - 14, hx + 6, hy - 52, WSC.red, 4);
  const mk = wsMasked(), tn = Math.floor(turnsNow + 1e-6); c.fillStyle = '#0d171d'; c.beginPath(); c.roundRect(cx + 108, 280, 108, 40, 8); c.fill(); txt(c, 'TURNS', cx + 162, 291, '#cfd8dd', `800 9px ${C.fb}`); txt(c, mk.has('turns') ? '?' : String(tn), cx + 162, 308, '#9ef0b2', `700 18px ${C.fn}`);
  txt(c, `thread gap ${fmt(WS.pitch, 1)} cm`, cx - 98, 322, WSC.green, `700 11px ${C.fn}`, 'right');
  return { x: hx + 8, y: hy - 52 };
}

/* ---------- the rulers (after a pull): the load's path and the effort's path, ticks every 0.05 m ---------- */
function wsRuler(c, x, y, w, dist, title, col) {
  const len = Math.max(0.5, Math.ceil(dist * 2 - 1e-9) / 2), pxm = (w - 20) / len, minor = pxm * 0.05 >= 4 ? 0.05 : pxm * 0.5 >= 8 ? 0.5 : 1, lab = pxm >= 150 ? 0.1 : pxm >= 60 ? 0.5 : len > 6 ? 2 : 1;
  c.fillStyle = '#fbf3da'; c.beginPath(); c.roundRect(x, y, w, 42, 6); c.fill(); c.strokeStyle = '#8a7a50'; c.lineWidth = 1;
  c.fillStyle = col; c.globalAlpha = .45; c.fillRect(x + 10, y + 3, dist * pxm, 7); c.globalAlpha = 1;
  c.fillStyle = WSC.ink; c.font = `600 9px ${C.fn}`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  for (let v = 0; v <= len + 1e-9; v += minor) { const xx = x + 10 + v * pxm, major = Math.abs(v / lab - Math.round(v / lab)) < 1e-6, half = Math.abs(v * 10 - Math.round(v * 10)) < 1e-6; c.beginPath(); c.moveTo(xx, y + 10); c.lineTo(xx, y + 10 + (major ? 14 : half ? 9 : 5)); c.stroke(); if (major) c.fillText(String(Math.round(v * 100) / 100), xx, y + 36); }
  c.fillStyle = col; c.beginPath(); c.moveTo(x + 10 + dist * pxm, y + 2); c.lineTo(x + 6 + dist * pxm, y - 5); c.lineTo(x + 14 + dist * pxm, y - 5); c.closePath(); c.fill();
  txt(c, title, x + 6, y - 9, WSC.ink, `800 10px ${C.fb}`, 'left');
}

/* ---------- the whole scene ---------- */
function drawShopScene(c) {
  wsRoom(c); const cur = WS.c || wsCalc(), riseNow = WS.c && !WS.c.capped ? WS.c.rise * WS.prog : 0, prog = WS.c && !WS.c.capped ? WS.prog : 0, mk = wsMasked();
  let ep;
  if (WS.mach === 'hand') ep = wsDrawHand(c, cur, riseNow); else if (WS.mach === 'lever') ep = wsDrawLever(c, cur, riseNow); else if (WS.mach === 'pulley') ep = wsDrawPulley(c, cur, riseNow, prog); else if (WS.mach === 'winch') ep = wsDrawWinch(c, cur, riseNow);
  else if (WS.mach === 'ramp') ep = wsDrawRamp(c, cur, riseNow, prog); else if (WS.mach === 'wedge') ep = wsDrawWedge(c, cur, riseNow, prog); else ep = wsDrawScrew(c, cur, riseNow, prog);
  const M = wsDialMax(WS.c ? WS.c.need : wsCalc().need), hide = mk.has('readE');
  wsNewtonmeter(c, 660, 150, M, hide ? 0 : WS.reading, hide, ep ? ep.x : null, ep ? ep.y : null);
  wsMonitor(c);
  /* readouts */
  const rows = [['Load', `${fmt(WS.load, WS.load % 1 ? 1 : 0)} N (${fmt(WS.load / WS_WORLDS[WS.world].g, 0)} kg)`], [WS.mach === 'wedge' ? 'Halves opened' : 'Load rise', fmt(riseNow, 2) + ' m'], [WS.mach === 'pulley' ? 'Rope pulled' : 'Your hand moved', fmt(wsR2(cur.ma * riseNow), 2) + ' m']];
  if (wsHas('readMA')) rows.push(['Mechanical advantage', mk.has('readMA') ? '?' : fmt(cur.ma, 2)]);
  if (wsHas('readWork')) { const done = WS.done && !WS.c.capped; rows.push(['Work in', mk.has('readWork') ? '?' : done ? fmt(WS.c.workIn, 0) + ' J' : '–'], ['Work out', mk.has('readWork') ? '?' : done ? fmt(WS.c.workOut, 0) + ' J' : '–']); }
  rows.forEach(([l, v], i) => { const y = 24 + i * 46; c.fillStyle = C.panel; c.globalAlpha = .94; c.beginPath(); c.roundRect(728, y, 164, 40, 8); c.fill(); c.globalAlpha = 1; c.strokeStyle = C.line; c.lineWidth = 1.2; c.stroke(); txt(c, l, 738, y + 11, C.muted, `700 10.5px ${C.fb}`, 'left'); txt(c, v, 738, y + 28, C.ink, `700 15px ${C.fn}`, 'left'); });
  /* messages */
  if (WS.done && WS.msg) { const bad = WS.c && (WS.c.capped || WS.c.short); const w = Math.min(560, c.measureText(WS.msg).width + 40); c.font = `700 14px ${C.fb}`; const ww = clamp(c.measureText(WS.msg).width + 36, 110, 520); c.fillStyle = bad ? WSC.amber : WSC.green; c.beginPath(); c.roundRect(450 - ww / 2 + 30, 6, ww, 30, 8); c.fill(); txt(c, WS.msg, 450 + 30, 21.5, '#fff', `700 14px ${C.fb}`, 'center'); }
  else if (!WS.busy && !WS.shown) txt(c, `Press ${WS_VERB[WS.mach]} to work the machine`, 450 + 30, 21, WSC.ink, `700 13px ${C.fb}`);
  if (WS.world !== 'earth') hudBox(c, `${WS_WORLDS[WS.world].n} · g = ${WS_WORLDS[WS.world].g} N/kg`, 890, 418, C.line, 'right');
  if (!WS.lim.noGhost && WS.real) txt(c, 'Real machine: friction on', 450, 418, WSC.red, `700 12px ${C.fb}`);
  /* rulers */
  if (WS.done && WS.c && !WS.c.capped && wsHas('rulers')) {
    wsRuler(c, 14, 376, 410, Math.max(WS.c.rise, 0.01), WS.mach === 'wedge' ? 'HALVES OPENED (m)' : 'LOAD RISE (m)', WSC.green); wsRuler(c, 440, 376, 450, Math.max(WS.c.eDist, 0.01), WS.mach === 'pulley' ? 'ROPE YOU PULLED (m)' : 'HOW FAR YOUR HAND MOVED (m)', WSC.red);
  }
}
