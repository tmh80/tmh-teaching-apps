# Handover: replace Flags with a Checklist grid

**For:** Sonnet (implementer)
**App:** ClassPanels (Electron + React, single file)
**Main file:** `src/teacher-app.jsx` (~6,080 lines). All UI is inline-styled JSX. Match the existing style: inline `style={{…}}`, `'Source Sans 3'`, `#1a1a2e` for primary buttons, `title=` on every control (Help mode reads these), short `/* … */` comments that explain *why*.
**Run:** `npm start` (builds `index.html`, then opens Electron). For the browser preview: `npm run build`, then the `classpanels-static` config in `.claude/launch.json` (http-server on :4173). `window.storage` falls back to localStorage in a browser (`src/index-template.html`), so the preview keeps data.

---

## 1. What the teacher wants

The **Flags** tab becomes a **Checklist** tab: a grid with students as rows and work/tasks as columns. It shows at a glance who owes what.

1. **Cells cycle on click:** blank (not submitted) → **Done** → **Late** → **Resubmit** → **N/A** → blank. A dropdown sets any status directly.
2. **Optional due date + time** on each column. Once a column is past due, any cell still blank turns **red (Overdue)** on its own, with no click needed.
3. **Any column can become a flag** (🚩 toggle). A flagged column defaults to "flag if **not submitted**". A **"Flag if…"** checklist lets the teacher pick one or more statuses instead.
4. Flagged items show as **flags next to student names** in the **Seating** view and the **Groups** view, but only when **"Show flags"** is ticked in **Manage Seating** or **Manage Groups**. The default is **on for seating** and **off for groups**.
5. **Drag column headers to reorder** them, so related assessments can sit together.
6. **Colour-code columns by category**, with a **legend** where the teacher names what each colour means.

---

## 2. Current code you'll be changing (line numbers are approximate)

| What | Where |
|---|---|
| `load(k,d)` / `save(k,v)`: async JSON over `window.storage` | ~143–144 |
| `FLAG_COLOURS` (5 colours, shared) | ~1446 |
| `ManageSeatingPanel`: flag dots in the unplaced-student list (~2797), name-click popup with a Flags section and "+ New flag" quick-create (~1834–1850, ~3548–3615) | 1797+ |
| Manage Seating "⚙ Randomize options" portal menu (a good place for a new toggle, using the same toggle markup) | ~2746–2775 |
| `StudentSeatingPanel`: `showFlags` state stored under the global key `seating-show-flags` (~3816, 3825); flag dots on seats (~4043–4066); header 🚩 toggle (~4081); name-click popup that manages flags (~4113–4215) | 3808+ |
| `GroupCard` (Manage Groups cards) | ~4361 |
| `ManageGroupsPanel`: settings use a `tog(value,label,onClick,title)` helper (e.g. Smart shuffle ~4952); state is saved to `gp-${classId}` with an **explicit field list** (~4494) | 4389+ |
| `StudentGroupsPanel`: `GroupBlock` renders names (~5154). **Its `randomize()` rebuilds `gp` from scratch (~5143)**, so any new field stored in `gp` gets wiped. Don't store showFlags in `gp`. | 5075+ |
| `FlagsPanel` (to be replaced) | 5245–5516 |
| `TabStrip` tabs array: `{id:"flags",label:"Flags",icon:"🚩",help:…}` | ~5646 |
| Root `TeacherApp`: `openPanels` includes `flags`; `flagsData` state, **polled every 2s** from storage (~5818–5826); `updateFlagsData`; `cleanupRemovedStudents` strips flags (~5874); delete-class prefix list `['sl-','sh-','ph-','flags-','tag-colors-']` (~5914); `goToFlag`/`pendingExpandFlagId` (~5969–5975); `panelOrder`, `PANEL_MIN`, `PANEL_DEFAULT` (~5977–5986); panel render lines (~6048–6068) | 5784+ |
| Copy that mentions flags: delete-class confirm (~653), remove-student confirm (~841) | |

---

## 3. Data model

### Per class: `checklist-${classId}`
```js
{
  version: 1,
  columns: [                     // array order = display order
    {
      id: 'c-1730550000000',
      name: 'Lab report',
      colour: 'Blue',            // label from CHECK_COLOURS, or null = uncategorised
      due: '2026-11-05' | null,  // local date, YYYY-MM-DD
      dueTime: '15:30' | null,   // optional; if due is set and this is null, treat as 23:59
      flag: false,               // the 🚩 toggle
      flagIf: ['none'],          // statuses that raise a flag when flag===true
      flagOnlyOverdue: false,    // if true, 'none' only flags once the due time has passed
    }
  ],
  cells: {                       // sparse; a missing entry means status 'none'
    [colId]: { [studentId]: { status: 'done'|'late'|'resubmit'|'na', note?: string } }
  }
}
```
Statuses: `none` (blank / not submitted), `done`, `late`, `resubmit`, `na`.
**Overdue is derived and never stored.** It is `status==='none' && due && now > dueDateTime(col)`.

### Global (all classes)
- `checklist-categories`: `[{colour:'Blue', label:'Homework'}, …]`. Category meanings are usually the same across a teacher's classes, so store them globally.
- `seating-show-flags`: **already exists**, default `true`. Reuse it.
- `groups-show-flags`: **new**, default `false`.

### Colours
Rename `FLAG_COLOURS` to `CHECK_COLOURS` (or keep the name and extend it) and grow it to about 8 entries (add Teal, Pink, Grey alongside Red/Amber/Blue/Green/Purple), keeping the same `{label,bg,border,text}` shape. **Don't use Red as a category default.** Red means overdue in the grid, so put it last in the rotation.

### Status display constants (add next to the colours)
```js
const CHECK_STATUSES = [
  {id:'none',     label:'Not submitted', short:'',  bg:'#fff',    text:'rgba(0,0,0,0.25)'},
  {id:'done',     label:'Done',          short:'✓', bg:'#edf7ef', text:'#3a8a4e'},
  {id:'late',     label:'Submitted late',short:'L', bg:'#fdf5e6', text:'#b8850a'},
  {id:'resubmit', label:'Resubmit',      short:'↻', bg:'#f3eefb', text:'#7850b4'},
  {id:'na',       label:'Not applicable',short:'–', bg:'#f0f1f4', text:'rgba(0,0,0,0.35)'},
];
const CHECK_CYCLE = ['none','done','late','resubmit','na'];
const OVERDUE = {bg:'#fdeeed', text:'#c44', border:'rgba(200,60,60,0.35)'};
```

### Pure helpers (top level, near the constants)
- `dueDateTime(col)` returns a `Date` or `null`. Build it from local parts with `new Date(y, m-1, d, hh, mm)`. Don't use `new Date('YYYY-MM-DD')`, which parses as UTC.
- `cellStatus(data, colId, studentId)` returns `data.cells?.[colId]?.[studentId]?.status || 'none'`.
- `isOverdue(col, status, now)`.
- `isFlagged(col, status, now)`: true when `col.flag && col.flagIf.includes(status)`, unless `status==='none' && col.flagOnlyOverdue && !isOverdue(...)`.
- `flagsForStudent(data, studentId, now)` returns `[{colId, name, colour, status, overdue}]` for every flagged column, in column order.

### Migration from old flags (run once, inside the checklist loader)
If `checklist-${classId}` is missing and `flags-${classId}` has data, turn each old flag `{id,name,colour,students:[{id,note}]}` into a column:
- `flag: true`, `flagIf: ['none']`, `colour` kept, no due date.
- Students **on** the old flag: no entry (status `none`). If they had a note, store `{status:'none', note}`; the helpers must treat an entry with `status:'none'` the same as a missing one.
- Students **not** on the old flag: `{status:'na'}`.

This keeps exactly the same set of flagged students as before. Save the result to `checklist-${classId}`. **Leave `flags-${classId}` in place** as a backup, and don't read it again once the checklist key exists.

---

## 4. State architecture (root `TeacherApp`)

Replace `flagsData`, `updateFlagsData`, and the **2-second polling interval** with lifted state. The polling only existed because FlagsPanel saved on its own.

```js
const [checklist, setChecklist] = useState(EMPTY_CHECKLIST);
const [checkCategories, setCheckCategories] = useState([]);
const [showFlagsSeating, setShowFlagsSeating] = useState(true);
const [showFlagsGroups, setShowFlagsGroups] = useState(false);
const [now, setNow] = useState(()=>Date.now());
useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(t);},[]); // so overdue turns red while the app is open
```
- Load `checklist-${activeClassId}` when the class changes (running the migration above). Load categories and both show-flags keys once on mount.
- `updateChecklist(next)` sets the state and saves it. Pass it down as `onChange`.
- `flagsByStudent = useMemo(() => Map<studentId, flags[]>, [checklist, activeClass, now])`, built with `flagsForStudent`.
- Pass `flagsByStudent` plus the relevant `showFlags…` value and setter to `StudentSeatingPanel`, `ManageSeatingPanel`, `StudentGroupsPanel`, and `ManageGroupsPanel`. Pass `checklist` + `updateChecklist` + `categories` + `setCategories` + `now` to `ChecklistPanel`.
- `cleanupRemovedStudents`: also delete removed IDs from every `cells[colId]` in `checklist-${classId}`, and update state if it's the active class.
- Delete class: add `'checklist-'` to the prefix list (keep `'flags-'` there too).
- Rename the panel ID `flags` to `checklist` everywhere: `openPanels` initial state, `panelOrder`, `PANEL_MIN` (`checklist:340`), `PANEL_DEFAULT` (`checklist:560`, since a grid needs room), the render line, and the TabStrip tabs (`{id:"checklist",label:"Checklist",icon:"✅",help:"A grid of work and tasks — who's done what, who's late, who owes what."}`).
- Replace `goToFlag` / `pendingExpandFlagId` with `goToChecklist({studentId, colId})`. It opens the Checklist tab (via `exitManageSeatingToTab('checklist')`) and passes a one-shot focus target that scrolls to and briefly highlights that row or cell. Same pattern as now.

---

## 5. `ChecklistPanel` (new; replaces `FlagsPanel` entirely)

Props: `{activeClass, data, onChange, categories, onChangeCategories, now, focus, onFocusHandled}`.

### Layout
- **Header** (same style as other panels): small caps "CHECKLIST", class name below, and a **"+ Add item"** button on the right.
- **Legend row** under the header: one chip per colour in use, or all colours if you prefer. Each chip shows a dot and its label, e.g. "● Homework". Click a chip to rename it inline (saves to `checklist-categories`). Unlabelled colours show a muted "Add label" placeholder. A small "Clear filter" or click-to-filter is **optional**; skip it unless it's cheap.
- **Grid**: a scroll container with `overflow:auto`.
  - Sticky first column (`position:sticky; left:0`) with student names, about 140px wide, ellipsised. Next to it, an **"Owes" count**: the number of flagged items, or of `none`/overdue cells if no column is flagged. Show it as a small red pill when it's above 0.
  - Sticky header row (`position:sticky; top:0`). Each column header is about 84px wide and has: a 4px colour strip on top (category colour), the name (2 lines max, ellipsised), the due date in small text underneath (e.g. "Thu 5 Nov · 15:30", in red when past due), and 🚩 if `flag` is on.
  - Cells are about 84×30px and show the status `short` glyph on the status `bg`. Overdue blank cells use the `OVERDUE` styling with a small "!" or "Overdue". Cells with a note get a tiny corner dot, and the note goes in `title`.
  - An optional footer row per column, e.g. "18/24 ✓" (counting done + late + na).
- **Empty state:** "No checklist items yet — add one above" (same italic muted style as the old empty state).

### Cell interaction
- **Left click** advances one step through `CHECK_CYCLE`. Write the sparse form: delete the entry when the result is `none` and there's no note.
- **Dropdown:** **right-click** (`onContextMenu`, `preventDefault`) or a small "▾" that appears on cell hover opens a portal menu at the cell (reuse `useAnchoredMenu` or the existing `createPortal` + `position:fixed` pattern). The menu has the 5 statuses (glyph + label, current one checked), a divider, and **"Add/edit note…"**, which turns into an inline text input in the menu.
- Close on outside click or Escape, matching the other menus.

### Column header interaction
- **Click** opens a portal popover editor with these fields:
  - Name (text)
  - Category colour (swatches, with labels from the legend shown in `title`)
  - Due date (`<input type="date">`) + optional time (`<input type="time">`) + "Clear"
  - **🚩 Flag this item** toggle (use the existing toggle-switch markup)
  - When the flag is on, **"Flag if…"** checkboxes, one per status: Not submitted (default checked), Done, Late, Resubmit, N/A. Under "Not submitted", show the sub-checkbox **"Only once overdue"** (`flagOnlyOverdue`), enabled only when a due date is set. Don't allow an empty `flagIf`: if the last box gets unticked, turn `flag` off.
  - Bulk actions: "Mark all blank as Done" and "Mark all blank as N/A"
  - **Delete item** with an inline confirm, matching the delete-class confirm style ("Delete "X"? This removes everyone's status for it.")
- **"+ Add item"** adds a column at the end with `name:'New item'` and the next colour from the rotation (or null). It then opens that column's editor with the name field focused and selected.

### Drag to reorder columns
- Use native HTML5 drag on the header cells (`draggable`, `onDragStart` sets the column ID, `onDragOver` works out whether the drop lands left or right of the hovered header's midpoint, and `onDrop` splices the `columns` array). Show a 2.5px insertion bar in `#2e6bce`, following the existing `insertBefore` box-shadow idiom in `GroupCard`. Clicking without dragging still opens the editor.
- Persist by saving `columns` in its new order.

### Focus from other panels
On a `focus` prop of `{studentId, colId?}`, scroll the row (and cell) into view, apply a 1.2s highlight outline, then call `onFocusHandled()`. Same approach as FlagsPanel's `focusFlagId` effect.

---

## 6. Flags in the Seating and Groups views

### Show-flags toggles
- **Manage Seating:** add a **"🚩 Show flags"** toggle to the "⚙ Randomize options" menu, or a small "Display" group just below it (your call; keep it visible and inside the left sidebar). It's bound to `showFlagsSeating` and saved to `seating-show-flags`.
- **Seating tab (`StudentSeatingPanel`):** keep the existing header 🚩 toggle, which teachers use to hide flags before projecting, but bind it to the **same** lifted `showFlagsSeating`. Delete the panel's local `showFlags` state and its load/save, so the two toggles can't disagree.
- **Manage Groups:** add `{tog(showFlagsGroups,"Show flags",…,"Show 🚩 next to students with flagged checklist items in the Groups view")}` next to the Smart shuffle row. Save it to the **separate** key `groups-show-flags`, **not** inside `gp` (see the `StudentGroupsPanel.randomize` warning in §2).

### Rendering
Make one small shared component, `FlagDots({flags, scale=1, max=3, onClick})`. It renders a dot per flag coloured by the column's category, overdue ones with a red ring, and "+n" past `max`. Its `title` lists them, e.g. "Lab report — overdue\nHomework 3 — not submitted". Use it in:
- `StudentSeatingPanel` seat rectangles, where the current dots are (~4051). Gate on `showFlagsSeating`. This also covers full-screen display mode, since it's the same toggle.
- `ManageSeatingPanel` unplaced-student list (~2807), always shown as it is now.
- `StudentGroupsPanel` `GroupBlock` names, normal and `big`. Gate on `showFlagsGroups`.
- `GroupCard` names in Manage Groups. Gate on `showFlagsGroups`.

### Name-click popups (seating views)
Both popups currently manage flags: add to existing, quick-create, apply to others, remove.
**Replace their Flags section** with a **"Checklist"** section that lists this student's **outstanding items**, meaning flagged items plus any overdue ones. Each row shows the colour dot, item name, and a status `<select>` (the 5 statuses) that writes through `onChangeChecklist`. Below the list, add an **"Open in Checklist →"** button that calls `goToChecklist({studentId})`. Remove the quick-create flag UI and its state (`quickFlagOpen`, `quickFlagName`, `quickFlagColour`, `expandedFlagId`, `toggleFlagForStudent`, etc.). Keep the Tags section of the Manage Seating popup as it is.

---

## 7. Copy updates
- Delete-class confirm: "…This removes its roster, seating and checklist."
- Remove-student confirm: "…clears them from the seating plan and the checklist."
- Search for leftover `flag` strings in `title=` text and the help text, and reword them. "Flag" still means a 🚩 on a name; "Checklist" is the tab.

---

## 8. Suggested build order (each step should leave the app running)
1. Constants, helpers, data model, and migration. Lift state into `TeacherApp` (remove the polling). Rename the panel ID to `checklist`.
2. `ChecklistPanel` grid: rows, columns, add item, click-cycle, right-click menu, notes.
3. Column editor popover: name, colour, due date/time, delete, bulk actions. Overdue styling, with the `now` tick.
4. Flag toggle + "Flag if…" + `flagsByStudent`. `FlagDots` in the seating views. Rework the name-click popups.
5. Show-flags toggles (Manage Seating, the Seating header bound to shared state, Manage Groups) + dots in both group views.
6. Drag-to-reorder columns.
7. Category legend with editable labels.
8. Copy, cleanup paths (remove student / delete class), and deletion of `FlagsPanel` and dead flag code.

## 9. Acceptance checks (run in the browser preview or Electron)
- [ ] Existing flags migrate: the same students show the same dots in Seating as before.
- [ ] Clicking a cell cycles blank→✓→L→↻→–→blank. Right-click sets any status directly. Notes persist.
- [ ] A column due 1 minute in the past turns its blank cells red within about 60s, with no reload. Done/N/A cells stay unchanged.
- [ ] Turn on 🚩 with the default flag-if: only students with blank cells get a dot in Seating. Add "Late": late students get one too. "Only once overdue" hides dots until the due time.
- [ ] Seating dots show by default; Groups dots don't. Ticking "Show flags" in Manage Groups shows them in the Groups tab, and the setting survives a restart. Randomising groups from the Groups tab doesn't reset it.
- [ ] The Seating header toggle and the Manage Seating toggle always match.
- [ ] Dragging a column header reorders it and the order survives a restart.
- [ ] Legend labels save and show across classes.
- [ ] Removing a student or deleting a class leaves no orphan checklist data. Switching classes loads the right checklist.
- [ ] No console errors. Blackboard theme still readable (the grid uses white cells on `--board-bg`, like other panels).

## 10. Decisions already made (change only if the teacher says so)
- **Flag is opt-in per item** (🚩 toggle off by default for new items), so the seating plan doesn't fill with dots for every homework. When turned on, it defaults to "flag if not submitted".
- **Overdue doesn't change the stored status.** It only colours blank cells red. (Alternative not built: auto-set a "Done" click after the deadline to "Late". Easy to add later as a per-column option.)
- **New students added mid-term** start as blank (not submitted) on existing items. The teacher can set N/A.
- **Category labels are global** across classes. Column colours are per item.
