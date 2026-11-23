/* A full science-lab layout (as saved in sl-<class>) for screenshots and tests */
const X1 = 32, Y1 = 32, X2 = 912, Y2 = 632;
let n = 0; const id = p => `${p}${++n}`;
const walls = [
  { id: 'wT', x1: X1, y1: Y1, x2: X2, y2: Y1 },
  { id: 'wR', x1: X2, y1: Y1, x2: X2, y2: Y2 },
  { id: 'wB', x1: X2, y1: Y2, x2: X1, y2: Y2 },
  { id: 'wL', x1: X1, y1: Y2, x2: X1, y2: Y1 },
];
const op = (type, wallId, t, extra = {}) => ({ id: id('op'), type, wallId, t, width: { door: 56, 'double-door': 104, window: 80 }[type], flip: false, swing: 1, ...extra });
const openings = [
  op('double-door', 'wB', 0.8), op('window', 'wB', 0.45), op('window', 'wB', 0.6),
  op('door', 'wL', 0.19),
];
const T = {
  desk: [128, 56], board: [256, 32], screen: [192, 16], tv: [80, 24], bookshelf: [128, 32], cupboard: [80, 40], filing: [40, 48], bin: [32, 32], recycling: [32, 32],
  computer: [72, 48], window: [160, 24], printer: [48, 40], sofa: [128, 56], rug: [128, 96], plant: [32, 32], hooks: [96, 16], sink: [64, 40], demo: [192, 56], fume: [88, 48], eyewash: [32, 32],
  shower: [32, 32], blanket: [32, 32], extinguisher: [32, 32], firstaid: [32, 32], gas: [32, 32], estop: [32, 32], chemstore: [72, 40], prepdoor: [64, 64], goggles: [64, 32], glassbin: [32, 32], isolator: [32, 32],
};
const FIXED = new Set(['board', 'screen', 'tv', 'cupboard', 'hooks', 'sink', 'demo', 'fume', 'eyewash', 'shower', 'blanket', 'extinguisher', 'firstaid', 'gas', 'estop', 'window', 'chemstore', 'prepdoor', 'goggles', 'isolator']);
const NAMES = { desk: "Teacher's desk", board: 'Whiteboard', sink: 'Sink', demo: 'Demo bench', fume: 'Fume cupboard', eyewash: 'Eyewash station', shower: 'Safety shower', blanket: 'Fire blanket', extinguisher: 'Fire extinguisher', firstaid: 'First-aid kit', gas: 'Gas shut-off', estop: 'Emergency stop', chemstore: 'Chemical store', prepdoor: 'Prep room', goggles: 'Goggles', glassbin: 'Broken glass', isolator: 'Power isolator', bin: 'Bin', recycling: 'Recycling' };
/* item by its centre (cx,cy) and turn */
const item = (type, cx, cy, rot = 0, extra = {}) => {
  const w = extra.w ?? T[type][0], h = extra.h ?? T[type][1];
  return { id: id('it'), type, x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h, rot, rotation: rot, label: NAMES[type] || type, fixed: FIXED.has(type), ...extra };
};
const area = (cx, cy, w, h, color, label) => ({ id: id('ar'), type: 'area', x: cx - w / 2, y: cy - h / 2, w, h, rot: 0, rotation: 0, label, color, fixed: false });
const roomItems = [
  area(490, 376, 744, 400, 'cyan', 'Practical area'), area(480, 134, 372, 84, 'sunny', 'Demo zone'),
  { id: id('ln'), type: 'line', x: 299, y: 380, w: 372, h: 16, rot: 90, rotation: 90, label: 'Fire exit route', fixed: false, dashed: true, arrow: true, color: 'coral' },
  item('window', 180, 32, 0, { label: '', w: 144 }), item('window', 372, 32, 0, { label: '' }), item('window', 660, 32, 0, { label: '' }), item('window', 800, 32, 0, { label: '', w: 120 }),
  item('board', 480, 62), item('demo', 480, 130), item('desk', 150, 86, 0, { w: 176, h: 72 }), item('estop', 624, 128, 0, { label: 'Emergency stop' }), item('isolator', 744, 128),
  item('prepdoor', 868, 86, 90, { label: 'Prep room' }),
  item('sink', 64, 165, 90, { label: 'Sink A' }), item('sink', 64, 262, 90, { label: 'Sink B' }),
  item('eyewash', 62, 352), item('shower', 62, 430, 0, { label: 'Safety shower' }),
  item('fume', 880, 180, 90, { label: 'Fume cupboard' }), item('fume', 880, 300, 90, { label: 'Fume cupboard' }),
  item('chemstore', 880, 424, 90, { label: 'Chemical store' }),
  item('firstaid', 690, 584, 0, { label: 'First aid' }), item('extinguisher', 782, 584, 0, { label: 'Extinguisher' }), item('blanket', 872, 584, 0, { label: 'Fire blanket' }),
  item('goggles', 340, 602), item('gas', 100, 602, 0, { label: 'Gas shut-off' }), item('glassbin', 560, 602, 0, { label: 'Broken glass' }),
];
const benchNames = ['Circuits', 'Forces', 'Light', 'Magnets', 'Heat', 'Waves'];
const benchAt = [[290, 255], [680, 255], [290, 375], [680, 375], [290, 495], [680, 495]];
const pieces = benchAt.map(([x, y], i) => ({ id: `bn${i + 1}`, shape: 'bench', x, y, rot: 0, roles: ['workstation'], seatsOff: [], label: `Bench ${'ABCDEF'[i]}`, station: { n: i + 1, name: benchNames[i] } }));
const lab = { seats: [], groups: [], tags: ['LS', 'EAL'], roomItems, rules: [], pieces, joins: [], walls, openings };
module.exports = { lab, benchNames };
