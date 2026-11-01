# Force HQ (rebuild): backlog

## Next milestones (from the rebuild brief)
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
6. **Workshop (Chapter 6).** Parts 1 (Levers) and 2 (Pulleys, wheels and ramps) are built and were redesigned after Tom's first playtest (1 Nov 2026): slower pace, one new word per card, labelled pictures, familiar examples, black box transmission. Next: Tom plays Parts 1 and 2, then Part 3 (mechanical advantage and work), re-pitched to the script's section A2 first. Then Part 4 (compound machines and the builder), Part 5 (the rescue), the Extension (efficiency, Gummy Base One) and the build tasks.
7. **Explore.** "Draw what's happening now", which checks a student's FBD against the live forces.

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
