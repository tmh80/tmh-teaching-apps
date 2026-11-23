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
  const openRooms = async () => { const rb = page.locator('[title^="Rooms: save this room"]'); await rb.scrollIntoViewIfNeeded(); await wait(150); await rb.click(); await wait(350); }; // scroll first: a picked table's colour picker makes the side bar taller, and a scroll while the menu opens would close it
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

  /* ── Class setups (Phase 5): migration, Regular/Lab tabs, usable furniture, spread, history, trash, restore ──
     Its own browser profile: the usual fixture plus class 8C (tests/fixtures/setups-class.js), and a
     setups entry already there for 7B, as if a first migration had crashed halfway through. */
  console.log('Class setups: migration');
  const SRC5 = fs.readFileSync(path.join(ROOT, 'src', 'teacher-app.jsx'), 'utf8');
  const G5 = new Function(SRC5.slice(SRC5.indexOf('/* @geometry-begin'), SRC5.indexOf('/* @geometry-end */')) + '\nreturn PIECE_GEOMETRY;')();
  const c8 = require('./fixtures/setups-class.js').build(G5);
  const half7b = JSON.stringify({ activeId: 'regular', list: [{ id: 'regular', name: 'Regular 7B', icon: '🪑', use: ['desk', 'workstation'], offPieces: [], createdAt: 1 }] });
  const seed5 = {
    ...FIXTURE.data,
    'ta-classes': JSON.stringify([...JSON.parse(FIXTURE.data['ta-classes']), c8.classObj]),
    'ta-active-class': JSON.stringify('fx-8c'),
    'sl-fx-8c': JSON.stringify(c8.sl), 'sh-fx-8c': JSON.stringify(c8.sh),
    'setups-fx-7b': half7b,
  };
  const ctx5 = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1, acceptDownloads: true });
  await ctx5.addInitScript(fixture => {
    try { if (localStorage.getItem('classboard-storage') === null) localStorage.setItem('classboard-storage', JSON.stringify(fixture)); } catch (e) {}
  }, seed5);
  const p5 = await ctx5.newPage();
  p5.on('console', m => { if (m.type() === 'error') problems.push('console (setups): ' + m.text()); });
  p5.on('pageerror', e => problems.push('pageerror (setups): ' + e.message));
  p5.on('dialog', d => d.dismiss());
  const w5 = ms => p5.waitForTimeout(ms);
  const store5 = () => readStore(p5);
  const S5 = async k => { const v = (await store5())[k]; return v === undefined ? undefined : JSON.parse(v); };
  const shot5 = name => p5.screenshot({ path: path.join(SHOT_DIR, name + '.png') });
  await p5.goto(URL); await w5(1200);

  let st5 = await store5();
  ok(['fx-6a', 'fx-7b', 'fx-8c'].every(c => st5[`setups-${c}`]), 'every class now has a setups entry');
  const su8 = JSON.parse(st5['setups-fx-8c']);
  ok(su8.activeId === 'regular' && su8.list.length === 1 && su8.list[0].name === 'Regular' && su8.list[0].use.join() === 'desk,workstation',
    'it is one "Regular" setup that uses tables and workstations, so generating works exactly as before');
  ok(st5['setups-fx-7b'] === half7b, 'a class that already had one (a migration cut short) is left exactly as it was');
  ok(['sl-fx-6a', 'sl-fx-7b', 'sl-fx-8c'].every(k => st5[k] === seed5[k]), 'every sl-<class> is byte-for-byte unchanged');
  ok(st5['cp-schema'] === '2', `cp-schema is 2 (${st5['cp-schema']})`);
  let bk5 = await readBackups(p5);
  const beforeSetups = bk5.filter(b => b.reason === 'before setups');
  ok(beforeSetups.length === 1 && beforeSetups[0].data['sl-fx-8c'] === seed5['sl-fx-8c'] && !('setups-fx-8c' in beforeSetups[0].data) && !('cp-schema' in beforeSetups[0].data),
    'one automatic backup "before setups" was taken, of the data before the change');
  ok(bk5[0]?.reason === 'launch', 'the day\'s launch backup was still made');
  await p5.reload(); await w5(1000);
  ok((await readBackups(p5)).length === bk5.length && (await store5())['setups-fx-8c'] === st5['setups-fx-8c'], 'opening again does not migrate or back up again');

  console.log('Class setups: tabs, Regular and Lab');
  const manage5 = async () => {
    if (await p5.locator('[title="Add a new desk or table to the room"]').count()) return;
    await p5.locator(manageMenu).click(); await p5.getByText('Manage Seating').click(); await w5(900);
  };
  const tab5 = name => p5.locator(`[role="tab"][data-setup="${name}"]:visible`);
  const menuFor = name => p5.locator(`[aria-label="More for ${name}"]:visible`);
  const atPieces = (sl, ids) => sl.seats.filter(s => s.studentId && ids.includes(s.pieceId));
  const perTable = (sl, ids) => ids.map(id => sl.seats.filter(s => s.pieceId === id && s.studentId).length);
  await manage5();
  ok(await tab5('Regular').count() === 1 && await p5.locator('[title^="New class setup"]').count() === 1, 'Manage Seating shows a "Regular" tab and ＋, even with one setup');
  ok(await p5.locator('[title="Add a new desk or table to the room"]').count() === 1 && await p5.getByText('Aria Fake').first().isVisible(), 'and the class\'s seating as before');
  await shot5('60-tabs-manage-whiteboard');
  // the ⋯ menu: Regular uses tables only from now on
  await menuFor('Regular').click(); await w5(250);
  ok(await p5.getByText('Regular can be renamed but not deleted.').isVisible() && !(await p5.getByText('Delete…').count()), 'Regular\'s ⋯ menu has rename, icon, use for, duplicate, and no delete');
  await shot5('61-tab-menu-whiteboard');
  await p5.locator('.cp-pop [title^="Generate into tables only"]').click(); await w5(300);
  ok(JSON.stringify((await S5('setups-fx-8c')).list[0].use) === '["desk"]', 'Use for: Tables is saved on the setup');
  await p5.keyboard.press('Escape'); await w5(200);

  // spread: 10 students, four tables of 4 (the benches are not used by Regular now)
  const regBefore = await S5('sl-fx-8c');
  ok(JSON.stringify(perTable(regBefore, c8.deskIds)) === '[4,4,2,0]', 'before: the old seating fills tables in list order (4,4,2,0)');
  let spreadOk = true, benchFree = true;
  for (let i = 0; i < 3; i++) {
    await p5.getByText('🎲 Randomize').click(); await w5(650);
    const sl = await S5('sl-fx-8c');
    const pt = perTable(sl, c8.deskIds);
    if (pt.some(n => n === 0) || pt.reduce((a, b) => a + b, 0) !== 10 || Math.max(...pt) > 3) spreadOk = false;
    if (atPieces(sl, c8.benchIds).length) benchFree = false;
  }
  ok(spreadOk, `Randomize spreads 10 students over four tables of 4 with no table left empty (${perTable(await S5('sl-fx-8c'), c8.deskIds).join(',')})`);
  ok(benchFree, 'and with "Tables" it leaves the lab benches free');
  const regSaved = (await store5())['sl-fx-8c'];
  const regSeating = JSON.parse(regSaved).seats.filter(s => s.studentId).map(s => `${s.id}=${s.studentId}`).sort().join();

  // a new setup "Lab": a copy without students, used for workstations
  await p5.locator('[title^="New class setup"]').click(); await w5(300);
  ok(await p5.getByText('New class setup', { exact: true }).isVisible(), '＋ opens the New class setup dialog');
  await p5.getByPlaceholder('e.g. Lab, Lab partners, Rocket project').fill('Lab'); await w5(150);
  ok(await p5.locator('[role="dialog"] [title^="Generate into workstations only"]').evaluate(b => b.classList.contains('on')), 'naming it "Lab" picks Workstations');
  await shot5('62-new-setup-dialog-whiteboard');
  await p5.locator('[title="Make the setup and switch to it"]').click(); await w5(1100);
  let su = await S5('setups-fx-8c');
  const labSu = su.list.find(s => s.name === 'Lab');
  ok(su.list.length === 2 && labSu && su.activeId === labSu.id && labSu.use.join() === 'workstation' && labSu.icon === '🧪', 'creating it adds a 🧪 Lab tab (workstations) and switches to it');
  const labKey = `sl-fx-8c~${labSu.id}`;
  let labSl = await S5(labKey);
  ok(labSl && labSl.seats.length === regBefore.seats.length && labSl.seats.every(s => !s.studentId) && labSl.pieces.length === 7 && labSl.walls.length === 4,
    `its seating is saved in ${labKey}: the same room and furniture, nobody seated`);
  ok(labSl.rules.length === 0 && labSl.tags.length === 0, 'the copy keeps no rules or tags of its own (they stay with the class)');
  ok((await store5())['sl-fx-8c'] === regSaved, 'Regular\'s sl-fx-8c is byte-for-byte unchanged');
  ok(await tab5('Lab').getAttribute('aria-selected') === 'true', 'the Lab tab is selected');
  ok(await p5.locator('[data-cp="unused"]').count() === 4, 'the four tables Lab doesn\'t use are drawn faded');
  ok(await p5.locator('polygon[title*="Not used in Lab"]').count() === 4, 'and say "Not used in Lab" on hover');

  // Randomize in Lab: benches only, the keep-apart rule from Regular still holds
  let benchOnly = true, apartKept = true;
  for (let i = 0; i < 6; i++) {
    await p5.getByText('🎲 Randomize').click(); await w5(600);
    labSl = await S5(labKey);
    if (atPieces(labSl, c8.deskIds).length || atPieces(labSl, c8.benchIds).length !== 10) benchOnly = false;
    const benchOf = id => labSl.seats.find(s => s.studentId === id)?.pieceId;
    if (benchOf('c1') && benchOf('c1') === benchOf('c2')) apartKept = false;
  }
  ok(benchOnly, 'Randomize in Lab seats all 10 at the lab benches and nobody at a table');
  ok(apartKept, 'the keep-apart rule set in Regular is kept in Lab (6 tries, Aria and Bo never share a bench)');
  ok((await store5())['sl-fx-8c'] === regSaved, 'Regular is still byte-for-byte unchanged');
  await p5.mouse.click(1205, 66); await w5(200);
  await shot5('63-lab-benches-in-use-whiteboard');

  // switch a bench off for Lab: Randomize leaves it empty
  const benchHit = p5.locator('polygon[title^="Drag to move this table"]').nth(4);
  // pick the bench by its back edge (away from the name tags, which would start dragging a student)
  await benchHit.click({ force: true, position: { x: 30, y: 10 } }); await w5(300);
  await p5.locator('[title^="Leave this table out when generating in Lab"]').click(); await w5(300);
  su = await S5('setups-fx-8c');
  const offId = su.list.find(s => s.id === labSu.id).offPieces[0];
  ok(su.list.find(s => s.id === labSu.id).offPieces.length === 1 && c8.benchIds.includes(offId) && su.list[0].offPieces.length === 0, '"Use in Lab" off stores the bench in Lab\'s offPieces only');
  const sittingThere = (await S5(labKey)).seats.filter(s => s.pieceId === offId && s.studentId).length;
  ok(sittingThere > 0 && await p5.getByText(`${sittingThere} student${sittingThere > 1 ? 's are' : ' is'} at furniture not used in Lab`).isVisible(), `students already at that bench stay put, with a gentle warning (${sittingThere})`);
  await p5.mouse.click(1205, 66); await w5(200);
  await p5.getByText('🎲 Randomize').click(); await w5(650);
  labSl = await S5(labKey);
  ok(labSl.seats.filter(s => s.pieceId === offId && s.studentId).length === 0 && atPieces(labSl, c8.benchIds).length === 8, 'Randomize leaves that bench empty (8 seated at the other two)');
  ok(await p5.locator('[data-cp="unused"]').count() === 5, 'and it is drawn faded too');
  await p5.locator('polygon[title^="Drag to move this table"]').nth(4).click({ force: true, position: { x: 30, y: 10 } }); await w5(300);
  await p5.locator('[title^="Use this table again when generating in Lab"]').click(); await w5(300);
  ok((await S5('setups-fx-8c')).list.find(s => s.id === labSu.id).offPieces.length === 0, 'and switching it back on clears it');
  await p5.mouse.click(1205, 66); await w5(200);
  await p5.getByText('🎲 Randomize').click(); await w5(650);
  const labSeating = (await store5())[labKey];

  // history: confirmed per setup; the old entry counts as Regular's
  await p5.getByText('Confirm seating').first().click(); await w5(400);
  let sh8 = await S5('sh-fx-8c');
  ok(sh8.length === 2 && sh8[0].setupId === labSu.id && !('setupId' in sh8[1]), 'Confirm seating in Lab saves an entry tagged with Lab\'s setupId (the old one is untouched)');
  ok(await p5.getByText('Previous arrangements (1)').isVisible(), 'Lab lists only its own arrangement');

  // back to Regular: exactly as it was
  await tab5('Regular').click(); await w5(900);
  ok(await tab5('Regular').getAttribute('aria-selected') === 'true' && (await S5('setups-fx-8c')).activeId === 'regular', 'one click switches back to Regular');
  ok((await store5())['sl-fx-8c'] === regSaved && (await store5())[labKey] === labSeating, 'switching saves nothing over either setup');
  const seatedNow = await p5.locator('[title^="Drag to move this table"]').count();
  const regFirst = c8.classObj.students.find(s => s.id === JSON.parse(regSaved).seats.find(x => x.studentId).studentId).name;
  ok(seatedNow === 7 && await p5.getByText(regFirst, { exact: true }).first().isVisible() && await p5.locator('[data-cp="unused"]').count() === 3, `Regular shows its own seating again (${regFirst} at a table; the 3 benches faded)`);
  ok(await p5.getByText('Previous arrangements (1)').isVisible(), 'and lists the arrangement from before setups as Regular\'s');
  ok(JSON.parse((await store5())['sl-fx-8c']).seats.filter(s => s.studentId).map(s => `${s.id}=${s.studentId}`).sort().join() === regSeating, 'Regular\'s seating is exactly as it was');

  // reload: the active setup is remembered
  await tab5('Lab').click(); await w5(800);
  await p5.reload(); await w5(1100);
  await p5.locator(TAB.seating).click(); await w5(900);
  ok(await p5.locator('[role="tab"]:visible').count() === 2 && await tab5('Lab').getAttribute('aria-selected') === 'true', 'after a reload the class Seating view opens on Lab, with a slim tab row');
  await shot5('64-tabs-class-view-whiteboard');

  console.log('Class setups: the class Seating view');
  await tab5('Regular').click(); await w5(900);
  ok(await tab5('Regular').getAttribute('aria-selected') === 'true', 'its tabs switch setup too');
  let bef5 = await store5();
  await p5.locator('[title^="Shuffle everyone into new seats"]:visible').first().click(); await w5(900);
  let aft5 = await store5();
  ok(aft5['sl-fx-8c'] !== bef5['sl-fx-8c'] && aft5[labKey] === bef5[labKey], 'Randomise there on Regular writes sl-fx-8c only');
  ok(atPieces(JSON.parse(aft5['sl-fx-8c']), c8.benchIds).length === 0 && perTable(JSON.parse(aft5['sl-fx-8c']), c8.deskIds).every(n => n > 0), 'and fills only the tables, with none left empty');
  await tab5('Lab').click(); await w5(900);
  bef5 = await store5();
  await p5.locator('[title^="Shuffle everyone into new seats"]:visible').first().click(); await w5(900);
  aft5 = await store5();
  ok(aft5[labKey] !== bef5[labKey] && aft5['sl-fx-8c'] === bef5['sl-fx-8c'], 'on Lab it writes Lab\'s key only');
  ok(atPieces(JSON.parse(aft5[labKey]), c8.benchIds).length === 10, 'and seats everyone at the benches');
  ok(JSON.parse(aft5[labKey]).rules.length === 0 && JSON.parse(aft5['sl-fx-8c']).rules.length === 1, 'the rules stay with the class (sl-fx-8c), not copied into Lab');

  console.log('Class setups: delete, trash, restore');
  await manage5();
  await menuFor('Lab').click(); await w5(250);
  await p5.locator('.cp-pop [title="Make a copy of this setup, seating and all"]').click(); await w5(1100);
  su = await S5('setups-fx-8c');
  const copy = su.list.find(s => s.name === 'Lab copy');
  const whoWhere = v => JSON.parse(v).seats.map(s => `${s.id}=${s.studentId || ''}`).join();
  ok(copy && su.activeId === copy.id && whoWhere((await store5())[`sl-fx-8c~${copy.id}`]) === whoWhere((await store5())[labKey]), 'Duplicate makes "Lab copy" with the same seating and switches to it');
  // drag "Lab copy" before Lab
  await tab5('Lab copy').dragTo(tab5('Lab')); await w5(400);
  ok((await S5('setups-fx-8c')).list.map(s => s.name).join() === 'Regular,Lab copy,Lab', `tabs can be dragged to reorder (${(await S5('setups-fx-8c')).list.map(s => s.name).join(', ')})`);
  const copyKey = `sl-fx-8c~${copy.id}`, copyVal = (await store5())[copyKey];
  await menuFor('Lab copy').click(); await w5(250);
  await p5.locator('.cp-pop [title="Delete this setup (it asks first)"]').click(); await w5(200);
  ok(await p5.getByText('Its seating is kept in the trash for 30 days').isVisible(), 'Delete asks first');
  await p5.locator('.cp-pop [title="Yes, delete Lab copy"]').click(); await w5(1000);
  st5 = await store5();
  const trash = JSON.parse(st5['ta-trash'] || '[]');
  ok(!(copyKey in st5) && trash.length === 1 && trash[0].key === copyKey && JSON.stringify(trash[0].value) === copyVal && Number.isFinite(trash[0].deletedAt), 'its seating moved to ta-trash and the key is gone');
  su = JSON.parse(st5['setups-fx-8c']);
  ok(su.list.map(s => s.name).join() === 'Regular,Lab' && su.activeId === 'regular', 'the tab is gone and Regular is showing');
  ok('sl-fx-8c' in st5 && labKey in st5, 'Regular and Lab are still there');
  // trash older than 30 days goes on launch, newer stays
  await p5.evaluate(async () => {
    const t = JSON.parse((await window.storage.get('ta-trash')).value);
    t[0].deletedAt = Date.now() - 31 * 86400000;
    t.push({ key: 'sl-fx-8c~recent', value: { seats: [] }, deletedAt: Date.now() - 86400000 });
    await window.storage.set('ta-trash', JSON.stringify(t));
    // and pretend the automatic backups are from yesterday, so this launch makes a fresh one
    const b = JSON.parse(localStorage.getItem('classpanels-auto-backups') || '[]');
    localStorage.setItem('classpanels-auto-backups', JSON.stringify(b.map(x => ({ ...x, exportedAt: new Date(Date.parse(x.exportedAt) - 86400000).toISOString() }))));
  });
  await p5.reload(); await w5(1100);
  const trash2 = await S5('ta-trash');
  ok(trash2.length === 1 && trash2[0].key === 'sl-fx-8c~recent', 'on launch, trash older than 30 days is purged and newer trash kept');

  // Settings > Export backup, then restore it: the setups come back exactly
  await p5.locator('[title^="Settings"]').click(); await w5(300);
  const [dl] = await Promise.all([p5.waitForEvent('download'), p5.locator('[title^="Save all your classes"]').click()]);
  const exportPath = path.join(SHOT_DIR, 'phase5-export.json');
  await dl.saveAs(exportPath);
  const exported = JSON.parse(fs.readFileSync(exportPath, 'utf8')).data;
  ok(['setups-fx-6a', 'setups-fx-7b', 'setups-fx-8c', labKey, 'ta-trash', 'cp-schema'].every(k => k in exported), 'Export backup includes setups-*, sl-*~*, ta-trash and cp-schema');
  const latestAuto = (await readBackups(p5))[0];
  ok(latestAuto && [labKey, 'setups-fx-8c'].every(k => k in latestAuto.data), 'automatic backups include them too');
  await p5.keyboard.press('Escape'); await p5.mouse.click(10, 890); await w5(200);
  await p5.evaluate(async k => { await window.storage.delete(k); await window.storage.delete('setups-fx-8c'); await window.storage.set('ta-trash', '[]'); }, labKey);
  await p5.reload(); await w5(900);
  await p5.locator('[title^="Settings"]').click(); await w5(300);
  await p5.locator('input[type="file"][accept*="json"]').setInputFiles(exportPath); await w5(400);
  await Promise.all([p5.waitForNavigation(), p5.getByRole('button', { name: 'Replace', exact: true }).click()]);
  await w5(1100);
  st5 = await store5();
  const diff5 = Object.keys(exported).filter(k => st5[k] !== exported[k]);
  ok(diff5.length === 0, 'restoring the export puts every key back exactly, setups included' + (diff5.length ? ` (differs: ${diff5.join(', ')})` : ''));
  await p5.locator(TAB.seating).click(); await w5(700);
  ok(await p5.locator('[role="tab"]:visible').count() === 2, 'and the class view has its Regular and Lab tabs again');

  console.log('Class setups: rollback to main still works');
  // main only reads sl-<class>: it must still have every field, of the right type
  st5 = await store5();
  const mainShape = v => {
    const o = JSON.parse(v);
    return Array.isArray(o.seats) && Array.isArray(o.groups) && Array.isArray(o.tags) && Array.isArray(o.roomItems) && Array.isArray(o.rules)
      && o.seats.every(s => typeof s.id === 'string' && Number.isFinite(s.x) && Number.isFinite(s.y) && typeof s.used === 'boolean' && Array.isArray(s.tags) && (s.studentId === null || s.studentId === undefined || typeof s.studentId === 'string'))
      && o.groups.every(g => typeof g.id === 'string' && Array.isArray(g.seatIds));
  };
  const slMain = Object.keys(st5).filter(k => /^sl-[^~]+$/.test(k));
  ok(slMain.length === 3 && slMain.every(k => mainShape(st5[k])), `${slMain.join(', ')} still load in the shape main expects`);
  ok(JSON.parse(st5['sl-fx-8c']).rules.length === 1 && st5['sl-fx-6a'] === FIXTURE.data['sl-fx-6a'], 'the class rules are in sl-fx-8c, and a class that was only migrated (6A) is untouched');
  ok(Object.keys(st5).filter(k => k.includes('~')).every(k => k.startsWith('sl-') && mainShape(st5[k])), 'every other setup has the same shape, under keys main never reads');

  // blackboard: the same screens
  await p5.evaluate(async () => { await window.storage.set('ta-theme', JSON.stringify('blackboard')); });
  await p5.reload(); await w5(1000);
  await p5.locator(TAB.seating).click(); await w5(900);
  await shot5('64-tabs-class-view-blackboard');
  await manage5();
  await tab5('Lab').click(); await w5(900);
  await p5.mouse.click(1205, 66); await w5(200);
  await shot5('63-lab-benches-in-use-blackboard');
  await tab5('Regular').click(); await w5(900);
  await shot5('60-tabs-manage-blackboard');
  await menuFor('Lab').click(); await w5(250);
  await shot5('61-tab-menu-blackboard');
  await p5.keyboard.press('Escape'); await w5(200);
  await p5.locator('[title^="New class setup"]').click(); await w5(300);
  await p5.getByPlaceholder('e.g. Lab, Lab partners, Rocket project').fill('Lab partners'); await w5(150);
  await shot5('62-new-setup-dialog-blackboard');
  await p5.keyboard.press('Escape'); await w5(200);
  await ctx5.close();

  /* ── Seat these groups into a setup (Phase 6) ──
     Its own browser profile with the Phase 5 fixture's class 8C: 10 students, four long tables (used as
     tables) and three 4-place lab benches (workstations). Regular's seating must never change. */
  console.log('Seat these groups: new setup from groups of 2');
  const ctx6 = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  await ctx6.addInitScript(fixture => {
    try { if (localStorage.getItem('classboard-storage') === null) localStorage.setItem('classboard-storage', JSON.stringify(fixture)); } catch (e) {}
  }, seed5);
  const p6 = await ctx6.newPage();
  p6.on('console', m => { if (m.type() === 'error') problems.push('console (seat groups): ' + m.text()); });
  p6.on('pageerror', e => problems.push('pageerror (seat groups): ' + e.message));
  p6.on('dialog', d => d.dismiss());
  const w6 = ms => p6.waitForTimeout(ms);
  const store6 = () => readStore(p6);
  const S6 = async k => { const v = (await store6())[k]; return v === undefined ? undefined : JSON.parse(v); };
  const shot6 = name => p6.screenshot({ path: path.join(SHOT_DIR, name + '.png') });
  const GCK = G5.GROUP_COLOR_KEYS;
  await p6.goto(URL); await w6(1200);
  const regular0 = (await store6())['sl-fx-8c'];
  ok(regular0 === seed5['sl-fx-8c'], 'before we start, Regular\'s seating is exactly the fixture\'s');
  const openManageGroups = async () => { await p6.locator(manageMenu).click(); await p6.getByText('Manage Groups').click(); await w6(800); };
  const makeGroups = async size => {
    await p6.locator('input[type="number"][min="2"]').fill(String(size)); await w6(150);
    await p6.getByRole('button', { name: /^Create (new )?groups/ }).click(); await w6(700);
  };
  const seatBtn = () => p6.locator('[data-seat-groups] button').first();
  const summary6 = () => p6.locator('[role="status"][aria-label="Seat groups summary"]');
  await openManageGroups();
  await makeGroups(2);
  const gp6 = await S6('gp-fx-8c');
  ok(gp6.resultGroupIds.length === 5 && gp6.resultGroupIds.every(g => g.length === 2), 'Manage Groups made 5 groups of 2');
  ok(await seatBtn().isVisible() && /Seat these groups/.test(await seatBtn().innerText()) && !!(await seatBtn().getAttribute('title')), 'the "🪑 Seat these groups ▸" button is there, with a tooltip');
  await seatBtn().click(); await w6(300);
  ok(await p6.getByRole('menuitem', { name: /New setup…/ }).isVisible() && await p6.locator('[data-seat-regular]').isVisible(), 'its menu offers New setup… and shows Regular as not available');
  ok(/never replaced/.test(await p6.locator('[data-seat-regular]').getAttribute('title')) && (await p6.getByRole('menuitem').count()) === 1, 'Regular can\'t be chosen: a tooltip explains why, and no existing setup is listed yet');
  await shot6('70-seat-groups-menu-whiteboard');
  await p6.getByRole('menuitem', { name: /New setup…/ }).click(); await w6(300);
  const dlg6 = p6.locator('[role="dialog"][aria-label^="Seat these groups"]');
  ok(await dlg6.locator('input').first().inputValue() === 'Lab partners', 'the new setup is called "Lab partners" by default when the groups are pairs');
  ok(await dlg6.locator('[title^="Generate into workstations only"]').evaluate(b => b.classList.contains('on')), 'and it uses Workstations (the name says lab)');
  ok(await dlg6.getByText('The current room and furniture', { exact: false }).isVisible() && await dlg6.getByText('Room', { exact: true }).isVisible(), 'the dialog asks for the room (the current one by default)');
  await shot6('71-seat-groups-dialog-whiteboard');
  await dlg6.getByRole('button', { name: 'Seat the groups' }).click(); await w6(1200);
  let st6 = await store6();
  let su6 = JSON.parse(st6['setups-fx-8c']);
  const lp = su6.list.find(s => s.name === 'Lab partners');
  ok(lp && su6.list.length === 2 && su6.activeId === lp.id && lp.icon === '👥' && lp.use.join() === 'workstation', 'a "Lab partners" tab was made and is now the active setup');
  ok(lp && lp.fromGroups && lp.fromGroups.names.length === 5 && Number.isFinite(lp.fromGroups.at), 'the setup remembers it was made from the Groups (fromGroups)');
  ok(st6['sl-fx-8c'] === regular0, 'Regular (sl-fx-8c) is byte-for-byte unchanged');
  ok(await summary6().isVisible() && /5 groups seated in/.test(await summary6().innerText()) && /Lab partners/.test(await summary6().innerText()), 'a summary says "5 groups seated in Lab partners"');
  ok(/share a bench/.test(await summary6().innerText()) && /Regular is not changed/.test(await summary6().innerText()), 'it says one group has to share a bench (only 3 benches for 5 pairs), and that Regular is not changed');
  ok(await summary6().getByRole('button', { name: 'Go to setup' }).isVisible(), 'and offers Go to setup');
  await shot6('72-seat-groups-summary-whiteboard');
  const labKey6 = `sl-fx-8c~${lp.id}`;
  const lab6 = JSON.parse(st6[labKey6]);
  const seatByStudent = (lo, id) => lo.seats.find(s => s.studentId === id);
  let pairsOk = true, coloursOk = true;
  gp6.resultGroupIds.forEach((ids, gi) => {
    const a = seatByStudent(lab6, ids[0]), b = seatByStudent(lab6, ids[1]);
    if (!a || !b || a.pieceId !== b.pieceId || Math.abs(a.slot - b.slot) !== 1 || !c8.benchIds.includes(a.pieceId)) pairsOk = false;
  });
  // each bench takes the colour of the lowest-numbered group sitting on it
  const benchGroups = {};
  gp6.resultGroupIds.forEach((ids, gi) => { const pid = seatByStudent(lab6, ids[0]).pieceId; (benchGroups[pid] = benchGroups[pid] || []).push(gi); });
  Object.entries(benchGroups).forEach(([pid, gis]) => {
    const gid = lab6.seats.find(s => s.pieceId === pid).groupId;
    if (lab6.groups.find(g => g.id === gid).color !== GCK[Math.min(...gis) % GCK.length]) coloursOk = false;
  });
  ok(pairsOk, 'every pair is at one bench, side by side (neighbouring places)');
  ok(coloursOk && Object.keys(benchGroups).length === 3, 'the three benches are coloured with their group\'s colour (group 1 blue, 2 green, 3 gold…), and named after it');
  ok(lab6.seats.filter(s => s.studentId).length === 10 && !lab6.seats.some(s => s.studentId && c8.deskIds.includes(s.pieceId)), 'all 10 students are seated, and none at the long tables (not used by Workstations)');
  ok(lab6.pieces.filter(p => benchGroups[p.id]).every(p => /^Group \d$/.test(p.label || '')), 'each bench is labelled with a group name');
  ok(JSON.stringify(lab6.rules) === '[]' && JSON.stringify(lab6.tags) === '[]', 'the new setup\'s own tags and rules stay empty (they belong to the class)');

  console.log('Seat these groups: into an existing setup (asks first)');
  await makeGroups(3);
  const gp6b = await S6('gp-fx-8c');
  ok(gp6b.resultGroupIds.length === 4, 'new groups of 3 (4 groups: 3, 3, 2, 2)');
  const labBefore = st6[labKey6];
  await seatBtn().click(); await w6(300);
  const items = await p6.getByRole('menuitem').allInnerTexts();
  ok(items.length === 2 && /Lab partners/.test(items[1]) && /from Groups/.test(items[1]), 'the menu now lists "Lab partners" (and not Regular) as an existing setup');
  await p6.getByRole('menuitem', { name: /Lab partners/ }).click(); await w6(250);
  ok(/Replace the seating in Lab partners with these 4 groups\?/.test(await p6.locator('[role="menu"]').innerText()) && /Regular is not changed/.test(await p6.locator('[role="menu"]').innerText()), 'it asks "Replace the seating in Lab partners with these 4 groups? Regular is not changed."');
  ok((await store6())[labKey6] === labBefore, 'and nothing has changed yet');
  await shot6('73-seat-groups-replace-question-whiteboard');
  await p6.getByRole('button', { name: 'Replace', exact: true }).click(); await w6(1000);
  st6 = await store6();
  ok(st6[labKey6] !== labBefore && JSON.parse(st6['setups-fx-8c']).list.length === 2 && JSON.parse(st6['setups-fx-8c']).activeId === lp.id, 'after confirming, only Lab partners was replaced (still 2 setups, same one active)');
  ok(st6['sl-fx-8c'] === regular0, 'Regular is still byte-for-byte unchanged');
  const lab6b = JSON.parse(st6[labKey6]);
  const sameBench = gp6b.resultGroupIds.map(ids => new Set(ids.map(id => seatByStudent(lab6b, id)?.pieceId)).size);
  ok(lab6b.seats.filter(s => s.studentId).length === 10 && sameBench.every(n => n === 1) && JSON.parse(st6['setups-fx-8c']).list.find(s => s.id === lp.id).fromGroups.names.length === 4, 'all 4 new groups (3,3,2,2) each sit at one bench, and fromGroups was updated');
  ok(await summary6().isVisible() && /4 groups seated in/.test(await summary6().innerText()), 'the summary updates');

  console.log('Seat these groups: groups of 5 split across tables');
  await makeGroups(5);
  const gp6c = await S6('gp-fx-8c');
  ok(gp6c.resultGroupIds.length === 2 && gp6c.resultGroupIds.every(g => g.length === 5), '2 groups of 5');
  await seatBtn().click(); await w6(300);
  await p6.getByRole('menuitem', { name: /New setup…/ }).click(); await w6(300);
  const nm = await dlg6.locator('input').first().inputValue();
  ok(/^Groups \d{1,2} [A-Z][a-z]{2}$/.test(nm), `the default name is "Groups <date>" (${nm})`);
  ok(await dlg6.locator('[title^="Generate into tables only"]').evaluate(b => b.classList.contains('on')), 'with Tables as the default use');
  await dlg6.getByRole('button', { name: 'Seat the groups' }).click(); await w6(1200);
  st6 = await store6();
  su6 = JSON.parse(st6['setups-fx-8c']);
  const gs = su6.list.find(s => s.name === nm);
  const gsLay = JSON.parse(st6[`sl-fx-8c~${gs.id}`]);
  ok(gs && su6.activeId === gs.id && su6.list.length === 3, 'a third tab was made and is active');
  const tablesOfGroup = ids => [...new Set(ids.map(id => seatByStudent(gsLay, id).pieceId))];
  const t5 = gp6c.resultGroupIds.map(tablesOfGroup);
  ok(t5.every(t => t.length === 2) && t5.every(t => t.every(id => c8.deskIds.includes(id))), 'each group of 5 is split over two of the 4-seat tables');
  const px = id => gsLay.pieces.find(p => p.id === id).x;
  ok(t5.every(t => Math.abs(px(t[0]) - px(t[1])) === 280), 'the two tables are neighbours');
  ok(await summary6().isVisible() && /was split across 2 tables/.test(await summary6().innerText()), 'the summary says a group was split across 2 tables: ' + (await summary6().innerText()).replace(/\n/g, ' | '));
  ok(st6['sl-fx-8c'] === regular0 && st6[labKey6] === JSON.stringify(lab6b), 'Regular and Lab partners are unchanged');
  await shot6('74-seat-groups-split-summary-whiteboard');

  console.log('Seat these groups: the seating views and back to Regular');
  await summary6().getByRole('button', { name: 'Go to setup' }).click(); await w6(900);
  const tab6 = name => p6.locator(`[role="tab"][data-setup="${name}"]:visible`);
  ok(await tab6(nm).getAttribute('aria-selected') === 'true' && await p6.getByText(/Group 1/).first().isVisible(), 'Go to setup opens the Seating view on the new setup');
  ok(/Made from Groups on \d{1,2} [A-Z][a-z]{2}/.test(await tab6(nm).getAttribute('title')), 'the tab\'s tooltip says it was made from Groups on <date>');
  await shot6('75-seat-groups-class-view-split-whiteboard');
  await tab6('Lab partners').click(); await w6(900);
  const classFills = await p6.evaluate(() => [...document.querySelectorAll('svg *')].map(e => (e.getAttribute('style') || '') + ' ' + (e.getAttribute('fill') || '')).join(' '));
  ok(GCK.slice(0, 3).every(k => classFills.includes(`--cp-table-${k}`)), 'the class Seating view paints the benches in the group colours (blue, green, gold…)');
  await shot6('76-seat-groups-class-view-lab-partners-whiteboard');
  await tab6('Regular').click(); await w6(900);
  ok(await p6.getByText('Aria Fake').first().isVisible() && (await store6())['sl-fx-8c'] === regular0, 'switching back to Regular shows the original seating, byte for byte');
  await p6.reload(); await w6(1200);
  st6 = await store6();
  ok(JSON.parse(st6['setups-fx-8c']).list.map(s => s.name).join() === `Regular,Lab partners,${nm}`, 'after a reload all three tabs are still there');
  await p6.locator(TAB.seating).click(); await w6(600);
  await tab6('Lab partners').click(); await w6(900);
  ok(JSON.stringify(JSON.parse((await store6())[labKey6]).seats.map(s => s.studentId)) === JSON.stringify(lab6b.seats.map(s => s.studentId)), 'and Lab partners still has its seating after the reload');
  // Manage Seating shows the coloured benches too
  await p6.locator(manageMenu).click(); await p6.getByText('Manage Seating').click(); await w6(1000);
  ok(await tab6('Lab partners').count() === 1, 'Manage Seating has the Lab partners tab');
  await tab6('Lab partners').click(); await w6(900);
  await shot6('77-seat-groups-manage-seating-whiteboard');
  ok((await store6())['sl-fx-8c'] === regular0, 'Regular is still unchanged after all of that');

  // blackboard
  await p6.evaluate(async () => { await window.storage.set('ta-theme', JSON.stringify('blackboard')); });
  await p6.reload(); await w6(1000);
  await p6.locator(manageMenu).click(); await p6.getByText('Manage Seating').click(); await w6(900);
  await tab6('Lab partners').click(); await w6(800);
  await shot6('77-seat-groups-manage-seating-blackboard');
  await p6.locator(manageMenu).click(); await p6.getByText('Manage Groups').click(); await w6(900);
  await seatBtn().click(); await w6(300);
  await shot6('70-seat-groups-menu-blackboard');
  await p6.getByRole('menuitem', { name: /New setup…/ }).click(); await w6(300);
  await shot6('71-seat-groups-dialog-blackboard');
  await p6.keyboard.press('Escape'); await w6(300);
  await seatBtn().click(); await w6(300);
  await p6.getByRole('menuitem', { name: /Lab partners/ }).click(); await w6(250);
  await shot6('73-seat-groups-replace-question-blackboard');
  await p6.getByRole('button', { name: 'Replace', exact: true }).click(); await w6(1000);
  await shot6('72-seat-groups-summary-blackboard');
  await summary6().getByRole('button', { name: 'Go to setup' }).click(); await w6(900);
  await shot6('76-seat-groups-class-view-lab-partners-blackboard');
  ok((await store6())['sl-fx-8c'] === regular0, 'Regular is unchanged in the blackboard run too');
  await ctx6.close();

  {
  /* ── Station rotation (Phase 7): stations list, start rotation, the linked timer, automatic and manual moves,
     the overlay, the Rotate! card, the projector strip, reload, and that no seat is ever written.
     Its own browser profile: the usual fixture plus class 9S (tests/fixtures/stations-class.js) with 4 stations and 4 groups.
     A localStorage key __cpTickMs (read before the app starts) makes the timer's "second" 40 ms for the automatic-move part. */
  console.log('Station rotation: stations list');
  const c9 = require('./fixtures/stations-class.js').build(G5);
  const seed7 = {
    ...FIXTURE.data,
    'ta-classes': JSON.stringify([...JSON.parse(FIXTURE.data['ta-classes']), c9.classObj]),
    'ta-active-class': JSON.stringify('fx-9s'),
    'sl-fx-9s': JSON.stringify(c9.sl), 'gp-fx-9s': JSON.stringify(c9.gp), 'gg-fx-9s': JSON.stringify(c9.gg),
  };
  const ctx7 = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  await ctx7.addInitScript(fixture => {
    try {
      const t = Number(localStorage.getItem('__cpTickMs')); if (t) window.__cpTickMs = t;
      if (localStorage.getItem('classboard-storage') === null) localStorage.setItem('classboard-storage', JSON.stringify(fixture));
    } catch (e) {}
  }, seed7);
  const p7 = await ctx7.newPage();
  p7.on('console', m => { if (m.type() === 'error') problems.push('console (stations): ' + m.text()); });
  p7.on('pageerror', e => problems.push('pageerror (stations): ' + e.message));
  p7.on('dialog', d => d.dismiss());
  const w7 = ms => p7.waitForTimeout(ms);
  const S7 = async k => { const v = (await readStore(p7))[k]; return v === undefined ? undefined : JSON.parse(v); };
  const shot7 = name => p7.screenshot({ path: path.join(SHOT_DIR, name + '.png') });
  const until7 = async (fn, ms = 9000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await fn()) return true; await w7(40); } return false; };
  const manage7 = async () => {
    if (await p7.locator('[title="Add a new desk or table to the room"]').count()) return;
    await p7.locator(manageMenu).click(); await p7.getByText('Manage Seating').click(); await w7(900);
  };
  const seatsOf7 = async () => seatMap(await readStore(p7));
  /* the top tabs toggle once you are out of Manage Seating, so look before clicking */
  const timerOnly7 = async () => {
    if (!(await p7.locator('.cp-onboard').first().isVisible())) await p7.locator(TAB.timer).click();
    await w7(300);
    if (await p7.locator('[title^="Full screen"]').isVisible().catch(() => false)) { await p7.locator(TAB.seating).click(); await w7(300); }
  };
  const seatTab7 = async () => {
    if (!(await p7.locator('[title^="Full screen"]').isVisible().catch(() => false))) await p7.locator(TAB.seating).click();
    await w7(900);
  };
  const barBtn = name => p7.locator('[data-rotation-bar]').getByRole('button', { name });
  const chipAt = id => p7.locator(`[data-station-groups="${id}"]`);
  const [S1, S2, S3, SPC] = c9.stationIds;
  await p7.goto(URL); await w7(1300);
  await manage7();
  const popBtn = p7.getByText('🔄 Stations');
  ok(await popBtn.count() === 1 && await p7.locator('[data-station-row]').count() === 0, 'Manage Seating has a "🔄 Stations (4)" section, collapsed until opened');
  ok((await popBtn.textContent()).includes('(4)'), 'its button counts the 4 stations in this setup');

  // a class with no stations explains how to make one
  await p7.getByText('Grade 6A Test').first().click(); await w7(900);
  await p7.getByText('🔄 Stations').click(); await w7(300);
  ok(await p7.locator('[data-stations-empty]').isVisible() && (await p7.locator('[data-stations-empty]').textContent()).includes('★ Mark as station'), 'with no stations the popover says to select a bench or item, then ★ Mark as station');
  await p7.keyboard.press('Escape'); await p7.mouse.click(700, 800); await w7(200);
  await p7.getByText('Grade 9S Test').first().click(); await w7(900);

  await p7.getByText('🔄 Stations').click(); await w7(400);
  const rowIds = () => p7.locator('[data-station-row]').evaluateAll(els => els.map(e => e.getAttribute('data-station-row')));
  const rowNames = () => p7.locator('[data-station-row] input').evaluateAll(els => els.map(e => e.value));
  ok((await rowIds()).join() === [S1, S2, S3, SPC].join() && (await rowNames()).join() === 'Circuits,Magnets,Heat,Light', 'it lists the 4 stations in order: 1 Circuits, 2 Magnets, 3 Heat, 4 Light (tables and an item together)');
  await shot7('70-stations-popover-whiteboard');
  // rename inline (and put it back); the station's name is saved on the table itself
  await p7.locator('[data-station-row] input').nth(2).fill('Heat lab'); await p7.keyboard.press('Enter'); await w7(700);
  ok((await S7('sl-fx-9s')).pieces.find(p => p.id === S3).station.name === 'Heat lab', 'an inline rename is saved on the station (Heat → Heat lab)');
  await p7.locator('[data-station-row] input').nth(2).fill('Heat'); await p7.keyboard.press('Enter'); await w7(700);
  ok((await S7('sl-fx-9s')).pieces.find(p => p.id === S3).station.name === 'Heat', 'and renamed back');
  // drag to reorder: Light (4th) to the top
  await p7.locator('[data-station-row]').nth(3).dragTo(p7.locator('[data-station-row]').nth(0)); await w7(600);
  ok((await rowIds()).join() === [SPC, S1, S2, S3].join(), 'dragging "Light" to the top reorders the list');
  ok((await S7('setups-fx-9s')).list.find(s => s.id === 'regular').stations.order.join() === [SPC, S1, S2, S3].join(), 'the order is saved on the setup (setups-<class>)');
  await p7.keyboard.press('Escape'); await p7.mouse.click(700, 820); await w7(200);
  await p7.reload(); await w7(1300); await manage7();
  await p7.getByText('🔄 Stations').click(); await w7(400);
  ok((await rowIds()).join() === [SPC, S1, S2, S3].join(), 'after a reload the new order is still there');
  await p7.locator('[data-station-row]').nth(0).dragTo(p7.locator('[data-station-row]').nth(3)); await w7(600);
  ok((await rowIds()).join() === [S1, S2, S3, SPC].join(), 'and dragging it back restores 1, 2, 3, 4');

  console.log('Station rotation: groups taking part');
  const pickNames = () => p7.locator('[data-group-pick]').evaluateAll(els => els.map(e => e.getAttribute('data-group-pick')));
  ok((await pickNames()).join() === 'Group 1,Falcons,Group 3,Owls', 'groups taking part: the last generated groups with their names (Group 1, Falcons, Group 3, Owls)');
  const lastGen = await p7.locator('[data-group-pick]').first().textContent();
  ok(lastGen.includes('Ada') && lastGen.includes('Ben'), 'each shows its members');
  await p7.locator('.cp-pop select').selectOption({ label: 'Saved: Lab trios' }); await w7(300);
  ok((await pickNames()).join() === 'Sparks,Group 2,Volts' && (await p7.getByText(/1 station sits empty each round/).count()) === 1, 'a saved grouping can be used instead; 3 groups at 4 stations says one station sits empty, which is fine');
  await p7.locator('.cp-pop select').selectOption({ label: 'Saved: Five teams' }); await w7(300);
  ok((await pickNames()).length === 5 && await p7.locator('[data-groups-warning]').count() === 0 && await p7.locator('[data-group-pick] input:checked').count() === 4, '5 groups at 4 stations: the first 4 are ticked to begin with');
  await p7.locator('[data-group-pick] input').nth(4).check(); await w7(250);
  const startBtn = p7.getByRole('button', { name: /Start rotation…/ });
  ok(await p7.locator('[data-groups-warning]').isVisible() && await startBtn.isDisabled(), 'ticking a 5th warns "5 groups but only 4 stations" and Start rotation waits');
  await shot7('70b-more-groups-than-stations-whiteboard');
  await p7.locator('[data-group-pick] input').nth(4).uncheck(); await w7(250);
  ok(await p7.locator('[data-groups-warning]').count() === 0 && await startBtn.isEnabled(), 'unticking one clears the warning');
  await p7.locator('.cp-pop select').selectOption({ label: 'Last generated groups' }); await w7(300);
  ok((await pickNames()).join() === 'Group 1,Falcons,Group 3,Owls', 'back to the last generated groups');

  console.log('Station rotation: start rotation (paused)');
  const seatsBefore = await seatsOf7();
  const slBefore = (await readStore(p7))['sl-fx-9s'];
  await startBtn.click(); await w7(400);
  const dlg = p7.locator('[role="dialog"][aria-label="Start rotation"]');
  ok(await dlg.isVisible() && (await p7.getByLabel('Changeover seconds').inputValue()) === '30' && (await p7.getByLabel('Minutes per station').inputValue()) === '5', 'Start rotation opens a dialog: 5 minutes per station, changeover 30 s by default');
  ok(await dlg.getByRole('button', { name: 'Forwards for everyone' }).count() === 1 && await dlg.getByRole('button', { name: 'Alternate directions' }).count() === 1 && await dlg.getByRole('button', { name: 'One full lap' }).count() === 1 && await dlg.getByRole('button', { name: 'Loop' }).count() === 1, 'it offers Forwards / Alternate directions and One full lap / Loop');
  ok((await dlg.locator('[data-rotation-summary]').textContent()).includes('21m 30s'), 'and sums the time up: 4 × 5m + 3 moves of 30s = 21m 30s');
  await shot7('71-start-dialog-whiteboard');
  await dlg.getByRole('button', { name: 'Create paused' }).click(); await w7(700);
  let rot = await S7('rot-fx-9s');
  ok(rot && rot.setupId === 'regular' && rot.stationOrder.join() === [S1, S2, S3, SPC].join() && rot.step === 0 && rot.direction === 'forward' && rot.minutes === 5 && rot.changeover === 30 && rot.loop === false && typeof rot.timerId === 'string', 'rot-fx-9s is saved: setup, station order, step 0, forwards, 5 min, 30 s changeover, the timer\'s id');
  ok(rot.groups.length === 4 && rot.groups.map(g => g.name).join() === 'Group 1,Falcons,Group 3,Owls' && rot.groups[1].studentIds.join() === 's3,s4' && /^#/.test(rot.groups[0].color), 'it keeps each group\'s name, colour and students');
  ok(rot.labels.join('|') === 'Station 1 · Circuits|Station 2 · Magnets|Station 3 · Heat|Station 4 · Light', 'and the station names it used');
  ok(await p7.locator('[data-rotation-bar]').isVisible(), 'the floating bar (Rotate, Back, End rotation) is showing in Manage Seating');
  ok(await p7.getByText(/Rotation started. Its timer is in the Timer tab/).count() === 1, 'a note says where the timer is');

  console.log('Station rotation: the linked timer');
  await timerOnly7();
  const rcard = p7.locator('[data-timer-card]', { hasText: 'Station rotation' });
  ok(await rcard.count() === 1, 'the Timer tab has a "Station rotation" timer');
  const cardText = await rcard.textContent();
  ok(['Station 1 · Circuits', 'Station 2 · Magnets', 'Station 3 · Heat', 'Station 4 · Light'].every(t => cardText.includes(t)) && (cardText.match(/Move!/g) || []).length >= 3, 'its steps are named after the stations, with a "Move!" between each');
  ok((await rcard.getByRole('button', { name: 'Start' }).count()) === 1, 'it was left paused (Start, not Pause)');
  await rcard.locator('[title="Projector view"]').click(); await w7(600);
  const projText = await p7.locator('.cp-onboard').filter({ hasText: 'Exit Display' }).last().innerText();
  ok((projText.match(/05:00/g) || []).length >= 4 && (projText.match(/00:30/g) || []).length >= 3, `in the projector view: four 05:00 station steps and three 00:30 Move! steps (${(projText.match(/05:00/g) || []).length} / ${(projText.match(/00:30/g) || []).length})`);
  const strip = p7.locator('[data-rotation-strip]');
  ok(await strip.isVisible() && (await strip.textContent()).includes('Group 1 → Station 1 · Circuits') && (await strip.textContent()).includes('Owls → Station 4 · Light'), 'the projector timer shows a strip: "Group 1 → Station 1 · Circuits … Owls → Station 4 · Light"');
  await shot7('74-projector-strip-whiteboard');
  await p7.keyboard.press('Escape'); await w7(300);

  console.log('Station rotation: overlay and manual moves');
  await seatTab7();
  const bar = p7.locator('[data-rotation-bar]');
  ok(await bar.isVisible(), 'the bar shows on the class Seating view too');
  const txt = id => chipAt(id).first().textContent();
  ok((await txt(S1)).includes('Group 1') && (await txt(S1)).includes('Ada Pretend') && (await txt(S2)).includes('Falcons') && (await txt(S3)).includes('Group 3') && (await txt(SPC)).includes('Owls'), 'the map shows each group at its station: Group 1 (Ada, Ben) at 1, Falcons at 2, Group 3 at 3, Owls at 4');
  ok((await p7.locator('[data-rotation-next]').textContent()).includes('Next:') && (await p7.locator('[data-rotation-next]').textContent()).includes('Group 1 → Station 2 · Magnets'), 'a "Next: Group 1 → Station 2 · Magnets …" line is above the map');
  await shot7('72-class-view-overlay-whiteboard');
  // Rotate moves everyone on and shows the card; the timer isn't touched
  await barBtn(/^Rotate/).click(); await w7(500);
  ok((await S7('rot-fx-9s')).step === 1 && (await txt(S2)).includes('Group 1') && (await txt(S1)).includes('Owls') && (await txt(SPC)).includes('Group 3'), 'Rotate ↻ moves every group to its next station (step 1: Group 1 at 2, Owls back round to 1)');
  const card = p7.locator('[data-rotate-card]');
  ok(await card.isVisible() && (await card.textContent()).includes('Rotate!') && (await card.textContent()).includes('Group 1 → Station 2 · Magnets'), 'and a big "Rotate! ↻" card lists each group → its new station');
  await shot7('73-rotate-card-whiteboard');
  await card.click(); await w7(300);
  ok(await card.count() === 0, 'a click closes the card');
  await barBtn(/Back/).click(); await w7(400);
  ok((await S7('rot-fx-9s')).step === 0 && (await txt(S1)).includes('Group 1') && await p7.locator('[data-rotate-card]').count() === 0 && await barBtn(/Back/).isDisabled(), '← Back puts everyone back (step 0), with no card, and is switched off at the start');
  await timerOnly7();
  ok((await rcard.getByRole('button', { name: 'Start' }).count()) === 1 && (await rcard.textContent()).includes('Station 1 · Circuits'), 'the timer was never touched: still paused on Station 1');
  await seatTab7();
  // projector view of the class map
  await p7.locator('[title^="Full screen"]').click(); await w7(900);
  ok(await p7.locator('[data-station-groups]').count() >= 4 && await p7.locator('[data-rotation-next]').count() >= 1, 'the class map\'s projector view shows the stations\' groups and the Next line too');
  await shot7('75-class-projector-overlay-whiteboard');
  await p7.keyboard.press('Escape'); await w7(300);

  console.log('Station rotation: end, alternate directions');
  await barBtn('End rotation').click(); await w7(300);
  ok(await p7.getByText('End the rotation? The setup and the timer stay.').isVisible() && (await S7('rot-fx-9s')) !== undefined, 'End rotation asks first (and nothing has been cleared yet)');
  await shot7('76-end-asks-whiteboard');
  await p7.getByRole('button', { name: 'Keep going' }).click(); await w7(300);
  ok((await S7('rot-fx-9s')) !== undefined && await p7.locator('[data-station-groups]').count() === 4, 'Keep going leaves the rotation as it was');
  await barBtn('End rotation').click(); await w7(250);
  await p7.getByRole('button', { name: 'End it' }).click(); await w7(500);
  ok((await S7('rot-fx-9s')) === undefined && await p7.locator('[data-station-groups]').count() === 0 && await p7.locator('[data-rotation-bar]').count() === 0, 'End it clears rot-<class>, the overlay and the bar');
  await timerOnly7();
  ok(!!(await S7('setups-fx-9s')) && await rcard.count() === 1, 'the setup and the timer are still there');
  // a new rotation, alternate directions
  await manage7(); await p7.getByText('🔄 Stations').click(); await w7(400);
  await p7.getByRole('button', { name: /Start rotation…/ }).click(); await w7(300);
  await p7.getByRole('button', { name: 'Alternate directions' }).click(); await w7(200);
  ok((await p7.getByText(/odd number of stations/).count()) === 0, 'no odd-number warning with 4 stations');
  await shot7('71b-start-dialog-alternate-whiteboard');
  await p7.getByRole('button', { name: 'Create paused' }).click(); await w7(600);
  rot = await S7('rot-fx-9s');
  ok(rot.direction === 'alternate' && rot.step === 0, 'Alternate directions is saved on the rotation');
  await seatTab7();
  await barBtn(/^Rotate/).click(); await w7(500);
  ok((await txt(S2)).includes('Group 1') && (await txt(S1)).includes('Falcons') && (await txt(SPC)).includes('Group 3') && (await txt(S3)).includes('Owls'), 'alternate, step 1: Group 1 and Group 3 go forwards (to 2 and 4); Falcons and Owls go backwards (to 1 and 3)');
  await barBtn(/^Rotate/).click(); await w7(400);
  ok((await txt(S3)).includes('Group 1') && (await txt(SPC)).includes('Falcons') && (await txt(S1)).includes('Group 3') && (await txt(S2)).includes('Owls'), 'step 2: Group 1 and Group 3 forwards (to 3 and 1); Falcons and Owls backwards (to 4 and 2). Nobody shares a station');
  await p7.locator('[data-rotate-card]').click().catch(() => {}); await w7(300);

  console.log('Station rotation: reload mid-rotation');
  await p7.reload(); await w7(1300);
  ok((await S7('rot-fx-9s')).step === 2, 'reloading keeps the step (2)');
  await seatTab7();
  ok((await txt(S3)).includes('Group 1') && (await txt(SPC)).includes('Falcons') && (await txt(S1)).includes('Group 3'), 'and the overlay comes back where it was');
  ok((await bar.textContent()).includes('timer not running'), 'the timers are gone after a reload, so the bar says "timer not running"');
  await shot7('77-timer-not-running-whiteboard');
  await barBtn(/Back/).click(); await w7(400);
  ok((await S7('rot-fx-9s')).step === 1 && (await txt(S2)).includes('Group 1'), 'but the manual controls still work (Back → step 1)');
  const seatsMid = await seatsOf7();

  console.log('Station rotation: automatic moves (timer sped up)');
  await barBtn('End rotation').click(); await w7(250); await p7.getByRole('button', { name: 'End it' }).click(); await w7(400);
  await p7.evaluate(() => localStorage.setItem('__cpTickMs', '40'));
  await p7.reload(); await w7(1300);
  await manage7(); await p7.getByText('🔄 Stations').click(); await w7(400);
  await p7.getByRole('button', { name: /Start rotation…/ }).click(); await w7(300);
  await p7.getByLabel('Minutes per station').fill('0.5');
  await p7.getByRole('button', { name: /Start now/ }).click(); await w7(300);
  rot = await S7('rot-fx-9s');
  ok(rot.minutes === 0.5 && rot.step === 0, 'started now: 0.5 min per station (30 ticks of 40 ms), 30 s changeover (also 30 ticks)');
  await seatTab7();
  const stepNow = async () => (await S7('rot-fx-9s'))?.step;
  ok(await until7(async () => (await stepNow()) === 1, 6000), 'when the first station\'s step ends, the step goes up to 1 by itself');
  ok(await until7(async () => await p7.locator('[data-rotate-card]').isVisible(), 1500), 'and the big Rotate! card appears');
  ok((await txt(S2)).includes('Group 1') && (await txt(S1)).includes('Owls'), 'and the overlay moved Group 1 to station 2');
  await shot7('73b-rotate-card-automatic-whiteboard');
  // the Move! step that follows is the time to walk: it must not move anyone again
  const seen = new Set(); const t0 = Date.now();
  while (Date.now() - t0 < 700) { seen.add(await stepNow()); await w7(50); }
  ok(seen.size === 1 && seen.has(1), 'the 30 s Move! step does not move the groups a second time');
  ok(await until7(async () => (await stepNow()) === 2, 5000) && await until7(async () => (await stepNow()) === 3, 5000), 'each later station\'s step ending moves everyone on again (2, then 3)');
  ok(await until7(async () => (await bar.textContent()).includes('timer finished'), 6000), 'at the end of the lap the timer finishes');
  await w7(600);
  ok((await stepNow()) === 3 && (await txt(SPC)).includes('Group 1') && (await txt(S1)).includes('Falcons'), 'the last station does not move anyone (step stays 3: Group 1 at Station 4)');
  // while the timer was sped up the whole time: nobody sat anywhere new
  const seatsEnd = await seatsOf7();
  ok(JSON.stringify(seatsEnd) === JSON.stringify(seatsBefore) && JSON.stringify(seatsMid) === JSON.stringify(seatsBefore), 'no seat assignment changed at any point (every sl- key\'s seats are as they were)');
  ok((await readStore(p7))['sl-fx-9s'] === slBefore, 'sl-fx-9s is byte-for-byte what it was before the rotation started');
  const slKeys = Object.keys(await readStore(p7)).filter(k => k.startsWith('sl-'));
  ok(slKeys.every(k => !k.includes('~')) && slKeys.length === 3, 'and no setup\'s seating key was created or touched along the way');

  console.log('Station rotation: existing timer features');
  await timerOnly7();
  await p7.locator('[data-timer-card]', { hasText: 'Station rotation' }).getByRole('button', { name: 'Dismiss' }).click({ force: true }); await w7(300);
  ok(await p7.locator('[data-timer-card]', { hasText: 'Station rotation' }).count() === 0, 'a finished timer can still be dismissed');
  await p7.locator('[title="Start a fresh 1m timer"]').click(); await p7.locator('[title="Start a fresh 2m timer"]').click(); await w7(300);
  ok(await p7.locator('[data-timer-card]').count() === 2, 'the time presets still make timers');
  await p7.locator('[data-timer-card]').nth(1).dragTo(p7.locator('[data-timer-card]').nth(0)); await w7(500);
  ok(await p7.locator('[data-timer-card]').count() === 1 && (await p7.locator('[data-timer-card]').textContent()).includes('1m → 2m') && await p7.getByRole('button', { name: /Split/ }).count() === 1, 'dragging one timer onto another combines them ("1m → 2m") and offers ✂ Split');
  await p7.keyboard.press('Escape'); await p7.mouse.click(700, 880); await w7(200);
  await p7.getByRole('button', { name: /Split/ }).click(); await w7(500);
  ok(await p7.locator('[data-timer-card]').count() === 2 && (await p7.locator('[data-timer-card]').allTextContents()).join('|').includes('1m') && (await p7.locator('[data-timer-card]').allTextContents()).join('|').includes('2m') && await p7.getByRole('button', { name: /Split/ }).count() === 0, 'Split puts the two timers back');
  await p7.getByRole('button', { name: /Quick/ }).click(); await w7(300);
  await p7.getByRole('button', { name: '▶ Think', exact: true }).click(); await w7(500);
  ok(await p7.locator('[data-timer-card]', { hasText: 'Think' }).getByRole('button', { name: 'Pause' }).count() === 1, '⚡ Quick still starts a running "Think" timer');
  const stepAfterOthers = (await S7('rot-fx-9s'))?.step;
  await w7(1800); // 40 ms ticks: the 1-minute "Think" timer is well through a few steps; none may touch the rotation
  ok((await S7('rot-fx-9s'))?.step === stepAfterOthers, 'ordinary timers running at the same time do not step the rotation');

  console.log('Station rotation: blackboard');
  await p7.evaluate(async () => { await window.storage.set('ta-theme', JSON.stringify('blackboard')); localStorage.removeItem('__cpTickMs'); });
  await p7.reload(); await w7(1300);
  await seatTab7();
  await shot7('72-class-view-overlay-blackboard');
  await p7.getByRole('button', { name: /^Rotate/ }).click(); await w7(600);
  await shot7('73-rotate-card-blackboard');
  await p7.locator('[data-rotate-card]').click(); await w7(300);
  await barBtn('End rotation').click(); await w7(250); await p7.getByRole('button', { name: 'End it' }).click(); await w7(400);
  await manage7(); await w7(300);
  await p7.getByText('🔄 Stations').click(); await w7(500);
  await shot7('70-stations-popover-blackboard');
  await p7.getByRole('button', { name: /Start rotation…/ }).click(); await w7(400);
  await shot7('71-start-dialog-blackboard');
  await p7.getByRole('button', { name: 'Create paused' }).click(); await w7(600);
  await timerOnly7();
  await p7.locator('[data-timer-card]', { hasText: 'Station rotation' }).locator('[title="Projector view"]').click(); await w7(700);
  ok(await p7.locator('[data-rotation-strip]').isVisible(), 'the projector strip shows in blackboard too');
  await shot7('74-projector-strip-blackboard');
  await p7.keyboard.press('Escape'); await w7(300);
  await ctx7.close();
  }

  console.log('Console');
  ok(problems.length === 0, 'no console errors or page errors' + (problems.length ? '\n    ' + problems.join('\n    ') : ''));

  await browser.close();
  server.close();
  console.log(`\n${passes} passed, ${failures} failed. Screenshots: ${SHOT_DIR}`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('Test run crashed:', e); process.exit(1); });
