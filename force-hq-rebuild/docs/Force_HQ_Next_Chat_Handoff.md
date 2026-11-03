# Force HQ rebuild: handoff for the next chat (updated 3 Nov 2026)

**Chapter 6 is finished (3 Nov 2026).** The previous chat built Part 4, Part 5, the Extension, the Build tasks and the final wiring and delivered them. **Next job: Explore "Draw what's happening now"** (a free-body-diagram check against the live forces; Backlog item 7), then the jobs in section 5. Wait for Tom's playtest feedback on Parts 4 and 5, the Extension and the Build tasks and fix what he finds first.

Tom is a British science teacher (Head of MS Sciences at WAB), **a teacher, not a programmer**. Explain in plain words and do all git work yourself. Read first, in this order:
1. `docs/Force_HQ_Handoff.md` (setup, rules, delivery steps, patterns). Its "Getting set up" and "Rules every new step must follow" sections apply unchanged.
2. `docs/Force_HQ_Brief.md` (file map, design notes, build logs).
3. `docs/Chapter6_Workshop_Script.md`, section **A2 (pacing and vocabulary rules)** before writing any step, then the section for each Part as you reach it. Repo and project copies are `claude/Force_HQ_*.md` and `claude/Force_HQ_Chapter6_Workshop_Script.md`.
4. `docs/Force_HQ_Backlog.md`.

## 0. Where things stand (3 Nov 2026)
- Chapters 1 to 6 are built. Chapter 6 (the Workshop, "Save Captain Smooshy!"): Parts 1 to 5 (`c6a` to `c6e`), the optional Extension `c6f`, the Build tasks bt1 to bt4 (Explore > Workshop > Build tasks), fun facts, the Rescue report on the Part 5 worksheet, worksheets and Toddle files for every Part and build task. All tests pass.
- Minutes (app estimate): Part 1 31, Part 2 27, Part 3 32, Part 4 32, Part 5 25, Extension 30; build tasks 12 to 15 each. Tom's target is about 30 or less per Part: offer to trim a Challenge job in Parts 3 and 4 if his class finds them long.
- Tom has not yet played Parts 4 and 5, the Extension or the Build tasks.
- The Brief's "Chapter 6 Parts 4 and 5, the Extension and the Build tasks: build log" lists the files, the engine rules and the tests. The script (`docs/Chapter6_Workshop_Script.md`) has an "As built" note under sections K, N, O1, P2 and W.

## 1. Next job
**Explore "Draw what's happening now".** In Explore the student draws a free-body diagram for the live scene and the sim checks it against the live forces (reuse `FBDB` and the `fbd` question machinery in `30-fbd-builder.js` and `35-questions.js`). Start by asking Tom which Explore scenes first (Tug-of-war, Drop Zone, Helicopter, Workshop). If he asks for something else after his playtest, do that first.

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

## Top priority next: rebuild the final rescue mission (Part 5)
Tom playtested Parts 4 and 5 on 3 Nov 2026 and wants the final mission redone as a free-form, creative rescue builder with quality-based scoring, a spend-a-hint tree and a clearer ending. Full brief for Opus: `docs/Force_HQ_Rescue_Rebuild_Brief.md`.
