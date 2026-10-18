# tmh-teaching-apps

Interactive science sims and labs for WAB MS Science (Grade 6–8). Each app is a single HTML file that runs offline, so it can be uploaded straight to Toddle.

## Apps

| Folder | App | Unit | Upload this file to Toddle | Status |
|---|---|---|---|---|
| `force-hq/` | Force HQ | G7/8 Forces | `Force-HQ-offline.html` | Ready |
| `sparks-through-time/` | Sparks Through Time | G6 Electricity | `Sparks-Through-Time.html` | Ready |
| `adapt-lab/` | Adapt Lab | G7/8 Adaptations & evolution | `Adapt-Lab.html` | Needs internet: loads Google Fonts and the PDF library online (see backlog) |
| `paper-plane-lab/` | Paper Plane Lab | G6 Scientific method | `Paper-Plane-Lab-offline.html` | Ready |
| `tilt-lab/` | Tilt Lab | G7/8 Earth in Space (seasons) | `Tilt-Lab-offline.html` | Ready |

`Force-HQ.html` is the source used for the online Claude preview; the `-offline` copy is the same app wrapped as a full web page.

## Other folders

- `shared/`: the reusable lab shell (journal, info cards, question box, calculator, worksheet export, tour). Planned; see `shared/README.md`.
- `.claude/skills/wab-science-sim-builder/`: the instructions Claude follows when building or changing a sim. Loads automatically in Claude Code.

## Still in the claude.ai project

Build briefs and teacher notes (Gravity Lab, Moon Lab, Adapt Lab graphics, Planet Dice, Tilt Lab worksheet notes) are still in the "Science Apps and Sims" project. They can be moved here into each app's `docs/` folder when that app is next worked on.

## Backlog

- **Adapt Lab offline:** embed its fonts and the jsPDF library so it works without internet, in line with the other apps.
- **Shared shell:** pull the common components out of Force HQ into `shared/` and reuse them in the next sim.
