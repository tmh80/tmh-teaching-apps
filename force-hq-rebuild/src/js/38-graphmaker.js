/* ===== Graph maker (ported from Sparks, redrawn as SVG for Force HQ) =====
   A student chooses scatter or bar, writes the title and axis labels with units, types the axis numbers and places a point for each row of the data.
   spec: { head:[xName, yName], rows:[[x, y]], xKind:'num'|'name', titleWords:[[…],[…]], xWords, yWords, xUnits, yUnits, exTitle, exX, exY }
   Marks (5): graph type, title, axis labels, axis numbers, points. Learn shows live rings and a checklist; the Check gives one go. */
const GM = { W: 600, H: 400, L: 74, R: 580, T: 44, B: 322 };
const GM_MARKS = ['Graph type', 'Title', 'Axis labels', 'Axis numbers', 'Points'];
const gmBlank = () => ({ type: '', title: '', xl: '', yl: '', xmin: '', xmax: '', xstep: '', ymin: '', ymax: '', ystep: '', pts: {}, bars: {} });
const gmNum = v => (v === '' || v == null || isNaN(+v)) ? NaN : +v;
const gmIsScatter = spec => spec.xKind === 'num';
const gmData = spec => spec.rows.map((r, i) => ({ i, name: String(r[0]), x: gmIsScatter(spec) ? +r[0] : null, y: +r[1] }));
function gmAxis(S, k) {   // the typed numbers for one axis, or null until they make a sensible grid
  const mn = gmNum(S[k + 'min']), mx = gmNum(S[k + 'max']), st = gmNum(S[k + 'step']);
  if ([mn, mx, st].some(isNaN) || st <= 0 || mx <= mn || (mx - mn) / st > 24) return null;
  return { min: mn, max: mx, step: st };
}
const gmTicks = a => { const out = []; for (let k = 0; a.min + k * a.step <= a.max + 1e-9; k++) out.push(+(a.min + k * a.step).toFixed(6)); return out; };
const gmFmt = v => String(+(+v).toFixed(4)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function gmNiceAxis(max) {   // starts at 0, equal steps (1, 2 or 5 times a power of ten), finishes at or just above the biggest number
  for (const p of [0.01, 0.1, 1, 10, 100, 1000, 10000, 100000]) for (const m of [1, 2, 5]) { const st = m * p; if (Math.ceil(max / st - 1e-9) <= 10 && Math.ceil(max / st - 1e-9) >= 4) return { min: 0, max: +(Math.ceil(max / st - 1e-9) * st).toFixed(6), step: st }; }
  return { min: 0, max: max, step: max / 5 };
}
function gmModel(spec) {
  const D = gmData(spec), sc = gmIsScatter(spec), S = gmBlank(), Y = gmNiceAxis(Math.max(...D.map(d => d.y))), X = sc ? gmNiceAxis(Math.max(...D.map(d => d.x))) : null;
  S.type = sc ? 'scatter' : 'bar'; S.title = spec.exTitle; S.xl = spec.exX; S.yl = spec.exY;
  S.ymin = Y.min; S.ymax = Y.max; S.ystep = Y.step; if (X) { S.xmin = X.min; S.xmax = X.max; S.xstep = X.step; }
  D.forEach(d => { if (sc) S.pts[d.i] = { x: d.x, y: d.y }; else S.bars[d.i] = d.y; });
  return S;
}
function gmLabelOK(spec, label, k) {
  const l = String(label || '').toLowerCase(), br = l.match(/\(([^)]*)\)/), units = spec[k + 'Units'];
  if (!spec[k + 'Words'].some(w => l.includes(w))) return false;
  if (!units) return true;
  return !!br && units.includes(br[1].trim().toLowerCase().replace(/\./g, ''));
}
function gmScaleOK(vals, a) { if (!a) return false; const mx = Math.max(...vals), n = (a.max - a.min) / a.step; return a.min === 0 && Math.abs(n - Math.round(n)) < 1e-6 && n >= 2 && n <= 20 && a.max >= mx - 1e-9 && a.max - mx < 2 * a.step - 1e-9; }
const gmPtOK = (d, p, X, Y) => !!p && Math.abs(p.x - d.x) <= 0.4 * X.step + 1e-9 && Math.abs(p.y - d.y) <= 0.4 * Y.step + 1e-9;
const gmBarOK = (d, v, Y) => v != null && Math.abs(v - d.y) <= 0.4 * Y.step + 1e-9;
function gmEval(spec, S) {
  S = S || gmBlank(); const D = gmData(spec), sc = gmIsScatter(spec), X = sc ? gmAxis(S, 'x') : null, Y = gmAxis(S, 'y'), m = [false, false, false, false, false];
  m[0] = S.type === (sc ? 'scatter' : 'bar');
  const t = String(S.title || '').toLowerCase(); m[1] = spec.titleWords.every(g => g.some(w => t.includes(w)));
  m[2] = gmLabelOK(spec, S.xl, 'x') && gmLabelOK(spec, S.yl, 'y');
  m[3] = gmScaleOK(D.map(d => d.y), Y) && (!sc || gmScaleOK(D.map(d => d.x), X));
  m[4] = sc ? !!(X && Y) && D.every(d => gmPtOK(d, (S.pts || {})[d.i], X, Y)) : !!Y && D.every(d => gmBarOK(d, (S.bars || {})[d.i], Y));
  return { marks: m, score: m.filter(Boolean).length, X, Y };
}
function gmFixText(spec, k) {
  return [gmIsScatter(spec) ? 'You changed a number, so a scatter graph fits best.' : 'You changed names or groups, so a bar graph fits best.',
    `Write the title as what you changed vs what you measured, like "${spec.exTitle}".`,
    `Label each axis with its name and its unit in brackets, like "${spec.exX}".`,
    'Start each axis at 0, go up in equal steps, and finish just above your biggest number.',
    'Place one point for each row of the table, carefully. Red rings show the points to fix.'][k];
}
/* the graph as SVG. o: { rings, inter (hints), blank (an empty grid for the blank worksheet), print } */
function gmSVG(spec, S, o = {}) {
  const { W, H, L, R, T, B } = GM, sc = gmIsScatter(spec), D = gmData(spec); S = S || gmBlank();
  const X = sc ? gmAxis(S, 'x') : null, Y = gmAxis(S, 'y'), ready = !!Y && (!sc || !!X) && !o.blank;
  const px = v => L + (v - X.min) / (X.max - X.min) * (R - L), py = v => B - (v - Y.min) / (Y.max - Y.min) * (B - T);
  const col = o.print ? BLUE : '#1b7ea6', edge = o.print ? '#0b2f86' : '#0d4a63';
  let g = `<rect width="${W}" height="${H}" fill="#fff"/>`;
  if (o.blank) { for (let x = L; x <= R + 1; x += 25) g += `<line x1="${x}" y1="${T}" x2="${x}" y2="${B}" stroke="#dfe5ec"/>`; for (let y = B; y >= T - 1; y -= 25) g += `<line x1="${L}" y1="${y}" x2="${R}" y2="${y}" stroke="#dfe5ec"/>`; }
  g += `<text x="${(L + R) / 2}" y="28" text-anchor="middle" font-size="20" font-weight="700" fill="${S.title ? '#13212a' : '#8a97a8'}" ${S.title ? '' : 'font-style="italic"'}>${S.title ? esc(S.title) : (o.inter ? 'Graph title' : '')}</text>`;
  if (!ready) { if (!o.blank) g += `<text x="${(L + R) / 2}" y="${(T + B) / 2}" text-anchor="middle" font-size="18" fill="#5a6878">${!S.type ? 'Choose a type of graph to start.' : 'Type your axis numbers to start the graph.'}</text>`; }
  else {
    gmTicks(Y).forEach(v => { g += `<line x1="${L}" y1="${py(v)}" x2="${R}" y2="${py(v)}" stroke="#dfe5ec"/><text x="${L - 8}" y="${py(v) + 5}" text-anchor="end" font-size="15" fill="#13212a">${gmFmt(v)}</text>`; });
    if (sc) gmTicks(X).forEach(v => { g += `<line x1="${px(v)}" y1="${T}" x2="${px(v)}" y2="${B}" stroke="#e6eaf0"/><text x="${px(v)}" y="${B + 20}" text-anchor="middle" font-size="15" fill="#13212a">${gmFmt(v)}</text>`; });
  }
  g += `<path d="M${L} ${T}V${B}H${R}" fill="none" stroke="#13212a" stroke-width="2.5"/>`;
  if (S.xl) g += `<text x="${(L + R) / 2}" y="${H - 10}" text-anchor="middle" font-size="17" font-weight="700" fill="#13212a">${esc(S.xl)}</text>`;
  if (S.yl) g += `<text transform="translate(20 ${(T + B) / 2}) rotate(-90)" text-anchor="middle" font-size="17" font-weight="700" fill="#13212a">${esc(S.yl)}</text>`;
  if (ready && sc) D.forEach(d => { const p = (S.pts || {})[d.i]; if (!p || p.x < X.min - 1e-9 || p.x > X.max + 1e-9 || p.y < Y.min - 1e-9 || p.y > Y.max + 1e-9) return;
    if (o.rings) g += `<circle cx="${px(p.x)}" cy="${py(p.y)}" r="15" fill="none" stroke="${gmPtOK(d, p, X, Y) ? '#2e7d4f' : '#b3301e'}" stroke-width="4" class="gmring ${gmPtOK(d, p, X, Y) ? 'ok' : 'bad'}"/>`;
    g += `<circle class="gmpt" data-i="${d.i}" cx="${px(p.x)}" cy="${py(p.y)}" r="8" fill="${col}" stroke="${edge}" stroke-width="2"/>`; });
  if (ready && !sc) { const sw = (R - L) / D.length;
    D.forEach((d, k) => { const cx = L + sw * (k + .5), v = (S.bars || {})[d.i], lab = String(d.name); g += `<text x="${cx}" y="${B + 20}" text-anchor="middle" font-size="14" font-weight="700" fill="#13212a">${esc(lab.length > 14 ? lab.slice(0, 13) + '…' : lab)}</text>`;
      if (v != null) { const y = py(clamp(v, Y.min, Y.max)); g += `<rect class="gmbar" data-i="${d.i}" x="${cx - sw * .25}" y="${y}" width="${sw * .5}" height="${B - y}" fill="${o.print ? '#9db8f0' : '#8cc3dc'}" stroke="${edge}" stroke-width="2"/>`;
        if (o.rings) g += `<circle cx="${cx}" cy="${y}" r="12" fill="#fff" fill-opacity=".6" stroke="${gmBarOK(d, v, Y) ? '#2e7d4f' : '#b3301e'}" stroke-width="4" class="gmring ${gmBarOK(d, v, Y) ? 'ok' : 'bad'}"/>`; } }); }
  if (o.inter && ready && sc && !Object.keys(S.pts || {}).length) g += `<text x="${(L + R) / 2}" y="${(T + B) / 2}" text-anchor="middle" font-size="16" fill="#8a97a8">Tap a blue point below, then tap here to place it.</text>`;
  return `<svg class="gmsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.alt || 'The graph'}" style="width:100%;max-width:${o.maxW || 560}px;display:block;background:#fff;border-radius:8px">${g}</svg>`;
}
const gmTable = (spec, cls) => `<table class="${cls || 'tbl gm-table'}"><tr>${spec.head.map(x => `<th>${x}</th>`).join('')}</tr>${spec.rows.map(r => `<tr>${r.map(v => `<td>${typeof v === 'number' ? gmFmt(v) : v}</td>`).join('')}</tr>`).join('')}</table>`;
const GM_HOW = `<ul class="gmhowlist"><li><b>Title:</b> what you changed vs what you measured, like <i>Mass vs stretch</i>.</li><li><b>Bottom axis (x):</b> what you changed, with its unit in brackets, like <i>Mass (g)</i>.</li><li><b>Side axis (y):</b> what you measured, with its unit in brackets, like <i>Stretch (cm)</i>.</li><li><b>Scale:</b> start at 0, go up in equal steps, and finish just above your biggest number.</li><li><b>Points:</b> one point for each row of the table, placed carefully.</li><li><b>Type:</b> if you changed a number, use a ${T('scattergraph', 'scatter graph')}. If you changed a name or a group, use a bar graph.</li></ul>`;
const gmHowHTML = open => `<details class="gmhow"${open ? ' open' : ''}><summary>How to make a good graph</summary>${GM_HOW}</details>`;

/* ---------- the maker itself ---------- */
function graphMaker(host, spec, opts = {}) {
  const help = !!opts.help, sc = gmIsScatter(spec), D = gmData(spec);
  const S = Object.assign(gmBlank(), JSON.parse(JSON.stringify(opts.saved || {}))); S.pts = S.pts || {}; S.bars = S.bars || {};
  let locked = !!opts.locked, rings = help || locked, sel = null;
  const root = h('div', { class: 'gm noglos' });
  const inp = (key, label, cls, type) => `<input class="gm-in ${cls || ''}" data-k="${key}" ${type === 'num' ? 'type="text" inputmode="decimal"' : 'type="text" maxlength="80"'} autocomplete="off" aria-label="${label}" value="${esc(S[key])}">`;
  const axrow = (name, k) => `<div class="gm-axrow" data-ax="${k}"><b>${name}</b><label>lowest ${inp(k + 'min', name + ' lowest number', 'gm-num', 'num')}</label><label>highest ${inp(k + 'max', name + ' highest number', 'gm-num', 'num')}</label><label>gap ${inp(k + 'step', name + ' gap', 'gm-num', 'num')}</label></div>`;
  root.innerHTML = `<div class="gm-left"><div class="gm-svg"></div><section class="gm-step"><h4><span class="gm-n">5</span>${sc ? 'Plot the points' : 'Draw the bars'}</h4><p class="gm-note">${sc ? 'Tap a blue chip (or drag it), then tap the graph where the point goes.' : 'Tap a chip, then tap the graph at the height of the bar.'}</p><div class="gm-tray"></div></section><div class="gm-tablebox"><b>My data</b>${gmTable(spec)}</div></div>
    <div class="gm-right"><section class="gm-step"><h4><span class="gm-n">1</span>Type of graph</h4><div class="gm-opts"><button type="button" class="gm-opt" data-type="scatter" aria-pressed="false">Scatter graph</button><button type="button" class="gm-opt" data-type="bar" aria-pressed="false">Bar graph</button></div><p class="gm-note gm-typenote"></p></section>
    <section class="gm-step"><h4><span class="gm-n">2</span>Graph title</h4>${inp('title', 'Graph title')}</section>
    <section class="gm-step"><h4><span class="gm-n">3</span>Axis labels</h4><label class="gm-lab">x-axis label (along the bottom) ${inp('xl', 'x-axis label')}</label><label class="gm-lab">y-axis label (up the side) ${inp('yl', 'y-axis label')}</label></section>
    <section class="gm-step"><h4><span class="gm-n">4</span>Axis numbers</h4>${axrow('y-axis', 'y')}${sc ? axrow('x-axis', 'x') : ''}</section>
    <div class="gm-out" role="status" aria-live="polite"></div></div>`;
  host.appendChild(root);
  const svgBox = $('.gm-svg', root), tray = $('.gm-tray', root), out = $('.gm-out', root);
  const emit = () => { if (opts.onChange) opts.onChange(JSON.parse(JSON.stringify(S)), gmEval(spec, S)); };
  function chipLabel(d) { return sc ? `(${gmFmt(d.x)}, ${gmFmt(d.y)})` : `${d.name}: ${gmFmt(d.y)}`; }
  const placed = d => sc ? !!S.pts[d.i] : S.bars[d.i] != null;
  function draw() {
    svgBox.innerHTML = gmSVG(spec, S, { rings, inter: !locked, alt: 'The graph you are making' });
    $$('.gm-opt', root).forEach(b => b.setAttribute('aria-pressed', S.type === b.dataset.type));
    tray.innerHTML = D.map(d => `<button type="button" class="gm-chip ${placed(d) ? 'placed' : ''} ${sel === d.i ? 'sel' : ''}" data-i="${d.i}" ${locked ? 'disabled' : ''}>${chipLabel(d)}${placed(d) ? ' ✓' : ''}</button>`).join('') + (sel != null && placed(D[sel]) && !locked ? '<button type="button" class="mini gm-rm">Take this point off</button>' : '');
    const e = gmEval(spec, S), tn = $('.gm-typenote', root);
    tn.textContent = S.type && S.type !== (sc ? 'scatter' : 'bar') && rings ? gmFixText(spec, 0) : '';
    out.innerHTML = rings ? `<ul class="gm-marks">${GM_MARKS.map((nm, k) => `<li class="${e.marks[k] ? 'ok' : 'bad'}"><span class="gm-tick" aria-hidden="true">${e.marks[k] ? '✓' : '✗'}</span><span><b>${nm}</b>${!e.marks[k] ? ` <span class="gm-fixtxt">${gmFixText(spec, k)}</span>` : ''}</span></li>`).join('')}</ul>` : '';
    return e;
  }
  const toData = ev => {   // a click on the graph as a point in the data
    const svg = $('.gmsvg', root), r = svg.getBoundingClientRect(), sx = (ev.clientX - r.left) / r.width * GM.W, sy = (ev.clientY - r.top) / r.height * GM.H, X = sc ? gmAxis(S, 'x') : null, Y = gmAxis(S, 'y');
    if (!Y || (sc && !X) || sx < GM.L - 6 || sx > GM.R + 6 || sy < GM.T - 6 || sy > GM.B + 6) return null;
    return { x: sc ? +(X.min + (sx - GM.L) / (GM.R - GM.L) * (X.max - X.min)).toFixed(3) : null, y: +(Y.min + (GM.B - sy) / (GM.B - GM.T) * (Y.max - Y.min)).toFixed(3) };
  };
  function putAt(i, p) { if (locked || !p) return; if (sc) S.pts[i] = { x: p.x, y: p.y }; else S.bars[i] = p.y; sel = null; emit(); draw(); }
  root.addEventListener('click', ev => {
    if (locked) return;
    const t = ev.target.closest('.gm-opt'); if (t) { S.type = t.dataset.type; emit(); draw(); return; }
    if (ev.target.closest('.gm-rm')) { if (sel != null) { delete S.pts[sel]; delete S.bars[sel]; } emit(); draw(); return; }
    const c = ev.target.closest('.gm-chip'); if (c) { if (c.dataset.moved) { delete c.dataset.moved; return; } sel = sel === +c.dataset.i ? null : +c.dataset.i; draw(); return; }
    const pt = ev.target.closest('.gmpt, .gmbar'); if (pt && sel == null) { sel = +pt.dataset.i; draw(); return; }
    if (ev.target.closest('.gmsvg') && sel != null) putAt(sel, toData(ev));
  });
  root.addEventListener('input', ev => { const k = ev.target.dataset && ev.target.dataset.k; if (!k || locked) return; S[k] = ev.target.value; emit(); draw(); });
  /* drag a chip onto the graph (mouse, pen and touch); a tap still just selects it */
  root.addEventListener('pointerdown', ev => {
    const c = ev.target.closest('.gm-chip'); if (!c || locked || ev.button > 0) return; const i = +c.dataset.i, x0 = ev.clientX, y0 = ev.clientY; let ghost = null;
    const mv = e => { if (!ghost && Math.hypot(e.clientX - x0, e.clientY - y0) > 6) { ghost = h('div', { class: 'gm-chip gm-ghost' }, c.textContent); document.body.appendChild(ghost); c.dataset.moved = '1'; } if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; } };
    const up = e => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); if (ghost) { ghost.remove(); const r = $('.gmsvg', root).getBoundingClientRect(); if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) putAt(i, toData(e)); setTimeout(() => { delete c.dataset.moved; }, 0); } };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  });
  draw();
  return { S, root, eval: () => gmEval(spec, S), draw, lock() { locked = true; rings = true; sel = null; $$('input,.gm-opt', root).forEach(x => { x.disabled = true; }); draw(); } };
}
