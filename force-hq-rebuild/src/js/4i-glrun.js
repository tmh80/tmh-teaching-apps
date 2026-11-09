/* ===== Operation Gummy Lift: the simulator test and the rescue (stage 3, reworked in stage 4). Two ways to run the board:
   ▶ Test in simulator (glStartRun('test')): the route plays quickly, with NO leg numbers, then each leg is marked worked or failed (glShowTest). It saves no score.
   The rescue (glStartRun('launch')): plays after GASA approves the maths (Send to GASA, 4p-glwork.js): blasts, the boulder, Smooshy squeezing out of the hatch and walking
   machine to machine, thrusters, collapses and the tractor beam. The animation is a list of beats; each frame rebuilds the scene from the start, so Skip simply jumps to the end.
   Saved in chal.c6e.gl: runs, tests, tried, best (score, for challengeState), bestRun {rig, sum, pred (null now), work (the route strip), at}, last {sum}, lastTest {lines, arrived}. */
const GL_NAME = { ramp: 'Ramp', crane: 'Crane gantry', lever: 'Lever', jack: 'Screw jack' };
const GL_STOP = { none: 'Nothing was ready to lift the Gumdrop. A machine needs to start inside the glowing box beside the ship.',
  gap: 'The Gumdrop got stuck: the next machine wasn\'t waiting inside the glowing box, and the ship isn\'t level with the crest yet.',
  broken: 'One machine couldn\'t work as built, so the rescue stopped there. Tap the red part to see why.',
  heavy: 'That leg needed more than 180 N, far too much even with the thrusters roaring. Give it a bigger mechanical advantage.',
  collapse: 'A platform buckled under too much weight! Its load is the Gumdrop plus every machine standing on it.',
  norope: 'A machine wasn\'t roped to the Gumdrop, so nothing was pulling it. Drag a rope from the machine\'s ◉ to the Gumdrop\'s ◉.' };
/* how far short of the dotted line a run stopped (Tom, 9 Nov 2026): from the model's own numbers, the height the Gumdrop reached above where it started, and how much higher the line is */
function glShort(r) { if (!r || r.arrived || !r.ship0) return null; const at = r.stop && r.stop.at ? r.stop.at : r.final; if (!at) return null; return { up: Math.max(0, at.y - r.ship0.y), to: Math.max(0, r.crest - at.y) }; }
const glShortText = (up, to) => up == null ? '' : `The Gumdrop got ${fmt(up, 1)} m up, and the dotted line is ${fmt(to, 1)} m higher.`;
const glStopText = (why, leg) => why === 'norope' && leg != null ? `Leg ${leg + 1}'s machine isn't roped to the Gumdrop.` : GL_STOP[why] || '';
const GL_END = { spotless: ['Spotless rescue!', 'The Gumdrop is safe without a single scratch.'], dented: ['Dented, but home!', 'Smooshy is safe, though the Gumdrop needs a little repair.'], notyet: ['Not yet!', 'Smooshy is still in the crater. Fix the part that stopped and run it again.'] };
const glLegName = l => `${GL_NAME[l.type]}${l.type === 'ramp' ? ` ${fmt(l.m.L, 1)} m` : ''}${l.ropes > 1 ? `, ${l.ropes} ropes` : ''}${l.winches.length ? ', winch ' + l.winches.map(w => '×' + w).join(' ') : ''}`;
function glSummary(r) {
  return { legs: r.legs.map(l => ({ type: l.type, name: glLegName(l), rise: +l.rise.toFixed(2), ma: +l.ma.toFixed(2), pull: +l.pull.toFixed(2), hand: +l.hand.toFixed(1), work: Math.round(l.work), stopped: !!l.stopped, thr: +(l.thruster || 0).toFixed(1) })),
    hardest: +r.hardest.toFixed(2), hand: +r.hand.toFixed(1), cost: r.cost.total, crest: +r.crest.toFixed(2), up: glShort(r) ? +glShort(r).up.toFixed(1) : null, toLine: glShort(r) ? +glShort(r).to.toFixed(1) : null, work: Math.round(r.work), dmg: { t: +r.dmg.thrusters.toFixed(1), r: r.dmg.rock, b: r.dmg.blasts, total: +r.dmg.total.toFixed(1) },
    boulder: r.boulder.how ? (r.boulder.ok ? r.boulder.how : 'stuck') : 'left', rockOn: r.rockOn, arrived: r.arrived, stop: r.stop ? r.stop.why : null, stopLeg: r.stop ? r.stop.leg : null, score: r.score.total, pts: r.score.pts, hintCost: r.score.hintCost || 0, hints: r.score.hints || 0, max: GL_MAX, ending: r.score.ending, load: r.load };
}
/* ---------- the panel under the board: the result of a test or of the rescue ---------- */
function glMountRun(host) {
  host.innerHTML = `<div class="panel glrunbox"><div class="row glrunrow"><button type="button" class="ghost" id="glSkip" hidden>Skip to the end ▶▶</button><button type="button" class="ghost" id="glBack" hidden>🔧 Back to building</button><span class="scaleNote" id="glTries"></span></div>
    <div id="glRes" aria-live="polite"></div></div>`;
  const st = glState();
  $('#glRun').addEventListener('click', () => glStartRun('test'));
  $('#glRunCtl').addEventListener('click', e => { const b = e.target.closest('[data-gr]'); if (!b) return; if (b.dataset.gr === 'skip') GLR.t0 -= 1e7; else if (GLR.mode === 'test') glBackToBuild(); });   // buttons ON the board, so there is always a way out $('#glSkip').addEventListener('click', () => { GLR.t0 -= 1e7; });
  $('#glBack').addEventListener('click', glBackToBuild);
  glRunPaint();
  if (st.last) glShowResult(st.last, st.lastPred); if (st.lastTest && (!st.last || st.lastTest.at > (st.lastAt || 0))) glShowTest(st.lastTest);
}
function glRunPaint() {
  if (!GLB.ev) return; const rb = $('#glRun'); if (rb) rb.disabled = !!GLR.on || !!GLW.busy;
  const el = $('#glTries'); if (!el) return; const st = glState(), bs = st.bestRun && st.bestRun.sum;
  el.textContent = st.runs || st.tests ? `Simulator tests: ${st.tests || 0}. Rescues launched: ${st.runs || 0}.${bs ? ` Best: ${bs.score != null ? bs.score + ' of ' + (bs.max || 10) : 'not yet'}.` : ''}` : (GLB.ev.legs.length ? 'Test your route in the simulator, then send your maths to GASA.' : '');
  if (typeof glwSendState === 'function') glwSendState();
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
function glBuildBeats(res, rig, o) {
  o = o || {}; const B = [], add = (dur, fn) => { if (!isFinite(dur)) dur = 0.5; B.push({ dur: RMOTION ? Math.min(dur, 0.25) : dur, fn }); };
  const g0 = glBaseGround(), blasts = res.blasts, plats = glPlatforms(rig, res.ground), parts = rig.parts;
  let gNow = g0; const shipY0 = res.ship0.y;
  /* walking from wherever Smooshy is to a spot, at a brisk 9 m/s */
  let walkFrom = null; const walkTo = (spot, mood) => { const from = walkFrom; walkFrom = spot; if (!from) return; const d = Math.hypot(spot.x - from.x, spot.y - from.y); if (d < 0.3) return;
    add(clamp(d / 9, 0.4, 2.2), (S, k) => { const e = glEase(k); S.smoo = { x: glLerp(from.x, spot.x, e), y: glLerp(from.y, spot.y, e) + (RMOTION ? 0 : Math.abs(Math.sin(k * d * 2.2)) * 0.25), mood: mood || 'wave' }; }); };
  add(0.5, (S, k) => { S.msg = o.test ? 'Testing in the simulator' : 'Mission accepted! Launch!'; });
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
      else { S.tilt[bm.id] = RMOTION ? 0 : Math.abs(Math.sin(k * 14)) * 0.05; S.bubble = { who: 'smoo', s: o.test ? 'Too stiff!' : `Too stiff! (${fmt(bt.pull, 1)} N)` }; } }); }
  else if (bt.how === 'winch') { const ch = glAddons({ parts, cables: (rig.cables || []).map(c => ({ a: c.a === 'boulder' ? '__b' : c.a, b: c.b === 'boulder' ? '__b' : c.b })) }, '__b').chain, w = ch.filter(p => p.type === 'winch').pop() || ch[0], spot = { x: w.x - 1.3, y: glFloorAt(w.x - 1.3, res.ground, plats) }; walkTo(spot);
    add(1.6, (S, k) => { S.smoo = Object.assign({}, spot, { mood: 'strain' }); S.spin = k * 12; if (bt.ok) { const e = glEase(k); S.rockX = glLerp(18.7, Math.min(w.x - 2, 26), e); S.rockY = glAt(res.ground, S.rockX); S.rockRot = 0.12 + e * 3; S.bubble = { who: 'smoo', s: 'Boulder off!' }; } else S.bubble = { who: 'smoo', s: 'It won\'t budge!' }; }); }
  const rockOn = res.rockOn; if (rockOn) add(0.9, (S, k) => { S.ship.carryRock = true; S.bubble = { who: 'ship', s: 'The rock is still jammed on!' }; if (k > 0.5 && !S.rockDmg) { S.rockDmg = true; S.ship.dmg += 25; } });
  /* 4. the legs */
  const ran = res.legs.filter(l => !l.skipped); let shipAt = { x: GL.shipX, y: shipY0 };
  const sinkPlat = res.stop && res.stop.why === 'collapse' ? res.stop.plat : null;
  ran.forEach(l => {
    const stopHere = res.stop && res.stop.leg === l.i, moves = !stopHere || (res.stop.why === 'collapse' && glPlatOnlyAtEnd(l, res, plats)), push = !glHandSpot(l, rig, res.ground, plats);
    const spot = push ? { x: l.start.x - 2.6, y: l.start.y } : glHandSpot(l, rig, res.ground, plats); walkTo(spot);
    const prev = shipAt, from = Object.assign({}, l.start), to = Object.assign({}, l.end), tilt = l.type === 'ramp' ? -Math.atan2(l.end.y - l.start.y, l.end.x - l.start.x) : 0;
    const strain = l.pull > GL.pullOk + 1e-9, dur = 1.6 + Math.min(2.2, l.rise * 0.18);
    if (l.type !== 'ramp') add(0.6, (S, k) => { const e = glEase(k); S.ship.x = glLerp(prev.x, from.x, e); S.ship.y = glLerp(prev.y, from.y, e); S.ship.tilt = glLerp(S.ship.tilt, 0, e); if (l.type === 'crane') S.hook[l.id] = from.y + 4.2; });
    else add(0.4, (S, k) => { S.ship.x = from.x; S.ship.y = from.y; S.ship.tilt = glLerp(0, tilt, glEase(k)); });
    if (moves && !(stopHere && (res.stop.why === 'broken' || res.stop.why === 'heavy'))) {
      add(dur, (S, k) => { const e = glEase(k); S.ship.x = glLerp(from.x, to.x, e); S.ship.y = glLerp(from.y, to.y, e); S.ship.tilt = tilt * (l.type === 'ramp' ? 1 : 0);
        if (l.type === 'ramp') S.rope = { a: { x: S.ship.x + 2.2 * Math.cos(tilt), y: S.ship.y + 1.8 - 2.2 * Math.sin(tilt) }, b: { x: to.x, y: to.y + 0.4 } };
        if (k >= 1) S.rope = null; S.ship.shake = strain; S.flames = strain ? Math.min(1, (l.pull - GL.pullOk) / 120) : 0; S.ship.dmg += (l.thruster || 0) * k; S.spin = k * 30;
        if (l.type === 'crane') S.hook[l.id] = S.ship.y + 4.2; if (l.type === 'lever' || l.type === 'jack') S.tilt[l.id] = k;
        S.smoo = push ? { x: S.ship.x - 2.6 * Math.cos(tilt), y: S.ship.y + 2.6 * Math.sin(tilt), mood: 'strain' } : Object.assign({}, spot, { mood: 'strain' });
        S.bubble = strain ? { who: 'ship', s: 'Thrusters! Hold on!' } : (k < 0.5 ? { who: 'smoo', s: 'Heave!' } : null);
        if (k >= 1) { S.flames = 0; S.ship.shake = false; if (!o.test) S.readouts.push(`Leg ${l.i + 1}: ${fmt(l.pull, 1)} N`); } });
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
/* Tom, 9 Nov 2026: the Gumdrop used to flash at the top of the crane, then drop back, before a leg's lift. A beat read shipAt when it PLAYED, after all the beats were built, so it saw the end spot. Each beat now keeps
   the spot it starts from (prev). The Gumdrop stays at its start until its leg's lift beat moves it. */
/* ---------- playing it ---------- */
function glSceneAt(t) {
  const res = GLR.res, st = glState(), S = { ship: { x: GL.shipX, y: res.ship0.y, tilt: 0, inside: true, mood: 'worried', dmg: 0, carryRock: false, shake: false }, smoo: null, ground: glBaseGround(), blown: new Set(), hook: {}, tilt: {}, sink: {}, readouts: [], fx: [], spin: 0 };
  let acc = 0; for (const b of GLR.beats) { if (t < acc) break; const k = clamp((t - acc) / b.dur, 0, 1); b.fn(S, k); acc += b.dur; }
  if (S.rockAway) S.rockGone = true;
  return S;
}
/* Tom, 9 Nov 2026: "stuck testing in the simulator, no way to build now". The board stayed in its running state after a test (the Back to building button was far below the board, and a run that hit an error
   was never ended at all). Now: a test always hands the board back by itself, Skip and Back to building sit on the board, and any problem in a run puts the board back in build mode. */
function glRunFrame() {
  if (!GLR.on) return; try { glRunFrame1(); } catch (e) { try { console.warn('Simulator run stopped:', e); } catch (_) {} GLR.done = true; glBackToBuild(); toast('The simulator stopped. You are back to building.'); }
}
function glRunFrame1() {
  if (!GLR.on) return; const cv = GLB.cv; if (!cv || !cv.isConnected) { GLR.on = false; return; }
  const t = (performance.now() - GLR.t0) / 1000 * (GLR.speed || 1), S = glSceneAt(t), res = GLR.res, g = S.ground; glSize(); const c = fit(cv, GLV.LW, GLV.LH);
  const plats = res.plats.map(p => S.sink[p.id] ? Object.assign({}, p, { top: p.top - S.sink[p.id] * (p.top - p.base) * 0.5, over: true }) : p);
  const ev = Object.assign({}, res, { plats, ground: g, legs: res.legs.map(l => Object.assign({}, l, { faults: S.bad === l.id ? (l.faults.length ? l.faults : ['x']) : [] })) });
  const shipPx = { x: glSX(S.ship.x), y: glSY(S.ship.y + 2) };
  glDrawWorld(c, { rig: GLR.rig, ev, ground: g, ghost: null, ship: S.shipGone ? null : Object.assign({}, S.ship, { dmg: Math.min(100, S.ship.dmg) }), smoo: S.smoo, rock: !S.rockGone, t,
    hz: S.zone || null, hzLabel: S.zone ? 'The next machine needed to start in here' : '',
    run: { on: true, blown: S.blown, rockGone: S.rockGone, rockX: S.rockX, rockY: S.rockY, rockRot: S.rockRot, hook: S.hook, tilt: S.tilt, spin: S.spin, rope: S.rope,
      beam: S.beam ? { x: shipPx.x - 3 * glU(), y: shipPx.y + 2.4 * glU(), x2: shipPx.x + 3 * glU(), y2: shipPx.y + 2.4 * glU() } : null,
      fx: (c2, tt) => glFx(c2, S, tt) } });
  if (t > GLR.total + 0.1 && !GLR.done) { GLR.done = true; if (GLR.mode === 'test') glFinishTest(); else glFinishRun(); }
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
function glStartRun(mode) {
  if (GLR.on) return; mode = mode === 'launch' ? 'launch' : 'test';
  const st = glState(); GLR.mode = mode; GLR.rig = JSON.parse(JSON.stringify(GLB.rig)); GLR.res = glEvaluate(GLR.rig, { hints: st.hints || 0, maths: mode === 'launch' });
  GLR.pred = null; GLR.work = mode === 'launch' && typeof glwSnapshot === 'function' ? glwSnapshot() : null; GLR.speed = mode === 'test' && !RMOTION ? 3 : 1;
  GLR.beats = glBuildBeats(GLR.res, GLR.rig, { test: mode === 'test' }); GLR.total = GLR.beats.reduce((a, b) => a + b.dur, 0); GLR.t0 = performance.now(); GLR.on = true; GLR.done = false;
  { const rc = $('#glRunCtl'); if (rc) { rc.hidden = false; rc.querySelector('[data-gr=skip]').hidden = false; rc.querySelector('[data-gr=edit]').hidden = mode === 'launch'; } }
  GLB.sel = null; glCloseMenu(); $('#glSkip').hidden = false; $('#glBack').hidden = true; $('#glRun').disabled = true; $('.glboard').classList.add('running');
  $('#glRes').innerHTML = ''; $('.glarea').classList.add('running'); GLB.cv.scrollIntoView({ block: 'nearest', behavior: RMOTION ? 'auto' : 'smooth' });
  cancelAnimationFrame(GLB.raf); GLR.raf = requestAnimationFrame(glRunFrame);   // started first, so a problem in the panels below can never leave the board stuck
  try { if (typeof glwSendState === 'function') glwSendState(); if (typeof glGuidePaint === 'function') glGuidePaint(); } catch (e) { try { console.warn(e); } catch (_) {} }
}
/* a simulator test is over: each leg worked or failed, in words, with no numbers. It saves no score, but it counts as having tried (attempting is enough to move on). */
function glTestLines(res) {
  const L = [], stop = res.stop;
  res.legs.forEach((l, i) => { const n = i + 1;
    if (l.skipped) L.push([`Leg ${n}: not reached`, 0]);
    else if (l.faults.length) L.push([`Leg ${n}: the machine can't work as built`, 0]);
    else if (!l.roped) L.push([`Leg ${n} isn't roped to the Gumdrop`, 0]);
    else if (stop && stop.why === 'collapse' && stop.leg === i) L.push([`Leg ${n}: a platform buckled under the load`, 0]);
    else if (l.pull > 180 + 1e-9) L.push([`Leg ${n}: far too heavy, even with the thrusters`, 0]);
    else if (l.pull > GL.pullOk + 1e-9) L.push([`Leg ${n}: too hard for Smooshy`, 0]);
    else L.push([`Leg ${n}: worked`, 1]); });
  if (!res.legs.length) L.push(['No machine is ready to lift the Gumdrop', 0]);
  else if (stop && stop.why === 'gap') L.push([`After leg ${stop.leg}, the next machine isn't in the glowing box`, 0]);
  const bo = res.boulder; L.push([bo.how ? (bo.ok ? 'The boulder rolls free' : 'The boulder is still stuck') : 'The boulder is still stuck', bo.ok ? 1 : 0]);
  if (res.bShip) L.push(['Dynamite went off too close to the Gumdrop', 0]);
  { const sh = glShort(res); L.push([res.arrived ? 'The Gumdrop reached the tractor beam' : 'The Gumdrop did not reach the tractor beam yet.' + (sh ? ' ' + glShortText(sh.up, sh.to) : ''), res.arrived ? 1 : 0]); }
  return L;
}
function glFinishTest() {
  const res = GLR.res, st = glState(), lines = glTestLines(res), lastTest = { lines, arrived: !!res.arrived, at: Date.now() };
  GLB.save({ id: GLB.mid }, { tried: true, tests: (st.tests || 0) + 1, lastTest });
  $('#glSkip').hidden = true; $('#glBack').hidden = false; glShowTest(lastTest); glRunPaint(); if (typeof glGuidePaint === 'function') glGuidePaint();
  { const rc = $('#glRunCtl'); if (rc) rc.querySelector('[data-gr=skip]').hidden = true; }
  setTimeout(() => { if (GLR.on && GLR.mode === 'test') glBackToBuild(); }, RMOTION ? 0 : 1200);   // the end picture stays for a moment, then the board is yours again
  const r = $('#glRes'); if (r) r.scrollIntoView({ block: 'nearest', behavior: RMOTION ? 'auto' : 'smooth' });
}
function glShowTest(t) {
  const host = $('#glRes'); if (!host || !t) return;
  host.innerHTML = `<div class="glstamp test"><b>Simulator test</b> <span>no score</span></div>
    <ul class="gltest">${t.lines.map(([x, ok]) => `<li class="${ok ? 'ok' : 'no'}"><span class="box">${ok ? '✓' : '✗'}</span>${esc(x)}</li>`).join('')}</ul>
    <p class="glnote">The simulator shows no numbers. Work them out in your route strip, then press Send to GASA.</p>`;
}
/* the run is over: save it (best run counts), show the receipt, then the ending card if there is one */
function glFinishRun() {
  const res = GLR.res, sum = glSummary(res), st = glState(), n = (st.runs || 0) + 1, cur = { total: sum.score, hardest: sum.hardest };
  const firstRescue = !!res.arrived && !st.firstDone;   // read before the save below, which updates this same state object
  const prevBest = st.bestRun ? { total: st.bestRun.sum.score, hardest: st.bestRun.sum.hardest } : null, better = glBetter(cur, prevBest);
  const patch = { runs: n, tried: true, last: sum, lastAt: Date.now(), lastPred: null, lastDmg: res.arrived ? 0 : sum.dmg.total, boulderGone: false, pred: null };
  if (better) patch.bestRun = { rig: GLR.rig, sum, pred: null, work: GLR.work, at: Date.now() };
  patch.best = Math.max(st.best || 0, sum.score || 0);
  if (res.arrived && !st.firstDone) patch.firstDone = Date.now();
  GLB.save({ id: GLB.mid }, patch);
  if (better && typeof rigSnapshot === 'function') rigSnapshot();
  { const rc = $('#glRunCtl'); if (rc) rc.hidden = true; }
  $('#glSkip').hidden = true; $('#glBack').hidden = false; glShowResult(sum, null, better && n > 1); glRunPaint();
  if (typeof glShowEnding === 'function') glShowEnding(sum, { first: firstRescue, better });
}
function glBackToBuild() {
  GLR.on = false; { const rc = $('#glRunCtl'); if (rc) rc.hidden = true; } cancelAnimationFrame(GLR.raf); $('#glBack').hidden = true; $('.glboard').classList.remove('running'); $('.glarea').classList.remove('running'); glRunPaint(); glLoop();
}
function glShowResult(sum, pred, newBest) {
  const host = $('#glRes'); if (!host || !sum) return; const E = GL_END[sum.ending], f1 = v => fmt(v, 1), n0 = v => Math.round(v).toLocaleString('en-GB');
  const P = sum.pts, rows = sum.legs.map((l, i) => `<tr class="${l.stopped ? 'stop' : ''}"><td>${i + 1}</td><td>${esc(l.name)}</td><td>${f1(l.rise)} m</td><td>${fmt(l.ma, 1)}</td><td><b>${f1(l.pull)} N</b>${l.pull > 60 + 1e-9 ? ' 🔥' : ''}</td><td>${n0(l.hand)} m</td><td>${n0(l.work)} J</td></tr>`).join('');
  const pl = pred && sum.legs[pred.leg] ? `<p class="glpredfb">You predicted <b>${f1(pred.value)} N</b> for leg ${pred.leg + 1}. Smooshy's pull on it was <b>${f1(sum.legs[pred.leg].pull)} N</b>. ${Math.abs(pred.value - sum.legs[pred.leg].pull) <= Math.max(1, sum.legs[pred.leg].pull * 0.05) ? 'Spot on, engineer!' : 'Compare your working with the receipt below to see where the numbers split.'}</p>` : '';
  const pt = (lab, got, max, note) => `<li class="${got === max ? 'ok' : ''}"><span class="box">${got === max ? '✓' : ''}</span>${lab}: <b>${got} of ${max}</b>${note ? ` <small>${note}</small>` : ''}</li>`;
  host.innerHTML = `<div class="glstamp ${sum.ending}"><b>${E[0]}</b> <span>${sum.score != null ? `${sum.score} of ${sum.max || 10}` : 'No score yet'}</span>${newBest ? ' <em>New best run!</em>' : ''}</div><p>${E[1]}${sum.stop ? ' ' + glStopText(sum.stop, sum.stopLeg) : ''}${sum.up != null && !sum.arrived ? ' ' + glShortText(sum.up, sum.toLine) : ''}</p>${pl}
    ${rows ? `<div class="gltab"><table><thead><tr><th>Leg</th><th>Machine</th><th>Rise</th><th>Total MA</th><th>Pull</th><th>Hand travel</th><th>Work</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="glnote">Work receipt: each leg's work = ${n0(sum.load)} N × its rise. Change the machines and only the pull and hand travel change; the work only changes when the rise does.</p>` : ''}
    <ul class="glsums"><li>Hand travel: <b>${n0(sum.hand)} m</b> of 1,500 m oxygen</li><li>Sugar crystals: <b>${sum.cost}</b> of 475</li><li>Final crest height: <b>${f1(sum.crest)} m</b></li><li>Total work: <b>${n0(sum.work)} J</b></li>
      <li>Ship damage: <b>${f1(sum.dmg.total)}%</b>${sum.dmg.total ? ` <small>(thrusters ${f1(sum.dmg.t)}%, rock ${sum.dmg.r}%, blasts ${sum.dmg.b}%)</small>` : ''}</li><li>Boulder: <b>${{ lever: 'levered off', jack: 'jacked off', winch: 'winched away', blast: 'blasted', stuck: 'still jammed on', left: 'left on' }[sum.boulder]}</b></li></ul>
    ${sum.score != null ? `<ul class="objs glpts">${pt('Smooshy\'s hardest pull', P.pull, 5, `${f1(sum.hardest)} N. 54 to 60 N earns 5.`)}${pt('Ship condition', P.cond, 2)}${pt('Boulder cleared', P.boulder, 1)}${pt('Oxygen: 1,500 m or less', P.oxy, 1, P.oxy ? '' : 'GASA sent extra oxygen.')}${pt('Budget: 475 crystals or less', P.budget, 1, P.budget ? '' : 'GASA sent extra crystals.')}${P.maths != null ? pt('Maths approved by GASA', P.maths, 1) : ''}${sum.hintCost ? `<li>Hints used: <b>${sum.hints || sum.hintCost + 1}</b> (the first is free): <b>−${sum.hintCost}</b></li>` : ''}</ul>` : ''}`;
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
