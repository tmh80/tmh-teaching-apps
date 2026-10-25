# Force HQ (rebuild): brief

**What it is:** an interactive forces sim for Tom's Grade 7/8 Forces unit (WAB, IB MYP). Students use it alone at home or in class via Toddle. This is the October 2026 rebuild, which replaces the old multi-lab Force HQ. The full plan is in `Force_HQ_Rebuild_Brief.md` (project).

**Sections:** every chapter is split into self-contained sections of about 20–30 minutes (Foundation, Extension). Each section has its own Learn steps, optional Challenge, Check questions and worksheet PDF. They are defined in `src/js/55-sections.js` (`SECTIONS`, `secMins`). Chapter 1 Foundation (`c1f`) is about 28 minutes and Chapter 1 Extension (`c1x`) about 29 minutes. Chapter 1 Foundation has a step on resultant force (`s3r`: balanced and unbalanced forces on the air floor) after the two-team step; the "Coming up in Force HQ" preview step (`s11`) was taken out to keep the section to approx. 30 minutes (its data is still in `41-ch1.js`).

**Status:** Chapters 1 and 2 are built, each as a Foundation and an Extension (Learn, Challenge where there is one, Check, worksheet and Toddle files). Chapter 2, "Inertia", has a Foundation (`c2f`, 6 steps, approx. 23 min) and an Extension (`c2x`, 2 steps plus the "Inertia obstacle course" Challenge, approx. 26 min). Chapters 3–5, the Drop Zone and the Workshop are still to come.

**Home screen (October 2026 polish):** a dark "night stadium" hero with the arena illustration, an "Up next" card that resumes the first unfinished section, stats (stamps, sections done, Journal cards) and a hazard-stripe edge; open chapters as a featured card with a tile per section (progress bar, parts, stamp); later chapters as a "coming soon" route; Explore and Workshop cards; a stamp book. The "For teachers" button sits in the header on the home page only. The welcome (name) box has a matching dark header.

**Teacher code:** FORCE (first word of the name). It unlocks answer keys, marking schemes and teacher mode.

## Files
- `src/fonts.css`: embedded fonts (Saira Condensed, Atkinson Hyperlegible, JetBrains Mono), so the file works offline.
- `src/tokens.css`: colour tokens, light and dark.
- `src/app.css`: all layout and component styles, plus the print styles.
- `src/index.html`: page markup. The arena `#lab` lives in `#labPark` and is moved into whichever view needs it.
- `src/js/`, concatenated in name order inside one IIFE:
  - `00-util.js`: helpers and storage (localStorage key `forcehq2`, every read and write wrapped).
  - `10-engine.js`: tug-of-war physics: `PUL` puller strengths, `FLOORS`, `forces()`, `staticForces()`, `stepSim()`. Chapter 2 adds a launcher and a brake: the crate starts at `S.x0`, `launch()` sets it moving at `S.v0`, and once it crosses the brake line `S.brakeX` a brake of `S.brakeF` newtons pushes against the motion until it stops (`f.brk`; it never pushes backwards). `clearCh2()` switches it all off; it runs on every step change, in Explore and in the Challenge.
  - `11-draw.js`: canvas helpers, people, and flat animals (dog, husky, pony, horse) each with their own silhouette, plus the arena.
  - `12-arena.js`: the lab. `LAB.show` holds the panels on screen; there is drag-and-drop (drag on, off and across), readouts, the live FBD and the main loop.
  - `19-home-art.js`: the home illustration (`drawHomeArt`): a stadium with stands, crowd, roof and floodlights; the Snow Arena dome with pines; the Drop Zone lattice tower with a parachutist; the Space Dome with stars and an orbit ring; the brick Workshop with a crane; plaza, trees and people. Its own fixed daytime palette; click targets in `HOMEHIT`.
  - `20-shell.js`: views, home (with the zoomed-in arena complex), name and class, teacher code.
  - `21-calc.js`: pop-out calculator with a safe parser (no eval).
  - `22-glossary.js`: `TERMS`, `vocabMet`/`vocabWatch` (a word counts as met once it has been on screen, seen by an IntersectionObserver, or its definition has popped up; stored in `DB.vocab`), and auto-underlining of any `.gl` container through a MutationObserver.
  - `23-cards.js`: info cards, the "How do I read this?" `INFO` cards and the **Journal**: a side panel beside the arena (`#journal`; on screens 1180 px and wider it pushes the page aside) with three tabs (`JTAB`, `openJournal(tab)`, `closeJournal`, `renderJournal`): **📋 Runs** (`runsTabHTML`), **📝 Notes** (cards, the student's notes, evidence) and **🔤 Vocab** (`vocabHTML`: every glossary word met, A to Z, with meaning, where first met and a search box). The header Journal button toggles it; Escape closes it. `JRUNS_SEEN` records that the Runs tab was opened (Chapter 1 step 1's Do this job).
  - `24-runs.js`: **My runs**, the run history. Every Pull!, push and launch starts a run (`runMark`), which updates live (`runTick`) and is saved in `DB.runs` (latest 200) with a sentence (`runText`) and number chips (`runChips`). It shows in the Journal's Runs tab: this step's runs open, earlier runs folded (`runItem`, `RUNOPEN`). The Your turn box has one big "📋 See my runs" button with a count (`qRunsHTML`) that opens the Journal on that tab; runs are not listed in the question box.
  - `30-fbd-builder.js`: free-body diagram builder: `FBDB.mount / check / hint / svg / model`.
  - `35-questions.js`: the question engine (`QT` types), used by both Learn and Review.
  - `40-guided.js`: the Learn engine. Steps reveal panels cumulatively (`adds`, `hide`), plus the tour and the diagram desk.
  - `41-ch1.js`: Chapter 1 content.
  - `42-ch2.js`: Chapter 2 content: the steps, Check questions, `vtSVG()` (velocity–time graphs for questions and worksheets), `ch2Record()` (stores each run's speed, braking distance and stopping time per crate mass, so questions check the student's own runs), `course()` (the launcher set-up) and the obstacle-course Challenge data.
  - `45-challenge.js`: the Challenge engine: Chapter 1's "Arena Inspector" (diagram and build missions) and Chapter 2's brake missions (`renderBrakeCourse`: one shared arena, a tab per crate, a green target zone of ±15 cm; every launch counts, so on target at the 1st launch = 4 points, 2nd = 3, 3rd = 2, later = 1, and after 3 misses "Move on" scores 1).
  - `50-review.js`: Chapter 1 question bank and the Check page (gated by the Challenge, or by Learn when a section has no Challenge, with "Continue anyway" and a "keep going" box for the next section).
  - `55-sections.js`: splits each chapter into sections and estimates their minutes.
  - `60-worksheet.js`: worksheets (student, blank, key), feedback page, marking schemes and Save my work.
  - `62-teacher.js`: the teacher page and the Toddle prompt.
  - `99-init.js`: Explore and start-up.
- `build.py` produces three files:
  - `dist/Force-HQ-offline.html` (for Toddle)
  - `dist/test.html` (with the `window.__fhq` debug hook)
  - `dist/artifact.html`
- `tools/make_worksheets.py`: builds `dist/toddle-files/` (one folder per sheet) and `dist/Force-HQ-Toddle-files.zip`.
- `tests/`: Playwright scripts. `play_c1.py` plays through Learn, `review.py` covers the Review, and `misc.py` covers Explore, the teacher page, Save my work, the Journal, mission 4 and the different screen widths. `stamp.py`, `dark.py` and `net.py` check the stamp, dark mode and network requests. `qpop.py`, `qdrag.py` and `carddrag.py` cover the Your turn pop-up and the info cards (opening, docking, dragging, click-through), `explore.py` the Explore unlock, `play_c2.py` plays all of Chapter 2 (Learn, Challenge, Check) with real clicks, `runs.py` covers the Journal's Runs tab, the See my runs button and the calculator over the Journal, `vocab.py` the key vocabulary, `onego.py` the one-go rule and `who.py` the name gate.

## Debug hook (`dist/test.html`)
`__fhq.S`, `LAB`, `CHDATA`, `FBDB`, `setStep(i)`, `openChapter(id, tab)`, `setCTab`, `forces`, `staticForces`, `dbGet`, `dbSet`, `resetDB`, `buildWorksheet`, `schemeHTML`, `schemeText`, `teacherPrompt`, `progressHTML`, `openExplore`, `calcEval`, `WS_CSS`, `ev(code)` (runs code inside the app's scope).

## Must not break
- g = 9.8 N/kg everywhere.
- The puller strengths are deliberately uneven: kid 60, dog 70, adult 130, strong adult 200, pony 260, horse 650, husky 90 N.
- FBD arrows start at the centre of the object, and the diagram shows the real object.
- Guided steps only show panels that have been introduced (`adds`, which accumulate step by step). Explore shows every panel, and each has an ⓘ card.
- Every Learn question must be answerable from what is on screen, and live readings are checked against the arena (`live` / `need`).
- The file stays offline: no external requests.
- Student work prints in blue; standards never appear on student screens.
- One go per question: right or wrong questions lock after the first check and reveal the right answer ("Whoops! …"). Multi-part questions score a point per part, diagrams a point per check (`simMax`, `qPoints` in `35-questions.js`).
- Learn steps can open with a "Predict first" box (`predict` in the step data, `predictBox` in `40-guided.js`): the student locks in a prediction before testing it, and making the prediction is the first Do this job.
- Readings from a run are checked against that run (`ch2Record`), never a value worked out separately, so the integration's tiny rounding never marks a correct reading wrong.
- Explore hides the launcher, brake and braking distance (`EXPLORE_HIDE`); the velocity–time graph shows there too.
- Learn questions stay hidden until Next, then pop up centred (`qPlace` in `40-guided.js`); they can be minimised to the left column (▾ Minimise or Escape).
- Gap answers accept synonyms (`SYNS`, `gapAccepts` in `35-questions.js`): "more", "larger" or "greater" for "bigger", "middle" for "centre", and so on, and a leading "a/an/the" is ignored. The marking scheme lists every accepted word.
- Every pop-up that can cover the arena is draggable by its header with the shared `makeDraggable` helper (`00-util.js`): the Your turn box and the info cards. The header always stays on screen and the spot is remembered while the page is open (`DRAGPOS`).
- Explore opens once the Chapter 1 Foundation is finished (`EXPLORE_AFTER`, `exploreOpen` in `20-shell.js`). Before that the home card offers "Start Chapter 1" and "Open it anyway"; teachers always get in. The stamp pop-up announces that Explore is open.
- PDFs have no teacher comment box, because Tom leaves comments on Toddle.
- Every Check question must be taught in Learn first (for example, drawing to scale is taught in step s8 before r12 asks it).
- The Extension mixes still and moving crates (s10, r8 and mission 4 move), so it isn't all "the box doesn't move".
- The pop-up never blocks the arena: the `.qpop` layer is transparent and click-through, and only the box takes the pointer. Students drag the box by its header (pointer events, so touch works); the header always stays on screen and the spot is remembered while the page is open (`QPOS`, `qDragInit`). It sits above the phone info card (z-index 66) and below modals (70).
- Newtonmeters and their readings always stay on the 900 px canvas, even when the crate reaches the end of the arena (`drawTeam` clamps them; the rope runs on off-screen).
- Nobody gets in without a name or the teacher code (`closeModal` in `20-shell.js`).
- Every slider has a typed number box (`#massNum`, `#brakeNum`, applied on Enter or change, clamped). Target-finding tasks (x2 and the brake Challenge) leave a red too-high and a yellow too-low marker on the brake slider (`LAB.bmarks`, `brakeMark` in `10-engine.js`; worked out from `S.launchMass`, so changing the mass afterwards never re-scores an old run).
- The calculator button stays visible above the Journal (z-index 69) and moves left of it when it is open; typing x or * gives ×.
- No specificity pattern: in every choice question the options are about as long and detailed as the right one, with the same numbers and words.
- Explain questions list "Words to use in a good answer" (`q.words`), and every checklist point says how one of those words is used. Shown in the sim, the worksheet, the key and the scheme.
- Every calculation in a Check is scaffolded in Learn first (Chapter 2: i2 shows the pattern and worked example for "n times the mass, 1/n of the speed"; x2 walks through 120 ÷ 40 = 3, the distance ratio, then 3 × 48 = 144 N).
- Worksheets open with "Steps completed in the sim" (`stepsSummary` in `60-worksheet.js`), with blue ticks for the steps the sim recorded; the marking instructions and the Toddle AI prompt explain the ticks.
- Chapter 1 has a resultant force step (s3r, air floor) and r13; s11 was removed to keep the Foundation near 30 minutes.

## Art
Flat, rounded, outline-free shapes in team colours. Animals have dot eyes and dot noses, a mouth, and ears drawn as curved lines. Dogs and huskies have eyes near the front of the head; ponies and horses have eyes on the side.
