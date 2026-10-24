/* ===== Free-body diagram builder: drag arrows from the centre, label them, auto-check =====
   Scenario: { id, obj:'crate'|'book'|'ball', label, brief, forces:[{type,dir,value}], toScale, scale } */
const FTYPES = {
  weight: { name: 'Weight', col: 'vert' }, normal: { name: 'Normal force', col: 'vert' }, friction: { name: 'Friction', col: 'fric' },
  pull: { name: 'Pull (tension)', col: 'right' }, push: { name: 'Push', col: 'ink' }, airres: { name: 'Air resistance', col: 'res' },
  drive: { name: 'Driving force', col: 'hazard' }, thrust: { name: 'Thrust', col: 'hazard' }, upthrust: { name: 'Upthrust', col: 'accent' }
};
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const DIRWORD = { up: 'up', down: 'down', left: 'to the left', right: 'to the right' };
const FHINT = {
  weight: 'Every object on Earth has weight. Which way does gravity pull?',
  normal: 'Think about what the floor (or table) does. It pushes back on the object.',
  friction: 'Is the surface rough? Friction acts against the way the object is moving, or being pulled.',
  pull: 'Check the ropes. Is anyone pulling on the object?',
  push: 'Is anyone pushing the object?',
  airres: 'Is the object moving through air quickly enough for air resistance to matter?'
};
const BW = 520, BH = 400, BCX = 260, BCY = 200, GRID = 26;
const svgNS = 'http://www.w3.org/2000/svg';
function objSVG(o, label) {
  if (o === 'book') return `<rect x="${BCX - 52}" y="${BCY - 18}" width="104" height="36" rx="5" fill="#3f78b5"/><rect x="${BCX - 46}" y="${BCY - 12}" width="92" height="7" rx="2" fill="#fffaf2" opacity=".85"/><rect x="${BCX - 46}" y="${BCY + 3}" width="92" height="3" rx="1.5" fill="#fffaf2" opacity=".6"/>`;
  if (o === 'ball') return `<circle cx="${BCX}" cy="${BCY}" r="34" fill="#e8735c"/><path d="M${BCX - 34} ${BCY} q34 -16 68 0" stroke="#fffaf2" stroke-width="4" fill="none" opacity=".7"/>`;
  return `<rect x="${BCX - 40}" y="${BCY - 40}" width="80" height="80" rx="5" fill="#c99a5b" stroke="#7a5426" stroke-width="3"/><path d="M${BCX - 34} ${BCY - 34}L${BCX + 34} ${BCY + 34}M${BCX + 34} ${BCY - 34}L${BCX - 34} ${BCY + 34}" stroke="#7a5426" stroke-width="2.5"/>` +
    (label ? `<rect x="${BCX + 44}" y="${BCY + 22}" width="58" height="20" rx="4" fill="#fffaf2" stroke="#7a5426"/><text x="${BCX + 73}" y="${BCY + 36.5}" text-anchor="middle" font-size="13" font-weight="700" style="font-family:var(--f-num)" fill="#13212a">${esc(label)}</text>` : '');
}
function arrowSVG(a, col, studentBlue) {
  const [dx, dy] = DIRS[a.dir], px = -dy * (a.off || 0), py = dx * (a.off || 0);
  const x1 = a.x + px, y1 = a.y + py, x2 = x1 + dx * a.len, y2 = y1 + dy * a.len, hs = 13;
  const c = studentBlue ? '#1a56db' : col;
  const lx = x2 + dx * 18 + (dy ? 10 * (a.off >= 0 ? 1 : -1) : 0), ly = y2 + dy * 16 + (dx ? -12 : 0);
  const t = a.type ? `${FTYPES[a.type].name.replace(' (tension)', '')} ${a.value !== '' && a.value != null ? fmt(+a.value, 1) + ' N' : '? N'}` : 'Tap to label';
  const anchor = dx > 0 ? 'start' : dx < 0 ? 'end' : 'middle';
  return `<g class="farr" data-id="${a.id}"><line x1="${x1}" y1="${y1}" x2="${x2 - dx * hs * .7}" y2="${y2 - dy * hs * .7}" stroke="${c}" stroke-width="6" stroke-linecap="round" ${a.type ? '' : 'stroke-dasharray="8 6"'}/>
    <polygon points="${x2},${y2} ${x2 - dx * hs - dy * hs * .55},${y2 - dy * hs + dx * hs * .55} ${x2 - dx * hs + dy * hs * .55},${y2 - dy * hs - dx * hs * .55}" fill="${c}"/>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="26" class="fhit"/>
    <circle cx="${x2}" cy="${y2}" r="11" fill="transparent" class="ftip"/>
    <text x="${dx ? x2 + dx * 8 : x2 + 10}" y="${dy ? y2 + dy * 18 : y2 - 12}" text-anchor="${dx ? anchor : 'start'}" font-size="14" font-weight="700" style="font-family:var(--f-num)" fill="${c}" paint-order="stroke" stroke="#fffaf2" stroke-width="4">${esc(t)}</text></g>`;
}
const FBDB = {
  /* compute the offsets so arrows that share a direction sit side by side */
  layout(arrows) { const byDir = {}; arrows.forEach(a => (byDir[a.dir] = byDir[a.dir] || []).push(a)); Object.values(byDir).forEach(list => list.forEach((a, i) => a.off = list.length === 1 ? 0 : (i - (list.length - 1) / 2) * 14)); return arrows; },
  svg(scen, arrows, opts = {}) {
    const gridOn = true, blue = opts.blue;
    let g = '';
    if (gridOn) { for (let x = BCX % GRID; x <= BW; x += GRID) g += `<line x1="${x}" y1="0" x2="${x}" y2="${BH}" stroke="#dfe7ea" stroke-width="1"/>`; for (let y = BCY % GRID; y <= BH; y += GRID) g += `<line x1="0" y1="${y}" x2="${BW}" y2="${y}" stroke="#dfe7ea" stroke-width="1"/>`; }
    const colOf = t => t ? (C[FTYPES[t].col] || '#13212a') : '#7a8a92';
    const list = FBDB.layout(arrows.map(a => ({ ...a })));
    return `<svg viewBox="0 0 ${BW} ${BH}" xmlns="${svgNS}" role="img" aria-label="Free-body diagram of the ${esc(scen.label || scen.obj)}"><rect width="${BW}" height="${BH}" fill="#fffaf2"/>${g}
      ${objSVG(scen.obj, scen.label)}
      ${opts.noDot ? '' : `<circle cx="${BCX}" cy="${BCY}" r="7" fill="#e3a51c" stroke="#13212a" stroke-width="2"/>`}
      ${list.map(a => arrowSVG(a, colOf(a.type), blue)).join('')}
      ${scen.toScale ? `<text x="10" y="${BH - 10}" font-size="13" style="font-family:var(--f-num)" fill="#566a74">1 square = ${scen.scale} N</text>` : ''}</svg>`;
  },
  /* model diagram for answer keys */
  model(scen) { let len = scen.forces.map(f => f.value); const mx = Math.max(...len); return scen.forces.map((f, i) => ({ id: 'm' + i, dir: f.dir, type: f.type, value: f.value, x: BCX, y: BCY, len: scen.toScale ? f.value / scen.scale * GRID : 40 + 120 * f.value / mx })); },
  check(scen, arrows) {
    const res = { present: true, extra: false, dir: true, values: true, centre: true, lengths: true, missing: [], extras: [], wrongDir: [], wrongVal: [], unlabelled: arrows.filter(a => !a.type).length };
    const types = new Set(scen.forces.map(f => f.type));
    for (const t of types) { const E = scen.forces.filter(f => f.type === t), Sx = arrows.filter(a => a.type === t);
      if (Sx.length < E.length) { res.present = false; res.missing.push(...E.slice(Sx.length).map(() => t)); }
      if (Sx.length > E.length) { res.extra = true; res.extras.push(t); }
      const ed = E.map(f => f.dir).sort().join(), sd = Sx.map(a => a.dir).sort().join(); if (Sx.length >= E.length && ed !== sd) { res.dir = false; res.wrongDir.push(t); }
    }
    arrows.forEach(a => { if (a.type && !types.has(a.type)) { res.extra = true; res.extras.push(a.type); } });
    if (res.unlabelled) res.extra = true;
    // values and lengths on matched pairs
    const used = new Set(), pairs = [];
    scen.forces.forEach(f => { const m = arrows.find(a => !used.has(a.id) && a.type === f.type && a.dir === f.dir); if (m) { used.add(m.id); pairs.push([f, m]); } });
    pairs.forEach(([f, a]) => { const v = parseNum(a.value); if (isNaN(v) || !near(v, f.value, Math.max(0.6, f.value * 0.01))) { res.values = false; res.wrongVal.push(f); } });
    if (pairs.length < scen.forces.length) res.values = false;
    arrows.forEach(a => { if (Math.hypot(a.x - BCX, a.y - BCY) > 12) res.centre = false; });
    for (let i = 0; i < pairs.length; i++) for (let j = 0; j < pairs.length; j++) { if (i === j) continue; const [fa, aa] = pairs[i], [fb, ab] = pairs[j];
      if (Math.abs(fa.value - fb.value) <= Math.max(fa.value, fb.value) * 0.03) { if (Math.abs(aa.len - ab.len) > Math.max(aa.len, ab.len) * 0.18) res.lengths = false; }
      else if (fa.value > fb.value * 1.12 && aa.len <= ab.len) res.lengths = false; }
    if (scen.toScale) pairs.forEach(([f, a]) => { const want = f.value / scen.scale * GRID; if (Math.abs(a.len - want) > Math.max(10, want * 0.15)) res.lengths = false; });
    if (pairs.length < 2 && !scen.toScale) res.lengths = res.present && !res.extra && res.dir;
    res.chips = [['present', 'All the forces are there', res.present], ['extra', 'No extra forces', !res.extra], ['dir', 'Arrows point the right way', res.dir], ['values', 'Numbers are correct', res.values], ['centre', 'Arrows start at the centre', res.centre], ['lengths', scen.toScale ? 'Arrows drawn to scale' : 'Bigger forces have longer arrows', res.lengths]];
    res.ok = res.chips.every(c => c[2]); res.score = res.chips.filter(c => c[2]).length;
    return res;
  },
  hint(scen, res, level) {
    const L = Math.min(level, 3);
    if (!res.centre) return 'Every arrow must start at the orange centre dot of the object. Drag from the dot outwards.';
    if (res.unlabelled) return 'One of your arrows has no label yet. Tap it and choose which force it is.';
    if (!res.present) { const t = res.missing[0]; const f = scen.forces.find(x => x.type === t);
      return L === 1 ? `${res.missing.length === 1 ? 'One force is' : res.missing.length + ' forces are'} missing.` : L === 2 ? (FHINT[t] || 'Think about everything that touches the object, and gravity.') : `There should be a ${FTYPES[t].name.toLowerCase()} arrow pointing ${DIRWORD[f.dir]}, ${fmt(f.value, 1)} N.`; }
    if (res.extra) { const t = res.extras[0];
      return L === 1 ? 'There is a force on your diagram that isn\'t acting on this object.' : L === 2 ? `Look again at the ${FTYPES[t].name.toLowerCase()} arrow. Is that force really acting here?` : `Remove the ${FTYPES[t].name.toLowerCase()} arrow: tap it, then press Remove.`; }
    if (!res.dir) { const t = res.wrongDir[0], f = scen.forces.find(x => x.type === t);
      return L === 1 ? 'One arrow points the wrong way.' : L === 2 ? `Check the ${FTYPES[t].name.toLowerCase()} arrow. ${FHINT[t] || ''}` : `The ${FTYPES[t].name.toLowerCase()} arrow should point ${DIRWORD[f.dir]}.`; }
    if (!res.values) { const f = res.wrongVal[0] || scen.forces[0];
      return L === 1 ? 'Check your numbers.' : L === 2 ? (f.type === 'weight' || f.type === 'normal' ? 'Use the calculator: weight = mass × 9.8. On a flat floor, the normal force is the same size as the weight.' : 'Look back at the brief for the size of each force.') : `The ${FTYPES[f.type].name.toLowerCase()} should be ${fmt(f.value, 1)} N.`; }
    if (!res.lengths) return scen.toScale ? `Use the grid: 1 square = ${scen.scale} N. Drag each arrow tip so it is the right number of squares long.` : 'Make the arrow lengths match the sizes: equal forces get equal arrows, and a bigger force gets a longer arrow. Drag an arrow\'s tip to change its length.';
    return '';
  },
  mount(host, scen, opts = {}) {
    let st = opts.state ? JSON.parse(JSON.stringify(opts.state)) : { arrows: [], tries: 0, passed: false, best: 0 };
    let nid = st.arrows.reduce((m, a) => Math.max(m, +String(a.id).replace(/\D/g, '') || 0), 0) + 1;
    host.innerHTML = `<div class="fbdb"><div class="board" tabindex="-1"></div><div class="side"><div class="brief gl">${scen.brief || ''}</div>
      <p class="howto">Drag from the orange centre dot to draw an arrow. Let go, then choose the force and type its size. Tap an arrow to change it, or drag its tip to make it longer or shorter.</p>
      <div class="chipsrow fchips"></div><div class="fb ffb"></div>
      <div class="row"><button type="button" class="go fcheck">Check my diagram</button><button type="button" class="mini fundo">↶ Undo</button><button type="button" class="mini fclear">Clear</button></div></div></div>`;
    const board = $('.board', host), chips = $('.fchips', host), ffb = $('.ffb', host); let hist = [];
    const save = () => { if (opts.onChange) opts.onChange(st); };
    const draw = () => { board.innerHTML = FBDB.svg(scen, st.arrows); drawChips(st.lastRes); };
    const drawChips = (res) => { chips.innerHTML = res ? res.chips.map(([, l, ok]) => `<span class="ck ${ok ? 'on' : ''}">${ok ? '✓ ' : ''}${l}</span>`).join('') : FBDB.check(scen, []).chips.map(([, l]) => `<span class="ck">${l}</span>`).join(''); };
    const toSvg = e => { const r = board.querySelector('svg').getBoundingClientRect(); return { x: (e.clientX - r.left) * BW / r.width, y: (e.clientY - r.top) * BH / r.height }; };
    const snap = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    let dr = null, menu = null;
    const closeMenu = () => { if (menu) { menu.remove(); menu = null; } };
    const openMenu = (a) => {
      closeMenu(); const r = board.getBoundingClientRect(), sv = board.querySelector('svg').getBoundingClientRect(), k = sv.width / BW;
      const [dx, dy] = DIRS[a.dir], tipx = (a.x + dx * a.len) * k, tipy = (a.y + dy * a.len) * k;
      menu = h('div', { class: 'amenu', role: 'dialog', 'aria-label': 'Label this arrow' });
      menu.innerHTML = `<button type="button" class="x" aria-label="Close">✕</button><label>Which force is this?<select class="mt"><option value="">Choose…</option>${Object.entries(FTYPES).filter(([k2]) => !scen.types || scen.types.includes(k2)).map(([k2, v]) => `<option value="${k2}" ${a.type === k2 ? 'selected' : ''}>${v.name}</option>`).join('')}</select></label>
        <label>Size<div class="row" style="flex-wrap:nowrap"><input class="mv" inputmode="decimal" autocomplete="off" value="${a.value != null ? esc(a.value) : ''}" aria-label="Size of the force in newtons"><b>N</b></div></label>
        <div class="row"><button type="button" class="mini mrem">🗑 Remove</button><button type="button" class="go sm mok">Done</button></div>`;
      board.appendChild(menu);
      const mw = 220, left = clamp(tipx + (dx < 0 ? -mw - 10 : 10), 4, r.width - mw - 4), top = clamp(tipy + (dy < 0 ? -10 : 10) - 40, 4, Math.max(4, r.height - menu.offsetHeight - 4));
      menu.style.left = left + 'px'; menu.style.top = top + 'px';
      const commit = () => { hist.push(JSON.stringify(st.arrows)); a.type = $('.mt', menu).value; a.value = $('.mv', menu).value.trim(); closeMenu(); draw(); save(); };
      $('.mok', menu).addEventListener('click', commit); $('.mv', menu).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
      $('.mt', menu).addEventListener('change', () => { if (!$('.mv', menu).value) $('.mv', menu).focus(); });
      $('.mrem', menu).addEventListener('click', () => { hist.push(JSON.stringify(st.arrows)); st.arrows = st.arrows.filter(x => x !== a); closeMenu(); draw(); save(); });
      $('.x', menu).addEventListener('click', () => { closeMenu(); draw(); });
      setTimeout(() => $('.mt', menu).focus({ preventScroll: true }), 20);
    };
    board.addEventListener('pointerdown', e => {
      if (e.target.closest('.amenu')) return; closeMenu(); const p = toSvg(e);
      const tip = e.target.closest('.ftip'), onDot0 = Math.hypot(p.x - BCX, p.y - BCY) < 18, hit = onDot0 ? null : e.target.closest('.farr');
      if (tip && !onDot0) { const a = st.arrows.find(x => x.id === tip.parentNode.dataset.id); dr = { mode: 'tip', a, moved: false, start: p }; board.setPointerCapture(e.pointerId); return; }
      if (hit) { const a = st.arrows.find(x => x.id === hit.dataset.id); dr = { mode: 'tap', a, start: p }; return; }
      const onDot = Math.hypot(p.x - BCX, p.y - BCY) < 18;
      dr = { mode: 'new', x: onDot ? BCX : p.x, y: onDot ? BCY : p.y, start: p, a: null }; board.setPointerCapture(e.pointerId); e.preventDefault();
    });
    board.addEventListener('pointermove', e => {
      if (!dr) return; const p = toSvg(e);
      if (dr.mode === 'new') { const dx = p.x - dr.x, dy = p.y - dr.y, L = Math.hypot(dx, dy); if (L < 8 && !dr.a) return;
        if (!dr.a) { hist.push(JSON.stringify(st.arrows)); dr.a = { id: 'a' + (nid++), x: dr.x, y: dr.y, dir: 'right', len: 0, type: '', value: '' }; st.arrows.push(dr.a); }
        dr.a.dir = snap(dx, dy); dr.a.len = clamp(Math.abs(dr.a.dir === 'left' || dr.a.dir === 'right' ? dx : dy), 0, 190); draw(); }
      else if (dr.mode === 'tip') { const [dx, dy] = DIRS[dr.a.dir]; const L = (p.x - dr.a.x) * dx + (p.y - dr.a.y) * dy; if (!dr.moved) hist.push(JSON.stringify(st.arrows)); dr.moved = true; dr.a.len = clamp(L, 20, 190); draw(); }
    });
    const up = e => {
      if (!dr) return; const d = dr; dr = null;
      if (d.mode === 'new') { if (d.a && d.a.len < 20) { st.arrows = st.arrows.filter(x => x !== d.a); draw(); } else if (d.a) { draw(); openMenu(d.a); } }
      else if (d.mode === 'tip') { if (!d.moved) openMenu(d.a); else save(); }
      else if (d.mode === 'tap') openMenu(d.a);
    };
    board.addEventListener('pointerup', up); board.addEventListener('pointercancel', () => { dr = null; });
    $('.fundo', host).addEventListener('click', () => { if (!hist.length) return; st.arrows = JSON.parse(hist.pop()); closeMenu(); draw(); save(); });
    $('.fclear', host).addEventListener('click', () => { if (!st.arrows.length) return; hist.push(JSON.stringify(st.arrows)); st.arrows = []; st.lastRes = null; closeMenu(); draw(); save(); ffb.textContent = ''; ffb.className = 'fb ffb'; });
    $('.fcheck', host).addEventListener('click', () => {
      closeMenu(); if (!st.arrows.length) { ffb.className = 'fb ffb no'; ffb.textContent = 'Draw at least one arrow first. Drag from the orange dot.'; return; }
      st.tries++; const res = FBDB.check(scen, st.arrows); st.lastRes = res; st.best = Math.max(st.best || 0, res.score);
      if (res.ok) { st.passed = true; ffb.className = 'fb ffb ok'; ffb.textContent = st.tries === 1 ? 'Perfect diagram, first time! Every check is green.' : 'Brilliant! Every check is green now.'; }
      else { st.hintLevel = (st.hintLevel || 0) + 1; ffb.className = 'fb ffb ' + (st.hintLevel >= 2 ? 'hint' : 'no'); ffb.textContent = FBDB.hint(scen, res, st.hintLevel); }
      draw(); save(); if (opts.onCheck) opts.onCheck(st, res);
    });
    draw(); if (st.lastRes) { drawChips(st.lastRes); if (st.passed) { ffb.className = 'fb ffb ok'; ffb.textContent = 'Every check is green. Well done!'; } }
    return { get state() { return st; } };
  }
};
