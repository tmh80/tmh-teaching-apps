import pathlib
from playwright.sync_api import sync_playwright
f=pathlib.Path('dist/test.html').resolve().as_uri(); OUT='/tmp/fhq-shots/'
with sync_playwright() as p:
  b=p.chromium.launch()
  for w,h,tag in [(1280,860,'desk'),(390,800,'phone')]:
    pg=b.new_page(viewport={'width':w,'height':h}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName','Mia'); pg.click('#whoGo')
    pg.evaluate("__fhq.dbSet('tourDone',true)"); pg.evaluate("__fhq.openChapter('c1f','learn')"); pg.wait_for_timeout(300)
    pg.evaluate("__fhq.setStep(1)"); pg.wait_for_timeout(200)
    for _ in range(12):
      n=pg.locator('body > .chunk .go, .chunk .cnav .go')
      if n.count() and n.first.is_visible(): n.first.click(); pg.wait_for_timeout(80)
      else: break
    assert pg.locator('#qCard').is_hidden(), 'card should be hidden before Next'
    print(tag,'next label:',pg.locator('#gNext').inner_text())
    pg.click('#gNext'); pg.wait_for_timeout(150)
    print(tag,'warning:',pg.locator('#modal h2').inner_text())
    pg.click('#contAnyway'); pg.wait_for_timeout(200)
    assert pg.locator('#qPop').is_visible(); pg.screenshot(path=OUT+f'qpop_{tag}.png')
    pg.click('#qMin'); pg.wait_for_timeout(150); assert pg.locator('#qPop').is_hidden() and pg.locator('#qCard.docked').is_visible()
    pg.locator('#qCard').scroll_into_view_if_needed(); pg.screenshot(path=OUT+f'qdock_{tag}.png')
    pg.click('#qOpen'); pg.wait_for_timeout(150); assert pg.locator('#qPop').is_visible()
    pg.keyboard.press('Escape'); pg.wait_for_timeout(100); assert pg.locator('#qPop').is_hidden()
    pg.click('#gNext'); pg.wait_for_timeout(150); pg.click('#modal [data-close]'); pg.wait_for_timeout(100); assert pg.locator('#qPop').is_hidden(), 'go back should stay on arena'
    print(tag,'ok',errs, 'scrollW',pg.evaluate('document.documentElement.scrollWidth'))
