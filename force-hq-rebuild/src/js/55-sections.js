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
    goal: 'Explain that objects with more mass have more inertia, so they are harder to start moving and harder to stop; read a speed from a velocity–time graph; state Newton\'s first law and use it to explain everyday examples.',
    vocab: ['inertia', 'mass', 'velocity', 'velocity–time graph', 'brake', 'braking distance', 'Newton\'s first law', 'unbalanced force'] },
  { id: 'c2x', ch: 'c2', n: 2, title: 'Inertia', part: 'Extension', stamp: 'Brake Master',
    blurb: 'Read the shape of a velocity–time graph, compare a car and a truck, then run the inertia obstacle course.',
    steps: ['x1', 'x2'], challenge: ['b1', 'b2', 'b3'], review: ['c2r7', 'c2r8', 'c2r9', 'c2r12', 'c2r11'], needs: 'c2f',
    goal: 'Describe motion from the shape of a velocity–time graph; explain why more mass needs a bigger force to stop in the same distance; draw the free-body diagram of an object gliding at a steady speed.',
    vocab: ['velocity–time graph', 'inertia', 'braking distance', 'brake', 'free-body diagram', 'Newton\'s first law'] },
  { id: 'c3f', ch: 'c3', n: 3, title: 'F = ma', part: 'Foundation', stamp: 'Formula Pro',
    blurb: 'Husky sleds in the Snow Arena: acceleration, the formula triangle, finding F, m and a, friction, and lots of maths practice.',
    steps: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'], challenge: null, review: ['c3r1', 'c3r2', 'c3r3', 'c3r4', 'c3r5', 'c3r6', 'c3r7', 'c3r8'],
    goal: 'Describe how the resultant force and the mass of an object affect its acceleration; use F = ma and the formula triangle to find the force, the mass or the acceleration; work out the resultant force when friction acts, then use it in F = ma.',
    vocab: ['acceleration', 'm/s²', 'resultant force', 'Newton\'s second law', 'formula triangle', 'friction', 'mass', 'unit'] },
  { id: 'c3x', ch: 'c3', n: 3, title: 'F = ma', part: 'Extension', stamp: 'Mail Run Master',
    blurb: 'Read acceleration from a graph, work with friction on fresh powder, mix weight and mass, then run the mail.',
    steps: ['e1', 'e2', 'e3'], challenge: ['n1', 'n2', 'n3'], review: ['c3r9', 'c3r10', 'c3r11', 'c3r12', 'c3r13', 'c3r14'], needs: 'c3f',
    goal: 'Find acceleration from the slope of a velocity–time graph; solve two-step problems (resultant force first, then F = ma); turn weight into mass before using F = ma; choose the number of huskies for a target acceleration; draw the free-body diagram of an accelerating sled.',
    vocab: ['acceleration', 'velocity–time graph', 'slope', 'resultant force', 'friction', 'weight', 'mass', 'Newton\'s second law'] }
];
const STEPMIN = { s0: 3, s4: 3, s9: 3, s10: 4, i1: 3, i4: 3, x1: 3, x2: 4, a1: 3, a3: 3, a5: 3, a6: 5, e1: 3, e2: 3 }, QMIN = { mcq: .5, tap: .5, tick: 1, num: 1.5, reading: 1, gap: 1, match: 1.5, sort: 1.5, table: 2, fbd: 3.5, desk: 3.5, explain: 3 };
CHDATA.c1.review.push({ id: 'r12', seed: '1', type: 'mcq', p: 'On a free-body diagram drawn to scale, a 600 N weight arrow is 3 cm long. How long should the arrow for a 200 N pull be?', opts: ['1 cm', '2 cm', '3 cm', '6 cm'], a: 0, work: '600 N is 3 cm, so every 200 N is 1 cm. A 200 N force gets an arrow 1 cm long.', why: { 1: 'Work out how many newtons each centimetre stands for first.', 2: 'A smaller force needs a shorter arrow.', 3: 'A smaller force needs a shorter arrow, not a longer one.' } });
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
