/* ===== More question types: order, pick, reason (two-tier, with a "Who's right?" cartoon mode) and fix (spot the mistake) =====
   Added for Chapter 5. Each follows the QT pattern in 35-questions.js: html(q, s, api), bind(el, q, api), lock(el, q, s), show(q, v, s), model(q).
   One go each. Drafts (a card moved, a line tapped) are saved in the question's state without `done`, so a re-draw keeps them.
   Seeded shuffles (hashStr(q.id)) keep the sim and the paper worksheet in the same order. */
Object.assign(QLABEL, { order: 'Put in order', pick: 'Choose the words', reason: 'Answer and reason', fix: 'Spot the mistake' });
const ORD = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] || 'th'));
const afterTxt = q => q.after ? ' ' + q.after : '';

/* ---------- order: put cards in order with up and down buttons ----------
   {id, type:'order', p, items:[...in the correct order], first:'label above the list', last:'label under the list', after}
   2 marks for the right order, 1 if only two neighbours are the wrong way round, else 0. */
function orderPerm(q) {   // the shuffled start order: seeded, and never close to the right answer
  const n = q.items.length, fixedPts = p => p.filter((x, i) => x === i).length;
  for (let k = 0; k < 60; k++) { const p = shuffled(q.items.map((_, i) => i), hashStr(q.id) + 5 + k); if (fixedPts(p) <= (n > 4 ? 1 : 0)) return p; }
  return q.items.map((_, i) => n - 1 - i);
}
function orderScore(v) {
  const bad = v.map((x, i) => x === i ? -1 : i).filter(i => i >= 0);
  if (!bad.length) return 2;
  return bad.length === 2 && bad[1] === bad[0] + 1 && v[bad[0]] === bad[1] && v[bad[1]] === bad[0] ? 1 : 0;
}
QT.order = {
  html(q, s) {
    const cur = s && Array.isArray(s.v) ? s.v : orderPerm(q);
    return `${q.first ? `<div class="ordend"><b>First</b> ${q.first}</div>` : ''}<ol class="orderlist">${cur.map((it, pos) => `<li class="ordcard" data-it="${it}"><span class="ordn">${pos + 1}</span><span class="ordt">${q.items[it]}</span><span class="ordbtns"><button type="button" class="ordb" data-mv="-1" aria-label="Move up: ${esc(plain(q.items[it]))}">▲</button><button type="button" class="ordb" data-mv="1" aria-label="Move down: ${esc(plain(q.items[it]))}">▼</button></span></li>`).join('')}</ol>${q.last ? `<div class="ordend"><b>Last</b> ${q.last}</div>` : ''}<button type="button" class="ghost sm qchk" style="align-self:flex-start">Check the order</button>`;
  },
  bind(el, q, api) {
    const list = $('.orderlist', el), read = () => $$('.ordcard', list).map(c => +c.dataset.it);
    list.addEventListener('click', e => {
      const b = e.target.closest('.ordb'); if (!b || api.locked()) return;
      const card = b.closest('.ordcard'), dir = +b.dataset.mv, sib = dir < 0 ? card.previousElementSibling : card.nextElementSibling; if (!sib) return;
      if (dir < 0) list.insertBefore(card, sib); else list.insertBefore(sib, card);
      $$('.ordcard', list).forEach((c, i) => { $('.ordn', c).textContent = i + 1; });
      const cur = api.state() || {}; cur.v = read(); api.setRaw(cur); b.focus();
    });
    const go = () => {
      if (api.locked()) return; const v = read(), sc = orderScore(v), ok = sc === 2;
      api.answer(v, ok, ok ? (q.ok || 'Perfect order!') + afterTxt(q) : (sc === 1 ? 'Close! Two neighbours are the wrong way round. Each wrong card now shows where it belongs.' : 'Whoops! That order wasn\'t right. Each wrong card now shows where it belongs.') + afterTxt(q), { score: sc });
    };
    api.reg({ blank: () => { const st = api.state(); return !(st && Array.isArray(st.v)); }, check: go });   // the shuffled start order is not an answer: a card has to be moved
    $('.qchk', el).addEventListener('click', go);
  },
  lock(el, q, s) {
    $$('.ordcard', el).forEach((c, pos) => { const it = +c.dataset.it, ok = it === pos; c.classList.add(ok ? 'right' : 'wrong'); if (!ok) corr($('.ordt', c), 'goes ' + ORD(it + 1)); });
    lockInputs(el);
  },
  show(q, v) { return Array.isArray(v) ? v.map((i, k) => `${k + 1}. ${q.items[i]}`).join('<br>') : ''; },
  model(q) { return q.items.map((t, k) => `${k + 1}. ${t}`).join('<br>'); }
};

/* ---------- calcorder: work out a value for each item, then put the items in order ("Work it out, then order") ----------
   {id, type:'calcorder', p, mass, given:'g (N/kg)', calc:'Weight of the crate (N)', unit:'N', tol:0.5, col0:'World',
    items:[[name, given value], ...] in the CORRECT order (lowest first), first, last, after, f:(given, mass) => value (optional: the default is mass × given)}
   One table (item, given value, a box for the calculated value), then the order cards, then one Check button. One go.
   5 marks. Sums, 3 marks: all right = 3; at least two thirds right = 2; at least a third right = 1; else 0 (six items: 6 = 3, 4 or 5 = 2, 2 or 3 = 1).
   Order, 2 marks: the `order` rule, or 2 if the order matches the student's OWN typed values (error carried forward: one wrong sum does not cost the order marks too).
   The rows and the cards start in the same seeded shuffle that `order` uses (orderPerm), so the paper worksheet matches the sim. */
Object.assign(QLABEL, { calcorder: 'Work it out, then order' });
const coVal = (q, i) => q.f ? q.f(q.items[i][1], q.mass) : q.mass * q.items[i][1];
function coOwnOrderOk(q, vals, ord) {   // does the card order follow the student's own numbers (lowest first)? Needs a number in every box, and not all the same.
  const n = vals.map(parseNum); if (n.some(isNaN) || Math.max(...n) === Math.min(...n)) return false;
  return ord.every((it, k) => k === 0 || (q.desc ? n[ord[k - 1]] >= n[it] : n[ord[k - 1]] <= n[it]));
}
function coScore(q, vals, ord) {
  const n = q.items.length, right = q.items.map((_, i) => { const x = parseNum(vals[i]); return !isNaN(x) && near(x, coVal(q, i), q.tol != null ? q.tol : 0.5); });
  const r = right.filter(Boolean).length, calc = r === n ? 3 : r >= n * 2 / 3 ? 2 : r >= n / 3 ? 1 : 0;
  const strict = orderScore(ord), own = coOwnOrderOk(q, vals, ord), order = Math.max(strict, own ? 2 : 0);
  return { right, r, calc, strict, own, order, total: calc + order };
}
QT.calcorder = {
  html(q, s) {
    const perm = orderPerm(q), v = s && s.v && Array.isArray(s.v.ord) ? s.v : { vals: [], ord: perm };
    return `<div class="cotbl"><table class="tbl"><tr><th>${q.col0 || 'Item'}</th><th>${q.given}</th><th>${q.calc}</th></tr>${perm.map(it => `<tr data-it="${it}"><th>${q.items[it][0]}</th><td>${q.items[it][1]}</td><td><input class="coin" inputmode="decimal" autocomplete="off" aria-label="${esc(q.calc + ' for ' + plain(q.items[it][0]))}" data-it="${it}" value="${esc(v.vals[it] == null ? '' : v.vals[it])}"><span class="unit">${q.unit || ''}</span></td></tr>`).join('')}</table></div>
      ${q.first ? `<div class="ordend"><b>First</b> ${q.first}</div>` : ''}<ol class="orderlist">${v.ord.map((it, pos) => `<li class="ordcard" data-it="${it}"><span class="ordn">${pos + 1}</span><span class="ordt">${q.items[it][0]}</span><span class="ordbtns"><button type="button" class="ordb" data-mv="-1" aria-label="Move up: ${esc(plain(q.items[it][0]))}">▲</button><button type="button" class="ordb" data-mv="1" aria-label="Move down: ${esc(plain(q.items[it][0]))}">▼</button></span></li>`).join('')}</ol>${q.last ? `<div class="ordend"><b>Last</b> ${q.last}</div>` : ''}<button type="button" class="ghost sm qchk" style="align-self:flex-start">Check</button>`;
  },
  bind(el, q, api) {
    const list = $('.orderlist', el), readOrd = () => $$('.ordcard', list).map(c => +c.dataset.it), readVals = () => { const a = []; $$('.coin', el).forEach(i => { a[+i.dataset.it] = i.value; }); return a; };
    const save = () => { if (api.locked()) return; const cur = api.state() || {}; cur.v = { vals: readVals(), ord: readOrd() }; api.setRaw(cur); };
    $$('.coin', el).forEach(i => i.addEventListener('input', save));
    list.addEventListener('click', e => {
      const b = e.target.closest('.ordb'); if (!b || api.locked()) return;
      const card = b.closest('.ordcard'), dir = +b.dataset.mv, sib = dir < 0 ? card.previousElementSibling : card.nextElementSibling; if (!sib) return;
      if (dir < 0) list.insertBefore(card, sib); else list.insertBefore(sib, card);
      $$('.ordcard', list).forEach((c, i) => { $('.ordn', c).textContent = i + 1; });
      save(); b.focus();
    });
    const go = () => {
      if (api.locked()) return; const vals = readVals(), ord = readOrd();
      if (q.items.some((_, i) => isNaN(parseNum(vals[i]))) && !api.auto) { api.say('Type a number in every box first. If you are not sure, give your best answer.', 'no'); return; }
      const sc = coScore(q, vals, ord), n = q.items.length, ok = sc.total === 5;
      const part1 = sc.r === n ? 'All the calculations are right.' : `${sc.r} of ${n} calculations were right. The right values are shown in green.`;
      const part2 = sc.strict === 2 ? 'The order is right.' : sc.own ? 'Your order matches your own values, so you keep the order marks. Check the sums that were wrong.' : sc.strict === 1 ? 'Close! Two neighbours in the order are the wrong way round.' : 'The order wasn\'t right. The correct order is shown below.';
      api.answer({ vals, ord }, ok, (ok ? (q.ok || 'Every value and the order are right!') : 'Whoops! ' + part1 + ' ' + part2) + afterTxt(q), { score: sc.total });
    };
    api.reg({ blank: () => { const st = api.state(); return $$('.coin', el).every(i => !i.value.trim()) && !(st && st.v); }, check: go });
    $('.qchk', el).addEventListener('click', go);
  },
  lock(el, q, s) {
    const v = s.v || { vals: [], ord: [] }, sc = coScore(q, v.vals || [], v.ord || []);
    $$('.coin', el).forEach(i => { const it = +i.dataset.it, ok = sc.right[it]; i.classList.add(ok ? 'right' : 'wrong'); if (!ok) corr($('.unit', i.parentElement), fmt(coVal(q, it), 2) + ' ' + (q.unit || '')); });
    $$('.ordcard', el).forEach((c, pos) => { const it = +c.dataset.it, ok = it === pos; c.classList.add(ok ? 'right' : 'wrong'); if (!ok) corr($('.ordt', c), 'goes ' + ORD(it + 1)); });
    if (!$('.corrorder', el)) { const d = document.createElement('div'); d.className = 'corrorder gl'; d.innerHTML = `<b>Correct order${q.first ? ' (' + q.first.toLowerCase() + ' first)' : ''}:</b> ${q.items.map(x => x[0]).join(', ')}`; $('.orderlist', el).after(d); }
    lockInputs(el);
  },
  show(q, v) { return v && Array.isArray(v.ord) ? q.items.map((x, i) => `${plain(x[0])}: ${esc(v.vals[i] == null ? '' : v.vals[i])} ${q.unit || ''}`).join('<br>') + '<br><b>Order:</b> ' + v.ord.map(i => plain(q.items[i][0])).join(', ') : ''; },
  model(q) { return q.items.map((x, i) => `${plain(x[0])}: ${fmt(coVal(q, i), 2)} ${q.unit || ''}`).join('<br>') + '<br><b>Order:</b> ' + q.items.map(x => plain(x[0])).join(', '); }
};

/* ---------- pick: choose the words from drop-downs inside a sentence ----------
   {id, type:'pick', p:'As it speeds up, air resistance {0}. Its weight {1}.', picks:[[['gets bigger','stays the same','gets smaller'], 0], [[...], 1]], after, sure}
   1 mark per drop-down. Ordered scales keep their natural order (they are not shuffled). */
const pickSentence = (q, f) => q.p.replace(/\{(\d+)\}/g, (_, k) => f(+k));
const pickPlain = q => plain(pickSentence(q, k => '___'));
QT.pick = {
  html(q, s) {
    return `<div class="gl pickp">${pickSentence(q, k => `<select class="pickin" data-k="${k}" aria-label="Choice ${k + 1} of ${q.picks.length}"><option value="">choose…</option>${q.picks[k][0].map((o, j) => `<option value="${j}"${s && Array.isArray(s.v) && s.v[k] === j ? ' selected' : ''}>${o}</option>`).join('')}</select>`)}</div>${sureHTML(q, s)}<button type="button" class="ghost sm qchk" style="align-self:flex-start">Check</button>`;
  },
  bind(el, q, api) {
    const go = () => {
      if (api.locked()) return; const v = q.picks.map((_, k) => { const x = $(`.pickin[data-k="${k}"]`, el).value; return x === '' ? null : +x; });
      if (v.some(x => x == null) && !api.auto) { api.say('Choose a word for every gap first.', 'no'); return; }
      if (q.sure && !sureGet(el) && !api.auto) { api.say('Choose how sure you are first.', 'no'); return; }
      const bad = v.map((x, k) => x === q.picks[k][1] ? -1 : k).filter(k => k >= 0);
      api.answer(v, !bad.length, (!bad.length ? (q.ok || 'All correct!') : bad.length === 1 ? `Whoops! The right choice is ${qq(q.picks[bad[0]][0][q.picks[bad[0]][1]])}.` : `Whoops! ${bad.length} choices weren't right. The right words are shown in green.`) + afterTxt(q), { score: q.picks.length - bad.length, sure: q.sure ? sureGet(el) : null });
    };
    api.reg({ blank: () => $$('.pickin', el).every(x => x.value === ''), check: go });
    $('.qchk', el).addEventListener('click', go);
  },
  lock(el, q, s) {
    $$('.pickin', el).forEach(sel => { const k = +sel.dataset.k, ok = s.v && s.v[k] === q.picks[k][1]; sel.classList.add(ok ? 'right' : 'wrong'); if (!ok) corr(sel, q.picks[k][0][q.picks[k][1]]); });
    lockInputs(el);
  },
  show(q, v) { return pickSentence(q, k => `<u>${Array.isArray(v) && v[k] != null ? q.picks[k][0][v[k]] : '______'}</u>`); },
  model(q) { return pickSentence(q, k => `<u>${q.picks[k][0][q.picks[k][1]]}</u>`); }
};

/* ---------- reason: choose the answer, then choose the reason (two-tier) ----------
   {id, type:'reason', p, opts:[...], a, reasons:[...], r, why, sure, voices}
   Cartoon mode: voices:[{who:'Mia', says:'...'}, ...] replaces opts and draws speech bubbles ("Who's right?"); a is the index of the right voice.
   why: a string (shown after the check), or {a:{optionIndex:'why this answer is wrong'}, r:{reasonIndex:'why this reason is wrong'}, all:'general'}.
   2 marks: 1 for the answer, 1 for the reason. A right answer with a wrong reason is named as such. */
const rOpts = q => q.voices ? q.voices.map(v => `<b>${v.who}:</b> “${v.says}”`) : q.opts;
const rOrderA = q => q.voices ? q.voices.map((_, i) => i) : shuffled(q.opts.map((_, i) => i), hashStr(q.id + 'a'));
const rOrderR = q => shuffled(q.reasons.map((_, i) => i), hashStr(q.id + 'r'));
const rWhy = (q, tier, i) => (q.why && typeof q.why === 'object' && q.why[tier] && q.why[tier][i]) || '';
const rWhyAll = q => typeof q.why === 'string' ? q.why : (q.why && q.why.all) || '';
const VOICEPAL = { Mia: ['#e7b48f', '#c94a34', '#4a2f27'], Sam: ['#f3cfae', '#1f5f8b', '#2b2b2b'], Leo: ['#b97d56', '#11806f', '#1d1410'], Ana: ['#d9a07a', '#e3a51c', '#6a3b1f'], Kai: ['#f0c9a4', '#7446b0', '#8a5a2b'], Zoe: ['#c68863', '#b23a68', '#1d1410'] };
function voiceSVG(who) {   // a flat, rounded, outline-free head and shoulders
  const k = Object.keys(VOICEPAL), p = VOICEPAL[who] || VOICEPAL[k[Math.abs(hashStr(who)) % k.length]];
  return `<svg viewBox="0 0 48 48" width="46" height="46" aria-hidden="true"><rect x="7" y="31" width="34" height="22" rx="13" fill="${p[1]}"/><circle cx="24" cy="19" r="10.5" fill="${p[0]}"/><path d="M13.5 18.5a10.5 10.5 0 0 1 21 0c-4.2-4.4-9.4-5.4-12.6-4.2-3.2-1.2-5.8-.2-8.4 4.2z" fill="${p[2]}"/><circle cx="20.4" cy="20.5" r="1.4" fill="#13212a"/><circle cx="27.6" cy="20.5" r="1.4" fill="#13212a"/><path d="M20.6 25q3.4 2.6 6.8 0" stroke="#13212a" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`;
}
QT.reason = {
  html(q, s) {
    const v = (s && s.v) || {}, ro = rOpts(q);
    const t1 = rOrderA(q).map(i => q.voices
      ? `<button type="button" class="voice${v.a === i ? ' picked' : ''}" data-o="${i}"><span class="vav">${voiceSVG(q.voices[i].who)}<span>${q.voices[i].who}</span></span><span class="bubble">“${q.voices[i].says}”</span></button>`
      : `<button type="button" data-o="${i}" class="${v.a === i ? 'picked' : ''}">${ro[i]}</button>`).join('');
    return `<div class="opts rA${q.voices ? ' voices' : ''}">${t1}</div><div class="rtier2"${v.a == null ? ' hidden' : ''}><div class="tq">Why? Choose the best reason.</div><div class="opts rR">${rOrderR(q).map(j => `<button type="button" data-r="${j}" class="${v.r === j ? 'picked' : ''}">${q.reasons[j]}</button>`).join('')}</div></div>${sureHTML(q, s)}<button type="button" class="ghost sm qchk" style="align-self:flex-start">Check</button>`;
  },
  bind(el, q, api) {
    const s0 = api.state(), v0 = (s0 && s0.v) || {}; let a = v0.a != null ? v0.a : null, r = v0.r != null ? v0.r : null;
    const save = () => { const cur = api.state() || {}; cur.v = { a, r }; api.setRaw(cur); };
    el.addEventListener('click', e => {
      if (api.locked()) return;
      const bo = e.target.closest('.rA [data-o]'), br = e.target.closest('.rR [data-r]');
      if (bo) { a = +bo.dataset.o; $$('.rA [data-o]', el).forEach(b => b.classList.toggle('picked', b === bo)); $('.rtier2', el).hidden = false; save(); }
      if (br) { r = +br.dataset.r; $$('.rR [data-r]', el).forEach(b => b.classList.toggle('picked', b === br)); save(); }
    });
    const go = () => {
      if (api.locked()) return;
      if (a == null && !api.auto) { api.say('Choose an answer first.', 'no'); return; }
      if (r == null && !api.auto) { api.say('Now choose the best reason.', 'no'); return; }
      if (q.sure && !sureGet(el) && !api.auto) { api.say('Choose how sure you are first.', 'no'); return; }
      const okA = a === q.a, okR = r === q.r, ok = okA && okR, ro = rOpts(q), gen = rWhyAll(q), rea = qq(q.reasons[q.r]);
      const ans = q.voices ? `${q.voices[q.a].who} is right` : `The answer is ${qq(ro[q.a])}`;   // cartoon mode names the character instead of repeating the speech bubble
      const msg = ok ? `${q.ok || 'Spot on! Right answer and right reason.'} ${gen}`
        : okA ? `You picked the right answer, but that reason doesn't hold up. The reason is ${rea}. ${rWhy(q, 'r', r)} ${gen}`
        : okR ? `Whoops! ${ans}. The reason you chose is the right one, but it goes with a different answer. ${rWhy(q, 'a', a)} ${gen}`
        : `Whoops! ${ans}, because ${rea}. ${rWhy(q, 'a', a)} ${rWhy(q, 'r', r)} ${gen}`;
      api.answer({ a, r }, ok, msg.replace(/\s+/g, ' ').trim(), { score: (okA ? 1 : 0) + (okR ? 1 : 0), sure: q.sure ? sureGet(el) : null });
    };
    api.reg({ blank: () => a == null && r == null, check: go });
    $('.qchk', el).addEventListener('click', go);
  },
  lock(el, q, s) {
    const v = s.v || {}; $('.rtier2', el).hidden = false;
    $$('.rA [data-o]', el).forEach(b => { const i = +b.dataset.o; b.classList.remove('picked'); b.classList.add(...(i === v.a ? [i === q.a ? 'right' : 'wrong'] : i === q.a ? ['answer'] : [])); });
    $$('.rR [data-r]', el).forEach(b => { const j = +b.dataset.r; b.classList.remove('picked'); b.classList.add(...(j === v.r ? [j === q.r ? 'right' : 'wrong'] : j === q.r ? ['answer'] : [])); });
    lockInputs(el);
  },
  show(q, v) { if (!v || v.a == null) return ''; return `${plain(rOpts(q)[v.a])}${v.r != null ? '<br>Reason: ' + q.reasons[v.r] : ''}`; },
  model(q) { return `${plain(rOpts(q)[q.a])}<br>Reason: ${q.reasons[q.r]}`; }
};

/* ---------- fix: spot the mistake ----------
   {id, type:'fix', p, who:'Leo', lines:[...], bad: 1 (0-based index of the wrong line), fix:{kind:'num', ans, unit, units, tol, ask} or {kind:'mcq', opts:[...], a, ask}, why, after}
   Part 1: tap the line (one tap, then it locks and the right line is shown, so part 2 can still be answered). Part 2: correct it.
   2 marks (1 + 1). The explanation (why) always shows once the question locks. */
const fixOrder = q => shuffled(q.fix.opts.map((_, i) => i), hashStr(q.id) + 11);
const fixTol = f => f.tol != null ? f.tol : Math.max(0.6, Math.abs(f.ans) * 0.01);
const fixNumOk = (q, raw, u) => { const f = q.fix, n = parseNum(raw); return !isNaN(n) && near(n, f.ans, fixTol(f)) && (!(f.units && f.units.length) || u === f.unit); };
QT.fix = {
  html(q, s) {
    const v = (s && s.v) || {}, f = q.fix, U = f.units && f.units.length;
    const lines = q.lines.map((t, i) => `<button type="button" class="fixline" data-l="${i}"><span class="fixn">${i + 1}</span><span class="fixt">${t}</span></button>`).join('');
    const part2 = f.kind === 'num'
      ? `<div class="tq">${f.ask || 'Now correct it. Type the right answer.'}</div><div class="numin"><input class="ansin" inputmode="decimal" autocomplete="off" aria-label="Your correction" value="${esc(s && s.done && v.fix != null ? v.fix : '')}">${U ? `<select class="unitsel" aria-label="Unit"><option value="">unit?</option>${f.units.map(u => `<option value="${esc(u)}"${s && s.u === u ? ' selected' : ''}>${u}</option>`).join('')}</select><span class="unit"></span>` : `<span class="unit">${f.unit || ''}</span>`}<button type="button" class="ghost sm qchk">Check</button></div>`
      : `<div class="tq">${f.ask || 'Now correct it. Choose the line that should replace it.'}</div><div class="opts rF">${fixOrder(q).map(i => `<button type="button" data-o="${i}">${f.opts[i]}</button>`).join('')}</div>`;
    return `<div class="fixbox"><div class="fixwho">${q.who ? esc(q.who) + '’s answer' : 'The answer'}</div>${lines}</div><div class="fix2"${v.line != null ? '' : ' hidden'}>${part2}</div>`;
  },
  bind(el, q, api) {
    const f = q.fix, s0 = api.state(); let line = s0 && s0.v && s0.v.line != null ? s0.v.line : null;
    const paint = () => { $$('.fixline', el).forEach((b, i) => { b.classList.remove('right', 'wrong', 'answer'); b.disabled = line != null; if (line == null) return; if (i === line) b.classList.add(line === q.bad ? 'right' : 'wrong'); else if (i === q.bad) b.classList.add('answer'); }); };
    paint();
    el.addEventListener('click', e => {
      const b = e.target.closest('.fixline'); if (!b || line != null || api.locked()) return;
      line = +b.dataset.l; const cur = api.state() || {}; cur.v = { line }; api.setRaw(cur); paint(); $('.fix2', el).hidden = false;
      api.say(line === q.bad ? 'Yes, that is the line with the mistake. Now correct it.' : 'Not quite. The mistake is in the line with the green dashes. You can still correct it.', line === q.bad ? 'ok' : 'hint');
    });
    const finish = (vfix, fixOk, u) => {
      const lineOk = line === q.bad, ok = lineOk && fixOk, parts = [];
      if (!lineOk) parts.push(`The mistake was in line ${q.bad + 1}.`);
      if (!fixOk) parts.push(f.kind === 'num' ? (!isNaN(parseNum(vfix)) && near(parseNum(vfix), f.ans, fixTol(f)) ? `The number is right, but the unit should be ${f.unit}.` : `The right answer is ${fmt(f.ans, 2)} ${f.unit || ''}.`) : `The right line is ${qq(f.opts[f.a])}.`);
      const msg = (ok ? (q.ok || 'Spot on! You found the mistake and fixed it.') : 'Whoops! ' + parts.join(' ')) + ' ' + (q.why || '') + afterTxt(q);
      api.answer({ line, fix: vfix }, ok, msg.replace(/\s+/g, ' ').trim(), { score: (lineOk ? 1 : 0) + (fixOk ? 1 : 0), u: u || undefined });
    };
    if (f.kind === 'num') {
      const go = () => {
        if (api.locked() || line == null) return; const raw = $('.ansin', el).value, U = f.units && f.units.length, u = U ? $('.unitsel', el).value : null;
        if (isNaN(parseNum(raw)) && !api.auto) { api.say('Type your answer as a number.', 'no'); return; }
        if (U && !u && !api.auto) { api.say('Choose a unit for your answer first.', 'no'); return; }
        finish(raw, fixNumOk(q, raw, u), u);
      };
      $('.qchk', el).addEventListener('click', go); $('.ansin', el).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      api.reg({ blank: () => line == null, check: go });
    } else { api.reg({ blank: () => line == null, check: () => { if (line != null) finish(null, false); } }); el.addEventListener('click', e => { const b = e.target.closest('.rF [data-o]'); if (!b || api.locked() || line == null) return; const i = +b.dataset.o; finish(i, i === f.a); }); }
  },
  lock(el, q, s) {
    const v = s.v || {}, f = q.fix;
    $$('.fixline', el).forEach((b, i) => { b.classList.remove('right', 'wrong', 'answer'); if (i === v.line) b.classList.add(v.line === q.bad ? 'right' : 'wrong'); else if (i === q.bad) b.classList.add('answer'); });
    $('.fix2', el).hidden = false;
    if (f.kind === 'num') {
      const inp = $('.ansin', el), ok = fixNumOk(q, v.fix, s.u); inp.value = v.fix == null ? '' : v.fix; inp.classList.add(ok ? 'right' : 'wrong');
      const sel = $('.unitsel', el); if (sel) { sel.value = s.u || ''; sel.classList.add(s.u === f.unit ? 'right' : 'wrong'); }
      if (!ok) corr($('.unit', el) || inp, fmt(f.ans, 2) + ' ' + (f.unit || ''));
    } else $$('.rF [data-o]', el).forEach(b => { const i = +b.dataset.o; b.className = i === v.fix ? (i === f.a ? 'right' : 'wrong') : i === f.a ? 'answer' : ''; });
    lockInputs(el);
  },
  show(q, v, s) {
    if (!v || v.line == null) return '';
    const f = q.fix, fx = v.fix == null ? '' : f.kind === 'num' ? `${esc(v.fix)} ${esc((s && s.u) || f.unit || '')}` : f.opts[v.fix];
    return `Mistake: line ${v.line + 1}${fx ? '<br>Correction: ' + fx : ''}`;
  },
  model(q) { const f = q.fix; return `Mistake: line ${q.bad + 1}<br>Correction: ${f.kind === 'num' ? fmt(f.ans, 2) + ' ' + (f.unit || '') : f.opts[f.a]}`; }
};
