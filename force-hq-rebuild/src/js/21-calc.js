/* ===== Pop-out calculator (safe parser, never eval) ===== */
function calcEval(src) {
  const s = src.replace(/[×xX]/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s+/g, '').replace(/g/gi, '(9.8)');
  let i = 0;
  const peek = () => s[i], eat = ch => { if (s[i] === ch) { i++; return true; } return false; };
  function num() { const m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i)); if (!m) throw new Error('Check your sum: something is missing.'); i += m[0].length; return parseFloat(m[0]); }
  function factor() { if (eat('-')) return -factor(); if (eat('+')) return factor(); if (eat('(')) { const v = expr(); if (!eat(')')) throw new Error('A bracket is missing its partner.'); return v; } return num(); }
  function term() { let v = factor(); while (peek() === '*' || peek() === '/' || peek() === '(') { if (eat('*')) v *= factor(); else if (eat('/')) { const d = factor(); if (d === 0) throw new Error("You can't divide by zero."); v /= d; } else v *= factor(); } return v; }
  function expr() { let v = term(); while (peek() === '+' || peek() === '-') { if (eat('+')) v += term(); else { i++; v -= term(); } } return v; }
  if (!s) return '';
  const v = expr(); if (i < s.length) throw new Error('Check your sum: there is an extra symbol.');
  return Math.round(v * 1e8) / 1e8;
}
function initCalc() {
  const el = $('#calc');
  el.innerHTML = `<div class="chd" id="calcDrag"><span>🧮 Calculator</span><button type="button" id="calcX" aria-label="Close the calculator">✕</button></div>
    <div class="ctabs" role="tablist" aria-label="Calculator or formulas"><button type="button" role="tab" id="calcTabK" data-ctk="keys" aria-selected="true">Calculator</button><button type="button" role="tab" id="calcTabF" data-ctk="formulas" aria-selected="false">Formulas</button></div>
    <div id="calcKeysPane">
    <div class="disp"><div class="last" id="calcLast"></div><input id="calcIn" inputmode="decimal" aria-label="Calculator display" autocomplete="off"></div>
    <div class="cmsg" id="calcMsg"></div>
    <div class="keys">${['C', '(', ')', '⌫', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', 'g', '+'].map(k => `<button type="button" data-k="${k}" class="${'÷×−+'.includes(k) ? 'op' : k === 'g' ? 'g' : ''}" ${k === 'g' ? 'title="g = 9.8 N/kg"' : ''}>${k}</button>`).join('')}<button type="button" data-k="=" class="eq" style="grid-column:1/-1">=</button></div>
    <div class="csave"><input id="calcNote" class="calcnote" autocomplete="off" aria-label="Your working (optional)" placeholder="Your working (optional)"><div class="csrow"><button type="button" class="ghost sm" id="calcSave">📓 Save to Journal</button><button type="button" class="ghost sm" id="calcWork">Open my working</button></div></div>
    <div class="scaleNote">The <b>g</b> key is 9.8 N/kg. Weight = mass × g. You can type <b>x</b> or <b>*</b> to multiply and <b>/</b> to divide.</div></div>
    <div id="calcForm" class="cform" hidden></div>`;
  const inp = $('#calcIn');
  let lastCalc = null;   // the last finished calculation, kept so it can be saved in the Journal with the student's working
  const run = () => { try { const expr = inp.value, v = calcEval(expr); if (v === '') return; $('#calcLast').textContent = expr + ' ='; inp.value = String(v); lastCalc = { expr, res: String(v) }; $('#calcMsg').textContent = ''; } catch (e) { $('#calcMsg').textContent = e.message; } };
  el.addEventListener('click', e => { const t = e.target.closest('[data-ctk]'); if (t) { calcTab(t.dataset.ctk); return; } const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k;
    if (k === 'C') { inp.value = ''; $('#calcLast').textContent = ''; $('#calcMsg').textContent = ''; lastCalc = null; } else if (k === '⌫') inp.value = inp.value.slice(0, -1); else if (k === '=') run(); else inp.value += k; });
  inp.addEventListener('input', () => { const v = inp.value, w = v.replace(/[xX*]/g, '×').replace(/\//g, '÷'); if (w !== v) { const p = inp.selectionStart; inp.value = w; inp.setSelectionRange(p, p); } });   // typing x or * shows ×, / shows ÷
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } if (e.key === 'Escape') toggleCalc(false); });
  $('#calcSave').addEventListener('click', () => {
    if (!lastCalc || (inp.value.trim() && inp.value !== lastCalc.res)) run();   // a sum typed but not yet worked out: work it out first
    if (!lastCalc) { $('#calcMsg').textContent = 'Work something out first, then save it.'; return; }
    saveCalc(lastCalc.expr, lastCalc.res, $('#calcNote').value.trim()); $('#calcNote').value = '';
    const b = $('#calcSave'); b.textContent = '✓ Saved'; setTimeout(() => { b.textContent = '📓 Save to Journal'; }, 1600);
  });
  $('#calcWork').addEventListener('click', () => { openJournal('work'); if (innerWidth < 1180) toggleCalc(false); });   // on a small screen the Journal fills the width, so the calculator steps aside
  $('#calcX').addEventListener('click', () => toggleCalc(false));
  $('#calcFab').addEventListener('click', () => toggleCalc());
  // drag by the header
  let dg = null; $('#calcDrag').addEventListener('pointerdown', e => { if (e.target.closest('button')) return; const r = el.getBoundingClientRect(); dg = { dx: e.clientX - r.left, dy: e.clientY - r.top }; $('#calcDrag').setPointerCapture(e.pointerId); });
  $('#calcDrag').addEventListener('pointermove', e => { if (!dg) return; el.style.left = clamp(e.clientX - dg.dx, 0, innerWidth - 80) + 'px'; el.style.top = clamp(e.clientY - dg.dy, 0, innerHeight - 60) + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; });
  $('#calcDrag').addEventListener('pointerup', () => dg = null);
}
/* ---- the calculator's Formulas tab: every formula is always there, and the ones used in the chapter the student is working on glow and come first (`ch` lists the chapters) ---- */
const FORMULAS = [
  { id: 'weight', name: 'Weight', eq: 'W = m × g', note: 'g = 9.8 N/kg. Weight is in newtons (N) and mass is in kilograms (kg).', tri: 'w', ch: [1, 3] },
  { id: 'resultant', name: 'Resultant force', eq: 'bigger force − smaller force', note: 'Forces pointing opposite ways: subtract. The resultant points the way of the bigger force.', ch: [1, 3] },
  { id: 'friction', name: 'Resultant with friction', eq: 'resultant = pull − friction', note: 'Friction pushes against the pull, so take it away from the pull first. Then use F = m × a.', ch: [3] },
  { id: 'fma', name: 'Newton\'s second law', eq: 'F = m × a', note: 'F is the resultant force in N, m is the mass in kg and a is the acceleration in m/s².', tri: 'fma', ch: [3, 4] },
  { id: 'accel', name: 'Acceleration from velocities', eq: 'a = (v − u) ÷ t', note: 'u is the starting velocity, v is the final velocity and t is the time in seconds. On a velocity–time graph, this is the slope.', ch: [3] },
  { id: 'third', name: 'Newton\'s third law', eq: 'force of A on B = force of B on A', note: 'Always the same size, always in opposite directions, and on two different objects.', ch: [4] },
  { id: 'push1s', name: 'A push that lasts 1 s', eq: 'velocity = F ÷ m, so F = m × velocity', note: 'Only for a force that acts for exactly 1 second, like the pushes in the Space Dome.', ch: [4] }
];
const calcChapter = () => (typeof CH !== 'undefined' && CH && VIEW === 'vChapter') ? CH.n : null;
function renderFormulas() {
  const host = $('#calcForm'); if (!host) return;
  const n = calcChapter(), rel = f => n != null && f.ch.includes(n), list = FORMULAS.filter(rel).concat(FORMULAS.filter(f => !rel(f)));
  host.innerHTML = `<p class="scaleNote">${n != null ? `The formulas glowing gold are the ones for Chapter ${n}.` : 'Open a chapter and the formulas for it will glow gold.'}</p>` + list.map(f =>
    `<div class="fcard${rel(f) ? ' rel' : ''}"><b>${f.name}${rel(f) ? ' <span class="ftag">This chapter</span>' : ''}</b><div class="feq">${f.eq}</div><small>${f.note}</small>${f.tri ? triHTML(f.tri) : ''}</div>`).join('');
}
function calcTab(k) {
  const f = k === 'formulas'; $('#calcKeysPane').hidden = f; $('#calcForm').hidden = !f; $('#calc').classList.toggle('wide', f);
  $$('#calc [data-ctk]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.ctk === k)));
  if (f) renderFormulas();
}
function toggleCalc(on) { const el = $('#calc'); on = on == null ? el.hidden : on; el.hidden = !on; if (on) { CALC_USED = true; if (LAB.onChange) LAB.onChange(); setTimeout(() => $('#calcIn').focus({ preventScroll: true }), 20); } }
let CALC_USED = false;

/* ---- formula triangles: F = m × a (kind 'fma') and W = m × g (kind 'w'). Tap a letter to cover it and see the sum that finds it. ---- */
const TRIS = {
  fma: { L: ['F', 'm', 'a'], lab: 'Formula triangle: F on top, m and a underneath', eq: { F: ['F = m × a', 'Multiply the two letters that are left (side by side).'], m: ['m = F ÷ a', 'F is above a, so divide: force ÷ acceleration.'], a: ['a = F ÷ m', 'F is above m, so divide: force ÷ mass.'] } },
  w: { L: ['W', 'm', 'g'], lab: 'Weight triangle: W on top, m and g underneath', eq: { W: ['W = m × g', 'Multiply the two letters that are left (side by side).'], m: ['m = W ÷ g', 'W is above g, so divide: weight ÷ 9.8.'], g: ['g = W ÷ m', 'W is above m, so divide: weight ÷ mass.'] } }
};
const TRI = TRIS.fma.eq;
function triInner(cov, kind) {
  const T = TRIS[kind || 'fma'], TT = T.eq;
  const G = (k, x, y, inner) => `<g data-tri="${k}" class="trik" role="button" tabindex="0" aria-label="Cover ${k}" style="cursor:pointer"><rect x="${x - 30}" y="${y - 30}" width="60" height="60" fill="transparent"/>${inner}</g>`;
  const L = (k, x, y) => G(k, x, y, cov === k ? `<rect x="${x - 21}" y="${y - 21}" width="42" height="42" rx="9" fill="var(--hazard)" stroke="var(--ink)" stroke-width="2.5"/><text x="${x}" y="${y + 8}" text-anchor="middle" font-size="26" font-weight="800" fill="var(--ink)">?</text>` : `<text x="${x}" y="${y + 12}" text-anchor="middle" font-size="36" font-weight="800" font-family="var(--f-num)" fill="var(--ink)">${k}</text>`);
  const sum = cov ? `<b>${TT[cov][0]}</b><small>${TT[cov][1]}</small>` : '<small>Tap a letter to cover it.</small>';
  return `<svg viewBox="0 0 220 154" role="img" aria-label="${T.lab}"><polygon points="110,8 18,146 202,146" fill="var(--panel)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/><line x1="64" y1="77" x2="156" y2="77" stroke="var(--ink)" stroke-width="3"/><line x1="110" y1="77" x2="110" y2="146" stroke="var(--ink)" stroke-width="3"/>${L(T.L[0], 110, 50)}${L(T.L[1], 66, 112)}${L(T.L[2], 154, 112)}</svg>
    <div class="trisum" aria-live="polite">${sum}</div><div class="trib">${T.L.map(k => `<button type="button" class="mini ${cov === k ? 'on' : ''}" data-tri="${k}" aria-pressed="${cov === k}">Cover ${k}</button>`).join('')}<button type="button" class="mini" data-tri="">Show all</button></div>`;
}
const triHTML = kind => `<div class="tri noglos" data-kind="${kind || 'fma'}">${triInner('', kind)}</div>`;
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('trik')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tri]'); if (!b) return; const root = b.closest('.tri'); let k = b.dataset.tri; if (b.classList.contains('trik') && root.querySelector('.mini.on[data-tri="' + k + '"]')) k = '';
  const kind = root.dataset.kind || 'fma'; root.innerHTML = triInner(k, kind); const bb = $(`.mini[data-tri="${k}"]`, root); if (bb) bb.focus({ preventScroll: true });
  if (k && (root.dataset.kind || 'fma') === 'fma') { S.flags.tri = S.flags.tri || {}; S.flags.tri[k] = true; if (LAB.onChange) LAB.onChange(); }
});
