# Sparks Through Time: retrieval content catalogue

Status: signed off by Tom on 4 November 2026. Ready to turn into the build spec. It follows `Sparks_Retrieval_Plan.md` and the current build of `sparks-through-time/Sparks-Through-Time.html`.

Teacher document. Strand tags, the words "Objective C" and "Objective D", and build notes are for you and the builder. Students see only the card text, questions, prompts, passages, model answers and checklists.

## Decisions (Tom, 4 November 2026)

1. **Class sets are four short questions and a paragraph.** Five and a paragraph was too much.
2. **Class sets cover only what the sim teaches,** with one exception: each has one investigation-skill question, because you asked for more Bootcamp practice. That is 12 of the 48 short questions.
3. **Greenhouse effect, plugs and fuses are out.** The sim doesn't teach them.
4. **V = I × R, percentages, frequency, kWh, transformer sums and CO₂ sums are sim only.** They stay out of class sets.
5. **There is no lab in the electricity unit.** That leaves 12 sets. The lesson sequence document still lists the lab.
6. **Add potassium and calcium** to the element card in the retrieval build.
7. **Induction appears in the sim.** See the build list in section 8.
8. **Core and mass fixes are done** in the build, and the two bell ringers now say "because opposite charges attract".

**Claude's calls, as you asked**

- **Conductors and bulbs.** Neither has a lesson. In the sim they sit either side of Generators, so they join the sets from S06, after Lesson 9.
- **VOCAB.** Voltage, ion and voltmeter are added, because the sim uses them and tests them. Sustainable and energy storage are dropped, because the sim never teaches them. Energy transfer stays, because the sim says "transfers" throughout. That makes 81 word cards.
- **Question cards.** Two cards covered ideas the sim doesn't teach (what you rub to make static, and "static discharge"), so they are removed. That makes 58.
- **Time Test data sheet stays.** Students see the element card, ladder and triangle on screen, so the paper matches. It is one setting to remove.

## What shaped these choices

**The lesson sequence and the sim run in a different order.** Class sets follow the lessons. Reviews and the Time Test use the sim's stops.

| Lesson | Sim stops it matches |
|---|---|
| 1 What is Electricity? / Circuits intro | What is electricity?; Atoms and atomic models |
| 2 Static Electricity | Electric charge and static electricity |
| 3 Current Electricity | Current electricity and circuits |
| Series & Parallel Circuits | Series and parallel circuits |
| 8 Electromagnets | Magnets and electromagnets |
| 9 Generators | Turbines and generators |
| 10 AC/DC | AC and DC |
| 11 Renewable Energy Sources | How electricity is produced; LED lighting and renewable energy |
| No lesson | How bulbs work, energy and LEDs; Conductors, insulators, resistance and semiconductors. Both join the sets from S06. |

**Gravity.** No Sparks calculation needs g. Electromagnet loads stay in kg, as mass, because Grade 6 doesn't calculate weight. If you ever want a crane question in newtons, use g = 9.8 N/kg: a 1,700 kg load has a weight of 1,700 × 9.8 = 16,660 N. This is left out unless you ask for it.

**Velocity.** You prefer "velocity" to "speed". A spinning generator has no good velocity wording, so these items say "turns each second" and "faster", and avoid the noun "speed".

## 1. Flashcards

81 word cards and 58 short question cards, grouped by `s.topic`. Of the original 80 words, 45 matched a `GLOSSARY` entry by name, 6 match under another name (aliases), 27 had no definition and now have one, and 2 are dropped. That clears all 35 flagged in the plan. Voltage, ion and voltmeter are added from the glossary. Induction will appear on screen in the retrieval build (section 8). Question card numbers skip Q16 and Q19, which were removed.

**Build note.** When adding the new entries and aliases, give these 14 common words a "no underline" flag, or they will be underlined all over the sim (for example "model answer"): battery, cell, coil, core, element, lightning, magnet, model, negative, nuclear, positive, shell, static, switch. They appear on flashcards and in the Vocab list only. A word listed under two stops joins either deck.

### Word cards

**What is electricity?**

| Word | Back of the card | Fix |
|---|---|---|
| static electricity | Electric charge that builds up on an object and stays put, until it jumps as a spark. | ✓ |
| current electricity | Electric charge that keeps flowing around a path, like in a flashlight or a laptop. | ✓ |
| charge *(also Electric charge and static electricity)* | A property of tiny particles that makes them push or pull on each other. It comes in two kinds: positive (+) and negative (−). | ✓ |
| positive *(also Electric charge and static electricity)* | One of the two kinds of charge, shown with +. Protons are positive. An object that loses electrons becomes positive. | new |
| negative *(also Electric charge and static electricity)* | One of the two kinds of charge, shown with −. Electrons are negative. An object that gains electrons becomes negative. | new |
| neutral | Having no overall charge: the positive and negative charges are equal and cancel out. | ✓ |
| attract *(also Electric charge and static electricity)* | Pull towards each other. Opposite charges attract. | ✓ |
| repel *(also Electric charge and static electricity)* | Push away from each other. Like (the same) charges repel. | ✓ |

**Atoms and atomic models**

| Word | Back of the card | Fix |
|---|---|---|
| atom | The tiny building block that everything is made of: a nucleus with electrons around it. | ✓ |
| element | A substance made of just one kind of atom, such as gold or carbon. | new |
| proton | A particle with a positive charge, found in the nucleus of an atom. | ✓ |
| neutron | A particle with no charge, found in the nucleus of an atom. | ✓ |
| electron *(also Electric charge and static electricity)* | A tiny particle with a negative charge. Electrons move around the outside of an atom, and a flow of electrons is an electric current. | ✓ |
| nucleus | The tiny, heavy centre of an atom, made of protons and neutrons. | ✓ |
| shell | A layer around the nucleus where electrons travel. | new |
| atomic number | The number of protons in an atom. It tells you which element it is. | ✓ |
| mass number | The number of protons plus neutrons in an atom. | ✓ |
| model | A simple picture or idea that explains something we can’t easily see. Scientists change it when new evidence appears. | new |
| ion | An atom that has gained or lost electrons, so it has an overall charge. | added to `VOCAB` |

**Electric charge and static electricity**

| Word | Back of the card | Fix |
|---|---|---|
| static | Electric charge that builds up on an object and stays put, until it jumps as a spark. | alias of “static electricity” |
| lightning | A giant spark of static electricity, usually between a storm cloud and the ground. | new |
| lightning rod | A pointed metal rod on a building, joined by a copper wire to the ground, so lightning flows safely into the ground. | ✓ |

**Current electricity and circuits**

| Word | Back of the card | Fix |
|---|---|---|
| cell | A single unit that pushes charge around a circuit. Each cell in this lab gives 1.5 V. | new |
| battery | Two or more cells joined together. People often call a single cell a battery too. | new |
| circuit | A complete loop that electricity can flow around. | ✓ |
| complete circuit | A loop with no gaps, so current can flow all the way round. | new |
| switch | A part that opens or closes a gap in a circuit, to turn it off or on. | new |
| current *(also Series and parallel circuits)* | A flow of electric charge around a circuit, measured in amps (A). | ✓ |
| ammeter *(also Series and parallel circuits)* | A meter that measures current, in amps (A). | ✓ |
| amp (A) | The unit of current (A). | alias of “amp” |
| volt (V) | The unit of voltage. More volts means a bigger push. | new |
| circuit symbol | A simple drawing that stands for a part of a circuit. Scientists everywhere use the same symbols. | new |
| short circuit | A shortcut, usually a plain wire, that lets electricity skip the parts in a circuit. The wires can get dangerously hot. | ✓ |
| voltage | The push that makes charge flow around a circuit, measured in volts (V). | added to `VOCAB` |
| voltmeter | A meter that measures voltage, in volts (V). | added to `VOCAB` |

**Magnets and electromagnets**

| Word | Back of the card | Fix |
|---|---|---|
| electromagnet | A coil of wire that becomes a magnet when current flows through it, and can be switched off. | ✓ |
| coil *(also Turbines and generators)* | Wire wound round and round in loops. | new |
| core | The material inside a coil. An iron core makes an electromagnet much stronger. | new |
| magnetic field | The area around a magnet where its force can be felt. | ✓ |
| independent variable | The one thing you change in a fair test. | new |
| dependent variable | The thing you measure in a fair test. | new |
| controlled variable | Something you keep the same in a fair test. | new |

**Conductors, insulators, resistance and semiconductors**

| Word | Back of the card | Fix |
|---|---|---|
| resistance | How much a part of a circuit slows down the current, measured in ohms (Ω). | ✓ |
| ohm (Ω) | The unit of resistance (Ω). | alias of “ohm” |
| conductor | A material that lets electricity flow through it easily, such as copper. | ✓ |
| insulator | A material that hardly lets electricity flow through it, such as plastic or rubber. | ✓ |
| semiconductor | A material in between a conductor and an insulator, such as silicon. How well it conducts can change, for example with light or heat. | ✓ |
| resistor | A part that adds resistance to a circuit, so less current flows. | ✓ |
| LED *(also How bulbs work, energy and LEDs)* | Light-emitting diode: a small, very efficient light that only lets current flow one way. | ✓ |
| V = I × R | The rule that links voltage (V), current (I) and resistance (R). Voltage equals current times resistance. | new |

**Turbines and generators**

| Word | Back of the card | Fix |
|---|---|---|
| generator *(also How electricity is produced)* | A machine that turns movement into electricity by spinning magnets and coils of wire. | ✓ |
| turbine *(also How electricity is produced)* | A wheel with blades that is spun by wind, water or steam to turn a generator. | ✓ |
| induction | Making a voltage in a wire by moving a magnet near it. | new |
| magnet | An object that pulls on iron and steel. It has a north pole and a south pole. | new |
| alternating current | Current that keeps changing direction, back and forth, many times a second. Mains electricity is AC. | ✓ |

**How bulbs work, energy and LEDs**

| Word | Back of the card | Fix |
|---|---|---|
| filament | The thin wire in an old-style bulb that gets so hot it glows. | ✓ |
| energy transfer | Energy moving from one form to another, such as electrical energy to light and heat. | new |
| useful energy | The energy that does the job we want, such as light from a lamp. | new |
| wasted energy | Energy that doesn’t do the job we want. It is often heat that spreads into the surroundings. | new |
| Sankey diagram | A diagram that shows where energy goes, using arrows whose width shows how much energy. | ✓ |
| efficiency | How much of the energy put in comes out as useful energy, usually given as a percentage. | ✓ |

**Series and parallel circuits**

| Word | Back of the card | Fix |
|---|---|---|
| series circuit | A circuit with only one path, so the same current flows through every part. | ✓ |
| parallel circuit | A circuit with more than one path (branch), so each branch can be switched on or off by itself. | ✓ |
| branch | One of the separate paths in a parallel circuit. | ✓ |
| junction | A point where a circuit splits into branches or joins back together. | ✓ |

**AC and DC**

| Word | Back of the card | Fix |
|---|---|---|
| alternating current (AC) | Current that keeps changing direction, back and forth, many times a second. Mains electricity is AC. | alias of “alternating current” |
| direct current (DC) | Current that flows one way only, like from a battery. | alias of “direct current” |
| frequency | How many times something happens each second, measured in hertz (Hz). | ✓ |
| hertz (Hz) | The unit of frequency. 1 Hz means one complete cycle every second. | new |
| transformer | A device that changes the voltage of AC electricity, up for long-distance power lines and down for homes. | ✓ |
| oscilloscope | A screen that draws a graph of voltage as time goes on, so you can see how electricity changes. | new |
| mains | The electricity that comes to the sockets in our walls. In Beijing it is 220 V AC at 50 Hz. | new |

**How electricity is produced**

| Word | Back of the card | Fix |
|---|---|---|
| fossil fuel *(also LED lighting and renewable energy)* | Coal, oil or gas: fuels formed from ancient plants and animals. Burning them releases CO₂. | ✓ |
| renewable *(also LED lighting and renewable energy)* | An energy source that won’t run out, like sunlight, wind, rivers and tides. | ✓ |
| non-renewable | An energy source that will run out one day, like coal, oil and gas. | ✓ |
| carbon dioxide (CO₂) | Carbon dioxide: a greenhouse gas released when fuels are burned. Too much of it warms the planet. | alias of “CO₂” |
| nuclear | Power that comes from splitting uranium atoms to release heat. | new |
| geothermal | Heat from deep underground, used to make steam that turns turbines. | ✓ |
| biomass | Plant material (like wood or crop waste) burned to make heat or electricity. | ✓ |

**LED lighting and renewable energy**

| Word | Back of the card | Fix |
|---|---|---|
| demand | How much electricity people need at a given time. | ✓ |
| battery store | A large set of batteries that saves spare electricity and gives it back when it’s needed. | ✓ |

### Question cards

**What is electricity?**

| Card | Question | Answer |
|---|---|---|
| Q01 | What are the two kinds of electric charge? | Positive and negative. |
| Q02 | What do two like charges do? | They repel (push apart). |
| Q03 | Why does a rubbed balloon pick up tiny bits of paper? | A charged object can attract a neutral object. |
| Q04 | What does a flashlight need to shine? | A battery with energy, a closed switch and a complete loop. |

**Atoms and atomic models**

| Card | Question | Answer |
|---|---|---|
| Q05 | Which two particles are in the nucleus? | Protons and neutrons. |
| Q06 | Which particle moves around outside the nucleus? | The electron. |
| Q07 | Democritus called the smallest piece “atomos”. What does it mean? | Uncuttable. |
| Q08 | Who found the electron, and when? | J.J. Thomson, in 1897. |
| Q09 | What did Rutherford’s gold foil show? | Atoms are mostly empty space, with a tiny positive nucleus. |
| Q10 | Who put electrons into shells? | Niels Bohr, in 1913. |
| Q11 | How many electrons fit in the first two shells? | Up to 2 in the first and up to 8 in the second. |
| Q12 | Why do scientists change a model of the atom? | New evidence doesn’t fit the old model. |

**Electric charge and static electricity**

| Card | Question | Answer |
|---|---|---|
| Q13 | When two materials are rubbed, which particles move? | Only electrons. |
| Q14 | An object gains electrons. What charge does it get? | Negative. |
| Q15 | An object loses electrons. What charge does it get? | Positive. |
| Q17 | Who showed that lightning is electricity, and when? | Benjamin Franklin, in 1752. |
| Q18 | Our word “electricity” comes from the Greek word for what? | Amber. |

**Current electricity and circuits**

| Card | Question | Answer |
|---|---|---|
| Q20 | What is the golden rule of circuits? | Current needs a complete loop. |
| Q21 | Who built the first battery, and when? | Alessandro Volta, in 1800. |
| Q22 | Which way do electrons move in a wire? | From the − end of the cell, round to the + end. |
| Q23 | What does a voltmeter measure? | Voltage, in volts (V). |
| Q24 | What does a plain wire across a bulb do? | It makes a short circuit, so the bulb goes out. |
| Q25 | What happens when you add a second cell facing the same way? | The pushes add up, so the bulb gets brighter. |

**Magnets and electromagnets**

| Card | Question | Answer |
|---|---|---|
| Q26 | What did Ørsted notice in 1820? | A wire carrying current made a compass needle swing. |
| Q27 | Name three ways to make an electromagnet stronger. | More coils, more cells and an iron core. |
| Q28 | What happens to an electromagnet when you switch it off? | It stops being a magnet. |
| Q29 | Why does a scrapyard crane use an electromagnet? | It can be switched off to drop the load. |
| Q30 | Which metals does an electromagnet pick up? | Magnetic metals, such as iron and steel. |

**Conductors, insulators, resistance and semiconductors**

| Card | Question | Answer |
|---|---|---|
| Q31 | Why do metals conduct electricity? | They have free electrons that can move. |
| Q32 | Why are wires coated in plastic? | Plastic is an insulator, so it keeps us safe. |
| Q33 | What does a bigger resistance do to the current? | It makes the current smaller. |
| Q34 | What is special about an LED? | Current can only flow through it one way. |
| Q35 | Which material is a semiconductor? | Silicon. |

**Turbines and generators**

| Card | Question | Answer |
|---|---|---|
| Q36 | What did Faraday discover in 1831? | A moving magnet near a coil makes electricity flow. |
| Q37 | What does a still magnet in a coil make? | No current at all. |
| Q38 | Name three ways to get a bigger voltage from a generator. | Spin it faster, add turns of wire, use a stronger magnet. |
| Q39 | How is a generator different from a motor? | A generator turns movement into electricity. A motor does the opposite. |
| Q40 | Why does a spinning generator make AC? | The magnet keeps flipping, so the current keeps changing direction. |

**How bulbs work, energy and LEDs**

| Card | Question | Answer |
|---|---|---|
| Q41 | What gets used up in a circuit? | Energy. The current stays the same all the way round. |
| Q42 | Why does a filament glow? | Its big resistance makes it so hot that it glows. |
| Q43 | Why is there no oxygen inside a filament bulb? | The hot filament would burn up. |
| Q44 | Why do LEDs save energy? | They waste much less energy as heat. |
| Q45 | What runs out when a battery goes flat? | Its stored chemical energy. |

**Series and parallel circuits**

| Card | Question | Answer |
|---|---|---|
| Q46 | One bulb breaks in a series circuit. What happens? | All the bulbs go out. |
| Q47 | What is the current like in a series circuit? | The same everywhere. |
| Q48 | What happens to current at a junction? | It splits between the branches. |
| Q49 | Why are the lights in a home wired in parallel? | Each light can be switched by itself and gets the full voltage. |
| Q50 | You add a bulb in series. What happens to the others? | They all get dimmer. |

**AC and DC**

| Card | Question | Answer |
|---|---|---|
| Q51 | Who backed AC in the War of the Currents? | Nikola Tesla and George Westinghouse. |
| Q52 | What do sockets in Beijing give? | 220 V AC at 50 Hz. |
| Q53 | What kind of current does a battery give? | DC. |
| Q54 | What does AC look like on an oscilloscope? | A wave above and below the middle line. |
| Q55 | Why was AC better for long distances? | Transformers raise its voltage, so less energy is wasted as heat. |

**How electricity is produced**

| Card | Question | Answer |
|---|---|---|
| Q56 | What does almost every power station spin? | A turbine that turns a generator. |
| Q57 | Which common source makes electricity with no turbine? | Solar panels. |
| Q58 | Which source releases the most CO₂ per kWh? | Coal, at about 820 g. |

**LED lighting and renewable energy**

| Card | Question | Answer |
|---|---|---|
| Q59 | When is the evening peak? | Around 6 to 8 pm. |
| Q60 | What does a battery store do? | It saves spare electricity and gives it back later. |

## 2. Question families

32 families for the sim (two or three per stop) and 1 class-only family. Every family has two directions of asking. "Form" uses question types the build already has, so no new type is needed. Strands are teacher-only.

### Which family fills which Review slot

| Stop | Apply (slot 3) | Calculate (slot 4) | Predict or diagnose (slot 5) |
|---|---|---|---|
| What is electricity? | F2, F1 A | none, so use Apply | F1 B |
| Atoms | F4, F5 A | F3 | F5 B |
| Static | F6 | F7 | F8 |
| Circuits | F11 | F10 | F9 |
| Electromagnets | F14 | F13 | F12 |
| Conductors and resistance | F17 | F15 | F16 |
| Generators | F18 B | F19 | F18 A |
| Bulbs and energy | F21 | F20 | F22 |
| Series and parallel | F24 B | F23 | F24 A |
| AC and DC | F25 | F26 | F27 |
| Producing electricity | F28 A, F29 | F30 | F28 B |
| Renewables | F32 A | F31 | F32 B |

**Challenge modes.** The crane sums in F13, the bulb swap in F20 and the transformer ratio in F27 are taught only in the Challenge sections. They appear only after that stop's Challenge stamp.

**Rounding.** Use `Math.round`. No item may land on an exact half.

### Data the families need

| Element | Atomic number | Mass number | Neutrons |
|---|---|---|---|
| Hydrogen (H) | 1 | 1 | 0 |
| Helium (He) | 2 | 4 | 2 |
| Lithium (Li) | 3 | 7 | 4 |
| Beryllium (Be) | 4 | 9 | 5 |
| Boron (B) | 5 | 11 | 6 |
| Carbon (C) | 6 | 12 | 6 |
| Nitrogen (N) | 7 | 14 | 7 |
| Oxygen (O) | 8 | 16 | 8 |
| Fluorine (F) | 9 | 19 | 10 |
| Neon (Ne) | 10 | 20 | 10 |
| Sodium (Na) | 11 | 23 | 12 |
| Magnesium (Mg) | 12 | 24 | 12 |
| Aluminium (Al) | 13 | 27 | 14 |
| Silicon (Si) | 14 | 28 | 14 |
| Phosphorus (P) | 15 | 31 | 16 |
| Sulfur (S) | 16 | 32 | 16 |
| Chlorine (Cl) | 17 | 35 | 18 |
| Argon (Ar) | 18 | 40 | 22 |
| Potassium (K) | 19 | 39 | 20 |
| Calcium (Ca) | 20 | 40 | 20 |

The first 18 match `ELEMENTS` and `NEUTRONS` in the build. Potassium and calcium are new, so the element card needs them.

**F9 set-ups.** Each was solved with the sim's values. A bulb counts as lit above 0.02 A.

| Set-up | Current in the bulb | Lit? |
|---|---|---|
| Complete loop, one cell, one bulb | 0.36 A | Yes |
| Gap in a wire | 0.00 A | No |
| Switch open | 0.00 A | No |
| Switch closed | 0.36 A | Yes |
| Plain wire across the bulb (short circuit) | 0.00 A | No |
| Spare wire joined at one end only | 0.36 A | Yes |
| Two cells facing opposite ways | 0.00 A | No |
| Two cells facing the same way | 0.68 A | Yes |
| Two bulbs in series with a gap | 0.00 A | No |
| Two bulbs in series, wire across the second | 0.36 A | Yes |
| Parallel, one branch unscrewed | 0.36 A | Yes |

### F1 Charge rules

`charge-rules` · What is electricity? · A Apply · B Predict · `table` (A), `mcq` (B) · Strands (teacher only): A i, A ii

- **Varies:** The two objects (balloon, rod, ball, comb, straw) and the charge on each (+, −, neutral).
- **Direction A:** Give both charges. Ask what happens.
- **Direction B:** Give what happens with an object of known charge. Ask what the mystery charge could be.
- **Answer rule:** Same charge: repel. Opposite charges: attract. Charged and neutral: attract. Neutral and neutral: nothing. A repel proves the charge. An attract alone leaves two choices (opposite or neutral).
- **Range:** 9 charge pairs × 5 objects. Show one to three rows at a time.
- **Wrong answers to use:** "Neutral objects can't be attracted", "opposite charges repel", "attracted means it must be opposite".
- **Sample A:** A negative balloon is held near a neutral wall. What happens? → *They attract.*
- **Sample B:** Mystery ball X repels a negative balloon. What is the charge on X? → *Negative. Only like charges repel.*

### F2 Static or current

`static-or-current` · What is electricity? · A Apply · B Apply · `sort` (A), `mcq` (B) · Strands (teacher only): A i

- **Varies:** The everyday example, drawn from the examples already in the build (`STATIC_OR_CURRENT` and the two review sorts).
- **Direction A:** Give an example. Ask which kind it is.
- **Direction B:** Give the description. Ask which example fits it.
- **Answer rule:** Charge that builds up, stays put and may jump once as a spark is static. Charge that keeps flowing round a loop is current.
- **Range:** Three to five examples per item, always a mix of both kinds.
- **Wrong answers to use:** "Anything with a spark is current", "lightning is current" and "batteries make static".
- **Sample A:** Sort these: a phone charging; a shock from a car door; dust clinging to a TV screen. → *Current: a phone charging. Static: a shock from a car door; dust clinging to a TV screen.*
- **Sample B:** Which one is charge that keeps flowing round a loop? A doorbell ringing, or hair standing up after you pull off a hat? → *A doorbell ringing.*

### F3 Atom numbers

`atom-numbers` · Atoms and atomic models · A Calculate · B Calculate · `num` or `table` with the element card shown · Strands (teacher only): A ii

- **Varies:** The element, hydrogen to calcium, and for ions, the charge.
- **Direction A:** Give the atomic number and mass number. Ask for protons, neutrons or electrons.
- **Direction B:** Give the particle counts. Ask for the element, the mass number or the overall charge.
- **Answer rule:** Protons = atomic number. Neutrons = mass number − atomic number. In a neutral atom, electrons = protons. Overall charge = protons − electrons.
- **Range:** Hydrogen to calcium with the mass numbers below. Ions: Li⁺, Be²⁺, O²⁻, F⁻, Na⁺, Mg²⁺, Al³⁺, S²⁻, Cl⁻, K⁺, Ca²⁺.
- **Wrong answers to use:** Adds instead of subtracts; treats mass number as the neutron count; gives the charge sign the wrong way round.
- **Sample A:** A sodium atom has atomic number 11 and mass number 23. How many neutrons does it have? → *12 neutrons (23 − 11).*
- **Sample B:** An atom has 12 protons, 12 neutrons and 10 electrons. What is its overall charge? → *+2 (12 − 10). It is a magnesium ion.*

### F4 Electron shells

`shells` · Atoms and atomic models · A Apply · B Apply · `table` or atom builder; class form is "Draw" · Strands (teacher only): A ii

- **Varies:** The element, hydrogen to argon.
- **Direction A:** Give the element or electron count. Ask how many electrons sit in each shell.
- **Direction B:** Give the shell pattern. Ask which element it is.
- **Answer rule:** Fill from the inside: first shell up to 2, next up to 8, next up to 8.
- **Range:** Z = 1 to 18. Potassium and calcium stay out of this family because a fourth shell is not taught.
- **Wrong answers to use:** All electrons in one shell; eight in the first shell; counts neutrons as electrons.
- **Sample A:** A neutral nitrogen atom has 7 electrons. How many are in the first and second shells? → *2 in the first shell, 5 in the second.*
- **Sample B:** A neutral atom has shells of 2, 8 and 3 electrons. Which element is it? → *Aluminium (13 electrons, so atomic number 13).*

### F5 Evidence and models

`atom-evidence` · Atoms and atomic models · A Apply · B Predict · `mcq`, `match` · Strands (teacher only): A i, A iii

- **Varies:** The model (Democritus, Dalton, Thomson, Rutherford, Bohr) and the evidence or idea.
- **Direction A:** Give an idea or a piece of evidence. Ask which model or scientist it belongs to.
- **Direction B:** Give a model. Ask what it predicts, or which result it could not explain.
- **Answer rule:** Each model answers the evidence of its time: Dalton has solid spheres, Thomson adds electrons, Rutherford adds a tiny positive nucleus, Bohr adds shells.
- **Range:** Five models × three facts each (date, idea, evidence).
- **Wrong answers to use:** Puts a nucleus in Thomson's model; thinks old models were "wrong and useless"; swaps Thomson and Rutherford.
- **Sample A:** Which model first had a tiny positive nucleus? → *Rutherford's nuclear model (1911).*
- **Sample B:** If Thomson's plum pudding model were right, what should alpha particles do at gold foil? → *Almost all should go straight through. None should bounce back.*

### F6 Electron ladder

`electron-ladder` · Electric charge and static electricity · A Apply · B Apply · `table`, `mcq`; ladder card always shown · Strands (teacher only): A ii

- **Varies:** The pair of materials. Only pairs at least two rungs apart, because neighbours on real ladders can swap.
- **Direction A:** Give the pair. Ask which charge each one gets.
- **Direction B:** Give the result. Ask which way the electrons moved, or which material is lower.
- **Answer rule:** The lower material grabs electrons and becomes negative. The higher material loses electrons and becomes positive.
- **Range:** 15 pairs from Human hair, Glass, Wool, Silk, Paper, Rubber balloon, Plastic.
- **Wrong answers to use:** Protons move; the rubbed object always becomes negative; rubbing "makes" charge.
- **Sample A:** Plastic is rubbed with wool. Which charge does each one get? → *Plastic: negative. Wool: positive.*
- **Sample B:** Glass becomes positive when rubbed with silk. Which way did the electrons move? → *From the glass onto the silk.*

### F7 Counting electrons

`electron-count` · Electric charge and static electricity · A Calculate · B Calculate · `num` (a signed whole number) · Strands (teacher only): A ii

- **Varies:** The number of electrons moved and which object gains them.
- **Direction A:** Give the number moved. Ask for the charge on one object.
- **Direction B:** Give the charge on one object. Ask for the number moved, or the charge on the other object.
- **Answer rule:** Both start neutral. Each electron gained adds −1; each electron lost adds +1. The two charges always add up to zero.
- **Range:** 3 to 24 electrons, matching what students see on the sim board.
- **Wrong answers to use:** Same sign on both objects; thinks positive objects gained protons.
- **Sample A:** A balloon and a jumper start neutral. 9 electrons move from the jumper to the balloon. What is the charge on the balloon? → *−9.*
- **Sample B:** After rubbing, a comb has a charge of −14. What is the charge on the hair? → *+14. The hair lost the 14 electrons that the comb gained.*

### F8 Mystery charge

`mystery-charge` · Electric charge and static electricity · A Predict · B Predict · `table`, `mcq` · Strands (teacher only): A iii

- **Varies:** The hidden charge and the two test results.
- **Direction A:** Give results with a positive and a negative test ball. Ask for the mystery charge.
- **Direction B:** Give the mystery charge. Ask what each test will show.
- **Answer rule:** Repelled by one test ball: it has that charge. Attracted by both: neutral. Repelling is the only proof of charge.
- **Range:** 3 hidden charges × 2 test balls.
- **Wrong answers to use:** "Attracted, so it must be opposite".
- **Sample A:** Ball B is attracted to a positive ball and also to a negative ball. What is its charge? → *Neutral.*
- **Sample B:** Ball B is positive. What will it do near a positive ball, then near a negative ball? → *Repel the positive ball, then attract the negative ball.*

### F9 Will it light?

`will-it-light` · Current electricity and circuits · A Predict · B Predict (diagnose) · `mcq` with a circuit from `Circuit.board`; answer read from the circuit engine · Strands (teacher only): A ii

- **Varies:** The circuit: 11 set-ups (listed under the table), with random cell and bulb positions.
- **Direction A:** Show the circuit. Ask if the bulb lights, and why.
- **Direction B:** Show a dark bulb. Ask for the one change that lights it.
- **Answer rule:** The bulb lights only if a complete loop passes through it and the cells push the same way. A plain wire across the bulb is a short circuit, so the bulb stays dark.
- **Range:** All 11 set-ups were run through the sim's own values (1.5 V cell, 4 Ω bulb, 0.2 Ω inside the cell).
- **Wrong answers to use:** "The wire across the bulb gives it more current"; "a spare wire joined at one end breaks the circuit"; "two cells are always brighter".
- **Sample A:** A plain wire joins one side of the bulb to the other. Will the bulb light? → *No. Nearly all the current takes the wire, so the bulb stays dark.*
- **Sample B:** Two cells face opposite ways in a loop with a bulb. Which change will light the bulb? → *Turn one cell round so both push the same way.*

### F10 Adding cells

`cell-count` · Current electricity and circuits · A Calculate · B Calculate · `num` with unit V · Strands (teacher only): A ii

- **Varies:** The number of cells and how many are reversed.
- **Direction A:** Give the cells. Ask for the total voltage.
- **Direction B:** Give a target voltage. Ask how many cells are needed.
- **Answer rule:** Total voltage = 1.5 V × (cells facing the same way − cells facing the other way).
- **Range:** 1 to 8 cells, 0 to 3 reversed, total from 1.5 V to 12 V.
- **Wrong answers to use:** Adds the reversed cell; multiplies by 2 instead of 1.5.
- **Sample A:** Five 1.5 V cells are in a row. One faces the wrong way. What is the total voltage? → *4.5 V (four push forward, one pushes back: 1.5 × 3).*
- **Sample B:** A toy needs 7.5 V. How many 1.5 V cells must face the same way? → *5 cells (7.5 ÷ 1.5).*

### F11 Parts and symbols

`parts-and-symbols` · Current electricity and circuits · A Apply · B Apply · `match`, `mcq`; class form is "Draw" · Strands (teacher only): A i

- **Varies:** The part: cell, bulb, switch, ammeter, voltmeter, resistor, LED, motor, buzzer, wire.
- **Direction A:** Show a symbol or name. Ask for its job.
- **Direction B:** Give the job. Ask which part does it, or which meter and unit to use.
- **Answer rule:** As in the build: `NAMES` and the Foundation review for the circuits stop. Ammeter: current in amps, in the loop. Voltmeter: voltage in volts, across a part.
- **Range:** 10 parts. Pick three or four per item.
- **Wrong answers to use:** Ammeter and voltmeter swapped; amps and volts swapped.
- **Sample A:** What does a switch do? → *It opens or closes a gap in the circuit.*
- **Sample B:** Which meter measures current, and in which unit? → *An ammeter, in amps (A).*

### F12 Stronger or weaker?

`electromagnet-strength` · Magnets and electromagnets · A Predict · B Predict · `mcq`, `table` · Strands (teacher only): A ii

- **Varies:** Coils, cells and core for two electromagnets.
- **Direction A:** Show two set-ups. Ask which is stronger.
- **Direction B:** Give a target ("stronger with no extra cells"). Ask which change works.
- **Answer rule:** Strength grows with coils and cells. Iron is best, steel next, and aluminium, wood or no core barely help. In the sim: clips ≈ coils ÷ 10 × cells × 2 × core factor.
- **Range:** 10 to 60 coils, 1 to 4 cells. Only offer pairs where one is at least 25% stronger, so no item is a near tie.
- **Wrong answers to use:** "More coils means weaker"; "any metal core works"; "thicker plastic helps".
- **Sample A:** Electromagnet P has 40 coils and 1 cell. Q has 20 coils and 3 cells. Both have iron cores. Which is stronger? → *Q (12 clips against 8 clips).*
- **Sample B:** You can't add cells or coils. How can you make an electromagnet with a steel core stronger? → *Swap the steel core for iron.*

### F13 Read the pattern

`results-pattern` · Magnets and electromagnets · A Calculate · B Calculate · `num` · Strands (teacher only): A ii, A iii

- **Varies:** The clips per 10 coils, and the value to predict. Challenge mode: lifting power per cell and the load.
- **Direction A:** Show a results table. Ask for a value between or beyond the rows.
- **Direction B:** Give a target. Ask for the coils or the fewest cells needed.
- **Answer rule:** Find the amount for each step, then multiply. For "fewest cells", divide and round up.
- **Range:** 2 to 6 clips per 10 coils, 15 to 75 coils, whole-number answers only. Challenge: 250 to 600 kg per cell, loads of 700 to 2,900 kg. Mass stays in kg (see the note on gravity).
- **Wrong answers to use:** Adds the step instead of scaling; rounds down in "fewest cells".
- **Sample A:** Results: 10 coils → 3 clips, 20 coils → 6 clips, 40 coils → 12 clips. Predict the clips for 50 coils. → *15 clips (3 for every 10 coils).*
- **Sample B (Challenge):** With 50 coils, each cell lifts 450 kg. What is the fewest cells needed to lift a load with a mass of 1,700 kg? → *4 cells (3 cells lift 1,350 kg; 4 cells lift 1,800 kg).*

### F14 Fair test

`fair-test` · Magnets and electromagnets · A Apply · B Apply · `table`, `mcq` · Strands (teacher only): A ii

- **Varies:** The electricity investigation: coils, cells, core, material in a tester, turns each second, bulbs in series.
- **Direction A:** Give a research question. Ask for the independent, dependent and controlled variables.
- **Direction B:** Give the variables. Ask which research question or hypothesis fits.
- **Answer rule:** Change one thing (independent), measure one thing (dependent), keep the rest the same (controlled).
- **Range:** 6 investigations × 3 variables each.
- **Wrong answers to use:** Swaps independent and dependent; lists the measured value as controlled.
- **Sample A:** Does the number of bulbs in series change the current? Name the independent variable. → *The number of bulbs.*
- **Sample B:** You change the material in a tester and measure the current. Which question fits? → *How does the material change the current in the circuit?*

### F15 V = I × R

`ohm-triangle` · Conductors, insulators, resistance and semiconductors · A Calculate · B Calculate · `num` with unit, triangle clue · Strands (teacher only): A ii

- **Varies:** Which of V, I and R is missing, and the values.
- **Direction A:** Give I and R. Ask for V.
- **Direction B:** Give V and one other. Ask for I or R.
- **Answer rule:** V = I × R, I = V ÷ R, R = V ÷ I.
- **Range:** 116 checked sets. V is 1.5, 3, 4.5, 6, 9 or 12 V. R is 2 to 120 Ω. I is 0.02 to 6 A with no more than 3 decimal places.
- **Wrong answers to use:** Multiplies when it should divide; swaps V and R in the division.
- **Sample A:** A current of 0.25 A flows through a 24 Ω resistor. What is the voltage? → *6 V (0.25 × 24).*
- **Sample B:** A 4.5 V supply drives 0.3 A through a resistor. What is its resistance? → *15 Ω (4.5 ÷ 0.3).*

### F16 Change it

`change-it` · Conductors, insulators, resistance and semiconductors · A Predict · B Predict · `mcq`, `num` · Strands (teacher only): A ii

- **Varies:** What changes (V, R or both), by ×2, ×3 or ÷2, and the starting current.
- **Direction A:** Give a change. Ask what happens to the current.
- **Direction B:** Give before-and-after currents. Ask what changed.
- **Answer rule:** Current goes up in step with voltage and down in step with resistance.
- **Range:** Starting currents 0.3, 0.6 and 1.2 A. Sixteen combinations.
- **Wrong answers to use:** "More resistance gives more current"; "doubling both gives four times".
- **Sample A:** A circuit carries 0.6 A. You double the resistance and keep the voltage the same. What is the new current? → *0.3 A.*
- **Sample B:** A current goes from 0.3 A to 0.9 A. The resistance stayed the same. What happened to the voltage? → *It became three times bigger.*

### F17 Conductor or insulator?

`conductor-or-insulator` · Conductors, insulators, resistance and semiconductors · A Apply · B Apply · `sort`, `mcq` · Strands (teacher only): A i, A ii

- **Varies:** The material: copper, aluminium, iron, steel, graphite, salty water, silicon, plastic, wood, glass, rubber, paper.
- **Direction A:** Give materials. Ask which group each belongs to, or whether a bulb in a tester lights.
- **Direction B:** Give a job (the coating on a wire). Ask which material fits, and why.
- **Answer rule:** Metals have free electrons, so they conduct. Insulators hold their electrons tightly. Silicon is a semiconductor. Graphite and salty water conduct a little.
- **Range:** 12 materials. Pick three to five per item.
- **Wrong answers to use:** "All solids conduct"; "electrons are used up in insulators"; "water always insulates".
- **Sample A:** Sort: glass, aluminium, rubber, steel. → *Conductors: aluminium, steel. Insulators: glass, rubber.*
- **Sample B:** Why is copper used inside a wire, with plastic round it? → *Copper has free electrons, so current flows. Plastic holds its electrons tightly, so it keeps us safe.*

### F18 Generator changes

`generator-changes` · Turbines and generators · A Predict · B Apply · `table`, `multi` · Strands (teacher only): A i, A ii

- **Varies:** The change: spin faster or slower, more or fewer turns of wire, stronger or weaker magnet, stop.
- **Direction A:** Give a change. Ask what happens to the peak voltage.
- **Direction B:** Give a limit ("weak magnets only"). Ask which changes still raise the voltage.
- **Answer rule:** Peak voltage goes up with faster spinning, more turns and a stronger magnet. A still magnet gives zero.
- **Range:** 7 changes.
- **Wrong answers to use:** "A bigger bulb makes more voltage"; "a still magnet still makes a little current".
- **Sample A:** A magnet stops spinning inside a coil. What happens to the voltage? → *It drops to zero.*
- **Sample B:** You can't change the magnet. Name two changes that raise the voltage. → *Spin it faster, and add more turns of wire.*

### F19 Scale the voltage

`generator-scale` · Turbines and generators · A Calculate · B Calculate · `num` with unit V · Strands (teacher only): A ii

- **Varies:** The starting peak voltage, and the factor on turns each second or turns of wire.
- **Direction A:** Give a peak voltage and a change. Ask for the new peak.
- **Direction B:** Give two peaks. Ask for the turns each second that gives the target.
- **Answer rule:** Peak voltage goes up in step with turns each second, turns of wire and magnet strength. New peak = old peak × the factor.
- **Range:** Peak 0.4 to 30 V, 2 to 10 turns each second, 100 to 500 turns of wire. Factors ×1.5, ×2, ×3, ÷2.
- **Wrong answers to use:** Adds the change instead of multiplying.
- **Sample A:** A dynamo gives 1.8 V at 3 turns each second. What is the peak at 7 turns each second? → *4.2 V (0.6 V for each turn each second, × 7).*
- **Sample B:** A generator gives 4 V with 200 turns of wire. How many turns give 12 V? → *600 turns (three times the voltage needs three times the turns).*

### F20 Energy sums

`energy-sums` · How bulbs work, energy and LEDs · A Calculate · B Calculate · `num` · Strands (teacher only): A ii, D ii

- **Varies:** Device, energy in, and useful share. Challenge mode: bulb swap (bulbs, old watts, new watts, hours).
- **Direction A:** Give energy in and useful energy. Ask for the wasted energy or the percentage.
- **Direction B:** Give the percentage and energy in. Ask for the useful energy.
- **Answer rule:** Energy in = useful + wasted. Percentage useful = useful ÷ energy in × 100. Challenge: watts saved = bulbs × (old − new); kWh saved = kW saved × hours.
- **Range:** Filament bulb 5 to 12%, LED 30 to 50%, electric fan 60 to 80%, kettle 85 to 95%. Energy in 40 to 1,200 J. Whole-number answers. Challenge: 10 to 200 bulbs, 40/60/100 W to 6/9/12 W, 4 to 12 hours.
- **Wrong answers to use:** Subtracts from 100 instead of from the energy in; divides the wrong way round.
- **Sample A:** A bulb gets 450 J of energy and gives out 36 J of light. How much energy is wasted? → *414 J (450 − 36).*
- **Sample B:** An LED turns 40% of its energy into light. It gets 300 J. How much light energy comes out? → *120 J (300 × 40 ÷ 100).*

### F21 Useful or wasted?

`useful-or-wasted` · How bulbs work, energy and LEDs · A Apply · B Apply · `sort` · Strands (teacher only): A i

- **Varies:** The device and the type of energy.
- **Direction A:** Give a device and an output. Ask if it is useful or wasted.
- **Direction B:** Give a device. Ask for its main useful energy.
- **Answer rule:** Useful energy does the job we want. The same type can be useful in one device and wasted in another (heat from a kettle, heat from a laptop).
- **Range:** 12 devices.
- **Wrong answers to use:** "Heat is always wasted"; "wasted energy disappears".
- **Sample A:** Is heat from a toaster useful or wasted? → *Useful. Heat is the job of a toaster.*
- **Sample B:** What is the main useful energy from an electric drill? → *Movement.*

### F22 What gets used up?

`what-gets-used-up` · How bulbs work, energy and LEDs · A Predict · B Predict · `mcq` · Strands (teacher only): A ii, A iii

- **Varies:** The reading before a bulb, the part (filament bulb, LED), and how the LED faces.
- **Direction A:** Give the current going into a bulb. Ask for the current coming out.
- **Direction B:** Show a claim about a circuit. Ask which idea is right, or which LED lights.
- **Answer rule:** Current is the same before and after a bulb. The bulb transfers energy. An LED only lets current through one way.
- **Range:** 0.12 to 0.95 A.
- **Wrong answers to use:** "Bulbs use up current"; "a flat battery has run out of electrons".
- **Sample A:** 0.24 A flows into a bulb. How much flows out? → *0.24 A. The energy is transferred; the current stays the same.*
- **Sample B:** Two LEDs are in a circuit. One lights and one stays dark. What is the most likely reason? → *The dark LED is facing the wrong way round.*

### F23 Ammeter readings

`ammeter-readings` · Series and parallel circuits · A Calculate · B Calculate · `num` with unit A, circuit diagram · Strands (teacher only): A ii

- **Varies:** Series or parallel, the readings, and two to four branches.
- **Direction A:** Give branch currents. Ask for the main wire.
- **Direction B:** Give the main wire and one branch. Ask for the other branch.
- **Answer rule:** Series: the same everywhere. Parallel: the branch currents add up to the current in the main wire.
- **Range:** Branches 0.12 to 0.95 A in steps of 0.01 A. Identical bulbs on one cell: about 0.34 A each, as in the build.
- **Wrong answers to use:** "Each ammeter reads less"; halves the main wire whatever the branch currents are.
- **Sample A:** A parallel circuit has branches carrying 0.27 A and 0.48 A. What does the main wire carry? → *0.75 A.*
- **Sample B:** The main wire carries 1.1 A. One branch carries 0.65 A. What does the other carry? → *0.45 A.*

### F24 Series or parallel?

`series-or-parallel` · Series and parallel circuits · A Predict · B Apply · `mcq`, circuit diagrams · Strands (teacher only): A ii, D i

- **Varies:** The circuit, the change (unscrew a bulb, add a bulb, open a switch) and the job.
- **Direction A:** Show a circuit and a change. Ask what happens to the other bulbs.
- **Direction B:** Give a job (bedroom lights). Ask which wiring fits, and where the switches go.
- **Answer rule:** Series: one path, so one break stops everything, and more bulbs make each dimmer. Parallel: each bulb has its own branch, so the others stay on at the same brightness.
- **Range:** Series and parallel with 2 or 3 bulbs. Brightness checked with the sim's values: 0.34 A per bulb in parallel, 0.18 A per bulb in series, on one cell.
- **Wrong answers to use:** "Parallel bulbs share and go dim"; "the first bulb in series is brightest".
- **Sample A:** Which is brighter on one cell: two bulbs in parallel or two bulbs in series? → *The bulbs in parallel. Each gets the full push of the cell.*
- **Sample B:** One broken bulb must not spoil a shop display. How should the lights be wired? → *In parallel, each bulb on its own branch.*

### F25 AC or DC?

`ac-or-dc` · AC and DC · A Apply · B Apply · `sort`, `mcq`, trace picture · Strands (teacher only): A i, A ii

- **Varies:** The source, an oscilloscope trace, or a run of ammeter readings.
- **Direction A:** Give a source or a trace. Ask AC or DC.
- **Direction B:** Give AC or DC. Ask what the trace or ammeter will show.
- **Answer rule:** AC keeps changing direction: a wave above and below zero, readings that flip + and −. DC flows one way: a flat line, one steady sign.
- **Range:** 12 sources. Readings ±0.2 to ±0.9 A.
- **Wrong answers to use:** "Direction of a wave means it moves up and down the wire"; "batteries give AC".
- **Sample A:** An ammeter reads +0.36 A, then −0.36 A, then +0.36 A. Is this AC or DC? → *AC. The current keeps changing direction.*
- **Sample B:** What does a 1.5 V cell look like on an oscilloscope? → *A flat line above zero.*

### F26 Frequency

`frequency` · AC and DC · A Calculate · B Calculate · `num` · Strands (teacher only): A ii

- **Varies:** Hertz and time.
- **Direction A:** Give the frequency and a time. Ask for the cycles or the changes of direction.
- **Direction B:** Give the cycles and the time. Ask for the frequency.
- **Answer rule:** Cycles = frequency × seconds. Changes of direction = cycles × 2.
- **Range:** 50 and 60 Hz sockets, or a slow generator at 2 to 9 Hz. 10 to 300 seconds.
- **Wrong answers to use:** Forgets the × 2; divides minutes by 60 the wrong way.
- **Sample A:** Sockets in Beijing work at 50 Hz. How many cycles happen in 45 seconds? → *2,250 cycles.*
- **Sample B:** A slow generator makes 84 cycles in 12 seconds. What is its frequency? → *7 Hz.*

### F27 The journey to your home

`grid-journey` · AC and DC · A Predict · B Predict · `order`, `mcq`; Challenge `num` · Strands (teacher only): A ii, D i

- **Varies:** The stage of the journey. Challenge mode: the transformer voltages.
- **Direction A:** Name a stage. Ask what happens to the voltage there.
- **Direction B:** Change the system (no transformer, or DC). Ask what would go wrong. Challenge: how many times bigger is the voltage?
- **Answer rule:** Step up before long lines, step down before homes. High voltage means a smaller current, so less energy is wasted as heat. Transformers only work with AC.
- **Range:** 5 stages. Challenge: 11,000 to 25,000 V stepped up to 132,000 to 500,000 V, rounded to the nearest whole number. Skip any pair that lands on an exact half (22,000 V to 275,000 V is 12.5).
- **Wrong answers to use:** "AC is faster"; "high voltage means more energy is lost".
- **Sample A:** Electricity leaves a power station for long power lines. Which transformer comes first? → *A step-up transformer.*
- **Sample B (Challenge):** A transformer raises 13,800 V to 275,000 V. About how many times bigger is the voltage? → *About 20 times (275,000 ÷ 13,800 = 19.9, nearest whole number).*

### F28 Sort the sources

`sort-sources` · How electricity is produced · A Apply · B Predict · `sort`, `match`, `mcq` · Strands (teacher only): A i, A iii

- **Varies:** The source (`POWER`) and the place.
- **Direction A:** Give a source. Ask if it is renewable, fossil fuel or low-carbon non-renewable; or for one benefit and one drawback.
- **Direction B:** Give a place. Ask which source suits it best.
- **Answer rule:** As in `POWER`. Coal, oil, gas: fossil fuels. Uranium: non-renewable, low carbon. Wind, solar, hydro, tidal, geothermal, biomass: renewable.
- **Range:** 9 sources × 6 places.
- **Wrong answers to use:** "Nuclear is renewable because it has low CO₂"; "biomass is a fossil fuel".
- **Sample A:** Why is nuclear power not renewable? → *Its fuel, uranium, will run out one day.*
- **Sample B:** A small island has strong tides but no rivers or volcanoes. Which low-carbon source suits it best? → *Tidal power.*

### F29 Energy chains

`energy-chains` · How electricity is produced · A Apply · B Apply · `order`, `mcq` · Strands (teacher only): D i

- **Varies:** The source and the missing step.
- **Direction A:** Give a source. Ask for the order, or for what spins the turbine.
- **Direction B:** Give a chain with a missing step. Ask for the step or the source.
- **Answer rule:** As in `POWER.chain`. Something spins a turbine, the turbine turns a generator, electricity flows out. Solar panels have no turbine.
- **Range:** 9 chains.
- **Wrong answers to use:** "Solar panels spin a turbine"; "the turbine makes the electricity by itself".
- **Sample A:** What spins the turbine in a coal power station? → *Steam.*
- **Sample B:** Heat from deep underground → hot water turns to steam → ___ → the generator makes electricity. What is missing? → *Steam spins the turbine.*

### F30 Compare the CO₂

`co2-compare` · How electricity is produced · A Calculate · B Calculate · `num` · Strands (teacher only): A ii, D ii

- **Varies:** Two sources from the build's chart, and an amount of energy.
- **Direction A:** Ask how many times more CO₂ one source releases.
- **Direction B:** Ask for the CO₂ from an amount of kWh, or the CO₂ saved by a swap.
- **Answer rule:** Times more = bigger ÷ smaller, to the nearest whole number. CO₂ = grams per kWh × kWh.
- **Range:** Coal 820, gas 490, biomass 230, solar 48, geothermal 38, hydro 24, tidal 17, nuclear 12, wind 11 g per kWh. 5 to 500 kWh. Only pairs at least 2 times apart.
- **Wrong answers to use:** Subtracts instead of dividing.
- **Sample A:** Gas releases about 490 g of CO₂ per kWh and solar about 48 g. About how many times more is that? → *About 10 times (10.2, nearest whole number).*
- **Sample B:** A home uses 36 kWh. How much CO₂ is that from wind, at 11 g per kWh? → *396 g (11 × 36).*

### F31 Fill the gap

`demand-gap` · LED lighting and renewable energy · A Calculate · B Calculate · `num` with unit MW · Strands (teacher only): A ii

- **Varies:** The hour, the demand and the sources running.
- **Direction A:** Give the demand and supplies. Ask what the batteries must give.
- **Direction B:** Give the demand and the batteries. Ask how much a source must give.
- **Answer rule:** Batteries = demand − everything else running. No solar after sunset.
- **Range:** Evening hours from the build's demand curve (7 pm 88 MW, 8 pm 80 MW, 9 pm 65 MW). Hydro 30 MW, geothermal 25 MW, wind 0 to 35 MW. Batteries 5 to 60 MW.
- **Wrong answers to use:** Adds solar after sunset; adds instead of subtracts.
- **Sample A:** At 8 pm a town needs 80 MW. Hydro gives 30 MW and wind gives 15 MW. How much must the batteries give? → *35 MW.*
- **Sample B:** At 7 pm a town needs 88 MW. Batteries give 28 MW and hydro gives 30 MW. How much must wind give? → *30 MW.*

### F32 Keep the lights on

`keep-the-lights-on` · LED lighting and renewable energy · A Apply · B Predict · `table`, `mcq` · Strands (teacher only): A ii, A iii

- **Varies:** The weather, the time of day and the mix of sources.
- **Direction A:** Give conditions. Ask which sources can work.
- **Direction B:** Give a mix and conditions. Ask if there will be a blackout, and why.
- **Answer rule:** Solar needs sun, wind needs wind. Hydro and geothermal work in any weather. Batteries only give back stored energy.
- **Range:** 3 weathers × 2 times of day × 6 sources.
- **Wrong answers to use:** "Batteries make electricity"; "solar works at night".
- **Sample A:** It is a calm, cloudy night. Which works: solar, wind or hydro? → *Hydro.*
- **Sample B:** A town uses only solar panels and has no batteries. When is a blackout most likely? → *In the evening, when demand is high and the Sun has set.*

### Class-only family

This appears only in class sets, to keep Bootcamp skills going. It is not in homework Reviews or the Time Test.

### X1 Think like a scientist

`think-like-a-scientist` · class only · A Apply · B Apply · multiple choice, short answer · Strands (teacher only): not tagged (Bootcamp skills)

- **Varies:** The electricity context and the skill: observation or inference, qualitative or quantitative, reading results, variables, hypothesis, research question, tool.
- **Direction A:** Give a sentence. Ask if it is an observation or an inference, or a hypothesis or not.
- **Direction B:** Give variables. Ask for a hypothesis with a reason, or an open and testable research question.
- **Answer rule:** As taught in Bootcamp: an observation is what you see or measure; an inference explains it. A hypothesis links the variables and gives a reason.
- **Range:** Any electricity context taught so far.
- **Wrong answers to use:** "An inference is always correct".
- **Sample A:** "The ammeter reads 0.36 A." Observation or inference? → *Observation.*
- **Sample B:** Write a hypothesis: independent variable, number of coils; dependent variable, clips picked up. → *If the number of coils goes up, then more clips will be picked up, because more coils make a stronger magnetic field.*

## 3. Paragraph questions

Reviews, the Time Test and class sets all use these. Students see "Data paragraph" (Objective C) or "Reading paragraph" (Objective D). Neither objective is named on screen. Each attempt shows one prompt. The student gets one box and a fold-out, then the filled-in model answer and four ticks after Check. Each tick is one point.

Teacher tags: reading paragraphs carry D i, D ii and D iii. Data paragraphs need the Objective C wording from WAB's guide, which is a later job in the plan.

Between them, C and D cover all 12 stops. Only C: atoms, circuits. Only D: what is electricity?, static, bulbs. Both: the other seven.

### Fold-outs shown before the student writes

**Data paragraph reminder**

- **Claim:** say what the data show.
- **Evidence:** use two numbers from the data, with units.
- **Reasoning:** use your science to explain why.

Sentence starters: "The data show that…" · "For example, when … was …, … was …" · "This happens because…" · "This supports the hypothesis because…" · "This contradicts the hypothesis because…"

Worked example: *A toy car rolled 40 cm from a 10 cm ramp, 82 cm from a 20 cm ramp and 118 cm from a 30 cm ramp.* "The data show that a higher ramp makes the car roll further. From 10 cm it rolled 40 cm, but from 30 cm it rolled 118 cm. This happens because a higher ramp gives the car more energy."

**Reading paragraph reminder**

- **Claim:** answer the question in one sentence.
- **Evidence:** use a fact or number from the passage.
- **Reasoning:** explain how the science works, or why you think so.

Sentence starters: "The problem is that…" · "This is solved by…" · "This works because…" · "One benefit is…" · "One drawback is…" · "I think… because…"

Worked example: *Bright strips on a jacket bounce car lights back to the driver. They cost very little, but they only work when light shines on them.* "One benefit is that drivers can see a cyclist at night. One drawback is that the strips only work when light shines on them. I think they are worth wearing, because they cost very little and could save a life."

### Tick checklists, shown after Check

| Paragraph | Tick 1 | Tick 2 | Tick 3 | Tick 4 |
|---|---|---|---|---|
| Data, "what do the results show?" | I said what the pattern is. | I used two numbers with units. | *(the science tick for that template)* | I used the words given. |
| Data, "support or contradict?" | I said if the data support or contradict it. | I used two numbers with units. | *(the science tick for that template)* | I used the words given. |
| Reading, "explain how" | I named the problem. | I named the science idea. | I explained how it solves the problem. | I used a detail from the passage. |
| Reading, "benefit and drawback" | I gave a benefit. | I gave a drawback. | I used a fact from the passage. | I gave my opinion with a reason. |

### Objective C templates: data

#### C1 Gold foil (Atoms)

**Shows:** Table. **Generated:** Particles fired: 20,000, 40,000 or 60,000. Bounced back: about 1 in every 20,000, the rate Rutherford gave for gold (1 to 3 per set). Bent to one side: 1% to 2% of the total. Straight through: the rest.

Sample data:

| Fired at gold foil | Went straight through | Bent to one side | Bounced back |
|---|---|---|---|
| 40,000 | 39,412 | 586 | 2 |

- **Hypothesis, supported:** Most of an atom is empty space.
- **Hypothesis, contradicted:** An atom is solid all the way through.
- **Prompt 1:** What do these results tell you about the inside of an atom? Use numbers from the table and your science.
- **Model answer 1:** The results show that most of an atom is empty space. Out of 40,000 particles, 39,412 went straight through the gold, and only 2 bounced back. The particles that went straight through met nothing solid. The few that bounced back hit the tiny, positive nucleus, because like charges repel.
- **Prompt 2:** A student says: “An atom is solid all the way through.” Do the data support or contradict this? Explain.
- **Model answer 2:** The data contradict this hypothesis. If atoms were solid, particles would not get through. But 39,412 of the 40,000 particles went straight through, and only 2 bounced back. This shows that most of an atom is empty space, with a tiny positive nucleus in the middle.
- **Science tick:** I explained the results using empty space and the nucleus.
- **Words to use:** nucleus, empty space, positive, repel

#### C2 Cells and current (Circuits, Series and parallel)

**Shows:** Table and line graph. **Generated:** Bulb count (1 or 2), 3 to 5 rows. Current from the sim's engine: I = cells × 1.5 ÷ (bulbs × 4 + cells × 0.2), then ±0.01 A for meter wobble.

Sample data:

| Cells | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Current (A) | 0.36 | 0.68 | 0.98 | 1.25 |

- **Hypothesis, supported:** More cells give a bigger current.
- **Hypothesis, contradicted:** The current stays the same however many cells you use.
- **Prompt 1:** What pattern do you see in the data? Use the numbers and your science to explain it.
- **Model answer 1:** The data show that the current gets bigger as more cells are added. With 1 cell the current was 0.36 A, and with 4 cells it was 1.25 A. More cells give a bigger voltage. A bigger voltage is a bigger push on the charge, so more current flows.
- **Prompt 2:** A student says: “The current stays the same however many cells you use.” Do the data support or contradict this? Explain.
- **Model answer 2:** The data contradict this hypothesis. The current went from 0.36 A with 1 cell to 1.25 A with 4 cells, so it did not stay the same. Each extra cell adds to the voltage. That bigger push makes a bigger current flow around the loop.
- **Science tick:** I explained the pattern using voltage as a push.
- **Words to use:** voltage, current, push, cells

#### C3 Coils and clips (Electromagnets)

**Shows:** Table and line graph. **Generated:** 1 or 2 cells, iron core, 5 or 6 rows from 10 to 60 coils. Clips from the sim's rule (coils ÷ 10 × cells × 2) with up to ±1 clip of wobble.

Sample data:

| Coils | 10 | 20 | 30 | 40 | 50 | 60 |
|---|---|---|---|---|---|---|
| Clips picked up | 4 | 9 | 12 | 15 | 20 | 25 |

- **Hypothesis, supported:** More coils make a stronger electromagnet.
- **Hypothesis, contradicted:** The number of coils makes no difference to an electromagnet.
- **Prompt 1:** What do these results show about coils and the strength of an electromagnet? Use numbers and your science.
- **Model answer 1:** The results show that more coils make a stronger electromagnet. With 10 coils it picked up 4 clips, and with 60 coils it picked up 25 clips. Each coil of wire adds to the magnetic field, so the iron core becomes a stronger magnet.
- **Prompt 2:** A student says: “The number of coils makes no difference.” Do the data support or contradict this? Explain.
- **Model answer 2:** The data contradict this hypothesis. The electromagnet picked up 4 clips with 10 coils but 25 clips with 60 coils. The number of coils clearly made a difference. Each coil adds to the magnetic field, which makes the electromagnet stronger.
- **Science tick:** I explained the pattern using the magnetic field.
- **Words to use:** coils, magnetic field, stronger, core

#### C4 Core material (Electromagnets)

**Shows:** Table and bar chart. **Generated:** 30 to 60 coils, 2 or 3 cells. Iron factor 1, steel 0.7, and aluminium, wood and no core 0.1, as in the build. ±1 clip of wobble.

Sample data:

| Core | Iron | Steel | Aluminium | Wood | No core |
|---|---|---|---|---|---|
| Clips picked up (50 coils, 3 cells) | 30 | 21 | 3 | 2 | 3 |

- **Hypothesis, supported:** Iron makes the strongest core.
- **Hypothesis, contradicted:** Any solid core works just as well as iron.
- **Prompt 1:** What do these results show about the material of the core? Use numbers and your science.
- **Model answer 1:** The results show that iron makes the strongest core. The iron core picked up 30 clips, but the aluminium core picked up only 3. Iron and steel are magnetic materials, so they make the magnetic field much stronger. Aluminium and wood are not magnetic, so they hardly help.
- **Prompt 2:** A student says: “Any solid core works just as well as iron.” Do the data support or contradict this? Explain.
- **Model answer 2:** The data contradict this hypothesis. The iron core picked up 30 clips, but the wood core picked up only 2. Iron is a magnetic material, so it makes the magnetic field much stronger. Wood is not magnetic, so it works about as badly as having no core at all.
- **Science tick:** I explained the results using magnetic materials.
- **Words to use:** core, magnetic, iron, magnetic field

#### C5 Resistance and current (Conductors and resistance)

**Shows:** Table and line graph. **Generated:** Supply 3, 4.5 or 6 V. Resistors 2, 5, 10, 20 and 50 Ω, as in the build. I = V ÷ R to 2 decimal places.

Sample data:

| Resistance (Ω) | 2 | 5 | 10 | 20 | 50 |
|---|---|---|---|---|---|
| Current (A) with 3 V | 1.50 | 0.60 | 0.30 | 0.15 | 0.06 |

- **Hypothesis, supported:** Doubling the resistance halves the current.
- **Hypothesis, contradicted:** More resistance gives more current.
- **Prompt 1:** What do these results show about resistance and current? Use numbers and your science.
- **Model answer 1:** The results show that a bigger resistance gives a smaller current. With 5 Ω the current was 0.60 A, but with 10 Ω it was 0.30 A. Doubling the resistance halved the current. Resistance fights the flow of charge, so the same voltage pushes less current through.
- **Prompt 2:** A student says: “More resistance gives more current.” Do the data support or contradict this? Explain.
- **Model answer 2:** The data contradict this hypothesis. When the resistance went up from 5 Ω to 20 Ω, the current fell from 0.60 A to 0.15 A. Resistance fights the flow of charge. With the same voltage, V = I × R tells us that a bigger R gives a smaller I.
- **Science tick:** I explained the pattern using resistance or V = I × R.
- **Words to use:** resistance, current, voltage

#### C6 Generator peak voltage (Generators)

**Shows:** Table and line graph. **Generated:** Change turns each second (2 to 10) or turns of wire (100 to 500). Peak goes up in step, at 0.4 to 1.2 V for each step, with ±0.1 V of wobble.

Sample data:

| Turns each second | 2 | 4 | 6 | 8 | 10 |
|---|---|---|---|---|---|
| Peak voltage (V) | 1.2 | 2.5 | 3.6 | 4.7 | 6.0 |

- **Hypothesis, supported:** Faster spinning gives a bigger peak voltage.
- **Hypothesis, contradicted:** The peak voltage stays the same however fast the magnet spins.
- **Prompt 1:** What do these results show about how fast a generator spins? Use numbers and your science.
- **Model answer 1:** The results show that faster spinning gives a bigger peak voltage. At 2 turns each second the peak was 1.2 V, and at 10 turns each second it was 6.0 V. When the magnet moves past the coil faster, it makes a bigger voltage in the wire.
- **Prompt 2:** A student says: “The peak voltage stays the same however fast the magnet spins.” Do the data support or contradict this? Explain.
- **Model answer 2:** The data contradict this hypothesis. The peak voltage rose from 1.2 V at 2 turns each second to 6.0 V at 10 turns each second. A moving magnet makes the voltage in the coil, so moving it past the coil faster makes the voltage bigger.
- **Science tick:** I explained the pattern using a magnet moving past a coil.
- **Words to use:** magnet, coil, voltage, faster

#### C7 Bulbs in series (Series and parallel)

**Shows:** Table and line graph. **Generated:** 1 or 2 cells, 1 to 4 bulbs in series. Current from the sim's engine: I = cells × 1.5 ÷ (bulbs × 4 + cells × 0.2).

Sample data:

| Bulbs in series | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Current (A) | 0.36 | 0.18 | 0.12 | 0.09 |

- **Hypothesis, supported:** Adding bulbs in series makes the current smaller.
- **Hypothesis, contradicted:** Adding bulbs in series does not change the current.
- **Prompt 1:** What do these results show about adding bulbs in series? Use numbers and your science.
- **Model answer 1:** The results show that adding bulbs in series makes the current smaller. With 1 bulb the current was 0.36 A, but with 4 bulbs it was 0.09 A. Each bulb adds resistance to the single loop, and the cell gives the same push, so less current flows and every bulb gets dimmer.
- **Prompt 2:** A student says: “Adding bulbs in series does not change the current.” Do the data support or contradict this? Explain.
- **Model answer 2:** The data contradict this hypothesis. The current fell from 0.36 A with 1 bulb to 0.09 A with 4 bulbs. Each extra bulb adds resistance to the loop. The voltage stays the same, so the current gets smaller.
- **Science tick:** I explained the pattern using resistance in a single loop.
- **Words to use:** series, resistance, current, voltage

#### C8 DC and AC over distance (AC and DC)

**Shows:** Table and two-line graph. **Generated:** Distances from 2 to 40 km. Energy that arrives uses the sim's model: DC 100 × e^(−km ÷ 6), AC 100 × e^(−km ÷ 600), as a whole percentage.

Sample data:

| Distance (km) | 5 | 10 | 20 | 30 |
|---|---|---|---|---|
| DC: energy that arrives (%) | 43 | 19 | 4 | 1 |
| AC: energy that arrives (%) | 99 | 98 | 97 | 95 |

- **Hypothesis, supported:** AC delivers more energy than DC over long distances.
- **Hypothesis, contradicted:** DC reaches far-away towns just as well as AC.
- **Prompt 1:** What do these results show about sending electricity a long way? Use numbers and your science.
- **Model answer 1:** The results show that AC delivers far more energy over long distances. At 20 km, 97% of the energy arrived with AC, but only 4% arrived with DC. Transformers raise the voltage of AC, which makes the current smaller. A smaller current wastes less energy as heat in the wires.
- **Prompt 2:** A student says: “DC reaches far-away towns just as well as AC.” Do the data support or contradict this? Explain.
- **Model answer 2:** The data contradict this hypothesis. At 30 km, 95% of the energy arrived with AC, but only 1% arrived with DC. Edison's low-voltage DC wasted most of its energy as heat. Transformers let AC travel at a high voltage with a smaller current, so much less is wasted.
- **Science tick:** I explained the results using transformers and energy wasted as heat.
- **Words to use:** transformer, voltage, current, heat

#### C9 CO₂ chart (Producing electricity)

**Shows:** Bar chart. **Generated:** Any five or six of the nine sources in `POWER`, with at least one fossil fuel and one renewable. Values are fixed facts; only the set and order change.

Sample data:

| Source | Coal | Gas | Solar | Hydro | Wind |
|---|---|---|---|---|---|
| CO₂ (g per kWh) | 820 | 490 | 48 | 24 | 11 |

- **Hypothesis, supported:** Fossil fuels release more CO₂ than renewable sources.
- **Hypothesis, contradicted:** All power sources release about the same amount of CO₂.
- **Prompt 1:** What does this chart show about power sources and CO₂? Use numbers and your science.
- **Model answer 1:** The chart shows that fossil fuels release the most CO₂. Coal releases about 820 g per kWh, but wind releases only about 11 g. Coal and gas are burned, and burning them releases CO₂. Wind turbines burn nothing, so their small amount of CO₂ comes from building them.
- **Prompt 2:** A student says: “All power sources release about the same amount of CO₂.” Do the data support or contradict this? Explain.
- **Model answer 2:** The data contradict this hypothesis. Coal releases about 820 g of CO₂ per kWh, but wind releases about 11 g. Coal releases about 75 times more. Burning fossil fuels releases CO₂. Wind, solar and hydro burn nothing, so they release far less.
- **Science tick:** I explained the difference using burning fuel.
- **Words to use:** fossil fuel, burn, CO₂, renewable

#### C10 Demand and solar (Renewables)

**Shows:** Table and two-line graph. **Generated:** Solar peak 80, 100 or 120 MW. Demand comes from `DEMAND`. Solar = peak × sin(π × (hour − 6) ÷ 12) in daylight, 0 from 6 pm to 6 am.

Sample data:

| Time | 6 am | 9 am | 12 noon | 3 pm | 6 pm | 9 pm |
|---|---|---|---|---|---|---|
| Demand (MW) | 45 | 60 | 58 | 55 | 90 | 65 |
| Solar output (MW) | 0 | 71 | 100 | 71 | 0 | 0 |

- **Hypothesis, supported:** Solar panels alone can't keep this town lit in the evening.
- **Hypothesis, contradicted:** Solar panels alone can keep this town lit all day and all night.
- **Prompt 1:** What do these results show about solar power and the town's demand? Use numbers and your science.
- **Model answer 1:** The results show that solar panels can meet demand in the middle of the day but not in the evening. At 12 noon solar gives 100 MW and the town needs 58 MW. At 6 pm solar gives 0 MW but the town needs 90 MW. The Sun has set, so the town needs other sources or a battery store.
- **Prompt 2:** A student says: “Solar panels alone can keep this town lit all day and all night.” Do the data support or contradict this? Explain.
- **Model answer 2:** The data contradict this hypothesis. At 6 pm the town needs 90 MW, but the solar panels give 0 MW. Solar panels need sunlight, so they make nothing after sunset. The town needs other sources or a battery store for the evening peak.
- **Science tick:** I explained the gap using sunlight and the evening peak.
- **Words to use:** demand, solar, evening peak, battery store

When the "supported" hypothesis is drawn, Prompt 2 uses that sentence and the model answer opens "The data support this hypothesis." Numbers in every model answer fill in from the generated data.

### Objective D passages: read and respond

All are newly written. Each has two prompts, so 10 passages give 20 tasks.

#### D1 Stopping lightning damage (Static)

A lightning strike can start a fire and crack the walls of a tall building. In the 1750s, Benjamin Franklin had a simple idea. Put a pointed metal rod on the roof, and join it to the ground with a thick copper wire. Copper is a very good conductor. If lightning hits the rod, the charge flows down the wire and into the ground. It stays away from the bricks and wood of the building. A rod costs much less than a new roof. But it does not stop lightning. The wire must be checked often, because a broken wire can send a strike into the building.

- **Swappable figures:** None. The dates and materials are facts.
- **Explain prompt:** Explain how a lightning rod solves the problem of lightning strikes.
- **Model answer:** Lightning can start fires and crack the walls of tall buildings. A lightning rod solves this by giving the charge an easy path to the ground. The rod is joined to the ground by a thick copper wire. Copper is a good conductor, so the charge flows safely down the wire and away from the building.
- **Benefit and drawback prompt:** Is a lightning rod worth having on a tall building? Give a benefit and a drawback, then your opinion.
- **Model answer:** One benefit of a lightning rod is that it carries the charge safely into the ground, so the building is less likely to burn. It also costs much less than a new roof. One drawback is that the wire must be checked, because a broken wire can send a strike into the building. I think a rod is worth having, because a small cost protects a whole building.
- **Words to use:** conductor, charge, ground

#### D2 Painting cars with static (What is electricity?, Static)

Ordinary paint sprayers waste a lot of paint. In some factories, 30 to 40 drops in every 100 miss the car and drift into the air. Car makers can fix this with static electricity. A spray head gives each tiny drop a negative charge. Like charges repel, so the drops spread out into an even cloud. The car body is given a positive charge. Opposite charges attract, so the drops fly to the metal. With the best spray heads, about 95 drops in every 100 land on the car. This saves money and keeps paint out of the air. But the machines are costly. They work at a very high voltage, so workers need careful training.

- **Swappable figures:** None. The figures are Toyota's published ones.
- **Explain prompt:** Explain how static electricity solves the problem of wasted paint.
- **Model answer:** Ordinary sprayers waste paint because many drops miss the car. Static electricity solves this. Each drop gets a negative charge and the car gets a positive charge. Opposite charges attract, so the drops fly to the car. About 95 drops in every 100 land on the car, so much less paint is wasted.
- **Benefit and drawback prompt:** Should a small car factory buy these spray heads? Give a benefit and a drawback, then your opinion.
- **Model answer:** One benefit is that about 95 drops in every 100 land on the car. Less paint is wasted. One drawback is that the machines cost a lot. They also use a very high voltage, so workers need training. I think a small factory should buy them, because the paint it saves will help to pay for them.
- **Words to use:** charge, attract, repel

#### D3 Sorting steel at a recycling plant (Electromagnets)

Rubbish arrives at a recycling plant on a moving belt. Steel cans must be pulled out from the plastic, paper and aluminium. A big electromagnet hangs over the belt. When current flows through its coil, the iron core becomes a strong magnet. It lifts the steel cans, because steel is magnetic. Plastic, paper and aluminium stay on the belt. When the current is switched off, the magnet stops working and the cans drop into a bin. Recycling steel saves between 60% and 74% of the energy needed to make it from raw materials. But the electromagnet uses electricity the whole time it is on. It also picks out only magnetic metals, so the plant needs other machines too.

- **Swappable figures:** Scrapyard version: swap cans for cars and the bin for a crusher.
- **Explain prompt:** Explain how an electromagnet solves the problem of sorting steel from other rubbish.
- **Model answer:** A recycling plant has to pull steel cans out of mixed rubbish. An electromagnet solves this. When current flows through the coil, the iron core becomes a magnet and lifts the steel, because steel is magnetic. The other materials stay on the belt. When the current is switched off, the cans drop into a bin.
- **Benefit and drawback prompt:** Is an electromagnet a good way to sort rubbish? Give a benefit and a drawback, then your opinion.
- **Model answer:** One benefit is that the magnet can be switched off to drop the steel. Recycling steel also saves at least 60% of the energy. One drawback is that the magnet uses electricity the whole time it is on. It also picks out only magnetic metals. I think it is a good way to sort rubbish, because it saves more energy than it uses.
- **Words to use:** electromagnet, coil, core, magnetic

#### D4 Keeping wires safe (Conductors and resistance)

Copper is great at carrying electricity, but a bare copper wire can be dangerous. If you touch it, current could flow through your body. If two bare wires touch, a short circuit can make them hot enough to start a fire. So wires have a coating of plastic. Plastic is an insulator, because its atoms hold their electrons tightly. Current can't flow through it. Plastic is also cheap and it bends easily. But it isn't perfect. Heat and sunlight can make old plastic crack, and mice can chew it. A cracked coating must be replaced, or the wire is not safe. Most plastic coating is also made from oil and is hard to recycle.

- **Swappable figures:** None.
- **Explain prompt:** Explain how a plastic coating solves the problem of dangerous bare wires.
- **Model answer:** A bare copper wire can give a shock or cause a short circuit. A plastic coating solves this problem. Plastic is an insulator, because its atoms hold their electrons tightly. Current can't flow through the coating, so it can't reach your body or jump to another wire.
- **Benefit and drawback prompt:** Is plastic a good material for coating wires? Give a benefit and a drawback, then your opinion.
- **Model answer:** One benefit of plastic is that it is an insulator, so it stops shocks. It is also cheap and bends easily. One drawback is that old plastic can crack, and then the wire is not safe. I think plastic is a good material, because it keeps people safe, but old wires must be checked.
- **Words to use:** insulator, electrons, current

#### D5 A radio with no batteries (Generators)

Around 1990, British inventor Trevor Baylis saw a TV programme about the spread of AIDS in Africa. Radio could share health advice, but many homes had no electricity and batteries cost too much. So he built a radio with a handle. Turning the handle winds up a spring. As the spring slowly unwinds, it spins a small generator. Inside, a magnet moves near coils of wire and makes electricity. No battery or socket is needed. The radio has drawbacks. You must keep winding it, and it makes only a small amount of electricity, so it can't run big devices. The spring and generator are also extra parts that can wear out.

- **Swappable figures:** None.
- **Explain prompt:** Explain how the wind-up radio solves the problem of having no electricity.
- **Model answer:** Many homes had no electricity, and batteries cost too much. The wind-up radio makes its own electricity. Turning the handle winds a spring. The spring spins a small generator. Inside it, a magnet moves near coils of wire. This makes the electricity that runs the radio.
- **Benefit and drawback prompt:** Is a wind-up radio better than a battery radio? Give a benefit and a drawback, then your opinion.
- **Model answer:** One benefit is that the radio needs no batteries or sockets. It works in any home. One drawback is that you must keep winding it. The spring can also wear out. I think it is better for homes with no electricity, because free power from your own hands matters more than the extra work.
- **Words to use:** generator, magnet, coil

#### D6 LED street lights (Bulbs and energy)

At night, a city's street lights use a lot of electricity. By 2013, Los Angeles had swapped about 140,000 old street lights for LEDs. LEDs turn more of their energy into light and waste less as heat, so they need less electricity. Less electricity can mean less CO₂ from power stations. The change cost about $57 million, but the city expected to save about $10 million a year on energy and repairs. LEDs also last longer, so fewer need replacing. But the first cost is high. Bright white light at night can also confuse some animals and make it harder for people to sleep.

- **Swappable figures:** Bulb swap sums can follow from F20 (watts and hours). The Los Angeles figures stay as they are.
- **Explain prompt:** Explain how LEDs solve the problem of street lights using so much electricity.
- **Model answer:** Old street lights use a lot of electricity and waste much of it as heat. LEDs solve this because they turn more of their energy into light. They need less electricity for the same job. In Los Angeles, the city expected to save about $10 million a year on energy and repairs.
- **Benefit and drawback prompt:** Should your city swap its old street lights for LEDs? Give a benefit and a drawback, then your opinion.
- **Model answer:** One benefit is that LEDs waste less energy as heat. Los Angeles expected to save about $10 million a year. One drawback is that the change cost about $57 million. Bright light can also confuse some animals. I think my city should swap, because the money saved would pay for the change in about six years.
- **Words to use:** energy, heat, efficient

#### D7 Wiring a home (Series and parallel)

Imagine if every light in your home was on one series loop. One broken bulb would turn them all off. Every new bulb would make the others dimmer. You could not switch on one room by itself. So homes are wired in parallel. Each light has its own branch. Each one gets the full voltage and can have its own switch. If one bulb breaks, the others stay on. But parallel wiring needs more wire, which costs more. Also, every branch adds to the current in the main wire. If too many things are on at once, the main wire can get hot, so homes need safety switches that turn the power off.

- **Swappable figures:** None.
- **Explain prompt:** Explain how parallel wiring solves the problems of a series loop in a home.
- **Model answer:** In a series loop, one broken bulb turns everything off and each new bulb makes the others dimmer. Parallel wiring solves this. Each light has its own branch, so it gets the full voltage and has its own switch. If one bulb breaks, the current can still flow through the other branches.
- **Benefit and drawback prompt:** Is parallel wiring the best choice for a home? Give a benefit and a drawback, then your opinion.
- **Model answer:** One benefit is that each light has its own branch, so one broken bulb doesn't turn off the others. One drawback is that it needs more wire, and too many things on at once can make the main wire hot. I think it is the best choice, because lights that work by themselves matter more than the extra wire.
- **Words to use:** parallel, branch, voltage, current

#### D8 Sending power a long way (AC and DC)

In 1882, Thomas Edison opened a power station in New York. It used DC at a low voltage. A lot of energy was wasted as heat in long wires, so homes had to be close to the station, within about 2 km. A big city would need many stations. Nikola Tesla and George Westinghouse chose AC. A transformer can raise the voltage of AC. This makes the current smaller, so much less energy is wasted on the journey. Another transformer lowers the voltage near homes. In 1896, AC from Niagara Falls reached Buffalo, more than 30 km away. But high voltage is very dangerous. Power lines need tall towers, and transformers cost money.

- **Swappable figures:** None.
- **Explain prompt:** Explain how AC and transformers solve the problem of sending electricity a long way.
- **Model answer:** Edison's DC wasted a lot of energy as heat in long wires. Homes had to be close to a station. AC solved this. A transformer raises the voltage, and that makes the current smaller. Much less energy is wasted. Another transformer lowers the voltage near homes.
- **Benefit and drawback prompt:** Was AC a better choice than DC for a big city? Give a benefit and a drawback, then your opinion.
- **Model answer:** One benefit of AC is that less energy is wasted. Power could reach Buffalo, more than 30 km from Niagara Falls. One drawback is that high voltage is very dangerous and needs tall towers. I think AC was the better choice, because one big station could then serve a whole city.
- **Words to use:** transformer, voltage, current, energy wasted

#### D9 Coal or wind? (Producing electricity)

Coal power stations can make electricity day and night, in any weather. They burn coal to boil water, and the steam spins a turbine. But burning coal releases about 820 g of CO₂ for every kWh, and CO₂ warms the planet. Coal must be mined, and one day it will run out. Wind turbines burn nothing. Over its whole life, a wind turbine releases about 11 g of CO₂ per kWh. The wind is free and it won't run out. But no wind means no electricity, so a town needs another source too. Wind turbines need lots of steel and concrete, and their blades are hard to recycle.

- **Swappable figures:** Pairs with the build's figures: coal 820 g or gas 490 g against wind 11 g or solar 48 g. For solar, swap the sentences on spinning, wind and blades for the ones on sunlight, night and panels.
- **Explain prompt:** Explain how wind turbines solve the problem of CO₂ from coal power stations.
- **Model answer:** Burning coal releases about 820 g of CO₂ per kWh, and CO₂ warms the planet. Wind turbines solve this because they burn nothing. The wind spins the blades, which turn a generator. Over its whole life, a wind turbine releases only about 11 g of CO₂ per kWh.
- **Benefit and drawback prompt:** Should a town build a coal power station or a wind farm? Give a benefit and a drawback of each, then your opinion.
- **Model answer:** A benefit of coal is that it works in any weather. A drawback is that it releases about 820 g of CO₂ per kWh. A benefit of wind is that it releases only about 11 g. A drawback is that no wind means no electricity. I think the town should build a wind farm and add another clean source for calm days.
- **Words to use:** renewable, fossil fuel, CO₂, reliable

#### D10 Saving sunshine for later (Renewables)

Solar farms make the most electricity around midday. But people use the most electricity around 6 to 8 pm, when the Sun is going down. Battery stores help to fix this. In the afternoon, spare electricity charges up a huge set of batteries. In the evening, the batteries give the electricity back, so the town can keep using clean energy after dark. This helps the town burn less coal and gas. But a battery store makes no electricity of its own. It needs lithium, nickel and cobalt, which have to be mined, and making it releases CO₂. A store can also run out in long cloudy spells, so the town still needs other sources.

- **Swappable figures:** Evening peak wording can follow the town game's figures. Keep the metals as they are.
- **Explain prompt:** Explain how a battery store solves the problem of solar power in the evening.
- **Model answer:** Solar farms make the most power around midday, but people use the most around 6 to 8 pm. A battery store solves this. Spare power charges the batteries in the afternoon. In the evening the batteries give it back. The town can keep using solar energy after dark.
- **Benefit and drawback prompt:** Should a town build a battery store with its solar farm? Give a benefit and a drawback, then your opinion.
- **Model answer:** One benefit is that the town can use solar energy in the evening. It burns less coal and gas. One drawback is that the metals have to be mined. Making the store also releases CO₂. I think the town should build one, because it keeps the lights on at the evening peak.
- **Words to use:** demand, evening peak, battery store, renewable

## 4. Reusing section review questions

All 191 sorted below by position in `REVIEWS` and `CREVIEWS`. Copy the question out by stop and position, and keep its diagram, ladder or picture with it.

- **Recall pool (34):** sort, gap, match and order. These fill Review slot 2.
- **Time Test pool (78):** choose one, tick all and table. These can stand alone in the Time Test.
- **Replaced by families (32):** calculations. They stand alone, but their answers never change, so the families use new numbers instead.
- **Left out (11):** they depend on a mission or on another question.
- **Self-marked (36):** draw and explain items stay in their worksheets.

| Stop | Foundation recall | Foundation pool | Challenge recall | Challenge pool |
|---|---|---|---|---|
| What is electricity? | Q1, Q6 | Q2, Q3, Q4, Q5, Q7 | Q1 | Q2, Q3, Q4, Q5 |
| Atoms and atomic models | Q1, Q2, Q5, Q8 | Q3, Q4, Q9 | Q3 | Q2, Q4, Q6 |
| Electric charge and static electricity | Q5, Q6, Q7 | Q1, Q2, Q3, Q4 | – | Q1, Q4, Q5 |
| Current electricity and circuits | Q2, Q8 | Q1, Q3, Q4, Q5, Q6 | Q5 | Q1, Q3, Q4 |
| Magnets and electromagnets | Q6, Q8 | Q1, Q3, Q4, Q5, Q7 | Q6 | Q1, Q4 |
| Conductors, insulators, resistance and semiconductors | Q4, Q8 | Q5, Q6, Q7 | – | Q4, Q5, Q6 |
| Turbines and generators | Q2, Q7, Q8 | Q1, Q3, Q4, Q5 | – | Q1, Q2, Q5 |
| How bulbs work, energy and LEDs | Q6, Q7 | Q1, Q4, Q5, Q8 | Q1 | Q4, Q5 |
| Series and parallel circuits | Q7 | Q1, Q5, Q6 | – | Q1, Q4, Q5 |
| AC and DC | Q4, Q5, Q7 | Q1, Q6 | – | Q2, Q4, Q5 |
| How electricity is produced | Q1, Q5, Q7 | Q2, Q4, Q6 | – | Q1, Q2, Q3, Q4, Q5 |
| LED lighting and renewable energy | Q4, Q6 | Q3, Q5 | – | Q5 |

**Left out**

| Item | Why |
|---|---|
| How bulbs work, energy and LEDs, Foundation Q3 | Says “the same bulb”, so it needs Q2. |
| LED lighting and renewable energy, Foundation Q1 | Asks about “the town game”. |
| Atoms and atomic models, Challenge Q1 | Needs the Model Maker mission. |
| Electric charge and static electricity, Challenge Q2 | Needs the ball A and ball B mission. |
| Electric charge and static electricity, Challenge Q3 | Needs the ball A and ball B mission. |
| Magnets and electromagnets, Challenge Q5 | Needs the scrapyard mission. |
| Series and parallel circuits, Challenge Q6 | Names the Independent lights mission. |
| AC and DC, Challenge Q1 | Says “In the missions”. |
| LED lighting and renewable energy, Challenge Q1 | Needs the Sunny and still mission. |
| LED lighting and renewable energy, Challenge Q2 | Needs the Grey and windy mission. |
| LED lighting and renewable energy, Challenge Q4 | Asks about “the town game”. |

**Stand alone once the mission name in the question is removed:** What is electricity? Q2, Current electricity and circuits Q1, Current electricity and circuits Q3, Current electricity and circuits Q4, Conductors, insulators, resistance and semiconductors Q4, Turbines and generators Q1, Turbines and generators Q2, How bulbs work, energy and LEDs Q1, How bulbs work, energy and LEDs Q4, Series and parallel circuits Q4, How electricity is produced Q1 (all Challenge). Example: "Safety lock: two switches…" becomes "Two switches…".

Challenge pool items appear only after that stop's Challenge stamp.

## 5. The Time Test

The mastery challenge: new questions on each attempt, used as a final review and as practice for the pen-and-paper test.

### Layout

**56 marks · approx. 45 minutes · 26 questions.** The estimate is about 75 seconds for each of the 24 short questions and 8 minutes for each paragraph. Students can stop at the end of any part and carry on later.

| Part | Stops | Q | First question at each stop (from) | Second question at each stop (from) |
|---|---|---|---|---|
| A | What is electricity? · Atoms · Static · Circuits | 1 to 8 | Recall pool or F2 · F4 · F6 · F11 | F1 B · F3 · F7 or F8 · F9 or F10 |
| B | Electromagnets · Conductors and resistance · Generators · Bulbs | 9 to 16 | F14 · F17 · Recall pool · F21 | F12 or F13 · F15 or F16 · F18 A or F19 · F20 or F22 |
| C | Series and parallel · AC and DC · Producing electricity · Renewables | 17 to 24 | Recall pool · F25 · F28 A or F29 · F32 A | F23 or F24 A · F26 or F27 · F28 B or F30 · F31 or F32 B |
| D | Two paragraphs | 25, 26 | One data paragraph | One reading paragraph, from a different stop |

**Rules for each attempt**

- Use each family once at most.
- Aim for 7 or 8 Calculate questions out of 24. Where a cell gives a choice, alternate Calculate and Predict.
- Foundation content only, unless the stop's Challenge stamp is earned. Pool items can replace a family item, up to six per attempt.
- Each question is worth 2 marks. A one-answer item is 2 or 0. Items with parts score by share of parts right, rounded to 0, 1 or 2.
- Each paragraph is worth 4 ticks.
- One go per question, as in the rest of the sim.

### After finishing

- A score out of 56 and a bar for each of the 12 topics, out of 4: 4 is Secure, 2 or 3 is Nearly there, 0 or 1 is Practise this.
- Each topic below 4 has a "Practise this" button that opens flashcards with that topic ticked.
- "Save my PDF" shows every question, the answer, the model answers and the ticks.
- The home card keeps the best percentage. Store it under a new key, because old scores came from an easier test.
- The home card says "Ready when you are" after three Reviews. The test is never locked.
- Update the teacher page: the estimate is now approx. 45 minutes (it says 15 today).

### Print version

Two buttons, using the same seed so that a paper copy and its key match:

- **Print as a paper test** on the Time Test start page, for students.
- **Print a class test** on the teacher page, with a code, for the same paper across a class. The answer key sits behind the teacher code.

**Paper layout: A4, about 7 pages, black and white**

| Part of the paper | What it shows |
|---|---|
| Top of page 1 | Name, class, date, "Time Test", total marks, approx. 45 minutes, "You may use a calculator." |
| Parts A to C | One column, in stop order. Marks in brackets at the right. Never split a question across pages. |
| Part D | Graph or table, or the passage. Prompt. 10 ruled lines. No checklist on the student paper. |
| Last page | Data sheet: element card, electron ladder, V = I × R triangle. |
| Footer | Test code and page number. No standards anywhere. |

| Question type | How it prints |
|---|---|
| Choose one | Lettered options, shuffled by seed, so the answer isn't always first |
| Tick all | Tick boxes |
| Gap | Blank lines. No word bank. |
| Sort | Table of ticks |
| Match | Numbered items and lettered answers in a different order. "Write your answer as 1B, 2A." |
| Order | Lettered items and numbered boxes |
| Table | Empty table with the choices listed |
| Calculate | Working box, then an answer line with the unit |
| Circuit, trace or graph | Drawn as line art from the same data |

**Answer key:** same layout with answers filled in. It adds the model answers and the four ticks for each paragraph, for you or the students to mark with.

## 6. Class review sets

12 sets, one before each lesson from Lesson 2 to the test. A code works the same way in class or on a student's device.

### How they fit your bell ringers

I read the nine bell ringers marked Electricity in Airtable:

| Bell ringer | Questions | Electricity | Bootcamp | Chemistry |
|---|---|---|---|---|
| 1 | 3 | 0 | 3 | 0 |
| 2 | 4 | 2 | 2 | 0 |
| 3 | 4 | 2 | 2 | 0 |
| 4 | 4 | 3 | 1 | 0 |
| 5 | 4 | 2 | 2 | 0 |
| 6 | 4 | 3 | 1 | 0 |
| 7 | 4 | 2 | 2 | 0 |
| 8 | 4 | 3 | 1 | 0 |
| 9 | 4 | 1 | 1 | 2 |
| **Total** | **35** | **18** | **15** | **2** |

What this means for each set:

| Q | Slot | Marks | Source |
|---|---|---|---|
| 1 | Word or fact | 1 | Flashcards, or a short recall question |
| 2 | Investigation skill | 2 | F14 or X1 |
| 3 | Calculate | 2 | Only maths taught in class: F3, F7, F10, F13, F23 |
| 4 | Predict or diagnose | 2 | Family |
| 5 | Paragraph | 4 ticks | Data and reading in turn |

- **Marks:** 11 per set.
- **Time:** approx. 12 minutes: about 4 for the short questions and 8 for the paragraph.
- **Projection:** Screen 1 shows Q1 to Q4 in your usual 2 × 2 layout on the 1080 × 1080 square. Screen 2 shows Q5 with its graph or passage. "Show answers" works on both. There is no timer, because you run yours beside it.
- **Your other rules still apply:** easiest first, matching letters scrambled, and a word bank only on a cloze.
- **Paper:** a paragraph won't fit on your 4x slip, so use "Print 2 to a page" (A5), with Q5 on the back and no answers.
- **New ground:** your 18 electricity bell ringer questions cover atoms, static, circuits, and series and parallel. Sets S05 to S12 add electromagnets, generators, AC/DC and energy sources.

**Rules:** no topic more than twice in Q1, Q3 and Q4; at least two topics in those three; only ideas taught by that lesson and taught in the sim, apart from the skill question; paragraphs alternate between data and reading. No sim-only maths.

**Codes.** Each code from S01 to S12 holds the exact questions below, so what you preview is what the class sees. The paragraph uses the sample data in section 3. Custom codes from the teacher page use the seeded generator.

### S01: before Lesson 2: Static Electricity

Topics so far: What is electricity?, Atoms.

| Q | From | Form | Question | Answer |
|---|---|---|---|---|
| 1 | card Q05 | True/False | Protons and neutrons are found in the nucleus. | True. |
| 2 | X1 A | Short answer | “The balloon moved towards the jumper.” Is this an observation or an inference? | An observation. |
| 3 | F3 A | Table | Carbon has atomic number 6 and mass number 12. How many protons, neutrons and electrons does a neutral atom have? | 6 protons, 6 neutrons, 6 electrons. |
| 4 | F1 B | Short answer | Mystery ball X repels a positive ball. What is the charge on X? | Positive. |
| 5 | C1 | Paragraph | Gold foil: Prompt 1 | Model answer in section 3 |

### S02: before Lesson 3: Current Electricity

Topics so far: What is electricity?, Atoms, Static.

| Q | From | Form | Question | Answer |
|---|---|---|---|---|
| 1 | card Q06 | Short answer | Which particle moves around outside the nucleus? | The electron. |
| 2 | X1 B | Short answer | You rub a balloon 5, 10 and 15 times and count the bits of paper it picks up. Name the independent and dependent variables. | Independent: the number of rubs. Dependent: the bits of paper picked up. |
| 3 | F7 A | Math | A balloon and wool start neutral. The balloon gains 6 electrons. What is its charge? | −6. |
| 4 | F8 A | Short answer | Ball B is repelled by a negative ball and attracted by a positive ball. What is its charge? | Negative. |
| 5 | D2 | Paragraph | Painting cars with static: Explain prompt | Model answer in section 3 |

### S03: before Series & Parallel Circuits

Topics so far: What is electricity?, Atoms, Static, Circuits.

| Q | From | Form | Question | Answer |
|---|---|---|---|---|
| 1 | card Q14 | True/False | An object that gains electrons becomes negative. | True. |
| 2 | X1 B | Short answer | Write a hypothesis. Independent variable: number of cells. Dependent variable: brightness of a bulb. | If the number of cells goes up, then the bulb will get brighter, because more cells give a bigger push. |
| 3 | F10 A | Math | Three 1.5 V cells face the same way in a row. What is the total voltage? | 4.5 V. |
| 4 | F9 A | Multiple choice | A plain wire joins one side of a bulb to the other. Will the bulb light? | No. It is a short circuit. |
| 5 | C2 | Paragraph | Cells and current: Prompt 1 | Model answer in section 3 |

### S04: before Lesson 8: Electromagnets

Topics so far: What is electricity?, Atoms, Static, Circuits, Series and parallel.

| Q | From | Form | Question | Answer |
|---|---|---|---|---|
| 1 | card Q47 | Fill in the blank | In a series circuit, the current is the ___ everywhere. | Same. |
| 2 | X1 A | Short answer | Readings: 1 cell 0.36 A, 2 cells 0.68 A, 3 cells 0.98 A. What happens to the current as cells are added? | It goes up. |
| 3 | F23 A | Math | A parallel circuit has branches of 0.28 A and 0.57 A. What does the main wire carry? | 0.85 A. |
| 4 | F8 B | Short answer | Ball B is positive. What will it do near a negative ball? | It will attract the negative ball. |
| 5 | D7 | Paragraph | Wiring a home: Explain prompt | Model answer in section 3 |

### S05: before Lesson 9: Generators

Topics so far: What is electricity?, Atoms, Static, Circuits, Series and parallel, Electromagnets.

| Q | From | Form | Question | Answer |
|---|---|---|---|---|
| 1 | card Q28 | True/False | An electromagnet stops being a magnet when you switch it off. | True. |
| 2 | F14 A | Short answer | Does the number of coils change how strong an electromagnet is? Name one controlled variable. | Number of cells, type of core or size of the clips. |
| 3 | F13 A | Math | 10 coils lift 5 clips, 20 coils lift 10 clips, 30 coils lift 15 clips. Predict the clips for 50 coils. | 25 clips. |
| 4 | F24 A | Multiple choice | Which is brighter on one cell: two bulbs in parallel or two bulbs in series? | The bulbs in parallel. |
| 5 | C3 | Paragraph | Coils and clips: Prompt 2 | Model answer in section 3 |

### S06: before Lesson 10: AC/DC

Topics so far: What is electricity?, Atoms, Static, Circuits, Series and parallel, Electromagnets, Generators, Conductors, Bulbs and energy.

| Q | From | Form | Question | Answer |
|---|---|---|---|---|
| 1 | card Q39 | Fill in the blank | A generator turns movement into ___ energy. | Electrical. |
| 2 | X1 B | Short answer | Write an open and testable research question. Variables: material of the core, and clips picked up. | How does the material of the core affect the number of clips an electromagnet picks up? |
| 3 | F23 B | Math | The main wire carries 0.9 A. One branch carries 0.35 A. What does the other carry? | 0.55 A. |
| 4 | F18 A | Multiple choice | A magnet sits perfectly still inside a coil. What does the meter read? | Zero. |
| 5 | D4 | Paragraph | Keeping wires safe: Benefit and drawback prompt | Model answer in section 3 |

### S07: before Lesson 11: Renewable Energy Sources

Topics so far: What is electricity?, Atoms, Static, Circuits, Series and parallel, Electromagnets, Generators, Conductors, Bulbs and energy, AC and DC.

| Q | From | Form | Question | Answer |
|---|---|---|---|---|
| 1 | F25 | True/False | In AC electricity, electrons move in one direction around the circuit. | False. |
| 2 | X1 B | Short answer | Write a hypothesis. Independent variable: turns each second. Dependent variable: peak voltage of a generator. | If the turns each second go up, then the peak voltage will go up, because the magnet moves past the coil faster. |
| 3 | F10 A | Math | Six 1.5 V cells are in a row. Two face the wrong way. What is the total voltage? | 3 V. |
| 4 | F22 A | Short answer | 0.24 A flows into a bulb. How much flows out? | 0.24 A. The energy is transferred; the current stays the same. |
| 5 | C6 | Paragraph | Generator peak voltage: Prompt 2 | Model answer in section 3 |

### S08: before Objective D Lesson 1

Topics so far: What is electricity?, Atoms, Static, Circuits, Series and parallel, Electromagnets, Generators, Conductors, Bulbs and energy, AC and DC, Producing electricity, Renewables.

| Q | From | Form | Question | Answer |
|---|---|---|---|---|
| 1 | card Q56 | Fill in the blank | Almost every power station spins a ___ that turns a generator. | Turbine. |
| 2 | X1 A | Short answer | The meter shows 0 MW at 9 pm. “The Sun has set, so the panels can’t work.” Is the second sentence an observation or an inference? | An inference. |
| 3 | F23 A | Math | Three identical bulbs are in parallel. Each branch carries 0.32 A. What does the main wire carry? | 0.96 A. |
| 4 | F32 B | Multiple choice | A town uses only solar panels and has no batteries. When is a blackout most likely? | In the evening, after the Sun has set. |
| 5 | D8 | Paragraph | Sending power a long way: Explain prompt | Model answer in section 3 |

### S09: before Objective D Lesson 2

Topics so far: What is electricity?, Atoms, Static, Circuits, Series and parallel, Electromagnets, Generators, Conductors, Bulbs and energy, AC and DC, Producing electricity, Renewables.

| Q | From | Form | Question | Answer |
|---|---|---|---|---|
| 1 | F28 A | True/False | Nuclear power is renewable. | False. Uranium will run out. |
| 2 | F14 A | Short answer | Does the number of bulbs in series change the current? Name the independent and dependent variables. | Independent: the number of bulbs. Dependent: the current. |
| 3 | F3 A | Math | Phosphorus has atomic number 15 and mass number 31. How many neutrons does it have? | 16 neutrons. |
| 4 | F12 A | Multiple choice | P has 30 coils and 2 cells. Q has 50 coils and 1 cell. Both have iron cores. Which is stronger? | P (12 clips against 10 clips). |
| 5 | C10 | Paragraph | Demand and solar: Prompt 1 | Model answer in section 3 |

### S10: before Objective D Lesson 3

Topics so far: What is electricity?, Atoms, Static, Circuits, Series and parallel, Electromagnets, Generators, Conductors, Bulbs and energy, AC and DC, Producing electricity, Renewables.

| Q | From | Form | Question | Answer |
|---|---|---|---|---|
| 1 | card Q32 | Short answer | Why are wires coated in plastic? | Plastic is an insulator, so it keeps us safe. |
| 2 | X1 A | Short answer | “The bulb looks dim.” Is this qualitative or quantitative? | Qualitative. |
| 3 | F23 B | Math | The main wire carries 1.2 A. Two branches carry 0.4 A and 0.35 A. What does the third branch carry? | 0.45 A. |
| 4 | F28 B | Multiple choice | A cloudless desert has no rivers. Which source suits it best: solar, hydro or tidal? | Solar. |
| 5 | D9 | Paragraph | Coal or wind?: Benefit and drawback prompt | Model answer in section 3 |

### S11: before Objective A Review

Topics so far: What is electricity?, Atoms, Static, Circuits, Series and parallel, Electromagnets, Generators, Conductors, Bulbs and energy, AC and DC, Producing electricity, Renewables.

| Q | From | Form | Question | Answer |
|---|---|---|---|---|
| 1 | card Q27 | Short answer | Name three ways to make an electromagnet stronger. | More coils, more cells and an iron core. |
| 2 | X1 A | Short answer | “If a coil has more turns of wire, then the peak voltage will go up, because more wire passes the magnet.” Is this a hypothesis? | Yes. It links the two variables and gives a reason. |
| 3 | F3 B | Math | An atom has 17 protons, 18 neutrons and 18 electrons. What is its overall charge? | −1. |
| 4 | F9 B | Multiple choice | Two cells face opposite ways in a loop with a bulb. What one change lights the bulb? | Turn one cell round. |
| 5 | C7 | Paragraph | Bulbs in series: Prompt 2 | Model answer in section 3 |

### S12: before Objective A Test

Topics so far: What is electricity?, Atoms, Static, Circuits, Series and parallel, Electromagnets, Generators, Conductors, Bulbs and energy, AC and DC, Producing electricity, Renewables.

| Q | From | Form | Question | Answer |
|---|---|---|---|---|
| 1 | card Q41 | Short answer | What gets used up in a circuit? | Energy. The current stays the same all the way round. |
| 2 | X1 A | Short answer | Which tool measures the voltage across a bulb, and in which unit? | A voltmeter, in volts (V). |
| 3 | F10 A | Math | Five 1.5 V cells are in a row. One faces the wrong way. What is the total voltage? | 4.5 V. |
| 4 | F27 B | Short answer | Why are transformers used on long power lines? | They raise the voltage, so less energy is wasted as heat. |
| 5 | D1 | Paragraph | Stopping lightning damage: Benefit and drawback prompt | Model answer in section 3 |

## 7. Check against your Airtable bank

All 51 questions tagged for G6 electricity. The Unit field is blank on these records, so I filtered by Grade G6 and the electricity tags. Four other G6 rows have no tags: three are empty and one is a research question.

39 of the 51 are covered by sim families, cards or reused questions. 5 are not in the sim: four on fuses and plugs, and one on what to rub to make static. 7 are on the greenhouse effect, also out of this sim. Those seven are still tagged Electricity Unit in Airtable, though your sequence teaches them in Survival & Ecology, Lesson 9.

Going the other way, these sim families have no question in the bank: F1, F5, F6, F8, F10, F12, F13, F14, F15, F16, F19, F20, F21, F22, F23, F26, F27, F30, F31, F32. F14's variables skill does appear in your Bootcamp questions.

| Bank question | Record | Covered by | Note |
|---|---|---|---|
| Particle found outside the nucleus | `recIqCAbOL3phAuwd` | Card Q06 |  |
| Particles found in the nucleus | `recJYbrrRTQowlGji` | Card Q05 |  |
| Match particle to charge and place | `recgJNcjBMFnvrOcK` | Reuse: atom Foundation Q3; cards Q05, Q06 |  |
| Table: H, O, He | `rec6WjSUBQpjxJKCJ` | F3 |  |
| Table: H and C | `recI6gfC8PNESydTR` | F3 |  |
| Table: He and N | `recb4D6Ty94t9AeBG` | F3 |  |
| Table: Ne and O | `recjUNWx1Dq2WYPq8` | F3 |  |
| Draw: 5p, 6n, 5e, and its charge | `rec6iqCvrdZ0NS12I` | F3 (class form: draw) |  |
| Draw: 4p, 4n, 2e, and its charge | `recB8RZfaWi21ekeX` | F3 (class form: draw) | Beryllium usually has 5 neutrons. The sum still works. |
| Draw hydrogen | `reckEJOwXUwF89SPR` | F4 (class form: draw) |  |
| Draw lithium | `recwZWnnEIMSbcCEl` | F4 (class form: draw) |  |
| Draw carbon | `recjZ0BYyzhH1mJ7x` | F4 (class form: draw) |  |
| Draw nitrogen | `recaDMPPrvLwPtIFw` | F4 (class form: draw) |  |
| Label the atom 1.1 | `recnK743LHKVWVEz0` | F4 (class form: label) |  |
| Label the atom 1.2 | `receo6lNHPa5C49ic` | F4 (class form: label) |  |
| Static fill 1.1 | `rec0E0qxljamQNCYx` | F7; cards Q13 to Q15 | Fixed 4 Nov: now says “because opposite charges attract”. The attached picture needs swapping. |
| Static fill 1.2 | `reccnfE5RTU6LfNtS` | F7; cards Q13 to Q15 | Fixed 4 Nov: blank is now “opposite charges ___”, and “attract” replaced “neutral” in the word bank. The attached picture needs swapping. |
| Static fill: charge, discharge | `recRm2kOBuIdKb8Eb` | F7 | Typo: “if they those objects”. “Discharge” is not in the sim. |
| What we rub to make static | `recRbUxr0E4vOpmil` | Not in the sim |  |
| Match static and current to definitions | `recGDnS4XKwZ3gLiL` | F2 |  |
| T/F: flows in an open circuit | `recRRjt0Eb39kG80B` | F9; card Q20 | Tagged Series, Parallel. Better under Circuits. |
| Circuits 1: will it light? (short circuit) | `rec9MbNAXDFbUGNfP` | F9 |  |
| Circuits 2: will it light? (loose wire) | `recUJ4s1YPNPPsgNK` | F9 |  |
| Match battery, switch, resistor, bulb | `recGv4cY7glTRMBKj` | F11 |  |
| Draw series: bulb, switch, battery | `recpsxtvSvgZQJ3KX` | F11 (class form: draw) |  |
| Draw series: 2 bulbs, battery, ammeter | `recVa7zUTWulIrElK` | F11 (class form: draw) |  |
| Draw series: battery, 3 bulbs, switch | `recerc01FVSoArH3x` | F11 (class form: draw) |  |
| Classify glass, aluminium, rubber, steel | `reciSSC38jNYe9wvS` | F17 |  |
| Series: brightness as bulbs are added | `receA1SLobv48Ad3y` | F24; card Q50 |  |
| Parallel: remove one bulb | `rec6UleAs0CYsbSqB` | F24 |  |
| Which circuit has the brightest bulb? | `rechdfpEbb1qeQyHN` | F24 |  |
| Parallel fill: pathways and switch | `reccVpqc91BJl7uV8` | F24 |  |
| Why homes use parallel | `recUumO6Px5O2AjXp` | F24; D7 |  |
| T/F: magnets push and pull electrons | `recNCIUeEricZCaLN` | F18; card Q36 | Not stated in the sim in these words. |
| Explain how a generator works | `rec3HOe3nUniIOPt4` | Cards Q36, Q40; F29; D5 |  |
| AC and DC fill | `recFwAwqZ7asTqsob` | F25 |  |
| T/F: AC electrons move one way | `recrLao1UQaWn2Hza` | F25 |  |
| Which is non-renewable? | `recLI5RJQW9kp913D` | F28 |  |
| Pros and cons of energy sources | `recdWqDImEgUcCg9L` | F28; D9 | “Cheap and easy to make panels” is generous for solar. The sim says making panels uses a lot of materials. |
| Match fuse, generator, turbine, circuit | `reczKQbIFgxYCwe2h` | F29, F11 | Fuse is not in the sim. |
| Purpose of a fuse | `rec93aUgkPTsuviM1` | Not in the sim |  |
| Plug fill (word bank) | `recaXIKr166WjK4bA` | Not in the sim | Duplicate of the next row. Tagged Series, Parallel. |
| Plug fill | `recmcVMVKuHbHtyQT` | Not in the sim | UK plugs have fuses, but Beijing plugs do not. |
| Two safety features of a plug | `recvNcAFOEi1IKWwG` | Not in the sim |  |
| Why the greenhouse effect matters | `rec2LpQfIme4qSJHV` | Greenhouse effect: not in the sim | Option b says “at night” only. |
| Main enhanced greenhouse gas | `recVCTo6N2lkKPSyJ` | Greenhouse effect: not in the sim |  |
| T/F: sunlight reflects off greenhouse gases | `recjMwJyCfnXfVUIi` | Greenhouse effect: not in the sim | Unclear. Greenhouse gases mainly trap heat rising from Earth; clouds and ice reflect sunlight. Suggest rewording. |
| Normal or enhanced: tick table | `recmtvb6rqutQBrmp` | Greenhouse effect: not in the sim |  |
| Draw four greenhouse arrows | `reconpxMXD1WEgdrd` | Greenhouse effect: not in the sim |  |
| Normal against enhanced | `recpWoJQa0UB9kvmC` | Greenhouse effect: not in the sim |  |
| When greenhouse gases rise too high | `recwi32dsyQiw1xET` | Greenhouse effect: not in the sim |  |

## 8. Checks and fixes

### What was checked

- **Family arithmetic:** a script ran every generator range, 8,538 value combinations, with exact fractions where it matters. All pass. One sample landed on an exact half and was replaced, and that case is now barred.
- **Circuits:** all 11 F9 set-ups and the F24 brightness claims were solved with the sim's own values.
- **Existing questions:** all 33 calculations in the build were recalculated. All are correct.
- **Sets:** every question uses only topics taught by then; the interleaving rules pass for all 12.
- **Gravity:** no student calculation uses g. The one optional example uses 9.8 N/kg.
- **Student text search:** torch 0, speed 0, MYP 0, criterion 0, objective 0, strand 0, ACARA 0, standard 0.
- **Facts in passages:** checked against the sources below. Where sources disagree on Niagara to Buffalo (about 32 to 42 km), D8 says "more than 30 km".

**Reading level** (Flesch-Kincaid grade, estimated). Science words such as "electricity" push this up, so read it as a guide.

| Text | Items | Average | Highest |
|---|---|---|---|
| Passages | 10 | 5.5 | 7.0 |
| Model answers | 40 | 5.7 | 7.7 |
| Prompts | 40 | 6.0 | 10.7 |
| New definitions | 27 | 4.9 | 9.9 |
| Q&A cards | 58 | 4.5 | 15.1 |
| Sample questions | 66 | 3.6 | 12.5 |
| Class sets | 48 | 4.3 | 16.1 |

Short items swing a lot because one long word dominates them. Passages and model answers are the fairer test.

### Done in the build

1. **Mass, not weight.** Four crane loads said "weighs". They now say mass.
2. **Core values.** Aluminium, wood and no core all use 0.1 in `CORES`. The steel works mission still needs steel, because aluminium can't lift the beam.

### For the retrieval build

1. **Induction.** Add to the "Move the magnet" step, after the student answers: "Making a voltage by moving a magnet near a wire is called **induction**." Add the card's definition to `GLOSSARY`.
2. **Bulb Foundation Q3** can't stand alone. "Using the same bulb" could repeat the 240 J and 22 J.
3. **Lumens.** The glossary says a flashlight bulb gives "a few lumens". Most give far more. Suggest "a small flashlight gives tens of lumens".
4. **Element card:** add potassium and calcium.
5. **`VOCAB`:** add voltage and voltmeter to circuits and ion to atom. Remove sustainable and energy storage. Use the phrase "energy transfer" once in the "Follow the energy" step.
6. **Old `bank` arrays.** Each stop still holds 6 to 10 older choice questions with the answer always first. Don't reuse these without shuffling. The seven "Will the bulb light?" circuits in the circuits bank are a good start for F9.

### Bell ringer wording

The sim teaches that rubbing moves electrons and that opposite charges attract. It never says atoms want anything. Static Electricity 1.1 and 1.2 now use "because opposite charges attract" in Airtable. Each record also has a picture of the old text, which needs swapping by hand for the new pictures, and bell ringers 3 and 5 need their PDFs made again.

### Fixes for Airtable

Listed in the Note column of section 7. Only one of the 51 records has its answer filled in, so the bank can't yet be checked automatically.

## Sources

- [Rutherford's 1911 paper, summary: about 1 in 20,000 for gold](https://web.chemteam.info/AtomicStructure/Rutherford-Model.html)
- [Toyota: electrostatic paint heads, about 95% reaching the body](https://mag.toyota.co.uk/toyota-electrostatic-spray-head/)
- [US EPA: recycling steel saves 60 to 74% of the energy](https://archive.epa.gov/epawaste/conserve/smm/wastewise/web/html/factoid.html)
- [Trevor Baylis and the wind-up radio](https://en.wikipedia.org/wiki/Trevor_Baylis)
- [PBS SoCal: Los Angeles LED street lights](https://pbssocal.org/redefine/l-a-replaces-thousands-of-street-lights-with-leds)
- [Penn State: Edison's DC range; Niagara to Buffalo, 1896](https://www.e-education.psu.edu/geog469/node/207)
