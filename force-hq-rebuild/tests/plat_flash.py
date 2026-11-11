"""A platform dropped where a machine stands flashes red and goes back (Tom, 11 Nov 2026: the board froze with "Cannot read properties of undefined (reading 's')").
The flash must draw without an error, and the board must keep drawing.   Run after build.py:  python3 tests/plat_flash.py"""
import sys
from playwright.sync_api import sync_playwright
ns = {}; exec(open('tests/play_rescue.py').read().split('with sync_playwright')[0], ns)
open_part5, Board = ns['open_part5'], ns['Board']
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 950}); errs = []
    pg.on('pageerror', lambda e: errs.append(e.message)); pg.on('console', lambda m: m.type in ('warning', 'error') and errs.append(m.text))
    open_part5(pg); B = Board(pg)
    for c in ("{ size: 'M', x: 20, h: 2 }", "{ type: 'platform', size: 'S', x: 30, h: 3 }"):
        B.ev(f"glPlatFlash({c})"); pg.wait_for_timeout(350); f1 = B.evr('GLB.raf'); pg.wait_for_timeout(300)
        chk('the red flash draws and the board keeps drawing ' + c, B.evr('GLB.raf') != f1 and not errs, errs)
    b.close()
print(f'{len(fails)} failed: {fails}' if fails else 'all passed'); sys.exit(1 if fails else 0)
