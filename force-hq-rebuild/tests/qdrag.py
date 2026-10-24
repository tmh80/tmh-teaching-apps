# Your turn pop-up: drag by header (mouse + touch), arena usable underneath, header stays on screen, position remembered
import pathlib
from playwright.sync_api import sync_playwright
f=pathlib.Path('dist/test.html').resolve().as_uri(); OUT='/tmp/claude-0/-home-claude/bb04eafb-6d4a-58c1-b55c-0bbcd535d898/scratchpad/'
with sync_playwright() as p:
  b=p.chromium.launch()
  for w,h,tag,touch in [(1280,860,'desk',False),(390,800,'phone',True)]:
    pg=b.new_page(viewport={'width':w,'height':h},has_touch=touch); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName','Mia'); pg.click('#whoGo')
    pg.evaluate("__fhq.dbSet('tourDone',true)"); pg.evaluate("__fhq.openChapter('c1f','learn')"); pg.wait_for_timeout(300)
    pg.evaluate("__fhq.setStep(2)"); pg.wait_for_timeout(200); pg.evaluate("__fhq.ev(\"qPlace('pop')\")"); pg.wait_for_timeout(200)
    box=pg.locator('#qPopBox'); r0=box.bounding_box(); hd=pg.locator('#qCard .qhead').bounding_box()
    sx,sy=hd['x']+hd['width']*0.45,hd['y']+12
    pg.mouse.move(sx,sy); pg.mouse.down(); pg.mouse.move(sx+(-300 if w>500 else 0),sy+380,steps=8); pg.mouse.up(); pg.wait_for_timeout(100)
    r1=box.bounding_box(); print(tag,'moved from',(round(r0['x']),round(r0['y'])),'to',(round(r1['x']),round(r1['y'])))
    assert r1['y']>r0['y']+300, 'box should move down'
    pg.screenshot(path=OUT+f'qdrag_{tag}.png')
    # arena underneath is usable: the element at a point outside the box is not the overlay
    top=pg.evaluate("(()=>{const e=document.elementFromPoint(innerWidth/2,30);return e&&e.closest('#qPop')?'overlay':'page'})()"); assert top=='page', top
    # drag far off screen: header must stay visible
    hd=pg.locator('#qCard .qhead').bounding_box(); pg.mouse.move(hd['x']+40,hd['y']+12); pg.mouse.down(); pg.mouse.move(hd['x']+40,h+500,steps=5); pg.mouse.up()
    hd2=pg.locator('#qCard .qhead').bounding_box(); assert hd2['y']+hd2['height']<=h+1, ('header off screen',hd2)
    # minimise then reopen: remembered spot
    pg.click('#qMin'); pg.wait_for_timeout(100); assert pg.locator('#qPop').is_hidden()
    pg.locator('#qOpen').scroll_into_view_if_needed(); pg.click('#qOpen'); pg.wait_for_timeout(150)
    r3=box.bounding_box(); assert abs(r3['y']-hd2['y'])<20, ('position not remembered',r3,hd2)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(100); assert pg.locator('#qPop').is_hidden()
    # buttons in the header still work (no drag)
    pg.evaluate("__fhq.ev(\"qPlace('pop')\")"); pg.wait_for_timeout(100); pg.click('#qMin'); assert pg.locator('#qPop').is_hidden()
    print(tag,'ok',errs,'scrollW',pg.evaluate('document.documentElement.scrollWidth'))
