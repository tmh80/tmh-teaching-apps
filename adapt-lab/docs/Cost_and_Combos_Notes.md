# Cost of change and traits that work together: notes for Tom

Written 22 Nov 2026 (Session 1). These are science judgements, so please read them and say if anything feels wrong. The code is `src/js/16-cost.js` and `src/js/17-combos.js`. The tests are `tests/cost.test.js` and `tests/combos.test.js`.

## 1. What a change costs

Students get **10 evolution points per era**. The idea is that small steps are cheap and big redesigns are expensive.

| Kind of change | Examples | Price |
|---|---|---|
| A number trait | body size, leg length, coat, fat, ears, tail, eyes | 1 point for every 10 units moved (at least 1) |
| A behaviour | when it is active, what it eats, freeze / hide / flee, herds, care for young | 1 point per step |
| Colour or pattern | brown → grey, plain → stripes | 1 point per step |
| A body feature | body shape, where fat is stored, posture, fins | 2 points per step |
| A defence | spines, poison, shell | 3 points per step |
| A body-plan feature | covering, warm or cold blood, breathing, number of legs, wings | 4 points per step |

"Steps" follow a map of neighbours. For example, body shape is `round – long – streamlined` and `round – tall`, so round to streamlined is 2 steps (4 points) and tall to streamlined is 3 steps (6 points). Colours follow the same map the old Run used for colour mutations, so white → grey is one step and white → orange is several.

**Body plans** follow the family tree: `fish – frog – lizard – bird` and `lizard – mammal`. Moving a whole plan one place along the tree costs 8 points or more, so it takes most of an era. Insects and crabs are a separate branch: a vertebrate can never become one, and the reverse.

**Questions for you**
1. Is 10 points per era about right? With it, a student can make about three or four small changes, or one body-plan step.
2. Should poison cost the same as spines and a shell (3)? It is a chemical change, not a body part.
3. Should insects and crabs be reachable at all? Now they are not, which matches real biology.

## 2. Traits that work together, and traits that clash

There are **30 pairs**. Each shows in the designer as a green "Works well together" or a red "Clashes" chip, names both traits, and gives one sentence of reason. The full list is in `src/js/17-combos.js`.

**Most pairs (27 of 30) were already inside the old science model.** The table only makes them visible. Three pairs were not in the old maths, so they add a small effect of their own:

| Pair | Effect on the predator bar | Why the size |
|---|---|---|
| Hides away + small body | +10 | Enough that hiding beats the same animal at medium size |
| Hides away + huge body | −20 | The old model makes big animals safer from predators. Without −20, a huge animal that hides still looked safer than a medium one, which hid the clash |
| Lives in a group + cares for young | +5 | Kept small: the group already helps in the old model |

**What the new test checks.** For every pair there is a demo animal, and one change that switches the pair off. The test scores both with the old model and checks that the named survival bar goes **up** for a good pair and **down** for a clash. On the first run, three pairs failed and were fixed this session:
- *Hides away + huge body* and *Hides away + small body*: the effects were too weak to see. Now −20 and +10.
- *Wings that fly + huge body*: the old model does not punish a huge flyer whose wings are big enough. It only punishes wings that are **too small for the body**. The pair is now "Huge body + wings too small: Its wings are too small to lift such a heavy body." This matches both the model and real birds (the biggest flying birds have enormous wings).

**Pairs from the plan that are not in the table yet**
- Poison + camouflage ("Predators never learn to leave it alone"). The old model does not link these, so it would need a new effect.
- Few young with lots of care + a safe biome. This one is about population numbers over many years, so it belongs in the Run, not on a survival bar.

**Questions for you**
4. Are you happy with the three added effects (+10, −20, +5)?
5. Do you want the two missing pairs, knowing they would be new rules, not ones from the old model?

## 3. One thing to know

Because three pairs add an effect, a few survival numbers now differ slightly from the old app. For example, the plains zebra in the savanna shows 78% a year in the new build (old app: 77%), because it lives in a herd and cares for its young. The science model itself is unchanged, and the golden tests still check it against the old app without the pairs added.
