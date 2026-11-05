/* ===== Save code: copy all progress as text, paste it on another device =====
   Ported from Force HQ. The code holds a copy of Store.data and a checksum, so a damaged or cut-off code is caught.
   Teacher unlock is never saved. A load always asks first, and the progress it replaces is kept so it can be undone. */
const RT_BK_VER = 1, RT_BK_PREV = 'sparks-through-time-v1_prev';
const rtBkHash = s => { let h1 = 0xdeadbeef ^ s.length, h2 = 0x41c6ce57; for (let i = 0; i < s.length; i++){ const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909); h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909); return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36); };
const rtBkB64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const rtBkUnB64 = s => Uint8Array.from(atob(s.replace(/\s/g, '')), c => c.charCodeAt(0));
function rtBkPack(){
  const d = JSON.parse(JSON.stringify(Store.data || {})); delete d.teacherOK;
  const at = Date.now(), payload = JSON.stringify({app: 'sparks', v: RT_BK_VER, at, data: d});
  return JSON.stringify({sum: rtBkHash(payload), payload});
}
async function rtBkEncode(text){
  const raw = new TextEncoder().encode(text);
  if (window.CompressionStream){ try { const cs = new CompressionStream('gzip'), w = cs.writable.getWriter(); w.write(raw).catch(() => {}); w.close().catch(() => {}); return 'STT1:' + rtBkB64(new Uint8Array(await new Response(cs.readable).arrayBuffer())); } catch (e){} }
  return 'STT0:' + rtBkB64(raw);
}
/* pasted text → {ok, info} or {ok:false, why} */
async function rtBkRead(text){
  const bad = 'That does not look like a Sparks save code. Copy the whole code and try again.';
  try {
    text = String(text || '').trim();
    if (!text) return {ok: false, why: 'Paste your save code into the box first.'};
    if (!/^STT[01]:/.test(text)) return {ok: false, why: bad};
    const bytes = rtBkUnB64(text.slice(5));
    if (text.startsWith('STT1:')){ const ds = new DecompressionStream('gzip'), w = ds.writable.getWriter(); w.write(bytes).catch(() => {}); w.close().catch(() => {}); text = new TextDecoder().decode(await new Response(ds.readable).arrayBuffer()); } else text = new TextDecoder().decode(bytes);
    const o = JSON.parse(text); if (!o || typeof o.payload !== 'string' || !o.sum) return {ok: false, why: bad};
    if (rtBkHash(o.payload) !== o.sum) return {ok: false, why: 'This code is damaged or has been cut short, so it cannot be loaded. Copy the whole code again.'};
    const p = JSON.parse(o.payload);
    if (p.app !== 'sparks' || !p.data || typeof p.data !== 'object' || Array.isArray(p.data)) return {ok: false, why: bad};
    if (p.v > RT_BK_VER) return {ok: false, why: 'This code was saved by a newer version of Sparks Through Time. Open the newest version and try again.'};
    return {ok: true, info: p};
  } catch (e){ return {ok: false, why: 'That code could not be read. Make sure you pasted the whole code.'}; }
}
function rtBkWhen(at){ try { return new Date(at).toLocaleString('en-GB', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}); } catch (e){ return ''; } }
function rtBkStamps(d){ let n = 0; try { Object.values(d.p || {}).forEach(o => { if (o && o.learn) n++; if (o && o.challenge) n++; }); } catch (e){} return n; }
function rtBkApply(data){
  try { localStorage.setItem(RT_BK_PREV, JSON.stringify(Store.data)); } catch (e){}
  const keep = Store.data && Store.data.teacherOK; Store.data = data; if (keep) Store.data.teacherOK = true;
  Store.save(); renderHome();
}
function rtBackupSection(){
  const hasPrev = (() => { try { return !!localStorage.getItem(RT_BK_PREV); } catch (e){ return false; } })();
  const last = Store.data && Store.data.rt && Store.data.rt.bkAt;
  const out = h('div', {class: 'rt-bk'});
  const msg = h('div', {class: 'rt-bk-msg', 'aria-live': 'polite'}), box = h('div', {});
  const say = (t, ok) => { msg.textContent = t; msg.style.color = ok ? 'var(--ok)' : 'var(--bad)'; };
  const code = h('textarea', {class: 'rt-type', rows: '4', readonly: true, hidden: true, 'aria-label': 'Your save code'});
  const copy = h('button', {class: 'btn small', type: 'button', hidden: true}, 'Copy the code');
  const lastP = h('p', {class: 'scaleNote'}, last ? 'Last code made on this device: ' + rtBkWhen(last) + '.' : 'You have not made a save code on this device yet.');
  const paste = h('textarea', {class: 'rt-type', rows: '3', placeholder: 'Paste your save code here', 'aria-label': 'Paste your save code'});
  const make = h('button', {class: 'btn', type: 'button', id: 'rtBkMake'}, 'Show my save code');
  make.addEventListener('click', async () => {
    const r = (Store.data.rt = Store.data.rt || {}); r.bkAt = Date.now(); Store.save();
    code.value = await rtBkEncode(rtBkPack()); code.hidden = false; copy.hidden = false; code.select();
    lastP.textContent = 'Last code made on this device: ' + rtBkWhen(r.bkAt) + '.';
    say('Copy this code and keep it safe. Paste it into an email or a note to yourself.', true);
  });
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(code.value); } catch (e){ code.select(); document.execCommand && document.execCommand('copy'); } say('Code copied. Paste it into an email or a note to yourself.', true); });
  const check = h('button', {class: 'btn', type: 'button', id: 'rtBkCheck'}, 'Check this code');
  check.addEventListener('click', async () => {
    box.innerHTML = ''; const r = await rtBkRead(paste.value);
    if (!r.ok){ say(r.why, false); return; }
    const p = r.info, d = p.data, cards = d.rt && d.rt.cards ? Object.keys(d.rt.cards).length : 0, n = rtBkStamps(d), cur = Store.data || {};
    msg.textContent = '';
    box.append(h('div', {class: 'quiz-card', id: 'rtBkConfirm'},
      h('h4', {}, 'Load this progress?'),
      h('p', {}, `Found progress for ${d.studentName || 'a student'}${d.studentClass ? ' · ' + d.studentClass : ''}, saved on ${rtBkWhen(p.at)}. It has ${n} stamp${n === 1 ? '' : 's'} and ${cards} flashcard${cards === 1 ? '' : 's'} started.`),
      h('p', {}, `This replaces the progress on this device now${cur.studentName ? ' (' + cur.studentName + ')' : ''}. You can undo it afterwards.`),
      h('div', {class: 'row'}, h('button', {class: 'btn', type: 'button', onclick: () => { box.innerHTML = ''; }}, 'Cancel'), h('button', {class: 'btn primary', type: 'button', id: 'rtBkYes', onclick: () => rtBkApply(d)}, 'Load it'))));
  });
  const undo = hasPrev ? h('button', {class: 'btn small ghost', type: 'button', onclick: () => { try { const prev = JSON.parse(localStorage.getItem(RT_BK_PREV)); localStorage.removeItem(RT_BK_PREV); Store.data = prev; Store.save(); renderHome(); } catch (e){ say('Nothing to undo.', false); } }}, 'Undo my last load') : null;
  out.append(
    h('p', {}, 'Your progress is saved in this browser, on this device. To carry on from another device, make a save code and paste it there.'),
    h('div', {class: 'row'}, make, copy), code, lastP,
    h('details', {}, h('summary', {}, 'Load a save code'), h('div', {class: 'rt-fc', style: {gap: '8px', marginTop: '8px'}}, paste, h('div', {class: 'row'}, check, undo))),
    msg, box);
  return h('section', {class: 'rt-backup'}, h('h3', {}, '💾 Save code'), out);
}
