#!/usr/bin/env node
/**
 * Smoke tests for ClassPanels (plain node, exit code 0 = all passed).
 *
 *   node tests/run.js            builds index.html, opens it in Chromium
 *   SHOT_DIR=/some/dir node ...  where screenshots go (default /tmp/cp-shots)
 *
 * Needs Playwright (`require('playwright')`) and its Chromium. It uses only the
 * fake-named fixture in tests/fixtures — never real student data.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) {
  // global installs aren't on the default resolve path everywhere
  try { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
  catch (e2) { console.error('Playwright is not installed.'); process.exit(1); }
}

const ROOT = path.join(__dirname, '..');
const SHOT_DIR = process.env.SHOT_DIR || '/tmp/cp-shots';
const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'sample-data.json'), 'utf8'));
/* Served over a tiny local web server, not file://: headless Chromium gives file:// pages
   a storage area that is wiped on every reload, which made the reload/restore checks
   pass or fail by luck. Over http, saved data survives reloads like it does in the app. */
const http = require('http');
let URL = '';
function startServer() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(ROOT, 'index.html')));
    });
    srv.listen(0, '127.0.0.1', () => { URL = `http://127.0.0.1:${srv.address().port}/index.html`; resolve(srv); });
  });
}

let failures = 0, passes = 0;
const ok = (cond, msg) => {
  if (cond) { passes++; console.log('  ok   ' + msg); }
  else { failures++; console.log('  FAIL ' + msg); }
};

/* Everything in classboard-storage, as {key: jsonString} */
const readStore = page => page.evaluate(() => JSON.parse(localStorage.getItem('classboard-storage') || '{}'));
const readBackups = page => page.evaluate(() => JSON.parse(localStorage.getItem('classpanels-auto-backups') || '[]'));
const shot = (page, name) => page.screenshot({ path: path.join(SHOT_DIR, name + '.png') });

/* The seat -> student map of every class, to prove nothing moved */
function seatMap(store) {
  const out = {};
  for (const k of Object.keys(store).filter(k => k.startsWith('sl-'))) {
    out[k] = JSON.parse(store[k]).seats.map(s => `${s.id}=${s.studentId || ''}/${s.locked ? 'L' : ''}`).join(',');
  }
  return out;
}
const studentMap = store => JSON.parse(store['ta-classes']).map(c => `${c.id}:${c.students.map(s => s.id + '=' + s.name).join('|')}`);

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });

  console.log('Geometry unit tests (tests/geometry.test.js)');
  let geomOut = '', geomOk = true;
  try { geomOut = execSync('node ' + JSON.stringify(path.join(__dirname, 'geometry.test.js')), { cwd: ROOT }).toString(); }
  catch (e) { geomOk = false; geomOut = (e.stdout || '').toString(); }
  const geomSummary = (geomOut.match(/(\d+) passed, (\d+) failed/) || [])[0] || 'no summary';
  ok(geomOk, `table geometry: ${geomSummary}` + (geomOk ? '' : '\n' + geomOut.split('\n').filter(l => l.includes('FAIL')).join('\n')));

  console.log('Building…');
  const buildOut = execSync('node build.js 2>&1', { cwd: ROOT }).toString();
  // one duplicate-key warning in the Seating view is known and left alone
  const warnings = (buildOut.match(/\[WARNING\]/g) || []).length;
  ok(warnings <= 1, `build has no new warnings (${warnings} known)`);

  const server = await startServer();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  const problems = [];
  // Seed the saved data before the app script runs, but only on a brand-new profile (so reloads keep their data)
  await ctx.addInitScript(fixture => {
    try { if (localStorage.getItem('classboard-storage') === null) localStorage.setItem('classboard-storage', JSON.stringify(fixture)); } catch (e) {}
  }, FIXTURE.data);
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', e => problems.push('pageerror: ' + e.message));
  page.on('dialog', d => d.dismiss());

  const TAB = {
    timer: '[title^="Quick countdown timers"]:visible',
    seating: '[title="See and adjust who\'s sitting where right now."]:visible',
    groups: '[title^="Randomly build student groups"]:visible',
    checklist: '[title^="A grid of work and tasks"]:visible',
  };
  const manageMenu = '[title="Manage seating & groups"]';

  await page.goto(URL);
  await page.waitForTimeout(800);
  const classA = JSON.parse(FIXTURE.data['ta-classes'])[0];

  console.log('Launch');
  await shot(page, '01-launch-timer');

  console.log('Tabs');
  await page.locator(TAB.seating).click(); await page.waitForTimeout(600);
  ok(await page.getByText(classA.name).first().isVisible(), `Seating shows the class name "${classA.name}"`);
  ok(await page.getByText('Ava Test').first().isVisible(), 'Seating shows student "Ava Test"');
  await shot(page, '02-seating');
  await page.locator(TAB.groups).click(); await page.waitForTimeout(600);
  await shot(page, '03-groups');
  await page.locator(TAB.checklist).click(); await page.waitForTimeout(600);
  ok(await page.getByText('Lab report').first().isVisible(), 'Checklist shows the "Lab report" column');
  await shot(page, '04-checklist');
  await page.locator(TAB.timer).click(); await page.waitForTimeout(400);
  await shot(page, '05-timer');

  console.log('Manage panels');
  await page.locator(manageMenu).click();
  await page.getByText('Manage Seating').click(); await page.waitForTimeout(800);
  ok(await page.getByText('Ava Test').first().isVisible(), 'Manage Seating shows student "Ava Test"');
  await shot(page, '06-manage-seating');
  // drawing kit: hatch patterns exist, every seat has its drag strip, nothing is an image
  ok(await page.locator('pattern#cp-hatch').count() >= 1, 'the pencil-hatch pattern is drawn once on the canvas');
  ok(await page.locator('[title="Drag to move this desk"]').count() === 24, 'all 24 fixture seats are drawn (and draggable)');
  ok(await page.locator('[title="Select or drag the whole group"]').count() === 6, 'all 6 group tabs are drawn');
  // chairs are drawn first, so every table top covers them and only their backs show (a floor plan)
  const paint = await page.locator('[data-cp]').evaluateAll(els => els.map(e => e.getAttribute('data-cp')));
  const lastChair = paint.lastIndexOf('chair'), firstTable = paint.indexOf('table');
  ok(paint.filter(k => k === 'chair').length >= 20 && lastChair >= 0 && firstTable > lastChair,
    `old seats: every chair is drawn beneath the tables (${paint.filter(k => k === 'chair').length} chairs, all before the first table top)`);
  const chairBox = await page.locator('[data-cp="chair"]').first().boundingBox();
  ok(chairBox && chairBox.width > 0, 'the chairs are really on screen');
  await page.locator(manageMenu).click();
  await page.getByText('Manage Groups').click(); await page.waitForTimeout(800);
  await shot(page, '07-manage-groups');
  // back to the normal tabs
  await page.locator(TAB.seating).click(); await page.waitForTimeout(400);

  console.log('Old data still loads');
  const store = await readStore(page);
  const missing = Object.keys(FIXTURE.data).filter(k => !(k in store));
  ok(missing.length === 0, `all ${Object.keys(FIXTURE.data).length} fixture keys are still saved` + (missing.length ? ` (missing: ${missing.join(', ')})` : ''));
  ok(JSON.stringify(studentMap(store)) === JSON.stringify(studentMap(FIXTURE.data)), 'students are unchanged');
  ok(JSON.stringify(seatMap(store)) === JSON.stringify(seatMap(FIXTURE.data)), 'seat assignments and locks are unchanged');
  const slKeys = Object.keys(FIXTURE.data).filter(k => k.startsWith('sl-'));
  ok(slKeys.every(k => !('pieces' in JSON.parse(store[k])) && !('joins' in JSON.parse(store[k])) && JSON.parse(store[k]).seats.every(s => !s.pieceId)),
    'old rooms are left as plain seats (no table pieces added on their own)');
  ok(slKeys.every(k => !('walls' in JSON.parse(store[k])) && !('openings' in JSON.parse(store[k])) && !('room' in JSON.parse(store[k]))) && !('ta-rooms' in store),
    'old rooms have no walls, openings or room link, and there is no room library yet');
  const sameRules = Object.keys(FIXTURE.data).filter(k => /^(sh|gg|gp|checklist)-|^ta-saved-layouts$|^saved-templates$/.test(k)).filter(k => store[k] !== FIXTURE.data[k]);
  ok(sameRules.length === 0, 'history, groups, checklists, saved layouts and timer templates are byte-for-byte unchanged' + (sameRules.length ? ` (changed: ${sameRules.join(', ')})` : ''));

  console.log('Automatic backup');
  let backups = await readBackups(page);
  ok(backups.length >= 1, 'a backup was made at launch');
  const b0 = backups[0]; // newest first
  ok(b0 && b0.app === 'ClassPanels' && b0.format === 1 && b0.reason === 'launch' && !!b0.exportedAt, 'backup has the export shape plus a reason');
  ok(b0 && Object.keys(FIXTURE.data).every(k => k in b0.data), 'backup holds every fixture key');
  ok(!('classpanels-auto-backups' in store), 'backups live outside classboard-storage');
  await page.reload(); await page.waitForTimeout(800);
  ok((await readBackups(page)).length === backups.length, 'a second launch on the same day does not make another');

  console.log('Restore round-trip');
  // change the data, then restore the launch backup from Settings
  await page.evaluate(async () => {
    await window.storage.set('ta-theme', JSON.stringify('blackboard'));
    await window.storage.delete('gg-fx-6a');
  });
  await page.locator('[title^="Settings"]').click(); await page.waitForTimeout(300);
  ok(await page.getByText('Automatic backups').isVisible(), 'Settings lists Automatic backups');
  ok(await page.getByText('Documents').first().isVisible(), 'Settings says where the backup files are');
  await shot(page, '08-settings-backups');
  await page.getByRole('button', { name: 'Restore' }).first().click(); await page.waitForTimeout(300);
  ok(await page.getByText(/Replace everything on this computer/).isVisible(), 'restore asks for confirmation first');
  await shot(page, '09-restore-confirm');
  await Promise.all([page.waitForNavigation(), page.getByRole('button', { name: 'Replace', exact: true }).click()]);
  await page.waitForTimeout(800);
  const after = await readStore(page);
  const diff = Object.keys(FIXTURE.data).filter(k => after[k] !== FIXTURE.data[k]);
  ok(diff.length === 0, 'after restoring, every key matches the original' + (diff.length ? ` (differs: ${diff.join(', ')})` : ''));
  const safety = await page.evaluate(() => localStorage.getItem('classboard-storage-before-import'));
  ok(!!safety && safety.includes('blackboard'), 'the usual recovery copy of the replaced data was kept');
  ok((await readBackups(page)).some(b => b.reason === 'before restore'), 'a "before restore" backup was made too');
  await shot(page, '10-after-restore');

  console.log('Backups are capped at 10');
  // 12 old backups from earlier days, then a new day's launch: the oldest must drop off
  await page.evaluate(() => {
    const old = Array.from({ length: 12 }, (_, i) => ({ app: 'ClassPanels', format: 1, exportedAt: new Date(Date.now() - (i + 2) * 86400000).toISOString(), reason: 'old ' + i, data: { x: '1' } }));
    localStorage.setItem('classpanels-auto-backups', JSON.stringify(old));
  });
  await page.reload(); await page.waitForTimeout(800);
  backups = await readBackups(page);
  ok(backups.length === 10, `only the newest 10 are kept (${backups.length})`);
  ok(backups[0].reason === 'launch' && backups[0].data['ta-classes'] === FIXTURE.data['ta-classes'], "the newest one is today's launch backup of the real data");

  /* ── Table pieces (Phase 3): shapes that rotate, snap and join ── */
  console.log('Table pieces');
  const SL = async cls => JSON.parse((await readStore(page))[`sl-${cls}`]);
  const openManage = async className => {
    await page.getByText(className).first().click(); await page.waitForTimeout(300);
    if (await page.locator('[title="Add a new desk or table to the room"]').count()) return; // already open (the menu item toggles it)
    await page.locator(manageMenu).click();
    await page.getByText('Manage Seating').click(); await page.waitForTimeout(800);
  };
  // waits past the editor's 400 ms save delay, so storage reads see the change
  const addFromMenu = async title => {
    await page.locator('[title="Add a new desk or table to the room"]').click(); await page.waitForTimeout(250);
    await page.locator(`[title^="Add: ${title}"]`).first().click(); await page.waitForTimeout(650);
  };
  const hits = () => page.locator('polygon[title^="Drag to move this table"]');
  const pieceSeatMap = sl => (sl.seats || []).filter(s => s.pieceId).map(s => `${s.pieceId}:${s.slot}=${s.studentId || ''}`).sort().join(',');
  const deselect = async () => { await page.mouse.click(1205, 66); await page.waitForTimeout(200); }; // an empty corner of the floor (not the zoom control)

  await openManage('Grade 7B Test');
  await page.locator('[title="Add a new desk or table to the room"]').click(); await page.waitForTimeout(300);
  ok(await page.locator('[title^="Add: Hexagon"]').count() === 1 && await page.locator('[title^="Add: Long table of 8"]').count() === 1 && await page.locator('[title^="Add: Horseshoe"]').count() === 1,
    'the Add table menu offers Hexagon, Long table of 8 and Horseshoe');
  ok(await page.locator('[title^="Add: Trapezoid"]').count() === 1 && await page.locator('[title^="Add: Lab bench"]').count() === 1,
    'it shows each shape');
  ok(!(await page.getByText('Simple seats').count()) && await page.locator('[title^="Add a table of"], [title="Add one ungrouped seat"]').count() === 0,
    'the Add table menu no longer has "Simple seats" (Ready-made replaces them)');
  await shot(page, '20-add-table-menu');
  await page.locator('[title^="Add: Hexagon"]').click(); await page.waitForTimeout(700);
  let sl7 = await SL('fx-7b');
  let hexSeats = sl7.seats.filter(s => s.pieceId);
  ok(sl7.pieces?.length === 2 && sl7.joins?.length === 1 && hexSeats.length === 6, `a hexagon is 2 joined trapezoids with 6 seats (${sl7.pieces?.length} pieces, ${sl7.joins?.length} join, ${hexSeats.length} seats)`);
  ok(sl7.seats.length === 21 + 6 && sl7.seats.filter(s => !s.pieceId).length === 21, 'the 21 plain seats are still there');
  ok(sl7.groups.filter(g => g.seatIds.some(id => hexSeats.some(s => s.id === id))).length === 1, 'the hexagon is one table group');
  // clear the old desks away (rubber-band them, Delete) so Randomize has to use the new table:
  // it fills seats in list order, so with spare seats the newest ones would stay empty
  await page.locator('[title="Undo the last change"]').click(); await page.waitForTimeout(500);
  const firstDesk = await page.locator('[title="Drag to move this desk"]').first().boundingBox(); // the desk at canvas 60,60
  const org = [firstDesk.x - 60, firstDesk.y - 60];
  await page.mouse.move(org[0] + 20, org[1] + 45); await page.mouse.down();
  await page.mouse.move(org[0] + 500, org[1] + 400, { steps: 5 }); await page.mouse.move(org[0] + 1000, org[1] + 600, { steps: 5 }); await page.mouse.up();
  await page.waitForTimeout(200);
  await page.keyboard.press('Delete'); await page.waitForTimeout(700);
  sl7 = await SL('fx-7b');
  ok(sl7.seats.length === 0 && sl7.roomItems.length === 2, 'the old desks can be cleared away (the board and door stay)');
  await addFromMenu('Hexagon');
  sl7 = await SL('fx-7b');
  hexSeats = sl7.seats.filter(s => s.pieceId);
  await page.getByText('🎲 Randomize').click(); await page.waitForTimeout(700);
  sl7 = await SL('fx-7b');
  ok(hexSeats.length === 6 && sl7.seats.filter(s => s.pieceId && s.studentId).length === 6, 'Randomize fills the hexagon');
  // pick the hexagon and turn it a quarter turn
  await hits().first().scrollIntoViewIfNeeded();
  await hits().first().click({ force: true }); await page.waitForTimeout(250);
  ok(await page.locator('[title^="Drag to rotate this table"]').count() === 1, 'picking a table shows its rotate handle');
  await shot(page, '21-hexagon-selected');
  await page.locator('[title="Turn a quarter turn clockwise"]').click(); await page.waitForTimeout(700);
  sl7 = await SL('fx-7b');
  ok(sl7.pieces.map(p => p.rot).sort((a, b) => a - b).join(',') === '90,270', `⟳ 90° turns the whole hexagon (${sl7.pieces.map(p => p.rot).join(',')})`);
  const beforeReload = pieceSeatMap(sl7), piecesBefore = JSON.stringify(sl7.pieces), joinsBefore = JSON.stringify(sl7.joins);
  ok(sl7.seats.filter(s => s.pieceId && s.studentId).length > 0, 'students are sitting at the hexagon');
  await page.reload(); await page.waitForTimeout(800);
  sl7 = await SL('fx-7b');
  ok(JSON.stringify(sl7.pieces) === piecesBefore && JSON.stringify(sl7.joins) === joinsBefore, 'after a reload, the pieces and joins are exactly as saved');
  ok(pieceSeatMap(sl7) === beforeReload, 'after a reload, everyone is still in the same hexagon seat');
  await openManage('Grade 7B Test');
  ok(await hits().count() === 2, 'Manage Seating draws the two pieces again after the reload');
  const hexName = (JSON.parse(FIXTURE.data['ta-classes'])[1].students.find(s => s.id === sl7.seats.find(x => x.pieceId && x.studentId).studentId) || {}).name;
  ok(!!hexName && await page.getByText(hexName, { exact: true }).first().isVisible(), `and shows who sits there ("${hexName}")`);

  // drag one trapezoid onto another: it snaps, shows a join line, and they become one table
  await deselect();
  await addFromMenu('Trapezoid');
  await addFromMenu('Trapezoid');
  await page.keyboard.press(']'); await page.keyboard.press(']');
  for (let i = 0; i < 10; i++) await page.keyboard.press(']'); // 12 × 15° = 180°: upside down
  await page.waitForTimeout(500);
  sl7 = await SL('fx-7b');
  const [tA, tB] = sl7.pieces.slice(-2);
  ok(tA.shape === 'trap' && tB.shape === 'trap' && tB.rot === 180, `[ and ] turn the picked table in 15° steps (${tB.rot}°)`);
  await hits().nth(3).scrollIntoViewIfNeeded();
  const bA = await hits().nth(2).boundingBox(), bB = await hits().nth(3).boundingBox();
  const from = [bB.x + bB.width / 2, bB.y + bB.height / 2], to = [bA.x + bA.width / 2 + 8, bA.y + bA.height / 2 + 78 + 9];
  await page.mouse.move(...from); await page.mouse.down();
  for (let k = 1; k <= 12; k++) { await page.mouse.move(from[0] + (to[0] - from[0]) * k / 12, from[1] + (to[1] - from[1]) * k / 12); await page.waitForTimeout(15); }
  await page.waitForTimeout(250);
  ok(await page.locator('line').evaluateAll(ls => ls.some(l => (l.getAttribute('style') || '').includes('--cp-join'))), 'while dragging close, a join line shows where it will snap');
  await shot(page, '22-snap-preview');
  await page.mouse.up(); await page.waitForTimeout(700);
  sl7 = await SL('fx-7b');
  const nB = sl7.pieces.find(p => p.id === tB.id), nA = sl7.pieces.find(p => p.id === tA.id);
  ok(sl7.joins.length === 2 && sl7.joins.some(j => [j.a, j.b].sort().join() === [tA.id, tB.id].sort().join()), 'letting go joins them');
  ok(Math.abs(nB.x - nA.x) < 0.05 && Math.abs(nB.y - nA.y - 77.94) < 0.05, `the second sits exactly under the first, long base to long base (${(nB.x - nA.x).toFixed(2)}, ${(nB.y - nA.y).toFixed(2)})`);
  ok(sl7.seats.filter(s => s.pieceId === tA.id || s.pieceId === tB.id).length === 6, 'and together they seat 6 (a hexagon)');
  await deselect();
  await shot(page, '23-two-hexagons');

  // the class Seating view draws the same tables, and its Randomise keeps them
  await page.locator(TAB.seating).click(); await page.waitForTimeout(800);
  ok(await page.getByText(hexName, { exact: true }).first().isVisible(), 'the class Seating view shows students at the tables');
  await shot(page, '24-class-seating-view');
  const piecesNow = JSON.stringify(sl7.pieces), joinsNow = JSON.stringify(sl7.joins);
  await page.locator('[title^="Shuffle everyone into new seats"]:visible').first().click(); await page.waitForTimeout(800);
  sl7 = await SL('fx-7b');
  ok(JSON.stringify(sl7.pieces) === piecesNow && JSON.stringify(sl7.joins) === joinsNow, 'Randomise in the class Seating view keeps the pieces and joins');
  ok(sl7.seats.filter(s => s.pieceId).length === 12 && sl7.seats.filter(s => s.studentId).length === 12, 'and fills all 12 table seats');

  // Convert to table, then Undo
  await openManage('Grade 6A Test');
  const sl6Before = await SL('fx-6a');
  await page.locator('[title="Select or drag the whole group"]').first().click(); await page.waitForTimeout(250);
  await page.locator('[title^="Swap these desks for a table shape"]').click(); await page.waitForTimeout(250);
  await shot(page, '25-convert-menu');
  await page.locator('[title^="Make this a long table with 4 seats"]').click(); await page.waitForTimeout(700);
  let sl6 = await SL('fx-6a');
  const g1 = ['a1', 'a2', 'a3', 'a4'];
  const longSeats = sl6.seats.filter(s => s.pieceId);
  const inReading = [...longSeats].sort((a, b) => (a.y - b.y) || (a.x - b.x)).map(s => s.studentId);
  ok(sl6.pieces?.length === 1 && sl6.pieces[0].shape === 'long4' && longSeats.length === 4, 'Convert to table swaps group 1 for a long table of 4');
  ok(JSON.stringify(inReading) === JSON.stringify(g1), `everyone moves across in the same reading order (${inReading.join(',')})`);
  ok(longSeats.find(s => s.studentId === 'a1')?.locked === true && longSeats.find(s => s.studentId === 'a1')?.tags.includes('LS'), "Ava's lock and the LS seat tag come along");
  ok(sl6.groups.find(g => g.seatIds.includes(longSeats[0].id))?.label === '1', 'the new table keeps the group name "1"');
  ok(sl6.seats.length === 24 && !sl6.seats.some(s => ['fx-6a-s1', 'fx-6a-s2', 'fx-6a-s3', 'fx-6a-s4'].includes(s.id)), 'the 4 old seats are replaced, the other 20 untouched');
  await shot(page, '26-converted');
  await page.locator('[title="Undo the last change"]').click(); await page.waitForTimeout(500);
  sl6 = await SL('fx-6a');
  ok(!('pieces' in sl6) && JSON.stringify(sl6.seats) === JSON.stringify(sl6Before.seats) && JSON.stringify(sl6.groups) === JSON.stringify(sl6Before.groups), 'one Undo puts the old desks and seating back exactly');

  // a quick tour of the other ready-made tables, for the screenshots
  await openManage('Grade 7B Test');
  await deselect();
  await addFromMenu('Long table of 8');
  await addFromMenu('Horseshoe');
  sl7 = await SL('fx-7b');
  ok(sl7.pieces.length === 9 && sl7.seats.filter(s => s.pieceId).length === 12 + 8 + 9, `a long table of 8 and a horseshoe of 9 add ${8 + 9} seats`);
  await addFromMenu('Trapezoid');
  for (let i = 0; i < 2; i++) await page.keyboard.press(']');
  await addFromMenu('Trapezoid');
  await page.keyboard.press('[');
  await deselect();
  for (let i = 0; i < 3; i++) await page.locator('[title="Zoom out"]:visible').first().click();
  await page.waitForTimeout(300);
  await shot(page, '27-room-of-tables');
  await page.locator('[title="Reset zoom"]:visible').first().click();

  // lab benches have standing spots, not chairs; "Use for" decides which a table shows
  const marks = async () => ({ chairs: await page.locator('[data-cp="chair"]').count(), spots: await page.locator('[data-cp="spot"]').count() });
  await deselect();
  let m0 = await marks();
  await addFromMenu('Lab bench');
  let m1 = await marks();
  sl7 = await SL('fx-7b');
  ok(m1.spots - m0.spots === 4 && m1.chairs === m0.chairs, `a lab bench draws 4 standing spots and no chairs (+${m1.spots - m0.spots} spots, +${m1.chairs - m0.chairs} chairs)`);
  ok(sl7.pieces.at(-1).shape === 'bench' && sl7.seats.filter(s => s.pieceId === sl7.pieces.at(-1).id).length === 4, 'its 4 places are still ordinary seats that hold students');
  ok(await page.getByText('✎ Edit places…').count() === 1, 'its selection bar says "places", not "seats"');
  await shot(page, '30-lab-bench');
  await deselect();
  m0 = await marks();
  await addFromMenu('Long table');
  m1 = await marks();
  ok(m1.chairs - m0.chairs === 4 && m1.spots === m0.spots, `a long table draws chairs (+${m1.chairs - m0.chairs})`);
  const seatsBefore = (await SL('fx-7b')).seats.map(x => x.id).join();
  await page.getByRole('button', { name: 'Workstation', exact: true }).click(); await page.waitForTimeout(650);
  let m2 = await marks();
  ok(m2.spots - m1.spots === 4 && m2.chairs === m0.chairs, `switched to Workstation it shows standing spots instead (+${m2.spots - m1.spots} spots, ${m2.chairs - m1.chairs} chairs)`);
  ok((await SL('fx-7b')).seats.map(x => x.id).join() === seatsBefore, 'the seats are exactly the same (it is a drawing change only)');
  await shot(page, '31-long-table-as-workstation');
  await page.locator('[title^="An everyday table"]').click(); await page.waitForTimeout(650);
  let m3 = await marks();
  ok(m3.chairs === m1.chairs && m3.spots === m1.spots, 'and back to Table it shows chairs again');
  await page.locator('[title^="Counts as both"]').click(); await page.waitForTimeout(650);
  let m4 = await marks();
  ok(m4.chairs === m1.chairs && m4.spots === m1.spots, '"Both" keeps the chairs');
  await deselect();

  // blackboard theme
  await page.evaluate(async () => { await window.storage.set('ta-theme', JSON.stringify('blackboard')); });
  await page.reload(); await page.waitForTimeout(800);
  await page.getByText('Grade 7B Test').first().click(); await page.waitForTimeout(300);
  await page.locator(TAB.seating).click(); await page.waitForTimeout(800);
  await shot(page, '28-blackboard-seating');
  await openManage('Grade 7B Test');
  await shot(page, '29-blackboard-manage');


  /* ── Room builder (Phase 4): walls, doors, windows, items, labels, stations, the room library ── */
  console.log('Room builder');
  const { lab } = require('./fixtures/lab-layout.js');
  const roomsStore = async () => { const s = await readStore(page); return s['ta-rooms'] ? JSON.parse(s['ta-rooms']) : null; };
  const shellOf = sl => JSON.stringify([sl.walls || [], sl.openings || [], (sl.roomItems || []).filter(i => i.fixed)]);
  const wait = ms => page.waitForTimeout(ms);
  // canvas px -> screen px, taken from the first desk (always drawn at canvas 60,60 in the fixture) so it works at any zoom
  const mapper = async () => { const b = await page.locator('[title="Drag to move this desk"]').first().boundingBox(); const z = b.width / 114; return (cx, cy) => [b.x + (cx - 60) * z, b.y + (cy - 60) * z]; };
  const dragMouse = async (from, to, steps = 10) => {
    await page.mouse.move(...from); await page.mouse.down();
    for (let k = 1; k <= steps; k++) { await page.mouse.move(from[0] + (to[0] - from[0]) * k / steps, from[1] + (to[1] - from[1]) * k / steps); await wait(12); }
    await page.mouse.up(); await wait(650);
  };
  await page.evaluate(async () => { await window.storage.set('ta-theme', JSON.stringify('whiteboard')); });
  await page.reload(); await wait(800);
  await openManage('Grade 6A Test');
  const storeBefore = await readStore(page);
  ok(!('ta-rooms' in storeBefore), 'no room library exists until Tom saves a room');
  const slAFx = JSON.parse(FIXTURE.data['sl-fx-6a']);
  const items6Before = JSON.stringify((await SL('fx-6a')).roomItems);
  ok(items6Before === JSON.stringify(slAFx.roomItems), 'the original desk, board and door are untouched');

  // the Rooms popover lists the old saved layouts under "My saved layouts" before anything is saved
  await page.locator('[title^="Rooms: save this room"]').click(); await wait(300);
  ok(await page.getByText('My saved layouts').isVisible() && await page.getByText('Test clusters').isVisible(), 'Rooms shows the old saved layouts under "My saved layouts"');
  ok(await page.getByText('Save as new room…').isVisible(), 'Rooms offers "Save as new room…"');
  await page.keyboard.press('Escape'); await page.mouse.click(700, 880); await wait(200);

  // Edit room: tables dimmed and can't be picked; draw a rectangle room plus one more wall
  await page.locator('[title^="Edit room"]').click(); await wait(300);
  const deskBlocked = await page.locator('[title="Drag to move this desk"]').first().click({ trial: true, timeout: 600 }).then(() => false, () => true);
  ok(deskBlocked, 'in Edit room the tables are dimmed and can\'t be clicked');
  await page.locator('[title^="Draw four walls"]').click(); await wait(700);
  let slA = await SL('fx-6a');
  ok(slA.walls?.length === 4 && slA.walls.every(w => w.x1 % 8 === 0 && w.y1 % 8 === 0), `Rectangle room draws 4 walls on the grid (${slA.walls?.length})`);
  let m = await mapper();
  await dragMouse(m(120, 470), m(405, 479)); // a nearly straight drag: it snaps to 0° and the grid
  slA = await SL('fx-6a');
  const extra = slA.walls?.[4];
  ok(slA.walls?.length === 5 && extra && extra.y1 === extra.y2 && extra.x1 % 8 === 0, `dragging on the floor draws a wall that snaps straight (${JSON.stringify(extra)})`);
  ok(await page.locator('[title^="Click to select this wall"]').count() === 5, 'in Edit room every wall can be picked');
  // click the top wall: it is selected
  const topHit = page.locator('[title^="Click to select this wall"]').first();
  const tb = await topHit.boundingBox();
  await page.mouse.click(tb.x + tb.width * 0.7, tb.y + tb.height / 2); await wait(250);
  ok(await page.getByText('Delete wall').isVisible(), 'clicking a wall selects it (Delete wall appears)');
  await shot(page, '41-room-mode-wall-selected');

  // a door dragged from the palette sticks to the wall; dragging it slides it along
  const pal = await page.locator('[title^="Door: drag it onto a wall"]').boundingBox();
  const wallMid = [tb.x + tb.width * 0.3, tb.y + tb.height / 2 + 14]; // a little off the wall: it still lands on it
  await dragMouse([pal.x + pal.width / 2, pal.y + pal.height / 2], wallMid);
  slA = await SL('fx-6a');
  const door1 = slA.openings?.[0];
  ok(slA.openings?.length === 1 && door1.type === 'door' && door1.wallId === slA.walls[0].id && Math.abs(door1.t - 0.3) < 0.05, `a door dropped on the top wall sticks to it at that spot (t=${door1?.t})`);
  const dh = await page.locator('rect[title^="Door —"]').boundingBox();
  await dragMouse([dh.x + dh.width / 2, dh.y + dh.height / 2], [dh.x + dh.width / 2 + 200, dh.y + dh.height / 2 + 6]);
  slA = await SL('fx-6a');
  const door2 = slA.openings[0];
  ok(door2.wallId === door1.wallId && door2.t > door1.t + 0.1 && door2.t <= 1, `dragging the door slides it along the wall (t ${door1.t} -> ${door2.t})`);
  await page.locator('[title^="Window: drag it onto a wall"]').click(); await wait(650); // a click puts a window on the selected/longest wall
  slA = await SL('fx-6a');
  ok(slA.openings.length === 2 && slA.openings[1].type === 'window', 'clicking Window puts one on a wall too');
  await page.locator('rect[title^="Door —"]').click(); await wait(200);
  await page.locator('[title="Move the hinge to the other end of the door"]').click(); await wait(650);
  await page.locator('[title="Make the door open to the other side of the wall"]').click(); await wait(650);
  slA = await SL('fx-6a');
  ok(slA.openings[0].flip === true && slA.openings[0].swing === -1, 'a door can be flipped and its swing changed');
  await page.locator('[title="Finish editing the room"]').click(); await wait(300);
  ok(await page.locator('[title^="Click to select this wall"]').count() === 0 && await page.locator('rect[title^="Door —"]').count() === 0, 'outside Edit room, walls and openings can\'t be picked or dragged');
  const wallsBefore = JSON.stringify(slA.walls), opsBefore = JSON.stringify(slA.openings);
  await page.reload(); await wait(800);
  slA = await SL('fx-6a');
  ok(JSON.stringify(slA.walls) === wallsBefore && JSON.stringify(slA.openings) === opsBefore, 'after a reload the walls, the door (still on its wall) and the window are as saved');
  await openManage('Grade 6A Test');
  ok(await page.locator('line[style*="--cp-wall)"]').count() === 5, 'and Manage Seating draws all 5 walls again');
  await shot(page, '40-room-with-walls');

  // the catalogue: five items, two labelled, one resized, one turned
  await page.locator('[title^="Add a classroom or science-lab item"]').click(); await wait(300);
  ok(await page.getByText('Fire extinguisher', { exact: true }).count() >= 1 && await page.locator('[title^="Add item: Fume cupboard"]').count() === 1 && await page.locator('[title^="Add item: a lab bench"]').count() === 1, 'the catalogue lists classroom and lab items, and a "Lab bench (seats)" shortcut');
  await page.getByPlaceholder('Search: sink, eyewash, bin…').fill('eyewash'); await wait(150);
  ok(await page.locator('[title^="Add item:"]').count() === 1, 'searching "eyewash" narrows it to the eyewash station');
  await page.getByPlaceholder('Search: sink, eyewash, bin…').fill(''); await wait(150);
  await shot(page, '30-catalogue');
  const addItem = async title => {
    if (!(await page.locator('[title^="Add item:"]').count())) { await page.locator('[title^="Add a classroom or science-lab item"]').click(); await wait(250); }
    await page.locator(`[title^="Add item: ${title}"]`).first().click(); await wait(650);
  };
  const labelInput = '[title^="The name shown on the map"]';
  await page.keyboard.press('Escape'); await page.mouse.click(700, 880);
  await addItem('Sink');
  await page.locator(labelInput).fill('Sink A'); await page.locator(labelInput).press('Enter'); await wait(650);
  await addItem('Eyewash station');
  await page.locator(labelInput).fill('Eyewash 1'); await page.locator(labelInput).press('Enter'); await wait(650);
  await page.locator('[title^="Mark this as a station"]').click(); await wait(650); // station 1
  await addItem('Fume cupboard');
  const handle = page.locator('[title="Drag to resize"]').nth(0); // a small item has 4 corner handles, the first is bottom-right
  const hb = await handle.boundingBox();
  await dragMouse([hb.x + hb.width / 2, hb.y + hb.height / 2], [hb.x + hb.width / 2 + 40, hb.y + hb.height / 2 + 24]);
  await addItem('Bin');
  await page.locator('[title="Turn a quarter turn clockwise"]').click(); await wait(650);
  await addItem('Box');
  let sl6i = await SL('fx-6a');
  const added = sl6i.roomItems.slice(3);
  const byType = t => added.find(i => i.type === t);
  ok(added.length === 5, `five catalogue items were added (${added.map(i => i.type).join(', ')})`);
  ok(byType('sink')?.label === 'Sink A' && byType('eyewash')?.label === 'Eyewash 1', 'two of them have the labels typed in the selection panel');
  ok(byType('fume')?.w === 128 && byType('fume')?.h === 72, `one was resized with its handle (${byType('fume')?.w}×${byType('fume')?.h})`);
  ok(byType('bin')?.rot === 90, 'one was turned 90°');
  ok(byType('sink')?.fixed === true && byType('bin')?.fixed === false, 'sinks start as fixed parts of the room, bins don\'t');
  // a lab bench with seats, and a station flag on it
  await page.locator('[title^="Add a classroom or science-lab item"]').click(); await wait(250);
  await page.locator('[title^="Add item: a lab bench"]').click(); await wait(700);
  await page.locator('[title^="Mark this as a station"]').click(); await wait(650);
  sl6i = await SL('fx-6a');
  const bench = sl6i.pieces?.[0], eyeItem = sl6i.roomItems.find(i => i.type === 'eyewash');
  ok(bench?.shape === 'bench' && sl6i.seats.filter(s => s.pieceId === bench.id).length === 4, 'the Lab bench shortcut adds a bench piece with 4 seats');
  ok(eyeItem.station?.n === 1 && bench.station?.n === 2, 'the eyewash and the bench are marked as stations 1 and 2');
  ok(await page.locator('[title^="Station 1"]').count() === 1 && await page.locator('[title^="Station 2"]').count() === 1, 'both show a numbered badge on the map');
  await deselect();
  await shot(page, '31-items-on-map');
  const itemsAll = JSON.stringify(sl6i.roomItems), piecesAll = JSON.stringify(sl6i.pieces);
  await page.reload(); await wait(800);
  sl6i = await SL('fx-6a');
  ok(JSON.stringify(sl6i.roomItems) === itemsAll && JSON.stringify(sl6i.pieces) === piecesAll, 'after a reload every item (label, size, turn, station) and the bench are as saved');
  await openManage('Grade 6A Test');
  ok(await page.getByText('Sink A', { exact: true }).first().isVisible() && await page.getByText('Eyewash 1', { exact: true }).first().isVisible(), 'the labels show on the map');
  ok(await page.locator('[title^="Station 1"]').count() === 1 && await page.locator('[title^="Station 2"]').count() === 1, 'and so do both station badges');

  // the room library: save as "Lab 204", add a second layout, switch between them
  const slBefore = await SL('fx-6a');
  const seatedCount = sl => sl.seats.filter(s => s.studentId).length;
  const openRooms = async () => { await page.locator('[title^="Rooms: save this room"]').click(); await wait(350); };
  await openRooms();
  await page.getByText('Save as new room…').click(); await wait(150);
  await page.getByPlaceholder('Room name, e.g. Lab 204').fill('Lab 204');
  await page.locator('[title="Save with this name"]').click(); await wait(900);
  let rooms = await roomsStore();
  const lab204 = rooms?.find(r => r.name === 'Lab 204');
  ok(!!lab204 && lab204.shell.walls.length === 5 && lab204.shell.openings.length === 2 && lab204.layouts.length === 1, 'Save as new room stores the shell (5 walls, 2 openings) and one layout');
  ok(lab204.shell.items.map(i => i.type).sort().join() === 'eyewash,fume,sink' && lab204.layouts[0].items.map(i => i.type).sort().join() === 'bin,box,desk,board,door'.split(',').sort().join(), 'fixed items went into the shell, the movable ones into the layout');
  ok(lab204.layouts[0].seats.every(s => !s.studentId) && lab204.layouts[0].pieces.length === 1, 'the layout has the furniture but no students');
  ok(rooms.some(r => r.legacy && r.name === 'My saved layouts' && r.layouts.some(l => l.name === 'Test clusters')), 'the first save also brought the old saved layouts in as "My saved layouts"');
  const afterSaveStore = await readStore(page);
  ok(afterSaveStore['ta-saved-layouts'] === FIXTURE.data['ta-saved-layouts'], 'the old ta-saved-layouts key is left exactly as it was');
  ok((await readBackups(page)).some(b => b.reason === 'before room library'), 'an automatic backup "before room library" was taken first');
  ok((await SL('fx-6a')).room?.roomId === lab204.id, 'the class is now linked to the room');
  await shot(page, '42-rooms-popover');
  await page.mouse.click(700, 880); await wait(200);
  // a second layout: add a hexagon, save it as "Clusters"
  await deselect();
  await addFromMenu('Hexagon');
  await openRooms();
  await page.getByText('Save layout to room', { exact: false }).first().click(); await wait(200);
  await page.getByRole('button', { name: /Lab 204/ }).first().click(); await wait(200);
  await page.getByPlaceholder('New layout name, e.g. Clusters').fill('Clusters');
  await page.locator('[title="Save with this name"]').click(); await wait(900);
  rooms = await roomsStore();
  const lab204b = rooms.find(r => r.name === 'Lab 204');
  ok(lab204b.layouts.length === 2 && lab204b.layouts[1].name === 'Clusters' && lab204b.layouts[1].pieces.length === 3, 'Save layout to room adds a second layout "Clusters" (bench + hexagon)');
  await page.mouse.click(700, 880); await wait(200);
  // switch back to Layout 1: students are reseated, the shell stays as it was
  const beforeSwitch = await SL('fx-6a');
  await openRooms();
  await page.locator(`[title^='Use layout "Layout 1"']`).click(); await wait(250);
  await page.getByRole('button', { name: 'Use it' }).click(); await wait(900);
  const afterSwitch = await SL('fx-6a');
  ok(afterSwitch.pieces.length === 1 && afterSwitch.room.layoutId === lab204b.layouts[0].id, 'using "Layout 1" brings back just the bench (the hexagon is gone)');
  ok(seatedCount(afterSwitch) === seatedCount(beforeSwitch) && seatedCount(beforeSwitch) === 20, `all ${seatedCount(afterSwitch)} students are reseated`);
  ok(shellOf(afterSwitch) === shellOf(beforeSwitch), 'and the walls, openings and fixed items are unchanged');
  await openRooms();
  await page.locator(`[title^='Use layout "Clusters"']`).click(); await wait(250);
  await page.getByRole('button', { name: 'Use it' }).click(); await wait(900);
  const clusters = await SL('fx-6a');
  ok(clusters.pieces.length === 3 && seatedCount(clusters) === 20 && shellOf(clusters) === shellOf(beforeSwitch), 'switching to "Clusters" works the same way');
  await page.locator('[title="Undo the last change"]').click(); await wait(700);
  ok((await SL('fx-6a')).pieces.length === 1, 'and Undo takes a layout switch back');

  // a second class uses the same room; an edit to the shell goes to every class only when Tom says so
  await openManage('Grade 7B Test');
  const bB0 = await SL('fx-7b');
  ok(!bB0.room && !bB0.walls, 'class 7B starts with no room');
  await openRooms();
  await page.locator('[title="Show or hide this room\'s layouts"]').nth(0).click(); await wait(200);
  const useBtn = page.locator('[title^="Use Lab 204:"]');
  await useBtn.click(); await wait(250);
  await page.getByRole('button', { name: 'Use it' }).click(); await wait(900);
  const bB1 = await SL('fx-7b');
  ok(bB1.walls?.length === 5 && bB1.room?.roomId === lab204.id && shellOf(bB1) === shellOf(await SL('fx-6a')), 'class 7B now has the same walls and fixed items, and is linked to the room');
  ok(seatedCount(bB1) === seatedCount(bB0) && seatedCount(bB1) > 0, `7B's students were reseated (${seatedCount(bB1)} of ${seatedCount(bB0)} who were seated)`);
  const furnitureOf = sl => JSON.stringify([sl.seats, sl.groups, sl.pieces, sl.joins, (sl.roomItems || []).filter(i => !i.fixed)]);
  const b1Furniture = furnitureOf(bB1);
  await openManage('Grade 6A Test');
  await page.locator('[title^="Edit room"]').click(); await wait(300);
  m = await mapper();
  await dragMouse(m(520, 470), m(700, 470));
  ok(await page.getByText('for every class that uses it?').isVisible(), 'editing the shell of a linked room asks "Update Lab 204 for every class that uses it?"');
  await shot(page, '43-update-room-ask');
  await page.getByRole('button', { name: 'Yes, update' }).click(); await wait(1000);
  rooms = await roomsStore();
  ok(rooms.find(r => r.name === 'Lab 204').shell.walls.length === 6, 'answering yes saves the new wall into the room');
  await page.locator('[title="Finish editing the room"]').click(); await wait(200);
  await openManage('Grade 7B Test');
  const bB2 = await SL('fx-7b');
  ok(bB2.walls.length === 6, 'class 7B shows the new wall after loading');
  ok(furnitureOf(bB2) === b1Furniture, 'and its furniture, seats and students are exactly as they were');

  // Randomise from the class Seating view keeps the walls, openings, items and the room link
  await page.getByText('Grade 6A Test').first().click(); await wait(300);
  const aS0 = await SL('fx-6a');
  await page.locator(TAB.seating).click(); await wait(900);
  await page.locator('[title^="Shuffle everyone into new seats"]:visible').first().click(); await wait(900);
  const aS1 = await SL('fx-6a');
  ok(shellOf(aS1) === shellOf(aS0) && JSON.stringify(aS1.room) === JSON.stringify(aS0.room) && aS1.walls.length === 6 && aS1.openings.length === 2, 'Randomise in the Seating view keeps walls, openings, items and the room link');
  ok(JSON.stringify(aS1.pieces) === JSON.stringify(aS0.pieces) && seatedCount(aS1) === 20, 'and the table pieces and seating');
  ok(await page.locator('line[style*="--cp-wall)"]').count() >= 6 && await page.locator('[title^="Station 1"]').count() >= 1, 'the class Seating view draws the walls and station badges too');

  console.log('Teacher\'s desk, areas, lines and board-style windows');
  await page.getByText('Grade 6A Test').first().click(); await wait(300);
  await openManage('Grade 6A Test');
  const justThisClass = page.getByRole('button', { name: 'Just this class' });
  // 1. the teacher's desk can be any size, and both views draw the same size
  const deskItemBefore = (await SL('fx-6a')).roomItems.find(i => i.type === 'desk');
  ok(deskItemBefore.w === undefined, 'the original teacher\'s desk has no size saved, so it keeps 114×52');
  await page.locator('[title^="Edit room"]').click(); await wait(300); // the old desk sits under a table in this fixture; in Edit room tables step aside
  await page.locator('[title^="Teacher\'s desk"]').first().click({ position: { x: 4, y: 4 } }); await wait(300);
  const dHandle = page.locator('[title="Drag to resize"]').nth(0); // bottom-right
  const dhb = await dHandle.boundingBox();
  await dragMouse([dhb.x + dhb.width / 2, dhb.y + dhb.height / 2], [dhb.x + dhb.width / 2 + 88, dhb.y + dhb.height / 2 + 24]);
  if (await justThisClass.count()) await justThisClass.click();
  await page.locator('[title="Finish editing the room"]').click(); await wait(300);
  const deskNow = (await SL('fx-6a')).roomItems.find(i => i.type === 'desk');
  ok(deskNow.w >= 192 && deskNow.h >= 72 && deskNow.x === deskItemBefore.x, `the desk was resized with its handles (${deskNow.w}×${deskNow.h})`);
  await shot(page, '32-big-teachers-desk');
  const hasBox = (w, h) => page.evaluate(([w, h]) => [...document.querySelectorAll('div')].some(d => d.style.width === w + 'px' && d.style.height === h + 'px' && d.querySelector(':scope > svg')), [w, h]);
  ok(await hasBox(deskNow.w, deskNow.h), 'Manage Seating draws it at that size');
  await page.locator(TAB.seating).click(); await wait(900);
  ok(await hasBox(deskNow.w, deskNow.h), 'and the class Seating view draws exactly the same size');
  await openManage('Grade 6A Test');

  // 2. an Area (colour + label) and a Line (drawn by dragging; dashed, with an arrow)
  await page.locator('[title^="Add a classroom or science-lab item"]').click(); await wait(250);
  await page.locator('[title^="Add item: Area"]').click(); await wait(650);
  await page.locator('[title="Make it sky"]').click(); await wait(650);
  await page.locator(labelInput).fill('Reading corner'); await page.locator(labelInput).press('Enter'); await wait(650);
  let slZ = await SL('fx-6a');
  const areaItem = slZ.roomItems.find(i => i.type === 'area');
  ok(areaItem?.color === 'sky' && areaItem.label === 'Reading corner' && areaItem.w === 192, 'an Area has a colour from the palette and a label in its corner');
  await page.locator('[title="Turn a quarter turn clockwise"]').click(); await wait(650);
  ok((await SL('fx-6a')).roomItems.find(i => i.type === 'area').rot === 90, 'areas can be turned');
  ok(await page.evaluate(() => { const a = [...document.querySelectorAll('div')].find(d => d.style.width === '192px' && d.style.height === '128px'); const t = document.querySelector('[title^="Drag to move this table"], polygon[title^="Drag to move"]'); return !!a && (!t || !!(a.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING)); }), 'areas are drawn underneath the tables');
  await shot(page, '33-area');
  await deselect();
  await page.locator('[title^="Edit room"]').click(); await wait(300);
  await page.locator('[title^="Dragging on the floor draws a free line"]').click(); await wait(200);
  m = await mapper();
  await dragMouse(m(120, 500), m(360, 505));
  if (await justThisClass.count()) await justThisClass.click();
  slZ = await SL('fx-6a');
  const lineItem = slZ.roomItems.find(i => i.type === 'line');
  ok(lineItem && lineItem.rot === 0 && lineItem.w >= 232, `dragging in Edit room draws a straight line item (${lineItem?.w} long)`);
  await page.locator('[title="Switch between a solid and a dashed line"]').click(); await wait(650);
  await page.locator('[title="Add or remove an arrow head at the end of the line"]').click(); await wait(650);
  const lineNow = (await SL('fx-6a')).roomItems.find(i => i.type === 'line');
  ok(lineNow.dashed === true && lineNow.arrow === true, 'a line can be dashed and have an arrow head');
  await page.locator('[title="Finish editing the room"]').click(); await wait(300);

  // 3. a board-style window: placed anywhere, snaps onto a wall when dropped on one
  await deselect();
  await page.locator('[title^="Add a classroom or science-lab item"]').click(); await wait(250);
  await page.locator('[title^="Add item: Window"]').click(); await wait(650);
  let winItem = (await SL('fx-6a')).roomItems.find(i => i.type === 'window');
  ok(winItem && winItem.w === 160 && winItem.h === 24 && winItem.fixed === true, 'the Window is a long thin room item (160×24), part of the room');
  const topWall = (await SL('fx-6a')).walls[0];
  await page.locator('[title^="Edit room"]').click(); await wait(300);
  const wbox = await page.locator('div[title^="Window"]').first().boundingBox();
  m = await mapper();
  await dragMouse([wbox.x + wbox.width / 2, wbox.y + wbox.height / 2], m(500, topWall.y1 + 9));
  if (await justThisClass.count()) await justThisClass.click();
  await page.locator('[title="Finish editing the room"]').click(); await wait(300);
  winItem = (await SL('fx-6a')).roomItems.find(i => i.type === 'window');
  ok(winItem.rot === 0 && Math.abs(winItem.y + winItem.h / 2 - topWall.y1) < 1, `dropped on the top wall, it sits along the wall (centre y ${winItem.y + winItem.h / 2} vs wall ${topWall.y1})`);
  await page.locator(labelInput).fill('Window 1'); await page.locator(labelInput).press('Enter'); await wait(650);
  await deselect();
  const itemsZ = JSON.stringify((await SL('fx-6a')).roomItems);
  await page.reload(); await wait(800);
  ok(JSON.stringify((await SL('fx-6a')).roomItems) === itemsZ, 'the desk size, area, line and window all survive a reload');
  await page.locator(TAB.seating).click(); await wait(900);
  ok(await page.getByText('Reading corner', { exact: true }).first().isVisible() && await page.getByText('Window 1', { exact: true }).first().isVisible(), 'the class Seating view shows the area and the window, so students can find their way');
  await shot(page, '34-class-view-zones');

  console.log('Full science lab map');
  // a complete lab (fixture data), in both themes, in the editor and the class view
  const putLab = async theme => {
    await page.evaluate(async ([l, th]) => {
      const raw = JSON.parse(localStorage.getItem('classboard-storage'));
      raw['sl-fx-7b'] = JSON.stringify(l); raw['ta-theme'] = JSON.stringify(th);
      localStorage.setItem('classboard-storage', JSON.stringify(raw));
    }, [lab, theme]);
    await page.reload(); await wait(900);
  };
  await putLab('whiteboard');
  await openManage('Grade 7B Test');
  await page.getByText('🎲 Randomize').click(); await wait(800);
  const flagToggle = page.locator('[title^="Show a 🚩 dot"]');
  if (await flagToggle.count()) await flagToggle.first().click();
  await wait(300);
  ok(await page.locator('line[style*="--cp-wall)"]').count() === 4 && await page.locator('[title^="Station "]').count() === 6, 'the lab map has 4 walls and 6 numbered benches');
  await shot(page, '50-lab-editor-whiteboard');
  await page.locator(TAB.seating).click(); await wait(900);
  await shot(page, '51-lab-class-view-whiteboard');
  await page.locator('[title^="Full screen"]').click(); await wait(900);
  await shot(page, '52-lab-projector-whiteboard');
  await page.keyboard.press('Escape'); await wait(300);
  await putLab('blackboard');
  await openManage('Grade 7B Test');
  await page.getByText('🎲 Randomize').click(); await wait(800);
  await page.locator(TAB.seating).click(); await wait(900);
  await shot(page, '53-lab-class-view-blackboard');
  await openManage('Grade 7B Test');
  await shot(page, '54-lab-editor-blackboard');

  console.log('Console');
  ok(problems.length === 0, 'no console errors or page errors' + (problems.length ? '\n    ' + problems.join('\n    ') : ''));

  await browser.close();
  server.close();
  console.log(`\n${passes} passed, ${failures} failed. Screenshots: ${SHOT_DIR}`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('Test run crashed:', e); process.exit(1); });
