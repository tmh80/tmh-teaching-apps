# The rescue on real pulling physics (spec)

Replaces section 15 of `Workshop_Lesson_Mode_Spec.md`. Written 11 Nov 2026 on branch `rescue-physics` (cut from `reading-writing`).

**Why.** Tom, 9 Nov: the rescue is "very punishing of creative ideas". A ramp beside a platform didn't count, a platform couldn't go over a lever, and a ramp on a platform blocked the Gumdrop. "They should be able, theoretically, to just build a load of pulleys and drag the Gumdrop to the ship. That would wreck the Gumdrop and give a really bad score, but it should be possible."

**How this is being built.** Two rescue engines passed their tests and then failed when Tom played them. So the order this time is:

| Step | Job | Who | Status |
|---|---|---|---|
| 1 | This spec | Fable | Done |
| 2 | The model on its own, with number tests and no visuals | Fable | Done: `src/js/4q-pull.js`, `tests/pull_model.js` (79 checks) |
| 3 | Grey-box: bare crater, the real model, no story or scoring screens. **Tom plays it and tries to break it** | Fable builds, Tom plays | Built: `proto/Rescue-Physics-Greybox.html`. Waiting for Tom |
| 4 | Wire the model into the real rescue (section 6) | Sonnet, medium effort | Not started. Do not start until Tom has signed off step 3 |
| 5 | Worksheets, keys, marking text, docs | Sonnet low effort or Haiku | Not started |
| 6 | Tom plays Part 5; then `WORKSHOP_OPEN = true` | Tom | |

## 1. The rules

The Gumdrop is a body that rests on a surface. A rope pulls it towards the rope's anchor, and it moves along whatever is under it.

1. **Surfaces.** Crater ground, platform tops and ramp decks. The Gumdrop takes the highest surface it can get onto, and stays on a ramp once it is on one.
2. **Force.** At every quarter-metre the model works out the force the rope needs: `force = load × (slope part + friction part)`. The model does not use a time-stepped physics engine, so nothing jitters and every number can be tested.
   - Crater ground is rough: friction 1/3, so dragging on flat ground needs **2,100 N** (6,300 ÷ 3).
   - Platform decks are smooth: friction 0.1 (630 N on the flat).
   - Ramp decks are rollers: no friction. So a ramp's MA is still exactly length ÷ rise, and Parts 1 to 4 stay true.
   - A crane lift has no friction: force = load.
3. **Only a wall stops it.** A wall is a rise of more than **1 m within half a metre**: a platform taller than 1 m, or the side of a big blast hole. Everything smaller is dragged over.
4. **Bumps.** A step of 0.3 m to 1 m is climbed like a short, steep kerb. It needs a big pull and dents the hull.
5. **Falls.** Going off an edge is allowed. A drop of more than 0.5 m damages the hull.
6. **The free nudge.** The first 3 m of a leg is free if it is level (within 0.5 m): no force, no hand travel, no damage. This is the old glowing box turned into a grace: a ramp whose foot is near the Gumdrop gives the same textbook numbers as before. Further than 3 m, the rest is a real drag.
7. **Too heavy.** If the pull would pass 180 N, the Gumdrop stops at that spot. It still moves as far as Smooshy can manage.
8. **Platforms give way** the moment the Gumdrop gets onto one that can't hold it and the machines on it.

## 2. Who pulls (a leg = one rope's pull, from start to stop)

Each rope is used once. The nearest one goes first. Smooshy never works a machine that would only drag the ship back down.

| Puller | What it does |
|---|---|
| **Ramp roped to the Gumdrop** | The anchor is the ramp's head. The Gumdrop is nudged or dragged to the foot, then rolls up the deck. If it is already part-way along, it joins the ramp there. |
| **Crane roped to the Gumdrop** | Drags the Gumdrop under its hook if it has to, lifts it, and the trolley carries it across and lowers it onto whatever is there (any height below the lift, no 0.5 m rule). A taller platform in the trolley's way is a wall. With Move across 0 it stays on the hook. |
| **Lever, screw jack** | Lifts the Gumdrop when it rests within 1.5 m. No rope. |
| **Winch post (new)** | A pulley block or winch that is roped to the Gumdrop and belongs to no machine. The Gumdrop is dragged to where it stands. This is "just build a load of pulleys". |

**Held up.** After a crane with no Move across, a lever or a jack, the Gumdrop is held in the air. The next rope pulls it sideways (up to 8 m on a crane's beam, 3 m off a lever or jack) until it is over something within 0.5 m below, and it settles there. With nothing under it, it falls.

**The saved rig does not change.** `gpEvaluate` reads the same `{ parts, cables }` as `glEvaluate`. No migration is needed. A winch post is a block or winch with a cable to `'ship'`.

## 3. Hull damage: one meter

Everything feeds `dmg.total` (0 to 100%), and the report lists where it came from.

| Source | Amount |
|---|---|
| Thrusters (pull over 60 N) | as now |
| Boulder left on | 25% |
| Blast within 6 m of the ship | 15% each |
| Scraping over crater ground | 1.2% per metre |
| Bumps | 6% per metre of step |
| Falls over 0.5 m | 8% per metre |

**Score.** The eleven points stay as they are, and ship condition (2, 1 or 0) reads the one meter. New: at **60% damage or more the rescue is "wrecked"** and scores 3 at most. Dragging the whole way out gives about 80% damage, 27,000 m of hand travel and a score of 3.

## 4. What students work out, and what the strip gives them

Each leg has `force` (the biggest force the rope needed), `ropeMA` (ropes × winches) and `simple`.

- **Simple leg** (`simple: true`): a ramp taken from its foot, a crane lift, a lever or a jack, with no paid dragging. Students do today's maths: machine MA, total MA, pull = load ÷ MA, hand distance, work. Every number matches the old model.
- **Any leg with a drag in it** (`given: true`): the strip gives the force and the distance ("Dragging here needs 2,100 N over 8 m"). Students do rope MA, then pull = force ÷ MA, then hand distance = MA × distance. No friction maths. The strip gives the work for these legs, because the force changes along the way.

## 5. For Tom to decide while playing the grey-box

The grey-box has a "Tune the rules" panel for all of these.

1. Is the 3 m free nudge right, or should every metre cost something?
2. Is 1 m the right height for a wall?
3. Does dragging hurt enough? (1.2% per metre; 2,100 N on the flat.)
4. Is a 4 m fall at 32% fair?
5. Should a wrecked rescue score 3 at most?
6. Ramps: in the grey-box each end of a ramp rests on whatever is under it, and its length and rise follow. Is that easier than setting length and rise? If yes, the real builder changes to match.
7. Has any student played Part 5? If not, the old-save code can go.

## 6. Step 4: wiring it in (after Tom signs off)

One Sonnet agent, medium effort, this section as the brief. Opus or Fable reviews screenshots.

1. **Swap the model.** Every `glEvaluate(` call becomes `gpEvaluate(`. Then delete from `4f-gummylift.js` only what nothing uses (`inZone`, the handover box constants `hzX` if unused; `hzY` is still used by the beam check).
2. **Builder (`4g`, `4h`).** Remove the glowing handover box and the "start the next machine in here" rule. Ghost Gumdrops stay (`ghosts`). Remove the rule that a platform can't go over a lever. A block or winch dropped on open ground and roped to the Gumdrop is a winch post. Draw each leg's path from `leg.path`, coloured by what the Gumdrop is doing, with the wall marked when `stop.why === 'wall'`.
3. **Run (`4i`).** Animate the Gumdrop along `leg.path`, with Smooshy at the puller. Narrate drags, bumps and falls. Add a Hull meter that fills as it goes.
4. **Route strip and GASA (`4p`).** Section 4 above. Simple legs unchanged. Drag legs show the given force and distance.
5. **Hints (`4k`).** Tier 2 and 3 for a drag leg: force ÷ rope MA.
6. **Guided start (`4j`).** Rewrite for the new rules: no box. Add one line: "You can drag the Gumdrop over the ground, but it scrapes the hull."
7. **Part 4.** Step `k4` and the "Platforms and the handover box" first-time cards teach the box. Change them to "whatever the Gumdrop is resting on, the next rope picks it up", using a ramp beside the shelf.
8. **Score and endings.** Add the "wrecked" ending card. Result card lists the hull damage sources.
9. **Outputs (load `wab-sim-toddle-outputs`).** My Rescue page: hull damage line and sources. Answer key, marking scheme and the Toddle AI feedback text: hull damage and the "wrecked" rule; the reflection question's model answer mentions dragging.
10. **Tests.** `tests/pull_model.js` joins `run_all.sh`. Rewrite `rescue_numbers.py`, `play_rescue.py`, `stage2_ropes.py`, `stage4_gasa.py`, `play_story.py`, `play_hints.py`, `play_myrescue.py`, `k4_two_leg.py` for the new rules. New play test: build a drag-only route with real pointer moves and reach the beam, wrecked.
11. **Docs.** Brief, backlog, handoff, Chapter 6 script, Project copies. Then `WORKSHOP_OPEN = true` after Tom plays.

**Not affected:** Parts 1 to 3, the Challenges and the Check keep their numbers and marks.
