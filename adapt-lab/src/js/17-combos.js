/* Adapt Lab: traits that work together, and traits that clash (plan section 5.3).
   One table, COMBOS. Each row is a pair of traits, a survival bar it moves, and one sentence a Grade 6 student can read.
   - inModel: true  → the effect is already inside the survival maths (animalScores / vulCore). The row only makes it visible.
   - inModel: false → the old maths ignores this pair, so apply() adds a modest effect (`effect`, in points on a 0–100 bar).
   tests/combos.test.js measures every row against the old model and fails if an inModel flag is wrong.
   Pure logic, no DOM. Works in the browser (window.AdaptCombos) and in Node (module.exports). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AdaptCombos = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null), function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // The few biome facts the rows need (copied from BIOMES in the model). A biome object passed in overrides these,
  // so events that change the ground colour (ice age, desertification) change camouflage here too.
  const BIOME_FACTS = {
    tundra: { id: 'tundra', aquatic: false, cold: true, match: { white: 1, grey: .55, silver: .6, sandy: .3, brown: .25, green: .15, black: .15, blue: .3, orange: .05 } },
    desert: { id: 'desert', aquatic: false, cold: false, match: { sandy: 1, grey: .55, brown: .55, white: .3, silver: .35, green: .25, black: .15, blue: .1, orange: .35 } },
    forest: { id: 'forest', aquatic: false, cold: true, match: { brown: 1, green: .85, grey: .65, black: .5, sandy: .45, white: .15, silver: .3, blue: .1, orange: .2 } },
    grassland: { id: 'grassland', aquatic: false, cold: false, match: { sandy: .95, brown: .6, orange: .55, grey: .45, green: .5, black: .3, white: .2, silver: .3, blue: .1 } },
    ocean: { id: 'ocean', aquatic: true, cold: false, match: { blue: 1, silver: .95, grey: .7, green: .5, black: .45, white: .35, sandy: .4, brown: .3, orange: .15 } },
    freshwater: { id: 'freshwater', aquatic: true, cold: true, match: { green: .9, brown: .85, grey: .7, silver: .75, blue: .6, black: .6, sandy: .5, white: .2, orange: .15 } }
  };
  function biomeOf(b) {
    if (!b) return BIOME_FACTS.forest;
    if (typeof b === 'string') return BIOME_FACTS[b] || BIOME_FACTS.forest;
    const f = BIOME_FACTS[b.id] || {};
    return { id: b.id, aquatic: b.aquatic != null ? !!b.aquatic : !!f.aquatic, cold: b.cold != null ? !!b.cold : !!f.cold, match: b.match || f.match || {} };
  }
  // how well the colour and pattern blend in, worked out the same way as the model does
  function camo(t, B) {
    let c = B.match[t.color] ?? .4;
    if (t.pattern === 'counter') c = Math.min(1, c + (B.aquatic ? .3 : .08));
    if (t.pattern === 'spots' && (B.id === 'forest' || B.id === 'grassland' || B.id === 'freshwater')) c = Math.min(1, c + .1);
    if (t.pattern === 'stripes' && t.social === 'herd' && B.id === 'grassland') c = Math.min(1, c + .35);
    return c;
  }
  const coat = t => t.cov === 'fur' || t.cov === 'feathers';
  const warns = t => t.color === 'orange' || t.pattern === 'stripes' || t.pattern === 'spots';
  const hasLegs = t => String(t.legs) !== '0';

  /* Row fields:
     id · good (true = works well together, false = clashes) · a, b (the two traits, in student words) · text (the reason)
     pressure (the bar it moves: temp, breath, pred, food or water; may be a function of the design)
     A, B (the two conditions) · where (optional extra condition, usually the biome) · opposite (id of the row that says the reverse)
     inModel · effect (points added by apply() when inModel is false)
     demo: a design and biome where the row fires, and `alt`, the change that switches one side off (used by the tests) */
  const COMBOS = [
    { id: 'night_eyes', good: true, a: 'Active at night', b: 'Big eyes', text: 'Big eyes gather more light in the dark.', pressure: 'food',
      A: t => t.activity === 'night', B: t => t.eyes >= 70, where: t => t.diet !== 'plants', opposite: 'night_small_eyes', inModel: true,
      demo: { biome: 'forest', t: { diet: 'meat', activity: 'night', senses: 'sight', eyes: 90 }, alt: { eyes: 20 } } },
    { id: 'night_eyes_watch', good: true, a: 'Active at night', b: 'Big eyes', text: 'Big eyes spot danger in the dark.', pressure: 'pred',
      A: t => t.activity === 'night', B: t => t.eyes >= 70, where: t => t.diet === 'plants', inModel: true,
      demo: { biome: 'forest', t: { diet: 'plants', activity: 'night', eyes: 90 }, alt: { eyes: 20 } } },
    { id: 'night_small_eyes', good: false, a: 'Hunts by sight at night', b: 'Small eyes', text: 'It cannot see its food in the dark.', pressure: 'food',
      A: t => t.activity === 'night' && t.senses === 'sight', B: t => t.eyes <= 35, where: t => t.diet !== 'plants', opposite: 'night_eyes', inModel: true,
      demo: { biome: 'forest', t: { diet: 'meat', activity: 'night', senses: 'sight', eyes: 15 }, alt: { eyes: 85 } } },
    { id: 'freeze_camo', good: true, a: 'Freezes', b: 'Good camouflage', text: 'Standing still only works if you blend in.', pressure: 'pred',
      A: t => t.escape === 'freeze', B: (t, B) => camo(t, B) >= .6, opposite: 'freeze_bright', inModel: true,
      demo: { biome: 'forest', t: { escape: 'freeze', color: 'brown' }, alt: { color: 'white' } } },
    { id: 'freeze_bright', good: false, a: 'Freezes', b: 'A colour that stands out', text: 'It stands still where everyone can see it.', pressure: 'pred',
      A: t => t.escape === 'freeze', B: (t, B) => camo(t, B) < .35, opposite: 'freeze_camo', inModel: true,
      demo: { biome: 'forest', t: { escape: 'freeze', color: 'white' }, alt: { color: 'brown' } } },
    { id: 'flee_legs', good: true, a: 'Escapes fast', b: 'Long legs', text: 'Long legs make a fast runner.', pressure: 'pred',
      A: t => t.escape === 'flee', B: t => hasLegs(t) && t.legLen >= 70, where: (t, B) => !B.aquatic, inModel: true,
      demo: { biome: 'grassland', t: { escape: 'flee', legLen: 90 }, alt: { legLen: 20 } } },
    { id: 'flee_heavy', good: false, a: 'Escapes fast', b: 'A heavy shell or thick fat', text: 'It is too heavy to run fast.', pressure: 'pred',
      A: t => t.escape === 'flee', B: t => t.defence === 'shell' || (t.fatWhere === 'all' && t.fat >= 60), where: (t, B) => !B.aquatic, inModel: true,
      demo: { biome: 'grassland', t: { escape: 'flee', fatWhere: 'all', fat: 90 }, alt: { fatWhere: 'none' } } },
    { id: 'hide_small', good: true, a: 'Hides away', b: 'Small body', text: 'Small animals fit into burrows and cracks.', pressure: 'pred',
      A: t => t.escape === 'hide', B: t => t.size <= 30, opposite: 'hide_huge', inModel: false, effect: 8,
      demo: { biome: 'forest', t: { escape: 'hide', size: 20 }, alt: { size: 60 } } },
    { id: 'hide_huge', good: false, a: 'Hides away', b: 'Huge body', text: 'Nowhere is big enough to hide.', pressure: 'pred',
      A: t => t.escape === 'hide', B: t => t.size >= 75, opposite: 'hide_small', inModel: false, effect: -12,
      demo: { biome: 'grassland', t: { escape: 'hide', size: 90 }, alt: { size: 50 } } },
    { id: 'herd_stripes', good: true, a: 'Lives in a group', b: 'Stripes', text: 'A predator cannot pick out one animal.', pressure: 'pred',
      A: t => t.social === 'herd', B: t => t.pattern === 'stripes', where: (t, B) => B.id === 'grassland', inModel: true,
      demo: { biome: 'grassland', t: { social: 'herd', pattern: 'stripes', color: 'white', size: 60 }, alt: { pattern: 'plain' } } },
    { id: 'herd_care', good: true, a: 'Lives in a group', b: 'Cares for its young', text: 'Many adults watch for danger.', pressure: 'pred',
      A: t => t.social === 'herd', B: t => t.care !== 'none', inModel: false, effect: 5,
      demo: { biome: 'grassland', t: { social: 'herd', care: 'lots' }, alt: { care: 'none' } } },
    { id: 'hib_fat', good: true, a: 'Hibernates', b: 'Fat store', text: 'Fat is the fuel for a long sleep.', pressure: 'food',
      A: t => t.season === 'hibernate', B: t => t.fatWhere !== 'none' && t.fat >= 40, opposite: 'hib_nofat', inModel: true,
      demo: { biome: 'tundra', t: { season: 'hibernate', fatWhere: 'all', fat: 70, size: 15, insul: 80 }, alt: { fatWhere: 'none' } } },
    { id: 'hib_nofat', good: false, a: 'Hibernates', b: 'No fat and a small body', text: 'It runs out of energy before spring.', pressure: 'food',
      A: t => t.season === 'hibernate', B: t => t.fatWhere === 'none' && t.size <= 40, where: t => t.blood === 'warm', opposite: 'hib_fat', inModel: true,
      demo: { biome: 'tundra', t: { season: 'hibernate', fatWhere: 'none', size: 15, insul: 80 }, alt: { fatWhere: 'all', fat: 70 } } },
    { id: 'migrate_far', good: true, a: 'Migrates', b: 'Wings or long legs', text: 'It can travel far without tiring.', pressure: 'food',
      A: t => t.season === 'migrate', B: t => t.wings === 'fly' || (hasLegs(t) && t.legLen >= 70), where: (t, B) => !B.aquatic, opposite: 'migrate_slow', inModel: true,
      demo: { biome: 'tundra', t: { season: 'migrate', legLen: 90, insul: 80 }, alt: { legLen: 15 } } },
    { id: 'migrate_slow', good: false, a: 'Migrates', b: 'Short legs and no wings', text: 'The journey is too far for short legs.', pressure: 'food',
      A: t => t.season === 'migrate', B: t => t.wings !== 'fly' && hasLegs(t) && t.legLen <= 35 && t.fins !== 'fins', where: (t, B) => !B.aquatic, opposite: 'migrate_far', inModel: true,
      demo: { biome: 'tundra', t: { season: 'migrate', legLen: 15, insul: 80 }, alt: { legLen: 90 } } },
    { id: 'poison_warn', good: true, a: 'Poison', b: 'Bright colour or bold pattern', text: 'Predators learn the warning and stay away.', pressure: 'pred',
      A: t => t.defence === 'poison', B: t => warns(t), inModel: true,
      demo: { biome: 'forest', t: { defence: 'poison', color: 'orange' }, alt: { color: 'white' } } },
    { id: 'store_active', good: true, a: 'Stores food', b: 'Stays active all year', text: 'It has food when there is none to find.', pressure: 'food',
      A: t => t.store === 'cache', B: t => t.season === 'active', inModel: true,
      demo: { biome: 'tundra', t: { store: 'cache', season: 'active', insul: 80 }, alt: { store: 'none' } } },
    { id: 'cold_day', good: true, a: 'Cold-blooded', b: 'Active by day', text: 'It basks in the sun to warm up.', pressure: 'temp',
      A: t => t.blood === 'cold', B: t => t.activity === 'day', where: (t, B) => !B.aquatic, opposite: 'cold_night', inModel: true,
      demo: { biome: 'forest', t: { blood: 'cold', cov: 'scales', activity: 'day' }, alt: { activity: 'night' } } },
    { id: 'cold_night', good: false, a: 'Cold-blooded', b: 'Active at night', text: 'Nights are too cold for it to move.', pressure: 'temp',
      A: t => t.blood === 'cold', B: t => t.activity === 'night', where: (t, B) => !B.aquatic && B.cold, opposite: 'cold_day', inModel: true,
      demo: { biome: 'forest', t: { blood: 'cold', cov: 'scales', activity: 'night' }, alt: { activity: 'day' } } },
    { id: 'meat_smell', good: true, a: 'Eats animals', b: 'Finds food by smell', text: 'A sharp nose finds prey that is hidden.', pressure: 'food',
      A: t => t.diet !== 'plants', B: t => t.senses === 'smell', inModel: true,
      demo: { biome: 'forest', t: { diet: 'meat', senses: 'smell', eyes: 20 }, alt: { senses: 'sight' } } },
    { id: 'keep_heat', good: true, a: 'Thick coat', b: 'Small ears and a big body', text: 'Less surface means less heat escapes.', pressure: 'temp',
      A: t => coat(t) && t.insul >= 70, B: t => t.ears <= 30 && t.size >= 50, where: (t, B) => B.cold && !B.aquatic && t.blood === 'warm', inModel: true,
      demo: { biome: 'tundra', t: { insul: 75, ears: 15, size: 60 }, alt: { ears: 95, size: 20 } } },
    { id: 'ears_night', good: true, a: 'Big ears', b: 'Active at night', text: 'Big ears give off heat, and nights are cooler.', pressure: 'temp',
      A: t => t.cov === 'fur' && t.ears >= 70, B: t => t.activity === 'night', where: (t, B) => B.id === 'desert' && t.blood === 'warm', inModel: true,
      demo: { biome: 'desert', t: { ears: 95, activity: 'night', insul: 60, waterSave: 85 }, alt: { activity: 'day' } } },
    { id: 'stream_fins', good: true, a: 'Streamlined body', b: 'Fins or flippers', text: 'A smooth shape and fins make a fast swimmer.',
      pressure: t => t.escape === 'flee' ? 'pred' : t.diet !== 'plants' ? 'food' : 'breath',
      A: t => t.shape === 'stream', B: t => t.fins === 'fins', where: (t, B) => B.aquatic && (t.escape === 'flee' || t.diet !== 'plants' || t.breathe === 'lungs'), inModel: true,
      demo: { biome: 'ocean', t: { cov: 'scales', blood: 'cold', breathe: 'gills', shape: 'stream', legs: '0', fins: 'fins', escape: 'flee', diet: 'meat', salt: 95, size: 15 }, alt: { fins: 'none' } } },
    { id: 'lungs_slow', good: false, a: 'Breathes with lungs', b: 'A slow swimmer', text: 'It cannot reach the surface for air in time.', pressure: 'breath',
      A: t => t.breathe === 'lungs', B: t => t.fins !== 'fins' && t.shape !== 'stream', where: (t, B) => B.aquatic, inModel: true,
      demo: { biome: 'ocean', t: { breathe: 'lungs', fins: 'none', shape: 'round', salt: 90 }, alt: { fins: 'fins', shape: 'stream' } } },
    { id: 'huddle', good: true, a: 'Lives in a group', b: 'Warm-blooded', text: 'Huddling together keeps everyone warm.', pressure: 'temp',
      A: t => t.social === 'herd', B: t => t.blood === 'warm', where: (t, B) => B.cold && !B.aquatic, inModel: true,
      demo: { biome: 'tundra', t: { social: 'herd', insul: 60 }, alt: { social: 'solo' } } },
    { id: 'hide_skin', good: true, a: 'Hides away', b: 'Moist skin', text: 'A damp burrow stops thin skin drying out.', pressure: 'water',
      A: t => t.escape === 'hide', B: t => t.cov === 'skin', where: (t, B) => !B.aquatic, inModel: true,
      demo: { biome: 'grassland', t: { cov: 'skin', blood: 'cold', breathe: 'skinlungs', escape: 'hide' }, alt: { escape: 'freeze' } } },
    { id: 'shell_hide', good: true, a: 'Hard shell', b: 'Hides away', text: 'It pulls into its shell and waits.', pressure: 'pred',
      A: t => t.defence === 'shell', B: t => t.escape === 'hide', inModel: true,
      demo: { biome: 'forest', t: { defence: 'shell', escape: 'hide' }, alt: { escape: 'freeze' } } },
    { id: 'counter_swim', good: true, a: 'Dark top, pale belly', b: 'Lives in open water', text: 'It is hard to see from above and from below.', pressure: 'pred',
      A: t => t.pattern === 'counter', B: t => t.fins === 'fins', where: (t, B) => B.aquatic, inModel: true,
      demo: { biome: 'ocean', t: { cov: 'scales', blood: 'cold', breathe: 'gills', shape: 'stream', legs: '0', fins: 'fins', pattern: 'counter', color: 'grey', salt: 95, size: 15 }, alt: { pattern: 'plain' } } },
    { id: 'fly_small', good: true, a: 'Wings that fly', b: 'Small body', text: 'A light body can take off and fly away.', pressure: 'pred',
      A: t => t.wings === 'fly', B: t => t.size <= 35, where: (t, B) => !B.aquatic, opposite: 'fly_heavy', inModel: true,
      demo: { biome: 'forest', t: { cov: 'feathers', legs: '2', wings: 'fly', wingSize: 70, size: 20 }, alt: { wings: 'none' } } },
    { id: 'fly_heavy', good: false, a: 'Wings that fly', b: 'Huge body', text: 'It is too heavy for its wings to lift.', pressure: 'food',
      A: t => t.wings === 'fly', B: t => t.size >= 75, opposite: 'fly_small', inModel: true,
      demo: { biome: 'grassland', t: { cov: 'feathers', legs: '2', wings: 'fly', wingSize: 80, size: 90 }, alt: { wings: 'none' } } }
  ];
  const BY_ID = {}; COMBOS.forEach(r => { BY_ID[r.id] = r; });

  function fires(row, t, B) { return !!(row.A(t, B) && row.B(t, B) && (!row.where || row.where(t, B))); }
  const pressureOf = (row, t, B) => typeof row.pressure === 'function' ? row.pressure(t, B) : row.pressure;

  // every pair that applies to this design in this biome, clashes first
  function find(traits, biome) {
    const B = biomeOf(biome), out = [];
    for (const row of COMBOS) if (fires(row, traits, B)) out.push({ id: row.id, good: row.good, a: row.a, b: row.b, text: row.text, pressure: pressureOf(row, traits, B), inModel: row.inModel, effect: row.inModel ? 0 : row.effect });
    return out.sort((x, y) => (x.good === y.good ? 0 : x.good ? 1 : -1));
  }
  // adds the effects the old maths does not have. Returns a new scores object; the one passed in is not changed.
  function apply(scores, traits, biome) {
    const out = { ...scores }, used = [];
    for (const c of find(traits, biome)) {
      if (c.inModel || !c.effect || !(c.pressure in out)) continue;
      out[c.pressure] = clamp(out[c.pressure] + c.effect, 0, 100); used.push(c.id);
      if (c.pressure === 'temp' && Array.isArray(out.ts)) out.ts = out.ts.map(x => (x.dormant || x.away) ? x : { ...x, s: clamp(x.s + c.effect, 0, 100) });
    }
    out.combosApplied = used;
    return out;
  }

  return { COMBOS, BIOME_FACTS, find, apply, fires, camo, biomeOf, byId: id => BY_ID[id] };
});
