/* ===== Flashcard art, part C: chapters 4-6 (force pairs, falling and flying, simple machines, work and efficiency) =====
   Pen sketches in the 240 x 150 box, drawn with the helpers in 64-fcart-kit.js. Helpers here are prefixed fcC_.
   Numbers used (all consistent): g = 9.8 N/kg. Lever family: load 490 N (50 kg), load arm 48 cm, effort arm 120 cm, effort 196 N, mechanical advantage 2.5. */

/* a closed (or open) pen outline through points, optional fill */
function fcC_poly(pts, o = {}) {
  return `<path d="M${pts.map(p => fcN(p[0]) + ' ' + fcN(p[1])).join('L')}${o.open ? '' : 'Z'}" fill="${o.fill || 'none'}" stroke="${o.col || FC_INK.pen}" stroke-width="${o.w || 2.4}" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
}
/* a pencil-grey dashed guide line */
const fcC_guide = (x1, y1, x2, y2) => fcLine(x1, y1, x2, y2, FC_INK.pencil, 1.5, '4 4');
/* a wavy heat squiggle rising from (x,y) up by h */
function fcC_heat(x, y, h, col = FC_INK.red) {
  let d = `M${x} ${y}`; const n = 3, st = h / n;
  for (let i = 0; i < n; i++) d += `q${i % 2 ? -5 : 5} ${fcN(-st / 2)} 0 ${fcN(-st)}`;
  return `<path d="${d}" stroke="${col}" stroke-width="2.2" fill="none"/>`;
}
/* a double-headed dimension line from x1 to x2 at height y, with a small tick at each end */
const fcC_dim = (x1, x2, y, col = FC_INK.pencil) => { const m = (x1 + x2) / 2; return fcArrow(m, y, x1, y, col, 2.4) + fcArrow(m, y, x2, y, col, 2.4) + fcLine(x1, y - 5, x1, y + 5, col, 1.8) + fcLine(x2, y - 5, x2, y + 5, col, 1.8); };
/* a vertical double-headed dimension line */
const fcC_dimV = (x, y1, y2, col = FC_INK.pencil) => { const m = (y1 + y2) / 2; return fcArrow(x, m, x, y1, col, 2.4) + fcArrow(x, m, x, y2, col, 2.4) + fcLine(x - 5, y1, x + 5, y1, col, 1.8) + fcLine(x - 5, y2, x + 5, y2, col, 1.8); };
/* a chunky "energy" arrow (outlined, lightly filled) from x1 to x2 at height y with thickness h */
function fcC_fat(x1, x2, y, h, col) {
  const hl = 16, a = h / 2, b = h / 2 + 5, d = x2 > x1 ? 1 : -1;
  const pts = [[x1, y - a], [x2 - d * hl, y - a], [x2 - d * hl, y - b], [x2, y], [x2 - d * hl, y + b], [x2 - d * hl, y + a], [x1, y + a]];
  return `<path d="M${pts.map(p => fcN(p[0]) + ' ' + fcN(p[1])).join('L')}Z" fill="${col}" fill-opacity=".16" stroke="${col}" stroke-width="2.2" stroke-linejoin="round"/>`;
}
/* a small round tear-drop (for oil) with its point at the top */
const fcC_drop = (x, y, r = 4) => `<path d="M${x} ${y - r * 1.9}C${x + r * 0.4} ${y - r} ${x + r} ${y - r * 0.6} ${x + r} ${y}A${r} ${r} 0 1 1 ${x - r} ${y}C${x - r} ${y - r * 0.6} ${x - r * 0.4} ${y - r} ${x} ${y - r * 1.9}Z" fill="${FC_INK.hi}" fill-opacity=".9" stroke="${FC_INK.pen}" stroke-width="1.8"/>`;
/* an irregular rock sitting on y, centred on x */
const fcC_rock = (x, y, w = 30, h = 22) => fcC_poly([[x - w / 2, y], [x - w / 2 + 2, y - h * 0.55], [x - w * 0.2, y - h], [x + w * 0.2, y - h * 0.92], [x + w / 2 - 1, y - h * 0.45], [x + w / 2, y]]) + fcLine(x - 3, y - h * 0.9, x - 1, y - h * 0.45, FC_INK.pen, 1.3);

/* ----- the rocket (nose up), used by thrust ----- */
function fcC_rocket(cx, top) {
  const K = FC_INK, b = top + 62;
  return `<path d="M${cx} ${top}C${cx + 15} ${top + 14} ${cx + 15} ${top + 44} ${cx + 12} ${b}L${cx - 12} ${b}C${cx - 15} ${top + 44} ${cx - 15} ${top + 14} ${cx} ${top}Z" fill="none" stroke="${K.pen}" stroke-width="2.4"/>` +
    fcC_poly([[cx - 13, b - 20], [cx - 25, b + 2], [cx - 12, b - 2]]) + fcC_poly([[cx + 13, b - 20], [cx + 25, b + 2], [cx + 12, b - 2]]) +
    fcCircle(cx, top + 26, 6, { w: 2 }) + fcC_poly([[cx - 8, b], [cx + 8, b], [cx + 11, b + 8], [cx - 11, b + 8]]);
}
/* ----- the helicopter (nose left), used by lift and hover. The mast is at cx-10; the body centre is (cx, cy) ----- */
function fcC_heli(cx, cy) {
  const K = FC_INK;
  return `<ellipse cx="${cx}" cy="${cy}" rx="28" ry="17" fill="none" stroke="${K.pen}" stroke-width="2.4"/>` +
    `<path d="M${cx - 24} ${cy - 6}Q${cx - 20} ${cy - 14} ${cx - 9} ${cy - 13}L${cx - 9} ${cy - 2}L${cx - 25} ${cy - 2}Z" fill="none" stroke="${K.pen}" stroke-width="1.6"/>` +
    fcLine(cx + 24, cy - 6, cx + 84, cy - 14) + fcLine(cx + 24, cy + 2, cx + 84, cy - 10) + fcLine(cx + 84, cy - 14, cx + 90, cy - 28) + fcLine(cx + 84, cy - 10, cx + 90, cy - 28) +
    fcLine(cx - 10, cy - 17, cx - 10, cy - 30) + fcLine(cx - 64, cy - 31, cx + 46, cy - 31, K.pen, 3) +
    fcLine(cx - 24, cy + 30, cx + 30, cy + 30) + fcLine(cx - 14, cy + 15, cx - 16, cy + 30, K.pen, 2) + fcLine(cx + 14, cy + 16, cx + 16, cy + 30, K.pen, 2);
}

/* ----- the lever family (lever, fulcrum, effort, load, effortarm, loadarm, mechadv, machine uses its own crowbar) -----
   Same drawing every time: rock (load) on the left, plank, triangle pivot at x = 66, hand push (effort) down on the right.
   1 px = 1 cm along the plank (load arm 48 cm, effort arm 120 cm); arrows 1 px = 11 N (load 490 N, effort 196 N).
   o.hi = 'plank' | 'fulcrum' | 'effort' | 'load' | 'effortarm' | 'loadarm'; o.nums shows the forces; o.names = which parts get a name label. */
function fcC_lever(o = {}) {
  const K = FC_INK, FX = 74, LX = 26, EX = 194, PY = 78;
  let s = '', t = '';
  if (o.hi === 'plank') s += fcHi(5, PY - 8, 204, 22);
  if (o.hi === 'fulcrum') s += fcHi(FX - 24, PY + 2, 48, 36);
  if (o.hi === 'effort') s += fcHi(EX - 14, 40, 28, 44);
  if (o.hi === 'load') s += fcHi(7, 5, 38, 76);
  if (o.hi === 'loadarm') s += fcHi(LX - 10, 110, FX - LX + 20, 36);
  if (o.hi === 'effortarm') s += fcHi(FX - 10, 110, EX - FX + 20, 36);
  s += `<rect x="10" y="${PY}" width="196" height="6" rx="2" fill="${K.paper}" stroke="${K.pen}" stroke-width="2.4"/>`;
  s += fcC_poly([[FX, PY + 6], [FX - 16, 108], [FX + 16, 108]], { fill: K.paper });
  s += fcLine(42, 108, 106, 108, K.pencil, 2);
  for (let x = 48; x < 106; x += 12) s += fcLine(x, 110, x - 6, 117, K.pencil, 1.2);
  s += fcC_rock(LX, PY, 30, 22);
  s += fcArrow(LX, 9, LX, 54, K.red) + fcArrow(EX, 58, EX, PY - 1, K.green, o.hi === 'effort' ? 5 : 3);
  const nm = o.names || {};
  if (nm.load) t += fcText(LX + 10, 26, 'load' + (o.nums ? ' 490 N' : ''), { anchor: 'start', col: K.red });
  else if (o.nums) t += fcText(LX + 10, 26, '490 N', { anchor: 'start', col: K.red });
  if (nm.effort) t += fcText(EX - 12, 52, 'effort' + (o.nums ? ' 196 N' : ''), { anchor: 'end', col: K.green });
  else if (o.nums) t += fcText(EX - 12, 52, '196 N', { anchor: 'end', col: K.green });
  if (nm.fulcrum) t += fcText(FX + 22, 100, 'fulcrum', { anchor: 'start' });
  if (o.pivotWord) t += fcText(FX + 22, 100, o.pivotWord, { anchor: 'start', col: K.red });
  if (o.dim === 'load' || o.dim === 'effort') {
    const x2 = o.dim === 'load' ? LX : EX, lab = o.dim === 'load' ? '48 cm' : '120 cm';
    s += fcC_guide(FX, 118, FX, 128) + fcC_guide(x2, PY + 8, x2, 128) + fcC_dim(FX, x2, 123, K.red);
    t += fcText((FX + x2) / 2, 142, lab, { col: K.red, size: 15, bold: true });
  }
  return { s, t };
}
function fcC_leverArt(alt, o) { const r = fcC_lever(o); return { alt, s: r.s, t: r.t }; }

/* ----- force pair with a wall (forcepair, action, reaction): skater pushes wall; wall pushes skater back ----- */
function fcC_wall(o = {}) {
  const K = FC_INK, gy = 118;
  let s = '', t = '';
  if (o.hi === 'action') s += fcHi(130, 10, 90, 48);
  if (o.hi === 'reaction') s += fcHi(36, 10, 100, 48);
  s += fcGround(16, 224, gy);
  s += fcPerson(104, gy, { face: 1, lean: 8 });
  s += fcBox(134, 62, 50, 56, { fill: K.paper });
  s += fcLine(134, 80, 184, 80, K.pen, 1.2) + fcLine(134, 99, 184, 99, K.pen, 1.2) + fcLine(158, 62, 158, 80, K.pen, 1.2) + fcLine(146, 80, 146, 99, K.pen, 1.2) + fcLine(170, 80, 170, 99, K.pen, 1.2) + fcLine(158, 99, 158, 118, K.pen, 1.2);
  s += fcArrow(138, 48, 210, 48, K.red) + fcArrow(118, 48, 46, 48, K.green);
  t += fcText(174, 22, '40 N', { col: K.red }) + fcText(174, 38, 'on wall', { col: K.red, size: 14 });
  t += fcText(82, 22, '40 N', { col: K.green }) + fcText(82, 38, 'on skater', { col: K.green, size: 14 });
  if (o.cap) t += fcText(120, 144, o.cap, { col: o.capCol || K.pen, size: 14 });
  return { s, t };
}

/* ================= CHAPTER 4 ================= */
{
  const K = FC_INK, gy = 120;
  /* newton3: two skaters push apart; equal arrows, one on each */
  FC_ART.newton3 = {
    alt: 'Skater A pushes skater B, and B pushes A back: two equal arrows of 35 newtons, pointing opposite ways, one on each skater.',
    s: fcGround(14, 226, gy) + fcPerson(98, gy, { face: 1 }) + fcPerson(142, gy, { face: -1 }) + fcArrow(150, 46, 216, 46, K.red) + fcArrow(90, 46, 24, 46, K.green),
    t: fcText(183, 32, '35 N on B', { col: K.red }) + fcText(57, 32, '35 N on A', { col: K.green }) + fcText(74, 100, 'A', { size: 15 }) + fcText(166, 100, 'B', { size: 15 }) + fcText(120, 144, 'A pushes B, B pushes A back', { size: 14 })
  };
  const wall = o => { const r = fcC_wall(o); return { s: r.s, t: r.t }; };
  FC_ART.forcepair = Object.assign({ alt: 'A skater pushes a wall with 40 newtons, and the wall pushes the skater with 40 newtons the other way: equal arrows, opposite directions, on different objects.' }, wall({ cap: 'equal, opposite, different objects' }));
  FC_ART.action = Object.assign({ alt: 'A skater pushes a wall: the red arrow on the wall is highlighted as the action, with the equal green arrow on the skater as the other half of the pair.' }, wall({ hi: 'action', cap: 'skater pushes the wall', capCol: K.red }));
  FC_ART.reaction = Object.assign({ alt: 'A wall pushes a skater back: the green arrow on the skater is highlighted as the reaction to the skater pushing the wall.' }, wall({ hi: 'reaction', cap: 'the wall pushes back', capCol: K.green }));
  /* thrust: rocket with flame, red arrow up */
  FC_ART.thrust = {
    alt: 'A rocket with a flame under its engine and a red arrow pointing up: the engine pushes the rocket forwards.',
    s: fcC_rocket(92, 12) + `<path d="M81 82L86 108L92 96L98 118L103 96L103 82Z" fill="${K.hi}" fill-opacity=".7" stroke="${K.red}" stroke-width="2.2" stroke-linejoin="round"/>` + fcArrow(150, 96, 150, 28, K.red),
    t: fcText(160, 58, 'engine', { anchor: 'start', col: K.red }) + fcText(160, 74, 'pushes', { anchor: 'start', col: K.red }) + fcText(160, 90, 'rocket up', { anchor: 'start', col: K.red })
  };
  /* thruster: gas out the left, craft pushed right */
  FC_ART.thruster = {
    alt: 'A spacecraft with a small jet on its left end: gas puffs out to the left, and a red arrow shows the spacecraft being pushed to the right.',
    s: fcBox(98, 58, 74, 40, { r: 8 }) + fcCircle(118, 78, 6, { w: 2 }) + fcCircle(140, 78, 6, { w: 2 }) + fcC_poly([[98, 70], [86, 64], [86, 92], [98, 86]]) +
      fcLine(135, 58, 135, 44, K.pen, 2.2) + fcBox(114, 30, 42, 14, { r: 2, w: 2 }) +
      fcCircle(70, 78, 4, { col: K.pencil, w: 1.8 }) + fcCircle(50, 78, 6, { col: K.pencil, w: 1.8 }) + fcCircle(26, 78, 9, { col: K.pencil, w: 1.8 }) +
      fcArrow(84, 110, 22, 110, K.pencil, 2.4) + fcArrow(178, 78, 226, 78, K.red) +
      fcLine(18, 22, 18, 30, K.pencil, 1.6) + fcLine(14, 26, 22, 26, K.pencil, 1.6) + fcLine(206, 28, 206, 36, K.pencil, 1.6) + fcLine(202, 32, 210, 32, K.pencil, 1.6) + fcLine(60, 40, 60, 46, K.pencil, 1.6) + fcLine(57, 43, 63, 43, K.pencil, 1.6),
    t: fcText(53, 134, 'gas out', { col: K.pencil }) + fcText(204, 100, 'pushed', { col: K.red, size: 14 }) + fcText(204, 116, 'this way', { col: K.red, size: 14 })
  };
}

/* ================= CHAPTER 5 ================= */
{
  const K = FC_INK;
  /* terminal: skydiver seen from the side, weight and air resistance equal */
  const diver = (cx, cy) => fcCircle(cx - 32, cy, 7) + fcLine(cx - 25, cy, cx + 22, cy) + fcLine(cx - 16, cy, cx - 6, cy - 15) + fcLine(cx - 16, cy, cx - 6, cy + 15) + fcLine(cx + 22, cy, cx + 38, cy - 10) + fcLine(cx + 22, cy, cx + 38, cy + 10);
  FC_ART.terminal = {
    alt: 'A skydiver falling flat: the red weight arrow down and the green air resistance arrow up are the same length, 637 newtons each, so the velocity stays steady.',
    s: diver(120, 76) + fcArrow(120, 76, 120, 24, K.green) + fcArrow(120, 76, 120, 128, K.red) + fcArrow(36, 40, 36, 92, K.pencil, 2.4),
    t: fcText(130, 36, 'air resistance', { anchor: 'start', col: K.green }) + fcText(130, 52, '637 N', { anchor: 'start', col: K.green }) + fcText(130, 112, 'weight', { anchor: 'start', col: K.red }) + fcText(130, 128, '637 N', { anchor: 'start', col: K.red }) +
      fcText(36, 112, 'steady', { size: 14 }) + fcText(36, 128, 'velocity', { size: 14 })
  };
  /* parachute: crate under a canopy, forces equal */
  const dome = (cx, top, w, bottom) => `M${cx - w / 2} ${bottom}C${cx - w / 2} ${top + 10} ${cx - w / 4} ${top} ${cx} ${top}C${cx + w / 4} ${top} ${cx + w / 2} ${top + 10} ${cx + w / 2} ${bottom}Q${cx + w * 0.33} ${bottom - 10} ${cx + w / 6} ${bottom}Q${cx} ${bottom - 10} ${cx - w / 6} ${bottom}Q${cx - w * 0.33} ${bottom - 10} ${cx - w / 2} ${bottom}Z`;
  FC_ART.parachute = {
    alt: 'A crate hangs from a parachute: the big green air resistance arrow up equals the red weight arrow down, 490 newtons each, so it falls slowly and steadily.',
    s: `<path d="${dome(78, 10, 100, 54)}" fill="none" stroke="${K.pen}" stroke-width="2.4"/>` + fcLine(28, 54, 58, 92, K.pen, 1.6) + fcLine(128, 54, 98, 92, K.pen, 1.6) +
      fcBox(58, 92, 40, 24, { cross: true, fill: K.paper }) + fcArrow(78, 104, 78, 62, K.green) + fcArrow(78, 104, 78, 144, K.red),
    t: fcText(140, 30, 'air resistance', { anchor: 'start', col: K.green }) + fcText(140, 46, '490 N', { anchor: 'start', col: K.green }) + fcText(140, 124, 'weight', { anchor: 'start', col: K.red }) + fcText(140, 140, '490 N', { anchor: 'start', col: K.red })
  };
  /* canopy: big fabric dome highlighted, cords and a skydiver */
  const cp = `M44 66C44 28 78 12 120 12C162 12 196 28 196 66Q176 54 158 66Q139 54 120 66Q101 54 82 66Q64 54 44 66Z`;
  FC_ART.canopy = {
    alt: 'A skydiver hangs below a parachute whose big round fabric dome is highlighted in yellow, held by cords.',
    s: `<path d="${cp}" fill="${K.hi}" fill-opacity=".55"/><path d="${cp}" fill="none" stroke="${K.pen}" stroke-width="2.4"/>` +
      fcLine(44, 66, 120, 104, K.pen, 1.6) + fcLine(82, 66, 120, 104, K.pen, 1.6) + fcLine(120, 66, 120, 104, K.pen, 1.6) + fcLine(158, 66, 120, 104, K.pen, 1.6) + fcLine(196, 66, 120, 104, K.pen, 1.6) +
      fcCircle(120, 110, 5.5, { w: 2 }) + fcLine(120, 116, 120, 132) + fcLine(120, 132, 113, 144) + fcLine(120, 132, 127, 144) + fcLine(120, 120, 111, 108, K.pen, 1.8) + fcLine(120, 120, 129, 108, K.pen, 1.8),
    t: fcText(190, 98, 'cords', { size: 14 }) + fcText(134, 130, 'skydiver', { anchor: 'start', size: 14 })
  };
  /* drag: boat moving right, water pushes back */
  FC_ART.drag = {
    alt: 'A boat moving to the right on water, with a red arrow pointing left: the water pushes back against the boat.',
    s: fcC_poly([[78, 82], [166, 82], [150, 102], [94, 102]], { fill: K.paper }) + fcLine(122, 82, 122, 34, K.pen, 2.2) + fcC_poly([[126, 38], [126, 78], [158, 78]], { fill: K.paper, w: 2 }) +
      `<path d="M10 104q10-8 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" stroke="${K.pen}" stroke-width="2.2" fill="none"/>` +
      fcArrow(150, 122, 74, 122, K.red) + fcArrow(178, 62, 222, 62, K.pencil, 2.4),
    t: fcText(112, 144, 'water pushes back', { col: K.red, size: 14 }) + fcText(198, 50, 'moving', { col: K.pencil, size: 14 })
  };
  /* gfs: 1 kg on Earth and the Moon, arrows 1 px = 0.25 N... lengths in the ratio 9.8 : 1.6 */
  FC_ART.gfs = {
    alt: 'A 1 kilogram block above the Earth with a long weight arrow, 9.8 newtons per kilogram, and above the Moon with an arrow about six times shorter, 1.6 newtons per kilogram.',
    s: `<path d="M8 132Q60 98 112 132" fill="none" stroke="${K.pen}" stroke-width="2.4"/>` + `<path d="M130 132Q176 114 222 132" fill="none" stroke="${K.pen}" stroke-width="2.4"/>` +
      fcBox(48, 8, 24, 24, { fill: K.paper }) + fcBox(168, 8, 24, 24, { fill: K.paper }) + fcArrow(60, 36, 60, 102, K.red, 3.2) + fcArrow(180, 36, 180, 48, K.red, 3.6),
    t: fcText(60, 25, '1 kg', { size: 13 }) + fcText(180, 25, '1 kg', { size: 13 }) + fcText(74, 72, '9.8 N', { anchor: 'start', col: K.red, size: 14 }) + fcText(194, 50, '1.6 N', { anchor: 'start', col: K.red, size: 14 }) +
      fcText(60, 144, 'Earth: 9.8 N/kg', { size: 14 }) + fcText(180, 144, 'Moon: 1.6 N/kg', { size: 14 })
  };
  /* vacuum: hammer and feather fall together in a jar with no air */
  FC_ART.vacuum = {
    alt: 'A glass jar with the air pumped out, holding a hammer and a feather side by side at the same height, with motion lines showing they fall together.',
    s: `<path d="M52 122L52 44Q52 14 120 14Q188 14 188 44L188 122" fill="none" stroke="${K.pen}" stroke-width="2.4"/>` + `<rect x="36" y="122" width="168" height="8" rx="2" fill="none" stroke="${K.pen}" stroke-width="2.4"/>` +
      fcBox(80, 46, 28, 12, { r: 2, fill: K.paper }) + fcLine(94, 58, 94, 94) +
      `<path d="M152 50Q172 62 152 92Q132 62 152 50Z" fill="none" stroke="${K.pen}" stroke-width="2.2"/>` + fcLine(152, 50, 152, 100, K.pen, 1.8) +
      fcLine(88, 30, 88, 38, K.pencil, 1.6) + fcLine(100, 30, 100, 38, K.pencil, 1.6) + fcLine(146, 30, 146, 38, K.pencil, 1.6) + fcLine(158, 30, 158, 38, K.pencil, 1.6),
    t: fcText(120, 38, 'no air', { size: 13 }) + fcText(94, 118, 'hammer', { size: 13 }) + fcText(152, 118, 'feather', { size: 13 }) + fcText(120, 143, 'fall together', { size: 14 })
  };
  /* lift: helicopter, blades push air down, red arrow up */
  FC_ART.lift = {
    alt: 'A helicopter whose blades push air downwards (grey arrows) while a red arrow shows the air pushing the helicopter upwards.',
    s: fcC_heli(112, 78) + fcArrow(120, 76, 120, 12, K.red) + fcArrow(62, 56, 62, 112, K.pencil, 2.4) + fcArrow(84, 56, 84, 112, K.pencil, 2.4),
    t: fcText(130, 18, 'air pushes', { anchor: 'start', col: K.red, size: 14 }) + fcText(130, 34, 'helicopter up', { anchor: 'start', col: K.red, size: 14 }) + fcText(73, 128, 'air pushed', { size: 13, col: K.pencil }) + fcText(73, 143, 'down', { size: 13, col: K.pencil })
  };
  /* hover: lift = weight */
  FC_ART.hover = {
    alt: 'A helicopter hanging still in the air: the green lift arrow up and the red weight arrow down are the same length, 12 250 newtons each.',
    s: fcC_heli(112, 76) + fcArrow(120, 76, 120, 10, K.green) + fcArrow(120, 76, 120, 142, K.red),
    t: fcText(130, 20, 'lift 12 250 N', { anchor: 'start', col: K.green, size: 14 }) + fcText(130, 140, 'weight 12 250 N', { anchor: 'start', col: K.red, size: 14 }) + fcText(36, 62, 'stays', { size: 14 }) + fcText(36, 78, 'still', { size: 14 })
  };
}

/* ================= CHAPTER 6 ================= */
{
  const K = FC_INK;
  /* machine: a crowbar lets a small push lift a heavy crate (arms 3 : 1, 147 N lifts 441 N) */
  FC_ART.machine = {
    alt: 'A crowbar resting on a pivot stone: a small 147 newton push down on the long end lifts a heavy 441 newton crate on the short end.',
    s: fcGround(8, 232, 124) + fcC_poly([[148, 96], [134, 124], [162, 124]], { fill: K.paper }) + fcLine(24, 118, 198, 90, K.pen, 4) +
      `<g transform="translate(184 94) rotate(-9)">${fcBox(-18, -30, 36, 30, { cross: true, fill: K.paper })}</g>` +
      fcArrow(40, 86, 40, 108, K.green) + fcArrow(184, 14, 184, 58, K.red),
    t: fcText(40, 76, '147 N', { col: K.green, size: 14 }) + fcText(170, 38, '441 N', { col: K.red, size: 14, anchor: 'end' }) + fcText(120, 143, 'small push, big load', { size: 14 })
  };
  FC_ART.lever = fcC_leverArt('A plank balanced on a triangle pivot with a rock on the short end and a small hand push down on the long end; the plank is highlighted.', { hi: 'plank', names: { fulcrum: 1, load: 1, effort: 1 } });
  FC_ART.fulcrum = fcC_leverArt('The same lever drawing with the triangle the plank turns around highlighted and marked as the pivot.', { hi: 'fulcrum', pivotWord: 'pivot', names: { load: 1, effort: 1 } });
  FC_ART.effort = fcC_leverArt('The same lever drawing with the small green push-down arrow of 196 newtons on the long end highlighted.', { hi: 'effort', nums: true, names: { fulcrum: 1, load: 1 } });
  FC_ART.load = fcC_leverArt('The same lever drawing with the rock and its red 490 newton arrow highlighted.', { hi: 'load', nums: true, names: { fulcrum: 1, effort: 1 } });
  FC_ART.effortarm = fcC_leverArt('The same lever drawing with a red dimension line from the pivot to the effort, 120 centimetres, highlighted.', { hi: 'effortarm', dim: 'effort', names: { fulcrum: 1, load: 1, effort: 1 } });
  FC_ART.loadarm = fcC_leverArt('The same lever drawing with a red dimension line from the pivot to the load, 48 centimetres, highlighted.', { hi: 'loadarm', dim: 'load', names: { fulcrum: 1, load: 1, effort: 1 } });
  /* mechadv: the same lever, with the forces and the sum */
  { const r = fcC_lever({ nums: true, names: { load: 1, effort: 1 } });
    FC_ART.mechadv = { alt: 'The same lever drawing with a load of 490 newtons and an effort of 196 newtons, and the sum 490 divided by 196 equals 2.5.', s: r.s, t: r.t + fcText(120, 140, '490 ÷ 196 = 2.5', { col: K.red, size: 17, bold: true }) }; }
  /* pulley: a fixed pulley, pull down to lift a bucket */
  FC_ART.pulley = {
    alt: 'A wheel hanging from a beam with a rope over it: pulling down on one end lifts a bucket on the other end.',
    s: fcLine(70, 12, 190, 12, K.pen, 2.4) + fcLine(80, 11, 74, 5, K.pencil, 1.2) + fcLine(100, 11, 94, 5, K.pencil, 1.2) + fcLine(120, 11, 114, 5, K.pencil, 1.2) + fcLine(140, 11, 134, 5, K.pencil, 1.2) + fcLine(160, 11, 154, 5, K.pencil, 1.2) + fcLine(180, 11, 174, 5, K.pencil, 1.2) +
      fcLine(120, 12, 120, 28, K.pen, 2.2) + fcCircle(120, 44, 16) + fcCircle(120, 44, 2.5, { w: 2 }) +
      fcLine(104, 44, 104, 98, K.pen, 1.8) + fcLine(136, 44, 136, 104, K.pen, 1.8) +
      fcC_poly([[92, 98], [116, 98], [112, 124], [96, 124]], { fill: K.paper }) + `<path d="M96 98Q104 84 112 98" fill="none" stroke="${K.pen}" stroke-width="1.8"/>` +
      fcArrow(152, 60, 152, 110, K.green) + fcArrow(76, 124, 76, 92, K.pencil, 2.4),
    t: fcText(162, 80, 'pull', { anchor: 'start', col: K.green }) + fcText(162, 96, 'down', { anchor: 'start', col: K.green }) + fcText(76, 142, 'goes up', { size: 14, col: K.pencil })
  };
  /* supporting: moving pulley, two rope sections hold it */
  FC_ART.supporting = {
    alt: 'A hanging pulley block with a load below it, held by two rope sections going up to the beam, labelled 1 and 2; each holds half the load.',
    s: fcLine(70, 10, 190, 10, K.pen, 2.4) + fcLine(80, 9, 74, 3, K.pencil, 1.2) + fcLine(100, 9, 94, 3, K.pencil, 1.2) + fcLine(120, 9, 114, 3, K.pencil, 1.2) + fcLine(140, 9, 134, 3, K.pencil, 1.2) + fcLine(160, 9, 154, 3, K.pencil, 1.2) +
      fcLine(100, 10, 100, 18, K.pen, 2.2) + fcCircle(100, 28, 10, { w: 2.2 }) +
      `<path d="M110 28L110 80A18 18 0 0 0 146 80L146 10" fill="none" stroke="${K.pen}" stroke-width="1.8"/>` +
      fcLine(90, 28, 90, 98, K.green, 2.6) + fcCircle(128, 80, 18) + fcCircle(128, 80, 2.5, { w: 2 }) + fcLine(128, 98, 128, 108, K.pen, 2.2) + fcBox(106, 108, 44, 28, { fill: K.paper }) +
      fcArrow(90, 70, 90, 104, K.green, 3),
    t: fcText(121, 56, '1', { size: 16, col: K.red, bold: true }) + fcText(135, 56, '2', { size: 16, col: K.red, bold: true }) + fcText(78, 88, 'pull', { anchor: 'end', col: K.green }) +
      fcText(196, 68, 'each rope', { size: 14 }) + fcText(196, 84, 'holds half', { size: 14 }) + fcText(128, 128, 'load', { size: 13 })
  };
  /* wheelaxle: big wheel, thin axle, rope on the axle lifts a load */
  FC_ART.wheelaxle = {
    alt: 'A big wheel fixed to a thin rod: a 110 newton push on the rim lifts a 45 kilogram load hanging from a rope on the thin rod.',
    s: fcCircle(100, 66, 42) + fcLine(70, 36, 130, 96, K.pen, 1.6) + fcLine(130, 36, 70, 96, K.pen, 1.6) + fcCircle(100, 66, 10, { fill: K.paper }) + fcCircle(100, 66, 2, { w: 1.8 }) +
      fcLine(110, 66, 110, 112, K.pen, 1.8) + fcBox(92, 112, 36, 26, { fill: K.paper }) + fcArrow(46, 40, 46, 88, K.green) +
      fcC_guide(150, 40, 130, 46) + fcC_guide(150, 98, 112, 70),
    t: fcText(40, 64, '110 N', { anchor: 'end', col: K.green, size: 14 }) + fcText(110, 130, '45 kg', { size: 13 }) + fcText(156, 38, 'big wheel', { anchor: 'start', size: 14 }) + fcText(156, 114, 'thin rod', { anchor: 'start', size: 14 })
  };
  /* winch: crank turns a drum that winds in a rope */
  FC_ART.winch = {
    alt: 'A drum on two posts with a crank handle on one end; turning the crank winds a rope onto the drum and lifts a crate.',
    s: fcGround(30, 190, 126) + fcLine(76, 84, 76, 126) + fcLine(140, 84, 140, 126) + fcBox(70, 56, 76, 28, { fill: K.paper }) +
      fcLine(82, 56, 82, 84, K.pen, 1.4) + fcLine(92, 56, 92, 84, K.pen, 1.4) + fcLine(102, 56, 102, 84, K.pen, 1.4) + fcLine(112, 56, 112, 84, K.pen, 1.4) + fcLine(122, 56, 122, 84, K.pen, 1.4) + fcLine(132, 56, 132, 84, K.pen, 1.4) +
      fcLine(146, 70, 176, 70) + fcLine(176, 70, 176, 36) + fcCircle(176, 32, 5, { fill: K.paper, w: 2.2 }) +
      fcLine(108, 84, 108, 104, K.pen, 1.8) + fcBox(92, 104, 32, 22, { cross: true, fill: K.paper }) +
      `<path d="M192 44A18 18 0 0 1 196 18" fill="none" stroke="${K.green}" stroke-width="3" stroke-linecap="round"/>` + fcArrow(193, 24, 196, 17, K.green, 3),
    t: fcText(206, 56, 'turn', { col: K.green, size: 14, anchor: 'middle' }) + fcText(150, 143, 'rope winds in', { size: 14 })
  };
  /* incline: ramp, box pushed up it, height marked (3 m ramp, 1.2 m rise, 441 N weight needs only 176 N) */
  {
    const x0 = 28, x1 = 175, yb = 124, rise = 64, ang = Math.atan2(rise, x1 - x0), ux = Math.cos(ang), uy = -Math.sin(ang);
    const bx = 98, by = yb - (bx - x0) * Math.tan(ang), cx = bx - uy * 14 * -1 * 0 + 0, ccx = bx + 12 * Math.sin(ang), ccy = by - 12 * Math.cos(ang);
    FC_ART.incline = {
      alt: 'A ramp 3 metres long rising 1.2 metres, with a box on it and a green arrow pushing the box up the slope with 176 newtons, smaller than lifting it straight up.',
      s: fcC_poly([[x0, yb], [x1, yb], [x1, yb - rise]]) +
        `<g transform="translate(${fcN(bx)} ${fcN(by)}) rotate(${fcN(-ang * 180 / Math.PI)})">${fcBox(-17, -26, 34, 26, { cross: true, fill: K.paper })}</g>` +
        fcArrow(ccx - 62 * ux, ccy - 62 * uy, ccx - 22 * ux, ccy - 22 * uy, K.green) +
        fcC_dimV(194, yb, yb - rise, K.pencil) + fcC_guide(x1 + 2, yb - rise, 200, yb - rise),
      t: fcText(52, 76, '176 N', { col: K.green, size: 14 }) + fcText(198, 96, '1.2 m', { anchor: 'start', size: 14 }) + fcText(124, 142, 'ramp: 3 m long', { size: 14 })
    };
  }
  /* wedge: axe-like wedge hammered into a log, pushing the wood apart */
  FC_ART.wedge = {
    alt: 'A wedge hammered down into a log: the red arrow pushes the wedge down and green arrows show the wood pushed apart to each side.',
    s: fcBox(30, 86, 180, 40, { fill: K.paper }) + fcLine(120, 104, 114, 114, K.pen, 2) + fcLine(114, 114, 122, 124, K.pen, 2) +
      fcC_poly([[100, 34], [140, 34], [120, 104]], { fill: K.paper }) + fcLine(104, 24, 136, 24, K.pen, 3.2) +
      fcArrow(120, 2, 120, 22, K.red) + fcArrow(106, 92, 66, 92, K.green) + fcArrow(134, 92, 174, 92, K.green),
    t: fcText(150, 18, 'hit', { anchor: 'start', col: K.red }) + fcText(120, 143, 'wood pushed apart', { size: 14 })
  };
  /* screw: a screw in wood, spiral ridge labelled */
  { let th = '';
    for (let y = 44; y < 88; y += 10) th += fcLine(88, y + 8, 112, y, K.pen, 2);
    FC_ART.screw = {
      alt: 'A screw driven into a block of wood, with a spiral ridge winding round its shaft.',
      s: fcC_poly([[72, 20], [128, 20], [122, 34], [78, 34]], { fill: K.paper }) + fcLine(92, 27, 108, 27, K.pen, 2) + fcLine(90, 34, 90, 100, K.pen, 2.2) + fcLine(110, 34, 110, 100, K.pen, 2.2) + th +
        fcBox(40, 88, 120, 40, { fill: K.paper }) + fcLine(90, 88, 90, 112, K.pencil, 1.6, '4 3') + fcLine(110, 88, 110, 112, K.pencil, 1.6, '4 3') + fcLine(90, 112, 100, 122, K.pencil, 1.6, '4 3') + fcLine(110, 112, 100, 122, K.pencil, 1.6, '4 3') +
        fcLine(60, 100, 82, 100, K.pencil, 1.2) + fcLine(122, 112, 148, 112, K.pencil, 1.2) + fcC_guide(146, 58, 116, 58),
      t: fcText(148, 58, 'spiral ridge', { anchor: 'start', size: 14, col: K.red })
    }; }
  /* pitch: screw thread zoomed in, one turn */
  { let th = '';
    for (let y = 36; y < 112; y += 20) th += fcLine(62, y + 12, 118, y, K.pen, 2.2);
    FC_ART.pitch = {
      alt: 'A screw with its ridges slanting round the shaft; a red dimension line between two neighbouring ridges shows how far the screw moves forward in one full turn, 1.5 millimetres.',
      s: fcC_poly([[56, 16], [124, 16], [118, 28], [62, 28]], { fill: K.paper }) + fcLine(70, 28, 70, 116, K.pen, 2.4) + fcLine(110, 28, 110, 116, K.pen, 2.4) + fcC_poly([[70, 116], [90, 140], [110, 116]], { open: true }) + th +
        fcC_guide(120, 56, 150, 56) + fcC_guide(120, 76, 150, 76) + fcC_dimV(146, 56, 76, K.red) +
        `<path d="M54 12Q90 -8 128 10" fill="none" stroke="${K.green}" stroke-width="2.6" stroke-linecap="round"/>` + fcArrow(120, 7, 130, 12, K.green, 2.6),
      t: fcText(156, 62, 'one turn', { anchor: 'start', size: 14, col: K.red }) + fcText(156, 80, '= 1.5 mm', { anchor: 'start', size: 14, col: K.red }) + fcText(156, 100, 'forward', { anchor: 'start', size: 14, col: K.red })
    }; }
  /* work: force x distance */
  FC_ART.work = {
    alt: 'A person pushes a box with a 28 newton force along 6 metres; the sum below reads 28 newtons times 6 metres equals 168 joules.',
    s: fcGround(10, 230, 100) + fcPerson(34, 100, { face: 1, lean: 8 }) + fcBox(62, 62, 38, 38, { cross: true, fill: K.paper }) + fcBox(160, 62, 38, 38, { cross: true, col: K.pencil, w: 1.8 }) +
      fcArrow(64, 48, 104, 48, K.red) + fcC_guide(81, 106, 81, 130) + fcC_guide(179, 106, 179, 130) + fcC_dim(81, 179, 124, K.pencil),
    t: fcText(84, 40, '28 N', { col: K.red, size: 14 }) + fcText(130, 142, '6 m', { size: 14 }) + fcText(168, 26, '28 N × 6 m = 168 J', { size: 15, bold: true, col: K.red })
  };
  /* joule: an apple (about 1 N) lifted 1 m */
  FC_ART.joule = {
    alt: 'An apple weighing about 1 newton lifted 1 metre, with the sum 1 newton times 1 metre equals 1 joule.',
    s: fcGround(30, 130, 126) + fcCircle(80, 118, 8, { col: K.pencil, w: 1.6, dash: '3 3' }) + fcLine(80, 108, 80, 104, K.pencil, 1.4) +
      fcCircle(80, 34, 8) + fcLine(80, 26, 82, 20, K.pen, 2) + fcArrow(80, 96, 80, 50, K.pencil, 2) + fcC_dimV(114, 118, 34, K.red),
    t: fcText(106, 80, '1 m', { anchor: 'end', col: K.red, size: 14 }) + fcText(66, 40, '1 N', { anchor: 'end', size: 14 }) + fcText(134, 60, '1 N × 1 m', { anchor: 'start', size: 15 }) + fcText(134, 86, '= 1 J', { anchor: 'start', size: 17, bold: true, col: K.red })
  };
}

{
  const K = FC_INK;
  /* compound: scissors = two levers whose blades are wedges */
  const half = (ox, oy, deg, flip) => `<g transform="translate(${ox} ${oy}) rotate(${deg})">${fcCircle(0, 0, 13, { w: 2.4 })}${fcLine(13, 0, 70, 0, K.pen, 3)}${fcC_poly(flip ? [[66, 3], [186, 0], [66, -8]] : [[66, -3], [186, 0], [66, 8]], { fill: K.paper, w: 2.2 })}</g>`;
  FC_ART.compound = {
    alt: 'A pair of scissors: the two handles are levers and the two blades are wedges, so it is two simple machines working together.',
    s: half(30, 44, 22.4, false) + half(30, 106, -22.4, true) + fcCircle(110, 75, 4, { fill: K.paper, w: 2 }),
    t: fcText(34, 18, 'levers', { size: 14, col: K.red }) + fcText(186, 79, 'wedges', { size: 14, col: K.red })
  };
  /* simplemach: six tiny icons in a grid */
  const ic = (cx, cy, body) => `<g>${body}</g>`;
  const cells = [
    [40, 30, 'lever', fcLine(14, 40, 66, 26, K.pen, 3) + fcC_poly([[40, 33], [32, 46], [48, 46]])],
    [120, 30, 'pulley', fcLine(120, 6, 120, 14, K.pen, 2) + fcCircle(120, 26, 11, { w: 2.2 }) + fcLine(109, 26, 109, 50, K.pen, 1.8) + fcLine(131, 26, 131, 50, K.pen, 1.8) + fcBox(104, 50, 10, 6, { w: 1.8 })],
    [200, 30, 'wheel and axle', fcCircle(200, 28, 17, { w: 2.2 }) + fcCircle(200, 28, 5, { w: 2 }) + fcLine(188, 16, 212, 40, K.pen, 1.4) + fcLine(212, 16, 188, 40, K.pen, 1.4)],
    [40, 100, 'ramp', fcC_poly([[16, 118], [66, 118], [66, 88]])],
    [120, 100, 'wedge', fcC_poly([[106, 118], [134, 118], [120, 80]])],
    [200, 100, 'screw', fcLine(192, 82, 192, 116, K.pen, 2.2) + fcLine(208, 82, 208, 116, K.pen, 2.2) + fcLine(190, 90, 210, 86, K.pen, 1.8) + fcLine(190, 100, 210, 96, K.pen, 1.8) + fcLine(190, 110, 210, 106, K.pen, 1.8) + fcLine(188, 80, 212, 80, K.pen, 2.4)]
  ];
  FC_ART.simplemach = {
    alt: 'Six small sketches in a grid: a lever, a pulley, a wheel and axle, a ramp, a wedge and a screw.',
    s: cells.map(c => c[3]).join('') + fcC_guide(80, 12, 80, 138) + fcC_guide(160, 12, 160, 138) + fcC_guide(8, 72, 232, 72),
    t: cells.map(c => fcText(c[0], c[1] < 60 ? 68 : 140, c[2], { size: 13 })).join('')
  };
  /* efficiency: energy in, useful out (fat), wasted heat (thin) */
  FC_ART.efficiency = {
    alt: 'A machine box: 100 joules of energy go in on a fat arrow, 76 joules come out as useful work on a fat arrow and 24 joules escape as heat on a thin arrow with squiggles. 76 out of 100 is 76% efficient.',
    s: fcBox(84, 54, 66, 42, { r: 4 }) + fcC_fat(6, 84, 75, 20, K.pen) + fcC_fat(150, 234, 75, 15, K.green) + fcArrow(117, 54, 117, 36, K.red, 2.6) + fcC_heat(100, 28, 18) + fcC_heat(117, 24, 18) + fcC_heat(134, 28, 18),
    t: fcText(117, 80, 'machine', { size: 13 }) + fcText(40, 52, '100 J in', { size: 14 }) + fcText(192, 52, '76 J useful', { col: K.green, size: 14 }) + fcText(152, 22, '24 J lost as heat', { anchor: 'start', col: K.red, size: 13 }) + fcText(120, 134, '76 ÷ 100 × 100% = 76%', { size: 16, bold: true })
  };
  /* wasted: rubbing surfaces make heat */
  FC_ART.wasted = {
    alt: 'A block sliding over a rough surface: the rubbing makes red heat squiggles rise, so some of the energy put in is wasted as heat.',
    s: fcBox(30, 108, 180, 14, { fill: K.paper }) + fcBox(78, 66, 70, 36, { fill: K.paper }) + fcLine(78, 102, 86, 108, K.pen, 1.8) + fcLine(92, 108, 98, 102, K.pen, 1.8) + fcLine(104, 102, 112, 108, K.pen, 1.8) + fcLine(118, 108, 124, 102, K.pen, 1.8) + fcLine(130, 102, 138, 108, K.pen, 1.8) +
      fcArrow(158, 84, 204, 84, K.pencil, 2.6) + fcC_heat(70, 104, 30) + fcC_heat(54, 104, 24) + fcC_heat(156, 104, 30),
    t: fcText(46, 52, 'heat', { col: K.red, size: 15, bold: true }) + fcText(120, 142, 'rubbing turns energy into heat', { size: 14 }) + fcText(182, 74, 'moving', { col: K.pencil, size: 13 })
  };
  /* lubricant: oil dripping onto a gear */
  { let teeth = '';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; teeth += `<g transform="translate(166 94) rotate(${i * 45})">${fcBox(-4, -32, 8, 12, { r: 1, w: 2.2 })}</g>`; }
    FC_ART.lubricant = {
      alt: 'An oil can dripping drops of oil onto the teeth of a gear, so the moving parts slide more easily with less friction.',
      s: fcBox(24, 56, 52, 40, { r: 6 }) + fcLine(24, 66, 10, 66) + fcLine(10, 66, 10, 86) + fcLine(10, 86, 24, 86) + fcLine(76, 64, 120, 48, K.pen, 3) + fcLine(120, 48, 128, 60, K.pen, 3) +
        fcCircle(166, 94, 22) + teeth + fcCircle(166, 94, 6, { w: 2 }) + fcC_drop(129, 72, 3.5) + fcC_drop(134, 86, 3.5),
      t: fcText(50, 82, 'oil', { size: 15 }) + fcText(120, 141, 'less friction, less heat', { size: 14 })
    }; }
}
