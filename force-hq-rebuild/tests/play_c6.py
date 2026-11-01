"""Chapter 6 (the Workshop) Parts 1 and 2: play Learn lv1-lv5 + Check c6r1-c6r5 (levers) and pl1-pl4 + Check c6r7-c6r11 (pulleys, wheels and ramps) with real clicks, as a Grade 7 student would.
Run after build.py:  python3 tests/play_c6.py     Screenshots: /tmp/fhq-shots/c6/"""
import json, pathlib, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from fc_helper import finish_check
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

    def pick(qid, *vals, R=None):
        loc = R if R is not None else q(qid)
        for k, v in enumerate(vals): loc.locator('.pickin').nth(k).select_option(str(v))
        loc.locator('.qchk').click(); pg.wait_for_timeout(100)
    def mcq(qid, o): q(qid).locator(f'[data-o="{o}"]').first.click(); pg.wait_for_timeout(100)
    def finish(sid):
        chk(f'{sid}: step done', stepDone()); pg.screenshot(path=OUT + f'{sid}_done.png'); nxt()

    # ---------- the story opens the chapter: a black box recording from inside the crashed Gumdrop ----------
    pg.evaluate("__fhq.dbSet('stamps',{})")
    ev("show('vHome')"); pg.wait_for_timeout(300); pg.screenshot(path=OUT + 'home.png', full_page=True)
    chk('home: the Workshop card opens Chapter 6', 'Save Captain Smooshy' in pg.locator('#workshopCard').inner_text() and pg.locator('#workshopCard [data-open=c6a]').count() == 1)
    chk('home: Chapter 6 is on the chapter list with Part 1 and Part 2 tiles', pg.locator('#chapterCards [data-open=c6a]').count() == 1 and pg.locator('#chapterCards [data-open=c6b]').count() == 1)
    pg.locator('#workshopCard [data-open=c6a]').click(); pg.wait_for_timeout(2900)
    chk('first open: the black box message shows', pg.locator('#modal .txmodal').is_visible() and 'Black box' in pg.locator('#modal').inner_text())
    chk('transmission: Smooshy is trapped inside and the 60 N limit is stated', 'trapped inside' in pg.locator('#modal').inner_text() and '60 N' in pg.locator('#modal').inner_text())
    pg.screenshot(path=OUT + 'transmission.png')
    pg.locator('#txAgain').click(); pg.wait_for_timeout(300); chk('transmission: the crash can be replayed', pg.locator('#cvTx').is_visible())
    pg.locator('#txGo').click(); pg.wait_for_timeout(200)
    chk('transmission: after accepting, the five parts are listed', pg.locator('#modal .txlist li').count() == 5, pg.locator('#modal').inner_text()[:200])
    pg.locator('#modal [data-close]').first.click(); pg.wait_for_timeout(200)
    chk('the briefing is remembered', ev("dbGet('ws.briefed')") is True)
    chk('the Rescue board is on the chapter page with 5 slots', pg.locator('#rescueBoard').is_visible() and pg.locator('#rescueBoard .rbslots li').count() == 5)
    chk('the board says what is next', 'Part 1' in pg.locator('#rescueBoard .rbnext').inner_text())
    pg.screenshot(path=OUT + 'board.png')

    # ================= lv1: too heavy, meet the lever =================
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200); pg.screenshot(path=OUT + 'lv1_start.png')
    chk('lv1: the machine picker offers By hand and Lever; no rulers yet', pg.locator('#wsMachs button').count() == 2 and ev("WS.mach") == 'hand' and not ev("LAB.show.has('rulers')"))
    chk('lv1: the class picker is not there yet', not pg.locator('#wsCls').is_visible())
    pull(); chk('lv1: lifting by hand reads 294 N', abs(ev("shopE({mach:'hand'})") - 294) < 1e-6)
    chk('lv1: the run sentence says no machine', 'no machine' in ev("runText(runsAll().slice(-1)[0])"), ev("runText(runsAll().slice(-1)[0])"))
    chk('lv1 q1', 'Right' in tkans('q1', 294))
    pg.locator('#wsMachs [data-mach="lever"]').click(); pg.wait_for_timeout(150); pull()
    chk('lv1: the lever with the fulcrum in the middle reads 294 N', abs(ev("shopE({mach:'lever',cls:1,la:1})") - 294) < 1e-6)
    chk('lv1: lever sentence is plain English', 'fulcrum in the middle' in ev("runText(runsAll().slice(-1)[0])") and 'load arm' not in ev("runText(runsAll().slice(-1)[0])"), ev("runText(runsAll().slice(-1)[0])"))
    chk('lv1 q2', '294 N again' in tkans('q2', 294))
    dock(); chk('lv1 q3 has a labelled picture', q('q3').locator('svg.pic').count() == 1); pick('q3', 0, 1, 2); chk('lv1 q3: label the lever 3 of 3', ptsq('q3') == '3 of 3 points', ptsq('q3'))
    finish('lv1')

    # ================= lv2: move the fulcrum =================
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200)
    chk('lv2: the slider is called Move the fulcrum, in plain words', pg.locator('#wsArmTitle').inner_text() == 'Move the fulcrum' and 'fulcrum' in pg.locator('#wsArmNote').inner_text(), pg.locator('#wsArmTitle').inner_text())
    chk('lv2: the machine picker is hidden', not pg.locator('#wsMachs').is_visible())
    predict(0)
    setnum('#wsArmNum', 0.4); pull(); chk('lv2: 73.5 N at 0.4 m', abs(ev("shopE({mach:'lever',cls:1,la:0.4})") - 73.5) < 1e-6)
    chk('lv2 q1', 'Yes' in tkans('q1', 73.5)); pg.screenshot(path=OUT + 'lv2_04.png')
    setnum('#wsArmNum', 0.3); pull(); chk('lv2: a position at 60 N or less ticks the task', ev("CHDATA.c6.steps[1].tasks[3][1]()") is True)
    dock(); pick('q2', 2); chk('lv2 q2', ptsq('q2').startswith('1 of 1'), ptsq('q2'))
    mcq('q3', 0); chk('lv2 q3', ptsq('q3').startswith('1 of 1'), ptsq('q3'))
    finish('lv2')

    # ================= lv3: the catch =================
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200)
    chk('lv3: the rulers are switched on', ev("LAB.show.has('rulers')") is True)
    pull(); chk('lv3 q1: hand moved 0.40 m', '0.40 m' in tkans('q1', 0.4)); pg.screenshot(path=OUT + 'lv3_rulers.png')
    setnum('#wsArmNum', 0.2); pull(); pg.screenshot(path=OUT + 'lv3_02.png')
    chk('lv3: at 0.2 m the hand moved 0.90 m', abs(ev("shopDist({mach:'lever',cls:1,la:0.2})") - 0.9) < 1e-6)
    chk('lv3 q2', '0.90 m' in tkans('q2', 0.9))
    setnum('#wsArmNum', 1.6); pull(); pg.screenshot(path=OUT + 'lv3_16.png')
    chk('lv3: fulcrum close to the hand: 1176 N, the rock rises 0.40 m and the hand moves 0.10 m', abs(ev("shopE({mach:'lever',cls:1,la:1.6})") - 1176) < 1e-6 and abs(ev("shopRun({mach:'lever',cls:1,la:1.6}).rise") - 0.4) < 1e-6 and abs(ev("shopDist({mach:'lever',cls:1,la:1.6})") - 0.1) < 1e-6)
    chk('lv3 q3', 'Only 0.10 m' in tkans('q3', 0.1))
    dock(); pick('q4', 0, 2); chk('lv3 q4', ptsq('q4') == '2 of 2 points', ptsq('q4'))
    q('q5').locator('[data-o="0"]').first.click(); pg.wait_for_timeout(100); chk('lv3 q5: the big rule (key idea)', ptsq('q5').startswith('1 of 1') and 'bigger distance' in q('q5').inner_text(), ptsq('q5'))
    finish('lv3')

    # ================= lv4: three ways to build a lever =================
    chk('lv4: the first card states the big rule', 'bigger distance' in pg.locator('#chunk').inner_text() and pg.locator('#chunk .law').count() == 1, pg.locator('#chunk').inner_text()[:200])
    pg.locator('#chunk').screenshot(path=OUT + 'lv4_rule.png')
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200)
    chk('lv4: the design buttons name what is in the middle, with no class numbers yet', pg.locator('#wsCls').is_visible() and 'Load in the middle' in pg.locator('#wsCls').inner_text() and 'Class' not in pg.locator('#wsCls').inner_text(), pg.locator('#wsCls').inner_text())
    predict(0)
    pg.locator('#wsCls [data-cls="2"]').click(); pg.wait_for_timeout(120); chk('lv4: load in the middle: the slider moves the rock', pg.locator('#wsArmTitle').inner_text() == 'Move the rock')
    setnum('#wsArmNum', 0.5); pull(); pg.screenshot(path=OUT + 'lv4_c2.png')
    pg.locator('#wsCls [data-cls="3"]').click(); pg.wait_for_timeout(120); chk('lv4: effort in the middle: the slider moves your hand', pg.locator('#wsArmTitle').inner_text() == 'Move your hand' and ev("WS.arm") == 0.5)
    pull(); pg.screenshot(path=OUT + 'lv4_c3.png')
    chk('lv4: class 3 run: 1176 N, rock up 0.40 m, hand 0.10 m', abs(ev("shopE({mach:'lever',cls:3,ea:0.5})") - 1176) < 1e-6 and abs(ev("shopRun({mach:'lever',cls:3,ea:0.5}).rise") - 0.4) < 1e-6)
    chk('lv4 q1', '1,176' in tkans('q1', 1176)); chk('lv4 q2', '0.10 m' in tkans('q2', 0.1))
    dock(); pick('q3', 2, 2); chk('lv4 q3', ptsq('q3') == '2 of 2 points', ptsq('q3'))
    finish('lv4')

    # ================= lv5: the three classes =================
    for k in range(6):
        if pg.locator('#chunk').is_visible(): pg.locator('#chunk').screenshot(path=OUT + f'lv5_card{k}.png')
        n = pg.locator('#chunk [data-cb=next]')
        if n.count() and n.is_visible(): n.click(); pg.wait_for_timeout(120)
        else: break
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200)
    chk('lv5: the buttons now show the class names', 'Class 3' in pg.locator('#wsCls').inner_text(), pg.locator('#wsCls').inner_text())
    setnum('#wsArmNum', 1.0); pull(); chk('lv5: class 3 at 1.0 m ticks the task', ev("shopHas({mach:'lever',cls:3,ea:1})") is True)
    dock(); pick('q1', 1, 2); chk('lv5 q1', ptsq('q1') == '2 of 2 points', ptsq('q1'))
    mcq('q2', 0); chk('lv5 q2: chopsticks', ptsq('q2').startswith('1 of 1'), ptsq('q2'))
    finish('lv5')

    # ================= Part 1 Check =================
    ev("openChapter('c6a','review')"); pg.wait_for_timeout(400)
    if pg.locator('#revAnyway').count() and pg.locator('#revAnyway').is_visible(): pg.click('#revAnyway'); pg.wait_for_timeout(200)
    R = lambda i: pg.locator(f'#rq-c6r{i}')
    chk('check 1: five questions', pg.locator('#reviewHost [id^=rq-c6r]').count() == 5, pg.locator('#reviewHost [id^=rq-c6r]').count())
    pick(None, 1, 2, 0, R=R(1))
    R(2).scroll_into_view_if_needed(); R(2).locator('[data-o="0"]').click(); R(2).locator('.rR [data-r="0"], [data-r="0"]').first.click(); pg.wait_for_timeout(100)
    if R(2).locator('.surebtn').count(): R(2).locator('.surebtn').first.click()
    R(2).locator('.qchk').click(); pg.wait_for_timeout(100)
    R(3).scroll_into_view_if_needed(); R(3).locator('[data-o="1"]').first.click(); pg.wait_for_timeout(100)
    R(4).scroll_into_view_if_needed(); R(4).locator('.fixline').nth(3).click(); pg.wait_for_timeout(100); R(4).locator('.rF [data-o="0"]').click(); pg.wait_for_timeout(120)
    R(5).scroll_into_view_if_needed(); R(5).locator('.explain, textarea').first.fill('He should put the fulcrum close to the boulder so his side of the bar is long. Then the effort is smaller than the load. The catch is his hand moves a long distance and the boulder only rises a little.'); R(5).locator('.qchk').click(); pg.wait_for_timeout(150)
    for k in (0, 1, 2):
        if pg.locator('#modal').is_visible(): pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        R(5).locator(f'[data-ck="{k}"]').check(); pg.wait_for_timeout(150)
    pg.wait_for_timeout(300); pg.screenshot(path=OUT + 'check1_done.png', full_page=True)
    done = json.loads(ev("JSON.stringify(Object.fromEntries(Object.entries(dbGet('review.c6a',{})).map(([k,v])=>[k,[v.done,v.ok]])))"))
    print('check 1 state', done)
    chk('check 1: every question answered', len(done) == 5 and all(v[0] for v in done.values()), done)
    chk('check 1: all right first time', all(v[1] for k, v in done.items() if k != 'c6r5'), done)
    if pg.locator('#modal').is_visible(): pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    chk('Part 1: no stamp before Finish', ev("!!dbGet('stamps',{}).c6a") is False)
    res = finish_check(pg); chk('Part 1: Finish shows the score and the stamp', 'You scored' in res and 'Stamp earned' in res, res[:80])
    chk('Part 1 stamp earned', ev("!!dbGet('stamps',{}).c6a") is True)

    # ================= Part 2: pl1 pulleys =================
    ev("openChapter('c6b')"); pg.wait_for_timeout(500)
    if pg.locator('#modal').is_visible() and pg.locator('#modal [data-close]').count(): pg.locator('#modal [data-close]').first.click(); pg.wait_for_timeout(200)
    cards(); chk('pl1: card 3 says the supporting ropes share the weight', 'share' in pg.locator('#chunk').inner_text().lower()); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200); pg.screenshot(path=OUT + 'pl1_start.png')
    chk('pl1: the pulley rig, the ropes stepper, no lever controls', ev("WS.mach") == 'pulley' and pg.locator('#wsRopesUp').is_visible() and not pg.locator('#wsArm').is_visible() and not pg.locator('#wsCls').is_visible())
    predict(0)
    for n in (1, 2, 3, 4):
        while ev("WS.ropes") < n: pg.locator('#wsRopesUp').click(); pg.wait_for_timeout(80)
        pull()
    pg.screenshot(path=OUT + 'pl1_4ropes.png')
    chk('pl1: 4 ropes need 58.8 N', abs(ev("shopE({mach:'pulley',ropes:4})") - 58.8) < 1e-6)
    chk('pl1 q1', 'Yes' in tkans('q1', 58.8)); chk('pl1 q2', '4 m' in tkans('q2', 4))
    dock(); pick('q3', 2, 2); chk('pl1 q3', ptsq('q3') == '2 of 2 points', ptsq('q3')); mcq('q4', 0); chk('pl1 q4: flagpole', ptsq('q4').startswith('1 of 1'), ptsq('q4'))
    finish('pl1')
    # ================= pl2 wheel and axle =================
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200)
    chk('pl2: the winch only', ev("WS.mach") == 'winch' and not pg.locator('#wsMachs').is_visible())
    predict(0); setnum('#wsRNum', 0.1); pull(); setnum('#wsRNum', 0.25); pull(); pg.screenshot(path=OUT + 'pl2_winch.png')
    chk('pl2 q1', 'Yes' in tkans('q1', 39.2)); dock(); pick('q2', 2, 2); chk('pl2 q2', ptsq('q2') == '2 of 2 points', ptsq('q2'))
    finish('pl2')
    # ================= pl3 ramps =================
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200)
    chk('pl3: the ramp with the 490 N cart', ev("WS.mach") == 'ramp' and ev("WS.load") == 490)
    predict(0); setnum('#wsLNum', 2); pull(); setnum('#wsLNum', 5); pull(); pg.screenshot(path=OUT + 'pl3_ramp.png')
    chk('pl3 q1', '98 N' in tkans('q1', 98)); dock(); mcq('q2', 0); chk('pl3 q2', ptsq('q2').startswith('1 of 1'), ptsq('q2'))
    finish('pl3')
    # ================= pl4 ramps in disguise =================
    cards(); dock(); ev("qPlace('hidden')"); pg.wait_for_timeout(200)
    chk('pl4: wedge and screw on offer, log is 1200 N', pg.locator('#wsMachs button').count() == 2 and ev("WS.mach") == 'wedge' and ev("WS.load") == 1200)
    predict(0)
    pg.locator('#wsThick [data-thick="5"]').click(); pull(); pg.locator('#wsThick [data-thick="2"]').click(); pull()
    pg.locator('#wsMachs [data-mach="screw"]').click(); pg.wait_for_timeout(150)
    chk('pl4: the screw control says gap between threads', 'Gap between threads' in pg.locator('#lab').inner_text())
    pg.locator('#wsPitch [data-pitch="1"]').click(); pull(10); pg.locator('#wsPitch [data-pitch="0.5"]').click(); pull(10); pg.screenshot(path=OUT + 'pl4_screw.png')
    chk('pl4: the turns number is hidden until q1 is answered', ev("wsMasked().has('turns')") is True)
    chk('pl4 q1: 40 turns', '40 turns' in tkans('q1', 40))
    chk('pl4: the ice-block job switches the wedge load to 500 N', ev("WS.loads.wedge.id") == 'ice')
    pg.locator('#wsMachs [data-mach="wedge"]').click(); pg.wait_for_timeout(150)
    stp = "CHDATA.c6.steps.find(x=>x.id==='pl4')"
    pg.locator('#wsThick [data-thick="4"]').click(); pull(); chk('pl4: the 4 cm wedge is not enough (100 N)', ev(stp + ".tasks[4][1]()") is False)
    pg.locator('#wsThick [data-thick="2"]').click(); pull(); chk('pl4: the 2 cm wedge does it (50 N)', ev(stp + ".tasks[4][1]()") is True); pg.screenshot(path=OUT + 'pl4_ice.png')
    dock(); pick('q2', 2, 2); chk('pl4 q2', ptsq('q2') == '2 of 2 points', ptsq('q2'))
    for lab in ('A kitchen knife', 'A doorstop', 'The point of a nail', 'Your front teeth'): q('q3').locator('label', has_text=lab).first.locator('input').check()
    q('q3').locator('.qchk').click(); pg.wait_for_timeout(100); chk('pl4 q3: tick', ptsq('q3').startswith('2 of 2'), ptsq('q3'))
    finish('pl4')
    chk('every Workshop run reads as a sentence in the Journal', all(len(ev(f"runText(runsAll()[{i}])")) > 20 for i in range(ev("runsAll().length"))))

    # ================= Part 2 Check =================
    ev("openChapter('c6b','review')"); pg.wait_for_timeout(400)
    if pg.locator('#revAnyway').count() and pg.locator('#revAnyway').is_visible(): pg.click('#revAnyway'); pg.wait_for_timeout(200)
    chk('check 2: five questions', pg.locator('#reviewHost [id^=rq-c6r]').count() == 5, pg.locator('#reviewHost [id^=rq-c6r]').count())
    ans = {'Flagpole': 'Pulley', 'Screwdriver': 'Wheel and axle', 'Wheelchair ramp': 'Ramp (inclined plane)', 'Doorstop': 'Wedge', 'Jar lid': 'Screw', 'Seesaw': 'Lever'}
    for r in R(7).locator('.matchrow').all(): r.locator('select').select_option(label=ans[r.locator('span').inner_text().strip()])
    R(7).locator('.qchk').click(); pg.wait_for_timeout(100)
    pick(None, 2, 2, R=R(8))
    R(9).scroll_into_view_if_needed(); R(9).locator('.fixline').nth(3).click(); pg.wait_for_timeout(100); R(9).locator('.rF [data-o="0"]').click(); pg.wait_for_timeout(120)
    R(10).scroll_into_view_if_needed(); R(10).locator('[data-o="0"]').click(); R(10).locator('.rR [data-r="0"], [data-r="0"]').first.click(); pg.wait_for_timeout(100)
    if R(10).locator('.surebtn').count(): R(10).locator('.surebtn').first.click()
    R(10).locator('.qchk').click(); pg.wait_for_timeout(100)
    R(11).scroll_into_view_if_needed(); R(11).locator('.explain, textarea').first.fill('A wedge is two ramps back to back. The sloping sides push the halves apart with a bigger force than his push. A long thin wedge needs a smaller push, but he has to push it further.'); R(11).locator('.qchk').click(); pg.wait_for_timeout(150)
    for k in (0, 1, 2):
        if pg.locator('#modal').is_visible(): pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        R(11).locator(f'[data-ck="{k}"]').check(); pg.wait_for_timeout(150)
    pg.wait_for_timeout(300); pg.screenshot(path=OUT + 'check2_done.png', full_page=True)
    done = json.loads(ev("JSON.stringify(Object.fromEntries(Object.entries(dbGet('review.c6b',{})).map(([k,v])=>[k,[v.done,v.ok]])))"))
    print('check 2 state', done)
    chk('check 2: every question answered and right', len(done) == 5 and all(v[0] for v in done.values()) and all(v[1] for k, v in done.items() if k != 'c6r11'), done)
    if pg.locator('#modal').is_visible(): pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    res = finish_check(pg); chk('Part 2: Finish shows the score and the stamp', 'You scored' in res and 'Stamp earned' in res, res[:80])
    chk('Part 2 stamp earned', ev("!!dbGet('stamps',{}).c6b") is True)
    ev("show('vHome')"); pg.wait_for_timeout(200); ev("openChapter('c6a')"); pg.wait_for_timeout(300)
    chk('the Rescue board lights slots 1 and 2', pg.locator('#rescueBoard .rbslots li.on').count() == 2); pg.screenshot(path=OUT + 'board_done.png')
    print('console errors:', errs[:5]); chk('no page errors', not errs, errs[:3]); b.close()
print('FAILED:' if fails else 'ALL PASS', fails); sys.exit(1 if fails else 0)
