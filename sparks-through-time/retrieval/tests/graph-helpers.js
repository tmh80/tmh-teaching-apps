/* Helpers that drive graphMaker with real pointer events (mouse down, move, up) the way a student would.
   Used by test-graph-maker.js and test-chapters.js. The canvas is 1000 x 560 with the plot area from x 240 to 966 and y 70 to 456. */
const GEO = {W: 1000, H: 560, L: 240, R: 966, T: 70, B: 456};

/* canvas pixel -> page position, using the canvas's current size on screen */
async function toPage(root, cx, cy){
  const cv = root.locator('canvas.gm-cv'); const b = await cv.boundingBox();
  return {x: b.x + cx / GEO.W * b.width, y: b.y + cy / GEO.H * b.height};
}
async function drag(page, from, to, steps){
  await page.mouse.move(from.x, from.y); await page.mouse.down();
  await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, {steps: 4}); await page.mouse.move(to.x, to.y, {steps: steps || 6}); await page.mouse.up();
}
async function centre(loc){ await loc.scrollIntoViewIfNeeded(); const b = await loc.boundingBox(); return {x: b.x + b.width / 2, y: b.y + b.height / 2}; }
const mapX = (g, v) => GEO.L + (v - g.x[0]) / (g.x[1] - g.x[0]) * (GEO.R - GEO.L);
const mapY = (g, v) => GEO.B - (v - g.y[0]) / (g.y[1] - g.y[0]) * (GEO.B - GEO.T);

/* g = {type:'scatter'|'bar', title, xl, yl, y:[min,max,step], x:[min,max,step] (scatter), rows:[[x,y],...], place:fn(rowIndex)->[x,y] to drop elsewhere, order:[row indexes] (bar) } */
async function setup(page, root, g){
  if (g.type) await root.locator(`.gm-opt[data-type="${g.type}"]`).click();
  if (g.title != null) await root.locator('input[aria-label="Graph title"]').fill(g.title);
  if (g.xl != null) await root.locator('input[aria-label^="x-axis label"]').fill(g.xl);
  if (g.yl != null) await root.locator('input[aria-label^="y-axis label"]').fill(g.yl);
  const ax = async (k, a) => { if (!a) return; const ins = root.locator(`.gm-axrow[data-ax="${k}"] input`); for (let i = 0; i < 3; i++) await ins.nth(i).fill(String(a[i])); };
  await ax('y', g.y); if (g.type !== 'bar') await ax('x', g.x);
}
async function plot(page, root, g){
  const cv = root.locator('canvas.gm-cv'); await cv.scrollIntoViewIfNeeded();
  if (g.type === 'bar'){
    const order = g.order || g.rows.map((_, i) => i);
    for (let slot = 0; slot < order.length; slot++){
      const i = order[slot], chip = root.locator(`.gm-chip.cat[data-i="${i}"]`);
      const n = g.rows.length, slotX = GEO.L + (GEO.R - GEO.L) * (slot + .5) / n;
      await drag(page, await centre(chip), await toPage(root, slotX, GEO.B + 30));
    }
    for (let slot = 0; slot < order.length; slot++){
      const i = order[slot], v = g.height ? g.height(i, g.rows[i][1]) : g.rows[i][1], n = g.rows.length;
      const slotX = GEO.L + (GEO.R - GEO.L) * (slot + .5) / n;
      await drag(page, await toPage(root, slotX, GEO.B), await toPage(root, slotX, mapY(g, v)));
    }
  } else {
    for (let i = 0; i < g.rows.length; i++){
      const [x, y] = g.place ? g.place(i, g.rows[i]) : g.rows[i];
      await drag(page, await centre(root.locator(`.gm-chip[data-i="${i}"]`)), await toPage(root, mapX(g, x), mapY(g, y)));
    }
  }
}
async function makeGraph(page, root, g){ await setup(page, root, g); await plot(page, root, g); }

module.exports = {GEO, toPage, drag, centre, mapX, mapY, setup, plot, makeGraph};
