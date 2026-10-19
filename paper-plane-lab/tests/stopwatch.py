import os
import sys
from playwright.sync_api import sync_playwright
DV=sys.argv[1]; MODE=sys.argv[2]  # MODE: space | click
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
    pg=b.new_page(viewport={'width':1366,'height':768})
    pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','dist','test.html'))+'')
    # jump straight to a ready lab state
    pg.evaluate(f'''(()=>{{const T=window.__T;let s=T.S;s.name='A';s.cls='6';s.level='developing';s.started=true;s.seed=123;s.iv='span';s.dv='{DV}';s.levels=[6,8,10];s.env='inside';s.launch='hand';s.seen={{tour:1,observe:1,question:1,hypothesis:1,plan:1,lab:1}};s.step='lab';T.S=s;T.render()}})()''')
    pg.wait_for_timeout(400)
    for t in range(2):
        pg.mouse.wheel(0,120 if t else 0); pg.wait_for_timeout(200)
        y0=pg.evaluate('scrollY')
        pg.click('[data-act="lab:launch"]')
        pg.wait_for_function('window.__T.LAB.state==="flying"',timeout=8000)
        y1=pg.evaluate('scrollY')
        if MODE=='space': pg.keyboard.press('Space')
        else: pg.click('[data-act="lab:swtoggle"]')
        pg.wait_for_timeout(100); y2=pg.evaluate('scrollY')
        pg.wait_for_function('window.__T.LAB.state==="landed"',timeout=9000); pg.wait_for_timeout(300)
        y3=pg.evaluate('scrollY'); fe=pg.evaluate('document.activeElement.tagName+"#"+document.activeElement.id+" "+(document.activeElement.dataset?document.activeElement.dataset.act:"")')
        sw=pg.query_selector('[data-act="lab:swtoggle"]').bounding_box()
        if MODE=='space': pg.keyboard.press('Space')
        else: pg.click('[data-act="lab:swtoggle"]')
        pg.wait_for_timeout(900); y4=pg.evaluate('scrollY')
        print(DV,MODE,'trial',t,'scroll before',y0,'flying',y1,'after start',y2,'landed',y3,'focus',fe,'sw button y',round(sw['y']),'after stop',y4,'stopped?',pg.evaluate('window.__T.LAB.sw.stop!=null'))
        pg.fill('#cellin','1.5') if pg.query_selector('#cellin') else None
        pg.click('#recbtn'); pg.wait_for_timeout(300)
    b.close()
