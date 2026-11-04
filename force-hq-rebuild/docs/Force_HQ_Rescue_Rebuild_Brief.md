# Force HQ: rebuild brief for the final rescue mission (Chapter 6, Part 5, "Operation Gummy Lift")

> **Workshop closed to students (4 Nov 2026).** Tom's live file has the Workshop switched off until the rescue is finished. The switch is the line `const WORKSHOP_OPEN = false;` near the top of `src/js/20-shell.js`. `dist/test.html` is always built with it open, so tests are unaffected; `dist/test-closed.html` and `tests/workshop_closed.py` cover the closed version. On the `rescue-rebuild` branch, set it to `true` first so the preview shows the Workshop. It stays `true` when merged to `main` at the final step, and only then does Tom's Toddle file open the Workshop.

For: Opus, in a fresh chat. From: Tom (teacher, not a programmer: explain changes in plain words, do all git work, commit after each working stage, tell Tom which file to upload to Toddle).
Written 3 Nov 2026 after Tom playtested Parts 4 and 5. Repo `tmh80/tmh-teaching-apps`, folder `force-hq-rebuild/`. Read `CLAUDE.md`, `README.md`, `.claude/skills/wab-science-sim-builder/SKILL.md` and `docs/Force_HQ_Next_Chat_Handoff.md` first.

## Why this matters

This is the climax of the whole app. Every student who finishes Chapter 6 ends here, and Tom's verdict on the current version is that it "looks a bit rubbish". It needs to be polished, creative and fun, and it still has to teach the physics (mechanical advantage, compound machines, work, force and distance trade-offs, Glimmer-9 gravity g = 4.2 N/kg, Smooshy's 60 N limit).

## What is there now (so you know what to replace)

Part 5 is section `c6e` ("Rescue Captain Smooshy!", pseudo-challenge kind `rescue`). Three fixed stages, each judged by `renderRescueCourse` in `src/js/45-challenge.js`:

- `sm1` Free the landing leg: a lever lifts a 60 kg boulder (252 N) 0.25 m. The student only moves the fulcrum.
- `sm2` Level the ship: a screw jack, 3,780 N, lift 40 cm. The student only picks distance per turn and thread gap.
- `sm3` Haul out of the crater: the compound builder (route, ropes, winch), 6,300 N up 15 m.

The missions are defined in `src/js/4c-ch6.js` (search `Part 5 Challenge`). The scene is drawn by `wsSite` in `src/js/4b-shopdraw.js` and the end animation `openEnding`/`endScene` in `src/js/4d-rescue.js`. The workshop physics is in `src/js/4a-workshop.js` (`wsCalc`, `wsParts`) and must stay in step with `tools/workshop_model.py` (a test compares them).

## Tom's problems with it

1. **The scenes do not match the story.** The stage 1 lever never gets near the Gumdrop. It moves a *crate* while the text says a *rock/boulder*. Lifting the ship is also drawn as a *crate*. We are meant to be saving the Gumdrop and the picture must show that: a boulder on the landing leg, the actual ship being levered, jacked and hauled.
2. **It is a quiz in disguise, not a creative build.** Three fixed single-answer stages with one or two sliders each. Tom wants the creative feeling of the circuit builder in Sparks Through Time (`sparks-through-time/Sparks-Through-Time.html`, the `Circuit` module near line 1922 and the "free-form circuit builder" CSS near line 294): parts the student places where they like, then connects to other things, with many valid ways to succeed.
3. **Success must be analogue, not pass/fail.** Tom: "I should be able to brute force the spaceship away from the rock, but it should damage the space ship." The student earns points for the **quality** of the rescue, by getting as close as possible to the force actually needed. A crude, over-powered rescue frees Smooshy but damages the ship and scores less. A clever machine that stays within Smooshy's 60 N scores the most.
4. **The end screen contradicts the student's experience.** Tom reached "With your plan, Smooshy got the Gumdrop part of the way up. Force HQ's backup team used your numbers to finish the job" although he never got the pull under 60 N, and said "surely that is required to save Smooshy?". Today the ending plays after the student has merely *tried* all three stages. The ending must reflect what the student actually achieved (see scoring below).
5. **The ending animation is confusing.** Tom: "should Smooshy be on the Gumdrop or not?" The story (and the Part 5 scene) says Smooshy is trapped *inside* the ship, peeping out of the round window. The ending animation (`endScene`) shows him in a way that makes it unclear whether he is aboard, riding on top or standing beside it. Decide, show it clearly and keep it consistent with the transmission scene and the rescue scene.
6. **Hints are one big list.** Tom can't remember which numbers matter for which machine. Current hints are a "Need a clue?" fold-out that reveals a numbered list of full clues. See the hint redesign below.
7. **No space for working.** The mission computer ("What is the total mechanical advantage of your machine?") needs a lot of calculation. It needs a working box like the one now on the Learn steps ("Working (not marked)", class `numworkin`, see `tkAnsHTML` in `src/js/40-guided.js`).
8. **The Reminders fold-out is in the wrong place.** On Learn steps it sits at the bottom of the rail (`#rail > details`). Tom wants it **at the top of the list**, above "Do this". Fix this on every page it appears (`remindersHTML()` in `src/js/4c-ch6.js`; used in the Learn rail in `renderRail`, and in `renderShopCourse` and `renderRescueCourse`).

## The new design Tom has in mind

### A. A free-form rescue workshop

Replace the three fixed stages with one scene (or a short run of scenes) where the student **builds their own rescue rig**:

- The scene is the crater on Glimmer-9: the Gumdrop tipped at the bottom with Smooshy inside, a boulder pinning its landing leg, and a clear exit up the crater wall (15 m rise, as now).
- The student can **hook on to the ship or the rock** (anchor points), and **attach machines to things**: lever (with a placeable fulcrum), pulley block, winch, ramp/track, screw jack, wedge. Machines are placed on the scene, resized, and connected (the output of one drives the next), like components and wires in Sparks' circuit builder.
- The student can build more than one valid rescue (for example lever the boulder off then haul, or drag the ship out sideways with a ramp, or a long track with a winch). Do not hard-code one solution.
- Keep what Tom likes: **combining machines by slots / chaining them** (the compound machine builder). Total MA = product of the parts' MAs, cable = ropes × route length, hand travel = MA × lift, as in `wsCalc`.
- Real physics, simple: weight = m × 4.2; effort = load ÷ total MA; Smooshy's limit 60 N; cable and oxygen (hand-travel) limits as today; the lever's arm lengths and fulcrum position matter; work in = work out for ideal machines.
- Make the pictures match the story. Boulder looks like a boulder, ship looks like the Gumdrop (reuse `drawGumdrop`, `drawSmooshy` and the `cute-kit.js` look), never a crate.

### B. Quality-based scoring (a rescue effort score)

- Compute the force the rig actually needs to move the target. Compare it with Smooshy's 60 N.
- **Under or at 60 N:** a clean rescue. Score by how close the student gets to the minimum force that was possible within the limits (within a small band of the ideal = top score), and by meeting cable and oxygen limits.
- **Over 60 N (brute force):** the rescue can still succeed (Smooshy pushes harder, the gear groans), but the Gumdrop is **damaged** in proportion to how far over 60 N it went, and the score drops accordingly. Show the damage in the scene (cracks, dents, wobbling) and in the debrief.
- A rig that cannot move the load at all (for example a missing anchor) does not complete the rescue and gives no points, with a clear reason.
- Several tries are allowed, and the best try counts (as today).
- Fit it into the existing 3-point style of reporting: the Part 5 worksheet's "Rescue report" (`rescueReportHTML` in `src/js/4d-rescue.js`, `RR_KEY`), the stamp "Smooshy Saver", `chal.c6e` storage, the answer key and the AI feedback text must be updated to match the new design (see "Things that must keep working").
- The ending must match the result: a spotless rescue, a rescue with a damaged ship, or "not yet" (send the student back to improve it). Use plain words a Grade 7–8 student enjoys.

### C. Hints you spend (a hint tree, not a list)

Tom's idea: the student spends hints to get help that narrows down.

1. Hint 1, "What I need to find" (choose one): for example "the force I need", "the mechanical advantage I need", "how far my hand must move", "how much cable I need", "the weight of the ship". Spending it shows bullet points of the **formulas and ideas** that could be used for each machine and number, without any answers.
2. Hint 2, "A number or machine I have" (choose one from the student's own rig: for example "a 2 m crowbar", "4 ropes", "winch ×8", "a 45 m track"). Spending it narrows the list from hint 1 down to the bullets that use that item and shows the matching formula with the student's own number plugged in as a blank to fill, not the answer.
3. Hint 3 (last resort): a worked example with different numbers, never the final answer for the student's actual rig.
- The number of hints spent is recorded and lowers the score a little (Tom to confirm the amount; suggest 1 point per hint after the first, never below 1 point if the rescue succeeded).
- The Reminders fold-out stays free and always available (it is a formula sheet, not a hint). Put it at the top.
- Keep it plain: short bullets, small words, friendly.

### D. Working space

- Anywhere the student types a calculation answer or a prediction in this mission, add a "Working (not marked)" box beside it. Save it with the attempt and include it in the Rescue report and in "Save my work" (PDF).

## Quality bar (Tom's words: "it does need to be polished")

- It must look and feel good: drawn with the existing Force HQ visual style (`src/app.css`, colour tokens `C`, canvas drawing in `4b-shopdraw.js`/`4d-rescue.js`), smooth animations, clear labels, no black-on-black text (check contrast on the dark ceiling beam; labels there now use light pills).
- It must work on a school Chromebook/laptop and on phones without sideways scrolling (the tests check scroll width).
- Respect reduced motion (`RMOTION`) like the rest of the app.
- No internet requests: the Toddle file must stay fully self-contained (`Force-HQ-Rebuild-offline.html`).
- All wording at Grade 7–8 reading level, short, enthusiastic. No "it isn't X, it's Y" phrasing, no "that is what makes it worth learning" style justification (Tom dislikes both).
- Standards (ACARA/MYP) stay off anything the student sees. MYP strands belong only in the teacher-facing key and scheme.

## Things that must keep working (do not break)

- The `c6e` section id and the Part 5 stamp "Smooshy Saver" (`stamp` in `src/js/20-shell.js`, Rescue board slot 5 in `4d-rescue.js`).
- Unlock logic: Part 5 follows Part 4; the Extension (`c6f`) and Explore Workshop scene follow their usual gates.
- The Part 5 worksheet, answer key, marking scheme, AI feedback text (`aiFeedbackText` in `src/js/58-myp.js`, first line "All written feedback should be grade 7-8 appropriate language, short and to-the-point, and enthusiastic."), the teacher page (`62-teacher.js`) and `tools/make_worksheets.py` (`SHEETS`).
- The compound builder maths and the `tools/workshop_model.py` mirror (tests: `tests/workshop_numbers.py`, 135 checks).
- Explore's Workshop scene and the build tasks (`bt1`–`bt4`, `src/js/4e-buildtasks.js`) share the world/mass pickers and the builder. If you change shared parts, re-run their tests.
- `secMins` for Part 5 is 25 minutes; keep the mission doable in about that time (Tom's target is about 30 minutes per Part).
- The Rescue report's old structure (stage rows, "not marked") can change, but keep a student-facing record of the best try and a teacher key.

## Tests

- Build: `python3 build.py` (writes `dist/Force-HQ-offline.html`, `dist/test.html` with `window.__fhq`, `dist/artifact.html`).
- Run all: `bash tests/run_all.sh` (long, run in the background with output to a log; foreground `sleep` is blocked here, use Monitor). Part 5 is covered by `tests/play_c6.py` (Rescue board, `sm1`–`sm3`, ending) and `tests/play_bt.py` (Rescue report). Rewrite those parts for the new design and add tests for: placing and linking parts, the force calculation, the damage and scoring bands, the hint tree and its score cost, the working box, and the ending variants.
- Playwright screenshots of every state belong in `/tmp/fhq-shots/c6/` so Tom can be shown what changed. Look at them yourself before telling Tom it is done.

## Delivery steps

1. Build in stages, commit after each working stage (message ends with the two attribution lines from the session reminder), and send Tom one short plain-words message per stage.
2. Update `docs/Force_HQ_Brief.md`, `Force_HQ_Backlog.md`, `Force_HQ_Handoff.md`, `Force_HQ_Next_Chat_Handoff.md`, `Chapter6_Workshop_Script.md` ("As built" notes) and the README table, then write the same docs to the claude.ai Project (`Projects` → `project_write`, absolute `local_path`, paths `claude/Force_HQ_*.md`).
3. Run `python3 tools/make_worksheets.py` and copy `dist/toddle-files` into `worksheets/` plus the zip; copy `dist/Force-HQ-offline.html` to `force-hq-rebuild/Force-HQ-Rebuild-offline.html`.
4. Commit, rebase, push to `main`. Republish the preview artifact (https://claude.ai/artifact/2qHdjKcuWWAjgMkjZdqEcy) with `dist/artifact.html`. Send Tom `Force-HQ-Rebuild-offline.html` and tell him to upload it to Toddle.

## Questions to put to Tom early (one short batch, then build)

- How many points should the rescue be worth in total, and how much should each hint cost?
- Damage: should a badly damaged ship still count as "rescued" (Tom's wording suggests yes, with a lower score)?
- Should students be able to skip straight to the open workshop, or is there a short guided warm-up first (for example the old Stage 1 lever as a tutorial)?
- Smooshy in the ending: inside the ship (peeping out of the window) or riding on top?
