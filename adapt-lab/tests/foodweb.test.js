// Golden test for the food web (src/js/15-foodweb.js). Run: node adapt-lab/tests/foodweb.test.js
// It slices the food web code out of the old Adapt-Lab.html, runs it beside the ported code and checks that
// every number is identical: the species lists, the growth rates, 30 years of populations in every biome,
// a knock-on run with each species removed, and the student's own organism added to every web.
'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path'), vm = require('vm');
['00-util', '10-data', '11-model-animal', '12-model-plant', '13-hazards', '14-run', '15-foodweb', '18-classify'].forEach(f => require(path.join(__dirname, '..', 'src', 'js', f + '.js')));
const NEW = globalThis.AdaptModel;
const OLD_MODEL = require('./_old_model_loader.js');

// --- the old food web code, run in a sandbox that holds the old model ---
const src = fs.readFileSync(path.join(__dirname, '..', 'Adapt-Lab.html'), 'utf8');
const a = src.indexOf('const FWS={'), b = src.indexOf('function fwReset(');
if (a < 0 || b < 0) throw new Error('Could not find the old food web code in Adapt-Lab.html');
const oldCode = src.slice(a, b);
const sandbox = { ...OLD_MODEL, Math, JSON, Object, Array, ORG: null, orgName: o => (o.name || '').trim() || (o.kind === 'animal' ? 'My animal' : 'My plant') };
vm.createContext(sandbox);
const OLD = vm.runInContext('(function(){"use strict";' + oldCode + '\nreturn {FWS,LVNAME,LVCOL,fwTraits,fwBuild,fwGrowth,fwStep,setOrg:o=>{ORG=o},fwMe};})()', sandbox, { filename: 'Adapt-Lab.html (food web slice)' });

let passed = 0;
function test(name, fn) { fn(); passed++; console.log('  ok  ' + name); }
const same = (x, y, msg) => assert.strictEqual(JSON.stringify(x), JSON.stringify(y), msg);
const BIOMES = Object.keys(OLD.FWS);

// runs `years` years the way the old page does (steps of 0.05), removing one species at year 5 if asked
function history(M, W, removeId, years) {
  let N = W.sp.map(s => s.me ? .3 : 1), rem = W.sp.map(() => false); const H = [];
  for (let y = 0; y <= years; y++) {
    if (y === 5 && removeId) { const i = W.idx[removeId]; rem[i] = true; N[i] = 0; }
    H.push(N.slice()); for (let k = 0; k < 20; k++) N = M.fwStep(W, N, rem, .05);
  }
  return H;
}

test('the species lists, levels and colours are the same in all six biomes', () => {
  same(NEW.FWS, OLD.FWS, 'FWS differs'); same(NEW.LVNAME, OLD.LVNAME); same(NEW.LVCOL, OLD.LVCOL);
  assert.strictEqual(BIOMES.length, 6);
});

test('every species gets the same traits', () => {
  BIOMES.forEach(bk => OLD.FWS[bk].forEach(s => same(NEW.fwTraits(s), OLD.fwTraits(s), `${bk}/${s.id}`)));
});

test('the webs are wired the same (food, predators, growth rates)', () => {
  BIOMES.forEach(bk => {
    const wo = OLD.fwBuild(OLD.FWS[bk]), wn = NEW.fwBuild(NEW.FWS[bk]);
    same(wn.idx, wo.idx, bk); same(wn.sp.map(s => [s.foods, s.preds, s.self, s.b]), wo.sp.map(s => [s.foods, s.preds, s.self, s.b]), bk);
    const N = wo.sp.map((s, i) => .4 + .13 * i);
    wo.sp.forEach((s, i) => assert.strictEqual(NEW.fwGrowth(wn, N, i), OLD.fwGrowth(wo, N, i), `${bk}/${s.id} growth`));
  });
});

test('30 years in every biome give identical populations', () => {
  BIOMES.forEach(bk => same(history(NEW, NEW.fwBuild(NEW.FWS[bk]), null, 30), history(OLD, OLD.fwBuild(OLD.FWS[bk]), null, 30), bk));
});

let knock = 0;
test('removing any one species gives identical knock-on effects', () => {
  BIOMES.forEach(bk => OLD.FWS[bk].forEach(s => {
    same(history(NEW, NEW.fwBuild(NEW.FWS[bk]), s.id, 25), history(OLD, OLD.fwBuild(OLD.FWS[bk]), s.id, 25), `${bk} without ${s.id}`); knock++;
  }));
});

let mine = 0;
test('a student organism joins every web in the same place, with the same numbers', () => {
  const orgs = ['arctic-hare', 'zebra', 'wood-frog', 'mackerel', 'arctic-fox', 'oak', 'saguaro']
    .filter(id => NEW.PRESETS[id]).map(id => ({ kind: NEW.PRESETS[id].kind, name: NEW.PRESETS[id].name, t: { ...NEW.PRESETS[id].t } }));
  orgs.push({ kind: 'animal', name: '', t: { ...NEW.DEF_A, diet: 'meat', size: 90 } }, { kind: 'animal', name: 'Mixed eater', t: { ...NEW.DEF_A, diet: 'both' } });
  assert(orgs.length >= 7, 'presets missing');
  orgs.forEach(o => BIOMES.forEach(bk => {
    OLD.setOrg(o); const eo = OLD.fwMe(bk), en = NEW.fwMe(o, bk);
    same(en, eo, `${o.name || 'unnamed'} in ${bk}`);
    same(history(NEW, NEW.fwBuild(NEW.FWS[bk], en), null, 20), history(OLD, OLD.fwBuild(OLD.FWS[bk], eo), null, 20), `${o.name} run in ${bk}`); mine++;
  }));
});

test('newWeb() matches the old page loop (records every quarter year, remove and bring back)', () => {
  const web = NEW.newWeb('tundra'); web.advance(2);
  assert.strictEqual(web.hist.length, 9, 'expected a record at year 0 and every 0.25 years to year 2');
  same(web.N, history(OLD, OLD.fwBuild(OLD.FWS.tundra), null, 2)[2]);
  web.toggleRemove('wolf'); assert.strictEqual(web.N[web.W.idx.wolf], 0);
  web.toggleRemove('wolf'); assert.strictEqual(web.N[web.W.idx.wolf], .3);
  web.toggleRemove('nobody');   // unknown ids are ignored
});

console.log(`foodweb.test: ${passed} tests passed (${knock} knock-on runs and ${mine} runs with a student organism match the old app exactly)`);
