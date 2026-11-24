# ClassPanels — Dev Setup

## Prerequisites
- Node.js 18+ (download from nodejs.org)
- npm (comes with Node)

## First-time setup
```bash
npm install
```

## Place source files
Put `teacher-app.jsx` in the `src/` folder alongside `entry.jsx`.

## Run in development
```bash
npm start
```
This builds index.html then launches Electron. Add `openDevTools()` in main.js temporarily if you need the console.

## Tests
Run `node tests/run.js` (about 20 minutes; it uses fake students only), `node tests/geometry.test.js` and `node tests/colours.test.js`. They open the app in a headless browser served over a tiny local web server.

## Your data
- Everything is saved inside the app on your Mac. Settings > Export backup saves it all to one file.
- The app also backs itself up automatically: once a day when it opens, and before any change to how data is stored. The last 10 copies are listed in Settings > Automatic backups, and each one is also saved as a file in `Documents/ClassPanels Backups`.

## What's new (November 2026, branch `classpanels-rooms`)
The full plan and as-built notes are in `docs/ROOMS_PLAN.md`.
- **Class chips** along the top: one click (or ⌥1–9) switches class.
- **New look** in the style of the app icon, with matching buttons everywhere.
- **Timer:** ⚡ Quick starts an action in one click. Drag one timer onto another to combine them, set it to repeat, and use ✂ Split to separate them again.
- **Table shapes:** single, pair, long 4 and 6, trapezoid, round, lab bench, plus ready-made hexagon, long table of 8 and horseshoe. Tables rotate and snap together, and chairs tuck under the edges. Benches have standing spots. Use Convert to table ▸ to change an old desk group into a shape.
- **Table colours:** a picker in the selection bar, with an option to make chairs match.
- **Room builder:** use 🧱 Edit room for walls, doors and windows. + Room items has classroom and lab items, areas and lines, all of which can be labelled and resized. Mark as station adds a numbered badge. 🏫 Rooms saves a room with several layouts.
- **Setups:** tabs such as Regular / Lab / Lab partners, each with its own seating and its own usable furniture. Regular is your everyday plan.
- **Seat these groups ▸:** in Groups, this puts groups at tables or benches in a setup, coloured by group.
- **🔄 Stations:** pick groups and stations, then start a rotation timer. Groups move on at the end of each step, with a chime and a big "Rotate!". Manual Rotate and Back buttons are there as well.

## Package for distribution (macOS arm64)
```bash
npm run dist
```
Outputs a `.dmg` and a `.app` folder in `dist/`.

## Project structure
```
classpanels/
  main.js                  ← Electron main process
  build.js                 ← Build script (esbuild → index.html)
  package.json
  assets/
    icon.icns              ← App icon (put your icon here)
  src/
    teacher-app.jsx        ← Main app source
    entry.jsx              ← React mount point (do not edit)
    index-template.html    ← HTML shell (do not edit)
  dist/                    ← Built output (created by npm run dist)
```

## Updating the app
1. Edit `src/teacher-app.jsx`
2. Run `npm start` to test
3. Run `npm run dist` to package

## Icon
Place your `icon.icns` in the `assets/` folder before running `npm run dist`.
To generate `icon.icns` from a PNG: use [Image2icon](https://img2icnsapp.com) or `iconutil` on macOS.
