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
  // chairs are tucked under the table edge (centre just inside, back sticking out), facing the table
  const w = pieceToWorld(newPiece('long4', u));
  const sl = slotsForLayout([newPiece('long4', u)], []);
  ok(sl.filter(s => s.state === 'on').every(s => G.pgInPoly([s.chair.x, s.chair.y], w.poly) && !G.pgInPoly([s.p[0] + s.n[0] * 4, s.p[1] + s.n[1] * 4], w.poly)), 'every chair is tucked under the edge: its centre is under the table, its back sticks out');
  const bottom = sl.find(s => s.slot === 2);
  ok(near(bottom.chair.facing, 0) && bottom.chair.y > 42 && bottom.chair.y < 48, 'a bottom-edge chair sits under the bottom edge and faces up');
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

console.log('Chairs under plain seat groups, standing spots at benches');
{
  const { legacyChairs, pgStanding } = G;
  const box = (x, y, id) => ({ id, x, y });
  const rectOf = its => { const xs = its.map(i => i.x), ys = its.map(i => i.y); const x0 = Math.min(...xs), y0 = Math.min(...ys); return { x: x0 - 8, y: y0 - 8, w: Math.max(...xs) - x0 + 114 + 16, h: Math.max(...ys) - y0 + 52 + 16 }; };
  const sides = its => legacyChairs(its, rectOf(its)).map(c => c.side).join('');
  const sq = [box(100, 100, 'a'), box(214, 100, 'b'), box(100, 152, 'c'), box(214, 152, 'd')];
  ok(sides(sq) === 'TTBB', `2x2: top row above, bottom row below (${sides(sq)})`);
  ok(sides([box(0, 0, 'a'), box(114, 0, 'b'), box(228, 0, 'c')]) === 'BBB', 'a single row puts chairs below');
  ok(sides([box(0, 0, 'a'), box(0, 52, 'b'), box(0, 104, 'c')]) === 'LLL', 'a single column puts chairs to the left');
  ok(sides([box(0, 0, 'a'), box(114, 0, 'b'), box(0, 52, 'c'), box(114, 52, 'd'), box(0, 104, 'e'), box(114, 104, 'f')]) === 'LRLRLR', 'two columns of 3 rows: the outer side');
  ok(sides([box(0, 0, 'a')]) === 'B', 'a lone seat gets its chair below');
  const big = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) big.push(box(c * 114, r * 52, `${r}${c}`));
  ok(sides(big) === 'TTTLRBBB' && legacyChairs(big, rectOf(big)).length === 8, 'a 3x3 block: edges get chairs, the middle seat is tucked fully under (none drawn)');
  const cs = legacyChairs(sq, rectOf(sq)), top = cs.find(c => c.id === 'a'), bot = cs.find(c => c.id === 'c');
  ok(near(top.y, 100 - 8 + 1) && top.facing === 180 && near(bot.y, 152 + 52 + 8 - 1) && bot.facing === 0, 'chairs are centred just inside the table edge, facing the table');
  ok(pgStanding({ roles: ['workstation'] }) && !pgStanding({ roles: ['desk', 'workstation'] }) && !pgStanding({ roles: ['desk'] }), 'only roles exactly [workstation] means standing spots');
  const b = newPiece('bench', mkUid()), bs = slotsForLayout([b], []).filter(s => s.state === 'on');
  ok(bs.length === 4 && bs.every(s => s.standing && dist([s.chair.x, s.chair.y], s.p) > 8), 'a lab bench has 4 standing spots just outside its edge');
  const bd = slotsForLayout([{ ...b, roles: ['desk'] }], []).filter(s => s.state === 'on');
  ok(bd.length === 4 && bd.every(s => !s.standing), 'switched to Table, the same bench has chairs (and the same 4 slots)');
}

/* ── Room shell (Phase 4): walls, openings, items, the room library ── */
const { itemCentre, lineItemFromPoints, snapItemToWall, AREA_COLOURS, wallSnapPoint, rectRoomWalls, closestOnWall, clampOpeningT, openingAtPoint, openingFrame, itemGeom, itemBounds, upgradeLegacyItem, newRoomItem,
  extractShell, extractLayout, applyRoomShell, sameShell, instantiateLayout, migrateLegacyLayouts, nextStationNumber, ROOM_ITEM_TYPES, ROOM_ITEM_SECTIONS } = G;

console.log('Wall snapping');
{
  ok(wallSnapPoint([83, 61], []).p.join() === '80,64', 'a free point snaps to the 8 px grid');
  const diag = wallSnapPoint([140, 133], [], { anchor: [100, 100] }).p;
  ok(diag.join() === '140,140', `a 45° drag stays on the diagonal (${diag})`);
  ok(Math.abs(diag[0] - 100) === Math.abs(diag[1] - 100), 'both axes moved by the same amount');
  ok(wallSnapPoint([203, 112], [], { anchor: [100, 100] }).p.join() === '200,100', 'a nearly horizontal drag snaps to 0°');
  ok(wallSnapPoint([108, 197], [], { anchor: [100, 100] }).p.join() === '100,200', 'a nearly vertical drag snaps to 90°');
  ok(wallSnapPoint([-40, 98], [], { anchor: [100, 100] }).p.join() === '-40,100', 'dragging left stays horizontal');
  const walls = [{ id: 'a', x1: 40, y1: 40, x2: 300, y2: 40 }];
  const j = wallSnapPoint([306, 47], walls, { anchor: [300, 200] });
  ok(j.joined && j.p.join() === '300,40', 'a wall end snaps onto a nearby wall end so the corner joins exactly');
  ok(!wallSnapPoint([330, 47], walls).joined, 'but not from far away');
  ok(!wallSnapPoint([302, 42], walls, { ignoreId: 'a' }).joined, 'a wall never snaps to its own ends');
  const rect = rectRoomWalls({ x: 21, y: 22, w: 300, h: 200 }, (() => { let i = 0; return () => 'w' + i++; })());
  ok(rect.length === 4 && rect[0].x1 === 16 && rect[0].y1 === 16 && rect[0].x2 === 328 && rect[2].y1 === 224, 'Rectangle room makes four walls on the grid, just outside the box');
  ok(rect.every((w, i) => w.x2 === rect[(i + 1) % 4].x1 && w.y2 === rect[(i + 1) % 4].y1), 'the four walls join end to end, clockwise');
  ok(rectRoomWalls({ x: -50, y: -50, w: 100, h: 100 }, () => 'q')[0].x1 === 8, 'a rectangle never starts off the canvas');
}

console.log('Openings on a wall');
{
  const wall = { id: 'w', x1: 0, y1: 0, x2: 200, y2: 0 };
  const c = closestOnWall(wall, [150, 12]);
  ok(near(c.t, 0.75) && near(c.dist, 12), 'the closest point on a wall gives its position t and how far away it is');
  ok(clampOpeningT(wall, 56, 0.01) === 0.14 && clampOpeningT(wall, 56, 0.99) === 0.86, 'a door can\'t poke out past the ends of its wall');
  ok(clampOpeningT({ id: 'x', x1: 0, y1: 0, x2: 40, y2: 0 }, 56, 0.2) === 0.5, 'on a wall shorter than the door it sits in the middle');
  const drop = openingAtPoint([wall], [100, 20], 56, 36);
  ok(drop && drop.wallId === 'w' && drop.t === 0.5, 'dropping a door near a wall puts it on that wall at that spot');
  ok(openingAtPoint([wall], [100, 90], 56, 36) === null, 'dropping it far from any wall puts it nowhere');
  const two = [wall, { id: 'v', x1: 0, y1: 100, x2: 200, y2: 100 }];
  ok(openingAtPoint(two, [60, 80], 56, 36).wallId === 'v', 'with two walls it picks the nearer one');
  const f = openingFrame(wall, { t: 0.25, width: 56 });
  ok(near(f.c[0], 50) && near(f.c[1], 0) && near(f.a[0], 22) && near(f.b[0], 78) && f.ang === 0, 'an opening is centred at t along the wall, its width spread each side');
  const diagWall = { id: 'd', x1: 0, y1: 0, x2: 100, y2: 100 };
  const fd = openingFrame(diagWall, { t: 0.5, width: 40 });
  ok(near(fd.ang, 45) && near(fd.c[0], 50) && near(dist(fd.a, fd.b), 40), 'on a diagonal wall the opening turns with it');
}

console.log('Room items');
{
  const mk = type => ({ id: 'i', type, x: 100, y: 100 });
  ok(itemGeom(mk('desk')).w === 114 && itemGeom(mk('desk')).h === 52 && itemGeom(mk('desk')).legacy, 'an original desk keeps its old fixed size');
  ok(itemGeom({ ...mk('desk'), rotation: 90 }).w === 52, 'and its old on-its-side shape');
  ok(itemGeom(mk('sink')).w === 64 && !itemGeom(mk('sink')).legacy, 'a catalogue item falls back to its catalogue size');
  ok(itemGeom({ ...mk('sink'), w: 80, h: 48 }).w === 80, 'a saved size wins');
  const b = itemBounds({ id: 'i', type: 'box', x: 100, y: 100, w: 100, h: 40, rot: 90 });
  ok(near(b.w, 40) && near(b.h, 100) && near(b.x + b.w / 2, 150) && near(b.y + b.h / 2, 120), 'a turned item\'s bounds swap, about its middle');
  const door = { id: 'd', type: 'door', x: 800, y: 400, rotation: 90 };
  const up = upgradeLegacyItem(door), bb0 = itemBounds(door), bb1 = itemBounds(up);
  ok(up.w === 64 && up.rot === 90 && near(bb0.x, bb1.x, 0.1) && near(bb0.y, bb1.y, 0.1) && near(bb0.w, bb1.w, 0.1), 'an original door is converted without moving');
  const desk = { id: 'k', type: 'desk', x: 60, y: 60, rotation: 90 }, ud = upgradeLegacyItem(desk), db0 = itemBounds(desk), db1 = itemBounds(ud);
  ok(ud.w === 114 && ud.rot === 90 && near(db0.x, db1.x, 0.1) && near(db0.y, db1.y, 0.1) && near(db0.h, db1.h, 0.1), 'and so is an original desk on its side');
  ok(upgradeLegacyItem(ud) === ud, 'converting twice changes nothing');
  const all = ROOM_ITEM_SECTIONS.flatMap(s => s.types);
  ok(all.every(t => ROOM_ITEM_TYPES[t]) && ['sink', 'fume', 'eyewash', 'shower', 'blanket', 'extinguisher', 'firstaid', 'gas', 'estop', 'chemstore', 'prepdoor', 'goggles', 'glassbin', 'isolator', 'demo'].every(t => ROOM_ITEM_SECTIONS.find(x => x.id === 'lab').types.includes(t)), 'every catalogue entry exists and the lab section has all 15 lab items');
  ok(['box', 'text', 'arrow'].every(t => ROOM_ITEM_SECTIONS.find(x => x.id === 'free').types.includes(t)), 'free shapes: box, text and arrow');
  ok(ROOM_ITEM_TYPES.sink.fixed && ROOM_ITEM_TYPES.fume.fixed && ROOM_ITEM_TYPES.board.fixed && !ROOM_ITEM_TYPES.bin.fixed, 'sinks, fume cupboards and boards start fixed; bins don\'t');
  ok(nextStationNumber([{ station: { n: 2 } }], [{ station: { n: 5 } }, {}]) === 6 && nextStationNumber([], []) === 1, 'the next station number follows the highest one');
}

console.log('Room library: shell, layout, apply');
{
  const uid = mkUid();
  const lo = {
    seats: [{ id: 's1', groupId: 'g1', x: 0, y: 0, studentId: 'stu1', locked: true, used: true, pieceId: 'p1', slot: 0 }, { id: 's2', groupId: 'g1', x: 1, y: 1, studentId: 'stu2', locked: false, used: true, pieceId: 'p1', slot: 1 }],
    groups: [{ id: 'g1', seatIds: ['s1', 's2'], label: '1' }], tags: ['LS'], rules: [{ id: 'r', type: 'apart' }],
    roomItems: [{ id: 'sinkA', type: 'sink', x: 10, y: 10, fixed: true }, { id: 'binA', type: 'bin', x: 50, y: 50, fixed: false }, { id: 'oldDesk', type: 'desk', x: 5, y: 5, rotation: 0 }],
    pieces: [{ id: 'p1', shape: 'pair', x: 100, y: 100, rot: 0, roles: ['desk'], station: { n: 1, name: 'Dissect' } }], joins: [],
    walls: [{ id: 'w1', x1: 0, y1: 0, x2: 100, y2: 0 }], openings: [{ id: 'o1', type: 'door', wallId: 'w1', t: 0.5, width: 56, flip: false, swing: 1 }],
  };
  const sh = extractShell(lo);
  ok(sh.walls.length === 1 && sh.openings.length === 1 && sh.items.length === 1 && sh.items[0].id === 'sinkA', 'the shell is the walls, openings and fixed items only');
  const ly = extractLayout(lo);
  ok(ly.items.map(i => i.id).join() === 'binA,oldDesk', 'the layout holds the non-fixed items (original items count as movable)');
  ok(ly.seats.every(s => s.studentId === null && !s.locked) && ly.pieces[0].station.n === 1, 'a layout never holds students, and keeps its pieces (and station flags)');
  ok(lo.seats[0].studentId === 'stu1', 'extracting doesn\'t touch the class\'s own seats');
  const room = { id: 'R', name: 'Lab 204', shell: { walls: [{ id: 'w1', x1: 0, y1: 0, x2: 100, y2: 0 }, { id: 'w2', x1: 100, y1: 0, x2: 100, y2: 80 }], openings: [], items: [{ id: 'sinkA', type: 'sink', x: 10, y: 10, fixed: true }, { id: 'fumeA', type: 'fume', x: 90, y: 10, fixed: true }] }, layouts: [] };
  const ap = applyRoomShell(lo, room);
  ok(ap.walls.length === 2 && !('openings' in ap) && ap.roomItems.filter(i => i.fixed).map(i => i.id).join() === 'sinkA,fumeA', 'applying a shell swaps in its walls, openings and fixed items');
  ok(ap.roomItems.some(i => i.id === 'binA') && ap.roomItems.some(i => i.id === 'oldDesk'), 'and keeps the class\'s own movable items');
  ok(JSON.stringify(ap.seats) === JSON.stringify(lo.seats) && JSON.stringify(ap.pieces) === JSON.stringify(lo.pieces) && ap.rules === lo.rules && ap.tags === lo.tags && JSON.stringify(ap.groups) === JSON.stringify(lo.groups), 'seats, students, pieces, groups, tags and rules are untouched');
  ok(JSON.stringify(applyRoomShell(ap, room)) === JSON.stringify(ap), 'applying twice gives the same result');
  ok(sameShell(ap, room) && !sameShell(lo, room), 'sameShell says whether a class already has the room\'s shell');
  ok(!('walls' in applyRoomShell(lo, { shell: { walls: [], openings: [], items: [] } })), 'a room with no walls clears them (and writes no empty field)');
  const inst = instantiateLayout({ ...ly, items: ly.items }, uid);
  ok(inst.pieces[0].id !== 'p1' && inst.seats.every(s => s.pieceId === inst.pieces[0].id) && inst.seats[0].id !== 's1', 'a layout instance has fresh piece and seat ids, linked to each other');
  ok(inst.groups[0].seatIds.every(id => inst.seats.some(s => s.id === id)) && inst.seats.every(s => s.groupId === inst.groups[0].id), 'its groups point at the new seats');
  ok(inst.items.length === 2 && inst.items.every(i => !['binA', 'oldDesk'].includes(i.id)) && inst.pieces[0].station.name === 'Dissect', 'items get fresh ids and station flags carry over');
  const legacy = [{ id: 'L1', name: 'Test clusters', seats: [], groups: [], roomItems: [{ id: 'x', type: 'desk', x: 1, y: 1 }], createdAt: 5 }];
  const m1 = migrateLegacyLayouts([], legacy);
  ok(m1.length === 1 && m1[0].legacy && m1[0].name === 'My saved layouts' && m1[0].layouts[0].name === 'Test clusters' && m1[0].layouts[0].items.length === 1, 'old saved layouts come in as a room called "My saved layouts"');
  ok(JSON.stringify(migrateLegacyLayouts(m1, legacy)) === JSON.stringify(m1) && migrateLegacyLayouts([{ id: 'a' }], []).length === 1, 'the migration is idempotent and does nothing without old layouts');
}

console.log('Zones, lines and board-style windows');
{
  ok(ROOM_ITEM_SECTIONS[0].id === 'zones' && ROOM_ITEM_SECTIONS[0].types.join() === 'area,line', 'the catalogue starts with a "Zones and lines" section (area, line)');
  ok(ROOM_ITEM_SECTIONS.find(x => x.id === 'classroom').types.includes('window') && ROOM_ITEM_TYPES.window.fixed, 'the window is a classroom item and part of the room');
  ok(Object.keys(AREA_COLOURS).join() === 'mint,sky,cyan,sunny,coral' && newRoomItem('area', mkUid()).color === 'mint', 'areas pick from mint, sky, cyan, sunny and coral (mint to start)');
  const ln = lineItemFromPoints([100, 100], [300, 100], mkUid());
  ok(ln.type === 'line' && ln.w === 200 && ln.rot === 0 && near(itemCentre(itemGeom(ln))[0], 200) && near(itemCentre(itemGeom(ln))[1], 100), 'a line from two points is a thin item as long as the drag, centred on it');
  const dg = lineItemFromPoints([100, 100], [200, 200], mkUid());
  ok(near(dg.rot, 45) && near(dg.w, 141), 'a diagonal drag gives a turned line');
  const wall = { id: 'w', x1: 0, y1: 100, x2: 400, y2: 100 };
  const win = { id: 'x', type: 'window', x: 150, y: 85, w: 160, h: 24, rot: 20 };
  const sn = snapItemToWall(win, [wall]);
  ok(sn && sn.rot === 0 && near(itemCentre(itemGeom(sn))[1], 100) && near(itemCentre(itemGeom(sn))[0], 230), 'a window dropped on a wall lies along it, centred on it');
  ok(snapItemToWall({ ...win, y: 300 }, [wall]) === null, 'but not when it is far from any wall');
  const vwin = snapItemToWall({ id: 'y', type: 'window', x: 330, y: 140, w: 160, h: 24, rot: 0 }, [{ id: 'v', x1: 400, y1: 0, x2: 400, y2: 400 }]);
  ok(vwin && vwin.rot === 90 && near(itemCentre(itemGeom(vwin))[0], 400), 'on an upright wall it turns upright');
  const desk = { id: 'd', type: 'desk', x: 60, y: 60 };
  ok(itemGeom(desk).w === 114 && itemGeom({ ...desk, w: 200, h: 72 }).w === 200, 'the teacher\'s desk keeps 114×52 until resized, then uses its own size');
}

console.log(`\n${passes} passed, ${failures} failed.`);
process.exit(failures ? 1 : 0);
