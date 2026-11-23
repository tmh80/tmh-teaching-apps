/* Class 8C for the class-setup tests (Phase 5). Fake names only.
 *
 * 10 students; a room with four long tables of 4 (used as tables) and three lab
 * benches of 4 places (workstations); a keep-apart rule; and one Previous
 * arrangement saved before setups existed (so it has no setupId). Regular starts
 * the old way: the first 10 table seats in list order, so the last table is empty.
 *
 * build(G) takes the geometry block lifted out of teacher-app.jsx (as
 * tests/geometry.test.js does), so the seats are exactly what the app makes.
 */
module.exports.build = G => {
  let n = 0;
  const uid = () => `fx-8c-${++n}`;
  const nextLabel = gs => { const v = gs.map(g => parseInt(g.label)).filter(x => !isNaN(x)); return String(v.length ? Math.max(...v) + 1 : 1); };
  const at = (shape, x, y) => ({ ...G.newPiece(shape, uid), x, y });
  const pieces = [
    at('long4', 200, 200), at('long4', 480, 200), at('long4', 760, 200), at('long4', 1040, 200),
    at('bench', 260, 470), at('bench', 640, 470), at('bench', 1020, 470),
  ];
  const { seats: blank, groups } = G.syncPieceSeats({ seats: [], groups: [], pieces, joins: [] }, { uid, nextLabel });
  const names = ['Aria Fake', 'Bo Pretend', 'Cy Sample', 'Di Mock', 'Ed Example', 'Flo Test', 'Gil Demo', 'Hal Dummy', 'Ivy Madeup', 'Jun Placeholder'];
  const students = names.map((name, i) => ({ id: `c${i + 1}`, name, gender: i % 2 ? 'F' : 'M', grade: '8', ls: false, eal: false, coldCallExcluded: false, tags: [] }));
  const deskIds = pieces.slice(0, 4).map(p => p.id), benchIds = pieces.slice(4).map(p => p.id);
  let k = 0;
  const seats = blank.map(s => (deskIds.includes(s.pieceId) && k < 10 ? { ...s, studentId: students[k++].id } : s));
  const walls = [
    { id: 'w8T', x1: 40, y1: 40, x2: 1200, y2: 40 }, { id: 'w8R', x1: 1200, y1: 40, x2: 1200, y2: 600 },
    { id: 'w8B', x1: 1200, y1: 600, x2: 40, y2: 600 }, { id: 'w8L', x1: 40, y1: 600, x2: 40, y2: 40 },
  ];
  const sl = {
    seats, groups, tags: ['LS', 'EAL'],
    roomItems: [{ id: 'fx-8c-board', type: 'board', x: 490, y: 60 }],
    rules: [{ id: 'fx-8c-r1', type: 'apart', aId: 'c1', bId: 'c2' }],
    pieces, joins: [], walls,
  };
  const sh = [{ id: 'fx-8c-h0', name: 'Old 8C arrangement', createdAt: 1794474000000, seats, groups, roomItems: sl.roomItems, pieces, joins: [] }];
  return {
    classObj: { id: 'fx-8c', name: 'Grade 8C Test', students },
    sl, sh, deskIds, benchIds,
  };
};
