/* 20-paragraph.js: Data paragraph (C) and Reading paragraph (D) tasks for Sparks retrieval.
   Needs 01-data.js (RT_C, RT_D, RT_CO2, RT_DEMAND) and the helpers in 10-families.js (rtInt, rtPick, rtShuf, rtC, rtT, rtPlural).
   Students see "Data paragraph" and "Reading paragraph" only. */

function rtPgCss(){
  if (document.getElementById('rtPgCss')) return;
  const s = document.createElement('style'); s.id = 'rtPgCss';
  s.textContent = `
.rt-pg textarea{width:100%; min-height:9em; box-sizing:border-box; font:inherit; padding:10px; border:2px solid var(--line); border-radius:10px; background:var(--panel); color:var(--ink); resize:vertical}
.rt-pg details{margin:8px 0; border:1px solid var(--line); border-radius:10px; padding:6px 12px; background:var(--panel-2)}
.rt-pg summary{cursor:pointer; font-weight:700; padding:4px 0}
.rt-pg details ul{margin:6px 0 6px 1.2em; padding:0}
.rt-pg{min-width:0; max-width:100%; overflow-wrap:anywhere}
.rt-pg-data{margin:8px 0; min-width:0; max-width:100%; overflow-x:auto}
.rt-pg-data .tbl-wrap{overflow-x:auto; max-width:100%; min-width:0}
.rt-pg-data table.data{border-collapse:collapse; margin:4px 0}
.rt-pg-data table.data th, .rt-pg-data table.data td{border:1px solid var(--line); padding:5px 9px; text-align:center}
.rt-pg-data table.data th:first-child, .rt-pg-data table.data td:first-child{text-align:left}
.rt-pg-note{font-size:.88rem; color:var(--muted); margin:2px 0 6px}
.rt-passage{border-left:5px solid var(--line); background:var(--panel-2); padding:8px 14px; border-radius:6px; margin:8px 0}
.rt-passage h4{margin:0 0 4px}
.rt-model{margin-top:12px; border:2px solid var(--line); border-radius:10px; padding:8px 14px}
.rt-model h4{margin:4px 0}
.rt-ticks{display:grid; gap:6px; margin:6px 0}
.rt-ticks label{display:flex; gap:10px; align-items:flex-start; padding:6px 8px; border:1px solid var(--line); border-radius:8px; cursor:pointer}
.rt-ticks input{width:22px; height:22px; flex:none; margin-top:1px}
.rt-g{width:100%; height:auto; max-width:560px; display:block; margin:6px 0}
.rt-g text{fill:var(--ink); font-family:inherit}
.rt-g .rt-grid{stroke:var(--line); stroke-width:1}
.rt-g .rt-axis{stroke:var(--ink); stroke-width:1.5}
.rt-g .rt-s0{stroke:#2a7de1; fill:#2a7de1}
.rt-g .rt-s1{stroke:#e8731c; fill:#e8731c}
.rt-g path{fill:none; stroke-width:3}
.rt-g rect.rt-s0, .rt-g rect.rt-s1{stroke:none}
`;
  document.head.appendChild(s);
}

/* ---------- graph ---------- */
function rtNice(max){
  if (!(max > 0)) return {max: 1, step: 0.2};
  const raw = max / 5, p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = [1, 2, 2.5, 5, 10].find(k => k * p >= raw - 1e-12), step = m * p;
  return {step, max: Math.ceil(max / step - 1e-9) * step};
}
/* spec: {type:'line'|'bar', xLabel, yLabel, x:[labels], xv?:[numbers], series:[{name, values}], title?} */
function rtGraph(el, spec){
  rtPgCss();
  const W = 480, H = 320, bar = spec.type === 'bar', two = spec.series.length > 1;
  const nx = spec.x.length, rot = bar && spec.x.some(l => String(l).length * 7.5 > (W - 80) / nx);
  const L = 62, R = 16, T = two ? 42 : 20, B = rot ? 92 : 58, pw = W - L - R, ph = H - T - B;
  const all = [].concat(...spec.series.map(s => s.values));
  const ny = rtNice(Math.max(...all)), numeric = !bar && spec.xv && spec.xv.length === nx;
  const x0 = numeric ? Math.min(...spec.xv) : 0, x1 = numeric ? Math.max(...spec.xv) : nx - 1;
  const inset = bar ? 0 : 14;
  const X = i => bar ? L + (i + 0.5) * pw / nx : L + inset + ((numeric ? spec.xv[i] - x0 : i) / ((x1 - x0) || 1)) * (pw - 2 * inset);
  const Y = v => T + ph - (v / ny.max) * ph;
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, class: 'rt-g', role: 'img', 'aria-label': spec.title || `${spec.yLabel} against ${spec.xLabel}`});
  const add = (tag, attrs, text) => { const e = sv(tag, attrs); if (text != null) e.textContent = text; svg.appendChild(e); return e; };
  add('title', {}, spec.title || `${spec.yLabel} against ${spec.xLabel}`);
  const fmt = v => rtC(v);
  for (let v = 0; v <= ny.max + 1e-9; v += ny.step){
    add('line', {x1: L, x2: W - R, y1: Y(v), y2: Y(v), class: 'rt-grid'});
    add('text', {x: L - 7, y: Y(v) + 5, 'text-anchor': 'end', 'font-size': 14}, fmt(+v.toFixed(6)));
  }
  add('line', {x1: L, x2: L, y1: T, y2: T + ph, class: 'rt-axis'});
  add('line', {x1: L, x2: W - R, y1: T + ph, y2: T + ph, class: 'rt-axis'});
  spec.x.forEach((lab, i) => {
    const x = X(i), y = T + ph + 18;
    add('line', {x1: x, x2: x, y1: T + ph, y2: T + ph + 5, class: 'rt-axis'});
    if (rot) add('text', {x: x + 4, y: y - 2, 'text-anchor': 'end', 'font-size': 13, transform: `rotate(-35 ${x + 4} ${y - 2})`}, lab);
    else add('text', {x, y, 'text-anchor': 'middle', 'font-size': 13}, lab);
  });
  add('text', {x: L + pw / 2, y: H - 8, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700}, spec.xLabel);
  add('text', {x: 15, y: T + ph / 2, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, transform: `rotate(-90 15 ${T + ph / 2})`}, spec.yLabel);
  if (bar){
    const bw = Math.min(54, pw / nx * 0.62);
    spec.series[0].values.forEach((v, i) => {
      add('rect', {x: X(i) - bw / 2, y: Y(v), width: bw, height: Math.max(0, T + ph - Y(v)), class: 'rt-s0'});
      add('text', {x: X(i), y: Y(v) - 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700}, rtC(v));
    });
  } else {
    spec.series.forEach((s, k) => {
      add('path', {d: s.values.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' '), class: 'rt-s' + k, 'stroke-dasharray': k ? '9 5' : null});
      s.values.forEach((v, i) => k ? add('rect', {x: X(i) - 4.5, y: Y(v) - 4.5, width: 9, height: 9, class: 'rt-s1'}) : add('circle', {cx: X(i), cy: Y(v), r: 5, class: 'rt-s0'}));
    });
    if (two) spec.series.forEach((s, k) => {
      const lx = L + 8 + k * 150;
      add('path', {d: `M${lx} 16 L${lx + 28} 16`, class: 'rt-s' + k, 'stroke-dasharray': k ? '9 5' : null});
      add('text', {x: lx + 34, y: 21, 'font-size': 14}, s.name);
    });
  }
  el.appendChild(svg);
  return svg;
}

/* ---------- Objective C generators ---------- */
const rtPm = (evS, whyS, o) => { o = o || {}; return {
  mS: 'The data support this hypothesis. ' + evS + '. ' + whyS,
  mX: 'The data contradict this hypothesis. ' + (o.pre || '') + (o.evX || evS) + (o.mid || '.') + ' ' + (o.whyX || whyS)}; };
const rtPgTry = (fn, ok) => { let v; for (let i = 0; i < 80; i++){ v = fn(); if (ok(v)) return v; } return v; };
const rtInc = a => a.every((v, i) => !i || v > a[i - 1]);
const rtDec = a => a.every((v, i) => !i || v < a[i - 1]);
const rtRound = (x, d) => { const k = Math.pow(10, d); return Math.round(x * k + 1e-9) / k; };

const RT_PG = {
  C1(r){
    const F = rtPick(r, [20000, 40000, 60000]), base = F / 20000;
    let B = r() < 0.3 ? base + (r() < 0.5 ? -1 : 1) : base; B = Math.max(1, Math.min(3, B));
    const bent = Math.round(F * (0.01 + r() * 0.01)), S = F - bent - B, f = rtC(F), s = rtC(S), b = rtC(B);
    return Object.assign({head: ['Fired at gold foil', 'Went straight through', 'Bent to one side', 'Bounced back'], rows: [[f, s, rtC(bent), b]],
      m1: `The results show that most of an atom is empty space. Out of ${f} particles, ${s} went straight through the gold, and only ${b} bounced back. The particles that went straight through met nothing solid. The few that bounced back hit the tiny, positive nucleus, because like charges repel.`},
      rtPm(`Out of ${f} particles, ${s} went straight through the gold, and only ${b} bounced back`,
        'The particles that went straight through met nothing solid, so most of an atom must be empty space. The few that bounced back hit the tiny, positive nucleus.',
        {pre: 'If atoms were solid, particles would not get through. But ', evX: `${s} of the ${f} particles went straight through, and only ${b} bounced back`,
         whyX: 'This shows that most of an atom is empty space, with a tiny positive nucleus in the middle.'}));
  },
  C2(r){
    const bulbs = rtInt(r, 1, 2), n = rtInt(r, 3, 5);
    const v = rtPgTry(() => Array.from({length: n}, (_, i) => rtRound((i + 1) * 1.5 / (bulbs * 4 + (i + 1) * 0.2) + rtPick(r, [-0.01, 0, 0.01]), 2)), rtInc);
    const a = v[0].toFixed(2), z = v[n - 1].toFixed(2);
    return Object.assign({head: ['Cells'].concat(v.map((_, i) => String(i + 1))), rows: [['Current (A)'].concat(v.map(x => x.toFixed(2)))], note: `Each circuit had ${rtPlural(bulbs, 'bulb')}.`,
      m1: `The data show that the current gets bigger as more cells are added. With 1 cell the current was ${a} A, and with ${n} cells it was ${z} A. More cells give a bigger voltage. A bigger voltage is a bigger push on the charge, so more current flows.`},
      rtPm(`The current went from ${a} A with 1 cell to ${z} A with ${n} cells`, 'Each extra cell adds to the voltage. That bigger push makes a bigger current flow around the loop.', {mid: ', so it did not stay the same.'}));
  },
  C3(r){
    const cells = rtInt(r, 1, 2), n = rtInt(r, 5, 6);
    const v = rtPgTry(() => Array.from({length: n}, (_, i) => Math.max(0, (i + 1) * cells * 2 + rtPick(r, [-1, 0, 1]))), rtInc);
    const L = n * 10, a = v[0], z = v[n - 1];
    return Object.assign({head: ['Coils'].concat(v.map((_, i) => String((i + 1) * 10))), rows: [['Clips picked up'].concat(v.map(String))], note: `Iron core, ${rtPlural(cells, 'cell')}.`,
      m1: `The results show that more coils make a stronger electromagnet. With 10 coils it picked up ${a} ${a===1?'clip':'clips'}, and with ${L} coils it picked up ${z} clips. Each coil of wire adds to the magnetic field, so the iron core becomes a stronger magnet.`},
      rtPm(`The electromagnet picked up ${a} ${a===1?'clip':'clips'} with 10 coils and ${z} clips with ${L} coils`, 'Each coil adds to the magnetic field, which makes the electromagnet stronger.',
        {evX: `The electromagnet picked up ${a} ${a===1?'clip':'clips'} with 10 coils but ${z} clips with ${L} coils`, mid: '. The number of coils clearly made a difference.'}));
  },
  C4(r){
    const coils = rtPick(r, [30, 40, 50, 60]), cells = rtInt(r, 2, 3), F = [1, 0.7, 0.1, 0.1, 0.1], base = coils / 10 * cells * 2;
    const v = rtPgTry(() => F.map((f, i) => Math.max(0, Math.round(base * f) + (i ? rtPick(r, [-1, 0, 1]) : 0))), a => a[0] > a[1] && a[1] > Math.max(a[2], a[3], a[4]) + 1);
    const nm = r() < 0.5 ? 'aluminium' : 'wood', vi = nm === 'wood' ? 3 : 2, Nm = nm.charAt(0).toUpperCase() + nm.slice(1);
    const why = 'Iron is a magnetic material, so it makes the magnetic field much stronger.';
    return Object.assign({head: ['Core', 'Iron', 'Steel', 'Aluminium', 'Wood', 'No core'], rows: [[`Clips picked up (${coils} coils, ${cells} cells)`].concat(v.map(String))],
      m1: `The results show that iron makes the strongest core. The iron core picked up ${v[0]} clips, but the ${nm} core picked up only ${v[vi]} clips. Iron and steel are magnetic materials, so they make the magnetic field much stronger. Aluminium and wood are not magnetic, so they hardly help.`},
      rtPm(`The iron core picked up ${v[0]} clips, but the ${nm} core picked up only ${v[vi]} clips`, why, {whyX: why + ` ${Nm} is not magnetic, so it works about as badly as having no core at all.`}));
  },
  C5(r){
    const V = rtPick(r, [3, 4.5, 6]), R = [2, 5, 10, 20, 50], I = R.map(x => rtRound(V / x, 2).toFixed(2));
    return Object.assign({head: ['Resistance (Ω)'].concat(R.map(String)), rows: [['Current (A)'].concat(I)], note: `The supply was ${V} V.`,
      m1: `The results show that a bigger resistance gives a smaller current. With 5 Ω the current was ${I[1]} A, but with 10 Ω it was ${I[2]} A. Doubling the resistance halved the current. Resistance fights the flow of charge, so the same voltage pushes less current through.`},
      rtPm(`When the resistance went up from 5 Ω to 10 Ω, the current fell from ${I[1]} A to ${I[2]} A, which is half`, 'Resistance fights the flow of charge. With the same voltage, V = I × R tells us that a bigger R gives a smaller I.',
        {evX: `When the resistance went up from 5 Ω to 20 Ω, the current fell from ${I[1]} A to ${I[3]} A`}));
  },
  C6(r){
    const turns = r() < 0.5, k = rtInt(r, 4, 12) / 10;
    const v = rtPgTry(() => [1, 2, 3, 4, 5].map(i => rtRound(i * k + rtPick(r, [-0.1, 0, 0.1]), 1)), rtInc);
    const a = v[0].toFixed(1), z = v[4].toFixed(1), xs = turns ? [2, 4, 6, 8, 10] : [100, 200, 300, 400, 500];
    const lo = turns ? '2 turns each second' : '100 turns of wire', hi = turns ? '10 turns each second' : '500 turns of wire';
    const o = {head: [turns ? 'Turns each second' : 'Turns of wire'].concat(xs.map(String)), rows: [['Peak voltage (V)'].concat(v.map(x => x.toFixed(1)))]};
    if (turns) return Object.assign(o, {
      m1: `The results show that faster spinning gives a bigger peak voltage. At ${lo} the peak was ${a} V, and at ${hi} it was ${z} V. When the magnet moves past the coil faster, it makes a bigger voltage in the wire.`},
      rtPm(`The peak voltage rose from ${a} V at ${lo} to ${z} V at ${hi}`, 'A moving magnet makes the voltage in the coil, so moving it past the coil faster makes the voltage bigger.'));
    return Object.assign(o, {
      p1: 'What do these results show about the turns of wire in a generator’s coil? Use numbers and your science.',
      hS: 'More turns of wire give a bigger peak voltage.', hX: 'The peak voltage stays the same however many turns of wire the coil has.',
      m1: `The results show that more turns of wire give a bigger peak voltage. With ${lo} the peak was ${a} V, and with ${hi} it was ${z} V. A moving magnet makes a voltage in every turn of wire, so more turns add up to a bigger voltage.`},
      rtPm(`The peak voltage rose from ${a} V with ${lo} to ${z} V with ${hi}`, 'A moving magnet makes a voltage in every turn of wire, so more turns add up to a bigger voltage.'));
  },
  C7(r){
    const cells = rtInt(r, 1, 2), n = rtInt(r, 3, 4), v = Array.from({length: n}, (_, i) => rtRound(cells * 1.5 / ((i + 1) * 4 + cells * 0.2), 2).toFixed(2));
    return Object.assign({head: ['Bulbs in series'].concat(v.map((_, i) => String(i + 1))), rows: [['Current (A)'].concat(v)], note: `The circuit had ${rtPlural(cells, 'cell')}.`,
      m1: `The results show that adding bulbs in series makes the current smaller. With 1 bulb the current was ${v[0]} A, but with ${n} bulbs it was ${v[n - 1]} A. Each bulb adds resistance to the single loop, and the cell gives the same push, so less current flows and every bulb gets dimmer.`},
      rtPm(`The current fell from ${v[0]} A with 1 bulb to ${v[n - 1]} A with ${n} bulbs`, 'Each extra bulb adds resistance to the loop. The voltage stays the same, so the current gets smaller.'));
  },
  C8(r){
    const km = rtPgTry(() => rtShuf(r, [2, 5, 10, 15, 20, 25, 30]).slice(0, 4).sort((a, b) => a - b), a => a[3] >= 20 && a[2] >= 10);
    const dc = km.map(k => Math.round(100 * Math.exp(-k / 6))), ac = km.map(k => Math.round(100 * Math.exp(-k / 600)));
    return Object.assign({head: ['Distance (km)'].concat(km.map(String)), rows: [['DC: energy that arrives (%)'].concat(dc.map(String)), ['AC: energy that arrives (%)'].concat(ac.map(String))],
      m1: `The results show that AC delivers far more energy over long distances. At ${km[2]} km, ${ac[2]}% of the energy arrived with AC, but only ${dc[2]}% arrived with DC. Transformers raise the voltage of AC, which makes the current smaller. A smaller current wastes less energy as heat in the wires.`},
      rtPm(`At ${km[3]} km, ${ac[3]}% of the energy arrived with AC, but only ${dc[3]}% arrived with DC`, 'Edison’s low-voltage DC wasted most of its energy as heat. Transformers let AC travel at a high voltage with a smaller current, so much less is wasted.'));
  },
  C9(r){
    const FOS = ['coal', 'gas'], LOW = ['solar', 'geothermal', 'hydro', 'tidal', 'wind'], OTH = ['biomass', 'nuclear'];
    const n = rtInt(r, 5, 6), f = rtPick(r, FOS), l = rtShuf(r, LOW);
    const set = rtShuf(r, [f, l[0]].concat(rtShuf(r, FOS.filter(x => x !== f).concat(OTH, l.slice(1)))).slice(0, n));
    const nameOf = id => id === 'gas' ? 'Gas' : id.charAt(0).toUpperCase() + id.slice(1);
    const fos = set.filter(x => FOS.includes(x)).sort((a, b) => RT_CO2[b] - RT_CO2[a])[0], low = set.filter(x => LOW.includes(x)).sort((a, b) => RT_CO2[a] - RT_CO2[b])[0];
    const fv = RT_CO2[fos], lv = RT_CO2[low], ratio = Math.round(fv / lv), F = nameOf(fos), Lw = low;
    return Object.assign({head: ['Source'].concat(set.map(nameOf)), rows: [['CO₂ (g per kWh)'].concat(set.map(x => String(RT_CO2[x])))], extra: [ratio],
      m1: `The chart shows that fossil fuels release the most CO₂. ${F} releases about ${fv} g per kWh, but ${Lw} releases only about ${lv} g. Burning fossil fuels releases CO₂. ${nameOf(low)} burns nothing, so its small amount of CO₂ comes from building it.`},
      rtPm(`${F} releases about ${fv} g of CO₂ per kWh, but ${Lw} releases only about ${lv} g`, `Burning fossil fuels releases CO₂, but ${Lw} burns nothing, so it releases far less.`,
        {mid: `. ${F} releases about ${ratio} times more.`}));
  },
  C10(r){
    const P = rtPick(r, [80, 100, 120]), hrs = [6, 9, 12, 15, 18, 21], names = ['6 am', '9 am', '12 noon', '3 pm', '6 pm', '9 pm'];
    const dem = hrs.map(h2 => RT_DEMAND[h2]), sol = hrs.map(h2 => h2 >= 6 && h2 <= 18 ? Math.round(P * Math.sin(Math.PI * (h2 - 6) / 12)) : 0);
    const body = `At 6 pm the town needs ${dem[4]} MW, but the solar panels give ${sol[4]} MW`;
    const why = 'Solar panels need sunlight, so they make nothing after sunset. The town needs other sources or a battery store for the evening peak.';
    return Object.assign({head: ['Time'].concat(names), rows: [['Demand (MW)'].concat(dem.map(String)), ['Solar output (MW)'].concat(sol.map(String))],
      m1: `The results show that solar panels can meet demand in the middle of the day but not in the evening. At 12 noon solar gives ${sol[2]} MW and the town needs ${dem[2]} MW. At 6 pm solar gives ${sol[4]} MW but the town needs ${dem[4]} MW. The Sun has set, so the town needs other sources or a battery store.`},
      rtPm(body, why));
  }
};

/* graph set-up per template: type, axis labels, series names */
const RT_PG_GRAPH = {
  C2: {type: 'line', x: 'Number of cells', y: 'Current (A)'}, C3: {type: 'line', x: 'Number of coils', y: 'Clips picked up'},
  C4: {type: 'bar', x: 'Core', y: 'Clips picked up'}, C5: {type: 'line', x: 'Resistance (Ω)', y: 'Current (A)'},
  C6: {type: 'line', x: null, y: 'Peak voltage (V)'}, C7: {type: 'line', x: 'Number of bulbs', y: 'Current (A)'},
  C8: {type: 'line', x: 'Distance (km)', y: 'Energy that arrives (%)'}, C9: {type: 'bar', x: 'Power source', y: 'CO₂ (g per kWh)'},
  C10: {type: 'line', x: 'Time of day', y: 'Power (MW)'}
};
function rtPgGraphSpec(c, data){
  const g = RT_PG_GRAPH[c.n]; if (!g || !/graph|chart/i.test(c.show)) return null;
  const num = s => parseFloat(String(s).replace(/,/g, '')), xs = data.head.slice(1), xv = xs.map(num);
  const multi = data.rows.length > 1;
  return {type: g.type, xLabel: g.x || data.head[0], yLabel: g.y, x: xs, xv: xv.every(Number.isFinite) && rtInc(xv) ? xv : null,
    series: data.rows.map(row => ({name: multi ? row[0].replace(/:.*$/, '').replace(/\s*\(.*\)$/, '') : row[0], values: row.slice(1).map(num)})),
    title: c.p1 && g.y + ' against ' + (g.x || data.head[0]).toLowerCase()};
}

/* ---------- tasks ---------- */
const RT_PG_TICKS = {
  C1: ['I said what the pattern is.', 'I used two numbers with units.'],
  C2: ['I said if the data support or contradict it.', 'I used two numbers with units.'],
  E: ['I named the problem.', 'I named the science idea.', 'I explained how it solves the problem.', 'I used a detail from the passage.'],
  B: ['I gave a benefit.', 'I gave a drawback.', 'I used a fact from the passage.', 'I gave my opinion with a reason.']
};
const rtHas = (list, stopId) => list.filter(t => t.stops.includes(stopId));

function rtParagraphTask(kind, stops, rng, opts){
  opts = opts || {};
  const r = typeof rng === 'function' ? rng : rtRng(rng == null ? Math.random() : rng);
  const ids = stops && stops.length ? stops.map(s => s && s.id ? s.id : s) : null;
  const fit = list => list.filter(t => !ids || t.stops.some(s => ids.includes(s)));
  const pin = opts.pin;
  if (pin){
    const lab = String(pin.promptLabel || ''), n = String(pin.n);
    if (/^C/i.test(n)){
      const c = RT_C.find(x => x.n === n.toUpperCase()); if (!c) return null;
      const two = /2|support|contradict/i.test(lab);
      const data = c.sample, topic = ids && c.stops.find(s => ids.includes(s)) || c.stops[0];
      return {kind: 'C', n: c.n, title: 'Data paragraph', data, showTable: /table/i.test(c.show), graph: rtPgGraphSpec(c, data), which: two ? 'p2' : 'p1',
        prompt: two ? c.p2 : c.p1, model: two ? c.m2 : c.m1, ticks: rtPgTicks('C', two, c.sci), words: c.words.slice(), topic, extra: [], hyp: two ? 'X' : null, sample: c.sample, p1: c.p1, p2: c.p2, m1: c.m1, m2: c.m2};
    }
    const d = RT_D.find(x => x.n === n.toUpperCase()); if (!d) return null;
    const b = /^B|benefit/i.test(lab), topic = ids && d.stops.find(s => ids.includes(s)) || d.stops[0];
    return {kind: 'D', n: d.n, title: 'Reading paragraph', passage: {title: d.title, text: d.text}, which: b ? 'B' : 'E', prompt: b ? d.pB : d.pE, model: b ? d.mB : d.mE,
      ticks: RT_PG_TICKS[b ? 'B' : 'E'].slice(), words: d.words.slice(), topic};
  }
  const cs = fit(RT_C), ds = fit(RT_D);
  let k = kind === 'C' || kind === 'D' ? kind : null;
  if (k === 'C' && !cs.length || k === 'D' && !ds.length) k = null;
  if (!k){ if (!cs.length && !ds.length) return null; k = !ds.length ? 'C' : !cs.length ? 'D' : (r() < 0.5 ? 'C' : 'D'); }
  if (k === 'D'){
    const d = opts.n ? ds.find(x => x.n === opts.n) || rtPick(r, ds) : rtPick(r, ds), b = opts.prompt ? opts.prompt === 'B' : r() < 0.5;
    const topic = d.stops.filter(s => !ids || ids.includes(s))[0] || d.stops[0];
    return {kind: 'D', n: d.n, title: 'Reading paragraph', passage: {title: d.title, text: d.text}, which: b ? 'B' : 'E', prompt: b ? d.pB : d.pE, model: b ? d.mB : d.mE,
      ticks: RT_PG_TICKS[b ? 'B' : 'E'].slice(), words: d.words.slice(), topic};
  }
  const c = opts.n ? cs.find(x => x.n === opts.n) || rtPick(r, cs) : rtPick(r, cs), g = RT_PG[c.n](r);
  const supp = r() < 0.5, two = opts.prompt ? opts.prompt === 'p2' : r() < 0.5;
  const hS = g.hS || c.hS, hX = g.hX || c.hX, p1 = g.p1 || c.p1;
  const data = {head: g.head, rows: g.rows, note: g.note || null};
  const prompt = !two ? p1 : supp ? `A student says: “${hS}” Do the data support or contradict this? Explain.` : (g.hX ? `A student says: “${hX}” Do the data support or contradict this? Explain.` : c.p2);
  const topic = c.stops.filter(s => !ids || ids.includes(s))[0] || c.stops[0];
  return {kind: 'C', n: c.n, title: 'Data paragraph', data, showTable: /table/i.test(c.show), graph: rtPgGraphSpec(c, data), which: two ? 'p2' : 'p1', prompt,
    model: !two ? g.m1 : supp ? g.mS : g.mX, ticks: rtPgTicks('C', two, c.sci), words: c.words.slice(), topic, extra: g.extra || [], hyp: two ? (supp ? 'S' : 'X') : null};
}
function rtPgTicks(kind, two, sci){
  const a = RT_PG_TICKS[two ? 'C2' : 'C1'];
  return [a[0], a[1], sci, 'I used the words given.'];
}

/* ---------- the card ---------- */
const RT_PG_HELP = {
  C: {
    remind: [['Claim:', 'say what the data show.'], ['Evidence:', 'use two numbers from the data, with units.'], ['Reasoning:', 'use your science to explain why.']],
    starters: ['The data show that…', 'For example, when … was …, … was …', 'This happens because…', 'This supports the hypothesis because…', 'This contradicts the hypothesis because…'],
    exQ: 'A toy car rolled 40 cm from a 10 cm ramp, 82 cm from a 20 cm ramp and 118 cm from a 30 cm ramp.',
    exA: 'The data show that a higher ramp makes the car roll further. From 10 cm it rolled 40 cm, but from 30 cm it rolled 118 cm. This happens because a higher ramp gives the car more energy.'
  },
  D: {
    remind: [['Claim:', 'answer the question in one sentence.'], ['Evidence:', 'use a fact or number from the passage.'], ['Reasoning:', 'explain how the science works, or why you think so.']],
    starters: ['The problem is that…', 'This is solved by…', 'This works because…', 'One benefit is…', 'One drawback is…', 'I think… because…'],
    exQ: 'Bright strips on a jacket bounce car lights back to the driver. They cost very little, but they only work when light shines on them.',
    exA: 'One benefit is that drivers can see a cyclist at night. One drawback is that the strips only work when light shines on them. I think they are worth wearing, because they cost very little and could save a life.'
  }
};
function rtParagraphCard(el, task, n, saved, onSave){
  rtPgCss();
  const help = RT_PG_HELP[task.kind], card = h('div', {class: 'rv-card rt-pg'});
  const pill = h('span', {class: 'rv-pill todo'}, 'To do');
  card.append(h('div', {class: 'rv-head'}, h('span', {class: 'rv-num'}, n), h('span', {class: 'rv-type'}, task.title), pill));
  card.append(h('p', {class: 'quiz-q'}, task.prompt));
  if (task.passage) card.append(h('div', {class: 'rt-passage'}, h('h4', {}, task.passage.title), h('p', {}, task.passage.text)));
  if (task.data){
    const box = h('div', {class: 'rt-pg-data'});
    if (task.showTable){
      const d = task.data;
      box.append(h('div', {class: 'tbl-wrap'}, h('table', {class: 'data'}, h('thead', {}, h('tr', {}, d.head.map(x => h('th', {scope: 'col'}, x)))),
        h('tbody', {}, d.rows.map(row => h('tr', {}, row.map((x, i) => i ? h('td', {}, x) : h('th', {scope: 'row'}, x))))))));
    }
    if (task.data.note) box.append(h('p', {class: 'rt-pg-note'}, task.data.note));
    if (task.graph) rtGraph(box, task.graph);
    card.append(box);
  }
  if (task.words && task.words.length) card.append(h('div', {class: 'rv-words'}, h('b', {}, 'Words to use in a good answer: '), task.words.map(w => h('span', {class: 'chip'}, w))));
  card.append(h('details', {}, h('summary', {}, 'Need a reminder?'), h('ul', {}, help.remind.map(x => h('li', {}, h('b', {}, x[0] + ' '), x[1])))));
  card.append(h('details', {}, h('summary', {}, 'Sentence starters and a worked example'), h('ul', {}, help.starters.map(s => h('li', {}, '“' + s + '”'))),
    h('p', {}, h('i', {}, help.exQ)), h('p', {}, '“' + help.exA + '”')));
  const ta = h('textarea', {'aria-label': 'Your paragraph', placeholder: 'Write your paragraph here, in full sentences.', value: saved && saved.text ? saved.text : ''});
  ta.value = saved && saved.text ? saved.text : '';
  const fb = h('div', {class: 'feedback', role: 'status'}), after = h('div', {class: 'rt-after'});
  const btn = h('button', {class: 'btn primary small', type: 'button'}, 'Check');
  const note = h('p', {class: 'legend rv-onego'}, 'You get one go, so check your paragraph carefully before you press Check.');
  card.append(ta, h('div', {class: 'row'}, btn), note, fb, after);
  const ticks = saved && saved.ticks ? saved.ticks.slice() : [false, false, false, false];
  const points = () => ticks.filter(Boolean).length;
  const out = () => ({text: ta.value, ticks: ticks.slice(), done: true, pts: points(), max: 4});
  const setPill = () => { pill.className = 'rv-pill done'; pill.textContent = `✓ ${points()} of 4 points`; card.classList.add('done'); };
  const reveal = () => {
    ta.disabled = true; btn.disabled = true; note.remove(); card.classList.add('locked'); fb.className = ''; fb.textContent = '';
    after.innerHTML = '';
    after.append(h('div', {class: 'rt-model'}, h('h4', {}, 'Model answer'), h('p', {}, task.model)),
      h('h4', {}, 'Now mark your own paragraph. Tick each one you did.'),
      h('div', {class: 'rt-ticks'}, task.ticks.map((t, i) => { const cb = h('input', {type: 'checkbox', checked: !!ticks[i], 'aria-label': t});
        cb.addEventListener('change', () => { ticks[i] = cb.checked; setPill(); onSave(out()); }); return h('label', {}, cb, h('span', {}, t)); })));
    setPill();
  };
  btn.addEventListener('click', () => {
    if (ta.value.trim().length < 12){ fb.className = 'feedback hint'; fb.textContent = 'Write a bit more first, in full sentences.'; return; }
    onSave(out()); reveal();
  });
  if (saved && saved.done) reveal();
  el.append(card);
  return card;
}
