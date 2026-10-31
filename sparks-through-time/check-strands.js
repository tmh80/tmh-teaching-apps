/* Checks that every review question and build-task question/rubric row carries MYP strands (obj),
   prints each sheet's strands and compares them with the table Tom signed off.
   Run:  node check-strands.js   (needs Playwright; exits 1 on any problem) */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path');
const EXPECT = {
  f: {launch:'A i, ii, iii', atom:'A i, ii, iii', static:'A i, ii, iii · D i, iii', circuits:'A i, ii', electromagnets:'A i, ii, iii · D i, iii', ohm:'A i, ii', generators:'A i, ii · D i, iii', bulb:'A i, ii, iii · D i, ii, iii', series:'A i, ii · D i, iii', acdc:'A i, ii, iii · D i, ii, iii', power:'A i, ii, iii · D i, ii, iii', future:'A i, ii, iii · D i, iii'},
  c: {launch:'A i, ii, iii', atom:'A i, ii, iii', static:'A ii, iii', circuits:'A i, ii · D i, ii, iii', electromagnets:'A i, ii, iii · D i, iii', ohm:'A i, ii', generators:'A i, ii', bulb:'A i, ii · D ii, iii', series:'A i, ii · D i, iii', acdc:'A i, ii, iii · D i, ii, iii', power:'A i, iii · D ii, iii', future:'A i, ii, iii · D i, ii, iii'}
};
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage();
  await pg.addInitScript(() => localStorage.setItem('sparks-through-time-v1', JSON.stringify({studentName:'Check Script', studentClass:'6X'})));
  await pg.goto('file://' + path.resolve(__dirname, 'Sparks-Through-Time.html'));
  const rep = await pg.evaluate(() => {
    const out = {sheets: [], missing: []};
    STOPS.forEach(s => ['f', 'c'].forEach(part => {
      const items = rvItems(s, part);
      items.forEach((it, i) => { if (!it.obj || !it.obj.length) out.missing.push(`${s.id} ${part} Q${i + 1}`); else if (it.obj.some(k => !STRAND_ORDER.includes(k))) out.missing.push(`${s.id} ${part} Q${i + 1} (bad tag)`); });
      out.sheets.push({id: s.id, part, n: items.length, strands: strandsLabel(sheetStrands(s, part))});
    }));
    allTasks().forEach(({ws, t}) => {
      (t.questions || []).forEach((it, i) => { if (!it.obj || !it.obj.length) out.missing.push(`task ${t.id} Q${i + 1}`); });
      (t.marking || []).forEach((r, i) => { if (!r[2] || !r[2].length) out.missing.push(`task ${t.id} rubric row ${i + 1}`); });
      out.sheets.push({id: t.id, part: 'build', n: (t.questions || []).length, strands: strandsLabel(taskStrands(t))});
    });
    return out;
  });
  let bad = rep.missing.length;
  rep.sheets.forEach(x => { const exp = EXPECT[x.part] && EXPECT[x.part][x.id]; const flag = exp === undefined ? '(build task)' : exp === x.strands ? 'ok' : 'DIFFERS from table: ' + exp; if (exp !== undefined && exp !== x.strands) bad++; console.log(`${x.id.padEnd(15)} ${String(x.part).padEnd(6)} ${String(x.n).padStart(2)} q  ${x.strands.padEnd(28)} ${flag}`); });
  if (rep.missing.length) console.log('\nMISSING TAGS:\n' + rep.missing.join('\n'));
  console.log(bad ? `\n${bad} problem(s).` : '\nAll items tagged and every sheet matches the table.');
  await b.close(); process.exit(bad ? 1 : 0);
})();
