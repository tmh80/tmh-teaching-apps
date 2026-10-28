"""Question types added for Chapter 5: order, pick, reason (plain and cartoon, with "How sure are you?"), fix (number and choice).
Run from force-hq-rebuild after build.py:  python3 tests/qtypes.py
Test questions are pushed into Chapter 1 Foundation's Check at run time, so no chapter has to use the new types yet."""
import json, os, pathlib, re
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/qtypes/'; os.makedirs(OUT, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)

STAGES = ['The skydiver speeds up quickly', 'Air resistance grows as the velocity grows', 'Air resistance equals the weight, so the velocity is steady', 'The canopy opens and air resistance jumps up', 'The skydiver slows down and air resistance shrinks', 'The forces balance again at a much lower velocity']
def order_q(i): return dict(id=i, type='order', p='Put the stages of a skydive in order.', first='Leaves the helicopter', last='Lands', items=STAGES)
SCALE = ['gets bigger', 'stays the same', 'gets smaller']
def pick_q(i): return dict(id=i, type='pick', p='As the crate fell faster and faster, its weight {0} and the air resistance on it {1}.', picks=[[SCALE, 1], [SCALE, 0]], after='Weight is mass × g, and neither changes during the fall.')
OPTS = ['Air resistance is equal to their weight', 'Air resistance is bigger than their weight', 'Air resistance is smaller than their weight', 'There are no forces acting on them at all']
REAS = ['Their velocity is steady, so the resultant force must be zero', 'They are still falling, so there must be a downward resultant', 'They are moving fast, so air resistance must be winning', 'They have stopped speeding up, so gravity has switched off']
def reason_q(i, **kw): return dict(id=i, type='reason', p='A skydiver with the canopy closed is falling at a steady 54 m/s. Which is true about the forces on them?', opts=OPTS, a=0, reasons=REAS, r=0, why=dict(r={'1': 'A steady velocity needs no resultant force.'}, a={'3': 'Both forces are still there.'}), **kw)
VOICES = [dict(who='Mia', says='It has stopped speeding up, so there are no forces on it any more.'), dict(who='Sam', says='Air resistance and weight are now equal, so the forces are balanced.'), dict(who='Leo', says='The weight must still be bigger, or it would stop falling.'), dict(who='Ana', says='Air resistance is bigger now, so it is about to slow down.')]
def cartoon_q(i): return dict(id=i, type='reason', p='The crate is falling at a steady 38 m/s. Four friends disagree about the forces on it. Who is right?', voices=VOICES, a=1, reasons=REAS, r=0, why='Both forces are still there; they cancel.')
UN = ['N', 'kg', 'm/s']
def fixnum_q(i): return dict(id=i, type='fix', p='Ana works out the weight of a 40 kg crate on the Moon. Spot her mistake. Tap it, then correct it.', who='Ana', lines=['Weight = mass × g', 'Weight = 40 × 9.8', 'Weight = 392 N'], bad=1, fix=dict(kind='num', ans=64, unit='N', units=UN, tol=0.5, ask='Now correct it. What is the weight on the Moon?'), why='Ana used Earth\'s g. On the Moon g is 1.6 N/kg, so the weight is 40 × 1.6 = 64 N.')
FIXOPTS = ['So the skydiver keeps moving down, but slows down', 'So the skydiver keeps moving down, and speeds up', 'So the skydiver stops moving and hangs still', 'So the skydiver keeps moving down at the same velocity']
def fixmcq_q(i): return dict(id=i, type='fix', p='Leo explains what happens when a canopy opens. One line has a mistake. Tap it, then choose the correct line.', who='Leo', lines=['The skydiver is falling at terminal velocity.', 'The canopy opens, so the air resistance gets much bigger.', 'Air resistance is now bigger than the weight.', 'So the resultant force points upwards.', 'So the skydiver starts to move upwards.'], bad=4, fix=dict(kind='mcq', opts=FIXOPTS, a=0), why='An upward resultant force slows down something that is falling.')
MCQ = dict(id='qm1', type='mcq', p='Which force pulls a crate down?', opts=['Weight', 'Friction', 'Tension', 'Air resistance'], a=0, sure=True)
QS = [order_q('qo1'), order_q('qo2'), order_q('qo3'), pick_q('qp1'), pick_q('qp2'), reason_q('qr1', sure=True), reason_q('qr2'), reason_q('qr3'), cartoon_q('qc1'), cartoon_q('qc2'), fixnum_q('qf1'), fixnum_q('qf2'), fixnum_q('qf3'), fixmcq_q('qx1'), MCQ]

def txts(pg, qid): return [t.strip() for t in pg.locator(f'#rq-{qid} .ordt').all_inner_texts()]
def arrange(pg, qid, target):
    for i, want in enumerate(target):
        while True:
            cur = txts(pg, qid); j = cur.index(want)
            if j <= i: break
            pg.locator(f'#rq-{qid} .ordcard').nth(j).locator('[data-mv="-1"]').click()
def pts(pg, qid): return pg.locator(f'#rq-{qid} .ptsb').first.inner_text().strip()
def fb(pg, qid): return pg.locator(f'#rq-{qid} .qitem > .fb').inner_text()
def opt(pg, qid, sel, start): return pg.locator(f'#rq-{qid} {sel}').filter(has_text=re.compile('^' + re.escape(start)))

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1100, 'height': 1000}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
    pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Mia'); pg.click('#whoGo')
    pg.evaluate("__fhq.dbSet('tourDone',true)")
    pg.evaluate("qs=>{qs.forEach(q=>__fhq.CHDATA.c1f.review.push(q)); __fhq.openChapter('c1f','review'); __fhq.ev(\"DB['revOpen_c1f']=true\"); __fhq.renderReview('c1f');}", QS)
    pg.wait_for_timeout(300)
    shot = lambda qid, name: (pg.locator(f'#rq-{qid}').scroll_into_view_if_needed(), pg.locator(f'#rq-{qid}').screenshot(path=OUT + name + '.png'))

    # ---- order ----
    start = txts(pg, 'qo1'); chk('order: start order is shuffled', start != STAGES and sorted(start) == sorted(STAGES))
    chk('order: first and last labels', 'Leaves the helicopter' in pg.locator('#rq-qo1 .ordend').first.inner_text() and 'Lands' in pg.locator('#rq-qo1 .ordend').last.inner_text())
    shot('qo1', 'order_start')
    arrange(pg, 'qo1', STAGES); chk('order: arranged with the buttons', txts(pg, 'qo1') == STAGES)
    chk('order: numbers follow the cards', pg.locator('#rq-qo1 .ordn').all_inner_texts() == ['1', '2', '3', '4', '5', '6'])
    pg.locator('#rq-qo1 .qchk').click(); pg.wait_for_timeout(100)
    chk('order: all right = 2 of 2', pts(pg, 'qo1') == '2 of 2 points', pts(pg, 'qo1')); chk('order: six green cards', pg.locator('#rq-qo1 .ordcard.right').count() == 6)
    chk('order: locked (buttons hidden, no check button)', not pg.locator('#rq-qo1 .ordb').first.is_visible() and not pg.locator('#rq-qo1 .qchk').is_visible())
    # one pair of neighbours swapped
    sw = STAGES[:]; sw[2], sw[3] = sw[3], sw[2]; arrange(pg, 'qo2', sw); pg.locator('#rq-qo2 .qchk').click(); pg.wait_for_timeout(100)
    chk('order: one neighbour swap = 1 of 2', pts(pg, 'qo2') == '1 of 2 points', pts(pg, 'qo2')); chk('order: swap shows two red cards and two corrections', pg.locator('#rq-qo2 .ordcard.wrong').count() == 2 and pg.locator('#rq-qo2 .corr').count() == 2)
    chk('order: correction text names the place', 'goes 3rd' in pg.locator('#rq-qo2 .corr').first.inner_text() or 'goes 4th' in pg.locator('#rq-qo2 .corr').first.inner_text(), pg.locator('#rq-qo2 .corr').all_inner_texts())
    # draft survives a re-draw, then a wrong order
    pg.locator('#rq-qo3 .ordcard').nth(1).locator('[data-mv="-1"]').click(); moved = txts(pg, 'qo3')
    pg.evaluate("__fhq.renderReview('c1f')"); pg.wait_for_timeout(200); chk('order: a half-made order survives a re-draw', txts(pg, 'qo3') == moved)
    arrange(pg, 'qo3', list(reversed(STAGES))); pg.locator('#rq-qo3 .qchk').click(); pg.wait_for_timeout(100)
    chk('order: reversed = 0 of 2 with the right places shown', pts(pg, 'qo3') == '0 of 2 points' and pg.locator('#rq-qo3 .corr').count() >= 5, pts(pg, 'qo3'))
    shot('qo3', 'order_wrong')

    # ---- pick ----
    chk('pick: sentence has two drop-downs and no separate question line', pg.locator('#rq-qp1 .pickin').count() == 2 and pg.locator('#rq-qp1 .qp').count() == 0)
    pg.locator('#rq-qp1 .qchk').click(); chk('pick: asks for every gap', 'every gap' in fb(pg, 'qp1'), fb(pg, 'qp1'))
    pg.locator('#rq-qp1 .pickin').nth(0).select_option(label='stays the same'); pg.locator('#rq-qp1 .pickin').nth(1).select_option(label='gets bigger'); pg.locator('#rq-qp1 .qchk').click(); pg.wait_for_timeout(100)
    chk('pick: all right = 2 of 2', pts(pg, 'qp1') == '2 of 2 points', pts(pg, 'qp1')); chk('pick: feedback adds the after line', 'neither changes' in fb(pg, 'qp1'))
    chk('pick: drop-downs locked and green', pg.locator('#rq-qp1 .pickin.right').count() == 2 and pg.locator('#rq-qp1 .pickin').first.is_disabled())
    pg.locator('#rq-qp2 .pickin').nth(0).select_option(label='gets bigger'); pg.locator('#rq-qp2 .pickin').nth(1).select_option(label='gets bigger'); pg.locator('#rq-qp2 .qchk').click(); pg.wait_for_timeout(100)
    chk('pick: one wrong = 1 of 2, red drop-down with the green answer', pts(pg, 'qp2') == '1 of 2 points' and pg.locator('#rq-qp2 .pickin.wrong').count() == 1 and 'stays the same' in pg.locator('#rq-qp2 .corr').first.inner_text(), pts(pg, 'qp2'))
    shot('qp2', 'pick_locked')

    # ---- reason (plain, with How sure are you?) ----
    chk('reason: reasons hidden until an answer is chosen', not pg.locator('#rq-qr1 .rtier2').is_visible())
    shot('qr1', 'reason_start')
    opt(pg, 'qr1', '.rA button', 'Air resistance is equal').click(); chk('reason: reasons appear after the answer', pg.locator('#rq-qr1 .rtier2').is_visible())
    pg.locator('#rq-qr1 .qchk').click(); chk('reason: asks for a reason first', 'reason' in fb(pg, 'qr1').lower(), fb(pg, 'qr1'))
    opt(pg, 'qr1', '.rR button', 'Their velocity is steady').click()
    pg.locator('#rq-qr1 .qchk').click(); chk('reason: asks how sure you are', 'how sure' in fb(pg, 'qr1').lower() and not pg.locator('#rq-qr1 .qitem.locked').count(), fb(pg, 'qr1'))
    pg.locator('#rq-qr1 .surebtn', has_text='Fairly sure').click(); pg.locator('#rq-qr1 .surebtn', has_text='Certain').click()
    chk('reason: only one confidence button is on', pg.locator('#rq-qr1 .surebtn.on').count() == 1)
    pg.evaluate("__fhq.renderReview('c1f')"); pg.wait_for_timeout(200)
    chk('reason: the chosen answer and reason survive a re-draw', pg.locator('#rq-qr1 .rA button.picked').count() == 1 and pg.locator('#rq-qr1 .rR button.picked').count() == 1)
    pg.locator('#rq-qr1 .surebtn', has_text='Certain').click(); pg.locator('#rq-qr1 .qchk').click(); pg.wait_for_timeout(100)
    chk('reason: right and right = 2 of 2', pts(pg, 'qr1') == '2 of 2 points', pts(pg, 'qr1')); chk('reason: confidence saved', pg.evaluate("__fhq.dbGet('review.c1f.qr1',{}).sure") == 'cert')
    # right answer, wrong reason
    opt(pg, 'qr2', '.rA button', 'Air resistance is equal').click(); opt(pg, 'qr2', '.rR button', 'They are still falling').click(); pg.locator('#rq-qr2 .qchk').click(); pg.wait_for_timeout(100)
    chk('reason: right answer, wrong reason = 1 of 2 and says so', pts(pg, 'qr2') == '1 of 2 points' and "right answer, but that reason doesn't hold up" in fb(pg, 'qr2'), fb(pg, 'qr2'))
    chk('reason: the wrong reason has its own explanation', 'needs no resultant force' in fb(pg, 'qr2'), fb(pg, 'qr2'))
    shot('qr2', 'reason_right_wrong')
    # wrong answer, wrong reason
    opt(pg, 'qr3', '.rA button', 'There are no forces').click(); opt(pg, 'qr3', '.rR button', 'They have stopped speeding up').click(); pg.locator('#rq-qr3 .qchk').click(); pg.wait_for_timeout(100)
    chk('reason: wrong and wrong = 0 of 2 with the right answer shown', pts(pg, 'qr3') == '0 of 2 points' and pg.locator('#rq-qr3 .rA button.answer').count() == 1 and pg.locator('#rq-qr3 .rR button.answer').count() == 1)

    # ---- reason (cartoon: Who is right?) ----
    chk('cartoon: four speech bubbles with characters', pg.locator('#rq-qc1 .voice').count() == 4 and pg.locator('#rq-qc1 .voice svg').count() == 4)
    shot('qc1', 'cartoon_start')
    pg.locator('#rq-qc1 .voice', has_text='Sam').click(); opt(pg, 'qc1', '.rR button', 'Their velocity is steady').click(); pg.locator('#rq-qc1 .qchk').click(); pg.wait_for_timeout(100)
    chk('cartoon: right character and reason = 2 of 2', pts(pg, 'qc1') == '2 of 2 points', pts(pg, 'qc1')); chk('cartoon: no confidence row when sure is off', pg.locator('#rq-qc1 .surebtn').count() == 0)
    pg.locator('#rq-qc2 .voice', has_text='Mia').click(); opt(pg, 'qc2', '.rR button', 'Their velocity is steady').click(); pg.locator('#rq-qc2 .qchk').click(); pg.wait_for_timeout(100)
    chk('cartoon: wrong character, right reason = 1 of 2 and says so', pts(pg, 'qc2') == '1 of 2 points' and 'goes with a different answer' in fb(pg, 'qc2'), fb(pg, 'qc2'))
    chk('cartoon: the message names the right character without repeating the bubble', 'Sam is right.' in fb(pg, 'qc2') and '““' not in fb(pg, 'qc2') and 'Sam: ' not in fb(pg, 'qc2'), fb(pg, 'qc2'))
    chk('cartoon: right bubble marked after a miss', pg.locator('#rq-qc2 .voice.answer').count() == 1 and pg.locator('#rq-qc2 .voice.wrong').count() == 1)
    shot('qc2', 'cartoon_wrong')

    # ---- fix (number) ----
    chk('fix: part 2 hidden before the tap', not pg.locator('#rq-qf1 .fix2').is_visible()); shot('qf1', 'fix_start')
    pg.locator('#rq-qf1 .fixline').nth(2).click(); pg.wait_for_timeout(100)
    chk('fix: a wrong tap locks and shows the real mistake', pg.locator('#rq-qf1 .fixline.wrong').count() == 1 and pg.locator('#rq-qf1 .fixline.answer').count() == 1 and pg.locator('#rq-qf1 .fixline').first.is_disabled())
    chk('fix: part 2 appears after the tap', pg.locator('#rq-qf1 .fix2').is_visible())
    pg.evaluate("__fhq.renderReview('c1f')"); pg.wait_for_timeout(200)
    chk('fix: the tap survives a re-draw', pg.locator('#rq-qf1 .fixline.wrong').count() == 1 and pg.locator('#rq-qf1 .fix2').is_visible())
    pg.locator('#rq-qf1 .qchk').click(); chk('fix: needs a number', 'number' in fb(pg, 'qf1').lower())
    pg.locator('#rq-qf1 .ansin').fill('64'); pg.locator('#rq-qf1 .qchk').click(); chk('fix: needs a unit', 'unit' in fb(pg, 'qf1').lower())
    pg.locator('#rq-qf1 .unitsel').select_option('N'); pg.locator('#rq-qf1 .qchk').click(); pg.wait_for_timeout(100)
    chk('fix: wrong line, right correction = 1 of 2', pts(pg, 'qf1') == '1 of 2 points', pts(pg, 'qf1')); chk('fix: explanation shown after the lock', "Ana used Earth" in fb(pg, 'qf1'), fb(pg, 'qf1'))
    shot('qf1', 'fix_locked')
    pg.locator('#rq-qf2 .fixline').nth(1).click(); pg.locator('#rq-qf2 .ansin').fill('64'); pg.locator('#rq-qf2 .unitsel').select_option('kg'); pg.locator('#rq-qf2 .qchk').click(); pg.wait_for_timeout(100)
    chk('fix: right line, wrong unit = 1 of 2 with a unit message', pts(pg, 'qf2') == '1 of 2 points' and 'unit should be N' in fb(pg, 'qf2'), fb(pg, 'qf2'))
    pg.locator('#rq-qf3 .fixline').nth(1).click(); pg.locator('#rq-qf3 .ansin').fill('64.2'); pg.locator('#rq-qf3 .unitsel').select_option('N'); pg.locator('#rq-qf3 .ansin').press('Enter'); pg.wait_for_timeout(100)
    chk('fix: right line, right correction (inside the tolerance) = 2 of 2', pts(pg, 'qf3') == '2 of 2 points', pts(pg, 'qf3'))
    # ---- fix (choose the line) ----
    pg.locator('#rq-qx1 .fixline').nth(4).click(); opt(pg, 'qx1', '.rF button', 'So the skydiver keeps moving down, but slows').click(); pg.wait_for_timeout(100)
    chk('fix (choice): right line and right replacement = 2 of 2', pts(pg, 'qx1') == '2 of 2 points', pts(pg, 'qx1'))
    shot('qx1', 'fix_choice_locked')

    # ---- mcq with How sure are you? ----
    opt(pg, 'qm1', '.opts button', 'Friction').click(); chk('sure (mcq): must choose how sure first', 'how sure' in fb(pg, 'qm1').lower() and pg.locator('#rq-qm1 .qitem.locked').count() == 0, fb(pg, 'qm1'))
    pg.locator('#rq-qm1 .surebtn', has_text='Certain').click(); opt(pg, 'qm1', '.opts button', 'Friction').click(); pg.wait_for_timeout(100)
    chk('sure (mcq): answer taken once confidence is chosen', pts(pg, 'qm1') == '0 of 1 point' and pg.evaluate("__fhq.dbGet('review.c1f.qm1',{}).sure") == 'cert', pts(pg, 'qm1'))

    # ---- scoring totals, worksheets, scheme ----
    marks = pg.evaluate("__fhq.CHDATA.c1f.review.filter(q=>q.id.startsWith('q')).map(q=>__fhq.qMarks(q))")
    chk('worksheet: marks per type (order 2, pick 2, reason 2, fix 2, mcq 1)', marks == [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], marks)
    pg.evaluate("__fhq.dbSet('user',{name:'Mia',cls:'7B'})")
    stu = pg.evaluate("__fhq.buildWorksheet('c1f','student')"); blank = pg.evaluate("__fhq.buildWorksheet('c1f','blank')"); key = pg.evaluate("__fhq.buildWorksheet('c1f','key')"); sch = pg.evaluate("__fhq.schemeHTML('c1f')")
    chk('worksheet (student): order letters in blue', 'Write the letters in order' in stu and re.search(r'class="stu">[A-F]</span>', stu) is not None)
    chk('worksheet (student): pick choice in blue and brackets', '(<span class="stu"><u>stays the same</u></span>' in stu or 'stays the same</u></span>' in stu)
    chk('worksheet (student): no doubled line numbers or stray colon', '1. 1.' not in stu and '?:' not in stu)
    chk('worksheet (student): fix says Circle, not Tap', 'Circle it, then correct it' in stu and 'Tap it' not in stu)
    chk('worksheet (student): confidence printed, feedback page lists certain-but-wrong', 'How sure I was' in stu and 'Certain but not right' in stu)
    chk('worksheet (blank): choices with brackets, empty confidence boxes, nothing in blue', 'Circle one choice in each bracket' in blank and '☐ Guessing' in blank and 'class="stu"' not in blank)
    chk('worksheet (key): green key marks for reason, fix and order', key.count('class="key"') >= 20 and 'Who is right?' in key and 'Ana used Earth' in key)
    chk('scheme: order, pick, reason, fix lines', all(s in sch for s in ['correct order is', 'for each right choice', '1 mark for the answer', '1 mark for the line with the mistake']) and 'Confidence is not marked' in sch)
    total = pg.evaluate("__fhq.CHDATA.c1f.review.reduce((a,q)=>a+__fhq.qMarks(q),0)"); chk('scheme: total marks add up', f'Total: {total} marks' in sch, total)
    pg.evaluate("__fhq.openChapter('c1f','review')")
    prog = pg.evaluate("__fhq.progressHTML()"); chk('My work so far: shows the new answers without errors', 'Mistake: line' in prog or 'Check:' in prog)

    # ---- the worksheets as images (student, blank, key), new questions only, for a visual check ----
    css = pg.evaluate("__fhq.WS_CSS")
    for mode, html in [('student', stu), ('blank', blank), ('key', key)]:
        wp = b.new_page(viewport={'width': 760, 'height': 900}); wp.set_content('<!doctype html><html><head><meta charset="utf-8"><style>' + css + '</style></head><body>' + html + '</body></html>'); wp.wait_for_timeout(150)
        wp.evaluate("[...document.querySelectorAll('.q')].forEach(q=>{const n=+(q.querySelector('.qh').textContent.match(/Question (\\d+)/)||[0,0])[1]; if(n<8) q.remove()})")   # keep Chapter 1's own questions out of the picture
        wp.screenshot(path=OUT + 'ws_' + mode + '.png', full_page=True); wp.close()

    # ---- time estimates ----
    chk('minutes: the new types have estimates', pg.evaluate("__fhq.ev(\"['order','pick','reason','fix','freeze','spot','sketch'].every(t=>QMIN[t]>0)\")"))

    # ---- phone width and dark mode ----
    pg.set_viewport_size({'width': 390, 'height': 900}); pg.evaluate("__fhq.renderReview('c1f')"); pg.wait_for_timeout(300)
    # only the new questions are checked here: the old Chapter 1 table question (r10) is already 403 px wide on a 390 px screen
    wide = pg.evaluate("(()=>{const vw=window.innerWidth,bad=[];document.querySelectorAll('[id^=rq-q] *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&(r.right>vw+1||r.left<-1))bad.push(e.tagName+'.'+(typeof e.className==='string'?e.className:''))});return bad.slice(0,8)})()")
    chk('phone (390 px): the new questions fit the screen', not wide, wide)
    for qid, nm in [('qc2', 'phone_cartoon'), ('qx1', 'phone_fix'), ('qo3', 'phone_order'), ('qp2', 'phone_pick')]: shot(qid, nm)
    pg.set_viewport_size({'width': 1100, 'height': 1000}); pg.evaluate("document.documentElement.dataset.theme='dark'"); pg.wait_for_timeout(200)
    for qid, nm in [('qc2', 'dark_cartoon'), ('qf1', 'dark_fix'), ('qo3', 'dark_order')]: shot(qid, nm)
    print('errors', errs); b.close()
print('FAILED: ' + ', '.join(fails) if fails else 'ALL PASSED')
