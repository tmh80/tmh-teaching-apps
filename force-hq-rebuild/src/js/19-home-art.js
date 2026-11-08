/* ===== Home illustration: the Force HQ arena complex (1030 × 420 logical px; HOME_W) =====
   Flat, outline-free shapes with simple two-tone shading; light comes from the upper left.
   The picture uses its own fixed daytime palette in both themes, because it sits in the dark hero card. */
const HOME_W = 1030;
function drawHomeArt(c, hit) {
  const W = HOME_W, H = 420, R = rng(11);
  const E = (x, y, rx, ry, a0 = 0, a1 = Math.PI * 2) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, a0, a1); };
  const F = (col, a = 1) => { c.globalAlpha = a; c.fillStyle = col; c.fill(); c.globalAlpha = 1; };
  const lin = (x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
  const poly = (pts) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); };

  /* sky, sun and clouds */
  c.fillStyle = lin(0, 0, 0, 250, [[0, '#8ccbed'], [.65, '#cbe8f4'], [1, '#e9f5f2']]); c.fillRect(0, 0, W, H);
  const sg = c.createRadialGradient(170, 70, 6, 170, 70, 120); sg.addColorStop(0, 'rgba(255,248,214,1)'); sg.addColorStop(.18, 'rgba(255,240,190,.9)'); sg.addColorStop(.45, 'rgba(255,236,180,.28)'); sg.addColorStop(1, 'rgba(255,236,180,0)');
  c.fillStyle = sg; c.fillRect(40, 0, 260, 200);
  const cloud = (x, y, k) => { c.fillStyle = 'rgba(255,255,255,.95)'; E(x, y, 30 * k, 11 * k); c.fill(); E(x - 20 * k, y + 3 * k, 18 * k, 8 * k); c.fill(); E(x + 22 * k, y + 2 * k, 20 * k, 9 * k); c.fill(); E(x + 2 * k, y - 8 * k, 16 * k, 11 * k); c.fill(); c.fillStyle = 'rgba(160,190,210,.25)'; E(x, y + 7 * k, 40 * k, 4 * k); c.fill(); };
  cloud(330, 52, 1.1); cloud(560, 34, .8); cloud(820, 70, 1); cloud(965, 40, .7); cloud(470, 96, .6);

  /* mountains: far, then near with snow caps on the left */
  c.fillStyle = '#b8d2e1'; poly([[0, 205], [70, 128], [130, 168], [210, 110], [300, 178], [390, 140], [470, 185], [560, 150], [650, 190], [740, 135], [830, 175], [900, 150], [960, 120], [1030, 165], [1030, 250], [0, 250]]); c.fill();
  c.fillStyle = '#a2c1d3'; poly([[0, 230], [60, 170], [120, 205], [190, 150], [260, 212], [330, 196], [420, 222], [1030, 222], [1030, 250], [0, 250]]); c.fill();
  c.fillStyle = '#f7fbfd'; for (const [x, y, w] of [[60, 170, 18], [190, 150, 22], [210, 110, 16], [70, 128, 12]]) { poly([[x, y], [x - w, y + w * .9], [x - w * .4, y + w * .65], [x, y + w * .9], [x + w * .45, y + w * .6], [x + w, y + w * .9]]); c.fill(); }

  /* ground: lawn, then the plaza and paths */
  c.fillStyle = lin(0, 228, 0, H, [[0, '#b9dca1'], [.5, '#a6d08b'], [1, '#93c27a']]); poly([[0, 238], [180, 226], [420, 232], [650, 224], [1030, 232], [1030, H], [0, H]]); c.fill();
  c.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 70; i++) { const x = R() * W, y = 250 + R() * 160; c.fillRect(x, y, 2, 1); }
  c.fillStyle = '#ece3cf'; E(430, 372, 360, 58); c.fill();
  c.fillStyle = '#e0d5bd'; E(430, 378, 330, 46); c.fill();
  c.strokeStyle = 'rgba(160,140,100,.25)'; c.lineWidth = 1; for (let k = 1; k < 6; k++) { E(430, 378, 330 * k / 6, 46 * k / 6); c.stroke(); }
  c.strokeStyle = '#ece3cf'; c.lineCap = 'round';
  for (const [x1, y1, cx1, cy1, x2, y2, w] of [[190, 372, 110, 350, 104, 290, 12]]) { c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo(cx1, cy1, x2, y2); c.stroke(); }

  /* trees */
  const pine = (x, y, k, snow) => { c.fillStyle = '#6b4e33'; c.fillRect(x - 2 * k, y - 6 * k, 4 * k, 8 * k); for (let i = 0; i < 3; i++) { const yy = y - 6 * k - i * 9 * k, w = (13 - i * 3) * k; c.fillStyle = i % 2 ? '#2f6b5a' : '#3a7d69'; poly([[x, yy - 15 * k], [x - w, yy], [x + w, yy]]); c.fill(); c.fillStyle = 'rgba(0,0,0,.12)'; poly([[x, yy - 15 * k], [x + w, yy], [x, yy]]); c.fill(); if (snow) { c.fillStyle = '#fbfdff'; poly([[x, yy - 15 * k], [x - w * .35, yy - 9 * k], [x + w * .35, yy - 9 * k]]); c.fill(); } } };
  const tree = (x, y, k) => { c.fillStyle = 'rgba(30,60,30,.18)'; E(x + 6 * k, y + 2, 14 * k, 3.5 * k); c.fill(); c.fillStyle = '#7a5a3a'; c.fillRect(x - 2 * k, y - 12 * k, 4 * k, 13 * k); c.fillStyle = '#5b8c4a'; E(x, y - 22 * k, 14 * k, 15 * k); c.fill(); c.fillStyle = '#76a85f'; E(x - 4 * k, y - 26 * k, 9 * k, 9 * k); c.fill(); c.fillStyle = '#4a7a3c'; E(x + 6 * k, y - 18 * k, 7 * k, 7 * k); c.fill(); };

  /* ---------- Snow Arena (left) ---------- */
  pine(18, 286, 1.1, true); pine(192, 276, .85, true);
  c.fillStyle = 'rgba(40,70,90,.18)'; E(106, 286, 96, 11); c.fill();
  c.fillStyle = lin(20, 0, 192, 0, [[0, '#ffffff'], [.6, '#e8f0f5'], [1, '#c9d9e3']]); E(106, 284, 86, 62, Math.PI, 0); c.fill();
  c.strokeStyle = 'rgba(130,160,180,.45)'; c.lineWidth = 1.3; for (let i = 1; i < 5; i++) { E(106, 284, 86 * i / 5, 62, Math.PI, 0); c.stroke(); } for (let k = 1; k < 3; k++) { E(106, 284, 86, 62 * k / 3, Math.PI, 0); c.stroke(); }
  c.fillStyle = '#c3d3dd'; c.fillRect(20, 276, 172, 10); c.fillStyle = '#5c7685'; c.beginPath(); c.roundRect(90, 256, 32, 30, [15, 15, 0, 0]); c.fill(); c.fillStyle = '#87a8bb'; c.fillRect(94, 261, 24, 3);
  c.fillStyle = '#ffffff'; for (const [x, w] of [[40, 22], [170, 24], [128, 14]]) { E(x, 287, w, 7, Math.PI, 0); c.fill(); }
  pine(58, 304, .8, true); pine(160, 306, .7, true);
  c.strokeStyle = '#4b5d68'; c.lineWidth = 2; c.beginPath(); c.moveTo(106, 222); c.lineTo(106, 200); c.stroke(); c.fillStyle = '#56636b'; poly([[106, 200], [127, 205], [106, 211]]); c.fill();
  hit.push({ x0: 10, x1: 200, y0: 175, y1: 305, id: 'snow' });

  /* ---------- Drop Zone tower (behind, centre right) ---------- */
  const tx = 690, tTop = 74, tBase = 262;
  c.fillStyle = 'rgba(40,70,90,.15)'; E(tx + 10, tBase + 2, 34, 6); c.fill();
  c.strokeStyle = '#6f8894'; c.lineWidth = 4; c.beginPath(); c.moveTo(tx - 24, tBase); c.lineTo(tx - 12, tTop + 12); c.moveTo(tx + 24, tBase); c.lineTo(tx + 12, tTop + 12); c.stroke();
  c.lineWidth = 1.6; c.strokeStyle = '#8aa1ac'; for (let y = tTop + 22; y < tBase - 4; y += 24) { const a = (y - tTop) / (tBase - tTop), b = (y + 24 - tTop) / (tBase - tTop), wa = 12 + a * 12, wb = 12 + Math.min(1, b) * 12; c.beginPath(); c.moveTo(tx - wa, y); c.lineTo(tx + wb, Math.min(tBase, y + 24)); c.moveTo(tx + wa, y); c.lineTo(tx - wb, Math.min(tBase, y + 24)); c.moveTo(tx - wa, y); c.lineTo(tx + wa, y); c.stroke(); }
  c.fillStyle = '#2b3b45'; c.fillRect(tx - 26, tTop, 52, 13); c.fillStyle = '#3d515d'; c.fillRect(tx - 16, tTop - 16, 32, 16); c.fillStyle = '#bfe3f2'; c.fillRect(tx - 12, tTop - 12, 10, 8); c.fillRect(tx + 2, tTop - 12, 10, 8);
  c.strokeStyle = '#2b3b45'; c.lineWidth = 2; c.beginPath(); c.moveTo(tx + 26, tTop); c.lineTo(tx + 54, tTop); c.stroke();
  c.fillStyle = '#e04b3a'; c.beginPath(); c.arc(tx, tTop - 20, 4, 0, 7); c.fill(); c.fillStyle = 'rgba(224,75,58,.25)'; c.beginPath(); c.arc(tx, tTop - 20, 9, 0, 7); c.fill();
  // parachutist drifting down beside the tower
  const px = 752, py = 128;
  c.fillStyle = '#e3a51c'; E(px, py, 26, 17, Math.PI, 0); c.fill(); c.fillStyle = '#c94a34'; c.beginPath(); c.moveTo(px - 9, py); c.ellipse(px, py, 9, 17, 0, Math.PI, 0); c.closePath(); c.fill(); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(px - 26, py - 2, 52, 3);
  c.strokeStyle = '#6b5a45'; c.lineWidth = 1; c.beginPath(); for (const ox of [-25, -9, 9, 25]) { c.moveTo(px + ox, py); c.lineTo(px, py + 26); } c.stroke();
  c.fillStyle = '#1f5f8b'; c.beginPath(); c.roundRect(px - 3.5, py + 25, 7, 10, 2); c.fill(); c.fillStyle = '#f1c9a5'; c.beginPath(); c.arc(px, py + 22, 3.6, 0, 7); c.fill();
  hit.push({ x0: 650, x1: 785, y0: 20, y1: 250, id: 'drop' });

  /* ---------- Space Dome (right) ---------- */
  const sx = 808, sb = 266;
  c.fillStyle = 'rgba(30,50,70,.2)'; E(sx + 8, sb + 4, 96, 10); c.fill();
  c.fillStyle = '#cfd8e1'; c.fillRect(sx - 90, sb - 14, 180, 18); c.fillStyle = '#9fb0bd'; c.fillRect(sx - 90, sb - 2, 180, 6);
  c.fillStyle = '#7fa3bd'; for (let x = sx - 80; x < sx + 82; x += 20) c.fillRect(x, sb - 10, 10, 5);
  c.fillStyle = lin(sx - 80, 0, sx + 80, 0, [[0, '#2b4470'], [.5, '#17284a'], [1, '#0c162d']]); E(sx, sb - 14, 80, 74, Math.PI, 0); c.fill();
  c.fillStyle = '#f4f7ff'; const R2 = rng(5); for (let i = 0; i < 46; i++) { const a = Math.PI + R2() * Math.PI, r = Math.sqrt(R2()) * .9, x = sx + Math.cos(a) * 80 * r, y = sb - 14 + Math.sin(a) * 74 * r; c.globalAlpha = .45 + R2() * .55; c.beginPath(); c.arc(x, y, R2() * 1.3 + .4, 0, 7); c.fill(); } c.globalAlpha = 1;
  c.fillStyle = '#e3a51c'; c.beginPath(); c.arc(sx + 30, sb - 52, 9, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,220,150,.9)'; c.lineWidth = 2; E(sx + 30, sb - 52, 16, 4); c.stroke();
  c.strokeStyle = 'rgba(160,200,240,.35)'; c.lineWidth = 1.2; for (let i = 1; i < 4; i++) { E(sx, sb - 14, 80 * i / 4, 74, Math.PI, 0); c.stroke(); } for (let k = 1; k < 3; k++) { E(sx, sb - 14, 80, 74 * k / 3, Math.PI, 0); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.16)'; E(sx - 34, sb - 52, 22, 30, -0.5, 0.9); c.fill();
  c.strokeStyle = 'rgba(200,220,255,.75)'; c.lineWidth = 2; c.save(); c.translate(sx, sb - 46); c.rotate(-0.18); E(0, 0, 108, 18, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); c.restore();
  c.fillStyle = '#d5dde2'; c.beginPath(); c.roundRect(sx - 52, sb - 70, 26, 11, 5); c.fill(); c.fillStyle = '#e3a51c'; c.fillRect(sx - 52, sb - 66, 26, 3);
  c.strokeStyle = '#8aa1ac'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(sx + 84, sb - 10); c.lineTo(sx + 84, sb - 40); c.stroke(); c.fillStyle = '#e8eef2'; E(sx + 84, sb - 44, 12, 7, -0.6, Math.PI - 0.6); c.fill();
  hit.push({ x0: 715, x1: 900, y0: 160, y1: 280, id: 'space' });

  /* ---------- Workshop (front right) ---------- */
  const wx = 660, wy = 318, ww = 160, wh = 60;
  c.fillStyle = 'rgba(30,50,40,.22)'; E(wx + ww / 2 + 10, wy + wh + 2, ww / 2 + 16, 8); c.fill();
  c.fillStyle = '#b86343'; c.fillRect(wx, wy, ww, wh); c.fillStyle = '#9e5236'; c.fillRect(wx + ww - 46, wy, 46, wh);
  c.strokeStyle = 'rgba(80,35,20,.25)'; c.lineWidth = 1; for (let y = wy + 6; y < wy + wh; y += 6) { c.beginPath(); c.moveTo(wx, y); c.lineTo(wx + ww, y); c.stroke(); }
  for (let i = 0; i < 4; i++) { const x0 = wx + i * ww / 4, x1 = x0 + ww / 4; c.fillStyle = '#5d6b75'; poly([[x0, wy], [x0, wy - 22], [x1, wy]]); c.fill(); c.fillStyle = '#bfe3f2'; poly([[x0 + 2, wy - 3], [x0 + 2, wy - 18], [x0 + 12, wy - 9]]); c.fill(); }
  c.fillStyle = '#5d6b75'; c.fillRect(wx + 28, wy - 38, 10, 22);
  c.fillStyle = '#3d4a52'; c.beginPath(); c.roundRect(wx + 18, wy + 22, 50, 42, [4, 4, 0, 0]); c.fill(); c.strokeStyle = '#56656e'; c.lineWidth = 1.5; for (let y = wy + 28; y < wy + 64; y += 6) { c.beginPath(); c.moveTo(wx + 20, y); c.lineTo(wx + 66, y); c.stroke(); }
  c.fillStyle = '#e3a51c'; for (let k = 0; k < 5; k++) c.fillRect(wx + 18 + k * 10, wy + 16, 6, 4);
  c.fillStyle = '#bfe3f2'; c.fillRect(wx + 84, wy + 22, 26, 16); c.fillRect(wx + 128, wy + 22, 26, 16); c.fillStyle = '#e8f6fb'; c.fillRect(wx + 84, wy + 22, 8, 16); c.fillRect(wx + 128, wy + 22, 8, 16);
  c.save(); c.translate(wx + 119, wy + 52); c.fillStyle = '#e3a51c'; for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.fillRect(-2.5, -11, 5, 5); } c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill(); c.fillStyle = '#b86343'; c.beginPath(); c.arc(0, 0, 3, 0, 7); c.fill(); c.restore();
  // crane with a crate
  const cx2 = wx + ww + 28; c.strokeStyle = '#e3a51c'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx2, wy + wh); c.lineTo(cx2, wy - 34); c.lineTo(cx2 - 50, wy - 34); c.stroke(); c.lineWidth = 1.2; for (let y = wy + wh; y > wy - 30; y -= 10) { c.beginPath(); c.moveTo(cx2 - 4, y); c.lineTo(cx2 + 4, y - 10); c.stroke(); }
  c.strokeStyle = '#3d4a52'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(cx2 - 42, wy - 34); c.lineTo(cx2 - 42, wy - 6); c.stroke(); c.fillStyle = '#c99a5b'; c.fillRect(cx2 - 50, wy - 6, 16, 14); c.strokeStyle = '#7a5426'; c.lineWidth = 1.5; c.strokeRect(cx2 - 50, wy - 6, 16, 14);
  hit.push({ x0: 650, x1: 880, y0: 270, y1: 400, id: 'workshop' });

  /* ---------- Mission Control (front far right, beside the Workshop): a dome with a dish aerial and the GASA badge ---------- */
  const mx = 950, mb = 404;
  c.fillStyle = 'rgba(30,50,40,.22)'; E(mx + 8, mb + 3, 66, 8); c.fill();
  c.fillStyle = '#e4ebf0'; c.fillRect(mx - 48, mb - 46, 96, 46); c.fillStyle = '#c3d0d9'; c.fillRect(mx + 22, mb - 46, 26, 46); c.fillStyle = '#9fb0bd'; c.fillRect(mx - 52, mb - 50, 104, 6);
  c.fillStyle = '#26364a'; c.beginPath(); c.roundRect(mx - 40, mb - 34, 44, 14, 4); c.fill(); c.fillStyle = '#7ef0a8'; for (let k = 0; k < 4; k++) c.fillRect(mx - 35 + k * 10, mb - 30, 6, 6);
  c.fillStyle = '#13212a'; c.beginPath(); c.roundRect(mx + 8, mb - 24, 22, 24, [10, 10, 0, 0]); c.fill(); c.fillStyle = '#e3a51c'; c.fillRect(mx + 8, mb - 28, 22, 3);
  // the dome on the roof
  c.fillStyle = lin(mx - 40, 0, mx + 20, 0, [[0, '#ffffff'], [.6, '#dde7ee'], [1, '#b3c4d0']]); E(mx - 16, mb - 50, 32, 30, Math.PI, 0); c.fill();
  c.strokeStyle = 'rgba(120,150,170,.55)'; c.lineWidth = 1.2; for (let i = 1; i < 4; i++) { E(mx - 16, mb - 50, 32 * i / 4, 30, Math.PI, 0); c.stroke(); } c.beginPath(); c.moveTo(mx - 48, mb - 50); c.lineTo(mx + 16, mb - 50); c.stroke();
  c.fillStyle = '#26364a'; c.beginPath(); c.roundRect(mx - 24, mb - 66, 16, 12, [8, 8, 2, 2]); c.fill(); c.fillStyle = '#bfe3f2'; c.fillRect(mx - 21, mb - 63, 10, 6);
  // the dish aerial on its mast, with signal arcs
  c.strokeStyle = '#6f8894'; c.lineWidth = 3; c.beginPath(); c.moveTo(mx + 34, mb - 50); c.lineTo(mx + 34, mb - 66); c.stroke();
  c.save(); c.translate(mx + 34, mb - 70); c.rotate(-0.6); c.fillStyle = '#f4f7ff'; E(0, 0, 18, 8, 0, Math.PI); c.fill(); c.fillStyle = '#c3d0d9'; E(0, 0, 18, 8, 0, Math.PI); c.lineWidth = 1.5; c.strokeStyle = '#8aa1ac'; c.stroke(); c.strokeStyle = '#8aa1ac'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -12); c.stroke(); c.fillStyle = '#e04b3a'; c.beginPath(); c.arc(0, -13, 2.6, 0, 7); c.fill(); c.restore();
  c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; c.lineCap = 'round'; for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(mx + 34, mb - 70, 24 + i * 9, -2.35, -1.45); c.stroke(); }
  // the GASA badge: a round gummy-bear face, our own simple design
  c.fillStyle = '#e8639b'; c.beginPath(); c.arc(mx - 24, mb - 10, 11, 0, 7); c.fill(); c.fillStyle = '#ff9ec4'; for (const sd of [-1, 1]) { c.beginPath(); c.arc(mx - 24 + sd * 8, mb - 18, 4, 0, 7); c.fill(); } c.fillStyle = '#fffaf2'; c.beginPath(); c.arc(mx - 24, mb - 10, 7, 0, 7); c.fill(); c.fillStyle = '#e8639b'; c.fillRect(mx - 27, mb - 13, 2, 3); c.fillRect(mx - 23, mb - 13, 2, 3); c.beginPath(); c.arc(mx - 24, mb - 8, 3, 0.2, Math.PI - 0.2); c.fill();
  hit.push({ x0: 886, x1: 1022, y0: 290, y1: 414, id: 'mission' });

  /* ---------- Main Arena: a proper stadium (front centre) ---------- */
  const ax = 420, rimY = 214, rx = 212, ry = 46, baseY = 318;
  c.fillStyle = 'rgba(30,50,40,.25)'; E(ax + 16, baseY + 6, rx + 18, 30); c.fill();
  // outer wall (front half): between the rim and the base
  c.beginPath(); c.ellipse(ax, rimY, rx, ry, 0, 0, Math.PI); c.lineTo(ax - rx, baseY); c.ellipse(ax, baseY, rx, ry * .82, 0, Math.PI, 0, true); c.closePath();
  c.fillStyle = lin(ax - rx, 0, ax + rx, 0, [[0, '#f2f5f7'], [.45, '#dde5ea'], [1, '#aebdc6']]); c.fill();
  // pillars and a window band follow the curve
  for (let i = 1; i < 18; i++) { const a = Math.PI * i / 18, x = ax - Math.cos(a) * rx, yt = rimY + Math.sin(a) * ry, yb = baseY + Math.sin(a) * ry * .82; c.strokeStyle = i < 9 ? 'rgba(120,145,160,.35)' : 'rgba(90,110,125,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, yt + 4); c.lineTo(x, yb - 2); c.stroke(); }
  for (let i = 0; i < 18; i++) { const a = Math.PI * (i + .5) / 18, x = ax - Math.cos(a) * rx, y = rimY + Math.sin(a) * ry + 38, wd = 9 * Math.max(.35, Math.sin(a)); c.fillStyle = i < 9 ? '#4d6f87' : '#3f5f75'; c.beginPath(); c.roundRect(x - wd / 2, y, wd, 14, [4, 4, 1, 1]); c.fill(); }
  c.fillStyle = '#13212a'; c.beginPath(); c.ellipse(ax, rimY + 2, rx, ry, 0, 0, Math.PI); c.ellipse(ax, rimY + 9, rx, ry, 0, Math.PI, 0, true); c.closePath(); c.fill();
  // inside: stands, crowd and the arena floor
  c.fillStyle = '#7f97a5'; E(ax, rimY, rx, ry); c.fill();
  c.fillStyle = '#93a9b5'; E(ax, rimY + 4, rx - 18, ry - 7); c.fill();
  const team = ['#c94a34', '#11806f', '#e3a51c', '#1f5f8b', '#f4f7ff'];
  for (let i = 0; i < 260; i++) { const a = R() * Math.PI * 2, rr = .62 + R() * .34, x = ax + Math.cos(a) * (rx - 10) * rr, y = rimY + 4 + Math.sin(a) * (ry - 4) * rr; c.fillStyle = team[Math.floor(R() * team.length)]; c.globalAlpha = .85; c.fillRect(x - 1.2, y - 1.2, 2.4, 2.4); } c.globalAlpha = 1;
  c.fillStyle = '#d9c39a'; E(ax, rimY + 8, rx * .54, ry * .5); c.fill(); c.fillStyle = '#e6d2ab'; E(ax - 8, rimY + 6, rx * .44, ry * .36); c.fill();
  c.strokeStyle = '#fbf6ea'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ax, rimY - 14); c.lineTo(ax, rimY + 30); c.stroke();
  c.strokeStyle = '#8a6a3c'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(ax - 52, rimY + 8); c.lineTo(ax + 52, rimY + 8); c.stroke(); c.fillStyle = '#c99a5b'; c.fillRect(ax - 6, rimY + 3, 12, 10);
  for (const [s, col] of [[-1, '#c94a34'], [1, '#11806f']]) for (let k = 0; k < 3; k++) { const x = ax + s * (18 + k * 11); c.fillStyle = col; c.fillRect(x - 1.6, rimY + 4, 3.2, 7); c.beginPath(); c.arc(x - s * 1.2, rimY + 2.5, 2.2, 0, 7); c.fill(); }
  // roof canopy over the back stands
  c.beginPath(); c.ellipse(ax, rimY - 6, rx + 6, ry + 6, 0, Math.PI, 0); c.ellipse(ax, rimY + 2, rx - 34, ry - 14, 0, 0, Math.PI, true); c.closePath(); c.fillStyle = 'rgba(248,251,253,.94)'; c.fill();
  c.strokeStyle = 'rgba(150,170,185,.6)'; c.lineWidth = 1; for (let i = 1; i < 14; i++) { const a = Math.PI + Math.PI * i / 14; c.beginPath(); c.moveTo(ax + Math.cos(a) * (rx + 6), rimY - 6 + Math.sin(a) * (ry + 6)); c.lineTo(ax + Math.cos(a) * (rx - 34), rimY + 2 + Math.sin(a) * (ry - 14)); c.stroke(); }
  // floodlights
  for (const [x, top] of [[ax - rx + 18, 120], [ax + rx - 18, 120], [ax - 90, 150], [ax + 90, 150]]) {
    c.strokeStyle = '#5c6f7a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, rimY - 8); c.lineTo(x, top + 10); c.stroke();
    const lg = c.createRadialGradient(x, top + 4, 2, x, top + 4, 30); lg.addColorStop(0, 'rgba(255,248,200,.85)'); lg.addColorStop(1, 'rgba(255,248,200,0)'); c.fillStyle = lg; c.fillRect(x - 32, top - 26, 64, 60);
    c.fillStyle = '#2b3b45'; c.fillRect(x - 13, top - 2, 26, 13); c.fillStyle = '#fff6c9'; for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) c.fillRect(x - 11 + k * 8, top + j * 5.5, 6, 4);
  }
  // entrance gate, sign and team banners
  c.fillStyle = '#13212a'; c.beginPath(); c.roundRect(ax - 34, baseY + 4, 68, 32, [14, 14, 0, 0]); c.fill(); c.fillStyle = '#2a3c48'; c.fillRect(ax - 26, baseY + 12, 52, 24);
  c.fillStyle = '#13212a'; c.beginPath(); c.roundRect(ax - 62, baseY - 22, 124, 24, 6); c.fill(); txt(c, 'MAIN ARENA', ax, baseY - 9.5, '#e3a51c', `800 15px ${C.fd}`);
  for (const [s, col] of [[-1, '#c94a34'], [1, '#11806f']]) { const x = ax + s * 120, y = rimY + 32; c.fillStyle = col; poly([[x - 9, y], [x + 9, y], [x + 9, y + 34], [x, y + 28], [x - 9, y + 34]]); c.fill(); c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(x, y + 12, 4, 0, 7); c.fill(); }
  hit.push({ x0: 200, x1: 640, y0: 110, y1: 360, id: 'main' });

  /* foreground: trees, lamps and a few people on the plaza */
  tree(28, 384, 1.15); tree(206, 378, .8); tree(620, 396, .9); tree(880, 392, 1.1); tree(852, 410, .75);
  for (const x of [170, 310, 530, 640]) { c.strokeStyle = '#3d4a52'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 392); c.lineTo(x, 366); c.stroke(); c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(x, 364, 3.5, 0, 7); c.fill(); }
  for (const [x, y, col] of [[215, 384, '#c94a34'], [228, 388, '#1f5f8b'], [470, 396, '#11806f'], [520, 380, '#e3a51c'], [355, 398, '#7446b0'], [640, 390, '#c94a34']]) { c.fillStyle = 'rgba(0,0,0,.15)'; E(x + 2, y + 9, 4, 1.5); c.fill(); c.fillStyle = col; c.beginPath(); c.roundRect(x - 2.5, y - 2, 5, 10, 2); c.fill(); c.fillStyle = '#e8c4a0'; c.beginPath(); c.arc(x, y - 4.5, 2.6, 0, 7); c.fill(); }

  /* labels: a pill with a little pointer */
  const label = (s, x, y, dark) => { c.font = `800 14px ${C.fd}`; const w = c.measureText(s).width + 22; c.save(); c.shadowColor = 'rgba(10,25,35,.25)'; c.shadowBlur = 8; c.shadowOffsetY = 2; c.fillStyle = dark ? '#13212a' : 'rgba(255,255,255,.96)'; c.beginPath(); c.roundRect(x - w / 2, y - 13, w, 26, 13); c.fill(); c.restore(); c.fillStyle = dark ? '#13212a' : 'rgba(255,255,255,.96)'; poly([[x - 6, y + 12], [x + 6, y + 12], [x, y + 19]]); c.fill(); txt(c, s, x, y + .5, dark ? '#e3a51c' : '#13212a', `800 14px ${C.fd}`); };
  label('SNOW ARENA', 106, 182); label('DROP ZONE', 690, 30); label('SPACE DOME', 812, 152); label('WORKSHOP', 740, 268); label('MISSION CONTROL', 930, 300);
}
