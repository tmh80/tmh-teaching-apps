/* ===== Part 5 training round (new board): a 252 N rock beside the Gumdrop. Step 1: pry it up with a lever (and a winch on the pulling end).
   Step 2: lift it clear with a crane (pulley block + winch). Same rule as the rescue: 60 N × total MA must reach the force needed.
   When it is done the training kit packs away by itself, and nothing from training is carried into the route strip or the score. Saved as chal.c6e.gl.trainDone. */
const RB5_ROCK = 252;
function rb5Train(host, o) {   // o: { onDone() }
  const S = { step: 1, e: 1, wl: 1, ro: 2, wc: 1, anim: null, msg: '', raf: 0 };
  rb5Css(); host.innerHTML = `<div class="rb5"><div class="panel rb5train"><h3>🪨 Training: clear the rock first</h3>
    <p>A <b>${RB5_ROCK} N</b> rock sits beside the Gumdrop. Smooshy pulls <b>60 N</b>, so he needs machines. The rule is the same one you will use for the rescue: <b>60 N × total mechanical advantage (MA)</b> must be at least the force the job needs.</p>
    <canvas id="rb5tc" width="1000" height="260" aria-label="The rock beside the Gumdrop" style="width:100%;border-radius:10px;background:#1c1442"></canvas>
    <div id="rb5ts"></div><div class="row"><button class="go" id="rb5ttry">Try it</button><button id="rb5tskip" class="ghost">Skip training</button><span id="rb5tmsg" class="rb5msg"></span></div></div></div>`;
  const cv = $('#rb5tc', host), c = cv.getContext('2d'), msg = t => { $('#rb5tmsg', host).textContent = t; };
  const num = (id, lab, opts, cur) => `<label class="ctl"><span>${lab}</span><select id="${id}">${opts.map(v => `<option value="${v}"${v === cur ? ' selected' : ''}>${v}</option>`).join('')}</select></label>`;
  function controls() {
    $('#rb5ts', host).innerHTML = S.step === 1
      ? `<p><b>Step 1: pry the rock up with a lever.</b> A lever's MA is 2 × its arm length (the handle end sits that far from the fulcrum). Add a winch on the pulling end to multiply it.</p>${num('rb5e', 'Lever arm (m)', [1, 2, 3, 4, 5], S.e)}${num('rb5wl', 'Winch on the handle', ['none', 4, 8, 12, 20].map(v => v === 'none' ? 1 : v), S.wl)}<p class="mut">Needs ${RB5_ROCK} N. Your machines give 60 N × ${2 * S.e} × ${S.wl} = <b>${Math.round(60 * 2 * S.e * S.wl).toLocaleString('en-GB')} N</b>.</p>`
      : `<p><b>Step 2: lift the rock clear with a crane.</b> A pulley block with more ropes shares the load: its MA is the number of ropes. Add a winch to multiply it again.</p>${num('rb5ro', 'Ropes on the pulley block', [2, 4, 6, 8], S.ro)}${num('rb5wc', 'Winch', [1, 4, 8, 12, 20], S.wc)}<p class="mut">Needs ${RB5_ROCK} N. Your machines give 60 N × ${S.ro} × ${S.wc} = <b>${(60 * S.ro * S.wc).toLocaleString('en-GB')} N</b>.</p>`;
    ['rb5e', 'rb5wl', 'rb5ro', 'rb5wc'].forEach(id => { const el = $('#' + id, host); if (el) el.addEventListener('change', () => { S.e = +($('#rb5e', host) || { value: S.e }).value; S.wl = +($('#rb5wl', host) || { value: S.wl }).value; S.ro = +($('#rb5ro', host) || { value: S.ro }).value; S.wc = +($('#rb5wc', host) || { value: S.wc }).value; controls(); }); });
  }
  function draw(now) {
    if (!host.isConnected) return; const t = now / 1000, a = S.anim, k = a ? Math.min(1, (now - a.t0) / 1800) : 0; c.clearRect(0, 0, 1000, 260);
    const g = c.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, '#120c2e'); g.addColorStop(1, '#4a3790'); c.fillStyle = g; c.fillRect(0, 0, 1000, 260);
    c.fillStyle = '#cdbcf7'; c.fillRect(0, 200, 1000, 60); c.fillStyle = '#f4ecff'; c.fillRect(0, 197, 1000, 4);
    c.fillStyle = '#ff7fb0'; c.beginPath(); c.arc(190, 170, 42, Math.PI, 0); c.lineTo(232, 200); c.lineTo(148, 200); c.closePath(); c.fill(); c.fillStyle = '#d9f1ff'; c.beginPath(); c.arc(190, 150, 13, 0, 7); c.fill();   // the Gumdrop
    let rx = 330, ry = 176, rot = 0;
    if (S.step === 1 && a) { rot = -0.5 * Math.sin(Math.min(1, k) * Math.PI / 1) * (k < 1 ? 1 : 0) + (k >= 1 ? 0 : 0); ry = 176 - 14 * Math.sin(Math.min(1, k) * Math.PI); }
    if (S.step === 2) { rx = 330 + (a ? 150 * k : 0); ry = 176 - (a ? 90 * Math.sin(Math.min(1, k) * Math.PI) : 0); }
    if (!(S.step === 2 && a && k >= 1 && S.done)) { c.save(); c.translate(rx, ry); c.rotate(rot); c.fillStyle = '#8e9ca5'; c.beginPath(); c.moveTo(-34, 24); c.lineTo(-26, -14); c.lineTo(0, -28); c.lineTo(30, -12); c.lineTo(36, 24); c.closePath(); c.fill(); c.strokeStyle = '#5b6770'; c.lineWidth = 3; c.stroke(); c.restore(); }
    if (S.step === 1) { const tilt = a ? -0.35 * Math.sin(Math.min(1, k) * Math.PI) : 0; c.save(); c.translate(400, 196); c.strokeStyle = '#4c5670'; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, 0); c.lineTo(0, -16); c.lineTo(14, 0); c.stroke(); c.rotate(tilt); c.strokeStyle = '#e0a45a'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-70, -16); c.lineTo(40 + 36 * S.e, -16); c.stroke(); c.restore(); }
    else { c.strokeStyle = '#e4eaf5'; c.lineWidth = 7; c.beginPath(); c.moveTo(470, 200); c.lineTo(470, 70); c.lineTo(330, 70); c.stroke(); c.strokeStyle = '#f8e6b0'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(330, 70); c.lineTo(rx, ry - 26); c.stroke(); c.fillStyle = '#ffc53d'; c.fillRect(322, 62, 16, 16); }
    if (S.done) { c.font = '800 20px system-ui'; c.fillStyle = '#c9ffdc'; c.textAlign = 'center'; c.fillText('Rock cleared. Training kit packed away.', 640, 60); }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  $('#rb5ttry', host).addEventListener('click', () => {
    const need = RB5_ROCK, give = S.step === 1 ? 60 * 2 * S.e * S.wl : 60 * S.ro * S.wc;
    if (give + 1e-6 < need) { msg(`Not enough: you give ${Math.round(give).toLocaleString('en-GB')} N and the rock needs ${need} N. Add some mechanical advantage and try again.`); return; }
    S.anim = { t0: performance.now() };
    if (S.step === 1) { msg('The rock tips up and the lever holds it. Now lift it clear.'); setTimeout(() => { S.step = 2; S.anim = null; msg(''); controls(); }, 2000); }
    else { msg('The crane sets the rock down well clear of the Gumdrop.'); setTimeout(() => { S.done = true; msg('Training kit packed away. The crater is yours.'); setTimeout(() => o.onDone(), 1800); }, 2000); }
  });
  $('#rb5tskip', host).addEventListener('click', () => o.onDone());
  controls();
}
