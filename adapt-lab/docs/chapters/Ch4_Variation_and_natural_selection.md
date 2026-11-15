# Chapter 4 · Variation and natural selection

Draft script for Tom to read and correct (written 15 Nov 2026). Grade 6, students working alone. No code yet: a later session builds from this.

**How to read this script.** Text in quote blocks is what the student reads. "Do this" jobs are ticked off by the sim. Every auto-marked question gets one go, then locks and shows the right answer with the reason. Misconception numbers (M1, M2 …) are listed in `docs/Misconceptions_and_Vocabulary.md`. Strand tags are for the teacher only and never appear on student screens.

**Screens named in this chapter**
- **Evolution Lab:** the living scene of up to 40 real individuals, with Play, Pause, "Next generation" and "Run 5 generations" buttons. Beside it: the **population graph**, the **what-killed-them tally**, the **trait lines** (the herd average of each trait over time) and, at each pause, the **era report**.
- **Tap an animal:** tapping any animal in the scene opens a small card with its own traits beside the herd average. A **Follow** button marks it with a ring so it can be found again. A **Family** button highlights its parents and its young.
- **Data tools:** the Journal (Runs, Notes, Vocab), the table maker and the graph maker.

**The test species.** This chapter uses one made-up animal all the way through: the **snow hopper**, a small hare-like mammal in the **Arctic tundra**. The starting herd is 20 hoppers with an average coat thickness of about 40 (on the sim's 0 to 100 scale), so each one is a little different, from about 26 to 54. It is the same species used in `CER_Scaffold.md` stage 2.

**Notes for the builder (check before building)**
1. The snow hopper is a fixed design that only just survives in the tundra (yearly survival 50–65%), with a thin-for-the-tundra coat so there is room for the average to rise. Find it with a search script. Check over 50 seeds that the average coat rises by at least 15 in 20 generations in at least 90% of runs and that the herd never dies out before generation 20 with the chapter's fixed seed.
2. Guided runs in this chapter use a **fixed seed**, so the answer key can print the numbers. Free runs in the Challenge use the student's own seed.
3. "Coat thickness" is the `insul` trait. Students read it as a plain number with no unit ("coat thickness 40"). The Journal calls the scale "0 = bare, 100 = thickest".
4. In Learn the herd-average readouts and trait lines are **masked** until the student has typed the reading the step asks for.
5. The tapped-animal card must show that an animal's traits never change during its life. This is the main tool against M1.
6. Extension step 5 needs a **"copy herd"** switch: every hopper identical, young exact copies of a parent (variation off). Teacher mode and this step only.
7. Every number marked *[example numbers]* shows the shape of the question. Replace it with model output and re-check the answers.

---

## Foundation · No two are the same (approx. 28 min)

### Key ideas
1. **Variation:** the individuals in a population are all slightly different.
2. **Inheritance:** young take after their parents, so features are passed on.
3. **Natural selection:** individuals with features that fit the environment survive more often and have more young. Over many generations the **population** changes. No single animal changes.

### Misconceptions targeted
- **M1 "An animal changes its own body to cope."** Learn steps 2 and 5, Check questions 3, 4 and 8.
- **M2 "Animals adapt because they need to."** Learn steps 3 and 5, Check questions 4, 6 and 8.
- **M8 "All animals of one kind are the same."** Learn step 1, Check questions 5 and 7.
- **M9 "Things that happen to a parent are passed to its young."** Learn step 4, Check question 4.

### Vocabulary, in the order it is introduced
population → individual → variation → average → generation → survive → inherit → natural selection

### Learn steps

**Step 1 · Meet the herd (approx. 5 min)** · Screen: Evolution Lab (paused at generation 0)

> Here are 20 snow hoppers in the Arctic tundra. A group like this, all one kind and living in one place, is called a **population**. Look closely. Are they all the same?

Prediction (locks first): "If you measure the coat thickness of five hoppers, what will you find?" All five the same · A few different numbers · Five different numbers.

Do this:
1. Tap five different hoppers. For each one, type its **coat thickness** in the table under the scene. *(Reading table, 5 rows, opens with the step. Each row is checked against the animal that was tapped.)*
2. Type the **thickest** coat in your table. *(inline answer box)*
3. Type the **thinnest** coat in your table. *(inline answer box)*
4. Tap one more hopper and look at its ears and legs as well. Are they the same as the herd average?

Your turn:
- **Read it:** "How many of your five hoppers had exactly the same coat thickness as the first one?" (checked against their table)
- **Key idea box:**
  > **Key idea: the individuals in a population are all slightly different. This is called variation.**

  Question: *Which sentence describes variation?* "Some snow hoppers have thicker coats than others" ✔ · "A snow hopper's coat is thicker than a camel's" · "A snow hopper grows a thicker coat each winter". (Distractors: difference between species; change within one life.)

Hint ladder for job 1: (1) "Tap a hopper in the picture. A card opens." (2) The coat thickness line on the card is outlined. (3) "This card says 'Coat thickness 37'. Type 37 in row 1."

**Step 2 · Follow one hopper (approx. 5 min)** · Screen: Evolution Lab

> Pick one hopper with a **thin** coat. You are going to follow it through a whole freezing year. What will happen to its coat?

Prediction (locks first): "After a year in the cold, this hopper's coat thickness will be…" higher than now · the same as now · lower than now.

Do this:
1. Tap a hopper with a coat thickness below 38 and press **Follow**. A ring appears around it.
2. Type its coat thickness now. *(inline answer box)*
3. Press **Next generation** and watch the year pass. Find your ringed hopper.
4. If it is still alive, tap it and type its coat thickness again. If it died, the card shows its last reading: type that. *(inline answer box)*

Your turn:
- **Choose the words:** "My hopper's coat thickness (went up / stayed the same / went down) during its life."
- **Tap the sentence that explains what you saw:** "An animal keeps the body it was born with." ✔ · "An animal's coat grows thicker when winters are cold." · "An animal can thicken its coat if it tries hard enough." · "An animal's coat gets thinner as it grows older." Hint after a wrong tap: "Look at the two numbers you typed. Did the number change?"
- **Key idea box:**
  > **Key idea: no single animal changes its inherited features during its life.** A hopper born with a thin coat keeps a thin coat.

  Question: *A hopper is born with coat thickness 31. What is its coat thickness two winters later?* 31 ✔ · 41 · 51. (M1: each wrong option is "it grew what it needed".)

Note for the builder: real hares do moult into a winter coat. The script says "the coat it was born to grow". If Tom prefers, the card can say "winter coat thickness". See Questions for Tom.

**Step 3 · Who died? (approx. 6 min)** · Screens: Evolution Lab, what-killed-them tally

> Now let five generations go by. A **generation** is one round of parents having young. Many hoppers will die. Is it just bad luck who dies of cold?

Prediction (locks first): "Which hoppers will die of cold most often?" The ones with the thinnest coats · The ones with the thickest coats · Coat thickness will make no difference.

Do this:
1. Press **Run 5 generations**. Watch, then wait for the pause.
2. Open the **what-killed-them tally**. Type the number that died of **cold**. *(inline answer box)*
3. Tap **"Too cold"** on the tally. The sim shows two averages. Type both into the table: the average coat of hoppers that **died of cold**, and the average coat of hoppers that are **still alive**. *(Reading table, 2 rows)*

Your turn:
- **Read it:** "Which group had the thicker coats on average: the ones that died of cold, or the ones still alive?" (checked against their table)
- **Answer and reason:** "Did the thin-coated hoppers need thick coats?" Yes / No. Reason: "They needed them, but needing a feature does not make it grow" ✔ · "They needed them, so they grew thicker coats in time" · "They did not need them, because cold does not harm hoppers". (M2.)
- **Key idea box:**
  > **Key idea: individuals with features that fit their environment survive more often.** It is not only luck. In the cold, thick coats survive more often than thin coats.

  Question: *Tap the sentence that matches the key idea.* "Hoppers that happened to be born with thick coats lived more often." ✔ · "Hoppers that wanted to live grew thick coats." · "Hoppers all had the same chance of living."

Hint ladder for job 3: (1) "The tally is the list of causes beside the scene." (2) The "Too cold" row is outlined. (3) "The two averages appear under the row: 'Died of cold: average coat 33. Still alive: average coat 44.' Type each one in its row." *[example numbers]*

**Step 4 · Like parent, like young (approx. 5 min)** · Screen: Evolution Lab

> The survivors have young. Do the young look like their parents?

Prediction (locks first): "Two thick-coated hoppers have young. The young will most likely have…" thick coats · thin coats · any coat at all.

Do this:
1. Tap a young hopper (the small ones) and press **Family**. Its two parents light up.
2. Type the coat thickness of each parent and of the young one. Do this for **three** families. *(Reading table, 3 rows × 3 columns: Parent 1, Parent 2, Young)*

Your turn:
- **Choose the words:** "The young hoppers' coats were (close to / far from / exactly the same as) their parents' coats."
- **Who's right?** A fox bit a piece out of one hopper's ear. Later that hopper has young.
  - Mei: "The young will be born with whole ears. A bite is not passed on."  ✔
  - Tom: "The young will be born with a piece missing, like their parent."
  - Ana: "The young will be born with bigger ears, to make up for it."
  
  Reason: "Only features an animal was born with can be passed to its young" ✔ · "Anything that changes a parent's body is passed to its young" · "Young are born with whatever features they will need". (M9, M2.)
- **Key-word gap:**
  > **Key idea: young ______ features from their parents.** *(inherit; accepts inherit, get, take after — "get" gives the feedback "The science word is inherit.")*

**Step 5 · Twenty generations (approx. 7 min)** · Screens: Evolution Lab, trait lines, era report

> Thick coats survive more often. Young take after their parents. So what will happen to the whole population over 20 generations?

Prediction (locks first): **Sketch the graph.** Set one dot for generations 0, 5, 10, 15 and 20 to show what you think the **average** coat thickness will do. *(Checked later by shape only: "rises", "falls" or "stays level".)*

Do this:
1. Press **Run 5 generations** three more times, to reach generation 20. At each pause, type the **average coat thickness** from the era report into your table. *(Reading table: generations 0, 5, 10, 15, 20. Generation 0 and 5 unlock straight away from earlier steps.)*
2. Find your **ringed hopper** from step 2 in the Journal. It died long ago. Read its last coat thickness.
3. Tap any hopper alive now and compare its coat with the herd average at generation 0.

Your turn:
- **Read it:** "What was the average coat thickness at generation 20?" (from their table)
- **Put in order** (5 cards): Hoppers in the population have different coats · Thin-coated hoppers die of cold more often · Thick-coated hoppers survive and have young · The young inherit thick coats · After many generations, most hoppers have thick coats.
- **Answer and reason:** "Did your ringed hopper's coat get thicker?" Yes / No. Reason: "The population changed because of who survived and had young; no single hopper changed" ✔ · "The population changed because each hopper slowly thickened its own coat" · "The population changed because the hoppers knew they needed thicker coats". (M1, M2.)
- **Key idea box:**
  > **Key idea: this is natural selection.** Individuals vary. Those with features that fit the environment survive more often and have more young. The young inherit those features. Over many generations, the **population** changes.

  Question: *What changed over the 20 generations?* "The mix of hoppers in the population" ✔ · "The body of each hopper as it aged" · "The weather in the tundra". 

Hint ladder for the ordering question: (1) "Start with what was true before anything happened: were the hoppers all the same?" (2) "Look at your steps 1, 3 and 4 in the Journal. They are in the right order." (3) The first two cards are placed for the student.

### Challenge (optional) · Send them south (approx. 6 min)

> Take the same 20 snow hoppers to the **temperate forest**, where winters are much milder. You may not change their design. Which way will natural selection push their coats here?

Live goals (chips turn green):
- Lock a prediction: average coat will go **up**, **down** or **stay level**.
- Run 20 generations with at least 15 hoppers alive at the end. (Redo with a new seed if the herd dies out.)
- Record the average coat at generation 0 and generation 20 in your table.
- Take a snapshot of the trait line.

Debrief: "In the warm forest a thick coat costs energy and does not help, so thinner coats did better. Natural selection has no goal. It depends on the environment."

### Check · Foundation (8 questions, 24 points, approx. 10 min)

Under every card: "You get one go, so check your answer carefully before you press Check."

| # | Purpose | Type | Question and options | Answer, model answer or checklist | Pts | What each wrong option shows | Strand |
|---|---|---|---|---|---|---|---|
| 1 | Organise | Put in order | Put the story of natural selection in order.<br>The young inherit long legs · Some desert lizards are born with longer legs than others · After many generations, most lizards have long legs · Long-legged lizards escape hawks more often · The survivors have young | Some born longer → escape more often → survivors have young → young inherit → most have long legs | 2 | Starting with "escape more often": misses that variation comes first. Ending with "inherit": misses the many-generations step. | A i |
| 2 | Observe | Read it | Open your Journal. From your own run, type the average coat thickness at **generation 0** and at **generation 20**. | Their own two readings (checked against their run; no re-run needed) | 2 | A value from the wrong row shows a table-reading slip; feedback names the row. | A iii |
| 3 | Misconception · *How sure are you?* | Answer and reason | A snow hopper is born with coat thickness 34. It lives through three very cold winters. What is its coat thickness at the end?<br>Answer: 34 / About 44 / About 54<br>Reason: An animal keeps the features it was born with / A cold place makes an animal's coat grow thicker / An animal changes the features it needs to change | 34; "keeps the features it was born with" | 2 | "About 44/54" + "cold makes it grow": M1. "Changes the features it needs": M2. | A ii |
| 4 | Organise | Always, sometimes or never? | Sort each statement.<br>Individuals in a population are slightly different from each other · An animal grows a new feature because it needs one · A scar on a parent is passed to its young · An animal with a helpful feature survives the winter · Young animals take after their parents | Always: individuals differ; young take after parents. Sometimes: helpful feature survives (it helps the chances; it is not a promise). Never: grows a feature from need; scar passed on. | 5 | "Needs one" as sometimes: M2. "Scar" as sometimes: M9. "Helpful feature survives" as always: thinks selection is certain, not a matter of chances. | A i |
| 5 | Observe | Tap the moment | *Picture: five snow hoppers in a snowstorm, each with its coat thickness on a card: 29, 36, 41, 47, 58.* [example numbers]<br>(a) Tap the hopper most likely to survive the storm.<br>(b) Tap the hopper least likely to survive. | (a) 58 (b) 29 | 2 | Tapping the middle value: thinks "average is safest". Mixing (a) and (b): misread the question. | A ii |
| 6 | Misconception | Who's right? | A herd of snow hoppers now has thicker coats than the herd that lived there 20 generations ago.<br>**Kai:** "The hoppers needed to keep warm, so their coats grew thicker."<br>**Lena:** "Hoppers born with thick coats lived longer and had more young."<br>**Omar:** "Each hopper's coat got a little thicker every winter of its life."<br>**Priya:** "The cold made all the hoppers' coats thicker at the same time."<br>Reason: Thick coats were already there in some hoppers, and those hoppers left more young / Needing warmth is what makes an animal's coat grow thicker / Cold weather slowly thickens the coat of every animal in it | Lena; "already there in some hoppers, and those hoppers left more young" | 2 | Kai: M2. Omar: M1. Priya: the environment directly changes bodies (M1). | A ii |
| 7 | Recall | Fill the gaps | The differences between individuals in a population are called ______. Young ______ features from their parents. When individuals that fit the environment survive more often and have more young, it is called natural ______. | variation; inherit (accept get, take after → "the science word is inherit"); selection | 3 | "Adaptation" in gap 1: mixes the feature with the differences. | A i |
| 8 | Produce | Explain it | A population of beetles lives on dark rock. Some beetles are dark and some are pale. Birds eat the beetles they can see. Explain what will happen to the population over many generations.<br>**Words to use:** variation, survive, inherit, natural selection, population | Model: "There is variation in the beetles: some are dark and some are pale. Birds see the pale beetles more easily on dark rock, so dark beetles survive more often and have more young. The young inherit the dark colour. Over many generations most of the population will be dark. This is natural selection. No single beetle changes colour."<br>Checklist: ☐ Says there is **variation** in colour at the start. ☐ Says dark beetles **survive** more often because birds cannot see them. ☐ Says the young **inherit** the dark colour. ☐ Says the **population** changes over many generations. ☐ Uses **natural selection** correctly. ☐ Does not say a beetle changes its own colour or changes because it needs to. | 6 | n/a | A ii |

Type check: put in order, read it, answer and reason, always/sometimes/never (sort), tap the moment, who's right, fill the gaps, explain = 8 types. Misconception: Q3, Q6. Observe: Q2, Q5. Produce: Q8. No choose-one questions. No two of the same type in a row. *How sure are you?* on Q3.

### Question plan · Foundation

| Key idea or misconception | Type | Where |
|---|---|---|
| Variation: individuals differ | prediction, reading table, read it, key idea box | Learn 1 |
| | sort, tap the moment, fill the gaps, explain | Check 4, 5, 7, 8 |
| No individual changes during its life | prediction, inline readings, choose the words, tap the sentence, key idea box | Learn 2 |
| | answer and reason | Learn 5 |
| | answer and reason (How sure), sort, who's right, explain | Check 3, 4, 6, 8 |
| Features that fit survive more often | prediction, reading table, read it, key idea box | Learn 3 |
| | tap the moment, put in order | Check 5, 1 |
| Inheritance | prediction, reading table, choose the words, who's right, key-word gap | Learn 4 |
| | fill the gaps, sort, put in order | Check 7, 4, 1 |
| Natural selection changes the population over generations | sketch the graph, reading table, put in order, key idea box | Learn 5 |
| | put in order, read it, explain | Check 1, 2, 8 |
| M1 an animal changes its own body | Learn 2 (all), Learn 5 (answer and reason) | Check 3, 6, 8 |
| M2 animals adapt because they need to | Learn 3 (answer and reason), Learn 4 (who's right), Learn 5 | Check 3, 4, 6, 8 |
| M8 all the same | Learn 1 | Check 5, 7 |
| M9 changes to a parent are passed on | Learn 4 | Check 4 |
| Data skill: collect readings in a table | reading tables | Learn 1, 3, 4, 5; Check 2 |

Every run in Learn is followed by an observation question (read it or choose the words) before any reason or explain question (steps 2, 3, 4, 5).

### Worksheet · Foundation
Name, class and date. The student's four tables in blue: five coats (step 1), died of cold against still alive (step 3), three families (step 4) and average coat at generations 0 to 20 (step 5), with their sketched prediction beside the real trait line. Their answers to Check questions 1 to 8 in the compact two-column layout, with the picture for question 5. A feedback page shows points per question (24) and any answer marked "Certain" that was wrong. Blank template and answer key in the same layout; the key prints the fixed-seed numbers and marks Q2 as "students' own readings".

---

## Extension · Twenty generations of data (approx. 29 min)

### Key ideas
1. Scientists show change over time with a **table** and a **line graph**. A good graph has a title, labelled axes and evenly spaced numbers.
2. Natural selection has **no goal**. Which features do better depends on the environment.
3. Natural selection needs **variation**. With no differences to choose between, a population cannot change.
4. A **CER** answers a question with a claim, evidence (your own numbers) and reasoning (the science).

### Misconceptions targeted
- **M3 "Evolution means getting bigger, stronger or better."** Learn step 4, Check questions 2 and 7.
- **M2 "Animals adapt because they need to."** Learn steps 5 and 6, Check questions 3, 5 and 7.
- **M1 "An animal changes its own body."** Learn step 6, Check questions 3 and 7.

### Vocabulary, in the order it is introduced
data → table → line graph → axis → trend → claim → evidence → reasoning

### Learn steps

**Step 1 · Plan your table (approx. 4 min)** · Screens: Evolution Lab, Journal table maker

> You are going to run the snow hoppers again and collect your own **data**. Data means the numbers you record. First, make somewhere to put it.

Prediction (locks first): **Sketch the graph.** "Deaths from cold in every 5 generations": set a dot for generations 5, 10, 15 and 20. *(Checked later by shape: "falls".)*

Do this:
1. Open the Journal and press **New table**. Give it the title "Snow hoppers in the tundra".
2. Add three headings: **Generation**, **Average coat thickness**, **Deaths from cold (last 5 generations)**. *(Quick-heading chips are offered.)*
3. Type 0, 5, 10, 15 and 20 down the Generation column.

Your turn:
- **Choose one:** *Why do we write the generation in the first column?* "It is the thing we chose to change step by step" ✔ · "It is the thing we are trying to find out" · "It is always the biggest number in the table". 

**Step 2 · Collect your data (approx. 6 min)** · Screens: Evolution Lab, era report, Journal

> Run the hoppers for 20 generations. The lab will pause every 5 generations. At each pause, read two numbers from the era report and type them into your table.

Do this:
1. Read the average coat thickness at generation 0 from the scene panel and type it in. (There are no deaths yet, so type 0 for deaths.)
2. Press **Run 5 generations**. At the pause, type the **average coat thickness** and the **deaths from cold** in the right row. Do this four times. *(Each cell is checked against the student's own run, within 1. Wrong: "Look again at the era report. Copy the number exactly.")*

Your turn:
- **Read it:** "In which 5 generations did the most hoppers die of cold?" (drop-down: 1–5, 6–10, 11–15, 16–20; checked against their table)

**Step 3 · Draw your graph (approx. 7 min)** · Screen: graph maker

> A table holds the numbers. A **line graph** shows the pattern. Turn your table into a graph of average coat thickness.

Do this (the graph maker's checklist ticks each one):
1. Choose your table. Pick **Generation** for along the bottom and **Average coat thickness** for up the side.
2. Choose the graph with **numbers along the bottom**.
3. Write a title and label both **axes**.
4. Set the numbers on each axis, or press **Suggest numbers for me**.
5. Drag each of your five points onto the graph. Green rings show the ones in the right place.
6. Switch on **Join the points**.

Your turn:
- **Choose the words:** "As the generations go by, the average coat thickness (rises / stays level / falls). The line is steepest (near the start / in the middle / near the end)." (second drop-down checked against their data)
- **Key idea box:**
  > **Key idea: the overall direction of a graph is called its trend.** We describe a trend by saying what goes up or down as something else changes.

  Question: *Tap the best description of a trend.* "As the generations go by, coat thickness rises." ✔ · "At generation 10, coat thickness is 55." · "Coat thickness is on the side axis."

Hint ladder for job 5: (1) "Find the generation along the bottom first, then go up to the coat thickness." (2) Dotted guide lines appear from the two axes for the first point. (3) The first point is placed; the student does the rest.

**Step 4 · Same hoppers, warm forest (approx. 5 min)** · Screen: Evolution Lab

> People often say evolution makes animals "better". Test it. Put the same 20 snow hoppers in the temperate forest, where a thick coat costs energy and is not needed.

Prediction (locks first): "In the warm forest, the average coat thickness will…" rise, because thicker is better · fall, because thick coats are a waste here · stay level, because the hoppers are the same.

Do this:
1. Switch the biome to **Temperate forest** and press **Run 5 generations** four times.
2. Type the average coat thickness at generation 0 and at generation 20. *(Reading table, 2 rows)*

Your turn:
- **Read it:** "Did the average go up or down in the forest?" (checked against their readings)
- **Key idea box:**
  > **Key idea: natural selection has no goal.** A feature is only "good" in an environment where it helps. Change the environment and a different feature does better.

  Question: *Which sentence is true?* "A thick coat helps in the tundra but wastes energy in a warm forest" ✔ · "A thick coat is the better coat, so it spreads in every biome" · "A thick coat spreads wherever the hoppers want to be warm". (M3, M2.)

**Step 5 · The copy herd (approx. 4 min)** · Screen: Evolution Lab with the **Copy herd** switch

> Here is a strange herd. All 20 hoppers are exact copies, with coat thickness 40, and every young one is an exact copy too. There is no variation at all. They are back in the freezing tundra, and they badly need thicker coats.

Prediction (locks first): "After 20 generations, the copy herd's average coat thickness will be…" higher, because they need it · the same, because there is nothing to select · lower, because copies are weak.

Do this:
1. Switch on **Copy herd** and press **Run 5 generations** four times (or until the herd dies out).
2. Type the average coat thickness at the start and at the end. *(inline answer boxes)*

Your turn:
- **Answer and reason:** "Did needing thicker coats make the coats thicker?" Yes / No. Reason: "With no variation there were no thicker coats to survive and be passed on" ✔ · "The copy herd did not need thicker coats as much as the first herd" · "The copy herd did not have enough time to grow thicker coats". (M2, M1.)
- **Key-word gap:**
  > **Key idea: natural selection can only work when there is ______ in a population.** *(variation; accepts differences → "the science word is variation")*

**Step 6 · Your first CER (approx. 5 min)** · Screens: CER writer, Journal

> Scientists answer a question in three parts. A **claim** is your answer. **Evidence** is the numbers that back it up. **Reasoning** is the science that explains why. Use your own table.

This is **CER stage 2: pick, fill, pick**, exactly as written in `CER_Scaffold.md` (section 3, stage 2): the question "What happened to coat thickness in your snow hopper population over 20 generations, and why?", pick the claim, fill four evidence gaps with their own numbers, pick the reasoning. Claim 1, evidence 4, reasoning 1 = 6 points, one go for each part. After the check, the full model CER appears with the student's own numbers in it.

### Challenge (optional) · Leggy or low? (approx. 6 min)

> Choose **one** other trait of the snow hopper: ear size, leg length or body size. Predict which way it will go in the tundra over 20 generations. Then find out, with a table and a graph.

Live goals:
- Lock a prediction (up, down or level) for your chosen trait.
- Make a table with at least four rows of your own readings.
- Make a line graph with every checklist item green.
- Write one sentence that describes the trend.

Debrief shows the reason for that trait ("Small ears lose less heat, so ear size fell").

### Check · Extension (8 questions, 25 points, approx. 11 min)

| # | Purpose | Type | Question and options | Answer, model answer or checklist | Pts | What each wrong option shows | Strand |
|---|---|---|---|---|---|---|---|
| 1 | Organise | Complete the table (trend grid) | Snow hoppers live in the tundra for 20 generations. For each row choose **gets bigger / stays the same / gets smaller**.<br>Rows: Average coat thickness of the population · Number of hoppers dying of cold each generation · Coat thickness of one hopper during its life | bigger; smaller; stays the same | 3 | Row 3 "gets bigger": M1. Row 2 "gets bigger": has not linked thick coats to fewer cold deaths. | A ii |
| 2 | Observe · predict | Sketch the graph | The same snow hoppers are moved to a **hot desert** and survive. Sketch the average coat thickness over 20 generations (dots at 0, 5, 10, 15, 20). | Feature checks: starts at the starting value; falls overall; does not rise at any point | 3 | A rising line: M3, "thicker is better everywhere". A flat line: thinks only cold can cause selection. | A ii |
| 3 | Misconception | Spot the mistake | Sam explained his graph. One line is wrong. Tap it, then fix it.<br>1. "The average coat thickness was 40 at generation 0."<br>2. "It was 68 at generation 20."<br>3. "The hoppers needed thicker coats, so they grew them."<br>4. "Deaths from cold went down as coats got thicker."<br>Fix: "Hoppers born with thicker coats survived more often and had more young" / "Hoppers grew thicker coats a little at a time, year by year" / "Hoppers with thin coats learned to grow thicker ones" | Line 3; "born with thicker coats survived more often and had more young". Shown after: "Needing a feature cannot make it grow. The thin-coated hoppers needed it too, and they died." | 2 | "A little at a time, year by year": M1. "Learned to grow": M2 and M7. | A iii |
| 4 | Maths | Calculate | In one run the average coat thickness was 41 at generation 0 and 67 at generation 20. *[example numbers]* By how much did the average change? | 67 − 41 = 26. *Need a clue?* "To find a change, take the starting number away from the final number." | 1 | 108: added instead of subtracting. | A ii |
| 5 | Misconception · *How sure are you?* | Answer and reason | A herd of 20 fish are exact copies of each other, and all their young are exact copies too. The water slowly gets colder. What happens to their bodies over 20 generations?<br>Answer: They stay the same / They slowly suit the cold better / They quickly suit the cold better<br>Reason: With no variation, no fish is any better suited to be selected / Animals in a cold place slowly change to suit the cold / Animals that need to change the most change the fastest | Stay the same; "no variation…" | 2 | "Slowly suit" + "slowly change": M1. "Quickly" + "need … change fastest": M2. | A ii |
| 6 | Observe | Tap the moment | *Line graph: average leg length of desert lizards over 20 generations, rising from 30 to 62, flat between generations 10 and 15.* [example numbers]<br>(a) Tap the part of the line where leg length did **not** change.<br>(b) Tap the point at generation 20. | (a) the flat part, generations 10–15 (b) the last point | 2 | Tapping the steepest part for (a): reads "steep" as "no change". | A iii |
| 7 | Misconception | Tick all that apply | Tick every true statement about natural selection.<br>☐ It needs variation in the population. ✔<br>☐ It changes populations over many generations. ✔<br>☐ It always makes animals bigger and stronger.<br>☐ It gives animals the features they need.<br>☐ The same feature can help in one biome and harm in another. ✔<br>☐ It changes one animal during its life. | The three ticked | 2 (−1 per mistake) | "Bigger and stronger": M3. "Gives … they need": M2. "One animal during its life": M1. | A i |
| 8 | Produce | Build it and explain it (graph maker + sentence) | *Table: Generation 0, 5, 10, 15, 20 · Average ear size of snow hoppers 52, 45, 39, 35, 33.* [example numbers]<br>(a) Make a line graph of this table in the graph maker.<br>(b) Write one sentence that describes the trend. **Words to use:** generations, ear size, falls | (a) Graph checks, 1 each: numbers-along-the-bottom graph chosen; title; x label; y label; data fits the axes; all five points plotted; every point in the right place (7).<br>(b) Model: "As the generations go by, the average ear size falls." Checklist: ☐ Says what happens to **ear size**. ☐ Says it happens as the **generations** go by. ☐ Uses **falls** or a word that means the same. (3) | 10 | Bar graph chosen: has not linked "change over time" to a line graph. | A iii |

Type check: table, sketch, spot the mistake, calculate, answer and reason, tap the moment, tick all, build and explain = 8 types. Misconception: Q3, Q5, Q7. Observe: Q2, Q6. Produce: Q8. No choose-one questions. No two of the same type in a row. *How sure are you?* on Q5.

### Question plan · Extension

| Key idea or misconception | Type | Where |
|---|---|---|
| Data skill: record own data in a table | table maker jobs, typed cells, read it | Learn 1, 2 |
| Data skill: plot a line graph | graph maker checklist | Learn 3 |
| | build it | Check 8 |
| Data skill: describe a trend | choose the words, key idea box | Learn 3 |
| | tap the moment, explain | Check 6, 8 |
| Natural selection has no goal; it depends on the environment | prediction, reading table, key idea box | Learn 4 |
| | sketch the graph, tick all | Check 2, 7 |
| Selection needs variation | prediction, readings, answer and reason, key-word gap | Learn 5 |
| | answer and reason (How sure), tick all | Check 5, 7 |
| CER stage 2 | pick, fill, pick | Learn 6 |
| M1 an animal changes its own body | Learn 5, Learn 6 (reasoning options) | Check 1, 5, 7 |
| M2 animals adapt because they need to | Learn 4, 5, 6 | Check 3, 5, 7 |
| M3 bigger, stronger, better | Learn 4 | Check 2, 7 |
| Maths: finding a change by subtracting | shown in Learn 2 feedback ("from 40 to 46 is a change of 6"), practised in Learn 4 | Check 4 |

Every run in Learn is followed by an observation question before any reason question (steps 2, 4, 5).

### Worksheet · Extension
Name, class and date. The student's own table and line graph (the graph maker picture without the rings), their forest and copy-herd readings, and their finished CER with the three parts labelled. Their answers to Check questions 1 to 8 in the compact layout, with their graph for question 8. A feedback page shows points per question (25), the CER points (6) and any "Certain" answer that was wrong. Blank template and answer key in the same layout; the key prints the model graph and lists the graph checks.

---

## Time estimate

| Section | Learn | Challenge (optional) | Check | Notes |
|---|---|---|---|---|
| Foundation | approx. 28 min | approx. 6 min | approx. 10 min | Learn and Check together are about 38 min: two sittings for most students, or set Learn as classwork and the Check as homework. |
| Extension | approx. 29 min (the graph maker is the slow part the first time) | approx. 6 min | approx. 11 min | As above. |

If each section must fit one 25-minute sitting including the Check, the first cuts are Foundation step 4's third family (two families is enough) and Extension step 5 (move the copy herd to the Challenge).

## Questions for Tom
1. **Winter coats.** Real hares grow a thicker coat each winter. Step 2 says a hopper "keeps the coat it was born to grow". Is that honest enough for Grade 6, or should the trait be renamed "winter coat thickness"?
2. **"Sometimes" in Check question 4.** "An animal with a helpful feature survives the winter" is marked *sometimes*, to teach that selection is about chances. Is that too subtle for Grade 6?
3. **The copy herd** (Extension step 5) is not found in nature for hares. Are you happy with a clearly made-up herd to show that selection needs variation?
4. **Mutation** is not mentioned. Variation is simply "already there". Do you want one sentence on where new variation comes from, or leave it for Grade 8?
5. **Strand tags.** The data items here (tables, graphs, trends, the CER) fit Criterion C better than A iii. They are tagged A for now, until you confirm the Year 1 Criterion C wording.
6. Should the Check use the word **"selected"**, or keep to "survive more often and have more young"?
