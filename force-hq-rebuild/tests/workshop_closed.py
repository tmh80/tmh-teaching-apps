"""The student build with the Workshop closed (WORKSHOP_OPEN = false), and the Explain checklist staying hidden until Check.
Run after build.py:  python3 tests/workshop_closed.py      Uses dist/test-closed.html. Screenshots: /tmp/fhq-shots/wc/"""
import json, pathlib, re
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test-closed.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/wc/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    def fresh(w=1280, h=900):
        pg = b.new_context(viewport={'width': w, 'height': h}).new_page()
        pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        pg.goto(F); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)"); pg.wait_for_timeout(200)
        return pg
    # 1. a new student
    pg = fresh()
    pg.reload(); pg.wait_for_timeout(400)
    if pg.locator('#whoName').is_visible(): pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.wait_for_timeout(200)
    txt = pg.locator('#vHome').inner_text()
    chk('home: no Workshop card', not pg.locator('#workshopCard').is_visible())
    chk('home: Coming soon shows The Workshop', 'COMING SOON' in txt.upper() and 'The Workshop' in txt)
    chk('home: no button into Chapter 6', pg.locator('[data-open^="c6"]').count() == 0)
    chk('home: no replay of the transmission', pg.locator('[data-act="transmission"]').count() == 0)
    chk('home: no Part 1 to Part 5 rows', not re.search(r'Part [1-5]', txt), txt[:300])
    chk('stamp book: Workshop stamps are not counted', '/10' in txt.replace('\n', '') and '/16' not in txt.replace('\n', ''), re.findall(r'of \d+ stamps', txt))
    pg.screenshot(path=OUT + 'home.png', full_page=True)
    box = pg.locator('#cvHome').bounding_box()
    pg.mouse.click(box['x'] + 760 * box['width'] / 900, box['y'] + 335 * box['height'] / 420); pg.wait_for_timeout(300)
    chk('home art: Workshop building stays closed', pg.evaluate("document.body.dataset.view") == 'vHome')
    chk('home art: Workshop building shows a friendly note', 'still being built' in pg.locator('body').inner_text())
    # 2. Explore
    pg.evaluate("__fhq.openExplore()"); pg.wait_for_timeout(300)
    chk('Explore: no Workshop button', pg.locator('[data-exscene="shop"]').count() == 0)
    # 3. a student who started the Workshop on the old file: nothing lost, nothing crashes
    pg = fresh()
    pg.evaluate("""()=>{__fhq.dbSet('stamps',{c1f:1,c6a:2,c6b:3,c6d:4}); __fhq.dbSet('ws.briefed',true); __fhq.dbSet('learnDone.c6a',{a:true}); __fhq.dbSet('review.c6a',{c6r1:{done:true,score:1}})}""")
    pg.reload(); pg.wait_for_timeout(400)
    if pg.locator('#whoName').is_visible(): pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.wait_for_timeout(200)
    txt = pg.locator('#vHome').inner_text()
    chk('saved Workshop stamps stay saved', pg.evaluate("Object.keys(__fhq.dbGet('stamps',{})).length") == 4)
    chk('saved Workshop answers stay saved', pg.evaluate("!!__fhq.dbGet('review.c6a',null)"))
    chk('only open stamps are counted', '1 of 10' in txt, re.findall(r'\d+ of \d+ stamps', txt))
    pg.evaluate("__fhq.openExplore()"); pg.wait_for_timeout(300)
    chk('Explore: stays closed for students with a Workshop stamp', pg.locator('[data-exscene="shop"]').count() == 0)
    # 4. teacher page, including a saved selection from before it closed
    pg = fresh()
    pg.evaluate("""()=>{__fhq.dbSet('teach',{secs:['c1f','c6a'],opt:['c6b'],parts:['learn','review'],bts:['bt1']}); __fhq.user; __fhq.ev("DB.user={name:'Teacher',teacher:true}"); __fhq.ev("show('vTeacher'); renderTeacher()")}""")
    pg.wait_for_timeout(400)
    t = pg.locator('#vTeacher').inner_text()
    chk('teacher page opens', pg.evaluate("document.body.dataset.view") == 'vTeacher')
    chk('teacher page: no Workshop sections or build tasks', 'Chapter 6' not in t and 'Build task' not in t, t[:200])
    chk('teacher prompt: no Workshop', 'Chapter 6' not in pg.evaluate("__fhq.teacherPrompt? document.querySelector('#vTeacher').innerText:''"))
    # 5. Explain checklists, in every open section: hidden before Check, shown after it
    pg = fresh()
    ids = pg.evaluate("__fhq.ev('SECTIONS.map(s=>s.id)')")
    chk('10 sections open, none in Chapter 6', len(ids) == 10 and not [i for i in ids if i.startswith('c6')], ids)
    seen = 0
    for ch in ids:
        pg.evaluate("ch=>{const d={}; __fhq.CHDATA[ch].steps.forEach(s=>d[s.id]=true); __fhq.dbSet('learnDone.'+ch,d); const C=__fhq.CHDATA[ch].challenge; if(C){const e={}; C.missions.forEach(m=>e[m.id]={tried:true,best:4}); __fhq.dbSet('chal.'+ch,e)} __fhq.openChapter(ch,'review'); __fhq.ev(\"DB['revOpen_\"+ch+\"']=true\"); __fhq.renderReview(ch)}", ch)
        pg.wait_for_timeout(120)
        if pg.locator('#modal:not([hidden]) button').count(): pg.keyboard.press('Escape')
        boxes = pg.locator('.qitem:has(textarea.explain)')
        for i in range(boxes.count()):
            q = boxes.nth(i); seen += 1
            chk(f'{ch} explain {i+1}: checklist and model answer hidden before Check', not q.locator('.exck').is_visible() and q.locator('.model').count() == 0 and 'Did you include' not in q.inner_text())
            q.locator('textarea.explain').fill('A force changes how it moves.'); q.locator('.qchk').click(); pg.wait_for_timeout(60)
            chk(f'{ch} explain {i+1}: checklist shown after Check', q.locator('.exck').is_visible() and q.locator('.model').is_visible())
    chk('explain questions were found', seen > 5, seen)
    # 6. phone width
    pg = fresh(390, 800); pg.reload(); pg.wait_for_timeout(400)
    if pg.locator('#whoName').is_visible(): pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.wait_for_timeout(200)
    chk('phone: no sideways scroll', pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    b.close()
print('errors', errs)
print('FAILED: ' + str(fails) if fails or errs else 'ALL PASS')
