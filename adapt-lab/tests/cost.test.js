// Tests for the cost of change (src/js/16-cost.js). Run: node adapt-lab/tests/cost.test.js
'use strict';
const assert = require('assert');
const C = require('../src/js/16-cost.js');
const M = require('./_old_model_loader.js');

let passed = 0;
function test(name, fn) { fn(); passed++; console.log('  ok  ' + name); }

// every trait and every option the old designer offers
const ROWS = []; M.A_SECTIONS.forEach(sec => sec.rows.forEach(r => ROWS.push(r)));
const CHOICE = ROWS.filter(r => !r.num).map(r => ({ k: r.k, opts: r.opts.map(o => String(o[0])) }));
const DEF = { ...M.DEF_A };
const UNREACHABLE_FROM_DEFAULT = { cov: ['exo'], breathe: ['tubes'], legs: ['6'] };   // the arthropod branch

// a small seeded random number maker, so failures can be repeated
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function randomDesign(R) {
  const t = { ...DEF };
  CHOICE.forEach(c => { t[c.k] = c.opts[Math.floor(R() * c.opts.length)]; });
  C.NUM.forEach(k => { t[k] = Math.floor(R() * 101); });
  return t;
}

test('every trait option in the old designer is known to the cost maps', () => {
  CHOICE.forEach(c => {
    const map = C.NEIGHBOURS[c.k]; assert(map, 'no neighbour map for ' + c.k);
    const known = new Set((map.values || []).concat(...map.links.map(l => [l[0], l[1]])));
    c.opts.forEach(o => assert(known.has(o), `option ${c.k}=${o} is missing from the neighbour map`));
  });
  ROWS.filter(r => r.num).forEach(r => assert(C.NUM.includes(r.k), 'number trait missing: ' + r.k));
  M.A_SLIDERS.forEach(s => assert(C.NUM.includes(s.k), 'slider trait missing: ' + s.k));
});

test('no change costs nothing', () => {
  const R = rng(1);
  for (let i = 0; i < 200; i++) { const t = randomDesign(R); const c = C.cost(t, { ...t }); assert.strictEqual(c.total, 0); assert.strictEqual(c.items.length, 0); }
  assert.strictEqual(C.optionCost(DEF, 'shape', DEF.shape), 0);
});

test('the cost is the same in both directions', () => {
  const R = rng(2);
  for (let i = 0; i < 2000; i++) { const a = randomDesign(R), b = randomDesign(R); assert.strictEqual(C.cost(a, b).total, C.cost(b, a).total); }
});

test('a bigger change along the same path never costs less', () => {
  // number traits: moving further never gets cheaper
  C.NUM.forEach(k => { for (let from = 0; from <= 100; from += 20) { let last = 0; for (let to = from; to <= 100; to++) { const p = C.optionCost({ ...DEF, [k]: from }, k, to); assert(p >= last, `${k} ${from}→${to}`); last = p; } } });
  // choice traits: each further step along a shortest path costs more
  CHOICE.forEach(c => c.opts.forEach(a => c.opts.forEach(b => {
    const path = C.pathOf(c.k, a, b, { cov: 'exo' }, { cov: 'exo' }); if (!path) return;
    let last = -1; path.forEach(v => { const p = C.optionCost({ ...DEF, cov: c.k === 'cov' ? a : 'exo', [c.k]: a }, c.k, v); if (isFinite(p)) { assert(p > last || v === a, `${c.k} ${a}→${v}`); last = p; } });
  })));
});

test('going by way of a third design is never cheaper than going direct', () => {
  const R = rng(3);
  for (let i = 0; i < 4000; i++) {
    const a = randomDesign(R), b = randomDesign(R), c = randomDesign(R);
    const ac = C.cost(a, c).total, ab = C.cost(a, b).total, bc = C.cost(b, c).total;
    assert(ac <= ab + bc, `direct ${ac} is dearer than ${ab} + ${bc}`);
  }
  // and for designs that differ in only a few traits, where the sums are small
  for (let i = 0; i < 4000; i++) {
    const a = randomDesign(R); const b = { ...a }, c = { ...a };
    [b, c].forEach(t => { for (let j = 0; j < 3; j++) { const ch = CHOICE[Math.floor(R() * CHOICE.length)]; t[ch.k] = ch.opts[Math.floor(R() * ch.opts.length)]; const n = C.NUM[Math.floor(R() * C.NUM.length)]; t[n] = Math.floor(R() * 101); } });
    assert(C.cost(a, c).total <= C.cost(a, b).total + C.cost(b, c).total);
  }
});

test('from the default animal every option has a price, except the insect and crab branch', () => {
  CHOICE.forEach(c => c.opts.forEach(o => {
    const p = C.optionCost(DEF, c.k, o); const blocked = (UNREACHABLE_FROM_DEFAULT[c.k] || []).includes(o);
    if (blocked) { assert.strictEqual(p, Infinity, `${c.k}=${o} should not be reachable from a mammal`); assert.strictEqual(C.reachable(DEF, c.k, o), false); }
    else assert(Number.isFinite(p) && p >= 0, `${c.k}=${o} has no price`);
    if (o !== String(DEF[c.k]) && !blocked) assert(p >= 1, `${c.k}=${o} is a change but costs nothing`);
  }));
});

test('an insect can become a crab, but a mammal cannot get air tubes', () => {
  const insect = { ...DEF, ...C.PLANS.insect }, crab = { ...DEF, ...C.PLANS.crab };
  assert(Number.isFinite(C.cost(insect, crab).total));
  assert.strictEqual(C.optionCost(insect, 'breathe', 'gills'), C.WEIGHTS.plan);
  assert.strictEqual(C.optionCost({ ...DEF, breathe: 'gills' }, 'breathe', 'tubes'), Infinity);
});

test('optionCost agrees with cost, and items are listed most expensive first', () => {
  const R = rng(4);
  for (let i = 0; i < 500; i++) {
    const a = randomDesign(R), b = randomDesign(R); const c = C.cost(a, b);
    for (let j = 1; j < c.items.length; j++) assert(c.items[j - 1].points >= c.items[j].points);
    if (Number.isFinite(c.total)) assert.strictEqual(c.items.reduce((s, x) => s + x.points, 0), c.total);
    c.items.forEach(x => { assert(x.label && x.why, 'item needs a label and a reason'); });
    const ch = CHOICE[Math.floor(R() * CHOICE.length)], v = ch.opts[Math.floor(R() * ch.opts.length)];
    assert.strictEqual(C.optionCost(a, ch.k, v), C.cost(a, { ...a, [ch.k]: v }).total);
  }
});

test('prices follow the plan: number 1 per 10, behaviour 1, looks 1, body 2, defence 3, body plan 4 a step', () => {
  assert.strictEqual(C.optionCost(DEF, 'size', DEF.size + 20), 2);
  assert.strictEqual(C.optionCost(DEF, 'size', DEF.size + 1), 1);
  assert.strictEqual(C.optionCost({ ...DEF, activity: 'day' }, 'activity', 'night'), 2);
  assert.strictEqual(C.optionCost({ ...DEF, shape: 'round' }, 'shape', 'stream'), 4);     // round → long → streamlined
  assert.strictEqual(C.optionCost({ ...DEF, shape: 'tall' }, 'shape', 'stream'), 6);      // tall → round → long → streamlined
  assert.strictEqual(C.optionCost({ ...DEF, defence: 'none' }, 'defence', 'poison'), 3);
  assert.strictEqual(C.optionCost({ ...DEF, cov: 'fur' }, 'cov', 'feathers'), 8);         // fur → scales → feathers
  assert.strictEqual(C.BUDGET_PER_ERA, 10);
});

test('a whole move between neighbouring body plans costs 8 points or more', () => {
  C.PLAN_LINKS.forEach(([a, b]) => { const p = C.planMoveCost(a, b); assert(p >= 8 || (a === 'insect' && b === 'crab'), `${a} to ${b} costs only ${p}`); assert(Number.isFinite(p)); });
  assert.strictEqual(C.planMoveCost('mammal', 'lizard'), 8);
  assert.strictEqual(C.planMoveCost('mammal', 'insect'), Infinity);
  assert.strictEqual(C.planSteps('fish', 'bird'), 3);
  assert.strictEqual(C.planSteps('mammal', 'crab'), Infinity);
});

test('real animals are sorted into the right body plan', () => {
  const want = { 'arctic-hare': 'mammal', camel: 'mammal', 'snowy-owl': 'bird', ostrich: 'bird', 'thorny-devil': 'lizard', 'wood-frog': 'frog', mackerel: 'fish', trout: 'fish', locust: 'insect', crab: 'crab', seal: 'mammal' };
  Object.keys(want).forEach(k => assert.strictEqual(C.planOf(M.PRESETS[k].t), want[k], k));
});

console.log(`cost: ${passed} tests passed`);
