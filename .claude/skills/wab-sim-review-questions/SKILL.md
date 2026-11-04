---
name: "wab-sim-review-questions"
description: "Plan, write or change questions in Tom's WAB science sims: Check reviews, question types, points, misconceptions and MYP strand tags. Companion to wab-science-sim-builder."
---

# WAB Sim Review Questions

Companion to `wab-science-sim-builder`, which holds the design rules, shell, build, testing and delivery: load that core skill too. Section numbers match across the skills. The same question data drives the worksheets, answer keys and marking, so when a change affects points, print layout or marking, also load `wab-sim-toddle-outputs` (sections 4b–4d). Build-task questions are in `wab-sim-open-builders` (sections 4e–4f).

## 4a-2. Review questions (every section)

Each section/stop ends with a **Check** tab (the Review; unlocked after the Challenge, or after Learn if there is no Challenge) holding **about 5–10 questions**, sized to fit the section's 20–30 minutes, defined as data in one content module so the same items drive the sim, the final mixed review, the worksheets, the answer keys and the marking schemes.

- **Mix the formats in every section.** Pick types from the question bank and write the section's question plan first (section 4a-3): at least five different types per Check, chosen by what each question is for.
- **Every question has a model answer** (draw: an exemplar drawing; explain: a written model answer; calculate: a worked explanation) and every draw/explain item has a checklist of 2–4 points: these feed the answer key and become the marks in the marking scheme (section 4d). Check this with a script before shipping.
- **Make them think.** Prefer application, data interpretation, diagrams, prediction and misconception items over recall. Never make the first option always the right one (shuffle in the sim, seeded shuffle on paper).
- **No specificity pattern in choice questions.** Students must not be able to pick the answer because it is the longest or most specific option. Every option in a choose-one, tap-the-sentence or tick question is about as long and as detailed as the right one, and distractors reuse the same numbers and words (for a flat line at 1.8 m/s: "Moving at a steady 1.8 m/s", "Speeding up to 1.8 m/s", "Slowing down to 1.8 m/s", "Standing still, 1.8 m from the start"). Check every choice question before shipping.
- **Explain questions give the words to use.** Each explain item lists "Words to use in a good answer" (e.g. inertia, keeps moving, unbalanced force), shown in the sim and on the worksheet. Each checklist point says how one of those words should be used ("States that an unbalanced force has to act on the passenger to bring them to a stop"), and the marking scheme says the points are about using the given words correctly.
- **Scaffold every calculation.** Any maths a Check question needs (a ratio, a rearranged formula, "n times the mass gives 1/n of the speed") is first shown as a pattern in the sim, then as a worked example, then practised in Learn with a hint ladder, before the Check uses it. Break multi-step reasoning into steps in Learn (how many times heavier? how many times further? so what force?).
- **One go per question.** Every auto-marked question (in Learn, the Challenge and the Check) locks after its first check, right or wrong. A wrong answer shows the right one ("Whoops! The answer is …", followed by the reason): choose-one questions mark the right option with a dashed green outline; sort, match, table and gap questions put a green "→ correct" tag beside each wrong part. Say under each card: "You get one go, so check your answer carefully before you press Check." Diagram builders get one check, then the diagram locks and "Your diagram" is shown beside "The correct diagram" with ✓/✗ chips. "Try this step again" in Learn still resets a whole step.
- **Points per part.** Score multi-part questions per part so one slip doesn't lose everything: choose one, tap, calculate and reading 1; tick all 2 (minus one per mistake); gap, sort and match 1 per gap, item or row; table 1 per cell; diagrams 1 per builder check (e.g. 6); explain 1 per self-ticked checklist point; challenge missions per objective met. Show "Points so far: x of y" on the Check page, "n of m points" on each card, and points per question on the worksheet's feedback page.
- **Accept synonyms in typed answers.** Typed gaps and key words accept sensible synonyms through one shared list of word groups, so every word in a group counts when one of them is accepted (bigger / more / larger / greater / stronger; smaller / less / weaker; centre / center / middle; against / opposite / opposing; newtons / N). Ignore case, punctuation and a leading "a", "an" or "the". The marking scheme lists every accepted word for each gap.
- **Every Check question is taught first.** Before shipping, check each Check question against the Learn steps (and Challenge) of its own section. If a skill (e.g. drawing to scale) isn't taught, add a card and a practice question to Learn, or change the question.
- **Card states:** each question is a card with type label, To do/Done pill (showing its points once done), its own Check button and explained feedback. A sticky bar shows "x of N done", the points so far and chips that jump to each card.
- **Final mixed review** (e.g. Sparks' Time Test) draws auto-marked items from every section's Review rather than a separate easy MCQ bank.
- **MYP strands on every question (teacher-only).** Every Check item, build-task question and rubric row carries `obj:[...]`, the MYP Sciences strands it assesses. A sheet's strands are the union of its items' tags. Grade 6 is MYP Year 1:
  | Strand | Year 1 wording | Tag questions like this |
  |---|---|---|
  | A i | outline scientific knowledge | recall: name, match, sort into taught groups, fill gaps, label, order known events, explain a taught idea |
  | A ii | apply scientific knowledge and understanding to solve problems set in familiar situations | calculations, predicting a new set-up with a rule, diagnosing a fault, drawing to a spec |
  | A iii | apply information to make judgments | using given data, results or evidence to reach a conclusion; judging a claim; choosing the best option |
  | D i | summarize the ways in which science is applied and used to address a specific problem or issue | real uses: lightning rods, cranes, recycling, house wiring, the grid, power stations |
  | D ii | describe and summarize the various implications of using science and its application in solving a specific problem or issue | safety, cost, energy wasted, CO₂ and other environmental effects |
  | D iii | apply scientific language effectively | explain-it questions with "Words to use", only on sheets that also carry D i or D ii |

  Only some strands apply to each sheet; tag what the questions really assess rather than spreading every strand everywhere. For the mixed Grade 7/8 class, ask Tom which year's strand wording to use before tagging the first G7/8 sim. Strands appear only on the answer key, the marking scheme, the teacher page and the Toddle text; never on student screens, student worksheets or blank templates. A check script fails if any item has no `obj` and prints each sheet's strands.
- **Marks to MYP levels.** A question's marks count towards each criterion it is tagged with (once per criterion). Per criterion, earned ÷ available gives a level through one constant Tom can edit: `const LEVEL_CUTS = [1, 13, 26, 38, 51, 63, 76, 88];` (lowest percentage for levels 1 to 8; 0% is level 0). The AI feedback text tells Toddle to check the level against the MYP bands (1–2 limited, 3–4 adequate, 5–6 substantial, 7–8 excellent), allows a one-level adjustment with a reason, and to report "Criterion A: level x/8 (strands assessed: …)" with a sentence per strand.

## 4a-3. Question bank (pick types by what each question is for)

Plan questions from their purpose, then pick a type from this bank. The aim is that every section tests understanding from several angles (recall, organising ideas, misconceptions, observation, maths, producing), so students can't get through on recognition alone.

**Design rules from the research (apply to every type)**
- **Every wrong option means something.** Each distractor matches one named misconception, a question tests one idea, and a student who holds the misconception can't get it right by luck (Craig Barton's diagnostic-question rules; hinge questions).
- **Ask for the reason too.** Two-tier questions (answer, then reason) separate understanding from a lucky guess; students often pick the right answer for the wrong reason.
- **Predict, observe, explain.** Simulation-supported POE beats plain POE, so a run in the sim is usually followed by an observation question and then a reason or explain question.
- **Mistakes need an explanation.** Spotting errors in worked examples helps a little, and more when an explanation follows, so "spot the mistake" always shows why after it locks.
- **Produce more than you recognise.** Typed recall gave a lasting testing effect where easy multiple choice gave none, so most items ask students to type, build, sketch or order; choice questions are kept for misconception targets and data to interpret.
- **Challenge each misconception more than once, in different contexts**, and pair motion or data graphs with diagrams (IOP Spark advice).
- **Plan the misconceptions first.** In workflow step 4, list 5–8 misconceptions for the unit (IOP Spark, BEST diagnostic questions and physics/biology education research are good sources) and give each at least one item in Learn and one in the Check.

**The bank.** Marks are per part (section 4a-2). "Paper" says how it prints on the worksheet (student answers in blue; blank and key in the same layout).

| Purpose | Type | Student does | Marks | Paper |
|---|---|---|---|---|
| Recall | **Fill the gaps** (`gap`) | types key words into blanks; synonyms accepted | 1 per gap | blank lines; no word bank unless Tom asks for a cloze |
| Recall | **Match it up** (`match`) | pairs or three-way matches (word ↔ meaning ↔ example), picture rows allowed | 1 per row | lettered columns |
| Recall | **Choose the words** (`pick`) | small drop-downs inside sentences ("air resistance gets bigger / stays the same / gets smaller"); fast checks of relationships and trends | 1 per drop-down | "(a / b / c)" circle one |
| Organise | **Sort it** (`sort`) | puts items into 2–3 groups | 1 per item | table of ticks |
| Organise | **Always, sometimes or never?** (`sort` with those three groups) | judges general statements ("A circuit with a switch has current", "A falling object speeds up") | 1 per item | as sort |
| Organise | **Put in order** (`order`) | orders 4–7 cards with ▲/▼ buttons (dragging is a bonus): stages, timelines, energy chains, ranking by size | 2 (1 if one neighbouring swap) | lettered items, numbered boxes |
| Organise | **Complete the table** (`table`) | compare/contrast, property tables, **trend grids** (rows = quantities, columns = moments, cells = gets bigger / same / smaller) | 1 per cell | empty table with choices list |
| Misconception | **Choose one** (`mcq`) | one answer; every distractor a named misconception, same length and numbers as the right one | 1 | lettered options |
| Misconception | **Answer and reason** (`reason`) | picks an answer, then the reason; feedback names "right answer, wrong reason" | 2 | "Answer ___ Reason ___" |
| Misconception | **Who's right?** (`reason` with `voices`) | 3–4 characters in speech bubbles (concept cartoon), one holds the misconception; pick who is right, then why | 2 | speech bubbles, then as reason |
| Misconception | **Spot the mistake** (`fix`) | taps the wrong line in a made-up student's working, calculation, diagram description or explanation, then corrects it; always shows why afterwards | 2 (line 1, fix 1) | numbered lines, "mistake in line ___, correct line ___" |
| Misconception | **Tick all that apply** (`tick`) | ticks every true statement | 2 (−1 per mistake) | tick boxes |
| Observe | **Read it** (`reading`) | types a value from a meter, readout or the Journal's runs; checked against their own run | 1 | answer line |
| Observe | **Reading table / Freeze-frame table** (`freeze`) | one row per set-up or moment; pauses the sim at each moment listed (the row fills itself in), types the readings and the state (e.g. speeding up / steady / slowing down) | 1 per cell | table; key shows example values "students' will differ" and the scheme marks for consistency |
| Observe | **Tap the moment** (`spot`) | taps a point on a graph ("where were the forces first balanced?") or a part of a picture ("tap the bulb that goes out", "tap the feature that helps it keep warm") | 1 per target | "mark an X"; key shades the region |
| Observe | **Sketch the graph** (`sketch`) | sets a dot per time column to sketch a graph, usually as a prediction before a run; checked by shape features ("starts at zero", "levels off") | 1 per feature check | blank grid; key draws the model and lists the checks |
| Maths | **Calculate** (`num`) | number + unit picker, "Need a clue?" hint ladder, worked answer | 1 in the sim, 2 on paper | working box + answer |
| Produce | **Draw it / build it** (`fbd`, drawing pad, builders) | builds a diagram, model or circuit; checks as chips; exemplar shown after | 1 per check | dashed drawing box |
| Produce | **Explain it** (`explain`) | writes an answer with "Words to use"; self-ticks a checklist against the model answer | 1 per point | ruled lines |
| Add-on | **How sure are you?** (`sure: true` on choose one, answer and reason, choose the words) | picks Guessing / Fairly sure / Certain before Check; not marked; the feedback page lists "certain but wrong" answers for Tom | 0 | small three-box line |

**The question plan (do this before writing any questions).** For each section, write a short table in the brief or the chapter script: key idea or misconception → type → Learn step or Check. It passes when:
- the Check uses **at least five different types**, with at least one from each of *misconception*, *observe* and *produce*, no more than two *choose one*, and never two of the same type in a row;
- every key idea has at least one typed, ordered, sketched, built or written answer (not only choice questions);
- every listed misconception is targeted at least twice, in different contexts;
- every Learn step that runs the sim asks an *observe* question about that run before any *explain* question;
- one item per section on the main misconception carries the *How sure are you?* add-on.

**Adding a type the sim doesn't have yet.** Build each new type once as a reusable module in the question engine, then reuse it across sims. A type is finished only when it has, in one place each: the engine entry (render, check with one go, lock showing the right answer, saved state, student and model text for print), its label, its sim points, its paper marks, its print layout in student, blank and key modes (and part A or part B), its marking-scheme line with accepted answers, its minutes for the time estimates, and a test that answers it right and wrong. Every type works with touch, mouse and keyboard (buttons as well as dragging), uses seeded shuffles so the sim and paper match, and keeps the no-specificity rule. Force HQ's engine (`force-hq-rebuild/src/js/35-questions.js`) is the reference implementation, and `force-hq-rebuild/docs/Question_Types_Guide.md` has full data shapes for `order`, `pick`, `reason`, `fix`, `freeze`, `spot`, `sketch` and the confidence add-on.

**Observation tools for sims that run over time** (falling, moving, charging, populations changing): a big ⏸ Pause button next to the start button, step buttons ("◀ 0.5 s", "0.5 s ▶") from a stored run history, and a 📸 Snapshot button that saves the paused moment to the Journal's Runs tab with a sentence, chips and a picture of the arena (a small JPEG, newest 20 kept) that expands when tapped; a snapshot nobody can look at is pointless. Freeze-frame and tap-the-moment questions check against these snapshots, so no question forces a re-run. Mask any readout that would hand over a value the student must work out until they have answered.