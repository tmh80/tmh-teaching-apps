/* ===== Chapter 6: the story. The transmission (B2) and the Rescue board (B3), drawn from the script in docs/Chapter6_Workshop_Script.md =====
   The board sits at the top of every Chapter 6 page. A slot lights up when that Part's stamp is earned. Names live in the SMOOSHY constant (4a-workshop.js). */
const RB_SLOTS = [
  { sec: 'c6a', title: 'Toolkit packed', part: 'Part 1', next: 'Next: Part 1 packs the toolkit with the six simple machines.' },
  { sec: 'c6b', title: 'Mission computer loaded', part: 'Part 2', next: 'Next: Part 2 teaches the maths the mission computer needs.' },
  { sec: 'c6c', title: 'Crane kit built', part: 'Part 3', next: 'Next: Part 3 builds the crane kit.' },
  { sec: 'c6d', title: 'Smooshy saved!', part: 'Part 4', next: 'Next: Part 4 is the rescue itself.' }
];
const rbDone = id => !!dbGet('stamps', {})[id];
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
  if (st.b) { c.fillStyle = '#1d2a35'; c.beginPath(); c.roundRect(w * .13, h * .5 - 22, 24, 18, 3); c.fill(); c.fillStyle = '#7ef0a8'; c.fillRect(w * .13 + 3, h * .5 - 19, 18, 12); }
  if (st.c) { c.strokeStyle = '#e3a51c'; c.lineWidth = 4; c.beginPath(); c.moveTo(w * .9, h * .5); c.lineTo(w * .9, h * .5 - 34); c.lineTo(w * .96, h * .5 - 40); c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(w * .96, h * .5 - 40); c.lineTo(w * .96, h * .5 - 20); c.stroke(); }
  if (st.d) { drawGumdrop(c, w * .5, h * .5, .52, 0); drawSmooshy(c, w * .62, h * .5 - 22, .34, 'cheer'); }
  else { drawGumdrop(c, w * .5, h * .86, .62, .5); drawSmooshy(c, w * .42, h * .83 - 18, .3, 'wave'); }
}
function renderRescue() {
  const host = $('#rescueBoard'); if (!host) return;
  const on = !!CH && CH.ch === 'c6' && VIEW === 'vChapter'; host.hidden = !on; if (!on) return;
  const have = RB_SLOTS.map(s => !!secOf(s.sec)), done = RB_SLOTS.map(s => rbDone(s.sec)), nx = RB_SLOTS.findIndex((s, i) => have[i] && !done[i]);
  host.innerHTML = `<canvas id="cvRescue" role="img" aria-label="Glimmer-9's crater. Captain Smooshy's spaceship, the Gumdrop, is tipped over at the bottom, and he waves from the window."></canvas>
    <div class="rbside"><div class="rbhd"><span class="lbl">Rescue board</span><h2>Save Captain Smooshy!</h2></div>
    <ol class="rbslots">${RB_SLOTS.map((s, i) => `<li class="${done[i] ? 'on' : ''} ${have[i] ? '' : 'soon'}"><span class="rbtick">${done[i] ? '✓' : i + 1}</span><span><b>${s.title}</b><small>${s.part}${have[i] ? '' : ' · coming soon'}</small></span></li>`).join('')}</ol>
    <p class="rbnext">${nx >= 0 ? RB_SLOTS[nx].next : done.every(Boolean) ? 'Captain Smooshy is safe. Brilliant rescue!' : 'More of the mission is on its way.'}</p>
    <div class="row"><button type="button" class="ghost sm" data-act="transmission">📡 Replay transmission</button></div></div>`;
  rbDraw();
}
function rbDraw() {
  const cv = $('#cvRescue'); if (!cv || !cv.offsetParent) return; readColors(); const W = 520, H = 190, c = fit(cv, W, H);
  drawCrater(c, W, H, { a: rbDone('c6a'), b: rbDone('c6b'), c: rbDone('c6c'), d: rbDone('c6d') });
}
/* ---------- the transmission: an incoming video call ---------- */
let TXRAF = 0;
function openTransmission() {
  const first = `<div class="tx-head"><span>📡 Incoming transmission from deep space!</span></div>
    <div class="tx-screen"><canvas id="cvTx" role="img" aria-label="Captain Smooshy, a blue gummy bear astronaut in a bubble helmet, waving from his spaceship"></canvas></div>
    <p>Captain Smooshy here, the bravest gummy bear in the universe! A while ago, the Grade 6 scientists at WAB tested Intergalactic Space Fluids to find the one that could carry me to a galaxy thousands of light years away. It worked! Then disaster struck. My ship, the Gumdrop, crash-landed at the bottom of a deep crater on Planet Glimmer-9, and it's stuck.</p>
    <p>My squishy gummy arms can only pull with <b>60 N</b>, and the Gumdrop weighs thousands of newtons. Force HQ engineers, I need you to learn how machines work and build me a way out. Over and out!</p>
    <div class="row" style="justify-content:flex-end"><button type="button" class="go" id="txGo">Accept the mission!</button></div>`;
  openModal(`<div class="modal txmodal" role="dialog" aria-label="Incoming transmission from Captain Smooshy">${first}</div>`, () => { cancelAnimationFrame(TXRAF); });
  const box = $('#modal .txmodal'); makeDraggable(box, '.tx-head', 'tx');
  const cv = $('#cvTx'), t0 = performance.now();
  const paint = () => { if (!cv.isConnected) return; const c = fit(cv, 360, 170), t = (performance.now() - t0) / 1000; readColors();
    const sk = c.createLinearGradient(0, 0, 0, 170); sk.addColorStop(0, '#3d2a78'); sk.addColorStop(1, '#8e6fd6'); c.fillStyle = sk; c.fillRect(0, 0, 360, 170);
    c.fillStyle = 'rgba(255,255,255,.8)'; [[20, 20], [60, 50], [300, 24], [330, 70], [250, 12], [120, 16]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 1.5, 0, 7); c.fill(); });
    drawGumdrop(c, 250, 150, .62, .5); drawSmooshy(c, 120, 100, .95, 'wave', t);
    if (!RMOTION) { c.fillStyle = 'rgba(255,255,255,.07)'; for (let y = (t * 30) % 6; y < 170; y += 6) c.fillRect(0, y, 360, 1.5); if (Math.sin(t * 9) > .93) { c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, (t * 97) % 170, 360, 10); } }
    TXRAF = requestAnimationFrame(paint); };
  paint();
  $('#txGo').addEventListener('click', () => {
    cancelAnimationFrame(TXRAF); dbSet('ws.briefed', true);
    box.innerHTML = `<div class="tx-head"><span>🛠️ The mission</span></div><p>Four jobs stand between Force HQ and a happy gummy bear:</p><ol class="txlist">${RB_SLOTS.map((s, i) => `<li><b>${s.part}: ${s.title}</b></li>`).join('')}</ol><p>The Rescue board at the top of the page tracks every job.</p><div class="row" style="justify-content:flex-end"><button type="button" class="go" data-close>Let's go!</button></div>`;
  });
}
