/* ===== Flashcard art kit: hand-drawn pen diagrams for the vocabulary note cards =====
   Every diagram is drawn in a 240 × 150 box, as if sketched in pen on a ruled index card.
   Shapes go through a gentle "wobble" filter so lines look hand drawn; labels are NOT filtered, so they stay crisp and readable.
   Each card's picture lives in FC_ART[key] = { alt, s, t }:
     alt  one plain sentence describing the picture (read by screen readers; also a check that the picture makes sense)
     s    SVG shapes (strings from the helpers below, or your own SVG elements using the FC_INK colours)
     t    SVG labels (use fcText)
   fcArt(key) returns the finished <svg> (or '' if there is no picture). 64a/64b files fill FC_ART. */
const FC_ART = {};
const FC_INK = {
  pen: '#1f3a93',      // blue-black biro: outlines, objects
  red: '#c62d2d',      // red pen: force arrows and the key thing to notice
  green: '#2a7d48',    // green pen: a second force or "the other one" (e.g. the reaction, the effort)
  pencil: '#6b7480',   // pencil grey: ground, guide lines, dimension lines
  hi: '#ffe066',       // yellow highlighter (use with opacity .55)
  paper: '#fffdf6'     // card colour, for "cut-outs" that hide lines behind
};
const fcN = v => Math.round(v * 10) / 10;
/* a straight pen line */
const fcLine = (x1, y1, x2, y2, col = FC_INK.pen, w = 2.4, dash) => `<path d="M${fcN(x1)} ${fcN(y1)}L${fcN(x2)} ${fcN(y2)}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
/* a force arrow drawn from (x1,y1) to the tip (x2,y2), with an open hand-drawn head */
function fcArrow(x1, y1, x2, y2, col = FC_INK.red, w = 3) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.min(13, Math.hypot(x2 - x1, y2 - y1) * 0.45), s = 0.5;
  const p = t => `${fcN(x2 - L * Math.cos(a + t))} ${fcN(y2 - L * Math.sin(a + t))}`;
  return `<path d="M${fcN(x1)} ${fcN(y1)}L${fcN(x2)} ${fcN(y2)}M${p(s)}L${fcN(x2)} ${fcN(y2)}L${p(-s)}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
}
/* a box or crate (cross = true draws crate planks) */
const fcBox = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r || 2}" fill="${o.fill || 'none'}" stroke="${o.col || FC_INK.pen}" stroke-width="${o.w || 2.4}"/>` + (o.cross ? fcLine(x, y, x + w, y + h, o.col || FC_INK.pen, 1.4) + fcLine(x + w, y, x, y + h, o.col || FC_INK.pen, 1.4) : '');
const fcCircle = (cx, cy, r, o = {}) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.fill || 'none'}" stroke="${o.col || FC_INK.pen}" stroke-width="${o.w || 2.4}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
/* ground with pencil hatching underneath, from x1 to x2 at height y */
function fcGround(x1, x2, y, col = FC_INK.pencil) {
  let s = fcLine(x1, y, x2, y, col, 2);
  for (let x = x1 + 6; x < x2; x += 12) s += fcLine(x, y + 2, x - 7, y + 9, col, 1.2);
  return s;
}
/* a stick person standing with feet on y at x. o.face = 1 (right) or -1 (left); o.lean in degrees (positive leans towards the face direction);
   o.arms = 'forward' (pushing or pulling something at arm height), 'up', 'down'. Returns shapes. Hands end about 26 px in front of x, 32 px above y. */
function fcPerson(x, y, o = {}) {
  const f = o.face || 1, col = o.col || FC_INK.pen, lean = (o.lean || 0) * Math.PI / 180 * f;
  const hip = [x, y - 22], neck = [x + Math.sin(lean) * 22, y - 44], head = [x + Math.sin(lean) * 30, y - 52];
  const hand = o.arms === 'up' ? [neck[0] + 6 * f, neck[1] - 18] : o.arms === 'down' ? [neck[0] + 6 * f, neck[1] + 16] : [neck[0] + 22 * f, neck[1] + 6];
  return fcCircle(head[0], head[1], 7, { col }) + fcLine(hip[0], hip[1], neck[0], neck[1], col) +
    fcLine(hip[0], hip[1], x - 8 * f, y, col) + fcLine(hip[0], hip[1], x + 8 * f, y, col) +
    fcLine(neck[0], neck[1] + 3, hand[0], hand[1], col) + fcLine(neck[0], neck[1] + 5, hand[0] - 3 * f, hand[1] + 3, col);
}
/* a handwritten label. o.size (default 15), o.col, o.anchor ('start' | 'middle' | 'end'), o.bold */
const fcText = (x, y, txt, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 15}" fill="${o.col || FC_INK.pen}" text-anchor="${o.anchor || 'middle'}" font-family="${o.bold ? "'FC Hand Bold'" : "'FC Hand'"},'Comic Sans MS',cursive"${o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ''}>${esc(txt)}</text>`;
/* a yellow highlighter blob behind something */
const fcHi = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${FC_INK.hi}" opacity=".55"/>`;
let FC_UID = 0;
function fcArt(key, cls = 'fcart') {
  const a = FC_ART[key]; if (!a) return '';
  const id = 'fcRough' + (++FC_UID);
  return `<svg class="${cls}" viewBox="0 0 240 150" role="img" aria-label="${esc(a.alt || '')}" xmlns="http://www.w3.org/2000/svg">
<defs><filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${(key.length * 7) % 11 + 1}"/><feDisplacementMap in="SourceGraphic" scale="2.4"/></filter></defs>
<g filter="url(#${id})" stroke-linecap="round" stroke-linejoin="round">${a.s || ''}</g><g>${a.t || ''}</g></svg>`;
}
