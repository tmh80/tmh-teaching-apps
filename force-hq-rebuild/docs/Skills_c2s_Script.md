# Force HQ Skills section `c2s`: Graphs and CER (script)

Stage 2 of `Force_HQ_Reading_Writing_Plan.md`. Quoted text is exact student text. *Teacher* items stay off student screens. Numbers are checked by `tools/check_skills_numbers.py`.

## The section

- **id** `c2s` · **ch** `c2` · **part** "Skills" · **title** "Graphs and CER" · **stamp** "Evidence Expert"
- **needs** `c2f` (it uses the brake from Foundation step 4 and the idea of inertia). Set as homework with Chapter 2 Foundation.
- **Blurb:** "Brake-test four crates, turn your results into a graph, then use them to write a science paragraph with a claim, evidence and reasoning."
- **Goal** (*Teacher*): Present braking data as a scatter graph; read values and describe the trend with numbers; write a CER paragraph that uses data and the science of inertia.
- **Vocab:** graph, scatter graph, bar graph, axis, unit, trend, claim, evidence, reasoning, braking distance, inertia
- **Strands** (*Teacher*, MYP Year 3): C i, C ii, D iii
- **Time:** approx. 22 minutes (I can screen under 1, Learn 1 about 7, Learn 2 about 6, self-check 1, Check about 8). If `secMins` shows more than 22, cut the Mark it from the Check first.

## I can screen

"By the end of this section:"
- "I can choose a scatter graph or a bar graph for my data."
- "I can make a graph with a title, labelled axes and accurate points."
- "I can read a value from a graph and describe the trend using numbers."
- "I can write a CER paragraph with a claim, evidence and reasoning."

## Learn 1: Brake test, then graph it

Rig: `course(20, 2.4, 36)` on the air floor, launch and braking-distance readout on, shove hidden. The results table is on screen at once, beside the arena.

**Card 1 (read-first OK):** "In the Foundation you found out that heavier crates are harder to stop. Now you'll test it properly, like a scientist: four crates, the same 36 N brake, and the same launch velocity of 2.4 m/s every time. Then you'll turn your results into a graph."

**Question at top:** "How does the mass of a crate change its braking distance?"

**Do this:**
1. "Launch the 20 kg crate and type its braking distance in the table."
2. "Set 40 kg, launch it and type its braking distance."
3. "Do the same for 60 kg and 80 kg."

Table: Mass of crate (kg) 20, 40, 60, 80 | Braking distance (m), typed. Expected 1.6, 3.2, 4.8, 6.4 m (tolerance as the existing `reading` type). The row ticks green when the typed value matches the run.

**Teach card, "How to make a good graph"** (appears once the table is full; full example the first time, a short reminder with the example one tap away after that):

"Priya hangs masses on a spring and measures how far it stretches." Table: Mass (g) 100, 200, 300, 400 | Stretch (cm) 2.0, 4.1, 5.9, 8.0. The card shows her finished scatter graph with each part labelled:
- "**Title:** what you changed vs what you measured: *Mass vs stretch*."
- "**Bottom axis (x):** what you changed, with its unit in brackets: *Mass (g)*."
- "**Side axis (y):** what you measured, with its unit in brackets: *Stretch (cm)*."
- "**Scale:** start at 0, go up in equal steps, and finish just above your biggest number."
- "**Points:** one point for each row of the table, placed carefully."
Key idea: "Changed along the bottom, measured up the side, units in brackets."
Button: "Got it. Let me try"

**Teach card, "Scatter or bar?":** "If you changed a **number**, use a **scatter graph**. If you changed a **name or a group**, use a **bar graph**." Two mini pictures: Priya's spring scatter graph, and a bar graph of friction on four named floors.

**Practice (mcq, one go each, options Scatter graph | Bar graph, shuffled):**
1. "Kai pulls the same box across carpet, wood, ice and concrete, and measures the friction on each floor. Which graph should he make?" Bar. Why: "The floors are names, not numbers."
2. "Noor hangs 1, 2, 3, 4 and 5 kg masses on a newtonmeter and records each reading. Which graph should she make?" Scatter. Why: "She changed a number: the mass."
3. "Ben tests four brands of trainer and measures the pull needed to make each one slide. Which graph should he make?" Bar. Why: "The brands are names."

**Make your graph** (graph maker, Learn mode): data from the student's own table. Live green and red rings, the checklist and the fold-out reminder. The step finishes when the graph is right. Expected: scatter, title like "Mass vs braking distance", x "Mass (kg)", y "Braking distance (m)".

**Finish:** "Brilliant graph! Now let's find out what it tells you."

## Learn 2: From graph to CER

Rig: same course, crate at 50 kg but the braking-distance readout hidden until q1 is answered. The student's graph and the question sit beside the questions.

**Card 1 (read-first OK):** "A graph lets you find values you never measured, and see the trend at a glance. Then scientists write up what they found in a paragraph called a CER."

**q1 (reading from the graph):** "Use your graph. What braking distance would a 50 kg crate have?" Accept 3.8 to 4.2 m. Hint: "Find 50 kg on the bottom axis, go straight up to your line of points, then straight across to the side axis."
**Task:** "Now check it: launch the 50 kg crate." (Readout shows 4.0 m.)

**q2 (mcq, one go, shuffled):** "Which sentence describes the trend best?"
- ✔ "Every extra 20 kg makes the braking distance 1.6 m longer."
- "When the mass goes up, the braking distance goes up." Why: "True, but it gives no numbers."
- "The 80 kg crate slid 6.4 m." Why: "That is one result, not a trend."
- "When the mass goes up, the braking distance goes down." Why: "Look at your graph again: which way do the points go?"

**q3 (tap two points, shown as "My evidence"):** "Tap the two points that would convince a friend best." Any two count. Feedback: "The first and last points show the biggest change."

**Teach card, "CER: Claim, Evidence, Reasoning":** "A good science paragraph does three jobs, in this order."
Example question: "Does a rougher surface make more friction?"
- **Claim** (answers the question): "Rougher surfaces make more friction."
- **Evidence** (numbers from the test, each with its unit, like 2 N or 6.4 m): "A block needed a pull of 2 N to slide on ice, and 14 N to slide on sandpaper."
- **Reasoning** (explains why, using science): "Rough surfaces have more bumps that catch on each other, so more friction pushes back against the pull."
Button: "Got it. Let me try"

**Mark it (Learn, unscored):** "Jo launched a 30 kg crate at 2.4 m/s and changed the brake force. Mark each sentence as Claim, Evidence or Reasoning." Labels: Claim, Evidence, Reasoning.
1. "My results show that a stronger brake stops the crate in a shorter distance." Claim
2. "With a 24 N brake the crate slid 3.6 m, and with a 48 N brake it slid 1.8 m." Evidence
3. "A bigger force against the motion slows the crate down faster, so it stops sooner." Reasoning
Key idea (after marking): "Claim, Evidence, Reasoning. Say it, show it, explain it."

**Write a claim:** "Your question was: how does the mass of a crate change its braking distance? Write one claim that answers it." The question and the student's graph sit beside the box, headed "My graph". Any text counts. Starter: "My results show that…". Model (shown after writing): "My results show that crates with more mass slide further before they stop."

**Finish:** "That's a CER claim! In the Check you'll write all three parts."

## Self-check

The four I can statements, each with an X on the Beginning, Developing, Proficient, Mastering line. The Check appears when all four have an X.

## Check (approx. 8 minutes)

**Shared story** (shown above Q1 and Q3; prints on the worksheet): "Road crashes kill about 1.2 million people around the world every year. The United Nations has a goal, target 3.6, to halve the number of deaths and injuries from road crashes. Knowing how cargo changes a truck's braking distance helps keep everyone safe. A road safety team tested one truck on a test track. They loaded it with different masses of cargo, drove it at 20 m/s and braked with the same force each time."

Table (prints on every worksheet and goes in the AI marking text): Mass of cargo (kg) 0, 2,000, 4,000, 6,000, 8,000 | Braking distance (m) 40, 50, 60, 70, 80.

**Q1 Make a graph** (`graph`, 5 marks, one go, fold-out "How to make a good graph"; *Teacher*: C i): "Make a graph of the road safety team's results." Answer: scatter graph; title like "Mass of cargo vs braking distance"; x "Mass of cargo (kg)", y "Braking distance (m)"; even scales; five points. The prompt never names the graph type.

**Q2 Mark it** (`mark`, 5 points, one go; *Teacher*: C ii): "Zane gave trolleys of different mass the same push on a smooth floor and measured their velocity. Mark each sentence. Leave it with no label if it doesn't belong." Labels: Claim, Evidence, Reasoning. Sentences display in this order:
1. "The results show that a heavier trolley gets a smaller velocity from the same push." Claim: "It answers the question."
2. "The empty 10 kg trolley reached 3.0 m/s." Evidence: "A number with its unit."
3. "Supermarkets have lots of trolleys." No label: "True, but it isn't about the results."
4. "The full 30 kg trolley only reached 1.0 m/s." Evidence: "A second number to compare."
5. "A heavier trolley has more inertia, so the same push changes its velocity less." Reasoning: "It explains why, using science."

**Q3 Data paragraph** (paragraph card on `explain`, 4 ticks; *Teacher*: C ii, D iii): "The road safety team's question: how does the mass of cargo change a truck's braking distance? Tap two rows of the table, then write a CER paragraph that answers the question." The table (not the graph) sits beside the box, with the tapped rows shown as "My evidence".
- **Support (most help):** three starters, "The results show that…", "With … kg of cargo the truck slid…, and with…", "This happens because…"; the CER reminder fold-out open; words to use: braking distance, mass, inertia, brake force.
- **Model** (numbers follow the rows tapped): "The results show that the more cargo a truck carries, the further it slides before it stops. With no cargo the truck's braking distance was 40 m, and with 8,000 kg of cargo it was 80 m. This happens because the cargo gives the truck more mass, so it has more inertia. The same brake force takes longer to stop something with more inertia, so the truck slides further."
- **Ticks** (shown only after the model): "My claim answers the question." · "I gave two numbers from the table, each with its unit." · "I explained the trend using mass and inertia." · "I used science words correctly, like braking distance and inertia."

## Teacher notes

- **Numbers:** braking distance = mass × velocity² ÷ (2 × brake force). Learn: 36 N brake at 2.4 m/s gives 0.08 m per kg (20 kg 1.6 m, 50 kg 4.0 m, 80 kg 6.4 m). Jo: 30 kg at 2.4 m/s, 24 N gives 3.6 m and 48 N gives 1.8 m. Truck: 8,000 kg empty, 40,000 N brake, 20 m/s, so 40 m empty and 80 m with 8,000 kg of cargo (decelerations 5.0 to 2.5 m/s², realistic for a truck). Zane: the same push gives velocity ÷ mass, so 10 kg 3.0 m/s and 30 kg 1.0 m/s.
- **Facts:** WHO reports about 1.19 million road traffic deaths a year ([WHO road safety](https://who.int/health-topics/road-safety), Global status report on road safety 2023). SDG 3.6 originally said "By 2020, halve the number of global deaths and injuries from road traffic accidents" ([INSTAT](https://instat.gov.al/en/sdgs/good-health-and-well-being/36-by-2020-halve-the-number-of-global-deaths-and-injuries-from-road-traffic-accidents)); the UN has since set the halving goal for 2030, so the student text names no deadline.
- **Marks:** Q1 5, Q2 5, Q3 4: 14 in total. Q2 and Q3 assess C ii; Q3 also D iii.
- **Toddle:** a new task, "Chapter 2 Skills: Graphs and CER", set with the Chapter 2 Foundation. The AI text gets the truck table, the self-check note and the first-line rule.
- **Saves:** new ids only, so no saved answers move.
