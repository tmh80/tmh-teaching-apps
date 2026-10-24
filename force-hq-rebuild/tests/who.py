import pathlib
from playwright.sync_api import sync_playwright
f=pathlib.Path('dist/test.html').resolve()
# host the app inside a sandboxed iframe WITHOUT allow-forms, like the preview
host=pathlib.Path('dist/_sandbox.html'); host.write_text(f'<iframe id=f sandbox="allow-scripts allow-same-origin" src="{f.name}" style="width:1180px;height:800px"></iframe>')
with sync_playwright() as p:
    b=p.chromium.launch(); errs=[]
    for mode in ['direct','sandbox']:
        pg=b.new_page(viewport={'width':1200,'height':850}); pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto((f if mode=='direct' else host.resolve()).as_uri()); pg.wait_for_timeout(600)
        fr=pg.frame_locator('#f') if mode=='sandbox' else pg
        fr.locator('#whoGo').click(); pg.wait_for_timeout(150)
        assert fr.locator('#whoForm').count()==1, 'should stay open without a name'
        fr.locator('#whoName').fill('Mia'); fr.locator('#whoCls').fill('7B'); fr.locator('#whoGo').click(); pg.wait_for_timeout(200)
        assert fr.locator('#whoForm').count()==0, mode+': modal did not close'
        t=fr.locator('#whoTop').inner_text(); assert 'Mia' in t and '7B' in t, t
        fr.locator('#whoTop [data-act=who]').click(); pg.wait_for_timeout(150)
        fr.locator('#whoName').fill('Mia Chen'); fr.locator('#whoName').press('Enter'); pg.wait_for_timeout(150)
        assert 'Mia Chen' in fr.locator('#whoTop').inner_text()
        box=fr.locator('#whoTop').bounding_box(); print(mode,'ok, chip x =',round(box['x']))
        if mode=='direct':
            pg.screenshot(path='/tmp/claude-0/-home-claude/bb04eafb-6d4a-58c1-b55c-0bbcd535d898/scratchpad/who.png',clip={'x':0,'y':0,'width':1200,'height':80})
            pg.set_viewport_size({'width':390,'height':800}); pg.wait_for_timeout(200)
            pg.screenshot(path='/tmp/claude-0/-home-claude/bb04eafb-6d4a-58c1-b55c-0bbcd535d898/scratchpad/who_phone.png',clip={'x':0,'y':0,'width':390,'height':140})
            print('phone scrollW', pg.evaluate('document.documentElement.scrollWidth'))
    print('errors',errs)
# gate: cancel, Escape and backdrop click all return to the name box
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f.as_uri()); pg.wait_for_timeout(500)
    pg.click('#imTeacher'); pg.wait_for_timeout(100); assert pg.locator('#codeForm').count()==1
    pg.click('#codeForm [data-close]'); pg.wait_for_timeout(100); assert pg.locator('#whoForm').count()==1, 'cancel let them in'
    pg.keyboard.press('Escape'); pg.wait_for_timeout(100); assert pg.locator('#whoForm').count()==1, 'escape let them in'
    pg.mouse.click(5,5); pg.wait_for_timeout(100); assert pg.locator('#whoForm').count()==1, 'backdrop let them in'
    pg.click('#imTeacher'); pg.fill('#codeIn','wrong'); pg.click('#codeGo'); pg.wait_for_timeout(100); assert pg.locator('#codeForm').count()==1
    pg.fill('#codeIn','force'); pg.press('#codeIn','Enter'); pg.wait_for_timeout(150)
    assert pg.locator('#modal').is_hidden() and 'Teacher' in pg.locator('#whoTop').inner_text()
    pg.click('#whoTop [data-act=student]'); pg.wait_for_timeout(150); assert pg.locator('#whoForm').count()==1
    pg.keyboard.press('Escape'); pg.wait_for_timeout(100); assert pg.locator('#whoForm').count()==1
    print('gate ok', errs)
