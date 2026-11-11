# The rescue on real pulling physics (spec)

Replaces section 15 of `Workshop_Lesson_Mode_Spec.md`. Written 11 Nov 2026 on branch `rescue-physics` (cut from `reading-writing`).

**Why.** Tom, 9 Nov: the rescue is "very punishing of creative ideas". A ramp beside a platform didn't count, a platform couldn't go over a lever, and a ramp on a platform blocked the Gumdrop. "They should be able, theoretically, to just build a load of pulleys and drag the Gumdrop to the ship. That would wreck the Gumdrop and give a really bad score, but it should be possible."

**How this is being built.** Two rescue engines passed their tests and then failed when Tom played them. So the order this time is:

| Step | Job | Who | Status |
|---|---|---|---|
| 1 | This spec | Fable | Done |
| 2 | The model on its own, with number tests and no visuals | Fable | Done: `src/js/4q-pull.js`, `tests/pull_model.js` (79 checks) |
| 3 | Grey-box: bare crater, the real model, no story or scoring screens. **Tom plays it and tries to break it** | Fable builds, Tom plays | Built: `proto/Rescue-Physics-Greybox.html`. Waiting for Tom |
| 4 | Wire the model into the real rescue (section 6) | Sonnet | Built on branch `rescue-wiring` (jobs 1 to 11, including the tipping rule). `WORKSHOP_OPEN` stays false until Tom plays it |
| 5 | Worksheets, keys, marking text, docs | Sonnet | Done on `rescue-wiring`: My Rescue hull line, answer key, marking scheme, AI text, worksheets rebuilt, docs |
| 6 | Tom plays Part 5; then `WORKSHOP_OPEN = true` | Tom | |

## 1. The rules

The Gumdrop is a body that rests on a surface. A rope pulls it towards the rope's anchor, and it moves along whatever is under it.

1. **Surfaces.** Crater ground, platform tops and ramp decks. The Gumdrop takes the highest surface it can get onto, and stays on a ramp once it is on one.
2. **Force.** At every quarter-metre the model works out the force the rope needs: `force = load × (slope part + friction part)`. The model does not use a time-stepped physics engine, so nothing jitters and every number can be tested.
   - Crater ground is rough: friction 1/3, so dragging on flat ground needs **2,100 N** (6,300 ÷ 3).
   - Platform decks are smooth: friction 0.1 (630 N on the flat).
   - Ramp decks are rollers: no friction. So a ramp's MA is still exactly length ÷ rise, and Parts 1 to 4 stay true.
   - A crane lift has no friction: force = load.
3. **Only a wall stops it.** A wall is a rise of more than **1 m within half a metre**: a platform taller than 1 m, or the side of a big blast hole. Everything smaller is dragged over.
4. **Bumps.** A step of 0.3 m to 1 m is climbed like a short, steep kerb. It needs a big pull and dents the hull.
5. **Falls.** Going off an edge is allowed. A drop of more than 0.5 m damages the hull.
6. **The free nudge.** The first 3 m of a leg is free if it is level (within 0.5 m): no force, no hand travel, no damage. This is the old glowing box turned into a grace: a ramp whose foot is near the Gumdrop gives the same textbook numbers as before. Further than 3 m, the rest is a real drag. **A winch post gets no nudge** (Tom, 11 Nov): every metre of a pure drag costs, so a bare rope moves nothing.
7. **Too heavy.** If the pull would pass 180 N, the Gumdrop stops at that spot. It still moves as far as Smooshy can manage.
8. **Platforms give way** the moment the Gumdrop gets onto one that can't hold it and the machines on it.

**Tipping (Tom, 11 Nov: "I'd like the Gumdrop to fall over if it's dragged over high friction, or dropped down a ramp etc. It should take damage when it falls, and when it's fallen over, it should take extra damage when dragged.")**
- The Gumdrop is tall. It falls onto its side when it is dragged more than **1 m over rough crater ground**, when it is bumped over a kerb, or when it **drops more than 0.5 m**.
- Falling over costs **10%** hull damage, once each time.
- While it lies on its side, scraping over crater ground costs **twice as much** (2.4% per metre).
- Smooth platform decks, ramps and lifts never tip it. A **crane lift stands it up again**, because it hangs straight from the hook.
- Model: `gpTip`, `leg.tips`, `leg.lying`, path points carry `t: 1` while it lies down, `dmg.tips`. The run draws it going over and lying on its side.

## 2. Who pulls (a leg = one rope's pull, from start to stop)

Each rope is used once. The nearest one goes first. Smooshy never works a machine that would only drag the ship back down.

| Puller | What it does |
|---|---|
| **Ramp roped to the Gumdrop** | The anchor is the ramp's head. The Gumdrop is nudged or dragged to the foot, then rolls up the deck. If it is already part-way along, it joins the ramp there. |
| **Crane roped to the Gumdrop** | Drags the Gumdrop under its hook if it has to, lifts it, and the trolley carries it across and lowers it onto whatever is there (any height below the lift, no 0.5 m rule). A taller platform in the trolley's way is a wall. With Move across 0 it stays on the hook. |
| **Lever, screw jack** | Lifts the Gumdrop when it rests within 1.5 m. No rope. |
| **Winch post (new)** | A pulley block or winch that is roped to the Gumdrop and belongs to no machine. The Gumdrop is dragged to where it stands. This is "just build a load of pulleys". It needs them: the steepest ground under the crest takes about 6,400 N, so an MA of about 36 just to move it and about 107 to keep Smooshy under 60 N. The builder must show the post's pulley block, winches and total MA. |

**Held up.** After a crane with no Move across, a lever or a jack, the Gumdrop is held in the air. The next rope pulls it sideways (up to 8 m on a crane's beam, 3 m off a lever or jack) until it is over something within 0.5 m below, and it settles there. With nothing under it, it falls.

**The saved rig does not change.** `gpEvaluate` reads the same `{ parts, cables }` as `glEvaluate`. No migration is needed. A winch post is a block or winch with a cable to `'ship'`.

## 3. Hull damage: one meter

Everything feeds `dmg.total` (0 to 100%), and the report lists where it came from.

| Source | Amount |
|---|---|
| Thrusters (pull over 60 N) | as now |
| Boulder left on, leg holds | 25% |
| Boulder left on, leg rips off | 100% |
| Blast within 6 m of the ship | 15% each |
| Scraping over crater ground | 1.2% per metre, 2.4% while it lies on its side |
| Falling over | 10% each time |
| Bumps | 6% per metre of step |
| Falls over 0.5 m | 8% per metre |

**Score.** The eleven points stay as they are, and ship condition (2, 1 or 0) reads the one meter. New: at **60% damage or more the rescue is "wrecked"** and scores 3 at most. Dragging the whole way out gives about 80% damage, 27,000 m of hand travel and a score of 3.

## 4. What students work out, and what the strip gives them

Each leg has `force` (the biggest force the rope needed), `ropeMA` (ropes × winches) and `simple`.

- **Simple leg** (`simple: true`): a ramp taken from its foot, a crane lift, a lever or a jack, with no paid dragging. Students do today's maths: machine MA, total MA, pull = load ÷ MA, hand distance, work. Every number matches the old model.
- **Any leg with a drag in it** (`given: true`): the strip gives the force and the distance ("Dragging here needs 2,100 N over 8 m"). Students do rope MA, then pull = force ÷ MA, then hand distance = MA × distance. No friction maths. The strip gives the work for these legs, because the force changes along the way.

## 5. For Tom to decide while playing the grey-box

The grey-box has a "Tune the rules" panel for all of these.

1. ~~Is the 3 m free nudge right?~~ Decided 11 Nov: keep it for ramps and cranes, none for winch posts.
2. Is 1 m the right height for a wall?
3. Does dragging hurt enough? (1.2% per metre; 2,100 N on the flat.)
4. Is a 4 m fall at 32% fair?
5. Should a wrecked rescue score 3 at most?
6. Ramps: in the grey-box each end of a ramp rests on whatever is under it, and its length and rise follow. Is that easier than setting length and rise? If yes, the real builder changes to match.
7. Has any student played Part 5? If not, the old-save code can go.

## 6. Step 4: wiring it in (after Tom signs off)

One Sonnet agent, medium effort, this section as the brief. Opus or Fable reviews screenshots.

1. **Swap the model.** Every `glEvaluate(` call becomes `gpEvaluate(`. Then delete from `4f-gummylift.js` only what nothing uses (`inZone`, the handover box constants `hzX` if unused; `hzY` is still used by the beam check).
2. **Builder (`4g`, `4h`).** Remove the glowing handover box and the "start the next machine in here" rule. Ghost Gumdrops stay (`ghosts`). Remove the rule that a platform can't go over a lever. A block or winch dropped on open ground and roped to the Gumdrop is a winch post. Draw each leg's path from `leg.path`, coloured by what the Gumdrop is doing, with the wall marked when `stop.why === 'wall'`.
3. **Run (`4i`).** Animate the Gumdrop along `leg.path`, with Smooshy at the puller. Narrate drags, bumps and falls. Add a Hull meter that fills as it goes.
4. **Route strip and GASA (`4p`).** Section 4 above. Simple legs unchanged. Drag legs show the given force and distance.
5. **Hints (`4k`).** Tier 2 and 3 for a drag leg: force ÷ rope MA.
6. **Guided start (`4j`).** Rewrite for the new rules: no box. Add one line: "You can drag the Gumdrop over the ground, but it scrapes the hull."
7. **Part 4.** Step `k4` and the "Platforms and the handover box" first-time cards teach the box. Change them to "whatever the Gumdrop is resting on, the next rope picks it up", using a ramp beside the shelf.
8. **Score and endings.** Add the "wrecked" ending card. Result card lists the hull damage sources.
9. **Outputs (load `wab-sim-toddle-outputs`).** My Rescue page: hull damage line and sources. Answer key, marking scheme and the Toddle AI feedback text: hull damage and the "wrecked" rule; the reflection question's model answer mentions dragging.
10. **Tests.** `tests/pull_model.js` joins `run_all.sh`. Rewrite `rescue_numbers.py`, `play_rescue.py`, `stage2_ropes.py`, `stage4_gasa.py`, `play_story.py`, `play_hints.py`, `play_myrescue.py`, `k4_two_leg.py` for the new rules. New play test: build a drag-only route with real pointer moves and reach the beam, wrecked.
11. **Docs.** Brief, backlog, handoff, Chapter 6 script, Project copies. Then `WORKSHOP_OPEN = true` after Tom plays.

**The boulder (Tom, 11 Nov: "Not removing the boulder should pull the Gumdrop apart. It should have some internal force that it can resist before it is pulled into pieces.").**
- A boulder that was not cleared is jammed on the landing leg and hangs off the Gumdrop wherever it goes (load 8,400 N). The run draws it moving with the ship.
- The leg carries the boulder's share of every pull: **strain = force × 2,100 ÷ 8,400**. The leg can take **500 N** (`GP.legHold`).
- Above that, the leg rips off: the boulder stays behind, the load drops back to 6,300 N, and the hull takes 100% damage (`GP.tear`), and the rescue ends as "torn": it scores **2 at most** (`GP.tornCap`), one below the cap for a wrecked rescue, so it is always below the same route with the boulder cleared.
- What that means in play: a crane lift (strain 2,100 N), any drag over crater ground (700 N on the flat) and a 24 m ramp up 6 m (525 N) all pull it apart. Only a very gentle ramp (30 m up 6 m: 420 N) gets away with it, and then the old costs apply (25% damage, no boulder point, pull points capped at 2).
- Clearing the boulder always scores more than leaving it. Tested in `tests/pull_model.js`.

**Not affected:** Parts 1 to 3, the Challenges and the Check keep their numbers and marks.

## 7. Art and opening (11 Nov 2026)

- Tom approved the art sample ("the art work all looks good") with one change: the Big Jelly is now a **mothership** about 35 m long (prow towards the crater, three engines, decks of windows, bridge under a jelly dome, tractor-beam bay at x = 86 m), drawn in `glDrawBigJelly`.
- The sample's look is in the app: night sky, far hills, layered ground, glowing crystals, steel lattice crane and platforms with hazard bars, roller ramps, yellow pulley blocks and winches, two-tone ropes, the new Gumdrop (`drawGumdrop`), dust and sparks while it is dragged. All in `src/js/4g-glscene.js`; the Workshop lesson boards use the same machine drawings, so Parts 1 to 4 get them too.
- **`WORKSHOP_OPEN = true`** (Tom, 11 Nov: "Let's update the art and open it up", so he can play-test). Not for Toddle until he has played Part 5.
- Still to do: the lesson boards' indoor background (Parts 1 to 4) keeps its pale simulator grid.

## 8. Tom's first play-test of the wired-in rescue (11 Nov 2026)

1. **The crane lowers.** "Cranes should lower until it sets on a surface. It can lift, it should be able to put down too. Only lifts should count towards the maths." The model already did this (`gpCraneLeg`); the board was still drawing the old "Nothing to set it on" fault. Now `glSetSpot` marks where the trolley sets the load down (the highest thing at or below the lifted height: a platform top, else the ground), with a dotted line down from the trolley. Red only when something taller than the lift is in the way.
2. **The tutorial coach** replaces the guided-start panel that pushed the board down. A small card on the board (drag it, Hide it, or Skip): free the boulder, choose one of two first legs (ramp to the shelf, or crane onto a platform), build it, choose one of two second legs from where the Gumdrop rests, build it, test, then "Continue from here" or "Keep leg 1, build my own". State: `gl.guide` ('on', 'done', 'skip') and `gl.tut` ({ a, b, min }). No leg numbers: the coach only says whether Smooshy can manage the pull. Code: `GLG`, `glgSteps`, `glGuidePaint` in `4j-glstory.js`.
3. **Settings on the board.** The side dock is gone, so the board has the full width. `#glDock` is a card over the top right of the board, shown only while a piece is picked (✕ Close, or tap empty ground). On a phone both cards sit just under the board.
4. **Opening shot and home view.** First visit: the camera starts on the Big Jelly, pans left over the crest to the Gumdrop, with three captions (tap to skip), then settles in the home view (zoom 1.6 on the crater floor and the wall up to the shelf). ⤢ still shows the whole crater. During a run the camera follows the Gumdrop when zoomed in, and the builder's view comes back afterwards. The test build (`FAST`) keeps the whole-crater view so older tests can reach every spot. The board is 400 units tall (was 300).
5. **Layering.** "I want to be able to click on things that are on top of each other. The system shouldn't automatically put stuff on top of a platform just because it's been added. I should make the choice."
   - `p.on` (a platform's id, or 'ground') is the student's choice of what a crane, lever, jack, winch or ramp foot stands on (`glStand`). It is set by where the piece is dropped (on a platform top, or under the deck), by pulling it clearly up or down while dragging, or with **Stands on** in the settings card. A platform added later never lifts a piece. Parts from older saves have no `p.on` and keep the old rule (highest platform).
   - Tapping a piece that is already picked moves on to the next piece underneath (`glHitStack`, `glTapPick`), and the picked piece is the one that drags.
6. Fixed on the way: a platform dropped where a machine stands froze the board; a winch dropped near the boulder no longer clips to the boulder once a lever or jack is on it.

Tests: `tests/board_ux.py`, `tests/plat_flash.py`; the tutorial parts of `stage4_gasa.py` and `throb_next.py` were rewritten. The shared test opener skips the tutorial unless asked (`open_part5(pg, guide=True)`), and the `Board` helper closes a card that covers the spot it is about to tap.

## 9. The boulder is a two-leg job, and it is the tutorial (Tom, 11 Nov 2026)

**Tom's words.** "I'm not sure how much value this boulder has if it can only be removed by a lever." Then: "Removing the boulder and moving it to the left, out of the way, IS the tutorial. Leg one = pry free, leg two = lift and shift to side." "The boulder is lifted up and the lever keeps it lifted up and then the crane attaches to it. I think this will make it easier to make it consistent with the other jobs where you make it do a movement and then you see where the object goes and then you have to pick the next machine to start from where that leg begins." "Oh and lever and winch. Winch locks to keep it lifted." He also said a pulley block pushing a lever down is strange, so **pulley blocks no longer count on a lever** (winches do).

**The model is done** (`gpBoulder` in `src/js/4q-pull.js`, constants `GP_ROCK`; `tests/rescue_routes.js` has the new kit `BL` + `BLC`; `node tests/pull_model.js` passes 95/95):

- **Leg 1, pry.** A lever or screw jack with `role: 'boulder'` lifts the boulder 0.5 m off the landing leg. Pull = 252 ÷ (lever MA × winch ratios). It only **stays up** if something holds it: a **winch on the lever's pulling end locks** (`pry.lock`), and a screw jack holds by itself. `pry.ok` = pull ≤ 60 N and locked. `pry.easy` = pull ≤ 60 N (so the board can say "Smooshy can lift it, but nothing holds it up").
- **Leg 2, lift and shift.** A crane gantry with `role: 'boulder'` (standing over the boulder, x = 18.7) picks up the held boulder. Pull = 252 ÷ (ropes × winch ratios). Its trolley carries it across and lowers it onto the ground. `move.why`: `'jammed'` (leg 1 is not working yet: a crane cannot pull a boulder out from under the leg), `'heavy'` (pull over 60 N), `'near'` (set down less than 3 m from where it was), `'on'` (set down on the Gumdrop: within 2.7 m of x = 14), `'low'` (passes over the Gumdrop with less than 5.5 m of lift). `move.to` is where it lands; `move.hand` = MA × lift; `move.work` = 252 × lift.
- `boulder.ok` only when both legs work (or a blast reaches the boulder). `boulder.stage`: `'jammed'`, `'held'` (pried and locked, still in the way), `'clear'`. Until it is clear the boulder is still on (`rockOn`), with the 2,100 N extra load and the tearing rule as before.
- `boulder.how`: `'blast'`, `'crane'` (cleared by the two legs), else the pry machine's type, else null. The old "rope and winch straight from the boulder" way is gone.
- The kit that works: lever (load arm 1 m) + winch ×2 → 14 N, locked; crane lifting 6 m, Move across 8 m to the left, + winch ×6 → 42 N. It costs 70 crystals more than the old lone lever, so `ROUTES.crane` is now over budget (score 9). **Open decision for Tom: raise the budget from 475 to 545?** Do not change the budget without his say.

### Wiring jobs (Sonnet, medium effort)

1. **Builder (`4h`).**
   - A crane dropped on, or dragged onto, the boulder (within 2 m of x = 18.7) snaps to x = 18.7 and gets `role: 'boulder'`, `on: 'ground'` (like `glBoulderSnap` for levers; toast "✓ Crane on the boulder!"). Dragged away, it loses the role. Its settings card title: "Crane gantry (on the boulder)". Its Rope row says "✓ hooked to the boulder" once leg 1 holds the boulder up, else "waits for the boulder to be pried up".
   - A winch dropped near the lever's pulling end clips on (already works). A pulley block must not clip onto a lever any more (`glAutoAttach`, `glConnect`: toast "A lever takes a winch on its pulling end, not a pulley block.").
   - Draw the lever's pulling end so it reads as "something pulls here": a short rope and handle hanging from the effort end (in `drawLeverShape` only when a flag is passed, so the Workshop bench lever is unchanged).
   - While leg 1 holds (`stage === 'held'`), draw the boulder 0.5 m up with the lever tilted, and a small "Held up" tag. Draw the boulder's ◉ hook on it, and the crane's rope to it. When `stage === 'clear'`, draw a **ghost boulder** at `move.to` with the tag "Boulder after leg 2", and a dotted "Sets down here" spot (reuse `glDrawSetDown` with the crane's spot).
   - Settings card messages (plain sentences) for each `move.why` and for "not locked": e.g. "Smooshy can lift the boulder, but nothing holds it up when he lets go. Clip a winch onto the lever's pulling end: it locks." / "The boulder would hit the Gumdrop. Lift it at least 5.5 m before carrying it across." / "Set it down at least 3 m away from where it was." / "That would set it down on the Gumdrop."
   - Clip points glow: while a pulley block or winch is dragged from the tray (or picked for tap-to-place), every place it can clip onto glows with a small "clips on here" tag (lever pulling end: winch only; ramp top; crane hook; a chain's end; the Gumdrop's hook for a block).
2. **Run (`4i`).** Replace the boulder beat: Smooshy walks to the lever's winch, cranks, the lever tilts and the boulder rises 0.5 m ("Locked!"); then walks to the crane's winch, the boulder lifts, the trolley carries it across over the Gumdrop, lowers it, "Boulder clear!". If only leg 1 works: it rises and stays held, narration "The boulder is held up, but it is still in the way." If leg 1 is too hard or not locked: it rises and drops back ("It dropped back when Smooshy let go."). Test-run lines (`glTestLines`): "The boulder is pried up and held" / "The boulder is lifted clear" (or the reason). A screw jack pries without a winch.
3. **Route strip and GASA (`4p`).** Two rows: **"Boulder: pry"** (key `B`; cells: Lever MA, Winch MA (each), Total MA, Smooshy's pull) and **"Boulder: lift"** (key `B2`; cells: Pulley block MA if any, Winch MA (each), Total MA, Smooshy's pull, Hand distance; load 252 N, rise = the crane's lift). A jack pry row: Screw jack MA (given as 120), pull. Rows appear only for the machines that are placed. Hints (`4k`) for both rows.
4. **Tutorial (`4j`).** Replace the steps (keep the coach card, `gl.guide`, `gl.tut`, Hide, Skip, the dots, no leg numbers except the boulder pull, which is practice):
   1. Drag a **lever** onto the boulder.
   2. Tap it and shorten the **load arm** until Smooshy can lift the boulder (live line as now).
   3. "Smooshy can lift it, but it drops when he lets go." Clip a **winch** onto the lever's pulling end. It locks and holds the boulder up.
   4. "Leg 2. The boulder is held up. What picks it up from there?" Drag a **crane gantry** onto the boulder. Its rope hooks on.
   5. Clip a **pulley block** or a **winch** onto the crane until Smooshy can manage the lift (say which case: too heavy / can manage).
   6. Tap the crane: **Lifts** up to 5.5 m or more, so the boulder clears the Gumdrop.
   7. **Move across** to the left until it sets down clear of the Gumdrop (Direction Left, 7.5 or 8 m).
   8. Press **▶ Test in simulator** and watch both legs.
   9. End card: "Well done, engineer! Two machines, one after the other: the crane picked the boulder up from where the lever left it. Now rescue the Gumdrop the same way: each rope picks it up from wherever it is resting, up to the dotted line." One button: "Start my rescue".
   The two option cards and "Keep leg 1" go. Throb the right tile or settings button at each step.
5. **Texts.** Mission brief ("First, free the Gumdrop: pry the 252 N boulder off its leg, then lift it out of the way. If it is still there when the Gumdrop is pulled, the strain can tear the leg off."), result card ("Boulder: lifted clear / blasted / held up but still in the way / still jammed on"), ending text, `GL_FAULT`, the Part 5 intro in `4c-ch6.js` if it says a lever clears the boulder, hints. Warm, full sentences, Grade 7 to 8 level, no "it isn't X, it's Y".
6. **Outputs (load `wab-sim-toddle-outputs`).** Answer-key route in `4l-glreport.js` uses the new kit; My Rescue lists both boulder rows; answer key, marking scheme and AI text (`58-myp.js`) describe the two-leg boulder; worksheets rebuilt (`tools/make_worksheets.py`).
7. **Tests.** Add boulder cases to `tests/pull_model.js` (lever with no winch: easy but not locked, stage jammed; lever + winch: held; + crane with no winch: heavy; across 3 m right: clear; across -8 with lift 4: low; lift 6: clear; crane without pry: jammed; jack pries and holds alone; a pulley block on the lever adds nothing; blast clears). Update every test that builds or expects the old lone-lever boulder (`play_rescue`, `play_drag`, `play_story`, `play_hints`, `play_myrescue`, `stage2_ropes`, `stage4_gasa`, `throb_next`, `board_ux`, `rescue_numbers`, `trolley`, `play_c6` where needed). Crystal totals shift by the kit's cost. Then the full suite.
8. **Docs.** Brief, backlog, Chapter 6 script, this spec's status.

Keep `WORKSHOP_OPEN = true`. Do not change `gpBoulder` or the budget. Commit after each working step on `rescue-wiring` and push.
