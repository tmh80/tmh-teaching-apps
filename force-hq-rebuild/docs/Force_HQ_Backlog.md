# Force HQ (rebuild): backlog

## Next milestones (from the rebuild brief)
**12 Nov 2026: Part 5 now runs on the new rescue board** (training rock, route strip with GASA's check, score of 11, new My Rescue page and key). Draft until Tom plays it. Review list: `docs/Part5_Review_Flags.md`. NEXT: Tom plays Part 5; a better answer-key route; check the Part 5 Check questions against the new board.

**Open decision for Tom: the crystal budget.** The boulder kit (lever, winch, crane gantry, winch) costs 70, so the crane route is over 475; raise the budget to about 545 or leave it. **NEXT: Tom plays Part 5 on branch `rescue-wiring` (the pulling-physics rescue is wired in, jobs 1 to 11 done); then set `WORKSHOP_OPEN = true`.** Background: `docs/Rescue_Pulling_Physics_Spec.md`. Steps 1 to 3 are done (spec, model with 79 number checks, grey-box `proto/Rescue-Physics-Greybox.html`) on branch `rescue-physics`. Tom plays the grey-box and answers the spec's section 5; then step 4 wires the model into the real rescue. The Workshop (Chapter 6) is closed to students (`WORKSHOP_OPEN = false`) until that is finished. Every other chapter is ready for class (Tom, 9 Nov 2026).

**Now (3 Nov 2026): Chapter 6 is built in full: Parts 1 to 5, the optional Extension (`c6f`) and Build tasks bt1 to bt4, with the Explore Workshop scene. Tom to play Parts 4 and 5, the Extension and the Build tasks.** Next job: Explore "Draw what's happening now" (item 7 below).

1. Tom and a colleague test Chapter 1 for information overload, then fix what they find.
2. ~~Chapter 2, Inertia~~ (built 24 Oct 2026). Tom confirmed (25 Oct): the Space Dome stays in Chapter 4 with the docking orders as its challenge.
3. ~~Chapter 3, F = ma~~ (built 25 Oct 2026, all in the Snow Arena).
4. ~~Chapter 4, Action and reaction~~ (built 27 Oct 2026: Space Dome push-offs, force pairs in the Space Dome and the tug-of-war, thrusters, docking-orders Challenge).
5. ~~**Chapter 5, Balanced forces and the Drop Zone.**~~ (built 28 Oct 2026: Foundation `c5f` Skydive Spotter, Extension `c5x` Planet Hopper with the helicopter pad and three delivery missions; Tom still to test in class). The notes below are kept for reference.
   - New arena with an air slider ("% air removed").
   - Objects to drop: feather, ball, crate, parachutist.
   - Terminal velocity.
   - Helicopter hover extension, with no falling helicopters.
   - **Tom's decisions (28 Oct):**
     - **Drop from high enough to reach terminal velocity.** Students should see the acceleration stop and the forces become balanced again. Rough heights to reach 95% of terminal velocity on Earth: ball (about 20 m/s) 50 m, crate (about 40 m/s) 190 m, parachutist with canopy closed (about 50 m/s) 300 m. A tower cannot show that, so the camera follows the falling object, with an altitude scale and the Fast-forward button.
     - **The student opens the parachute during the fall.** Air resistance jumps above the weight, the resultant points up and the parachutist slows down (still moving downwards), until a new, lower terminal velocity where the forces balance again. Open the canopy over about 2 s so the deceleration stays believable. The live free-body diagram is the star here.
     - **Gravity on other planets** (links to the Earth in Space unit, and it is fun). A planet picker sets g and how thick the air is; the air slider still removes a % of that planet's air. Rough idea (confirm the list with Tom): Earth 9.8 N/kg; Moon 1.6, no air; Mars 3.7, very thin air (terminal velocity about 5× Earth's, so a parachutist may never reach it); Venus 8.9, very thick air (terminal velocity a few m/s even without a canopy); Titan 1.4, thick air; Jupiter 24.8 at the cloud tops (no surface to land on). W = mg uses the planet's g.
     - **Compare drops side by side**: two lanes, each with its own planet, object and air setting, so students can race them (for example the same crate on Earth and the Moon, or with and without air).
   - **Observation and question variety (Tom, 28 Oct):** live FBD next to the drop, an obvious Pause button so students can check the forces at a chosen moment, questions on the trends in the arrow sizes, and a wider range of question types. Plan: `docs/Question_Types_Guide.md`.
   - **Drag model (explained to Tom 28 Oct, he has not objected):** weight = m × g pulls down. Air resistance pushes up, starts at zero and grows with velocity squared, with the area facing the air, and with how thick the air is. When air resistance equals the weight the forces are balanced and the object falls at a steady terminal velocity. Students never calculate drag: they watch the arrows, read velocities and type them in.
6. **Workshop (Chapter 6).** Parts 1 (Levers), 2 (Pulleys, wheels and ramps) and 3 (Mechanical advantage and work) are built and were redesigned after Tom's first playtest (1 Nov 2026): slower pace, one new word per card, labelled pictures, familiar examples, black box transmission. Part 3 (mechanical advantage and work) was built 2 Nov 2026, re-pitched to section A2 first. Parts 4 and 5, the Extension (efficiency, Gummy Base One) and the build tasks are built too, so the chapter is complete. Part 5 was rebuilt on 7 Nov 2026 as Operation Gummy Lift (a free-build rescue mission). Next: Tom plays it with a class and sends feedback.
7. **Explore.** "Draw what's happening now", which checks a student's FBD against the live forces.
8. **Operation Gummy Lift extras (optional).** Three preset crater variants so students get different maps (`GL_PROFILE` is the only thing to swap; re-run `tests/rescue_routes.js` against each), and a faint 1 m grid when the ruler is on.

## Banked ideas
- Chapter 3: fun facts (port `FACTS`), a v–t graph question that uses the sloped line in the Check, and a Check item that draws the sled FBD.
- Chapter 3: both sections come out at about 30 min and 29 min (`secMins`), so trim if Tom's class finds them long.
- **Flashcards with spaced repetition** (Tom, 25 Oct 2026; for every sim and lab, not just Force HQ): cards built from the key vocabulary each student has met (`DB.vocab`), reviewed on a spaced-repetition schedule. Once built, add it to the sim builder and virtual lab builder skills.
- Chapter 2 polish from Tom's play-through (25 Oct 2026) done: slider number boxes, too-high/too-low markers, Journal tabs, scaffolded maths, words to use, steps summary, distractor rewrite. Ask Tom to replay the Inertia Extension and brake Challenge.
- Chapter 2: small drawings for the real-life inertia examples (seatbelt, tablecloth, bowling ball).
- Chapter 2: a "Put in order" question type (order objects by inertia) for the worksheets.
- Port the fun facts from the old build, gated by chapter. Chapter 5 has no fun-fact engine to plug into, so its facts are the last example card of each Learn step (`CFACT` in `48-ch5.js`). When the engine is ported, move them across.
- Chapter 5: the Fast-forward button resets to 1x whenever a drop is set up; if students find it annoying, remember the setting.
- Chapter 1 table question `r10` overflows a 390 px phone by about 46 px.
- Grow the glossary to 50–80 terms as the chapters are added.
- Allow diagonal arrows in the FBD builder for later scenarios (pushes at an angle).
- Add FBD build tasks for the teacher page: "balanced forces" and "speeding up and slowing down".
- Offer a light/dark theme toggle.
- Make the FBD board text larger on phones.

## Open questions for Tom
- Class testing of Chapters 1 to 4 has not happened yet (Tom has played every section himself, 28 Oct).
- Drop Zone decided (28 Oct): all six worlds (Earth, Moon, Mars, Venus, Titan, Jupiter's cloud tops), two side-by-side lanes, three canopy sizes. Claude (Opus) writes `docs/Chapter5_Script.md`; Sonnet codes from it. Pitch everything at Grade 7/8 (language and question level).
- Once Chapter 1 is approved, should the rebuild replace the old Force HQ artifact and project copy?


## Done: progress save and load (26 Oct)
- Save and load progress file or code, for loaner devices and backups. Tested in `tests/backup.py`.
- Shared school computers share one browser save. Tom (28 Oct): not a big deal for now, students can use "Continue anyway" in the rare cases.

- Chapter 4: Tom played it (28 Oct). Fast-forward, the tether and the "push lasts 1 s" shortcut are fine; the "×8" was dropped from the button and the time readout. Later idea: collisions (a second pod) and a momentum extension.
- Chapter 4: both sections come out at about 29 min (Foundation) and 24 min (Extension) in `secMins`.

## Done: working out calculations (28 Oct)
- Calculation tasks show the question; answer boxes under tasks sync with Your turn; Journal tab on the right edge; Journal Working tab; calculator "Save to Journal". Not yet done: other tasks that only say "work out" in Chapter 2 (x2) could get answer boxes too.

## Done: November update (Nov 2026)
- Drop Zone verdict, g on other worlds, `calcorder`, lorry→truck, PDF file names and direct download, MYP strand tags, Toddle AI feedback text.
- Open: no Check question covers MYP D ii (safety, cost, environmental effects). Tom to decide whether to rewrite one explain question.
- Open: Toddle's real limit for the AI feedback box (the page warns above 10,000 characters). Tom to report.
- Open: test the Download PDF button on a real student account in Toddle, on a laptop and an iPad. Toddle's viewer may block downloads; the print menu is the backup.

## Done: Finish button, label boxes, shared rulers (1 Nov 2026)
- One Finish button checks the whole Check, shows the score pop-up and gives the stamp. Explain checklists stay visible while writing.
- `picLabel` and `wsLabel` put labels in white boxes. The Workshop rulers share one scale, with a zoomed ruler for short bars.
- Pulley step pl1 explains why students count supporting ropes.
- Open: Tom to play Part 2 pl1 and the Finish pop-up with a class.

## Jobs to do after the chapters are finished (Tom, 2 Nov 2026)
1. **Open-ended Workshop.** Once Chapter 6 is done, the Workshop home card should become an open-ended workshop: a place to take on challenges that save different things, not only Captain Smooshy. Not needed now. The Chapter 6 card wording stays as it is until then.
2. **Vocabulary and flashcards.** The Journal's Vocab tab exists (`DB.vocab`). The flashcards with spaced repetition are still banked, not built (see Banked ideas). Review how the two fit together.
3. **CER paragraph writing review (needs Opus).** In progress (8 Nov 2026): the Graphs and CER section `c2s` is built on branch `reading-writing`, and Tom plays it next. See `docs/Force_HQ_Handoff.md`. Review how Force HQ introduces claim, evidence and reasoning (CER) paragraph writing and builds it up slowly across the chapters: where students first meet it, how the scaffolds fade, and how the Explain questions and checklists support it. Tom needs Opus's help for this specifically, so plan it as an Opus job (a review and a proposed sequence of scaffolds), then Sonnet builds from it.

## Done: Check fixes (2 Nov 2026)
- The "Did you include…?" checklist on Explain questions stays hidden until the student presses Check or Finish, so the ticks come after the model answer is shown. This applies to every Check (`explain` in `35-questions.js`).
- Every calculation (`num`) question in a Check has an optional "Working" box. It is saved with the answer (`s.w`), is never marked, and prints in blue in the Working box on the student's worksheet. Learn questions keep the answer box in the Do this list and the Journal's Working tab.

## Done: Chapter 6 completed (3 Nov 2026)
- Parts 4 and 5, the Extension, the Build tasks, the Explore Workshop scene (free workshop with every machine, any load in kg, a world picker and Perfect / Real; Try the rescue again), fun facts, the My Rescue page (Part 5 is Operation Gummy Lift), worksheets and Toddle files for every Part and build task. See the Brief's Chapter 6 build log.
- Not built (banked): Explore "Draw what's happening now" (checks a free-body diagram against the live forces), the work triangle on the calculator, a 1-rope option in the builder.
