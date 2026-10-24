/* ===== Force HQ — utilities ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const G = 9.8;
const esc = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
/* numbers: up to dp decimals, trailing zeros removed, comma thousands */
function fmt(v, dp = 1) {
  if (v == null || isNaN(v)) return '–';
  const r = Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp);
  const s = Math.abs(r) >= 10000 ? r.toLocaleString('en-GB', { maximumFractionDigits: dp }) : String(r);
  return s === '-0' ? '0' : s;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const parseNum = s => { if (s == null) return NaN; s = String(s).trim().replace(/,/g, '').replace(/\s/g, ''); if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN; return parseFloat(s); };
const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? Math.max(0.05, Math.abs(b) * 0.01) : tol);
function rng(seed) { let a = (seed | 0) || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffled(arr, seed) { const r = rng(seed), a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const sstep = u => u * u * (3 - 2 * u);

/* ---- storage: always wrapped, works without storage ---- */
const STORE_KEY = 'forcehq2';
let DB = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { return {}; } })();
function saveDB() { try { localStorage.setItem(STORE_KEY, JSON.stringify(DB)); } catch (e) { } }
function dbGet(path, dflt) { let o = DB; for (const k of path.split('.')) { if (o == null || !(k in o)) return dflt; o = o[k]; } return o; }
function dbSet(path, val) { const ks = path.split('.'); let o = DB; ks.slice(0, -1).forEach(k => { if (typeof o[k] !== 'object' || o[k] === null) o[k] = {}; o = o[k]; }); o[ks[ks.length - 1]] = val; saveDB(); }
function dbDel(path) { const ks = path.split('.'); let o = DB; for (const k of ks.slice(0, -1)) { if (!o[k]) return; o = o[k]; } delete o[ks[ks.length - 1]]; saveDB(); }

/* ---- small DOM helpers ---- */
function h(tag, attrs = {}, html = '') { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (v === false || v == null) continue; if (k === 'class') e.className = v; else e.setAttribute(k, v === true ? '' : v); } if (html) e.innerHTML = html; return e; }
let toastTimer = null;
function toast(msg, kind = '') { const t = $('#toast'); t.innerHTML = msg; t.className = 'toast show ' + kind; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.className = 'toast', 3200); }
const RMOTION = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
/* Draggable pop-ups. Drag by the handle (pointer events, so mouse, pen and touch all work).
   The box keeps its header on screen, and its spot is remembered in DRAGPOS[key] while the page is open.
   Works for position:fixed boxes (no offsetParent) and position:absolute ones (left/top relative to the offsetParent). */
const DRAGPOS = {};
function dragClamp(box, x, y, handle) {
  const w = box.offsetWidth, vw = document.documentElement.clientWidth, vh = window.innerHeight;
  const hh = handle ? Math.min(box.offsetHeight, handle.getBoundingClientRect().bottom - box.getBoundingClientRect().top) : 56;   // box top to the bottom of the header
  return { x: clamp(x, 8, Math.max(8, vw - w - 8)), y: clamp(y, 8, Math.max(8, vh - hh - 8)) };
}
function dragPlace(box, key, handleSel) {
  const p = DRAGPOS[key]; if (!p) { box.classList.remove('placed'); box.style.left = box.style.top = box.style.width = ''; return; }
  const op = box.offsetParent, pr = op ? op.getBoundingClientRect() : { left: 0, top: 0 };
  box.classList.add('placed'); box.style.width = p.w + 'px';
  const c = dragClamp(box, p.x + pr.left, p.y + pr.top, box.querySelector(handleSel));
  box.style.left = (c.x - pr.left) + 'px'; box.style.top = (c.y - pr.top) + 'px';
}
function makeDraggable(box, handleSel, key, canDrag) {
  if (!box || box.dataset.drag) return; box.dataset.drag = '1'; let d = null;
  box.addEventListener('pointerdown', e => {
    const hd = e.target.closest(handleSel);
    if (!hd || !box.contains(hd) || e.button > 0 || e.target.closest('button, a, input, select, textarea, summary') || (canDrag && !canDrag())) return;
    const r = box.getBoundingClientRect(), op = box.offsetParent, pr = op ? op.getBoundingClientRect() : { left: 0, top: 0 };
    d = { id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, hd };
    box.classList.add('placed', 'dragging'); box.style.width = r.width + 'px'; box.style.left = (r.left - pr.left) + 'px'; box.style.top = (r.top - pr.top) + 'px';
    try { box.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault();
  });
  box.addEventListener('pointermove', e => {
    if (!d || e.pointerId !== d.id) return;
    const op = box.offsetParent, pr = op ? op.getBoundingClientRect() : { left: 0, top: 0 }, c = dragClamp(box, e.clientX - d.dx, e.clientY - d.dy, d.hd);
    box.style.left = (c.x - pr.left) + 'px'; box.style.top = (c.y - pr.top) + 'px';
    DRAGPOS[key] = { x: c.x - pr.left, y: c.y - pr.top, w: box.offsetWidth };
  });
  const end = e => { if (!d || e.pointerId !== d.id) return; d = null; box.classList.remove('dragging'); try { box.releasePointerCapture(e.pointerId); } catch (_) {} };
  box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
  window.addEventListener('resize', () => { if (DRAGPOS[key] && !box.hidden) dragPlace(box, key, handleSel); });
}
