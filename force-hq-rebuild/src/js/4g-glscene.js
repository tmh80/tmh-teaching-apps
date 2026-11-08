/* ===== Operation Gummy Lift: drawing the crater, side-on (stage 2). Same flat, rounded look as the Workshop (4b-shopdraw.js).
   World units are metres (x across, y up from the crater floor). GLV maps them to canvas pixels, with zoom and pan.
   glDrawWorld(c, o) draws everything; o = { rig, ev (glEvaluate result), ground, ghost, ship {x,y,tilt,mood,inside,dmg}, smoo {x,y,mood}|null,
   sel, hz (handover target), ruler, run (stage 3 extras), t } */
const GLC = { sky0: '#2d1f63', sky1: '#8e6fd6', rock0: '#b9a2e4', rock1: '#7d63ba', crust: '#d6c4f5', deep: '#5f4a99', crys: 'rgba(255,255,255,.9)', wood: '#c9a36a', wood2: '#9c7845', steel: '#8e9ca5', steel2: '#5d6b74',
  rope: '#f4e7c8', bad: '#ff5d5d', glow: '#7ef0a8', ink: '#1f1d26', label: '#fffaf2', jelly: '#ffb347', jelly2: '#ff8a3d', beam: 'rgba(160,255,214,.35)' };
const GLV = { LW: 1000, LH: 300, K: 10, z: 1, cx: 48, cy: 12, wide: 300 };
const glSX = x => GLV.LW / 2 + (x - GLV.cx) * GLV.K * GLV.z, glSY = y => GLV.LH / 2 - (y - GLV.cy) * GLV.K * GLV.z, glU = () => GLV.K * GLV.z;
const glWX = sx => GLV.cx + (sx - GLV.LW / 2) / glU(), glWY = sy => GLV.cy - (sy - GLV.LH / 2) / glU();
/* keep the view inside the world: at zoom 1 the whole crater fits */
function glClampView() {
  const halfW = GLV.LW / 2 / glU(), halfH = GLV.LH / 2 / glU();
  GLV.cx = halfW * 2 >= 100 ? 48 : clamp(GLV.cx, -2 + halfW, 98 - halfW);
  GLV.cy = clamp(GLV.cy, -1.5 + halfH, Math.max(-1.5 + halfH, 30 - halfH));
}
const glLbl = (c, s, x, y, col, size, align, bg) => { c.font = `800 ${size || 12}px ${C.fb || 'sans-serif'}`; const w = c.measureText(s).width;
  if (bg) { c.fillStyle = bg; c.beginPath(); c.roundRect((align === 'left' ? x : align === 'right' ? x - w : x - w / 2) - 5, y - (size || 12) * 0.75, w + 10, (size || 12) * 1.5, 6); c.fill(); }
  txt(c, s, x, y, col || GLC.label, `800 ${size || 12}px ${C.fb || 'sans-serif'}`, align); };
/* a few fixed sparkles and crystal clusters (seeded, so they never jump about) */
const GL_STARS = (() => { const r = rng(9); return Array.from({ length: 70 }, () => [r() * 100 - 2, 14 + r() * 17, 0.6 + r() * 1.4, r() * 6]); })();
const GL_CRYS = [[2, 1], [10, 0.6], [25, 0.8], [33, 1], [41, 0.7], [49, 0.9], [61, 0.8], [79, 1], [88, 0.7], [93, 0.9]];

function glDrawSky(c, t) {
  const sk = c.createLinearGradient(0, glSY(31), 0, glSY(0)); sk.addColorStop(0, GLC.sky0); sk.addColorStop(1, GLC.sky1); c.fillStyle = sk; c.fillRect(0, 0, GLV.LW, GLV.LH);
  GL_STARS.forEach(([x, y, r, ph]) => { c.globalAlpha = RMOTION ? 0.8 : 0.5 + 0.4 * Math.sin(t * 1.3 + ph); c.fillStyle = '#fff'; c.beginPath(); c.arc(glSX(x), glSY(y), r * Math.min(1.6, GLV.z), 0, 7); c.fill(); });
  c.globalAlpha = 1; const u = glU();
  c.fillStyle = '#f3e9ff'; c.beginPath(); c.arc(glSX(22), glSY(25), 2.2 * u, 0, 7); c.fill(); c.fillStyle = '#d9c5f5'; c.beginPath(); c.arc(glSX(21.4), glSY(25.5), 0.6 * u, 0, 7); c.fill();
  c.fillStyle = '#ffd6f0'; c.beginPath(); c.arc(glSX(34), glSY(22.5), 1.1 * u, 0, 7); c.fill();
}
/* the Big Jelly: a huge orange jelly cruiser hovering over the plain, too heavy to land on the crumbly rim */
function glDrawBigJelly(c, t, beamOn) {
  const u = glU(), bob = RMOTION ? 0 : Math.sin(t * 1.4) * 0.25, x = glSX(86), y = glSY(22 + bob);
  if (beamOn) { const g = c.createLinearGradient(x, y, x, y + 14 * u); g.addColorStop(0, 'rgba(160,255,214,.7)'); g.addColorStop(1, 'rgba(160,255,214,.22)'); c.fillStyle = g; c.beginPath(); c.moveTo(x - 1.2 * u, y + 1.6 * u); c.lineTo(beamOn.x, beamOn.y); c.lineTo(beamOn.x2 || beamOn.x, beamOn.y2 || beamOn.y); c.lineTo(x + 1.2 * u, y + 1.6 * u); c.closePath(); c.fill(); }
  c.save(); c.translate(x, y); c.scale(u / 10, u / 10);
  const g = c.createLinearGradient(0, -38, 0, 18); g.addColorStop(0, '#ffd27a'); g.addColorStop(1, GLC.jelly2); c.fillStyle = g; c.globalAlpha = .93;
  c.beginPath(); c.moveTo(-72, 10); c.quadraticCurveTo(-74, -36, 0, -40); c.quadraticCurveTo(74, -36, 72, 10); c.quadraticCurveTo(0, 22, -72, 10); c.fill(); c.globalAlpha = 1;
  c.fillStyle = '#e06b2b'; c.beginPath(); c.roundRect(-78, 2, 156, 12, 6); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(0, 6, 62, 3.6, 4.3); c.stroke();
  [-40, -14, 12, 38].forEach((wx, i) => { c.fillStyle = '#bfe6f5'; c.beginPath(); c.arc(wx, -14, 8, 0, 7); c.fill(); c.strokeStyle = '#fffaf2'; c.lineWidth = 3; c.stroke(); c.fillStyle = ['#ff6fa8', '#7ad66b', '#ffd24d', '#a78bfa'][i]; c.beginPath(); c.arc(wx, -11, 4, 0, 7); c.fill(); c.beginPath(); c.arc(wx - 3, -15, 2, 0, 7); c.arc(wx + 3, -15, 2, 0, 7); c.fill(); });
  const on = RMOTION || Math.floor(t * 2) % 2 === 0; [-60, 60].forEach(lx => { c.fillStyle = on ? '#7ef0a8' : '#2f8a5b'; c.beginPath(); c.arc(lx, 8, 4, 0, 7); c.fill(); });
  c.fillStyle = '#5d6b74'; c.beginPath(); c.roundRect(-12, 13, 24, 8, 4); c.fill(); c.fillStyle = beamOn ? '#a0ffd6' : '#3a8f73'; c.beginPath(); c.arc(0, 21, 5, 0, Math.PI); c.fill();
  c.restore();
  glLbl(c, 'Big Jelly', x, y - 4.9 * u, '#ffe7b8', Math.max(10, Math.min(14, u * 1.2)));
}
function glDrawGround(c, g, ghost) {
  const u = glU(), bot = GLV.LH + 4, path = arr => { c.beginPath(); c.moveTo(glSX(-2), bot); c.lineTo(glSX(-2), glSY(arr[0])); arr.forEach((y, x) => c.lineTo(glSX(x), glSY(y))); c.lineTo(glSX(98), glSY(arr[arr.length - 1])); c.lineTo(glSX(98), bot); c.closePath(); };
  if (ghost) { path(ghost); c.fillStyle = 'rgba(214,196,245,.28)'; c.fill(); c.setLineDash([5, 5]); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.stroke(); c.setLineDash([]); }
  path(g); const gr = c.createLinearGradient(0, glSY(15), 0, glSY(-1)); gr.addColorStop(0, GLC.rock0); gr.addColorStop(1, GLC.rock1); c.fillStyle = gr; c.fill();
  c.save(); c.clip(); c.strokeStyle = GLC.crust; c.lineWidth = Math.max(3, 0.45 * u); c.lineJoin = 'round'; c.beginPath(); g.forEach((y, x) => x ? c.lineTo(glSX(x), glSY(y)) : c.moveTo(glSX(x), glSY(y))); c.stroke();
  c.fillStyle = 'rgba(95,74,153,.35)'; [[12, -0.8, 3], [30, 1.6, 2], [52, 5.5, 2.4], [70, 6.4, 2], [86, 4.8, 3]].forEach(([x, y, r]) => { c.beginPath(); c.ellipse(glSX(x), glSY(y), r * u, r * 0.45 * u, 0, 0, 7); c.fill(); });
  c.restore();
  GL_CRYS.forEach(([x, s]) => { const y = glAt(g, x); c.fillStyle = GLC.crys; [-0.5, 0, 0.45].forEach((dx, i) => { const hh = (i === 1 ? 1.3 : 0.8) * s * u, ww = 0.32 * s * u, X = glSX(x + dx * s), Y = glSY(y); c.beginPath(); c.moveTo(X, Y - hh); c.lineTo(X + ww, Y - hh * 0.3); c.lineTo(X + ww * 0.6, Y + 1); c.lineTo(X - ww * 0.6, Y + 1); c.lineTo(X - ww, Y - hh * 0.3); c.closePath(); c.fill(); }); });
}
/* the boulder: a lumpy grey rock wedged against the Gumdrop's right landing leg */
function glDrawBoulder(c, x, y, rot, cracked) {
  const u = glU(); c.save(); c.translate(glSX(x), glSY(y)); c.rotate(rot || 0);
  c.fillStyle = '#8b8f93'; c.beginPath(); c.moveTo(-1.2 * u, 0.2 * u); c.quadraticCurveTo(-1.35 * u, -0.9 * u, -0.5 * u, -1.25 * u); c.quadraticCurveTo(0.4 * u, -1.55 * u, 1.05 * u, -0.85 * u); c.quadraticCurveTo(1.45 * u, -0.2 * u, 1.0 * u, 0.25 * u); c.closePath(); c.fill();
  c.fillStyle = '#a3a7ab'; c.beginPath(); c.ellipse(-0.35 * u, -0.85 * u, 0.42 * u, 0.22 * u, -0.4, 0, 7); c.fill();
  if (cracked) { c.strokeStyle = '#4c5257'; c.lineWidth = 2; c.beginPath(); c.moveTo(-0.1 * u, -1.3 * u); c.lineTo(0.15 * u, -0.6 * u); c.lineTo(-0.2 * u, -0.1 * u); c.stroke(); }
  c.restore();
}
/* the Gumdrop at real size (about 5 m across), with damage: scorch marks, cracks and a wobble */
function glDrawShip(c, s) {
  const u = glU(), sc = 0.045 * u, dmg = s.dmg || 0, wob = !RMOTION && s.shake ? Math.sin(performance.now() / 30) * 0.06 * u : 0;
  const X = glSX(s.x) + wob, Y = glSY(s.y);
  if (s.inside) drawGumdropInside(c, X, Y, sc, s.tilt || 0, s.mood || 'worried'); else drawGumdrop(c, X, Y, sc, s.tilt || 0);
  if (dmg > 0) { c.save(); c.translate(X, Y); c.rotate(s.tilt || 0); c.scale(sc, sc);
    c.fillStyle = 'rgba(40,24,20,.45)'; const nS = Math.min(4, Math.ceil(dmg / 25)); for (let i = 0; i < nS; i++) { c.beginPath(); c.ellipse([-30, 26, -12, 36][i], [-18, -30, -60, -10][i], 13, 7, [0.3, -0.5, 0.1, 0.8][i], 0, 7); c.fill(); }
    c.strokeStyle = '#3b1d2c'; c.lineWidth = 3; const nC = Math.min(3, Math.ceil(dmg / 34)); for (let i = 0; i < nC; i++) { const ox = [-18, 20, 0][i], oy = [-66, -54, -30][i]; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + 7, oy + 9); c.lineTo(ox + 2, oy + 16); c.lineTo(ox + 9, oy + 24); c.stroke(); }
    c.restore(); }
}
/* ---------- machines ---------- */
function glCablePoint(p, m) {
  if (p.type === 'ramp') { const e = m ? m.end : { x: p.x1 + glRun(p), y: p.y1 + p.rise }; return { x: e.x + 0.6, y: e.y + 1.6 }; }
  if (p.type === 'crane') return { x: p.x, y: (m ? m.start.y : 0) + p.rise + 2.6 };
  if (p.type === 'lever') return { x: p.x + (p.dir || 1) * GL.beam, y: (m ? m.start.y : 0) + 1.1 };
  if (p.type === 'block' || p.type === 'winch') return { x: p.x, y: p.y };
  return null;
}
function glDrawRamp(c, p, m, bad, ground) {
  const u = glU(), a = m.start, b = m.end, ang = Math.atan2(b.y - a.y, b.x - a.x);
  /* support legs down to whatever is below the deck */
  c.strokeStyle = GLC.steel2; c.lineWidth = Math.max(2, 0.18 * u);
  for (let d = 3; d < p.L - 1; d += 4) { const x = a.x + Math.cos(ang) * d, y = a.y + Math.sin(ang) * d, gy = glAt(ground, x); if (y - gy > 0.4) { c.beginPath(); c.moveTo(glSX(x), glSY(y)); c.lineTo(glSX(x), glSY(gy)); c.stroke(); } }
  c.save(); c.translate(glSX(a.x), glSY(a.y)); c.rotate(-ang); const L = p.L * u, th = Math.max(5, 0.42 * u);
  c.fillStyle = bad ? '#e8a0a0' : GLC.wood; c.beginPath(); c.roundRect(0, -th, L, th, th / 3); c.fill();
  c.fillStyle = bad ? '#c25b5b' : GLC.wood2; for (let d = 1.5; d < p.L; d += 1.5) c.fillRect(d * u, -th, Math.max(1.5, 0.08 * u), th);
  c.fillStyle = GLC.steel; c.fillRect(0, -th - Math.max(2, 0.1 * u), L, Math.max(2, 0.1 * u));
  c.restore();
  c.fillStyle = GLC.steel2; c.beginPath(); c.arc(glSX(b.x), glSY(b.y + 0.3), Math.max(3, 0.35 * u), 0, 7); c.fill();
}
function glDrawCrane(c, p, m, bad, hookY) {
  const u = glU(), by = m.start.y, top = by + p.rise + 2.6, x = p.x, col = bad ? GLC.bad : '#e3a51c';
  c.strokeStyle = col; c.lineWidth = Math.max(3, 0.3 * u); c.lineCap = 'round';
  [-1, 1].forEach(sd => { c.beginPath(); c.moveTo(glSX(x + sd * 3.2), glSY(by)); c.lineTo(glSX(x + sd * 2.6), glSY(top)); c.stroke(); c.lineWidth = Math.max(1.5, 0.14 * u); for (let k = 1; k < 4; k++) { const yy = by + (top - by) * k / 4; c.beginPath(); c.moveTo(glSX(x + sd * (3.2 - 0.6 * k / 4)), glSY(yy)); c.lineTo(glSX(x + sd * (3.2 - 0.6 * (k + 1) / 4)), glSY(yy + (top - by) / 4)); c.stroke(); } c.lineWidth = Math.max(3, 0.3 * u); });
  c.beginPath(); c.moveTo(glSX(x - 3.2), glSY(top)); c.lineTo(glSX(x + 3.2), glSY(top)); c.stroke();
  c.fillStyle = GLC.steel2; [-1, 1].forEach(sd => { c.beginPath(); c.roundRect(glSX(x + sd * 3.2) - 0.5 * u, glSY(by) - 0.3 * u, u, 0.3 * u, 2); c.fill(); });
  const hy = hookY == null ? by + 4.2 : hookY; c.strokeStyle = GLC.rope; c.lineWidth = Math.max(1.5, 0.1 * u); c.beginPath(); c.moveTo(glSX(x), glSY(top)); c.lineTo(glSX(x), glSY(hy)); c.stroke();
  c.strokeStyle = GLC.steel2; c.lineWidth = Math.max(2, 0.16 * u); c.beginPath(); c.arc(glSX(x), glSY(hy) + 0.25 * u, 0.3 * u, Math.PI * 1.1, Math.PI * 2.4); c.stroke();
}
function glDrawLever(c, p, m, bad, tiltT) {
  /* the same drawing as the Workshop bench lever (drawLeverShape in 4n): a bar on a triangle fulcrum. The load end rises by `rise` as tiltT goes 0 → 1 */
  const u = glU(), d = p.dir || 1, by = m.start.y, fx = p.x + d * p.arm, ex = p.x + d * GL.beam, k = tiltT || 0;
  const ly = by + 0.9 + k * p.rise, ey = by + 0.9 - k * p.rise * (GL.beam - p.arm) / p.arm;
  drawLeverShape(c, { a: { x: glSX(p.x), y: glSY(ly) }, b: { x: glSX(ex), y: glSY(Math.max(ey, by - 30)) }, fx: glSX(fx), fy: glSY(by + 0.9), floor: glSY(by), thick: Math.max(4, 0.32 * u), bad });
}
function glDrawJack(c, p, m, bad, k) {
  const u = glU(), by = m.start.y, hgt = 0.7 + (k || 0) * p.rise; c.fillStyle = bad ? GLC.bad : GLC.steel2; c.beginPath(); c.roundRect(glSX(p.x - 0.7), glSY(by + 0.35), 1.4 * u, 0.35 * u, 3); c.fill();
  c.strokeStyle = GLC.steel; c.lineWidth = Math.max(3, 0.28 * u); c.beginPath(); c.moveTo(glSX(p.x), glSY(by + 0.35)); c.lineTo(glSX(p.x), glSY(by + hgt)); c.stroke();
  c.strokeStyle = '#e3a51c'; c.lineWidth = Math.max(1.2, 0.07 * u); for (let y = by + 0.45; y < by + hgt; y += 0.22) { c.beginPath(); c.moveTo(glSX(p.x - 0.16), glSY(y)); c.lineTo(glSX(p.x + 0.16), glSY(y + 0.1)); c.stroke(); }
  c.fillStyle = GLC.steel2; c.fillRect(glSX(p.x - 0.5), glSY(by + hgt + 0.12), u, 0.14 * u);
}
function glDrawPlatform(c, pl, over) {
  const u = glU(), x0 = glSX(pl.x0), x1 = glSX(pl.x1), yT = glSY(pl.top), yB = glSY(pl.base - 0.2), col = over ? GLC.bad : '#9fb0ba';
  c.strokeStyle = col; c.lineWidth = Math.max(2, 0.16 * u); c.beginPath(); c.moveTo(x0 + 3, yB); c.lineTo(x0 + 3, yT); c.moveTo(x1 - 3, yB); c.lineTo(x1 - 3, yT); c.stroke();
  c.lineWidth = Math.max(1, 0.08 * u); const n = Math.max(1, Math.round((pl.top - pl.base) / 1.5)); for (let i = 0; i < n; i++) { const ya = yB + (yT - yB) * i / n, yb = yB + (yT - yB) * (i + 1) / n; c.beginPath(); c.moveTo(x0 + 3, ya); c.lineTo(x1 - 3, yb); c.moveTo(x1 - 3, ya); c.lineTo(x0 + 3, yb); c.stroke(); }
  c.fillStyle = over ? GLC.bad : GLC.steel2; c.beginPath(); c.roundRect(x0, yT, x1 - x0, Math.max(4, 0.32 * u), 3); c.fill();
  c.fillStyle = '#e3a51c'; for (let x = x0 + 4; x < x1 - 6; x += 12) c.fillRect(x, yT + 1, 5, Math.max(2, 0.12 * u));
}
function glDrawBlock(c, p, bad) {
  const u = glU(), r = Math.max(7, 0.5 * u), X = glSX(p.x), Y = glSY(p.y);
  c.fillStyle = bad ? GLC.bad : GLC.steel2; c.beginPath(); c.roundRect(X - r * 0.5, Y - r * 1.5, r, r * 0.7, 3); c.fill();
  c.fillStyle = GLC.steel; c.beginPath(); c.arc(X, Y, r, 0, 7); c.fill(); c.fillStyle = GLC.steel2; c.beginPath(); c.arc(X, Y, r * 0.35, 0, 7); c.fill();
}
function glDrawWinch(c, p, bad, spin) {
  const u = glU(), r = Math.max(8, 0.55 * u), X = glSX(p.x), Y = glSY(p.y);
  c.fillStyle = bad ? GLC.bad : '#2a7d48'; c.beginPath(); c.roundRect(X - r * 1.2, Y + r * 0.6, r * 2.4, r * 0.5, 3); c.fill();
  c.fillStyle = '#e3a51c'; c.beginPath(); c.roundRect(X - r * 0.9, Y - r * 0.7, r * 1.8, r * 1.4, r * 0.4); c.fill();
  c.strokeStyle = '#8a5a12'; c.lineWidth = 1.5; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(X + i * r * 0.32, Y - r * 0.7); c.lineTo(X + i * r * 0.32, Y + r * 0.7); c.stroke(); }
  const a = spin || 0; c.strokeStyle = GLC.steel2; c.lineWidth = Math.max(2, 0.12 * u); c.beginPath(); c.moveTo(X, Y); c.lineTo(X + Math.cos(a) * r * 1.5, Y + Math.sin(a) * r * 1.5); c.stroke();
  c.fillStyle = '#d6402c'; c.beginPath(); c.arc(X + Math.cos(a) * r * 1.5, Y + Math.sin(a) * r * 1.5, r * 0.28, 0, 7); c.fill();
}
function glDrawDyn(c, p, g, preview) {
  const u = glU(), y = glAt(g, p.x), X = glSX(p.x), Y = glSY(y), r = p.big ? GL_BLAST.big : GL_BLAST.small, n = p.big ? 3 : 1;
  if (preview) { c.setLineDash([4, 4]); c.strokeStyle = 'rgba(255,190,120,.9)'; c.lineWidth = 1.5; c.beginPath(); c.arc(X, Y, r * u, 0, 7); c.stroke(); c.setLineDash([]); }
  for (let i = 0; i < n; i++) { const ox = (i - (n - 1) / 2) * 0.32 * u; c.fillStyle = '#d6402c'; c.beginPath(); c.roundRect(X + ox - 0.14 * u, Y - 0.9 * u, 0.28 * u, 0.9 * u, 2); c.fill(); }
  c.strokeStyle = '#f4e7c8'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X, Y - 0.9 * u); c.quadraticCurveTo(X + 0.4 * u, Y - 1.4 * u, X + 0.2 * u, Y - 1.7 * u); c.stroke();
  c.fillStyle = '#ffd24d'; c.beginPath(); c.arc(X + 0.2 * u, Y - 1.75 * u, Math.max(2, 0.12 * u), 0, 7); c.fill();
}
function glDrawCable(c, a, b, slack) {
  const u = glU(), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - (slack == null ? 0.25 : slack) * Math.min(1, Math.hypot(b.x - a.x, b.y - a.y) / 6);
  c.strokeStyle = GLC.rope; c.lineWidth = Math.max(1.5, 0.1 * u); c.lineCap = 'round'; c.beginPath(); c.moveTo(glSX(a.x), glSY(a.y)); c.quadraticCurveTo(glSX(mx), glSY(my), glSX(b.x), glSY(b.y)); c.stroke();
}
/* the handover zone: where the next machine must start (3 m across, 0.5 m up or down) */
function glDrawZone(c, z, t, label) {
  const u = glU(), pulse = RMOTION ? 0.5 : 0.5 + 0.5 * Math.sin(t * 4), X0 = glSX(z.x - GL.hzX), X1 = glSX(z.x + GL.hzX), Y0 = glSY(z.y + GL.hzY), Y1 = glSY(z.y - GL.hzY);
  c.save(); c.shadowColor = GLC.glow; c.shadowBlur = 8 + 10 * pulse; c.strokeStyle = `rgba(126,240,168,${0.55 + 0.4 * pulse})`; c.lineWidth = 2.5; c.setLineDash([6, 4]);
  c.beginPath(); c.roundRect(X0, Y0, X1 - X0, Math.max(6, Y1 - Y0), 6); c.stroke(); c.restore();
  c.fillStyle = `rgba(126,240,168,${0.12 + 0.1 * pulse})`; c.beginPath(); c.roundRect(X0, Y0, X1 - X0, Math.max(6, Y1 - Y0), 6); c.fill();
  if (label) glLbl(c, label, (X0 + X1) / 2, glSY(z.y + 5.4), '#c9ffdc', 11, 'center', 'rgba(31,29,38,.6)');
}
function glDrawRuler(c, r) {
  const u = glU(), A = { x: glSX(r.a.x), y: glSY(r.a.y) }, B = { x: glSX(r.b.x), y: glSY(r.b.y) }, dx = r.b.x - r.a.x, dy = r.b.y - r.a.y;
  c.setLineDash([3, 3]); c.strokeStyle = 'rgba(255,230,140,.75)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, A.y); c.lineTo(B.x, B.y); c.stroke(); c.setLineDash([]);
  c.strokeStyle = '#ffe28a'; c.lineWidth = 3; c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y); c.stroke();
  [A, B].forEach(P => { c.fillStyle = '#ffe28a'; c.beginPath(); c.arc(P.x, P.y, 8, 0, 7); c.fill(); c.fillStyle = GLC.ink; c.beginPath(); c.arc(P.x, P.y, 2.5, 0, 7); c.fill(); });
  const s = `across ${fmt(Math.abs(dx), 1)} m · up ${fmt(dy, 1)} m · straight ${fmt(Math.hypot(dx, dy), 1)} m`;
  lblAdd(s, clamp((A.x + B.x) / 2, 120, GLV.LW - 120), Math.min(A.y, B.y) - 16, { col: GLC.ink, bg: '#ffe28a', prio: 1 });
}
/* everything, back to front */
function glDrawWorld(c, o) {
  const t = o.t || performance.now() / 1000, ev = o.ev, g = o.ground || (ev && ev.ground) || glBaseGround(), rig = o.rig || { parts: [], cables: [] }, run = o.run || {};
  readColors(); lblBegin(); glDrawSky(c, t); glDrawBigJelly(c, t, run.beam);
  /* the level the tractor beam can reach: anything at or above the dotted line beside the crest */
  const crest = glCrest(g); c.setLineDash([2, 6]); c.strokeStyle = 'rgba(160,255,214,.55)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(glSX(40), glSY(crest)); c.lineTo(glSX(80), glSY(crest)); c.stroke(); c.setLineDash([]);
  glDrawGround(c, g, o.ghost);
  const plats = ev ? ev.plats : [], P0 = glPlatforms(rig, g), byId = {}; rig.parts.forEach(p => byId[p.id] = p);
  plats.forEach(pl => { const bad = o.badPlat && pl.id === o.badPlat; glDrawPlatform(c, pl, pl.over || bad); if (bad) lblAdd(GL_PLATMSG, glSX((pl.x0 + pl.x1) / 2), glSY(pl.top) - 22, { col: '#fff', bg: '#c0392b', prio: 0, nofade: true }); });
  if (o.flashPlat) { const fp = glPlatforms({ parts: [Object.assign({ id: '_f' }, o.flashPlat)] }, g)[0]; glDrawPlatform(c, fp, true); lblAdd(GL_PLATMSG, glSX((fp.x0 + fp.x1) / 2), glSY(fp.top) - 22, { col: '#fff', bg: '#c0392b', prio: 0, nofade: true }); }
  const ms = {}; rig.parts.filter(p => GL_LIFT[p.type]).forEach(p => { ms[p.id] = glMachine(p, g, P0); });
  rig.parts.filter(p => p.type === 'dyn' && !(run.blown && run.blown.has(p.id))).forEach(p => glDrawDyn(c, p, o.ghost || g, !run.on));
  const faulty = id => { const m = ms[id]; if (!m) return false; const leg = ev && ev.legs.find(l => l.id === id); return (leg ? leg.faults.length : m.faults.length) > 0; };
  rig.parts.filter(p => p.type === 'ramp').forEach(p => glDrawRamp(c, p, ms[p.id], faulty(p.id), g));
  /* the boulder and the ship sit behind the lifting machines' front parts */
  const rockShown = o.rock !== false && !(run.rockGone);
  if (rockShown && !(o.ship && o.ship.carryRock)) glDrawBoulder(c, run.rockX != null ? run.rockX : 18.7, run.rockY != null ? run.rockY : glAt(g, 18.7), run.rockRot || 0.12, false);
  if (run.rope && o.ship) glDrawCable(c, run.rope.a, run.rope.b, 0);
  if (o.ship) { glDrawShip(c, o.ship); if (o.ship.carryRock && rockShown) glDrawBoulder(c, o.ship.x + 4.6 * Math.cos(o.ship.tilt || 0), o.ship.y - 4.6 * Math.sin(o.ship.tilt || 0), (o.ship.tilt || 0) + 0.12); }
  rig.parts.filter(p => p.type === 'crane').forEach(p => glDrawCrane(c, p, ms[p.id], faulty(p.id), run.hook && run.hook[p.id]));
  rig.parts.filter(p => p.type === 'lever').forEach(p => glDrawLever(c, p, ms[p.id], faulty(p.id), run.tilt && run.tilt[p.id]));
  rig.parts.filter(p => p.type === 'jack').forEach(p => glDrawJack(c, p, ms[p.id], faulty(p.id), run.tilt && run.tilt[p.id]));
  /* cables, then the add-ons on top */
  const cp = id => { if (id === 'boulder') return { x: 18.9, y: glAt(g, 18.7) + 1.0 }; const p = byId[id]; return p ? glCablePoint(p, ms[id]) : null; };
  (rig.cables || []).forEach(cb => {
    if (cb.a === 'ship' || cb.b === 'ship') { if (run.on) return; const oth = cb.a === 'ship' ? cb.b : cb.a, P = cp(oth); if (!P) return; const S = glShipSpot(ev, oth, g); glDrawCable(c, { x: S.x, y: S.y + GL_HOOK }, P, 0.4); return; }
    const a = cp(cb.a), b = cp(cb.b); if (a && b) glDrawCable(c, a, b); });
  if (o.cableDrag) glDrawCable(c, o.cableDrag.a, o.cableDrag.b, 0);
  rig.parts.filter(p => p.type === 'block').forEach(p => glDrawBlock(c, p));
  rig.parts.filter(p => p.type === 'winch').forEach(p => glDrawWinch(c, p, false, run.spin));
  if (o.smoo) drawSmooshy(c, glSX(o.smoo.x), glSY(o.smoo.y + 1.5), 0.026 * glU(), o.smoo.mood, t);
  if (o.hz) glDrawZone(c, o.hz, t, o.hzLabel);
  /* selection ring and cable dots */
  if (o.sel && byId[o.sel]) { const b = glBounds(byId[o.sel], ms[o.sel], g, plats); c.strokeStyle = '#ffe28a'; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath(); c.roundRect(glSX(b.x0) - 6, glSY(b.y1) - 6, (b.x1 - b.x0) * glU() + 12, (b.y1 - b.y0) * glU() + 12, 8); c.stroke(); c.setLineDash([]); }
  if (!run.on) rig.parts.filter(p => p.type === 'ramp').forEach(p => { const e = ms[p.id].end; lblAvoid(glSX(e.x), glSY(e.y), 14); c.fillStyle = '#fffaf2'; c.strokeStyle = GLC.ink; c.lineWidth = 2; c.beginPath(); c.arc(glSX(e.x), glSY(e.y), 7, 0, 7); c.fill(); c.stroke(); });
  if (!run.on) rig.parts.forEach(p => { const q = glCablePoint(p, ms[p.id]); if (!q) return; lblAvoid(glSX(q.x), glSY(q.y), 12); drawHookDot(c, glSX(q.x), glSY(q.y), { glow: o.hookGlow && GL_ROPED[p.type] }); });
  /* every load wears a hook: the Gumdrop, the ghost Gumdrop waiting for the next machine, and the boulder */
  if (!run.on && o.ship) {
    const hk = (sp, ghost) => { const X = glSX(sp.x), Y = glSY(sp.y + GL_HOOK); c.strokeStyle = GLC.rope; c.lineWidth = Math.max(1.5, 0.1 * u0); c.beginPath(); c.moveTo(X, glSY(sp.y + 4.5)); c.lineTo(X, Y); c.stroke(); drawHookDot(c, X, Y, { glow: o.hookGlow }); lblAvoid(X, Y, 12); };
    var u0 = glU(); const gh = ev && ev.ghost;
    if (gh) { const sc = 0.045 * u0; c.save(); c.globalAlpha = 0.5; drawGumdrop(c, glSX(gh.x), glSY(gh.y), sc, 0); c.restore();
      c.setLineDash([4, 4]); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(glSX(gh.x), glSY(gh.y + 2.2), 3.2 * u0, 2.6 * u0, 0, 0, 7); c.stroke(); c.setLineDash([]); hk(gh, true); }
    hk(o.ship);
  }
  if (!run.on && o.rock !== false) { const b = { x: GL.boulderX - 0.1, y: glAt(g, 18.7) + 1.0 }; drawHookDot(c, glSX(b.x), glSY(b.y), { glow: o.hookGlow }); lblAvoid(glSX(b.x), glSY(b.y), 12); }
  if (o.ruler) glDrawRuler(c, o.ruler);
  if (o.labels) glDrawLabels(c, o, g, crest, ev);
  lblFlush(c, GLV.LW, GLV.LH, o.fade);
  if (run.fx) run.fx(c, t);
}
/* the board labels (Tom, 8 Nov 2026): only the weights of the loads (the Gumdrop, the boulder) and the ghost Gumdrop's caption, plus "Drop here" while a lever or jack is being dragged.
   Rope counts, winch ratios and lifts are in the settings panel. lblFlush places them so they never overlap each other or a handle. */
function glDrawLabels(c, o, g, crest, ev) {
  const u = glU(), by = glAt(g, GL.boulderX - 0.3), sz = Math.max(10, Math.min(13, u * 1.15));
  if (o.rock !== false) {
    if (o.dropGlow) { const t = o.t || performance.now() / 1000, pulse = RMOTION ? 0.5 : 0.5 + 0.5 * Math.sin(t * 6); c.save(); c.shadowColor = GLC.glow; c.shadowBlur = 10 + 14 * pulse; c.strokeStyle = `rgba(126,240,168,${0.6 + 0.4 * pulse})`; c.lineWidth = 3; c.setLineDash([6, 4]);
      c.beginPath(); c.ellipse(glSX(GL.boulderX - 0.3), glSY(by + 0.55), 2.1 * u, 1.4 * u, 0, 0, 7); c.stroke(); c.restore(); lblAdd('Drop here', glSX(GL.boulderX + 1.8), glSY(by + 3.6), { size: sz + 1, col: '#c9ffdc', bg: 'rgba(31,29,38,.7)', prio: 2 }); }
    else lblAdd('Boulder 252 N', glSX(GL.boulderX + 1.8), glSY(by + 2.9), { size: sz, prio: 3 }); }
  if (o.ship && !o.ship.hideLabel) lblAdd('Gumdrop 6,300 N', glSX(o.ship.x), glSY(o.ship.y + 8.0), { size: sz, prio: 4 });
  if (o.ship && ev && ev.ghost) lblAdd(`Gumdrop after leg ${ev.stop.leg}`, glSX(ev.ghost.x), glSY(ev.ghost.y + 8.0), { size: sz, col: '#c9ffdc', prio: 4 });
}
/* where the Gumdrop is for a machine or add-on: at the start of the leg it belongs to, else waiting as the ghost (or still at the start) */
function glShipSpot(ev, id, g) {
  if (ev && ev.legs) { const l = ev.legs.find(q => q.id === id || (q.addons || []).includes(id)); if (l && l.at) return l.at; if (ev.ghost) return ev.ghost; if (ev.ship0) return ev.ship0; }
  return { x: GL.shipX, y: glAt(g || glBaseGround(), GL.shipX) };
}
/* a part's box in world metres, for hit tests and the selection ring */
function glBounds(p, m, g, plats) {
  if (p.type === 'ramp') { const a = m.start, b = m.end; return { x0: Math.min(a.x, b.x) - 0.3, x1: Math.max(a.x, b.x) + 0.3, y0: Math.min(a.y, b.y) - 0.4, y1: Math.max(a.y, b.y) + 0.6 }; }
  if (p.type === 'crane') return { x0: p.x - 3.4, x1: p.x + 3.4, y0: m.start.y, y1: m.start.y + p.rise + 2.8 };
  if (p.type === 'lever') { const d = p.dir || 1, xs = [p.x, p.x + d * GL.beam]; return { x0: Math.min(...xs) - 0.3, x1: Math.max(...xs) + 0.3, y0: m.start.y, y1: m.start.y + 1.4 }; }
  if (p.type === 'jack') return { x0: p.x - 0.8, x1: p.x + 0.8, y0: m.start.y, y1: m.start.y + 1.2 };
  if (p.type === 'platform') { const pl = plats.find(q => q.id === p.id); return pl ? { x0: pl.x0, x1: pl.x1, y0: pl.base, y1: pl.top + 0.3 } : { x0: p.x - 2, x1: p.x + 2, y0: 0, y1: 1 }; }
  if (p.type === 'dyn') { const y = glAt(g, p.x); return { x0: p.x - 0.6, x1: p.x + 0.6, y0: y, y1: y + 1.9 }; }
  return { x0: p.x - 0.8, x1: p.x + 0.8, y0: p.y - 0.8, y1: p.y + 0.9 };
}

/* ---------- Mission Control (step v1): the whole crater on a big mission-control screen, console lights round the edge.
   It reuses glDrawWorld, so it looks exactly like the builder's crater. Nothing to build here (Tom, 8 Nov 2026). c is the 900 x 430 Workshop canvas. ---------- */
function glDrawMission(c) {
  const t = performance.now() / 1000, SX = 20, SY = 34, SW = 860, SH = 372, g = glBaseGround(), keep = Object.assign({}, GLV);
  c.fillStyle = '#1b1830'; c.fillRect(0, 0, 900, 430);
  c.fillStyle = '#2a2547'; c.beginPath(); c.roundRect(4, 4, 892, 422, 16); c.fill();
  c.fillStyle = '#0d0b1a'; c.beginPath(); c.roundRect(SX - 6, SY - 6, SW + 12, SH + 12, 14); c.fill();
  c.save(); c.beginPath(); c.roundRect(SX, SY, SW, SH, 10); c.clip(); c.translate(SX, SY);
  Object.assign(GLV, { LW: SW, LH: SH, K: SW / 100, z: 1, cx: 48, cy: 14.2 });
  try { glDrawWorld(c, { rig: { parts: [], cables: [] }, ground: g, ev: null, ship: { x: GL.shipX, y: glAt(g, GL.shipX), tilt: 0, inside: true, mood: 'worried', dmg: 0 }, rock: true, labels: true, t }); }
  finally { Object.assign(GLV, keep); }
  c.restore();
  /* the console: a title strip, then rows of blinking lights along the top and bottom edges and down both sides */
  txt(c, 'GUMMY MISSION CONTROL · PLANET GLIMMER-9', 450, 18, '#ffe7b8', `800 13px ${C.fb}`);
  const cols = ['#7ef0a8', '#ffd24d', '#ff6fa8', '#8ec5ff'];
  const led = (x, y, i) => { const on = RMOTION || Math.floor(t * 1.5 + i * 0.7) % 3 !== 0; c.fillStyle = on ? cols[i % 4] : '#3a3554'; c.beginPath(); c.arc(x, y, 3.4, 0, 7); c.fill(); };
  for (let i = 0; i < 28; i++) { led(40 + i * 29.5, 418, i); if (i % 3 === 0 && i < 8) led(40 + i * 29.5, 12, i + 1); if (i > 19 && i % 3 === 0) led(40 + i * 29.5, 12, i); }
  for (let j = 0; j < 11; j++) { led(10, 50 + j * 32, j); led(890, 50 + j * 32, j + 2); }
}
