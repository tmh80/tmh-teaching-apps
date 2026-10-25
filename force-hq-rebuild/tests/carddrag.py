# Info cards over the arena: drag by the header (mouse + touch), header stays on screen, spot kept for the next card
import pathlib
from playwright.sync_api import sync_playwright
f=pathlib.Path('dist/test.html').resolve().as_uri(); OUT='/tmp/fhq-shots/'
with sync_playwright() as p:
  b=p.chromium.launch()
  for w,h,tag,touch in [(1280,860,'desk',False),(390,800,'phone',True)]:
    pg=b.new_page(viewport={'width':w,'height':h},has_touch=touch); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f); pg.wait_for_timeout(400); pg.fill('#whoName','Mia'); pg.click('#whoGo')
    pg.evaluate("__fhq.dbSet('tourDone',true)"); pg.evaluate("__fhq.openChapter('c1f','learn')"); pg.wait_for_timeout(300)
    pg.evaluate("__fhq.setStep(4)"); pg.wait_for_timeout(300)
    ch=pg.locator('#chunk'); assert ch.is_visible(); r0=ch.bounding_box(); hd=pg.locator('#chunk .chead').bounding_box()
    sx,sy=hd['x']+40,hd['y']+hd['height']/2
    dx,dy=(250,250) if w>500 else (0,-300)
    pg.mouse.move(sx,sy); pg.mouse.down(); pg.mouse.move(sx+dx,sy+dy,steps=8); pg.mouse.up(); pg.wait_for_timeout(100)
    r1=ch.bounding_box(); print(tag,'card moved',(round(r0['x']),round(r0['y'])),'->',(round(r1['x']),round(r1['y'])))
    assert abs((r1['x']-r0['x'])-dx)<12 and abs((r1['y']-r0['y'])-dy)<12, 'card should follow the pointer'
    pg.screenshot(path=OUT+f'carddrag_{tag}.png')
    # next card keeps the spot, buttons still work
    rel=lambda: pg.evaluate("(()=>{const a=document.querySelector('#chunk').getBoundingClientRect(),b=document.querySelector('#chunk').offsetParent;const r=b?b.getBoundingClientRect():{top:0,left:0};return [a.left-r.left,a.top-r.top]})()")
    k1=rel(); pg.click('#chunk [data-cb=next]'); pg.wait_for_timeout(150); k2=rel(); assert abs(k1[0]-k2[0])<4 and abs(k1[1]-k2[1])<4, ('spot not kept',k1,k2)
    # drag far away: header stays visible
    hd=pg.locator('#chunk .chead').bounding_box(); pg.mouse.move(hd['x']+40,hd['y']+10); pg.mouse.down(); pg.mouse.move(hd['x']+40,h+400,steps=5); pg.mouse.up()
    hd2=pg.locator('#chunk .chead').bounding_box(); assert hd2['y']+hd2['height']<=h+1 and hd2['y']>=0, hd2
    print(tag,'ok',errs,'scrollW',pg.evaluate('document.documentElement.scrollWidth'))
