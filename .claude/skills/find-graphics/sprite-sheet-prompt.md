# Sprite-sheet fallback prompt

Use when no free graphic fits. Fill in the brackets from the sim's style card and send Tom the finished
prompt to paste into an image tool (for example ChatGPT, Gemini or Midjourney). Ask him to add the image he
gets to the chat.

---

Create one image: a sprite sheet of [NUMBER] separate illustrations for a school science app, arranged in a
neat grid of [ROWS] rows and [COLUMNS] columns, in this order, left to right, top to bottom:
[1. Great white shark, 2. Atlantic mackerel, 3. Harbour seal, ...].

Style: [warm, rounded and friendly cartoon, soft shading, big round eyes with a white highlight, gentle
outline in a darker shade of each object's own colour]. Colours: [list the palette]. Light from the upper left.
Every animal faces right and is shown side-on, whole, and not cropped.

Keep them scientifically accurate in shape and features (for example [the shark's tall dorsal fin, five gill
slits and bigger top tail lobe; the mackerel's wavy dark back stripes and small finlets]).

Plain flat background in a single colour [#F4EAD8] with nothing else on it: no shadows on the ground, no text,
no labels, no borders, and a clear gap of empty background between every illustration.
Do not copy any existing cartoon, game or film character, logo or brand.

---

Then: `slice_sheet.py SHEET.png <scratch>/sliced --names <names in the same order> --trace`.
