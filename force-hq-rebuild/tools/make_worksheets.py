#!/usr/bin/env python3
"""Render the Toddle files for every worksheet: one folder per sheet with blank template, answer key and marking scheme PDFs."""
import asyncio, os, shutil, zipfile
from playwright.async_api import async_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); DIST=os.path.join(ROOT,'dist'); OUT=os.path.join(DIST,'toddle-files')
SHEETS=[('c1f','Chapter-1-Foundation'),('c1x','Chapter-1-Extension')]
async def main():
  if os.path.exists(OUT): shutil.rmtree(OUT)
  os.makedirs(OUT)
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page()
    await pg.goto('file://'+os.path.join(DIST,'test.html')); await pg.wait_for_timeout(400)
    await pg.evaluate("()=>{__fhq.dbSet('user',{name:'Teacher',teacher:true}); __fhq.dbSet('unlocked',true);}")
    css=await pg.evaluate("()=>__fhq.WS_CSS")
    allkeys=[]; schemes=[]
    for ch,name in SHEETS:
      d=os.path.join(OUT,name); os.makedirs(d)
      for fn,js in [('1-Blank-Template.pdf',f"__fhq.buildWorksheet('{ch}','blank')"),('2-Answer-Key.pdf',f"__fhq.buildWorksheet('{ch}','key')"),('3-Marking-Scheme.pdf',f"'<div class=ws><div class=page>'+__fhq.schemeHTML('{ch}')+'</div></div>'")]:
        html=await pg.evaluate(f"()=>{js}")
        p2=await b.new_page(); await p2.set_content('<!doctype html><html><head><meta charset="utf-8"><style>'+css+'</style></head><body>'+html+'</body></html>'); await p2.wait_for_timeout(200)
        out=os.path.join(d,fn); await p2.pdf(path=out,format='A4',print_background=True,margin={'top':'12mm','bottom':'12mm','left':'12mm','right':'12mm'}); await p2.close()
        if fn.startswith('2'): allkeys.append(out)
      schemes.append(await pg.evaluate(f"()=>__fhq.schemeText('{ch}')"))
    open(os.path.join(OUT,'All-marking-schemes.txt'),'w').write('\n\n'.join(schemes))
    open(os.path.join(OUT,'READ ME.txt'),'w').write('Force HQ: files for Toddle\n\nThere is one folder for each worksheet. When you set a worksheet in Toddle, attach all three files from its folder to the AI task maker together with the prompt from the sim\'s teacher page:\n1. Blank template: what the worksheet looks like before a student fills it in.\n2. Answer key: model answers for every question (teachers only).\n3. Marking scheme: how Toddle should mark and give feedback (teachers only).\n\nTeacher code inside the sim: FORCE\n')
  zp=os.path.join(DIST,'Force-HQ-Toddle-files.zip')
  with zipfile.ZipFile(zp,'w',zipfile.ZIP_DEFLATED) as z:
    for r,_,fs in os.walk(OUT):
      for f in fs: z.write(os.path.join(r,f), os.path.relpath(os.path.join(r,f),OUT))
  print('ok', zp)
asyncio.run(main())
