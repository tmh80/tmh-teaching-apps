# Force HQ: F = m × a Practice (plan, 18 Nov 2026)

**Tom's request:** a maths practice mode where students practise force, mass and acceleration with the formula triangle. Numbers are generated, but realistic for each object. Questions get harder as students get answers right: decimals, then problems that need more than one step.

**Status:** plan agreed with Tom on 18 Nov 2026 (his decisions are in section 9). The build started the same day.

## 0. What already exists (reuse, do not rebuild)

- **The maths bank** in `43-ch3.js` (`mq(level, seed)`, `rngSeed`, `MB_THINGS`). It is seeded and has five levels (find F, find a, find m, resultant then a, weight mixed in), with three hints and a worked answer for each question. Today students only reach it through the "Another level N question" buttons in one Chapter 3 Learn step and in the Check. The new generator **replaces `mq` and keeps its API**, so the Chapter 3 step and Check keep working: the same `mq(level, seed)` gives the same question as today for levels 1–5.
- **The `num` question type** (`35-questions.js`, `renderQuestion`): unit picker, "Need a clue?" ladder, Working box, tolerance check, and `addEvidence('maths', …)` when the answer is right.
- **The formula triangle** (`triHTML('fma')`, `triHTML('w')` in `21-calc.js`) and the calculator (`calcEval`, with the `g` key).
- **The flashcards shell** (`63-flashcards.js`): its own view (`vCards`), a home card, a badge, one key in `DB`, and test hooks. Practice copies this pattern.
- **Evidence:** right answers already reach the "My work so far" PDF through `DB.evidence`.
- **What has been taught:** N, kg, m/s, m/s². No grams, tonnes or km/h anywhere in Chapters 1–5. Chapter 3 also teaches a = (v − u) ÷ t and resultant = pull − friction. Chapter 5 teaches g on other worlds (`DZ_WORLDS`: Moon 1.6, Mars 3.7, Venus 8.9, Titan 1.4, Jupiter 24.8 N/kg).

## 1. How it works for a student

1. A new home card, **"🏋️ Maths Gym"**, sits beside Flashcards. **It is open from the start.** If the student has not finished Chapter 3 Foundation, each time the Gym opens it shows a friendly reminder: "We recommend doing Chapter 3 first. That's where you meet F = m × a and the formula triangle." It has "Go to Chapter 3" and "Practise anyway" buttons. Teacher mode shows no reminder.
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
| 6 | Stretch: three steps, comparing, and units | For example: the engine force needed to reach 14 m/s in 6.2 s against 380 N of friction; which of two objects speeds up more; what mass a force can push at a given acceleration. **Unit conversions:** masses given in grams (a 430 g football, a 57 g tennis ball) or tonnes (a 1.4 tonne car, a 2.3 tonne rhino) that must be changed to kg first |

**Moving between levels:**
- **Up:** 3 right in a row with no clue used. A right answer after a clue counts as right but does not add to the run.
- **Down:** 2 wrong in a row. The message is kind ("Let's go back a step and build it up again"), followed by a worked example and then a "twin" question: the same skill with new numbers.
- **Mixing:** about 1 question in 5 comes from a level below, so earlier skills stay fresh.
- **No level is locked by chapter.** The Chapter 3 reminder covers that. Two kinds of question wait until they have been taught:
  - **Other worlds' g** appears in level 5 only once the Chapter 5 Learn steps (Foundation and Extension) are done.
  - **Unit conversions (grams and tonnes)** appear in level 6 only after the student has done the Gym's "Changing units" teach card. The card opens the first time a student reaches level 6. It has one idea per card (1 kg = 1,000 g; 1 tonne = 1,000 kg), a picture (a bag of sugar, a small car), a worked example and a key-word gap to check it ("To change grams to kilograms, you ___ by 1,000"). Every units question has a "How do I change units?" fold-out that reopens it. Teacher mode skips the wait.

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
- **Teacher page row (Tom said yes).** A "🏋️ Maths Gym" row the teacher can tick, with a target picker: reach level 3, 4, 5 or 6, or get 10, 20 or 30 questions right (default: reach level 4). The row adds:
  - a time estimate (approx. 15 to 30 min, depending on the target);
  - a task-maker prompt line ("Practise F = m × a in the Maths Gym until you reach level 4, then save your practice PDF and upload it");
  - AI feedback text, locked behind the teacher code like the rest.

  No answer key is needed, because every question is generated and marked by the sim. The AI text checks the summary page against the target: level reached, questions right, working shown, and mistakes met and fixed.
- **The target in the Gym:** the student picks the same target in the Gym from the same list, because the Gym has no link to the teacher page; the target reaches them through the Toddle instructions. The Gym shows the target and progress towards it at the top, and the summary PDF shows it too ("Target: reach level 4. ✓ Reached") so Toddle can check it.
- **MYP strands:** the teacher-side rows are tagged A ii (applying knowledge to solve problems). They never appear on student screens.

## 7. Files and who builds what (helpers to save tokens)

| Who | Files | Job |
|---|---|---|
| Helper 1 (generator) | `src/js/66-practice-gen.js`, `tests/practice_gen.py` | Object bank, templates for all six levels (including unit conversions), number rules, the mistake answers, tolerance. Leaves Chapter 3's `mq()` as it is. A script generates 3,000 questions per level and checks: every answer is right, realistic and rounded as stated; no repeats within a go; and every mistake answer differs from the right one |
| Helper 2 (screens) | `src/js/67-practice.js`, small edits to `index.html`, `20-shell.js`, `app.css`, `60-worksheet.js`, `61-pdf.js`, `62-teacher.js` | View, home card, Chapter 3 reminder, level meter, question card with pictures and the FBD sketch, the adaptive engine (section 2), two tries, the "Changing units" teach card, end screen, summary PDF, teacher-page row |
| Main session | integration, `tests/practice.py`, `tests/run_all.sh`, docs | Join the two parts. Play-through test: level up and down, clues, each mistake message, units, the PDF, phone width, dark mode, no network. Screenshots, delivery |

Helper 1 goes first and writes the generator API into this file (section 8). Helper 2 then builds against that API. The helpers stay in their own files, don't read the 2 MB built files whole, and leave git to the main session.

## 8. Generator API (Helper 1 fills in the details)

`prGen(level, seed, opts) → q`, where `q` is a normal `num` question plus:
- `kind`: for example `'findF'`, `'findA'`, `'twoStepFric'`, `'weightThenA'`, `'dvThenF'`;
- `traps: [{ans, key}]`: the answers that common mistakes give;
- `pic: {thing, arrows}`: the picture to draw.

`opts` is `{ worlds, units, recent }`: whether other-worlds and unit-conversion questions are allowed yet, and the kinds seen recently (to avoid repeats). Chapter 3's `mq()` stays as it is.

## 9. Tom's decisions (18 Nov 2026)

1. **Name:** "Maths Gym", a home card beside Flashcards.
2. **Tries:** two tries per question.
3. **Units:** yes, level 6 includes grams and tonnes to kg. It must be taught in the sim, so the Gym has a "Changing units" teach card (section 2). A Chapter 3 Learn step that teaches it properly is on the backlog's to-do list.
4. **Other worlds:** yes, in level 5, once the Chapter 5 Learn steps are done.
5. **Teacher page:** yes, a Maths Gym row with a target, and a summary PDF for Toddle (section 6).
6. **Opening:** open from the start, with a reminder to do Chapter 3 first if it isn't done.

## 10. Size

One build session: Helper 1 and Helper 2 one after the other, then about an hour of the main session for integration, tests and delivery. Delivery follows the Handoff steps: the offline file, the worksheets zip if a summary sheet is added, docs, and the project copy of this plan.
