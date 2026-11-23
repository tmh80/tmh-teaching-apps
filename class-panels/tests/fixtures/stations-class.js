/* Class 9S for the station-rotation tests (Phase 7). Fake names only.
 *
 * 8 students; a room with two long tables and a lab bench, all flagged as stations, plus a computer
 * item flagged as the fourth: 4 stations (1 Circuits, 2 Magnets, 3 Heat, 4 Light), set up in that
 * order. Four generated groups of two (gp-fx-9s; the 2nd and 4th have names, the others show as
 * "Group 1" and "Group 3"), and one saved grouping of three (gg-fx-9s) for "pick another source".
 * The long tables' seats hold the students, so the tests can prove no seat ever changes.
 *
 * build(G) takes the geometry block lifted out of teacher-app.jsx (as tests/geometry.test.js does),
 * so the seats are exactly what the app makes.
 */
module.exports.build = G => {
  let n = 0;
  const uid = () => `fx-9s-${++n}`;
  const nextLabel = gs => { const v = gs.map(g => parseInt(g.label)).filter(x => !isNaN(x)); return String(v.length ? Math.max(...v) + 1 : 1); };
  const at = (shape, x, y, station) => ({ ...G.newPiece(shape, uid), x, y, station });
  const pieces = [
    at('long4', 240, 220, { n: 1, name: 'Circuits' }),
    at('long4', 640, 220, { n: 2, name: 'Magnets' }),
    at('bench', 240, 470, { n: 3, name: 'Heat' }),
  ];
  const { seats: blank, groups } = G.syncPieceSeats({ seats: [], groups: [], pieces, joins: [] }, { uid, nextLabel });
  const names = ['Ada Pretend', 'Ben Sample', 'Cai Mock', 'Dee Example', 'Eli Fake', 'Fay Demo', 'Gus Dummy', 'Hana Madeup'];
  const students = names.map((name, i) => ({ id: `s${i + 1}`, name, gender: i % 2 ? 'F' : 'M', grade: '9', ls: false, eal: false, coldCallExcluded: false, tags: [] }));
  const deskIds = pieces.slice(0, 2).map(p => p.id);
  let k = 0;
  const seats = blank.map(s => (deskIds.includes(s.pieceId) && k < 8 ? { ...s, studentId: students[k++].id } : s));
  const roomItems = [
    { id: 'fx-9s-board', type: 'board', x: 450, y: 70 },
    { id: 'fx-9s-pc', type: 'computer', x: 700, y: 450, w: 72, h: 48, rot: 0, rotation: 0, label: 'Computer station', fixed: false, station: { n: 4, name: 'Light' } },
  ];
  const walls = [
    { id: 'w9T', x1: 40, y1: 40, x2: 1000, y2: 40 }, { id: 'w9R', x1: 1000, y1: 40, x2: 1000, y2: 600 },
    { id: 'w9B', x1: 1000, y1: 600, x2: 40, y2: 600 }, { id: 'w9L', x1: 40, y1: 600, x2: 40, y2: 40 },
  ];
  const sl = { seats, groups, tags: [], roomItems, rules: [], pieces, joins: [], walls };
  const ids = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
  const gp = {
    mode: 'count', sizeVal: '2', countVal: '4', fairness: false, groupRules: [], finalised: true,
    groupNames: ['', 'Falcons', '', 'Owls'],
    resultGroupIds: [ids.slice(0, 2), ids.slice(2, 4), ids.slice(4, 6), ids.slice(6, 8)], ungroupedIds: [],
  };
  const gg = [{ id: 'fx-9s-gg1', name: 'Lab trios', groupIds: [ids.slice(0, 3), ids.slice(3, 6), ids.slice(6, 8)], names: ['Sparks', '', 'Volts'], createdAt: 1794474000000 }];
  return {
    classObj: { id: 'fx-9s', name: 'Grade 9S Test', students },
    sl, gp, gg, stationIds: [pieces[0].id, pieces[1].id, pieces[2].id, 'fx-9s-pc'], students,
  };
};
