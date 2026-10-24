import asyncio
from playwright.async_api import async_playwright

async def popq(pg):
    if await pg.locator('#qPop').is_hidden(): await pg.evaluate("__fhq.ev(\"qPlace('pop')\")"); await pg.wait_for_timeout(120)
async def nxt(pg):
    q=pg.locator('#qNext')
    if await q.count() and await q.is_visible(): await q.click()
    else: await pg.click('#gNext')
    await pg.wait_for_timeout(150)
    m=pg.locator('#modal #contAnyway')
    if await m.count() and await m.is_visible(): await m.click(); await pg.wait_for_timeout(150)

D='/home/claude/force-hq/dist/'; OUT='/tmp/claude-0/-home-claude/bb04eafb-6d4a-58c1-b55c-0bbcd535d898/scratchpad/fhq/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); errs=[]
    pg=await b.new_page(viewport={'width':1440,'height':900}); pg.on('pageerror',lambda e:errs.append('ERR '+str(e)))
    await pg.goto('file://'+D+'test.html'); await pg.wait_for_timeout(300)
    T=lambda c: pg.evaluate("c=>eval(c)", c)
    await pg.fill('#whoName','Sam'); await pg.click('#whoForm .go')
    print('calc', await T("[__fhq.calcEval('47×g'), __fhq.calcEval('(2+3)×4'), (()=>{try{__fhq.calcEval('5÷0')}catch(e){return e.message}})()]"))
    await pg.click('[data-act=explore-anyway]'); await pg.wait_for_timeout(500); await pg.screenshot(path=OUT+'explore.png')
    await pg.click('[data-info="readF"]'); await pg.wait_for_timeout(200); await pg.screenshot(path=OUT+'explore_info.png'); await pg.click('#chunk [data-cb=next]')
    await pg.click('#homeBtn'); await pg.click('#teacherBtn'); await pg.wait_for_timeout(300)
    await pg.screenshot(path=OUT+'teacher.png', full_page=True)
    print((await T("document.querySelector('#tPrompt').value"))[:1500])
    await pg.click('[data-file="c1f:key"]'); await pg.wait_for_timeout(200); await pg.fill('#codeIn','force'); await pg.click('#codeForm .go'); await pg.wait_for_timeout(300)
    print('key opened', await pg.locator('.modalback .modal.wide h2').count())
    await pg.locator('.modalback #wsClose').click()
    await pg.click('#homeBtn'); await pg.click('#saveWorkBtn'); await pg.wait_for_timeout(300); await pg.screenshot(path=OUT+'savework.png')
    await pg.locator('#wsClose').click()
    await pg.click('#homeBtn [data-journal], .topright [data-journal]'); await pg.wait_for_timeout(200); await pg.screenshot(path=OUT+'journal.png'); await pg.click('#jClose')
    # mission 4
    await T("__fhq.openChapter('c1x','challenge')"); await pg.wait_for_timeout(500)
    await T("__fhq.S.mass=65; __fhq.S.left=['adult']; __fhq.S.right=['pony']")
    await pg.click('#bCheck'); await pg.wait_for_timeout(200); print('m4', await pg.locator('#bFb').inner_text())
    print('chal', await T("JSON.stringify(__fhq.dbGet('chal.c1x',{}))"))
    for w,h in [(1180,820),(820,1180),(390,844)]:
      p2=await b.new_page(viewport={'width':w,'height':h}); p2.on('pageerror',lambda e:errs.append('ERR '+str(e)))
      await p2.goto('file://'+D+'test.html'); await p2.wait_for_timeout(300); await p2.fill('#whoName','Sam'); await p2.click('#whoForm .go')
      await p2.screenshot(path=OUT+f'home_{w}.png', full_page=True)
      await p2.evaluate("()=>{__fhq.openChapter('c1f','learn'); __fhq.setStep(4)}"); await p2.wait_for_timeout(500)
      await p2.screenshot(path=OUT+f'learn_{w}.png', full_page=True)
      sw=await p2.evaluate("()=>document.documentElement.scrollWidth")
      await p2.evaluate("()=>(__fhq.openChapter('c1x','learn'), __fhq.setStep(2))"); await p2.wait_for_timeout(300)
      for k in range(5):
        n=p2.locator('#chunk [data-cb=next]')
        if await n.count() and await n.is_visible(): await n.click()
      await popq(p2); await p2.locator('#qCard .qopen').click(); await p2.wait_for_timeout(300)
      await p2.screenshot(path=OUT+f'desk_{w}.png', full_page=True)
      sw2=await p2.evaluate("()=>document.documentElement.scrollWidth")
      await p2.evaluate("()=>__fhq.openChapter('c1x','review')"); await p2.wait_for_timeout(300)
      sw3=await p2.evaluate("()=>document.documentElement.scrollWidth")
      print(w, sw, sw2, sw3)
    print('errors', errs)
asyncio.run(main())
