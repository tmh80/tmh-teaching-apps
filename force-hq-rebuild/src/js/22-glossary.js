/* ===== Glossary: dotted underline + tap/hover definitions ===== */
const TERMS = {
  force: ['Force', 'A push or a pull. Forces can make things start moving, stop, speed up, slow down or change direction.', ['forces', 'force']],
  push: ['Push', 'A force that moves something away from you.', []],
  pull: ['Pull', 'A force that moves something towards you.', []],
  newton: ['Newton (N)', 'The unit we use to measure force. One newton is about the weight of a small apple.', ['newtons']],
  newtonmeter: ['Newtonmeter', 'A tool for measuring forces. It has a spring inside that stretches more when the force is bigger.', ['newtonmeter', 'newtonmeters']],
  contact: ['Contact force', 'A force that only acts when two things are touching, like friction, a push or the normal force.', ['contact forces', 'contact force']],
  noncontact: ['Non-contact force', 'A force that can act across a gap, without touching. Gravity and magnetism are non-contact forces.', ['non-contact forces', 'non-contact force']],
  friction: ['Friction', 'A force between two surfaces that rub or try to slide past each other. It always acts against the motion, or against the way something is trying to move.', ['friction']],
  staticfr: ['Static friction', 'Friction on something that is not moving yet. It grows to match the pull, up to a limit. Once the pull beats that limit, the object starts to slide.', ['static friction']],
  mu: ['Coefficient of friction (μ)', 'A number that tells you how grippy two surfaces are together. A bigger μ means more friction.', ['coefficient of friction']],
  weight: ['Weight', 'The pull of gravity on an object, measured in newtons. Weight = mass × g, and on Earth g = 9.8 N/kg.', ['weight']],
  mass: ['Mass', 'How much matter (stuff) is in an object, measured in kilograms (kg). Your mass is the same on Earth and on the Moon.', ['mass']],
  gravity: ['Gravity', 'The non-contact force that pulls objects towards each other. Earth\'s gravity pulls everything towards its centre.', ['gravity']],
  gfs: ['Gravitational field strength (g)', 'How strongly gravity pulls on each kilogram. On Earth, g = 9.8 newtons for every kilogram (9.8 N/kg).', ['gravitational field strength']],
  normal: ['Normal force', 'The push from a surface back up against an object resting on it. "Normal" means "at right angles", because it pushes straight out of the surface.', ['normal force', 'normal forces']],
  tension: ['Tension', 'The pulling force in a stretched rope, string or cable.', ['tension']],
  airres: ['Air resistance', 'A type of friction from the air. It pushes against things moving through the air, and it gets bigger as they go faster.', ['air resistance']],
  magnetic: ['Magnetic force', 'The non-contact push or pull between magnets, or between a magnet and some metals such as iron.', ['magnetic force']],
  fbd: ['Free-body diagram', 'A diagram that shows every force acting on one object. Each force is an arrow that starts at the centre of the object. The arrow\'s length shows the size of the force, and it points the way the force acts.', ['free-body diagrams', 'free-body diagram']],
  arrow: ['Force arrow', 'An arrow that shows a force. Longer arrows mean bigger forces.', ['force arrow', 'force arrows']],
  leftpull: ['Left pull', 'The total force from the team pulling to the left, measured by the newtonmeter in the left rope.', []],
  rightpull: ['Right pull', 'The total force from the team pulling to the right, measured by the newtonmeter in the right rope.', []],
  resultant: ['Resultant force', 'The overall force on an object when all the forces are added up. Forces in opposite directions cancel out.', ['resultant force', 'resultant']],
  balanced: ['Balanced forces', 'Forces that cancel out, so the resultant force is zero.', ['balanced forces', 'balanced']],
  unbalanced: ['Unbalanced forces', 'Forces that don\'t cancel out, so there is a resultant force.', ['unbalanced forces', 'unbalanced']],
  acceleration: ['Acceleration', 'How quickly the velocity changes each second, measured in metres per second squared (m/s²).', ['acceleration']],
  velocity: ['Velocity', 'How fast something is moving, and in which direction, measured in metres per second (m/s).', ['velocity']],
  inertia: ['Inertia', 'How hard it is to change the way something is moving. Objects with more mass have more inertia.', ['inertia']],
  airfloor: ['Air floor', 'A floor that blows air up through tiny holes, so objects float on a cushion of air with no friction at all.', ['air floor']],
  upthrust: ['Upthrust', 'The upward push from a liquid or gas on an object in it. It helps things float.', ['upthrust']],
  thrust: ['Thrust', 'A force that pushes something forwards, like the push from a rocket engine.', []],
  drive: ['Driving force', 'The forward force that makes a vehicle or animal move, from wheels or feet pushing back on the ground.', ['driving force']],
  kg: ['Kilogram (kg)', 'The unit of mass.', ['kilograms']],
  scale: ['Scale', 'On a free-body diagram drawn to scale, the same length always stands for the same number of newtons, for example 1 square = 50 N.', ['to scale']],
  centre: ['Centre of the object', 'On a free-body diagram, every force arrow starts from the middle of the object.', []],
  brake: ['Brake', 'Something that pushes back against a moving object to slow it down and stop it.', ['brakes', 'brake']],
  brakingdist: ['Braking distance', 'How far an object travels from the moment the brake comes on until it stops.', ['braking distance']],
  vtgraph: ['Velocity–time graph', 'A graph with velocity up the side and time along the bottom. A flat line means a steady velocity; a line sloping down means slowing down.', ['velocity–time graph', 'velocity-time graph', 'velocity–time graphs']],
  newton1: ['Newton\'s first law', 'An object stays still, or keeps moving at a steady velocity in a straight line, unless an unbalanced force acts on it.', []],
  newton2: ['Newton\'s second law', 'Force = mass × acceleration (F = ma). A bigger resultant force gives a bigger acceleration.', []],
  newton3: ['Newton\'s third law', 'When one object pushes or pulls another, the second pushes or pulls back just as hard, in the opposite direction.', []],
  mechadv: ['Mechanical advantage', 'How many times a machine multiplies your force: load ÷ effort.', []],
  work: ['Work', 'Energy transferred when a force moves something. Work (J) = force (N) × distance (m).', []],
  terminal: ['Terminal velocity', 'The top velocity of a falling object, reached when air resistance grows to match its weight.', ['terminal velocity']],
  triangle: ['Formula triangle', 'A triangle with F on top, and m and a side by side underneath. Cover the letter you want to find. What is left tells you the sum: side by side means multiply, one above the other means divide.', ['formula triangle']],
  mps2: ['Metres per second squared (m/s²)', 'The unit of acceleration. An acceleration of 2 m/s² means the velocity goes up by 2 m/s every second.', []],
  slope: ['Slope (gradient)', 'How steep a line is. On a velocity–time graph, the steeper the line, the bigger the acceleration.', ['slope', 'gradient']],
  decel: ['Deceleration', 'Slowing down. It is an acceleration that points the opposite way to the motion.', ['deceleration']],
  unit: ['Unit', 'What a measurement is counted in, such as N, kg or m/s². An answer needs its unit as well as its number.', ['unit', 'units']],
  proportional: ['Directly proportional', 'Two things are directly proportional when doubling one doubles the other, and halving one halves the other.', ['directly proportional']],
  forcepair: ['Force pair', 'Two forces that two objects exert on each other. They are the same size, point in opposite directions, are the same type of force and act on different objects.', ['force pair', 'force pairs']],
  action: ['Action', 'One force in a force pair. The other force is the reaction. Neither comes first: they happen at exactly the same time.', ['action']],
  reaction: ['Reaction', 'The other force in a force pair: the push or pull back from the object you pushed or pulled.', ['reaction']],
  thruster: ['Thruster', 'A small rocket on a spacecraft. It throws gas out one way, and the gas pushes the spacecraft the other way.', ['thrusters', 'thruster']],
  shove: ['Push (shove)', 'A quick push given to the crate by the arena crew.', []],
  /* Chapter 5 words (4th item: the chapters where the word is auto-underlined, because lift, drag and hover are ordinary words elsewhere) */
  parachute: ['Parachute', 'A big fabric canopy that a skydiver or a crate opens to make the air resistance much bigger, so it falls much more slowly.', ['parachute', 'parachutes'], [5]],
  canopy: ['Canopy', 'The large fabric part of a parachute. A bigger canopy pushes more air out of the way, so the air resistance is bigger.', ['canopy', 'canopies'], [5]],
  lift: ['Lift', 'The upward force on a helicopter or a plane. A helicopter\'s blades push air down, so the air pushes the helicopter up.', ['lift'], [5]],
  hover: ['Hover', 'To stay still in the air. A hovering helicopter\'s lift is exactly equal to its weight.', ['hover', 'hovers', 'hovering'], [5]],
  vacuum: ['Vacuum', 'A space with no air in it at all, so there is no air resistance.', ['vacuum'], [5]],
  drag: ['Drag', 'Another name for air resistance (or water resistance): a force that pushes against an object moving through a fluid.', ['drag'], [5]],
  graph: ['Graph', 'A picture of data that shows how one thing changes when another thing changes.', []],
  scattergraph: ['Scatter graph', 'A graph with a point for each result. Use one when the thing you changed is a number, like a mass or a force.', ['scatter graph', 'scatter graphs']],
  bargraph: ['Bar graph', 'A graph with a bar for each result. Use one when the thing you changed is a name or a group, like different floors or shoes.', ['bar graph', 'bar graphs']],
  axis: ['Axis', 'One of the two number lines on a graph. The bottom axis shows what you changed, and the side axis shows what you measured. More than one axis are called axes.', []],
  trend: ['Trend', 'The overall pattern in data, such as "as the mass goes up, the braking distance goes up".', []],
  claim: ['Claim', 'The first part of a CER paragraph: a sentence that answers the question.', []],
  evidence: ['Evidence', 'The second part of a CER paragraph: numbers from a test, each with its unit, or facts from something you read, that back up the claim.', []],
  reasoning: ['Reasoning', 'The third part of a CER paragraph: the science that explains why the evidence supports the claim.', []],
  cer: ['CER', 'A science paragraph in three parts: Claim, Evidence and Reasoning. Say it, show it, explain it.', ['CER']],
  hypothesis: ['Hypothesis', 'A prediction that can be tested, such as "twice the pull will give twice the acceleration".', ['hypothesis', 'hypotheses']],
  factor: ['Factor', 'Something to think about when you weigh up a decision. In Force HQ the factors are society, environment, economy and health.', []],
  judgement: ['Judgement', 'A decision you make after weighing up the pros and cons, with a reason for your choice.', []],
  interpret: ['Interpret', 'Find the pattern in data and say what it means.', []],
  describe: ['Describe', 'Say what happens, with details.', []],
  analyse: ['Analyse', 'Break something into parts and see how the parts connect.', []],
  discuss: ['Discuss', 'Look at different sides, use evidence, then decide.', []]
};
/* auto-underline the first use of each term inside any element with class "gl" */
const GL_ALIASES = Object.entries(TERMS).flatMap(([k, [, , al]]) => (al || []).map(a => [a.toLowerCase(), k])).sort((a, b) => b[0].length - a[0].length);
const GL_RE = new RegExp('\\b(' + GL_ALIASES.map(a => a[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'i');
function glossify(root) {
  const seen = new Set($$('.gw,.term', root).map(e => e.dataset.t));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest('button,input,textarea,select,.gw,.term,svg,canvas,label.noglos,.noglos,h1,h2,h3,option') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (let node of nodes) {
    let guard = 0;
    while (node && guard++ < 6) {
      const m = GL_RE.exec(node.nodeValue); if (!m) break;
      const key = GL_ALIASES.find(a => a[0] === m[1].toLowerCase())[1], only = TERMS[key][3];
      if (seen.has(key) || (only && !(typeof CH !== 'undefined' && CH && only.includes(CH.n)))) { // skip this occurrence, look further along
        const rest = node.splitText(m.index + m[0].length); node = rest; continue;
      }
      seen.add(key);
      const mid = node.splitText(m.index), after = mid.splitText(m[0].length);
      const sp = document.createElement('span'); sp.className = 'gw'; sp.dataset.t = key; sp.tabIndex = 0; sp.textContent = mid.nodeValue; mid.replaceWith(sp); node = after;
    }
  }
}
let glPending = new Set();
function initGlossary() {
  const obs = new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) { if (n.nodeType !== 1) continue; if (n.classList && n.classList.contains('gl')) glPending.add(n); n.querySelectorAll && n.querySelectorAll('.gl').forEach(x => glPending.add(x)); if (n.closest && n.closest('.gl')) glPending.add(n.closest('.gl')); }
    if (glPending.size) requestAnimationFrame(() => { const list = [...glPending]; glPending.clear(); obs.disconnect(); list.forEach(r => { if (r.isConnected) glossify(r); }); obs.observe(document.body, { childList: true, subtree: true }); });
  });
  obs.observe(document.body, { childList: true, subtree: true });
  let lastTap = 0;
  const showDef = (el) => {
    const t = TERMS[el.dataset.t]; if (!t) return; if (!el.closest('.journal')) vocabMet(el.dataset.t); const p = $('#gpop'); p.innerHTML = `<b>${t[0]}</b><br>${t[1]}`; p.hidden = false;
    const r = el.getBoundingClientRect(); const w = Math.min(300, innerWidth - 20); p.style.maxWidth = w + 'px';
    const left = clamp(r.left, 10, innerWidth - w - 10); p.style.left = left + 'px';
    const below = r.bottom + 8, ph = p.offsetHeight; p.style.top = (below + ph > innerHeight - 10 ? Math.max(10, r.top - ph - 8) : below) + 'px';
  };
  const hide = () => $('#gpop').hidden = true;
  document.addEventListener('mouseover', e => { const el = e.target.closest('.gw,.term'); if (el && matchMedia('(hover:hover)').matches) showDef(el); });
  document.addEventListener('mouseout', e => { if (e.target.closest('.gw,.term') && matchMedia('(hover:hover)').matches) hide(); });
  document.addEventListener('focusin', e => { const el = e.target.closest && e.target.closest('.gw,.term'); if (el) showDef(el); });
  document.addEventListener('focusout', e => { if (e.target.closest && e.target.closest('.gw,.term')) hide(); });
  document.addEventListener('click', e => { const el = e.target.closest('.gw,.term'); if (el) { if (Date.now() - lastTap < 250) return; lastTap = Date.now(); const p = $('#gpop'); if (!p.hidden && p.dataset.for === el.dataset.t) { hide(); p.dataset.for = ''; } else { showDef(el); p.dataset.for = el.dataset.t; } } else hide(); });
  window.addEventListener('scroll', hide, { passive: true });
  setInterval(vocabWatch, 700);
}
/* Key vocabulary: a word is "met" once it is underlined on screen (or its definition pops up).
   Met words collect in the Journal's Key vocabulary section, ready for flashcards later. */
function vocabMet(k) {
  if (!TERMS[k]) return; const V = dbGet('vocab', {}); if (V[k]) return;
  V[k] = { at: Date.now(), where: typeof runWhere === 'function' ? runWhere().label : '' }; dbSet('vocab', V);
}
let VOCAB_IO = null;
function vocabWatch() {
  if (!('IntersectionObserver' in window)) { $$('.gw,.term').forEach(e => { if (e.offsetParent && !e.closest('.journal')) vocabMet(e.dataset.t); }); return; }
  if (!VOCAB_IO) VOCAB_IO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting && en.target.offsetParent && !en.target.closest('.journal')) { vocabMet(en.target.dataset.t); VOCAB_IO.unobserve(en.target); } }), { threshold: 0.6 });
  $$('.gw:not([data-vw]),.term:not([data-vw])').forEach(e => { e.dataset.vw = '1'; VOCAB_IO.observe(e); });
}
const T = (k, txt) => `<span class="gw" data-t="${k}" tabindex="0">${txt || TERMS[k][0]}</span>`;
