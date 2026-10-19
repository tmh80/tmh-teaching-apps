import os,sys
from playwright.sync_api import sync_playwright
# Real-click flow for one flight: no automatic jumps; buttons move between flight view and table.
DV=sys.argv[1] if len(sys.argv)>1 else 'time'
SH=os.path.join(os.path.dirname(__file__),'shots','')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome');pg=b.new_page(viewport={'width':1366,'height':768})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','dist','test.html')))
    pg.evaluate(f'''(()=>{{const T=window.__T;let s=T.S;s.name='A';s.cls='6';s.level='developing';s.started=true;s.seed=123;s.iv='span';s.dv='{DV}';s.levels=[6,8,10];s.env='inside';s.launch='hand';s.seen={{tour:1,observe:1,question:1,hypothesis:1,plan:1,lab:1}};s.step='lab';T.S=s;T.render()}})()''')
    pg.wait_for_timeout(300)
    pg.click('[data-act="lab:launch"]'); pg.wait_for_function('window.__T.LAB.state==="flying"',timeout=8000)
    pg.keyboard.press('Space'); pg.wait_for_function('window.__T.LAB.state==="landed"',timeout=9000); pg.wait_for_timeout(300)
    y_land=pg.evaluate('scrollY'); pg.keyboard.press('Space'); pg.wait_for_timeout(700); y_stop=pg.evaluate('scrollY')
    tape_panel=pg.evaluate('[...document.querySelectorAll("#labR h4")].some(h=>/Read the tape/.test(h.textContent))')
    pg.screenshot(path=SH+f'M_{DV}_landed.png')
    pg.click('[data-act="lab:table"]'); pg.wait_for_timeout(800); y_table=pg.evaluate('scrollY')
    pg.screenshot(path=SH+f'M_{DV}_table.png')
    pg.fill('#cellin','1.5'); pg.click('#recbtn'); pg.wait_for_timeout(800); y_rec=pg.evaluate('scrollY')
    print(DV,'landed',y_land,'after stop',y_stop,'tape panel on right:',tape_panel,'after table button',y_table,'after record',y_rec,'errors',errs)
    b.close()
