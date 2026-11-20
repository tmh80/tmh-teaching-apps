# Plan: rooms, table shapes, class setups and stations

**For:** the implementing agents (one phase each), reviewed by the planner between phases.
**App:** ClassPanels (Electron + React). Almost everything is in `src/teacher-app.jsx` (~6,400 lines).
**Branch:** `classpanels-rooms`. `main` stays as the version Tom is using now, until he has tried this branch and is happy with it.

Match the existing code style throughout:
- inline `style={{…}}`, the `'Source Sans 3'` font and `#1a1a2e` for primary buttons;
- a `title=` on every control, because Help mode reads them;
- short `/* … */` comments that explain *why*.

Read `CHECKLIST_PLAN.md` to see how an earlier feature was handed over.

---

## 0. Ground rules (every phase)

1. **Tom's real data is sacred.** He is using the app every day for seating and for what students owe. Every change must load his existing saved data unchanged.
   - Never delete or rewrite an existing storage key's meaning. New data goes in **new keys**, or in **new optional fields** that old code ignores.
   - Migrations must be **idempotent**: running one twice gives the same result. They also leave the old keys in place, so a rollback to `main` still works.
   - Bump `cp-schema` (a new key, an integer) only once a migration has succeeded.
2. **Never use real student data.** Test with the fixture in `tests/fixtures/` (fake names), which Phase 0 creates.
3. **Build and test after every change:** run `npm run build`, then the Playwright smoke tests (`node tests/run.js`, also from Phase 0). A phase is not done until:
   - the build has no new warnings;
   - all the tests pass, including the "old data still loads" test;
   - there are screenshots of the new UI for the planner to review, saved in the scratchpad and not committed.
4. **Commit in small working steps** on `classpanels-rooms`, with plain-English messages.
5. Keep the whole app working in a **plain browser**, not just Electron. `window.storage` falls back to localStorage (`src/index-template.html`), and the tests rely on that.

## 1. What Tom wants (outcomes)

| # | Outcome |
|---|---|
| A | **Table shapes:** single desk, pair, **long table of 4**, **trapezoid (max 4 students)**, round, plus lab benches. Every piece can be **rotated**. Pieces **snap together** edge to edge, so two trapezoids make a **hexagon** and two long tables make a longer table. Joined pieces act as one table. |
| B | **One-click class switching:** a row of class chips at the top of the app. |
| C | **More charming look:** brighter and a little playful, but true to the app icon. That means coloured-pencil hatching, dark ink outlines, warm wood, and mint, sky blue and pale cyan. |
| D | **Room builder:** walls, doors and windows, plus common classroom and science-lab items, each with an editable **label**. A room then doubles as a **classroom map**, for example showing where the lab stations, sinks and eyewash are. |
| E | **Room library:** each room (e.g. "Lab 204") is built once and can hold **several saved layouts** of its furniture (e.g. "Rows", "Clusters", "Exam"). Classes choose a room and a layout. |
| F | **Class setups as tabs:** e.g. *Regular*, *Lab*, *Lab partners*, *Rocket project*. Each tab keeps **its own seating**, and switching tabs never changes another tab's seating. Each setup says which furniture is **usable** when generating seating. Regular uses tables only, and lab workbenches are unavailable. Lab uses workstations only. A piece can count as both. |
| G | **Groups into setups:** groups made in the Groups tab can be **placed into a setup** (new or existing) without replacing the regular seating. |
| H | **Stations + timer rotation:** groups are assigned to stations. A timer linked to the stations moves every group to its next station **automatically when each segment ends**, with a chime and a big "Rotate!" on the projector view. There is also a manual **Rotate** button. |

## 2. Current code you'll build on (line numbers are approximate)

| What | Where |
|---|---|
| `load(k,d)` / `save(k,v)`: async JSON over `window.storage` | ~143 |
| Seat constants: `SW=114, SH=52, SGR=8`, plus wood colours and `woodBg` | ~1188 |
| `sSnap`, `useAnchoredMenu`, `nextGroupLabel`, `sLayout`, `sPosMap`, `gBoundsFromSeats`, `repairSeatGroups` | ~1315–1440 |
| `bestFitReseat`, `roomStructureKey`, `roomShapeSignature`, `randomizeSeating` (rules, tags, smart shuffle) | ~1653–1790 |
| `ManageSeatingPanel`: the editor (add table, room items, drag, groups, tags, rules, saved layouts `ta-saved-layouts`, history `sh-<class>`, undo, randomize) | ~1957–3940 |
| `StudentSeatingPanel`: the "Seating" tab shown to the class | ~3940–4370 |
| `ManageGroupsPanel` / `StudentGroupsPanel` (groups result `{groups:[[student…]…]}`, saved groupings `gg-<class>`, prefs `gp-<class>`) | ~4398 / ~5085 |
| `TimerPanel` (timers with `segments`, `currentSegIdx`; reports up through `onStatusChange`) | ~979 |
| `DotsMenu` (the class menu), `TabStrip` (top bar) | ~623 / ~5913 |
| `SettingsModal` (backup export and restore) | ~5740 |

**Per-class saved data:** `sl-<class>`, which is `{seats, groups, tags, roomItems, rules}`. A seat is `{id, groupId, x, y, tags, tagRule, studentId, locked, used, unavailable?}`, and a group is `{id, seatIds, label}`. Seat positions are absolute; a group only lists which seats belong to it. A room item is `{id, type:'desk'|'board'|'door', x, y, rotation}`.

## 3. Key design decision: extend the seat engine, don't replace it

Randomise, keep-apart and keep-together rules, seat tags, smart shuffle, pairing history, best-fit reseat, undo and arrangement history all work on the **`seats` + `groups`** arrays. Keep those arrays as the thing the engine reads. Add new layers on top:

- **Pieces (table surfaces):** `layout.pieces = [{id, shape, x, y, rot, label?, roles:['desk'|'workstation'], seatsOff:[slotIdx…]}]`. Each shape defines its outline (a polygon in local coordinates) and its **seat slots** (each slot has an edge index, a position and a facing).
- **Seats come from pieces.** A seat gets `pieceId` and `slot`. Its `x,y` is still saved, computed from the piece's position, rotation and slot, so all existing code keeps working. When pieces move, rotate or join, recompute the seats and **keep each seat's `studentId`, `tags`, `tagRule` and `locked` by its `(pieceId, slot)` key**.
- **Groups = joined clusters.** Pieces joined edge to edge form one cluster, which is one `group`. Joining and separating pieces reuses the existing group-merge code paths.
- **Old data:** any seat without a `pieceId` is shown as a `single` desk piece at the same `x,y`, wrapping that seat (generated when loaded, and saved on the first edit). Its group membership is kept. Nothing is lost, and old layouts look the same apart from the new art.
- Old `roomItems` (`desk`, `board`, `door`) keep working and become the first members of the new **room-item catalogue**.

## 4. Data model (all new keys or optional fields)

```
cp-schema                 integer, 2 after Phase 5's migration
ta-rooms                  [{ id, name,
                             shell: { walls:[{id,x1,y1,x2,y2}],
                                      openings:[{id,type:'door'|'window'|'double-door',wallId,t,width,swing}],
                                      items:[{id,type,x,y,w,h,rot,label}] },   // fixed: sinks, fume cupboard, board…
                             layouts:[{ id, name, pieces:[…], seats:[blank], groups:[…], items:[…movable] }] }]
setups-<class>            { activeId, list:[{ id, name, icon, roomId?, layoutId?,
                                              use:['desk'] | ['workstation'] | ['desk','workstation'],
                                              stations?:{…see H} }] }
sl-<class>                UNCHANGED shape (+ optional pieces/walls fields); = the FIRST setup ("Regular")
sl-<class>~<setupId>      the same shape as sl-, for every other setup
rot-<class>               { setupId, stationOrder:[stationId…], groupIds:[…], step, timerId? }
classpanels-auto-backups  (Phase 0) the last 10 automatic backups, in plain localStorage OUTSIDE classboard-storage; call `autoBackup(reason)` before any migration
```

- **Rules stay class-level** in `sl-<class>`. Every setup uses them, and the Groups panel already reads rules from there.
- **Seat history** (`sh-<class>`) and **pairing history** stay per class. A history entry gets an optional `setupId`.
- **Shell vs. layout.** The room *shell* (walls, doors, windows, fixed items) is shared live: change it once, and every class and setup that uses the room sees the change. The movable furniture comes from a *layout*. Editing furniture in a setup changes only that setup, until Tom presses "Update layout 'Clusters'" (which asks first) or "Save as new layout".
- The old `ta-saved-layouts` entries migrate into the library as a room called "My saved layouts", with each one as a layout. The old key is kept.

## 5. Shapes (Phase 3)

The units are canvas pixels on the existing 8 px grid. A seat slot draws as a **chair**, with the student's name on a paper tag on the table edge.

| Shape | Outline | Seat slots (default on) |
|---|---|---|
| `single` | 104×64 rect | 1 (front edge) |
| `pair` | 200×64 rect | 2 |
| `long4` | 208×96 rect | 4: 2 on each long side, none on the ends; the end slots exist but are off |
| `long6` | 296×96 rect | 6 |
| `trap` | Isosceles trapezoid: long base 180, short base 90, 60° angles (height ≈ 78; slanted sides = 90) | 4: **one on each side** (long base, short base, both slanted sides). Tom confirmed this on 20 Nov. |
| `round` | Circle, diameter 150 | 4 (or 5/6, chosen in the piece menu) |
| `bench` | 320×80 lab bench rect, `roles:['workstation']` | 4 on one side (and optionally the other) |

- **Rotation:** a rotate handle snaps to 15° steps, and holding Shift rotates freely. There are also keyboard shortcuts `[` / `]` and a "⟳ 90°" button in the selection bar.
- **Snapping:** while dragging, compare the dragged piece's edges with nearby pieces' edges. When two edges are close (< 18 px), almost anti-parallel (< 12°) and overlap along their length, **rotate and slide the piece so the edges meet exactly**. Show a highlighted join line as a preview. Equal edges snap centre to centre; unequal collinear edges (long tables end to end) snap flush at the nearer end.
- **Joined edges:** store `joins:[{a:pieceId,ea:edge,b:pieceId,eb:edge}]` on the layout. Slots on a joined edge are hidden. Two trapezoids joined long base to long base make a **hexagon**: the long-base slots hide, leaving the short base and both slanted sides of each piece, which gives **6 seats**. A per-piece override (`seatsOff`) always wins.
- **Clusters:** connected pieces form one group. Dragging any piece moves the cluster. **Alt-drag**, or the "Separate" button, pulls a single piece off.
- **Add-table menu:** show little drawings of each shape, plus ready-made combos (hexagon of 2 trapezoids, "long table of 8" = 2×long4, horseshoe).
- The geometry helpers are pure functions (`shapeDef`, `pieceToWorld`, `findSnap`, `slotsForLayout`). They live in their own block near the other seat helpers and have **unit tests** in `tests/geometry.test.js`, run with node.

## 6. Look (Phase 2): the "icon style" drawing kit

- **Ink:** outlines `#2b2118`, about 1.6 px, round joins.
- **Hatching:** an SVG `<pattern>` of diagonal pencil strokes laid over flat fills, like the icon's shading.
- **Wood:** `#c08a5e` / `#a8704a` for tables, with the existing grain kept as a subtle extra.
- **Chairs:** rounded squares in a bright pastel, cycled per table from the icon palette: mint `#b2efc4`, sky `#9ccaf9`, cyan `#d2f5fb`, plus sunny `#ffd98a` and coral `#ffb3a1` for variety.
- **Name tags:** cream paper `#fffaf0` with an ink border and a slight tilt (±1.5°, fixed per seat so it doesn't jitter).
- **Floor:** pale with a faint tile grid, and walls as thick ink lines.
- **Board colour:** the existing whiteboard and blackboard themes still work. In blackboard mode, the ink turns chalk-white and the fills turn muted.
- **Room-item icons** are drawn in the same style as the icon: books, globe, sink, tap, etc.
- Everything is inline SVG with **no images or web fonts added**, so the app still makes no internet requests.
- Use it in **both** the Manage Seating canvas and the class-facing Seating view, and in Groups where seats are drawn.

## 7. Room builder (Phase 4)

- **Room mode toggle** in Manage Seating: "🧱 Edit room". In room mode, walls and room items can be edited and tables are dimmed. Outside room mode, the walls are locked so they can't be dragged by accident.
- **Walls:** click-drag to draw. Walls snap to the grid and to 0°, 45° and 90°, and join at their ends. A "Rectangle room" quick button draws four walls. Dragging an end moves it, and Delete removes the selected wall.
- **Openings:** drag a door, double door or window onto a wall and it sticks to the wall. Doors can be flipped and their swing changed.
- **Item catalogue** with search, grouped as follows:
  - **Classroom:** teacher's desk, whiteboard, projector screen, TV, bookshelf, cupboard, filing cabinet, bin, recycling, computer station, printer, sofa/reading corner, rug, plant, window seat, coat hooks, sink.
  - **Science lab:** lab bench (seats → workstation), demo bench, sink, fume cupboard, eyewash station, safety shower, fire blanket, fire extinguisher, first-aid kit, gas shut-off, emergency stop, chemical store, prep-room door, goggles cabinet, sharps/glass bin, power isolator.
  - **Free shapes:** box, label/text, arrow.
- Every item has a **label** (editable by double-clicking or in the selection bar), a **size** (resize handles) and a **rotation**. The label shows on the map.
- **Station flag:** any item or table can be marked "Station" with a number and a name. Phase 7 uses this.
- **Room library:** a "Rooms" popover (replacing "Saved layouts") lists the rooms, with each room's layouts underneath. It offers *Use this room*, *Load layout*, *Update layout* (asks first), *Save as new layout*, *Rename*, *Duplicate* and *Delete* (asks first, and is refused while any setup uses it).

## 8. Class chips (Phase 1)

- Add a row of **chips, one per class**, in the top banner (`TabStrip`). Clicking a chip switches class straight away. The active chip is filled; the others are outlined.
- The row scrolls sideways if there are many classes. Each chip shows the class colour, if any.
- The ··· menu (`DotsMenu`) keeps new, manage and delete.
- **Keyboard:** ⌥1…⌥9 switch to class 1–9.
- Switching class mid-timer must not break the timer (check how `activeClass` flows into `TimerPanel`).

## 9. Setups (Phase 5)

- A **setup tab row** sits above the seating canvas in both Manage Seating and the class Seating view: `Regular · Lab · Lab partners · ＋`. One click switches the setup. It loads `sl-<class>` for the first setup, or `sl-<class>~<id>` for the others.
- **New setup dialog:**
  - name it, and pick an icon (🪑 🧪 👥 🚀 ⭐);
  - start from a copy of the current setup, a room layout, or empty;
  - choose **Use for seating**: Tables / Workstations / Both.
- **Usable furniture:**
  - When generating (Randomise or Smart shuffle), only seats on pieces whose `roles` match the setup's `use` are filled. The other pieces still draw, faded with a small "not used in this setup" hatch.
  - Clicking a single piece in the selection bar toggles it on or off for this setup, stored per setup as `offPieces:[…]`.
  - The engine already skips seats that are not `used` or are `unavailable`, so feed it through those flags. Don't add a second mechanism.
- **Migration** (the first time a class opens on schema < 2):
  1. Take an automatic backup (from Phase 0).
  2. Create `setups-<class>` with a single "Regular" setup that points at the existing `sl-<class>`.
  3. Leave `sl-<class>` exactly as it is.
  4. Set `cp-schema=2` only after every class has been migrated.
- **Rename, reorder (drag), duplicate, delete:** deleting asks first, Regular can't be deleted, and a deleted setup's `sl-…~id` key is kept for 30 days in `ta-trash` before it is removed.
- Each setup gets **Confirm seating / history**, tagged with `setupId`.
- The **Backup export** (`SettingsModal`) already exports every key. Check that it includes the new keys and that a restore round-trips.

## 10. Groups into setups (Phase 6)

- When groups are shown in the Groups panel, add a **"🪑 Seat these groups ▸"** button. It offers:
  - *New setup…*, which asks for a name and a room or layout, defaulting to the current setup's room;
  - or *an existing setup*, which asks first, because it replaces that setup's seating but not Regular's.
- **Placement:** each group goes onto one cluster or table, choosing the best fit by size and only using furniture the setup can use. Groups that are too big split across neighbouring tables, and empty seats are left at the end. Reuse the logic of `bestFitReseat` (grouped buckets) where possible.
- Show a summary afterwards: "6 groups seated in *Lab partners*. Group 4 split across 2 benches", with a **Go to setup** button.

## 11. Stations + rotation (Phase 7)

- **Stations** are items or tables flagged as stations (from Phase 4), and they belong to a setup.
- A **"Stations" side section** in Manage Seating for that setup lists the stations in order (drag to reorder) and lets Tom pick which groups take part: the last generated groups, or a saved grouping from `gg-<class>`.
- **Start rotation:**
  1. Choose minutes per station, plus an optional "move" changeover of 0–60 s.
  2. This **creates a timer** in `TimerPanel` with one segment per station, named after the station (e.g. "Station 1: Circuits"), with changeovers between them.
  3. Save `rot-<class>`.
- **Moving the groups:**
  - The timer must notify the app when a segment ends. Add an `onSegmentEnd(timerId, segIdx)` callback alongside `onStatusChange`.
  - When the linked timer's work segment ends, `step++`. Group *g* is then at station `(g + step) % n`.
  - Play a chime, and show a big full-screen **"Rotate! ↻"** card for about 4 s with each group's next station.
  - A manual **Rotate ↻** button and **← Back** are always visible while a rotation is running.
- **Class display:** the class Seating view shows each station on the room map with its current group (group name + members), plus a "Next: …" line. The timer's DisplayMode can show a small "Group A → Station 3" strip.
- **End rotation** clears `rot-<class>` but keeps the setup.

## 12. Phases, order and who does them

The phases run **one at a time** on `classpanels-rooms`, because nearly everything is in one large file. The exception is Phases 0 and 1, which touch separate areas and can run side by side. The planner (Opus) reviews each phase's diff and screenshots before starting the next.

| Phase | What | Agent | Why that agent |
|---|---|---|---|
| 0 | Safety net: automatic backups (on launch and before any migration; last 10 in `classpanels-auto-backups`; in Electron also written as a file to `~/Documents/ClassPanels Backups/` through a new preload IPC); fake-data fixture; Playwright smoke tests (load fixture → open each tab → no console errors → data unchanged → export/restore round-trip) | Sonnet | Well specified, mostly plumbing |
| 1 | Class chips | Sonnet | Small and self-contained |
| 2 | Drawing kit + new look for seats, tables and room items | Sonnet, then a planner visual review | Needs taste checks, which the planner gives through screenshots |
| 3 | Shapes, rotation, snapping, joins, seat slots, old-data wrapping | **Opus** | Hardest geometry and the riskiest change to the core seat model |
| 4 | Room builder: walls, openings, item catalogue, labels, room library | Sonnet | Large but straightforward once Phase 3's pieces exist |
| 5 | Setups: tabs, usable furniture, migration | **Opus** | Data migration on Tom's real data, so correctness matters most |
| 6 | Groups into setups | Sonnet | Builds on 5 |
| 7 | Stations + timer rotation + display | Sonnet | Builds on 4 and 5; a clear spec |
| T | Timer quick actions + drag to combine + repeat (section 15) | Sonnet | Only touches the Timer panel, so it can run alongside the other phases |
| 8 | Final pass: Help-mode titles, README, `class-panels/README.md`, full regression, screenshots for Tom | Sonnet + planner review | |

Each phase hands back:
- what changed, described in plain English;
- the test output;
- screenshot paths;
- anything it was unsure about.

## 13. How Tom gets it

- After Phase 1, and at each milestone, Tom gets a short "try this" note. In the Terminal, in his ClassPanels folder, he runs a single copy-paste command that downloads the branch build. Alternatively, the planner sends a zip.
- He makes a backup (Settings) before trying any new build. Phase 0 makes this automatic as well.
- `main` is only updated once Tom says the new version works with his real classes.

## 14. Tom's answers (20 Nov 2026)

- **Trapezoid:** one seat on each side, 4 in total.
- **Rotation direction:** offer both. The default is everyone moving forwards (1→2→3). An option, "Alternate directions", makes every second group go backwards.
- **Changeover:** on by default at 30 s. It can be edited per rotation (0 s to 3 min), and Tom can also lengthen or shorten it live with the timer's existing +/- time buttons.

## 15. Timer quick actions and combining (Phase T: Timer panel only, can run alongside the seating phases)

- **Quick actions:** a "⚡ Quick" dropdown in the Timer panel lists the saved **actions** (the `actions` key, the task names from Manage Tasks such as Think, Share, Read…) and **templates**. Clicking an action starts a single-segment timer straight away.
  - Each action shows a default length that can be changed with small − / + chips in the menu row. The last-used length is remembered per action.
  - No builder is needed.
  - The dropdown also works in the compact (side banner) layout.
- **Drag to combine:** drag one timer card onto another. A drop highlight shows "Combine". Dropping makes one timer whose segments are the target's followed by the dragged one's, named "A → B". The combined timer:
  - keeps the target's position and is paused at the start, unless the target was running, in which case it carries on;
  - immediately shows a small **repeat** popover: Once / × N times / ∞ Loop continuously. This uses the existing `repeatInfo` (`{infinite}` or `{total}`) mechanism.
- **Undo:** an "Undo combine" toast lasts for about 6 s.
- Combining more than two works by dropping again.
- Combined timers can be **saved as a template** with the existing save flow.
