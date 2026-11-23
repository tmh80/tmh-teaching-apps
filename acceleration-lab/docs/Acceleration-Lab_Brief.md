# Acceleration Lab (Day 9 workshop, G6–8), brief

**Built:** 23 Nov 2026. **Toddle file:** `Acceleration-Lab-offline.html`. **Teacher code:** ACCELERATION.

## The workshop (45 min)
A cart rolls down a 2 m ramp, then along 2 m of flat floor. Students time it from release to the 1, 2, 3 and 4 m marks (Way 1: a new run per mark; Way 2: one timer per mark; 1–5 trials).

## What students do in the app (7 steps)
1. **Predict** for the ramp and the flat.
2. **Table 1:** times from the start. The app averages them.
3. **Table 2 (their maths):**
   - ① time for each metre = this mark − last mark
   - ② speed = 1 ÷ time
   - ③ change in speed = this speed − speed before (from metre 2; metre 1 has nothing before it)

   Each column is colour coded, has a "?" explanation, a formula hint (G6 with their numbers, G7/8 in words) and source cells that light up. There is also a calculator and "Check my maths" (checked against the student's own previous numbers).
4. **Acceleration (done by the app):** change in speed ÷ time between the middles of the two metres (half of one metre's time + half of the next). There are three values: M1→M2, M2→M3 and M3→M4. Students build a **line graph** with a negative y-axis (title, labels, scale, dragging points; a smooth line joins them; G6 gets "Suggest numbers"). A smooth speed–time model curve is drawn automatically, with the ramp and flat shaded, for comparison.
5. **Forces:**
   - G6 reads model free body diagrams.
   - G7/8 builds both diagrams with Force HQ's builder, adapted for slope directions. The checks include a "forward force" misconception message.

   Both grades answer three questions per diagram: balanced?, which way the leftover/resultant force points, and the sign of the acceleration.
6. **Conclusion:**
   - G6: sentence frames with synonym checks.
   - G7/8: claim, evidence and reasoning, plus "why is metre 2 → 3 mixed?"

7. **Worksheet tab:** a live preview of the PDF, with Save and Print buttons. The PDF includes only the parts that have something in them (numbered in order, split onto A4 pages automatically), so an unfinished worksheet still looks complete.

## Decisions (23 Nov, after Tom's iPad test)
- **No "start → metre 1" acceleration.** It gave much bigger values than the rest. Metre 1 is the only time that depends on the stopwatch starting exactly as the cart is let go. A start error shortens or lengthens it, and the acceleration formula magnifies that (it divides by the time squared). Later values are differences between marks, so the start error cancels out.
- A line graph with smooth curves, in place of bars.
- Force arrows pointing the same way sit side by side, with their labels on opposite sides, and labels stay inside the box.
- There is no blocking "unfinished" list before saving; the Worksheet tab shows what's not done as optional links.

## Science notes
- On the flat, gravity is balanced by the normal force, so it can no longer pull the cart forwards. Friction is unbalanced, so the acceleration is negative. G6 wording: "gravity can't pull it forwards any more; friction slows it down".
- The metre 2 → 3 value straddles the bottom of the ramp (it mixes speeding up and slowing down) and can come out + or −. The app tags it "⇄ crosses the bottom of the ramp".

## Files
- `src/` and `build.js`: run `node build.js`.
- `tests/play.py`: Playwright play-through at G6, G8 and phone width.
- `slides/build-slides.js` → `slides/Acceleration-Lab-Day9.pptx` (9 slides, 3 of them theory).
- `worksheets/Acceleration-Lab-Blank-Worksheet.pdf`: the paper backup (also in the app under For teachers).
