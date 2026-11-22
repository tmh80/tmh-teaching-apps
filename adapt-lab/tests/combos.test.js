// Tests for traits that work together and traits that clash (src/js/17-combos.js). Run: node adapt-lab/tests/combos.test.js
// Each row carries a demo: a design where the pair applies, and `alt`, one change that switches the pair off.
// The test scores both with the OLD model (plus apply() for the rows the old maths lacks) and checks that the
// survival bar named by the row moves the right way: up for "Works well together", down for "Clashes" (plan 5.3).
'use strict';
const assert = require('assert');
const C = require('../src/js/17-combos.js');
const M = require('./_old_model_loader.js');

let passed = 0;
function test(name, fn) { fn(); passed++; console.log('  ok  ' + name); }
const design = d => ({ ...M.DEF_A, ...d.t });
const bar = (t, bk, p) => C.apply(M.animalScores(t, bk), t, bk)[p];

test('there are at least 25 rows, each with a unique id, a demo and a known partner', () => {
  assert(C.COMBOS.length >= 25, 'only ' + C.COMBOS.length + ' rows');
  const ids = new Set();
  C.COMBOS.forEach(r => {
    assert(!ids.has(r.id), 'duplicate id ' + r.id); ids.add(r.id);
    assert(r.demo && r.demo.biome && r.demo.t && r.demo.alt, r.id + ' has no demo');
    if (r.opposite) assert(C.byId(r.opposite), r.id + ' names a partner that does not exist: ' + r.opposite);
    assert(r.inModel || typeof r.effect === 'number', r.id + ' is not in the model and has no effect');
  });
});

test('every chip names both traits and has one short sentence a Grade 6 student can read', () => {
  C.COMBOS.forEach(r => {
    assert(r.a && r.b && r.a !== r.b, r.id + ' must name two different traits');
    assert(/^[A-Z].*\.$/.test(r.text), r.id + ': the sentence must start with a capital and end with a full stop');
    const words = r.text.split(/\s+/).length;
    assert(words <= 14, `${r.id}: ${words} words is too long for a chip ("${r.text}")`);
    assert(!/[;:—]/.test(r.text), r.id + ': keep it to one simple sentence');
  });
});

test('each demo switches the pair on, and its one change switches it off', () => {
  C.COMBOS.forEach(r => {
    const B = C.biomeOf(r.demo.biome), t = design(r.demo), u = { ...t, ...r.demo.alt };
    assert(C.fires(r, t, B), r.id + ': the demo design does not trigger the pair');
    assert(!C.fires(r, u, B), r.id + ': the pair still applies after the one change');
    assert(C.find(t, r.demo.biome).some(c => c.id === r.id), r.id + ': find() does not list it');
  });
});

const moved = [];
test('every row moves its survival bar the right way (good up, clash down)', () => {
  C.COMBOS.forEach(r => {
    const t = design(r.demo), u = { ...t, ...r.demo.alt };
    const p = typeof r.pressure === 'function' ? r.pressure(t, C.biomeOf(r.demo.biome)) : r.pressure;
    const on = bar(t, r.demo.biome, p), off = bar(u, r.demo.biome, p);
    assert(typeof on === 'number' && typeof off === 'number', `${r.id}: no "${p}" bar`);
    if (r.good) assert(on > off, `${r.id} should help: ${p} bar ${on.toFixed(1)} with it, ${off.toFixed(1)} without`);
    else assert(on < off, `${r.id} should hurt: ${p} bar ${on.toFixed(1)} with it, ${off.toFixed(1)} without`);
    moved.push(`${r.id} ${p} ${Math.round(off)}→${Math.round(on)}`);
  });
});

test('rows already in the model add nothing; the others add exactly their effect', () => {
  C.COMBOS.forEach(r => {
    const t = design(r.demo), s = M.animalScores(t, r.demo.biome), p = typeof r.pressure === 'function' ? r.pressure(t, C.biomeOf(r.demo.biome)) : r.pressure;
    const others = C.find(t, r.demo.biome).filter(c => c.id !== r.id && !c.inModel && c.pressure === p).reduce((a, c) => a + c.effect, 0);
    const want = Math.max(0, Math.min(100, s[p] + others + (r.inModel ? 0 : r.effect)));
    assert(Math.abs(C.apply(s, t, r.demo.biome)[p] - want) < 1e-9, r.id + ': apply() added the wrong amount');
  });
});

test('apply() leaves the scores it was given unchanged, and lists what it used', () => {
  const r = C.byId('hide_small'), t = design(r.demo), s = M.animalScores(t, r.demo.biome), before = JSON.stringify(s);
  const out = C.apply(s, t, r.demo.biome);
  assert.strictEqual(JSON.stringify(s), before); assert(out.combosApplied.includes('hide_small'));
});

test('clashes are listed before good pairs', () => {
  const t = { ...M.DEF_A, escape: 'hide', size: 90, activity: 'night', eyes: 90 };
  const f = C.find(t, 'forest'); const firstGood = f.findIndex(c => c.good);
  assert(firstGood === -1 || f.slice(firstGood).every(c => c.good));
});

console.log(`combos.test: ${passed} tests passed`);
console.log('  bars (without → with the pair): ' + moved.join(', '));
