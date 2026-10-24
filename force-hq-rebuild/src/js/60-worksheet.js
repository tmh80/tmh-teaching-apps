/* ===== Worksheets (student / blank / answer key), feedback page, marking schemes, Save my work ===== */
const BLUE = '#1a56db';
const WS_CSS = `
.ws{font-family:Atkinson Hyperlegible,Segoe UI,system-ui,sans-serif;color:#13212a;background:#fff;font-size:11pt;line-height:1.4;max-width:190mm;margin:0 auto}
.ws *{box-sizing:border-box}
.ws .page{page-break-after:always;padding:2mm 0}
.ws .page:last-child{page-break-after:auto}
.ws .hd{display:flex;justify-content:space-between;align-items:stretch;border-radius:6px;overflow:hidden;margin-bottom:6px}
.ws .hd .l{background:#13212a;color:#fff;padding:8px 14px;flex:1}.ws .hd .l b{font-family:Saira Condensed,Arial Narrow,sans-serif;font-size:20pt;letter-spacing:2px;color:#f0bf4c}
.ws .hd .r{background:#d7e6f1;padding:8px 14px;min-width:46%}
.ws .namebar{display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px;margin:6px 0}
.ws .namebar div{border-bottom:1.5px solid #13212a;padding:2px 0;font-size:10.5pt}
.ws .note{font-size:9pt;color:#555;margin:2px 0 8px}
.ws h2{font-family:Saira Condensed,Arial Narrow,sans-serif;font-size:16pt;margin:10px 0 4px;break-after:avoid}
.ws .q{border:1px solid #c9d3d8;border-radius:6px;padding:8px 10px;margin:8px 0;break-inside:avoid}
.ws .q .qh{display:flex;justify-content:space-between;font-weight:700;margin-bottom:4px}
.ws .q .qh span{font-weight:400;font-size:9pt;color:#555}
.ws .stu{color:${BLUE};font-weight:700}
.ws .stu svg{border:1.5px solid ${BLUE};border-radius:6px}
.ws .key{color:#1d6b3a;font-weight:700}
.ws table{border-collapse:collapse;width:100%;font-size:10pt}
.ws td,.ws th{border:1px solid #9aa9b0;padding:4px 6px;text-align:left;vertical-align:top}
.ws th{background:#eef3f5}
.ws .line{border-bottom:1px solid #9aa9b0;height:24px}
.ws .box{border:1.5px dashed #9aa9b0;border-radius:6px;min-height:40px;padding:4px 8px}
.ws .opt{margin:2px 0}
.ws .look{background:#eef8f1;border:1px solid #9ccfae;border-radius:6px;padding:4px 8px;margin-top:4px;font-size:10pt}
.ws .qfig{margin:4px 0 6px}.ws .qfig svg{width:95mm!important;max-width:95mm!important;border:1px solid #cbd7dc}
.ws .fbdbox{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start}
.ws .fbdbox svg{width:100%;height:auto}
.ws .mk{float:right;font-size:9pt;color:#555;font-weight:400}
.ws .noname{font-size:28pt;text-align:center;padding:40mm 0;font-weight:800}
@media print{@page{size:A4;margin:12mm}.ws .page{padding:0}}
`;
const LET = 'ABCDEFGHIJ';
function wsHeader(ch, title, mode) {
  const u = user(), today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const name = mode === 'student' ? `<span class="stu">${esc(u.teacher ? 'Teacher copy' : u.name || '')}</span>` : '';
  return `<div class="hd"><div class="l"><b>FORCE HQ</b><div style="font-size:10pt;color:#cfe0ea">Force Arenas · Chapter ${ch.n} · ${ch.part}</div></div><div class="r"><div style="font-size:14pt;font-weight:800">${title}</div><div style="font-size:10pt">${ch.title}${mode === 'key' ? ' · ANSWER KEY (teacher only)' : mode === 'blank' ? ' · Blank template' : ''}</div></div></div>
    <div class="namebar"><div>Name: ${name}</div><div>Class: ${mode === 'student' ? `<span class="stu">${esc(u.cls || '')}</span>` : ''}</div><div>Date: ${mode === 'student' ? today : ''}</div></div>
    ${mode === 'student' ? '<p class="note">Everything printed in blue was added by the student in the sim.</p>' : mode === 'blank' ? '<p class="note">Answer every question. Show your working for calculations.</p>' : ''}`;
}
function blankFbd(scen) { return FBDB.svg(scen, [], { noDot: true }); }
function qMarks(q) {
  switch (q.type) { case 'mcq': case 'tap': return 1; case 'tick': return 2; case 'match': return q.rows.length; case 'sort': return q.items.length; case 'num': return 2; case 'gap': return q.ans.length; case 'table': return q.rows.length * q.cols.length; case 'fbd': return q.scen.forces.length + 1; case 'explain': return q.check.length; default: return 1; }
}
function wsQuestion(q, i, mode, s) {
  const v = s ? s.v : null, stu = mode === 'student', key = mode === 'key';
  const W = x => stu ? `<span class="stu">${x}</span>` : key ? `<span class="key">${x}</span>` : x;
  let body = '';
  if (q.type === 'mcq' || q.type === 'tap') body = optOrder(q).map((oi, k) => `<div class="opt">${(stu && v === oi) || (key && q.a === oi) ? W('☑') : '☐'} ${LET[k]}. ${q.opts[oi]}</div>`).join('');
  else if (q.type === 'tick') body = optOrder(q).map((oi, k) => `<div class="opt">${(stu && v && v.includes(oi)) || (key && q.a.includes(oi)) ? W('☑') : '☐'} ${q.opts[oi]}</div>`).join('') + (key ? `<div class="look">${q.work || ''}</div>` : '');
  else if (q.type === 'num') body = `<div class="box">Working: ${stu ? '' : key ? W(q.work) : ''}<br><br></div><p>Answer: ${stu && v != null ? W(esc(v)) : key ? W(fmt(q.ans, 2)) : '____________'} ${q.unit}</p>`;
  else if (q.type === 'gap') { let k = 0; body = `<p>${q.p.replace(/___/g, () => { const j = k++; return stu && v ? W('<u>' + esc(v[j] || '') + '</u>') : key ? W('<u>' + esc(q.ans[j][0]) + '</u>') : '______________'; })}</p>`; }
  else if (q.type === 'match') { const ch2 = shuffled(q.rows.map((_, i2) => i2), hashStr(q.id) + 9); body = `<table><tr><th>${q.colA || "Force"}</th><th>Letter</th></tr>${q.rows.map((r, ri) => `<tr><td>${r[0]}</td><td style="width:22%">${stu && v && v[ri] != null ? W(LET[ch2.indexOf(v[ri])]) : key ? W(LET[ch2.indexOf(ri)]) : ''}</td></tr>`).join('')}</table><p style="margin:6px 0 0"><b>Choices:</b><br>${ch2.map((j, k) => `${LET[k]}. ${q.rows[j][1]}`).join('<br>')}</p>`; }
  else if (q.type === 'sort') body = `<table><tr><th>Item</th>${q.groups.map(g => `<th style="width:22%">${g}</th>`).join('')}</tr>${sortItems(q).map(ii => `<tr><td>${q.items[ii][0]}</td>${q.groups.map((_, gi) => `<td style="text-align:center">${(stu && v && v[ii] === gi) || (key && q.items[ii][1] === gi) ? W('✓') : ''}</td>`).join('')}</tr>`).join('')}</table><p class="note">Tick one box in each row.</p>`;
  else if (q.type === 'table') body = `<table><tr><th></th>${q.cols.map(c => `<th>${c}</th>`).join('')}</tr>${q.rows.map((r, ri) => `<tr><th>${r[0]}</th>${q.cols.map((_, j) => `<td style="height:26px">${stu && v && v[ri] && v[ri][j] != null ? W(q.choices[j][v[ri][j]]) : key ? W(q.choices[j][r[1][j]]) : ''}</td>`).join('')}</tr>`).join('')}</table><p style="margin:6px 0 0;font-size:10pt"><b>Choose from:</b> ${q.choices[0].join(' · ')}</p>`;
  else if (q.type === 'fbd') body = `<div class="fbdbox"><div>${q.scen.brief}${key ? `<div class="look"><b>Look for:</b><br>${q.scen.forces.map(f => `${FTYPES[f.type].name} ${fmt(f.value, 1)} N, ${DIRWORD[f.dir]}`).join('<br>')}<br>All arrows start at the centre; bigger forces have longer arrows.</div>` : stu && s && s.v && s.v.lastRes ? `<p style="font-size:10pt">Checks passed in the sim: ${s.v.lastRes.chips.filter(c => c[2]).map(c => c[1]).join(', ') || 'none'}</p>` : ''}</div><div>${stu ? (v && v.arrows && v.arrows.length ? `<div class="stu">${FBDB.svg(q.scen, v.arrows, { blue: true, noDot: true })}</div>` : '<div class="box" style="height:60mm">Not drawn in the sim.</div>') : key ? FBDB.svg(q.scen, FBDB.model(q.scen), { noDot: true }) : `<div style="border:1.5px dashed #9aa9b0;border-radius:6px">${blankFbd(q.scen)}</div>`}</div></div>`;
  else if (q.type === 'explain') body = stu ? `<div class="box">${W(v ? esc(v.text || '').replace(/\n/g, '<br>') : '')}</div>${v && v.ticks ? `<p class="note">Self-check in the sim: ticked ${v.ticks.length} of ${q.check.length} points.</p>` : ''}` : key ? `<div class="look"><b>Model answer:</b> ${q.model}<br><b>Look for:</b><br>${q.check.map(c => '• ' + c).join('<br>')}</div>` : '<div class="line"></div>'.repeat(6);
  const fig = (q.p.match(/<div class="qfig[\s\S]*$/) || [''])[0], qp = q.p.slice(0, q.p.length - fig.length);   // graphs print under the question, full width
  return `<div class="q"><div class="qh">Question ${i + 1}. ${q.type === 'gap' ? 'Fill the gaps.' : qp} <span>${QLABEL[q.type]} · ${qMarks(q)} mark${qMarks(q) > 1 ? 's' : ''}</span></div>${fig}${body}</div>`;
}
function buildWorksheet(chId, mode) {
  const ch = secOf(chId), R = CHDATA[chId].review, st = dbGet('review.' + chId, {});
  const partA = R.filter(q => !['fbd', 'explain'].includes(q.type)), partB = R.filter(q => ['fbd', 'explain'].includes(q.type));
  const num = q => R.indexOf(q);
  let h1 = `<div class="page">${wsHeader(ch, `${ch.part} worksheet`, mode)}<h2>Part A: Check your understanding</h2>${partA.map(q => wsQuestion(q, num(q), mode, st[q.id])).join('')}${partB.length ? `<h2>Part B: Draw and explain</h2>${partB.map(q => wsQuestion(q, num(q), mode, st[q.id])).join('')}` : ''}</div>`;
  if (mode === 'student') h1 += feedbackPage(chId);
  return `<div class="ws">${h1}</div>`;
}
function feedbackPage(chId) {
  const ch = secOf(chId), R = CHDATA[chId].review, st = dbGet('review.' + chId, {}), L = learnProgress(chId), C2 = challengeState(chId), P = reviewProgress(chId);
  return `<div class="page">${wsHeader(ch, 'Feedback page', 'student')}<h2>How I did in the sim</h2>
    <table><tr><th>Part</th><th>Result</th></tr><tr><td>Learn steps</td><td class="stu">${L.done} of ${L.total} done</td></tr>${CHDATA[chId].challenge ? `<tr><td>Challenge: ${CHDATA[chId].challenge.title}</td><td class="stu">${C2.tried} of ${C2.total} missions tried · ${C2.score} of ${C2.max} objectives met</td></tr>` : ''}<tr><td>Check questions</td><td class="stu">${P.done} of ${P.total} answered · ${P.points} of ${P.maxPoints} points</td></tr></table>
    <h2>Check questions</h2><table><tr><th>Q</th><th>Type</th><th>In the sim</th></tr>${R.map((q, i) => { const s = st[q.id]; const r = !s || !s.done ? 'Not answered' : q.type === 'explain' ? `Self-checked: ${s.v && s.v.ticks ? s.v.ticks.length : 0} of ${q.check.length} points` : (p => `${s.ok ? '✓' : p.score ? '◐' : '✗'} ${p.score} of ${p.max} point${p.max > 1 ? 's' : ''}`)(qPoints(q, s)); return `<tr><td>${i + 1}</td><td>${QLABEL[q.type]}</td><td class="stu">${r}</td></tr>`; }).join('')}</table>
</div>`;   /* no teacher comment box: Tom leaves comments directly on Toddle */
}
/* ---------- marking scheme (also on the answer key) ---------- */
function markingInstructions(title, total) {
  return `<h2>Marking instructions for Toddle AI</h2><p>This marking scheme is for the Force HQ worksheet "${title}". The blank template and the answer key for this worksheet are attached too.</p>
  <ul><li>Compare the student's upload with the blank template and mark only what the student added. Student work is printed in blue. The template's own text, choices and word lists are not student work.</li>
  <li>The answer key is the standard. Students don't need to match it word for word: accept any correct scientific wording.</li>
  <li>The student's feedback page shows how they did in the sim. If it disagrees with what you can see on the worksheet, trust the worksheet and say so.</li>
  <li>A blank question, or an empty template, scores 0. Add a kind note saying what is missing.</li>
  <li>Feedback for Grade 7–8: the score with a breakdown per question, one or two specific strengths quoting the student, and one next step with a hint rather than the answer. Don't take marks off for spelling unless the meaning is unclear.</li></ul><p><b>Total: ${total} marks.</b></p>`;
}
function markItem(q, i) {
  const n = i + 1, m = qMarks(q);
  switch (q.type) {
    case 'mcq': case 'tap': return `Q${n} (1 mark): ${q.opts[q.a]}.`;
    case 'tick': return `Q${n} (2 marks): ${q.a.map(a => q.opts[a]).join('; ')}. 2 marks for exactly these; 1 mark if one is missing or one extra is ticked; otherwise 0.`;
    case 'match': return `Q${n} (${m} marks, 1 per row): ` + q.rows.map(r => `${r[0]} → ${r[1]}`).join('; ') + '.';
    case 'sort': return `Q${n} (${m} marks, 1 per item): ` + q.groups.map((g, gi) => `${g}: ${q.items.filter(x => x[1] === gi).map(x => plain(x[0])).join(', ')}`).join('. ') + '.';
    case 'num': return `Q${n} (2 marks): ${fmt(q.ans, 2)} ${q.unit} (accept ${fmt(q.ans - (q.tol || 0.15), 2)} to ${fmt(q.ans + (q.tol || 0.15), 2)}). 1 mark for the answer, 1 for correct working: ${q.work}.`;
    case 'gap': return `Q${n} (${m} marks, 1 per gap): ` + q.ans.map((a, k) => `gap ${k + 1}: ${a[0]} (also accept ${gapAccepts(a).filter(w => w !== gapNorm(a[0])).join(', ') || 'any correct scientific word'})`).join('; ') + '.';
    case 'table': return `Q${n} (${m} marks, 1 per cell): ` + q.rows.map(r => `${r[0]}: ${q.cols.map((c, j) => `${c} = ${q.choices[j][r[1][j]]}`).join(', ')}`).join('; ') + '.';
    case 'fbd': return `Q${n} (${m} marks): 1 mark for each correct arrow (right force, right direction, right size): ${q.scen.forces.map(f => `${FTYPES[f.type].name} ${fmt(f.value, 1)} N ${DIRWORD[f.dir]}`).join('; ')}. 1 more mark if bigger forces have longer arrows and equal forces have equal arrows. Arrows should start at the centre of the crate.`;
    case 'explain': return `Q${n} (${m} marks, 1 per point): ${q.check.map(c => '• ' + c).join(' ')} Model answer: ${q.model}`;
  }
  return '';
}
function schemeHTML(chId) {
  const ch = secOf(chId), R = CHDATA[chId].review, total = R.reduce((a, q) => a + qMarks(q), 0);
  return `<div class="hd"><div class="l"><b>FORCE HQ</b></div><div class="r"><div style="font-size:14pt;font-weight:800">Marking scheme</div><div style="font-size:10pt">Chapter ${ch.n} ${ch.part}: ${ch.title} · teacher only</div></div></div>${markingInstructions(`Chapter ${ch.n} ${ch.part}: ${ch.title}`, total)}<h2>Mark scheme</h2>${R.map((q, i) => `<p>${markItem(q, i)}</p>`).join('')}<p><b>Total: ${total} marks.</b></p>`;
}
function schemeText(chId) { const d = h('div', {}, schemeHTML(chId)); return [...d.querySelectorAll('h2,p,li')].map(e => (e.tagName === 'LI' ? '• ' : e.tagName === 'H2' ? '\n' : '') + e.textContent).join('\n'); }

/* ---------- preview + print ---------- */
function openSheet(chId, mode) {
  if ((mode === 'key' || mode === 'scheme') && !unlocked()) { askCode(ok => { if (ok) { closeModal(); openSheet(chId, mode); } }, 'Answer keys and marking schemes are for teachers. Type the teacher code to open them.'); return; }
  const html = mode === 'progress' ? progressHTML() : mode === 'scheme' ? `<div class="ws"><div class="page">${schemeHTML(chId)}</div></div>` : buildWorksheet(chId, mode);
  const back = h('div', { class: 'modalback', style: 'z-index:75' });
  back.innerHTML = `<div class="modal wide" style="max-width:860px"><div class="row" style="justify-content:space-between"><h2>${mode === 'blank' ? 'Blank worksheet' : mode === 'key' ? 'Answer key' : mode === 'scheme' ? 'Marking scheme' : mode === 'progress' ? 'My work so far' : 'My worksheet'}</h2><div class="row"><button type="button" class="go" id="wsPrint">🖨 Print or save as PDF</button><button type="button" class="ghost" id="wsClose">Close</button></div></div>
    <p class="scaleNote">In the print window, choose <b>Save as PDF</b> as the printer, then upload the PDF to Toddle.</p><style>${WS_CSS}</style><div style="border:1px solid var(--line);border-radius:8px;padding:10px;background:#fff;color:#13212a;max-height:70vh;overflow:auto">${html}</div></div>`;
  document.body.appendChild(back);
  $('#wsClose', back).addEventListener('click', () => back.remove()); back.addEventListener('click', e => { if (e.target === back) back.remove(); });
  $('#wsPrint', back).addEventListener('click', () => { const needName = (mode === 'student' || mode === 'progress') && !user().name && !isTeacher(); $('#printArea').innerHTML = `<style>${WS_CSS}</style>` + (needName ? '<div class="ws"><div class="noname">No name, no worksheet!<br><span style="font-size:14pt">Go back and type your name first.</span></div></div>' : html); try { window.print(); } catch (e) { toast('Printing is blocked here. Download the file and open it in a browser to print.'); } });
}
function makeWorksheet(chId) {
  if (!user().name && !isTeacher()) { toast('Type your name first, so your teacher knows whose worksheet it is.'); askWho(false); return; }
  const R = CHDATA[chId].review, st = dbGet('review.' + chId, {}), missing = R.map((q, i) => [q, i]).filter(([q]) => !(st[q.id] && st[q.id].done));
  if (!missing.length) { openSheet(chId, 'student'); return; }
  openModal(`<div class="modal"><h2>Some questions aren't done yet</h2><p>These questions are still to do:</p><div class="row">${missing.map(([q, i]) => `<button type="button" class="ghost sm" data-goq="${q.id}">Go to question ${i + 1}</button>`).join('')}</div><p>You can make your worksheet anyway, but blank questions score 0.</p><div class="row" style="justify-content:space-between"><button type="button" class="ghost" data-close>Go back</button><button type="button" class="go" id="wsAnyway">Make it anyway</button></div></div>`);
  $('#wsAnyway').addEventListener('click', () => { closeModal(); openSheet(chId, 'student'); });
  $$('[data-goq]').forEach(b => b.addEventListener('click', () => { closeModal(); const el = $('#rq-' + b.dataset.goq); if (el) { el.scrollIntoView({ behavior: RMOTION ? 'auto' : 'smooth', block: 'start' }); el.style.outline = '3px solid var(--bad)'; setTimeout(() => el.style.outline = '', 2500); } }));
}
/* Save my work: everything done so far, at any time */
function progressHTML() {
  const u = user(); let out = '';
  SECTIONS.forEach(ch => {
    const chd = CHDATA[ch.id], L = learnProgress(ch.id); if (!L.done && !reviewProgress(ch.id).done && !challengeState(ch.id).tried) return;
    out += `<div class="page">${wsHeader(ch, 'My work so far', 'student')}<h2>Learn: ${L.done} of ${L.total} steps done</h2>`;
    chd.steps.forEach((s, i) => { const qs = (s.qs || []).map(q => [q, dbGet(`learn.${ch.id}.${s.id}.${q.id}`, null)]).filter(([, a]) => a);
      out += `<div class="q"><div class="qh">Step ${i + 1}: ${s.title} <span>${stepDone(ch.id, i) ? '✓ Done' : 'Not finished'}</span></div>${qs.length ? qs.map(([q, a]) => `<p style="margin:2px 0">${plain(q.p)}<br><span class="stu">${q.type === 'desk' || q.type === 'fbd' ? (a.v && a.v.arrows && a.v.arrows.length ? '<div style="max-width:300px">' + FBDB.svg(q.scen, a.v.arrows, { blue: true, noDot: true }) + '</div>' : '') : QT[q.type].show(q, a.v)}</span>${a.ok ? ' ✓' : ''}</p>`).join('') : '<p class="note">No answers yet.</p>'}</div>`; });
    const C2 = challengeState(ch.id); if (CHDATA[ch.id].challenge) out += `<h2>Challenge: ${C2.tried} of ${C2.total} missions tried, ${C2.score} of ${C2.max} objectives</h2>`;
    const P = reviewProgress(ch.id); out += `<h2>Check: ${P.done} of ${P.total} questions answered</h2><p class="note">Use "Make my worksheet" on the Check tab for the full worksheet.</p></div>`;
  });
  const E = dbGet('evidence', []); if (E.length) out += `<div class="page"><h2>Evidence of my learning</h2>${E.map(e => `<p class="stu" style="margin:2px 0">${EVICON[e.kind] || ''} ${esc(e.text)}</p>`).join('')}</div>`;
  return `<div class="ws">${out}</div>`;
}
