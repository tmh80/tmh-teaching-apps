# Key vocabulary: glossary words are added to the Journal once they have been on screen (or their definition opened)
import pathlib
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/claude-0/-home-claude/bb04eafb-6d4a-58c1-b55c-0bbcd535d898/scratchpad/'
with sync_playwright() as p:
  b = p.chromium.launch(); errs = []
  pg = b.new_page(viewport={'width': 1440, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e)))
  pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName', 'Mia'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
  ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
  ev("openChapter('c1f','learn')"); pg.wait_for_timeout(1800)
  v1 = ev("Object.keys(dbGet('vocab',{}))"); print('after step 1:', v1)
  assert 'force' in v1 and 'resultant' not in v1, 'only words on screen count'
  ev("setStep(4)"); pg.wait_for_timeout(1800); v2 = ev("Object.keys(dbGet('vocab',{}))"); print('after resultant step:', v2)
  assert 'resultant' in v2
  pg.locator('.top [data-journal]').click(); pg.wait_for_timeout(400)
  n = pg.locator('.journal .vitem').count(); print('journal words:', n); assert n == len(v2)
  pg.locator('#jg-vocab').scroll_into_view_if_needed(); pg.screenshot(path=OUT + 'vocab_journal.png')
  pg.fill('#vSearch', 'resul'); pg.wait_for_timeout(100); shown = pg.locator('.journal .vitem:not([hidden])').count(); print('search "resul":', shown); assert shown >= 1 and pg.locator('.journal .vitem[data-v="resultant force"]').is_visible()
  print('errors', errs)
