import asyncio, json
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

D=__import__('os').path.abspath('dist')+'/'; OUT='/tmp/fhq-shots/fhq/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1440,'height':900}); errs=[]
    pg.on('pageerror',lambda e:errs.append('ERR '+str(e))); pg.on('console',lambda m: errs.append('console '+m.text) if m.type=='error' else None)
    await pg.goto('file://'+D+'test.html'); await pg.wait_for_timeout(500)
    T=lambda c: pg.evaluate("c=>eval(c)", c)
    await pg.fill('#whoName','Sam'); await pg.click('#whoForm .go'); await pg.wait_for_timeout(300)
    await pg.click('[data-open="c1f"]'); await pg.wait_for_timeout(500)
    async def cards():
      for k in range(12):
        n=pg.locator('#chunk [data-cb=next]')
        if await n.count() and await n.is_visible(): await n.click(); await pg.wait_for_timeout(120)
        else: break
    async def tour():
      for k in range(10):
        c=pg.locator('body > .chunk .go')
        if await c.count(): await c.click(); await pg.wait_for_timeout(100)
        else: break
    async def ans_num(qid,val):
      await popq(pg); box=pg.locator(f'#qCard [data-q="{qid}"]'); await box.locator('.ansin').fill(str(val)); await box.locator('.qchk').click(); await pg.wait_for_timeout(150)
      return await box.locator('.fb').inner_text()
    async def ans_opt(qid,text):
      await popq(pg); box=pg.locator(f'#qCard [data-q="{qid}"]'); await box.locator('button[data-o]', has_text=text).first.click(); await pg.wait_for_timeout(150); return await box.locator('.fb').inner_text()
    async def ans_sort(qid,mapping):
      await popq(pg); box=pg.locator(f'#qCard [data-q="{qid}"]')
      for row in await box.locator('.sortrow').all():
        t=(await row.locator('span').inner_text()).strip(); await row.locator('select').select_option(label=mapping[t])
      await box.locator('.qchk').click(); await pg.wait_for_timeout(150); return await box.locator('.fb').inner_text()
    async def ans_gap(qid,vals):
      await popq(pg); box=pg.locator(f'#qCard [data-q="{qid}"]'); ins=box.locator('.gapin')
      for i,v in enumerate(vals): await ins.nth(i).fill(v)
      await box.locator('.qchk').click(); await pg.wait_for_timeout(150); return await box.locator('.fb').inner_text()
    async def state(tag):
      d=await T("JSON.stringify([__fhq.GI, [...document.querySelectorAll('#rail .tasks li')].map(l=>l.className), !!document.querySelector('.stepdone')])")
      print(tag, d)
    # step 0
    await cards(); await pg.wait_for_timeout(300); await tour()
    await pg.click('#runBtn'); await pg.wait_for_timeout(700)
    await pg.click('#rail [data-journal]'); await pg.wait_for_timeout(200); await pg.click('#jClose')
    await pg.click('#calcFab'); await pg.wait_for_timeout(100); await pg.click('#calcX')
    print(await ans_opt('q1','In my Journal')); await pg.wait_for_timeout(300); await state('s0')
    await pg.screenshot(path=OUT+'s0_done.png')
    await nxt(pg); await pg.wait_for_timeout(400)
    # step1
    await cards(); await pg.click('#shoveBtn'); await pg.wait_for_timeout(500)
    cv=await pg.locator('#cvScene').bounding_box(); t=await pg.locator('.ptile[data-p="adult"]').bounding_box()
    await pg.mouse.move(t['x']+20,t['y']+20); await pg.mouse.down()
    for k in range(1,11): await pg.mouse.move(t['x']+(cv['x']+cv['width']*.8-t['x'])*k/10, t['y']+(cv['y']+cv['height']*.7-t['y'])*k/10)
    await pg.mouse.up(); await pg.wait_for_timeout(200); await pg.click('#runBtn'); await pg.wait_for_timeout(600)
    print(await ans_sort('q1',{'The arena crew shoves the crate':'Push','The adult heaves on the rope':'Pull','You kick a football':'Push','A dog drags its lead':'Pull','You open a drawer':'Pull','You press a doorbell':'Push'}))
    print(await ans_opt('q2','A force is a push or a pull.')); await state('s1'); await pg.screenshot(path=OUT+'s1_done.png')
    await nxt(pg); await pg.wait_for_timeout(400)
    # step2
    await cards(); await T("__fhq.S.right=['adult','kid']; __fhq.LAB.onChange()")
    print(await ans_num('q1',190)); print(await ans_gap('q2',['newtons','N'])); await state('s2'); await pg.screenshot(path=OUT+'s2_done.png')
    await nxt(pg); await pg.wait_for_timeout(400)
    # step3
    await cards(); await T("__fhq.S.left=['adult','dog']; __fhq.S.right=['strong','kid']; __fhq.LAB.onChange()")
    print(await ans_num('q1',200)); print(await ans_num('q2',260)); print(await ans_num('q3',60)); await state('s3'); await pg.screenshot(path=OUT+'s3_done.png')
    await nxt(pg); await pg.wait_for_timeout(400)
    # step3r: resultant force (air floor)
    await cards(); await pg.click('#runBtn'); await pg.wait_for_timeout(700); await pg.click('#runBtn')
    await T("__fhq.S.left=['adult']; __fhq.S.right=['strong','kid']; __fhq.ev('resetSim()'); __fhq.LAB.onChange()"); await pg.click('#runBtn'); await pg.wait_for_timeout(700); await pg.click('#runBtn')
    await T("__fhq.ev('resetSim()'); __fhq.LAB.onChange()")
    print(await ans_num('q1',130)); print(await ans_opt('q2','To the right')); print(await ans_num('q3',130)); print(await ans_opt('q4','resultant force is 0 N')); await state('s3r'); await pg.screenshot(path=OUT+'s3r_done.png')
    await nxt(pg); await pg.wait_for_timeout(400)
    # step4
    await cards(); await pg.click('#runBtn'); await pg.wait_for_timeout(1200); await pg.click('#runBtn')
    await pg.click('[data-floor="air"]'); await pg.click('#runBtn'); await pg.wait_for_timeout(1200); await pg.click('#runBtn')
    await pg.click('[data-floor="concrete"]'); await pg.wait_for_timeout(200)
    print(await ans_num('q1',60)); print(await ans_opt('q2','To the left')); print(await ans_opt('q3','The air floor has no friction')); await state('s4'); await pg.screenshot(path=OUT+'s4_done.png')
    await nxt(pg); await pg.wait_for_timeout(400)
    # step5
    await cards(); await T("__fhq.S.mass=47; document.querySelector('#mass').value=47; __fhq.LAB.onChange()")
    print(await ans_num('q1',460.6)); print(await ans_num('q2',1176)); print(await ans_opt('q3','Mass is measured in kilograms')); await state('s5'); await pg.screenshot(path=OUT+'s5_done.png')
    await nxt(pg); await pg.wait_for_timeout(400)
    # step6
    await cards(); await T("__fhq.S.mass=63; __fhq.LAB.onChange()")
    print(await ans_num('q1',617.4)); print(await ans_num('q2',617.4)); print(await ans_opt('q3','The floor pushes up')); await state('s6'); await pg.screenshot(path=OUT+'s6_done.png')
    await nxt(pg); await pg.wait_for_timeout(400)
    # step7
    await cards(); await T("__fhq.S.flags.pulled=true; __fhq.LAB.onChange()")
    print(await ans_opt('q0','A force that only acts when two things touch'))
    print(await ans_sort('q1',{'Friction':'Contact force','Weight (gravity)':'Non-contact force','Normal force':'Contact force','Tension in a rope':'Contact force','Magnetic force between two magnets':'Non-contact force','Air resistance':'Contact force','A push from your hand':'Contact force'}))
    print(await ans_opt('q2','Her weight')); await state('s7')
    print('foundation', await T("JSON.stringify(__fhq.dbGet('learnDone.c1f',{}))"))
    await nxt(pg); await pg.wait_for_timeout(500); await pg.screenshot(path=OUT+'f_check.png', full_page=True)
    await T("__fhq.openChapter('c1x')"); await pg.wait_for_timeout(500); await pg.screenshot(path=OUT+'x_start.png')
    # step8
    await cards(); await T("__fhq.S.right=['adult','kid']; __fhq.LAB.onChange()")
    print(await ans_opt('q1','The weight (490 N)')); print(await ans_num('q2',190)); print(await ans_num('q4',5)); print(await ans_num('q5',3)); print(await ans_gap('q3',['the middle','more'])); await state('s8'); await pg.screenshot(path=OUT+'s8_done.png')
    await nxt(pg); await pg.wait_for_timeout(400)
    # step9 desk
    await cards(); await popq(pg); await pg.click('#qCard .qopen'); await pg.wait_for_timeout(300); await pg.screenshot(path=OUT+'s9_desk.png')
    svg=pg.locator('#desk .board svg'); bb=await svg.bounding_box(); k=bb['width']/520
    async def draw(dx,dy,typ,val):
      cx,cy=bb['x']+260*k, bb['y']+200*k; await pg.mouse.move(cx,cy); await pg.mouse.down()
      for i in range(1,8): await pg.mouse.move(cx+dx*k*i/7, cy+dy*k*i/7)
      await pg.mouse.up(); await pg.wait_for_timeout(150)
      await pg.locator('#desk .amenu .mt').select_option(typ); await pg.locator('#desk .amenu .mv').fill(str(val)); await pg.locator('#desk .amenu .mok').click(); await pg.wait_for_timeout(100)
    await draw(0,110,'weight',372.4); await draw(0,-110,'normal',300)
    await pg.locator('#desk .fcheck').click(); await pg.wait_for_timeout(200); print('fbd1 (one go)', await pg.locator('#desk .qitem > .fb').inner_text()); assert await pg.locator('#desk .fbdlock').count()==1
    await pg.screenshot(path=OUT+'s9_check2.png')
    await pg.click('#deskClose'); await pg.wait_for_timeout(300); await state('s9')
    await nxt(pg); await pg.wait_for_timeout(400)
    # step10
    await cards(); await popq(pg); await pg.click('#qCard .qopen'); await pg.wait_for_timeout(300); bb=await pg.locator('#desk .board svg').bounding_box(); k=bb['width']/520
    await draw(0,120,'weight',539); await draw(0,-120,'normal',539); await draw(80,0,'pull',200); await draw(-40,0,'friction',53.9)
    await pg.locator('#desk .fcheck').click(); await pg.wait_for_timeout(200); print('fbd3', await pg.locator('#desk .qitem > .fb').inner_text()); await pg.screenshot(path=OUT+'s10_check.png')
    await pg.click('#deskClose'); await pg.wait_for_timeout(300); await popq(pg); print(await ans_opt('q2','The forces don')); await state('s10')
    print('extension', await T("JSON.stringify(__fhq.dbGet('learnDone.c1x',{}))"))
    await nxt(pg); await pg.wait_for_timeout(600); await pg.screenshot(path=OUT+'chal.png', full_page=True)
    print('errors', errs)
asyncio.run(main())
