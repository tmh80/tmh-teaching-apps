# tmh-teaching-apps

Interactive science sims and labs for WAB MS Science (Grade 6–8). Each app is a single HTML file that runs offline, so it can be uploaded straight to Toddle.

## Apps

| Folder | App | Unit | Upload this file to Toddle | Status |
|---|---|---|---|---|
| `force-hq/` | Force HQ | G7/8 Forces | `Force-HQ-offline.html` | Ready |
| `force-hq-rebuild/` | Force HQ (October 2026 rebuild) | G7/8 Forces | `Force-HQ-Rebuild-offline.html` | In progress: Chapters 1 and 2 (Foundation + Extension) ready; Toddle PDFs in `worksheets/`. Source in `src/`, rebuild with `python3 build.py`. Will replace `force-hq/` when finished |
| `sparks-through-time/` | Sparks Through Time | G6 Electricity | `Sparks-Through-Time.html` | Ready |
| `adapt-lab/` | Adapt Lab | G7/8 Adaptations & evolution | `Adapt-Lab-offline.html` | Ready |
| `paper-plane-lab/` | Paper Plane Lab | G6 Scientific method | `Paper-Plane-Lab-offline.html` | Ready (source in `src/`, rebuild with `node build.js`) |
| `tilt-lab/` | Tilt Lab | G7/8 Earth in Space (seasons) | `Tilt-Lab-offline.html` | Ready |

`Force-HQ.html` and `Adapt-Lab.html` are the sources used for the online Claude previews; each `-offline` copy is the same app wrapped as a full web page, with its fonts (and, for Adapt Lab, the jsPDF library used for PDF exports) embedded so it makes no internet requests.

## Other folders

- `shared/`: the reusable lab shell (journal, info cards, question box, calculator, worksheet export, tour). Planned; see `shared/README.md`.
- `.claude/skills/wab-science-sim-builder/`: how Claude builds simulations (free play, discovery, extension).
- `.claude/skills/wab-virtual-lab-builder/`: how Claude builds formative virtual labs with a lab report and feedback sheet (Paper Plane Lab is the template).

Both load automatically in Claude Code.

## Still in the claude.ai project

Build briefs and teacher notes (Gravity Lab, Moon Lab, Adapt Lab graphics, Planet Dice, Tilt Lab worksheet notes) are still in the "Science Apps and Sims" project. They can be moved here into each app's `docs/` folder when that app is next worked on.

## Backlog

- **Force HQ rebuild:** Chapters 2–5, the Drop Zone and the Workshop. Reuse content from the old `force-hq/Force-HQ.html` where it fits the new section format. Brief and plan in `force-hq-rebuild/docs/`.

- **Shared shell:** pull the common components out of Force HQ into `shared/` and reuse them in the next sim.
- **Adapt Lab:** after any change to `Adapt-Lab.html`, rebuild `Adapt-Lab-offline.html` from it (swap the Google Fonts links for the embedded fonts and inline jsPDF 2.5.1) so the Toddle copy stays in step.
