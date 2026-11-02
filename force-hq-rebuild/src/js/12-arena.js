/* ===== The arena "lab": scene, drag-and-drop pullers, readouts, live free-body diagram =====
   LAB.show is the set of panels on screen. Guided steps reveal them one at a time; Explore shows all. */
const PANELS = ['pal', 'meter', 'readL', 'readR', 'readF', 'readW', 'readN', 'readM', 'readRes', 'readA', 'readV', 'readD', 'fbd', 'vt', 'floor', 'mass', 'brake', 'shove', 'launch', 'toggles', 'run', 'astro', 'pushf', 'thrust', 'warp', 'pairs', 'readAV', 'readAM', 'drop', 'dobj', 'dworld', 'dair', 'dheight', 'dcanopy', 'dopenh', 'dlanes', 'dpause', 'dvt', 'dft', 'dfbd', 'readH', 'readT', 'lift', 'wsmach', 'wsload', 'wsctl', 'wspull', 'readMA', 'readWork', 'rulers', 'builder', 'mfric', 'readEff', 'bTotMA', 'bCable', 'bTravel'];
/* Explore keeps to the tug-of-war set-up: the launcher, brake and braking distance belong to Chapter 2 */
const EXPLORE_HIDE = ['launch', 'brake', 'readD', 'astro', 'pushf', 'thrust', 'warp', 'pairs', 'readAV', 'readAM', 'drop', 'dobj', 'dworld', 'dair', 'dheight', 'dcanopy', 'dopenh', 'dlanes', 'dpause', 'dvt', 'dft', 'dfbd', 'readH', 'readT', 'lift', 'wsmach', 'wsload', 'wsctl', 'wspull', 'readMA', 'readWork', 'rulers'];
const LAB = { show: new Set(PANELS), sides: ['left', 'right'], pullers: ['kid', 'dog', 'adult', 'strong', 'pony', 'horse'], showVert: true, showRes: true, mode: 'explore', onChange: null };
const TEAMCOL = () => ({ left: C.left, right: C.right });

/* ---- scene ---- */
let DRAG = null, PSEL = null, PTOAST = null, ADDLOG = [];
function palToast(t) { PTOAST = { t, at: performance.now() }; }
function drawScene(f, cvo) {
  const cv = cvo || $('#cvScene'); if (!cv || !cv.offsetParent) return;
  const isDz = (S.scene === 'drop' || S.scene === 'heli') && !cvo, isSh = S.scene === 'shop' && !cvo; cv.classList.toggle('dzscene', isDz); cv.classList.toggle('shopscene', isSh); const c = fit(cv, 900, isSh ? WS_H : isDz ? DZ_H : 380); HITS = [];
  if (isSh) { drawShopScene(c); return; }
  if (S.scene === 'drop' && !cvo) { drawDropScene(c); return; }
  if (S.scene === 'heli' && !cvo) { drawHeliScene(c); return; }
  if (S.scene === 'sled' && !cvo) { drawSledScene(c, f); return; }
  if (S.scene === 'space' && !cvo) { drawSpaceScene(c, f); return; }
  arenaShell(c, 'MAIN ARENA');
  if (!(LAB.show.has('pairs') && LAB.showPairs !== false)) { c.fillStyle = C.ink; c.fillRect(450 - 160, 92, 320, 30); txt(c, 'MAIN ARENA · TUG-OF-WAR', 450, 107.5, C.panel, `800 20px ${C.fd}`); }
  drawFloor(c);
  const tt = performance.now() / 1000, pulling = S.running && (f.L > 0 || f.R > 0), stuck = pulling && S.v === 0 && f.app !== 0;
  const cx = CX + S.x * PXM + (stuck && !RMOTION ? Math.sin(tt * 42) * 1.3 : 0), ph = S.running && !RMOTION ? tt * 7 : S.x * PXM / 9;
  if (S.floor === 'air') { c.save(); c.strokeStyle = C.muted; c.lineWidth = 1.5; c.globalAlpha = .6; for (let i = 0; i < 5; i++) { const x = cx - CW / 2 + 12 + i * (CW - 24) / 4, k = RMOTION ? .5 : (tt * 2 + i * .3) % 1; c.beginPath(); c.moveTo(x, GROUND - 1 - k * 6); c.quadraticCurveTo(x + 3, GROUND - 4 - k * 6, x, GROUND - 7 - k * 6); c.stroke(); } c.restore(); }
  const meter = LAB.show.has('meter');
  drawTeam(c, 'left', -1, C.left, cx - CW / 2, pulling, tt, ph, meter);
  drawTeam(c, 'right', 1, C.right, cx + CW / 2, pulling, tt, ph, meter);
  if (LAB.show.has('pairs') && LAB.showPairs !== false) drawRopePairs(c, cx);
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


/* ---- Chapter 4: force pairs on the rope in the Main Arena. At each end of a rope, one pull on the rope and the matching pull back. ---- */
function drawRopePairs(c, cx) {
  /* Eight labelled arrows (four per team). Each label starts at its arrow's inner end and runs outwards, so the two teams' labels face away from each other.
     When the crate is near the edge of the arena there is no room on that side, so the squeezed team's labels move up a level and stay clear of the other team's. */
  c.font = `700 12px ${C.fn}`;
  [['left', -1, C.left], ['right', 1, C.right]].forEach(([side, s, col]) => {
    const N = tot(S[side]); if (N < 1) return;
    const edge = cx + s * CW / 2, L = clamp(18 + N / 6, 24, 78), kx = edge + s * 4, tx = edge + s * 118;
    const rows = [
      { x: kx, y: ROPEY - 48, dir: s, col: C.ink, lab: `rope pulls crate ${N} N`, ax: kx + s * 6 },
      { x: kx + s * L, y: ROPEY - 78, dir: -s, col, lab: `crate pulls rope ${N} N`, ax: kx + s * 6 },
      { x: tx, y: ROPEY - 112, dir: s, col, lab: `team pulls rope ${N} N`, ax: tx },
      { x: tx + s * L, y: ROPEY - 142, dir: -s, col: C.ink, lab: `rope pulls team ${N} N`, ax: tx }];
    rows.forEach(r => { r.w = c.measureText(r.lab).width + 12; r.mid = clamp(r.ax + s * r.w / 2, r.w / 2 + 4, 896 - r.w / 2); r.sq = Math.abs(r.mid - (r.ax + s * r.w / 2)) > 1; });
    const up = rows.some(r => r.sq) ? 52 : 0;
    rows.forEach(r => { const y = r.y - up; arrow(c, r.x, y, r.x + r.dir * L, y, r.col, 5); pill(c, r.lab, r.mid, y - 15, r.col, 12); });
  });
}

/* ---- Chapter 4: the Space Dome. The pod is the "crate"; the astronaut is the other half of every force pair. ---- */
const STARS = Array.from({ length: 48 }, (_, i) => [((i * 173) % 880) + 10, ((i * 89) % 215) + 14, 0.8 + ((i * 7) % 10) / 10 * 1.3, ((i * 37) % 100) / 100]);
const podSize = m => clamp(0.74 + m / 800, 0.8, 1.36);
function drawPod(c, x, gy, f) {
  const sz = podSize(S.mass), w = 80 * sz, hh = 52 * sz, top = gy - 12 - hh, my = top + hh / 2;
  c.save(); c.lineJoin = 'round'; c.fillStyle = C.muted; c.strokeStyle = C.ink; c.lineWidth = 2;
  c.beginPath(); c.roundRect(x - w / 2 + 6, gy - 12, w - 12, 8, 3); c.fill(); c.stroke();
  c.strokeStyle = '#7fd3ff'; c.globalAlpha = .7; c.beginPath(); c.moveTo(x - w / 2 + 8, gy - 3); c.lineTo(x + w / 2 - 8, gy - 3); c.stroke(); c.globalAlpha = 1; c.strokeStyle = C.ink;
  c.fillStyle = C.hull; c.beginPath(); c.roundRect(x - w / 2, top, w, hh, 12); c.fill(); c.stroke();
  c.fillStyle = C.hazard; c.fillRect(x - w / 2, my - 5, w, 10); c.strokeRect(x - w / 2, my - 5, w, 10);
  c.fillStyle = C.space; c.beginPath(); c.roundRect(x + w / 2 - 28, top + 8, 20, 14, 5); c.fill(); c.stroke();
  for (const sd of [-1, 1]) { c.fillStyle = C.muted; c.beginPath(); c.moveTo(x + sd * w / 2, my - 7); c.lineTo(x + sd * (w / 2 + 9), my - 11); c.lineTo(x + sd * (w / 2 + 9), my + 11); c.lineTo(x + sd * w / 2, my + 7); c.closePath(); c.fill(); c.stroke(); }
  if (f.thr !== 0) {   // the thruster flame points the opposite way to the push on the pod
    const sd = -Math.sign(f.thr), k = Math.abs(f.thr) / SP_THR_F, fl = 14 + k * 26 + (RMOTION ? 0 : Math.sin(performance.now() / 40) * 3), x0 = x + sd * (w / 2 + 9), gr = c.createLinearGradient(x0, 0, x0 + sd * fl, 0);
    gr.addColorStop(0, '#ffd27a'); gr.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(x0, my - 9); c.lineTo(x0 + sd * fl, my); c.lineTo(x0, my + 9); c.closePath(); c.fill();
    if (!RMOTION) { c.fillStyle = '#ffd9a0'; for (let q = 0; q < 5; q++) { const u = (performance.now() / 380 + q / 5) % 1; c.globalAlpha = 1 - u; c.beginPath(); c.arc(x0 + sd * (10 + u * 52), my + Math.sin(q * 2.4) * 8 * u, 2.6, 0, 7); c.fill(); } c.globalAlpha = 1; }
  }
  c.restore();
  pill(c, S.mass + ' kg', x, top - 14, C.ink);
}
function drawAstro(c, x, gy, push) {
  c.save(); c.fillStyle = C.muted; c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.ellipse(x + 2, gy - 5, 20, 5, 0, 0, 7); c.fill(); c.stroke();
  c.translate(x, gy - 50); c.lineCap = 'round'; c.lineJoin = 'round';
  const kit = Math.max(0, Math.round((S.astro - 60) / 20)); for (let i = 0; i < kit; i++) { c.fillStyle = [C.hazard, C.left, C.right, C.accent][i % 4]; c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.roundRect(-31, 8 - i * 9, 11, 8, 2); c.fill(); c.stroke(); }
  c.fillStyle = C.hull; c.strokeStyle = C.ink; c.lineWidth = 2;
  c.beginPath(); c.roundRect(-20, -24, 12, 36, 4); c.fill(); c.stroke();
  c.beginPath(); c.roundRect(-10, -22, 22, 34, 8); c.fill(); c.stroke();
  c.lineWidth = 7; c.strokeStyle = C.hull; c.beginPath(); c.moveTo(-2, 10); c.lineTo(-6, 40); c.moveTo(6, 10); c.lineTo(8, 40); c.stroke();
  c.lineWidth = 2; c.strokeStyle = C.ink; c.beginPath(); c.moveTo(-9, 40); c.lineTo(-2, 40); c.moveTo(5, 40); c.lineTo(12, 40); c.stroke();
  c.lineWidth = 6; c.strokeStyle = C.hull; c.beginPath(); c.moveTo(6, -14); c.lineTo(push ? 24 : 16, push ? -12 : 2); c.moveTo(6, -6); c.lineTo(push ? 24 : 14, push ? -2 : 10); c.stroke();
  c.fillStyle = C.hull; c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.arc(2, -34, 13, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#e0a23a'; c.beginPath(); c.ellipse(7, -34, 7, 8, 0, 0, 7); c.fill();
  c.restore();
  pill(c, S.astro + ' kg', x, gy - 108, C.ink);
}
function drawSpaceScene(c, f) {
  const tt = performance.now() / 1000, gy = GROUND;
  c.fillStyle = C.space; c.fillRect(0, 0, 900, gy - 14);
  for (const [x, y, r, k] of STARS) { c.globalAlpha = RMOTION ? 0.8 : 0.45 + 0.45 * Math.sin(tt * 1.5 + k * 20); c.fillStyle = C.star; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.globalAlpha = 1;
  const e = c.createRadialGradient(780, 330, 40, 780, 330, 150); e.addColorStop(0, '#2f6fae'); e.addColorStop(1, '#163a5e'); c.fillStyle = e; c.beginPath(); c.arc(780, 330, 150, 0, 7); c.fill();
  c.fillStyle = C.ink; c.fillRect(450 - 140, 92, 280, 30); txt(c, 'SPACE DOME · DOCK TRAINING', 450, 107.5, C.panel, `800 18px ${C.fd}`);
  c.fillStyle = '#1d2935'; c.fillRect(0, gy - 14, 900, 50); c.fillStyle = '#7fd3ff'; c.globalAlpha = 0.55;   // the air floor
  for (let x = 12; x < 900; x += 24) for (const y of [gy - 4, gy + 10, gy + 24]) { c.beginPath(); c.arc(x + (y > gy + 5 ? 12 : 0), y, 1.6, 0, 7); c.fill(); } c.globalAlpha = 1;
  c.fillStyle = C.panel; c.fillRect(0, gy + 36, 900, 44); c.strokeStyle = C.muted; c.lineWidth = 1.5;   // the ruler under the floor
  for (let m = -9; m <= 9; m++) { const x = CX + m * PXM; c.beginPath(); c.moveTo(x, gy + 36); c.lineTo(x, gy + (m % 3 === 0 ? 46 : 42)); c.stroke(); if (m % 3 === 0) txt(c, (m > 0 ? '+' : '') + m + ' m', x, gy + 58, C.muted, `500 12px ${C.fn}`); }
  /* the station and its docking port */
  const dockPx = CX + DOCK_X * PXM + 42 * podSize(S.mass) - 2;
  c.save(); c.fillStyle = C.hull; c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.roundRect(dockPx + 16, gy - 178, 120, 178, 10); c.fill(); c.stroke();
  c.fillRect(dockPx, gy - 66, 18, 48); c.strokeRect(dockPx, gy - 66, 18, 48); c.fillStyle = C.hazard; c.fillRect(dockPx - 2, gy - 70, 4, 56);
  c.fillStyle = C.solar; c.fillRect(dockPx + 34, gy - 160, 84, 50); c.strokeRect(dockPx + 34, gy - 160, 84, 50); c.restore();
  txt(c, 'DOCK', dockPx + 76, gy - 90, C.space, `800 16px ${C.fd}`);
  /* the tether post and the astronaut's rope */
  const anc = CX + (TETHER_X - 1.2) * PXM; c.fillStyle = C.hull; c.strokeStyle = C.ink; c.lineWidth = 2; c.fillRect(anc - 10, gy - 120, 10, 120); c.strokeRect(anc - 10, gy - 120, 10, 120);
  const px = CX + S.x * PXM, ax = CX + S.ax * PXM, pushing = f.shove > 0.5;
  c.save(); c.strokeStyle = C.star; c.globalAlpha = .6; c.lineWidth = 1.5; c.beginPath(); c.moveTo(anc, gy - 110); const sag = Math.max(4, 30 - (ax - anc) / 8); c.quadraticCurveTo((anc + ax) / 2, gy - 60 + sag, ax - 14, gy - 56); c.stroke(); c.restore();
  drawPod(c, px, gy, f);
  drawAstro(c, ax, gy, pushing);
  /* the force pair, drawn on the two objects while the push lasts and for a few seconds after */
  const since = S.pushEndT == null ? 0 : S.t - S.pushEndT, linger = !pushing && S.lastPush && S.pushEndT != null && since < 4;
  if ((pushing || linger) && LAB.show.has('pairs') && LAB.showPairs !== false) {
    const F = pushing ? Math.round(f.shove) : S.lastPush, L = Math.min(70, 14 + F / 5), sz = podSize(S.mass); c.save(); if (linger) c.globalAlpha = Math.max(0.35, 1 - since / 4);
    arrow(c, px - 40 * sz, gy - 112, px - 40 * sz + L, gy - 112, C.right, 5); arrow(c, ax + 12, gy - 150, ax + 12 - L, gy - 150, C.left, 5);
    pill(c, `astronaut pushes pod ${F} N`, clamp(px - 40 * sz + L / 2 + 30, 110, 790), gy - 134, C.right, 12); pill(c, `pod pushes astronaut ${F} N`, clamp(ax + 12 - L / 2 - 20, 110, 790), gy - 168, C.left, 12); c.restore();
  } else if (pushing || linger) {
    const F = pushing ? Math.round(f.shove) : S.lastPush; pill(c, `push ${F} N`, px, gy - 112 - 22 * podSize(S.mass), C.ink, 12);
  }
  if (f.thr !== 0 && LAB.show.has('pairs') && LAB.showPairs !== false) {   // the thruster pair
    const sd = Math.sign(f.thr), Fm = Math.round(Math.abs(f.thr)), w = 80 * podSize(S.mass);
    arrow(c, px, gy - 112, px + sd * 54, gy - 112, C.hazard, 5); pill(c, `gas pushes pod ${Fm} N`, px + sd * 28, gy - 134, C.hazard, 12);
    arrow(c, px - sd * (w / 2 + 10), gy - 28, px - sd * (w / 2 + 64), gy - 28, C.bad, 5); pill(c, `pod pushes gas ${Fm} N`, px - sd * (w / 2 + 40), gy - 8, C.bad, 12);
  }
  hudBox(c, `Time ${S.t.toFixed(1)} s${S.warp > 1 ? ' (fast-forward)' : ''}`, 14, 22, C.line, 'left');
  hudBox(c, `To the dock ${Math.max(0, DOCK_X - S.x).toFixed(1)} m`, 886, 22, C.line, 'right');
  banners(c, f); drawDropZone(c);
}
/* the Space Dome's free-body diagrams: one for the astronaut and one for the pod, side by side, so the pair is easy to see */
function drawSpaceFBD(f) {
  const cv = $('#cvFBD'); if (!cv || !cv.offsetParent) return;
  const c = fit(cv, 340, 300), ay = 128, ax0 = 112, px0 = 232;
  c.fillStyle = C.panel; c.fillRect(0, 0, 340, 300);
  /* the diagram always shows the latest force the student made (a push or a thruster burst), so it is still there after everything has stopped */
  const pushingNow = f.shove > 0.5, thrNow = Math.abs(f.thr) > 0.5, kind = pushingNow ? 'push' : thrNow ? 'thr' : S.lastKind, live = pushingNow || thrNow;
  const F = pushingNow ? f.shove : kind === 'push' ? S.lastPush : 0, thrF = thrNow ? f.thr : kind === 'thr' ? S.lastThr : 0, Tn = Math.abs(thrF), step = niceStep(Math.max(60, F, Tn)), k = 30 / step;
  c.strokeStyle = C.grid; c.lineWidth = 1; for (let x = 10; x <= 340; x += 30) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 262); c.stroke(); } for (let y = ay % 30; y <= 262; y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(340, y); c.stroke(); }
  c.fillStyle = C.hull; c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.roundRect(ax0 - 14, ay - 22, 28, 44, 9); c.fill(); c.stroke(); c.beginPath(); c.arc(ax0, ay - 32, 11, 0, 7); c.fill(); c.stroke();
  const pw = 54, ph = 36; c.beginPath(); c.roundRect(px0 - pw / 2, ay - ph / 2, pw, ph, 9); c.fill(); c.stroke(); c.fillStyle = C.hazard; c.fillRect(px0 - pw / 2, ay - 4, pw, 8); c.strokeRect(px0 - pw / 2, ay - 4, pw, 8);
  const lab = (s, x, y, col) => { c.font = `700 12px ${C.fn}`; const w = c.measureText(s).width + 8; x = Math.max(w / 2 + 2, Math.min(338 - w / 2, x)); c.fillStyle = C.panel; c.fillRect(x - w / 2, y - 8, w, 16); txt(c, s, x, y, col, `700 12px ${C.fn}`); };
  if (F > 0.5) {
    c.save(); const L = Math.min(F * k, 86);
    arrow(c, px0, ay - 5, px0 + L, ay - 5, C.right, 4); lab(Math.round(F) + ' N', px0 + L / 2 + 6, ay - 22, C.right);
    arrow(c, ax0, ay - 5, ax0 - L, ay - 5, C.left, 4); lab(Math.round(F) + ' N', ax0 - L / 2 - 6, ay - 22, C.left); c.restore();
  }
  if (Tn > 0.5) { const sd = Math.sign(thrF), L = Math.min(Tn * k, 86); arrow(c, px0, ay + 14, px0 + sd * L, ay + 14, C.hazard, 4); lab('thrusters ' + Math.round(Tn) + ' N', px0 + sd * (L / 2 + 6), ay + 30, C.hazard); }
  txt(c, 'Astronaut', ax0, 196, C.ink, `800 14px ${C.fd}`); txt(c, S.astro + ' kg', ax0, 214, C.muted, `700 12px ${C.fn}`);
  txt(c, 'Pod', px0, 196, C.ink, `800 14px ${C.fd}`); txt(c, S.mass + ' kg', px0, 214, C.muted, `700 12px ${C.fn}`);
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 262.5); c.lineTo(340, 262.5); c.stroke(); c.setLineDash([4, 4]); c.beginPath(); c.moveTo(172, 40); c.lineTo(172, 240); c.stroke(); c.setLineDash([]);
  txt(c, live ? 'Two objects, two forces. One force on each.' : F > 0.5 || Tn > 0.5 ? 'The forces from your latest push or burst.' : 'Push off to see the two forces.', 170, 282, C.muted, `600 13px ${C.fb}`);
  $('#scaleNote').textContent = `Scale: 1 grid square = ${step} N. Each object has its own diagram.`;
  const lg = [['right', 'Push on the pod'], ['left', 'Push on the astronaut']].concat(LAB.show.has('thrust') ? [['hazard', 'Thrusters on the pod']] : []);
  const lh = lg.map(([k2, n]) => `<span><i style="background:var(--${k2})"></i>${n}</span>`).join(''); const le = $('#legend'); if (le.dataset.h !== lh) { le.innerHTML = lh; le.dataset.h = lh; }
}

/* ---- Chapter 3: the Snow Arena. The huskies are the right team; the sled and its load are the "crate". ---- */
const SLED_BASE = 40, PINES = Array.from({ length: 13 }, (_, i) => [60 + i * 66 + ((i * 37) % 16), 18 + ((i * 53) % 10)]);
const sledBoxes = m => clamp(Math.round((m - SLED_BASE) / 15), 0, 8);
function drawSledBody(c, cx, gy, mass, gone) {
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(cx, gy + 3, 64, 4, 0, 0, 7); c.fill();
  c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 64, gy - 3); c.lineTo(cx + 50, gy - 3); c.quadraticCurveTo(cx + 64, gy - 3, cx + 62, gy - 16); c.stroke();
  c.lineWidth = 2; for (const x of [-44, -10, 24]) { c.beginPath(); c.moveTo(cx + x, gy - 3); c.lineTo(cx + x, gy - 16); c.stroke(); }
  c.fillStyle = C.crate; c.strokeStyle = C['crate-edge']; c.beginPath(); c.roundRect(cx - 48, gy - 34, 92, 18, 3); c.fill(); c.stroke();
  const boxes = sledBoxes(mass), cols = [C.left, C.accent, C.hazard, C.right];
  for (let i = 0; i < boxes; i++) { if (gone && gone(i)) continue; const col = i % 4, row = Math.floor(i / 4); c.fillStyle = cols[i % 4]; c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.roundRect(cx - 34 + col * 19, gy - 50 - row * 15, 17, 14, 2); c.fill(); c.stroke(); }
  c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 50, gy - 16); c.lineTo(cx - 54, gy - 70); c.lineTo(cx - 44, gy - 72); c.stroke();
  const mx = cx - 62, hip = gy - 36, sh = gy - 64;   // the musher
  c.strokeStyle = C.left; c.lineWidth = 8; c.beginPath(); c.moveTo(mx, gy - 3); c.lineTo(mx + 2, hip); c.lineTo(mx + 6, sh); c.stroke();
  c.lineWidth = 5; c.beginPath(); c.moveTo(mx + 6, sh + 2); c.lineTo(mx + 12, gy - 58); c.lineTo(mx + 18, gy - 69); c.stroke();
  c.fillStyle = C.ink; c.beginPath(); c.arc(mx + 8, sh - 12, 8, 0, 7); c.fill(); c.fillStyle = C.hazard; c.beginPath(); c.arc(mx + 8, sh - 15, 8, Math.PI, 0); c.fill();
  c.restore();
  pill(c, mass + ' kg', cx - 4, gy - (boxes > 4 ? 94 : 78), C.ink);
}
function drawSledScene(c, f) {
  const tt = performance.now() / 1000, gy = GROUND;
  c.fillStyle = C.sky; c.fillRect(0, 0, 900, 380);
  c.fillStyle = C.mountain; c.beginPath(); c.moveTo(0, 250); for (let x = 0; x <= 900; x += 60) c.lineTo(x, 150 + ((x * 7) % 5) * 14 + (x % 180 === 0 ? -34 : 0)); c.lineTo(900, 250); c.closePath(); c.fill();
  c.fillStyle = C.snow; c.fillRect(0, 251, 900, 49);
  for (const [x, h] of PINES) { const b = 290; c.fillStyle = C.pine; c.beginPath(); c.moveTo(x, b - h * 1.7); c.lineTo(x - h * 0.5, b - 6); c.lineTo(x + h * 0.5, b - 6); c.closePath(); c.fill(); c.fillStyle = C.snow; c.beginPath(); c.moveTo(x, b - h * 1.7); c.lineTo(x - h * 0.18, b - h * 1.1); c.lineTo(x + h * 0.18, b - h * 1.1); c.closePath(); c.fill(); c.fillStyle = C.crate; c.fillRect(x - 7, b - 6, 14, 10); }
  c.fillStyle = C.ink; c.fillRect(450 - 170, 92, 340, 30); txt(c, 'SNOW ARENA · HUSKY SLED RUN', 450, 107.5, C.panel, `800 19px ${C.fd}`);
  c.fillStyle = C.snow; c.fillRect(0, gy - 14, 900, 50); c.fillStyle = C['snow-shade']; c.fillRect(0, gy + 2, 900, 3); c.fillRect(0, gy + 14, 900, 2);
  if (S.floor === 'powder') { c.fillStyle = C['snow-shade']; for (let x = 10; x < 900; x += 26) { c.beginPath(); c.arc(x + (x % 52 ? 8 : 0), gy + 9 + (x % 3) * 8, 2.4, 0, 7); c.fill(); } }
  c.fillStyle = C.panel; c.fillRect(0, gy + 36, 900, 44);   // the ruler under the track
  c.strokeStyle = C.muted; c.lineWidth = 1.5;
  for (let m = -9; m <= 9; m++) { const x = CX + m * PXM; c.beginPath(); c.moveTo(x, gy + 36); c.lineTo(x, gy + (m % 3 === 0 ? 46 : 42)); c.stroke(); if (m % 3 === 0) txt(c, (m > 0 ? '+' : '') + m + ' m', x, gy + 58, C.muted, `500 12px ${C.fn}`); }
  const sx0 = CX + SLED_X0 * PXM, fx = CX + SLED_FIN * PXM;
  c.fillStyle = C.right; c.fillRect(sx0 - 2, gy - 12, 4, 48); txt(c, 'START', sx0, gy + 72, C.muted, `700 11px ${C.fn}`);
  c.fillStyle = C.ink; c.fillRect(fx - 2, gy - 64, 4, 100); for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) { c.fillStyle = (r + q) % 2 ? C.ink : C.panel; c.fillRect(fx + 2 + q * 8, gy - 64 + r * 8, 8, 8); }
  txt(c, 'FINISH', fx, gy + 72, C.muted, `700 11px ${C.fn}`);
  const pulling = S.running && f.R > 0, stuck = pulling && S.v === 0 && f.app !== 0;
  const cx = CX + S.x * PXM + (stuck && !RMOTION ? Math.sin(tt * 42) * 1.2 : 0), ph = S.running && !RMOTION ? tt * (8 + S.v * 1.2) : S.x * PXM / 9;
  const n = S.right.length, front = cx + 58, ly = gy - 26;
  if (n) {
    const xs = S.right.map((_, i) => front + 44 + i * 60);
    c.strokeStyle = C.rope; c.lineWidth = 3; c.beginPath(); c.moveTo(front, ly); c.lineTo(xs[n - 1] + 8, ly); c.stroke();
    xs.forEach((x, i) => { animal(c, 'husky', x, gy, 1, C.husky, ph + i * 1.9, pulling, ly); HITS.push({ side: 'right', i, p: S.right[i], x, hw: 28, y0: gy - 70, y1: gy + 8 }); });
    if (pulling) { c.save(); c.strokeStyle = C.right; c.lineWidth = 3; c.lineCap = 'round'; for (let k = 0; k < 3; k++) { const u = RMOTION ? k / 3 + 0.15 : (tt * 1.1 + k / 3) % 1, x = front + 8 + u * 30, y = ly + 12; c.globalAlpha = RMOTION ? 0.8 : Math.sin(u * Math.PI); c.beginPath(); c.moveTo(x - 5, y - 5); c.lineTo(x, y); c.lineTo(x - 5, y + 5); c.stroke(); } c.restore(); }
    if (LAB.show.has('meter')) { const lbl = tot(S.right) + ' N', pw = (c.font = `700 13px ${C.fn}`, c.measureText(lbl).width + 12); pill(c, lbl, clamp(front + 22, pw / 2 + 4, 896 - pw / 2), ly - 20, C.right); }
  }
  if (Math.abs(S.v) > 0.3 && !RMOTION) { c.save(); c.fillStyle = C.snow; c.strokeStyle = C['snow-shade']; for (let i = 0; i < 6; i++) { const k = (tt * 3 + i / 6) % 1; c.globalAlpha = 1 - k; c.beginPath(); c.arc(cx - 62 - k * 30, gy - 4 - k * 16 - Math.sin(i) * 4, 3 + k * 3, 0, 7); c.fill(); c.stroke(); } c.restore(); }
  /* mail run: if the sled accelerates harder than the target allows, the packages tumble off the back */
  const nb = sledBoxes(S.mass);
  if (LAB.sledHi != null && !S.fall && S.running && S.t > 0.6 && f.a > LAB.sledHi + 1e-9) S.fall = { t0: S.t, b: [] };
  const fall = S.fall, left = i => fall && S.t - fall.t0 - i * 0.14 >= 0;
  drawSledBody(c, cx, gy, S.mass, left);
  if (fall) {
    const cols = [C.left, C.accent, C.hazard, C.right];
    for (let i = 0; i < nb; i++) {
      const tau = S.t - fall.t0 - i * 0.14; if (tau < 0) continue;
      const col = i % 4, row = Math.floor(i / 4); let b = fall.b[i];
      if (!b) b = fall.b[i] = { x: S.x + (-34 + col * 19) / PXM, v: S.v, y0: gy - 50 - row * 15 };
      const age = Math.min(tau, 1.6), bx = CX + (b.x + b.v * age * 0.5 - age * age * 0.6) * PXM, by = Math.min(b.y0 + 0.5 * 340 * age * age, gy - 15 - (i % 3) * 2), ang = RMOTION ? 0.4 : Math.min(age * 3.2, 2.4) * (i % 2 ? 1 : -1);
      c.save(); c.translate(bx + 8.5, by + 7); c.rotate(ang); c.fillStyle = cols[i % 4]; c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.roundRect(-8.5, -7, 17, 14, 2); c.fill(); c.stroke(); c.restore();
    }
    pill(c, 'Too fast! The mail is falling off', 450, 140, C.bad);
  }
  hudBox(c, `Time ${S.t.toFixed(1)} s`, 14, 22, C.line, 'left');
  const off = S.floor === 'snow0';
  hudBox(c, off ? 'Friction: OFF' : `Friction: on · ${FLOORS[S.floor].name}`, 886, 22, off ? C.accent : C.fric, 'right');
  banners(c, f); drawDropZone(c);
}
/* the sled as the object in the live free-body diagram (arrows start at its centre) */
function drawSledIcon(c, cx, cy) {
  c.save(); c.lineCap = 'round'; c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 34, cy + 19); c.lineTo(cx + 26, cy + 19); c.quadraticCurveTo(cx + 36, cy + 19, cx + 35, cy + 12); c.stroke();
  c.fillStyle = C.crate; c.strokeStyle = C['crate-edge']; c.lineWidth = 3; c.beginPath(); c.roundRect(cx - 30, cy - 12, 60, 26, 4); c.fill(); c.stroke();
  c.fillStyle = C.accent; c.beginPath(); c.roundRect(cx - 18, cy - 12, 14, 12, 2); c.fill(); c.fillStyle = C.hazard; c.beginPath(); c.roundRect(cx + 2, cy - 12, 14, 12, 2); c.fill(); c.restore();
}
function banners(c, f) {
  const y = 50; let m = '', col = C.hazard, fg = '#1b1404', bg = C.hazard;
  if (S.msg) m = S.msg;
  else if (S.running && S.v === 0 && f.app !== 0 && Math.abs(f.app) <= f.fmax + 1e-9 && S.pullT > PULL_RAMP && LAB.show.has('readF')) { m = `Friction (${Math.round(Math.abs(f.fr))} N) is holding the ${S.scene === 'sled' ? 'sled' : 'crate'} still`; bg = C.panel; fg = C.ink; col = C.fric; }
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
  $('#palHint').innerHTML = sides.length ? `Drop on the <b style="color:var(--left)">left</b> of the ${S.scene === 'sled' ? 'sled' : 'crate'} for the left team, or on the <b style="color:var(--right)">right</b> for the right team. Drag someone off the arena, or tap them, to send them back.${two ? '' : ` In this step, only the ${sides[0]} team is open.`}` : '';
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
  $('#floors').innerHTML = Object.entries(FLOORS).filter(([k]) => (LAB.floors || FLOOR_MAIN).includes(k)).map(([k, F]) => `<button type="button" data-floor="${k}" aria-pressed="${S.floor === k}">${F.name}<small>${F.note}</small></button>`).join('');
  const sl = S.scene === 'sled', obj = sl ? 'sled' : 'crate'; [['[data-panel="fbd"] .term', 'Free-body diagram of the ' + obj], ['[data-panel="vt"] .term', 'Velocity–time graph of the ' + obj]].forEach(([q, t]) => { const e = $(q); if (e) e.textContent = t; });
  const ml = $('[data-panel="mass"] .term'); if (ml) ml.textContent = sl ? 'Sled and load mass' : 'Crate mass'; $('#mass').setAttribute('aria-label', sl ? 'Sled and load mass in kilograms' : 'Crate mass in kilograms'); $('#massNum').setAttribute('aria-label', sl ? 'Sled and load mass in kilograms: type a number' : 'Crate mass in kilograms: type a number');
  const sp = S.scene === 'space';
  { const e = $('.fbdcol .lbl .term'); if (e) e.textContent = sp ? 'Free-body diagrams of the astronaut and pod' : 'Free-body diagram of the crate'; }
  [['readV', sp ? 'Pod velocity' : 'Velocity'], ['readM', sp ? 'Pod mass' : 'Mass']].forEach(([k, t]) => { const e = $(`[data-panel="${k}"] .term`); if (e) e.textContent = t; });
  if (sp) { if (ml) ml.textContent = 'Pod mass'; $('#mass').setAttribute('aria-label', 'Pod mass in kilograms'); $('#massNum').setAttribute('aria-label', 'Pod mass in kilograms: type a number'); }
  const lo = sp ? 50 : 10, hi = sp ? 500 : 150, mst = sp ? 10 : 1; [$('#mass'), $('#massNum')].forEach(e => { e.min = lo; e.max = hi; }); $('#mass').step = mst;
  const m = $('#mass'); m.value = S.mass; const mn = $('#massNum'); if (document.activeElement !== mn) mn.value = S.mass;
  const am = $('#astM'); if (am) { am.value = S.astro; const an = $('#astNum'); if (document.activeElement !== an) an.value = S.astro; const pf = $('#pushF'); pf.value = S.pushF; const pn = $('#pushNum'); if (document.activeElement !== pn) pn.value = S.pushF; }
  const sb = $('#shoveBtn'); if (sb) sb.textContent = sp ? 'Push off! →' : 'Give it a push →'; const wb = $('#warpBtn'); if (wb) { wb.textContent = S.warp > 1 ? 'Back to normal time' : 'Fast-forward'; wb.setAttribute('aria-pressed', String(S.warp > 1)); }
  if (S.scene === 'drop') dzRenderControls();
  if (S.scene === 'heli') heliRenderControls();
  if (S.scene === 'shop') wsRenderControls();
  const tp = $('#tgPairs'); if (tp) tp.checked = LAB.showPairs !== false;
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
  $('#shoveBtn').addEventListener('click', () => { if (S.scene === 'space') { if (spacePush()) runMark('push'); labChanged(); return; } shove(); runMark('push'); labChanged(); });
  const thr = d => { if (!thrust(d)) return; if (!RUN) runMark('thrust'); labChanged(); };
  $('#thrFwd').addEventListener('click', () => thr(1)); $('#thrBack').addEventListener('click', () => thr(-1));
  $('#warpBtn').addEventListener('click', () => { S.warp = S.warp > 1 ? 1 : SP_WARP; labChanged(); });
  $('#tgPairs').addEventListener('change', e => { LAB.showPairs = e.target.checked; });
  /* in the Space Dome, changing anything between runs starts a fresh set-up; a push in progress is never interrupted */
  const spReset = () => { if (S.shoveT < 0 && S.thrT < 0) resetSim(); };
  $('#astM').addEventListener('input', e => { S.astro = +e.target.value; $('#astNum').value = S.astro; spReset(); labChanged(); });
  $('#pushF').addEventListener('input', e => { S.pushF = +e.target.value; $('#pushNum').value = S.pushF; spReset(); labChanged(); });
  $('#launchBtn').addEventListener('click', () => { launch(); runMark('launch'); labChanged(); });
  const setBrake = v => { S.brakeF = clamp(Math.round(v), 5, 200); if (!S.running) resetSim(); labChanged(); };
  $('#brakeF').addEventListener('input', e => setBrake(+e.target.value));
  $$('[data-bk]').forEach(b => b.addEventListener('click', () => setBrake(S.brakeF + +b.dataset.bk)));
  $('#floors').addEventListener('click', e => { const b = e.target.closest('[data-floor]'); if (!b) return; S.floor = b.dataset.floor; resetSim(); labChanged(); });
  $('#mass').addEventListener('input', e => { S.mass = +e.target.value; $('#massNum').value = S.mass; if (S.scene === 'space') spReset(); else if (!S.running) resetSim(); if (LAB.onChange) LAB.onChange(); });
  /* typed number boxes: any value the slider allows can be typed in (applied on Enter or when the box loses focus) */
  const typed = (inp, lo, hi, set) => { const go = () => { const v = parseNum(inp.value); if (isNaN(v)) { renderControls(); return; } set(clamp(Math.round(v), +inp.min || lo, +inp.max || hi)); }; inp.addEventListener('change', go); inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); inp.blur(); } }); };
  typed($('#massNum'), 10, 150, v => { S.mass = v; if (S.scene === 'space') spReset(); else if (!S.running) resetSim(); labChanged(); });
  typed($('#astNum'), 40, 160, v => { S.astro = v; spReset(); labChanged(); });
  typed($('#pushNum'), 20, 500, v => { S.pushF = v; spReset(); labChanged(); });
  typed($('#brakeNum'), 5, 200, v => setBrake(v));
  $('#tgVert').addEventListener('change', e => { LAB.showVert = e.target.checked; });
  $('#tgRes').addEventListener('change', e => { LAB.showRes = e.target.checked; });
}
/* show / hide panels according to LAB.show */
function applyPanels() {
  $$('#lab [data-panel]').forEach(el => { const ks = el.dataset.panel.split(' '); el.hidden = !ks.some(k => LAB.show.has(k)); });
  const kit = $('#lab .kit'); $('#lab .stagerow').classList.toggle('nokit', ![...kit.querySelectorAll('[data-panel]')].some(e => !e.hidden));
  const dz = S.scene === 'drop' || S.scene === 'heli' || S.scene === 'shop'; $('#reads').hidden = dz; $('#dreads').hidden = S.scene === 'shop' || !dz || !['readH', 'readV', 'readA', 'readT'].some(k => LAB.show.has(k)) || S.scene === 'drop';   // the Drop Zone draws its readouts on the scene $('#lab .scenebar').classList.toggle('dzbar', dz);
  const anyRead = [...$$('#reads .rd')].some(e => !e.hidden) || !$('#dreads').hidden;
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
  ['readD', 'Braking distance', 'brakingdist', '', () => S.brakeFrom == null ? '0.00 m' : fmt(S.x - S.brakeFrom, 2) + ' m'],
  ['readAV', 'Astronaut velocity', 'velocity', '', () => fmt(S.flags.tether ? -S.avPeak : S.av, 2) + ' m/s'],   // the tether stops the astronaut; the readout keeps the speed they pushed off at
  ['readAM', 'Astronaut mass', 'mass', '', () => fmt(S.astro, 0) + ' kg']
];
function buildReads() {
  $('#reads').innerHTML = RD.map(([k, l, t, cl]) => `<div class="rd ${cl}" data-panel="${k}"><div class="lbl"><button type="button" class="term tl" data-t="${t}">${l}</button><button type="button" class="info" data-info="${k}" aria-label="How do I read the ${l} readout?">ⓘ</button></div><div class="v" id="v-${k}"></div></div>`).join('');
}
const maskNow = () => S.scene === 'sled' && typeof sledMasked === 'function' ? sledMasked(S.right.length, S.mass, S.floor) : S.scene === 'space' && typeof spaceMasked === 'function' ? spaceMasked(S.pushF, S.mass, S.astro) : new Set();
function readouts(f) { const mk = maskNow(); RD.forEach(([k, , , , fn]) => { const el = document.getElementById('v-' + k); if (el && !el.parentElement.hidden) el.textContent = mk.has(k) ? '? (work it out first)' : fn(f); }); }

/* ---- live free-body diagram (shows the actual object; arrows start at its centre) ---- */
function niceStep(mx) { const raw = mx / 3; const p = Math.pow(10, Math.floor(Math.log10(raw))); for (const m of [1, 2, 2.5, 5, 10]) if (raw <= m * p) return m * p; return 10 * p; }
function drawLiveFBD(f) {
  if (S.scene === 'space') { drawSpaceFBD(f); return; }
  const cv = $('#cvFBD'); if (!cv || !cv.offsetParent) return;
  const c = fit(cv, 340, 300), cx = 170, cy = 128, VMAX = 92;
  c.fillStyle = C.panel; c.fillRect(0, 0, 340, 300);
  const hv = [f.L, f.R, Math.abs(f.fr), Math.abs(f.brk || 0), f.shove, LAB.showRes ? Math.abs(f.net) : 0];
  const hmax = Math.max(...hv), step = niceStep(Math.max(1, hmax > 0.5 ? hmax : (LAB.showVert ? f.W * 4 / 3 : 10))), k = 30 / step;
  c.strokeStyle = C.grid; c.lineWidth = 1;
  for (let x = cx % 30; x <= 340; x += 30) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 262); c.stroke(); }
  for (let y = cy % 30; y <= 262; y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(340, y); c.stroke(); }
  if (S.scene === 'sled') drawSledIcon(c, cx, cy); else drawCrate(c, cx, cy + 20, null, 40, 40);
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
  if (LAB.showRes && (LAB.show.has('readRes') || LAB.mode === 'explore') && !maskNow().has('readRes')) {
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
  if (S.scene === 'shop') wsUpdate(dt);
  const f = forces(); runTick(f, dt);
  if ($('#lab') && $('#lab').offsetParent) { drawScene(f); drawLiveFBD(f); drawVT(); readouts(f); if (LAB.tick) LAB.tick(f); }
  requestAnimationFrame(frame);
}
