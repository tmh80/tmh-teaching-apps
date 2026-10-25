import asyncio, sys
from playwright.async_api import async_playwright
D=__import__('os').path.abspath('dist')+'/'; OUT='/tmp/fhq-shots/fhq/'
import os; os.makedirs(OUT,exist_ok=True)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1440,'height':900}); errs=[]
    pg.on('pageerror',lambda e:errs.append('ERR '+str(e))); pg.on('console',lambda m: errs.append('console '+m.text) if m.type=='error' else None)
    await pg.goto('file://'+D+'test.html'); await pg.wait_for_timeout(600)
    await pg.screenshot(path=OUT+'home_modal.png')
    await pg.fill('#whoName','Sam'); await pg.fill('#whoCls','7B'); await pg.click('#whoForm .go'); await pg.wait_for_timeout(400)
    await pg.screenshot(path=OUT+'home.png', full_page=True)
    await pg.click('[data-open="c1"]'); await pg.wait_for_timeout(800)
    await pg.screenshot(path=OUT+'c1_s0.png')
    print(errs)
asyncio.run(main())
