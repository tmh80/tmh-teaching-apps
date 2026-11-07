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
| 3. Run Rescue | Done |
| 4. Plumbing (autosave, best run, `rigSnapshot()`) | Done |
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
- **`rigSnapshot()`** (end of `4i-glrun.js`) draws the best run's rig over the whole crater, without handles, into a 900 × 270 JPEG titled "<name>'s best rescue route", stepping the quality down until it is under 150 KB (about 60–90 KB in tests), and stores it as `chal.c6e.gl.bestRun.snap`. It runs automatically after any run that becomes the new best. `bkPack()` backups carry it (tested). **Not yet checked: the PDF route** (`61-pdf.js` renders pages with html2canvas; a `data:` JPEG `<img>` should survive, but check it when the My Rescue page exists in stage 6).
- `WORKSHOP_OPEN` is now `true` on this branch (as `docs/Force_HQ_Handoff.md` asks), so the preview shows the Workshop. `tests/workshop_closed.py` checks the closed version and will need updating or retiring in stage 7.

## Still to do (Sonnet)

Read the brief, then this file. Search rather than reading whole files (`grep -n`, `cut -c1-200`). No subagents. Tests while working: `python3 build.py && python3 tests/rescue_numbers.py && python3 tests/play_rescue.py`.

### Sonnet chat 1: stage 4b, then stages 5 to 7

**4b. Story half of stage 4**
- Part 5 opening cards: the `c6e` step `v1` in `src/js/4c-ch6.js` (search `Part 5: Rescue Captain Smooshy`) still describes three stages, and `picCraterPlan()` (`src/js/4bb-shoppics.js`) draws a three-stage plan. Rewrite both in the brief section 2 order: Smooshy peeps from the window; he squeezes out through the hatch when the rescue starts; he stays at the handle of each machine and walks to the next; at the end he climbs aboard and waves as the tractor beam lifts the ship. Mention the Big Jelly, the crumbly rim, the tractor beam needing the Gumdrop level with the crest, 475 crystals, 1,500 m of oxygen, and that the challenge is two sessions.
- Guided warm-up, about 3 minutes, before free build: place a lever on the boulder. Useful hooks: `GLB.rig`, `glAddPart(type, x, y)`, `glPart(id)`, `GLB.ev.boulder` (`{how, ok, pull, ma}`), `GLB.onChange`. A lever dropped within about 1.6 m of x = 18.2 on the floor snaps onto the boulder. Load arm 2 m (MA 4) gives 63 N and fails; 1.5 m (MA 5.7) works. The boulder pull may be shown in the warm-up, since it is practice; keep the ship's leg pulls hidden. If tokens are short, keep this plain (brief section 12).
- Endings: define `glShowEnding(sum, {first, better})` (called by `glFinishRun` in `4i-glrun.js`). Three draggable ending cards from `sum.ending`: **spotless**, **dented**, **not yet** (not yet invites another go and never blocks the Check). When `first` is true (the first run that reached the beam), add the friendly "good place to stop for today" pop-up with the "Save my work" button. Replace the old `openEnding`, `END_CAPS` and `endScene` in `src/js/4d-rescue.js` (search for callers first).

**5. Hint tree, working boxes, Reminders on top.** Hints are spent: store the count in `chal.c6e.gl.hints`; `glChanged` and `glStartRun` already pass it to `glEvaluate`, and `glScore` applies "first free, then −1, never below 1". Use the student's own rig for tier 2 (`GLB.ev.legs`: `type, mma, ropes, winches, rise, m.L`). Move `remindersHTML()` above "Do this" on every page where it appears (`40-guided.js` around line 121, the shop course in `45-challenge.js`; Part 5 already has it at the top).

**6. Reflection, My Rescue page, keys and teacher text.** Replace `rescueReportHTML` and `RR_KEY` (`4d-rescue.js`, used in `60-worksheet.js` around line 118) with the My Rescue page: `chal.c6e.gl.bestRun.snap` (the screenshot), `bestRun.sum` (from `glSummary`: `legs[] {name, rise, ma, pull, hand, work}`, `hardest, hand, cost, crest, work, dmg.total, boulder, score, ending`), `runs` (tries), `hints`, and `bestRun.pred.working`. Blank template: empty frame; answer key: the top route (two 24 m ramps, 4 ropes, winch ×7, crest blasted, lever on the boulder: 56.3 N per leg, 1,344 m, 358 crystals, crest 12.2 m, 75,600 J, 0%, 10 of 10). Check the JPEG survives `61-pdf.js`. Add the `explain` reflection as the last Part 5 Check question on its own page (brief section 8). Update the AI text in `58-myp.js` (line around 50; keep its first line), the marking scheme, the teacher page two-session note, and set `secMins` for `c6e` to approx. 60.

**7. Tests.** Rewrite Part 5 in `tests/play_c6.py` and `tests/play_bt.py` (they still play sm1–sm3). Add `tests/rescue_numbers.py` and `tests/play_rescue.py` to `tests/run_all.sh`, plus tests for hints and working. `tests/workshop_closed.py` expects `WORKSHOP_OPEN = false`: update or retire it. Then run `bash tests/run_all.sh` in the background and fix what fails.

### Sonnet chat 2: stages 8 to 10

As brief section 12: docs (`Force_HQ_Brief.md`, `Force_HQ_Backlog.md`, `Force_HQ_Handoff.md`, `Force_HQ_Next_Chat_Handoff.md`, `Chapter6_Workshop_Script.md`, the README table, and the Project copies), worksheets (`python3 tools/make_worksheets.py`, copy `dist/toddle-files` and the zip into `worksheets/`), the offline file (`dist/Force-HQ-offline.html` → `Force-HQ-Rebuild-offline.html`), then merge `rescue-rebuild` into `main`, push, republish the preview, send Tom the HTML and tell him to upload it to Toddle. `WORKSHOP_OPEN` stays `true` on merge.

### Ideas Opus noticed (not required)
- Optional crater variants (brief, tokens permitting): `GL_PROFILE` is the only thing to swap; re-run `tests/rescue_routes.js` against each.
- The builder could show a faint 1 m grid when the ruler is on.
