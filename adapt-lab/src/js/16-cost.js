/* Adapt Lab: cost of change, by distance (plan section 5.2).
   Small steps are cheap, changes to a more different design cost more, and a new body plan is the most expensive of all.
   Pure logic, no DOM. Works in the browser (window.AdaptCost) and in Node (module.exports).

   How the price is worked out, trait by trait:
   - Number traits (size, leg length, ears and so on): 1 point for every 10 units moved (any change costs at least 1).
   - Choice traits: each has a neighbour map. The price is the number of steps along the map times the weight of its group:
       behaviour 1 · looks (colour, pattern) 1 · body feature 2 · defence 3 · body-plan trait 4.
   - Body-plan traits are covering, body heat, breathing, number of legs and wings. Their maps follow the family tree
     fish – frog – lizard – bird and lizard – mammal, so a whole move between two neighbouring plans costs 8 points or more.
     Insects and crabs are a separate branch of the real family tree. Tom (22 Nov 2026) wants students to be able to make
     the jump anyway, so the class can discuss what is accurate: links marked { notReal: true } allow it at full price,
     and every cost item that uses one carries notReal and a sentence saying it has never happened in real life.
   The total is the sum over all traits, so it is zero for no change, the same in both directions, and going by way of a
   third design is never cheaper than going direct. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AdaptCost = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null), function () {
  'use strict';

  const BUDGET_PER_ERA = 10;
  const WEIGHTS = { behaviour: 1, looks: 1, body: 2, defence: 3, plan: 4 };
  const NUM_UNITS_PER_POINT = 10;
  const GROUP_WORD = { behaviour: 'a behaviour', looks: 'colour or pattern', body: 'a body feature', defence: 'a defence', plan: 'a body-plan feature' };

  // Number traits: 0 to 100.
  const NUM = ['size', 'legLen', 'insul', 'fat', 'ears', 'tail', 'wingSize', 'finSize', 'eyes', 'waterSave', 'salt'];

  // Neighbour maps. Each pair is one step. `only` limits a link to animals that have that trait value on both sides.
  const NEIGHBOURS = {
    // ---- behaviours: 1 point per step
    diet: { group: 'behaviour', links: [['plants', 'both'], ['both', 'meat']] },
    activity: { group: 'behaviour', links: [['day', 'crep'], ['crep', 'night']] },
    season: { group: 'behaviour', links: [['active', 'hibernate'], ['active', 'migrate']] },
    social: { group: 'behaviour', links: [['solo', 'herd']] },
    senses: { group: 'behaviour', links: [['sight', 'smell'], ['smell', 'tongue']] },
    escape: { group: 'behaviour', links: [['freeze', 'hide'], ['hide', 'flee'], ['freeze', 'flee']] },
    store: { group: 'behaviour', links: [['none', 'cache']] },
    care: { group: 'behaviour', links: [['none', 'some'], ['some', 'lots']] },
    // ---- looks: 1 point per step (the colour map is the one the old Run used for colour mutations, made two-way)
    color: { group: 'looks', links: [['white', 'silver'], ['white', 'grey'], ['silver', 'grey'], ['silver', 'blue'], ['grey', 'brown'], ['grey', 'black'], ['grey', 'sandy'],
      ['sandy', 'brown'], ['sandy', 'orange'], ['brown', 'black'], ['green', 'brown'], ['green', 'grey'], ['blue', 'grey'], ['blue', 'green'], ['orange', 'brown']] },
    pattern: { group: 'looks', links: [['plain', 'spots'], ['plain', 'stripes'], ['plain', 'counter'], ['spots', 'stripes']] },
    // ---- body features: 2 points per step
    shape: { group: 'body', links: [['round', 'long'], ['long', 'stream'], ['round', 'tall']] },
    fatWhere: { group: 'body', links: [['none', 'all'], ['all', 'hump']] },
    posture: { group: 'body', links: [['upright', 'sprawl']] },
    fins: { group: 'body', links: [['none', 'fins']] },
    // ---- defences: 3 points per step
    defence: { group: 'defence', links: [['none', 'spines'], ['none', 'poison'], ['none', 'shell'], ['spines', 'shell']] },
    // ---- body-plan traits: 4 points per step, following fish – frog – lizard – bird and lizard – mammal
    cov: { group: 'plan', links: [['skin', 'scales'], ['scales', 'feathers'], ['scales', 'fur'], ['scales', 'exo', { notReal: true }]], values: ['fur', 'feathers', 'scales', 'skin', 'exo'] },
    blood: { group: 'plan', links: [['cold', 'warm']] },
    breathe: { group: 'plan', links: [['gills', 'skinlungs'], ['skinlungs', 'lungs'], ['tubes', 'gills', { only: ['cov', 'exo'] }], ['lungs', 'tubes', { notReal: true }]] },
    legs: { group: 'plan', links: [['0', '4'], ['4', '2'], ['4', '6', { notReal: true }]], values: ['0', '2', '4', '6'] },
    wings: { group: 'plan', links: [['none', 'flightless'], ['flightless', 'fly']] }
  };

  const LABEL = { size: 'body size', legLen: 'leg length', insul: 'coat thickness', fat: 'amount of fat', ears: 'ear size', tail: 'tail length', wingSize: 'wing size',
    finSize: 'fin size', eyes: 'eye size', waterSave: 'water saving', salt: 'coping with salt', diet: 'what it eats', activity: 'when it is active',
    season: 'harsh-season behaviour', social: 'living alone or in a group', senses: 'how it finds food', escape: 'what it does when a predator comes',
    store: 'storing food', care: 'care for its young', color: 'colour', pattern: 'pattern', shape: 'body shape', fatWhere: 'fat store', posture: 'leg posture',
    fins: 'fins or flippers', defence: 'defence', cov: 'body covering', blood: 'body heat', breathe: 'breathing', legs: 'number of legs', wings: 'wings' };
  const VALUE_WORD = {
    diet: { plants: 'plants', both: 'plants and animals', meat: 'animals' }, activity: { day: 'day', crep: 'dawn and dusk', night: 'night' },
    season: { active: 'stays active', hibernate: 'hibernates', migrate: 'migrates' }, social: { solo: 'alone', herd: 'in a group' },
    senses: { sight: 'sight', smell: 'smell', tongue: 'tasting the air' }, escape: { freeze: 'freezes', hide: 'hides away', flee: 'escapes fast' },
    store: { none: 'eats as it goes', cache: 'stores food' }, care: { none: 'many young, no care', some: 'some care', lots: 'few young, lots of care' },
    pattern: { plain: 'plain', spots: 'spots', stripes: 'stripes', counter: 'dark top, pale belly' },
    shape: { round: 'round', long: 'long and low', tall: 'tall', stream: 'streamlined' }, fatWhere: { none: 'none', all: 'a layer all over', hump: 'a hump' },
    posture: { upright: 'legs under the body', sprawl: 'legs out to the sides' }, fins: { none: 'none', fins: 'fins or flippers' },
    defence: { none: 'none', spines: 'spines', poison: 'poison', shell: 'a hard shell' },
    cov: { fur: 'fur', feathers: 'feathers', scales: 'scales', skin: 'moist skin', exo: 'a hard exoskeleton' }, blood: { warm: 'warm-blooded', cold: 'cold-blooded' },
    breathe: { lungs: 'lungs', gills: 'gills', skinlungs: 'skin and lungs', tubes: 'air tubes' }, legs: { 0: 'no legs', 2: 'two legs', 4: 'four legs', 6: 'six or more legs' },
    wings: { none: 'no wings', fly: 'wings that fly', flightless: 'small wings that cannot fly' }
  };
  function word(key, v) { const m = VALUE_WORD[key]; return m && m[v] != null ? m[v] : String(v); }

  // ---- shortest path along a neighbour map (breadth-first search). Returns the list of values from a to b, or null.
  function pathOf(key, a, b, fromT, toT) {
    a = String(a); b = String(b);
    if (a === b) return [a];
    const map = NEIGHBOURS[key]; if (!map) return null;
    const ok = l => { const o = l[2]; if (!o || !o.only) return true; const [k, v] = o.only; return !!fromT && !!toT && fromT[k] === v && toT[k] === v; };
    const prev = { [a]: null }; const q = [a];
    while (q.length) {
      const x = q.shift();
      for (const l of map.links) {
        if (!ok(l)) continue;
        const y = l[0] === x ? l[1] : l[1] === x ? l[0] : null;
        if (y == null || y in prev) continue;
        prev[y] = x;
        if (y === b) { const out = [b]; let p = x; while (p != null) { out.unshift(p); p = prev[p]; } return out; }
        q.push(y);
      }
    }
    return null;
  }
  const NOT_REAL_TEXT = 'In real life this has never happened: animals with a backbone and insects or crabs are separate branches of the family tree.';
  // true when the cheapest route uses a link that real evolution never took
  function usesNotReal(key, path) {
    if (!path || path.length < 2) return false; const map = NEIGHBOURS[key];
    for (let i = 1; i < path.length; i++) for (const l of map.links) if (l[2] && l[2].notReal && ((l[0] === path[i - 1] && l[1] === path[i]) || (l[1] === path[i - 1] && l[0] === path[i]))) return true;
    return false;
  }
  function steps(key, a, b, fromT, toT) { const p = pathOf(key, a, b, fromT, toT); return p ? p.length - 1 : Infinity; }

  // price of changing ONE trait from value a to value b. fromT and toT are the whole designs (needed for the arthropod-only link).
  function traitCost(key, a, b, fromT, toT) {
    if (NUM.includes(key)) {
      const d = Math.abs((+a || 0) - (+b || 0));
      return { points: Math.ceil(d / NUM_UNITS_PER_POINT - 1e-9), path: null, group: 'number' };
    }
    const map = NEIGHBOURS[key]; if (!map) return { points: 0, path: null, group: null };
    const p = pathOf(key, a, b, fromT, toT);
    return { points: p ? (p.length - 1) * WEIGHTS[map.group] : Infinity, path: p, group: map.group, notReal: usesNotReal(key, p) };
  }
  function whyOf(key, c, a, b) {
    if (c.group === 'number') return `1 point for every ${NUM_UNITS_PER_POINT} units of change.`;
    if (!isFinite(c.points)) return `This cannot evolve from here. ${key === 'cov' || key === 'legs' || key === 'breathe' ? 'Insects and crabs are a separate branch of the family tree.' : ''}`.trim();
    const n = c.path.length - 1, w = WEIGHTS[c.group];
    const route = c.path.map(v => word(key, v)).join(' → ');
    return `${n} step${n === 1 ? '' : 's'} (${route}). This is ${GROUP_WORD[c.group]}: ${w} point${w === 1 ? '' : 's'} a step.` + (c.notReal ? ' ' + NOT_REAL_TEXT : '');
  }

  const KEYS = NUM.concat(Object.keys(NEIGHBOURS));

  // total cost of changing one whole design into another
  function cost(fromT, toT) {
    const items = []; let total = 0, notReal = false;
    for (const key of KEYS) {
      if (!(key in fromT) || !(key in toT)) continue;
      const a = fromT[key], b = toT[key];
      if (String(a) === String(b)) continue;
      const c = traitCost(key, a, b, fromT, toT);
      if (!c.points) continue;
      total += c.points; if (c.notReal) notReal = true;
      items.push({ notReal: !!c.notReal, key, label: LABEL[key] || key, from: a, to: b, fromWord: word(key, a), toWord: word(key, b), points: c.points, group: c.group, why: whyOf(key, c, a, b) });
    }
    items.sort((x, y) => y.points - x.points || KEYS.indexOf(x.key) - KEYS.indexOf(y.key));
    return { total, items, notReal };
  }
  // points to change one trait to one value from the current design (0 when it already has that value; Infinity when it cannot be reached)
  function optionCost(traits, key, value) {
    if (!(key in traits) || String(traits[key]) === String(value)) return 0;
    return traitCost(key, traits[key], value, traits, { ...traits, [key]: value }).points;
  }
  function reachable(traits, key, value) { return isFinite(optionCost(traits, key, value)); }
  // Can the student make this change this era? base = the design at the start of the era, current = the design now.
  // Never lets the total go over the budget (Tom's feedback, 16 Nov 2026): the designer must not apply an option when ok is false.
  function afford(base, current, key, value, budget) {
    budget = budget == null ? BUDGET_PER_ERA : budget;
    const now = cost(base, current).total, after = cost(base, { ...current, [key]: value }).total;
    const price = after - now, left = Math.max(0, budget - now), pts = n => n + ' point' + (n === 1 ? '' : 's');
    if (!isFinite(after)) return { ok: false, price: Infinity, left, message: 'This cannot evolve from here.' };
    if (after <= budget) return { ok: true, price, left, message: '' };
    return { ok: false, price, left, message: `You can't afford this. It costs ${price} and you have ${pts(left)} left.` };
  }

  // ---- body plans
  const PLANS = {
    mammal: { cov: 'fur', blood: 'warm', breathe: 'lungs', legs: '4', wings: 'none' },
    bird: { cov: 'feathers', blood: 'warm', breathe: 'lungs', legs: '2', wings: 'fly' },
    lizard: { cov: 'scales', blood: 'cold', breathe: 'lungs', legs: '4', wings: 'none' },
    frog: { cov: 'skin', blood: 'cold', breathe: 'skinlungs', legs: '4', wings: 'none' },
    fish: { cov: 'scales', blood: 'cold', breathe: 'gills', legs: '0', wings: 'none' },
    insect: { cov: 'exo', blood: 'cold', breathe: 'tubes', legs: '6', wings: 'fly' },
    crab: { cov: 'exo', blood: 'cold', breathe: 'gills', legs: '6', wings: 'none' }
  };
  const PLAN_LINKS = [['fish', 'frog'], ['frog', 'lizard'], ['lizard', 'bird'], ['lizard', 'mammal'], ['insect', 'crab']];
  const PLAN_WORD = { mammal: 'mammal', bird: 'bird', lizard: 'reptile', frog: 'amphibian', fish: 'fish', insect: 'insect', crab: 'crustacean' };
  // the body plan a design is closest to (most matching body-plan traits; the order above breaks ties)
  function planOf(t) {
    let best = null, bs = -1;
    for (const name in PLANS) {
      const P = PLANS[name]; let s = 0;
      for (const k in P) { if (String(t[k]) === P[k]) s++; else if (k === 'wings' && P[k] === 'fly' && t[k] === 'flightless') s += .5; }
      if (name === 'fish' && t.fins === 'fins') s += .5;
      if (s > bs) { bs = s; best = name; }
    }
    return best;
  }
  function planSteps(a, b) {
    if (a === b) return 0;
    const prev = { [a]: 0 }; const q = [a];
    while (q.length) { const x = q.shift(); for (const l of PLAN_LINKS) { const y = l[0] === x ? l[1] : l[1] === x ? l[0] : null; if (y == null || y in prev) continue; prev[y] = prev[x] + 1; if (y === b) return prev[y]; q.push(y); } }
    return Infinity;
  }
  // the cheapest whole move from one plan's standard design to another's, for the notes and for teacher checks
  function planMoveCost(a, b) { return cost({ ...PLANS[a] }, { ...PLANS[b] }).total; }

  return { afford, NOT_REAL_TEXT, BUDGET_PER_ERA, WEIGHTS, NUM, NUM_UNITS_PER_POINT, NEIGHBOURS, LABEL, VALUE_WORD, PLANS, PLAN_LINKS, PLAN_WORD,
    cost, optionCost, reachable, steps, pathOf, planOf, planSteps, planMoveCost, word };
});
