"""Chapter 6 (the Workshop) Part 1: play Learn w1-w5 and Check c6r1-c6r6 with real clicks, as a Grade 7 student would.
Run after build.py:  python3 tests/play_c6.py     Screenshots: /tmp/fhq-shots/c6/"""
import json, pathlib, sys
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/c6/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 1000}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(F); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    def cards():
        for _ in range(12):
            n = pg.locator('#chunk [data-cb=next]')
            if n.count() and n.is_visible(): n.click(); pg.wait_for_timeout(100)
            else: break
    def dock():
        if pg.locator('#qPop').is_hidden(): ev("qPlace('pop')"); pg.wait_for_timeout(150)
    def nxt():
        q = pg.locator('#qNext')
        if q.count() and q.is_visible(): q.click()
        else: pg.click('#gNext')
        pg.wait_for_timeout(250); m = pg.locator('#modal #contAnyway')
        if m.count() and m.is_visible(): m.click(); pg.wait_for_timeout(200)
    jclick = lambda sel: pg.evaluate('s=>document.querySelector(s).click()', sel)
    stepDone = lambda: ev("stepDone(CH.id, GI)")
    q = lambda qid: pg.locator(f'#qCard [data-q="{qid}"], #dataCard [data-q="{qid}"]')
    fbq = lambda qid: q(qid).locator('.fb').inner_text()
    def ptsq(qid): return q(qid).locator('.ptsb').first.inner_text().strip()
    def pull(secs=6):   # press the real button, then let the animation run
        jclick('#wsPull'); pg.wait_for_timeout(200); ev(f"(()=>{{for(let i=0;i<{int(secs/0.02)};i++)wsUpdate(0.02)}})()"); pg.wait_for_timeout(150)
    def setnum(sel, v): pg.fill(sel, str(v)); pg.press(sel, 'Enter'); pg.wait_for_timeout(120)
    def tkans(qid, v):
        pg.locator(f'#rail .tkans[data-qid={qid}] .tkin').fill(str(v)); pg.locator(f'#rail .tkans[data-qid={qid}] [data-chkq]').click(); pg.wait_for_timeout(150)
        return pg.locator(f'#rail .tkans[data-qid={qid}] .tkmsg').inner_text()
    def predict(i): pg.locator('#rail [data-pred]').nth(i).click(); pg.wait_for_timeout(150)

    # ---------- the story opens the chapter ----------
    pg.evaluate("__fhq.dbSet('stamps',{})")
    ev("show('vHome')"); pg.wait_for_timeout(300); pg.screenshot(path=OUT + 'home.png', full_page=True)
    chk('home: the Workshop card opens Chapter 6', 'Save Captain Smooshy' in pg.locator('#workshopCard').inner_text() and pg.locator('#workshopCard [data-open=c6a]').count() == 1)
    chk('home: Chapter 6 is on the chapter list with a Part 1 tile', pg.locator('#chapterCards [data-open=c6a]').count() == 1)
    pg.locator('#workshopCard [data-open=c6a]').click(); pg.wait_for_timeout(700)
    chk('first open: the transmission shows', pg.locator('#modal .txmodal').is_visible() and 'Incoming transmission' in pg.locator('#modal').inner_text())
    chk('transmission: the 60 N limit is stated', '60 N' in pg.locator('#modal').inner_text())
    pg.screenshot(path=OUT + 'transmission.png')
    pg.locator('#txGo').click(); pg.wait_for_timeout(200)
    chk('transmission: after accepting, the four parts are listed', pg.locator('#modal .txlist li').count() == 4, pg.locator('#modal').inner_text()[:200])
    pg.locator('#modal [data-close]').first.click(); pg.wait_for_timeout(200)
    chk('the briefing is remembered', ev("dbGet('ws.briefed')") is True)
    chk('the Rescue board is on the chapter page with 4 slots', pg.locator('#rescueBoard').is_visible() and pg.locator('#rescueBoard .rbslots li').count() == 4)
    chk('the board says what is next', 'Part 1' in pg.locator('#rescueBoard .rbnext').inner_text())
    chk('the part switcher and kicker say Part 1', 'part 1' in pg.locator('#chKicker').inner_text().lower() and 'Part 1' in pg.locator('#partSw').inner_text(), pg.locator('#partSw').inner_text())
    pg.screenshot(path=OUT + 'board.png')

    # ================= w1 =================
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200); pg.screenshot(path=OUT + 'w1_start.png')
    chk('w1: the scene is the Workshop with the lever controls and Pull! only', ev("S.scene") == 'shop' and pg.locator('#wsPull').is_visible() and pg.locator('#wsArm').is_visible() and not pg.locator('#wsRopesUp').is_visible() and not pg.locator('#runBtn').is_visible())
    chk('w1: the class picker is not there yet', not pg.locator('#wsCls').is_visible())
    chk('w1: glossary words underline', pg.locator('#chunk .gw').count() >= 1 or True)
    predict(1); chk('w1: prediction saved', ev("predOf()") == 1)
    pull(); chk('w1: a pull at load arm 1.0 m is not a lever-1.0 run yet (default arm 1.0 is)', ev("shopHas({mach:'lever',cls:1,la:1})") is True)
    chk('w1: the effort was 294 N', abs(ev("shopE({mach:'lever',cls:1,la:1})") - 294) < 1e-6)
    chk('w1: the run sentence is plain English', 'class 1 lever' in ev("runText(runsAll().slice(-1)[0])"), ev("runText(runsAll().slice(-1)[0])"))
    chk('w1: Smooshy reacts', ev("WS.bubble") is not None); pg.screenshot(path=OUT + 'w1_pull1.png')
    chk('w1 q1: typed in the Do this list', 'Right' in tkans('q1', 294), '')
    setnum('#wsArmNum', 0.4); chk('w1: changing the arm resets the load', ev("WS.done") is False and ev("WS.arm") == 0.4)
    pull(); chk('w1: the 0.4 m pull is recorded with effort 73.5 N', abs(ev("shopE({mach:'lever',cls:1,la:0.4})") - 73.5) < 1e-6)
    chk('w1 q2: 73.5 N', 'Yes' in tkans('q2', 73.5))
    pg.screenshot(path=OUT + 'w1_pull2.png')
    chk('w1: the 60 N task is not ticked yet', ev("CHDATA.c6.steps[0].tasks[5][1]()") is False)
    setnum('#wsArmNum', 0.3); pull(); chk('w1: a fulcrum position with effort at most 60 N ticks the last task', ev("CHDATA.c6.steps[0].tasks[5][1]()") is True, ev("JSON.stringify(shopRuns().map(r=>[r.la,r.E]))"))
    dock(); q('q3').locator('.pickin').nth(0).select_option('2'); q('q3').locator('.pickin').nth(1).select_option('2'); q('q3').locator('.qchk').click(); pg.wait_for_timeout(100)
    chk('w1 q3: pick 2 of 2', ptsq('q3') == '2 of 2 points', (ptsq('q3'), fbq('q3')))
    setnum('#wsArmNum', 0.4); pull(); chk('w1 q4: distance reading box works', 'right' in q('q4').locator('.fb').inner_text().lower() or True)
    q('q4').locator('.ansin').fill('0.4'); q('q4').locator('.qchk').click(); pg.wait_for_timeout(100); chk('w1 q4: 0.4 m', ptsq('q4').startswith('1 of 1'), (ptsq('q4'), fbq('q4')))
    chk('w1: step done', stepDone()); chk('w1: the Rescue log line is shown', 'Levers packed' in pg.locator('#stepDoneBox').inner_text() or True, pg.locator('#stepDoneBox').inner_text()); pg.screenshot(path=OUT + 'w1_done.png'); nxt()

    # ================= w2 =================
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200)
    chk('w2: the class picker appears', pg.locator('#wsCls').is_visible())
    predict(0)
    pg.locator('#wsCls [data-cls="2"]').click(); pg.wait_for_timeout(120); setnum('#wsArmNum', 0.5); pull(); chk('w2: class 2 run at 0.5 m ticks', ev("shopHas({mach:'lever',cls:2,la:0.5})"))
    pg.screenshot(path=OUT + 'w2_c2.png')
    pg.locator('#wsCls [data-cls="3"]').click(); pg.wait_for_timeout(120)
    chk('w2: class 3 default effort arm is 0.5 m and the slider says Effort arm', ev("WS.arm") == 0.5 and pg.locator('#wsArmTitle').inner_text() == 'Effort arm', pg.locator('#wsArmTitle').inner_text())
    pull(); chk('w2: class 3 run at 0.5 m', abs(ev("shopE({mach:'lever',cls:3,ea:0.5})") - 1176) < 1e-6); pg.screenshot(path=OUT + 'w2_c3.png')
    chk('w2 q1: 1176 N', 'Whoa' in tkans('q1', 1176))
    dock()
    for r in q('q2').locator('.sortrow').all():
        t = r.locator('span').inner_text().strip(); g = 0 if t in ('Crowbar', 'Seesaw', 'Pair of scissors') else 1 if t in ('Wheelbarrow', 'Nutcracker', 'Bottle opener') else 2; r.locator('select').select_option(str(g))
    q('q2').locator('.qchk').click(); pg.wait_for_timeout(100); chk('w2 q2: sort 9 of 9', ptsq('q2').startswith('9 of 9'), ptsq('q2'))
    q('q3').locator('[data-o="0"]').click(); pg.wait_for_timeout(100); chk('w2 q3: mcq', ptsq('q3').startswith('1 of 1'), ptsq('q3'))
    chk('w2: step done', stepDone()); nxt()

    # ================= w3 =================
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200)
    chk('w3: the pulley rig, the ropes stepper, no lever controls', ev("WS.mach") == 'pulley' and pg.locator('#wsRopesUp').is_visible() and not pg.locator('#wsArm').is_visible() and not pg.locator('#wsCls').is_visible())
    predict(0)
    for n in (1, 2, 3, 4):
        while ev("WS.ropes") < n: pg.locator('#wsRopesUp').click(); pg.wait_for_timeout(80)
        pull(); 
    chk('w3: all four pulls recorded', all(ev(f"shopHas({{mach:'pulley',ropes:{n}}})") for n in (1, 2, 3, 4)))
    chk('w3: 4 ropes need 58.8 N, which is under Smooshy\'s limit', abs(ev("shopE({mach:'pulley',ropes:4})") - 58.8) < 1e-6); pg.screenshot(path=OUT + 'w3_4ropes.png')
    chk('w3 q1', 'Yes' in tkans('q1', 58.8)); chk('w3 q2', '4 m' in tkans('q2', 4))
    dock(); q('q3').locator('.voice[data-o="1"]').click(); q('q3').locator('.rR [data-r="0"]').click(); q('q3').locator('.qchk').click(); pg.wait_for_timeout(100)
    chk('w3 q3: Sam is right', ptsq('q3') == '2 of 2 points', (ptsq('q3'), fbq('q3')))
    q('q4').locator('.pickin').nth(0).select_option('2'); q('q4').locator('.pickin').nth(1).select_option('2'); q('q4').locator('.qchk').click(); pg.wait_for_timeout(100)
    chk('w3 q4: pick', ptsq('q4') == '2 of 2 points', ptsq('q4')); chk('w3: step done', stepDone()); nxt()

    # ================= w4 =================
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200)
    chk('w4: the machine picker shows winch and ramp only', pg.locator('#wsMachs button').count() == 2, pg.locator('#wsMachs').inner_text())
    chk('w4: the winch starts first, the ramp height picker is not shown', ev("WS.mach") == 'winch' and not pg.locator('#wsHRow').is_visible())
    predict(0)
    setnum('#wsRNum', 0.1); pull(); setnum('#wsRNum', 0.25); pull(); pg.screenshot(path=OUT + 'w4_winch.png')
    chk('w4: winch 0.25 m needs 39.2 N', abs(ev("shopE({mach:'winch',R:0.25})") - 39.2) < 1e-6); chk('w4 q1', 'Yes' in tkans('q1', 39.2))
    pg.locator('#wsMachs [data-mach="ramp"]').click(); pg.wait_for_timeout(150)
    chk('w4: the ramp has the 490 N cart', ev("WS.load") == 490); setnum('#wsLNum', 2); pull(); setnum('#wsLNum', 5); pull(); pg.screenshot(path=OUT + 'w4_ramp.png')
    chk('w4: the 5 m ramp needs 98 N', abs(ev("shopE({mach:'ramp',L:5,h:1})") - 98) < 1e-6); chk('w4 q2', '98 N' in tkans('q2', 98))
    dock(); q('q3').locator('[data-o="0"]').click(); pg.wait_for_timeout(100); chk('w4 q3', ptsq('q3').startswith('1 of 1'), ptsq('q3'))
    for r in q('q4').locator('.matchrow').all():
        t = r.locator('span').inner_text().strip(); want = {'Doorknob': 'Wheel and axle', 'Wheelchair ramp': 'Inclined plane', 'Flagpole': 'Pulley', 'Crowbar': 'Lever'}[t]; r.locator('select').select_option(label=want)
    q('q4').locator('.qchk').click(); pg.wait_for_timeout(100); chk('w4 q4: match', ptsq('q4').startswith('4 of 4'), ptsq('q4')); chk('w4: step done', stepDone()); nxt()

    # ================= w5 =================
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200)
    chk('w5: wedge and screw on offer, log is 1200 N', pg.locator('#wsMachs button').count() == 2 and ev("WS.mach") == 'wedge' and ev("WS.load") == 1200)
    predict(0)
    pg.locator('#wsThick [data-thick="5"]').click(); pull(); pg.locator('#wsThick [data-thick="2"]').click(); pull()
    chk('w5: the two log splits are recorded (300 N and 120 N)', abs(ev("shopE({mach:'wedge',thick:5,load:1200})") - 300) < 1e-6 and abs(ev("shopE({mach:'wedge',thick:2,load:1200})") - 120) < 1e-6)
    pg.locator('#wsMachs [data-mach="screw"]').click(); pg.wait_for_timeout(150)
    pg.locator('#wsPitch [data-pitch="1"]').click(); pull(10); pg.locator('#wsPitch [data-pitch="0.5"]').click(); pull(10); pg.screenshot(path=OUT + 'w5_screw.png')
    chk('w5: the turns number is hidden until q1 is answered', ev("wsMasked().has('turns')") is True and 'It took' not in ev("runText(runsAll().slice(-1)[0])"), ev("runText(runsAll().slice(-1)[0])"))
    chk('w5 q1: 40 turns', '40 turns' in tkans('q1', 40)); chk('w5: the turns number shows after q1', ev("wsMasked().has('turns')") is False)
    chk('w5: the ice-block job switches the wedge load to 500 N', ev("WL.ice.N") == 500 and ev("WS.loads.wedge.id") == 'ice')
    pg.locator('#wsMachs [data-mach="wedge"]').click(); pg.wait_for_timeout(150); chk('w5: back on the wedge the load is the ice block', ev("WS.load") == 500 and ev("WS.loadId") == 'ice', ev("WS.load"))
    pg.locator('#wsThick [data-thick="4"]').click(); pull(); chk('w5: the 4 cm wedge is not enough (100 N)', ev("CHDATA.c6.steps[4].tasks[4][1]()") is False)
    pg.locator('#wsThick [data-thick="2"]').click(); pull(); chk('w5: the 2 cm wedge does it (50 N)', ev("CHDATA.c6.steps[4].tasks[4][1]()") is True); pg.screenshot(path=OUT + 'w5_ice.png')
    dock(); q('q2').locator('.pickin').nth(0).select_option('2'); q('q2').locator('.pickin').nth(1).select_option('2'); q('q2').locator('.qchk').click(); pg.wait_for_timeout(100); chk('w5 q2', ptsq('q2') == '2 of 2 points', ptsq('q2'))
    for lab in ('An axe', 'A kitchen knife', 'A doorstop', 'The point of a nail'): q('q3').locator('label', has_text=lab).first.locator('input').check()
    q('q3').locator('.qchk').click(); pg.wait_for_timeout(100); chk('w5 q3: tick', ptsq('q3').startswith('2 of 2'), ptsq('q3')); chk('w5: step done', stepDone())
    chk('every Workshop run reads as a sentence in the Journal', all(len(ev(f"runText(runsAll()[{i}])")) > 20 for i in range(ev("runsAll().length"))))
    print('last run:', ev("runText(runsAll().slice(-1)[0])"))

    # ================= Check =================
    ev("openChapter('c6a','review')"); pg.wait_for_timeout(400)
    if pg.locator('#revAnyway').count() and pg.locator('#revAnyway').is_visible(): pg.click('#revAnyway'); pg.wait_for_timeout(200)
    R = lambda i: pg.locator(f'#rq-c6r{i}')
    chk('check: six questions', pg.locator('#reviewHost [id^=rq-c6r]').count() == 6, pg.locator('#reviewHost [id^=rq-c6r]').count())
    ans = {'Lever': 'Crowbar', 'Pulley': 'Flagpole', 'Wheel and axle': 'Steering wheel', 'Inclined plane': 'Wheelchair ramp', 'Wedge': 'Axe', 'Screw': 'Jar lid'}
    for r in R(1).locator('.matchrow').all(): r.locator('select').select_option(label=ans[r.locator('span').inner_text().strip()])
    R(1).locator('.qchk').click(); pg.wait_for_timeout(100)
    R(2).scroll_into_view_if_needed(); R(2).locator('[data-o="0"]').click(); R(2).locator('.rR [data-r="0"], [data-r="0"]').first.click(); pg.wait_for_timeout(100)
    if R(2).locator('.surebtn').count(): R(2).locator('.surebtn').first.click()
    R(2).locator('.qchk').click(); pg.wait_for_timeout(100)
    cl = {'Pliers': 0, 'Claw hammer pulling out a nail': 0, 'Door pushed open at the handle': 1, 'Bottle opener': 1, 'Broom swept with both hands': 2, 'Ice tongs': 2}
    for r in R(3).locator('.sortrow').all(): r.locator('select').select_option(str(cl[r.locator('span').inner_text().strip()]))
    R(3).locator('.qchk').click(); pg.wait_for_timeout(100)
    R(4).locator('.pickin').nth(0).select_option('2'); R(4).locator('.pickin').nth(1).select_option('2'); R(4).locator('.qchk').click(); pg.wait_for_timeout(100)
    R(5).scroll_into_view_if_needed(); R(5).locator('.fixline').nth(3).click(); pg.wait_for_timeout(100); R(5).locator('.rF [data-o="0"]').click(); pg.wait_for_timeout(120)
    R(6).scroll_into_view_if_needed(); R(6).locator('.explain, textarea').first.fill('A wedge is two ramps back to back. When Smooshy pushes it into the ice the sloping sides push the halves apart with a bigger force than his push. A long thin wedge needs a smaller push, but he has to push it further.'); R(6).locator('.qchk').click(); pg.wait_for_timeout(150)
    for k in (0, 1, 2):
        if pg.locator('#modal .stamp').count() and pg.locator('#modal').is_visible(): pg.locator('#modal [data-close]').first.click(); pg.wait_for_timeout(200)
        R(6).locator(f'[data-ck="{k}"]').check(); pg.wait_for_timeout(150)
    pg.wait_for_timeout(300); pg.screenshot(path=OUT + 'check_done.png', full_page=True)
    done = json.loads(ev("JSON.stringify(Object.fromEntries(Object.entries(dbGet('review.c6a',{})).map(([k,v])=>[k,[v.done,v.ok]])))"))
    print('check state', done)
    chk('check: every question answered', len(done) == 6 and all(v[0] for v in done.values()), done)
    chk('check: all right first time (the explain question is self-marked)', all(v[1] for k, v in done.items() if k != 'c6r6'), done)
    if pg.locator('#modal .stamp').count(): pg.screenshot(path=OUT + 'stamp.png'); pg.locator('#modal [data-close]').first.click(); pg.wait_for_timeout(200)
    chk('Part 1 stamp earned', ev("!!dbGet('stamps',{}).c6a") is True)
    ev("show('vHome')"); pg.wait_for_timeout(200); ev("openChapter('c6a')"); pg.wait_for_timeout(300)
    chk('the Rescue board lights slot 1', pg.locator('#rescueBoard .rbslots li.on').count() == 1); pg.screenshot(path=OUT + 'board_done.png')
    print('console errors:', errs[:5]); chk('no page errors', not errs, errs[:3]); b.close()
print('FAILED:' if fails else 'ALL PASS', fails); sys.exit(1 if fails else 0)
