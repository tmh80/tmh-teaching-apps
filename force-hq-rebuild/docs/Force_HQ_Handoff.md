# Force HQ rebuild: handoff for a new chat (24 Oct 2026)

Use this file to carry on with the Force HQ rebuild in a fresh chat. Read it first, then read `Force_HQ_Brief.md` (file map and the "must not break" rules) and `Force_HQ_Rebuild_Brief.md` (the full plan for every chapter). All three are in this project.

## Getting the code
- **Source:** `Force-HQ-rebuild-source.zip`. Tom attaches it to the new chat. It contains `src/`, `build.py`, `tools/`, `tests/` and `docs/`. Unzip it to `/home/claude/force-hq/`.
- **Built file:** `claude/Force-HQ-Rebuild.html` in the project is the current offline build. Use it only as a reference, because edits belong in `src/`.
- **Artifact:** https://claude.ai/artifact/2qHdjKcuWWAjgMkjZdqEcy. Republish to this URL from `dist/artifact.html` each time, passing `url` because it's a new conversation. Read the artifact first.
- **Build:** `python3 build.py`. It runs `node --check` on every module, then writes `dist/Force-HQ-offline.html` (for Toddle), `dist/test.html` (with the `window.__fhq` debug hook, where `__fhq.ev(code)` runs code inside the app) and `dist/artifact.html`.
- **Tests (Playwright):** `tests/err.py`, `play_c1.py`, `review.py`, `misc.py`, `stamp.py`, `who.py`, `qpop.py` and `onego.py`. Run all of them after every change and check that none prints errors.
  - **Helpers:** `play_c1.py`, `misc.py` and `dark.py` define `popq(pg)`, which opens the question pop-up, and `nxt(pg)`, which presses Next and accepts "Continue anyway".
- **Toddle PDFs:** `python3 tools/make_worksheets.py` writes `dist/toddle-files/` and `dist/Force-HQ-Toddle-files.zip`.
- **Delivery:** after a change, send `dist/Force-HQ-offline.html` to Tom as `Force-HQ-Rebuild-offline.html`. Also `project_write` it to `claude/Force-HQ-Rebuild.html`.

## Standing rules (Tom's)
- **Student text:** warm, natural full sentences at Grade 7–8 level. Never use the "it isn't X, it's Y" construction or framing that justifies the activity. Standards never appear on student screens or worksheets.
- **Physics:**
  - g = 9.8 N/kg.
  - Free-body diagram arrows start at the centre of the object, which is drawn as the real object.
  - Students type their own readings.
- **Offline single file:** no external requests and no Google fonts.
- **Guided before Explore:** guided mode introduces each panel slowly; Explore shows everything.
- **Sections (new):** every chapter is split into sections of about 20–30 minutes (Foundation, Extension). Each section has its own Learn steps, optional Challenge, Check questions and worksheet PDF, so sections can be combined into longer sessions. Time estimates always say "approx.".
- **wab-science-sim-builder conventions:**
  - name and class box (now required to get in)
  - teacher code FORCE
  - teacher page that writes the Toddle prompt
  - Toddle blank template, answer key and marking scheme for each sheet
  - Save my work PDF, with student work printed in blue
  - "Continue anyway" instead of blocking

## Done in the last session (all tested, built and published)
1. **Foundation and Extension split (`src/js/55-sections.js`).** Chapter 1 is now two sections: `c1f` (approx. 28 min) and `c1x` (approx. 29 min). Each section has its own stamp and PDF. The Extension can be ticked as optional on the teacher page.
2. **Name box.**
   - The forms are now plain divs with click and Enter handlers, because sandboxed previews block form submission. The helper is `onSubmit()` in `20-shell.js`.
   - The name chip with a Change button now sits at the top left (`#whoTop`).
   - `closeModal()` sends anyone without a name or the teacher code back to the name box. That covers Cancel, Escape and clicking outside the box.
3. **"Your turn" question box (`40-guided.js`, `QSTATE`/`qPlace`/`qChrome`).**
   - The box is hidden until Next. On steps with questions, Next reads "Next: questions →".
   - Pressing Next with the Do this list unfinished shows a warning with "Continue anyway". Then the questions open centred in `#qPop`.
   - "▾ Minimise", Escape or clicking the backdrop docks the box as a small "Your turn ⤢ Open" tab in the left column.
   - Diagram desk questions minimise the box automatically.
4. **One go per question (`35-questions.js`, rewritten).**
   - Every question that is right or wrong locks after its first check.
   - A wrong answer shows the correct one ("Whoops! The answer is …"). Mcq marks the right option with a dashed green outline; sort, match, table and gap questions show a green "→ correct" tag beside each wrong part.
   - Points come from `simMax(q)`:

     | Question type | Points |
     |---|---|
     | mcq, tap, num, reading | 1 |
     | tick | 2 (minus one per mistake) |
     | gap, sort, match | 1 per gap, item or row |
     | table | 1 per cell |
     | fbd and desk | 6, one per builder check |
     | explain | 1 per self-ticked point |

   - Free-body diagrams get one check. The diagram then locks and `fbdCompare()` shows "Your diagram" beside "The correct diagram", with ✓/✗ chips.
   - Challenge missions are also one go:
     - free-body diagram missions score out of 4 objectives and show the comparison
     - the build mission (m4) scores 1 + the number of matches out of 3, and gives a "Whoops" message stating the target
   - The Check page shows "Points so far", and each card shows "n of m points".
   - The worksheet feedback page lists points per question (`qPoints`, `reviewProgress().points/maxPoints`).
   - "Try this step again" in Learn still resets a step.
   - **Tom hasn't reviewed the one-go change yet.** Ask him how it feels, especially the single check on the free-body diagram builder in the Extension.

## To do next (Tom's latest comments, not started)
1. **Let students drag the Your turn box.** Tom said: "Allow me to click and drag these boxes around so I can see the info in the arena."
   - Make the pop-up (`#qPop .qpopbox`, holding `#qCard.popped`) draggable by its header (`.qhead`), using pointer events so it works on touch screens. Keep it inside the viewport and remember its position for the session.
   - The dimmed full-screen backdrop currently hides the arena, and backdrop clicks minimise the box. Make the backdrop transparent and non-blocking while the box is up (`pointer-events: none` on `.qpop`, `auto` on the box), so students can read and use the arena with the questions open. Escape and "▾ Minimise" still dock it.
   - Check the phone width (390 px) too, where the box is nearly full screen.
   - The same idea may suit other pop-ups that cover the arena, such as the info cards (`showCards`, the `.chunk` element at the bottom on phones). Ask Tom before changing those.
2. **The force meter is cut off when the tug-of-war finishes.** Tom said: "When the tug of war finishes, the force meter is partly cut off, making questions difficult to answer."
   - When the crate slides to the end of the arena, the newtonmeter (or meters) and labels drawn on the rope go partly off the 900 px canvas.
   - Look at `drawTeam` and the meter drawing in `src/js/11-draw.js` (the newtonmeter around `nx = edge + s*38`) and at `drawScene` and the HUD in `src/js/12-arena.js`.
   - Fix options: clamp the crate's travel so the teams and meters stay in view; keep the meter labels on screen by clamping their x and flipping their side; or pan the camera.
   - Then check every Learn question that reads a meter after a pull, for example s3 ("what does the right newtonmeter read?") and the multi-team step.
3. **Housekeeping after the fixes.**
   - Update `docs/Force_HQ_Brief.md` with the one-go rule, the points rules, the pop-up and the name gate, then write it to `claude/Force_HQ_Brief.md`.
   - Offer Tom a `propose_skills` update to wab-science-sim-builder covering:
     - sections of 20–30 minutes that can be combined
     - one go per question with the answer revealed
     - points for multi-part questions and diagrams
     - questions popping up on Next
     - a required name or teacher code
4. **Then milestone 2:** Chapter 2 (Inertia), built as a Foundation and an Extension from the start. See `Force_HQ_Rebuild_Brief.md` for the content.

## Debug hook
`__fhq.S`, `LAB`, `CHDATA`, `FBDB`, `setStep(i)`, `openChapter(id, tab)`, `setCTab`, `renderReview`, `dbGet`, `dbSet`, `resetDB`, `buildWorksheet`, `teacherPrompt`, `progressHTML`, `openExplore`, `ev(code)`.

Examples:
- `__fhq.ev("qPlace('pop')")` opens the question box.
- `__fhq.ev("DB['revOpen_c1f']=true")` opens the Check page without its gate.
