# Force HQ rebuild: brief for a new chat

**For:** a new Claude chat in Tom's "Science Apps and Sims" project. Read this whole brief, then load the `wab-science-sim-builder` skill and follow it for everything this brief doesn't override.

**Owner:** Tom Howard, Head of Middle School Sciences, Western Academy of Beijing (WAB). Force HQ is for his mixed Grade 7/8 class, Cycle B Forces unit (IB MYP; ACARA v9 used for planning only).

**What you are doing:** rebuilding Force HQ, an interactive forces sim students use alone for homework and in class, through Toddle. The current version (in the project as `claude/Force-HQ.html`, about 4,400 lines, artifact https://claude.ai/artifact/9deQcgz2313jNXXe1mu9wB) has good parts, but it overloads students from the first screen. Tom and a colleague sat down with it and struggled to work out what everything meant. This rebuild fixes that.

---

## 0. Read these first

| Source | Why |
|---|---|
| `wab-science-sim-builder` skill | The house rules for every sim: shell, Review questions, worksheets, teacher page, Toddle AI marking, open builders, testing, delivery. This brief adds to it. |
| `claude/Force-HQ.html` (project) | The current build. Reuse its arena engine, drawings, drag-and-drop pullers, free-body diagram, Journal and Workshop code (section 9 lists what to keep). Open it in Playwright and play through the Force Arenas and the Workshop before writing code. |
| `sparks-through-time/Sparks-Through-Time.html` (repo) | The reference for the section → Review → worksheet flow, the teacher page and the Toddle files. Force HQ should feel like a sibling of it. |
| Project memory `preferences.md` | Tom's standing preferences for sims. All of them apply. |

---

## 1. The problem and the rule that fixes it

**Problem:** too much information at once. The arena opened with readouts, a free-body diagram, a graph, a friction meter, fun facts and controls all on screen, and none of them were explained before students met them.

**Rule: Guided mode introduces every piece of data, one at a time, and makes students use it.**

- **Explore shows everything from the start.** No locks. Students who want to jump in can.
- **Guided adds one thing to the screen per step.** Anything not yet introduced stays hidden during Guided. Introduce panels roughly in this order: newtonmeter reading → individual readouts (one or two at a time) → free-body diagram → friction meter → velocity–time graph → formula triangle → air slider.
- **Every new panel gets three parts of scaffolding before it is relied on:**
  1. a short "How do I read this?" card with an arrow pointing at the panel;
  2. a worked example ("This readout says 130 N. That means…");
  3. a question where the student uses the panel: type the reading, tap the matching arrow, or say what the graph shows.
- **ⓘ "How do I read this?" button on every panel, in Explore too,** reopening that panel's card. The cards are also saved to the Journal.
- **Skipping is allowed.** Students can jump to any chapter or straight to Explore. If they skip, a friendly "Continue anyway" note lists the panels they haven't been introduced to, with a link to each card.
- **Students type every reading** (skill section 4a). The sim checks within a small tolerance before ticking.
- **Each Guided step shows only the controls it needs.** The drag-and-drop column only offers the pullers that step uses.
- Key ideas use the skill's "Key idea" box, "Tap the sentence that…" and key-word gaps.

---

## 2. Structure

**Remove:** the Skid Track, Crash Bay, Atrium and the old HQ map of many buildings.

**Home screen:** same concept as now (Force HQ), but zoomed in on the arena complex and the Workshop, drawn with more detail. Show the domes side by side: Main Arena, Snow Arena, Space Dome and the new Drop Zone tower, with the Workshop building beside them. Each is clickable. Also on home, as the skill requires: the name and class box, the "For teachers" button at the top, stamps and the "Change" link.

**Two areas:**
1. **Force Arenas:** five Guided chapters plus Explore.
2. **Workshop:** simple and compound machines, with Guided sections, challenges and an open machine builder.

**Every chapter is split into sections of about 20–30 minutes** (Tom's rule: 20 minutes is the minimum unit for homework, and sections can be combined into longer sessions). Most chapters have a **Foundation** and an **Extension**. Each section has its own Learn steps, its own Check questions and its own worksheet PDF; the Extension can also have the Challenge. After finishing the Foundation, students can stop and upload that PDF, or carry on into the Extension and upload a second PDF if they want to. On the teacher page, each section can be ticked as required or optional. Chapter 1 is the model: Foundation (9 Learn steps and 6 Check questions, about 28 minutes) and Extension (3 Learn steps, a 3-mission Challenge and 5 Check questions, about 29 minutes).

**Every chapter and Workshop section is a task Tom can set on its own** ("Complete Force HQ's Inertia guide"). Each one runs:

1. **Learn:** Guided steps; answers remembered, with a "Try this step again" button.
2. **Challenge:** a sim challenge.
3. **Review:** about 10 mixed questions (skill section 4a-2). Opens once the Challenge is done, with "Continue anyway".
4. **"Make my worksheet":** one PDF per chapter, as in Sparks Through Time. Needs the student's name and class ("No name, no worksheet!"). Lists unanswered questions first with "Go to …" and "Make it anyway". The student's work prints in blue; auto-marked results go on a separate feedback page. No teacher comment box on any PDF: Tom leaves comments directly on Toddle.

Each worksheet has the three Toddle files: blank template, answer key, marking scheme (skill sections 4b and 4d). "📄 Save my work" is available at any time.

---

## 3. The Force Arenas: Guided chapters

**Chapter order follows the unit's lesson sequence** (`G7-8 Lesson Sequence.docx`, Unit 2 Forces): L1 Force & Motion and L2 Types of Forces & Free-Body Diagrams → Chapter 1; L3 Inertia → Chapter 2; L4 F = ma → Chapter 3; L5 3rd Law → Chapter 4. The third law has its own lesson in the unit, so it has its own chapter here. Chapter 5 (balanced forces and the Drop Zone) comes last, so it can tackle the common mix-up between a balanced pair (two forces on one object) and a third-law pair (one force on each of two objects). It also sits just before the helicopter Criterion B/C lessons (L6–9), so it must not give that investigation away (section 4).

### Chapter 1: What is a force?

**Learn**
- A force is a push or a pull, measured in newtons (N). Students add pullers and type what the newtonmeter reads.
- **Types of forces**, met one at a time in the arena: pull (tension in the rope), push (the shove), friction (the floors), weight (W = m × g, g = 9.8 N/kg, with the calculator), normal force, air resistance (a preview), then contact versus non-contact forces.
- **Free-body diagrams**, taught with the FBD builder (section 5): one arrow, then two, then four. Length shows size, direction shows which way, arrows start from the centre of the object.
- **A short "coming up" tour** at the end: one card each for inertia, F = ma, action and reaction, balanced forces and the Workshop.

**Challenge:** use the FBD builder to draw the diagram for three arena set-ups, then build an arena set-up that matches a given diagram.

**Review ideas:** match each force to its type; sort contact and non-contact; calculate weight from mass (non-round masses); auto-checked FBD items; choose the correct diagram from tempting wrong ones.

### Chapter 2: Inertia (Newton's first law)

**Learn**
- **Starting:** the same shove on a 20 kg, 60 kg and 150 kg crate on the air floor. Predict which moves fastest, run it, type the speeds.
- **Stopping:** stop moving objects of different masses with a choice of braking force. The heavier one is harder to stop.
- **Many short examples** (about 2 minutes each, each with a prediction and a run): empty versus loaded sled; car versus truck braking; a pod gliding in space that never stops; the tablecloth trick; a seatbelt and passenger; bowling ball versus football.
- **The velocity–time graph is introduced here:** a flat line means a steady speed; students read speeds off the graph.
- **Newton's first law** stated and checked with a key-idea task.

**Challenge:** an inertia obstacle course. Stop three objects of different masses on target marks by choosing braking forces.

**Review ideas:** put in order of inertia; tick all that apply; read a velocity–time graph; explain-it items on everyday examples.

### Chapter 3: F = ma (Newton's second law)

**Learn**
- **Resultant force first:** add and subtract forces in the tug-of-war; type the resultant before pressing Pull.
- **The formula triangle**, covering F, m and a in turn, with the husky sled.
- **Predict, calculate, run:** the student calculates first, then the run checks their answer.

**Maths practice:** a large bank in levels: (1) find F, (2) find a, (3) find m, (4) two steps: resultant then a, (5) weight and mass mixed in. Non-round numbers, a unit picker, the skill's hint ladder, and correct answers logged as Journal evidence.

**Challenge:** the mail run (sled) and docking orders (space), solved by calculating first.

**Review ideas:** mostly calculations, plus one or two explain-it items.

### Chapter 4: Action and reaction (Newton's third law)

**Learn**
- The astronaut and pod push off each other in the Space Dome: equal forces, opposite directions, on different objects. Students predict both speeds before each push (the existing push log and predictions carry over).
- The tug-of-war rope: the team pulls the rope and the rope pulls the team (the existing "third law pairs" arrows in the arena).
- Thrusters: the pod pushes gas backwards, the gas pushes the pod forwards.

**Challenge:** mission control docking orders using one push and no thrusters.

**Review ideas:** identify the pair for a given force; match the pairs; explain why the lighter one moves faster.

### Chapter 5: Balanced forces and the Drop Zone

**Learn**
- Balanced forces in the tug-of-war: a draw means the object stays still.
- Balanced forces while moving: a crate gliding at a steady speed.
- **Balanced pair versus third-law pair:** a "Tap the sentence that…" task and a sort-it item.
- **Drop Zone** (new arena, section 4): drop objects with a slider for how much air is left in the arena.
  - **Misconception check:** "Do heavier objects fall faster?" Students predict, then test it with no air: everything lands together (like the Apollo 15 hammer and feather).
  - Add air back: air resistance grows with speed until it matches the weight. The forces are balanced and the object stops speeding up (terminal velocity). The FBD and velocity–time graph show it live.

**Challenge:** land a parachutist below a safe speed by choosing the air level and parachute size. Parachutes are fine. **No falling helicopters anywhere** (Tom's summative is a helicopter drop).

**Review ideas:** auto-checked FBDs at three moments of a fall; interpret a velocity–time graph for a skydiver; explain it.

---

## 4. The Drop Zone (new)

- A tall arena tower with a drop platform, a ground with a landing pad, and a height scale. Same art style as the existing domes.
- **Air slider:** 0–100% of the air left in the arena. 100% is normal air. Show it as a pressure gauge.
- **Objects:** feather, table-tennis ball, football, bowling ball, crate, parachutist (parachute closed or open, with a choice of canopy size). Use varied, non-round masses.
- **Physics (explain to Tom before coding, per the skill):** weight W = m × 9.8; air resistance F = k × (air fraction) × v², where k depends on the object's size and shape (large for the feather and the open parachute). Resultant = W − F, a = resultant ÷ m. Terminal velocity v = √(W ÷ (k × air fraction)). With 0% air, every object has a = 9.8 m/s². Pick each object's k so terminal speeds look realistic: feather about 0.5–1 m/s; skydiver about 50 m/s closed and 5–6 m/s with the parachute open.
- **Readouts** (introduced one at a time in Guided): weight, air resistance, resultant, speed, height, time.
- **Helicopter extension** (Explore, "Extra challenge"): hover a helicopter. Rotor lift versus weight; hovering means balanced forces; adding cargo means more lift is needed; more lift than weight means it climbs (F = ma). It always lands gently: no crashes or falls.

---

## 5. The free-body diagram builder (new, auto-checked)

**How it works**
- The object is drawn in the middle of the board as the real thing (crate, sled, astronaut, parachutist, truck), with a dot at its centre.
- **Adding an arrow:** press on the centre dot and drag outwards. The arrow snaps to up, down, left or right; later scenarios also allow diagonals (for example a push at an angle).
- **Labelling:** on release, a small pop-up beside the arrow asks the student to choose the force from a list (weight, normal force, friction, air resistance, tension or pull, push, driving force, thrust, upthrust) and type the size in newtons.
- **Editing:** tapping an arrow opens a menu beside it (skill: actions appear where you tap) to change the label or number, re-drag the length, or remove it. Undo and clear are available.
- **To scale (optional per task):** a grid with "1 square = 50 N" appears, and length is checked.
- **Resultant (optional per task):** the student draws a dashed arrow and types its size and direction.

**Automatic checks**, each shown as a chip that turns green: every force is there and nothing extra; each arrow points the right way; each label is right; each number is right within a tolerance (for example W = m × 9.8); every arrow starts from the centre; lengths match the forces (bigger force, longer arrow; equal forces, equal arrows); the resultant is right, if asked.

**Feedback** follows the skill's hint ladder, for example: "One force is missing." → "Think about what the floor does." → "There should be a normal force pointing up." The student still draws it.

**Where it's used**
- Chapter 1 teaches free-body diagrams with it.
- Every chapter's Review has auto-checked FBD items (replacing most self-marked "draw it" questions).
- Explore: a "Draw what's happening now" button freezes the arena and checks the student's diagram against the live forces.
- Build tasks for the teacher page: "Free-body diagrams: balanced forces" and "Free-body diagrams: speeding up and slowing down".

**On worksheets:** the diagram prints as a picture with the student's arrows and numbers in blue; checks passed go on the feedback page. Blank template: the object with an empty box. Answer key: the model diagram. Marking scheme: 1 mark per correct arrow (direction, label and value), plus 1 for correct relative lengths.

**Scenario bank:** about 20–25 scenarios as data, with non-round numbers, so new ones are easy to add.

---

## 6. Explore

- One sandbox with every event: tug-of-war, husky sled race, strongman pull, space dock and the Drop Zone. Students pull, push and drop while changing mass, floor, cargo, ground, air and so on.
- Every panel shows from the start, each with its ⓘ "How do I read this?" button.
- Each event has **"Try this" investigations** (change one thing, keep the rest the same, record the result) and its existing challenges.

---

## 7. The Workshop

**Machines:** pulley, lever (three classes), wheel and axle, inclined plane, **wedge** and **screw**, then compound machines (crane, wheelbarrow, bicycle, scissors, a pulley system).

**Pulleys and mechanical advantage come first.** The unit teaches machines in one lesson, L12 "Pulleys & Mechanical Advantage", and AC9S7U04 names simple machines and mechanical advantage. So the first Workshop section matches that lesson exactly and is the one Tom is most likely to set. The other machines follow as review and extension of the same idea.

**Maths:**
- Work done: W = F × d (joules).
- Mechanical advantage: load ÷ effort. Wedge: length ÷ thickness. Screw: circumference of the turn ÷ thread spacing (pitch).
- The trade-off: less force means more distance, so the work stays the same (ideal machines).
- **Efficiency: an optional extension section at the very end, clearly labelled "Extension".** Checked against `ACARA Standards Coverage.docx`: AC9S7U04 covers forces, simple machines, F = ma and mechanical advantage; neither work nor efficiency is named. Work stays in the core because Tom asked for work calculations and it explains the force–distance trade-off. Efficiency goes in an "Extension: real machines waste energy" section: friction in the pulleys and the screw, Work in > Work out, efficiency = useful work out ÷ work in × 100%. Keep it out of the Crit A review path, and leave it unticked by default on the teacher page.

**Structure:** each machine group (pulleys and mechanical advantage; levers; wheel and axle; ramps, wedges and screws; compound machines; efficiency extension) is a section with Learn → Challenge → Review → worksheet, like the arena chapters.

**Open machine builder** (skill section 4e): free build plus build tasks, for example "Lift 200 kg using less than 300 N" or "Split the log using less than 400 N". Each has live checks, a results table and a build sheet. The existing machine challenges (`PROBS`, `PARTS`, three-star scoring) carry over.

---

## 8. Sim-builder skill items Force HQ is missing

Build all of these (see the skill for details):
- Name and class box at the start; "I'm a teacher" mode; teacher code **FORCE**.
- Teacher page: tick chapters, Workshop sections and build tasks; writes the prompt for Toddle's AI task maker; step 5 file buttons.
- Toddle files for every sheet (blank template, answer key, marking scheme), the Playwright `make-worksheets.js` script, and the zip with one folder per sheet.
- "📄 Save my work" PDF at any time; student work printed in blue.
- Remembered answers with "Try this step again".
- "On this page" progress bar; green "✓ Done" and amber "To do" states; "Continue anyway" instead of blocked buttons; exact prerequisite messages.
- Floating calculator on every screen (safe parser, no `eval`), with the F = m × a and W = F × d triangles.
- Glossary auto-underlined by a MutationObserver (about 50–80 terms).
- Stamps for each chapter and Workshop section, with a stamp-down animation.
- Source in `src/` modules with a build script, in Tom's repo at `tmh80/tmh-teaching-apps`, folder `force-hq/` (`src/`, `build.js`, `tests/`, `docs/`, `Force-HQ-offline.html`, `worksheets/`).

---

## 9. Keep from the current build

All in `claude/Force-HQ.html`. Copy the code across and adapt it; don't rewrite what works.

- **Arena engine:** `forces()` (static and kinetic friction, sled top-speed taper, space push and thrusters), `step()`, `objInfo()`, the event tables (`EVENTS`, `EVCTL`, `PULLERS`, `MAXT`, `SNOW`, `GROUNDS`, `LOADS`, `LOADMU`) and `PUL` puller strengths.
- **Puller strengths (N):** kid 60, dog 70, adult 130, strong adult 200, pony 260, horse 650, husky 90, strongman 1250, elephant 4600. Keep these uneven values.
- **Drawings:** arena shells and domes, `puller()`, `quad()`, `drawElephant()`, the sled, vehicles, loads, the space dock and astronaut, `gripMeter()` and the grip zoom bubble.
- **Drag-and-drop pullers** (latest version): tiles drawn from `pullerIcon()`; drop left or right of the object to choose the team; drag someone off the arena to send them back, or across the middle to swap teams; tap to remove; Undo and Clear all; side highlight while dragging; `palSides()` respects which teams a step allows.
- **Free-body diagram drawing:** `drawFBD()` shows the actual object, arrows from the centre, a scale note and break marks for long weight/normal arrows.
- **Velocity–time graph** `drawVT()`, with auto-scaling and the "tether pulls tight" marker.
- **Journal:** contents list, drop-down sections, "My notes and questions" per card, and "Evidence of my learning" (auto-logged maths, quick checks and challenges, plus the student's own evidence).
- **Fun facts**, gated so a fact only appears once its idea has been taught.
- **Workshop:** `MSTEPS`, `mCalc()`, `PARTS`, `PROBS` and the lever, pulley and crane drawings.
- **Layout that Tom has already approved in the arena:**
  - left column: the Do this list, then the "Your turn" question box, sticky so it stays in view;
  - a narrow column of draggable pullers and controls beside the arena;
  - the arena at full width;
  - under it, two tabs: "Free-body diagram and numbers" (large FBD with key and scale beside it, then the readouts and fun fact) and "Velocity–time graph".

**Redraw the animals so each is easy to tell apart.** In the current build, `quad()` draws the dog, pony, horse and husky as the same four-legged shape scaled up or down, so they look too similar. Give each its own silhouette. Plain team colours (one flat colour per team, for example blue) are still fine; the shape does the work. Use the same drawings for the arena, the drag-and-drop tiles (`pullerIcon()`) and the free-body diagram objects.

- **Dog:** small and low, with a short snout, upright or floppy ears, a tail curled up, and short legs. Clearly smaller than a pony.
- **Husky:** dog-shaped but stockier, with pointed upright ears, a thick neck ruff, a tail curled over its back, and a harness drawn on.
- **Pony:** short and round-bodied, with short thick legs, a thick neck, a big shaggy mane and forelock, and a full tail.
- **Horse:** tall and long-legged, with a long arched neck, a long head, a slim body, a flowing mane and tail, and hooves. Clearly taller than the pony.
- **Elephant:** keep the current one; it's already distinct.

Follow Tom's animal-graphics rules from the project preferences:
- Keep anatomy accurate.
- Every face has a nose, a mouth and ears. Eyes and nose are simple dots; ears are a curved line sized to the animal.
- Dogs and huskies are carnivores, so their eyes sit closer to the front of the head. Ponies and horses have eyes on the side of the head.

Animate the legs in a gait that suits each animal: a trot for the dogs, a walk for the pony and horse. Check every animal at tile size (about 52 × 40 px) as well as in the arena, so each one is still recognisable when small.

**Leave behind:** the Skid Track, Crash Bay, Atrium, the old HQ map, and the old Force Formula practice tab (its question bank moves into Chapter 3).

---

## 10. Conventions that must not change

- g = 9.8 N/kg everywhere.
- Non-round numbers in scenarios and questions.
- Free-body diagram arrows start from the centre of the object.
- Fully offline single file: no Google fonts, no CDN, no external requests.
- Student text: warm, encouraging, natural full sentences at Grade 7–8 level. Avoid clipped, punchy, AI-sounding lines; avoid the "it isn't X, it's Y" construction; avoid framing that justifies why something is worth learning.
- Standards stay off every student screen and worksheet; no "I can" statements.
- Every Guided question must be answerable with what is on screen at that step, and the sim's state must match the question. (A past bug: a question used a 200 N push while the sim was fixed at 100 N.)

---

## 11. Build order

1. Read the sources in section 0 and play through the current build.
2. Set up the repo folder and `src/` modules; port the shell, the arena engine and the drawings.
3. **Build Chapter 1 completely** (Learn, FBD builder, Challenge, Review, worksheet, Toddle files) and deliver it. Tom will test it with a colleague; that test is the real check on information overload. Wait for feedback before going on.
4. Chapters 2–5 and the Drop Zone (explain the drop physics to Tom first).
5. Explore, with "Try this" investigations and the helicopter extension.
6. Workshop sections, the machine builder and build tasks.
7. Teacher page, Toddle files zip, full test pass (skill section 6), delivery (skill section 7).
8. Write `Force_HQ_Brief.md` and `Force_HQ_Backlog.md` (skill section 8).

---

## 12. Standards map (teacher-only, for planning; never on student screens)

From `ACARA Standards Coverage.docx` and `G7-8 Lesson Sequence.docx` (both in the project):

| Force HQ section | Unit lesson | Standard |
|---|---|---|
| Ch 1 What is a force? (types, FBDs) | L1 Force & Motion, L2 Types of Forces & FBDs | AC9S7U04 |
| Ch 2 Inertia | L3 1st Law — Inertia | AC9S7U04 |
| Ch 3 F = ma | L4 2nd Law (F = ma) | AC9S7U04 |
| Ch 4 Action and reaction | L5 3rd Law | WAB curriculum (soft AC9S7U04 link) |
| Ch 5 Balanced forces and Drop Zone | supports L6–9 Crit B/C (helicopter) without giving it away | AC9S7U04 |
| Workshop: pulleys and mechanical advantage | L12 Pulleys & Mechanical Advantage | AC9S7U04 |
| Workshop: other machines, work | review and extension | AC9S7U04 |
| Workshop: efficiency | extension only | beyond the standard |
| Whole sim, all Reviews | L13 Sem 1 Crit A Review | AC9S7U04 |

Use this for the teacher page's goals and for choosing which sections to mark as core.

## 13. Open questions for Tom

- Drop Zone objects and parachutist canopy sizes: any he'd like added?
