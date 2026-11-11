# Workshop on the rescue builder: lesson mode and Part 5 fixes (spec)

Tom, 8 Nov 2026, after playing Part 5: "I just want the engine they use when learning about a ramp, lever, pulley to be the same as this... If you expect students to use these tools to do something, then they need to be familiar with this system way before they have to use it in a freeform problem solving context." Every job, question and number in Parts 1 to 4 stays the same. Only what students see and touch changes. Branch `reading-writing`.

## 1. The principle: new view and controls, same maths

The Workshop's model layer stays exactly as it is: `WS`, `wsSetup`, `wsSet`, `wsSetMach`, `wsLimits`, `wsCalc`, `wsRecord`, `wsPull`/`wsUpdate`/`wsFinish`, `shopRuns`/`shopRun`/`shopHas`/`shopE`, masks, rulers, readouts (`readE`, `readMA`, `readWork`, `readEff`, `bTotMA`, `bTravel`, `bCable`) and Smooshy's bubbles. Every task check and every answer key keeps working untouched.

What changes is the layer on top: the old bench drawing (`4b-shopdraw.js`) and its control panels (`wsctl`, `wsmach`, `builder`: sliders, segmented buttons, the machine picker) are replaced by **lesson mode**, a small version of the rescue builder (`4g`, `4h`). Students drag pieces from the same tray, tap a piece to open the same menu, clip add-ons onto the same ◉ dots and stretch the same cables. Each change they make calls `wsSet` or `wsSetMach`, so the settings snap to today's `wsLimits` and every number is unchanged. The ▶ button calls `wsPull` and is labelled from `WS_VERB` (Lift!, Pull!, Turn!, Push!).

- **`lessonStage(o)`** replaces `shopStage(o)` in step `setup()`: it calls `wsSetup(o)` as now, then mounts the lesson board with `o.lesson = { tray: [...], pre: [...], lock: [...] }` (pieces in the tray, pieces already placed, and pieces that cannot be moved or removed).
- **One engine, two scales.** The builder's drawing and hit-testing take the world size from the board, so a 2 m lever bench and the 96 m crater use the same functions. `GL.beam` and similar constants become per-board settings.
- **Scene:** the Workshop at Gummy Base One, drawn in the builder's flat style, with the load labelled with its weight ("Rock 294 N"). The "Captain Smooshy · LIVE" video inset stays in a corner in Parts 1 to 4 (he coaches by video from the crater) and is never shown in Part 5.
- **Tasks stay where they are.** Only instruction text that names an old control changes (for example "Choose **By hand** and press **Lift!**" becomes "Press **▶ Lift!** with just the rope"). Sonnet lists every changed line in its report.
- **Retiring the old bench:** `4b-shopdraw.js` drawing and the `wsctl`/`wsmach`/`builder` panels are deleted only in the last stage, once nothing uses them. `4bb-shoppics.js` (picture cards) stays.

## 2. The pieces in lesson mode

Each piece works the same way it will in the rescue. The "First time" text shows the first time a student meets that piece (section 4).

| Piece | How students use it | Sets |
|---|---|---|
| **Just a rope** (no machine) | The rope from the load goes up to Smooshy's hands. ▶ Lift! with nothing attached | `mach: 'hand'` |
| **Lever** | A 2 m bar with the rock at one end and Smooshy's hand at the other. Drag the fulcrum (triangle) along the bar; labels on the bar show "rock to fulcrum 0.40 m" and "hand to fulcrum 1.60 m". With `classPick`, the lever's menu offers Fulcrum in the middle, Load in the middle and Effort in the middle (class names once `clsNames` is on), and the thing in the middle becomes the draggable part | `mach: 'lever'`, `cls`, `arm` |
| **Crane gantry** | A tall frame that holds the rope up high so a load can go straight up. Pre-placed over the load. Its menu sets the lift height where a step allows (`lifts.pick`) | the frame for `pulley` and `build` |
| **Pulley block** | Drag it onto the crane's hook (◉); it glows and clips on. Tap it for − and + to change the number of supporting ropes (up to `lim.ropesMax`). With no block, the crane gives 1 rope | `mach: 'pulley'`, `ropes` |
| **Winch** (wheel and axle) | Drag it onto the end of a rope (◉). Smooshy turns its handle instead of pulling the rope. Tap it to change the handle radius (and the axle, with `axleEdit`); the menu shows the ×MA | `mach: 'winch'`, `R`, `axle` |
| **Ramp** | Drag it in: its foot sits on the floor and its top rests on the platform. Drag the white top handle to change its length (`lim.rampL`). With `rampH`, drag the platform's top edge to change the height | `mach: 'ramp'`, `L`, `h` |
| **Screw jack** | Drag it under the car; it glows and snaps. Tap it to choose the handle circle and the gap between the threads | `mach: 'screw'`, `per`, `pitch` |
| **Wedge** | A demonstration drawn in the same style, not in the tray (it isn't used in the rescue). Its menu sets the thickness; ▶ Push! | `mach: 'wedge'`, `thick` |
| **Compound** | Crane gantry or ramp, plus pulley block, plus winch, joined by cables from ◉ dots, exactly as in the rescue. Placing a ramp sets `br` to its length; the crane sets `br = 0` | `mach: 'build'`, `bw`, `bn`, `br` |

## 3. Step by step

Same tasks, questions, answers and marks. "Tray" is what students can drag in; "Pre" is already placed.

| Step | Pre | Tray | Notes |
|---|---|---|---|
| lv1 | Rock with rope, Smooshy | Lever | Lift by hand first, then drag the lever under the rock |
| lv2, lv3 | Lever under the rock | — | Drag the fulcrum. lv3 shows the two rulers as now |
| lv4, lv5 | Lever | — | Set-up choice in the lever's menu; class names in lv5 |
| pl1 | Crane gantry over the crate (1 rope) | Pulley block | The pulley card sequence teaches hanging the block on the hook |
| pl2 | Crane gantry over the well, rope to the bucket | Winch | Clip the winch on the rope end; change the handle radius |
| pl3 | 1 m platform, cart at the bottom | Ramp | Stretch the ramp to 2 m, then 5 m |
| pl4 | Log with the wedge; car | Screw jack | Wedge demonstration, then the jack under the car |
| u1, u3 | Crane gantry over the crate | Pulley block | u3's lift height in the crane's menu |
| u2 | Crane gantry with the bucket; platform with the cart | Winch, Ramp | The machine Smooshy works is the one last placed or tapped (it sets `WS.mach` and its load, as the old picker did) |
| k1 | A finished crane (gantry, block, winch), locked | — | Look only, as now |
| k2 | Crane gantry over the engine block | Pulley block, Winch | Clip the block on the hook, then the winch on the block's rope |
| k3 | Generator, 2 m platform | Crane gantry, Ramp, Pulley block, Winch | The 6 m ramp comes from the tray; the task check stays `bw 4, bn 2, br 6` |
| v1 | Mission Control (section 5) | — | No building |
| p5a, p5b | Crane gantry over the tank; pod | Pulley block, Winch, Screw jack | The Perfect/Real switch (`mfric`) stays as a toggle above the board. Moved last (stage 6) |
| Build tasks 1–4 | As each task's start | As each task's allowed parts | Moved last (stage 6) |

## 4. First time a piece appears

Shown as three short cards with OK buttons and a ghost hand acting on the board. A "?" on each tray item replays them later. Student text:

**Lever**
1. "This is a lever: a long bar that turns on a **fulcrum** (the triangle)."
2. "Drag the fulcrum along the bar. Watch the two numbers: how far the rock is from the fulcrum, and how far your hand is."
3. "Press ▶ Pull! to push down on the end. In the rescue, a lever under the boulder will knock it clear."

**Crane gantry**
1. "This is a crane gantry: a tall frame with a hook at the top."
2. "The rope goes from the load, up over the top, and down to Smooshy. When he pulls down, the load goes straight up."
3. "On its own it doesn't make the pull smaller. Hang a pulley block on its hook to do that."

**Pulley block**
1. "A pulley block is a set of wheels that hangs from a hook."
2. "Drag it onto the crane's hook (the ◉ dot). It glows and clips on."
3. "Tap the block to add supporting ropes. More ropes share the load, so Smooshy's pull gets smaller."

**Winch**
1. "A winch is a wheel and axle. The rope wraps round the small axle, and Smooshy turns the big handle."
2. "Drag it onto the end of the rope (the ◉ dot), so the rope winds onto it."
3. "Tap the winch to change the handle size. A bigger handle means an easier turn, but more turning."

**Ramp**
1. "A ramp lets you push or pull a load up a slope instead of lifting it straight up."
2. "Drag the ramp in so its top rests on the platform. Drag the white handle at the top to make it longer."
3. "A longer ramp means a smaller pull, but further to go."

**Screw jack**
1. "A screw jack is a ramp wrapped round a pole, called a thread."
2. "Drag it under the car. It glows and snaps into place."
3. "Turn the handle round and round. Each turn lifts the car by one gap between the threads, so it's very easy but very slow."

**Cables (Part 4)**
1. "Machines can work together. Every machine has a ◉ dot where its rope comes out."
2. "Drag from one ◉ dot to the next to join them with a cable. Add-ons like a pulley block or a winch also clip straight on when you drop them on a ◉ dot."
3. "Smooshy always works the last machine in the chain."

**Platforms and the handover box (k3)**
1. "When a load reaches the top of one machine, it stops on a platform."
2. "The glowing box shows where the next machine must start. Put the foot of your next ramp, or your crane, inside it."
3. "You'll use this in the rescue to build a route up the crater."

**Dynamite (Part 5)**
1. "Dynamite blasts away some ground, so your route can be shorter."
2. "Drag it onto the ground. The dashed circle shows how much it will blast."
3. "Careful: a blast within 6 m of the Gumdrop damages the ship."

## 5. Part 5 fixes

**Mission Control (step v1).** Replaces the old bench scene. The whole crater from the rescue builder (`glDrawWorld`) shown on a big mission-control screen, with console lights round the edge. The Gumdrop has Smooshy in the window (`drawGumdropInside`), and the Big Jelly waits nearby. Labels: "Gumdrop 6,300 N", "Boulder 252 N" and "The beam reaches here" on the dotted line. No LIVE inset. Nothing to build. The step's three questions stay the same.

New v1 cards:
1. "Welcome to Gummy Mission Control! 🛰️ This is Planet Glimmer-9. The Gumdrop has crashed at the bottom of a 15 m deep crater, and a boulder is stuck against its landing leg. Captain Smooshy is safe inside. Let's get him home!"
2. "Here's the plan. The Big Jelly is a huge repair ship. It can't land close to the crater, so it waits nearby. Its tractor beam can lift the Gumdrop once the ship reaches the top of the crater. Smooshy will climb out and work each machine you build. When the Gumdrop reaches the top, he climbs back in and the beam carries the ship home." (with `picCraterPlan()`)
3. "Gravity on Glimmer-9 is weaker than on Earth: g = 4.2 N/kg. The ship is still far too heavy for a 60 N gummy bear, so you'll need machines. 💎 **Sugar crystals** are gummy money, and you have 475 to spend on machines, platforms and dynamite. Smooshy has enough oxygen for 1,500 m of pulling. This mission takes two homework sessions: build and test a route in the first, then improve it in the second."

New mission card (`#mi-gl`):
- "The Gumdrop weighs **6,300 N**. Smooshy can only pull **60 N**. If he has to pull harder, he fires the broken thrusters, and they damage the ship."
- "The tractor beam can lift the Gumdrop once it reaches the dotted line at the top of the crater. Build a route of machines up to that line. Each machine starts in the glowing box where the last one finished."
- "💎 Sugar crystals are gummy money. You have **475** to spend. Smooshy has enough oxygen for **1,500 m** of pulling."
- "First, free the Gumdrop: a **252 N** boulder is stuck against its leg."

Add `sugarcrystal` to the glossary ("Gummy money on Glimmer-9. You spend sugar crystals to buy machines, platforms and dynamite."), and the counter reads "💎 120 of 475 sugar crystals (gummy money)".

**Board labels:** "Boulder 252 N" above the boulder, "Gumdrop 6,300 N" above the ship, "The beam reaches here" on the dotted line.

**Lever and jack snap.** A lever or jack counts as on the boulder when any part of it overlaps the boulder (not only its pivot). While a lever or jack is being dragged, the boulder glows with "Drop here". On snapping, a ✓ toast: "Lever on the boulder!".

**Dynamite.** Its tap area is at least 22 px across (44 px on touch), and it is tested before cable dots and platform edges.

**Guided first leg** (replaces the warm-up; Skip allowed; never gates anything):
1. "First, free the Gumdrop. Drag a **lever** from the tray onto the boulder. It glows when it's in the right place."
2. "Tap the lever and make it longer until Smooshy's pull on the boulder is 60 N or less." (The live boulder pull shows, as now.)
3. "Now the first machine for the ship. Drag a **ramp** into the glowing box next to the Gumdrop, then drag its white top handle to stretch it."
4. "Clip a **pulley block** onto the top of the ramp, at its ◉ dot."
5. "Clip a **winch** onto the end of the pulley block's rope."
6. "Fill in this leg in **My working**, then press ▶ Run Rescue to test it."

**My working table** (replaces the free-text Working box; a short Notes box stays):
- Rows are filled in automatically from the rig, grouped by leg ("Leg 1: ramp 24 m, up 6 m · pulley block, 4 ropes · winch ×7"), with a "Boulder" row for the lever or jack. Each leg row shows its load (6,300 N, or 8,400 N if the rock still rides on the ship).
- Students type each machine's MA, then for each leg the total MA, Smooshy's pull, the hand distance and the work. Nothing is pre-calculated.
- The pull typed for a leg is the prediction: Run Rescue unlocks once at least one leg has a pull. (This replaces the separate prediction box; `lastPred` keeps its format.)
- After a run, every filled cell shows ✓ or ✗. Changing a machine clears that leg's cells.
- Not marked. It prints on the My Rescue page in place of the free-text working. Saves under `chal.c6e.gl.work`.

## 6. Tests

- The model layer is unchanged, so `tools/workshop_model.py` and the number tests keep passing.
- New `tests/lesson_engine.py`: for every converted step, complete each task through the board with real pointer moves and assert that each run record equals `wsRecord` for the same settings set directly.
- `play_c6.py`, `play_bt.py` and any test that drives the old panels are rewritten to drive the board. `play_rescue.py`, `play_story.py`, `play_hints.py` and `play_myrescue.py` are updated for the guided first leg and the working table.
- Screenshots of every converted step at desktop and phone width go to `/tmp/fhq-shots/lesson/` for Opus to look at.

## 7. Stages and who does what

| Stage | Job | Who |
|---|---|---|
| 1 | This spec | Opus |
| 2 | Lesson mode, the lever and rope pieces, the first-time cards system, Part 1 (lv1–lv5) converted; Part 5's Mission Control, new text, labels, lever snap and dynamite tap | Sonnet, medium effort |
| 3 | **Tom plays Part 1 and Part 5's opening** | Tom |
| 4 | Parts 2–4 converted; guided first leg and My working table | Sonnet, medium effort |
| 5 | **Tom plays Parts 2–5** | Tom |
| 6 | Extension (p5a, p5b) and build tasks 1–4 converted; old bench code deleted | Sonnet, low effort |
| 7 | Worksheets, offline file, docs and Project copies after stages 2, 4 and 6 | Haiku |
| 8 | A fresh read of all changed student text | Opus, new agent |

---

# Refinements after Tom's play-through (8 Nov 2026, evening)

These replace anything above that disagrees with them. Part 1 played well; the comments below came from Parts 4 and 5 and the story screens.

## 9. The story guide (one story, from the home page to the rescue)

Every screen, card, label and worksheet uses these names and this arc. Student text stays Grade 7–8, short and enthusiastic.

- **Force HQ** is **GASA's Research and Development Centre**. GASA is the **Gummy Aeronautics and Space Agency**. Chapters 1 to 5 keep their arenas and content; only the home page framing changes.
- **The student** is a new GASA engineer.
- **Captain Smooshy** is a blue gummy bear astronaut (from the Grade 6 "Intergalactic Space Fluids" lab). His ship is **the Gumdrop**. It has crashed in a 15 m crater on **Planet Glimmer-9** (g = 4.2 N/kg). He is **safe inside the ship the whole time** and talks to GASA on a **live link from the Gumdrop**, seen through its round window. His squishy gummy arms pull 60 N at most. He only climbs out during the real rescue.
- **The Workshop** (Parts 1 to 4 and the Extension) holds the **GASA Training Simulator**. Every Learn step's board is labelled "GASA TRAINING SIMULATOR · THE WORKSHOP" and has a faint blue simulator grid on the floor, in the builder's flat style.
- **Mission Control** is a new building on the home map, next to the Workshop. Part 5 happens there. Its board is the **Rescue Simulator**, framed like the Mission Control screen in step v1 and labelled "GUMMY MISSION CONTROL · RESCUE SIMULATOR".
- **The Big Jelly** is GASA's repair ship. Its tractor beam lifts the Gumdrop once it reaches the top of the crater.
- **💎 Sugar crystals** are gummy money.
- **The arc:** Smooshy's live call reaches Mission Control (the opening transmission) → GASA sends the student to train on the simulator in the Workshop (Parts 1 to 4) → at Mission Control the student designs a rescue, tests it in the simulator, does the maths, and sends it to GASA; once GASA approves the maths, the real rescue launches (Part 5) → the Extension helps gummy colonists build Gummy Base One with the sugar crystals.

**Transmission (replaces the black box recording).** Header "📡 Incoming call · GASA Mission Control"; sub-header "Live from the Gumdrop · Planet Glimmer-9"; the animation ends on Smooshy inside the Gumdrop, waving through the window.
- "Captain Smooshy here, the bravest gummy bear in the universe! The Grade 6 scientists at WAB found the Intergalactic Space Fluid that carried me to a galaxy thousands of light years away. Then disaster struck: the Gumdrop crashed into a deep crater on Planet Glimmer-9. I'm safe inside, but the ship won't budge."
- "My squishy gummy arms can only pull with **60 N**, and the Gumdrop weighs thousands of newtons. GASA engineers, please train on the simulator in the Workshop, then plan a rescue to get me out. Over and out!"
- Buttons: "↺ Watch the crash again" and "Accept the mission!". The mission brief that follows says "jobs stand between GASA and a happy gummy bear".

**Rescue board** (top of every Chapter 6 page). Redrawn with the Part 5 art: the crater from the builder (`glDrawWorld` at board size), the Gumdrop with Smooshy in the window, the Big Jelly waiting. When Part 5 is done, the Gumdrop rises in the beam. The old toolkit pictures and the black box beacon go. Every slot is a button that opens its Part. Slots:
- Part 1 "Lever training", next: "Next: Part 1 trains you on the lever in the simulator."
- Part 2 "Toolkit training", next: "Next: Part 2 trains you on the crane gantry, pulley block, winch, ramp and screw jack."
- Part 3 "Maths check ready", next: "Next: Part 3 teaches the maths GASA checks before it approves a mission."
- Part 4 "Route training", next: "Next: Part 4 trains you to join machines into a route."
- Part 5 "Smooshy saved!", next: "Next: Part 5 is the rescue, planned at Mission Control."
- Extension "Gummy Base One built" (unchanged).

**Live inset** (everywhere it appears): labelled "LIVE · THE GUMDROP"; shows Smooshy inside the Gumdrop's cabin, framed by the round window, with his moods and bubbles as now and the "60 N max!" note.

**Home page.** Under the Force HQ title: "GASA Research and Development Centre". The map gains a **MISSION CONTROL** building beside the Workshop (a dome with a dish aerial, same art style), which opens Part 5 (`c6e`), or, while Part 5 is locked, says "Mission Control opens when you finish Part 4 in the Workshop." The Chapter 6 card: kicker "Chapter 6 · The Workshop and Mission Control", title "Save Captain Smooshy!", text "Captain Smooshy is stuck in a crater on Glimmer-9 with only 60 N of pull. Train on the GASA simulator in the Workshop, then plan his rescue at Mission Control." Chapter 6 blurb: "Simple and compound machines, mechanical advantage and work. Train on the GASA simulator, then plan Captain Smooshy's rescue at Mission Control."

## 10. Shared builder changes (both lesson mode and the rescue)

**Ropes to the load.** Every load (rock, crate, bucket, cart, car, engine block, generator, the Gumdrop) has a hook ◉. A machine only lifts a load when a rope joins its rope end (the crane's hook, a pulley block's lower hook, a ramp's top, a winch's drum) to the load's hook. Dropping a machine or block near a load snaps it into place and clips its rope on automatically, with the rope drawn; students can also drag the rope from ◉ to ◉, and drag it off again.
- Lesson mode: pl1 starts with the crane gantry roped to the crate (1 rope); the student drops the pulley block on the crate's hook, and its rope runs up to the crane's hook. In pl3 the student joins the cart's hook to the top of the ramp.
- Rescue: the Gumdrop's hook joins leg 1's machine. For later legs, the glowing box shows a **ghost Gumdrop** ("Gumdrop after leg 1") with its own hook: students drop the next machine by it (it snaps into place: a ramp's foot at the ship, a crane standing over it) and rope it to the ghost's hook. The ghost replaces the label "Start the next machine in here".
- Model: a cable endpoint `'ship'` (the ship at the start of the leg it joins). A leg with no rope to the ship stops the run with a plain reason: "Leg 2's machine isn't roped to the Gumdrop." Saved rigs that worked before get the ropes added on load, so nobody's route breaks. Update `tests/rescue_routes.js` and `rescue_numbers.py` rigs.

**Settings panel, docked.** No floating menus. Each piece's settings sit in a panel beside the board (below it on phones), titled with the piece's name and icon, with its "?" replay and 🗑 Remove. In lesson mode it always shows the step's piece without tapping (for the lever: the set-up choice and the fulcrum distance with − and +). In the rescue it shows the piece last tapped, or "Tap a machine to change it". Drag handles on the board are never covered.

**Labels.** On the board: short weight labels on loads ("Gumdrop 6,300 N", "Boulder 252 N", "Crate 235 N") and the ghost Gumdrop's caption only. Rope counts, winch ratios and rises move to the settings panel and My working. Labels are placed so they never overlap each other or a drag handle, and fade while something is being dragged.

**One drawing per piece.** Lesson mode and the rescue use the same drawing for each piece at different scales: the lever is a bar on a triangle fulcrum in both; crane gantry, pulley block, winch, ramp, screw jack and platforms likewise.

**Platform rule.** A platform can't be dropped under a machine that's already placed: it shows red with "Move the machine first, then add the platform." Platforms are where the ship lands; a machine standing on a platform keeps working.

**▶ inside the board.** The run button sits inside the board in the bottom-right corner (lesson mode: the Lift!/Pull!/Turn! button; rescue: ▶ Test in simulator).

## 11. Part 5: design, test, check the maths, get approval, launch

- **Route strip (My working)** above the board: one row per leg, filled in from the rig ("Leg 1: crane gantry + pulley block (4 ropes) + winch ×6 · up 4 m · lands on the medium platform ✓"), plus a Boulder row. Each leg row has inputs for each machine's MA, the total MA, Smooshy's pull, the hand distance and the work. Nothing is pre-calculated. Changing a machine clears that leg's inputs.
- **💡 Hint on each leg row**, three tiers as the existing hint tree (tier 1 the formulas, tier 2 this leg's own numbers with blanks, tier 3 a worked example with different numbers). Each tier opened counts as a hint the first time (first hint free, then −1 point each, as `glScore` does now). The total hints used shows on the strip.
- **▶ Test in simulator** (inside the board) runs the route quickly and shows where it worked or failed per leg ("Leg 2: too hard for Smooshy ✗", "Leg 3 isn't roped to the Gumdrop") with **no** leg numbers, so they can't be copied.
- **📨 Send to GASA** (on the route strip, enabled once every leg row is filled in): GASA checks every number. Wrong cells are flagged and the message says which ("Mission not accepted yet: check leg 2's pull."). Students fix and resend as often as they like. A cell rejected twice is shown with its right value and working, marked "helped", and counts as a hint.
- **Mission accepted 🚀**: the full rescue animation plays (Smooshy climbs out, works each machine, the Big Jelly's beam lifts the ship), then the result card (Spotless, Dented or Not yet).
- **Score:** "Maths approved by GASA" is a scored objective alongside pull, oxygen, crystals and damage; hints (including "helped" cells) reduce the total. Attempting is enough to move on, and the Check is never blocked.
- **Guided start (two legs):** the boulder lever; leg 1 (crane or ramp roped to the Gumdrop, pulley block, winch); then the ghost Gumdrop on the platform and leg 2's machine roped to it; then "Fill in your route strip and test it in the simulator." Skip allowed.
- **My Rescue page** prints the route strip with ✓ and "helped" marks, the hints used and whether GASA approved.
- **Part 4 (k3)** practises a two-leg route with a crate in the Training Simulator (ramp to a platform, then a crane roped to the crate on the platform), so the handover is not new in Part 5.

## 12. Order (replaces section 7)

| Stage | Job | Who |
|---|---|---|
| 2 | Shared builder changes (section 10) | Sonnet, medium effort, branch `reading-writing` |
| 2b | Story and art (section 9) at the same time, in its own worktree on branch `story-art`, then merged | Sonnet, medium effort |
| 2c | Opus looks at screenshots of every board and story screen together for consistency | Opus |
| 3 | Parts 2–4 converted (with ropes to loads, simulator labels and the k3 two-leg practice) | Sonnet, medium effort |
| 4 | Part 5 (section 11) | Sonnet, medium effort |
| 5 | **Tom plays Parts 2–5** | Tom |
| 6 | Extension and build tasks converted, old bench deleted; worksheets and docs | Sonnet low effort, then Haiku |
| 7 | Fresh read of all changed student text | Opus, new agent |

## 13. Consistency fixes from Opus's screenshot review (8 Nov, after stages 2 and 2b)

Do these in stage 3, before converting Parts 2–4, so every converted step inherits them.

- **Lesson board look.** It still shows "THE WORKSHOP · GUMMY BASE ONE", a Glimmer-9 purple sky with crystals, and its own old "CAPTAIN SMOOSHY · LIVE" inset with Smooshy outside in space. Change to: label "GASA TRAINING SIMULATOR · THE WORKSHOP"; an indoor simulator look (light background with a faint blue grid, in the builder's flat style; no Glimmer-9 sky or crystals); and the shared live inset from `4b-shopdraw.js` ("LIVE · THE GUMDROP", Smooshy inside the cabin window). Lesson mode must call that one inset function, not draw its own.
- **Labels pushed away from their object** (for example "Gumdrop 6,300 N" ending up far to the left of the ship) get a thin leader line to the object, or stay touching it.
- **Story lines in `4c-ch6.js` and `55-sections.js`:**
  - Line ~501 "Force HQ engineers" becomes "GASA engineers".
  - The Part 3 challenge "Launch-day loading" (`55-sections.js` ~73, `4c-ch6.js` ~426 and ~449): Gummy Rescue One is replaced by the Big Jelly, so the challenge becomes "Loading the Big Jelly", with the intro "The Big Jelly, GASA's repair ship, is on the launch pad at Force HQ, and it needs loading before it flies to Glimmer-9! Practise like Smooshy: no pull may be more than **60 N**." and the ending "The Big Jelly is fully loaded! Next, Part 4: machines inside machines." Numbers unchanged.
  - Toolkit lines (~120, 134, 149, 161, 172, 473): "packed in the toolkit" becomes "packed on the Big Jelly" (for example "Pulley blocks packed on the Big Jelly.", "Wedges and a screw jack packed. The Big Jelly's toolkit is ready!").
  - `4bb-shoppics.js` ~271–279 (Part 5 picture: Smooshy squeezes out through the hatch for the real rescue) stays: it describes the launch, when he does climb out.

## 14. The crane trolley, and the challenges on the shared builder (9 Nov playtest; waiting for Tom's green light)

**Why.** Tom lifted the Gumdrop with a crane, then had no way to move it on. In the current model a crane only lifts straight up. The load then hangs in mid-air, and the next machine must start within 3 m across and 0.5 m up or down of it. That rule is invisible, and real gantry cranes don't work like that. Tom: "If I can't figure it out, a student won't be able to."

**The trolley.** Every crane gantry has a trolley that rolls along its top beam. A real gantry crane works this way.
- Panel settings: **Lift height** (as now, up to 8 m) and **Move across** (0 m up to the gantry's span, to the left or the right). The span grows to fit, up to 8 m.
- What happens: the hook lifts the load by the lift height, the trolley carries it across, then the load is set down on whatever is under it there: ground, a shelf, a platform or the Big Jelly's hold. The set-down spot must be within 0.5 m of the lifted height (the same handover rule as now, now made visible). The board shows a "Set down here" glow where the trolley will put the load, before the run.
- The maths doesn't change: work = load × lift height; hand distance = mechanical advantage × lift height. Moving across adds no lifting work in a perfect machine. This is a physics point worth showing ("Carrying it across doesn't lift it, so it adds no work").
- Old saves: Move across 0 m behaves exactly as now.
- Tom's word was "lever". The student word is **trolley**, so it isn't confused with the lever machine. The crane's panel calls the control "Move across".

**Teaching it before it's needed.**
1. **First-time cards** for the crane gantry get a 4th card: "The trolley rolls along the top beam. It carries the load across, then sets it down on a shelf or platform."
2. **Part 3 `u3` (Work and the catch)** gets one new unmarked practice task after its existing ones: "Lift the crate 2 m, then move it 3 m across and set it down on the shelf. Did moving it across add any work?" with a one-tap reveal: "No. Work = force × distance moved *upwards* against its weight. Moving across adds no lifting work." No marks or ids change.
3. **The Part 3 Challenge "Loading the Big Jelly" (y1–y3)** moves onto the shared builder. The Big Jelly sits on the launch pad at Force HQ, and each mission builds a crane from the tray, then lifts and trolleys the cargo into its hold. y1 is a crane plus a pulley block (the oxygen tank, 3 m up into the hatch). y2 stays a ramp (the fuel barrel onto the loading bay), with the crane not needed. y3 is a crane plus a winch (the spare engine, 2 m into the cargo bay). Each mission's targets, objectives, clues, marks and answers stay the same; only the board and the controls change, plus the set-down into the hold.
4. **The Part 4 Challenge (h1–h3)** moves onto the shared builder too (a compound crane: gantry, pulley block and winch; h2 has a ramp-route option). Same targets and marks.
5. **The two-leg practice (now its own last step, `k4`, 9 Nov 2026)** becomes: leg 1, the crane lifts the crate and the trolley sets it on a shelf; leg 2, a ramp from the shelf up to the platform. So a handover *from* a crane has been practised before Part 5.
6. **Part 5**: the crane's panel has Move across; the guided start mentions it in one line; the route strip maths doesn't change.

**Story fixes in the same round.**
- Part 3's `rescue:` lines say "the mission computer". Change them to GASA's maths check (Part 3's rescue-board slot is "Maths check ready"):
  - u1: "GASA's maths check has learned mechanical advantage."
  - u2: "GASA's maths check can predict the effort for any simple machine."
  - u3: "GASA's maths check now checks the work for every plan."
- The u1 card's "My mission computer can't understand 'easier'" becomes "GASA's maths check can't understand 'easier'".
- y1, h1 and h2 say "the rocket". Change it to the Big Jelly (for example "up into the Big Jelly's hatch", "the Big Jelly's 200 kg nose cone", "onto the Big Jelly's deck").

**Also in this round (stage 6 as planned):** Extension p5a/p5b and Build tasks 1–4 move onto the shared builder, then the old bench code is deleted.

## 15. NEXT (Saturday 14 Nov 2026): the rescue on real pulling physics. The Workshop stays closed until this is done.

**Superseded on 11 Nov 2026 by `docs/Rescue_Pulling_Physics_Spec.md`.** The model is built and tested (`src/js/4q-pull.js`), and a grey-box is waiting for Tom to play. Read that spec, not the plan below.

**Tom's playtest (9 Nov):** "I've lifted it up and got it near the ramp, but I can't get the ramp next to the platform because then it doesn't count as the machine starting in the right place. I also can't place a platform over a lever, which seems odd. And when I place the ramp on the platform, since next to it won't work, it blocks the Gumdrop from moving. Very punishing of creative ideas and will result in students quitting or building the most boring thing they can. They should be able, theoretically, to just build a load of pulleys and drag the Gumdrop to the ship. That would wreck the Gumdrop and give a really bad score, but it should be possible with the physics. It should only be impossible if there is a big wall stopping it moving in the direction the rope is pulling it. Small walls or bumps, we should be able to drag the Gumdrop over at a small or large cost, depending on how much it's pulled over rough terrain and uneven builds."

**Cause.** The rescue model (`4f-gummylift.js`, about 220 lines) is a strict chain of legs. Each machine must start inside a 3 m × 0.5 m handover box (`GL.hzX`, `GL.hzY`, `inZone`). Pieces block by overlap rules, and the Gumdrop never moves except along a machine's own path.

**The plan Tom agreed (build on Saturday):**
1. **The Gumdrop is a body pulled by ropes.** Any machine whose rope reaches the Gumdrop can pull it, in the direction of its rope. It slides, rolls or lifts over the ground, platform tops and ramp surfaces. The handover box goes: whatever the Gumdrop rests on, the next rope picks it up.
2. **Only real walls stop it.** A step taller than about 1 m, or a near-vertical face, in the direction of the pull. Smaller bumps, lumpy builds and the edges of pieces can be dragged over.
3. **Pull needed = slope part + friction part.** Dragging on rough crater ground needs a bigger pull than rolling up a smooth ramp; lifting on a crane has no friction. Each leg's force comes from the simulator.
4. **Hull damage**, a new scored objective. Dragging over rough ground and bumps scrapes the hull: the more distance dragged and the rougher the ground, the more damage. Crane lifts and smooth ramps do none. "Lots of pulleys, drag it out" works but scores badly.
5. **Pieces only block as walls.** A platform may sit over a lever. A ramp resting on a platform doesn't block the Gumdrop: it can roll from the platform onto the ramp.
6. **GASA maths stays at Year 7–8 level.** For a dragging leg, the route strip gives the force ("Dragging here needs 2,100 N"); students still do MA, effort = force ÷ MA, hand distance and work. No friction maths for students.
7. **Keep:** Smooshy's 60 N limit, sugar crystals, oxygen, the route strip, hints, Send to GASA, the launch, the guided start (rewrite it for the new rules), the report. Old saved rigs must still load (glMigrate).
8. **Tests:** the existing rescue route tests are rewritten. A new test proves a drag-only route reaches the beam with heavy hull damage; a wall stops a drag; a ramp beside a platform hands over; a platform over a lever is allowed.

**Not affected:** Parts 1 to 4, the Challenges and the Check keep their numbers and marks, because they don't use this engine.

**When it's done:** set `WORKSHOP_OPEN = true` in `src/js/20-shell.js`, rebuild, and Tom plays Part 5 again.

**Estimate:** 2 to 3 hours of builder time. Use one Sonnet agent with this section as the brief, and Opus to review screenshots.
