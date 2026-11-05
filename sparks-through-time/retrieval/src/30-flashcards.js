/* ===== Flashcards: words and questions, five spaced boxes =====
   Saved in Store.data.rt: cards {key:{box,due}}, practised {stopId:'YYYY-MM-DD'}.
   Box 1..5 come back after 1, 3, 7, 14, 28 days. "Not yet" goes back to box 1 and repeats in the same go.
   A card missed in a go and then got stays in box 1 and comes back tomorrow. */
const RT_FC_DAYS = [1, 3, 7, 14, 28];
function rtFcYmd(d){ return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function rtFcToday(){ return rtFcYmd(new Date()); }
function rtFcAdd(ymd, n){ const p = ymd.split('-').map(Number); return rtFcYmd(new Date(p[0], p[1] - 1, p[2] + n)); }
function rtFcDiff(a, b){ const x = a.split('-').map(Number), y = b.split('-').map(Number); return Math.round((Date.UTC(y[0], y[1] - 1, y[2]) - Date.UTC(x[0], x[1] - 1, x[2])) / 864e5); }
function rtFcNice(ymd){ const p = ymd.split('-').map(Number); return p[2] + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][p[1] - 1]; }
function rtFcRt(){ const d = Store.data; if (!d.rt || typeof d.rt !== 'object') d.rt = {}; if (!d.rt.cards) d.rt.cards = {}; if (!d.rt.practised) d.rt.practised = {}; return d.rt; }
function rtFcState(key){ const r = Store.data && Store.data.rt; return (r && r.cards && r.cards[key]) || null; }
function rtLastPractised(stop){ const id = stop && stop.id ? stop.id : stop; const r = Store.data && Store.data.rt; return (r && r.practised && r.practised[id]) || null; }
function rtMarkPractised(stop){ const id = stop && stop.id ? stop.id : stop; rtFcRt().practised[id] = rtFcToday(); Store.save(); }

/* the cards for some topics. kind: 'w' words, 'q' questions, 'b' both. A word in two topics is one card. */
function rtFcCards(stopIds, kind){
  const seen = new Set(), out = [];
  if (kind !== 'q') RT_WORDS.forEach(w => { if (w.stops.some(s => stopIds.includes(s))){ const k = 'w:' + w.w; if (!seen.has(k)){ seen.add(k); out.push({key: k, type: 'w', w}); } } });
  if (kind !== 'w') RT_QA.forEach(q => { if (stopIds.includes(q.stop)){ const k = 'q:' + q.id; if (!seen.has(k)){ seen.add(k); out.push({key: k, type: 'q', q}); } } });
  return out;
}
function rtFcIsDue(c, today){ const st = rtFcState(c.key); return !st || !st.due || st.due <= today; }
function rtFcBox(c){ const st = rtFcState(c.key); return st && st.box ? st.box : 1; }
/* what the card shows: {tag, front, ask, back} */
function rtFcFace(c){
  if (c.type === 'q') return {tag: 'Question', front: c.q.q, ask: '', back: c.q.a};
  if (rtFcBox(c) >= 3) return {tag: 'Word', front: c.w.def_, ask: 'Which word is this?', back: c.w.w};
  return {tag: 'Word', front: c.w.w, ask: 'What does this word mean?', back: c.w.def_};
}

function rtFcCss(){
  if (document.getElementById('rtFcCss')) return;
  const s = document.createElement('style'); s.id = 'rtFcCss';
  s.textContent = `
.rt-fc{display:grid; gap:14px; max-width:720px; margin:0 auto; min-width:0}
.rt-fc *{min-width:0}
.rt-topics{display:grid; gap:8px}
.rt-topic{display:flex; gap:12px; align-items:center; padding:12px 14px; border:2px solid var(--line); border-radius:14px; background:var(--panel); cursor:pointer}
.rt-topic.on{border-color:var(--accent); background:var(--accent-soft)}
.rt-topic input{width:26px; height:26px; flex:none; accent-color:var(--accent)}
.rt-topic b{display:block; overflow-wrap:anywhere}
.rt-topic small{display:block; color:var(--muted)}
.rt-seg{display:flex; gap:8px; flex-wrap:wrap}
.rt-seg .btn{flex:1 1 90px; min-height:48px; font-size:1.05rem}
.rt-seg .btn[aria-pressed="true"]{background:var(--accent); color:var(--accent-ink); border-color:var(--accent)}
.rt-bar{height:10px; border-radius:99px; background:var(--panel-2); border:1px solid var(--line); overflow:hidden}
.rt-bar i{display:block; height:100%; background:var(--accent)}
.rt-prog{display:flex; justify-content:space-between; align-items:center; font-weight:700; gap:8px}
.rt-card{display:grid; gap:12px; align-content:center; justify-items:center; text-align:center; min-height:240px; padding:22px 18px; border:3px solid var(--accent); border-radius:22px; background:var(--panel); cursor:pointer; box-shadow:0 6px 0 var(--accent-soft); overflow-wrap:anywhere}
.rt-card:focus-visible{outline:4px solid var(--spark); outline-offset:3px}
.rt-card.back{background:var(--accent-soft)}
.rt-card .tag{font-size:.85rem; font-weight:800; letter-spacing:.06em; text-transform:uppercase; color:var(--muted)}
.rt-card .big{font-size:1.6rem; font-weight:800; line-height:1.3}
.rt-card .big.long{font-size:1.3rem}
.rt-card .ask{color:var(--muted); font-weight:600}
.rt-card .tap{font-size:.9rem; color:var(--muted)}
.rt-card .small{font-size:1rem; color:var(--muted)}
.rt-card .mine{font-size:1rem; padding:6px 12px; border-radius:10px; background:var(--panel-2); border:1px dashed var(--line)}
.rt-type{width:100%; box-sizing:border-box; font:inherit; padding:10px; border-radius:12px; border:1px solid var(--line); background:var(--panel); color:var(--ink)}
.rt-answer-row{display:grid; grid-template-columns:1fr 1fr; gap:12px}
.rt-answer-row .btn{min-height:60px; font-size:1.2rem}
.rt-answer-row .btn.got{background:var(--ok); color:#fff; border-color:var(--ok)}
.rt-flip{min-height:56px; font-size:1.15rem}
.rt-end li{margin:4px 0}
`;
  document.head.append(s);
}

function renderRtFlashcards(preTicked){
  rtFcCss();
  document.body.classList.remove('wide', 'story-focus');
  const root = app(); root.innerHTML = ''; window.scrollTo(0, 0);
  const stops = STOPS.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const ticked = new Set(Array.isArray(preTicked) ? preTicked : stops.filter(s => prog(s.id).learn).map(s => s.id));
  let kind = 'b';
  const today = rtFcToday();
  const list = h('div', {class: 'rt-topics'}), seg = h('div', {class: 'rt-seg', role: 'group', 'aria-label': 'What to practise'});
  const startBtn = h('button', {class: 'btn primary rt-flip', type: 'button'}), note = h('p', {class: 'scaleNote'});
  const dueFor = id => rtFcCards([id], kind).filter(c => rtFcIsDue(c, today)).length;
  function draw(){
    list.innerHTML = '';
    stops.forEach(s => {
      const last = rtLastPractised(s), n = dueFor(s.id), cb = h('input', {type: 'checkbox', checked: ticked.has(s.id), 'aria-label': s.topic});
      const row = h('label', {class: 'rt-topic' + (ticked.has(s.id) ? ' on' : '')}, cb,
        h('span', {}, h('b', {}, s.topic), h('small', {}, last ? 'Last practised: ' + rtFcNice(last) : 'Not practised yet'), h('small', {}, n === 1 ? '1 card due' : n + ' cards due')));
      cb.addEventListener('change', () => { cb.checked ? ticked.add(s.id) : ticked.delete(s.id); draw(); });
      list.append(row);
    });
    seg.innerHTML = '';
    [['w', 'Words'], ['q', 'Questions'], ['b', 'Both']].forEach(([k, t]) => seg.append(h('button', {class: 'btn', type: 'button', 'aria-pressed': kind === k ? 'true' : 'false', onclick: () => { kind = k; draw(); }}, t)));
    const ids = [...ticked], due = rtFcCards(ids, kind).filter(c => rtFcIsDue(c, today)).length;
    startBtn.textContent = ids.length ? (due ? `Start: ${due} card${due === 1 ? '' : 's'} due` : 'Start') : 'Pick a topic to start';
    startBtn.disabled = !ids.length;
    note.textContent = ids.length && !due ? 'Nothing is due in these topics right now. Well done!' : '';
  }
  startBtn.addEventListener('click', () => {
    const ids = [...ticked], all = rtFcCards(ids, kind), due = all.filter(c => rtFcIsDue(c, today));
    if (due.length) rtFcRun(ids, kind, due); else rtFcNothingDue(ids, kind, all);
  });
  root.append(h('div', {class: 'rt-fc'},
    h('button', {class: 'btn small back', type: 'button', onclick: renderHome}, '← Back to the time machine'),
    h('h2', {}, 'Flashcards'),
    pipSay('<p>Tick the topics you want to practise. I will bring back each card just when your brain is ready for it.</p>'),
    h('h3', {}, 'Topics'), list,
    h('div', {class: 'row'}, h('button', {class: 'btn small ghost', type: 'button', onclick: () => { stops.forEach(s => ticked.add(s.id)); draw(); }}, 'Tick all'), h('button', {class: 'btn small ghost', type: 'button', onclick: () => { ticked.clear(); draw(); }}, 'Clear')),
    h('h3', {}, 'Cards'), seg, note, startBtn));
  draw();
}

function rtFcNothingDue(ids, kind, all){
  rtFcCss();
  const root = app(); root.innerHTML = ''; window.scrollTo(0, 0);
  root.append(h('div', {class: 'rt-fc'},
    pipSay('<p>Nothing is due right now. You are completely up to date, nice work! Your next cards are waiting for the right day.</p>'),
    h('div', {class: 'row'},
      all.length ? h('button', {class: 'btn primary rt-flip', type: 'button', onclick: () => rtFcRun(ids, kind, all)}, 'Practise anyway') : null,
      h('button', {class: 'btn rt-flip', type: 'button', onclick: () => renderRtFlashcards(ids)}, 'Pick other topics'),
      h('button', {class: 'btn ghost rt-flip', type: 'button', onclick: renderHome}, 'Go home'))));
}

function rtFcRun(ids, kind, cards){
  rtFcCss();
  const root = app();
  const queue = shuffle(cards), total = cards.length, got = new Set(), missed = new Set(), result = {};
  let flipped = false, typed = '';
  function show(){
    if (!queue.length) return finish();
    const c = queue[0], f = rtFcFace(c), retry = missed.has(c.key);
    flipped = false; typed = '';
    root.innerHTML = ''; window.scrollTo(0, 0);
    const bar = h('div', {class: 'rt-bar'}, h('i', {style: {width: (100 * got.size / total) + '%'}}));
    const card = h('div', {class: 'rt-card', role: 'button', tabindex: '0', 'aria-label': 'Card. Press Enter or Space to flip.'});
    const type = h('textarea', {class: 'rt-type', rows: '2', placeholder: 'Want to type your answer? (optional)', 'aria-label': 'Type your answer (optional)'});
    type.addEventListener('input', () => { typed = type.value; });
    const actions = h('div', {});
    const flipBtn = h('button', {class: 'btn primary rt-flip', type: 'button'}, 'Flip the card');
    function face(){
      card.innerHTML = ''; card.classList.toggle('back', flipped);
      const long = s => s.length > 70 ? ' long' : '';
      if (!flipped){
        card.append(h('span', {class: 'tag'}, f.tag + (retry ? ' · another go' : '')), h('div', {class: 'big' + long(f.front)}, f.front), f.ask ? h('div', {class: 'ask'}, f.ask) : '', h('span', {class: 'tap'}, 'Think of your answer, then flip'));
      } else {
        card.append(h('span', {class: 'tag'}, 'Answer'), h('div', {class: 'big' + long(f.back)}, f.back), h('div', {class: 'small'}, f.front), typed.trim() ? h('div', {class: 'mine'}, 'You wrote: ' + typed.trim()) : '');
      }
    }
    function flip(){
      if (flipped) return; flipped = true; face(); flipBtn.hidden = true; type.hidden = true; actions.innerHTML = '';
      const got_ = h('button', {class: 'btn got', type: 'button', onclick: () => answer(true)}, 'Got it'), no = h('button', {class: 'btn', type: 'button', onclick: () => answer(false)}, 'Not yet');
      actions.append(h('div', {class: 'rt-answer-row'}, no, got_)); got_.focus();
    }
    card.addEventListener('click', flip);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(); } });
    flipBtn.addEventListener('click', flip);
    face();
    root.append(h('div', {class: 'rt-fc'},
      h('div', {class: 'rt-prog'}, h('span', {}, `${Math.min(got.size + 1, total)} of ${total}`), h('button', {class: 'btn small ghost', type: 'button', onclick: () => renderRtFlashcards(ids)}, 'Stop')),
      bar, card, type, flipBtn, actions));
    card.focus({preventScroll: true});
  }
  function answer(ok){
    const c = queue.shift(), r = rtFcRt(), today = rtFcToday(), st = r.cards[c.key] || {box: 1, due: today};
    if (ok){
      const box = missed.has(c.key) ? 1 : Math.min(5, (st.box || 1) + 1);
      r.cards[c.key] = {box, due: rtFcAdd(today, RT_FC_DAYS[box - 1])}; got.add(c.key); result[c.key] = r.cards[c.key];
    } else {
      r.cards[c.key] = {box: 1, due: today}; missed.add(c.key);
      queue.splice(Math.min(queue.length, 7), 0, c);
    }
    Store.save(); show();
  }
  function finish(){
    ids.forEach(id => rtMarkPractised(id));
    const today = rtFcToday(), groups = {};
    Object.values(result).forEach(s => { const d = rtFcDiff(today, s.due); groups[d] = (groups[d] || 0) + 1; });
    const when = d => d <= 0 ? 'later today' : d === 1 ? 'tomorrow' : 'in ' + d + ' days';
    root.innerHTML = ''; window.scrollTo(0, 0);
    root.append(h('div', {class: 'rt-fc rt-end'},
      pipSay(`<p>All done! You got <b>${got.size}</b> of ${total} card${total === 1 ? '' : 's'}${missed.size ? `, and ${missed.size} needed another go` : ''}. Great effort!</p>`),
      h('h3', {}, 'What comes back'),
      h('ul', {}, Object.keys(groups).map(Number).sort((a, b) => a - b).map(d => h('li', {}, `${groups[d]} card${groups[d] === 1 ? '' : 's'} ${when(d)}`))),
      h('div', {class: 'row'},
        h('button', {class: 'btn primary rt-flip', type: 'button', onclick: () => renderRtFlashcards(ids)}, 'Go again'),
        h('button', {class: 'btn rt-flip', type: 'button', onclick: renderHome}, 'Go home'))));
  }
  show();
}
