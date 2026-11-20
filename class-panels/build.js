#!/usr/bin/env node
/**
 * build.js — ClassPanels build script
 *
 * Bundles src/teacher-app.jsx → index.html using esbuild.
 * Run via: npm run build
 * Run + launch: npm start
 * Package for distribution: npm run dist
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const TEMPLATE = path.join(__dirname, 'src', 'index-template.html');
const SOURCE   = path.join(__dirname, 'src', 'teacher-app.jsx');
const ENTRY    = path.join(__dirname, 'src', 'entry.jsx');
const OUT_HTML = path.join(__dirname, 'index.html');
const OUT_JS   = path.join(__dirname, '_bundle_tmp.js');

async function build() {
  console.log('Building ClassPanels…');

  // Bundle the React app into a single IIFE
  await esbuild.build({
    entryPoints: [ENTRY],
    bundle: true,
    minify: true,
    platform: 'browser',
    jsx: 'automatic',
    format: 'iife',
    define: { 'process.env.NODE_ENV': '"production"' },
    outfile: OUT_JS,
  });

  // Inject bundle into the HTML template
  const template = fs.readFileSync(TEMPLATE, 'utf8');
  const bundle   = fs.readFileSync(OUT_JS, 'utf8');

  // NOTE: using a function as the replacement (not a string).
  // String replacements treat $&, $`, $', $$, $n as special patterns and
  // would expand them — corrupting any bundle that happens to contain those
  // sequences. A function replacement returns the value verbatim.
  const html = template.replace('<!-- BUNDLE_PLACEHOLDER -->', () => `<script>\n${bundle}\n</script>`);
  fs.writeFileSync(OUT_HTML, html);

  // Clean up temp file
  fs.unlinkSync(OUT_JS);

  const size = (fs.statSync(OUT_HTML).size / 1024).toFixed(0);
  console.log(`Done. index.html → ${size} KB`);
}

build().catch(err => {
  console.error('Build failed:', err.message);
  process.exit(1);
});
