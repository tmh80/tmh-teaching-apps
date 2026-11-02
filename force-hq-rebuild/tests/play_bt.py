"""Build tasks bt1 to bt4 (Explore > Workshop > Build tasks): locks, live checks, results tables, the world picker, questions, build sheets in three modes, the teacher page.
Run after build.py:  python3 tests/play_bt.py     Screenshots: /tmp/fhq-shots/bt/"""
import pathlib, sys, os
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/bt/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 1000}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(F); pg.wait_for_timeout(400); pg.fill('#whoName', 'Alex Chen'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    def build(bw=0, bn=0, br=None, world=None):
        if world: pg.locator(f'#wsWorlds [data-world="{world}"]').click(); pg.wait_for_timeout(100)
        pg.locator(f'#bWinch [data-bw="{bw}"]').click(); pg.locator(f'#bRopes [data-bn="{bn}"]').click()
        if br is not None: pg.locator(f'#bRoute [data-br="{br}"]').click()
        pg.wait_for_timeout(100); pg.click('#wsPull')
        for _ in range(60):
            pg.wait_for_timeout(150)
            if ev("WS.done") is True: break
        pg.wait_for_timeout(250)
    chips = lambda: pg.locator('#btChecks li').evaluate_all("els=>els.map(e=>e.classList.contains('ok'))")
    # ---- locks ----
    ev("dbSet('stamps',{c1f:1})"); ev("openExplore()"); pg.wait_for_timeout(300)
    chk('no Workshop button before Part 1 is done', pg.locator('[data-exscene=shop]').count() == 0)
    ev("dbSet('stamps',{c1f:1,c6a:1})"); ev("openExplore()"); pg.wait_for_timeout(300)
    chk('Workshop button appears after Part 1', pg.locator('[data-exscene=shop]').count() == 1)
    pg.locator('[data-exscene=shop]').click(); pg.wait_for_timeout(500)
    chk('free workshop: every machine, the builder, a kilogram picker and a world picker', pg.locator('#wsMachs button').count() == 7 and pg.locator('#wsWorlds button').count() == 4 and pg.locator('#wsLoads [data-mass]').count() == 7)
    pg.locator('#wsMachs [data-mach="build"]').click(); pg.wait_for_timeout(150); pg.locator('#wsWorlds [data-world="moon"]').click(); pg.locator('#wsLoads [data-mass="120"]').click(); pg.wait_for_timeout(150)
    chk('free workshop: 120 kg on the Moon weighs 192 N', abs(ev("WS.load") - 192) < 1e-6 and ev("WS.world") == 'moon', ev("WS.load"))
    pg.screenshot(path=OUT + 'free.png')
    pg.locator('[data-btab=tasks]').click(); pg.wait_for_timeout(300)
    chk('Build tasks stay locked until Part 4 is done', pg.locator('#btChecks').count() == 0 and 'open when you finish Part 4' in pg.locator('#rail').inner_text())
    ev("dbSet('stamps',{c1f:1,c6a:1,c6d:1})"); ev("openExploreShop('tasks','bt1')"); pg.wait_for_timeout(500)
    chk('Build tasks open after Part 4', pg.locator('#btChecks li').count() == 3)
    # ---- bt1 ----
    build(0, 4, None); chk('bt1: 4 ropes only (490 N) fails the effort check, passes the other two', chips() == [False, True, True], chips())
    pg.locator('[data-btadd]').click(); pg.wait_for_timeout(200)
    build(4, 2); chk('bt1: winch x4 + 2 ropes passes all three', chips() == [True, True, True], chips()); chk('bt1: the task is marked done', ev("dbGet('btd',{}).bt1") is True)
    pg.locator('[data-btadd]').click(); pg.wait_for_timeout(200); build(10, 0); pg.locator('[data-btadd]').click(); pg.wait_for_timeout(200)
    rows = pg.locator('#rail table.bttab tr').count() - 1; chk('bt1: three builds in the table', rows == 3, rows)
    txt = pg.locator('#rail table.bttab').inner_text(); chk('bt1 table: the right numbers', '245' in txt and '196' in txt and '490' in txt and 'Winch ×4 + Pulley block, 2 ropes' in txt, txt)
    pg.screenshot(path=OUT + 'bt1_table.png')
    box = pg.locator('#btQs .qitem[data-q=bt1q2]'); box.scroll_into_view_if_needed(); box.locator('input[type=text], input:not([type])').first.fill('7840'); 
    if box.locator('select').count(): box.locator('select').select_option('J')
    box.locator('.qchk').first.click(); pg.wait_for_timeout(200); chk('bt1 q2: 7,840 J is right', '1 of 1 point' in box.inner_text(), box.inner_text()[:200])
    box = pg.locator('#btQs .qitem[data-q=bt1q1]'); box.locator('textarea').first.fill('Winch x4 and 2 ropes gives MA 4 x 2 = 8, so the effort is 1960 / 8 = 245 N.'); box.locator('.qchk').first.click(); pg.wait_for_timeout(200)
    chk('bt1 q1: the explain question shows its checklist', box.locator('.exck, [type=checkbox]').count() >= 1, box.inner_text()[:200])
    # ---- the sheets ----
    st = ev("btWorksheet('bt1','student')"); chk('student sheet: name, the picture, the table and the ticks', 'Alex Chen' in st and '<svg' in st and 'Winch ×4' in st and st.count('☑') >= 3 and 'Feedback page' in st, st[:300])
    bl = ev("btWorksheet('bt1','blank')"); chk('blank sheet: no student blue and no model answers', 'class="stu"' not in bl and 'Model build' not in bl and '245' not in bl and 'MYP' not in bl)
    ky = ev("btWorksheet('bt1','key')"); chk('answer key: model build, marking the build, the MYP strands', 'Model build' in ky and 'Marking the build' in ky and 'MYP strands on this sheet: A ii, A iii' in ky and '7,840' in ky, ky[:200])
    sc = ev("schemeText('bt1')"); chk('marking scheme: totals 11 marks and lists the build marks', 'Total: 11 marks' in sc and 'Build marks (3 marks)' in sc, sc[:400])
    chk('file name', ev("wsFileName('bt1','student')") == 'Force HQ Ch6 Build task 1 (Lift 200 kg with less than 300 N) - Alex Chen', ev("wsFileName('bt1','student')"))
    pg.locator('[data-btsheet=student]').click(); pg.wait_for_timeout(500); chk('Make my build sheet opens the preview', pg.locator('#wsDown').count() == 1 and 'Build sheet' in pg.locator('.modal.wide').inner_text()); pg.screenshot(path=OUT + 'bt1_sheet.png'); pg.keyboard.press('Escape'); pg.locator('#wsClose').click() if pg.locator('#wsClose').count() else None; pg.wait_for_timeout(200)
    # ---- bt2 ----
    ev("openExploreShop('tasks','bt2')"); pg.wait_for_timeout(400)
    build(10, 2, 0); chk('bt2: winch x10 + 2 ropes (245 N) fails the effort check', chips()[0] is False and chips()[2] is True, chips())
    build(10, 0, 15); chk('bt2: 15 m ramp + winch x10 passes and earns the bonus (90 credits)', chips() == [True, True, True, True], chips())
    pg.locator('[data-btadd]').click(); pg.wait_for_timeout(200); build(10, 2, 9); chk('bt2: 9 m ramp + 2 ropes + x10 also passes (100 credits)', chips()[:3] == [True, True, True], chips()); pg.locator('[data-btadd]').click(); pg.wait_for_timeout(200)
    txt = pg.locator('#rail table.bttab').inner_text(); chk('bt2 table: costs 90 and 100', '\t90\t' in txt and '\t100\t' in txt, txt)
    # ---- bt3 ----
    ev("openExploreShop('tasks','bt3')"); pg.wait_for_timeout(400)
    build(6, 4, 0); build(8, 3, 0); chk('bt3: two MA-24 builds is not enough', chips() == [False, False], chips())
    build(4, 2, 6); chk('bt3: ramp + 2 ropes + winch x4 gives three builds and a three-part build', chips() == [True, True], chips())
    txt = pg.locator('#rail table.bttab').inner_text(); chk('bt3: the table fills itself: 49 N each, 48 m of hand travel', txt.count('49') >= 3 and txt.count('48') >= 3, txt)
    # ---- bt4 ----
    ev("openExploreShop('tasks','bt4')"); pg.wait_for_timeout(400)
    chk('bt4: only Earth, Mars and the Moon', pg.locator('#wsWorlds button').count() == 3 and ev("WS.load") == 3920)
    build(8, 3, 6); chk('bt4: Earth: 6 m ramp + 3 ropes + x8 works (54.4 N)', chips()[0] is True and abs(ev("WS.last.E") - 54.4) < 0.05, (chips(), ev("WS.last.E")))
    build(10, 3, 0, 'mars'); chk('bt4: Mars rover weighs 1,480 N and 3 ropes + x10 works', ev("WS.load") == 1480 and chips()[1] is True, (ev("WS.load"), chips()))
    build(6, 2, 0, 'moon'); chk('bt4: Moon rover weighs 640 N and 2 ropes + x6 works', ev("WS.load") == 640 and chips()[:3] == [True, True, True], (ev("WS.load"), chips()))
    chk('bt4: the smallest working MA (72, 30, 12) earns the bonus', chips()[3] is True, chips())
    for w, wt, ma in (('earth', '3920', '65.3'), ('mars', '1480', '24.7'), ('moon', '640', '99')):
        pg.locator(f'[data-bttype="{w}:w"]').fill(wt); pg.locator(f'[data-bttype="{w}:w"]').press('Tab'); pg.wait_for_timeout(200)
        pg.locator(f'[data-bttype="{w}:m"]').fill(ma); pg.locator(f'[data-bttype="{w}:m"]').press('Tab'); pg.wait_for_timeout(200)
    chk('bt4: typed weights are right, the Moon MA of 99 is marked wrong', pg.locator('#rail td.okc').count() == 5 and pg.locator('#rail td.badc').count() == 1, (pg.locator('#rail td.okc').count(), pg.locator('#rail td.badc').count()))
    box = pg.locator('#btQs .qitem[data-q=bt4q2]'); box.scroll_into_view_if_needed(); box.locator('input').first.fill('10.7'); box.locator('.qchk').first.click(); pg.wait_for_timeout(200); chk('bt4 q2: 10.7', '1 of 1 point' in box.inner_text(), box.inner_text()[:200])
    pg.screenshot(path=OUT + 'bt4.png')
    st = ev("btWorksheet('bt4','student')"); chk('bt4 sheet: weights, MAs and builds are printed', '3,920' in st or '3920' in st and '65.3' in st and 'Mars' in st and 'Winch ×6' in st, st[:200])
    # ---- the Rescue report on the Part 5 worksheet ----
    ev("dbSet('chal.c6e',{sm1:{tried:true,n:2,best:4,log:[{desc:'the boulder 0.80 m from the fulcrum',met:2,pred:10,need:19.2,oks:[true,false,false,false]},{desc:'the boulder 0.30 m from the fulcrum',met:4,pred:44.5,need:44.5,oks:[true,true,true,true]}]}})"); 
    rr = ev("buildWorksheet('c6e','student')"); chk('Rescue report (student): stage 1 best try with prediction, need and ticks', 'Rescue report' in rr and '0.30 m from the fulcrum' in rr and '44.5 N' in rr and '4 of 4 points (2 tries)' in rr and '✓' in rr, rr[rr.find('Rescue report'):][:300])
    chk('Rescue report (student): the untried stages are blank rows', 'Stage 2: Level the ship' in rr and 'Stage 3: Haul out of the crater' in rr)
    chk('Rescue report (blank): empty boxes, no answers', 'Rescue report' in ev("buildWorksheet('c6e','blank')") and '44.5' not in ev("buildWorksheet('c6e','blank')"))
    ky = ev("buildWorksheet('c6e','key')"); chk('Rescue report (key): passing settings for all three stages', 'Medium track (45 m), 4 ropes, winch ×10' in ky and '120 cm per turn' in ky and '0.30 m' in ky)
    chk('c6e marking scheme and AI text say the Rescue report is not marked', 'Rescue report' in ev("schemeText('c6e')") and 'not marked' in ev("answerKeyText('c6e')"))
    # ---- the teacher page ----
    ev("dbSet('user',{name:'Teacher',teacher:true}); dbSet('unlocked',true)"); ev("show('vTeacher'); renderTeacher()"); pg.wait_for_timeout(300)
    pg.locator('[data-bt=bt1]').check(); pg.locator('[data-bt=bt4]').check(); pg.wait_for_timeout(300)
    pr = pg.locator('#tPrompt').input_value(); chk('teacher prompt: names both build tasks and their build sheets', 'Build task 1 (Lift 200 kg with less than 300 N)' in pr and 'Build task 4' in pr and 'build sheet PDF' in pr and 'Workshop' in pr, pr[:300])
    chk('teacher files: a row for each build sheet', pg.locator('[data-file="bt1:key"]').count() == 1 and pg.locator('[data-file="bt4:scheme"]').count() == 1)
    ai = pg.locator('#tAi').input_value(); chk('AI feedback text: the build marks and the strands', 'Build task 1' in ai and 'Build marks' in ai and 'Criterion A' in ai, ai[:200])
    chk('no page errors', not errs, errs[:3])
    b.close()
print('ALL PASS' if not fails else 'FAILED: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
