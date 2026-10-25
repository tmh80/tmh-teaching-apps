/* ===== The arena "lab": scene, drag-and-drop pullers, readouts, live free-body diagram =====
   LAB.show is the set of panels on screen. Guided steps reveal them one at a time; Explore shows all. */
const PANELS = ['pal', 'meter', 'readL', 'readR', 'readF', 'readW', 'readN', 'readM', 'readRes', 'readA', 'readV', 'readD', 'fbd', 'vt', 'floor', 'mass', 'brake', 'shove', 'launch', 'toggles', 'run'];
/* Explore keeps to the tug-of-war set-up: the launcher, brake and braking distance belong to Chapter 2 */
const EXPLORE_HIDE = ['launch', 'brake', 'readD'];
const LAB = { show: new Set(PANELS), sides: ['left', 'right'], pullers: ['kid', 'dog', 'adult', 'strong', 'pony', 'horse'], showVert: true, showRes: true, mode: 'explore', onChange: null };
const TEAMCOL = () => ({ left: C.left, right: C.right });

/* ---- scene ---- */
let DRAG = null, PSEL = null, PTOAST = null, ADDLOG = [];
function palToast(t) { PTOAST = { t, at: performance.now() }; }
function drawScene(f, cvo) {
  const cv = cvo || $('#cvScene'); if (!cv || !cv.offsetParent) return;
  const c = fit(cv, 900, 380); HITS = [];
  arenaShell(c, 'MAIN ARENA');
  c.fillStyle = C.ink; c.fillRect(450 - 160, 92, 320, 30); txt(c, 'MAIN ARENA · TUG-OF-WAR', 450, 107.5, C.panel, `800 20px ${C.fd}`);
  drawFloor(c);
  const tt = performance.now() / 1000, pulling = S.running && (f.L > 0 || f.R > 0), stuck = pulling && S.v === 0 && f.app !== 0;
  const cx = CX + S.x * PXM + (stuck && !RMOTION ? Math.sin(tt * 42) * 1.3 : 0), ph = S.running && !RMOTION ? tt * 7 : S.x * PXM / 9;
  if (S.floor === 'air') { c.save(); c.strokeStyle = C.muted; c.lineWidth = 1.5; c.globalAlpha = .6; for (let i = 0; i < 5; i++) { const x = cx - CW / 2 + 12 + i * (CW - 24) / 4, k = RMOTION ? .5 : (tt * 2 + i * .3) % 1; c.beginPath(); c.moveTo(x, GROUND - 1 - k * 6); c.quadraticCurveTo(x + 3, GROUND - 4 - k * 6, x, GROUND - 7 - k * 6); c.stroke(); } c.restore(); }
  const meter = LAB.show.has('meter');
  drawTeam(c, 'left', -1, C.left, cx - CW / 2, pulling, tt, ph, meter);
  drawTeam(c, 'right', 1, C.right, cx + CW / 2, pulling, tt, ph, meter);
  if (S.brakeX != null) {   // Chapter 2: start mark and brake line on the floor
    const bx = CX + S.brakeX * PXM; c.save(); c.setLineDash([7, 5]); c.strokeStyle = C.bad; c.lineWidth = 3; c.beginPath(); c.moveTo(bx, GROUND - 92); c.lineTo(bx, GROUND + 8); c.stroke(); c.restore();
    pill(c, 'BRAKE LINE', bx, GROUND - 100, C.bad, 12);
    if (S.target != null) { const tx = CX + (S.brakeX + S.target) * PXM, z = 0.15 * PXM; c.save(); c.globalAlpha = .28; c.fillStyle = C.good; c.fillRect(tx - z, GROUND - 4, 2 * z, 12); c.restore(); c.fillStyle = C.good; c.fillRect(tx - 1.5, GROUND - 60, 3, 68); c.beginPath(); c.moveTo(tx + 1.5, GROUND - 60); c.lineTo(tx + 26, GROUND - 52); c.lineTo(tx + 1.5, GROUND - 44); c.fill(); pill(c, `TARGET ${fmt(S.target, 1)} m`, tx, GROUND + 22, C.good, 11); }
    const sx = CX + S.x0 * PXM; c.fillStyle = C.muted; c.fillRect(sx - 1.5, GROUND - 6, 3, 14); txt(c, 'START', sx, GROUND + 20, C.muted, `700 11px ${C.fn}`);
  }
  drawCrate(c, cx, GROUND, S.mass);
  if (Math.abs(f.brk || 0) > 0.5) {   // the brake pushes back against the motion
    const ex = cx + Math.sign(f.brk) * -(CW / 2), L = 26 + Math.abs(f.brk) / 4;
    arrow(c, ex + Math.sign(-f.brk) * (L + 6), GROUND - 18, ex + Math.sign(-f.brk) * 6, GROUND - 18, C.bad, 5);
    if (!RMOTION) { c.save(); c.strokeStyle = C.hazard; c.lineWidth = 2; for (let k = 0; k < 4; k++) { const sx2 = cx - Math.sign(S.v) * (CW / 2 + 4 + k * 7), jy = (performance.now() / 40 + k * 3) % 6; c.beginPath(); c.moveTo(sx2, GROUND - 1); c.lineTo(sx2 - Math.sign(S.v) * 8, GROUND - 5 - jy); c.stroke(); } c.restore(); }
    pill(c, `brake ${fmt(Math.abs(f.brk), 0)} N`, cx, GROUND - CRH - 16, C.bad);
  }
  // shove arrow lingers for 3 s
  const since = S.lastShoveT == null ? 9 : S.t - S.lastShoveT;
  if (f.shove > 0.5 || since < 3) { c.save(); if (f.shove <= 0.5) c.globalAlpha = Math.max(.35, 1 - since / 3); const hx = cx - CW / 2, F = f.shove > 0.5 ? f.shove : SHOVE_F;
    arrow(c, hx - 26 - F / 4, GROUND - 30, hx - 4, GROUND - 30, C.ink, 5); pill(c, f.shove > 0.5 ? `push ${Math.round(f.shove)} N` : `push (peak ${SHOVE_F} N)`, cx, GROUND - CRH - 16, C.ink); c.restore(); }
  hudBox(c, `Time ${S.t.toFixed(1)} s`, 14, 22, C.line, 'left');
  hudBox(c, `Floor: ${FLOORS[S.floor].name}`, 886, 22, C.line, 'right');
  if (!cvo) { banners(c, f); drawDropZone(c); }
}
function banners(c, f) {
  const y = 50; let m = '', col = C.hazard, fg = '#1b1404', bg = C.hazard;
  if (S.msg) m = S.msg;
  else if (S.running && S.v === 0 && f.app !== 0 && Math.abs(f.app) <= f.fmax + 1e-9 && S.pullT > PULL_RAMP && LAB.show.has('readF')) { m = `Friction (${Math.round(Math.abs(f.fr))} N) is holding the crate still`; bg = C.panel; fg = C.ink; col = C.fric; }
  else if (!S.running && S.t === 0) { txt(c, LAB.idle || 'Drag pullers onto the arena, then press Pull!', 450, y + 16, C.muted, `700 15px ${C.fb}`); return; }
  if (!m) return; c.font = `700 15px ${C.fb}`; const w = Math.min(880, c.measureText(m).width + 28);
  c.fillStyle = bg; c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); c.roundRect(450 - w / 2, y, w, 32, 8); c.fill(); c.stroke(); txt(c, m, 450, y + 16.5, fg, `700 15px ${C.fb}`);
}
function drawDropZone(c) {
  const ox = CX + S.x * PXM;
  if (DRAG && DRAG.side) {
    const left = DRAG.side === 'left', col = left ? C.left : C.right, x0 = left ? 0 : ox, x1 = left ? ox : 900;
    c.save(); c.globalAlpha = .13; c.fillStyle = col; c.fillRect(x0, 0, x1 - x0, 380); c.globalAlpha = 1;
    c.setLineDash([10, 6]); c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(x0 + 3, 3, x1 - x0 - 6, 374); c.restore();
    const open = LAB.sides.includes(DRAG.side);
    const lab = DRAG.from ? (DRAG.side === DRAG.from ? 'Drag off the arena to send them back' : open ? `Drop to swap to the ${DRAG.side} team` : `The ${DRAG.side} team is closed in this step`) : open ? `Drop to join the ${DRAG.side} team` : `The ${DRAG.side} team is closed in this step`;
    hudBox(c, lab, (x0 + x1) / 2, GROUND + 52, col, 'center');
  } else if (PSEL && LAB.sides.length === 2) { c.save(); c.globalAlpha = .08; c.fillStyle = C.left; c.fillRect(0, 0, ox, 380); c.fillStyle = C.right; c.fillRect(ox, 0, 900 - ox, 380); c.restore(); }
  if (PTOAST) { const age = performance.now() - PTOAST.at; if (age > 2800) PTOAST = null; else { c.save(); c.globalAlpha = Math.min(1, (2800 - age) / 400); hudBox(c, PTOAST.t, 450, GROUND - 170, C.ink, 'center'); c.restore(); } }
}

/* ---- drag-and-drop pullers ---- */
const ICONS = {};
function pullerIcon(p, col) {
  const k = p + '|' + col; if (ICONS[k]) return ICONS[k];
  const W = 240, H = 190, o = document.createElement('canvas'); o.width = W; o.height = H; const c = o.getContext('2d');
  puller(c, W / 2, 1, p, col, 0.6, false, 170, 132);
  let d; try { d = c.getImageData(0, 0, W, H).data; } catch (e) { return ICONS[k] = o; }
  let x0 = W, y0 = H, x1 = 0, y1 = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (d[(y * W + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  if (x1 <= x0) return ICONS[k] = o;
  const t = document.createElement('canvas'), tw = x1 - x0 + 8, th = y1 - y0 + 8; t.width = tw; t.height = th; t.getContext('2d').drawImage(o, x0 - 4, y0 - 4, tw, th, 0, 0, tw, th);
  return ICONS[k] = t;
}
function paintIcon(cv, p, col) {
  const d = window.devicePixelRatio || 1, r = cv.getBoundingClientRect(), w = Math.max(10, Math.round((r.width || 52) * d)), hh = Math.max(10, Math.round((r.height || 40) * d)); cv.width = w; cv.height = hh;
  const ic = pullerIcon(p, col), sc = Math.min(w / ic.width, hh / ic.height), c = cv.getContext('2d'); c.clearRect(0, 0, w, hh); c.drawImage(ic, (w - ic.width * sc) / 2, hh - ic.height * sc, ic.width * sc, ic.height * sc);
}
function addPuller(side, p) {
  const sides = LAB.sides;
  if (!sides.includes(side)) { palToast(sides.length === 1 ? `In this step, only the ${sides[0]} team is open.` : 'You can\'t add pullers right now.'); return false; }
  if (S[side].length >= MAXT) { palToast(`That team is full. The most it can have is ${MAXT}.`); return false; }
  S[side].push(p); ADDLOG.push(side); renderPal(); labChanged(); return true;
}
function renderPal() {
  const el = $('#ptiles'); if (!el) return;
  const pl = LAB.pullers, sides = LAB.sides, full = sides.length && sides.every(x => S[x].length >= MAXT), sig = pl.join() + full + (PSEL || '') + (C.ink || '');
  if (el.dataset.sig !== sig) {
    el.dataset.sig = sig;
    el.innerHTML = pl.map(p => `<button type="button" class="ptile" data-p="${p}" aria-pressed="${PSEL === p}" ${full ? 'disabled' : ''} aria-label="${PUL[p].label}, ${PUL[p].n} newtons. Drag onto the arena, or press to choose a team."><canvas aria-hidden="true"></canvas><span>${PUL[p].label}</span><small>${PUL[p].n} N</small></button>`).join('');
    requestAnimationFrame(() => $$('#ptiles .ptile').forEach(b => paintIcon(b.querySelector('canvas'), b.dataset.p, C.ink || '#333')));
  }
  const two = sides.length === 2;
  $('#palHint').innerHTML = sides.length ? `Drop on the <b style="color:var(--left)">left</b> of the crate for the left team, or on the <b style="color:var(--right)">right</b> for the right team. Drag someone off the arena, or tap them, to send them back.${two ? '' : ` In this step, only the ${sides[0]} team is open.`}` : '';
  $('#palSel').hidden = !(PSEL && two); $$('#palSel [data-side]').forEach(b => b.hidden = !sides.includes(b.dataset.side));
  $('#palUndo').disabled = !(S.left.length || S.right.length); $('#palClear').disabled = !(S.left.length || S.right.length);
}
function sceneXY(e) { const r = $('#cvScene').getBoundingClientRect(); return { x: (e.clientX - r.left) * 900 / r.width, y: (e.clientY - r.top) * 380 / r.height, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom }; }
const dropSide = x => x < CX + S.x * PXM ? 'left' : 'right';
const hitAt = q => HITS.find(hh => Math.abs(q.x - hh.x) <= hh.hw && q.y >= hh.y0 && q.y <= hh.y1 && LAB.sides.includes(hh.side));
let pd = null, dragJust = false;
function initPal() {
  document.addEventListener('pointerdown', e => {
    if (e.button > 0 || !LAB.show.has('pal')) return;
    if (e.target.id === 'cvScene' && !PSEL) { const hit = hitAt(sceneXY(e)); if (!hit) return; pd = { b: e.target, p: hit.p, from: hit.side, i: hit.i, x: e.clientX, y: e.clientY, id: e.pointerId, on: false }; try { e.target.setPointerCapture(e.pointerId); } catch (_) { } return; }
    const b = e.target.closest('#ptiles .ptile'); if (!b || b.disabled) return; pd = { b, p: b.dataset.p, x: e.clientX, y: e.clientY, id: e.pointerId, on: false }; try { b.setPointerCapture(e.pointerId); } catch (_) { }
  });
  document.addEventListener('pointermove', e => {
    if (!pd || e.pointerId !== pd.id) return;
    if (!pd.on && Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 6) { pd.on = true; const g = h('div', { class: 'pghost' }, '<canvas></canvas>'); document.body.appendChild(g); pd.g = g; paintIcon(g.querySelector('canvas'), pd.p, C.ink); }
    if (!pd.on) return; e.preventDefault(); pd.g.style.left = e.clientX + 'px'; pd.g.style.top = e.clientY + 'px';
    const q = sceneXY(e), side = q.inside ? dropSide(q.x) : null; DRAG = { p: pd.p, side, from: pd.from || null };
    const kit = $('#lab .kit'); if (kit) kit.classList.toggle('benchon', !!pd.from && !q.inside);
    const col = side ? (side === 'left' ? C.left : C.right) : C.ink; if (pd.col !== col) { pd.col = col; paintIcon(pd.g.querySelector('canvas'), pd.p, col); }
  }, { passive: false });
  const end = (e, cancel) => {
    if (!pd || (e && e.pointerId !== pd.id)) return; const was = pd; pd = null; DRAG = null; if (was.g) was.g.remove(); const kit = $('#lab .kit'); if (kit) kit.classList.remove('benchon');
    if (!was.on) return; dragJust = true; setTimeout(() => dragJust = false, 0); if (cancel) return;
    const q = sceneXY(e);
    if (was.from) {
      const arr = S[was.from]; if (arr[was.i] !== was.p) return;
      if (!q.inside) { arr.splice(was.i, 1); renderPal(); labChanged(); palToast(`The ${PUL[was.p].label.toLowerCase()} has gone back to the bench.`); return; }
      const to = dropSide(q.x); if (to === was.from) return;
      if (!LAB.sides.includes(to)) { palToast(`In this step, only the ${was.from} team is open.`); return; }
      if (S[to].length >= MAXT) { palToast(`That team is full. The most it can have is ${MAXT}.`); return; }
      arr.splice(was.i, 1); S[to].push(was.p); ADDLOG.push(to); renderPal(); labChanged(); palToast(`The ${PUL[was.p].label.toLowerCase()} has swapped to the ${to} team.`); return;
    }
    if (q.inside) addPuller(dropSide(q.x), was.p);
  };
  document.addEventListener('pointerup', e => end(e, false)); document.addEventListener('pointercancel', e => end(e, true));
  document.addEventListener('click', e => {
    const b = e.target.closest('#ptiles .ptile'); if (b) { if (dragJust || b.disabled) return; const p = b.dataset.p; if (LAB.sides.length === 1) { addPuller(LAB.sides[0], p); return; } PSEL = PSEL === p ? null : p; renderPal(); return; }
    const sb = e.target.closest('#palSel [data-side]'); if (sb && PSEL) { addPuller(sb.dataset.side, PSEL); return; }
    if (e.target.id === 'palUndo') { while (ADDLOG.length && !S[ADDLOG[ADDLOG.length - 1]].length) ADDLOG.pop(); const sd = ADDLOG.pop() || (S.right.length ? 'right' : 'left'); S[sd].pop(); renderPal(); labChanged(); return; }
    if (e.target.id === 'palClear') { S.left = []; S.right = []; ADDLOG = []; renderPal(); labChanged(); return; }
    if (e.target.id === 'cvScene') { if (dragJust) return; const q = sceneXY(e);
      if (PSEL && LAB.show.has('pal')) { addPuller(dropSide(q.x), PSEL); return; }
      const hit = hitAt(q); if (hit && LAB.show.has('pal')) { S[hit.side].splice(hit.i, 1); renderPal(); labChanged(); palToast(`The ${PUL[hit.p].label.toLowerCase()} has gone back to the bench.`); } }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && PSEL) { PSEL = null; renderPal(); } });
}

/* ---- controls ---- */
function syncRun() { const b = $('#runBtn'); if (!b) return; b.textContent = S.running ? 'Pause' : 'Pull!'; b.classList.toggle('pause', S.running); }
function renderControls() {
  $('#floors').innerHTML = Object.entries(FLOORS).filter(([k]) => !LAB.floors || LAB.floors.includes(k)).map(([k, F]) => `<button type="button" data-floor="${k}" aria-pressed="${S.floor === k}">${F.name}<small>${F.note}</small></button>`).join('');
  const m = $('#mass'); m.value = S.mass; const mn = $('#massNum'); if (document.activeElement !== mn) mn.value = S.mass;
  $('#tgVert').checked = LAB.showVert; $('#tgRes').checked = LAB.showRes;
  const bk = $('#brakeF'); if (bk) { bk.value = S.brakeF; const bn = $('#brakeNum'); if (document.activeElement !== bn) bn.value = S.brakeF; }
  /* trial-and-error markers: red = a brake force that was too strong (stopped short), yellow = too weak (slid past) */
  const B = LAB.bmarks, mk = $('#bMarks'), note = $('#bmNote');
  if (mk) { const pos = v => `${(v - 5) / 195 * 100}%`; mk.innerHTML = B ? (B.hi != null ? `<i class="hi" style="left:${pos(B.hi)}" title="Too high"></i>` : '') + (B.lo != null ? `<i class="lo" style="left:${pos(B.lo)}" title="Too low"></i>` : '') : '';
    note.hidden = !B || (B.hi == null && B.lo == null); if (B) note.innerHTML = `${B.lo != null ? `<span class="lo">●</span> too low: ${B.lo} N` : ''}${B.lo != null && B.hi != null ? ' · ' : ''}${B.hi != null ? `<span class="hi">●</span> too high: ${B.hi} N` : ''}${B.lo != null && B.hi != null ? `<br>The right brake force is between them.` : ''}`; }
}
function labChanged() { renderControls(); if (LAB.onChange) LAB.onChange(); }
function initControls() {
  $('#runBtn').addEventListener('click', () => { if (S.msg) resetSim(); S.running = !S.running; syncRun(); if (S.running) runMark('pull'); else runEnd('paused'); });
  $('#resetBtn').addEventListener('click', () => { resetSim(); labChanged(); });
  $('#shoveBtn').addEventListener('click', () => { shove(); runMark('push'); labChanged(); });
  $('#launchBtn').addEventListener('click', () => { launch(); runMark('launch'); labChanged(); });
  const setBrake = v => { S.brakeF = clamp(Math.round(v), 5, 200); if (!S.running) resetSim(); labChanged(); };
  $('#brakeF').addEventListener('input', e => setBrake(+e.target.value));
  $$('[data-bk]').forEach(b => b.addEventListener('click', () => setBrake(S.brakeF + +b.dataset.bk)));
  $('#floors').addEventListener('click', e => { const b = e.target.closest('[data-floor]'); if (!b) return; S.floor = b.dataset.floor; resetSim(); labChanged(); });
  $('#mass').addEventListener('input', e => { S.mass = +e.target.value; $('#massNum').value = S.mass; if (!S.running) resetSim(); if (LAB.onChange) LAB.onChange(); });
  /* typed number boxes: any value the slider allows can be typed in (applied on Enter or when the box loses focus) */
  const typed = (inp, lo, hi, set) => { const go = () => { const v = parseNum(inp.value); if (isNaN(v)) { renderControls(); return; } set(clamp(Math.round(v), lo, hi)); }; inp.addEventListener('change', go); inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); inp.blur(); } }); };
  typed($('#massNum'), 10, 150, v => { S.mass = v; if (!S.running) resetSim(); labChanged(); });
  typed($('#brakeNum'), 5, 200, v => setBrake(v));
  $('#tgVert').addEventListener('change', e => { LAB.showVert = e.target.checked; });
  $('#tgRes').addEventListener('change', e => { LAB.showRes = e.target.checked; });
}
/* show / hide panels according to LAB.show */
function applyPanels() {
  $$('#lab [data-panel]').forEach(el => { const ks = el.dataset.panel.split(' '); el.hidden = !ks.some(k => LAB.show.has(k)); });
  const kit = $('#lab .kit'); $('#lab .stagerow').classList.toggle('nokit', ![...kit.querySelectorAll('[data-panel]')].some(e => !e.hidden));
  const anyRead = [...$$('#reads .rd')].some(e => !e.hidden);
  $('#lab .underrow').hidden = !anyRead && !LAB.show.has('fbd');
  $('#lab .fbdcol').hidden = !LAB.show.has('fbd');
  renderPal(); renderControls();
}

/* ---- readouts ---- */
const RD = [
  ['readL', 'Left pull', 'leftpull', 'l', f => fmt(f.L, 0) + ' N'],
  ['readR', 'Right pull', 'rightpull', 'r', f => fmt(f.R, 0) + ' N'],
  ['readF', 'Friction', 'friction', 'f', f => Math.abs(f.fr) < .5 ? '0 N' : fmt(Math.abs(f.fr), 1) + ' N ' + (f.fr > 0 ? '→' : '←')],
  ['readW', 'Weight', 'weight', 'v', f => fmt(f.W, 1) + ' N'],
  ['readN', 'Normal force', 'normal', 'v', f => fmt(f.N, 1) + ' N'],
  ['readM', 'Mass', 'mass', '', f => fmt(f.m, 0) + ' kg'],
  ['readRes', 'Resultant force', 'resultant', 'res', f => Math.abs(f.net) < .5 ? '0 N (balanced)' : fmt(Math.abs(f.net), 1) + ' N ' + (f.net > 0 ? '→' : '←')],
  ['readA', 'Acceleration', 'acceleration', '', f => fmt(f.a, 2) + ' m/s²'],
  ['readV', 'Velocity', 'velocity', '', () => fmt(S.v, 2) + ' m/s'],
  ['readD', 'Braking distance', 'brakingdist', '', () => S.brakeFrom == null ? '0.00 m' : fmt(S.x - S.brakeFrom, 2) + ' m']
];
function buildReads() {
  $('#reads').innerHTML = RD.map(([k, l, t, cl]) => `<div class="rd ${cl}" data-panel="${k}"><div class="lbl"><button type="button" class="term tl" data-t="${t}">${l}</button><button type="button" class="info" data-info="${k}" aria-label="How do I read the ${l} readout?">ⓘ</button></div><div class="v" id="v-${k}"></div></div>`).join('');
}
function readouts(f) { RD.forEach(([k, , , , fn]) => { const el = document.getElementById('v-' + k); if (el && !el.parentElement.hidden) el.textContent = fn(f); }); }

/* ---- live free-body diagram (shows the actual object; arrows start at its centre) ---- */
function niceStep(mx) { const raw = mx / 3; const p = Math.pow(10, Math.floor(Math.log10(raw))); for (const m of [1, 2, 2.5, 5, 10]) if (raw <= m * p) return m * p; return 10 * p; }
function drawLiveFBD(f) {
  const cv = $('#cvFBD'); if (!cv || !cv.offsetParent) return;
  const c = fit(cv, 340, 300), cx = 170, cy = 128, VMAX = 92;
  c.fillStyle = C.panel; c.fillRect(0, 0, 340, 300);
  const hv = [f.L, f.R, Math.abs(f.fr), Math.abs(f.brk || 0), f.shove, LAB.showRes ? Math.abs(f.net) : 0];
  const hmax = Math.max(...hv), step = niceStep(Math.max(1, hmax > 0.5 ? hmax : (LAB.showVert ? f.W * 4 / 3 : 10))), k = 30 / step;
  c.strokeStyle = C.grid; c.lineWidth = 1;
  for (let x = cx % 30; x <= 340; x += 30) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 262); c.stroke(); }
  for (let y = cy % 30; y <= 262; y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(340, y); c.stroke(); }
  drawCrate(c, cx, cy + 20, null, 40, 40);
  const lab = (s, x, y, col) => { c.font = `700 12px ${C.fn}`; const w = c.measureText(s).width + 8; x = Math.max(w / 2 + 2, Math.min(338 - w / 2, x)); c.fillStyle = C.panel; c.fillRect(x - w / 2, y - 8, w, 16); txt(c, s, x, y, col, `700 12px ${C.fn}`); };
  const brk = (x, y) => { c.save(); c.fillStyle = C.panel; c.fillRect(x - 9, y - 5, 18, 10); c.strokeStyle = C.vert; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 8, y - 1); c.lineTo(x + 8, y - 6); c.moveTo(x - 8, y + 6); c.lineTo(x + 8, y + 1); c.stroke(); c.restore(); };
  let cut = false;
  if (LAB.showVert && (LAB.show.has('readW') || LAB.mode === 'explore')) {
    const wl = f.W * k, nl = f.N * k, sw = Math.min(wl, VMAX), sn = Math.min(nl, VMAX); cut = wl > VMAX || nl > VMAX;
    arrow(c, cx - 8, cy, cx - 8, cy + sw, C.vert, 4);
    if (LAB.show.has('readN') || LAB.mode === 'explore') { arrow(c, cx + 8, cy, cx + 8, cy - sn, C.vert, 4); if (nl > VMAX) brk(cx + 8, cy - 22 - (sn - 22) / 2); lab('normal ' + fmt(f.N, 1) + ' N', cx + 8, cy - sn - 13, C.vert); }
    if (wl > VMAX) brk(cx - 8, cy + 22 + (sw - 22) / 2);
    lab('weight ' + fmt(f.W, 1) + ' N', cx - 8, cy + sw + 13, C.vert);
  }
  if (f.L > 0.5) { arrow(c, cx, cy - 7, cx - f.L * k, cy - 7, C.left, 4); lab(Math.round(f.L) + ' N', cx - Math.max(f.L * k, 40) / 2 - 14, cy - 21, C.left); }
  if (f.R > 0.5) { arrow(c, cx, cy - 7, cx + f.R * k, cy - 7, C.right, 4); lab(Math.round(f.R) + ' N', cx + Math.max(f.R * k, 40) / 2 + 14, cy - 21, C.right); }
  if (Math.abs(f.fr) > 0.5 && (LAB.show.has('readF') || LAB.mode === 'explore')) { arrow(c, cx, cy + 7, cx + f.fr * k, cy + 7, C.fric, 4); lab(fmt(Math.abs(f.fr), 1) + ' N', cx + Math.sign(f.fr) * (Math.max(Math.abs(f.fr) * k, 40) / 2 + 14), cy + 21, C.fric); }
  if (Math.abs(f.brk || 0) > 0.5) { arrow(c, cx, cy + 22, cx + f.brk * k, cy + 22, C.bad, 4); lab('brake ' + fmt(Math.abs(f.brk), 0) + ' N', cx + Math.sign(f.brk) * (Math.max(Math.abs(f.brk) * k, 40) / 2 + 22), cy + 36, C.bad); }
  if (f.shove > 0.5) { arrow(c, cx, cy - 36, cx + f.shove * k, cy - 36, C.ink, 4); lab('push ' + Math.round(f.shove) + ' N', cx + Math.max(f.shove * k, 60) / 2 + 30, cy - 50, C.ink); }
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 262.5); c.lineTo(340, 262.5); c.stroke();
  if (LAB.showRes && (LAB.show.has('readRes') || LAB.mode === 'explore')) {
    const n = Math.round(f.net);
    if (n !== 0) { const L = Math.max(Math.abs(f.net * k), 24) * Math.sign(f.net); arrow(c, cx, 282, cx + L, 282, C.res, 4, true); const s2 = 'Resultant ' + Math.abs(n) + ' N ' + (n > 0 ? '→' : '←'); c.font = `700 12px ${C.fn}`; const w = c.measureText(s2).width + 8; lab(s2, n > 0 ? cx - 8 - w / 2 : cx + 8 + w / 2, 282, C.res); }
    else lab('Resultant = 0 N (balanced)', cx, 282, C.res);
  }
  $('#scaleNote').textContent = `Scale: 1 grid square = ${step} N` + (cut ? '. The weight and normal arrows are too long to fit, so they are shortened (see the break marks).' : '');
  const lg = [['left', 'Left pull'], ['right', 'Right pull'], ['fric', 'Friction', 'readF'], ['ink', 'Push'], ['bad', 'Brake', 'brake'], ['vert', 'Weight / normal', 'readW'], ['res', 'Resultant', 'readRes']].filter(x => !x[2] || LAB.show.has(x[2]) || LAB.mode === 'explore');
  const lh = lg.map(([k2, n]) => `<span><i style="background:var(--${k2})"></i>${n}</span>`).join(''); const le = $('#legend'); if (le.dataset.h !== lh) { le.innerHTML = lh; le.dataset.h = lh; }
}

/* ---- velocity–time graph (Chapter 2 on): flat = steady speed, sloping down = slowing down ---- */
function niceUp(v) { const steps = [0.5, 1, 2, 2.5, 4, 5, 8, 10, 15, 20, 25, 40, 50]; return steps.find(x => x >= v) || Math.ceil(v / 10) * 10; }
function drawVT() {
  const cv = $('#cvVT'); if (!cv || !cv.offsetParent) return;
  const W = 900, H = 240, c = fit(cv, W, H), x0 = 64, x1 = W - 18, y0 = 14, y1 = H - 40;
  c.fillStyle = C.panel; c.fillRect(0, 0, W, H);
  const hs = S.hist, tEnd = hs.length ? hs[hs.length - 1][0] : 0;
  let vmax = 0, vmin = 0; hs.forEach(([, v]) => { if (v > vmax) vmax = v; if (v < vmin) vmin = v; });
  if (S.v0 > vmax && S.brakeX != null) vmax = S.v0;
  const top = niceUp(Math.max(1, vmax * 1.1)), bot = vmin < -0.01 ? -niceUp(-vmin * 1.1) : 0, tMax = Math.max(6, Math.ceil(tEnd + 0.5));
  const vs = top - bot <= 2 ? 0.25 : top - bot <= 5 ? 0.5 : top - bot <= 10 ? 1 : top - bot <= 25 ? 2.5 : 5, ts = tMax <= 10 ? 1 : tMax <= 24 ? 2 : 5;
  const X = t => x0 + (t / tMax) * (x1 - x0), Y = v => y1 - ((v - bot) / (top - bot)) * (y1 - y0);
  c.lineWidth = 1; c.strokeStyle = C.grid;
  for (let v = bot; v <= top + 1e-9; v += vs) { c.beginPath(); c.moveTo(x0, Y(v)); c.lineTo(x1, Y(v)); c.stroke(); txt(c, String(+v.toFixed(2)), x0 - 8, Y(v), C.muted, `600 12px ${C.fn}`, 'right'); }
  for (let t = 0; t <= tMax + 1e-9; t += ts) { c.beginPath(); c.moveTo(X(t), y0); c.lineTo(X(t), y1); c.stroke(); txt(c, String(t), X(t), y1 + 13, C.muted, `600 12px ${C.fn}`); }
  c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y1); c.lineTo(x1, y1); c.stroke();
  if (bot < 0) { c.beginPath(); c.moveTo(x0, Y(0)); c.lineTo(x1, Y(0)); c.stroke(); }
  txt(c, 'Time (s)', (x0 + x1) / 2, H - 9, C.ink, `700 13px ${C.fb}`);
  c.save(); c.translate(16, (y0 + y1) / 2); c.rotate(-Math.PI / 2); txt(c, 'Velocity (m/s)', 0, 0, C.ink, `700 13px ${C.fb}`); c.restore();
  if (S.brakeT != null) { const bx = X(S.brakeT); c.save(); c.setLineDash([6, 4]); c.strokeStyle = C.bad; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, y0); c.lineTo(bx, y1); c.stroke(); c.restore(); pill(c, 'brake on', bx, y0 + 12, C.bad, 12); }
  if (!hs.length) { txt(c, 'The graph draws itself when the crate starts moving.', (x0 + x1) / 2, (y0 + y1) / 2, C.muted, `600 15px ${C.fb}`); return; }
  c.strokeStyle = C.accent; c.lineWidth = 3.5; c.lineJoin = 'round'; c.beginPath(); c.moveTo(X(0), Y(hs[0][1]));
  const stride = Math.max(1, Math.floor(hs.length / 900)); for (let i = 0; i < hs.length; i += stride) c.lineTo(X(hs[i][0]), Y(hs[i][1])); c.lineTo(X(tEnd), Y(S.v)); c.stroke();
  c.fillStyle = C.accent; c.beginPath(); c.arc(X(tEnd), Y(S.v), 5, 0, 7); c.fill();
}

/* ---- main loop ---- */
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  if (S.running) updateSim(dt);
  const f = forces(); runTick(f, dt);
  if ($('#lab') && $('#lab').offsetParent) { drawScene(f); drawLiveFBD(f); drawVT(); readouts(f); if (LAB.tick) LAB.tick(f); }
  requestAnimationFrame(frame);
}
