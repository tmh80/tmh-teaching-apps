# Force HQ Chapter 5: The Drop Zone (script)

Written 28 Oct 2026 by Claude (Opus) for the coding model to build from. **Audience: Grade 7 and 8.** Keep the language and the question level at that pitch: natural full sentences, enthusiastic and encouraging, everyday words, precise science words once they are taught.

Read first: `Force_HQ_Handoff.md` (rules, script format, delivery), `Force_HQ_Brief.md` (file map), `Question_Types_Guide.md` (the new question types and the pause/snapshot tools), Backlog item 5 (Tom's decisions). The physics reference is `tools/dropzone_model.py`: **the JS engine must reproduce its numbers** (section B).

**If you change any wording** to fit the screen or to stop a readout giving an answer away, change it here too, so the script and the app do not drift apart.

---

## A. Tom's decisions (28 Oct 2026)

- Drops start high enough to reach terminal velocity, so students see the acceleration stop and the forces balance.
- Students open the parachute during the fall and watch the forces become unbalanced (upwards), then balanced again at a lower velocity.
- Six worlds: Earth, Moon, Mars, Venus, Titan, Jupiter (cloud tops). Air on/off comparisons on each.
- Two side-by-side lanes so drops can race.
- Three canopy sizes.
- Live free-body diagram beside each falling object, a big obvious Pause button, and questions on the trends in the arrow sizes.
- Wide range of question types (see the question plans, section D).
- No falling helicopters.

---

## B. Engine and scene spec (build this before the steps)

### B1. Physics (must match `tools/dropzone_model.py`)
- Air resistance `D = c × airFactor × v²`, acting against the motion. `airFactor = world air density (relative to Earth) × (1 − airRemoved/100)`.
- `c` for each object is set so its terminal velocity on Earth, with all the air, is the value in the table: `c = m × 9.8 ÷ vt²`.
- A canopy adds its own constant `cCanopy = 75 × 9.8 ÷ vtCanopy² − 75 × 9.8 ÷ 54²` (fixed from the skydiver's numbers), so the same canopy slows a crate more than a skydiver.
- The canopy opens over **3 s**: the canopy constant grows linearly from 0 to its full value. (This gives a realistic peak of about 3 to 7 g.)
- Fixed step **0.01 s**, semi-implicit Euler (`v += a·dt; y −= v·dt`), the same as the other scenes. Fast-forward runs more steps per frame and never changes the numbers.
- Store the run's history every 0.1 s (t, y, v, a, W, D, canopy fraction) for the step-back button, the snapshots and the v–t graph.

| Object | Mass | Terminal velocity on Earth (all the air) | Canopy? |
|---|---|---|---|
| Feather | 0.002 kg | 0.6 m/s | no |
| Basketball | 0.6 kg | 20 m/s | no |
| Crate | 40 kg | 38 m/s | yes |
| Skydiver (canopy closed) | 75 kg | 54 m/s | yes |

| Canopy | Skydiver's terminal velocity on Earth | Crate's terminal velocity on Earth |
|---|---|---|
| Small | 9.0 m/s | 6.57 m/s |
| Medium | 6.0 m/s | 4.38 m/s |
| Large | 4.5 m/s | 3.29 m/s |

| World | g (N/kg) | Air (relative to Earth) | Shown to students as |
|---|---|---|---|
| Earth | 9.8 | 1 | Air: normal |
| Moon | 1.6 | 0 | Air: none |
| Mars | 3.7 | 0.016 | Air: very thin (about 1/60 of Earth's) |
| Venus | 8.9 | 53 | Air: very thick (about 53 times Earth's) |
| Titan (Saturn's largest moon) | 1.4 | 4.4 | Air: thick (about 4 times Earth's) |
| Jupiter (cloud tops) | 24.8 | 0.13 | Air: thin; no ground, so drops stop at a cloud-top platform |

Run `python3 tools/dropzone_model.py` for every terminal velocity on every world and the challenge feasibility grid. Add a test (`tests/dropzone_physics.py`) that runs the JS engine through `__fhq.ev` and checks it against these values (terminal velocities within 0.5%, the challenge grid's pass/fail edges within one 20 m step).

### B2. The Drop Zone scene (`S.scene = 'drop'`)
- A tall sky with an **altitude scale** on the side. The helicopter hovers at the drop height at the top. The **camera follows the falling object**, and the ground with a landing pad comes into view at the end. Sky and ground change with the world (Earth blue sky and grass; Moon black sky, stars, grey dust; Mars butterscotch sky, red dust; Venus thick yellow haze; Titan orange haze, icy ground; Jupiter banded clouds with a floating platform). Flat, rounded, outline-free art, as in the rest of Force HQ.
- **Lanes:** lane A always; a **"Compare two drops"** switch adds lane B beside it. Each lane has its own world, object, canopy and air setting. Both lanes share the drop height, and **Drop!** releases both at the same moment. Each lane has its own readouts and its own live free-body diagram.
- **Controls** (each a panel id, added by steps through `adds`): `dobj` object picker; `dworld` world picker (shows g and the air description); `dair` "Air removed" slider 0 to 100% with a number box; `dheight` drop height slider 10 to 3,000 m with a number box; `dcanopy` canopy size picker (none, small, medium, large; disabled for the feather and basketball) and a big **Open canopy!** button beside Drop!; `dopenh` "Open the canopy automatically at ___ m" number box (Extension and Challenge only); `dlanes` the Compare switch; `dpause` the pause tools; `dvt` live velocity–time graph; `dft` force–time strip; `warp` the existing Fast-forward button.
- **Held and released (added 29 Oct at Tom's request):** while the object hangs from the helicopter before **Drop!**, it is still, so its free-body diagram shows a third arrow, **rope pulls up**, equal to the weight, and the resultant reads 0 N (Acceleration reads 0 m/s²). From the moment of release the helicopter climbs, because its lift is unchanged but the load's weight is gone: resultant = the load's weight, upwards, with the same air resistance law as the hover pad (`104 × airFactor × v²`), so the climb is slow for a crate (about 0.4 m in the first 1.5 s) and invisible for the feather.
- **Speed effects (added 29 Oct at Tom's request):** from about 8 m/s the background blurs (the clouds, birds, buildings, flood lights and crates are drawn with ghost copies shifted up and down) and, where there is air, white **speed lines** appear that get longer and more numerous the faster the object goes (full effect at about 48 m/s). The lines fade out as air is removed and are absent in a vacuum, so they never suggest air resistance where there is none. They are fixed at real heights, so they slide past at the right speed and respect Pause and the step buttons. Reduced-motion switches blur and lines off.
- **Things the object falls past (added 29 Oct):** Earth only: birds (up to about 500 m) and three skyscrapers with roofs at 120, 150 and 205 m. Every world with a floor: two flood-light masts (24 m) and stacks of crates on the floor beside the landing pad.
- **Readouts per lane:** Height (m), Velocity (m/s, downwards), Acceleration (m/s²), Time (s).
- **Live free-body diagram beside each falling object** (`dfbd`): weight down and air resistance up (`FTYPES.airres`), drawn from the centre of the real object (crate, skydiver with or without canopy, ball, feather), values in newtons, plus a dashed resultant arrow with its value. Scale each lane so its weight arrow is about 56 px long. Just after a canopy opens, air resistance can reach about 7 times the weight: cap the arrow at 4 times the weight length, with a zig-zag break, and keep the true value on the label. Weights below 1 N show 3 decimal places (the feather: 0.020 N).
- **Pause tools** (`dpause`): a big **⏸ Pause** button right beside **Drop!** (it becomes **▶ Play**; Spacebar does the same), step buttons **◀ 0.5 s** and **0.5 s ▶** that move through the stored history while paused, a banner "Paused at 6.4 s" across the arena, and **📸 Snapshot**. A snapshot saves to the Journal's Runs tab with a sentence and chips: "At 6.4 s the crate was 289 m up and falling at 33.9 m/s. Weight 392 N, air resistance 311 N." Store in `DB.dz.snaps` (latest 50) with run id, lane, object, world, air %, canopy and its state, t, y, v, a, W, D, R.
- **Landing:** the run ends at the ground. Landing messages are friendly and never show injuries: under 7 m/s "Soft landing!"; 7 to 15 m/s "Bump! A bit fast."; over 15 m/s "Thud! Far too fast for a safe landing." (the skydiver rolls in a puff of dust; the crate bounces). The Jupiter platform works the same way.
- **Runs:** every drop is a run (`runMark`/`runTick`/`runEnd`). `runText`: "You dropped the 40 kg crate from 600 m on Earth (all the air). It sped up to a terminal velocity of 38.0 m/s and landed after 18.5 s." With a canopy: "… You opened the medium canopy at 812 m. The skydiver slowed to 6.0 m/s and landed after 151 s." `runChips`: world, object, canopy, height, air removed, top velocity, landing velocity, time. Store per run: object, world, air, height, canopy, open time and height, top velocity, terminal reached (yes/no), landing velocity, time, plus the history for graphs. Helpers in the Chapter 5 module, like Chapter 4's: `dzRun(f)` (latest run matching a filter object), `dzTop(f)`, `dzLand(f)`, `dzTime(f)`, `dzSnap(f, test)`.
- **Masks:** the same pattern as `spaceMasked`/`sledMasked` (`dzMasked`). Steps list `mask: [{ q, keys, when(lane) }]`; keys can be `fbdR` (resultant label), `fbdW` (weight label), `readV`, `heliW`.
- **Explore:** the Drop Zone and the helicopter pad are both in Explore with every control. Add the Drop Zone panels to `EXPLORE_HIDE` only where they would confuse (none expected).

### B3. The helicopter pad (`S.scene = 'heli'`, Extension step p3)
- Helicopter mass 1,180 kg (weight 11,564 N on Earth). A **Lift** slider 3,000 to 16,000 N with a number box. Vertical air resistance `104 × v²` against the motion, so a lift of 12,500 N gives a steady climb of 3.0 m/s.
- It starts on the landing pad (normal force from the pad while the lift is less than the weight). No crashes: on touching the pad it lands; above 4 m/s it says "Bump! Real pilots land more gently than that." and sits on the pad.
- Readouts: Height, Velocity (up positive, labelled "upwards"), and a free-body diagram with lift (up), weight (down) and air resistance (against the motion), with `heliW` maskable.
- Target-finding markers on the Lift slider (`LAB.bmarks` pattern): a red marker for a lift that made it climb, a yellow marker for one that made it sink, keeping the closest of each.
- **Hovering** = airborne with |v| < 0.05 m/s for 3 s. Show a green "Hovering!" badge.

### B4. Question engine additions this chapter needs
Build these from `Question_Types_Guide.md` section 3 before the steps: `order`, `pick`, `reason` (with `voices` and `sure`), `fix`, `freeze`, `spot`, `sketch`. Also a **sketch prediction**: `predict: { kind: 'sketch', ... }` makes the Predict-first box hold a sketch grid (not marked, saved, and drawn over the student's real run on the v–t graph once the run exists).

### B5. Glossary, formulas, facts, sections
- **New `TERMS`** (check for duplicates; `airres`, `terminal`, `balanced`, `resultant`, `gfs`, `weight`, `vtgraph` already exist and will auto-underline):
  - `parachute`: Parachute. A big fabric canopy that a skydiver or a crate opens to make the air resistance much bigger, so it falls much more slowly.
  - `canopy`: Canopy. The large fabric part of a parachute. A bigger canopy pushes more air out of the way, so the air resistance is bigger.
  - `lift`: Lift. The upward force on a helicopter or a plane. A helicopter's blades push air down, so the air pushes the helicopter up.
  - `hover`: Hover. To stay still in the air. A hovering helicopter's lift is exactly equal to its weight.
  - `vacuum`: Vacuum. A space with no air in it at all, so there is no air resistance.
  - `drag`: Drag. Another name for air resistance (or water resistance): a force that pushes against an object moving through a fluid.
- **`FORMULAS`:** add 5 to the `ch` of `weight` (W = m × g) and `resultant`. Add `{ id: 'fall', name: 'Resultant on a falling object', eq: 'resultant = weight − air resistance', note: 'Weight pulls down and air resistance pushes up. If the answer is negative, the resultant points up.', ch: [5] }` and `{ id: 'dtime', name: 'Time at a steady velocity', eq: 'time = distance ÷ velocity', note: 'Only when the velocity is steady, for example at terminal velocity.', ch: [5] }`.
- **Fun facts** (gated to Chapter 5; check each one before shipping):
  1. In 1971 astronaut David Scott dropped a hammer and a falcon feather on the Moon during Apollo 15. They hit the ground at the same moment.
  2. A skydiver with the canopy closed falls at about 200 km/h (about 55 m/s).
  3. In 2012 Felix Baumgartner jumped from about 39 km up. The air there is so thin that he fell faster than sound before the thicker air slowed him down.
  4. The Huygens probe parachuted through Titan's thick air in 2005. The descent took about two and a half hours, and it landed at about 5 m/s.
  5. Venus's air is so thick that the Soviet Venera landers let go of their parachutes high above the ground and still landed gently.
  6. In 2021 the Perseverance rover used a parachute on Mars, but the air was too thin to land it safely, so rockets did the rest.
  7. NASA's Ingenuity helicopter flew on Mars in 2021. The air is so thin that its blades spun at about 2,400 turns a minute, several times faster than a helicopter's on Earth.
- **Sections** (`55-sections.js`): `c5f` "Falling and terminal velocity", Foundation, stamp "Skydive Spotter", steps d1–d4, no Challenge, Check c5r1–c5r7. `c5x` "Air, weight and other worlds", Extension, stamp "Planet Hopper", steps p1–p3, Challenge z1–z3, Check c5r8–c5r12, needs c5f. `STEPMIN`: d1 4, d2 5, d3 4, d4 5, p1 4, p2 5, p3 3. `QMIN` for the new types: order 1.5, pick 1, reason 1, fix 1.5, freeze 3, spot 1, sketch 2. Target: both sections show approx. 30 min or less. If `secMins` gives more than 30, tell Tom and suggest cutting d1 q3 or c5r11.
- **Chapter data:** `goal`: "Describe how weight and air resistance change during a fall, use balanced forces to explain terminal velocity with and without a parachute, and compare falling on other worlds using W = m × g." `vocab`: air resistance, weight, terminal velocity, balanced forces, resultant force, parachute, canopy, gravitational field strength, vacuum, lift, hover.
- Worksheets: add `c5f` and `c5x` to `SHEETS` in `tools/make_worksheets.py`. Tests: `tests/play_c5.py` (both sections, the Challenge and both Checks, right and wrong answers), `tests/dropzone_physics.py`, `tests/qtypes.py`.

---

## C. Misconceptions this chapter targets

| Code | Misconception | Where it is challenged |
|---|---|---|
| M1 | A skydiver moves upwards when the canopy opens | d4 q2, c5r6 |
| M2 | Terminal velocity happens because something "runs out" (weight, gravity), rather than air resistance growing to equal the weight | d3 q1, d3 q2, c5r2 |
| M3 | Mass doesn't matter for falling in air | p1 q3, c5r9 |
| M4 | A steady velocity needs a downward resultant force | d3 q2, c5r2 |
| M5 | Heavier objects always fall faster (even with no air) | p1 predict and q1, c5r9 |
| M6 | Air resistance acts downwards, or always exists | d1 q3, p3 q2 |
| M7 | Weight changes during the fall | d1 q2, d2 q1 (weight column), c5r4 |
| M8 | Weight is the same on every world (mass and weight mixed up) | p2 q4, c5r8, c5r11 |
| M9 | Balanced forces mean the object is still | d3 card 2, p3 q2, c5r2 |

---

## D. Question plans

**Foundation (c5f) Learn:** d1 predict (mcq), reading, pick, mcq · d2 freeze, pick · d3 tap (key idea), reason (cartoon), fbd · d4 predict (sketch), freeze, reason (cartoon), spot, pick.
**Foundation Check** (7): order → reason (+ sure) → num → table (trend grid) → spot → fix → explain. Seven types, no two the same in a row, no choose-one. Misconception: reason, fix. Observe: spot, table. Produce: explain, num.

**Extension (c5x) Learn:** p1 predict, reading, order, reason · p2 predict, reading, num, pick, fix · p3 num, sort (always/sometimes/never), pick. Challenge: three missions.
**Extension Check** (5): num → reason (+ sure) → sketch → order → explain. Five types, no two the same in a row. Misconception: reason. Observe: sketch. Produce: explain.

---

## E. Foundation: Falling and terminal velocity (c5f)

### Step d1: First drop   (Foundation, about 4 min)
Arena: Drop Zone, lane A only, Earth, crate, drop height 600 m, all the air. Adds `dfbd`, readouts, `warp`. Hides the Space Dome and Main Arena panels (`SPACE_HIDE_MAIN`, `shove`, `astro`, `readAV`, `readAM`, `pushf`, `thrust`, `pairs`). Object, world, air and height are fixed for this step (pickers not added yet).
Formulas glowing in the calculator: weight.

CARDS
1. Welcome to Chapter 5 and the **Drop Zone**! A helicopter hovers high above the landing pad, ready to drop things for you. It stays perfectly still because its lift pushes up exactly as hard as its weight pulls down. Your first job: drop a 40 kg crate from 600 m and watch its velocity on the way down.
2. Keep an eye on the **free-body diagram** next to the crate. One arrow is the crate's **weight**, pulling it down. The other is **air resistance**, pushing up against the motion. Watch how each arrow changes as the crate falls. The Fast-forward button saves time on long drops. Before you press Drop!, check what the free-body diagram shows while the crate hangs from the helicopter. At the moment of release, watch the helicopter too.

PREDICT FIRST
Question: The crate falls from 600 m. What will its velocity do on the way down?
Options: It will keep speeding up until it hits the ground · It will speed up at first, then stop speeding up · It will fall at the same velocity all the way down · It will speed up at first, then slow down before landing
After: Press Drop! and watch the Velocity readout and the two arrows.

DO THIS
- Make your prediction in the box above.
- Press **Drop!** and watch the crate all the way down.   (ticks when a crate run from 600 m on Earth has landed)

YOUR TURN QUESTIONS
q1 | reading | The crate's velocity stopped going up. What velocity did it settle at? | live: dzTop({obj:'crate', world:'earth', h:600}) | unit m/s | tolerance 0.3
   needMsg: Drop the crate first. Your runs are in the Journal.
   ok: Spot on! The crate settled at about 38 m/s. That's nearly 140 km/h.
q2 | pick | As the crate fell faster and faster, its weight {0} and the air resistance on it {1}.
   {0}: gets bigger / stays the same / gets smaller → stays the same
   {1}: gets bigger / stays the same / gets smaller → gets bigger
   Feedback after: Weight is mass × g, so it stays the same during the fall. Air resistance grows as the velocity grows.
q3 | mcq | Why did the air resistance arrow grow during the fall?
   Options: Air resistance gets bigger as the crate's velocity gets bigger · Air resistance gets bigger as the crate gets closer to the ground · Air resistance gets bigger as the crate's weight gets bigger · Air resistance gets bigger as the air gets colder lower down
   correct 0
   why: (1) The height doesn't matter: the arrow grows because the crate is moving faster. (2) The weight stayed the same the whole way down. (3) The Drop Zone's air stays the same all the way down. The arrow grows because the crate speeds up.
q4 | mcq | **Quick review.** The helicopter was hovering with its lift equal to its total weight. Once it let go of the crate, it climbed. Why?   (added 29 Oct at Tom's request; review of Chapters 1 and 3)
   Options: The weight is smaller but the lift is the same, so the resultant force points up · The lift grew bigger because the helicopter has let go of the crate and is lighter · The falling crate pulls the helicopter upwards as it drops away from it · The weight is now zero, so the lift is the only force left acting on it
   correct 0
   ok: Yes! The forces are no longer balanced, so the helicopter accelerates upwards (F = m × a from Chapter 3).
   why: (1) The lift stayed the same. The helicopter lost the crate's weight, so the pulling-down force got smaller. (2) The crate is no longer touching the helicopter, so it cannot pull on it. (3) The helicopter still has its own weight. It lost only the crate's weight.
Glossary words to underline: lift, weight, air resistance, free-body diagram, velocity.
Masked readouts: none.

### Step d2: Pause and look   (Foundation, about 5 min)
Arena: as d1. Adds `dpause`.

CARDS
1. Falls happen fast, so let's freeze time! Press **⏸ Pause** during a drop and everything stops. The **◀ 0.5 s** and **0.5 s ▶** buttons step backwards and forwards through the fall, and **📸 Snapshot** saves that moment to your Journal. Use them to catch the forces at exactly the right moment.
2. The **resultant force** is what's left over when you combine the forces. Weight pulls down and air resistance pushes up, so **resultant = weight − air resistance**. A downward resultant means the crate is still speeding up.
   Worked example: At 20 m/s the air resistance on the crate is 108.6 N and its weight is 392 N. Resultant = 392 − 108.6 = **283.4 N**, pointing down, so the crate is still speeding up.
   Key idea: resultant = weight − air resistance.

DO THIS
- Drop the crate and pause it at the three moments in the table under the arena. Press **Use this moment** on each of its three rows.   (ticks when all three rows of q1 have a moment attached. Changed 29 Oct at Tom's request: q1 is marked `early`, so the table sits under the arena from the start instead of waiting in the Your turn box. Anything students must collect data for is on screen at once.)
- Take at least one **📸 Snapshot**.   (ticks when a snapshot of a crate run exists)

YOUR TURN QUESTIONS
q1 | freeze | Fill in the table from your three paused moments. Type the forces from the free-body diagram, work out the resultant, and choose what the velocity is doing. | obj crate
   cols: Weight (N) · Air resistance (N) · Resultant (N) · Velocity (speeding up / steady / slowing down)
   rows:
   - Just after it leaves the helicopter | when: canopy closed, v < 12 m/s, a > 0.5 | whenMsg: Pause in the first second of the fall.
   - About halfway to its top velocity | when: 15 ≤ v ≤ 23 m/s | whenMsg: Pause when the velocity is between 15 and 23 m/s.
   - After it has stopped speeding up | when: |a| < 0.2 m/s² | whenMsg: Pause once the velocity has stopped going up.
   Checks: weight and air resistance within 1 N of the snapshot; resultant = that snapshot's W − D within 1 N; velocity choice from the snapshot's acceleration.
   Example values for the key (students' will differ): 392, 25.0, 367.0, speeding up · 392, 108.6, 283.4, speeding up · 392, 391.2, 0.8 (about zero), steady.
q2 | pick | Look at your table. As the crate sped up, the air resistance {0}, the resultant force {1} and the acceleration {2}.
   {0}: gets bigger / stays the same / gets smaller → gets bigger
   {1}: gets bigger / stays the same / gets smaller → gets smaller
   {2}: gets bigger / stays the same / gets smaller → gets smaller
Glossary words to underline: resultant force, snapshot (no entry needed), acceleration.
Masked readouts: the resultant label on the free-body diagram (`fbdR`) shows "?" until q1 is answered.

### Step d3: Terminal velocity   (Foundation, about 4 min)
Arena: as d2.

CARDS
1. Here's what you just saw. As the crate speeds up, air resistance grows. Eventually it grows until it is **as big as the weight**. Now the forces are **balanced**, the resultant force is zero, and the crate stops speeding up. It keeps falling at a steady velocity called its **terminal velocity**.
   Key idea: When air resistance has grown to equal the weight, the forces are balanced and the object falls at a steady terminal velocity.
2. Balanced forces mean the **velocity does not change**. A still object stays still, and a moving object keeps moving at a steady velocity. That's Newton's first law from Chapter 2, working high above the Drop Zone!

DO THIS
- Answer the key idea question.   (key-idea task, ticks when q1 is done)
- Drop the crate, pause it once it has reached terminal velocity, and take a **📸 Snapshot**.   (ticks on a crate snapshot with |a| < 0.2)

YOUR TURN QUESTIONS
q1 | tap | **Key idea.** Tap the sentence that explains terminal velocity.
   Options: Air resistance has grown to equal the weight, so the velocity stops changing. · Air resistance has grown bigger than the weight, so the velocity stops changing. · The weight has shrunk to zero, so the velocity stops changing. · The air resistance has disappeared, so the velocity stops changing.
   correct 0
   why: (1) If air resistance were bigger, the crate would slow down. (2) Weight stays the same the whole way down. (3) Air resistance is at its biggest at terminal velocity.
q2 | reason (cartoon) | The crate is falling at a steady 38 m/s. Four friends disagree about the forces on it. Who's right?
   voices: Mia: "It has stopped speeding up, so there are no forces on it any more." · Sam: "Air resistance and weight are now equal, so the forces are balanced." · Leo: "The weight must still be bigger, or it would stop falling." · Ana: "Air resistance is bigger now, so it's about to slow down."
   correct: Sam
   reasons: A steady velocity means the resultant force is zero · A falling object needs a downward resultant to keep moving · Weight switches off when an object reaches its top velocity · Air resistance always ends up bigger than weight in a long fall
   correct reason 0
   why: (Mia) Both forces are still there; they cancel. (Leo) A moving object keeps moving with no resultant force (Newton's first law). (Ana) Air resistance stops growing when it equals the weight. Reasons: (2) is Leo's idea; (3) weight never switches off; (4) it only becomes bigger if something changes, like a canopy opening.
q3 | fbd | Build the free-body diagram for the crate falling at its terminal velocity of 38 m/s.
   scen: the crate in the air; forces: weight 392 N down; air resistance 392 N up. Brief: "The 40 kg crate is falling at a steady 38 m/s."
Glossary words to underline: balanced forces, terminal velocity, Newton's first law.
Masked readouts: none (the live diagram can stay; building it is the practice).

### Step d4: Open the parachute   (Foundation, about 5 min)
Arena: Drop Zone, lane A, Earth, skydiver, drop height 1,500 m, all the air, medium canopy (picker added but the task uses medium). Adds `dcanopy` (Open canopy! button), `dvt` (live v–t graph), `dft` (force–time strip).

CARDS
1. Meet our skydiver! With the canopy closed, they fall just like the crate until they reach a terminal velocity of about **54 m/s**. That's nearly 200 km/h. Then they open the parachute.
2. A **canopy** is huge, so it has to push a lot of air out of the way. At the same velocity, the air resistance is suddenly much bigger. Use **⏸ Pause** to catch the arrows just after the canopy opens, and again once things settle down.

PREDICT FIRST (sketch, not marked)
Question: Sketch the skydiver's velocity from the jump until well after the canopy opens. The dashed line shows when the canopy opens.
Sketch: 10 columns (time), 10 levels (velocity downwards), dashed marker at column 6 labelled "Canopy opens".
After: Drop the skydiver, open the canopy, then compare your sketch with the real graph.

DO THIS
- Sketch your prediction in the box above.
- Press **Drop!**. When the velocity has stopped going up, press **Open canopy!**   (ticks when a skydiver run on Earth has a canopy opened after terminal velocity was reached)
- Pause at the two moments in the table under the arena and press **Use this moment** on each of its two rows.   (`early` table, as in d2)

YOUR TURN QUESTIONS
q1 | freeze | Fill in the table from your two paused moments. | obj para
   cols: Weight (N) · Air resistance (N) · The bigger force (weight / air resistance / neither, they're equal) · Velocity (speeding up / steady / slowing down)
   rows:
   - Just after the canopy opens | when: canopy opening or open, a < −1 m/s² | whenMsg: Pause in the first few seconds after the canopy opens. The step buttons help.
   - Steady again with the canopy open | when: canopy fully open, |a| < 0.2 m/s² | whenMsg: Pause once the velocity has stopped going down.
   Example values for the key: 735, 2,243 (paused at 21.0 s), air resistance, slowing down · 735, 735, neither, steady.
q2 | reason (cartoon) | The canopy opens. Four friends describe what happens next. Who's right?
   voices: Mia: "The skydiver shoots upwards for a moment." · Ana: "The skydiver keeps falling, but slows down." · Leo: "The skydiver stops dead in mid-air." · Sam: "The skydiver keeps falling at the same velocity."
   correct: Ana (vary the right character between cartoon questions, so "pick Sam" never works)
   reasons: Air resistance is now bigger than the weight, so the resultant points up and slows the fall · Air resistance is now bigger than the weight, so the resultant points up and lifts the skydiver · The canopy cancels the weight completely, so no forces act on the skydiver at all · The canopy only changes the skydiver's shape, so the forces stay just the same
   correct reason 0
   why: An upward resultant on something moving down slows it down. It only looks like the skydiver goes up in videos, because the camera is held by someone who is still falling fast.
q3 | spot | Here's a velocity–time graph of a skydive. Tap where the canopy opened.
   graph: fixed data from `dropzone_model.run('para','earth',height=1500,canopy='medium',open_at=20)`, 0 to 40 s
   target: t between 19.5 and 21.0 s
q4 | pick | After the canopy opened, the air resistance {0} as the skydiver slowed down, until it was {1} the weight again.
   {0}: gets bigger / stays the same / gets smaller → gets smaller
   {1}: bigger than / equal to / smaller than → equal to
Glossary words to underline: canopy, parachute, terminal velocity.
Masked readouts: none.

---

## F. Foundation Check (c5r1–c5r7)

c5r1 | order | Put the stages of a skydive in order. | first: Leaves the helicopter | last: Lands
   items (correct order): The skydiver speeds up quickly · Air resistance grows as the velocity grows · Air resistance equals the weight, so the velocity is steady · The canopy opens and air resistance jumps up · The skydiver slows down and air resistance shrinks · The forces balance again at a much lower velocity

c5r2 | reason | sure: true | A skydiver with the canopy closed is falling at a steady 54 m/s. Which is true about the forces on them?
   Options: Air resistance is equal to their weight · Air resistance is bigger than their weight · Air resistance is smaller than their weight · There are no forces acting on them at all
   correct 0
   reasons: Their velocity is steady, so the resultant force must be zero · They are still falling, so there must be a downward resultant · They are moving fast, so air resistance must be winning · They have stopped speeding up, so gravity has switched off
   correct reason 0

c5r3 | num | A skydiver with a weight of 735 N is falling at 45 m/s. The air resistance on them is 518 N. What is the resultant force on them? | answer 217 | unit N | tolerance 1 | units picker | ladder
   Hints: Weight pulls down and air resistance pushes up, so the resultant is the difference. · resultant = weight − air resistance. · Type 735 − 518 into the calculator.
   Working shown after: resultant = 735 − 518 = 217 N, pointing down, so the skydiver is still speeding up.

c5r4 | table (trend grid) | Complete the table for three moments of a skydive.
   cols and choices (in this order, so the answers don't line up):
   - Air resistance compared with weight: bigger / smaller / equal
   - Resultant force: zero / up / down
   - Velocity: steady / slowing down / speeding up
   rows (answers):
   - Just after jumping: smaller · down · speeding up
   - At terminal velocity: equal · zero · steady
   - Just after the canopy opens: bigger · up · slowing down

c5r5 | spot | Here's a velocity–time graph of a skydive (the same fixed data as d4 q3).
   targets: Tap a moment when the forces were balanced and the canopy was still closed (t 14.5 to 19.8 s) · Tap a moment when the air resistance was bigger than the weight (t 20.1 to 23.5 s)

c5r6 | fix | Leo explains what happens when a canopy opens. One line has a mistake. Tap it, then choose the correct line.
   lines: 1. The skydiver is falling at terminal velocity. · 2. The canopy opens, so the air resistance gets much bigger. · 3. Air resistance is now bigger than the weight. · 4. So the resultant force points upwards. · 5. So the skydiver starts to move upwards.
   mistake: line 5
   fix (mcq): So the skydiver keeps moving down, but slows down · So the skydiver keeps moving down, and speeds up · So the skydiver stops moving and hangs still · So the skydiver keeps moving down at the same velocity → correct 0
   why: An upward resultant force slows down something that is falling. The skydiver keeps moving down the whole time, just more slowly.

c5r7 | explain | A skydiver jumps from a hovering helicopter. Explain why they reach a terminal velocity.
   words: weight, air resistance, balanced, resultant force
   model: At first the skydiver's weight is much bigger than the air resistance, so there is a downward resultant force and they speed up. As they go faster, the air resistance grows. Eventually the air resistance is equal to the weight, so the forces are balanced and the resultant force is zero. They stop speeding up and fall at a steady terminal velocity.
   checklist: Says the weight is bigger than the air resistance at first, so the skydiver speeds up · Says the air resistance grows as the velocity grows · Says the air resistance becomes equal to the weight, so the forces are balanced (resultant force zero) and the velocity stays steady

---

## G. Extension: Air, weight and other worlds (c5x)

### Step p1: Heavy and light   (Extension, about 4 min)
Arena: Drop Zone, Earth, drop height 50 m. Adds `dlanes` (Compare two drops, switched on), `dobj` (both lanes), `dair`, `dheight`. Hides `dcanopy`, `dvt`, `dft` (not needed here).

CARDS
1. Time for a race! **Compare two drops** gives you a second lane, and each lane can drop a different object. Press **Drop!** and both objects are released at exactly the same moment.
2. The **Air removed** slider takes air out of the Drop Zone. At 100% the Drop Zone becomes a **vacuum**, with no air at all. Scientists build huge vacuum chambers to test exactly this.

PREDICT FIRST
Question: You remove all the air, then drop a feather and a crate together from 50 m. What will happen?
Options: They will land at exactly the same moment · The crate will land well before the feather · The feather will land well before the crate · The feather will float and never land
After: Race them with the air, then race them again with all the air removed.

DO THIS
- Make your prediction in the box above.
- Race the **feather** against the **crate** from 50 m with all the air.   (ticks on a two-lane run: feather and crate, Earth, 0% removed)
- Remove **100%** of the air and race them again.   (same, 100% removed)
- Put the air back and drop the **basketball** once.   (ticks on a basketball run on Earth with 0% removed)

YOUR TURN QUESTIONS
q1 | reading | With all the air removed, how long did the feather and the crate take to land? | live: dzTime({obj:'crate', world:'earth', h:50, removed:100}) | unit s | tolerance 0.15
   ok: Yes, about 3.2 s, at exactly the same moment. With no air, nothing slows the feather down.
q2 | order | Put these in order of their terminal velocity on Earth, lowest first. Your runs in the Journal will help.
   items (correct order): The feather · The skydiver with the medium canopy open · The basketball · The crate · The skydiver with the canopy closed
   (values: 0.6, 6.0, 20, 38, 54 m/s)
q3 | reason | With the air in, the 40 kg crate falls faster than the 0.6 kg basketball. Why?
   Options: The crate has a higher terminal velocity · The crate feels less air resistance at every velocity · The crate is pulled harder on each kilogram · The crate has no air resistance acting on it
   correct 0
   reasons: Its bigger weight needs a bigger air resistance to balance it, which only happens at a higher velocity · Its bigger mass means air resistance stops working on it · Heavier objects always fall faster, even with no air · Its sharp corners cut through the air, so air resistance can't act
   correct reason 0
   why: Every kilogram is pulled by 9.8 N on Earth, whatever the object. The crate's weight is much bigger, so the air resistance has to grow much bigger before the forces balance, and that needs a higher velocity. With no air, as you saw, they land together.
Glossary words to underline: vacuum, terminal velocity.
Masked readouts: none.

### Step p2: Other worlds   (Extension, about 5 min)
Arena: two lanes, drop height 100 m. Adds `dworld` (both lanes) and shows `dvt` again (the live velocity–time graph, needed for c5r10: on the Moon it is a straight line). Lane A Earth, lane B Moon, both crates to start.

CARDS
1. The Drop Zone can now visit other worlds! Each one has its own **gravitational field strength**, g, which tells you how hard it pulls on each kilogram. Each world has its own air too: none at all, very thin, or very thick. Choose a world for each lane and race!
2. **Weight = mass × g.** The crate's mass is 40 kg everywhere, but its weight changes from world to world.
   Worked example: On Earth, g = 9.8 N/kg, so the crate weighs 40 × 9.8 = **392 N**. On Mars, g = 3.7 N/kg, so the same crate weighs 40 × 3.7 = **148 N**.
3. Some of these worlds are deadly! Venus is hot enough to melt lead, and Jupiter has no ground at all (our drops stop at a platform in the clouds). Luckily, our crates are made of pretend Force HQ super-metal.

PREDICT FIRST
Question: You drop a crate from 100 m on Earth and another on the Moon, at the same moment. Which lands first?
Options: The crate on Earth lands first · The crate on the Moon lands first · They land at exactly the same moment · The Moon crate floats and never lands
After: Race them and watch the two free-body diagrams.

DO THIS
- Make your prediction in the box above.
- Race a crate on **Earth** against a crate on the **Moon** from 100 m.   (ticks on a two-lane run, crates, Earth and Moon, 100 m)
- Drop a crate on **Venus** and watch its velocity.   (ticks on a crate run on Venus)
- (calculate task) `['', () => hasAns('q2'), { q: 'q2' }]`

YOUR TURN QUESTIONS
q1 | reading | How long did the crate on the Moon take to land? | live: dzTime({obj:'crate', world:'moon', h:100}) | unit s | tolerance 0.2
   ok: About 11.2 s. The Moon pulls each kilogram with only 1.6 N, so the crate speeds up slowly, even with no air at all.
q2 | num | A skydiver has a mass of 75 kg. What is their weight on Mars, where g = 3.7 N/kg? | answer 277.5 | unit N | tolerance 0.5 | units picker | ladder
   Hints: Weight = mass × g. · Use the skydiver's mass, 75 kg, and Mars's g, 3.7 N/kg. · Type 75 × 3.7 into the calculator.
   Working shown after: weight = 75 × 3.7 = 277.5 N.
q3 | pick | On Venus, the crate's terminal velocity was {0} its terminal velocity on Earth, because the air on Venus is {1}.
   {0}: much higher than / about the same as / much lower than → much lower than
   {1}: much thinner / about the same / much thicker → much thicker
q4 | fix | Ana works out the weight of a 40 kg crate on the Moon. Spot her mistake. Tap it, then correct it.
   lines: 1. Weight = mass × g · 2. Weight = 40 × 9.8 · 3. Weight = 392 N
   mistake: line 2
   fix (num): answer 64 | unit N | units picker | tolerance 0.5
   why: Ana used Earth's g. On the Moon g is 1.6 N/kg, so the weight is 40 × 1.6 = 64 N. The mass is still 40 kg, but the weight is much smaller.
Glossary words to underline: gravitational field strength, weight, mass.
Masked readouts: the weight label on the free-body diagram (`fbdW`) for a skydiver on Mars until q2 is answered, and for a crate on the Moon until q4 is answered.

### Step p3: Hover   (Extension, about 3 min)
Arena: the helicopter pad (`S.scene = 'heli'`), Earth. Adds `lift` (slider and number box) and the helicopter readouts. Hides the Drop Zone panels.

CARDS
1. The helicopter that drops your crates has a mass of **1,180 kg**. Its spinning blades push air down, so the air pushes the helicopter up. That's Newton's third law again! The upward force is called **lift**.
2. To **hover**, the helicopter must stay perfectly still in the air. Work out its weight first, then set the lift to match it. Red markers on the slider show lifts that were too big, and yellow ones show lifts that were too small.

DO THIS
- (calculate task) `['', () => hasAns('q1'), { q: 'q1' }]`
- Take off: set the lift bigger than the weight and watch the helicopter climb.   (ticks once it has climbed above 20 m)
- Now make it **hover**: set the lift so it stays still in the air.   (ticks on the "Hovering!" badge)

YOUR TURN QUESTIONS
q1 | num | The helicopter has a mass of 1,180 kg. What is its weight on Earth? | answer 11564 | unit N | tolerance 2 | units picker | ladder
   Hints: Weight = mass × g. · On Earth g = 9.8 N/kg. · Type 1180 × 9.8 into the calculator.
   Working shown after: weight = 1,180 × 9.8 = 11,564 N, so it hovers with a lift of 11,564 N.
q2 | sort | Always, sometimes or never? Sort each statement. | groups: Always true · Sometimes true · Never true
   items: When the forces on an object are balanced, it is still → Sometimes true · When the forces on an object are balanced, its velocity does not change → Always true · A hovering helicopter has no forces acting on it → Never true · A falling object is speeding up → Sometimes true · Air resistance pushes in the opposite direction to the motion → Always true
q3 | pick | With the lift bigger than the weight, the helicopter first {0} upwards. As it climbs faster, air resistance grows until the forces are {1}, and then it climbs at a steady velocity.
   {0}: slows down / speeds up / stays still → speeds up
   {1}: unbalanced / switched off / balanced → balanced
Glossary words to underline: lift, hover, Newton's third law.
Masked readouts: the weight label on the helicopter's free-body diagram (`heliW`) until q1 is answered.

---

## H. Challenge: Drop Zone deliveries (c5x)

Engine: a new course `renderDropCourse` in `45-challenge.js`, the same pattern as `renderOrdersCourse`: one mission at a time, settings that the mission fixes are locked, the student chooses the canopy size and the automatic opening height (`dopenh`), and each drop is judged when it lands. Every drop counts: all objectives met on the 1st drop = 4 points, 2nd = 3, 3rd = 2, later = 1, and "Move on" after 3 misses scores 1. A pass is green and starts "Congratulations!". A miss names each objective that failed ("Landing velocity 9.0 m/s: too fast. Time 84 s: OK."). Each mission has a "Need a clue?" ladder.

Intro: Mission control has three deliveries for you, on three very different worlds. For each one, choose the canopy and the height to open it at, then drop. Use what you know about terminal velocity and air, and try to get it right in as few drops as you can.

z1 | Skydive on Earth | skydiver, Earth, 1,500 m, all the air
   Brief: Our skydiver must land **slower than 7 m/s**, within **2 minutes** of jumping. For safety, the canopy must open **above 300 m**.
   Objectives: landing velocity < 7.0 m/s · time ≤ 120 s · opened above 300 m
   Clues: Which canopies give a terminal velocity below 7 m/s? Your runs will tell you. · A big canopy is slow, so the time limit matters. How long does it take to fall 600 m at 6 m/s? · time = distance ÷ velocity: 600 ÷ 6 = 100 s. Add the time spent falling fast before the canopy opens.
   Feasibility (from the model): small never passes; medium passes when opened at 300 to 600 m; large passes when opened at 300 to 450 m.

z2 | Supply crate for Mars | crate, Mars, 3,000 m
   Brief: The Mars base needs supplies! The crate must land **slower than 20 m/s**. Mars has very thin air, so think carefully about the canopy.
   Objectives: landing velocity < 20.0 m/s
   Clues: Thin air means much less air resistance at every velocity. Which canopy gives the most air resistance? · Even with a canopy, the crate needs time and height to slow down. Open it high. · The large canopy works if it opens above about 350 m.
   Feasibility: small and medium never pass; large passes when opened at 350 m or higher.
   After the mission (pass or move on): Even the large canopy only slows the crate to about 16 m/s. That's why real Mars landers use parachutes **and** rockets.

z3 | Venus probe | crate, Venus, 1,000 m
   Brief: Drop the science crate onto Venus. It must land **slower than 6 m/s**, within **4 minutes**, before the heat damages it.
   Objectives: landing velocity < 6.0 m/s · time ≤ 240 s
   Clues: How thick is the air on Venus compared with Earth? · Try a drop with no canopy at all and watch the terminal velocity. · With no canopy, the crate's terminal velocity is about 5 m/s, so it lands in about 200 s. A canopy makes it far too slow.
   Feasibility: no canopy passes (lands at 4.97 m/s after 201 s); small canopy passes only if opened below 40 m; medium below 20 m; large never.

---

## I. Extension Check (c5r8–c5r12)

c5r8 | num | A 40 kg crate is dropped on Jupiter, where g = 24.8 N/kg. What is its weight? | answer 992 | unit N | tolerance 1 | units picker | ladder
   Hints: Weight = mass × g. · The mass is 40 kg and g is 24.8 N/kg. · Type 40 × 24.8 into the calculator.
   Working shown after: weight = 40 × 24.8 = 992 N, more than two and a half times its weight on Earth.

c5r9 | reason | sure: true | An astronaut on the Moon drops a hammer and a feather from the same height at the same moment. What happens?
   Options: They hit the ground at the same moment · The hammer hits the ground well before the feather · The feather hits the ground well before the hammer · They both float, because the Moon has no gravity
   correct 0
   reasons: There is no air, so only weight acts, and both gain 1.6 m/s of velocity every second · The hammer has a bigger weight, so it always speeds up faster · The feather has a smaller mass, so it speeds up faster · The Moon has no gravity, so nothing can fall there at all
   correct reason 0
   why: On the Moon there's no air resistance. Every kilogram is pulled with 1.6 N, so every object speeds up at the same rate. Astronaut David Scott did exactly this on Apollo 15 in 1971.

c5r10 | sketch | A crate is dropped on the Moon. Sketch its velocity for the first 10 seconds.
   xLabel: Time (s), 0 to 9 · yLabel: Velocity downwards (m/s), 0 to 16 · cols 10 · levels 10 (each level 1.6 m/s)
   model: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
   checks: Starts at zero (p0 ≤ 0.5) · Speeds up all the way (every point higher than the one before) · Speeds up by the same amount every second (the biggest and smallest step differ by at most 1 level) · Never levels off (p9 − p8 ≥ 0.5)
   Look for: a straight line rising from zero, because with no air the resultant force is the weight all the way down.

c5r11 | order | The same 40 kg crate sits on six worlds. Put them in order of the crate's weight, lowest first.
   items (correct order): Titan · the Moon · Mars · Venus · Earth · Jupiter
   (weights: 56, 64, 148, 356, 392, 992 N)

c5r12 | explain | Engineers landing a rover on Mars use a parachute, but they also need rockets to slow down at the end. Explain why a parachute alone is not enough on Mars.
   words: thin air, air resistance, terminal velocity, weight
   model: Mars has very thin air, so the air resistance on the rover is much smaller than it would be on Earth at the same velocity. The air resistance only balances the rover's weight at a very high velocity, so even with a parachute its terminal velocity is still far too fast for a safe landing. Rockets add an extra upward force to slow it down.
   checklist: Says the air on Mars is very thin, so there is much less air resistance · Says the air resistance only balances the weight at a high velocity, so the terminal velocity is still too high · Says rockets give an extra upward force that slows the rover down

---

## J. Build order for the coding model

1. Question types that need no Drop Zone: `order`, `pick`, `reason` (with `voices`, `sure`), `fix`. Each with its worksheet, key, scheme, `QMIN`, and `tests/qtypes.py`. Commit and deliver after each working change, as the Handoff says.
2. The Drop Zone engine and scene (B1, B2), checked against `tools/dropzone_model.py` with `tests/dropzone_physics.py`. Then pause, step and snapshot, the live FBD, lanes, worlds, canopy, runs and masks.
3. `freeze`, `spot`, `sketch`, and the sketch prediction.
4. Foundation steps d1–d4 and the Foundation Check.
5. The helicopter pad, Extension steps p1–p3, the Challenge, and the Extension Check.
6. Glossary, formulas, fun facts, sections, home card, Explore, worksheets and Toddle files, `tests/play_c5.py`, the full test run, and the Brief, Backlog and Handoff updates.

Before shipping: play both sections as a Grade 7 student with no teacher (the skill's independent-use check), check every number against the model, run the question-plan check (section D rules), and check the worksheets as images.
