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
