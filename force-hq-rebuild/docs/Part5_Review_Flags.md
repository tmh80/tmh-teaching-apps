# Part 5 (the rescue on the new board): flags for review (12 Nov 2026)

Built by Claude Sonnet 5.5 in one go after Tom said "just do the rest together". Everything below is something to check, in the order of how likely it is to matter. Nothing here has been played by Tom yet. **Do not upload to Toddle until he has.**

## Choices I made where Tom had not decided (change any of them)

1. **What students calculate.** The route strip asks for each leg's total MA, Smooshy's pull and hand travel. The board hides "Smooshy pulls" until GASA approves. The board still shows "60 N × 4 × 20 = 4,800 N", which gives the total MA away. Decide whether the sum should be hidden too.
2. **Score out of 11** (invented): reaches the line 4, hull 2 (spotless) or 1 (under 20%), budget 475 or less 2, hand travel 2,500 m or less 1, 8 pieces or fewer 1, maths approved by GASA 1. Hints are recorded but cost nothing.
3. **Hand travel** is a score point, not a way to lose. The example route uses 9,443 m against the 2,500 m meter.
4. **Budget** stays 475 crystals. Screw jack alone is allowed. The tall-pole hoist was not built. Three legs is the design target, not a rule.
5. **Training rock** is a separate small panel (lever, then crane) shown before the board, not drawn on the main board. It uses the rock's 252 N, lever MA = 2 × arm length (copied from the board), and "Training kit packed away" is a message only. There is no coach card on the main board, and nothing from training goes into the strip or score. Skip button is always there.

## Known weak spots

6. **The answer-key example route is poor**: pull, crane, pull scores 7 of 11 (hull 84%, 9,443 m). It needs a better example (ramps to avoid scraping the hull). It lives in `RB5_KEY` in `src/js/4l-glreport.js`.
7. **Ground and Gumdrop art**: the board draws the Fable art unchanged (`glDrawSky`, `glDrawBigJelly`, `glDrawGround`, `glDrawShip`). The Gumdrop is drawn at the 4g scale (about 13% smaller than in the test board) and raised 0.45 m so its feet sit on the line. Hit areas and hooks still use the test board's sizes. Worth a look at carts and ramps.
8. **Run camera** follows the Gumdrop and zooms in to at least 1.8×; it returns to the student's view afterwards. Not tested on a phone.
9. **Opening pan** from the Big Jelly to the Gumdrop (about 3.6 s) plays on the first visit only after training. Checked once with `FAST=false`; reduced-motion skips it.
10. **Leftover wording**: `picCraterPlan()` (4bb-shoppics.js) still describes a boulder against the Gumdrop's leg. Check question c6r5 is a Part 1 lever question and is fine. The Part 5 Check questions (c6r23 to c6r26, c6r32) were read and are generic (work = 6,300 × 15 = 94,500 J, a reflection on the student's own route), so they were not changed. Fable should still read them against the new board.
11. **Old code**: the old builder, run, story, hints and strip modules are deleted. `4f-gummylift.js`, `4g-glscene.js` and `4q-pull.js` stay because Parts 1 to 4 lesson boards and `4d-rescue.js` use their drawing and model code. Anything in them that only the old rescue used was left in place.
12. **Tests**: old rescue tests are in `tests/retired/`. New: `rescue5_rules.py` (board rules on the test board) and `play_rescue5.py` (real clicks through training, strip, run, save, reload, worksheet page). The full suite takes about 50 minutes. `play_c6.py` and `lesson_engine.py` were edited to match the new Part 5.
13. **Not verified**: a rescue using a towed crane; riders on tilted carts; a pole-guided rescue played through to the line; the strip on a phone; the Check questions against the new numbers; the teacher page text; Save as PDF with the new My Rescue page (checked as HTML only); backup/restore of the new save fields (`parts5`, `work5`, `trainDone`).

## Where things are
- Board (generated, do not hand-edit): `src/js/4r-board5.js` from `proto/Rescue-Core-Board.html` via `python3 tools/port_board.py`.
- Part 5 flow, score, endings: `src/js/4s-rescue5.js`. Route strip and GASA check: `4t-strip5.js`. Training: `4u-train5.js`. My Rescue page and key: `4l-glreport.js`.
- Save shape at `chal.c6e.gl`: `parts5, runs, trainDone, introDone, work5, firstDone, best, best5, lastSum, bestRun`.

## Fable's check (12 Nov 2026, afternoon)

Checked against the code and by running routes through the board's own rules. Changed, with Tom's go-ahead:

- **Rope pulls now say how far the Gumdrop moves** ("Rolling 32.3 m on the cart"), so hand travel can be worked out. Before this the distance was not shown anywhere.
- **Flag 1 settled:** until GASA approves, the legs table shows only "60 N × 7 × 16" and the piece card shows only the machines' numbers. The multiplied total and the force it gives appear after approval. GASA's second MA hint now tells students to multiply those numbers.
- **Flag 4 changed:** budget is now **300 crystals** (475 was an almost free 2 points).
- **Flag 6 settled:** new answer-key route in `RB5_KEY`, 11 of 11: Gumdrop starts on a cart, winch ×20 on the ground at x = 45; crane at 44.5 (lift 7, across 5.5) with winch ×16 and a 7-rope pulley, setting down on a second cart at x = 50; winch ×20 on the ground at x = 86. 7 pieces, 239 crystals, 2,148 m, 0% hull. `tests/rescue5_rules.py` checks it.
- **Check questions:** c6r24 now asks for the useful work done on the Gumdrop (still 94,500 J), because friction on the new board makes Smooshy's own work bigger (about 125,000 J on carts). c6r25's correct reason was reworded to match.
- The 2,500 m oxygen point can only be earned with carts: dragging alone costs at least about 3,650 m.

Still open: flags 7 to 9 and 13 (art scale, run camera, opening pan, phone, PDF, backup), and the boulder wording in `picCraterPlan()` (flag 10). The board still shows total hand travel in its meter, which lets students check the sum of their three answers.

## Later on 12 Nov, after Tom opened it

- **Training rebuilt (flag 5 replaced).** The separate drawn panel with dropdowns is gone. Training is now the real rescue board in training mode (`rescueBoardMount(host, { train: true })`, or `?train` on the test board): same tray, cards, hooks and legs table, with a 252 N rock wedged beside the Gumdrop. Leg 1: lever (starts 1 m short at 240 N, so it needs a longer arm or a winch). Leg 2: crane, which is refused until the lever has pried the rock up, and must carry the rock at least 4 m clear and not onto the Gumdrop. Tray is lever, crane, pulley block, winch. Run it clears the rock, the kit packs away, and the empty rescue board opens. Tom asked for the rock to go left; with the Gumdrop in the way and 8 m of crane reach it goes right, then disappears with the kit.
- **Building on the crane.** A pulley block or winch dropped anywhere on a crane's frame (or tapped in the tray while that crane's leg is stuck or the crane is selected) is built on the crane and clipped to the end of its rope. Dragging a rope onto a crane's frame clips it to that crane; a pull hook right under the pointer wins over the Gumdrop. "Clip onto the nearest free hook" now tries the machine the piece is mounted on first (it used to pick the lever when the piece hung on the crane).
- `tests/play_rescue5.py` plays the new training with real clicks and checks both crane cases.
