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
  acceleration: ['Acceleration', 'How quickly the speed changes each second, measured in metres per second squared (m/s²).', ['acceleration']],
  velocity: ['Velocity', 'Speed in a particular direction, measured in metres per second (m/s).', ['velocity']],
  speed: ['Speed', 'How far something travels each second, in metres per second (m/s).', []],
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
  vtgraph: ['Velocity–time graph', 'A graph with velocity up the side and time along the bottom. A flat line means a steady speed; a line sloping down means slowing down.', ['velocity–time graph', 'velocity-time graph', 'velocity–time graphs']],
  newton1: ['Newton\'s first law', 'An object stays still, or keeps moving at a steady speed in a straight line, unless an unbalanced force acts on it.', []],
  newton2: ['Newton\'s second law', 'Force = mass × acceleration (F = ma). A bigger resultant force gives a bigger acceleration.', []],
  newton3: ['Newton\'s third law', 'When one object pushes or pulls another, the second pushes or pulls back just as hard, in the opposite direction.', []],
  mechadv: ['Mechanical advantage', 'How many times a machine multiplies your force: load ÷ effort.', []],
  work: ['Work', 'Energy transferred when a force moves something. Work (J) = force (N) × distance (m).', []],
  terminal: ['Terminal velocity', 'The top speed of a falling object, reached when air resistance grows to match its weight.', ['terminal velocity']],
  shove: ['Push (shove)', 'A quick push given to the crate by the arena crew.', []]
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
      const key = GL_ALIASES.find(a => a[0] === m[1].toLowerCase())[1];
      if (seen.has(key)) { // skip this occurrence, look further along
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
