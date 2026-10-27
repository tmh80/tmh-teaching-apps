# Force HQ (rebuild): backlog

## Next milestones (from the rebuild brief)
1. Tom and a colleague test Chapter 1 for information overload, then fix what they find.
2. ~~Chapter 2, Inertia~~ (built 24 Oct 2026). Tom confirmed (25 Oct): the Space Dome stays in Chapter 4 with the docking orders as its challenge.
3. ~~Chapter 3, F = ma~~ (built 25 Oct 2026, all in the Snow Arena).
4. ~~Chapter 4, Action and reaction~~ (built 27 Oct 2026: Space Dome push-offs, force pairs in the Space Dome and the tug-of-war, thrusters, docking-orders Challenge).
5. **Chapter 5, Balanced forces and the Drop Zone.**
   - New arena with an air slider.
   - Objects to drop: feather, ball, crate, parachutist.
   - Terminal velocity.
   - Explain the drag model to Tom before coding it.
   - Helicopter hover extension, with no falling helicopters.
6. **Workshop.** Machine sections in this order: pulleys and mechanical advantage first, then levers, wheel and axle, ramps, wedges and screws, compound machines, and an efficiency extension. Add a machine builder with build tasks.
7. **Explore.** "Draw what's happening now", which checks a student's FBD against the live forces.

## Banked ideas
- Chapter 3: fun facts (port `FACTS`), a v–t graph question that uses the sloped line in the Check, and a Check item that draws the sled FBD.
- Chapter 3: both sections come out at about 30 min and 29 min (`secMins`), so trim if Tom's class finds them long.
- **Flashcards with spaced repetition** (Tom, 25 Oct 2026; for every sim and lab, not just Force HQ): cards built from the key vocabulary each student has met (`DB.vocab`), reviewed on a spaced-repetition schedule. Once built, add it to the sim builder and virtual lab builder skills.
- Chapter 2 polish from Tom's play-through (25 Oct 2026) done: slider number boxes, too-high/too-low markers, Journal tabs, scaffolded maths, words to use, steps summary, distractor rewrite. Ask Tom to replay the Inertia Extension and brake Challenge.
- Chapter 2: small drawings for the real-life inertia examples (seatbelt, tablecloth, bowling ball).
- Chapter 2: a "Put in order" question type (order objects by inertia) for the worksheets.
- Port the fun facts from the old build, gated by chapter.
- Grow the glossary to 50–80 terms as the chapters are added.
- Allow diagonal arrows in the FBD builder for later scenarios (pushes at an angle).
- Add FBD build tasks for the teacher page: "balanced forces" and "speeding up and slowing down".
- Offer a light/dark theme toggle.
- Make the FBD board text larger on phones.

## Open questions for Tom
- Ask Tom to play Chapter 3 and say whether the friction-off disclaimer and the maths ladder feel right.
- Drop Zone objects and parachute canopy sizes: anything to add?
- Once Chapter 1 is approved, should the rebuild replace the old Force HQ artifact and project copy?


## Done: progress save and load (26 Oct)
- Save and load progress file or code, for loaner devices and backups. Tested in `tests/backup.py`.
- Open question: shared school computers share one browser save; "Not you? Start fresh" is the workaround.

- Chapter 4: ask Tom to play it and say whether the ×8 time button, the tether and the "push lasts 1 s so speed = F ÷ m" shortcut feel right. Later idea: collisions (a second pod) and a momentum extension.
- Chapter 4: both sections come out at about 29 min (Foundation) and 24 min (Extension) in `secMins`.
