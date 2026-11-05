# Sparks retrieval build: shared spec

Content source: `sparks-through-time/docs/Sparks_Retrieval_Catalogue.md`, signed off by Tom. Plan decisions are summarised here. Do not change content, numbers or wording from the catalogue. `retrieval/src/01-data.js` is generated from it: use its constants.

## Rules for every agent
- Tom is a teacher, and tokens are short. Stay in your part. Don't read `Sparks-Through-Time.html` whole: it is 1.4 MB with 190,000-character lines. Use `grep -n` and `sed -n 'a,bp' | cut -c1-300`.
- Write only your own files, listed in your brief. Don't use git. Don't edit the HTML unless your brief says so.
- Test with `node retrieval/build-retrieval.js --out <scratch path>.html`, then Playwright (`require('playwright')`, already installed). Load with localStorage `sparks-through-time-v1` = `{"studentName":"Check","studentClass":"6X"}`.
- All code shares one script scope with the sim. Reuse `h(tag,attrs,...kids)`, `sv()`, `pipSay()`, `app()`, `Store`, `STOPS`, `rvItems(stop,part)`, `reviewCard(el,it,n,saved,onSave,opts)`, `prog(id)`, `renderHome()`, `printAs(name)`, `shuffle`, `seededOrder`, existing CSS classes (`btn`, `primary`, `quiz-card`, `rv-card`, `chip`, `row`, `stop-hero`). New CSS: add it by a `<style>` element from your own JS. Prefix names with `rt`/`RT_`.
- Fully offline: no CDN, no network.
- Saves: everything under `Store.data.rt`, reads tolerate it being missing. Never change existing Store keys.
- Student text: warm, full, simple sentences at Grade 6 level. "approx." on times. Say flashlight, never torch. Avoid the noun "speed" ("turns each second", "faster"). Never show MYP, objectives, criteria, strands or standards to students. Student names for paragraphs: "Data paragraph", "Reading paragraph". g = 9.8 N/kg if gravity ever appears.
- Touch, mouse and keyboard all work; no sideways scroll at 390 px wide.
- One go per auto-marked question, as `reviewCard` already does.
- Finish with a short report: files written, tests passed, anything you could not do. No long logs.

## Shared API (keep these names exactly)
**`10-families.js`**
- `rtRng(seedStr)` → function returning 0 to 1, deterministic.
- `RT_FAMILIES`: `[{n:'F1', id, stop, slots:{A:'Apply',B:'Predict'}, classOnly?:true}]`. `stop` is a `STOPS` id.
- `rtGen(id, dir, rng, opts)` → a review item in the same shape as items in `REVIEWS` (`t`, `q`, `options`, `answer`, `unit`, `tol`, `explain`, `rows`…), plus `fam`, `dir`, `topic` (stop id), `obj` (teacher strands). `opts.challenge` allows Challenge modes.
- `RT_SLOTS`: the stop → `{apply:[[id,dir]…], calc:[…], predict:[…]}` table from catalogue section 2.

**`20-paragraph.js`**
- `rtParagraphTask(kind, stops, rng, opts)` → `{kind:'C'|'D', n, title, data?, passage?, prompt, model, ticks:[4 strings], words}`. `kind` may be null for "either". Returns null when no template fits the stops. `opts.pin = {n, promptLabel}` gives the catalogue sample exactly.
- `rtParagraphCard(el, task, n, saved, onSave)`: renders one box, the fold-out, then model and ticks after Check. `onSave({text, ticks:[bool×4]})`.
- `rtGraph(el, spec)`: inline SVG line or bar chart with labelled axes, for screen and print.

**`25-review.js`**: `renderRtReview()`, `rtBuildReview(stops, rng, opts)` → array of six items.
**`30-flashcards.js`**: `renderRtFlashcards(preTicked)`, `rtLastPractised(stop)`, `rtMarkPractised(stop)`.
**`35-backup.js`**: `rtBackupSection()`: save code, ported from `force-hq-rebuild/src/js/70-backup.js`.
**`40-timetest.js`**: `renderRtTimeTest()`, `rtBuildTimeTest(seed, opts)`, `rtPrintTimeTest(seed, mode)`.
**`45-classsets.js`**: `rtTeacherSection()`, `renderRtClassSet(code)`, `rtFindSet(code)`.
**`90-home.js`**: `rtHomeSection()`: the home cards. It checks `typeof` for each feature, so a missing part never breaks the sim.

The sim calls `rtHomeSection`, `rtTeacherSection` and `renderRtTimeTest` through `typeof` guards, so the sim works at every stage.

## Saved data
`Store.data.rt = {cards:{key:{box,due}}, practised:{stop:'YYYY-MM-DD'}, lastFams:[], lastKind:'C'|'D', reviews:0, ttBest:null}`. "Reset my progress" keeps `rt.practised` and `rt.cards`.
