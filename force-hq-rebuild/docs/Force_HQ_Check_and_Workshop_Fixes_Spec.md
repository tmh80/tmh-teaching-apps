# Force HQ: Check, stamp and Workshop fixes (build spec)

**For:** Claude Sonnet, medium effort, working in Claude Code on `tmh80/tmh-teaching-apps`, folder `force-hq-rebuild/`.
**From:** Tom (WAB, Head of MS Sciences), after playing Chapter 6 Parts 1 and 2 on 1 Nov 2026. Tom is a teacher, not a programmer: explain what you did in plain language and handle all git work yourself.
**Read first:** `claude/Force_HQ_Handoff.md` in the claude.ai project (setup, build, tests, delivery), then section A2 of `docs/Chapter6_Workshop_Script.md` (pacing and vocabulary rules). Follow the repo's `.claude/skills/wab-science-sim-builder/SKILL.md` for anything this spec doesn't cover.

There are four changes. Do them in this order and commit after each one.

| # | Change | Where | Scope |
|---|---|---|---|
| 1 | Finish the Check with one button: auto-check, score and stamp together | `50-review.js`, `35-questions.js`, `36-qtypes.js`, `37-obstypes.js`, `40-guided.js`, `20-shell.js` | **Every chapter** |
| 2 | Labels on diagrams sit in white text boxes | `4bb-shoppics.js`, `4b-shopdraw.js` | Chapter 6 |
| 3 | The two Workshop rulers share one scale | `wsRuler` and `drawShopScene` in `4b-shopdraw.js` | Chapter 6 |
| 4 | Explain *why* students count supporting ropes | step `pl1` in `4c-ch6.js`, `picMovingPulley` | Chapter 6, Part 2 |

**Saved progress must survive.** Never rename section, step, question or mission ids, or the storage key `forcehq2`.

---

## 1. Finish the Check with one button (whole app)

### The problem
Tom: "When I check the final question, it comes up with the stamp before I can check." In `50-review.js`, each Check question's `onDone` calls `maybeStamp(ch)` as soon as the last question is marked. For an explain question, pressing Check reveals the model answer and the "Did you include…?" list, but the stamp pop-up appears straight away, before the student can tick anything.

Tom also wants checking each question to be **optional**: "When you click 'complete, see score and collect stamp', it should auto-check everything, then the score pops up alongside the stamp."

### 1a. No automatic stamp from the Check
- Remove the `maybeStamp(ch)` call from the Check questions' `onDone` in `renderReview` (`50-review.js`). Keep `drawBar()`, `renderOnPage()` and `tabTicks()`.
- `maybeStamp` is also called when the last Learn step is completed (`40-guided.js`, about line 209) and when a Challenge is completed (`45-challenge.js`, about line 31). Keep those two calls, but change the test inside `maybeStamp` (`40-guided.js`, about line 256) from "every Check question is done" to "**the Check has been finished** with the Finish button" (`dbGet('review.' + ch, {}).finished`, see 1c). So the stamp never appears in the middle of a Check, and a student who presses Finish before finishing Learn or the Challenge gets the stamp the moment they finish the last one. Check with `grep -n "maybeStamp\|awardStamp" src/js/*.js` that nothing else awards a stamp.

### 1b. Per-question Check stays, but is optional
- Each question keeps its **Check** button and its one-go rule: a student who wants feedback straight away can still use it.
- Add one line at the top of every Check, under the progress bar: "You can check each answer as you go, or answer everything and press **Finish** at the end to check them all at once."
- **Explain questions: show the checklist while the student writes.** In `QT.explain` (`35-questions.js`), move the "Did you include…? Tick what you included. You get a point for each one." list out of `showModel` so it shows under the textarea from the start, with live checkboxes. Ticks are saved with the draft (the existing `[data-ck]` change handler, without needing `done`). Pressing Check (or Finish) reveals the **model answer**, keeps the ticks, and scores them as now (one point per tick). The student can still change ticks after checking; the score updates quietly, as it does today. Heading for the list before checking: "Before you finish, tick what you included." After checking: the current wording.
- Learn questions are unchanged (they still use Check, and still lock after one go).

### 1c. The Finish button
- At the bottom of every Check, above "Make my worksheet", a big primary button: **✓ I'm finished: see my score and collect my stamp** (`#finishCheck`). Also put a smaller copy in the sticky progress bar (`.revbar`), so it is easy to find on a long page (Tom's rule: action buttons where students are looking).
- **When pressed:**
  1. **Blank questions.** If any question has no answer at all (nothing typed, picked, placed or drawn), open a draggable pop-up (`makeDraggable`): "**2 questions are still blank:** Question 3 and Question 6. A blank question scores 0." with a **Go to Question 3** button for each and **Finish anyway**. (Tom's rule: let students submit incomplete work, but warn them.)
  2. **Auto-check** every question that has an answer but hasn't been checked, in page order, using exactly the same marking as its own Check button. Parts that weren't answered count as wrong (for example, a two-tier `reason` question with an answer but no reason scores the answer only). Don't require a "How sure are you?" choice (`sure`) during auto-check; record it as not chosen. Explain questions are scored from the ticks the student has already made (1b) and reveal the model answer.
  3. **Blank questions** that the student chose to finish anyway are stored as done with 0 points, so the worksheet shows them as blank.
  4. **The results pop-up** (one modal, draggable): a big score ("**You scored 21 of 26 points**"), a short list with one row per question (Question 1 · Choose the words · 3 of 3 ✓; Question 5 · Explain it · 2 of 3), and, when the section's Learn steps and Challenge are complete (`learnProgress`, `challengeDone`), **the stamp** beside the score with the existing stamp wording. Buttons: **Make my worksheet** (primary, opens `makeWorksheet(ch)`), **Look at my answers** (closes the pop-up and scrolls to the first question that wasn't full marks), and, if there is a next section, **Go on to <next part>**.
  5. **If Learn or the Challenge isn't finished**, show the score without the stamp and say: "Your Check score is saved. Finish the **Learn steps** (2 left) to collect your stamp." with a **Go to Learn** button (or "the **Challenge**" with **Go to the Challenge**). When the student later finishes them, the stamp pop-up appears straight away (1a).
  6. Store `DB.review[ch].finished = true` (inside the existing `review.<ch>` object, through `dbGet`/`dbSet`, so it is in the save file). After that, the Finish button reads **See my score again** and reopens the results pop-up without re-marking.
- **Auto-check implementation.** Give each question type a way to be checked without a click, rather than simulating clicks with guards in the way. In `renderQuestion`, add `api.auto` (true while Finish is running) and a function on the card, for example `box.autoCheck()`, that each type registers in its `bind`. Each type's Check handler must, when `api.auto` is true, skip "do this first" guards (for example "Write your answer first", "Choose how sure you are", "Tap a line first") and mark what is there. Types to cover and test one by one: `mcq`, `tap`, `tick`, `num` (and `reading`), `gap`, `match`, `sort`, `table`, `order`, `calcorder`, `pick`, `reason` (two tiers, `voices`, `sure`), `fix` (line, then correction), `explain`, `fbd`, `freeze`, `spot`, `sketch`. A type with nothing entered is "blank" (1c step 1).
- **Worksheets, answer keys and the Toddle AI text are unchanged.** "Make my worksheet" still lists unfinished parts with "Go to …" buttons and "Make it anyway".

### 1d. Tests
Many tests expect the stamp to appear after the last Check question. Add one helper (for example `finish_check(pg)` in a small shared test module) that presses `#finishCheck`, handles the blank-questions pop-up if it appears, and closes the results pop-up. Use it in `stamp.py`, `review.py`, `onego.py` and every `play_c*.py` that collects a stamp. Add `tests/finish_check.py` that checks, on one Foundation and one Extension section:
- no stamp appears when the last question is checked by hand;
- Finish with every question answered but none checked: all auto-checked, scores match pressing Check one by one (answer the same way on a fresh save and compare), results pop-up shows the right total and the stamp;
- Finish with two blank questions: the warning lists both, "Go to Question N" scrolls there, "Finish anyway" scores them 0;
- an explain question ticked before Finish scores its ticks, and the model answer appears;
- with Learn unfinished: score but no stamp, and the "Go to Learn" button;
- "See my score again" reopens without re-marking; everything survives a reload and a save-file round trip.

---

## 2. Labels on diagrams sit in white text boxes

### The problem
Tom: "The labelling on diagrams looks a little untidy. The lines often go into the same space as the text. How about using a text box for the labels that has a white background, just like I'd do in Microsoft Word."

### 2a. SVG pictures (`src/js/4bb-shoppics.js`)
- Replace `picTag` with a **text-box label**: `picLabel(px, py, bx, by, lines, col, opts)` where (px, py) is the point on the drawing being labelled, (bx, by) is where the box goes, and `lines` is `[name, plain words]` (the second line optional).
  - The box: white fill, a 1.5 px border in the label's colour (fulcrum grey, load green, effort red, as now), rounded corners (5 px), 5 px padding. Name in bold in the label colour (14 px), plain words underneath in dark ink (11 px).
  - Box width: there's no DOM to measure text while building the string, so estimate it: `max(characters in each line × font size × 0.56) + 12` px. Check the result visually and adjust the 0.56 if text spills.
  - The leader line: a thin solid line (1.5 px, label colour) from the labelled point to the **nearest edge of the box**, never through the text. Compute where the line from (px, py) to the box centre crosses the box's edge and stop there. Add a small dot (r = 3) at the labelled point.
  - Draw all leader lines first and all boxes last, so boxes sit on top of lines and drawing parts.
- Use `picLabel` in every picture: `picBar`, `picLever` (including the dimmed "focus" mode: dim the whole label group as now), `picSeesaw`, `picWheelbarrow`, `picChopsticks`, `picFlagpole`, `picScrewdriver`, `picScrewIdea`. Captions that aren't labels (`picCatch`'s "Smaller effort = bigger distance", `picThree`'s key, `picRamp`'s dimension words, `picClass3Anim`'s captions) also go in white boxes, without leader lines.
- **Place every box in clear space**: not over the bar, the load, the hand or another box. Make the picture's viewBox taller or wider where needed (cards allow about 330 px of height, `.chunk .gbody:has(.pic)`).
- The letter labels used in questions (`picLever({ letters: … })`) keep their white circles; check they don't overlap anything.

### 2b. The Workshop scene (`src/js/4b-shopdraw.js`)
Give canvas labels the same look with one helper, `wsLabel(c, text, x, y, col, align)`: measure the text with `c.measureText`, draw a white rounded rectangle (padding 4 px, radius 5, 1.5 px border in the label colour), then the text. Use it for: the distance brackets' text (`wsBracket`), "pull down" / "pull up" / "pull" (`wsSpring`), "fulcrum", "the end you pull (not counted)", the supporting-rope numbers, the winch's "handle radius" and "axle radius", the ramp's "ramp length" and "height", the wedge's "thickness" and "length", and the screw's "thread gap". Keep the readout panels, the newtonmeter and the "Lifted!" banner as they are.

### 2c. Check
Screenshot every Chapter 6 card that has a picture (Part 1 steps lv1, lv4 and lv5; Part 2 steps pl1 to pl4), the Check questions with pictures (c6r1, c6r3), the worksheet and answer key PDFs for `c6a` and `c6b` (render with `pdftoppm`), and the Workshop scene for every machine (all three lever designs at the slider ends, pulleys 1 and 6 ropes, both winch handles, ramps 2 m and 6 m, wedge, screw jack), at desktop and phone width (390 px). Look at every image: no label text touches a line, the drawing or another label.

---

## 3. The two Workshop rulers share one scale

### The problem
Tom (comment on the scene): "The ruler should have the same scale to give a sense of perspective. Right now there's a full bar on the left for 1 metre and a full bar on the right for 4 metres. The 1 metre should show a smaller bar and go to 4 m like the right-hand side."

At the moment `wsRuler` picks each ruler's length from its own distance (`len = ceil(dist × 2) / 2`), so a 1 m lift and 4 m of rope both fill their rulers.

### 3a. One scale for both
- In `drawShopScene`, work out **one** ruler length for both: `len = ceil(max(load rise, effort distance) × 2) / 2` (at least 0.5 m), and pass it to both `wsRuler` calls. Make both rulers the **same width** (for example 430 px each, at x = 14 and x = 456), so the same distance is the same number of pixels on both.
- Same tick spacing and number labels on both rulers (computed once from `len` and the shared pixels per metre). So with 4 supporting ropes: the green "LOAD RISE" bar stops at 1 on a ruler that runs to 4, and the red "ROPE YOU PULLED" bar reaches 4.
- Keep the coloured bar, the arrow marker at its end and the titles as they are.

### 3b. When one distance is tiny
Some machines make one bar too short to read at the shared scale (the screw jack: the car rises 0.20 m while the hand moves 48 m). When the shorter bar would be **under 40 px** long, draw a small **zoomed ruler** just under it, labelled "🔍 Zoomed in: 0 to 0.5 m" (or whatever range fits), with its own ticks every 0.01 or 0.05 m, so students can still read the value. The main ruler keeps the shared scale, so the comparison stays honest.

### 3c. Check
The reading questions still pass (`tests/play_c6.py`, every `reading` that uses the rulers). Screenshots: lever with the rock 0.4 m, 0.2 m and 1.6 m from the fulcrum; class 3; pulleys with 1 and 4 ropes; the 5 m ramp; the screw jack (zoomed ruler visible); the wedge.

---

## 4. Explain *why* students count supporting ropes (step pl1)

### The problem
Tom (comment on card 3 of step pl1, "Now hang the crate from a pulley that moves up with it. Count the supporting ropes…"): "Why am I counting anything? Not explained, should be clearer."

### 4a. New card 3 text (replace it exactly; keep the `hi` and the picture)

> Here's a trick to make the crate easier to lift: hang it from a pulley that moves up with it. Now there's more than one piece of rope holding the crate up, and the pieces **share** its weight. They're called ${T('supporting', 'supporting ropes')}. With 2 supporting ropes, each one holds up half of the crate. Count only the ropes that hold the crate up: the end you pull isn't holding the crate, so don't count it.

### 4b. The prediction would now be given away
The card says the ropes share the weight, which answers the current prediction ("You change from 1 supporting rope to 2. What will happen to the effort?"). Tom's rule: cards must never give away the prediction. Replace the step's `predict` with one about the distance (the catch), which the card doesn't reveal:

- Question: "With 4 supporting ropes, how much rope will you have to pull to lift the crate 1 m?"
- Options: "4 m of rope, because each of the 4 ropes gets 1 m shorter" · "1 m of rope, because the crate only rises 1 m" · "0.25 m of rope, because the 4 ropes share the job" · "2 m of rope, because the pulley doubles the distance"
- `then` (the line shown after predicting): "Lift the crate with 1, 2, 3 and 4 supporting ropes. Watch the newtonmeter and the red ruler."

(The predict box isn't marked, so there's no correct answer to set. Question q2 of the step then checks the real answer: 4 m.)

### 4c. The picture
In `picMovingPulley` (`4bb-shoppics.js`): change the right-hand caption from "2 supporting ropes / hold up the crate" to "**2 supporting ropes** / share the crate's weight" (in a text box, section 2), and add "holds half" in small green text under each of the rope numbers 1 and 2. Make sure nothing overlaps the dashed "end you pull" rope or its label (widen the viewBox if needed). The "Supporting ropes" control heading is already a glossary button: leave it.

### 4d. Script and tests
Update step pl1 in `docs/Chapter6_Workshop_Script.md` (section F2) to the new card and prediction. In `tests/play_c6.py`, the pl1 prediction click still works (any option); add a check that card 3 contains the word "share".

---

## 5. Test, then deliver

- While working, run the tests that touch each change; at the end run `sh tests/run_all.sh` (it takes over 10 minutes, so run it in the background or in two halves). Every test must print `errors []` or `ALL PASS`.
- Also: no network requests (`net`), no console errors, phone width (390 px) without sideways scrolling, dark mode.
- Regenerate the Toddle files (`python3 tools/make_worksheets.py`) and copy them into `worksheets/`.
- **Deliver** (the Handoff's §1 steps): copy `dist/Force-HQ-offline.html` to `force-hq-rebuild/Force-HQ-Rebuild-offline.html`; commit, fetch, rebase, push to `main`; republish the preview artifact at its existing link (read the live version first); send Tom the offline file. **Don't save HTML files to the claude.ai project.**
- Update `docs/Force_HQ_Brief.md`, `docs/Force_HQ_Backlog.md` and `docs/Force_HQ_Handoff.md` (new: the Finish button and results pop-up, `box.autoCheck`, explain checklists visible while writing, `picLabel` and `wsLabel`, the shared ruler scale), in the repo and the project copies (`claude/Force_HQ_*.md`). Add to section A2 of the Chapter 6 script: "Labels on pictures and in the scene sit in white text boxes with leader lines that stop at the box edge (`picLabel`, `wsLabel`)" and "The Workshop rulers share one scale."
- **Tell Tom, in plain language:** the file to upload to Toddle; how the new Finish button works (checking each question is now optional; Finish checks everything and shows the score with the stamp); that explain questions now show their checklist while students write; and any question type where auto-check needed a special rule.
