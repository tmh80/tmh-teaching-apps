# Force HQ: F = m × a Practice (plan, 18 Nov 2026)

**Tom's request:** a maths practice mode where students practise force, mass and acceleration with the formula triangle. Numbers are generated, but realistic for each object. Questions get harder as students get answers right: decimals, then problems that need more than one step.

**Status:** plan only. Nothing is built yet. The questions for Tom are in section 9; the build can start once he answers them.

## 0. What already exists (reuse, do not rebuild)

- **The maths bank** in `43-ch3.js` (`mq(level, seed)`, `rngSeed`, `MB_THINGS`). It is seeded and has five levels (find F, find a, find m, resultant then a, weight mixed in), with three hints and a worked answer for each question. Today students only reach it through the "Another level N question" buttons in one Chapter 3 Learn step and in the Check. The new generator **replaces `mq` and keeps its API**, so the Chapter 3 step and Check keep working: the same `mq(level, seed)` gives the same question as today for levels 1–5.
- **The `num` question type** (`35-questions.js`, `renderQuestion`): unit picker, "Need a clue?" ladder, Working box, tolerance check, and `addEvidence('maths', …)` when the answer is right.
- **The formula triangle** (`triHTML('fma')`, `triHTML('w')` in `21-calc.js`) and the calculator (`calcEval`, with the `g` key).
- **The flashcards shell** (`63-flashcards.js`): its own view (`vCards`), a home card, a badge, one key in `DB`, and test hooks. Practice copies this pattern.
- **Evidence:** right answers already reach the "My work so far" PDF through `DB.evidence`.
- **What has been taught:** N, kg, m/s, m/s². No grams, tonnes or km/h anywhere in Chapters 1–5. Chapter 3 also teaches a = (v − u) ÷ t and resultant = pull − friction. Chapter 5 teaches g on other worlds (`DZ_WORLDS`: Moon 1.6, Mars 3.7, Venus 8.9, Titan 1.4, Jupiter 24.8 N/kg).

## 1. How it works for a student

1. A new home card, **"🏋️ Maths Gym"** (working name, see section 9), sits beside Flashcards. It opens once Chapter 3 Foundation is finished. Until then it says so and offers "Open it anyway", like Explore does.
2. A go is **10 questions (approx. 15 min)**. The student can keep going after that, or stop at any time; progress saves after every question.
3. Each question appears as a card:
   - a short story with a small code-drawn picture of the object;
   - from level 4 up, a sketch with force arrows and their values;
   - the answer box with the unit picker;
   - the Working box;
   - "Need a clue?";
   - the formula triangle folded beside the card;
   - the calculator, always available as usual.
4. Feedback says why the answer was right or wrong. When a wrong answer matches a common mistake, the feedback names that mistake (section 4).
5. **The level meter** across the top shows six rungs and the student's current rung, with three dots for "right in a row". Moving up gets a small celebration ("Level 4 unlocked: two-step problems!").
6. **The end screen** shows:
   - questions right;
   - the highest level reached;
   - which skills were strong (find F, find m, two-step, and so on);
   - one "next time, practise…" line;
   - buttons for "Keep going", "Home" and "📄 Save my practice".

## 2. The levels

Every level mixes the unknown (F, m or a) and the story. Numbers are non-round and realistic for the object (section 3).

| Level | What it asks | Numbers |
|---|---|---|
| 1 | One step: find F | Whole-number mass; acceleration with at most 1 decimal place |
| 2 | One step: find a or m (divide) | Answers to 1 decimal place |
| 3 | One step, any unknown | Decimals in the given values too (0.43 kg, 2.65 m/s²); answer to 1 or 2 decimal places, as the question says |
| 4 | Two steps: resultant first | Pull and friction, or two opposite forces, then find a or m. Also: find the friction or the pull needed for a target acceleration |
| 5 | Two steps: weight or velocity | Mass from weight (W ÷ 9.8), then F = m × a. Or acceleration from a change in velocity (a = (v − u) ÷ t), then F. Other worlds' g once Chapter 5 is done |
| 6 | Stretch: three steps or comparing | For example: the engine force needed to reach 14 m/s in 6.2 s against 380 N of friction; which of two objects speeds up more; what mass a force can push at a given acceleration. A "units" question only if Tom says yes (section 9) |

**Moving between levels:**
- **Up:** 3 right in a row with no clue used. A right answer after a clue counts as right but does not add to the run.
- **Down:** 2 wrong in a row. The message is kind ("Let's go back a step and build it up again"), followed by a worked example and then a "twin" question: the same skill with new numbers.
- **Mixing:** about 1 question in 5 comes from a level below, so earlier skills stay fresh.
- **Gated levels:** level 5's other worlds need Chapter 5, and level 4 needs Chapter 3 Extension (resultant). Teacher mode unlocks everything.

## 3. The generator (semi-generative, realistic)

- **Object bank** (`PR_THINGS`, about 30 objects). Each has a picture, a mass range and a realistic acceleration range, so the numbers always make sense. For example:
  - a husky sled: 140–260 kg, 0.6–2.4 m/s²;
  - a football being kicked: 0.41–0.45 kg, 80–250 m/s²;
  - a car: 1,050–1,900 kg, 1.5–4.5 m/s²;
  - a sprinter: 52–90 kg, 2.5–6 m/s²;
  - also a shopping trolley, a lift, a rocket sled, Captain Smooshy, a crate in the Workshop, a skydiver, a supply pod in the Space Dome, and more.
  
  Familiar Force HQ places come first.
- **Templates:** each level has 4–8 story templates, with the object and its numbers filled in. All wording sits in one content block so voice changes touch one place.
- **Seeded:** every question comes from a seed, so the same seed always gives the same question. Tests, the twin question and the PDF can all rebuild it.
- **Number rules:**
  - non-round values;
  - answers that are not whole numbers from level 2 up;
  - every number shown exactly as it will be marked;
  - the question states the rounding ("to 1 decimal place") from level 3 up.
- **Tolerance:** half of the last decimal place asked for, plus the existing 1% rule for large numbers. The answer is judged on the rounded value, as in the Chapter 6 rule.
- **g = 9.8 N/kg.** Other worlds always state their g in the question.

## 4. Catching mistakes (the part that makes it teach)

For every question, the generator also works out the answers that common mistakes would give. When a wrong answer matches one of them, the feedback names the mistake in plain words. This replaces the generic "Not quite".

| Mistake | Example feedback |
|---|---|
| Multiplied when they should divide (a = F × m) | "You multiplied. Cover a on the triangle: F is over m, so divide." |
| Divided the wrong way round (m ÷ F) | "Check which number goes on top: force ÷ mass." |
| Used the weight in newtons as the mass | "That's the weight in newtons. Find the mass first: weight ÷ 9.8." |
| Used one force, not the resultant | "Friction is pushing back too. Work out the resultant force first." |
| Added opposite forces | "These forces point opposite ways, so take the smaller from the bigger." |
| Used g = 10 | "Close! Force HQ uses g = 9.8 N/kg." |
| Right number, wrong unit | Already handled by the `num` type |
| Rounded too early (level 5 and up) | "Keep all the digits until the last step." |

Each mistake is targeted at least twice, in different stories, before a go ends. The mistake counts are saved so the end screen and the teacher can see them.

## 5. Tries and hints (practice is not a test)

- **Proposed rule:** practice gives **two tries**, unlike the one-go Check.
  - **First wrong answer:** the mistake feedback (or hint 1), then try again.
  - **Second wrong answer:** the worked answer, then a twin question.
- **Clue ladder:** the existing three hints. Hint 1 says which letter to cover, hint 2 puts the numbers in, and hint 3 gives the calculator keys. Hint 3 never gives the answer.
- **Two-step questions:** the Working box shows "Step 1" and "Step 2" headings so students learn to set out their working.

## 6. Saving and evidence for Toddle

`DB.prac = { level, run, best, goes, hist: [{t, seed, lvl, kind, ok, tries, clue, mistake}], skills: {kind: {right, tries}} }`. It rides along with the 💾 backup.

- **"📄 Save my practice":** a one-page summary PDF with the student's name and class (no name, no PDF). It shows the highest level reached, questions right, the skills table, and the last 10 questions with the student's answers in blue. It also goes into the "My work so far" PDF.
- **Teacher page (if Tom wants it, section 9):** a "Maths Gym" row with a target ("reach level 4", "20 questions") and a short Toddle prompt. No answer key is needed, because every question is generated and marked by the sim. The Toddle AI text only checks the summary page.
- **No MYP strands on student screens.** If it becomes a set task, its rows are tagged A ii on the teacher side only.

## 7. Files and who builds what (helpers to save tokens)

| Who | Files | Job |
|---|---|---|
| Helper 1 (generator) | `src/js/66-practice-gen.js`, `tests/practice_gen.py` | Object bank, templates for all six levels, number rules, the mistake answers, tolerance. Has `mq()` give the same questions as today for levels 1–5. A script generates 3,000 questions per level and checks: every answer is right, realistic and rounded as stated; no repeats within a go; and every mistake answer differs from the right one |
| Helper 2 (screens) | `src/js/67-practice.js`, small edits to `index.html`, `20-shell.js`, `app.css`, `60-worksheet.js`, `61-pdf.js` | View, home card, level meter, question card with pictures and the FBD sketch, the adaptive engine (section 2), two tries, end screen, summary PDF |
| Main session | integration, `tests/practice.py`, `tests/run_all.sh`, docs | Join the two parts. Play-through test: level up and down, clues, each mistake message, units, the PDF, phone width, dark mode, no network. Screenshots, delivery |

Helper 1 goes first and writes the generator API into this file (section 8). Helper 2 then builds against that API. The helpers stay in their own files, don't read the 2 MB built files whole, and leave git to the main session.

## 8. Generator API (Helper 1 fills in the details)

`prGen(level, seed, opts) → q`, where `q` is a normal `num` question plus:
- `kind`: for example `'findF'`, `'findA'`, `'twoStepFric'`, `'weightThenA'`, `'dvThenF'`;
- `traps: [{ans, key}]`: the answers that common mistakes give;
- `pic: {thing, arrows}`: the picture to draw.

`opts` holds the chapters done (for gating) and the kinds recently seen (to avoid repeats). `mq(level, seed)` becomes a thin wrapper around `prGen`.

## 9. Questions for Tom

1. **Name and place:** "Maths Gym", "Calculation Range", or something else? A home card next to Flashcards, or a building on the HQ map?
2. **Tries:** two tries in practice (proposed), or one go like the Check?
3. **Units:** should level 6 include grams to kg and tonnes to kg? They aren't taught anywhere yet, so this would need a short "How to convert" card.
4. **Other worlds:** include other worlds' g in level 5 once Chapter 5 is done?
5. **Setting it as a task:** do you want to set the Maths Gym from the teacher page with a target (a level or a number of questions) and get a summary PDF on Toddle? Or is it free practice only?
6. **When it opens:** after Chapter 3 Foundation (proposed)?

## 10. Size

One build session: Helper 1 and Helper 2 one after the other, then about an hour of the main session for integration, tests and delivery. Delivery follows the Handoff steps: the offline file, the worksheets zip if a summary sheet is added, docs, and the project copy of this plan.
