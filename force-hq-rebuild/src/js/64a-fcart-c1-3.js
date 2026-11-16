/* ===== Flashcard art, Chapters 1-3 (Agent B): pen diagrams for 33 vocabulary words =====
   Each picture is FC_ART[key] = { alt, s, t } in a 240 x 150 box (see 64-fcart-kit.js). Helpers here start with fcB_. */
const fcB_set = (key, alt, s, t) => { FC_ART[key] = { alt, s, t }; };
/* a side-view car. x = left edge, g = ground height, sc = scale (1 = 106 px wide) */
function fcB_car(x, g, sc = 1, col = FC_INK.pen, fill = FC_INK.paper, w = 2.4) {
  const P = (u, v) => `${fcN(x + u * sc)} ${fcN(g + v * sc)}`;
  const body = `<path d="M${P(0, -12)}L${P(0, -24)}L${P(16, -27)}L${P(30, -44)}L${P(70, -44)}L${P(84, -27)}L${P(106, -24)}L${P(106, -12)}Z" fill="${fill}" stroke="${col}" stroke-width="${w}"/>`;
  const win = `<path d="M${P(36, -40)}L${P(36, -28)}L${P(78, -28)}L${P(66, -40)}Z M${P(53, -40)}L${P(53, -28)}" fill="none" stroke="${col}" stroke-width="${fcN(w * .6)}"/>`;
  return body + win + fcCircle(fcN(x + 24 * sc), fcN(g - 9 * sc), fcN(9 * sc), { col, fill, w }) + fcCircle(fcN(x + 82 * sc), fcN(g - 9 * sc), fcN(9 * sc), { col, fill, w });
}
/* a small hand (fist) at (x,y) with a short arm going back from it; face = 1 means the arm comes from the left */
const fcB_hand = (x, y, face = 1) => fcCircle(x, y, 6, { fill: FC_INK.paper }) + fcLine(x - 6 * face, y, x - 20 * face, y, FC_INK.pen, 4);
/* an apple centred at (x,y), radius r */
const fcB_apple = (x, y, r) => fcCircle(x, y, r, { fill: '#fde3e3', col: FC_INK.red }) + fcLine(x, y - r, x + 2, y - r - 7, FC_INK.green, 2.4) + `<path d="M${x + 2} ${y - r - 5}q9 -7 13 0q-8 5 -13 0Z" fill="none" stroke="${FC_INK.green}" stroke-width="2"/>`;
/* a hatched ceiling at height y */
function fcB_ceiling(x1, x2, y, col = FC_INK.pencil) {
  let s = fcLine(x1, y, x2, y, col, 2);
  for (let x = x1 + 6; x < x2; x += 12) s += fcLine(x, y - 2, x + 7, y - 9, col, 1.2);
  return s;
}
/* axes with arrow heads: origin (ox,oy), top of the y axis, end of the x axis */
const fcB_axes = (ox, oy, ytop, xend) => fcArrow(ox, oy, ox, ytop, FC_INK.pen, 2.2) + fcArrow(ox, oy, xend, oy, FC_INK.pen, 2.2);

/* ---------- force ---------- */
fcB_set('force', 'A hand pushes a box on the left, and a hand pulls a box along by a rope on the right, each with a red arrow.',
  fcGround(8, 112, 118) + fcBox(62, 80, 38, 38, { cross: true }) + fcB_hand(30, 99) + fcArrow(36, 99, 58, 99) +
  fcGround(128, 232, 118) + fcBox(134, 80, 38, 38, { cross: true }) + fcLine(172, 98, 208, 98, FC_INK.pencil, 2.4) + fcB_hand(212, 98, -1) + fcArrow(176, 82, 218, 82),
  fcText(56, 58, 'push', { size: 17, col: FC_INK.red }) + fcText(180, 58, 'pull', { size: 17, col: FC_INK.red }));

/* ---------- push ---------- */
fcB_set('push', 'A person pushes a crate to the right. A red arrow shows the crate being pushed away from the person.',
  fcGround(8, 232, 120) + fcPerson(48, 120, { face: 1, lean: 22, arms: 'forward' }) + fcBox(80, 78, 42, 42, { cross: true }) + fcArrow(126, 99, 200, 99),
  fcText(164, 84, 'pushed away', { size: 16, col: FC_INK.red }));

/* ---------- pull ---------- */
fcB_set('pull', 'A person leans back and pulls a crate towards them with a rope. A red arrow points from the crate towards the person.',
  fcGround(8, 232, 120) + fcBox(36, 80, 42, 40, { cross: true }) + fcPerson(190, 120, { face: -1, lean: -18, arms: 'forward' }) + fcLine(78, 100, 168, 83, FC_INK.pencil, 2.4) + fcArrow(84, 66, 146, 66),
  fcText(112, 52, 'pulled towards', { size: 16, col: FC_INK.red }));

/* ---------- newton ---------- */
fcB_set('newton', 'A small apple with a red arrow down from its centre, next to the label "about 1 N".',
  fcB_apple(62, 56, 26) + fcArrow(62, 56, 62, 130),
  fcText(150, 64, '1 N', { size: 40, col: FC_INK.red }) + fcText(150, 92, 'is about the', { size: 15 }) + fcText(150, 112, 'weight of a', { size: 15 }) + fcText(150, 132, 'small apple', { size: 15 }));

/* ---------- newtonmeter ---------- */
{
  const z = n => 28 + n * 6; // pointer height for n newtons
  let s = fcBox(100, 18, 24, 82, { r: 5 });
  // spring coils inside the tube
  let d = 'M112 18L112 22'; for (let i = 0; i < 7; i++) d += `L${i % 2 ? 106 : 118} ${26 + i * 4.5}`; d += `L112 ${z(4) - 2}L112 100`;
  s += `<path d="${d}" stroke="${FC_INK.pen}" stroke-width="2" fill="none"/>`;
  for (let n = 0; n <= 10; n++) s += fcLine(124, z(n), n % 5 ? 130 : 136, z(n), FC_INK.pen, n % 5 ? 1.4 : 2);
  s += fcArrow(74, z(4), 98, z(4)) + fcLine(100, z(4), 126, z(4), FC_INK.red, 3.4) + fcLine(112, 100, 112, 108, FC_INK.pen, 2.4) + fcCircle(112, 112, 4.5) + fcLine(112, 117, 112, 119, FC_INK.pen, 2.4) + fcBox(92, 119, 40, 23, { r: 3, fill: FC_INK.paper });
  s += fcCircle(112, 11, 4);
  fcB_set('newtonmeter', 'A spring balance hangs from a ring with a scale from 0 to 10 newtons. A mass on the hook stretches the spring and the red pointer reads 4 newtons.', s,
    fcText(142, z(0) + 5, '0', { anchor: 'start', size: 14 }) + fcText(142, z(5) + 5, '5', { anchor: 'start', size: 14 }) + fcText(142, z(10) + 5, '10', { anchor: 'start', size: 14 }) +
    fcText(70, z(4) + 5, '4 N', { anchor: 'end', col: FC_INK.red, size: 16 }) + fcText(112, 135, '400 g', { size: 13 }) + fcText(190, 88, 'spring', { size: 14, col: FC_INK.pencil }));
}

/* ---------- resultant ---------- */
fcB_set('resultant', 'A crate has a 30 N arrow to the left and a 50 N arrow to the right. Below, one single 20 N arrow to the right shows the overall force.',
  fcBox(96, 18, 48, 40) + fcArrow(96, 38, 50, 38) + fcArrow(144, 38, 214, 38, FC_INK.green) +
  fcLine(14, 76, 226, 76, FC_INK.pencil, 1.5, '4 5') + fcArrow(110, 112, 158, 112, FC_INK.red, 3.4),
  fcText(72, 28, '30 N', { size: 15 }) + fcText(180, 28, '50 N', { size: 15, col: FC_INK.green }) +
  fcText(98, 119, '=', { size: 26, anchor: 'end' }) + fcText(166, 119, '20 N', { size: 18, anchor: 'start', col: FC_INK.red, bold: true }));

/* ---------- balanced ---------- */
fcB_set('balanced', 'A tug of war with a person on each side pulling a rope. Two equal 23 N arrows point opposite ways and the total is 0 N.',
  fcGround(8, 232, 122) + fcPerson(46, 122, { face: 1, lean: -16, arms: 'forward' }) + fcPerson(194, 122, { face: -1, lean: -16, arms: 'forward' }) +
  fcLine(64, 84, 176, 84, FC_INK.pencil, 2.6) + fcLine(120, 78, 120, 90, FC_INK.red, 3) + fcArrow(112, 56, 70, 56) + fcArrow(128, 56, 170, 56, FC_INK.green),
  fcText(91, 44, '23 N', { size: 15 }) + fcText(149, 44, '23 N', { size: 15, col: FC_INK.green }) + fcText(120, 112, 'total 0 N', { size: 17, bold: true }));

/* ---------- unbalanced ---------- */
fcB_set('unbalanced', 'A crate with a short 20 N arrow to the left and a long 45 N arrow to the right, so it moves right. A grey arrow shows its motion.',
  fcGround(8, 232, 92) + fcBox(92, 52, 56, 40, { cross: true }) + fcArrow(92, 72, 58, 72) + fcArrow(148, 72, 222, 72, FC_INK.green) +
  fcArrow(84, 124, 164, 124, FC_INK.pencil, 2.6),
  fcText(74, 60, '20 N', { size: 15 }) + fcText(186, 60, '45 N', { size: 15, col: FC_INK.green }) + fcText(124, 144, 'it moves this way', { size: 14, col: FC_INK.pencil }));

/* ---------- friction ---------- */
{
  let zig = 'M10 100'; for (let x = 16; x < 150; x += 8) zig += `L${x} ${(x / 8) % 2 ? 96 : 102}`;
  let zl = 'M158 78', zu = 'M158 70';
  for (let i = 0; i < 9; i++) { const x = 166 + i * 8; zl += `L${x} ${i % 2 ? 80 : 74}`; zu += `L${x} ${i % 2 ? 72 : 66}`; }
  fcB_set('friction', 'A box slides right over a rough surface. A red arrow along the surface points left, against the motion, and a zoomed circle shows the rough bumps catching.',
    `<path d="${zig}" stroke="${FC_INK.pencil}" stroke-width="2" fill="none"/>` + fcBox(58, 64, 56, 34, { cross: true }) + fcArrow(58, 84, 14, 84) + fcArrow(62, 48, 116, 48, FC_INK.pencil, 2.4) +
    fcCircle(194, 60, 38, { fill: FC_INK.paper, col: FC_INK.pencil, w: 1.8 }) + `<path d="${zl}" stroke="${FC_INK.pencil}" stroke-width="2.2" fill="none"/><path d="${zu}" stroke="${FC_INK.pen}" stroke-width="2.2" fill="none"/>` +
    fcLine(118, 98, 166, 80, FC_INK.pencil, 1.2, '3 4'),
    fcText(90, 38, 'motion', { size: 14, col: FC_INK.pencil }) + fcText(36, 122, 'rough surface', { size: 14, col: FC_INK.pencil, anchor: 'start' }) + fcText(196, 118, 'zoomed in', { size: 14, col: FC_INK.pencil }));
}

/* ---------- weight ---------- */
fcB_set('weight', 'A ball with a long red arrow pointing straight down from its centre. The labels say 5 kg times 9.8 N per kg gives 49 N.',
  fcCircle(66, 40, 22, { fill: '#e8eefc' }) + fcArrow(66, 40, 66, 132),
  fcText(150, 48, '5 kg', { size: 24, bold: true, anchor: 'start' }) + fcText(150, 80, '× 9.8 N/kg', { size: 16, anchor: 'start', col: FC_INK.pencil }) + fcText(80, 112, '49 N', { size: 24, bold: true, anchor: 'start', col: FC_INK.red }));

/* ---------- mass ---------- */
{
  const crate = x => fcBox(x, 62, 46, 38, { fill: FC_INK.paper });
  const earth = fcCircle(62, 26, 13, { fill: '#dfeaff' }) + `<path d="M55 22q5 -5 9 0q3 5 -3 8q-5 -1 -6 -8Z" fill="none" stroke="${FC_INK.green}" stroke-width="2"/>`;
  const moon = fcCircle(178, 26, 13, { fill: '#f1f1ee', col: FC_INK.pencil }) + fcCircle(174, 22, 2.5, { col: FC_INK.pencil, w: 1.5 }) + fcCircle(183, 30, 3, { col: FC_INK.pencil, w: 1.5 });
  fcB_set('mass', 'A 12 kg crate on Earth and the same 12 kg crate on the Moon. An equals sign shows the number does not change.',
    earth + moon + fcGround(8, 112, 100) + crate(40) + fcGround(128, 232, 100) + crate(156),
    fcText(62, 88, '12 kg', { size: 16, bold: true }).replace('x="62"', 'x="63"') + fcText(179, 88, '12 kg', { size: 16, bold: true }) +
    fcText(120, 86, '=', { size: 30, col: FC_INK.red }) + fcText(60, 128, 'Earth', { size: 16 }) + fcText(180, 128, 'Moon', { size: 16 }));
}

/* ---------- gravity ---------- */
fcB_set('gravity', 'The Earth in the middle with four small balls around it. A red arrow on each ball points to the centre of the Earth.',
  fcCircle(120, 78, 28, { fill: '#dfeaff' }) + fcCircle(120, 78, 2.5, { col: FC_INK.red, fill: FC_INK.red, w: 1 }) +
  fcCircle(120, 14, 6, { fill: FC_INK.paper }) + fcArrow(120, 24, 120, 46) + fcCircle(120, 140, 6, { fill: FC_INK.paper }) + fcArrow(120, 130, 120, 110) +
  fcCircle(52, 78, 6, { fill: FC_INK.paper }) + fcArrow(62, 78, 86, 78) + fcCircle(188, 78, 6, { fill: FC_INK.paper }) + fcArrow(178, 78, 154, 78),
  fcText(120, 98, 'centre', { size: 13, col: FC_INK.pen }).replace(/y="98"/, 'y="97"'));

/* ---------- normal ---------- */
fcB_set('normal', 'A book rests on a table. A green arrow points up from the centre of the book and an equal red arrow points down.',
  fcGround(36, 204, 104) +
  fcBox(92, 62, 56, 42, { fill: FC_INK.paper }) + fcLine(98, 62, 98, 104, FC_INK.pen, 1.4) +
  fcArrow(120, 83, 120, 24, FC_INK.green) + fcArrow(120, 83, 120, 142),
  fcText(132, 36, 'from the table', { size: 15, col: FC_INK.green, anchor: 'start' }) + fcText(132, 132, 'from Earth', { size: 15, col: FC_INK.red, anchor: 'start' }));

/* ---------- tension ---------- */
fcB_set('tension', 'A bucket hangs from the ceiling on a stretched rope. A red arrow along the rope points up.',
  fcB_ceiling(70, 170, 18) + fcLine(120, 18, 120, 86, FC_INK.pen, 2) + fcArrow(120, 84, 120, 34, FC_INK.red, 3.4) +
  `<path d="M100 88L140 88L134 130L106 130Z" fill="#e8eefc" stroke="${FC_INK.pen}" stroke-width="2.4"/>` + fcLine(100, 88, 140, 88, FC_INK.pen, 3),
  fcText(134, 54, 'the rope', { size: 15, anchor: 'start', col: FC_INK.red }) + fcText(134, 72, 'pulls up', { size: 15, anchor: 'start', col: FC_INK.red }));

/* ---------- airres ---------- */
{
  const sl = y => `<path d="M12 ${y}C80 ${y} 100 ${y + (y < 80 ? -9 : 9)} 140 ${y + (y < 80 ? -9 : 9)}S200 ${y} 228 ${y}" stroke="${FC_INK.pencil}" stroke-width="1.6" fill="none"/>`;
  fcB_set('airres', 'A ball moves to the right through air shown by curved lines. A red arrow from the ball points left, against its motion.',
    sl(48) + sl(33) + sl(114) + sl(129) + fcCircle(140, 80, 22, { fill: '#e8eefc' }) + fcArrow(140, 80, 62, 80) + fcArrow(172, 80, 224, 80, FC_INK.pencil, 2.4),
    fcText(78, 104, 'air pushes back', { size: 15, col: FC_INK.red }) + fcText(198, 70, 'moves', { size: 14, col: FC_INK.pencil }));
}

/* ---------- contact ---------- */
fcB_set('contact', 'A foot kicks a football. The boot is touching the ball and a red arrow shows the ball being pushed away.',
  fcGround(8, 232, 122) + fcCircle(44, 16, 7) + fcLine(45, 23, 50, 70) + fcLine(47, 34, 30, 54) + fcLine(47, 34, 68, 48) + fcLine(50, 70, 46, 122) + fcLine(46, 122, 60, 122) + fcLine(50, 70, 70, 92) + fcLine(70, 92, 88, 102) +
  `<path d="M84 98L98 102L102 114L88 114Z" fill="${FC_INK.paper}" stroke="${FC_INK.pen}" stroke-width="2.4"/>` +
  fcCircle(116, 108, 14, { fill: '#e8eefc' }) + fcArrow(134, 108, 204, 108) +
  fcLine(100, 94, 106, 88, FC_INK.pencil, 1.6) + fcLine(108, 98, 116, 92, FC_INK.pencil, 1.6) + fcLine(96, 90, 98, 82, FC_INK.pencil, 1.6),
  fcText(150, 66, 'touching!', { size: 18, col: FC_INK.pen }) + fcText(170, 96, 'kicked away', { size: 14, col: FC_INK.red }));

/* ---------- noncontact ---------- */
fcB_set('noncontact', 'An apple hangs in the air above the ground with a gap between them. A red arrow pulls it down across the gap.',
  fcGround(8, 232, 118) + fcB_apple(80, 30, 16) + fcArrow(80, 30, 80, 92) + fcArrow(132, 82, 132, 54, FC_INK.pencil, 2) + fcArrow(132, 90, 132, 116, FC_INK.pencil, 2),
  fcText(70, 74, 'gravity', { size: 15, col: FC_INK.red, anchor: 'end' }) + fcText(144, 90, 'a gap,', { size: 15, anchor: 'start' }) + fcText(144, 108, 'no touching', { size: 15, anchor: 'start' }));

/* ---------- magnetic ---------- */
{
  const mag = x => fcBox(x, 52, 30, 26, { fill: '#f8d4d4' }) + fcBox(x + 30, 52, 30, 26, { fill: '#d4e3f8' });
  fcB_set('magnetic', 'Two bar magnets face each other with unlike poles close. Red arrows between them point towards each other, so they pull together.',
    mag(24) + mag(156) +
    `<path d="M156 52Q120 22 84 52M156 78Q120 108 84 78" stroke="${FC_INK.pencil}" stroke-width="1.6" fill="none" stroke-dasharray="4 4"/>` + fcArrow(92, 65, 114, 65) + fcArrow(148, 65, 126, 65),
    fcText(39, 71, 'N', { size: 18, bold: true, col: FC_INK.red }) + fcText(69, 71, 'S', { size: 18, bold: true }) + fcText(171, 71, 'N', { size: 18, bold: true, col: FC_INK.red }) + fcText(201, 71, 'S', { size: 18, bold: true }) +
    fcText(120, 126, 'they pull together', { size: 16, col: FC_INK.red }));
}

/* ---------- fbd ---------- */
fcB_set('fbd', 'A crate with four arrows starting at its centre: weight down, normal force up, push to the right and friction to the left, with the right arrow longer.',
  fcBox(102, 57, 36, 36, { fill: FC_INK.paper }) +
  fcArrow(120, 75, 120, 130, FC_INK.red) + fcArrow(120, 75, 120, 20, FC_INK.green) + fcArrow(120, 75, 206, 75, FC_INK.red) + fcArrow(120, 75, 62, 75, FC_INK.green) + fcCircle(120, 75, 2.6, { fill: FC_INK.pen, w: 1 }),
  fcText(130, 126, 'weight 49 N', { size: 14, anchor: 'start', col: FC_INK.red }) + fcText(130, 34, 'normal 49 N', { size: 14, anchor: 'start', col: FC_INK.green }) +
  fcText(140, 64, 'push 78 N', { size: 14, anchor: 'start', col: FC_INK.red }) + fcText(98, 64, 'friction 53 N', { size: 14, anchor: 'end', col: FC_INK.green }));

/* ---------- arrow ---------- */
fcB_set('arrow', 'Two red arrows drawn from the same left edge: a short one labelled 10 N and a much longer one labelled 40 N.',
  fcArrow(20, 44, 50, 44, FC_INK.red, 3.4) + fcArrow(20, 100, 140, 100, FC_INK.red, 3.4) + fcLine(20, 36, 20, 108, FC_INK.pencil, 1.2, '3 4'),
  fcText(62, 50, '10 N', { size: 18, anchor: 'start', bold: true }) + fcText(152, 106, '40 N', { size: 18, anchor: 'start', bold: true }) + fcText(120, 140, 'longer arrow, bigger force', { size: 14, col: FC_INK.pencil }));

/* ---------- scale ---------- */
{
  let g = ''; for (let i = 0; i <= 7; i++) g += fcLine(36 + i * 24, 52, 36 + i * 24, 100, FC_INK.pencil, 1.1); for (let j = 0; j <= 2; j++) g += fcLine(36, 52 + j * 24, 204, 52 + j * 24, FC_INK.pencil, 1.1);
  fcB_set('scale', 'A grid of squares with a red arrow four squares long labelled 200 N. A highlighted square shows that one square stands for 50 N.',
    fcHi(36, 52, 24, 24) + g + fcArrow(36, 76, 132, 76, FC_INK.red, 3.6),
    fcText(84, 44, '200 N', { size: 18, bold: true, col: FC_INK.red }) + fcText(120, 126, '1 square = 50 N', { size: 18 }));
}

/* ---------- inertia ---------- */
fcB_set('inertia', 'A bus brakes and stops. The passenger inside keeps moving forward and leans over, shown by a red arrow.',
  fcGround(8, 232, 114) + fcBox(14, 34, 212, 66, { r: 8, fill: FC_INK.paper }) + fcBox(192, 40, 26, 24, { col: FC_INK.pencil, w: 1.6 }) + fcCircle(58, 104, 10, { fill: FC_INK.paper }) + fcCircle(178, 104, 10, { fill: FC_INK.paper }) +
  fcPerson(100, 100, { face: 1, lean: 28, arms: 'down' }) + fcArrow(124, 54, 180, 54),
  fcText(120, 22, 'the bus brakes', { size: 16 }) + fcText(124, 88, 'body keeps moving', { size: 14, col: FC_INK.red, anchor: 'start' }));

/* ---------- velocity ---------- */
fcB_set('velocity', 'A car drives to the right with a red arrow above it and the label 12 m/s, showing how fast and which way.',
  fcGround(8, 232, 112) + fcB_car(56, 112) + fcArrow(60, 56, 168, 56),
  fcText(114, 34, '12 m/s', { size: 24, bold: true, col: FC_INK.red }) + fcText(190, 62, 'this way', { size: 14, col: FC_INK.pencil, anchor: 'start' }).replace('x="190"', 'x="178"'));

/* ---------- vtgraph ---------- */
fcB_set('vtgraph', 'A graph with velocity up the side and time along the bottom. The line is flat, then slopes down to zero.',
  fcB_axes(40, 118, 14, 226) + `<path d="M40 40L116 40L192 118" stroke="${FC_INK.red}" stroke-width="3.4" fill="none"/>`,
  fcText(19, 66, 'velocity', { size: 15, rot: -90 }) + fcText(190, 138, 'time', { size: 15 }) + fcText(78, 30, 'steady', { size: 15 }) + fcText(190, 62, 'slowing', { size: 15, col: FC_INK.red }) + fcText(190, 78, 'down', { size: 15, col: FC_INK.red }));

/* ---------- brake ---------- */
fcB_set('brake', 'A spinning wheel with a brake pad pressing on top of the rim. A green arrow presses the pad down and a red arrow on the rim points left against the spin.',
  fcCircle(104, 94, 36, { fill: FC_INK.paper }) + fcCircle(104, 94, 5) + fcLine(104, 58, 104, 130, FC_INK.pen, 1.4) + fcLine(68, 94, 140, 94, FC_INK.pen, 1.4) +
  fcBox(84, 40, 40, 16, { r: 3, fill: '#d9d9d2', col: FC_INK.pencil }) + fcArrow(104, 8, 104, 38, FC_INK.green, 3.4) + fcArrow(82, 48, 34, 48) +
  `<path d="M150 74Q166 96 150 120" stroke="${FC_INK.pencil}" stroke-width="2" fill="none"/>` + fcArrow(160, 106, 151, 119, FC_INK.pencil, 2),
  fcText(10, 36, 'slows it', { size: 15, anchor: 'start', col: FC_INK.red }) + fcText(196, 100, 'spinning', { size: 14, col: FC_INK.pencil }) + fcText(118, 30, 'pad presses', { size: 14, anchor: 'start', col: FC_INK.green }));

/* ---------- brakingdist ---------- */
fcB_set('brakingdist', 'A car where the brakes come on, a dashed line there, and a faint car where it stops. A red double arrow below shows the distance between the two.',
  fcGround(8, 232, 100) + fcB_car(18, 100, 0.7) + fcB_car(126, 100, 0.7, FC_INK.pencil, 'none', 1.6) +
  fcLine(92, 46, 92, 112, FC_INK.pencil, 1.6, '4 4') + fcLine(200, 46, 200, 112, FC_INK.pencil, 1.6, '4 4') + fcArrow(96, 124, 196, 124, FC_INK.red, 2.6) + fcArrow(196, 124, 96, 124, FC_INK.red, 2.6),
  fcText(92, 38, 'brakes on', { size: 15 }) + fcText(200, 38, 'stopped', { size: 15 }) + fcText(146, 146, 'how far it goes', { size: 14, col: FC_INK.red }).replace('y="146"', 'y="143"'));

/* ---------- newton1 ---------- */
{
  const puck = (x, col, w) => `<path d="M${x - 22} 90V100Q${x} 108 ${x + 22} 100V90" fill="${col === FC_INK.pen ? '#e8eefc' : 'none'}" stroke="${col}" stroke-width="${w}"/>` + `<ellipse cx="${x}" cy="90" rx="22" ry="6" fill="${col === FC_INK.pen ? '#e8eefc' : 'none'}" stroke="${col}" stroke-width="${w}"/>`;
  fcB_set('newton1', 'A puck on ice shown at three equally spaced positions as it glides right. Equal grey arrows show a steady velocity and no other arrows are drawn.',
    fcLine(8, 106, 232, 106, FC_INK.pencil, 2) + fcLine(30, 114, 90, 114, FC_INK.pencil, 1.2) + fcLine(130, 114, 200, 114, FC_INK.pencil, 1.2) +
    puck(44, FC_INK.pencil, 1.6) + puck(120, FC_INK.pencil, 1.6) + puck(196, FC_INK.pen, 2.4) +
    fcArrow(168, 62, 224, 62, FC_INK.pencil, 2.4) + fcArrow(92, 62, 148, 62, FC_INK.pencil, 2.4) + fcArrow(16, 62, 72, 62, FC_INK.pencil, 2.4),
    fcText(120, 30, 'keeps going', { size: 20, bold: true }) + fcText(120, 140, 'nothing speeds it up or slows it down', { size: 14, col: FC_INK.pencil }).replace('nothing speeds it up or slows it down', 'same gap each time'));
}

/* ---------- slope ---------- */
fcB_set('slope', 'A graph with two lines from the same start. A steep red line rises quickly and a shallow green line rises slowly.',
  fcB_axes(36, 106, 14, 226) + fcLine(36, 106, 110, 26, FC_INK.red, 3.4) + fcLine(36, 106, 200, 64, FC_INK.green, 3.4),
  fcText(19, 64, 'velocity', { size: 14, rot: -90 }) + fcText(210, 124, 'time', { size: 14 }) + fcText(120, 34, 'steep', { size: 15, col: FC_INK.red, anchor: 'start' }) + fcText(178, 92, 'shallow', { size: 15, col: FC_INK.green, anchor: 'start' }) +
  fcText(120, 144, 'steeper = bigger acceleration', { size: 14, col: FC_INK.pencil }));

/* ---------- acceleration ---------- */
{
  const xs = [26, 56, 104, 176];
  let s = fcLine(8, 100, 232, 100, FC_INK.pencil, 1.6), t = '';
  xs.forEach((x, i) => { s += fcLine(x, 82, x, 100, FC_INK.pencil, 1.2, '3 3') + fcCircle(x, 66, 8, { fill: i == 3 ? '#fde3e3' : FC_INK.paper, col: i == 3 ? FC_INK.red : FC_INK.pen }); t += fcText(x, 118, i + ' s', { size: 14 }); });
  s += fcArrow(188, 66, 228, 66, FC_INK.pencil, 2.4);
  fcB_set('acceleration', 'A ball shown at 0, 1, 2 and 3 seconds. The gaps between positions get bigger each time, so it is speeding up.', s,
    t + fcText(120, 36, 'gaps get bigger', { size: 18, bold: true, col: FC_INK.red }) + fcText(120, 142, 'same time each step', { size: 14, col: FC_INK.pencil }));
}

/* ---------- mps2 ---------- */
{
  const xs = [22, 76, 130, 184]; let s = '', t = '';
  xs.forEach((x, i) => { s += fcCircle(x, 34, 7, { fill: FC_INK.paper }); if (i) s += fcArrow(x + 8, 34, x + 8 + i * 13.5, 34, FC_INK.red, 2.6); t += fcText(x, 76, (i * 2) + ' m/s', { size: 14 }); });
  for (let i = 0; i < 3; i++) { s += fcArrow(xs[i] + 8, 110, xs[i + 1] - 8, 110, FC_INK.pencil, 2); t += fcText((xs[i] + xs[i + 1]) / 2, 98, '+2', { size: 16, col: FC_INK.red, bold: true }); }
  fcB_set('mps2', 'A ball with red velocity arrows that grow longer, labelled 0, 2, 4 and 6 m/s. Between each one is +2, one second apart.', s,
    t + fcText(120, 140, '+2 m/s every second', { size: 18, bold: true }));
}

/* ---------- newton2 ---------- */
fcB_set('newton2', 'Two carts pushed by the same 10 N arrow. The small cart gets a long acceleration arrow and the big heavy cart gets a short one.',
  fcGround(8, 232, 56) + fcBox(72, 34, 34, 22, { fill: '#e8eefc' }) + fcArrow(24, 45, 68, 45) + fcArrow(112, 45, 164, 45, FC_INK.green, 3) +
  fcGround(8, 232, 114) + fcBox(72, 70, 54, 44, { fill: '#e8eefc' }) + fcArrow(24, 92, 68, 92) + fcArrow(132, 92, 156, 92, FC_INK.green, 3),
  fcText(46, 32, '10 N', { size: 14, col: FC_INK.red }) + fcText(89, 50, '2 kg', { size: 13 }) + fcText(170, 50, '5 m/s²', { size: 15, anchor: 'start', col: FC_INK.green }) +
  fcText(46, 80, '10 N', { size: 14, col: FC_INK.red }) + fcText(99, 96, '5 kg', { size: 14 }) + fcText(162, 98, '2 m/s²', { size: 15, anchor: 'start', col: FC_INK.green }) +
  fcText(120, 140, 'F = m × a', { size: 18, bold: true }));

/* ---------- triangle ---------- */
fcB_set('triangle', 'A triangle split into three parts with F on top and m and a side by side underneath. A note says covering F leaves m times a.',
  fcHi(70, 28, 44, 34) + `<path d="M92 12L22 134L162 134Z" fill="none" stroke="${FC_INK.pen}" stroke-width="2.6"/>` + fcLine(60, 68, 124, 68) + fcLine(92, 68, 92, 134),
  fcText(92, 56, 'F', { size: 30, bold: true, col: FC_INK.red }) + fcText(60, 118, 'm', { size: 30, bold: true }) + fcText(124, 118, 'a', { size: 30, bold: true }) +
  fcText(176, 62, 'cover F:', { size: 15, anchor: 'start', col: FC_INK.pencil }) + fcText(176, 90, 'm × a', { size: 22, bold: true, anchor: 'start', col: FC_INK.red }));

/* ---------- unit ---------- */
{
  const rows = [['49', 'N', 20], ['5', 'kg', 30], ['3', 'm/s²', 54]]; let s = '', t = '';
  rows.forEach(([n, u, w], i) => { const y = 42 + i * 46; t += fcText(92, y, n, { size: 30, bold: true, anchor: 'end' }) + fcText(112, y, u, { size: 30, bold: true, anchor: 'start', col: FC_INK.red });
    s += `<ellipse cx="${112 + w / 2}" cy="${y - 10}" rx="${w / 2 + 9}" ry="19" fill="none" stroke="${FC_INK.red}" stroke-width="2.4"/>`; });
  fcB_set('unit', 'Three measurements, 49 N, 5 kg and 3 m/s², each with its unit circled in red.', s, t);
}
