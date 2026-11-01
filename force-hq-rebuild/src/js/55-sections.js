/* ===== Sections: every chapter is split into self-contained chunks of about 20–30 minutes.
   Each section has its own Learn steps, (optional) Challenge, Check questions and worksheet PDF,
   so a teacher can set one on its own, or put several together for a longer session. ===== */
const SECTIONS = [
  { id: 'c1f', ch: 'c1', n: 1, title: 'What is a force?', part: 'Foundation', stamp: 'Force Spotter',
    blurb: 'Pushes and pulls, newtons, resultant force, friction, weight, the normal force, and contact and non-contact forces.',
    steps: ['s0', 's1', 's2', 's3', 's3r', 's4', 's5', 's6', 's7'], challenge: null, review: ['r1', 'r2', 'r3', 'r13', 'r5', 'r9', 'r10'],
    goal: 'Describe a force as a push or a pull measured in newtons, read forces from a newtonmeter, work out the resultant force and say whether forces are balanced or unbalanced, calculate weight from mass (weight = mass × 9.8), and sort forces into contact and non-contact forces.',
    vocab: ['force', 'push', 'pull', 'newton (N)', 'newtonmeter', 'resultant force', 'balanced forces', 'unbalanced forces', 'friction', 'weight', 'mass', 'gravity', 'normal force', 'tension', 'air resistance', 'contact force', 'non-contact force'] },
  { id: 'c1x', ch: 'c1', n: 1, title: 'What is a force?', part: 'Extension', stamp: 'Diagram Detective',
    blurb: 'Free-body diagrams: draw every force on an object as an arrow, then become an Arena Inspector.',
    steps: ['s8', 's9', 's10'], challenge: ['m1', 'm2', 'm4'], review: ['r4', 'r6', 'r8', 'r12', 'r11'], needs: 'c1f',
    goal: 'Draw free-body diagrams with every arrow starting at the centre of the object, the right direction and size for each force, and longer arrows for bigger forces; use a diagram to work out a set-up.',
    vocab: ['free-body diagram', 'force arrow', 'weight', 'normal force', 'friction', 'tension', 'scale'] },
  { id: 'c2f', ch: 'c2', n: 2, title: 'Inertia', part: 'Foundation', stamp: 'Inertia Expert',
    blurb: 'The same push on light and heavy crates, stopping with a brake, the velocity–time graph and Newton\'s first law.',
    steps: ['i1', 'i2', 'i3', 'i4', 'i5', 'i6'], challenge: null, review: ['c2r1', 'c2r2', 'c2r3', 'c2r4', 'c2r5', 'c2r6'],
    goal: 'Explain that objects with more mass have more inertia, so they are harder to start moving and harder to stop; read a velocity from a velocity–time graph; state Newton\'s first law and use it to explain everyday examples.',
    vocab: ['inertia', 'mass', 'velocity', 'velocity–time graph', 'brake', 'braking distance', 'Newton\'s first law', 'unbalanced force'] },
  { id: 'c2x', ch: 'c2', n: 2, title: 'Inertia', part: 'Extension', stamp: 'Brake Master',
    blurb: 'Read the shape of a velocity–time graph, compare a car and a truck, then run the inertia obstacle course.',
    steps: ['x1', 'x2'], challenge: ['b1', 'b2', 'b3'], review: ['c2r7', 'c2r8', 'c2r9', 'c2r12', 'c2r11'], needs: 'c2f',
    goal: 'Describe motion from the shape of a velocity–time graph; explain why more mass needs a bigger force to stop in the same distance; draw the free-body diagram of an object gliding at a steady velocity.',
    vocab: ['velocity–time graph', 'inertia', 'braking distance', 'brake', 'free-body diagram', 'Newton\'s first law'] },
  { id: 'c3f', ch: 'c3', n: 3, title: 'F = ma', part: 'Foundation', stamp: 'Formula Pro',
    blurb: 'Husky sleds in the Snow Arena: acceleration, the formula triangle, finding F, m and a, friction, and lots of maths practice.',
    steps: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'], challenge: null, review: ['c3r2', 'c3r3', 'c3r4', 'c3r5', 'c3r6', 'c3r7', 'c3r8'],
    goal: 'Describe how the resultant force and the mass of an object affect its acceleration; use F = ma and the formula triangle to find the force, the mass or the acceleration; work out the resultant force when friction acts, then use it in F = ma.',
    vocab: ['acceleration', 'm/s²', 'resultant force', 'Newton\'s second law', 'formula triangle', 'friction', 'mass', 'unit'] },
  { id: 'c3x', ch: 'c3', n: 3, title: 'F = ma', part: 'Extension', stamp: 'Mail Run Master',
    blurb: 'Read acceleration from a graph, work with friction on fresh powder, mix weight and mass, then run the mail.',
    steps: ['e1', 'e2', 'e3'], challenge: ['n1', 'n2', 'n3'], review: ['c3r9', 'c3r10', 'c3r12', 'c3r13', 'c3r14'], needs: 'c3f',
    goal: 'Find acceleration from the slope of a velocity–time graph; solve two-step problems (resultant force first, then F = ma); turn weight into mass before using F = ma; choose the number of huskies for a target acceleration; draw the free-body diagram of an accelerating sled.',
    vocab: ['acceleration', 'velocity–time graph', 'slope', 'resultant force', 'friction', 'weight', 'mass', 'Newton\'s second law'] },
  { id: 'c4f', ch: 'c4', n: 4, title: 'Action and reaction', part: 'Foundation', stamp: 'Pair Finder',
    blurb: 'Push off in the Space Dome: force pairs, Newton\'s third law, and why the lighter object ends up going faster.',
    steps: ['f1', 'f2', 'f3', 'f4', 'f5'], challenge: null, review: ['c4r1', 'c4r2', 'c4r3', 'c4r4', 'c4r5', 'c4r6', 'c4r7', 'c4r8'],
    goal: 'State Newton\'s third law; describe a force pair (the same size, opposite directions, on different objects); use F = ma to explain why the lighter object in a pair speeds up more; explain why force pairs do not cancel.',
    vocab: ['Newton\'s third law', 'force pair', 'action', 'reaction', 'mass', 'velocity', 'force', 'acceleration'] },
  { id: 'c4x', ch: 'c4', n: 4, title: 'Action and reaction', part: 'Extension', stamp: 'Docking Commander',
    blurb: 'Thrusters and rockets, then mission control\'s docking orders: work out the push that gives the right docking velocity.',
    steps: ['g1', 'g2'], challenge: ['o1', 'o2', 'o3'], review: ['c4r9', 'c4r10', 'c4r11', 'c4r12', 'c4r13'], needs: 'c4f',
    goal: 'Explain how thrusters and rockets use force pairs; work out the push needed for a target velocity using force = mass × velocity; keep the astronaut\'s velocity within a limit by choosing their mass.',
    vocab: ['thruster', 'force pair', 'Newton\'s third law', 'Newton\'s first law', 'mass', 'force'] },
  { id: 'c5f', ch: 'c5', n: 5, title: 'Falling and terminal velocity', part: 'Foundation', stamp: 'Skydive Spotter',
    blurb: 'Drop a crate and a skydiver, pause the fall to read the forces, and find out why the velocity stops going up and what a parachute does.',
    steps: ['d1', 'd2', 'd3', 'd4'], challenge: null, review: ['c5r1', 'c5r2', 'c5r3', 'c5r4', 'c5r5', 'c5r6', 'c5r7'],
    goal: 'Describe how weight and air resistance change during a fall; use balanced forces to explain terminal velocity; say what happens to the forces and the velocity when a parachute opens.',
    vocab: ['air resistance', 'weight', 'terminal velocity', 'balanced forces', 'resultant force', 'parachute', 'canopy'] },
  { id: 'c5x', ch: 'c5', n: 5, title: 'Falling and terminal velocity', part: 'Extension', stamp: 'Planet Hopper',
    blurb: 'Race a feather and a crate with and without air, drop on other worlds, make the helicopter hover, then deliver three loads on Earth, Mars and Venus.',
    steps: ['p1', 'p2', 'p3'], challenge: ['z1', 'z2', 'z3'], review: ['c5r8', 'c5r9', 'c5r10', 'c5r11', 'c5r12'], needs: 'c5f',
    goal: 'Explain why heavy and light objects fall differently in air but not in a vacuum; use W = m × g to find weight on different worlds; explain how the lift of a hovering helicopter equals its weight; choose a canopy and an opening height for a safe landing.',
    vocab: ['air resistance', 'weight', 'terminal velocity', 'gravitational field strength', 'vacuum', 'lift', 'hover', 'parachute'] },
  { id: 'c6a', ch: 'c6', n: 6, title: 'Levers', part: 'Part 1', stamp: 'Lever Learner',
    blurb: 'Lift a heavy rock by hand, then with a lever. Move the fulcrum, find the catch, and meet the three classes of lever.',
    steps: ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'], challenge: null, review: ['c6r1', 'c6r2', 'c6r3', 'c6r4', 'c6r5'],
    goal: 'Name the three parts of a lever (fulcrum, load and effort); explain how moving the fulcrum changes the effort; state the rule that a machine can make the effort smaller or move the load a bigger distance, depending on how it is used; name the three classes of lever by what is in the middle.',
    vocab: ['machine', 'lever', 'fulcrum', 'load', 'effort'] },
  { id: 'c6b', ch: 'c6', n: 6, title: 'Pulleys, wheels and ramps', part: 'Part 2', stamp: 'Toolkit Packer',
    blurb: 'Pulleys, a winch, ramps, and wedges and screws (ramps in disguise): the rest of the simple machines, each with the same catch.',
    steps: ['pl1', 'pl2', 'pl3', 'pl4'], challenge: null, review: ['c6r7', 'c6r8', 'c6r9', 'c6r10', 'c6r11'], needs: 'c6a',
    goal: 'Describe how pulleys, a wheel and axle, ramps, wedges and screws each let a small effort move a big load; find out how adding supporting ropes, lengthening a handle or a ramp, or thinning a wedge changes the effort; explain the catch that a smaller effort needs a bigger distance.',
    vocab: ['pulley', 'supporting rope', 'wheel and axle', 'winch', 'inclined plane', 'wedge', 'screw'] }
];
const STEPMIN = { s0: 3, s4: 3, s9: 3, s10: 4, i1: 3, i4: 3, x1: 3, x2: 4, a1: 3, a3: 3, a5: 3, a6: 5, e1: 3, e2: 3, f1: 3, f2: 4, f3: 4, f4: 3, f5: 5, g1: 4, g2: 4, d1: 4, d2: 5, d3: 4, d4: 5, p1: 4, p2: 5, p3: 3, lv1: 5, lv2: 5, lv3: 5, lv4: 5, lv5: 4, pl1: 6, pl2: 4, pl3: 4, pl4: 5 }, QMIN = { mcq: .5, tap: .5, tick: 1, num: 1.5, reading: 1, gap: 1, match: 1.5, sort: 1.5, table: 2, fbd: 3.5, desk: 3.5, explain: 3, order: 1.5, calcorder: 3, pick: 1, reason: 1, fix: 1.5, freeze: 3, spot: 1, sketch: 2 };
CHDATA.c1.review.push({ id: 'r12', obj: ['Aii'], seed: '1', type: 'mcq', p: 'On a free-body diagram drawn to scale, a 600 N weight arrow is 3 cm long. How long should the arrow for a 200 N pull be?', opts: ['1 cm', '2 cm', '3 cm', '6 cm'], a: 0, work: '600 N is 3 cm, so every 200 N is 1 cm. A 200 N force gets an arrow 1 cm long.', why: { 1: 'Work out how many newtons each centimetre stands for first.', 2: 'A smaller force needs a shorter arrow.', 3: 'A smaller force needs a shorter arrow, not a longer one.' } });
SECTIONS.forEach(sec => {
  const C = CHDATA[sec.ch];
  CHDATA[sec.id] = {
    sec, allSteps: C.steps, steps: sec.steps.map(id => C.steps.find(s => s.id === id)),
    review: sec.review.map(id => C.review.find(q => q.id === id)),
    challenge: sec.challenge ? { ...C.challenge, missions: C.challenge.missions.filter(m => sec.challenge.includes(m.id)) } : null,
    goal: sec.goal, vocab: sec.vocab
  };
});
/* estimated minutes for each part of a section */
function secMins(id) {
  const d = CHDATA[id], learn = d.steps.reduce((a, s) => a + (STEPMIN[s.id] || 2), 0), chal = d.challenge ? d.challenge.missions.reduce((a, m) => a + (m.kind === 'build' ? 4 : 3), 0) : 0, rev = d.review.reduce((a, q) => a + (QMIN[q.type] || 1), 0);
  return { learn: Math.round(learn), challenge: Math.round(chal), review: Math.round(rev), total: Math.round(learn + chal + rev) };
}
const secOf = id => SECTIONS.find(s => s.id === id);
