---
name: find-graphics
description: Find free-to-use graphics (organisms, cells, body systems, lab apparatus, everyday objects, planets, landscapes) from open online libraries, check their licences, restyle them to match a sim, and embed them so Tom's offline Toddle sims stay self-contained. Use whenever a sim needs richer art than code-drawn shapes, when Tom asks for better pictures of something, or when building a parts kit for code-drawn creatures. Also covers slicing a sprite sheet Tom made in another AI tool.
---

# Find graphics

Claude can't generate images, and code-drawn shapes look basic for organic subjects. This skill finds
ready-made, free-to-use graphics, makes them match the sim's style, and builds them into the offline file.

Tom teaches general science (Grade 6–8): living things, forces and motion, electricity and energy,
chemistry, earth and space. He is not a programmer: show him pictures, never describe them, and explain
choices in plain language.

Scripts live in `scripts/` (run with `python3 -I`; they need `pip install --break-system-packages cairosvg vtracer`,
plus Pillow, numpy and opencv, which are usually preinstalled). Reference files:
- `sources.md`: every source, how to reach it, its licence and its style, plus what was unreachable last time.
- `style-cards.md`: how to set a sim's look, with Adapt Lab's card as the worked example.
- `sprite-sheet-prompt.md`: the fallback prompt Tom pastes into another AI tool.

## 0. Decide whether a graphic is the right tool

Keep these **code-drawn**: circuit symbols, force arrows, graphs, ray diagrams, particle models, field lines,
anything that follows a science convention, and anything students drag, stretch, resize or build.
Use **graphics** for real-world things and scenery: the animal, the plant, the beaker, the car on the ramp,
the planet, the volcano.

For **trait-driven creatures** (Adapt Lab's Create section) never swap in whole pictures: students can make
thousands of combinations. Build a **parts kit** instead: take real proportions from silhouettes with
`profile.py` and feed them to the code that draws the body, fins, wings and so on (see the FISH_LOOK example in
`shared/assets/profiles/fish-looks.js`). Named species get a cosmetic `look` setting in the same kit, so they
match what students build. A look must never change traits or survival maths.

## 1. Check the library first

Look in `shared/assets/` (see its README) before searching. Reuse beats re-finding, and keeps sims consistent.

## 2. Set the style (ask Tom, once per sim)

If `shared/assets/styles/<sim>.json` exists, use it. If not, ask Tom which look he wants **by showing him a
contact sheet** of 2–3 candidate styles for one subject (for example Fluent flat vs Noto vs a restyled
PhyloPic silhouette), then write the style card (`style-cards.md`). Adapt Lab's look is fixed:
warm, rounded and friendly, with Pikmin-inspired qualities and no copied characters.

## 3. Search: where to look first

| Subject | First | Then | Last resort |
|---|---|---|---|
| A named species (animal, plant, fungus) | PhyloPic (needs the **scientific name**) | Iconify emoji sets | Wikimedia |
| A generic living thing (tree, microbe, mushroom) | Iconify emoji sets | Bioicons | |
| Cells, organelles, organs, body systems, microbes | Bioicons (incl. Servier Medical Art, SwissBioPics) | Iconify | Wikimedia |
| Lab glassware and apparatus | Bioicons (Lab_apparatus, Chemistry) | Iconify | |
| Everyday objects for forces/energy (cars, balls, rockets, magnets, bulbs, batteries) | Iconify (Fluent Emoji, Noto) | Kenney packs | Game Icons (recolour) |
| Planets, Sun, Earth from space | NASA (real photos) | Kenney `planets` (friendly) | Iconify |
| Landscapes, rocks, volcanoes, weather | Iconify | Kenney | Wikimedia |

```
python3 -I scripts/search.py "<term>" --sources iconify,phylopic --out <scratch>/<subject>
python3 -I scripts/search.py "Scomber scombrus" --sources phylopic --out ...     # scientific names for PhyloPic
python3 -I scripts/search.py "plant cell" --sources bioicons --out ...
python3 -I scripts/search.py saturn --sources nasa --out ...
python3 -I scripts/search.py --kenney physics-assets --out ...                  # whole CC0 pack
python3 -I scripts/contact_sheet.py <scratch>/<subject> --bg "<the sim's scene colour>"
```

If a search finds nothing, try the technical name or a synonym (conical flask → Erlenmeyer; Bunsen burner →
burner; great white shark → *Carcharodon carcharias* for PhyloPic). Downloads go to the scratchpad, never straight into the repo. A source that fails (network, rate limit) is
reported and skipped. Note it in `sources.md` and move on; don't retry in a loop.

**Always look at the contact sheet yourself** (Read the PNG) before showing Tom. Search results can be the
wrong thing: NASA's first "Mars" hit was a flattened map, its first "Saturn" hit was a close-up of a storm.

## 4. Licences: the rule

`search.py` sorts every result (logic in `fg_common.classify_licence`):
- **free**: CC0, public domain, MIT, Apache. No credit needed in the sim (still logged in CREDITS.md).
- **credit**: CC BY. Allowed, but the sim must show the credit line in its About/Credits panel.
- **reject**: anything share-alike (SA, e.g. OpenMoji), non-commercial (NC), no-derivatives (ND),
  GPL/GFDL or unknown. Never downloaded, never used.

Prefer **free** over **credit** when quality is similar. Never use logos, brand mascots, real people, or
art that copies a known character, even if it is on an open site. NASA imagery is public domain, but NASA's
logo and insignia are not.

## 5. Show Tom, let him choose

Send the contact sheet (SendUserFile), numbered, with one plain line per option on why it might suit.
Tom chooses. For a quick fix inside an approved plan (an extra matching icon in the same set), choose
yourself and show the result afterwards.

## 6. Clean up and restyle

`scripts/clean.py` subcommands (each reads IN, writes OUT):
`trim` (crop empty space) · `nobg` (remove a flat background) · `flip` (face right) ·
`recolour --palette` (snap colours to the style card) · `tint --colour` (one-colour silhouette) ·
`trace` (picture to vector, so parts can reshape) · `svgmin` (smaller SVG) · `shrink` (photos to WebP).

`scripts/makeover.py` turns a one-colour silhouette into a friendly vector using the style card:
countershaded body, rounded outline, highlight, big eye, optional stripes and gill slits.
```
python3 -I scripts/makeover.py SIL.svg OUT.svg --style shared/assets/styles/adapt-lab.json --flip --eye 0.88,0.34,0.17 --gills 0.79 --png preview.png
```
`--eye x,y,r`: x along the body (0 = left after flipping), y down the body depth at that point, r = eye size.
Check the preview PNG; adjust and rerun until it reads clearly at the size it will be shown.

Consistency checklist for every graphic in one sim: same facing direction, same outline weight, palette
only from the style card, same light direction (upper left), similar level of detail. Put the new art next
to the existing art in one image and look at them together before shipping.

## 7. Add to the library and credit it

Every file that enters the repo goes through `credits.py`, which refuses rejected licences and writes the
row in `shared/assets/CREDITS.md`:
```
python3 -I scripts/credits.py add <scratch>/<subject>/candidates.json --id "<id>" --to shared/assets/<group>/<name>.svg \
        --used-in "<Sim name>" --changes "flipped; recoloured"
python3 -I scripts/credits.py own --to shared/assets/<group>/<name>.svg --made-by "Tom, with <tool>" --used-in "<Sim>"
python3 -I scripts/credits.py check      # run before every commit: every file has a row, every row has a file
```
Run from the repo root. File names: lowercase-with-hyphens, by what it is (`atlantic-mackerel-friendly.svg`),
grouped by folder (`animals/`, `plants/`, `cells/`, `body/`, `lab/`, `objects/`, `space/`, `earth/`).
If a sim uses a **credit** item, add its credit line to that sim's credits/About panel too.

## 8. Embed so the offline file stays self-contained

```
python3 -I scripts/embed.py <scratch>/art.js shared/assets/animals/a.svg shared/assets/space/b.webp --name ART --budget-kb 1500
```
This writes one `const ART={...}` block (SVG as text, photos as WebP data URIs) plus `ART_IMG(key)` for canvas
`drawImage`. Paste it into the sim's source (its own module/section, near the top), rebuild the offline file,
and confirm no network requests. Size guide: vectors 2–10 KB each; photos 20–60 KB at 512 px. Keep total art
under about 1.5 MB per sim. If it is over, shrink photos (`--max 384 --q 70`) or use vectors.

## 9. Fallback: nothing suitable exists

1. Fill in `sprite-sheet-prompt.md` for the subject and the sim's style card, and send it to Tom to paste into
   an image tool.
2. Tom adds the result to the chat (or the repo). Then:
```
python3 -I scripts/slice_sheet.py SHEET.png <scratch>/sliced --names shark,mackerel,seal --trace
```
3. Check `<scratch>/sliced/slices.png`; the names apply left-to-right, row by row. Adjust `--tol` (background
   tolerance) or `--min` (smallest piece) if pieces merge or go missing.
4. Clean, restyle and credit as above, using `credits.py own --made-by "Tom, with <tool name>"`.

## 10. Before and after, then deliver

Any change to an existing sim gets a before/after image drawn by the sim's own code (headless Playwright on a
test copy), with a "should not change" row of untouched items. Trial new art on a branch or a trial copy of
the sim first, and keep the science model and layout untouched unless Tom asks. Then follow the sim-builder
skill's testing and delivery steps.
