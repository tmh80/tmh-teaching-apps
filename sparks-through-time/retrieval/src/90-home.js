/* ===== Home: the "Practise" section ===== */
function rtHmCss(){
  if (document.getElementById('rtHmCss')) return;
  const s = document.createElement('style'); s.id = 'rtHmCss';
  s.textContent = `
.rt-home{display:grid; gap:12px; margin-top:22px; min-width:0}
.rt-home-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr)); gap:12px}
.rt-home-card{display:grid; gap:6px; align-content:start; text-align:left; padding:16px; border:2px solid var(--line); border-radius:16px; background:var(--panel); color:var(--ink); font:inherit; min-width:0}
button.rt-home-card{cursor:pointer}
button.rt-home-card:hover{border-color:var(--accent)}
.rt-home-card h3{margin:0}
.rt-home-card small{color:var(--muted)}
.rt-home-card .rt-type{margin:0}
.rt-home-card.wide{grid-column:1/-1}
`;
  document.head.append(s);
}
function rtHmLastFlash(){
  const p = Store.data && Store.data.rt && Store.data.rt.practised; if (!p) return null;
  const ds = Object.values(p).filter(Boolean).sort(); return ds.length ? ds[ds.length - 1] : null;
}
function rtHomeSection(){
  rtHmCss();
  const cards = [];
  if (typeof renderRtFlashcards === 'function'){
    const last = typeof rtFcNice === 'function' ? rtHmLastFlash() : null;
    cards.push(h('button', {class: 'rt-home-card', type: 'button', id: 'rtHomeFlash', onclick: () => renderRtFlashcards()},
      h('h3', {}, '🃏 Flashcards'), h('span', {}, 'Words and questions that come back just when you need them.'),
      h('small', {}, last ? 'Last practised: ' + rtFcNice(last) : 'Not practised yet')));
  }
  if (typeof renderRtReview === 'function'){
    const n = Store.data && Store.data.rt && Store.data.rt.reviews;
    cards.push(h('button', {class: 'rt-home-card', type: 'button', id: 'rtHomeReview', onclick: () => renderRtReview()},
      h('h3', {}, '📝 Review'), h('span', {}, 'A mixed set of questions from the topics you pick.'),
      h('small', {}, n ? `Done ${n} time${n === 1 ? '' : 's'}` : 'Not tried yet')));
  }
  if (typeof renderRtClassSet === 'function'){
    const inp = h('input', {class: 'rt-type', type: 'text', placeholder: 'Type the code', 'aria-label': 'Class code', autocomplete: 'off', autocapitalize: 'characters'});
    const msg = h('small', {'aria-live': 'polite'});
    const go = () => {
      const code = inp.value.trim().toUpperCase(); if (!code){ msg.textContent = 'Type the code from your teacher first.'; return; }
      if (typeof rtFindSet === 'function' && !rtFindSet(code)){ msg.textContent = 'That code was not found. Check it and try again.'; return; }
      renderRtClassSet(code);
    };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    const last = Store.data && Store.data.rt && Store.data.rt.lastSet;
    cards.push(h('div', {class: 'rt-home-card', id: 'rtHomeSet'}, h('h3', {}, '🔑 Got a class code?'), h('span', {}, 'Your teacher may give you a code for a set of questions.'),
      h('div', {class: 'row'}, inp, h('button', {class: 'btn', type: 'button', onclick: go}, 'Open')), msg, last ? h('small', {}, 'Last code used: ' + last) : null));
  }
  if (typeof rtBackupSection === 'function') cards.push(h('div', {class: 'rt-home-card wide', id: 'rtHomeBackup'}, rtBackupSection()));
  return h('section', {class: 'rt-home', id: 'rtHome'}, h('h2', {}, 'Practise'), h('div', {class: 'rt-home-grid'}, cards));
}
