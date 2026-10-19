---
name: wab-science-sim-builder
description: Build or extend a self-contained interactive science sim (HTML) for Tom's WAB MYP Grade 6–8 classes that students use independently for homework, review and extension via Toddle.
---

# WAB Science Sim Builder

For open-ended science simulations in the family of Force HQ (G7/8 forces), Sparks Through Time (G6 electricity) and Adapt Lab (G7/8 adaptations/evolution). Fixed-sequence labs with a graded write-up (like Paper Plane Lab) follow the same completion, freedom and hand-in rules (section 4a).

Tom is Head of MS Sciences at WAB (Beijing). Grade 6 is one class; Grade 7/8 is a mixed class on Cycle A / Cycle B.

## 1. The core design rule: students use it alone

Students open the sim at home or in class with no teacher beside them. Every design decision follows from that.

- **Always obvious what to do next.** Each screen has one clear next action. No dead ends, no hidden controls, no step that needs a teacher to explain.
- **Hint ladder, never a bare answer.** Wrong or stuck → gentle nudge → stronger hint pointing at the sim → worked example. The student still does the final step.
- **Feedback explains why.** Every check says what was right or wrong and links back to what the sim showed.
- **Predict before running.** Students lock in a prediction (choice, slider or sketch), run the sim, then compare and explain. Never show the result first.
- **Safe to experiment.** Reset buttons everywhere, undo where possible, no way to break or lose progress. Silly inputs give a fun, informative response rather than an error.
- **Explore mode prompts real experiments.** Offer "try this" investigations (change one variable, keep the others the same, record what happens) so free play turns into fair testing.
- **Catch misconceptions.** Where a common wrong idea exists (heavier falls faster, current gets used up), design a prediction that reveals it and a run that challenges it.
- **Evidence of work for the teacher.** Because Tom isn't watching, the student's answers, sketches and progress export to a worksheet (see shell).
- **Short chunks.** Missions take roughly 5–15 minutes, so a student can stop and come back. Progress saves automatically.

## 2. Standing preferences

- **Guided mode first, then explore mode.** Guided teaches the basics step by step; explore opens the sandbox once the basics are done.
- **Active, never passive.** Students predict, reason, build and test. Avoid "read this, click next" sequences anywhere in the sim.
- **Challenges use the sim itself.** Build, draw or design something and compare it to an exemplar or a target. Avoid plain quizzes as the main challenge; varied formats (drag-to-sort, match with lines, tap-to-explore, sketch pad) are welcome as smaller checks.
- **Voice.** Enthusiastic, warm and encouraging, in natural full sentences at a Grade 6–8 reading level. Avoid clipped, punchy, AI-sounding lines. Read every block of student text aloud in your head before shipping.
- **Science conventions.** g = 9.8 N/kg (never 10); give students a pop-out calculator for it. Free-body diagrams show the actual object, with weight and normal force drawn from the centre. Use non-round, varied numbers in scenarios so answers aren't guessable.
- **Purpose.** Sims are review, extension and support for a unit, not lesson-by-lesson first teaching. Summative tasks are handled separately.
- **Standards** (ACARA, MYP criteria) are for Tom's planning only. Keep them off every student-facing screen and export.
- **Originality.** Each sim gets its own concept and metaphor (Force HQ = map of lab buildings; Sparks = time travel). Don't reuse another sim's structure. Offer Tom 3–4 concept options and let him choose before building.
- **Realism.** Physics and animation should look right: smoothed force ramps, sensible graph axes, scenes that stay in one believable setting.

## 3. Workflow

1. **Ground it.** Ask for (or read from the repo/project) the unit overview and lesson sequence. Pull out the key concepts, vocabulary and likely misconceptions.
2. **Concept options.** Propose 3–4 distinct concepts in a few lines each. Wait for Tom's choice.
3. **Science first for big features.** For any new model or engine, explain the science and how it will be modelled before writing code. Wait for a go-ahead.
4. **Plan the stops/labs.** For each: what students predict, what they explore, the challenge, and the misconception targeted.
5. **Build in stages** using the shared shell (section 4) and the file layout (section 5).
6. **Test** (section 6) before every delivery.
7. **Deliver** (section 7).
8. **Hand off.** At the end of a session, update the sim's brief and backlog (section 8) so the next chat starts cold without a catch-up.

When Tom batches feedback (a list, or artifact comments), make a task list from it, address every item, and report briefly on each.

## 4. The shared lab shell

Reuse these components across sims instead of rebuilding them. If `shared/` in the repo has them, copy them in and adapt the theme; if not, build them as reusable modules and add them to `shared/`.

- **Info cards:** small dismissible cards over the scene that deliver teaching content.
- **Journal:** every info card and key result is saved to a persistent journal the student can reopen from anywhere.
- **Question box:** questions sit in a large fixed box (not a popup) so students can keep using the sim while answering. Answers can be typed or drawn.
- **Drawing pad:** pressure-sensitive sketch pad for diagrams (free-body diagrams, circuit sketches, models).
- **Calculator:** pop-out calculator, plus formula-triangle helper where relevant (F = m × a, V = I × R, W = F × d).
- **Glossary:** tappable key terms with short student-friendly definitions.
- **Fun facts:** clickable facts tied to concepts already met.
- **Onboarding tour:** first-run tour highlighting journal, calculator, glossary, question box and modes. Replayable.
- **Progress and rewards:** badges/stamps/XP, with a visible map of what's done and what's next. Follow section 4a.
- **My Worksheet export:** follows the hand-in rule in section 4a: a clean PDF of the student's own work (answers, sketches, badges, with a fun celebratory design suitable for a parent portfolio; exclude incomplete challenges) plus a separate feedback sheet with the auto-marked checks. Run the pre-export check first.
- **Save:** progress stored in localStorage, every read/write wrapped in try/catch, and the sim must work fully if storage is unavailable.
- **Layout:** controls docked beside or under the simulation so students rarely scroll. Test desktop, iPad and phone widths. Support touch and mouse.

## 4a. Completion, freedom and hand-in (learned from classroom use)

These rules apply to every sim and lab. They came from running Paper Plane Lab with a real class.

**Let students do the work, including getting it wrong**
- **Never force the right answer.** Students can submit wrong or weak work: extra or missing materials, a method in the wrong order, a wrong unit. Nothing makes them fix it before moving on, and nothing removes or hides wrong choices. Otherwise everyone is hand-held to the correct answer and the assessment means nothing. Optional "Check my answer" help is fine at lower challenge levels.
- **Done means complete, never correct.** A part turns green when every box in it has something in it (for example all three control variables *and* how each is controlled), or when it reaches a sensible minimum (for example at least 4 materials, each with an amount, and at least 4 method steps). Say under each part what makes it turn green. One word per box is enough, and correctness is never checked: a weak or wrong answer simply earns a lower level. Not being done never blocks the student; it only shows as "To do" and in the warnings.
- **Block only what the experiment needs.** The only things that can stop a student are the choices the sim cannot run without (for a fair-test lab: the independent variable, the dependent variable, enough groups to compare, the set-up the sim needs). In middle school the experiment runs from the IV, DV and control settings, so the written method, materials and control-variable notes are assessed, never enforced.
- **When an essential is missing,** move the student straight to the first missing one, outline it in red and explain in a pop-up exactly what is needed. If a step intro pop-up is showing, show the explanation straight after it.
- **Everything else warns.** Leaving a page with unfinished parts shows "You haven't finished this page" with the list, plus "Continue anyway" and "Go back and finish". No Next button is ever disabled for non-essential work.

**Make progress obvious**
- **Every task shows its state, loudly.** Done = green "✓ Done" pill and a green left border. Not done = amber "To do" pill and an amber border. Navigation (step bar, map, stops) marks each part done (green), part-done (amber) or not started.
- **"On this page" bar** at the top of each screen: "2 of 5 done", with a chip for every task. Clicking a chip scrolls to that task and flashes it.
- **Prerequisites stated exactly.** When a later step depends on an earlier one, say exactly what is missing ("You have chosen 1 experimental group. You need at least 2.", "2 averages are missing in Table 1") with a "Go to …" button. Never a vague "do X first".
- **Pre-export check.** Before saving any PDF, list every unfinished part, grouped by step, with "Go there" buttons, plus "Save anyway" and "Go back and finish". "Go there" (and "Go and finish it" on any checklist) outlines unfinished parts in red, highlights their empty boxes and scrolls to the first.

**Measuring by hand**
- **Students measure for themselves whenever possible:** read the scale, estimate the last digit, time with a stopwatch, work out averages. Never give them the value.
- **Make manual measuring simple:** a zoomed view of the scale, a countdown before anything that is timed, the control they need highlighted while it is needed, an entry box right next to the reading, a clear "Keep it or redo it?" choice after each measurement, and a calculator for averages.
- **Don't say if a measurement is right during the activity.** Show accuracy on the feedback sheet instead.
- **Never jump the page during measuring.** Don't scroll automatically, and don't move the keyboard focus away from a control the student is using (the space bar must still work a stopwatch). Instead, once the measurement is finished, show a big highlighted button such as "📋 Write my time in my table ↓", and next to the entry box show the reading they are copying (for example "⏱ Your stopwatch reads 1.78 s") plus "⬆ Back to the flight view". After "Keep it" or "Redo it", take them back up to the experiment.
- **Only show the tools that measurement needs.** For example, no tape-reading panel in a timing test.

**Hand-in: two PDFs on Toddle**
1. **The work:** only the student's own answers, tables, graphs and sketches, laid out simply. No auto-checks, flags, colour-coding or hidden data, so a teacher or an AI marker can read it easily.
2. **The feedback sheet:** what the auto-checks found (what went well / what to work on per strand, with a level never above the challenge cap), a "What to check" list, accuracy comparisons (for example measurements vs real values), and any behind-the-scenes data.

Both carry the student's name, class, date and challenge level. Show the level once, in the header of every page (for example "★ DEVELOPING · Highest grade: Developing"); don't repeat it as a big banner. The checklist requires both to be saved, and the finish screen shows which ones have been saved.

**Keep both PDFs short.** The work PDF should be about 3 A4 pages and the feedback sheet 2, for a typical student. Use compact print, a graph at about two-thirds width, tight spacing, and run sections on rather than starting new pages (an easy way: draw each page on a canvas larger than A4 so everything prints smaller). Never cut a student's writing to save space.

## 5. Build setup

- Source in `<app>/src/` split by concern (shell, physics/model, each lab or stop, content text, styles). A small `build.js` concatenates into:
  - `<app>/<Name>-offline.html`: the clean single-file deliverable.
  - `<app>/dist/test.html`: same build plus a debug hook on `window.__<short>` exposing state and key functions for tests.
- **Self-contained offline file.** No external requests at runtime: no Google-hosted fonts, no CDN links. Inline libraries and embed fonts/images as data URIs. Keep the file under 16 MB.
- Keep student-facing text in one content module so voice rewrites touch one place.
- Run `node --check` on each source file, not only the bundle, so syntax errors point to the right file.

### Images and art

Code-drawn SVG/canvas is the default. When richer art is needed:
- **Sprite sheet:** ask Tom for one generated image containing every part in one style on a flat background. Slice with PIL, remove the background, trim, and embed.
- **Trace to vector:** convert supplied art to SVG (potrace or vtracer) when parts must stay reshapeable.
- **Open-licence assets:** PhyloPic (organism silhouettes), Kenney, OpenMoji. Check licences and record credits in the brief. Try npm/GitHub first, since other sites are usually blocked from the sandbox; otherwise ask Tom to attach files.
- Ask for 2–3 reference screenshots before any art pass.

## 6. Testing (before every delivery)

- Headless Playwright on the test build: load, check for console errors, then play through guided mode, each mission and explore mode using the debug hook (`page.evaluate`) where custom interactions are hard to click.
- For custom SVG drag-and-drop, use `page.mouse.move/down/up` with intermediate steps rather than built-in drag helpers.
- Verify physics and maths with a script (expected values at g = 9.8 N/kg, formula results, edge cases like zero or huge inputs).
- Screenshot each lab at desktop, iPad and phone widths; review them as a tiled contact sheet.
- Check the offline file makes no network requests.
- Run a half-finished playthrough: confirm the "To do" states, the "On this page" bar, the exact prerequisite messages, the "Continue anyway" warnings, the redirect to the first missing essential, the pre-export list and the "Go there" highlighting. Confirm a one-word or wrong answer counts as done and never blocks.
- Test every manual-measuring flow with real mouse clicks and key presses (not only the debug hook), including optional tools such as a stopwatch in a distance test. Check the page never scrolls by itself, the "go to my table" and "back to the experiment" buttons work, and the reading being copied is visible next to the entry box.
- Render both PDFs to images and check them: the work PDF has no flags or checks; the feedback sheet has them all. Check the page counts at every challenge level (about 3 pages for the work, 2 for the feedback sheet).
- **Independent-use check:** play through as a confused Grade 7 student with no teacher. Note any moment where the next step is unclear, a hint is missing, or text reads as clipped or too hard. Fix before shipping. For major releases, run this check with a separate agent that hasn't seen the build.

## 7. Delivery

In this repo (Claude Code or a claude.ai chat with the repo attached):
- Commit with a clear message and push. The `-offline.html` file is the Toddle deliverable; tell Tom its path.
- In claude.ai, also publish/republish the Artifact at the same URL for an online preview (read the live artifact first in case it changed elsewhere), and send the offline file with SendUserFile.

Then give a short summary: what changed, anything not done, one suggested next step.

## 8. Brief and backlog

Keep two short docs per sim in `<app>/docs/`:
- `Brief.md`: what the sim is, file structure, debug hook functions, what must not break, art style, credits.
- `Backlog.md`: ideas and requests banked for later, with any open questions for Tom.
Update both at the end of every working session.
