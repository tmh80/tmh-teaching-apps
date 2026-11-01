import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(__import__('pathlib').Path('dist/test.html').resolve().as_uri()); await pg.wait_for_timeout(300); await pg.fill('#whoName','Sam'); await pg.click('#whoForm .go')
    r=await pg.evaluate("""()=>{const C=__fhq.CHDATA.c1f; const d={}; C.steps.forEach(s=>d[s.id]=true); __fhq.dbSet('learnDone.c1f',d);
      const ch={}; 
      const rv={}; C.review.forEach(q=>rv[q.id]={done:true,ok:true}); __fhq.dbSet('review.c1f',rv); __fhq.ev("maybeStamp('c1f')"); const noStamp=!document.querySelector('#modal .stamp'); rv.finished=true; __fhq.dbSet('review.c1f',rv); __fhq.ev("maybeStamp('c1f')");
      return [noStamp, document.querySelector('#modal .stamp')?.textContent, JSON.stringify(__fhq.dbGet('stamps'))]}""")
    print(r, errs)
asyncio.run(main())
