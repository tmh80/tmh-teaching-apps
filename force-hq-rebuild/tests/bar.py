import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1280,'height':900})
    await pg.goto(__import__('pathlib').Path('dist/test.html').resolve().as_uri()); await pg.wait_for_timeout(300)
    await pg.fill('#whoName','Sam'); await pg.click('#whoForm .go')
    await pg.evaluate("()=>__fhq.openChapter('c1','review')"); await pg.wait_for_timeout(300); await pg.click('#revAnyway')
    print(await pg.evaluate("()=>{const b=document.querySelector('.revbar');return [b.innerHTML.slice(0,200), getComputedStyle(b).display, b.getBoundingClientRect().height]}"))
    await pg.screenshot(path='/tmp/fhq-shots/fhq/bar.png')
asyncio.run(main())
