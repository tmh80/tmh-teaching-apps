/* ===== Sections: every chapter is split into self-contained chunks of about 20–30 minutes.
   Each section has its own Learn steps, (optional) Challenge, Check questions and worksheet PDF,
   so a teacher can set one on its own, or put several together for a longer session. ===== */
const SECTIONS = [
  { id: 'c1f', ch: 'c1', n: 1, title: 'What is a force?', part: 'Foundation', stamp: 'Force Spotter',
    blurb: 'Pushes and pulls, newtons, friction, weight, the normal force, and contact and non-contact forces.',
    steps: ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's11'], challenge: null, review: ['r1', 'r2', 'r3', 'r5', 'r9', 'r10'],
    goal: 'Describe a force as a push or a pull measured in newtons, read forces from a newtonmeter, calculate weight from mass (weight = mass × 9.8), and sort forces into contact and non-contact forces.',
    vocab: ['force', 'push', 'pull', 'newton (N)', 'newtonmeter', 'friction', 'weight', 'mass', 'gravity', 'normal force', 'tension', 'air resistance', 'contact force', 'non-contact force'] },
  { id: 'c1x', ch: 'c1', n: 1, title: 'What is a force?', part: 'Extension', stamp: 'Diagram Detective',
    blurb: 'Free-body diagrams: draw every force on an object as an arrow, then become an Arena Inspector.',
    steps: ['s8', 's9', 's10'], challenge: ['m1', 'm2', 'm4'], review: ['r4', 'r6', 'r8', 'r12', 'r11'], needs: 'c1f',
    goal: 'Draw free-body diagrams with every arrow starting at the centre of the object, the right direction and size for each force, and longer arrows for bigger forces; use a diagram to work out a set-up.',
    vocab: ['free-body diagram', 'force arrow', 'weight', 'normal force', 'friction', 'tension', 'scale'] }
];
const STEPMIN = { s0: 3, s4: 3, s9: 3, s10: 4 }, QMIN = { mcq: .5, tap: .5, tick: 1, num: 1.5, reading: 1, gap: 1, match: 1.5, sort: 1.5, table: 2, fbd: 3.5, desk: 3.5, explain: 3 };
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
