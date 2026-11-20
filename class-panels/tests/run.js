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
const URL = 'file://' + path.join(ROOT, 'index.html');

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

  console.log('Building…');
  const buildOut = execSync('node build.js 2>&1', { cwd: ROOT }).toString();
  // one duplicate-key warning in the Seating view is known and left alone
  const warnings = (buildOut.match(/\[WARNING\]/g) || []).length;
  ok(warnings <= 1, `build has no new warnings (${warnings} known)`);

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

  console.log('Console');
  ok(problems.length === 0, 'no console errors or page errors' + (problems.length ? '\n    ' + problems.join('\n    ') : ''));

  await browser.close();
  console.log(`\n${passes} passed, ${failures} failed. Screenshots: ${SHOT_DIR}`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('Test run crashed:', e); process.exit(1); });
