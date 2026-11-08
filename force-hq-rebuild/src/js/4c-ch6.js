/* ===== Chapter 6: the Workshop (Save Captain Smooshy!) =====
   Part 1 c6a (steps lv1–lv5, Check c6r1–c6r5): levers, taught slowly. Part 2 c6b (steps pl1–pl4, Check c6r7–c6r11): pulleys, wheels and axles, ramps, wedges and screws.
   Redesigned 1 Nov 2026 after Tom's playtest: one new word per card, a labelled picture beside each new idea (4e-shoppics.js), familiar examples only.
   The maths is in 4a-workshop.js and matches tools/workshop_model.py. The script is docs/Chapter6_Workshop_Script.md (sections F and G). */
Object.assign(TERMS, {
  machine: ['Machine', 'Something that makes a job easier, often by letting a small force move a big load.', ['machines', 'machine']],
  simplemach: ['Simple machine', 'One of the six basic machines: the lever, pulley, wheel and axle, inclined plane, wedge and screw.', ['simple machines', 'simple machine']],
  compound: ['Compound machine', 'Two or more simple machines working together, like scissors, a bicycle or a crane.', ['compound machines', 'compound machine']],
  lever: ['Lever', 'A strong bar that turns around a fixed point called the fulcrum.', ['levers', 'lever']],
  fulcrum: ['Fulcrum', 'The point a lever turns around (its pivot).', ['fulcrum']],
  effort: ['Effort', 'The force you put into a machine.', ['effort']],
  load: ['Load', 'The force the machine has to move, often the weight of the object.', ['load']],
  effortarm: ['Effort arm', 'The distance from the fulcrum to where the effort pushes.', ['effort arm']],
  loadarm: ['Load arm', 'The distance from the fulcrum to the load.', ['load arm']],
  pulley: ['Pulley', 'A wheel with a rope running round it.', ['pulleys', 'pulley']],
  supporting: ['Supporting rope', 'A section of rope that holds up the moving pulley block and the load.', ['supporting ropes', 'supporting rope']],
  wheelaxle: ['Wheel and axle', 'A big wheel (or handle) fixed to a thin rod, the axle, so they turn together.', ['wheel and axle']],
  winch: ['Winch', 'A wheel and axle that winds in a rope or cable.', ['winch']],
  incline: ['Inclined plane', 'A ramp: a flat sloping surface that lets you raise a load with a smaller force.', ['inclined plane', 'inclined planes']],
  wedge: ['Wedge', 'Two ramps back to back, used to split, cut or hold things apart.', ['wedges', 'wedge']],
  screw: ['Screw', 'A ramp wrapped round a rod. The spiral ridge is the thread.', ['screws', 'screw']],
  pitch: ['Pitch', 'The distance a screw moves forward in one full turn.', ['pitch']],
  mechadv: ['Mechanical advantage', 'How many times bigger the load is than the effort: load ÷ effort. It has no unit.', ['mechanical advantage']],
  work: ['Work', 'The energy transferred when a force moves something: force × distance, measured in joules.', ['work']],
  joule: ['Joule (J)', 'The unit of work and energy. One joule is the work done when a 1 N force moves something 1 m.', ['joules', 'joule']],
  efficiency: ['Efficiency', 'How much of the work you put into a machine comes out as useful work: useful work out ÷ work in × 100%.', ['efficiency']],
  wasted: ['Wasted energy', 'Energy that goes somewhere you didn\'t want it. In a machine, friction turns some of the work in into heat.', ['wasted energy']],
  lubricant: ['Lubricant', 'A slippery substance, like oil or grease, that reduces friction between moving parts.', ['lubricant']],
  terraform: ['Terraform', 'To change a planet so that it can become a home, for example by making its air breathable.', ['terraform']]
});
FORMULAS.find(f => f.id === 'weight').ch.push(6);
FORMULAS.push(
  { id: 'ma', name: 'Mechanical advantage', eq: 'MA = load ÷ effort', note: 'No unit: it\'s newtons divided by newtons.', ch: [6] },
  { id: 'effortq', name: 'Effort needed', eq: 'effort = load ÷ MA', note: 'A bigger mechanical advantage means a smaller effort.', ch: [6] },
  { id: 'maparts', name: 'MA from the shape', eq: 'pulley: supporting ropes · lever: (your hand to fulcrum) ÷ (load to fulcrum) · wheel and axle: wheel radius ÷ axle radius · ramp: length ÷ height · wedge: length ÷ thickness · screw: distance the handle moves in one turn ÷ gap between threads', note: 'Use the same unit for both lengths.', ch: [6] },
  { id: 'edist', name: 'How far your hand moves', eq: 'your hand\'s distance = MA × the load\'s distance', note: 'Less force means more distance.', ch: [6] },
  { id: 'macomp', name: 'Compound machines', eq: 'total MA = MA₁ × MA₂ × MA₃', note: 'Multiply, don\'t add.', ch: [6] },
  { id: 'work', name: 'Work', eq: 'work = force × distance', note: 'In joules (J). Force in N, distance in m.', ch: [6] },
  { id: 'eff', name: 'Efficiency', eq: 'efficiency = useful work out ÷ work in × 100%', note: 'It can never be more than 100%.', ch: [6] },
  { id: 'wasted', name: 'Wasted energy', eq: 'wasted energy = work in − useful work out', note: 'Friction turns it into heat.', ch: [6] }
);

/* ---- the loads used in Part 1 ---- */
const WL = {
  rock: { id: 'rock', N: 294, name: '30 kg rock', short: 'rock' }, crate: { id: 'crate', N: 235.2, name: '24 kg crate', short: 'crate' },
  bucket: { id: 'bucket', N: 196, name: '20 kg water bucket', short: 'bucket' }, cart: { id: 'cart', N: 490, name: '50 kg cart', short: 'cart' },
  log: { id: 'log', N: 1200, name: 'log', short: 'log' }, ice: { id: 'ice', N: 500, name: 'ice block', short: 'ice block' }, car: { id: 'car', N: 3000, name: 'car', short: 'car' },
  crate30: { id: 'crate', N: 294, name: '30 kg crate', short: 'crate' }, tank: { id: 'tank', N: 245, name: '25 kg oxygen tank', short: 'tank' },
  engineb: { id: 'engineb', N: 1176, name: '120 kg engine block', short: 'engine block' }, gen: { id: 'gen', N: 2352, name: '240 kg generator', short: 'generator' },
  cone: { id: 'cone', N: 1960, name: '200 kg nose cone', short: 'nose cone' }, rover: { id: 'rover', N: 3920, name: '400 kg Gummy Rover', short: 'rover' }, blockg: { id: 'blockg', N: 1260, name: '300 kg engine block on Glimmer-9', short: 'engine block' },
  tank600: { id: 'tank600', N: 600, name: '600 N water tank', short: 'tank' }, pod: { id: 'pod', N: 3000, name: '3,000 N supply pod', short: 'pod' }, panel: { id: 'panel', N: 600, name: '600 N dome panel', short: 'panel' }, water: { id: 'water', N: 2000, name: '2,000 N water tank', short: 'water tank' }, supply: { id: 'supply', N: 300, name: '300 N supply crate', short: 'crate' },
  gumdrop: { id: 'gumdrop', N: 6300, name: '1,500 kg Gumdrop', short: 'Gumdrop' }, boulder: { id: 'boulder', N: 252, name: '60 kg boulder', short: 'boulder' }, sunk: { id: 'sunk', N: 3780, name: 'the Gumdrop\'s sunken side', short: 'ship' },
  barrel: { id: 'barrel', N: 784, name: '80 kg fuel barrel', short: 'barrel' }, engine: { id: 'engine', N: 490, name: '50 kg spare engine', short: 'engine' }
};
const shopStage = o => { LAB.pullGate = null; clearCh2(); S.scene = 'shop'; S.left = []; S.right = []; S.floor = 'air'; S.warp = 1; S.running = false; wsSetup(o); };
const UNITS_W = ['N', 'J', 'm', 'kg'];
const WS_TREND = ['got bigger', 'stayed the same', 'got smaller'];

CHDATA.c6 = {
  goal: 'Name the six simple machines and say how each one helps; work out mechanical advantage, effort and effort distance; calculate work as force × distance and explain why an ideal machine doesn\'t reduce the work; find the mechanical advantage of a compound machine by multiplying, and use it to plan a rescue.',
  vocab: ['machine', 'lever', 'fulcrum', 'load', 'effort', 'pulley', 'supporting rope', 'wheel and axle', 'inclined plane', 'wedge', 'screw', 'mechanical advantage', 'work', 'joule'],
  steps: [
    /* ================= Part 1: Levers (c6a) ================= */
    { id: 'lv1', title: 'Too heavy for Smooshy', rescue: 'Lever found. Time to put it to work!',
      cards: [
        { hi: '#cvScene', html: `<p>Welcome to the Workshop! Captain Smooshy's squishy gummy arms can only pull with <b>60 N</b>. A big rock is pinning his spaceship, so let's find out how hard a 30 kg rock is to lift. You'll lift it with a ${T('newtonmeter', 'newtonmeter')} in your hand, and its reading tells you how hard you pulled.</p>` },
        { html: `<p>When a job is too hard, engineers use a ${T('machine', 'machine')}: something that helps a small force do a big job. Your first machine is a ${T('lever', 'lever')}. It is a strong bar resting on a pivot, and the pivot is called the ${T('fulcrum', 'fulcrum')}.</p>${picBar()}` },
        { html: `<p>The thing a lever moves is called the ${T('load', 'load')}. In the Workshop, the load is the rock.</p>${picLever({ show: 'FL', focus: 'L' })}` },
        { html: `<p>Your pull on the other end of the bar is called the ${T('effort', 'effort')}. So every lever has three parts: the fulcrum, the load and the effort.</p>${picLever({ focus: 'E' })}` }],
      setup() { lessonStage({ mach: 'hand', allow: ['hand', 'lever'], cls: 1, arm: 1.0, lift: 0.10, loads: { hand: WL.rock, lever: WL.rock }, maxTravel: 1.5, lesson: { tray: ['lever'], pre: [], lock: [] } }); }, adds: ['wspull'], sides: [], pullers: [], idle: 'Press ▶ Lift! to lift the rock with just a rope',
      tasks: [['Press <b>▶ Lift!</b> with just the rope.', () => shopHas({ mach: 'hand' })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['Now drag the <b>lever</b> from the tray under the rock. The fulcrum starts in the middle of the bar. Press <b>▶ Pull!</b>', () => shopHas({ mach: 'lever', cls: 1, la: 1 })], ['', () => hasAns('q2'), { q: 'q2' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'Lifting the rock by hand, what did the newtonmeter read?', unit: 'N', tol: 1, live: () => shopE({ mach: 'hand' }), need: () => shopHas({ mach: 'hand' }), needMsg: 'Lift the rock by hand first. Your runs are in the Journal.', ok: 'Right, 294 N. That\'s nearly five times more than Smooshy\'s 60 N!' },
        { id: 'q2', type: 'reading', p: 'With the lever and the fulcrum in the middle, what did the newtonmeter read?', unit: 'N', tol: 1, live: () => shopE({ mach: 'lever', cls: 1, la: 1 }), need: () => shopHas({ mach: 'lever', cls: 1, la: 1 }), needMsg: 'Pull with the lever first. Your runs are in the Journal.', ok: '294 N again! With the fulcrum in the middle, the lever doesn\'t make the job any easier yet. You\'ll change that in the next step.' },
        { id: 'q3', type: 'pick', p: `<p>Label the lever.</p>${picLever({ letters: true })}<p>Part A is the {0}, part B is the {1} and part C is the {2}.</p>`, picks: [[['fulcrum', 'load', 'effort'], 0], [['fulcrum', 'load', 'effort'], 1], [['fulcrum', 'load', 'effort'], 2]], after: 'The fulcrum is the pivot, the load is the rock, and the effort is your pull.' }] },

    { id: 'lv2', title: 'Move the fulcrum', rescue: 'Fulcrum trick learned.',
      cards: [
        { hi: '#cvScene', html: `<p>Here's where a lever gets clever. Drag the fulcrum (the triangle) along the bar. The labels on the bar show how far the rock is from the fulcrum, and how far your hand is from it. After each move, press <b>▶ Pull!</b> and read the newtonmeter.</p>` },
        CFACT('The Greek scientist Archimedes, over 2,200 years ago, said that with a long enough lever and a place to stand, he could move the Earth.')],
      predict: { q: 'You move the fulcrum closer to the rock. What will happen to the effort you need?', opts: ['It gets smaller, because more of the bar is on your side', 'It gets bigger, because the rock is now closer to the fulcrum', 'It stays the same, because the rock\'s weight hasn\'t changed', 'It drops to zero, because the fulcrum now holds up the rock'], then: 'Test it! Move the fulcrum close to the rock and pull.' },
      setup() { lessonStage({ mach: 'lever', allow: ['lever'], cls: 1, arm: 1.0, lift: 0.10, loads: { lever: WL.rock }, maxTravel: 1.5, lesson: { tray: [], pre: ['lever'], lock: ['lever'] } }); }, adds: [], sides: [], pullers: [], idle: 'Press ▶ Pull! to work the lever',
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Drag the fulcrum so the rock is <b>0.4 m</b> from it, then press <b>▶ Pull!</b>', () => shopHas({ mach: 'lever', cls: 1, la: 0.4 })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['Find a fulcrum position where the effort is <b>60 N or less</b>.', () => shopRuns().some(r => r.mach === 'lever' && r.cls === 1 && !r.capped && r.E <= 60)]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With the rock 0.4 m from the fulcrum, what did the newtonmeter read?', unit: 'N', tol: 1, live: () => shopE({ mach: 'lever', cls: 1, la: 0.4 }), need: () => shopHas({ mach: 'lever', cls: 1, la: 0.4 }), needMsg: 'Pull with the rock 0.4 m from the fulcrum first. Your runs are in the Journal.', ok: 'Yes, 73.5 N. That\'s four times smaller than lifting the rock by hand.' },
        { id: 'q2', type: 'pick', p: 'Moving the fulcrum closer to the rock made the effort {0}.', picks: [[WS_TREND, 2]], after: 'The closer the fulcrum is to the rock, the smaller the effort you need.' },
        { id: 'q3', type: 'mcq', p: 'Captain Smooshy wants to lift a heavy rock with a lever and a small pull. Where should he put the fulcrum?', opts: ['Close to the rock, so his side of the bar is long', 'Close to his hand, so his side of the bar is short', 'Exactly in the middle, so both sides are the same', 'Anywhere, because the fulcrum doesn\'t change the pull'], a: 0, ok: 'Spot on! A long side for his hand means a small pull.', why: { 1: 'That makes his side of the bar short, so he would need a bigger pull.', 2: 'In the middle, the effort was the same as lifting the rock by hand.', 3: 'Your readings changed every time you moved the fulcrum.' } }] },

    { id: 'lv3', title: 'The catch', rescue: 'The big rule is in the mission log: a smaller effort, or a bigger distance.',
      cards: [
        { hi: '#cvScene', html: `<p>Is there a catch to this trick? Let's find out. After each pull, two rulers appear under the bench. The <b style="color:#2a7d48">green ruler</b> shows how far the rock rose. The <b style="color:#d6402c">red ruler</b> shows how far your hand moved. Compare them carefully. You'll try three fulcrum positions.</p>` }],
      setup() { lessonStage({ mach: 'lever', allow: ['lever'], cls: 1, arm: 0.4, lift: 0.10, loads: { lever: WL.rock }, maxTravel: 1.5, lesson: { tray: [], pre: ['lever'], lock: ['lever'] } }); }, adds: ['rulers'], sides: [], pullers: [], idle: 'Press ▶ Pull! and look at both rulers',
      tasks: [['Pull with the rock <b>0.4 m</b> from the fulcrum and look at both rulers.', () => shopHas({ mach: 'lever', cls: 1, la: 0.4 })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['Now move the fulcrum so the rock is <b>0.2 m</b> from it, and pull again.', () => shopHas({ mach: 'lever', cls: 1, la: 0.2 })], ['', () => hasAns('q2'), { q: 'q2' }],
        ['Last one: move the fulcrum close to <b>your hand</b>, so the rock is <b>1.6 m</b> from it. Pull, and compare the rulers again.', () => shopHas({ mach: 'lever', cls: 1, la: 1.6 })], ['', () => hasAns('q3'), { q: 'q3' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With the rock 0.4 m from the fulcrum, the rock rose 0.10 m. How far did your hand move? Use the red ruler.', unit: 'm', tol: 0.02, live: () => shopDist({ mach: 'lever', cls: 1, la: 0.4 }), need: () => shopHas({ mach: 'lever', cls: 1, la: 0.4 }), needMsg: 'Pull with the rock 0.4 m from the fulcrum first.', ok: '0.40 m: four times further than the rock rose.' },
        { id: 'q2', type: 'reading', p: 'With the rock 0.2 m from the fulcrum, how far did your hand move?', unit: 'm', tol: 0.02, live: () => shopDist({ mach: 'lever', cls: 1, la: 0.2 }), need: () => shopHas({ mach: 'lever', cls: 1, la: 0.2 }), needMsg: 'Pull with the rock 0.2 m from the fulcrum first.', ok: '0.90 m! The effort was tiny, but your hand moved nine times further than the rock.' },
        { id: 'q3', type: 'reading', p: 'With the fulcrum close to your hand, the rock rose 0.40 m. How far did your hand move? Use the red ruler.', unit: 'm', tol: 0.02, live: () => shopDist({ mach: 'lever', cls: 1, la: 1.6 }), need: () => shopHas({ mach: 'lever', cls: 1, la: 1.6 }), needMsg: 'Pull with the rock 1.6 m from the fulcrum first.', ok: 'Only 0.10 m! This time the rock moved four times further than your hand, but the newtonmeter read a huge 1,176 N.' },
        { id: 'q4', type: 'pick', p: 'With the fulcrum close to the rock, the effort was {0} and your hand moved further. With the fulcrum close to your hand, the effort was {1} and the rock moved further.', picks: [[['small', 'the same as by hand', 'big'], 0], [['small', 'the same as by hand', 'big'], 2]] },
        { id: 'q5', type: 'tap', p: '<b>Key idea.</b> Tap the sentence that sums up what you found.', opts: ['A machine can make the effort you need smaller, or let you move something a bigger distance, depending on how you use it!', 'A machine always makes the effort smaller, however you use it.', 'A machine makes the load lighter, so it is easier to move.', 'A machine makes the effort and the distance smaller at the same time.'], a: 0, ok: 'Yes! That\'s the big rule for every machine. You choose: a smaller effort (and your hand moves further), or a bigger distance for the load (and you pull harder).', why: { 1: 'With the fulcrum close to your hand, the effort was 1,176 N: much bigger than lifting the rock by hand.', 2: 'The rock was 294 N every time. A machine never changes the weight of the load.', 3: 'A smaller effort always meant your hand moved further: that\'s the catch.' } }] },

    { id: 'lv4', title: 'Three ways to build a lever', rescue: 'Three lever designs tested.',
      cards: [
        { html: `<p>Here's the big rule you found. Remember it: it works for every machine in the Workshop.</p><div class="law">A machine can make the effort you need smaller, or let you move something a bigger distance, depending on how you use it!</div><p>Close to the rock, the fulcrum gives you a <b>smaller effort</b>. Close to your hand, it gives the rock a <b>bigger distance</b>. It can't do both at once.</p>` },
        { hi: '#cvScene', html: `<p>So far the fulcrum has always been in the middle. You can also build a lever with the load in the middle, or with your effort in the middle. Tap the lever to open its menu and choose a design. Then press <b>▶ Pull!</b> and check the newtonmeter and the two rulers.</p>${picThree()}` }],
      predict: { q: 'With the effort in the middle, your hand pulls up close to the fulcrum and the rock sits at the far end. How will the effort compare with the rock\'s weight?', opts: ['The effort will be bigger than the rock\'s weight', 'The effort will be smaller than the rock\'s weight', 'The effort will be equal to the rock\'s weight', 'The effort will be zero, because the fulcrum holds it'], then: 'Try the load in the middle first, then the effort in the middle.' },
      setup() { lessonStage({ mach: 'lever', allow: ['lever'], cls: 1, arm: 1.0, lift: 0.10, loads: { lever: WL.rock }, maxTravel: 1.5, classPick: true, lesson: { tray: [], pre: ['lever'], lock: ['lever'] } }); }, adds: [], sides: [], pullers: [], idle: 'Tap the lever to choose a design, then press ▶ Pull!',
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Tap the lever and choose <b>Load in the middle</b>. Drag the rock so it is <b>0.5 m</b> from the fulcrum, then press <b>▶ Pull!</b>', () => shopHas({ mach: 'lever', cls: 2, la: 0.5 })],
        ['Tap the lever and choose <b>Effort in the middle</b>. Drag your hand so it is <b>0.5 m</b> from the fulcrum, then press <b>▶ Pull!</b>', () => shopHas({ mach: 'lever', cls: 3, ea: 0.5 })], ['', () => hasAns('q1'), { q: 'q1' }], ['', () => hasAns('q2'), { q: 'q2' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With the effort in the middle, what did the newtonmeter read?', unit: 'N', tol: 2, live: () => shopE({ mach: 'lever', cls: 3, ea: 0.5 }), need: () => shopHas({ mach: 'lever', cls: 3, ea: 0.5 }), needMsg: 'Pull with the effort in the middle and your hand 0.5 m from the fulcrum first.', ok: '1,176 N: four times the rock\'s weight!' },
        { id: 'q2', type: 'reading', p: 'With the effort in the middle, the rock rose 0.40 m. How far did your hand move? Use the red ruler.', unit: 'm', tol: 0.02, live: () => shopDist({ mach: 'lever', cls: 3, ea: 0.5 }), need: () => shopHas({ mach: 'lever', cls: 3, ea: 0.5 }), needMsg: 'Pull with the effort in the middle first.', ok: 'Only 0.10 m. A small movement of your hand swung the rock four times as far.' },
        { id: 'q3', type: 'pick', p: 'With the effort in the middle, the effort was {0} the rock\'s weight, but the rock moved {1} your hand.', picks: [[['smaller than', 'the same as', 'bigger than'], 2], [['less far than', 'the same distance as', 'further than'], 2]], after: 'It\'s the catch again, the other way round: a bigger effort, but a bigger distance at the load.' }] },

    { id: 'lv5', title: 'The three classes of lever', rescue: 'All three classes of lever logged. The lever kit is packed!',
      cards: [
        { html: `<p>Scientists give the three designs names. They are the three <b>classes</b> of lever, and you name each one by what is in the middle.</p>${picThree({ classes: true })}` },
        { html: `<p>Here's an everyday example of each one. A seesaw is a <b>class 1</b> lever: the fulcrum is in the middle.</p>${picSeesaw()}` },
        { html: `<p>A wheelbarrow is a <b>class 2</b> lever. The wheel is the fulcrum, the heavy soil in the middle is the load, and you lift the handles at the end.</p>${picWheelbarrow()}` },
        { html: `<p>Chopsticks are a <b>class 3</b> lever. They pivot where they rest in your hand, your fingers squeeze in the middle, and the food is at the tips.</p>${picChopsticks()}` },
        { html: `<p>Watch a class 3 lever in action. The effort is big, but your hand only moves a little, and the far end swings a long way.</p>${picClass3Anim()}` }],
      setup() { lessonStage({ mach: 'lever', allow: ['lever'], cls: 3, arm: 1.0, lift: 0.10, loads: { lever: WL.rock }, maxTravel: 1.5, classPick: true, clsNames: true, lesson: { tray: [], pre: ['lever'], lock: ['lever'] } }); }, adds: [], sides: [], pullers: [], idle: 'Press ▶ Pull! to work the class 3 lever',
      tasks: [['The lever menu now shows the class names. Build a <b>class 3</b> lever with your hand <b>1.0 m</b> from the fulcrum and press <b>▶ Pull!</b>. Watch the far end swing.', () => shopHas({ mach: 'lever', cls: 3, ea: 1 })]],
      qs: [
        { id: 'q1', type: 'pick', p: 'In a class 2 lever, the {0} is in the middle. In a class 3 lever, the {1} is in the middle.', picks: [[['fulcrum', 'load', 'effort'], 1], [['fulcrum', 'load', 'effort'], 2]] },
        { id: 'q2', type: 'mcq', p: 'Chopsticks are a class 3 lever. Why are they so useful?', opts: ['A small squeeze of your fingers moves the tips a long way', 'Your fingers squeeze with less force than the food\'s weight', 'The food gets lighter when you hold it at the tips', 'Class 3 levers can work without any fulcrum at all'], a: 0, ok: 'Yes! Small finger movements open and close the tips wide.', why: { 1: 'In a class 3 lever the effort is bigger than the load.', 2: 'The food\'s weight is mass × g, which never changes.', 3: 'Chopsticks pivot where they rest in your hand: that\'s the fulcrum.' } }] },

    /* ================= Part 2: Pulleys, wheels and ramps (c6b) ================= */
    { id: 'pl1', title: 'Pulleys', rescue: 'Pulley blocks packed in the toolkit.',
      cards: [
        { html: `<p>Welcome to Part 2! Remember the big rule from the lever:</p><div class="law">A machine can make the effort you need smaller, or let you move something a bigger distance, depending on how you use it!</div><p>Every machine in Part 2 follows it. Watch for the catch: a smaller effort means your hand moves further.</p>${picCatch()}` },
        { hi: '#cvScene', html: `<p>A ${T('pulley', 'pulley')} is a wheel with a rope running round it. A flagpole has one at the top: you pull the rope down, and the flag goes up.</p>${picFlagpole()}` },
        { hi: '[data-panel="wsctl"]', html: `<p>Here's a trick to make the crate easier to lift: hang it from a pulley that moves up with it. Now there's more than one piece of rope holding the crate up, and the pieces <b>share</b> its weight. They're called ${T('supporting', 'supporting ropes')}. With 2 supporting ropes, each one holds up half of the crate. Count only the ropes that hold the crate up: the end you pull isn't holding the crate, so don't count it.</p>${picMovingPulley()}` }],
      predict: { q: 'With 4 supporting ropes, how much rope will you have to pull to lift the crate 1 m?', opts: ['4 m of rope, because each of the 4 ropes gets 1 m shorter', '1 m of rope, because the crate only rises 1 m', '0.25 m of rope, because the 4 ropes share the job', '2 m of rope, because the pulley doubles the distance'], then: 'Lift the crate with 1, 2, 3 and 4 supporting ropes. Watch the newtonmeter and the red ruler.' },
      setup() { shopStage({ mach: 'pulley', allow: ['pulley'], ropes: 1, lift: 1.0, loads: { pulley: WL.crate }, lim: { ropesMax: 6 } }); }, adds: ['wsctl', 'wspull', 'rulers'], hide: ['wsmach'], sides: [], pullers: [], idle: 'Press Pull! to lift the crate',
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Lift the crate with <b>1, 2, 3 and 4</b> supporting ropes.', () => [1, 2, 3, 4].every(n => shopHas({ mach: 'pulley', ropes: n }))], ['', () => hasAns('q1'), { q: 'q1' }], ['', () => hasAns('q2'), { q: 'q2' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With 4 supporting ropes, what effort lifted the 235.2 N crate?', unit: 'N', tol: 0.5, live: () => shopE({ mach: 'pulley', ropes: 4 }), need: () => shopHas({ mach: 'pulley', ropes: 4 }), needMsg: 'Lift the crate with 4 supporting ropes first. Your runs are in the Journal.', ok: 'Yes, 58.8 N, a quarter of the crate\'s weight. That\'s under Smooshy\'s limit!' },
        { id: 'q2', type: 'reading', p: 'With 4 supporting ropes, the crate rose 1.0 m. How much rope did you pull? Use the red ruler.', unit: 'm', tol: 0.05, live: () => shopDist({ mach: 'pulley', ropes: 4 }), need: () => shopHas({ mach: 'pulley', ropes: 4 }), needMsg: 'Lift the crate with 4 supporting ropes first.', ok: '4 m of rope for a 1 m lift. Each of the 4 supporting ropes got 1 m shorter.' },
        { id: 'q3', type: 'pick', p: 'Each extra supporting rope made the effort {0} and the length of rope you pulled {1}.', picks: [[['bigger', 'the same', 'smaller'], 2], [['shorter', 'the same', 'longer'], 2]], after: 'The catch again: less force, more rope.' },
        { id: 'q4', type: 'mcq', p: 'A flagpole has just one pulley, so the pull you need is the same as the flag\'s weight. Why is the pulley still useful?', opts: ['You can stand at the bottom and pull down to raise the flag to the top', 'It makes the flag lighter, so it is easier to lift to the top', 'It halves the pull you need to raise the flag to the top', 'It stops the flag from ever sliding back down the pole'], a: 0, ok: 'Exactly. One pulley changes the direction of your pull, so you pull down and the flag goes up.', why: { 1: 'The flag\'s weight doesn\'t change.', 2: 'With 1 supporting rope, the effort was the full weight of the crate.', 3: 'Let go of the rope and the flag slides down. The pulley only changes the direction.' } }] },

    { id: 'pl2', title: 'Wheel and axle', rescue: 'A winch packed in the toolkit.',
      cards: [
        { html: `<p>A ${T('wheelaxle', 'wheel and axle')} is a big wheel fixed to a thin rod, called the axle, so they turn together. A screwdriver is one: the fat handle is the wheel, and the thin metal shaft is the axle.</p>${picScrewdriver()}` },
        { hi: '#cvScene', html: `<p>The Workshop's ${T('winch', 'winch')} is a wheel and axle too. You turn the handle, and the thin axle winds up the rope to lift the bucket. Try a short handle, then a long one.</p>` }],
      predict: { q: 'You swap a short winch handle for a long one. What will happen to the effort?', opts: ['It gets smaller, because your hand moves round a bigger circle', 'It gets bigger, because a long handle is heavier to turn', 'It stays the same, because the bucket weighs the same', 'It drops to zero, because the handle does all the work'], then: 'Lift the bucket with each handle and watch the newtonmeter.' },
      setup() { shopStage({ mach: 'winch', allow: ['winch'], R: 0.1, axle: 0.05, lift: 1.0, loads: { winch: WL.bucket } }); }, adds: [], hide: ['wsmach'], sides: [], pullers: [], idle: 'Press Turn! to wind the winch',
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Lift the bucket with a handle radius of <b>0.1 m</b>, then <b>0.25 m</b>.', () => shopHas({ mach: 'winch', R: 0.1 }) && shopHas({ mach: 'winch', R: 0.25 })], ['', () => hasAns('q1'), { q: 'q1' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With a handle radius of 0.25 m, what effort lifted the 196 N bucket?', unit: 'N', tol: 0.5, live: () => shopE({ mach: 'winch', R: 0.25 }), need: () => shopHas({ mach: 'winch', R: 0.25 }), needMsg: 'Lift the bucket with a handle radius of 0.25 m first. Your runs are in the Journal.', ok: 'Yes, 39.2 N. The long handle made your force five times bigger at the axle.' },
        { id: 'q2', type: 'pick', p: 'The longer handle made the effort {0}, and your hand moved {1} as it turned the handle.', picks: [[['bigger', 'the same', 'smaller'], 2], [['less far', 'the same distance', 'further'], 2]], after: 'Your hand travels round a bigger circle, so a smaller force does the job.' }] },

    { id: 'pl3', title: 'Ramps', rescue: 'A folding ramp packed in the toolkit.',
      cards: [
        { hi: '#cvScene', html: `<p>A ramp lets you raise a load without lifting it straight up. You'll see ramps at school entrances, for wheelchairs and trolleys. Scientists call a ramp an ${T('incline', 'inclined plane')}.</p>${picRamp()}` }],
      predict: { q: 'You pull a 490 N cart up onto a 1 m high platform. Which ramp will need the smallest pull?', opts: ['The longest ramp, 5 m long and gentle', 'The shortest ramp, 2 m long and steep', 'Every ramp needs exactly the same pull', 'The middle ramp, 4 m long and medium'], then: 'Try the 2 m ramp, then the 5 m ramp.' },
      setup() { shopStage({ mach: 'ramp', allow: ['ramp'], L: 2, h: 1, lift: 1.0, loads: { ramp: WL.cart }, lim: { rampL: [1, 6, 1] } }); }, adds: [], hide: ['wsmach'], sides: [], pullers: [], idle: 'Press Pull! to pull the cart up the ramp',
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Pull the cart up the <b>2 m</b> ramp, then the <b>5 m</b> ramp.', () => shopHas({ mach: 'ramp', L: 2, h: 1 }) && shopHas({ mach: 'ramp', L: 5, h: 1 })], ['', () => hasAns('q1'), { q: 'q1' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'What pull got the 490 N cart up the 5 m ramp?', unit: 'N', tol: 0.5, live: () => shopE({ mach: 'ramp', L: 5, h: 1 }), need: () => shopHas({ mach: 'ramp', L: 5, h: 1 }), needMsg: 'Pull the cart up the 5 m ramp first.', ok: '98 N, a fifth of the cart\'s weight. You pulled it 5 m to raise it 1 m.' },
        { id: 'q2', type: 'mcq', p: 'Why does the 5 m ramp need a smaller pull than the 2 m ramp?', opts: ['The cart travels a longer distance, so each metre needs less force', 'The cart weighs less when it sits on a long, gentle ramp', 'The long ramp has less friction, so the cart rolls more easily', 'The steep ramp pushes back on the cart and makes it heavier'], a: 0, ok: 'Yes! Less force, more distance, again.', why: { 1: 'The cart\'s weight is mass × g on any ramp.', 2: 'Workshop machines have no friction at all.', 3: 'The cart\'s weight doesn\'t change with the slope.' } }] },

    { id: 'pl4', title: 'Ramps in disguise', rescue: 'Wedges and a screw jack packed. The toolkit is ready!',
      cards: [
        { hi: '#cvScene', html: `<p>Two more simple machines are ramps in disguise. A ${T('wedge', 'wedge')} is two ramps back to back. Push it down into a log and its sloping sides push the two halves apart. A knife and a doorstop are wedges.</p>${picWedge()}` },
        { hi: '[data-panel="wsmach"]', html: `<p>A ${T('screw', 'screw')} is a ramp wrapped round a rod, and the spiral ramp is called the <b>thread</b>. A car jack uses a screw: each turn of the handle lifts the car by the small gap between two threads.</p>${picScrewIdea()}` }],
      predict: { q: 'You split the same log with a fat wedge (5 cm thick) and a thin wedge (2 cm thick). Both are 20 cm long. Which will need the smaller push?', opts: ['The thin wedge needs the smaller push', 'The fat wedge needs the smaller push', 'Both wedges need the same push', 'Neither wedge can split the log'], then: 'Split the log with each wedge and watch the newtonmeter.' },
      setup() { shopStage({ mach: 'wedge', allow: ['wedge', 'screw'], thick: 10, per: 120, pitch: 1.0, lift: 0.20, loads: { wedge: WL.log, screw: WL.car }, lim: { pitch: [0.5, 1.0] } }); }, adds: ['wsmach'], sides: [], pullers: [], idle: 'Press Push! to split the log',
      mask: [{ q: 'q1', keys: ['turns'], when: r => r.mach === 'screw' && r.pitch === 0.5 }],
      tick() { const st = CHDATA.c6.steps.find(x => x.id === 'pl4'); if (!S.flags.iceOn && [0, 1, 2, 3].every(i => st.tasks[i][1]())) { S.flags.iceOn = true; WS.loads.wedge = WL.ice; if (WS.mach === 'wedge') { wsLoadFor('wedge'); wsResetLoad(); wsRenderControls(); } } },
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Split the log with the <b>5 cm</b> wedge, then the <b>2 cm</b> wedge.', () => shopHas({ mach: 'wedge', thick: 5, load: 1200 }) && shopHas({ mach: 'wedge', thick: 2, load: 1200 })],
        ['Lift the car with the screw jack, first with a <b>1.0 cm</b> gap between threads, then a <b>0.5 cm</b> gap. Watch the turn counter.', () => shopHas({ mach: 'screw', pitch: 1 }) && shopHas({ mach: 'screw', pitch: 0.5 })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['<b>Toolbox job:</b> Smooshy\'s ice block needs <b>500 N</b> to split. Choose a wedge that splits it with <b>60 N or less</b>.', () => shopRuns().some(r => r.mach === 'wedge' && r.loadN === 500 && !r.capped && r.E <= 60)]],
      qs: [
        { id: 'q1', type: 'reading', p: 'How many turns of the handle lifted the car 20 cm with the 0.5 cm gap between threads?', unit: 'turns', tol: 0, live: () => { const r = shopRun({ mach: 'screw', pitch: 0.5 }); return r ? r.turns : null; }, need: () => shopHas({ mach: 'screw', pitch: 0.5 }), needMsg: 'Lift the car with the 0.5 cm gap first. Your runs are in the Journal.', ok: '40 turns! The closer threads needed half the effort, but twice as many turns.' },
        { id: 'q2', type: 'pick', p: 'With the threads closer together (0.5 cm), the effort was {0} and the number of turns was {1}.', picks: [[['bigger', 'the same', 'smaller'], 2], [['smaller', 'the same', 'bigger'], 2]] },
        { id: 'q3', type: 'tick', p: 'Tick every object that uses a wedge.', opts: ['A kitchen knife', 'A doorstop', 'The point of a nail', 'Your front teeth', 'A doorknob', 'A seesaw'], a: [0, 1, 2, 3], ok: 'Yes! A doorknob is a wheel and axle, and a seesaw is a lever.' }] },

    /* ================= Part 3: Mechanical advantage and work (c6c) =================
       Re-pitched 2 Nov 2026 against the pacing rules (script section A2): one new word per card, a labelled picture for each new idea, plain words, nothing in a card gives a prediction away. */
    { id: 'u1', title: 'Mechanical advantage', rescue: 'The mission computer has learned mechanical advantage.',
      cards: [
        { hi: '#cvScene', html: `<p>📡 ${SMOOSHY.name}: "My mission computer can't understand 'easier'. It needs a <b>number</b>!"</p><p>Engineers use ${T('mechadv', 'mechanical advantage')}: how many times bigger the load is than the effort. In Part 2, the crate needed an effort of 58.8 N with 4 supporting ropes. The load, 235.2 N, is 4 times bigger than the effort, so the mechanical advantage is 4.</p>${picMA()}<div class="law">mechanical advantage = load ÷ effort</div><p>Newtons divided by newtons leaves a plain number, so mechanical advantage has no unit.</p>` },
        { html: `<p>A flagpole has just one pulley, and the effort is the same as the flag's weight. The load is not bigger than the effort at all, so the mechanical advantage is 1. That means no help with the force.</p>${picFlagpole()}` }],
      setup() { shopStage({ mach: 'pulley', allow: ['pulley'], ropes: 1, lift: 1.0, loads: { pulley: WL.crate30 }, lim: { ropesMax: 6 } }); }, adds: ['wsctl', 'wspull', 'readMA'], hide: ['wsmach', 'rulers'], sides: [], pullers: [], idle: 'Press Pull! to lift the crate',
      mask: [{ q: 'q1', keys: ['readMA'], when: r => r.mach === 'pulley' && r.ropes === 3 }, { q: 'q2', keys: ['readMA'], when: r => r.mach === 'pulley' && r.ropes === 6 }],
      tasks: [['Lift the 294 N crate with <b>3</b> supporting ropes. Read the newtonmeter.', () => shopHas({ mach: 'pulley', ropes: 3 })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['Now lift it with <b>6</b> supporting ropes.', () => shopHas({ mach: 'pulley', ropes: 6 })], ['', () => hasAns('q2'), { q: 'q2' }]],
      qs: [
        { id: 'q1', type: 'num', p: 'Use your newtonmeter reading for 3 supporting ropes. What is the mechanical advantage?', unit: '', ans: 3, tol: 0.05, need: () => shopHas({ mach: 'pulley', ropes: 3 }), needMsg: 'Lift the crate with 3 supporting ropes first. Your runs are in the Journal.', ladder: true, hints: ['Mechanical advantage = load ÷ effort.', 'The load is 294 N. The effort is your newtonmeter reading.', 'Type 294 ÷ (your reading) into the calculator.'], work: '294 ÷ 98 = 3. There is no unit.', ok: 'Yes, 3. It matches the 3 supporting ropes. The mechanical advantage readout now shows.' },
        { id: 'q2', type: 'num', p: 'Use your newtonmeter reading for 6 supporting ropes. What is the mechanical advantage?', unit: '', ans: 6, tol: 0.1, need: () => shopHas({ mach: 'pulley', ropes: 6 }), needMsg: 'Lift the crate with 6 supporting ropes first. Your runs are in the Journal.', ladder: true, hints: ['Find your effort reading for 6 ropes in the Journal.', 'Divide the load, 294 N, by that effort.', 'Type 294 ÷ 49 into the calculator.'], work: '294 ÷ 49 = 6.', ok: 'Yes, 6. For a pulley system, the mechanical advantage is the number of supporting ropes.' },
        { id: 'q3', type: 'pick', p: 'A machine with a mechanical advantage of 1 needs an effort {0} the load. A machine with a mechanical advantage of 5 needs an effort {1} the load.', picks: [[['smaller than', 'the same as', 'bigger than'], 1], [['5 times smaller than', 'the same as', '5 times bigger than'], 0]], after: 'Mechanical advantage = load ÷ effort, so a mechanical advantage of 5 means the effort is 5 times smaller than the load.' }] },

    { id: 'u2', title: 'Mechanical advantage from the shape', rescue: 'The mission computer can predict the effort for any simple machine.',
      cards: [
        { html: `<p>You can find a machine's mechanical advantage from its shape, before you lift anything. For a lever, divide your hand's distance from the fulcrum by the rock's distance from the fulcrum.</p>${picLeverDims()}<div class="law">lever: mechanical advantage = (your hand to fulcrum) ÷ (rock to fulcrum)</div>` },
        { html: `<p>Once you know the mechanical advantage, you can work out the effort before you pull. In Part 1, the 294 N rock needed 73.5 N with this lever. That is the same number!</p>${picLeverDims({ calc: true })}<div class="law">effort = load ÷ mechanical advantage</div>` },
        { hi: '#cvScene', html: `<p>A winch is a wheel and axle. Its mechanical advantage is the handle radius divided by the axle radius. Use the same unit for both.</p>${picWinchDims()}<div class="law">winch: mechanical advantage = handle radius ÷ axle radius</div>` },
        { html: `<p>A ramp is the last one. Its mechanical advantage is the length of the ramp divided by its height.</p>${picRamp()}<div class="law">ramp: mechanical advantage = length ÷ height</div>` }],
      setup() { shopStage({ mach: 'winch', allow: ['winch', 'ramp'], R: 0.1, axle: 0.05, L: 2, h: 1, lift: 1.0, rampH: true, loads: { winch: WL.bucket, ramp: WL.cart } }); }, adds: ['wsmach', 'readMA'], hide: ['rulers'], sides: [], pullers: [], idle: 'Choose a machine, then press the button to lift',
      mask: [{ q: 'q1', keys: ['readE'], when: r => r.mach === 'winch' && r.R === 0.4 }, { q: 'q2', keys: ['readE'], when: r => r.mach === 'ramp' && r.L === 4 && r.h === 0.8 }],
      tasks: [['', () => hasAns('q1'), { q: 'q1' }], ['Check it: choose the <b>Wheel and axle</b>, set the handle radius to <b>0.4 m</b> and press <b>Turn!</b>', () => shopHas({ mach: 'winch', R: 0.4 })],
        ['', () => hasAns('q2'), { q: 'q2' }], ['Check it: choose the <b>Ramp</b>, set it <b>4 m</b> long and <b>0.8 m</b> high, and pull the cart.', () => shopHas({ mach: 'ramp', L: 4, h: 0.8 })]],
      qs: [
        { id: 'q1', type: 'num', p: 'A winch has a handle radius of 0.4 m and an axle radius of 0.05 m. It lifts the 196 N bucket. What effort should it need?', unit: 'N', units: UNITS_W, ans: 24.5, tol: 0.5, ladder: true, hints: ['Find the mechanical advantage first: handle radius ÷ axle radius.', '0.4 ÷ 0.05 = 8. Then effort = load ÷ mechanical advantage.', 'Type 196 ÷ 8 into the calculator.'], work: 'Mechanical advantage = 0.4 ÷ 0.05 = 8, so the effort is 196 ÷ 8 = 24.5 N.', ok: 'Yes, 24.5 N. Now check it with the newtonmeter.' },
        { id: 'q2', type: 'num', p: 'A ramp is 4 m long and 0.8 m high. What pull does the 490 N cart need?', unit: 'N', units: UNITS_W, ans: 98, tol: 0.5, ladder: true, hints: ['Find the mechanical advantage first: length of the ramp ÷ height.', '4 ÷ 0.8 = 5. Then effort = load ÷ mechanical advantage.', 'Type 490 ÷ 5 into the calculator.'], work: 'Mechanical advantage = 4 ÷ 0.8 = 5, so the pull is 490 ÷ 5 = 98 N.', ok: 'Yes, 98 N. Now check it with the newtonmeter.' },
        { id: 'q3', type: 'pick', p: 'To find the mechanical advantage of a pulley system, count the {0}. A ramp 6 m long and 1.5 m high has a mechanical advantage of {1}.', picks: [[['supporting ropes', 'pulley wheels', 'metres of rope'], 0], [['4', '9', '0.25'], 0]], after: 'A pulley system\'s mechanical advantage is its number of supporting ropes. The ramp is 6 ÷ 1.5 = 4.' }] },

    { id: 'u3', title: 'Work and the catch', rescue: 'The mission computer now checks the work for every plan.',
      cards: [
        { hi: '#cvScene', html: `<p>You know that a smaller effort means your hand moves further. In this step you will measure exactly how much further, and add it up like a scientist.</p>` },
        { html: `<p>When a force moves something, scientists say the force does ${T('work', 'work')}. You find it by multiplying the force by the distance.</p>${picWork()}<div class="law">work = force × distance</div>` },
        { html: `<p>Work is measured in ${T('joule', 'joules')}, written J. Lifting the 294 N crate 1 m takes 294 J.</p>${picWork({ unit: true })}` },
        { html: `<p>A machine has two ends. You put work in at your hand, and the machine does work on the load.</p>${picWorkInOut()}` }],
      predict: { q: 'A pulley system with 6 supporting ropes lifts the 294 N crate 2 m. How much rope will you pull?', opts: ['12 m of rope', '3 m of rope', '8 m of rope', '2 m of rope'], then: 'Lift the crate 2 m and measure the rope with the red ruler.' },
      setup() { shopStage({ mach: 'pulley', allow: ['pulley'], ropes: 6, lift: 1.0, lifts: { pick: true }, loads: { pulley: WL.crate30 }, lim: { ropesMax: 6 } }); }, adds: ['wsctl', 'wspull', 'readMA', 'readWork', 'rulers'], hide: ['wsmach'], sides: [], pullers: [], idle: 'Press Pull! to lift the crate',
      mask: [{ q: 'q2', keys: ['readWork'], when: r => r.mach === 'pulley' }, { q: 'q3', keys: ['readWork'], when: r => r.mach === 'pulley' }],
      tasks: [['Make your prediction in the box above.', () => predOf() != null], ['Choose a lift height of <b>2 m</b>, set <b>6</b> supporting ropes and lift the crate.', () => shopHas({ mach: 'pulley', ropes: 6, rise: 2 })], ['', () => hasAns('q1'), { q: 'q1' }], ['', () => hasAns('q2'), { q: 'q2' }], ['', () => hasAns('q3'), { q: 'q3' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'How much rope did you pull to lift the crate 2 m with 6 supporting ropes? Use the red ruler.', unit: 'm', tol: 0.05, live: () => shopDist({ mach: 'pulley', ropes: 6, rise: 2 }), need: () => shopHas({ mach: 'pulley', ropes: 6, rise: 2 }), needMsg: 'Lift the crate 2 m with 6 supporting ropes first.', ok: '12 m: six times the 2 m the crate rose. Your hand\'s distance = mechanical advantage × the load\'s distance.' },
        { id: 'q2', type: 'num', p: 'Your effort was 49 N, and you pulled 12 m of rope. How much work did you put in? (Force × distance.)', unit: 'J', units: UNITS_W, ans: 588, tol: 1, ladder: true, hints: ['Work = force × distance.', 'The force is your effort, 49 N, and the distance is the rope you pulled, 12 m.', 'Type 49 × 12 into the calculator.'], work: 'Work in = 49 × 12 = 588 J.', ok: 'Yes, 588 J of work in.' },
        { id: 'q3', type: 'num', p: 'The 294 N crate rose 2 m. How much work did the machine do on the crate?', unit: 'J', units: UNITS_W, ans: 588, tol: 1, ladder: true, hints: ['Work = force × distance.', 'Use the load, 294 N, and the height it rose, 2 m.', 'Type 294 × 2 into the calculator.'], work: 'Work out = 294 × 2 = 588 J, exactly the same as the work in.', ok: 'Yes, 588 J. That is exactly the same as the work in. The work readouts now show.' },
        { id: 'q4', type: 'tap', p: '<b>Key idea.</b> Tap the sentence that is true for a perfect machine.', opts: ['The work in equals the work out, spread over a longer distance', 'The work in is smaller than the work out, so the machine saves work', 'The work in is bigger than the work out, so the machine makes force', 'The work in and the work out are both zero, because nothing is wasted'], a: 0, ok: 'Yes! A machine spreads the same work over a longer distance, so the force can be smaller.', why: { 1: 'A machine cannot give out more work than you put in.', 2: 'Machines do not make force from nothing: a smaller force moves further.', 3: 'Both were 588 J, not zero.' } }] },

    /* ================= Part 4: Compound machines (c6d) =================
       Pitched against script section A2 (3 Nov 2026): one new word per card, a labelled picture for each new idea, pictured familiar machines only (scissors, a building-site crane). */
    { id: 'k1', title: 'Machines inside machines', rescue: 'Compound machines spotted. Time to build one!',
      cards: [
        { html: `<p>📡 ${SMOOSHY.name}: "Even the best single machine can't lift the Gumdrop with my 60 N. We need teamwork!"</p><p>A ${T('compound', 'compound machine')} is two or more simple machines working together. Scissors are one: two levers joined at a pivot, with a wedge on each blade.</p>${picScissors()}` },
        { html: `<p>A building-site crane is a compound machine too. A winch winds in the cable, and the cable runs through a pulley block. The arm is a lever.</p>${picSiteCrane()}` },
        { html: `<p>When one machine drives another, their mechanical advantages <b>multiply</b>. A machine with a mechanical advantage of 2 driving a machine with a mechanical advantage of 3 gives a total of 2 × 3 = 6.</p>${picCompoundChain(2, 3)}<div class="law">total mechanical advantage = MA₁ × MA₂</div>` }],
      setup() { shopStage({ mach: 'build', allow: ['build'], lift: 2, loads: { build: WL.engineb } }); }, adds: [], hide: ['wsctl', 'wspull', 'builder', 'rulers', 'wsmach'], sides: [], pullers: [], idle: 'Read the cards, then answer the questions',
      tasks: [['', () => hasAns('q1'), { q: 'q1' }], ['', () => hasAns('q2'), { q: 'q2' }]],
      qs: [
        { id: 'q1', type: 'pick', p: 'Scissors are two {0} joined at a pivot, and each blade is a {1}. A crane\'s winch is a {2}.', picks: [[['levers', 'pulleys', 'ramps'], 0], [['wedge', 'screw', 'pulley'], 0], [['wheel and axle', 'wedge', 'lever'], 0]], after: 'A compound machine is simple machines working together.' },
        { id: 'q2', type: 'tick', p: 'Tick every compound machine.', opts: ['A pair of scissors', 'A building-site crane', 'A crowbar', 'A ramp', 'A flagpole', 'A screwdriver'], a: [0, 1], ok: 'Yes! A crowbar is a lever, a ramp is an inclined plane, a flagpole has one pulley and a screwdriver is a wheel and axle: each is a single simple machine.' }] },

    { id: 'k2', title: 'Build a crane', rescue: 'Crane design tested. Smooshy is impressed.',
      cards: [
        { hi: '[data-panel="builder"]', html: `<p>The Workshop crane has two simple machines. You turn the ${T('winch', 'winch')} handle, and the winch winds in the rope of a pulley block. The winch makes your force bigger, then the pulley block makes it bigger again.</p>` },
        { html: `<p>To find the total mechanical advantage, multiply. Here is a worked example with different numbers: a winch of ×2 and a pulley block with 2 supporting ropes give 2 × 2 = 4. A 400 N load needs an effort of 400 ÷ 4 = 100 N.</p>${picCompoundChain(2, 2)}` }],
      predict: { q: 'A winch with a mechanical advantage of 4 drives a pulley block with 3 supporting ropes. What is the total mechanical advantage?', opts: ['12, because the advantages multiply', '7, because the advantages add up', '4, because only the biggest one counts', '3, because the last machine decides'], then: 'Set up the crane and check with the newtonmeter.' },
      setup() { shopStage({ mach: 'build', allow: ['build'], lift: 2, loads: { build: WL.engineb }, bRoutes: [[0, 'Straight up']] }); }, adds: ['builder', 'wspull', 'rulers', 'bTotMA', 'bTravel', 'readMA'], hide: ['wsctl', 'wsmach', 'bCable'], sides: [], pullers: [], idle: 'Choose a winch and a pulley block, then press Turn!',
      mask: [{ q: 'q2', keys: ['readE', 'readMA', 'bTotMA'], when: r => r.mach === 'build' && r.bw === 6 && r.bn === 4 }],
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Set the winch to <b>×4</b> and use <b>3</b> supporting ropes. Press <b>Turn!</b> to lift the 1,176 N engine block.', () => shopHas({ mach: 'build', bw: 4, bn: 3 })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['', () => hasAns('q2'), { q: 'q2' }],
        ['Check it: set the winch to <b>×6</b> with <b>4</b> supporting ropes and turn the handle.', () => shopHas({ mach: 'build', bw: 6, bn: 4 })], ['', () => hasAns('q3'), { q: 'q3' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With the winch at ×4 and 3 supporting ropes, what effort lifted the 1,176 N engine block?', unit: 'N', tol: 0.5, live: () => shopE({ mach: 'build', bw: 4, bn: 3 }), need: () => shopHas({ mach: 'build', bw: 4, bn: 3 }), needMsg: 'Lift the engine block with the winch at ×4 and 3 supporting ropes first. Your runs are in the Journal.', ok: '98 N: twelve times smaller than the load, just as 4 × 3 predicted.' },
        { id: 'q2', type: 'num', p: 'With the winch at ×6 and 4 supporting ropes, what effort should lift the 1,176 N engine block?', unit: 'N', units: UNITS_W, ans: 49, tol: 0.5, ladder: true, hints: ['Multiply the two mechanical advantages to get the total.', '6 × 4 = 24. Then effort = load ÷ total mechanical advantage.', 'Type 1176 ÷ 24 into the calculator.'], work: 'Total mechanical advantage = 6 × 4 = 24, so the effort is 1,176 ÷ 24 = 49 N.', ok: 'Yes, 49 N. Now check it with the newtonmeter.' },
        { id: 'q3', type: 'pick', p: 'With a total mechanical advantage of 24, the engine block rose 2 m, so your hand moved {0} on the handle. The work you did was {1} the work done on the block.', picks: [[['2 m', '24 m', '48 m'], 2], [['less than', 'equal to', 'more than'], 1]], after: '24 × 2 = 48 m. The catch is the same as ever: less force, more distance, and the same work.' }] },

    { id: 'k3', title: 'The machine builder', rescue: 'Machine builder unlocked. The crane kit is almost ready!',
      cards: [
        { hi: '[data-panel="builder"]', html: `<p>Welcome to the <b>machine builder</b>! Choose up to three machines: a winch, a pulley block and a route for the load. Your pull goes in at the winch, and each machine drives the next one. The builder shows how much cable each set-up needs and how far your hand has to travel.</p>` },
        { html: `<p>Remember the catch: every extra bit of mechanical advantage means a longer pull. Real rescues have limits, such as only so much cable and only so much time. Your job is to build a machine that is strong enough, without being so slow that it takes forever.</p>${picCompoundChain(3, 4)}` }],
      setup() { shopStage({ mach: 'build', allow: ['build'], lift: 2, loads: { build: WL.gen }, bRoutes: [[0, 'Straight up'], [6, '6 m ramp']] }); }, adds: ['builder', 'wspull', 'rulers', 'bTotMA', 'bCable', 'bTravel', 'readMA'], hide: ['wsctl', 'wsmach'], sides: [], pullers: [], idle: 'Build your machine, then press Turn!',
      mask: [{ q: 'q1', keys: ['bTotMA', 'readMA'], when: r => r.mach === 'build' && r.bw === 4 && r.bn === 2 && r.br === 6 }, { q: 'q2', keys: ['bTravel'], when: r => r.mach === 'build' && r.bw === 4 && r.bn === 2 && r.br === 6 }],
      tasks: [['Build <b>winch ×4</b>, <b>2 supporting ropes</b> and the <b>6 m ramp</b>. The 240 kg generator (2,352 N) rises 2 m up the ramp.', () => S.flags.k3built || (WS.mach === 'build' && WS.bw === 4 && WS.bn === 2 && WS.br === 6 && (S.flags.k3built = true))], ['', () => hasAns('q1'), { q: 'q1' }],
        ['Turn the handle and watch the generator roll up the ramp.', () => shopHas({ mach: 'build', bw: 4, bn: 2, br: 6 })], ['', () => hasAns('q2'), { q: 'q2' }], ['', () => hasAns('q3'), { q: 'q3' }]],
      qs: [
        { id: 'q1', type: 'num', p: 'Your machine has a winch ×4, a pulley block with 2 supporting ropes and a ramp 6 m long that rises 2 m. What is its total mechanical advantage?', unit: '', ans: 24, tol: 0.05, ladder: true, hints: ['Find each machine\'s mechanical advantage. The ramp\'s is length ÷ height.', 'The ramp: 6 ÷ 2 = 3. The pulley block: 2. The winch: 4.', 'Multiply: 4 × 2 × 3.'], work: 'Ramp = 6 ÷ 2 = 3. Total = 4 × 2 × 3 = 24. There is no unit.', ok: 'Yes, 24. The total mechanical advantage readout now shows.' },
        { id: 'q2', type: 'num', p: 'The generator rose 2 m. How far did your hand travel on the winch handle?', unit: 'm', units: UNITS_W, ans: 48, tol: 0.5, ladder: true, hints: ['Your hand\'s distance = total mechanical advantage × the load\'s distance.', 'The total mechanical advantage is 24, and the load rose 2 m.', 'Type 24 × 2 into the calculator.'], work: 'Your hand moved 24 × 2 = 48 m.', ok: 'Yes, 48 m. The hand travel readout now shows.' },
        { id: 'q3', type: 'fix', p: 'Leo works out the effort for his compound machine. One line has a mistake. Tap it, then correct the answer.', who: 'Leo',
          lines: ['Pulley block: mechanical advantage = 4', 'Winch: mechanical advantage = 5', 'Total mechanical advantage = 4 + 5 = 9', 'Effort = 1,800 ÷ 9 = 200 N'], bad: 2,
          fix: { kind: 'num', ask: 'What effort does his machine really need for the 1,800 N load?', ans: 90, unit: 'N', units: UNITS_W, tol: 0.5 },
          why: 'Mechanical advantages multiply: 4 × 5 = 20, so the effort is 1,800 ÷ 20 = 90 N.' }] },

    /* ================= Part 5: Rescue Captain Smooshy! (c6e) ================= */
    { id: 'v1', title: 'Landing on Glimmer-9', rescue: 'Landed on Glimmer-9. Rescue plan loaded!',
      cards: [
        { hi: '#cvScene', html: `<p>Welcome to Gummy Mission Control! 🛰️ This is <b>Planet Glimmer-9</b>. The Gumdrop has crashed at the bottom of a <b>15 m</b> deep crater, and a boulder is stuck against its landing leg. Captain Smooshy is safe inside. Let's get him home!</p>` },
        { html: `<p>Here's the plan. The <b>Big Jelly</b> is a huge repair ship. It can't land close to the crater, so it waits nearby. Its <b>tractor beam</b> can lift the Gumdrop once the ship reaches the top of the crater. Smooshy will climb out and work each machine you build. When the Gumdrop reaches the top, he climbs back in and the beam carries the ship home.</p>${picCraterPlan()}` },
        { html: `<p>Gravity on Glimmer-9 is weaker than on Earth: ${T('gfs', 'g')} = <b>4.2 N/kg</b>. The ship is still far too heavy for a 60 N gummy bear, so you'll need machines. 💎 ${T('sugarcrystal', 'Sugar crystals')} are gummy money, and you have <b>475</b> to spend on machines, platforms and dynamite. Smooshy has enough oxygen for <b>1,500 m</b> of pulling. This mission takes two homework sessions: build and test a route in the first, then improve it in the second.</p>` }],
      setup() { shopStage({ mach: 'build', allow: ['build'], lift: 15, loads: { build: WL.gumdrop }, site: 'mission', cap: 60, bRoutes: [[0, 'Straight up'], [30, 'Steep track'], [45, 'Medium track'], [75, 'Gentle track']] }); }, adds: [], hide: ['wsctl', 'wspull', 'builder', 'rulers', 'wsmach'], sides: [], pullers: [], idle: 'Smooshy is waiting in the Gumdrop. Answer the questions to get ready',
      tasks: [['', () => hasAns('q1'), { q: 'q1' }], ['', () => hasAns('q2'), { q: 'q2' }], ['', () => hasAns('q3'), { q: 'q3' }]],
      qs: [
        { id: 'q1', type: 'num', p: 'The Gumdrop has a mass of 1,500 kg. On Glimmer-9, g = 4.2 N/kg. What does the Gumdrop weigh there?', unit: 'N', units: UNITS_W, ans: 6300, tol: 1, ladder: true, hints: ['Weight = mass × g.', 'Use the mass, 1,500 kg, and Glimmer-9\'s g, 4.2 N/kg.', 'Type 1500 × 4.2 into the calculator.'], work: 'Weight = 1,500 × 4.2 = 6,300 N.', ok: 'Yes, 6,300 N.' },
        { id: 'q2', type: 'num', p: 'Smooshy can pull with 60 N. What mechanical advantage would he need to lift the 6,300 N Gumdrop straight up?', unit: '', ans: 105, tol: 0.5, ladder: true, hints: ['Mechanical advantage = load ÷ effort.', 'The load is 6,300 N and the effort is 60 N.', 'Type 6300 ÷ 60 into the calculator.'], work: 'Mechanical advantage = 6,300 ÷ 60 = 105. No single Workshop machine comes close, so the rescue route needs several machines working together.', ok: 'Yes, 105. No single machine reaches that, so the rescue route needs several machines working together.' },
        { id: 'q3', type: 'pick', p: 'If the Gumdrop had crashed on Earth instead, its mass would be {0} and its weight would be {1}.', picks: [[['smaller', 'the same', 'bigger'], 1], [['smaller', 'the same', 'bigger'], 2]], after: 'On Earth it would weigh 1,500 × 9.8 = 14,700 N, so the rescue would need an even bigger mechanical advantage. Lucky Smooshy!' }] },

    /* ================= Extension: Real machines waste energy (c6f) ================= */
    { id: 'p5a', title: 'Real machines get warm', rescue: 'The colonists\' first machine is tested. Time to find the most efficient ones.',
      cards: [
        { html: `<p>📡 ${SMOOSHY.name}: "Big news! The glittering crystals on Glimmer-9 are pure sugar. It's gummy paradise!"</p><p>Thousands of gummy colonists are on their way to ${T('terraform', 'terraform')} Glimmer-9 and make it their new home, and they've asked Force HQ to help build <b>${SMOOSHY.base}</b>. There's just one problem: real machines aren't perfect.</p>` },
        { html: `<p>In a real machine, wheels rub on axles and ropes rub on wheels, and Glimmer-9's sugar dust gets into everything. That ${T('friction', 'friction')} turns some of the work you put in into heat, so the work in is bigger than the useful work out. The difference is ${T('wasted', 'wasted energy')}.</p>${picEff()}` },
        { html: `<p>Engineers measure this with ${T('efficiency', 'efficiency')}: how much of the work in comes out as useful work.</p>${picEff({ calc: true })}<div class="law">efficiency = useful work out ÷ work in × 100%</div><p>Here, 1,200 ÷ 1,500 × 100% = <b>80%</b>.</p>` }],
      predict: { q: 'You switch the pulley system from Perfect to Real and lift the tank 2 m again. How much rope will you pull?', opts: ['The same 8 m, because each rope still shortens by 2 m', 'More than 8 m, because friction drags on the rope', 'Less than 8 m, because friction helps hold the tank up', 'It depends on how hard you pull on the rope'], then: 'Lift the tank with the Perfect machine, then with the Real one, and compare the newtonmeter and the ruler.' },
      setup() { shopStage({ mach: 'pulley', allow: ['pulley'], ropes: 4, lift: 2, loads: { pulley: WL.tank600 }, site: 'base', real: false, lim: { ropesMax: 4 } }); }, adds: ['wsctl', 'wspull', 'mfric', 'readWork', 'readEff', 'rulers'], hide: ['wsmach'], sides: [], pullers: [], idle: 'Press Pull! to lift the water tank',
      mask: [{ q: 'q2', keys: ['readWork'], when: r => r.mach === 'pulley' && r.real }, { q: 'q3', keys: ['readEff'], when: r => r.mach === 'pulley' && r.real }],
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Lift the 600 N tank 2 m with the <b>Perfect</b> machine (4 supporting ropes).', () => shopHas({ mach: 'pulley', ropes: 4, load: 600, real: false })],
        ['Switch to <b>Real</b> and lift it again. Watch the wheels.', () => shopHas({ mach: 'pulley', ropes: 4, load: 600, real: true })], ['', () => hasAns('q1'), { q: 'q1' }], ['', () => hasAns('q2'), { q: 'q2' }], ['', () => hasAns('q3'), { q: 'q3' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With the Real machine, what effort lifted the 600 N tank?', unit: 'N', tol: 0.5, live: () => shopE({ mach: 'pulley', ropes: 4, real: true, load: 600 }), need: () => shopHas({ mach: 'pulley', ropes: 4, real: true, load: 600 }), needMsg: 'Lift the tank with the Real machine first. Your runs are in the Journal.', ok: '187.5 N, more than the 150 N the Perfect machine needed. Friction made the job harder.' },
        { id: 'q2', type: 'num', p: 'With the Real machine, your effort of 187.5 N pulled 8 m of rope. How much work did you put in?', unit: 'J', units: UNITS_W, ans: 1500, tol: 1, ladder: true, hints: ['Work = force × distance.', 'Use your effort, 187.5 N, and the rope you pulled, 8 m.', 'Type 187.5 × 8 into the calculator.'], work: 'Work in = 187.5 × 8 = 1,500 J.', ok: 'Yes, 1,500 J. The work readouts now show.' },
        { id: 'q3', type: 'num', p: 'The 600 N tank rose 2 m, so the useful work out was 1,200 J. What is the efficiency of the Real pulley system?', unit: '%', ans: 80, tol: 0.5, ladder: true, hints: ['Efficiency = useful work out ÷ work in × 100%.', '1,200 ÷ 1,500 = 0.8.', 'Multiply by 100 to get a percentage.'], work: '1,200 ÷ 1,500 × 100% = 80%. The other 300 J became heat in the wheels.', ok: 'Yes, 80%. The other 300 J became heat in the wheels.' },
        { id: 'q4', type: 'pick', p: 'Friction made the effort {0}, the length of rope pulled {1}, and the wasted energy turned into {2}.', picks: [[['smaller', 'the same', 'bigger'], 2], [['shorter', 'the same', 'longer'], 1], [['heat', 'extra weight', 'more rope'], 0]] }] },

    { id: 'p5b', title: 'Which machines waste the least?', rescue: 'The colonists know which machines waste the least. Let\'s build the base!',
      cards: [
        { html: `<p>Every rubbing surface wastes a little energy. A pulley system with more supporting ropes has more wheels, so it has a bigger mechanical advantage but a lower efficiency. Engineers choose a machine that is strong enough and wastes as little as possible.</p>${picEff()}` },
        { html: `<p>A screw jack wastes most of the work you put in, but all that friction is useful: it stops the load sinking back down when you let go of the handle. Oil and grease, called ${T('lubricant', 'lubricants')}, cut friction where it isn't wanted.</p>${picLube()}` }],
      setup() { shopStage({ mach: 'pulley', allow: ['pulley', 'winch', 'screw'], ropes: 2, R: 0.25, axle: 0.05, per: 120, pitch: 1.0, lift: 2, lifts: { pulley: 2, winch: 2, screw: 0.2 }, loads: { pulley: WL.tank600, winch: WL.tank600, screw: WL.pod }, site: 'base', real: true, lim: { ropesMax: 4 } }); }, adds: ['wsctl', 'wspull', 'wsmach', 'readWork', 'readEff'], hide: ['mfric', 'rulers'], sides: [], pullers: [], idle: 'Press the button to lift the load',
      mask: [{ q: 'q1', keys: ['readEff'], when: r => r.mach === 'pulley' && r.ropes === 2 && r.real }],
      tasks: [['Lift the tank with <b>2</b> supporting ropes (Real machine).', () => shopHas({ mach: 'pulley', ropes: 2, real: true, load: 600 })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['Lift the tank with the <b>winch</b> (handle 0.25 m), then lift the supply pod with the <b>screw jack</b>. Compare the efficiency readouts.', () => shopHas({ mach: 'winch', R: 0.25, real: true }) && shopHas({ mach: 'screw', real: true })], ['', () => hasAns('q2'), { q: 'q2' }], ['', () => hasAns('q3'), { q: 'q3' }]],
      qs: [
        { id: 'q1', type: 'num', p: 'With 2 supporting ropes, your effort was 333.3 N and you pulled 4 m of rope to lift the 600 N tank 2 m. What is the efficiency?', unit: '%', ans: 90, tol: 0.5, ladder: true, hints: ['Work in = 333.3 × 4. Useful work out = 600 × 2.', 'That is about 1,333 J in and 1,200 J out.', 'Type 1200 ÷ 1333 × 100 into the calculator.'], work: '1,200 ÷ 1,333 × 100% = 90%. Fewer wheels, less friction.', ok: 'Yes, 90%. Fewer wheels, less friction.' },
        { id: 'q2', type: 'pick', p: 'Compared with 2 supporting ropes, 4 supporting ropes gave a {0} mechanical advantage and a {1} efficiency.', picks: [[['smaller', 'the same', 'bigger'], 2], [['lower', 'the same', 'higher'], 0]] },
        { id: 'q3', type: 'reason', sure: true, p: 'The screw jack was only 30% efficient. Four colonists argue about it. Who is right?', opts: ['Mia: "It\'s useless. We should throw it away."', 'Leo: "It\'s the most efficient machine, because the effort was so small."', 'Ana: "Its friction is useful: the pod stays up when you let go of the handle."', 'Sam: "It wastes energy because the supply pod is too heavy for it."'], a: 2,
          reasons: ['Friction in the thread stops the screw turning backwards under the load', 'A small effort always means a high efficiency', 'Heavy loads always make a machine less efficient', 'A machine that wastes energy can never be worth using'], r: 0,
          why: { a: { 0: 'It still lifts the pod with a tiny effort, and it holds it safely.', 1: 'A small effort comes from the big mechanical advantage. Efficiency is about wasted work.', 3: 'In the Workshop, the efficiency is the same for any load.' }, r: { 1: 'A small effort comes from a big mechanical advantage, not from a high efficiency.', 2: 'In the Workshop, the efficiency does not depend on the load.', 3: 'A screw jack wastes energy and is still very useful.' } } }] }
  ],
  review: [
    /* ---------- Part 1 Check (levers) ---------- */
    { id: 'c6r1', obj: ['Ai'], type: 'pick', p: `<p>Label the parts of this lever.</p>${picLever({ flip: true, letters: { F: 'C', L: 'A', E: 'B' } })}<p>A is the {0}, B is the {1} and C is the {2}.</p>`, picks: [[['fulcrum', 'load', 'effort'], 1], [['fulcrum', 'load', 'effort'], 2], [['fulcrum', 'load', 'effort'], 0]] },
    { id: 'c6r2', obj: ['Aii'], type: 'reason', sure: true, p: 'Mia uses a plank resting on a brick to lift a heavy box. The brick is the fulcrum. She moves the brick closer to her hand. What happens to the effort she needs?',
      opts: ['It gets bigger', 'It gets smaller', 'It stays the same', 'It drops to zero'], a: 0,
      reasons: ['Her side of the plank gets shorter and the box\'s side gets longer', 'Her hand is closer to the brick, so the plank is easier to push', 'The box gets heavier when the brick moves towards her', 'The brick now holds up more of the box\'s weight for her'], r: 0,
      why: { a: { 1: 'Moving the fulcrum towards her hand makes her side of the plank shorter, so the lever helps less.', 2: 'The box\'s weight stays the same, but the lever helps less.', 3: 'She still has to lift the box.' }, r: { 1: 'A short side for her hand makes the plank harder to push, not easier.', 2: 'The box\'s weight is mass × g, so it never changes.', 3: 'The fulcrum only gives the plank something to turn on.' } } },
    { id: 'c6r3', obj: ['Aii'], type: 'mcq', p: `<p>Which class of lever is this?</p>${picLever({ mid: 'L' })}`, opts: ['Class 1', 'Class 2', 'Class 3', 'It isn\'t a lever'], a: 1, why: { 0: 'Class 1 has the fulcrum in the middle.', 2: 'Class 3 has the effort in the middle.', 3: 'It has a bar, a fulcrum, a load and an effort, so it is a lever.' } },
    { id: 'c6r4', obj: ['Aiii'], type: 'fix', p: 'Leo explains how he used a lever. One line has a mistake. Tap it, then choose the correct line.', who: 'Leo',
      lines: ['Leo put the fulcrum close to the rock.', 'That made his side of the bar much longer.', 'So he needed a smaller effort to lift the rock.', 'And his hand moved a shorter distance than before.'], bad: 3,
      fix: { kind: 'mcq', opts: ['And his hand moved a longer distance than before', 'And the rock rose a longer distance than before', 'And his hand did not need to move at all', 'And the rock became lighter than before'], a: 0 },
      why: 'That\'s the catch: a smaller effort always needs a bigger distance. His hand moved further, not less far.' },
    { id: 'c6r5', obj: ['Aii'], type: 'explain', p: 'Captain Smooshy needs to lift a heavy boulder off his spaceship\'s leg. He has a long bar and a small rock to use as the fulcrum, and he can only pull with 60 N. Explain where he should put the fulcrum, and what the catch is.', words: ['fulcrum', 'effort', 'load', 'distance'],
      model: 'He should put the fulcrum close to the boulder, so his side of the bar is long. That makes the effort much smaller than the weight of the boulder (the load), so his 60 N pull can lift it. The catch is distance: his end of the bar has to move a long way to lift the boulder only a little.',
      check: ['Says the fulcrum should go close to the boulder (the load), so his side of the bar is long', 'Says this makes the effort smaller than the load', 'Says the catch: his hand has to move further than the boulder rises'] },
    /* ---------- Part 2 Check (pulleys, wheels and ramps) ---------- */
    { id: 'c6r7', obj: ['Ai'], type: 'match', colA: 'Everyday object', p: 'Match each everyday object to its simple machine.', rows: [['Flagpole', 'Pulley'], ['Screwdriver', 'Wheel and axle'], ['Wheelchair ramp', 'Ramp (inclined plane)'], ['Doorstop', 'Wedge'], ['Jar lid', 'Screw'], ['Seesaw', 'Lever']] },
    { id: 'c6r8', obj: ['Aii'], type: 'pick', p: 'A crane lifts a load with 4 supporting ropes. Compared with lifting the load straight up, the effort is {0} and the rope pulled is {1}.', picks: [[['four times bigger', 'the same', 'a quarter as big'], 2], [['a quarter as long', 'the same length', 'four times longer'], 2]] },
    { id: 'c6r9', obj: ['Aiii'], type: 'fix', p: 'Leo explains ramps. One line has a mistake. Tap it, then choose the correct line.', who: 'Leo',
      lines: ['Ana needs to get a heavy box onto a 1 m high stage.', 'She could pull it up a long ramp or a short, steep ramp.', 'The long ramp needs a smaller pull, but she pulls it further.', 'A steeper ramp would need a smaller pull, because it is shorter.'], bad: 3,
      fix: { kind: 'mcq', opts: ['A steeper ramp would need a bigger pull, but over a shorter distance', 'A steeper ramp would need the same pull, because the box weighs the same', 'A steeper ramp would need no pull at all, because the box slides down', 'A steeper ramp would need a smaller pull, because the box rises faster'], a: 0 },
      why: 'A shorter ramp to the same height needs a bigger pull, but the box travels a shorter distance.' },
    { id: 'c6r10', obj: ['Aii'], type: 'reason', sure: true, p: 'Ana swaps the handle on her winch for a longer one. What happens to the effort she needs to lift the same bucket?',
      opts: ['It gets smaller', 'It gets bigger', 'It stays the same', 'It drops to zero'], a: 0,
      reasons: ['Her hand moves round a bigger circle, so a smaller force does the same job', 'A longer handle is heavier, so its weight helps to turn the axle', 'The axle gets bigger, so the rope winds in much faster', 'The bucket gets lighter when the handle is longer'], r: 0,
      why: { a: { 1: 'A longer handle makes the job easier, not harder.', 2: 'In the Workshop, the longer handle needed a much smaller effort.', 3: 'She still has to lift the bucket.' }, r: { 1: 'Workshop handles weigh nothing: the help comes from the bigger circle.', 2: 'The axle stays the same size.', 3: 'The bucket\'s weight never changes.' } } },
    { id: 'c6r11', obj: ['Aii'], type: 'explain', p: 'Captain Smooshy wants to split a block of space ice with a wedge. Explain how a wedge works, and which shape of wedge he should choose.', words: ['wedge', 'force', 'thin', 'distance'],
      model: 'A wedge is two ramps back to back. When Smooshy pushes the wedge into the ice, its sloping sides push the two halves apart with a much bigger force than his push. He should choose a long, thin wedge, because it needs the smallest push. The catch is that he has to push it further into the ice.',
      check: ['Says the sloping sides push the ice apart with a bigger force than the push', 'Says a long, thin wedge needs a smaller push than a short, fat one', 'Says the smaller push has to move further (the catch)'] },
    /* ---------- Part 3 Check (mechanical advantage and work) ---------- */
    { id: 'c6r12', obj: ['Aii'], type: 'num', p: 'A car jack lifts a 4,500 N car with an effort of 18 N. What is its mechanical advantage?', unit: '', ans: 250, tol: 0.5, ladder: true, hints: ['Mechanical advantage = load ÷ effort.', 'Type 4500 ÷ 18 into the calculator.', 'Mechanical advantage has no unit.'], work: 'Mechanical advantage = 4,500 ÷ 18 = 250. There is no unit.' },
    { id: 'c6r13', obj: ['Aiii'], type: 'fix', p: 'Leo works out the work done pulling a sled. One line has a mistake. Tap it, then correct the answer.', who: 'Leo',
      lines: ['The pull on the sled is 120 N.', 'The sled moves 15 m.', 'Work = force ÷ distance', 'Work = 120 ÷ 15 = 8 J'], bad: 2,
      fix: { kind: 'num', ask: 'What is the correct work done?', ans: 1800, unit: 'J', units: UNITS_W, tol: 1 },
      why: 'Work = force × distance, so the work is 120 × 15 = 1,800 J.' },
    { id: 'c6r14', obj: ['Aii'], type: 'reason', sure: true, p: 'A worker gets a crate onto a truck by pushing it up a long ramp instead of lifting it straight up. Ignoring friction, how does the work she does compare?',
      opts: ['The work is the same either way', 'The ramp means she does less work', 'The ramp means she does more work', 'The ramp means she does no work at all'], a: 0,
      reasons: ['She pushes with a smaller force over a longer distance, so force × distance is the same', 'Her push is smaller, so force × distance must be smaller as well', 'She moves the crate further, so force × distance must be bigger', 'The ramp holds up the crate, so she is not raising it at all'], r: 0,
      why: { a: { 1: 'Her push is smaller, but she pushes it further. The two changes cancel out.', 2: 'The ramp does not add any work. It spreads the same work over a longer distance.', 3: 'She still raises the crate to the height of the truck.' }, r: { 1: 'A smaller force alone does not make the work smaller: the distance is longer too.', 2: 'A longer distance alone does not make the work bigger: the force is smaller too.', 3: 'The crate rises to the truck, so work is done on it.' } } },
    { id: 'c6r15', obj: ['Aii'], type: 'num', p: 'A winch has a handle radius of 0.36 m and an axle radius of 0.04 m. What effort lifts a 540 N bucket?', unit: 'N', units: UNITS_W, ans: 60, tol: 0.5, ladder: true, hints: ['Find the mechanical advantage first: handle radius ÷ axle radius.', '0.36 ÷ 0.04 = 9. Then effort = load ÷ mechanical advantage.', 'Type 540 ÷ 9 into the calculator.'], work: 'Mechanical advantage = 9, so the effort is 540 ÷ 9 = 60 N. Just right for Smooshy!' },
    { id: 'c6r16', obj: ['Aii'], type: 'pick', p: 'A pulley system with 5 supporting ropes lifts a 650 N load 3 m. The effort is {0} and the rope pulled is {1}.', picks: [[['130 N', '650 N', '3,250 N'], 0], [['0.6 m', '3 m', '15 m'], 2]] },
    { id: 'c6r17', obj: ['Aii'], type: 'explain', p: 'Captain Smooshy can only pull with 60 N, but he needs to lift a 600 N oxygen tank 2 m. Explain how a pulley system could help him, and what the catch is.', words: ['mechanical advantage', 'effort', 'supporting ropes', 'distance', 'work'],
      model: 'He needs a mechanical advantage of 600 ÷ 60 = 10. The supporting ropes share the tank\'s weight, so with 10 supporting ropes his effort is 10 times smaller than the load, 60 N. The catch is that he has to pull 10 times as much rope as the height the tank rises: 20 m of rope for a 2 m lift. The work he does stays the same: 60 × 20 = 600 × 2 = 1,200 J.',
      check: ['Works out the mechanical advantage needed (600 ÷ 60 = 10)', 'Says the supporting ropes share the load, so the effort is smaller', 'Says he must pull a longer distance of rope (10 times the height, 20 m)', 'Says the work stays the same (force × distance)'] },
    /* ---------- Part 4 Check (compound machines) ---------- */
    { id: 'c6r18', obj: ['Ai'], type: 'sort', p: 'Is each of these a simple machine or a compound machine? Sort them.', groups: ['Simple machine', 'Compound machine'], items: [['A crowbar', 0], ['A ramp', 0], ['A doorstop', 0], ['A single flagpole pulley', 0], ['A pair of scissors', 1], ['A building-site crane', 1], ['A bicycle', 1], ['A car jack with a handle', 1]] },
    { id: 'c6r19', obj: ['Aii'], type: 'num', p: 'A winch with a mechanical advantage of 6 drives a pulley system with 3 supporting ropes. What effort lifts a 2,700 N load?', unit: 'N', units: UNITS_W, ans: 150, tol: 0.5, ladder: true, hints: ['Total mechanical advantage = 6 × 3.', 'That is 18. Then effort = load ÷ total mechanical advantage.', 'Type 2700 ÷ 18 into the calculator.'], work: 'Total mechanical advantage = 6 × 3 = 18, so the effort is 2,700 ÷ 18 = 150 N.' },
    { id: 'c6r20', obj: ['Aii'], type: 'reason', sure: true, p: 'Two machines, each with a mechanical advantage of 5, are joined so the first one drives the second. What is the total mechanical advantage?',
      opts: ['25', '10', '5', '2.5'], a: 0,
      reasons: ['The second machine multiplies a force the first machine has already made bigger', 'Each machine adds its own advantage on top of the other one', 'Only the stronger of the two machines sets the advantage', 'The force is shared between two machines, so the advantage halves'], r: 0,
      why: { a: { 1: 'Mechanical advantages multiply, not add: 5 + 5 would be 10.', 2: 'Both machines count, and they multiply.', 3: 'Joining machines never makes the advantage smaller.' }, r: { 1: 'Adding would give 10, but the second machine acts on a force that is already bigger.', 2: 'Both machines count.', 3: 'Joining machines does not share the force out and halve it.' } } },
    { id: 'c6r21', obj: ['Ai'], type: 'order', p: 'Put the steps of a crane lift in order, from Smooshy\'s hand to the load.', first: 'Smooshy turns the handle', last: 'The load rises',
      items: ['The handle turns the winch\'s axle', 'The axle winds in the cable with a bigger force', 'The cable pulls on the pulley block', 'The supporting ropes share the load and lift it'] },
    { id: 'c6r22', obj: ['Aii'], type: 'explain', p: 'A crane uses a winch and a pulley system to lift a heavy steel beam. Explain how the two machines together let a small effort lift the beam, and why the operator has to turn the handle so many times.', words: ['compound machine', 'mechanical advantage', 'multiply', 'distance'],
      model: 'The winch and the pulley system are two simple machines working together, so the crane is a compound machine. The winch makes the effort bigger, then the pulleys make it bigger again, so the total mechanical advantage is the two mechanical advantages multiplied together. That makes the effort much smaller than the beam\'s weight. The catch is distance: the operator\'s hand moves the total mechanical advantage times the height the beam rises, so the handle has to turn many times.',
      check: ['Says the crane is a compound machine (two simple machines working together)', 'Says the total mechanical advantage is the two multiplied, so the effort is much smaller than the load', 'Says the hand must move much further than the beam rises (mechanical advantage × the load\'s distance)'] },
    /* ---------- Part 5 Check: Mission debrief ---------- */
    { id: 'c6r23', obj: ['Aii', 'Di', 'Diii'], type: 'explain', p: 'Real rescue teams use compound machines too. A tow truck pulls a car out of a ditch with a winch and a pulley block. Describe how the tow truck\'s machine helps the rescuers.', words: ['winch', 'pulley', 'mechanical advantage', 'effort'],
      model: 'The winch is a wheel and axle that winds in the cable, and the pulley block adds supporting ropes. Together they make a compound machine, so their mechanical advantages multiply. That means a small effort from the winch\'s motor or handle can pull the heavy car out. The cable has to be wound in much further than the car moves.',
      check: ['Names the winch (wheel and axle) and the pulley block as the two simple machines', 'Says the mechanical advantages multiply, so a small effort moves the heavy car', 'Says the cable moves much further than the car (the trade-off)'] },
    { id: 'c6r24', obj: ['Aii'], type: 'num', p: 'The 6,300 N Gumdrop rose 15 m out of the crater. How much work did Smooshy do, whatever machine he used?', unit: 'J', units: UNITS_W, ans: 94500, tol: 10, ladder: true, hints: ['In a perfect machine, work in = work out.', 'Work out = load × height = 6,300 × 15.', 'Type 6300 × 15 into the calculator.'], work: 'Work = 6,300 × 15 = 94,500 J, for every machine that worked.' },
    { id: 'c6r25', obj: ['Aiii'], type: 'reason', sure: true, p: 'Ana says: "If Smooshy had built an even bigger mechanical advantage, he would have done less work." Is she right?',
      opts: ['No, the work stays the same, but the effort gets smaller', 'Yes, a bigger advantage always means less work', 'No, a bigger advantage means he does more work', 'Yes, because the ship weighs less with a bigger machine'], a: 0,
      reasons: ['He pulls with less force over a longer distance, so force × distance stays at 94,500 J', 'A smaller force always means a smaller amount of work done', 'He turns the handle further, so force × distance must be bigger', 'The machine carries part of the ship\'s weight for him'], r: 0,
      why: { a: { 1: 'A smaller effort is paid for with a longer distance, so the work is the same.', 2: 'A bigger advantage makes the effort smaller, and the work stays the same.', 3: 'The ship\'s weight never changes.' }, r: { 1: 'The force is smaller, but the distance is longer, so the work does not shrink.', 2: 'The distance is longer, but the force is smaller, so the work does not grow.', 3: 'The machine changes the effort, not the ship\'s weight.' } } },
    { id: 'c6r26', obj: ['Dii', 'Diii'], type: 'explain', fold: { title: 'Weighing up', html: '<p>Look at the plans through four factors: <b>society</b> (people), the <b>environment</b>, the <b>economy</b> (cost) and <b>health</b> (including safety).</p><p>Then give your judgement: <i>I would choose… The most important factor here is… because…</i></p>' }, p: 'The rescue team had two plans. Plan A: build long, gentle ramps and use a small crane. Plan B: bring a giant crane to lift the Gumdrop straight up the 15 m wall. Discuss one advantage and one disadvantage of each plan. Think about safety, time, cost or the effect on Glimmer-9\'s crater, then say which plan you would choose and why.', words: ['mechanical advantage', 'distance', 'safety', 'cost'],
      model: 'Plan A uses the ramps, which give mechanical advantage, so a smaller, cheaper crane and a smaller effort are enough. But it needs much more cable and a longer haul, and building the ramps takes time. Plan B moves the ship a much shorter distance, so it is quicker and hardly disturbs the ground. But the crane needs a much bigger mechanical advantage of its own, so it costs more to build and fly there, and a heavy ship hanging high on one cable is more dangerous if something breaks. I would choose Plan A, because it is safer and cheaper, even though it takes longer.',
      check: ['Gives an advantage of Plan A (the ramps\' mechanical advantage means a smaller or cheaper crane, or a smaller effort)', 'Gives a disadvantage of Plan A (more cable or distance, or more time)', 'Gives an advantage of Plan B (shorter distance, quicker, or less damage to the ground)', 'Gives a disadvantage of Plan B (needs a bigger mechanical advantage or a more expensive crane, or more dangerous if it fails)', 'Makes a choice and gives a reason for it'] },
    { id: 'c6r32', obj: ['Aii', 'Di', 'Diii'], type: 'explain', refl: true, p: 'Describe the rescue route you built and how it helped Smooshy. Use your own numbers, then say one change you would make and why.', words: ['load', 'effort', 'mechanical advantage', 'distance', 'work'],
      model: 'My route used a ramp, a pulley block and a winch on each leg. On my hardest leg the 30 m ramp rose 6 m, so the ramp\'s mechanical advantage was 30 ÷ 6 = 5. With 4 ropes and a ×7 winch the parts multiply, so the total mechanical advantage was 5 × 4 × 7 = 140. Smooshy\'s effort was the load ÷ the mechanical advantage = 6,300 ÷ 140 = 45 N, which is under his 60 N limit, so the thrusters stayed off. The price is distance: his hand moved 140 × 6 = 840 m on that leg. The work was still 6,300 × 6 = 37,800 J, because machines change the effort and the distance but not the work. Next time I would blast the crest lower, because then the ship needs to be lifted less far, which means less work and less hand travel.',
      mnote: 'Accept any route and mark the numbers against the student\'s My Rescue table (page 1 of the worksheet).',
      check: ['Names the machines in the route, in order', 'Gives the total mechanical advantage of the hardest leg and says the parts multiply', 'Compares the pull with Smooshy\'s 60 N', 'Explains that a smaller effort means a longer hand distance', 'Gives one improvement with a reason'] },
    /* ---------- Extension Check: real machines waste energy ---------- */
    { id: 'c6r27', obj: ['Aii'], type: 'num', p: 'A colonists\' pulley system takes 2,500 J of work in to do 2,000 J of useful work. What is its efficiency?', unit: '%', ans: 80, tol: 0.5, ladder: true, hints: ['Efficiency = useful work out ÷ work in × 100%.', 'Type 2000 ÷ 2500 into the calculator.', 'Multiply by 100 to get a percentage.'], work: 'Efficiency = 2,000 ÷ 2,500 × 100% = 80%.' },
    { id: 'c6r28', obj: ['Aii'], type: 'reason', sure: true, p: 'Friction in a pulley system makes the effort bigger. What happens to the length of rope you pull to lift the load 1 m?',
      opts: ['It stays the same', 'It gets longer', 'It gets shorter', 'It drops to zero'], a: 0,
      reasons: ['The rope pulled depends only on the supporting ropes and the height lifted', 'Friction drags on the rope, so you have to pull more of it', 'Friction holds part of the load, so less rope is needed', 'A real machine can\'t lift anything once friction acts'], r: 0,
      why: { a: { 1: 'In the Workshop, the rope pulled was 8 m for the Perfect and the Real machine.', 2: 'Friction does not hold up the load.', 3: 'The Real machine still lifted the tank.' }, r: { 1: 'Friction changes the effort, not the length of rope.', 2: 'Friction does not hold up the load.', 3: 'The Real machine still lifted the tank, with a bigger effort.' } } },
    { id: 'c6r29', obj: ['Aii', 'Aiii'], type: 'calcorder', p: 'Each machine below does 1,200 J of useful work lifting a crate. Work out the efficiency of each one, then put them in order, most efficient first.',
      mass: 1200, f: (workIn, out) => out / workIn * 100, given: 'Work in (J)', calc: 'Efficiency (%)', unit: '%', tol: 0.5, col0: 'Machine', desc: true,
      items: [['Lever', 1250], ['Pulley system', 1500], ['Dusty ramp', 1600], ['Wedge', 3000], ['Screw jack', 4000]], first: 'Most efficient', last: 'Least efficient',
      after: 'The efficiencies are 96%, 80%, 75%, 40% and 30%.' },
    { id: 'c6r30', obj: ['Aiii'], type: 'fix', p: 'Leo works out a machine\'s efficiency. One line has a mistake. Tap it, then correct the answer.', who: 'Leo',
      lines: ['Work in = 1,500 J', 'Useful work out = 1,200 J', 'Efficiency = work in ÷ work out × 100%', 'Efficiency = 1,500 ÷ 1,200 × 100% = 125%'], bad: 2,
      fix: { kind: 'num', ask: 'What is the correct efficiency?', ans: 80, unit: '%', tol: 0.5 },
      why: 'Efficiency = useful work out ÷ work in × 100% = 1,200 ÷ 1,500 × 100% = 80%. An efficiency over 100% is a warning sign: no machine gives out more work than you put in.' },
    { id: 'c6r31', obj: ['Aii', 'Di', 'Diii'], type: 'explain', p: 'The gummy colonists want their machines to waste as little energy as possible. Explain why friction wastes energy in a machine, and suggest two ways the colonists could make their machines more efficient.', words: ['friction', 'energy', 'heat', 'efficiency', 'lubricant'],
      model: 'When parts of a machine rub together, friction turns some of the work put in into heat, so the useful work out is less than the work in. The colonists could oil or grease the moving parts with a lubricant, keep the sugar dust out with covers, use smoother wheels and bearings, or choose machines with fewer moving parts, such as fewer pulley wheels, as long as the mechanical advantage is still big enough.',
      check: ['Says friction between moving parts turns some of the work in into heat (wasted energy)', 'Gives one sensible way to cut friction (lubricant, cleaning or covering, smoother wheels or bearings)', 'Gives a second, different way (or fewer moving parts or pulley wheels)'] }
  ]
};

/* ---------- Part 3 Challenge: Launch-day loading (y1 to y3). renderShopCourse in 45-challenge.js judges each Pull! ---------- */
const shMark = ok => ok ? '✓' : '✗';
const shObjE = lim => ({ label: `Pull with ${lim} N or less`, ok: r => !r.capped && r.E <= lim, say: r => r.capped ? `Your pull would need ${r.need.toFixed(1)} N. Target: ${lim} N or less. ✗` : `Your pull: ${r.E.toFixed(1)} N. Target: ${lim} N or less. ${shMark(r.E <= lim)}` });
const shObjW = lim => ({ label: `Work in ${fmt(lim, 0)} J or less`, ok: r => r.workIn <= lim + 1e-9, say: r => r.capped ? `The work in cannot be measured because the pull is too big. ✗` : `Work in: ${fmt(r.workIn, 0)} J. Target: ${fmt(lim, 0)} J or less. ${shMark(r.workIn <= lim + 1e-9)}` });
const shObjC = lim => ({ label: `Use ${lim} m of cable or less`, ok: r => r.cable <= lim + 1e-9, say: r => `Cable used: ${fmt(r.cable, 1)} m. Target: ${lim} m or less. ${shMark(r.cable <= lim + 1e-9)}` });
const shObjT = lim => ({ label: `Move your hand ${lim} m or less`, ok: r => r.dist <= lim + 1e-9, say: r => `Hand travel: ${fmt(r.dist, 1)} m. Target: ${lim} m or less. ${shMark(r.dist <= lim + 1e-9)}` });
CHDATA.c6.challenge = {
  title: 'Launch-day loading',
  intro: 'Smooshy\'s rescue rocket, <b>Gummy Rescue One</b>, is on the launch pad at Force HQ, and it needs loading! Practise like Smooshy: no pull may be more than <b>60 N</b>. Work out the mechanical advantage you need first, then choose your setting. Try to get each one right first time!',
  missions: [
    { id: 'y1', kind: 'shop', title: 'Mission 1: Oxygen tank', cap: 60,
      setup: { mach: 'pulley', allow: ['pulley'], ropes: 1, lift: 3, loads: { pulley: WL.tank }, lim: { ropesMax: 6 } }, show: ['wsctl', 'wspull', 'readMA'],
      brief: 'Lift the 25 kg oxygen tank (245 N) <b>3 m</b> up into the rocket\'s hatch. Your pull must be <b>60 N or less</b>, and there are only <b>15 m of rope</b>.',
      goal: 'Choose the number of supporting ropes, then press Pull!',
      objs: [shObjE(60), { label: 'Pull 15 m of rope or less', ok: r => r.dist <= 15, say: r => `Rope pulled: ${fmt(r.dist, 1)} m. Target: 15 m or less. ${shMark(r.dist <= 15)}` }],
      clues: ['What mechanical advantage gets the effort under 60 N? 245 ÷ 60 = 4.08.', 'Each choice also needs rope: the rope pulled = supporting ropes × 3 m.', '4 ropes need 61.3 N, and 6 ropes need 18 m of rope. Which number is left?'],
      give: '5 supporting ropes work: 49.0 N and 15 m of rope.' },
    { id: 'y2', kind: 'shop', title: 'Mission 2: Fuel barrel', cap: 60,
      setup: { mach: 'ramp', allow: ['ramp'], L: 3, h: 1.2, lift: 1.2, loads: { ramp: WL.barrel }, lim: { rampL: [3, 21, 1.5] } }, show: ['wsctl', 'wspull', 'readMA'],
      brief: 'Pull the 80 kg fuel barrel (784 N) up onto the <b>1.2 m</b> high loading bay. Your pull must be <b>60 N or less</b>, and the hangar only has room for a ramp <b>up to 18 m long</b>.',
      goal: 'Choose the length of the ramp, then press Pull!',
      objs: [shObjE(60), { label: 'Use a ramp up to 18 m long', ok: r => r.L <= 18, say: r => `Ramp length: ${fmt(r.L, 1)} m. Target: 18 m or less. ${shMark(r.L <= 18)}` }],
      clues: ['The mechanical advantage you need is 784 ÷ 60 = 13.1.', 'For a ramp, mechanical advantage = length ÷ height, so the length must be at least 13.1 × 1.2 m.', 'That is at least 15.7 m. Which lengths fit in the hangar?'],
      give: 'A 16.5 m ramp (57.0 N) or an 18 m ramp (52.3 N) works.' },
    { id: 'y3', kind: 'shop', title: 'Mission 3: Spare engine', cap: 60,
      setup: { mach: 'winch', allow: ['winch'], R: 0.1, axle: 0.05, lift: 2, loads: { winch: WL.engine } }, show: ['wsctl', 'wspull', 'readMA'],
      brief: 'Winch the 50 kg spare engine (490 N) <b>2 m</b> up into the cargo bay. Your pull must be <b>60 N or less</b>. The winch is bolted next to a wall, so the handle radius can be <b>0.5 m at most</b>.',
      goal: 'Choose the handle radius, then press Turn!',
      objs: [shObjE(60), { label: 'Use a handle radius of 0.5 m or less', ok: r => r.R <= 0.5 + 1e-9, say: r => `Handle radius: ${fmt(r.R, 2)} m. Target: 0.5 m or less. ${shMark(r.R <= 0.5 + 1e-9)}` }],
      clues: ['The mechanical advantage you need is 490 ÷ 60 = 8.2.', 'For a winch, mechanical advantage = handle radius ÷ 0.05 m, so the handle must be at least 8.2 × 0.05 m.', 'That is at least 0.41 m. Which handles fit by the wall?'],
      give: 'A 0.45 m handle (54.4 N) or a 0.5 m handle (49.0 N) works.',
      after: 'Gummy Rescue One is fully loaded! Next, Part 4: machines inside machines.' },
    /* ---- Part 4 Challenge: Build the rescue kit (h1 to h3). The student builds a compound machine with the builder; every pull counts (same scoring as y1 to y3). ---- */
    { id: 'h1', kind: 'shop', title: 'Mission 1: Hoist the nose cone', cap: 100,
      setup: { mach: 'build', allow: ['build'], lift: 6, loads: { build: WL.cone }, bRoutes: [[0, 'Straight up']] }, show: ['builder', 'wspull', 'bTotMA', 'bCable', 'bTravel'],
      brief: 'Hoist the rocket\'s 200 kg nose cone (1,960 N) <b>6 m</b> up. The crane operator can pull <b>100 N at most</b>. There is <b>30 m of cable</b>, and the job must take <b>150 m of hand travel or less</b>.',
      goal: 'Choose a winch and a pulley block, then press Turn!',
      objs: [shObjE(100), shObjC(30), shObjT(150)],
      clues: ['The mechanical advantage you need is 1,960 ÷ 100 = 19.6. Hand travel = mechanical advantage × 6 m, so the mechanical advantage must be 25 or less.', 'No single machine here reaches 19.6. Which pairs multiply to between 19.6 and 25?', 'Try 2 ropes with winch ×10, or 3 ropes with winch ×8.'],
      give: '2 ropes with winch ×10 (98 N, 12 m of cable, 120 m of travel) works.' },
    { id: 'h2', kind: 'shop', title: 'Mission 2: Load the Gummy Rover', cap: 80,
      setup: { mach: 'build', allow: ['build'], lift: 2, loads: { build: WL.rover }, bRoutes: [[0, 'Straight up'], [4, '4 m ramp'], [6, '6 m ramp'], [10, '10 m ramp']] }, show: ['builder', 'wspull', 'bTotMA', 'bCable', 'bTravel'],
      brief: 'Get the 400 kg Gummy Rover (3,920 N) onto the rocket\'s deck, <b>2 m</b> up. The pull must be <b>80 N or less</b>, there is <b>40 m of cable</b>, and the job must take <b>120 m of hand travel or less</b>.',
      goal: 'Choose a route, a pulley block and a winch, then press Turn!',
      objs: [shObjE(80), shObjC(40), shObjT(120)],
      clues: ['The mechanical advantage you need is 3,920 ÷ 80 = 49, and at most 120 ÷ 2 = 60.', 'Cable = supporting ropes × route length, so long ramps and lots of ropes use cable fast.', 'The 10 m ramp has a mechanical advantage of 5. What do the pulley block and the winch need to multiply to?'],
      give: 'The 10 m ramp with no pulley block and winch ×10 (78.4 N, 10 m of cable, 100 m of travel) works.' },
    { id: 'h3', kind: 'shop', title: 'Mission 3: Practise for Glimmer-9', cap: 60,
      setup: { mach: 'build', allow: ['build'], lift: 10, world: 'glim', loads: { build: WL.blockg }, bRoutes: [[0, 'Straight up']] }, show: ['builder', 'wspull', 'bTotMA', 'bCable', 'bTravel'],
      calc: { p: 'What does the 300 kg block weigh on Glimmer-9? (g = 4.2 N/kg)', unit: 'N', ans: 1260, tol: 1, hints: 'Weight = mass × g. Type 300 × 4.2 into the calculator.' },
      brief: 'Smooshy\'s engineers want a test run in Glimmer-9\'s gravity. Lift a <b>300 kg</b> engine block <b>10 m</b>. On Glimmer-9, <b>g = 4.2 N/kg</b>. Smooshy can pull <b>60 N at most</b>, there is <b>40 m of cable</b>, and he has oxygen for <b>250 m of hand travel</b>.',
      goal: 'Work out the weight first. Then choose a winch and a pulley block, and press Turn!',
      objs: [shObjE(60), shObjC(40), shObjT(250)],
      clues: ['Weight = 300 × 4.2 = 1,260 N, so the mechanical advantage you need is 1,260 ÷ 60 = 21, and at most 250 ÷ 10 = 25.', 'Cable = supporting ropes × 10 m, so 4 ropes at most.', 'Which ropes and winch multiply to between 21 and 25?'],
      give: '3 ropes with winch ×8 (52.5 N, 30 m of cable, 240 m of travel) works.',
      after: 'The crane kit is built and packed. Next stop: Glimmer-9!' }
  ]
};

/* ---------- Part 5 Challenge: Operation Gummy Lift, one big build in two sessions (docs/Force_HQ_Rescue_Rebuild_Brief.md).
   Built in 4h-glbuild.js, run in 4i-glrun.js, scored by glScore in 4f-gummylift.js. Best run counts; the score is out of 10. ---------- */
CHDATA.c6.challenge.missions.push({ id: 'gl', kind: 'rescue', title: 'Operation Gummy Lift', max: 10, mins: 44 });

/* ---------- Extension Challenge: Build Gummy Base One (gb1 to gb3). Real machines (efficiencies multiply) and an energy budget. ---------- */
CHDATA.c6.challenge.missions.push(
  { id: 'gb1', kind: 'shop', title: 'Mission 1: First dome panel', cap: 60,
    setup: { mach: 'build', allow: ['build'], lift: 5, loads: { build: WL.panel }, site: 'base', real: true, budget: 3800, bRoutes: [[0, 'Straight up']] }, show: ['builder', 'wspull', 'bTotMA', 'bCable', 'readWork', 'readEff'],
    brief: 'Raise the first sugar-crystal dome panel (600 N) <b>5 m</b> into place. Pull: <b>60 N or less</b>. The battery holds <b>3,800 J</b> for this job.',
    goal: 'Choose a winch and a pulley block, then press Turn!', objs: [shObjE(60), shObjW(3800)],
    clues: ['The useful work out is 600 × 5 = 3,000 J, so the efficiency must be at least 3,000 ÷ 3,800 = 79%.', 'Winch 90% × pulley block: 1 rope 95%, 2 ropes 90%, 3 ropes 85%. Which combinations stay at 79% or above?', 'With a winch and 2 ropes (81%), the mechanical advantage must be big enough: 600 ÷ (MA × 0.81) ≤ 60.'],
    give: '2 ropes with winch ×8 (46.3 N, 3,704 J) works.' },
  { id: 'gb2', kind: 'shop', title: 'Mission 2: Water for the sugar gardens', cap: 60,
    setup: { mach: 'build', allow: ['build'], lift: 3, loads: { build: WL.water }, site: 'base', real: true, budget: 10000, bRoutes: [[0, 'Straight up (3 m)'], [6, '6 m track'], [9, '9 m track'], [15, '15 m track']] }, show: ['builder', 'wspull', 'bTotMA', 'bCable', 'readWork', 'readEff'],
    brief: 'Haul the water tank (2,000 N) up to the sugar gardens on the <b>3 m</b> terrace. Pull: <b>60 N or less</b>. Budget: <b>10,000 J</b>.',
    goal: 'Choose a route, a pulley block and a winch, then press Turn!', objs: [shObjE(60), shObjW(10000)],
    clues: ['Useful work out = 2,000 × 3 = 6,000 J, so the efficiency must be at least 60%.', 'Every extra part lowers the efficiency. Multiply them: track 75% × winch 90% × 2 ropes 90% = 60.8%.', 'You need a big mechanical advantage from very few parts. The long tracks give the most for one part.'],
    give: 'The 15 m track with winch ×10 (59.3 N, 8,889 J) works.' },
  { id: 'gb3', kind: 'shop', title: 'Mission 3: Night shift', cap: 60,
    setup: { mach: 'build', allow: ['build'], lift: 6, loads: { build: WL.supply }, site: 'base', real: true, budget: 2000, bRoutes: [[0, 'Straight up']] }, show: ['builder', 'wspull', 'bTotMA', 'bCable', 'readWork', 'readEff'],
    brief: 'The sun has set and the battery is almost flat: only <b>2,000 J</b> left. Lift the supply crate (300 N) <b>6 m</b>. Pull: <b>60 N or less</b>.',
    goal: 'Choose a winch and a pulley block, then press Turn!', objs: [shObjE(60), shObjW(2000)],
    clues: ['Useful work out = 300 × 6 = 1,800 J, so the efficiency must be at least 90%.', 'Which single part is 90% efficient or better and can give enough mechanical advantage?', 'Sometimes the simplest machine wins. Try the winch on its own.'],
    give: 'The winch on its own at ×6 (55.6 N, 2,000 J), ×8 or ×10 works.',
    after: 'Gummy Base One is open! Smooshy: "Thank you, Force HQ engineers. Come and visit any time. We\'ll save you a sugar crystal."' }
);

/* ---------- Fun facts: the last card of the step where the idea comes up (each one checked, 2 Nov 2026; the Archimedes fact sits in lv2) ---------- */
const c6s = id => CHDATA.c6.steps.find(s => s.id === id);
c6s('lv4').cards.push(CFACT('Your forearm is a class 3 lever. To hold a 1 kg bag in your hand, your biceps has to pull with several times the bag\'s weight.'));
c6s('pl3').cards.push(CFACT('Ancient Egyptian builders probably used ramps to haul huge stone blocks up the pyramids.'));
c6s('pl4').cards.push(CFACT('The Archimedes screw, a screw turning inside a tube, has been lifting water for over 2,000 years, and some are still in use today.', 'A car jack lets one person lift one side of a car by turning a handle, thanks to a screw with a very small pitch.'));
c6s('k1').cards.push(CFACT('One of the world\'s strongest cranes, the Taisun in China, has lifted about 20,000 tonnes in one go.'));
c6s('p5b').cards.push(CFACT('A clean, oiled bicycle chain is one of the most efficient machines there is: well over 90% of the work you put in reaches the back wheel.'));

/* A "Reminders" fold-out for every Chapter 6 page where students calculate: how to find each mechanical advantage and what working to show (Tom, 3 Nov 2026). */
function remindersHTML() {
  return `<details class="clue remind"><summary>📌 Reminders: how to find mechanical advantage</summary><div class="rmgrid gl">
    <div><b>Weight (the load)</b> = mass × g. g is 9.8 N/kg on Earth, 3.7 on Mars, 1.6 on the Moon and 4.2 on Glimmer-9.</div>
    <div><b>Mechanical advantage (MA)</b> = load ÷ effort. So the effort = load ÷ MA.</div>
    <div><b>Lever:</b> MA = effort arm ÷ load arm. <b>Pulley:</b> MA = number of supporting ropes. <b>Ramp:</b> MA = length ÷ height. <b>Winch:</b> MA = handle radius ÷ axle radius.</div>
    <div><b>Compound machine:</b> find the MA of each part, then <b>multiply</b> them: total MA = MA₁ × MA₂ × MA₃.</div>
    <div><b>Distances:</b> hand travel = MA × the height lifted. Cable = ropes × ramp length. Work = force × distance.</div>
    <div><b>Working to show:</b> 1. Write the MA of each part. 2. Multiply them. 3. Work out the effort or the distance. 4. Check it against the limits in the job.</div></div></details>`;
}
