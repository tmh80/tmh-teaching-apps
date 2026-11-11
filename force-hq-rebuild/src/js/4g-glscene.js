/* ===== Operation Gummy Lift: drawing the crater, side-on (stage 2). Same flat, rounded look as the Workshop (4b-shopdraw.js).
   World units are metres (x across, y up from the crater floor). GLV maps them to canvas pixels, with zoom and pan.
   glDrawWorld(c, o) draws everything; o = { rig, ev (glEvaluate result), ground, ghost, ship {x,y,tilt,mood,inside,dmg}, smoo {x,y,mood}|null,
   sel, routes (draw each leg's path), ruler, run (stage 3 extras), t } */
const GLC = { sky0: '#120c2e', sky1: '#33246f', sky2: '#7a4fc0', haze: '#e9a6e0', ridge1: '#2a1f63', ridge2: '#3b2c82', rock0: '#cdbcf7', rock1: '#9a80e0', rock2: '#6a51b8', crust: '#f4ecff', deep: '#463389', crys: 'rgba(255,255,255,.9)', gem: '#8af3ff', gem2: '#ff9be0',
  wood: '#e0a45a', wood2: '#9b6a2c', steel: '#e4eaf5', steel2: '#a9b4c9', steelD: '#4c5670', dark: '#1b1d29', yellow: '#ffc53d', yellowD: '#c98512', rope: '#f8e6b0', ropeD: '#7c5f24',
  bad: '#ff5d5d', glow: '#7ef0a8', ink: '#1f1d26', label: '#fffaf2', jelly: '#ffb347', jelly2: '#ff8a3d', beam: 'rgba(160,255,214,.35)' };
const GLV = { LW: 1000, LH: 400, K: 10, z: 1, cx: 48, cy: 12, wide: 400 };   // 400 tall: room in the sky for the tutorial coach and the settings card
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

/* two rows of far hills behind the crater (seeded, in metres, so they pan and zoom with the board) */
const GL_RIDGE = [[5, 11.5, 2.6, 'ridge1'], [9, 9, 2, 'ridge2']].map(([seed, base, amp, col]) => { const r = rng(seed), a = []; let h = base; for (let x = -2; x <= 98; x += 4) { h = Math.max(base - amp, Math.min(base + amp, h + (r() - 0.5) * amp * 1.4)); a.push([x, h]); } return { a, col }; });
function glDrawSky(c, t) {
  const u = glU(), sk = c.createLinearGradient(0, glSY(31), 0, glSY(3)); sk.addColorStop(0, GLC.sky0); sk.addColorStop(0.5, GLC.sky1); sk.addColorStop(0.88, GLC.sky2); sk.addColorStop(1, GLC.haze); c.fillStyle = sk; c.fillRect(0, 0, GLV.LW, GLV.LH);
  GL_STARS.forEach(([x, y, r, ph]) => { c.globalAlpha = RMOTION ? 0.8 : 0.5 + 0.4 * Math.sin(t * 1.3 + ph); c.fillStyle = ph > 5 ? GLC.gem : '#fff'; c.beginPath(); c.arc(glSX(x), glSY(y), r * Math.min(1.6, GLV.z), 0, 7); c.fill(); });
  c.globalAlpha = 1;
  [[22, 25, 2.2, '#f1e9ff'], [34, 22.5, 1.1, '#ffb9de']].forEach(([x, y, r, col]) => { const X = glSX(x), Y = glSY(y), R = r * u, gl = c.createRadialGradient(X, Y, R * 0.6, X, Y, R * 3); gl.addColorStop(0, 'rgba(255,255,255,.26)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.fillRect(X - R * 3, Y - R * 3, R * 6, R * 6);
    c.fillStyle = col; c.beginPath(); c.arc(X, Y, R, 0, 7); c.fill(); c.globalAlpha = 0.18; c.fillStyle = GLC.sky1; c.beginPath(); c.arc(X - R * 0.3, Y - R * 0.2, R * 0.28, 0, 7); c.fill(); c.beginPath(); c.arc(X + R * 0.35, Y + R * 0.3, R * 0.18, 0, 7); c.fill(); c.globalAlpha = 1; });
  GL_RIDGE.forEach(R => { c.fillStyle = GLC[R.col]; c.beginPath(); c.moveTo(glSX(-2), GLV.LH + 4); R.a.forEach(([x, h]) => c.lineTo(glSX(x), glSY(h))); c.lineTo(glSX(98), GLV.LH + 4); c.closePath(); c.fill(); });
}
/* the Big Jelly: the gummy fleet's mothership (Tom, 11 Nov 2026: "bigger, with more mothership vibes than flying saucer vibes"). About 35 m long, prow towards the crater,
   three engines burning at the stern, decks of lit windows, the bridge under a jelly dome, and the tractor-beam bay in its belly at x = 86 m. Far too heavy to land on the crumbly rim. */
function glDrawBigJelly(c, t, beamOn) {
  const u = glU(), bob = RMOTION ? 0 : Math.sin(t * 1.1) * 0.15, x = glSX(86), y = glSY(20.4 + bob), fl = RMOTION ? 1 : 0.82 + 0.18 * Math.sin(t * 17), rr = (X, Y, W, H, R) => { c.beginPath(); c.roundRect(X, Y, W, H, R); c.fill(); };
  if (beamOn) { const g = c.createLinearGradient(x, y, x, y + 14 * u); g.addColorStop(0, 'rgba(160,255,214,.75)'); g.addColorStop(1, 'rgba(160,255,214,.2)'); c.fillStyle = g; c.beginPath(); c.moveTo(x - 1.8 * u, y); c.lineTo(beamOn.x, beamOn.y); c.lineTo(beamOn.x2 || beamOn.x, beamOn.y2 || beamOn.y); c.lineTo(x + 1.8 * u, y); c.closePath(); c.fill(); }
  c.save(); c.translate(x, y); c.scale(u / 10, u / 10); c.lineJoin = 'round'; c.lineCap = 'round';
  /* engine flames at the stern */
  [-36, -24, -12].forEach((ey, i) => { const L = (44 + 12 * (i === 1 ? 1 : 0)) * fl, g = c.createLinearGradient(124, 0, 124 + L, 0); g.addColorStop(0, 'rgba(138,243,255,.95)'); g.addColorStop(1, 'rgba(138,243,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(124, ey - 5); c.lineTo(124 + L, ey); c.lineTo(124, ey + 5); c.closePath(); c.fill(); });
  /* the upper decks, the bridge and its jelly dome, the masts */
  c.strokeStyle = GLC.steel2; c.lineWidth = 2; c.beginPath(); c.moveTo(98, -58); c.lineTo(98, -86); c.moveTo(-58, -44); c.lineTo(-58, -62); c.moveTo(88, -58); c.lineTo(88, -74); c.stroke();
  c.fillStyle = (RMOTION || Math.floor(t * 2) % 2 === 0) ? '#ff6f6f' : '#7a2a2a'; c.beginPath(); c.arc(98, -87, 2.6, 0, 7); c.fill(); c.fillStyle = GLC.gem; c.beginPath(); c.arc(-58, -63, 2.2, 0, 7); c.fill();
  { const dg = c.createLinearGradient(0, -94, 0, -70); dg.addColorStop(0, 'rgba(255,236,190,.85)'); dg.addColorStop(1, 'rgba(255,170,90,.55)'); c.fillStyle = dg; c.beginPath(); c.ellipse(36, -70, 38, 23, 0, Math.PI, 0); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(36, -70, 31, 17, 0, Math.PI * 1.12, Math.PI * 1.42); c.stroke(); }
  c.fillStyle = '#c9561a'; rr(-84, -60, 200, 20, 7); c.fillStyle = '#ef8a34'; rr(-16, -73, 104, 17, 7);
  c.fillStyle = 'rgba(255,255,255,.3)'; rr(-80, -60, 192, 3, 1.5); rr(-12, -73, 96, 3, 1.5);
  [0, 24, 48, 72].forEach((wx, i) => { c.fillStyle = GLC.dark; c.beginPath(); c.arc(wx, -64.5, 7.2, 0, 7); c.fill(); c.fillStyle = '#d9f1ff'; c.beginPath(); c.arc(wx, -64.5, 6, 0, 7); c.fill();
    c.fillStyle = ['#ff6fa8', '#7ad66b', '#ffd24d', '#a78bfa'][i]; c.beginPath(); c.arc(wx, -62.5, 3.4, 0, 7); c.fill(); c.beginPath(); c.arc(wx - 2.6, -66, 1.6, 0, 7); c.arc(wx + 2.6, -66, 1.6, 0, 7); c.fill(); });
  for (let wx = -72; wx <= -30; wx += 11) { c.fillStyle = '#fff3c4'; rr(wx, -54, 6, 4, 1.5); }
  /* the main hull */
  const hull = () => { c.beginPath(); c.moveTo(-228, -30); c.quadraticCurveTo(-150, -3, -92, 0); c.lineTo(102, 0); c.quadraticCurveTo(118, -3, 120, -20); c.lineTo(120, -44); c.lineTo(-118, -46); c.quadraticCurveTo(-190, -45, -228, -30); c.closePath(); };
  { const g = c.createLinearGradient(0, -46, 0, 0); g.addColorStop(0, '#ffc46b'); g.addColorStop(0.55, '#ff9a3d'); g.addColorStop(1, '#c9561a'); hull(); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(90,30,10,.55)'; c.lineWidth = 1.5; c.stroke(); }
  c.save(); hull(); c.clip(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-230, -44, 360, 3.5); c.fillStyle = '#b44a16'; c.fillRect(-230, -14, 360, 3); c.fillStyle = 'rgba(90,30,10,.25)'; c.fillRect(-230, -9, 360, 10);
  c.strokeStyle = 'rgba(90,30,10,.2)'; c.lineWidth = 1; for (let px = -190; px <= 110; px += 38) { c.beginPath(); c.moveTo(px, -46); c.lineTo(px - 7, 0); c.stroke(); } c.restore();
  for (let wx = -170, i = 0; wx <= 98; wx += 12.5, i++) { c.fillStyle = (i * 7) % 5 === 0 ? '#8a3f14' : '#fff3c4'; rr(wx, -36, 7, 4.5, 1.5); }
  for (let wx = -128, i = 0; wx <= 98; wx += 12.5, i++) { c.fillStyle = (i * 3) % 4 === 0 ? '#8a3f14' : '#a9f3ff'; rr(wx, -23.5, 5, 3.2, 1.2); }
  /* engine bells, the tractor-beam bay and the running lights */
  [-36, -24, -12].forEach(ey => { c.fillStyle = GLC.dark; rr(113, ey - 6.5, 13, 13, 3); c.fillStyle = GLC.gem; rr(123.5, ey - 4, 2.5, 8, 1); });
  c.fillStyle = GLC.dark; rr(-26, -8, 52, 10, 3); c.fillStyle = GLC.yellow; rr(-23, -6, 7, 6, 1.5); rr(16, -6, 7, 6, 1.5); c.fillStyle = beamOn ? '#a0ffd6' : '#3a8f73'; c.beginPath(); c.arc(0, 1.5, 8, 0, Math.PI); c.fill();
  { const on = RMOTION || Math.floor(t * 2) % 2 === 0; [[-204, -22], [-120, -5], [66, -1]].forEach(([lx, ly]) => { c.fillStyle = on ? GLC.glow : '#2f8a5b'; c.beginPath(); c.arc(lx, ly, 3, 0, 7); c.fill(); }); }
  c.restore();
  glLbl(c, 'The Big Jelly', glSX(72), y + 1.35 * u, '#ffe7b8', Math.max(10, Math.min(14, u * 1.2)), 'center', 'rgba(18,12,46,.7)');
}
function glDrawGround(c, g, ghost) {
  const u = glU(), bot = GLV.LH + 4, path = (arr, off) => { off = off || 0; c.beginPath(); c.moveTo(glSX(-2), bot + off); c.lineTo(glSX(-2), glSY(arr[0]) + off); arr.forEach((y, x) => c.lineTo(glSX(x), glSY(y) + off)); c.lineTo(glSX(98), glSY(arr[arr.length - 1]) + off); c.lineTo(glSX(98), bot + off); c.closePath(); };
  const top = off => { c.beginPath(); g.forEach((y, x) => x ? c.lineTo(glSX(x), glSY(y) + off) : c.moveTo(glSX(x), glSY(y) + off)); };
  if (ghost) { path(ghost); c.fillStyle = 'rgba(214,196,245,.28)'; c.fill(); c.setLineDash([5, 5]); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.stroke(); c.setLineDash([]); }
  path(g); const gr = c.createLinearGradient(0, glSY(16), 0, glSY(-2)); gr.addColorStop(0, GLC.rock0); gr.addColorStop(0.45, GLC.rock1); gr.addColorStop(1, GLC.rock2); c.fillStyle = gr; c.fill();
  /* layers of rock under the surface, dimples, and a soft shadow under the bright top edge */
  c.save(); c.clip(); c.globalAlpha = 0.5; c.fillStyle = GLC.rock2; path(g, 2.2 * u); c.fill(); c.fillStyle = GLC.deep; path(g, 4.8 * u); c.fill(); c.globalAlpha = 0.6; path(g, 8 * u); c.fill(); c.globalAlpha = 1;
  c.fillStyle = 'rgba(70,51,137,.4)'; [[12, -0.8, 3], [30, 1.6, 2], [52, 5.5, 2.4], [70, 6.4, 2], [86, 4.8, 3], [6, 2.2, 1.2], [41, 3.6, 1.3], [61, 7.2, 1.1], [79, 6.6, 1.4], [93, 6.2, 1.2]].forEach(([x, y, r]) => { c.beginPath(); c.ellipse(glSX(x), glSY(y), r * u, r * 0.4 * u, 0, 0, 7); c.fill(); });
  c.lineJoin = 'round'; c.strokeStyle = 'rgba(70,51,137,.5)'; c.lineWidth = Math.max(4, 0.5 * u); top(0.35 * u); c.stroke();
  c.restore();
  c.lineJoin = 'round'; c.strokeStyle = GLC.crust; c.lineWidth = Math.max(2, 0.22 * u); top(0); c.stroke();
  /* glowing sugar crystals */
  GL_CRYS.forEach(([x, s], n) => { const y = glAt(g, x), col = n % 3 === 1 ? GLC.gem2 : n % 3 === 2 ? GLC.gem : '#ffffff'; c.save(); c.shadowColor = col; c.shadowBlur = 8; c.fillStyle = col;
    [-0.5, 0, 0.45].forEach((dx, i) => { const hh = (i === 1 ? 1.3 : 0.8) * s * u, ww = 0.3 * s * u, X = glSX(x + dx * s), Y = glSY(y) + 1; c.beginPath(); c.moveTo(X - ww, Y); c.lineTo(X, Y - hh); c.lineTo(X + ww, Y); c.closePath(); c.fill(); });
    c.restore(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1; c.beginPath(); c.moveTo(glSX(x) - 0.06 * s * u, glSY(y) - 1.1 * s * u); c.lineTo(glSX(x) - 0.16 * s * u, glSY(y) - 0.2 * s * u); c.stroke(); });
}
/* the boulder: a lumpy grey rock wedged against the Gumdrop's right landing leg */
function glDrawBoulder(c, x, y, rot, cracked) {
  const u = glU(), r = 1.3 * u, K = [1, 0.86, 1.05, 0.9, 1, 0.82, 0.96, 1.08]; c.save(); c.translate(glSX(x), glSY(y)); c.rotate(rot || 0); c.translate(0.05 * u, -0.62 * u);
  c.beginPath(); K.forEach((k, i) => { const a = i / K.length * Math.PI * 2 - 0.3, px = Math.cos(a) * r * k, py = Math.sin(a) * r * k * 0.7; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.closePath();
  const gr = c.createLinearGradient(-r, -r, r, r); gr.addColorStop(0, '#dcd8e6'); gr.addColorStop(1, '#5f5a73'); c.fillStyle = gr; c.fill(); c.strokeStyle = 'rgba(18,12,46,.6)'; c.lineWidth = 1.5; c.lineJoin = 'round'; c.stroke();
  c.strokeStyle = 'rgba(18,12,46,.3)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-r * 0.3, -r * 0.36); c.lineTo(r * 0.1, 0); c.lineTo(-r * 0.1, r * 0.36); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-r * 0.58, -r * 0.24); c.lineTo(-r * 0.22, -r * 0.46); c.stroke();
  if (cracked) { c.strokeStyle = '#2b2740'; c.lineWidth = 2; c.beginPath(); c.moveTo(-0.1 * u, -0.7 * u); c.lineTo(0.15 * u, 0); c.lineTo(-0.2 * u, 0.5 * u); c.stroke(); }
  c.restore();
}
/* the Gumdrop at real size (about 5 m across), with damage: scorch marks, cracks and a wobble */
function glDrawShip(c, s) {
  const u = glU(), sc = 0.045 * u, dmg = s.dmg || 0, wob = !RMOTION && s.shake ? Math.sin(performance.now() / 30) * 0.06 * u : 0;
  const lie = s.lie || 0, X = glSX(s.x) + wob, Y = glSY(s.y) - lie * 2.0 * u, tl = (s.tilt || 0) + lie * 1.5;   // lie 0 to 1: the Gumdrop tipped onto its side
  if (s.inside) drawGumdropInside(c, X, Y, sc, tl, s.mood || 'worried'); else drawGumdrop(c, X, Y, sc, tl);
  if (dmg > 0) { c.save(); c.translate(X, Y); c.rotate(tl); c.scale(sc, sc);
    c.fillStyle = 'rgba(40,24,20,.45)'; const nS = Math.min(4, Math.ceil(dmg / 25)); for (let i = 0; i < nS; i++) { c.beginPath(); c.ellipse([-30, 26, -12, 36][i], [-18, -30, -60, -10][i], 13, 7, [0.3, -0.5, 0.1, 0.8][i], 0, 7); c.fill(); }
    c.strokeStyle = '#3b1d2c'; c.lineWidth = 3; const nC = Math.min(3, Math.ceil(dmg / 34)); for (let i = 0; i < nC; i++) { const ox = [-18, 20, 0][i], oy = [-66, -54, -30][i]; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + 7, oy + 9); c.lineTo(ox + 2, oy + 16); c.lineTo(ox + 9, oy + 24); c.stroke(); }
    c.restore(); }
  /* dust behind the Gumdrop while it is dragged, and sparks where the hull scrapes rough ground */
  if ((s.scr === 'ground' || s.scr === 'platform') && !RMOTION) { const q = rng(Math.floor(performance.now() / 60) + 3), gx = glSX(s.x), gy = glSY(s.y);
    for (let i = 0; i < 9; i++) { c.globalAlpha = 0.2 + q() * 0.35; c.fillStyle = s.scr === 'ground' ? '#e9defc' : '#ffe9a8'; c.beginPath(); c.arc(gx - (2 + q() * 3.4) * u, gy - q() * 1.3 * u, (0.25 + q() * 0.5) * u, 0, 7); c.fill(); } c.globalAlpha = 1;
    if (s.scr === 'ground') { c.fillStyle = GLC.yellow; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(gx + (q() * 2.4 - 1.2) * u, gy - q() * 0.5 * u, Math.max(1.2, 0.12 * u), 0, 7); c.fill(); } } }
}
/* ---------- machines ---------- */
/* shared looks: a steel lattice post between two points, and a yellow-and-black hazard bar (the rescue and the Workshop lesson boards both use them) */
function glTruss(c, x0, y0, x1, y1, w, tint) {
  const lw = Math.max(2.2, w * 0.7), rail = (dx, col, k) => { c.strokeStyle = col; c.lineWidth = lw * k; c.beginPath(); c.moveTo(x0 + dx, y0); c.lineTo(x1 + dx, y1); c.stroke(); };
  c.save(); c.lineCap = 'round'; rail(-w, GLC.steelD, 1); rail(w, GLC.steelD, 1);
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / (w * 2.6))); c.strokeStyle = tint || GLC.steel2; c.lineWidth = Math.max(1, w * 0.3); c.beginPath();
  for (let i = 0; i < n; i++) { const f0 = i / n, f1 = (i + 1) / n, sd = i % 2 ? 1 : -1; c.moveTo(x0 + (x1 - x0) * f0 + sd * w, y0 + (y1 - y0) * f0); c.lineTo(x0 + (x1 - x0) * f1 - sd * w, y0 + (y1 - y0) * f1); } c.stroke();
  rail(-w, tint || GLC.steel, 0.42); rail(w, tint || GLC.steel, 0.42); c.restore();
}
function glHaz(c, x, y, w, h, bad) {
  c.save(); c.beginPath(); c.roundRect(x, y, w, h, Math.min(3, h / 3)); c.clip(); c.fillStyle = bad ? GLC.bad : GLC.yellow; c.fillRect(x, y, w, h); c.strokeStyle = bad ? '#7a1020' : GLC.dark; c.lineWidth = Math.max(2, h * 0.45); c.lineCap = 'butt';
  const st = Math.max(8, h * 1.7); for (let i = -h; i < w + h; i += st) { c.beginPath(); c.moveTo(x + i, y + h); c.lineTo(x + i + h, y); c.stroke(); } c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x, y, w, Math.max(1, h * 0.2)); c.restore();
}
function glCablePoint(p, m) {
  if (p.type === 'ramp') { const e = m ? m.end : { x: p.x1 + glRun(p), y: p.y1 + p.rise }; return { x: e.x + 0.6, y: e.y + 1.6 }; }
  if (p.type === 'crane') return { x: p.x, y: (m ? m.start.y : 0) + p.rise + 2.6 };
  if (p.type === 'lever') return { x: p.x + (p.dir || 1) * GL.beam, y: (m ? m.start.y : 0) + 1.1 };
  if (p.type === 'block' || p.type === 'winch') return { x: p.x, y: p.y };
  return null;
}
function glDrawRamp(c, p, m, bad, ground) {
  const u = glU(), us = u * (p.s || 1), a = m.start, b = m.end, ang = Math.atan2(b.y - a.y, b.x - a.x);
  /* support legs down to whatever is below the deck */
  c.lineCap = 'butt';
  for (let d = 3; d < p.L - 1; d += 4) { const x = a.x + Math.cos(ang) * d, y = a.y + Math.sin(ang) * d, gy = glAt(ground, x); if (y - gy > 0.4) { c.strokeStyle = GLC.steelD; c.lineWidth = Math.max(3, 0.26 * us); c.beginPath(); c.moveTo(glSX(x), glSY(y)); c.lineTo(glSX(x), glSY(gy)); c.stroke(); c.strokeStyle = GLC.steel2; c.lineWidth = Math.max(1.2, 0.1 * us); c.stroke(); } }
  /* the deck: a steel beam with a row of yellow rollers (rollers, so no friction) */
  c.save(); c.translate(glSX(a.x), glSY(a.y)); c.rotate(-ang); const L = p.L * u, th = Math.max(5, 0.42 * us);
  c.fillStyle = bad ? '#7a1020' : GLC.dark; c.beginPath(); c.roundRect(-1.5, -th - 1.5, L + 3, th + 3, th / 2); c.fill();
  c.fillStyle = bad ? GLC.bad : GLC.steel2; c.beginPath(); c.roundRect(0, -th, L, th, th / 3); c.fill();
  c.fillStyle = bad ? '#ffb0b0' : GLC.steel; c.fillRect(th / 3, -th, Math.max(0, L - th * 2 / 3), Math.max(1.5, th * 0.26));
  c.fillStyle = bad ? '#7a1020' : GLC.yellow; const stp = Math.max(0.9, 8 / u); for (let d = stp * 0.6; d < p.L - 0.2; d += stp) { c.beginPath(); c.arc(d * u, -th * 0.4, Math.max(1.3, th * 0.22), 0, 7); c.fill(); }
  c.restore();
  [[a.x, a.y + 0.2], [b.x, b.y + 0.3]].forEach(([x, y]) => { const r = Math.max(3, 0.35 * us); c.fillStyle = GLC.dark; c.beginPath(); c.arc(glSX(x), glSY(y), r + 1.5, 0, 7); c.fill(); c.fillStyle = bad ? GLC.bad : GLC.yellow; c.beginPath(); c.arc(glSX(x), glSY(y), r, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(glSX(x), glSY(y), r * 0.35, 0, 7); c.fill(); });
}
function glDrawCrane(c, p, m, bad, hookY, trolX) {
  const sc = p.s || 1, u = glU() * sc, by = m.start.y, top = by + p.rise + 2.6 * sc, x = p.x;
  /* the gantry stands at x; with Move across its span grows to cover the set-down spot too (m.legL and m.legR, set in glMachine) */
  const legs = m.legL ? [{ bx: m.legL.x, by: m.legL.y, tx: m.legL.x + 0.6, sd: 1 }, { bx: m.legR.x, by: m.legR.y, tx: m.legR.x - 0.6, sd: -1 }]
    : [-1, 1].map(sd => ({ bx: x + sd * 3.2 * sc, by, tx: x + sd * 2.6 * sc, sd: -sd }));
  legs.forEach(L => { glTruss(c, glSX(L.bx), glSY(L.by), glSX(L.tx), glSY(top), Math.max(2.4, 0.26 * u), bad ? '#ffb0b0' : null); c.fillStyle = GLC.dark; c.beginPath(); c.roundRect(glSX(L.bx) - 0.6 * u, glSY(L.by) - 0.3 * u, 1.2 * u, 0.3 * u, 2); c.fill(); });
  const bl = legs[0].bx, br = legs[1].bx, X0 = glSX(Math.min(bl, br)) - 0.5 * u, X1 = glSX(Math.max(bl, br)) + 0.5 * u, bh = Math.max(5, 0.5 * u), Yt = glSY(top);
  c.fillStyle = GLC.dark; c.beginPath(); c.roundRect(X0 - 1.5, Yt - bh / 2 - 1.5, X1 - X0 + 3, bh + 3, 3); c.fill(); glHaz(c, X0, Yt - bh / 2, X1 - X0, bh, bad);
  const tx = trolX == null ? x : trolX, hy = hookY == null ? by + 4.2 * sc : hookY;
  { const tw = Math.max(9, 1.1 * u), thh = Math.max(5, 0.55 * u), TX = glSX(tx); c.fillStyle = GLC.dark; c.beginPath(); c.roundRect(TX - tw / 2, Yt + bh / 2 - 1, tw, thh, 2.5); c.fill(); c.fillStyle = GLC.steel; [-1, 1].forEach(sd => { c.beginPath(); c.arc(TX + sd * tw * 0.28, Yt + bh / 2, Math.max(1.4, 0.13 * u), 0, 7); c.fill(); }); }   // the trolley under the top beam
  c.lineCap = 'round'; c.strokeStyle = GLC.ropeD; c.lineWidth = Math.max(2.4, 0.17 * u); c.beginPath(); c.moveTo(glSX(tx), Yt + bh / 2); c.lineTo(glSX(tx), glSY(hy)); c.stroke(); c.strokeStyle = GLC.rope; c.lineWidth = Math.max(1.2, 0.085 * u); c.stroke();
  c.strokeStyle = GLC.dark; c.lineWidth = Math.max(3.5, 0.26 * u); c.beginPath(); c.arc(glSX(tx), glSY(hy) + 0.25 * u, 0.3 * u, Math.PI * 1.1, Math.PI * 2.4); c.stroke(); c.strokeStyle = GLC.steel; c.lineWidth = Math.max(2, 0.14 * u); c.stroke();
}
/* where a crane's trolley sets the load down (Tom, 11 Nov 2026: "Cranes should lower until it sets on a surface. It can lift, it should be able to put down too."):
   straight below the trolley, on the highest thing at or below the lifted height: a platform top, else the ground. Only something taller than the lift blocks it. Same rule as gpCraneLeg. */
function glSetSpot(p, m, g, plats) {
  const liftY = m.start.y + p.rise, x = Math.max(0, Math.min(GL.W, p.x + (p.across || 0))), gy = glAt(g, x);
  const tops = (plats || []).filter(q => x >= q.x0 - 0.05 && x <= q.x1 + 0.05).map(q => q.top).concat([gy]).filter(y => y <= liftY + 0.05).sort((a, b) => b - a);
  return tops.length ? { x, y: tops[0], liftY } : { x, y: gy, liftY, blocked: true };
}
/* "Sets down here": the spot, and a dotted line down from the trolley to show the load being lowered (red only when something taller than the lift is in the way) */
function glDrawSetDown(c, sp, t) {
  const u = glU(), pulse = RMOTION ? 0.5 : 0.5 + 0.5 * Math.sin(t * 5), bad = !!sp.blocked, X = glSX(sp.x), Y = glSY(sp.y), col = bad ? '255,120,110' : '126,240,168';
  if (!bad && sp.liftY - sp.y > 0.3) { c.save(); c.setLineDash([3, 5]); c.strokeStyle = `rgba(${col},.8)`; c.lineWidth = 2; c.beginPath(); c.moveTo(X, glSY(sp.liftY)); c.lineTo(X, Y - 0.3 * u); c.stroke(); c.setLineDash([]);
    c.fillStyle = `rgba(${col},.9)`; c.beginPath(); c.moveTo(X - 5, Y - 0.3 * u - 8); c.lineTo(X + 5, Y - 0.3 * u - 8); c.lineTo(X, Y - 0.3 * u); c.closePath(); c.fill(); c.restore(); }
  c.save(); c.shadowColor = bad ? '#ff7a70' : GLC.glow; c.shadowBlur = 8 + 12 * pulse; c.strokeStyle = `rgba(${col},${0.6 + 0.4 * pulse})`; c.lineWidth = 3; c.setLineDash([6, 4]);
  c.beginPath(); c.ellipse(X, Y - 0.2 * u, 2.7 * u, 0.9 * u, 0, 0, 7); c.stroke(); c.restore();
  c.fillStyle = `rgba(${col},${0.14 + 0.1 * pulse})`; c.beginPath(); c.ellipse(X, Y - 0.2 * u, 2.7 * u, 0.9 * u, 0, 0, 7); c.fill();
  lblAdd(bad ? 'Too tall to carry over' : 'Sets down here', X, Y - 2.2 * u, { size: 12, col: bad ? '#fff' : '#c9ffdc', bg: bad ? '#c0392b' : 'rgba(31,29,38,.75)', prio: 2 });
}
function glDrawLever(c, p, m, bad, tiltT, ground) {
  /* the same drawing as the Workshop bench lever (drawLeverShape in 4n): a bar on a triangle fulcrum. The load end rises by `rise` as tiltT goes 0 → 1.
     A real 1 : 9 lever would sink its pulling end several metres into the crater, so the pulling end dips at most 0.7 m and the fulcrum triangle grows to keep the bar resting on it.
     On the crater (ground given) a short rope and handle hang from the pulling end. */
  const u = glU(), d = p.dir || 1, by = m.start.y, fx = p.x + d * p.arm, ex = p.x + d * GL.beam, k = tiltT || 0;
  const ly = by + 0.9 + k * p.rise, ey = by + 0.9 - Math.min(0.7, k * p.rise * (GL.beam - p.arm) / p.arm), fy = ly + (ey - ly) * (p.arm / GL.beam);
  drawLeverShape(c, { a: { x: glSX(p.x), y: glSY(ly) }, b: { x: glSX(ex), y: glSY(ey) }, fx: glSX(fx), fy: glSY(fy), floor: glSY(by), thick: Math.max(4, 0.32 * u), bad, pull: ground ? Math.max(10, 0.75 * u) : 0 });
}
function glDrawJack(c, p, m, bad, k) {
  const sc = p.s || 1, u = glU() * sc, by = m.start.y, hgt = (0.7 + (k || 0) * p.rise * (p.vis || 1)) * sc, gp = (p.gap || 0.22) * sc; c.fillStyle = bad ? GLC.bad : GLC.dark; c.beginPath(); c.roundRect(glSX(p.x) - 0.7 * u, glSY(by + 0.35 * sc), 1.4 * u, 0.35 * u, 3); c.fill();
  c.lineCap = 'butt'; c.strokeStyle = GLC.steelD; c.lineWidth = Math.max(4.5, 0.36 * u); c.beginPath(); c.moveTo(glSX(p.x), glSY(by + 0.35 * sc)); c.lineTo(glSX(p.x), glSY(by + hgt)); c.stroke(); c.strokeStyle = GLC.steel2; c.lineWidth = Math.max(3, 0.26 * u); c.stroke();
  c.strokeStyle = GLC.dark; c.lineWidth = Math.max(1.2, 0.07 * u); for (let y = by + 0.45 * sc; y < by + hgt; y += gp) { c.beginPath(); c.moveTo(glSX(p.x) - 0.16 * u, glSY(y)); c.lineTo(glSX(p.x) + 0.16 * u, glSY(y + 0.1 * sc)); c.stroke(); }
  c.fillStyle = GLC.dark; c.beginPath(); c.roundRect(glSX(p.x) - 0.55 * u - 1, glSY(by + hgt + 0.12 * sc) - 1, 1.1 * u + 2, 0.16 * u + 2, 2); c.fill(); c.fillStyle = GLC.yellow; c.fillRect(glSX(p.x) - 0.55 * u, glSY(by + hgt + 0.12 * sc), 1.1 * u, 0.16 * u);
}
function glDrawPlatform(c, pl, over) {
  const u = glU() * (pl.s || 1), x0 = glSX(pl.x0), x1 = glSX(pl.x1), yT = glSY(pl.top), yB = glSY(pl.base - 0.2), w = Math.max(2, 0.2 * u), ins = Math.min((x1 - x0) * 0.2, w + 4), th = Math.max(5, 0.36 * u), tint = over ? '#ffb0b0' : null;
  if (yB - yT > 3 * w && x1 - x0 > 8 * w) { c.strokeStyle = GLC.steelD; c.lineWidth = Math.max(1.2, 0.1 * u); c.beginPath(); c.moveTo(x0 + ins, yB - 2); c.lineTo(x1 - ins, yT + th); c.moveTo(x1 - ins, yB - 2); c.lineTo(x0 + ins, yT + th); c.stroke(); }
  glTruss(c, x0 + ins, yB, x0 + ins, yT + th / 2, w, tint); glTruss(c, x1 - ins, yB, x1 - ins, yT + th / 2, w, tint);
  c.fillStyle = GLC.dark; c.beginPath(); c.roundRect(x0 - 1.5, yT - 1.5, x1 - x0 + 3, th + 3, 3); c.fill(); glHaz(c, x0, yT, x1 - x0, th, over);
}
function glDrawBlock(c, p, bad) {
  const u = glU() * (p.s || 1), r = Math.max(7, 0.5 * u), X = glSX(p.x), Y = glSY(p.y);
  c.fillStyle = GLC.dark; c.beginPath(); c.roundRect(X - r * 0.95, Y - r * 1.45, r * 1.9, r * 2.6, r * 0.45); c.fill();
  c.fillStyle = bad ? GLC.bad : GLC.yellow; c.beginPath(); c.roundRect(X - r * 0.72, Y - r * 1.22, r * 1.44, r * 2.14, r * 0.32); c.fill();
  c.fillStyle = GLC.dark; c.beginPath(); c.arc(X, Y - r * 0.1, r * 0.6, 0, 7); c.fill(); c.fillStyle = GLC.steel; c.beginPath(); c.arc(X, Y - r * 0.1, r * 0.42, 0, 7); c.fill(); c.fillStyle = GLC.dark; c.beginPath(); c.arc(X, Y - r * 0.1, r * 0.14, 0, 7); c.fill();
  c.strokeStyle = GLC.steel2; c.lineWidth = Math.max(1.6, r * 0.2); c.lineCap = 'round'; c.beginPath(); c.arc(X, Y + r * 1.4, r * 0.3, 0.3, Math.PI * 1.3); c.stroke();
}
function glDrawWinch(c, p, bad, spin) {
  const u = glU() * (p.s || 1), r = Math.max(8, 0.55 * u), X = glSX(p.x), Y = glSY(p.y), cl = p.crank || 1.5;
  c.fillStyle = bad ? GLC.bad : GLC.dark; c.beginPath(); c.roundRect(X - r * 1.25, Y + r * 0.6, r * 2.5, r * 0.5, 3); c.fill(); c.fillStyle = GLC.steelD; c.fillRect(X - r * 0.5, Y, r, r * 0.7);
  c.fillStyle = GLC.dark; c.beginPath(); c.arc(X, Y, r * 1.02, 0, 7); c.fill(); c.fillStyle = bad ? GLC.bad : GLC.yellow; c.beginPath(); c.arc(X, Y, r * 0.84, 0, 7); c.fill();
  const a = spin || 0; c.strokeStyle = GLC.yellowD; c.lineWidth = Math.max(1.2, r * 0.13); c.lineCap = 'butt'; for (let i = 0; i < 4; i++) { const b = a + i * Math.PI / 4; c.beginPath(); c.moveTo(X - Math.cos(b) * r * 0.8, Y - Math.sin(b) * r * 0.8); c.lineTo(X + Math.cos(b) * r * 0.8, Y + Math.sin(b) * r * 0.8); c.stroke(); }
  c.fillStyle = GLC.dark; c.beginPath(); c.arc(X, Y, r * 0.3, 0, 7); c.fill();
  c.lineCap = 'round'; c.strokeStyle = GLC.dark; c.lineWidth = Math.max(3.4, 0.22 * u); c.beginPath(); c.moveTo(X, Y); c.lineTo(X + Math.cos(a) * r * cl, Y + Math.sin(a) * r * cl); c.stroke(); c.strokeStyle = GLC.steel; c.lineWidth = Math.max(2, 0.12 * u); c.stroke();
  c.fillStyle = GLC.dark; c.beginPath(); c.arc(X + Math.cos(a) * r * cl, Y + Math.sin(a) * r * cl, r * 0.36, 0, 7); c.fill(); c.fillStyle = '#ff5a5a'; c.beginPath(); c.arc(X + Math.cos(a) * r * cl, Y + Math.sin(a) * r * cl, r * 0.26, 0, 7); c.fill();
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
  c.lineCap = 'round'; c.beginPath(); c.moveTo(glSX(a.x), glSY(a.y)); c.quadraticCurveTo(glSX(mx), glSY(my), glSX(b.x), glSY(b.y)); c.strokeStyle = GLC.ropeD; c.lineWidth = Math.max(2.4, 0.17 * u); c.stroke(); c.strokeStyle = GLC.rope; c.lineWidth = Math.max(1.2, 0.085 * u); c.stroke();
}
/* a glowing spot: the Part 4 practice board still uses it to show where to drop a piece (Part 5 has no box) */
function glDrawZone(c, z, t, label) {
  const u = glU(), pulse = RMOTION ? 0.5 : 0.5 + 0.5 * Math.sin(t * 4), X0 = glSX(z.x - GL.hzX), X1 = glSX(z.x + GL.hzX), Y0 = glSY(z.y + GL.hzY), Y1 = glSY(z.y - GL.hzY);
  c.save(); c.shadowColor = GLC.glow; c.shadowBlur = 8 + 10 * pulse; c.strokeStyle = `rgba(126,240,168,${0.55 + 0.4 * pulse})`; c.lineWidth = 2.5; c.setLineDash([6, 4]);
  c.beginPath(); c.roundRect(X0, Y0, X1 - X0, Math.max(6, Y1 - Y0), 6); c.stroke(); c.restore();
  c.fillStyle = `rgba(126,240,168,${0.12 + 0.1 * pulse})`; c.beginPath(); c.roundRect(X0, Y0, X1 - X0, Math.max(6, Y1 - Y0), 6); c.fill();
  if (label) glLbl(c, label, (X0 + X1) / 2, glSY(z.y + 5.4), '#c9ffdc', 11, 'center', 'rgba(31,29,38,.6)');
}
/* ghost Gumdrops: where the Gumdrop starts each leg after the first, plus where it waits now (the model keeps that spot in ev.ghost, as the old model did in ghosts) */
function glGhostList(ev) { const out = ((ev && ev.ghosts) || []).slice(), g = ev && ev.ghost; if (g && ev.stop && ev.stop.leg >= 1 && !out.some(q => Math.hypot(q.x - g.x, q.y - g.y) < 2.5)) out.push({ x: g.x, y: g.y, after: ev.stop.leg }); out.forEach(q => { const pl = ev.legs && ev.legs[q.after - 1]; q.lying = !!(pl && pl.lying); }); return out; }
/* the route of each leg, straight from the model's own path: coloured by what the Gumdrop is doing, and the wall marked where a leg is stopped by one */
const GL_ROUTE = { nudge: '#c9ffdc', ground: '#ff8f6b', platform: '#ffd27a', ramp: '#7ef0a8', lift: '#8fd3ff', across: '#8fd3ff', lower: '#8fd3ff', slide: '#ffd27a', fall: '#ff5d5d' };
function glDrawRoutes(c, ev) {
  if (!ev || !ev.legs) return; const u = glU();
  ev.legs.forEach(l => { if (!l.path || !l.path.length || !l.start) return; let px = l.start.x, py = l.start.y, cur = null; const runs = [];
    l.path.forEach(q => { if (!cur || cur.k !== q.k) { cur = { k: q.k, pts: [[px, py]] }; runs.push(cur); } cur.pts.push([q.x, q.y]); px = q.x; py = q.y; });
    c.save(); c.lineWidth = Math.max(3, 0.3 * u); c.lineCap = 'round'; c.lineJoin = 'round';
    runs.forEach(r => { c.strokeStyle = GL_ROUTE[r.k] || '#fff'; c.setLineDash(r.k === 'fall' ? [4, 4] : []); c.beginPath(); r.pts.forEach(([x, y], i) => i ? c.lineTo(glSX(x), glSY(y) - 3) : c.moveTo(glSX(x), glSY(y) - 3)); c.stroke(); });
    c.restore(); const e = l.path[l.path.length - 1]; c.fillStyle = '#fffaf2'; c.strokeStyle = GLC.ink; c.lineWidth = 2; c.beginPath(); c.arc(glSX(e.x), glSY(e.y) - 3, 4.5, 0, 7); c.fill(); c.stroke();
  });
  const st = ev.stop; if (st && st.why === 'wall' && st.wall) { const X = glSX(st.wall.x), Y1 = glSY(st.wall.y), Y0 = glSY(st.wall.y - 1.6);
    c.save(); c.strokeStyle = '#ff5d5d'; c.lineWidth = Math.max(5, 0.45 * u); c.lineCap = 'round'; c.beginPath(); c.moveTo(X, Y0); c.lineTo(X, Y1 - 4); c.stroke(); c.restore();
    lblAdd('A wall: too tall to drag over', X, Y1 - 22, { size: 11, col: '#fff', bg: '#c0392b', prio: 1 }); }
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
  const fp = o.flashPlat && glPlatforms({ parts: [Object.assign({ id: '_f' }, o.flashPlat, { type: 'platform' })] }, g)[0]; if (fp) { glDrawPlatform(c, fp, true); lblAdd(GL_PLATMSG, glSX((fp.x0 + fp.x1) / 2), glSY(fp.top) - 22, { col: '#fff', bg: '#c0392b', prio: 0, nofade: true }); }
  const ms = {}; rig.parts.filter(p => GL_LIFT[p.type]).forEach(p => { ms[p.id] = glMachine(p, g, P0); });
  rig.parts.filter(p => p.type === 'dyn' && !(run.blown && run.blown.has(p.id))).forEach(p => glDrawDyn(c, p, o.ghost || g, !run.on));
  const faulty = id => { const m = ms[id]; if (!m) return false; const leg = ev && ev.legs.find(l => l.id === id), pp = byId[id]; return (leg ? leg.faults.length : m.faults.filter(f => !(pp && pp.role === 'boulder' && f === 'drop')).length) > 0; };
  /* the boulder in two legs (Tom, 11 Nov 2026): leg 1 pries it up and holds it 0.5 m off the landing leg; leg 2's crane carries it away and sets it down where the ghost boulder shows */
  const bo = !run.on && ev && ev.boulder && ev.boulder.how !== 'blast' ? ev.boulder : null, held = !!(bo && bo.pry && bo.pry.ok && o.rock !== false), heldY = held ? bo.pry.lift : 0, bcr = rig.parts.find(p => p.type === 'crane' && p.role === 'boulder');
  rig.parts.filter(p => p.type === 'ramp').forEach(p => glDrawRamp(c, p, ms[p.id], faulty(p.id), g));
  /* the boulder and the ship sit behind the lifting machines' front parts */
  const rockShown = o.rock !== false && !(run.rockGone);
  const rockFront = run.rockX != null && run.rockX < GL.shipX + 1;   // a boulder set down beside the Gumdrop's other leg is drawn in front of it, so it can be seen
  const drawRock = () => glDrawBoulder(c, run.rockX != null ? run.rockX : 18.7, run.rockY != null ? run.rockY : glAt(g, 18.7) + heldY, run.rockRot || 0.12, false);
  if (rockShown && !(o.ship && o.ship.carryRock) && !rockFront) drawRock();
  if (run.rope && o.ship) glDrawCable(c, run.rope.a, run.rope.b, 0);
  if (o.ship) { glDrawShip(c, o.ship); if (rockShown && !(o.ship.carryRock) && rockFront) drawRock();
    if (bo && bo.stage === 'clear' && bo.move && rockShown) { c.save(); c.globalAlpha = 0.55; glDrawBoulder(c, bo.move.to.x, bo.move.to.y, 0.3, false); c.restore(); }   // the ghost boulder: where leg 2 sets it down
    if (o.ship.carryRock && rockShown) glDrawBoulder(c, o.ship.x + 4.6 * Math.cos(o.ship.tilt || 0), o.ship.y - 4.6 * Math.sin(o.ship.tilt || 0), (o.ship.tilt || 0) + 0.12); }
  if (!o.ship && rockShown && rockFront) drawRock();
  rig.parts.filter(p => p.type === 'crane').forEach(p => glDrawCrane(c, p, ms[p.id], faulty(p.id), run.hook && run.hook[p.id] != null ? run.hook[p.id] : (p.role === 'boulder' && held ? glAt(g, 18.7) + 1.0 + heldY : undefined), run.trol && run.trol[p.id]));
  if (!run.on && o.setdown !== false) rig.parts.filter(p => p.type === 'crane' && p.across).forEach(p => glDrawSetDown(c, glSetSpot(p, ms[p.id], g, p.role === 'boulder' ? [] : plats), t));
  const holdK = p => run.tilt && run.tilt[p.id] != null ? run.tilt[p.id] : p.role === 'boulder' && held ? heldY / Math.max(0.1, p.rise || 1) : undefined;
  rig.parts.filter(p => p.type === 'lever').forEach(p => glDrawLever(c, p, ms[p.id], faulty(p.id), holdK(p), g));
  rig.parts.filter(p => p.type === 'jack').forEach(p => glDrawJack(c, p, ms[p.id], faulty(p.id), holdK(p)));
  /* cables, then the add-ons on top */
  const cp = id => { if (id === 'boulder') return { x: 18.9, y: glAt(g, 18.7) + 1.0 }; const p = byId[id]; return p ? glCablePoint(p, ms[id]) : null; };
  (rig.cables || []).forEach(cb => {
    if (cb.a === 'ship' || cb.b === 'ship') { if (run.on) return; const oth = cb.a === 'ship' ? cb.b : cb.a, P = cp(oth); if (!P) return; const S = glShipSpot(ev, oth, g); glDrawCable(c, { x: S.x, y: S.y + GL_HOOK }, P, 0.4); return; }
    const a = cp(cb.a), b = cp(cb.b); if (a && b) glDrawCable(c, a, b); });
  if (o.cableDrag) glDrawCable(c, o.cableDrag.a, o.cableDrag.b, 0);
  rig.parts.filter(p => p.type === 'block').forEach(p => glDrawBlock(c, p));
  rig.parts.filter(p => p.type === 'winch').forEach(p => glDrawWinch(c, p, false, run.spin));
  if (o.smoo) drawSmooshy(c, glSX(o.smoo.x), glSY(o.smoo.y + 1.5), 0.026 * glU(), o.smoo.mood, t);
  if (o.routes && !run.on) glDrawRoutes(c, ev);
  /* selection ring and cable dots */
  if (o.sel && byId[o.sel]) { const b = glBounds(byId[o.sel], ms[o.sel], g, plats); c.strokeStyle = '#ffe28a'; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath(); c.roundRect(glSX(b.x0) - 6, glSY(b.y1) - 6, (b.x1 - b.x0) * glU() + 12, (b.y1 - b.y0) * glU() + 12, 8); c.stroke(); c.setLineDash([]); }
  if (!run.on) rig.parts.filter(p => p.type === 'ramp').forEach(p => { const e = ms[p.id].end; lblAvoid(glSX(e.x), glSY(e.y), 14); c.fillStyle = '#fffaf2'; c.strokeStyle = GLC.ink; c.lineWidth = 2; c.beginPath(); c.arc(glSX(e.x), glSY(e.y), 7, 0, 7); c.fill(); c.stroke(); });
  if (!run.on) rig.parts.forEach(p => { const q = glCablePoint(p, ms[p.id]); if (!q) return; lblAvoid(glSX(q.x), glSY(q.y), 12); drawHookDot(c, glSX(q.x), glSY(q.y), { glow: o.hookGlow && GL_ROPED[p.type] }); });
  /* every load wears a hook: the Gumdrop, the ghost Gumdrop waiting for the next machine, and the boulder */
  if (!run.on && o.ship) {
    const hk = (sp, ghost) => { const X = glSX(sp.x), Y = glSY(sp.y + GL_HOOK); c.strokeStyle = GLC.rope; c.lineWidth = Math.max(1.5, 0.1 * u0); c.beginPath(); c.moveTo(X, glSY(sp.y + 4.5)); c.lineTo(X, Y); c.stroke(); drawHookDot(c, X, Y, { glow: o.hookGlow }); lblAvoid(X, Y, 12); };
    var u0 = glU();
    glGhostList(ev).forEach(gh => { const sc = 0.045 * u0; c.save(); c.globalAlpha = 0.5; drawGumdrop(c, glSX(gh.x), glSY(gh.y) - (gh.lying ? 2.0 * u0 : 0), sc, gh.lying ? 1.5 : 0); c.restore();
      c.setLineDash([4, 4]); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(glSX(gh.x), glSY(gh.y + 2.2), 3.2 * u0, 2.6 * u0, 0, 0, 7); c.stroke(); c.setLineDash([]); hk(gh, true); });
    hk(o.ship);
  }
  if (!run.on && o.rock !== false && bcr) { const b = { x: GL.boulderX - 0.1, y: glAt(g, 18.7) + 1.0 + heldY }; drawHookDot(c, glSX(b.x), glSY(b.y), { roped: held }); lblAvoid(glSX(b.x), glSY(b.y), 12); }   // the boulder's ◉: the crane hooks on by itself
  if (o.clipGlow && !run.on) o.clipGlow.forEach(sp => { const X = glSX(sp.x), Y = glSY(sp.y); drawHookDot(c, X, Y, { glow: true, r: 10 }); lblAvoid(X, Y, 14); lblAdd('clips on here', X, Y - 20, { size: 11, col: '#c9ffdc', bg: 'rgba(31,29,38,.82)', prio: 2, nofade: true }); });
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
    else lblAdd('Boulder 252 N', glSX(GL.boulderX + 1.8), glSY(by + 2.9), { size: sz, prio: 3, tx: glSX(GL.boulderX), ty: glSY(by + 0.9) });
    const bo = ev && ev.boulder; if (bo && bo.pry && bo.pry.ok && bo.how !== 'blast' && !o.dropGlow) lblAdd('Held up', glSX(GL.boulderX + 1.8), glSY(by + 4.4), { size: sz, col: '#c9ffdc', bg: 'rgba(31,29,38,.78)', prio: 3, tx: glSX(GL.boulderX), ty: glSY(by + 1.6) }); }
  { const bo = ev && ev.boulder; if (bo && bo.stage === 'clear' && bo.how === 'crane' && bo.move && o.rock !== false) lblAdd('Boulder after leg 2', glSX(bo.move.to.x), glSY(bo.move.to.y + 3.1), { size: sz, col: '#c9ffdc', bg: 'rgba(31,29,38,.78)', prio: 3, tx: glSX(bo.move.to.x), ty: glSY(bo.move.to.y + 1.2) }); }
  lblAdd('Tractor beam reaches this line', glSX(58), glSY(crest), { size: sz, col: '#c9ffdc', bg: 'rgba(31,29,38,.72)', prio: 1 });   // on the dotted line (Tom, 9 Nov 2026): the goal is only to get the Gumdrop up to here
  if (o.ship && !o.ship.hideLabel) lblAdd('Gumdrop 6,300 N', glSX(o.ship.x), glSY(o.ship.y + 8.0), { size: sz, prio: 4, tx: glSX(o.ship.x), ty: glSY(o.ship.y + 4.5) });
  if (o.ship && ev) glGhostList(ev).forEach(gh => lblAdd(`Gumdrop after leg ${gh.after}`, glSX(gh.x), glSY(gh.y + 8.0), { size: sz, col: '#c9ffdc', prio: 4, tx: glSX(gh.x), ty: glSY(gh.y + 4.5) }));
}
/* where the Gumdrop is for a machine or add-on: at the start of the leg it belongs to, else waiting as the ghost (or still at the start) */
function glShipSpot(ev, id, g) {
  if (ev && ev.legs) { const l = ev.legs.find(q => q.id === id || (q.addons || []).includes(id)); if (l && l.at) return l.at; if (ev.ghost) return ev.ghost; if (ev.ship0) return ev.ship0; }
  return { x: GL.shipX, y: glAt(g || glBaseGround(), GL.shipX) };
}
/* a part's box in world metres, for hit tests and the selection ring */
function glBounds(p, m, g, plats) {
  if (p.type === 'ramp') { const a = m.start, b = m.end; return { x0: Math.min(a.x, b.x) - 0.3, x1: Math.max(a.x, b.x) + 0.3, y0: Math.min(a.y, b.y) - 0.4, y1: Math.max(a.y, b.y) + 0.6 }; }
  if (p.type === 'crane') return { x0: Math.min(p.x, p.x + (p.across || 0)) - 3.4, x1: Math.max(p.x, p.x + (p.across || 0)) + 3.4, y0: m.start.y, y1: m.start.y + p.rise + 2.8 };
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
