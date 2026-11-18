/* ===== Worksheet file names, the print path and the direct PDF download =====
   wsFileName(chId, mode) names every saved sheet. downloadWorksheetPdf(chId, mode, ui) builds the sheet off-screen, renders each A4 page with html2canvas,
   puts the pages into one PDF with jsPDF, and adds an invisible text layer so Toddle AI can read the words as well as see them.
   html2canvas and jsPDF are inlined from vendor/ by build.py (no internet needed). Ported from Sparks Through Time and adapted to Force HQ's HTML-string worksheets. */
const cleanFileName = s => String(s || '').replace(/[\/\\:*?"<>|\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120).trim();
function wsWho(mode) {
  if (mode === 'student' || mode === 'progress' || mode === 'gym') return (user().name || '').trim() || (isTeacher() ? 'Teacher copy' : 'Student');
  return mode === 'blank' ? 'Blank template' : mode === 'scheme' ? 'Marking scheme' : 'Answer key';
}
/* Force HQ Ch3 Foundation (F = ma) - Alex Chen   |   ... - Blank template / Answer key / Marking scheme   |   Force HQ - My work so far - Alex Chen */
function wsFileName(chId, mode) {
  if (mode === 'progress') return cleanFileName(`Force HQ - My work so far - ${wsWho(mode)}`);
  if (mode === 'gym') return cleanFileName(`Force HQ Maths Gym - ${wsWho(mode)}`);
  const ch = secOf(chId);
  return cleanFileName(`Force HQ Ch${ch.n} ${ch.part} (${ch.title}) - ${wsWho(mode)}`);
}
const wsNeedsName = mode => !isTeacher() && (((mode === 'student' || mode === 'progress') && !user().name) || (mode === 'gym' && !((user().name || '').trim() && (user().cls || '').trim())));   // the Maths Gym summary needs the class too

/* Browsers suggest the page title as the PDF name, so set it while the print window is open and put it back afterwards. */
function printAs(fileName) {
  const old = document.title; let back = false;
  const restore = () => { if (back) return; back = true; document.title = old; window.removeEventListener('afterprint', restore); };
  document.title = fileName; window.addEventListener('afterprint', restore);
  try { window.print(); } catch (e) { restore(); throw e; }
  setTimeout(restore, 3000);   // for browsers that never fire afterprint
}

/* jsPDF's built-in font only handles basic characters, so tidy the invisible text layer. */
function pdfSafeText(t) {
  const map = { '−': '-', '–': '-', '—': '-', '‘': "'", '’': "'", '“': '"', '”': '"', '×': 'x', '÷': '/', '²': '^2', '³': '^3', '→': '->', '←': '<-', '✓': '[x]', '✔': '[x]', '☑': '[x]', '✗': '[ ]', '✘': '[ ]', '☐': '[ ]', '◐': '[half]', '…': '...', '•': '*', '≈': '~', '≤': '<=', '≥': '>=', '‑': '-', ' ': ' ', ' ': ' ', '​': '' };
  return String(t || '').replace(/[−–—‘’“”×÷²³→←✓✔☑✗✘☐◐…•≈≤≥‑   ​]/g, c => map[c]).replace(/[^\x09\x0a\x20-\x7e\xa0-\xff]/g, '').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n');   // anything else (emoji, symbols) is dropped
}
async function getDownloadsCap() { try { return (window.claude && window.claude.use) ? await window.claude.use('downloads') : null; } catch (e) { return null; } }

/* html2canvas can't see the page's CSS inside SVG pictures, so write the final colours into each shape first. */
function inlineSvgStyles(root) {
  const props = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'fill-opacity', 'stroke-opacity', 'opacity', 'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline', 'stop-color', 'stop-opacity', 'visibility'];
  root.querySelectorAll('svg, svg *').forEach(el => { const cs = getComputedStyle(el); props.forEach(p => { const v = cs.getPropertyValue(p); if (v) el.style.setProperty(p, v); }); });
}

const WS_PAGE_W = 718, WS_PAGE_H = 1040;   // A4 content width and height in CSS pixels (188 mm x 275 mm)
/* Every .page of the sheet starts a new PDF page. Inside a .page the child blocks are packed into A4 pages: a .q is never split and an h2 stays with the block after it
   (the same rules as the print CSS). The feedback page is already its own .page. Returns the PDF page elements. */
function paginateWsSheet(sheet, host) {
  const pages = [], fresh = () => { const pg = document.createElement('div'); pg.className = 'ws pdfpg'; pg.style.cssText = `width:${WS_PAGE_W}px;max-width:none;margin:0;background:#fff;padding:0`; host.appendChild(pg); pages.push(pg); return pg; };
  [...sheet.children].forEach(page => {
    if (!page.classList.contains('page')) { const pg = fresh(); pg.appendChild(page); return; }
    const units = []; let head = [];
    [...page.children].forEach(el => { if (el.tagName === 'H2') { head.push(el); return; } units.push(head.concat([el])); head = []; });
    if (head.length) units.push(head);
    let cur = fresh();
    units.forEach(u => {
      u.forEach(e => cur.appendChild(e));
      if (cur.offsetHeight > WS_PAGE_H && cur.children.length > u.length) { u.forEach(e => e.remove()); cur = fresh(); u.forEach(e => cur.appendChild(e)); }
    });
  });
  return pages;
}

/* ui = { busy(msg), saved(name), failed(), declined() } */
async function downloadSheetPdf(html, fileName, ui) {
  let host = null; const root = document.documentElement, prevTheme = root.getAttribute('data-theme');
  try {
    if (typeof html2canvas !== 'function' || !(window.jspdf && window.jspdf.jsPDF)) throw new Error('The PDF maker is missing.');
    ui.busy('Making your PDF. This takes a few seconds…');
    root.setAttribute('data-theme', 'light');   // the sheet is always light, whatever the screen is doing
    host = document.createElement('div'); host.setAttribute('aria-hidden', 'true'); host.style.cssText = `position:fixed;left:-20000px;top:0;width:${WS_PAGE_W + 40}px;background:#fff;color:#13212a;pointer-events:none`;
    host.innerHTML = `<style>${WS_CSS}</style>` + html; document.body.appendChild(host);
    const sheet = $('.ws', host);
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) { }
    await Promise.all([...host.querySelectorAll('img')].map(im => im.decode ? im.decode().catch(() => { }) : null));
    inlineSvgStyles(host);
    const pages = paginateWsSheet(sheet, host); sheet.remove();
    const { jsPDF } = window.jspdf, doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    doc.setProperties({ title: fileName });
    const MX = 11, CW = 188, CH = 275;
    for (let i = 0; i < pages.length; i++) {
      const pg = pages[i], text = pdfSafeText(pg.innerText);
      const canvas = await html2canvas(pg, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true, windowWidth: WS_PAGE_W + 40 });
      if (i) doc.addPage('a4', 'portrait');
      let w = CW, hh = canvas.height / canvas.width * CW; if (hh > CH) { w = w * CH / hh; hh = CH; }
      doc.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', MX, MX, w, hh);
      /* the invisible text layer: the page's words, spread down the page, so a reader (or Toddle AI) can pick them up */
      const lines = doc.splitTextToSize(text, CW), lh = Math.min(3.2, CH / Math.max(1, lines.length)), fs = Math.max(2, Math.min(8, lh * 2.4)); doc.setFontSize(fs);
      doc.text(lines, MX, MX, { renderingMode: 'invisible', lineHeightFactor: (lh * 72 / 25.4) / fs, baseline: 'top' });
    }
    const blob = doc.output('blob'), name = fileName + '.pdf', dl = await getDownloadsCap();
    if (dl) { try { await dl.save({ filename: name, data: blob }); } catch (e) { if (e && e.code === 'declined') { ui.declined && ui.declined(); return false; } throw e; } }   // the claude.ai preview
    else { const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
    ui.saved(name); return true;
  } catch (err) { try { console.error(err); } catch (e) { } ui.failed(); return false; }
  finally { if (host) host.remove(); if (prevTheme) root.setAttribute('data-theme', prevTheme); else root.removeAttribute('data-theme'); }
}
/* the sheet for a mode, the same HTML that the print path uses */
function wsSheetHTML(chId, mode) { return mode === 'progress' ? progressHTML() : mode === 'gym' ? pgSheetHTML() : mode === 'scheme' ? `<div class="ws"><div class="page">${schemeHTML(chId)}</div></div>` : buildWorksheet(chId, mode); }
function downloadWorksheetPdf(chId, mode, ui, html) {
  if (wsNeedsName(mode)) { ui.noName && ui.noName(); return Promise.resolve(false); }   // the same gate as printing: no name, no worksheet
  return downloadSheetPdf(html || wsSheetHTML(chId, mode), wsFileName(chId, mode), ui);
}
