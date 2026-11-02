# Force HQ Chapter 6: The Workshop — Save Captain Smooshy! (script)

Written 1 Nov 2026 by Claude (Opus), updated the same day with Tom's answers (blue Smooshy, the Extension efficiency extension and the build tasks) for **Claude Sonnet (medium effort)** to build from, in Claude Code on `tmh80/tmh-teaching-apps`, folder `force-hq-rebuild/`. **Audience: Grade 7 and 8.** Natural full sentences, enthusiastic and encouraging, everyday words, precise science words once they are taught.

**Read first:** `claude/Force_HQ_Handoff.md` (setup, rules, script format, delivery steps), `Force_HQ_Brief.md` (file map), `docs/Question_Types_Guide.md` (every question type, including `calcorder`), then this file. The number reference is `tools/workshop_model.py` (copy it from the project doc `claude/workshop_model.py`): **the JS must reproduce its numbers** (section C1). The repo's `.claude/skills/wab-science-sim-builder/SKILL.md` covers anything this script doesn't (voice, one-go questions, teacher code, testing).

**Redesign, 1 Nov 2026 (after Tom's first playtest of Part 1):** "far too difficult for Grade 7s and 8s". The simple machines are now split over two Parts taught slowly (Part 1 Levers, Part 2 Pulleys, wheels and ramps), every later Part moves up one number, and section A2 sets pacing and vocabulary rules that apply to **every** Part still to build. Read A2 before writing any step.

**If you change any wording** to fit the screen or to stop a readout giving an answer away, change it here too (copy this file to `docs/Chapter6_Workshop_Script.md` in the repo first), so the script and the app do not drift apart.

**Tom is a teacher, not a programmer.** Explain what you did in plain language and handle all git work yourself.

> **Build note (1 Nov 2026, Claude):** Extension's step ids are `p5a` and `p5b` (the script first called them `e1` and `e2`), and its missions are `gb1`–`gb3` (first `g1`–`g3`), because `e1`, `e2`, `g1` and `g2` are already used by Chapters 3 and 4 and `STEPMIN` is shared by every chapter. Everything else in this script is unchanged.

---

## A. Tom's decisions (1 Nov 2026)

- The Workshop is **Chapter 6**, the final and most creative chapter. It introduces **simple and compound machines**.
- The whole chapter is one mission: **save Captain Smooshy's spaceship**. Captain Smooshy is a gummy bear astronaut. In Grade 6, students did an osmosis lab with gummy bears dressed up as testing "Intergalactic Space Fluids" so Smooshy could travel to a galaxy thousands of light years away. Now (Grade 7/8) his ship is stuck in a crater and students save it with machines.
- **The goal must be clear from the very beginning.** A distress transmission opens the chapter, and a Rescue board stays on screen for the whole chapter.
- The arc, in order: **learn and test simple machines → mechanical advantage and work → compound machines (learn and test, with MA and work) → a final test: save Captain Smooshy's spaceship from a crater using mechanical advantage.**
- Not every Grade 7/8 student did the Grade 6 lab (new students), so the story is told in full and never assumes they remember it.
- **Answers to the first questions (1 Nov):** Smooshy is **blue**. "The Gumdrop" and "Glimmer-9" are confirmed. **Efficiency** is an optional **Extension** (after Part 5) with its own story: Glimmer-9's crystals turn out to be sugar, the gummies decide to terraform the planet, and students build Gummy Base One with real machines that waste energy. **Teacher build tasks** go in now (section W).

- **Playtest decisions (1 Nov, after Part 1):** the simple machines are split into **Part 1: Levers** and **Part 2: Pulleys, wheels and ramps**; the transmission is a **black box recording** from the crashed Gumdrop with Smooshy **trapped inside**; every effort in the Workshop is drawn as a **pull** with a spring-balance newtonmeter between the machine and a hand.

---

## A2. Pacing and vocabulary rules (Tom, 1 Nov 2026: apply to every Part)

Tom's verdict on the first Part 1 build: far too difficult; much slower pace needed when introducing an idea; examples thrown out in contexts unfamiliar to students (fishing rod, wheelbarrow) with no pictures; far too much burden on vocabulary students don't know yet. So, for every step still to build:

1. **One new word per card**, and no more than about three new words in a whole step. A word is only used to teach something else once students have practised it.
2. **A labelled picture beside every new idea** (helpers in `src/js/4bb-shoppics.js`: `picLever`, `picThree`, `picSeesaw`, `picWheelbarrow`, `picChopsticks`, `picCatch`, `picClass3Anim`, `picFlagpole`, `picMovingPulley`, `picScrewdriver`, `picRamp`, `picWedge`, `picScrewIdea`). Colours match the scene: fulcrum grey, load green, effort red. Add new `pic*` helpers rather than describing things in words. Pictures go in cards, questions and worksheets.
3. **Familiar examples only, one per idea, always with a picture.** Use things Grade 7/8 students in Beijing handle every day (seesaw, chopsticks, scissors, door handle, screwdriver, flagpole, wheelchair ramp, knife, jar lid, school crane on a building site if pictured). Never list several examples in one sentence. Avoid: fishing rod, nutcracker, bottle opener, crowbar, tweezers, forearm, pliers, ice tongs, claw hammer, stapler, can opener, tow truck (unless pictured and explained).
4. **Try first, name afterwards.** Students use a thing in the Workshop and see what happens before it gets its scientific name (as lv4 then lv5 do for the classes of lever).
5. **Plain words before technical terms.** On student screens: "rock to fulcrum" and "your hand to fulcrum" (never "load arm" or "effort arm"), "how far your hand moved" (never "effort distance"), "gap between threads" (never "pitch"). Code names can stay as they are. Mechanical advantage formulas from a machine's shape use the same plain words.
6. **Pictures and cards never give away the prediction** that follows them.
7. **Every effort is a pull you can see:** the spring balance (`wsSpring`) between the machine and a hand, with a red arrow.
7a. **Labels on pictures and in the scene sit in white text boxes with leader lines that stop at the box edge** (`picLabel`, `wsLabel`). **The Workshop rulers share one scale** (`wsRulers`; a bar under 40 px also gets a zoomed ruler).
8. **Pace over coverage.** Each Part stays at about 30 minutes or less. If the slower pace pushes a Part over, split it into another Part (as Parts 1 and 2 were) rather than speeding up.
9. **State the big rule explicitly after students have tried both ways** (Tom, 1 Nov): "A machine can make the effort you need smaller, or let you move something a bigger distance, depending on how you use it!" It is taught in lv3 (key-idea question) and shown in a highlighted box at the start of lv4 and Part 2. Later Parts refer back to it in those words.
10. Parts 3 to 6 below were written before this redesign. **Re-pitch each one against these rules before building it**, starting with Part 3 (mechanical advantage and work): cut examples to one familiar, pictured one, put a picture on every card that introduces a word, and replace any technical word a student hasn't met.

---

## B. Story frame (build this with the scene)

### B1. Names (confirmed by Tom; keep them in one `SMOOSHY` constant)
- **Captain Smooshy**, the bravest gummy bear in the universe.
- His ship: **the Gumdrop**.
- The planet: **Glimmer-9**, in a faraway galaxy. Gravitational field strength **g = 4.2 N/kg** (always given in the question, as Chapter 5 does for other worlds).
- Smooshy's strongest pull: **60 N** ("my squishy gummy arms").
- The gummy colonists (Extension): gummy bears in other sweet colours (lime green, lemon yellow, orange), all with the same 60 N limit. Their new home: **Gummy Base One**.
- Smooshy's voice: cheerful, brave, a bit dramatic, gummy jokes. Never babyish. One joke at most per message.

### B2. The transmission: a black box recording (first time any Chapter 6 section opens; replayable)
Built 1 Nov 2026 (`openTransmission` and `txCrash` in `4d-rescue.js`). A draggable modal, "📡 Black box signal detected!". A short animation first: the Gumdrop streaks down across Glimmer-9's violet sky with a flame trail, crashes into a crater (dust puff, a small screen shake), and lands tipped over with **Smooshy trapped inside**, peeping out of the round window. The ship's orange **black box** blinks and sends radio rings, with the label "BLACK BOX SIGNAL · GUMDROP". Reduced motion shows the last frame only. Then:

> **Black box recording · the Gumdrop · Planet Glimmer-9**
>
> Captain Smooshy here, the bravest gummy bear in the universe! The Grade 6 scientists at WAB found the Intergalactic Space Fluid that carried me to a galaxy thousands of light years away. Then disaster struck: the Gumdrop crashed into a deep crater on Planet Glimmer-9. I'm trapped inside, and the ship won't budge.
>
> My squishy gummy arms can only pull with **60 N**, and the Gumdrop weighs thousands of newtons. My black box is sending this message to Force HQ. Engineers, please learn how machines work and build me a way out. Over and out!

Buttons: **↺ Watch the crash again** and **Accept the mission!**, which then lists the five Parts. Store `DB.ws.briefed = true`.

### B3. The Rescue board (top of every Chapter 6 page)
A wide strip above the section tabs, drawn on a small canvas:
- **Left:** the crater on Glimmer-9 (violet sky, two moons, glittering crystal rocks). The Gumdrop lies tipped over at the bottom, a boulder pinning one landing leg; Smooshy waves from the cockpit window.
- **Right:** five mission slots (`RB_SLOTS`), each lighting up (colour plus a ✓) when that Part's stamp is earned, and each adding something to the crater picture:
  1. **Levers packed** (Part 1): a toolbox appears on the crater rim.
  2. **Toolkit packed** (Part 2): a second tool case appears beside it.
  3. **Mission computer loaded** (Part 3): a glowing tablet appears.
  4. **Crane kit built** (Part 4): a folded crane appears on the rim.
  5. **Smooshy saved!** (Part 5): the Gumdrop sits on the rim and Smooshy has his arms up.
  6. **Extension: Gummy Base One** (a dashed slot labelled "Extension", shown once Part 5 is done): a sugar-crystal dome, a water tower and a sugar garden appear beside the crater, one for each Extension mission passed or attempted (gb1–gb3).
- Until Part 5 is done, Smooshy is **inside** the tipped Gumdrop, seen through the window (`drawGumdropInside`), with the black box blinking beside it.
- Buttons: **📡 Replay transmission** and, once Part 5 is done, **Watch the rescue again** (replays the ending animation).
- One plain sentence under the slots that always says the next job, e.g. "Next: Part 3 teaches the maths the mission computer needs."

### B4. Smooshy in the Workshop
A small monitor on the Workshop wall shows Smooshy on a video call, with a sticky note saying **"60 N max!"**. He reacts to each pull with a speech bubble (short, varied, never the same twice in a row):
- effort 60 N or less: "Yes! Even my gummy arms could do that!" / "Sweet! That one's Smooshy-sized."
- effort over 60 N: "Too much for my gummy arms!" / "Ooh, that would turn me to jelly."
Use this only in Parts 1 to 3. Keep the bubble out of the way of the machine (top-left corner).

### B5. A "Rescue log" line in every step's completion message
When a Learn step completes, the existing completion message adds one short line, for example "Rescue log: levers packed in the toolkit." The exact lines are in each step below. Keep them forward-looking (Tom dislikes lines that justify why something is worth learning).

### B6. Art (flat, rounded, outline-free, like the rest of Force HQ)
- **Smooshy:** a gummy bear shape (round head with two round ears, chubby body, stubby arms and legs), a translucent jelly fill (one colour at about 85% opacity with a soft white highlight curve down the left side), a clear round bubble helmet with a glint, and a small white chest patch with a star. Dot eyes, a small curved smile. **Colour: blue** (Tom, 1 Nov): a bright jelly blue such as `#3b82f6` at about 85% opacity, a lighter blue highlight, and a slightly darker blue for the ears' inner circles. Check it reads well against the violet Glimmer-9 sky (keep a soft white rim glow if it doesn't) and in dark mode.
- **The Gumdrop:** a dome-shaped ship like a gumdrop sweet, sugar-crystal dots on the hull, three stubby landing legs and a round window.
- **Glimmer-9:** violet sky, two moons, pale lilac dust, glittering crystal rocks (which turn out to be sugar), a crater with sloping walls.
- **Gummy colonists and Gummy Base One** (Extension): the same gummy shape as Smooshy in other colours, with hard hats instead of helmets once the air is made breathable; rounded sugar-crystal domes, a water tower, terraced sugar gardens. In Part 5 the crater wall shows the four haul routes (straight up, steep, medium and gentle tracks).
- **The Workshop:** a wooden workbench, a pegboard of tools, a hoist beam across the ceiling, the Force HQ hangar door, and Smooshy's monitor.
- Draw each with helper functions in the scene module (`drawSmooshy(c, x, y, s, mood)`, `drawGumdrop(c, x, y, s, tilt)`). Moods: `wave`, `cheer`, `strain`, `worried`.

---

## C. Engine and scene spec (build this before the steps)

### C1. Machine maths (must match `tools/workshop_model.py`)
All Workshop machines are **ideal**: no friction, and the bars, pulleys and ropes weigh nothing. Say so on the ⓘ card of every machine panel: "Workshop machines are perfect: there's no friction, and the bars, pulleys and ropes weigh nothing."

| Machine | Settings | Mechanical advantage (MA) | Effort distance |
|---|---|---|---|
| Lever, class 1 | bar 2 m; slider = **load arm** 0.2–1.8 m (fulcrum slides) | effort arm ÷ load arm (effort arm = 2 − load arm) | MA × load rise |
| Lever, class 2 | fulcrum at one end, effort at the other; slider = **load arm** 0.2–1.8 m | 2 ÷ load arm | MA × load rise |
| Lever, class 3 | fulcrum at one end, load at the other; slider = **effort arm** 0.2–1.8 m | effort arm ÷ 2 | MA × load rise |
| Pulley system | **supporting ropes** 1–6 (1 = a single fixed pulley) | number of supporting ropes | ropes × load rise |
| Wheel and axle (winch) | **handle radius** 0.1–0.6 m (0.05 steps); **axle radius** 0.05 m (Explore: 0.04–0.10) | handle radius ÷ axle radius | MA × load rise |
| Ramp (inclined plane) | **length**; **height** (fixed per task; Explore: 0.6–1.5 m) | length ÷ height | the ramp length |
| Wedge | **length** 20 cm; **thickness** 10, 5, 4 or 2 cm | length ÷ thickness | MA × how far the halves open |
| Screw (screw jack) | **distance the handle moves in one turn** (60, 120 or 180 cm); **pitch** 0.2, 0.5 or 1.0 cm | distance per turn ÷ pitch | turns × distance per turn; turns = lift ÷ pitch |
| Compound (builder) | up to three of: ramp (route), pulley block (1–4 supporting ropes), winch (×2, ×4, ×6, ×8, ×10) | MA₁ × MA₂ × MA₃ | total MA × load rise |

- **Effort** = load ÷ MA, rounded to 0.1 N. **Judge everything on the rounded numbers students see** (forces to 0.1 N, distances to 0.01 m, MA to 0.01), as the November update did for the Drop Zone. "At most" limits are inclusive (60.0 N passes "60 N or less").
- **Work** = force × distance, in joules. Work in = effort × effort distance; work out = load × load rise. They are equal (ideal machines), apart from rounding: compute work in as `load ÷ MA × MA × rise` so the two always match exactly on screen.
- **Weight** = mass × g. Earth g = 9.8 N/kg; Glimmer-9 g = 4.2 N/kg.
- **Real machines (Extension and Explore only).** A **Perfect / Real** switch (`mfric`). With Real on, each part has an efficiency, and a compound machine's efficiency is the parts' efficiencies multiplied:

  | Part | Efficiency (Real) |
  |---|---|
  | Lever | 95% |
  | Pulley block | 1 rope 95% · 2 ropes 90% · 3 ropes 85% · 4 ropes 80% (more wheels, more rubbing); single machine with 5 or 6 ropes: 75%, 70% |
  | Winch (wheel and axle) | 90% |
  | Ramp or track (crystal dust under the wheels) | 75% |
  | Wedge | 40% |
  | Screw jack | 30% |

  Effort = load ÷ (MA × efficiency), rounded to 0.1 N. **Distances don't change** (the effort distance is still MA × load distance). Work out = load × rise; work in = work out ÷ efficiency, rounded to the nearest joule; **wasted energy** = work in − work out. Efficiency = work out ÷ work in × 100%, shown to the nearest 0.1%. Judge on these rounded numbers (an "at most 2,000 J" budget passes at exactly 2,000 J).
  While a real machine runs, its wheels and axles glow warm (a soft orange shimmer, brighter for more wasted energy; none with reduced motion), and a **Wasted (heat)** readout appears beside Work in and Work out.
- **Never use the letter W for work on student screens.** W already means weight (W = m × g). Write work in words: "work = force × distance". The calculator triangle for work is labelled **work / force × distance**.
- Winch ratios in the builder are shown as handle radius ÷ axle radius with a 0.05 m axle: ×2 = 0.10 m handle, ×4 = 0.20 m, ×6 = 0.30 m, ×8 = 0.40 m, ×10 = 0.50 m.
- Add `tests/workshop_numbers.py`: run the JS through `__fhq.ev` and check every value the model prints (each step's numbers, each mission's pass/fail grid, each rescue stage's pass/fail grid) matches exactly.

### C2. The Workshop scene (`S.scene = 'shop'`)
New modules (joined in name order after `49-heli.js`): `4a-workshop.js` (machine maths, scene state, pull animation, runs, masks), `4b-shopdraw.js` (drawing, including Smooshy, the Gumdrop and Glimmer-9), `4c-ch6.js` (steps, questions, sections data, `CHDATA` entries), `4d-rescue.js` (the machine builder, the rescue site and the rescue course). Challenge courses for Parts 3 and 4 go in `45-challenge.js` as `renderShopCourse`, following `renderDropCourse` / `renderOrdersCourse`.

**Built 1 Nov 2026 additions:** a `hand` machine (lift the load straight up with the newtonmeter, MA 1) used in lv1; the lever's pivot sits high when the fulcrum is in the middle (your end goes down, the newtonmeter hangs below it) and low for the other two designs (your hand pulls up), so the bar, newtonmeter and hand stay above the floor at every slider setting; whenever a lever moves the load further than your hand (MA below 1: the effort in the middle, or the fulcrum close to your hand) the rock rises **0.40 m** (`WS_LIFT3`) so the hand's movement is visible; the lever slider reads "Move the fulcrum / Move the rock / Move your hand" with "rock to fulcrum / your hand to fulcrum" underneath; the design buttons read "Fulcrum in the middle" etc., gaining "Class 1:" etc. only when a step sets `clsNames` (lv5 onwards); the big dial is now the **newtonmeter reading** panel and the spring balance at the hand is the newtonmeter itself.

**Layout:** the machine in the middle of the Workshop, the load on the load side, the effort point on the other side, a **newtonmeter** at the effort point (reuse the Chapter 1 newtonmeter drawing; grep `newtonmeter` in `src/js/`), Smooshy's monitor top-left. The newtonmeter has a red band from 60 N upwards labelled "Smooshy's limit".

**Panels** (each a panel id added by steps through `adds`; hide earlier chapters' panels with `hide` as Chapter 5 does):
- `mpick` machine picker (only the machines the step allows; buttons with small icons)
- `mlever` lever controls: class picker (1, 2, 3) and the arm slider with a typed number box (C1)
- `mropes` supporting ropes stepper 1–6
- `mwinch` handle radius slider + number box (and axle radius in Explore)
- `mramp` ramp length slider + number box, and height (Explore and step u2)
- `mwedge` thickness picker
- `mscrew` distance-per-turn picker and pitch picker, plus a **turn counter**
- `mload` load picker (only the loads the step names; Explore: any mass 1–2,000 kg)
- `pull` the big **Pull!** button, right beside the effort point (Tom: action buttons next to where the student is looking). For the wedge it reads **Push!**; for the winch and the screw jack, **Turn!**
- `rulers` two rulers drawn on the canvas after a pull: one beside the load's path, one beside the effort's path, ticks every 0.05 m (labels every 0.5 m; rope rulers stretch along the rope end). Students read distances from these.
- `readMA` mechanical advantage readout
- `readWork` Work in and Work out readouts
- `mworld` world picker (Explore only: Earth, Moon, Mars, Glimmer-9; shows g)
- `mfric` the **Perfect / Real** switch, and `readEff` (efficiency) and the Wasted (heat) readout (Extension and Explore)
- `builder` the machine builder (C3)

**Readouts** (always): Load (N) with its mass in brackets ("Load: 294 N (30 kg)"), Effort (the newtonmeter's digital window, 0.1 N), Load rise (m), Effort distance (m). `readMA` and `readWork` only where a step adds them.

### C3. Pull! (what happens when a student pulls)
No effort slider: the machine settings are the variables, and the newtonmeter measures the effort, as in a school practical.
1. **Phase 1 (0.8 s):** the rope tightens and the newtonmeter reading climbs smoothly from 0 to the effort needed. The load stays still.
2. **Phase 2:** the load rises to the task's lift height (1.5–4 s, whatever looks natural), and the effort point moves the effort distance (rope pays out, the lever tips, the handle turns, the cart rolls up the ramp, the wedge sinks and the log opens, the jack turns). The newtonmeter holds at the effort needed.
3. **End:** "Lifted!" (or "Split!" for the wedge). The rulers appear. A run is stored (C5). Smooshy's monitor reacts (B4).
- **A cap** (challenges and the rescue only, `cap: 60`): if the effort needed is more than the cap, the reading climbs to the cap and stops, the puller strains (a small wobble; none with reduced motion), and the load does not move: "Smooshy pulled as hard as he can (60 N), but this set-up needs 74.0 N."
- **Lever travel** (`maxTravel`, metres the effort end can move; default 1.5 m): if MA × lift height is more than that, the load stops early: "The lever only lifted the load 0.17 m before your end hit the floor."
- Pressing Pull! again resets the load and runs again. Changing a setting resets the load.
- Keyboard: Space or Enter on the button. Works with touch. A pull can't be started while one is running.

### C4. The machine builder (`builder` panel, Part 4, the rescue and Explore)
Port and adapt the old build's builder: `python3 tools/old.py bParts mDrawBuild mDrawCrane mDrawPulley mDrawLever PARTS bJudge mCalc` (never Read the old file whole). Keep the old look where it fits; change it to these rules:
- A chain of slots from left to right: **[the puller] → slot 1 → slot 2 → slot 3 → [the load]**. Each slot takes one part: **Route/ramp** (only in the last slot, because the ramp carries the load), **Pulley block** (1–4 supporting ropes), **Winch** (×2–×10). Each part type can be used once. An empty slot is skipped. Missions say which parts and routes are available.
- Live readouts (each maskable): **Total MA** = the product of the parts' MAs; **Cable needed** = pulley ropes × route length (route length = the lift height when there's no ramp; 1 rope if there's no pulley block); **Hand travel** = total MA × lift height.
- Drawing: the puller turning the winch handle (or pulling the rope), the cable to the pulley block, the block hooked to the load, the load on the route. With no winch the puller pulls the rope directly.
- **Lever, wedge and screw are not builder parts** (they are push machines, used in their own rescue stages).

### C5. Runs, readings and masks
- **Every pull is a run** (`runMark` / `runTick` / `runEnd`), with a `runText` sentence and `runChips`, so the Journal's Runs tab holds every reading and no question forces a re-run. Examples:
  - "You lifted the 294 N rock with a class 1 lever (load arm 0.4 m, effort arm 1.6 m). The effort was 73.5 N. The rock rose 0.10 m and your end moved 0.40 m."
  - "You lifted the 235.2 N crate with 4 supporting ropes. The effort was 58.8 N. The crate rose 1.00 m and you pulled 4.00 m of rope."
  - "Smooshy tried the crane (gentle track 75 m, 3 ropes, winch ×8). It needed 52.5 N, so it worked! The ship rose 15 m. Cable used: 225 m. Hand travel: 1,800 m."
  - A capped pull: "With winch ×6 and 2 ropes, the load needed 163.3 N, which is more than Smooshy's 60 N, so it didn't move."
- Chips: machine, settings, load, effort, load rise, effort distance (and MA and work once Part 3 has taught them).
- Store per run: machine, settings, world, load (N), effort, MA, load rise, effort distance, work in, work out, capped (yes/no), cable, hand travel, turns. Helpers like Chapter 5's: `shopRun(f)` (latest run matching a filter object, e.g. `{mach:'lever', cls:1, la:0.4}`), `shopE(f)`, `shopDist(f)`.
- **Students type every reading** (Tom: no passengers), checked against their own runs with `live:` as Chapter 5 does. Reading questions in the Do this list get an inline answer box (the d1 pattern), so nothing needs a trip to "Next: questions".
- **Masks** (`shopMasked`, the `dzMasked` pattern): steps list `mask: [{ q, keys, when }]`. Keys: `readE` (the newtonmeter's digital window and needle show "?"), `readMA`, `readWork`, `turns`, `bTotMA`, `bCable`, `bTravel`. A masked readout appears once its question is answered.
- **Calculation steps** use the 28 Oct pattern: a *calculate* task `['', () => hasAns('q2'), { q: 'q2' }]` and a short *check* task that ticks when the matching run exists. Leave a task's text empty when the question already holds the numbers.
- **Target-finding** isn't needed (the newtonmeter measures the effort directly), so no `LAB.bmarks` here.

### C6. The rescue site (`S.scene = 'rescue'`, Part 5)
- Glimmer-9's crater (B6), side-on. The Gumdrop at the bottom, tipped on its side, one leg under a boulder. The crater wall is **15 m** high, with an altitude scale.
- Stage 1 shows the crowbar on a rock fulcrum under the boulder; stage 2 shows the screw jack under the ship's sunken side; stage 3 shows the four routes up the wall, a winch anchored on the rim, and the builder below the canvas.
- **Smooshy is the puller in every stage** (`cap: 60`). He walks out of the ship in his suit and works the crowbar, the jack handle or the winch handle.
- The mission computer panel (`mcomp`): before each try, the student types a prediction (C7); Smooshy only tries once a number is typed (any number counts).
- When stage 3 succeeds: the ending animation. The Gumdrop rises up the chosen route onto the rim and Smooshy does a happy wobble-dance. He leans on a glittering crystal, licks it, and freezes: "Wait... these crystals are SUGAR!" He calls home on his wrist radio: "Gummies of the galaxy, I've found us a new home!" The Gumdrop does a victory loop above the crater with a blue exhaust trail, then a "Mission complete" card. If Extension exists, the card adds: "Extension unlocked: help the gummy colonists build Gummy Base One." Reduced motion: a still picture and the card.

### C7. Scoring
- **Parts 3 and 4 Challenges** (y1–y3, h1–h3): the existing pattern. All objectives met on the 1st try = 4 points, 2nd = 3, 3rd = 2, later = 1; **Move on** after 3 misses scores 1. A pass is green and starts "Congratulations!". A miss lists each objective with its result, target and ✓/✗ in that order ("Effort: 61.3 N. Target: 60 N or less. ✗"). Each mission has a "Need a clue?" ladder.
- **The rescue** (sm1–sm3, Tom's rule for hard game challenges): score = **objectives met on the student's best try** in each stage (4 + 4 + 5 = 13 points). Easier objectives are included, so everyone scores. **Attempting all three stages is enough to finish the Challenge.** After 3 tries in a stage, a **Move on** button appears; moving on keeps the best score. Show the objectives as a checklist that ticks live.
- **The ending always celebrates.** If stage 3 was never fully met, the ending says: "With your plan, Smooshy got the Gumdrop part of the way up. Force HQ's backup team used your numbers to finish the job. Want to perfect it? You can try the rescue again in Explore." and the sugar discovery and victory loop still play.

### C8. Glossary, formulas, facts, sections, chapter data
**New `TERMS`** (check for duplicates first; `weight`, `mass`, `gfs` exist):
- `machine`: Machine. Something that makes a job easier, often by letting a small force move a big load.
- `simplemach`: Simple machine. One of the six basic machines: the lever, pulley, wheel and axle, inclined plane, wedge and screw.
- `compound`: Compound machine. Two or more simple machines working together, like scissors, a bicycle or a crane.
- `lever`: Lever. A strong bar that turns around a fixed point called the fulcrum.
- `fulcrum`: Fulcrum. The point a lever turns around (its pivot).
- `effort`: Effort. The force you put into a machine.
- `load`: Load. The force the machine has to move, often the weight of the object.
- `effortarm`: Effort arm. The distance from the fulcrum to where the effort pushes.
- `loadarm`: Load arm. The distance from the fulcrum to the load.
- `pulley`: Pulley. A wheel with a rope running round it.
- `supporting`: Supporting rope. A section of rope that holds up the moving pulley block and the load.
- `wheelaxle`: Wheel and axle. A big wheel (or handle) fixed to a thin rod, the axle, so they turn together.
- `winch`: Winch. A wheel and axle that winds in a rope or cable.
- `incline`: Inclined plane. A ramp: a flat sloping surface that lets you raise a load with a smaller force.
- `wedge`: Wedge. Two ramps back to back, used to split, cut or hold things apart.
- `screw`: Screw. A ramp wrapped round a rod. The spiral ridge is the thread.
- `pitch`: Pitch. The distance a screw moves forward in one full turn.
- `mechadv`: Mechanical advantage. How many times bigger the load is than the effort: load ÷ effort. It has no unit.
- `work`: Work. The energy transferred when a force moves something: force × distance, measured in joules.
- `joule`: Joule (J). The unit of work and energy. One joule is the work done when a 1 N force moves something 1 m.
- `efficiency`: Efficiency. How much of the work you put into a machine comes out as useful work: useful work out ÷ work in × 100%.
- `wasted`: Wasted energy. Energy that goes somewhere you didn't want it. In a machine, friction turns some of the work in into heat.
- `lubricant`: Lubricant. A slippery substance, like oil or grease, that reduces friction between moving parts.
- `terraform`: Terraform. To change a planet so that it can become a home, for example by making its air breathable.

**`FORMULAS`** (all `ch: [6]`; add 6 to the `ch` of `weight`):
- `ma`: Mechanical advantage · MA = load ÷ effort · "No unit: it's newtons divided by newtons."
- `effortq`: Effort needed · effort = load ÷ MA
- `maparts`: MA from the shape · pulley: supporting ropes · lever: effort arm ÷ load arm · wheel and axle: wheel radius ÷ axle radius · ramp: length ÷ height · wedge: length ÷ thickness · screw: distance per turn ÷ pitch
- `edist`: Effort distance · effort distance = MA × load distance · "Less force means more distance."
- `macomp`: Compound machines · total MA = MA₁ × MA₂ × MA₃ · "Multiply, don't add."
- `work`: Work · work = force × distance · "In joules (J). Force in N, distance in m." A tappable triangle **work / force × distance** like the F = ma triangle.
- `eff`: Efficiency · efficiency = useful work out ÷ work in × 100% · "It can never be more than 100%."
- `wasted`: Wasted energy · wasted energy = work in − useful work out

**Fun facts** (gated to Chapter 6; check each one before shipping):
1. The Greek scientist Archimedes, over 2,200 years ago, said that with a long enough lever and a place to stand, he could move the Earth.
2. Your forearm is a class 3 lever. To hold a 1 kg bag in your hand, your biceps pulls with several times the bag's weight.
3. Ancient Egyptian builders probably used ramps to haul huge stone blocks up the pyramids.
4. The Archimedes screw, a screw turning inside a tube, has been lifting water for over 2,000 years, and some are still in use today.
5. One of the world's strongest cranes, the Taisun in China, has lifted about 20,000 tonnes in one go.
6. A car jack lets one person lift one side of a car by turning a handle, thanks to a screw with a very small pitch.
7. (Extension) A clean, oiled bicycle chain is one of the most efficient machines there is: well over 90% of the work you put in reaches the back wheel.

**Sections** (`55-sections.js`). Use ids `c6a`–`c6e` (grep first: section, step, mission and question ids must not clash with any existing id, including `m1`, `r1` and `q1`):

| id | title | part | stamp | steps | challenge | review | needs |
|---|---|---|---|---|---|---|---|
| `c6a` | Levers | Part 1 | Lever Learner | lv1–lv5 | none | c6r1–c6r5 | |
| `c6b` | Pulleys, wheels and ramps | Part 2 | Toolkit Packer | pl1–pl4 | none | c6r7–c6r11 | c6a |
| `c6c` | Mechanical advantage and work | Part 3 | Advantage Ace | u1–u3 | y1–y3 | c6r12–c6r17 | c6b |
| `c6d` | Compound machines | Part 4 | Master Builder | k1–k3 | h1–h3 | c6r18–c6r22 | c6c |
| `c6e` | Rescue Captain Smooshy! | Part 5 | Smooshy Saver | v1 | sm1–sm3 | c6r23–c6r26 | c6d |
| `c6f` | Real machines waste energy | Extension | Colony Engineer | p5a–p5b | gb1–gb3 | c6r27–c6r31 | c6e |

- Blurbs: c6a "Levers, pulleys, wheels and axles, ramps, wedges and screws: the six simple machines, and the trade-off they all share." · c6c "Put numbers on it: mechanical advantage, the force–distance trade-off and work in joules, then load the rescue rocket." · c6d "Machines inside machines: build a crane, multiply mechanical advantages and assemble the rescue kit." · c6e "Fly to Glimmer-9 and plan the rescue in three stages. Can a 60 N gummy bear haul a spaceship out of a crater?" · c6f "Glimmer-9's crystals are sugar! Measure how real machines waste energy, then build Gummy Base One on a tight solar energy budget."
- **Part labels:** the other chapters use "Foundation" / "Extension". Chapter 6 uses "Part 1" to "Part 5", then "Extension" for c6f. Grep for code that tests `part ===`, `'Foundation'` or `'Extension'` (stamp book, teacher page ticks, optional sections, `wsFileName`, the AI text) and make it work with these labels. File names become `Force HQ Ch6 Part 1 (Simple machines) - Alex Chen.pdf`. On the teacher page, Parts 1 to 5 are ticked like core sections; **c6f is optional and unticked by default** (the Brief's rule for efficiency), and its worksheet is labelled "Extension" with no MYP Crit A review role beyond its own Check.
- **Chapter view:** chapters so far have two sections. Check the chapter page, `openChapter`, the section tabs and the stamp book all handle four.
- `STEPMIN`: lv1 5, lv2 5, lv3 5, lv4 5, lv5 4, pl1 6, pl2 4, pl3 4, pl4 5, u1 5, u2 5, u3 6, k1 4, k2 5, k3 5, v1 4, p5a 6, p5b 5. **Target: every Part shows approx. 30 min or less** (`secMins`). Parts 1 and 2 come out at about 31 and 27 minutes. Count the rescue Challenge as about 15 minutes.
- **Chapter data:** `CHAPTERS` gets `{ id: 'c6', n: 6, title: 'The Workshop', blurb: 'Simple and compound machines, mechanical advantage and work, and a rescue mission: save Captain Smooshy\'s spaceship!', stamp: 'Smooshy Saver', ready: true, arena: 'Workshop', icon: 'gear' }` (draw a `gear` icon for `chIcon`, or reuse the Workshop card's pulley icon). `goal`: "Name the six simple machines and say how each one helps; work out mechanical advantage, effort and effort distance; calculate work as force × distance and explain why an ideal machine doesn't reduce the work; find the mechanical advantage of a compound machine by multiplying, and use it to plan a rescue." `vocab`: machine, simple machine, compound machine, lever, fulcrum, effort, load, pulley, supporting rope, wheel and axle, inclined plane, wedge, screw, mechanical advantage, work, joule.
- **Home:** the Workshop building on the home map opens Chapter 6 (replace the "being built" toast). Rewrite `#workshopCard` to "Chapter 6 · The Workshop: Save Captain Smooshy!". Add Chapter 6 to the chapter list in Chapter 1's overview card (`41-ch1.js`, around line 107). Remove "and the Workshop" from the teacher page's "More chapters…" note.
- **Explore:** a **Workshop** card in Explore with every machine, the builder, any load, the world picker (Earth, Moon, Mars, Glimmer-9) and the Perfect / Real switch, plus **Try the rescue again** (the rescue site with every setting free and no scoring) and the four **build tasks** (section W).
- **Worksheets:** add `c6a`–`c6f` to `SHEETS` in `tools/make_worksheets.py`. The Part 5 worksheet also prints a **Rescue report** (section K4). Add lever and pulley pictures for paper with small SVG helpers (`leverSVG({cls, ea, la, labels})`, `pulleySVG(ropes)`, `buildSVG(parts)`); the same helpers draw the pictures inside questions.
- **MYP tags:** `obj` on every Check question, as listed. Run `python3 tests/strands.py`. Strands never go on student screens or sheets. Part 5's Check carries **D i, D ii and D iii**, which fills the D ii gap in the Backlog. The Extension Check carries D i and D iii.

---

## D. Misconceptions this chapter targets

| Code | Misconception | Where it is challenged |
|---|---|---|
| M1 | A machine reduces the work you have to do | u3 q4, c6r14, c6r25 |
| M2 | A bigger mechanical advantage is always better (no cost) | u3 q5, h-missions, sm3, c6r25 |
| M3 | A single fixed pulley reduces the effort | pl1 q4, u1 q4 |
| M4 | Compound MAs add instead of multiply | k2 predict, k3 q3, c6r20 |
| M5 | The rope you pull is the same length as the height lifted | pl1 q2, u3 q1, c6r16 |
| M6 | Moving the fulcrum closer to your hand makes the lever easier | lv2 predict, lv2 q3, c6r2 |
| M7 | Class 3 levers are useless because the effort is bigger than the load | lv4 q3, lv5 q2 |
| M8 | A steeper (shorter) ramp needs a smaller push | pl3 predict, c6r9 |
| M9 | MA has a unit (newtons) | u1 card 1, c6r12 |
| M10 | Friction changes the distance you pull, as well as the force | p5a predict, c6r28 |
| M11 | A machine can be more than 100% efficient | p5a q3, c6r30 |
| M12 | Friction is always bad | p5b q3 |

---

## E. Question plans

- **Part 1 Learn (levers):** lv1 reading, reading, pick (label the lever) · lv2 predict, reading, pick, mcq · lv3 reading, reading, reading, pick, tap (key idea: the big rule) · lv4 predict, reading, reading, pick · lv5 pick, mcq.
- **Part 1 Check** (5): pick (label a lever) → reason (+ sure) → mcq (which class, from a labelled picture) → fix → explain.
- **Part 2 Learn:** pl1 predict, reading, reading, pick, mcq · pl2 predict, reading, pick · pl3 predict, reading, mcq · pl4 predict, reading, pick, tick.
- **Part 2 Check** (5): match → pick → fix → reason (+ sure) → explain.
- **Part 3 Learn:** u1 num, num, pick, mcq · u2 num, num, calcorder · u3 predict, reading, num, num, tap (key idea), reason (cartoon). **Challenge:** three missions.
- **Part 3 Check** (6): num → fix → reason (+ sure) → num → pick → explain.
- **Part 4 Learn:** k1 match, tick · k2 predict, reading, num, pick · k3 num, num, fix. **Challenge:** three build missions.
- **Part 4 Check** (5): sort → num → reason (+ sure) → order → explain.
- **Part 5 Learn:** v1 num, num, pick. **Challenge:** the rescue, three stages.
- **Part 5 Check** (4): explain (D i) → num → reason (+ sure) → explain (D ii).
- **Extension Learn:** p5a predict, reading, num, num, pick · p5b num, pick, reason (cartoon). **Challenge:** three base-building missions.
- **Extension Check** (5): num → reason (+ sure) → calcorder → fix → explain.

---

## F. Part 1: Levers (c6a)

Rewritten 1 Nov 2026 after Tom's playtest, to the pacing rules in section A2. Generated from the built step data, so it matches the app; change both together.

### Step lv1: Too heavy for Smooshy   (Part 1, about 5 min)

CARDS
1. Welcome to the Workshop! Captain Smooshy's squishy gummy arms can only pull with **60 N**. A big rock is pinning his spaceship, so let's find out how hard a 30 kg rock is to lift. You'll lift it with a newtonmeter in your hand, and its reading tells you how hard you pulled.
2. When a job is too hard, engineers use a machine: something that helps a small force do a big job. Your first machine is a lever. It is a strong bar resting on a pivot, and the pivot is called the fulcrum. [Picture: A lever: a strong bar resting on a pivot called the fulcrum]
3. The thing a lever moves is called the load. In the Workshop, the load is the rock. [Picture: A lever with the fulcrum in the middle]
4. Your pull on the other end of the bar is called the effort. So every lever has three parts: the fulcrum, the load and the effort. [Picture: A lever with the fulcrum in the middle]

DO THIS
- Choose **By hand** and press **Lift!**
- (answer box) q1
- Now choose the **Lever**. The fulcrum starts in the middle of the bar. Press **Pull!**
- (answer box) q2

YOUR TURN QUESTIONS
q1 | reading | Lifting the rock by hand, what did the newtonmeter read? | unit N | tolerance 1
   ok: Right, 294 N. That's nearly five times more than Smooshy's 60 N!
q2 | reading | With the lever and the fulcrum in the middle, what did the newtonmeter read? | unit N | tolerance 1
   ok: 294 N again! With the fulcrum in the middle, the lever doesn't make the job any easier yet. You'll change that in the next step.
q3 | pick | Label the lever. [Picture: A lever with three parts marked A, B and C] Part A is the {0}, part B is the {1} and part C is the {2}.
   {0}: fulcrum / load / effort → fulcrum · {1}: fulcrum / load / effort → load · {2}: fulcrum / load / effort → effort
   after: The fulcrum is the pivot, the load is the rock, and the effort is your pull.
Rescue log: Lever found. Time to put it to work!

### Step lv2: Move the fulcrum   (Part 1, about 5 min)

CARDS
1. Here's where a lever gets clever. Use the slider to move the fulcrum along the bar. The labels above the bar show how far the rock is from the fulcrum, and how far your hand is from it. After each move, press **Pull!** and read the newtonmeter.
2. Fun fact: The Greek scientist Archimedes, over 2,200 years ago, said that with a long enough lever and a place to stand, he could move the Earth.

PREDICT FIRST
Question: You move the fulcrum closer to the rock. What will happen to the effort you need?
Options: It gets smaller, because more of the bar is on your side · It gets bigger, because the rock is now closer to the fulcrum · It stays the same, because the rock's weight hasn't changed · It drops to zero, because the fulcrum now holds up the rock
After: Test it! Move the fulcrum close to the rock and pull.

DO THIS
- Make your prediction in the box above.
- Move the fulcrum so the rock is **0.4 m** from it, then press **Pull!**
- (answer box) q1
- Find a fulcrum position where the effort is **60 N or less**.

YOUR TURN QUESTIONS
q1 | reading | With the rock 0.4 m from the fulcrum, what did the newtonmeter read? | unit N | tolerance 1
   ok: Yes, 73.5 N. That's four times smaller than lifting the rock by hand.
q2 | pick | Moving the fulcrum closer to the rock made the effort {0}.
   {0}: got bigger / stayed the same / got smaller → got smaller
   after: The closer the fulcrum is to the rock, the smaller the effort you need.
q3 | mcq | Captain Smooshy wants to lift a heavy rock with a lever and a small pull. Where should he put the fulcrum?
   Options: Close to the rock, so his side of the bar is long · Close to his hand, so his side of the bar is short · Exactly in the middle, so both sides are the same · Anywhere, because the fulcrum doesn't change the pull | correct 0
   ok: Spot on! A long side for his hand means a small pull.
Rescue log: Fulcrum trick learned.

### Step lv3: The catch   (Part 1, about 5 min)

CARDS
1. Is there a catch to this trick? Let's find out. After each pull, two rulers appear under the bench. The **green ruler** shows how far the rock rose. The **red ruler** shows how far your hand moved. Compare them carefully. You'll try three fulcrum positions.

DO THIS
- Pull with the rock **0.4 m** from the fulcrum and look at both rulers.
- (answer box) q1
- Now move the fulcrum so the rock is **0.2 m** from it, and pull again.
- (answer box) q2
- Last one: move the fulcrum close to **your hand**, so the rock is **1.6 m** from it. Pull, and compare the rulers again.
- (answer box) q3

YOUR TURN QUESTIONS
q1 | reading | With the rock 0.4 m from the fulcrum, the rock rose 0.10 m. How far did your hand move? Use the red ruler. | unit m | tolerance 0.02
   ok: 0.40 m: four times further than the rock rose.
q2 | reading | With the rock 0.2 m from the fulcrum, how far did your hand move? | unit m | tolerance 0.02
   ok: 0.90 m! The effort was tiny, but your hand moved nine times further than the rock.
q3 | reading | With the fulcrum close to your hand, the rock rose 0.40 m. How far did your hand move? Use the red ruler. | unit m | tolerance 0.02
   ok: Only 0.10 m! This time the rock moved four times further than your hand, but the newtonmeter read a huge 1,176 N.
q4 | pick | With the fulcrum close to the rock, the effort was {0} and your hand moved further. With the fulcrum close to your hand, the effort was {1} and the rock moved further.
   {0}: small / the same as by hand / big → small · {1}: small / the same as by hand / big → big
q5 | tap | **Key idea.** Tap the sentence that sums up what you found.
   Options: A machine can make the effort you need smaller, or let you move something a bigger distance, depending on how you use it! · A machine always makes the effort smaller, however you use it. · A machine makes the load lighter, so it is easier to move. · A machine makes the effort and the distance smaller at the same time. | correct 0
   ok: Yes! That's the big rule for every machine. You choose: a smaller effort (and your hand moves further), or a bigger distance for the load (and you pull harder).
Rescue log: The big rule is in the mission log: a smaller effort, or a bigger distance.

### Step lv4: Three ways to build a lever   (Part 1, about 5 min)

CARDS
1. Here's the big rule you found. Remember it: it works for every machine in the Workshop.A machine can make the effort you need smaller, or let you move something a bigger distance, depending on how you use it!Close to the rock, the fulcrum gives you a **smaller effort**. Close to your hand, it gives the rock a **bigger distance**. It can't do both at once.
2. So far the fulcrum has always been in the middle. You can also build a lever with the load in the middle, or with your effort in the middle. Use the new buttons to try each design. Pull, then check the newtonmeter and the two rulers. [Picture: Three ways to build a lever: fulcrum in the middle, load in the middle, or effort in the middle]

PREDICT FIRST
Question: With the effort in the middle, your hand pulls up close to the fulcrum and the rock sits at the far end. How will the effort compare with the rock's weight?
Options: The effort will be bigger than the rock's weight · The effort will be smaller than the rock's weight · The effort will be equal to the rock's weight · The effort will be zero, because the fulcrum holds it
After: Try the load in the middle first, then the effort in the middle.

DO THIS
- Make your prediction in the box above.
- Choose **Load in the middle**. Put the rock **0.5 m** from the fulcrum and pull.
- Choose **Effort in the middle**. Put your hand **0.5 m** from the fulcrum and pull.
- (answer box) q1
- (answer box) q2

YOUR TURN QUESTIONS
q1 | reading | With the effort in the middle, what did the newtonmeter read? | unit N | tolerance 2
   ok: 1,176 N: four times the rock's weight!
q2 | reading | With the effort in the middle, the rock rose 0.40 m. How far did your hand move? Use the red ruler. | unit m | tolerance 0.02
   ok: Only 0.10 m. A small movement of your hand swung the rock four times as far.
q3 | pick | With the effort in the middle, the effort was {0} the rock's weight, but the rock moved {1} your hand.
   {0}: smaller than / the same as / bigger than → bigger than · {1}: less far than / the same distance as / further than → further than
   after: It's the catch again, the other way round: a bigger effort, but a bigger distance at the load.
Rescue log: Three lever designs tested.

### Step lv5: The three classes of lever   (Part 1, about 4 min)

CARDS
1. Scientists give the three designs names. They are the three **classes** of lever, and you name each one by what is in the middle. [Picture: The three classes of lever: class 1 has the fulcrum in the middle, class 2 the load in the middle and class 3 the effort in the middle]
2. Here's an everyday example of each one. A seesaw is a **class 1** lever: the fulcrum is in the middle. [Picture: A seesaw: the fulcrum is in the middle, a heavy box sits on one end and you push down on the other end]
3. A wheelbarrow is a **class 2** lever. The wheel is the fulcrum, the heavy soil in the middle is the load, and you lift the handles at the end. [Picture: A wheelbarrow: the wheel is the fulcrum, the soil in the middle is the load, and you lift the handles at the end]
4. Chopsticks are a **class 3** lever. They pivot where they rest in your hand, your fingers squeeze in the middle, and the food is at the tips. [Picture: A pair of chopsticks: they pivot where they rest in your hand, your fingers squeeze in the middle, and the dumpling is at the tips]
5. Watch a class 3 lever in action. The effort is big, but your hand only moves a little, and the far end swings a long way. [Picture: Class 3 lever, animated: the hand near the fulcrum pulls up a little with a big force, and the rock at the far end swings up a long way]

DO THIS
- The buttons now show the class names. Build a **class 3** lever with your hand **1.0 m** from the fulcrum and pull. Watch the far end swing.

YOUR TURN QUESTIONS
q1 | pick | In a class 2 lever, the {0} is in the middle. In a class 3 lever, the {1} is in the middle.
   {0}: fulcrum / load / effort → load · {1}: fulcrum / load / effort → effort
q2 | mcq | Chopsticks are a class 3 lever. Why are they so useful?
   Options: A small squeeze of your fingers moves the tips a long way · Your fingers squeeze with less force than the food's weight · The food gets lighter when you hold it at the tips · Class 3 levers can work without any fulcrum at all | correct 0
   ok: Yes! Small finger movements open and close the tips wide.
Rescue log: All three classes of lever logged. The lever kit is packed!


---

## G. Part 1 Check (c6r1–c6r5)

c6r1 | pick | obj ['Ai'] | Label the parts of this lever. [Picture: A lever with three parts marked A, B and C] A is the {0}, B is the {1} and C is the {2}.
   {0}: fulcrum / load / effort → load · {1}: fulcrum / load / effort → effort · {2}: fulcrum / load / effort → fulcrum

c6r2 | reason | obj ['Aii'] | Mia uses a plank resting on a brick to lift a heavy box. The brick is the fulcrum. She moves the brick closer to her hand. What happens to the effort she needs?
   Options: It gets bigger · It gets smaller · It stays the same · It drops to zero | correct 0
   reasons: Her side of the plank gets shorter and the box's side gets longer · Her hand is closer to the brick, so the plank is easier to push · The box gets heavier when the brick moves towards her · The brick now holds up more of the box's weight for her | correct reason 0

c6r3 | mcq | obj ['Aii'] | Which class of lever is this? [Picture: A lever with the load in the middle]
   Options: Class 1 · Class 2 · Class 3 · It isn't a lever | correct 1

c6r4 | fix | obj ['Aiii'] | Leo explains how he used a lever. One line has a mistake. Tap it, then choose the correct line.
   lines: 1. Leo put the fulcrum close to the rock. · 2. That made his side of the bar much longer. · 3. So he needed a smaller effort to lift the rock. · 4. And his hand moved a shorter distance than before. | mistake: line 4
   fix: And his hand moved a longer distance than before · And the rock rose a longer distance than before · And his hand did not need to move at all · And the rock became lighter than before → correct 0

c6r5 | explain | obj ['Aii'] | Captain Smooshy needs to lift a heavy boulder off his spaceship's leg. He has a long bar and a small rock to use as the fulcrum, and he can only pull with 60 N. Explain where he should put the fulcrum, and what the catch is.
   words: fulcrum, effort, load, distance
   model: He should put the fulcrum close to the boulder, so his side of the bar is long. That makes the effort much smaller than the weight of the boulder (the load), so his 60 N pull can lift it. The catch is distance: his end of the bar has to move a long way to lift the boulder only a little.
   checklist: Says the fulcrum should go close to the boulder (the load), so his side of the bar is long · Says this makes the effort smaller than the load · Says the catch: his hand has to move further than the boulder rises

---

## F2. Part 2: Pulleys, wheels and ramps (c6b)

### Step pl1: Pulleys   (Part 2, about 6 min)

CARDS
1. Welcome to Part 2! Remember the catch from the lever: a smaller effort means your hand moves further. Look out for it in every new machine. [Picture: The catch: with the fulcrum close to the rock, your hand moves a long way and the rock only rises a little]
2. A pulley is a wheel with a rope running round it. A flagpole has one at the top: you pull the rope down, and the flag goes up. [Picture: A flagpole: a pulley wheel at the top lets you pull the rope down to raise the flag up]
3. Here's a trick to make the crate easier to lift: hang it from a pulley that moves up with it. Now there's more than one piece of rope holding the crate up, and the pieces **share** its weight. They're called supporting ropes. With 2 supporting ropes, each one holds up half of the crate. Count only the ropes that hold the crate up: the end you pull isn't holding the crate, so don't count it. [Picture: A pulley that moves with the crate: two supporting ropes hold it up, and the end you pull is not counted]

PREDICT FIRST
Question: With 4 supporting ropes, how much rope will you have to pull to lift the crate 1 m?
Options: 4 m of rope, because each of the 4 ropes gets 1 m shorter · 1 m of rope, because the crate only rises 1 m · 0.25 m of rope, because the 4 ropes share the job · 2 m of rope, because the pulley doubles the distance
After: Lift the crate with 1, 2, 3 and 4 supporting ropes. Watch the newtonmeter and the red ruler.

DO THIS
- Make your prediction in the box above.
- Lift the crate with **1, 2, 3 and 4** supporting ropes.
- (answer box) q1
- (answer box) q2

YOUR TURN QUESTIONS
q1 | reading | With 4 supporting ropes, what effort lifted the 235.2 N crate? | unit N | tolerance 0.5
   ok: Yes, 58.8 N, a quarter of the crate's weight. That's under Smooshy's limit!
q2 | reading | With 4 supporting ropes, the crate rose 1.0 m. How much rope did you pull? Use the red ruler. | unit m | tolerance 0.05
   ok: 4 m of rope for a 1 m lift. Each of the 4 supporting ropes got 1 m shorter.
q3 | pick | Each extra supporting rope made the effort {0} and the length of rope you pulled {1}.
   {0}: bigger / the same / smaller → smaller · {1}: shorter / the same / longer → longer
   after: The catch again: less force, more rope.
q4 | mcq | A flagpole has just one pulley, so the pull you need is the same as the flag's weight. Why is the pulley still useful?
   Options: You can stand at the bottom and pull down to raise the flag to the top · It makes the flag lighter, so it is easier to lift to the top · It halves the pull you need to raise the flag to the top · It stops the flag from ever sliding back down the pole | correct 0
   ok: Exactly. One pulley changes the direction of your pull, so you pull down and the flag goes up.
Rescue log: Pulley blocks packed in the toolkit.

### Step pl2: Wheel and axle   (Part 2, about 4 min)

CARDS
1. A wheel and axle is a big wheel fixed to a thin rod, called the axle, so they turn together. A screwdriver is one: the fat handle is the wheel, and the thin metal shaft is the axle. [Picture: A screwdriver is a wheel and axle: the fat handle is the wheel and the thin metal shaft is the axle]
2. The Workshop's winch is a wheel and axle too. You turn the handle, and the thin axle winds up the rope to lift the bucket. Try a short handle, then a long one.

PREDICT FIRST
Question: You swap a short winch handle for a long one. What will happen to the effort?
Options: It gets smaller, because your hand moves round a bigger circle · It gets bigger, because a long handle is heavier to turn · It stays the same, because the bucket weighs the same · It drops to zero, because the handle does all the work
After: Lift the bucket with each handle and watch the newtonmeter.

DO THIS
- Make your prediction in the box above.
- Lift the bucket with a handle radius of **0.1 m**, then **0.25 m**.
- (answer box) q1

YOUR TURN QUESTIONS
q1 | reading | With a handle radius of 0.25 m, what effort lifted the 196 N bucket? | unit N | tolerance 0.5
   ok: Yes, 39.2 N. The long handle made your force five times bigger at the axle.
q2 | pick | The longer handle made the effort {0}, and your hand moved {1} as it turned the handle.
   {0}: bigger / the same / smaller → smaller · {1}: less far / the same distance / further → further
   after: Your hand travels round a bigger circle, so a smaller force does the job.
Rescue log: A winch packed in the toolkit.

### Step pl3: Ramps   (Part 2, about 4 min)

CARDS
1. A ramp lets you raise a load without lifting it straight up. You'll see ramps at school entrances, for wheelchairs and trolleys. Scientists call a ramp an inclined plane. [Picture: A cart on a ramp up to a platform, with the length of the ramp and the height of the platform marked]

PREDICT FIRST
Question: You pull a 490 N cart up onto a 1 m high platform. Which ramp will need the smallest pull?
Options: The longest ramp, 5 m long and gentle · The shortest ramp, 2 m long and steep · Every ramp needs exactly the same pull · The middle ramp, 4 m long and medium
After: Try the 2 m ramp, then the 5 m ramp.

DO THIS
- Make your prediction in the box above.
- Pull the cart up the **2 m** ramp, then the **5 m** ramp.
- (answer box) q1

YOUR TURN QUESTIONS
q1 | reading | What pull got the 490 N cart up the 5 m ramp? | unit N | tolerance 0.5
   ok: 98 N, a fifth of the cart's weight. You pulled it 5 m to raise it 1 m.
q2 | mcq | Why does the 5 m ramp need a smaller pull than the 2 m ramp?
   Options: The cart travels a longer distance, so each metre needs less force · The cart weighs less when it sits on a long, gentle ramp · The long ramp has less friction, so the cart rolls more easily · The steep ramp pushes back on the cart and makes it heavier | correct 0
   ok: Yes! Less force, more distance, again.
Rescue log: A folding ramp packed in the toolkit.

### Step pl4: Ramps in disguise   (Part 2, about 5 min)

CARDS
1. Two more simple machines are ramps in disguise. A wedge is two ramps back to back. Push it down into a log and its sloping sides push the two halves apart. A knife and a doorstop are wedges. [Picture: A wedge is two ramps back to back. Pushing it down into a log pushes the two halves apart]
2. A screw is a ramp wrapped round a rod, and the spiral ramp is called the **thread**. A car jack uses a screw: each turn of the handle lifts the car by the small gap between two threads. [Picture: A screw is a ramp wrapped round a rod: wrap a paper triangle round a pencil and its sloping edge makes a spiral thread]

PREDICT FIRST
Question: You split the same log with a fat wedge (5 cm thick) and a thin wedge (2 cm thick). Both are 20 cm long. Which will need the smaller push?
Options: The thin wedge needs the smaller push · The fat wedge needs the smaller push · Both wedges need the same push · Neither wedge can split the log
After: Split the log with each wedge and watch the newtonmeter.

DO THIS
- Make your prediction in the box above.
- Split the log with the **5 cm** wedge, then the **2 cm** wedge.
- Lift the car with the screw jack, first with a **1.0 cm** gap between threads, then a **0.5 cm** gap. Watch the turn counter.
- (answer box) q1
- **Toolbox job:** Smooshy's ice block needs **500 N** to split. Choose a wedge that splits it with **60 N or less**.

YOUR TURN QUESTIONS
q1 | reading | How many turns of the handle lifted the car 20 cm with the 0.5 cm gap between threads? | unit turns | tolerance 0
   ok: 40 turns! The closer threads needed half the effort, but twice as many turns.
q2 | pick | With the threads closer together (0.5 cm), the effort was {0} and the number of turns was {1}.
   {0}: bigger / the same / smaller → smaller · {1}: smaller / the same / bigger → bigger
q3 | tick | Tick every object that uses a wedge.
   Options: A kitchen knife · A doorstop · The point of a nail · Your front teeth · A doorknob · A seesaw | correct [0, 1, 2, 3]
   ok: Yes! A doorknob is a wheel and axle, and a seesaw is a lever.
Rescue log: Wedges and a screw jack packed. The toolkit is ready!

---

## G2. Part 2 Check (c6r7–c6r11; the id c6r6 is not used)

c6r7 | match | obj ['Ai'] | Match each everyday object to its simple machine.
   rows: Flagpole → Pulley · Screwdriver → Wheel and axle · Wheelchair ramp → Ramp (inclined plane) · Doorstop → Wedge · Jar lid → Screw · Seesaw → Lever

c6r8 | pick | obj ['Aii'] | A crane lifts a load with 4 supporting ropes. Compared with lifting the load straight up, the effort is {0} and the rope pulled is {1}.
   {0}: four times bigger / the same / a quarter as big → a quarter as big · {1}: a quarter as long / the same length / four times longer → four times longer

c6r9 | fix | obj ['Aiii'] | Leo explains ramps. One line has a mistake. Tap it, then choose the correct line.
   lines: 1. Ana needs to get a heavy box onto a 1 m high stage. · 2. She could pull it up a long ramp or a short, steep ramp. · 3. The long ramp needs a smaller pull, but she pulls it further. · 4. A steeper ramp would need a smaller pull, because it is shorter. | mistake: line 4
   fix: A steeper ramp would need a bigger pull, but over a shorter distance · A steeper ramp would need the same pull, because the box weighs the same · A steeper ramp would need no pull at all, because the box slides down · A steeper ramp would need a smaller pull, because the box rises faster → correct 0

c6r10 | reason | obj ['Aii'] | Ana swaps the handle on her winch for a longer one. What happens to the effort she needs to lift the same bucket?
   Options: It gets smaller · It gets bigger · It stays the same · It drops to zero | correct 0
   reasons: Her hand moves round a bigger circle, so a smaller force does the same job · A longer handle is heavier, so its weight helps to turn the axle · The axle gets bigger, so the rope winds in much faster · The bucket gets lighter when the handle is longer | correct reason 0

c6r11 | explain | obj ['Aii'] | Captain Smooshy wants to split a block of space ice with a wedge. Explain how a wedge works, and which shape of wedge he should choose.
   words: wedge, force, thin, distance
   model: A wedge is two ramps back to back. When Smooshy pushes the wedge into the ice, its sloping sides push the two halves apart with a much bigger force than his push. He should choose a long, thin wedge, because it needs the smallest push. The catch is that he has to push it further into the ice.
   checklist: Says the sloping sides push the ice apart with a bigger force than the push · Says a long, thin wedge needs a smaller push than a short, fat one · Says the smaller push has to move further (the catch)

---

## H. Part 3: Mechanical advantage and work (c6c)

**Re-pitched 2 Nov 2026 against section A2 before building.** What changed from the first draft:
- Banned or unpictured examples gone: "crowbar" and "fishing rod" are out (the lever example is the Part 1 rock lever, pictured). The six-formula card is split: the lever, winch and ramp rules each get their own card and picture, one at a time. The pulley rule (count the supporting ropes) is seen in u1 and checked in u2 q3. The wedge and screw rules wait for Part 4, where students use them.
- Plain words: "rock to fulcrum", "your hand to fulcrum", "handle radius", "axle radius", "length of the ramp", "how far your hand moved". No "effort arm", "load arm", "effort distance" or "pitch" on any student screen.
- "Class 3 lever with a mechanical advantage below 1" is cut from u1 (it comes back in Part 4's compound-machine work).
- u2 loses the `calcorder` question (3 minutes of sorting) and u3 loses the cartoon `reason` (the Check's explain question c6r17 covers the same idea). Without them Part 3 comes to about 30 minutes (Learn 13, Challenge 9, Check about 8).
- New words per step: u1 one (mechanical advantage); u2 none (rules only); u3 two (work, joule), each on its own card with its own picture.
- Pictures (new helpers in `4bb-shoppics.js`): `picMA` (the Part 2 crate as two bars: the load is 4 effort-sized pieces), `picLeverDims` (rock 0.4 m and hand 1.6 m from the fulcrum, with a `calc` version), `picWinchDims` (handle radius and axle radius, no numbers), `picWork` (294 N moving a crate 1 m; `unit` version adds joules), `picWorkInOut` (a machine with effort in and load out; no distances drawn, so the u3 prediction is not given away). u1 reuses `picFlagpole`; u2 reuses `picRamp`.
- Nothing before a prediction gives it away: the u3 cards never say how much rope; the first time students see "12 m" is on the ruler.
- Masks: the mechanical advantage readout is hidden until the matching u1 question is answered; the effort readout is hidden in u2 for the 0.4 m winch and the 4 m ramp until the matching question is answered (so the check confirms the student's answer); the work readouts are hidden in u3 until both work questions are answered.
- "W" is not used for work anywhere. The word "work" is first used for the force × distance meaning in u3 (the glossary entry says so).

### Step u1: Mechanical advantage   (Part 3, about 4 min)
Arena: the Workshop, pulley rig, 30 kg crate (294 N, load id `crate`), lift 1.0 m, 1 to 6 supporting ropes. Adds `readMA`; hides the machine picker and the rulers. Formulas glowing: `ma`.

CARDS
1. 📡 Smooshy: "My mission computer can't understand 'easier'. It needs a number!" Mechanical advantage: how many times bigger the load is than the effort. Worked example from Part 2: the 235.2 N crate needed 58.8 N with 4 supporting ropes, so the load is 4 times bigger, mechanical advantage 4. Picture `picMA`. Key idea box: mechanical advantage = load ÷ effort. It has no unit (newtons ÷ newtons).
2. A flagpole has one pulley, so the effort is the same as the flag's weight: mechanical advantage 1, no help with the force. Picture `picFlagpole`.

DO THIS
- Lift the 294 N crate with **3** supporting ropes. Read the newtonmeter. (`shopHas({mach:'pulley', ropes:3})`)
- q1 (inline answer box)
- Now lift it with **6** supporting ropes.
- q2 (inline answer box)

YOUR TURN QUESTIONS
q1 | num | Use your newtonmeter reading for 3 supporting ropes. What is the mechanical advantage? | answer 3 | no unit | tolerance 0.05 | ladder
   Hints: Mechanical advantage = load ÷ effort. · The load is 294 N. The effort is your newtonmeter reading. · Type 294 ÷ (your reading) into the calculator.
q2 | num | Same, for 6 supporting ropes | answer 6 | tolerance 0.1 | ladder. After: for a pulley system, the mechanical advantage is the number of supporting ropes.
q3 | pick | A machine with a mechanical advantage of 1 needs an effort {0} the load [smaller than / the same as / bigger than → the same as]. A machine with a mechanical advantage of 5 needs an effort {1} the load [5 times smaller than / the same as / 5 times bigger than → 5 times smaller than].
Masked readouts: `readMA` for the 3-rope run until q1 is answered, and for the 6-rope run until q2 is answered.
Rescue log: The mission computer has learned mechanical advantage.

### Step u2: Mechanical advantage from the shape   (Part 3, about 4 min)
Arena: the Workshop with the winch (196 N bucket) and the ramp (490 N cart); the ramp height picker is on. Adds `wsmach`; hides the rulers. Formulas glowing: `ma`, `effortq`, `maparts`.

CARDS (one rule each, each with a labelled picture)
1. Lever: mechanical advantage = (your hand to fulcrum) ÷ (rock to fulcrum). Worked example `picLeverDims`: rock 0.4 m and hand 1.6 m from the fulcrum, 1.6 ÷ 0.4 = 4.
2. Effort needed: effort = load ÷ mechanical advantage. The 294 N rock needed 73.5 N in Part 1: 294 ÷ 4. Same picture with the sum.
3. Winch: mechanical advantage = handle radius ÷ axle radius (same unit). Picture `picWinchDims`, no numbers.
4. Ramp: mechanical advantage = length ÷ height. Picture `picRamp`.

DO THIS
- q1 (inline answer box, before lifting): the effort a winch with a 0.4 m handle and a 0.05 m axle needs for the 196 N bucket.
- Check it: choose the Wheel and axle, set the handle radius to 0.4 m and press Turn!
- q2 (inline): the pull the 490 N cart needs on a 4 m ramp that is 0.8 m high.
- Check it: choose the Ramp, set it 4 m long and 0.8 m high, and pull the cart.

YOUR TURN QUESTIONS
q1 | num | answer 24.5 | unit N | units picker | tolerance 0.5 | ladder. Working: 0.4 ÷ 0.05 = 8, 196 ÷ 8 = 24.5 N.
q2 | num | answer 98 | unit N | units picker | tolerance 0.5 | ladder. Working: 4 ÷ 0.8 = 5, 490 ÷ 5 = 98 N.
q3 | pick | To find the mechanical advantage of a pulley system, count the {0} [supporting ropes]. A ramp 6 m long and 1.5 m high has a mechanical advantage of {1} [4].
Masked readouts: `readE` on the 0.4 m winch until q1 is answered, and on the 4 m, 0.8 m ramp until q2 is answered.
Rescue log: The mission computer can predict the effort for any simple machine.

### Step u3: Work and the catch   (Part 3, about 5 min)
Arena: the Workshop, pulley rig, 294 N crate, 6 supporting ropes, lift height picker (1 m or 2 m). Adds `readWork`, `rulers`. Formulas glowing: `edist`, `work`.

CARDS
1. You know a smaller effort means your hand moves further. Now you will measure exactly how much further.
2. **Work** (first new word): when a force moves something it does work. work = force × distance. Picture `picWork`: 294 N moves a crate 1 m, 294 × 1 = 294.
3. **Joule** (second new word, own card): work is measured in joules, J. Lifting the 294 N crate 1 m takes 294 J. Same picture with the unit.
4. A machine has two ends: you put work in at your hand, and the machine does work on the load. Picture `picWorkInOut` (no distances drawn).

PREDICT FIRST (after the cards)
Question: A pulley system with 6 supporting ropes lifts the 294 N crate 2 m. How much rope will you pull?
Options: 12 m of rope · 3 m of rope · 8 m of rope · 2 m of rope
After: Lift the crate 2 m and measure the rope with the red ruler.

DO THIS
- Make your prediction in the box above.
- Choose a lift height of **2 m**, set **6** supporting ropes and lift the crate. (`shopHas({mach:'pulley', ropes:6, rise:2})`)
- q1, q2, q3 (inline answer boxes)

YOUR TURN QUESTIONS
q1 | reading | How much rope did you pull to lift the crate 2 m with 6 supporting ropes? Use the red ruler. | live `shopDist({mach:'pulley', ropes:6, rise:2})` | unit m | tolerance 0.05. After: 12 m, six times the 2 m the crate rose; your hand's distance = mechanical advantage × the load's distance.
q2 | num | Your effort was 49 N and you pulled 12 m of rope. How much work did you put in? | answer 588 | unit J | units picker | tolerance 1 | ladder
q3 | num | The 294 N crate rose 2 m. How much work did the machine do on the crate? | answer 588 | unit J | units picker | tolerance 1 | ladder. After: exactly the same as the work in.
q4 | tap | **Key idea.** Tap the sentence that is true for a perfect machine. Correct: "The work in equals the work out, spread over a longer distance". Wrong options: work in smaller than work out; work in bigger than work out; both zero.
Masked readouts: `readWork` until q2 and q3 are both answered.
Rescue log: The mission computer now checks the work for every plan.

---

## I. Part 3 Challenge: Launch-day loading (y1–y3)

Engine: `renderShopCourse` in `45-challenge.js` (scoring as in C7: all objectives met on the 1st pull = 4 points, 2nd = 3, 3rd = 2, later = 1; "Move on (1 point)" appears after 3 misses). `cap: 60`: a set-up that needs more than 60 N is a miss ("needs 61.3 N (too much)" in the log). The student chooses one setting; everything else is locked; no machine picker, no rulers; the mechanical advantage readout stays on. The section carries its own title and intro (`chalInfo` in the `c6c` section entry).

Intro: Smooshy's rescue rocket, **Gummy Rescue One**, is on the launch pad at Force HQ, and it needs loading! Practise like Smooshy: no pull may be more than **60 N**. Work out the mechanical advantage you need first, then choose your setting. Try to get each one right first time!

y1 | Oxygen tank | pulley, 25 kg tank (245 N), lift 3 m; the student chooses supporting ropes 1 to 6
   Brief: Lift the oxygen tank 3 m up into the rocket's hatch. Your pull must be **60 N or less**, and there are only **15 m of rope**.
   Objectives: pull 60 N or less · pull 15 m of rope or less
   Clues: What mechanical advantage gets the effort under 60 N? 245 ÷ 60 = 4.08. · Each choice also needs rope: the rope pulled = supporting ropes × 3 m. · 4 ropes need 61.3 N, and 6 ropes need 18 m of rope. Which number is left?
   Feasibility (model): only 5 ropes passes (49.0 N, 15 m). (The pulley picture scales so a 3 m lift stays under the top pulley.)

y2 | Fuel barrel | ramp, 80 kg barrel (784 N), up a 1.2 m loading bay; the student chooses ramp length 3 to 21 m in 1.5 m steps
   Brief: Pull the fuel barrel up onto the 1.2 m loading bay. Your pull must be **60 N or less**, and the hangar only has room for a ramp **up to 18 m long**.
   Objectives: pull 60 N or less · use a ramp up to 18 m long
   Clues: The mechanical advantage you need is 784 ÷ 60 = 13.1. · For a ramp, mechanical advantage = length ÷ height, so the length must be at least 13.1 × 1.2 m. · That is at least 15.7 m. Which lengths fit in the hangar?
   Feasibility: 16.5 m (57.0 N) and 18 m (52.3 N) pass; 15 m needs 62.7 N; 19.5 m and 21 m do not fit.

y3 | Spare engine | winch, 50 kg engine (490 N), lift 2 m, axle 0.05 m; the student chooses handle radius 0.10 to 0.60 m in 0.05 steps
   Brief: Winch the spare engine 2 m up into the cargo bay. Your pull must be **60 N or less**, and the winch is bolted next to a wall, so the handle radius can be **0.5 m at most**.
   Objectives: pull 60 N or less · use a handle radius of 0.5 m or less
   Clues: The mechanical advantage you need is 490 ÷ 60 = 8.2. · For a winch, mechanical advantage = handle radius ÷ 0.05 m, so the handle must be at least 8.2 × 0.05 m. · That is at least 0.41 m. Which handles fit by the wall?
   Feasibility: 0.45 m (54.4 N) and 0.5 m (49.0 N) pass; 0.4 m needs 61.3 N; 0.55 m and 0.6 m hit the wall.

After the last mission: "Gummy Rescue One is fully loaded! Next, Part 4: machines inside machines."

---

## J. Part 3 Check (c6r12–c6r17)

c6r12 | num | obj ['Aii'] | A car jack lifts a 4,500 N car with an effort of 18 N. What is its mechanical advantage? | answer 250 | no unit | tolerance 0.5 | ladder
   Hints: Mechanical advantage = load ÷ effort. · Type 4500 ÷ 18 into the calculator. · Mechanical advantage has no unit.

c6r13 | fix | obj ['Aiii'] | Leo works out the work done pulling a sled. Spot his mistake. Tap it, then correct the answer.
   lines: 1. The pull on the sled is 120 N. · 2. The sled moves 15 m. · 3. Work = force ÷ distance · 4. Work = 120 ÷ 15 = 8 J
   mistake: line 3
   fix (num): "What is the correct work done?" | answer 1800 | unit J | units picker | tolerance 1
   why: Work = force × distance, so the work is 120 × 15 = 1,800 J.

c6r14 | reason | sure: true | obj ['Aii'] | A worker gets a crate onto a truck by pushing it up a long ramp instead of lifting it straight up. Ignoring friction, how does the work she does compare?
   Options: The work is the same either way · The ramp means she does less work · The ramp means she does more work · The ramp means she does no work at all (correct: the first)
   Reasons: She pushes with a smaller force over a longer distance, so force × distance is the same (correct) · Her push is smaller, so force × distance must be smaller as well · She moves the crate further, so force × distance must be bigger · The ramp holds up the crate, so she is not raising it at all

c6r15 | num | obj ['Aii'] | A winch has a handle radius of 0.36 m and an axle radius of 0.04 m. What effort lifts a 540 N bucket? | answer 60 | unit N | units picker | tolerance 0.5 | ladder
   Working: mechanical advantage 0.36 ÷ 0.04 = 9, effort 540 ÷ 9 = 60 N. Just right for Smooshy!

c6r16 | pick | obj ['Aii'] | A pulley system with 5 supporting ropes lifts a 650 N load 3 m. The effort is {0} [130 N] and the rope pulled is {1} [15 m].

c6r17 | explain | obj ['Aii'] | Captain Smooshy can only pull with 60 N, but he needs to lift a 600 N oxygen tank 2 m. Explain how a pulley system could help him, and what the catch is.
   words: mechanical advantage, effort, supporting ropes, distance, work
   model: He needs a mechanical advantage of 600 ÷ 60 = 10. The supporting ropes share the tank's weight, so with 10 supporting ropes his effort is 10 times smaller than the load, 60 N. The catch is that he has to pull 10 times as much rope as the height the tank rises: 20 m of rope for a 2 m lift. The work he does stays the same: 60 × 20 = 600 × 2 = 1,200 J.
   checklist: Works out the mechanical advantage needed (600 ÷ 60 = 10) · Says the supporting ropes share the load, so the effort is smaller · Says he must pull a longer distance of rope (10 times the height, 20 m) · Says the work stays the same (force × distance)

Strands for the sheet: A ii, iii (`tests/strands.py`).

---

## K. Part 4: Compound machines (c6d)

### Step k1: Machines inside machines   (Part 4, about 4 min)
Arena: the Workshop with a **compound machine gallery** on the bench: a wheelbarrow, a pair of scissors, a can opener and a crane. Tapping one zooms in and highlights its simple machines one at a time, each labelled ("Lever", "Wedge", "Wheel and axle", …). Adds `gallery`. Hides the machine controls.

CARDS
1. 📡 *Smooshy:* "Even the best single machine can't lift the Gumdrop with my 60 N. We need teamwork!" A **compound machine** is two or more simple machines working together. Scissors are two levers with a wedge on each blade. A bicycle has wheels and axles, levers for the pedals and brakes, and screws holding it together.
2. Here's the exciting part: when one machine drives another, their mechanical advantages **multiply**. You'll test that in the next step. First, tap each machine in the gallery to find the simple machines hiding inside.

DO THIS
- Tap all four machines in the gallery.   (ticks when all four have been opened; show four small chips)

YOUR TURN QUESTIONS
q1 | match | Match each compound machine to the simple machines inside it.
   rows: Scissors → Two levers and two wedges · Wheelbarrow → A lever and a wheel and axle · Crane → A winch and a pulley system · Car jack → A screw and a lever handle
   options: the four answers, shuffled
q2 | tick | Tick every compound machine.
   Options: A bicycle · A pair of scissors · A can opener · A crane · A ramp · A crowbar
   correct: 0, 1, 2, 3
Glossary words to underline: compound machine, simple machine.
Masked readouts: none.
Rescue log: Compound machines spotted. Time to build one!

### Step k2: Build a crane   (Part 4, about 5 min)
Arena: the Workshop crane: a winch on the bench winds the rope of a pulley system under the hoist beam (port `mDrawCrane`). A 120 kg engine block (1,176 N), lift 2 m. Adds `mwinch` (×2–×10 as in C1), `mropes` (1–4), `readMA` (shows **Total MA**), `rulers`. Formulas glowing: `macomp`.

CARDS
1. The Workshop crane has two simple machines. You turn the **winch** handle, a wheel and axle, and the winch winds in the rope of a **pulley system**. The winch makes your force bigger, then the pulleys make it bigger again.
2. To find the total mechanical advantage, multiply.
   Worked example: Winch ×4 and 3 supporting ropes. Total MA = 4 × 3 = **12**. A 1,176 N load needs an effort of 1,176 ÷ 12 = **98 N**.
   Key idea: total mechanical advantage = MA of machine 1 × MA of machine 2.

PREDICT FIRST
Question: A winch with a mechanical advantage of 4 drives a pulley system with 3 supporting ropes. What is the total mechanical advantage?
Options: 12, because the advantages multiply · 7, because the advantages add up · 4, because only the biggest one counts · 3, because the last machine decides
After: Set up the crane and check with the newtonmeter.

DO THIS
- Make your prediction in the box above.
- Set the winch to **×4** and use **3** supporting ropes. Press **Turn!**   (ticks on that run)
- (inline answer box) q1
- (calculate task) q2
- Check it: set the winch to **×6** with **4** supporting ropes and turn the handle.   (ticks on that run)

YOUR TURN QUESTIONS
q1 | reading | With the winch at ×4 and 3 supporting ropes, what effort lifted the 1,176 N engine block? | live: shopE({mach:'crane', w:4, ropes:3}) | unit N | tolerance 0.5
   ok: 98 N: twelve times smaller than the load, just as 4 × 3 predicted.
q2 | num | With the winch at ×6 and 4 supporting ropes, what effort lifts the 1,176 N engine block? | answer 49 | unit N | tolerance 0.5 | units picker | ladder
   Hints: Multiply the two mechanical advantages to get the total. · 6 × 4 = 24. · Effort = 1,176 ÷ 24.
q3 | pick | With a total MA of 24, the engine block rose 2 m, so your hand moved {0} on the handle, and the work you did was {1} the work done on the block.
   {0}: 2 m / 24 m / 48 m → 48 m
   {1}: less than / equal to / more than → equal to
Glossary words to underline: compound machine, winch, pulley.
Masked readouts: `readMA` and `readE` for the ×6, 4-rope set-up until q2 is answered.
Rescue log: Crane design tested. Smooshy is impressed.

### Step k3: The machine builder   (Part 4, about 5 min)
Arena: the Workshop with the **machine builder** (C4). A 240 kg generator (2,352 N) on a 6 m ramp that rises 2 m. Parts available: ramp (fixed: 6 m, rising 2 m), pulley block, winch. Adds `builder` with `bTotMA`, `bCable`, `bTravel`.

CARDS
1. Welcome to the **machine builder**! Drop up to three simple machines into the slots. Your pull goes into the first slot, and each machine drives the next one. The builder shows how much cable each set-up needs and how far your hand has to travel.
2. Remember the catch: every extra bit of mechanical advantage means a longer pull. Real rescues have limits, such as only so much cable and only so much time. Your job is to build a machine that is strong enough, without being so slow that it takes forever.

DO THIS
- Build **winch ×4 → pulley block with 2 ropes → the ramp**.   (ticks when those parts are in the slots)
- (calculate task) q1
- Turn the handle and watch the generator roll up the ramp.   (ticks on that run)
- (calculate task) q2

YOUR TURN QUESTIONS
q1 | num | Your machine has a winch ×4, a pulley block with 2 supporting ropes and a ramp 6 m long that rises 2 m. What is its total mechanical advantage? | answer 24 | unit (no unit) | tolerance 0.05 | ladder
   Hints: Find each machine's MA. The ramp's is length ÷ height. · The ramp: 6 ÷ 2 = 3. The pulley block: 2. The winch: 4. · Multiply: 4 × 2 × 3.
q2 | num | The generator rose 2 m. How far did your hand travel on the winch handle? | answer 48 | unit m | tolerance 0.5 | units picker | ladder
   Hints: Effort distance = MA × load distance. · The total MA is 24, and the load rose 2 m. · 24 × 2.
q3 | fix | Leo works out the effort for his compound machine. Spot his mistake. Tap it, then correct it.
   lines: 1. Pulley block: MA = 4 · 2. Winch: MA = 5 · 3. Total MA = 4 + 5 = 9 · 4. Effort = 1,800 ÷ 9 = 200 N
   mistake: line 3
   fix (num): ask "What effort does his machine really need for the 1,800 N load?" | answer 90 | unit N | units picker | tolerance 0.5
   why: Mechanical advantages multiply: 4 × 5 = 20, so the effort is 1,800 ÷ 20 = 90 N.
Glossary words to underline: mechanical advantage, compound machine.
Masked readouts: `bTotMA` until q1 is answered; `bTravel` until q2 is answered.
Rescue log: Machine builder unlocked. The crane kit is almost ready!

---

## L. Part 4 Challenge: Build the rescue kit (h1–h3)

Engine: `renderShopCourse` with the builder (C4), C7 scoring. Each mission says which parts and routes are available and gives its limits; the builder's readouts are live (not masked) here. Effort cap = the mission's effort limit.

Intro: The rescue kit needs three jobs done in the Workshop. Each one needs a compound machine. Plan it with the numbers, then test it.

h1 | Hoist the nose cone | 200 kg nose cone (1,960 N), straight up 6 m; parts: pulley block (1–4), winch (×2–×10); no ramp
   Brief: Hoist the rocket's nose cone 6 m. The crane operator can pull **100 N at most**. There's **30 m of cable**, and the job must take **150 m of hand travel or less**.
   Objectives: effort ≤ 100 N · cable ≤ 30 m · hand travel ≤ 150 m
   Clues: MA needed = 1,960 ÷ 100 = 19.6, and hand travel = MA × 6 m, so the MA must be 25 or less. · No single machine here gets to 19.6. Which pairs multiply to between 19.6 and 25? · Try 2 ropes with winch ×10, or 3 ropes with winch ×8.
   Feasibility (model): 2 ropes ×10 (MA 20), 3 ropes ×8 (24), 4 ropes ×6 (24).

h2 | Load the Gummy Rover | 400 kg rover (3,920 N) onto the rocket's deck, 2 m up; parts: route (straight up 2 m, ramp 4 m, ramp 6 m, ramp 10 m), pulley block (1–4), winch (×2–×10)
   Brief: Get the rover onto the deck, 2 m up. The pull must be **80 N or less**, there's **40 m of cable**, and the job must take **120 m of hand travel or less**.
   Objectives: effort ≤ 80 N · cable ≤ 40 m · hand travel ≤ 120 m
   Clues: MA needed = 3,920 ÷ 80 = 49, and at most 120 ÷ 2 = 60. · Cable = supporting ropes × route length, so long ramps and lots of ropes use cable fast. · The 10 m ramp has an MA of 5. What do the pulley block and the winch need to multiply to?
   Feasibility: six builds pass (MA 50 to 60), for example ramp 10 m + 1 rope + ×10, ramp 6 m + 3 ropes + ×6, ramp 4 m + 3 ropes + ×10.

h3 | Practise for Glimmer-9 | a 300 kg engine block on Glimmer-9 (g = 4.2 N/kg), straight up 10 m; parts: pulley block (1–4), winch (×2–×10); `cap: 60`, Smooshy pulls
   Brief: Smooshy's engineers want a test run in Glimmer-9's gravity. Lift a **300 kg** engine block 10 m. On Glimmer-9, **g = 4.2 N/kg**. Smooshy can pull **60 N at most**, there's **40 m of cable**, and he has oxygen for **250 m of hand travel**.
   Before the first try: a *calculate* box in the brief: "What does the 300 kg block weigh on Glimmer-9?" (answer 1,260 N, tolerance 1, ladder: Weight = mass × g · 300 × 4.2). Any answer unlocks the builder (one go; the correct answer shows after checking).
   Objectives: effort ≤ 60 N · cable ≤ 40 m · hand travel ≤ 250 m
   Clues: Weight = 300 × 4.2 = 1,260 N, so MA needed = 1,260 ÷ 60 = 21, and at most 250 ÷ 10 = 25. · Cable = supporting ropes × 10 m, so 4 ropes at most. · Which ropes and winch multiply to between 21 and 25?
   Feasibility: 3 ropes ×8 (MA 24) and 4 ropes ×6 (MA 24).

After the last mission: "The crane kit is built and packed. Next stop: Glimmer-9!"

---

## M. Part 4 Check (c6r18–c6r22)

c6r18 | sort | obj ['Ai'] | Simple machine or compound machine? Sort each one. | groups: Simple machine · Compound machine
   items: Crowbar → simple · Ramp → simple · Axe → simple · Single fixed pulley → simple · Scissors → compound · Bicycle → compound · Crane → compound · Can opener → compound

c6r19 | num | obj ['Aii'] | A winch with a mechanical advantage of 6 drives a pulley system with 3 supporting ropes. What effort lifts a 2,700 N load? | answer 150 | unit N | tolerance 0.5 | units picker | ladder
   Hints: Total MA = 6 × 3. · 18. · Effort = 2,700 ÷ 18.
   Working shown after: total MA = 18, effort = 2,700 ÷ 18 = 150 N.

c6r20 | reason | sure: true | obj ['Aii'] | Two machines, each with a mechanical advantage of 5, are joined so the first one drives the second. What is the total mechanical advantage?
   Options: 25 · 10 · 5 · 2.5
   correct 0
   reasons: The second machine multiplies a force the first machine has already made bigger · Each machine adds its own advantage on top of the other one · Only the stronger of the two machines sets the advantage · The force is shared between two machines, so the advantage halves
   correct reason 0

c6r21 | order | obj ['Ai'] | Put the steps of a crane lift in order, from Smooshy's hand to the load. | first: Smooshy turns the handle | last: The load rises
   items (correct order): The handle turns the winch's axle · The axle winds in the cable with a bigger force · The cable pulls on the pulley block · The supporting ropes share the load and lift it

c6r22 | explain | obj ['Aii'] | A crane uses a winch and a pulley system to lift a heavy steel beam. Explain how the two machines together let a small effort lift the beam, and why the operator has to turn the handle so many times.
   words: compound machine, mechanical advantage, multiply, distance
   model: The winch and the pulley system are two simple machines working together, so the crane is a compound machine. The winch makes the effort bigger, then the pulleys make it bigger again, so the total mechanical advantage is the two mechanical advantages multiplied together. That makes the effort much smaller than the beam's weight. The catch is distance: the operator's hand moves the total mechanical advantage times the height the beam rises, so the handle has to turn many times.
   checklist: Says the crane is a compound machine (two simple machines working together) · Says the total mechanical advantage is the two multiplied, so the effort is much smaller than the load · Says the hand must move much further than the beam rises (MA × load distance)

---

## N. Part 5: Rescue Captain Smooshy! (c6e)

### Step v1: Landing on Glimmer-9   (Part 5, about 4 min)
Arena: the rescue site (C6), overview of the crater, no stage active. Adds `mcomp` (the mission computer panel, used here for the calculate tasks). Formulas glowing: `weight`, `ma`, `effortq`.

CARDS
1. You've landed on **Planet Glimmer-9**! Purple sky, two moons, and there's the Gumdrop, tipped over at the bottom of a **15 m** deep crater, with a boulder pinning one landing leg. Captain Smooshy waves from the cockpit window, then squeezes out through the hatch (gummy bears are very squishy) to do the pulling. On Glimmer-9, **g = 4.2 N/kg**, so things weigh less than on Earth, but the ship is still far too heavy for a 60 N gummy bear.
2. The rescue has three stages. **Stage 1:** lever the boulder off the landing leg. **Stage 2:** jack up the ship's sunken side so it sits level. **Stage 3:** build a compound machine to haul the Gumdrop up the crater wall. You plan each stage, and Smooshy does the pulling. The mission computer wants your numbers before every try.

DO THIS
- (calculate task) q1
- (calculate task) q2

YOUR TURN QUESTIONS
q1 | num | The Gumdrop has a mass of 1,500 kg. On Glimmer-9, g = 4.2 N/kg. What does the Gumdrop weigh there? | answer 6300 | unit N | tolerance 1 | units picker | ladder
   Hints: Weight = mass × g. · Use the mass, 1,500 kg, and Glimmer-9's g, 4.2 N/kg. · Type 1500 × 4.2.
   Working shown after: weight = 1,500 × 4.2 = 6,300 N.
q2 | num | Smooshy can pull with 60 N. What mechanical advantage would he need to lift the 6,300 N Gumdrop straight up? | answer 105 | unit (no unit) | tolerance 0.5 | ladder
   Hints: Mechanical advantage = load ÷ effort. · The load is 6,300 N and the effort is 60 N. · 6,300 ÷ 60.
   Working shown after: MA = 6,300 ÷ 60 = 105. No single Workshop machine comes close, so stage 3 needs a compound machine.
q3 | pick | If the Gumdrop had crashed on Earth instead, its mass would be {0} and its weight would be {1}.
   {0}: smaller / the same / bigger → the same
   {1}: smaller / the same / bigger → bigger
   after: On Earth it would weigh 1,500 × 9.8 = 14,700 N, so the rescue would need an even bigger mechanical advantage. Lucky Smooshy!
Glossary words to underline: gravitational field strength, mechanical advantage, compound machine.
Masked readouts: none.
Rescue log: Landed on Glimmer-9. Rescue plan loaded!

---

## O. Part 5 Challenge: Operation Gummy Lift (sm1–sm3)

Engine: `renderRescueCourse` in `4d-rescue.js`, objective scoring (C7). Smooshy pulls (`cap: 60`). One stage at a time; the stage's settings are the only controls. **Before each try**, the mission computer asks for a prediction (a number box with a unit, under the controls); **Smooshy, try it!** is enabled once any number is typed. Objectives tick live; after each try, the result lines follow the November pattern (result, target, ✓/✗). Each stage has a "Need a clue?" ladder. After 3 tries, **Move on** appears.

Intro: Operation Gummy Lift is go! Three stages stand between Smooshy and home. Plan each one with the numbers, then let Smooshy try it. Every objective you meet scores a point, and you can try each stage as often as you like.

sm1 | Free the landing leg | lever, class 1, crowbar 2 m long, boulder 60 kg (252 N on Glimmer-9); student sets the load arm 0.20–1.00 m in 0.05 steps; Smooshy can push his end down **1.5 m** at most (`maxTravel` 1.5); the boulder must rise **0.25 m** to free the leg
   Brief: A **60 kg** boulder is pinning the landing leg (g = 4.2 N/kg). Smooshy has a 2 m crowbar and a rock to use as a fulcrum. He can push down with **60 N at most**, and he can push his end down **1.5 m** before it hits the ground. The boulder must rise **0.25 m** to free the leg.
   Prediction box: "What effort will Smooshy need with your fulcrum position?" (N)
   Objectives (4): Planned: you typed a prediction · Prediction within 1 N of the effort Smooshy needed · Smooshy's push is 60 N or less · The boulder rises at least 0.25 m
   Clues: The boulder weighs 60 × 4.2 = 252 N, so the lever's MA must be at least 252 ÷ 60 = 4.2. · But a big MA means the boulder rises only a little: rise = 1.5 m ÷ MA. For a 0.25 m rise, the MA can be 6 at most. · Find a load arm that gives an MA between 4.2 and 6. (MA = effort arm ÷ load arm, and effort arm = 2 − load arm.)
   Feasibility (model): load arm 0.30 m (MA 5.67, 44.5 N, rise 0.265 m) and 0.35 m (MA 4.71, 53.5 N, rise 0.318 m). 0.25 m lifts with 36.0 N but only 0.214 m; 0.40 m needs 63.0 N.

sm2 | Level the ship | screw jack under the sunken side, which presses down with **3,780 N**; lift **40 cm**; student chooses the distance the handle moves in one turn (0.6, 1.2 or 1.8 m) and the pitch (0.2, 0.5 or 1.0 cm); turn counter on
   Brief: The Gumdrop's sunken side presses down with **3,780 N**. Smooshy must jack it up **40 cm**. He can push the handle with **60 N at most**, and after **50 turns** his gummy arms go floppy.
   Prediction box: "What effort will Smooshy need on the jack handle?" (N)
   Objectives (4): Planned: you typed a prediction · Prediction within 1 N · Smooshy's push is 60 N or less · 50 turns or fewer
   Clues: Turns = 40 cm ÷ pitch. Which pitches need 50 turns or fewer? · Screw MA = distance per turn ÷ pitch (use the same units: 1.2 m = 120 cm). · With a 1.0 cm pitch, which handle gets the effort to 60 N or less? 3,780 ÷ MA.
   Feasibility: pitch 1.0 cm with 1.2 m per turn (MA 120, 31.5 N, 40 turns) or 1.8 m per turn (MA 180, 21.0 N, 40 turns). 0.6 m per turn needs 63.0 N; the finer pitches need 80 or 200 turns.

sm3 | Haul out of the crater | the builder (C4); the 6,300 N Gumdrop rises **15 m**; routes: straight up the wall (15 m), steep track (30 m), medium track (45 m), gentle track (75 m); pulley block 1–4 ropes; winch ×2–×10 (the winch is anchored on the rim)
   Brief: Time for the big one! Haul the **6,300 N** Gumdrop **15 m** up and out of the crater. Smooshy can pull **60 N at most**. The winch drum holds **240 m of cable**, and Smooshy has oxygen for **2,400 m of hand travel** (about 40 minutes of turning). Choose a route, a pulley block and a winch.
   Prediction box: "What is the total mechanical advantage of your machine?" (no unit)
   Objectives (5): Used a compound machine (two or more parts) · Total MA typed correctly (within 0.5) · Smooshy's pull is 60 N or less · Cable 240 m or less · Hand travel 2,400 m or less
   Clues: MA needed = 6,300 ÷ 60 = 105. Hand travel = MA × 15 m, so the MA can be 160 at most. · Cable = supporting ropes × route length. The gentle track (75 m) can only take 3 ropes. · Each route is a ramp: its MA = length ÷ 15 m. The gentle track gives 5, the medium track 3. What must the pulley block and the winch multiply to?
   Feasibility (model): medium track + 4 ropes + ×10 (MA 120, 52.5 N, cable 180 m, travel 1,800 m); gentle track + 3 ropes + ×8 (MA 120, 52.5 N, 225 m, 1,800 m); gentle track + 3 ropes + ×10 (MA 150, 42.0 N, 225 m, 2,250 m). Near misses worth a specific message: gentle track + 4 ropes (cable 300 m: "Not enough cable! You'd need 300 m."); any MA over 160 ("Smooshy's oxygen would run out after 2,400 m of turning.").

When all three stages are attempted: the ending (C6, C7), the stamp, and a pop-up nudging the student to the Check: "Mission complete! Do the debrief questions in the Check to get your completed worksheet, with your rescue report on it."

### O1. Rescue report on the Part 5 worksheet
The c6e worksheet prints, before the Check questions, a **Rescue report** with one row per stage: the student's settings, their prediction, what Smooshy needed, the result, and each objective with ✓ or ✗ (best try). Blank template: the same table, empty. Answer key: the passing settings from the feasibility notes. The marking scheme says the Rescue report isn't marked (Challenges are not marked), but the AI feedback may mention it in the strengths or next step.

---

## P. Part 5 Check: Mission debrief (c6r23–c6r26)

c6r23 | explain | obj ['Aii', 'Di', 'Diii'] | Real rescue teams use compound machines too. A tow truck pulls a car out of a ditch with a winch and a pulley block. Describe how the tow truck's machine helps the rescuers.
   words: winch, pulley, mechanical advantage, effort
   model: The winch is a wheel and axle that winds in the cable, and the pulley block adds supporting ropes. Together they make a compound machine, so their mechanical advantages multiply. That means a small effort from the winch's motor or handle can pull the heavy car out. The cable has to be wound in much further than the car moves.
   checklist: Names the winch (wheel and axle) and the pulley block as the two simple machines · Says the mechanical advantages multiply, so a small effort moves the heavy car · Says the cable moves much further than the car (the trade-off)

c6r24 | num | obj ['Aii'] | The 6,300 N Gumdrop rose 15 m out of the crater. How much work did Smooshy do, whatever machine he used? | answer 94500 | unit J | tolerance 10 | units picker | ladder
   Hints: In a perfect machine, work in = work out. · Work out = load × height = 6,300 × 15. · Type 6300 × 15.
   Working shown after: work = 6,300 × 15 = 94,500 J, for every machine that worked.

c6r25 | reason | sure: true | obj ['Aiii'] | Ana says: "If Smooshy had built an even bigger mechanical advantage, he would have done less work." Is she right?
   Options: No, the work stays the same, but the effort gets smaller · Yes, a bigger advantage always means less work · No, a bigger advantage means he does more work · Yes, because the ship weighs less with a bigger machine
   correct 0
   reasons: He pulls with less force over a longer distance, so force × distance stays at 94,500 J · A smaller force always means a smaller amount of work done · He turns the handle further, so force × distance must be bigger · The machine carries part of the ship's weight for him
   correct reason 0

c6r26 | explain | obj ['Dii', 'Diii'] | The rescue team had two plans. Plan A: dig the gentle 75 m track and use a small crane. Plan B: bring a giant crane to lift the Gumdrop straight up the 15 m wall. Discuss one advantage and one disadvantage of each plan. Think about safety, time, cost or the effect on Glimmer-9's crater, then say which plan you would choose and why.
   words: mechanical advantage, distance, safety, cost
   model: Plan A uses the track as a ramp, which gives mechanical advantage, so a smaller, cheaper crane and a smaller effort are enough. But it needs much more cable and a longer haul, and digging a 75 m track takes time and damages more of the crater. Plan B moves the ship a much shorter distance, so it's quicker and hardly disturbs the ground. But the crane needs a much bigger mechanical advantage of its own, so it costs more to build and fly there, and a heavy ship hanging high on one cable is more dangerous if something breaks. I would choose Plan A, because it is safer and cheaper, even though it takes longer.
   checklist: Gives an advantage of Plan A (the track's mechanical advantage means a smaller or cheaper crane, or a smaller effort) · Gives a disadvantage of Plan A (more cable or distance, more time, or more damage to the crater) · Gives an advantage of Plan B (shorter distance, quicker, or less damage to the ground) · Gives a disadvantage of Plan B (needs a bigger mechanical advantage or a more expensive crane, or more dangerous if it fails) · Makes a choice and gives a reason for it

## P2. Extension: Real machines waste energy (c6f)

Optional, unticked by default on the teacher page. Opens once Part 5 is done (teacher mode unlocks it). Scene: the Workshop, re-dressed as **Base camp** on Glimmer-9 (the violet sky and two moons through the hangar door, sugar crystals by the door, gummy colonists in hard hats walking past). g = 4.2 N/kg, but loads are given in newtons, so students never need the mass.

### Step p5a: Real machines get warm   (Extension, about 6 min)
Arena: Base camp, pulley rig, a **600 N** water tank, lift 2 m, 4 supporting ropes. Adds `mfric` (starts on Perfect), `readWork` (with Wasted (heat)), `readEff`, `rulers`. Formulas glowing: `work`, `eff`, `wasted`.

CARDS
1. 📡 *Smooshy:* "Big news! The glittering crystals on Glimmer-9 are pure sugar. It's gummy paradise!" Thousands of gummy colonists are on their way to **terraform** Glimmer-9 and make it their new home, and they've asked Force HQ to help build **Gummy Base One**. There's just one problem: real machines aren't perfect.
2. In a real machine, wheels rub on axles and ropes rub on wheels, and Glimmer-9's sugar dust gets into everything. That **friction** turns some of the work you put in into heat, so the work in is bigger than the useful work out. The difference is **wasted energy**.
3. Engineers measure this with **efficiency**: how much of the work in comes out as useful work.
   Worked example: Work in = 1,500 J and useful work out = 1,200 J. Efficiency = 1,200 ÷ 1,500 × 100% = **80%**. Wasted energy = 1,500 − 1,200 = 300 J, which becomes heat.
   Key idea: efficiency = useful work out ÷ work in × 100%.

PREDICT FIRST
Question: You switch the pulley system from Perfect to Real and lift the tank 2 m again. How much rope will you pull?
Options: The same 8 m, because each rope still shortens by 2 m · More than 8 m, because friction drags on the rope · Less than 8 m, because friction helps hold the tank up · It depends on how hard you pull on the rope
After: Lift the tank with the Perfect machine, then with the Real one, and compare the newtonmeter and the ruler.

DO THIS
- Make your prediction in the box above.
- Lift the tank 2 m with the **Perfect** machine.   (ticks on that run)
- Switch to **Real** and lift it again. Watch the wheels.   (ticks on a real run with 4 ropes)
- (inline answer box) q1
- (calculate task) q2
- (calculate task) q3

YOUR TURN QUESTIONS
q1 | reading | With the Real machine, what effort lifted the 600 N tank? | live: shopE({mach:'pulley', ropes:4, real:true, load:600}) | unit N | tolerance 0.5
   ok: 187.5 N, more than the 150 N the Perfect machine needed. Friction made the job harder.
q2 | num | With the Real machine, your effort of 187.5 N pulled 8 m of rope. How much work did you put in? | answer 1500 | unit J | tolerance 1 | units picker | ladder
   Hints: Work = force × distance. · Use your effort, 187.5 N, and the rope you pulled, 8 m. · Type 187.5 × 8.
q3 | num | The 600 N tank rose 2 m, so the useful work out was 1,200 J. What is the efficiency of the Real pulley system? | answer 80 | unit % | tolerance 0.5 | ladder
   Hints: Efficiency = useful work out ÷ work in × 100%. · 1,200 ÷ 1,500 = 0.8. · Multiply by 100 to get a percentage.
   Working shown after: 1,200 ÷ 1,500 × 100% = 80%. The other 300 J became heat in the wheels.
q4 | pick | Friction made the effort {0}, the length of rope pulled {1}, and the wasted energy turned into {2}.
   {0}: smaller / the same / bigger → bigger
   {1}: shorter / the same / longer → the same
   {2}: heat / extra weight / more rope → heat
Glossary words to underline: terraform, friction, wasted energy, efficiency.
Masked readouts: `readWork` and `readEff` until q2 and q3 are answered.
Rescue log: The colonists' first machine is tested. Time to find the most efficient ones.

### Step p5b: Which machines waste the least?   (Extension, about 5 min)
Arena: Base camp. `mfric` locked on Real. Adds `mpick` (pulley, winch, screw jack). Loads: the 600 N tank (pulley, winch, lift 2 m); a 3,000 N supply pod on the screw jack (120 cm per turn, pitch 1.0 cm, lift 20 cm).

CARDS
1. Every rubbing surface wastes a little energy. A pulley system with more supporting ropes has more wheels, so it has a bigger mechanical advantage but a lower efficiency. Engineers choose a machine that is strong enough and wastes as little as possible.
2. Some machines are very inefficient on purpose. A screw jack wastes most of the work you put in, but all that friction is useful: it stops the load sinking back down when you let go of the handle. Oil and grease (**lubricants**) cut friction where it isn't wanted.

DO THIS
- Lift the tank with **2** supporting ropes (Real).   (ticks on that run)
- (calculate task) q1
- Lift the tank with the winch (handle 0.25 m), then lift the supply pod with the screw jack. Compare the efficiency readouts.   (ticks when both real runs exist)

YOUR TURN QUESTIONS
q1 | num | With 2 supporting ropes, your effort was 333.3 N and you pulled 4 m of rope to lift the 600 N tank 2 m. What is the efficiency? | answer 90 | unit % | tolerance 0.5 | ladder
   Hints: Work in = 333.3 × 4. Useful work out = 600 × 2. · That's about 1,333 J in and 1,200 J out. · 1,200 ÷ 1,333 × 100%.
   Working shown after: 1,200 ÷ 1,333 × 100% = 90%. Fewer wheels, less friction.
q2 | pick | Compared with 2 supporting ropes, 4 supporting ropes gave a {0} mechanical advantage and a {1} efficiency.
   {0}: smaller / the same / bigger → bigger
   {1}: lower / the same / higher → lower
q3 | reason (cartoon) | The screw jack was only 30% efficient. Four colonists argue about it. Who's right?
   voices: Mia: "It's useless. We should throw it away." · Leo: "It's the most efficient machine, because the effort was so small." · Ana: "Its friction is useful: the pod stays up when you let go of the handle." · Sam: "It wastes energy because the supply pod is too heavy for it."
   correct: Ana
   reasons: Friction in the thread stops the screw turning backwards under the load · A small effort always means a high efficiency · Heavy loads always make a machine less efficient · A machine that wastes energy can never be worth using
   correct reason 0
   why: (Mia) It still lifts the pod with a tiny effort, and it holds it safely. (Leo) A small effort comes from the big mechanical advantage; efficiency is about wasted work. (Sam) In our model the efficiency is the same for any load.
Glossary words to underline: lubricant, efficiency, friction.
Masked readouts: `readEff` for the 2-rope run until q1 is answered.
Rescue log: The colonists know which machines waste the least. Let's build the base!

## P3. Extension Challenge: Build Gummy Base One (gb1–gb3)

Engine: `renderShopCourse` with the builder (C4) and `mfric` locked on **Real** (C1 efficiencies). C7 scoring (4/3/2/1 by try, Move on after 3 misses). The builder shows Total MA, Efficiency, Cable, Work in and the **energy budget** bar (green while work in ≤ budget, red above it). A colonist pulls, with the gummy limit of 60 N. Each mission passed or attempted adds a building to the Rescue board's fifth slot.

Intro: The colonists' machines all run on solar batteries, and each job has a fixed amount of energy. A machine that wastes too much will flatten the battery halfway through the job. Plan each build so the pull is 60 N or less and the work in fits the energy budget.

gb1 | First dome panel | 600 N panel, straight up 5 m; parts: pulley block (1–4), winch (×2–×10)
   Brief: Raise the first sugar-crystal dome panel 5 m into place. Pull: **60 N or less**. The battery holds **3,800 J** for this job.
   Objectives: effort ≤ 60 N · work in ≤ 3,800 J
   Clues: The useful work out is 600 × 5 = 3,000 J, so the efficiency must be at least 3,000 ÷ 3,800 = 79%. · Winch 90% × pulley block: 1 rope 95%, 2 ropes 90%, 3 ropes 85%. Which combinations stay at 79% or above? · With winch and 2 ropes (81%), the MA must be big enough: 600 ÷ (MA × 0.81) ≤ 60.
   Feasibility (model): 2 ropes ×8 (MA 16, 81.0%, 46.3 N, 3,704 J) and 2 ropes ×10. 3 ropes waste too much (76.5%); a winch alone or 1 rope can't get the pull under 60 N.

gb2 | Water for the sugar gardens | 2,000 N water tank up a 3 m terrace; routes: straight up 3 m, track 6 m, 9 m, 15 m (MA 2, 3, 5; 75% efficient); pulley block (1–4); winch (×2–×10)
   Brief: Haul the water tank up to the sugar gardens on the 3 m terrace. Pull: **60 N or less**. Budget: **10,000 J**.
   Objectives: effort ≤ 60 N · work in ≤ 10,000 J
   Clues: Useful work out = 2,000 × 3 = 6,000 J, so the efficiency must be at least 60%. · Every extra part lowers the efficiency. Multiply them: track 75% × winch 90% × 2 ropes 90% = 60.8%. · You need a big mechanical advantage from very few parts. The long tracks give the most for one part.
   Feasibility: 15 m track + winch ×10 (MA 50, 67.5%, 59.3 N, 8,889 J); 15 m track + 2 ropes + ×6, ×8 or ×10; 9 m track + 2 ropes + ×10.

gb3 | Night shift | 300 N supply crate, straight up 6 m; parts: pulley block (1–4), winch (×2–×10)
   Brief: The sun has set and the battery is almost flat: only **2,000 J** left. Lift the supply crate 6 m. Pull: **60 N or less**.
   Objectives: effort ≤ 60 N · work in ≤ 2,000 J
   Clues: Useful work out = 300 × 6 = 1,800 J, so the efficiency must be at least 90%. · Which single part is 90% efficient or better and can give enough mechanical advantage? · Sometimes the simplest machine wins. Try the winch on its own.
   Feasibility: winch alone ×6 (MA 6, 90%, 55.6 N, exactly 2,000 J), ×8 or ×10. Any pulley block added drops the efficiency below 90%. (Test the ×6 edge case: 2,000 J must pass.)

After the last mission: the Rescue board's fifth slot shows the finished base, and Smooshy: "Gummy Base One is open! Thank you, Force HQ engineers. Come and visit any time. We'll save you a sugar crystal."

## P4. Extension Check (c6r27–c6r31)

c6r27 | num | obj ['Aii'] | A colonists' pulley system takes 2,500 J of work in to do 2,000 J of useful work. What is its efficiency? | answer 80 | unit % | tolerance 0.5 | ladder
   Hints: Efficiency = useful work out ÷ work in × 100%. · 2,000 ÷ 2,500. · Multiply by 100.

c6r28 | reason | sure: true | obj ['Aii'] | Friction in a pulley system makes the effort bigger. What happens to the length of rope you pull to lift the load 1 m?
   Options: It stays the same · It gets longer · It gets shorter · It drops to zero
   correct 0
   reasons: The rope pulled depends only on the supporting ropes and the height lifted · Friction drags on the rope, so you have to pull more of it · Friction holds part of the load, so less rope is needed · A real machine can't lift anything once friction acts
   correct reason 0

c6r29 | calcorder | obj ['Aii', 'Aiii'] | Each machine below does 1,200 J of useful work lifting a crate. Work out the efficiency of each one, then put them in order, most efficient first.
   mass: 1200, f: (workIn, out) => out / workIn * 100, col0: 'Machine', given: 'Work in (J)', calc: 'Efficiency (%)', unit: '%', tol: 0.5
   items (in the CORRECT order): ['Lever', 1250] · ['Pulley system', 1500] · ['Dusty ramp', 1600] · ['Wedge', 3000] · ['Screw jack', 4000]
   first: Most efficient · last: Least efficient
   after: The efficiencies are 96%, 80%, 75%, 40% and 30%.
   (Check `calcorder` sorts lowest-first by default; this question needs **highest first**. Add an option `desc: true` if it doesn't support that.)

c6r30 | fix | obj ['Aiii'] | Leo works out a machine's efficiency. Spot his mistake. Tap it, then correct it.
   lines: 1. Work in = 1,500 J · 2. Useful work out = 1,200 J · 3. Efficiency = work in ÷ work out × 100% · 4. Efficiency = 1,500 ÷ 1,200 × 100% = 125%
   mistake: line 3
   fix (num): ask "What is the correct efficiency?" | answer 80 | unit % | tolerance 0.5
   why: Efficiency = useful work out ÷ work in × 100% = 1,200 ÷ 1,500 × 100% = 80%. An efficiency over 100% is a warning sign: no machine gives out more work than you put in.

c6r31 | explain | obj ['Aii', 'Di', 'Diii'] | The gummy colonists want their machines to waste as little energy as possible. Explain why friction wastes energy in a machine, and suggest two ways the colonists could make their machines more efficient.
   words: friction, energy, heat, efficiency, lubricant
   model: When parts of a machine rub together, friction turns some of the work put in into heat, so the useful work out is less than the work in. The colonists could oil or grease the moving parts with a lubricant, keep the sugar dust out with covers, use smoother wheels and bearings, or choose machines with fewer moving parts, such as fewer pulley wheels, as long as the mechanical advantage is still big enough.
   checklist: Says friction between moving parts turns some of the work in into heat (wasted energy) · Gives one sensible way to cut friction (lubricant, cleaning or covering, smoother wheels or bearings) · Gives a second, different way (or fewer moving parts or pulley wheels)

---

## W. Workshop build tasks (open builder, for classwork and homework)

Follow the sim-builder skill, section 4e. **Port Sparks Through Time's build-task code** (`buildSheet` and the build-task rows on its teacher page, in `sparks-through-time/Sparks-Through-Time.html`; grep for `buildSheet`) and adapt it to Force HQ's names, as the November update did for the worksheet code. Build tasks use the machine builder (C4) with **perfect machines** (no friction), on Earth unless the task says otherwise. Each task has: `id`, `title`, `minutes`, `goal`, `brief`, 2–4 **live checks** (chips that turn green only when a real run passes), a **results table** filled from the student's runs, 1–3 questions about their own build (each with a model answer), a **rubric** `[[criterion, marks], …]`, a **model build** and **example results** for the answer key.

- **Where:** a **Build tasks** tab on the Workshop card in Explore (each task opens the builder with its parts, load and limits set), and on the teacher page step 1 under "Build tasks" (tick boxes, kept clean as the skill says). They appear in the teacher prompt, step 5's AI feedback text and the marking schemes like any section. Toddle files: one folder per task.
- **Unlock:** once Part 4 is done (they need the builder); teacher mode unlocks them all.
- **Build sheet:** "Make my build sheet" (named `<Task title> - Build sheet - <Student name>`): a snapshot of the student's build (`buildSVG`), the ticked checklist, the results table, their answers in blue, and a feedback page. Blank template and answer key as the skill describes. No name, no build sheet.
- **MYP tags** on each task's questions (listed below). Check every task with `tools/workshop_model.py` (the passing builds below come from it).

bt1 | Lift 200 kg with less than 300 N | about 15 min | load 200 kg (1,960 N), lift 4 m; parts: pulley block (1–4), winch (×2–×10)
   Goal: Design a machine that lifts a heavy load with a small effort, within limits on cable and hand travel.
   Brief: Lift a 200 kg crate 4 m. The pull must be **less than 300 N**, there's only **16 m of cable**, and the job must take **40 m of hand travel or less**.
   Live checks: Effort less than 300 N · Cable 16 m or less · Hand travel 40 m or less
   Results table (one row per run the student marks "Add to my table"; at least 2 rows): parts · total MA · effort (N) · cable (m) · hand travel (m) · all checks met?
   Questions: (1) [Aii] "What is the total mechanical advantage of your best machine? Show how you worked it out." Model: "Winch ×4 and 2 supporting ropes: MA = 4 × 2 = 8, so the effort is 1,960 ÷ 8 = 245 N." (2) [Aii] "How much work was done on the crate?" Model: "Work = 1,960 × 4 = 7,840 J." (3) [Aiii] "Why can't you just use the biggest mechanical advantage possible here?" Model: "Hand travel = MA × 4 m, so an MA over 10 would need more than 40 m of hand travel. The cable limit also means at most 4 supporting ropes."
   Rubric: [['Build meets all three checks', 3], ['Results table has at least two different builds', 2], ['Q1: MA and effort worked out correctly, with working', 2], ['Q2: work = 7,840 J', 1], ['Q3: explains the hand-travel (or cable) limit on MA', 2]]
   Model build: winch ×4 + 2 ropes (MA 8, 245 N, 8 m cable, 32 m travel). Others that pass: winch ×8 or ×10 alone; 1 rope + ×8 or ×10; 4 ropes + ×2.

bt2 | The cheapest crane | about 15 min | load 500 kg (4,900 N), up 3 m; routes: straight up 3 m, track 6 m, 9 m, 15 m; pulley block (1–4); winch (×2–×10); each part has a price in Force HQ credits: track 6 m 10, 9 m 20, 15 m 40; pulley block 15 per supporting rope; winch 5 × its ratio (×2 = 10 … ×10 = 50)
   Goal: Find a machine that does the job for the lowest cost, balancing mechanical advantage against price.
   Brief: Lift a 500 kg generator 3 m onto the loading deck. The pull must be **100 N or less**, there's **60 m of cable**, and the budget is **120 credits**. Can you find the cheapest machine that works?
   Live checks: Effort 100 N or less · Cable 60 m or less · Cost 120 credits or less · (bonus chip, not needed to pass) Cost 90 credits: the cheapest possible
   Results table: parts · total MA · effort (N) · cable (m) · cost (credits) · all checks met?
   Questions: (1) [Aii] "Work out the effort your cheapest machine needs." Model: "15 m track (MA 5) + winch ×10: total MA 50, effort = 4,900 ÷ 50 = 98 N." (2) [Aiii] "Explain how you brought the cost down." Model: "The long track gives a mechanical advantage of 5 for 40 credits, and the winch ×10 adds 10 more for 50 credits. Pulley blocks cost 15 per rope, so they were the expensive way to get MA here."
   Rubric: [['Build meets all three checks', 3], ['Results table compares at least three builds with their costs', 2], ['Q1: effort worked out correctly from the total MA', 2], ['Q2: explains the cost choice using MA per credit', 2], ['Cost 90 credits (the cheapest)', 1]]
   Model build: 15 m track + winch ×10 (90 credits, MA 50, 98 N, 15 m cable). 17 builds pass within 120 credits (the next cheapest: 9 m track + 3 ropes + ×6, 95 credits).

bt3 | Same MA, three ways | about 12 min | load 120 kg (1,176 N), up 2 m; routes: straight up 2 m, ramp 4 m, ramp 6 m, ramp 10 m; pulley block (1–4); winch (×2–×10)
   Goal: Show that different machines with the same mechanical advantage need the same effort and the same hand travel.
   Brief: Build **three different machines** that each have a total mechanical advantage of exactly **24**, and lift the engine block with each one. At least one of them must use **three parts**.
   Live checks: Three different builds with MA 24, each lifted · At least one build uses three parts
   (A pulley block with 1 rope has an MA of 1, so it doesn't count as a part here: "ramp 6 m + 1 rope + ×8" is the same build as "ramp 6 m + ×8", and it isn't a three-part build. Say so on the chip if a student tries it: "A 1-rope block doesn't add any mechanical advantage. Try 2 or more ropes.")
   Results table (filled automatically from the three builds): parts · total MA · effort (N) · cable (m) · hand travel (m)
   Questions: (1) [Aiii] "Look at your results table. What do you notice about the effort and the hand travel for your three machines? Explain why." Model: "They were the same every time: 49 N and 48 m. The effort is load ÷ MA and the hand travel is MA × 2 m, and the MA was 24 each time. Only the cable changed." (2) [Aii] "Explain why the cable needed was different for each machine." Model: "Cable = supporting ropes × route length, so builds with more ropes or a longer ramp need more cable, even with the same MA."
   Rubric: [['Three different builds with MA 24', 3], ['One build uses three parts', 1], ['Results table complete', 1], ['Q1: notices effort and hand travel are the same and explains with MA', 3], ['Q2: explains the cable difference', 2]]
   Model builds: 4 ropes + ×6 (cable 8 m); 3 ropes + ×8 (6 m); ramp 6 m + 2 ropes + ×4 (12 m). Others: ramp 6 m + 4 ropes + ×2; ramp 4 m + 3 ropes + ×4; ramp 4 m + 2 ropes + ×6.

bt4 | Lift it on three worlds | about 15 min | load 400 kg rover, up 2 m; worlds: Earth (g = 9.8 N/kg), Mars (3.7 N/kg), the Moon (1.6 N/kg); routes: straight up 2 m, ramp 4 m, 6 m, 10 m; pulley block (1–4); winch (×2–×10)
   Goal: Use weight = mass × g to design a machine for different worlds, and explain why the same load needs a different mechanical advantage on each.
   Brief: The Gummy Rover has to be loaded 2 m up onto a lander on three different worlds. On each one, the pull must be **60 N or less** and the cable **40 m or less**. Build a machine for each world, using the **smallest mechanical advantage you can**.
   Live checks: Works on Earth · Works on Mars · Works on the Moon · (bonus chip) Smallest working MA found on at least one world
   Results table (one row per world): world · g (N/kg) · rover's weight (N, typed by the student and checked) · MA needed (typed) · your build · total MA · effort (N)
   Questions: (1) [Aii] "Which world needed the biggest mechanical advantage? Explain why, using weight = mass × g." Model: "Earth. The rover's mass is 400 kg everywhere, but Earth's g is the biggest, so its weight is 400 × 9.8 = 3,920 N, and it needs an MA of at least 3,920 ÷ 60 = 65.3." (2) [Aii] "Work out the smallest MA that would do the job on the Moon." Model: "Weight = 400 × 1.6 = 640 N, so MA ≥ 640 ÷ 60 = 10.7."
   Rubric: [['Working build on all three worlds', 3], ['Weights and MAs needed typed correctly in the table', 3], ['Q1: Earth, explained with weight = mass × g', 2], ['Q2: MA ≥ 10.7, worked out', 2]]
   Model builds: Earth: ramp 6 m + 3 ropes + ×8 (MA 72, 54.4 N); Mars: 3 ropes + ×10 (MA 30, 49.3 N); Moon: 2 ropes + ×6 (MA 12, 53.3 N). Smallest working MA on the grid: Earth 72, Mars 30, Moon 12 (the bonus chip is earned at these values).
   Add `bt4` to `tests/workshop_numbers.py` with the full grid, so the "smallest" bonus matches the model.

---

## Q. Sheet strands (for checking `tests/strands.py`)

| Section | Tags by question | Sheet strands |
|---|---|---|
| c6a | c6r1 Ai · c6r2 Aii · c6r3 Aii · c6r4 Aiii · c6r5 Aii | A i, ii, iii |
| c6b | c6r7 Ai · c6r8 Aii · c6r9 Aiii · c6r10 Aii · c6r11 Aii | A i, ii, iii |
| c6c | c6r12 Aii · c6r13 Aiii · c6r14 Aii · c6r15 Aii · c6r16 Aii · c6r17 Aii | A ii, iii |
| c6d | c6r18 Ai · c6r19 Aii · c6r20 Aii · c6r21 Ai · c6r22 Aii | A i, ii |
| c6e | c6r23 Aii, Di, Diii · c6r24 Aii · c6r25 Aiii · c6r26 Dii, Diii | A ii, iii · D i, ii, iii |
| c6f | c6r27 Aii · c6r28 Aii · c6r29 Aii, Aiii · c6r30 Aiii · c6r31 Aii, Di, Diii | A ii, iii · D i, iii |
| build tasks | bt1 Aii, Aii, Aiii · bt2 Aii, Aiii · bt3 Aiii, Aii · bt4 Aii, Aii | A ii, iii |

---

## R. Build order for the coding model

Commit and deliver after each working step, as the Handoff says. **Done so far (1 Nov 2026):** the Workshop scene, Chapter 6 wiring, the black box transmission, the five-slot Rescue board, **Part 1 (Levers)** and **Part 2 (Pulleys, wheels and ramps)** with their Checks, worksheets and `tests/play_c6.py`. **Also done (2 Nov 2026):** the one-button Finish for every Check, label boxes on pictures and in the scene, shared Workshop ruler scale, pl1 wording. **Next: step 1 below (Part 3). Stop after each Part and ask Tom to play it.**

1. **Re-pitch Part 3 against section A2** (one new word per card, a labelled picture for every new idea, one familiar pictured example, plain words, no prediction given away), update section H to J of this script, then build Part 3: steps u1–u3, `renderShopCourse` with y1–y3, and the Part 3 Check. **Stop: ask Tom to play Part 3.**
2. Re-pitch Part 4, then the machine builder (C4) and the crane; Part 4 steps k1–k3, h1–h3 and the Part 4 Check. (k1's gallery must use pictured, familiar machines: scissors and a building-site crane, not a can opener or a wheelbarrow without a picture.)
3. Re-pitch Part 5, then the rescue site (C6), step v1, the rescue course sm1–sm3 with objective scoring and the ending, the Part 5 Check and the Rescue report on the worksheet. Smooshy climbs out of the Gumdrop's hatch at the start of v1.
4. Extension: the Perfect / Real switch and efficiencies (C1), Base camp, steps p5a–p5b, gb1–gb3 with the energy budget bar, the Extension Check, and the sixth (Extension) Rescue board slot.
5. Build tasks bt1–bt4 (section W): port Sparks' `buildSheet` and teacher-page build-task rows, the Build tasks tab in Explore, live checks, results tables, build sheets in all three modes, and the Toddle files.
6. Glossary, formulas, fun facts, Explore (Workshop and Try the rescue again), the teacher page, worksheets and Toddle files, MYP strands check, `tests/play_c6.py` (every Part, right and wrong answers, every mission, stage and build task passing and failing), the full test run, and the Brief, Backlog and Handoff updates.

Before shipping: play every Part and build task as a Grade 7 student with no teacher (the skill's independent-use check), check every number against `tools/workshop_model.py`, run the question-plan check (section E), check that no student screen uses W for work, check the worksheets as images, and check every Part shows approx. 30 min or less.

---

## S. Decided with Tom (1 Nov 2026)

1. Names: **the Gumdrop** and **Glimmer-9** (g = 4.2 N/kg) are confirmed.
2. Smooshy is **blue** (B6).
3. Efficiency is an optional **Extension** after Part 5, with the terraforming story (P2–P4). Smooshy stays on Glimmer-9 as captain of the new gummy colony rather than flying home.
4. Teacher **build tasks** go in now (section W).

5. **After the first playtest (1 Nov):** the simple machines are split into Part 1 (Levers) and Part 2 (Pulleys, wheels and ramps), taught slowly with labelled pictures and familiar examples (section A2); the transmission is a black box recording with Smooshy trapped inside; every effort is drawn as a pull.

Tom plays each Part before the next one is built.