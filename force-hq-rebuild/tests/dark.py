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

OUT='/tmp/fhq-shots/fhq/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1280,'height':900}, color_scheme='dark'); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(__import__('pathlib').Path('dist/test.html').resolve().as_uri()); await pg.wait_for_timeout(300); await pg.fill('#whoName','Sam'); await pg.click('#whoForm .go')
    await pg.evaluate("()=>{__fhq.openChapter('c1f','learn'); (__fhq.openChapter('c1x','learn'), __fhq.setStep(0))}"); await pg.wait_for_timeout(400)
    for k in range(5):
      n=pg.locator('#chunk [data-cb=next]')
      if await n.count() and await n.is_visible(): await n.click()
    await popq(pg); await pg.locator('#qCard [data-q=q1] button[data-o]').first.click(); await pg.wait_for_timeout(300)
    await pg.screenshot(path=OUT+'dark.png'); print(errs)
asyncio.run(main())
