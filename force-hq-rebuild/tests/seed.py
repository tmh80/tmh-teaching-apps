import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page()
    await pg.goto(__import__('pathlib').Path('dist/test.html').resolve().as_uri()); await pg.wait_for_timeout(300)
    print(await pg.evaluate("""()=>{const oo=__fhq.ev('optOrder'); const out={}; for(const id of ['r5','r12']){ const q=__fhq.CHDATA.c1.review.find(x=>x.id===id); for(let s=0;s<20;s++){ q.seed=String(s); const k=oo(q).indexOf(q.a); if(k>=1&&k<=2){ out[id]=[s,k]; break; } } } return JSON.stringify(out);}"""))
asyncio.run(main())
