/* ===== Part 5 story: the guided start (two legs), the three ending cards and the "good place to stop" pop-up ===== */

/* ---------- the guided start, about 5 minutes, before the free build (stage 4, spec section 11) ----------
   It replaces the old lever warm-up and the "Mission computer" prediction box. Skip is always allowed and nothing waits on it.
   The student frees the boulder with a lever, builds leg 1 (ramp, pulley block, winch) up to the shelf, then drops leg 2 beside the ghost Gumdrop, then fills in the route strip
   and tests it in the simulator. Each step ticks itself from the rig. State lives in chal.c6e.gl.guide: 'on' while it is open, 'done' or 'skip' once it is closed.
   The boulder pull is shown here because it is practice; after this the strip is where the student works out every number. */
function glWarmLever() { return GLB.rig && GLB.rig.parts.find(p => p.type === 'lever' && p.role === 'boulder'); }
const glgLeg = i => GLB.ev && GLB.ev.legs[i];
/* "do this next" for the guided start (Tom, 9 Nov 2026): a step's need() says which tray tile, or which button in the settings panel, to pulse (ndApply in 4n-boardkit.js). Board data only, never text. */
const glgAddon = (type, btn) => { const q = GLB.rig.parts.find(p => p.type === type); if (!q) return { tile: type }; return GLB.dockId === q.id ? { sel: `[data-gm="${btn}"]` } : null; };
function glGuideThrob() {
  const roots = [$('#glTray'), $('#glDock')]; if (!roots[0]) return; const st = glState();
  if (st.guide !== 'on' || (GLR && GLR.on)) { ndApply([], roots); return; }
  const done = GLG_STEPS.map(s => { try { return !!s.done(); } catch (_) { return false; } }), s = GLG_STEPS[done.indexOf(false)]; let n = null, el = null;
  try { n = s && s.need ? s.need() : null; } catch (_) { n = null; }
  if (n && n.tile) el = $(`#glTray [data-add="${n.tile}"]`); else if (n && n.sel) el = $(n.sel, $('#glDock'));
  ndApply(el ? [el] : [], roots);
}
const GLG_STEPS = [
  { t: 'First, free the Gumdrop. Drag a <b>lever</b> from the tray onto the boulder. It glows when it\'s in the right place.', why: 'A lever turns on a fulcrum. It gives a mechanical advantage, so Smooshy needs less pull.', done: () => !!glWarmLever(), need: () => glWarmLever() ? null : { tile: 'lever' } },
  { t: 'Tap the lever and make its <b>load arm</b> shorter until Smooshy\'s pull on the boulder is <b>60 N or less</b>.', why: 'Lever MA = effort arm ÷ load arm. Smooshy\'s pull = 252 N ÷ MA. A shorter load arm gives a bigger MA.', done: () => { const b = GLB.ev && GLB.ev.boulder; return !!(b && b.ok && b.how === 'lever'); }, live: true, need: () => { const l = glWarmLever(); return l && GLB.dockId === l.id ? { sel: '[data-gm="arm-"]' } : null; } },
  { t: 'Leg 1. Drag a <b>ramp</b> next to the Gumdrop. It snaps on, and its rope clips onto the Gumdrop\'s ◉ hook.', why: 'A ramp lets Smooshy pull the Gumdrop up a slope instead of lifting it straight up.', done: () => { const l = glgLeg(0); return !!(l && l.type === 'ramp' && l.roped); }, need: () => GLB.rig.parts.some(p => p.type === 'ramp') ? null : { tile: 'ramp' } },
  { t: 'Drag the white handle at the top of the ramp up to the shelf, 6 m up.', why: 'Ramp MA = length ÷ rise. A longer ramp means a smaller pull, but a longer way to pull.', done: () => { const l = glgLeg(0); return !!(l && l.type === 'ramp' && l.end.y >= 5.9 && !l.faults.length); } },
  { t: 'Clip a <b>pulley block</b> onto the ramp\'s ◉ dot at the top, then tap it and choose <b>4 ropes</b>.', why: 'Each supporting rope shares the load, so the pulley block\'s MA is its number of ropes.', done: () => { const l = glgLeg(0); return !!(l && l.type === 'ramp' && l.addons.some(id => { const q = glPart(id); return q && q.type === 'block' && q.ropes >= 3; })); }, need: () => glgAddon('block', 'ropes4') },
  { t: 'Clip a <b>winch</b> onto the end of the pulley block\'s rope, then tap it and choose <b>×7</b>.', why: 'A winch multiplies the MA by its gear ratio. The total MA of a leg is every machine\'s MA multiplied together.', done: () => { const l = glgLeg(0); return !!(l && l.winches.some(w => w >= 6)); }, need: () => glgAddon('winch', 'ratio7') },
  { t: 'Leg 2. The ghost Gumdrop shows where the ship waits after leg 1. Drag a second <b>ramp</b> next to it, so it snaps on and ropes to the ghost\'s ◉.', why: 'Every leg has its own pull. Each machine starts in the glowing box where the last one finished.', done: () => { const l = glgLeg(1); return !!(l && l.roped); }, need: () => GLB.rig.parts.filter(p => p.type === 'ramp').length >= 2 ? null : { tile: 'ramp' } },
  { t: 'Fill in your route strip, then press <b>▶ Test in simulator</b>.', why: 'The strip is where GASA checks your maths. The simulator shows where the route works, with no numbers.', done: () => !!(glState().tests || glState().runs) }
];
function glMountGuide(host) {
  if (!host) return; const st = glState();
  if (!st.guide) GLB.save({ id: GLB.mid }, { guide: ((GLB.rig && GLB.rig.parts.length) || st.runs || st.warm) ? 'done' : 'on' });   // an older save, or one with a rig already: no guided start
  host.innerHTML = '<section class="panel glwarm" id="glGuide" hidden aria-label="Guided start"></section>';
  const prev = GLB.onChange; GLB.onChange = () => { if (prev) prev(); glGuidePaint(); };
  host.addEventListener('click', e => { const b = e.target.closest('[data-gw]'); if (!b) return; GLB.save({ id: GLB.mid }, { guide: b.dataset.gw === 'skip' ? 'skip' : 'done' }); glGuidePaint(); });
  glGuidePaint();
}
function glGuidePaint() {
  const box = $('#glGuide'); if (!box) return; const st = glState();
  if (st.guide !== 'on' || (GLR && GLR.on)) { box.hidden = true; return; }
  const done = GLG_STEPS.map(s => { try { return !!s.done(); } catch (_) { return false; } }), cur = done.indexOf(false), all = cur < 0, f1 = v => fmt(v, 1);
  let live = '';
  if (cur <= 2 && glWarmLever()) { const lev = glWarmLever(), bo = GLB.ev && GLB.ev.boulder; if (lev && bo && bo.how === 'lever') live = `<p class="glwlive ${bo.ok ? 'good' : ''}">Load arm ${f1(lev.arm)} m, so the lever's mechanical advantage is <b>${f1(bo.ma)}</b>. Smooshy pulls with <b>${f1(bo.pull)} N</b> ${bo.ok ? 'and the boulder rolls free!' : 'and 60 N is his limit.'}</p>`; }
  box.hidden = false;
  box.innerHTML = `<h3>🧭 Guided start: your first two legs</h3>
    <p>Welcome to Mission Control! Build the first part of a rescue route with me. You can skip this at any time.</p>
    <ol class="objs glsteps">${GLG_STEPS.map((s, i) => `<li class="${done[i] ? 'ok' : i === cur ? 'cur' : ''}"><span class="box">${done[i] ? '✓' : ''}</span><span>${s.t}${i === cur ? `<small class="glwhy">${s.why}</small>` : ''}</span></li>`).join('')}</ol>${live}
    ${all ? '<p><b>Well done, engineer!</b> Keep building up to the dotted line. Once the Gumdrop is level with it, the Big Jelly\'s tractor beam pulls it in. You don\'t need to move it across.</p><div class="row"><button type="button" class="go" data-gw="done">Start building my route</button></div>' : '<div class="row"><button type="button" class="ghost sm" data-gw="skip">Skip the guided start</button></div>'}`;
  glGuideThrob();
}

/* ---------- the three ending cards, then the stopping-point pop-up ---------- */
function glPop(html, key, label) {
  const old = $('#glPop'); if (old) old.remove();
  const box = document.createElement('div'); box.id = 'glPop'; box.className = 'glpop'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', label);
  box.innerHTML = `<div class="glpophd" title="Drag me out of the way">⠿ ${esc(label)}</div>${html}`; document.body.appendChild(box);
  makeDraggable(box, '.glpophd', key); const f = box.querySelector('button.go'); if (f) setTimeout(() => f.focus(), 30);
  return box;
}
function glEndText(sum) {
  const d = sum.dmg || {}, why = [];
  if (d.t > 0) why.push('a leg that needed more than 60 N, so the thrusters roared');
  if (d.r > 0) why.push('the rock left on the boulder');
  if (d.b > 0) why.push('dynamite going off close to the ship');
  const dent = why.length ? `The damage came from ${why.join(', ')}.` : '';
  if (sum.ending === 'spotless') return ['✨', 'Spotless rescue!', 'The tractor beam locks on and the Gumdrop lifts away without a single scratch. Smooshy climbs aboard, waves from the window, and the Big Jelly hums off across the plain. On the way up he spots the crystals on the crater rim glittering in the light of two moons.'];
  if (sum.ending === 'dented') return ['🛠️', 'Dented, but home!', `The tractor beam lifts the Gumdrop and Smooshy waves from the window, but the hull is scorched and cracked (${fmt(d.total || 0, 1)}% damage). ${dent} Another go can bring the damage down to zero.`];
  return ['🔄', 'Not yet!', `${(sum.stop && sum.stop !== 'none' ? glStopText(sum.stop, sum.stopLeg) : '') || GL_STOP.none}${sum.up != null ? ' ' + glShortText(sum.up, sum.toLine) : ''} Your route stays in the builder, so you only need to fix the part that stopped it. Every go counts, and you can move on to the Check whenever you like.`];
}
function glShowEnding(sum, o) {
  if (!sum) return; o = o || {}; const [ic, ti, tx] = glEndText(sum);
  const sc = sum.score != null ? `<p class="glpopsc">Score for this run: <b>${sum.score} of ${sum.max || GL_MAX}</b>${o.better ? ' <em>New best run!</em>' : ''}</p>` : '';
  const box = glPop(`<h3>${ic} ${ti}</h3><p>${tx}</p>${sc}<div class="row"><button type="button" class="go" data-gp="on">${sum.ending === 'spotless' ? 'Brilliant!' : 'Back to my route'}</button></div>`, 'glend', '🚀 Operation Gummy Lift');
  box.addEventListener('click', e => {
    if (!e.target.closest('[data-gp]')) return; box.remove();
    if (sum.ending !== 'spotless' && typeof glBackToBuild === 'function') glBackToBuild();
    if (o.first) glShowStop();
  });
}
function glShowStop() {
  const box = glPop(`<h3>🌙 A good place to stop for today</h3><p>You have rescued the Gumdrop once, so this is a great moment to take a break. Your route saves itself after every change and reopens exactly as you left it.</p><p>Next time you can improve it: a gentler pull, no damage, fewer crystals or less hand travel. Then comes the Check.</p><div class="row"><button type="button" class="ghost" data-gp="save">📄 Save my work</button> <button type="button" class="go" data-gp="on">Keep going</button></div>`, 'glstop', 'Time for a break?');
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-gp]'); if (!b) return;
    if (b.dataset.gp === 'save') { const s = $('#saveWorkBtn'); if (s) s.click(); } else box.remove();
  });
}
