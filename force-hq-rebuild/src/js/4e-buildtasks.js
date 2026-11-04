/* ===== Build tasks bt1 to bt4: open builds with the machine builder, live checks, a results table, questions about the build and a build sheet =====
   They live in Explore > Workshop > Build tasks. A run counts for a task because wsRecord() stamps it with BT_CUR.
   Each task is also a pseudo-section (BT_SEC, CHDATA.btN.review) so the answer keys, marking schemes, MYP strands and AI feedback text work as for any sheet. */
let BT_CUR = null;
const BT_G = { earth: 9.8, mars: 3.7, moon: 1.6 };
const BT_PRICE_ROUTE = { 0: 0, 6: 10, 9: 20, 15: 40 };
const btCost = r => (BT_PRICE_ROUTE[r.br || 0] || 0) + 15 * (r.bn || 0) + 5 * (r.bw || 0);
const BT_MINMA = { earth: 72, mars: 30, moon: 12 };   // the smallest working total MA on the grid for each world (checked in tests/workshop_numbers.py)
const btPartsTxt = r => { const p = []; if (r.bw) p.push('Winch ×' + r.bw); if (r.bn) p.push('Pulley block, ' + r.bn + ' ropes'); if (r.br) p.push(fmt(r.br, 0) + ' m ramp'); return p.length ? p.join(' + ') : 'No parts (straight up)'; };
const btWorldName = w => ({ earth: 'Earth', mars: 'Mars', moon: 'the Moon' })[w] || w;
const btWorldCap = w => btWorldName(w).replace(/^./, c => c.toUpperCase());
const btSnap = r => ({ n: r.n, bw: r.bw || 0, bn: r.bn || 0, br: r.br || 0, world: r.world || 'earth', ma: r.ma, E: r.E, cable: r.cable, eDist: r.eDist });

const BT = [
  { id: 'bt1', title: 'Lift 200 kg with less than 300 N', mins: 15, goal: 'Design a machine that lifts a heavy load with a small effort, within limits on cable and hand travel.',
    brief: 'Lift a 200 kg crate <b>4 m</b>. The pull must be <b>less than 300 N</b>, there is only <b>16 m of cable</b>, and the job must take <b>40 m of hand travel or less</b>.',
    setup: { mach: 'build', allow: ['build'], lift: 4, loads: { build: { id: 'crate200', N: 1960, name: '200 kg crate', short: 'crate' } }, bRoutes: [[0, 'Straight up']] }, show: ['builder', 'wspull', 'rulers', 'bTotMA', 'bCable', 'bTravel'],
    checks: [['Effort less than 300 N', r => r.E < 300], ['Cable 16 m or less', r => r.cable <= 16 + 1e-9], ['Hand travel 40 m or less', r => r.eDist <= 40 + 1e-9]],
    cols: ['Parts', 'Total MA', 'Effort (N)', 'Cable (m)', 'Hand travel (m)', 'All checks met?'], cells: (r, t) => [btPartsTxt(r), fmt(r.ma, 0), fmt(r.E, 1), fmt(r.cable, 0), fmt(r.eDist, 0), t.runOk(r) ? 'Yes' : 'No'], minRows: 2,
    model: 'Winch ×4 with 2 supporting ropes: total MA = 4 × 2 = 8, so the effort is 245 N, the cable is 8 m and the hand travel is 32 m. Others that pass: winch ×8 or ×10 on its own, or 4 ropes with winch ×2.',
    modelBuild: { bw: 4, bn: 2, br: 0 }, example: { cols: ['Parts', 'Total MA', 'Effort (N)', 'Cable (m)', 'Hand travel (m)', 'All checks met?'], rows: [['Winch ×4 + pulley block, 2 ropes', '8', '245', '8', '32', 'Yes'], ['Winch ×10', '10', '196', '4', '40', 'Yes'], ['Pulley block, 4 ropes', '4', '490', '16', '16', 'No (effort too big)']] },
    qs: [
      { id: 'bt1q1', obj: ['Aii'], type: 'explain', p: 'What is the total mechanical advantage of your best machine? Show how you worked it out.', model: 'Winch ×4 and 2 supporting ropes: total mechanical advantage = 4 × 2 = 8, so the effort is 1,960 ÷ 8 = 245 N.',
        check: ['Gives the total mechanical advantage of their machine (the winch multiplied by the supporting ropes)', 'Works out the effort as 1,960 ÷ the mechanical advantage, and it matches the effort in the sim'] },
      { id: 'bt1q2', obj: ['Aii'], type: 'num', p: 'How much work was done on the crate?', ans: 7840, unit: 'J', units: UNITS_W, tol: 1, work: 'Work = force × distance = 1,960 N × 4 m = 7,840 J', hints: ['Work = force × distance.', 'Use the crate\'s weight, 1,960 N, and the height it rose, 4 m.', 'Type 1960 × 4 into the calculator.'], ladder: true },
      { id: 'bt1q3', obj: ['Aiii'], type: 'explain', p: 'Why can\'t you just use the biggest mechanical advantage possible here?', words: ['mechanical advantage', 'hand travel', 'cable'],
        model: 'Hand travel = mechanical advantage × 4 m, so a mechanical advantage over 10 would need more than 40 m of hand travel. The cable limit also means at most 4 supporting ropes.',
        check: ['Says that hand travel = mechanical advantage × the 4 m lift, so a bigger mechanical advantage means a longer hand travel', 'Uses a limit: the 40 m of hand travel allows a mechanical advantage of 10 at most, or 16 m of cable allows 4 supporting ropes at most'] }],
    marks: [['Build meets all three checks', 3, 'The checklist on the sheet is all ticked and the table shows a build with "Yes" in the last column.'], ['Results table has at least two different builds', 2, 'Two or more different builds are in the table (1 mark for one build).']] },
  { id: 'bt2', title: 'The cheapest crane', mins: 15, goal: 'Find a machine that does the job for the lowest cost, balancing mechanical advantage against price.',
    brief: 'Lift a 500 kg generator <b>3 m</b> onto the loading deck. The pull must be <b>100 N or less</b>, there is <b>60 m of cable</b>, and the budget is <b>120 credits</b>. Can you find the cheapest machine that works? Prices: ramp 6 m = 10, 9 m = 20, 15 m = 40; pulley block = 15 per supporting rope; winch = 5 × its ratio (×2 = 10 … ×10 = 50).',
    setup: { mach: 'build', allow: ['build'], lift: 3, loads: { build: { id: 'gen500', N: 4900, name: '500 kg generator', short: 'generator' } }, bRoutes: [[0, 'Straight up (3 m)'], [6, '6 m ramp'], [9, '9 m ramp'], [15, '15 m ramp']] }, show: ['builder', 'wspull', 'rulers', 'bTotMA', 'bCable', 'bTravel'],
    checks: [['Effort 100 N or less', r => r.E <= 100 + 1e-9], ['Cable 60 m or less', r => r.cable <= 60 + 1e-9], ['Cost 120 credits or less', r => btCost(r) <= 120], ['Bonus: cost 90 credits, the cheapest possible', null, true]],
    bonus: (runs, t) => runs.some(r => t.runOk(r) && btCost(r) === 90),
    cols: ['Parts', 'Total MA', 'Effort (N)', 'Cable (m)', 'Cost (credits)', 'All checks met?'], cells: (r, t) => [btPartsTxt(r), fmt(r.ma, 0), fmt(r.E, 1), fmt(r.cable, 0), String(btCost(r)), t.runOk(r) ? 'Yes' : 'No'], minRows: 3,
    model: '15 m ramp with winch ×10: total MA = 5 × 10 = 50, effort = 4,900 ÷ 50 = 98 N, cable 15 m, cost 40 + 50 = 90 credits. 16 builds pass within 120 credits (the next cheapest is the 9 m ramp with 3 ropes and winch ×6 at 95 credits).',
    modelBuild: { bw: 10, bn: 0, br: 15 }, example: { cols: ['Parts', 'Total MA', 'Effort (N)', 'Cable (m)', 'Cost (credits)', 'All checks met?'], rows: [['Winch ×10 + 15 m ramp', '50', '98', '15', '90', 'Yes'], ['Winch ×6 + pulley block, 3 ropes + 9 m ramp', '54', '90.7', '27', '95', 'Yes'], ['Winch ×10 + pulley block, 2 ropes', '20', '245', '6', '80', 'No (effort too big)']] },
    qs: [
      { id: 'bt2q1', obj: ['Aii'], type: 'explain', p: 'Work out the effort your cheapest working machine needs. Use its total mechanical advantage.', model: '15 m ramp (MA 5) with winch ×10: total MA = 50, effort = 4,900 ÷ 50 = 98 N.',
        check: ['Gives the total mechanical advantage of their cheapest machine (ramp × ropes × winch)', 'Works out the effort as 4,900 ÷ the mechanical advantage, and it matches the sim'] },
      { id: 'bt2q2', obj: ['Aiii'], type: 'explain', p: 'Explain how you brought the cost down.', words: ['mechanical advantage', 'cost', 'credits'],
        model: 'The long ramp gives a mechanical advantage of 5 for 40 credits, and the winch ×10 adds 10 more for 50 credits. Pulley blocks cost 15 credits for every rope, so they were the expensive way to get mechanical advantage here.',
        check: ['Compares mechanical advantage with price (how much mechanical advantage each credit buys)', 'Says which parts were good value (the long ramp and the winch) and which were expensive (each pulley rope costs 15 credits)'] }],
    marks: [['Build meets all three checks', 3, 'The checklist is all ticked and the table shows a build with "Yes".'], ['Results table compares at least three builds with their costs', 2, 'Three or more builds with costs are in the table (1 mark for two).'], ['Found the cheapest build (90 credits)', 1, 'The table or the picture shows a 90-credit build that works.']] },
  { id: 'bt3', title: 'Same MA, three ways', mins: 12, goal: 'Show that different machines with the same mechanical advantage need the same effort and the same hand travel.',
    brief: 'Build <b>three different machines</b> that each have a total mechanical advantage of exactly <b>24</b>, and lift the engine block 2 m with each one. At least one of them must use <b>three parts</b> (a winch, a pulley block and a ramp).',
    setup: { mach: 'build', allow: ['build'], lift: 2, loads: { build: { id: 'engine120', N: 1176, name: '120 kg engine block', short: 'engine block' } }, bRoutes: [[0, 'Straight up (2 m)'], [4, '4 m ramp'], [6, '6 m ramp'], [10, '10 m ramp']] }, show: ['builder', 'wspull', 'rulers', 'bTotMA', 'bCable', 'bTravel'],
    set: true, is24: r => Math.abs(r.ma - 24) < 1e-6, parts: r => (r.br ? 1 : 0) + (r.bn ? 1 : 0) + (r.bw ? 1 : 0),
    checks: [['Three different builds with MA 24, each lifted', (runs, t) => runs.filter(t.is24).length >= 3], ['At least one build uses three parts', (runs, t) => runs.filter(t.is24).some(r => t.parts(r) === 3)]],
    cols: ['Parts', 'Total MA', 'Effort (N)', 'Cable (m)', 'Hand travel (m)'], cells: r => [btPartsTxt(r), fmt(r.ma, 0), fmt(r.E, 1), fmt(r.cable, 0), fmt(r.eDist, 0)], minRows: 3, auto: (runs, t) => runs.filter(t.is24),
    model: 'Three that work: 4 ropes with winch ×6 (cable 8 m); 3 ropes with winch ×8 (cable 6 m); 6 m ramp with 2 ropes and winch ×4 (cable 12 m, three parts). Every one needs 49 N and 48 m of hand travel.',
    modelBuild: { bw: 4, bn: 2, br: 6 }, example: { cols: ['Parts', 'Total MA', 'Effort (N)', 'Cable (m)', 'Hand travel (m)'], rows: [['Winch ×6 + pulley block, 4 ropes', '24', '49', '8', '48'], ['Winch ×8 + pulley block, 3 ropes', '24', '49', '6', '48'], ['Winch ×4 + pulley block, 2 ropes + 6 m ramp', '24', '49', '12', '48']] },
    qs: [
      { id: 'bt3q1', obj: ['Aiii'], type: 'explain', p: 'Look at your results table. What do you notice about the effort and the hand travel for your three machines? Explain why.', words: ['mechanical advantage', 'effort', 'hand travel'],
        model: 'They were the same every time: 49 N and 48 m. The effort is the load ÷ the mechanical advantage and the hand travel is the mechanical advantage × 2 m, and the mechanical advantage was 24 each time. Only the cable changed.',
        check: ['Says the effort (49 N) was the same for all three machines, and so was the hand travel (48 m)', 'Explains it using the mechanical advantage: effort = load ÷ MA and hand travel = MA × 2 m, and the MA was 24 each time'] },
      { id: 'bt3q2', obj: ['Aii'], type: 'explain', p: 'Explain why the cable needed was different for each machine.', model: 'Cable = supporting ropes × route length, so builds with more ropes or a longer ramp need more cable, even when the mechanical advantage is the same.',
        check: ['Says cable = the number of supporting ropes × the route length', 'Says builds with more ropes or a longer ramp need more cable, even with the same mechanical advantage'] }],
    marks: [['Three different builds with MA 24', 3, 'The table shows three different builds, each with a total MA of 24 (1 mark for each build).'], ['One build uses three parts', 1, 'One of the three builds has a winch, a pulley block and a ramp.'], ['Results table complete', 1, 'The table has all three builds with effort, cable and hand travel filled in.']] },
  { id: 'bt4', title: 'Lift it on three worlds', mins: 15, goal: 'Use weight = mass × g to design a machine for different worlds, and explain why the same load needs a different mechanical advantage on each.',
    brief: 'The Gummy Rover (400 kg) has to be loaded <b>2 m</b> up onto a lander on three different worlds. On each one, the pull must be <b>60 N or less</b> and the cable <b>40 m or less</b>. Build a machine for each world, using the <b>smallest mechanical advantage you can</b>. Work out the rover\'s weight and the mechanical advantage needed for each world, and type them in the table.',
    setup: { mach: 'build', allow: ['build'], lift: 2, mass: 400, worldPick: true, worldOpts: ['earth', 'mars', 'moon'], loads: { build: { id: 'rover4', N: 3920, name: '400 kg Gummy Rover', short: 'rover' } }, bRoutes: [[0, 'Straight up (2 m)'], [4, '4 m ramp'], [6, '6 m ramp'], [10, '10 m ramp']] }, show: ['wsworld', 'builder', 'wspull', 'rulers', 'bTotMA', 'bCable', 'bTravel'],
    set: true, worlds: ['earth', 'mars', 'moon'], runOkW: r => r.E <= 60 + 1e-9 && r.cable <= 40 + 1e-9,
    checks: [['Works on Earth', (runs, t) => runs.some(r => r.world === 'earth' && t.runOkW(r))], ['Works on Mars', (runs, t) => runs.some(r => r.world === 'mars' && t.runOkW(r))], ['Works on the Moon', (runs, t) => runs.some(r => r.world === 'moon' && t.runOkW(r))], ['Bonus: the smallest working MA found on at least one world', null, true]],
    bonus: (runs, t) => runs.some(r => t.runOkW(r) && Math.abs(r.ma - BT_MINMA[r.world]) < 1e-6),
    cols: ['World', 'g (N/kg)', 'Rover\'s weight (N)', 'MA needed', 'Your build', 'Total MA', 'Effort (N)'], minRows: 3,
    model: 'Earth: 6 m ramp + 3 ropes + winch ×8 (MA 72, 54.4 N). Mars: 3 ropes + winch ×10 (MA 30, 49.3 N). The Moon: 2 ropes + winch ×6 (MA 12, 53.3 N). The smallest working MA on the grid: Earth 72, Mars 30, the Moon 12.',
    modelBuild: { bw: 8, bn: 3, br: 6 }, example: { cols: ['World', 'g (N/kg)', 'Rover\'s weight (N)', 'MA needed', 'Your build', 'Total MA', 'Effort (N)'], rows: [['Earth', '9.8', '3,920', '65.3', 'Winch ×8 + 3 ropes + 6 m ramp', '72', '54.4'], ['Mars', '3.7', '1,480', '24.7', 'Winch ×10 + 3 ropes', '30', '49.3'], ['The Moon', '1.6', '640', '10.7', 'Winch ×6 + 2 ropes', '12', '53.3']] },
    qs: [
      { id: 'bt4q1', obj: ['Aii'], type: 'explain', p: 'Which world needed the biggest mechanical advantage? Explain why, using weight = mass × g.', words: ['weight', 'mass', 'gravity'],
        model: 'Earth. The rover\'s mass is 400 kg everywhere, but Earth\'s g is the biggest, so its weight is 400 × 9.8 = 3,920 N, and it needs a mechanical advantage of at least 3,920 ÷ 60 = 65.3.',
        check: ['Says Earth needed the biggest mechanical advantage', 'Explains with weight = mass × g: the mass is the same on every world but Earth\'s g is the biggest, so the rover weighs the most there'] },
      { id: 'bt4q2', obj: ['Aii'], type: 'num', p: 'Work out the smallest mechanical advantage that would do the job on the Moon (a pull of 60 N or less).', ans: 10.7, unit: '', tol: 0.1, work: 'Weight = 400 × 1.6 = 640 N, so the mechanical advantage must be at least 640 ÷ 60 = 10.7', hints: ['First find the rover\'s weight on the Moon: weight = mass × g.', 'g on the Moon is 1.6 N/kg, so 400 × 1.6 = 640 N.', 'Mechanical advantage = load ÷ effort, so divide 640 by 60.'], ladder: true }],
    marks: [['Working build on all three worlds', 3, 'The table shows a build on each world with an effort of 60 N or less (1 mark for each world).'], ['Weights and MAs needed typed correctly in the table', 3, 'Weights 3,920 N, 1,480 N and 640 N, and MAs needed 65.3, 24.7 and 10.7 (accept within 0.2). 1 mark for each world with both right.']] }
];
const btById = id => BT.find(t => t.id === id);
const BT_SEC = {};
BT.forEach(t => {
  BT_SEC[t.id] = { id: t.id, n: 6, part: 'Build task ' + t.id.slice(2), title: t.title, stamp: '', needs: 'c6d', isBT: true };
  CHDATA[t.id] = { goal: t.goal, vocab: ['mechanical advantage', 'effort', 'hand travel', 'cable'], steps: [], review: t.qs.concat(t.marks.map((m, i) => ({ id: t.id + 'm' + i, type: 'build', p: m[0], marks: m[1], how: m[2] }))) };
  t.runOk = r => t.checks.filter(c => !c[2] && c[1] && c[1].length <= 1).every(c => c[1](r));
});
BT[3].runOk = BT[3].runOkW;
QLABEL.build = 'Build mark';
const isBT = id => !!BT_SEC[id];
const btRuns = id => { const seen = new Map(); runsAll().filter(r => r.scene === 'shop' && r.bt === id && !r.live && !r.capped).forEach(r => seen.set(`${r.br || 0}-${r.bn || 0}-${r.bw || 0}-${r.world || 'earth'}`, r)); return [...seen.values()]; };
const btDoneAll = () => dbGet('btd', {});
/* what the checks say right now: { runs, ref, chips: [{t, ok, bonus}], pass } */
function btState(t) {
  const runs = btRuns(t.id), good = runs.filter(r => t.set ? false : t.runOk(r)), ref = t.set ? null : (good.length ? good[good.length - 1] : runs[runs.length - 1] || null);
  const chips = t.checks.map(c => {
    const bonus = !!c[2]; let ok;
    if (bonus) ok = t.bonus(runs, t);
    else if (t.set) ok = c[1](runs, t);
    else ok = !!(ref && c[1](ref));
    return { t: c[0], ok: !!ok, bonus };
  });
  return { runs, ref, chips, pass: chips.filter(c => !c.bonus).every(c => c.ok) };
}
const btRowsOf = t => { const sv = dbGet('btt.' + t.id, { rows: [] }); return t.auto ? t.auto(btRuns(t.id), t).map(btSnap) : sv.rows; };
const btTyped = () => dbGet('btt.bt4', { typed: {} }).typed || {};
const BT_RIGHT = { earth: { w: 3920, m: 65.3 }, mars: { w: 1480, m: 24.7 }, moon: { w: 640, m: 10.7 } };
const btTypedOk = (w, k) => { const v = parseNum(String((btTyped()[w] || {})[k] || '')); if (isNaN(v)) return null; return k === 'w' ? Math.abs(v - BT_RIGHT[w].w) <= 1 : Math.abs(v - BT_RIGHT[w].m) <= 0.2; };
/* the table rows of a task as { cells[], extra } for the rail and the sheets; bt4 is one row per world */
function btTableRows(t, st) {
  if (t.id === 'bt4') return t.worlds.map(w => { const R = st.runs.filter(r => r.world === w && t.runOkW(r)).sort((a, b) => a.ma - b.ma)[0] || st.runs.filter(r => r.world === w).slice(-1)[0] || null, ty = btTyped()[w] || {};
    return { w, typed: ty, run: R, cells: [btWorldCap(w), String(BT_G[w]), ty.w || '', ty.m || '', R ? btPartsTxt(R) : '', R ? fmt(R.ma, 0) : '', R ? fmt(R.E, 1) : ''] }; });
  return btRowsOf(t).map(s => ({ run: s, cells: t.cells(s, t) }));
}

/* ---------- a picture of a build, for the sheets: your pull -> slots -> the load ---------- */
function btPicSVG(b, t) {
  const slots = []; if (b.bw) slots.push(['Slot 1', 'Winch ×' + b.bw]); if (b.bn) slots.push(['Slot 2', 'Pulley block', b.bn + ' ropes']); slots.push(['Slot 3', b.br ? fmt(b.br, 0) + ' m ramp' : 'Straight up']);
  const n = slots.length, w = 760, bw = Math.min(150, (w - 40 - (n + 1) * 30) / (n + 1)), gap = 30, y = 20;
  let x = 10, s = `<svg viewBox="0 0 ${w} 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:150mm;height:auto" role="img" aria-label="The machine build: ${esc(slots.map(q => q.slice(1).join(' ')).join(', then '))}">`;
  const box = (lab, l1, l2, fill) => { const e = `<rect x="${x}" y="${y}" width="${bw}" height="60" rx="8" fill="${fill}" stroke="#13212a" stroke-width="1.5"/><text x="${x + bw / 2}" y="${y + 17}" text-anchor="middle" font-size="11" fill="#555">${esc(lab)}</text><text x="${x + bw / 2}" y="${y + 36}" text-anchor="middle" font-size="13" font-weight="700" fill="#13212a">${esc(l1)}</text>${l2 ? `<text x="${x + bw / 2}" y="${y + 52}" text-anchor="middle" font-size="12" fill="#13212a">${esc(l2)}</text>` : ''}`; x += bw + gap; return e; };
  const arrow = () => `<path d="M${x - gap + 4} ${y + 30} L${x - 6} ${y + 30} M${x - 12} ${y + 24} L${x - 6} ${y + 30} L${x - 12} ${y + 36}" stroke="#13212a" stroke-width="2" fill="none"/>`;
  s += box('Start', 'Your pull', '', '#f6e7b4'); slots.forEach(q => { s += arrow(); s += box(q[0], q[1], q[2] || '', '#d7e6f1'); }); s += arrow(); s += `<text x="${x + 4}" y="${y + 36}" font-size="13" font-weight="700" fill="#13212a">Load</text>`;
  return s + '</svg>';
}

/* ---------- the worksheet for a build task: blank, student's, answer key ---------- */
function btCheckBox(ok, mode) { return mode === 'student' ? (ok ? '<span class="stu">☑</span>' : '☐') : mode === 'key' ? '<span class="key">☑</span>' : '☐'; }
function btTableHTML(t, mode, st) {
  const stu = mode === 'student', key = mode === 'key', W = x => stu ? `<span class="stu">${esc(x)}</span>` : key ? `<span class="key">${esc(x)}</span>` : esc(x);
  let rows;
  if (key) rows = t.example.rows; else if (stu) rows = btTableRows(t, st).map(r => r.cells); else rows = [];
  const need = Math.max(t.minRows, rows.length), cols = key ? t.example.cols : t.cols;
  return `<table><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr>${Array.from({ length: need }, (_, i) => `<tr>${cols.map((_, j) => `<td style="height:22px">${rows[i] && rows[i][j] != null ? W(rows[i][j]) : ''}</td>`).join('')}</tr>`).join('')}</table>`;
}
function btWorksheet(id, mode) {
  const t = btById(id), ch = BT_SEC[id], stu = mode === 'student', key = mode === 'key', st = btState(t), qs = t.qs, store = dbGet('btq.' + id, {});
  const pic = key ? btPicSVG(t.modelBuild, t) : stu && st.ref ? btPicSVG(btSnap(st.ref), t) : (stu && t.set && st.runs.length ? btPicSVG(btSnap(st.runs[st.runs.length - 1]), t) : '');
  const picHTML = pic ? `<div class="qfig ${stu ? 'stu' : 'key'}" style="border:none">${pic}</div>` : '<div class="box" style="min-height:60px"></div><p class="note">Draw your build: your pull, then each part in its slot, then the load.</p>';
  let h1 = `<div class="page">${wsHeader(ch, 'Build sheet', mode)}<h2>The task: ${esc(t.title)}</h2><div class="q"><p style="margin:0">${t.brief}</p></div>
    <h2>Part A: My build</h2><div class="q"><div class="qh">${key ? 'Model build' : 'Picture of my build'}${stu ? '<span>from the sim</span>' : ''}</div>${picHTML}${key ? `<p class="key">${t.model}</p>` : ''}</div>
    <div class="q"><div class="qh">Checklist${stu ? '<span>a blue tick means the sim checked it</span>' : ''}</div>${t.checks.map((c, i) => `<div class="opt">${btCheckBox(stu ? st.chips[i].ok : true, mode)} ${esc(c[0])}</div>`).join('')}</div>
    <div class="q"><div class="qh">${key ? 'Example results (students\' will differ)' : 'My results'}</div>${btTableHTML(t, mode, st)}${key && t.id === 'bt4' ? '<p class="note">Accept any build that works on each world. Weights 3,920 N, 1,480 N and 640 N; MAs needed 65.3, 24.7 and 10.7 (accept within 0.2).</p>' : ''}${stu && t.id === 'bt4' ? '<p class="note">The weight and the MA needed were typed by the student in the sim.</p>' : ''}</div>
    <h2>Part B: Questions about my build</h2>${qs.map((q, i) => wsQuestion(q, i, mode, store[q.id])).join('')}`;
  if (key) h1 += `<div class="q"><div class="qh">Marking the build</div>${t.marks.map(m => `<p style="margin:2px 0"><b>${m[1]} mark${m[1] > 1 ? 's' : ''}:</b> ${esc(m[0])}. ${esc(m[2])}</p>`).join('')}</div>`;
  h1 += '</div>';
  if (stu) h1 += btFeedbackPage(t, st);
  return `<div class="ws">${h1}</div>`;
}
function btFeedbackPage(t, st) {
  const store = dbGet('btq.' + t.id, {}), done = t.qs.filter(q => store[q.id] && store[q.id].done).length, pts = t.qs.reduce((a, q) => a + qPoints(q, store[q.id]).score, 0), mx = t.qs.reduce((a, q) => a + qMarks(q), 0), ch = BT_SEC[t.id];
  return `<div class="page">${wsHeader(ch, 'Feedback page', 'student')}<h2>How I did in the sim</h2><table><tr><th>Part</th><th>Result</th></tr>
    <tr><td>Build checklist</td><td class="stu">${st.chips.filter(c => !c.bonus && c.ok).length} of ${st.chips.filter(c => !c.bonus).length} checks complete${st.chips.some(c => c.bonus && c.ok) ? ' · bonus earned' : ''}</td></tr>
    <tr><td>Builds tried</td><td class="stu">${st.runs.length}</td></tr><tr><td>Questions answered</td><td class="stu">${done} of ${t.qs.length}</td></tr><tr><td>Question points in the sim</td><td class="stu">${pts} of ${mx}</td></tr></table>
    <h2>Teacher's feedback</h2><p class="note">Leave comments on Toddle.</p></div>`;
}
function makeBtSheet(id) {
  if (!user().name && !isTeacher()) { toast('Type your name first, so your teacher knows whose worksheet it is.'); askWho(false); return; }
  openSheet(id, 'student');
}

/* ---------- Explore > Workshop ---------- */
const exploreShopOpen = () => WORKSHOP_OPEN && (isTeacher() || !!dbGet('stamps', {}).c6a);
const btOpen = () => WORKSHOP_OPEN && (isTeacher() || !!dbGet('stamps', {}).c6d);
const BT_FREE = { mach: 'lever', allow: ['lever', 'pulley', 'winch', 'ramp', 'wedge', 'screw', 'build'], classPick: true, rampH: true, load: 294, mass: 30, massOpts: [10, 30, 60, 120, 200, 400, 1000], loadName: '30 kg load', loadShort: 'load', loadId: 'mass30', worldPick: true, lifts: { build: 2 }, maxTravel: 1.5,
  bRoutes: [[0, 'Straight up'], [4, '4 m ramp'], [6, '6 m ramp'], [10, '10 m ramp'], [15, '15 m ramp']] };
const BT_FREE_SHOW = ['wsmach', 'wsload', 'wsworld', 'wsctl', 'wspull', 'readMA', 'readWork', 'rulers', 'builder', 'mfric', 'readEff', 'bTotMA', 'bCable', 'bTravel'];
let BT_TAB = 'free', BT_TASK = 'bt1', BT_SIG = '';
function openExploreShop(tab, tid) {
  BT_TAB = tab === 'tasks' && btOpen() ? 'tasks' : 'free'; if (tid && btById(tid)) BT_TASK = tid;
  const t = BT_TAB === 'tasks' ? btById(BT_TASK) : null;
  show('vExplore'); placeLab($('#exploreHost')); exploreHead('Explore · Workshop', 'Workshop sandbox');
  BT_CUR = null; shopStage(t ? t.setup : BT_FREE); S.flags = newFlags(); resetSim(); BT_CUR = t ? t.id : null; BT_SIG = '';
  LAB.mode = 'explore'; LAB.show = new Set(t ? t.show : BT_FREE_SHOW); LAB.sides = []; LAB.pullers = []; LAB.floors = null; LAB.idle = null; LAB.onChange = null;
  applyPanels(); $('#qCard').hidden = true; $('#dataCard').hidden = true; hideCards(); closeDesk(); btRail();
  LAB.tick = () => { if (BT_TAB !== 'tasks') return; const t2 = btById(BT_TASK), st = btState(t2), sig = st.runs.length + '|' + st.chips.map(c => +c.ok).join(''); if (sig !== BT_SIG) { BT_SIG = sig; btRail(true); } };
}
function btRail(keep) {
  const rail = $('#rail'); if (!rail) return; const open = btOpen();
  const sw = `${exploreSwitch('shop')}<div class="seg two" role="group" aria-label="Free workshop or build tasks" style="margin-bottom:8px"><button type="button" data-btab="free" aria-pressed="${BT_TAB === 'free'}">Free workshop</button><button type="button" data-btab="tasks" aria-pressed="${BT_TAB === 'tasks'}">Build tasks${open ? '' : ' 🔒'}</button></div>`;
  if (BT_TAB !== 'tasks') {
    const rescue = !!dbGet('stamps', {}).c6e || isTeacher();
    rail.innerHTML = `${sw}<span class="lbl">Explore · Workshop</span><h2>Build anything</h2><p class="gl">Every machine, the machine builder and every readout are switched on. Pick any machine, any load and any world, and choose a perfect or a real machine. The load is a mass in kilograms, so it weighs less on the Moon.</p>${open ? '' : '<p class="scaleNote">🔒 The <b>Build tasks</b> open when you finish Part 4 (Compound machines).</p>'}${rescue ? '<div class="row"><button type="button" class="ghost" data-btresc>Try the rescue again</button></div>' : ''}`;
  } else {
    const t = btById(BT_TASK), st = btState(t), done = btDoneAll();
    if (st.pass && !done[t.id]) { done[t.id] = true; dbSet('btd', done); addEvidence('challenge', `Build task: ${t.title}`); toast('Build task done! All the checks are green.', 'good'); }
    const rows = btTableRows(t, st), nq = t.qs.length;
    rail.innerHTML = `${sw}<div class="seg" style="margin-bottom:6px;grid-template-columns:repeat(4,minmax(0,1fr))">${BT.map(x => `<button type="button" data-bttask="${x.id}" aria-pressed="${x.id === t.id}">${done[x.id] ? '✓ ' : ''}Task ${x.id.slice(2)}</button>`).join('')}</div>
      <span class="lbl">Build task · about ${t.mins} minutes</span><h2>${t.title}</h2><p class="gl"><b>Goal:</b> ${t.goal}</p><p class="gl">${t.brief}</p>
      <div class="lbl">Live checks</div><ul class="tasks gl" id="btChecks">${st.chips.map(c => `<li class="${c.ok ? 'ok' : ''}"><span class="box">✓</span><span>${c.t}${c.bonus ? ' (not needed to pass)' : ''}</span></li>`).join('')}</ul>
      ${st.pass ? '<p class="fb ok">All the checks are green. Now fill in your results and answer the questions.</p>' : '<p class="scaleNote">Build, then press <b>Pull!</b>. A check turns green only when a real run passes it.</p>'}
      <div class="lbl">My results</div>${btRailTable(t, st, rows)}
      <div class="lbl">Questions about my build</div><div id="btQs"></div>
      <div class="row" style="flex-wrap:wrap"><button type="button" class="go" data-btsheet="student">Make my build sheet</button><button type="button" class="ghost" data-btsheet="blank">Blank sheet</button>${isTeacher() || unlocked() ? '<button type="button" class="ghost" data-btsheet="key">Answer key</button>' : ''}</div>`;
    const host = $('#btQs', rail); t.qs.forEach(q => renderQuestion(host, q, { store: 'btq.' + t.id, mode: 'review', onDone: () => { } }));
  }
  rail.onclick = btClick;
}
function btRailTable(t, st, rows) {
  if (t.id === 'bt4') return `<table class="bttab"><tr>${t.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr>${rows.map(r => { const ok1 = btTypedOk(r.w, 'w'), ok2 = btTypedOk(r.w, 'm'), cl = v => v == null ? '' : v ? ' class="okc"' : ' class="badc"';
    return `<tr><td>${r.cells[0]}</td><td>${r.cells[1]}</td><td${cl(ok1)}><input type="text" inputmode="decimal" data-bttype="${r.w}:w" value="${esc(r.typed.w || '')}" aria-label="Rover's weight on ${btWorldName(r.w)} in newtons" style="width:70px"></td><td${cl(ok2)}><input type="text" inputmode="decimal" data-bttype="${r.w}:m" value="${esc(r.typed.m || '')}" aria-label="Mechanical advantage needed on ${btWorldName(r.w)}" style="width:60px"></td><td>${esc(r.cells[4])}</td><td>${r.cells[5]}</td><td>${r.cells[6]}</td></tr>`; }).join('')}</table><p class="scaleNote">The last three columns fill in from your best working run on each world.</p>`;
  const body = rows.map((r, i) => `<tr>${r.cells.map(c => `<td>${esc(c)}</td>`).join('')}${t.auto ? '' : `<td><button type="button" class="mini" data-btrm="${i}" aria-label="Remove this row">✕</button></td>`}</tr>`).join('');
  const last = st.runs[st.runs.length - 1], add = !t.auto && last && !btRowsOf(t).some(s => s.n === last.n) ? `<div class="row"><button type="button" class="go sm" data-btadd>Add my last build to my table</button></div>` : '';
  return `<table class="bttab"><tr>${t.cols.map(c => `<th>${esc(c)}</th>`).join('')}${t.auto ? '' : '<th></th>'}</tr>${body || `<tr><td colspan="${t.cols.length + 1}" class="scaleNote">${t.auto ? 'Your builds with MA 24 appear here by themselves.' : 'Nothing here yet. Press Pull!, then add the build to your table.'}</td></tr>`}</table>${add}<p class="scaleNote">${t.auto ? '' : `Add at least ${t.minRows} different builds, so you can compare them.`}</p>`;
}
function btClick(e) {
  const tg = e.target.closest('[data-btab]'); if (tg) { openExploreShop(tg.dataset.btab); return; }
  const tk = e.target.closest('[data-bttask]'); if (tk) { BT_TASK = tk.dataset.bttask; openExploreShop('tasks', BT_TASK); return; }
  if (e.target.closest('[data-btresc]')) { openChapter('c6e', 'challenge'); return; }
  const t = BT_TAB === 'tasks' ? btById(BT_TASK) : null; if (!t) return;
  if (e.target.closest('[data-btadd]')) { const st = btState(t), last = st.runs[st.runs.length - 1]; if (!last) return; const sv = dbGet('btt.' + t.id, { rows: [] }); if (!sv.rows.some(s => s.n === last.n)) sv.rows.push(btSnap(last)); dbSet('btt.' + t.id, sv); btRail(true); return; }
  const rm = e.target.closest('[data-btrm]'); if (rm) { const sv = dbGet('btt.' + t.id, { rows: [] }); sv.rows.splice(+rm.dataset.btrm, 1); dbSet('btt.' + t.id, sv); btRail(true); return; }
  const sh = e.target.closest('[data-btsheet]'); if (sh) { const m = sh.dataset.btsheet; if (m === 'student') makeBtSheet(t.id); else openSheet(t.id, m); }
}
document.addEventListener('change', e => { const i = e.target.closest && e.target.closest('[data-bttype]'); if (!i) return; const [w, k] = i.dataset.bttype.split(':'), sv = dbGet('btt.bt4', { typed: {} }); sv.typed = sv.typed || {}; sv.typed[w] = Object.assign({}, sv.typed[w], { [k]: i.value.trim() }); dbSet('btt.bt4', sv); if (BT_TAB === 'tasks') btRail(true); });
