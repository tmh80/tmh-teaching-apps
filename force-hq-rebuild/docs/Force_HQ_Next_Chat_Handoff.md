# Force HQ rebuild: handoff for the next chat (written 2 Nov 2026)

**Job for this chat: build every remaining stage of Chapter 6 in one go, then deliver once.** Tom wants bigger batches because stopping after each Part to hear feedback is slow for him. So this chat does Parts 4 and 5, the Extension, the build tasks and the final wiring, and does **not** stop between them. Tom plays everything afterwards and gives feedback in one round.

Tom is a British science teacher (Head of MS Sciences at WAB), **a teacher, not a programmer**. Explain in plain words and do all git work yourself. Read first, in this order:
1. `docs/Force_HQ_Handoff.md` (setup, rules, delivery steps, patterns). Its "Getting set up" and "Rules every new step must follow" sections apply unchanged.
2. `docs/Force_HQ_Brief.md` (file map, design notes, build logs).
3. `docs/Chapter6_Workshop_Script.md`, section **A2 (pacing and vocabulary rules)** before writing any step, then the section for each Part as you reach it. Repo and project copies are `claude/Force_HQ_*.md` and `claude/Force_HQ_Chapter6_Workshop_Script.md`.
4. `docs/Force_HQ_Backlog.md`.

## 0. Where things stand (2 Nov 2026)
- Chapters 1 to 5 are built. **Chapter 6 (the Workshop, "Save Captain Smooshy!"): Parts 1 (Levers, `c6a`), 2 (Pulleys, wheels and ramps, `c6b`) and 3 (Mechanical advantage and work, `c6c`) are built, tested and pushed.** Part 3 was pushed in commit `2beae91`; Tom has not played it yet.
- Latest changes (all pushed, full suite clean): the Drop Zone's second lane has its own scenery; the Explain checklist ("Did you include…?") stays hidden until the student presses Check or Finish; every calculation (`num`) question in a Check has an optional, unmarked **Working** box (`.numworkin`, saved as `s.w`, printed in blue on the worksheet).
- Part 3 came out at about 32 minutes by the app's estimate (Learn 13, Challenge 9, Check 10). Tom's target is about 30 or less. Mention it; offer to trim one Challenge job if his class finds it long.

## 1. Stages to build (do them all in this chat, in this order)
Section R of the script lists them. **Re-pitch each Part against section A2 first** (one new word per card, a labelled picture for every new idea, one familiar pictured example, plain words, no prediction given away, about 30 minutes or less). Update the script's sections for that Part to match what you build (as Part 3 did), then build.

| # | Stage | Script sections | What to build |
|---|---|---|---|
| 1 | **Part 4: Compound machines** (`c6d`, stamp "Master Builder") | K, L, M, C4 | steps k1 to k3, the machine builder (C4: slots, ramp/pulley/winch, live Total MA, Cable, Hand travel, maskable), the crane scene, Challenge h1 to h3 (`renderShopCourse` with the builder), Check c6r18 to c6r22. k1's gallery must use pictured familiar machines (scissors, a building-site crane), not a can opener or an unpictured wheelbarrow. |
| 2 | **Part 5: Rescue Captain Smooshy!** (`c6e`, stamp "Smooshy Saver") | N, O, P, C6, C7 | the rescue site scene (`S.scene='rescue'`), step v1 (Smooshy climbs out of the Gumdrop hatch), `renderRescueCourse` sm1 to sm3 with objective scoring (4 + 4 + 5 points, attempting all three is enough), the mission computer prediction box, the ending animation, the Part 5 Check c6r23 to c6r26 (carries D i, D ii, D iii), the **Rescue report** on the worksheet. Rescue board slot 5 lights, and the Gumdrop reaches the rim. |
| 3 | **Extension: Real machines waste energy** (`c6f`, stamp "Colony Engineer") | P2, P3, P4, C1 | the Perfect / Real switch and efficiencies, Base camp scene, steps p5a and p5b, gb1 to gb3 with the energy-budget bar, Check c6r27 to c6r31, the sixth Rescue board slot. Optional and unticked by default on the teacher page. `calcorder` needs a highest-first option (`desc: true`) for c6r29. |
| 4 | **Build tasks bt1 to bt4** | W | port Sparks Through Time's `buildSheet` and the teacher-page build-task rows (grep `buildSheet` in `sparks-through-time/Sparks-Through-Time.html`; never Read it whole), a Build tasks tab in Explore, live checks, results tables, build sheets in three modes (blank, student, key), Toddle files, `tests` for each passing and failing build. Add `bt4` grid to `tests/workshop_numbers.py`. |
| 5 | **Final wiring** | C8, Q | Explore Workshop card (every machine, the builder, any load, world picker, Perfect/Real) and **Try the rescue again**; glossary terms and formulas not yet added (check `22-glossary.js` and `21-calc.js`); fun facts (Chapter 6 has no fun-fact engine, so use the last example card of a step, as Chapter 5 did); teacher page ticks (Parts 1 to 5 core, `c6f` optional); worksheets and Toddle files for `c6d`, `c6e`, `c6f` and the build tasks (`SHEETS` in `tools/make_worksheets.py`); `tests/strands.py` tags; home card and chapter overview. |
| 6 | **Explore: "Draw what's happening now"** | Backlog item 7 | checks a student's free-body diagram against the live forces. Do it if time allows, otherwise list it as the next job. |

**Count: 5 build stages (Part 4, Part 5, the Extension, build tasks, final wiring), plus the optional Explore draw task.** Do not stop after each one for Tom. Commit after each working stage, run its tests, and keep going. Send one progress message when each stage is committed (short, plain words), and deliver everything once at the end (section 4).

If the context runs out mid-way, finish the stage you are on, commit, push, update this file's section 0 with what is done, and say plainly what is left.

## 2. Tom's feedback so far that applies to the new Parts (do not repeat these mistakes)
- **Pacing (section A2).** Tom found the first Part 1 far too hard. One new word per card, a picture for every new idea, one familiar example, plain words ("rock to fulcrum", never "load arm"), try before naming, no prediction given away.
- **Checks.**
  - Every Check question must be taught first, register with `api.reg` (see Handoff section 9) and be covered by `tests/finish_types.py`.
  - Every `explain` question needs `check:` points. The checklist stays hidden until Check or Finish (automatic; just do not fight it in tests: press `.qchk` first, or tolerate it already being done).
  - Every calculation question gets the optional Working box automatically. Do not add working boxes to Learn questions.
  - `obj: ['Aii', ...]` MYP tags on every Check question (never on student screens). Run `python3 tests/strands.py`.
- **Wording.** Students say "velocity" (not speed), never use the letter W for work (it means weight), g = 9.8 N/kg (Glimmer-9 4.2 N/kg, always stated in the question), no "it isn't X, it's Y", no lines that justify why something is worth learning, no standards on student screens or worksheets, no "I can" statements.
- **Anything a student must read from the sim** has an inline answer box in the Do this list (`{ q: 'q1' }`), and never points at a question that only opens with "Next: questions".
- **Pictures.** `picLabel` puts labels in white boxes with leader lines; check dark mode (no dark ink strokes outside white boxes) and 390 px phone width. Render them with a small Playwright script and look at the PNGs before committing.
- **Challenges.** 4/3/2/1 by try, "Move on" after 3 misses scores 1 (the rescue uses best-try objective scoring instead). A pass is green and starts "Congratulations!". Show each objective as result, target, ✓/✗. Round before judging (60.0 N passes "60 N or less").
- **Lanes (Drop Zone).** Lane B has its own scenery. Do not undo it.

## 3. Practical notes learned in the last chat
- Run `python3 build.py` from `force-hq-rebuild/`, then tests. `sh tests/run_all.sh` takes about 15 minutes; run it in the background to a log file and watch the log with the Monitor tool. **Do not use `sleep` loops in the foreground** (the harness blocks them), and do not use `pgrep -f` wait loops that match themselves.
- Playwright strict mode: a selector that matches several elements fails. Use `.first`. `#mi-shop summary` matches three summaries.
- `fmt()` trims zeros ("18 m", not "18.0 m"); use `toFixed(1)` where a one-decimal number must show.
- Section ids, step ids, mission ids and question ids share one namespace (`STEPMIN` too). Grep before using an id. Part 4 ids per the script: steps `k1`–`k3`, missions `h1`–`h3`, Check `c6r18`–`c6r22`; Part 5: `v1`, `sm1`–`sm3`, `c6r23`–`c6r26`; Extension: `p5a`, `p5b`, `gb1`–`gb3`, `c6r27`–`c6r31` (the script's section F note explains why).
- `renderShopCourse` (45-challenge.js) judges each pull from `WS.last`; capped runs record `eDist=0`, so distances are computed from `ma × lift`. The challenge storage key is `chal.<sectionId>`.
- Names to avoid reusing (one shared scope): `WS`, `WS_*`, `ws*`, `shop*`, `SMOOSHY`, `WL`, `UNITS_W`, `shMark`, `shObjE`, `pic*`.
- The play-through test (`tests/play_c6.py`) must be extended for each new Part with right and wrong answers, every mission passing and failing, the Check, the stamp, and a `chk` for each rule above. `tests/workshop_numbers.py` must match `tools/workshop_model.py`.

## 4. Delivery (once, at the end; commit after each stage)
1. Full test run clean (`errors []` or `ALL PASS` for every test).
2. `python3 tools/make_worksheets.py`, copy `dist/toddle-files/.` and the zip into `worksheets/`.
3. Copy `dist/Force-HQ-offline.html` to `force-hq-rebuild/Force-HQ-Rebuild-offline.html`.
4. Commit (end every message with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and the `Claude-Session:` line the session gives you), `git fetch`, rebase, push to `main`.
5. Republish the preview artifact https://claude.ai/artifact/2qHdjKcuWWAjgMkjZdqEcy: `Artifact` read first, then publish `dist/artifact.html` with `url`. Do not paste the URL; one sentence on what changed.
6. `SendUserFile` the offline file.
7. Update the Brief, Backlog, Handoff and the Chapter 6 script in the repo, then write the same files to the claude.ai project with `Projects` `project_write` (`claude/Force_HQ_Brief.md`, `claude/Force_HQ_Backlog.md`, `claude/Force_HQ_Handoff.md`, `claude/Force_HQ_Chapter6_Workshop_Script.md`, and this file as `claude/Force_HQ_Next_Chat_Handoff.md`). **Never write HTML to the project.**
8. Final message to Tom, in plain words: which file to upload to Toddle (`Force-HQ-Rebuild-offline.html`, plus the new folders under `worksheets/` if he uses printed sheets), what changed for students in each stage, the time estimate per Part (`secMins`), and what is left.

## 5. After Chapter 6 (jobs Tom wants noted, not for this chat unless time remains)
- **Open-ended Workshop.** The Workshop home card becomes an open-ended workshop with challenges to save different things, not only Smooshy. Not needed now; leave the Chapter 6 card wording alone until then.
- **Vocabulary and flashcards.** The Journal Vocab tab exists. Spaced-repetition flashcards are banked, not built. Review how they fit together.
- **CER paragraph review (needs Opus).** Review how claim, evidence and reasoning writing is introduced and built up slowly across the chapters. Tom needs Opus for this specifically: plan it as an Opus job (a review and a proposed scaffold sequence), then Sonnet builds from it.
- Other open items: Tom to class-test Chapters 1 to 4; Chapter 1's table question `r10` overflows a 390 px phone by about 46 px; Chapter 1 information-overload test with a colleague; MYP D ii has no Check question outside Part 5 (Part 5's c6r26 will cover it); Toddle's real limit for the AI feedback box; testing the Download PDF button on a real student account.
