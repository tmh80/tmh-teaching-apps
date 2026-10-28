/* ===== Chapter 3: F = ma (Newton's second law), all in the Snow Arena =====
   Foundation (a1–a6): friction OFF for the first steps, so the husky pull is the whole resultant force.
   Friction comes back in a5, with a second disclaimer. Extension (e1–e3) and the mail-run Challenge use the resultant every time. */

/* ---- the student's own sled runs (saved in the Runs tab, so a question never forces a re-run) ---- */
const sledRun = (n, m, fl) => { const R = runsFor().filter(r => r.scene === 'sled' && r.nR === n && r.mass === m && r.floor === fl && r.a != null); return R.length ? R[R.length - 1] : null; };
const rA = (n, m, fl) => { const r = sledRun(n, m, fl); return r ? r.a : null; };
const rFr = (n, m, fl) => { const r = sledRun(n, m, fl); return r ? r.frS : null; };
const rV = (n, m, fl, k) => { const r = sledRun(n, m, fl); return r ? r['v' + k] : null; };
const rHas = (n, m, fl) => sledRun(n, m, fl) != null;
/* the Snow Arena set-up used by the Learn steps */
function snow(m, fl, huskies) { LAB.sledHi = null; S.scene = 'sled'; S.x0 = SLED_X0; S.mass = m; S.floor = fl; S.left = []; S.right = Array(huskies || 0).fill('husky'); }
const UNITS = ['N', 'kg', 'm/s', 'm/s²'];
/* Readouts the student has to work out stay hidden ("?") in the arena and in the Journal's run sentences until the question that asks for them has been answered.
   A step lists them in `mask: [{ q, keys, when(n, m, floor) }]`. */
function sledMasked(n, m, fl) {
  const out = new Set(); if (typeof CH === 'undefined' || !CH || LAB.mode !== 'guided') return out;
  const st = CHDATA[CH.id] && CHDATA[CH.id].steps[GI]; if (!st || !st.mask) return out;
  st.mask.forEach(M => { if (M.when(n, m, fl)) { const q = dbGet(stepKey(CH.id, GI) + '.' + M.q, null); if (!(q && q.done)) M.keys.forEach(k => out.add(k)); } });
  return out;
}
const ALL = () => true;

/* ---- the maths bank: seeded questions in five levels, each with a hint ladder, a unit picker and non-round numbers ----
   level 1 find F · 2 find a · 3 find m · 4 two steps (resultant first, then a) · 5 weight and mass mixed in */
function rngSeed(seed) { let a = (seed * 2654435761) >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const MB_THINGS = [['A husky sled', 'the huskies'], ['A shopping trolley', 'a shopper'], ['A go-kart', 'its engine'], ['A cyclist and bike', 'the cyclist'], ['A skateboarder', 'a push'], ['A rocket sled', 'its rocket'], ['A wheelchair racer', 'the racer'], ['A model train', 'its motor']];
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;
function mq(level, seed, id) {
  const R = rngSeed(seed * 31 + level * 977), pick = a => a[Math.floor(R() * a.length)], int = (a, b) => a + Math.floor(R() * (b - a + 1));
  const th = pick(MB_THINGS), who = th[0], q = { id: id || `mb${level}_${seed}`, type: 'num', units: UNITS, ladder: true, mb: level, seed: String(seed) };
  const cap = s => s[0].toUpperCase() + s.slice(1), force = (P, f, m) => `a pull of ${P} N forwards, with friction of ${f} N backwards`;
  if (level === 1) {
    const m = int(6, 96), a = pick([0.6, 0.8, 1.2, 1.5, 1.8, 2.4, 2.5, 3.2, 3.6, 4.5]) , F = r1(m * a);
    Object.assign(q, { p: `${who} has a mass of ${m} kg. It accelerates at ${a} m/s². What resultant force acts on it?`, ans: F, unit: 'N', tol: Math.max(0.15, F * 0.005), work: `F = m × a = ${m} × ${a} = ${F} N`,
      hints: ['You want the force, so cover F in the formula triangle. The letters left are side by side, so multiply.', `F = m × a. The mass is ${m} kg and the acceleration is ${a} m/s².`, `Type ${m} × ${a} into the calculator. A force is measured in newtons.`] });
  } else if (level === 2) {
    const m = pick([8, 12, 16, 20, 24, 25, 32, 40, 48, 50, 64, 75, 80, 96, 120]), a = pick([0.5, 0.75, 1.25, 1.5, 2, 2.5, 3.2, 4]), F = r1(m * a + pick([0, 0, 2, 4, 6]));
    const ans = r2(F / m); Object.assign(q, { p: `A resultant force of ${F} N acts on ${who.toLowerCase()} with a mass of ${m} kg. What is its acceleration?`, ans, unit: 'm/s²', tol: 0.02, work: `a = F ÷ m = ${F} ÷ ${m} = ${fmt(ans, 2)} m/s²`,
      hints: ['You want the acceleration, so cover a in the formula triangle. F is above m, so divide.', `a = F ÷ m. The force is ${F} N and the mass is ${m} kg.`, `Type ${F} ÷ ${m} into the calculator. Acceleration is measured in m/s².`] });
  } else if (level === 3) {
    const m = int(5, 120), a = pick([0.6, 0.8, 1.2, 1.5, 1.6, 2.4, 2.5, 3.2, 3.6]), F = r1(m * a);
    Object.assign(q, { p: `A resultant force of ${F} N makes ${who.toLowerCase()} accelerate at ${a} m/s². What is its mass?`, ans: m, unit: 'kg', tol: 0.3, work: `m = F ÷ a = ${F} ÷ ${a} = ${m} kg`,
      hints: ['You want the mass, so cover m in the formula triangle. F is above a, so divide.', `m = F ÷ a. The force is ${F} N and the acceleration is ${a} m/s².`, `Type ${F} ÷ ${a} into the calculator. Mass is measured in kg.`] });
  } else if (level === 4) {
    const m = int(40, 150), P = pick([180, 270, 360, 450]), f = r1(P * pick([0.08, 0.1, 0.12, 0.15, 0.2]) + R() * 5), net = r1(P - f), ans = r2(net / m);
    Object.assign(q, { p: `${who} has a mass of ${m} kg. It has ${force(P, f, m)}. What is its acceleration?`, ans, unit: 'm/s²', tol: 0.02, work: `Resultant = ${P} − ${f} = ${fmt(net, 1)} N. Then a = F ÷ m = ${fmt(net, 1)} ÷ ${m} = ${fmt(ans, 2)} m/s²`,
      hints: ['Friction pushes against the pull, so the pull is not the resultant. Find the resultant first.', `Resultant force = pull − friction = ${P} − ${f}. Then cover a in the triangle: a = F ÷ m, with m = ${m} kg.`, `Type (${P} − ${f}) ÷ ${m} into the calculator. Use the brackets.`] });
  } else {
    const kind = Math.floor(R() * 3), m = int(30, 140), W = r1(m * 9.8);
    if (kind === 0) { const a = pick([0.8, 1.2, 1.5, 2.4, 2.5, 3.2]), F = r1(m * a); Object.assign(q, { p: `${who} has a weight of ${W} N. A resultant force of ${F} N acts on it. What is its acceleration? (g = 9.8 N/kg)`, ans: a, unit: 'm/s²', tol: 0.02, work: `Mass = weight ÷ 9.8 = ${W} ÷ 9.8 = ${m} kg. Then a = F ÷ m = ${F} ÷ ${m} = ${a} m/s²`,
      hints: ['Weight is a force in newtons, not a mass. Turn it into a mass first: mass = weight ÷ 9.8.', `m = ${W} ÷ 9.8. Then cover a in the triangle: a = F ÷ m.`, `Type ${W} ÷ 9.8 to get the mass, then ${F} ÷ that mass.`] }); }
    else if (kind === 1) { const a = pick([0.8, 1.2, 1.5, 2.4, 2.5, 3.2]), F = r1(m * a); Object.assign(q, { p: `${who} accelerates at ${a} m/s² under a resultant force of ${F} N. What is its weight? (g = 9.8 N/kg)`, ans: W, unit: 'N', tol: Math.max(0.3, W * 0.005), work: `Mass = F ÷ a = ${F} ÷ ${a} = ${m} kg. Weight = mass × 9.8 = ${m} × 9.8 = ${W} N`,
      hints: ['Weight needs the mass first. You can find the mass from the force and the acceleration.', `m = F ÷ a = ${F} ÷ ${a}. Then weight = mass × 9.8.`, `Type ${F} ÷ ${a} to get the mass, then multiply it by 9.8.`] }); }
    else { const P = pick([270, 360, 450]), f = r1(0.05 * W), net = r1(P - f), ans = r2(net / m); Object.assign(q, { p: `${who} has a weight of ${W} N. It has ${force(P, f, m)}. What is its acceleration? (g = 9.8 N/kg)`, ans, unit: 'm/s²', tol: 0.02, work: `Mass = ${W} ÷ 9.8 = ${m} kg. Resultant = ${P} − ${f} = ${fmt(net, 1)} N. a = ${fmt(net, 1)} ÷ ${m} = ${fmt(ans, 2)} m/s²`,
      hints: ['There are two jobs before F = ma. Turn the weight into a mass, and find the resultant force.', `Mass = ${W} ÷ 9.8. Resultant = ${P} − ${f}. Then a = F ÷ m.`, `Type ${W} ÷ 9.8 for the mass, then (${P} − ${f}) ÷ that mass.`] }); }
  }
  return q;
}
/* "Give me another one": a fresh question from the same level, saved as evidence when it is right */
const MBMORE = (level, n) => mq(level, 100 + n, `more${level}_${n}`);

CHDATA.c3 = {
  goal: 'Use Newton\'s second law, F = ma, to link resultant force, mass and acceleration, with the formula triangle, and work out the resultant force when friction acts.',
  vocab: ['acceleration', 'm/s²', 'resultant force', 'Newton\'s second law', 'formula triangle', 'friction', 'weight', 'mass', 'unit'],
  steps: [
    /* ---------- Foundation ---------- */
    { id: 'a1', title: 'The husky sled', info: ['readA'], floors: ['snow0'],
      cards: [
        { html: `<p>Welcome to Chapter 3 and the <b>Snow Arena</b>! A team of huskies pulls a sled across the snow.</p><p>When the sled speeds up, we say it ${T('acceleration', 'accelerates')}. The <b>acceleration</b> tells you how much faster the sled goes every second. We measure it in ${T('mps2', 'm/s²')}.</p><div class="law">An acceleration of 2 m/s² means the speed goes up by 2 m/s every second.</div>` },
        { html: `<div class="notebox"><b>Friction is switched off</b><p>Real snow does have some friction. For the first few steps we have switched it off, so you can see force, mass and acceleration on their own. Look for the <b>Friction: OFF</b> label in the corner of the arena. Friction comes back in step 5.</p></div>` },
        { hi: '[data-panel="pal"]', html: `<p>Drag a <b>husky</b> from the palette onto the snow, in front of the sled. Each husky pulls with <b>90 N</b>. Then press <b>Pull!</b></p><p>With no friction, the huskies' pull is the whole ${T('resultant', 'resultant force')}. Watch the <b>Acceleration</b> readout.</p>` }],
      predict: { q: 'One husky pulls a 100 kg sled. Then a second husky joins in. What will happen to the sled\'s acceleration?', opts: ['It will be about twice as big', 'It will stay about the same', 'It will be about half as big', 'It will be about four times as big'] },
      setup() { snow(100, 'snow0', 0); }, adds: ['pal', 'run', 'meter', 'readR', 'readM', 'readRes', 'readA', 'readV'], sides: ['right'], pullers: ['husky'], idle: 'Drag a husky onto the snow, then press Pull!',
      tasks: [['Make your prediction in the box above.', () => predOf() != null], ['Drag <b>1 husky</b> onto the arena and press <b>Pull!</b> Let the sled cross the finish line.', () => rHas(1, 100, 'snow0')], ['Press <b>Reset</b>, add a <b>second husky</b> and pull again.', () => rHas(2, 100, 'snow0')]],
      qs: [
        { id: 'q1', type: 'reading', p: 'What acceleration did <b>one husky</b> give the 100 kg sled?', unit: 'm/s²', tol: 0.03, live: () => rA(1, 100, 'snow0'), need: () => rA(1, 100, 'snow0') != null, needMsg: 'Pull the sled with 1 husky first. Your runs are in the Journal.', ok: 'Correct! 90 N on 100 kg gives 0.9 m/s².' },
        { id: 'q2', type: 'reading', p: 'What acceleration did <b>two huskies</b> give the same sled?', unit: 'm/s²', tol: 0.03, live: () => rA(2, 100, 'snow0'), need: () => rA(2, 100, 'snow0') != null, needMsg: 'Pull the sled with 2 huskies first. Your runs are in the Journal.', ok: 'Correct! 180 N on 100 kg gives 1.8 m/s².' },
        { id: 'q3', type: 'mcq', p: 'Two huskies pull with twice the force of one husky. What happened to the sled\'s acceleration?', opts: ['It doubled, because the resultant force doubled', 'It stayed the same, because the sled has the same mass', 'It halved, because there were more huskies to pull', 'It went up a little, because the sled got lighter'], a: 0, ok: 'Yes. Twice the resultant force gave twice the acceleration.', why: { 1: 'The mass stayed the same, but the force did not. Compare your two readings.', 2: 'Compare your two readings: did the acceleration go down?', 3: 'The mass of the sled stayed at 100 kg the whole time.' } }] },

    { id: 'a2', title: 'More mass, less acceleration', floors: ['snow0'],
      cards: [
        { html: `<p>Now keep the huskies the same and change the <b>mass</b> of the sled. A sled loaded with more mail is heavier.</p><p>You can change the mass with the slider, or type a number in the box beside it.</p>` }],
      predict: { q: 'Two huskies pull the sled. The sled\'s mass doubles, from 60 kg to 120 kg. What will happen to its acceleration?', opts: ['It will halve', 'It will double', 'It will stay the same', 'It will drop to zero'] },
      setup() { snow(60, 'snow0', 0); }, adds: ['mass'], sides: ['right'], pullers: ['husky'], idle: 'Drag 2 huskies onto the snow, then press Pull!',
      tasks: [['Make your prediction in the box above.', () => predOf() != null], ['Set the mass to <b>60 kg</b>, add <b>2 huskies</b> and pull.', () => rHas(2, 60, 'snow0')], ['Set the mass to <b>120 kg</b> (twice as heavy), keep the 2 huskies and pull again.', () => rHas(2, 120, 'snow0')]],
      qs: [
        { id: 'q1', type: 'reading', p: 'What acceleration did the two huskies give the <b>60 kg</b> sled?', unit: 'm/s²', tol: 0.04, live: () => rA(2, 60, 'snow0'), need: () => rA(2, 60, 'snow0') != null, needMsg: 'Pull the 60 kg sled with 2 huskies first.', ok: 'Correct! 180 N on 60 kg gives 3.0 m/s².' },
        { id: 'q2', type: 'reading', p: 'What acceleration did the same two huskies give the <b>120 kg</b> sled?', unit: 'm/s²', tol: 0.04, live: () => rA(2, 120, 'snow0'), need: () => rA(2, 120, 'snow0') != null, needMsg: 'Pull the 120 kg sled with 2 huskies first.', ok: 'Correct! 180 N on 120 kg gives 1.5 m/s². Twice the mass gave half the acceleration.' },
        { id: 'q3', type: 'tap', p: '<b>Key idea.</b> Tap the sentence that sums up what you found.', opts: ['A bigger resultant force gives a bigger acceleration. A bigger mass gives a smaller acceleration.', 'A bigger resultant force gives a smaller acceleration. A bigger mass gives a bigger acceleration.', 'A bigger resultant force gives a bigger acceleration. The mass makes no difference to it.', 'A bigger mass gives a bigger resultant force. The acceleration stays the same either way.'], a: 0, ok: 'Yes! That is the idea behind Newton\'s second law.', why: { 1: 'Check your readings. Two huskies gave a bigger acceleration than one.', 2: 'Your 60 kg and 120 kg readings were different, so the mass does matter.', 3: 'With the same two huskies, the acceleration changed when the mass changed.' } },
        { id: 'q4', type: 'gap', p: 'More ___ gives a bigger acceleration, and more ___ gives a smaller acceleration.', ans: [['force', 'resultant force', 'pull'], ['mass']], ok: 'Perfect.' }] },

    { id: 'a3', unlocks: ['fma'], title: 'The formula triangle', floors: ['snow0'],
      cards: [
        { html: `<p>Newton worked out the exact rule. It is called ${T('newton2', 'Newton\'s second law')}:</p><div class="law"><b>Resultant force = mass × acceleration</b><br>F = m × a</div><p>F is in newtons (N), m is in kilograms (kg) and a is in m/s².</p>` },
        { html: `<p>The ${T('triangle', 'formula triangle')} helps you remember it. <b>Cover the letter you want to find.</b> What is left is the sum.</p>${triHTML()}<p>Try each letter now.</p>` },
        { html: `<div class="example"><b>Worked example.</b> Two huskies (180 N) pull a 60 kg sled. To find <b>a</b>, cover <b>a</b>. F is above m, so divide: a = 180 ÷ 60 = <b>3 m/s²</b>. That is what you measured in the last step.</div><p>Now it is your turn. <b>Work out the answer first, then run the sled to check it.</b></p>` }],
      predict: { q: 'Three huskies (270 N) pull a 72 kg sled. Which sum gives its acceleration?', opts: ['270 ÷ 72', '270 × 72', '72 ÷ 270', '270 − 72'], then: 'Work it out with the calculator, then run the sled and see if the readout agrees.' },
      setup() { snow(72, 'snow0', 0); }, adds: [], sides: ['right'], pullers: ['husky'], idle: 'Set 72 kg, drag 3 huskies on, then press Pull!',
      tasks: [['Make your prediction in the box above.', () => predOf() != null], ['On the formula triangle card, tap the letters <b>F</b>, <b>m</b> and <b>a</b> in the triangle to cover each one in turn. The same triangle is saved in your Journal (Notes tab), so you can use it there too.', () => { const t = S.flags.tri; return !!(t && t.F && t.m && t.a); }], ['Set the mass to <b>72 kg</b>, add <b>3 huskies</b> and pull.', () => rHas(3, 72, 'snow0')]],
      mask: [{ q: 'q2', keys: ['readA'], when: ALL }],
      qs: [
        { id: 'q1', type: 'tap', p: '<b>Key idea.</b> Tap the sentence that is Newton\'s second law.', opts: ['The resultant force on an object equals its mass multiplied by its acceleration.', 'The resultant force on an object equals its mass divided by its acceleration.', 'The acceleration of an object equals its mass multiplied by the resultant force.', 'The mass of an object equals its acceleration multiplied by the resultant force.'], a: 0, ok: 'Yes: F = m × a.', why: { 1: 'F = m × a. The mass and the acceleration are multiplied, not divided.', 2: 'Look at the triangle. F is on its own at the top.', 3: 'The mass is not found by multiplying the acceleration and the force.' } },
        { id: 'q2', type: 'num', p: 'Three huskies pull a 72 kg sled with no friction. The resultant force is 270 N. Work out the sled\'s acceleration.', unit: 'm/s²', units: UNITS, ans: 3.75, tol: 0.02, ladder: true, work: 'a = F ÷ m = 270 ÷ 72 = 3.75 m/s²', ok: 'Right! 270 ÷ 72 = 3.75 m/s².', hints: ['Cover a in the triangle. F is above m, so divide.', 'a = F ÷ m. The force is 3 × 90 N = 270 N, and the mass is 72 kg.', 'Type 270 ÷ 72 into the calculator.'] },
        { id: 'q3', type: 'reading', p: 'Now check it. What acceleration does the readout show for your run?', unit: 'm/s²', tol: 0.03, live: () => rA(3, 72, 'snow0'), need: () => rA(3, 72, 'snow0') != null, needMsg: 'Set the mass to 72 kg, add 3 huskies and pull first.', ok: 'It matches your sum. The formula works!' }] },

    { id: 'a4', title: 'Finding the force and the mass', floors: ['snow0'],
      cards: [
        { html: `<p>The triangle works for any letter. Cover the one you want to find.</p><div class="example"><b>Finding F.</b> A 90 kg sled must accelerate at 2 m/s². Cover F, then multiply: F = 90 × 2 = <b>180 N</b>. That is 2 huskies.</div><div class="example"><b>Finding m.</b> Three huskies (270 N) make a sled accelerate at 2.7 m/s². Cover m, then divide: m = 270 ÷ 2.7 = <b>100 kg</b>.</div>` },
        { html: `<p>Two jobs. In each one, <b>work out your answer first</b>, then set up the sled and pull to check it.</p>` }],
      setup() { snow(108, 'snow0', 0); }, adds: [], sides: ['right'], pullers: ['husky'], idle: 'Work it out first, then set up the sled and pull',
      tasks: [['<b>Job 1.</b> A 108 kg sled has to accelerate at 2.5 m/s². Work out the force it needs, add that many huskies (90 N each) and pull.', () => rHas(3, 108, 'snow0')], ['<b>Job 2.</b> Two huskies make a sled accelerate at 2.25 m/s². Work out its mass, set the slider to that mass and pull.', () => rHas(2, 80, 'snow0')]],
      mask: [{ q: 'q1', keys: ['readA'], when: (n, m) => m === 108 }, { q: 'q3', keys: ['readA'], when: n => n === 2 }],
      qs: [
        { id: 'q1', type: 'num', p: '<b>Job 1.</b> What resultant force does a 108 kg sled need to accelerate at 2.5 m/s²?', unit: 'N', units: UNITS, ans: 270, tol: 0.6, ladder: true, work: 'F = m × a = 108 × 2.5 = 270 N', ok: 'Yes: 270 N.', hints: ['Cover F in the triangle. The letters left are side by side, so multiply.', 'F = m × a = 108 × 2.5.', 'Type 108 × 2.5 into the calculator.'] },
        { id: 'q2', type: 'num', p: 'Each husky pulls with 90 N. How many huskies give 270 N?', unit: 'huskies', ans: 3, tol: 0.05, work: '270 ÷ 90 = 3 huskies', ok: 'Yes: 3 huskies.', hints: ['Divide the force you need by the force of one husky.', '270 ÷ 90.'] },
        { id: 'q3', type: 'num', p: '<b>Job 2.</b> Two huskies (180 N) make a sled accelerate at 2.25 m/s². What is the sled\'s mass?', unit: 'kg', units: UNITS, ans: 80, tol: 0.3, ladder: true, work: 'm = F ÷ a = 180 ÷ 2.25 = 80 kg', ok: 'Yes: 80 kg.', hints: ['Cover m in the triangle. F is above a, so divide.', 'm = F ÷ a = 180 ÷ 2.25.', 'Type 180 ÷ 2.25 into the calculator.'] },
        { id: 'q4', type: 'reading', p: 'Check Job 2. What acceleration did the 80 kg sled have with 2 huskies?', unit: 'm/s²', tol: 0.03, live: () => rA(2, 80, 'snow0'), need: () => rA(2, 80, 'snow0') != null, needMsg: 'Set the mass to 80 kg, add 2 huskies and pull first.', ok: 'It was 2.25 m/s², just as your sum said.' }] },

    { id: 'a5', unlocks: ['friction'], title: 'Friction is back', info: ['readF', 'fbd'], floors: ['snow'],
      cards: [
        { html: `<div class="notebox"><b>Friction is back on</b><p>The snow now has its normal friction. The label in the corner says <b>Friction: on</b>. Friction pushes against the sled, so the huskies' pull is <b>no longer the resultant force</b>.</p></div>` },
        { html: `<p>Now there are <b>two steps</b>.</p><ol><li>Find the ${T('resultant', 'resultant force')}: <b>pull − friction</b>.</li><li>Use F = m × a with that resultant: <b>a = resultant ÷ m</b>.</li></ol><div class="example"><b>Worked example.</b> Three huskies (270 N) pull a 60 kg sled. The Friction readout shows 29.4 N. Resultant = 270 − 29.4 = 240.6 N. Then a = 240.6 ÷ 60 = <b>4.01 m/s²</b>.</div>` }],
      predict: { q: 'Two huskies pull an 80 kg sled. Without friction, the acceleration would be 180 ÷ 80 = 2.25 m/s². With friction back on, the acceleration will be…', opts: ['smaller than 2.25 m/s²', 'bigger than 2.25 m/s²', 'exactly 2.25 m/s²', 'zero'] },
      setup() { snow(80, 'snow', 0); }, adds: ['readF', 'fbd'], sides: ['right'], pullers: ['husky'], idle: 'Set 80 kg, drag 2 huskies on, then press Pull!',
      tasks: [['Make your prediction in the box above.', () => predOf() != null], ['Set the mass to <b>80 kg</b>, add <b>2 huskies</b> and pull. Watch the friction arrow in the free-body diagram.', () => rHas(2, 80, 'snow')]],
      mask: [{ q: 'q2', keys: ['readRes'], when: ALL }, { q: 'q3', keys: ['readA'], when: ALL }],
      qs: [
        { id: 'q1', type: 'reading', p: 'What friction did the Friction readout show when the sled was moving?', unit: 'N', tol: 0.4, live: () => rFr(2, 80, 'snow'), need: () => rFr(2, 80, 'snow') != null, needMsg: 'Pull the 80 kg sled with 2 huskies first.', ok: 'Correct! The friction was 39.2 N.' },
        { id: 'q2', type: 'num', p: '<b>Step 1.</b> Work out the resultant force: the pull of 2 huskies (180 N) minus your friction reading.', unit: 'N', units: UNITS, ans: 140.8, tol: 0.7, ladder: true, work: 'Resultant = pull − friction = 180 − 39.2 = 140.8 N', ok: 'Yes: 140.8 N.', hints: ['Friction pushes against the pull, so subtract it.', 'Resultant = 180 − your friction reading.', 'Type 180 − 39.2 into the calculator.'] },
        { id: 'q3', type: 'num', p: '<b>Step 2.</b> Use F = m × a to find the acceleration. The resultant is 140.8 N and the mass is 80 kg.', unit: 'm/s²', units: UNITS, ans: 1.76, tol: 0.02, ladder: true, work: 'a = F ÷ m = 140.8 ÷ 80 = 1.76 m/s²', ok: 'Yes: 1.76 m/s².', hints: ['Cover a in the triangle. F is above m, so divide.', 'Use the resultant, not the pull: 140.8 ÷ 80.', 'Type 140.8 ÷ 80 into the calculator.'] },
        { id: 'q4', type: 'reading', p: 'Check it. What acceleration does the readout show?', unit: 'm/s²', tol: 0.03, live: () => rA(2, 80, 'snow'), need: () => rA(2, 80, 'snow') != null, needMsg: 'Pull the 80 kg sled with 2 huskies first.', ok: 'It matches your sum.' },
        { id: 'q5', type: 'mcq', p: 'Why is the acceleration smaller than the 2.25 m/s² it would be with no friction?', opts: ['Friction acts against the pull, so the resultant force is smaller', 'Friction makes the sled heavier, so its mass is bigger', 'Friction makes the huskies pull less, so the pull is smaller', 'Friction adds to the pull, but only after the first second'], a: 0, ok: 'Exactly. The pull is the same, but the resultant is smaller.', why: { 1: 'The mass stayed at 80 kg. Check the Mass readout.', 2: 'The pull is still 180 N. Check the Right pull readout.', 3: 'Friction never helps the pull. It acts against it.' } }] },

    { id: 'a6', title: 'Five mystery sleds', info: [], floors: ['snow0', 'snow'],
      cards: [
        { html: `<p>Time to put F = ma to work on <b>five different sleds</b>. Each one has a <b>?</b> that you have to find.</p><ol><li>Cover the unknown letter on the ${T('triangle', 'formula triangle')} and work out the answer with the calculator.</li><li>Type your answer and choose its unit.</li><li>Set up the sled in the arena and press <b>Pull!</b> The readouts show whether you were right.</li></ol><p>Every question has a <b>Need a clue?</b> box. It gives you one hint at a time, and never the answer.</p>` },
        { html: `<div class="notebox"><b>Which floor?</b><p>Sleds 1 to 3 use the <b>Friction off</b> floor, so the huskies' pull is the whole resultant force. Sleds 4 and 5 use <b>packed snow</b>, where friction is on. Choose the floor with the floor buttons.</p></div>` }],
      setup() { snow(85, 'snow0', 0); }, adds: [], sides: ['right'], pullers: ['husky'], idle: 'Work out the answer first, then set up the sled and press Pull!',
      tasks: [['<b>Sled 1.</b> Set <b>85 kg</b>, add <b>3 huskies</b> (friction off) and pull to check your answer.', () => rHas(3, 85, 'snow0')], ['<b>Sled 2.</b> Set <b>72 kg</b>, add the huskies your force needs (friction off) and pull.', () => rHas(2, 72, 'snow0')], ['<b>Sled 3.</b> Set the mass you worked out, add <b>3 huskies</b> (friction off) and pull.', () => rHas(3, 120, 'snow0')], ['<b>Sled 4.</b> Choose <b>packed snow</b>, set <b>64 kg</b>, add <b>2 huskies</b>, pull and read the friction.', () => rHas(2, 64, 'snow')], ['<b>Sled 5.</b> Choose <b>packed snow</b>, set the mass you worked out, add <b>3 huskies</b> and pull.', () => rHas(3, 70, 'snow')]],
      more: [1, 2, 3],
      mask: [{ q: 'q1', keys: ['readA'], when: (n, m, f) => f === 'snow0' && m === 85 }, { q: 'q2', keys: ['readA'], when: (n, m, f) => f === 'snow0' && m === 72 }, { q: 'q3', keys: ['readA'], when: (n, m, f) => f === 'snow0' && n === 3 },
        { q: 'q4', keys: ['readA', 'readRes'], when: (n, m, f) => f === 'snow' && m === 64 }, { q: 'q5', keys: ['readA', 'readRes'], when: (n, m, f) => f === 'snow' && m === 70 }],
      qs: [
        { id: 'q1', type: 'num', p: '<b>Sled 1: the mail sled.</b> A sled and its mail have a mass of 85 kg. Three huskies pull it with no friction. What is its acceleration?', unit: 'm/s²', units: UNITS, ans: 3.18, tol: 0.02, ladder: true, work: 'F = 3 × 90 = 270 N. a = F ÷ m = 270 ÷ 85 = 3.18 m/s²', ok: 'Yes: 3.18 m/s². Now pull and see if the Acceleration readout agrees.', hints: ['You want the acceleration, so cover a in the triangle. F is above m, so divide.', 'The force is 3 × 90 N = 270 N. The mass is 85 kg.', 'Type 270 ÷ 85 into the calculator.'] },
        { id: 'q2', type: 'num', p: '<b>Sled 2: the medical sled.</b> This 72 kg sled must speed up at 2.5 m/s² (no friction). What resultant force does it need?', unit: 'N', units: UNITS, ans: 180, tol: 0.5, ladder: true, work: 'F = m × a = 72 × 2.5 = 180 N, which is 2 huskies', ok: 'Yes: 180 N. That is 2 huskies. Add them and pull to check.', hints: ['You want the force, so cover F in the triangle. The letters left are side by side, so multiply.', 'F = m × a = 72 × 2.5.', 'Type 72 × 2.5 into the calculator. Then work out how many huskies (90 N each) give that force.'] },
        { id: 'q3', type: 'num', p: '<b>Sled 3: the fish sled.</b> Three huskies pull a sled with no friction, and it speeds up at 2.25 m/s². What is the mass of the sled and its load?', unit: 'kg', units: UNITS, ans: 120, tol: 0.4, ladder: true, work: 'F = 270 N. m = F ÷ a = 270 ÷ 2.25 = 120 kg', ok: 'Yes: 120 kg. Set that mass and pull to check.', hints: ['You want the mass, so cover m in the triangle. F is above a, so divide.', 'The force is 3 × 90 N = 270 N. The acceleration is 2.25 m/s².', 'Type 270 ÷ 2.25 into the calculator.'] },
        { id: 'q4', type: 'num', p: '<b>Sled 4: the tent sled.</b> Two huskies pull a 64 kg sled on packed snow. Pull it first and read the friction, then work out its acceleration.', unit: 'm/s²', units: UNITS, ans: 2.32, tol: 0.03, ladder: true, need: () => rFr(2, 64, 'snow') != null, needMsg: 'Pull the 64 kg sled with 2 huskies first, so you can read the friction.', work: 'Friction = 31.4 N. Resultant = 180 − 31.4 = 148.6 N. a = 148.6 ÷ 64 = 2.32 m/s²', ok: 'Yes: 2.32 m/s². Compare it with the Acceleration readout.', hints: ['Friction pushes against the pull, so the pull is not the resultant. Find the resultant first.', 'Resultant = pull − friction = 180 − your friction reading. Then a = resultant ÷ 64.', 'Type (180 − 31.4) ÷ 64 into the calculator.'] },
        { id: 'q5', type: 'num', p: '<b>Sled 5: the firewood sled.</b> This sled has a weight of 686 N. Three huskies pull it on packed snow, and the friction is 34.3 N. What is its acceleration? (g = 9.8 N/kg)', unit: 'm/s²', units: UNITS, ans: 3.37, tol: 0.03, ladder: true, work: 'Mass = 686 ÷ 9.8 = 70 kg. Resultant = 270 − 34.3 = 235.7 N. a = 235.7 ÷ 70 = 3.37 m/s²', ok: 'Yes: 3.37 m/s². Set 70 kg, add 3 huskies on packed snow and pull to check.', hints: ['There are two jobs before F = ma. Turn the weight into a mass, and find the resultant force.', 'Mass = 686 ÷ 9.8. Resultant = 270 − 34.3. Then a = resultant ÷ mass.', 'Type 686 ÷ 9.8 for the mass, then (270 − 34.3) ÷ that mass.'] }] },

    /* ---------- Extension ---------- */
    { id: 'e1', unlocks: ['accel'], title: 'Acceleration on a graph', floors: ['snow'], info: ['vt'],
      cards: [
        { html: `<p>Welcome to the Chapter 3 Extension! A ${T('vtgraph', 'velocity–time graph')} shows acceleration as a <b>straight sloping line</b>. The steeper the ${T('slope', 'slope')}, the bigger the acceleration.</p><p>To work out the acceleration, take two points on the line: <b>acceleration = change in speed ÷ time taken</b>.</p>` },
        { html: `<p>Here is a sled that speeds up steadily.</p>${vtSVG([{ pts: [[0, 0], [5, 8]], col: '#1f5f8b' }], { tMax: 6, vMax: 9, vStep: 1, tri: [[1, 1.6], [4, 6.4]], alt: 'A straight line from 0 at 0 s up to 8 m/s at 5 s. A dashed triangle marks the speed rising from 1.6 to 6.4 m/s between 1 s and 4 s.' })}<div class="example">From 1 s to 4 s, the speed goes from 1.6 to 6.4 m/s. Change in speed = 4.8 m/s. Time taken = 3 s. Acceleration = 4.8 ÷ 3 = <b>1.6 m/s²</b>.</div>` }],
      setup() { snow(90, 'snow', 2); }, adds: ['vt'], hide: ['mass'], sides: [], pullers: [], idle: 'Press Pull!',
      tasks: [['Press <b>Pull!</b> and watch the graph. Let the sled cross the finish line.', () => rHas(2, 90, 'snow')]],
      mask: [{ q: 'q3', keys: ['readA'], when: ALL }],
      qs: [
        { id: 'q1', type: 'reading', p: 'Read the graph. How fast was the sled going after <b>1 s</b>?', unit: 'm/s', tol: 0.25, live: () => rV(2, 90, 'snow', 1), need: () => rV(2, 90, 'snow', 1) != null, needMsg: 'Pull the sled first.', ok: 'Good reading!', hints: ['Find 1 on the time axis, go straight up to the line, then read across.'] },
        { id: 'q2', type: 'reading', p: 'How fast was the sled going after <b>3 s</b>?', unit: 'm/s', tol: 0.25, live: () => rV(2, 90, 'snow', 3), need: () => rV(2, 90, 'snow', 3) != null, needMsg: 'Pull the sled first.', ok: 'Good reading!', hints: ['Find 3 on the time axis, go straight up to the line, then read across.'] },
        { id: 'q3', type: 'num', p: 'Use your two readings. The speed changed from the 1 s reading to the 3 s reading, which took 2 s. What was the sled\'s acceleration? (Change in speed ÷ time taken.)', unit: 'm/s²', units: UNITS, live: () => { const r = sledRun(2, 90, 'snow'); return r ? r.a : null; }, need: () => sledRun(2, 90, 'snow') != null, needMsg: 'Pull the sled first.', tol: 0.12, ladder: true, work: 'Acceleration = (speed at 3 s − speed at 1 s) ÷ 2 s. Both readings come from your run.', ok: 'Yes! It matches the Acceleration readout.', hints: ['Take the 1 s reading away from the 3 s reading to find the change in speed.', 'Divide the change in speed by the time taken, 2 s.'] },
        { id: 'q4', type: 'mcq', p: 'The line on the graph is straight and slopes upwards. What does that tell you?', opts: ['The sled has a steady acceleration, so it speeds up by the same amount every second', 'The sled has a steady speed, so it covers the same distance every second', 'The sled has a growing acceleration, so it speeds up by more every second', 'The sled has no acceleration, so it stays at the same speed all the time'], a: 0, ok: 'Yes. A straight sloping line means a steady acceleration.', why: { 1: 'A steady speed would be a flat line.', 2: 'If the acceleration grew, the line would curve upwards.', 3: 'No acceleration would mean a flat line.' } }] },

    { id: 'e2', title: 'Resultant first, then F = ma', floors: ['snow', 'powder'],
      cards: [
        { html: `<p>Friction is bigger on <b>fresh powder</b> than on packed snow. Soft snow grips the sled more. So the same huskies leave a smaller resultant force.</p><p>For any problem with friction, use <b>two steps</b>: find the resultant (pull − friction), then use F = m × a.</p>` }],
      predict: { q: 'Four huskies pull a 120 kg sled. On packed snow, the acceleration would be about 2.5 m/s². On fresh powder, the sled\'s acceleration will be…', opts: ['smaller, because the friction is bigger', 'bigger, because the snow is softer', 'the same, because the huskies pull just as hard', 'the same, because the mass has not changed'] },
      setup() { snow(120, 'powder', 0); }, adds: ['mass'], sides: ['right'], pullers: ['husky'], idle: 'Choose Fresh powder, set 120 kg, add 4 huskies, then Pull!',
      tasks: [['Make your prediction in the box above.', () => predOf() != null], ['Choose <b>Fresh powder</b> and set the mass to <b>120 kg</b>. Add <b>4 huskies</b> and pull.', () => rHas(4, 120, 'powder')]],
      mask: [{ q: 'q2', keys: ['readRes'], when: ALL }, { q: 'q3', keys: ['readA'], when: ALL }],
      qs: [
        { id: 'q1', type: 'reading', p: 'What friction did the Friction readout show on the fresh powder?', unit: 'N', tol: 0.5, live: () => rFr(4, 120, 'powder'), need: () => rFr(4, 120, 'powder') != null, needMsg: 'Pull the 120 kg sled with 4 huskies on fresh powder first.', ok: 'Correct: 176.4 N. That is a lot more than on packed snow.' },
        { id: 'q2', type: 'num', p: 'Four huskies pull with 360 N. Work out the resultant force.', unit: 'N', units: UNITS, ans: 183.6, tol: 0.9, ladder: true, work: 'Resultant = 360 − 176.4 = 183.6 N', ok: 'Yes: 183.6 N.', hints: ['Friction acts against the pull, so subtract it.', 'Resultant = 360 − your friction reading.', 'Type 360 − 176.4 into the calculator.'] },
        { id: 'q3', type: 'num', p: 'Now find the acceleration of the 120 kg sled.', unit: 'm/s²', units: UNITS, ans: 1.53, tol: 0.02, ladder: true, work: 'a = F ÷ m = 183.6 ÷ 120 = 1.53 m/s²', ok: 'Yes: 1.53 m/s².', hints: ['Use the resultant, not the pull.', 'Cover a in the triangle: a = F ÷ m = 183.6 ÷ 120.', 'Type 183.6 ÷ 120 into the calculator.'] },
        { id: 'q4', type: 'reading', p: 'Check it. What acceleration does the readout show?', unit: 'm/s²', tol: 0.03, live: () => rA(4, 120, 'powder'), need: () => rA(4, 120, 'powder') != null, needMsg: 'Pull the sled first.', ok: 'It matches.' }] },

    { id: 'e3', title: 'Weight, mass and F = ma', floors: ['snow'], info: ['readW'],
      cards: [
        { html: `<p>Be careful: <b>weight</b> and <b>mass</b> are different. Mass is in kg. Weight is a force in newtons.</p><div class="law">weight = mass × 9.8, so mass = weight ÷ 9.8</div><p>F = m × a needs the <b>mass</b>. If a question gives you the weight, turn it into a mass first.</p><div class="example">A sled weighs 882 N. Its mass is 882 ÷ 9.8 = <b>90 kg</b>.</div>` }],
      setup() { snow(85, 'snow', 0); }, adds: ['readW', 'readN'], sides: ['right'], pullers: ['husky'], idle: 'Set 85 kg, add 3 huskies, then Pull!',
      tasks: [['Set the mass to <b>85 kg</b>, add <b>3 huskies</b> and pull.', () => rHas(3, 85, 'snow')]],
      mask: [{ q: 'q2', keys: ['readA'], when: ALL }],
      qs: [
        { id: 'q1', type: 'reading', p: 'What does the Weight readout show for the 85 kg sled?', unit: 'N', tol: 0.5, live: () => 85 * G, need: () => S.mass === 85, needMsg: 'Set the mass to 85 kg first.', ok: 'Correct: 85 × 9.8 = 833 N.' },
        { id: 'q2', type: 'num', p: 'A sled has a weight of 833 N. Three huskies pull with 270 N, and the friction is 41.65 N. What is its acceleration? (g = 9.8 N/kg)', unit: 'm/s²', units: UNITS, ans: 2.69, tol: 0.02, ladder: true, work: 'Mass = 833 ÷ 9.8 = 85 kg. Resultant = 270 − 41.65 = 228.35 N. a = 228.35 ÷ 85 = 2.69 m/s²', ok: 'Yes: 2.69 m/s².', hints: ['There are two jobs before F = ma: turn the weight into a mass, and find the resultant force.', 'Mass = 833 ÷ 9.8. Resultant = 270 − 41.65. Then a = F ÷ m.', 'Type 833 ÷ 9.8 for the mass, then (270 − 41.65) ÷ that mass.'] },
        { id: 'q3', type: 'reading', p: 'Check it. What acceleration does the readout show?', unit: 'm/s²', tol: 0.03, live: () => rA(3, 85, 'snow'), need: () => rA(3, 85, 'snow') != null, needMsg: 'Set the mass to 85 kg, add 3 huskies and pull first.', ok: 'It matches your sum.' }] }
  ],

  /* ---------- Check ---------- */
  review: [
    mq(2, 42, 'c3r2'), mq(3, 43, 'c3r3'),
    { id: 'c3r4', type: 'mcq', p: 'Two huskies pull a sled and give it an acceleration of 1.6 m/s². Two more huskies join the team (4 in total). The mass and the friction do not change, and the friction is small enough to ignore. What is the sled\'s acceleration now?', opts: ['3.2 m/s²', '1.6 m/s²', '0.8 m/s²', '6.4 m/s²'], a: 0, work: 'Twice the pull on the same mass gives twice the acceleration: 2 × 1.6 = 3.2 m/s².', why: { 1: 'The force doubled, so the acceleration changes.', 2: 'More force means more acceleration, not less.', 3: 'The force only doubled. It did not go up four times.' } },
    { id: 'c3r5', type: 'gap', p: 'Newton\'s second law: the resultant ___ on an object equals its ___ multiplied by its ___.', ans: [['force'], ['mass'], ['acceleration']], swap: [1, 2] },
    { id: 'c3r6', type: 'tick', p: 'Tick every statement that is true.', opts: ['With the same pull, a heavier sled accelerates more slowly', 'A bigger resultant force on the same mass gives a bigger acceleration', 'Acceleration is measured in newtons', 'With friction acting, the resultant force is the pull minus the friction', 'If the resultant force is zero, the sled must be standing still'], a: [0, 1, 3], work: 'More mass means less acceleration, and more resultant force means more acceleration. With friction, resultant = pull − friction. Acceleration is in m/s², and a sled with no resultant force can keep moving at a steady speed.' },
    mq(4, 44, 'c3r7'),
    { id: 'c3r8', type: 'explain', p: 'Two huskies pull an empty sled, and then they pull the same sled loaded with mail. The loaded sled speeds up more slowly. Explain why, using F = ma.', words: ['resultant force', 'mass', 'acceleration'],
      model: 'The two huskies pull with the same force both times, so the resultant force is the same. The loaded sled has more mass. Because F = m × a, the same resultant force on a bigger mass gives a smaller acceleration, so the loaded sled speeds up more slowly.',
      check: ['Says the resultant force is the same both times, because the huskies pull just as hard', 'Says the loaded sled has more mass', 'Uses F = ma (or the formula triangle) to explain that the same resultant force on a bigger mass gives a smaller acceleration'] },
    /* Extension */
    { id: 'c3r9', type: 'num', p: 'This graph shows a sled speeding up steadily. Work out its acceleration.' + vtSVG([{ pts: [[0, 0], [6, 4.5]], col: '#1f5f8b' }], { tMax: 8, vMax: 5, vStep: 0.5, tri: [[2, 1.5], [6, 1.5], [6, 4.5]], triLab: false, alt: 'A straight line from 0 at 0 s up to 4.5 m/s at 6 s' }), unit: 'm/s²', units: UNITS, ans: 0.75, tol: 0.03, ladder: true, work: 'Between 2 s and 6 s the speed goes from 1.5 to 4.5 m/s: a change of 3 m/s in 4 s. a = 3 ÷ 4 = 0.75 m/s²', hints: ['Pick two points on the line and read their speeds and times.', 'Change in speed ÷ time taken.', 'At 2 s the speed is 1.5 m/s, and at 6 s it is 4.5 m/s. Divide the change by 4 s.'] },
    { id: 'c3r10', type: 'mcq', p: 'The graph shows two sleds that start from rest. Which line shows the sled with the bigger acceleration?' + vtSVG([{ pts: [[0, 0], [6, 3]], col: '#c94a34', label: 'Line 1', lab: 1 }, { pts: [[0, 0], [6, 5]], col: '#11806f', label: 'Line 2', lab: 1 }], { tMax: 8, vMax: 5, vStep: 1, alt: 'Two straight lines from the origin. Line 1 reaches 3 m/s at 6 s. Line 2 reaches 5 m/s at 6 s.' }), opts: ['Line 2, because its speed goes up by more every second', 'Line 1, because its speed goes up by less every second', 'Line 2, because it has a steady speed all the way along', 'Neither, because both lines slope upwards in a straight line'], a: 0, work: 'Line 2 is steeper: it reaches 5 m/s in 6 s, while line 1 only reaches 3 m/s. A steeper slope means a bigger acceleration.', why: { 1: 'A line that rises by less each second is less steep.', 2: 'A steady speed would be a flat line, and neither line is flat.', 3: 'Both lines are straight, but one is steeper. The steeper line has the bigger acceleration.' } },
    mq(5, 46, 'c3r12'),
    { id: 'c3r13', type: 'fbd', p: 'Draw the free-body diagram of this sled.', scen: { id: 'c3r13', obj: 'sled', label: '85 kg', brief: '<p>Three huskies pull an <b>85 kg sled</b> to the right across packed snow with <b>270 N</b>. The friction on the sled is <b>41.65 N</b>. The sled is speeding up.</p>', forces: [{ type: 'weight', dir: 'down', value: 833 }, { type: 'normal', dir: 'up', value: 833 }, { type: 'pull', dir: 'right', value: 270 }, { type: 'friction', dir: 'left', value: 41.65 }] } },
    { id: 'c3r14', type: 'explain', p: 'The same four huskies pull the same sled on packed snow and then on fresh powder. The sled accelerates more slowly on the powder. Explain why.', words: ['friction', 'resultant force', 'acceleration'],
      model: 'Fresh powder has more friction than packed snow. The huskies pull with the same force, but more of it is used up against the bigger friction, so the resultant force (pull − friction) is smaller. A smaller resultant force on the same mass gives a smaller acceleration, because a = F ÷ m.',
      check: ['Says there is more friction on the fresh powder', 'Says the resultant force (pull − friction) is smaller on the powder, even though the huskies pull just as hard', 'Uses F = ma to say that a smaller resultant force on the same mass gives a smaller acceleration'] }
  ]
};
CHDATA.c3.review.forEach(q => { if (q.build) q.build(); });

/* Challenge: the mail run. Work out how many huskies the sled needs, then run it.
   Each run is judged at the finish line. Every run counts: on target first time = 4 points, then 3, 2, 1. */
CHDATA.c3.challenge = {
  title: 'The mail run',
  intro: 'The mail has to get through! Each sled must speed up enough to arrive on time, but not so fast that the mail sacks tumble off. Work out how many huskies you need first, then run it. Your score is highest if you get it right in as few runs as you can.',
  missions: [
    { id: 'n1', kind: 'sled', title: 'Run 1: a light load', mass: 80, floor: 'snow', lo: 1.0, hi: 2.4, huskies: 2, brief: 'The sled and its load have a <b>mass of 80 kg</b>, on packed snow. The acceleration has to be <b>between 1.0 and 2.4 m/s²</b>.' },
    { id: 'n2', kind: 'sled', title: 'Run 2: fresh powder', mass: 120, floor: 'powder', lo: 1.2, hi: 2.0, huskies: 4, brief: 'The sled and its load have a <b>mass of 120 kg</b>, on fresh powder. The acceleration has to be <b>between 1.2 and 2.0 m/s²</b>. The powder has a lot of friction!' },
    { id: 'n3', kind: 'sled', title: 'Run 3: the heavy load', mass: 150, floor: 'snow', lo: 1.8, hi: 2.2, huskies: 4, setMass: true, brief: 'The sled and its load have a <b>weight of 1470 N</b>, on packed snow. Work out its mass, then set the slider. The acceleration has to be <b>between 1.8 and 2.2 m/s²</b>.' }
  ]
};
