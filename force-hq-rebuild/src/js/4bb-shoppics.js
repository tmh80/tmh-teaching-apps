/* ===== Chapter 6: labelled pictures for the cards, questions and worksheets (Tom, 1 Nov 2026: "an image of these, labelled, would really support student understanding").
   Plain inline SVG, no <style> blocks (question text is parsed for {0} gaps), same colours as the Workshop scene:
   fulcrum = steel grey, load = green, effort = red. Every picture has a role="img" and an aria-label. Names: pic*, PIC_*. */
const PIC_C = { F: '#4f5d66', L: '#2a7d48', E: '#d6402c', wood: '#c9a36a', wood2: '#a98456', rock: '#8b8f93', ink: '#243038', soft: '#eef2f4', skin: '#e8b896', rope: '#b99a56', steel: '#8e9ca5' };
const picWrap = (w, h, label, body, extra, cap) => `<svg class="pic" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;max-width:${Math.min(w, cap || 360)}px;height:auto;display:block;margin:6px auto${extra ? ';' + extra : ''}">${body}</svg>`;
const picTxt = (x, y, t, col, size, anchor, weight) => `<text x="${x}" y="${y}" fill="${col || PIC_C.ink}" font-size="${size || 13}" font-weight="${weight || 800}" text-anchor="${anchor || 'middle'}" font-family="system-ui, sans-serif">${t}</text>`;
const picArrow = (x1, y1, x2, y2, col, w) => { const a = Math.atan2(y2 - y1, x2 - x1), h = 9, s = 5.5; return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * .7}" y2="${y2 - Math.sin(a) * h * .7}" stroke="${col}" stroke-width="${w || 4}" stroke-linecap="round"/><polygon points="${x2},${y2} ${x2 - Math.cos(a) * h + Math.sin(a) * s},${y2 - Math.sin(a) * h - Math.cos(a) * s} ${x2 - Math.cos(a) * h - Math.sin(a) * s},${y2 - Math.sin(a) * h + Math.cos(a) * s}" fill="${col}"/>`; };
const picHand = (x, y) => `<rect x="${x - 10}" y="${y - 10}" width="20" height="20" rx="8" fill="${PIC_C.skin}"/>`;
const picTri = (x, y, w, h, col) => `<polygon points="${x - w / 2},${y + h} ${x + w / 2},${y + h} ${x},${y}" fill="${col}"/>`;
const picRock = (x, y, w, h, label) => `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="${h / 2.2}" fill="${PIC_C.rock}"/>${label ? picTxt(x, y - h / 2 + 4, label, '#fff', 11) : ''}`;
/* ---------- label boxes (Tom, 1 Nov 2026: labels sit in white text boxes, like a text box in Word, and the leader line stops at the box edge) ----------
   picLabel(px, py, bx, by, lines, col, opts): (px, py) is the point on the drawing being labelled, (bx, by) is the CENTRE of the box, lines = [name, plain words (optional)].
   It returns { line, box }: draw every label's line first and every box last with picLabs([...]), so boxes sit on top of lines and drawing parts.
   picNote(bx, by, lines, col, opts) is a caption in the same kind of box with no leader line.
   Box width is estimated (no DOM to measure while building a string): the longest line's characters x font size x PIC_CW, plus 12. opts.dim fades the label. */
const PIC_CW = 0.58;
const picTextW = (t, size) => String(t).replace(/<[^>]*>/g, '').replace(/&[a-z#0-9]+;/g, 'x').length * size * PIC_CW;
function picBox(bx, by, rows, col, dim, W) {   // rows: [{ t, size, weight, col }]; W (optional) keeps the box inside a picture that is W wide
  const lh = r => r.size + 3, w = Math.max(...rows.map(r => picTextW(r.t, r.size))) + 12, h = 10 + rows.reduce((a, r) => a + lh(r), 0);
  if (W) bx = Math.min(Math.max(bx, w / 2 + 2), W - w / 2 - 2);
  const x = bx - w / 2, y = by - h / 2;
  let t = '', acc = y + 5;
  rows.forEach(r => { t += `<text x="${bx}" y="${(acc + r.size * 0.9).toFixed(1)}" fill="${r.col}" font-size="${r.size}" font-weight="${r.weight}" text-anchor="middle" font-family="system-ui, sans-serif">${r.t}</text>`; acc += lh(r); });
  return { w, h, x, y, bx, svg: `<g opacity="${dim ? .28 : 1}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="5" fill="#fff" stroke="${col}" stroke-width="1.5"/>${t}</g>` };
}
function picLabel(px, py, bx, by, lines, col, o) {
  o = o || {}; const rows = [{ t: lines[0], size: 14, weight: 800, col }]; if (lines[1]) rows.push({ t: lines[1], size: 11, weight: 600, col: PIC_C.ink });
  const B = picBox(bx, by, rows, col, o.dim, o.W); bx = B.bx; let line = '';
  if (px != null) {
    const vx = px - bx, vy = py - by, k = Math.min(vx ? (B.w / 2) / Math.abs(vx) : Infinity, vy ? (B.h / 2) / Math.abs(vy) : Infinity);   // where the line from the box centre to the labelled point crosses the box edge
    const ex = bx + vx * k, ey = by + vy * k;
    line = `<g opacity="${o.dim ? .28 : 1}">${k < 1 ? `<line x1="${px}" y1="${py}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${col}" stroke-width="1.5" stroke-linecap="round"/>` : ''}<circle cx="${px}" cy="${py}" r="3" fill="${col}"/></g>`;
  }
  return { line, box: B.svg, b: B };
}
function picNote(bx, by, lines, col, o) {
  o = o || {}; const size = o.size || 12, B = picBox(bx, by, lines.map((t, i) => ({ t, size, weight: i === 0 ? 800 : 600, col: i === 0 || o.all ? col : PIC_C.ink })), col, o.dim, o.W);
  return { line: '', box: B.svg, b: B };
}
const picLW = lines => Math.max(picTextW(lines[0], 14), lines[1] ? picTextW(lines[1], 11) : 0) + 12;   // the width picLabel will give a box
const picLabs = arr => arr.map(l => l.line).join('') + arr.map(l => l.box).join('');

/* ---------- a lever. o.mid = 'F' (fulcrum in the middle), 'L' (load in the middle) or 'E' (effort in the middle).
   o.show = which labels to show ('FLE' by default); o.focus = one letter to highlight while the others are dimmed;
   o.names = { L: 'the rock' } plain words under a label; o.letters = true puts A, B, C on the parts instead of names (for label-it questions);
   o.title = a caption above; o.flip = true mirrors it (load on the right). ---------- */
function picLever(o) {
  o = Object.assign({ mid: 'F', show: 'FLE', focus: null, names: {}, letters: false, title: '', flip: false, w: 380 }, o || {});
  const W = o.w, top = o.title ? 24 : 0, H = (o.letters ? 196 : 206) + top, y = 104 + top, xa = 50, xm = W / 2, xb = W - 50;
  const pos = o.mid === 'F' ? { L: xa, F: xm, E: xb } : o.mid === 'L' ? { F: xa, L: xm, E: xb } : { F: xa, E: xm, L: xb };
  if (o.flip) Object.keys(pos).forEach(k => pos[k] = W - pos[k]);
  const effDown = o.mid === 'F', dim = k => o.focus && o.focus !== k;
  let b = '';
  if (o.title) b += picTxt(W / 2, 18, o.title, PIC_C.ink, 13, 'middle', 800);
  b += `<rect x="${xa - 14}" y="${y - 6}" width="${xb - xa + 28}" height="12" rx="6" fill="${PIC_C.wood}"/>`;
  b += picTri(pos.F, y + 6, 34, 38, PIC_C.F);
  b += picRock(pos.L, y - 6, 46, 34, '');
  b += effDown ? picArrow(pos.E, y + 10, pos.E, y + 52, PIC_C.E, 4) + picHand(pos.E, y + 62) : picArrow(pos.E, y - 10, pos.E, y - 52, PIC_C.E, 4) + picHand(pos.E, y - 62);
  const L = o.letters ? (typeof o.letters === 'object' ? o.letters : { F: 'A', L: 'B', E: 'C' }) : null, nm = { F: 'Fulcrum', L: 'Load', E: 'Effort' }, col = { F: PIC_C.F, L: PIC_C.L, E: PIC_C.E };
  const sub = { F: o.names.F || 'the pivot', L: o.names.L || 'the rock', E: o.names.E || 'your pull' };
  if (o.letters) {
    const at = { F: [pos.F, y + 64], L: [pos.L, y - 52], E: [pos.E + 24, effDown ? y + 40 : y - 36] };
    Object.keys(L).forEach(k => { const [x, yy] = at[k]; b += `<circle cx="${x}" cy="${yy - 5}" r="13" fill="#fff" stroke="${PIC_C.ink}" stroke-width="2"/>` + picTxt(x, yy, L[k], PIC_C.ink, 14); });
  } else {
    const labs = [];
    if (o.show.includes('F')) labs.push(picLabel(pos.F, y + 34, pos.F, y + 76, [nm.F, sub.F], col.F, { dim: dim('F'), W }));
    if (o.show.includes('L')) labs.push(picLabel(pos.L, y - 34, pos.L, y - 70, [nm.L, sub.L], col.L, { dim: dim('L'), W }));
    if (o.show.includes('E')) {   // beside the hand, on the side away from the other labels
      const side = pos.E > W / 2 ? -1 : pos.E < W / 2 ? 1 : (pos.L > W / 2 ? -1 : 1), hy = effDown ? y + 62 : y - 62, w = picLW([nm.E, sub.E]);
      labs.push(picLabel(pos.E + side * 10, hy, pos.E + side * (24 + w / 2), hy, [nm.E, sub.E], col.E, { dim: dim('E'), W }));
    }
    b += picLabs(labs);
  }
  const lab = o.letters ? 'A lever with three parts marked A, B and C' : `A lever with the ${o.mid === 'F' ? 'fulcrum' : o.mid === 'L' ? 'load' : 'effort'} in the middle`;
  return picWrap(W, H, lab, b);
}
/* just the bar and the pivot, for the very first card */
function picBar() {
  const W = 380;
  let b = `<rect x="40" y="88" width="300" height="12" rx="6" fill="${PIC_C.wood}"/>` + picTri(190, 100, 34, 38, PIC_C.F);
  b += picLabs([picLabel(80, 92, 90, 42, ['Lever', 'a strong bar'], PIC_C.wood2, { W }), picLabel(190, 128, 190, 166, ['Fulcrum', 'the pivot it turns on'], PIC_C.F, { W })]);
  return picWrap(W, 192, 'A lever: a strong bar resting on a pivot called the fulcrum', b);
}
/* the three set-ups side by side, each named by what is in the middle (o.classes = true adds Class 1, 2, 3) */
function picThree(o) {
  o = o || {}; const one = (mid, cx, n) => {
    const y = 74, xa = cx - 62, xm = cx, xb = cx + 62, pos = mid === 'F' ? { L: xa, F: xm, E: xb } : mid === 'L' ? { F: xa, L: xm, E: xb } : { F: xa, E: xm, L: xb }, down = mid === 'F';
    let b = `<rect x="${xa - 8}" y="${y - 4}" width="${xb - xa + 16}" height="8" rx="4" fill="${PIC_C.wood}"/>` + picTri(pos.F, y + 4, 22, 24, PIC_C.F) + picRock(pos.L, y - 4, 26, 20, '');
    b += down ? picArrow(pos.E, y + 6, pos.E, y + 32, PIC_C.E, 3) : picArrow(pos.E, y - 6, pos.E, y - 32, PIC_C.E, 3);
    b += picTxt(pos.F, y + 46, 'F', PIC_C.F, 16) + picTxt(pos.L, y - 30, 'L', PIC_C.L, 16) + picTxt(pos.E + 10, down ? y + 30 : y - 20, 'E', PIC_C.E, 16, 'start');
    b += picTxt(cx, 140, (o.classes ? `Class ${n}` : (mid === 'F' ? 'Fulcrum' : mid === 'L' ? 'Load' : 'Effort')), mid === 'F' ? PIC_C.F : mid === 'L' ? PIC_C.L : PIC_C.E, 18) + picTxt(cx, 160, (o.classes ? (mid === 'F' ? 'fulcrum' : mid === 'L' ? 'load' : 'effort') + ' in the middle' : 'in the middle'), mid === 'F' ? PIC_C.F : mid === 'L' ? PIC_C.L : PIC_C.E, 15);
    return b; };
  let b = one('F', 92, 1) + one('L', 272, 2) + one('E', 452, 3);
  b += picNote(272, 192, ['F = fulcrum   ·   L = load   ·   E = effort'], PIC_C.ink, { size: 14, W: 544 }).box;
  return picWrap(544, 210, o.classes ? 'The three classes of lever: class 1 has the fulcrum in the middle, class 2 the load in the middle and class 3 the effort in the middle' : 'Three ways to build a lever: fulcrum in the middle, load in the middle, or effort in the middle', b, '', 420);
}
/* ---------- everyday levers, each labelled ---------- */
function picSeesaw() {
  const W = 380;
  let b = `<rect x="30" y="96" width="320" height="12" rx="6" fill="${PIC_C.wood}" transform="rotate(-6 190 102)"/>` + picTri(190, 104, 40, 50, PIC_C.F);
  b += `<rect x="40" y="56" width="52" height="46" rx="8" fill="${PIC_C.rock}" transform="rotate(-6 190 102)"/>` + picTxt(64, 84, 'box', '#fff', 11);
  b += picArrow(318, 92, 318, 136, PIC_C.E, 4) + picHand(318, 146);
  b += picLabs([picLabel(190, 140, 150, 190, ['Fulcrum', 'the middle of the seesaw'], PIC_C.F, { W }), picLabel(64, 70, 70, 34, ['Load', 'a heavy box'], PIC_C.L, { W }), picLabel(318, 152, 322, 192, ['Effort', 'you push down'], PIC_C.E, { W })]);
  return picWrap(W, 216, 'A seesaw: the fulcrum is in the middle, a heavy box sits on one end and you push down on the other end', b);
}
function picWheelbarrow() {
  const W = 420;
  let b = `<circle cx="70" cy="140" r="26" fill="${PIC_C.ink}"/><circle cx="70" cy="140" r="8" fill="${PIC_C.steel}"/>`;
  b += `<polygon points="60,104 250,98 236,138 96,140" fill="#2f8f8a"/><path d="M84 104 q60 -34 150 -6 z" fill="#8a6a45"/>`;
  b += `<line x1="70" y1="140" x2="330" y2="96" stroke="${PIC_C.wood2}" stroke-width="8" stroke-linecap="round"/><line x1="200" y1="128" x2="196" y2="166" stroke="${PIC_C.wood2}" stroke-width="6" stroke-linecap="round"/>`;
  b += picArrow(330, 88, 330, 46, PIC_C.E, 4) + picHand(330, 38);
  b += picLabs([picLabel(70, 152, 96, 198, ['Fulcrum', 'the wheel'], PIC_C.F, { W }), picLabel(160, 90, 150, 34, ['Load', 'the soil in the middle'], PIC_C.L, { W }), picLabel(330, 101, 338, 152, ['Effort', 'you lift the handles'], PIC_C.E, { W })]);
  return picWrap(W, 226, 'A wheelbarrow: the wheel is the fulcrum, the soil in the middle is the load, and you lift the handles at the end', b, '', 420);
}
function picChopsticks() {
  const W = 380;
  let b = `<line x1="40" y1="70" x2="330" y2="96" stroke="${PIC_C.wood2}" stroke-width="7" stroke-linecap="round"/><line x1="40" y1="70" x2="330" y2="128" stroke="${PIC_C.wood}" stroke-width="7" stroke-linecap="round"/>`;
  b += `<ellipse cx="346" cy="112" rx="18" ry="14" fill="#f3e6c8"/><path d="M332 106 q14 -10 28 0" stroke="#d9c49a" stroke-width="2" fill="none"/>`;
  b += `<circle cx="40" cy="70" r="9" fill="${PIC_C.F}"/>` + picArrow(152, 128, 152, 98, PIC_C.E, 4) + `<ellipse cx="152" cy="138" rx="14" ry="10" fill="${PIC_C.skin}"/>`;
  b += picLabs([picLabel(40, 70, 100, 28, ['Fulcrum', 'where they rest in your hand'], PIC_C.F, { W }), picLabel(346, 99, 285, 36, ['Load', 'the dumpling at the tips'], PIC_C.L, { W }), picLabel(152, 147, 200, 178, ['Effort', 'your fingers squeeze'], PIC_C.E, { W })]);
  return picWrap(W, 206, 'A pair of chopsticks: they pivot where they rest in your hand, your fingers squeeze in the middle, and the dumpling is at the tips', b);
}
/* ---------- the trade-off on a lever: your end moves a long way, the rock only a little ---------- */
function picCatch() {
  const W = 380;
  let b = `<line x1="40" y1="100" x2="340" y2="100" stroke="${PIC_C.wood}" stroke-width="10" stroke-linecap="round" opacity=".25"/>`;
  b += `<line x1="40" y1="86" x2="340" y2="146" stroke="${PIC_C.wood}" stroke-width="10" stroke-linecap="round"/>` + picTri(110, 100, 30, 66, PIC_C.F) + picRock(40, 82, 40, 28, '');
  b += picArrow(14, 100, 14, 78, PIC_C.L, 4) + picArrow(358, 100, 358, 148, PIC_C.E, 4);
  b += picNote(66, 28, ['the rock rises', 'a little'], PIC_C.L, { all: true, W }).box + picNote(296, 174, ['your hand moves', 'a long way'], PIC_C.E, { all: true, W }).box;
  b += picNote(190, 208, ['Smaller effort = bigger distance'], PIC_C.ink, { size: 14, W }).box;
  return picWrap(W, 226, 'The catch: with the fulcrum close to the rock, your hand moves a long way and the rock only rises a little', b);
}
/* ---------- class 3, animated: a small movement of the hand swings the far end a long way, but the effort is bigger than the load.
   SMIL animateTransform, so it needs no <style>. Reduced motion: the "end" position is drawn as a faded ghost and nothing moves. ---------- */
function picClass3Anim() {
  const W = 380, still = typeof RMOTION !== 'undefined' && RMOTION, y = 100, fx = 40, hx = 130, lx = 340;
  const anim = still ? '' : `<animateTransform attributeName="transform" type="rotate" values="0 ${fx} ${y};-11 ${fx} ${y};-11 ${fx} ${y};0 ${fx} ${y};0 ${fx} ${y}" keyTimes="0;.35;.6;.95;1" dur="3.2s" repeatCount="indefinite"/>`;
  const bar = (op, rot) => `<g opacity="${op}" ${rot ? `transform="rotate(${rot} ${fx} ${y})"` : ''}>${rot == null ? anim : ''}<rect x="${fx - 6}" y="${y - 5}" width="${lx - fx + 12}" height="10" rx="5" fill="${PIC_C.wood}"/>${picRock(lx, y - 5, 34, 26, '')}${picArrow(lx, y + 34, lx, y + 8, PIC_C.L, 3)}${picArrow(hx, y + 66, hx, y + 8, PIC_C.E, 6)}${picHand(hx, y + 74)}</g>`;
  let b = picTri(fx, y + 4, 28, 30, PIC_C.F) + bar(.22, -11) + bar(1, null);
  b += picLabs([picLabel(fx, y + 28, fx, y + 58, ['Fulcrum'], PIC_C.F, { W }), picNote(250, 226, ['Effort: a BIG pull,', 'but your hand moves a little'], PIC_C.E, { all: true, W }), picNote(284, 170, ['Load: the rock swings', 'a long way'], PIC_C.L, { all: true, W })]);
  return picWrap(W, 252, 'Class 3 lever, animated: the hand near the fulcrum pulls up a little with a big force, and the rock at the far end swings up a long way', b);
}
/* ---------- Part 2 pictures ---------- */
function picFlagpole() {
  const W = 340;
  let b = `<rect x="96" y="20" width="8" height="196" fill="${PIC_C.steel}"/><circle cx="100" cy="24" r="12" fill="${PIC_C.F}"/><circle cx="100" cy="24" r="4" fill="#fff"/>`;
  b += `<line x1="88" y1="24" x2="88" y2="170" stroke="${PIC_C.rope}" stroke-width="3"/><line x1="112" y1="24" x2="112" y2="96" stroke="${PIC_C.rope}" stroke-width="3"/>`;
  b += `<rect x="114" y="96" width="62" height="40" fill="#d6402c"/><rect x="114" y="112" width="62" height="8" fill="#fff"/>` + picArrow(146, 92, 146, 58, PIC_C.L, 3);
  b += picArrow(88, 176, 88, 206, PIC_C.E, 4) + picHand(88, 214);
  b += picLabs([picLabel(112, 24, 222, 34, ['Pulley', 'a wheel at the top'], PIC_C.F, { W }), picLabel(176, 116, 262, 128, ['Load', 'the flag goes up'], PIC_C.L, { W }), picLabel(78, 214, 38, 196, ['Effort', 'pull down'], PIC_C.E, { W })]);
  return picWrap(W, 236, 'A flagpole: a pulley wheel at the top lets you pull the rope down to raise the flag up', b);
}
function picMovingPulley() {
  const W = 424;
  let b = `<rect x="80" y="14" width="200" height="10" rx="4" fill="${PIC_C.ink}"/><circle cx="140" cy="40" r="13" fill="${PIC_C.steel}"/><circle cx="140" cy="132" r="13" fill="${PIC_C.steel}"/>`;
  b += `<line x1="127" y1="24" x2="127" y2="132" stroke="${PIC_C.L}" stroke-width="3.5"/><line x1="153" y1="40" x2="153" y2="132" stroke="${PIC_C.L}" stroke-width="3.5"/>`;
  b += `<line x1="127" y1="40" x2="127" y2="40" stroke="${PIC_C.rope}"/><path d="M153 40 q0 -14 -13 -14 q-13 0 -13 14" stroke="${PIC_C.rope}" stroke-width="3" fill="none"/>`;
  b += `<line x1="230" y1="24" x2="230" y2="150" stroke="${PIC_C.rope}" stroke-width="3" stroke-dasharray="6 4"/>`;
  b += `<rect x="114" y="150" width="52" height="40" rx="6" fill="#c58a4a"/>` + picTxt(140, 175, 'crate', '#fff', 11) + picArrow(230, 156, 230, 196, PIC_C.E, 4) + picHand(230, 204);
  b += picTxt(110, 92, '1', PIC_C.L, 15) + picTxt(170, 92, '2', PIC_C.L, 15) + picTxt(119, 107, 'holds half', PIC_C.L, 10, 'end', 700) + picTxt(161, 107, 'holds half', PIC_C.L, 10, 'start', 700);
  b += picLabs([picNote(333, 56, ['2 supporting ropes', 'share the crate\'s weight'], PIC_C.L, { W }), picLabel(230, 118, 336, 130, ['the end you pull', '(not counted)'], PIC_C.E, { W })]);
  return picWrap(W, 224, 'A pulley that moves with the crate: two supporting ropes hold it up and share its weight, and the end you pull is not counted', b, '', 424);
}
function picScrewdriver() {
  const W = 380;
  let b = `<rect x="40" y="64" width="110" height="64" rx="26" fill="#e3a51c"/><rect x="150" y="88" width="170" height="16" rx="5" fill="${PIC_C.steel}"/><polygon points="320,88 344,96 320,104" fill="${PIC_C.steel}"/>`;
  b += `<ellipse cx="95" cy="96" rx="20" ry="36" fill="none" stroke="${PIC_C.E}" stroke-width="2" stroke-dasharray="4 4"/>` + picArrow(80, 52, 112, 52, PIC_C.E, 3);
  b += picLabs([picLabel(95, 124, 100, 170, ['Wheel', 'the fat handle: a small twist'], PIC_C.E, { W }), picLabel(240, 90, 256, 36, ['Axle', 'the thin shaft: a strong turn'], PIC_C.L, { W })]);
  return picWrap(W, 202, 'A screwdriver is a wheel and axle: the fat handle is the wheel and the thin metal shaft is the axle', b);
}
function picRamp() {
  const W = 440;
  let b = `<polygon points="30,170 330,170 330,110" fill="${PIC_C.wood}"/><rect x="330" y="110" width="30" height="60" fill="${PIC_C.wood2}"/>`;
  b += `<line x1="30" y1="160" x2="330" y2="102" stroke="${PIC_C.E}" stroke-width="2" stroke-dasharray="5 4"/>`;
  b += `<line x1="372" y1="110" x2="372" y2="170" stroke="${PIC_C.L}" stroke-width="2"/>`;
  b += `<g transform="rotate(-11.3 120 150)"><rect x="96" y="124" width="50" height="26" rx="5" fill="#c58a4a"/><circle cx="106" cy="154" r="5" fill="${PIC_C.ink}"/><circle cx="136" cy="154" r="5" fill="${PIC_C.ink}"/></g>`;
  b += picNote(196, 90, ['length of the ramp'], PIC_C.E, { all: true, W }).box + picNote(405, 140, ['height'], PIC_C.L, { all: true, W }).box + picNote(226, 198, ['a cart pulled up a ramp onto a platform'], PIC_C.ink, { all: true, W }).box;
  return picWrap(W, 216, 'A cart on a ramp up to a platform, with the length of the ramp and the height of the platform marked', b, '', 440);
}
function picWedge() {
  const W = 380, still = typeof RMOTION !== 'undefined' && RMOTION;
  const slide = (dx) => still ? '' : `<animateTransform attributeName="transform" type="translate" values="${dx} 0;0 0;0 0;${dx} 0" keyTimes="0;.4;.8;1" dur="3s" repeatCount="indefinite"/>`;
  let b = `<g>${slide(-26)}<polygon points="60,40 100,40 100,150" fill="${PIC_C.steel}"/></g><g>${slide(26)}<polygon points="140,40 100,40 100,150" fill="${PIC_C.F}"/></g>`;
  b += `<polygon points="246,40 286,40 266,150" fill="${PIC_C.steel}"/><rect x="196" y="120" width="68" height="44" rx="6" fill="${PIC_C.wood}"/><rect x="268" y="120" width="68" height="44" rx="6" fill="${PIC_C.wood}"/>`;
  b += picArrow(266, 14, 266, 36, PIC_C.E, 4) + picArrow(226, 142, 202, 142, PIC_C.L, 3) + picArrow(306, 142, 330, 142, PIC_C.L, 3);
  b += picNote(100, 184, ['two ramps back to back'], PIC_C.ink, { all: true, W }).box + picNote(266, 192, ['a push down splits', 'the wood apart'], PIC_C.ink, { all: true, W }).box;
  return picWrap(W, 218, 'A wedge is two ramps back to back. Pushing it down into a log pushes the two halves apart', b);
}
function picScrewIdea() {
  const W = 410;
  let b = `<polygon points="30,150 150,150 150,60" fill="#fff3cc" stroke="${PIC_C.wood2}" stroke-width="2"/><line x1="30" y1="150" x2="150" y2="60" stroke="${PIC_C.E}" stroke-width="3"/>`;
  b += picArrow(170, 108, 214, 108, PIC_C.ink, 3);
  b += `<rect x="250" y="40" width="44" height="120" rx="6" fill="#e3a51c"/>`;
  for (let i = 0; i < 5; i++) b += `<path d="M250 ${54 + i * 22} q22 16 44 -8" stroke="${PIC_C.E}" stroke-width="3" fill="none"/>`;
  b += picLabs([picLabel(294, 90, 356, 106, ['Thread', 'the spiral ramp'], PIC_C.E, { W }), picNote(90, 182, ['a paper ramp'], PIC_C.ink, { all: true, W }), picNote(192, 84, ['wrap it'], PIC_C.ink, { all: true, W }), picNote(272, 182, ['round a pencil'], PIC_C.ink, { all: true, W })]);
  return picWrap(W, 200, 'A screw is a ramp wrapped round a rod: wrap a paper triangle round a pencil and its sloping edge makes a spiral thread', b, '', 410);
}
/* ---------- Part 3 pictures (c6c): mechanical advantage, the shape rules, work ---------- */
/* mechanical advantage as a picture: the load bar is made of 4 effort-sized pieces (the Part 2 crate: 235.2 N load, 58.8 N effort) */
function picMA() {
  const W = 420;
  let b = `<rect x="40" y="30" width="240" height="26" rx="5" fill="${PIC_C.L}"/><rect x="40" y="116" width="60" height="26" rx="5" fill="${PIC_C.E}"/>`;
  [100, 160, 220].forEach(x => { b += `<line x1="${x}" y1="30" x2="${x}" y2="56" stroke="#fff" stroke-width="2.5"/>`; });
  b += `<line x1="100" y1="60" x2="100" y2="112" stroke="${PIC_C.E}" stroke-width="2" stroke-dasharray="4 3"/>`;
  b += picLabs([picLabel(280, 43, 352, 43, ['Load', '235.2 N'], PIC_C.L, { W }), picNote(240, 86, ['the effort fits into the load 4 times'], PIC_C.ink, { all: true, W }), picLabel(100, 129, 172, 164, ['Effort', '58.8 N'], PIC_C.E, { W }), picNote(332, 136, ['235.2 ÷ 58.8 = 4', 'mechanical advantage = 4'], PIC_C.ink, { all: true, W })]);
  return picWrap(W, 192, 'Bars showing a 235.2 newton load and a 58.8 newton effort: the effort fits into the load 4 times, so the mechanical advantage is 4', b, '', 420);
}
/* the lever's shape rule: rock 0.4 m from the fulcrum, hand 1.6 m from it. o.calc adds the effort sum */
function picLeverDims(o) {
  o = o || {}; const W = 420, k = 180, x0 = 40, fx = x0 + 0.4 * k, hx = fx + 1.6 * k;
  let b = `<polygon points="${fx - 22},176 ${fx + 22},176 ${fx},112" fill="${PIC_C.F}"/><rect x="${x0}" y="104" width="${hx - x0 + 8}" height="12" rx="6" fill="${PIC_C.wood}"/>`;
  b += picRock(x0 + 16, 104, 34, 26, '') + picArrow(hx, 54, hx, 98, PIC_C.E, 4) + picHand(hx, 44);
  b += `<line x1="${x0 + 16}" y1="190" x2="${fx}" y2="190" stroke="${PIC_C.L}" stroke-width="2.5"/><line x1="${fx}" y1="206" x2="${hx}" y2="206" stroke="${PIC_C.E}" stroke-width="2.5"/>`;
  [[x0 + 16, 190, PIC_C.L], [fx, 190, PIC_C.L], [fx, 206, PIC_C.E], [hx, 206, PIC_C.E]].forEach(([x, y, c]) => { b += `<line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" stroke="${c}" stroke-width="2.5"/>`; });
  const labs = [picLabel(x0 + 16, 100, 70, 40, ['Rock', '294 N'], PIC_C.L, { W }), picLabel(fx, 190, 120, 238, ['rock to fulcrum', '0.4 m'], PIC_C.L, { W }), picLabel((fx + hx) / 2, 206, 300, 238, ['your hand to fulcrum', '1.6 m'], PIC_C.E, { W }), picLabel(fx, 160, 160, 72, ['Fulcrum'], PIC_C.F, { W })];
  labs.push(o.calc ? picNote(330, 60, ['effort = 294 ÷ 4', '= 73.5 N'], PIC_C.E, { all: true, W }) : picNote(330, 60, ['MA = 1.6 ÷ 0.4', '= 4'], PIC_C.ink, { all: true, W }));
  return picWrap(W, 262, 'A lever with the rock 0.4 metres from the fulcrum and your hand 1.6 metres from it, so the mechanical advantage is 4', b + picLabs(labs), '', 420);
}
/* the winch's shape rule: handle radius and axle radius (no numbers, so the question is not answered for the student) */
function picWinchDims() {
  const W = 400, cx = 190, cy = 104;
  let b = `<circle cx="${cx}" cy="${cy}" r="78" fill="none" stroke="${PIC_C.E}" stroke-width="2" stroke-dasharray="5 4"/><circle cx="${cx}" cy="${cy}" r="16" fill="${PIC_C.L}"/><circle cx="${cx}" cy="${cy}" r="3" fill="#fff"/>`;
  b += `<line x1="${cx}" y1="${cy}" x2="${cx + 78}" y2="${cy}" stroke="${PIC_C.wood2}" stroke-width="7" stroke-linecap="round"/><circle cx="${cx + 78}" cy="${cy}" r="9" fill="${PIC_C.E}"/>`;
  b += `<line x1="${cx - 16}" y1="${cy}" x2="${cx - 16}" y2="176" stroke="${PIC_C.rope}" stroke-width="3"/><rect x="${cx - 38}" y="176" width="44" height="30" rx="5" fill="${PIC_C.rock}"/>`;
  b += picLabs([picLabel(cx + 40, cy, 330, 44, ['Handle radius', 'the wheel'], PIC_C.E, { W }), picLabel(cx + 8, cy - 12, 82, 36, ['Axle radius', 'the thin rod'], PIC_C.L, { W }), picNote(300, 176, ['turn the handle:', 'the axle winds the rope'], PIC_C.ink, { all: true, W })]);
  return picWrap(W, 220, 'A winch seen end-on: a handle on a big circle fixed to a thin axle that winds the rope lifting a bucket. The handle radius and the axle radius are marked', b, '', 400);
}
/* work: a force moving a crate a distance. o.unit adds the unit */
function picWork(o) {
  o = o || {}; const W = 420;
  let b = `<rect x="46" y="150" width="70" height="46" rx="6" fill="none" stroke="#8a98a1" stroke-width="1.5" stroke-dasharray="5 4"/><rect x="46" y="50" width="70" height="46" rx="6" fill="#c58a4a"/>`;
  b += picArrow(81, 142, 81, 104, PIC_C.E, 5) + `<line x1="150" y1="96" x2="150" y2="196" stroke="${PIC_C.L}" stroke-width="2.5"/><line x1="142" y1="96" x2="158" y2="96" stroke="${PIC_C.L}" stroke-width="2.5"/><line x1="142" y1="196" x2="158" y2="196" stroke="${PIC_C.L}" stroke-width="2.5"/>`;
  b += `<line x1="20" y1="198" x2="130" y2="198" stroke="#8a98a1" stroke-width="2"/>`;
  b += picLabs([picLabel(81, 124, 30, 124, ['force', '294 N'], PIC_C.E, { W }), picLabel(150, 146, 238, 150, ['distance', '1 m'], PIC_C.L, { W }), picNote(318, 62, o.unit ? ['work = force × distance', '294 × 1 = 294 J', 'J is short for joules'] : ['work = force × distance', '294 × 1 = 294'], PIC_C.ink, { all: true, W })]);
  return picWrap(W, 214, 'A 294 newton force lifts a crate 1 metre: work = force times distance = 294' + (o.unit ? ' joules' : ''), b, '', 420);
}
/* work in and work out, side by side (no distances drawn, so the prediction is not answered) */
function picWorkInOut() {
  const W = 420;
  let b = `<rect x="150" y="50" width="120" height="70" rx="14" fill="${PIC_C.soft}" stroke="${PIC_C.F}" stroke-width="2"/>` + picTxt(210, 91, 'machine', PIC_C.F, 15) + picArrow(70, 85, 144, 85, PIC_C.E, 5) + picArrow(276, 85, 350, 85, PIC_C.L, 5);
  b += picLabs([picNote(70, 36, ['Effort', 'you pull'], PIC_C.E, { W }), picNote(352, 36, ['Load', 'it is moved'], PIC_C.L, { W }), picNote(110, 162, ['Work in', 'effort × how far', 'your hand moved'], PIC_C.E, { all: true, W }), picNote(318, 162, ['Work out', 'load × how high', 'the load rose'], PIC_C.L, { all: true, W })]);
  return picWrap(W, 214, 'A machine with the effort going in and the load coming out. Work in is effort times how far your hand moved. Work out is load times how high the load rose', b, '', 420);
}

/* ---------- Part 4 pictures: compound machines ---------- */
function picScissors() {
  const W = 400;
  let b = `<line x1="150" y1="104" x2="330" y2="40" stroke="${PIC_C.steel}" stroke-width="12" stroke-linecap="round"/><line x1="150" y1="104" x2="330" y2="168" stroke="${PIC_C.F}" stroke-width="12" stroke-linecap="round"/>`;
  b += `<path d="M150 104 L60 66" stroke="${PIC_C.steel}" stroke-width="9" stroke-linecap="round"/><path d="M150 104 L60 142" stroke="${PIC_C.F}" stroke-width="9" stroke-linecap="round"/><ellipse cx="46" cy="62" rx="26" ry="18" fill="none" stroke="${PIC_C.E}" stroke-width="7"/><ellipse cx="46" cy="146" rx="26" ry="18" fill="none" stroke="${PIC_C.E}" stroke-width="7"/>`;
  b += `<circle cx="150" cy="104" r="8" fill="#fff" stroke="${PIC_C.ink}" stroke-width="3"/>` + picArrow(22, 94, 22, 80, PIC_C.E, 3) + picArrow(22, 114, 22, 128, PIC_C.E, 3);
  b += picLabs([picLabel(150, 104, 196, 196, ['Fulcrum', 'the pivot: a lever'], PIC_C.F, { W }), picLabel(300, 52, 330, 108, ['Blades', 'each one is a wedge'], PIC_C.L, { W }), picLabel(60, 66, 84, 14, ['Effort', 'you squeeze'], PIC_C.E, { W })]);
  return picWrap(W, 226, 'Scissors: two levers joined at a pivot, with blades that are wedges', b);
}
function picSiteCrane() {
  const W = 420;
  let b = `<rect x="60" y="214" width="120" height="10" rx="3" fill="${PIC_C.wood2}"/><rect x="104" y="46" width="12" height="168" fill="#e3a51c"/><rect x="50" y="36" width="260" height="10" rx="3" fill="#e3a51c"/><rect x="50" y="46" width="30" height="26" fill="${PIC_C.F}"/>`;
  b += `<line x1="250" y1="46" x2="250" y2="128" stroke="${PIC_C.rope}" stroke-width="3"/><circle cx="250" cy="134" r="10" fill="${PIC_C.steel}" stroke="${PIC_C.ink}" stroke-width="2"/><line x1="250" y1="144" x2="250" y2="168" stroke="${PIC_C.rope}" stroke-width="3"/><rect x="224" y="168" width="52" height="38" rx="4" fill="#c58a4a"/><line x1="224" y1="187" x2="276" y2="187" stroke="${PIC_C.wood2}" stroke-width="3"/>`;
  b += `<rect x="124" y="170" width="40" height="30" rx="5" fill="${PIC_C.F}"/><circle cx="144" cy="185" r="9" fill="${PIC_C.steel}"/><line x1="144" y1="185" x2="162" y2="177" stroke="${PIC_C.ink}" stroke-width="3" stroke-linecap="round"/>`;
  b += picLabs([picLabel(144, 185, 168, 238, ['Winch', 'a wheel and axle'], PIC_C.E, { W }), picLabel(250, 134, 350, 100, ['Pulley block', 'supporting ropes'], PIC_C.L, { W }), picLabel(180, 41, 180, 12, ['Crane arm', 'a lever'], PIC_C.F, { W }), picLabel(250, 187, 360, 188, ['Load', 'bricks'], PIC_C.L, { W })]);
  return picWrap(W, 262, 'A building-site crane: a winch, a pulley block and an arm that is a lever, all working together', b, '', 420);
}
function picCompoundChain(A, B) {
  A = A || 2; B = B || 3; const W = 420;
  let b = '';
  [['Machine 1', '× ' + A, 40], ['Machine 2', '× ' + B, 170], ['Total', '× ' + A * B, 300]].forEach(([n, v, x], i) => { b += `<rect x="${x}" y="40" width="90" height="56" rx="10" fill="${i == 2 ? '#fff6d6' : PIC_C.soft}" stroke="${i == 2 ? PIC_C.L : PIC_C.F}" stroke-width="2"/>` + picTxt(x + 45, 64, n, PIC_C.ink, 13) + picTxt(x + 45, 86, v, i == 2 ? PIC_C.L : PIC_C.F, 17); });
  b += picTxt(150, 74, '×', PIC_C.E, 24) + picTxt(280, 74, '=', PIC_C.E, 24);
  b += picNote(210, 132, ['Multiply the mechanical advantages.', 'Do not add them.'], PIC_C.E, { all: true, W }).box;
  return picWrap(W, 160, `Two machines with mechanical advantages ${A} and ${B} give a total of ${A * B} when you multiply`, b, '', 420);
}

/* ---------- Part 5 picture: the three rescue stages ---------- */
function picCraterPlan() {
  const W = 420;
  let b = `<rect x="0" y="0" width="${W}" height="236" rx="10" fill="#6f55b3"/><polygon points="0,60 90,60 150,196 270,196 330,60 420,60 420,236 0,236" fill="#b9a2e4"/>`;
  b += `<g transform="rotate(-24 210 170)"><path d="M180 190 Q180 130 210 130 Q240 130 240 190 Z" fill="#e8639b"/><circle cx="210" cy="158" r="8" fill="#bfe6f5"/></g><ellipse cx="258" cy="186" rx="14" ry="10" fill="#8b8f93"/>`;
  b += `<line x1="330" y1="60" x2="330" y2="196" stroke="#fffaf2" stroke-width="2" stroke-dasharray="4 4"/>` + picArrow(150, 184, 112, 116, '#fffaf2', 3);
  b += picLabs([picLabel(258, 186, 330, 214, ['Stage 1', 'lever the boulder off'], PIC_C.E, { W }), picLabel(205, 176, 120, 214, ['Stage 2', 'jack the ship level'], PIC_C.L, { W }), picLabel(130, 150, 76, 100, ['Stage 3', 'haul it out'], PIC_C.F, { W }), picNote(372, 108, ['15 m', 'crater wall'], PIC_C.ink, { all: true, W })]);
  return picWrap(W, 236, 'A cross-section of the crater: the Gumdrop tipped at the bottom with a boulder on its leg, and three stages: lever the boulder off, jack the ship level, and haul it up the 15 m wall', b, '', 420);
}

/* ---------- Extension pictures: friction, wasted energy and efficiency ---------- */
function picEff(o) {
  o = o || {}; const W = 420;
  let b = `<rect x="150" y="56" width="120" height="64" rx="14" fill="${PIC_C.soft}" stroke="${PIC_C.F}" stroke-width="2"/>` + picTxt(210, 94, 'real machine', PIC_C.F, 14) + picArrow(70, 88, 144, 88, PIC_C.E, 5) + picArrow(276, 88, 350, 88, PIC_C.L, 5) + picArrow(210, 52, 210, 18, '#d6402c', 3);
  b += picLabs([picNote(60, 128, ['Work in', o.calc ? '1,500 J' : 'what you put in'], PIC_C.E, { all: true, W }), picNote(364, 128, ['Useful work out', o.calc ? '1,200 J' : 'what the load gets'], PIC_C.L, { all: true, W }), picNote(210, 150, ['Wasted energy: friction turns it into heat', o.calc ? '1,500 − 1,200 = 300 J' : ''].filter(Boolean), PIC_C.E, { W })]);
  return picWrap(W, 184, 'A real machine: work goes in, most of it comes out as useful work, and the rest is wasted as heat because of friction', b, '', 420);
}
function picLube() {
  const W = 400;
  let b = `<rect x="60" y="80" width="110" height="26" rx="6" fill="${PIC_C.steel}"/><rect x="60" y="112" width="110" height="26" rx="6" fill="${PIC_C.F}"/><path d="M85 108 Q115 112 145 108" stroke="#e3a51c" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  b += `<path d="M268 60 l34 -18 l8 16 l-30 14 z" fill="${PIC_C.steel}"/><rect x="236" y="70" width="58" height="34" rx="6" fill="#e3a51c"/><path d="M262 106 q-2 14 0 20" stroke="#e3a51c" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="262" cy="130" r="4" fill="#e3a51c"/>`;
  b += picArrow(70, 160, 160, 160, PIC_C.E, 3);
  b += picLabs([picLabel(115, 109, 100, 40, ['Lubricant', 'a thin layer of oil or grease'], '#b07d00', { W }), picNote(115, 186, ['Moving parts slide past each other', 'with less friction'], PIC_C.E, { W }), picNote(300, 164, ['an oil can'], PIC_C.ink, { all: true, W })]);
  return picWrap(W, 206, 'A layer of oil between two metal parts rubbing past each other, and an oil can, show how a lubricant reduces friction', b, '', 400);
}
