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

- **Pieces (table surfaces):** `layout.pieces = [{id, shape, x, y, rot, roles:['desk'|'workstation'], seatsOff:[slotIdx…], seatsOn?:[slotIdx…], seatCount?, label?}]` and `layout.joins = [{a, ea, b, eb}]`. `(x,y)` is where the shape's centre sits; `rot` turns it clockwise in degrees. `seatsOn` switches on a slot that starts off (a long table's ends, a bench's back); `seatCount` is a round table's 4/5/6. Both keys are only written once a room has pieces, so a room without any keeps exactly the shape it always had.
- **Seats come from pieces** (`syncPieceSeats`). A seat gets `pieceId` and `slot`. Its `x,y` is still saved: the top-left of a 114×52 box centred on the seat's name tag, so the existing bounds, centring, canvas sizing, rubber-band and hit-testing code keeps working. When pieces move, rotate, join or split, the seats are recomputed and **each keeps its id, `studentId`, `tags`, `tagRule`, `locked`, `used` and `unavailable` by its `pieceId:slot` key**. A student whose slot disappears goes back to the unplaced list, with a short notice saying who.
- **Groups = joined clusters.** Connected pieces form one cluster; a cluster with 2+ seats is one `group`. An existing group is reused (id and label) where the cluster's seats were in it, so joining merges groups and separating splits them, new ones named by `nextGroupLabel`. A table's group can't be deleted from "Manage table groups" (it would just come back): split it on the canvas instead.
- **Old data is untouched (changed from the first draft of this plan).** Seats without a `pieceId` are NOT wrapped into `single` pieces: they draw and behave exactly as in Phase 2, and nothing is converted on load. Instead the selection bar offers **"Convert to table ▸"** for a selected plain group or lone seat: it lists the shapes that fit the seat count (up to 2 spare seats), puts the new table where the desks were, and moves everyone across in the same reading order with their lock, seat tags and group name. One Undo puts it back.
- **Every save path carries `pieces`/`joins`:** `doSave` (pieces are optional arguments; when left out the last committed ones are carried forward), the undo stack and `handleUndo`, the load effect (which also self-heals seats against the pieces), saved layouts (`ta-saved-layouts`, re-ID'd on load), Confirm seating history (`sh-`) and `restoreArrangement`, `roomStructureKey`/`roomShapeSignature`, and the class Seating view's Randomise/Undo (which spread the whole saved object). Rolling back to `main` keeps every seat (they still have `x,y`); only the table drawings are lost.
- Old `roomItems` (`desk`, `board`, `door`) keep working and become the first members of the new **room-item catalogue**.

## 4. Data model (all new keys or optional fields)

```
cp-schema                 integer, 2 after Phase 5's migration
ta-rooms                  [{ id, name,
                             shell: { walls:[{id,x1,y1,x2,y2}],
                                      openings:[{id,type:'door'|'window'|'double-door',wallId,t,width,swing}],
                                      items:[{id,type,x,y,w,h,rot,label}] },   // fixed: sinks, fume cupboard, board…
                             layouts:[{ id, name, pieces:[…], seats:[blank], groups:[…], items:[…movable] }] }]
setups-<class>            { activeId, list:[{ id, name, icon, createdAt,
                                              use:['desk'] | ['workstation'] | ['desk','workstation'],
                                              offPieces:[pieceId…],
                                              stations?:{…see H} }] }
                          (Phase 5: Regular is the entry with the fixed id 'regular', wherever it sits in
                          the list; others get 'su…' ids. The room link lives in each setup's own sl- object
                          (`room`), not here, so roomId/layoutId were dropped from this entry.)
sl-<class>                UNCHANGED shape (+ optional pieces, joins, walls, openings, room fields; roomItems/pieces may carry station); = the setup with id 'regular'
sl-<class>~<setupId>      the same shape as sl-, for every other setup; its tags and rules are always [] (class-level, see below)
ta-trash                  [{ key, value, deletedAt, classId, setup }]: a deleted setup's seating, purged 30 days later on launch
rot-<class>               { setupId, stationOrder:[stationId…], groupIds:[…], step, timerId? }
classpanels-auto-backups  (Phase 0) the last 10 automatic backups, in plain localStorage OUTSIDE classboard-storage; call `autoBackup(reason)` before any migration
```

- **Rules stay class-level** in `sl-<class>`. Every setup uses them, and the Groups panel already reads rules from there. The class's seat-tag list (`tags`) is class-level too. A setup's own key stores `tags:[]`, `rules:[]`; editing rules or the tag list while another setup is showing writes them into `sl-<class>` (only those two fields, and only when they really changed).
- **Seat history** (`sh-<class>`) and **pairing history** stay per class. A history entry gets an optional `setupId` (none = Regular). The cap of 10 is per setup.
- **Shell vs. layout.** The room *shell* (walls, doors, windows, fixed items) is shared live: change it once, and every class and setup that uses the room sees the change. The movable furniture comes from a *layout*. Editing furniture in a setup changes only that setup, until Tom presses "Update layout 'Clusters'" (which asks first) or "Save as new layout".
- The old `ta-saved-layouts` entries migrate into the library as a room called "My saved layouts", with each one as a layout. The old key is kept.

## 5. Shapes (Phase 3)

The units are canvas pixels on the existing 8 px grid. A seat slot draws as a **chair tucked under the table edge** (only its back shows beyond the edge, like a top-down floor plan), with the student's name on a paper tag on the table.

| Shape | Outline | Seat slots (default on) |
|---|---|---|
| `single` | 104×64 rect | 1 (front edge) |
| `pair` | 200×64 rect | 2 |
| `long4` | 208×96 rect | 4: 2 on each long side, none on the ends; the end slots exist but are off |
| `long6` | 296×96 rect | 6 |
| `trap` | Isosceles trapezoid: long base 180, short base 90, 60° angles (height ≈ 78; slanted sides = 90) | 4: **one on each side** (long base, short base, both slanted sides). Tom confirmed this on 20 Nov. |
| `round` | Circle, diameter 150 | 4 (or 5/6, chosen in the piece menu). No straight edges, so it never snaps |
| `bench` | 320×80 lab bench rect, `roles:['workstation']`, drawn with a pale slate top | 4 *places* on one side; the 4 on the back start off and can be switched on. **Standing spots, no chairs**: students stand at a bench, so each place is a small floor mat with footprints just outside the edge. Any table whose "Use for" is exactly Workstation draws the same way; Table or Both draw chairs. Drawing only: the slots hold students as usual (Lab setups in Phase 5 put students at benches). The piece menu says "places" for these. |

`single` and `pair` also have back slots that start off. Slot numbers are saved with seats, so a shape's slots are never reordered, only added to.

- **Rotation:** a rotate handle snaps to 15° steps, and holding Shift rotates freely. There are also keyboard shortcuts `[` / `]` and a "⟳ 90°" button in the selection bar.
- **Snapping:** while dragging, compare the dragged piece's edges with nearby pieces' edges. When two edges are close (< 18 px), almost anti-parallel (< 12°) and overlap along their length, **rotate and slide the piece so the edges meet exactly**. Show a highlighted join line as a preview. Equal edges snap centre to centre; unequal collinear edges (long tables end to end) snap flush at the nearer end.
- **Joined edges:** store `joins:[{a:pieceId,ea:edge,b:pieceId,eb:edge}]` on the layout. Slots on a joined edge are hidden. Two trapezoids joined long base to long base make a **hexagon**: the long-base slots hide, leaving the short base and both slanted sides of each piece, which gives **6 seats**. A per-piece override (`seatsOff`) always wins.
- **Clusters:** connected pieces form one group. Dragging any piece moves the cluster. **Alt-drag**, or the "Separate" button, pulls a single piece off.
- **Chairs and tags:** each seat's chair is drawn *under* the table top (chairs first, then the table over them), centred about 1 px inside its edge so roughly the back 8 px shows, facing in (the kit's `Chair`). Plain pre-table seat groups do the same (`legacyChairs`): the table top covers the seat area, top-row seats have chairs above, bottom-row below, a single row below, a single column or a 2-column block to the outer side; the middle of a big block has none (fully under). Seat positions never change. Name tags always stay level. Each table (cluster) tries to fit every tag on the table top just inside its edge, wide tags first, then narrow two-line ones; if they won't all fit without overlapping, that whole table puts its tags just beyond the chairs instead, so one table never mixes the two looks. A joined cluster is drawn as one table top: ink first at double width, wood on top, so the seam is covered and only a very faint dotted line is left.
- **Add-table menu:** "Tables" (a little drawing of each shape), "Ready-made" (hexagon of 2 trapezoids; long table of 8 = 2×long4; **horseshoe = a U of three long tables of 6, seated round the outside with the inside left open**, 9 seats, inside seats can be switched on). The old "Simple seats" section was removed from the menu in Phase 3b (Ready-made replaces it); `addTable(n)` and the 1–4 keys still work. A horseshoe of 3 trapezoids (a half hexagonal ring) was tried first, but its inside is too tight for chairs and names.
- **Piece menu** (selection bar): ↺ 15° / ⟳ 90° / ↻ 15°, "Edit seats…" (click the chairs on the canvas to switch seats on/off), round-table seats 4/5/6, Use for Table / Workstation / Both, a label written on the table top, "Separate this piece", and Delete table (asks first if anyone is seated). Delete on a single selected table seat switches that seat off rather than removing it.
- The geometry is pure (`shapeDef`, `pieceToWorld`, `slotsForLayout`, `findSnap`, `clustersFromJoins`, `syncPieceSeats`, …) in its own block in `teacher-app.jsx` between `@geometry-begin` / `@geometry-end` (no JSX, no outside references). `tests/geometry.test.js` lifts that block out and runs it with plain node; `tests/run.js` runs it first.

## 6. Look (Phase 2): the "icon style" drawing kit

- **Ink:** outlines `#2b2118`, about 1.6 px, round joins.
- **Hatching:** an SVG `<pattern>` of diagonal pencil strokes laid over flat fills, like the icon's shading.
- **Wood:** `#c08a5e` / `#a8704a` for tables, with the existing grain kept as a subtle extra.
- **Chairs:** rounded squares in a bright pastel, cycled per table from the icon palette: mint `#b2efc4`, sky `#9ccaf9`, cyan `#d2f5fb`, plus sunny `#ffd98a` and coral `#ffb3a1` for variety.
- **Name tags:** cream paper `#fffaf0` with an ink border and a slight tilt (±1.5°, fixed per seat so it doesn't jitter).
- **Floor:** pale with a faint tile grid, and walls as thick ink lines.
- **Board colour:** the existing whiteboard and blackboard themes still work. In blackboard mode, the ink turns chalk-white and the fills turn muted.
- **Table colours (Phase 3c, built):** a table can be tinted instead of wood, from a palette of keys (`mint sky cyan sunny coral lilac red blue green gold pink`; no key = Wood), drawn under the hatching and ink outline. Where `color` lives:
  - `groups[].color` for any cluster of seats or joined pieces (one cluster = one group, so one colour);
  - `pieces[].color` for a lone one-seat piece that has no group;
  - `seats[].color` for a lone legacy desk.
  Joining keeps the larger group's colour; a piece that splits off starts as Wood (a new group made from coloured lone pieces or desks takes the first one's colour). The theme maps keys through `--cp-table-<key>` and a deeper `--cp-tchair-<key>` (in `CP_THEME_CSS`). "Match chairs to table colour" is per class, key `cp-chairmatch-<classId>` (true/false), in the Randomize options. `groupColorKey(i)` / `GROUP_COLOR_KEYS` map the Groups panel's colour order (blue, green, gold, lilac, red, cyan) to palette keys, for Phase 6.
- **Room-item icons** are drawn in the same style as the icon: books, globe, sink, tap, etc.
- Everything is inline SVG with **no images or web fonts added**, so the app still makes no internet requests.
- Use it in **both** the Manage Seating canvas and the class-facing Seating view, and in Groups where seats are drawn.

## 7. Room builder (Phase 4) — built

- **Room mode toggle** in Manage Seating: "🧱 Edit room". In room mode walls, openings and items can be edited and tables are dimmed and can't be picked. Outside room mode walls and openings can't be picked or dragged; room items stay movable.
- **Walls** `walls:[{id,x1,y1,x2,y2}]` (optional field on `sl-<class>`). Click-drag on the floor draws one; it snaps to the 8 px grid, to 0/45/90° and onto nearby wall ends (corners join). "▭ Rectangle room" draws four walls round the content. Dragging an end moves it (walls meeting at that corner come with it); dragging the wall moves it; Delete removes it. Drawn 12 px thick with ink outline and pencil hatching.
- **Openings** `openings:[{id,type:'door'|'double-door'|'window',wallId,t,width,flip,swing}]`. Dragged from the palette onto a wall (a click puts one on the selected or longest wall) and slid along it. Doors flip (hinge end) and swing (side). Old freestanding `door` items are untouched.
- **Item catalogue** (searchable popover "+ Room items", sections **Zones and lines**, **Classroom**, **Science lab**, **Free shapes**). `roomItems` gain optional `{w,h,rot,label,fixed,station,color,dashed,arrow}`; `(x,y)` is the top-left of the box before it turns, and it turns about its middle. The original desk/board/door have no `w/h/rot`: they keep their old sizes (**desk 114×52, board 260×36, door 64×64 — the editor and the class view now draw exactly the same**) and are converted only when resized or turned. Every item has a label (double-click, or the selection panel), 4/8 resize handles, the turn handle, `[` `]`, ⟳ 90°. One shared drawing (`RoomItemView`, `WallsLayer`, `StationBadges`) is used by the editor and by the class Seating view (read-only), which also opens zoomed to fit a room with walls.
- **Teacher's desk and board are resizable** with the same handles; the desk's books and globe scale with it.
- **Zones and lines.** *Area*: a soft tinted rectangle (mint, sky, cyan, sunny or coral) with a dashed ink border and a label in its corner; resizable and turnable; drawn underneath everything, tables included; only its edge strip can be grabbed, so tables and the floor inside stay clickable. *Line*: a thin item drawn by click-drag in room mode ("Draw lines" tool), solid or dashed, optional arrow head, optional colour.
- **Window item**: a long thin board-shaped blue rectangle (pale `--cp-sky`, glass glints, mullions) — the catalogue's Classroom "Window". Placeable anywhere; dropped on a wall it turns to lie along it and centres on it (`snapItemToWall`). The wall-opening window is still in the Edit room palette.
- **Station flag**: any item or table piece can be marked in the selection panel, stored as `station:{n,name}`; it shows a numbered badge (and name) on the map in both views. Phase 7 reads `station` from `roomItems` and `pieces`.
- **Room library** (`ta-rooms`, "🏫 Rooms" popover replacing Layouts). Room = shell (`walls`, `openings`, items with `fixed:true`) + layouts (`pieces`, `joins`, blank `seats`, `groups`, non-fixed `items`; never students). Actions: Save as new room, Save layout to room (new or update, asks), Use room / use a layout (asks; students reseated with `bestFitReseat`; Undo works), Rename, Duplicate, Delete (asks). The class stores `room:{roomId,layoutId,shellLocal?}`. Editing the shell of a linked room asks "Update <room> for every class that uses it?": *Yes* saves the shell into `ta-rooms` (and later shell edits follow); other classes take the new shell the next time they load (never furniture or students). *Just this class* sets `shellLocal`, which keeps that class's own shell until it is shared from Rooms. Old `ta-saved-layouts` stay readable under "My saved layouts"; the first library save copies them in as a room of that name (the old key is never rewritten). Everything is backed up once per session first (`autoBackup('before room library')`).
- API (Phase 5): `loadRooms()`, `saveRooms(rooms)`, `applyRoomShell(layoutObj,room)`, `extractShell(layoutObj)`, `extractLayout(layoutObj)`, `instantiateLayout(layout,uid)`, `sameShell`, `syncClassWithRoom(classId,layout)`.

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
- **Spread students out when generating** (found in Phase 3): Randomise fills seats in list order. When there are more seats than students, the most recently added tables stay empty. In setups, generate across all usable tables: fill whole tables evenly, rather than leaving whole tables empty at the end, unless the teacher has switched seats off.
- The **Backup export** (`SettingsModal`) already exports every key. Check that it includes the new keys and that a restore round-trips.

**As built (Phase 5), and where it differs from the above:**
- **Regular is found by id**, not by being first: `setupSlKey(classId,'regular')` is `sl-<class>`, any other id is `sl-<class>~<id>`. Tabs can be dragged into any order (Regular included) without moving any data.
- **Active setup** is `setups-<class>.activeId`, held in `TeacherApp` and passed to both seating panels, so they always agree; switching class restores that class's choice. Each panel's load effect reloads on class *or* setup change, saves any edit still waiting (the 400 ms delay) into the setup it was made in first, and clears the undo stack.
- **Tab row:** Manage Seating always shows it (a strip above the floor, with ⋯ on every tab and ＋). The ⋯ menu has Rename, Icon, Use for (Tables / Workstations / Both), Duplicate and Delete… (not on Regular). The class Seating view shows a slim row only once the class has a second setup; the projector view names the setup next to the class.
- **New setup dialog:** icons 🪑 🧪 👥 🚀 ⭐ 🔬 📚; start from a copy of the current setup without or with students, a room layout from 🏫 Rooms, or an empty room. "Use for" follows the name (Workstations if it contains "lab") until Tom picks one. Copies keep table colours, the room link (walls etc. follow that room) and piece ids.
- **Usable furniture** is worked out (`usableSeatIds`) when generating and drawing, never saved into seats: a seat is usable if it is `used`, not `unavailable`, its piece's `roles` meet the setup's `use` (plain old desks count as tables), and the piece isn't in the setup's `offPieces`. Generating passes copies of the other seats marked `unavailable` (the engine's existing flag) and puts the real flags back afterwards. Unused furniture is washed out with a light hatch; hovering a table says "Not used in Lab"; students already there stay put and Manage Seating shows a sunny "⚠ N students are at furniture not used in Lab" chip until the next Randomize moves them. `offPieces` holds piece ids only (old plain desks can't be switched off per setup).
- **"Use in <setup>"** in the table's selection bar only appears once the class has a second setup (or that table is already off), to keep a one-setup class's bar short.
- **Spread** applies to all generating, Regular included: after tag matching, each remaining student goes to the table that is least full for its size (`pickSpreadSeats`), ties broken at random. Rules, tags (hard and best-fit), locks and smart shuffle are unchanged. A student locked into a seat the setup doesn't use stays there and is no longer also dealt a second seat.
- **Migration** runs once at launch for every class in `ta-classes` (before the daily backup): `autoBackup('before setups')` only if some class lacks an entry, existing entries are never overwritten, and `cp-schema=2` is written only after checking every class has one. A class made later has no entry until its setups first change (it reads as Regular only). `autoBackupIfNewDay` now looks only for an earlier *launch* backup, so the migration's backup doesn't stand in for the day's.
- **Deleting a class** also deletes its `setups-` entry and setup keys. Removing a student from the roster clears them from every setup.
- **Helpers for Phases 6 and 7** (exported from `teacher-app.jsx`): `createSetup(classId,{name,icon,use,fromLayout,withStudents,fromRoom,offPieces,activate})` → the setup; `loadSetupLayout(classId,setupId)`; `saveSetupLayout(classId,setupId,obj)`; `usableSeats(layoutObj,setup)`. They fire a `cp-setups-changed` window event that `TeacherApp` listens to, so open panels follow. Also available inside the file: `loadSetups`, `saveSetups`, `deleteSetup`, `setupSlKey`, `seatsForSetup`/`restoreSeatFlags`, `unusablePieceIds`.

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
| 2b | **Button theme everywhere** (Tom, 23 Nov: "I love the buttons for the classes but now I need all buttons to have that same theme"). Restyle every app button in the class-chip style: top tabs, panel buttons, menus, toggles. Do this straight after Phase 4 merges and before Phase 5, because it touches every screen. | Sonnet | Wide but shallow |
| 3c | **Table colours** (Tom, 23 Nov: "tables could be coloured, that way you could make a visual of different groups, and put that colour on the table itself"). Add a colour picker in the table selection bar: Wood (the default) plus mint, sky, cyan, sunny, coral, lilac and the Groups colours (red, blue, green, gold, pink). It tints the table top while keeping the pencil hatching and ink outline. Store it as `color` on the group (one cluster = one group), so old seat groups and new shapes both work, and the class view shows it too. Add an optional "Match chairs to table colour" setting. Phase 6 sets the table colour from the group's colour automatically when groups are seated into a setup. Run after 2b. | Sonnet | Small; touches the table art and the selection bar |
| 8 | Final pass. Also: the old "Record seating / Save layout" prompt that appears when loading a layout still writes to `ta-saved-layouts`. Route it into the room library (`saveRooms`) so new saves show up in 🏫 Rooms. Final pass items: Help-mode titles, README, `class-panels/README.md`, full regression, screenshots for Tom | Sonnet + planner review | |

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
- **Split** (Tom, 20 Nov: instead of an undo toast): every combined timer has a "✂ Split" button that works at any time. A combined timer stores its `parts` (each one's name, segments, repeat and paraphrase settings), so Split puts the original timers back in its place, reset and paused.
- Combining more than two works by dropping again.
- Combined timers can be **saved as a template** with the existing save flow.
