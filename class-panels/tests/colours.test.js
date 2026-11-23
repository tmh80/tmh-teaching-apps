#!/usr/bin/env node
/**
 * Browser checks for table colours (Phase 3c). Builds nothing: run `npm run build` first,
 * then `node tests/colours.test.js`. Fake-named fixture only.
 * Screenshots go to SHOT_DIR (default /tmp/cp-shots-phase3c).
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const SHOT_DIR = process.env.SHOT_DIR || '/tmp/cp-shots-phase3c';
const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'sample-data.json'), 'utf8'));
let passes = 0, failures = 0;
const ok = (c, m) => { if (c) { passes++; console.log('  ok   ' + m); } else { failures++; console.log('  FAIL ' + m); } };
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const srv = http.createServer((q, s) => { s.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); s.end(fs.readFileSync(path.join(ROOT, 'index.html'))); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const URL = `http://127.0.0.1:${srv.address().port}/index.html`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(f => { try { if (localStorage.getItem('classboard-storage') === null) localStorage.setItem('classboard-storage', JSON.stringify(f)); } catch (e) {} }, FIXTURE.data);
  const problems = [];
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') problems.push(m.text()); });
  page.on('pageerror', e => problems.push(e.message));
  page.on('dialog', d => d.dismiss());
  const readStore = () => page.evaluate(() => JSON.parse(localStorage.getItem('classboard-storage') || '{}'));
  const SL = async c => JSON.parse((await readStore())[`sl-${c}`]);
  const shot = n => page.screenshot({ path: path.join(SHOT_DIR, n + '.png') });
  const manageMenu = '[title="Manage seating & groups"]';
  const seatingTab = '[title="See and adjust who\'s sitting where right now."]:visible';
  const openManage = async cls => {
    await page.getByText(cls).first().click(); await wait(300);
    if (await page.locator('[title="Add a new desk or table to the room"]').count()) return;
    await page.locator(manageMenu).click(); await page.getByText('Manage Seating').click(); await wait(800);
  };
  const addFromMenu = async t => { await page.locator('[title="Add a new desk or table to the room"]').click(); await wait(250); await page.locator(`[title^="Add: ${t}"]`).first().click(); await wait(650); };
  const hits = () => page.locator('polygon[title^="Drag to move this table"]');
  const chip = k => page.locator(`[data-cp-colour="${k}"]`);
  const pick = async k => { await chip(k).click(); await wait(700); };
  const tint = k => page.locator(`svg [style*="--cp-table-${k})"]`).count();
  const tinted = () => page.locator('svg [style*="--cp-table-"]').count();
  const roomsBtn = () => page.locator('[title^="Rooms: save this room"]');
  const chairFills = () => page.locator('svg[data-cp="chair"] rect').evaluateAll(rs => rs.map(r => r.getAttribute('style') || '').filter(s => s.includes('fill')).join('|'));

  await page.goto(URL); await wait(800);

  console.log('Table colours: old data');
  await openManage('Grade 6A Test');
  ok(await tinted() === 0, 'old fixture data (no colours) draws every table as plain wood');
  ok(!JSON.stringify(await SL('fx-6a')).includes('"color"'), 'and saves nothing about colours');
  ok(await chip('mint').count() === 0, 'no picker while nothing is selected');

  console.log('Legacy group tables');
  const tabs = page.locator('[title="Select or drag the whole group"]');
  await tabs.nth(0).click(); await wait(250);
  ok(await page.locator('[data-cp-colour]').count() === 12, 'selecting a group tab shows 12 colour chips');
  ok(await chip('mint').getAttribute('title') === 'Colour this table mint', 'each chip says what it does');
  await shot('picker-tab');
  await pick('mint');
  let sl = await SL('fx-6a');
  ok(sl.groups[0].color === 'mint' && sl.groups.slice(1).every(g => !g.color), 'Mint is stored on that group only');
  ok(await tint('mint') === 1, 'the group table is drawn mint');
  await page.locator('[title="Drag to move this desk"]').nth(5).click(); await wait(250);
  ok(await chip('blue').count() === 1, 'a seat that belongs to a group also shows the picker');
  await pick('blue');
  sl = await SL('fx-6a');
  const g2 = sl.groups.find(g => g.seatIds.includes(sl.seats[5].id));
  ok(g2.color === 'blue' && sl.groups.filter(g => g.color).length === 2, "picking from one seat colours that seat's whole table");
  await page.reload(); await wait(900);
  await openManage('Grade 6A Test');
  ok(await tint('mint') === 1 && await tint('blue') === 1, 'colours persist after a reload');
  await tabs.nth(1).click(); await wait(250); await pick('cyan');
  await page.locator('[title="Undo the last change"]').click(); await wait(600);
  ok(await tint('cyan') === 0 && await tint('mint') === 1 && await tint('blue') === 1, 'Undo takes the last colour change back');
  await tabs.nth(0).click(); await wait(250);
  await pick('wood');
  sl = await SL('fx-6a');
  ok(!('color' in sl.groups[0]), 'Wood clears the colour (the field is removed)');
  ok(await tint('mint') === 0, 'and the table is wood again');

  console.log('Class view, Randomise, projector');
  await tabs.nth(1).click(); await wait(250); await pick('coral');
  await tabs.nth(2).click(); await wait(250); await pick('lilac');
  await tabs.nth(3).click(); await wait(250); await pick('green');
  const before = JSON.stringify((await SL('fx-6a')).groups.map(g => g.color || null));
  await page.locator(seatingTab).click(); await wait(800);
  ok(await tint('coral') === 1 && await tint('lilac') === 1, 'the class Seating view draws the colours too');
  await shot('class-view-legacy');
  await page.locator('[title^="Shuffle everyone into new seats"]:visible').first().click(); await wait(900);
  ok(JSON.stringify((await SL('fx-6a')).groups.map(g => g.color || null)) === before, 'Randomise in the class view keeps every colour');
  await page.locator('[title^="Full screen"]').click(); await wait(800);
  ok(await tint('coral') >= 1, 'the full-screen projector view draws them');
  await shot('projector-legacy');
  await page.keyboard.press('Escape'); await wait(300);

  console.log('Match chairs to table colour');
  await openManage('Grade 6A Test');
  ok(!(await chairFills()).includes('--cp-tchair-'), 'by default chairs keep the rotating palette');
  await page.getByText('⚙ Randomize options').click(); await wait(250);
  await page.getByText('Match chairs to table colour').click(); await wait(500);
  const cf = await chairFills();
  ok(cf.includes('--cp-tchair-coral') && cf.includes('--cp-tchair-lilac'), 'turning it on gives coloured tables deeper chairs of their own colour');
  ok(JSON.parse((await readStore())['cp-chairmatch-fx-6a']) === true, 'the setting is stored per class (cp-chairmatch-<class>)');
  await page.mouse.click(700, 60); await wait(200);
  await page.locator(seatingTab).click(); await wait(800);
  ok((await chairFills()).includes('--cp-tchair-coral'), 'the class Seating view uses it too');
  await page.reload(); await wait(900);
  await openManage('Grade 6A Test');
  ok((await chairFills()).includes('--cp-tchair-lilac'), 'and it survives a reload');
  await shot('match-chairs');

  console.log('Table pieces');
  await openManage('Grade 7B Test');
  const firstDesk = await page.locator('[title="Drag to move this desk"]').first().boundingBox();
  const org = [firstDesk.x - 60, firstDesk.y - 60];
  await page.mouse.move(org[0] + 20, org[1] + 45); await page.mouse.down();
  await page.mouse.move(org[0] + 500, org[1] + 400, { steps: 5 }); await page.mouse.move(org[0] + 1000, org[1] + 600, { steps: 5 }); await page.mouse.up();
  await wait(200); await page.keyboard.press('Delete'); await wait(700);
  await addFromMenu('Hexagon');
  await hits().first().scrollIntoViewIfNeeded();
  await hits().first().click({ force: true }); await wait(250);
  ok(await chip('sky').count() === 1, 'picking a table piece shows the picker');
  await pick('sky');
  let s7 = await SL('fx-7b');
  const hexGroup = s7.groups.find(g => g.seatIds.some(id => s7.seats.find(s => s.id === id)?.pieceId));
  ok(hexGroup?.color === 'sky' && s7.pieces.every(p => !p.color), 'a hexagon colours its group (one cluster, one colour), not its pieces');
  ok(await page.locator('polygon[style*="--cp-table-sky)"]').count() === 2, 'both trapezoids of the cluster are drawn sky');
  await shot('picker-hexagon');
  await page.locator('[title^="Pull this piece away"]').click(); await wait(800);
  s7 = await SL('fx-7b');
  const pg = s7.groups.filter(g => g.seatIds.some(id => s7.seats.find(s => s.id === id)?.pieceId));
  ok(pg.length === 2 && pg.filter(g => g.color === 'sky').length === 1 && pg.filter(g => !g.color).length === 1, 'separating a piece: one half keeps sky, the new split half reverts to Wood');
  ok(await page.locator('polygon[style*="--cp-table-sky)"]').count() === 1, 'and only one trapezoid is still drawn sky');
  await addFromMenu('One desk');
  const sp = (await SL('fx-7b')).pieces.slice(-1)[0];
  ok(sp.shape === 'single', 'a single desk was added');
  await chip('gold').click(); await wait(700);
  s7 = await SL('fx-7b');
  ok(s7.pieces.find(p => p.id === sp.id).color === 'gold' && !s7.groups.some(g => g.color === 'gold'), 'a lone one-seat piece keeps its colour on the piece');
  await page.reload(); await wait(900);
  await openManage('Grade 7B Test');
  s7 = await SL('fx-7b');
  ok(s7.pieces.find(p => p.id === sp.id).color === 'gold', 'piece colour persists after a reload');

  console.log('Room library and Randomise');
  await roomsBtn().scrollIntoViewIfNeeded(); await roomsBtn().click(); await wait(350);
  await page.getByText('Save as new room…').click(); await wait(150);
  await page.getByPlaceholder('Room name, e.g. Lab 204').fill('Colour room');
  await page.locator('[title="Save with this name"]').click(); await wait(900);
  const rooms = JSON.parse((await readStore())['ta-rooms']);
  const lay = rooms.find(r => r.name === 'Colour room').layouts[0];
  ok(lay.groups.some(g => g.color === 'sky') && lay.pieces.some(p => p.color === 'gold'), 'saving the layout to a room stores the group and piece colours');
  await hits().first().click({ force: true }); await wait(250); await pick('wood');
  ok(!(await SL('fx-7b')).groups.some(g => g.color), 'colours cleared');
  await roomsBtn().scrollIntoViewIfNeeded(); await roomsBtn().click(); await wait(350);
  await page.locator(`[title^='Use layout "Layout 1"']`).click(); await wait(250);
  await page.getByRole('button', { name: 'Use it' }).click(); await wait(900);
  s7 = await SL('fx-7b');
  ok(s7.groups.some(g => g.color === 'sky') && s7.pieces.some(p => p.color === 'gold'), 'loading the layout again brings the colours back');
  const cols = JSON.stringify([s7.groups.map(g => g.color || null), s7.pieces.map(p => p.color || null)]);
  await page.locator(seatingTab).click(); await wait(800);
  await page.locator('[title^="Shuffle everyone into new seats"]:visible').first().click(); await wait(900);
  const s7b = await SL('fx-7b');
  ok(JSON.stringify([s7b.groups.map(g => g.color || null), s7b.pieces.map(p => p.color || null)]) === cols, 'Randomise in the class view keeps the piece and group colours');

  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
  await browser.close(); srv.close();
  console.log(`\n${passes} passed, ${failures} failed. Screenshots: ${SHOT_DIR}`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('Colour test crashed:', e); process.exit(1); });
