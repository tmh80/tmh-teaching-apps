/* ===== Chapter 6: the story. The transmission (B2) and the Rescue board (B3), drawn from the script in docs/Chapter6_Workshop_Script.md =====
   The board sits at the top of every Chapter 6 page. A slot lights up when that Part's stamp is earned. Names live in the SMOOSHY constant (4a-workshop.js). */
const RB_SLOTS = [
  { sec: 'c6a', title: 'Levers packed', part: 'Part 1', next: 'Next: Part 1 packs the first tool, the lever.' },
  { sec: 'c6b', title: 'Toolkit packed', part: 'Part 2', next: 'Next: Part 2 packs pulleys, a winch, ramps, wedges and a screw jack.' },
  { sec: 'c6c', title: 'Mission computer loaded', part: 'Part 3', next: 'Next: Part 3 teaches the maths the mission computer needs.' },
  { sec: 'c6d', title: 'Crane kit built', part: 'Part 4', next: 'Next: Part 4 builds the crane kit.' },
  { sec: 'c6e', title: 'Smooshy saved!', part: 'Part 5', next: 'Next: Part 5 is the rescue itself.' },
  { sec: 'c6f', title: 'Gummy Base One built', part: 'Extension', ext: true, next: 'Optional: the Extension helps the gummy colonists build Gummy Base One.' }
];
const rbDone = id => !!dbGet('stamps', {})[id];
/* the Gumdrop with Captain Smooshy trapped inside, peeping out of the round window (Tom, 1 Nov 2026: he's stuck in his ship) */
function drawGumdropInside(c, x, y, s, tilt, mood, tt) {
  drawGumdrop(c, x, y, s, tilt);
  c.save(); c.translate(x, y); c.rotate(tilt || 0); c.scale(s, s);
  c.beginPath(); c.arc(0, -42, 13.5, 0, 7); c.clip(); c.fillStyle = '#26364a'; c.fillRect(-16, -58, 32, 32);
  drawSmooshy(c, 0, -25, 0.42, mood || 'worried', tt); c.restore();
  c.save(); c.translate(x, y); c.rotate(tilt || 0); c.scale(s, s); c.strokeStyle = '#fffaf2'; c.lineWidth = 4; c.beginPath(); c.arc(0, -42, 15, 0, 7); c.stroke(); c.restore();
}
/* Glimmer-9's crater, side-on: violet sky, two moons, crystal rocks, the Gumdrop tipped over at the bottom */
function drawCrater(c, w, h, st) {
  const sk = c.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#3d2a78'); sk.addColorStop(1, '#8e6fd6'); c.fillStyle = sk; c.fillRect(0, 0, w, h);
  c.fillStyle = 'rgba(255,255,255,.8)'; [[30, 20], [90, 44], [160, 14], [250, 30], [330, 18], [410, 40], [470, 12]].forEach(([x, y]) => { c.beginPath(); c.arc(x * w / 520, y, 1.4, 0, 7); c.fill(); });
  c.fillStyle = '#f3e9ff'; c.beginPath(); c.arc(w * .78, 32, 17, 0, 7); c.fill(); c.fillStyle = '#d9c5f5'; c.beginPath(); c.arc(w * .78 - 5, 28, 4, 0, 7); c.fill();
  c.fillStyle = '#ffd6f0'; c.beginPath(); c.arc(w * .9, 52, 9, 0, 7); c.fill();
  /* rim and crater wall */
  c.fillStyle = '#b9a2e4'; c.beginPath(); c.moveTo(0, h * .5); c.lineTo(w * .14, h * .5); c.lineTo(w * .3, h * .86); c.lineTo(w * .7, h * .86); c.lineTo(w * .86, h * .5); c.lineTo(w, h * .5); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fill();
  c.fillStyle = '#9a80d0'; c.beginPath(); c.moveTo(w * .3, h * .86); c.lineTo(w * .7, h * .86); c.lineTo(w * .7, h); c.lineTo(w * .3, h); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,.85)'; [[.06, .55], [.1, .6], [.9, .56], [.95, .62], [.38, .93], [.62, .95], [.5, .97]].forEach(([x, y]) => { c.beginPath(); c.moveTo(w * x, h * y - 7); c.lineTo(w * x + 4, h * y); c.lineTo(w * x - 4, h * y); c.closePath(); c.fill(); });
  /* the things that appear as Parts are finished */
  if (st.a) { c.fillStyle = '#c94a82'; c.beginPath(); c.roundRect(w * .035, h * .5 - 20, 34, 20, 4); c.fill(); c.fillStyle = '#e3a51c'; c.fillRect(w * .035 + 12, h * .5 - 26, 10, 7); c.fillStyle = '#fff'; c.fillRect(w * .035 + 5, h * .5 - 13, 24, 3); }
  if (st.c) { c.fillStyle = '#1d2a35'; c.beginPath(); c.roundRect(w * .13, h * .5 - 22, 24, 18, 3); c.fill(); c.fillStyle = '#7ef0a8'; c.fillRect(w * .13 + 3, h * .5 - 19, 18, 12); }
  if (st.d) { c.strokeStyle = '#e3a51c'; c.lineWidth = 4; c.beginPath(); c.moveTo(w * .9, h * .5); c.lineTo(w * .9, h * .5 - 34); c.lineTo(w * .96, h * .5 - 40); c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(w * .96, h * .5 - 40); c.lineTo(w * .96, h * .5 - 20); c.stroke(); }
  if (st.b) { c.fillStyle = '#6c7b84'; c.beginPath(); c.roundRect(w * .2, h * .5 - 16, 28, 16, 3); c.fill(); c.fillStyle = '#e3a51c'; c.fillRect(w * .2 + 4, h * .5 - 12, 20, 3); }
  if (st.f) { c.fillStyle = 'rgba(191,230,245,.85)'; c.beginPath(); c.arc(w * .78, h * .5, 26, Math.PI, 0); c.fill(); c.fillStyle = '#6c7b84'; c.fillRect(w * .78 - 26, h * .5 - 3, 52, 6); }
  if (st.custom) st.custom(c, w, h);
  else if (st.e) { drawGumdrop(c, w * .5, h * .5, .52, 0); drawSmooshy(c, w * .62, h * .5 - 22, .34, 'cheer'); }
  else { drawGumdropInside(c, w * .5, h * .86, .62, .5, 'worried');
    /* the black box beacon, still blinking beside the ship */
    const on = RMOTION || Math.floor(performance.now() / 600) % 2 === 0; c.fillStyle = '#e8762c'; c.beginPath(); c.roundRect(w * .62, h * .86 - 14, 18, 14, 3); c.fill(); c.fillStyle = on ? '#ff3b30' : '#7a2a24'; c.beginPath(); c.arc(w * .62 + 9, h * .86 - 18, 3.5, 0, 7); c.fill(); }
}
function renderRescue() {
  const host = $('#rescueBoard'); if (!host) return;
  const on = !!CH && CH.ch === 'c6' && VIEW === 'vChapter'; host.hidden = !on; if (!on) return;
  const have = RB_SLOTS.map(s => !!secOf(s.sec)), done = RB_SLOTS.map(s => rbDone(s.sec)), nx = RB_SLOTS.findIndex((s, i) => have[i] && !done[i]);
  host.innerHTML = `<canvas id="cvRescue" role="img" aria-label="Glimmer-9's crater. Captain Smooshy's spaceship, the Gumdrop, is tipped over at the bottom. He is trapped inside and peeps out of the window, and the ship's black box is blinking beside it."></canvas>
    <div class="rbside"><div class="rbhd"><span class="lbl">Rescue board</span><h2>Save Captain Smooshy!</h2></div>
    <ol class="rbslots">${RB_SLOTS.map((s, i) => `<li class="${done[i] ? 'on' : ''} ${have[i] ? '' : 'soon'}"><span class="rbtick">${done[i] ? '✓' : i + 1}</span><span><b>${s.title}</b><small>${s.part}${have[i] ? '' : ' · coming soon'}</small></span></li>`).join('')}</ol>
    <p class="rbnext">${nx >= 0 ? RB_SLOTS[nx].next : done.every(Boolean) ? 'Captain Smooshy is safe. Brilliant rescue!' : 'More of the mission is on its way.'}</p>
    <div class="row"><button type="button" class="ghost sm" data-act="transmission">📡 Replay transmission</button></div></div>`;
  rbDraw();
}
function rbDraw() {
  const cv = $('#cvRescue'); if (!cv || !cv.offsetParent) return; readColors(); const W = 520, H = 190, c = fit(cv, W, H);
  drawCrater(c, W, H, { a: rbDone('c6a'), b: rbDone('c6b'), c: rbDone('c6c'), d: rbDone('c6d'), e: rbDone('c6e'), f: rbDone('c6f') });
}
/* ---------- the transmission: the Gumdrop crashes into a crater, and its black box sends Smooshy's recorded message (Tom, 1 Nov 2026) ---------- */
let TXRAF = 0;
function txCrash(c, t) {
  const W = 360, H = 200, shake = !RMOTION && t > 1.8 && t < 2.3 ? Math.sin(t * 90) * 3 * (2.3 - t) * 2 : 0;
  c.save(); c.translate(shake, 0);
  const sk = c.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#2b1d5c'); sk.addColorStop(1, '#8e6fd6'); c.fillStyle = sk; c.fillRect(-10, 0, W + 20, H);
  c.fillStyle = 'rgba(255,255,255,.8)'; [[20, 18], [60, 46], [300, 22], [330, 64], [250, 12], [120, 16], [190, 40]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 1.4, 0, 7); c.fill(); });
  c.fillStyle = '#f3e9ff'; c.beginPath(); c.arc(300, 40, 13, 0, 7); c.fill(); c.fillStyle = '#ffd6f0'; c.beginPath(); c.arc(330, 64, 6, 0, 7); c.fill();
  /* the ground and the crater */
  c.fillStyle = '#b9a2e4'; c.beginPath(); c.moveTo(-10, 150); c.lineTo(170, 150); c.lineTo(196, 182); c.lineTo(280, 182); c.lineTo(306, 150); c.lineTo(W + 10, 150); c.lineTo(W + 10, H); c.lineTo(-10, H); c.closePath(); c.fill();
  c.fillStyle = '#9a80d0'; c.fillRect(196, 182, 84, 18);
  const land = { x: 238, y: 182 };
  if (t < 1.8) {
    /* falling: the ship streaks down from the top left with a flame trail */
    const k = t / 1.8, e = k * k, x = -40 + (land.x + 40) * k, y = 20 + (land.y - 20) * e, tilt = -0.9 + k * 1.4;
    for (let i = 1; i <= 7; i++) { const kk = Math.max(0, k - i * 0.035), ee = kk * kk, px = -40 + (land.x + 40) * kk, py = 20 + (land.y - 20) * ee; c.fillStyle = i < 3 ? 'rgba(255,220,90,.85)' : 'rgba(255,140,60,' + (0.7 - i * 0.08) + ')'; c.beginPath(); c.arc(px, py - 20, 10 - i, 0, 7); c.fill(); }
    drawGumdrop(c, x, y, .5, tilt);
  } else {
    drawGumdropInside(c, land.x, land.y + 6, .95, .42, t > 2.6 ? 'worried' : 'strain', t);
    if (t < 2.9) { const r = (t - 1.8) * 70; c.fillStyle = `rgba(230,215,250,${Math.max(0, .8 - (t - 1.8) * .7)})`; [[-30, 0], [0, -14], [30, 0], [10, 10], [-14, 8]].forEach(([dx, dy]) => { c.beginPath(); c.arc(land.x + dx * r / 40, land.y - 10 + dy * r / 40, 12 + r * .25, 0, 7); c.fill(); }); }
    if (t > 2.4) {
      /* the black box: an orange flight recorder with a blinking light, sending radio rings */
      const bx = 314, by = 176, on = RMOTION || Math.floor(t * 2) % 2 === 0;
      c.fillStyle = '#e8762c'; c.beginPath(); c.roundRect(bx - 12, by - 14, 24, 16, 3); c.fill(); c.fillStyle = '#fff'; c.fillRect(bx - 8, by - 9, 16, 2.5);
      c.fillStyle = on ? '#ff3b30' : '#7a2a24'; c.beginPath(); c.arc(bx, by - 19, 3.5, 0, 7); c.fill();
      if (!RMOTION) for (let i = 0; i < 3; i++) { const rr = ((t * 26 + i * 18) % 54) + 8; c.strokeStyle = `rgba(255,255,255,${.7 - rr / 80})`; c.lineWidth = 2; c.beginPath(); c.arc(bx, by - 19, rr, -2.4, -0.7); c.stroke(); }
      c.fillStyle = 'rgba(13,23,29,.75)'; c.beginPath(); c.roundRect(10, 10, 168, 24, 6); c.fill(); c.fillStyle = on ? '#ff3b30' : '#7a2a24'; c.beginPath(); c.arc(24, 22, 4.5, 0, 7); c.fill();
      txt(c, 'BLACK BOX SIGNAL · GUMDROP', 34, 22.5, '#fffaf2', `800 10px ${C.fb}`, 'left');
    }
  }
  c.restore();
}
function openTransmission() {
  const first = `<div class="tx-head"><span>📡 Black box signal detected!</span></div>
    <div class="tx-screen"><canvas id="cvTx" role="img" aria-label="Captain Smooshy's spaceship, the Gumdrop, crashes into a crater on Planet Glimmer-9. Smooshy is trapped inside and peeps out of the window, while the ship's black box blinks and sends a signal."></canvas></div>
    <p class="txrec"><b>Black box recording · the Gumdrop · Planet Glimmer-9</b></p>
    <p>Captain Smooshy here, the bravest gummy bear in the universe! The Grade 6 scientists at WAB found the Intergalactic Space Fluid that carried me to a galaxy thousands of light years away. Then disaster struck: the Gumdrop crashed into a deep crater on Planet Glimmer-9. I'm trapped inside, and the ship won't budge.</p>
    <p>My squishy gummy arms can only pull with <b>60 N</b>, and the Gumdrop weighs thousands of newtons. My black box is sending this message to Force HQ. Engineers, please learn how machines work and build me a way out. Over and out!</p>
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><button type="button" class="ghost sm" id="txAgain">↺ Watch the crash again</button><button type="button" class="go" id="txGo">Accept the mission!</button></div>`;
  openModal(`<div class="modal txmodal" role="dialog" aria-label="Black box message from Captain Smooshy">${first}</div>`, () => { cancelAnimationFrame(TXRAF); });
  const box = $('#modal .txmodal'); makeDraggable(box, '.tx-head', 'tx');
  const cv = $('#cvTx'); let t0 = performance.now();
  const paint = () => { if (!cv.isConnected) return; const c = fit(cv, 360, 200), t = RMOTION ? 9 : (performance.now() - t0) / 1000; readColors(); txCrash(c, t); TXRAF = requestAnimationFrame(paint); };
  paint();
  $('#txAgain').addEventListener('click', () => { t0 = performance.now(); });
  $('#txGo').addEventListener('click', () => {
    cancelAnimationFrame(TXRAF); dbSet('ws.briefed', true);
    box.innerHTML = `<div class="tx-head"><span>🛠️ The mission</span></div><p>${RB_SLOTS.filter(s => !s.ext).length} jobs stand between Force HQ and a happy gummy bear:</p><ol class="txlist">${RB_SLOTS.filter(s => !s.ext).map(s => `<li><b>${s.part}: ${s.title}</b></li>`).join('')}</ol><p>The Rescue board at the top of the page tracks every job.</p><div class="row" style="justify-content:flex-end"><button type="button" class="go" data-close>Let's go!</button></div>`;
  });
}
