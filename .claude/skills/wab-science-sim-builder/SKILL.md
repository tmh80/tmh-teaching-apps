---
name: "wab-science-sim-builder"
description: "Build or extend a self-contained interactive science simulation (HTML) for Tom's WAB MYP Grade 6–8 classes: free play and discovery for foundation building, review and extension, used independently via Toddle. Not for formative lab reports (use wab-virtual-lab-builder)."
---

# WAB Science Sim Builder

For open-ended science simulations in the family of Force HQ (G7/8 forces), Sparks Through Time (G6 electricity) and Adapt Lab (G6 adaptations/evolution). Formative virtual labs where students display knowledge in a lab report (like Paper Plane Lab) use `wab-virtual-lab-builder` instead. Simulations are for free play, discovery, foundation building and extension; virtual labs are clear steps in order so students get feedback.

Tom is Head of MS Sciences at WAB (Beijing). Grade 6 is one class; Grade 7/8 is a mixed class on Cycle A / Cycle B.

## Companion skills: load before doing this work

This core skill holds the design rules, shared shell, workflow, build, testing and delivery. Three companion skills hold the rest. Section numbers are the same across all four, so "section 4d" always means the same rules.

| Sections | Skill | Load it before |
|---|---|---|
| 4a-2, 4a-3 | `wab-sim-review-questions` | planning, writing or changing any question (Learn, Challenge or Check), or any question type, points rule or MYP strand tag |
| 4b, 4c, 4d | `wab-sim-toddle-outputs` | anything on worksheets, build sheets, PDFs, the teacher page, the teacher code, Toddle prompts, answer keys or marking |
| 4e, 4f | `wab-sim-open-builders` | anything on open builders, build tasks, research questions, the evidence journal, or the table and graph makers |

For a new sim, load all three before workflow step 4, in this order: `wab-sim-review-questions`, `wab-sim-toddle-outputs`, `wab-sim-open-builders`. For a change, load each one the work touches, and if unsure, load it. If a companion can't be loaded, tell Tom instead of working from memory of its rules.

## 1. The core design rule: students use it alone

Students open the sim at home or in class with no teacher beside them. Every design decision follows from that.

- **Always obvious what to do next.** Each screen has one clear next action. No dead ends, no hidden controls, no step that needs a teacher to explain.
- **Hint ladder, never a bare answer.** Wrong or stuck → gentle nudge → stronger hint pointing at the sim → worked example. The student still does the final step.
- **Feedback explains why.** Every check says what was right or wrong and links back to what the sim showed.
- **Predict before running.** Students lock in a prediction (choice, slider or sketch), run the sim, then compare and explain. Never show the result first.
- **Safe to experiment.** Reset buttons everywhere, undo where possible, no way to break or lose progress. Silly inputs give a fun, informative response rather than an error.
- **Explore mode prompts real experiments.** Offer "try this" investigations (change one variable, keep the others the same, record what happens) so free play turns into fair testing.
- **Catch misconceptions.** Where a common wrong idea exists (heavier falls faster, current gets used up), design a prediction that reveals it and a run that challenges it.
- **Evidence of work for the teacher.** Because Tom isn't watching, the student's answers, sketches, builds and progress export to a worksheet or build sheet (sections 4b and 4e).
- **Sections of 20–30 minutes that can be combined.** Split every chapter into self-contained sections (e.g. Foundation, Extension) of about 20–30 minutes. Each section has its own Learn steps, optional Challenge, Check questions, stamp and worksheet PDF, so a teacher can set one on its own or several together for a longer session. Every time shown to students or teachers says "approx." (e.g. "approx. 28 min"), estimated from the steps and question types. A finished section offers the next one in a "keep going" box. Progress saves automatically.
- **Something to do in every step.** No step is just a run of info cards. Every Learn step has at least one "Do this" job in the sim and at least one question, even if it is a quick comprehension check on the cards just read, so the flow never stalls.
- **Vary the situations.** Don't let a section's questions all use the same set-up (e.g. every crate sitting still). Mix still and moving, balanced and unbalanced, small and large values.
- **Clues for multi-step reasoning.** Where a question or challenge needs a step students haven't been walked through (e.g. rearranging weight = mass × 9.8 to find the mass), add a "Need a clue?" fold-out that asks a guiding question rather than giving the method ("If you multiply mass by 9.8 to get the weight, what do you need to do to the weight and 9.8 to get the mass?").
- **Do it before you're told it.** Let students try the thing first (rub the balloon on hair, then on a jumper, then hold it near paper), ask what they observed (an observation question for each test), and only then explain the science. Introduce every idea and word before any question or instruction relies on it (e.g. teach static vs current before a mission that uses them; don't ask for a "complete path" before it has been taught).
- **Key ideas are impossible to miss, and students have to use them.** Any text that carries a learning outcome (the main idea of a step, a definition, a rule) is the most eye-catching text on the screen, never the smallest or palest. Learn-step instructions go in a large speech bubble (about 18px, slightly smaller on phones), with a tinted background, a strong coloured border and the key words in bold colour. Then make students act on the key idea so it can't be skimmed, choosing what fits the step:
  - a **pop-out "Key idea" box** that stays open until the student answers a quick multiple-choice question about it;
  - **"Tap the sentence that…"**: show the key text as 3–5 tappable sentences and ask students to tap the one that matches a paraphrase of the concept (e.g. "Tap the sentence that explains why the bulb went out"), with a hint after a wrong tap;
  - a **key-word gap** the student types into.
  Every key idea behind the unit's learning outcomes and standards gets one of these (the standards themselves stay off student screens; map them during planning). Answers are saved with the rest of the Learn answers.
- **Answers are remembered.** Learn/guided answers are saved and shown again when a student returns, with a "Try this step again" button. A "📄 Save my work" PDF button sits in the tab bar so students can save their progress at any time.
- **Never soft-lock.** A student must always be able to recover from a bad choice: undo, remove for a refund (things built this round), sell older items for part of their value, redo a round, go back a round, and start again from the beginning (two-tap confirm). Never leave them repeating a round they can't win.

## 2. Standing preferences

- **Guided mode first, then explore mode.** Guided teaches the basics step by step, introducing each panel slowly; explore shows everything. Explore opens once the first chapter's Foundation section is finished: until then its home card says when it opens, with a "Start Chapter 1" button and an "Open it anyway" button (never a hard block). The stamp pop-up for that section announces "Explore is now open!" with an "Open Explore" button. Teacher mode always gets in.
- **Active, never passive.** Students predict, reason, build and test. Avoid "read this, click next" sequences anywhere in the sim.
- **Challenges use the sim itself.** Build, draw or design something and compare it to an exemplar or a target. Avoid plain quizzes as the main challenge.
- **Open builders in every sim** (section 4e): free, drag-and-drop building of the unit's key things (a circuit, an atom, a power grid on a map, a food web, a machine), each with template build tasks that can be set as classwork or homework.
- **Questions are varied, plentiful and not obvious** (sections 4a-2 and 4a-3): every section ends with a Check (Review) of about 5–10 questions in mixed formats, sized to fit the section's 20–30 minutes, never a run of easy multiple choice.
- **Free-form builders.** Where students build something, make it free-form and drag-and-drop like PhET (parts bin, stretchy wires, snapping ends, drag onto a map) rather than fixed grid slots.
- **Teacher "set classwork or homework" page in every sim** (section 4c), reached from a button at the top of the home screen, with Toddle AI marking support (section 4d).
- **Voice.** Enthusiastic, warm and encouraging, in natural sentences. Avoid clipped, punchy, AI-sounding lines. Read every block of student text aloud in your head before shipping.
- **Short and simple, because reading stamina is low (especially Grade 6).** Short sentences, everyday words, one idea per sentence, explanations of two or three sentences at most. Use numbered steps for instructions. Put detail behind a "How do I read this?" or "Your mission" fold-out instead of on screen. Key terms that remain get glossary hover/tap definitions (section 4).
- **Words that mean the same thing everywhere.** WAB students come from many countries, so avoid words that mean something different in UK and US English or that suggest something else. A student read "torch" as a burning stick, so Sparks says "flashlight". When a regional word is still the clearest choice, add a glossary entry that names the other version ("In the UK it is often called a torch"). Tom is happy with "jumper".
- **Science conventions.** g = 9.8 N/kg (never 10); give students a pop-out calculator for it. Free-body diagrams show the actual object, with weight and normal force drawn from the centre. Use non-round, varied numbers in scenarios so answers aren't guessable.
- **Purpose.** Sims are review, extension and support for a unit, not lesson-by-lesson first teaching. Summative tasks are handled separately.
- **Standards** (ACARA, MYP criteria) are for Tom's planning only. Keep them off every student-facing screen, worksheet and export. Worksheets don't need "I can" statements.
- **Originality.** Each sim gets its own concept and metaphor (Force HQ = map of lab buildings; Sparks = time travel with a time machine). Don't reuse another sim's structure. Offer Tom 3–4 concept options and let him choose before building.
- **Realism.** Physics and animation should look right: smoothed force ramps, sensible graph axes, scenes that stay in one believable setting.

## 3. Workflow

1. **Ground it.** Ask for (or read from the project) the unit overview and lesson sequence. Pull out the key concepts, vocabulary and likely misconceptions.
2. **Concept options.** Propose 3–4 distinct concepts in a few lines each. Wait for Tom's choice.
3. **Science first for big features.** For any new model or engine, explain the science and how it will be modelled before writing code. Wait for a go-ahead.
4. **Plan the stops/labs.** Load all three companion skills first. For each: the key ideas tied to the learning outcomes and how each one is made prominent and checked (section 1), what students predict, what they explore, the challenge, the misconceptions targeted, the question plan (section 4a-3: purpose → type → Learn or Check), the worksheet, and the key vocabulary and goal used on the teacher page. Plan the open builders and their build tasks too.
5. **Build in stages** using the shared shell (section 4) and the file layout (section 5).
6. **Test** (section 6) before every delivery, including feasibility checks for every build task.
7. **Deliver** (section 7), including the AI feedback text and, for records, the printable files (blank template, answer key and marking scheme for every sheet).
8. **Hand off.** At the end of a session, update the sim's brief and backlog (section 8) so the next chat starts cold without a catch-up.

When Tom batches feedback (a list, or artifact comments), make a task list from it, address every item, and report briefly on each.

## 4. The shared lab shell

Reuse these components across sims instead of rebuilding them. If a `shell/` folder already exists, copy it in and adapt the theme; if not, build them as reusable modules the first time.

- **Info cards:** small dismissible cards over the scene that deliver teaching content.
- **Journal:** every info card and key result is saved to a persistent journal the student can reopen from anywhere.
- **Question box ("Your turn"):** Learn questions stay hidden while the student does the step. The Next button reads "Next: questions →"; pressing it with the Do this list unfinished shows a warning with "Continue anyway", then the questions pop up in a box. The box has "▾ Minimise" (Escape does the same), which docks it as a small "Your turn ⤢ Open" tab in the side column, and its footer has "← Back to the arena" and the next-step button. Diagram questions minimise it automatically. Answers can be typed or drawn.
- **Every pop-up is draggable and never blocks the sim.** Any pop-up that can cover the simulation (the question box, info cards, how-to-read cards) is dragged by its header bar (a ⠿ grip, `cursor: grab`, `touch-action: none`) using pointer events, so mouse, pen and touch all work. Use one shared helper (`makeDraggable(box, handleSelector, key)`) for all of them. The layer behind a pop-up is transparent and click-through (`pointer-events: none` on the layer, `auto` on the box), so students can read meters and use controls with the questions open. The header always stays on screen (clamp the box so its header can't leave the viewport, measuring from the box top to the header bottom), the box keeps its spot while the page is open (also for the next card), and it re-clamps on resize. Buttons inside the header still work. Modals that genuinely need an answer (the name box, warnings) stay as normal modals. Test at phone width, where a pop-up is nearly full screen and dragging it down is how students uncover the sim.
- **Every slider has a typed number box.** Beside each slider, a small number input takes any value the slider allows (applied on Enter or when the box loses focus, clamped to the slider's range), so students never fight a slider to hit an exact value.
- **Target-finding gets too-high / too-low markers.** When a task asks students to find a value by trial and error (a brake force that stops a crate on a mark), each try leaves a marker on the slider: red for a value that was too high, yellow for one that was too low, keeping only the closest of each, with a note under the slider ("too low: 48 N · too high: 150 N. The right value is between them.").
- **Labels stay on screen.** Readings drawn on a canvas (meters, labels, pills) are clamped inside the canvas in every state (e.g. when an object reaches the end of its track), so a question that reads them can always be answered.
- **Journal = a side panel with three tabs: Runs, Notes, Vocab.** The Journal opens beside the sim (on screens 1180 px and wider it pushes the page aside instead of covering it), so students can read it while they use the sim and answer questions. The header Journal button toggles it.
  - **📋 Runs (run history):** every action that runs the sim (pull, push, launch, drop, build test) starts a run that updates live while it plays and is then saved, with one plain sentence ("You pushed the 24 kg crate on the air floor. It glided at a steady 3.13 m/s all the way to the end of the arena.") and chips for the key numbers (mass, surface, forces, top speed, distance, stopping distance, time). Runs from the current step are open; earlier runs fold to a one-line summary the student can open. A question that asks for a value from an earlier run must never force the student to run the experiment again; questions still check against the student's own recorded runs.
  - **📝 Notes:** the saved info cards with the student's own notes and questions, plus Evidence of my learning.
  - **🔤 Vocab:** every glossary word the student has met (counted once it has actually been on screen, or its definition opened), A to Z, with its meaning, where it was first met and a search box. This feeds the flashcards planned for every sim and lab.
  - The Your turn box has one big **"📋 See my runs"** button (with a count) that opens the Journal on the Runs tab; don't list runs inside the question box. Introduce the Journal and its tabs in the first chapter's first step, with a Do this job to open the Runs tab.
- **Table maker and graph maker:** for investigations where students collect their own numbers, a journal table (typed beside the sim) and a graph window where they drag each point or bar into place, like the Paper Plane Lab graph tool. Both can be chosen as evidence and print on the worksheet. See section 4f.
- **Drawing pad:** pressure-sensitive sketch pad for diagrams (free-body diagrams, circuit sketches, models), with pens, eraser, undo and clear. Saved as strokes plus a PNG for worksheets.
- **Calculator:** a floating "🧮 Calculator" button on **every screen** (bottom-right, icon-only on phones, hidden in print; always visible above the Journal and other side panels, moved clear of an open panel) that pops out a draggable calculator: big display with the last sum shown above, keys C ( ) ⌫ 0–9 . ÷ × − + =, typing and Enter supported (typing x or * shows ×, / shows ÷), friendly errors ("You can't divide by zero."). Evaluate with a small safe parser, never `eval`. Add a formula-triangle helper where relevant (F = m × a, V = I × R, W = F × d).
- **Glossary:** key terms (about 50–80 per sim, including terms used in questions such as "whole-life CO₂" or "kWh") are automatically underlined with a dotted line wherever they appear (first use per card/question, via a MutationObserver over the app) and show a one- or two-sentence definition on hover (mouse), focus, or tap (touch, with a short toggle guard so the tap doesn't immediately close it). Hidden in print.
- **Fun facts:** clickable facts tied to concepts already met.
- **Onboarding tour:** first-run tour highlighting journal, calculator, glossary, question box and modes. Replayable.
- **Progress and rewards:** badges/stamps/XP, with a visible map of what's done and what's next. Show the stamp images themselves (on the home screen and when earned, with a stamp-down animation). Follow section 4a.
- **Review engine, worksheets, teacher page, AI marking and open builders:** sections 4a-2 to 4e.
- **Who's using it:** ask for the student's **name and class at the very start** (a simple modal before the home screen). **Nobody gets in without a name or the teacher code:** closing the box (Cancel, Escape or clicking outside) sends them back to it. Build the box as plain divs with click and Enter handlers rather than a `<form>`, because sandboxed previews block form submission. Show the name at the top left of every screen as a chip with a "Change" button. Worksheets and build sheets **can't be saved as PDF without a name and class** (the print view shows "No name, no worksheet!"): this discourages copying. An "I'm a teacher" option asks for the teacher code (section 4d); teacher mode unlocks every stop, step and chapter and lets PDFs save without a name, with a "Switch to student mode" button so Tom can play through as a student and switch back.
- **Save:** progress and answers stored in localStorage, every read/write wrapped in try/catch, and the sim must work fully if storage is unavailable.
- **Layout:** controls docked beside or under the simulation so students rarely scroll. Big game-like activities get a **wide layout** (up to ~1500 px, simulation left and controls right) and a **focus mode** that hides the surrounding page chrome; put the briefing in a collapsible "📋 Your mission" panel (open only before the first attempt) and results in **tabs** ("What happened", "Scorecard", "Money") in a fixed-height scroll box. Keep the main action button and every "what next" button (next round, redo, back, start again, undo) **together in one row**. Test desktop, iPad and phone widths. Support touch and mouse.
- **Actions appear where you tap.** In builders and boards, tapping a part, connection or junction opens a small pop-up menu right beside it (positioned at the tap point, kept inside the board) with only the actions for that thing, clear icons (✂ Cut / ✂ Disconnect here, ➕ Add a joining point, Turn it around, Remove) and a ✕ to close. No action bar tucked away below the board. Put one line under the board: "Tap a part, a wire or a dot to see what you can do with it."
- **Hidden elements:** add `[hidden]{display:none !important}` to the stylesheet so a component's own `display` rule never reveals something meant to stay hidden (for example a model answer before the student has tried).

## 4a. Progress, freedom and measuring (learned from classroom use)

**Make progress obvious**
- **Every task shows its state, loudly.** Done = green "✓ Done" pill and border; not done = amber "To do". The map/stops show done (green), part-done (amber) and not started.
- **"On this page" bar** at the top of each screen ("2 of 5 done") with chips that scroll to each task.
- **Done means complete, never correct.** A task turns green when every box has something in it or it reaches a sensible minimum; say under each task what makes it turn green.
- **Prerequisites stated exactly** ("You need to finish the Drop Lab first: 2 runs to go") with a "Go to …" button.

**Freedom**
- **Block only what the next activity can't run without.** Everything else warns with "Continue anyway". Never disable a Next button for unfinished but non-essential work.
- **Order of a section:** Learn → Challenge (optional) → Check. The Check (and its worksheet) opens once the Challenge is complete, or once Learn is complete if the section has no Challenge, with a "Continue anyway" option, so the worksheet shows understanding built in the sim.
- **Point students to the Check after Learn.** Explore and other free play can sit between Learn and the Check, and students who wander off never make their worksheet. When Learn finishes, the stamp pop-up says the Check comes next and makes the worksheet they hand in on Toddle, with "Start the review →" (primary) and "Explore first". Explore shows a "📄 Don't forget your worksheet!" banner with a "Go to the review" button until that Check is complete (not in teacher mode). Finishing the last Challenge mission does the same for its own review.
- **Make each finished step look finished:** a green tick, a "Step complete" banner and a clearly highlighted Next button.
- When something essential is missing, take the student straight to it, outline it in red and explain in a pop-up (shown after any intro pop-up).

**Measuring by hand**
- Let students measure for themselves where possible (read scales, time events, calculate), with simple aids: zoomed scales, countdowns, the needed control highlighted, the reading shown beside the entry box, a keep-or-redo choice, a calculator. Once the student has typed a value, the sim can check it and explain, because sims are for learning.
- **Students type every reading. Never auto-fill a results table.** When a meter or scale shows a value (ammeter, voltmeter, stopwatch, force meter), the step isn't complete until the student reads it and types it in. Use a reading table: each row unlocks once that set-up is on screen, the student types the value, and the sim checks it within a small tolerance ("Look again at the meter. Copy the number exactly.") before ticking the row. Saved like other Learn answers. Students should never be passengers.
- **Collect data where the sim is, never behind "Next".** Anything a student has to read, measure or record from the arena must be on screen next to the arena the moment the step opens, and must be typeable straight away. Three rules:
  - **A Do this task never points at a question that only opens later** (for example "Answer the key idea question in the Your turn box, which opens when you press Next: questions"). The unfinished-tasks warning counts it as undone and sends the student round in a circle. Questions that are not about the sim stay in the Your turn box and are not listed as tasks.
  - **Numbers read from the arena get an inline answer box in the Do this list** (task `[html, fn, {q:'q1'}]`) with its own Check button. What the student types copies into the matching Your turn question, so they type once. Use it for every value they read off the sim: settled velocity, fall time, a weight on a scale.
  - **Tables the student fills while the sim runs sit under the arena** (`early: true` on the question, shown in a "Collect your data here" card), not in the Your turn box. Each row says when to act ("Pause in the first second of the fall") so nobody has to ask which rows or where.
- **No "Use this moment" buttons.** Pausing at the moment a row describes fills that row in by itself (the first empty row whose "when" fits), with a toast, and a small "Pick another moment" button to redo a row. A button that can say "no moment attached" is one more thing to get wrong.
- **Never jump the page or steal keyboard focus while a student is using a control** (for example a running stopwatch). Use buttons to move between the experiment and the results ("📋 Write it in my table ↓", "⬆ Back to the experiment"). Show only the tools a measurement needs.

## 5. Build setup

- Source in `src/` split by concern (shell, physics/model, each lab or stop, review question data, builders, workshop tasks, marking, teacher page, glossary, calculator, styles). A small `build.js`/`build.py` concatenates into:
  - `dist/<Name>-offline.html`: the clean single-file deliverable.
  - `dist/test.html`: same build plus a debug hook on `window.__<short>` exposing state and key functions for tests.
  - `dist/worksheets/`, `dist/build-sheets/`, `dist/marking-schemes/` and the Toddle files zip.
- In Tom's GitHub repo (`tmh80/tmh-teaching-apps`) each app has its own folder: `<app>/src/`, `<app>/build.js`, `<app>/tests/`, `<app>/docs/`, with the Toddle file `<app>/<Name>-offline.html` at the folder root and the Toddle files in `<app>/worksheets/`. The repo keeps its own copies of this skill and its three companions in `.claude/skills/`; keep every copy in step.
- **Self-contained offline file.** No external requests at runtime: no Google-hosted fonts, no CDN links. Inline libraries and embed fonts/images as data URIs. Keep the file under 16 MB.
- Keep student-facing text in one content module so voice rewrites touch one place.
- Run `node --check` on each source file, not only the bundle, so syntax errors point to the right file.

### Images and art

Code-drawn SVG/canvas is the default. When richer art is needed:
- **Sprite sheet:** ask Tom for one generated image containing every part in one style on a flat background. Slice with PIL, remove the background, trim, and embed.
- **Trace to vector:** convert supplied art to SVG (potrace or vtracer) when parts must stay reshapeable.
- **Open-licence assets:** PhyloPic (organism silhouettes), Kenney, OpenMoji. Check licences and record credits in the backlog/brief. Try npm/GitHub first, since other sites are usually blocked from the sandbox; otherwise ask Tom to attach files.
- Ask for 2–3 reference screenshots before any art pass.

## 6. Testing (before every delivery)

- Headless Playwright on `dist/test.html`: load, check for console errors, then play through guided mode, each mission, explore mode and each builder using the debug hook (`page.evaluate`) where custom interactions are hard to click. Expose each workshop builder on its own hook (e.g. `window.__wsBoard`), because model drawings on the same page may create other boards.
- For custom SVG drag-and-drop (parts bins, map palettes), use `page.mouse.move/down/up` with intermediate steps rather than built-in drag helpers, and convert model coordinates to screen coordinates with the SVG's `getScreenCTM()`; scroll the target into view first.
- Prediction options are shuffled: click the right one by its text, not by position.
- Verify physics and maths with a script (expected values at g = 9.8 N/kg, formula results, edge cases), check every Review calculation's stated answer, check every question has a model answer, and check every build task is achievable (section 4e).
- Answer each Review type at least once (right and wrong), including drawing on the pad with real mouse moves. Check that one go locks each question and shows the right answer, that synonyms are accepted, and that the points add up. Complete each build task and confirm every check turns green, and that a wrong build (e.g. series instead of parallel) leaves the right check grey.
- Drag every pop-up by its header with real mouse moves and with touch (`has_touch`) at desktop and phone widths: it follows the pointer, its header stays on screen, its spot is kept, buttons in the header still work, and the sim behind it can still be clicked.
- Check each section's question plan against section 4a-3 with a script: types per Check (at least five, at most two choose one, no two of the same type in a row), and every listed misconception targeted at least twice.
- Check every choice question for a specificity pattern, every explain question for its words-to-use list, every slider's number box (typing a value, out-of-range values clamped), and the too-high/too-low markers on target tasks.
- Check the run history: each kind of run (still, moving, stopped by friction, reaching the end, braked, paused or reset) gives the right sentence and numbers, appears in the Journal's Runs tab (this step open, earlier runs folded), the Your turn box's See my runs button opens it, and the Journal opens beside the sim and closes at desktop and phone widths with the calculator button still visible.
- Check the name gate: Cancel, Escape and clicking outside return to the name box, and the teacher code gets in.
- For round-based games, test the recovery paths: go bankrupt, then redo, go back a round, undo, sell, and start again, and confirm money and buildings restore correctly.
- Screenshot each lab at desktop, iPad and phone widths; review them as a tiled contact sheet. Check `scrollWidth` equals the viewport width at phone size on every page, including the teacher page and workshops.
- Check the offline file makes no network requests.
- Run a half-finished playthrough: confirm the "To do" states, the "On this page" bar, the exact prerequisite messages, the "Continue anyway" warnings, the redirect to anything essential and the pre-export list.
- Test every manual-measuring flow with real mouse clicks and key presses (not only the debug hook). Check the page never scrolls by itself while a control is in use.
- Render every worksheet and build sheet PDF (student, blank, key) and every marking scheme to images and check them: page count, no split questions or orphan headings, white background, answers not always in the first option, drawings and build snapshots exported, student content in blue, blank template matching the student layout, every question answered in the key.
- Generate the teacher prompt for a multi-section + build-task selection and read it through as Tom pasting it into Toddle; check the locked buttons (wrong code refused, right code accepted) and read a marking scheme through as Toddle AI would, checking every row is identifiable and the totals add up.
- Check the Toddle text: the task-maker prompt contains no answers and never says files are attached; the AI feedback text contains every selected question, the strands, the level table and correct totals per criterion, and its character count updates. Check every Check item has `obj`, and that strands appear on answer keys, schemes and the teacher page but never on student or blank sheets (search the rendered HTML for "MYP").
- Check file names: stub `window.print` and confirm `document.title` is the expected name during printing and restored afterwards. Finish Learn as a student and confirm the pop-up and both buttons; confirm the Explore reminder banner disappears once the Check is complete.
- Search student-facing text for words that change meaning between UK and US English.
- **Independent-use check:** play through as a confused Grade 6 student with no teacher. Note any moment where the next step is unclear, a hint is missing, a question is too obvious, a term is unexplained, or text reads as clipped, too long or too hard. Fix before shipping. For major releases, run this check with a separate agent that hasn't seen the build.

## 7. Delivery

In claude.ai:
- Publish/republish the Artifact at the same URL (online preview). Read the live artifact first in case it changed elsewhere.
- Send `dist/<Name>-offline.html` with SendUserFile: this is the file Tom uploads to Toddle.
- Send the Toddle files zip (one folder per sheet) and the merged answer-key PDF when questions, build tasks or schemes change.
- Don't save HTML files to the claude.ai project: it has a size limit, and GitHub already keeps every version. Keep the project for small text docs (briefs, handoffs, scripts, specs) and update those when they change.
- Tell Tom the teacher code (first word of the sim's name).

In Claude Code:
- Commit to the repo with a clear message; the offline file and Toddle files are the deliverables. Tell Tom the paths.

Then give a short summary: what changed, anything not done, one suggested next step.

## 8. Brief and backlog

Keep two short docs per sim (in the project, or in the repo's `docs/`):
- `<Name>_Brief.md`: what the sim is, file structure, debug hook functions, what must not break, art style, credits, teacher code.
- `<Name>_Backlog.md`: ideas and requests banked for later, with any open questions for Tom.
Update both at the end of every working session.