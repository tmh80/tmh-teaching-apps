/* ===== Art sample for the rescue (Glimmer-9 at night). Replaces the grey-box's draw() and nothing else: same pieces, same model, same dragging.
   Every drawing here is a plain function of (canvas context, metres), so it can move into src/js as the rescue's and the Workshop's shared piece art. ===== */
(function () {
  cv.width = 1200; cv.height = 420;
  const X = sx, Y = y => cv.height - (y + 3.4) * K, F = () => css('--font') || 'system-ui';
  const A = { sky0: '#120c2e', sky1: '#33246f', sky2: '#7a4fc0', haze: '#e9a6e0', ridge1: '#3d2c84', ridge2: '#5540a0', g0: '#cdbcf7', g1: '#9a80e0', g2: '#6a51b8', g3: '#463389', edge: '#f4ecff', pit: '#4a3690',
    steel: '#e4eaf5', steel2: '#a9b4c9', steelD: '#4c5670', yellow: '#ffc53d', yellowD: '#c98512', dark: '#1b1d29', rope: '#f8e6b0', ropeD: '#7c5f24', wood: '#e0a45a', woodD: '#9b6a2c',
    pink: '#ff7fb0', pinkD: '#d94c86', pinkL: '#ffd0e2', blue: '#4aa3ff', blueL: '#a9d6ff', teal: '#58e6d0', gem: '#8af3ff', gem2: '#ff9be0', red: '#ff5a5a', green: '#74f0a8', orange: '#ff9a3d', orangeD: '#d9661a', white: '#ffffff' };
  const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const stars = (() => { const r = rng(11), a = []; for (let i = 0; i < 150; i++) a.push([r() * 1200, r() * 300, r() * 1.3 + 0.3, r()]); return a; })();
  const ridge = (seed, base, amp) => { const r = rng(seed), a = []; let h = base; for (let x = 0; x <= 1200; x += 40) { h = clamp(h + (r() - 0.5) * amp, base - amp, base + amp); a.push([x, h]); } return a; };
  const R1 = ridge(5, 250, 46), R2 = ridge(9, 290, 34), gems = (() => { const r = rng(23), a = []; for (let i = 0; i < 22; i++) a.push([2 + r() * 92, r(), r()]); return a; })();
  const dimples = (() => { const r = rng(41), a = []; for (let i = 0; i < 14; i++) a.push([4 + r() * 88, 0.6 + r() * 1.2, r()]); return a; })();
  const rr = (x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  const line = (x0, y0, x1, y1, col, w) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
  const dot = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
  function pill(t, x, y, tone, al) { c.font = '700 11px ' + F(); const w = c.measureText(t).width + 14, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2; const xx = clamp(x0, 4, cv.width - w - 4);
    c.fillStyle = tone === 'bad' ? 'rgba(170,30,50,.92)' : tone === 'good' ? 'rgba(20,110,70,.92)' : tone === 'gold' ? 'rgba(255,197,61,.95)' : 'rgba(18,12,46,.82)'; rr(xx, y - 9, w, 18, 9); c.fill();
    c.fillStyle = tone === 'gold' ? A.dark : A.white; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(t, xx + 7, y + 0.5); c.textBaseline = 'alphabetic'; }

  /* ---------- the planet ---------- */
  function sky() { const s = c.createLinearGradient(0, 0, 0, cv.height); s.addColorStop(0, A.sky0); s.addColorStop(0.55, A.sky1); s.addColorStop(0.9, A.sky2); s.addColorStop(1, A.haze); c.fillStyle = s; c.fillRect(0, 0, cv.width, cv.height);
    stars.forEach(([x, y, r, t]) => { c.globalAlpha = 0.35 + t * 0.65; dot(x, y, r, t > 0.85 ? A.gem : A.white); }); c.globalAlpha = 1;
    [[170, 70, 26, '#f1e9ff'], [330, 118, 11, '#ffb9de']].forEach(([x, y, r, col]) => { const gl = c.createRadialGradient(x, y, r * 0.6, x, y, r * 3); gl.addColorStop(0, 'rgba(255,255,255,.28)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); dot(x, y, r, col); c.globalAlpha = 0.18; dot(x - r * 0.3, y - r * 0.2, r * 0.28, A.sky1); dot(x + r * 0.35, y + r * 0.3, r * 0.18, A.sky1); c.globalAlpha = 1; });
    [[R1, A.ridge1], [R2, A.ridge2]].forEach(([pts, col]) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, cv.height); pts.forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(1200, cv.height); c.fill(); }); }
  function ground(g) {
    const path = off => { c.beginPath(); c.moveTo(X(0), cv.height + 60); c.lineTo(X(0), Y(glAt(g, 0)) + off); for (let x = 0.5; x <= 96; x += 0.5) c.lineTo(X(x), Y(glAt(g, x)) + off); c.lineTo(X(96), cv.height + 60); c.closePath(); };
    c.fillStyle = A.sky0; c.fillRect(0, 0, X(0), cv.height); c.fillRect(X(96), 0, cv.width, cv.height);
    const gr = c.createLinearGradient(0, Y(16), 0, cv.height); gr.addColorStop(0, A.g0); gr.addColorStop(0.45, A.g1); gr.addColorStop(1, A.g2); path(0); c.fillStyle = gr; c.fill();
    c.save(); path(0); c.clip(); c.globalAlpha = 0.5; c.fillStyle = A.g2; path(26); c.fill(); c.fillStyle = A.g3; path(58); c.fill(); c.globalAlpha = 0.6; path(96); c.fill(); c.globalAlpha = 1;
    dimples.forEach(([x, w, t]) => { const y = Y(glAt(g, x)) + 9 + t * 14; c.fillStyle = 'rgba(70,51,137,.45)'; c.beginPath(); c.ellipse(X(x), y, w * K, w * K * 0.3, 0, 0, 7); c.fill(); }); c.restore();
    c.lineJoin = 'round'; c.strokeStyle = 'rgba(70,51,137,.5)'; c.lineWidth = 6; c.beginPath(); for (let x = 0; x <= 96; x += 0.5) x ? c.lineTo(X(x), Y(glAt(g, x)) + 4) : c.moveTo(X(x), Y(glAt(g, x)) + 4); c.stroke();
    c.strokeStyle = A.edge; c.lineWidth = 2.5; c.beginPath(); for (let x = 0; x <= 96; x += 0.5) x ? c.lineTo(X(x), Y(glAt(g, x))) : c.moveTo(X(x), Y(glAt(g, x))); c.stroke();
    gems.forEach(([x, t, u]) => { const bx = X(x), by = Y(glAt(g, x)) + 1, col = u > 0.6 ? A.gem2 : A.gem, h = 7 + t * 9; c.shadowColor = col; c.shadowBlur = 8; [[-4, 0.6], [0, 1], [4, 0.75]].forEach(([dx, k]) => { c.fillStyle = col; c.beginPath(); c.moveTo(bx + dx - 2.6, by); c.lineTo(bx + dx, by - h * k); c.lineTo(bx + dx + 2.6, by); c.fill(); }); c.shadowBlur = 0; line(bx - 0.6, by - h + 2, bx - 1.6, by - 2, 'rgba(255,255,255,.8)', 1); });
  }
  function bigJelly(x, y, beamTo) {
    if (beamTo) { const b = c.createLinearGradient(0, y, 0, beamTo.y); b.addColorStop(0, 'rgba(120,255,230,.55)'); b.addColorStop(1, 'rgba(120,255,230,.08)'); c.fillStyle = b; c.beginPath(); c.moveTo(x - 10, y + 8); c.lineTo(x + 10, y + 8); c.lineTo(beamTo.x + 34, beamTo.y); c.lineTo(beamTo.x - 34, beamTo.y); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x, y - 14, 30, 20, 0, Math.PI, 0); c.fill(); const gr = c.createLinearGradient(0, y - 12, 0, y + 12); gr.addColorStop(0, '#ffb45e'); gr.addColorStop(1, A.orangeD); c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, 62, 14, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x, y - 4, 54, 5, 0, Math.PI, 0); c.fill(); [A.pink, A.green, A.yellow, A.blue].forEach((col, i) => { dot(x - 30 + i * 20, y, 5.5, A.white); dot(x - 30 + i * 20, y, 3.6, col); }); c.fillStyle = A.steelD; rr(x - 12, y + 11, 24, 6, 3); c.fill(); pill('The Big Jelly', x, y - 44, null); }

  /* ---------- the pieces ---------- */
  function hazard(x, y, w, h) { c.save(); rr(x, y, w, h, 2.5); c.clip(); c.fillStyle = A.yellow; c.fillRect(x, y, w, h); c.strokeStyle = A.dark; c.lineWidth = 3.5; for (let i = -h; i < w + h; i += 11) { c.beginPath(); c.moveTo(x + i, y + h); c.lineTo(x + i + h, y); c.stroke(); } c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x, y, w, 1.6); c.restore(); }
  function truss(x, y0, y1, w) { line(x - w, y0, x - w, y1, A.steelD, 3.5); line(x + w, y0, x + w, y1, A.steelD, 3.5); line(x - w, y0, x - w, y1, A.steel, 1.6); line(x + w, y0, x + w, y1, A.steel, 1.6); c.strokeStyle = A.steel2; c.lineWidth = 1.4; c.beginPath(); let up = true; for (let y = y0; y > y1; y -= 2 * w + 2) { const ny = Math.max(y1, y - 2 * w - 2); c.moveTo(up ? x - w : x + w, y); c.lineTo(up ? x + w : x - w, ny); up = !up; } c.stroke(); }
  function platform(q, sel, over) { const x0 = X(q.x0), x1 = X(q.x1), yt = Y(q.top), yb = Y(q.base); truss(x0 + 8, yb, yt + 6, 4); truss(x1 - 8, yb, yt + 6, 4); if (yb - yt > 34) { line(x0 + 12, yb - 6, x1 - 12, yt + 14, A.steel2, 1.4); line(x1 - 12, yb - 6, x0 + 12, yt + 14, A.steel2, 1.4); }
    hazard(x0 - 2, yt, x1 - x0 + 4, 7); if (over) { c.fillStyle = 'rgba(255,60,60,.55)'; c.fillRect(x0 - 2, yt, x1 - x0 + 4, 7); } if (sel) { c.strokeStyle = A.teal; c.lineWidth = 2; rr(x0 - 5, yt - 4, x1 - x0 + 10, yb - yt + 6, 5); c.stroke(); } }
  function rampArt(p, g, bad, sel) { const x0 = X(p.fx), y0 = Y(p._fy), x1 = X(p.hx), y1 = Y(p._hy), n = Math.max(1, Math.round((p.hx - p.fx) / 3));
    for (let i = 1; i < n; i++) { const t = i / n, wxm = p.fx + (p.hx - p.fx) * t, dy = Y(p._fy + (p._hy - p._fy) * t), gy = Y(glAt(g, wxm)); if (gy - dy > 6) { line(X(wxm), dy, X(wxm), gy, A.steelD, 3); line(X(wxm), dy, X(wxm), gy, A.steel2, 1.2); } }
    c.lineCap = 'round'; line(x0, y0, x1, y1, bad ? '#7a1020' : A.dark, 10); line(x0, y0, x1, y1, bad ? A.red : A.steel2, 7); line(x0, y0 - 2, x1, y1 - 2, bad ? '#ffb0b0' : A.steel, 2.5); c.lineCap = 'butt';
    const L = Math.hypot(x1 - x0, y1 - y0), m = Math.floor(L / 9); for (let i = 1; i < m; i++) dot(x0 + (x1 - x0) * i / m, y0 + (y1 - y0) * i / m, 2.1, bad ? '#7a1020' : A.yellow);
    if (sel) { c.setLineDash([4, 4]); line(x0, y0 - 9, x1, y1 - 9, A.teal, 1.5); c.setLineDash([]); }
    [[x0, y0], [x1, y1]].forEach(([x, y]) => { dot(x, y, 7.5, A.dark); dot(x, y, 5.5, bad ? A.red : A.yellow); dot(x, y, 2.2, A.white); }); }
  function pulley(x, y, n) { c.fillStyle = A.dark; rr(x - 7, y - 3, 14, 17, 4); c.fill(); c.fillStyle = A.yellow; rr(x - 5.5, y - 1.5, 11, 14, 3); c.fill(); dot(x, y + 3, 3, A.dark); dot(x, y + 3, 1.2, A.steel); dot(x, y + 9, 2.3, A.dark); c.strokeStyle = A.steel; c.lineWidth = 2; c.beginPath(); c.arc(x, y + 17, 3.5, 0.2, Math.PI * 1.2); c.stroke(); if (n > 1) { c.font = '700 9px ' + F(); c.fillStyle = A.white; c.textAlign = 'left'; c.fillText('×' + n, x + 9, y + 9); } }
  function winch(x, y, ratio) { c.fillStyle = A.dark; rr(x - 9, y - 4, 18, 6, 2); c.fill(); dot(x, y - 10, 9, A.dark); dot(x, y - 10, 7.3, A.yellow); c.strokeStyle = A.yellowD; c.lineWidth = 1.4; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; c.beginPath(); c.moveTo(x - Math.cos(a) * 7, y - 10 - Math.sin(a) * 7); c.lineTo(x + Math.cos(a) * 7, y - 10 + Math.sin(a) * 7); c.stroke(); } dot(x, y - 10, 2.6, A.dark); line(x, y - 10, x + 12, y - 17, A.steel, 2.5); dot(x + 12, y - 17, 3, A.red);
    if (ratio) { c.font = '700 9px ' + F(); c.fillStyle = A.white; c.textAlign = 'left'; c.fillText('×' + ratio, x + 12, y - 3); } }
  function gearRow(p, x, y) { let gx = x; [p.w1, p.w2].filter(Boolean).forEach(w => { winch(gx, y, w); gx += 30; }); }
  function craneArt(p, g, fl, sel) { const top = Y(fl + Math.max(p.rise, 2) + 6.5), xa = Math.min(p.x, p.x + p.across) - 2.6, xb = Math.max(p.x, p.x + p.across) + 2.6;
    truss(X(xa), Y(glAt(g, xa)), top, 4.5); truss(X(xb), Y(glAt(g, xb)), top, 4.5); c.fillStyle = A.dark; rr(X(xa) - 9, top - 6, X(xb) - X(xa) + 18, 11, 3); c.fill(); hazard(X(xa) - 7, top - 4.5, X(xb) - X(xa) + 14, 8);
    if (p.across) { c.setLineDash([3, 4]); line(X(p.x), top + 14, X(p.x + p.across), top + 14, A.teal, 1.6); c.setLineDash([]); dot(X(p.x + p.across), top + 14, 3, A.teal); }
    c.fillStyle = A.dark; rr(X(p.x) - 8, top + 2, 16, 8, 2); c.fill(); dot(X(p.x) - 4, top + 3, 2.2, A.steel); dot(X(p.x) + 4, top + 3, 2.2, A.steel);
    if (sel) { c.strokeStyle = A.teal; c.lineWidth = 2; rr(X(xa) - 12, top - 10, X(xb) - X(xa) + 24, Y(glAt(g, xa)) - top + 14, 6); c.stroke(); }
    return { x: X(p.x), y: top + 10, base: { x: X(xb) + 16, y: Y(glAt(g, xb + 1.3)) } }; }
  function postArt(p, fl, sel) { const x = X(p.x), y = Y(fl); c.fillStyle = A.dark; c.beginPath(); c.moveTo(x - 14, y); c.lineTo(x - 8, y - 9); c.lineTo(x + 8, y - 9); c.lineTo(x + 14, y); c.fill(); c.fillStyle = A.steel2; c.fillRect(x - 3, y - 26, 6, 18); dot(x, y - 27, 4, A.red);
    let gx = x - 6; if (p.w1 || p.w2) { [p.w1, p.w2].filter(Boolean).forEach((w, i) => winch(x + (i ? 24 : 0), y - 9, w)); } if (sel) { c.strokeStyle = A.teal; c.lineWidth = 2; rr(x - 20, y - 36, 62, 40, 6); c.stroke(); } return { x: x - 2, y: y - 22 }; }
  function leverArt(x, y, tilt, len) { c.fillStyle = A.steelD; c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x, y - 12); c.lineTo(x + 9, y); c.fill(); c.fillStyle = A.steel; c.beginPath(); c.moveTo(x - 4, y - 3); c.lineTo(x, y - 11); c.lineTo(x + 2, y - 3); c.fill(); c.save(); c.translate(x, y - 12); c.rotate(tilt); c.fillStyle = A.woodD; rr(-18, -3.5, len, 7, 3); c.fill(); c.fillStyle = A.wood; rr(-17, -2.5, len - 2, 4, 2); c.fill(); c.restore(); }
  function jackArt(x, y) { c.fillStyle = A.dark; rr(x - 11, y - 5, 22, 5, 2); c.fill(); c.strokeStyle = A.steel; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 6; i++) { c.moveTo(x - 4, y - 6 - i * 2.6); c.lineTo(x + 4, y - 8 - i * 2.6); } c.stroke(); line(x, y - 5, x, y - 22, A.steel2, 2); c.fillStyle = A.yellow; rr(x - 8, y - 25, 16, 4, 2); c.fill(); line(x, y - 12, x + 13, y - 12, A.steel, 2); dot(x + 13, y - 12, 2.6, A.red); }
  function boulderArt(x, y, r, tone) { const pts = [1, 0.86, 1.05, 0.9, 1, 0.82, 0.96, 1.08]; c.beginPath(); pts.forEach((k, i) => { const a = i / pts.length * Math.PI * 2 - 0.3, px = x + Math.cos(a) * r * k, py = y + Math.sin(a) * r * k * 0.86; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.closePath(); const gr = c.createLinearGradient(x - r, y - r, x + r, y + r); gr.addColorStop(0, tone || '#b9a8e8'); gr.addColorStop(1, '#55408f'); c.fillStyle = gr; c.fill(); c.strokeStyle = 'rgba(18,12,46,.55)'; c.lineWidth = 1.5; c.stroke(); line(x - r * 0.3, y - r * 0.5, x + r * 0.1, y, 'rgba(18,12,46,.35)', 1.2); line(x + r * 0.1, y, x - r * 0.1, y + r * 0.5, 'rgba(18,12,46,.35)', 1.2); line(x - r * 0.55, y - r * 0.35, x - r * 0.2, y - r * 0.62, 'rgba(255,255,255,.55)', 1.5); }
  function rope(a, b, taut) { const mx = (a.x + b.x) / 2, sag = taut ? 3 : Math.min(40, Math.hypot(b.x - a.x, b.y - a.y) * 0.1), my = (a.y + b.y) / 2 + sag; c.lineCap = 'round'; [[A.ropeD, taut ? 3.6 : 2.6], [A.rope, taut ? 1.8 : 1.1]].forEach(([col, w]) => { c.strokeStyle = col; c.lineWidth = w; c.globalAlpha = taut ? 1 : 0.55; c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo(mx, my, b.x, b.y); c.stroke(); }); c.globalAlpha = 1; c.lineCap = 'butt'; }
  /* the Gumdrop: o = { ghost, dmg (0-100), legOff, tilt } */
  function gumdrop(wxm, wym, o) { o = o || {}; const x = X(wxm), y = Y(wym), w = 1.7 * K, h = 4.1 * K, lg = 0.55 * K;
    c.save(); if (o.ghost) c.globalAlpha = 0.32;
    [[-0.95, false], [0, false], [0.95, true]].forEach(([k, right]) => { if (right && o.legOff) { line(x + k * w * 0.8, y - lg - 2, x + k * w * 0.8 + 3, y - lg + 4, A.steelD, 3); return; } line(x + k * w * 0.8, y - lg - 3, x + k * w * 0.95, y - 2, A.steelD, 3.4); c.fillStyle = A.steelD; rr(x + k * w * 0.95 - 5, y - 3, 10, 3, 1.5); c.fill(); });
    const by = y - lg; c.beginPath(); c.moveTo(x - w, by); c.bezierCurveTo(x - w * 1.08, by - h * 0.62, x - w * 0.55, by - h, x, by - h); c.bezierCurveTo(x + w * 0.55, by - h, x + w * 1.08, by - h * 0.62, x + w, by); c.closePath();
    const gr = c.createRadialGradient(x - w * 0.4, by - h * 0.7, 2, x, by - h * 0.4, h); gr.addColorStop(0, A.pinkL); gr.addColorStop(0.45, A.pink); gr.addColorStop(1, A.pinkD); c.fillStyle = gr; c.fill(); c.strokeStyle = 'rgba(120,20,70,.55)'; c.lineWidth = 1.5; c.stroke();
    c.save(); c.clip(); c.fillStyle = A.pinkD; c.fillRect(x - w * 1.2, by - 9, w * 2.4, 12); c.fillStyle = 'rgba(255,255,255,.75)'; const r = rng(77); for (let i = 0; i < 16; i++) dot(x - w + r() * w * 2, by - 12 - r() * h * 0.85, 0.9 + r() * 0.7, 'rgba(255,255,255,.75)');
    if (o.dmg > 0) { const n = Math.ceil(o.dmg / 14), q = rng(5); c.strokeStyle = 'rgba(60,10,40,.8)'; c.lineWidth = 1.5; for (let i = 0; i < n; i++) { let px = x - w * 0.8 + q() * w * 1.6, py = by - 8 - q() * h * 0.7; c.beginPath(); c.moveTo(px, py); for (let j = 0; j < 3; j++) { px += (q() - 0.5) * 12; py += 4 + q() * 6; c.lineTo(px, py); } c.stroke(); } c.fillStyle = `rgba(40,10,40,${Math.min(0.4, o.dmg / 250)})`; c.fillRect(x - w * 1.2, by - h, w * 2.4, h); }
    c.restore(); [-0.7, 0, 0.7].forEach(k => dot(x + k * w, by - 3.5, 2, A.yellow));
    const wy = by - h * 0.52; dot(x, wy, 11, A.dark); dot(x, wy, 9.4, '#d9f1ff'); dot(x - 4.6, wy - 3.4, 2.6, A.blue); dot(x + 4.6, wy - 3.4, 2.6, A.blue); dot(x, wy + 1.6, 6, A.blue); dot(x, wy + 3.4, 2.6, A.blueL); dot(x - 2.2, wy + 0.4, 1.1, A.dark); dot(x + 2.2, wy + 0.4, 1.1, A.dark); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, wy, 9.4, 3.6, 4.6); c.stroke();
    c.strokeStyle = A.steel; c.lineWidth = 2.2; c.beginPath(); c.arc(x, by - h - 3.5, 3.5, 0, 7); c.stroke(); c.restore(); return { x, y: by - h - 4 }; }
  const WOBBLE = () => anim ? Math.sin(performance.now() / 60) * 0.6 : 0;

  /* ---------- the whole board ---------- */
  draw = function () {
    const rig = toRig(); EV = gpEvaluate(rig); const g = EV.ground, PL = EV.plats.map(q => ({ x0: q.x0, x1: q.x1, top: q.top })), T = EV.torn; handles = [];
    c.clearRect(0, 0, cv.width, cv.height); sky(); const done = EV.arrived && anim && anim.done, ship = anim ? anim.pos : EV.ship0;
    bigJelly(X(84), 62, done ? { x: X(EV.final.x), y: Y(EV.final.y + 2) } : null); ground(g);
    c.setLineDash([6, 6]); c.strokeStyle = 'rgba(120,255,230,.8)'; c.lineWidth = 1.6; c.beginPath(); for (let x = 30; x <= 96; x += 0.5) { const y = glMaxRight(g, x) - GL.hzY; x === 30 ? c.moveTo(X(x), Y(y)) : c.lineTo(X(x), Y(y)); } c.stroke(); c.setLineDash([]); pill('The tractor beam reaches this line', X(87), Y(glMaxRight(g, 87) - GL.hzY) - 13, null);
    const isSel = p => sel === p.id, anchors = {};
    EV.plats.forEach(q => { const p = P.find(z => z.id === q.id); platform(q, isSel(p), q.over); handles.push({ p, role: 'move', x: X(p.x), y: Y(q.top) + 3 }); });
    P.filter(p => p.type === 'dyn').forEach(p => { const b = EV.blasts.find(z => z.id === p.id); if (!b) return; c.setLineDash([3, 4]); c.strokeStyle = 'rgba(255,120,90,.9)'; c.lineWidth = isSel(p) ? 2.4 : 1.3; c.beginPath(); c.arc(X(b.x), Y(b.y), b.r * K, 0, 7); c.stroke(); c.setLineDash([]); [-4, 0, 4].forEach(d => { c.fillStyle = A.red; rr(X(b.x) + d - 2, Y(b.y) - 16, 4, 13, 1.5); c.fill(); }); line(X(b.x), Y(b.y) - 16, X(b.x) + 5, Y(b.y) - 22, A.steel, 1.2); dot(X(b.x) + 5, Y(b.y) - 22, 2.2, A.yellow); handles.push({ p, role: 'move', x: X(b.x), y: Y(b.y) - 8 }); });
    const bl = P.find(p => p.type === 'blever'); if (bl) { leverArt(X(22.6), Y(glAt(g, 22.6)), EV.boulder.ok ? 0.12 : -0.1, 46); handles.push({ p: bl, role: 'pick', x: X(23), y: Y(1) }); if (isSel(bl)) { c.strokeStyle = A.teal; c.lineWidth = 2; rr(X(20.6), Y(2.2), 62, 30, 6); c.stroke(); } }
    if (EV.boulder.ok) { boulderArt(X(26.5), Y(glAt(g, 26.5) + 0.75), 0.85 * K); pill('Boulder cleared ✓', X(26.5), Y(glAt(g, 26.5) + 2.4), 'good'); }
    P.filter(p => p.type === 'ramp').forEach(p => { const leg = EV.legs.find(l => l.id === p.id), bad = (leg && leg.faults.length) || p._rise <= 0 || p._L > GL.rampMax || p._rise / p._L > GL.slopeMax; rampArt(p, g, bad, isSel(p));
      handles.push({ p, role: 'foot', x: X(p.fx), y: Y(p._fy) }, { p, role: 'head', x: X(p.hx), y: Y(p._hy) }, { p, role: 'pick', x: X((p.fx + p.hx) / 2), y: Y((p._fy + p._hy) / 2) });
      if (p.roped) { anchors[p.id] = { x: X(p.hx) + 6, y: Y(p._hy) - 18 }; if (p.ropes > 1) pulley(X(p.hx) + 6, Y(p._hy) - 22, p.ropes); gearRow(p, X(p.hx) + 26, Y(p._hy)); }
      pill(`Ramp ${fmt(p._L)} m, up ${fmt(p._rise)} m` + (p.roped ? '' : ' · no rope'), X((p.fx + p.hx) / 2), Y((p._fy + p._hy) / 2) - 20, bad ? 'bad' : null); });
    P.filter(p => p.type === 'crane').forEach(p => { const fl = glFloorAt(p.x, g, PL), a = craneArt(p, g, fl, isSel(p)); if (p.roped) { anchors[p.id] = { x: a.x, y: a.y + (p.ropes > 1 ? 18 : 0) }; if (p.ropes > 1) pulley(a.x, a.y, p.ropes); gearRow(p, a.base.x, a.base.y); }
      pill(`Crane: up ${fmt(p.rise)} m` + (p.across ? `, across ${fmt(Math.abs(p.across))} m` : '') + (p.roped ? '' : ' · no rope'), a.x, a.y - 30, null); handles.push({ p, role: 'move', x: a.x, y: a.y - 8 }, { p, role: 'move', x: a.x, y: Y(fl + 6) }); });
    P.filter(p => p.type === 'lever' || p.type === 'jack' || p.type === 'post').forEach(p => { const fl = glFloorAt(p.x, g, PL);
      if (p.type === 'post') { anchors[p.id + 'b'] = postArt(p, fl, isSel(p)); if (p.ropes > 1) pulley(X(p.x) - 14, Y(fl) - 32, p.ropes); pill('Winch post · ' + gear(p), X(p.x), Y(fl) - 50, 'gold'); }
      else if (p.type === 'lever') { leverArt(X(p.x), Y(fl), -0.12, 46); gearRow(p, X(p.x) + 40, Y(fl)); } else jackArt(X(p.x), Y(fl));
      if (p.type !== 'post' && isSel(p)) { c.strokeStyle = A.teal; c.lineWidth = 2; rr(X(p.x) - 22, Y(fl) - 30, 50, 34, 6); c.stroke(); } handles.push({ p, role: 'move', x: X(p.x), y: Y(fl) - 10 }); });
    /* the route the Gumdrop will take */
    const kcol = { nudge: 'rgba(255,255,255,.55)', ground: '#ff7a6b', platform: A.yellow, ramp: A.green, lift: A.teal, across: A.teal, lower: A.teal, slide: 'rgba(255,255,255,.55)', fall: '#ff7a6b' };
    EV.legs.forEach(l => { let px = l.start.x, py = l.start.y, acc = 0; l.path.forEach(q => { const d = Math.hypot(q.x - px, q.y - py) * K; acc += d; if (acc >= 9 || q.k === 'fall') { acc = 0; dot(X(q.x), Y(q.y) - 5, q.k === 'ground' ? 2.4 : 1.9, kcol[q.k] || A.white); } px = q.x; py = q.y; });
      gumdrop(l.end.x, l.end.y, { ghost: true, legOff: T && l.i >= T.leg }); pill('after leg ' + (l.i + 1), X(l.end.x), Y(l.end.y + 6.2), null); });
    if (EV.stop && EV.stop.wall) { line(X(EV.stop.wall.x), Y(EV.stop.wall.y), X(EV.stop.wall.x), Y(EV.stop.at.y), A.red, 5); pill('Wall: too tall to drag over', X(EV.stop.wall.x), Y(EV.stop.wall.y) - 14, 'bad'); }
    if (T && (!anim || !anim.rk)) { boulderArt(X(T.x + 1.9), Y(T.y + 0.7), 0.8 * K); line(X(T.x + 1.2), Y(T.y + 1.3), X(T.x + 1.7), Y(T.y + 0.3), A.steelD, 3.4); pill('The landing leg ripped off here', X(T.x + 1.9), Y(T.y + 2.6), 'bad'); }
    /* ropes: the working one is tight, the rest hang slack */
    const li = anim ? anim.li : 0, cur = EV.legs[li], hookY = Y(ship.y + 0.55 + 4.1) - 4, hook = { x: X(ship.x), y: hookY }; Object.keys(anchors).forEach(id => { if (!cur || cur.id !== id) rope(anchors[id], hook, false); }); if (cur && anchors[cur.id]) rope(anchors[cur.id], hook, true);
    const on = EV.rockOn && (anim ? anim.rk : true), dmgNow = anim ? (anim.done ? EV.dmg.total : EV.dmg.total * anim.u) : 0;
    if (anim && !anim.done && (anim.k === 'ground' || anim.k === 'platform')) { const q = rng(Math.floor(performance.now() / 50) + 3); for (let i = 0; i < 9; i++) { c.globalAlpha = 0.25 + q() * 0.4; dot(X(ship.x) - 26 - q() * 34, Y(ship.y) - q() * 14, 3 + q() * 6, anim.k === 'ground' ? '#e9defc' : '#ffe9a8'); } c.globalAlpha = 1; if (anim.k === 'ground') for (let i = 0; i < 4; i++) dot(X(ship.x) - 12 + q() * 24, Y(ship.y) - q() * 6, 1.4, A.yellow); }
    if (on) { boulderArt(X(ship.x + 1.9), Y(ship.y + 0.7), 0.8 * K, '#e7a5a5'); }
    gumdrop(ship.x + (anim && !anim.done && anim.k === 'ground' ? WOBBLE() / K : 0), ship.y, { dmg: dmgNow, legOff: T && anim && !anim.rk });
    pill(on ? 'Gumdrop 6,300 N + boulder 2,100 N' : 'Gumdrop 6,300 N', X(ship.x), Y(ship.y + 6.4), on ? 'bad' : null);
    /* hull meter */
    const hv = anim ? dmgNow : EV.dmg.total; c.fillStyle = 'rgba(18,12,46,.82)'; rr(14, 12, 190, 30, 9); c.fill(); c.font = '700 11px ' + F(); c.fillStyle = A.white; c.textAlign = 'left'; c.fillText('HULL', 24, 31); c.fillStyle = 'rgba(255,255,255,.18)'; rr(62, 21, 96, 12, 6); c.fill();
    c.fillStyle = hv >= GP.wreck ? A.red : hv > 0 ? A.yellow : A.green; rr(62, 21, Math.max(6, 96 * (1 - hv / 100)), 12, 6); c.fill(); c.fillStyle = A.white; c.fillText(Math.round(100 - hv) + '%', 164, 31);
  };
  /* keep the run moving through this art: carry the leg number and what the Gumdrop is on */
  run = function () { const pts = [{ x: EV.ship0.x, y: EV.ship0.y, rk: true, k: 'nudge', li: 0 }], T = EV.torn; EV.legs.forEach(l => l.path.forEach((q, j) => pts.push({ x: q.x, y: q.y, k: q.k, li: l.i, rk: !T || l.i < T.leg || (l.i === T.leg && j < T.idx) }))); if (pts.length < 2) return;
    const lens = [0]; for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)); const total = lens[lens.length - 1], dur = clamp(total / 9, 3, 12) * 1000, t0 = performance.now(), me = anim = { pos: pts[0], rk: true, k: 'nudge', li: 0, u: 0 };
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = now => { if (anim !== me) return; const u = still ? 1 : Math.min(1, (now - t0) / dur), d = u * total; let i = 1; while (i < pts.length - 1 && lens[i] < d) i++; const f = lens[i] === lens[i - 1] ? 1 : (d - lens[i - 1]) / (lens[i] - lens[i - 1]);
      Object.assign(me, { pos: { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f }, rk: pts[i].rk, k: pts[i].k, li: pts[i].li, u, done: u >= 1 }); draw();
      if (u < 1) requestAnimationFrame(tick); else setTimeout(() => { if (anim === me) { anim = null; draw(); } }, 2600); };
    requestAnimationFrame(tick); };
  document.querySelector('h1').textContent = 'Rescue art sample'; document.querySelector('.sub').textContent = 'The same board and the same pulling rules, drawn in the style I am proposing for the rescue and the Workshop. Build something, then press Run it.';
  document.querySelectorAll('#tray button').forEach(b => { if (b.classList.contains('go')) { const n = b.cloneNode(true); b.replaceWith(n); n.addEventListener('click', () => run()); } });
  P = [mk('blever', { x: 19, arm: 1 }), mk('dyn', { x: 68, big: true }), mk('crane', { x: 14, rise: 4, across: 2.5, roped: true, ropes: 4, w1: 7, w2: 4 }), mk('platform', { x: 16.5, size: 'M', h: 4 }), mk('ramp', { fx: 17.5, hx: 39, roped: true, ropes: 4, w1: 7, w2: 0 }), mk('ramp', { fx: 40.76, hx: 64, roped: true, ropes: 4, w1: 7, w2: 0 })]; refresh(true);
})();
