// Golden test: the ported model must give exactly the same numbers as the old single-file app.
// Run: node adapt-lab/tests/model.test.js
'use strict';
const path = require('path');
const OLD = require('./_old_model_loader.js');
['00-util', '10-data', '11-model-animal', '12-model-plant', '13-hazards', '18-classify'].forEach(f => require(path.join(__dirname, '..', 'src', 'js', f + '.js')));
const NEW = globalThis.AdaptModel;
const J = x => JSON.stringify(x, (k, v) => typeof v === 'number' && !Number.isFinite(v) ? String(v) : v);
let n = 0, bad = [];
const same = (label, a, b) => { n++; if (J(a) !== J(b)) bad.push(label); };
const scoresNew = NEW.scoresFor || ((o, bk) => o.kind === 'animal' ? NEW.animalScores(o.t, bk) : NEW.plantScores(o.t, bk));
same('BIOMES', OLD.BIOMES, NEW.BIOMES); same('DEF_A', OLD.DEF_A, NEW.DEF_A); same('DEF_P', OLD.DEF_P, NEW.DEF_P); same('PRED_BANK', OLD.PRED_BANK, NEW.PRED_BANK);
const ids = Object.keys(OLD.PRESETS);
if (ids.length !== 24) bad.push('expected 24 presets, found ' + ids.length);
for (const id of ids) {
  same('preset ' + id, OLD.PRESETS[id], NEW.PRESETS[id]);
  for (const bk of Object.keys(OLD.BIOMES)) {
    const po = OLD.PRESETS[id], o = { kind: po.kind, t: { ...po.t } }, o2 = { kind: po.kind, t: { ...NEW.PRESETS[id].t } };
    const so = OLD.scoresFor(o, bk), sn = scoresNew(o2, bk);
    same(`scores ${id} in ${bk}`, so, sn);
    same(`yearSurvival ${id} in ${bk}`, OLD.yearSurvival(so, bk, o), NEW.yearSurvival(sn, bk, o2));
    same(`lethalOf ${id} in ${bk}`, OLD.lethalOf(so, bk, o), NEW.lethalOf(sn, bk, o2));
    for (let s = 0; s < 4; s++) same(`seasonHaz ${id} ${bk} s${s}`, OLD.seasonHaz(so, bk, o, s, s === 1), NEW.seasonHaz(sn, bk, o2, s, s === 1));
    if (po.kind === 'animal') same(`moveAbility ${id} ${bk}`, OLD.moveAbility(o.t, OLD.BIOMES[bk]), NEW.moveAbility(o2.t, NEW.BIOMES[bk]));
  }
  if (OLD.PRESETS[id].kind === 'animal') {
    const co = OLD.classify(OLD.PRESETS[id].t), cn = NEW.classify(NEW.PRESETS[id].t);
    same('classify ' + id, [co.g.n, co.sc, co.r], [cn.g.n, cn.sc, cn.r]);
    same('realChecks ' + id, OLD.realChecks(OLD.PRESETS[id].t), NEW.realChecks(NEW.PRESETS[id].t));
  }
}
// odd designs too: every option of every animal trait, one at a time, from the default animal, in two biomes
for (const sec of OLD.A_SECTIONS) for (const row of sec.rows) for (const [val] of row.opts) for (const bk of ['tundra', 'ocean']) {
  const t = { ...OLD.DEF_A, [row.k]: val }, o = { kind: 'animal', t }, o2 = { kind: 'animal', t: { ...t } };
  const so = OLD.scoresFor(o, bk), sn = scoresNew(o2, bk);
  same(`scores ${row.k}=${val} in ${bk}`, so, sn); same(`year ${row.k}=${val} in ${bk}`, OLD.yearSurvival(so, bk, o), NEW.yearSurvival(sn, bk, o2));
}
if (bad.length) { console.error(`FAIL: ${bad.length} of ${n} comparisons differ`); bad.slice(0, 20).forEach(b => console.error('  ' + b)); process.exit(1); }
console.log(`model.test: ${n} comparisons, all identical to the old app`);
