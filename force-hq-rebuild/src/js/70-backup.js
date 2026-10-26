/* ===== Progress backup: save everything to a file (or a code), load it on any device =====
   All progress lives in DB (one object in localStorage). The file holds a copy of it plus a checksum, so a damaged file is caught.
   Teacher unlocks are never saved. A load always asks first, and the progress it replaces is kept so it can be undone. */
const BK_VER = 1, BK_PREV = STORE_KEY + '_prev';
const bkHash = s => { let h1 = 0xdeadbeef ^ s.length, h2 = 0x41c6ce57; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909); h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909); return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36); };
const bkB64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const bkUnB64 = s => Uint8Array.from(atob(s.replace(/\s/g, '')), c => c.charCodeAt(0));
function bkPack() {
  const d = JSON.parse(JSON.stringify(DB)); delete d.unlocked; delete d.bkAt; if (d.user && d.user.teacher) delete d.user;
  const at = Date.now(), payload = JSON.stringify({ app: 'forcehq', v: BK_VER, at, name: (d.user && d.user.name) || '', cls: (d.user && d.user.cls) || '', data: d });
  return { text: JSON.stringify({ sum: bkHash(payload), payload }), at, name: (d.user && d.user.name) || '', cls: (d.user && d.user.cls) || '' };
}
async function bkEncode(text) {
  const raw = new TextEncoder().encode(text);
  if (window.CompressionStream) { try { const cs = new CompressionStream('gzip'), w = cs.writable.getWriter(); w.write(raw); w.close(); return 'FHQ1:' + bkB64(new Uint8Array(await new Response(cs.readable).arrayBuffer())); } catch (e) { } }
  return 'FHQ0:' + bkB64(raw);
}
/* text from a file or a pasted code → { ok, info } or { ok:false, why } */
async function bkRead(text) {
  try {
    text = String(text || '').trim();
    if (/^FHQ[01]:/.test(text)) {
      const gz = text.startsWith('FHQ1:'), bytes = bkUnB64(text.slice(5));
      if (gz) { const ds = new DecompressionStream('gzip'), w = ds.writable.getWriter(); w.write(bytes); w.close(); text = new TextDecoder().decode(await new Response(ds.readable).arrayBuffer()); } else text = new TextDecoder().decode(bytes);
    }
    const o = JSON.parse(text); if (!o || typeof o.payload !== 'string' || !o.sum) return { ok: false, why: 'That does not look like a Force HQ progress file.' };
    if (bkHash(o.payload) !== o.sum) return { ok: false, why: 'The file is damaged or has been changed, so it cannot be loaded. Try the original file again.' };
    const p = JSON.parse(o.payload); if (p.app !== 'forcehq' || !p.data) return { ok: false, why: 'That does not look like a Force HQ progress file.' };
    if (p.v > BK_VER) return { ok: false, why: 'This file was saved by a newer version of Force HQ. Open the newest version and try again.' };
    return { ok: true, info: p };
  } catch (e) { return { ok: false, why: 'That could not be read. Make sure you chose the progress file, or pasted the whole code.' }; }
}
const bkWhen = at => { try { return new Date(at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
const bkStepsDone = d => { let n = 0; try { Object.values(d.learnDone || {}).forEach(o => { n += Object.keys(o || {}).length; }); } catch (e) { } return n; };
function bkApply(data, at) {
  try { localStorage.setItem(BK_PREV, JSON.stringify(DB)); } catch (e) { }
  DB = data; DB.bkAt = at || Date.now(); saveDB();
  let stored = false; try { stored = localStorage.getItem(STORE_KEY) != null; } catch (e) { }
  if (stored) location.reload(); else { closeModal(); refreshWho(); renderHome(); toast('Progress loaded.'); }
}
function bkDownload(text, fname) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = fname; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
function openBackup(startOn) {
  const u = user(), hasPrev = (() => { try { return !!localStorage.getItem(BK_PREV); } catch (e) { return false; } })();
  openModal(`<div class="modal bk" id="bkBox"><h2>💾 Save or load my progress</h2>
    <p>Your progress is saved in this browser, on this device. To keep a backup, or to carry on from another device, save a progress file. <b>Email it to yourself</b> or put it in your OneDrive or Google Drive.</p>
    <h3>Save</h3><div class="row"><button type="button" class="go" id="bkSave">Save my progress file</button></div>
    <p class="scaleNote" id="bkLast">${DB.bkAt ? 'Last saved on this device: ' + esc(bkWhen(DB.bkAt)) + '.' : 'You have not saved a progress file on this device yet.'}</p>
    <details class="clue"><summary>The download did not work? Use a progress code instead</summary><div class="gl"><button type="button" class="mini" id="bkMakeCode">Show my progress code</button><textarea id="bkCode" readonly rows="4" hidden aria-label="Your progress code"></textarea><button type="button" class="mini" id="bkCopy" hidden>Copy the code</button><p class="scaleNote">Paste the code into an email or a note. It can be long.</p></div></details>
    <h3>Load</h3><p>Choose a progress file you saved before. You will see what it contains before anything changes.</p>
    <input type="file" id="bkFile" accept=".json,.txt,.fhq,application/json,text/plain" aria-label="Choose your progress file">
    <details class="clue" ${startOn === 'code' ? 'open' : ''}><summary>Load from a progress code instead</summary><div class="gl"><textarea id="bkPaste" rows="3" aria-label="Paste your progress code"></textarea><button type="button" class="mini" id="bkLoadCode">Check this code</button></div></details>
    <div id="bkMsg" class="fb" aria-live="polite"></div>
    <div class="row" style="justify-content:space-between"><button type="button" class="mini" data-close>Close</button>${hasPrev ? '<button type="button" class="mini" id="bkUndo">Undo my last load</button>' : ''}</div></div>`);
  const msg = (t, k) => { const m = $('#bkMsg'); m.className = 'fb ' + (k || ''); m.innerHTML = t; };
  $('#bkSave').addEventListener('click', async () => {
    const pk = bkPack(), nm = (pk.name || 'student').replace(/[^\w\-]+/g, '_'), cl = (pk.cls || '').replace(/[^\w\-]+/g, '_'), d = new Date(pk.at), ymd = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    try { bkDownload(pk.text, `ForceHQ-${nm}${cl ? '-' + cl : ''}-${ymd}.fhq.json`); } catch (e) { msg('The download was blocked. Use the progress code below instead.', 'no'); return; }
    DB.bkAt = pk.at; saveDB(); $('#bkLast').textContent = 'Saved on ' + bkWhen(pk.at) + '.';
    msg('Your progress file is downloading. <b>Now email it to yourself</b> or save it in your OneDrive or Google Drive. Check it in your Downloads folder if you cannot see it.', 'ok');
  });
  $('#bkMakeCode').addEventListener('click', async () => { const t = $('#bkCode'); t.value = await bkEncode(bkPack().text); t.hidden = false; $('#bkCopy').hidden = false; t.select(); });
  $('#bkCopy').addEventListener('click', async () => { const t = $('#bkCode'); try { await navigator.clipboard.writeText(t.value); } catch (e) { t.select(); document.execCommand && document.execCommand('copy'); } msg('Code copied. Paste it into an email or a note to yourself.', 'ok'); });
  const review = async text => {
    const r = await bkRead(text); if (!r.ok) { msg(r.why, 'no'); return; }
    const p = r.info, cur = user().name && !user().teacher ? user() : null, steps = bkStepsDone(p.data);
    openModal(`<div class="modal bk"><h2>Load this progress?</h2><p>Found progress for <b>${esc(p.name || 'a student')}${p.cls ? ' · ' + esc(p.cls) : ''}</b>, saved on ${esc(bkWhen(p.at))}. It has ${steps} Learn step${steps === 1 ? '' : 's'} finished.</p>
      <p>${cur ? `This replaces the progress on this device now (<b>${esc(cur.name)}${cur.cls ? ' · ' + esc(cur.cls) : ''}</b>). ` : ''}You can undo the load afterwards.</p>
      <div class="row" style="justify-content:space-between"><button type="button" class="mini" id="bkNo">Cancel</button><button type="button" class="go" id="bkYes">Load it</button></div></div>`);
    $('#bkNo').addEventListener('click', () => openBackup()); $('#bkYes').addEventListener('click', () => bkApply(p.data, p.at));
  };
  $('#bkFile').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => review(rd.result); rd.onerror = () => msg('That file could not be opened.', 'no'); rd.readAsText(f); });
  $('#bkLoadCode').addEventListener('click', () => review($('#bkPaste').value));
  const un = $('#bkUndo'); if (un) un.addEventListener('click', () => { try { const prev = JSON.parse(localStorage.getItem(BK_PREV)); localStorage.removeItem(BK_PREV); DB = prev; saveDB(); location.reload(); } catch (e) { msg('Nothing to undo.', 'no'); } });
}
/* "Not you? Start fresh": clears this browser's saved progress after a clear warning */
function bkFresh() {
  openModal(`<div class="modal bk"><h2>Start fresh on this device?</h2><p>This clears the progress saved in this browser, so the next person can begin from the start. <b>If the progress is yours, save a progress file first.</b></p>
    <div class="row" style="justify-content:space-between"><button type="button" class="mini" id="frNo">Cancel</button><button type="button" class="ghost" id="frSave">Save a progress file first</button><button type="button" class="go" id="frYes">Yes, start fresh</button></div></div>`);
  $('#frNo').addEventListener('click', () => { closeModal(); });
  $('#frSave').addEventListener('click', () => openBackup());
  $('#frYes').addEventListener('click', () => { const keep = DB.tourDone; DB = {}; if (keep) DB.tourDone = keep; saveDB(); closeModal(); refreshWho(); renderHome(); });
}
const bkBtn = document.getElementById('bkBtn'); if (bkBtn) bkBtn.addEventListener('click', () => openBackup());
