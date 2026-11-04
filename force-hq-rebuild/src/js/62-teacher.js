/* ===== Teacher page: set classwork or homework (prompt for Toddle's AI task maker) ===== */
const TPARTS = [['learn', 'Learn steps', 'Work through every guided step: read the cards, do the jobs in the Do this list and answer the Your turn questions.'], ['challenge', 'Challenge (sections that have one)', 'Complete the Challenge missions. Trying every mission is enough to finish.'], ['review', 'Check questions + worksheet', 'Answer every Check question, then press "Make my worksheet" and save it as a PDF.'], ['explore', 'Explore free play', 'Spend some time in Explore, testing your own ideas in the Main Arena.']];
const TMIN = { learn: id => secMins(id).learn, challenge: id => secMins(id).challenge, review: id => secMins(id).review, explore: () => 10 };
function renderTeacher() {
  const T0 = Object.assign({ secs: ['c1f'], opt: ['c1x'], parts: ['learn', 'challenge', 'review'], cls: '', where: 'home', msg: '', bts: [] }, dbGet('teach', {}));
  T0.secs = T0.secs.filter(secOf); T0.opt = (T0.opt || []).filter(secOf); if (!WORKSHOP_OPEN) T0.bts = [];
  $('#vTeacher').innerHTML = `<div class="tpage"><div class="chhead"><div><span class="lbl">For teachers</span><h1>Set classwork or homework</h1></div><button type="button" class="ghost" data-act="home">← Back to the home page</button></div>
    <section class="panel tsec"><h2>1. Choose the sections</h2><p class="scaleNote">Every section takes approx. 20–30 minutes and makes its own worksheet. Tick one for a short task, or several for a longer session. Mark a section as optional to let keen students carry on into it.</p>
      ${SECTIONS.map(c => `<div class="row" style="justify-content:space-between;border-bottom:1px dashed var(--line);padding:4px 0"><label><input type="checkbox" data-sec="${c.id}" ${T0.secs.includes(c.id) || T0.opt.includes(c.id) ? 'checked' : ''}> <span><b>Chapter ${c.n} ${c.part}</b>: ${c.title} · about ${secMins(c.id).total} min</span></label><label><input type="checkbox" data-opt="${c.id}" ${T0.opt.includes(c.id) ? 'checked' : ''}> Optional</label></div>`).join('')}
      <p class="scaleNote">Any new chapters will appear here as they are added.</p>
      ${WORKSHOP_OPEN ? `<h3 style="margin:10px 0 2px">Build tasks (optional, open builds)</h3><p class="scaleNote">Open-ended tasks in <b>Explore › Workshop › Build tasks</b>. Students need Part 4 first. Each makes its own build sheet.</p>
      ${BT.map(b => `<div class="row" style="border-bottom:1px dashed var(--line);padding:4px 0"><label><input type="checkbox" data-bt="${b.id}" ${(T0.bts || []).includes(b.id) ? 'checked' : ''}> <span><b>Build task ${b.id.slice(2)}</b>: ${b.title} · about ${b.mins} min</span></label></div>`).join('')}` : ''}</section>
    <section class="panel tsec"><h2>2. What should students do?</h2>${TPARTS.map(([k, n]) => `<label><input type="checkbox" data-part="${k}" ${T0.parts.includes(k) ? 'checked' : ''}> ${n}</label>`).join('')}</section>
    <section class="panel tsec"><h2>3. Details</h2><label style="flex-direction:column;gap:4px">Class<input type="text" id="tCls" value="${esc(T0.cls)}" placeholder="for example 7/8B" style="font:inherit;padding:6px 8px;border:1.5px solid var(--line);border-radius:8px;max-width:240px;background:var(--panel);color:var(--ink)"></label>
      <div class="row"><b>Where:</b>${[['class', 'In class'], ['home', 'At home'], ['both', 'Both']].map(([k, n]) => `<label><input type="radio" name="tWhere" value="${k}" ${T0.where === k ? 'checked' : ''}> ${n}</label>`).join('')}</div>
      <label style="flex-direction:column;gap:4px">Message to students (optional)<input type="text" id="tMsg" value="${esc(T0.msg)}" style="font:inherit;padding:6px 8px;border:1.5px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink)"></label>
      <p class="scaleNote">Set the due date in Toddle after the task is made.</p></section>
    <section class="panel tsec"><h2>4. Copy into Toddle</h2><p id="tTime"></p><textarea id="tPrompt" readonly></textarea><div class="row"><button type="button" class="go" id="tCopy">Copy instructions</button><span class="scaleNote" id="tCopied"></span></div>
      <p class="scaleNote">Paste this prompt into Toddle's AI task maker, together with the Force HQ file.</p></section>
    <section class="panel tsec"><h2>5. AI feedback instructions (paste into Toddle's AI feedback box)</h2><p class="scaleNote">Toddle's AI feedback can't take attachments, so this text holds everything it needs: how to mark, the MYP levels and a written answer key. Teachers only: students must never see it.</p>
      <div id="tAiBox"></div></section>
    <section class="panel tsec"><h2>6. Printable PDFs (optional)</h2><div class="notebox">Optional: save these if you'd like paper copies or a record. Toddle's AI uses the text in step 5, so nothing needs attaching.<br><b>Blank template</b>, <b>Answer key</b> and <b>Marking scheme</b> each open a preview with a Download PDF button.</div>
      <div id="tFiles"></div>
      <div class="row">${unlocked() ? '<span class="scaleNote">Answer keys are unlocked on this device.</span><button type="button" class="mini" id="tLock">Lock again</button>' : '<span class="scaleNote">🔒 Answer keys and marking schemes need the teacher code.</span><button type="button" class="mini" id="tUnlock">Unlock</button>'}</div></section></div>`;
  const update = () => {
    $$('[data-opt]').forEach(o => { if (o.checked) { const b = $(`[data-sec="${o.dataset.opt}"]`); if (b && !b.checked) b.checked = true; } });
    const ticked = $$('[data-sec]').filter(x => x.checked).map(x => x.dataset.sec), optional = $$('[data-opt]').filter(x => x.checked).map(x => x.dataset.opt), parts = $$('[data-part]').filter(x => x.checked).map(x => x.dataset.part);
    const secs = ticked.filter(x => !optional.includes(x)), opt = ticked.filter(x => optional.includes(x)), bts = $$('[data-bt]').filter(x => x.checked).map(x => x.dataset.bt);
    const T1 = { secs, opt, parts, cls: $('#tCls').value.trim(), where: ($$('[name=tWhere]').find(x => x.checked) || {}).value || 'home', msg: $('#tMsg').value.trim(), bts }; dbSet('teach', T1);
    const mt = list => Math.round(list.reduce((a, s) => a + parts.reduce((b, p) => b + (p === 'challenge' && !CHDATA[s].challenge ? 0 : TMIN[p](s)), 0), 0)), mins = mt(secs) + bts.reduce((a, id) => a + btById(id).mins, 0), omins = mt(opt);
    $('#tTime').innerHTML = `Estimated time: <b>approx. ${mins} minutes</b>${opt.length ? `, plus approx. ${omins} minutes for the optional section${opt.length > 1 ? 's' : ''}` : ''}${mins > 40 && T1.where !== 'class' ? ' (consider splitting it across two evenings)' : ''}.`;
    $('#tPrompt').value = teacherPrompt(T1, mins, omins);
    $('#tFiles').innerHTML = parts.includes('review') ? [...secs, ...opt].map(s => { const ch = secOf(s), tot = CHDATA[s].review.reduce((a, q) => a + qMarks(q), 0); return `<div class="filerow"><b>Chapter ${ch.n} ${ch.part} worksheet · ${tot} marks${opt.includes(s) ? ' (optional)' : ''}</b><button type="button" class="mini" data-file="${s}:blank">Blank template</button><button type="button" class="mini" data-file="${s}:key">${unlocked() ? '' : '🔒 '}Answer key</button><button type="button" class="mini" data-file="${s}:scheme">${unlocked() ? '' : '🔒 '}Marking scheme</button></div>`; }).join('') + bts.map(s => { const ch = secOf(s), tot = CHDATA[s].review.reduce((a, q) => a + qMarks(q), 0); return `<div class="filerow"><b>Build task ${s.slice(2)} build sheet · ${tot} marks</b><button type="button" class="mini" data-file="${s}:blank">Blank template</button><button type="button" class="mini" data-file="${s}:key">${unlocked() ? '' : '🔒 '}Answer key</button><button type="button" class="mini" data-file="${s}:scheme">${unlocked() ? '' : '🔒 '}Marking scheme</button></div>`; }).join('') : '<p class="scaleNote">Tick "Check questions + worksheet" in step 2 to get worksheet files. The other parts have no worksheet.</p>';
    const aiIds = [...secs, ...opt, ...bts];
    if (!parts.includes('review') || !aiIds.length) $('#tAiBox').innerHTML = '<p class="scaleNote">Tick "Check questions + worksheet" in step 2 to get the AI feedback instructions.</p>';
    else if (!unlocked()) $('#tAiBox').innerHTML = '<p class="scaleNote">🔒 The AI feedback instructions contain the answer key and need the teacher code.</p><button type="button" class="mini" id="tAiUnlock">🔒 Unlock</button>';
    else {
      const txt = aiFeedbackText([...secs, ...bts], opt), n = txt.length;
      if (!$('#tAi') || $('#tAi').value !== txt) $('#tAiBox').innerHTML = `<textarea id="tAi" readonly></textarea><div class="row"><button type="button" class="go" id="tAiCopy">Copy AI feedback instructions</button><span class="scaleNote" id="tAiCount"></span><span class="scaleNote" id="tAiCopied"></span></div><p class="scaleNote" id="tAiLong" hidden>This is long. If Toddle cuts it off, set fewer sections in one task.</p>`, $('#tAi').value = txt;
      $('#tAiCount').textContent = n.toLocaleString('en-GB') + ' characters'; $('#tAiLong').hidden = n <= 10000;
    }
  };
  $('#vTeacher').oninput = update; $('#vTeacher').onchange = e => { const sc = e.target.dataset && e.target.dataset.sec && secOf(e.target.dataset.sec); if (sc && sc.optional && e.target.checked) { const o = $(`[data-opt="${sc.id}"]`); if (o) o.checked = true; } update(); };   // an Extension is optional when first ticked
  $('#vTeacher').onclick = e => {
    const f = e.target.closest('[data-file]'); if (f) { const [s, m] = f.dataset.file.split(':'); openSheet(s, m); return; }
    if (e.target.id === 'tCopy') { const t = $('#tPrompt'); try { navigator.clipboard.writeText(t.value).then(() => $('#tCopied').textContent = 'Copied!', () => { t.select(); $('#tCopied').textContent = 'Press Ctrl+C (or ⌘+C) to copy.'; }); } catch (err) { t.select(); $('#tCopied').textContent = 'Press Ctrl+C (or ⌘+C) to copy.'; } }
    if (e.target.id === 'tAiCopy') { const t = $('#tAi'); try { navigator.clipboard.writeText(t.value).then(() => $('#tAiCopied').textContent = 'Copied!', () => { t.select(); $('#tAiCopied').textContent = 'Press Ctrl+C (or ⌘+C) to copy.'; }); } catch (err) { t.select(); $('#tAiCopied').textContent = 'Press Ctrl+C (or ⌘+C) to copy.'; } }
    if (e.target.id === 'tUnlock' || e.target.id === 'tAiUnlock') askCode(ok => { if (ok) { closeModal(); renderTeacher(); } });
    if (e.target.id === 'tLock') { DB.unlocked = false; saveDB(); renderTeacher(); }
  };
  update();
}
function teacherPrompt(T1, mins, omins) {
  const req = T1.secs.map(secOf), opt = (T1.opt || []).map(secOf), parts = T1.parts, bts = (T1.bts || []).filter(isBT), all = [...req, ...opt];
  if ((!all.length && !bts.length) || !parts.length) return 'Tick at least one section and one part to build the instructions.';
  const where = T1.where === 'class' ? 'in class' : T1.where === 'home' ? 'at home' : 'in class and at home';
  const nm = c => `Chapter ${c.n} ${c.part} (${c.title})`;
  const L = [];
  L.push(`Please create a Toddle task for my ${T1.cls || 'Grade 7/8'} science class using Force HQ, an interactive forces simulation (an HTML file I will attach).`);
  const btn = b => `Build task ${b.id.slice(2)} (${b.title})`; L.push(''); L.push(`Task title: Force HQ: ${[...(req.length ? req.map(nm) : opt.map(nm)), ...bts.map(id => btn(BT_SEC[id]))].join(', ')}`);
  L.push(`Estimated time: approx. ${mins || omins} minutes, ${where}.${opt.length && req.length ? ` There is also an optional extra section of approx. ${omins} minutes for students who want to go further.` : ''}`);
  L.push(''); L.push('About the resource: Force HQ is a self-contained simulation. Students open the HTML file in a browser, type their name and class, then work through guided steps in the Force Arenas. Every section makes its own worksheet PDF. Progress saves in the browser, so students should use the same device and browser each time.');
  if (T1.msg) { L.push(''); L.push(`Message from the teacher: ${T1.msg}`); }
  const steps = (c, start) => { let n = start; const out = [`${n++}. On the home page, find Chapter ${c.n} and press "Start ${startWord(c.part)}".`];
    if (parts.includes('learn')) out.push(`${n++}. Learn: work through every step. Read the cards, do the jobs in the Do this list and answer the Your turn questions.`);
    if (parts.includes('challenge') && CHDATA[c.id].challenge) out.push(`${n++}. Challenge: try every mission in "${CHDATA[c.id].challenge.title}". Trying every mission is enough to finish.`);
    if (parts.includes('review')) out.push(`${n++}. Check + worksheet: answer every Check question, then press "Make my worksheet" and choose "Save as PDF".`);
    return [out, n]; };
  L.push(''); L.push('Student instructions:'); let n = 1; L.push(`${n++}. Open the Force HQ file and type your name and class.`);
  (req.length ? req : opt).forEach(c => { const [o, n2] = steps(c, n); L.push(...o); n = n2; });
  bts.forEach(id => { const b = btById(id); L.push(`${n++}. Build task ${id.slice(2)}: on the home page press "Go to Explore", choose "Workshop", then "Build tasks" and Task ${id.slice(2)} ("${b.title}"). Build until every check is green, fill in the results table, answer the questions, then press "Make my build sheet" and choose "Save as PDF". (The Build tasks open when the student finishes Part 4, Compound machines.)`); });
  if (parts.includes('explore')) L.push(`${n++}. Explore: press "Go to Explore" on the home page and test at least two ideas of your own. (Explore opens when you finish the Chapter 1 Foundation. If it isn't open yet, press "Open it anyway".)`);
  L.push(`${n++}. If you need to stop early, press "📄 Save my work" at the top of the page to save what you have done so far as a PDF.`);
  if (req.length && opt.length) { L.push(''); L.push('Optional extra (for students who want to go further):'); let m = 1; opt.forEach(c => { const [o, m2] = steps(c, m); L.push(...o); m = m2; }); L.push('This makes a second worksheet PDF. Upload it too if you do it.'); }
  L.push(''); L.push('What students submit:');
  if (parts.includes('review')) { (req.length ? req : opt).forEach(c => L.push(`- The ${nm(c)} worksheet PDF.`)); if (req.length) opt.forEach(c => L.push(`- Optional: the ${nm(c)} worksheet PDF, if they did the optional section.`)); }
  bts.forEach(id => L.push(`- The ${btn(BT_SEC[id])} build sheet PDF.`));
  if (!parts.includes('review') && !bts.length) L.push('- A PDF from "📄 Save my work" showing their progress.');
  L.push(''); L.push('Learning goals:'); all.forEach(c => L.push(`- ${nm(c)}: ${CHDATA[c.id].goal}`)); bts.forEach(id => L.push(`- ${btn(BT_SEC[id])}: ${CHDATA[id].goal}`));
  L.push(''); L.push('Key vocabulary: ' + [...new Set(all.flatMap(c => CHDATA[c.id].vocab))].join(', ') + '.');
  L.push(''); L.push('Teacher-only notes: g = 9.8 N/kg is used throughout. Answer keys are locked inside the simulation with a teacher code.');
  if (parts.includes('review')) {
    const st = taskStrands([...all.map(c => c.id), ...bts]), crit = k => { const l = st.filter(x => x[0] === k); return l.length ? `Criterion ${k} (strands ${l.map(strandLabel).join(', ')})` : ''; };
    L.push(''); L.push(`MYP objectives: please attach these MYP Year 3 Sciences objectives to the task: ${['A', 'D'].map(crit).filter(Boolean).join(' and ')}.`);
    L.push('AI marking: I will paste the AI feedback instructions, which include a written answer key, into the AI feedback settings separately. Students must never see them.');
    L.push(''); L.push('Marks for each worksheet:');
    all.forEach(c => L.push(`- ${nm(c)} worksheet${opt.includes(c) && req.length ? ' (optional)' : ''}: ${CHDATA[c.id].review.reduce((a, q) => a + qMarks(q), 0)} marks.`)); bts.forEach(id => L.push(`- ${btn(BT_SEC[id])} build sheet: ${CHDATA[id].review.reduce((a, q) => a + qMarks(q), 0)} marks.`)); }
  return L.join('\n');
}
