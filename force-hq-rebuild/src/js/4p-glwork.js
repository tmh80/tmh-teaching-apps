/* ===== Part 5, stage 4: the route strip ("My working"), 💡 hints, and 📨 Send to GASA (spec section 11) =====
   The student is at GASA Mission Control. The board is a simulator, so Test in simulator shows where the route works or fails and NO numbers.
   The maths goes in the strip: one row per leg (plus a Boulder row), each with an input for every machine's MA, the total MA, Smooshy's pull, the hand distance and the work.
   Nothing is pre-calculated. Send to GASA checks every cell: wrong cells are flagged, a cell rejected twice is shown with its right value and working ("helped", which counts as a hint),
   and when every cell is right: "Mission accepted 🚀" and the rescue animation (4i-glrun.js) plays.
   Saved in chal.c6e.gl.work = { rows: { rowKey: { sig, v: {cell: text}, ok: {cell: 1}, bad: {cell: 1}, rej: {cell: {n, last}}, helped: {cell: 1} } } }.
   A row's key is the machine's id (the boulder is 'B'); its sig is a fingerprint of the machine as built, so changing a machine clears that row's cells.
   A leg with a drag in it (leg.given, see 4q-pull.js and the spec's section 4) has no textbook machine MA: the row GIVES the force and the distance and the work, and asks for the rope MA, Smooshy's pull (force ÷ MA) and the hand distance (MA × distance).
   glwRows() builds the rows from the rig (GLB.ev); glwSnapshot() is the copy that goes with a launched run to the My Rescue page (4l-glreport.js). */
const GLW = { open: {}, busy: false, msg: null };
const GLW_TOL = 0.02;
const GLW_MACH = { ramp: 'Ramp MA', crane: 'Crane MA', lever: 'Lever MA', jack: 'Screw jack MA' };
const GLW_NAME = { ramp: 'ramp', crane: 'crane gantry', lever: 'lever', jack: 'screw jack', drag: 'winch post' };
/* the number in a typed cell ("56.3", "56.3 N", "6,300" all work); NaN for anything else */
function glwNum(s) { const t = String(s == null ? '' : s).trim().replace(/,/g, '').replace(/\s+/g, ''); const m = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i.exec(t); if (!m) return NaN; return /^[a-zA-Z%°²×]*$/.test(t.slice(m[0].length)) ? +m[0] : NaN; }
const glwClose = (v, exp) => !isNaN(v) && Math.abs(v - exp) <= Math.max(0.06, Math.abs(exp) * GLW_TOL);
const glwPlain = (v, d) => String(+(+v).toFixed(d));
const glwWork = () => glState().work || { rows: {} };
function glwPut(fn) { const all = dbGet('chal.' + GLB.ch, {}), g = all[GLB.mid] = all[GLB.mid] || {}; g.work = g.work || { rows: {} }; g.work.rows = g.work.rows || {}; fn(g.work); dbSet('chal.' + GLB.ch, all); }

/* ---------- the rows, built from the rig ---------- */
function glwMake(o) {
  const f1 = v => fmt(v, 1), f2 = v => fmt(v, 2), n0 = v => Math.round(v).toLocaleString('en-GB'), B = GLH_BLANK, cells = [], t2 = [];
  const given = o.given || null;
  if (o.mach) { cells.push({ k: 'mach', lab: GLW_MACH[o.mach], exp: o.mMA, d: 2, wk: o.mWk }); t2.push(o.mT2); }
  if (o.ropes != null) { cells.push({ k: 'block', lab: 'Pulley block MA', exp: o.ropes, d: 2, wk: `${o.ropes} supporting rope${o.ropes > 1 ? 's' : ''}, so the MA is ${o.ropes}` }); t2.push(`Pulley block: ${o.ropes} supporting rope${o.ropes > 1 ? 's' : ''}, so MA = ${B}`); }
  o.wins.forEach((r, i) => { const nm = o.wins.length > 1 ? `Winch ${i + 1} MA` : 'Winch MA'; cells.push({ k: 'winch' + (i + 1), lab: nm, exp: r, d: 2, wk: `the winch gear is ×${r}, so the MA is ${r}` }); t2.push(`${o.wins.length > 1 ? `Winch ${i + 1}` : 'Winch'} gear ×${r}, so MA = ${B}`); });
  const fac = []; if (o.mach) fac.push(f2(o.mMA)); if (o.ropes != null) fac.push(String(o.ropes)); o.wins.forEach(r => fac.push(String(r)));
  cells.push({ k: 'tot', lab: given ? 'Rope MA' : 'Total MA', exp: o.tot, d: 2, wk: `${fac.join(' × ')} = ${f2(o.tot)}` }); t2.push(`${given ? 'Rope MA' : 'Total MA'} = ${fac.map((x, i) => i === 0 && o.mach ? B : x).join(' × ')} = ${B}`);
  const pl = given ? given.force : o.load;   // a leg with a drag in it: the force GASA gives, not the Gumdrop's weight
  cells.push({ k: 'pull', lab: 'Smooshy\'s pull (N)', exp: o.pull, d: 1, wk: `${n0(pl)} ÷ ${f2(o.tot)} = ${f1(o.pull)} N` }); t2.push(`Pull = ${n0(pl)} ÷ ${B} = ${B} N`);
  const hd = given ? given.dist : o.rise;   // the distance the Gumdrop moves along its path, or the height a lift rises
  if (o.hand != null) { cells.push({ k: 'hand', lab: 'Hand distance (m)', exp: o.hand, d: 1, wk: `${f2(o.tot)} × ${f1(hd)} m = ${f1(o.hand)} m` }); t2.push(`Hand distance = ${B} × ${f1(hd)} m = ${B} m`); }
  if (o.work != null && !given) { cells.push({ k: 'work', lab: 'Work (J)', exp: o.work, d: 0, wk: `${n0(o.load)} × ${f1(o.rise)} m = ${n0(o.work)} J` }); t2.push(`Work = ${n0(o.load)} × ${f1(o.rise)} m = ${B} J`); }
  return { kind: o.kind, key: o.key, sig: o.sig, name: o.name, desc: o.desc, load: o.load, mach: o.mach, roped: o.roped, cells, t2, given: given ? Object.assign({}, given, { text: given.text }) : null };
}
function glwRows() {
  const ev = GLB.ev, rig = GLB.rig; if (!ev) return []; const byId = {}; rig.parts.forEach(p => byId[p.id] = p);
  const f1 = v => fmt(v, 1), n0 = v => Math.round(v).toLocaleString('en-GB'), B = GLH_BLANK, rows = [];
  /* the boulder: a lever or jack set on it, or a rope and winch from it. A blast needs no maths. */
  const bo = ev.boulder, bm = rig.parts.find(p => p.role === 'boulder' && (p.type === 'lever' || p.type === 'jack'));
  if (bo && (bo.how === 'lever' || bo.how === 'jack' || bo.how === 'winch')) {
    const ad = bm ? glAddons(rig, bm.id) : glAddons({ parts: rig.parts, cables: (rig.cables || []).map(c => ({ a: c.a === 'boulder' ? '__b' : c.a, b: c.b === 'boulder' ? '__b' : c.b })) }, '__b');
    const ropes = ad.blocks.length ? clamp(ad.blocks[0].ropes | 0, 1, GL.ropesMax) : null, wins = ad.winches.slice(0, GL.winchMax).map(w => w.ratio), mMA = bm ? (bm.type === 'jack' ? GL.jackMA : glLeverMA(bm)) : null;
    const mWk = !bm ? '' : bm.type === 'jack' ? 'a screw jack has MA 120' : `${f1(GL.beam - bm.arm)} ÷ ${f1(bm.arm)} = ${fmt(mMA, 2)}`;
    const mT2 = !bm ? '' : bm.type === 'jack' ? 'Screw jack MA = 120' : `Lever MA = effort arm ÷ load arm = ${f1(GL.beam - bm.arm)} ÷ ${f1(bm.arm)} = ${B}`;
    const desc = (bm ? (bm.type === 'jack' ? 'screw jack' : `lever, load arm ${f1(bm.arm)} m`) : 'rope and winch') + (ropes ? ` · pulley block, ${ropes} rope${ropes > 1 ? 's' : ''}` : '') + wins.map(w => ` · winch ×${w}`).join('');
    rows.push(glwMake({ kind: 'boulder', key: 'B', sig: JSON.stringify(['B', bo.how, mMA, ropes, wins]), name: 'Boulder', desc, load: GL.boulderN, mach: bm ? bm.type : null, mMA, mWk, mT2, ropes, wins, tot: bo.ma, pull: bo.pull, hand: null, work: null, roped: true }));
  }
  ev.legs.forEach((l, i) => {
    const chain = (l.type === 'drag' ? [l.id] : []).concat(l.addons).map(id => byId[id]).filter(Boolean), hasBlock = chain.some(p => p.type === 'block'), ropes = hasBlock ? l.ropes : null, wins = l.winches.slice(0, GL.winchMax), p = l.m ? l.m.part : null;
    const lift = l.type === 'lever' || l.type === 'jack', given = !!l.given && !lift;   // a lever or jack never drags: even when the boulder tears the leg off, it is the textbook sum on the Gumdrop's weight
    const ropeTxt = `${hasBlock ? ` · pulley block, ${l.ropes} rope${l.ropes > 1 ? 's' : ''}` : ''}${wins.map(w => ` · winch ×${w}`).join('')}`;
    const sup = glSupport(l.end.x, l.end.y, ev.ground, ev.plats), pl = sup && sup.kind === 'platform' ? ev.plats.find(q => q.id === sup.id) : null, pp = pl ? byId[pl.id] : null;
    const land = pp ? ` · lands on the ${(GL_PLAT[pp.size] || GL_PLAT.M).name.toLowerCase()} platform ${pl.over ? '✗' : '✓'}` : '';
    if (given) {
      const verb = l.rough > 0 ? 'Dragging' : l.type === 'ramp' ? 'Pulling the Gumdrop up the ramp' : 'Lifting', nm = l.type === 'ramp' ? `${f1(p.L)} m ramp` : l.type === 'drag' ? 'winch post' : GLW_NAME[l.type];
      const text = `${verb} here needs ${n0(l.force)} N over ${f1(l.dist)} m. GASA has worked out the work for this leg: ${n0(l.work)} J.`;
      rows.push(glwMake({ kind: 'leg', key: 'L:' + l.id, sig: JSON.stringify([l.type, l.ropes, wins, l.load, Math.round(l.force), +l.dist.toFixed(1)]), name: `Leg ${i + 1}`, desc: `${nm}, up ${f1(l.rise)} m${ropeTxt}${land}`, load: l.load, mach: null, ropes, wins, tot: l.ma, pull: l.pull, hand: l.hand, work: l.work, rise: l.rise, roped: l.roped,
        given: { force: l.force, dist: l.dist, work: l.work, text } }));
      return;
    }
    const mWk = l.type === 'ramp' ? `${f1(p.L)} ÷ ${f1(p.rise)} = ${fmt(l.mma, 2)}` : l.type === 'lever' ? `${f1(GL.beam - p.arm)} ÷ ${f1(p.arm)} = ${fmt(l.mma, 2)}` : l.type === 'crane' ? 'a crane gantry has MA 1' : 'a screw jack has MA 120';
    const mT2 = l.type === 'ramp' ? `Ramp MA = length ÷ rise = ${f1(p.L)} ÷ ${f1(p.rise)} = ${B}` : l.type === 'lever' ? `Lever MA = effort arm ÷ load arm = ${f1(GL.beam - p.arm)} ÷ ${f1(p.arm)} = ${B}` : l.type === 'crane' ? 'Crane gantry MA = 1' : 'Screw jack MA = 120';
    const desc = `${l.type === 'ramp' ? f1(p.L) + ' m ramp' : GLW_NAME[l.type]}${l.type === 'lever' ? `, load arm ${f1(p.arm)} m` : ''}, up ${f1(l.rise)} m${ropeTxt}${land}`, load = l.given && lift ? l.force : l.load;
    rows.push(glwMake({ kind: 'leg', key: 'L:' + l.id, sig: JSON.stringify([l.type, l.mma, ropes, wins, load, l.rise]), name: `Leg ${i + 1}`, desc, load, mach: l.type, mMA: l.mma, mWk, mT2, ropes, wins, tot: l.ma, pull: l.pull, hand: l.hand, work: l.work, rise: l.rise, roped: l.roped }));
  });
  return rows;
}
/* bring the saved cells in line with the rows: a row whose machine changed starts again empty */
function glwSync(rows) {
  const W = glwWork(); let dirty = false; rows.forEach(r => { const e = (W.rows || {})[r.key]; if (!e || e.sig !== r.sig) dirty = true; });
  if (dirty) glwPut(w => rows.forEach(r => { const e = w.rows[r.key]; if (!e || e.sig !== r.sig) w.rows[r.key] = { sig: r.sig, v: {}, ok: {}, bad: {}, rej: {}, helped: {} }; }));
  return glwWork();
}
const glwEntry = (W, r) => (W.rows && W.rows[r.key]) || { v: {}, ok: {}, bad: {}, rej: {}, helped: {} };
const glwFilled = (W, rows) => rows.length > 0 && rows.every(r => { const e = glwEntry(W, r); return r.cells.every(c => e.helped[c.k] || String((e.v || {})[c.k] == null ? '' : e.v[c.k]).trim() !== ''); });
const glwHints = () => glState().hints || 0;

/* ---------- drawing the strip ---------- */
function glwCellHTML(r, c, e) {
  const helped = e.helped[c.k], st = helped ? 'helped' : e.ok[c.k] ? 'ok' : e.bad[c.k] ? 'bad' : '', val = helped ? glwPlain(c.exp, c.d) : ((e.v || {})[c.k] || '');
  const mark = helped ? '<i class="glw-mk">helped</i>' : e.ok[c.k] ? '<i class="glw-mk">✓</i>' : e.bad[c.k] ? '<i class="glw-mk">✗</i>' : '';
  return `<label class="glw-cell ${st}"><span>${c.lab}</span><span class="glw-in"><input type="text" inputmode="decimal" autocomplete="off" data-glw-in="${r.key}|${c.k}" value="${esc(val)}" ${helped ? 'disabled' : ''} aria-label="${esc(r.name)}: ${esc(c.lab)}">${mark}</span></label>`;
}
function glwRowHTML(r, e) {
  const helps = r.cells.filter(c => e.helped[c.k]).map(c => `<li><b>${esc(c.lab.replace(/ \((N|m|J)\)$/, ''))}:</b> ${c.wk}</li>`).join('');
  return `<div class="glw-row ${r.kind}" data-r="${esc(r.key)}"><div class="glw-hd"><b>${r.name}</b><span class="glw-desc">${esc(r.desc)}</span><span class="glw-load">Load ${Math.round(r.load).toLocaleString('en-GB')} N</span>${r.roped ? '' : '<span class="glw-warn">not roped to the Gumdrop yet</span>'}
      <button type="button" class="ghost sm glw-hbtn" data-glw="hint:${esc(r.key)}" aria-expanded="${GLW.open[r.key] ? 'true' : 'false'}">💡 Hint</button></div>
    ${r.given ? `<p class="glw-given"><b>Given by GASA:</b> ${esc(r.given.text)}</p>` : ''}
    <div class="glw-cells">${r.cells.map(c => glwCellHTML(r, c, e)).join('')}</div>
    ${helps ? `<div class="glw-help"><b>Helped by GASA:</b><ul>${helps}</ul></div>` : ''}
    ${GLW.open[r.key] ? `<div class="glw-hint">${glhBoxHTML(r)}</div>` : ''}</div>`;
}
function glwPaint() {
  const host = $('#glStrip'); if (!host || !GLB.ev) return; const rows = glwRows(), W = glwSync(rows), n = glwHints();
  const body = rows.length ? rows.map(r => glwRowHTML(r, glwEntry(W, r))).join('') : '<p class="glnote">Build a route in the simulator above. Each leg of the route gets a row here, and so does the boulder.</p>';
  host.innerHTML = `<div class="glw-top"><h3>🛰️ My working: the route strip</h3><span class="glw-hints" id="glwHints">💡 Hints used: <b>${n}</b>${n ? '' : ' (the first is free)'}</span></div>
    <p class="glnote">GASA checks your maths before the rescue launches. Test your route in the simulator first: it shows where the route works, but no numbers. Then work out every box for each leg and send it.</p>
    <div class="glw-rows">${body}</div>
    <div class="glw-send"><button type="button" class="go" id="glSend">📨 Send to GASA</button><span class="glnote" id="glwWhy"></span></div><p class="glw-msg ${GLW.msg ? GLW.msg.cls : ''}" id="glwMsg" aria-live="polite">${GLW.msg ? esc(GLW.msg.text) : ''}</p>`;
  glwSendState(rows, W);
}
function glwSendState(rows, W) {
  const b = $('#glSend'); if (!b) return; rows = rows || glwRows(); W = W || glwWork(); const ok = glwFilled(W, rows) && !GLW.busy && !(GLR && GLR.on);
  b.disabled = !ok; const why = $('#glwWhy'); if (why) why.textContent = rows.length ? (ok ? '' : GLW.busy || (GLR && GLR.on) ? '' : 'Fill in every box to send it.') : 'Build a route first.';
}

/* ---------- Send to GASA ---------- */
const glwList = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
function glwSend() {
  if (GLW.busy || (GLR && GLR.on)) return; const rows = glwRows(), W = glwSync(rows); if (!glwFilled(W, rows)) return;
  const wrong = [], helped = []; let anyHelped = false;
  glwPut(w => rows.forEach(r => { const e = w.rows[r.key]; r.cells.forEach(c => {
    if (e.helped[c.k]) return; const txt = String(e.v[c.k] == null ? '' : e.v[c.k]).trim(), v = glwNum(txt);
    if (glwClose(v, c.exp)) { e.ok[c.k] = 1; delete e.bad[c.k]; return; }
    delete e.ok[c.k]; e.bad[c.k] = 1; const rj = e.rej[c.k] || { n: 0, last: null }; if (rj.last !== txt) { rj.n++; rj.last = txt; } e.rej[c.k] = rj;
    wrong.push([r, c]); if (rj.n >= 2) { e.helped[c.k] = 1; delete e.bad[c.k]; helped.push([r, c]); anyHelped = true; }
  }); }));
  helped.forEach(([r, c]) => glhSpend(`help:${r.key}:${c.k}:${(glwWork().rows[r.key] || {}).sig}`));   // a helped cell counts as a hint (once for that cell and machine)
  const tried = glState().sent || 0; GLB.save({ id: GLB.mid }, { tried: true, sent: tried + 1 });
  if (wrong.length) {
    const by = []; rows.forEach(r => { const cs = wrong.filter(q => q[0] === r).map(q => q[1].lab.toLowerCase().replace(/ \((n|m|j)\)$/, '').replace('smooshy\'s ', '')); if (cs.length) by.push(`${r.kind === 'boulder' ? 'the boulder' : r.name.toLowerCase()}'s ${glwList(cs)}`); });
    GLB.ev = gpEvaluate(GLB.rig, { hints: glState().hints || 0 });
    GLW.msg = { cls: 'no', text: `Mission not accepted yet: check ${glwList(by)}.` + (anyHelped ? ' GASA has filled in the boxes you got wrong twice. They show as helped, with the working. Press Send to GASA again.' : '') }; glwPaint();
    return;
  }
  glwPaint(); glwAccept();
}
/* every cell is right: "Mission accepted 🚀", then the rescue animation */
function glwAccept() {
  GLW.busy = true; GLW.msg = { cls: 'ok', text: 'Mission accepted 🚀 GASA approves your maths. Launching the rescue!' }; glwPaint();
  const bn = $('#glAccept'); if (bn) { bn.hidden = false; try { bn.scrollIntoView({ block: 'nearest', behavior: RMOTION ? 'auto' : 'smooth' }); } catch (_) {} }
  setTimeout(() => { GLW.busy = false; if (bn) bn.hidden = true; glStartRun('launch'); glwSendState(); }, RMOTION || FAST ? 150 : 1500);
}
/* what goes with a launched run to the My Rescue page: the student's own working, with ✓ or "helped" on every cell, and the hints used */
function glwSnapshot() {
  const rows = glwRows(), W = glwWork(); return { hints: glwHints(), helped: rows.reduce((a, r) => a + r.cells.filter(c => glwEntry(W, r).helped[c.k]).length, 0), approved: true,
    rows: rows.map(r => { const e = glwEntry(W, r); return { name: r.name, kind: r.kind, desc: r.desc, load: Math.round(r.load), given: r.given ? r.given.text : '', cells: r.cells.map(c => ({ lab: c.lab, v: e.helped[c.k] ? glwPlain(c.exp, c.d) : String((e.v || {})[c.k] || ''), st: e.helped[c.k] ? 'helped' : e.ok[c.k] ? 'ok' : '' })) }; }) };
}
/* the same strip filled in with the right answers, for the answer key */
function glwKeyFor(rig) {
  const keepRig = GLB.rig, keepEv = GLB.ev; try { GLB.rig = rig; GLB.ev = gpEvaluate(rig); const rows = glwRows(); return { hints: 0, helped: 0, approved: true, rows: rows.map(r => ({ name: r.name, kind: r.kind, desc: r.desc, load: Math.round(r.load), given: r.given ? r.given.text : '', cells: r.cells.map(c => ({ lab: c.lab, v: glwPlain(c.exp, c.d), st: 'ok' })) })) }; } finally { GLB.rig = keepRig; GLB.ev = keepEv; }
}

/* ---------- the strip on the page ---------- */
function glMountStrip(host) {
  if (!host) return; host.innerHTML = '<section class="panel glstrip" id="glStrip" aria-label="My working: the route strip"></section>';
  const box = $('#glStrip', host);
  box.addEventListener('input', e => { const t = e.target.closest('[data-glw-in]'); if (!t) return; const [rk, ck] = t.dataset.glwIn.split('|');
    glwPut(w => { const en = w.rows[rk]; if (!en) return; en.v[ck] = t.value; delete en.ok[ck]; delete en.bad[ck]; }); const lab = t.closest('.glw-cell'); if (lab) { lab.classList.remove('ok', 'bad'); const mk = lab.querySelector('.glw-mk'); if (mk) mk.remove(); } glwSendState(); });
  box.addEventListener('click', e => { const b = e.target.closest('[data-glw]'); if (!b) return; if (b.dataset.glw.startsWith('hint:')) { const key = b.dataset.glw.slice(5); GLW.open[key] = !GLW.open[key]; glwPaint(); return; }
    if (b.dataset.glw.startsWith('spend:')) { const p = b.dataset.glw.slice(6), i = p.lastIndexOf(':'); glhSpend(`lh:${p.slice(0, i)}:${p.slice(i + 1)}`); glwPaint(); return; } });
  $('#glStrip').addEventListener('click', e => { if (e.target.closest('#glSend')) glwSend(); });
  const prev = GLB.onChange; GLB.onChange = () => { if (prev) prev(); GLW.msg = null; glwPaint(); };
  glwPaint();
}
