"""The Finish button on the Check (one Foundation section c1f, one Extension section c1x).
Run after build.py:  python3 tests/finish_check.py      Screenshots: /tmp/fhq-shots/fc/
Covers: no stamp mid-Check; Finish auto-checks and matches pressing Check one by one; blank questions warning; explain ticks scored and the
model answer shown; Learn unfinished -> score but no stamp; "See my score again" does not re-mark; reload and save-file round trip."""
import json, pathlib, sys, os
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(__file__))
from fc_helper import finish_check
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/fc/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)

ANS = {'Weight': "The Earth's gravity pulling on an object", 'Normal force': 'A surface pushing back on an object resting on it', 'Friction': 'Two surfaces rubbing or trying to slide past each other', 'Tension': 'A stretched rope or string pulling', 'Air resistance': 'Air pushing against something moving through it'}

with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    def fresh(ch, learn=True, chal=True):
        ctx = b.new_context(viewport={'width': 1280, 'height': 900}, accept_downloads=True); pg = ctx.new_page()
        pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        pg.goto(F); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
        if learn: pg.evaluate("ch=>{const d={}; __fhq.CHDATA[ch].steps.forEach(s=>d[s.id]=true); __fhq.dbSet('learnDone.'+ch,d)}", ch)
        if chal: pg.evaluate("ch=>{const C=__fhq.CHDATA[ch].challenge; if(C){const d={}; C.missions.forEach(m=>d[m.id]={tried:true,best:4}); __fhq.dbSet('chal.'+ch,d)}}", ch)
        pg.evaluate("ch=>{__fhq.openChapter(ch,'review'); __fhq.ev(\"DB['revOpen_\"+ch+\"']=true\"); __fhq.renderReview(ch)}", ch); pg.wait_for_timeout(300)
        return ctx, pg
    ev = lambda pg, c: pg.evaluate("c=>__fhq.ev(c)", c)
    scores = lambda pg, ch: json.loads(ev(pg, f"JSON.stringify(Object.fromEntries(CHDATA['{ch}'].review.map(q=>[q.id,(dbGet('review.{ch}.'+q.id,{{}})||{{}}).score])))"))
    def answer_c1f(pg, skip=()):
        """answers every c1f question with a deliberate mix of right and wrong; nothing is checked"""
        q = lambda i: pg.locator(f'#rq-{i}')
        if 'r1' not in skip:
            for r in q('r1').locator('.matchrow').all():
                t = r.locator('span').inner_text().strip(); want = ANS['Friction'] if t == 'Weight' else ANS['Weight'] if t == 'Friction' else ANS[t]   # two swapped
                r.locator('select').select_option(label=want)
        if 'r2' not in skip:
            for r in q('r2').locator('.sortrow').all():
                t = r.locator('span').inner_text().strip(); r.locator('select').select_option(label='Non-contact force' if ('magnet' in t or 'Moon' in t) else 'Contact force')   # weight of the parachutist is wrong
        if 'r3' not in skip: q('r3').locator('.ansin').fill('230.3')
        if 'r13' not in skip: q('r13').locator('.ansin').fill('70')
        if 'r5' not in skip: q('r5').locator('button[data-o]', has_text='and they are the same size').click()
        if 'r9' not in skip:
            ins = q('r9').locator('.gapin'); ins.nth(0).fill('newtons'); ins.nth(1).fill('9.8'); ins.nth(2).fill('with')
        if 'r10' not in skip:
            vals = [['kilograms (kg)', 'newtons (N)'], ['No, it is not a force', 'Yes, it is a force'], ['a balance (scales)', 'a newtonmeter'], ['No, it stays the same', 'No, it stays the same']]
            for i in range(4):
                for j in range(2): q('r10').locator(f'td[data-c="{i}-{j}"] select').select_option(label=vals[i][j])

    # ---------- Foundation: every question answered, none checked ----------
    ctx, pg = fresh('c1f'); answer_c1f(pg); pg.wait_for_timeout(200)
    chk('c1f: the hint line is under the progress bar', 'check each answer as you go' in pg.locator('#revBody').inner_text())
    chk('c1f: Finish buttons exist (bottom and sticky bar)', pg.locator('#finishCheck').count() == 1 and pg.locator('#finishCheckTop').count() == 1)
    done0 = json.loads(ev(pg, "JSON.stringify(reviewProgress('c1f'))"))
    chk('c1f: only the one-tap mcq is marked before Finish', done0['done'] == 1, done0)
    txt = finish_check(pg)   # presses Finish, closes the pop-up (it also saw no blank warning)
    chk('c1f: results pop-up appeared', 'You scored' in txt, txt[:120])
    autoS = scores(pg, 'c1f'); P = json.loads(ev(pg, "JSON.stringify(reviewProgress('c1f'))"))
    chk('c1f: every question marked after Finish', P['done'] == P['total'] == 7, P)
    chk('c1f: total in the pop-up matches the points', f"You scored {P['points']} of {P['maxPoints']} points" in txt, (txt[:100], P))
    chk('c1f: results list one row per question', txt.count('Question ') >= 7, txt)
    chk('c1f: the stamp is earned with the score', 'Stamp earned' in txt and ev(pg, "!!dbGet('stamps',{}).c1f") is True)
    chk('c1f: finished is stored in the review object', ev(pg, "dbGet('review.c1f',{}).finished") is True)
    chk('c1f: scores are a real mix (not all or nothing)', 0 < P['points'] < P['maxPoints'], P)
    pg.screenshot(path=OUT + 'c1f_after_finish.png', full_page=True)
    btn = pg.locator('#finishCheck').inner_text(); chk('c1f: button now reads See my score again', 'See my score again' in btn, btn)
    snap0 = ev(pg, "JSON.stringify(dbGet('review.c1f',{}))")
    pg.locator('#finishCheck').click(); pg.wait_for_timeout(300)
    t2 = pg.locator('#modal .finmodal').inner_text() if pg.locator('#modal .finmodal').count() else ''
    chk('c1f: See my score again reopens the pop-up with the same total', f"You scored {P['points']} of {P['maxPoints']} points" in t2, t2[:100])
    chk('c1f: reopening does not re-mark anything', ev(pg, "JSON.stringify(dbGet('review.c1f',{}))") == snap0)
    pg.screenshot(path=OUT + 'c1f_results_modal.png')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    # the worksheet still builds
    ws = pg.evaluate("__fhq.buildWorksheet('c1f','student')"); chk('c1f: worksheet still builds with 7 questions', ws.count('class="q"') == 7, ws.count('class="q"'))
    # reload: everything is still there
    pg.reload(); pg.wait_for_timeout(500)
    chk('c1f: finished survives a reload', ev(pg, "dbGet('review.c1f',{}).finished") is True and scores(pg, 'c1f') == autoS)
    # save-file round trip into a fresh browser
    pg.click('#bkBtn'); pg.wait_for_timeout(200)
    with pg.expect_download() as dl: pg.click('#bkSave')
    path = pathlib.Path('/tmp/fhq-shots/fc/') / dl.value.suggested_filename; dl.value.save_as(str(path)); ctx.close()
    ctx2 = b.new_context(viewport={'width': 1280, 'height': 860}); pg2 = ctx2.new_page(); pg2.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
    pg2.goto(F); pg2.wait_for_timeout(400); pg2.click('#haveFile'); pg2.wait_for_timeout(200); pg2.set_input_files('#bkFile', str(path)); pg2.wait_for_timeout(400); pg2.click('#bkYes'); pg2.wait_for_timeout(900)
    chk('c1f: finished and scores survive a save-file round trip', ev(pg2, "dbGet('review.c1f',{}).finished") is True and scores(pg2, 'c1f') == autoS, scores(pg2, 'c1f'))
    ctx2.close()

    # ---------- same answers, pressing Check one by one: same scores, and no stamp mid-Check ----------
    ctx, pg = fresh('c1f'); answer_c1f(pg)
    for i in ['r1', 'r2', 'r3', 'r13', 'r9', 'r10']:
        pg.locator(f'#rq-{i} .qchk').click(); pg.wait_for_timeout(80)
    chk('c1f: the last Check by hand does not show a stamp', pg.locator('#modal .stamp').count() == 0 and ev(pg, "JSON.stringify(dbGet('stamps',{}))") == '{}')
    chk('c1f: checking one by one gives the same scores as Finish', scores(pg, 'c1f') == autoS, (scores(pg, 'c1f'), autoS))
    pg.locator('#finishCheck').scroll_into_view_if_needed(); pg.locator('#finishCheck').click(); pg.wait_for_timeout(300)
    chk('c1f: Finish after checking by hand shows the score and the stamp', 'Stamp earned' in pg.locator('#modal').inner_text() and ev(pg, "!!dbGet('stamps',{}).c1f") is True)
    ctx.close()

    # ---------- two blank questions ----------
    ctx, pg = fresh('c1f'); answer_c1f(pg, skip=('r3', 'r10'))
    pg.locator('#finishCheck').scroll_into_view_if_needed(); pg.locator('#finishCheck').click(); pg.wait_for_timeout(300)
    mt = pg.locator('#modal').inner_text()
    chk('c1f: blank warning names both questions', '2 questions are still blank' in mt and 'Question 3' in mt and 'Question 7' in mt and 'scores 0' in mt, mt)
    chk('c1f: nothing was marked while the warning is open', json.loads(ev(pg, "JSON.stringify(reviewProgress('c1f'))"))['done'] == 1)
    pg.screenshot(path=OUT + 'c1f_blank_warning.png')
    pg.locator('#modal [data-fgo="r10"]').click(); pg.wait_for_timeout(700)
    top = pg.evaluate("document.querySelector('#rq-r10').getBoundingClientRect().top")
    chk('c1f: Go to Question 7 scrolls there and closes the pop-up', pg.locator('#modal .finmodal').count() == 0 and -5 < top < 300, top)
    pg.locator('#finishCheck').click(); pg.wait_for_timeout(300); pg.locator('#finAnyway').click(); pg.wait_for_timeout(300)
    s = scores(pg, 'c1f'); chk('c1f: blank questions score 0 and the rest are marked', s['r3'] == 0 and s['r10'] == 0 and s['r1'] is not None and s['r9'] == 2, s)
    st3 = json.loads(ev(pg, "JSON.stringify(dbGet('review.c1f.r3',{}))")); chk('c1f: a blank question is stored as done and blank', st3.get('done') is True and st3.get('blank') is True, st3)
    chk('c1f: the results row says left blank', 'left blank' in pg.locator('#modal .finmodal').inner_text())
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    ws = pg.evaluate("__fhq.buildWorksheet('c1f','student')"); chk('c1f: blank question still appears on the worksheet', ws.count('class="q"') == 7)
    ctx.close()

    # ---------- Learn unfinished: score, no stamp, Go to Learn ----------
    ctx, pg = fresh('c1f', learn=False); answer_c1f(pg)
    pg.locator('#finishCheck').scroll_into_view_if_needed(); pg.locator('#finishCheck').click(); pg.wait_for_timeout(300)
    mt = pg.locator('#modal .finmodal').inner_text()
    chk('c1f: Learn unfinished: the score shows without a stamp', 'You scored' in mt and 'Stamp earned' not in mt and ev(pg, "JSON.stringify(dbGet('stamps',{}))") == '{}')
    chk('c1f: Learn unfinished: says how many Learn steps are left and has Go to Learn', 'Finish the Learn steps (9 left)' in mt and pg.locator('#finToLearn').count() == 1, mt)
    pg.screenshot(path=OUT + 'c1f_no_stamp.png')
    pg.locator('#finToLearn').click(); pg.wait_for_timeout(300)
    chk('c1f: Go to Learn opens the Learn tab', pg.locator('#learnHost').is_visible())
    # finishing the last Learn step now brings the stamp straight away
    pg.evaluate("ch=>{const d={}; __fhq.CHDATA[ch].steps.forEach(s=>d[s.id]=true); __fhq.dbSet('learnDone.'+ch,d); __fhq.ev(\"maybeStamp('c1f')\")}", 'c1f'); pg.wait_for_timeout(300)
    chk('c1f: finishing Learn afterwards gives the stamp pop-up at once', pg.locator('#modal .stamp').count() == 1 and ev(pg, "!!dbGet('stamps',{}).c1f") is True)
    ctx.close()

    # ---------- Extension c1x: explain ticks, fbd, tick, num, mcq ----------
    def answer_c1x(pg, tick_explain=True, blank_fbd=False):
        q = lambda i: pg.locator(f'#rq-{i}')
        q('r4').locator('.ansin').fill('110')
        for t in ['Weight', 'Normal force', 'Tension']: q('r6').locator('label', has_text=t).first.locator('input').check()   # three of the four: partly right
        q('r12').locator('button[data-o]', has_text='1 cm').click()
        q('r11').locator('textarea').fill('Friction acts against the pull on concrete and balances it so the crate stays still. The air floor has no friction.')
        if tick_explain:
            for k in [0, 1, 3]: q('r11').locator(f'[data-ck="{k}"]').check()
        if not blank_fbd:
            svg = q('r8').locator('.board svg'); svg.scroll_into_view_if_needed(); bb = svg.bounding_box(); k = bb['width'] / 520
            def draw(dx, dy, typ, val):
                cx, cy = bb['x'] + 260 * k, bb['y'] + 200 * k; pg.mouse.move(cx, cy); pg.mouse.down()
                for i in range(1, 8): pg.mouse.move(cx + dx * k * i / 7, cy + dy * k * i / 7)
                pg.mouse.up(); pg.wait_for_timeout(120)
                m = q('r8').locator('.amenu'); m.locator('.mt').select_option(typ); m.locator('.mv').fill(str(val)); m.locator('.mok').click()
            draw(0, 140, 'weight', 490); draw(0, -140, 'normal', 490); draw(-60, 0, 'pull', 130)    # three of the five arrows: partly right
    ctx, pg = fresh('c1x'); answer_c1x(pg)
    ex = pg.locator('#rq-r11')
    chk('c1x explain: the checklist is on screen while writing, before any Check', ex.locator('[data-ck]').count() == 4 and ex.locator('.model').count() == 0 and 'before you finish, tick what you included' in ex.inner_text().lower())
    chk('c1x explain: ticks are saved as a draft (not done)', json.loads(ev(pg, "JSON.stringify(dbGet('review.c1x.r11',{}))")).get('done') is None and json.loads(ev(pg, "JSON.stringify(dbGet('review.c1x.r11',{}))"))['v']['ticks'] == [0, 1, 3])
    pg.screenshot(path=OUT + 'c1x_before_finish.png', full_page=True)
    txt = finish_check(pg)
    chk('c1x: results pop-up after Finish', 'You scored' in txt, txt[:100])
    st = json.loads(ev(pg, "JSON.stringify(dbGet('review.c1x.r11',{}))"))
    chk('c1x explain: scored by its ticks (3 of 4)', st.get('done') and st.get('score') == 3, st)
    chk('c1x explain: the model answer is shown after Finish', pg.locator('#rq-r11 .model').count() == 1)
    chk('c1x explain: the heading changes after checking', 'did you include' in pg.locator('#rq-r11').inner_text().lower() and 'before you finish' not in pg.locator('#rq-r11').inner_text().lower())
    sc = scores(pg, 'c1x'); chk('c1x: tick, num, mcq, fbd and explain all marked', all(sc[k] is not None for k in sc) and sc['r4'] == 1 and sc['r6'] == 1 and sc['r12'] == 1 and 0 < sc['r8'] < 6, sc)
    chk('c1x: stamp earned with the score (Learn and Challenge done)', ev(pg, "!!dbGet('stamps',{}).c1x") is True)
    # ticks can still change afterwards
    pg.locator('#rq-r11 [data-ck="2"]').check(); pg.wait_for_timeout(150)
    chk('c1x explain: a tick after checking updates the score quietly', json.loads(ev(pg, "JSON.stringify(dbGet('review.c1x.r11',{}))"))['score'] == 4)
    ctx.close()
    # c1x: unticked explain, blank fbd: warning lists only the blank one; explain with text and no ticks scores 0 but shows the model answer
    ctx, pg = fresh('c1x'); answer_c1x(pg, tick_explain=False, blank_fbd=True)
    pg.locator('#finishCheck').scroll_into_view_if_needed(); pg.locator('#finishCheck').click(); pg.wait_for_timeout(300)
    mt = pg.locator('#modal').inner_text(); chk('c1x: only the empty diagram is called blank', '1 question is still blank' in mt and 'Question 3' in mt and 'Question 5' not in mt, mt)
    pg.locator('#finAnyway').click(); pg.wait_for_timeout(300)
    sc = scores(pg, 'c1x'); chk('c1x: blank diagram 0, unticked explain 0, others marked', sc['r8'] == 0 and sc['r11'] == 0 and sc['r4'] == 1, sc)
    chk('c1x: model answer shown for the unticked explain', pg.locator('#rq-r11 .model').count() == 1)
    ctx.close()

    print('errors', errs)
if fails: print('FAILED:', fails); sys.exit(1)
print('ALL PASS')
