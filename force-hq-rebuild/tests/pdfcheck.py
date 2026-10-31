"""Shared helper for the PDF download tests. download_check(pg, chId, mode, outdir, ...) presses the real Download button, saves the file, and returns what is in it.
Needs poppler (pdfinfo, pdftotext, pdftoppm). The print preview page count comes from Chromium's own print-to-PDF of the same sheet."""
import pathlib, re, subprocess
def _run(*a): return subprocess.run(list(a), capture_output=True, text=True).stdout
def pages_of(path): m = re.search(r'Pages:\s+(\d+)', _run('pdfinfo', str(path))); return int(m.group(1)) if m else 0
def text_pages(path):   # pages that have any text (Chromium's print of the whole app can add a blank trailing page)
    n = pages_of(path); return sum(1 for i in range(1, n + 1) if _run('pdftotext', '-f', str(i), '-l', str(i), str(path), '-').strip())
def download_check(pg, ch, mode, outdir, tag=None):
    out = pathlib.Path(outdir); out.mkdir(parents=True, exist_ok=True); tag = tag or f'{ch}_{mode}'
    pg.evaluate(f"__fhq.openSheet('{ch}','{mode}')"); pg.wait_for_selector('#wsDown', timeout=5000)
    with pg.expect_download(timeout=90000) as dl: pg.click('#wsDown')
    d = dl.value; path = out / (tag + '.pdf'); d.save_as(str(path)); msg = pg.locator('#wsMsg').inner_text() if pg.locator('#wsMsg').is_visible() else ''
    # the print preview: same HTML in #printArea, printed by Chromium with the app's own print CSS
    pg.evaluate("[]")
    prev = out / (tag + '_print.pdf')
    pg.evaluate("(()=>{const m=document.querySelector('.modalback'); if(m) m.style.display='none'; document.querySelector('#printArea').innerHTML='<style>'+__fhq.WS_CSS+'</style>'+__fhq.ev(\"wsSheetHTML('%s','%s')\")})()" % (ch, mode))
    pg.pdf(path=str(prev), format='A4', margin={'top': '12mm', 'bottom': '12mm', 'left': '12mm', 'right': '12mm'}, print_background=True)
    pg.evaluate("(()=>{document.querySelector('#printArea').innerHTML=''; const m=document.querySelector('.modalback'); if(m) m.style.display=''})()")
    pg.evaluate("document.querySelectorAll('.modalback').forEach(m=>m.remove())")
    n = pages_of(path); np_ = text_pages(prev)
    subprocess.run(['pdftoppm', '-r', '60', '-png', str(path), str(out / tag)], capture_output=True)
    return dict(filename=d.suggested_filename, pages=n, print_pages=np_, text=_run('pdftotext', '-layout', str(path), '-'), path=path, msg=msg, info=_run('pdfinfo', str(path)))
