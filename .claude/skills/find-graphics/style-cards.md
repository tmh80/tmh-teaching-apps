# Style cards

A style card is a small JSON file per sim (`shared/assets/styles/<sim>.json`) that every graphic in that sim
follows, so the 20th picture matches the first. `makeover.py --style` reads it directly.

```json
{
 "sim": "Adapt Lab",
 "look": "warm, rounded and friendly",
 "outline": 0.011,          // outline thickness as a fraction of the picture width
 "highlight": 0.28,         // strength of the soft shine along the back (0 to 1)
 "split": 0.58,             // where the dark back fades to the pale belly (0 = top, 1 = bottom)
 "colours": {"back": "...", "back2": "...", "belly": "...", "belly2": "...", "line": "...", "stripe": "..."},
 "species_colours": {"mackerel": "back,back2,belly,belly2,line,stripe"}
}
```

## Setting a new sim's card with Tom

1. Pick one typical subject for the sim (a car for a forces sim, a beaker for chemistry).
2. Make a contact sheet with 2–4 genuinely different looks: for example Fluent flat, Noto, a recoloured
   Game Icons silhouette, and a Kenney sprite.
3. Show Tom and ask which feels right (and whether it should match the sim's existing colours).
4. Write the card from his choice: palette from the sim's own CSS colours where possible, the outline
   weight and detail level of the chosen look, light from the upper left, objects facing right.
5. Note any rules Tom adds ("no faces on objects", "flat colours only") in `notes`.

## Adapt Lab (set by Tom, Oct 2026)

- Warm, rounded, friendly: Pikmin-inspired qualities (soft shapes, big expressive eyes, cheerful colour),
  never copied characters.
- Matches the canvas creatures already in the sim: soft countershading, warm key light from the upper left,
  rim light along the back, big round eyes with a white catch-light.
- Anatomy stays accurate under the friendly style: predators' eyes forward near the snout, prey animals' eyes
  further back on the side; mammals get dot eyes, a dot nose, a mouth stroke
  and a curved-line ear sized to the animal (Tom's sketch, Oct 2026; see SKILL.md, section 6).
- Inside the sim, creatures are code-drawn from traits; real proportions come from PhyloPic via profile.py.
  The friendly SVGs in `shared/assets/animals/` are for places that show a fixed picture (cards, worksheets).
