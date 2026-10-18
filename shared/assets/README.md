# Shared graphics library

Reusable, free-to-use graphics for any sim. Every file is listed in `CREDITS.md` with its source, author and
licence. Check here before searching for new art, and add new finds through the find-graphics skill
(`.claude/skills/find-graphics/`) so the credits stay complete.

| Folder | What goes in it |
|---|---|
| `animals/`, `plants/`, `cells/`, `body/` | Living things: original silhouettes (`*-silhouette.svg`) and restyled versions (`*-friendly.svg`) |
| `lab/` | Glassware and apparatus |
| `objects/` | Everyday things for forces and energy sims |
| `space/`, `earth/` | Planets, the Sun, landscapes, rocks, weather |
| `profiles/` | Shapes stored as numbers for code-drawn creatures (e.g. `fish-looks.js`) |
| `styles/` | One style card per sim (palette, outline, shading) so every graphic in a sim matches |

Files here are the sources. A sim never links to them: the find-graphics skill embeds what a sim needs
inside its offline HTML file, so the Toddle copy stays self-contained.
