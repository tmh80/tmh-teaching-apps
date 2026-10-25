/* ===== Drawing: arena, pullers, animals, live free-body diagram ===== */
let C = {};
function readColors() {
  const cs = getComputedStyle(document.documentElement);
  for (const k of ['ink', 'muted', 'line', 'panel', 'chip', 'accent', 'hazard', 'left', 'right', 'res', 'fric', 'vert', 'sky', 'stand', 'crowd', 'ice', 'wood', 'concrete', 'speck', 'crate', 'crate-edge', 'rope', 'grid', 'bad', 'good', 'air', 'hazard-soft', 'husky', 'snow', 'snow-shade', 'pine', 'mountain', 'hull'])
    C[k] = cs.getPropertyValue('--' + k).trim();
  C.fd = cs.getPropertyValue('--f-display').trim(); C.fn = cs.getPropertyValue('--f-num').trim(); C.fb = cs.getPropertyValue('--f-body').trim();
}
function fit(cv, lw, lh) {
  const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1, w = Math.max(1, Math.round(r.width * d)), hh = Math.max(1, Math.round(r.width * lh / lw * d));
  if (cv.width !== w || cv.height !== hh) { cv.width = w; cv.height = hh; }
  const c = cv.getContext('2d'); c.setTransform(w / lw, 0, 0, hh / lh, 0, 0); return c;
}
function txt(c, s, x, y, col, font, align) { c.fillStyle = col; c.font = font; c.textAlign = align || 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function arrow(c, x1, y1, x2, y2, col, w, dash) {
  const L = Math.hypot(x2 - x1, y2 - y1); if (L < 2) return; c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w; c.lineCap = 'round';
  if (dash) c.setLineDash([7, 5]); const ux = (x2 - x1) / L, uy = (y2 - y1) / L, hs = Math.min(12, L * 0.6) + w;
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2 - ux * hs * 0.7, y2 - uy * hs * 0.7); c.stroke(); c.setLineDash([]);
  c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - ux * hs - uy * hs * 0.5, y2 - uy * hs + ux * hs * 0.5); c.lineTo(x2 - ux * hs + uy * hs * 0.5, y2 - uy * hs - ux * hs * 0.5); c.closePath(); c.fill(); c.restore();
}
function pill(c, s, x, y, col, size = 13, bg) {
  c.font = `700 ${size}px ${C.fn}`; const w = c.measureText(s).width + 12;
  c.fillStyle = bg || C.panel; c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); c.roundRect(x - w / 2, y - size * .78, w, size * 1.56, 5); c.fill(); c.stroke();
  txt(c, s, x, y + 0.5, col === C.line ? C.ink : col, `700 ${size}px ${C.fn}`); return w;
}
function hudBox(c, s, x, y, col, align) {
  c.font = `700 15px ${C.fn}`; const w = c.measureText(s).width + 18, x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  c.fillStyle = C.panel; c.globalAlpha = .93; c.beginPath(); c.roundRect(x0, y - 14, w, 28, 7); c.fill(); c.globalAlpha = 1; c.strokeStyle = col || C.line; c.lineWidth = 1.5; c.stroke();
  txt(c, s, x0 + w / 2, y + 0.5, C.ink, `700 15px ${C.fn}`);
}
/* colour helpers (flat, CuteKit-style palette) */
function hexHsl(hex) { hex = hex.replace('#', ''); if (hex.length === 3) hex = hex.split('').map(x => x + x).join(''); const r = parseInt(hex.slice(0, 2), 16) / 255, g = parseInt(hex.slice(2, 4), 16) / 255, b = parseInt(hex.slice(4, 6), 16) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let hh = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; } return [hh, s * 100, l * 100]; }
function hslHex(hh, s, l) { s /= 100; l /= 100; const k = n => (n + hh / 30) % 12, a = s * Math.min(l, 1 - l); const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))).toString(16).padStart(2, '0'); return '#' + f(0) + f(8) + f(4); }
function shade(hex, dl) { if (!/^#/.test(hex)) return hex; const [hh, s, l] = hexHsl(hex); return hslHex(hh, s, clamp(l + dl, 0, 100)); }
function pal(col) { return { base: col, dark: shade(col, -11), darker: shade(col, -20), light: shade(col, 10), ink: shade(col, -32), eye: '#1f1d26', white: '#fffaf2' }; }

/* ---------------- people ---------------- */
function person(c, px, s, type, col, ph, pull, gy, ry) {
  const H = { kid: 48, adult: 62, strong: 66 }[type], th = { kid: 5, adult: 6, strong: 10 }[type];
  const leg = H * 0.46, torso = H * 0.36, hr = H * 0.11, lean = pull ? 0.66 + (RMOTION ? 0 : 0.07 * Math.sin(ph * 1.6)) : 0.5;
  const hip = { x: px, y: gy - leg * 0.92 }, sh = { x: hip.x + s * Math.sin(lean) * torso, y: hip.y - Math.cos(lean) * torso };
  const hd = { x: sh.x + s * Math.sin(lean) * (hr + 3), y: sh.y - Math.cos(lean) * (hr + 3) };
  const sw = Math.sin(ph) * (pull ? 2.5 : 4), f1 = { x: px - s * (14 + sw), y: gy }, f2 = { x: px + s * (8 - sw), y: gy }, hand = { x: px - s * 14, y: ry };
  c.save(); c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(px, gy + 3, 16, 3, 0, 0, 7); c.fill();
  c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = th;
  c.beginPath(); c.moveTo(f1.x, f1.y); c.lineTo(hip.x, hip.y); c.lineTo(f2.x, f2.y); c.stroke();
  c.beginPath(); c.moveTo(hip.x, hip.y); c.lineTo(sh.x, sh.y); c.stroke();
  c.lineWidth = th * 0.8; c.beginPath(); c.moveTo(sh.x, sh.y); c.lineTo(hand.x, hand.y); c.moveTo(sh.x, sh.y + 3); c.lineTo(hand.x + s * 2, hand.y + 2); c.stroke();
  c.fillStyle = col; c.beginPath(); c.arc(hd.x, hd.y, hr, 0, 7); c.fill();
  c.restore();
}

/* ---------------- animals: flat, rounded, no outlines; each has its own silhouette ----------------
   Local coords: facing +x, ground at y=0. Eyes and noses are dots; ears are curved lines.
   Dogs/huskies (carnivores) have eyes towards the front of the head; ponies/horses have eyes on the side. */
function rr(c, x, y, w, hh, r) { c.beginPath(); c.roundRect(x, y, w, hh, Math.min(r, Math.abs(w) / 2, Math.abs(hh) / 2)); }
function el(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, 7); }
function fl(c, col, a = 1) { c.globalAlpha = a; c.fillStyle = col; c.fill(); c.globalAlpha = 1; }
function stroke(c, pts, w, col, curve) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); if (curve) c.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); else for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.stroke(); }
function legPair(c, x, top, len, w, swing, col, hoof, hoofCol) {
  c.save(); c.translate(x, top); c.rotate(swing); rr(c, -w / 2, 0, w, len, w * .45); fl(c, col);
  if (hoof) { rr(c, -w / 2, len - 5, w, 5, 2); fl(c, hoofCol); }
  else { el(c, w * .25, len - 1.5, w * .62, 2.6); fl(c, col); }
  c.restore();
}
const ANIMAL = {
  dog(c, P, ph, pull) { // small, low, short snout, floppy ear, curled tail
    const g = pull ? Math.sin(ph * 1.4) : 0, lean = pull ? .06 : 0;
    el(c, 0, 1, 24, 3); fl(c, '#000', .12);
    // far legs
    legPair(c, -12, -22, 21, 6, -g * .35, P.darker); legPair(c, 12, -22, 21, 6, g * .35, P.darker);
    // tail: curled up
    stroke(c, [[-18, -28], [-30, -40], [-22, -46]], 5, P.dark, true);
    c.save(); c.rotate(-lean);
    rr(c, -21, -36, 42, 17, 8.5); fl(c, P.base); // body
    el(c, 2, -21, 15, 4); fl(c, P.light, .7); // belly
    rr(c, 14, -44, 11, 16, 5); fl(c, P.base); // neck
    rr(c, 15, -55, 18, 15, 7); fl(c, P.base); // head
    rr(c, 27, -49, 11, 8, 4); fl(c, P.light); // short squared muzzle
    el(c, 37, -48, 2.4, 2.1); fl(c, P.eye); // nose
    stroke(c, [[30, -42.5], [33, -41], [36, -43]], 1.4, P.ink, true); // mouth
    el(c, 29, -51.5, 1.7, 1.7); fl(c, P.eye); // eye, towards the front
    stroke(c, [[19, -54], [13, -51], [16, -42]], 3.2, P.darker, true); // floppy ear (curved line)
    rr(c, 13, -38, 4, 12, 2); fl(c, C.hazard || '#e3a51c'); // collar/harness
    c.restore();
    legPair(c, -15, -22, 21, 6, g * .35, P.base); legPair(c, 15, -22, 21, 6, -g * .35, P.base);
    return { harness: [15, -32] };
  },
  husky(c, P, ph, pull) { // stockier dog: pointed upright ears, neck ruff, tail curled over the back, harness
    const g = pull ? Math.sin(ph * 1.4) : 0;
    el(c, 0, 1, 27, 3.2); fl(c, '#000', .12);
    legPair(c, -14, -24, 23, 7, -g * .35, P.darker); legPair(c, 13, -24, 23, 7, g * .35, P.darker);
    rr(c, -24, -42, 48, 21, 10); fl(c, P.base); // body
    el(c, 0, -24, 18, 4.5); fl(c, P.light, .75);
    stroke(c, [[-20, -38], [-30, -56], [-8, -50]], 7, P.dark, true); // tail curled over the back
    rr(c, 14, -52, 13, 20, 6); fl(c, P.base); // neck
    el(c, 20, -36, 9, 8); fl(c, P.light); // neck ruff
    rr(c, 16, -63, 19, 16, 7); fl(c, P.base); // head
    rr(c, 29, -56, 10, 8, 4); fl(c, P.light); // muzzle
    el(c, 38.5, -55, 2.4, 2.1); fl(c, P.eye);
    stroke(c, [[31, -49.5], [34, -48], [37, -50]], 1.4, P.ink, true);
    el(c, 30, -59, 1.8, 1.8); fl(c, P.eye); // eye towards front
    stroke(c, [[19, -61], [21, -74], [26, -62]], 3, P.darker, true); // pointed upright ear
    rr(c, -2, -43, 6, 22, 2.5); fl(c, C.hazard || '#e3a51c'); rr(c, 10, -40, 5, 16, 2); fl(c, C.hazard || '#e3a51c'); // harness
    legPair(c, -17, -24, 23, 7, g * .35, P.base); legPair(c, 16, -24, 23, 7, -g * .35, P.base);
    return { harness: [12, -32] };
  },
  pony(c, P, ph, pull) { // short and round, thick legs, thick neck, shaggy mane and forelock, full tail
    const g = pull ? Math.sin(ph * 1.1) : 0;
    el(c, 0, 1, 34, 3.6); fl(c, '#000', .12);
    legPair(c, -19, -30, 29, 10, -g * .25, P.darker, true, P.ink); legPair(c, 19, -30, 29, 10, g * .25, P.darker, true, P.ink);
    // full tail
    c.beginPath(); c.moveTo(-30, -46); c.quadraticCurveTo(-46, -36, -40, -12); c.quadraticCurveTo(-33, -22, -27, -38); c.closePath(); fl(c, P.darker);
    rr(c, -34, -58, 66, 32, 16); fl(c, P.base); // round body
    el(c, -2, -31, 24, 5); fl(c, P.light, .6);
    // thick neck
    c.beginPath(); c.moveTo(16, -56); c.quadraticCurveTo(24, -80, 34, -84); c.lineTo(44, -76); c.quadraticCurveTo(38, -60, 32, -44); c.closePath(); fl(c, P.base);
    // head: short and broad
    c.save(); c.translate(42, -78); c.rotate(.55); rr(c, -6, -9, 24, 17, 8); fl(c, P.base); rr(c, 10, -7, 9, 13, 5); fl(c, P.light);
    el(c, 16, -2, 1.8, 1.8); fl(c, P.eye); // nostril dot
    stroke(c, [[12, 4], [15, 5], [17.5, 3]], 1.4, P.ink, true); // mouth
    el(c, 2, -3, 1.9, 1.9); fl(c, P.eye); // eye on the side of the head
    c.restore();
    stroke(c, [[36, -86], [37, -93], [40, -87]], 2.6, P.darker, true); // small ear
    // big shaggy mane + forelock
    for (let i = 0; i < 6; i++) { el(c, 18 + i * 3.4, -60 - i * 4.4, 6, 4.5, -.6); fl(c, P.darker); }
    el(c, 41, -84, 5, 3.5, .4); fl(c, P.darker); // forelock
    legPair(c, -22, -30, 29, 10, g * .25, P.base, true, P.ink); legPair(c, 22, -30, 29, 10, -g * .25, P.base, true, P.ink);
    return { harness: [24, -46] };
  },
  horse(c, P, ph, pull) { // tall and long-legged, long arched neck, long head, flowing mane and tail
    const g = pull ? Math.sin(ph * 1.0) : 0;
    el(c, 0, 1, 40, 3.8); fl(c, '#000', .12);
    legPair(c, -26, -50, 49, 7.5, -g * .22, P.darker, true, P.ink); legPair(c, 25, -50, 49, 7.5, g * .22, P.darker, true, P.ink);
    // flowing tail
    c.beginPath(); c.moveTo(-36, -70); c.quadraticCurveTo(-58, -58, -52, -22); c.quadraticCurveTo(-46, -40, -33, -62); c.closePath(); fl(c, P.darker);
    rr(c, -40, -78, 78, 30, 15); fl(c, P.base); // slim body
    el(c, -2, -51, 28, 4.5); fl(c, P.light, .55);
    // long arched neck
    c.beginPath(); c.moveTo(22, -76); c.quadraticCurveTo(30, -112, 50, -122); c.lineTo(60, -112); c.quadraticCurveTo(46, -96, 40, -58); c.closePath(); fl(c, P.base);
    // long head angled down
    c.save(); c.translate(56, -116); c.rotate(.95); rr(c, -6, -8, 38, 15, 7); fl(c, P.base); rr(c, 20, -7, 12, 13, 5.5); fl(c, P.light);
    el(c, 28, -2.5, 1.8, 1.8); fl(c, P.eye); // nostril dot
    stroke(c, [[23, 4], [26.5, 5], [29.5, 3.5]], 1.4, P.ink, true); // mouth
    el(c, 4, -2, 2, 2); fl(c, P.eye); // eye on the side of the head
    c.restore();
    stroke(c, [[50, -123], [51, -132], [55, -124]], 2.6, P.darker, true); // ear
    // flowing mane along the top of the neck
    for (let i = 0; i < 7; i++) { const t = i / 6, x = 24 + t * 26, y = -78 - t * 42; stroke(c, [[x, y], [x - 7, y + 3], [x - 9, y + 10]], 3.2, P.darker, true); }
    legPair(c, -29, -50, 49, 7.5, g * .22, P.base, true, P.ink); legPair(c, 28, -50, 49, 7.5, -g * .22, P.base, true, P.ink);
    return { harness: [30, -62] };
  }
};
function animal(c, kind, x, gy, dir, col, ph, pull, ry, scale = 1) {
  const HARN = { dog: [15, -32], husky: [12, -32], pony: [24, -46], horse: [30, -62] }[kind];
  if (ry != null) { // trace from the rope to the harness, drawn behind the animal
    const hx = x + dir * HARN[0] * scale, hy = gy + HARN[1] * scale;
    c.save(); c.strokeStyle = C.rope; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - dir * 30 * scale, ry); c.lineTo(hx, hy); c.stroke(); c.restore();
  }
  c.save(); c.translate(x, gy); c.scale(dir * scale, scale); const P = pal(col);
  ANIMAL[kind](c, P, ph, pull);
  c.restore();
}
const ISANIMAL = { dog: 1, husky: 1, pony: 1, horse: 1 };
function puller(c, px, s, type, col, ph, pull, gy, ry) {
  if (ISANIMAL[type]) animal(c, type, px, gy, s, col, ph, pull, ry, type === 'horse' ? 0.95 : 1);
  else person(c, px, s, type, col, ph, pull, gy, ry);
}

/* ---------------- arena ---------------- */
let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const SPECK = Array.from({ length: 160 }, () => [rnd() * 900, 301 + rnd() * 34, rnd() * 1.6 + 0.6]);
const CROWD = Array.from({ length: 110 }, (_, i) => [20 + (i % 55) * 16 + (Math.floor(i / 55) ? 8 : 0), 150 + Math.floor(i / 55) * 26 + rnd() * 4, rnd()]);
function arenaShell(c, label) {
  c.fillStyle = C.sky; c.fillRect(0, 0, 900, 380);
  c.save(); c.strokeStyle = C.muted; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 8); c.lineTo(900, 8); c.moveTo(0, 30); c.lineTo(900, 30);
  for (let x = 0; x < 900; x += 30) { c.moveTo(x, 8); c.lineTo(x + 15, 30); c.lineTo(x + 30, 8); } c.stroke();
  for (const x of [120, 330, 570, 780]) { c.fillStyle = C.ink; c.fillRect(x - 14, 30, 28, 8); c.fillStyle = '#fff3b8'; c.fillRect(x - 11, 38, 22, 4); }
  c.fillStyle = C.stand; c.fillRect(0, 130, 900, 105);
  for (const [x, y] of CROWD) { c.fillStyle = C.crowd; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); c.fillRect(x - 5, y + 5, 10, 8); }
  c.fillStyle = C.ink; c.fillRect(0, 235, 900, 16); for (let x = 0; x < 900; x += 225) txt(c, label, x + 112, 243.5, C.hazard, `800 11px ${C.fd}`);
  c.restore();
}
function drawFloor(c) {
  const fc = { air: C.air, ice: C.ice, smooth: C.wood, concrete: C.concrete }[S.floor];
  c.fillStyle = fc; c.fillRect(0, GROUND, 900, 36);
  if (S.floor === 'concrete') { c.fillStyle = C.speck; for (const [x, y, r] of SPECK) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } }
  else if (S.floor === 'smooth') { c.strokeStyle = C.speck; c.lineWidth = 1; for (let x = 0; x < 900; x += 60) { c.beginPath(); c.moveTo(x, GROUND); c.lineTo(x, GROUND + 36); c.stroke(); } }
  else if (S.floor === 'air') { c.fillStyle = C.muted; for (let x = 12; x < 900; x += 24) for (const y of [GROUND + 10, GROUND + 24]) { c.beginPath(); c.arc(x + (y > GROUND + 15 ? 12 : 0), y, 1.6, 0, 7); c.fill(); } }
  else { c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; for (let x = 20; x < 900; x += 110) { c.beginPath(); c.moveTo(x, GROUND + 10); c.lineTo(x + 40, GROUND + 6); c.stroke(); } }
  c.fillStyle = C.panel; c.fillRect(0, GROUND + 36, 900, 44);
  c.strokeStyle = C.muted; c.lineWidth = 1.5;
  for (let m = -9; m <= 9; m++) { const x = CX + m * PXM; c.beginPath(); c.moveTo(x, GROUND + 36); c.lineTo(x, GROUND + (m % 3 === 0 ? 46 : 42)); c.stroke(); if (m % 3 === 0) txt(c, (m > 0 ? '+' : '') + m + ' m', x, GROUND + 58, C.muted, `500 12px ${C.fn}`); }
  for (const sd of [-1, 1]) { const x = CX + sd * LIM * PXM; c.fillStyle = sd < 0 ? C.left : C.right; c.fillRect(x - 2, GROUND - 10, 4, 46); }
  c.save(); c.setLineDash([5, 5]); c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(CX, GROUND - 70); c.lineTo(CX, GROUND + 36); c.stroke(); c.restore();
}
function drawCrate(c, cx, gy, mass, w = CW, hh = CRH) {
  c.fillStyle = C.crate; c.strokeStyle = C['crate-edge']; c.lineWidth = 3;
  c.beginPath(); c.roundRect(cx - w / 2, gy - hh, w, hh, 4); c.fill(); c.stroke();
  c.lineWidth = 2; c.beginPath(); c.moveTo(cx - w / 2 + 6, gy - hh + 6); c.lineTo(cx + w / 2 - 6, gy - 6); c.moveTo(cx + w / 2 - 6, gy - hh + 6); c.lineTo(cx - w / 2 + 6, gy - 6); c.stroke();
  if (mass != null) { c.fillStyle = C.panel; c.beginPath(); c.roundRect(cx - 26, gy - hh / 2 - 11, 52, 22, 4); c.fill(); txt(c, mass + ' kg', cx, gy - hh / 2, C.ink, `700 14px ${C.fn}`); }
}
let HITS = [];
function drawTeam(c, side, s, col, edge, pulling, tt, ph, showMeter) {
  const arr = S[side]; if (!arr.length) return;
  let off = 78; const xs = arr.map(p => { const w = PUL[p].w, cp = off + (w - 36) / 2; off += w; return cp; });
  const lw = PUL[arr[arr.length - 1]].w, end = edge + s * (xs[xs.length - 1] + (lw === 36 ? 20 : lw / 2 - 4));
  const wob = pulling && !RMOTION ? Math.sin(tt * 55 + s) * 0.8 : 0;
  c.strokeStyle = C.rope; c.lineWidth = 4; c.beginPath(); c.moveTo(edge, ROPEY); c.lineTo(end, ROPEY + wob); c.stroke();
  if (pulling) {
    c.save(); c.strokeStyle = col; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
    for (let k = 0; k < 3; k++) { const u = RMOTION ? k / 3 + 0.15 : (tt * 1.1 + k / 3) % 1, x = edge + s * (10 + u * 58), y = ROPEY + 15; c.globalAlpha = RMOTION ? 0.8 : Math.sin(u * Math.PI); c.beginPath(); c.moveTo(x - s * 5, y - 5); c.lineTo(x, y); c.lineTo(x - s * 5, y + 5); c.stroke(); }
    c.restore();
  }
  arr.forEach((p, i) => { puller(c, edge + s * xs[i], s, p, col, ph + i * 1.7, pulling, GROUND, ROPEY); HITS.push({ side, i, p, x: edge + s * xs[i], hw: Math.max(18, PUL[p].w / 2), y0: GROUND - 140, y1: GROUND + 8 }); });
  if (showMeter) {
    // keep the meter and its reading on the 900 px canvas when the crate reaches the end (the rope runs on off-screen)
    const nx = clamp(edge + s * 38, 20, 880); c.fillStyle = C.panel; c.strokeStyle = C.ink; c.lineWidth = 2;
    c.beginPath(); c.roundRect(nx - 17, ROPEY - 7, 34, 14, 4); c.fill(); c.stroke();
    const st = pulling && !RMOTION ? 1 + 0.12 * Math.sin(tt * 30 + s) : 1; c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); for (let k = 0; k < 5; k++) { c.moveTo(nx + (-12 + k * 6) * st, ROPEY - 4); c.lineTo(nx + (-9 + k * 6) * st, ROPEY + 4); } c.stroke();
    const lbl = tot(arr) + ' N'; c.font = `700 13px ${C.fn}`; const pw = c.measureText(lbl).width + 12;
    pill(c, lbl, clamp(nx, pw / 2 + 4, 896 - pw / 2), ROPEY - 22, col);
  }
}
