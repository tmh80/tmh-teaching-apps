/* ===== Chapter 2: Inertia (Newton's first law) ===== */
/* A small velocity–time graph as inline SVG, for Check questions and worksheets.
   lines: [{ pts: [[t, v], …], col, label }], opts: { tMax, vMax, vStep } */
function vtSVG(lines, o = {}) {
  const W = 420, H = 210, x0 = 46, x1 = W - 14, y0 = 12, y1 = H - 34, tMax = o.tMax || 8, vMax = o.vMax || 3, vStep = o.vStep || 0.5;
  const X = t => x0 + t / tMax * (x1 - x0), Y = v => y1 - v / vMax * (y1 - y0);
  let g = '';
  for (let v = 0; v <= vMax + 1e-9; v += vStep) g += `<line x1="${x0}" y1="${Y(v)}" x2="${x1}" y2="${Y(v)}" stroke="#d5dee2" stroke-width="1"/><text x="${x0 - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="#566a74">${+v.toFixed(2)}</text>`;
  for (let t = 0; t <= tMax; t += 1) g += `<line x1="${X(t)}" y1="${y0}" x2="${X(t)}" y2="${y1}" stroke="#d5dee2" stroke-width="1"/><text x="${X(t)}" y="${y1 + 14}" text-anchor="middle" font-size="11" fill="#566a74">${t}</text>`;
  g += `<path d="M${x0} ${y0}V${y1}H${x1}" fill="none" stroke="#13212a" stroke-width="1.5"/>`;
  g += `<text x="${(x0 + x1) / 2}" y="${H - 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#13212a">Time (s)</text><text transform="translate(12 ${(y0 + y1) / 2}) rotate(-90)" text-anchor="middle" font-size="12" font-weight="700" fill="#13212a">Velocity (m/s)</text>`;
  lines.forEach(l => {
    g += `<polyline points="${l.pts.map(([t, v]) => `${X(t).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${l.col || '#1f5f8b'}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    if (l.label) { const [t, v] = l.pts[l.lab || 0]; g += `<text x="${X(t) + 6}" y="${Y(v) - 7}" font-size="12" font-weight="800" fill="${l.col || '#1f5f8b'}">${l.label}</text>`; }
  });
  return `<div class="qfig noglos"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.alt || 'A velocity–time graph'}" style="width:100%;max-width:440px;display:block;background:#fff;border-radius:8px">${g}</svg></div>`;
}
/* record what the student measured, per crate mass, so questions can check their own runs */
function ch2Record() {
  const F = S.flags; F.sp = F.sp || {}; F.sd = F.sd || {}; F.st = F.st || {};
  if (S.shoveT >= 0 && F.pushMass == null) F.pushMass = S.mass;
  if (S.shoveT < 0 && S.lastShoveT != null && S.running && F.pushMass === S.mass && Math.abs(S.x) < LIM - 0.05) F.sp[S.mass] = S.v;
  if (S.shoveT < 0 && !S.running) F.pushMass = null;
  if (F.stopped && S.brakeFrom != null && !S.running) { F.sd[S.mass] = S.x - S.brakeFrom; F.st[S.mass] = S.t - S.brakeT; F.sdF = F.sdF || {}; F.sdF[S.mass] = S.brakeF; }
}
const sp = m => S.flags.sp && S.flags.sp[m], sd = m => S.flags.sd && S.flags.sd[m];
/* the launcher course used in Chapter 2: start at -7 m, brake line at -4 m */
function course(m, v0, F) { S.floor = 'air'; S.mass = m; S.x0 = -7; S.brakeX = -4; S.v0 = v0; S.brakeF = F; }

CHDATA.c2 = {
  goal: 'Explain inertia: objects with more mass are harder to start moving and harder to stop. State Newton\'s first law and read a velocity–time graph.',
  vocab: ['inertia', 'mass', 'velocity', 'velocity–time graph', 'brake', 'braking distance', 'Newton\'s first law', 'unbalanced force'],
  steps: [
    { id: 'i1', title: 'The same push, three crates', floors: ['air'],
      cards: [
        { html: `<p>Welcome to Chapter 2! In Chapter 1 you found out what forces are. Now you'll find out why some things are much harder to get moving than others.</p><p>The crate is sitting on the <b>air floor</b>, so there is no friction at all.</p>` },
        { hi: '#shoveBtn', html: `<p>The <b>Give it a push</b> button always gives the crate exactly the same shove. You'll try that same shove on three crates with different masses.</p><p>The <b>Velocity</b> readout under the arena shows how fast the crate is moving, in metres per second (m/s).</p>` }],
      predict: { q: 'The same push will hit a 24 kg, a 61 kg and a 147 kg crate. Which one do you think will move fastest?', opts: ['The 24 kg crate', 'The 61 kg crate', 'The 147 kg crate', 'They will all move at the same speed'] },
      setup() { S.floor = 'air'; S.mass = 24; }, adds: ['shove', 'mass', 'readM', 'readV'], sides: [], pullers: [], idle: 'Give the crate a push',
      tick() { ch2Record(); },
      tasks: [['Make your prediction in the box above.', () => predOf() != null], ['Push the <b>24 kg</b> crate.', () => sp(24) != null], ['Use the Crate mass slider to set <b>61 kg</b>, then push it.', () => sp(61) != null], ['Set <b>147 kg</b>, then push it.', () => sp(147) != null]],
      qs: [
        { id: 'q1', type: 'reading', p: 'What speed did the push give the <b>24 kg</b> crate?', unit: 'm/s', tol: 0.03, live: () => sp(24), need: () => sp(24) != null, needMsg: 'Push the 24 kg crate first.', ok: 'Correct! The light crate shoots off quickly.' },
        { id: 'q2', type: 'reading', p: 'What speed did the push give the <b>61 kg</b> crate?', unit: 'm/s', tol: 0.03, live: () => sp(61), need: () => sp(61) != null, needMsg: 'Push the 61 kg crate first.', ok: 'Correct!' },
        { id: 'q3', type: 'reading', p: 'What speed did the push give the <b>147 kg</b> crate?', unit: 'm/s', tol: 0.03, live: () => sp(147), need: () => sp(147) != null, needMsg: 'Push the 147 kg crate first.', ok: 'Correct! The heavy crate only creeps along.' },
        { id: 'q4', type: 'mcq', p: 'The 147 kg crate has about 6 times the mass of the 24 kg crate. What happened to its speed?', opts: ['It moved about 6 times more slowly', 'It moved about 6 times faster', 'It moved at the same speed', 'It didn\'t move at all'], a: 0, ok: 'Exactly. 3.13 m/s ÷ 0.51 m/s is about 6. The same push gives a heavier crate much less speed.', why: { 1: 'Look at your readings again. Which crate was fastest?', 2: 'Your three readings were different. Which was the smallest?', 3: 'On the air floor there is no friction, so even the heavy crate moved a little.' } }] },

    { id: 'i2', title: 'Inertia', floors: ['air'],
      cards: [
        { html: `<p>The heavy crate was much harder to get moving. Scientists say it has more ${T('inertia')}.</p><div class="law"><b>Inertia</b> is how hard it is to change the way an object is moving. The more mass an object has, the more inertia it has.</div>` },
        { html: `<p>Inertia works both ways. A heavy object is hard to <b>start</b> moving, and once it is moving, it is hard to <b>stop</b>. You'll test the stopping part soon.</p>` }],
      setup() { S.floor = 'air'; S.mass = 150; }, adds: [], sides: [], pullers: [], idle: 'Give the crate a push',
      tick() { ch2Record(); },
      tasks: [['Set the crate to <b>150 kg</b>, the heaviest it can be, and give it a push. Watch how slowly it sets off.', () => S.flags.shoved && S.mass === 150]],
      qs: [
        { id: 'q1', type: 'tap', p: '<b>Key idea.</b> Tap the sentence that says what inertia is.', opts: ['Inertia is how hard it is to change the way an object is moving.', 'Inertia is the force that keeps things moving.', 'Inertia is how fast an object is moving.', 'Inertia is the pull of gravity on an object.'], a: 0, ok: 'Yes! Inertia is how hard it is to change an object\'s motion: to start it, stop it, or change its speed.', why: { 1: 'Inertia isn\'t a force. It is a property that every object has, because it has mass.', 2: 'That describes speed. A still crate has inertia too.', 3: 'That describes weight.' } },
        { id: 'q2', type: 'gap', p: 'An object with more ___ has more inertia, so it is ___ to get it moving.', ans: [['mass'], ['harder', 'more difficult']], ok: 'Perfect. More mass means more inertia.' }] },

    { id: 'i3', title: 'The velocity–time graph', info: ['vt'], floors: ['air'],
      cards: [{ html: `<p>A new panel has appeared under the arena: a ${T('vtgraph', 'velocity–time graph')}. It draws the crate's speed as time goes by.</p><p>This time the Velocity readout is hidden, so you'll read the speed from the graph instead.</p>` }],
      setup() { S.floor = 'air'; S.mass = 61; }, adds: ['vt'], hide: ['readV'], sides: [], pullers: [], idle: 'Give the crate a push',
      tick() { ch2Record(); },
      tasks: [['Set the crate to <b>61 kg</b> and give it a push. Watch the graph as it moves.', () => sp(61) != null]],
      qs: [
        { id: 'q1', type: 'reading', p: 'Read the graph. What speed is the 61 kg crate moving at after the push?', unit: 'm/s', tol: 0.08, live: () => sp(61), need: () => sp(61) != null, needMsg: 'Push the 61 kg crate first.', ok: 'Well read! The line sits just above 1.2 m/s.', hints: ['Find the flat part of the line, then look across to the numbers up the side.', 'The line sits between two grid lines. Estimate where it is between them.'] },
        { id: 'q2', type: 'mcq', p: 'After the push, the line on the graph is flat. What does a flat line tell you?', opts: ['The crate is moving at a steady speed', 'The crate has stopped', 'The crate is speeding up', 'The crate is slowing down'], a: 0, ok: 'That\'s right. A flat line means the speed isn\'t changing.', why: { 1: 'A stopped crate would have a line along 0 m/s. Where is the line?', 2: 'Speeding up would make the line slope upwards.', 3: 'Slowing down would make the line slope downwards.' } }] },

    { id: 'i4', title: 'Stopping a crate', info: ['brake', 'readD'], floors: ['air'],
      cards: [
        { html: `<p>Now for the other half of inertia: <b>stopping</b>.</p><p>A launcher sends the crate along the air floor at 2.4 m/s. When it crosses the red <b>brake line</b>, a ${T('brake')} pushes back against it with <b>36 N</b> until it stops.</p>` },
        { hi: '#launchBtn', html: `<p>Press <b>Launch the crate</b> to send it off. The <b>Braking distance</b> readout shows how far it slides after the brake line.</p>` }],
      predict: { q: 'A 24 kg crate and a 61 kg crate both arrive at 2.4 m/s and get the same 36 N brake. Which one will slide further before it stops?', opts: ['The 24 kg crate', 'The 61 kg crate', 'They will slide the same distance'] },
      setup() { course(24, 2.4, 36); }, adds: ['launch', 'readD'], hide: ['shove'], sides: [], pullers: [], idle: 'Press Launch the crate',
      tick() { ch2Record(); },
      tasks: [['Make your prediction in the box above.', () => predOf() != null], ['Launch the <b>24 kg</b> crate and let it stop.', () => sd(24) != null], ['Set <b>61 kg</b>, launch it and let it stop.', () => sd(61) != null]],
      qs: [
        { id: 'q1', type: 'reading', p: 'How far did the <b>24 kg</b> crate slide after the brake line?', unit: 'm', tol: 0.04, live: () => sd(24), need: () => sd(24) != null, needMsg: 'Launch the 24 kg crate first.', ok: 'Correct!' },
        { id: 'q2', type: 'reading', p: 'How far did the <b>61 kg</b> crate slide after the brake line?', unit: 'm', tol: 0.04, live: () => sd(61), need: () => sd(61) != null, needMsg: 'Launch the 61 kg crate first.', ok: 'Correct! It slid much further.' },
        { id: 'q3', type: 'mcq', p: 'Why did the 61 kg crate slide further, even though the brake was the same?', opts: ['It has more mass, so it has more inertia and is harder to stop', 'The brake works less well on big crates', 'It was moving faster', 'Heavy crates have less friction'], a: 0, ok: 'Exactly. More mass means more inertia, so the same brake takes longer to stop it.', why: { 1: 'The brake pushed with 36 N both times. Check the brake label in the arena.', 2: 'Both crates were launched at 2.4 m/s.', 3: 'The air floor has no friction for either crate.' } }] },

    { id: 'i5', title: 'Newton\'s first law', floors: ['air'],
      cards: [
        { html: `<p>Isaac Newton put all of this into one rule, called ${T('newton1', 'Newton\'s first law')}:</p><div class="law">An object stays still, or keeps moving at a steady speed in a straight line, unless an ${T('unbalanced', 'unbalanced force')} acts on it.</div>` },
        { html: `<p>You've seen both halves already. The still crate didn't move until the push. Once it was gliding on the air floor, it kept going at a steady speed until the brake (or the end of the arena) stopped it.</p><div class="example">Far out in space there is no air and no friction. A space pod that gets one push keeps gliding at the same speed for ever, until something pushes or pulls on it.</div>` }],
      setup() { S.floor = 'air'; S.mass = 47; }, adds: [], hide: ['launch', 'readD'], sides: [], pullers: [], idle: 'Give the crate a push',
      tick() { ch2Record(); },
      tasks: [['Give the 47 kg crate a push and watch the graph stay flat as it glides.', () => sp(47) != null]],
      qs: [
        { id: 'q1', type: 'tap', p: '<b>Key idea.</b> Tap the sentence that is Newton\'s first law.', opts: ['An object stays still, or keeps moving at a steady speed in a straight line, unless an unbalanced force acts on it.', 'Every moving object slows down and stops by itself.', 'The bigger the force, the faster an object moves.', 'Heavy objects always move more slowly than light ones.'], a: 0, ok: 'Yes! That is Newton\'s first law. Moving things only slow down when a force, like a brake or friction, acts on them.', why: { 1: 'On the air floor, the crate kept going. Things only slow down when a force acts on them.', 2: 'That is about how forces change speed. You\'ll meet it in Chapter 3.', 3: 'A heavy object can move fast, it just takes a bigger force to get it there.' } },
        { id: 'q2', type: 'mcq', p: 'A space pod is gliding through empty space at 3.6 m/s. Its engines are off and nothing touches it. What happens next?', opts: ['It keeps gliding at 3.6 m/s in a straight line', 'It slowly comes to a stop', 'It speeds up', 'It starts to fall'], a: 0, ok: 'Exactly. No force acts on it, so nothing changes its motion.', why: { 1: 'What force could slow it down? There is no air and nothing touching it.', 2: 'Speeding up needs a force, and the engines are off.', 3: 'Far out in space, there is nothing nearby to pull it.' } }] },

    { id: 'i6', title: 'Inertia in real life',
      cards: [{ html: `<p>Inertia is all around you. Think of the crate as a car. When the brake stops the car, anything loose inside it keeps going, because it has inertia too.</p><p>Launch the crate once more, then try three everyday puzzles in the Your turn box.</p>` }],
      setup() { course(61, 2.4, 36); }, adds: [], hide: ['shove'], sides: [], pullers: [], idle: 'Press Launch the crate',
      tick() { ch2Record(); },
      tasks: [['Launch the crate and watch the brake stop it.', () => S.flags.stopped]],
      qs: [
        { id: 'q1', type: 'mcq', p: 'A car brakes hard. A passenger who isn\'t wearing a seatbelt lurches forwards. Why?', opts: ['Their body has inertia, so it keeps moving forwards when the car slows down', 'The brakes push the passenger forwards', 'The seat throws them forwards', 'Gravity pulls them forwards'], a: 0, ok: 'Yes. The car slows down, but the passenger keeps going until something stops them. A seatbelt is that something.', why: { 1: 'The brakes act on the wheels, not on the passenger.', 2: 'The seat doesn\'t push forwards. The passenger keeps moving on their own.', 3: 'Gravity pulls down, not forwards.' } },
        { id: 'q2', type: 'mcq', p: 'A magician whips a tablecloth away very quickly, and the plates stay on the table. Why do the plates stay put?', opts: ['The plates have inertia, so they tend to stay still', 'The plates are glued down', 'The tablecloth pushes the plates down', 'Plates have no mass'], a: 0, ok: 'That\'s it. The plates are still, and their inertia keeps them still. The cloth moves so fast that friction has no time to drag them along.', why: { 1: 'No glue needed! Think about what still objects tend to do.', 2: 'The cloth slides away underneath. What keeps the plates still?', 3: 'Plates do have mass, so they have inertia.' } },
        { id: 'q3', type: 'mcq', p: 'A bowling ball (7.3 kg) and a football (0.43 kg) roll towards you at the same speed. Which is harder to stop?', opts: ['The bowling ball', 'The football', 'They are just as hard to stop'], a: 0, ok: 'Correct. The bowling ball has far more mass, so it has far more inertia.', why: { 1: 'Which one has more mass?', 2: 'They have the same speed, but their masses are very different.' } }] },

    /* ---------- Extension ---------- */
    { id: 'x1', title: 'Reading velocity–time graphs', floors: ['air'],
      cards: [
        { html: `<p>Welcome to the Chapter 2 Extension! Velocity–time graphs tell the whole story of a journey. Each shape of line means something different.</p><div class="example">Flat line: steady speed. Line sloping up: speeding up. Line sloping down: slowing down. Line along 0: not moving.</div>` },
        { html: `<p>This time the launch speed is a mystery, so you'll read it from the graph. The free-body diagram is back too, so you can see which forces act at each moment.</p>` }],
      setup() { course(55, 1.8, 30); }, adds: ['launch', 'readD', 'vt', 'fbd', 'readW', 'readN'], hide: ['shove', 'readV'], sides: [], pullers: [], idle: 'Press Launch the crate', mysteryLaunch: true,
      tick() { ch2Record(); },
      tasks: [['Launch the crate. Watch the graph stay flat, then slope down after the brake line.', () => sd(55) != null]],
      qs: [
        { id: 'q1', type: 'reading', p: 'Read the graph. How fast was the crate moving before it reached the brake line?', unit: 'm/s', tol: 0.08, live: () => S.flags.sd && sd(55) != null ? 1.8 : null, need: () => sd(55) != null, needMsg: 'Launch the crate first.', ok: 'Well read! It was gliding at 1.8 m/s.', hints: ['Look at the flat part of the line, before the dashed "brake on" line.'] },
        { id: 'q2', type: 'reading', p: 'How many seconds did the crate take to stop, from "brake on" until the line reaches 0?', unit: 's', tol: 0.25, live: () => S.flags.st && S.flags.st[55], need: () => sd(55) != null, needMsg: 'Launch the crate first.', ok: 'Great graph reading! It took about 3.3 seconds to stop.', hints: ['Find where the dashed "brake on" line is, then where the blue line reaches 0.', 'Take the first time away from the second.'] },
        { id: 'q3', type: 'mcq', p: 'While the crate glides at a steady speed before the brake line, which arrows does its free-body diagram show?', opts: ['Only the weight and the normal force', 'Weight, normal force and a forward force keeping it moving', 'Only a forward force', 'No arrows at all'], a: 0, ok: 'Exactly right. Nothing needs to push it along: with no unbalanced force, it just keeps going. That is Newton\'s first law.', why: { 1: 'Look at the diagram while it glides. Is there a forward arrow? It doesn\'t need one to keep moving.', 2: 'Gravity and the floor still act on it.', 3: 'The crate still has weight, and the floor still holds it up.' } }] },

    { id: 'x2', title: 'Car versus truck', info: [], floors: ['air'],
      cards: [
        { html: `<p>Think of a 40 kg crate as a car and a 120 kg crate as a truck, with 3 times the mass. Both arrive at 2.4 m/s.</p><p>First give them both the same 48 N brake. Then use the <b>Brake force</b> slider to find the brake the truck needs to stop in the <b>same distance</b> as the car.</p>` }],
      setup() { course(40, 2.4, 48); }, adds: ['brake'], hide: ['shove', 'fbd', 'readW', 'readN'], sides: [], pullers: [], idle: 'Press Launch the crate',
      tick() { ch2Record(); const F = S.flags; if (F.sd && F.sd[120] != null && F.sdF[120] >= 140 && Math.abs(F.sd[120] - 2.4) <= 0.06) F.truckOK = true; if (F.sd && F.sd[120] != null && F.sdF[120] === 48) F.truck48 = F.sd[120]; if (F.sd && F.sd[40] != null && F.sdF[40] === 48) F.car48 = F.sd[40]; },
      tasks: [['Launch the <b>40 kg</b> car with a <b>48 N</b> brake.', () => S.flags.car48 != null], ['Launch the <b>120 kg</b> truck with the same <b>48 N</b> brake.', () => S.flags.truck48 != null], ['Change the brake force until the truck stops in the same distance as the car (within 5 cm).', () => !!S.flags.truckOK]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With the 48 N brake, how far did the <b>40 kg car</b> slide?', unit: 'm', tol: 0.04, live: () => S.flags.car48, need: () => S.flags.car48 != null, needMsg: 'Launch the 40 kg crate with a 48 N brake first.', ok: 'Correct!' },
        { id: 'q2', type: 'reading', p: 'With the same 48 N brake, how far did the <b>120 kg truck</b> slide?', unit: 'm', tol: 0.06, live: () => S.flags.truck48, need: () => S.flags.truck48 != null, needMsg: 'Launch the 120 kg crate with a 48 N brake first.', ok: 'Correct! It slid 3 times as far.' },
        { id: 'q3', type: 'num', p: 'What brake force made the 120 kg truck stop in the same distance as the car?', unit: 'N', ans: 144, tol: 2, ok: 'Spot on: 144 N, which is 3 × 48 N.', hints: ['Look at the Brake force number when the truck stopped in about 2.4 m.', 'The truck has 3 times the mass of the car. Try 3 × 48 N.'] },
        { id: 'q4', type: 'mcq', p: 'The truck has 3 times the mass of the car. To stop in the same distance from the same speed, it needs…', opts: ['3 times the brake force', 'the same brake force', 'a third of the brake force', '9 times the brake force'], a: 0, ok: 'Yes. 3 times the mass means 3 times the inertia, so it needs 3 times the force. That is why trucks have much bigger brakes than cars.', why: { 1: 'With the same 48 N, the truck slid much further. It needs more.', 2: 'Less force would make it slide even further!', 3: 'Check the number on the slider when the truck stopped in the right distance.' } }] }
  ],
  review: [
    { id: 'c2r1', type: 'tick', p: 'Tick every statement about inertia that is true.', opts: ['A heavier object has more inertia', 'Inertia makes a moving object keep moving', 'Inertia is a force that pushes things along', 'An object at rest stays at rest unless a force acts on it', 'Light objects have no inertia'], a: [0, 1, 3], work: 'More mass means more inertia; moving objects keep moving and still objects stay still unless a force acts. Inertia is not a force, and every object with mass has some.' },
    { id: 'c2r2', type: 'num', p: 'On the air floor, a shove gives a 30 kg crate a speed of 2.5 m/s. The same shove hits a crate with 5 times the mass (150 kg). What speed does it get?', ans: 0.5, unit: 'm/s', tol: 0.02, work: '5 times the mass gives a speed 5 times smaller: 2.5 ÷ 5 = 0.5 m/s', hints: ['More mass means less speed from the same push.', '5 times the mass, so divide the speed by 5.'] },
    { id: 'c2r3', type: 'mcq', p: 'This velocity–time graph shows a crate on the air floor. What is the crate doing between 2 s and 6 s?' + vtSVG([{ pts: [[0, 0], [1, 0], [1.6, 1.8], [6, 1.8], [8, 1.8]] }], { tMax: 8, vMax: 2.5, vStep: 0.5, alt: 'Velocity rises from 0 to 1.8 m/s between 1 and 1.6 seconds, then stays flat at 1.8 m/s' }), opts: ['Moving at a steady speed of 1.8 m/s', 'Speeding up', 'Slowing down', 'Standing still'], a: 0, work: 'The line is flat at 1.8 m/s, so the speed is not changing.', why: { 1: 'Speeding up would make the line slope upwards.', 2: 'Slowing down would make the line slope downwards.', 3: 'Standing still would put the line along 0.' } },
    { id: 'c2r4', type: 'sort', p: 'Sort these into things that are hard to start or stop, and things that are easy to start or stop.', groups: ['Hard to start or stop', 'Easy to start or stop'], items: [['A loaded lorry', 0], ['A table-tennis ball', 1], ['A full shopping trolley', 0], ['An empty shopping trolley', 1], ['A cargo ship', 0], ['A paper cup', 1]] },
    { id: 'c2r5', type: 'gap', p: 'Newton\'s first law: an object stays ___, or keeps moving at a steady ___ in a straight line, unless an unbalanced ___ acts on it.', ans: [['still', 'at rest', 'stationary'], ['speed', 'velocity'], ['force']] },
    { id: 'c2r6', type: 'explain', p: 'A passenger is standing on a bus. The bus brakes suddenly and the passenger lurches forwards. Use the word inertia to explain why.', model: 'The passenger was moving forwards with the bus. When the bus brakes, the brakes slow the bus down, but nothing slows the passenger straight away. Because of their inertia, the passenger keeps moving forwards, so they lurch forwards until they grab a pole or their feet stop them.', check: ['Says the passenger was moving forwards with the bus', 'Uses the word inertia', 'Says the passenger keeps moving forwards when the bus slows down', 'Says a force (a pole, a seatbelt, their feet) is needed to stop them'] },
    /* Extension */
    { id: 'c2r7', type: 'match', colA: 'Shape of the line', p: 'Match each shape of line on a velocity–time graph to what the object is doing.', rows: [['A flat line above 0', 'Moving at a steady speed'], ['A line sloping upwards', 'Speeding up'], ['A line sloping down to 0', 'Slowing down and stopping'], ['A flat line along 0', 'Standing still']] },
    { id: 'c2r8', type: 'mcq', p: 'Two crates arrive at the same speed and get the same brake force. The graph shows them both. Which line belongs to the heavier crate?' + vtSVG([{ pts: [[0, 2.2], [1, 2.2], [2.5, 0], [8, 0]], col: '#c94a34', label: 'Line 1', lab: 1 }, { pts: [[0, 2.2], [1, 2.2], [6.2, 0], [8, 0]], col: '#11806f', label: 'Line 2', lab: 2 }], { tMax: 8, vMax: 2.5, vStep: 0.5, alt: 'Two lines start at 2.2 m/s. Line 1 drops to 0 at 2.5 seconds; line 2 drops to 0 at 6.2 seconds' }), opts: ['Line 2, because it takes longer to stop', 'Line 1, because it stops more quickly', 'You can\'t tell from the graph', 'Both lines are the same crate'], a: 0, work: 'With the same brake, the crate with more mass (more inertia) takes longer to stop, so its line slopes down more gently: line 2.', why: { 1: 'A heavy crate is harder to stop. Would it stop quickly or slowly?', 2: 'Look at how long each line takes to reach 0.', 3: 'The lines are different, so they are different crates.' } },
    { id: 'c2r9', type: 'num', p: 'A 40 kg crate stops in 2.4 m with a 48 N brake. A 120 kg crate arrives at the same speed and has to stop in the same 2.4 m. What brake force does it need?', ans: 144, unit: 'N', tol: 1, work: '120 kg is 3 times 40 kg, so it needs 3 times the force: 3 × 48 = 144 N', hints: ['How many times heavier is the second crate?', '3 times the mass needs 3 times the force.'] },
    { id: 'c2r12', type: 'fbd', p: 'Draw the free-body diagram of this crate.', scen: { id: 'c2r12', obj: 'crate', label: '52 kg', brief: '<p>A <b>52 kg crate</b> glides to the right across the air floor at a steady <b>1.7 m/s</b>. Nothing is pushing or pulling it, and the air floor has no friction.</p>', forces: [{ type: 'weight', dir: 'down', value: 509.6 }, { type: 'normal', dir: 'up', value: 509.6 }] } },
    { id: 'c2r11', type: 'explain', p: 'Explain why a loaded lorry needs much stronger brakes than a small car, even when they travel at the same speed.', model: 'The loaded lorry has much more mass than the car, so it has much more inertia. With the same brake force it would take much longer and much further to stop. To stop in a safe distance, it needs a much bigger brake force, so it needs stronger brakes.', check: ['Says the lorry has more mass', 'Says more mass means more inertia', 'Says it would take longer or further to stop with the same force', 'Says it needs a bigger force to stop in the same distance'] }
  ]
};
CHDATA.c2.review.forEach(q => { if (q.build) q.build(); });

/* Challenge: the inertia obstacle course. Pick a brake force so each crate stops on the target mark.
   Every launch counts: on target first time scores 4, second time 3, third time 2, then 1. */
CHDATA.c2.challenge = {
  title: 'Inertia obstacle course',
  intro: 'Each crate is launched along the air floor. Choose a brake force so it stops on the target mark, within 15 cm of it. Heavier crates have more inertia, so think before you launch: your score is highest if you hit the target in as few launches as you can.',
  missions: [
    { id: 'b1', kind: 'brake', title: 'Crate 1: a light crate', mass: 33, v0: 2.4, target: 3.0 },
    { id: 'b2', kind: 'brake', title: 'Crate 2: a medium crate', mass: 78, v0: 2.0, target: 2.5 },
    { id: 'b3', kind: 'brake', title: 'Crate 3: a heavy crate', mass: 129, v0: 1.6, target: 1.8 }
  ]
};
