/* ===== Part 5 route strip and GASA check (new board). The student works out each leg's total MA, Smooshy's pull and hand travel, then sends the strip to GASA.
   GASA approves when every box is right (5% either way). Wrong boxes get a hint ladder: a nudge, then the formula, then the answer (counted as helped).
   Saved at chal.c6e.gl.work5 = { key, vals, hints, helped, approved }. The board hides Smooshy's pull and refuses to launch a finished route until GASA approves. */
const RB5_TOL = 0.05;
function rb5LegsKey(legs) { return legs.map(l => `${l.type}:${l.needs}:${l.ma}`).join('|'); }
function rb5Strip(host, o) {   // o: { get(), put(patch), onApprove() }
  const S = { legs: [], won: false };
  const wk = () => (o.get().work5) || {};
  const exp = l => ({ ma: l.ma, pull: l.pull, hand: l.hand });
  const ok = (v, e, k) => { const x = parseFloat(String(v == null ? '' : v).replace(/,/g, '')); if (!isFinite(x)) return false; return Math.abs(x - e) <= Math.max(k === 'ma' ? 0.06 : k === 'pull' ? 0.5 : 2, Math.abs(e) * RB5_TOL); };
  const fmtN = v => (Math.round(v * 10) / 10).toLocaleString('en-GB');
  function paint() {
    if (!S.legs.length) { host.innerHTML = ''; return; }
    const key = rb5LegsKey(S.legs); let w = wk(); if (w.key !== key) { w = { key, vals: {}, hints: w.hints || 0, helped: w.helped || 0, approved: false }; o.put({ work5: w }); }
    const dis = w.approved ? ' disabled' : '';
    host.innerHTML = `<div class="panel rb5strip"><h3>Route strip: your maths for GASA</h3>
      <p class="mut">${S.won ? 'Your route reaches the line. Before the rescue launches, GASA needs your maths for each leg.' : 'Fill this in once your route reaches the dotted line. You can still run a test of it.'}</p>
      <div class="tw"><table><tr><th>Leg</th><th>Move</th><th>Force needed</th><th>Total MA</th><th>Smooshy's pull (N)</th><th>Hand travel (m)</th></tr>
      ${S.legs.map((l, i) => `<tr><td>${i + 1}</td><td>${esc(l.name)}</td><td>${Math.round(l.needs).toLocaleString('en-GB')} N</td>${['ma', 'pull', 'hand'].map(k => { const v = (w.vals[i + '|' + k] || ''), bad = w.bad && w.bad[i + '|' + k]; return `<td><input class="rb5in${bad ? ' bad' : ''}" data-k="${i}|${k}" inputmode="decimal" value="${esc(v)}" aria-label="Leg ${i + 1} ${k}"${dis}></td>`; }).join('')}</tr>`).join('')}</table></div>
      <div class="row"><button class="go" id="rb5Send"${dis}>${w.approved ? '✓ Approved by GASA' : 'Send to GASA'}</button><span id="rb5Msg" class="rb5msg">${esc(w.msg || '')}</span></div>
      <p class="mut">Hints used: ${w.hints || 0}${w.helped ? ` (${w.helped} box${w.helped > 1 ? 'es' : ''} given by GASA)` : ''}</p></div>`;
    $$('.rb5in', host).forEach(inp => inp.addEventListener('input', () => { const ww = wk(); ww.vals = Object.assign({}, ww.vals, { [inp.dataset.k]: inp.value }); o.put({ work5: ww }); }));
    const b = $('#rb5Send', host); if (b) b.addEventListener('click', send);
  }
  function send() {
    const w = Object.assign({}, wk()), key = w.key, bad = {}; let first = null, empty = 0;
    S.legs.forEach((l, i) => ['ma', 'pull', 'hand'].forEach(k => { const v = $(`[data-k="${i}|${k}"]`, host).value; w.vals = Object.assign({}, w.vals, { [i + '|' + k]: v }); if (!String(v).trim()) empty++; if (!ok(v, exp(l)[k], k)) { bad[i + '|' + k] = 1; if (!first) first = { i, k, l }; } }));
    if (empty) { w.msg = 'Some boxes are empty. Fill in every box, then send it again.'; w.bad = bad; o.put({ work5: w }); paint(); return; }
    if (!first) { w.approved = true; w.bad = {}; w.msg = 'GASA approves your maths! Press Run it to launch the rescue.'; o.put({ work5: w }); paint(); o.onApprove(); return; }
    w.hints = (w.hints || 0) + 1; w.bad = bad; w.tries = (w.tries || 0) + 1; const { i, k, l } = first, nm = k === 'ma' ? 'total MA' : k === 'pull' ? "Smooshy's pull" : 'hand travel';
    if (w.tries % 3 === 1) w.msg = `GASA checked it. Look again at the ${nm} for leg ${i + 1}. ${k === 'ma' ? 'Multiply the numbers of every machine in that leg together, including the screw jack or lever if it has one.' : k === 'pull' ? "Smooshy's pull comes from the force needed and the total MA." : 'Hand travel is how far Smooshy pulls a rope or turns a handle.'}`;
    else if (w.tries % 3 === 2) w.msg = k === 'ma' ? `Leg ${i + 1}: the machines give 60 N × total MA, and the table under the board shows that sum. Read the MA out of it.` : k === 'pull' ? `Leg ${i + 1}: Smooshy's pull = force needed ÷ total MA. The force needed is ${Math.round(l.needs).toLocaleString('en-GB')} N.` : `Leg ${i + 1}: hand travel = total MA × how far the Gumdrop moves.`;
    else { const e = exp(l)[k]; w.vals[i + '|' + k] = String(Math.round(e * 10) / 10); w.helped = (w.helped || 0) + 1; w.msg = `GASA filled in the ${nm} for leg ${i + 1}: ${fmtN(e)}. Check the other boxes, then send it again.`; delete bad[i + '|' + k]; }
    o.put({ work5: w }); paint();
  }
  return { update(legs, won) { S.legs = legs; S.won = won; paint(); }, approved: () => { const w = wk(); return !!w.approved && w.key === rb5LegsKey(S.legs); } };
}
