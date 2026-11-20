#!/usr/bin/env node
/**
 * Unit tests for the table-piece geometry (shapes, rotation, snapping, joins,
 * seat slots). Plain node, no dependencies:
 *
 *   node tests/geometry.test.js        exit code 0 = all passed
 *
 * The geometry lives in src/teacher-app.jsx between the @geometry-begin and
 * @geometry-end markers (kept free of JSX for exactly this reason); this file
 * lifts that block out and runs it. tests/run.js runs this file first too.
 */
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'src', 'teacher-app.jsx'), 'utf8');
const start = SRC.indexOf('/* @geometry-begin'), end = SRC.indexOf('/* @geometry-end */');
if (start < 0 || end < 0) { console.error('geometry block markers not found in teacher-app.jsx'); process.exit(1); }
const G = new Function(SRC.slice(start, end) + '\nreturn PIECE_GEOMETRY;')();
const { SHAPES, TRAP_H, shapeDef, pieceToWorld, clustersFromJoins, transformPieces, alignPieceToEdge, findSnap,
  slotsForLayout, syncPieceSeats, buildPieceSet, newPiece, seatCountOf, convertOptions, detectJoins, readingOrder } = G;

let failures = 0, passes = 0;
const ok = (cond, msg) => {
  if (cond) { passes++; console.log('  ok   ' + msg); }
  else { failures++; console.log('  FAIL ' + msg); }
};
const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const mkUid = () => { let i = 0; return () => 'id' + (++i); };
const nextLabel = gs => { const n = gs.map(g => parseInt(g.label)).filter(x => !isNaN(x)); return String(n.length ? Math.max(...n) + 1 : 1); };
const onSlots = (pieces, joins) => slotsForLayout(pieces, joins).filter(s => s.state === 'on');

console.log('Trapezoid outline');
{
  const d = shapeDef('trap');
  const [tl, tr, br, bl] = d.poly;
  ok(near(dist(tl, tr), 90) && near(dist(bl, br), 180), 'short base 90, long base 180');
  ok(near(dist(tr, br), 90) && near(dist(bl, tl), 90), 'both slanted sides are 90');
  const angle = (p, q, r) => { const a = [q[0] - p[0], q[1] - p[1]], b = [r[0] - p[0], r[1] - p[1]]; return Math.acos((a[0] * b[0] + a[1] * b[1]) / Math.hypot(...a) / Math.hypot(...b)) * 180 / Math.PI; };
  ok(near(angle(bl, br, tl), 60) && near(angle(br, bl, tr), 60), 'base angles are 60°');
  ok(near(angle(tl, tr, bl), 120) && near(angle(tr, tl, br), 120), 'top angles are 120°');
  ok(near(TRAP_H, 77.94, 0.01), `height ≈ 77.94 (${TRAP_H.toFixed(2)})`);
  ok(onSlots([newPiece('trap', mkUid())], []).length === 4, 'one seat on each side: 4 seats');
}

console.log('Shapes and their default seats');
{
  const u = mkUid();
  const count = s => onSlots([newPiece(s, u)], []).length;
  ok(count('single') === 1 && count('pair') === 2 && count('long4') === 4 && count('long6') === 6, 'single 1, pair 2, long4 4, long6 6');
  ok(count('round') === 4 && onSlots([newPiece('round', u, { seatCount: 6 })], []).length === 6, 'round 4, or 6 when asked');
  ok(count('bench') === 4 && SHAPES.bench.roles[0] === 'workstation', 'bench: 4 on one side, a workstation');
  const both = { ...newPiece('bench', u), seatsOn: [4, 5, 6, 7] };
  ok(onSlots([both], []).length === 8, 'bench with the back slots switched on seats 8');
  const off = { ...newPiece('long4', u), seatsOff: [0] };
  ok(onSlots([off], []).length === 3, 'seatsOff switches a slot off');
  // chairs sit outside the edge, facing the table
  const w = pieceToWorld(newPiece('long4', u));
  const sl = slotsForLayout([newPiece('long4', u)], []);
  ok(sl.filter(s => s.state === 'on').every(s => !G.pgInPoly([s.chair.x, s.chair.y], w.poly)), 'every chair is outside the table outline');
  const bottom = sl.find(s => s.slot === 2);
  ok(near(bottom.chair.facing, 0) && bottom.chair.y > 48, 'a bottom-edge chair sits below and faces up');
}

console.log('Two trapezoids, long base to long base');
{
  const set = buildPieceSet('hexagon', mkUid());
  const pts = set.pieces.flatMap(p => pieceToWorld(p).poly);
  // the 6 distinct corners of the outline
  const uniq = [];
  pts.forEach(p => { if (!uniq.some(q => dist(p, q) < 0.5)) uniq.push(p); });
  const c = [uniq.reduce((a, p) => a + p[0], 0) / uniq.length, uniq.reduce((a, p) => a + p[1], 0) / uniq.length];
  ok(uniq.length === 6, `outline has 6 corners (${uniq.length})`);
  ok(uniq.every(p => near(dist(p, c), 90, 0.05)), 'every corner is 90 from the centre (a regular hexagon)');
  ok(seatCountOf(set) === 6, `6 visible seats (${seatCountOf(set)})`);
  ok(slotsForLayout(set.pieces, set.joins).filter(s => s.state === 'joined').length === 2, 'the two long-base slots are hidden');
  ok(clustersFromJoins(set.pieces, set.joins).length === 1, 'the two pieces are one cluster');
  ok(detectJoins(set.pieces).length === 1, 'detectJoins finds the one shared edge');
  const tags = onSlots(set.pieces, set.joins).map(s => s.tag);
  const clash = (a, b) => Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h;
  ok(tags.every((a, i) => tags.every((b, j) => i === j || !clash(a, b))), 'no two name tags overlap');
}

console.log('Long tables end to end');
{
  const set = buildPieceSet('long8', mkUid());
  ok(seatCountOf(set) === 8, `long4 + long4 seats 8 (${seatCountOf(set)})`);
  const [a, b] = set.pieces;
  ok(near(b.x - a.x, 208) && near(b.y, a.y) && near(b.rot % 360, 0), 'the second table sits flush at the end, same way round');
  ok(seatCountOf(buildPieceSet('long12', mkUid())) === 12, 'long6 + long6 seats 12');
  const hs = buildPieceSet('horseshoe', mkUid());
  ok(seatCountOf(hs) === 9 && clustersFromJoins(hs.pieces, hs.joins).length === 1, 'horseshoe (a U of 3 long tables) is one table of 9, seated round the outside');
  const xs = hs.pieces.flatMap(p => pieceToWorld(p).poly.map(q => q[0]));
  ok(near(Math.min(...xs), -148, 0.05) && near(Math.max(...xs), 148, 0.05), 'its arms stand flush with the ends of the base');
  const insideOn = slotsForLayout(hs.pieces, hs.joins).filter(s => s.state === 'on' && Math.abs(s.chair.x) < 52 && s.chair.y < -48);
  ok(insideOn.length === 0, 'nobody sits inside the U');
  ok(seatCountOf({ pieces: hs.pieces.map(p => ({ ...p, seatsOff: [] })), joins: hs.joins }) === 16, 'switching the inside seats back on gives 16');
}

console.log('Snapping');
{
  const u = mkUid();
  const a = newPiece('trap', u);
  // second trap upside down, rotated 7° off and a little way below the first
  const b = { ...newPiece('trap', u), x: 6, y: TRAP_H + 10, rot: 187 };
  const snap = findSnap(b, [a]);
  ok(!!snap, 'a near-by, slightly turned trapezoid snaps');
  if (snap) {
    ok(near(snap.drot, -7, 0.01), `it is turned back by 7° (${snap.drot})`);
    const [moved] = transformPieces([b], [b.id], snap);
    ok(near(moved.x, 0, 0.05) && near(moved.y, TRAP_H, 0.05) && near(moved.rot, 180, 0.01), `long bases centred on each other (${moved.x}, ${moved.y}, ${moved.rot}°)`);
    ok(snap.joins.length === 1 && snap.joins[0].ea === 2 && snap.joins[0].eb === 2, 'the join is long base to long base');
  }
  // snapping after the target itself has been rotated: a long4 at 30°, another long4 near its right end
  const t = { ...newPiece('long4', u), x: 300, y: 200, rot: 30 };
  const endTarget = alignPieceToEdge(newPiece('long4', u), 3, t, 1);
  const m = { ...endTarget, x: endTarget.x + 9, y: endTarget.y - 6, rot: endTarget.rot + 8 };
  const s2 = findSnap(m, [t]);
  ok(!!s2, 'snaps to a rotated table');
  if (s2) {
    const [moved] = transformPieces([m], [m.id], s2);
    ok(near(moved.x, endTarget.x, 0.05) && near(moved.y, endTarget.y, 0.05) && near(moved.rot, 30, 0.01), 'ends up exactly end to end at 30°');
    ok(seatCountOf({ pieces: [t, moved], joins: s2.joins }) === 8, 'and seats 8');
  }
  // an unequal edge sits flush at the nearer end: a long4 end (96) against a long6 side (296)
  const big = newPiece('long6', u);
  const arm = { ...newPiece('long4', u), rot: 90, x: -90, y: -48 - 104 - 8 };
  const s3 = findSnap(arm, [big]);
  ok(!!s3, 'a table end snaps onto a long side');
  if (s3) {
    const [moved] = transformPieces([arm], [arm.id], s3);
    const w = pieceToWorld(moved).poly, xs = w.map(p => p[0]);
    ok(near(Math.min(...xs), -148, 0.05), `flush with the nearer (left) end (${Math.min(...xs).toFixed(2)})`);
  }
  ok(findSnap({ ...newPiece('long4', u), x: 0, y: 160 }, [newPiece('long4', u)]) === null, 'too far away: no snap');
  ok(findSnap({ ...newPiece('long4', u), x: 0, y: 96, rot: 30 }, [newPiece('long4', u)]) === null, 'too far turned: no snap');
  ok(findSnap({ ...newPiece('round', u), x: 0, y: 160 }, [newPiece('long4', u)]) === null, 'round tables have no edges to snap');
}

console.log('Seats follow their pieces');
{
  const uid = mkUid();
  const set = buildPieceSet('long4', uid);
  let lay = { seats: [], groups: [], pieces: set.pieces, joins: set.joins };
  let r = syncPieceSeats(lay, { uid, nextLabel });
  ok(r.seats.length === 4 && r.groups.length === 1 && r.groups[0].label === '1', 'a long table makes 4 seats in one group "1"');
  // seat students, tag one seat, lock one
  let seats = r.seats.map((s, i) => ({ ...s, studentId: 'st' + i, locked: i === 1, tags: i === 2 ? ['LS'] : [] }));
  const before = Object.fromEntries(seats.map(s => [s.pieceId + ':' + s.slot, s]));
  // move it, then rotate it 90°
  let pieces = transformPieces(set.pieces, [set.pieces[0].id], { dx: 120, dy: 64 });
  r = syncPieceSeats({ seats, groups: r.groups, pieces, joins: [] }, { uid, nextLabel });
  pieces = transformPieces(pieces, [pieces[0].id], { drot: 90, pivot: [pieces[0].x, pieces[0].y] });
  r = syncPieceSeats({ seats: r.seats, groups: r.groups, pieces, joins: [] }, { uid, nextLabel });
  const after = Object.fromEntries(r.seats.map(s => [s.pieceId + ':' + s.slot, s]));
  ok(Object.keys(before).every(k => after[k] && after[k].id === before[k].id && after[k].studentId === before[k].studentId), 'every student keeps their seat through a move and a rotate');
  ok(Object.keys(before).every(k => after[k].locked === before[k].locked && JSON.stringify(after[k].tags) === JSON.stringify(before[k].tags)), 'locks and seat tags come along too');
  ok(r.bumped.length === 0 && r.groups.length === 1 && r.groups[0].label === '1', 'nobody is bumped and the group keeps its name');
  ok(Object.keys(before).some(k => after[k].x !== before[k].x), 'seat positions did change');
  // plain seats are never touched
  const plain = { id: 'p1', groupId: null, x: 10, y: 10, tags: [], tagRule: 'OR', studentId: 'zz', locked: false, used: true };
  const r2 = syncPieceSeats({ seats: [plain, ...r.seats], groups: r.groups, pieces, joins: [] }, { uid, nextLabel });
  ok(r2.seats[0] === plain, 'a seat without a pieceId is left exactly as it was');
}

console.log('A seat hidden by a join sends its student back');
{
  const uid = mkUid();
  const a = newPiece('trap', uid), b = alignPieceToEdge(newPiece('trap', uid, { rot: 180 }), 2, a, 2);
  // two separate trapezoids first: 8 seats, two groups
  let r = syncPieceSeats({ seats: [], groups: [], pieces: [a, b], joins: [] }, { uid, nextLabel });
  ok(r.seats.length === 8 && r.groups.length === 2, 'two separate trapezoids: 8 seats in 2 groups');
  const seats = r.seats.map((s, i) => ({ ...s, studentId: 'st' + i }));
  const onLongBase = seats.filter(s => s.slot === 2).map(s => s.studentId);
  r = syncPieceSeats({ seats, groups: r.groups, pieces: [a, b], joins: [{ a: a.id, ea: 2, b: b.id, eb: 2 }] }, { uid, nextLabel });
  ok(r.seats.length === 6, 'joined into a hexagon: 6 seats');
  ok(r.bumped.length === 2 && onLongBase.every(id => r.bumped.includes(id)), 'the 2 students on the long bases are bumped (to go back to the unplaced list)');
  ok(r.groups.length === 1 && r.groups[0].seatIds.length === 6, 'the two groups merged into one of 6');
  const labels = r.groups.map(g => g.label);
  // and split again
  const r3 = syncPieceSeats({ seats: r.seats, groups: r.groups, pieces: [a, b], joins: [] }, { uid, nextLabel });
  ok(r3.groups.length === 2 && r3.groups.some(g => g.label === labels[0]) && new Set(r3.groups.map(g => g.label)).size === 2, 'separating splits it into two groups again, with distinct names');
  ok(r3.seats.length === 8 && r3.seats.filter(s => s.studentId).length === 6, 'the 6 seated students are all still seated');
}

console.log('Convert options and reading order');
{
  const o4 = convertOptions(4).map(o => o.kind);
  ok(o4.includes('long4') && o4.includes('trap') && !o4.includes('single'), `4 seats offers long4 and trap (${o4.join(', ')})`);
  ok(convertOptions(6).some(o => o.kind === 'hexagon'), '6 seats offers a hexagon');
  ok(convertOptions(20).every(o => o.seats >= 20), 'a big group gets something big enough');
  const order = readingOrder([[200, 10], [10, 12], [10, 80], [200, 78]], p => p).map(p => p.join(','));
  ok(order.join(' ') === '10,12 200,10 10,80 200,78', 'reading order is row by row, left to right');
}

console.log(`\n${passes} passed, ${failures} failed.`);
process.exit(failures ? 1 : 0);
