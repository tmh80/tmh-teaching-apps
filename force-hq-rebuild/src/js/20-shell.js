/* ===== Shell: views, home, name and class, teacher mode ===== */
const CHAPTERS = [
  { id: 'c1', n: 1, title: 'What is a force?', blurb: 'Pushes and pulls, newtons, the main types of force and how to draw a free-body diagram.', stamp: 'Force Spotter', ready: true, arena: 'Main Arena', icon: 'rope' },
  { id: 'c2', n: 2, title: 'Inertia', blurb: 'Why heavy things are hard to start and hard to stop: Newton\'s first law.', stamp: 'Inertia Expert', ready: true, arena: 'Main Arena', icon: 'move' },
  { id: 'c3', n: 3, title: 'F = ma', blurb: 'Resultant forces, the formula triangle and lots of maths practice: Newton\'s second law.', stamp: 'Formula Pro', ready: false, arena: 'Snow Arena', icon: 'tri' },
  { id: 'c4', n: 4, title: 'Action and reaction', blurb: 'Forces always come in pairs: Newton\'s third law in the Space Dome.', stamp: 'Pair Finder', ready: false, arena: 'Space Dome', icon: 'pair' },
  { id: 'c5', n: 5, title: 'Balanced forces', blurb: 'Tug-of-war draws, steady speeds and the new Drop Zone.', stamp: 'Balance Master', ready: false, arena: 'Drop Zone', icon: 'chute' }
];
const VIEWS = ['vHome', 'vChapter', 'vExplore', 'vTeacher'];
let VIEW = 'vHome', CH = null, CTAB = 'learn';
const user = () => DB.user || {};
const isTeacher = () => !!(DB.user && DB.user.teacher);
const unlocked = () => !!DB.unlocked;

function show(v) {
  if (typeof qUnpop === 'function') qUnpop();
  VIEW = v; VIEWS.forEach(x => $('#' + x).hidden = x !== v); document.body.dataset.view = v;
  $('#crumb').textContent = v === 'vChapter' && CH ? `Force Arenas · Chapter ${CH.n}` : v === 'vExplore' ? 'Force Arenas · Explore' : v === 'vTeacher' ? 'For teachers' : '';
  window.scrollTo(0, 0);
  if (v === 'vHome') renderHome();
}
function parkLab() { $('#labPark').appendChild($('#lab')); }
function placeLab(host) { $('#lab').classList.remove('nolc'); host.appendChild($('#lab')); requestAnimationFrame(() => { readColors(); renderPal(); }); }

/* ---------- home ---------- */
function chStatus(id) {
  if (!CHDATA[id]) return { label: 'Coming soon', cls: 'todo' };
  const L = learnProgress(id), Cc = CHDATA[id].challenge ? challengeDone(id) : false, R = reviewProgress(id);
  if (L.done === L.total && (!CHDATA[id].challenge || Cc) && R.done === R.total) return { label: '✓ Complete', cls: 'done' };
  if (L.done || Cc || R.done) return { label: 'In progress', cls: 'part' };
  return { label: 'Not started', cls: 'todo' };
}
/* small line icons for the chapter cards (inline SVG, inherits currentColor) */
const CHICON = {
  rope: '<path d="M4 22h9M27 22h9" stroke-width="3"/><rect x="14" y="16" width="12" height="12" rx="2"/><path d="M14 16l12 12M26 16L14 28" stroke-width="1.6"/>',
  move: '<rect x="18" y="14" width="14" height="14" rx="2"/><path d="M4 17h9M7 21h8M4 25h9" stroke-width="2.6"/>',
  tri: '<path d="M20 6L35 32H5z"/><path d="M11 22h18" stroke-width="2"/><text x="20" y="19" text-anchor="middle" font-size="7.5" font-weight="800" stroke="none" fill="currentColor">F</text><text x="13.5" y="29" text-anchor="middle" font-size="7" font-weight="800" stroke="none" fill="currentColor">m</text><text x="26.5" y="29" text-anchor="middle" font-size="7" font-weight="800" stroke="none" fill="currentColor">a</text>',
  pair: '<path d="M18 20H4M8 15l-5 5 5 5M22 20h14M32 15l5 5-5 5" stroke-width="3"/><path d="M20 10v20" stroke-width="2" stroke-dasharray="3 3"/>',
  chute: '<path d="M7 18a13 11 0 0 1 26 0z"/><path d="M8 18l12 12 12-12M20 18v12" stroke-width="1.6"/><circle cx="20" cy="32" r="3"/>'
};
const chIcon = k => `<svg class="chicon" viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${CHICON[k] || ''}</svg>`;
/* how far through a section is, from 0 to 1 */
function secParts(id) {
  const d = CHDATA[id], L = learnProgress(id), R = reviewProgress(id), C2 = d.challenge ? challengeState(id) : { tried: 0, total: 0 };
  return { L, R, C2, done: L.done + R.done + C2.tried, total: L.total + R.total + C2.total };
}
const pctBar = (f, cls = '') => `<div class="pbar ${cls}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(f * 100)}"><i style="width:${Math.round(f * 100)}%"></i></div>`;
function secRow(sec) {
  const id = sec.id, d = CHDATA[id], st = chStatus(id), P = secParts(id), M = secMins(id), stamped = !!dbGet('stamps', {})[id];
  return `<div class="sectile ${st.cls} ${sec.part === 'Extension' ? 'ext' : 'fnd'}">
    <div class="sechd"><span class="partname">${sec.part}</span><span class="mins">approx. ${M.total} min</span></div>
    <p>${sec.blurb}</p>
    <div class="parts"><span class="pillst ${P.L.done === P.L.total ? 'done' : P.L.done ? 'part' : 'todo'}">Learn ${P.L.done}/${P.L.total}</span>${d.challenge ? `<span class="pillst ${challengeDone(id) ? 'done' : P.C2.tried ? 'part' : 'todo'}">Challenge ${P.C2.tried}/${P.C2.total}</span>` : ''}<span class="pillst ${P.R.done === P.R.total ? 'done' : P.R.done ? 'part' : 'todo'}">Check ${P.R.done}/${P.R.total}</span></div>
    ${pctBar(P.total ? P.done / P.total : 0, st.cls)}
    <div class="tilefoot"><button type="button" class="${st.cls === 'done' ? 'ghost' : 'go'} sm open" data-open="${id}">${st.cls === 'todo' ? 'Start the ' + sec.part : st.cls === 'done' ? 'Open again' : 'Carry on'} →</button>${stamped ? `<span class="minis on" title="Stamp earned">${sec.stamp}</span>` : `<span class="minis">Stamp: ${sec.stamp}</span>`}</div></div>`;
}
function nextSection() { const st = dbGet('stamps', {}); return SECTIONS.find(s => !st[s.id]) || null; }
function renderHome() {
  const u = user(), stamps = dbGet('stamps', {}), J = dbGet('journal', { order: [] });
  $('#whoLine').innerHTML = u.teacher ? `You're in <b>teacher mode</b>: every chapter is unlocked. <button type="button" class="linkbtn" data-act="student">Switch to student mode</button>` : '';
  /* "Up next" card: the first section without a stamp */
  const nx = nextSection();
  if (nx) {
    const P = secParts(nx.id), started = P.done > 0, ch = CHAPTERS.find(c => c.id === nx.ch);
    $('#resume').innerHTML = `<div class="rlbl">${started ? 'Carry on where you left off' : u.name && !u.teacher ? `Ready, ${esc(u.name)}? Up next` : 'Up next'}</div>
      <div class="rtitle">Chapter ${nx.n} · ${nx.part}: ${ch.title}</div>
      <div class="rmeta">approx. ${secMins(nx.id).total} min · ${P.done} of ${P.total} parts done</div>${pctBar(P.total ? P.done / P.total : 0, 'onDark')}
      <button type="button" class="go big" data-open="${nx.id}">${started ? 'Carry on' : 'Start'} ${nx.part === 'Foundation' ? `Chapter ${nx.n}` : `the ${nx.part}`} →</button>`;
  } else $('#resume').innerHTML = `<div class="rlbl">All done so far</div><div class="rtitle">You've finished every chapter that's open. Brilliant work!</div><button type="button" class="go big" data-act="explore">Go to Explore →</button>`;
  const nst = Object.keys(stamps).filter(k => secOf(k)).length;
  $('#heroStats').innerHTML = [[`${nst}<small>/${SECTIONS.length}</small>`, 'stamps'], [`${SECTIONS.filter(s => chStatus(s.id).cls === 'done').length}<small>/${SECTIONS.length}</small>`, 'sections done'], [J.order.length, 'Journal cards']].map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('');
  /* chapters: open ones in full, the rest as a route of upcoming stops */
  const open = CHAPTERS.filter(c => c.ready && SECTIONS.some(s => s.ch === c.id)), soon = CHAPTERS.filter(c => !open.includes(c));
  $('#chapterCards').innerHTML = open.map(ch => `<div class="panel chfeat"><div class="chside"><span class="chnum">${String(ch.n).padStart(2, '0')}</span>${chIcon(ch.icon)}<div><span class="kicker2">Chapter ${ch.n} · ${ch.arena}</span><h3>${ch.title}</h3><p>${ch.blurb}</p></div></div><div class="sectiles">${SECTIONS.filter(s => s.ch === ch.id).map(secRow).join('')}</div></div>`).join('')
    + (soon.length ? `<div class="route"><div class="routehd"><span class="kicker2">Coming soon</span></div><div class="routegrid" style="--n:${soon.length}">${soon.map(ch => `<div class="stop"><div class="stophd"><span class="chnum sm">${String(ch.n).padStart(2, '0')}</span>${chIcon(ch.icon)}</div><span class="kicker2">${ch.arena}</span><h3>${ch.title}</h3><p>${ch.blurb}</p><span class="pillst todo">Coming soon</span></div>`).join('')}</div></div>` : '');
  $('#exploreCard').innerHTML = `<div class="hcicon">${chIcon('rope')}</div><div class="hcbody">` + (exploreOpen()
    ? `<span class="kicker2">Free play · open</span><h3>Explore the Main Arena</h3><p>Every control, readout and diagram is switched on. Build any tug-of-war you like and test your own ideas. Tap any ⓘ button to find out how to read a panel.</p><div class="row"><button type="button" class="go" data-act="explore">Go to Explore →</button></div>`
    : `<span class="kicker2">Free play · opens after Chapter 1</span><h3>Explore the Main Arena</h3><p>Explore switches on every control, readout and diagram at once. It opens when you finish the Chapter 1 Foundation, because by then you'll know how to read every panel.</p><div class="row"><button type="button" class="go" data-open="c1f">Start Chapter 1 →</button><button type="button" class="ghost" data-act="explore-anyway">Open it anyway</button></div>`) + '</div>';
  $('#workshopCard').innerHTML = `<div class="hcicon"><svg class="chicon" viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="12" r="6"/><circle cx="14" cy="12" r="1.5"/><path d="M8 12v18M20 12v8"/><rect x="16" y="20" width="8" height="8" rx="1.5"/><path d="M4 32h32"/><path d="M27 32l9-10"/></svg></div><div class="hcbody"><span class="kicker2">Coming soon</span><h3>The Workshop</h3><p>Pulleys, levers, ramps, wedges and screws. Find out how machines make a job feel easier, and calculate the work done.</p></div>`;
  $('#stampRow').innerHTML = `<div class="sbhd"><div><span class="kicker2">My stamp book</span><h3>${nst ? `${nst} of ${SECTIONS.length} stamps collected` : 'Earn a stamp for every section you finish'}</h3></div></div><div class="sbgrid">`
    + SECTIONS.map(s => `<div class="sbitem"><div class="stamp ${stamps[s.id] ? 'on' : 'ghoststamp'}" title="${s.stamp}">${s.stamp}</div><span>${stamps[s.id] ? s.stamp : `Chapter ${s.n} ${s.part}`}</span></div>`).join('')
    + CHAPTERS.filter(c => !c.ready).map(c => `<div class="sbitem soon"><div class="stamp ghoststamp">${c.stamp}</div><span>Chapter ${c.n}</span></div>`).join('') + '</div>';
  requestAnimationFrame(drawHome);
}
/* Explore opens once the Chapter 1 Foundation is finished (guided before Explore). Teachers, and anyone who chooses "Open it anyway", can go in sooner. */
const EXPLORE_AFTER = 'c1f';
const exploreOpen = () => isTeacher() || !!dbGet('stamps', {})[EXPLORE_AFTER] || !!dbGet('exploreAnyway', false);
function awardStamp(id) {
  const st = dbGet('stamps', {}); if (st[id]) return; st[id] = Date.now(); dbSet('stamps', st);
  const sec = secOf(id), next = SECTIONS.find(s => s.needs === id);
  openModal(`<div class="modal" style="align-items:center;text-align:center"><div class="stamp on drop" style="width:130px;height:130px;font-size:20px">${sec.stamp}</div><h2>Stamp earned!</h2><p>You've finished every part of Chapter ${sec.n} ${sec.part}. Brilliant work. Your stamp is on the home page.</p>${next ? `<p>Want to keep going? The <b>${next.part}</b> takes about ${secMins(next.id).total} minutes and has its own worksheet.</p>` : ''}${id === EXPLORE_AFTER ? `<p><b>Explore is now open!</b> Every control and readout is switched on, so you can test your own ideas in the Main Arena.</p>` : ''}<div class="row">${id === EXPLORE_AFTER ? `<button type="button" class="${next ? 'ghost' : 'go'}" data-act="explore">Open Explore →</button>` : ''}${next ? `<button type="button" class="go" data-close data-open="${next.id}">Try the ${next.part} →</button>` : ''}<button type="button" class="${next ? 'ghost' : 'go'}" data-close>${next ? 'Not now' : 'Thanks!'}</button></div></div>`);
}
/* the arena complex, drawn up close */
const HOMEHIT = [];
function drawHome() {
  const cv = $('#cvHome'); if (!cv || !cv.offsetParent) return; readColors(); const c = fit(cv, 900, 420); HOMEHIT.length = 0;
  drawHomeArt(c, HOMEHIT);
  HOMEHIT.sort((a, b) => ['workshop', 'drop', 'space', 'snow', 'main'].indexOf(a.id) - ['workshop', 'drop', 'space', 'snow', 'main'].indexOf(b.id));   // smaller targets win where they overlap
}
function homeClick(e) {
  const r = $('#cvHome').getBoundingClientRect(), x = (e.clientX - r.left) * 900 / r.width, y = (e.clientY - r.top) * 420 / r.height;
  const hit = HOMEHIT.find(hh => x >= hh.x0 && x <= hh.x1 && y >= hh.y0 && y <= hh.y1); if (!hit) return;
  if (hit.id === 'main') { $('#chapterCards').scrollIntoView({ behavior: RMOTION ? 'auto' : 'smooth', block: 'start' }); return; }
  toast({ snow: 'The Snow Arena opens in Chapter 3, with the husky sled race.', space: 'The Space Dome opens in Chapter 4.', drop: 'The Drop Zone opens in Chapter 5.', workshop: 'The Workshop is being built. Coming soon!' }[hit.id]);
}

/* ---------- modal helpers ---------- */
function openModal(html, onClose) {
  const m = $('#modal'); m.innerHTML = html; m.hidden = false; m._onClose = onClose || null;
  const f = m.querySelector('input,button.go,button'); if (f) setTimeout(() => f.focus(), 30);
}
function closeModal() {
  const m = $('#modal'); m.hidden = true; m.innerHTML = ''; if (m._onClose) { const f = m._onClose; m._onClose = null; f(); }
  /* nobody gets in without a name or the teacher code: cancelling, Escape or clicking outside goes back to the name box */
  if (m.hidden && !user().name && !isTeacher()) askWho(true);
}

/* forms are plain divs: sandboxed previews (and some Toddle views) block real form submission,
   so the button click and the Enter key both run the action directly */
function onSubmit(root, btn, fn) {
  $(btn).addEventListener('click', fn);
  $(root).addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); fn(); } });
}
/* ---------- name and class (asked first) ---------- */
function askWho(first) {
  const u = user();
  openModal(`<div class="modal welcome" id="whoForm" role="form"><div class="wband"><div class="wlogo"><svg viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="9" fill="#0d171d"/><path d="M8 20h9M23 20h9" stroke="#e3a51c" stroke-width="4" stroke-linecap="round"/><path d="M12 15l-5 5 5 5M28 15l5 5-5 5" fill="none" stroke="#e3a51c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="16" y="15" width="8" height="10" rx="2" fill="#c99a5b"/></svg>FORCE<span>HQ</span></div><h2>${first ? 'Welcome to Force HQ!' : 'Who is using Force HQ?'}</h2></div>
    <div class="wbody"><p>Type your name and class so your worksheets show who did the work. Your progress is saved on this device.</p>
    <label>Your name<input type="text" id="whoName" autocomplete="given-name" value="${esc(u.teacher ? '' : u.name || '')}" required></label>
    <label>Your class<input type="text" id="whoCls" placeholder="for example 7B" value="${esc(u.teacher ? '' : u.cls || '')}"></label>
    <div class="row" style="justify-content:space-between;margin-top:4px"><button type="button" class="mini" id="imTeacher">I'm a teacher</button><button type="button" class="go" id="whoGo">Let's go →</button></div></div></div>`);
  onSubmit('#whoForm', '#whoGo', () => { const n = $('#whoName').value.trim(); if (!n) { $('#whoName').focus(); return; } DB.user = { name: n, cls: $('#whoCls').value.trim() }; saveDB(); closeModal(); refreshWho(); renderHome(); if (first) maybeTour(); });
  $('#imTeacher').addEventListener('click', () => askCode(ok => { if (ok) { DB.user = { name: 'Teacher', cls: '', teacher: true }; saveDB(); closeModal(); refreshWho(); renderHome(); } }));
}
function askCode(cb, why) {
  openModal(`<div class="modal" id="codeForm" role="form"><h2>Teacher code</h2><p>${why || 'Type the teacher code to switch on teacher mode. Teacher mode unlocks everything and lets you save worksheets without a name.'}</p>
    <label>Code<input type="password" id="codeIn" autocomplete="off"></label><p class="fb no" id="codeFb"></p>
    <div class="row" style="justify-content:space-between"><button type="button" class="mini" data-close>Cancel</button><button type="button" class="go" id="codeGo">Unlock</button></div></div>`);
  onSubmit('#codeForm', '#codeGo', () => { if ($('#codeIn').value.trim().toUpperCase() === 'FORCE') { DB.unlocked = true; saveDB(); cb(true); } else { $('#codeFb').textContent = 'That code isn\'t right. Check with your teacher.'; } });
}
function refreshWho() {
  const u = user(), el = $('#whoTop');
  el.innerHTML = u.teacher ? `<span class="whoname">👩‍🏫 Teacher mode</span><button type="button" class="whochg" data-act="student">Switch to student</button>`
    : u.name ? `<span class="whoname">👤 ${esc(u.name)}${u.cls ? ' · ' + esc(u.cls) : ''}</span><button type="button" class="whochg" data-act="who" aria-label="Change your name or class">Change</button>`
    : `<button type="button" class="whochg" data-act="who">Add your name</button>`;
}
