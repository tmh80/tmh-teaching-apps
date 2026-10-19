import os
from playwright.sync_api import sync_playwright
SH=os.path.join(os.path.dirname(__file__),'shots','')
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome');pg=b.new_page(viewport={'width':1360,'height':900})
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','dist','test.html'))+'')
    pg.fill('[data-bind="start.name"]','Ben'); pg.fill('[data-bind="start.cls"]','6B'); pg.click('[data-act="pick-level"][data-k="developing"]'); pg.click('[data-act="start"]'); pg.click('[data-act="tour-skip"]')
    def ok():
        pg.wait_for_timeout(200); bb=pg.query_selector('[data-act="intro-ok"]')
        if bb and bb.is_visible(): bb.click(); pg.wait_for_timeout(150)
    ok()
    # jump straight to Test flights with nothing chosen
    pg.click('#stepbar [data-go="lab"]'); pg.wait_for_timeout(400); ok()
    print('A step:',pg.evaluate('window.__T.S.step'),'|',pg.inner_text('#modalbox')[:220].replace('\n',' | ')); pg.screenshot(path=SH+'G_redirect.png')
    pg.click('#modalbox [data-act="closemodal"]'); ok()
    pg.click('[data-act="iv"][data-k="span"]'); pg.click('[data-act="dv"][data-k="dist"]')
    # go forward with the research question empty
    pg.click('.nav [data-go="hypothesis"]'); pg.wait_for_timeout(300)
    print('B step:',pg.evaluate('window.__T.S.step'),'|',pg.inner_text('#modalbox')[:220].replace('\n',' | ')); pg.screenshot(path=SH+'G_warn.png')
    pg.click('[data-act="go-anyway"]'); ok(); print('C step:',pg.evaluate('window.__T.S.step'))
    # plan: one group, no setup -> try lab
    pg.click('#stepbar [data-go="plan"]'); pg.wait_for_timeout(300)
    if pg.query_selector('[data-act="go-anyway"]'): pg.click('[data-act="go-anyway"]')
    ok(); pg.click('[data-act="levelpick"]'); pg.wait_for_timeout(200)
    pg.click('.nav [data-go="lab"]'); pg.wait_for_timeout(400)
    print('D step:',pg.evaluate('window.__T.S.step'),'|',pg.inner_text('#modalbox')[:300].replace('\n',' | '))
    pg.click('#modalbox [data-act="closemodal"]')
    vs=[e.get_attribute('data-v') for e in pg.query_selector_all('[data-act="levelpick"]:not(.sel)')][:1]
    pg.click(f'[data-act="levelpick"][data-v="{vs[0]}"]'); pg.click('[data-act="env"][data-k="inside"]'); pg.click('[data-act="launch"][data-k="hand"]')
    pg.click('.nav [data-go="lab"]'); pg.wait_for_timeout(400)
    print('E modal:',pg.inner_text('#modalbox')[:300].replace('\n',' | ') if pg.is_visible('#modal') else 'none')
    if pg.query_selector('[data-act="go-anyway"]'): pg.click('[data-act="go-anyway"]')
    ok(); print('F step:',pg.evaluate('window.__T.S.step'))
    b.close()
print('errors',errs)
