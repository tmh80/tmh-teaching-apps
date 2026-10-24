# Explore opens after the Chapter 1 Foundation: locked card with "Open it anyway", stamp modal opens it, teacher bypass
import pathlib
from playwright.sync_api import sync_playwright
f=pathlib.Path('dist/test.html').resolve().as_uri(); OUT='/tmp/claude-0/-home-claude/bb04eafb-6d4a-58c1-b55c-0bbcd535d898/scratchpad/'
with sync_playwright() as p:
  b=p.chromium.launch(); errs=[]
  pg=b.new_page(viewport={'width':1280,'height':860}); pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName','Mia'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
  pg.evaluate("__fhq.ev(\"show('vHome')\")"); pg.wait_for_timeout(200)
  card=pg.locator('#exploreCard'); print('locked:',card.locator('.kicker2').inner_text()); assert 'opens after' in card.inner_text().lower()
  pg.locator('#exploreCard').screenshot(path=OUT+'explore_locked.png')
  # stamp modal unlocks it and opens Explore
  pg.evaluate("__fhq.ev(\"awardStamp('c1f')\")"); pg.wait_for_timeout(200); assert 'Explore is now open' in pg.locator('#modal').inner_text()
  pg.screenshot(path=OUT+'stamp_explore.png')
  pg.click('#modal [data-act=explore]'); pg.wait_for_timeout(300); assert pg.locator('#vExplore').is_visible() and pg.locator('#modal').is_hidden()
  pg.evaluate("__fhq.ev(\"show('vHome')\")"); pg.wait_for_timeout(200); assert 'go to explore' in card.inner_text().lower()
  # fresh student: open anyway
  pg.evaluate("__fhq.resetDB()"); pg.reload(); pg.wait_for_timeout(400); pg.fill('#whoName','Leo'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)"); pg.evaluate("__fhq.ev(\"show('vHome')\")"); pg.wait_for_timeout(200)
  assert 'opens after' in card.inner_text().lower(); pg.click('#exploreCard [data-act=explore-anyway]'); pg.wait_for_timeout(300); assert pg.locator('#vExplore').is_visible()
  print('ok',errs)
