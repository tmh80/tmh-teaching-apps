# Paper Plane Lab: brief

**What it is.** A two-lesson virtual lab for Grade 6 (scientific method and lab report writing). Students choose a challenge level (Developing, Proficient, Mastering, Einstein; grade capped at the level, Einstein capped at Mastering), then work through Observe → Question → Hypothesis → Plan → Test flights → Results → Analysis → Evaluation → Finish, with two extensions (peer review, a new investigation at a higher level).

**Toddle file:** `Paper-Plane-Lab-offline.html` (built from `src/`). Students hand in two PDFs: the lab report (their work only) and the feedback sheet (checks, "What to check", Table 1 vs real values, behind-the-scenes data).

## Files
- `src/model.js` flight physics (2D glide, seeded noise, wind/draft, fold errors, band stretch)
- `src/core.js` state, levels, variables, built-in flaws, trend helpers
- `src/lab.js` simulator, stopwatch, tape, Table 1, calculator, thrower comments, fold close-ups
- `src/graph.js` graph builder, line/curve of best fit and its accuracy check
- `src/steps1.js` start, Observe, Question, Hypothesis, Plan; `src/steps2.js` Results, Analysis, Finish, extensions; `src/evaluate.js` Evaluation
- `src/report.js` rubric, flags, PDF engine (lab report, feedback sheet, certificate)
- `src/progress.js` done/to-do states, "On this page" bar, pre-save check, navigation warnings and essential-only redirects
- `src/intro.js`, `src/tour.js`, `src/sheet.js` (My report panel), `src/teacher.js`, `src/app.js` (events, navigation)
- `build.js` → `Paper-Plane-Lab-offline.html` and `dist/test.html` (test hook `window.__T`)
- `tests/` Playwright playthroughs: `walkthrough.py <level> [iv] [dv]`, `walkthrough_time.py`, `nav_guard.py`, `stopwatch.py <dist|time> <space|click>`

## Must not break
- Students are never told during the lab whether a reading or average is accurate; the feedback sheet shows it.
- Nothing blocks a student except what the experiment needs (IV, DV, at least 2 groups, where to fly, how to launch). Everything else warns with "Continue anyway". Wrong answers are allowed.
- The page never scrolls away from, or steals keyboard focus from, a running stopwatch.
- Offline: no network requests. Grade 6 uses bands only (no numbers).
