// Builds Acceleration-Lab-Day9.pptx. Run: NODE_PATH=$(npm root -g) node build-slides.js
const pptxgen = require('pptxgenjs');
const path = require('path');
const SKILL = process.env.PPTX_SKILL;
const THEME = { name: 'Acceleration Lab', headFontFace: 'Arial', bodyFontFace: 'Calibri',
  colors: { dk1: '14202E', lt1: 'FFFFFF', dk2: '334155', lt2: 'F1F5F9', accent1: 'BE123C', accent2: '2563EB', accent3: '7C3AED', accent4: '15803D', accent5: 'C2410C', accent6: '7A5B23', hlink: '2563EB', folHlink: '7C3AED' } };
const K = { t: '2563EB', l: '7C3AED', v: '15803D', d: 'C2410C', a: 'BE123C', ink: '14202E', ramp: 'F3E3C3', flat: 'E2E8F0', mute: '64748B' };
const SOFT = { t: 'DBEAFE', l: 'EDE9FE', v: 'DCFCE7', d: 'FFEDD5', a: 'FFE4E6' };
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'Acceleration Lab: Day 9';
const C = pres.SchemeColor;
pres.defineSlideMaster({ title: 'DARK', background: { color: K.ink },
  objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.7, y: 0.6, w: 11.9, h: 1.2, fontSize: 44, bold: true, color: C.background1 }, text: '' } }] });
pres.defineSlideMaster({ title: 'CONTENT', background: { color: 'FFFFFF' },
  objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.35, w: 12.1, h: 0.9, fontSize: 36, bold: true, color: C.text1 }, text: '' } }],
  slideNumber: { x: 12.5, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: K.mute } });
const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, fontSize: 16, color: K.ink, valign: 'top', margin: 0.05 }, o));
const card = (s, x, y, w, h, fill, line) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: line || fill, width: 1.5 } });
const pill = (s, x, y, w, col, text, fs = 15) => { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.45, rectRadius: 0.1, fill: { color: SOFT[col] }, line: { color: K[col], width: 2 } });
  T(s, text, { x, y, w, h: 0.45, fontSize: fs, bold: true, color: K[col], align: 'center', valign: 'middle' }); };
const arrow = (s, x, y, w, h, col, o = {}) => s.addShape(pres.shapes.LINE, Object.assign({ x, y, w, h, line: { color: col, width: 5, endArrowType: 'triangle' } }, o));
/* the track: ramp 0-2 m, flat 2-4 m */
function track(s, x, y, w, marks = true) {
  const u = w / 4, rh = 1.1;
  s.addShape(pres.shapes.RIGHT_TRIANGLE, { x, y, w: 2 * u, h: rh, fill: { color: K.ramp }, line: { color: 'C9A96B', width: 1.5 } });
  s.addShape(pres.shapes.RECTANGLE, { x: x + 2 * u, y: y + rh - 0.02, w: 2 * u, h: 0.14, fill: { color: 'CBD5E1' }, line: { color: '94A3B8' } });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.05, y: y - 0.38, w: 0.55, h: 0.3, rectRadius: 0.05, rotate: 29, fill: { color: K.a }, line: { color: K.a } });
  if (marks) for (let m = 0; m <= 4; m++) { const mx = x + m * u, my = m <= 2 ? y + rh * m / 2 : y + rh;
    s.addShape(pres.shapes.LINE, { x: mx, y: my - 0.15, w: 0, h: 0.3, line: { color: K.ink, width: 2.5 } });
    T(s, `${m} m`, { x: mx - 0.4, y: my + 0.18, w: 0.8, h: 0.35, fontSize: 14, bold: true, align: 'center' }); }
  T(s, 'RAMP', { x: x + 0.15, y: y + rh - 0.45, w: 1.4, h: 0.35, fontSize: 13, bold: true, color: '7A5B23' });
  T(s, 'FLAT', { x: x + 3 * u - 0.5, y: y + rh + 0.5, w: 1, h: 0.35, fontSize: 13, bold: true, color: '475569', align: 'center' });
}

/* 1. Title + hook */
let s = pres.addSlide({ masterName: 'DARK' });
s.addText('Acceleration Lab', { placeholder: 'title' });
T(s, 'Day 9 · Speeding up, slowing down, and the forces behind it', { x: 0.7, y: 1.75, w: 11, h: 0.5, fontSize: 20, color: 'CBD5E1' });
card(s, 0.7, 2.7, 5.6, 3.9, '1E293B', '334155');
T(s, 'Predict 🤔', { x: 1.0, y: 2.9, w: 5, h: 0.6, fontSize: 26, bold: true, color: 'FDA4AF' });
T(s, [{ text: 'We let a cart go at the top of a ramp.', options: { breakLine: true } }, { text: ' ', options: { breakLine: true, fontSize: 8 } },
  { text: 'Down the ramp, will it speed up, stay the same, or slow down?', options: { bold: true, breakLine: true } }, { text: ' ', options: { breakLine: true, fontSize: 8 } },
  { text: 'On the flat floor after the ramp, what will it do?', options: { bold: true } }], { x: 1.0, y: 3.6, w: 5.0, h: 2.8, fontSize: 20, color: 'FFFFFF' });
s.addShape(pres.shapes.RECTANGLE, { x: 6.8, y: 3.0, w: 5.9, h: 3.2, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF' } });
track(s, 7.05, 3.55, 5.4);
s.addNotes('Release the cart once with no timing. Students make their prediction in step 1 of the app. Keep the answers hidden until the conclusion.');

/* 2. Today */
s = pres.addSlide({ masterName: 'CONTENT' });
s.addText('Today: from stopwatch to acceleration', { placeholder: 'title' });
[['🤔', 'Predict', 'What will the cart do?', 'a'], ['⏱', 'Measure', 'Time it at 1, 2, 3 and 4 m', 't'], ['🧮', 'Calculate', 'Time per metre, speed, change in speed', 'v'], ['➡', 'Explain', 'Graph it and use forces', 'd']].forEach(([ic, h, b, c], i) => {
  const x = 0.6 + i * 3.1; card(s, x, 1.7, 2.8, 3.1, SOFT[c], K[c]);
  s.addShape(pres.shapes.OVAL, { x: x + 0.95, y: 1.95, w: 0.9, h: 0.9, fill: { color: 'FFFFFF' }, line: { color: K[c], width: 2 } });
  T(s, ic, { x: x + 0.95, y: 1.95, w: 0.9, h: 0.9, fontSize: 30, align: 'center', valign: 'middle' });
  T(s, `${i + 1}. ${h}`, { x: x + 0.2, y: 3.0, w: 2.4, h: 0.5, fontSize: 22, bold: true, color: K[c], align: 'center' });
  T(s, b, { x: x + 0.2, y: 3.55, w: 2.4, h: 1.1, fontSize: 16, align: 'center' });
  if (i < 3) arrow(s, x + 2.82, 3.2, 0.26, 0, K.mute, { line: { color: K.mute, width: 3, endArrowType: 'triangle' } });
});
T(s, 'Numbers are colour coded. Each colour is made from the colour before it:', { x: 0.6, y: 5.25, w: 12, h: 0.4, fontSize: 16, color: K.mute });
[['t', 'Time from start'], ['l', 'Time for 1 metre'], ['v', 'Speed'], ['d', 'Change in speed'], ['a', 'Acceleration']].forEach(([c, t], i) => { pill(s, 0.6 + i * 2.5, 5.8, 2.2, c, t); if (i < 4) T(s, '→', { x: 2.8 + i * 2.5, y: 5.8, w: 0.3, h: 0.45, fontSize: 18, bold: true, valign: 'middle', align: 'center', color: K.mute }); });

/* 3. Theory 1: speed */
s = pres.addSlide({ masterName: 'CONTENT' });
s.addText('Speed: how far every second', { placeholder: 'title' });
card(s, 0.6, 1.5, 6.2, 2.0, SOFT.v, K.v);
T(s, [{ text: 'speed', options: { color: K.v, bold: true } }, { text: ' = distance ÷ ' }, { text: 'time', options: { color: K.l, bold: true } }], { x: 0.8, y: 1.75, w: 5.8, h: 0.8, fontSize: 36, align: 'center' });
T(s, 'Unit: metres per second (m/s)', { x: 0.8, y: 2.7, w: 5.8, h: 0.5, fontSize: 18, color: K.mute, align: 'center' });
T(s, 'Our track is cut into 1 metre pieces, so:', { x: 0.6, y: 3.85, w: 6.2, h: 0.4, fontSize: 18 });
T(s, [{ text: 'speed', options: { color: K.v, bold: true } }, { text: ' = 1 ÷ ' }, { text: 'time for that metre', options: { color: K.l, bold: true } }], { x: 0.6, y: 4.35, w: 6.2, h: 0.6, fontSize: 26 });
T(s, 'A smaller time means a bigger speed.', { x: 0.6, y: 5.1, w: 6.2, h: 0.5, fontSize: 18, italic: true, color: K.mute });
card(s, 7.3, 1.5, 5.4, 4.6, 'F8FAFC', 'CBD5E1');
T(s, 'Example', { x: 7.6, y: 1.7, w: 4.8, h: 0.45, fontSize: 20, bold: true });
T(s, [{ text: 'Stopwatch at 2 m: ', options: {} }, { text: '2.00 s', options: { color: K.t, bold: true, breakLine: true } },
  { text: 'Stopwatch at 3 m: ', options: {} }, { text: '2.55 s', options: { color: K.t, bold: true, breakLine: true } }, { text: ' ', options: { breakLine: true, fontSize: 8 } },
  { text: 'Time for metre 3 = 2.55 − 2.00 = ', options: {} }, { text: '0.55 s', options: { color: K.l, bold: true, breakLine: true } }, { text: ' ', options: { breakLine: true, fontSize: 8 } },
  { text: 'Speed in metre 3 = 1 ÷ 0.55 = ', options: {} }, { text: '1.82 m/s', options: { color: K.v, bold: true } }],
  { x: 7.6, y: 2.3, w: 5.0, h: 3.4, fontSize: 19, paraSpaceAfter: 4 });
s.addNotes('The stopwatch keeps running from the start, so to get one metre on its own we take away the time already used. Metre 1 is just the time at 1 m.');

/* 4. Theory 2: acceleration */
s = pres.addSlide({ masterName: 'CONTENT' });
s.addText('Acceleration: how fast the speed changes', { placeholder: 'title' });
card(s, 0.6, 1.45, 12.1, 1.3, SOFT.a, K.a);
T(s, [{ text: 'acceleration', options: { color: K.a, bold: true } }, { text: ' = ' }, { text: 'change in speed', options: { color: K.d, bold: true } }, { text: ' ÷ time it took' }], { x: 0.8, y: 1.6, w: 11.7, h: 0.6, fontSize: 32, align: 'center' });
T(s, 'Unit: m/s², "metres per second, every second"', { x: 0.8, y: 2.2, w: 11.7, h: 0.45, fontSize: 17, color: K.mute, align: 'center' });
[[0.6, 'Positive (+)', 'Speeding up', 'The speed goes up. On the ramp, the change in speed is a plus number.', K.v, 'DCFCE7', '⬆'], [6.8, 'Negative (−)', 'Slowing down', 'The speed goes down. The change in speed is a minus number, so the acceleration is too.', K.a, 'FFE4E6', '⬇']].forEach(([x, h, sub, b, col, fill, ic]) => {
  card(s, x, 3.1, 5.9, 2.6, fill, col);
  s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 3.35, w: 1.0, h: 1.0, fill: { color: col }, line: { color: col } });
  T(s, ic, { x: x + 0.3, y: 3.35, w: 1.0, h: 1.0, fontSize: 34, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });
  T(s, h, { x: x + 1.5, y: 3.3, w: 4.2, h: 0.6, fontSize: 28, bold: true, color: col });
  T(s, sub, { x: x + 1.5, y: 3.9, w: 4.2, h: 0.45, fontSize: 18, bold: true });
  T(s, b, { x: x + 0.3, y: 4.6, w: 5.3, h: 1.0, fontSize: 16 });
});
T(s, [{ text: 'Your job: ', options: { bold: true } }, { text: 'change in speed', options: { bold: true, color: K.d } }, { text: ' = this speed − the speed before.   ' }, { text: 'The app\'s job: ', options: { bold: true } }, { text: 'the acceleration.', options: { bold: true, color: K.a } }],
  { x: 0.6, y: 6.0, w: 12.1, h: 0.5, fontSize: 18 });
s.addNotes('Grade 6: + means speeding up, − means slowing down. Grade 7/8: the speed for each metre is an average, which is the speed in the middle of that metre, so the app divides by the time between the middles.');

/* 5. Theory 3: forces */
s = pres.addSlide({ masterName: 'CONTENT' });
s.addText('Forces decide: speed up or slow down?', { placeholder: 'title' });
function fbd(x, y, onRamp) {
  card(s, x, y, 5.9, 3.6, onRamp ? 'FBF5EA' : 'F1F5F9', 'CBD5E1');
  T(s, onRamp ? 'On the ramp' : 'On the flat', { x: x + 0.25, y: y + 0.15, w: 3, h: 0.45, fontSize: 20, bold: true });
  const cx = x + 2.4, cy = y + 1.9;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx - 0.55, y: cy - 0.25, w: 1.1, h: 0.5, rectRadius: 0.08, rotate: onRamp ? 20 : 0, fill: { color: 'FECDD3' }, line: { color: K.a, width: 2 } });
  arrow(s, cx, cy, 0, 1.3, '1E3A8A'); T(s, 'Weight (gravity)', { x: cx - 1.0, y: cy + 1.32, w: 2.0, h: 0.35, fontSize: 13, bold: true, color: '1E3A8A', align: 'center' });
  if (onRamp) { arrow(s, cx, cy - 1.15, 0.42, 1.15, '0F766E', { flipV: true }); T(s, 'Normal', { x: cx + 0.45, y: cy - 1.3, w: 1.2, h: 0.35, fontSize: 13, bold: true, color: '0F766E' });
    arrow(s, cx - 0.5, cy - 0.18, 0.5, 0.18, 'B45309', { flipH: true, flipV: true }); T(s, 'Friction', { x: cx - 1.55, y: cy - 0.55, w: 1.0, h: 0.35, fontSize: 13, bold: true, color: 'B45309' }); }
  else { arrow(s, cx, cy - 1.3, 0, 1.3, '0F766E', { flipV: true }); T(s, 'Normal', { x: cx + 0.1, y: cy - 1.45, w: 1.2, h: 0.35, fontSize: 13, bold: true, color: '0F766E' });
    arrow(s, cx - 0.8, cy, 0.8, 0, 'B45309', { flipH: true }); T(s, 'Friction', { x: cx - 1.9, y: cy - 0.4, w: 1.1, h: 0.35, fontSize: 13, bold: true, color: 'B45309' }); }
  T(s, onRamp ? [{ text: 'Unbalanced: ', options: { bold: true } }, { text: 'gravity pulls the cart down the slope more than friction holds it back.', options: { breakLine: true } }, { text: '+ acceleration (speeds up)', options: { bold: true, color: K.v } }]
    : [{ text: 'Up and down cancel. ', options: { bold: true } }, { text: 'Gravity can\'t pull it forwards. Friction is left over.', options: { breakLine: true } }, { text: '− acceleration (slows down)', options: { bold: true, color: K.a } }],
    { x: x + 3.6, y: y + 0.75, w: 2.15, h: 2.7, fontSize: 15 });
}
fbd(0.6, 1.4, true); fbd(6.8, 1.4, false);
T(s, [{ text: 'Grade 6: ', options: { bold: true } }, { text: 'gravity pulls it forwards on the ramp; on the flat, friction slows it down.', options: { breakLine: true } },
  { text: 'Grade 7/8: ', options: { bold: true } }, { text: 'an unbalanced (resultant) force causes acceleration in the direction of that force (a = F ÷ m).' }], { x: 0.6, y: 5.3, w: 12.1, h: 1.0, fontSize: 17 });
s.addNotes('Common misconception: a forward force keeps the cart moving on the flat. Nothing pushes it forwards. It keeps moving on its own, and friction only slows it down.');

/* 6. Method */
s = pres.addSlide({ masterName: 'CONTENT' });
s.addText('How we collect the data', { placeholder: 'title' });
card(s, 0.6, 1.4, 6.6, 3.0, 'FFFFFF', 'CBD5E1'); track(s, 0.9, 2.2, 6.0);
T(s, 'Every time is measured from the start (0 s at the moment the cart is let go).', { x: 0.6, y: 4.55, w: 6.6, h: 0.7, fontSize: 16, italic: true, color: K.mute });
[['Way 1', 'One timer. Do a new run for each mark: 1 m, 2 m, 3 m, 4 m.'], ['Way 2', 'One timer at each mark. Everyone starts on "GO!" and stops when the cart passes their mark.']].forEach(([h, b], i) => {
  card(s, 7.6, 1.4 + i * 1.6, 5.1, 1.4, SOFT.t, K.t); T(s, h, { x: 7.85, y: 1.5 + i * 1.6, w: 4.6, h: 0.45, fontSize: 20, bold: true, color: K.t }); T(s, b, { x: 7.85, y: 1.95 + i * 1.6, w: 4.6, h: 0.8, fontSize: 16 }); });
T(s, 'Jobs', { x: 7.6, y: 4.7, w: 5, h: 0.45, fontSize: 20, bold: true });
T(s, [['🙌 Releaser', 'lets go, never pushes'], ['⏱ Timer(s)', 'stop when the front passes the mark'], ['📝 Recorder', 'types times into Table 1'], ['👀 Checker', 'cart starts at 0 m every time']].map(([a, b], i, arr) => ({ text: `${a}: ${b}`, options: { bullet: true, breakLine: i < arr.length - 1 } })),
  { x: 7.6, y: 5.15, w: 5.1, h: 1.6, fontSize: 15, paraSpaceAfter: 3 });

/* 7. Collect */
s = pres.addSlide({ masterName: 'DARK' });
s.addText('Collect your data', { placeholder: 'title' });
T(s, '10', { x: 0.7, y: 2.0, w: 4.2, h: 2.4, fontSize: 150, bold: true, color: 'FDA4AF', align: 'center', valign: 'middle' });
T(s, 'minutes', { x: 0.7, y: 4.4, w: 4.2, h: 0.6, fontSize: 28, color: 'CBD5E1', align: 'center' });
T(s, [['Open Acceleration Lab and go to step 2 (My times).'], ['Choose how many trials (3 is best).'], ['Let go: don\'t push!'], ['Type each time like 1.42.'], ['The app works out the average for you.']].map(([t], i, arr) => ({ text: t, options: { bullet: { type: 'number' }, breakLine: i < arr.length - 1 } })),
  { x: 5.6, y: 2.1, w: 7.0, h: 3.6, fontSize: 24, color: 'FFFFFF', paraSpaceAfter: 10 });

/* 8. Open the app */
s = pres.addSlide({ masterName: 'CONTENT' });
s.addText('In the app: you do the maths', { placeholder: 'title' });
const rows = [['l', '① Time for one metre', 'this mark − last mark', 'metre 1: just the time at 1 m'], ['v', '② Speed', '1 ÷ time for that metre', 'round to 2 decimal places'], ['d', '③ Change in speed', 'this speed − speed before', 'start at metre 2 (nothing before metre 1)'], ['a', '④ Acceleration', 'the app works it out', 'then you graph it']];
rows.forEach(([c, h, f, n], i) => { const y = 1.45 + i * 1.12; card(s, 0.6, y, 8.0, 0.95, SOFT[c], K[c]);
  T(s, h, { x: 0.8, y: y + 0.1, w: 3.2, h: 0.75, fontSize: 20, bold: true, color: K[c], valign: 'middle' });
  T(s, f, { x: 4.0, y: y + 0.08, w: 4.5, h: 0.45, fontSize: 18, bold: true }); T(s, n, { x: 4.0, y: y + 0.5, w: 4.5, h: 0.4, fontSize: 14, color: K.mute }); });
card(s, 9.0, 1.45, 3.7, 4.3, 'F8FAFC', 'CBD5E1');
T(s, 'Help is built in', { x: 9.2, y: 1.6, w: 3.3, h: 0.45, fontSize: 20, bold: true });
T(s, [{ text: '? explains each step', options: { bullet: true, breakLine: true } }, { text: '🧮 calculator', options: { bullet: true, breakLine: true } }, { text: 'Tap a box to light up the numbers it uses', options: { bullet: true, breakLine: true } }, { text: 'Check my maths: ✓ or ✗', options: { bullet: true, breakLine: true } }, { text: 'Graph: room below zero for minus numbers!', options: { bullet: true, bold: true, color: K.a } }],
  { x: 9.2, y: 2.15, w: 3.3, h: 3.5, fontSize: 16, paraSpaceAfter: 6 });
T(s, 'Finish: forces → conclusion → 📄 Save my worksheet (PDF) → upload to Toddle', { x: 0.6, y: 6.15, w: 12.1, h: 0.5, fontSize: 18, bold: true });

/* 9. Exit question */
s = pres.addSlide({ masterName: 'DARK' });
s.addText('Exit question', { placeholder: 'title' });
card(s, 0.7, 2.0, 11.9, 2.2, '1E293B', '334155');
T(s, 'On the flat, the cart\'s acceleration was negative. Why?', { x: 1.0, y: 2.25, w: 11.3, h: 0.9, fontSize: 32, bold: true, color: 'FFFFFF' });
T(s, 'Answer in one sentence.', { x: 1.0, y: 3.25, w: 11.3, h: 0.6, fontSize: 22, color: 'CBD5E1' });
pill(s, 0.7, 4.7, 2.6, 'v', 'Grade 6', 18); T(s, 'Use: slowing down, friction', { x: 3.5, y: 4.7, w: 8.5, h: 0.45, fontSize: 20, color: 'FFFFFF', valign: 'middle' });
pill(s, 0.7, 5.4, 2.6, 'a', 'Grade 7/8', 18); T(s, 'Use: unbalanced, resultant force, friction, m/s²', { x: 3.5, y: 5.4, w: 8.5, h: 0.45, fontSize: 20, color: 'FFFFFF', valign: 'middle' });
s.addNotes('Model answer (G6): The cart was slowing down because friction pushed against it and gravity could no longer pull it forwards. (G7/8): On the flat, weight and normal force balance, so friction is the unbalanced resultant force acting backwards, giving a negative acceleration of about −0.5 m/s².');

(async () => {
  const out = path.join(__dirname, 'Acceleration-Lab-Day9.pptx');
  await pres.writeFile({ fileName: out });
  if (SKILL) { const { applyTheme } = require(path.join(SKILL, 'scripts/apply_theme.js')); await applyTheme(out, THEME); }
  console.log('wrote', out);
})();
