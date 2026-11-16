# tmh-teaching-apps

Interactive science sims and labs for WAB MS Science (Grade 6–8). Each app is a single HTML file that runs offline, so it can be uploaded straight to Toddle.

## Apps

| Folder | App | Unit | Upload this file to Toddle | Status |
|---|---|---|---|---|
| `force-hq/` | Force HQ | G7/8 Forces | `Force-HQ-offline.html` | Ready |
| `force-hq-rebuild/` | Force HQ (October 2026 rebuild) | G7/8 Forces | `Force-HQ-Rebuild-offline.html` | In progress: Chapters 1, 2, 3, 4 and 5 (Drop Zone) ready, each as a Foundation + Extension; Chapter 6 (the Workshop, "Save Captain Smooshy!") is complete: Parts 1 to 4, Part 5 (Operation Gummy Lift, a free-build rescue mission, rebuilt 7 Nov 2026), an optional Extension and four Build tasks; the Drop Zone, helicopter and Workshop are also in Explore; Vocab flashcards (16 Nov 2026: tick covered topics to build a deck of 70 hand-drawn index cards, spaced repetition like Sparks); Toddle PDFs in `worksheets/`. Source in `src/`, rebuild with `python3 build.py`. Will replace `force-hq/` when finished |
| `sparks-through-time/` | Sparks Through Time | G6 Electricity | `Sparks-Through-Time.html` | Ready (Nov update: PDF download button, MYP strands, AI feedback text; teacher page can make the Challenge optional; reading and writing steps and shorter Checks in electromagnets, generators, acdc and power) |
| `adapt-lab/` | Adapt Lab | G7/8 Adaptations & evolution | `Adapt-Lab-offline.html` | Ready |
| `paper-plane-lab/` | Paper Plane Lab | G6 Scientific method | `Paper-Plane-Lab-offline.html` | Ready (source in `src/`, rebuild with `node build.js`) |
| `tilt-lab/` | Tilt Lab | G7/8 Earth in Space (seasons) | `Tilt-Lab-offline.html` | Ready. Landing page (rolling Uranus with the Sun behind) with Guided, Exploration, My investigation, My completed worksheets (the worksheet library) and a teacher button. Name and class screen (teacher code `TILT`), answers saved per student, every stage and step open. Two big modes: Guided and Exploration (a dashboard where students add or remove any views). My investigation: 12 open research questions (Foundation, Extension, Mastery) with a journal (notes, answer), one-at-a-time tips that name the view and what to look for, a 📷 screenshot button on every view (up to 5 pieces of evidence in total, each explained), a Force HQ-style answer check (words to use, then a checklist), a table maker and a graph maker (drag points or bars onto the graph, like Paper Plane Lab) that can be chosen as evidence, and a worksheet per question showing tips used, evidence, key words and ideas for marking; students can also write their own question with checked readings. One worksheet per section (Foundation, Extension, Investigation) unlocks with a Save worksheet button when the section is finished. Every worksheet is fitted to two A4 pages at most (print or save as PDF). Teacher page has exploration ideas with group tables and a research-question marking guide |

`Force-HQ.html` and `Adapt-Lab.html` are the sources used for the online Claude previews; each `-offline` copy is the same app wrapped as a full web page, with its fonts (and, for Adapt Lab, the jsPDF library used for PDF exports) embedded so it makes no internet requests.

## Other folders

- `shared/`: the reusable lab shell (journal, info cards, question box, calculator, worksheet export, tour). Planned; see `shared/README.md`.
- `.claude/skills/wab-science-sim-builder/`: how Claude builds simulations (free play, discovery, extension).
- `.claude/skills/wab-sim-review-questions/`, `wab-sim-toddle-outputs/` and `wab-sim-open-builders/`: companions to the sim builder, covering questions, Toddle outputs and open builders.
- `.claude/skills/wab-virtual-lab-builder/`: how Claude builds formative virtual labs with a lab report and feedback sheet (Paper Plane Lab is the template).

Both load automatically in Claude Code.

## Still in the claude.ai project

The project holds small text docs only (briefs, handoffs, scripts, specs). HTML files live here in the repo and are no longer copied into the project (1 Nov 2026), because the project has a size limit.

Build briefs and teacher notes (Gravity Lab, Moon Lab, Adapt Lab graphics, Planet Dice, Tilt Lab worksheet notes) are still in the "Science Apps and Sims" project. They can be moved here into each app's `docs/` folder when that app is next worked on.

## Backlog

- **Flashcards with spaced repetition, in every sim and lab:** done in Sparks Through Time and Force HQ (16 Nov 2026, index-card look; spec in `force-hq-rebuild/docs/Flashcards_Spec.md`). Still to do: Adapt Lab, Tilt Lab and Paper Plane Lab. The Force HQ engine (`63-flashcards.js`, `64-fcart-kit.js`, `flashcards.css`, `fonts-hand.css`) is a good candidate for `shared/`.

- **Force HQ rebuild:** Explore "draw what's happening now" (Chapter 6 is finished). Port from the old `force-hq/Force-HQ.html` with `force-hq-rebuild/tools/old.py` rather than rebuilding. Start with `force-hq-rebuild/docs/Force_HQ_Handoff.md`.

- **Shared shell:** pull the common components out of Force HQ into `shared/` and reuse them in the next sim.
- **Adapt Lab:** after any change to `Adapt-Lab.html`, rebuild `Adapt-Lab-offline.html` from it (swap the Google Fonts links for the embedded fonts and inline jsPDF 2.5.1) so the Toddle copy stays in step.
- **Tilt Lab (still to do):** the Toddle AI-marking pack, the "set classwork or homework" prompt generator, the calculator, the guided tour, draggable pop-ups, and one-go answers on the typed explore steps (the multiple-choice check questions are one go already).

## Sparks Through Time: retrieval features (Nov 2026)
Flashcards, Review mode, the new Time Test, class review sets and a save code live in `sparks-through-time/retrieval/src/`. Run `node retrieval/build-retrieval.js` from `sparks-through-time/` to place them in `Sparks-Through-Time.html`, then run the tests in `retrieval/tests/`. Content comes from `docs/Sparks_Retrieval_Catalogue.md`; `src/01-data.js` is generated from it.

Still to try by hand: the real Save as PDF buttons, printing on school printers, and everything on a student Toddle account on a laptop and an iPad.

## Sparks Through Time: reading and writing chapters (Nov 2026)
Script: `sparks-through-time/docs/Sparks_Reading_Writing_Script.md`. Electromagnets, generators, acdc and power have new Learn steps (Read it, Mark it, Write it), a new `mark` question type ("Mark it": label sentences, one point each) and a shorter Foundation Check that ends with a Mark it and a Data or Reading paragraph. The old Foundation lists stay on each stop as `reviewArchive` for Review and the Time Test. These four Checks save under a new key (`<stop>~f2`), so old Check answers are not carried over; Learn answers and stamps are kept through `learnKeys`. Teacher-only strands Cii and Ciii are added. Test: `node sparks-through-time/retrieval/tests/test-chapters.js`. Open question for Tom: the word "speed" stays in the "Turning speed" slider, "Spin it!" and challenge g2.
