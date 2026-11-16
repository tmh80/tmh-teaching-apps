/* ===== Key vocabulary flashcards: index cards, five spaced boxes =====
   The student ticks the topics they have covered; those words go into their deck. Each card comes back after 1, 3, 7, 14 or 28 days (same rules as
   Sparks Through Time). Everything is saved in DB.fc = { topics: ['c1f', ...], cards: { key: { box, due, seen, got, miss } }, last: 'YYYY-MM-DD', goes: n },
   so the 💾 Save progress backup carries it automatically. Pictures come from fcArt(key) (64-fcart-*.js). Full spec: docs/Flashcards_Spec.md. */
const FC_TOPICS = {
  c1f: ['force', 'push', 'pull', 'newton', 'newtonmeter', 'resultant', 'balanced', 'unbalanced', 'friction', 'weight', 'mass', 'gravity', 'normal', 'tension', 'airres', 'contact', 'noncontact', 'magnetic'],
  c1x: ['fbd', 'arrow', 'scale', 'weight', 'normal', 'friction', 'tension'],
  c2f: ['inertia', 'velocity', 'vtgraph', 'brake', 'brakingdist', 'newton1', 'unbalanced', 'mass'],
  c2x: ['vtgraph', 'brakingdist', 'slope', 'newton1', 'fbd'],
  c3f: ['acceleration', 'mps2', 'newton2', 'triangle', 'unit', 'resultant', 'mass', 'friction'],
  c3x: ['slope', 'vtgraph', 'acceleration', 'newton2'],
  c4f: ['newton3', 'forcepair', 'action', 'reaction', 'thrust', 'force', 'mass', 'acceleration'],
  c4x: ['thruster', 'thrust', 'forcepair', 'newton3', 'newton1'],
  c5f: ['airres', 'terminal', 'parachute', 'canopy', 'drag', 'weight', 'balanced', 'resultant'],
  c5x: ['gfs', 'vacuum', 'lift', 'hover', 'terminal', 'parachute'],
  c6a: ['machine', 'lever', 'fulcrum', 'effort', 'load', 'effortarm', 'loadarm'],
  c6b: ['pulley', 'supporting', 'wheelaxle', 'winch', 'incline', 'wedge', 'screw', 'pitch'],
  c6c: ['mechadv', 'work', 'joule'],
  c6d: ['compound', 'simplemach', 'mechadv'],
  c6e: ['weight', 'gfs', 'mechadv', 'compound', 'work'],
  c6f: ['efficiency', 'wasted', 'lubricant', 'friction']
};
const FC_DAYS = [1, 3, 7, 14, 28];
const FC_BOXNAMES = ['Every day', 'Every 3 days', 'Every week', 'Every 2 weeks', 'Every 4 weeks'];
const FC_MAXGO = 20, FC_MAXNEW = 10;
let FC_NOW = null;   // the tests set this to pretend it is another day
const FCV = { mode: 'home', go: null, deckFlip: {} };

/* ---------- dates: local calendar days as 'YYYY-MM-DD' (same helpers as Sparks) ---------- */
const fcYmd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const fcToday = () => FC_NOW || fcYmd(new Date());
const fcAdd = (ymd, n) => { const p = ymd.split('-').map(Number); return fcYmd(new Date(p[0], p[1] - 1, p[2] + n)); };
const fcDiff = (a, b) => { const x = a.split('-').map(Number), y = b.split('-').map(Number); return Math.round((Date.UTC(y[0], y[1] - 1, y[2]) - Date.UTC(x[0], x[1] - 1, x[2])) / 864e5); };
const fcNice = ymd => { const p = ymd.split('-').map(Number); return p[2] + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][p[1] - 1]; };
const fcPlural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

/* ---------- saved data (every read tolerates missing or odd data) ---------- */
function fcData() {
  const d = dbGet('fc', null), o = d && typeof d === 'object' ? d : {};
  return { topics: Array.isArray(o.topics) ? o.topics.filter(t => FC_TOPICS[t]) : [], cards: o.cards && typeof o.cards === 'object' ? o.cards : {}, last: typeof o.last === 'string' ? o.last : '', goes: +o.goes || 0 };
}
const fcSave = d => dbSet('fc', d);
/* the sections that have a topic (Chapter 6 only once the Workshop is open) */
const fcSections = () => SECTIONS.filter(s => FC_TOPICS[s.id] && (CHAPTERS.find(c => c.id === s.ch) || {}).ready);
function fcTag(secId) { const s = SECTIONS.find(x => x.id === secId); if (!s) return ''; const c = CHAPTERS.find(x => x.id === s.ch); return 'Ch ' + s.n + ' · ' + (s.ch === 'c6' ? s.title : (c ? c.title : s.title)); }
/* the cards in the deck, in topic order: [{ key, tag }]. A word in two ticked topics is one card. */
function fcDeck(topics) {
  const seen = new Set(), out = [];
  Object.keys(FC_TOPICS).forEach(t => {
    if (!topics.includes(t)) return;
    FC_TOPICS[t].forEach(k => {
      if (seen.has(k)) return;
      if (!TERMS[k]) { if (window.__fhq) console.warn('flashcards: no glossary word for', k); return; }
      seen.add(k); out.push({ key: k, tag: fcTag(t) });
    });
  });
  return out;
}
const fcBoxOf = (cards, k) => (cards[k] && cards[k].box) || 0;
const fcIsDue = (cards, k, today) => { const st = cards[k]; return !st || !st.due || st.due <= today; };
function fcStats() {
  const D = fcData(), deck = fcDeck(D.topics), today = fcToday(), box = [0, 0, 0, 0, 0, 0];
  let due = 0, fresh = 0, next = '';
  deck.forEach(c => {
    const b = Math.min(5, fcBoxOf(D.cards, c.key)); box[b]++;
    const st = D.cards[c.key];
    if (!(st && st.seen)) fresh++;                           // never practised: "new"
    else if (fcIsDue(D.cards, c.key, today)) due++;          // "due" means cards seen before
    else if (!next || st.due < next) next = st.due;
  });
  return { D, deck, due, fresh, box, next, today };
}

/* ---------- the cards: what the front and back show ---------- */
const fcReverse = (cards, k) => fcBoxOf(cards, k) >= 3;
const fcRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* the meaning with the word itself (and its aliases) hidden as ____ */
function fcMask(key) {
  const t = TERMS[key], names = new Set([t[0], t[0].replace(/\s*\([^)]*\)/g, '').trim(), ...(t[2] || [])].filter(x => x && x.length >= 3));
  const words = [...names].sort((a, b) => b.length - a.length).map(fcRe).join('|');
  if (!words) return t[1];
  return t[1].replace(new RegExp('(^|[^A-Za-z])(' + words + ')(?:s|es)?(?![A-Za-z])', 'gi'), (m, pre) => pre + '____');
}
const fcPic = key => fcArt(key) || '<div class="fc-ph"><span>✏️</span>picture coming soon</div>';
const fcLong = s => s.length > 140 ? ' long' : '';
/* a card face. kind: 'front' | 'back'. rev: the card is asked the other way round. */
function fcFace(key, tag, kind, rev, o = {}) {
  const t = TERMS[key], word = esc(t[0]), meaning = esc(t[1]);
  const ask = kind === 'front' ? (rev ? '' : 'What does this word mean?') : (rev ? 'The word is…' : 'It means…');
  const head = `<div class="fc-head"><span class="fc-tag">${esc(tag || '')}</span><span class="fc-ask">${ask}</span></div>`;
  let body;
  if (kind === 'front' && o.mini) body = `<div class="fc-text"><p class="fc-word">${word}</p></div>`;
  else if (kind === 'front') {
    const pic = `<div class="fc-pic clue" hidden>${fcPic(key)}</div>`;
    const write = `<textarea class="fc-write" rows="2" placeholder="${rev ? 'Write the word you think it is…' : 'Write what you think it means…'}" aria-label="${rev ? 'Write the word you think it is (optional)' : 'Write what you think it means (optional)'}" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>`;
    body = rev
      ? `<div class="fc-text"><p class="fc-mean${fcLong(t[1])}">${esc(fcMask(key))}</p><p class="fc-q">Which word is this?</p>${write}</div>${pic}`
      : `<div class="fc-text"><p class="fc-word">${word}</p>${write}</div>${pic}`;
  } else {
    body = (rev ? `<div class="fc-text"><p class="fc-word">${word}</p><p class="fc-mean${fcLong(t[1])}">${meaning}</p><p class="fc-mine" hidden></p></div>`
      : `<div class="fc-text"><p class="fc-mean${fcLong(t[1])}">${meaning}</p><p class="fc-mine" hidden></p></div>`) + `<div class="fc-pic">${fcPic(key)}</div>`;
  }
  return `<div class="fc-face ${kind}" ${o.hidden ? 'inert aria-hidden="true"' : ''}>${head}<div class="fc-body">${body}</div></div>`;
}
const fcCard = (key, tag, rev) => `<div class="fc-flip" id="fcFlip">${fcFace(key, tag, 'front', rev)}${fcFace(key, tag, 'back', rev, { hidden: true })}</div>`;

/* ---------- starting a go ---------- */
function fcPick(practiseAnyway) {
  const S = fcStats(), today = S.today, C = S.D.cards;
  let cards;
  if (practiseAnyway) cards = S.deck.slice().sort((a, b) => ((C[a.key] || {}).due || '') < ((C[b.key] || {}).due || '') ? -1 : 1).slice(0, FC_MAXGO);
  else {
    const old = S.deck.filter(c => C[c.key] && C[c.key].seen && fcIsDue(C, c.key, today)).sort((a, b) => C[a.key].due < C[b.key].due ? -1 : C[a.key].due > C[b.key].due ? 1 : 0);
    const fresh = S.deck.filter(c => !(C[c.key] && C[c.key].seen)).slice(0, FC_MAXNEW);
    cards = old.concat(fresh).slice(0, FC_MAXGO);
  }
  return cards;
}
/* mode: 'due' (normal) or 'anyway' (nothing is due: Got it leaves the schedule alone, Not yet still sends the card back to box 1) */
function fcStartGo(mode) {
  fcUntoast(); const picked = fcPick(mode === 'anyway');
  if (!picked.length) { toast('Tick a topic first. Its words go into your deck.'); return null; }
  FCV.go = { mode: mode === 'anyway' ? 'anyway' : 'due', tags: Object.fromEntries(picked.map(c => [c.key, c.tag])), queue: picked.map(c => c.key), total: picked.length, done: 0, missed: new Set(), finished: [], typed: '', flipped: false, pos: 0, counted: false };
  FCV.mode = 'go'; fcRender(); return FCV.go;
}
/* "25 new cards waiting · 3 cards due today" (due = cards you have seen before) */
const fcWaiting = S => [S.fresh ? fcPlural(S.fresh, 'new card') + ' waiting' : '', S.due ? fcPlural(S.due, 'card') + ' due today' : ''].filter(Boolean).join(' · ') || 'nothing due today';
const fcUntoast = () => { try { clearTimeout(toastTimer); $('#toast').className = 'toast'; } catch (e) { } };
function fcBadge() {
  const b = $('#fcTopBtn .fcbadge'); if (!b) return; const S = fcStats();
  b.hidden = !S.due; b.textContent = S.due; $('#fcTopBtn').setAttribute('aria-label', S.due ? 'Flashcards: ' + fcPlural(S.due, 'card') + ' due today' : 'Flashcards');
}
const fcCur = () => FCV.go && FCV.go.queue[0];

/* mark the answer: got = true / false. Returns what happened (the tests read it). */
function fcAnswer(got) {
  const g = FCV.go; if (!g || !g.queue.length) return null;
  const key = g.queue.shift(), D = fcData(), today = fcToday(), st = D.cards[key] || { box: 0, due: today, seen: 0, got: 0, miss: 0 };
  st.seen = (st.seen || 0) + 1;
  if (got) {
    st.got = (st.got || 0) + 1;
    if (g.mode === 'anyway') { /* extra practice: the schedule stays as it was */ if (!st.box) { st.box = 1; st.due = fcAdd(today, FC_DAYS[0]); } }
    else if (g.missed.has(key)) { st.box = 1; st.due = fcAdd(today, FC_DAYS[0]); }
    else { st.box = Math.min(5, (st.box || 0) + 1); st.due = fcAdd(today, FC_DAYS[st.box - 1]); }
    g.done++; g.finished.push(key);
  } else {
    st.miss = (st.miss || 0) + 1; st.box = 1; st.due = today; g.missed.add(key);
    g.queue.splice(Math.min(g.queue.length, 6), 0, key);
  }
  D.cards[key] = st; D.last = today; if (!g.counted) { g.counted = true; D.goes++; }
  fcSave(D);
  g.typed = ''; g.flipped = false; g.pos++;
  if (!g.queue.length) FCV.mode = 'end';
  fcRender();
  return { key, box: st.box, due: st.due, left: g.queue.length };
}

/* ---------- drawing ---------- */
function fcRender() {
  const host = $('#fcHost'); if (!host) return;
  host.innerHTML = FCV.mode === 'go' && FCV.go ? fcGoHTML() : FCV.mode === 'end' && FCV.go ? fcEndHTML() : FCV.mode === 'deck' ? fcDeckHTML() : fcHomeHTML();
  if (FCV.mode === 'go') fcWire();
  $('#crumb').textContent = 'Flashcards'; fcBadge();
}
function fcOpen() {
  if (typeof hideCards === 'function') hideCards(); if (typeof closeDesk === 'function') closeDesk(); if (typeof closeJournal === 'function') closeJournal();
  parkLab(); FCV.mode = 'home'; FCV.go = null; show('vCards');
}

function fcHomeHTML() {
  const S = fcStats(), stamps = dbGet('stamps', {}), secs = fcSections(), ticked = new Set(S.D.topics), has = S.deck.length;
  const chs = CHAPTERS.filter(c => secs.some(s => s.ch === c.id));
  const tiles = chs.map(c => `<div class="fc-chap"><h3>Chapter ${c.n} · ${esc(c.title)}</h3><div class="fc-tiles">${secs.filter(s => s.ch === c.id).map(s => {
    const on = ticked.has(s.id), n = fcDeck([s.id]).length;
    return `<button type="button" class="fc-tile${on ? ' on' : ''}" role="checkbox" aria-checked="${on}" data-fc="tick" data-id="${s.id}"><span class="fc-box" aria-hidden="true">${on ? '<svg viewBox="0 0 30 30"><path d="M5 16l7 7L25 6" fill="none" stroke="#2a7d48" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</span><span class="fc-tt"><b>${esc(s.part)}${s.ch === 'c6' ? ': ' + esc(s.title) : ''}</b><small>${fcPlural(n, 'word')}</small>${stamps[s.id] ? '<em>✓ You finished this section</em>' : ''}</span></button>`;
  }).join('')}</div></div>`).join('');
  const boxes = [['New', 0, 'In your deck, not practised yet']].concat(FC_BOXNAMES.map((n, i) => [n, i + 1, 'Box ' + (i + 1)])).map(([n, i, sub]) => `<div class="fc-bx b${i}"><div class="fc-peek" aria-hidden="true"></div><div class="fc-bxf"><div class="fc-lab"><span class="fc-bn">${n}</span><b>${S.box[i]}</b></div></div></div>`).join('');
  let startBtn;
  const goN = fcPick(false).length;
  if (!has) startBtn = `<button type="button" class="go big fc-soft" data-fc="nostart" aria-disabled="true">Tick a topic to start</button>`;
  else if (goN) startBtn = `<button type="button" class="go big" data-fc="start">Start: ${fcPlural(goN, 'card')}</button>`;
  else startBtn = `<button type="button" class="ghost big" data-fc="anyway">Nothing due today. Practise anyway?</button>`;
  const line = has ? `${fcPlural(has, 'card')} in your deck · ${fcWaiting(S)}` : 'Your deck is empty. Tick a topic above to fill it.';
  const note2 = has && !S.due && !S.fresh ? `<p class="fc-ok">Nothing is due today. You are completely up to date!${S.next ? ' Your next cards come back on ' + fcNice(S.next) + '.' : ''}</p>` : '';
  return `<div class="fc fc-page noglos">
    <div class="chhead"><div><span class="lbl">Vocabulary</span><h1>My flashcards</h1></div></div>
    <p class="fc-note"><span>Tick the topics you have covered. Their words go into your deck, and each card comes back just when your brain is about to forget it.</span></p>
    <section class="panel fc-sec" aria-labelledby="fcH1"><h2 id="fcH1" class="fc-h">Topics you have covered</h2>${tiles}
      <div class="row fc-tickrow"><button type="button" class="ghost sm" data-fc="tickall">Tick everything I've finished</button>${ticked.size ? '<button type="button" class="ghost sm" data-fc="untickall">Clear all ticks</button>' : ''}</div></section>
    <section class="panel fc-sec" aria-labelledby="fcH2"><h2 id="fcH2" class="fc-h">My deck</h2>
      <div class="fc-boxes">${boxes}</div><p class="fc-line"><b>${line}</b></p>${note2}
      <div class="fc-cta">${startBtn}<button type="button" class="ghost" data-fc="deck">📇 Look through my deck</button></div></section>
  </div>`;
}

function fcGoHTML() {
  const g = FCV.go, key = fcCur(), D = fcData(), rev = fcReverse(D.cards, key), tag = g.tags[key] || '', pct = Math.round(g.done / g.total * 100);
  return `<div class="fc fc-desk noglos">
    <div class="fc-top"><span class="fc-count">Card ${Math.min(g.done + 1, g.total)} of ${g.total}</span><div class="fc-prog" role="progressbar" aria-valuemin="0" aria-valuemax="${g.total}" aria-valuenow="${g.done}" aria-label="Cards finished"><i style="width:${pct}%"></i></div><button type="button" class="ghost sm" data-fc="stop">Stop</button></div>
    <div class="fc-tilt ${g.pos % 2 ? 't2' : 't1'}"><div class="fc-scene"><div class="fc-stack">${fcCard(key, tag, rev)}</div></div></div>
    <p class="fc-hint" id="fcHint" aria-live="polite">Think of your answer, then flip the card.</p>
    <div class="fc-acts"><div class="fc-acts-front"><button type="button" class="go big" data-fc="flip">Flip the card</button><button type="button" class="fc-link" data-fc="clue" id="fcClueBtn">✏️ Need a clue?</button></div>
      <div class="fc-acts-back" hidden><button type="button" class="ghost big fc-miss" data-fc="miss">Not yet</button><button type="button" class="go big fc-got" data-fc="got">Got it</button></div></div>
    <p class="fc-keys">Keys: Space or Enter flips · 1 or ← Not yet · 2 or → Got it</p>
  </div>`;
}
/* things to do once a card is on screen */
function fcWire() {
  const ta = $('.fc-write'); if (!ta) return;
  const fit = () => { ta.style.height = 'auto'; ta.style.height = Math.max(ta.scrollHeight, 2 * parseFloat(getComputedStyle(ta).lineHeight)) + 'px'; };
  ta.addEventListener('input', () => { FCV.go.typed = ta.value; fit(); });
  fit(); requestAnimationFrame(fit);
  if (matchMedia('(pointer:fine)').matches) ta.focus({ preventScroll: true });
}
function fcFlip() {
  const g = FCV.go; if (!g || g.flipped) return; const f = $('#fcFlip'); if (!f) return;
  g.flipped = true;
  const front = $('.fc-face.front', f), back = $('.fc-face.back', f), mine = $('.fc-mine', back), typed = (g.typed || '').trim();
  if (mine) { mine.hidden = !typed; mine.textContent = typed ? 'You wrote: ' + typed : ''; }
  front.setAttribute('inert', ''); front.setAttribute('aria-hidden', 'true'); back.removeAttribute('inert'); back.removeAttribute('aria-hidden');
  f.classList.add('flipped');
  $('.fc-acts-front').hidden = true; $('.fc-acts-back').hidden = false;
  $('#fcHint').textContent = 'Did you know it? Be honest: this helps your brain.';
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  const got = $('.fc-got'); if (got) got.focus({ preventScroll: true });
}
function fcClue() {
  const p = $('.fc-face.front .fc-pic'), body = $('.fc-face.front .fc-body'); if (!p) return;
  p.hidden = !p.hidden; body.classList.toggle('withpic', !p.hidden);
  $('#fcClueBtn').textContent = p.hidden ? '✏️ Need a clue?' : '✏️ Hide the clue';
}

function fcEndHTML() {
  const g = FCV.go, D = fcData(), n = g.total, miss = g.missed.size, ok = n - miss;
  const by = {}; g.finished.forEach(k => { const d = Math.max(0, fcDiff(fcToday(), (D.cards[k] || {}).due || fcToday())); by[d] = (by[d] || 0) + 1; });
  const when = Object.keys(by).map(Number).sort((a, b) => a - b).map(d => `<li><b>${fcPlural(by[d], 'card')}</b> ${d === 0 ? 'later today' : d === 1 ? 'tomorrow' : 'in ' + d + ' days'}</li>`).join('');
  const S = fcStats(), more = fcPick(false).length > 0;
  return `<div class="fc fc-end noglos"><div class="fc-endcard"><div class="fc-head"><span class="fc-tag">Well done</span></div><div class="fc-body">
    <h1 class="fc-word">All done!</h1>
    <p class="fc-mean">You got ${ok} of ${n} cards${miss ? `, and ${miss} needed another go` : ' first time'}.</p>
    <h2 class="fc-sub">What comes back</h2><ul class="fc-when">${when}</ul></div></div>
    <div class="fc-cta">${more ? `<button type="button" class="go big" data-fc="start">Keep going: ${S.due ? S.due + ' more due' : S.fresh + ' more waiting'}</button>` : ''}<button type="button" class="${more ? 'ghost' : 'go'} big" data-fc="back">Back to my flashcards</button><button type="button" class="ghost big" data-fc="gohome">Go home</button></div></div>`;
}

function fcDeckHTML() {
  const S = fcStats(), groups = [];
  S.deck.forEach(c => { let g = groups.find(x => x.tag === c.tag); if (!g) groups.push(g = { tag: c.tag, cards: [] }); g.cards.push(c); });
  const mini = c => `<div class="fc-mini${FCV.deckFlip[c.key] ? ' flipped' : ''}" data-fc="miniflip" data-key="${c.key}" role="button" tabindex="0" aria-pressed="${!!FCV.deckFlip[c.key]}" aria-label="${esc(TERMS[c.key][0])}. Tap to turn the card over."><div class="fc-flip">${fcFace(c.key, c.tag, 'front', false, { mini: true })}${fcFace(c.key, c.tag, 'back', false, { mini: true })}</div></div>`;
  const jump = groups.length > 1 ? `<nav class="fc-jump" aria-label="Jump to a chapter"><span>Jump to:</span>${groups.map((g, i) => `<button type="button" class="ghost sm" data-fc="jump" data-i="${i}">${esc(g.tag.split(' · ')[0])}</button>`).join('')}</nav>` : '';
  const body = groups.map((g, i) => `<section class="fc-dg"><h2 id="fcg${i}" class="fc-dh">${esc(g.tag.replace(/^Ch (\d+) · /, 'Chapter $1 · '))}</h2><div class="fc-minis">${g.cards.map(mini).join('')}</div></section>`).join('');
  return `<div class="fc fc-page noglos"><div class="chhead"><div><span class="lbl">My flashcards</span><h1>My deck</h1></div><button type="button" class="ghost" data-fc="back">← Back to my flashcards</button></div>
    ${S.deck.length ? `<p class="fc-note"><span>Tap a card to turn it over. This is just for looking: it does not change when your cards come back.</span></p>${jump}${body}` : '<p class="fc-note"><span>Your deck is empty. Tick a topic first.</span></p>'}</div>`;
}

/* ---------- clicks and keys (called from 99-init.js) ---------- */
function fcClick(el) {
  const a = el.dataset.fc, D = fcData();
  if (a === 'open') { fcOpen(); return; }
  if (a === 'tick') {
    const id = el.dataset.id, i = D.topics.indexOf(id); if (i < 0) D.topics.push(id); else D.topics.splice(i, 1);
    fcUntoast(); fcSave(D); fcRender(); const b = $('#fcHost [data-id="' + id + '"]'); if (b) b.focus({ preventScroll: true }); return;
  }
  if (a === 'tickall') {
    const st = dbGet('stamps', {}), ids = fcSections().filter(s => st[s.id]).map(s => s.id);
    if (!ids.length) { toast('You have not finished a section yet. Tick the topics you have covered yourself.'); return; }
    ids.forEach(id => { if (!D.topics.includes(id)) D.topics.push(id); }); fcSave(D); fcRender(); toast('Ticked ' + fcPlural(ids.length, 'topic') + ' you have finished.', 'good'); return;
  }
  if (a === 'jump') { const g = $('#fcg' + el.dataset.i); if (g) g.scrollIntoView({ block: 'start', behavior: RMOTION ? 'auto' : 'smooth' }); return; }
  if (a === 'untickall') { D.topics = []; fcSave(D); fcRender(); return; }
  if (a === 'nostart') { toast('Tick a topic first. Its words go into your deck.'); const t = $('#fcHost .fc-tile'); if (t) t.scrollIntoView({ block: 'center', behavior: RMOTION ? 'auto' : 'smooth' }); return; }
  if (a === 'start') { fcStartGo('due'); return; }
  if (a === 'anyway') { fcStartGo('anyway'); return; }
  if (a === 'deck') { if (!fcDeck(D.topics).length) { toast('Tick a topic first. Its words go into your deck.'); return; } FCV.mode = 'deck'; FCV.deckFlip = {}; fcRender(); window.scrollTo(0, 0); return; }
  if (a === 'back' || a === 'stop') { FCV.mode = 'home'; FCV.go = null; fcRender(); window.scrollTo(0, 0); return; }
  if (a === 'gohome') { FCV.mode = 'home'; FCV.go = null; show('vHome'); return; }
  if (a === 'flip') { fcFlip(); return; }
  if (a === 'clue') { fcClue(); return; }
  if (a === 'got') { fcAnswer(true); return; }
  if (a === 'miss') { fcAnswer(false); return; }
  if (a === 'miniflip') { const k = el.dataset.key; FCV.deckFlip[k] = !FCV.deckFlip[k]; el.classList.toggle('flipped', !!FCV.deckFlip[k]); el.setAttribute('aria-pressed', !!FCV.deckFlip[k]); return; }
}
function fcKey(e) {
  if (VIEW !== 'vCards' || e.ctrlKey || e.metaKey || e.altKey || !$('#modal').hidden) return;
  const tg = e.target, typing = tg && /^(TEXTAREA|INPUT|SELECT)$/.test(tg.tagName), onBtn = tg && (tg.tagName === 'BUTTON' || tg.tagName === 'A');
  if (FCV.mode === 'deck' && tg && tg.classList && tg.classList.contains('fc-mini') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); fcClick(tg); return; }
  if (FCV.mode !== 'go' || !FCV.go) return;
  const g = FCV.go;
  if (!g.flipped) {
    if (typing && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fcFlip(); return; }
    if (typing || onBtn) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); fcFlip(); }
  } else {
    if (typing) return;
    if (e.key === '1' || e.key === 'ArrowLeft') { e.preventDefault(); fcAnswer(false); }
    else if (e.key === '2' || e.key === 'ArrowRight') { e.preventDefault(); fcAnswer(true); }
    else if ((e.key === ' ' || e.key === 'Enter') && !onBtn) e.preventDefault();
  }
}
/* tapping the card itself flips it (but not the writing area or the clue picture) */
function fcCardTap(e) {
  const f = e.target.closest('#fcFlip'); if (!f || !FCV.go || FCV.go.flipped) return false;
  if (e.target.closest('textarea,button,.fc-pic')) return false;
  fcFlip(); return true;
}

/* the home page card */
function fcHomeCard() {
  const el = $('#flashCard'); if (!el) return;
  const S = fcStats(), has = S.deck.length;
  const msg = !has ? 'Pick your topics to make your deck' : S.due || S.fresh ? `<b>${fcWaiting(S)}</b>` : 'Nothing due today. You are up to date!';
  fcBadge(); el.innerHTML = `<div class="hcicon">${fcIconSvg()}</div><div class="hcbody"><span class="kicker2">Key vocabulary</span><h3>Vocab flashcards</h3><p>${msg}</p><p class="fc-hcsub">Index cards with a picture on every one. Each word comes back just before you would forget it.</p><div class="row"><button type="button" class="go" data-fc="open">Open my flashcards →</button></div></div>`;
}
const fcIconSvg = () => `<svg class="chicon" viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="28" height="20" rx="2.5" transform="rotate(-8 17 21)"/><rect x="9" y="9" width="28" height="20" rx="2.5"/><path d="M9 15h28M14 21h18M14 25h12" stroke-width="1.8"/></svg>`;
