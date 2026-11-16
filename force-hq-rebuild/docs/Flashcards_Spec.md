# Force HQ: Key vocabulary flashcards (spec, 16 Nov 2026)

Tom's request: a key-vocabulary flashcard system for Force HQ with spaced repetition like Sparks Through Time. It must look like real index cards with blue ruled lines, in a handwritten font. Students tick the topics they have covered, which adds those cards to their deck. Every card has a diagram.

Written by the coordinator (Opus). Implementers: stay inside your own files, follow this exactly, and report back briefly (files written, tests passed, anything you could not do). Don't use git. Don't read `Force-HQ-Rebuild-offline.html` or `dist/*.html` whole: they are 1.9 MB. Use `grep -n` and `cut -c1-300`.

## 1. How it works for a student

1. Home page: a new third card in the `homegrid` row, "🃏 Vocab flashcards", showing "N cards due today" (or "Pick your topics to make your deck"). Button: "Open my flashcards →". The Journal's 🔤 Vocab tab also gets a button "🃏 Practise words as flashcards".
2. **My flashcards** page (new view `vCards`):
   - Heading "My flashcards" and a short pencil-note intro (two sentences max): "Tick the topics you have covered. Their words go into your deck, and each card comes back just when your brain is about to forget it."
   - **Topics you have covered**: one row per section from `FC_TOPICS`, grouped by chapter ("Chapter 1 · What is a force?"), each a tappable tile that looks like a small index card with a big hand-drawn tick box, the section part and title ("Foundation"), "12 words", and a small green "✓ You finished this section" when `dbGet('stamps',{})[id]` is set. Tapping toggles it. A "Tick everything I've finished" button ticks every stamped section. Nothing is ticked at first; never auto-tick.
   - **My deck**: the five Leitner boxes drawn as card-file boxes with counts: "Every day", "Every 3 days", "Every week", "Every 2 weeks", "Every 4 weeks", plus "New" (in the deck, never practised). A line: "34 cards in your deck · 12 due today".
   - Big primary button: "Start: 12 cards due" (or "Nothing due today. Practise anyway?" as a secondary button, or "Tick a topic to start" disabled-looking but still clickable to show a toast pointing at the topics).
   - Secondary: "📇 Look through my deck" opens a grid of every card in the deck (small cards, word on front; tap to flip and see meaning and picture). Read-only, no scheduling.
3. **Practice** (a "go"): one card at a time on a desk.
   - Top: "Card 3 of 15", a progress bar, and "Stop" (back to My flashcards; progress so far is kept).
   - The card front shows the word in big handwriting. Under it, on the ruled lines, a writing area: "Write what you think it means… (optional)". The student's typing appears in blue-pen handwriting sitting on the blue lines. A small "✏️ Need a clue?" link shows the picture on the front.
   - "Flip the card" (or tap the card, or Space/Enter) flips it with a real 3D flip. The back shows the meaning written on the lines, the picture, and "You wrote: …" if they typed something.
   - Then two big buttons: "Not yet" and "Got it" (keys: 1 or ← for Not yet, 2 or → for Got it).
   - Once a card is in box 3 or higher, it is asked the other way round: front shows the meaning (the word itself masked as "____" wherever it appears, including its aliases), "Which word is this?"; back shows the word and picture.
4. **End of a go**: "All done! You got 11 of 15 cards, and 4 needed another go." Then "What comes back": "6 cards tomorrow, 5 cards in 3 days…". Buttons: "Go again" (if more are due), "Back to my flashcards", "Go home".

## 2. Spaced repetition (same rules as Sparks `retrieval/src/30-flashcards.js`)

- Five boxes; a card in box b comes back after `FC_DAYS = [1, 3, 7, 14, 28]` days.
- New card: box 0 ("New"), due now. Got it → box = min(5, box + 1), due = today + FC_DAYS[box − 1]. 
- Not yet → box 1, due today, and the card is put back into this go's queue about 6 cards later (`queue.splice(Math.min(queue.length, 6), 0, card)`).
- A card that was missed in this go and then got stays in box 1 and is due tomorrow.
- A go holds up to 20 cards: all due cards that were seen before (oldest due first), then new cards, with at most 10 new cards per go. If more are due, the end screen offers "Keep going: N more due".
- Dates are local calendar days as 'YYYY-MM-DD' strings (copy Sparks' `rtFcYmd`, `rtFcAdd`, `rtFcDiff`, `rtFcNice`).
- Saved in DB (so the existing 💾 Save progress backup carries it automatically): `DB.fc = { topics: ['c1f', …], cards: { key: { box, due, seen, got, miss } }, last: 'YYYY-MM-DD', goes: n }`. Read with `dbGet('fc', {})`, write with `dbSet`. Every read tolerates missing data. Unticking a topic removes its words from the deck (unless another ticked topic has them) but keeps their `cards` history, so ticking again restores the progress.
- Check `70-backup.js` and any "reset my progress" code: `DB.fc` must survive a backup round-trip. If there is a reset, it clears `fc` too (same as everything else) unless the existing reset keeps other things.

## 3. Topics and cards

The deck uses the glossary `TERMS` (`22-glossary.js` plus the Chapter 6 words added in `4c-ch6.js`): front = `TERMS[key][0]`, meaning = `TERMS[key][1]`, aliases = `TERMS[key][2]`. Don't rewrite definitions. A word in two ticked topics is one card. The card's small topic tag shows the first ticked topic (in `FC_TOPICS` order) that has it, e.g. "Ch 1 · What is a force?".

```js
const FC_TOPICS = {
  c1f: ['force','push','pull','newton','newtonmeter','resultant','balanced','unbalanced','friction','weight','mass','gravity','normal','tension','airres','contact','noncontact','magnetic'],
  c1x: ['fbd','arrow','scale','weight','normal','friction','tension'],
  c2f: ['inertia','velocity','vtgraph','brake','brakingdist','newton1','unbalanced','mass'],
  c2x: ['vtgraph','brakingdist','slope','newton1','fbd'],
  c3f: ['acceleration','mps2','newton2','triangle','unit','resultant','mass','friction'],
  c3x: ['slope','vtgraph','acceleration','newton2'],
  c4f: ['newton3','forcepair','action','reaction','thrust','force','mass','acceleration'],
  c4x: ['thruster','thrust','forcepair','newton3','newton1'],
  c5f: ['airres','terminal','parachute','canopy','drag','weight','balanced','resultant'],
  c5x: ['gfs','vacuum','lift','hover','terminal','parachute'],
  c6a: ['machine','lever','fulcrum','effort','load','effortarm','loadarm'],
  c6b: ['pulley','supporting','wheelaxle','winch','incline','wedge','screw','pitch'],
  c6c: ['mechadv','work','joule'],
  c6d: ['compound','simplemach','mechadv'],
  c6e: ['weight','gfs','mechadv','compound','work'],
  c6f: ['efficiency','wasted','lubricant','friction']
};
```
Titles come from `SECTIONS` (`55-sections.js`: `title`, `part`, `n`, `ch`). Skip any key missing from `TERMS` or from `FC_ART` with a console warning in the test build only (never break).

## 4. The look: real index cards

- **Card**: landscape index card (ratio about 5:3, max 620 px wide, full width on phones). Paper `#fffdf6`, very slight warm grain is optional. A **red line** across the top (about 16% down, `#e06b6b`, 1.5 px) like a real index card header, and **pale blue ruled lines** below it (`#a9c8ea`, 1 px, every 32 px). Rounded corners 6 px, a soft paper shadow, and a 1–2° tilt that alternates per card. Two more cards peek out behind it (a stack) on the desk.
- **Text sits on the lines**: use the same line-height as the rule spacing (32 px) and align the ruled background to the text box (`background-image: repeating-linear-gradient(...)` positioned from the text box's top, or `background-attachment: local`), so handwriting baselines rest on the blue lines. Check this in a screenshot at desktop and phone widths; it is the main thing Tom asked for.
- **Fonts** (already embedded in `src/fonts-hand.css`): `'FC Hand Bold'` (Kalam Bold) for the big word, `'FC Hand'` (Patrick Hand) for meanings, labels, notes and the student's writing. Ink colours: word and meaning in blue-black `#1f3a93`; the student's own writing in a brighter biro blue `#2457c5`; small topic tag in pencil grey `#6b7480`.
- **Sizes**: word about 2.6rem (2rem on phones); meaning 1.35rem with auto-shrink for long meanings (over ~140 characters → 1.15rem). Never let text overflow the card: the card grows taller if needed.
- **Back layout**: meaning on the lines on the left (about 58%), picture on the right; stacked (picture under the meaning) below 560 px wide.
- **Flip**: a real 3D flip (`transform-style: preserve-3d`, front and back faces with `backface-visibility: hidden`, 0.5 s). With `prefers-reduced-motion`, swap faces without animation.
- **Desk**: the practice page sits on a soft desk-coloured panel (light wood or cork tone that works in dark mode too, e.g. `#e9dcc4` light / `#3a3226` dark), the card stays paper-coloured in both themes.
- **Topic tiles and the Leitner boxes** also use the handwriting font for their titles and the paper look, but body text elsewhere stays in the app's normal font (`--f-body`) for readability.
- The whole page uses `.noglos` on the cards so the glossary underliner does not underline words on the cards (it would give the answer away). But meeting words on cards should NOT count as "met" for the Journal (cards are inside `.noglos`, so they won't).
- Buttons use the existing app button classes (`go`, `ghost`, `sm`, `big`). Hidden in print. No sideways scroll at 390 px.

## 5. Files and who writes them

| File | Owner |
|---|---|
| `src/fonts-hand.css` (done), `src/js/64-fcart-kit.js` (done: `FC_ART`, `FC_INK`, `fcArt(key)`, helpers) | coordinator |
| `src/js/63-flashcards.js`, `src/flashcards.css`, edits to `src/index.html` (new `vCards` section, home card container), `src/js/20-shell.js` (add `vCards` to `VIEWS`, crumb text "Flashcards", home card render), `src/js/99-init.js` (click handlers), `src/js/23-cards.js` (Vocab tab button), `build.py` (add `fonts-hand.css` and `flashcards.css` to the CSS; add `fcRender`, `fcState`, `FC_TOPICS`, `fcArt`, `FC_ART`, `fcStartGo`, `fcAnswer` to the test hook), `tests/flashcards.py`, add `flashcards` to `tests/run_all.sh` | Agent A (engine and UI) |
| `src/js/64a-fcart-c1-3.js`: pictures for every key in c1f, c1x, c2f, c2x, c3f, c3x | Agent B (art) |
| `src/js/64b-fcart-c4-6.js`: pictures for every key in c4f…c6f that is not already in B's list | Agent C (art) |

Agent B's keys (33): force, push, pull, newton, newtonmeter, resultant, balanced, unbalanced, friction, weight, mass, gravity, normal, tension, airres, contact, noncontact, magnetic, fbd, arrow, scale, inertia, velocity, vtgraph, brake, brakingdist, newton1, slope, acceleration, mps2, newton2, triangle, unit.

Agent C's keys (37): newton3, forcepair, action, reaction, thrust, thruster, terminal, parachute, canopy, drag, gfs, vacuum, lift, hover, machine, lever, fulcrum, effort, load, effortarm, loadarm, pulley, supporting, wheelaxle, winch, incline, wedge, screw, pitch, mechadv, work, joule, compound, simplemach, efficiency, wasted, lubricant.

## 6. Picture rules (Agents B and C)

- Fill `FC_ART[key] = { alt, s, t }` using the helpers in `64-fcart-kit.js` (`fcArrow`, `fcLine`, `fcBox`, `fcCircle`, `fcGround`, `fcPerson`, `fcText`, `fcHi`, colours in `FC_INK`). You may write small local helpers in your own file, prefixed `fcB_` or `fcC_`. Plain SVG elements are fine too. Box is 240 × 150; keep everything inside with about 6 px margin, and labels at least 13 px font size so they read on a phone.
- Look: a quick, clear pen sketch a good science teacher would draw on an index card. One idea per picture, two to four labels at most, lots of white space. Red pen for the force arrow(s) or the key thing; blue pen for objects; green for a second force or "the other one"; pencil grey for ground and guide lines.
- The picture must not simply write the answer word in big letters (on reversed cards the picture appears on the back, but on the front "Need a clue?" shows it). Small labels like "N", "kg", "pivot" are fine; avoid writing the card's own term as a label where possible.
- Physics must be right: g = 9.8 N/kg; weight arrow down and normal force up, drawn from the centre of the object on any free-body sketch; friction opposite the motion (or attempted motion); arrow length shows size (balanced = equal length). Use non-round numbers where numbers appear (e.g. 23 N and 23 N; 5 kg → 49 N). Use "velocity" rather than "speed" in labels. Avoid regional words (say "flashlight" not "torch" if it ever comes up).
- Ideas (use these unless you find a clearer one):
  - force: a hand pushing a box (red arrow) and a hand pulling a rope on another box. push: person pushing a crate away, arrow away from person. pull: person pulling a sledge/crate on a rope towards them, arrow towards person. newton: an apple beside a label "≈ 1 N". newtonmeter: spring balance hanging, hook with mass, scale marks 0–10. resultant: 30 N left and 50 N right on a crate, then a single 20 N arrow to the right below it ("= 20 N →"). balanced: tug-of-war, equal arrows 23 N each, "0 N". unbalanced: unequal arrows, crate with a motion line. friction: box sliding right (motion arrow pencil), friction arrow left along the surface, rough surface bumps zoomed. weight: apple/ball with long red arrow down from centre, "5 kg → 49 N". mass: balance scale or a crate labelled "12 kg" on Earth and the Moon with the same number. gravity: small Earth with objects around it, arrows pointing to Earth's centre. normal: book on table, green arrow up from centre, red weight down. tension: rope holding a hanging lamp/bucket, arrow up along the rope. airres: cyclist or ball moving right, air streamlines, arrow left. contact: a foot kicking a ball (touching). noncontact: two magnets with a gap and arrows, or a ball falling. magnetic: bar magnets N–S attracting (arrows towards each other), paper clip. fbd: crate with four arrows from its centre (weight, normal, push, friction), labelled. arrow: two arrows, a short "10 N" and a long "40 N". scale: grid squares beside an arrow, "1 square = 50 N", arrow 4 squares long "200 N". inertia: tablecloth trick or a passenger leaning forward when a bus brakes. velocity: car with arrow and "12 m/s →". vtgraph: axes velocity (up) and time (along), line flat then sloping down. brake: wheel with brake pad pressing, friction arrow. brakingdist: car with "brakes on here" mark and a dimension line to the stop point. newton1: puck on ice gliding at steady velocity, no arrows sideways, "keeps going". slope: two lines on axes, steep and shallow, "steeper = bigger acceleration". acceleration: car with three positions further and further apart (motion dots). mps2: "+2 m/s every second": 0, 2, 4, 6 m/s under a moving ball. newton2: F = m × a with a small and large cart, same push, different acceleration. triangle: the F over m × a formula triangle. unit: a number with its unit circled, "49 N", "5 kg", "3 m/s²".
  - newton3 / forcepair / action / reaction: skater pushing a wall (red action arrow on wall, green reaction arrow on skater), or two skaters pushing apart. thrust: rocket with flame, arrow up from the rocket. thruster: spacecraft with a small side jet; gas out one way, craft moves the other. terminal: falling skydiver with equal weight and air resistance arrows, "steady velocity". parachute: crate under a canopy, big air resistance arrow up. canopy: a parachute with the canopy part highlighted. drag: boat or swimmer moving, arrow backwards. gfs: Earth "9.8 N/kg" vs Moon "1.6 N/kg" with a 1 kg mass. vacuum: hammer and feather falling side by side in a jar with no air. lift: helicopter with arrows of air going down and lift arrow up. hover: helicopter with equal lift and weight arrows, "stays still". machine: a crowbar/bottle opener making a job easier, small effort big load. lever: seesaw plank on a triangle pivot with load and effort. fulcrum: same lever with the pivot triangle highlighted. effort: hand pushing down on one end (green arrow). load: rock on the other end (red arrow down). effortarm / loadarm: lever with dimension lines from pivot to effort or to load (highlight the one asked). pulley: wheel with rope over it, bucket hanging. supporting: moving pulley block with two rope sections holding it (counted 1, 2). wheelaxle: big wheel on a thin axle with rope winding the axle. winch: crank handle winding a rope on a drum. incline: ramp with a box pushed up it. wedge: axe head splitting a log, arrows pushing the sides apart. screw: screw with spiral thread. pitch: screw thread with a dimension line between two ridges, "one turn". mechadv: lever with "load 600 N", "effort 150 N", "÷ = 4". work: person pushing a box a distance, "force × distance". joule: 1 N moving 1 m. compound: scissors or wheelbarrow with two machines labelled. simplemach: six tiny icons in a grid (lever, pulley, wheel and axle, ramp, wedge, screw). efficiency: energy in arrow splitting into useful out (thick) and wasted (thin, heat squiggles). wasted: rubbing parts with heat squiggles. lubricant: oil can dripping on a gear.
- Each file ends with a self-check in the test build only: no. Instead write `tests/fcart_check.py` (B) or add to it (C, as `tests/fcart_check_c.py`): build with `python3 build.py`, open `dist/test.html`, render every one of your pictures with `__fhq.fcArt(key)` into a contact sheet page (6 per row, at 240 × 150 and again at 2×), screenshot to `/tmp/fhq-shots/fc/art_b.png` (or `art_c.png`), check no console errors and that every key has `alt`, `s`, `t` and its SVG's drawn content stays inside the 240 × 150 box (use `getBBox()` on the two groups). Look at your own contact sheet with the Read tool and fix anything unclear, cramped, overlapping or clipped before you finish.

## 7. Tests (Agent A)

`tests/flashcards.py` (Playwright, Python, like `tests/vocab.py`; `__fhq` is the test hook):
- Home card appears and opens `vCards`; no console errors.
- Tick c1f and c2f: deck count = unique keys; untick c2f keeps progress history; re-tick restores.
- Start a go with clock control (`page.add_init_script` or a test-only `fcToday` override exposed through the hook): answer got/not yet; box and due dates follow the rules in section 2, including "missed then got stays in box 1, due tomorrow" and the cap of 20 cards and 10 new.
- Reversed card at box ≥ 3 masks the word in the meaning.
- Flip with click, Space, and keys 1/2 and arrows. Typed writing appears on the back.
- Ruled lines line up with text: for the meaning element, check that line-height equals the rule spacing (32 px) and screenshot the front and back at 1440, 820 and 390 px wide to `/tmp/fhq-shots/fc/`. `scrollWidth` equals the viewport width at 390 px.
- Backup round trip keeps `DB.fc` (use the functions in `70-backup.js` through `__fhq.ev`).
- The flashcards page makes no network requests (tests/net.py pattern).
- Run `python3 build.py` and the existing `tests/vocab.py`, `tests/smoke.py`, `tests/net.py`, `tests/backup.py` to make sure nothing else broke.

Agent A runs before the art is finished: use `fcArt(key)` and show a light pencil placeholder ("picture coming soon") when it returns ''.

## 8. Voice (all student text)

Warm, simple, full sentences at Grade 6–8 level, one idea per sentence. Say "approx." on any times. No MYP, criteria or standards on student screens. Example lines: "Tick the topics you have covered.", "Think of your answer, then flip the card.", "Nothing is due today. You are completely up to date!", "This card comes back tomorrow."
