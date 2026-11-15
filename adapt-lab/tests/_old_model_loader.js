// Loads the pure science model out of the old single-file app, for tests in Node.
// It slices the model code (helpers, data, animal and plant model, hazards, classification) from Adapt-Lab.html
// by its section markers, adds canHunt (which lives further down the file) and evaluates it in a sandbox with DOM stubs.
// Usage: const M = require('./_old_model_loader.js'); M.animalScores(traits,'tundra')
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');

const FILE = path.join(__dirname, '..', 'Adapt-Lab.html');
const EXPORTS = ['clamp', 'rng', 'PAL', 'BIOMES', 'getB', 'A_SECTIONS', 'A_SLIDERS', 'DEF_A', 'P_SECTIONS', 'P_SLIDERS', 'DEF_P', 'PRESETS',
  'PRED_BANK', 'INVADERS', 'moveAbility', 'vulCore', 'canHunt', 'animalScores', 'plantScores', 'scoresFor', 'seasonHaz', 'yearSurvival', 'lethalOf',
  'GROUPS', 'classify', 'realChecks'];

function load(file) {
  const src = fs.readFileSync(file || FILE, 'utf8');
  const start = src.indexOf('const $=id=>document.getElementById(id);');
  const end = src.indexOf('/* ================= notes ================= */');
  if (start < 0 || end < 0 || end < start) throw new Error('Could not find the model section markers in ' + (file || FILE));
  const hunt = src.match(/function canHunt\(j,size,t\)\{[\s\S]*?\n(?=function predVul)/);
  if (!hunt) throw new Error('Could not find canHunt in ' + (file || FILE));
  const code = '"use strict";\n' + src.slice(start, end) + '\n' + hunt[0] + '\nreturn {' + EXPORTS.join(',') + '};';
  const el = () => ({ hidden: true, style: {}, dataset: {}, innerHTML: '', addEventListener() {}, getBoundingClientRect() { return { left: 0, top: 0, bottom: 0 }; } });
  const sandbox = {
    document: { getElementById: el, addEventListener() {}, documentElement: {}, querySelectorAll: () => [] },
    addEventListener() {}, matchMedia: () => ({ matches: false }), getComputedStyle: () => ({ getPropertyValue: () => '' }),
    innerWidth: 1200, innerHeight: 800, Math, JSON, Object, Array, Number, String, Set, Map, console
  };
  vm.createContext(sandbox);
  return vm.runInContext('(function(){' + code + '})()', sandbox, { filename: 'Adapt-Lab.html (model slice)' });
}

module.exports = load();
module.exports.load = load;
