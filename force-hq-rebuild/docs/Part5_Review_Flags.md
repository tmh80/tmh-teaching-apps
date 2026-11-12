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
