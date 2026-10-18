# Graphics sources

Tested from the cloud sandbox on 18 Oct 2026. Reachability can change: when a source fails, update the table.

| Source | Reach (Oct 2026) | How `search.py` gets it | Licence | Style and best use |
|---|---|---|---|---|
| **Iconify** (one API over 200+ open icon sets) | ✅ | `api.iconify.design/search` then per-icon SVG; licence read live per set | per set (below) | One search covers the emoji sets below |
| ↳ Fluent Emoji Flat / Fluent Emoji (Microsoft) | ✅ | Iconify | MIT (free) | Warm, rounded, friendly; ~3,000 items: animals, plants, microbes, objects, weather, space. Best all-round match for a friendly look |
| ↳ Noto Emoji (Google) | ✅ | Iconify | Apache 2.0 (free) | Friendly with a bit more detail |
| ↳ Twemoji | ✅ | Iconify | CC BY 4.0 (credit) | Bold, cartoony |
| ↳ Game Icons | ✅ | Iconify | CC BY 3.0 (credit) | 4,000 bold black silhouettes (springs, pulleys, gears); recolour to fit |
| ↳ OpenMoji | ✅ | Iconify | CC BY-SA 4.0: **rejected** (share-alike) | Thick black outlines |
| **PhyloPic** | ✅ | `api.phylopic.org` (build number fetched automatically); **needs scientific names**; prints suggestions if none | mostly CC0; some CC BY; some NC/SA (rejected automatically) | Accurate species silhouettes. Plain black, so use makeover.py or profile.py |
| **Bioicons** (incl. Servier Medical Art, SwissBioPics, DBCLS) | ✅ | GitHub repo `duerrsimon/bioicons`, blob-less clone cached in `~/.cache/find-graphics`; files fetched on demand; licence from the folder name | CC0, CC BY 3.0/4.0, MIT per file | Textbook-quality cells, organelles, organs, body systems, microbes, lab glassware |
| **NASA Image Library** | ✅ | `images-api.nasa.gov`; picks the size each item actually has (not every item has a "medium") | Public domain; logos/insignia excluded; third-party credits flagged | Real photos of planets, the Sun, Earth. Check results visually: first hits are often odd |
| **Kenney** | ✅ (pack download only; site search is not machine-readable) | `--kenney <pack-name>` downloads and unzips a pack | CC0 | Clean game art. Useful packs: `planets`, `physics-assets`, `fish-pack`, `car-kit`, `animal-pack-redux`, `nature-kit`. Browse kenney.nl/assets for names |
| **Wikimedia Commons** | ⚠️ often rate-limited (HTTP 429) from the sandbox | API with User-Agent, pauses and 500 px standard thumbnails | per file; many SA (rejected automatically) | Huge and mixed: old scientific drawings, diagrams, photos. Last resort; check each file page |
| Openclipart | ❌ site loads but its search returns errors | – | CC0 | – |
| SVG Repo | ❌ rate-limited | – | mixed | – |
| Pixabay | ❌ blocked (403) | – | own licence | – |
| Unsplash | ❌ not tested further (redirects, own licence) | – | own licence | – |

If a site Claude can't reach has exactly the right picture, Tom can download it and add it to the chat;
log it with `credits.py add` using a hand-made candidates.json record, or `credits.py own` if it's his.
