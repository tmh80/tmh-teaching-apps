# Adapt Lab brief

What a new Claude session needs to know before touching Adapt Lab. The step-by-step plan is `Adapt_Lab_Rebuild_Plan.md`; this file is the map.

## What it is

A Grade 6 (MYP Year 1) simulation about adaptations and evolution, taught in March 2027. Students guide a species through a biome over many generations, read real data from a living scene, and write about it with a claim, evidence and reasoning. Teacher code for the rebuild: `ADAPT` (the old app uses `WABSCI`).

## Where things are (branch `adapt-lab-rebuild`)

| Path | What it is | State on 15 Nov 2026 |
|---|---|---|
| `Adapt-Lab-offline.html` | The Toddle file students use today (old app) | Unchanged. Do not break it |
| `Adapt-Lab.html` | Old single-file source | Reference only |
| `src/js/00-util.js` to `18-classify.js` | The science model, moved out of the old file | Proven equal to the old app by tests |
| `src/js/14-run.js` | The evolving population, with no drawing in it | Proven equal for five species to generation 50 |
| `src/js/15-foodweb.js`, `19-notes.js` | Food web model, the explanation sentences | Moved, not yet tested |
| `src/js/16-cost.js`, `17-combos.js` | Cost of change, traits that work together | See the progress log |
| `prototype/` | The new art and screens, as working pages | See the progress log |
| `tests/` | `sh tests/run_all.sh` runs everything | Model and run tests pass |
| `docs/` | Plan, this brief, backlog, chapter scripts, CER design | |

## The model in one page

Everything attaches to one object, `AdaptModel` (in the browser `window.AdaptModel`; in Node, `require` the files in order).

- `BIOMES`, `PRESETS`, `DEF_A`, `DEF_P`, `A_SECTIONS`, `P_SECTIONS`, `PRED_BANK`: the data.
- `scoresFor({kind,t}, biome)`: survival scores (0–100) for each pressure, plus the detail behind them.
- `seasonHaz`, `yearSurvival`, `lethalOf`: chance of dying each season, chance of surviving a year, and deadly mismatches.
- `classify(t)`, `realChecks(t)`: which animal group a design is most like; what is unrealistic about it.
- `newRun(org, biome, opts)`, `runGenerations(n)`, `skipAhead()`, `getRun()`: the evolving population. A run holds `pop` (individuals with their own traits), `hist` (population each year), `deaths` (by cause), `traitHist`, `born`, `died`, `preds`.
- `fwBuild`, `fwStep`: the food web.

One trap: the old app's animated mode and its instant mode use the random numbers in a different order, so they give different histories. The tests compare against instant mode (pause, then skip).

## The art in one page

`prototype/rig.js` draws every animal from its trait numbers with jointed rigs in a flat three-tone style. Built-in plans: four-legged, bird, fish, lizard (and tortoise), insect. Plug-in plans in their own files: frog, crab, snake, sea mammal. `zoo-predators.js` draws every predator in `PRED_BANK`. Poses: `{t, phase, move, headDown, blink, lie, sleep, fly, flap}`. `Rig.youngOf(spec)` makes a young animal. The style rules and the screenshot check are in sections 4.1 to 4.4 of the plan. Never commit art without looking at a screenshot of it.

## What must not break

- The numbers the model gives (the tests guard this).
- The offline file must make no internet requests.
- Grade 6 reading level on every student screen.
- Standards and MYP strands never appear on student screens.

## Credits

All art is drawn in code; no outside images or libraries are used in the prototype. The old app embeds jsPDF 2.5.1 and three fonts (Atkinson Hyperlegible, Bricolage Grotesque, IBM Plex Mono).
