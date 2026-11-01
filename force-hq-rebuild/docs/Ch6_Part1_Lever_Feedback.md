# Chapter 6, Part 1, step w2 ("Three classes of lever"): feedback from Tom's playtest

Written for Opus to design and build a fix. Source: Tom's review comments on the Part 1 build (commit 3535b80), plus his summary remark. Tom is a teacher, not a programmer, so explain changes to him in plain language and handle git. Follow `CLAUDE.md` and `.claude/skills/wab-science-sim-builder/SKILL.md`.

## Tom's overall verdict

> Extremely difficult and confusing even to me. Why is a bottle opener load in the middle? Grade 7/8s don't stand a chance.

The Learn phase on levers is too hard for the audience. Treat this as a redesign of w2, not a patch. Students have only just met the words fulcrum, load and effort, so they cannot yet use them to learn something new.

## Comments

### 1. Scene bug: lever runs off the floor at 0.2 (element `#cvScene`)

> At 0.2, the right side of the lever goes beneath the floor and can't be seen. Also, with the newton meter above, it looks like it's pushing, not pulling.

Two separate problems:

- **Clipping.** With the effort position set to 0.2 (m from the fulcrum), the long arm swings below the floor line (floor starts at y=350 in `wsRoom`) and disappears. Needs a fix in `wsDrawLever` (`src/js/4b-shopdraw.js` around line 122) so the bar stays visible at every legal setting and class, for example by limiting the tilt drawn, raising the pivot, or rescaling. Check all three classes at the extremes of the sliders.
- **Newtonmeter direction.** When the newtonmeter sits above the bar, it reads as pushing down, but the task is to pull. Make the effort clearly a pull in the drawing, using an arrow, hand and grip, or by placing the meter so its hook pulls rather than pushes. This may apply to the other machines too, so check them.

### 2. Vocabulary load (element `#chunk > div:nth-of-type(2) > p`)

Text shown: "Levers come in three classes, depending on what sits in the middle. Class 1: the Fulcrum is in the middle, like a seesaw or a crowbar. Class 2: the Load is in the middle, like a wheelbarrow or a nutcracker. Class 3: the Effort is in the middle, like tweezers, a fishing rod or your own forearm."

> Will be super confusing to kids as they've only just been introduced to this vocabulary. They're not in a position to understand it in a context to learn something new yet.

Implications:

- Do not teach classes via an abstract "what sits in the middle" definition and a list of examples.
- Introduce the idea gradually: let students move the bar and watch what happens, and name the classes only after they have seen the difference.
- Reconsider the examples. A bottle opener is hard to see as "load in the middle" (Tom asked why it counts), and nutcracker, tweezers and forearm are not obvious either. Use examples whose structure students can see at a glance (seesaw or crowbar for class 1, wheelbarrow for class 2, a fishing rod or a broom for class 3), and drop the ambiguous ones.

### 3. A labelled picture of the three classes (element `#chunk > div:nth-of-type(2)`)

> An image of these classes of levers, labelled, would really support student understanding.

Add a simple labelled diagram of all three classes showing the fulcrum, load and effort in each, in the same colours as the Workshop scene. It should also be usable on the printed worksheet (the `leverSVG` paper picture is still on the backlog, so this can share that work).

### 4. Class 3 needs an animation (element `#chunk > div:nth-of-type(2) > p`)

Text shown: "A class 3 lever needs an effort bigger than the load! Engineers still love them, because the load end moves much further and faster than your hand. A small movement of your arm muscle swings your hand a long way."

> Again, an animation of this would be really helpful.

Add a short animation (or an interactive moment in the scene) showing a small hand movement producing a large movement at the load end, with the effort bigger than the load. It must show the trade-off between force and distance, not only state it.

## Where the code is

- Learn text for w2: `src/js/4c-ch6.js`, around lines 73 to 90. This includes the `predict` block, q1 (reading), q2 (sort into classes), q3 (why use a class 3 lever) and the fun fact about the forearm.
- The same sort question is reused in the Check as `c6r3` (line 147). Keep it consistent with any new class wording.
- Lever drawing: `wsDrawLever` in `src/js/4b-shopdraw.js` (around line 122). Canvas is 900×430, the floor starts at y=350, and the lever uses k=170 px/m with X0=200.
- Lever controls (class switch `#wsCls`): `src/js/4a-workshop.js` around line 172. The lever's `maxTravel` is 1.5 m.
- Script: `docs/Chapter6_Workshop_Script.md` (w2 around lines 326 to 351). Update it if the wording changes. Misconception M7 (around line 259) links to w2 q1 and q3.
- Tests: `tests/play_c6.py` plays w1 to w5 and will need updating if the steps change. `tests/workshop_numbers.py` checks the numbers against `tools/workshop_model.py`.

## Constraints to keep

- Single-file offline HTML, no internet requests.
- The numbers must still match `tools/workshop_model.py`.
- Part 1 is already about 31 minutes against a 30-minute target, so a clearer w2 should not get longer. Consider cutting w2 q3 or c6r3 if the new teaching needs the time.
- Keep standards (ACARA/MYP) off student-facing pages.
- After the fix: run `sh tests/run_all.sh`, commit, push, and tell Tom which file to upload to Toddle (`Force-HQ-Rebuild-offline.html`).
