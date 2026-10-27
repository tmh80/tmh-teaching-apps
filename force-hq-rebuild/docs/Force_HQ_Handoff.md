# Force HQ rebuild: handoff for a new chat (27 Oct 2026)

Start here. Read this file, then `Force_HQ_Brief.md` (file map and design notes) and `Force_HQ_Backlog.md`. Tom is a teacher, not a programmer: explain in plain language and handle all git work yourself.

**Status:** Chapters 1, 2, 3 and 4 are built, tested and pushed (`c1f`, `c1x`, `c2f`, `c2x`, `c3f`, `c3x`, `c4f`, `c4x`; Chapter 4 added 27 Oct 2026, see the Chapter 4 notes in the Brief), plus progress save and load. **Next job (was Chapter 4, now done; next is Chapter 5, balanced forces and the Drop Zone, or Tom's feedback on Chapter 4). Original Chapter 4 job: Action and reaction (Newton's third law)** in the Space Dome, with the docking orders as its challenge. Give Tom a plan before building (he asked for this on Chapter 3 and liked it).

## 1. Getting set up (GitHub is the source of truth)
- **Repo:** `tmh80/tmh-teaching-apps`. Attach it with `add_repo` (access: push), clone it to `/home/claude/tmh-teaching-apps`, then `register_repo_root`. Work directly in `force-hq-rebuild/`. No zips are needed any more.
- **Folders in the repo:**
  - `force-hq-rebuild/` holds the rebuild: `src/`, `build.py`, `tools/`, `tests/`, `docs/`, `worksheets/` (Toddle PDFs and zip), and `Force-HQ-Rebuild-offline.html` (the Toddle file).
  - `force-hq/Force-HQ.html` is the **old build**, the parts bin to port from.
  - `.claude/skills/` holds the repo copies of `wab-science-sim-builder` and `wab-virtual-lab-builder`. Keep them the same as Tom's account skills.
  - Root `CLAUDE.md` holds Tom's repo rules: explain in plain language, commit after each working change, tell Tom which file to upload, keep `README.md` current.
- **Build:** `python3 build.py`, run from `force-hq-rebuild/`. It runs `node --check` on every module and writes three files:
  - `dist/Force-HQ-offline.html` (for Toddle)
  - `dist/test.html` (with the `window.__fhq` hook; `__fhq.ev(code)` runs code inside the app)
  - `dist/artifact.html`
- **Tests:** `sh tests/run_all.sh` builds, then runs all 18 Playwright tests (the last one, `backup.py`, is outside the loop). Each test should print `errors []` (or `[]`), with no assertion errors. Screenshots go to `/tmp/fhq-shots/`. Paths are now relative, so the tests run from any clone. Add a `play_c4.py` modelled on `play_c3.py`.
- **Toddle PDFs:** `python3 tools/make_worksheets.py` writes `dist/toddle-files/` and the zip. Add the new sections (`c4f`, `c4x`) to `SHEETS` in that script.
- **Preview:** https://claude.ai/artifact/2qHdjKcuWWAjgMkjZdqEcy. Read it first, then republish `dist/artifact.html` to that URL, passing `url`.
- **Deliver after each change:**
  - copy the offline file to `force-hq-rebuild/Force-HQ-Rebuild-offline.html`
  - copy the toddle files to `force-hq-rebuild/worksheets/`
  - commit, `git fetch`, rebase, push to `main`
  - `project_write` the offline file to `claude/Force-HQ-Rebuild.html`
  - SendUserFile the offline file and the Toddle zip
  - tell Tom which file to upload
  - update the Brief, Backlog and this Handoff at the end of the session

## 2. Saving tokens: how to port from the old build
- **Never Read `force-hq/Force-HQ.html` whole** (550 KB). Use `tools/old.py`:
  - `python3 tools/old.py list sled` lists names containing "sled"
  - `python3 tools/old.py drawSled genQ SLED_M` prints just those definitions
  - `python3 tools/old.py grep husky` prints the matching lines
- Port by copying the definition into the right `src/js/` module, then adapting it to the new names (`S`, `LAB`, `forces()`, `C` colours, `fmt`, `T()` becomes the new glossary auto-underline). Keep the old numbers and wording where they still fit.
- **Reuse the rebuild's own engines.** Don't add new ones:
  - questions are data in `QT` types (`35-questions.js`)
  - steps follow the pattern in `41-ch1.js` / `42-ch2.js`
  - challenges go in `45-challenge.js`
  - sections go in `55-sections.js`
  - worksheets, keys and schemes are generated automatically from the question data
- Run only the tests that touch what you changed while you work. Run the full `run_all.sh` before you commit.

## 2. Saving tokens: porting from the old build
- **Never Read `force-hq/Force-HQ.html` whole** (550 KB). Use `tools/old.py`: `list <word>`, then print named definitions (`python3 tools/old.py drawAstro drawSpaceScene`), or `grep <text>`.
- Port by copying the definition into the right `src/js/` module and adapting it to the new names (`S`, `LAB`, `forces()`, `C` colours, `fmt`, glossary auto-underline). Keep the old numbers and wording where they fit.
- **Reuse the rebuild's engines. Don't add new ones.** Questions are `QT` data (`35-questions.js`); steps follow `43-ch3.js` (newest pattern); challenges go in `45-challenge.js`; sections in `55-sections.js`; worksheets, keys and schemes generate from the question data.
- Run only the tests that touch what you changed while working. Run the full `sh tests/run_all.sh` before committing.

## 3. Chapter 4 plan (from the Rebuild Brief; propose it to Tom before building)
- **Learn:** the astronaut and pod push off each other in the Space Dome (equal forces, opposite directions, on different objects); students predict both speeds before each push. Then the tug-of-war rope pair (team pulls rope, rope pulls team; the arena already has "third law pairs" arrows). Then thrusters (pod pushes gas back, gas pushes pod forward).
- **Challenge:** mission control docking orders using one push and no thrusters.
- **Check:** identify the pair for a given force; match the pairs; explain why the lighter one moves faster.
- **Old-build parts:** `drawSpaceScene`, `drawAstro`, `genOrder`, `order`, `orderCheck`, `ordersDone`, `renderOrder`, `logPush`, `push`, `RUNPUSH`, `wasPush`, `drawPod`.
- **Tom's standing decisions:** the Space Dome is Chapter 4. Leave behind the Skid Track, Crash Bay, Atrium and old HQ map.
- **Likely new work:** a `S.scene='space'` branch in `10-engine.js` and `12-arena.js` (no friction, momentum from equal and opposite pushes), a `renderOrdersCourse` in `45-challenge.js` (modelled on `renderSledCourse`), and `c4f`/`c4x` entries in `55-sections.js`. Use answer masking (`mask` in step data) wherever a readout would hand over an answer.

## 4. Rules every new step must follow (from the sim-builder skill and Tom's feedback)
- **Sections:** about 20–30 minutes each, shown as "approx.", estimated by `secMins`. Order: Learn → Challenge → Check. Every Learn step has a Do this job and at least one question.
- **Predict first** (`predict` in the step data), do it before you're told it, and key ideas made prominent with a key-idea task.
- **Questions:**
  - one go each; points per part
  - synonyms through `SYNS`
  - **no specificity pattern:** wrong options are as long and as detailed as the right one, with the same numbers
  - **explain items list `words`, and each checklist point says how a word is used**
  - **scaffold every calculation in Learn** (pattern, worked example, practice with hints) before the Check uses it
  - vary the situations
  - add "Need a clue?" for multi-step reasoning
  - every Check question is taught first
- **Readings:** students type every reading, and readings are checked against the student's own runs (store them, as `ch2Record` does). A question never forces a re-run: the Journal's Runs tab has the numbers. Any new kind of run (the sled) needs `runMark`/`runTick`/`runEnd` calls and a `runText` sentence and `runChips`.
- **Controls:** every new slider gets a typed number box. Target-finding tasks get red too-high and yellow too-low markers (see `LAB.bmarks` / `brakeMark`).
- **Pop-ups** use `makeDraggable`. New glossary words go into `TERMS` (now about 46; the skill wants 50–80, and Chapter 3 adds acceleration, resultant, formula triangle, m/s², and so on).
- **Worksheets** get a "Steps completed in the sim" list automatically from the section data. Check the blank, key and scheme PDFs render cleanly.
- **Voice:** warm, natural, short sentences. No "it isn't X, it's Y" construction, no standards on student screens, g = 9.8 N/kg.

## 5. Lessons from Chapter 3 (reuse these)
- **Students copy readouts.** Any question whose answer a readout shows must use the step `mask` and `sledMasked()` pattern so the number stays hidden until the student answers.
- **Mystery-object final steps beat long question runs.** Tom found a Learn step of many questions then a Review of more "brutal"; the Chapter 3 fix was a final step with several mystery objects the student fills in within the sim (`a6`, "Five mystery sleds"), and a lighter Review.
- **Formula triangle letters are tappable** (`21-calc.js`, `.trik`). Gap questions can allow interchangeable answers with `swap`.
- **Animation feedback** (packages falling when acceleration is too high) went down well; add similar cause-and-effect animation where cheap.
- **Scoring in challenges:** 4/3/2/1 by run number, with a Move on button and an 8 s timeout for runs that never finish.
- **FBD arrow lengths:** the checker has a length margin (`res.lenBad`) and the hint names the arrows.

## 6. Progress save and load (new, 26 Oct)
- `70-backup.js`: 💾 Save progress in the header saves the whole `DB` (Journal notes included) as a checksummed `.fhq.json` file or a copy-paste code (`FHQ1:`). Loading is on the name screen ("I have a progress file") or the same header button, with a confirm screen and "Undo my last load". The teacher flag is never exported. "Not you? Start fresh" is on the Change screen.
- Built for a loaner-device student. Toddle serves the app from a stable origin, so localStorage survives re-uploads on the same device and browser (Tom tested this).
- **If you add new saved state, put it in `DB`.** Anything outside `DB` is not backed up.
- Tested by `tests/backup.py`. Not yet tested: the Undo button, or a real upload on Toddle.

## 7. Open questions for Tom (ask at the start)
1. Has he replayed the Chapter 3 Extension and the Inertia Extension? Collect feedback before building Chapter 4.
2. Did the loaner-device student manage to save and load their progress?
3. Shared school computers share one browser save. "Not you? Start fresh" is the workaround; ask whether that is enough.

## 8. Skill checklist: still missing in Force HQ
- **Open builders and build tasks (skill 4e):** the Workshop is "Coming soon". Port `MSTEPS`, `PROBS`, `PARTS`, `mCalc`, `mDrawLever`, `mDrawPulley`, `mDrawCrane`, `genMach` when its milestone comes. Also add FBD build tasks for the teacher page.
- **Final mixed review** once more chapters exist.
- **Fun facts:** `FACTS`, `factPop`, `factList`, `FACTSTEP` in the old build; gate each fact by chapter.
- **Glossary:** grow it to 50–80 terms.
- **Flashcards with spaced repetition** from `DB.vocab`. Tom wants these for every sim and lab; banked.
- **Example worksheet:** a filled-in student worksheet was rendered for the team by `/tmp/play_example.py`, a copy of `play_c3.py` with deliberate wrong answers. If Tom asks for another, repeat that approach.
