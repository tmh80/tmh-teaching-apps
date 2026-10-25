import asyncio
from playwright.async_api import async_playwright
D=__import__('os').path.abspath('dist')+'/'; OUT='/tmp/fhq-shots/fhq/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1280,'height':900}); errs=[]
    pg.on('pageerror',lambda e:errs.append('ERR '+str(e)))
    await pg.goto('file://'+D+'test.html'); await pg.wait_for_timeout(400)
    T=lambda c: pg.evaluate("c=>eval(c)", c)
    await pg.fill('#whoName','Sam'); await pg.fill('#whoCls','7B'); await pg.click('#whoForm .go')
    q=lambda i: pg.locator(f'#rq-r{i}')
    await T("__fhq.openChapter('c1f','review')"); await pg.wait_for_timeout(300); await pg.click('#revAnyway'); await pg.wait_for_timeout(200)
    ans={'Weight':"The Earth's gravity pulling on an object",'Normal force':'A surface pushing back on an object resting on it','Friction':'Two surfaces rubbing or trying to slide past each other','Tension':'A stretched rope or string pulling','Air resistance':'Air pushing against something moving through it'}
    for r in await q(1).locator('.matchrow').all(): t=(await r.locator('span').inner_text()).strip(); await r.locator('select').select_option(label=ans[t])
    await q(1).locator('.qchk').click()
    for r in await q(2).locator('.sortrow').all():
      t=(await r.locator('span').inner_text()).strip(); await r.locator('select').select_option(label='Non-contact force' if ('magnet' in t or 'gravity' in t or 'weight' in t) else 'Contact force')
    await q(2).locator('.qchk').click()
    await q(3).locator('.ansin').fill('230.3'); await q(3).locator('.qchk').click()
    await q(5).locator('button[data-o]', has_text='and they are the same size').click()
    ins=q(9).locator('.gapin'); await ins.nth(0).fill('newtons'); await ins.nth(1).fill('9.8'); await ins.nth(2).fill('against'); await q(9).locator('.qchk').click()
    vals=[['kilograms (kg)','newtons (N)'],['No, it is not a force','Yes, it is a force'],['a balance (scales)','a newtonmeter'],['No, it stays the same','Yes, it gets smaller']]
    for i in range(4):
      for j in range(2): await q(10).locator(f'td[data-c="{i}-{j}"] select').select_option(label=vals[i][j])
    await q(10).locator('.qchk').click()
    print('foundation', await T("JSON.stringify(Object.fromEntries(Object.entries(__fhq.dbGet('review.c1f',{})).map(([k,v])=>[k,[v.done,v.ok]])))"))
    await T("__fhq.openChapter('c1x','review')"); await pg.wait_for_timeout(300)
    await pg.click('#revAnyway'); await pg.wait_for_timeout(300)
    await q(4).locator('.ansin').fill('100'); await q(4).locator('.qchk').click()
    for t in ['Weight','Normal force','Tension','Friction']: await q(6).locator('label',has_text=t).first.locator('input').check()
    await q(6).locator('.qchk').click()
    await q(12).locator('button[data-o]', has_text='1 cm').click()
    await q(11).locator('textarea').fill('Friction acts against the pull on concrete and balances it so the crate stays still. The air floor has no friction.'); await q(11).locator('.qchk').click()
    for k in [0,1,3]: await q(11).locator(f'[data-ck="{k}"]').check()
    svg=q(8).locator('.board svg'); await svg.scroll_into_view_if_needed(); bb=await svg.bounding_box(); k=bb['width']/520
    async def draw(dx,dy,typ,val):
      cx,cy=bb['x']+260*k, bb['y']+200*k; await pg.mouse.move(cx,cy); await pg.mouse.down()
      for i in range(1,8): await pg.mouse.move(cx+dx*k*i/7, cy+dy*k*i/7)
      await pg.mouse.up(); await pg.wait_for_timeout(120)
      m=q(8).locator('.amenu'); await m.locator('.mt').select_option(typ); await m.locator('.mv').fill(str(val)); await m.locator('.mok').click()
    await draw(0,140,'weight',490); await draw(0,-140,'normal',490); await draw(-60,0,'pull',130); await draw(110,0,'pull',260); await draw(-25,0,'friction',49)
    await q(8).locator('.fcheck').click(); await pg.wait_for_timeout(200); print('r8', await q(8).locator('.qitem > .fb').inner_text())
    print('extension', await T("JSON.stringify(Object.fromEntries(Object.entries(__fhq.dbGet('review.c1x',{})).map(([k,v])=>[k,[v.done,v.ok]])))"))
    await pg.screenshot(path=OUT+'rev_x.png', full_page=True)
    print('errors',errs)
asyncio.run(main())
