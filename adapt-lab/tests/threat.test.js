// Tests for the "biggest threat" sentence (src/js/19-threat.js). Run: node adapt-lab/tests/threat.test.js
'use strict';
const assert = require('assert'), path = require('path');
['00-util', '10-data', '11-model-animal', '12-model-plant', '13-hazards'].forEach(f => require(path.join(__dirname, '..', 'src', 'js', f + '.js')));
const M = globalThis.AdaptModel, T = require('../src/js/19-threat.js');
let passed = 0; const test = (n, f) => { f(); passed++; console.log('  ok  ' + n); };

test("Tom's case: a forest animal with spines and a fat layer overheats in summer, not 'too hot in the cold winter'", () => {
  const t = { ...M.DEF_A, defence: 'spines', fatWhere: 'all', fat: 80 };
  const s = T.tempSentence(M.scoresFor({ kind: 'animal', t }, 'forest'), M.BIOMES.forest, t);
  assert(/overheats in the summer\.$/.test(s), s);
  assert(!/winter/.test(s), s);
});

let n = 0;
test('across every real animal and 300 random designs in all six biomes, hot never goes with a cold season or cold with the hottest', () => {
  const R = M.rng(7), designs = Object.values(M.PRESETS).filter(p => p.kind === 'animal').map(p => ({ ...M.DEF_A, ...p.t }));
  for (let i = 0; i < 300; i++) designs.push({ ...M.DEF_A, insul: Math.floor(R() * 101), fat: Math.floor(R() * 101), fatWhere: ['none', 'all', 'hump'][Math.floor(R() * 3)], size: Math.floor(R() * 101), ears: Math.floor(R() * 101), activity: ['day', 'night', 'crep'][Math.floor(R() * 3)], season: ['active', 'hibernate', 'migrate'][Math.floor(R() * 3)] });
  for (const t of designs) for (const bk of Object.keys(M.BIOMES)) {
    const B = M.BIOMES[bk], sc = M.scoresFor({ kind: 'animal', t }, bk), w = T.worstTemp(sc), s = T.tempSentence(sc, B, t); n++;
    assert(/^[A-Z].*\.$/.test(s) && s.split(' ').length <= 14, s);
    if (!w) continue;
    const temps = sc.ts.map(x => x.T), season = B.seasons[w.i].toLowerCase();
    assert(s.includes(season), `${bk}: "${s}" should name ${season}`);
    if (w.dir > 0) { assert(/hot|overheats/.test(s), s); assert(w.T > Math.min(...temps), `${bk}: overheats in its coldest season? ${s}`); }
    else { assert(/too cold/.test(s), s); assert(w.T < Math.max(...temps), `${bk}: too cold in its hottest season? ${s}`); }
  }
});

test('grassland seasons read naturally, and the other threats still work', () => {
  assert.strictEqual(T.inSeason('Rains begin'), 'when the rains begin');
  assert.strictEqual(T.inSeason('Cold winter'), 'in the cold winter');
  const B = M.BIOMES.tundra;
  assert(/Predators catch it too easily: arctic foxes/.test(T.threatSentence('pred', {}, B, M.DEF_A)));
  assert.strictEqual(T.threatSentence('food', {}, B, M.DEF_A), 'It cannot find enough food, most of all in the long winter.');
  assert.strictEqual(T.threatSentence('temp', {}, B, M.DEF_A, { why: 'it freezes solid' }), 'It cannot live here: it freezes solid.');
});
console.log(`threat.test: ${passed} tests passed (${n} design-and-biome sentences checked)`);
