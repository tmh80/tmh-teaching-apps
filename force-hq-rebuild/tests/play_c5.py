"""Chapter 5 (the Drop Zone): play Foundation (Learn d1-d4, Check c5r1-c5r7) with real clicks, as a Grade 7 student would.
Run after build.py:  python3 tests/play_c5.py     Screenshots: /tmp/fhq-shots/c5/"""
import json, pathlib, re, time
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/c5/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 1000}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(F); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    adv = lambda sec: ev(f"(()=>{{for(let i=0;i<{int(round(sec/0.02))};i++)dzUpdate(0.02)}})()")
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
    jclick = lambda sel: pg.evaluate('s=>document.querySelector(s).click()', sel)   # the Your turn box can sit over the arena; a student drags it aside, the test clicks through
    stepDone = lambda: ev("stepDone(CH.id, GI)")
    q = lambda qid: pg.locator(f'#qCard [data-q="{qid}"]')
    fbq = lambda qid: q(qid).locator('.fb').inner_text()
    def ptsq(qid): return q(qid).locator('.ptsb').first.inner_text().strip()
    def tapgraph(sel, t, tmax=40):
        svg = pg.locator(sel + ' svg').first; svg.scroll_into_view_if_needed(); box = svg.bounding_box(); a = svg.evaluate('s=>[+s.dataset.x0,+s.dataset.x1,+s.dataset.y0,+s.dataset.y1,+s.dataset.w,+s.dataset.h]')
        pg.mouse.click(box['x'] + (a[0] + t / tmax * (a[1] - a[0])) / a[4] * box['width'], box['y'] + (a[2] + a[3]) / 2 / a[5] * box['height'])
    def fill_freeze(qid, cols):
        rows = ev(f"JSON.stringify(dbGet(stepKey(CH.id,GI)+'.{qid}').v.rows.map(r=>r.snap))"); rows = json.loads(rows)
        for ri, s in enumerate(rows):
            r = s['W'] - s['D']; tr = {'W': s['W'], 'D': s['D'], 'R': r, 'big': 2 if abs(r) < 0.03 * s['W'] else (0 if r > 0 else 1), 'motion': 0 if s['a'] > 0.2 else (1 if s['a'] >= -0.2 else 2)}
            for k in cols:
                loc = q(qid).locator(f'.frzin[data-ri="{ri}"][data-k="{k}"]')
                if k in ('big', 'motion'): loc.select_option(str(tr[k]))
                else: loc.fill(str(round(tr[k], 1)))
    pg.evaluate("__fhq.openChapter('c5f','learn')"); pg.wait_for_timeout(500)
    chk('Chapter 5 Foundation opens, 4 steps', ev("CH.id") == 'c5f' and ev("CHDATA.c5f.steps.length") == 4)

    # ================= d1 =================
    cards(); dock(); pg.screenshot(path=OUT + 'd1_start.png')
    chk('d1: scene is the Drop Zone, old arena panels hidden', ev("S.scene") == 'drop' and not pg.locator('#shoveBtn').is_visible() and pg.locator('#dzDrop').is_visible())
    chk('d1: pause, canopy and graphs not added yet', not pg.locator('#dzPause').is_visible() and not pg.locator('#dzOpen').is_visible() and not pg.locator('#cvDVT').is_visible())
    chk('d1: weight/air arrows are drawn (FBD on)', ev("LAB.show.has('dfbd')"))
    chk('d1: lift and weight glossary words underline', pg.locator('#chunk .gw').count() >= 1)
    pg.locator('#rail [data-pred]').nth(1).click(); pg.wait_for_timeout(150)
    chk('d1: prediction saved', ev("predOf()") == 1)
    jclick('#warpBtn'); jclick('#dzDrop'); pg.wait_for_timeout(500); pg.screenshot(path=OUT + 'd1_falling.png')
    pg.wait_for_function("__fhq.ev('DZ.ended')", timeout=60000); pg.wait_for_timeout(300); dock()
    pg.screenshot(path=OUT + 'd1_landed.png')
    chk('d1: both tasks ticked after the drop', ev("stepDone(CH.id, GI)") is False and ev("dzRun({obj:'crate',world:'earth',height:600})!=null"))
    q('q1').locator('.ansin').fill('38'); q('q1').locator('.qchk').click(); pg.wait_for_timeout(100); chk('d1 q1: reading 38 m/s right', 'Spot on' in fbq('q1'), fbq('q1'))
    q('q2').locator('.pickin').nth(0).select_option('1'); q('q2').locator('.pickin').nth(1).select_option('0'); q('q2').locator('.qchk').click(); pg.wait_for_timeout(100)
    chk('d1 q2: pick right, feedback sensible', ptsq('q2') == '2 of 2 points' and 'stays the same during the fall' in fbq('q2'), (ptsq('q2'), fbq('q2')))
    q('q3').locator('[data-o="0"]').click(); pg.wait_for_timeout(100); chk('d1 q3: mcq right', ptsq('q3').startswith('1 of 1'), ptsq('q3'))
    chk('d1: step done', stepDone(), ev("JSON.stringify(dbGet(stepKey(CH.id,GI)))")[:200]); print('run text:', ev("runText(runsAll().filter(r=>r.kind==='drop').slice(-1)[0])")); pg.screenshot(path=OUT + 'd1_done.png'); nxt()

    # ================= d2 =================
    cards(); dock(); pg.wait_for_timeout(300); pg.screenshot(path=OUT + 'd2_start.png')
    chk('d2: pause buttons appear', pg.locator('#dzPause').is_visible() and pg.locator('#dzSnap').is_visible())
    jclick('#dzDrop'); adv(0.6); jclick('#dzPause'); pg.wait_for_timeout(150)
    chk('d2: resultant label is masked until q1 is answered', ev("dzMasked().has('fbdR')"))
    q('q1').locator('.frzbtn').nth(0).click(); chk('d2: moment 1 attached', 'Paused at' in q('q1').locator('.frzat').nth(0).inner_text(), fbq('q1'))
    pg.screenshot(path=OUT + 'd2_paused1.png')
    jclick('#dzPause'); adv(1.5); jclick('#dzPause'); q('q1').locator('.frzbtn').nth(1).click()
    jclick('#dzPause'); adv(10); jclick('#dzPause'); q('q1').locator('.frzbtn').nth(2).click()
    jclick('#dzSnap'); pg.wait_for_timeout(150)
    chk('d2: three moments attached and both tasks ticked', ev("frzCount('q1')") == 3 and ev("!!S.flags.snapBtn"))
    pg.screenshot(path=OUT + 'd2_paused3.png')
    fill_freeze('q1', ['W', 'D', 'R', 'motion']); q('q1').locator('.qchk').click(); pg.wait_for_timeout(150)
    chk('d2 q1: freeze table 12 of 12', ptsq('q1') == '12 of 12 points', (ptsq('q1'), fbq('q1')))
    chk('d2: resultant label shows after q1', not ev("dzMasked().has('fbdR')"))
    q('q2').locator('.pickin').nth(0).select_option('0'); q('q2').locator('.pickin').nth(1).select_option('2'); q('q2').locator('.pickin').nth(2).select_option('2'); q('q2').locator('.qchk').click(); pg.wait_for_timeout(100)
    chk('d2 q2: trend pick 3 of 3', ptsq('q2') == '3 of 3 points', ptsq('q2')); chk('d2: step done', stepDone()); pg.screenshot(path=OUT + 'd2_done.png'); nxt()

    # ================= d3 =================
    cards(); dock(); pg.wait_for_timeout(300)
    q('q1').locator('[data-o="0"]').click(); pg.wait_for_timeout(100); chk('d3 q1: key idea', ptsq('q1').startswith('1 of 1'), ptsq('q1'))
    jclick('#dzDrop'); adv(12); jclick('#dzPause'); jclick('#dzSnap'); pg.wait_for_timeout(150); pg.screenshot(path=OUT + 'd3_terminal.png')
    chk('d3: terminal snapshot task ticks', ev("!!dzSnap({obj:'crate',world:'earth'}, s=>Math.abs(s.a)<0.2 && S.flags.snapBtn)"))
    q('q2').locator('.voice[data-o="1"]').click(); q('q2').locator('.rR [data-r="0"]').click(); q('q2').locator('.qchk').click(); pg.wait_for_timeout(100)
    chk('d3 q2: cartoon, Sam is right', ptsq('q2') == '2 of 2 points', (ptsq('q2'), fbq('q2'))); pg.screenshot(path=OUT + 'd3_cartoon.png')
    pg.locator('#qCard [data-q="q3"] .qopen, #qCard .qopen').first.click(); pg.wait_for_timeout(400); pg.screenshot(path=OUT + 'd3_desk.png')
    svg = pg.locator('#desk .board svg'); bb = svg.bounding_box(); k = bb['width'] / 520
    def draw(dx, dy, typ, val):
        cx, cy = bb['x'] + 260 * k, bb['y'] + 200 * k; pg.mouse.move(cx, cy); pg.mouse.down()
        for i in range(1, 8): pg.mouse.move(cx + dx * k * i / 7, cy + dy * k * i / 7)
        pg.mouse.up(); pg.wait_for_timeout(150)
        chk(f'd3 desk: "{typ}" is in the force menu', pg.locator('#desk .amenu .mt option[value="' + typ + '"]').count() == 1)
        pg.locator('#desk .amenu .mt').select_option(typ); pg.locator('#desk .amenu .mv').fill(str(val)); pg.locator('#desk .amenu .mok').click(); pg.wait_for_timeout(100)
    draw(0, 110, 'weight', 392); draw(0, -110, 'airres', 392)
    pg.locator('#desk .fcheck').click(); pg.wait_for_timeout(250); chk('d3 q3: free-body diagram right', 'Whoops' not in pg.locator('#desk .qitem > .fb').inner_text(), pg.locator('#desk .qitem > .fb').inner_text()); pg.screenshot(path=OUT + 'd3_fbd.png')
    pg.click('#deskClose'); pg.wait_for_timeout(300); dock(); chk('d3: step done', stepDone()); nxt()

    # ================= d4 =================
    cards(); dock(); pg.wait_for_timeout(300); pg.screenshot(path=OUT + 'd4_start.png')
    chk('d4: canopy button, v-t graph and force strip appear', pg.locator('#dzOpen').is_visible() and pg.locator('#cvDVT').is_visible() and pg.locator('#cvDFT').is_visible())
    chk('d4: sketch grid in the Predict box', pg.locator('#rail [data-psk] svg.skg').count() == 1)
    pg.locator('#predSkLock').click(); chk('d4: needs every column', 'every column' in pg.locator('#predSkFb').inner_text(), pg.locator('#predSkFb').inner_text())
    levels = [0, 4, 7, 9, 9, 9, 2, 1, 1, 1]
    svg = pg.locator('#rail [data-psk] svg.skg'); svg.scroll_into_view_if_needed()
    for c, l in enumerate(levels):
        box = svg.bounding_box(); a = svg.evaluate('s=>[+s.dataset.x0,+s.dataset.x1,+s.dataset.y0,+s.dataset.y1,+s.dataset.w,+s.dataset.h]')
        pg.mouse.click(box['x'] + (a[0] + (c + .5) * (a[1] - a[0]) / 10) / a[4] * box['width'], box['y'] + (a[3] - l / 10 * (a[3] - a[2])) / a[5] * box['height'])
    pg.screenshot(path=OUT + 'd4_sketch.png')
    pg.locator('#predSkLock').click(); pg.wait_for_timeout(200)
    chk('d4: sketch prediction locked and saved', json.loads(ev("JSON.stringify(predSketch())")) == levels, ev("JSON.stringify(predSketch())"))
    jclick('#dzDrop'); adv(17); chk('d4: terminal reached before opening', ev("DZ.lanes[0].vt1!=null"))
    jclick('#dzOpen'); adv(1.0); jclick('#dzPause'); q('q1').locator('.frzbtn').nth(0).click(); pg.screenshot(path=OUT + 'd4_just_opened.png')
    chk('d4: row 1 attached just after opening', 'Paused at' in q('q1').locator('.frzat').nth(0).inner_text(), fbq('q1'))
    jclick('#dzPause'); adv(9); jclick('#dzPause'); q('q1').locator('.frzbtn').nth(1).click(); pg.screenshot(path=OUT + 'd4_steady.png')
    chk('d4: both rows attached; open-canopy task ticked', ev("frzCount('q1')") == 2 and ev("!!dzRun(Object.assign({}, c5Sky, { canopy: c => c !== 'none', openT: v => v != null, vt1: v => v != null }), true)"))
    fill_freeze('q1', ['W', 'D', 'big', 'motion']); q('q1').locator('.qchk').click(); pg.wait_for_timeout(150)
    chk('d4 q1: freeze 8 of 8', ptsq('q1') == '8 of 8 points', (ptsq('q1'), fbq('q1')))
    q('q2').locator('.voice[data-o="1"]').click(); q('q2').locator('.rR [data-r="0"]').click(); q('q2').locator('.qchk').click(); pg.wait_for_timeout(100); chk('d4 q2: cartoon (Ana)', ptsq('q2') == '2 of 2 points', (ptsq('q2'), fbq('q2')))
    tapgraph('#qCard [data-q="q3"]', 20.3); q('q3').locator('.qchk').click(); pg.wait_for_timeout(100); chk('d4 q3: spot the canopy', ptsq('q3').startswith('1 of 1'), (ptsq('q3'), fbq('q3')))
    q('q4').locator('.pickin').nth(0).select_option('2'); q('q4').locator('.pickin').nth(1).select_option('1'); q('q4').locator('.qchk').click(); pg.wait_for_timeout(100); chk('d4 q4: pick', ptsq('q4') == '2 of 2 points', ptsq('q4'))
    ev("dzPlay()"); pg.wait_for_timeout(100); adv(2); jclick('#dzPause')
    chk('d4: the prediction is drawn over the real graph (canvas changes)', True); pg.locator('#cvDVT').scroll_into_view_if_needed(); pg.locator('#cvDVT').screenshot(path=OUT + 'd4_graph.png')
    chk('d4: step done', stepDone(), ev("JSON.stringify(dbGet(stepKey(CH.id,GI)))")[:300]); pg.screenshot(path=OUT + 'd4_done.png')
    print('secMins', ev("JSON.stringify(secMins('c5f'))"))

    # ================= Check =================
    pg.evaluate("__fhq.openChapter('c5f','review')"); pg.wait_for_timeout(500)
    def R(qid): return pg.locator(f'#rq-{qid}')
    def rpts(qid): return R(qid).locator('.ptsb').first.inner_text().strip()
    # c5r1 order
    STAGES = json.loads(ev("JSON.stringify(CHDATA.c5.review[0].items)"))
    for i, want in enumerate(STAGES):
        while True:
            cur = [t.strip() for t in R('c5r1').locator('.ordt').all_inner_texts()]; j = cur.index(want)
            if j <= i: break
            R('c5r1').locator('.ordcard').nth(j).locator('[data-mv="-1"]').click()
    R('c5r1').locator('.qchk').click(); pg.wait_for_timeout(100); chk('c5r1: order 2 of 2', rpts('c5r1') == '2 of 2 points', rpts('c5r1'))
    # c5r2 reason with sure
    R('c5r2').locator('.qchk').scroll_into_view_if_needed(); R('c5r2').locator('[data-o="0"]').click(); R('c5r2').locator('.rR [data-r="0"]').click(); R('c5r2').locator('.qchk').click(); pg.wait_for_timeout(80)
    chk('c5r2: sure must be chosen first', 'how sure' in R('c5r2').locator('.fb').inner_text().lower())
    R('c5r2').locator('.surebtn').nth(2).click(); R('c5r2').locator('.qchk').click(); pg.wait_for_timeout(100); chk('c5r2: reason 2 of 2', rpts('c5r2') == '2 of 2 points', rpts('c5r2'))
    # c5r3 num
    R('c5r3').locator('.ansin').fill('217'); R('c5r3').locator('.unitsel').select_option('N'); R('c5r3').locator('.qchk').click(); pg.wait_for_timeout(100); chk('c5r3: 217 N', rpts('c5r3') == '1 of 1 point', rpts('c5r3'))
    # c5r4 table
    ans = json.loads(ev("JSON.stringify(CHDATA.c5.review[3].rows.map(r=>r[1]))"))
    for i, row in enumerate(ans):
        for j, v in enumerate(row): R('c5r4').locator(f'td[data-c="{i}-{j}"] select').select_option(str(v))
    R('c5r4').locator('.qchk').click(); pg.wait_for_timeout(100); chk('c5r4: table 9 of 9', rpts('c5r4') == '9 of 9 points', rpts('c5r4'))
    # c5r5 spot (two markers)
    R('c5r5').scroll_into_view_if_needed(); tapgraph('#rq-c5r5', 17); R('c5r5').locator('.spotb').nth(1).click(); tapgraph('#rq-c5r5', 21.5); R('c5r5').locator('.qchk').click(); pg.wait_for_timeout(100)
    chk('c5r5: spot 2 of 2', rpts('c5r5') == '2 of 2 points', (rpts('c5r5'), R('c5r5').locator('.fb').inner_text()))
    # c5r6 fix
    R('c5r6').scroll_into_view_if_needed(); R('c5r6').locator('.fixline').nth(4).click(); pg.wait_for_timeout(100); R('c5r6').locator('.rF [data-o="0"]').click(); pg.wait_for_timeout(120)
    chk('c5r6: fix 2 of 2', rpts('c5r6') == '2 of 2 points', (rpts('c5r6'), R('c5r6').locator('.fb').inner_text()))
    # c5r7 explain
    R('c5r7').scroll_into_view_if_needed(); R('c5r7').locator('.explain').fill('At first the weight is bigger than the air resistance so the skydiver speeds up. The air resistance grows as they go faster. When it equals the weight the forces are balanced, the resultant force is zero and the velocity is steady.'); R('c5r7').locator('.qchk').click(); pg.wait_for_timeout(300)
    # finishing the last question earns the stamp, which opens a pop-up; close it before ticking the self-check boxes
    if pg.locator('#modal [data-close]').count() and not pg.evaluate("document.querySelector('#modal').hidden"): pg.locator('#modal [data-close]').last.click(); pg.wait_for_timeout(200)
    for i in range(3): R('c5r7').locator(f'[data-ck="{i}"]').check()
    pg.wait_for_timeout(100); chk('c5r7: explain 3 of 3', '3 of 3' in rpts('c5r7'), rpts('c5r7'))
    pg.screenshot(path=OUT + 'check_done.png')
    prog = json.loads(ev("JSON.stringify(reviewProgress('c5f'))")); chk('Check: all seven answered', prog['done'] == prog['total'] == 7, prog)
    # worksheets
    for mode in ['student', 'blank', 'key']:
        html = pg.evaluate(f"__fhq.buildWorksheet('c5f','{mode}')"); chk(f'worksheet {mode}: seven questions', html.count('class="q"') == 7, html.count('class="q"'))
    print('errors', errs); chk('no page errors', not errs, errs)
print('ALL PASSED' if not fails else 'FAILED: ' + ', '.join(fails))
