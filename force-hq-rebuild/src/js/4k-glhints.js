/* ===== Part 5 hint tree (Operation Gummy Lift) =====
   Hints are spent: chal.c6e.gl.hints counts them, chal.c6e.gl.hintSeen remembers which ones were opened, so reading one again is free.
   glScore applies "first free, then -1 each, never below 1 if rescued".
   Tier 1: "What I need to find" (formulas and ideas, no answers). Tier 2: "A number or machine I have" (the student's own rig, a blank to fill).
   Tier 3: a worked example with different numbers (last resort). */
const GLH_TOPICS = [['force', 'Smooshy\'s pull'], ['ma', 'Mechanical advantage'], ['hand', 'Hand distance'], ['cable', 'Cable'], ['weight', 'Weight'], ['work', 'Work']];
const GLH_1 = {
  force: ['Smooshy\'s pull is the effort. Effort = load ÷ total mechanical advantage.', 'The load is the Gumdrop\'s weight. A boulder still pinning the ship makes the load bigger.', 'Each leg has its own pull. Look at the hardest one: 60 N is Smooshy\'s limit before the thrusters fire.'],
  ma: ['Mechanical advantage = load ÷ effort.', 'Ramp MA = length ÷ rise. Lever MA = effort arm ÷ load arm. Pulley block MA = number of ropes. Winch MA = its ratio.', 'Parts on the same leg multiply: total MA = ramp MA × ropes × winch. Legs one after another get a pull each, and their heights add.'],
  hand: ['Hand travel on a leg = total MA × the height that leg lifts.', 'Add the hand travel of every leg. Smooshy\'s oxygen lasts for 1,500 m.', 'A bigger MA means a smaller pull but a longer hand travel.'],
  cable: ['Cable length = number of ropes × the distance the load moves along the machine.', 'Cable costs 1 crystal for every 5 m.', 'A screw jack uses no cable.'],
  weight: ['Weight = mass × g.', 'On Glimmer-9, g = 4.2 N/kg and the Gumdrop\'s mass is 1,500 kg.', 'A platform holds the ship\'s weight plus every machine standing on it. Small holds 4,000 N, medium 7,000 N, large 10,000 N.'],
  work: ['Work = force × distance.', 'The work to lift the ship = its weight × the height it climbs. Going down after the crest needs no work.', 'Different machines change the pull and the hand travel. The total work only changes when the height changes.']
};
const GLH_3 = {
  force: 'Worked example with different numbers: a 3,000 N crate lifted by a machine with a total mechanical advantage of 25 needs an effort of 3,000 ÷ 25 = <b>120 N</b>.',
  ma: 'Worked example: a ramp 10 m long rising 2 m has MA 10 ÷ 2 = 5. Add 3 ropes and a ×4 winch, and the total MA = 5 × 3 × 4 = <b>60</b>.',
  hand: 'Worked example: a leg with total MA 60 that lifts the load 2 m needs 60 × 2 = <b>120 m</b> of hand travel. Another leg of 80 m makes 200 m altogether.',
  cable: 'Worked example: a ramp 10 m long with 3 ropes needs 3 × 10 = <b>30 m</b> of cable, which costs 30 ÷ 5 = 6 crystals.',
  weight: 'Worked example: an 800 kg crate on Mars (g = 3.7 N/kg) weighs 800 × 3.7 = <b>2,960 N</b>.',
  work: 'Worked example: lifting a 3,000 N crate through 2 m takes 3,000 × 2 = <b>6,000 J</b>, whichever machine does the lifting.'
};
const GLH = { topic: null, leg: '0' };
const glhSeen = () => glState().hintSeen || {};
function glhSpend(key) {
  const seen = glhSeen(); if (seen[key]) return;
  const st = glState(); seen[key] = true; GLB.save({ id: GLB.mid }, { hints: (st.hints || 0) + 1, hintSeen: seen });
  GLB.ev = glEvaluate(GLB.rig, { hints: glState().hints || 0 }); if (typeof glPaintSide === 'function') glPaintSide();
}
function glhLegName(l) { return l.type === 'ramp' ? `${fmt(l.m.L, 1)} m ramp` : l.type === 'jack' ? 'screw jack' : l.type; }
function glhOptions(topic) {
  const E = GLB.ev, o = (E && E.legs ? E.legs : []).map((l, i) => [String(i), `Leg ${i + 1}: ${glhLegName(l)}`]);
  const bo = E && E.boulder; if ((topic === 'force' || topic === 'ma') && bo && (bo.how === 'lever' || bo.how === 'jack')) o.push(['b', `The boulder's ${bo.how}`]);
  return o;
}
/* the formula with the student's own numbers plugged in, and a blank to fill */
function glhNumbers(topic, key) {
  const E = GLB.ev, f = v => fmt(v, 1), n0 = v => Math.round(v).toLocaleString('en-GB'), B = '<span class="blank"></span>';
  if (topic === 'weight') return [`Weight = mass × g = 1,500 × 4.2 = ${B} N`];
  if (key === 'b') {
    const lv = GLB.rig.parts.find(p => p.role === 'boulder');
    if (lv && lv.type === 'lever') return [`Lever MA = effort arm ÷ load arm = ${f(GL.beam - lv.arm)} ÷ ${f(lv.arm)} = ${B}`, `Pull on the boulder = 252 N ÷ ${B} = ${B} N`];
    return [`Screw jack MA = ${GL.jackMA}`, `Pull on the boulder = 252 N ÷ ${GL.jackMA} = ${B} N`];
  }
  const L = E.legs[+key]; if (!L) return ['Place a machine on the board first, then pick it here.'];
  const mm = L.type === 'ramp' ? `Ramp MA = length ÷ rise = ${f(L.m.L)} ÷ ${f(L.rise)} = ${B}` : L.type === 'lever' ? `Lever MA = effort arm ÷ load arm = ${f(GL.beam - L.m.part.arm)} ÷ ${f(L.m.part.arm)} = ${B}` : L.type === 'jack' ? `Screw jack MA = ${GL.jackMA}` : 'Crane MA = 1';
  const tot = `Total MA = ${L.type === 'jack' ? B : B + (L.ropes > 1 ? ' × ' + L.ropes + ' ropes' : '') + L.winches.map(w => ' × ' + w + ' winch').join('')} = ${B}`;
  if (topic === 'ma') return [mm, tot];
  if (topic === 'force') return [tot, `Pull = load ÷ total MA = ${n0(L.load)} ÷ ${B} = ${B} N`];
  if (topic === 'hand') return [tot, `Hand travel = total MA × rise = ${B} × ${f(L.rise)} m = ${B} m`];
  if (topic === 'cable') return L.type === 'jack' ? ['A screw jack uses no cable.'] : [`Cable = ropes × distance the load moves = ${L.ropes} × ${L.type === 'ramp' ? f(L.m.L) + ' m' : L.type === 'crane' ? f(L.rise) + ' m' : B} = ${B} m`];
  return [`Work = load × height gained = ${n0(L.load)} × ${f(L.rise)} m = ${B} J`];
}
function glMountHints(host) {
  if (!host) return;
  host.innerHTML = `<details class="clue glhint" id="glHint"><summary>💡 Need a hint?</summary><div class="gl"><p class="glnote" id="glhCost"></p>
    <div class="row glchips" role="group" aria-label="What do you need to find?">${GLH_TOPICS.map(t => `<button type="button" class="ghost sm glchip" data-gh="t:${t[0]}">${t[1]}</button>`).join('')}</div><div id="glhBody"></div></div></details>`;
  host.addEventListener('click', e => {
    const b = e.target.closest('[data-gh]'); if (!b) return; const [a, v] = b.dataset.gh.split(':');
    if (a === 't') GLH.topic = v; else if (a === 's1') glhSpend('t1:' + GLH.topic); else if (a === 's2') glhSpend('t2:' + GLH.topic); else if (a === 's3') glhSpend('t3:' + GLH.topic);
    glhPaint();
  });
  host.addEventListener('change', e => { if (e.target.id === 'glhLeg') { GLH.leg = e.target.value; glhPaint(); } });
  const prev = GLB.onChange; GLB.onChange = () => { if (prev) prev(); if ($('#glHint') && $('#glHint').open) glhPaint(); };
  glhPaint();
}
function glhPaint() {
  const body = $('#glhBody'); if (!body) return; const st = glState(), n = st.hints || 0, seen = glhSeen(), t = GLH.topic;
  const cost = n ? 'costs 1 point' : 'is free';
  $('#glhCost').innerHTML = `Pick what you need to find. Opening a hint is spent: the first one is free, then each new one costs 1 point (you have used <b>${n}</b>). Reading one you have already opened is free.`;
  document.querySelectorAll('#glHint .glchip').forEach(b => b.classList.toggle('on', b.dataset.gh === 't:' + t));
  if (!t) { body.innerHTML = ''; return; }
  const ask = (a, txt) => `<div class="row"><button type="button" class="go sm" data-gh="${a}:">${txt} <small>(${cost})</small></button></div>`;
  let h = '';
  if (!seen['t1:' + t]) h = ask('s1', 'Show the hint');
  else {
    h += `<ul class="gl">${GLH_1[t].map(x => `<li>${x}</li>`).join('')}</ul>`;
    if (!seen['t2:' + t]) h += (t === 'weight' || glhOptions(t).length) ? ask('s2', 'Show it with a number or machine I have') : '<p class="glnote">Place a machine on the board first. Then you can ask for a hint that uses your own numbers.</p>';
    else {
      const opts = glhOptions(t); if (opts.length && !opts.some(o => o[0] === GLH.leg)) GLH.leg = opts[0][0];
      h += opts.length || t === 'weight' ? `${t === 'weight' ? '' : `<label>Which one? <select id="glhLeg" aria-label="Which machine or leg">${opts.map(o => `<option value="${o[0]}"${o[0] === GLH.leg ? ' selected' : ''}>${o[1]}</option>`).join('')}</select></label>`}<ul class="gl glplug">${glhNumbers(t, GLH.leg).map(x => `<li>${x}</li>`).join('')}</ul>` : '<p>Place a machine on the board first, then I can use your numbers.</p>';
    }
    if (!seen['t3:' + t]) h += ask('s3', 'Show a worked example (last resort)'); else h += `<p class="glwlive">${GLH_3[t]}</p>`;
  }
  body.innerHTML = h;
}
