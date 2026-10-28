/* ===== Observation question types for Chapter 5: freeze (freeze-frame table), spot (tap the moment on a graph), sketch (sketch the graph) =====
   Same QT pattern as 36-qtypes.js. One go each; drafts (an attached moment, a marker, a dot) are saved in the question's state without `done`.
   freeze reads the student's own paused moments (snapshots, see 46-dropzone.js). spot and sketch use fixed data, so the key is fixed. */
Object.assign(QLABEL, { freeze: 'Freeze-frame table', spot: 'Tap the moment', sketch: 'Sketch the graph' });

/* ---------- freeze ----------
   {id, type:'freeze', p, obj:'crate', cols:[['W','Weight (N)'], ['D','Air resistance (N)'], ['R','Resultant (N)'], ['motion','Velocity']],
    rows:[{label, when: snap => bool, whenMsg}], example:[[392, 25, 367, 'speeding up'], ...], after}
   Column keys: W, D (numbers read from the free-body diagram), R (resultant, W − D, a number), big (which force is bigger: pick), motion (pick).
   1 mark per box. The student pauses the drop, presses "Use this moment" on a row (which attaches the snapshot for that moment), then fills in the row. */
const FRZ_STEADY = 0.2, FRZ_EQUAL = 0.03;                   // |a| below this is "steady"; |R| below this fraction of the weight is "equal"
const FRZ_PICK = { big: ['weight', 'air resistance', 'neither, they\'re equal'], motion: ['speeding up', 'steady', 'slowing down'] };
const frzIsNum = k => k === 'W' || k === 'D' || k === 'R';
const frzTol = k => k === 'R' ? 1.5 : 1;                  // newtons (the labels on the diagram are rounded)
function frzTruth(k, s) {                                   // the right reading for a snapshot: a number, or the index of the right choice
  if (k === 'W') return s.W; if (k === 'D') return s.D; if (k === 'R') return s.W - s.D;
  if (k === 'big') { const r = s.W - s.D; return Math.abs(r) < FRZ_EQUAL * s.W ? 2 : r > 0 ? 0 : 1; }
  if (k === 'motion') return s.a > FRZ_STEADY ? 0 : s.a >= -FRZ_STEADY ? 1 : 2;
}
const frzFmt = (k, x) => frzIsNum(k) ? fmtN(x) : FRZ_PICK[k][x];
const fmtN = x => { const a = Math.abs(x); return (a < 1 ? x.toFixed(3) : a < 10 ? x.toFixed(2) : String(Math.round(x))).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
const frzState = (q, s) => (s && s.v && Array.isArray(s.v.rows)) ? s.v.rows : q.rows.map(() => ({ snap: null, vals: {} }));
const frzAtTxt = sn => sn ? `Paused at ${fmt(sn.t, 1)} s · ${fmt(sn.y, 0)} m up · ${dz1(sn.v)} m/s` : 'No moment attached yet';
function frzCell(q, k, head, ri, vals) {
  const val = vals && vals[k] != null ? vals[k] : '';
  return `<label class="frzf"><span>${head}</span>` + (frzIsNum(k)
    ? `<input class="frzin" inputmode="decimal" autocomplete="off" data-ri="${ri}" data-k="${k}" value="${esc(val)}" aria-label="${esc(head)}, ${esc(plain(q.rows[ri].label))}">`
    : `<select class="frzin" data-ri="${ri}" data-k="${k}" aria-label="${esc(head)}, ${esc(plain(q.rows[ri].label))}"><option value="">choose…</option>${FRZ_PICK[k].map((o, j) => `<option value="${j}"${String(val) === String(j) ? ' selected' : ''}>${o}</option>`).join('')}</select>`) + '</label>';
}
function frzMoment(q, ri) {                                  // the snapshot for the paused moment, if it is a fair choice for this row
  const row = q.rows[ri];
  if (!DZ.started || !DZ.paused) return { err: 'Pause the drop first, then press Use this moment.' };
  const L = DZ.lanes[DZ.two ? DZ.edit : 0], sn = dzSnapHere(L);
  if (q.obj && sn.obj !== q.obj) return { err: `This table is about the ${DZ_OBJ[q.obj].noun}. Drop the ${DZ_OBJ[q.obj].noun} and pause it.` };
  if (row.when && !row.when(sn)) return { err: row.whenMsg || 'That moment does not fit this row. Try another.' };
  return { snap: sn };
}
QT.freeze = {
  html(q, s) {
    const st = frzState(q, s);
    return `<div class="frz">${q.rows.map((r, ri) => `<div class="frzrow" data-ri="${ri}"><div class="frzhd"><span class="frzn">${ri + 1}</span><b>${r.label}</b></div><div class="frzgrab"><button type="button" class="ghost sm frzbtn" data-ri="${ri}">Use this moment</button><span class="frzat">${frzAtTxt(st[ri].snap)}</span></div><div class="frzfields">${q.cols.map(([k, head]) => frzCell(q, k, head, ri, st[ri].vals)).join('')}</div></div>`).join('')}</div><button type="button" class="ghost sm qchk" style="align-self:flex-start">Check the table</button>`;
  },
  bind(el, q, api) {
    const save = () => {
      const rows = q.rows.map((_, ri) => { const cur = (frzState(q, api.state())[ri]) || { snap: null, vals: {} }, vals = {}; $$(`.frzin[data-ri="${ri}"]`, el).forEach(i => { vals[i.dataset.k] = i.value; }); return { snap: cur.snap, vals }; });
      const cur = api.state() || {}; cur.v = { rows }; api.setRaw(cur); if (typeof checkStep === 'function') checkStep();
    };
    el.addEventListener('input', e => { if (e.target.closest('.frzin') && !api.locked()) save(); });
    el.addEventListener('change', e => { if (e.target.closest('.frzin') && !api.locked()) save(); });
    el.addEventListener('click', e => {
      const b = e.target.closest('.frzbtn'); if (!b || api.locked()) return;
      const ri = +b.dataset.ri, m = frzMoment(q, ri); if (m.err) { api.say(m.err, 'no'); return; }
      const rows = frzState(q, api.state()).map(r => ({ snap: r.snap, vals: r.vals })); rows[ri].snap = m.snap;
      const cur = api.state() || {}; cur.v = { rows }; api.setRaw(cur);
      $('.frzat', b.parentNode).textContent = frzAtTxt(m.snap); $('.frzrow[data-ri="' + ri + '"]', el).classList.add('has'); api.say(`Moment ${ri + 1} attached: ${frzAtTxt(m.snap).toLowerCase()}. Now fill in the row.`, 'ok');
      if (typeof checkStep === 'function') checkStep();
    });
    $$('.frzrow', el).forEach((r, ri) => { if (frzState(q, api.state())[ri].snap) r.classList.add('has'); });
    $('.qchk', el).addEventListener('click', () => {
      if (api.locked()) return; const rows = frzState(q, api.state());
      const noSnap = rows.findIndex(r => !r.snap); if (noSnap >= 0) { api.say(`Row ${noSnap + 1} needs a moment first. Pause the drop and press Use this moment.`, 'no'); return; }
      let n = 0, good = 0, v = rows.map((r, ri) => { const vals = {}; $$(`.frzin[data-ri="${ri}"]`, el).forEach(i => { vals[i.dataset.k] = i.value; }); return { snap: r.snap, vals }; });
      for (const r of v) for (const [k] of q.cols) if (r.vals[k] === '' || r.vals[k] == null) { api.say('Fill in every box first.', 'no'); return; }
      v.forEach(r => q.cols.forEach(([k]) => { n++; if (frzCellOk(k, r.vals[k], r.snap)) good++; }));
      api.answer({ rows: v }, good === n, (good === n ? (q.ok || 'All correct! Your readings match your paused moments.') : `Whoops! ${n - good} of ${n} boxes weren't right. The right readings from your moments are shown in green.`) + afterTxt(q), { score: good });
    });
  },
  lock(el, q, s) {
    const rows = frzState(q, s);
    $$('.frzin', el).forEach(i => {
      const r = rows[+i.dataset.ri], k = i.dataset.k, ok = r && r.snap && frzCellOk(k, i.value, r.snap);
      i.classList.add(ok ? 'right' : 'wrong'); if (!ok && r && r.snap) corr(i, frzFmt(k, frzTruth(k, r.snap)));
    });
    lockInputs(el);
  },
  show(q, v) {
    if (!v || !Array.isArray(v.rows)) return '';
    return v.rows.map((r, ri) => `${plain(q.rows[ri].label)}${r.snap ? ' (paused at ' + fmt(r.snap.t, 1) + ' s)' : ''}: ` + q.cols.map(([k, head]) => `${plain(head)} ${frzDisp(k, r.vals[k])}`).join(', ')).join('<br>');
  },
  model(q) { return 'Example values (students\' will differ):<br>' + q.rows.map((r, ri) => `${plain(r.label)}: ` + q.cols.map(([k], ci) => frzDisp(k, q.example[ri][ci], true)).join(', ')).join('<br>'); }
};
function frzCellOk(k, raw, snap) {
  if (raw === '' || raw == null) return false;
  if (!frzIsNum(k)) return +raw === frzTruth(k, snap);
  const n = parseNum(raw); return !isNaN(n) && near(n, frzTruth(k, snap), frzTol(k));
}
const frzDisp = (k, x, ex) => x == null || x === '' ? '–' : frzIsNum(k) ? (ex ? x : esc(x)) : (typeof x === 'number' ? FRZ_PICK[k][x] : (FRZ_PICK[k][+x] || esc(x)));

/* ---------- spot: tap the moment on a graph ----------
   {id, type:'spot', p, graph: () => ({lines:[{pts:[[t,v],...]}], tMax, vMax, vStep, tStep}), targets:[{ask, t:[lo,hi], why}], ok}
   Each target has its own numbered marker. Tap the graph (or use the arrow keys) to place or move the active marker; Check when every marker is down. 1 mark per target. */
const SPOT_COL = ['#c94a34', '#7446b0', '#11806f'];
const spotOpts = (q, extra) => Object.assign({ alt: 'A velocity–time graph. Tap it to place a marker.' }, q.graph(), extra || {});
const spotSt = (q, s) => (s && Array.isArray(s.v) ? s.v : q.targets.map(() => null));
function spotDraw(svg, q, v, locked) {                      // numbered markers (and the green bands once locked), drawn into the graph
  const g = $('.tapg', svg), x0 = +svg.dataset.x0, x1 = +svg.dataset.x1, y0 = +svg.dataset.y0, y1 = +svg.dataset.y1, tMax = +svg.dataset.tmax, X = t => x0 + t / tMax * (x1 - x0);
  let out = '';
  if (locked) q.targets.forEach(t => { out += `<rect x="${X(t.t[0]).toFixed(1)}" y="${y0}" width="${(X(t.t[1]) - X(t.t[0])).toFixed(1)}" height="${y1 - y0}" fill="#1c9a5a" fill-opacity=".22" stroke="#1c9a5a" stroke-dasharray="4 3"/>`; });
  v.forEach((t, i) => {
    if (t == null) return; const ok = locked && t >= q.targets[i].t[0] - 1e-9 && t <= q.targets[i].t[1] + 1e-9, col = locked ? (ok ? '#1c9a5a' : '#c94a34') : SPOT_COL[i % 3], x = X(t).toFixed(1);
    out += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${col}" stroke-width="2" stroke-dasharray="5 3"/><circle cx="${x}" cy="${y0 + 11}" r="9" fill="${col}"/><text x="${x}" y="${y0 + 15}" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${i + 1}</text>`;
  });
  g.innerHTML = out;
}
QT.spot = {
  html(q, s) {
    const many = q.targets.length > 1, v = spotSt(q, s);
    return `${many ? `<div class="spots" role="group" aria-label="Choose which moment to mark">${q.targets.map((t, i) => `<button type="button" class="spotb${i === 0 ? ' on' : ''}" data-ti="${i}" style="--c:${SPOT_COL[i % 3]}"><span class="spn">${i + 1}</span><span>${t.ask}</span></button>`).join('')}</div>` : (q.targets[0].ask ? `<div class="spotask">${q.targets[0].ask}</div>` : '')}${vtSVG(q.graph().lines, spotOpts(q, { tap: true }))}<div class="spotread" aria-live="polite">${spotRead(q, v)}</div><button type="button" class="ghost sm qchk" style="align-self:flex-start">Check</button>`;
  },
  bind(el, q, api) {
    const svg = $('svg', el), v = spotSt(q, api.state()); let act = 0;
    const W = +svg.dataset.w, x0 = +svg.dataset.x0, x1 = +svg.dataset.x1, tMax = +svg.dataset.tmax;
    const redraw = () => { spotDraw(svg, q, v, false); $('.spotread', el).textContent = spotRead(q, v); $$('.spotb', el).forEach(b => { b.classList.toggle('on', +b.dataset.ti === act); b.classList.toggle('set', v[+b.dataset.ti] != null); }); };
    const put = t => { t = Math.max(0, Math.min(tMax, Math.round(t * 10) / 10)); v[act] = t; const cur = api.state() || {}; cur.v = v.slice(); api.setRaw(cur); redraw(); };
    $$('.spotb', el).forEach(b => b.addEventListener('click', () => { if (api.locked()) return; act = +b.dataset.ti; redraw(); }));
    $('.tapzone', svg).addEventListener('click', e => { if (api.locked()) return; const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W; put((x - x0) / (x1 - x0) * tMax); });
    svg.setAttribute('tabindex', '0'); svg.setAttribute('role', 'slider'); svg.setAttribute('aria-label', 'Graph. Tap to place the marker, or press the left and right arrow keys to move it.');
    svg.addEventListener('keydown', e => { if (api.locked() || !/^Arrow(Left|Right)$/.test(e.key)) return; e.preventDefault(); put((v[act] == null ? tMax / 2 : v[act]) + (e.key === 'ArrowLeft' ? -1 : 1) * tMax / 40); });
    redraw();
    $('.qchk', el).addEventListener('click', () => {
      if (api.locked()) return; const miss = v.findIndex(t => t == null);
      if (miss >= 0) { act = miss; redraw(); api.say(q.targets.length > 1 ? `Tap the graph to place marker ${miss + 1} first.` : 'Tap the graph to place your marker first.', 'no'); return; }
      const oks = v.map((t, i) => t >= q.targets[i].t[0] - 1e-9 && t <= q.targets[i].t[1] + 1e-9), n = oks.filter(Boolean).length, bad = oks.map((o, i) => o ? -1 : i).filter(i => i >= 0);
      api.answer(v.slice(), n === q.targets.length, (n === q.targets.length ? (q.ok || 'Spot on!') : `Whoops! ${bad.length === 1 && q.targets.length === 1 ? 'That' : bad.length === 1 ? 'Marker ' + (bad[0] + 1) : bad.length + ' markers'} wasn't in the right place. The green band${q.targets.length > 1 ? 's show' : ' shows'} where ${q.targets.length > 1 ? 'they were' : 'it was'}. ${bad.map(i => q.targets[i].why || '').join(' ')}`).replace(/\s+/g, ' ').trim() + afterTxt(q), { score: n });
    });
  },
  lock(el, q, s) { const svg = $('svg', el); spotDraw(svg, q, spotSt(q, s), true); $$('.spotb', el).forEach(b => { b.disabled = true; }); svg.removeAttribute('tabindex'); lockInputs(el); },
  show(q, v) { return Array.isArray(v) ? v.map((t, i) => `Marker ${i + 1}: ${t == null ? '–' : fmt(t, 1) + ' s'}`).join('<br>') : ''; },
  model(q) { return q.targets.map((t, i) => `Marker ${i + 1}: between ${fmt(t.t[0], 1)} and ${fmt(t.t[1], 1)} s`).join('<br>'); }
};
const spotRead = (q, v) => v.every(t => t == null) ? '' : v.map((t, i) => t == null ? null : (q.targets.length > 1 ? `Marker ${i + 1}: ` : 'Your marker: ') + fmt(t, 1) + ' s').filter(Boolean).join(' · ');

/* ---------- sketch: set a dot in every time column ----------
   {id, type:'sketch', p, xLabel, yLabel, cols:10, levels:10, xTicks:['0','1',...] (one per column, optional), yMax: 16 (optional numbers on the y-axis),
    marks:[{col, label}], model:[levels...], checks:[[label, p => bool]], real: () => levels[] or null, look}
   Tap or drag across the grid to set the dots (a dot per column, whole levels). Arrow keys: left/right change column, up/down move the dot. 1 mark per check. */
function sketchInner(q, o) {
  o = o || {}; const W = 420, H = 270, x0 = 62, x1 = W - 12, y0 = 22, y1 = H - 56, n = q.cols, L = q.levels, cw = (x1 - x0) / n, cx = i => x0 + (i + .5) * cw, Y = l => y1 - l / L * (y1 - y0);
  let g = '';
  for (let l = 0; l <= L; l++) { g += `<line x1="${x0}" y1="${Y(l).toFixed(1)}" x2="${x1}" y2="${Y(l).toFixed(1)}" stroke="#d5dee2" stroke-width="1"/>`; if (q.yMax != null && (l % 2 === 0 || L <= 5)) g += `<text x="${x0 - 6}" y="${(Y(l) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#566a74">${+(q.yMax * l / L).toFixed(1)}</text>`; }
  if (q.yMax == null) g += `<text x="${x0 - 6}" y="${(Y(0) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#566a74">0</text>`;
  for (let i = 0; i < n; i++) { g += `<line x1="${cx(i).toFixed(1)}" y1="${y0}" x2="${cx(i).toFixed(1)}" y2="${y1}" stroke="#e6edf0" stroke-width="1"/>`; if (q.xTicks) g += `<text x="${cx(i).toFixed(1)}" y="${y1 + 14}" text-anchor="middle" font-size="11" fill="#566a74">${q.xTicks[i]}</text>`; }
  g += `<path d="M${x0} ${y0 - 4}V${y1}H${x1}" fill="none" stroke="#13212a" stroke-width="1.5"/>`;
  g += `<text x="${(x0 + x1) / 2}" y="${H - 8}" text-anchor="middle" font-size="13" font-weight="800" fill="#13212a">${q.xLabel || 'Time'}</text><text transform="translate(14 ${(y0 + y1) / 2}) rotate(-90)" text-anchor="middle" font-size="13" font-weight="800" fill="#13212a">${q.yLabel || 'Velocity'}</text>`;
  (q.marks || []).forEach(m => { g += `<line x1="${cx(m.col).toFixed(1)}" y1="${y0 - 2}" x2="${cx(m.col).toFixed(1)}" y2="${y1}" stroke="#c94a34" stroke-width="2" stroke-dasharray="6 4"/><text x="${cx(m.col).toFixed(1)}" y="${y0 - 8}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#c94a34">${m.label}</text>`; });
  const line = (p, col, dash, r, lab) => { const pts = p.map((l, i) => l == null ? null : [cx(i), Y(l)]).filter(Boolean); if (!pts.length) return ''; return (pts.length > 1 ? `<polyline points="${pts.map(a => a[0].toFixed(1) + ',' + a[1].toFixed(1)).join(' ')}" fill="none" stroke="${col}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"${dash ? ' stroke-dasharray="7 5"' : ''}/>` : '') + pts.map(a => `<circle cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.5"/>`).join(''); };
  if (o.model) g += line(o.model, '#1c9a5a', true, 4.5);
  if (o.real) g += line(o.real, '#e08a1e', true, 3.5);
  const dots = o.dots || [];
  g += line(dots, o.col || '#1f5f8b', false, 6);
  if (o.cur != null) g += `<rect x="${(cx(o.cur) - cw / 2).toFixed(1)}" y="${y0}" width="${cw.toFixed(1)}" height="${y1 - y0}" fill="none" stroke="#1f5f8b" stroke-width="2" rx="4"/>`;
  if (o.legend) g += `<g font-size="11.5" font-weight="800"><circle cx="${x0 + 12}" cy="${H - 26}" r="4.5" fill="#1f5f8b"/><text x="${x0 + 22}" y="${H - 22}" fill="#1f5f8b">Your sketch</text>${o.model ? `<line x1="${x0 + 108}" y1="${H - 26}" x2="${x0 + 128}" y2="${H - 26}" stroke="#1c9a5a" stroke-width="3" stroke-dasharray="7 5"/><text x="${x0 + 134}" y="${H - 22}" fill="#1c9a5a">What it should be</text>` : ''}${o.real ? `<line x1="${x0 + 250}" y1="${H - 26}" x2="${x0 + 270}" y2="${H - 26}" stroke="#e08a1e" stroke-width="3" stroke-dasharray="7 5"/><text x="${x0 + 276}" y="${H - 22}" fill="#e08a1e">Your run</text>` : ''}</g>`;
  return g;
}
function sketchSVG(q, o) {
  o = o || {}; const W = 420, H = 270, x0 = 62, x1 = W - 12, y0 = 22, y1 = H - 56;
  return `<svg viewBox="0 0 ${W} ${H}" class="skg" role="img" aria-label="${esc(o.alt || 'A graph grid: put a dot in each time column')}" data-x0="${x0}" data-x1="${x1}" data-y0="${y0}" data-y1="${y1}" data-w="${W}" data-h="${H}" style="width:100%;max-width:440px;display:block;background:#fff;border-radius:8px;touch-action:none">${sketchInner(q, o)}</svg>`;
}
/* make a sketch grid live inside `host`: get()/set() read and save the dots (an array of levels, null where not set yet).
   The svg is built once; drawing only swaps its contents, so a drag keeps working. */
function sketchBind(host, q, get, set, locked) {
  host.innerHTML = sketchSVG(q, { dots: get(), alt: 'Sketch grid. Tap a column, or drag across the grid, to set the dots.' }) + '<div class="sksr" aria-live="polite"></div>';
  const svg = $('svg.skg', host), say = $('.sksr', host); let cur = 0, down = false, focus = false;
  svg.setAttribute('tabindex', '0'); svg.setAttribute('role', 'application'); svg.setAttribute('aria-label', 'Sketch grid. Left and right arrow keys change column, up and down arrow keys move the dot.');
  const draw = () => { svg.innerHTML = sketchInner(q, { dots: get(), cur: focus ? cur : null }); const v = get()[cur]; say.textContent = focus ? `Column ${cur + 1}: ${v == null ? 'no dot yet' : 'level ' + v}` : ''; };
  const pos = e => { const r = svg.getBoundingClientRect(), W = +svg.dataset.w, H = +svg.dataset.h, x0 = +svg.dataset.x0, x1 = +svg.dataset.x1, y0 = +svg.dataset.y0, y1 = +svg.dataset.y1, x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
    return { col: Math.max(0, Math.min(q.cols - 1, Math.floor((x - x0) / ((x1 - x0) / q.cols)))), lvl: Math.max(0, Math.min(q.levels, Math.round((y1 - y) / (y1 - y0) * q.levels))) }; };
  const setDot = (c, l) => { const p = get().slice(); p[c] = l; set(p); cur = c; draw(); };
  svg.addEventListener('pointerdown', e => { if (locked()) return; e.preventDefault(); down = true; try { svg.setPointerCapture(e.pointerId); } catch (x) { } svg.focus(); const a = pos(e); setDot(a.col, a.lvl); });
  svg.addEventListener('pointermove', e => { if (!down || locked()) return; const a = pos(e); if (get()[a.col] !== a.lvl) setDot(a.col, a.lvl); });
  svg.addEventListener('pointerup', () => { down = false; }); svg.addEventListener('pointercancel', () => { down = false; });
  svg.addEventListener('focus', () => { focus = true; draw(); }); svg.addEventListener('blur', () => { focus = false; draw(); });
  svg.addEventListener('keydown', e => {
    if (locked()) return;
    if (e.key === 'ArrowLeft') cur = Math.max(0, cur - 1); else if (e.key === 'ArrowRight') cur = Math.min(q.cols - 1, cur + 1);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { const l = get()[cur] == null ? (e.key === 'ArrowUp' ? 0 : 1) : get()[cur]; setDot(cur, Math.max(0, Math.min(q.levels, l + (e.key === 'ArrowUp' ? 1 : -1)))); e.preventDefault(); return; }
    else return;
    e.preventDefault(); draw();
  });
  draw();
}
const skDots = (q, s) => (s && Array.isArray(s.v) ? s.v : q.cols ? Array.from({ length: q.cols }, () => null) : []);
const skChecks = (q, p) => q.checks.map(([label, f]) => { let ok = false; try { ok = !!f(p); } catch (e) { } return [label, ok]; });
const skChips = (q, p) => `<div class="skchips">${skChecks(q, p).map(([l, ok]) => `<span class="skchip ${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'} ${l}</span>`).join('')}</div>`;
QT.sketch = {
  html(q, s) { return `<div class="skhost"></div><div class="skhint">Tap a column to set its dot, or drag across the grid to draw. With a keyboard, use the arrow keys.</div><button type="button" class="ghost sm qchk" style="align-self:flex-start">Check my sketch</button>`; },
  bind(el, q, api) {
    const host = $('.skhost', el), get = () => skDots(q, api.state()), set = p => { const cur = api.state() || {}; cur.v = p; api.setRaw(cur); };
    if (api.locked()) { return; }
    sketchBind(host, q, get, set, () => api.locked());
    $('.qchk', el).addEventListener('click', () => {
      if (api.locked()) return; const p = get();
      if (p.some(x => x == null)) { api.say(`Set a dot in every column first (${p.filter(x => x == null).length} to go).`, 'no'); return; }
      const res = skChecks(q, p), n = res.filter(r => r[1]).length;
      api.answer(p.slice(), n === res.length, n === res.length ? (q.ok || 'Great sketch! Every check is right.') + afterTxt(q) : `Not quite: ${n} of ${res.length} checks are right. The green dashed line shows what the graph should look like.` + afterTxt(q), { score: n });
    });
  },
  lock(el, q, s) {
    const p = skDots(q, s), host = $('.skhost', el), real = q.real ? q.real() : null;
    host.innerHTML = sketchSVG(q, { dots: p, model: q.model, real, legend: true, alt: 'Your sketch with the right graph drawn over it' }) + skChips(q, p);
    lockInputs(el); $$('.skhint', el).forEach(x => x.hidden = true);
  },
  show(q, v) { return Array.isArray(v) ? sketchSVG(q, { dots: v, alt: 'Your sketch' }) : ''; },
  model(q) { return sketchSVG(q, { dots: q.model, col: '#1c9a5a', alt: 'The right graph' }); }
};

/* ---------- the sketch prediction in a "Predict first" box ----------
   predict: { kind:'sketch', q, cols, levels, xLabel, yLabel, marks, then, span:{t, v} } → saved as { sk:[levels] } under the step's .pred; predOf() is non-null once locked in. */
const predSketch = () => { const p = predOf(); return p && Array.isArray(p.sk) ? p.sk : null; };
function predSketchHTML(P, v) {
  if (v) return `<div class="predict done"><span class="lbl">Your prediction</span>${sketchSVG(P, { dots: v, alt: 'Your predicted sketch' })}<p class="scaleNote">${P.then || 'Now test it in the arena and see how close you were!'}</p></div>`;
  return `<div class="predict"><span class="lbl">Predict first</span><p class="gl">${P.q}</p><div class="skhost" data-psk></div><div class="skhint">Tap a column to set its dot, or drag across the grid to draw. With a keyboard, use the arrow keys.</div><button type="button" class="mini" id="predSkLock">Lock in my prediction</button><div class="fb" id="predSkFb"></div></div>`;
}
function predSketchBind(P) {
  const host = $('#rail [data-psk]'); if (!host) return;
  const key = stepKey(CH.id, GI) + '.predDraft', get = () => dbGet(key, null) || Array.from({ length: P.cols }, () => null), set = p => dbSet(key, p);
  sketchBind(host, P, get, set, () => false);
  $('#predSkLock').addEventListener('click', () => {
    const p = get(); if (p.some(x => x == null)) { const f = $('#predSkFb'); f.className = 'fb no'; f.textContent = `Set a dot in every column first (${p.filter(x => x == null).length} to go).`; return; }
    dbSet(stepKey(CH.id, GI) + '.pred', { sk: p.slice() }); renderRail(); checkStep();
  });
}

/* how many rows of a freeze question (in the current Learn step) have a moment attached: used by "Do this" tasks */
const frzCount = qid => { const s = dbGet(stepKey(CH.id, GI) + '.' + qid, null); return s && s.v && Array.isArray(s.v.rows) ? s.v.rows.filter(r => r.snap).length : 0; };
