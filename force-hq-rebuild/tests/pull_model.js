/* The rescue on real pulling physics (src/js/4q-pull.js): number tests, no browser.  Run from force-hq-rebuild:  node tests/pull_model.js
   Loads the model files straight from src/, so it tests exactly what the app will run. */
const fs = require('fs'), path = require('path'), R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const src = 'const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const fmt=(v,dp=1)=>String(Math.round(v*10**dp)/10**dp);\n' + R('src/js/4f-gummylift.js') + '\n' + R('src/js/4q-pull.js') + '\n' + R('tests/rescue_routes.js') +
  '\nreturn { GL, GP, GL_MAX, gpEvaluate, glEvaluate, gpWorld, gpSolid, glAt, glGround, ROUTES, EXPECT, BL, CREST, chainOf, rig };';
const M = new Function(src)(), { GL, GP, gpEvaluate, ROUTES, EXPECT, BL, CREST } = M;
let n = 0; const fails = [];
const chk = (name, cond, extra) => { n++; if (!cond) { fails.push(name); console.log('FAIL ' + name, extra === undefined ? '' : JSON.stringify(extra)); } };
const near = (a, b, t) => Math.abs(a - b) <= (t == null ? 0.06 : t);
/* a drag anchor: a pulley block and winches standing at x, roped to the Gumdrop */
const anchor = (id, x, ropes, ws) => { const parts = [{ id, type: 'block', ropes, x, y: 0 }], cables = [{ a: id, b: 'ship' }]; let prev = id; ws.forEach((r, i) => { parts.push({ id: id + 'w' + i, type: 'winch', ratio: r, x, y: 0 }); cables.push({ a: prev, b: id + 'w' + i }); prev = id + 'w' + i; }); return { parts, cables }; };
const join = (...rs) => ({ v: 2, parts: [].concat(...rs.map(r => r.parts)), cables: [].concat(...rs.map(r => r.cables || [])) });
const lever = { parts: BL, cables: [] };

/* 1. The routes from the old model still give the textbook numbers */
for (const k in EXPECT) { const [pull, hand, score] = EXPECT[k], r = gpEvaluate(ROUTES[k]());
  chk(`${k}: hardest pull ${pull}`, near(r.hardest, pull), r.hardest); chk(`${k}: hand travel ${hand}`, near(r.hand, hand, 1), r.hand);
  chk(`${k}: score ${score}`, r.score.total === score, [r.score, r.stop]); }
{ const r = gpEvaluate(ROUTES.top()); chk('top: work 75,600 J', near(r.work, 75600, 1), r.work); chk('top: no hull damage, spotless', r.dmg.total === 0 && r.score.ending === 'spotless', r.dmg);
  chk('top: both legs are simple (students can do the maths)', r.legs.every(l => l.simple && !l.given), r.legs.map(l => l.simple)); chk('top: ramp leg MA 112', near(r.legs[0].ma, 112), r.legs[0].ma); }
{ const r = gpEvaluate(ROUTES.long()); chk('long: work 94,500 J', near(r.work, 94500, 1), r.work); }
{ const r = gpEvaluate(ROUTES.crane()); chk('crane route: crane, ramp, lever in that order', r.legs.map(l => l.type).join() === 'crane,ramp,lever', r.legs.map(l => l.type)); chk('crane route: spotless', r.dmg.total === 0, r.dmg);
  chk('crane route: the Gumdrop comes off the hook onto the platform beside it', r.legs[1].path.some(q => q.k === 'slide'), r.legs[1].segs); }
{ const r = gpEvaluate(ROUTES.rock()); chk('rock left on: 25% plus thrusters', near(r.dmg.total, 50, 1e-6), r.dmg); }
{ const r = gpEvaluate(ROUTES.dynb()); chk('boulder blast near the ship: 15%', near(r.dmg.total, 15, 1e-6), r.dmg); }
{ const g = ROUTES.top(); g.parts = g.parts.filter(p => p.id !== 'd1'); const r = gpEvaluate(g); chk('no crest blast: top route stops short of the beam', !r.arrived && r.stop.why === 'gap', r.stop); }
{ const r = gpEvaluate(ROUTES.none()); chk('nothing roped: why none', r.stop.why === 'none', r.stop); }

/* 2. Tom's playtest, 9 Nov: the things that should now work */
{ // a ramp whose foot is 8 m from the Gumdrop: it is dragged to the foot over rough ground, at a cost
  const g = M.rig([[{ id: 'rA', type: 'ramp', x1: 22, y1: 0, L: 17.65, rise: 6 }, 4, [7]]], BL), r = gpEvaluate(g), l = r.legs[0];
  chk('far ramp: the leg runs (no "wrong place")', l && !l.stopped && near(l.end.y, 6, 0.01), r.stop);
  chk('far ramp: dragging on flat crater ground needs 2,100 N', l.segs.some(s => s.k === 'ground' && near(s.peak, 2100, 1) && near(s.len, 5, 0.01)), l.segs); chk('far ramp: first 3 m is a free nudge', l.segs[0].k === 'nudge' && near(l.segs[0].len, 3, 0.01), l.segs);
  chk('far ramp: hand travel includes the drag (28 × 22.65 m)', near(l.hand, 28 * 22.65, 1), l.hand);
  chk('far ramp: 5 m of dragging scrapes the hull 6%', near(l.scrape, 6, 0.05), l.scrape); chk('far ramp: not a simple leg, so the strip gives the numbers', l.given === true && !l.simple); }
{ const g = M.rig([[{ id: 'rA', type: 'ramp', x1: 22, y1: 0, L: 24, rise: 6 }, 4, [7]]], BL), r = gpEvaluate(g); chk('a far ramp that cuts through the ground: the run says it is broken', r.stop.why === 'broken' && r.stop.faults.includes('ground'), r.stop); }
{ // crane lifts onto a platform; the ramp stands on the platform (Tom: "it blocks the Gumdrop")
  const g = M.rig([[{ id: 'cr', type: 'crane', x: 14, rise: 4, across: 2.5 }, 4, [7, 4]], [{ id: 'rA', type: 'ramp', x1: 17.5, y1: 4, L: 24, rise: 6 }, 4, [7]]], BL.concat([{ id: 'p1', type: 'platform', size: 'M', x: 16.5, h: 4 }, { id: 'p2', type: 'platform', size: 'L', x: 41, h: 4 }]));
  const r = gpEvaluate(g); chk('ramp on the platform: both legs run', r.legs.length === 2 && !r.stop || (r.stop && r.stop.why === 'gap'), r.stop);
  chk('ramp on the platform: no damage, pull 56.25', r.dmg.total === 0 && near(r.hardest, 56.25), [r.dmg, r.hardest]); chk('ramp on the platform: ends 10 m up', near(r.final.y, 10, 0.01), r.final); }
{ // crane sets the Gumdrop on a platform; the ramp stands on the ground beside the platform: it rolls off the edge, falls 4 m, and the ramp still takes it
  const g = M.rig([[{ id: 'cr', type: 'crane', x: 14, rise: 4, across: 2.5 }, 4, [7, 4]], [{ id: 'rA', type: 'ramp', x1: 20, y1: 0, L: 8.04, rise: 0.8 }, 4, [7]]], BL.concat([{ id: 'p1', type: 'platform', size: 'M', x: 16.5, h: 4 }]));
  const r = gpEvaluate(g), l = r.legs[1]; chk('ramp beside the platform: the leg runs', l && !l.stopped, r.stop); chk('ramp beside the platform: a 4 m fall costs 32%', l && near(l.fall, 32, 0.1), l && l.fall); }
{ // a platform over the boulder lever is fine (the model has no rule against it)
  const g = ROUTES.top(); g.parts.push({ id: 'pz', type: 'platform', size: 'S', x: 19.5, h: 3 }); const r = gpEvaluate(g); chk('platform over the lever: boulder still cleared', r.boulder.ok, r.boulder); }
{ // "just build a load of pulleys and drag the Gumdrop to the ship"
  const r = gpEvaluate(join(anchor('a', 77, 4, [10, 10]), lever));
  chk('drag-only: reaches the beam', r.arrived, r.stop); chk('drag-only: one leg, a drag', r.legs.length === 1 && r.legs[0].type === 'drag');
  chk('drag-only: hull wrecked', r.dmg.total >= GP.wreck && r.score.ending === 'wrecked', r.dmg); chk('drag-only: scores 3 or less', r.score.total <= GP.wreckCap, r.score);
  chk('drag-only: way over the oxygen', r.hand > GL.oxy * 5 && r.score.pts.oxy === 0, r.hand); chk('drag-only: Smooshy can manage the pull with MA 400', r.hardest <= 60, r.hardest);
  chk('drag-only: hardest on the steep face under the crest', r.legs[0].forceAt.x > 66 && r.legs[0].forceAt.x <= 68.01, r.legs[0].forceAt); }

/* 3. Walls, bumps, falls */
{ const r = gpEvaluate(join(anchor('a', 30, 4, [10, 10]), lever, { parts: [{ id: 'p', type: 'platform', size: 'M', x: 24, h: 3 }] }));
  chk('a 3 m platform in the way is a wall', r.stop && r.stop.why === 'wall' && near(r.final.x, 22, 0.6), [r.stop, r.final]); }
{ const r = gpEvaluate(join(anchor('a', 30, 4, [10, 10]), lever, { parts: [{ id: 'p', type: 'platform', size: 'M', x: 20, h: 0.8 }] })), l = r.legs[0];
  chk('a 0.8 m platform is a bump: dragged over', !r.stop || r.stop.why !== 'wall', r.stop); chk('the bump dents the hull', l.bump > 4 && l.bump < 6, l.bump);
  chk('the bump needs a bigger pull than flat ground', l.force > 2100 * 1.5 && l.force < 6300, l.force); }
{ const r = gpEvaluate(join(anchor('a', 50, 4, [10, 10]), lever, { parts: [{ id: 'd', type: 'dyn', big: true, x: 41 }] }));
  chk('a big blast hole in the shelf: the Gumdrop slides in, and the far side is a wall', r.stop && r.stop.why === 'wall' && r.final.x > 41 && r.final.x < 44 && r.final.y < 4.5, [r.stop, r.final]); }
{ const r = gpEvaluate(join(anchor('a', 60, 4, [4]), lever)), l = r.legs[0];
  chk('weak drag: stops where the pull would pass 180 N', r.stop && r.stop.why === 'heavy' && r.final.x > 20 && r.final.x < 30, [r.stop, r.final]); chk('weak drag: it got part of the way first', l.dist >= 4.9, l.dist); }
{ // a crane with Move across 0 holds the Gumdrop; a far-off anchor pulls it off the hook and it falls
  const g = join(M.rig([[{ id: 'cr', type: 'crane', x: 14, rise: 4 }, 4, [7, 4]]], BL), anchor('a', 30, 4, [10, 10])), r = gpEvaluate(g), l = r.legs[1];
  chk('pulled off the hook with nothing under it: a 4 m fall', l && near(l.fell, 4, 0.01) && near(l.fall, 32, 0.1), l && [l.fell, l.fall]); }
{ const g = M.rig([[{ id: 'cr', type: 'crane', x: 14, rise: 3, across: 6 }, 4, [7, 4]]], BL.concat([{ id: 'p', type: 'platform', size: 'S', x: 18, h: 5 }])), r = gpEvaluate(g);
  chk('the trolley cannot carry the Gumdrop through a taller platform', r.stop && r.stop.why === 'wall', r.stop); }
{ const g = M.rig([[{ id: 'cr', type: 'crane', x: 14, rise: 6, across: 4 }, 4, [7, 4]]], BL.concat([{ id: 'p', type: 'platform', size: 'M', x: 18, h: 4 }])), r = gpEvaluate(g);
  chk('the trolley lowers the Gumdrop onto a platform below it, no damage', near(r.final.y, 4, 0.01) && r.dmg.total === 0 && !r.held, [r.final, r.dmg]); }
{ const g = M.rig([[{ id: 'cr', type: 'crane', x: 20, rise: 4, across: 2 }, 4, [7, 4]]], BL), r = gpEvaluate(g), l = r.legs[0];
  chk('a crane 6 m away drags the Gumdrop under its hook first', l.segs.some(s => s.k === 'ground') && near(l.scrape, 3.6, 0.05) && !l.simple, [l.segs, l.scrape]); }
{ const g = ROUTES.crane(); g.parts.find(p => p.id === 'p2').size = 'S'; const r = gpEvaluate(g); chk('a small platform under the ship, lever and add-ons gives way', r.stop && r.stop.why === 'collapse' && r.stop.plat === 'p2', r.stop); }
{ const g = { parts: [{ id: 'r', type: 'ramp', x1: 16, y1: 0, L: 30, rise: 16 }], cables: [{ a: 'r', b: 'ship' }] }, r = gpEvaluate(g); chk('a too-steep ramp next to the ship stops the run as broken', r.stop.why === 'broken' && r.stop.faults.includes('steep'), r.stop); }
{ const g = { parts: [{ id: 'r', type: 'ramp', x1: 16, y1: 0, L: 24, rise: 6 }], cables: [] }, r = gpEvaluate(g); chk('a ramp with no rope: why norope', r.stop.why === 'norope' && r.stop.unroped[0] === 'r', r.stop); }
{ const g = { parts: [{ id: 'j', type: 'jack', x: 14, rise: 2 }].concat(BL), cables: [] }, r = gpEvaluate(g); chk('screw jack: MA 120, 52.5 N, 240 m', near(r.legs[0].pull, 52.5, 1e-6) && near(r.legs[0].hand, 240, 1e-6), r.legs[0]); }

/* 4. Energy and score bookkeeping */
{ const r = gpEvaluate(join(anchor('a', 77, 4, [10, 10]), lever)), l = r.legs[0];
  chk('drag: hand travel = rope MA × distance moved', near(l.hand, l.ropeMA * l.dist, 0.5), [l.hand, l.dist]); chk('drag: more work than just lifting 8 m (friction)', l.work > 6300 * 8 * 2, l.work);
  chk('drag: effort × hand travel is never less than the work done', l.pull * l.hand >= l.work - 1, [l.pull * l.hand, l.work]); }
{ const r = gpEvaluate(ROUTES.top(), { hints: 3 }); chk('hints: first free, then -1 each', r.score.total === 8, r.score); }
{ let bad = 0, runs = 0; const rnd = (() => { let a = 7; return () => (a = (a * 16807) % 2147483647) / 2147483647; })();   // 300 random rigs: nothing throws, nothing goes missing
  for (let i = 0; i < 300; i++) { const parts = BL.slice(), cables = [];
    for (let k = 0; k < 1 + Math.floor(rnd() * 5); k++) { const t = rnd(), id = 'q' + k, x = Math.round(rnd() * 70 * 4) / 4 + 8;
      if (t < 0.3) { const g0 = M.glAt(M.glGround({ parts }).g, x); parts.push({ id, type: 'ramp', x1: x, y1: g0, L: 6 + Math.round(rnd() * 24), rise: 1 + Math.round(rnd() * 8) }); cables.push({ a: id, b: 'ship' }); }
      else if (t < 0.5) { parts.push({ id, type: 'crane', x, rise: 1 + Math.round(rnd() * 7), across: Math.round((rnd() * 16 - 8) * 2) / 2 }); cables.push({ a: id, b: 'ship' }); parts.push({ id: id + 'b', type: 'block', ropes: 4, x, y: 0 }, { id: id + 'w', type: 'winch', ratio: 10, x, y: 0 }); cables.push({ a: id, b: id + 'b' }, { a: id + 'b', b: id + 'w' }); }
      else if (t < 0.7) parts.push({ id, type: 'platform', size: 'SML'[Math.floor(rnd() * 3)], x, h: Math.round(rnd() * 16) / 2 });
      else if (t < 0.8) parts.push({ id, type: 'dyn', big: rnd() < 0.5, x });
      else if (t < 0.9) parts.push({ id, type: rnd() < 0.5 ? 'lever' : 'jack', x, arm: 2, rise: 2, dir: 1 });
      else { const a = anchor(id, x, 4, [10, 10]); parts.push(...a.parts); cables.push(...a.cables); } }
    try { const r = gpEvaluate({ v: 2, parts, cables }); runs++; const g = r.ground;
      if (!isFinite(r.final.x) || !isFinite(r.final.y) || r.final.x < 0 || r.final.x > GL.W || (!r.held && r.final.y < M.glAt(g, r.final.x) - 0.5) || r.legs.some(l => !isFinite(l.pull) || !isFinite(l.hand) || l.work < -1e-6 || l.pull * l.hand < l.work - 1) || (!r.arrived && !r.stop)) { bad++; if (bad < 4) console.log('odd rig', JSON.stringify({ parts, cables }), JSON.stringify([r.final, r.stop])); } }
    catch (e) { bad++; if (bad < 4) console.log('threw', e.stack.split('\n').slice(0, 3).join(' | '), JSON.stringify({ parts, cables })); } }
  chk('300 random rigs: no errors, the Gumdrop never ends underground, energy adds up', bad === 0 && runs === 300, [bad, runs]); }
console.log(`${n - fails.length}/${n} pulling-model checks passed`); process.exit(fails.length ? 1 : 0);
