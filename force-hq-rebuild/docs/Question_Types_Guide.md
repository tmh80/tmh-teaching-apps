# Force HQ: question types guide (for the coding model)

Written 28 Oct 2026 for Chapter 5 (the Drop Zone). Read this with `Force_HQ_Handoff.md` (rules, script format), `Force_HQ_Brief.md` (file map) and Backlog item 5 (Tom's Drop Zone decisions). Tom is the teacher; explain what you built to him in plain language.

**Why this file exists.** Tom wants more variety in the question types, and he wants Chapter 5 to make students *observe*: watch the free-body diagram beside the falling object, pause at chosen moments to read the forces, and answer questions about how the arrow sizes change over the fall. The current engine has 11 types, and two of them (`num`/`reading` 88 uses, `mcq` 38 uses) carry most of the load. This file says which new types to build, how each fits the existing engine, and where each one is used in Chapter 5.

---

## 1. What the research says (short version)

- **Make every wrong option mean something.** Diagnostic questions work when each wrong answer maps to one misconception, and a student who holds the misconception cannot get the question right by luck. Test one idea per question. (Craig Barton / Eedi, "What makes a good diagnostic question"; Chartered College, hinge questions.) This matches the existing "no specificity pattern" rule.
- **Ask for the reason as well as the answer.** Two-tier and three-tier diagnostic tests add a "why" tier (and sometimes a "how sure are you" tier) so a right guess is told apart from real understanding. Students often choose the right answer for the wrong reason.
- **Predict, observe, explain.** Simulation-supported POE tasks beat traditional POE in a controlled study with Grade 9 students. Force HQ already has `predict`; Chapter 5 should end each observation with an explain or reason question.
- **Spot the mistake, with an explanation.** A 2025 meta-analysis (42 papers) found learning from erroneous examples has a small positive effect, and the effect is larger when students get an explanation or a self-explanation prompt. So every "spot the mistake" item shows a short explanation after it locks.
- **Typed answers beat multiple choice for retrieval.** A lecture study found a lasting testing effect for short-answer questions and none for (easy) multiple-choice ones. Keep choice questions for misconception targets; use typed and built answers elsewhere.
- **Graphs and force diagrams together.** The IOP's advice on the "a force is needed to keep moving" misconception: pair motion graphs with force diagrams, and challenge the idea many times in varied contexts.
- **The Drop Zone misconceptions to target** (each needs at least one item whose distractors come from it):
  1. A parachutist moves *upwards* when the canopy opens (from skydiving videos filmed by a falling camera). In fact they keep moving down, just more slowly.
  2. Students focus on one variable (for example only the area) when reasoning about terminal velocity, and forget it happens when air resistance equals the weight.
  3. "Mass doesn't appear in the air resistance formula, so mass doesn't matter." It matters because terminal velocity is where air resistance balances the weight.
  4. Steady velocity needs a resultant force downwards (the "force keeps it moving" idea). At terminal velocity the resultant is zero.
  5. Heavier objects always fall faster (true in air for the same shape, false with no air).
  6. Air resistance acts downwards, or acts on still objects.
  7. Weight changes during the fall. (Weight stays the same; only air resistance changes.)
  8. Weight is the same on every planet (mixing up mass and weight).
- **Question formats that exist** (the QTI standard and US state science tests): choice, multi-select, order, match/associate, gap match, inline drop-down choice, typed text, hot text (tap a line), hotspot / select point (tap a place on a picture or graph), graphic gap match (drag labels onto a picture), slider, bar-graph input, extended text, drawing. Force HQ has choice, multi-select, match, typed gaps, typed numbers, tables, sort, extended text and the FBD builder. Missing and useful here: **order, inline drop-downs, tap a line, tap a point on a graph, bar-graph-style graph sketching**, plus the science formats **two-tier with reason**, **concept cartoon ("who's right?")**, **spot the mistake** and **always, sometimes or never**.

Sources: see section 7.

---

## 2. Observation tools the questions depend on (build these first)

Tom asked for an obvious pause button and the free-body diagram beside the drop.

1. **Live FBD beside the falling object**, always on in the Drop Zone, with the weight arrow (down) and the air resistance arrow (up, `FTYPES.airres`) drawn to scale, plus the resultant. Labels show values in newtons. Weight stays the same length all fall; only air resistance grows or shrinks. On other planets the weight arrow uses that planet's g.
2. **A big, obvious ⏸ Pause button** right next to the Drop button (Tom: action buttons go beside where the student clicks). The label switches to ▶ Play. Spacebar also toggles it. While paused, show "Paused at t = 6.4 s" across the arena and **step buttons** ("◀ 0.5 s" / "0.5 s ▶") so a student can land on a chosen moment. Stepping back needs the run's stored history (record every 0.1 s; interpolate).
3. **📸 Snapshot** button (enabled while paused): saves the moment to the Journal's Runs tab with a plain sentence ("At 6.4 s the parachutist was falling at 41.2 m/s, 1,860 m up. Weight 686 N, air resistance 466 N.") and chips. Store snapshots in `DB` (for example `DB.dz.snaps`, latest 50), with: run id, object, planet, air %, canopy state, t, height, v, a, W, D, R. Questions check against snapshots, never against a value recomputed from scratch, and a question never forces a re-run.
4. **Force–time strip** (an optional panel, added in a later step through `adds`): a small graph that draws the weight line and the air-resistance line as the run plays. It makes "the arrows meet" visible as two lines meeting, which the trend questions use.
5. **Masks**: in steps where a student must work out the resultant (W − air resistance), mask the resultant label with "?" until the question is answered, the same way `sledMasked` and `spaceMasked` work.
6. Every snapshot and run needs `runMark`/`runTick`/`runEnd` calls, a `runText` sentence and `runChips` (see section 3 of the Handoff).

---

## 3. New question types to build

Build them in this order. Each is a new entry in `QT` (`src/js/35-questions.js`) with `html(q, s, api)`, `bind(el, q, api)`, `lock(el, q, s)`, `show(q, v, s)` and `model(q)`, like the existing types. **Every new type must also be added to all of these** or the worksheets and marking schemes break:

| Where | What to add |
|---|---|
| `QLABEL` in `35-questions.js` | the student-facing label |
| `simMax` in `35-questions.js` | points in the sim |
| `qMarks` in `60-worksheet.js` | marks on paper |
| `wsQuestion` in `60-worksheet.js` | how it prints in student, blank and key modes (student content in blue via `W()`) |
| part A / part B split in `60-worksheet.js` (around line 75) | drawn or written types go in part B |
| `markItem` switch in `60-worksheet.js` (around line 100) | the marking-scheme line, with accepted answers |
| `QMIN` in `55-sections.js` | minutes per question, for the time estimates |
| `tests/qtypes.py` (new) | answer each type right and wrong; check the lock, points, worksheet in all three modes and the scheme line |

Rules every new type keeps (from the skill and the Brief): one go, then lock and show the right answer ("Whoops! …" plus the reason); points per part; synonyms through `SYNS` for anything typed; no specificity pattern; seeded shuffles (`hashStr(q.id)`) so the sim and the paper match; works with touch and keyboard (no drag-only controls: give buttons as well); the Your turn box stays draggable and click-through; no internet requests.

### 3.1 `order`: Put in order (the skill lists it; the engine never had it)
- **Student does:** puts 4–7 cards in order with ▲/▼ buttons on each card (dragging is a bonus, never the only way).
- **Data:** `{ id, type: 'order', p, items: [...in the correct order], first: 'Leaves the helicopter', last: 'Lands' }` (`first`/`last` are optional labels for the ends of the list).
- **Marks:** 2 if all correct; 1 if exactly one neighbouring swap; else 0 (the skill's rule).
- **Lock:** each card shows its correct position beside it in green where it was wrong (`corr`).
- **Paper:** items lettered A, B, C … in the seeded shuffled order, then boxes "1st ___ 2nd ___ …" to write letters in. Key fills the letters.
- **Chapter 5 uses:** the stages of a skydive; objects in order of terminal velocity; planets in order of the weight of the same crate. Also banked for Chapter 2 ("order objects by inertia").

### 3.2 `pick`: Choose the words (drop-downs inside sentences)
- **Student does:** completes sentences by choosing from small drop-downs. Ideal for trends: "As the parachutist speeds up, air resistance **[gets bigger / stays the same / gets smaller]**."
- **Data:** `{ id, type: 'pick', p: 'As it speeds up, air resistance {0}. Its weight {1}.', picks: [[['gets bigger', 'stays the same', 'gets smaller'], 0], [['gets bigger', 'stays the same', 'gets smaller'], 1]] }`. Ordered scales (bigger/same/smaller, up/down) keep their natural order; check that the right answer is not always first across a section.
- **Marks:** 1 per drop-down.
- **Lock:** wrong drop-downs turn red with a green "→ stays the same" tag.
- **Paper:** "(gets bigger / stays the same / gets smaller)", circle one; student's choice printed in blue; key in the same place.
- **Differs from `gap`:** `gap` is typed recall from memory; `pick` is a fast check of a relationship. Use both in a section, not instead of each other.

### 3.3 `reason`: Answer and reason (two-tier), with an optional "Who's right?" cartoon
- **Student does:** picks an answer, then picks the reason (tier 2 appears once tier 1 is locked in). In cartoon mode, the answer options are speech bubbles from named characters ("Who's right?"), using the existing flat people art.
- **Data:** `{ id, type: 'reason', p, opts, a, reasons, r, why: { ... }, voices: [ { who: 'Mia', says: '...' }, ... ] (optional), sure: true (optional, see 3.8) }`. In cartoon mode `opts` is the list of `voices`.
- **Marks:** 2 (answer 1, reason 1).
- **Feedback** names the pattern: right and right ("Spot on!"); right answer, wrong reason ("You picked the right answer, but that reason doesn't hold up. The reason is …"); wrong answer ("Whoops! …").
- **Paper:** two lettered lists, "Answer: ___ Reason: ___".
- **Distractors:** every wrong option and wrong reason is one of the misconceptions in section 1, written at the same length and with the same numbers as the right one.
- **Chapter 5 uses:** "The parachutist opens the canopy. Which way does the parachutist move just after?" with the misconception "upwards" as a voice; "At terminal velocity, which forces act?"; "On the Moon the feather and the hammer land together. Why?".

### 3.4 `fix`: Spot the mistake
- **Student does:** reads a short worked answer (a calculation, a free-body diagram description, or a short explanation) written by a made-up student, taps the line with the mistake (part 1), then corrects it (part 2: a number box with a unit picker, or a choice).
- **Data:** `{ id, type: 'fix', p, who: 'Leo', lines: ['W = m × g', 'W = 50 × 9.8', 'W = 490 N'], bad: 1, fix: { kind: 'num', ans: 80, unit: 'N', units: UNITS, tol: 0.5 } or { kind: 'mcq', opts, a }, why: 'The crate is on the Moon, so g is 1.6 N/kg: 50 × 1.6 = 80 N.' }`
- **Marks:** 2 (1 for the right line, 1 for the fix). Part 1 locks after one tap and reveals the right line, so part 2 can still be answered if the tap was wrong.
- **After it locks, always show `why`** (the meta-analysis found the explanation is what makes it work).
- **Paper:** lines numbered; "The mistake is in line ___. The correct line is ___________". Key fills both.
- **Chapter 5 uses:** Earth's g used on another planet; resultant worked out as W + air resistance; "at terminal velocity the resultant is 686 N"; an FBD description with air resistance pointing down.

**As built (28 Oct 2026, step 1): `order`, `pick`, `reason`, `fix` and the `sure` add-on are in `src/js/36-qtypes.js` and `35-questions.js`.** Differences from the plan above: `reason` lets the student change the answer until Check (the reasons appear as soon as an answer is chosen, and Check needs both); `reason.why` is a string or `{a:{optionIndex:text}, r:{reasonIndex:text}, all:text}`; `fix.lines` are plain text and `fix.bad` is 0-based; `fix.fix.ask` can replace the part 2 prompt; `pick` and `order` accept an `after` line that is added to the feedback; the confidence row appears above Check on `pick` and `reason`, and above the options on `mcq` (the options only respond once a confidence is chosen). On paper, "Tap" in a `fix` question becomes "Circle".

### 3.5 `freeze`: Freeze-frame table (the main observation type)
- **Student does:** fills a table with one row per moment of the fall. Each row names the moment it wants ("Just after leaving the helicopter", "Halfway to terminal velocity", "At terminal velocity", "Just after the canopy opens", "Steady again with the canopy open"). The student plays the drop, pauses at that moment, presses **"Use this moment"** on the row (which attaches the current snapshot), then types the readings and picks the motion.
- **Data:** `{ id, type: 'freeze', p, obj: 'para', cols: ['W', 'D', 'R', 'motion'], rows: [ { label, when: snap => snap.v < 8 && !snap.canopy, whenMsg: 'Pause in the first second or two of the fall.' }, ... ] }`. Each row's `when` decides whether the attached snapshot is a fair choice; if it is not, show `whenMsg` and do not attach it.
- **Checks:** W and D are readings checked against the attached snapshot (tolerance about 1 N). R is checked as W − D of that snapshot (the resultant label is masked during this question). "motion" is a drop-down (speeding up / steady / slowing down) checked against the sign and size of the snapshot's acceleration (steady when |a| < 0.05 m/s²).
- **Marks:** 1 per cell.
- **Lock:** wrong cells red with the right value in green.
- **Paper:** the table with the moment labels, the snapshot time in each row, and the student's values in blue. **The key cannot hold fixed numbers** because every student's moments differ: the key shows one example run labelled "Example values (students' will differ)", and the marking scheme says to mark for consistency: W is the same in every row (mass × g); R = W − D in each row; the motion matches R (R downwards = speeding up, R zero = steady, R upwards = slowing down).
- **Pairs with:** a `pick` question on the trend straight after ("From your table: as the fall went on, air resistance ___, weight ___, the resultant ___.").

### 3.6 `spot`: Tap the moment on a graph (hotspot)
- **Student does:** taps a point on a velocity–time graph (or the force–time strip) to answer "Where were the forces first balanced?", "Where did the canopy open?", "Where was the resultant force biggest?". Each tap places a numbered marker; the student can move it before pressing Check.
- **Data:** `{ id, type: 'spot', p, graph: () => vtSVG(lines, { tap: true }), targets: [ { ask: 'Tap where the canopy opened.', t: [11.5, 12.5] } ] }`. Use a fixed example graph (not the student's run) so the key is fixed. Extend `vtSVG` with a `tap` option that maps a click's x position to time.
- **Marks:** 1 per target.
- **Lock:** the correct region shades green; the student's marker stays.
- **Paper:** the graph with "Mark an X"; student marker in blue; key shades the region.

### 3.7 `sketch`: Sketch the graph (predict before running)
- **Student does:** sketches a velocity–time graph by setting the height of a dot in each of 8–12 time columns (like a bar-graph input; drag the dot or tap the column; arrow keys move the focused dot). Lines join the dots. Use it as a prediction first ("Sketch the parachutist's velocity before you drop"), then compare with the real run.
- **Why this shape:** freehand drawing is hard to mark automatically; a dot per column is easy to use on touch screens and easy to check. Research on kinematics graphs shows students often draw the acceleration graph shaped like the velocity graph, so keep the y-axis label large and clear ("Velocity").
- **Data:** `{ id, type: 'sketch', p, xLabel: 'Time', yLabel: 'Velocity (downwards)', cols: 10, levels: 10, marks: [{ col: 6, label: 'Canopy opens' }], model: [0, 4, 7, 8.6, 9, 9, 2.5, 1.2, 1, 1], checks: [ ['Starts at zero', p => p[0] <= 0.5], ['Speeds up at first', p => p[2] > p[0]], ['Speeds up less and less', p => (p[1] - p[0]) > (p[3] - p[2])], ['Levels off', p => Math.abs(p[5] - p[4]) <= 0.6], ['Drops when the canopy opens', p => p[6] < p[5] - 2], ['Levels off lower, still above zero', p => Math.abs(p[9] - p[8]) <= 0.6 && p[9] > 0] ] }`
- **Marks:** 1 per check (the FBD builder's chip pattern: green ✓ / red ✗ chips after the one check).
- **Lock:** draws the model in green over the student's dots, and, if the student has a matching run, a third line "Your run".
- **Paper (part B):** blank grid with axes in the blank and key modes; student dots in blue; the key draws the model and lists the checks as "Look for".

### 3.8 Add-on: "How sure are you?" (confidence tier, no marks)
- Opt-in flag `sure: true` on `mcq`, `reason` and `pick`. Three buttons appear above Check: *Guessing*, *Fairly sure*, *Certain*. The student must choose one before checking.
- Not marked. Saved in the answer state (`st.sure`). The feedback page lists "Certain but wrong" answers, the confident misconceptions, which are the most useful thing for Tom to see. Add one line to the Toddle marking instructions: "Confidence is not marked."
- Use sparingly (one or two per section), on the key misconception items.

---

## 4. Formats that need no new code (reuse existing types)

| Format | Use | How |
|---|---|---|
| Always, sometimes or never? | "A falling object speeds up" (sometimes); "Opening a parachute makes the parachutist move upwards" (never); "Air resistance acts opposite to the motion" (always); "When the forces are balanced the object is still" (sometimes) | `sort` with groups `['Always true', 'Sometimes true', 'Never true']` |
| Trend grid | rows Weight / Air resistance / Resultant; columns "Speeding up", "At terminal velocity", "Canopy just opened"; each cell gets bigger / stays the same / gets smaller (or ↑ / ↓ / →) | `table` |
| Planet facts | planet ↔ g ↔ "air: none / thin / thick" | `match` (three-way) |
| Weight on other planets | a 70 kg astronaut on Mars | `num` with `units`, `ladder`, `hints` |
| Draw the FBD at a moment | parachutist at terminal velocity; just after the canopy opens | `fbd` with `airres` arrows; arrow lengths checked for "equal" or "up bigger" |
| Predict the race | two lanes, same crate on Earth and on the Moon, with and without air | step `predict` box (already exists) |
| Which statements are true? | facts about terminal velocity | `tick` |
| Explain it | why the feather and the crate land together with 100% of the air removed | `explain` with `words` and a checklist |

---

## 5. Where each type fits in Chapter 5 (suggested; the Chapter 5 script decides)

| Moment in the chapter | Best types |
|---|---|
| First drop, before anything is explained | `predict` box, then `sketch` (predict the v–t graph) |
| Watching the FBD as the object speeds up | `freeze` (three moments), then `pick` on the trend |
| Terminal velocity defined | `reason` (cartoon: "it has stopped speeding up, so no forces act"), `fbd` at terminal velocity |
| Opening the parachute | `freeze` (just after opening, steady again), `reason` (the "moves upwards" misconception), `spot` (where the canopy opened) |
| Comparing objects and canopy sizes | `order` (terminal velocities), `table` trend grid |
| Air slider and other planets | `predict` the race, `match` planet facts, `num` weight on a planet, `fix` (Earth's g used on the Moon) |
| Check (end of each section) | at least five different types, never two of the same type in a row, one `sure` item on the key misconception |

---

## 6. Build order and testing

1. Pause, step, snapshot, live FBD and masks (section 2), with `tests/` checks that pausing and stepping give the same numbers as the stored run.
2. `order`, `pick` (small, and usable straight away in earlier chapters).
3. `reason` (with cartoon mode), then `fix`.
4. `freeze` (needs snapshots).
5. `spot` (needs the `vtSVG` tap option), then `sketch`.
6. The `sure` add-on.

For each type: add the row-by-row checklist in section 3's table; run `python3 tools/make_worksheets.py` and look at the student, blank and key pages as images (no split questions, student content in blue, blank matches student layout); run `tests/qtypes.py` plus `err`, `net`, `dark` and the phone-width checks in `misc`. Update the Brief (file map: new types) and the skill checklist note in the Handoff when done. The repo copy of the sim-builder skill lists question types in section 4a-2; once the new types work, tell Tom so he can decide whether to add them to his account skill (keep the two copies the same).

---

## 7. Sources

- [Overview: QTI Interactions (TAO)](https://www.taotesting.com/?p=3753)
- [Alaska Science Assessment item types (PDF)](https://education.alaska.gov/assessments/Science_ItemTypes.pdf)
- [What makes a good Diagnostic Question? (Craig Barton, Eedi)](https://medium.com/eedi/what-makes-a-good-diagnostic-question-b760a65e0320)
- [Catch out misconceptions with multiple-choice hinge questions (Chartered College of Teaching)](https://my.chartered.college/research-hub/catch-out-misconceptions-with-multiple-choice-hinge-questions/)
- [Comparing one-, two- and three-tier physics diagnostic tests (USEJ)](https://journal.unnes.ac.id/sju/usej/article/view/15856)
- [Predict–observe–explain supported with simulations (METU)](https://avesis.metu.edu.tr/yayin/29d6c4b4-b5cb-433e-8740-c51e7ac6d0de/an-experimental-study-exploring-the-effects-of-predictobserveexplain-method-supported-with-simulations)
- [Learning from erroneous examples: framework and meta-analysis (Leibniz IPN)](https://www.leibniz-ipn.de/en/research/publications/a-framework-for-learning-from-erroneous-examples-and-meta-analysis-of-empirical-research)
- [Short-answer vs multiple-choice retrieval practice in lectures (Frontiers in Psychology)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6288371)
- [Student reasoning about air resistance and terminal speed (APS 2023)](https://meetings-archive.aps.org/apr/2023/f17/6/)
- [Student understanding of air resistance and terminal speed (APS 2019)](https://meetings-archive.aps.org/nws/2019/g1/5/)
- [Many students think a force is needed to keep an object moving (IOP Spark)](https://spark.iop.org/many-pupils-think-force-needed-keep-object-moving-constant-speed)
- [Misconception: skydiver goes up when the parachute opens (Physics Lens)](https://www.physicslens.com/misconception-skydiver-goes-up-when-parachute-opens)
- [Changing the speed of a parachute, KS3 (Oak National Academy)](https://thenational.academy/teachers/programmes/science-secondary-ks3/units/moving-by-force/lessons/changing-the-speed-of-a-parachute)
- [Concept cartoons: what have we learnt? (TUSED)](https://www.tused.org/index.php/tused/article/view/273)
- [Influence of real-time graphing on kinematics graphs (KSU)](https://perg.phys.ksu.edu/papers/jrst/influence.htm)
- [BEST: Drag diagnostic questions (STEM Learning)](https://www-legacy.stem.org.uk/resources/elibrary/resource/451142/drag)
