import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page()
    await pg.goto('file:///home/claude/force-hq/dist/test.html'); await pg.wait_for_timeout(300)
    print(await pg.evaluate("""()=>{const out=[];const C=__fhq.CHDATA.c1;const all=[...C.steps.flatMap(s=>(s.qs||[]).map(q=>[s.id,q])),...C.review.map(q=>['rev',q])];
      for(const [s,q] of all){ if(q.type==='mcq'||q.type==='tap'){ const o=__fhq.ev('optOrder')(q); out.push(s+'.'+q.id+':'+o.indexOf(q.a)); } } return out.join(' ');}"""))
asyncio.run(main())
