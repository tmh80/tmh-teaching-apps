# Adapt Lab rebuild plan

Written 15 Nov 2026 by Claude (Fable) with Tom. This plan is carried out by later Claude sessions, one session a week, with no memory of this chat. Everything a session needs is in this file, the art prototype in `adapt-lab/prototype/`, and the skills in `.claude/skills/`.

## 0. How to run a session (read this first, every time)

Tom starts each session with: **"In tmh-teaching-apps, switch to the branch `adapt-lab-rebuild`, read `adapt-lab/docs/Adapt_Lab_Rebuild_Plan.md` and do the next session."**

This plan and the prototype live on the branch `adapt-lab-rebuild`, not on `main`, until Session 14 merges the finished rebuild. A copy of the plan is also in the claude.ai project "Apps and Sims"; the copy on the branch is the one to update.

1. Read this whole file. Find the first session in section 9 that is not ticked in the progress log (section 10).
2. Load `wab-science-sim-builder` and the companion skills that session names. If a skill cannot be loaded, tell Tom and stop.
3. Do that one session only. Do not start the next one, even if there is time left: finish the checks properly instead.
4. Run every check listed for the session. For anything visual, take screenshots and **look at them** before committing (section 4.4). If you cannot view images in this session, say so to Tom and do a non-art session instead.
5. Commit on the branch `adapt-lab-rebuild` with a clear message and push. Tom is a teacher, not a programmer: do all git work yourself and explain changes in plain language.
6. Update section 10 (progress log): tick the session, list what was done, what was not, and any question for Tom.
7. End with a short message to Tom: what changed, which file to open to see it, and his one job before next week (if any).

Rules that apply to every session:
- The current `adapt-lab/Adapt-Lab-offline.html` stays as the Toddle file until Session 14 swaps it. Never break it.
- Do not rewrite the science model. Port it and test that it gives the same numbers (Session 1). Changes to the model happen only where this plan says so.
- Grade 6 readers: short sentences, everyday words, one idea per sentence. Read every block of student text aloud in your head.
- If a session turns out too big, stop at a working point, commit, and write in the log exactly where you stopped. A half session that works beats a full one that does not.

## 1. Decisions already made

- **Grade 6** (MYP Year 1), one class. The README used to say G7/8; that was wrong and is fixed.
- **Taught in March 2027.** Target: classroom-ready by the end of February 2027.
- **The skills that go with the content** are data analysis, presenting data, and writing a CER paragraph (claim, evidence, reasoning), with scaffolds that teach each one (section 7).
- **Keep the science model. Rebuild the art, the layout and the game loop.**
- **Graphics are the top priority.** Tom has never been happy with how his sims look. Section 4 exists to fix that for good.
- It can be a long project: about one session a week.

## 2. What Adapt Lab is now (audit, 15 Nov 2026)

One file, `adapt-lab/Adapt-Lab.html` (3,871 lines), wrapped as `Adapt-Lab-offline.html`. No source folders, tests, brief or backlog. Teacher code is `WABSCI` (the skill says it should be the first word of the name: `ADAPT`).

Six tabs: Challenge (5 foundation missions, 3 food web missions, speciation), Create, Run, Food web, Conservation, Story.

**Strong, keep:**
- Animal and plant survival model: five pressures, four seasons, six biomes (`animalScores`, `plantScores`, `seasonHaz`, `yearSurvival`, `lethalOf`, lines 999–1297).
- Real predators per biome and how each hunts (`PRED_BANK`, `vulCore`, lines 1017–1081).
- The evolving population: 20 individuals, inherited variation, births, deaths by cause, events (lines 2363–2946).
- Food web model with knock-on effects and energy pyramid (lines 3027–3246).
- Real-organism presets, classification ("Most like a…"), real-world checks.
- Story mode cards and the first version of a change cost, `evoCost` (lines 3539–3548).

**Weak, replace:**
- Creature drawing (`drawCreature`, lines 1530–1767): ovals on straight peg legs, one shared face, spiky fur. Every mammal looks like a sheep.
- Run scene: identical sprites sliding in a clump, overlapping death labels, ground colour flipping about once a second.
- The first Run fails: the default animal in the default biome (tundra) has 0% survival and is extinct in generation 1.
- Create is about 2,000 px tall, with choices top-left and feedback far below.
- Three navigation systems at once (six tabs, a Guided/Explore switch, mission pop-ups).
- Guided mode is a side panel that says "write in your notebook". No predictions, questions, hints or Checks inside the sim.
- XP prices the finished animal, not the change. Trait combinations exist in the maths but students never see them.

**Missing against the skill:** name gate, Journal (Runs, Notes, Vocab), calculator, glossary (31 words, needs 50–80), predict-before-run, hint ladders, Check reviews, worksheets, teacher page, Toddle marking, `src/` with a build and tests.

## 3. The new Adapt Lab in one paragraph

Students take a small ancestor species into a biome and guide it through deep time. They watch a living herd, read real data from it, and spend limited evolution points on changes: small steps are cheap, new body designs are expensive, and traits that work together pay off. Taught chapters use the same simulator with fewer controls and teach one idea each, ending in a Check and a worksheet. Every chapter also teaches one data skill, building up to a full CER paragraph written from the student's own results.

## 4. Art direction (the most important section)

### 4.1 Why the old art failed, and the rule that fixes each cause

| Cause | Rule from now on |
|---|---|
| Animals were assembled from separate parts chosen trait by trait, so no combination was ever designed. | **Design body plans, not parts.** Each body plan is one jointed rig with a designed silhouette. Traits change its proportions and colours. |
| Soft gradients, blur and fur spikes on simple shapes look cheap. | **Flat fills, no outlines, three tones** (base, shade, belly) plus one dark. Parts of the same colour overlap and merge into one clean silhouette. |
| Nothing moved except sliding. | **Movement sells it.** Legs step, bodies bob, eyes blink, ears twitch, tails sway. Step length matches ground speed so feet never slide. |
| Backgrounds were one flat band. | **Layers:** sky, sun glow, three ridges, ground, scattered details sorted by depth, weather, a dark foreground fringe. |
| Nobody looked at the result while building. | **Look before you ship** (section 4.4). No art is committed without viewing a screenshot and scoring it. |
| Art was squeezed in beside everything else. | **Art gets its own sessions** (2, 3 and 4) that do nothing else. |

### 4.2 The prototype is the target

`adapt-lab/prototype/` holds a working proof made on 15 Nov 2026:
- `rig.js`: five rigs (`drawQuad`, `drawBird`, `drawFish`, `drawLizard`, `drawInsect`), drawing helpers, and `specOf(traits)`, which turns Adapt Lab's own trait object into a rig spec. Predators use the same rigs as prey.
- `scene.js`: a gallery of 16 animals, a variation strip with a generation slider, and a living scene for tundra, savanna and ocean.
- `Adapt-Lab-Art-Prototype.html`: the built single file (`node build.js`). Open it to see the target.

**Port this code. Do not start again.** When adding to it, match its look exactly.

Helpers to reuse for everything: `smooth` (organic closed shape through points), `tube` (variable-width body along a spine: necks, tails, lizards, snakes, fish, stems), `seg` (tapered limb), `ik` (two-bone leg), `step` (footfall), `leaf`, `eye`, `pattern`, `shadow`.

One trap already solved: when several shapes share one path, they must all wind the same way or the browser cuts holes where they overlap. `smooth`, `seg` and `leaf` already force this. Keep it that way in new helpers.

### 4.3 Recipe for adding a body plan

1. Find three side-view photos or diagrams of real animals of that plan. Write down, in words, the five things that make the silhouette recognisable (for a frog: squat body, eyes on top of the head, folded Z-shaped back legs, wide mouth, no neck).
2. Write `draw<Plan>(c, spec, pose)` in local units: faces right, feet on y = 0, body about 100 units long. Order: far limbs in shade, tail, body, markings clipped to the body, near limbs, face.
3. Add the plan to `planOf` and `specOf`, so it is driven by real trait values. Add two real animals to the gallery.
4. Give it one movement cycle that fits the animal (hop, scuttle, slither, paddle) and an idle (breathing, blink).
5. Run the screenshot loop (4.4). Fix and repeat, three rounds at most, then log what is still wrong.

Body plans: done are four-legged, bird, fish, lizard, insect. Still to do:

| Plan | Chosen when | Real examples for the gallery |
|---|---|---|
| Frog | moist skin, four legs | wood frog, common frog |
| Crab | exoskeleton, gills or hard shell | shore crab |
| Snake / legless | scales or skin, no legs, no fins | rattlesnake (also a predator) |
| Sea mammal | fur, fins, streamlined | harbour seal, otter |
| Winged insect in flight | exoskeleton, wings that fly | locust swarm |
| Plants (four growth forms) | grass or herb, shrub, tree, fleshy stem | all eight plant presets |
| Big predators | from `PRED_BANK` `kind` | wolf, cat, lion, owl, raptor, shark, heron, pike |

Plants need roots shown below a ground line, because root depth and spread are traits students change.

**Every trait a student can change must change the picture.** Check this list in Session 2: body size, leg length, ear size, tail length, coat thickness, fat, hump, body shape, colour (9), pattern (4), wings and wing size, fins and fin size, eye size, spines, shell, poison (warning colours), covering (fur, feathers, scales, moist skin, exoskeleton). Behaviours show as actions in the scene, not on the body: night activity (dark sky, animals out), hiding (duck into burrows), herds (stay close), freezing, fleeing, hibernating, migrating, food storing, caring for young.

Known flaws in the prototype to fix in Session 2: the flying wing reads as a leaf shape; heads do not reach the ground when short-necked animals graze; the herd sometimes bunches; no young animals; carnivore snouts are a little long; zebra legs have no stripes.

### 4.4 Look before you ship (do this for every art change)

1. Build the gallery page and screenshot it with Playwright at 1100 px and 390 px wide (a script like `/tests/art_shots.js`; the method is in the progress log for 15 Nov).
2. Tile the screenshots into one contact sheet and **view the image**.
3. Score it. Every line must be a yes:
   - Could a Grade 6 student name each animal from its outline alone?
   - Does each animal have a clear head, eye and feet, with nothing floating or detached?
   - Are there no seams, holes or stray lines where shapes overlap?
   - Do the far-side legs read as behind the body?
   - Do two animals of the same plan with different traits look clearly different?
   - Do the colours sit well on every biome background?
   - In the scene, can you tell prey from predator at a glance, and is no label overlapping another?
   - Is anything on screen sliding without stepping?
4. Fix what failed and repeat. Stop after three rounds and log what is left.
5. Compare with Tom's reference pictures in `adapt-lab/docs/reference/` if he has added any.

### 4.5 Scene rules

- One generation lasts at least 6 seconds at normal speed. Seasons cross-fade over about a second; the ground never snaps from one colour to another.
- The picture and the maths are separate. The model decides who lives; the scene acts it out with some delay. Never tie the model's tick to the frame rate.
- At most about 40 animals drawn in full. A bigger population shows as 40 animals plus the number.
- Deaths: the animal plays a short action (caught, lies down, fades), with one small icon. Words go in a tally beside the scene, not floating over it.
- Births: a young animal (smaller body, bigger head, shorter legs) appears beside a parent.
- Predators stalk, chase and sometimes miss. A chase is the most watchable thing in the sim; give it room.
- Events show in the scene: snow line moving, grass drying, fire glow, flood water, a new predator walking in.
- Respect `prefers-reduced-motion`. Keep 60 frames a second on a school laptop: draw far animals with fewer details.

### 4.6 Charts

Load the `dataviz` skill before changing any chart. Charts use the same flat style, one clear title in words a student would say, labelled axes with units, and a tap-to-read value on every point. Fewer charts at once: one main chart, others behind tabs.

## 5. Game design

### 5.1 The loop

1. **Choose a biome and meet your ancestor.** Each biome has a small, plain ancestor that survives there, but only just (target 50–65% a year). No blank sheet, no instant extinction.
2. **Release and watch an era** (about 20 generations). The herd lives in the scene. The student pauses, takes snapshots and types readings into a table.
3. **Read the report:** population over time, causes of death, traits that shifted by themselves through selection.
4. **Spend evolution points** on changes for the next era.
5. **The world changes** (an event card), then back to step 2. Six eras make a game.

Points are earned from how the population did in the last era, so reading the data well is how you win.

### 5.2 Cost of change: distance, not a price list

Replace `buildCost` (line 2215) and extend `evoCost` (line 3545).

- **Number traits** (size, leg length, ears, coat, fat and so on): 1 point per 10 units moved.
- **Choice traits** get a neighbour map. Cost = number of steps along the map. Example for body shape: `round – long – streamlined` and `round – tall`, so round to streamlined costs 2 steps and tall to streamlined costs 3. Colour already has a neighbour map inside `childOf` (lines 2467–2468); reuse it.
- **Behaviours** cost 1 per step. **Body features** cost 2 per step. **Defences** (spines, poison, shell) cost 3.
- **Body plan changes** (covering, body heat, breathing, number of legs, wings) are the expensive ones: 8 points, and only between neighbouring plans: `fish – frog – lizard – bird` and `lizard – mammal`. `EVO_LOCK` currently forbids these completely; change it to "allowed but very costly".
- Show the price on every option before it is chosen, and show the running total as "this era: 7 of 10 points".

Write a test: cost is zero for no change, the same in both directions, and never smaller for a bigger change.

### 5.3 Traits that work together

Add one data table, `COMBOS`, of about 25 pairs. Each has two conditions, a bonus or penalty, and one sentence a Grade 6 student can read. The designer shows them as green "Works well together" and red "Clashes" chips. Starter list (many already exist inside `animalScores` and `vulCore`; move them into the table so they are visible and testable):

| Pair | Effect | Reason shown |
|---|---|---|
| Active at night + big eyes | finds more food | Big eyes gather more light in the dark. |
| Active at night + hunts by sight + small eyes | clash | It cannot see its food in the dark. |
| Freezes + good camouflage | safer | Standing still only works if you blend in. |
| Freezes + bright colour | clash | It stands still where everyone can see it. |
| Escapes fast + long legs | safer | Long legs make a fast runner. |
| Escapes fast + heavy shell or thick fat | clash | It is too heavy to run. |
| Hides away + small body | safer | Small animals fit into burrows and cracks. |
| Hides away + huge body | clash | Nowhere is big enough to hide. |
| Lives in a group + stripes (grassland) | safer | A predator cannot pick out one animal. |
| Lives in a group + caring for young | more young survive | Many adults watch for danger. |
| Hibernates + fat store | survives winter | Fat is the fuel for a long sleep. |
| Hibernates + no fat + small body | clash | It runs out of energy before spring. |
| Migrates + wings or long legs | arrives safely | It can travel far without tiring. |
| Migrates + short legs, no wings | clash | The journey is too far. |
| Poison + bright colour or bold pattern | safer | Predators learn the warning. |
| Poison + camouflage | weaker | Predators never learn to leave it alone. |
| Stores food + stays active in winter | survives winter | It has food when there is none to find. |
| Cold-blooded + active by day | warms up | It basks in the sun to get moving. |
| Cold-blooded + active at night (cold biome) | clash | Nights are too cold for it to move. |
| Eats animals + smell or big eyes | catches more | It finds prey before prey finds it. |
| Thick coat + small ears + big body | keeps heat | Less surface for heat to escape. |
| Big ears + desert + night | keeps cool | Ears give off heat; nights are safer. |
| Streamlined + fins | fast swimmer | Smooth shape and paddles work together. |
| Lungs + lives in water + slow swimmer | clash | It cannot reach the surface in time. |
| Few young with lots of care + safe biome | steady population | Each young has a good chance. |

Rules: the effect must change the survival bars, not only the chip. Each chip names both traits. Check every sentence against real biology before shipping.

### 5.4 The misconception this game must not teach

The danger of "spend points to adapt" is the most common wrong idea in evolution: that animals change because they need or want to. Guard against it everywhere:
- Say "over thousands of years, these variations spread" and never "your animal decides to grow". The points stand for which variations happened to appear and be passed on.
- The Run always shows the real mechanism: individuals differ, some die, survivors have young, the average shifts.
- Checks ask "Did any single animal change during its life?" more than once, in different settings.

Misconceptions to plan questions around (each targeted at least twice): individuals adapt during their own lives; animals adapt because they need to; evolution means getting bigger and stronger; every feature is an adaptation; an adaptation that helps in one place helps everywhere; extinct species "failed to try"; a behaviour is always a choice.

## 6. Chapters

Each chapter has a Foundation and an Extension of approx. 20–30 minutes: Learn steps (do it, predict, observe, then the idea), an optional Challenge, a Check of 5–10 questions, a stamp and a worksheet. The free simulator ("Evolution Lab") opens after Chapter 1 Foundation.

| Ch | Topic | Uses from the old app | Data skill taught (section 7) |
|---|---|---|---|
| 1 | Biomes and survival pressures | Mission 1 | Read a bar chart; say the biggest and smallest |
| 2 | Physical and behavioural adaptations | Missions 2, 3, 5 | Complete a results table; say what changed and what stayed the same |
| 3 | Adaptations work together, and every one has a cost | Create course step 2, `COMBOS` | Read a line graph; describe a trend in a sentence |
| 4 | Variation and natural selection | Run, Create course step 4 | Record your own data in a table; plot it with the graph maker |
| 5 | When the environment changes | Events, Story mode | Compare two runs; first full CER with sentence starters |
| 6 | Food webs and energy | Food web tab and missions | CER with words to use only |
| 7 | People and conservation | Conservation course | CER unaided, then judge someone else's CER |

Chapters 1–5 must be ready for March. Chapters 6 and 7 can slip: the old app still covers them.

Before any chapter is built, its script goes in `adapt-lab/docs/chapters/` with the question plan the skill requires (key idea or misconception → question type → Learn or Check).

**Open builders** (skill section 4e): the species designer, and a food web builder where students drag the arrows. **Research questions** (section 4f): about twelve open questions in three levels, answered with the journal, table maker, graph maker and a CER.

**Concept and metaphor.** The skill says each sim needs its own. Tom picks one before Session 8:
1. *Field station:* a map of six biome stations; each chapter is an expedition, and the Journal is a field notebook.
2. *Deep time:* a timeline you travel along, era by era, with your species' family tree growing behind you.
3. *Species passport:* each species you raise earns stamps for every biome and event it survives.
4. *Ark seed bank:* you are restocking damaged biomes with species that can cope.

## 7. The skills thread: data and CER

This is the purpose Tom named, so it is built in, not added on.

**Students collect their own numbers.** The sim never fills a table in. Students pause the Run, read a value and type it (checked within a small tolerance). Reuse `shared/table-graph-maker.js` and the Tilt Lab journal, table maker and graph maker (skill section 4f).

**The CER writer** is one reusable component:
- **Claim:** one sentence answering the question.
- **Evidence:** numbers from the student's own tables or snapshots. The component checks that at least two of the numbers typed really appear in their recorded runs, and names the run.
- **Reasoning:** links the evidence to the science idea, with "Words to use" chips.
- After submitting, it locks and shows a model CER beside theirs with a "Did you include…?" checklist they tick (the skill's explain-question pattern).

**The scaffold fades** across the chapters:

| Stage | Chapter | Support |
|---|---|---|
| 1 | 3 | Sort six mixed sentences into Claim, Evidence, Reasoning |
| 2 | 4 | Pick the claim; fill gaps in the evidence with their own numbers; pick the reasoning |
| 3 | 5 | Sentence starters for all three parts |
| 4 | 6 | Words to use only |
| 5 | 7 | A blank box, then mark a made-up student's CER with the checklist |

**Graph skills ladder:** read a value → find the highest and lowest → describe a trend → compare two lines → choose the right graph type → build the graph from their own table → use the graph as evidence.

MYP strands stay off student screens. These skills sit in Criterion C (processing and evaluating) as well as A. **Question for Tom before Session 9:** the skill's strand table lists A and D only; confirm the Year 1 Criterion C wording to tag (Sparks already uses C ii and C iii).

## 8. Files and build

```
adapt-lab/
  Adapt-Lab-offline.html        the Toddle file (old app until Session 14)
  Adapt-Lab.html                old source, kept for reference
  prototype/                    art prototype (the visual target)
  src/
    index.html  tokens.css  app.css  fonts.css
    js/00-util.js
    js/10-data.js               biomes, traits, presets, predators (ported)
    js/11-model-animal.js  12-model-plant.js  13-hazards.js  14-run.js  15-foodweb.js
    js/16-cost.js  17-combos.js
    js/20-rig.js  21-plans-*.js  22-plants.js  23-scene.js  24-biomes.js
    js/30-shell.js ...          journal, calculator, glossary, questions (ported from Force HQ)
    js/40-designer.js  41-lab.js  42-data-tools.js  43-cer.js
    js/50-ch1.js ...            chapters (text in one content module)
    js/60-worksheet.js  62-teacher.js  99-init.js
  build.js                      makes Adapt-Lab-Rebuild-offline.html and dist/test.html
  tests/                        node tests and Playwright scripts
  docs/                         this plan, brief, backlog, chapter scripts, reference pictures
```

Reuse, do not rebuild: `force-hq-rebuild/src/js/20-shell.js`, `21-calc.js`, `22-glossary.js`, `23-cards.js`, `24-runs.js`, `35-questions.js`, `36-qtypes.js`, `50-review.js`, `58-myp.js`, `60-worksheet.js`, `61-pdf.js`, `62-teacher.js`, `70-backup.js`, plus `force-hq-rebuild/build.py` as the build pattern and `force-hq-rebuild/tests/` as the test pattern. `shared/table-graph-maker.js` for tables and graphs.

Debug hook for tests: `window.__adapt`. Teacher code: `ADAPT`. The offline file makes no internet requests.

## 9. Sessions

Fifteen weeks run from the week of 16 Nov 2026 to the end of February 2027. There are 14 sessions and one spare week. Sessions 2, 3, 4 and 5 decide how the sim looks and feels: use the most capable model available for those.

**Session 1 · Foundations: source folders, build, and the model ported unchanged**
Skills: `wab-science-sim-builder`.
- Create `src/`, `build.js`, `tests/`. Split the old file's model code into the `js/1x` files without changing a line of maths.
- Make a golden test: run the old functions on all 24 presets in all 6 biomes and save the scores; the ported code must match exactly. Do the same for a seeded 40-generation run.
- Write `docs/Adapt_Lab_Brief.md` and `docs/Adapt_Lab_Backlog.md`.
- Checks: golden tests pass; `node --check` on every file; build produces a page that loads with no errors.
- Tom's job: put 2–3 screenshots of programs whose look he likes into `adapt-lab/docs/reference/` (or send them in chat), and pick a concept from section 6.

**Session 2 · Art 1: finish the animal rigs**
- Move `prototype/rig.js` into `src/js/20-rig.js`. Fix the known flaws (4.3). Add frog, crab, snake and sea mammal with the recipe.
- Add young animals. Make sure every trait in the 4.3 list changes the picture.
- Build `tests/art_shots.js` and a gallery page showing every preset and every predator.
- Checks: the 4.4 rubric on the full gallery; all 16 animal presets and all predators in `PRED_BANK` draw from their real data.

**Session 3 · Art 2: plants, actions and behaviours**
- Plant rigs for the four growth forms with roots, leaves, spines, wax shine, storage, seasons (leaves dropping, dying back).
- Actions: graze, drink, sleep, hide in a burrow, freeze, flee, huddle, bask, carry food, feed young; die and be born.
- Checks: the rubric; all 8 plant presets; each behaviour trait has a visible action.

**Session 4 · Art 3: six biomes that feel alive**
- Port `prototype/scene.js`. Six biomes, four seasons with cross-fades, day and night, weather, event looks (4.5).
- Herd behaviour, predator stalk and chase, the 40-animal cap, level of detail.
- Checks: the rubric on every biome in every season; frame time under 16 ms with 40 animals; phone width.

**Session 5 · The designer on one screen**
Skills: add `wab-sim-open-builders`.
- New layout: big animal in the middle, trait groups as tabs beside it, survival bars always in view, no scrolling on a laptop.
- Ancestors for six biomes. Cost by distance (5.2). `COMBOS` chips (5.3). Undo, reset, compare with a real organism.
- Checks: cost tests; every ancestor survives 50–65% in its biome; every `COMBOS` row changes a survival bar; phone, tablet and laptop screenshots.

**Session 6 · The Evolution Lab loop**
- Eras of about 20 generations, pacing rules (4.5), era report, spending step, event cards from Story mode, six-era game with an end screen.
- Pause, step back and forward, snapshot to the Journal.
- Checks: a seeded game plays start to end by script; no path leaves a student stuck (redo era, go back, start again).

**Session 7 · Data tools and the CER writer**
Skills: `dataviz`, `wab-sim-open-builders`.
- Restyle charts (4.6). Reading tables the student types into. Port the table maker and graph maker. Build the CER writer (section 7).
- Checks: typed readings are checked against the student's own run; the CER evidence check finds real and made-up numbers correctly; graph maker works with mouse and touch.

**Session 8 · The shell**
Skills: all three companions.
- Name gate, home screen in Tom's chosen concept, Journal (Runs, Notes, Vocab), calculator, glossary of 50–80 words, question engine, progress and stamps, save.
- Checks: the skill's name-gate, journal and pop-up drag tests.

**Session 9 · Chapter scripts and question plans (writing only, no code)**
Skills: `wab-sim-review-questions`.
- Scripts for Chapters 1–5 in `docs/chapters/`, each with its question plan, misconceptions, model answers and data skill.
- Tom's job: read the scripts and send changes before Session 10.

**Sessions 10, 11, 12 · Build Chapters 1–2, then 3–4, then 5**
- Checks each time: the skill's question-plan script, one-go locking, every Check question taught in Learn, a half-finished playthrough.

**Session 13 · Worksheets, teacher page, Toddle marking**
Skills: `wab-sim-toddle-outputs`.

**Session 14 · Test as a Grade 6 student, fix, and swap**
- A fresh agent that has not seen the build plays through as a confused Grade 6 student and lists every unclear moment. Fix them.
- Offline build, no network requests, README updated, the rebuild becomes the Toddle file, old file kept as `Adapt-Lab-old.html`.

**Later (after March if needed):** Chapters 6 and 7, the food web builder, research questions, flashcards.

## 10. Progress log

- [x] **15 Nov 2026 · Audit, plan and art prototype (Fable).** Audited the app by reading the code and screenshotting every tab. Built `prototype/` (five rigs, gallery, variation strip, three living scenes) and checked it by screenshot over three rounds. Wrote this plan. Fixed Grade 6 in the README and the skill. Screenshot method: a Node script using Playwright (`/opt/npm-tools/node_modules/playwright`, Chrome at `/usr/bin/google-chrome`, `--no-sandbox`), `element.screenshot()` on each canvas, then `sharp` to tile them into one sheet to view. Not done: nothing in `src/` yet.
- [ ] Session 1
- [ ] Session 2
- [ ] Session 3
- [ ] Session 4
- [ ] Session 5
- [ ] Session 6
- [ ] Session 7
- [ ] Session 8
- [ ] Session 9
- [ ] Session 10
- [ ] Session 11
- [ ] Session 12
- [ ] Session 13
- [ ] Session 14

Open questions for Tom: concept choice (section 6); Criterion C strand wording (section 7); reference pictures (Session 1).
