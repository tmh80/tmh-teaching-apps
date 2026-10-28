/* ===== Info cards over the arena, "How do I read this?" cards, and the Journal ===== */
let CARDS = null;
function showCards(cards, opt = {}) {
  hideCards(); CARDS = { cards, k: 0, opt }; drawCard();
}
function hideCards() { const ch = $('#chunk'); if (ch) ch.hidden = true; unhi(); CARDS = null; }
function unhi() { $$('.coachhi').forEach(e => e.classList.remove('coachhi')); }
function drawCard() {
  const ch = $('#chunk'); if (!CARDS || !ch) return; const { cards, k, opt } = CARDS, c = cards[k], last = k === cards.length - 1;
  ch.hidden = false; unhi();
  ch.innerHTML = `<div class="chead" title="Drag to move this card"><span class="qgrip" aria-hidden="true">⠿</span><span class="lbl">${esc(opt.title || '')}${cards.length > 1 ? ` · card ${k + 1} of ${cards.length}` : ''}</span><button type="button" class="cx" aria-label="Close these cards">✕</button></div>
    <div class="gbody gl">${c.html}</div>
    <div class="cnav">${k ? '<button type="button" class="ghost" data-cb="back">‹ Back</button>' : ''}<span class="cdots">${cards.map((_, i) => `<i class="${i === k ? 'on' : ''}"></i>`).join('')}</span><button type="button" class="go" data-cb="next">${last ? (opt.journal === false ? 'Got it ✓' : 'Save to my Journal ✓') : 'Next ›'}</button></div>`;
  makeDraggable(ch, '.chead', 'cards'); dragPlace(ch, 'cards', '.chead');
  if (c.hi) $$(c.hi).forEach(e => { if (e.offsetParent) e.classList.add('coachhi'); });
  ch.querySelector('[data-cb=next]').addEventListener('click', () => { if (last) finishCards(); else { CARDS.k++; drawCard(); } });
  const b = ch.querySelector('[data-cb=back]'); if (b) b.addEventListener('click', () => { CARDS.k--; drawCard(); });
  ch.querySelector('.cx').addEventListener('click', () => finishCards());
  if (innerWidth <= 640) ch.scrollIntoView({ block: 'nearest' });
}
function finishCards() {
  if (!CARDS) return; const { cards, opt } = CARDS; hideCards();
  if (opt.journalKey && opt.journal !== false) journalAdd(opt.journalKey, opt.where || '', opt.title || '', cards.map(c => c.html).join(''));
  if (opt.onDone) opt.onDone();
}

/* "How do I read this?" cards, one for every panel. Reachable from the ⓘ buttons in Explore too. */
const INFO = {
  meter: { title: 'How to read a newtonmeter', cards: [{ hi: '#cvScene', html: `<p>Each rope has a ${T('newtonmeter')} built into it, just next to the crate. The number on the label is how hard that team is pulling, in ${T('newton', 'newtons (N)')}.</p><div class="example">An adult pulls with <b>130 N</b>. Add a kid (60 N) to the same team and the label shows <b>190 N</b>, because 130 + 60 = 190.</div>` }] },
  readL: { title: 'How to read the Left pull readout', cards: [{ hi: '[data-panel="readL"]', html: `<p>The <b>Left pull</b> readout shows the same number as the left newtonmeter: the total pull of the whole left team, in newtons.</p><div class="example">Two adults on the left: 130 + 130 = <b>260 N</b>.</div>` }] },
  readR: { title: 'How to read the Right pull readout', cards: [{ hi: '[data-panel="readR"]', html: `<p>The <b>Right pull</b> readout shows the total pull of the right team, in newtons. It matches the right newtonmeter.</p><div class="example">One dog and one kid on the right: 70 + 60 = <b>130 N</b>.</div>` }] },
  readF: { title: 'How to read the Friction readout', cards: [{ hi: '[data-panel="readF"]', html: `<p>The <b>Friction</b> readout shows how big the friction force on the crate is, in newtons. The little arrow shows which way it points.</p><p>Friction always points against the way the crate is moving, or the way it is being pulled.</p><div class="example">If the crate is being pulled to the right, friction shows <b>← to the left</b>.</div>` }] },
  readW: { title: 'How to read the Weight readout', cards: [{ hi: '[data-panel="readW"]', html: `<p>The <b>Weight</b> readout shows the pull of gravity on the crate, in newtons.</p><div class="law"><b>Weight (N) = mass (kg) × 9.8</b></div><div class="example">A 50 kg crate: 50 × 9.8 = <b>490 N</b>.</div>` }] },
  readN: { title: 'How to read the Normal force readout', cards: [{ hi: '[data-panel="readN"]', html: `<p>The <b>Normal force</b> readout shows how hard the floor pushes up on the crate, in newtons.</p><p>On a flat floor, the floor pushes up exactly as hard as the crate's weight pulls down.</p><div class="example">Weight 490 N down, so the normal force is <b>490 N</b> up.</div>` }] },
  readM: { title: 'How to read the Mass readout', cards: [{ hi: '[data-panel="readM"]', html: `<p>The <b>Mass</b> readout shows how much matter is in the crate, in kilograms (kg). Change it with the Crate mass slider.</p>` }] },
  readRes: { title: 'How to read the Resultant force readout', cards: [{ hi: '[data-panel="readRes"]', html: `<p>The <b>Resultant force</b> is what's left when you add up all the forces on the crate. Forces pointing opposite ways cancel out.</p><div class="example">Right 200 N, left 130 N, no friction: 200 − 130 = <b>70 N →</b>. If it says <b>0 N (balanced)</b>, the forces cancel out completely.</div><p>You'll learn all about this in Chapter 3.</p>` }] },
  readAV: { title: 'How to read the Astronaut velocity readout', cards: [{ hi: '[data-panel="readAV"]', html: `<p>The <b>Astronaut velocity</b> readout shows how fast the astronaut is going, in metres per second (m/s). A minus sign means they are going to the left, away from the dock.</p>` }] },
  readAM: { title: 'How to read the Astronaut mass readout', cards: [{ hi: '[data-panel="readAM"]', html: `<p>The <b>Astronaut mass</b> readout shows how much matter is in the astronaut and their suit, in kilograms (kg).</p>` }] },
  astro: { title: 'How to change the astronaut\'s mass', cards: [{ hi: '[data-panel="astro"]', html: `<p>Use the <b>Astronaut mass</b> slider, or type a number in the box, to change how heavy the astronaut and suit are. The force on the astronaut stays the same size. Only the acceleration changes.</p>` }] },
  pushf: { title: 'How to set the push force', cards: [{ hi: '[data-panel="pushf"]', html: `<p>The <b>Push force</b> is how hard the astronaut pushes the pod, in newtons (N). Use the slider, or type a number in the box. Each push lasts exactly <b>1 second</b>.</p><div class="example">A 100 N push on a 50 kg pod gives it a speed of 100 ÷ 50 = 2 m/s.</div>` }] },
  thrust: { title: 'How to use the thrusters', cards: [{ hi: '[data-panel="thrust"]', html: `<p>Each press fires a burst of <b>50 N</b> for 1 second on the pod. <b>Speed up ▶</b> pushes the pod towards the dock. <b>◀ Slow down</b> pushes it back the other way.</p><p>The thrusters push the pod only. The astronaut is not affected.</p>` }] },
  pairs: { title: 'How to read the force pair arrows', cards: [{ hi: '#cvScene', html: `<p>Pair arrows join up in matching colours. Each pair has two arrows of exactly the same length, pointing in opposite directions, and each one acts on a <b>different object</b>.</p><p>Tick or untick <b>Show the force pairs</b> to switch them on and off.</p>` }] },
  warp: { title: 'What does ×8 time do?', cards: [{ hi: '[data-panel="warp"]', html: `<p>The <b>×8 time</b> button makes the Space Dome run eight times faster, so slow pushes do not take ages. Every number stays exactly the same.</p>` }] },
  readA: { title: 'How to read the Acceleration readout', cards: [{ hi: '[data-panel="readA"]', html: `<p>The <b>Acceleration</b> readout shows how quickly the crate's speed is changing, in metres per second squared (m/s²). Zero means the speed isn't changing.</p><p>You'll use it in Chapter 3.</p>` }] },
  readV: { title: 'How to read the Velocity readout', cards: [{ hi: '[data-panel="readV"]', html: `<p>The <b>Velocity</b> readout shows how fast the crate is moving, in metres per second (m/s). A minus sign means it is moving to the left.</p>` }] },
  readD: { title: 'How to read the Braking distance readout', cards: [{ hi: '[data-panel="readD"]', html: `<p>The <b>Braking distance</b> readout shows how far the crate has slid since it crossed the red brake line, in metres (m). When the crate stops, the number stops changing.</p><div class="example">The crate crosses the brake line and stops 1.92 m later, so the readout shows <b>1.92 m</b>.</div>` }] },
  brake: { title: 'How the brake works', cards: [{ hi: '[data-panel="brake"]', html: `<p>When the crate crosses the red <b>brake line</b>, the brake pushes back against it with the force on the slider, in newtons. It keeps pushing until the crate stops, then lets go.</p><p>Drag the slider, or use <b>−1 N</b> and <b>+1 N</b> for small changes. A bigger brake force stops the crate in a shorter distance.</p>` }] },
  vt: { title: 'How to read a velocity–time graph', cards: [{ hi: '[data-panel="vt"]', html: `<p>The graph shows the crate's <b>velocity</b> (speed) up the side, in m/s, and the <b>time</b> along the bottom, in seconds. The line draws itself as the crate moves.</p><div class="example">To read a speed, find the point on the line, then look straight across to the numbers on the left. A line halfway between 1 and 1.5 means about <b>1.25 m/s</b>.</div><p>A <b>flat</b> line means a steady speed. A line sloping <b>down</b> means slowing down. A line along <b>0</b> means the crate isn't moving.</p>` }] },
  fbd: { title: 'How to read a free-body diagram', cards: [
    { hi: '[data-panel="fbd"]', html: `<p>A ${T('fbd')} shows every force on <b>one object</b>. Here, the object is the crate.</p><p>Each force is an arrow. Every arrow starts from the <b>centre</b> of the crate.</p>` },
    { hi: '[data-panel="fbd"]', html: `<p>The <b>direction</b> of an arrow shows which way the force acts.</p><p>The <b>length</b> of an arrow shows how big the force is. A force twice as big gets an arrow twice as long.</p><div class="example">The scale under the diagram tells you how many newtons each grid square stands for.</div>` }] },
  floor: { title: 'How to use the floor buttons', cards: [{ hi: '[data-panel="floor"]', html: `<p>Each floor button changes the surface under the crate. The μ number (say "mew") is the ${T('mu')}. A bigger μ means a grippier floor and more friction.</p><div class="example">The air floor has μ = 0, so there is no friction at all. Rough concrete has μ = 0.4, so there is lots.</div>` }] },
  pal: { title: 'How to add pullers', cards: [{ hi: '[data-panel="pal"]', html: `<p>Drag a puller from the column onto the arena. Drop them on the <b>left</b> of the crate and they join the left team. Drop them on the <b>right</b> and they join the right team.</p><p>To send someone back, drag them off the arena or just tap them. You can also drag someone across the middle to swap teams.</p>` }] }
};
function showInfo(k) { const I = INFO[k]; if (!I) return; showCards(I.cards, { title: I.title, journalKey: 'info:' + k, where: 'How to read the arena' }); }

/* ---------------- Journal ---------------- */
function journalAdd(key, where, title, html) {
  const J = dbGet('journal', { order: [], entries: {} }); if (!J.entries[key]) J.order.push(key);
  J.entries[key] = { where, title, html, at: Date.now() }; J.last = key; dbSet('journal', J); updateJCount();
}
function updateJCount() { const J = dbGet('journal', { order: [] }); $('#jCount').textContent = J.order.length; $$('.jbtn .jc, .jtab .jc').forEach(e => e.textContent = J.order.length); }
function addEvidence(kind, text) {
  const E = dbGet('evidence', []); if (kind === 'challenge' && E.some(e => e.text === text)) return;
  E.push({ kind, text, at: new Date().toISOString() }); if (E.length > 300) E.splice(0, E.length - 300); dbSet('evidence', E);
}
const EVICON = { maths: '🧮', check: '✅', challenge: '🏆', own: '✏️', review: '📝' };
function vocabHTML() {
  const V = dbGet('vocab', {}), ks = Object.keys(V).filter(k => TERMS[k]).sort((a, b) => TERMS[a][0].localeCompare(TERMS[b][0]));
  if (!ks.length) return '<p class="scaleNote">Words with a dotted line under them are key vocabulary. Each one you meet in Force HQ is added here, with what it means.</p>';
  return `<p class="scaleNote">${ks.length} key word${ks.length > 1 ? 's' : ''} you have met so far, in A to Z order. Words with a dotted line under them are added here when you meet them.</p>
    <input type="search" class="vsearch" id="vSearch" placeholder="Find a word…" aria-label="Find a word">
    <dl class="vocab">${ks.map(k => `<div class="vitem" data-v="${esc(TERMS[k][0].toLowerCase())}"><dt>${esc(TERMS[k][0])}</dt><dd>${esc(TERMS[k][1])}${V[k].where ? `<small>First met: ${esc(V[k].where)}</small>` : ''}</dd></div>`).join('')}</dl>`;
}
/* The Journal: a side panel beside the arena with three tabs.
   Runs: every push, pull and launch (this step's runs open, earlier ones folded). Notes: the saved info cards
   with the student's own notes, plus evidence of learning. Vocab: every key word met so far. */
let JTAB = 'runs', JRUNS_SEEN = false;
function openJournal(tab) {
  if (tab) JTAB = tab; const p = $('#journal'); if (!p) return;
  p.hidden = false; document.body.classList.add('jopen'); jTabAria(true); renderJournal();
  JOURNAL_OPENED = true; if (JTAB === 'runs') JRUNS_SEEN = true; if (LAB.onChange) LAB.onChange();
  setTimeout(() => { const c = $('#jClose'); if (c) c.focus({ preventScroll: true }); }, 20);
}
function closeJournal() { const p = $('#journal'); if (!p || p.hidden) return; p.hidden = true; document.body.classList.remove('jopen'); jTabAria(false); }
function jTabAria(on) { $$('[data-journal]').forEach(b => b.setAttribute('aria-expanded', on ? 'true' : 'false')); }
const journalOpen = () => { const p = $('#journal'); return !!(p && !p.hidden); };
/* The Working tab: free space for a student to show their working, plus the calculations saved from the calculator.
   DB.jwork = { pads: { 'c4f:f5': { text, where, title, at } }, calcs: [{ id, expr, res, note, where, title, at }] } */
function workCtx() {
  if (typeof CH !== 'undefined' && CH && VIEW === 'vChapter') {
    const chd = CHDATA[CH.id], where = `Chapter ${CH.n}: ${CH.title}`;
    if (CTAB === 'learn' && chd.steps[GI]) return { key: CH.id + ':' + chd.steps[GI].id, where, title: chd.steps[GI].title };
    return { key: CH.id + ':' + CTAB, where, title: CTAB === 'challenge' ? 'The Challenge' : CTAB === 'review' ? 'The Check' : 'Chapter ' + CH.n };
  }
  return { key: 'general', where: 'Anywhere in Force HQ', title: 'Free space' };
}
const workGet = () => { const w = dbGet('jwork', null) || {}; w.pads = w.pads || {}; w.calcs = w.calcs || []; return w; };
function saveCalc(expr, res, note) {
  const w = workGet(), c = workCtx(); w.calcs.push({ id: Date.now() + '' + w.calcs.length, expr, res, note: note || '', where: c.where, title: c.title, at: Date.now() }); dbSet('jwork', w);
  updateWorkCount(); if (journalOpen()) renderJournal();
}
const workCount = () => { const w = workGet(); return w.calcs.length + Object.keys(w.pads).filter(k => (w.pads[k].text || '').trim()).length; };
function updateWorkCount() { const n = $('#journal [data-jtab="work"] span'); if (n) n.textContent = workCount(); }
function workTabHTML() {
  const w = workGet(), c = workCtx(), pad = w.pads[c.key], others = Object.keys(w.pads).filter(k => k !== c.key && (w.pads[k].text || '').trim());
  return `<p class="scaleNote">Show your working here. Write the formula, put in the numbers, work out the answer, then write the unit. Writing it down helps you spot mistakes.</p>
    <section><h3 class="jh3">My working: ${esc(c.title)}</h3><textarea class="workpad" id="workPad" rows="8" aria-label="My working for ${esc(c.title)}" placeholder="For example:&#10;speed = force ÷ mass&#10;speed = 150 ÷ 250&#10;speed = 0.6 m/s">${esc(pad ? pad.text : '')}</textarea><p class="scaleNote">Saved as you type. ${esc(c.where)}.</p></section>
    <section><h3 class="jh3">Calculations I saved</h3>${w.calcs.length ? `<ul class="calcl">${w.calcs.slice().reverse().map(k => `<li><code>${esc(k.expr)} = ${esc(k.res)}</code>${k.note ? `<div>${esc(k.note)}</div>` : ''}<small>${esc(k.where)} · ${esc(k.title)}</small><button type="button" class="mini" data-workdel="${esc(k.id)}" aria-label="Remove this calculation">✕</button></li>`).join('')}</ul>` : '<p class="scaleNote">Open the calculator 🧮, work something out, then press <b>Save to Journal</b>. It is kept here with your working.</p>'}</section>
    ${others.length ? `<section><h3 class="jh3">Working from other steps</h3>${others.map(k => `<details class="jent"><summary>${esc(w.pads[k].title)} <small>${esc(w.pads[k].where)}</small></summary><textarea class="workpad" data-workkey="${esc(k)}" rows="5" aria-label="My working for ${esc(w.pads[k].title)}">${esc(w.pads[k].text)}</textarea></details>`).join('')}</section>` : ''}`;
}
function journalNotesHTML() {
  const J = dbGet('journal', { order: [], entries: {} }), notes = dbGet('jnotes', {}), E = dbGet('evidence', []);
  const groups = {}; J.order.forEach(k => { const e = J.entries[k]; (groups[e.where] = groups[e.where] || []).push(k); });
  return (J.order.length ? Object.keys(groups).map(g => `<section><h3 class="jh3">${esc(g)}</h3>${groups[g].map(k => { const e = J.entries[k]; return `<details class="jent" ${k === J.last ? 'open' : ''}><summary>${esc(e.title)}${notes[k] ? ' <span title="Has my notes">✏️</span>' : ''}</summary><div class="gbody">${e.html}</div><label class="jnote"><span>My notes and questions</span><textarea data-jnote="${k}" rows="2" placeholder="Add your own notes, an example, or a question for your teacher.">${esc(notes[k] || '')}</textarea></label></details>`; }).join('')}</section>`).join('')
    : '<p class="scaleNote">Every information card you read is saved here, so you can read it again and add your own notes.</p>')
    + `<section><h3 class="jh3">Evidence of my learning</h3>${E.length ? `<ul class="evl">${E.slice().reverse().map(e => `<li>${EVICON[e.kind] || '•'} ${esc(e.text)}<small>${new Date(e.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></li>`).join('')}</ul>` : '<p class="scaleNote">Correct maths, finished questions and challenges will appear here automatically.</p>'}
      <div class="evadd"><textarea id="evOwn" rows="2" placeholder="Add your own evidence, for example: I worked out the weight of a 47 kg crate."></textarea><button type="button" class="ghost sm" id="evAdd" style="margin-top:6px">Add to my evidence</button></div></section>`;
}
function renderJournal() {
  const p = $('#journal'); if (!p || p.hidden) return;
  const nR = runsAll().length, nV = Object.keys(dbGet('vocab', {})).filter(k => TERMS[k]).length, nN = dbGet('journal', { order: [] }).order.length;
  const sc = $('.jbody', p) ? $('.jbody', p).scrollTop : 0, same = p.dataset.tab === JTAB;
  p.innerHTML = `<div class="jtop"><h2 id="jT">📓 My Journal</h2><button type="button" class="go sm" id="jClose">Close</button></div>
    <div class="jtabs" role="tablist" aria-label="Journal sections">${[['runs', '📋 Runs', nR], ['work', '✍️ Working', workCount()], ['notes', '📝 Notes', nN], ['vocab', '🔤 Vocab', nV]].map(([k, t, n]) => `<button type="button" role="tab" data-jtab="${k}" aria-selected="${JTAB === k}">${t}<span>${n}</span></button>`).join('')}</div>
    <div class="jbody">${JTAB === 'runs' ? runsTabHTML() : JTAB === 'work' ? workTabHTML() : JTAB === 'notes' ? journalNotesHTML() : `<h3 class="jh3">Key vocabulary</h3>${vocabHTML()}`}</div>`;
  p.dataset.tab = JTAB; if (same) $('.jbody', p).scrollTop = sc;
  $$('[data-jnote]', p).forEach(t => t.addEventListener('input', () => { const n = dbGet('jnotes', {}); if (t.value.trim()) n[t.dataset.jnote] = t.value; else delete n[t.dataset.jnote]; dbSet('jnotes', n); }));
  $$('.workpad', p).forEach(t => t.addEventListener('input', () => { const w = workGet(), c = workCtx(), k = t.dataset.workkey || c.key, prev = w.pads[k] || {}; if (t.value.trim()) w.pads[k] = { text: t.value, where: prev.where || c.where, title: prev.title || c.title, at: Date.now() }; else delete w.pads[k]; dbSet('jwork', w); updateWorkCount(); }));
  const vs = $('#vSearch', p); if (vs) vs.addEventListener('input', () => { const q = vs.value.trim().toLowerCase(); $$('.vitem', p).forEach(it => it.hidden = q && !it.dataset.v.includes(q) && !it.textContent.toLowerCase().includes(q)); });
  const ea = $('#evAdd', p); if (ea) ea.addEventListener('click', () => { const v = $('#evOwn', p).value.trim(); if (!v) return; addEvidence('own', v); renderJournal(); });
  $$('details.run', p).forEach(d => d.addEventListener('toggle', () => { RUNOPEN[d.dataset.run] = d.open; }));
}
function initJournal() {
  const p = h('aside', { class: 'journal', id: 'journal', hidden: '', 'aria-label': 'My Journal' }); document.body.appendChild(p);
  document.body.appendChild(h('button', { type: 'button', class: 'jtab', 'data-journal': '', 'aria-controls': 'journal', 'aria-expanded': 'false', title: 'Open or close your Journal' }, `<span class="jtl">📓 Journal</span>`));
  document.addEventListener('click', e => {
    if (e.target.closest('#jClose')) { closeJournal(); return; }
    const t = e.target.closest('[data-jtab]'); if (t) { JTAB = t.dataset.jtab; if (JTAB === 'runs') JRUNS_SEEN = true; renderJournal(); if (LAB.onChange) LAB.onChange(); return; }
    const wd = e.target.closest('[data-workdel]'); if (wd) { const w = workGet(); w.calcs = w.calcs.filter(k => k.id !== wd.dataset.workdel); dbSet('jwork', w); renderJournal(); return; }
    if (e.target.closest('[data-runs]')) { openJournal('runs'); return; }
  });
}
let JOURNAL_OPENED = false;
