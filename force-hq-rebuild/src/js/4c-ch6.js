/* ===== Chapter 6: the Workshop (Save Captain Smooshy!) =====
   Part 1 c6a (steps w1–w5, Check c6r1–c6r6): the six simple machines. More Parts are added in later builds.
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
  { id: 'maparts', name: 'MA from the shape', eq: 'pulley: supporting ropes · lever: effort arm ÷ load arm · wheel and axle: wheel radius ÷ axle radius · ramp: length ÷ height · wedge: length ÷ thickness · screw: distance per turn ÷ pitch', note: 'Use the same unit for both lengths.', ch: [6] },
  { id: 'edist', name: 'Effort distance', eq: 'effort distance = MA × load distance', note: 'Less force means more distance.', ch: [6] },
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
  vocab: ['machine', 'simple machine', 'compound machine', 'lever', 'fulcrum', 'effort', 'load', 'pulley', 'supporting rope', 'wheel and axle', 'inclined plane', 'wedge', 'screw', 'mechanical advantage', 'work', 'joule'],
  steps: [
    /* ---------- Part 1: Simple machines ---------- */
    { id: 'w1', title: 'Levers', rescue: 'Levers packed in the toolkit.',
      cards: [
        { hi: '#cvScene', html: `<p>Welcome to the Workshop! Before anyone flies to Glimmer-9, you need to master the six ${T('simplemach', 'simple machines')}. A simple machine lets a small force, the ${T('effort')}, move a big force, the ${T('load')}. First up is the ${T('lever')}: a strong bar that turns around a pivot called the ${T('fulcrum')}.</p>` },
        { hi: '#wsPull', html: `<p>Press <b>Pull!</b> and watch the ${T('newtonmeter')} at your end of the bar. The reading climbs until the rock starts to rise, so that reading is the effort needed. Then slide the fulcrum and pull again. The red band on the newtonmeter shows Captain Smooshy's limit of 60 N.</p>` },
        CFACT('The Greek scientist Archimedes, over 2,200 years ago, said that with a long enough lever and a place to stand, he could move the Earth.')],
      predict: { q: 'You slide the fulcrum closer to the rock. What happens to the effort you need?', opts: ['It gets smaller, because more of the bar is on your side', 'It gets bigger, because the rock is now closer to the pivot', 'It stays the same, because the rock\'s weight hasn\'t changed', 'It drops to zero, because the fulcrum now carries the rock'], then: 'Test it! Lift the rock with the fulcrum in the middle, then with the fulcrum close to the rock.' },
      setup() { shopStage({ mach: 'lever', allow: ['lever'], cls: 1, arm: 1.0, lift: 0.10, loads: { lever: WL.rock }, maxTravel: 1.5 }); }, adds: ['wsctl', 'wspull', 'rulers'], sides: [], pullers: [], idle: 'Press Pull! to work the lever',
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Set the load arm to <b>1.0 m</b> (fulcrum in the middle) and press <b>Pull!</b>', () => shopHas({ mach: 'lever', cls: 1, la: 1 })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['Set the load arm to <b>0.4 m</b> and pull again.', () => shopHas({ mach: 'lever', cls: 1, la: 0.4 })], ['', () => hasAns('q2'), { q: 'q2' }],
        ['Find a fulcrum position where the effort is <b>60 N or less</b>.', () => shopRuns().some(r => r.mach === 'lever' && !r.capped && r.E <= 60)]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With the fulcrum in the middle, what effort lifted the rock?', unit: 'N', tol: 1, live: () => shopE({ mach: 'lever', cls: 1, la: 1 }), need: () => shopHas({ mach: 'lever', cls: 1, la: 1 }), needMsg: 'Lift the rock with the load arm at 1.0 m first. Your runs are in the Journal.', ok: 'Right! With the fulcrum in the middle, the effort equals the rock\'s weight, 294 N. The lever only changed the direction of your push.' },
        { id: 'q2', type: 'reading', p: 'With the load arm at 0.4 m, what effort lifted the rock?', unit: 'N', tol: 1, live: () => shopE({ mach: 'lever', cls: 1, la: 0.4 }), need: () => shopHas({ mach: 'lever', cls: 1, la: 0.4 }), needMsg: 'Lift the rock with the load arm at 0.4 m first. Your runs are in the Journal.', ok: 'Yes, 73.5 N. That\'s four times smaller than the rock\'s weight.' },
        { id: 'q3', type: 'pick', p: 'When the fulcrum moved closer to the rock, the effort {0} and your end of the bar had to move {1}.', picks: [[WS_TREND, 2], [['less far', 'the same distance', 'further'], 2]], after: 'Less force, more distance. Keep an eye on this trade-off: it turns up in every machine.' },
        { id: 'q4', type: 'reading', p: 'With the load arm at 0.4 m, the rock rose 0.10 m. Use the ruler beside your end of the bar. How far did your end move down?', unit: 'm', tol: 0.02, live: () => shopDist({ mach: 'lever', cls: 1, la: 0.4 }), need: () => shopHas({ mach: 'lever', cls: 1, la: 0.4 }), needMsg: 'Lift the rock with the load arm at 0.4 m first.', ok: 'That\'s right, 0.40 m: four times further than the rock rose.' }] },

    { id: 'w2', title: 'Three classes of lever', rescue: 'All three classes of lever logged.',
      cards: [
        { hi: '[data-panel="wsctl"]', html: `<p>Levers come in three classes, depending on what sits in the middle. <b>Class 1:</b> the ${T('fulcrum')} is in the middle, like a seesaw or a crowbar. <b>Class 2:</b> the ${T('load')} is in the middle, like a wheelbarrow or a nutcracker. <b>Class 3:</b> the ${T('effort')} is in the middle, like tweezers, a fishing rod or your own forearm.</p>` },
        { html: `<p>A class 3 lever needs an effort <b>bigger</b> than the load! Engineers still love them, because the load end moves much further and faster than your hand. A small movement of your arm muscle swings your hand a long way.</p>` },
        CFACT('Your forearm is a class 3 lever. To hold a 1 kg bag in your hand, your biceps pulls with several times the bag\'s weight.')],
      predict: { q: 'In a class 3 lever, you push 0.5 m from the fulcrum and the rock sits at the far end, 2 m away. How will the effort compare with the rock\'s weight?', opts: ['The effort will be bigger than the rock\'s weight', 'The effort will be smaller than the rock\'s weight', 'The effort will be equal to the rock\'s weight', 'The effort will be zero, because the fulcrum holds it'], then: 'Try class 2 first, then class 3.' },
      setup() { shopStage({ mach: 'lever', allow: ['lever'], cls: 1, arm: 1.0, lift: 0.10, loads: { lever: WL.rock }, maxTravel: 1.5, classPick: true }); }, adds: [], sides: [], pullers: [], idle: 'Press Pull! to work the lever',
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Switch to <b>class 2</b> and lift the rock with the load arm at <b>0.5 m</b>.', () => shopHas({ mach: 'lever', cls: 2, la: 0.5 })],
        ['Switch to <b>class 3</b>, set the effort arm to <b>0.5 m</b>, and lift the rock.', () => shopHas({ mach: 'lever', cls: 3, ea: 0.5 })], ['', () => hasAns('q1'), { q: 'q1' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With the class 3 lever, what effort lifted the rock?', unit: 'N', tol: 2, live: () => shopE({ mach: 'lever', cls: 3, ea: 0.5 }), need: () => shopHas({ mach: 'lever', cls: 3, ea: 0.5 }), needMsg: 'Lift the rock with a class 3 lever and an effort arm of 0.5 m first.', ok: 'Whoa, 1,176 N! That\'s four times the rock\'s weight, but the rock moved four times further than your hand.' },
        { id: 'q2', type: 'sort', p: 'Sort these levers into their classes.', groups: ['Class 1: fulcrum in the middle', 'Class 2: load in the middle', 'Class 3: effort in the middle'],
          items: [['Crowbar', 0], ['Seesaw', 0], ['Pair of scissors', 0], ['Wheelbarrow', 1], ['Nutcracker', 1], ['Bottle opener', 1], ['Tweezers', 2], ['Fishing rod', 2], ['Your forearm lifting a cup', 2]] },
        { id: 'q3', type: 'mcq', p: 'Why would anyone use a class 3 lever, like a fishing rod?', opts: ['It makes the load end move further and faster than your hands', 'It makes the effort smaller than the load at the far end', 'It means the rod doesn\'t need a fulcrum at the handle end', 'It makes the weight of the fish smaller as it is lifted'], a: 0, ok: 'Yes! A small movement at your hands swings the tip a long way.', why: { 1: 'In a class 3 lever the effort is bigger than the load.', 2: 'Your back hand is the fulcrum.', 3: 'The fish\'s weight is mass × g, which doesn\'t change.' } }] },

    { id: 'w3', title: 'Pulleys', rescue: 'Pulley blocks packed in the toolkit.',
      cards: [
        { hi: '#cvScene', html: `<p>A ${T('pulley')} is a wheel with a rope running round it. One fixed pulley at the top only changes the direction of your pull: you pull down and the crate goes up. Add pulleys that move up with the crate, and something amazing happens.</p>` },
        { hi: '[data-panel="wsctl"]', html: `<p>Count the ${T('supporting', 'supporting ropes')}: the sections of rope that hold up the moving pulley block and the crate. Don't count the end you pull on when it comes down from a fixed pulley. Each extra supporting rope shares the crate's weight.</p>` }],
      predict: { q: 'You change from 1 supporting rope to 2. What happens to the effort?', opts: ['It halves, because two ropes share the crate\'s weight', 'It doubles, because there is twice as much rope to pull', 'It stays the same, because the crate\'s weight hasn\'t changed', 'It drops to zero, because the top pulley holds the crate'], then: 'Lift the crate with 1, 2, 3 and 4 supporting ropes and watch the newtonmeter and the rope you pull.' },
      setup() { shopStage({ mach: 'pulley', allow: ['pulley'], ropes: 1, lift: 1.0, loads: { pulley: WL.crate }, lim: { ropesMax: 6 } }); }, adds: ['wsctl', 'wspull', 'rulers'], sides: [], pullers: [], idle: 'Press Pull! to lift the crate',
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Lift the crate with <b>1, 2, 3 and 4</b> supporting ropes.', () => [1, 2, 3, 4].every(n => shopHas({ mach: 'pulley', ropes: n }))], ['', () => hasAns('q1'), { q: 'q1' }], ['', () => hasAns('q2'), { q: 'q2' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With 4 supporting ropes, what effort lifted the 235.2 N crate?', unit: 'N', tol: 0.5, live: () => shopE({ mach: 'pulley', ropes: 4 }), need: () => shopHas({ mach: 'pulley', ropes: 4 }), needMsg: 'Lift the crate with 4 supporting ropes first. Your runs are in the Journal.', ok: 'Yes, 58.8 N, a quarter of the crate\'s weight. That\'s under Smooshy\'s limit!' },
        { id: 'q2', type: 'reading', p: 'With 4 supporting ropes, the crate rose 1.0 m. Use the ruler on the rope. How much rope did you pull?', unit: 'm', tol: 0.05, live: () => shopDist({ mach: 'pulley', ropes: 4 }), need: () => shopHas({ mach: 'pulley', ropes: 4 }), needMsg: 'Lift the crate with 4 supporting ropes first.', ok: '4 m of rope for a 1 m lift. Each of the 4 supporting ropes got 1 m shorter.' },
        { id: 'q3', type: 'reason', p: 'With 1 supporting rope (a single fixed pulley), the effort was 235.2 N, the same as lifting the crate by hand. Four friends argue about it. Who\'s right?',
          voices: [{ who: 'Mia', says: 'A single fixed pulley is useless. The effort didn\'t change at all.' }, { who: 'Sam', says: 'It still helps, because pulling down is easier than lifting up.' }, { who: 'Leo', says: 'It halves the effort, because the rope goes over a wheel.' }, { who: 'Ana', says: 'It makes the crate lighter while it hangs on the rope.' }], a: 1,
          reasons: ['You can pull down using your own weight, and lift a load high above your head', 'The wheel spins, and a spinning wheel always reduces the force you need', 'Two pieces of rope come out of the pulley, so each one carries half the load', 'The crate\'s mass gets smaller once the rope takes the strain'], r: 0,
          why: { a: { 0: 'The force is the same, but its direction changes, which is useful.', 2: 'The effort was 235.2 N, the full weight.', 3: 'The crate\'s weight stays mass × g.' }, r: { 1: 'The readings showed no change with 1 rope.', 2: 'Only the supporting ropes share the load, and there is just one.', 3: 'Mass never changes.' } } },
        { id: 'q4', type: 'pick', p: 'Each extra supporting rope makes the effort {0} and the length of rope you pull {1}.', picks: [[['bigger', 'the same', 'smaller'], 2], [['shorter', 'the same', 'longer'], 2]] }] },

    { id: 'w4', title: 'Wheels, axles and ramps', rescue: 'A winch and a folding ramp packed in the toolkit.',
      cards: [
        { hi: '#cvScene', html: `<p>A ${T('wheelaxle', 'wheel and axle')} is a big wheel (or handle) fixed to a thin rod called the axle, so they turn together. Turn the big wheel with a small force and the axle turns with a big force. Doorknobs, steering wheels, screwdrivers and the ${T('winch')} on a well all use this idea.</p>` },
        { hi: '[data-panel="wsmach"]', html: `<p>An ${T('incline', 'inclined plane')} is a ramp. Pushing a load up a long, gentle ramp takes much less force than lifting it straight up, but you push it a much longer way. Truck loading ramps and wheelchair ramps work like this.</p>` },
        CFACT('Ancient Egyptian builders probably used ramps to haul huge stone blocks up the pyramids.')],
      predict: { q: 'You pull a 490 N cart up onto a 1 m high platform. Which ramp needs the smallest pull?', opts: ['The longest ramp, 5 m long and gentle', 'The shortest ramp, 2 m long and steep', 'Every ramp needs exactly the same pull', 'The middle ramp, 4 m long and medium'], then: 'Try the winch first, then the ramps.' },
      setup() { shopStage({ mach: 'winch', allow: ['winch', 'ramp'], R: 0.1, axle: 0.05, L: 2, h: 1, lift: 1.0, loads: { winch: WL.bucket, ramp: WL.cart }, lim: { rampL: [1, 6, 1] } }); }, adds: ['wsctl', 'wspull', 'rulers', 'wsmach'], sides: [], pullers: [], idle: 'Press Turn! to wind the winch',
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['<b>Winch:</b> lift the bucket with a handle radius of <b>0.1 m</b>, then <b>0.25 m</b>.', () => shopHas({ mach: 'winch', R: 0.1 }) && shopHas({ mach: 'winch', R: 0.25 })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['<b>Ramp:</b> pull the cart up the <b>2 m</b> ramp, then the <b>5 m</b> ramp.', () => shopHas({ mach: 'ramp', L: 2, h: 1 }) && shopHas({ mach: 'ramp', L: 5, h: 1 })], ['', () => hasAns('q2'), { q: 'q2' }]],
      qs: [
        { id: 'q1', type: 'reading', p: 'With a handle radius of 0.25 m, what effort lifted the 196 N bucket?', unit: 'N', tol: 0.5, live: () => shopE({ mach: 'winch', R: 0.25 }), need: () => shopHas({ mach: 'winch', R: 0.25 }), needMsg: 'Lift the bucket with a handle radius of 0.25 m first. Your runs are in the Journal.', ok: 'Yes, 39.2 N. The big handle made your force five times bigger at the axle.' },
        { id: 'q2', type: 'reading', p: 'What pull got the 490 N cart up the 5 m ramp?', unit: 'N', tol: 0.5, live: () => shopE({ mach: 'ramp', L: 5, h: 1 }), need: () => shopHas({ mach: 'ramp', L: 5, h: 1 }), needMsg: 'Pull the cart up the 5 m ramp first.', ok: '98 N, a fifth of the cart\'s weight. You pulled it 5 m to raise it 1 m.' },
        { id: 'q3', type: 'mcq', p: 'Why does the 5 m ramp need a smaller pull than the 2 m ramp?', opts: ['The cart travels a longer distance, so each metre needs less force', 'The cart weighs less when it sits on a long, gentle ramp', 'The long ramp has less friction, so the cart rolls more easily', 'The steep ramp pushes back on the cart and makes it heavier'], a: 0, ok: 'Yes! Less force, more distance, again.', why: { 1: 'The cart\'s weight is mass × g on any ramp.', 2: 'Workshop machines have no friction at all.', 3: 'The cart\'s weight doesn\'t change with the slope.' } },
        { id: 'q4', type: 'match', colA: 'Everyday object', p: 'Match each everyday object to its simple machine.', rows: [['Doorknob', 'Wheel and axle'], ['Wheelchair ramp', 'Inclined plane'], ['Flagpole', 'Pulley'], ['Crowbar', 'Lever']] }] },

    { id: 'w5', title: 'Wedges and screws', rescue: 'Wedges and a screw jack packed. The toolkit is ready!',
      cards: [
        { hi: '#cvScene', html: `<p>A ${T('wedge')} is two ramps back to back. Push it into a log and its sloping sides push the two halves apart with a much bigger force. Axes, knives, doorstops and even your front teeth are wedges. A long, thin wedge needs the smallest push.</p>` },
        { hi: '[data-panel="wsmach"]', html: `<p>A ${T('screw')} is a ramp wrapped round a rod, and the spiral ridge is called the <b>thread</b>. Each turn of the handle moves the screw forward by just a small distance, the ${T('pitch')}. A car jack uses a screw to lift one side of a car with one hand.</p>` },
        CFACT('The Archimedes screw, a screw turning inside a tube, has been lifting water for over 2,000 years, and some are still in use today.', 'A car jack lets one person lift one side of a car by turning a handle, thanks to a screw with a very small pitch.')],
      predict: { q: 'You split the same log with a fat wedge (5 cm thick) and a thin wedge (2 cm thick). Both are 20 cm long. Which needs the smaller push?', opts: ['The thin wedge needs the smaller push', 'The fat wedge needs the smaller push', 'Both wedges need the same push', 'Neither wedge can split the log'], then: 'Split the log with each wedge and watch the newtonmeter.' },
      setup() { shopStage({ mach: 'wedge', allow: ['wedge', 'screw'], thick: 10, per: 120, pitch: 1.0, lift: 0.20, loads: { wedge: WL.log, screw: WL.car }, lim: { pitch: [0.5, 1.0] } }); }, adds: ['wsctl', 'wspull', 'rulers', 'wsmach'], sides: [], pullers: [], idle: 'Press Push! to split the log',
      mask: [{ q: 'q1', keys: ['turns'], when: r => r.mach === 'screw' && r.pitch === 0.5 }],
      tick() { if (!S.flags.iceOn && [0, 1, 2, 3].every(i => CHDATA.c6.steps[4].tasks[i][1]())) { S.flags.iceOn = true; WS.loads.wedge = WL.ice; if (WS.mach === 'wedge') { wsLoadFor('wedge'); wsResetLoad(); wsRenderControls(); } } },
      tasks: [['Make your prediction in the box above.', () => predOf() != null],
        ['Split the log with the <b>5 cm</b> wedge, then the <b>2 cm</b> wedge.', () => shopHas({ mach: 'wedge', thick: 5, load: 1200 }) && shopHas({ mach: 'wedge', thick: 2, load: 1200 })],
        ['Lift the car with the screw jack, first with a <b>1.0 cm</b> pitch, then a <b>0.5 cm</b> pitch. Watch the turn counter.', () => shopHas({ mach: 'screw', pitch: 1 }) && shopHas({ mach: 'screw', pitch: 0.5 })], ['', () => hasAns('q1'), { q: 'q1' }],
        ['<b>Toolbox job:</b> Smooshy\'s ice block needs <b>500 N</b> to split. Choose a wedge that splits it with <b>60 N or less</b>.', () => shopRuns().some(r => r.mach === 'wedge' && r.loadN === 500 && !r.capped && r.E <= 60)]],
      qs: [
        { id: 'q1', type: 'reading', p: 'How many turns of the handle lifted the car 20 cm with the 0.5 cm pitch?', unit: 'turns', tol: 0, live: () => { const r = shopRun({ mach: 'screw', pitch: 0.5 }); return r ? r.turns : null; }, need: () => shopHas({ mach: 'screw', pitch: 0.5 }), needMsg: 'Lift the car with the 0.5 cm pitch first. Your runs are in the Journal.', ok: '40 turns! The finer thread needed half the effort, but twice as many turns.' },
        { id: 'q2', type: 'pick', p: 'With the finer thread (0.5 cm pitch), the effort was {0} and the number of turns was {1}.', picks: [[['bigger', 'the same', 'smaller'], 2], [['smaller', 'the same', 'bigger'], 2]] },
        { id: 'q3', type: 'tick', p: 'Tick every object that uses a wedge.', opts: ['An axe', 'A kitchen knife', 'A doorstop', 'The point of a nail', 'A doorknob', 'A seesaw'], a: [0, 1, 2, 3], ok: 'Yes! A doorknob is a wheel and axle, and a seesaw is a lever.' }] }
  ],
  review: [
    /* ---------- Part 1 Check ---------- */
    { id: 'c6r1', obj: ['Ai'], type: 'match', colA: 'Simple machine', p: 'Match each simple machine to an everyday example.', rows: [['Lever', 'Crowbar'], ['Pulley', 'Flagpole'], ['Wheel and axle', 'Steering wheel'], ['Inclined plane', 'Wheelchair ramp'], ['Wedge', 'Axe'], ['Screw', 'Jar lid']] },
    { id: 'c6r2', obj: ['Aii'], type: 'reason', sure: true, p: 'Mia moves the fulcrum of her crowbar closer to her hand. What happens to the effort she needs to lift the rock?',
      opts: ['It gets bigger', 'It gets smaller', 'It stays the same', 'It drops to zero'], a: 0,
      reasons: ['The load arm gets longer and her effort arm gets shorter', 'Her hand is closer to the pivot, so the bar is easier to turn', 'The rock\'s weight increases as the fulcrum moves', 'The fulcrum now carries more of the rock\'s weight for her'], r: 0,
      why: { a: { 1: 'Moving the fulcrum towards her hand makes her effort arm shorter, so the lever gives her less help.', 2: 'The rock\'s weight stays the same, but the lever\'s mechanical advantage changes.', 3: 'The fulcrum never takes the effort away: she still has to lift the rock.' }, r: { 1: 'A hand close to the pivot has a short effort arm, which makes the bar harder to turn, not easier.', 2: 'The rock\'s weight is mass × g, so it never changes.', 3: 'The fulcrum only gives the bar something to turn around.' } } },
    { id: 'c6r3', obj: ['Aii'], type: 'sort', p: 'Sort these levers into their classes.', groups: ['Class 1: fulcrum in the middle', 'Class 2: load in the middle', 'Class 3: effort in the middle'],
      items: [['Pliers', 0], ['Claw hammer pulling out a nail', 0], ['Door pushed open at the handle', 1], ['Bottle opener', 1], ['Broom swept with both hands', 2], ['Ice tongs', 2]] },
    { id: 'c6r4', obj: ['Aii'], type: 'pick', p: 'A crane lifts a load with 4 supporting ropes. Compared with lifting the load straight up, the effort is {0} and the rope pulled is {1}.', picks: [[['four times bigger', 'the same', 'a quarter as big'], 2], [['a quarter as long', 'the same length', 'four times longer'], 2]] },
    { id: 'c6r5', obj: ['Aiii'], type: 'fix', p: 'Leo explains ramps and pulleys. One line has a mistake. Tap it, then choose the correct line.', who: 'Leo',
      lines: ['Ana needs to get a heavy box onto a 1 m high stage.', 'She could pull it up a long ramp or a short, steep ramp.', 'The long ramp needs a smaller pull, but she pulls it further.', 'A steeper ramp would need a smaller pull, because it is shorter.'], bad: 3,
      fix: { kind: 'mcq', opts: ['A steeper ramp would need a bigger pull, but over a shorter distance', 'A steeper ramp would need the same pull, because the box weighs the same', 'A steeper ramp would need no pull at all, because the box slides down', 'A steeper ramp would need a smaller pull, because the box rises faster'], a: 0 },
      why: 'Ramp MA = length ÷ height. A shorter ramp to the same height has a smaller MA, so the pull is bigger, over a shorter distance.' },
    { id: 'c6r6', obj: ['Aii'], type: 'explain', p: 'Captain Smooshy wants to split a block of space ice with a wedge. Explain how a wedge works, and which shape of wedge he should choose.', words: ['wedge', 'force', 'thin', 'distance'],
      model: 'A wedge is two ramps back to back. When Smooshy pushes the wedge into the ice, its sloping sides push the two halves apart with a much bigger force than his push. He should choose a long, thin wedge, because it needs the smallest push. The catch is that he has to push it further into the ice.',
      check: ['Says the sloping sides push the ice apart with a bigger force than the push (the word "force" used for the push or the splitting force)', 'Says a long, thin wedge needs a smaller push than a short, fat one', 'Says the smaller push has to move further (the force–distance trade-off)'] }
  ]
};
