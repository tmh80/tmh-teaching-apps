# Operation Gummy Lift: handoff from Opus to Sonnet

Updated after each Opus stage, so it is always current on branch `rescue-rebuild`. The brief is `docs/Force_HQ_Rescue_Rebuild_Brief.md` (Project copy `claude/Force_HQ_Rescue_Rebuild_Brief.md`). Every design decision there is settled; this file records the small choices Opus made and what is left.

## Agreed split (Tom, 7 Nov 2026)

- **Opus:** stages 1 to 3, plus the stage 4 plumbing: autosave and resume, saving the best run, `rigSnapshot()`. The tractor-beam finale is part of the Run Rescue animation.
- **Sonnet, chat 1:** stage 4b (the story half of stage 4: Part 5 opening cards replacing `picCraterPlan()`, the guided warm-up, the three ending cards, the stopping-point pop-up), then stages 5 to 7.
- **Sonnet, chat 2:** stages 8 to 10.
- Token rules from brief section 12 still apply: search rather than read whole files, no subagents, no full test suite until stage 7.

## Status

| Stage | Status |
|---|---|
| 1. Rescue maths and height-profile ground | Done |
| 2. Crater scene and builder | Done |
| 3. Run Rescue | Not started |
| 4. Plumbing (autosave, best run, `rigSnapshot()`) | Not started |
| 4b. Story half of stage 4 | Sonnet |

## Stage 1: the model (`src/js/4f-gummylift.js`)

Pure maths, no drawing. `glEvaluate(rig, {hints})` returns everything the scene, run and worksheet need: `legs` (each with `type, start, end, rise, mma, ropes, winches, ma, load, pull, hand, cable, work, thruster, faults`), `hardest`, `hand`, `work`, `dmg {thrusters, rock, blasts, total}`, `cost {total, items, cable}`, `crest`, `plats` (load against limit), `boulder`, `stop {why: none|gap|broken|heavy|collapse, leg, at}`, `arrived`, `score {total, pts, ending: spotless|dented|notyet}`.

The rig format is documented at the top of the file. Tests: `python3 tests/rescue_numbers.py` (57 checks). The section 9 routes are rigs in `tests/rescue_routes.js`.

### Small choices made in stage 1

- **Arrival (tractor beam):** the ship arrives when a leg ends at a height level with everything between it and the plain (within 0.5 m). Story line: the Big Jelly's beam can't bend over the rim, so the Gumdrop must be level with the top. This lets the crane–ramp–lever route end on the shelf at 12 m once the crest is blasted.
- **Ground:** control points in `GL_PROFILE`, sampled every metre. Floor 0 (x 8–22), wall to the shelf at 6 m (x 38.6–44), a bulge up to 9.1 m (x 53–57), wall to 12 m (x 64–66), a narrow crest peak of 15 m at x 68, plain at 8 m from x 75. One big blast on the peak takes it to 12.2 m.
- **Bulge:** blocks long, shallow ramps from the shelf (high MA), and blasting it clears them. The 24 m relay ramp passes just over it.
- **Route 4** in section 9 could not be built as written (a 1-D model ignores the horizontal distance). It is now "blast the crest, one 30 m ramp from the floor up to a 6 m Large platform on the shelf, winches ×7 and ×8": 45.0 N, 1,680 m, score 8 (same score as the brief).
- **Route numbers otherwise match** the brief exactly; costs: top 358, crane 463, two 30 m ramps 386, one ramp 238.
- **Add-ons stand at the leg's top:** a ramp's pulley block and winches bolt on at its head; a crane's or lever's stand with it. That is what loads a platform. Ramps weigh nothing.
- **Rope count without a block is 1** and costs nothing; a block of n ropes costs 10n.
- **Cable length** = ropes × distance the cable end of the machine moves: ramp length, crane rise, or (lever) MA × rise. The boulder's short rope is free.
- **Work** uses the leg's load, so it is 6,300 × rise when the rock is cleared (as the brief) and 8,400 × rise if the rock is left on.
- **Thruster damage adds across legs** (each weak leg scorches the hull again), total damage capped at 100%.
- **Each blast within 6 m of the Gumdrop adds 15%**; a blast reaching the boulder clears it.
- **Boulder:** a lever or jack with `role:'boulder'`, a cable from `'boulder'` to a winch chain, or a blast. Cleared only if Smooshy's pull on it is 60 N or less (252 N ÷ MA).
- **Limits Opus set:** crane rise 8 m, platform height 8 m, ramp lengths and rises meant to snap to 0.5 m in the builder.

## Stage 2: the scene and builder

- `src/js/4g-glscene.js` draws the crater (world in metres, `GLV` maps to the canvas with zoom and pan; uniform scale so angles are honest), the Big Jelly, the Gumdrop (`drawGumdropInside`), the boulder, machines, platforms, cables, add-ons, dynamite with a dashed blast preview, the glowing handover box and the ruler. `glDrawWorld(c, o)` takes a `run` object for stage 3 extras.
- `src/js/4h-glbuild.js` is the builder: tray (tap then tap the crater, or drag straight in), drag handles (ramp body moves the foot, the white top handle stretches it, snapping to 0.5 m and clamped to 30 m and slope 0.5 with a hint line; platform top edge sets height), stretchy cables from each part's ◉ dot, tap-a-part draggable menus with only that part's actions, a ruler that snaps to the ground and platform tops, zoom and pan (phones start zoomed in on the Gumdrop), undo and Clear all, a live crystal counter with a Receipt.
- Add-ons clip on automatically when dropped near a machine's cable dot (or the end of its chain), and ride along when the machine moves. A lever or jack dropped by the boulder snaps onto it (`role:'boulder'`).
- The Part 5 Challenge is now one mission `gl` (max 10) in `CHDATA.c6.challenge`, section `c6e` has `challenge: ['gl']`, and `renderRescueCourse` calls `renderGummyLift` (4h). The old sm1–sm3 data is gone. **`rescueReportHTML`, `RR_KEY` and `openEnding` in `4d-rescue.js` still describe the old three stages**: stage 6 replaces them.
- Live pull, MA and hand travel stay hidden while building; crystals are shown. Machine faults (too steep, through the ground, top in mid-air, lever MA over 9 and so on) turn the part red and show a plain sentence in its menu.
- Fixed in passing: the Part switcher at the top of every chapter page now wraps, so phones no longer scroll sideways.
- Test: `python3 tests/play_rescue.py` builds the top route with real mouse moves (and a touch tap on a phone).

## Still to do (Sonnet)

Filled in as stages finish.
