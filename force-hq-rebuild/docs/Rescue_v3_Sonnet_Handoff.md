# Force HQ rescue v3: hand-off for Sonnet (12 Nov 2026)

You are picking up the last part of Force HQ (Chapter 6, Part 5, "the rescue") for Tom, a science teacher who is not a programmer. Explain in plain language, handle all git yourself, and read `CLAUDE.md` and `.claude/skills/wab-science-sim-builder/SKILL.md` first.

## 1. Where things stand

- Repo `tmh80/tmh-teaching-apps`, branch **`rescue-wiring`** (pushed). App folder `force-hq-rebuild/`. Build: `python3 build.py`. Tests: `bash tests/run_all.sh` (about 50 minutes; grep the whole log for FAIL, Traceback, TimeoutError).
- The rescue that is in the app today (files `4f` to `4q`) was rebuilt three times and still failed Tom's play-tests: too hard, too fiddly, invisible rules, and the same crane + pulley + winch stack on every leg. **Do not patch it further.**
- Tom approved a rethink. The rules are in the project doc **`claude/Force_HQ_Rescue_Rule_Sheet_v3.md`** (read it with the Projects tool before anything else, and save a copy to `force-hq-rebuild/docs/` on your first commit).
- A bare test board proves the core: **`force-hq-rebuild/proto/Rescue-Core-Board.html`** (one self-contained file, about 300 lines of script, published for Tom at https://claude.ai/artifact/9d75dyfsptNigAEAeuVJff). Tom played it on 12 Nov and said "this works". **This file is the reference implementation.** Build on it; do not go back to the old engine's rules.
- Chapters 1 to 5 are ready for class and must not change. Workshop Parts 1 to 4 keep their maths: the Gumdrop is 6,300 N, Smooshy's limit is 60 N, g is 4.2 N/kg on Glimmer-9.
- `WORKSHOP_OPEN` is `true` so Tom can play. Nothing from this branch goes to Toddle until Tom has played the finished Part 5 and says so.

## 2. What the core board does (keep all of this)

- **Map** (`PTS`): crater floor (Gumdrop at x = 12), lower slope, a vertical 6 m cliff at x = 46, a ledge, upper slope, the dotted line at 15 m.
- **One rule of motion**: a leg moves when `60 N × total MA ≥ force needed`. `planLeg(machine, state)` returns the path, the force needed and where the leg ends, or a plain sentence saying why it cannot start. `evaluate()` chains legs: each leg starts where the last one ended.
- **Live readout**: a tag on every machine and a table under the board ("Needs 1,160 N. 60 N × 4 × 8 = 1,920 N. Moves. Smooshy pulls 36.2 N.").
- **Hooks**: a machine's rope is hooked to the Gumdrop or it is visibly slack and pulsing. Never draw a tight rope that is not a real connection. Helpers (pulley block, winch) clip onto a pull hook in any order.
- **Picking**: hit areas follow the drawn shape (`hit()` measures distance to the drawn lines), plus a chip row with one chip per piece.
- **Tools so far**: ramp, cart, pull post, crane, screw jack lift (MA 120 alone), pulley block (2 to 8 ropes), winch (handle ×4 to ×20).

## 3. First job: the pole (Tom, 12 Nov)

Tom: "Winches and pulleys just float. How about having a pole, instead of a pull post. A pole can have a winch or pulley attached to make a pull post, and it also allows students to attach them somewhere high. At the moment the pulleys float in the air and it looks a bit strange."

Build this on the core board first, then show Tom.

- **Pole** replaces the pull post. It stands on the ground, costs 10 crystals, and its height can be set (about 2 to 10 m) in its card.
- **Nothing floats.** A pulley block or winch is always mounted on something solid: a pole, or a machine's own frame (the crane's beam, the top of a ramp, the screw jack's base). Draw the mount: a bracket for a winch at the foot of the pole where Smooshy can reach the handle, a pulley block hanging from the top of the pole or from the crane beam.
- **A pole with a rope hooked to the Gumdrop is a pull post**: the Gumdrop is pulled along the ground (or rolls on its cart) towards the pole, as the pull post does now. A bare pole with a hooked rope has MA 1; mount a pulley block and a winch on it to multiply the pull.
- **Mounting**: dropping a helper within reach of a pole or a machine frame mounts it there and adds it to that leg's chain (same any-order rule as now). Dragging it clear unmounts it. A helper that is not mounted cannot be left on the board: it goes back to the tray with a short message ("A pulley block needs a pole or a machine to hang from.").
- **Several poles**: a leg's rope may run from the machine to helpers on a nearby pole. Keep the chain rule simple: every helper belongs to exactly one leg; show the rope from hook to hook so the order is visible.
- **Optional, ask Tom before building**: a tall pole at the top of the cliff could hoist the Gumdrop straight up the cliff (needs the full 6,300 N), which would make it a cheap crane without a trolley. Do not build this unless he says yes.

## 4. Then, in this order (show Tom after each stage)

**Stage A, still on the core board (`proto/`):**
1. Pole and mounts (section 3).
2. Tidy the crowding at the cliff: helpers park on their pole or frame; ghost Gumdrops and tags do not overlap machines; default view a little zoomed in on the first leg, with the ⤢ whole-map button.
3. Platforms: every size holds the Gumdrop; size is width only. A screw jack under a platform raises the platform and what is on it (the "screw jack lift" becomes platform + jack).
4. Cart: a platform with a wheel and axle added becomes a cart. The Gumdrop has to get onto it (rolled on from level ground, set down by a crane, or tipped on by a lever).
5. Lever: tips the Gumdrop up about 1 m onto a cart or a low platform. Pulley blocks do not go on levers; a winch on its pulling end does.
6. Dynamite: lowers the crest or cuts a notch in the cliff. Before the student commits, show the hole it will make and the hull-risk ring.
7. Hull damage, simple: dragging on bare ground scrapes and can tip the Gumdrop, falls dent it.

**Stage B, the training round:**
8. A small rock beside the Gumdrop. Step 1: pry it up with a lever (a winch on the lever's pulling end locks and holds it). Step 2: a crane picks it up from where the lever left it and sets it down clear. A small coach card gives one step at a time, can be hidden or skipped.
9. Then the rock is gone and the training machines are **packed away** by themselves ("Training kit packed away"). The training kit is free, and nothing from training is left on the board, in the route strip or in the score. No boulder rules in the rescue.

**Stage C, into Force HQ as Part 5:**
10. Replace the Part 5 board with the new one. Keep the Glimmer-9 night art (`4g-glscene.js` drawing: sky, ground style, the Big Jelly mothership, the Gumdrop, steel truss machines, hazard bars, two-tone ropes) and the opening shot that pans from the Big Jelly to the Gumdrop.
11. Keep the story frame: Gummy Mission Control, the student proposes a rescue plan to GASA, Smooshy is inside the Gumdrop, the Big Jelly's beam finishes the job.
12. Budget, with its reason in the brief: GASA can only fly so much kit to Glimmer-9, so the job is the cheapest, lightest design that keeps Smooshy's pull low. A cost meter sits beside the tray.
13. Route strip and GASA check, save and restore, scoring, endings, My Rescue page.
14. Delete the old rescue rules that nothing uses any more (legs by role, handover rules, boulder strain and the torn leg, platform strength, the stand-on choice, the long tutorial). Parts 1 to 4 lesson boards share some drawing code: keep what they use and check they still look and work the same.

**Stage D:**
15. Outputs (load `wab-sim-toddle-outputs`): answer key route, marking scheme, AI feedback text, Part 5 worksheets.
16. Tests: write new ones for the new board (a node test for the rules, play tests with real pointer moves). Retire tests that only checked the old rescue. Full suite green.
17. Docs: brief, backlog, Chapter 6 script, README; mirror the small text docs to the project. Then Tom plays Part 5.

## 5. Decisions that are Tom's (ask, do not assume)

- **What students calculate now that the board shows numbers.** The board shows the force needed and what the machines give. Suggested: the route strip asks for each leg's total MA, Smooshy's pull and hand distance before GASA accepts the plan, and the board hides "Smooshy pulls" until then. Tom has not decided.
- **Hand travel.** The core board has a 2,500 m target that a three-leg cart and crane route overshoots (2,999 m). Is that pressure useful, and what should the number be?
- **Screw jack alone** lifting the Gumdrop up the cliff (52.5 N, about 780 m of turning): allowed on the core board. Tom has not objected.
- **Budget**: 475 crystals for now. The three-leg routes cost 240 to 332.
- **The tall-pole hoist** (section 3).
- **Three legs**: Tom wants the rescue completable in three legs, not counting the training rock.

## 6. How Tom wants the work done

- Low entrance, high ceiling. When a play-test finds a problem, remove a rule or make a rule visible. Do not add machinery to answer a complaint.
- Tests passing does not mean it plays well. After every stage: play it yourself with real pointer moves, take screenshots, look at them, then give Tom a build to play. He is the only real test.
- Bigger batches, honest status, no silence during long runs. Say plainly what was not verified.
- Student text: warm, natural full sentences at Grade 7 to 8 level. "Velocity" not "speed". No standards language, no "I can" statements, no fist emoji. Avoid "it isn't X, it's Y" and "that is what makes it worth doing" phrasing. Times carry "approx.".
- Sim HTML files live only in GitHub; the claude.ai project keeps small text docs. When the sim changes: rebuild, copy `dist/Force-HQ-offline.html` over `Force-HQ-Rebuild-offline.html`, commit, push, republish the Force HQ artifact at its existing link (https://claude.ai/artifact/2qHdjKcuWWAjgMkjZdqEcy), and send Tom the offline file. The core board has its own artifact link (above).
- Commit after each working change with a clear message. Do not merge to `main` until Tom has played and approved.

## 7. Things that bit us

- A finished test run's 1.2 s timer once cut the next test short. Any delayed hand-back must check it still belongs to the current run.
- A draw error inside the animation loop froze the whole board. Keep the loop's try/catch.
- Cards that sit on the board can cover the spot a student wants to tap. Keep them small, closable, and out of the working area.
- The old suite has timing-sensitive tests (`stage4_gasa`). Rerun a failure alone before believing it.
- The test build sets `FAST = true`, which skips the opening shot and keeps the whole-map view. Test real first-visit behaviour with `FAST=false`.
