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
    teacher-app.jsx        ← Main app source (copy from Claude)
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
