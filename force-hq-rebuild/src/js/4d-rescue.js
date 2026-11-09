/* ===== Chapter 6: the story. The opening transmission and the Rescue board, from section 9 of docs/Workshop_Lesson_Mode_Spec.md =====
   The board sits at the top of every Chapter 6 page. A slot lights up when that Part's stamp is earned, and every slot opens its Part. Names live in the SMOOSHY constant (4a-workshop.js). */
const RB_SLOTS = [
  { sec: 'c6a', title: 'Lever training', part: 'Part 1', next: 'Next: Part 1 trains you on the lever in the simulator.' },
  { sec: 'c6b', title: 'Toolkit training', part: 'Part 2', next: 'Next: Part 2 trains you on the crane gantry, pulley block, winch, ramp and screw jack.' },
  { sec: 'c6c', title: 'Maths check ready', part: 'Part 3', next: 'Next: Part 3 teaches the maths GASA checks before it approves a mission.' },
  { sec: 'c6d', title: 'Route training', part: 'Part 4', next: 'Next: Part 4 trains you to join machines into a route.' },
  { sec: 'c6e', title: 'Smooshy saved!', part: 'Part 5', next: 'Next: Part 5 is the rescue, planned at Mission Control.' },
  { sec: 'c6f', title: 'Gummy Base One built', part: 'Extension', ext: true, next: 'Optional: the Extension helps the gummy colonists build Gummy Base One.' }
];
/* a slot is done when its section's stamp is in; the rescue slot (and the picture) only when the Gumdrop has really reached the tractor beam.
   (The c6e stamp only needs a tried rescue, so it can't say Smooshy is saved.) */
const rbSaved = () => !!((dbGet('chal.c6e', {}).gl || {}).firstDone);
const rbDone = id => id === 'c6e' ? rbSaved() : !!dbGet('stamps', {})[id];
/* the Gumdrop with Captain Smooshy safe inside, seen through the round window (the live link from the Gumdrop) */
function drawGumdropInside(c, x, y, s, tilt, mood, tt) {
  drawGumdrop(c, x, y, s, tilt);
  c.save(); c.translate(x, y); c.rotate(tilt || 0); c.scale(s, s);
  c.beginPath(); c.arc(0, -42, 13.5, 0, 7); c.clip(); c.fillStyle = '#26364a'; c.fillRect(-16, -58, 32, 32);
  const wv = mood === 'wave'; drawSmooshy(c, 0, wv ? -34 : -25, wv ? 0.27 : 0.42, mood || 'worried', tt); c.restore();   // waving: a smaller Smooshy, so the raised arm shows in the glass
  c.save(); c.translate(x, y); c.rotate(tilt || 0); c.scale(s, s); c.strokeStyle = '#fffaf2'; c.lineWidth = 4; c.beginPath(); c.arc(0, -42, 15, 0, 7); c.stroke(); c.restore();
}
/* The Rescue board's picture, in the Part 5 art: Glimmer-9's crater from the builder (glDrawWorld at board size), the Gumdrop with Smooshy in the window,
   and the Big Jelly waiting above the plain. When Part 5 is done the Gumdrop rises in the Big Jelly's tractor beam. */
function drawCrater(c, w, h, st, t) {
  const keep = Object.assign({}, GLV), lbk = Object.assign({}, LBL), g = glBaseGround(), done = !!st.e;   // lbk: this small picture must not wipe the board's labels (they share LBL)
  Object.assign(GLV, { LW: w, LH: h, K: w / 100, z: 1, cx: 48, cy: 12.5 });
  try {
    /* done: a smaller Gumdrop rises in the tractor beam from the plain to just under the Big Jelly (drawn after the Jelly, so it must stay below its hull) */
    const u = glU(), rise = !done ? 0 : RMOTION ? 0.7 : (t * 0.2) % 1, ease = rise * rise * (3 - 2 * rise), s = done ? 0.4 : 0.8, X = glSX(done ? 86 : 14);
    const yLow = glSY(glAt(g, done ? 86 : 14)), yHigh = glSY(22) + 2.4 * u + 112 * s, Y = done ? yLow - Math.max(0, yLow - yHigh) * ease : yLow;
    glDrawWorld(c, { rig: { parts: [], cables: [] }, ground: g, ev: null, ship: null, rock: !done, t,
      run: done ? { beam: { x: X - 2.6 * u, y: Y + 0.6 * u, x2: X + 2.6 * u, y2: Y + 0.6 * u } } : {} });
    drawGumdropInside(c, X, Y, s, 0, done ? 'cheer' : 'wave', t);
  } finally { Object.assign(GLV, keep); Object.assign(LBL, lbk); }
}
function renderRescue() {
  const host = $('#rescueBoard'); if (!host) return;
  const on = !!CH && CH.ch === 'c6' && VIEW === 'vChapter'; host.hidden = !on; if (!on) { cancelAnimationFrame(RBRAF); return; }
  const have = RB_SLOTS.map(s => !!secOf(s.sec)), done = RB_SLOTS.map(s => rbDone(s.sec)), nx = RB_SLOTS.findIndex((s, i) => have[i] && !done[i]);
  host.innerHTML = `<canvas id="cvRescue" role="img" aria-label="${done[4] ? 'Glimmer-9. The Big Jelly repair ship lifts the Gumdrop out of the crater in its tractor beam. Captain Smooshy cheers from the window.' : 'Glimmer-9\'s crater. Captain Smooshy\'s spaceship, the Gumdrop, sits at the bottom. He is safe inside and waves from the round window, while the Big Jelly repair ship waits above the plain.'}"></canvas>
    <div class="rbside"><div class="rbhd"><span class="lbl">Rescue board</span><h2>Save Captain Smooshy!</h2></div>
    <ol class="rbslots">${RB_SLOTS.map((s, i) => `<li class="${done[i] ? 'on' : ''} ${have[i] ? '' : 'soon'}"><button type="button" class="rbslot" ${have[i] ? `data-open="${s.sec}"` : 'disabled'} aria-label="${s.part}: ${s.title}${done[i] ? ', done' : have[i] ? '' : ', coming soon'}"><span class="rbtick">${done[i] ? '✓' : i + 1}</span><span><b>${s.title}</b><small>${s.part}${have[i] ? '' : ' · coming soon'}</small></span></button></li>`).join('')}</ol>
    <p class="rbnext">${nx >= 0 ? RB_SLOTS[nx].next : done.every(Boolean) ? 'Captain Smooshy is safe. Brilliant rescue!' : 'More of the mission is on its way.'}</p>
    <div class="row"><button type="button" class="ghost sm" data-act="transmission">📡 Replay transmission</button></div></div>`;
  rbDraw();
}
let RBRAF = 0;
function rbDraw() {
  cancelAnimationFrame(RBRAF); const cv = $('#cvRescue'); if (!cv || !cv.offsetParent) return; readColors(); const W = 520, H = 200, c = fit(cv, W, H);
  drawCrater(c, W, H, { e: rbDone('c6e') }, performance.now() / 1000);
  if (!RMOTION) RBRAF = requestAnimationFrame(rbDraw);   // the beam, the Big Jelly and the stars move
}
/* ---------- the transmission: Smooshy's live call from the Gumdrop. The ship crashes into the crater, then the camera pushes in on the round window and he waves ---------- */
let TXRAF = 0;
function txCrash(c, t) {
  const W = 360, H = 200, keep = Object.assign({}, GLV), lbk = Object.assign({}, LBL), g = glBaseGround(), ez = x => x * x * (3 - 2 * x);
  const k = RMOTION ? 1 : clamp((t - 2.6) / 0.9, 0, 1), e = ez(k), z = 3.2 + (12 - 3.2) * e, cy = 7 + (1.7 - 7) * e;
  const shake = !RMOTION && t > 1.8 && t < 2.3 ? Math.sin(t * 90) * 3 * (2.3 - t) * 2 : 0;
  Object.assign(GLV, { LW: W, LH: H, K: W / 100, z, cx: 14, cy });
  try {
    c.save(); c.translate(shake, 0);
    glDrawSky(c, t); glDrawGround(c, g);
    const u = glU(), sc = 0.045 * u;
    if (t < 1.8) {
      /* falling: the Gumdrop streaks in from the top left with a flame trail */
      const pt = kk => ({ x: -1 + 15 * kk, y: 14 * (1 - kk * kk) }), kn = t / 1.8, p = pt(kn), tilt = -0.9 + kn * 1.4;
      for (let i = 1; i <= 7; i++) { const q = pt(Math.max(0, kn - i * 0.035)); c.fillStyle = i < 3 ? 'rgba(255,220,90,.85)' : 'rgba(255,140,60,' + (0.7 - i * 0.08) + ')'; c.beginPath(); c.arc(glSX(q.x), glSY(q.y) - 20, (10 - i) * u / 11.5, 0, 7); c.fill(); }
      drawGumdrop(c, glSX(p.x), glSY(p.y), sc, tilt);
    } else {
      glDrawShip(c, { x: 14, y: 0, tilt: 0.42 * (1 - ez(clamp((t - 1.8) / 0.8, 0, 1))), inside: true, mood: t > 2.6 ? 'wave' : 'strain' });
      if (t < 2.9) { const r = (t - 1.8) * 70; c.fillStyle = `rgba(230,215,250,${Math.max(0, .8 - (t - 1.8) * .7)})`; [[-30, 0], [0, -14], [30, 0], [10, 10], [-14, 8]].forEach(([dx, dy]) => { c.beginPath(); c.arc(glSX(14) + dx * r / 40 * u / 11.5, glSY(0) - 10 + dy * r / 40, (12 + r * .25) * u / 11.5, 0, 7); c.fill(); }); }
    }
    c.restore();
    if (t > 2.4) {
      /* the live-call badge, and Smooshy's hello once the camera is in */
      const on = RMOTION || Math.floor(t * 2) % 2 === 0;
      c.fillStyle = 'rgba(13,23,29,.78)'; c.beginPath(); c.roundRect(10, 10, 150, 24, 6); c.fill(); c.fillStyle = on ? '#ff3b30' : '#7a2a24'; c.beginPath(); c.arc(24, 22, 4.5, 0, 7); c.fill();
      txt(c, 'LIVE · THE GUMDROP', 34, 22.5, '#fffaf2', `800 10px ${C.fb}`, 'left');
      if (t > 3.5) { const wr = 0.61 * glU(), wx = glSX(14) - wr - 8, wy = glSY(1.9); c.fillStyle = '#fffaf2'; c.beginPath(); c.roundRect(wx - 98, wy - 38, 98, 26, 10); c.fill(); c.beginPath(); c.moveTo(wx - 6, wy - 16); c.lineTo(wx + 6, wy - 4); c.lineTo(wx - 22, wy - 14); c.closePath(); c.fill(); txt(c, 'Hi, GASA!', wx - 49, wy - 24.5, '#1f1d26', `800 12px ${C.fb}`); }
    }
  } finally { Object.assign(GLV, keep); Object.assign(LBL, lbk); }
}
function openTransmission() {
  const first = `<div class="tx-head"><span>📡 Incoming call · GASA Mission Control</span></div>
    <div class="tx-screen"><canvas id="cvTx" role="img" aria-label="Captain Smooshy's spaceship, the Gumdrop, crashes into a crater on Planet Glimmer-9. The picture then moves in on the round window, where Smooshy waves. He is safe inside the ship."></canvas></div>
    <p class="txrec"><b>Live from the Gumdrop · Planet Glimmer-9</b></p>
    <p>Captain Smooshy here, the bravest gummy bear in the universe! The Grade 6 scientists at WAB found the Intergalactic Space Fluid that carried me to a galaxy thousands of light years away. Then disaster struck: the Gumdrop crashed into a deep crater on Planet Glimmer-9. I'm safe inside, but the ship won't budge.</p>
    <p>My squishy gummy arms can only pull with <b>60 N</b>, and the Gumdrop weighs thousands of newtons. GASA engineers, please train on the simulator in the Workshop, then plan a rescue to get me out. Over and out!</p>
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><button type="button" class="ghost sm" id="txAgain">↺ Watch the crash again</button><button type="button" class="go" id="txGo">Accept the mission!</button></div>`;
  openModal(`<div class="modal txmodal" role="dialog" aria-label="Live call from Captain Smooshy">${first}</div>`, () => { cancelAnimationFrame(TXRAF); });
  const box = $('#modal .txmodal'); makeDraggable(box, '.tx-head', 'tx');
  const cv = $('#cvTx'); let t0 = performance.now();
  const paint = () => { if (!cv.isConnected) return; const c = fit(cv, 360, 200), t = RMOTION ? 9 : (performance.now() - t0) / 1000; readColors(); txCrash(c, t); TXRAF = requestAnimationFrame(paint); };
  paint();
  $('#txAgain').addEventListener('click', () => { t0 = performance.now(); });
  $('#txGo').addEventListener('click', () => {
    cancelAnimationFrame(TXRAF); dbSet('ws.briefed', true);
    box.innerHTML = `<div class="tx-head"><span>🛠️ The mission</span></div><p>${RB_SLOTS.filter(s => !s.ext).length} jobs stand between GASA and a happy gummy bear:</p><ol class="txlist">${RB_SLOTS.filter(s => !s.ext).map(s => `<li><b>${s.part}: ${s.title}</b></li>`).join('')}</ol><p>The Rescue board at the top of the page tracks every job.</p><div class="row" style="justify-content:flex-end"><button type="button" class="go" data-close>Let's go!</button></div>`;
  });
}
