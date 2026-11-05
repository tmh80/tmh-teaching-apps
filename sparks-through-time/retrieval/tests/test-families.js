/* Tests for retrieval/src/10-families.js, in plain Node.
   node retrieval/tests/test-families.js            (300 seeds per family and direction)
   Every calculate family is recomputed here from the numbers in the question text, with the rule written again. */
const vm = require('vm'), fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'src');
const ctx = vm.createContext({console, Math});
vm.runInContext(fs.readFileSync(path.join(SRC, '01-data.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(SRC, '10-families.js'), 'utf8'), ctx);
const ev = c => vm.runInContext(c, ctx);
const FAMS = ev('RT_FAMILIES'), SLOTS = ev('RT_SLOTS'), EL = ev('RT_ELEMENTS'), LADDER = ev('RT_LADDER'), DEMAND = ev('RT_DEMAND'), CO2 = ev('RT_CO2');
const gen = ev('(id,dir,seed,opts)=>rtGen(id,dir,rtRng(seed),opts)');
const SEEDS = +process.env.SEEDS || 300;

let checks = 0, fails = 0, ctxLabel = '';
function ok(cond, msg){ checks++; if (!cond){ fails++; console.log(`FAIL ${ctxLabel}: ${msg}`); } }
const near = (a, b, e) => Math.abs(a - b) <= (e == null ? 1e-9 : e);
const strip = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const num = s => parseFloat(String(s).replace(/,/g, ''));
const sgn = s => s === '−' || s === '-' ? -1 : 1;
const STOP_IDS = ['launch', 'atom', 'static', 'circuits', 'electromagnets', 'ohm', 'generators', 'bulb', 'series', 'acdc', 'power', 'future'];
const TYPES = ['mcq', 'num', 'table', 'multi', 'fill', 'sort', 'match', 'order'];

/* ---------- slot table, written out again from catalogue section 2 ---------- */
(function slots(){
  ctxLabel = 'RT_SLOTS';
  const want = {
    launch: ['F2AB,F1A', '', 'F1B'], atom: ['F4AB,F5A', 'F3AB', 'F5B'], static: ['F6AB', 'F7AB', 'F8AB'], circuits: ['F11AB', 'F10AB', 'F9AB'],
    electromagnets: ['F14AB', 'F13AB', 'F12AB'], ohm: ['F17AB', 'F15AB', 'F16AB'], generators: ['F18B', 'F19AB', 'F18A'], bulb: ['F21AB', 'F20AB', 'F22AB'],
    series: ['F24B', 'F23AB', 'F24A'], acdc: ['F25AB', 'F26AB', 'F27AB'], power: ['F28A,F29AB', 'F30AB', 'F28B'], future: ['F32A', 'F31AB', 'F32B']
  };
  const idOf = {}; FAMS.forEach(f => { idOf[f.n] = f.id; });
  const expand = s => s ? s.split(',').flatMap(t => { const n = t.match(/^F\d+/)[0], d = t.slice(n.length); return d.split('').map(x => idOf[n] + '/' + x); }) : [];
  ok(Object.keys(SLOTS).sort().join() === Object.keys(want).sort().join(), 'stop keys differ');
  for (const st in want){
    ['apply', 'calc', 'predict'].forEach((k, i) => {
      const got = (SLOTS[st] && SLOTS[st][k] || []).map(x => x[0] + '/' + x[1]).sort().join(), exp = expand(want[st][i]).sort().join();
      ok(got === exp, `${st}.${k}: got ${got} wanted ${exp}`);
    });
  }
  const all = new Set(); Object.values(SLOTS).forEach(s => ['apply', 'calc', 'predict'].forEach(k => s[k].forEach(x => all.add(x[0]))));
  ok(!all.has('think-like-a-scientist'), 'X1 must not be in RT_SLOTS');
  FAMS.filter(f => !f.classOnly).forEach(f => ok(all.has(f.id), `${f.n} never appears in RT_SLOTS`));
  ok(FAMS.length === 33 && FAMS.filter(f => f.classOnly).length === 1 && FAMS.find(f => f.n === 'X1').classOnly === true, 'need 33 families, X1 classOnly');
  FAMS.forEach(f => ok(STOP_IDS.includes(f.stop) && f.slots && f.slots.A && f.slots.B && f.id, `${f.n} family shape`));
})();

/* ---------- independent data for the recalculations ---------- */
const EXAMPLE_KIND = {};   /* 0 static, 1 current */
['Lightning flashing in a storm cloud', 'Hair standing up after taking off a hat', 'A balloon sticking to the wall', 'A small shock from a car door handle', 'Dust clinging to a TV screen', 'Crackles when you pull off a jumper', 'A comb picking up tiny bits of paper', 'A shock from a metal door handle'].forEach(x => EXAMPLE_KIND[x] = 0);
['A flashlight shining in the dark', 'A phone charging from a socket', 'A doorbell ringing at the front door', 'A fridge keeping the food cold', 'A laptop running on its battery', 'An electric bus driving through Beijing', 'A hairdryer blowing warm air', 'A bedside lamp glowing at night'].forEach(x => EXAMPLE_KIND[x] = 1);
const MATERIAL_KIND = {Copper: 0, Aluminium: 0, Iron: 0, Steel: 0, Plastic: 1, Wood: 1, Glass: 1, Rubber: 1, Paper: 1};
const JOBS = {Cell: 'pushes the current round the circuit', Bulb: 'turns electrical energy into light', Switch: 'opens or closes a gap in the circuit', Ammeter: 'measures the current, in amps (A)', Voltmeter: 'measures the voltage, in volts (V)', Resistor: 'makes it harder for current to flow', LED: 'gives out light and lets current through one way', Motor: 'turns electrical energy into movement', Buzzer: 'turns electrical energy into sound', Wire: 'joins the parts and lets current flow'};
const INV = [['Does the number of coils', 'the number of coils', 'the number of clips picked up', 'the number of cells'], ['Does the number of cells', 'the number of cells', 'the number of clips picked up', 'the number of coils'], ['Does the material of the core', 'the material of the core', 'the number of clips picked up', 'the number of coils'], ['Does the material in a tester', 'the material in the tester', 'the current in the circuit', 'the cell that is used'], ['Do the turns each second', 'the turns each second', 'the peak voltage', 'the number of turns of wire'], ['Does the number of bulbs in series', 'the number of bulbs in series', 'the current in the circuit', 'the cell that is used']];
const DEV_USEFUL = {toaster: ['heat'], laptop: ['light'], kettle: ['heat'], 'filament bulb': ['light'], 'LED lamp': ['light'], 'electric drill': ['movement'], 'electric fan': ['movement'], radio: ['sound'], television: ['light', 'sound'], 'electric heater': ['heat'], doorbell: ['sound'], hairdryer: ['heat', 'movement']};
const GROUP = {Coal: 'Fossil fuel', 'Natural gas': 'Fossil fuel', Biomass: 'Renewable', Nuclear: 'Non-renewable, low carbon', Geothermal: 'Renewable', Hydroelectric: 'Renewable', 'Tidal and wave': 'Renewable', Wind: 'Renewable', Solar: 'Renewable'};
const CHAINS = {coal: ['Burn coal', 'Heat boils water', 'Steam spins the turbine', 'The generator makes electricity'], gas: ['Burn gas', 'Hot gases spin a turbine', 'The generator makes electricity'], biomass: ['Burn wood or plant waste', 'Heat boils water', 'Steam spins the turbine', 'The generator makes electricity'], nuclear: ['Uranium atoms split', 'Heat boils water', 'Steam spins the turbine', 'The generator makes electricity'], geo: ['Heat from deep underground', 'Hot water turns to steam', 'Steam spins the turbine', 'The generator makes electricity'], hydro: ['Water stored behind a dam', 'Falling water spins the turbine', 'The generator makes electricity'], tidal: ['The Moon pulls the tides', 'Moving seawater spins the turbine', 'The generator makes electricity'], wind: ['The Sun heats the air, making wind', 'Wind spins the blades', 'The generator makes electricity']};
const POWERNAME = {tidal: 'Tidal power', wind: 'Wind power', solar: 'Solar power', geo: 'Geothermal power', hydro: 'Hydroelectric power', biomass: 'Biomass power'};
const PLACE_SRC = [['strong tides', 'tidal'], ['windy hilltop', 'wind'], ['sunny desert', 'solar'], ['hot springs', 'geo'], ['big river', 'hydro'], ['crop waste', 'biomass']];
const AC_SRC = ['The wall socket at home', 'The power lines to your street', 'A bicycle dynamo', 'A wind turbine generator', 'A hydroelectric generator', 'The mains socket in a classroom'];
const DC_SRC = ['A 1.5 V cell', 'A phone battery', 'A solar panel', 'A car battery', 'A USB power bank', 'A laptop battery'];

/* ---------- a small circuit solver (cell 1.5 V + 0.2 ohm, bulb 4 ohm, wires and closed switches 0 ohm) ---------- */
function solveBulbs(edges){
  const par = {}; const find = a => { par[a] = par[a] || a; while (par[a] !== a){ par[a] = par[par[a]]; a = par[a]; } return a; };
  const uni = (a, b) => { par[find(a)] = find(b); };
  const ends = k => { const [d, r, c] = k.split(','); return d === 'h' ? [`${r},${c}`, `${r},${(+c) + 1}`] : [`${r},${c}`, `${(+r) + 1},${c}`]; };
  const parts = [];
  for (const k in edges){
    const e = edges[k], [a, b] = ends(k); find(a); find(b);
    if (e.type === 'wire' || (e.type === 'switch' && e.closed)) uni(a, b);
    else if (e.type === 'cell') parts.push({k, kind: 'cell', a: e.flip ? b : a, b: e.flip ? a : b});
    else if (e.type === 'bulb' && !e.broken) parts.push({k, kind: 'bulb', a, b});
  }
  const names = [...new Set(Object.keys(par).map(find))], idx = new Map(names.map((n, i) => [n, i])), N = names.length;
  const G = Array.from({length: N}, () => new Array(N).fill(0)), I = new Array(N).fill(0);
  const stamp = (a, b, g) => { a = idx.get(find(a)); b = idx.get(find(b)); G[a][a] += g; G[b][b] += g; G[a][b] -= g; G[b][a] -= g; };
  parts.forEach(p => { if (p.kind === 'bulb') stamp(p.a, p.b, 1 / 4); else { stamp(p.a, p.b, 1 / 0.2); I[idx.get(find(p.b))] += 1.5 / 0.2; I[idx.get(find(p.a))] -= 1.5 / 0.2; } });
  for (let i = 0; i < N; i++) G[i][i] += 1e-9;
  const M = G.map((row, i) => row.concat(I[i]));
  for (let c = 0; c < N; c++){ let p = c; for (let r = c + 1; r < N; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < N; r++) if (r !== c){ const f = M[r][c] / M[c][c]; for (let k = c; k <= N; k++) M[r][k] -= f * M[c][k]; } }
  const V = M.map((row, i) => row[N] / row[i]);
  return parts.filter(p => p.kind === 'bulb').map(p => Math.abs(V[idx.get(find(p.a))] - V[idx.get(find(p.b))]) / 4);
}

/* ---------- shape checks that apply to every item ---------- */
function shape(it, f, dir, opts){
  ok(it && typeof it === 'object', 'item is an object'); if (!it) return;
  ok(TYPES.includes(it.t), 'type ' + it.t);
  ok(typeof it.q === 'string' && it.q.length > 15, 'q text');
  ok(typeof it.explain === 'string' && it.explain.length > 8, 'explain text');
  ok(it.fam === f.n && it.dir === dir && it.topic && STOP_IDS.includes(it.topic) && Array.isArray(it.obj), 'fam, dir, topic, obj');
  ok(f.classOnly ? it.obj.length === 0 : it.obj.length > 0, 'obj tags');
  ok(!(it.challenge && !opts.challenge), 'challenge item without opts.challenge');
  const all = JSON.stringify(it);
  ok(!/undefined|NaN|\[object|null/.test(all), 'bad text in item: ' + (all.match(/undefined|NaN|\[object|null/) || [''])[0]);
  ok(!/\btorch\b|\bspeed\b|\bweighs?\b|\bMYP\b|criteri|strand/i.test(strip(it.q) + ' ' + it.explain + ' ' + JSON.stringify(it.options || it.rows || it.items || '')), 'banned word');
  if (it.t === 'mcq'){
    ok(Array.isArray(it.options) && it.options.length >= 3 && it.options.length <= 4, 'mcq needs 3 or 4 options, got ' + (it.options && it.options.length));
    ok(new Set(it.options).size === it.options.length, 'mcq options not unique');
    ok(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < it.options.length, 'mcq answer index');
    const L = it.options.map(o => strip(o).length), mx = Math.max(...L), mn = Math.min(...L);
    ok(mx <= 2.2 * mn + 12, `mcq options differ too much in length (${mn} to ${mx}): ${it.options.join(' | ')}`);
  } else if (it.t === 'num'){
    ok(Number.isFinite(it.answer), 'num answer finite'); ok(Number.isFinite(it.tol) && it.tol >= 0, 'num tol'); ok(typeof it.unit === 'string', 'num unit');
    ok(Math.abs(it.answer) < 1e7 && near(it.answer, +it.answer.toFixed(6), 1e-12), 'num answer has float noise: ' + it.answer);
  } else if (it.t === 'multi'){
    ok(Array.isArray(it.options) && new Set(it.options).size === it.options.length && it.options.length >= 4, 'multi options');
    ok(Array.isArray(it.answers) && it.answers.length >= 1 && it.answers.every(i => Number.isInteger(i) && i >= 0 && i < it.options.length) && new Set(it.answers).size === it.answers.length, 'multi answers');
  } else if (it.t === 'order'){
    ok(Array.isArray(it.items) && it.items.length >= 3 && new Set(it.items).size === it.items.length, 'order items');
  } else if (it.t === 'sort'){
    ok(Array.isArray(it.groups) && it.groups.length >= 2 && Array.isArray(it.items) && it.items.length >= 3 && it.items.every(x => typeof x[0] === 'string' && Number.isInteger(x[1]) && x[1] < it.groups.length), 'sort shape');
    ok(new Set(it.items.map(x => x[0])).size === it.items.length, 'sort labels unique');
    ok(new Set(it.items.map(x => x[1])).size >= 2, 'sort needs a mix of groups');
  } else if (it.t === 'table' || it.t === 'match'){
    ok(Array.isArray(it.cols) && it.cols.length >= 1 && Array.isArray(it.rows) && it.rows.length >= 1 && typeof it.rowHead === 'string', 'grid shape');
    (it.rows || []).forEach(row => {
      ok(typeof row.label === 'string' && row.label.length > 0 && Array.isArray(row.ans) && row.ans.length === it.cols.length, 'row shape');
      it.cols.forEach((c, j) => ok(!c.options || c.options.includes(row.ans[j]), `answer "${row.ans[j]}" missing from options`));
    });
    it.cols.forEach(c => ok(!c.options || new Set(c.options).size === c.options.length, 'grid options unique'));
    ok(new Set(it.rows.map(r => r.label)).size === it.rows.length, 'row labels unique');
  }
}

/* ---------- independent checks, one function per family ---------- */
const rt1 = (a, b) => a === 'neutral' && b === 'neutral' ? 'Nothing' : (a === 'neutral' || b === 'neutral') ? 'Attract' : a === b ? 'Repel' : 'Attract';
const SUP = {'²': 2, '³': 3};
const fillShells = z => { let left = z; const caps = [2, 8, 8], out = []; for (const c of caps){ const t = Math.min(left, c); out.push(t); left -= t; } return out; };
const CHECK = {};

CHECK.F1 = (it, dir) => {
  if (dir === 'A') it.rows.forEach(r => { const w = r.label.match(/positive|negative|neutral/g); const pair = w.length === 1 ? [w[0], w[0]] : w; ok(r.ans[0] === rt1(pair[0], pair[1]), `${r.label} -> ${r.ans[0]}`); });
  else {
    const q = strip(it.q), right = it.options[it.answer], c = (q.match(/(positive|negative|neutral)/) || [])[1];
    if (/repels/.test(q)) ok(right.startsWith(c[0].toUpperCase() + c.slice(1) + ', because only like'), 'repel answer: ' + right);
    else if (/attracts a neutral/.test(q)) ok(/^Positive or negative/.test(right), 'attract neutral: ' + right);
    else { const o = c === 'positive' ? 'Positive' : 'Negative', opp = c === 'positive' ? 'Negative' : 'Positive'; ok(right.startsWith(opp + ' or neutral'), 'attract charged: ' + right + ' ' + o); }
  }
};
CHECK.F2 = (it, dir) => {
  if (dir === 'A') it.items.forEach(x => ok(EXAMPLE_KIND[x[0]] === x[1], 'sort kind ' + x[0]));
  else { const cur = /keeps flowing/.test(it.q), right = it.options[it.answer]; ok(EXAMPLE_KIND[right] === (cur ? 1 : 0), 'right example kind'); it.options.forEach((o, i) => i !== it.answer && ok(EXAMPLE_KIND[o] === (cur ? 0 : 1), 'wrong example kind ' + o)); }
};
CHECK.F3 = (it, dir) => {
  const q = strip(it.q).replace(/\s+/g, ' ');
  if (dir === 'A'){
    const z = num((q.match(/atomic number (\d+)/) || [])[1]), m = (q.match(/mass number (\d+)/) || [])[1];
    ok(z >= 1 && z <= 20, 'Z range');
    if (/ion,/.test(q)){ const s = q.match(/ion, ([A-Za-z]+)([²³]?)([⁺⁻])\)?,/); const mag = s[2] ? SUP[s[2]] : 1, ch = s[3] === '⁺' ? mag : -mag; ok(it.answer === z - ch, `ion electrons ${it.answer} vs ${z - ch}`); ok(EL[z - 1].sym === s[1], 'ion symbol matches Z'); ok(RT_IONS_OK(s[1], ch), 'ion in list ' + s[1] + ch); }
    else {
      ok(+m === EL[z - 1].mass, 'mass matches table');
      if (/How many neutrons/.test(q)) ok(it.answer === +m - z, 'neutrons'); else if (/How many protons/.test(q)) ok(it.answer === z, 'protons'); else if (/How many electrons/.test(q)) ok(it.answer === z, 'electrons'); else ok(false, 'unknown question');
    }
  } else {
    if (/Which element/.test(q)){ const p = num(q.match(/has (\d+) protons/)[1]), n = num(q.match(/, (\d+) neutrons/)[1]); ok(EL[p - 1].n === n, 'neutrons match table'); ok(it.options[it.answer] === EL[p - 1].name, 'element name'); }
    else if (/mass number\?/.test(q)){ const m = q.match(/(\d+) protons and (\d+) neutrons/), p = +m[1], n = +m[2]; ok(EL[p - 1].n === n, 'neutrons match table'); ok(it.answer === p + n, 'mass number'); }
    else { const m = q.match(/(\d+) protons, (\d+) neutrons and (\d+) electrons/), p = +m[1], n = +m[2], e = +m[3]; ok(EL[p - 1].n === n, 'neutrons match table'); ok(it.answer === p - e, 'charge'); ok(RT_IONS_OK(EL[p - 1].sym, p - e), 'charge in ion list'); }
  }
};
function RT_IONS_OK(sym, c){ return [['Li', 1], ['Be', 2], ['O', -2], ['F', -1], ['Na', 1], ['Mg', 2], ['Al', 3], ['S', -2], ['Cl', -1], ['K', 1], ['Ca', 2]].some(x => x[0] === sym && x[1] === c); }
CHECK.F4 = (it, dir) => {
  const q = strip(it.q).replace(/\s+/g, ' ');
  if (dir === 'A'){ const z = +q.match(/has (\d+) electrons/)[1]; ok(z >= 1 && z <= 18, 'Z range 1 to 18'); const s = fillShells(z); ok(it.rows.every((r, i) => r.ans[0] === String(s[i])), 'shell counts'); ok(it.rows.length === 3, 'three rows'); ok(q.includes(EL[z - 1].name.toLowerCase()), 'name matches Z'); }
  else {
    let pat; if (/one shell holding (\d+)/.test(q)) pat = [+q.match(/one shell holding (\d+)/)[1]]; else pat = q.match(/shells of ([\d, and]+) electron/)[1].split(/, | and /).map(Number);
    const z = pat.reduce((a, b) => a + b, 0); ok(z >= 1 && z <= 18, 'Z range'); ok(fillShells(z).filter(x => x > 0).join() === pat.join(), 'pattern follows the fill rule');
    ok(it.options[it.answer] === EL[z - 1].name, 'element name');
  }
};
CHECK.F5 = (it, dir) => {
  const q = strip(it.q);
  if (dir === 'A' && it.t === 'mcq'){
    const tab = [['everything is made of tiny pieces', 'Democritus'], ['thinking alone', 'Democritus'], ['400 BCE', 'Democritus'], ['solid spheres', 'Dalton'], ['fixed amounts', 'Dalton'], ['1803', 'Dalton'], ['ball of positive charge', 'Thomson'], ['cathode rays', 'Thomson'], ['1897', 'Thomson'], ['tiny positive nucleus', 'Rutherford'], ['gold foil', 'Rutherford'], ['1911', 'Rutherford'], ['in shells', 'Bohr'], ['certain colours', 'Bohr'], ['1913', 'Bohr']];
    const hit = tab.find(x => q.includes(x[0])); ok(!!hit, 'known question'); if (hit) ok(it.options[it.answer].startsWith(hit[1]), `${q} -> ${it.options[it.answer]}`);
    const date = { Democritus: '400 BCE', Dalton: '1803', Thomson: '1897', Rutherford: '1911', Bohr: '1913' }; it.options.forEach(o => ok(o.includes(date[o.split(/[’']/)[0]]), 'option date ' + o));
  } else if (dir === 'A'){
    const key = [['Everything is made', 'Democritus'], ['solid spheres', 'Dalton'], ['dotted through', 'Thomson'], ['tiny positive nucleus', 'Rutherford'], ['in shells', 'Bohr']];
    it.rows.forEach(r => ok(key.find(k => r.label.includes(k[0]))[1] === r.ans[0], 'match ' + r.label));
  } else {
    const tab = [['Thomson’s plum pudding model were right', 'straight through'], ['Dalton’s solid sphere model <b>not', 'negative particles'], ['Thomson’s model <b>not', 'bouncing straight back'], ['Rutherford’s model <b>not', 'certain colours'], ['Bohr’s model add', 'shells'], ['Why do scientists still learn', 'led to better models'], ['Rutherford’s model were right', 'nucleus']];
    const hit = tab.find(x => it.q.includes(x[0])); ok(!!hit, 'known B question'); if (hit) ok(it.options[it.answer].includes(hit[1]), 'B right answer: ' + it.options[it.answer]);
  }
};
CHECK.F6 = (it, dir) => {
  const q = strip(it.q), idx = n => LADDER.findIndex(x => x.toLowerCase() === n.toLowerCase());
  if (dir === 'A'){ const a = idx(it.rows[0].label), b = idx(it.rows[1].label); ok(a >= 0 && b >= 0 && Math.abs(a - b) >= 2, 'rungs at least two apart'); ok(it.rows[a > b ? 0 : 1].ans[0] === 'Negative' && it.rows[a > b ? 1 : 0].ans[0] === 'Positive', 'lower is negative'); }
  else {
    const m = LADDER.map(x => x).find(x => q.startsWith(x)), pos = idx(m), other = LADDER.find(x => q.toLowerCase().includes('rubbed with ' + x.toLowerCase())), oi = idx(other);
    ok(pos >= 0 && oi >= 0 && oi - pos >= 2, 'positive material is two or more rungs above'); const right = it.options[it.answer];
    if (/Which way did the electrons move/.test(q)) ok(right === `From the ${m.toLowerCase()} onto the ${other.toLowerCase()}`, 'electron direction: ' + right); else ok(right === `The ${other.toLowerCase()}, because it grabbed the electrons`, 'lower material: ' + right);
  }
};
CHECK.F7 = (it, dir) => {
  const q = strip(it.q).replace(/\s+/g, ' ');
  if (dir === 'A'){ const m = q.match(/(\d+) electrons move from the (\w+) to the (\w+)\. What is the charge on the (\w+)\?/), n = +m[1]; ok(n >= 3 && n <= 24, 'n range'); ok(it.answer === (m[4] === m[3] ? -n : n), 'signed charge'); ok(m[4] === m[3] || m[4] === m[2], 'asked about one of the objects'); }
  else if (/How many electrons/.test(q)){ const m = q.match(/charge of ([+−])(\d+)/); ok(it.answer === +m[2] && +m[2] >= 3 && +m[2] <= 24, 'electrons moved'); }
  else { const m = q.match(/charge of ([+−])(\d+)/), n = +m[2]; ok(n >= 3 && n <= 24, 'n range'); ok(it.answer === -sgn(m[1]) * n, 'other charge'); }
};
CHECK.F8 = (it, dir) => {
  const q = strip(it.q);
  if (dir === 'A'){ const rp = /repelled by a positive/.test(q), rn = /repelled by a negative/.test(q); const hid = rp ? 'Positive' : rn ? 'Negative' : 'Neutral'; ok(!(rp && rn), 'cannot repel both'); ok(it.options[it.answer].startsWith(hid), `hidden ${hid} -> ${it.options[it.answer]}`); }
  else { const h = q.match(/is (neutral|positive|negative)\./)[1]; const exp = s => rt1(h, s); ok(it.rows[0].ans[0] === exp('positive') && it.rows[1].ans[0] === exp('negative'), 'test results'); }
};
CHECK.F9 = (it, dir) => {
  const T = {loop: [0.36, 1], gap: [0, 0], swopen: [0, 0], swclosed: [0.36, 1], short: [0, 0], spare: [0.36, 1], opp: [0, 0], same: [0.68, 1], twogap: [0, 0], twoshort: [0.36, 1], parallel: [0.36, 1]};
  const [cur, lit] = T[it.p.setup]; ok(it.p.lit === !!lit && near(it.p.cur, cur, 1e-9), 'catalogue table row');
  ok(it.edges && it.edges === it.diagram.edges && Object.keys(it.edges).length > 8, 'circuit edges present');
  const bulbs = solveBulbs(it.edges), mx = Math.max(0, ...bulbs);
  if (it.p.setup === 'parallel'){ ok(bulbs.length === 1, 'one working bulb'); ok(Object.values(it.edges).filter(e => e.type === 'bulb').length === 2, 'two bulbs'); }
  ok(near(mx, cur, 0.01), `solver current ${mx.toFixed(3)} vs ${cur}`); ok((mx > 0.02) === !!lit, 'lit by solver');
  Object.keys(it.edges).forEach(k => ok(/^[hv],[0-3],[0-4]$/.test(k) && (k[0] === 'h' ? +k.split(',')[2] <= 3 : +k.split(',')[1] <= 1), 'edge key in range ' + k));
  if (dir === 'A'){ const r = it.options[it.answer]; ok(lit ? /^It lights/.test(r) : /^(It stays dark|Neither)/.test(r), 'answer text matches lit: ' + r); }
  else ok(!lit, 'B uses a dark set-up');
};
CHECK.F10 = (it, dir) => {
  const q = strip(it.q).replace(/\s+/g, ' ');
  if (dir === 'A'){
    let n, rev; if (/all facing the same way/.test(q)){ n = +q.match(/^(\d+) cells/)[1]; rev = 0; } else { n = +q.match(/^(\d+) cells/)[1]; rev = /One faces/.test(q) ? 1 : +q.match(/(\d+) face the wrong/)[1]; }
    ok(n >= 1 && n <= 8 && rev >= 0 && rev <= 3, 'n and reversed in range'); const v = 1.5 * (n - rev - rev); ok(near(it.answer, v, 1e-9), `voltage ${it.answer} vs ${v}`); ok(v >= 1.5 && v <= 12, 'total in 1.5 to 12 V');
  } else { const v = num(q.match(/needs ([\d.]+) V/)[1]); ok(near(it.answer * 1.5, v, 1e-9) && it.answer >= 1 && it.answer <= 8 && v <= 12, 'cells needed'); }
};
CHECK.F11 = (it, dir) => {
  const q = strip(it.q);
  if (it.t === 'match') it.rows.forEach(r => ok(JOBS[r.label] === r.ans[0], 'job ' + r.label));
  else if (dir === 'A'){ const nm = q.match(/What does a (.+) do\?/)[1], key = Object.keys(JOBS).find(k => k.toLowerCase() === nm.toLowerCase()); ok(it.options[it.answer] === 'It ' + JOBS[key], 'job text'); }
  else if (/Which meter/.test(q)){ const cur = /measures current/.test(q); ok(it.options[it.answer] === (cur ? 'An ammeter, in amps (A)' : 'A voltmeter, in volts (V)'), 'meter answer'); }
  else { const job = q.match(/Which part (.+)\?/)[1], key = Object.keys(JOBS).find(k => JOBS[k] === job); ok(key && it.options[it.answer] === key, 'part for job'); }
};
const F12F = {iron: 1, steel: 0.7, aluminium: 0.1, wood: 0.1, none: 0.1};
function parse12(txt){
  const coreOf = s => /iron/.test(s) ? 'iron' : /steel/.test(s) ? 'steel' : /aluminium/.test(s) ? 'aluminium' : /wooden/.test(s) ? 'wood' : 'none';
  const parts = txt.split(/Q (?:has|is)|Electromagnet Q has/); const P = parts[0], Q = txt.slice(txt.indexOf(' Q has ') >= 0 ? txt.indexOf(' Q has ') : txt.indexOf('Electromagnet Q has'));
  const pv = s => ({coils: +s.match(/(\d+) coils/)[1], cells: +s.match(/(\d+) cells?/)[1]});
  const a = pv(P), b = pv(Q), both = /Both have iron cores/.test(txt);
  a.core = both ? 'iron' : coreOf(P.split('and')[P.split('and').length - 1]); b.core = both ? 'iron' : coreOf(Q.split('and')[Q.split('and').length - 1]);
  return [a, b];
}
const clips12 = m => { const raw = m.coils / 10 * m.cells * 2 * F12F[m.core]; return {raw, c: Math.round(raw)}; };
CHECK.F12 = (it, dir) => {
  const one = (txt, expectP) => { const [a, b] = parse12(strip(txt).replace(/\s+/g, ' ')); const ca = clips12(a), cb = clips12(b); ok(a.coils >= 10 && a.coils <= 60 && b.coils >= 10 && b.coils <= 60 && a.cells >= 1 && a.cells <= 4 && b.cells >= 1 && b.cells <= 4, 'coils and cells in range');
    ok(Math.max(ca.c, cb.c) >= 1.25 * Math.min(ca.c, cb.c) && Math.min(ca.c, cb.c) >= 1, 'pair at least 25% apart'); ok(![ca.raw, cb.raw].some(v => near(v % 1, 0.5, 1e-9)), 'no exact half'); return ca.c > cb.c; };
  if (dir === 'A'){
    if (it.t === 'table') it.rows.forEach(r => ok((one(r.label) ? 'P is stronger' : 'Q is stronger') === r.ans[0], 'table pair'));
    else { const p = one(it.q.replace(/ Which is stronger\?$/, '')); ok(it.options[it.answer] === (p ? 'P is stronger' : 'Q is stronger'), 'which is stronger'); }
  } else ok(it.t === 'mcq' && /core|cell|coils|plastic/.test(it.options[it.answer]), 'B right answer present');
};
CHECK.F13 = (it, dir) => {
  const q = it.q, cells = [...q.matchAll(/<td>([\d,]+)<\/td><td>([\d,]+)<\/td>/g)].map(m => [num(m[1]), num(m[2])]);
  if (dir === 'A'){
    if (it.challenge){ const L = cells[0][1]; ok(cells.every(c => c[1] === c[0] * L), 'rows are multiples'); ok(L >= 250 && L <= 600, 'L range'); const n = num(strip(q).match(/that (\d+) cells can lift/)[1]); ok(it.answer === n * L, 'crane answer'); ok(/mass|load/.test(q) && !/weigh/i.test(q), 'crane wording'); }
    else { const k = cells[0][1] / cells[0][0] * 10; ok(k >= 2 && k <= 6 && Number.isInteger(k), 'k range'); ok(cells.every(c => near(c[1] / c[0] * 10, k)), 'rows follow the pattern'); const c = num(strip(q).match(/with (\d+) coils\.$/)[1]); ok(c >= 15 && c <= 75, 'coils range'); ok(Number.isInteger(c * k / 10) && it.answer === c * k / 10, 'clips answer'); }
  } else {
    const s = strip(q);
    if (it.challenge){ const m = s.match(/each cell lifts ([\d,]+) kg.*mass of ([\d,]+) kg/), L = num(m[1]), M = num(m[2]); ok(L >= 250 && L <= 600 && M >= 700 && M <= 2900, 'crane ranges'); ok(M % L !== 0, 'not an exact multiple'); ok(it.answer === Math.ceil(M / L) && (it.answer - 1) * L < M && it.answer * L >= M, 'fewest cells'); ok(/has a mass of|with a mass of/.test(s), 'wording: mass of'); }
    else { const m = s.match(/picks up (\d+) clips for every 10 coils.*pick up (\d+) clips/), k = +m[1], T = +m[2]; ok(k >= 2 && k <= 6, 'k range'); ok(it.answer * k / 10 === T && it.answer >= 15 && it.answer <= 75, 'coils answer'); }
  }
};
CHECK.F14 = (it, dir) => {
  const q = strip(it.q).replace(/\s+/g, ' ');
  if (dir === 'A'){
    const inv = INV.find(x => q.includes(x[0])); ok(!!inv, 'known investigation'); if (!inv) return;
    if (it.t === 'table'){ ok(it.rows[0].ans[0] === inv[1][0].toUpperCase() + inv[1].slice(1) && it.rows[1].ans[0] === inv[2][0].toUpperCase() + inv[2].slice(1) && it.rows[2].ans[0] === inv[3][0].toUpperCase() + inv[3].slice(1), 'table variables'); }
    else { const role = /independent/.test(q.slice(-30)) ? 1 : /dependent/.test(q.slice(-30)) ? 2 : 3; const want = inv[role]; ok(it.options[it.answer] === want[0].toUpperCase() + want.slice(1), 'role answer'); }
  } else { const m = q.match(/You change (.+) and measure (.+)\. Which/); ok(it.options[it.answer] === `How does ${m[1]} change ${m[2]}?`, 'research question'); }
};
CHECK.F15 = (it, dir) => {
  const q = strip(it.q); const V = [1.5, 3, 4.5, 6, 9, 12];
  let v, i, r;
  if (dir === 'A'){ const m = q.match(/current of ([\d.]+) A flows through a (\d+) Ω/); i = +m[1]; r = +m[2]; v = Math.round(i * r * 1000) / 1000; ok(it.answer === v && V.includes(v), `V = I x R: ${it.answer} vs ${v}`); }
  else if (/resistance/.test(q.split('?')[0].slice(-25))){ const m = q.match(/A ([\d.]+) V supply drives ([\d.]+) A/); v = +m[1]; i = +m[2]; r = Math.round(v / i * 1e6) / 1e6; ok(it.answer === r && Number.isInteger(r), `R = V / I: ${it.answer} vs ${r}`); }
  else { const m = q.match(/A ([\d.]+) V supply is joined to a (\d+) Ω/); v = +m[1]; r = +m[2]; i = Math.round(v / r * 1e6) / 1e6; ok(near(it.answer, i, 1e-9), `I = V / R: ${it.answer} vs ${i}`); }
  ok(V.includes(v) && r >= 2 && r <= 120 && i >= 0.02 && i <= 6, `range V=${v} R=${r} I=${i}`); ok(near(i * 1000, Math.round(i * 1000), 1e-6), 'at most 3 decimal places');
};
CHECK.F16 = (it, dir) => {
  const q = strip(it.q);
  if (dir === 'A'){
    const I0 = +q.match(/carries ([\d.]+) A/)[1]; ok([0.3, 0.6, 1.2].includes(I0), 'start current'); let fv = 1, fr = 1;
    if (/double the voltage/.test(q)) fv = 2; else if (/voltage three times/.test(q)) fv = 3; else if (/halve the voltage/.test(q)) fv = 0.5;
    if (/double the resistance/.test(q)) fr = 2; else if (/resistance three times/.test(q)) fr = 3; else if (/halve the resistance/.test(q)) fr = 0.5;
    ok(!(fv === 1 && fr === 1), 'something changes'); ok(near(it.answer, I0 * fv / fr, 1e-9), `new current ${it.answer} vs ${I0 * fv / fr}`);
  } else {
    const m = q.match(/from ([\d.]+) A to ([\d.]+) A/), I0 = +m[1], I1 = +m[2], what = /happened to the voltage/.test(q) ? 'v' : 'r'; ok([0.3, 0.6, 1.2].includes(I0), 'start current');
    const ratio = I1 / I0, f = what === 'v' ? ratio : 1 / ratio, ph = [[2, 'twice as big'], [3, 'three times as big'], [0.5, 'half as big'], [1 / 3, 'a third as big']].find(x => near(x[0], f, 1e-9));
    ok(!!ph && it.options[it.answer] === 'It became ' + ph[1], `factor ${f} -> ${it.options[it.answer]}`);
  }
};
CHECK.F17 = (it, dir) => {
  if (it.t === 'sort') it.items.forEach(x => ok(MATERIAL_KIND[x[0]] === x[1], 'material ' + x[0]));
  else ok(it.options.length >= 3, 'options');
};
CHECK.F18 = (it, dir) => {
  const W = {'Spin the magnet faster': 'Goes up', 'Spin the magnet more slowly': 'Goes down', 'Use more turns of wire': 'Goes up', 'Use fewer turns of wire': 'Goes down', 'Use a stronger magnet': 'Goes up', 'Use a weaker magnet': 'Goes down', 'Stop the magnet spinning': 'Drops to zero'};
  if (dir === 'A'){
    if (it.t === 'table') it.rows.forEach(r => ok(W[r.label] === r.ans[0], 'row ' + r.label));
    else { const c = Object.keys(W).find(k => it.q.includes(k.toLowerCase())); ok(!!c && it.options[it.answer].toLowerCase().startsWith('it ' + (W[c] === 'Goes up' ? 'goes up' : W[c] === 'Goes down' ? 'goes down' : 'drops to zero')), 'mcq outcome'); }
  } else {
    const blocked = /the magnet\./.test(it.q) ? 0 : /how fast it spins/.test(it.q) ? 1 : 2, want = [['Spin the magnet faster', 'Use more turns of wire'], ['Use more turns of wire', 'Use a stronger magnet'], ['Spin the magnet faster', 'Use a stronger magnet']][blocked];
    ok(it.answers.map(i => it.options[i]).sort().join('|') === want.slice().sort().join('|'), 'ticked options');
    it.options.forEach((o, i) => { if (!it.answers.includes(i)) ok(W[o] !== 'Goes up', 'a raising change is not ticked: ' + o); });
  }
};
CHECK.F19 = (it, dir) => {
  const q = strip(it.q).replace(/\s+/g, ' '), within = (v, a, b) => v >= a - 1e-9 && v <= b + 1e-9;
  if (dir === 'A'){
    if (/turns each second/.test(q) && /dynamo/.test(q)){ const m = q.match(/gives ([\d.]+) V at (\d+) turns each second.*at (\d+) turns each second\?/), v0 = +m[1], t0 = +m[2], t1 = +m[3]; ok(within(t0, 2, 10) && within(t1, 2, 10) && t0 !== t1, 'turns each second range'); ok(near(it.answer, v0 / t0 * t1, 1e-9), `peak ${it.answer} vs ${v0 / t0 * t1}`); ok(within(v0, 0.4, 30) && within(it.answer, 0.4, 30), 'peak range'); }
    else { const m = q.match(/has (\d+) turns of wire and gives a peak of ([\d.]+) V.*With (\d+) turns/), T0 = +m[1], v0 = +m[2], T1 = +m[3]; ok(within(T0, 100, 500) && within(T1, 100, 500), 'turns of wire range'); ok(near(it.answer, v0 * T1 / T0, 1e-9), `peak ${it.answer} vs ${v0 * T1 / T0}`); ok(within(v0, 0.4, 30) && within(it.answer, 0.4, 30), 'peak range'); ok([1.5, 2, 3, 0.5].some(f => near(T1 / T0, f, 1e-9)), 'factor allowed'); }
  } else {
    if (/dynamo/.test(q)){ const m = q.match(/gives ([\d.]+) V at (\d+) turns each second\. How many turns each second give ([\d.]+) V/), v0 = +m[1], t0 = +m[2], v1 = +m[3]; ok(near(it.answer, v1 / (v0 / t0), 1e-9) && within(it.answer, 2, 10), 'turns each second answer'); ok(within(v0, 0.4, 30) && within(v1, 0.4, 30), 'peak range'); }
    else { const m = q.match(/gives ([\d.]+) V with (\d+) turns of wire\. How many turns of wire give ([\d.]+) V/), v0 = +m[1], T0 = +m[2], v1 = +m[3]; ok(near(it.answer, T0 * v1 / v0, 1e-9) && within(it.answer, 100, 500) && within(T0, 100, 500), 'turns answer'); ok(within(v0, 0.4, 30) && within(v1, 0.4, 30), 'peak range'); }
  }
};
CHECK.F20 = (it, dir) => {
  const q = strip(it.q).replace(/\s+/g, ' ');
  if (it.challenge){
    const n = +q.match(/swaps (\d+) old/)[1], o = +q.match(/old (\d+) W/)[1], w = +q.match(/for (\d+) W LED/)[1]; ok(n >= 10 && n <= 200 && [40, 60, 100].includes(o) && [6, 9, 12].includes(w), 'bulb swap ranges');
    if (dir === 'A') ok(it.answer === n * (o - w), 'watts saved'); else { const hrs = +q.match(/on for (\d+) hours/)[1]; ok(hrs >= 4 && hrs <= 12 && near(it.answer, n * (o - w) / 1000 * hrs, 1e-9), `kWh saved ${it.answer}`); }
    return;
  }
  const RANGE = [['filament bulb', 5, 12], ['LED', 30, 50], ['electric fan', 60, 80], ['kettle', 85, 95]], dev = RANGE.find(x => q.includes(x[0]));
  ok(!!dev, 'known device'); let E, U, pct;
  if (dir === 'A'){ const m = q.match(/gets (\d+) J of electrical energy and gives out (\d+) J/); E = +m[1]; U = +m[2]; pct = U * 100 / E; ok(/wasted/.test(q) ? it.answer === E - U : it.answer === pct, 'A answer'); }
  else { const m = q.match(/turns (\d+)% of its energy.*It gets (\d+) J/); pct = +m[1]; E = +m[2]; U = E * pct / 100; ok(it.answer === U, 'B answer'); }
  ok(Number.isInteger(pct) && pct >= dev[1] && pct <= dev[2], `percentage ${pct} in ${dev[1]}-${dev[2]}`); ok(E >= 40 && E <= 1200 && Number.isInteger(U) && Number.isInteger(E - U), 'energy whole numbers in range');
};
CHECK.F21 = (it, dir) => {
  if (dir === 'A') it.items.forEach(x => { const m = x[0].match(/^(\w+) from (.+)$/), dev = m[2].replace(/^an? /, ''); ok(((DEV_USEFUL[dev] || []).includes(m[1].toLowerCase()) ? 0 : 1) === x[1], 'useful or wasted ' + x[0]); });
  else { const dev = it.q.match(/from an? (.+)\?$/)[1], main = DEV_USEFUL[dev][0]; ok(it.options[it.answer].toLowerCase().startsWith(main), 'main energy'); }
};
CHECK.F22 = (it, dir) => { if (dir === 'A'){ const x = +strip(it.q).match(/^([\d.]+) A flows into/)[1]; ok(x >= 0.12 && x <= 0.95, 'range'); ok(it.options[it.answer].startsWith(x.toFixed(2) + ' A'), 'same current out'); } };
CHECK.F23 = (it, dir) => {
  const q = strip(it.q).replace(/\s+/g, ' ');
  if (dir === 'A'){
    if (/series circuit/.test(q)){ const x = +q.match(/reads ([\d.]+) A/)[1]; ok(x >= 0.12 && x <= 0.95 && it.answer === x, 'series same everywhere'); return; }
    const n = +q.match(/has (\d+) branches/)[1], vals = [...q.replace(/^.*?branches\./, '').matchAll(/([\d.]+) A/g)].map(m => +m[1]); const list = /identical bulb/.test(q) ? Array(n).fill(vals[0]) : vals;
    ok(list.length === n && n >= 2 && n <= 4, 'branch count'); ok(list.every(v => v >= 0.12 && v <= 0.95 && near(v * 100, Math.round(v * 100), 1e-6)), 'branch range'); const tot = list.reduce((a, v) => a + Math.round(v * 100), 0) / 100; ok(near(it.answer, tot, 1e-9), `main ${it.answer} vs ${tot}`);
    ok(Object.values(it.edges).filter(e => e.type === 'bulb').length === n, 'diagram bulbs');
  } else {
    const nums = [...q.matchAll(/([\d.]+) A/g)].map(m => +m[1]), main = nums[0], known = nums.slice(1), n = known.length + 1;
    ok(n >= 2 && n <= 3, 'branches'); ok(near(it.answer, Math.round(main * 100) / 100 - known.reduce((a, v) => a + v, 0), 1e-9) && it.answer >= 0.12 && it.answer <= 0.95, `other branch ${it.answer}`);
    ok(Object.values(it.edges).filter(e => e.type === 'bulb').length === n, 'diagram bulbs');
  }
};
CHECK.F24 = (it, dir) => {
  if (dir === 'B'){ ok(it.options.length >= 3, 'options'); return; }
  const {kind, change, n} = it.p, right = it.options[it.answer], bulbs = Object.values(it.edges).filter(e => e.type === 'bulb'), sw = Object.values(it.edges).filter(e => e.type === 'switch');
  ok(bulbs.length === n && n >= 2 && n <= 3, 'bulb count'); ok(bulbs.some(b => b.broken) === (change === 'unscrew'), 'unscrewed bulb only for unscrew'); ok(sw.length === (/switch/i.test(change) ? 1 : 0), 'switch only for switch changes');
  const rule = {'series/unscrew': /out too/, 'series/add': /dimmer/, 'series/switch': /go out/, 'parallel/unscrew': /same brightness/, 'parallel/add': /just as bright/, 'parallel/branchswitch': /^Only that bulb/, 'parallel/mainswitch': /^All the bulbs go out/}[kind + '/' + change];
  ok(rule && rule.test(right), `${kind}/${change}: ${right}`);
  if (kind === 'parallel'){ const rowsWithBulb = new Set(Object.keys(it.edges).filter(k => it.edges[k].type === 'bulb').map(k => k.split(',')[1])); ok(rowsWithBulb.size === n, 'one bulb per branch'); }
  if (kind === 'series'){ ok(Object.keys(it.edges).filter(k => it.edges[k].type === 'bulb').every(k => k.startsWith('h,0,')), 'series bulbs share the top row'); }
  const lit = solveBulbs(it.edges); if (change === 'unscrew') ok(lit.length === n - 1, 'solver sees the unscrewed bulb');
};
CHECK.F25 = (it, dir) => {
  if (it.t === 'sort') it.items.forEach(x => ok((AC_SRC.includes(x[0]) ? 0 : DC_SRC.includes(x[0]) ? 1 : -1) === x[1], 'source ' + x[0]));
  else if (dir === 'A'){
    const q = strip(it.q); if (/ammeter reads/.test(q)){ const sg = [...q.matchAll(/([+−])[\d.]+ A/g)].map(m => m[1]), ac = new Set(sg).size > 1, v = +q.match(/[+−]([\d.]+) A/)[1]; ok(v >= 0.2 && v <= 0.9, 'reading range'); ok(it.options[it.answer].startsWith(ac ? 'AC' : 'DC'), 'AC or DC from readings'); }
    else ok(/^(AC|DC)/.test(it.options[it.answer]) && !!it.p && typeof it.p.ac === 'boolean' && it.options[it.answer].startsWith(it.p.ac ? 'AC' : 'DC'), 'trace answer');
  } else {
    const q = strip(it.q); if (/Which set of ammeter readings/.test(q)){ const ac = AC_SRC.some(s => q.includes(s.charAt(0).toLowerCase() + s.slice(1))); const sets = it.options.map(o => new Set([...o.matchAll(/([+−])[\d.]+ A/g)].map(m => m[1])).size > 1); ok(sets[it.answer] === ac, 'right set matches source'); it.options.forEach((o, i) => i !== it.answer && ok(sets[i] !== ac, 'wrong set is the other kind')); const v = +it.options[0].match(/[\d.]+/)[0]; ok(v >= 0.2 && v <= 0.9, 'reading range'); }
    else { const ac = AC_SRC.some(s => q.includes(s.charAt(0).toLowerCase() + s.slice(1))); ok(it.options[it.answer] === (ac ? 'A wave that goes above and below zero' : 'A flat line above zero'), 'trace description'); }
  }
};
CHECK.F26 = (it, dir) => {
  const q = strip(it.q).replace(/\s+/g, ' ');
  if (dir === 'A'){
    const f = +q.match(/(\d+) Hz/)[1], t = +(q.match(/\((\d+) seconds\)/) || q.match(/in (\d+) seconds/))[1]; ok(f === 50 || f === 60 || (f >= 2 && f <= 9), 'frequency range'); ok(t >= 10 && t <= 300, 'time range');
    ok(it.answer === (/change direction/.test(q) ? 2 * f * t : f * t), `cycles ${it.answer}`);
  } else { const c = num(q.match(/makes ([\d,]+) cycles/)[1]), t = +(q.match(/\((\d+) seconds\)/) || q.match(/in (\d+) seconds/))[1]; ok(t >= 10 && t <= 300, 'time range'); ok(it.answer === c / t && Number.isInteger(c / t) && (it.answer === 50 || it.answer === 60 || (it.answer >= 2 && it.answer <= 9)), `frequency ${it.answer}`); }
};
CHECK.F27 = (it, dir) => {
  if (it.challenge){ const q = strip(it.q), m = q.match(/([\d,]+) V.*? ([\d,]+) V/), a = num(m[1]), b = num(m[2]); ok(a >= 11000 && a <= 25000 && b >= 132000 && b <= 500000, 'voltage range'); const x = b / a; ok(!near((x * 2) % 2, 1, 1e-9), 'not an exact half'); ok(it.answer === Math.round(x) && it.answer >= 5, `ratio ${it.answer} vs ${x}`); }
  else if (it.t === 'order') ok(it.items.join('|') === ['Power station generator', 'Step-up transformer', 'Long-distance power lines', 'Step-down transformer', 'Your home'].join('|'), 'journey order');
  else ok(it.options.length >= 3, 'options');
};
CHECK.F28 = (it, dir) => {
  const q = strip(it.q);
  if (it.t === 'sort') it.items.forEach(x => ok(GROUP[x[0]] === it.groups[x[1]], 'group ' + x[0]));
  else if (dir === 'B'){ const hit = PLACE_SRC.find(x => q.includes(x[0])); ok(!!hit && it.options[it.answer] === POWERNAME[hit[1]], 'best source: ' + it.options[it.answer]); it.options.forEach(o => ok(!/Coal|Gas|Nuclear/.test(o), 'only renewable options')); }
  else if (/Which group/.test(q)){ const nm = q.match(/does (.+) power belong/)[1], key = Object.keys(GROUP).find(k => k.toLowerCase() === nm); ok(key && it.options[it.answer] === GROUP[key], 'group answer'); }
  else if (/Why is nuclear/.test(q)) ok(/uranium/.test(it.options[it.answer]), 'nuclear reason'); else ok(it.options[it.answer].startsWith('Benefit:'), 'benefit and drawback');
};
CHECK.F29 = (it, dir) => {
  const q = strip(it.q);
  if (it.t === 'order'){ ok(Object.values(CHAINS).some(c => c.join('|') === it.items.join('|')), 'a real chain'); }
  else if (/without a turbine/.test(q)) ok(it.options[it.answer] === 'Solar panels', 'solar');
  else if (dir === 'A'){ const spin = {coal: 'Steam from heated water', gas: 'Hot gases from burning gas', biomass: 'Steam from heated water', nuclear: 'Steam from heated water', geothermal: 'Steam from heated water', hydroelectric: 'Falling water from a dam', tidal: 'Moving seawater from the tides'}; const nm = (q.match(/in a (\w+) power station/) || [])[1]; if (/blades/.test(q)) ok(it.options[it.answer] === 'Moving air (the wind)', 'wind'); else ok(spin[nm] === it.options[it.answer], `spinner for ${nm}: ${it.options[it.answer]}`); }
  else { const shown = q.replace(/\. What is the missing step\?$/, '').split(' → '); const chain = Object.values(CHAINS).find(c => c.length === shown.length && c.every((s, i) => shown[i] === '___' || s === shown[i])); ok(!!chain, 'chain with one gap'); if (chain) ok(it.options[it.answer] === chain[shown.indexOf('___')] && shown.indexOf('___') > 0 && shown.indexOf('___') < shown.length - 1, 'missing step'); }
};
CHECK.F30 = (it, dir) => {
  const q = strip(it.q).replace(/\s+/g, ' ');
  const KEY = {'coal': 'coal', 'natural gas': 'gas', 'biomass': 'biomass', 'solar power': 'solar', 'geothermal power': 'geothermal', 'hydroelectric power': 'hydro', 'tidal power': 'tidal', 'nuclear power': 'nuclear', 'wind power': 'wind'};
  const keyOf = s => KEY[s.toLowerCase()];
  if (dir === 'A'){ const m = q.match(/^(.+?) releases about (\d+) g of CO₂ for every kWh\. (.+?) releases about (\d+) g\./), a = keyOf(m[1]), b = keyOf(m[3]); ok(CO2[a] === +m[2] && CO2[b] === +m[4], 'rates match chart'); ok(+m[2] >= 2 * +m[4], 'at least 2 times apart'); ok(!near((2 * +m[2] / +m[4]) % 2, 1, 1e-9), 'not an exact half'); ok(it.answer === Math.round(+m[2] / +m[4]), `times more ${it.answer}`); }
  else {
    const kwh = num(q.match(/(\d+) kWh/)[1]); ok(kwh >= 5 && kwh <= 500, 'kWh range');
    if (/swaps/.test(q)){ const m = q.match(/from (.+?) \((\d+) g per kWh\) to (.+?) \((\d+) g per kWh\)/); ok(CO2[keyOf(m[1])] === +m[2] && CO2[keyOf(m[3])] === +m[4], 'rates match chart'); ok(+m[2] >= 2 * +m[4], 'swap pair 2 times apart'); ok(it.answer === (+m[2] - +m[4]) * kwh, 'CO2 saved'); }
    else { const m = q.match(/from (.+?), at (\d+) g per kWh/); ok(CO2[keyOf(m[1])] === +m[2], 'rate matches chart'); ok(it.answer === +m[2] * kwh, 'CO2 total'); }
  }
};
CHECK.F31 = (it, dir) => {
  const q = strip(it.q).replace(/\s+/g, ' '), hr = q.match(/At (\d) pm/)[1], D = +q.match(/needs (\d+) MW/)[1], idx = 12 + +hr; ok(D === DEMAND[idx] && [19, 20, 21].includes(idx), 'demand matches the curve');
  const geo = /geothermal gives 25 MW/.test(q) ? 25 : 0, hydro = 30; ok(/solar gives 0 MW/.test(q), 'solar is zero');
  if (dir === 'A'){ const w = +q.match(/wind gives (\d+) MW/)[1], b = D - hydro - geo - w; ok(it.answer === b && b >= 5 && b <= 60 && w >= 0 && w <= 35, `batteries ${it.answer} vs ${b}`); }
  else { const b = +q.match(/Batteries give (\d+) MW/)[1], w = D - hydro - geo - b; ok(it.answer === w && w >= 0 && w <= 35 && b >= 5 && b <= 60, `wind ${it.answer} vs ${w}`); }
};
CHECK.F32 = (it, dir) => {
  const q = strip(it.q), calmCloudy = /cloudy and calm/.test(q), sunny = /sunny and calm/.test(q), windy = /cloudy and windy/.test(q), night = /night/.test(q);
  const sun = sunny && !night, wind = windy;
  if (dir === 'A' && it.t === 'table') it.rows.forEach(r => { const k = r.label; const works = /Solar/.test(k) ? sun : /Wind/.test(k) ? wind : true; ok(r.ans[0] === (works ? 'Yes' : 'No'), `row ${k}`); });
  else if (dir === 'A'){ const r = it.options[it.answer]; const works = /^Solar/.test(r) ? sun : /^Wind/.test(r) ? wind : /^(Hydro|Geothermal|Tidal)/.test(r); ok(works, 'right option works: ' + r); it.options.forEach((o, i) => { if (i !== it.answer) ok(/^Batteries|^Solar|^Wind/.test(o) && !(/^Solar/.test(o) ? sun : /^Wind/.test(o) ? wind : false), 'wrong option is invalid: ' + o); }); }
  else { const body = q.match(/uses only (.+?) and has no batteries/)[1].toLowerCase(), hasSolar = /solar/.test(body), hasWind = /wind/.test(body), hasAny = /hydro|geothermal|tidal/.test(body); const black = !(hasAny || (hasSolar && sun) || (hasWind && wind)); ok(it.options[it.answer].startsWith(black ? 'A blackout' : 'No blackout'), `blackout expected ${black}: ${it.options[it.answer]}`); }
};
CHECK.X1 = (it, dir) => { ok(it.t === 'mcq' && it.options.length >= 3, 'x1 mcq'); };

/* ---------- run everything ---------- */
const VARIETY_MIN = 3;
FAMS.forEach(f => {
  ['A', 'B'].forEach(dir => {
    [false, true].forEach(challenge => {
      const opts = challenge ? {challenge: true} : {}, sigs = new Set(), tag = `${f.n} ${f.id} ${dir}${challenge ? ' challenge' : ''}`;
      let sawChallenge = 0;
      for (let s = 0; s < SEEDS; s++){
        ctxLabel = `${tag} seed ${s}`;
        let it, again;
        try { it = gen(f.id, dir, `${f.n}-${dir}-${s}`, opts); again = gen(f.id, dir, `${f.n}-${dir}-${s}`, opts); } catch (e){ ok(false, 'threw ' + e.message); continue; }
        ok(JSON.stringify(it) === JSON.stringify(again), 'same seed gave a different item');
        shape(it, f, dir, opts);
        try { CHECK[f.n](it, dir); } catch (e){ ok(false, 'check threw ' + e.message + ' on: ' + strip(it.q).slice(0, 140)); }
        if (it.challenge) sawChallenge++;
        sigs.add(it.q + '|' + (it.options ? it.options.slice().sort().join('|') : JSON.stringify(it.rows || it.items || it.answer)));
      }
      ctxLabel = tag;
      ok(sigs.size >= VARIETY_MIN, `only ${sigs.size} different items in ${SEEDS} seeds`);
      const hasChallenge = ['F13', 'F20', 'F27'].includes(f.n);
      if (challenge && hasChallenge) ok(sawChallenge > 0, 'no challenge items with opts.challenge');
      if (!challenge) ok(sawChallenge === 0, 'challenge items without opts.challenge');
      if (process.env.VERBOSE) console.log(`${tag}: ${sigs.size} distinct`);
    });
  });
});
/* the string-seed and function-rng entry points agree, and unknown ids throw */
ctxLabel = 'rtGen entry'; ok(JSON.stringify(ev('rtGen("F10","A",rtRng("z"))')) === JSON.stringify(ev('rtGen("cell-count","A",rtRng("z"))')), 'id and number agree');
let threw = false; try { ev('rtGen("nope","A",rtRng("z"))'); } catch (e){ threw = true; } ok(threw, 'unknown family should throw');
ok(ev('rtRng("a")()') === ev('rtRng("a")()') && ev('rtRng("a")()') !== ev('rtRng("b")()'), 'rtRng deterministic');

console.log(`\n${checks} checks, ${fails} failures`);
process.exit(fails ? 1 : 0);
