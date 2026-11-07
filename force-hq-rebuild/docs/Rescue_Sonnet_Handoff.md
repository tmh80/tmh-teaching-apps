# Operation Gummy Lift: handoff from Opus to Sonnet

Updated after each Opus stage, so it is always current on branch `rescue-rebuild`. The brief is `docs/Force_HQ_Rescue_Rebuild_Brief.md` (Project copy `claude/Force_HQ_Rescue_Rebuild_Brief.md`). Every design decision there is settled; this file records the small choices Opus made and what is left.

## Agreed split (Tom, 7 Nov 2026)

- **Opus:** stages 1 to 3, plus the stage 4 plumbing: autosave and resume, saving the best run, `rigSnapshot()`. The tractor-beam finale is part of the Run Rescue animation.
- **Sonnet, chat 1 (done):** stage 4b (the story half of stage 4: Part 5 opening cards replacing `picCraterPlan()`, the guided warm-up, the three ending cards, the stopping-point pop-up), then stages 5 to 7.
- **Sonnet, chat 2:** stages 8 to 10.
- Token rules from brief section 12 still apply: search rather than read whole files, no subagents, no full test suite until stage 7.

## Status

| Stage | Status |
|---|---|
| 1. Rescue maths and height-profile ground | Done |
| 2. Crater scene and builder | Done |
| 3. Run Rescue | Done |
| 4. Plumbing (autosave, best run, `rigSnapshot()`) | Done |
| 4b. Story half of stage 4 | Done (Sonnet chat 1) |
| 5. Hint tree, working boxes, Reminders on top | Done (Sonnet chat 1) |
| 6. Reflection, My Rescue page, keys, AI text, teacher page | Done (Sonnet chat 1) |
| 7. Tests | Done (Sonnet chat 1): suite result in the next section |
| 8. Docs and Project copies | Done (Sonnet chat 2, 7 Nov 2026) |
| 9. Worksheets and offline file | Done (Sonnet chat 2, 7 Nov 2026) |
| 10. Merge to `main`, republish, send to Tom | Done (Sonnet chat 2, 7 Nov 2026) |

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

## Stage 3: Run Rescue (`src/js/4i-glrun.js`)

- Before each run the student picks a leg and types a predicted pull (any number unlocks ▶ Run Rescue; no legs means no prediction needed), with an always-visible "Working (not marked)" box (draft autosaves as `draftWork`).
- The run is a list of beats (`glBuildBeats`); each frame rebuilds the scene from the start, so "Skip to the end" just jumps the clock. Order: dynamite (fuse, boom, ground carves, shake and +15% if within 6 m) → Smooshy squeezes out of the hatch → the boulder (lever or jack tilts it away, a winch drags it, or "too stiff" if over 60 N; a blast shatters it) → if the rock stays on, it rides with the ship (+25%) → each leg: Smooshy walks to the handle (last winch, else block, else the machine; with a bare ramp he pushes from behind), the ship travels with the haul rope, winches spin, crane hooks rise, levers tilt, thrusters flame and the hull scorches when the pull is over 60 N, then a "Leg n: pull" readout appears → stops (broken part flashes red, too heavy, platform buckles and sinks, gap shows the box where the next machine needed to be) → arrival: Smooshy climbs aboard, waves from the window, and the Big Jelly's beam lifts the ship away.
- Afterwards `glShowResult` shows the stamp (Spotless / Dented / Not yet) and score, prediction feedback, a per-leg receipt (machine, rise, total MA, pull, hand travel, work, with the work-receipt sentence), totals and the scorecard. "🔧 Back to building" returns to the builder.
- Saved in `chal.c6e.gl`: `runs`, `tried`, `best` (number, used by `challengeState`), `last` (summary), `lastPred`, `bestRun {rig, sum, pred, at}` (best run counts: rescued beats not yet, then higher score, then lower hardest pull), `firstDone` (time of the first rescue that arrived). `glSummary(res)` is the compact form the worksheet should use.
- **Hooks for Sonnet:** `glFinishRun` calls `glShowEnding(sum, {first, better})` if it exists (the three ending cards and the stopping-point pop-up on `first`), and `rigSnapshot()` on a new best run (stage 4).
- Pulls are shown with normal rounding to one decimal place, so 56.25 N shows as 56.3 N (the brief's table says 56.2).
- RMOTION shortens every beat to a quarter of a second and drops the shakes, bobbing and flashes.

## Stage 4 plumbing

- **Autosave and resume:** every change saves the rig (`chal.c6e.gl.rig`) and the view (zoom and pan, `view`); the prediction (`draftPred`) and working (`draftWork`) save as they are typed; the last result shows again on return. A reload reopens everything exactly as left (tested).
- **`rigSnapshot()`** (end of `4i-glrun.js`) draws the best run's rig over the whole crater, without handles, into a 900 × 270 JPEG titled "<name>'s best rescue route", stepping the quality down until it is under 150 KB (about 60–90 KB in tests), and stores it as `chal.c6e.gl.bestRun.snap`. It runs automatically after any run that becomes the new best. `bkPack()` backups carry it (tested). The PDF route was checked in stage 6 (the JPEG survives on the student copy and the key).
- `WORKSHOP_OPEN` is now `true` on this branch (as `docs/Force_HQ_Handoff.md` asks), so the preview shows the Workshop. `tests/workshop_closed.py` checks the closed version and will need updating or retiring in stage 7.

## Stages 4b to 7 (Sonnet chat 1): what was built and the small choices made

**Full suite:** `bash tests/run_all.sh` ran start to finish with no failures, after three fixes. (1) A real bug: `glFinishRun` read `st.firstDone` after saving into the same state object, so the stopping-point pop-up never appeared after a real rescue; it now captures `firstRescue` before the save. (2) `tests/play_c6.py` selected the first fold-out in the shop card, which is now Reminders, so it targets the clue fold-out (`details.clue:not(.remind)`). (3) `play_c6.py` expected the h3 builder to open straight after the weight check, but the app asks the student to press "Open the builder →" first (this was already failing before this chat); the test now presses it. Note: `run_all.sh` shows only the last four lines of each test, so a traceback can hide behind a retry message; run a test by itself if a section looks short.

### Stage 4b: story, warm-up, endings
- **Opening cards** (`src/js/4c-ch6.js`, step `v1`): three cards in the brief's story order (Smooshy peeping from the window, the Big Jelly and its tractor beam, squeezing out through the hatch, staying at each handle, climbing aboard and waving, 475 crystals, 1,500 m of oxygen, two sessions). `picCraterPlan()` (`4bb-shoppics.js`) now draws the crater, Big Jelly and beam with four numbered steps. The v1 scene shows Smooshy peeping out from inside the Gumdrop (`WS.peep` in `4b-shopdraw.js`, drawn with `drawGumdropInside`) instead of climbing out. The "stage 3 needs a compound machine" wording in v1 q2 is gone.
- **Warm-up** (`src/js/4j-glstory.js`, `glMountWarm`): a panel above the board for a student who has not built anything. State is `chal.c6e.gl.warm` (`on`, `done` or `skip`; an older save that already has parts or runs is set to `done`). It walks through placing a lever on the boulder and shows the live boulder pull (that practice number only; the ship's leg pulls stay hidden). It completes when `GLB.ev.boulder` is a cleared lever, says the lever stays in the rig (25 crystals), and has a Skip button. Never gates anything.
- **Endings** (`glShowEnding(sum, {first, better})` in `4j-glstory.js`): three draggable cards (`.glpop`, drag handle `.glpophd`) from `sum.ending`. Dented lists the causes of the damage (thrusters, rock, blasts); Not yet uses `GL_STOP` and says every go counts and the Check is never blocked. The first rescue then opens the "good place to stop for today" pop-up with Save my work (it clicks `#saveWorkBtn`). The old `openEnding`, `END_CAPS`, `endScene` and `ENDRAF` are deleted from `4d-rescue.js`, which also removed the sugar-crystal discovery scene; the spotless card only hints at the glittering crystals, which the Extension (`p5a`) picks up.

### Stage 5: hints, working, Reminders
- **Hint tree** (`src/js/4k-glhints.js`, a "💡 Need a hint?" fold-out between the board and the Run panel). Six topics (Smooshy's pull, mechanical advantage, hand distance, cable, weight, work). Tier 1 shows formulas and ideas, tier 2 plugs in the student's own leg or boulder lever with blanks (`<span class="blank">`), tier 3 is a worked example with different numbers. Choosing a topic is free. Opening each tier for a topic spends one hint the first time (`chal.c6e.gl.hints`, `hintSeen` keys `t1:topic` etc.); reading it again is free. Tier 2 does not spend if there is no machine to use. `glScore` already applies first free, then −1.
- The Working (not marked) box was already in the Run panel (stage 3). **Reminders** now sit above "Do this" on guided pages (`40-guided.js`) and first in the shop course card (`45-challenge.js`); Part 5 already had them first.

### Stage 6: reflection, My Rescue, keys, text
- **Reflection:** new Check question `c6r32` (explain, `refl: true`) is last in Part 5's Check. The old `c6r26` (two plans) no longer mentions the 75 m track. `mnote` is a new optional question field printed at the end of an explain question's marking line; `c6r32` uses it for "accept any route and mark the numbers against the My Rescue table".
- **Worksheet pages for `c6e`** (`buildWorksheet`): page 1 My Rescue; page 2 steps summary, Part A and Part B; page 3 Part C, the reflection, on its own page.
- **My Rescue** (`src/js/4l-glreport.js`, `myRescueHTML(mode)`): the best run's screenshot, result stamp and score, a row per leg (leg, machines, rise, total MA, pull), totals (hand travel, crystals, crest height, work, damage, hints, tries) and the student's working. Blank: an empty dashed frame and empty boxes. Key: the top route (`GL_KEY_RIG`: two 24 m ramps, 4 ropes, winch ×7, lever on the boulder, crest blasted), drawn live with the new `glSnapURL(rig, title)` (split out of `rigSnapshot`). Checked through the real PDF download: the JPEG survives `61-pdf.js` on the student copy and the key.
- **Not marked:** the scheme note, `58-myp.js` AI text (first line unchanged) and the key all say My Rescue is reported and not marked; the reflection and Check are marked.
- **Teacher page** (`62-teacher.js`): a two-session note appears when Part 5 is selected. **`secMins`** now honours a mission's `mins`; the `gl` mission has `mins: 44`, so Part 5 shows about 60 minutes (4 learn + 44 challenge + 12 check).

### Stage 7: tests
- Part 5 rewritten in `tests/play_c6.py` (top route run, ending card, stopping pop-up, snapshot, a worse try never lowers the best, five Check questions with the reflection last) and the My Rescue checks in `tests/play_bt.py`.
- New: `tests/play_story.py` (opening text, warm-up, endings, stop pop-up), `tests/play_hints.py` (spending rules, own numbers, Reminders order), `tests/play_myrescue.py` (three worksheet modes, reflection page, scheme, AI text, 60 minutes, real PDFs). `rescue_numbers.py` (the brief's section 9 routes), `play_rescue.py` and these three are in `tests/run_all.sh`.
- `tests/workshop_closed.py` is retired (the Workshop stays open: `WORKSHOP_OPEN = true`). `docs/Force_HQ_Workshop_Closed_Note.md` in the Project describes the old closed state and should be removed or rewritten in stage 8.

### Things stage 8 should know
- `docs/Chapter6_Workshop_Script.md` still describes the old three-stage Part 5, the sm1 to sm3 Rescue report and the sugar-discovery ending; rewrite that section.
- The score points in `GL_END` and the result card were not changed. Pulls show with normal rounding (56.25 N shows as 56.3 N), as in stage 3.

### Sonnet chat 2: stages 8 to 10 (done, 7 Nov 2026)
- **Docs (8):** `Chapter6_Workshop_Script.md` Part 5 sections (N, O, O1, P) and the engine notes C4, C6 and C7 rewritten for Operation Gummy Lift; a rescue rebuild build log added to the end of `Force_HQ_Brief.md` with the new file map entries; `Force_HQ_Handoff.md`, `Force_HQ_Next_Chat_Handoff.md`, `Force_HQ_Backlog.md` and the README table updated. The Project copies match (`claude/Force_HQ_Brief.md`, `Force_HQ_Backlog.md`, `Force_HQ_Handoff.md`, `Force_HQ_Next_Chat_Handoff.md`, `Force_HQ_Chapter6_Workshop_Script.md`). `claude/Force_HQ_Workshop_Closed_Note.md` was rewritten to say the Workshop is open (it was not deleted).
- **Worksheets and offline file (9):** `python3 tools/make_worksheets.py` run; `dist/toddle-files` and the zip copied into `worksheets/`; `dist/Force-HQ-offline.html` copied to `Force-HQ-Rebuild-offline.html`. The Part 5 key shows the top route's picture, the blank shows the empty frame, and the offline file has no external references. `WORKSHOP_OPEN` is `true`.
- **Merge and send (10):** `rescue-rebuild` merged into `main`, pushed, the preview republished, and the HTML sent to Tom to upload to Toddle.
- Left as is: `build.py` still writes `dist/test-closed.html` (nothing tests it any more); delete that step if it bothers anyone.

### Ideas Opus noticed (not required)
- Optional crater variants (brief, tokens permitting): `GL_PROFILE` is the only thing to swap; re-run `tests/rescue_routes.js` against each.
- The builder could show a faint 1 m grid when the ruler is on.
