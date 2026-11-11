/* ===== Part 5 story: the guided start (two legs), the ending cards (spotless, dented, wrecked, pulled apart, not yet) and the "good place to stop" pop-up ===== */

/* ---------- the tutorial coach (Tom, 11 Nov 2026) ----------
   "The guided tour pushes the building window way down. Consider an aesthetic solution with pop-ups, which gives a tutorial that you can DO or skip, that shows two options
   for a short first and second leg. This allows students to work through a connection between legs. They can then 'continue from here' or 'make their own set-up from the first leg'."
   So the coach is a small card ON the board (it can be dragged, hidden or skipped) that shows one step at a time. The student frees the boulder, picks one of two first legs
   (a ramp to the shelf, or a crane onto a platform), builds it, picks one of two second legs from where the Gumdrop now rests, builds that, and tests the pair.
   Every step ticks itself from the rig. State: chal.c6e.gl.guide is 'on' while it is open, 'done' or 'skip' once closed; chal.c6e.gl.tut holds the two choices { a, b } and min (hidden).
   No leg numbers are shown: the coach only says whether Smooshy can manage the pull. The boulder pull is shown because it is practice. */
function glWarmLever() { return GLB.rig && GLB.rig.parts.find(p => p.type === 'lever' && p.role === 'boulder'); }
const glgLeg = i => GLB.ev && GLB.ev.legs[i];
const glTut = () => glState().tut || {};
const glTutSave = o => GLB.save({ id: GLB.mid }, { tut: Object.assign({}, glTut(), o) });
const glgOk = i => { const l = glgLeg(i); return !!(l && l.roped && !l.faults.length && l.pull > 0 && l.pull <= GL.pullOk + 1e-9 && !(GLB.ev.stop && GLB.ev.stop.leg === i && GLB.ev.stop.why === 'heavy')); };
/* "do this next": a step's need() says which tray tile, or which button on the settings card, to pulse (ndApply in 4n-boardkit.js). Board data only, never text. */
const glgAddon = (type, btn) => { const q = GLB.rig.parts.find(p => p.type === type); if (!q) return { tile: type }; return GLB.dockId === q.id ? { sel: `[data-gm="${btn}"]` } : null; };
const glgCrane0 = () => { const l = glgLeg(0), p = l && l.type === 'crane' ? glPart(l.id) : null; return p ? { p, sp: glSetSpot(p, glMachine(p, GLB.ev.ground, GLB.ev.plats), GLB.ev.ground, GLB.ev.plats) } : null; };
const GLG = {
  lever: { t: 'First, free the Gumdrop. Drag a <b>lever</b> from the tray onto the boulder. It glows when it\'s in the right place.', why: 'A lever turns on a fulcrum. It gives a mechanical advantage, so Smooshy needs less pull.', done: () => !!glWarmLever(), need: () => glWarmLever() ? null : { tile: 'lever' } },
  arm: { t: 'Tap the lever and make its <b>load arm</b> shorter until Smooshy\'s pull on the boulder is <b>60 N or less</b>.', why: 'Lever MA = effort arm ÷ load arm. Smooshy\'s pull = 252 N ÷ MA. A shorter load arm gives a bigger MA.', done: () => { const b = GLB.ev && GLB.ev.boulder; return !!(b && b.ok && b.how === 'lever'); }, need: () => { const l = glWarmLever(); return l && GLB.dockId === l.id ? { sel: '[data-gm="arm-"]' } : null; } },
  pickA: { pick: 'a', t: 'Leg 1. How will you get the Gumdrop off the crater floor?', why: 'Both work. Pick one, and I will show you how to build it.', opts: [['ramp', '📐', 'Ramp to the shelf', 'Pull it up a long slope.'], ['crane', '🏗️', 'Crane onto a platform', 'Lift it, carry it across, set it down.']] },
  rampA: { t: 'Drag a <b>ramp</b> next to the Gumdrop. It snaps on, and its rope clips onto the Gumdrop\'s ◉ hook.', why: 'A ramp lets Smooshy pull the Gumdrop up a slope instead of lifting it straight up.', done: () => { const l = glgLeg(0); return !!(l && l.type === 'ramp' && l.roped); }, need: () => GLB.rig.parts.some(p => p.type === 'ramp') ? null : { tile: 'ramp' } },
  rampShelf: { t: 'Drag the white handle at the top of the ramp up and across until it rests on the edge of the shelf, 6 m up. The ramp turns red while it cuts into the ground or floats.', why: 'Ramp MA = length ÷ rise. A longer ramp means a smaller pull, but a longer way to pull.', done: () => { const l = glgLeg(0); return !!(l && l.type === 'ramp' && l.end.y >= 5.9 && !l.faults.length); } },
  craneA: { t: 'Drag a <b>crane gantry</b> onto the Gumdrop. It stands over it, and its rope clips onto the Gumdrop\'s ◉ hook.', why: 'A crane lifts straight up, so its own mechanical advantage is 1. The pulleys and winches you add do the work.', done: () => { const l = glgLeg(0); return !!(l && l.type === 'crane' && l.roped); }, need: () => GLB.rig.parts.some(p => p.type === 'crane') ? null : { tile: 'crane' } },
  plat: { t: 'Drag a <b>large platform</b> onto the crater floor, to the right of the crane.', why: 'A platform is a strong shelf. The Gumdrop can rest on it, and the next machine can stand on it.', done: () => GLB.rig.parts.some(p => p.type === 'platform'), need: () => ({ tile: 'platL' }) },
  across: { t: 'Tap the crane, then press <b>+</b> on <b>Move across</b> until the glowing spot sits on the platform.', why: 'The trolley carries the Gumdrop across, then lowers it until it rests on whatever is below. Only the lift goes into the maths.', done: () => { const q = glgCrane0(); return !!(q && q.p.across && GLB.ev.plats.some(pl => q.sp.x >= pl.x0 && q.sp.x <= pl.x1 && Math.abs(q.sp.y - pl.top) < 0.06)); }, need: () => { const q = glgCrane0(); return q && GLB.dockId === q.p.id ? { sel: '[data-gm="across+"]' } : null; } },
  block: { t: 'Clip a <b>pulley block</b> onto the ◉ dot of your machine, then tap it and choose <b>4 ropes</b>.', why: 'Each supporting rope shares the load, so the pulley block\'s MA is its number of ropes.', done: () => { const l = glgLeg(0); return !!(l && l.addons.some(id => { const q = glPart(id); return q && q.type === 'block' && q.ropes >= 3; })); }, need: () => glgAddon('block', 'ropes4') },
  winch: { t: 'Clip a <b>winch</b> onto the end of the pulley block\'s rope and choose its gear. Add a second winch if you need one. Keep going until Smooshy can manage the pull.', why: 'A winch multiplies the MA by its gear ratio. The total MA of a leg is every machine\'s MA multiplied together.', leg: 0, done: () => { const l = glgLeg(0); return !!(l && l.winches.length && glgOk(0)); },
    need: () => { const ws = GLB.rig.parts.filter(p => p.type === 'winch'); if (!ws.length) return { tile: 'winch' }; const w = ws.find(q => q.ratio < 10); if (w) return GLB.dockId === w.id ? { sel: '[data-gm="ratio10"]' } : null; return ws.length < 2 ? { tile: 'winch' } : null; } },
  pickB: { pick: 'b', t: 'Leg 2. The ghost Gumdrop shows where the ship rests after leg 1. What picks it up from there?', why: 'The next rope always picks the Gumdrop up from wherever it is resting.', opts: [['ramp', '📐', 'A ramp from here', 'Carry on up a slope.'], ['crane', '🏗️', 'A crane from here', 'Lift it higher.']] },
  rampB: { t: 'Drag a <b>ramp</b> next to the ghost Gumdrop, so its rope clips onto the ghost\'s ◉. Then drag its white handle until the top rests on the ground.', why: 'Every leg has its own machines and its own pull.', done: () => { const l = glgLeg(1); return !!(l && l.type === 'ramp' && l.roped && !l.faults.length); }, need: () => GLB.rig.parts.filter(p => p.type === 'ramp').length >= (glTut().a === 'ramp' ? 2 : 1) ? null : { tile: 'ramp' } },
  craneB: { t: 'Drag a <b>crane gantry</b> onto the ghost Gumdrop, so its rope clips onto the ghost\'s ◉.', why: 'Every leg has its own machines and its own pull.', done: () => { const l = glgLeg(1); return !!(l && l.type === 'crane' && l.roped && !l.faults.length); }, need: () => GLB.rig.parts.filter(p => p.type === 'crane').length >= (glTut().a === 'crane' ? 2 : 1) ? null : { tile: 'crane' } },
  test: { t: 'Press <b>▶ Test in simulator</b> and watch the two legs work one after the other.', why: 'Leg 2 has no pulleys or winches yet, so watch what happens when Smooshy tries it.', done: () => (glState().tests || 0) + (glState().runs || 0) > (glTut().n0 || 0) }
};
function glgSteps() {
  const t = glTut(), S = [GLG.lever, GLG.arm, GLG.pickA];
  if (t.a === 'ramp') S.push(GLG.rampA, GLG.rampShelf); else if (t.a === 'crane') S.push(GLG.craneA, GLG.plat, GLG.across);
  if (t.a) S.push(GLG.block, GLG.winch, GLG.pickB);
  if (t.b) S.push(t.b === 'ramp' ? GLG.rampB : GLG.craneB, GLG.test);
  return S;
}
const glgDone = s => { try { return s.pick ? !!glTut()[s.pick] : !!s.done(); } catch (_) { return false; } };
function glGuideThrob() {
  const roots = [$('#glTray'), $('#glDock')]; if (!roots[0]) return; const st = glState();
  if (st.guide !== 'on' || (GLR && GLR.on) || GLB.intro) { ndApply([], roots); return; }
  const S = glgSteps(), s = S[S.map(glgDone).indexOf(false)]; let n = null, el = null;
  try { n = s && s.need ? s.need() : null; } catch (_) { n = null; }
  if (n && n.tile) el = $(`#glTray [data-add="${n.tile}"]`); else if (n && n.sel) el = $(n.sel, $('#glDock'));
  ndApply(el ? [el] : [], roots);
}
/* take leg 2 away again, so the student builds their own route on from leg 1 */
function glTutLeg1Only() {
  const l = glgLeg(1); if (!l) return; glPush(); const ids = new Set([l.id].concat(l.addons || []));
  GLB.rig.parts = GLB.rig.parts.filter(p => !ids.has(p.id)); GLB.rig.cables = GLB.rig.cables.filter(c => !ids.has(c.a) && !ids.has(c.b)); glDropOrphans(); GLB.sel = null; glCloseMenu(); glChanged();
}
function glMountGuide(host) {
  if (!host) return; const st = glState();
  if (!st.guide) GLB.save({ id: GLB.mid }, { guide: ((GLB.rig && GLB.rig.parts.length) || st.runs || st.warm) ? 'done' : 'on', tut: { n0: (st.tests || 0) + (st.runs || 0) } });   // an older save, or one with a rig already: no tutorial
  host.innerHTML = '<section class="glcoach" id="glGuide" hidden aria-label="Tutorial"></section>'; const box = $('#glGuide', host);
  makeDraggable(box, '.glcoachhd', 'glcoach');
  const prev = GLB.onChange; GLB.onChange = () => { if (prev) prev(); glGuidePaint(); };
  box.addEventListener('click', e => { const b = e.target.closest('[data-gw]'); if (!b) return; const k = b.dataset.gw;
    if (k === 'min') glTutSave({ min: !glTut().min });
    else if (k.startsWith('a:') || k.startsWith('b:')) glTutSave({ [k[0]]: k.slice(2) });
    else { if (k === 'leg1') glTutLeg1Only(); GLB.save({ id: GLB.mid }, { guide: k === 'skip' ? 'skip' : 'done' }); if (k !== 'skip') toast(k === 'leg1' ? '✓ Leg 2 is back in the tray. Build your own route on from leg 1.' : '✓ Carry on from here, up to the dotted line.', 'ok'); }
    glGuidePaint(); });
  glGuidePaint();
}
function glGuidePaint() {
  const box = $('#glGuide'); if (!box) return; const st = glState();
  if (st.guide !== 'on' || (GLR && GLR.on) || GLB.intro) { box.hidden = true; glGuideThrob(); return; }
  const S = glgSteps(), done = S.map(glgDone), cur = done.indexOf(false), all = cur < 0, s = S[cur], t = glTut(), f1 = v => fmt(v, 1);
  let live = '';
  if (s === GLG.arm || (s === GLG.pickA && glWarmLever())) { const lev = glWarmLever(), bo = GLB.ev && GLB.ev.boulder; if (lev && bo && bo.how === 'lever') live = `<p class="glwlive ${bo.ok ? 'good' : ''}">Load arm ${f1(lev.arm)} m, so the lever's mechanical advantage is <b>${f1(bo.ma)}</b>. Smooshy pulls with <b>${f1(bo.pull)} N</b> ${bo.ok ? 'and the boulder rolls free!' : 'and 60 N is his limit.'}</p>`; }
  if (s && s.leg != null) { const l = glgLeg(s.leg), heavy = GLB.ev.stop && GLB.ev.stop.leg === s.leg && GLB.ev.stop.why === 'heavy';
    if (l && l.roped && !l.faults.length) live = glgOk(s.leg) ? '<p class="glwlive good">Smooshy can manage this pull: it is 60 N or less.</p>' : heavy ? '<p class="glwlive">Too heavy: the Gumdrop won\'t move yet. This leg needs a bigger mechanical advantage.</p>' : '<p class="glwlive">It moves, but Smooshy has to pull harder than 60 N, so the thrusters fire. Add more mechanical advantage.</p>'; }
  const body = t.min ? '' : all
    ? `<p class="glct">Well done, engineer! You joined two legs.</p><p class="glwhy">The second rope picked the Gumdrop up from where the first leg left it. Keep building until the Gumdrop is level with the dotted line, and the Big Jelly's tractor beam pulls it in. You don't need to move it across.</p>
       <div class="glopts"><button type="button" class="glopt" data-gw="keep"><span class="ic" aria-hidden="true">➡️</span><b>Continue from here</b><small>Keep both legs and carry on.</small></button><button type="button" class="glopt" data-gw="leg1"><span class="ic" aria-hidden="true">🧰</span><b>Keep leg 1, build my own</b><small>Leg 2 goes back in the tray.</small></button></div>`
    : `${cur === 0 ? '<p class="glwhy">Welcome to Mission Control! Build two short legs with me, or skip this and build your own.</p>' : ''}<p class="glct">${s.t}</p><p class="glwhy">${s.why}</p>${live}
       ${s.pick ? `<div class="glopts">${s.opts.map(o => `<button type="button" class="glopt" data-gw="${s.pick}:${o[0]}"><span class="ic" aria-hidden="true">${o[1]}</span><b>${o[2]}</b><small>${o[3]}</small></button>`).join('')}</div>` : ''}
       <div class="glcoachft"><ol class="gldots" aria-label="Step ${cur + 1}">${S.map((_, i) => `<li class="${done[i] ? 'ok' : i === cur ? 'cur' : ''}"></li>`).join('')}</ol><button type="button" class="ghost sm" data-gw="skip">Skip the tutorial</button></div>`;
  const html = `<div class="glcoachhd" title="Drag me out of the way"><span>⠿ 🧭 Tutorial${all ? '' : ` · step ${cur + 1}`}</span><button type="button" class="ghost sm" data-gw="min" aria-expanded="${t.min ? 'false' : 'true'}">${t.min ? 'Show' : 'Hide'}</button></div>${body}`;
  box.hidden = false; box.classList.toggle('min', !!t.min); if (box._h !== html) { box._h = html; box.innerHTML = html; }
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
  const d = sum.dmg || {}, src = typeof glHullSources === 'function' ? glHullSources(d) : [], dent = src.length ? `The hull damage came from ${src.length > 1 ? src.slice(0, -1).join(', ') + ' and ' + src[src.length - 1] : src[0]}.` : '';
  if (sum.ending === 'spotless') return ['✨', 'Spotless rescue!', 'The tractor beam locks on and the Gumdrop lifts away without a single scratch. Smooshy climbs aboard, waves from the window, and the Big Jelly hums off across the plain. On the way up he spots the crystals on the crater rim glittering in the light of two moons.'];
  if (sum.ending === 'dented') return ['🛠️', 'Dented, but home!', `The tractor beam lifts the Gumdrop and Smooshy waves from the window, but the hull is scorched and cracked (${fmt(d.total || 0, 1)}% damage). ${dent} Another go can bring the damage down to zero.`];
  if (sum.ending === 'wrecked') return ['💥', 'Wrecked, but home!', `The tractor beam lifts the Gumdrop away, and Smooshy is safe in the cabin, but the hull is in a terrible state (${fmt(d.total || 0, 1)}% damage). ${dent} A rescue that wrecks the hull scores 3 points at most. Lifting with ramps, a crane or a lever is much kinder to the hull than dragging the Gumdrop over the ground.`];
  if (sum.ending === 'torn') return ['🧩', 'Pulled apart!', `The tractor beam lifts what is left of the Gumdrop, and Smooshy is safe in the cabin. The boulder was still jammed on the landing leg, and the strain on the leg${sum.torn && sum.torn.strain ? ` (${fmt(sum.torn.strain, 0)} N)` : ''} was more than the 500 N it can take, so the leg ripped off and the hull took a huge hit. ${dent} A rescue that pulls the Gumdrop apart scores 2 points at most. Clear the boulder first and the same route scores more.`];
  return ['🔄', 'Not yet!', `${(sum.stop && sum.stop !== 'none' ? glStopText(sum.stop, sum.stopLeg, sum.unroped) : '') || GL_STOP.none}${sum.up != null ? ' ' + glShortText(sum.up, sum.toLine) : ''} Your route stays in the builder, so you only need to fix the part that stopped it. Every go counts, and you can move on to the Check whenever you like.`];
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
