/* ===== Operation Gummy Lift: Run Rescue (stage 3). Predict one leg's pull, then watch it play out leg by leg:
   blasts, the boulder, Smooshy squeezing out of the hatch and walking machine to machine, thrusters, collapses and the tractor beam.
   The animation is a list of beats; each frame rebuilds the scene from the start, so Skip simply jumps to the end.
   Saved in chal.c6e.gl: runs, tried, best (score, for challengeState), bestRun {rig, sum, pred, working, at}, last {sum}. */
const GL_NAME = { ramp: 'Ramp', crane: 'Crane gantry', lever: 'Lever', jack: 'Screw jack' };
const GL_STOP = { none: 'Nothing was ready to lift the Gumdrop. A machine needs to start inside the glowing box beside the ship.',
  gap: 'The Gumdrop got stuck: the next machine wasn\'t waiting inside the glowing box, and the ship isn\'t level with the crest yet.',
  broken: 'One machine couldn\'t work as built, so the rescue stopped there. Tap the red part to see why.',
  heavy: 'That leg needed more than 180 N, far too much even with the thrusters roaring. Give it a bigger mechanical advantage.',
  collapse: 'A platform buckled under too much weight! Its load is the Gumdrop plus every machine standing on it.' };
const GL_END = { spotless: ['Spotless rescue!', 'The Gumdrop is safe without a single scratch.'], dented: ['Dented, but home!', 'Smooshy is safe, though the Gumdrop needs a little repair.'], notyet: ['Not yet!', 'Smooshy is still in the crater. Fix the part that stopped and run it again.'] };
const glLegName = l => `${GL_NAME[l.type]}${l.type === 'ramp' ? ` ${fmt(l.m.L, 1)} m` : ''}${l.ropes > 1 ? `, ${l.ropes} ropes` : ''}${l.winches.length ? ', winch ' + l.winches.map(w => '×' + w).join(' ') : ''}`;
function glSummary(r) {
  return { legs: r.legs.map(l => ({ type: l.type, name: glLegName(l), rise: +l.rise.toFixed(2), ma: +l.ma.toFixed(2), pull: +l.pull.toFixed(2), hand: +l.hand.toFixed(1), work: Math.round(l.work), stopped: !!l.stopped, thr: +(l.thruster || 0).toFixed(1) })),
    hardest: +r.hardest.toFixed(2), hand: +r.hand.toFixed(1), cost: r.cost.total, crest: +r.crest.toFixed(2), work: Math.round(r.work), dmg: { t: +r.dmg.thrusters.toFixed(1), r: r.dmg.rock, b: r.dmg.blasts, total: +r.dmg.total.toFixed(1) },
    boulder: r.boulder.how ? (r.boulder.ok ? r.boulder.how : 'stuck') : 'left', rockOn: r.rockOn, arrived: r.arrived, stop: r.stop ? r.stop.why : null, score: r.score.total, pts: r.score.pts, hintCost: r.score.hintCost || 0, ending: r.score.ending, load: r.load };
}
/* ---------- the panel under the board ---------- */
function glMountRun(host) {
  host.innerHTML = `<div class="panel glrunbox"><div class="glpred" id="glPred">
      <label for="glPLeg"><b>🖥️ Mission computer:</b> before you run it, pick one leg and predict Smooshy's pull on it.</label>
      <div class="row"><select id="glPLeg" aria-label="Which leg?"></select><input type="number" step="any" id="glPVal" aria-label="Your predicted pull" placeholder="pull" style="width:7em"> <b>N</b></div>
      <div class="glwork"><label for="glWork">Working (not marked)</label><textarea id="glWork" rows="2" placeholder="Write your working here: the MA of each part, multiplied, then the pull."></textarea></div></div>
    <div class="row glrunrow"><button type="button" class="go" id="glRun">▶ Run Rescue</button><button type="button" class="ghost" id="glSkip" hidden>Skip to the end ▶▶</button><button type="button" class="ghost" id="glBack" hidden>🔧 Back to building</button><span class="scaleNote" id="glTries"></span></div>
    <div id="glRes" aria-live="polite"></div></div>`;
  const st = glState(); $('#glWork').value = st.draftWork != null ? st.draftWork : (st.pred && st.pred.working) || '';
  const keepPred = () => { const s = dbGet('chal.' + GLB.ch, {}); s[GLB.mid] = Object.assign(s[GLB.mid] || {}, { draftPred: { leg: $('#glPLeg').value, value: $('#glPVal').value } }); dbSet('chal.' + GLB.ch, s); glRunPaint(); };
  $('#glPVal').addEventListener('input', keepPred); $('#glPLeg').addEventListener('change', keepPred);
  $('#glWork').addEventListener('input', e => { const s = dbGet('chal.' + GLB.ch, {}); s[GLB.mid] = Object.assign(s[GLB.mid] || {}, { draftWork: e.target.value }); dbSet('chal.' + GLB.ch, s); });
  $('#glRun').addEventListener('click', glStartRun); $('#glSkip').addEventListener('click', () => { GLR.t0 -= 1e7; });
  $('#glBack').addEventListener('click', glBackToBuild);
  glRunPaint(); if (st.draftPred) { if (st.draftPred.leg !== '' && $(`#glPLeg option[value="${st.draftPred.leg}"]`)) $('#glPLeg').value = st.draftPred.leg; $('#glPVal').value = st.draftPred.value || ''; glRunPaint(); }
  if (st.last) glShowResult(st.last, st.lastPred);
}
function glRunPaint() {
  const sel = $('#glPLeg'); if (!sel || !GLB.ev) return; const legs = GLB.ev.legs, keep = sel.value;
  sel.innerHTML = legs.length ? legs.map((l, i) => `<option value="${i}">Leg ${i + 1}: ${GL_NAME[l.type].toLowerCase()}</option>`).join('') : '<option value="">No legs yet</option>';
  if (keep !== '' && +keep < legs.length) sel.value = keep;
  const v = $('#glPVal').value, ok = !legs.length || (v !== '' && !isNaN(+v));
  $('#glRun').disabled = GLR.on || !ok; $('#glPVal').disabled = !legs.length;
  const st = glState(); $('#glTries').textContent = st.runs ? `Runs so far: ${st.runs}. Best: ${st.bestRun && st.bestRun.sum.score != null ? st.bestRun.sum.score + ' of 10' : 'not yet'}.` : (legs.length ? 'Type a prediction to unlock Run Rescue.' : '');
}
/* ---------- building the beats ---------- */
const glLerp = (a, b, k) => a + (b - a) * k, glEase = k => RMOTION ? (k > 0 ? 1 : 0) : sstep(clamp(k, 0, 1));
function glHandSpot(leg, rig, g, plats, shipAt) {
  const chain = leg.addons.map(id => rig.parts.find(p => p.id === id)), w = chain.filter(p => p.type === 'winch').pop(), bk = chain.find(p => p.type === 'block');
  if (w) return { x: w.x - 1.3, y: glFloorAt(w.x - 1.3, g, plats) };
  if (bk) return { x: bk.x, y: glFloorAt(bk.x, g, plats) };
  if (leg.type === 'ramp') return null;   // no cable: Smooshy pushes from behind the ship
  if (leg.type === 'lever') { const x = leg.m.part.x + (leg.m.part.dir || 1) * (GL.beam + 0.6); return { x, y: glFloorAt(x, g, plats) }; }
  const x = leg.m.part.x + (leg.type === 'crane' ? -3.8 : 1.3); return { x, y: glFloorAt(x, g, plats) };
}
function glBuildBeats(res, rig) {
  const B = [], add = (dur, fn) => { if (!isFinite(dur)) dur = 0.5; B.push({ dur: RMOTION ? Math.min(dur, 0.25) : dur, fn }); };
  const g0 = glBaseGround(), blasts = res.blasts, plats = glPlatforms(rig, res.ground), parts = rig.parts;
  let gNow = g0; const shipY0 = res.ship0.y;
  /* walking from wherever Smooshy is to a spot, at a brisk 9 m/s */
  let walkFrom = null; const walkTo = (spot, mood) => { const from = walkFrom; walkFrom = spot; if (!from) return; const d = Math.hypot(spot.x - from.x, spot.y - from.y); if (d < 0.3) return;
    add(clamp(d / 9, 0.4, 2.2), (S, k) => { const e = glEase(k); S.smoo = { x: glLerp(from.x, spot.x, e), y: glLerp(from.y, spot.y, e) + (RMOTION ? 0 : Math.abs(Math.sin(k * d * 2.2)) * 0.25), mood: mood || 'wave' }; }); };
  add(0.5, (S, k) => { S.msg = 'Run Rescue!'; });
  /* 1. dynamite, in the order it was placed */
  blasts.forEach((bl, i) => { const after = glBlast(gNow, bl.x, bl.big).g, near = Math.hypot(bl.x - GL.shipX, bl.y - shipY0) <= GL.nearShip; gNow = after;
    add(1.4, (S, k) => { S.msg = ''; if (k < 0.4) { S.fx.push({ kind: 'fuse', x: bl.x, y: bl.y, k: k / 0.4 }); return; }
      S.ground = after; S.blown.add(bl.id); const kk = (k - 0.4) / 0.6; S.fx.push({ kind: 'boom', x: bl.x, y: bl.y, r: bl.r, k: kk });
      if (near) { S.ship.shake = kk < 0.7; S.ship.dmg += 15; S.bubble = { who: 'ship', s: 'Yikes! Too close!' }; }
      if (Math.abs(bl.x - GL.boulderX) <= bl.r + 0.6) S.rockGone = true; }); });
  /* 2. Smooshy squeezes out through the hatch */
  add(1.3, (S, k) => { S.ship.inside = k < 0.35; S.ship.shake = false; const e = glEase((k - 0.3) / 0.7); S.smoo = { x: GL.shipX + 1.2 + 2.4 * e, y: S.ship.y + 1.6 * (1 - e) + (RMOTION ? 0 : Math.sin(e * Math.PI) * 1.2), mood: 'wave' }; if (k < 0.35) S.smoo = null; S.bubble = k > 0.5 ? { who: 'smoo', s: 'Here goes!' } : null; });
  walkFrom = { x: GL.shipX + 3.6, y: shipY0 };
  /* 3. the boulder */
  const bm = parts.find(p => p.role === 'boulder' && GL_LIFT[p.type]), bt = res.boulder;
  if (bt.how === 'lever' || bt.how === 'jack') { const spot = bt.how === 'lever' ? { x: bm.x + GL.beam + 0.6, y: glAt(res.ground, bm.x + GL.beam + 0.6) } : { x: bm.x + 1.3, y: glAt(res.ground, bm.x + 1.3) }; walkTo(spot);
    add(bt.ok ? 1.6 : 1.4, (S, k) => { S.smoo = Object.assign({}, spot, { mood: 'strain' }); if (bt.ok) { S.tilt[bm.id] = Math.min(1, k * 1.6) * (bt.how === 'lever' ? 0.4 : 0.6); const e = glEase((k - 0.35) / 0.65); S.rockX = 18.7 + 3.5 * e; S.rockY = glAt(res.ground, S.rockX) + Math.sin(e * Math.PI) * 0.6; S.rockRot = 0.12 + e * 4; if (k > 0.98) S.rockAway = true; S.bubble = { who: 'smoo', s: 'Boulder off!' }; }
      else { S.tilt[bm.id] = RMOTION ? 0 : Math.abs(Math.sin(k * 14)) * 0.05; S.bubble = { who: 'smoo', s: `Too stiff! (${fmt(bt.pull, 1)} N)` }; } }); }
  else if (bt.how === 'winch') { const ch = glAddons({ parts, cables: (rig.cables || []).map(c => ({ a: c.a === 'boulder' ? '__b' : c.a, b: c.b === 'boulder' ? '__b' : c.b })) }, '__b').chain, w = ch.filter(p => p.type === 'winch').pop() || ch[0], spot = { x: w.x - 1.3, y: glFloorAt(w.x - 1.3, res.ground, plats) }; walkTo(spot);
    add(1.6, (S, k) => { S.smoo = Object.assign({}, spot, { mood: 'strain' }); S.spin = k * 12; if (bt.ok) { const e = glEase(k); S.rockX = glLerp(18.7, Math.min(w.x - 2, 26), e); S.rockY = glAt(res.ground, S.rockX); S.rockRot = 0.12 + e * 3; S.bubble = { who: 'smoo', s: 'Boulder off!' }; } else S.bubble = { who: 'smoo', s: 'It won\'t budge!' }; }); }
  const rockOn = res.rockOn; if (rockOn) add(0.9, (S, k) => { S.ship.carryRock = true; S.bubble = { who: 'ship', s: 'The rock is still jammed on!' }; if (k > 0.5 && !S.rockDmg) { S.rockDmg = true; S.ship.dmg += 25; } });
  /* 4. the legs */
  const ran = res.legs.filter(l => !l.skipped); let shipAt = { x: GL.shipX, y: shipY0 };
  const sinkPlat = res.stop && res.stop.why === 'collapse' ? res.stop.plat : null;
  ran.forEach(l => {
    const stopHere = res.stop && res.stop.leg === l.i, moves = !stopHere || (res.stop.why === 'collapse' && glPlatOnlyAtEnd(l, res, plats)), push = !glHandSpot(l, rig, res.ground, plats);
    const spot = push ? { x: l.start.x - 2.6, y: l.start.y } : glHandSpot(l, rig, res.ground, plats); walkTo(spot);
    const from = Object.assign({}, l.start), to = Object.assign({}, l.end), tilt = l.type === 'ramp' ? -Math.atan2(l.end.y - l.start.y, l.end.x - l.start.x) : 0;
    const strain = l.pull > GL.pullOk + 1e-9, dur = 1.6 + Math.min(2.2, l.rise * 0.18);
    if (l.type !== 'ramp') add(0.6, (S, k) => { const e = glEase(k); S.ship.x = glLerp(shipAt.x, from.x, e); S.ship.y = glLerp(shipAt.y, from.y, e); S.ship.tilt = glLerp(S.ship.tilt, 0, e); if (l.type === 'crane') S.hook[l.id] = from.y + 4.2; });
    else add(0.4, (S, k) => { S.ship.x = from.x; S.ship.y = from.y; S.ship.tilt = glLerp(0, tilt, glEase(k)); });
    if (moves && !(stopHere && (res.stop.why === 'broken' || res.stop.why === 'heavy'))) {
      add(dur, (S, k) => { const e = glEase(k); S.ship.x = glLerp(from.x, to.x, e); S.ship.y = glLerp(from.y, to.y, e); S.ship.tilt = tilt * (l.type === 'ramp' ? 1 : 0);
        if (l.type === 'ramp') S.rope = { a: { x: S.ship.x + 2.2 * Math.cos(tilt), y: S.ship.y + 1.8 - 2.2 * Math.sin(tilt) }, b: { x: to.x, y: to.y + 0.4 } };
        if (k >= 1) S.rope = null; S.ship.shake = strain; S.flames = strain ? Math.min(1, (l.pull - GL.pullOk) / 120) : 0; S.ship.dmg += (l.thruster || 0) * k; S.spin = k * 30;
        if (l.type === 'crane') S.hook[l.id] = S.ship.y + 4.2; if (l.type === 'lever' || l.type === 'jack') S.tilt[l.id] = k;
        S.smoo = push ? { x: S.ship.x - 2.6 * Math.cos(tilt), y: S.ship.y + 2.6 * Math.sin(tilt), mood: 'strain' } : Object.assign({}, spot, { mood: 'strain' });
        S.bubble = strain ? { who: 'ship', s: 'Thrusters! Hold on!' } : (k < 0.5 ? { who: 'smoo', s: 'Heave!' } : null);
        if (k >= 1) { S.flames = 0; S.ship.shake = false; S.readouts.push(`Leg ${l.i + 1}: ${fmt(l.pull, 1)} N`); } });
      shipAt = to;
    } else { add(1.8, (S, k) => { S.smoo = Object.assign({}, spot, { mood: 'strain' }); S.ship.shake = !RMOTION; S.flames = res.stop.why === 'heavy' ? 1 : 0; S.bad = l.id; S.bubble = { who: 'smoo', s: res.stop.why === 'heavy' ? 'It\'s far too heavy!' : 'Something\'s wrong here!' }; if (k >= 1) { S.ship.shake = false; S.flames = 0; } }); shipAt = from; }
    if (stopHere && res.stop.why === 'collapse') add(1.8, (S, k) => { S.sink[sinkPlat] = glEase(k); S.ship.y = shipAt.y - glEase(k) * 1.2; S.ship.tilt = 0.25 * glEase(k); S.bubble = { who: 'smoo', s: 'The platform is buckling!' }; });
  });
  /* 5. a gap, or the tractor beam */
  if (res.stop && res.stop.why === 'gap') add(1.8, (S, k) => { S.bubble = { who: 'smoo', s: 'Where\'s the next machine?' }; S.zone = res.stop.at; });
  if (res.stop && res.stop.why === 'none') add(1.6, (S, k) => { S.bubble = { who: 'smoo', s: 'There\'s nothing here to pull with!' }; S.zone = res.stop.at; });
  if (res.arrived) {
    walkTo({ x: shipAt.x - 1.5, y: shipAt.y });
    add(1.0, (S, k) => { S.smoo = { x: shipAt.x - 1.5 + 1.5 * glEase(k), y: shipAt.y + Math.sin(k * Math.PI) * 1.4, mood: 'cheer' }; if (k > 0.9) { S.smoo = null; S.ship.inside = true; S.ship.mood = 'cheer'; } });
    add(4.2, (S, k) => { S.smoo = null; S.ship.inside = true; S.ship.mood = 'wave'; const e = glEase(Math.max(0, (k - 0.25) / 0.75)); S.ship.x = glLerp(shipAt.x, 86, e); S.ship.y = glLerp(shipAt.y, 20.6, e); S.ship.tilt = glLerp(S.ship.tilt, 0, Math.min(1, k * 3));
      S.beam = { k }; S.bubble = k < 0.5 ? { who: 'ship', s: 'Tractor beam locked on!' } : null; if (k > 0.97) S.shipGone = true; });
  }
  return B;
}
function glPlatOnlyAtEnd(l, res, plats) { const s = glSupport(l.end.x, l.end.y, res.ground, plats); return s && s.kind === 'platform' && s.id === res.stop.plat; }
/* ---------- playing it ---------- */
function glSceneAt(t) {
  const res = GLR.res, st = glState(), S = { ship: { x: GL.shipX, y: res.ship0.y, tilt: 0, inside: true, mood: 'worried', dmg: 0, carryRock: false, shake: false }, smoo: null, ground: glBaseGround(), blown: new Set(), hook: {}, tilt: {}, sink: {}, readouts: [], fx: [], spin: 0 };
  let acc = 0; for (const b of GLR.beats) { if (t < acc) break; const k = clamp((t - acc) / b.dur, 0, 1); b.fn(S, k); acc += b.dur; }
  if (S.rockAway) S.rockGone = true;
  return S;
}
function glRunFrame() {
  if (!GLR.on) return; const cv = GLB.cv; if (!cv || !cv.isConnected) { GLR.on = false; return; }
  const t = (performance.now() - GLR.t0) / 1000, S = glSceneAt(t), res = GLR.res, g = S.ground; glSize(); const c = fit(cv, GLV.LW, GLV.LH);
  const plats = res.plats.map(p => S.sink[p.id] ? Object.assign({}, p, { top: p.top - S.sink[p.id] * (p.top - p.base) * 0.5, over: true }) : p);
  const ev = Object.assign({}, res, { plats, ground: g, legs: res.legs.map(l => Object.assign({}, l, { faults: S.bad === l.id ? (l.faults.length ? l.faults : ['x']) : [] })) });
  const shipPx = { x: glSX(S.ship.x), y: glSY(S.ship.y + 2) };
  glDrawWorld(c, { rig: GLR.rig, ev, ground: g, ghost: null, ship: S.shipGone ? null : Object.assign({}, S.ship, { dmg: Math.min(100, S.ship.dmg) }), smoo: S.smoo, rock: !S.rockGone, t,
    hz: S.zone || null, hzLabel: S.zone ? 'The next machine needed to start in here' : '',
    run: { on: true, blown: S.blown, rockGone: S.rockGone, rockX: S.rockX, rockY: S.rockY, rockRot: S.rockRot, hook: S.hook, tilt: S.tilt, spin: S.spin, rope: S.rope,
      beam: S.beam ? { x: shipPx.x - 3 * glU(), y: shipPx.y + 2.4 * glU(), x2: shipPx.x + 3 * glU(), y2: shipPx.y + 2.4 * glU() } : null,
      fx: (c2, tt) => glFx(c2, S, tt) } });
  if (t > GLR.total + 0.1 && !GLR.done) { GLR.done = true; glFinishRun(); }
  GLR.raf = requestAnimationFrame(glRunFrame);
}
function glFx(c, S, t) {
  const u = glU();
  if (S.flames && !S.shipGone) { const X = glSX(S.ship.x), Y = glSY(S.ship.y); [-1.6, 1.6].forEach(dx => { const fl = (0.6 + S.flames * 1.6) * u * (RMOTION ? 1 : 0.8 + 0.3 * Math.sin(t * 40 + dx)); const gr = c.createLinearGradient(0, Y, 0, Y + fl); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.4, '#ffb02e'); gr.addColorStop(1, 'rgba(214,64,44,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(X + dx * u - 0.35 * u, Y); c.quadraticCurveTo(X + dx * u, Y + fl * 1.2, X + dx * u + 0.35 * u, Y); c.fill(); }); }
  S.fx.forEach(f => { const X = glSX(f.x), Y = glSY(f.y);
    if (f.kind === 'fuse') { c.fillStyle = Math.floor(t * 20) % 2 ? '#fff3b0' : '#ffb02e'; c.beginPath(); c.arc(X + 0.2 * u, Y - (1.75 - f.k * 0.8) * u, Math.max(3, 0.2 * u), 0, 7); c.fill(); }
    if (f.kind === 'boom') { const R = f.r * u * (0.6 + f.k * 1.4); c.globalAlpha = 1 - f.k; c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(X, Y, R * 0.55, 0, 7); c.fill(); c.fillStyle = '#ff8a3d'; c.beginPath(); c.arc(X, Y, R * 0.8, 0, 7); c.fill(); c.globalAlpha = (1 - f.k) * 0.8;
      c.fillStyle = '#8a70c4'; for (let i = 0; i < 12; i++) { const a = i * 0.52 + 0.3, d = R * (0.7 + f.k * 1.6); c.beginPath(); c.arc(X + Math.cos(a) * d, Y - Math.abs(Math.sin(a)) * d, Math.max(2, 0.25 * u), 0, 7); c.fill(); } c.globalAlpha = 1;
      if (!RMOTION && f.k < 0.3) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(0, 0, GLV.LW, GLV.LH); } } });
  if (S.bubble) { const who = S.bubble.who === 'ship' ? (S.shipGone ? null : { x: S.ship.x, y: S.ship.y + 5.2 }) : S.smoo ? { x: S.smoo.x, y: S.smoo.y + 2.8 } : null;
    if (who) glLbl(c, S.bubble.s, clamp(glSX(who.x), 90, GLV.LW - 90), Math.max(18, glSY(who.y)), GLC.ink, 13, 'center', '#fffaf2'); }
  if (S.msg) glLbl(c, S.msg, GLV.LW / 2, 34, GLC.ink, 18, 'center', '#ffe28a');
  S.readouts.forEach((s, i) => glLbl(c, s, 70 + 0, GLV.LH - 18 - i * 22, GLC.ink, 12, 'left', '#c9ffdc'));
}
function glStartRun() {
  if (GLR.on) return; const legs = GLB.ev.legs, li = $('#glPLeg').value, v = $('#glPVal').value;
  if (legs.length && (v === '' || isNaN(+v))) { toast('Type your predicted pull first. Any number counts!'); return; }
  const st = glState(); GLR.rig = JSON.parse(JSON.stringify(GLB.rig)); GLR.res = glEvaluate(GLR.rig, { hints: st.hints || 0 });
  GLR.pred = legs.length ? { leg: +li, value: +v, working: $('#glWork').value } : null;
  GLR.beats = glBuildBeats(GLR.res, GLR.rig); GLR.total = GLR.beats.reduce((a, b) => a + b.dur, 0); GLR.t0 = performance.now(); GLR.on = true; GLR.done = false;
  GLB.sel = null; glCloseMenu(); $('#glSkip').hidden = false; $('#glBack').hidden = true; $('#glRun').disabled = true; $('.glboard').classList.add('running');
  $('#glRes').innerHTML = ''; GLB.cv.scrollIntoView({ block: 'nearest', behavior: RMOTION ? 'auto' : 'smooth' });
  cancelAnimationFrame(GLB.raf); GLR.raf = requestAnimationFrame(glRunFrame);
}
/* the run is over: save it (best run counts), show the receipt, then the ending card if there is one */
function glFinishRun() {
  const res = GLR.res, sum = glSummary(res), st = glState(), n = (st.runs || 0) + 1, cur = { total: sum.score, hardest: sum.hardest };
  const firstRescue = !!res.arrived && !st.firstDone;   // read before the save below, which updates this same state object
  const prevBest = st.bestRun ? { total: st.bestRun.sum.score, hardest: st.bestRun.sum.hardest } : null, better = glBetter(cur, prevBest);
  const patch = { runs: n, tried: true, last: sum, lastPred: GLR.pred, lastDmg: res.arrived ? 0 : sum.dmg.total, boulderGone: false, pred: GLR.pred };
  if (better) patch.bestRun = { rig: GLR.rig, sum, pred: GLR.pred, at: Date.now() };
  patch.best = Math.max(st.best || 0, sum.score || 0);
  if (res.arrived && !st.firstDone) patch.firstDone = Date.now();
  GLB.save({ id: GLB.mid }, patch);
  if (better && typeof rigSnapshot === 'function') rigSnapshot();
  $('#glSkip').hidden = true; $('#glBack').hidden = false; glShowResult(sum, GLR.pred, better && n > 1); glRunPaint();
  if (typeof glShowEnding === 'function') glShowEnding(sum, { first: firstRescue, better });
}
function glBackToBuild() {
  GLR.on = false; cancelAnimationFrame(GLR.raf); $('#glBack').hidden = true; $('.glboard').classList.remove('running'); glRunPaint(); glLoop();
}
function glShowResult(sum, pred, newBest) {
  const host = $('#glRes'); if (!host || !sum) return; const E = GL_END[sum.ending], f1 = v => fmt(v, 1), n0 = v => Math.round(v).toLocaleString('en-GB');
  const P = sum.pts, rows = sum.legs.map((l, i) => `<tr class="${l.stopped ? 'stop' : ''}"><td>${i + 1}</td><td>${esc(l.name)}</td><td>${f1(l.rise)} m</td><td>${fmt(l.ma, 1)}</td><td><b>${f1(l.pull)} N</b>${l.pull > 60 + 1e-9 ? ' 🔥' : ''}</td><td>${n0(l.hand)} m</td><td>${n0(l.work)} J</td></tr>`).join('');
  const pl = pred && sum.legs[pred.leg] ? `<p class="glpredfb">You predicted <b>${f1(pred.value)} N</b> for leg ${pred.leg + 1}. Smooshy's pull on it was <b>${f1(sum.legs[pred.leg].pull)} N</b>. ${Math.abs(pred.value - sum.legs[pred.leg].pull) <= Math.max(1, sum.legs[pred.leg].pull * 0.05) ? 'Spot on, engineer!' : 'Compare your working with the receipt below to see where the numbers split.'}</p>` : '';
  const pt = (lab, got, max, note) => `<li class="${got === max ? 'ok' : ''}"><span class="box">${got === max ? '✓' : ''}</span>${lab}: <b>${got} of ${max}</b>${note ? ` <small>${note}</small>` : ''}</li>`;
  host.innerHTML = `<div class="glstamp ${sum.ending}"><b>${E[0]}</b> <span>${sum.score != null ? `${sum.score} of 10` : 'No score yet'}</span>${newBest ? ' <em>New best run!</em>' : ''}</div><p>${E[1]}${sum.stop ? ' ' + GL_STOP[sum.stop] : ''}</p>${pl}
    ${rows ? `<div class="gltab"><table><thead><tr><th>Leg</th><th>Machine</th><th>Rise</th><th>Total MA</th><th>Pull</th><th>Hand travel</th><th>Work</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="glnote">Work receipt: each leg's work = ${n0(sum.load)} N × its rise. Change the machines and only the pull and hand travel change; the work only changes when the rise does.</p>` : ''}
    <ul class="glsums"><li>Hand travel: <b>${n0(sum.hand)} m</b> of 1,500 m oxygen</li><li>Sugar crystals: <b>${sum.cost}</b> of 475</li><li>Final crest height: <b>${f1(sum.crest)} m</b></li><li>Total work: <b>${n0(sum.work)} J</b></li>
      <li>Ship damage: <b>${f1(sum.dmg.total)}%</b>${sum.dmg.total ? ` <small>(thrusters ${f1(sum.dmg.t)}%, rock ${sum.dmg.r}%, blasts ${sum.dmg.b}%)</small>` : ''}</li><li>Boulder: <b>${{ lever: 'levered off', jack: 'jacked off', winch: 'winched away', blast: 'blasted', stuck: 'still jammed on', left: 'left on' }[sum.boulder]}</b></li></ul>
    ${sum.score != null ? `<ul class="objs glpts">${pt('Smooshy\'s hardest pull', P.pull, 5, `${f1(sum.hardest)} N. 54 to 60 N earns 5.`)}${pt('Ship condition', P.cond, 2)}${pt('Boulder cleared', P.boulder, 1)}${pt('Oxygen: 1,500 m or less', P.oxy, 1, P.oxy ? '' : 'Force HQ sent extra oxygen.')}${pt('Budget: 475 crystals or less', P.budget, 1, P.budget ? '' : 'Force HQ sent extra crystals.')}${sum.hintCost ? `<li>Hints: <b>−${sum.hintCost}</b></li>` : ''}</ul>` : ''}`;
}
/* ===== stage 4 plumbing: the best run's picture for the worksheet's "My Rescue" page =====
   rigSnapshot() draws the best run's rig over the whole crater (no handles or dots) into a 900 px wide JPEG, kept under about 150 KB,
   and stores it as chal.c6e.gl.bestRun.snap (best run only, so progress stays small; backups in 70-backup.js carry it as part of DB). */
/* draws a rig over the whole crater into a JPEG data URL (900 px wide, under about 150 KB); the title is written in the corner */
function glSnapURL(rig, title) {
  const keep = { LW: GLV.LW, LH: GLV.LH, z: GLV.z, cx: GLV.cx, cy: GLV.cy };
  try {
    const cv = document.createElement('canvas'); cv.width = 900; cv.height = 270; const c = cv.getContext('2d');
    Object.assign(GLV, { LW: 1000, LH: 300, z: 1, cx: 48, cy: 12 }); c.setTransform(0.9, 0, 0, 0.9, 0, 0);
    const ev = glEvaluate(rig);
    glDrawWorld(c, { rig, ev, ground: ev.ground, ghost: rig.parts.some(p => p.type === 'dyn') ? glBaseGround() : null, t: 0,
      ship: { x: GL.shipX, y: ev.ship0.y, tilt: 0, inside: true, mood: 'worried', dmg: 0 }, run: { on: true } });
    c.setTransform(1, 0, 0, 1, 0, 0); glLbl(c, title, 12, 18, GLC.ink, 13, 'left', '#fffaf2');
    let q = 0.8, url = cv.toDataURL('image/jpeg', q); while (url.length * 0.75 > 150000 && q > 0.35) { q -= 0.1; url = cv.toDataURL('image/jpeg', q); }
    return url;
  } catch (e) { return null; } finally { Object.assign(GLV, keep); }
}
function rigSnapshot() {
  const st = glState(), br = st.bestRun; if (!br || !br.rig) return null;
  const url = glSnapURL(br.rig, `${(dbGet('user', {}) || {}).name || ''}'s best rescue route`.trim()); if (!url) return null;
  const all = dbGet('chal.' + GLB.ch, {}); if (all[GLB.mid] && all[GLB.mid].bestRun) { all[GLB.mid].bestRun.snap = url; dbSet('chal.' + GLB.ch, all); }
  return url;
}
