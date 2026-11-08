/* ===== Part 5 story: the guided warm-up (lever on the boulder), the three ending cards and the "good place to stop" pop-up ===== */

/* ---------- guided warm-up, about 3 minutes, before the free build ----------
   State lives in chal.c6e.gl.warm: 'on' while the warm-up is open, 'done' or 'skip' once it is closed.
   The boulder pull is shown here because it is practice; the ship's leg pulls stay hidden. */
function glWarmLever() { return GLB.rig && GLB.rig.parts.find(p => p.type === 'lever' && p.role === 'boulder'); }
function glMountWarm(host) {
  if (!host) return; const st = glState();
  if (!st.warm && ((GLB.rig && GLB.rig.parts.length) || st.runs)) GLB.save({ id: GLB.mid }, { warm: 'done' });   // an older save: no warm-up
  else if (!st.warm) GLB.save({ id: GLB.mid }, { warm: 'on' });
  host.innerHTML = '<section class="panel glwarm" id="glWarm" hidden></section>';
  const prev = GLB.onChange; GLB.onChange = () => { if (prev) prev(); glWarmPaint(); };
  host.addEventListener('click', e => {
    const b = e.target.closest('[data-gw]'); if (!b) return;
    GLB.save({ id: GLB.mid }, { warm: b.dataset.gw === 'skip' ? 'skip' : 'done' }); glWarmPaint();
  });
  glWarmPaint();
}
function glWarmPaint() {
  const box = $('#glWarm'); if (!box) return; const st = glState();
  if (st.warm !== 'on' || (GLR && GLR.on)) { box.hidden = true; return; }
  const lev = glWarmLever(), bo = GLB.ev && GLB.ev.boulder, ok = !!(bo && bo.ok && bo.how === 'lever'), f1 = v => fmt(v, 1);
  const step = (done, txt) => `<li class="${done ? 'ok' : ''}"><span class="box">${done ? '✓' : ''}</span>${txt}</li>`;
  let live = '';
  if (lev && bo && bo.how === 'lever') live = `<p class="glwlive ${ok ? 'good' : ''}">Load arm ${f1(lev.arm)} m, so the lever's mechanical advantage is <b>${f1(bo.ma)}</b>. Smooshy pulls with <b>${f1(bo.pull)} N</b> ${ok ? 'and the boulder rolls free!' : 'and 60 N is his limit.'}</p>`;
  box.hidden = false;
  box.innerHTML = `<h3>🔧 Warm-up: free the boulder (about 3 minutes)</h3>
    <p>The boulder weighs <b>252 N</b> on Glimmer-9 and Smooshy can pull with <b>60 N</b>. A lever can help. Mechanical advantage = effort arm ÷ load arm, and the effort needed = 252 N ÷ mechanical advantage.</p>
    <ul class="objs">${step(!!lev, 'Tap the ⚖️ Lever in the parts tray, then tap the ground next to the boulder (or drag it in). It snaps onto the boulder.')}
      ${step(ok, 'Tap the lever and change its load arm until Smooshy\'s pull on the boulder is <b>60 N or less</b>. A shorter load arm gives a bigger mechanical advantage.')}</ul>${live}
    ${ok ? '<p><b>Boulder cleared!</b> The lever stays in your rig for 25 crystals, so you have 450 left to plan the climb.</p><div class="row"><button type="button" class="go" data-gw="done">Start building my route</button></div>'
      : '<div class="row"><button type="button" class="ghost sm" data-gw="skip">Skip the warm-up</button></div>'}`;
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
  return ['🔄', 'Not yet!', `${(sum.stop && sum.stop !== 'none' ? glStopText(sum.stop, sum.stopLeg) : '') || GL_STOP.none} Your route stays in the builder, so you only need to fix the part that stopped it. Every go counts, and you can move on to the Check whenever you like.`];
}
function glShowEnding(sum, o) {
  if (!sum) return; o = o || {}; const [ic, ti, tx] = glEndText(sum);
  const sc = sum.score != null ? `<p class="glpopsc">Score for this run: <b>${sum.score} of 10</b>${o.better ? ' <em>New best run!</em>' : ''}</p>` : '';
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
