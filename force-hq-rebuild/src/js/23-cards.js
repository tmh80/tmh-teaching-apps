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
function updateJCount() { const J = dbGet('journal', { order: [] }); $('#jCount').textContent = J.order.length; $$('.jbtn .jc').forEach(e => e.textContent = J.order.length); }
function addEvidence(kind, text) {
  const E = dbGet('evidence', []); if (kind === 'challenge' && E.some(e => e.text === text)) return;
  E.push({ kind, text, at: new Date().toISOString() }); if (E.length > 300) E.splice(0, E.length - 300); dbSet('evidence', E);
}
const EVICON = { maths: '🧮', check: '✅', challenge: '🏆', own: '✏️', review: '📝' };
function openJournal() {
  const J = dbGet('journal', { order: [], entries: {} }), notes = dbGet('jnotes', {}), E = dbGet('evidence', []);
  const groups = {}; J.order.forEach(k => { const e = J.entries[k]; (groups[e.where] = groups[e.where] || []).push(k); });
  const back = h('div', { class: 'modalback', style: 'z-index:71' }); const sid = s => 'jg-' + s.replace(/\W+/g, '-');
  back.innerHTML = `<aside class="journal" role="dialog" aria-modal="true" aria-labelledby="jT"><div class="jtop"><h2 id="jT">📓 My Journal</h2><button type="button" class="go sm" id="jClose">Close</button></div>
    ${J.order.length ? `<nav class="jtoc"><div class="lbl">Contents</div><ul>${Object.keys(groups).map(g => `<li><button type="button" data-jgo="${sid(g)}"><b>${esc(g)}</b> · ${groups[g].length} card${groups[g].length > 1 ? 's' : ''}</button></li>`).join('')}<li><button type="button" data-jgo="jg-evidence"><b>Evidence of my learning</b> · ${E.length}</button></li></ul></nav>` : '<p>Your journal is empty for now. Every information card you read is saved here, along with the maths and questions you get right.</p>'}
    ${Object.keys(groups).map(g => `<section id="${sid(g)}"><h3 style="font-size:22px;margin-top:8px">${esc(g)}</h3>${groups[g].map(k => { const e = J.entries[k]; return `<details class="jent" ${k === J.last ? 'open' : ''}><summary>${esc(e.title)}${notes[k] ? ' <span title="Has my notes">✏️</span>' : ''}</summary><div class="gbody">${e.html}</div><label class="jnote"><span>My notes and questions</span><textarea data-jnote="${k}" rows="2" placeholder="Add your own notes, an example, or a question for your teacher.">${esc(notes[k] || '')}</textarea></label></details>`; }).join('')}</section>`).join('')}
    <section id="jg-evidence"><h3 style="font-size:22px;margin-top:8px">Evidence of my learning</h3>
    ${E.length ? `<ul class="evl">${E.slice().reverse().map(e => `<li>${EVICON[e.kind] || '•'} ${esc(e.text)}<small>${new Date(e.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></li>`).join('')}</ul>` : '<p class="scaleNote">Correct maths, finished questions and challenges will appear here automatically.</p>'}
    <div class="evadd"><textarea id="evOwn" rows="2" placeholder="Add your own evidence, for example: I worked out the weight of a 47 kg crate."></textarea><button type="button" class="ghost sm" id="evAdd" style="margin-top:6px">Add to my evidence</button></div></section></aside>`;
  document.body.appendChild(back);
  const close = () => { back.remove(); document.removeEventListener('keydown', k); }, k = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', k); back.addEventListener('click', e => { if (e.target === back) close(); }); $('#jClose', back).addEventListener('click', close);
  $$('[data-jgo]', back).forEach(b => b.addEventListener('click', () => { const t = $('#' + b.dataset.jgo, back); if (t) t.scrollIntoView({ behavior: RMOTION ? 'auto' : 'smooth' }); }));
  $$('[data-jnote]', back).forEach(t => t.addEventListener('input', () => { const n = dbGet('jnotes', {}); if (t.value.trim()) n[t.dataset.jnote] = t.value; else delete n[t.dataset.jnote]; dbSet('jnotes', n); }));
  $('#evAdd', back).addEventListener('click', () => { const v = $('#evOwn', back).value.trim(); if (!v) return; addEvidence('own', v); close(); openJournal(); });
  JOURNAL_OPENED = true; if (LAB.onChange) LAB.onChange();
  setTimeout(() => $('#jClose', back).focus({ preventScroll: true }), 20);
}
let JOURNAL_OPENED = false;
