/* ===== Chapter 2 Skills: Graphs and CER (script: docs/Skills_c2s_Script.md) =====
   Two Learn steps (brake-test four crates and make a graph; from graph to CER), a self-check, and a 14-mark Check.
   The steps sit after i6 in the Chapter 2 list so no later step picks up their panels. All ids are new, so saved answers never move. */
const PRIYA = { head: ['Mass (g)', 'Stretch (cm)'], rows: [[100, 2.0], [200, 4.1], [300, 5.9], [400, 8.0]], xKind: 'num', xUnit: 'g', yUnit: 'cm', titleWords: [['mass'], ['stretch']], xWords: ['mass'], yWords: ['stretch'], xUnits: ['g', 'grams'], yUnits: ['cm'], exTitle: 'Mass vs stretch', exX: 'Mass (g)', exY: 'Stretch (cm)' };
const FLOORS_BAR = { head: ['Floor', 'Friction (N)'], rows: [['Ice', 2], ['Wood', 6], ['Carpet', 9], ['Concrete', 14]], xKind: 'name', yUnit: 'N', titleWords: [['floor'], ['friction']], xWords: ['floor'], yWords: ['friction'], xUnits: null, yUnits: ['n', 'newtons'], exTitle: 'Floor vs friction', exX: 'Floor', exY: 'Friction (N)' };
const TRUCK = { head: ['Mass of cargo (kg)', 'Braking distance (m)'], rows: [[0, 40], [2000, 50], [4000, 60], [6000, 70], [8000, 80]], xKind: 'num', xUnit: 'kg', yUnit: 'm', titleWords: [['mass', 'cargo', 'load'], ['braking', 'stopping', 'distance']], xWords: ['mass', 'cargo', 'load'], yWords: ['braking', 'stopping', 'distance'], xUnits: ['kg', 'kilograms'], yUnits: ['m', 'metres', 'meters'], exTitle: 'Mass of cargo vs braking distance', exX: 'Mass of cargo (kg)', exY: 'Braking distance (m)' };
/* the crates the student brake-tests: what they typed, or the expected readings until they have */
const C2S_MASSES = [20, 40, 60, 80], C2S_NOM = [1.6, 3.2, 4.8, 6.4];
function c2sSpec() {
  const s = dbGet('learn.c2s.sk1.q1', null);
  return { head: ['Mass of crate (kg)', 'Braking distance (m)'], rows: C2S_MASSES.map((m, i) => { const x = s && s.v ? parseNum(s.v[i]) : NaN; return [m, isNaN(x) ? C2S_NOM[i] : x]; }), xKind: 'num', xUnit: 'kg', yUnit: 'm', titleWords: [['mass'], ['braking', 'stopping', 'distance', 'slide']], xWords: ['mass'], yWords: ['braking', 'stopping', 'distance'], xUnits: ['kg', 'kilograms'], yUnits: ['m', 'metres', 'meters'], exTitle: 'Mass vs braking distance', exX: 'Mass (kg)', exY: 'Braking distance (m)' };
}
const c2sTableFull = () => { const s = dbGet('learn.c2s.sk1.q1', null); return !!(s && s.done); };
const c2sQ1Done = () => { const s = dbGet('learn.c2s.sk2.q1', null); return !!(s && s.done); };
const c2sMyGraph = () => { const s = dbGet('learn.c2s.sk1.q7', null); return s && s.v && s.v.type ? s.v : gmModel(c2sSpec()); };
/* Priya's finished graph, with a numbered circle on each part */
function gmCallouts(spec) {
  const M = gmModel(spec), X = gmAxis(M, 'x'), Y = gmAxis(M, 'y'), { L, R, T, B } = GM, px = v => L + (v - X.min) / (X.max - X.min) * (R - L), py = v => B - (v - Y.min) / (Y.max - Y.min) * (B - T), d = spec.rows[2];
  const at = { 1: [48, 24], 2: [150, 388], 3: [22, 118], 4: [44, 70], 5: [px(d[0]) + 22, py(d[1]) - 18] };
  return gmSVG(spec, M, { alt: 'A finished graph with each part numbered', maxW: 300 }).replace('</svg>', Object.entries(at).map(([n, [x, y]]) => `<circle cx="${x}" cy="${y}" r="12" fill="#c94a34"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="15" font-weight="800" fill="#fff">${n}</text>`).join('') + '</svg>');
}
const cn = n => `<span class="cn">${n}</span>`;
const TEACH_GRAPH = {
  tid: 'graph-how', needs: c2sTableFull,
  full: () => `<h3>How to make a good graph</h3><p>Priya hangs masses on a spring and measures how far it stretches.</p><div class="tfig">${gmTable(PRIYA, 'tbl')}${gmCallouts(PRIYA)}</div>
    <div class="tpart">${cn(1)}<b>Title</b><span>what you changed vs what you measured: <i>Mass vs stretch</i>.</span></div>
    <div class="tpart">${cn(2)}<b>Bottom axis (x)</b><span>what you changed, with its unit in brackets: <i>Mass (g)</i>.</span></div>
    <div class="tpart">${cn(3)}<b>Side axis (y)</b><span>what you measured, with its unit in brackets: <i>Stretch (cm)</i>.</span></div>
    <div class="tpart">${cn(4)}<b>Scale</b><span>start at 0, go up in equal steps, and finish just above your biggest number.</span></div>
    <div class="tpart">${cn(5)}<b>Points</b><span>one point for each row of the table, placed carefully.</span></div>
    <div class="keyidea">Key idea: changed along the bottom, measured up the side, units in brackets.</div>`,
  reminder: `<h3>How to make a good graph</h3><p><b>Title:</b> what you changed vs what you measured. <b>Bottom axis (x):</b> what you changed, with its unit in brackets. <b>Side axis (y):</b> what you measured, with its unit in brackets. <b>Scale:</b> start at 0 and go up in equal steps. <b>Points:</b> one for each row.</p>`
};
const TEACH_TYPE = {
  tid: 'scatter-bar', needs: c2sTableFull,
  full: () => `<h3>Scatter or bar?</h3><p>If you changed a <b>number</b>, use a ${T('scattergraph', 'scatter graph')}. If you changed a <b>name or a group</b>, use a bar graph.</p><div class="tfig"><figure><figcaption>Priya changed the mass: numbers, so a scatter graph.</figcaption>${gmSVG(PRIYA, gmModel(PRIYA), { maxW: 270 })}</figure><figure><figcaption>Friction on four named floors: names, so a bar graph.</figcaption>${gmSVG(FLOORS_BAR, gmModel(FLOORS_BAR), { maxW: 270 })}</figure></div>`,
  reminder: '<h3>Scatter or bar?</h3><p>If you changed a <b>number</b>, use a scatter graph. If you changed a <b>name or a group</b>, use a bar graph.</p>'
};
const TEACH_CER = {
  tid: 'cer',
  full: () => `<h3>CER: Claim, Evidence, Reasoning</h3><p>A good science paragraph does three jobs, in this order.</p><p><i>Question: Does a rougher surface make more friction?</i></p>
    <div class="tpart"><b>Claim</b><span>answers the question: “Rougher surfaces make more friction.”</span></div>
    <div class="tpart"><b>Evidence</b><span>numbers from the test, each with its unit, like 2 N or 6.4 m: “A block needed a pull of 2 N to slide on ice, and 14 N to slide on sandpaper.”</span></div>
    <div class="tpart"><b>Reasoning</b><span>explains why, using science: “Rough surfaces have more bumps that catch on each other, so more friction pushes back against the pull.”</span></div>
    <p>Evidence can also be facts from something you read, like an article. Scientists use both.</p>`,
  reminder: '<h3>CER: Claim, Evidence, Reasoning</h3><p><b>Claim:</b> answers the question. <b>Evidence:</b> numbers with their units, or facts from something you read. <b>Reasoning:</b> the science that explains why.</p>'
};
const teachQ = (id, T0) => ({ id, type: 'teach', p: '', tid: T0.tid, full: T0.full, reminder: T0.reminder, needs: T0.needs });
/* three quick scatter-or-bar questions, one go each */
const typeQ = (id, p, bar, why) => ({ id, type: 'mcq', p, opts: ['Scatter graph', 'Bar graph'], a: bar ? 1 : 0, needs: c2sTableFull, ok: `That's right! ${why}`, work: why });
const JO = [{ t: 'My results show that a stronger brake stops the crate in a shorter distance.', a: 0, why: 'It answers the question.' }, { t: 'With a 24 N brake the crate slid 3.6 m, and with a 48 N brake it slid 1.8 m.', a: 1, why: 'Numbers from the test, each with its unit.' }, { t: 'A bigger force against the motion slows the crate down faster, so it stops sooner.', a: 2, why: 'It explains why, using science.' }];
const MKCER = ['Claim', 'Evidence', 'Reasoning'];
const cargoWords = v => v === 0 ? 'no cargo' : gmFmt(v) + ' kg of cargo';
const TRUCK_STORY = 'Road crashes kill about 1.2 million people around the world every year. The United Nations has a goal, target 3.6, to halve the number of deaths and injuries from road crashes. Knowing how cargo changes a truck\'s braking distance helps keep everyone safe. A road safety team tested one truck on a test track. They loaded it with different masses of cargo, drove it at 20 m/s and braked with the same force each time.';

{
  const C = CHDATA.c2, at = C.steps.findIndex(s => s.id === 'i6') + 1;
  C.steps.splice(at, 0,
    { id: 'sk1', title: 'Brake test, then graph it', floors: ['air'], ask: 'How does the mass of a crate change its braking distance?',
      cards: [{ html: `<p>In the Foundation you found out that heavier crates are harder to stop. Now you'll test it properly, like a scientist: four crates, the same ${T('brake', '36 N brake')}, and the same launch velocity of 2.4 m/s every time. Then you'll turn your results into a graph.</p>` }],
      setup() { course(20, 2.4, 36); }, adds: ['launch', 'readD'], hide: ['shove', 'vt', 'readV'], sides: [], pullers: [], idle: 'Press Launch the crate',
      tick() { ch2Record(); },
      tasks: [['Launch the <b>20 kg</b> crate and type its braking distance in the table.', () => sd(20) != null], ['Set <b>40 kg</b>, launch it and type its braking distance.', () => sd(40) != null], ['Do the same for <b>60 kg</b> and <b>80 kg</b>.', () => sd(60) != null && sd(80) != null]],
      dataHead: '<b>Collect your data here</b><span>Launch each crate and read its braking distance. Type each reading in the table: a row turns green when it matches the arena.</span>',
      finish: 'Brilliant graph! Now let\'s find out what it tells you.',
      qs: [
        { id: 'q1', type: 'rtable', early: true, p: 'Type the braking distance you read for each crate.', head: ['Mass of crate (kg)', 'Braking distance (m)'], rows: C2S_MASSES, tol: 0.04, live: m => sd(m), waitMsg: m => `Launch the ${m} kg crate first`, ok: 'Every reading matches the sim. Now for the graph!' },
        teachQ('q2', TEACH_GRAPH), teachQ('q3', TEACH_TYPE),
        typeQ('q4', 'Kai pulls the same box across carpet, wood, ice and concrete, and measures the friction on each floor. Which graph should he make?', true, 'The floors are names, not numbers.'),
        typeQ('q5', 'Noor hangs 1, 2, 3, 4 and 5 kg masses on a newtonmeter and records each reading. Which graph should she make?', false, 'She changed a number: the mass.'),
        typeQ('q6', 'Ben tests four brands of trainer and measures the pull needed to make each one slide. Which graph should he make?', true, 'The brands are names.'),
        { id: 'q7', type: 'graph', learn: true, p: 'Make a graph of your own results. Each check turns green when that part is right.', spec: c2sSpec, needs: c2sTableFull }] },
    { id: 'sk2', title: 'From graph to CER', floors: ['air'],
      cards: [{ html: '<p>A graph lets you find values you never measured, and see the trend at a glance. Then scientists write up what they found in a paragraph called a ' + T('cer', 'CER') + '.</p>' }],
      setup() { course(50, 2.4, 36); }, adds: ['launch', 'readD'], hide: ['shove', 'vt', 'readV', 'readD'], sides: [], pullers: [], idle: 'Press Launch the crate',
      tick() { ch2Record(); if (c2sQ1Done() && !LAB.show.has('readD')) { LAB.show.add('readD'); applyPanels(); } },
      ctx: () => `<span class="lbl">Our question</span><p><b>How does the mass of a crate change its braking distance?</b></p><span class="lbl">My graph</span>${gmSVG(c2sSpec(), c2sMyGraph(), { alt: 'My graph', maxW: 340 })}`,
      tasks: [['Now check it: launch the <b>50 kg</b> crate.', () => sd(50) != null && c2sQ1Done()]],
      finish: 'That\'s a CER claim! In the Check you\'ll write all three parts.',
      qs: [
        { id: 'q1', type: 'reading', label: 'Read your graph', p: 'Use your graph. What braking distance would a 50 kg crate have?', unit: 'm', ans: 4, tol: 0.2, ladder: true, hints: ['Find 50 kg on the bottom axis, go straight up to your line of points, then straight across to the side axis.'], ok: 'Well read! Now check it in the arena.', work: 'Your graph gives about 4 m for a 50 kg crate.' },
        { id: 'q2', type: 'mcq', p: 'Which sentence describes the trend best?', opts: ['Every extra 20 kg makes the braking distance 1.6 m longer.', 'When the mass goes up, the braking distance goes up.', 'The 80 kg crate slid 6.4 m.', 'When the mass goes up, the braking distance goes down.'], a: 0, ok: 'Yes: it gives numbers.', why: { 1: 'True, but it gives no numbers.', 2: 'That is one result, not a trend.', 3: 'Look at your graph again: which way do the points go?' } },
        { id: 'q3', type: 'tappts', p: 'Tap the two points that would convince a friend best.', spec: c2sSpec, ok: 'The first and last points show the biggest change.' },
        teachQ('q4', TEACH_CER),
        { id: 'q5', type: 'mark', learn: true, p: 'Jo launched a 30 kg crate at 2.4 m/s and changed the brake force. Mark each sentence as Claim, Evidence or Reasoning.', labels: MKCER, sents: JO, ok: 'Claim, Evidence, Reasoning. Say it, show it, explain it.' },
        { id: 'q6', type: 'para', claim: true, p: 'Your question was: how does the mass of a crate change its braking distance? Write one claim that answers it.', question: 'How does the mass of a crate change its braking distance?', sideHead: 'My graph', sideHTML: () => gmSVG(c2sSpec(), c2sMyGraph(), { alt: 'My graph', maxW: 300 }), starters: ['My results show that…'], model: 'My results show that crates with more mass slide further before they stop.', check: [] }] });
  C.review.push(
    { id: 'c2sr1', obj: ['Ci'], type: 'graph', p: 'Make a graph of the road safety team\'s results.', story: TRUCK_STORY, spec: TRUCK },
    { id: 'c2sr2', obj: ['Cii', 'Di'], type: 'mark', p: 'Read this short article. Mark each sentence as Claim, Evidence or Reasoning. Leave it with no label if it doesn\'t belong.', title: 'Why do cars have seatbelts?', labels: MKCER, sents: [
      { t: 'Seatbelts save lives in car crashes.', a: 0, why: 'It answers the question in the title.' },
      { t: 'The World Health Organization says that wearing a seatbelt cuts the risk of death for people in the front seats by about half.', a: 1, why: 'A fact from a trusted source.' },
      { t: 'Seatbelts come in lots of colours, like black, grey and red.', a: -1, why: 'True, but it doesn\'t help answer the question.' },
      { t: 'For passengers in the back seats, a seatbelt cuts the risk of death or serious injury by about a quarter.', a: 1, why: 'A second fact to back up the claim.' },
      { t: 'When a car stops suddenly, a passenger\'s body has inertia and keeps moving forwards, so the seatbelt gives the force that stops them safely.', a: 2, why: 'It explains why, using science.' }] },
    { id: 'c2sr3', obj: ['Cii', 'Diii'], type: 'para', tapRows: true, p: 'The road safety team\'s question: how does the mass of cargo change a truck\'s braking distance? Tap two rows of the table, then write a CER paragraph that answers the question.', question: 'How does the mass of cargo change a truck\'s braking distance?', story: TRUCK_STORY, data: TRUCK, reminder: 'open',
      starters: ['The results show that…', 'With … kg of cargo the truck slid…, and with…', 'This happens because…'], words: ['braking distance', 'mass', 'inertia', 'brake force'],
      model: sel => { const [a, b] = sel.map(i => TRUCK.rows[i]); return `The results show that the more cargo a truck carries, the further it slides before it stops. With ${cargoWords(a[0])} the truck's braking distance was ${gmFmt(a[1])} m, and with ${cargoWords(b[0])} it was ${gmFmt(b[1])} m. This happens because the cargo gives the truck more mass, so it has more inertia. The same brake force takes longer to stop something with more inertia, so the truck slides further.`; },
      check: ['My claim answers the question.', 'I gave two numbers from the table, each with its unit.', 'I explained the trend using mass and inertia.', 'I used science words correctly, like braking distance and inertia.'] });
}
