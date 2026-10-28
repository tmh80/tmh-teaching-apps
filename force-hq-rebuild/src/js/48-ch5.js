/* ===== Chapter 5: Balanced forces and the Drop Zone =====
   Foundation c5f (steps d1–d4, Check c5r1–c5r7): falling, air resistance, terminal velocity, the parachute.
   Extension c5x (steps p1–p3, the three missions, Check c5r8–c5r12): air, weight and other worlds (added in a later step).
   The physics is in 46-dropzone.js and matches tools/dropzone_model.py. The script is docs/Chapter5_Script.md. */
const DZ_HIDE_OLD = ['shove', 'astro', 'readAV', 'readAM', 'pushf', 'thrust', 'pairs', 'pal', 'meter', 'readL', 'readR', 'readRes', 'readF', 'readW', 'readN', 'readM', 'floor', 'run', 'mass', 'fbd', 'vt', 'brake', 'launch', 'toggles', 'readD'];
const DZ_TREND = ['gets bigger', 'stays the same', 'gets smaller'];
const c5Crate = { obj: 'crate', world: 'earth', height: 600 };
const c5Sky = { obj: 'para', world: 'earth', height: 1500 };
/* the fixed example skydive used by the "tap the moment" questions: 1,500 m, medium canopy opened at 20 s (the same run as dropzone_model.run('para','earth',height=1500,canopy='medium',open_at=20)) */
let DZ_FIXED = null;
const dzFixedGraph = () => {
  if (!DZ_FIXED) { const r = dzSimulate({ obj: 'para', world: 'earth', height: 1500, canopy: 'medium', openAt: 20, every: 0.5 }); DZ_FIXED = r.pts.filter(p => p[0] <= 40); }
  return { lines: [{ pts: DZ_FIXED, col: '#1f5f8b' }], tMax: 40, vMax: 60, vStep: 10, tStep: 5, alt: 'Velocity–time graph of a skydive: the velocity climbs to about 54 m/s, stays steady, then drops sharply when the canopy opens and levels off at about 6 m/s.' };
};

CHDATA.c5 = {
  goal: 'Describe how weight and air resistance change during a fall, use balanced forces to explain terminal velocity with and without a parachute, and compare falling on other worlds using W = m × g.',
  vocab: ['air resistance', 'weight', 'terminal velocity', 'balanced forces', 'resultant force', 'parachute', 'canopy', 'gravitational field strength', 'vacuum', 'lift', 'hover'],
  steps: [
    /* ---------- Foundation ---------- */
    { id: 'd1', title: 'First drop', info: ['dfbd'], floors: ['air'],
      cards: [
        { html: `<p>Welcome to Chapter 5 and the <b>Drop Zone</b>! A helicopter hovers high above the landing pad, ready to drop things for you. It stays perfectly still because its lift pushes up exactly as hard as its weight pulls down. Your first job: drop a 40 kg crate from 600 m and watch its velocity on the way down.</p>` },
        { hi: '#cvScene', html: `<p>Keep an eye on the <b>free-body diagram</b> next to the crate. One arrow is the crate's <b>weight</b>, pulling it down. The other is <b>air resistance</b>, pushing up against the motion. Watch how each arrow changes as the crate falls. The Fast-forward button saves time on long drops.</p>` }],
      predict: { q: 'The crate falls from 600 m. What will its velocity do on the way down?', opts: ['It will keep speeding up until it hits the ground', 'It will speed up at first, then stop speeding up', 'It will fall at the same velocity all the way down', 'It will speed up at first, then slow down before landing'], then: 'Press Drop! and watch the Velocity readout and the two arrows.' },
      setup() { dropSetup({ height: 600, a: { obj: 'crate', world: 'earth', removed: 0 } }); }, adds: ['drop', 'dfbd', 'readH', 'readV', 'readA', 'readT', 'warp'], hide: DZ_HIDE_OLD, sides: [], pullers: [], idle: 'Press Drop! to release the crate',
      tasks: [['Make your prediction in the box above.', () => predOf() != null], ['Press <b>Drop!</b> and watch the crate all the way down.', () => dzRun(c5Crate) != null]],
      qs: [
        { id: 'q1', type: 'reading', p: 'The crate\'s velocity stopped going up. What velocity did it settle at?', unit: 'm/s', tol: 0.3, live: () => dzTop(c5Crate), need: () => dzTop(c5Crate) != null, needMsg: 'Drop the crate first. Your runs are in the Journal.', ok: 'Spot on! The crate settled at about 38 m/s. That\'s nearly 140 km/h.' },
        { id: 'q2', type: 'pick', p: 'As the crate fell faster and faster, its weight {0} and the air resistance on it {1}.', picks: [[DZ_TREND, 1], [DZ_TREND, 0]], after: 'Weight is mass × g, so it stays the same during the fall. Air resistance grows as the velocity grows.' },
        { id: 'q3', type: 'mcq', p: 'Why did the air resistance arrow grow during the fall?', opts: ['Air resistance gets bigger as the crate\'s velocity gets bigger', 'Air resistance gets bigger as the crate gets closer to the ground', 'Air resistance gets bigger as the crate\'s weight gets bigger', 'Air resistance gets bigger as the air gets colder lower down'], a: 0, ok: 'Yes! The arrow grows because the crate speeds up.', why: { 1: 'The height doesn\'t matter: the arrow grows because the crate is moving faster.', 2: 'The weight stayed the same the whole way down.', 3: 'The Drop Zone\'s air stays the same all the way down. The arrow grows because the crate speeds up.' } }] },

    { id: 'd2', title: 'Pause and look', info: ['dpause'], floors: ['air'],
      cards: [
        { hi: '#dzPause', html: `<p>Falls happen fast, so let's freeze time! Press <b>⏸ Pause</b> during a drop and everything stops. The <b>◀ 0.5 s</b> and <b>0.5 s ▶</b> buttons step backwards and forwards through the fall, and <b>📸 Snapshot</b> saves that moment to your Journal. Use them to catch the forces at exactly the right moment.</p>` },
        { html: `<p>The <b>resultant force</b> is what's left over when you combine the forces. Weight pulls down and air resistance pushes up, so <b>resultant = weight − air resistance</b>. A downward resultant means the crate is still speeding up.</p><div class="example"><b>Worked example</b><br>At 20 m/s the air resistance on the crate is 108.6 N and its weight is 392 N. Resultant = 392 − 108.6 = <b>283.4 N</b>, pointing down, so the crate is still speeding up.</div><div class="law"><b>Key idea:</b> resultant = weight − air resistance.</div>` }],
      setup() { dropSetup({ height: 600, a: { obj: 'crate', world: 'earth', removed: 0 } }); }, adds: ['dpause'], sides: [], pullers: [], idle: 'Press Drop!, then pause the crate',
      mask: [{ q: 'q1', keys: ['fbdR'], when: () => true }],
      tasks: [['Drop the crate and pause it at the three moments in the table. Press <b>Use this moment</b> on each row.', () => frzCount('q1') >= 3], ['Take at least one <b>📸 Snapshot</b>.', () => !!S.flags.snapBtn]],
      qs: [
        { id: 'q1', type: 'freeze', p: 'Fill in the table from your three paused moments. Type the forces from the free-body diagram, work out the resultant, and choose what the velocity is doing.', obj: 'crate',
          cols: [['W', 'Weight (N)'], ['D', 'Air resistance (N)'], ['R', 'Resultant (N)'], ['motion', 'Velocity']],
          rows: [{ label: 'Just after it leaves the helicopter', when: s => s.cstate === 'closed' && s.v < 12 && s.a > 0.5, whenMsg: 'Pause in the first second of the fall.' },
            { label: 'About halfway to its top velocity', when: s => s.v >= 15 && s.v <= 23, whenMsg: 'Pause when the velocity is between 15 and 23 m/s.' },
            { label: 'After it has stopped speeding up', when: s => Math.abs(s.a) < 0.2, whenMsg: 'Pause once the velocity has stopped going up.' }],
          example: [[392, 25.0, 367.0, 0], [392, 108.6, 283.4, 0], [392, 391.2, 0.8, 1]] },
        { id: 'q2', type: 'pick', p: 'Look at your table. As the crate sped up, the air resistance {0}, the resultant force {1} and the acceleration {2}.', picks: [[DZ_TREND, 0], [DZ_TREND, 2], [DZ_TREND, 2]] }] },

    { id: 'd3', title: 'Terminal velocity', info: ['dpause'], floors: ['air'],
      cards: [
        { html: `<p>Here's what you just saw. As the crate speeds up, air resistance grows. Eventually it grows until it is <b>as big as the weight</b>. Now the forces are <b>balanced</b>, the resultant force is zero, and the crate stops speeding up. It keeps falling at a steady velocity called its <b>terminal velocity</b>.</p><div class="law"><b>Key idea:</b> When air resistance has grown to equal the weight, the forces are balanced and the object falls at a steady terminal velocity.</div>` },
        { html: `<p>Balanced forces mean the <b>velocity does not change</b>. A still object stays still, and a moving object keeps moving at a steady velocity. That's Newton's first law from Chapter 2, working high above the Drop Zone!</p>` }],
      setup() { dropSetup({ height: 600, a: { obj: 'crate', world: 'earth', removed: 0 } }); }, adds: [], sides: [], pullers: [], idle: 'Press Drop!, then pause the crate',
      tasks: [['Answer the key idea question below.', () => hasAns('q1')], ['Drop the crate, pause it once it has reached terminal velocity, and take a <b>📸 Snapshot</b>.', () => !!dzSnap({ obj: 'crate', world: 'earth' }, s => Math.abs(s.a) < 0.2 && S.flags.snapBtn)]],
      qs: [
        { id: 'q1', type: 'tap', p: '<b>Key idea.</b> Tap the sentence that explains terminal velocity.', opts: ['Air resistance has grown to equal the weight, so the velocity stops changing.', 'Air resistance has grown bigger than the weight, so the velocity stops changing.', 'The weight has shrunk to zero, so the velocity stops changing.', 'The air resistance has disappeared, so the velocity stops changing.'], a: 0, ok: 'Yes! Equal forces mean a steady velocity.', why: { 1: 'If air resistance were bigger, the crate would slow down.', 2: 'Weight stays the same the whole way down.', 3: 'Air resistance is at its biggest at terminal velocity.' } },
        { id: 'q2', type: 'reason', p: 'The crate is falling at a steady 38 m/s. Four friends disagree about the forces on it. Who\'s right?',
          voices: [{ who: 'Mia', says: 'It has stopped speeding up, so there are no forces on it any more.' }, { who: 'Sam', says: 'Air resistance and weight are now equal, so the forces are balanced.' }, { who: 'Leo', says: 'The weight must still be bigger, or it would stop falling.' }, { who: 'Ana', says: 'Air resistance is bigger now, so it\'s about to slow down.' }], a: 1,
          reasons: ['A steady velocity means the resultant force is zero', 'A falling object needs a downward resultant to keep moving', 'Weight switches off when an object reaches its top velocity', 'Air resistance always ends up bigger than weight in a long fall'], r: 0,
          why: { a: { 0: 'Both forces are still there; they cancel.', 2: 'A moving object keeps moving with no resultant force (Newton\'s first law).', 3: 'Air resistance stops growing when it equals the weight.' }, r: { 1: 'That is Leo\'s idea. A moving object keeps moving with no resultant force.', 2: 'Weight never switches off.', 3: 'It only becomes bigger if something changes, like a canopy opening.' } } },
        { id: 'q3', type: 'desk', p: 'Build the free-body diagram for the crate falling at its terminal velocity of 38 m/s.', deskTitle: 'A 40 kg crate falling at its terminal velocity',
          scen: { id: 'c5d3', obj: 'crate', label: '40 kg', brief: '<p>The <b>40 kg crate</b> is falling at a steady <b>38 m/s</b>.</p><p>Draw every force on the crate. Use the calculator for its weight.</p>', forces: [{ type: 'weight', dir: 'down', value: 392 }, { type: 'airres', dir: 'up', value: 392 }] } }] },

    { id: 'd4', title: 'Open the parachute', info: ['dcanopy', 'dvt', 'dft'], floors: ['air'],
      cards: [
        { html: `<p>Meet our skydiver! With the canopy closed, they fall just like the crate until they reach a terminal velocity of about <b>54 m/s</b>. That's nearly 200 km/h. Then they open the parachute.</p>` },
        { hi: '#dzOpen', html: `<p>A <b>canopy</b> is huge, so it has to push a lot of air out of the way. At the same velocity, the air resistance is suddenly much bigger. Use <b>⏸ Pause</b> to catch the arrows just after the canopy opens, and again once things settle down.</p>` }],
      predict: { kind: 'sketch', q: 'Sketch the skydiver\'s velocity from the jump until well after the canopy opens. The dashed line shows when the canopy opens.', cols: 10, levels: 10, xLabel: 'Time', yLabel: 'Velocity (downwards)', marks: [{ col: 6, label: 'Canopy opens' }], then: 'Drop the skydiver, open the canopy, then compare your sketch with the real graph.' },
      setup() { dropSetup({ height: 1500, a: { obj: 'para', world: 'earth', removed: 0, canopy: 'medium' } }); }, adds: ['dcanopy', 'dvt', 'dft'], sides: [], pullers: [], idle: 'Press Drop!, then open the canopy',
      tasks: [['Sketch your prediction in the box above.', () => predOf() != null], ['Press <b>Drop!</b>. When the velocity has stopped going up, press <b>Open canopy!</b>', () => !!dzRun(Object.assign({}, c5Sky, { canopy: c => c !== 'none', openT: v => v != null, vt1: v => v != null }), true)], ['Pause at the two moments in the table and press <b>Use this moment</b> on each row.', () => frzCount('q1') >= 2]],
      qs: [
        { id: 'q1', type: 'freeze', p: 'Fill in the table from your two paused moments.', obj: 'para',
          cols: [['W', 'Weight (N)'], ['D', 'Air resistance (N)'], ['big', 'The bigger force'], ['motion', 'Velocity']],
          rows: [{ label: 'Just after the canopy opens', when: s => s.cstate !== 'closed' && s.a < -1, whenMsg: 'Pause in the first few seconds after the canopy opens. The step buttons help.' },
            { label: 'Steady again with the canopy open', when: s => s.cstate === 'open' && Math.abs(s.a) < 0.2, whenMsg: 'Pause once the velocity has stopped going down.' }],
          example: [[735, 2243, 1, 2], [735, 735, 2, 1]] },
        { id: 'q2', type: 'reason', p: 'The canopy opens. Four friends describe what happens next. Who\'s right?',
          voices: [{ who: 'Mia', says: 'The skydiver shoots upwards for a moment.' }, { who: 'Ana', says: 'The skydiver keeps falling, but slows down.' }, { who: 'Leo', says: 'The skydiver stops dead in mid-air.' }, { who: 'Sam', says: 'The skydiver keeps falling at the same velocity.' }], a: 1,
          reasons: ['Air resistance is now bigger than the weight, so the resultant points up and slows the fall', 'Air resistance is now bigger than the weight, so the resultant points up and lifts the skydiver', 'The canopy cancels the weight completely, so no forces act on the skydiver at all', 'The canopy only changes the skydiver\'s shape, so the forces stay just the same'], r: 0,
          why: 'An upward resultant on something moving down slows it down. It only looks like the skydiver goes up in videos, because the camera is held by someone who is still falling fast.' },
        { id: 'q3', type: 'spot', p: 'Here\'s a velocity–time graph of a skydive. Tap where the canopy opened.', graph: dzFixedGraph, targets: [{ t: [19.5, 21.0], why: 'The canopy opens where the velocity suddenly drops, at 20 s.' }] },
        { id: 'q4', type: 'pick', p: 'After the canopy opened, the air resistance {0} as the skydiver slowed down, until it was {1} the weight again.', picks: [[DZ_TREND, 2], [['bigger than', 'equal to', 'smaller than'], 1]] }] }
  ],
  review: [
    /* ---------- Foundation Check ---------- */
    { id: 'c5r1', type: 'order', p: 'Put the stages of a skydive in order.', first: 'Leaves the helicopter', last: 'Lands',
      items: ['The skydiver speeds up quickly', 'Air resistance grows as the velocity grows', 'Air resistance equals the weight, so the velocity is steady', 'The canopy opens and air resistance jumps up', 'The skydiver slows down and air resistance shrinks', 'The forces balance again at a much lower velocity'] },
    { id: 'c5r2', type: 'reason', sure: true, p: 'A skydiver with the canopy closed is falling at a steady 54 m/s. Which is true about the forces on them?',
      opts: ['Air resistance is equal to their weight', 'Air resistance is bigger than their weight', 'Air resistance is smaller than their weight', 'There are no forces acting on them at all'], a: 0,
      reasons: ['Their velocity is steady, so the resultant force must be zero', 'They are still falling, so there must be a downward resultant', 'They are moving fast, so air resistance must be winning', 'They have stopped speeding up, so gravity has switched off'], r: 0,
      why: { a: { 1: 'If air resistance were bigger, the skydiver would be slowing down.', 2: 'If air resistance were smaller, the skydiver would still be speeding up.', 3: 'Both forces are still there. They cancel.' }, r: { 1: 'A moving object keeps moving at a steady velocity with no resultant force (Newton\'s first law).', 2: 'Air resistance stops growing when it equals the weight.', 3: 'Gravity never switches off, so weight stays the same.' } } },
    { id: 'c5r3', type: 'num', p: 'A skydiver with a weight of 735 N is falling at 45 m/s. The air resistance on them is 518 N. What is the resultant force on them?', unit: 'N', units: UNITS, ans: 217, tol: 1, ladder: true,
      hints: ['Weight pulls down and air resistance pushes up, so the resultant is the difference.', 'resultant = weight − air resistance.', 'Type 735 − 518 into the calculator.'], work: 'resultant = 735 − 518 = 217 N, pointing down, so the skydiver is still speeding up.' },
    { id: 'c5r4', type: 'table', p: 'Complete the table for three moments of a skydive.', cols: ['Air resistance compared with weight', 'Resultant force', 'Velocity'],
      choices: [['bigger', 'smaller', 'equal'], ['zero', 'up', 'down'], ['steady', 'slowing down', 'speeding up']],
      rows: [['Just after jumping', [1, 2, 2]], ['At terminal velocity', [2, 0, 0]], ['Just after the canopy opens', [0, 1, 1]]] },
    { id: 'c5r5', type: 'spot', p: 'Here\'s a velocity–time graph of a skydive (the same graph as in the Drop Zone steps).', graph: dzFixedGraph,
      targets: [{ ask: 'Tap a moment when the forces were balanced and the canopy was still closed.', t: [14.5, 19.8], why: 'The velocity is steady (the line is flat) before the canopy opens.' }, { ask: 'Tap a moment when the air resistance was bigger than the weight.', t: [20.1, 23.5], why: 'Just after the canopy opens, the velocity is dropping fast, so the resultant points up.' }] },
    { id: 'c5r6', type: 'fix', p: 'Leo explains what happens when a canopy opens. One line has a mistake. Tap it, then choose the correct line.', who: 'Leo',
      lines: ['The skydiver is falling at terminal velocity.', 'The canopy opens, so the air resistance gets much bigger.', 'Air resistance is now bigger than the weight.', 'So the resultant force points upwards.', 'So the skydiver starts to move upwards.'], bad: 4,
      fix: { kind: 'mcq', opts: ['So the skydiver keeps moving down, but slows down', 'So the skydiver keeps moving down, and speeds up', 'So the skydiver stops moving and hangs still', 'So the skydiver keeps moving down at the same velocity'], a: 0 },
      why: 'An upward resultant force slows down something that is falling. The skydiver keeps moving down the whole time, just more slowly.' },
    { id: 'c5r7', type: 'explain', p: 'A skydiver jumps from a hovering helicopter. Explain why they reach a terminal velocity.', words: ['weight', 'air resistance', 'balanced', 'resultant force'],
      model: 'At first the skydiver\'s weight is much bigger than the air resistance, so there is a downward resultant force and they speed up. As they go faster, the air resistance grows. Eventually the air resistance is equal to the weight, so the forces are balanced and the resultant force is zero. They stop speeding up and fall at a steady terminal velocity.',
      check: ['Says the weight is bigger than the air resistance at first, so the skydiver speeds up', 'Says the air resistance grows as the velocity grows', 'Says the air resistance becomes equal to the weight, so the forces are balanced (resultant force zero) and the velocity stays steady'] }
  ]
};
CHDATA.c5.review.forEach(q => { if (q.build) q.build(); });
