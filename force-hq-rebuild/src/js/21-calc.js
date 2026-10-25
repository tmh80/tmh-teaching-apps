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
    <div class="disp"><div class="last" id="calcLast"></div><input id="calcIn" inputmode="decimal" aria-label="Calculator display" autocomplete="off"></div>
    <div class="cmsg" id="calcMsg"></div>
    <div class="keys">${['C', '(', ')', '⌫', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', 'g', '+'].map(k => `<button type="button" data-k="${k}" class="${'÷×−+'.includes(k) ? 'op' : k === 'g' ? 'g' : ''}" ${k === 'g' ? 'title="g = 9.8 N/kg"' : ''}>${k}</button>`).join('')}<button type="button" data-k="=" class="eq" style="grid-column:1/-1">=</button></div>
    <div class="scaleNote">The <b>g</b> key is 9.8 N/kg. Weight = mass × g. You can type <b>x</b> or <b>*</b> to multiply and <b>/</b> to divide.</div>`;
  const inp = $('#calcIn');
  const run = () => { try { const v = calcEval(inp.value); if (v === '') return; $('#calcLast').textContent = inp.value + ' ='; inp.value = String(v); $('#calcMsg').textContent = ''; } catch (e) { $('#calcMsg').textContent = e.message; } };
  el.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k;
    if (k === 'C') { inp.value = ''; $('#calcLast').textContent = ''; $('#calcMsg').textContent = ''; } else if (k === '⌫') inp.value = inp.value.slice(0, -1); else if (k === '=') run(); else inp.value += k; });
  inp.addEventListener('input', () => { const v = inp.value, w = v.replace(/[xX*]/g, '×').replace(/\//g, '÷'); if (w !== v) { const p = inp.selectionStart; inp.value = w; inp.setSelectionRange(p, p); } });   // typing x or * shows ×, / shows ÷
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } if (e.key === 'Escape') toggleCalc(false); });
  $('#calcX').addEventListener('click', () => toggleCalc(false));
  $('#calcFab').addEventListener('click', () => toggleCalc());
  // drag by the header
  let dg = null; $('#calcDrag').addEventListener('pointerdown', e => { if (e.target.closest('button')) return; const r = el.getBoundingClientRect(); dg = { dx: e.clientX - r.left, dy: e.clientY - r.top }; $('#calcDrag').setPointerCapture(e.pointerId); });
  $('#calcDrag').addEventListener('pointermove', e => { if (!dg) return; el.style.left = clamp(e.clientX - dg.dx, 0, innerWidth - 80) + 'px'; el.style.top = clamp(e.clientY - dg.dy, 0, innerHeight - 60) + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; });
  $('#calcDrag').addEventListener('pointerup', () => dg = null);
}
function toggleCalc(on) { const el = $('#calc'); on = on == null ? el.hidden : on; el.hidden = !on; if (on) { CALC_USED = true; if (LAB.onChange) LAB.onChange(); setTimeout(() => $('#calcIn').focus({ preventScroll: true }), 20); } }
let CALC_USED = false;
