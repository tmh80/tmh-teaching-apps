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
        { id: 'q4', type: 'pick', p: 'After the canopy opened, the air resistance {0} as the skydiver slowed down, until it was {1} the weight again.', picks: [[DZ_TREND, 2], [['bigger than', 'equal to', 'smaller than'], 1]] }] },

    /* ---------- Extension ---------- */
    { id: 'p1', title: 'Heavy and light', info: ['dair'], floors: ['air'],
      cards: [
        { hi: '[data-panel="dlanes"]', html: `<p>Time for a race! <b>Compare two drops</b> gives you a second lane, and each lane can drop a different object. Press <b>Drop!</b> and both objects are released at exactly the same moment. The buttons <b>Lane A</b> and <b>Lane B</b> above the controls choose which lane the controls change.</p>` },
        { hi: '[data-panel="dair"]', html: `<p>The <b>Air removed</b> slider takes air out of the Drop Zone. At 100% the Drop Zone becomes a <b>vacuum</b>, with no air at all. Scientists build huge vacuum chambers to test exactly this.</p>` }],
      predict: { q: 'You remove all the air, then drop a feather and a crate together from 50 m. What will happen?', opts: ['They will land at exactly the same moment', 'The crate will land well before the feather', 'The feather will land well before the crate', 'The feather will float and never land'], then: 'Race them with the air, then race them again with all the air removed.' },
      setup() { dropSetup({ height: 50, two: true, a: { obj: 'feather', world: 'earth', removed: 0 }, b: { obj: 'crate', world: 'earth', removed: 0 } }); }, adds: ['dlanes', 'dobj', 'dair', 'dheight'], hide: ['dcanopy', 'dvt', 'dft', 'dopenh'], sides: [], pullers: [], idle: 'Press Drop! to race the two objects',
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Race the <b>feather</b> against the <b>crate</b> from 50 m with all the air. The feather is slow, so use <b>Fast-forward</b>.', () => !!(dzRun({ obj: 'feather', world: 'earth', height: 50, air: 0, two: true }) && dzRun({ obj: 'crate', world: 'earth', height: 50, air: 0, two: true }))],
        ['Remove <b>100%</b> of the air from both lanes and race them again.', () => !!(dzRun({ obj: 'feather', world: 'earth', height: 50, air: 100, two: true }) && dzRun({ obj: 'crate', world: 'earth', height: 50, air: 100, two: true }))],
        ['Put the air back and drop the <b>basketball</b> once.', () => !!dzRun({ obj: 'basketball', world: 'earth', air: 0 })]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With all the air removed, how long did the feather and the crate take to land?', unit: 's', tol: 0.15, live: () => dzTime({ obj: 'crate', world: 'earth', height: 50, air: 100 }), need: () => dzTime({ obj: 'crate', world: 'earth', height: 50, air: 100 }) != null, needMsg: 'Race the feather and the crate with all the air removed first. Your runs are in the Journal.', ok: 'Yes, about 3.2 s, at exactly the same moment. With no air, nothing slows the feather down.' },
        { id: 'q2', type: 'order', p: 'Put these in order of their terminal velocity on Earth, lowest first. Your runs in the Journal will help.', first: 'Lowest terminal velocity', last: 'Highest terminal velocity',
          items: ['The feather', 'The skydiver with the medium canopy open', 'The basketball', 'The crate', 'The skydiver with the canopy closed'], after: 'Their terminal velocities are 0.6, 6.0, 20, 38 and 54 m/s.' },
        { id: 'q3', type: 'reason', p: 'With the air in, the 40 kg crate falls faster than the 0.6 kg basketball. Why?',
          opts: ['The crate has a higher terminal velocity', 'The crate feels less air resistance at every velocity', 'The crate is pulled harder on each kilogram', 'The crate has no air resistance acting on it'], a: 0,
          reasons: ['Its bigger weight needs a bigger air resistance to balance it, which only happens at a higher velocity', 'Its bigger mass means air resistance stops working on it', 'Heavier objects always fall faster, even with no air', 'Its sharp corners cut through the air, so air resistance can\'t act'], r: 0,
          why: 'Every kilogram is pulled by 9.8 N on Earth, whatever the object. The crate\'s weight is much bigger, so the air resistance has to grow much bigger before the forces balance, and that needs a higher velocity. With no air, as you saw, they land together.' }] },

    { id: 'p2', title: 'Other worlds', info: ['dworld'], floors: ['air'],
      cards: [
        { hi: '[data-panel="dworld"]', html: `<p>The Drop Zone can now visit other worlds! Each one has its own <b>gravitational field strength</b>, g, which tells you how hard it pulls on each kilogram. Each world has its own air too: none at all, very thin, or very thick. Choose a world for each lane and race!</p>` },
        { html: `<p><b>Weight = mass × g.</b> The crate's mass is 40 kg everywhere, but its weight changes from world to world.</p><div class="example">On Earth, g = 9.8 N/kg, so the crate weighs 40 × 9.8 = <b>392 N</b>. On Mars, g = 3.7 N/kg, so the same crate weighs 40 × 3.7 = <b>148 N</b>.</div>` },
        { html: `<p>Some of these worlds are deadly! Venus is hot enough to melt lead, and Jupiter has no ground at all (our drops stop at a platform in the clouds). Luckily, our crates are made of pretend Force HQ super-metal.</p>` }],
      predict: { q: 'You drop a crate from 100 m on Earth and another on the Moon, at the same moment. Which lands first?', opts: ['The crate on Earth lands first', 'The crate on the Moon lands first', 'They land at exactly the same moment', 'The Moon crate floats and never lands'], then: 'Race them and watch the two free-body diagrams.' },
      setup() { dropSetup({ height: 100, two: true, a: { obj: 'crate', world: 'earth', removed: 0 }, b: { obj: 'crate', world: 'moon', removed: 0 } }); }, adds: ['dworld', 'dvt'], hide: ['dcanopy', 'dft', 'dopenh'], sides: [], pullers: [], idle: 'Press Drop! to race the two crates',
      mask: [{ q: 'q2', keys: ['fbdW'], when: L => L.obj === 'para' && L.world === 'mars' }, { q: 'q4', keys: ['fbdW'], when: L => L.obj === 'crate' && L.world === 'moon' }],
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Race a crate on <b>Earth</b> against a crate on the <b>Moon</b> from 100 m.', () => !!(dzRun({ obj: 'crate', world: 'earth', height: 100, two: true }) && dzRun({ obj: 'crate', world: 'moon', height: 100, two: true }))],
        ['Drop a crate on <b>Venus</b> and watch its velocity.', () => !!dzRun({ obj: 'crate', world: 'venus' })],
        ['', () => hasAns('q2'), { q: 'q2' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'How long did the crate on the Moon take to land?', unit: 's', tol: 0.2, live: () => dzTime({ obj: 'crate', world: 'moon', height: 100 }), need: () => dzTime({ obj: 'crate', world: 'moon', height: 100 }) != null, needMsg: 'Race the crates first. Your runs are in the Journal.', ok: 'About 11.2 s. The Moon pulls each kilogram with only 1.6 N, so the crate speeds up slowly, even with no air at all.' },
        { id: 'q2', type: 'num', p: 'A skydiver has a mass of 75 kg. What is their weight on Mars, where g = 3.7 N/kg?', unit: 'N', units: UNITS, ans: 277.5, tol: 0.5, ladder: true, hints: ['Weight = mass × g.', 'Use the skydiver\'s mass, 75 kg, and Mars\'s g, 3.7 N/kg.', 'Type 75 × 3.7 into the calculator.'], work: 'weight = 75 × 3.7 = 277.5 N.' },
        { id: 'q3', type: 'pick', p: 'On Venus, the crate\'s terminal velocity was {0} its terminal velocity on Earth, because the air on Venus is {1}.', picks: [[['much higher than', 'about the same as', 'much lower than'], 2], [['much thinner', 'about the same', 'much thicker'], 2]] },
        { id: 'q4', type: 'fix', p: 'Ana works out the weight of a 40 kg crate on the Moon. Spot her mistake. Tap it, then correct it.', who: 'Ana',
          lines: ['Weight = mass × g', 'Weight = 40 × 9.8', 'Weight = 392 N'], bad: 1, fix: { kind: 'num', ans: 64, unit: 'N', units: UNITS, tol: 0.5 },
          why: 'Ana used Earth\'s g. On the Moon g is 1.6 N/kg, so the weight is 40 × 1.6 = 64 N. The mass is still 40 kg, but the weight is much smaller.' }] },

    { id: 'p3', title: 'Hover', info: ['lift'], floors: ['air'],
      cards: [
        { html: `<p>The helicopter that drops your crates has a mass of <b>1,180 kg</b>. Its spinning blades push air down, so the air pushes the helicopter up. That's Newton's third law again! The upward force is called <b>lift</b>.</p>` },
        { hi: '[data-panel="lift"]', html: `<p>To <b>hover</b>, the helicopter must stay perfectly still in the air. Work out its weight first, then set the lift to match it. Red markers on the slider show lifts that were too big, and yellow ones show lifts that were too small.</p>` }],
      setup() { heliSetup(); }, adds: ['lift'], hide: ['drop', 'dlanes', 'dobj', 'dworld', 'dair', 'dheight', 'dcanopy', 'dopenh', 'dpause', 'dvt', 'dft', 'readA', 'readT', 'warp'], sides: [], pullers: [], idle: null,
      mask: [{ q: 'q1', keys: ['heliW'], when: () => true }],
      tasks: [['', () => hasAns('q1'), { q: 'q1' }], ['Take off: set the lift bigger than the weight and watch the helicopter climb.', () => !!S.flags.heliClimb20], ['Now make it <b>hover</b>: set the lift so it stays still in the air.', () => !!S.flags.heliHover]],
      qs: [
        { id: 'q1', type: 'num', p: 'The helicopter has a mass of 1,180 kg. What is its weight on Earth?', unit: 'N', units: UNITS, ans: 11564, tol: 2, ladder: true, hints: ['Weight = mass × g.', 'On Earth g = 9.8 N/kg.', 'Type 1180 × 9.8 into the calculator.'], work: 'weight = 1,180 × 9.8 = 11,564 N, so it hovers with a lift of 11,564 N.' },
        { id: 'q2', type: 'sort', p: 'Always, sometimes or never? Sort each statement.', groups: ['Always true', 'Sometimes true', 'Never true'],
          items: [['When the forces on an object are balanced, it is still', 1], ['When the forces on an object are balanced, its velocity does not change', 0], ['A hovering helicopter has no forces acting on it', 2], ['A falling object is speeding up', 1], ['Air resistance pushes in the opposite direction to the motion', 0]] },
        { id: 'q3', type: 'pick', p: 'With the lift bigger than the weight, the helicopter first {0} upwards. As it climbs faster, air resistance grows until the forces are {1}, and then it climbs at a steady velocity.', picks: [[['slows down', 'speeds up', 'stays still'], 1], [['unbalanced', 'switched off', 'balanced'], 2]] }] }
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
      check: ['Says the weight is bigger than the air resistance at first, so the skydiver speeds up', 'Says the air resistance grows as the velocity grows', 'Says the air resistance becomes equal to the weight, so the forces are balanced (resultant force zero) and the velocity stays steady'] },
    /* ---------- Extension Check ---------- */
    { id: 'c5r8', type: 'num', p: 'A 40 kg crate is dropped on Jupiter, where g = 24.8 N/kg. What is its weight?', unit: 'N', units: UNITS, ans: 992, tol: 1, ladder: true,
      hints: ['Weight = mass × g.', 'The mass is 40 kg and g is 24.8 N/kg.', 'Type 40 × 24.8 into the calculator.'], work: 'weight = 40 × 24.8 = 992 N, more than two and a half times its weight on Earth.' },
    { id: 'c5r9', type: 'reason', sure: true, p: 'An astronaut on the Moon drops a hammer and a feather from the same height at the same moment. What happens?',
      opts: ['They hit the ground at the same moment', 'The hammer hits the ground well before the feather', 'The feather hits the ground well before the hammer', 'They both float, because the Moon has no gravity'], a: 0,
      reasons: ['There is no air, so only weight acts, and both gain 1.6 m/s of velocity every second', 'The hammer has a bigger weight, so it always speeds up faster', 'The feather has a smaller mass, so it speeds up faster', 'The Moon has no gravity, so nothing can fall there at all'], r: 0,
      why: 'On the Moon there\'s no air resistance. Every kilogram is pulled with 1.6 N, so every object speeds up at the same rate. Astronaut David Scott did exactly this on Apollo 15 in 1971.' },
    { id: 'c5r10', type: 'sketch', p: 'A crate is dropped on the Moon. Sketch its velocity for the first 10 seconds.', xLabel: 'Time (s)', yLabel: 'Velocity downwards (m/s)', cols: 10, levels: 10, yMax: 16, xTicks: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      model: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      checks: [['Starts at zero', p => p[0] <= 0.5], ['Speeds up all the way', p => p.every((v, i) => i === 0 || v > p[i - 1])], ['Speeds up by the same amount every second', p => { const st = p.slice(1).map((v, i) => v - p[i]); return Math.max(...st) - Math.min(...st) <= 1; }], ['Never levels off', p => p[9] - p[8] >= 0.5]],
      look: 'a straight line rising from zero, because with no air the resultant force is the weight all the way down.' },
    { id: 'c5r11', type: 'order', p: 'The same 40 kg crate sits on six worlds. Put them in order of the crate\'s weight, lowest first.', first: 'Lowest weight', last: 'Highest weight',
      items: ['Titan', 'The Moon', 'Mars', 'Venus', 'Earth', 'Jupiter'], after: 'The weights are Titan 56 N, Moon 64 N, Mars 148 N, Venus 356 N, Earth 392 N and Jupiter 992 N.' },
    { id: 'c5r12', type: 'explain', p: 'Engineers landing a rover on Mars use a parachute, but they also need rockets to slow down at the end. Explain why a parachute alone is not enough on Mars.', words: ['thin air', 'air resistance', 'terminal velocity', 'weight'],
      model: 'Mars has very thin air, so the air resistance on the rover is much smaller than it would be on Earth at the same velocity. The air resistance only balances the rover\'s weight at a very high velocity, so even with a parachute its terminal velocity is still far too fast for a safe landing. Rockets add an extra upward force to slow it down.',
      check: ['Says the air on Mars is very thin, so there is much less air resistance', 'Says the air resistance only balances the weight at a high velocity, so the terminal velocity is still too high', 'Says rockets give an extra upward force that slows the rover down'] }
  ]
};
CHDATA.c5.review.forEach(q => { if (q.build) q.build(); });

/* ---------- Challenge: Drop Zone deliveries (three missions, judged when the load lands) ---------- */
const dzOpenAt = r => r.openH == null ? 'the canopy was never opened' : `opened at ${fmt(r.openH, 0)} m`;
CHDATA.c5.challenge = {
  title: 'Drop Zone deliveries',
  intro: 'Mission control has three deliveries for you, on three very different worlds. For each one, choose the canopy and the height to open it at, then drop. Use what you know about terminal velocity and air, and try to get it right in as few drops as you can.',
  missions: [
    { id: 'z1', kind: 'drop', title: 'Mission 1: Skydive on Earth', setup: { obj: 'para', world: 'earth', height: 1500 },
      brief: 'Our skydiver must land <b>slower than 7 m/s</b>, within <b>2 minutes</b> of jumping. For safety, the canopy must open <b>above 300 m</b>.',
      goal: 'The skydiver jumps from 1,500 m on Earth.',
      objs: [{ label: 'Land slower than 7 m/s', ok: r => r.landV < 7.0, say: r => `Landing velocity ${dz1(r.landV)} m/s: ${r.landV < 7.0 ? 'OK' : 'too fast'}.` },
        { label: 'Land within 2 minutes (120 s)', ok: r => r.time <= 120, say: r => `Time ${fmt(r.time, 0)} s: ${r.time <= 120 ? 'OK' : 'too slow'}.` },
        { label: 'Open the canopy above 300 m', ok: r => r.openH != null && r.openH > 300, say: r => r.openH == null ? 'The canopy was never opened: choose a canopy, then use "Open automatically at" or press Open canopy!.' : `Canopy ${dzOpenAt(r)}: ${r.openH > 300 ? 'OK' : 'too low'}.` }],
      clues: ['Which canopies give a terminal velocity below 7 m/s? Your runs will tell you.', 'A big canopy is slow, so the time limit matters. How long does it take to fall 600 m at 6 m/s?', 'time = distance ÷ velocity: 600 ÷ 6 = 100 s. Add the time spent falling fast before the canopy opens.'],
      give: 'A medium canopy opened at about 450 m works.' },
    { id: 'z2', kind: 'drop', title: 'Mission 2: Supply crate for Mars', setup: { obj: 'crate', world: 'mars', height: 3000 },
      brief: 'The Mars base needs supplies! The crate must land <b>slower than 20 m/s</b>. Mars has very thin air, so think carefully about the canopy.',
      goal: 'The crate is dropped from 3,000 m above Mars.',
      objs: [{ label: 'Land slower than 20 m/s', ok: r => r.landV < 20.0, say: r => `Landing velocity ${dz1(r.landV)} m/s: ${r.landV < 20.0 ? 'OK' : 'too fast'}.` }],
      clues: ['Thin air means much less air resistance at every velocity. Which canopy gives the most air resistance?', 'Even with a canopy, the crate needs time and height to slow down. Open it high.', 'The large canopy works if it opens above about 350 m.'],
      after: 'Even the large canopy only slows the crate to about 16 m/s. That\'s why real Mars landers use parachutes <b>and</b> rockets.',
      give: 'The large canopy opened at 1,000 m or higher works.' },
    { id: 'z3', kind: 'drop', title: 'Mission 3: Venus probe', setup: { obj: 'crate', world: 'venus', height: 1000 },
      brief: 'Drop the science crate onto Venus. It must land <b>slower than 6 m/s</b>, within <b>4 minutes</b>, before the heat damages it.',
      goal: 'The crate is dropped from 1,000 m above Venus.',
      objs: [{ label: 'Land slower than 6 m/s', ok: r => r.landV < 6.0, say: r => `Landing velocity ${dz1(r.landV)} m/s: ${r.landV < 6.0 ? 'OK' : 'too fast'}.` },
        { label: 'Land within 4 minutes (240 s)', ok: r => r.time <= 240, say: r => `Time ${fmt(r.time, 0)} s: ${r.time <= 240 ? 'OK' : 'too slow'}.` }],
      clues: ['How thick is the air on Venus compared with Earth?', 'Try a drop with no canopy at all and watch the terminal velocity.', 'With no canopy, the crate\'s terminal velocity is about 5 m/s, so it lands in about 200 s. A canopy makes it far too slow.'],
      give: 'No canopy at all works: the crate lands at about 5 m/s after about 200 s.' }
  ]
};

