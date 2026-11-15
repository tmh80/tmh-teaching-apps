// Golden test for the run engine: a headless run must reach the same numbers the old app shows
// at its first pause (generation 50) for five real organisms. The old numbers were read from
// Adapt-Lab-offline.html on 15 Nov 2026 by driving the page (pause the animation, then "Skip to generation 50").
// Run: node adapt-lab/tests/run.test.js
'use strict';
const path = require('path');
['00-util', '10-data', '11-model-animal', '12-model-plant', '13-hazards', '14-run', '15-foodweb', '18-classify'].forEach(f => require(path.join(__dirname, '..', 'src', 'js', f + '.js')));
const M = globalThis.AdaptModel;
const GOLD = { 'zebra': ['grassland', 82, 2672, 2610], 'arctic-hare': ['tundra', 28, 1591, 1583], 'arctic-fox': ['tundra', 28, 1008, 1000], 'wood-frog': ['forest', 80, 4934, 4874], 'mackerel': ['ocean', 74, 4040, 3986] };
let bad = 0;
for (const [id, [bk, alive, born, died]] of Object.entries(GOLD)) {
  const p = M.PRESETS[id]; M.newRun({ kind: p.kind, name: p.name, t: { ...p.t }, preset: id }, bk, {});
  const r = M.skipAhead(); const got = [r.pop.filter(x => !x.dying).length, r.born, r.died];
  const ok = got[0] === alive && got[1] === born && got[2] === died; if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${id} in ${bk}: alive ${got[0]} born ${got[1]} died ${got[2]} (old app: ${alive}, ${born}, ${died})`);
}
// the same run twice gives the same history
const p = M.PRESETS['rabbit']; const once = () => { M.newRun({ kind: 'animal', name: p.name, t: { ...p.t } }, 'forest', {}); return JSON.stringify(M.runGenerations(20).hist); };
if (once() !== once()) { bad++; console.log('FAIL: the same run gave two different histories'); }
if (bad) process.exit(1); console.log('run.test: the headless run engine matches the old app');
