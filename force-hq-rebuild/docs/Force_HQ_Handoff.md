# Force HQ rebuild: handoff for a new chat (25 Oct 2026)

Start here. This is a **streamlining job**: the old Force HQ already contains most of the physics, drawings, events and question banks. Move pieces across from the old build and adapt them. Don't write something from scratch when the old build has it. Read this file, then `Force_HQ_Brief.md` (file map and the "must not break" rules). Open `Force_HQ_Rebuild_Brief.md` (the plan for every chapter) only for the section you're building. All three are in `force-hq-rebuild/docs/` in the repo and in the project under `claude/`.

**Next job: Chapter 3, F = ma**, built as a Foundation (`c3f`) and an Extension (`c3x`), like Chapters 1 and 2.

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
- **Tests:** `sh tests/run_all.sh` builds, then runs all 16 Playwright tests. Each test should print `errors []` (or `[]`), with no assertion errors. Screenshots go to `/tmp/fhq-shots/`. Paths are now relative, so the tests run from any clone. Add a `play_c3.py` modelled on `play_c2.py`.
- **Toddle PDFs:** `python3 tools/make_worksheets.py` writes `dist/toddle-files/` and the zip. Add the new sections to `SHEETS` in that script.
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

## 3. What to port for Chapter 3

| What Chapter 3 needs | Old-build source (`tools/old.py <name>`) | Where it goes |
|---|---|---|
| Husky sled race in the Snow Arena | `drawSled`, `drawSledScene`, `SLED_M` (with `VTOP`, `SLED_X0`, `SLED_FIN`), `SNOW`, `PINES`, `GROUNDS`, the sled branch of `forces` (top-speed taper), `EVENTS.sled`, `EVCTL` | `10-engine.js` (a `S.scene='sled'` branch), `11-draw.js`, `12-arena.js` |
| Huskies as pullers | `PUL` already has husky 90 N; the rebuild already draws a distinct husky in `11-draw.js` | reuse as it is |
| Formula triangle (F = m × a) | `buildTri`, `bindTri`, `triHTML`, `TRIF` | a helper in `21-calc.js` (the skill asks for one beside the calculator) and a Learn card |
| Levelled maths bank (find F, a, m, two-step, mixed) | `LEVELS`, `genQ`, `OBJ`, `makePractice`, `nf` | turn it into seeded `num` questions with a hint ladder (cover the letter, substitute, answer with unit), non-round values and a unit picker; correct answers go to Journal evidence (`addEvidence`) |
| Mail-run challenge (sled) | the sled event state and checks in the old `checkMissions` / `MISSIONS` | a `renderSledCourse` in `45-challenge.js`, scored like the brake course |
| Docking orders (space) | `genOrder`, `renderOrder`, `drawSpaceScene`, `drawPod`, `drawAstro` | **Not in Chapter 3** (Tom, 25 Oct): the Space Dome stays in Chapter 4, and the docking orders are its challenge. |
| v–t graph with acceleration (sloped line) | `drawVT` (the rebuild's `vtSVG` in `42-ch2.js` already exists) | extend `vtSVG` to draw a sloped line and read off acceleration |
| Fun facts (banked) | `FACTS`, `factPop`, `factList`, `FACTSTEP` | gate each fact by chapter; small, so it can go in with Chapter 3 |

**Tom's decision (25 Oct 2026): the Space Dome stays in Chapter 4; all of Chapter 3 is in the Snow Arena.**
- **Friction off for the first steps.** The Foundation's opening steps (formula triangle, predict → calculate → run) run the sled with friction switched off, so the husky pull is the resultant and a = F ÷ m works directly. Add a `mu: 0` option for the snow (like the air floor in Chapters 1–2) and set it in those steps.
- **Disclaimer when it's switched off.** A clear card at the first friction-free step: real snow and ice do have some friction, but it has been switched off for the first few steps so you can see F = ma on its own. Show a small "Friction: off" badge on the arena while it is off.
- **Disclaimer when it returns.** A card at the step where friction comes back: friction is back on, so the husky's pull is no longer the resultant; work out the resultant first (pull − friction), then use F = ma. The badge switches to "Friction: on". Friction should return by the end of the Foundation or the start of the Extension, so the Extension and the mail-run challenge use the resultant every time.
- The Chapter 3 challenge is the sled mail run only.

Chapter 3 content plan (from the rebuild brief):
- Resultant force first (Chapter 1 already teaches it in s3r, so recap only).
- The formula triangle with the husky sled.
- Predict → calculate → run.
- A maths bank in levels.
- Challenge: the mail run.
- The Check is mostly calculations, plus one or two explain items.

**Leave behind:** the Skid Track, Crash Bay, Atrium and old HQ map. The Crash Bay seatbelt model (`sMake`) is not needed.

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

## 5. State at the end of this session (all tested and pushed)
- Chapters 1 and 2 are complete (`c1f`, `c1x`, `c2f`, `c2x`), each with Learn, Challenge, Check, stamp and Toddle PDFs.
- **Round 6 of Tom's feedback is done:**
  - the Journal is a side panel with Runs, Notes and Vocab tabs, and there's a See my runs button
  - slider number boxes, and brake markers
  - Chapter 2 maths scaffolded
  - distractors rewritten
  - words to use in explain items
  - worksheet steps summary, plus the Toddle AI note about it
  - the calculator takes x, and its button stays visible
- Both skills were updated through `propose_skills`. The repo copies match.
- **This session also:**
  - made the test paths portable
  - added `tests/run_all.sh` and `tools/old.py`
  - fixed the home toast so the Space Dome says Chapter 4

## 6. Open questions for Tom (ask at the start)
1. (Answered 25 Oct: the Space Dome stays in Chapter 4; Chapter 3 starts with friction switched off, with a disclaimer, and a second disclaimer when it returns. See section 3.)
2. Has Tom replayed the Inertia Extension and the brake Challenge since round 6?

## 7. Skill checklist: still missing in Force HQ
- **Open builders and build tasks (skill 4e):** the Workshop is "Coming soon". Port `MSTEPS`, `PROBS`, `PARTS`, `mCalc`, `mDrawLever`, `mDrawPulley`, `mDrawCrane`, `genMach` when its milestone comes. Also add FBD build tasks for the teacher page.
- **Final mixed review:** add it once more chapters exist.
- **Fun facts:** see the table above.
- **Glossary:** grow it to 50–80 terms.
- **Flashcards with spaced repetition** from `DB.vocab`. Tom wants these for every sim and lab; they're banked.
