/* ===== Chapter 5: the Drop Zone scene, live free-body diagrams, readouts and graphs (drawing only; the physics is in 46-dropzone.js) ===== */
const DZ_LANECOL = () => [C.left, C.right];
const DZ_SKY = {
  earth: { top: '#74bde9', bot: '#d6eefb', gnd: '#86bf72', gnd2: '#72ab60' },
  moon: { top: '#04060b', bot: '#0c101a', gnd: '#a6abb1', gnd2: '#8d939a' },
  mars: { top: '#c47a50', bot: '#eebd88', gnd: '#b4533a', gnd2: '#9b442e' },
  venus: { top: '#d6a42a', bot: '#f1d886', gnd: '#8c5b2b', gnd2: '#744a22' },
  titan: { top: '#c46f27', bot: '#e8b16c', gnd: '#c3d1d7', gnd2: '#aebec6' },
  jupiter: { top: '#d2a47c', bot: '#efd6b4', gnd: '#8f9aa1', gnd2: '#79858c' }
};
const dzHash = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const dzStars = Array.from({ length: 60 }, (_, i) => [dzHash(i, 1), dzHash(i, 2), 0.7 + dzHash(i, 3) * 1.4]);

/* ---------- the objects ---------- */
function dzFeather(c, x, by, s) {
  c.save(); c.translate(x, by - 8 * s); c.rotate(-0.28); c.scale(s, s); c.lineCap = 'round';
  c.fillStyle = '#f6f1e6'; c.strokeStyle = '#bdb4a2'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(-30, 0); c.bezierCurveTo(-14, -15, 14, -15, 31, -1); c.bezierCurveTo(14, 11, -14, 11, -30, 0); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#a49b88'; c.lineWidth = 2; c.beginPath(); c.moveTo(-36, 3); c.lineTo(31, -1); c.stroke();
  c.strokeStyle = '#d9d0bd'; c.lineWidth = 1; for (let i = -22; i <= 20; i += 7) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 6, -7); c.moveTo(i, 0); c.lineTo(i + 6, 6); c.stroke(); }
  c.restore(); return 16 * s;
}
function dzBall(c, x, by, s) {
  const r = 17 * s, cy = by - r; c.save(); c.fillStyle = '#e4772c'; c.beginPath(); c.arc(x, cy, r, 0, 7); c.fill();
  c.strokeStyle = '#5a2a10'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, cy - r); c.lineTo(x, cy + r); c.moveTo(x - r, cy); c.lineTo(x + r, cy);
  c.moveTo(x - r * .7, cy - r * .7); c.quadraticCurveTo(x - r * .1, cy, x - r * .7, cy + r * .7); c.moveTo(x + r * .7, cy - r * .7); c.quadraticCurveTo(x + r * .1, cy, x + r * .7, cy + r * .7); c.stroke(); c.restore(); return r * 2;
}
function dzCrate(c, x, by, s) {
  const w = 46 * s, hh = 38 * s; c.save(); c.fillStyle = C.crate; c.strokeStyle = C['crate-edge']; c.lineWidth = 3; c.lineJoin = 'round';
  c.beginPath(); c.roundRect(x - w / 2, by - hh, w, hh, 4); c.fill(); c.stroke(); c.lineWidth = 2.2; c.beginPath(); c.moveTo(x - w / 2 + 4, by - hh + 4); c.lineTo(x + w / 2 - 4, by - 4); c.moveTo(x + w / 2 - 4, by - hh + 4); c.lineTo(x - w / 2 + 4, by - 4); c.stroke(); c.restore(); return hh;
}
function dzDiver(c, x, by, s, hang) {
  c.save(); c.translate(x, by); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  const suit = '#c94a34', skin = '#e6b48a', helm = '#e3a51c';
  c.strokeStyle = suit; c.lineWidth = 7;
  if (hang) { c.beginPath(); c.moveTo(-5, -36); c.lineTo(-11, -58); c.moveTo(5, -36); c.lineTo(11, -58); c.stroke(); c.beginPath(); c.moveTo(-3, -22); c.lineTo(-6, -2); c.moveTo(3, -22); c.lineTo(6, -2); c.stroke(); }
  else { c.beginPath(); c.moveTo(-5, -38); c.lineTo(-26, -46); c.moveTo(5, -38); c.lineTo(26, -46); c.stroke(); c.beginPath(); c.moveTo(-3, -22); c.lineTo(-14, -2); c.moveTo(3, -22); c.lineTo(14, -2); c.stroke(); }
  c.fillStyle = suit; c.beginPath(); c.roundRect(-8, -42, 16, 24, 6); c.fill();
  c.fillStyle = helm; c.beginPath(); c.arc(0, -50, 8, 0, 7); c.fill(); c.fillStyle = skin; c.beginPath(); c.arc(0, -49, 5, 0, 7); c.fill();
  c.restore(); return 60 * s;
}
/* the canopy: a dome with stripes, lines down to the object's top (tx, ty). fr = how open it is (0 to 1) */
function dzCanopy(c, tx, ty, name, fr) {
  const k = sstep(clamp(fr, 0, 1)), w = DZ_CANW[name] * (0.14 + 0.86 * k), hgt = w * (0.34 + 0.1 * k), top = ty - 26 - 38 * (0.5 + 0.5 * k);
  c.save(); c.lineJoin = 'round'; c.strokeStyle = 'rgba(40,50,60,.65)'; c.lineWidth = 1.2;
  [-1, -0.5, 0, 0.5, 1].forEach(u => { c.beginPath(); c.moveTo(tx + u * w / 2, top); c.lineTo(tx, ty); c.stroke(); });
  c.beginPath(); c.moveTo(tx - w / 2, top); c.quadraticCurveTo(tx, top - hgt * 2, tx + w / 2, top); c.quadraticCurveTo(tx, top + hgt * 0.35, tx - w / 2, top); c.closePath(); c.save(); c.clip();
  c.fillStyle = '#e3a51c'; c.fillRect(tx - w, top - hgt * 2, w * 2, hgt * 3);
  c.fillStyle = '#c94a34'; for (let i = -2; i <= 2; i += 2) c.fillRect(tx + (i - 0.5) * w / 5, top - hgt * 2, w / 5, hgt * 3); c.restore();
  c.beginPath(); c.moveTo(tx - w / 2, top); c.quadraticCurveTo(tx, top - hgt * 2, tx + w / 2, top); c.stroke(); c.restore();
}
/* draw the object with its base at (x, by); returns its height. v = the lane's view of the moment (for the canopy) */
function dzObject(c, L, v, x, by, s, packed) {
  const k = dzCoef(L); let hgt;
  if (L.obj === 'feather') hgt = dzFeather(c, x, by, s);
  else if (L.obj === 'basketball') hgt = dzBall(c, x, by, s);
  else if (L.obj === 'crate') hgt = dzCrate(c, x, by, s);
  else hgt = dzDiver(c, x, by, s, k.has && v.opened != null);
  if (k.has) {
    if (v.opened != null) dzCanopy(c, x, by - hgt * (L.obj === 'para' ? 0.8 : 0.9), L.canopy, v.fr);
    else if (packed !== false) { c.save(); c.fillStyle = '#7a5426'; c.beginPath(); c.roundRect(x - 9 * s, by - hgt - 7 * s, 18 * s, 8 * s, 2); c.fill(); c.restore(); }
  }
  return hgt;
}
function dzHeli(c, x, y, tt) {
  c.save(); c.translate(x, y); c.lineCap = 'round'; c.lineJoin = 'round';
  c.fillStyle = '#e3a51c'; c.beginPath(); c.roundRect(-36, -16, 70, 32, 15); c.fill();
  c.fillRect(30, -9, 52, 8); c.fillStyle = '#13212a'; c.fillRect(78, -22, 4, 22); c.fillStyle = '#9fd0ea'; c.beginPath(); c.roundRect(-30, -11, 26, 17, 7); c.fill();
  c.strokeStyle = '#13212a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, -16); c.lineTo(-14, -24); c.stroke();
  const bl = RMOTION ? 58 : 58 * Math.abs(Math.cos(tt * 26)) + 8; c.lineWidth = 4; c.beginPath(); c.moveTo(-14 - bl, -25); c.lineTo(-14 + bl, -25); c.stroke();
  c.lineWidth = 3; c.beginPath(); c.moveTo(-34, 24); c.lineTo(30, 24); c.moveTo(-20, 16); c.lineTo(-20, 24); c.moveTo(16, 16); c.lineTo(16, 24); c.stroke(); c.restore();
}


/* motion blur for the background: the same drawing three times, the two ghost copies shifted up and down, more as the object speeds up */
function dzBlur(c, b, draw) {
  if (b < 1) { draw(); return; }
  const m = c.globalAlpha; c.globalAlpha = m * (1 - 0.45 * Math.min(1, b / 10)); draw();
  c.globalAlpha = m * 0.3; c.save(); c.translate(0, -b); draw(); c.restore(); c.save(); c.translate(0, b); draw(); c.restore(); c.globalAlpha = m;
}
/* how far the helicopter has climbed since it let go: its lift stays the same but the load's weight is gone, so the resultant is the load's weight, upwards (same drag law as the hover pad) */
function dzHeliRise(L, t) {
  if (!L.started || t <= 0) return 0;
  const m = DZ_OBJ[L.obj].m, g = dzWorld(L).g, a0 = m * g / HE_M, f = dzFactor(L);
  if (f <= 0) return 0.5 * a0 * t * t;
  const vt = Math.sqrt(m * g / (HE_K * f)), x = a0 * t / vt;
  return vt * vt / a0 * (x + Math.log1p(Math.exp(-2 * x)) - Math.LN2);
}
/* things the object falls past, fixed at real heights so they slide by at the right speed: birds, skyscrapers, flood lights and crates on the floor */
const DZ_TOWERS = [[.04, .11, 150], [.3, .1, 205], [.57, .12, 120]];   // [position across, width, roof height in m]
function dzTowers(c, bx, bw, scr, gy, lo, hi) {
  DZ_TOWERS.forEach(([u, ww, top], k) => {
    const x = bx + u * bw, w = Math.max(24, ww * bw), y0 = scr(top); if (y0 > DZ_H || gy < 0) return;
    c.fillStyle = k % 2 ? '#8fa9be' : '#7f9bb2'; c.fillRect(x, y0, w, gy - y0); c.fillStyle = '#a3bacc'; c.fillRect(x, y0, w, 4); c.fillStyle = '#6d879c'; c.fillRect(x + w / 2 - 1.5, y0 - 14, 3, 14);
    const rows = Math.floor(top / 7), cols = Math.max(2, Math.floor(w / 9));
    for (let r = 1; r < rows; r++) { const ry = scr(r * 7); if (ry < -10 || ry > DZ_H) continue; for (let q = 0; q < cols; q++) { c.fillStyle = dzHash(r * 9 + k, q + 3) > .55 ? 'rgba(255,240,180,.8)' : 'rgba(55,80,104,.4)'; c.fillRect(x + 4 + q * ((w - 8) / cols), ry - 14, ((w - 8) / cols) - 3, 9); } }
  });
}
function dzBirds(c, bx, bw, scr, lo, hi, tt) {
  const sp = 110, i0 = Math.max(0, Math.floor(lo / sp)), i1 = Math.min(Math.ceil(hi / sp), 4);
  for (let i = i0; i <= i1; i++) {
    const a = i * sp + 40 + dzHash(i, 41) * 40, y = scr(a), dir = dzHash(i, 42) > .5 ? 1 : -1, x = bx + ((dzHash(i, 43) + dir * (RMOTION ? 0 : tt * 0.02)) % 1 + 1) % 1 * bw, fl = RMOTION ? 0.3 : Math.sin(tt * 9 + i * 2);
    if (y < -20 || y > DZ_H) continue;
    c.save(); c.translate(x, y); c.scale(dir, 1); c.strokeStyle = '#2d3b48'; c.lineWidth = 2.4; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-13, -4 - 6 * fl); c.quadraticCurveTo(-6, -8 - 5 * fl, 0, 0); c.quadraticCurveTo(6, -8 - 5 * fl, 13, -4 - 6 * fl); c.stroke(); c.fillStyle = '#2d3b48'; c.beginPath(); c.arc(0, 0, 2.6, 0, 7); c.fill(); c.restore();
  }
}
function dzFloods(c, x0, two, scr, gy) {
  (two ? [58, 200] : [58, 250]).forEach(dx => {
    const x = x0 + dx, top = scr(24); if (top > DZ_H) return;
    c.strokeStyle = '#4b5560'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, top); c.stroke();
    c.fillStyle = '#3a4650'; c.fillRect(x - 17, top - 9, 34, 10); c.fillStyle = '#fff6c4'; [-11, 0, 11].forEach(d => { c.beginPath(); c.arc(x + d, top - 4, 3.6, 0, 7); c.fill(); });
    c.fillStyle = 'rgba(255,246,196,.16)'; c.beginPath(); c.moveTo(x - 15, top + 1); c.lineTo(x + 15, top + 1); c.lineTo(x + 46, gy); c.lineTo(x - 46, gy); c.closePath(); c.fill();
  });
}
function dzFloorCrates(c, x0, two, gy) {
  (two ? [[84, 2], [112, 1]] : [[96, 3], [176, 2]]).forEach(([dx, n]) => { const x = x0 + dx; for (let r = 0; r < n; r++) for (let q = 0; q < n - r; q++) dzCrate(c, x + (q - (n - r - 1) / 2) * 33, gy + 2 - r * 27, 0.7); });
}

/* a small rounded note that wraps its text to fit (state and landing messages) */
function dzNote(c, text, cx, y, col, maxW, size = 13) {
  c.font = `700 ${size}px ${C.fn}`; const words = text.split(' '), lines = []; let cur = '';
  words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (cur && c.measureText(t).width > maxW - 16) { lines.push(cur); cur = w; } else cur = t; }); lines.push(cur);
  const w = Math.min(maxW, Math.max(...lines.map(l => c.measureText(l).width)) + 18), hh = lines.length * (size + 4) + 8;
  c.fillStyle = C.panel; c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.roundRect(cx - w / 2, y, w, hh, 8); c.fill(); c.stroke();
  lines.forEach((l, i) => txt(c, l, cx, y + 8 + (size + 4) * i + (size + 4) / 2 - 1, C.ink, `700 ${size}px ${C.fn}`));
}
/* ---------- one lane ---------- */
const DZ_STEPS = [20, 50, 100, 200, 500, 1000];
function dzLane(c, L, idx, x0, w, tt) {
  const v = dzAt(L), W = DZ.two ? 450 : 900, two = DZ.two, sky = DZ_SKY[L.world], hgtObj = L.obj === 'para' ? 60 : L.obj === 'crate' ? 38 : L.obj === 'basketball' ? 34 : 16;
  const alt = Math.max(0, v.y), camMin = (DZ_GY - DZ_REFY) / DZ_SC, cam = Math.max(alt, camMin), scr = a => DZ_REFY + (cam - a) * DZ_SC;
  c.save(); c.beginPath(); c.rect(x0, 0, w, DZ_H); c.clip();
  /* sky */
  const g = c.createLinearGradient(0, 0, 0, DZ_H); g.addColorStop(0, sky.top); g.addColorStop(1, sky.bot); c.fillStyle = g; c.fillRect(x0, 0, w, DZ_H);
  if (L.world === 'moon' || (L.world === 'mars' && cam > 800)) { c.fillStyle = '#fff'; dzStars.forEach(([a, b, r], i) => { c.globalAlpha = L.world === 'moon' ? 0.85 : 0.5; c.beginPath(); c.arc(x0 + a * w, b * (DZ_H - 50), r * .8, 0, 7); c.fill(); }); c.globalAlpha = 1; }
  const lo = cam - (DZ_H - DZ_REFY) / DZ_SC - 10, hi = cam + DZ_REFY / DZ_SC + 10;
  /* speed effects: from about 8 m/s the background blurs and (where there is air) speed lines appear, both growing with the velocity */
  const sfx = !RMOTION && L.started && !v.landed ? clamp((v.v - 8) / 40, 0, 1) : 0, blurPx = sfx * 14, airVis = dzFactor(L) <= 0 ? 0 : Math.min(1, 0.3 + dzFactor(L)), sl = sfx * airVis;
  const bx0 = x0 + 52, bwid = (two ? 216 : 440) - 60;   // the strip of sky that is not behind the free-body diagram
  if (L.world === 'jupiter') {   // banded clouds at fixed altitudes
    const cols = ['#c9915f', '#ead5b6', '#b9784e', '#f1e3c8', '#d8ab7c']; const b0 = Math.floor(lo / 40) - 1, b1 = Math.ceil(hi / 40) + 1;
    for (let i = b0; i <= b1; i++) { c.fillStyle = cols[((i % 5) + 5) % 5]; c.globalAlpha = .75; const y = scr(i * 40); c.fillRect(x0, y, w, 40 * DZ_SC); } c.globalAlpha = 1;
  } else if (L.world !== 'moon') dzBlur(c, blurPx, () => {   // cloud puffs, haze streaks or dust that slide past as you fall
    const sp = L.world === 'earth' ? 45 : 60, i0 = Math.floor(lo / sp), i1 = Math.ceil(hi / sp);
    for (let i = i0; i <= i1; i++) {
      const cx = x0 + 40 + dzHash(i, 5) * (w - 80), cy = scr(i * sp + dzHash(i, 6) * sp), r = 16 + dzHash(i, 7) * 22;
      if (L.world === 'earth') { c.fillStyle = 'rgba(255,255,255,.88)'; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.arc(cx + r * .9, cy + 4, r * .75, 0, 7); c.arc(cx - r * .9, cy + 5, r * .65, 0, 7); c.fill(); }
      else { c.fillStyle = L.world === 'venus' ? 'rgba(255,238,170,.42)' : L.world === 'titan' ? 'rgba(255,214,150,.36)' : 'rgba(255,225,190,.3)'; c.beginPath(); c.roundRect(cx - r * 1.6, cy - 5, r * 3.2, 11, 6); c.fill(); }
    }
  });
  /* ground, or the cloud-top platform */
  const gy = scr(0);
  if (gy > 0) dzBlur(c, blurPx, () => {   // the things the object drops past (they blur with the clouds)
    if (L.world === 'earth') { dzBirds(c, bx0, bwid, scr, lo, hi, tt); dzTowers(c, bx0, bwid, scr, gy, lo, hi); }
    if (gy < DZ_H + 80) dzFloods(c, x0, two, scr, gy);
  });
  if (gy < DZ_H) {
    if (L.world === 'jupiter') {
      c.fillStyle = '#b9784e'; c.fillRect(x0, gy + 14, w, DZ_H); c.fillStyle = '#ead5b6'; c.fillRect(x0, gy + 40, w, 18);
      c.fillStyle = '#79858c'; c.fillRect(x0 + 40, gy, w - 80, 14); c.fillStyle = '#5d686f'; for (let q = 0; q < 6; q++) c.fillRect(x0 + 60 + q * (w - 120) / 5, gy + 14, 8, 26);
    } else {
      c.fillStyle = sky.gnd; c.fillRect(x0, gy, w, DZ_H - gy + 2); c.fillStyle = sky.gnd2; c.fillRect(x0, gy + 8, w, 5);
      if (L.world === 'moon') { c.fillStyle = '#8d939a'; [[.12, 20, 9], [.55, 34, 12], [.82, 14, 7]].forEach(([a, d, r]) => { c.beginPath(); c.ellipse(x0 + a * w, gy + d, r * 1.6, r * .45, 0, 0, 7); c.fill(); }); }
      c.fillStyle = '#5b6164'; c.beginPath(); c.roundRect(x0 + (two ? 70 : 280), gy - 3, two ? 150 : 150, 10, 4); c.fill(); c.fillStyle = '#f3d66a'; for (let q = 0; q < 6; q++) c.fillRect(x0 + (two ? 70 : 280) + 10 + q * 24, gy + 0.5, 12, 3);
    }
  }
  if (gy < DZ_H && L.world !== 'jupiter') dzBlur(c, blurPx * 0.6, () => dzFloorCrates(c, x0, two, gy));
  /* speed lines: they sit at fixed heights in the air, so they slide up past the object, and they get longer and more numerous the faster it goes */
  if (sl > 0.03) {
    const sp = 12, i0 = Math.floor(lo / sp), i1 = Math.ceil(hi / sp), ln = clamp(v.v * 1.6, 10, 150); c.save(); c.lineCap = 'round';
    for (let i = i0; i <= i1; i++) for (let k = 0; k < 3; k++) {
      if (dzHash(i, 30 + k) > 0.12 + 0.88 * sl) continue;
      const x = bx0 + dzHash(i, 33 + k) * (w - 60), y = scr(i * sp + dzHash(i, 36 + k) * sp), len = ln * (0.55 + 0.45 * dzHash(i, 39 + k)); if (y > gy) continue;
      c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,255,255,' + (0.28 + 0.3 * sl) + ')'; c.beginPath(); c.moveTo(x, y - len / 2); c.lineTo(x, y + len / 2); c.stroke();
      c.lineWidth = 3.5; c.strokeStyle = 'rgba(255,255,255,' + (0.4 + 0.5 * sl) + ')'; c.beginPath(); c.moveTo(x, y - len * 0.2); c.lineTo(x, y + len * 0.2); c.stroke();
    }
    c.restore();
  }
  /* altitude scale */
  c.fillStyle = C.panel; c.globalAlpha = .86; c.fillRect(x0, 0, 46, DZ_H); c.globalAlpha = 1; c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(x0 + 46.5, 0); c.lineTo(x0 + 46.5, DZ_H); c.stroke();
  const ds = DZ_STEPS.find(d => d * DZ_SC >= 44) || 1000, a0 = Math.max(0, Math.floor(lo / ds) * ds);
  c.font = `600 11px ${C.fn}`; c.textAlign = 'right'; c.textBaseline = 'middle';
  for (let a = a0; a <= hi + ds; a += ds) { const y = scr(a); if (y < 4 || y > DZ_H - 18) continue; c.strokeStyle = C.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0 + 46, y); c.lineTo(x0 + 36, y); c.stroke(); c.fillStyle = C.ink; c.fillText(a >= 1000 ? Math.round(a).toLocaleString('en-GB') : String(a), x0 + 33, y); }
  txt(c, 'metres', x0 + 23, DZ_H - 12, C.muted, `600 10px ${C.fn}`);
  /* the helicopter hangs at the drop height (it scrolls away when the camera follows the object) */
  const ox = x0 + (two ? 132 : 330), objY = scr(alt);
  const hy = scr(DZ.height + dzHeliRise(L, v.t)) - 62 - hgtObj; if (hy > -50) { dzHeli(c, ox + 6, hy, tt); if (!L.started) { c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(ox, hy + 24); c.lineTo(ox, objY - hgtObj - (dzCoef(L).has ? 8 : 0)); c.stroke(); } }
  /* the object (it bounces or rolls when it lands) */
  let ay = objY, tilt = 0;
  if (L.landed) {
    const since = (performance.now() - L.landReal) / 1000, lv = L.landV || 0;
    if (L.obj === 'crate' && lv > 7 && !RMOTION) ay -= Math.abs(Math.sin(since * 7)) * Math.max(0, 1 - since * 1.6) * Math.min(34, lv * 1.3);
    if (L.obj === 'para' && lv > 7) tilt = Math.min(1.5, since * 6);
    if (lv > 7 && since < 1.2 && !RMOTION) { c.save(); c.fillStyle = 'rgba(235,225,205,.8)'; for (let q = 0; q < 6; q++) { const u = since / 1.2, px = ox + (q - 2.5) * 16 * (0.6 + u), r = 6 + u * 14; c.globalAlpha = (1 - u) * .8; c.beginPath(); c.arc(px, objY - r * .4, r, 0, 7); c.fill(); } c.restore(); }
  }
  c.save(); if (tilt) { c.translate(ox, ay); c.rotate(tilt); c.translate(-ox, -ay); }
  dzObject(c, L, v, ox, ay, 1);
  c.restore();
  if (v.opened == null || !dzCoef(L).has) pill(c, `${fmt(DZ_OBJ[L.obj].m, 3)} kg`, ox, ay - hgtObj - 16, C.ink, 12);
  /* landing and state messages (they sit to the left of the diagram) */
  const mk = dzMasked(L), nx = x0 + 46 + (two ? 86 : 200), nw = two ? 164 : 380;
  if (L.landed) { const lv = L.landV, msg = lv < 7 ? 'Soft landing!' : lv <= 15 ? 'Bump! A bit fast.' : 'Thud! Far too fast for a safe landing.', col = lv < 7 ? C.good : lv <= 15 ? C.hazard : C.bad; dzNote(c, msg + (mk.has('readV') ? '' : ` (${dz1(lv)} m/s)`), nx, 92, col, nw, 14); }
  else if (L.started && v.opened != null && v.fr < 1) dzNote(c, 'Canopy opening…', nx, 92, C.hazard, nw);
  else if (L.started && Math.abs(v.R) <= 0.01 * v.W && v.t > 0.2) dzNote(c, 'Terminal velocity!', nx, 92, C.good, nw, 14);
  /* the live free-body diagram */
  if (LAB.show.has('dfbd')) dzFBD(c, L, v, x0, w, mk);
  /* headings */
  hudBox(c, `${two ? L.id + ' · ' : ''}${fmt(Math.round(v.t * 10) / 10, 1)} s${S.warp > 1 && S.running ? ' (fast-forward)' : ''}`, x0 + 54, 22, DZ_LANECOL()[idx], 'left');
  hudBox(c, `${DZ_WORLDS[L.world].name} · ${DZ_OBJ[L.obj].name}`, x0 + w - 8, 22, C.line, 'right');
  c.restore();
}

/* the free-body diagram beside the object: weight down, air resistance up, dashed resultant. Arrows start at the centre of the object. */
function dzFBD(c, L, v, x0, w, mk) {
  const two = DZ.two, px = x0 + (two ? 216 : 440), pw = w - (two ? 224 : 450), fcx = px + pw / 2 - 6, fcy = 372, kw = 56 / v.W, CAP = 224;
  c.save(); c.fillStyle = C.panel; c.globalAlpha = .93; c.beginPath(); c.roundRect(px, 86, pw, DZ_H - 96, 10); c.fill(); c.globalAlpha = 1; c.strokeStyle = C.line; c.lineWidth = 1.5; c.stroke();
  txt(c, 'Free-body diagram', px + 10, 99, C.muted, `700 12px ${C.fb}`, 'left');
  /* the real object, small, behind the arrows */
  c.save(); c.globalAlpha = .9; const ic = Object.assign({}, v); dzObject(c, L, ic, fcx, fcy + 18, 0.7, false); c.restore();
  const lab = (l1, l2, x, y, col) => { c.font = `700 11px ${C.fn}`; const ww = Math.max(c.measureText(l1).width, c.measureText(l2).width) + 8, xx = clamp(x, px + ww / 2 + 3, px + pw - ww / 2 - 3); c.fillStyle = C.panel; c.fillRect(xx - ww / 2, y - 14, ww, 28); txt(c, l1, xx, y - 6, col, `600 11px ${C.fn}`); txt(c, l2, xx, y + 6.5, col, `800 12px ${C.fn}`); };
  const brk = (x, y) => { c.save(); c.fillStyle = C.panel; c.fillRect(x - 9, y - 5, 18, 10); c.strokeStyle = C.vert; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 8, y - 1); c.lineTo(x + 8, y - 6); c.moveTo(x - 8, y + 6); c.lineTo(x + 8, y + 1); c.stroke(); c.restore(); };
  const wx = fcx - 12, ax = fcx + 12, rx = fcx + 52;
  arrow(c, wx, fcy, wx, fcy + 56, C.vert, 4);
  lab('weight', mk.has('fbdW') ? '? N' : dzN(v.W), wx - 6, fcy + 56 + 22, C.vert);
  const dl = v.D * kw;
  if (!L.started) { arrow(c, ax, fcy, ax, fcy - 56, C.vert, 4); lab('rope pulls up', mk.has('fbdW') ? '? N' : dzN(v.W), ax + 18, fcy - 56 - 22, C.vert); lab('air resistance', '0 N', ax + 44, fcy - 22, C.res); }
  else if (dl > 3) { const L2 = Math.min(dl, CAP); arrow(c, ax, fcy, ax, fcy - L2, C.res, 4); if (dl > CAP) brk(ax, fcy - 30 - (L2 - 30) / 2); if (fcy - L2 - 22 < 112) lab('air resistance', dzN(v.D), ax + 56, fcy - L2 + 18, C.res); else lab('air resistance', dzN(v.D), ax + 8, fcy - L2 - 22, C.res); }
  else lab('air resistance', '0 N', ax + 22, fcy - 30, C.res);
  if (!mk.has('fbdR')) {
    const bal = Math.abs(v.R) <= 0.01 * v.W, rl = Math.abs(v.R) * kw, down = v.R >= 0;
    if (bal) lab('resultant', '0 N', rx, fcy + 22, C.fric);
    else { const L2 = Math.min(rl, CAP); c.save(); c.strokeStyle = C.fric; arrow(c, rx, fcy, rx, down ? fcy + L2 : fcy - L2, C.fric, 4, true); c.restore(); if (rl > CAP) brk(rx, down ? fcy + 20 + (L2 - 20) / 2 : fcy - 20 - (L2 - 20) / 2); lab('resultant', dzN(v.R) + (down ? ' ↓' : ' ↑'), rx, down ? fcy + L2 + 22 : (fcy - L2 - 22 < 112 ? fcy - L2 + 18 : fcy - L2 - 22), C.fric); }
  } else lab('resultant', '? N', rx, fcy + 22, C.fric);
  
  c.restore();
}

/* ---------- the whole scene ---------- */
function drawDropScene(c) {
  const tt = performance.now() / 1000, two = DZ.two, lanes = dzActive();
  lanes.forEach((L, i) => dzLane(c, L, i, two ? i * 450 : 0, two ? 450 : 900, tt));
  if (two) {   // the divider and the race track between the lanes
    c.fillStyle = C.panel; c.fillRect(446, 0, 8, DZ_H); c.strokeStyle = C.line; c.lineWidth = 1.5; c.beginPath(); c.moveTo(446, 0); c.lineTo(446, DZ_H); c.moveTo(454, 0); c.lineTo(454, DZ_H); c.stroke();
    c.fillStyle = C.chip; c.fillRect(442, 56, 16, DZ_H - 100); c.strokeStyle = C.line; c.strokeRect(442.5, 56.5, 15, DZ_H - 101);
    lanes.forEach((L, i) => { const v = dzAt(L), f = clamp(1 - Math.max(0, v.y) / DZ.height, 0, 1), y = 62 + f * (DZ_H - 112); c.fillStyle = DZ_LANECOL()[i]; c.beginPath(); c.arc(450, y, 6, 0, 7); c.fill(); });
    txt(c, 'RACE', 450, 46, C.muted, `800 10px ${C.fd}`);
  }
  if (DZ.paused) { const t = dzViewT(), m = `Paused at ${fmt(Math.round(t * 10) / 10, 1)} s`, late = t < dzLatest() - 1e-9 ? ` · the run reached ${fmt(Math.round(dzLatest() * 10) / 10, 1)} s` : ''; c.font = `800 17px ${C.fb}`; const ww = Math.min(880, c.measureText(m + late).width + 40); c.fillStyle = C.hazard; c.beginPath(); c.roundRect(450 - ww / 2, 48, ww, 34, 9); c.fill(); txt(c, m + late, 450, 65.5, '#1b1404', `800 17px ${C.fb}`); }
  else if (!DZ.started) dzActive().forEach((L, i) => dzNote(c, LAB.idle || 'Choose the set-up, then press Drop!', (two ? i * 450 : 0) + 46 + (two ? 86 : 200), DZ_H - 78, C.line, two ? 164 : 360, 14));
  dzGraphs(); dzReadouts();
}

/* ---------- readouts ---------- */
function dzReadouts() {
  const el = $('#dreads'); if (!el || el.hidden) return;
  const keys = ['readH', 'readV', 'readA', 'readT'].filter(k => LAB.show.has(k)), sig = keys.join() + DZ.two + dzActive().map(L => L.id + L.obj + L.world).join();
  if (el.dataset.sig !== sig) {
    el.dataset.sig = sig; const lab = { readH: 'Height', readV: 'Velocity (downwards)', readA: 'Acceleration', readT: 'Time' }, tip = { readH: 'height', readV: 'velocity', readA: 'acceleration', readT: '' };
    el.innerHTML = dzActive().map((L, i) => `<div class="dlane"><div class="dlh" style="color:${DZ_LANECOL()[i]}">${DZ.two ? 'Lane ' + L.id + ': ' : ''}${DZ_OBJ[L.obj].name} · ${DZ_WORLDS[L.world].name}</div><div class="dgrid">${keys.map(k => `<div class="rd" data-panel="${k}"><div class="lbl">${tip[k] ? `<button type="button" class="term tl" data-t="${tip[k]}">${lab[k]}</button>` : lab[k]}</div><div class="v" id="dz-${L.id}-${k}"></div></div>`).join('')}</div></div>`).join('');
  }
  const mk = dzMasked();
  dzActive().forEach(L => {
    const v = dzAt(L), up = v.a < -0.005, set = (k, s) => { const e = document.getElementById(`dz-${L.id}-${k}`); if (e && e.textContent !== s) e.textContent = s; };
    set('readH', fmt(Math.max(0, v.y), 0) + ' m'); set('readT', fmt(Math.round(v.t * 10) / 10, 1) + ' s');
    set('readV', mk.has('readV') ? '? (work it out first)' : dz1(v.v) + ' m/s ↓'); set('readA', mk.has('readA') ? '? (work it out first)' : (Math.abs(v.a) < 0.005 ? '0 m/s²' : fmt(Math.abs(v.a), 2) + ' m/s² ' + (up ? '↑' : '↓')));
  });
}

/* ---------- velocity–time graph and force–time strip ---------- */
function dzSeries(L) { const hs = L.hist.map(h => [h.t, h.v, h.W, h.D, h.R]); if (!L.landed) { const v = dzAt(L); if (!DZ.paused || DZ.viewT >= L.t) hs.push([L.t, L.v, L.W, L.D, L.R]); } return DZ.paused ? hs.filter(h => h[0] <= DZ.viewT + 1e-9) : hs; }
function dzGraphs() {
  const lanes = dzActive(), ser = lanes.map(dzSeries);
  const cv = $('#cvDVT'); if (cv && cv.offsetParent) {
    const W = 900, H = 240, c = fit(cv, W, H), x0 = 64, x1 = W - 18, y0 = 14, y1 = H - 40; c.fillStyle = C.panel; c.fillRect(0, 0, W, H);
    let vmax = 1, tEnd = 0; ser.forEach(s => s.forEach(([t, v]) => { vmax = Math.max(vmax, v); tEnd = Math.max(tEnd, t); }));
    const top = niceUp(vmax * 1.1), tMax = Math.max(10, Math.ceil(tEnd / 5) * 5 + (tEnd % 5 > 3.5 ? 5 : 0)), ts = tMax <= 12 ? 1 : tMax <= 30 ? 5 : tMax <= 80 ? 10 : tMax <= 200 ? 20 : 50, vs = top <= 2 ? .25 : top <= 5 ? 1 : top <= 12 ? 2 : top <= 30 ? 5 : top <= 60 ? 10 : top <= 120 ? 20 : top <= 300 ? 50 : 100;
    const X = t => x0 + t / tMax * (x1 - x0), Y = v => y1 - v / top * (y1 - y0);
    c.lineWidth = 1; c.strokeStyle = C.grid; for (let v = 0; v <= top + 1e-9; v += vs) { c.beginPath(); c.moveTo(x0, Y(v)); c.lineTo(x1, Y(v)); c.stroke(); txt(c, String(+v.toFixed(2)), x0 - 8, Y(v), C.muted, `600 12px ${C.fn}`, 'right'); }
    for (let t = 0; t <= tMax + 1e-9; t += ts) { c.beginPath(); c.moveTo(X(t), y0); c.lineTo(X(t), y1); c.stroke(); txt(c, String(t), X(t), y1 + 13, C.muted, `600 12px ${C.fn}`); }
    c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y1); c.lineTo(x1, y1); c.stroke();
    txt(c, 'Time (s)', (x0 + x1) / 2, H - 9, C.ink, `700 13px ${C.fb}`); c.save(); c.translate(16, (y0 + y1) / 2); c.rotate(-Math.PI / 2); txt(c, 'Velocity (m/s)', 0, 0, C.ink, `700 13px ${C.fb}`); c.restore();
    if (!ser.some(s => s.length > 1)) txt(c, 'The graph draws itself when you press Drop!', (x0 + x1) / 2, (y0 + y1) / 2, C.muted, `600 15px ${C.fb}`);
    ser.forEach((s, i) => { if (s.length < 1) return; c.strokeStyle = DZ_LANECOL()[i]; c.lineWidth = 3.5; c.lineJoin = 'round'; c.beginPath(); const st = Math.max(1, Math.floor(s.length / 700)); s.forEach(([t, v], k) => { if (k % st && k < s.length - 1) return; k ? c.lineTo(X(t), Y(v)) : c.moveTo(X(t), Y(v)); }); c.stroke(); const l = s[s.length - 1]; c.fillStyle = DZ_LANECOL()[i]; c.beginPath(); c.arc(X(l[0]), Y(l[1]), 5, 0, 7); c.fill(); });
    lanes.forEach((L, i) => { if (L.opened != null && (!DZ.paused || DZ.viewT >= L.opened)) { const bx = X(L.opened); c.save(); c.setLineDash([6, 4]); c.strokeStyle = DZ_LANECOL()[i]; c.lineWidth = 1.8; c.beginPath(); c.moveTo(bx, y0); c.lineTo(bx, y1); c.stroke(); c.restore(); pill(c, 'canopy opened', bx, y0 + 12 + i * 20, DZ_LANECOL()[i], 11); } });
    if (DZ.two) lanes.forEach((L, i) => pill(c, `Lane ${L.id}`, x1 - 40, y0 + 14 + i * 22, DZ_LANECOL()[i], 12));

    // the student's sketch prediction (Predict first), stretched over this run: the "canopy opens" column lands on the moment the canopy really opened
    const ps = typeof CH !== 'undefined' && CH && LAB.mode === 'guided' && predSketch(), P = ps && CHDATA[CH.id].steps[GI].predict;
    if (ps && P && ser[0] && ser[0].length > 1) {
      const n = P.cols, mc = P.marks && P.marks[0] ? P.marks[0].col : null, tOp = lanes[0].opened, pts = ps.map((l, i) => { const t = mc != null && tOp != null ? (i <= mc ? tOp * i / mc : tOp + (tMax - tOp) * (i - mc) / (n - 1 - mc)) : tMax * i / (n - 1); return [X(t), Y(l / P.levels * top)]; });
      c.save(); c.strokeStyle = C.warn || '#e08a1e'; c.lineWidth = 3; c.setLineDash([8, 5]); c.beginPath(); pts.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.setLineDash([]); c.fillStyle = c.strokeStyle; pts.forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 4, 0, 6.3); c.fill(); }); c.restore();
      pill(c, 'Your prediction', x1 - 70, y1 - 16, C.warn || '#e08a1e', 12);
    }
  }
  const cf = $('#cvDFT'); if (cf && cf.offsetParent) {
    const W = 900, H = 200, c = fit(cf, W, H); c.fillStyle = C.panel; c.fillRect(0, 0, W, H);
    lanes.forEach((L, i) => {
      const s = ser[i], bx = DZ.two ? i * 450 : 0, bw = DZ.two ? 450 : 900, x0 = bx + 64, x1 = bx + bw - 18, y0 = 26, y1 = H - 36; let fmax = 0, tEnd = 0; s.forEach(([t, , Wt, D]) => { fmax = Math.max(fmax, Wt, D); tEnd = Math.max(tEnd, t); });
      const tMax = Math.max(10, Math.ceil(tEnd / 5) * 5 + (tEnd % 5 > 3.5 ? 5 : 0)), top = Math.max(1e-6, fmax * 1.1), X = t => x0 + t / tMax * (x1 - x0), Y = f => y1 - f / top * (y1 - y0);
      c.strokeStyle = C.grid; c.lineWidth = 1; [0, .5, 1].forEach(u => { c.beginPath(); c.moveTo(x0, y1 - u * (y1 - y0)); c.lineTo(x1, y1 - u * (y1 - y0)); c.stroke(); txt(c, dzN(top * u).replace(' N', ''), x0 - 6, y1 - u * (y1 - y0), C.muted, `600 11px ${C.fn}`, 'right'); });
      c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y1); c.lineTo(x1, y1); c.stroke(); txt(c, 'Time (s)', (x0 + x1) / 2, H - 9, C.ink, `700 12px ${C.fb}`);
      txt(c, (DZ.two ? `Lane ${L.id}: ` : '') + 'forces (N)', x0 + 4, 12, DZ_LANECOL()[i], `800 12px ${C.fb}`, 'left');
      [[2, C.vert, 'weight', false], [3, C.res, 'air resistance', false]].forEach(([k, col, nm], q) => { if (!s.length) return; c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); const st = Math.max(1, Math.floor(s.length / 600)); s.forEach((h, j) => { if (j % st && j < s.length - 1) return; j ? c.lineTo(X(h[0]), Y(h[k])) : c.moveTo(X(h[0]), Y(h[k])); }); c.stroke(); pill(c, nm, x1 - 60, y0 + 8 + q * 20, col, 11); });
    });
  }
}

/* ---------- info cards for the new panels ---------- */
Object.assign(INFO, {
  dfbd: { title: 'How to read the free-body diagram', cards: [{ hi: '#cvScene', html: `<p>Next to each falling object is its <b>free-body diagram</b>. There are only two forces on it: <b>weight</b> pulls down, and <b>air resistance</b> pushes up.</p><p>Both arrows start at the middle of the object. The dashed arrow is the <b>resultant force</b>: weight minus air resistance. When it points down, the object speeds up. When it is 0 N, the forces are balanced.</p><div class="example">Weight 392 N down, air resistance 311 N up: 392 − 311 = <b>81 N</b> down.</div>` }] },
  dpause: { title: 'How to use the pause tools', cards: [{ hi: '#dzPause', html: `<p>Press <b>⏸ Pause</b> (or the Spacebar) to freeze the drop. A yellow banner shows the time.</p><p>While it is paused, <b>◀ 0.5 s</b> and <b>0.5 s ▶</b> move back and forward through the drop. <b>▶ Play</b> carries on from the time you are looking at.</p><p><b>📸 Snapshot</b> saves the numbers at that moment in your Journal, in the Runs tab.</p>` }] },
  dvt: { title: 'How to read the velocity–time graph', cards: [{ hi: '[data-panel="dvt"]', html: `<p>The graph draws the velocity of each falling object as it falls. <b>Steeper</b> means it is speeding up faster. <b>Flat</b> means the velocity is steady.</p><p>If two lanes are on, lane A is red and lane B is green.</p>` }] },
  dft: { title: 'How to read the force strip', cards: [{ hi: '[data-panel="dft"]', html: `<p>This graph shows the two forces on the falling object over time. The <b>weight</b> line stays flat. The <b>air resistance</b> line starts at 0 N and grows as the object speeds up.</p><p>When the two lines meet, the forces are balanced.</p>` }] },
  dworld: { title: 'Choosing a world', cards: [{ hi: '[data-panel="dworld"]', html: `<p>Each world has its own <b>gravitational field strength</b> (g) and its own air. g tells you the weight of each kilogram in newtons.</p><div class="example">The 40 kg crate has weight 40 × 9.8 = <b>392 N</b> on Earth, but only 40 × 1.6 = <b>64 N</b> on the Moon.</div>` }] },
  dair: { title: 'The air removed slider', cards: [{ hi: '[data-panel="dair"]', html: `<p>This takes air away from the world you chose. <b>0%</b> is all the air. <b>100%</b> is a vacuum, with no air at all, so there is no air resistance.</p>` }] },
  dcanopy: { title: 'Choosing a canopy', cards: [{ hi: '[data-panel="dcanopy"]', html: `<p>A bigger canopy pushes more air out of the way, so the air resistance is bigger. Only the crate and the skydiver can carry one.</p><p>Press <b>Open canopy!</b> during the fall. The canopy takes about 3 seconds to open fully.</p>` }] }
});
