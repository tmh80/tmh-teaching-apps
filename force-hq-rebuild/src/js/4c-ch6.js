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
  log: { id: 'log', N: 1200, name: 'log', short: 'log' }, ice: { id: 'ice', N: 500, name: 'ice block', short: 'ice block' }, car: { id: 'car', N: 3000, name: 'car', short: 'car' }
};
const shopStage = o => { clearCh2(); S.scene = 'shop'; S.left = []; S.right = []; S.floor = 'air'; S.warp = 1; S.running = false; wsSetup(o); };
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
      setup() { shopStage({ mach: 'hand', allow: ['hand', 'lever'], cls: 1, arm: 1.0, lift: 0.10, loads: { hand: WL.rock, lever: WL.rock }, maxTravel: 1.5 }); }, adds: ['wsctl', 'wspull', 'wsmach'], sides: [], pullers: [], idle: 'Press Lift! to lift the rock by hand',
      tasks: [['Choose <b>By hand</b> and press <b>Lift!</b>', () => shopHas({ mach: 'hand' })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['Now choose the <b>Lever</b>. The fulcrum starts in the middle of the bar. Press <b>Pull!</b>', () => shopHas({ mach: 'lever', cls: 1, la: 1 })], ['', () => hasAns('q2'), { q: 'q2' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'Lifting the rock by hand, what did the newtonmeter read?', unit: 'N', tol: 1, live: () => shopE({ mach: 'hand' }), need: () => shopHas({ mach: 'hand' }), needMsg: 'Lift the rock by hand first. Your runs are in the Journal.', ok: 'Right, 294 N. That\'s nearly five times more than Smooshy\'s 60 N!' },
        { id: 'q2', type: 'reading', p: 'With the lever and the fulcrum in the middle, what did the newtonmeter read?', unit: 'N', tol: 1, live: () => shopE({ mach: 'lever', cls: 1, la: 1 }), need: () => shopHas({ mach: 'lever', cls: 1, la: 1 }), needMsg: 'Pull with the lever first. Your runs are in the Journal.', ok: '294 N again! With the fulcrum in the middle, the lever doesn\'t make the job any easier yet. You\'ll change that in the next step.' },
        { id: 'q3', type: 'pick', p: `<p>Label the lever.</p>${picLever({ letters: true })}<p>Part A is the {0}, part B is the {1} and part C is the {2}.</p>`, picks: [[['fulcrum', 'load', 'effort'], 0], [['fulcrum', 'load', 'effort'], 1], [['fulcrum', 'load', 'effort'], 2]], after: 'The fulcrum is the pivot, the load is the rock, and the effort is your pull.' }] },

    { id: 'lv2', title: 'Move the fulcrum', rescue: 'Fulcrum trick learned.',
      cards: [
        { hi: '[data-panel="wsctl"]', html: `<p>Here's where a lever gets clever. Use the slider to move the fulcrum along the bar. The labels above the bar show how far the rock is from the fulcrum, and how far your hand is from it. After each move, press <b>Pull!</b> and read the newtonmeter.</p>` },
        CFACT('The Greek scientist Archimedes, over 2,200 years ago, said that with a long enough lever and a place to stand, he could move the Earth.')],
      predict: { q: 'You move the fulcrum closer to the rock. What will happen to the effort you need?', opts: ['It gets smaller, because more of the bar is on your side', 'It gets bigger, because the rock is now closer to the fulcrum', 'It stays the same, because the rock\'s weight hasn\'t changed', 'It drops to zero, because the fulcrum now holds up the rock'], then: 'Test it! Move the fulcrum close to the rock and pull.' },
      setup() { shopStage({ mach: 'lever', allow: ['lever'], cls: 1, arm: 1.0, lift: 0.10, loads: { lever: WL.rock }, maxTravel: 1.5 }); }, adds: [], hide: ['wsmach'], sides: [], pullers: [], idle: 'Press Pull! to work the lever',
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Move the fulcrum so the rock is <b>0.4 m</b> from it, then press <b>Pull!</b>', () => shopHas({ mach: 'lever', cls: 1, la: 0.4 })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['Find a fulcrum position where the effort is <b>60 N or less</b>.', () => shopRuns().some(r => r.mach === 'lever' && r.cls === 1 && !r.capped && r.E <= 60)]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With the rock 0.4 m from the fulcrum, what did the newtonmeter read?', unit: 'N', tol: 1, live: () => shopE({ mach: 'lever', cls: 1, la: 0.4 }), need: () => shopHas({ mach: 'lever', cls: 1, la: 0.4 }), needMsg: 'Pull with the rock 0.4 m from the fulcrum first. Your runs are in the Journal.', ok: 'Yes, 73.5 N. That\'s four times smaller than lifting the rock by hand.' },
        { id: 'q2', type: 'pick', p: 'Moving the fulcrum closer to the rock made the effort {0}.', picks: [[WS_TREND, 2]], after: 'The closer the fulcrum is to the rock, the smaller the effort you need.' },
        { id: 'q3', type: 'mcq', p: 'Captain Smooshy wants to lift a heavy rock with a lever and a small pull. Where should he put the fulcrum?', opts: ['Close to the rock, so his side of the bar is long', 'Close to his hand, so his side of the bar is short', 'Exactly in the middle, so both sides are the same', 'Anywhere, because the fulcrum doesn\'t change the pull'], a: 0, ok: 'Spot on! A long side for his hand means a small pull.', why: { 1: 'That makes his side of the bar short, so he would need a bigger pull.', 2: 'In the middle, the effort was the same as lifting the rock by hand.', 3: 'Your readings changed every time you moved the fulcrum.' } }] },

    { id: 'lv3', title: 'The catch', rescue: 'The catch is noted in the mission log.',
      cards: [
        { hi: '#cvScene', html: `<p>Is there a catch to this trick? Let's find out. After each pull, two rulers appear under the bench. The <b style="color:#2a7d48">green ruler</b> shows how far the rock rose. The <b style="color:#d6402c">red ruler</b> shows how far your hand moved. Compare them carefully.</p>` }],
      setup() { shopStage({ mach: 'lever', allow: ['lever'], cls: 1, arm: 0.4, lift: 0.10, loads: { lever: WL.rock }, maxTravel: 1.5 }); }, adds: ['rulers'], hide: ['wsmach'], sides: [], pullers: [], idle: 'Press Pull! and look at both rulers',
      tasks: [['Pull with the rock <b>0.4 m</b> from the fulcrum and look at both rulers.', () => shopHas({ mach: 'lever', cls: 1, la: 0.4 })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['Now move the fulcrum so the rock is <b>0.2 m</b> from it, and pull again.', () => shopHas({ mach: 'lever', cls: 1, la: 0.2 })], ['', () => hasAns('q2'), { q: 'q2' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With the rock 0.4 m from the fulcrum, the rock rose 0.10 m. How far did your hand move? Use the red ruler.', unit: 'm', tol: 0.02, live: () => shopDist({ mach: 'lever', cls: 1, la: 0.4 }), need: () => shopHas({ mach: 'lever', cls: 1, la: 0.4 }), needMsg: 'Pull with the rock 0.4 m from the fulcrum first.', ok: '0.40 m: four times further than the rock rose.' },
        { id: 'q2', type: 'reading', p: 'With the rock 0.2 m from the fulcrum, how far did your hand move?', unit: 'm', tol: 0.02, live: () => shopDist({ mach: 'lever', cls: 1, la: 0.2 }), need: () => shopHas({ mach: 'lever', cls: 1, la: 0.2 }), needMsg: 'Pull with the rock 0.2 m from the fulcrum first.', ok: '0.90 m! The effort was tiny, but your hand moved nine times further than the rock.' },
        { id: 'q3', type: 'pick', p: 'When the effort got smaller, your hand had to move {0} to lift the rock the same height.', picks: [[['a shorter distance', 'the same distance', 'a longer distance'], 2]], after: 'That\'s the catch: a smaller effort always needs a bigger distance. Every machine in the Workshop works like this.' }] },

    { id: 'lv4', title: 'Three ways to build a lever', rescue: 'Three lever designs tested.',
      cards: [
        { hi: '#wsClsRow', html: `<p>So far the fulcrum has always been in the middle. You can also build a lever with the load in the middle, or with your effort in the middle. Use the new buttons to try each design. Pull, then check the newtonmeter and the two rulers.</p>${picThree()}` }],
      predict: { q: 'With the effort in the middle, your hand pulls up close to the fulcrum and the rock sits at the far end. How will the effort compare with the rock\'s weight?', opts: ['The effort will be bigger than the rock\'s weight', 'The effort will be smaller than the rock\'s weight', 'The effort will be equal to the rock\'s weight', 'The effort will be zero, because the fulcrum holds it'], then: 'Try the load in the middle first, then the effort in the middle.' },
      setup() { shopStage({ mach: 'lever', allow: ['lever'], cls: 1, arm: 1.0, lift: 0.10, loads: { lever: WL.rock }, maxTravel: 1.5, classPick: true }); }, adds: [], hide: ['wsmach'], sides: [], pullers: [], idle: 'Choose a design, then press Pull!',
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Choose <b>Load in the middle</b>. Put the rock <b>0.5 m</b> from the fulcrum and pull.', () => shopHas({ mach: 'lever', cls: 2, la: 0.5 })],
        ['Choose <b>Effort in the middle</b>. Put your hand <b>0.5 m</b> from the fulcrum and pull.', () => shopHas({ mach: 'lever', cls: 3, ea: 0.5 })], ['', () => hasAns('q1'), { q: 'q1' }], ['', () => hasAns('q2'), { q: 'q2' }]],
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
      setup() { shopStage({ mach: 'lever', allow: ['lever'], cls: 3, arm: 1.0, lift: 0.10, loads: { lever: WL.rock }, maxTravel: 1.5, classPick: true, clsNames: true }); }, adds: [], hide: ['wsmach'], sides: [], pullers: [], idle: 'Press Pull! to work the class 3 lever',
      tasks: [['The buttons now show the class names. Build a <b>class 3</b> lever with your hand <b>1.0 m</b> from the fulcrum and pull. Watch the far end swing.', () => shopHas({ mach: 'lever', cls: 3, ea: 1 })]],
      qs: [
        { id: 'q1', type: 'pick', p: 'In a class 2 lever, the {0} is in the middle. In a class 3 lever, the {1} is in the middle.', picks: [[['fulcrum', 'load', 'effort'], 1], [['fulcrum', 'load', 'effort'], 2]] },
        { id: 'q2', type: 'mcq', p: 'Chopsticks are a class 3 lever. Why are they so useful?', opts: ['A small squeeze of your fingers moves the tips a long way', 'Your fingers squeeze with less force than the food\'s weight', 'The food gets lighter when you hold it at the tips', 'Class 3 levers can work without any fulcrum at all'], a: 0, ok: 'Yes! Small finger movements open and close the tips wide.', why: { 1: 'In a class 3 lever the effort is bigger than the load.', 2: 'The food\'s weight is mass × g, which never changes.', 3: 'Chopsticks pivot where they rest in your hand: that\'s the fulcrum.' } }] },

    /* ================= Part 2: Pulleys, wheels and ramps (c6b) ================= */
    { id: 'pl1', title: 'Pulleys', rescue: 'Pulley blocks packed in the toolkit.',
      cards: [
        { html: `<p>Welcome to Part 2! Remember the catch from the lever: a smaller effort means your hand moves further. Look out for it in every new machine.</p>${picCatch()}` },
        { hi: '#cvScene', html: `<p>A ${T('pulley', 'pulley')} is a wheel with a rope running round it. A flagpole has one at the top: you pull the rope down, and the flag goes up.</p>${picFlagpole()}` },
        { hi: '[data-panel="wsctl"]', html: `<p>Now hang the crate from a pulley that moves up with it. Count the ${T('supporting', 'supporting ropes')}: the pieces of rope that hold the crate up. Don't count the end you pull.</p>${picMovingPulley()}` }],
      predict: { q: 'You change from 1 supporting rope to 2. What will happen to the effort?', opts: ['It halves, because two ropes share the crate\'s weight', 'It doubles, because there is twice as much rope to pull', 'It stays the same, because the crate\'s weight hasn\'t changed', 'It drops to zero, because the top pulley holds the crate'], then: 'Lift the crate with 1, 2, 3 and 4 supporting ropes and watch the newtonmeter.' },
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
        { id: 'q3', type: 'tick', p: 'Tick every object that uses a wedge.', opts: ['A kitchen knife', 'A doorstop', 'The point of a nail', 'Your front teeth', 'A doorknob', 'A seesaw'], a: [0, 1, 2, 3], ok: 'Yes! A doorknob is a wheel and axle, and a seesaw is a lever.' }] }
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
      check: ['Says the sloping sides push the ice apart with a bigger force than the push', 'Says a long, thin wedge needs a smaller push than a short, fat one', 'Says the smaller push has to move further (the catch)'] }
  ]
};
