/* ===== Maths Gym: the F = m × a question generator =====
   prGen(level, seed, opts) builds one seeded `num` question (levels 1–6) with a hint ladder, a worked answer,
   a picture spec and the answers that common mistakes give (traps). prMatchTrap(q, value) names the mistake.
   The API is written up in docs/Force_HQ_Practice_Plan.md, section 8. Chapter 3's mq() is separate and unchanged.
   All student wording lives in PR_TEXT, so a change of voice touches one place. Uses rngSeed and UNITS (43-ch3.js) and DZ_WORLDS (46-dropzone.js). */

/* ---- the object bank: realistic masses (kg), accelerations (m/s²) and top velocities (m/s). Force HQ places first. ----
   push: who or what gives the force · fw: the name of that force · back: the force that holds it back
   fric:false = never in a two-force story · fall: drops straight down · grams / tonnes: can be given in g or tonnes · worlds: can be on another world */
const PR_THINGS = [
  { key: 'sled', name: 'a husky sled', the: 'the sled', pic: 'sled', m: [140, 260], a: [0.6, 2.4], v: 9, push: 'the huskies', fw: 'pull', back: 'friction', act: 'The huskies pull the sled across the Snow Arena.' },
  { key: 'crate', name: 'a Workshop crate', the: 'the crate', pic: 'crate', m: [25, 120], a: [0.4, 1.8], v: 2.5, push: 'the winch', fw: 'pull', back: 'friction', act: 'A winch drags the crate across the Workshop floor.', worlds: true, tug: true },
  { key: 'smooshy', name: 'Captain Smooshy', the: 'Captain Smooshy', pic: 'gummy', m: [45, 75], a: [0.5, 3], v: 6, push: 'the rope', fw: 'pull', back: 'friction', act: 'A rope pulls Captain Smooshy, the giant gummy bear, along the floor.', worlds: true, tug: true },
  { key: 'pod', name: 'a Space Dome supply pod', the: 'the supply pod', pic: 'pod', m: [180, 450], a: [0.8, 4.5], v: 30, push: 'the thrusters', fw: 'thrust', back: 'air resistance', act: 'The thrusters push the supply pod across the Space Dome.', worlds: true, jupiter: true },
  { key: 'astro', name: 'an astronaut in a spacesuit', the: 'the astronaut', pic: 'person', m: [105, 160], a: [0.4, 2.2], v: 3, push: 'the jet pack', fw: 'thrust', back: 'friction', act: 'The astronaut moves with a small jet pack.', worlds: true, fric: false },
  { key: 'rover', name: 'a space rover', the: 'the rover', pic: 'car', m: [180, 1050], a: [0.15, 0.9], v: 1.5, push: 'the motors', fw: 'driving force', back: 'friction', act: 'The motors drive the rover over the rocks.', worlds: true },
  { key: 'dropcrate', name: 'a Drop Zone supply crate', the: 'the supply crate', pic: 'crate', m: [30, 60], a: [2, 9], v: 40, push: 'gravity', fw: 'weight', back: 'air resistance', act: 'The supply crate drops out of the plane.', fric: false, fall: true, dir: 'down' },
  { key: 'trolley', name: 'a shopping trolley', the: 'the trolley', pic: 'trolley', m: [12, 45], a: [0.5, 2.2], v: 2.5, push: 'the shopper', fw: 'push', back: 'friction', act: 'A shopper pushes the trolley down the aisle.', tug: true },
  { key: 'car', name: 'a car', the: 'the car', pic: 'car', m: [1050, 1900], a: [1.5, 4.5], v: 30, push: 'the engine', fw: 'driving force', back: 'friction', act: 'The engine drives the car along the road.', tonnes: true },
  { key: 'kart', name: 'a go-kart and driver', the: 'the go-kart', pic: 'car', m: [120, 190], a: [2, 6], v: 18, push: 'the engine', fw: 'driving force', back: 'friction', act: 'The engine drives the go-kart round the track.' },
  { key: 'sprinter', name: 'a sprinter', the: 'the sprinter', pic: 'person', m: [52, 90], a: [2.5, 6], v: 11, push: "the sprinter's legs", fw: 'push', back: 'air resistance', act: 'The sprinter drives off the starting blocks.' },
  { key: 'wheelchair', name: 'a wheelchair racer', the: 'the racer', pic: 'person', m: [55, 85], a: [1, 3], v: 9, push: "the racer's arms", fw: 'push', back: 'air resistance', act: 'The racer pushes hard on the wheels.' },
  { key: 'bike', name: 'a cyclist on a bike', the: 'the cyclist', pic: 'bike', m: [62, 105], a: [0.5, 2.2], v: 12, push: 'the pedals', fw: 'driving force', back: 'air resistance', act: 'The cyclist pedals away from the lights.' },
  { key: 'skate', name: 'a skateboarder', the: 'the skateboarder', pic: 'skateboard', m: [35, 80], a: [0.6, 2.5], v: 7, push: "the skateboarder's foot", fw: 'push', back: 'friction', act: 'The skateboarder pushes off with one foot.' },
  { key: 'football', name: 'a football', the: 'the football', pic: 'ball', m: [0.41, 0.45], a: [80, 250], v: 32, push: "a player's boot", fw: 'kick', back: 'air resistance', act: 'A player kicks the football.', grams: true, fric: false },
  { key: 'tennis', name: 'a tennis ball', the: 'the tennis ball', pic: 'ball', m: [0.056, 0.059], a: [150, 400], v: 30, push: 'the ball machine', fw: 'push', back: 'air resistance', act: 'A ball machine fires the tennis ball.', grams: true, fric: false },
  { key: 'puck', name: 'a hockey puck', the: 'the puck', pic: 'ball', m: [0.156, 0.17], a: [40, 300], v: 35, push: 'the hockey stick', fw: 'push', back: 'friction', act: 'A player hits the puck across the ice.', grams: true, fric: false },
  { key: 'modeltrain', name: 'a model train', the: 'the model train', pic: 'train', m: [0.8, 2.6], a: [0.2, 0.9], v: 1.2, push: 'the motor', fw: 'pull', back: 'friction', act: 'The motor pulls the model train round the track.', grams: true },
  { key: 'bowling', name: 'a bowling ball', the: 'the bowling ball', pic: 'ball', m: [4.5, 7.2], a: [5, 25], v: 9, push: "the bowler's hand", fw: 'push', back: 'friction', act: 'A bowler rolls the ball down the lane.', fric: false },
  { key: 'rhino', name: 'a charging rhino', the: 'the rhino', pic: 'animal', m: [1800, 2500], a: [1.5, 4], v: 12, push: "the rhino's legs", fw: 'push', back: 'air resistance', act: 'The rhino charges across the grass.', tonnes: true },
  { key: 'elephant', name: 'an elephant', the: 'the elephant', pic: 'animal', m: [2700, 6000], a: [0.5, 1.8], v: 6.5, push: "the elephant's legs", fw: 'push', back: 'air resistance', act: 'The elephant starts to run.', tonnes: true },
  { key: 'horse', name: 'a racehorse', the: 'the racehorse', pic: 'animal', m: [450, 550], a: [2, 6], v: 18, push: "the horse's legs", fw: 'push', back: 'air resistance', act: 'The racehorse bursts out of the starting gate.' },
  { key: 'cheetah', name: 'a cheetah', the: 'the cheetah', pic: 'animal', m: [35, 65], a: [5, 12], v: 28, push: "the cheetah's legs", fw: 'push', back: 'air resistance', act: 'The cheetah starts a chase.' },
  { key: 'elevator', name: 'an elevator', the: 'the elevator', pic: 'lift', m: [450, 1100], a: [0.5, 1.5], v: 3, push: 'the cable', fw: 'pull', back: 'friction', act: 'The cable pulls the elevator up the shaft.', fric: false, dir: 'up' },
  { key: 'rocketsled', name: 'a rocket sled', the: 'the rocket sled', pic: 'rocket', m: [800, 2400], a: [12, 60], v: 250, push: 'the rocket', fw: 'thrust', back: 'friction', act: 'The rocket fires and the sled shoots along the rails.', tonnes: true },
  { key: 'bus', name: 'a school bus', the: 'the bus', pic: 'truck', m: [9000, 13500], a: [0.8, 1.6], v: 15, push: 'the engine', fw: 'driving force', back: 'friction', act: 'The school bus pulls away from the stop.', tonnes: true },
  { key: 'truck', name: 'a delivery truck', the: 'the truck', pic: 'truck', m: [3500, 7500], a: [0.8, 2.2], v: 20, push: 'the engine', fw: 'driving force', back: 'friction', act: 'The delivery truck pulls out onto the road.', tonnes: true },
  { key: 'train', name: 'an electric train', the: 'the train', pic: 'train', m: [40000, 120000], a: [0.5, 1.2], v: 25, push: 'the motors', fw: 'driving force', back: 'friction', act: 'The electric train leaves the station.', tonnes: true },
  { key: 'motorboat', name: 'a motorboat', the: 'the motorboat', pic: 'boat', m: [900, 2200], a: [1, 3.5], v: 25, push: 'the engine', fw: 'thrust', back: 'water resistance', act: 'The motorboat races across the lake.', tonnes: true },
  { key: 'canoe', name: 'a canoe with one paddler', the: 'the canoe', pic: 'boat', m: [85, 120], a: [0.4, 1.5], v: 4, push: 'the paddle', fw: 'push', back: 'water resistance', act: 'The paddler digs the paddle into the water.' },
  { key: 'skydiver', name: 'a skydiver', the: 'the skydiver', pic: 'diver', m: [60, 100], a: [1.5, 9], v: 50, push: 'gravity', fw: 'weight', back: 'air resistance', act: 'The skydiver jumps out of the plane.', fric: false, fall: true, dir: 'down' }
];
const PR_THING = {}; PR_THINGS.forEach(t => { PR_THING[t.key] = t; });
/* skills, for the end screen (q.skill) */
const PR_SKILLS = { F: 'Find the force', a: 'Find the acceleration', m: 'Find the mass', res: 'Resultant force first', weight: 'Mass from weight', vel: 'Acceleration from velocity', three: 'Three-step problems', compare: 'Comparing two objects', units: 'Changing units' };

/* ---- every word a student reads. c = the story's names and numbers (already formatted), k = the same numbers for calculator keys ---- */
const PR_TEXT = {
  round: dp => `Give your answer to ${dp} decimal place${dp > 1 ? 's' : ''}.`,
  answer: (c, dp) => `Answer: ${c.ansU}${c.rounded ? ` (to ${dp} decimal place${dp > 1 ? 's' : ''})` : ''}`,
  traps: {
    mult: c => `You multiplied. Cover ${c.want} on the triangle: F is over ${c.other}, so divide.`,
    flip: c => `Check which number goes on top: force ÷ ${c.other === 'm' ? 'mass' : 'acceleration'}.`,
    div: () => 'You divided. Cover F on the triangle: m and a sit side by side, so multiply.',
    add: () => 'You added. Cover F on the triangle: m and a sit side by side, so multiply.',
    weightAsMass: c => `You used the weight in newtons as the mass. Find the mass first: weight ÷ ${c.g}.`,
    oneForce: c => c.oneSay || `${c.Back} is pushing ${c.bdir || 'back'} too. Work out the resultant force first.`,
    addOpp: () => 'These forces point opposite ways, so take the smaller from the bigger.',
    g10: () => 'Close! Force HQ uses g = 9.8 N/kg.',
    earthG: c => `Close! ${c.worldOn}, g is ${c.g} N/kg. You used the g for Earth.`,
    noConvert: c => c.from === 'g' ? 'Change the grams into kilograms first. Divide by 1,000.' : 'Change the tonnes into kilograms first. Multiply by 1,000.',
    convWay: c => c.from === 'g' ? 'Check your unit change. A gram is tiny, so divide by 1,000 to get kilograms.' : 'Check your unit change. A tonne is big, so multiply by 1,000 to get kilograms.',
    earlyRound: () => 'So close! Keep all the digits until the last step.',
    noFriction: c => `That's the resultant force. The ${c.fw} also has to beat ${c.back}, so add the ${c.back} on.`,
    subFric: c => `${c.Back} works against the ${c.fw}, so the ${c.fw} has to be bigger. Add the ${c.back} on.`,
    gaveResultant: c => `That's the resultant force. ${c.Back} = ${c.fw} − resultant force.`,
    noStart: () => 'Use the change in velocity. Take the smaller velocity from the bigger one.',
    noTime: () => 'Divide the change in velocity by the time first. That gives the acceleration.',
    dvTimes: () => 'You multiplied by the time. Acceleration = change in velocity ÷ time.',
    noWeight: c => `The weight pulls ${c.the} down too. Find the weight first: m × ${c.g}.`,
    notDiff: () => 'That is one of the two accelerations. Now take the smaller one from the bigger one.'
  },
  /* each kind: p = story templates (one is picked), hints = the 3-rung ladder, work = the worked answer, one line each */
  kinds: {
    findF: {
      p: [c => `${c.The} has a mass of ${c.m} kg. ${c.act} ${c.The} accelerates at ${c.a} m/s². What is the resultant force on ${c.the}?`,
        c => `${c.The} starts from still and accelerates at ${c.a} m/s². The mass of ${c.the} is ${c.m} kg. What resultant force acts on ${c.the}?`,
        c => `${c.The} is already moving. Then ${c.fwd} makes ${c.the} go faster, with an acceleration of ${c.a} m/s². The mass of ${c.the} is ${c.m} kg. What is the resultant force?`],
      hints: (c, k) => ['You want the force, so cover F on the formula triangle. Are m and a side by side, or one above the other?', `F = m × a = ${c.m} × ${c.a}`, `Type ${k.m} × ${k.a} into the calculator. Force is measured in N.`],
      work: c => ['F = m × a', `F = ${c.m} × ${c.a}`, `F = ${c.ansU}`]
    },
    findFbrake: {
      p: [c => `${c.The} is moving, then slows down. The velocity of ${c.the} drops by ${c.a} m/s every second. The mass of ${c.the} is ${c.m} kg. What size is the resultant force that slows ${c.the} down?`,
        c => `${c.The} has a mass of ${c.m} kg. ${c.The} slows down with an acceleration of ${c.a} m/s² backwards. What size is the resultant force on ${c.the}?`],
      hints: (c, k) => ['You want the size of the force, so cover F on the formula triangle. Slowing down is still an acceleration. What do you do with m and a?', `F = m × a = ${c.m} × ${c.a}`, `Type ${k.m} × ${k.a} into the calculator. Force is measured in N.`],
      work: c => ['F = m × a', `F = ${c.m} × ${c.a}`, `F = ${c.ansU}`]
    },
    findA: {
      p: [c => `A resultant force of ${c.F} N acts on ${c.the}. ${c.The} has a mass of ${c.m} kg. What is the acceleration of ${c.the}?${c.round}`,
        c => `${c.act} The resultant force on ${c.the} is ${c.F} N. The mass of ${c.the} is ${c.m} kg. How big is the acceleration of ${c.the}?${c.round}`],
      hints: (c, k) => ['You want the acceleration, so cover a on the formula triangle. Which letter is left on top?', `a = F ÷ m = ${c.F} ÷ ${c.m}`, `Type ${k.F} ÷ ${k.m} into the calculator. Acceleration is measured in m/s².`],
      work: c => ['a = F ÷ m', `a = ${c.F} ÷ ${c.m}`, `a = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    findAbrake: {
      p: [c => `${c.The} is moving. A resultant force of ${c.F} N acts backwards and slows ${c.the} down. The mass of ${c.the} is ${c.m} kg. What size is the acceleration of ${c.the}?${c.round}`],
      hints: (c, k) => ['You want the size of the acceleration, so cover a on the formula triangle. Which letter is left on top?', `a = F ÷ m = ${c.F} ÷ ${c.m}`, `Type ${k.F} ÷ ${k.m} into the calculator. Acceleration is measured in m/s².`],
      work: c => ['a = F ÷ m', `a = ${c.F} ÷ ${c.m}`, `a = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    findM: {
      p: [c => `A resultant force of ${c.F} N makes ${c.the} accelerate at ${c.a} m/s². What is the mass of ${c.the}?${c.round}`,
        c => `${c.act} The resultant force on ${c.the} is ${c.F} N. The acceleration is ${c.a} m/s². What is the mass of ${c.the}?${c.round}`],
      hints: (c, k) => ['You want the mass, so cover m on the formula triangle. Which letter is left on top?', `m = F ÷ a = ${c.F} ÷ ${c.a}`, `Type ${k.F} ÷ ${k.a} into the calculator. Mass is measured in kg.`],
      work: c => ['m = F ÷ a', `m = ${c.F} ÷ ${c.a}`, `m = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    decF: {
      p: [c => `${c.The} has a mass of ${c.m} kg. ${c.The} accelerates at ${c.a} m/s². What is the resultant force on ${c.the}?${c.round}`,
        c => `${c.act} The acceleration of ${c.the} is ${c.a} m/s². The mass of ${c.the} is ${c.m} kg. Work out the resultant force.${c.round}`],
      hints: (c, k) => ['You want the force, so cover F on the formula triangle. Are m and a side by side, or one above the other?', `F = m × a = ${c.m} × ${c.a}`, `Type ${k.m} × ${k.a} into the calculator. Then round to the number of decimal places asked for.`],
      work: c => ['F = m × a', `F = ${c.m} × ${c.a}`, `F = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    decA: {
      p: [c => `${c.The} has a mass of ${c.m} kg. The resultant force on ${c.the} is ${c.F} N. What is the acceleration of ${c.the}?${c.round}`,
        c => `${c.act} A resultant force of ${c.F} N acts on ${c.the}. The mass of ${c.the} is ${c.m} kg. Work out the acceleration.${c.round}`],
      hints: (c, k) => ['You want the acceleration, so cover a on the formula triangle. Which letter is left on top?', `a = F ÷ m = ${c.F} ÷ ${c.m}`, `Type ${k.F} ÷ ${k.m} into the calculator. Then round to the number of decimal places asked for.`],
      work: c => ['a = F ÷ m', `a = ${c.F} ÷ ${c.m}`, `a = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    decM: {
      p: [c => `A resultant force of ${c.F} N gives ${c.the} an acceleration of ${c.a} m/s². What is the mass of ${c.the}?${c.round}`,
        c => `${c.act} ${c.The} accelerates at ${c.a} m/s². The resultant force is ${c.F} N. Work out the mass of ${c.the}.${c.round}`],
      hints: (c, k) => ['You want the mass, so cover m on the formula triangle. Which letter is left on top?', `m = F ÷ a = ${c.F} ÷ ${c.a}`, `Type ${k.F} ÷ ${k.a} into the calculator. Then round to the number of decimal places asked for.`],
      work: c => ['m = F ÷ a', `m = ${c.F} ÷ ${c.a}`, `m = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    fricA: {
      p: [c => `${c.The} has a mass of ${c.m} kg. The ${c.fw} from ${c.push} is ${c.P} N forwards. ${c.Back} is ${c.f} N backwards. What is the acceleration of ${c.the}?${c.round}`,
        c => `${c.act} The ${c.fw} is ${c.P} N, and ${c.back} is ${c.f} N. The mass of ${c.the} is ${c.m} kg. What is the acceleration of ${c.the}?${c.round}`],
      hints: (c, k) => [`Step 1 is the resultant force. The ${c.fw} and ${c.back} point opposite ways. Do you add them, or take one away?`, `Resultant force = ${c.P} − ${c.f}. Then a = F ÷ m, with m = ${c.m} kg.`, `Type (${k.P} − ${k.f}) ÷ ${k.m} into the calculator. Use the brackets.`],
      work: c => [`Step 1: Resultant force = ${c.P} − ${c.f} = ${c.net} N`, `Step 2: a = F ÷ m = ${c.net} ÷ ${c.m} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    fricM: {
      p: [c => `${c.The} accelerates at ${c.a} m/s². The ${c.fw} from ${c.push} is ${c.P} N. ${c.Back} is ${c.f} N. What is the mass of ${c.the}?${c.round}`],
      hints: (c, k) => [`Step 1 is the resultant force. The ${c.fw} and ${c.back} point opposite ways. Do you add them, or take one away?`, `Resultant force = ${c.P} − ${c.f}. Then m = F ÷ a, with a = ${c.a} m/s².`, `Type (${k.P} − ${k.f}) ÷ ${k.a} into the calculator. Use the brackets.`],
      work: c => [`Step 1: Resultant force = ${c.P} − ${c.f} = ${c.net} N`, `Step 2: m = F ÷ a = ${c.net} ÷ ${c.a} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    oppA: {
      p: [c => `Two friends push ${c.the} from opposite sides. One pushes with ${c.P} N. The other pushes back with ${c.f} N. The mass of ${c.the} is ${c.m} kg. Ignore friction. What is the acceleration of ${c.the}?${c.round}`,
        c => `A tug of war! Two ropes pull ${c.the} in opposite directions. One rope pulls with ${c.P} N, and the other pulls with ${c.f} N. The mass of ${c.the} is ${c.m} kg. Ignore friction. What is the acceleration of ${c.the}?${c.round}`],
      hints: (c, k) => ['Step 1 is the resultant force. The two forces point opposite ways. Do you add them, or take one away?', `Resultant force = ${c.P} − ${c.f}. Then a = F ÷ m, with m = ${c.m} kg.`, `Type (${k.P} − ${k.f}) ÷ ${k.m} into the calculator. Use the brackets.`],
      work: c => [`Step 1: Resultant force = ${c.P} − ${c.f} = ${c.net} N`, `Step 2: a = F ÷ m = ${c.net} ÷ ${c.m} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    needPull: {
      p: [c => `${c.The} has a mass of ${c.m} kg. ${c.Back} on ${c.the} is ${c.f} N. What ${c.fw} is needed to give ${c.the} an acceleration of ${c.a} m/s²?${c.round}`,
        c => `You want ${c.the} to accelerate at ${c.a} m/s². The mass of ${c.the} is ${c.m} kg. ${c.Back} is ${c.f} N. How big must the ${c.fw} be?${c.round}`],
      hints: (c, k) => [`Step 1 is the resultant force you need: F = m × a. Then, does the ${c.fw} also have to beat ${c.back}?`, `Resultant force = ${c.m} × ${c.a}. ${c.Fw} = resultant force + ${c.f}.`, `Type ${k.m} × ${k.a} + ${k.f} into the calculator.`],
      work: c => [`Step 1: Resultant force = m × a = ${c.m} × ${c.a} = ${c.net} N`, `Step 2: ${c.Fw} = resultant force + ${c.back} = ${c.net} + ${c.f} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    findFric: {
      p: [c => `The ${c.fw} on ${c.the} is ${c.P} N. ${c.The} has a mass of ${c.m} kg and accelerates at ${c.a} m/s². How big is the ${c.back}?${c.round}`],
      hints: (c, k) => [`Step 1 is the resultant force: F = m × a. How is the ${c.back} linked to the ${c.fw} and the resultant force?`, `Resultant force = ${c.m} × ${c.a}. ${c.Back} = ${c.P} − resultant force.`, `Type ${k.P} − ${k.m} × ${k.a} into the calculator.`],
      work: c => [`Step 1: Resultant force = m × a = ${c.m} × ${c.a} = ${c.net} N`, `Step 2: ${c.Back} = ${c.fw} − resultant force = ${c.P} − ${c.net} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    weightF: {
      p: [c => `${c.The} has a weight of ${c.W} N. ${c.act} ${c.The} accelerates at ${c.a} m/s². What resultant force acts on ${c.the}? On Earth, g = 9.8 N/kg.${c.round}`],
      hints: (c, k) => ['Step 1 is the mass. Weight is a force in newtons. How do you turn a weight into a mass?', `m = ${c.W} ÷ ${c.g}. Then F = m × ${c.a}.`, `Type ${k.W} ÷ ${k.g} × ${k.a} into the calculator.`],
      work: c => [`Step 1: m = weight ÷ g = ${c.W} ÷ ${c.g} = ${c.mid1} kg`, `Step 2: F = m × a = ${c.mid1} × ${c.a} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    weightA: {
      p: [c => `${c.The} has a weight of ${c.W} N. A resultant force of ${c.F} N acts on ${c.the}. What is the acceleration of ${c.the}? On Earth, g = 9.8 N/kg.${c.round}`],
      hints: (c, k) => ['Step 1 is the mass. Weight is a force in newtons. How do you turn a weight into a mass?', `m = ${c.W} ÷ ${c.g}. Then a = ${c.F} ÷ m.`, `Type ${k.F} ÷ (${k.W} ÷ ${k.g}) into the calculator. Use the brackets.`],
      work: c => [`Step 1: m = weight ÷ g = ${c.W} ÷ ${c.g} = ${c.mid1} kg`, `Step 2: a = F ÷ m = ${c.F} ÷ ${c.mid1} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    worldF: {
      p: [c => `${c.worldOn}, g = ${c.g} N/kg. ${c.The} has a weight of ${c.W} N there. ${c.The} accelerates at ${c.a} m/s². What resultant force acts on ${c.the}?${c.round}`],
      hints: (c, k) => [`Step 1 is the mass. Which g do you use ${c.worldOn.replace('On', 'on')}?`, `m = ${c.W} ÷ ${c.g}. Then F = m × ${c.a}.`, `Type ${k.W} ÷ ${k.g} × ${k.a} into the calculator. Type the number ${k.g}, not the g key.`],
      work: c => [`Step 1: m = weight ÷ g = ${c.W} ÷ ${c.g} = ${c.mid1} kg`, `Step 2: F = m × a = ${c.mid1} × ${c.a} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    worldA: {
      p: [c => `${c.worldOn}, g = ${c.g} N/kg. ${c.The} has a weight of ${c.W} N there. A resultant force of ${c.F} N acts on ${c.the}. What is the acceleration of ${c.the}?${c.round}`],
      hints: (c, k) => [`Step 1 is the mass. Which g do you use ${c.worldOn.replace('On', 'on')}?`, `m = ${c.W} ÷ ${c.g}. Then a = ${c.F} ÷ m.`, `Type ${k.F} ÷ (${k.W} ÷ ${k.g}) into the calculator. Use the brackets, and type the number ${k.g}, not the g key.`],
      work: c => [`Step 1: m = weight ÷ g = ${c.W} ÷ ${c.g} = ${c.mid1} kg`, `Step 2: a = F ÷ m = ${c.F} ÷ ${c.mid1} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    dvF: {
      p: [c => `${c.The} has a mass of ${c.m} kg. ${c.act} ${c.The} goes ${c.dvTxt} in ${c.t} s. What resultant force acts on ${c.the}?${c.round}`,
        c => `In ${c.t} s, ${c.the} goes ${c.dvTxt}. The mass of ${c.the} is ${c.m} kg. Work out the resultant force on ${c.the}.${c.round}`],
      hints: (c, k) => ['Step 1 is the acceleration. How much does the velocity change, and how long does that take?', `a = (v − u) ÷ t = (${c.v} − ${c.u}) ÷ ${c.t}. Then F = ${c.m} × a.`, `Type (${k.v} − ${k.u}) ÷ ${k.t} × ${k.m} into the calculator. Use the brackets.`],
      work: c => [`Step 1: a = (v − u) ÷ t = (${c.v} − ${c.u}) ÷ ${c.t} = ${c.mid1} m/s²`, `Step 2: F = m × a = ${c.m} × ${c.mid1} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    dvM: {
      p: [c => `${c.act} The resultant force on ${c.the} is ${c.F} N. ${c.The} goes ${c.dvTxt} in ${c.t} s. What is the mass of ${c.the}?${c.round}`],
      hints: (c, k) => ['Step 1 is the acceleration. How much does the velocity change, and how long does that take?', `a = (${c.v} − ${c.u}) ÷ ${c.t}. Then m = ${c.F} ÷ a.`, `Type ${k.F} ÷ ((${k.v} − ${k.u}) ÷ ${k.t}) into the calculator. Use the brackets.`],
      work: c => [`Step 1: a = (v − u) ÷ t = (${c.v} − ${c.u}) ÷ ${c.t} = ${c.mid1} m/s²`, `Step 2: m = F ÷ a = ${c.F} ÷ ${c.mid1} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    brakeDv: {
      p: [c => `${c.The} has a mass of ${c.m} kg. ${c.The} ${c.slowTxt} in ${c.t} s. What size is the resultant force that slows ${c.the} down?${c.round}`],
      hints: (c, k) => ['Step 1 is the acceleration. By how much does the velocity drop, and how long does that take?', `a = (${c.u} − ${c.v}) ÷ ${c.t}. Then F = ${c.m} × a.`, `Type (${k.u} − ${k.v}) ÷ ${k.t} × ${k.m} into the calculator. Use the brackets.`],
      work: c => [`Step 1: a = (${c.u} − ${c.v}) ÷ ${c.t} = ${c.mid1} m/s² (slowing down)`, `Step 2: F = m × a = ${c.m} × ${c.mid1} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    engine: {
      p: [c => `${c.The} has a mass of ${c.m} kg. ${c.Back} on ${c.the} is ${c.f} N. The ${c.fw} must take ${c.the} ${c.dvTxt} in ${c.t} s. How big must the ${c.fw} be?${c.round}`,
        c => `You want ${c.the} to go ${c.dvTxt} in ${c.t} s. The mass of ${c.the} is ${c.m} kg. ${c.Back} is ${c.f} N. What ${c.fw} do you need?${c.round}`],
      hints: (c, k) => [`Step 1 is the acceleration, from the change in velocity. Then what do you need before you can add on the ${c.back}?`, `a = (${c.v} − ${c.u}) ÷ ${c.t}. Resultant force = ${c.m} × a. ${c.Fw} = resultant force + ${c.f}.`, `Type (${k.v} − ${k.u}) ÷ ${k.t} × ${k.m} + ${k.f} into the calculator. Use the brackets.`],
      work: c => [`Step 1: a = (v − u) ÷ t = (${c.v} − ${c.u}) ÷ ${c.t} = ${c.mid1} m/s²`, `Step 2: Resultant force = m × a = ${c.m} × ${c.mid1} = ${c.mid2} N`, `Step 3: ${c.Fw} = resultant force + ${c.back} = ${c.mid2} + ${c.f} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    weightFric: {
      p: [c => `${c.The} has a weight of ${c.W} N. The ${c.fw} from ${c.push} is ${c.P} N. ${c.Back} is ${c.f} N. What is the acceleration of ${c.the}? On Earth, g = 9.8 N/kg.${c.round}`],
      hints: (c, k) => ['There are three steps. Step 1 is the mass. How do you turn a weight into a mass?', `m = ${c.W} ÷ ${c.g}. Resultant force = ${c.P} − ${c.f}. Then a = F ÷ m.`, `Type (${k.P} − ${k.f}) ÷ (${k.W} ÷ ${k.g}) into the calculator. Use the brackets.`],
      work: c => [`Step 1: m = weight ÷ g = ${c.W} ÷ ${c.g} = ${c.mid1} kg`, `Step 2: Resultant force = ${c.P} − ${c.f} = ${c.net} N`, `Step 3: a = F ÷ m = ${c.net} ÷ ${c.mid1} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    fall: {
      p: [c => `${c.The} has a mass of ${c.m} kg. ${c.act} Air resistance pushes up on ${c.the} with ${c.f} N. What is the acceleration of ${c.the}? On Earth, g = 9.8 N/kg.${c.round}`],
      hints: (c, k) => [`Step 1 is the weight, which pulls ${c.the} down. How do you get the weight from the mass?`, `Weight = ${c.m} × ${c.g}. Resultant force = weight − ${c.f}. Then a = F ÷ m.`, `Type (${k.m} × ${k.g} − ${k.f}) ÷ ${k.m} into the calculator. Use the brackets.`],
      work: c => [`Step 1: Weight = m × g = ${c.m} × ${c.g} = ${c.mid1} N`, `Step 2: Resultant force = ${c.mid1} − ${c.f} = ${c.mid2} N (downwards)`, `Step 3: a = F ÷ m = ${c.mid2} ÷ ${c.m} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    compare: {
      p: [c => `${c.A.The} has a mass of ${c.mA} kg. The resultant force on ${c.A.the} is ${c.FA} N. ${c.B.The} has a mass of ${c.mB} kg. The resultant force on ${c.B.the} is ${c.FB} N. Work out both accelerations. How much bigger is the bigger one?${c.round}`],
      hints: (c, k) => [`Step 1 is the acceleration of ${c.A.the}. Cover a on the triangle. Then do the same for ${c.B.the}.`, `a = ${c.FA} ÷ ${c.mA} and a = ${c.FB} ÷ ${c.mB}. Then take the smaller from the bigger.`, `Type ${k.big} into the calculator.`],
      work: c => [`Step 1: ${c.A.The}: a = ${c.FA} ÷ ${c.mA} = ${c.aA} m/s²`, `Step 2: ${c.B.The}: a = ${c.FB} ÷ ${c.mB} = ${c.aB} m/s²`, `Step 3: Difference = ${c.diffTxt} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    massDv: {
      p: [c => `The ${c.fw} from ${c.push} is ${c.P} N. ${c.Back} is ${c.f} N. ${c.The} goes ${c.dvTxt} in ${c.t} s. What is the mass of ${c.the}?${c.round}`],
      hints: (c, k) => [`Step 1 is the resultant force: the ${c.fw} take away the ${c.back}. What else do you need before you can find m?`, `Resultant force = ${c.P} − ${c.f}. a = (${c.v} − ${c.u}) ÷ ${c.t}. Then m = F ÷ a.`, `Type (${k.P} − ${k.f}) ÷ ((${k.v} − ${k.u}) ÷ ${k.t}) into the calculator. Use the brackets.`],
      work: c => [`Step 1: Resultant force = ${c.P} − ${c.f} = ${c.net} N`, `Step 2: a = (v − u) ÷ t = (${c.v} − ${c.u}) ÷ ${c.t} = ${c.mid1} m/s²`, `Step 3: m = F ÷ a = ${c.net} ÷ ${c.mid1} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    unitsG: {
      p: [c => c.find === 'F' ? `${c.The} has a mass of ${c.mg} g. ${c.act} ${c.The} accelerates at ${c.a} m/s². What resultant force acts on ${c.the}?${c.round}`
        : `${c.The} has a mass of ${c.mg} g. ${c.act} The resultant force on ${c.the} is ${c.F} N. What is the acceleration of ${c.the}?${c.round}`],
      hints: (c, k) => ['Step 1: change the mass into kilograms. How many grams are there in 1 kg?', c.find === 'F' ? `m = ${c.mg} ÷ 1,000 kg. Then F = m × ${c.a}.` : `m = ${c.mg} ÷ 1,000 kg. Then a = ${c.F} ÷ m.`,
        c.find === 'F' ? `Type ${k.mg} ÷ 1000 × ${k.a} into the calculator.` : `Type ${k.F} ÷ (${k.mg} ÷ 1000) into the calculator. Use the brackets.`],
      work: c => [`Step 1: m = ${c.mg} ÷ 1,000 = ${c.mkg} kg`, c.find === 'F' ? `Step 2: F = m × a = ${c.mkg} × ${c.a} = ${c.exactU}` : `Step 2: a = F ÷ m = ${c.F} ÷ ${c.mkg} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    },
    unitsT: {
      p: [c => c.find === 'F' ? `${c.The} has a mass of ${c.mt} tonnes. ${c.act} ${c.The} accelerates at ${c.a} m/s². What resultant force acts on ${c.the}?${c.round}`
        : `${c.The} has a mass of ${c.mt} tonnes. ${c.act} The resultant force on ${c.the} is ${c.F} N. What is the acceleration of ${c.the}?${c.round}`],
      hints: (c, k) => ['Step 1: change the mass into kilograms. How many kilograms are there in 1 tonne?', c.find === 'F' ? `m = ${c.mt} × 1,000 kg. Then F = m × ${c.a}.` : `m = ${c.mt} × 1,000 kg. Then a = ${c.F} ÷ m.`,
        c.find === 'F' ? `Type ${k.mt} × 1000 × ${k.a} into the calculator.` : `Type ${k.F} ÷ (${k.mt} × 1000) into the calculator. Use the brackets.`],
      work: c => [`Step 1: m = ${c.mt} × 1,000 = ${c.mkg} kg`, c.find === 'F' ? `Step 2: F = m × a = ${c.mkg} × ${c.a} = ${c.exactU}` : `Step 2: a = F ÷ m = ${c.F} ÷ ${c.mkg} = ${c.exactU}`, PR_TEXT.answer(c, c.dp)]
    }
  }
};

/* ---- numbers ---- */
const prRd = (v, dp) => Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp);
/* shown to students: dp given = fixed decimals, else as stored (up to 4 dp, no trailing zeros); commas from 1,000 (parseNum strips them) */
function prFmt(v, dp) {
  const s = dp == null ? String(+(+v).toFixed(4)) : (+v).toFixed(dp), neg = s[0] === '-', [i, d] = (neg ? s.slice(1) : s).split('.');
  return (neg ? '-' : '') + (i.length > 3 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : i) + (d ? '.' + d : '');
}
const prKey = v => String(+(+v).toFixed(4));   // calculator keys: no commas
const prMid = v => Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-6 ? prFmt(v) : prFmt(v, 3) + '…';   // a middle step: all the digits kept
const prTol = (v, dp) => Math.max(0.5 / Math.pow(10, dp), Math.abs(v) >= 1000 ? Math.abs(v) * 0.01 : 0);
const prDecs = v => { const s = String(+(+v).toFixed(6)); return s.includes('.') ? s.split('.')[1].length : 0; };

/* ---- the kinds of question: level, skill, steps, gate (opts key that must be true) and the maths.
   make(H) returns { t, given, find, unit, exact, dp?, traps: [[key, value]], c, arrows?, massOf? } or null to try again. ---- */
const PR_WHOLE = t => t.m[0] >= 3 && t.m[1] - t.m[0] >= 4, PR_FRIC = t => t.fric !== false;
const PR_KINDS = {
  findF: { level: 1, skill: 'F', steps: 1, desc: 'Find F from whole-number m and a', make(H) {
    const t = H.thing(PR_WHOLE), m = H.val(t.m[0], t.m[1], 0), a = H.val(t.a[0], t.a[1], 1), F = m * a;
    return { t, given: { m, a }, find: 'F', unit: 'N', exact: F, dp: prDecs(prRd(F, 1)), traps: [['div', m / a], ['add', m + a]], c: { m: prFmt(m), a: prFmt(a) }, k: { m, a } }; } },
  findFbrake: { level: 1, skill: 'F', steps: 1, desc: 'Find the force that slows something down', make(H) {
    const t = H.thing(x => PR_WHOLE(x) && PR_FRIC(x)), m = H.val(t.m[0], t.m[1], 0), a = H.val(t.a[0], t.a[1], 1), F = m * a;
    return { t, given: { m, a }, find: 'F', unit: 'N', exact: F, dp: prDecs(prRd(F, 1)), traps: [['div', m / a], ['add', m + a]], c: { m: prFmt(m), a: prFmt(a) }, k: { m, a } }; } },
  findA: { level: 2, skill: 'a', steps: 1, desc: 'Find a = F ÷ m', make(H) { return H.oneA(PR_WHOLE, 0); } },
  findAbrake: { level: 2, skill: 'a', steps: 1, desc: 'Find the size of a slowing-down acceleration', make(H) { return H.oneA(x => PR_WHOLE(x) && PR_FRIC(x), 0); } },
  findM: { level: 2, skill: 'm', steps: 1, desc: 'Find m = F ÷ a', make(H) { return H.oneM(PR_WHOLE, 0); } },
  decF: { level: 3, skill: 'F', steps: 1, desc: 'Find F with decimals in m and a', make(H) {
    const t = H.thing(), m = H.val(t.m[0], t.m[1], H.mDec(t)), a = H.val(t.a[0], t.a[1], H.aDec(t)), F = m * a;
    return { t, given: { m, a }, find: 'F', unit: 'N', exact: F, traps: [['div', m / a], ['add', m + a]], c: { m: prFmt(m), a: prFmt(a) }, k: { m, a } }; } },
  decA: { level: 3, skill: 'a', steps: 1, desc: 'Find a with decimals in F and m', make(H) { return H.oneA(null, 1); } },
  decM: { level: 3, skill: 'm', steps: 1, desc: 'Find m with decimals in F and a', make(H) { return H.oneM(null, 1); } },
  fricA: { level: 4, skill: 'res', steps: 2, desc: 'Resultant = pull − friction, then a', make(H) { return H.twoForce('a', PR_FRIC); } },
  fricM: { level: 4, skill: 'res', steps: 2, desc: 'Resultant = pull − friction, then m', make(H) { return H.twoForce('m', PR_FRIC); } },
  oppA: { level: 4, skill: 'res', steps: 2, desc: 'Two opposite pushes or pulls (no friction), then a', make(H) { return H.twoForce('a', t => t.tug, true); } },
  needPull: { level: 4, skill: 'res', steps: 2, desc: 'Pull needed for a target a against friction (m × a + friction)', make(H) {
    const t = H.thing(PR_FRIC), m = H.mass(t), a = H.val(t.a[0], t.a[1], H.aDec(t)), net = m * a, fd = net >= 100 ? 0 : 1, f = H.val(net * 0.2, net * 1.5, fd), P = net + f;
    return { t, given: { m, a, f }, find: 'P', unit: 'N', exact: P, traps: [['noFriction', net], ['subFric', net - f]], c: { m: prFmt(m), a: prFmt(a), f: prFmt(f), net: prMid(net) }, k: { m, a, f },
      arrows: [H.arrow('fw', null, t), H.arrow('back', f, t)] }; } },
  findFric: { level: 4, skill: 'res', steps: 2, desc: 'Friction = pull − m × a', make(H) {
    const t = H.thing(PR_FRIC), m = H.mass(t), a = H.val(t.a[0], t.a[1], H.aDec(t)), net = m * a, fd = net >= 100 ? 0 : 1, P = H.val(net * 1.2, net * 2.4, fd), f = P - net;
    return { t, given: { m, a, P }, find: 'f', unit: 'N', exact: f, traps: [['gaveResultant', net], ['addOpp', P + net]], c: { m: prFmt(m), a: prFmt(a), P: prFmt(P), net: prMid(net) }, k: { m, a, P },
      arrows: [H.arrow('fw', P, t), H.arrow('back', null, t)] }; } },
  weightF: { level: 5, skill: 'weight', steps: 2, desc: 'Mass from weight (÷ 9.8), then F = m × a', make(H) { return H.weight('F', null); } },
  weightA: { level: 5, skill: 'weight', steps: 2, desc: 'Mass from weight (÷ 9.8), then a = F ÷ m', make(H) { return H.weight('a', null); } },
  dvF: { level: 5, skill: 'vel', steps: 2, desc: 'a = (v − u) ÷ t, then F = m × a', make(H) { return H.dv('F'); } },
  dvM: { level: 5, skill: 'vel', steps: 2, desc: 'a = (v − u) ÷ t, then m = F ÷ a', make(H) { return H.dv('m'); } },
  brakeDv: { level: 5, skill: 'vel', steps: 2, desc: 'Slowing down: a = (u − v) ÷ t, then F', make(H) { return H.dv('brake'); } },
  worldF: { level: 5, skill: 'weight', steps: 2, gate: 'worlds', desc: 'Another world: mass = weight ÷ that world\'s g, then F', make(H) { return H.weight('F', true); } },
  worldA: { level: 5, skill: 'weight', steps: 2, gate: 'worlds', desc: 'Another world: mass = weight ÷ that world\'s g, then a', make(H) { return H.weight('a', true); } },
  engine: { level: 6, skill: 'three', steps: 3, desc: 'a from velocities, resultant = m × a, then add friction for the engine force', make(H) { return H.dv('engine'); } },
  weightFric: { level: 6, skill: 'three', steps: 3, desc: 'Mass from weight, resultant = pull − friction, then a', make(H) {
    const t = H.thing(x => PR_FRIC(x) && x.m[1] <= 20000), m0 = H.uni(t.m[0], t.m[1]), W = H.val(m0 * 9.8 * 0.98, m0 * 9.8 * 1.02, m0 * 9.8 >= 100 ? 1 : 2), m = W / 9.8;
    if (m < t.m[0] || m > t.m[1]) return null;
    const a0 = H.uni(t.a[0], t.a[1]), net0 = m * a0, fd = net0 >= 100 ? 0 : 1, f = H.val(net0 * 0.2, net0 * 1.2, fd), P = H.val((net0 + f) * 0.98, (net0 + f) * 1.02, fd), net = P - f; if (net <= 0) return null;
    const a = net / m;
    return { t, given: { W, P, f, g: 9.8 }, find: 'a', unit: 'm/s²', exact: a, traps: [['weightAsMass', net / W], ['oneForce', P / m], ['addOpp', (P + f) / m], ['g10', net / (W / 10)], ['earlyRound', net / prRd(m, 1)]],
      c: { W: prFmt(W), P: prFmt(P), f: prFmt(f), g: '9.8', mid1: prMid(m), net: prMid(net) }, k: { W, P, f, g: 9.8 }, arrows: [H.arrow('fw', P, t), H.arrow('back', f, t)] }; } },
  fall: { level: 6, skill: 'three', steps: 3, desc: 'Falling: weight = m × 9.8, minus air resistance, then a', make(H) {
    const t = H.thing(x => x.fall), m = H.val(t.m[0], t.m[1], 0), a0 = H.uni(t.a[0], t.a[1]), D = H.val(m * (9.8 - a0) * 0.97, m * (9.8 - a0) * 1.03, 0), W = m * 9.8, a = (W - D) / m;
    if (a <= 0) return null;
    return { t, given: { m, f: D, g: 9.8 }, find: 'a', unit: 'm/s²', exact: a, traps: [['oneForce', 9.8], ['noWeight', D / m], ['g10', (m * 10 - D) / m], ['addOpp', (W + D) / m]],
      c: { m: prFmt(m), f: prFmt(D), g: '9.8', mid1: prMid(W), mid2: prMid(W - D), Back: 'Air resistance', bdir: 'up' }, k: { m, f: D, g: 9.8 },
      arrows: [{ dir: 'down', label: '? N', name: 'weight' }, { dir: 'up', label: prFmt(D) + ' N', name: 'air resistance' }] }; } },
  compare: { level: 6, skill: 'compare', steps: 3, desc: 'Two objects: how much bigger is one acceleration than the other', make(H) {
    const A = H.thing(PR_WHOLE), B = H.thing(x => PR_WHOLE(x) && x.key !== A.key), side = t => { const m = H.val(t.m[0], t.m[1], 0), a0 = H.uni(t.a[0], t.a[1]), F = H.val(m * a0 * 0.97, m * a0 * 1.03, m * a0 >= 100 ? 0 : 1); return { m, F, a: F / m }; };
    const sa = side(A), sb = side(B), d = Math.abs(sa.a - sb.a); if (d < 0.3) return null;
    const big = sa.a > sb.a ? sa : sb, small = sa.a > sb.a ? sb : sa;
    return { t: A, t2: B, given: { mA: sa.m, FA: sa.F, mB: sb.m, FB: sb.F, thing2: B.key }, find: 'da', unit: 'm/s²', exact: d, traps: [['notDiff', big.a], ['notDiff', small.a]],
      c: { A: H.names(A), B: H.names(B), mA: prFmt(sa.m), FA: prFmt(sa.F), mB: prFmt(sb.m), FB: prFmt(sb.F), aA: prMid(sa.a), aB: prMid(sb.a), diffTxt: `${prMid(big.a)} − ${prMid(small.a)}` },
      k: { big: `${prKey(big.F)} ÷ ${prKey(big.m)} − ${prKey(small.F)} ÷ ${prKey(small.m)}` } }; } },
  massDv: { level: 6, skill: 'three', steps: 3, desc: 'Resultant = pull − friction, a from velocities, then m = F ÷ a', make(H) { return H.dv('massDv'); } },
  unitsG: { level: 6, skill: 'units', steps: 2, gate: 'units', units2: true, desc: 'Mass in grams: ÷ 1,000 to get kg, then F or a', make(H) { return H.units('g'); } },
  unitsT: { level: 6, skill: 'units', steps: 2, gate: 'units', units2: true, desc: 'Mass in tonnes: × 1,000 to get kg, then F or a', make(H) { return H.units('t'); } }
};
const PR_LEVEL_KINDS = [1, 2, 3, 4, 5, 6].map(l => Object.keys(PR_KINDS).filter(k => PR_KINDS[k].level === l));

/* the helpers each kind's make() uses; R is the seeded random number source */
function prHelpers(R) {
  const H = {
    uni: (a, b) => a + R() * (b - a),
    pick: arr => arr[Math.floor(R() * arr.length)],
    thing: f => H.pick(f ? PR_THINGS.filter(f) : PR_THINGS),
    /* a non-round value in [lo, hi] with dp decimals: the last digit is not 0 (whole numbers: not a multiple of 10) */
    val(lo, hi, dp) { let x = prRd(lo, dp); for (let i = 0; i < 40; i++) { x = prRd(H.uni(lo, hi), dp); if (x < lo || x > hi || x <= 0) continue; if (dp > 0 ? Math.round(x * Math.pow(10, dp)) % 10 === 0 : x >= 20 && x % 10 === 0) continue; return x; } return x; },
    mDec: t => t.m[1] < 0.1 ? 3 : t.m[1] < 10 ? 2 : 1,
    aDec: t => t.a[1] < 10 ? 2 : 1,
    mass: t => t.m[1] >= 10 ? H.val(t.m[0], t.m[1], 0) : H.val(t.m[0], t.m[1], H.mDec(t)),
    names: t => { const the = t.the || t.name; return { the, The: the[0].toUpperCase() + the.slice(1) }; },
    arrow: (which, v, t) => ({ dir: which === 'fw' ? (t.dir || 'right') : ({ right: 'left', up: 'down', down: 'up' })[t.dir || 'right'], label: v == null ? '? N' : prFmt(v) + ' N', name: which === 'fw' ? t.fw : t.back }),
    /* one step, find a (dec: decimals in the givens) */
    oneA(f, dec) {
      const t = H.thing(f), m = dec ? H.val(t.m[0], t.m[1], H.mDec(t)) : H.val(t.m[0], t.m[1], 0), a0 = H.uni(t.a[0], t.a[1]), F0 = m * a0;
      const F = H.val(F0 * 0.95, F0 * 1.05, dec ? (F0 < 100 ? 2 : 1) : (F0 >= 100 ? 0 : 1)), a = F / m;
      return { t, given: { F, m }, find: 'a', unit: 'm/s²', exact: a, traps: [['mult', F * m], ['flip', m / F]], c: { F: prFmt(F), m: prFmt(m), want: 'a', other: 'm' }, k: { F, m } };
    },
    oneM(f, dec) {
      const t = H.thing(f), a = dec ? H.val(t.a[0], t.a[1], H.aDec(t)) : H.val(t.a[0], t.a[1], 1), m0 = H.uni(t.m[0], t.m[1]), F0 = m0 * a;
      const F = H.val(F0 * 0.97, F0 * 1.03, dec ? (F0 < 100 ? 2 : 1) : (F0 >= 100 ? 0 : 1)), m = F / a;
      return { t, given: { F, a }, find: 'm', unit: 'kg', exact: m, massOf: t, traps: [['mult', F * a], ['flip', a / F]], c: { F: prFmt(F), a: prFmt(a), want: 'm', other: 'a' }, k: { F, a } };
    },
    /* pull vs friction (or two opposite pushes), then a or m */
    twoForce(find, f, opp) {
      const t = H.thing(f), m = H.mass(t), a0 = H.uni(t.a[0], t.a[1]), net0 = m * a0, f0 = net0 * H.uni(0.2, 1.4), fd = net0 + f0 >= 100 ? 0 : 1;
      const P = H.val((net0 + f0) * 0.98, (net0 + f0) * 1.02, fd), fr = H.val(f0 * 0.97, f0 * 1.03, fd), net = P - fr; if (net <= 0) return null;
      const s = { t, find, traps: [], c: { P: prFmt(P), f: prFmt(fr), net: prMid(net) }, k: { P, f: fr } };
      if (find === 'a') Object.assign(s, { given: { P, f: fr, m }, unit: 'm/s²', exact: net / m, traps: [['oneForce', P / m], ['addOpp', (P + fr) / m], ['mult', net * m]] }, { c: Object.assign(s.c, { m: prFmt(m), want: 'a', other: 'm' }), k: Object.assign(s.k, { m }) });
      else { const a = H.val(t.a[0], t.a[1], H.aDec(t)); Object.assign(s, { given: { P, f: fr, a }, unit: 'kg', exact: net / a, massOf: t, traps: [['oneForce', P / a], ['addOpp', (P + fr) / a], ['mult', net * a]] }); Object.assign(s.c, { a: prFmt(a), want: 'm', other: 'a' }); s.k.a = a; }
      if (opp) { s.v = H.pick([0, 1]); s.c.oneSay = 'The other force acts too. Work out the resultant force first.'; const nm = s.v ? 'pull' : 'push'; s.arrows = [{ dir: 'right', label: prFmt(P) + ' N', name: nm }, { dir: 'left', label: prFmt(fr) + ' N', name: nm }]; }
      else s.arrows = [H.arrow('fw', P, t), H.arrow('back', fr, t)];
      return s;
    },
    /* mass from weight (Earth, or another world when w), then F or a */
    weight(find, w) {
      const t = H.thing(w ? (x => x.worlds) : (x => x.m[1] <= 20000)); let g = 9.8, world = null;   // weights stay under 200,000 N
      if (w) { world = H.pick(['moon', 'mars', 'venus', 'titan'].concat(t.jupiter ? ['jupiter'] : [])); g = DZ_WORLDS[world].g; }
      const m0 = H.uni(t.m[0], t.m[1]), W0 = m0 * g, W = H.val(W0 * 0.98, W0 * 1.02, W0 >= 100 ? 1 : W0 >= 1 ? 2 : 3), m = W / g;
      if (m < t.m[0] || m > t.m[1]) return null;
      const s = { t, find, world, c: { W: prFmt(W), g: prFmt(g), mid1: prMid(m) }, k: { W, g } }, mr = prRd(m, m < 1 ? 2 : 1), aw = w ? 'earthG' : 'g10', gw = w ? 9.8 : 10;
      if (w) s.c.worldOn = DZ_WORLDS[world].on.replace(/^on/, 'On');
      if (find === 'F') { const a = H.val(t.a[0], t.a[1], H.aDec(t)); Object.assign(s, { given: { W, a, g }, unit: 'N', exact: m * a, traps: [['weightAsMass', W * a], [aw, W / gw * a], ['earlyRound', mr * a]] }); s.c.a = prFmt(a); s.k.a = a; }
      else { const a0 = H.uni(t.a[0], t.a[1]), F0 = m * a0, F = H.val(F0 * 0.97, F0 * 1.03, F0 >= 100 ? 1 : 2);
        Object.assign(s, { given: { W, F, g }, unit: 'm/s²', exact: F / m, traps: [['weightAsMass', F / W], [aw, F / (W / gw)], ['flip', m / F], ['earlyRound', F / mr]] }); Object.assign(s.c, { F: prFmt(F), want: 'a', other: 'm' }); s.k.F = F; }
      return s;
    },
    /* velocities: a = (v − u) ÷ t, then F, m, a braking force, an engine force (3 steps) or a mass with friction (3 steps) */
    dv(mode) {
      const t = H.thing(mode === 'brake' || mode === 'engine' || mode === 'massDv' ? PR_FRIC : null), a0 = H.uni(t.a[0], t.a[1]), vd = t.v < 5 ? 2 : 1;
      let u, v;
      if (mode === 'brake') { u = H.val(t.v * 0.5, t.v, vd); v = H.R() < 0.4 ? 0 : H.val(u * 0.1, u * 0.6, vd); }
      else { u = mode === 'massDv' || H.R() < 0.55 ? 0 : H.val(t.v * 0.1, t.v * 0.45, vd); v = H.val(u + (t.v - u) * 0.35, t.v, vd); }
      const dv = Math.abs(v - u); if (dv <= 0) return null;
      const T0 = dv / a0, td = T0 < 1 ? 2 : 1, T = H.val(T0 * 0.94, T0 * 1.06, td); if (T < 0.05 || T > 120) return null;
      const a = dv / T; if (a < t.a[0] * 0.8 || a > t.a[1] * 1.2) return null;
      const ar = prRd(a, 1), c = { u: prFmt(u), v: prFmt(v), t: prFmt(T), mid1: prMid(a), dvTxt: u ? `from ${prFmt(u)} m/s to ${prFmt(v)} m/s` : `from still to ${prFmt(v)} m/s` }, k = { u, v, t: T };
      const s = { t, c, k, find: 'F', unit: 'N' };
      if (mode === 'F' || mode === 'brake') {
        const m = H.mass(t), F = m * a; Object.assign(s, { given: { m, u, v, t: T }, exact: F, traps: [['noTime', m * dv], ['dvTimes', m * dv * T], ['earlyRound', m * ar]] }); c.m = prFmt(m); k.m = m;
        if (mode === 'F' && u) s.traps.push(['noStart', m * v / T]);
        if (mode === 'brake') { c.slowTxt = v ? `slows down from ${prFmt(u)} m/s to ${prFmt(v)} m/s` : `is moving at ${prFmt(u)} m/s and comes to a stop`; if (v) s.traps.push(['noStart', m * u / T]); }
      } else if (mode === 'm') {
        const m0 = H.uni(t.m[0], t.m[1]), F0 = m0 * a, F = H.val(F0 * 0.97, F0 * 1.03, F0 >= 100 ? 1 : 2), m = F / a;
        Object.assign(s, { given: { F, u, v, t: T }, find: 'm', unit: 'kg', exact: m, massOf: t, traps: [['noTime', F / dv], ['mult', F * a], ['earlyRound', F / ar]] }); Object.assign(c, { F: prFmt(F), want: 'm', other: 'a' }); k.F = F;
        if (u) s.traps.push(['noStart', F / (v / T)]);
      } else if (mode === 'engine') {
        const m = H.mass(t), net = m * a, fd = net >= 100 ? 0 : 1, f = H.val(net * 0.15, net * 0.9, fd), P = net + f;
        Object.assign(s, { given: { m, u, v, t: T, f }, find: 'P', exact: P, traps: [['noFriction', net], ['subFric', net - f], ['earlyRound', m * ar + f], ['noTime', m * dv + f]], arrows: [H.arrow('fw', null, t), H.arrow('back', f, t)] });
        if (u) s.traps.push(['noStart', m * v / T + f]);
        Object.assign(c, { m: prFmt(m), f: prFmt(f), mid2: prMid(net) }); Object.assign(k, { m, f });
      } else {   // massDv
        const m0 = H.uni(t.m[0], t.m[1]), net0 = m0 * a, fd = net0 >= 100 ? 0 : 1, f = H.val(net0 * 0.2, net0 * 1.2, fd), P = H.val((net0 + f) * 0.98, (net0 + f) * 1.02, fd), net = P - f; if (net <= 0) return null;
        Object.assign(s, { given: { P, f, u, v, t: T }, find: 'm', unit: 'kg', exact: net / a, massOf: t, traps: [['oneForce', P / a], ['noTime', net / dv], ['addOpp', (P + f) / a], ['mult', net * a], ['earlyRound', net / ar]], arrows: [H.arrow('fw', P, t), H.arrow('back', f, t)] });
        Object.assign(c, { P: prFmt(P), f: prFmt(f), net: prMid(net), want: 'm', other: 'a' }); Object.assign(k, { P, f });
      }
      return s;
    },
    /* mass in grams or tonnes, changed to kg, then F or a */
    units(u) {
      const t = H.thing(u === 'g' ? (x => x.grams) : (x => x.tonnes)), find = H.pick(['F', 'a']);
      const md = u === 'g' ? 0 : t.m[1] >= 20000 ? 1 : 2, mx = u === 'g' ? H.val(t.m[0] * 1000, t.m[1] * 1000, 0) : H.val(t.m[0] / 1000, t.m[1] / 1000, md), m = u === 'g' ? mx / 1000 : prRd(mx * 1000, 6);
      const k = { [u === 'g' ? 'mg' : 'mt']: mx }, c = { [u === 'g' ? 'mg' : 'mt']: prFmt(mx), mkg: prFmt(m), from: u, find };
      const wrongM = u === 'g' ? mx * 1000 : mx / 1000;   // changed units the wrong way
      const s = { t, find, c, k, given: { [u === 'g' ? 'mg' : 'mt']: mx } };
      if (find === 'F') { const a = H.val(t.a[0], t.a[1], H.aDec(t)); s.given.a = a; c.a = prFmt(a); k.a = a; Object.assign(s, { unit: 'N', exact: m * a, traps: [['noConvert', mx * a], ['convWay', wrongM * a], ['div', m / a]] }); }
      else { const a0 = H.uni(t.a[0], t.a[1]), F0 = m * a0, F = H.val(F0 * 0.97, F0 * 1.03, F0 >= 1000 ? 0 : F0 >= 10 ? 1 : 2); s.given.F = F; c.F = prFmt(F); k.F = F; Object.assign(c, { want: 'a', other: 'm' }); Object.assign(s, { unit: 'm/s²', exact: F / m, traps: [['noConvert', F / mx], ['convWay', F / wrongM], ['mult', F * m]] }); }
      return s;
    }
  };
  H.R = R;
  return H;
}

/* prGen(level 1–6, seed, opts {worlds, units, recent}) → a `num` question; the same arguments always give the same question */
function prGen(level, seed, opts) {
  opts = opts || {}; level = clamp(Math.round(+level) || 1, 1, 6); seed = Math.abs(Math.round(+seed) || 0);
  const R = rngSeed(((seed * 8191) + level * 131 + (opts.worlds ? 7 : 0) + (opts.units ? 53 : 0)) % 4294967291), H = prHelpers(R);
  const pool = PR_LEVEL_KINDS[level - 1].filter(k => !PR_KINDS[k].gate || opts[PR_KINDS[k].gate]);
  const rec = (opts.recent || []).slice(-3), fresh = pool.filter(k => !rec.includes(k)), first = H.pick(fresh.length ? fresh : pool);
  const order = [first].concat(pool.filter(k => k !== first));
  for (const kind of order) for (let tries = 0; tries < 80; tries++) { const q = prBuild(kind, level, seed, H); if (q) return q; }
  return null;   // never reached in testing (3,000 seeds per level)
}
/* one attempt: the maths from PR_KINDS, the checks from the number rules, then the words from PR_TEXT */
function prBuild(kind, level, seed, H) {
  const K = PR_KINDS[kind], s = K.make(H); if (!s || !isFinite(s.exact) || s.exact <= 0) return null;
  const dp = s.dp != null ? s.dp : level === 2 ? 1 : s.exact < 1 ? 2 : (s.exact < 20 && H.R() < 0.5 ? 2 : 1), p10 = Math.pow(10, dp);
  const frac = s.exact * p10 - Math.floor(s.exact * p10); if (Math.abs(frac - 0.5) < 0.02) return null;   // too close to a rounding edge
  const ans = prRd(s.exact, dp); if (level >= 2 && Math.abs(ans - Math.round(ans)) < 1e-9) return null;
  if (s.unit === 'm/s²' && (ans < 0.05 || ans > 400)) return null;
  if (s.unit === 'N' && (ans < 0.01 || ans > 200000)) return null;
  if (s.massOf && (ans < s.massOf.m[0] || ans > s.massOf.m[1])) return null;
  if (['F', 'P', 'f', 'W', 'FA', 'FB'].some(x => s.given[x] > 200000)) return null;   // every stated force stays a readable size
  const tol = prTol(ans, dp), t = s.t, nm = H.names(t);
  const c = Object.assign({ The: nm.The, the: nm.the, act: t.act, push: t.push, fw: t.fw, Fw: t.fw[0].toUpperCase() + t.fw.slice(1), back: t.back, Back: t.back[0].toUpperCase() + t.back.slice(1),
    fwd: `the ${t.fw} from ${t.push}`, g: '9.8', dp, round: level >= 2 ? ' ' + PR_TEXT.round(dp) : '' }, s.c);
  c.ansU = `${prFmt(ans, dp)} ${s.unit}`; c.exactU = `${prMid(s.exact)} ${s.unit}`; c.rounded = Math.abs(s.exact - ans) > 1e-9;
  const k = {}; Object.keys(s.k || {}).forEach(x => { k[x] = typeof s.k[x] === 'number' ? prKey(s.k[x]) : s.k[x]; });
  const T = PR_TEXT.kinds[kind], v = s.v != null ? s.v : Math.floor(H.R() * T.p.length);
  /* the mistakes: rounded like the answer; dropped when they would match the answer or another mistake */
  const traps = [];
  s.traps.forEach(([key, raw]) => {
    if (!isFinite(raw) || raw <= 0) return; let tv = prRd(raw, dp);
    if (tv <= 0) tv = +raw.toPrecision(3);   // a tiny wrong answer (forgot to change grams): kept, so typing 0 or 0.0002 still names the mistake
    const tt = prTol(tv, dp); if (Math.abs(tv - ans) <= Math.max(tol, tt) * 1.001) return;
    if (traps.some(x => Math.abs(x.ans - tv) <= Math.max(x.tol, tt) * 1.001)) return;
    traps.push({ ans: tv, key, say: PR_TEXT.traps[key](c), tol: tt });
  });
  const workLines = T.work(c).filter(x => x !== PR_TEXT.answer(c, dp) || c.rounded || K.steps > 1);
  const arrows = (s.arrows || []).map(a => Object.assign({}, a));
  return { id: `pr${level}_${seed}`, type: 'num', p: T.p[v](c), ans, unit: s.unit, units: UNITS, tol, work: workLines.join('\n'), workLines, hints: T.hints(c, k), ladder: true,
    kind, level, seed, skill: K.skill, steps: K.steps, dp, units2: !!K.units2, world: s.world || null, find: s.find, given: s.given, exact: s.exact, ansText: prFmt(ans, dp),
    thing: t.key, traps, pic: { thing: t.key, draw: t.pic, dir: t.dir || 'right', arrows, world: s.world || null, thing2: s.t2 ? s.t2.key : null } };
}
/* the mistake a typed answer matches, or null (a right answer never matches) */
function prMatchTrap(q, value) {
  const v = typeof value === 'number' ? value : parseNum(value);
  if (!q || !q.traps || isNaN(v) || near(v, q.ans, q.tol)) return null;
  return q.traps.find(t => Math.abs(v - t.ans) <= t.tol) || null;
}
