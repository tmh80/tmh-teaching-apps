---
name: "wab-virtual-lab-builder"
description: "Build or change a formative virtual lab (HTML) for Tom's WAB MYP Grade 6–8 science classes, like Paper Plane Lab, where students run a fair test in clear steps and hand in a lab report plus a feedback sheet on Toddle."
---

# WAB Virtual Lab Builder (formative lab reports)

Use this skill for **virtual labs where students show what they know**: they plan and run their own fair test in a fixed order of steps, write it up, and hand in a lab report for feedback (MYP Criteria B and C). Paper Plane Lab is the model and the starting template.

For open-ended **simulations** made for discovery, foundation building and extension (Force HQ, Sparks Through Time, Adapt Lab), use `wab-science-sim-builder` instead.

| | Virtual lab (this skill) | Simulation (sim builder) |
|---|---|---|
| Purpose | Students display knowledge; formative assessment and feedback | Discovery, foundation building, extension |
| Shape | Clear steps in a fixed order | Free play and exploration, with guided missions and open builders |
| Help | Set by the challenge level, then fixed | Hint ladders, worked examples |
| Output | Lab report PDF + feedback sheet PDF on Toddle | Worksheet and build-sheet PDFs |

Tom is Head of MS Sciences at WAB (Beijing). Grade 6 is one class; Grade 7/8 is a mixed class on Cycle A / Cycle B. Labs are often run by a cover teacher, so everything must work with no teacher explaining.

## 1. The steps

Keep this order: **Observe → Question → Hypothesis (Year 1: prediction) → Plan → Test → Results → Analysis → Evaluation → Finish**, plus **★ Extensions** (peer review with a partner or a virtual partner; a new investigation with a different variable at a higher level).

- **Observe:** free throws/runs (at least 3) and typed observations before any planning.
- **Question:** pick one independent variable from a single list (number and category variables mixed together), pick the dependent variable, write the research question, write both variables with "Units (if any)".
- **Hypothesis:** IF / THEN / BECAUSE. Use a different frame for category variables ("If I throw a plane with ___ …").
- **Plan:** experimental groups (at least 3 recommended), set-up, the thing's design, control variables (typed, with how each is controlled), materials (with amounts) and method. No safety section for virtual labs unless Tom asks.
  - **Method steps are only hands-on actions** someone could follow to run the test: set the IV, launch/run, measure, record, repeat for 3 trials, change to the next group. Leave out "keep everything the same" (that is what the control variables section is for) and "work out the average" (that is processing data, not running the test). These are not the kind of steps Tom looks for, so they never go in the step bank, the frames or the model method.
- **Test:** the simulation with its controls (sliders), the student's results table built on the same screen (title, IV/DV headings with units in the headings only, never in the rows), 3 trials per group, averages typed by the student with a calculator.
- **Results:** a qualitative table (one word is acceptable) and a graph builder: the student chooses scatter or bar, writes the title ("IV vs DV"), labels the axes (y-label horizontal on the left), chooses the scale (bar y-axis need not start at 0), drags points or bars, and can add a straight line or curve of best fit.
- **Analysis:** a short pop-up lesson (positive/negative/no trend, or comparing groups with numbers) and a "?" next to the trend gap that reopens it. Q1 describes the data with numbers; Q2 says if the hypothesis was supported. Open the student's "My report" panel by default here so they can see their data; it pushes the page aside, never covers it.
- **Evaluation:** a pop-up lesson (fair test, human vs method error, reliability), a fairness line ("Very unfair" to "Very fair", click to place an ✕) with a reason, the student's flight notes, Behind the scenes, a card sort (human errors written as obvious slips, method errors, improvements), then Q3 (explain at least two **method** errors only) and Q4 (how to fix them).
- **Finish:** save both PDFs, a checklist that ticks only when each part is done, then a certificate.

Each step opens with a short "On this page you will…" pop-up that students close with "Got it – I understand!". Offer a replayable first-run tour.

- **Name and class first.** Ask for the student's name and class at the very start, before the lab opens. **Nobody gets in without a name or the teacher code:** closing the box (Cancel, Escape or clicking outside) sends them back to it. Build it as plain divs with click and Enter handlers rather than a `<form>`, because sandboxed previews block form submission. Show the name at the top left of every screen as a chip with a "Change" button, and print it in the header of every PDF page.
- **Every pop-up is draggable.** Step intros, pop-up lessons, character comments, tips and help boxes are dragged by their header bar (a ⠿ grip, `cursor: grab`, `touch-action: none`) with pointer events, so mouse, pen and touch all work. Use one shared helper (`makeDraggable(box, handleSelector, key)`). Pop-ups that don't need an answer sit on a transparent, click-through layer (`pointer-events: none` on the layer, `auto` on the box), so students can still read the lab and their data behind them. The header always stays on screen, the box keeps its spot while the page is open, and it re-clamps on resize. Buttons inside the header still work.
- **Teach before you test.** No word or idea appears in a question, frame, card sort or feedback before the lab (or the unit at that point) has taught it. Pop-up lessons introduce terms before the step that needs them. Read the lab in order as a student who has met nothing yet and fix anything that relies on an untaught term.
- **Hands-on observation.** In Observe and Test, students do the action themselves (fold, throw, drag, rub, release) rather than pressing a button to watch an animation, and the outcome comes from the lab's physics model, so unplanned tries behave sensibly too.
- **Keep the science honest.** If a requested set-up isn't physically right, let students try it, have the lab show and explain what really happens, and tell Tom about the change.

## 2. Challenge levels

Students choose a level at the start; it is then locked and printed in the header of every PDF page.

| Level | Help | Highest grade (Grade 6 bands) |
|---|---|---|
| Developing | Sentence frames with typed gaps, tips, specific "Check my answer" feedback, pick-from-list materials and method steps | Developing |
| Proficient | Sentence starters, brief checks, pick materials and type amounts, method steps with gaps | Proficient |
| Mastering | A few "📓 Check your notebook…" nudges, no checks, everything written from scratch | Mastering |
| Einstein | No help at all (an extra challenge) | Mastering |

- **Grade 6** uses bands only (Beginning, Developing, Proficient, Mastering). Never show numbers or "/8".
- **Grade 7/8** uses MYP 1–8 (confirmed by Tom). Caps: Developing 3–4, Proficient 5–6, Mastering 7–8, Einstein 8 (extra challenge). Feedback-sheet badges and the teacher's circle-a-level boxes use these numbers, with numbers above the cap left off.
- **Everything is typed at every level.** Only set-up choices are clicked (variables, groups, location, launch method, design, sliders, material shelf and method bank at lower levels).
- Use MYP command terms for the year group (Year 1: state, outline, discuss, describe; "prediction" rather than "hypothesis").
- When a part is complete, say "You're good. Try the next challenge level." (Einstein: "You've mastered it. Excellent work!").

## 3. Assessment rules (from classroom use)

**Let students show what they know, including mistakes**
- **Never force the right answer.** Wrong materials, a method in the wrong order or a wrong unit can all be handed in. Nothing removes, hides or blocks wrong choices. Optional "Check my answer" help is fine at lower levels.
- **Done means complete, never correct.** A part turns green when every box has something in it (all three control variables *and* how each is controlled) or when it reaches a sensible minimum (at least 4 materials, each with an amount; at least 4 method steps). Say under each part what makes it turn green. One word per box is enough.
- **Block only what the experiment needs** (IV, DV, at least 2 groups, the set-up the sim needs). When one is missing, move the student straight to the first missing one, outline it in red and explain in a pop-up (shown after any step intro). Everything else warns: "You haven't finished this page" with "Continue anyway" and "Go back and finish". Never disable a Next button for non-essential work.
- **Accept synonyms in anything auto-checked.** Where a typed answer is checked by the lab (sentence-frame gaps, "Check my answer" at lower levels, key words the feedback sheet looks for), accept sensible synonyms through one shared list of word groups, so every word in a group counts when one of them is accepted (e.g. bigger / more / larger / greater; smaller / less; increases / goes up / rises; decreases / goes down / falls; centre / center / middle). Ignore case, punctuation and a leading "a", "an" or "the". The marking scheme lists the accepted words.
- **Never say during the lab whether a measurement, average or answer is accurate.** Flag it on the feedback sheet instead. (Graph placement rings and "Check my answer" at lower levels are fine.)

**Make progress obvious**
- Green "✓ Done" / amber "To do" pills and borders on every part; the step bar shows done (green), part-done (amber) and not started.
- An "On this page: 2 of 5 done" bar with clickable chips that scroll to each part.
- Exact prerequisite messages ("2 averages are missing in Table 1") with "Go to …" buttons.
- Before saving a PDF, list every unfinished part by step with "Go there" buttons, plus "Save anyway". "Go there" outlines missing parts in red and highlights empty boxes.
- **Finishing a part is unmissable:** green border, the pill changes to "✓ Done", a green banner says what to do next, and the Next button pulses (no pulse with reduced motion). Parts with several actions show goal chips that tick off as each is done.
- **Every answer is remembered.** Returning to a finished step shows everything the student entered or chose. A "↻ Redo this part" button clears only that part (tap twice to confirm, because it is assessed work; no browser pop-up); nothing else is wiped.
- **Save a PDF at any stage.** A "📄 Save my report so far" button is always available (in the header or step bar). It uses the same "Save anyway" list, so students can hand in or keep a copy of unfinished work. Never tell students they must finish before saving.

**Measuring by hand**
- Students measure everything themselves: read the scale and estimate the last digit (never show the value), time with a stopwatch, type averages.
- Make it simple: a zoomed scale, a 3-2-1 countdown before timed events, the needed control highlighted, the reading shown beside the entry box ("⏱ Your stopwatch reads 1.78 s"), a "Keep it or redo it?" box, a calculator.
- **Never jump the page or steal keyboard focus during measuring** (the space bar must still work the stopwatch). Use buttons instead: "📋 Write my time in my table ↓" and "⬆ Back to the flight view"; after keep or redo, go back up to the experiment. Show only the tools the measurement needs.

## 4. Built-in method errors

Every lab hides realistic problems for the evaluation, recorded behind the scenes for each trial: human reaction time, launch variation, moving air or wind, build/fold differences (shown visibly in a close-up), measuring-scale resolution, a confound that changes with the IV (e.g. mass; show the mass of every version, and say on the Plan page whether it is constant and so a control variable), random outliers, controls changed mid-test, and equipment drift (e.g. a rubber band losing stretch).

- **A character comments** on trials where something really had a big effect ("The air from the vent pushed that one further"). Developing/Proficient get "📝 Add to my notes"; Mastering/Einstein see "Hmm, that one was different…", which opens the trial conditions with big effects in red (never the real measurement). Tell students about this before the test starts.
- **Behind the scenes** (Evaluation and feedback sheet) shows real values for every trial, with big effects in red and the student's notes beside them.
- Evaluation focuses on **method errors**; human slips are sorted out but not explained.

## 5. Hand-in and the files for Toddle

Students hand in:
1. **Lab report:** the student's own work only, laid out simply (no checks, flags or right/wrong colour-coding), about 3 A4 pages. The challenge level appears once, in the page header. **Text and entries the student added print in blue**, with a short line under the header: "Everything printed in blue was written by the student." This only separates the student's work from the printed frame.
2. **Feedback sheet:** about 2 pages. "How did I do?" cards per strand (green "What I did well" / red "What to work on", level so far never above the cap), a "What to check" list, the results table compared with the real values (pink = inaccurate), and behind-the-scenes data. Teacher circle-the-band boxes. **No teacher comment box on any PDF:** Tom leaves comments directly on Toddle.

Draw pages on a canvas larger than A4 so print is compact; never cut student writing. The checklist needs both PDFs saved. A certificate unlocks when the checklist is complete. In the claude.ai preview, save files through the `downloads` capability; the offline file uses a normal download.

Tom attaches **three teacher-only files** when he gives his prompt to Toddle's AI task maker:
1. **Blank template** (one per challenge level): the same report pages and layout with every student box empty (frames, starters and gaps as that level shows them), so Toddle AI sees what an empty report looks like and judges only what the student added.
2. **Answer key** (one per challenge level): the same report completed as a model at the top of that level's cap, with a model answer for every section (research question, variables, hypothesis, control variables with how each is controlled, materials, method, tables, graph, analysis, evaluation errors and improvements), plus "look for" notes.
3. **AI marking scheme**: what the two PDFs contain; that the blank template and answer key are attached, so **mark only what the student added (in blue)**, never the printed frames, starters or sentence gaps, and treat the answer key as the standard rather than wording to match; where the level is (page header) and the caps; strand descriptors in the year's command terms, with what to look for in each section; best-fit judgement then cap; using the feedback sheet's pink cells and "What to check" to confirm, but trusting the visible report when they disagree; wrong or unfinished work allowed, empty sections treated as not yet shown; and student feedback in exactly this format:

```
Good job!

Keep it up
- (2 to 4 simple positives)

Try this
- (2 to 4 actions, starting with a verb and naming the part of the report)
```

Generate all three as PDFs with a Playwright script and package them as a zip with one folder per challenge level (`1-Blank-Template.pdf`, `2-Answer-Key.pdf`, `3-Marking-Scheme.pdf`) and a "READ ME".

## 6. Standing preferences

- Offline single HTML file, no internet requests (claude.ai is blocked for students in China). Grade 6 reading level, warm and clear. Standards (ACARA, MYP) appear only in the teacher notes. No "I can" statements, no Quiz-Quiz-Trade, no "it isn't X, it's Y" phrasing.
- Teacher notes ("For teachers" button, at the top of the start screen): purpose, **Set it up on Toddle**, the two lessons, levels and caps, built-in errors, marking, standards for planning.
- **Set it up on Toddle (every virtual lab):** short steps (create a formative assessment with Toddle's AI task helper, paste the prompt, attach the offline HTML file, attach the three teacher-only files, set the hand-in to file upload for the two PDFs, assign; dates are set in Toddle afterwards, so there is no due date field) and a ready-made prompt in a read-only box with a "📋 Copy the prompt" button. Build the prompt from one `LAB_INFO` setting (title, grade, file, lessons, topic) so it updates itself. The prompt covers: grade level; the task and what students hand in; the MYP criteria strands (Grade 6 = **Year 1** Criteria B and C, reported as bands only; Grade 7/8 = **Year 3** Criteria B and C, levels 1–8); the marking method (level in the top-right header, caps per challenge level, best-fit then cap, use the feedback sheet's pink cells and "What to check", wrong or unfinished work allowed, mark only the blue student content against the attached template and answer key); that three teacher-only files are attached per level and students must not see the answer key or scheme; and the feedback format "Good job! / Keep it up / Try this".
- **Files for Toddle panel** in the teacher notes: a clear instruction box ("Attach all three files when you give your prompt to Toddle's AI task maker", with one line on what each file is for), then one row per challenge level with buttons "1. Blank template", "2. Answer key", "3. Marking scheme" that open printable pages to save as PDF. The answer key and marking scheme are **locked behind a teacher code that is the first word of the lab's name in capitals** (Paper Plane Lab → PAPER; Tilt Lab → TILT), case-insensitive, remembered in localStorage with "Lock again". Blank templates are never locked.
- Save progress automatically (localStorage in try/catch) plus "Save progress" / "Open" files for changing computers.
- Add `[hidden]{display:none !important}` to the stylesheet so nothing meant to be hidden shows through a component's own `display` rule.

## 7. Build, test, deliver

- Start from `paper-plane-lab/` in Tom's repo (`tmh80/tmh-teaching-apps`): copy `src/`, `build.js` and `tests/`, then replace the lab-specific parts (simulation model, variables, built-in errors, comments, materials shelf, method bank, reasons, intro text, teacher notes, model answers). Each lab gets its own folder with `src/`, `build.js`, `tests/`, `docs/<Name>_Brief.md`, and the Toddle file `<Name>-offline.html` at the folder root. The repo keeps its own copy of this skill in `.claude/skills/`; keep both copies in step.
- Test before every delivery with Playwright on `dist/test.html`: a sequence check (read the lab in order and list any term used before it is taught), a memory check (leave and return to a finished step; "Redo this part" clears only that part; "Save my report so far" works mid-lab), hands-on actions with real mouse drags, a full playthrough at every level, both measurement types, the launcher/alternative set-ups, a half-finished run (states, warnings, redirects, pre-save list), real-click measuring flows, the done rules, and both PDFs plus every blank template, answer key and marking scheme rendered to images with page counts checked (each template's layout must match the report's; every section of the answer key filled in). Check the teacher code (wrong refused, right accepted) and read the marking scheme through as Toddle AI would. Check the name gate (Cancel, Escape and clicking outside return to the name box). Drag every pop-up by its header with real mouse moves and with touch at desktop and phone widths (it follows the pointer, its header stays on screen, header buttons still work, the lab behind it can still be used). Check that synonyms are accepted wherever answers are auto-checked.
- Deliver: commit and push to the repo (explain in plain language), send the offline file and the Toddle files zip, republish the claude.ai preview, save the offline file to the project, and tell Tom the teacher code. Give Tom updated files whenever the PDFs change.