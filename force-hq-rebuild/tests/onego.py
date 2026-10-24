import pathlib
from playwright.sync_api import sync_playwright
f=pathlib.Path('dist/test.html').resolve().as_uri(); OUT='/tmp/claude-0/-home-claude/bb04eafb-6d4a-58c1-b55c-0bbcd535d898/scratchpad/'
with sync_playwright() as p:
  b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':900}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.goto(f); pg.wait_for_timeout(300); pg.fill('#whoName','Mia'); pg.click('#whoGo')
  pg.evaluate("__fhq.dbSet('tourDone',true);__fhq.openChapter('c1f','review'); __fhq.ev(\"DB['revOpen_c1f']=true\"); __fhq.renderReview('c1f')"); pg.wait_for_timeout(300)
  q=pg.locator('#rq-r2'); sels=q.locator('select')
  for i in range(sels.count()): sels.nth(i).select_option(index=1)
  q.locator('.qchk').click(); pg.wait_for_timeout(150)
  print('sort:', q.locator('.qitem > .fb').inner_text(), '|', q.locator('.ptsb').count())
  assert sels.first.is_disabled()
  q.scroll_into_view_if_needed(); q.screenshot(path=OUT+'sort_locked.png')
  r1=pg.locator('#rq-r1'); bt=r1.locator('button[data-o]'); 
  for i in range(bt.count()):
    if i==0: bt.nth(i).click(); break
  pg.wait_for_timeout(100); print('mcq:', r1.locator('.qitem > .fb').inner_text()); r1.screenshot(path=OUT+'mcq_locked.png')
  print('bar:', pg.locator('.revbar').inner_text()[:80], errs)
