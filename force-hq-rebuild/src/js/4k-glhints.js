/* ===== Part 5 hints: a 💡 on every row of the route strip (stage 4, spec section 11) =====
   Three tiers per row, as the old hint tree had them: tier 1 the formulas, tier 2 this row's own numbers with blanks, tier 3 a worked example with different numbers.
   Opening a tier is spent the first time: chal.c6e.gl.hints counts them, chal.c6e.gl.hintSeen remembers which were opened (reading one again is free).
   glScore applies "the first hint is free, then -1 point each". A cell GASA has to help with ("helped") counts as one more hint, through the same glhSpend.
   The row's data (cells, numbers, working) is built in 4p-glwork.js; this file only holds the hint words and the spending. */
const glhSeen = () => glState().hintSeen || {};
function glhSpend(key) {
  const seen = glhSeen(); if (seen[key]) return false;
  const st = glState(); seen[key] = true; GLB.save({ id: GLB.mid }, { hints: (st.hints || 0) + 1, hintSeen: seen });
  GLB.ev = gpEvaluate(GLB.rig, { hints: glState().hints || 0 }); if (typeof glPaintSide === 'function') glPaintSide();
  return true;
}
const GLH_BLANK = '<span class="blank"></span>';
/* tier 1: the formulas this row uses, no numbers */
function glhTier1(row) {
  const L = [], has = k => row.cells.some(c => c.k === k || c.k.startsWith(k));
  if (row.given) {   // a leg with a drag in it: GASA gives the force and the distance
    L.push('Smooshy\'s pull = force ÷ mechanical advantage. GASA gives you the force for this leg.');
    if (has('block')) L.push('Pulley block MA = the number of supporting ropes.');
    if (has('winch')) L.push('Winch MA = its gear ratio.');
    L.push('Rope MA = the pulley block\'s MA × every winch\'s MA, multiplied together.');
    L.push('Hand distance = rope MA × the distance the Gumdrop moves. GASA gives you that distance too.'); return L; }
  if (row.mach === 'ramp') L.push('Ramp MA = length ÷ rise.');
  if (row.mach === 'lever') L.push('Lever MA = effort arm ÷ load arm. The beam is 10 m long, so the effort arm = 10 m − the load arm.');
  if (row.mach === 'crane' || row.key === 'B2') L.push('A crane gantry has a mechanical advantage of 1.');
  if (row.mach === 'jack') L.push('A screw jack has a mechanical advantage of 120.');
  if (has('block')) L.push('Pulley block MA = the number of supporting ropes.');
  if (has('winch')) L.push('Winch MA = its gear ratio.');
  L.push('Total MA = every machine\'s MA multiplied together.');
  if (row.key === 'B' && row.mach === 'lever') L.push('A winch on the lever\'s pulling end locks, so it holds the boulder up when Smooshy lets go.');
  L.push(row.kind === 'boulder' ? 'Smooshy\'s pull = the boulder\'s weight ÷ total MA. The boulder weighs 252 N.' : 'Smooshy\'s pull = the load ÷ total MA. The load is the Gumdrop\'s weight (plus the rock, if it is still stuck on).');
  if (has('hand')) L.push(row.kind === 'boulder' ? 'Hand distance = total MA × the height the crane lifts the boulder.' : 'Hand distance = total MA × the height this leg lifts.');
  if (has('work')) L.push('Work = load × the height this leg lifts.');
  return L;
}
/* tier 2: the same formulas with this row's own numbers, and blanks to fill (row.t2 is built next to the cells in 4p-glwork.js) */
const glhTier2 = row => row.t2;
/* tier 3: a worked example with different numbers */
function glhTier3(row) {
  if (row.given) return 'Worked example with different numbers: a 3,000 N crate is dragged 5 m over rough ground, and the rope needs a force of 1,000 N. It has 4 ropes and a ×5 winch. Rope MA = 4 × 5 = <b>20</b>. Pull = 1,000 ÷ 20 = <b>50 N</b>. Hand distance = 20 × 5 = <b>100 m</b>.';
  if (row.key === 'B2') return 'Worked example with different numbers: a 400 N crate is lifted 3 m by a crane gantry (MA 1) with 2 ropes and a ×5 winch. Total MA = 1 × 2 × 5 = <b>10</b>. Pull = 400 ÷ 10 = <b>40 N</b>. Hand distance = 10 × 3 = <b>30 m</b>.';
  if (row.mach === 'lever') return 'Worked example with different numbers: a 400 N rock on a lever with a load arm of 1 m and an effort arm of 4 m. MA = 4 ÷ 1 = <b>4</b>. Pull = 400 ÷ 4 = <b>100 N</b>.' + (row.kind === 'boulder' ? '' : ' If it lifts the rock 0.5 m, hand distance = 4 × 0.5 = <b>2 m</b> and work = 400 × 0.5 = <b>200 J</b>.');
  if (row.mach === 'jack') return 'Worked example with different numbers: a screw jack (MA 100) lifts a 2,000 N crate 0.5 m. Pull = 2,000 ÷ 100 = <b>20 N</b>. Hand distance = 100 × 0.5 = <b>50 m</b>. Work = 2,000 × 0.5 = <b>1,000 J</b>.';
  if (row.mach === 'crane') return 'Worked example with different numbers: a 4,800 N crate on a crane gantry (MA 1) with 4 ropes and a ×6 winch, lifted 2 m. Total MA = 1 × 4 × 6 = <b>24</b>. Pull = 4,800 ÷ 24 = <b>200 N</b>. Hand distance = 24 × 2 = <b>48 m</b>. Work = 4,800 × 2 = <b>9,600 J</b>.';
  return 'Worked example with different numbers: a 3,000 N crate goes up a 10 m ramp that rises 2 m, with 3 ropes and a ×4 winch. Ramp MA = 10 ÷ 2 = 5. Total MA = 5 × 3 × 4 = <b>60</b>. Pull = 3,000 ÷ 60 = <b>50 N</b>. Hand distance = 60 × 2 = <b>120 m</b>. Work = 3,000 × 2 = <b>6,000 J</b>.';
}
/* the hint box under a row: three buttons that open one tier each (a tier already opened stays open and costs nothing more) */
function glhBoxHTML(row) {
  const st = glState(), n = st.hints || 0, seen = glhSeen(), k = t => `lh:${row.key}:${t}`, cost = n ? 'costs 1 point' : 'is free';
  const ask = (t, txt) => `<div class="row"><button type="button" class="go sm" data-glw="spend:${row.key}:${t}">${txt} <small>(${cost})</small></button></div>`;
  let h = `<p class="glnote">The first hint is free. Each new hint after that costs 1 point (you have used <b>${n}</b>). Opening one again is free.</p>`;
  if (!seen[k(1)]) return h + ask(1, 'Show the formulas');
  h += `<ul class="gl">${glhTier1(row).map(x => `<li>${x}</li>`).join('')}</ul>`;
  h += seen[k(2)] ? `<p class="glnote"><b>With the numbers on this ${row.kind === 'boulder' ? 'boulder row' : 'leg'}:</b></p><ul class="gl glplug">${glhTier2(row).map(x => `<li>${x}</li>`).join('')}</ul>` : ask(2, 'Show it with my numbers');
  h += seen[k(3)] ? `<p class="glwlive">${glhTier3(row)}</p>` : ask(3, 'Show a worked example (last resort)');
  return h;
}
