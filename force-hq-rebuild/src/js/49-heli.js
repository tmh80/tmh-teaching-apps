/* ===== Chapter 5: the helicopter pad (S.scene = 'heli', Extension step p3) =====
   The helicopter (mass 1,180 kg) starts on the pad. The student sets the lift (3,000 to 16,000 N). Vertical air resistance is 104 × v² against the motion,
   so a lift of 12,500 N gives a steady climb of 3.0 m/s. Fixed 0.01 s steps, semi-implicit Euler, like the Drop Zone. It runs all the time (no Drop button).
   Hovering = in the air with |v| < 0.05 m/s for 3 s. Script: docs/Chapter5_Script.md section B3. */
const HE_M = 1180, HE_K = 104, HE_LO = 3000, HE_HI = 16000, HE_CEIL = 1000, HE_DT = 0.01;
const HE = { lift: HE_LO, y: 0, v: 0, a: 0, t: 0, acc: 0, n: 0, hoverT: 0, hovering: false, holdV: null, holdT: 0, hi: null, lo: null, msg: '', msgAt: 0, landed: false, landReal: 0, marked: null };
const heWeight = () => HE_M * G;
function heliForce() {   // the forces at this moment
  const W = heWeight(), D = HE_K * HE.v * Math.abs(HE.v), onPad = HE.y <= 0 && HE.v === 0, N = onPad ? Math.max(0, W - HE.lift) : 0;
  const net = onPad && HE.lift <= W ? 0 : HE.lift - W - D;
  return { W, D, N, lift: HE.lift, net, onPad };
}
function heliReset() {
  Object.assign(HE, { lift: HE_LO, y: 0, v: 0, a: 0, t: 0, acc: 0, n: 0, hoverT: 0, hovering: false, holdV: null, holdT: 0, hi: null, lo: null, msg: '', landed: false, marked: null });
}
function heliStep() {
  const f = heliForce(); HE.a = f.net / HE_M;
  if (!(f.onPad && HE.lift <= f.W)) {
    HE.v += HE.a * HE_DT; HE.y += HE.v * HE_DT;
    if (HE.y <= 0) {   // back on the pad
      const lv = -HE.v; HE.y = 0;
      if (lv > 0.05) { HE.msg = lv > 4 ? 'Bump! Real pilots land more gently than that.' : 'Soft landing!'; HE.msgAt = performance.now(); HE.landed = true; HE.landReal = performance.now(); S.flags.heliLanded = true; }
      HE.v = 0; HE.a = 0;
    } else if (HE.y >= HE_CEIL) { HE.y = HE_CEIL; HE.v = Math.min(HE.v, 0); HE.msg = 'That is high enough! Press Reset to go back to the pad.'; HE.msgAt = performance.now(); }
  }
  HE.t += HE_DT; HE.n++;
  if (HE.y > 20) S.flags.heliClimb20 = true;
  if (HE.y > 50) S.flags.heliClimb50 = true;
  if (HE.y > 0.3 && Math.abs(HE.a) < 0.01 && Math.abs(HE.v - 3) < 0.15) S.flags.heliSteady3 = true;
  if (HE.y > 0.3 && Math.abs(HE.v) < 0.05) { HE.hoverT += HE_DT; if (HE.hoverT >= 3) { HE.hovering = true; S.flags.heliHover = true; } } else { HE.hoverT = 0; HE.hovering = false; }
  /* markers: a lift that has been held for 2 s is judged by what it does from rest (climb or not) */
  HE.holdT += HE_DT;
  if (HE.holdV != null && HE.holdT >= 2 && HE.holdV !== HE.marked) {
    HE.marked = HE.holdV;
    if (HE.holdV > f.W) HE.hi = HE.hi == null ? HE.holdV : Math.min(HE.hi, HE.holdV);
    else if (HE.holdV < f.W) HE.lo = HE.lo == null ? HE.holdV : Math.max(HE.lo, HE.holdV);
    heliRenderControls();
  }
}
function heliUpdate(dt) {
  HE.acc += dt; let guard = 0;
  while (HE.acc >= HE_DT - 1e-12 && guard++ < 80) { HE.acc -= HE_DT; heliStep(); }
}
function heliForces() { const f = heliForce(); return { L: 0, R: 0, shove: 0, app: 0, fr: 0, brk: 0, net: f.net, W: f.W, N: f.N, m: HE_M, a: HE.a, fmax: 0, fk: 0 }; }
function heliSetup() {
  clearCh2(); S.scene = 'heli'; S.left = []; S.right = []; S.floor = 'air'; S.warp = 1; heliReset(); S.running = true;
}
/* headless run used by the tests: hold `lift` for `secs` seconds from the pad, returns y and v */
function heliSimulate(lift, secs) {
  const keep = JSON.stringify(HE), kf = S.flags; S.flags = newFlags(); heliReset(); HE.lift = lift; HE.holdV = lift;
  for (let i = 0; i < Math.round(secs / HE_DT); i++) heliStep();
  const out = { y: HE.y, v: HE.v }; Object.assign(HE, JSON.parse(keep)); S.flags = kf; return out;
}
function heliSetLift(v) {
  v = clamp(Math.round(v), HE_LO, HE_HI); if (v === HE.lift) { heliRenderControls(); return; }
  HE.lift = v; HE.holdV = v; HE.holdT = 0; HE.msg = ''; S.flags.heliLiftSet = true; heliRenderControls(); if (LAB.onChange) LAB.onChange();
}
function heliRenderControls() {
  const r = $('#liftR'); if (!r) return;
  if (document.activeElement !== r) r.value = HE.lift; const n = $('#liftNum'); if (n && document.activeElement !== n) n.value = HE.lift;
  const mk = $('#liftMarks'), note = $('#liftNote'), pos = v => `${(v - HE_LO) / (HE_HI - HE_LO) * 100}%`;
  if (mk) mk.innerHTML = (HE.hi != null ? `<i class="hi" style="left:${pos(HE.hi)}" title="Made it climb"></i>` : '') + (HE.lo != null ? `<i class="lo" style="left:${pos(HE.lo)}" title="Made it sink or stay on the pad"></i>` : '');
  if (note) {
    note.hidden = HE.hi == null && HE.lo == null;
    note.innerHTML = `${HE.hi != null ? `<span class="hi">●</span> made it climb: ${fmt(HE.hi, 0)} N` : ''}${HE.hi != null && HE.lo != null ? ' · ' : ''}${HE.lo != null ? `<span class="lo">●</span> made it sink or stay put: ${fmt(HE.lo, 0)} N` : ''}${HE.hi != null && HE.lo != null ? '<br>The lift that makes it hover is between them.' : ''}`;
  }
}
function initHeli() {
  const r = $('#liftR'); if (!r) return;
  r.addEventListener('input', () => heliSetLift(+r.value));
  const n = $('#liftNum'), go = () => { const v = parseNum(n.value); if (isNaN(v)) { heliRenderControls(); return; } heliSetLift(v); };
  n.addEventListener('change', go); n.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); n.blur(); } });
  $$('[data-lf]').forEach(b => b.addEventListener('click', () => heliSetLift(HE.lift + +b.dataset.lf)));
}

/* ---------- drawing ---------- */
function heliMasked() { return dzMasked(); }
function drawHeliScene(c) {
  const tt = performance.now() / 1000, sky = DZ_SKY.earth, alt = HE.y, camMin = (DZ_GY - DZ_REFY) / DZ_SC, cam = Math.max(alt, camMin), scr = a => DZ_REFY + (cam - a) * DZ_SC, x0 = 0, w = 900;
  const f = heliForce(), mk = heliMasked();
  const g = c.createLinearGradient(0, 0, 0, DZ_H); g.addColorStop(0, sky.top); g.addColorStop(1, sky.bot); c.fillStyle = g; c.fillRect(0, 0, w, DZ_H);
  const lo = cam - (DZ_H - DZ_REFY) / DZ_SC - 10, hi = cam + DZ_REFY / DZ_SC + 10, sp = 45;
  for (let i = Math.floor(lo / sp); i <= Math.ceil(hi / sp); i++) { const cx = 40 + dzHash(i, 5) * (w - 80), cy = scr(i * sp + dzHash(i, 6) * sp), r = 16 + dzHash(i, 7) * 22; c.fillStyle = 'rgba(255,255,255,.88)'; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.arc(cx + r * .9, cy + 4, r * .75, 0, 7); c.arc(cx - r * .9, cy + 5, r * .65, 0, 7); c.fill(); }
  const gy = scr(0);
  if (gy < DZ_H) {
    c.fillStyle = sky.gnd; c.fillRect(0, gy, w, DZ_H - gy + 2); c.fillStyle = sky.gnd2; c.fillRect(0, gy + 8, w, 5);
    c.fillStyle = '#5b6164'; c.beginPath(); c.roundRect(255, gy - 3, 150, 10, 4); c.fill(); c.fillStyle = '#f3d66a'; for (let q = 0; q < 6; q++) c.fillRect(265 + q * 24, gy + 0.5, 12, 3);
    c.fillStyle = '#e8eef2'; c.beginPath(); c.arc(330, gy + 30, 13, 0, 7); c.fill(); txt(c, 'H', 330, gy + 31, '#5b6164', `800 17px ${C.fb}`);
  }
  /* altitude scale */
  c.fillStyle = C.panel; c.globalAlpha = .86; c.fillRect(0, 0, 46, DZ_H); c.globalAlpha = 1; c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(46.5, 0); c.lineTo(46.5, DZ_H); c.stroke();
  const ds = DZ_STEPS.find(d => d * DZ_SC >= 44) || 1000, a0 = Math.max(0, Math.floor(lo / ds) * ds);
  c.font = `600 11px ${C.fn}`; c.textAlign = 'right'; c.textBaseline = 'middle';
  for (let a = a0; a <= hi + ds; a += ds) { const y = scr(a); if (y < 4 || y > DZ_H - 18) continue; c.strokeStyle = C.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(46, y); c.lineTo(36, y); c.stroke(); c.fillStyle = C.ink; c.fillText(a >= 1000 ? Math.round(a).toLocaleString('en-GB') : String(a), 33, y); }
  txt(c, 'metres', 23, DZ_H - 12, C.muted, `600 10px ${C.fn}`);
  /* the helicopter (its skids touch the pad when y = 0) and the downwash */
  const ox = 330, hy = scr(alt) - 24 - 2, airborne = alt > 0.05;
  if (airborne || HE.lift > f.W * 0.6) { c.save(); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2; c.lineCap = 'round'; const ln = clamp(HE.lift / 16000 * 38, 4, 40); for (let q = 0; q < 5; q++) { const px = ox - 36 + q * 18, ph = RMOTION ? q / 5 : (tt * 1.6 + q / 5) % 1, py = hy + 30 + ph * 46; c.globalAlpha = (1 - ph) * (airborne ? .9 : .45); c.beginPath(); c.moveTo(px, py); c.lineTo(px, py + ln * (1 - ph * .4)); c.stroke(); } c.restore(); }
  dzHeli(c, ox + 6, hy, HE.lift > f.W * 0.5 || airborne ? tt : 0);
  pill(c, '1,180 kg', ox, hy - 46, C.ink, 12);
  /* messages */
  if (HE.hovering) dzNote(c, 'Hovering!', 246, 92, C.good, 380, 18);
  else if (HE.msg && performance.now() - HE.msgAt < 6000) dzNote(c, HE.msg, 246, 92, HE.msg.startsWith('Bump') ? C.hazard : C.good, 380, 14);
  else if (!airborne && HE.lift <= f.W) dzNote(c, 'On the pad. Make the lift bigger to take off.', 246, 92, C.line, 380, 14);
  /* the free-body diagram */
  if (LAB.show.has('dfbd')) heliFBD(c, f, mk);
  hudBox(c, `${fmt(Math.round(HE.t * 10) / 10, 1)} s`, 54, 22, C.left, 'left'); hudBox(c, 'Earth · Helicopter pad', w - 8, 22, C.line, 'right');
  heliReadouts(mk);
}
function heliFBD(c, f, mk) {
  const px = 440, pw = 450, fcx = px + pw / 2 - 6, fcy = 372, kw = 56 / f.W;
  c.save(); c.fillStyle = C.panel; c.globalAlpha = .93; c.beginPath(); c.roundRect(px, 86, pw, DZ_H - 96, 10); c.fill(); c.globalAlpha = 1; c.strokeStyle = C.line; c.lineWidth = 1.5; c.stroke();
  txt(c, 'Free-body diagram', px + 10, 99, C.muted, `700 12px ${C.fb}`, 'left');
  c.save(); c.globalAlpha = .9; c.translate(fcx, fcy + 6); c.scale(.5, .5); dzHeli(c, 0, 0, 0); c.restore();
  const lab = (l1, l2, x, y, col) => { c.font = `700 11px ${C.fn}`; const ww = Math.max(c.measureText(l1).width, c.measureText(l2).width) + 8, xx = clamp(x, px + ww / 2 + 3, px + pw - ww / 2 - 3); c.fillStyle = C.panel; c.fillRect(xx - ww / 2, y - 14, ww, 28); txt(c, l1, xx, y - 6, col, `600 11px ${C.fn}`); txt(c, l2, xx, y + 6.5, col, `800 12px ${C.fn}`); };
  const wx = fcx - 40, lx = fcx + 8, dx = fcx + 56;
  arrow(c, wx, fcy, wx, fcy + 56, C.vert, 4); lab('weight', mk.has('heliW') ? '? N' : dzN(f.W), wx, fcy + 56 + 22, C.vert);
  const ll = f.lift * kw; arrow(c, lx, fcy, lx, fcy - ll, C.accent, 4); lab('lift', dzN(f.lift), lx, fcy - ll - 22, C.accent);
  if (f.N > 1) { const nl = f.N * kw; arrow(c, lx + 36, fcy, lx + 36, fcy - nl, C.vert, 4); lab('pad pushes up', dzN(f.N), lx + 36, fcy - nl - 22, C.vert); }
  const dl = Math.abs(f.D) * kw;
  if (dl > 2 && Math.abs(HE.v) > 0.05) { const up = HE.v < 0; arrow(c, dx, fcy, dx, up ? fcy - dl : fcy + dl, C.res, 4); lab('air resistance', dzN(f.D), dx, up ? fcy - dl - 22 : fcy + dl + 22, C.res); }
  else lab('air resistance', '0 N', dx, fcy + 30, C.res);
  c.restore();
}
function heliReadouts(mk) {
  const el = $('#dreads'); if (!el || el.hidden) return;
  const keys = ['readH', 'readV'].filter(k => LAB.show.has(k)), sig = 'heli' + keys.join();
  if (el.dataset.sig !== sig) {
    el.dataset.sig = sig; const lab = { readH: 'Height', readV: 'Velocity (upwards)' }, tip = { readH: 'height', readV: 'velocity' };
    el.innerHTML = `<div class="dlane"><div class="dlh" style="color:${C.left}">Helicopter · Earth</div><div class="dgrid">${keys.map(k => `<div class="rd" data-panel="${k}"><div class="lbl"><button type="button" class="term tl" data-t="${tip[k]}">${lab[k]}</button></div><div class="v" id="he-${k}"></div></div>`).join('')}</div></div>`;
  }
  const set = (k, s) => { const e = document.getElementById('he-' + k); if (e && e.textContent !== s) e.textContent = s; };
  set('readH', fmt(Math.max(0, HE.y), 1) + ' m'); set('readV', Math.abs(HE.v) < 0.005 ? '0 m/s' : fmt(Math.abs(HE.v), 1) + ' m/s ' + (HE.v > 0 ? '↑' : '↓'));
}

Object.assign(INFO, {
  lift: { title: 'How to use the lift slider', cards: [{ hi: '[data-panel="lift"]', html: `<p>The <b>lift</b> is the upward force from the helicopter's blades. Drag the slider, type a number, or use the small buttons to change it. The <b>free-body diagram</b> shows the lift, the weight and the air resistance.</p><p>Each lift you hold for a couple of seconds leaves a marker: <b style="color:#d6402c">red</b> if it made the helicopter climb, <b style="color:#c99a10">yellow</b> if it made it sink or stay on the pad.</p>` }] }
});

/* ---- Explore: the helicopter pad with every control ---- */
const HE_EXPLORE_TRY = [
  ['Take off and climb above 50 m.', () => !!S.flags.heliClimb50],
  ['Make the helicopter hover for 3 seconds.', () => !!S.flags.heliHover],
  ['Find a lift that makes it climb at a steady 3 m/s. Check the Velocity readout stays at 3.0 m/s.', () => !!S.flags.heliSteady3]
];
function openExploreHeli() {
  show('vExplore'); placeLab($('#exploreHost')); exploreHead('Explore · Helicopter pad', 'Helicopter pad sandbox');
  heliSetup(); S.flags = newFlags(); resetSim();
  LAB.mode = 'explore'; LAB.show = new Set(['lift', 'dfbd', 'readH', 'readV']); LAB.sides = []; LAB.pullers = []; LAB.floors = null; LAB.idle = null; LAB.showVert = true; LAB.showRes = true;
  applyPanels(); $('#qCard').hidden = true; hideCards(); closeDesk();
  const done = new Set(dbGet('tryDoneHe', []));
  const draw = () => { $('#rail').innerHTML = `${exploreSwitch('heli')}<span class="lbl">Explore · Helicopter pad</span><h2>Test your own ideas</h2><p class="gl">Change the lift and watch the helicopter, the readouts and the free-body diagram. The helicopter's mass is 1,180 kg. Its weight is shown on the diagram.</p><div class="lbl">Try this</div><ul class="tasks gl">${HE_EXPLORE_TRY.map((t, i) => `<li class="${done.has(i) ? 'ok' : ''}"><span class="box">✓</span><span>${t[0]}</span></li>`).join('')}</ul><p class="scaleNote">Change the lift a little at a time. A small change makes a big difference near the weight.</p><button type="button" class="jbtn" data-journal><span>📓 My Journal</span></button><button type="button" class="ghost" data-act="home">← Home</button>`; };
  draw();
  LAB.onChange = null; LAB.tick = () => { HE_EXPLORE_TRY.forEach((t, i) => { if (!done.has(i) && t[1]()) { done.add(i); dbSet('tryDoneHe', [...done]); addEvidence('challenge', 'Explore: ' + t[0]); toast('Nice experiment! That one is ticked off.', 'good'); draw(); } }); };
}
