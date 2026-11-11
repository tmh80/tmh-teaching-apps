/* ===== Part 5 story: the tutorial (the boulder, in two legs), the ending cards (spotless, dented, wrecked, pulled apart, not yet) and the "good place to stop" pop-up ===== */

/* ---------- the tutorial coach (Tom, 11 Nov 2026) ----------
   First version: "a tutorial that you can DO or skip". Then: "Removing the boulder and moving it to the left, out of the way, IS the tutorial. Leg one = pry free, leg two = lift and shift to side."
   So the coach is a small card ON the board (it can be dragged, hidden or skipped) that shows one step at a time, and the student does the boulder job for real:
     leg 1: a lever on the boulder, a shorter load arm until Smooshy can lift it, a winch on the pulling end (it locks, so the boulder stays up);
     leg 2: a crane gantry over the held boulder, a pulley block or winch until Smooshy can manage the lift, Lifts 5.5 m or more, Move across to the left until it sets down clear of the Gumdrop;
     then Test in simulator, and the end card: "Start my rescue".
   Every step ticks itself from the rig. State: chal.c6e.gl.guide is 'on' while it is open, 'done' or 'skip' once closed; chal.c6e.gl.tut holds n0 (tests before it started) and min (hidden).
   No leg numbers: the coach only says whether Smooshy can manage the pull. The boulder's pull is shown because it is practice. */
function glWarmLever() { return GLB.rig && GLB.rig.parts.find(p => p.type === 'lever' && p.role === 'boulder'); }
const glWarmCrane = () => GLB.rig && GLB.rig.parts.find(p => p.type === 'crane' && p.role === 'boulder');
const glTut = () => glState().tut || {};
const glTutSave = o => GLB.save({ id: GLB.mid }, { tut: Object.assign({}, glTut(), o) });
const glgBo = () => GLB.ev && GLB.ev.boulder;
/* "do this next": a step's need() says which tray tile, or which button on the settings card, to pulse (ndApply in 4n-boardkit.js). Board data only, never text. */
const glgDock = (id, btn) => GLB.dockId === id ? { sel: `[data-gm="${btn}"]` } : null;
const glgOnCrane = type => { const cr = glWarmCrane(); return cr ? glAddons(GLB.rig, cr.id).chain.filter(q => q.type === type) : []; };
const GLG = {
  lever: { t: 'First, free the Gumdrop. Drag a <b>lever</b> from the tray onto the boulder. It glows when it\'s in the right place.', why: 'A lever turns on a fulcrum. It gives a mechanical advantage, so Smooshy needs less pull.', done: () => !!glWarmLever(), need: () => glWarmLever() ? null : { tile: 'lever' } },
  arm: { t: 'Tap the lever and make its <b>load arm</b> shorter until Smooshy can lift the boulder.', why: 'Lever MA = effort arm ÷ load arm. Smooshy\'s pull = 252 N ÷ MA. A shorter load arm gives a bigger MA.', done: () => { const b = glgBo(); return !!(b && b.pry && b.pry.easy); }, need: () => { const l = glWarmLever(); return l ? glgDock(l.id, 'arm-') : null; } },
  winch: { t: 'Smooshy can lift it, but it drops when he lets go. Clip a <b>winch</b> onto the lever\'s pulling end, the end with the rope and handle. It locks and holds the boulder up.', why: 'A winch locks when Smooshy stops cranking. It also multiplies the lever\'s mechanical advantage by its gear ratio.', done: () => { const b = glgBo(); return !!(b && b.pry && b.pry.ok); }, need: () => GLB.rig.parts.some(p => p.type === 'winch') ? null : { tile: 'winch' } },
  crane: { t: 'Leg 2. The boulder is held up. What picks it up from there? Drag a <b>crane gantry</b> onto the boulder. Its rope hooks on.', why: 'The next machine picks the boulder up from wherever the last one left it. A crane lifts straight up, so its own mechanical advantage is 1.', done: () => { const b = glgBo(); return !!(glWarmCrane() && b && b.pry && b.pry.ok); }, need: () => glWarmCrane() ? null : { tile: 'crane' } },
  pull: { t: 'Clip a <b>pulley block</b> or a <b>winch</b> onto the crane until Smooshy can manage the lift.', why: 'A pulley block\'s MA is its number of supporting ropes, and a winch\'s MA is its gear ratio. The crane\'s total MA is every part multiplied together.', done: () => { const b = glgBo(); return !!(b && b.move && b.move.ma > 1 && b.move.pull <= GL.pullOk + 1e-9); },
    need: () => { const cr = glWarmCrane(); if (!cr) return null; const bl = glgOnCrane('block'), wn = glgOnCrane('winch'); if (!bl.length && !wn.length) return { tile: 'block' }; if (bl.length && bl[0].ropes < 4) return glgDock(bl[0].id, 'ropes4'); return wn.length ? null : { tile: 'winch' }; } },
  lift: { t: 'Tap the crane and press <b>+</b> on <b>Lifts</b> until it lifts <b>5.5 m or more</b>, so the boulder clears the Gumdrop.', why: 'The boulder has to pass over the Gumdrop on its way across. The trolley can only carry it over if it is lifted high enough.', done: () => { const cr = glWarmCrane(); return !!(cr && cr.rise >= 5.5 - 1e-9); }, need: () => { const cr = glWarmCrane(); return cr ? glgDock(cr.id, 'rise+') : null; } },
  across: { t: 'Choose <b>Left</b> for the direction, then press <b>+</b> on <b>Move across</b> until the glowing spot sits clear of the Gumdrop (<b>7.5 m or 8 m</b>).', why: 'The trolley carries the boulder across, then lowers it until it rests on the ground. Carrying and lowering add no work: only the lift goes into the maths.', done: () => { const b = glgBo(); return !!(b && b.move && b.move.ok); },
    need: () => { const cr = glWarmCrane(); if (!cr) return null; if ((cr.adir || (cr.across < 0 ? -1 : 1)) > 0) return glgDock(cr.id, 'dirL'); return glgDock(cr.id, 'across+'); } },
  test: { t: 'Press <b>▶ Test in simulator</b> and watch both legs: the lever pries the boulder up, then the crane carries it away.', why: 'The simulator shows what works and what does not. It shows no numbers, and it does not count as a rescue.', done: () => (glState().tests || 0) + (glState().runs || 0) > (glTut().n0 || 0) }
};
const glgSteps = () => [GLG.lever, GLG.arm, GLG.winch, GLG.crane, GLG.pull, GLG.lift, GLG.across, GLG.test];
const glgDone = s => { try { return s.pick ? !!glTut()[s.pick] : !!s.done(); } catch (_) { return false; } };
function glGuideThrob() {
  const roots = [$('#glTray'), $('#glDock')]; if (!roots[0]) return; const st = glState();
  if (st.guide !== 'on' || (GLR && GLR.on) || GLB.intro) { ndApply([], roots); return; }
  const S = glgSteps(), s = S[S.map(glgDone).indexOf(false)]; let n = null, el = null;
  try { n = s && s.need ? s.need() : null; } catch (_) { n = null; }
  if (n && n.tile) el = $(`#glTray [data-add="${n.tile}"]`); else if (n && n.sel) el = $(n.sel, $('#glDock'));
  ndApply(el ? [el] : [], roots);
}
function glMountGuide(host) {
  if (!host) return; const st = glState();
  if (!st.guide) GLB.save({ id: GLB.mid }, { guide: ((GLB.rig && GLB.rig.parts.length) || st.runs || st.warm) ? 'done' : 'on', tut: { n0: (st.tests || 0) + (st.runs || 0) } });   // an older save, or one with a rig already: no tutorial
  host.innerHTML = '<section class="glcoach" id="glGuide" hidden aria-label="Tutorial"></section>'; const box = $('#glGuide', host);
  makeDraggable(box, '.glcoachhd', 'glcoach');
  const prev = GLB.onChange; GLB.onChange = () => { if (prev) prev(); glGuidePaint(); };
  box.addEventListener('click', e => { const b = e.target.closest('[data-gw]'); if (!b) return; const k = b.dataset.gw;
    if (k === 'min') glTutSave({ min: !glTut().min });
    else { GLB.save({ id: GLB.mid }, { guide: k === 'skip' ? 'skip' : 'done' }); if (k !== 'skip') toast('✓ Now rescue the Gumdrop, up to the dotted line.', 'ok'); }
    glGuidePaint(); });
  glGuidePaint();
}
function glGuidePaint() {
  const box = $('#glGuide'); if (!box) return; const st = glState();
  if (st.guide !== 'on' || (GLR && GLR.on) || GLB.intro) { box.hidden = true; glGuideThrob(); return; }
  const S = glgSteps(), done = S.map(glgDone), cur = done.indexOf(false), all = cur < 0, s = S[cur], t = glTut(), f1 = v => fmt(v, 1);
  let live = ''; const bo = glgBo(), lev = glWarmLever(), cr = glWarmCrane(), py = bo && bo.pry, mv = bo && bo.move;
  if ((s === GLG.arm || s === GLG.winch) && lev && py && py.how === 'lever') live = `<p class="glwlive ${py.ok ? 'good' : ''}">Load arm ${f1(lev.arm)} m, so the lever's mechanical advantage is <b>${f1(py.ma)}</b>. Smooshy pulls with <b>${f1(py.pull)} N</b> ${py.easy ? 'and can lift the boulder.' : 'and 60 N is his limit.'}</p>`;
  if (s === GLG.pull && cr && mv && py && py.ok) live = mv.pull <= GL.pullOk + 1e-9 && mv.ma > 1 ? `<p class="glwlive good">Smooshy can manage this lift: he pulls <b>${f1(mv.pull)} N</b>.</p>` : `<p class="glwlive">Too heavy: Smooshy would pull <b>${f1(mv.pull)} N</b>, and 60 N is his limit. Add more mechanical advantage.</p>`;
  if (s === GLG.lift && cr) live = `<p class="glwlive ${cr.rise >= 5.5 ? 'good' : ''}">The crane lifts <b>${f1(cr.rise)} m</b>.${cr.rise >= 5.5 ? '' : ' It needs 5.5 m or more.'}</p>`;
  if (s === GLG.across && cr && mv && !mv.ok && mv.why !== 'jammed') { const n = glBoulderNote(cr, bo); if (n && n.text) live = `<p class="glwlive">${n.text}</p>`; }
  const body = t.min ? '' : all
    ? `<p class="glct">Well done, engineer! Two machines, one after the other: the crane picked the boulder up from where the lever left it.</p><p class="glwhy">Now rescue the Gumdrop the same way: each rope picks it up from wherever it is resting, up to the dotted line. You can drag the Gumdrop over the ground, but it scrapes the hull.</p>
       <div class="glopts"><button type="button" class="glopt" data-gw="keep"><span class="ic" aria-hidden="true">🚀</span><b>Start my rescue</b><small>Your boulder machines stay on the board.</small></button></div>`
    : `${cur === 0 ? '<p class="glwhy">Welcome to Mission Control! Free the boulder with me, one machine at a time, or skip this and build your own.</p>' : ''}<p class="glct">${s.t}</p><p class="glwhy">${s.why}</p>${live}
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
  if (sum.ending === 'torn') return ['🧩', 'Pulled apart!', `The tractor beam lifts what is left of the Gumdrop, and Smooshy is safe in the cabin. The boulder was still jammed on the landing leg, and the strain on the leg${sum.torn && sum.torn.strain ? ` (${fmt(sum.torn.strain, 0)} N)` : ''} was more than the 500 N it can take, so the leg ripped off and the hull took a huge hit. ${dent} A rescue that pulls the Gumdrop apart scores 2 points at most. Pry the boulder up and lift it clear first, and the same route scores more.`];
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
