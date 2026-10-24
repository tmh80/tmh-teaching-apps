# My runs: every push, pull and launch is logged with a sentence and key numbers; shown in the side panel,
# under the Your turn questions and in the Journal (with Pop out)
import pathlib
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/claude-0/-home-claude/bb04eafb-6d4a-58c1-b55c-0bbcd535d898/scratchpad/'
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
    # Chapter 1 friction step: a stuck pull, then the air floor
    ev("openChapter('c1f','learn')"); pg.wait_for_timeout(300); ev("setStep(4)"); pg.wait_for_timeout(300); cards()
    pg.locator('#runBtn').click(); pg.wait_for_timeout(1600); live = ev("runText(RUN)"); print(tag, 'live:', live)
    pg.locator('#runBtn').click(); pg.wait_for_timeout(200)
    # Chapter 2: two pushes and a launch
    ev("openChapter('c2f','learn')"); pg.wait_for_timeout(300); ev("setStep(0)"); pg.wait_for_timeout(300); cards()
    for m in (24, 147):
      ev(f"S.mass={m}; resetSim(); labChanged()"); pg.locator('#shoveBtn').click(); pg.wait_for_timeout(900)
    ev("setStep(3)"); pg.wait_for_timeout(300); cards(); pg.locator('#launchBtn').click(); pg.wait_for_timeout(300)
    t0 = 0
    while ev("S.running") and t0 < 60: pg.wait_for_timeout(150); t0 += 1
    pg.wait_for_timeout(400)
    R = ev("JSON.stringify(runsAll().map(r=>[r.n,r.kind,r.out,r.label]))"); print(tag, R)
    for t in ev("runsAll().map(runText)"): print('  -', t)
    assert ev("runsAll().length") >= 4
    # side panel
    pg.locator('#runsTab').click(); pg.wait_for_timeout(300); assert pg.locator('#runsPanel').is_visible()
    print(tag, 'panel items (this step):', pg.locator('#runsPanel .run').count())
    pg.locator('#runsPanel [data-rf="all"]').click(); pg.wait_for_timeout(300); print(tag, 'panel items (all):', pg.locator('#runsPanel .run').count())
    pg.screenshot(path=OUT + f'runs_panel_{tag}.png')
    pg.locator('#rpClose').click(); pg.wait_for_timeout(200); assert pg.locator('#runsPanel').is_hidden()
    # question box shows this step's runs
    ev("qPlace('pop')"); pg.wait_for_timeout(300); assert pg.locator('#qCard .qruns .run').count() >= 1, 'runs in Your turn'
    pg.screenshot(path=OUT + f'runs_qbox_{tag}.png')
    pg.locator('#qCard [data-runs]').click(); pg.wait_for_timeout(300); assert pg.locator('#runsPanel').is_visible()
    pg.locator('#rpClose').click(); ev("qPlace('dock')")
    # Journal: My runs + Pop out
    pg.locator('.top [data-journal]').click(); pg.wait_for_timeout(300); assert pg.locator('.journal #jg-runs .run').count() >= 4
    pg.locator('.journal #jg-runs').scroll_into_view_if_needed(); pg.screenshot(path=OUT + f'runs_journal_{tag}.png')
    pg.locator('.journal [data-runs]').click(); pg.wait_for_timeout(300); assert pg.locator('.journal').count() == 0 and pg.locator('#runsPanel').is_visible()
    print(tag, 'ok scrollW', pg.evaluate('document.documentElement.scrollWidth'))
  print('errors', errs)
