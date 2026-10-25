# My runs in the Journal: every push, pull and launch is logged with a sentence and numbers; the Journal opens beside
# the arena on the Runs tab; this step's runs are open and earlier runs are folded; the Your turn box has a big
# "See my runs" button; the calculator button stays visible over the Journal
import pathlib
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/'
with sync_playwright() as p:
  b = p.chromium.launch(); errs = []
  for w, h, tag in [(1440, 900, 'desk'), (390, 844, 'phone')]:
    pg = b.new_page(viewport={'width': w, 'height': h}); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName', 'Mia'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    def cards():
      for _ in range(12):
        n = pg.locator('#chunk [data-cb=next]')
        if n.count() and n.is_visible(): n.click(); pg.wait_for_timeout(80)
        else: break
    ev("openChapter('c1f','learn')"); pg.wait_for_timeout(300); ev("setStep(5)"); pg.wait_for_timeout(300); cards()
    pg.locator('#runBtn').click(); pg.wait_for_timeout(1500); pg.locator('#runBtn').click(); pg.wait_for_timeout(200)
    ev("openChapter('c2f','learn')"); pg.wait_for_timeout(300); ev("setStep(0)"); pg.wait_for_timeout(300); cards()
    for m in (24, 147):
      ev(f"S.mass={m}; resetSim(); labChanged()"); pg.locator('#shoveBtn').click(); pg.wait_for_timeout(900)
    ev("setStep(3)"); pg.wait_for_timeout(300); cards(); pg.locator("#launchBtn").click(); pg.wait_for_timeout(300)
    t0 = 0
    while ev("S.running") and t0 < 60: pg.wait_for_timeout(150); t0 += 1
    pg.wait_for_timeout(400)
    for t in ev("runsAll().map(runText)"): print('  -', t)
    assert ev("runsAll().length") >= 4
    # Your turn: big See my runs button opens the Journal on the Runs tab
    ev("qPlace('pop')"); pg.wait_for_timeout(300); assert pg.locator('#qCard .qrunsbtn').is_visible() and pg.locator('#qCard .run').count() == 0
    pg.screenshot(path=OUT + f'runs_qbox_{tag}.png')
    pg.locator('#qCard .qrunsbtn').click(); pg.wait_for_timeout(300); ev("qPlace('dock')")
    assert pg.locator('#journal').is_visible() and pg.locator('#journal [data-jtab="runs"][aria-selected="true"]').count() == 1
    openn = pg.locator('#journal details.run[open]').count(); closed = pg.locator('#journal details.run:not([open])').count(); print(tag, 'open (this step):', openn, 'folded (earlier):', closed)
    assert openn == 1 and closed >= 3
    # the calculator button is still there and clickable
    fb = pg.locator('#calcFab').bounding_box(); top = pg.evaluate(f"document.elementFromPoint({fb['x']+fb['width']/2},{fb['y']+fb['height']/2}).closest('#calcFab')!==null"); print(tag, 'calc button on top:', top); assert top
    pg.screenshot(path=OUT + f'runs_journal_{tag}.png')
    # open a folded run; tabs switch
    pg.locator('#journal details.run:not([open]) summary').first.click(); pg.wait_for_timeout(400); assert pg.locator('#journal details.run[open]').count() == 2, 'opened run stays open'
    pg.locator('#journal [data-jtab="notes"]').click(); pg.wait_for_timeout(200); pg.locator('#journal [data-jtab="vocab"]').click(); pg.wait_for_timeout(200); assert pg.locator('#journal .vitem').count() > 0
    pg.locator('#jClose').click(); pg.wait_for_timeout(200); assert pg.locator('#journal').is_hidden()
    print(tag, 'ok scrollW', pg.evaluate('document.documentElement.scrollWidth'))
  print('errors', errs)
