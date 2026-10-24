import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append('ERR '+str(e))); pg.on('console',lambda m: errs.append(m.type+' '+m.text))
    await pg.goto('file:///home/claude/force-hq/dist/test.html'); await pg.wait_for_timeout(600); print(errs)
asyncio.run(main())
