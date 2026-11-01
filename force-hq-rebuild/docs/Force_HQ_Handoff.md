# Force HQ rebuild: handoff for a new chat (updated 28 Oct 2026, evening)

Start here. Read this file, then `Force_HQ_Brief.md` (file map and design notes) and `Force_HQ_Backlog.md`. For Chapter 5 also read `docs/Chapter5_Script.md` (the full script and engine spec) and `docs/Question_Types_Guide.md` (new question types and the pause/snapshot tools). Tom is a teacher, not a programmer: explain in plain language and handle all git work yourself.

## 0. Where things stand
- **Built, tested and pushed:** Chapters 1 to 4, each with a Foundation and an Extension section (`c1f`, `c1x`, `c2f`, `c2x`, `c3f`, `c3x`, `c4f`, `c4x`), each section with Learn, Challenge and Check. Also progress save and load, Toddle worksheets (blank, key, marking scheme) and a preview artifact.
  - Chapter 1: tug-of-war, balanced and unbalanced forces, weight and mass, free-body diagrams.
  - Chapter 2: inertia, Newton's first law, velocity–time graph, brake challenge.
  - Chapter 3: F = ma in the Snow Arena (huskies and sled), friction, formula triangle, delivery challenge.
  - Chapter 4: action and reaction in the Space Dome (pod, astronaut, tether, thrusters, force pairs), docking-orders challenge.
- **Chapter 6 (the Workshop): Parts 1 and 2 built, redesigned after Tom's first playtest (1 Nov 2026).** Tom found the first Part 1 "far too difficult for Grade 7s and 8s" (too fast, too many unfamiliar examples without pictures, too much new vocabulary). Now: **Part 1 Levers** (`c6a`, steps `lv1`–`lv5`, Check `c6r1`–`c6r5`) and **Part 2 Pulleys, wheels and ramps** (`c6b`, steps `pl1`–`pl4`, Check `c6r7`–`c6r11`; `c6r6` is unused), labelled SVG pictures in `src/js/4bb-shoppics.js`, a `hand` machine, every effort drawn as a pull (`wsSpring`), the lever kept above the floor at every setting, plain words on screen ("rock to fulcrum", "your hand moved", "gap between threads"), and a **black box** crash transmission with Smooshy trapped inside the Gumdrop. `docs/Chapter6_Workshop_Script.md` is the script: **read its section A2 (pacing and vocabulary rules) before building anything**; later Parts moved up one (MA and work is now Part 3, `c6c`; compound machines Part 4, `c6d`; the rescue Part 5, `c6e`; efficiency the Extension, `c6f`; their question ids moved up by 5). `tools/workshop_model.py` is the number model; `tests/workshop_numbers.py` and `tests/play_c6.py` test Parts 1 and 2. **Next: Tom plays Parts 1 and 2, then section R step 1 of the script (re-pitch Part 3 against A2, then build it).** Tom's playtest notes: `docs/Ch6_Part1_Lever_Feedback.md` (actioned).
- **Chapter 5 is built (28 Oct 2026, steps 1 to 6 of the script's section J).** Physics reference: `tools/dropzone_model.py` (the JS engine matches it, tested). New question types: `docs/Question_Types_Guide.md`. **Next: the Workshop (Chapter 6), then Explore ("draw what's happening now").** The Workshop script is `claude/Force_HQ_Chapter6_Workshop_Script.md` in the claude.ai project, with its number model `claude/workshop_model.py` (written 1 Nov 2026; copy both into the repo as its section R step 1 says). Tom plays Chapter 5 in the morning of 29 Oct; fix what he finds first. See the Backlog.
- **Chapter 5 progress (section J of the script):** all six steps are done (28 Oct). Steps 1 to 3: the `order`, `pick`, `reason`, `fix`, `freeze`, `spot` and `sketch` question types and the Drop Zone engine and scene. Step 4: Foundation `c5f`. Step 5: Extension `c5x` with the helicopter pad. Step 6: glossary, formulas, fun facts, Chapter 5 home card live, Explore Helicopter, worksheets, full tests. Decisions made unattended are logged in the Brief's Chapter 5 build log.
- **Tom's latest feedback has all been actioned** (28 Oct, last commit `31d4a46`). He has not yet replayed everything after those fixes, so expect another round of review comments.

## 1. Getting set up (GitHub is the source of truth)
- **Repo:** `tmh80/tmh-teaching-apps`. Attach it with `add_repo` (access: push), clone it to `/home/claude/tmh-teaching-apps`, then `register_repo_root`. Work in `force-hq-rebuild/`.
- **Folders:**
  - `force-hq-rebuild/` is the rebuild: `src/`, `build.py`, `tools/`, `tests/`, `docs/`, `worksheets/`, and `Force-HQ-Rebuild-offline.html` (the file Tom uploads to Toddle).
  - `force-hq/Force-HQ.html` is the **old build**, the parts bin to port from.
  - `.claude/skills/` holds repo copies of `wab-science-sim-builder` and `wab-virtual-lab-builder`. Keep them the same as Tom's account skills.
  - Root `CLAUDE.md` has Tom's repo rules: plain-language explanations, commit after each working change, tell Tom which file to upload, keep `README.md` current.
- **Build:** `python3 build.py` from `force-hq-rebuild/`. It runs `node --check` on every module (all of `src/js/*.js` are joined, in name order, into one IIFE) and writes `dist/Force-HQ-offline.html` (Toddle), `dist/test.html` (adds the `window.__fhq` hook; `__fhq.ev(code)` runs code inside the app) and `dist/artifact.html`.
- **Tests:** `sh tests/run_all.sh` builds, then runs the Playwright tests: err, play_c1, review, misc, stamp, who, qpop, onego, qdrag, answer_box, carddrag, explore, dark, net, play_c2, play_c3, play_c4, calc_formulas, runs, vocab, backup. Each prints `errors []` (or `[]`). Full run takes about 7 minutes; run only the tests that touch your change while working. Screenshots go to `/tmp/fhq-shots/`. `net` proves the offline file makes no internet requests.
- **Toddle files:** `python3 tools/make_worksheets.py` writes `dist/toddle-files/` and the zip. Add new sections to `SHEETS` in that script, then copy the output into `worksheets/`. Regenerate whenever question wording changes.
- **Preview artifact:** https://claude.ai/artifact/2qHdjKcuWWAjgMkjZdqEcy. Republish `dist/artifact.html` to that URL, passing `url`.
- **Deliver after each change:**
  1. copy `dist/Force-HQ-offline.html` to `force-hq-rebuild/Force-HQ-Rebuild-offline.html`
  2. regenerate and copy the worksheets if wording or questions changed
  3. commit (with the attribution lines the session asks for), `git fetch`, rebase, push to `main`
  4. republish the preview artifact
  5. `SendUserFile` the offline file, and tell Tom which file to upload to Toddle
  6. update the Brief, Backlog and this Handoff at the end of the session, in the repo and in the claude.ai project (`claude/Force_HQ_*.md`)
  - Never save HTML to the claude.ai project (Tom, 1 Nov 2026): it has a size limit, and GitHub holds every version. The project keeps only small text docs.

## 2. Saving effort: porting from the old build
- **Never Read `force-hq/Force-HQ.html` whole** (550 KB). Use `tools/old.py`: `list <word>`, then print named definitions (`python3 tools/old.py drawSled genQ`), or `grep <text>`.
- Port by copying the definition into the right `src/js/` module and adapting it to the new names (`S`, `LAB`, `forces()`, `C` colours, `fmt`, glossary auto-underline). Keep the old numbers and wording where they fit.
- **Reuse the rebuild's engines. Do not add new ones.**
  - Questions are `QT` data (`35-questions.js`).
  - Steps follow `44-ch4.js` (newest pattern). Step schema: `{id, title, info, floors, cards, predict, setup(), adds, hide, sides, pullers, idle, tasks:[[html, fn, opts]], mask, more, qs}`. `panelsFor` accumulates `adds` over a chapter's steps, so later steps must `hide` panels from earlier scenes.
  - Challenges go in `45-challenge.js`; sections in `55-sections.js` (and `STEPMIN` for time estimates); worksheets, keys and schemes generate from the question data.
  - Anything the student saves goes in `DB` (via `dbGet`/`dbSet`), or it will not be in the save file.

## 3. Rules every new step must follow
- **Sections:** about 20 to 30 minutes each, shown as "approx.". Order: Learn, Challenge, Check. Every Learn step has a Do this job and at least one question.
- **Predict first** (`predict` in step data) where a result can be predicted. Key ideas get a key-idea task.
- **Questions:**
  - one go each; points per part; synonyms through `SYNS`
  - no specificity pattern: wrong options are as long and detailed as the right one, with the same numbers
  - explain items list `words`, and each checklist point says how a word is used
  - scaffold every calculation in Learn (pattern, worked example, practice with hints) before the Check uses it
  - every Check question is taught first
  - "Need a clue?" (`ladder` + `hints`) for multi-step reasoning
- **Readings:** students type every reading, checked against their own runs (store them, as `ch2Record` does). A question never forces a re-run: the Journal's Runs tab has the numbers. A new kind of run needs `runMark`/`runTick`/`runEnd` calls plus a `runText` sentence and `runChips`.
- **Controls:** every slider gets a typed number box. Target-finding tasks get red too-high and yellow too-low markers (`LAB.bmarks`).
- **Pop-ups** use `makeDraggable`. New glossary words go into `TERMS` (about 46 now; the skill wants 50 to 80).
- **Voice:** warm, natural, short sentences. No "it isn't X, it's Y" construction, no standards on student screens, g = 9.8 N/kg.
- **Terminology (Tom, 28 Oct):** students say **velocity**, not speed. Use "velocity" in all student text. The verb "speed up" is fine. The time-warp button is "Fast-forward" (Tom, 28 Oct: no "×8", because students would ask why 8). Thruster buttons are "Thrust forward" and "Thrust backward".

## 4. Patterns added on 28 Oct (reuse these)
- **Calculation steps are two kinds of task** (see "Working out calculations" and "Review fixes" in the Brief):
  - a *calculate* task: `['', () => hasAns('q1'), { q: 'q1' }]`. The question text shows in the Do this list with a number-and-unit box and a Check button. The box shares a draft with the "Your turn" question, and its Check presses that question's Check. The task ticks once the answer is checked.
  - a short *check* task: `['<b>Check puzzle 1</b> in the Space Dome.', () => sHas(...)]`, ticked by making the run happen in the sim.
  - A "Check it. What does the readout show?" reading question gets `auto: true`, and completes itself when the run is made (`autoQs` in `40-guided.js`). Tests must skip questions that are already locked.
  - Leave a task's text empty (`''`) when the question already holds the numbers. Tom finds extra instruction lines "take too much space".
- **Mask answers** a readout would hand over (`mask` in step data, `spaceMasked`/`sledMasked`), so the number stays hidden until the student answers.
- **Calculator:** Calculator and Formulas tabs. All formulas always visible; those for the current chapter glow gold (`ch: [..]` in `FORMULAS`). Tappable triangles for F = ma and W = mg. A "Save to Journal" button stores a calculation and optional working note.
- **Journal:** tabs Runs, Working, Notes, Vocab, plus a fixed tab on the right edge of the screen. None of the Journal buttons (header, tab, step list) shows a number. The Working tab has a free-typing pad per step (`DB.jwork`).
- **Space Dome free-body diagram** keeps the latest push or thruster burst until Reset.
- **Challenge feedback:** a pass is green and starts "Congratulations!". Window edges count as on target (`DOCK_EPS`), because the sim reads 0.4999 for an exact 0.5.
- **Mystery-object final steps** beat long question runs (Chapter 3 `a6`, Chapter 4 `f5`).
- **Scoring in challenges:** 4/3/2/1 by run number, with a "Move on" button after 3 misses and a timeout for runs that never finish.
- **Label overlap:** the Main Arena force-pair labels (`drawRopePairs`) are anchored at their inner end and shift up when squeezed at the arena edge. Check screenshots at both edges when touching them.

## 5. Progress save and load (26 Oct)
- `70-backup.js`: "Save progress" in the header saves the whole `DB` (Journal included) as a checksummed `.fhq.json` file or a copy-paste code. Loading is on the name screen or the same header button, with a confirm screen and "Undo my last load". The teacher flag is never exported. "Not you? Start fresh" is on the Change screen.
- Built for a loaner-device student. Toddle serves the app from a stable origin, so localStorage survives re-uploads on the same device and browser.
- Not yet tested by Tom: the Undo button, or a real upload on Toddle.

## 6. Open questions for Tom (ask at the start)
Answered 28 Oct: Tom has played every section, but class testing has not happened yet. Chapter 4's Fast-forward, tether and shortcut are fine. Loaner devices and shared computers are not a worry for now ("Continue anyway" covers the rare cases). The drag model was explained to him. His Chapter 5 decisions are in the Backlog (item 5): a drop high enough to reach terminal velocity, opening the parachute mid-fall, gravity on other planets, and side-by-side lanes.
1. Collect feedback from class testing when it happens.
2. Chapter 5 is decided (28 Oct): all six worlds, two lanes, three canopies, script by Opus in `docs/Chapter5_Script.md`, everything pitched at Grade 7/8.

## 7. Still missing (skill checklist)
- **Chapter 5, Drop Zone** (new arena with an air slider; feather, ball, crate, parachutist; terminal velocity; helicopter hover extension; tall drop with a following camera, parachute opened mid-fall, planet picker, side-by-side lanes: see Backlog item 5). **Workshop** (pulleys, levers, wheel and axle, ramps, wedges and screws, compound machines, efficiency; machine builder with build tasks). **Explore** "draw what's happening now" FBD check.
- **New question types** (28 Oct, `docs/Question_Types_Guide.md`): `order`, `pick`, `reason` (two-tier, with a "Who's right?" cartoon mode), `fix` (spot the mistake), `freeze` (freeze-frame table from paused snapshots), `spot` (tap a point on a graph), `sketch` (sketch the v–t graph), and the "How sure are you?" add-on. Tom wants Chapter 5 to be observation-heavy: live FBD beside the drop, a big Pause button, questions on the trends in the arrow sizes.
- **Final mixed review** once more chapters exist.
- **Fun facts** (`FACTS`, `factPop`, `factList`, `FACTSTEP` in the old build), gated by chapter.
- **Glossary** up to 50 to 80 terms.
- **Flashcards with spaced repetition** from `DB.vocab` (Tom wants these in every sim and lab; banked).
- Other small ideas are in the Backlog (answer boxes for Chapter 2 `x2`, diagonal FBD arrows, light/dark toggle, bigger FBD text on phones).

## 8. Script format for the planning model (use this when it writes the teaching cards)
Ask the planning model for one markdown file per chapter in `docs/` (for example `Chapter5_Script.md`), one block per step, written so the coding model can copy it straight into the step data. If the coding model has to change wording to fit the screen or to stop a readout giving an answer away, it changes the script file too, so the script and the app do not drift apart.

```
### Step f5: Mystery push-offs   (Foundation, about 5 min)
Arena: <which scene, which panels are added or hidden>
Formulas unlocked in the calculator: <none, or the ids>

CARDS (1 to 3; each at most about 60 words, so it fits the card without clipping)
1. <text>
   Worked example (only where a calculation is taught): <numbers and working>
   Key idea (optional): <one sentence to highlight>

PREDICT FIRST (optional)
Question: <text>   Options: <4 options, all about the same length>   After: <one line>

DO THIS (short; leave a task's text empty when the question already holds the numbers)
- Calculate: <question text>  -> answer box, unit <unit>
- Check it: <what to do in the sim>   (a "Check it" reading question completes itself when this is done)

YOUR TURN QUESTIONS
q1 | num | <question> | answer <n> | unit <u> | tolerance <t>
   Hints (3, from nudge to the sum): ...
   Working shown after: <one line>
q2 | mcq | <question> | options (same length and detail) | correct <n> | why each wrong option is wrong, one line each
Glossary words to underline: <words>
Masked readouts: <which readout stays hidden until which question is answered>
```
Voice and terminology rules for the script are in section 3 (velocity, not speed; short sentences; no "it isn't X, it's Y"; no standards on student screens; g = 9.8 N/kg).

## 9. Patterns added in November 2026 (reuse these)
- `dzVerdict(L, mk)` returns `{text, col}` for the Drop Zone landing label. Mission targets live in `objs` on each mission (`dzObjV`, `dzObjT`, `dzObjH` in `48-ch5.js`).
- `calcorder` question type: `QT.calcorder` in `36-qtypes.js`, marks via `coScore`, worksheet and key cases in `60-worksheet.js`.
- PDF download: `downloadWorksheetPdf` and `downloadSheetPdf` in `61-pdf.js`. Libraries are inlined from `vendor/` by `build.py`. Never edit `dist/` by hand.
- MYP tags: add `obj: ['Aii']` to every new Check question. Run `python3 tests/strands.py`. Strands never go on student screens or sheets.
- AI feedback text: `aiFeedbackText(secIds, optIds)` and `answerKeyText(chId)` in `58-myp.js`; `markingRules` is shared with the printable scheme. The prompt in step 4 never contains the answer key.
- Teacher code: `FORCE`. g = 9.8 N/kg. Students say "velocity", not "speed".
