import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(); reqs=[]
    pg.on('request',lambda r: reqs.append(r.url) if not r.url.startswith(('file:','data:')) else None)
    await pg.goto('file:///home/claude/force-hq/dist/Force-HQ-offline.html'); await pg.wait_for_timeout(800); print('external requests:', reqs)
asyncio.run(main())
