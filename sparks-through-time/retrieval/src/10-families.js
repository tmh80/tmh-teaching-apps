/* 10-families.js: question generators for Sparks retrieval (33 families, directions A and B).
   Needs 01-data.js (RT_ELEMENTS, RT_LADDER, RT_DEMAND, RT_CO2). Every item is shaped like an item in REVIEWS,
   plus fam, dir, topic, obj and `p` (the numbers it was built from, used by the tests). */

/* ---------- random numbers and small helpers ---------- */
function rtRng(seedStr){
  const s = String(seedStr); let x = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++){ x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; }
  let a = x || 1;
  return function(){ a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rtInt = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const rtPick = (r, a) => a[Math.floor(r() * a.length)];
function rtShuf(r, a){ const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
const rtCap = s => s.charAt(0).toUpperCase() + s.slice(1);
const rtFix = (n, dp) => +n.toFixed(dp);
const rtT = n => String(+(+n).toFixed(6));                         /* 0.30 -> "0.3" */
const rtC = n => { const s = rtT(n).split('.'); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return s.join('.'); };
const rtS = n => (n < 0 ? '−' : '+') + Math.abs(n);              /* signed with a real minus */
const rtA = (n, d) => n.toFixed(d);
const rtPlural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

function rtMcq(r, q, right, wrongs, explain, extra){
  const seen = new Set([right]), pool = [];
  wrongs.forEach(w => { if (!seen.has(w)){ seen.add(w); pool.push(w); } });
  if (pool.length < 2) throw new Error('mcq needs two wrong answers: ' + q);
  const opts = pool.slice(0, 3), pos = Math.floor(r() * (opts.length + 1));
  opts.splice(pos, 0, right);
  return Object.assign({t: 'mcq', q, options: opts, answer: pos, explain}, extra || {});
}
const rtNum = (q, answer, unit, tol, explain, extra) => Object.assign({t: 'num', q, answer, unit: unit || '', tol: tol == null ? 0.001 : tol, explain}, extra || {});

/* ---------- families and slots ---------- */
const RT_FAMILIES = [
  {n: 'F1',  id: 'charge-rules',            stop: 'launch',         slots: {A: 'Apply',     B: 'Predict'}},
  {n: 'F2',  id: 'static-or-current',       stop: 'launch',         slots: {A: 'Apply',     B: 'Apply'}},
  {n: 'F3',  id: 'atom-numbers',            stop: 'atom',           slots: {A: 'Calculate', B: 'Calculate'}},
  {n: 'F4',  id: 'shells',                  stop: 'atom',           slots: {A: 'Apply',     B: 'Apply'}},
  {n: 'F5',  id: 'atom-evidence',           stop: 'atom',           slots: {A: 'Apply',     B: 'Predict'}},
  {n: 'F6',  id: 'electron-ladder',         stop: 'static',         slots: {A: 'Apply',     B: 'Apply'}},
  {n: 'F7',  id: 'electron-count',          stop: 'static',         slots: {A: 'Calculate', B: 'Calculate'}},
  {n: 'F8',  id: 'mystery-charge',          stop: 'static',         slots: {A: 'Predict',   B: 'Predict'}},
  {n: 'F9',  id: 'will-it-light',           stop: 'circuits',       slots: {A: 'Predict',   B: 'Predict'}},
  {n: 'F10', id: 'cell-count',              stop: 'circuits',       slots: {A: 'Calculate', B: 'Calculate'}},
  {n: 'F11', id: 'parts-and-symbols',       stop: 'circuits',       slots: {A: 'Apply',     B: 'Apply'}},
  {n: 'F12', id: 'electromagnet-strength',  stop: 'electromagnets', slots: {A: 'Predict',   B: 'Predict'}},
  {n: 'F13', id: 'results-pattern',         stop: 'electromagnets', slots: {A: 'Calculate', B: 'Calculate'}},
  {n: 'F14', id: 'fair-test',               stop: 'electromagnets', slots: {A: 'Apply',     B: 'Apply'}},
  {n: 'F15', id: 'ohm-triangle',            stop: 'ohm',            slots: {A: 'Calculate', B: 'Calculate'}},
  {n: 'F16', id: 'change-it',               stop: 'ohm',            slots: {A: 'Predict',   B: 'Predict'}},
  {n: 'F17', id: 'conductor-or-insulator',  stop: 'ohm',            slots: {A: 'Apply',     B: 'Apply'}},
  {n: 'F18', id: 'generator-changes',       stop: 'generators',     slots: {A: 'Predict',   B: 'Apply'}},
  {n: 'F19', id: 'generator-scale',         stop: 'generators',     slots: {A: 'Calculate', B: 'Calculate'}},
  {n: 'F20', id: 'energy-sums',             stop: 'bulb',           slots: {A: 'Calculate', B: 'Calculate'}},
  {n: 'F21', id: 'useful-or-wasted',        stop: 'bulb',           slots: {A: 'Apply',     B: 'Apply'}},
  {n: 'F22', id: 'what-gets-used-up',       stop: 'bulb',           slots: {A: 'Predict',   B: 'Predict'}},
  {n: 'F23', id: 'ammeter-readings',        stop: 'series',         slots: {A: 'Calculate', B: 'Calculate'}},
  {n: 'F24', id: 'series-or-parallel',      stop: 'series',         slots: {A: 'Predict',   B: 'Apply'}},
  {n: 'F25', id: 'ac-or-dc',                stop: 'acdc',           slots: {A: 'Apply',     B: 'Apply'}},
  {n: 'F26', id: 'frequency',               stop: 'acdc',           slots: {A: 'Calculate', B: 'Calculate'}},
  {n: 'F27', id: 'grid-journey',            stop: 'acdc',           slots: {A: 'Predict',   B: 'Predict'}},
  {n: 'F28', id: 'sort-sources',            stop: 'power',          slots: {A: 'Apply',     B: 'Predict'}},
  {n: 'F29', id: 'energy-chains',           stop: 'power',          slots: {A: 'Apply',     B: 'Apply'}},
  {n: 'F30', id: 'co2-compare',             stop: 'power',          slots: {A: 'Calculate', B: 'Calculate'}},
  {n: 'F31', id: 'demand-gap',              stop: 'future',         slots: {A: 'Calculate', B: 'Calculate'}},
  {n: 'F32', id: 'keep-the-lights-on',      stop: 'future',         slots: {A: 'Apply',     B: 'Predict'}},
  {n: 'X1',  id: 'think-like-a-scientist',  stop: 'launch',         slots: {A: 'Apply',     B: 'Apply'}, classOnly: true}
];
const RT_ID = {}; RT_FAMILIES.forEach(f => { RT_ID[f.n] = f.id; });
const RT_OBJ = {F1: ['Ai', 'Aii'], F2: ['Ai'], F3: ['Aii'], F4: ['Aii'], F5: ['Ai', 'Aiii'], F6: ['Aii'], F7: ['Aii'], F8: ['Aiii'], F9: ['Aii'], F10: ['Aii'], F11: ['Ai'], F12: ['Aii'], F13: ['Aii', 'Aiii'], F14: ['Aii'], F15: ['Aii'], F16: ['Aii'], F17: ['Ai', 'Aii'], F18: ['Ai', 'Aii'], F19: ['Aii'], F20: ['Aii', 'Dii'], F21: ['Ai'], F22: ['Aii', 'Aiii'], F23: ['Aii'], F24: ['Aii', 'Di'], F25: ['Ai', 'Aii'], F26: ['Aii'], F27: ['Aii', 'Di'], F28: ['Ai', 'Aiii'], F29: ['Di'], F30: ['Aii', 'Dii'], F31: ['Aii'], F32: ['Aii', 'Aiii'], X1: []};
/* A pair with no direction means both directions. X1 is class only and never appears here. */
const RT_SLOTS = (() => {
  const P = (n, d) => d ? [[RT_ID[n], d]] : [[RT_ID[n], 'A'], [RT_ID[n], 'B']];
  const cat = (...l) => [].concat(...l);
  return {
    launch:         {apply: cat(P('F2'), P('F1', 'A')), calc: [], predict: P('F1', 'B')},
    atom:           {apply: cat(P('F4'), P('F5', 'A')), calc: P('F3'), predict: P('F5', 'B')},
    static:         {apply: P('F6'), calc: P('F7'), predict: P('F8')},
    circuits:       {apply: P('F11'), calc: P('F10'), predict: P('F9')},
    electromagnets: {apply: P('F14'), calc: P('F13'), predict: P('F12')},
    ohm:            {apply: P('F17'), calc: P('F15'), predict: P('F16')},
    generators:     {apply: P('F18', 'B'), calc: P('F19'), predict: P('F18', 'A')},
    bulb:           {apply: P('F21'), calc: P('F20'), predict: P('F22')},
    series:         {apply: P('F24', 'B'), calc: P('F23'), predict: P('F24', 'A')},
    acdc:           {apply: P('F25'), calc: P('F26'), predict: P('F27')},
    power:          {apply: cat(P('F28', 'A'), P('F29')), calc: P('F30'), predict: P('F28', 'B')},
    future:         {apply: P('F32', 'A'), calc: P('F31'), predict: P('F32', 'B')}
  };
})();

const RT_GEN = {};

/* ---------- F1 Charge rules ---------- */
const RT1_OBJS = ['balloon', 'rod', 'ball', 'comb', 'straw'];
const RT1_CH = {'+': 'positive', '-': 'negative', '0': 'neutral'};
const rt1res = (a, b) => a === '0' && b === '0' ? 'Nothing' : (a === '0' || b === '0') ? 'Attract' : a === b ? 'Repel' : 'Attract';
function rt1label(c1, o1, c2, o2){
  if (c1 === c2 && o1 === o2) return `Two ${RT1_CH[c1]} ${o1}s`;
  return `A ${RT1_CH[c1]} ${o1} and a ${RT1_CH[c2]} ${o2}`;
}
RT_GEN.F1 = {
  A(r){
    const n = rtInt(r, 1, 3), rows = [], seen = new Set();
    while (rows.length < n){
      const c1 = rtPick(r, ['+', '-', '0']), c2 = rtPick(r, ['+', '-', '0']), o1 = rtPick(r, RT1_OBJS), o2 = rtPick(r, RT1_OBJS);
      const label = rt1label(c1, o1, c2, o2); if (seen.has(label)) continue; seen.add(label);
      rows.push({label, ans: [rt1res(c1, c2)], pair: c1 + c2});
    }
    return {t: 'table', q: 'Complete the table. What happens when the two objects are brought close together?', cols: [{name: 'What happens?', options: ['Attract', 'Repel', 'Nothing']}], rowHead: 'Objects', rows,
      explain: 'Like charges repel and opposite charges attract. A charged object attracts a neutral one. Two neutral objects do nothing.', p: {pairs: rows.map(x => x.pair), answers: rows.map(x => x.ans[0])}};
  },
  B(r){
    const k = rtInt(r, 0, 2), o = rtPick(r, RT1_OBJS), m = rtPick(r, RT1_OBJS), c = rtPick(r, ['+', '-']);
    const cn = RT1_CH[c], on = RT1_CH[c === '+' ? '-' : '+'];
    if (k === 0) return rtMcq(r, `Mystery ${m} X <b>repels</b> a ${cn} ${o}. What is the charge on X?`, `${rtCap(cn)}, because only like charges repel`,
      rtShuf(r, [`${rtCap(on)}, because opposite charges repel`, 'Neutral, because neutral objects push charged ones away', 'You can’t tell, because pushing proves nothing']),
      `X is ${cn}. Only like charges repel, so a repel proves the charge.`, {p: {k}});
    if (k === 1) return rtMcq(r, `Mystery ${m} X <b>attracts</b> a ${cn} ${o}. What could the charge on X be?`, `${rtCap(on)} or neutral, because attraction alone can’t tell which`,
      rtShuf(r, [`Only ${on}, because attracted means it must be opposite`, `${rtCap(cn)}, because like charges attract`, 'Only neutral, because charged objects never attract each other']),
      `An attract leaves two choices: X could be ${on}, or X could be neutral. Only a repel proves a charge.`, {p: {k}});
    return rtMcq(r, `Mystery ${m} X <b>attracts</b> a neutral ${o}. What could the charge on X be?`, 'Positive or negative, because a charged object attracts a neutral one',
      rtShuf(r, ['Neutral, because neutral objects attract each other', 'Neither, because neutral objects can’t be attracted to anything', 'Only negative, because the neutral object has more electrons']),
      'Two neutral objects do nothing, so X must be charged. Its sign cannot be told from this test.', {p: {k}});
  }
};

/* ---------- F2 Static or current ---------- */
const RT2_S = ['Lightning flashing in a storm cloud', 'Hair standing up after taking off a hat', 'A balloon sticking to the wall', 'A small shock from a car door handle', 'Dust clinging to a TV screen', 'Crackles when you pull off a jumper', 'A comb picking up tiny bits of paper', 'A shock from a metal door handle'];
const RT2_C = ['A flashlight shining in the dark', 'A phone charging from a socket', 'A doorbell ringing at the front door', 'A fridge keeping the food cold', 'A laptop running on its battery', 'An electric bus driving through Beijing', 'A hairdryer blowing warm air', 'A bedside lamp glowing at night'];
RT_GEN.F2 = {
  A(r){
    const n = rtInt(r, 3, 5), ns = rtInt(r, 1, n - 1);
    const items = rtShuf(r, rtShuf(r, RT2_S).slice(0, ns).map(x => [x, 0]).concat(rtShuf(r, RT2_C).slice(0, n - ns).map(x => [x, 1])));
    return {t: 'sort', q: 'Sort each example into <b>static</b> or <b>current</b> electricity.', groups: ['Static', 'Current'], items,
      explain: 'Static charge builds up, stays put and may jump once as a spark. Current is charge that keeps flowing round a loop.', p: {n}};
  },
  B(r){
    const cur = r() < 0.5;
    const right = rtPick(r, cur ? RT2_C : RT2_S);
    const pref = cur ? ['Lightning flashing in a storm cloud', 'A small shock from a car door handle'] : ['A laptop running on its battery', 'A phone charging from a socket'];
    const other = (cur ? RT2_S : RT2_C), first = pref.filter(x => other.includes(x)), rest = rtShuf(r, other.filter(x => !first.includes(x)));
    const wrongs = rtShuf(r, first.concat(rest).slice(0, 3));
    const q = cur ? 'Which one is charge that <b>keeps flowing</b> round a loop?' : 'Which one is charge that <b>builds up, stays put</b> and may jump once as a spark?';
    return rtMcq(r, q, right, wrongs, cur ? 'Current is charge that keeps flowing round a loop. A spark such as lightning is static charge jumping once.' : 'Static charge builds up and stays put until it jumps as a spark. Batteries and sockets give a flowing current.', {p: {cur}});
  }
};

/* ---------- F3 Atom numbers ---------- */
const RT_IONS = [['Li', 1], ['Be', 2], ['O', -2], ['F', -1], ['Na', 1], ['Mg', 2], ['Al', 3], ['S', -2], ['Cl', -1], ['K', 1], ['Ca', 2]];
const rtIon = (sym, c) => sym + (Math.abs(c) > 1 ? ['', '', '²', '³'][Math.abs(c)] : '') + (c > 0 ? '⁺' : '⁻');
const rtEl = sym => RT_ELEMENTS.find(e => e.sym === sym);
function rtElCard(e, showN){
  if (typeof h !== 'function') return undefined;
  return el => el.append(h('div', {style: {display: 'inline-flex', gap: '14px', alignItems: 'center', padding: '8px 14px', border: '2px solid var(--line, #888)', borderRadius: '10px'}},
    h('b', {style: {fontSize: '1.8rem'}}, e.sym), h('div', {}, h('div', {}, e.name), h('div', {}, 'Atomic number: ' + e.p), h('div', {}, 'Mass number: ' + e.mass))));
}
RT_GEN.F3 = {
  A(r){
    const mode = rtPick(r, [0, 1, 1, 1, 2, 2, 3, 3]);
    if (mode === 3){
      const [sym, c] = rtPick(r, RT_IONS), e = rtEl(sym), ans = e.p - c;
      return rtNum(`A ${e.name.toLowerCase()} ion, ${rtIon(sym, c)}, has atomic number ${e.p}. How many electrons does it have?`, ans, 'electrons', 0.001,
        `The ion has a charge of ${rtS(c)}, so electrons = protons − charge: ${e.p} − (${rtS(c)}) = ${ans}.`, {vis: rtElCard(e), p: {mode, sym, p: e.p, charge: c}});
    }
    const e = rtPick(r, RT_ELEMENTS), art = /^[aeiou]/i.test(e.name) ? 'An' : 'A';
    const head = `${art} ${e.name.toLowerCase()} atom has atomic number ${e.p} and mass number ${e.mass}.`;
    if (mode === 0) return rtNum(`${head} How many protons does it have?`, e.p, 'protons', 0.001, `Protons = atomic number = ${e.p}.`, {vis: rtElCard(e), p: {mode, p: e.p, mass: e.mass}});
    if (mode === 1) return rtNum(`${head} How many neutrons does it have?`, e.mass - e.p, 'neutrons', 0.001, `Neutrons = mass number − atomic number = ${e.mass} − ${e.p} = ${e.mass - e.p}.`, {vis: rtElCard(e), p: {mode, p: e.p, mass: e.mass}});
    return rtNum(`${head} How many electrons does a neutral atom of it have?`, e.p, 'electrons', 0.001, `In a neutral atom, electrons = protons = ${e.p}.`, {vis: rtElCard(e), p: {mode, p: e.p, mass: e.mass}});
  },
  B(r){
    const mode = rtPick(r, [0, 1, 2, 2]);
    if (mode === 0){
      const e = rtPick(r, RT_ELEMENTS), wr = [], seen = new Set([e.p]);
      [e.n, e.p + 1, e.p - 1, e.p + 2, e.p - 2, e.p - 3].forEach(z => { if (z >= 1 && z <= 20 && !seen.has(z)){ seen.add(z); wr.push(RT_ELEMENTS[z - 1].name); } });
      return rtMcq(r, `A neutral atom has ${e.p} protons, ${e.n} neutrons and ${e.p} electrons. Which element is it?`, e.name, wr,
        `The number of protons is the atomic number, ${e.p}, and that is ${e.name.toLowerCase()}.`, {p: {mode, p: e.p, n: e.n}});
    }
    if (mode === 1){
      const e = rtPick(r, RT_ELEMENTS);
      return rtNum(`An atom has ${e.p} protons and ${e.n} neutrons. What is its mass number?`, e.p + e.n, '', 0.001, `Mass number = protons + neutrons = ${e.p} + ${e.n} = ${e.p + e.n}.`, {p: {mode, p: e.p, n: e.n}});
    }
    const [sym, c] = rtPick(r, RT_IONS), e = rtEl(sym), el = e.p - c;
    return rtNum(`An atom has ${e.p} protons, ${e.n} neutrons and ${el} electrons. What is its overall charge? (Type the number, with a minus sign if it is negative.)`, c, '', 0.001,
      `Overall charge = protons − electrons = ${e.p} − ${el} = ${rtS(c)}. It is a ${e.name.toLowerCase()} ion.`, {p: {mode, p: e.p, e: el, charge: c}});
  }
};

/* ---------- F4 Electron shells ---------- */
const rtShells = z => [Math.min(z, 2), Math.min(Math.max(z - 2, 0), 8), Math.min(Math.max(z - 10, 0), 8)];
function rtShellTxt(s){
  const a = s.filter(x => x > 0), last = a[a.length - 1];
  if (a.length === 1) return `one shell holding ${a[0]} electron${a[0] > 1 ? 's' : ''}`;
  return `shells of ${a.slice(0, -1).join(', ')} and ${last} electron${last > 1 ? 's' : ''}`;
}
RT_GEN.F4 = {
  A(r){
    const e = rtPick(r, RT_ELEMENTS.slice(0, 18)), s = rtShells(e.p), opts = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
    return {t: 'table', q: `A neutral ${e.name.toLowerCase()} atom has ${e.p} electrons. How many electrons sit in each shell? Fill from the inside, and use 0 for an empty shell.`,
      cols: [{name: 'Electrons', options: opts}], rowHead: 'Shell', rows: ['First shell', 'Second shell', 'Third shell'].map((l, i) => ({label: l, ans: [String(s[i])]})),
      explain: `Fill from the inside: the first shell holds up to 2, the next up to 8. ${e.p} electrons fill as ${s.join(', ')}.`, p: {z: e.p, shells: s}};
  },
  B(r){
    const e = rtPick(r, RT_ELEMENTS.slice(0, 18)), s = rtShells(e.p), a = s.filter(x => x > 0), last = a[a.length - 1];
    const seen = new Set([e.p]), pool = [];
    const add = z => { if (z >= 1 && z <= 18 && !seen.has(z)){ seen.add(z); pool.push(RT_ELEMENTS[z - 1].name); } };
    add(e.n); add(last); rtShuf(r, [e.p + 1, e.p - 1, e.p + 2, e.p - 2]).forEach(add);
    return rtMcq(r, `A neutral atom has ${rtShellTxt(s)}. Which element is it?`, e.name, pool, `Add up the electrons: ${a.join(' + ')} = ${e.p}. A neutral atom has as many electrons as protons, so the atomic number is ${e.p}: ${e.name.toLowerCase()}.`, {p: {z: e.p, shells: s}});
  }
};

/* ---------- F5 Evidence and models ---------- */
const RT5 = [
  {m: 'Democritus’s atoms (400 BCE)', short: 'Democritus', idea: 'Everything is made of tiny pieces that cannot be cut', qs: ['Which idea says everything is made of tiny pieces that cannot be cut?', 'Which idea came from thinking alone, with no experiments?', 'Which model dates from 400 BCE?']},
  {m: 'Dalton’s solid sphere model (1803)', short: 'Dalton', idea: 'Atoms are solid spheres, one kind for each element', qs: ['Which model pictures atoms as solid spheres, with a different kind for each element?', 'Which model fits elements always combining in fixed amounts?', 'Which model dates from 1803?']},
  {m: 'Thomson’s plum pudding model (1897)', short: 'Thomson', idea: 'Electrons dotted through a ball of positive charge', qs: ['Which model pictures electrons dotted through a ball of positive charge?', 'Which model came from cathode rays bending towards a positive plate?', 'Which model dates from 1897?']},
  {m: 'Rutherford’s nuclear model (1911)', short: 'Rutherford', idea: 'A tiny positive nucleus at the centre', qs: ['Which model first had a tiny positive nucleus?', 'Which model came from a few alpha particles bouncing back from gold foil?', 'Which model dates from 1911?']},
  {m: 'Bohr’s shell model (1913)', short: 'Bohr', idea: 'Electrons in shells at set distances', qs: ['Which model first put electrons in shells?', 'Which model fits atoms giving out only certain colours of light?', 'Which model dates from 1913?']}
];
const RT5B = [
  {q: 'If Thomson’s plum pudding model were right, what should alpha particles do at gold foil?', right: 'Almost all should go straight through, and none should bounce back', wrongs: ['Many should bounce straight back off the gold atoms', 'Most should be bent sharply to one side by the nucleus', 'All should be stopped by the solid spheres of gold'], ex: 'Thomson’s atom has no hard centre, so nothing should bounce the alpha particles back. Rutherford saw a few bounce back, which showed a tiny nucleus.'},
  {q: 'Which result could Dalton’s solid sphere model <b>not</b> explain?', right: 'Tiny negative particles being pulled out of atoms', wrongs: ['Elements always combining in fixed amounts', 'Each element having its own kind of atom', 'Atoms being too small to see'], ex: 'Dalton’s atoms have no parts inside, so they cannot give out electrons. Thomson found electrons in 1897.'},
  {q: 'Which result could Thomson’s model <b>not</b> explain?', right: 'A few alpha particles bouncing straight back from gold foil', wrongs: ['Tiny negative particles coming out of atoms', 'Atoms being neutral overall', 'Atoms containing electrons'], ex: 'A ball of spread-out positive charge cannot bounce an alpha particle straight back. Rutherford’s tiny nucleus can.'},
  {q: 'Which result could Rutherford’s model <b>not</b> explain?', right: 'Atoms giving out only certain colours of light', wrongs: ['Most alpha particles going straight through gold foil', 'A few alpha particles bouncing straight back', 'Atoms having a tiny positive centre'], ex: 'Bohr added electron shells to explain the certain colours of light that atoms give out.'},
  {q: 'What did Bohr’s model add to Rutherford’s model?', right: 'Electrons move in shells at set distances from the nucleus', wrongs: ['A solid ball of positive charge with electrons inside it', 'A tiny positive nucleus at the centre of the atom', 'Atoms that cannot be split and have no parts'], ex: 'Rutherford already had the nucleus. Bohr put the electrons in shells.'},
  {q: 'Why do scientists still learn about Thomson’s plum pudding model?', right: 'It explained the evidence of its time and led to better models', wrongs: ['It was wrong and useless, so it is only kept for history', 'It is still the model scientists use for every atom today', 'It was never tested, so nobody knows if it is right'], ex: 'Each model explained the evidence of its time. New evidence led to better models, so old models are not useless.'},
  {q: 'If Rutherford’s model were right, what should a few alpha particles do at gold foil?', right: 'Bounce back when they hit the tiny positive nucleus', wrongs: ['Pass straight through, because the atom has no centre', 'Stick to the foil, because the electrons are negative', 'Turn into electrons, because the gold is solid'], ex: 'A tiny, dense, positive nucleus pushes a head-on alpha particle back. That is what the scientists saw.'}
];
RT_GEN.F5 = {
  A(r){
    if (r() < 0.3){
      const ms = rtShuf(r, RT5).slice(0, rtInt(r, 3, 4));
      return {t: 'match', q: 'Match each idea to the scientist whose model it belongs to.', rowHead: 'Idea', cols: [{name: 'Scientist', options: rtShuf(r, RT5.map(x => x.short))}], rows: ms.map(x => ({label: x.idea, ans: [x.short]})),
        explain: 'Dalton has solid spheres, Thomson adds electrons, Rutherford adds a tiny positive nucleus and Bohr adds shells.', p: {}};
    }
    const i = rtInt(r, 0, 4), j = rtInt(r, 0, 2), partner = i === 2 ? 3 : i === 3 ? 2 : -1;
    const others = RT5.map((x, k) => k).filter(k => k !== i), first = partner >= 0 ? [partner] : [];
    const wr = first.concat(rtShuf(r, others.filter(k => !first.includes(k)))).slice(0, 3).map(k => RT5[k].m);
    return rtMcq(r, RT5[i].qs[j], RT5[i].m, wr, `That belongs to ${RT5[i].m}. Each model answers the evidence of its time: Dalton has solid spheres, Thomson adds electrons, Rutherford adds a tiny positive nucleus and Bohr adds shells.`, {p: {i, j}});
  },
  B(r){
    const s = rtPick(r, RT5B);
    return rtMcq(r, s.q, s.right, rtShuf(r, s.wrongs), s.ex, {p: {}});
  }
};

/* ---------- F6 Electron ladder ---------- */
const RT6_PAIRS = [];
for (let i = 0; i < RT_LADDER.length; i++) for (let j = i + 2; j < RT_LADDER.length; j++) RT6_PAIRS.push([i, j]);
function rtLadderVis(){
  if (typeof h !== 'function') return undefined;
  return el => el.append(h('div', {class: 'info-card'}, h('b', {}, 'Electron ladder (top to bottom)'), h('ol', {style: {margin: '6px 0 6px 20px'}}, RT_LADDER.map(m => h('li', {}, m))),
    h('span', {class: 'legend'}, 'Materials higher up lose electrons more easily. Materials lower down grab electrons more easily.')));
}
RT_GEN.F6 = {
  A(r){
    const [hi, lo] = rtPick(r, RT6_PAIRS), flip = r() < 0.5, a = flip ? lo : hi, b = flip ? hi : lo;
    const sign = i => i === hi ? 'Positive' : 'Negative';
    return {t: 'table', q: `${RT_LADDER[a]} is rubbed with ${RT_LADDER[b].toLowerCase()}. Which charge does each one get?`, cols: [{name: 'Charge', options: ['Positive', 'Negative']}], rowHead: 'Material', vis: rtLadderVis(),
      rows: [{label: RT_LADDER[a], ans: [sign(a)]}, {label: RT_LADDER[b], ans: [sign(b)]}],
      explain: `${RT_LADDER[lo]} is lower on the ladder, so it grabs electrons and becomes negative. ${RT_LADDER[hi]} loses electrons and becomes positive.`, p: {hi, lo, a, b}};
  },
  B(r){
    const [hi, lo] = rtPick(r, RT6_PAIRS), P = RT_LADDER[hi].toLowerCase(), N = RT_LADDER[lo].toLowerCase();
    if (r() < 0.5) return rtMcq(r, `${RT_LADDER[hi]} becomes positive when rubbed with ${N}. Which way did the electrons move?`, `From the ${P} onto the ${N}`,
      rtShuf(r, [`From the ${N} onto the ${P}`, `Protons moved from the ${P} onto the ${N}`, 'No electrons moved: rubbing made new charge on both']),
      `The positive material lost electrons and the negative one gained them, so the electrons moved from the ${P} onto the ${N}. Rubbing does not make charge.`, {vis: rtLadderVis(), p: {hi, lo, mode: 0}});
    return rtMcq(r, `${RT_LADDER[hi]} is rubbed with ${N} and becomes positive. Which material is lower on the electron ladder?`, `The ${N}, because it grabbed the electrons`,
      rtShuf(r, [`The ${P}, because it grabbed the electrons`, 'They are on the same rung, because rubbing makes charge', `The ${P}, because the rubbed material always becomes negative`]),
      `The lower material grabs electrons and becomes negative. ${RT_LADDER[hi]} became positive, so the ${N} is lower.`, {vis: rtLadderVis(), p: {hi, lo, mode: 1}});
  }
};

/* ---------- F7 Counting electrons ---------- */
const RT7_PAIRS = [['balloon', 'jumper'], ['comb', 'hair'], ['rod', 'cloth'], ['straw', 'wool'], ['ruler', 'cloth']];
RT_GEN.F7 = {
  A(r){
    const [a, b] = rtPick(r, RT7_PAIRS), n = rtInt(r, 3, 24), ask = rtPick(r, ['gain', 'loss']);
    const q = `A ${a} and a ${b} start neutral. ${n} electrons move from the ${b} to the ${a}. What is the charge on the ${ask === 'gain' ? a : b}? (Type the number, with a minus sign if it is negative.)`;
    const ans = ask === 'gain' ? -n : n;
    return rtNum(q, ans, '', 0.001, ask === 'gain' ? `The ${a} gained ${n} electrons, and each electron is −1, so its charge is −${n}.` : `The ${b} lost ${n} electrons, so its charge is +${n}. The two charges add up to zero.`, {p: {n, ask, ans}});
  },
  B(r){
    const [a, b] = rtPick(r, RT7_PAIRS), n = rtInt(r, 3, 24), sgn = rtPick(r, [-1, 1]);
    if (r() < 0.6){
      const ans = -sgn * n;
      return rtNum(`After rubbing, a ${a} has a charge of ${rtS(sgn * n)}. What is the charge on the ${b}? (Type the number, with a minus sign if it is negative.)`, ans, '', 0.001,
        `The two objects started neutral, so the charges add up to zero: the ${b} has ${rtS(ans)}. ${sgn < 0 ? `The ${b} lost the ${n} electrons that the ${a} gained.` : `The ${a} lost ${n} electrons and the ${b} gained them.`}`, {p: {n, sgn, mode: 0, ans}});
    }
    return rtNum(`After rubbing, a ${a} has a charge of ${rtS(sgn * n)}. How many electrons moved between the ${a} and the ${b}?`, n, 'electrons', 0.001,
      `Each electron changes the charge by 1, so ${n} electrons moved.`, {p: {n, sgn, mode: 1, ans: n}});
  }
};

/* ---------- F8 Mystery charge ---------- */
RT_GEN.F8 = {
  A(r){
    const hid = rtPick(r, ['+', '-', '0']), nm = rtPick(r, ['B', 'C', 'D', 'X', 'Y']);
    const res = bc => rt1res(hid, bc) === 'Repel' ? 'repelled by' : 'attracted to';
    const q = `Ball ${nm} is ${res('+')} a positive test ball and ${res('-')} a negative test ball. What is the charge on ball ${nm}?`;
    if (hid === '0') return rtMcq(r, q, 'Neutral: it is attracted by both balls and never repelled', ['Positive: it is attracted to the negative ball, so it must be opposite', 'Negative: it is attracted to the positive ball, so it must be opposite'].concat(['You can’t tell: attraction never proves a charge']),
      'Only a charged ball can repel. Ball ' + nm + ' is attracted by both test balls, so it is neutral.', {p: {hid}});
    const cn = RT1_CH[hid], on = RT1_CH[hid === '+' ? '-' : '+'];
    return rtMcq(r, q, `${rtCap(cn)}: only the ${cn} ball repelled it`, [`${rtCap(on)}: it was attracted to the ${on} ball`, 'Neutral: it was attracted to one of the balls', 'You can’t tell: attraction never proves a charge'].slice(0, 3),
      `It was repelled by the ${cn} ball, and only like charges repel, so ball ${nm} is ${cn}. It was attracted to the ${on} ball because opposite charges attract.`, {p: {hid}});
  },
  B(r){
    const hid = rtPick(r, ['+', '-', '0']), nm = rtPick(r, ['B', 'C', 'D', 'X', 'Y']);
    const label = hid === '0' ? 'neutral' : RT1_CH[hid];
    return {t: 'table', q: `Ball ${nm} is ${label}. What will it do near a positive test ball, then near a negative test ball?`, cols: [{name: 'What happens?', options: ['Attract', 'Repel', 'Nothing']}], rowHead: 'Test ball',
      rows: [{label: 'Near a positive ball', ans: [rt1res(hid, '+')]}, {label: 'Near a negative ball', ans: [rt1res(hid, '-')]}],
      explain: hid === '0' ? 'A neutral ball is attracted to both a positive and a negative ball.' : `Like charges repel and opposite charges attract, so a ${label} ball repels the ${label} test ball and attracts the other one.`, p: {hid}};
  }
};

/* ---------- circuit helpers (same grid keys as Circuit.loopWith and Circuit.parallel) ---------- */
function rtLoop(parts, gaps){
  const ed = {}, keys = [];
  for (let c = 0; c < 4; c++) keys.push('h,0,' + c);
  keys.push('v,0,4', 'v,1,4');
  for (let c = 3; c >= 0; c--) keys.push('h,2,' + c);
  keys.push('v,1,0', 'v,0,0');
  keys.forEach(k => { if (!(gaps || []).includes(k)) ed[k] = {type: 'wire'}; });
  for (const k in parts){ const t = parts[k]; ed[k] = typeof t === 'string' ? {type: t} : Object.assign({}, t); }
  return ed;
}
function rtPar(n, parts){
  const ed = {};
  for (let r = 0; r <= n; r++) for (let c = 0; c < 4; c++) ed[`h,${r},${c}`] = {type: 'wire'};
  for (let r = 0; r < n; r++){ ed[`v,${r},0`] = {type: 'wire'}; ed[`v,${r},4`] = {type: 'wire'}; }
  for (const k in parts){ const t = parts[k]; ed[k] = typeof t === 'string' ? {type: t} : Object.assign({}, t); }
  return ed;
}
const rtBypass = c => ({['v,0,' + c]: 'wire', ['h,1,' + c]: 'wire', ['v,0,' + (c + 1)]: 'wire'});
function rtCircVis(edges, rows){
  if (typeof Circuit === 'undefined' || !Circuit.board) return undefined;
  return el => Circuit.board(el, {cols: 4, rows: rows || 2, edges, readonly: true, mini: true, hideResults: true, view: 'symbols'});
}
const rtLoopKeys = (skip) => { const ks = []; for (let c = 0; c < 4; c++) ks.push('h,0,' + c); ks.push('v,0,4', 'v,1,4'); for (let c = 0; c < 4; c++) ks.push('h,2,' + c); ks.push('v,0,0', 'v,1,0'); return ks.filter(k => !skip.includes(k)); };

/* ---------- F9 Will it light? ---------- */
const RT9 = {
  loop:    {lit: true,  cur: 0.36, q: 'Will the bulb in this circuit light up? Choose the answer and the reason.',
    right: 'It lights: the loop is complete, so the cell can push current through the bulb', wrongs: ['It stays dark: one cell is never enough to light a bulb', 'It stays dark: a bulb needs a switch before it can light', 'It lights, but only if a second cell is added'],
    ex: 'There is a cell, a bulb and a complete loop, so about 0.36 A flows and the bulb lights.'},
  gap:     {lit: false, cur: 0, q: 'Will the bulb in this circuit light up? Choose the answer and the reason.',
    right: 'It stays dark: there is a gap, so the loop is not complete', wrongs: ['It lights: the cell can still push current across a small gap', 'It lights: current flows round until it reaches the gap', 'It stays dark: the cell is facing the wrong way round'],
    ex: 'A gap breaks the loop, so no current flows (0 A) and the bulb stays dark.',
    fix: 'Close the gap with a piece of wire', fixW: ['Add a second cell next to the first one', 'Put a wire across the bulb to give it more current', 'Swap the bulb for a bigger bulb']},
  swopen:  {lit: false, cur: 0, q: 'Will the bulb in this circuit light up? Choose the answer and the reason.',
    right: 'It stays dark: the open switch makes a gap in the loop', wrongs: ['It lights: current can still squeeze through an open switch', 'It lights, but dimmer: an open switch only slows the current down', 'It stays dark: a switch always uses up the cell’s energy'],
    ex: 'An open switch is a gap in the loop, so no current flows (0 A).',
    fix: 'Close the switch to complete the loop', fixW: ['Add a second cell next to the first one', 'Turn the cell round the other way', 'Put a wire across the bulb to give it more current']},
  swclosed:{lit: true,  cur: 0.36, q: 'Will the bulb in this circuit light up? Choose the answer and the reason.',
    right: 'It lights: the closed switch completes the loop', wrongs: ['It stays dark: any switch in a circuit stops the current', 'It stays dark: a switch uses up the cell’s energy', 'It lights, but only if the switch is open'],
    ex: 'A closed switch is just a piece of wire, so the loop is complete and about 0.36 A flows.'},
  short:   {lit: false, cur: 0, q: 'A plain wire joins one side of the bulb to the other. Will the bulb light up? Choose the answer and the reason.',
    right: 'It stays dark: nearly all the current takes the wire, so the bulb gets almost none', wrongs: ['It lights brightly: the wire across it gives it more current', 'It lights as normal: a wire across the bulb makes no difference', 'It stays dark: the wire across the bulb breaks the circuit'],
    ex: 'The wire across the bulb is a short circuit. The current takes the easy path through the wire, so almost none goes through the bulb.',
    fix: 'Take away the wire that is across the bulb', fixW: ['Add a second wire across the bulb as well', 'Turn the cell round the other way', 'Add a second cell next to the first one']},
  spare:   {lit: true,  cur: 0.36, q: 'A spare wire is joined to the circuit at one end only. Will the bulb light up? Choose the answer and the reason.',
    right: 'It lights: the spare wire is joined at one end only, so the loop is not changed', wrongs: ['It stays dark: a spare wire joined at one end breaks the circuit', 'It lights brighter: the spare wire gives the current more room', 'It stays dark: the spare wire takes the current away from the bulb'],
    ex: 'Current only flows along a wire that is part of a loop. The spare wire leads nowhere, so about 0.36 A still flows through the bulb.'},
  opp:     {lit: false, cur: 0, q: 'Will the bulb in this circuit light up? Choose the answer and the reason.',
    right: 'It stays dark: the two cells push against each other and cancel out', wrongs: ['It lights brightly: two cells are always brighter than one', 'It lights: two cells give twice the push of one', 'It lights dimly: each cell pushes half as hard'],
    ex: 'The cells face opposite ways, so their pushes cancel and no current flows (0 A).',
    fix: 'Turn one cell round so both push the same way', fixW: ['Put a wire across the bulb to give it more current', 'Add a closed switch to the loop', 'Add a second bulb to the loop']},
  same:    {lit: true,  cur: 0.68, q: 'Will the bulb in this circuit light up? Choose the answer and the reason.',
    right: 'It lights, brighter than with one cell: both cells push the same way', wrongs: ['It stays dark: two cells always cancel each other out', 'It lights the same as with one cell: extra cells change nothing', 'It stays dark: two cells use up each other’s energy'],
    ex: 'Both cells push the same way, so the push doubles and about 0.68 A flows.'},
  twogap:  {lit: false, cur: 0, q: 'Will either bulb in this circuit light up? Choose the answer and the reason.',
    right: 'Neither lights: the gap breaks the one and only path', wrongs: ['Both light: the current finds its way round the gap', 'Only the bulb nearest the cell lights, because it gets the current first', 'Both light, but dimly, because the gap shares the current'],
    ex: 'Two bulbs in series make one path. A gap anywhere stops the current (0 A) and both bulbs stay dark.',
    fix: 'Close the gap in the wire', fixW: ['Add a second cell next to the first one', 'Turn the cell round the other way', 'Take one bulb out and leave the gap']},
  twoshort:{lit: true,  cur: 0.36, q: 'Two bulbs are in series. A plain wire is joined across one of them. Will the other bulb light up? Choose the answer and the reason.',
    right: 'It lights: the loop is complete, and the wire lets the current skip the first bulb', wrongs: ['It stays dark: a wire across one bulb shorts out the whole loop', 'It lights, but only dimly, because both bulbs still share the current', 'It stays dark: the bulb with the wire takes all the energy'],
    ex: 'The wire is a short circuit across one bulb, so that bulb goes dark. The other bulb is still in a complete loop and gets about 0.36 A.'},
  parallel:{lit: true,  cur: 0.36, q: 'One bulb in this parallel circuit has been unscrewed. Will the other bulb light up? Choose the answer and the reason.',
    right: 'It lights: it still has its own complete path back to the cell', wrongs: ['It goes out: all the bulbs need to be working for any to light', 'It gets dimmer: parallel bulbs share the current', 'It gets much brighter: it takes the current from both branches'],
    ex: 'Each parallel branch is a separate loop. The bulb on the good branch still gets about 0.36 A.'}
};
const RT9_IDS = Object.keys(RT9), RT9_DARK = RT9_IDS.filter(k => !RT9[k].lit);
function rtSetup(r, id){
  const b = rtInt(r, 0, 3), c = rtInt(r, 0, 3), B = 'h,0,' + b, C = 'h,2,' + c;
  const base = {[B]: 'bulb', [C]: 'cell'};
  let e, rows = 2;
  if (id === 'loop') e = rtLoop(base);
  else if (id === 'gap') e = rtLoop(base, [rtPick(r, rtLoopKeys([B, C]))]);
  else if (id === 'swopen' || id === 'swclosed'){ const x = rtPick(r, [0, 1, 2, 3].filter(v => v !== b)); e = rtLoop(Object.assign({['h,0,' + x]: {type: 'switch', closed: id === 'swclosed'}}, base)); }
  else if (id === 'short') e = rtLoop(Object.assign({}, rtBypass(b), base));
  else if (id === 'spare'){ const left = b === 0 ? true : b === 3 ? false : r() < 0.5; e = rtLoop(Object.assign(left ? {['v,0,' + b]: 'wire', ['h,1,' + b]: 'wire'} : {['v,0,' + (b + 1)]: 'wire', ['h,1,' + b]: 'wire'}, base)); }
  else if (id === 'opp' || id === 'same'){ const c2 = rtPick(r, [0, 1, 2, 3].filter(v => v !== c)); e = rtLoop({[B]: 'bulb', [C]: 'cell', ['h,2,' + c2]: id === 'opp' ? {type: 'cell', flip: true} : 'cell'}); }
  else if (id === 'twogap' || id === 'twoshort'){
    const two = rtShuf(r, [0, 1, 2, 3]).slice(0, 2).sort(), parts = {['h,0,' + two[0]]: 'bulb', ['h,0,' + two[1]]: 'bulb', [C]: 'cell'};
    e = id === 'twogap' ? rtLoop(parts, [rtPick(r, rtLoopKeys(Object.keys(parts)))]) : rtLoop(Object.assign({}, rtBypass(two[1]), parts));
  } else { /* parallel: one branch unscrewed */
    const ba = rtInt(r, 0, 3), bb = rtInt(r, 0, 3), broken = rtInt(r, 0, 1);
    e = rtPar(2, {['h,0,' + ba]: broken === 0 ? {type: 'bulb', broken: true} : 'bulb', ['h,1,' + bb]: broken === 1 ? {type: 'bulb', broken: true} : 'bulb', [C]: 'cell'});
  }
  return {edges: e, rows};
}
RT_GEN.F9 = {
  A(r){
    const id = rtPick(r, RT9_IDS), s = RT9[id], st = rtSetup(r, id);
    return rtMcq(r, s.q, s.right, rtShuf(r, s.wrongs), s.ex, {vis: rtCircVis(st.edges, st.rows), diagram: {edges: st.edges}, edges: st.edges, p: {setup: id, lit: s.lit, cur: s.cur}});
  },
  B(r){
    const id = rtPick(r, RT9_DARK), s = RT9[id], st = rtSetup(r, id);
    const q = id === 'twogap' ? 'Neither bulb in this circuit lights up. Which one change will make them light up?' : 'The bulb in this circuit stays dark. Which one change will make it light up?';
    return rtMcq(r, q, s.fix, rtShuf(r, s.fixW), `${s.fix}. ${s.ex}`, {vis: rtCircVis(st.edges, st.rows), diagram: {edges: st.edges}, edges: st.edges, p: {setup: id, lit: s.lit, cur: s.cur}});
  }
};

/* ---------- F10 Adding cells ---------- */
RT_GEN.F10 = {
  A(r){
    let n, rev, k;
    do { n = rtInt(r, 1, 8); rev = rtInt(r, 0, 3); k = n - 2 * rev; } while (k < 1 || k > 8 || rev > n);
    const q = rev === 0 ? `${n} cells of 1.5 V are joined in a row, all facing the same way. What is the total voltage?` : `${n} cells of 1.5 V are joined in a row. ${rev === 1 ? 'One faces' : rev + ' face'} the wrong way. What is the total voltage?`;
    return rtNum(q, rtFix(1.5 * k, 1), 'V', 0.001, rev === 0 ? `Each cell adds 1.5 V: ${n} × 1.5 = ${rtT(1.5 * k)} V.` : `${n - rev} push forward and ${rev} push back, so ${n - rev} − ${rev} = ${k} cells count: 1.5 × ${k} = ${rtT(1.5 * k)} V.`, {p: {n, rev, k}});
  },
  B(r){
    const k = rtInt(r, 1, 8), v = rtFix(1.5 * k, 1);
    return rtNum(`A toy needs ${rtT(v)} V. How many 1.5 V cells must face the same way?`, k, 'cells', 0.001, `${rtT(v)} ÷ 1.5 = ${k} cells.`, {p: {k, v}});
  }
};

/* ---------- F11 Parts and symbols ---------- */
const RT11 = {
  cell: {name: 'Cell', job: 'pushes the current round the circuit'}, bulb: {name: 'Bulb', job: 'turns electrical energy into light'},
  switch: {name: 'Switch', job: 'opens or closes a gap in the circuit'}, ammeter: {name: 'Ammeter', job: 'measures the current, in amps (A)'},
  voltmeter: {name: 'Voltmeter', job: 'measures the voltage, in volts (V)'}, resistor: {name: 'Resistor', job: 'makes it harder for current to flow'},
  led: {name: 'LED', job: 'gives out light and lets current through one way'}, motor: {name: 'Motor', job: 'turns electrical energy into movement'},
  buzzer: {name: 'Buzzer', job: 'turns electrical energy into sound'}, wire: {name: 'Wire', job: 'joins the parts and lets current flow'}
};
const RT11_KEYS = Object.keys(RT11);
RT_GEN.F11 = {
  A(r){
    if (r() < 0.5){
      const ks = rtShuf(r, RT11_KEYS).slice(0, rtInt(r, 3, 4));
      return {t: 'match', q: 'Match each part to its job.', rowHead: 'Part', cols: [{name: 'Its job', options: rtShuf(r, ks.map(k => RT11[k].job))}],
        rows: ks.map(k => ({label: RT11[k].name, vis: typeof symVis === 'function' && typeof Circuit !== 'undefined' ? symVis(k) : undefined, ans: [RT11[k].job]})),
        explain: ks.map(k => `${RT11[k].name}: ${RT11[k].job}.`).join(' '), p: {keys: ks}};
    }
    const k = rtPick(r, RT11_KEYS), wr = rtShuf(r, RT11_KEYS.filter(x => x !== k && !(k === 'bulb' && x === 'led') && !(k === 'led' && x === 'bulb'))).slice(0, 3).map(x => 'It ' + RT11[x].job);
    return rtMcq(r, `What does a ${RT11[k].name === 'LED' ? 'LED' : RT11[k].name.toLowerCase()} do?`, 'It ' + RT11[k].job, wr, `${RT11[k].name}: ${RT11[k].job}.`, {p: {key: k}});
  },
  B(r){
    if (r() < 0.5){
      const meter = rtPick(r, ['ammeter', 'voltmeter']), other = meter === 'ammeter' ? 'voltmeter' : 'ammeter';
      const what = meter === 'ammeter' ? 'current' : 'voltage', unit = meter === 'ammeter' ? ['amps (A)', 'volts (V)'] : ['volts (V)', 'amps (A)'];
      const art = n => (n === 'ammeter' ? 'An ammeter' : 'A voltmeter');
      return rtMcq(r, `Which meter measures ${what}, and in which unit?`, `${art(meter)}, in ${unit[0]}`, [`${art(other)}, in ${unit[0]}`, `${art(meter)}, in ${unit[1]}`, `${art(other)}, in ${unit[1]}`],
        meter === 'ammeter' ? 'An ammeter measures current in amps (A) and goes in the loop.' : 'A voltmeter measures voltage in volts (V) and goes across a part.', {p: {meter}});
    }
    const k = rtPick(r, RT11_KEYS.filter(x => x !== 'ammeter' && x !== 'voltmeter')), wr = rtShuf(r, RT11_KEYS.filter(x => x !== k && !(k === 'bulb' && x === 'led') && !(k === 'led' && x === 'bulb'))).slice(0, 3).map(x => RT11[x].name);
    return rtMcq(r, `Which part ${RT11[k].job}?`, RT11[k].name, wr, `${RT11[k].name}: ${RT11[k].job}.`, {p: {key: k}});
  }
};

/* ---------- F12 Stronger or weaker? ---------- */
const RT12_F = {iron: 10, steel: 7, aluminium: 1, wood: 1, none: 1};
const RT12_N = {iron: 'an iron core', steel: 'a steel core', aluminium: 'an aluminium core', wood: 'a wooden core', none: 'no core'};
const rtClips = (coils, cells, core) => Math.round(coils * cells * RT12_F[core] / 50);
const rtDesc12 = m => `${m.coils} coils, ${rtPlural(m.cells, 'cell')} and ${RT12_N[m.core]}`;
function rtPair12(r){
  for (;;){
    const mixed = r() < 0.4, cores = mixed ? rtShuf(r, [rtPick(r, ['iron', 'steel']), rtPick(r, ['iron', 'steel', 'aluminium', 'wood', 'none'])]) : ['iron', 'iron'];
    const P = {coils: rtInt(r, 1, 6) * 10, cells: rtInt(r, 1, 4), core: cores[0]}, Q = {coils: rtInt(r, 1, 6) * 10, cells: rtInt(r, 1, 4), core: cores[1]};
    P.clips = rtClips(P.coils, P.cells, P.core); Q.clips = rtClips(Q.coils, Q.cells, Q.core);
    const hi = Math.max(P.clips, Q.clips), lo = Math.min(P.clips, Q.clips);
    if (lo >= 1 && hi * 4 >= lo * 5) return {P, Q, mixed: !(cores[0] === 'iron' && cores[1] === 'iron')};
  }
}
const rtPairTxt = (pr) => pr.mixed ? `Electromagnet P has ${rtDesc12(pr.P)}. Electromagnet Q has ${rtDesc12(pr.Q)}.`
  : `Electromagnet P has ${pr.P.coils} coils and ${rtPlural(pr.P.cells, 'cell')}. Q has ${pr.Q.coils} coils and ${rtPlural(pr.Q.cells, 'cell')}. Both have iron cores.`;
RT_GEN.F12 = {
  A(r){
    if (r() < 0.3){
      const pairs = [rtPair12(r), rtPair12(r)];
      return {t: 'table', q: 'Which electromagnet in each pair is stronger? The sim’s rule: clips ≈ coils ÷ 10 × cells × 2 × the core’s strength.', cols: [{name: 'Stronger', options: ['P is stronger', 'Q is stronger']}], rowHead: 'The pair',
        rows: pairs.map(pr => ({label: rtPairTxt(pr), ans: [pr.P.clips > pr.Q.clips ? 'P is stronger' : 'Q is stronger']})),
        explain: pairs.map(pr => `${pr.P.clips} clips for P against ${pr.Q.clips} clips for Q.`).join(' '), p: {pairs: pairs.map(pr => [pr.P, pr.Q])}};
    }
    const pr = rtPair12(r), win = pr.P.clips > pr.Q.clips ? 'P' : 'Q', lose = win === 'P' ? 'Q' : 'P';
    return rtMcq(r, `${rtPairTxt(pr)} Which is stronger?`, `${win} is stronger`, [`${lose} is stronger`, 'They are equally strong', 'You can’t tell from the numbers'],
      `${win} is stronger: ${pr[win].clips} clips against ${pr[lose].clips} clips. Strength grows with coils and cells, and iron is the best core.`, {p: {pair: [pr.P, pr.Q]}});
  },
  B(r){
    const k = rtInt(r, 0, 2);
    if (k === 0){
      const core = rtPick(r, ['steel', 'wood', 'aluminium', 'none']), right = core === 'none' ? 'Put an iron core inside the coils' : 'Swap the ' + (core === 'wood' ? 'wooden' : core) + ' core for an iron core';
      return rtMcq(r, `You can’t add cells or coils. How can you make an electromagnet with ${RT12_N[core]} stronger?`, right, rtShuf(r, ['Swap the core for a copper one', 'Wrap thicker plastic round the coils', 'Take some coils off the wire']),
        'Iron is the best core. Steel is next, and aluminium, wood or no core barely help. Copper is a metal but is not magnetic, and fewer coils would make it weaker.', {p: {k, core}});
    }
    if (k === 1) return rtMcq(r, 'You can’t add any more cells. How can you make an electromagnet with an iron core stronger?', 'Wind more coils onto the iron core', rtShuf(r, ['Take some coils off the wire', 'Swap the iron core for a wooden one', 'Wrap thicker plastic round the coils']),
      'More coils make a stronger electromagnet. Fewer coils or a wooden core would make it weaker, and plastic does not help.', {p: {k}});
    return rtMcq(r, 'You can’t add any more coils. How can you make an electromagnet with an iron core stronger?', 'Add one more cell to the circuit', rtShuf(r, ['Take one cell out of the circuit', 'Swap the iron core for a wooden one', 'Wrap thicker plastic round the coils']),
      'More cells give a bigger current, so a stronger electromagnet. A wooden core or plastic would not help.', {p: {k}});
  }
};

/* ---------- F13 Read the pattern ---------- */
const rtTbl = (h1, h2, rows) => `<table class="data"><thead><tr><th>${h1}</th><th>${h2}</th></tr></thead><tbody>${rows.map(x => `<tr><td>${x[0]}</td><td>${x[1]}</td></tr>`).join('')}</tbody></table>`;
RT_GEN.F13 = {
  A(r, o){
    if (o.challenge && r() < 0.5){
      const L = rtInt(r, 5, 12) * 50, n = rtPick(r, [3, 5, 6, 7, 8, 9]);
      return rtNum(`A crane electromagnet with 50 coils lifts these loads:${rtTbl('Cells', 'Heaviest load it can lift (kg)', [[1, rtC(L)], [2, rtC(2 * L)], [4, rtC(4 * L)]])}Each cell lifts the same amount. What is the largest load, in kg, that ${n} cells can lift?`, n * L, 'kg', 0.001,
        `Each cell lifts ${rtC(L)} kg, so ${n} cells lift ${n} × ${rtC(L)} = ${rtC(n * L)} kg.`, {challenge: true, p: {L, n}});
    }
    const k = rtInt(r, 2, 6), rowsC = rtShuf(r, [10, 20, 30, 40]).slice(0, 3).sort((a, b) => a - b);
    const cand = []; for (let c = 15; c <= 75; c += 5) if (!rowsC.includes(c) && (c * k) % 10 === 0) cand.push(c);
    const c = rtPick(r, cand);
    return rtNum(`An electromagnet with 1 cell picks up this many paper clips:${rtTbl('Coils', 'Clips', rowsC.map(x => [x, x * k / 10]))}Predict the number of clips it picks up with ${c} coils.`, c * k / 10, 'clips', 0.001,
      `The pattern is ${k} clips for every 10 coils, so ${c} coils pick up ${c / 10} × ${k} = ${c * k / 10} clips.`, {p: {k, coils: c, rows: rowsC}});
  },
  B(r, o){
    if (o.challenge && r() < 0.5){
      let L, M; do { L = rtInt(r, 5, 12) * 50; M = rtInt(r, 7, 29) * 100; } while (M % L === 0 || Math.ceil(M / L) < 2 || Math.ceil(M / L) > 10);
      const coils = rtPick(r, [30, 40, 50, 60, 70]), n = Math.ceil(M / L);
      return rtNum(`With ${coils} coils, each cell lifts ${rtC(L)} kg. What is the fewest cells needed to lift a load with a mass of ${rtC(M)} kg?`, n, 'cells', 0.001,
        `${rtC(M)} ÷ ${rtC(L)} = ${rtT(M / L)}, so round up. ${n - 1} cells lift only ${rtC((n - 1) * L)} kg, but ${n} cells lift ${rtC(n * L)} kg.`, {challenge: true, p: {L, M, coils}});
    }
    const k = rtInt(r, 2, 6), cand = []; for (let c = 15; c <= 75; c += 5) if ((c * k) % 10 === 0) cand.push(c);
    const c = rtPick(r, cand), T = c * k / 10;
    return rtNum(`An electromagnet with 1 cell picks up ${k} clips for every 10 coils. How many coils does it need to pick up ${T} clips?`, c, 'coils', 0.001,
      `${T} ÷ ${k} = ${rtT(T / k)} lots of 10 coils, so it needs ${c} coils.`, {p: {k, clips: T, coils: c}});
  }
};

/* ---------- F14 Fair test ---------- */
const RT14 = [
  {q: 'Does the number of coils change how many clips an electromagnet picks up?', iv: 'the number of coils', dv: 'the number of clips picked up', ctl: 'the number of cells'},
  {q: 'Does the number of cells change how many clips an electromagnet picks up?', iv: 'the number of cells', dv: 'the number of clips picked up', ctl: 'the number of coils'},
  {q: 'Does the material of the core change how many clips an electromagnet picks up?', iv: 'the material of the core', dv: 'the number of clips picked up', ctl: 'the number of coils'},
  {q: 'Does the material in a tester change the current in the circuit?', iv: 'the material in the tester', dv: 'the current in the circuit', ctl: 'the cell that is used'},
  {q: 'Do the turns each second of a generator change its peak voltage?', iv: 'the turns each second', dv: 'the peak voltage', ctl: 'the number of turns of wire'},
  {q: 'Does the number of bulbs in series change the current?', iv: 'the number of bulbs in series', dv: 'the current in the circuit', ctl: 'the cell that is used'}
];
const RT14_ROLES = ['Independent variable (what you change)', 'Dependent variable (what you measure)', 'Controlled variable (what you keep the same)'];
RT_GEN.F14 = {
  A(r){
    const s = rtPick(r, RT14), v = [s.iv, s.dv, s.ctl];
    if (r() < 0.5) return {t: 'table', q: `Research question: ${s.q} Choose the variable for each job.`, cols: [{name: 'Variable', options: rtShuf(r, v.map(rtCap))}], rowHead: 'Job',
      rows: RT14_ROLES.map((l, i) => ({label: l, ans: [rtCap(v[i])]})), explain: `You change ${s.iv}, you measure ${s.dv}, and you keep ${s.ctl} the same.`, p: {inv: RT14.indexOf(s)}};
    const role = rtInt(r, 0, 2), word = ['independent', 'dependent', 'controlled'][role];
    const wr = role === 2 ? [rtCap(v[0]), rtCap(v[1])] : [rtCap(v[role === 0 ? 1 : 0]), rtCap(v[2])];
    return rtMcq(r, `${s.q} Name the ${word} variable.`, rtCap(v[role]), wr, `You change ${s.iv} (independent), you measure ${s.dv} (dependent), and you keep ${s.ctl} the same (controlled).`, {p: {inv: RT14.indexOf(s), role}});
  },
  B(r){
    const s = rtPick(r, RT14);
    return rtMcq(r, `You change ${s.iv} and measure ${s.dv}. Which research question fits?`, `How does ${s.iv} change ${s.dv}?`,
      rtShuf(r, [`How does ${s.dv} change ${s.iv}?`, `How does ${s.ctl} change ${s.dv}?`, `How does ${s.iv} change ${s.ctl}?`]),
      `The question should link the thing you change (${s.iv}) to the thing you measure (${s.dv}).`, {p: {inv: RT14.indexOf(s)}});
  }
};

/* ---------- F15 V = I x R ---------- */
let rt15 = null;
function rtOhmSets(){
  if (rt15) return rt15; rt15 = [];
  [1.5, 3, 4.5, 6, 9, 12].forEach(V => { for (let R = 2; R <= 120; R++){ const i1000 = V * 1000 / R; if (Number.isInteger(i1000) && i1000 >= 20 && i1000 <= 6000) rt15.push([V, R, i1000 / 1000]); } });
  return rt15;
}
function rtTriangle(){
  if (typeof sv !== 'function') return undefined;
  return el => { const s = sv('svg', {viewBox: '0 0 140 100', width: 140, height: 100, role: 'img', 'aria-label': 'Ohm’s law triangle: V on top, I and R along the bottom'});
    s.append(sv('path', {d: 'M70 8 L132 92 L8 92 Z', fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.5}), sv('line', {x1: 28, y1: 62, x2: 112, y2: 62, stroke: 'var(--ink)', 'stroke-width': 2}),
      sv('text', {x: 70, y: 52, 'text-anchor': 'middle', 'font-size': 22, fill: 'var(--ink)'}, 'V'), sv('text', {x: 44, y: 86, 'text-anchor': 'middle', 'font-size': 22, fill: 'var(--ink)'}, 'I'),
      sv('text', {x: 96, y: 86, 'text-anchor': 'middle', 'font-size': 22, fill: 'var(--ink)'}, 'R'));
    el.append(s); };
}
RT_GEN.F15 = {
  A(r){
    const [V, R, I] = rtPick(r, rtOhmSets());
    return rtNum(`A current of ${rtT(I)} A flows through a ${R} Ω resistor. What is the voltage? (V = I × R)`, V, 'V', 0.001, `V = I × R = ${rtT(I)} × ${R} = ${rtT(V)} V.`, {vis: rtTriangle(), p: {V, R, I, ask: 'V'}});
  },
  B(r){
    const [V, R, I] = rtPick(r, rtOhmSets());
    if (r() < 0.5) return rtNum(`A ${rtT(V)} V supply drives ${rtT(I)} A through a resistor. What is its resistance? (R = V ÷ I)`, R, 'Ω', 0.001, `R = V ÷ I = ${rtT(V)} ÷ ${rtT(I)} = ${R} Ω.`, {vis: rtTriangle(), p: {V, R, I, ask: 'R'}});
    return rtNum(`A ${rtT(V)} V supply is joined to a ${R} Ω resistor. What current flows? (I = V ÷ R)`, I, 'A', 0.0005, `I = V ÷ R = ${rtT(V)} ÷ ${R} = ${rtT(I)} A.`, {vis: rtTriangle(), p: {V, R, I, ask: 'I'}});
  }
};

/* ---------- F16 Change it ---------- */
const RT16_F = [[2, 1], [3, 1], [1, 2]];
const RT16_V = {'2/1': 'double the voltage', '3/1': 'make the voltage three times as big', '1/2': 'halve the voltage'};
const RT16_R = {'2/1': 'double the resistance', '3/1': 'make the resistance three times as big', '1/2': 'halve the resistance'};
const rt16phrase = {'2/1': 'twice as big', '3/1': 'three times as big', '1/2': 'half as big', '1/3': 'a third as big', '4/1': 'four times as big', '9/1': 'nine times as big', '1/4': 'a quarter as big'};
RT_GEN.F16 = {
  A(r){
    const I0 = rtPick(r, [300, 600, 1200]), choices = [];
    for (const fv of [[1, 1]].concat(RT16_F)) for (const fr of [[1, 1]].concat(RT16_F)) if (!(fv[0] === 1 && fv[1] === 1 && fr[0] === 1 && fr[1] === 1)) choices.push([fv, fr]);
    const [fv, fr] = rtPick(r, choices), i1000 = I0 * fv[0] * fr[1] / (fv[1] * fr[0]);
    const vTxt = RT16_V[fv.join('/')], rTxt = RT16_R[fr.join('/')];
    const sentence = !vTxt ? `You ${rTxt} and keep the voltage the same.` : !rTxt ? `You ${vTxt} and keep the resistance the same.` : `You ${vTxt} and ${rTxt}.`;
    return rtNum(`A circuit carries ${rtT(I0 / 1000)} A. ${sentence} What is the new current?`, rtFix(i1000 / 1000, 3), 'A', 0.0005,
      `Current goes up in step with voltage and down in step with resistance: ${rtT(I0 / 1000)} × ${fv[0]}/${fv[1]} ÷ (${fr[0]}/${fr[1]}) = ${rtT(i1000 / 1000)} A.`, {p: {I0: I0 / 1000, fv, fr}});
  },
  B(r){
    const I0 = rtPick(r, [300, 600, 1200]), f = rtPick(r, RT16_F), key = f.join('/'), what = rtPick(r, ['voltage', 'resistance']);
    const ratio = what === 'voltage' ? f : [f[1], f[0]];                   /* current ratio */
    const i1 = I0 * ratio[0] / ratio[1], inv = f[1] + '/' + f[0], sq = Math.pow(f[0] / f[1], 2);
    const sqKey = sq === 4 ? '4/1' : sq === 9 ? '9/1' : '1/4';
    const other = what === 'voltage' ? 'resistance' : 'voltage';
    const wr = [`It became ${rt16phrase[inv]}`, 'It stayed the same', `It became ${rt16phrase[sqKey]}`];
    return rtMcq(r, `The current goes from ${rtT(I0 / 1000)} A to ${rtT(i1 / 1000)} A. The ${other} stayed the same. What happened to the ${what}?`, `It became ${rt16phrase[key]}`, rtShuf(r, wr),
      what === 'voltage' ? `Current goes up in step with voltage, so the voltage became ${rt16phrase[key]}.` : `More resistance gives less current, so the resistance became ${rt16phrase[key]}.`, {p: {I0: I0 / 1000, I1: i1 / 1000, what, f}});
  }
};

/* ---------- F17 Conductor or insulator? ---------- */
const RT17_C = ['Copper', 'Aluminium', 'Iron', 'Steel'], RT17_I = ['Plastic', 'Wood', 'Glass', 'Rubber', 'Paper'];
const RT17_P = {
  graphite: {name: 'graphite (pencil lead)', right: 'A conductor, but not as good as a metal', wrongs: ['An insulator, because it is not a metal', 'A conductor as good as copper', 'A semiconductor like silicon']},
  'salty water': {name: 'salty water', right: 'A conductor, but only a weak one', wrongs: ['An insulator, because water always insulates', 'A conductor as good as a metal', 'A semiconductor like silicon']},
  silicon: {name: 'silicon', right: 'A semiconductor, which conducts a little', wrongs: ['A metal with lots of free electrons', 'An insulator that holds its electrons tightly', 'A conductor as good as copper']}
};
const RT17B = [
  {q: 'Why is copper used inside a wire, with plastic round it?', right: 'Copper has free electrons, so current flows. Plastic holds its electrons tightly, so it keeps us safe', wrongs: ['Copper holds its electrons tightly, so current flows. Plastic has free electrons, so it keeps us safe', 'Every solid conducts, so the plastic is only there to add some colour', 'Plastic uses up the electrons that reach it, so none of the current can escape']},
  {q: 'An electrician wears rubber gloves. Why does this keep them safe?', right: 'Rubber holds its electrons tightly, so current cannot flow through it', wrongs: ['Rubber uses up the electrons that reach it, so the current stops', 'Every solid conducts, but rubber conducts too slowly to hurt', 'Rubber is a metal, so it carries the current away']},
  {q: 'A student says all water is an insulator. What should you tell them?', right: 'Salty water conducts a little, because charged particles can move in it', wrongs: ['Water always insulates, because it is a liquid and not a metal', 'Salty water conducts as well as copper, because it has free electrons', 'Water conducts only when it is frozen into ice']},
  {q: 'Which material is the best choice for the metal core of a wire?', right: 'Copper: its free electrons carry the current', wrongs: ['Wood: all solids conduct, so any solid will do', 'Rubber: it holds its electrons tightly, so it carries the current', 'Paper: it is thin, so the current squeezes through']},
  {q: 'Which material is the best choice for the coating on a wire?', right: 'Plastic: it holds its electrons tightly, so it keeps the current in', wrongs: ['Steel: all solids conduct, so any solid will do', 'Copper: it has free electrons, so it keeps us safe', 'Salty water: water always insulates, so it keeps us safe']},
  {q: 'Is every solid material able to carry a current?', right: 'No: wood and glass are solids that hold their electrons tightly', wrongs: ['Yes: every solid conducts, some just conduct more slowly', 'Yes: a solid only has to be hard to carry current', 'No: only liquids can carry a current']}
];
RT_GEN.F17 = {
  A(r){
    if (r() < 0.65){
      const n = rtInt(r, 3, 5), nc = rtInt(r, 1, n - 1);
      const items = rtShuf(r, rtShuf(r, RT17_C).slice(0, nc).map(x => [x, 0]).concat(rtShuf(r, RT17_I).slice(0, n - nc).map(x => [x, 1])));
      return {t: 'sort', q: 'Sort each material into <b>conductor</b> or <b>insulator</b>.', groups: ['Conductor', 'Insulator'], items,
        explain: 'Metals have free electrons, so they conduct. Insulators hold their electrons tightly.', p: {n}};
    }
    const k = rtPick(r, Object.keys(RT17_P)), s = RT17_P[k];
    return rtMcq(r, `A material tester is joined to ${s.name}. Which description fits best?`, s.right, rtShuf(r, s.wrongs), `${rtCap(s.name)}: ${s.right.toLowerCase()}.`, {p: {k}});
  },
  B(r){
    const s = rtPick(r, RT17B);
    return rtMcq(r, s.q, s.right, rtShuf(r, s.wrongs), 'Metals have free electrons, so they conduct. Insulators hold their electrons tightly. Not every solid conducts, and electrons are not used up in an insulator.', {p: {}});
  }
};

/* ---------- F18 Generator changes ---------- */
const RT18 = [['Spin the magnet faster', 'up'], ['Spin the magnet more slowly', 'down'], ['Use more turns of wire', 'up'], ['Use fewer turns of wire', 'down'], ['Use a stronger magnet', 'up'], ['Use a weaker magnet', 'down'], ['Stop the magnet spinning', 'zero']];
const RT18_W = {up: 'Goes up', down: 'Goes down', zero: 'Drops to zero'};
RT_GEN.F18 = {
  A(r){
    if (r() < 0.6){
      const rows = rtShuf(r, RT18).slice(0, rtInt(r, 3, 4));
      return {t: 'table', q: 'A generator has a magnet spinning inside a coil. What happens to the peak voltage for each change?', cols: [{name: 'Peak voltage', options: ['Goes up', 'Goes down', 'Drops to zero']}], rowHead: 'The change',
        rows: rows.map(x => ({label: x[0], ans: [RT18_W[x[1]]]})), explain: 'Faster spinning, more turns of wire and a stronger magnet all raise the peak voltage. A magnet that stops spinning gives zero.', p: {}};
    }
    const c = rtPick(r, RT18);
    return rtMcq(r, `A generator has a magnet spinning inside a coil. You make this change: ${c[0].toLowerCase()}. What happens to the peak voltage?`, c[1] === 'zero' ? 'It drops to zero: a still magnet makes no voltage' : c[1] === 'up' ? 'It goes up, because the coil is cut more strongly' : 'It goes down, because the coil is cut less strongly',
      c[1] === 'zero' ? ['It stays the same: a still magnet still makes a little current', 'It goes up: the magnet is easier to hold close to the coil', 'It goes down, but not to zero'] : c[1] === 'up' ? ['It goes down, because the coil is cut less strongly', 'It stays the same, because a bigger bulb makes more voltage', 'It drops to zero: the generator has stopped'] : ['It goes up, because the coil is cut more strongly', 'It stays the same, because a bigger bulb makes more voltage', 'It drops to zero: the generator has stopped'],
      'Peak voltage goes up with faster spinning, more turns and a stronger magnet. A still magnet gives zero.', {p: {c: c[0]}});
  },
  B(r){
    const k = rtInt(r, 0, 2), blocked = ['the magnet', 'how fast it spins', 'the coil of wire'][k];
    const right = [['Spin the magnet faster', 'Use more turns of wire'], ['Use more turns of wire', 'Use a stronger magnet'], ['Spin the magnet faster', 'Use a stronger magnet']][k];
    const wrongPool = ['Spin the magnet more slowly', 'Use fewer turns of wire', 'Use a weaker magnet', 'Use a bigger bulb in the circuit', 'Hold the magnet still inside the coil'];
    const opts = rtShuf(r, right.concat(rtShuf(r, wrongPool).slice(0, 3)));
    return {t: 'multi', q: `You can’t change ${blocked}. Which changes would still raise the peak voltage? Tick all that apply.`, options: opts, answers: opts.map((o, i) => right.includes(o) ? i : -1).filter(i => i >= 0),
      explain: 'Peak voltage goes up with faster spinning, more turns of wire and a stronger magnet. A bigger bulb does not make more voltage, and a still magnet gives none.', p: {k}};
  }
};

/* ---------- F19 Scale the voltage ---------- */
const RT19_PAIRS = [[100, 200, 'x2'], [200, 400, 'x2'], [100, 300, 'x3'], [200, 300, 'x1.5'], [200, 100, '/2'], [400, 200, '/2']];
RT_GEN.F19 = {
  A(r){
    if (r() < 0.5){
      let p10, t0, t1; do { p10 = rtInt(r, 2, 30); t0 = rtInt(r, 2, 10); t1 = rtInt(r, 2, 10); } while (t0 === t1);
      return rtNum(`A dynamo gives ${rtT(p10 * t0 / 10)} V at ${t0} turns each second. What is the peak voltage at ${t1} turns each second?`, rtFix(p10 * t1 / 10, 1), 'V', 0.001,
        `The peak goes up in step with the turns each second: ${rtT(p10 / 10)} V for each turn each second, × ${t1} = ${rtT(p10 * t1 / 10)} V.`, {p: {p10, t0, t1, mode: 0}});
    }
    const [T0, T1] = rtPick(r, RT19_PAIRS), k = rtInt(r, T1 < T0 ? 2 : 1, 25), v100 = 40 * k, n100 = v100 * T1 / T0;
    return rtNum(`A generator has ${T0} turns of wire and gives a peak of ${rtT(v100 / 100)} V. With ${T1} turns of wire and everything else the same, what peak voltage does it give?`, rtFix(n100 / 100, 2), 'V', 0.001,
      `The peak goes up in step with the turns of wire: ${rtT(v100 / 100)} × ${T1} ÷ ${T0} = ${rtT(n100 / 100)} V.`, {p: {T0, T1, v: v100 / 100, mode: 1}});
  },
  B(r){
    if (r() < 0.5){
      let p10, t0, t1; do { p10 = rtInt(r, 2, 30); t0 = rtInt(r, 2, 10); t1 = rtInt(r, 2, 10); } while (t0 === t1);
      return rtNum(`A dynamo gives ${rtT(p10 * t0 / 10)} V at ${t0} turns each second. How many turns each second give ${rtT(p10 * t1 / 10)} V?`, t1, 'turns each second', 0.001,
        `${rtT(p10 * t0 / 10)} V ÷ ${t0} = ${rtT(p10 / 10)} V for each turn each second. ${rtT(p10 * t1 / 10)} ÷ ${rtT(p10 / 10)} = ${t1}.`, {p: {p10, t0, t1, mode: 0}});
    }
    const [T0, T1] = rtPick(r, RT19_PAIRS), k = rtInt(r, T1 < T0 ? 2 : 1, 25), v100 = 40 * k, n100 = v100 * T1 / T0;
    return rtNum(`A generator gives ${rtT(v100 / 100)} V with ${T0} turns of wire. How many turns of wire give ${rtT(n100 / 100)} V?`, T1, 'turns', 0.001,
      `${rtT(n100 / 100)} ÷ ${rtT(v100 / 100)} = ${rtT(T1 / T0)}, so the turns change by the same factor: ${T0} × ${rtT(T1 / T0)} = ${T1}.`, {p: {T0, T1, v: v100 / 100, mode: 1}});
  }
};

/* ---------- F20 Energy sums ---------- */
const RT20 = [
  {dev: 'A filament bulb', lo: 5, hi: 12, type: 'light'}, {dev: 'An LED', lo: 30, hi: 50, type: 'light'},
  {dev: 'An electric fan', lo: 60, hi: 80, type: 'movement'}, {dev: 'A kettle', lo: 85, hi: 95, type: 'heat'}
];
function rt20pick(r){
  const d = rtPick(r, RT20), pct = rtInt(r, d.lo, d.hi), cand = [];
  for (let e = 40; e <= 1200; e += 5) if ((e * pct) % 100 === 0) cand.push(e);
  const E = rtPick(r, cand); return {d, pct, E, U: E * pct / 100};
}
function rt20bulbs(r, tens){
  for (;;){
    const n = rtInt(r, 10, 200), oldW = rtPick(r, [40, 60, 100]), newW = rtPick(r, [6, 9, 12]), hrs = rtInt(r, 4, 12), W = n * (oldW - newW);
    if (!tens || (W * hrs) % 10 === 0) return {n, oldW, newW, hrs, W};
  }
}
RT_GEN.F20 = {
  A(r, o){
    if (o.challenge && r() < 0.5){
      const s = rt20bulbs(r, false);
      return rtNum(`A school swaps ${s.n} old ${s.oldW} W bulbs for ${s.newW} W LED bulbs. How many watts of power does the school save when all the lights are on?`, s.W, 'W', 0.001,
        `Each swap saves ${s.oldW} − ${s.newW} = ${s.oldW - s.newW} W. For ${s.n} bulbs: ${s.n} × ${s.oldW - s.newW} = ${rtC(s.W)} W.`, {challenge: true, p: s});
    }
    const {d, pct, E, U} = rt20pick(r), head = `${d.dev} gets ${E} J of electrical energy and gives out ${U} J of useful ${d.type}.`;
    if (r() < 0.5) return rtNum(`${head} How much energy is wasted?`, E - U, 'J', 0.001, `Wasted energy = energy in − useful energy = ${E} − ${U} = ${E - U} J.`, {p: {E, U, mode: 0}});
    return rtNum(`${head} What percentage of the energy is useful?`, pct, '%', 0.001, `Percentage useful = useful ÷ energy in × 100 = ${U} ÷ ${E} × 100 = ${pct}%.`, {p: {E, U, mode: 1}});
  },
  B(r, o){
    if (o.challenge && r() < 0.5){
      const s = rt20bulbs(r, true), kwh = rtFix(s.W * s.hrs / 1000, 2);
      return rtNum(`A school swaps ${s.n} old ${s.oldW} W bulbs for ${s.newW} W LED bulbs. The lights are on for ${s.hrs} hours each day. How many kWh of energy does the school save each day?`, kwh, 'kWh', 0.005,
        `Power saved = ${s.n} × (${s.oldW} − ${s.newW}) = ${rtC(s.W)} W = ${rtT(s.W / 1000)} kW. Energy saved = ${rtT(s.W / 1000)} × ${s.hrs} = ${rtT(kwh)} kWh.`, {challenge: true, p: s});
    }
    const {d, pct, E, U} = rt20pick(r);
    return rtNum(`${d.dev} turns ${pct}% of its energy into useful ${d.type}. It gets ${E} J. How much useful ${d.type} energy comes out?`, U, 'J', 0.001, `${E} × ${pct} ÷ 100 = ${U} J.`, {p: {E, pct, U}});
  }
};

/* ---------- F21 Useful or wasted? ---------- */
const RT21 = [
  {art: 'a toaster', outs: [['heat', 1], ['light', 0]]}, {art: 'a laptop', outs: [['light', 1], ['heat', 0]]}, {art: 'a kettle', outs: [['heat', 1], ['sound', 0]]},
  {art: 'a filament bulb', outs: [['light', 1], ['heat', 0]]}, {art: 'an LED lamp', outs: [['light', 1], ['heat', 0]]}, {art: 'an electric drill', outs: [['movement', 1], ['sound', 0], ['heat', 0]]},
  {art: 'an electric fan', outs: [['movement', 1], ['sound', 0]]}, {art: 'a radio', outs: [['sound', 1], ['heat', 0]]}, {art: 'a television', outs: [['light', 1], ['sound', 1], ['heat', 0]]},
  {art: 'an electric heater', outs: [['heat', 1], ['light', 0]]}, {art: 'a doorbell', outs: [['sound', 1], ['heat', 0]]}, {art: 'a hairdryer', outs: [['heat', 1], ['movement', 1], ['sound', 0]]}
];
const RT21_E = {heat: 'Heat, to warm things up', light: 'Light, to see by', movement: 'Movement, to move things', sound: 'Sound, to be heard'};
RT_GEN.F21 = {
  A(r){
    const all = []; RT21.forEach(d => d.outs.forEach(o => all.push([rtCap(o[0]) + ' from ' + d.art, o[1]])));
    const n = rtInt(r, 3, 5), nu = rtInt(r, 1, n - 1), used = new Set(), items = [];
    const take = (want, k) => { const pool = rtShuf(r, all.filter(x => x[1] === want)); for (const x of pool){ if (k === 0) break; if (used.has(x[0])) continue; used.add(x[0]); items.push([x[0], want ? 0 : 1]); k--; } };
    take(1, nu); take(0, n - nu);
    return {t: 'sort', q: 'Is each type of energy <b>useful</b> or <b>wasted</b> in that device?', groups: ['Useful', 'Wasted'], items: rtShuf(r, items),
      explain: 'Useful energy does the job we want. Wasted energy is not the job, and it does not disappear: it spreads out as heat in the surroundings. The same type can be useful in one device and wasted in another.', p: {n}};
  },
  B(r){
    const d = rtPick(r, RT21.filter(x => x.outs.filter(o => o[1]).length === 1)), main = d.outs.find(o => o[1])[0];
    const others = rtShuf(r, Object.keys(RT21_E).filter(k => k !== main));
    let wr = others.map(k => RT21_E[k]);
    if (main === 'heat') wr = [wr[0], wr[1], 'Nothing: heat is always wasted'];
    return rtMcq(r, `What is the main useful energy from ${d.art}?`, RT21_E[main], wr, `The main job of ${d.art} is ${main}. Other energy it gives out is wasted, and wasted energy spreads out as heat rather than disappearing.`, {p: {art: d.art, main}});
  }
};

/* ---------- F22 What gets used up? ---------- */
RT_GEN.F22 = {
  A(r){
    const x = rtInt(r, 6, 47) * 2 / 100, part = rtPick(r, ['a filament bulb', 'an LED', 'a bulb']), half = rtFix(x / 2, 2);
    return rtMcq(r, `${rtA(x, 2)} A flows into ${part}. How much current flows out of it?`, `${rtA(x, 2)} A, because current is not used up`, [`${rtA(half, 2)} A, because the bulb uses up half of the current`, '0 A, because the bulb uses up all of the current', `${rtA(rtFix(x * 2, 2), 2)} A, because the bulb adds more current`],
      `${rtA(x, 2)} A flows out too. The bulb transfers energy, but the current is the same before and after it.`, {p: {x}});
  },
  B(r){
    const k = rtInt(r, 0, 3);
    if (k === 0) return rtMcq(r, 'Two LEDs are in a circuit. One lights and one stays dark. What is the most likely reason?', 'The dark LED is facing the wrong way round',
      rtShuf(r, ['The lit LED has used up all of the current', 'The dark LED has run out of electrons', 'The dark LED is too far from the cell to get any current']), 'An LED only lets current through one way. The dark one is most likely facing the wrong way.', {p: {k}});
    if (k === 1) return rtMcq(r, 'A student says: “My battery is flat because it has run out of electrons.” What is the best correction?', 'The battery has run out of stored energy, but the electrons are still in the wires',
      rtShuf(r, ['That is right: a flat battery has used up all of its electrons', 'The bulb used up the electrons, so none are left for the battery', 'The battery made too many electrons and they all escaped']), 'The electrons are never used up. A flat battery has run out of energy to give them, not out of electrons.', {p: {k}});
    if (k === 2) return rtMcq(r, 'An LED is joined to a working cell but stays dark. What is the best thing to try first?', 'Turn the LED round, because it lets current through one way only',
      rtShuf(r, ['Add a bulb after the LED so that it gets extra current', 'Take the cell out, because the LED has used up its current', 'Hold the LED closer to the cell so it gets more electrons']), 'An LED only works one way round, so turn it round first.', {p: {k}});
    const x = rtInt(r, 6, 47) * 2 / 100;
    return rtMcq(r, `In a series circuit, an ammeter before two bulbs reads ${rtA(x, 2)} A. Which statement is right?`, 'The current is the same after each bulb, because the bulbs only transfer energy',
      rtShuf(r, [`The reading after the first bulb is smaller, because the bulb uses up some current`, 'The reading after the second bulb is zero, because both bulbs use up the current', `The reading after each bulb is ${rtA(rtFix(x / 2, 2), 2)} A, because the bulbs share the current out`]), `Current is not used up, so it is ${rtA(x, 2)} A everywhere in the loop.`, {p: {k, x}});
  }
};

/* ---------- F23 Ammeter readings ---------- */
const rtList = a => a.length === 1 ? a[0] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
function rtParCirc(n, vals, main){
  const parts = {}; for (let i = 0; i < n; i++){ parts[`h,${i},2`] = 'bulb'; parts[`h,${i},0`] = {type: 'ammeter', label: vals[i] == null ? '?' : rtA(vals[i], 2) + ' A', tag: 'A' + (i + 1)}; }
  parts[`h,${n},0`] = {type: 'ammeter', label: main == null ? '?' : rtA(main, 2) + ' A', tag: 'A'};
  parts[`h,${n},2`] = 'cell'; const e = rtPar(n, parts); return {edges: e, rows: n};
}
RT_GEN.F23 = {
  A(r){
    if (r() < 0.25){
      const x = rtInt(r, 12, 95) / 100;
      const e = rtLoop({'h,0,0': {type: 'ammeter', label: rtA(x, 2) + ' A', tag: 'A1'}, 'h,0,2': {type: 'ammeter', label: '?', tag: 'A2'}, 'h,0,1': 'bulb', 'h,0,3': 'bulb', 'h,2,2': 'cell'});
      return rtNum(`In this series circuit, ammeter A1 reads <b>${rtA(x, 2)} A</b>. What does ammeter A2 read?`, x, 'A', 0.0005, 'The current is the same everywhere in a series circuit.', {vis: rtCircVis(e, 2), diagram: {edges: e}, edges: e, p: {mode: 'series', x}});
    }
    const n = rtInt(r, 2, 4), same = r() < 0.25, c = []; for (let i = 0; i < n; i++) c.push(same ? 34 : rtInt(r, 12, 95));
    const tot = c.reduce((a, b) => a + b, 0), vals = c.map(v => v / 100), pc = rtParCirc(n, vals, null);
    return rtNum(`A parallel circuit has ${n} branches. ${same ? `Each branch has an identical bulb and carries ${rtA(vals[0], 2)} A.` : `The branches carry ${rtList(vals.map(v => rtA(v, 2) + ' A'))}.`} What does the main wire carry?`, rtFix(tot / 100, 2), 'A', 0.0005,
      `In a parallel circuit the branch currents add up to the current in the main wire: ${vals.map(v => rtA(v, 2)).join(' + ')} = ${rtA(tot / 100, 2)} A.`, {vis: rtCircVis(pc.edges, pc.rows), diagram: {edges: pc.edges}, edges: pc.edges, p: {mode: 'parallel', branches: vals, main: tot / 100}});
  },
  B(r){
    const n = rtInt(r, 2, 3), c = []; for (let i = 0; i < n; i++) c.push(rtInt(r, 12, 95));
    const tot = c.reduce((a, b) => a + b, 0), un = rtInt(r, 0, n - 1), vals = c.map(v => v / 100);
    const shown = vals.map((v, i) => i === un ? null : v), pc = rtParCirc(n, shown, tot / 100), known = vals.filter((_, i) => i !== un);
    const q = n === 2 ? `The main wire of a parallel circuit carries ${rtA(tot / 100, 2)} A. One branch carries ${rtA(known[0], 2)} A. What does the other branch carry?`
      : `The main wire of a parallel circuit carries ${rtA(tot / 100, 2)} A. Two of the branches carry ${rtA(known[0], 2)} A and ${rtA(known[1], 2)} A. What does the third branch carry?`;
    return rtNum(q, vals[un], 'A', 0.0005, `The branch currents add up to the main wire: ${rtA(tot / 100, 2)} − ${known.map(v => rtA(v, 2)).join(' − ')} = ${rtA(vals[un], 2)} A.`, {vis: rtCircVis(pc.edges, pc.rows), diagram: {edges: pc.edges}, edges: pc.edges, p: {main: tot / 100, known, ans: vals[un]}});
  }
};

/* ---------- F24 Series or parallel? ---------- */
function rt24circ(r, kind, n, change){
  if (kind === 'series'){
    const cols = rtShuf(r, [0, 1, 2, 3]).slice(0, n).sort(), c = rtInt(r, 0, 3), parts = {['h,2,' + c]: 'cell'};
    cols.forEach((x, i) => { parts['h,0,' + x] = (change === 'unscrew' && i === 0) ? {type: 'bulb', broken: true} : 'bulb'; });
    if (change === 'switch'){ const free = [0, 1, 2, 3].filter(x => !cols.includes(x)); parts['h,0,' + (free.length ? rtPick(r, free) : cols[0])] = {type: 'switch', closed: true}; }
    return {edges: rtLoop(parts), rows: 2};
  }
  const parts = {}; for (let i = 0; i < n; i++) parts['h,' + i + ',' + rtInt(r, 0, 3)] = (change === 'unscrew' && i === 0) ? {type: 'bulb', broken: true} : 'bulb';
  const cellC = rtInt(r, 0, 3); parts['h,' + n + ',' + cellC] = 'cell';
  if (change === 'branchswitch'){ const bc = Object.keys(parts).find(k => k.startsWith('h,0,')).split(',')[2]; parts['h,0,' + [0, 1, 2, 3].filter(x => String(x) !== bc)[0]] = {type: 'switch', closed: true}; }
  if (change === 'mainswitch') parts['h,' + n + ',' + [0, 1, 2, 3].filter(x => x !== cellC)[0]] = {type: 'switch', closed: true};
  return {edges: rtPar(n, parts), rows: n};
}
RT_GEN.F24 = {
  A(r){
    const kind = rtPick(r, ['series', 'parallel']), n = rtInt(r, 2, 3), two = n === 2;
    const O = two ? {o: 'the other bulb', go: 'goes', stay: 'stays', get: 'gets'} : {o: 'the other bulbs', go: 'go', stay: 'stay', get: 'get'};
    const change = kind === 'series' ? rtPick(r, ['unscrew', 'add', 'switch']) : rtPick(r, ['unscrew', 'add', 'branchswitch', 'mainswitch']);
    const st = rt24circ(r, kind, n, change), extra = {vis: rtCircVis(st.edges, st.rows), diagram: {edges: st.edges}, edges: st.edges};
    const nm = two ? ' (about 0.34 A each in parallel, and about 0.18 A each in series)' : '';
    if (kind === 'series'){
      if (change === 'unscrew') return rtMcq(r, `In this series circuit, you unscrew one bulb. What happens to ${O.o}?`, `${rtCap(O.o)} ${O.go} out too, because the one path is broken`,
        rtShuf(r, [`${rtCap(O.o)} ${O.stay} on at the same brightness`, `${rtCap(O.o)} ${O.get} brighter, because the current is shared out`, `Only the bulb next to it ${O.go} out`].slice(0, 3)), 'In a series circuit there is only one path, so one break stops everything.', Object.assign({p: {kind, change, n}}, extra));
      if (change === 'add') return rtMcq(r, `This series circuit has ${n} bulbs. You add one more bulb in the same loop. What happens to the bulbs?`, 'All the bulbs get dimmer', ['The bulb next to the cell stays the brightest', 'All the bulbs stay just as bright', 'The new bulb is the only one that changes'],
        `In series, every extra bulb makes the current smaller, so every bulb gets dimmer${nm}.`, Object.assign({p: {kind, change, n}}, extra));
      return rtMcq(r, 'In this series circuit, you open the switch. What happens to the bulbs?', 'All the bulbs go out, because the one path is broken', ['Only the bulb next to the switch goes out', 'All the bulbs stay on, because the cell still pushes', 'All the bulbs get dimmer but stay on'],
        'In a series circuit an open switch breaks the only path, so every bulb goes out.', Object.assign({p: {kind, change, n}}, extra));
    }
    if (change === 'unscrew') return rtMcq(r, `In this parallel circuit, you unscrew one bulb. What happens to ${O.o}?`, `${rtCap(O.o)} ${O.stay} on at the same brightness`,
      rtShuf(r, [`${rtCap(O.o)} ${O.get} dimmer, because the bulbs share the current`, `${rtCap(O.o)} ${O.go} out too`, `${rtCap(O.o)} ${O.get} much brighter`].slice(0, 3)), `Each parallel bulb has its own complete path to the cell, so ${O.o} keep their full brightness${nm}.`, Object.assign({p: {kind, change, n}}, extra));
    if (change === 'add') return rtMcq(r, `This parallel circuit has ${n} bulbs. You add one more bulb on its own new branch. What happens to the other bulbs?`, 'They stay just as bright', ['All the bulbs get dimmer, because they share the current', 'They get brighter, because there is more wire', 'They all go out until the new bulb is checked'],
      `Each parallel branch gets the full push of the cell, so the other bulbs do not change${nm}.`, Object.assign({p: {kind, change, n}}, extra));
    if (change === 'branchswitch') return rtMcq(r, 'In this parallel circuit, you open the switch on one bulb’s branch. What happens?', 'Only that bulb goes out, and the others stay on', ['All the bulbs go out', 'The other bulbs get dimmer', 'Only the bulb next to the cell stays on'],
      'The switch is only on one branch, so only that branch is broken. The other branches still have a complete loop.', Object.assign({p: {kind, change, n}}, extra));
    return rtMcq(r, 'In this parallel circuit, you open the switch in the main wire next to the cell. What happens?', 'All the bulbs go out, because every path goes through the switch', ['Only one bulb goes out, and the others stay on', 'The bulbs get dimmer but stay on', 'The bulbs stay on, because they each have a branch'],
      'The main wire carries all of the current, so a switch there breaks every branch at once.', Object.assign({p: {kind, change, n}}, extra));
  },
  B(r){
    const k = rtInt(r, 0, 4);
    if (k === 0) return rtMcq(r, 'Each lamp in a bedroom needs its own switch, so it can be turned on alone. How should the lamps be wired?', 'In parallel, with a switch on each lamp’s own branch', ['In series, with one switch anywhere in the loop', 'In parallel, with one switch in the main wire', 'In series, with a switch beside each lamp'],
      'Parallel lamps each have their own branch, so a switch on a branch controls only that lamp. A switch in the main wire would control them all.', {p: {k}});
    if (k === 1) return rtMcq(r, 'One broken bulb must not spoil a shop display. How should the lights be wired?', 'In parallel, with each bulb on its own branch', ['In series, so every bulb shares the cell’s push equally', 'In series, so one break stops only the broken bulb', 'In parallel, so the bulbs share the current and go dim'],
      'In parallel each bulb has its own path, so the others stay on at the same brightness when one breaks.', {p: {k}});
    if (k === 2) return rtMcq(r, 'A shop wants one switch by the door to turn off all of its parallel lights at once. Where should the switch go?', 'In the main wire, where the current for every branch passes', ['On one branch only, next to the first light', 'Beside each light, one switch on every branch', 'It cannot be done with lights in parallel'],
      'All the current for every branch flows through the main wire, so one switch there controls every light.', {p: {k}});
    if (k === 4) return rtMcq(r, 'A student wants three lights that all stay equally bright, even when one is unscrewed. How should they be wired?', 'In parallel, because each light gets the full push of the cell', ['In series, because the cell’s push is shared equally', 'In series, because the first light is always brightest', 'In parallel, because parallel bulbs share the current and go dim'],
      'Parallel lights each have their own branch, so each gets the full push of the cell and keeps its brightness.', {p: {k}});
    return rtMcq(r, 'A string of old fairy lights goes out completely when one bulb breaks. How are the bulbs wired?', 'In series: there is one path, so one break stops the current everywhere', ['In parallel: the bulbs share the current, so they all go dim', 'In parallel: each bulb needs the others to keep the loop', 'In series: only the broken bulb stops, and the others stay on'],
      'One break stopping every bulb shows there is only one path, which is a series circuit.', {p: {k}});
  }
};

/* ---------- F25 AC or DC? ---------- */
const RT25_AC = ['The wall socket at home', 'The power lines to your street', 'A bicycle dynamo', 'A wind turbine generator', 'A hydroelectric generator', 'The mains socket in a classroom'];
const RT25_DC = ['A 1.5 V cell', 'A phone battery', 'A solar panel', 'A car battery', 'A USB power bank', 'A laptop battery'];
function rtTrace(ac){
  if (typeof sv !== 'function') return undefined;
  return el => { const s = sv('svg', {viewBox: '0 0 260 110', width: 260, height: 110, role: 'img', 'aria-label': ac ? 'Oscilloscope trace: a wave above and below zero' : 'Oscilloscope trace: a flat line above zero'});
    s.append(sv('line', {x1: 8, y1: 55, x2: 252, y2: 55, stroke: 'var(--muted, #888)', 'stroke-dasharray': '4 4'}), sv('text', {x: 10, y: 50, 'font-size': 11, fill: 'var(--muted, #888)'}, 'zero'));
    if (ac){ let d = ''; for (let x = 0; x <= 240; x += 4) d += (x ? 'L' : 'M') + (10 + x) + ' ' + (55 - 38 * Math.sin(x / 240 * 4 * Math.PI)).toFixed(1); s.append(sv('path', {d, fill: 'none', stroke: 'var(--spark, #e8a700)', 'stroke-width': 3})); }
    else s.append(sv('line', {x1: 10, y1: 22, x2: 250, y2: 22, stroke: 'var(--spark, #e8a700)', 'stroke-width': 3}));
    el.append(s); };
}
const RT25_V = [0.2, 0.25, 0.3, 0.36, 0.4, 0.45, 0.5, 0.6, 0.72, 0.8, 0.9];
const rtRead = (v, signs) => signs.map(s => (s > 0 ? '+' : '−') + rtT(v) + ' A').join(', ');
RT_GEN.F25 = {
  A(r){
    const k = rtInt(r, 0, 2), ac = r() < 0.5;
    if (k === 0){
      const n = rtInt(r, 3, 5), na = rtInt(r, 1, n - 1);
      return {t: 'sort', q: 'Is each source <b>AC</b> or <b>DC</b>?', groups: ['AC', 'DC'], items: rtShuf(r, rtShuf(r, RT25_AC).slice(0, na).map(x => [x, 0]).concat(rtShuf(r, RT25_DC).slice(0, n - na).map(x => [x, 1]))),
        explain: 'AC keeps changing direction, and mains sockets, generators and power lines give AC. DC flows one way, and cells, batteries and solar panels give DC.', p: {n}};
    }
    if (k === 1){
      const v = rtPick(r, RT25_V), signs = ac ? rtPick(r, [[1, -1, 1], [-1, 1, -1], [1, -1, 1, -1]]) : (r() < 0.8 ? [1, 1, 1] : [-1, -1, -1]);
      return rtMcq(r, `An ammeter reads ${rtRead(v, signs)}. Is this AC or DC?`, ac ? 'AC: the current keeps changing direction' : 'DC: the current flows one way only',
        ac ? ['DC: the current flows one way only', 'DC: the readings go up and down the wire'] : ['AC: batteries give alternating current', 'AC: the current keeps changing direction'], ac ? 'The readings flip between + and −, so the current keeps changing direction. That is AC.' : 'The readings keep the same sign, so the current flows one way only. That is DC.', {p: {k, ac, v}});
    }
    return rtMcq(r, 'This oscilloscope trace shows a current. Is it AC or DC?', ac ? 'AC: the current keeps changing direction' : 'DC: the current flows one way only',
      ac ? ['DC: the wave means the current moves up and down the wire', 'DC: the current flows one way only'] : ['AC: batteries give alternating current', 'AC: the current keeps changing direction'], ac ? 'A wave above and below zero means the direction keeps changing. That is AC. It does not move up and down the wire.' : 'A flat line means a steady current in one direction. That is DC.', {vis: rtTrace(ac), p: {k, ac}});
  },
  B(r){
    const ac = r() < 0.5, src = ac ? rtPick(r, RT25_AC) : rtPick(r, RT25_DC);
    if (r() < 0.5) return rtMcq(r, `What does ${src.charAt(0).toLowerCase() + src.slice(1)} look like on an oscilloscope?`, ac ? 'A wave that goes above and below zero' : 'A flat line above zero',
      [ac ? 'A flat line above zero' : 'A wave that goes above and below zero', 'A flat line at zero', 'A wave that moves up and down along the wire'], ac ? 'AC keeps changing direction, so its trace is a wave above and below zero.' : 'DC flows one way, so its trace is a flat line.', {p: {ac, mode: 0}});
    const v = rtPick(r, RT25_V), sg = a => rtRead(v, a);
    const R = ac ? [1, -1, 1] : [1, 1, 1], W = ac ? [[1, 1, 1], [-1, -1, -1]] : [[1, -1, 1], [-1, 1, -1]];
    return rtMcq(r, `Which set of ammeter readings could come from ${src.charAt(0).toLowerCase() + src.slice(1)}?`, sg(R), W.map(sg), ac ? 'AC readings flip between + and − as the direction changes.' : 'DC readings keep one sign because the current only flows one way.', {p: {ac, mode: 1, v}});
  }
};

/* ---------- F26 Frequency ---------- */
function rt26pick(r){
  const kind = rtPick(r, ['beijing', 'sixty', 'slow']), f = kind === 'beijing' ? 50 : kind === 'sixty' ? 60 : rtInt(r, 2, 9), t = rtInt(r, 2, 60) * 5;
  const who = kind === 'beijing' ? 'Sockets in Beijing work at 50 Hz.' : kind === 'sixty' ? 'Sockets in some countries work at 60 Hz.' : `A slow generator works at ${f} Hz.`;
  const tt = t; const mins = t >= 60 && t % 60 === 0 && r() < 0.6;
  return {kind, f, t: tt, who, tTxt: mins ? `${t / 60} minute${t === 60 ? '' : 's'} (${t} seconds)` : `${t} seconds`};
}
RT_GEN.F26 = {
  A(r){
    const s = rt26pick(r), cyc = s.f * s.t;
    if (r() < 0.5) return rtNum(`${s.who} How many cycles happen in ${s.tTxt}?`, cyc, 'cycles', 0.001, `Cycles = frequency × seconds = ${s.f} × ${s.t} = ${rtC(cyc)}.`, {p: {f: s.f, t: s.t, mode: 0, ans: cyc}});
    return rtNum(`${s.who} How many times does the current change direction in ${s.tTxt}?`, 2 * cyc, 'changes', 0.001, `Cycles = ${s.f} × ${s.t} = ${rtC(cyc)}. The current changes direction twice in every cycle, so ${rtC(cyc)} × 2 = ${rtC(2 * cyc)}.`, {p: {f: s.f, t: s.t, mode: 1, ans: 2 * cyc}});
  },
  B(r){
    const s = rt26pick(r), cyc = s.f * s.t, who = s.kind === 'slow' ? 'A slow generator' : 'A mains socket';
    return rtNum(`${who} makes ${rtC(cyc)} cycles in ${s.tTxt}. What is its frequency?`, s.f, 'Hz', 0.001, `Frequency = cycles ÷ seconds = ${rtC(cyc)} ÷ ${s.t} = ${s.f} Hz.`, {p: {cycles: cyc, t: s.t, f: s.f}});
  }
};

/* ---------- F27 The journey to your home ---------- */
const RT27_STAGES = ['Power station generator', 'Step-up transformer', 'Long-distance power lines', 'Step-down transformer', 'Your home'];
const RT27_IN = [11000, 13800, 15000, 16000, 18000, 20000, 22000, 24000, 25000], RT27_OUT = [132000, 220000, 275000, 330000, 400000, 500000];
function rt27pair(r){
  for (;;){
    const a = rtPick(r, RT27_IN), b = rtPick(r, RT27_OUT), x = b / a, frac = x - Math.floor(x);
    if (Math.abs(frac - 0.5) < 0.03) continue;
    return {a, b, ans: Math.round(x), x};
  }
}
const RT27A = [
  {q: 'Electricity leaves a power station for long power lines. Which transformer comes first?', right: 'A step-up transformer', wrongs: ['A step-down transformer', 'No transformer: it is sent at the same voltage', 'A DC transformer'], ex: 'The voltage is stepped up before the long lines, then stepped down before homes.'},
  {q: 'What happens to the voltage in the long-distance power lines?', right: 'It is very high, which keeps the current small', wrongs: ['It is very high, because AC travels faster than DC', 'It is very high, so more energy is lost as heat', 'It is very low, to keep the lines safe'], ex: 'High voltage means a smaller current, so less energy is wasted as heat in the lines.'},
  {q: 'Near a town, electricity goes through a step-down transformer. What does it do to the voltage?', right: 'It lowers the voltage so it is safe for homes', wrongs: ['It raises the voltage so homes get more energy', 'It keeps the voltage the same but turns AC into DC', 'It makes the electricity move faster'], ex: 'Step down before homes. Very high voltage is not safe in a home.'},
  {q: 'Why is the voltage stepped up before electricity travels a long way?', right: 'A higher voltage means a smaller current, so less energy is lost as heat', wrongs: ['A higher voltage means a bigger current, so more energy arrives', 'A higher voltage makes AC travel faster than DC', 'A higher voltage means more energy is lost, which is useful'], ex: 'High voltage means a smaller current, so less energy is wasted as heat.'}
];
const RT27B = [
  {q: 'A country sends electricity along long power lines with no transformers. What would go wrong?', right: 'A large current would waste lots of energy as heat in the lines', wrongs: ['The electricity would arrive faster but at too low a voltage', 'Nothing would go wrong, because voltage makes no difference to energy lost', 'The lines would lose less energy, because a low voltage is safer'], ex: 'Without a step-up transformer the current is large, so a lot of energy is wasted as heat.'},
  {q: 'A power company tries to send DC through a transformer. What happens?', right: 'It does not work, because transformers only work with AC', wrongs: ['It works better than AC, because DC is steadier', 'It works, but only if the voltage is stepped down first', 'It works the same, because AC is faster than DC'], ex: 'Transformers only work with AC, which is one reason the grid uses AC.'},
  {q: 'A step-down transformer is left out near a town. What would happen at the homes?', right: 'The voltage would be far too high, which is dangerous', wrongs: ['The homes would get more energy, so everything would work better', 'The voltage would be too low, so nothing would switch on', 'Nothing would change, because the lines are already safe'], ex: 'Step down before homes. Without it, the very high voltage from the long lines would reach the homes.'},
  {q: 'Which way of sending electricity a long way wastes the least energy as heat?', right: 'A higher voltage with a smaller current', wrongs: ['A lower voltage with a bigger current', 'AC at a low voltage, because AC is faster than DC', 'DC at a low voltage, because it needs no transformer'], ex: 'A smaller current wastes less energy as heat, and a higher voltage allows a smaller current.'},
  {q: 'Engineers use a much higher voltage in the long lines. What changes in the lines?', right: 'The current gets smaller, so less energy is wasted as heat', wrongs: ['The current gets bigger, so more energy is lost', 'The current stays the same, but the electricity moves faster', 'The current gets smaller, so more energy is lost as heat'], ex: 'Higher voltage means a smaller current, and a smaller current wastes less energy as heat.'}
];
RT_GEN.F27 = {
  A(r, o){
    if (o.challenge && r() < 0.5){
      const s = rt27pair(r);
      return rtNum(`Electricity leaves a power station at ${rtC(s.a)} V. A transformer raises it to ${rtC(s.b)} V for the long power lines. About how many times bigger is the voltage? Round to the nearest whole number.`, s.ans, 'times', 0.001,
        `${rtC(s.b)} ÷ ${rtC(s.a)} = ${rtT(+s.x.toFixed(2))}, which is ${s.ans} to the nearest whole number.`, {challenge: true, p: {a: s.a, b: s.b}});
    }
    if (r() < 0.25) return {t: 'order', q: 'Put the journey of electricity from the power station to your home in order.', items: RT27_STAGES.slice(), explain: 'The generator makes electricity, a step-up transformer raises the voltage for the long lines, a step-down transformer lowers it near towns, and then it reaches your home.', p: {}};
    const s = rtPick(r, RT27A);
    return rtMcq(r, s.q, s.right, rtShuf(r, s.wrongs), s.ex, {p: {}});
  },
  B(r, o){
    if (o.challenge && r() < 0.5){
      const s = rt27pair(r);
      return rtNum(`A transformer raises ${rtC(s.a)} V to ${rtC(s.b)} V. About how many times bigger is the voltage? Round to the nearest whole number.`, s.ans, 'times', 0.001,
        `${rtC(s.b)} ÷ ${rtC(s.a)} = ${rtT(+s.x.toFixed(2))}, which is ${s.ans} to the nearest whole number.`, {challenge: true, p: {a: s.a, b: s.b}});
    }
    const s = rtPick(r, RT27B);
    return rtMcq(r, s.q, s.right, rtShuf(r, s.wrongs), s.ex, {p: {}});
  }
};

/* ---------- F28, F29 sources (same data as POWER in the sim) ---------- */
const RT_SRC = [
  {id: 'coal', name: 'Coal', grp: 'Fossil fuel', pw: 'Coal power', b: 'It makes power whenever it is needed', d: 'Burning it releases a lot of CO₂', chain: ['Burn coal', 'Heat boils water', 'Steam spins the turbine', 'The generator makes electricity'], spin: 'Steam from heated water'},
  {id: 'gas', name: 'Natural gas', grp: 'Fossil fuel', pw: 'Gas power', b: 'It can start up quickly when demand jumps', d: 'Burning it still releases CO₂', chain: ['Burn gas', 'Hot gases spin a turbine', 'The generator makes electricity'], spin: 'Hot gases from burning gas'},
  {id: 'biomass', name: 'Biomass', grp: 'Renewable', pw: 'Biomass power', b: 'New plants can be grown to replace it', d: 'Burning it still releases some CO₂ and needs lots of land', chain: ['Burn wood or plant waste', 'Heat boils water', 'Steam spins the turbine', 'The generator makes electricity'], spin: 'Steam from heated water'},
  {id: 'nuclear', name: 'Nuclear', grp: 'Non-renewable, low carbon', pw: 'Nuclear power', b: 'It releases almost no CO₂', d: 'The waste stays dangerous for thousands of years', chain: ['Uranium atoms split', 'Heat boils water', 'Steam spins the turbine', 'The generator makes electricity'], spin: 'Steam from heated water'},
  {id: 'geo', name: 'Geothermal', grp: 'Renewable', pw: 'Geothermal power', b: 'It works day and night', d: 'It only works where hot rocks are near the surface', chain: ['Heat from deep underground', 'Hot water turns to steam', 'Steam spins the turbine', 'The generator makes electricity'], spin: 'Steam from heated water'},
  {id: 'hydro', name: 'Hydroelectric', grp: 'Renewable', pw: 'Hydroelectric power', b: 'It makes power whenever water is released', d: 'Dams can flood valleys and change rivers', chain: ['Water stored behind a dam', 'Falling water spins the turbine', 'The generator makes electricity'], spin: 'Falling water from a dam'},
  {id: 'tidal', name: 'Tidal and wave', grp: 'Renewable', pw: 'Tidal power', b: 'Tides are very predictable', d: 'There are only a few good places to build', chain: ['The Moon pulls the tides', 'Moving seawater spins the turbine', 'The generator makes electricity'], spin: 'Moving seawater from the tides'},
  {id: 'wind', name: 'Wind', grp: 'Renewable', pw: 'Wind power', b: 'It is free and clean', d: 'No wind means no electricity', chain: ['The Sun heats the air, making wind', 'Wind spins the blades', 'The generator makes electricity'], spin: 'Moving air (the wind)'},
  {id: 'solar', name: 'Solar', grp: 'Renewable', pw: 'Solar power', b: 'It needs no turbine and no fuel', d: 'It makes nothing at night, and less on cloudy days', chain: ['Sunlight hits the solar panel', 'Semiconductor cells turn light into electricity'], spin: null}
];
const RT28_G = ['Renewable', 'Fossil fuel', 'Non-renewable, low carbon'];
const RT28_P = [
  {t: 'A small island with strong tides, but no rivers or volcanoes', src: 'tidal'}, {t: 'A windy hilltop with no rivers or hot springs', src: 'wind'},
  {t: 'A sunny desert with little wind and no rivers', src: 'solar'}, {t: 'A village beside hot springs and steaming rocks', src: 'geo'},
  {t: 'A mountain valley with a big river and room for a dam', src: 'hydro'}, {t: 'A farming region with lots of leftover crop waste', src: 'biomass'}
];
const rtSrcName = s => s.pw;
RT_GEN.F28 = {
  A(r){
    const k = rtPick(r, [0, 0, 1, 2, 3]);
    if (k === 0){
      for (;;){
        const ss = rtShuf(r, RT_SRC).slice(0, rtInt(r, 4, 5)); if (new Set(ss.map(s => s.grp)).size < 2) continue;
        return {t: 'sort', q: 'Sort each power source into its group.', groups: RT28_G, items: ss.map(s => [s.name, RT28_G.indexOf(s.grp)]),
          explain: 'Coal, oil and gas are fossil fuels. Uranium is non-renewable but low carbon. Wind, solar, hydro, tidal, geothermal and biomass are renewable.', p: {}};
      }
    }
    if (k === 1){
      const s = rtPick(r, RT_SRC), wr = RT28_G.filter(g => g !== s.grp).slice();
      return rtMcq(r, `Which group does ${s.name.toLowerCase()} power belong to?`, s.grp, wr, `${s.name}: ${s.grp.toLowerCase()}.${s.id === 'nuclear' ? ' Low CO₂ does not make nuclear power renewable, because uranium can run out.' : s.id === 'biomass' ? ' Biomass is not a fossil fuel: new plants can be grown to replace it.' : ''}`, {p: {id: s.id}});
    }
    if (k === 2) return rtMcq(r, 'Why is nuclear power not renewable?', 'Its fuel, uranium, will run out one day', ['It releases a lot of CO₂ when it is used', 'It is renewable, because it has low CO₂', 'It needs the wind and the Sun to work'], 'Uranium is a fuel that can run out. Low CO₂ does not make a source renewable.', {p: {}});
    const s = rtPick(r, RT_SRC), others = rtShuf(r, RT_SRC.filter(x => x.id !== s.id)).sort((a, b) => Math.abs((a.b + a.d).length - (s.b + s.d).length) - Math.abs((b.b + b.d).length - (s.b + s.d).length)).slice(0, 3);
    const t = x => `Benefit: ${x.b.charAt(0).toLowerCase() + x.b.slice(1)}. Drawback: ${x.d.charAt(0).toLowerCase() + x.d.slice(1)}`;
    return rtMcq(r, `Which pair gives one benefit and one drawback of ${s.pw.toLowerCase()}?`, t(s), others.map(t), `${s.pw}: ${s.b.toLowerCase()}, but ${s.d.charAt(0).toLowerCase() + s.d.slice(1)}.`, {p: {id: s.id}});
  },
  B(r){
    const pl = rtPick(r, RT28_P), s = RT_SRC.find(x => x.id === pl.src), wr = rtShuf(r, RT_SRC.filter(x => x.grp === 'Renewable' && x.id !== s.id)).slice(0, 3).map(rtSrcName);
    return rtMcq(r, `${pl.t}. Which renewable source suits it best?`, rtSrcName(s), wr, `${rtSrcName(s)} suits this place best because it uses the resource that is there. ${s.b}, but ${s.d.charAt(0).toLowerCase() + s.d.slice(1)}.`, {p: {src: s.id}});
  }
};
RT_GEN.F29 = {
  A(r){
    if (r() < 0.5){
      const s = rtPick(r, RT_SRC.filter(x => x.chain.length >= 3));
      return {t: 'order', q: `Put the steps in order for ${s.pw.toLowerCase()}.`, items: s.chain.slice(), explain: `${s.chain.join(' → ')}. Something spins a turbine, the turbine turns a generator, and electricity flows out.`, p: {id: s.id}};
    }
    const s = rtPick(r, RT_SRC.filter(x => x.spin)), wr = rtShuf(r, ['Steam from heated water', 'Hot gases from burning gas', 'Falling water from a dam', 'Moving seawater from the tides', 'Moving air (the wind)', 'Sunlight on a solar panel']).filter(x => x !== s.spin);
    const q = s.id === 'wind' ? 'What pushes the blades round in a wind power station?' : `What spins the turbine in a ${s.id === 'geo' ? 'geothermal' : s.id === 'gas' ? 'gas' : s.id === 'tidal' ? 'tidal' : s.id === 'hydro' ? 'hydroelectric' : s.id} power station?`;
    return rtMcq(r, q, s.spin, wr, `${s.chain.join(' → ')}.`, {p: {id: s.id}});
  },
  B(r){
    if (r() < 0.2) return rtMcq(r, 'Which of these power sources makes electricity without a turbine?', 'Solar panels', ['Wind turbines', 'Hydroelectric dams', 'Coal power stations'], 'Solar panels use semiconductor cells to turn light straight into electricity. The others all spin a turbine.', {p: {}});
    const s = rtPick(r, RT_SRC.filter(x => x.chain.length >= 3)), i = rtInt(r, 1, s.chain.length - 2), right = s.chain[i];
    const used = new Set(s.chain), pool = []; RT_SRC.forEach(x => x.chain.forEach((c, j) => { if (j > 0 && j < x.chain.length - 1 && !used.has(c) && !pool.includes(c)) pool.push(c); }));
    const wr = ['The turbine makes electricity alone', 'Sunlight spins the turbine'].concat(rtShuf(r, pool).slice(0, 1));
    const shown = s.chain.map((c, j) => j === i ? '___' : c).join(' → ');
    return rtMcq(r, `${shown}. What is the missing step?`, right, wr, `${s.chain.join(' → ')}.`, {p: {id: s.id, i}});
  }
};

/* ---------- F30 Compare the CO2 ---------- */
const RT30_N = {coal: 'coal', gas: 'natural gas', biomass: 'biomass', solar: 'solar power', geothermal: 'geothermal power', hydro: 'hydroelectric power', tidal: 'tidal power', nuclear: 'nuclear power', wind: 'wind power'};
const RT30_K = Object.keys(RT_CO2);
RT_GEN.F30 = {
  A(r){
    for (;;){
      const a = rtPick(r, RT30_K), b = rtPick(r, RT30_K), big = RT_CO2[a], small = RT_CO2[b];
      if (big < small * 2) continue;
      const x2 = 2 * big / small; if (Number.isInteger(x2) && x2 % 2 === 1) continue;
      const ans = Math.round(big / small);
      return rtNum(`${rtCap(RT30_N[a])} releases about ${big} g of CO₂ for every kWh. ${rtCap(RT30_N[b])} releases about ${small} g. About how many times more CO₂ does ${RT30_N[a]} release? Round to the nearest whole number.`, ans, 'times', 0.001,
        `${big} ÷ ${small} = ${rtT(+(big / small).toFixed(2))}, which is ${ans} to the nearest whole number. Divide, do not subtract.`, {p: {a, b, big, small}});
    }
  },
  B(r){
    const kwh = rtInt(r, 5, 500);
    if (r() < 0.5){
      const a = rtPick(r, RT30_K);
      return rtNum(`A home uses ${kwh} kWh of electricity. How much CO₂ is that from ${RT30_N[a]}, at ${RT_CO2[a]} g per kWh?`, RT_CO2[a] * kwh, 'g', 0.001, `CO₂ = grams per kWh × kWh = ${RT_CO2[a]} × ${kwh} = ${rtC(RT_CO2[a] * kwh)} g.`, {p: {a, kwh, rate: RT_CO2[a], mode: 0}});
    }
    let a, b; do { a = rtPick(r, RT30_K); b = rtPick(r, RT30_K); } while (RT_CO2[a] < RT_CO2[b] * 2);
    return rtNum(`A town swaps ${kwh} kWh of electricity from ${RT30_N[a]} (${RT_CO2[a]} g per kWh) to ${RT30_N[b]} (${RT_CO2[b]} g per kWh). How much CO₂ does the swap save?`, (RT_CO2[a] - RT_CO2[b]) * kwh, 'g', 0.001,
      `Saving per kWh = ${RT_CO2[a]} − ${RT_CO2[b]} = ${RT_CO2[a] - RT_CO2[b]} g. For ${kwh} kWh: ${rtC((RT_CO2[a] - RT_CO2[b]) * kwh)} g.`, {p: {a, b, kwh, ra: RT_CO2[a], rb: RT_CO2[b], mode: 1}});
  }
};

/* ---------- F31 Fill the gap ---------- */
const RT31_H = [[19, '7 pm'], [20, '8 pm'], [21, '9 pm']];
RT_GEN.F31 = {
  A(r){
    for (;;){
      const [ix, hr] = rtPick(r, RT31_H), D = RT_DEMAND[ix], geo = r() < 0.5, w = rtInt(r, 0, 7) * 5, b = D - 30 - (geo ? 25 : 0) - w;
      if (b < 5 || b > 60) continue;
      return rtNum(`At ${hr} a town needs ${D} MW. The Sun has set, so solar gives 0 MW. Hydro gives 30 MW, ${geo ? 'geothermal gives 25 MW, ' : ''}and wind gives ${w} MW. How much must the batteries give?`, b, 'MW', 0.001,
        `Batteries = demand − everything else: ${D} − 30${geo ? ' − 25' : ''} − ${w} = ${b} MW. Solar gives nothing after sunset.`, {p: {D, hydro: 30, geo: geo ? 25 : 0, wind: w, batt: b}});
    }
  },
  B(r){
    for (;;){
      const [ix, hr] = rtPick(r, RT31_H), D = RT_DEMAND[ix], geo = r() < 0.5, w = rtInt(r, 1, 7) * 5, b = D - 30 - (geo ? 25 : 0) - w;
      if (b < 5 || b > 60) continue;
      return rtNum(`At ${hr} a town needs ${D} MW. The Sun has set, so solar gives 0 MW. Batteries give ${b} MW, hydro gives 30 MW${geo ? ' and geothermal gives 25 MW' : ''}. How much must wind give?`, w, 'MW', 0.001,
        `Wind = demand − everything else: ${D} − ${b} − 30${geo ? ' − 25' : ''} = ${w} MW.`, {p: {D, hydro: 30, geo: geo ? 25 : 0, wind: w, batt: b}});
    }
  }
};

/* ---------- F32 Keep the lights on ---------- */
const RT32_W = [{n: 'sunny and calm', sun: true, wind: false}, {n: 'cloudy and windy', sun: false, wind: true}, {n: 'cloudy and calm', sun: false, wind: false}];
const RT32_S = {solar: 'Solar panels', wind: 'Wind turbines', hydro: 'Hydro', geo: 'Geothermal', tidal: 'Tidal turbines'};
const rt32works = (k, w, night) => k === 'solar' ? (w.sun && !night) : k === 'wind' ? w.wind : true;
const RT32_WHY = {
  hydro: 'Hydro, because falling water works in any weather', geo: 'Geothermal, because hot rocks work day and night', tidal: 'Tidal turbines, because the tides keep moving in any weather',
  solar: 'Solar panels, because the Sun is shining', wind: 'Wind turbines, because the wind is blowing'
};
const RT32_BAD = {solar: 'Solar panels, because they still work at night', wind: 'Wind turbines, because they spin even when the air is still', bat: 'Batteries, because they make new electricity'};
RT_GEN.F32 = {
  A(r){
    const w = rtPick(r, RT32_W), night = r() < 0.5, when = night ? 'night' : 'day';
    if (r() < 0.5){
      const ks = rtShuf(r, Object.keys(RT32_S)).slice(0, rtInt(r, 3, 4));
      return {t: 'table', q: `It is a ${w.n} ${when}. Which sources can supply power right now?`, cols: [{name: 'Can it supply power?', options: ['Yes', 'No']}], rowHead: 'Source', rows: ks.map(k => ({label: RT32_S[k], ans: [rt32works(k, w, night) ? 'Yes' : 'No']})),
        explain: 'Solar needs sun, so it does not work at night or when it is cloudy. Wind needs wind. Hydro, geothermal and tidal power work in any weather.', p: {w: w.n, night}};
    }
    const good = Object.keys(RT32_S).filter(k => rt32works(k, w, night)), bad = Object.keys(RT32_S).filter(k => !rt32works(k, w, night));
    const right = rtPick(r, good);
    return rtMcq(r, `It is a ${w.n} ${when}. Which of these can supply power right now?`, RT32_WHY[right], rtShuf(r, bad.map(k => RT32_BAD[k]).concat([RT32_BAD.bat])),
      'Solar needs sun and wind needs wind. Hydro and geothermal work in any weather. Batteries only give back energy that was stored earlier.', {p: {w: w.n, night, right}});
  },
  B(r){
    const w = rtPick(r, RT32_W), night = r() < 0.5, when = night ? 'night' : 'day', mixes = [['solar'], ['wind'], ['solar', 'wind'], ['solar', 'hydro'], ['wind', 'geo']], mix = rtPick(r, mixes);
    const names = mix.map(k => RT32_S[k].toLowerCase()), list = rtList(names), works = mix.filter(k => rt32works(k, w, night)), black = works.length === 0;
    const q = `A town uses only ${list} and has no batteries. It is a ${w.n} ${when}. What happens?`;
    const verb = k => (k === 'hydro' || k === 'geo') ? 'keeps' : 'keep';
    const right = black ? `A blackout, because ${mix.length === 1 ? 'it cannot' : 'neither can'} work in this weather` : `No blackout, because ${RT32_S[works[0]].toLowerCase()} ${verb(works[0])} working in this weather`;
    const wrongs = black ? [`No blackout, because ${names[0]} always keep working`, 'No blackout, because the town has batteries to make electricity', 'No blackout, because the sources store their power for later']
      : ['A blackout, because the sources stop working whenever the weather changes', `A blackout, because ${names[0]} can only work at night`, 'No blackout, because batteries make electricity'];
    return rtMcq(r, q, right, wrongs, black ? 'Solar panels need sun, so they do nothing at night or when it is cloudy. Wind turbines need wind. With no batteries and no other source, the town has a blackout.'
      : `${RT32_S[works[0]]} still work${works[0] === 'hydro' || works[0] === 'geo' ? 's' : ''} in this weather, so the town keeps its power.`, {p: {mix, w: w.n, night, black}});
  }
};

/* ---------- X1 Think like a scientist (class only) ---------- */
const RT_X1_OBS = [['The ammeter reads 0.36 A.', 'launch'], ['The bulb is bright.', 'circuits'], ['The electromagnet picks up 8 clips.', 'electromagnets'], ['The balloon moves towards the wall.', 'launch'], ['The voltmeter reads 3 V.', 'circuits']];
const RT_X1_INF = [['The bulb is dim because the cell is nearly flat.', 'circuits'], ['The comb must have gained electrons.', 'static'], ['The wire must be broken, because the bulb is off.', 'circuits'], ['The magnet is weak because it picked up few clips.', 'electromagnets'], ['The balloon must be negative, because it is attracted to the wall.', 'static']];
const RT_X1_HYP = [
  {iv: 'the number of coils goes up', eff: 'more clips will be picked up', why: 'more coils make a stronger magnetic field'},
  {iv: 'the number of cells goes up', eff: 'more clips will be picked up', why: 'more cells push more current through the coil'},
  {iv: 'a metal is used in the tester instead of plastic', eff: 'the current will be bigger', why: 'metals have free electrons'},
  {iv: 'the turns each second go up', eff: 'the peak voltage will go up', why: 'the magnet moves past the coil more quickly'},
  {iv: 'the number of bulbs in series goes up', eff: 'the current will go down', why: 'there is more resistance in the loop'}
];
const rtHyp = h => `If ${h.iv}, then ${h.eff}, because ${h.why}.`;
RT_GEN.X1 = {
  A(r){
    if (r() < 0.6){
      const obs = r() < 0.5, [s, topic] = rtPick(r, obs ? RT_X1_OBS : RT_X1_INF);
      return rtMcq(r, `“${s}” Is this an observation or an inference?`, obs ? 'Observation: it is what you see or measure' : 'Inference: it explains what you saw or measured',
        obs ? ['Inference: it explains what you saw or measured', 'Inference: an inference is always correct, so it is a fact'] : ['Observation: it is what you see or measure', 'Observation: it must be correct, so it is a fact'], obs ? 'An observation is what you see or measure.' : 'An inference is an explanation for what you saw. It might be wrong, so it needs testing.', {topic, p: {obs}});
    }
    const hy = rtPick(r, RT_X1_HYP), good = rtHyp(hy), isH = r() < 0.5;
    const nots = [`If ${hy.iv}, then ${hy.eff}.`, 'The electromagnet picks up 8 clips.', 'How many clips will 20 coils pick up?'];
    const s = isH ? good : rtPick(r, nots);
    return rtMcq(r, `“${s}” Is this a good hypothesis?`, isH ? 'Yes: it links the variables and gives a reason' : 'No: it does not link the variables and give a reason',
      isH ? ['No: a hypothesis must be a question', 'No: a hypothesis only says what you see'] : ['Yes: it links the variables and gives a reason', 'Yes: a hypothesis is anything you can measure'], 'A hypothesis links the variables and gives a reason, starting “If… then… because…”.', {topic: 'electromagnets', p: {isH}});
  },
  B(r){
    if (r() < 0.5){
      const s = rtPick(r, RT14);
      return rtMcq(r, `You change ${s.iv} and measure ${s.dv}. Which is the best open research question?`, `How does ${s.iv} change ${s.dv}?`,
        [`Does ${s.iv} change ${s.dv}?`, `How does ${s.dv} change ${s.iv}?`, `Is ${s.iv} the best thing to change?`], 'A good research question is open (it starts with how or what) and links the variable you change to the variable you measure.', {topic: 'electromagnets', p: {}});
    }
    const hy = rtPick(r, RT_X1_HYP);
    return rtMcq(r, 'Which is the best hypothesis?', rtHyp(hy), [`If ${hy.iv}, then ${hy.eff}. We will count and record the results in a table.`, `How much will change when ${hy.iv}, and what will we see happen?`, `I think ${hy.eff}, because my teacher says this experiment always works well.`],
      'A hypothesis links the variables and gives a reason: “If… then… because…”.', {topic: 'electromagnets', p: {}});
  }
};

/* ---------- the entry point ---------- */
function rtGen(id, dir, rng, opts){
  const f = RT_FAMILIES.find(x => x.id === id || x.n === id);
  if (!f) throw new Error('Unknown family: ' + id);
  if (dir !== 'A' && dir !== 'B') throw new Error('Direction must be A or B');
  opts = opts || {};
  const r = typeof rng === 'function' ? rng : rtRng(rng == null ? Math.random() : rng);
  const it = RT_GEN[f.n][dir](r, opts);
  it.fam = f.n; it.famId = f.id; it.dir = dir; it.topic = it.topic || f.stop; it.obj = RT_OBJ[f.n].slice();
  if (!opts.challenge && it.challenge) throw new Error('Challenge item without opts.challenge: ' + f.n);
  return it;
}
