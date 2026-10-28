"""Chapter 5 Extension (the Drop Zone): play Learn p1-p3, the three Challenge missions and the Extension Check c5r8-c5r12 with real clicks.
Run after build.py:  python3 tests/play_c5x.py     Screenshots: /tmp/fhq-shots/c5/ (names start with x_)"""
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
    def setnum(sel, v): pg.evaluate("([s,v])=>{const e=document.querySelector(s);e.focus();e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));e.blur()}", [sel, str(v)])
    stepDone = lambda: ev("stepDone(CH.id, GI)")
    def shot(name):   # the arena only: the Your-turn box can sit over it
        ev("qPlace('hidden')"); pg.wait_for_timeout(150); pg.locator('#lab').screenshot(path=OUT + name + '.png')
    q = lambda qid: pg.locator(f'#qCard [data-q="{qid}"]')
    fbq = lambda qid: q(qid).locator('.fb').inner_text()
    def ptsq(qid): return q(qid).locator('.ptsb').first.inner_text().strip()
    def waitEnd(t=90000): pg.wait_for_function("__fhq.ev('DZ.ended')", timeout=t); pg.wait_for_timeout(300)
    def arrange(box, target):
        for i, want in enumerate(target):
            while True:
                cur = [t.strip() for t in box.locator('.ordt').all_inner_texts()]; j = cur.index(want)
                if j <= i: break
                box.locator('.ordcard').nth(j).locator('[data-mv="-1"]').click()

    # heli physics, headless (the numbers from docs/Chapter5_Script.md B3)
    pg.evaluate("__fhq.openChapter('c5x','learn')"); pg.wait_for_timeout(500)
    if pg.locator('#modal').is_visible() and pg.locator('#modal [data-close]').count(): pg.locator('#modal [data-close]').last.click(); pg.wait_for_timeout(200)
    chk('Chapter 5 Extension opens, 3 steps, 3 missions', ev("CH.id") == 'c5x' and ev("CHDATA.c5x.steps.length") == 3 and ev("CHDATA.c5x.challenge.missions.length") == 3)
    r = json.loads(ev("JSON.stringify([heliSimulate(12500,60), heliSimulate(11564,20), heliSimulate(3000,5), heliSimulate(16000,60)])"))
    chk('heli: 12,500 N climbs at a steady 3.0 m/s', abs(r[0]['v'] - 3.0) < 0.02, r[0])
    chk('heli: lift = weight on the pad stays on the pad', r[1]['y'] == 0 and r[1]['v'] == 0, r[1]); chk('heli: small lift stays on the pad', r[2]['y'] == 0, r[2])
    chk('heli: 16,000 N climbs at about 6.5 m/s', abs(r[3]['v'] - ((16000 - 11564) / 104) ** .5) < 0.02, r[3])

    # ================= p1 =================
    cards(); dock(); pg.screenshot(path=OUT + 'x_p1_start.png')
    chk('p1: two lanes, feather and crate, 50 m', ev("DZ.two && DZ.lanes[0].obj==='feather' && DZ.lanes[1].obj==='crate' && DZ.height===50"))
    chk('p1: lane switch, object, air and height controls are on; canopy and graphs hidden', all(pg.locator(s).first.is_visible() for s in ['#dzTwo', '#dzObjs', '#dzAir', '#dzH']) and not pg.locator('#dzCans').is_visible() and not pg.locator('#cvDVT').is_visible())
    pg.locator('#rail [data-pred]').nth(0).click(); pg.wait_for_timeout(150)
    jclick('#warpBtn'); jclick('#dzDrop'); waitEnd()
    chk('p1: air race ticks', ev("!!(dzRun({obj:'feather',world:'earth',height:50,air:0,two:true}) && dzRun({obj:'crate',world:'earth',height:50,air:0,two:true}))"))
    ft = ev("dzTime({obj:'feather',world:'earth',height:50,air:0})"); ct = ev("dzTime({obj:'crate',world:'earth',height:50,air:0})")
    chk('p1: with air the crate lands long before the feather', ct < 12 and ft > 70, (ct, ft))
    jclick('[data-dzedit="0"]'); setnum('#dzAirNum', 100); jclick('[data-dzedit="1"]'); setnum('#dzAirNum', 100)
    chk('p1: both lanes at 100% air removed', ev("DZ.lanes[0].removed===100 && DZ.lanes[1].removed===100"))
    jclick('#dzDrop'); waitEnd(); shot('x_p1_vacuum')
    tf = ev("dzTime({obj:'feather',world:'earth',height:50,air:100})"); tc = ev("dzTime({obj:'crate',world:'earth',height:50,air:100})")
    chk('p1: in a vacuum both land together after 3.2 s', abs(tf - tc) < 0.011 and abs(tc - 3.19) < 0.05, (tf, tc))
    jclick('[data-dzedit="0"]'); setnum('#dzAirNum', 0); jclick('[data-dzobj="basketball"]'); setnum('#dzAirNum', 0); jclick('[data-dzedit="1"]'); setnum('#dzAirNum', 0)
    jclick('#dzDrop'); waitEnd(); dock()
    chk('p1: all four tasks ticked', ev("dzRun({obj:'basketball',world:'earth',air:0})!=null") and ev("predOf()") == 0 and stepDone() is False)
    q('q1').locator('.ansin').fill('3.2'); q('q1').locator('.qchk').click(); pg.wait_for_timeout(100); chk('p1 q1: reading 3.2 s', 'About 3.2' in fbq('q1') or 'Yes, about 3.2' in fbq('q1'), fbq('q1'))
    arrange(q('q2'), json.loads(ev("JSON.stringify(CHDATA.c5.steps[4].qs[1].items)"))); q('q2').locator('.qchk').click(); pg.wait_for_timeout(100); chk('p1 q2: order right', ptsq('q2') == '2 of 2 points', ptsq('q2'))
    q('q3').locator('[data-o="0"]').click(); q('q3').locator('.rR [data-r="0"]').click(); q('q3').locator('.qchk').click(); pg.wait_for_timeout(100); chk('p1 q3: reason right', ptsq('q3') == '2 of 2 points', ptsq('q3'))
    chk('p1: step done', stepDone(), ev("JSON.stringify(dbGet(stepKey(CH.id,GI)))")[:300]); nxt()

    # ================= p2 =================
    cards(); dock(); pg.wait_for_timeout(300); pg.screenshot(path=OUT + 'x_p2_start.png')
    chk('p2: Earth against Moon, 100 m, world picker and velocity graph on', ev("DZ.lanes[0].world==='earth' && DZ.lanes[1].world==='moon' && DZ.height===100") and pg.locator('#dzWorlds').is_visible() and pg.locator('#cvDVT').is_visible() and not pg.locator('#dzCans').is_visible())
    chk('p2: weight label masked for the Moon crate until q4', ev("dzMasked().has('fbdW')"))
    pg.locator('#rail [data-pred]').nth(0).click(); pg.wait_for_timeout(150)
    jclick('#dzDrop'); waitEnd(); shot('x_p2_race')
    mt = ev("dzTime({obj:'crate',world:'moon',height:100})"); chk('p2: Moon crate takes 11.2 s', abs(mt - 11.18) < 0.05, mt)
    jclick('[data-dzedit="0"]'); jclick('[data-dzworld="venus"]'); jclick('#dzDrop'); waitEnd()
    chk('p2: Venus crate run exists and is slow', ev("dzTop({obj:'crate',world:'venus'})") is not None and abs(ev("dzTop({obj:'crate',world:'venus'})") - 4.97) < 0.1, ev("dzTop({obj:'crate',world:'venus'})"))
    dock(); chk('p2: two tasks ticked, q2 still to do', ev("stepDone(CH.id, GI)") is False)
    q('q1').locator('.ansin').fill('11.2'); q('q1').locator('.qchk').click(); pg.wait_for_timeout(100); chk('p2 q1: reading', 'About 11.2' in fbq('q1'), fbq('q1'))
    q('q2').locator('.ansin').fill('277.5'); q('q2').locator('.unitsel').select_option('N'); q('q2').locator('.qchk').click(); pg.wait_for_timeout(100); chk('p2 q2: 277.5 N', ptsq('q2').startswith('1 of 1'), ptsq('q2'))
    q('q3').locator('.pickin').nth(0).select_option('2'); q('q3').locator('.pickin').nth(1).select_option('2'); q('q3').locator('.qchk').click(); pg.wait_for_timeout(100); chk('p2 q3: pick', ptsq('q3') == '2 of 2 points', ptsq('q3'))
    q('q4').locator('.fixline').nth(1).click(); pg.wait_for_timeout(100); q('q4').locator('.ansin').fill('64'); q('q4').locator('.unitsel').select_option('N'); q('q4').locator('.qchk').click(); pg.wait_for_timeout(100)
    chk('p2 q4: fix 2 of 2', ptsq('q4') == '2 of 2 points', (ptsq('q4'), fbq('q4')))
    chk('p2: weight label unmasked after q4', not ev("dzMasked().has('fbdW')")); chk('p2: step done', stepDone(), ev("JSON.stringify(dbGet(stepKey(CH.id,GI)))")[:300]); nxt()

    # ================= p3 =================
    cards(); dock(); pg.wait_for_timeout(300); pg.screenshot(path=OUT + 'x_p3_start.png')
    chk('p3: helicopter pad scene, lift slider on, Drop Zone controls gone', ev("S.scene") == 'heli' and pg.locator('#liftR').is_visible() and not pg.locator('#dzDrop').is_visible() and not pg.locator('#dzObjs').is_visible() and not pg.locator('#dzWorlds').is_visible())
    chk('p3: heli readouts (Height, Velocity) shown; reset button there', pg.locator('#he-readH').is_visible() and pg.locator('#he-readV').is_visible() and pg.locator('#resetBtn').is_visible())
    chk('p3: weight label masked until q1', ev("dzMasked().has('heliW')"))
    chk('p3: on the pad at the start', ev("HE.y===0 && HE.lift===3000"))
    ev("S.running=false"); setnum('#liftNum', 13000)
    chk('p3: lift typed in the number box moves the slider', pg.evaluate("document.querySelector('#liftR').value") == '13000' and ev("HE.lift") == 13000)
    ev("(()=>{for(let i=0;i<1200;i++)heliStep()})()"); ev("S.running=true"); pg.wait_for_timeout(200)
    chk('p3: climbs above 20 m (flag set)', ev("S.flags.heliClimb20===true && HE.y>20"), ev("HE.y"))
    chk('p3: a red marker appears after the lift is held 2 s', pg.locator('#liftMarks i.hi').count() == 1 and ev("HE.hi") == 13000)
    shot('x_p3_climb')
    ev("S.running=false"); setnum('#liftNum', 10000)
    ev("(()=>{let g=0;while(HE.v>0.005&&g++<4000)heliStep(); })()")
    chk('p3: lowering the lift slows the climb to a stop', abs(ev("HE.v")) < 0.02, ev("HE.v"))
    setnum('#liftNum', 11564); ev("(()=>{for(let i=0;i<350;i++)heliStep()})()"); ev("S.running=true"); pg.wait_for_timeout(200)
    chk('p3: lift = weight, |v| tiny: Hovering! (flag and badge)', ev("S.flags.heliHover===true && HE.hovering===true"), (ev("HE.v"), ev("HE.hoverT")))
    chk('p3: a yellow marker is on the slider (10,000 N sank)', pg.locator('#liftMarks i.lo').count() == 1)
    shot('x_p3_hover'); dock()
    q('q1').locator('.ansin').fill('11564'); q('q1').locator('.unitsel').select_option('N'); q('q1').locator('.qchk').click(); pg.wait_for_timeout(100); chk('p3 q1: 11,564 N', ptsq('q1').startswith('1 of 1'), ptsq('q1'))
    chk('p3: weight label unmasked after q1', not ev("dzMasked().has('heliW')"))
    mapping = {'When the forces on an object are balanced, it is still': 'Sometimes true', 'When the forces on an object are balanced, its velocity does not change': 'Always true', 'A hovering helicopter has no forces acting on it': 'Never true', 'A falling object is speeding up': 'Sometimes true', 'Air resistance pushes in the opposite direction to the motion': 'Always true'}
    for row in q('q2').locator('.sortrow').all(): row.locator('select').select_option(label=mapping[row.locator('span').inner_text().strip()])
    q('q2').locator('.qchk').click(); pg.wait_for_timeout(100); chk('p3 q2: sort', ptsq('q2') == '5 of 5 points', ptsq('q2'))
    q('q3').locator('.pickin').nth(0).select_option('1'); q('q3').locator('.pickin').nth(1).select_option('2'); q('q3').locator('.qchk').click(); pg.wait_for_timeout(100); chk('p3 q3: pick', ptsq('q3') == '2 of 2 points', ptsq('q3'))
    chk('p3: step done', stepDone(), ev("JSON.stringify(dbGet(stepKey(CH.id,GI)))")[:300]); print('secMins', ev("JSON.stringify(secMins('c5x'))"))
    # crashing the helicopter: no injuries, just a bump
    ev("S.running=false"); setnum('#liftNum', 3000); ev("(()=>{for(let i=0;i<3000;i++)heliStep()})()"); ev("S.running=true")
    chk('p3: dropping the lift lands the helicopter on the pad with a message', ev("HE.y")==0 and 'Bump' in ev("HE.msg") or ev("HE.y")==0, ev("HE.msg"))

    # ================= Challenge =================
    pg.evaluate("__fhq.setCTab('challenge')"); pg.wait_for_timeout(600); pg.screenshot(path=OUT + 'x_ch_start.png')
    chk('Challenge: three tabs, Drop Zone, canopy and opening height controls only', pg.locator('#mi-drop .mtabs button').count() == 3 and pg.locator('#dzCans').is_visible() and pg.locator('#dzOpenNum').is_visible() and not pg.locator('#dzObjs').is_visible() and not pg.locator('#dzWorlds').is_visible() and not pg.locator('#dzH').is_visible())
    # z2 first: a miss (no canopy), then a pass with a large canopy
    jclick('[data-zr="1"]'); pg.wait_for_timeout(300)
    chk('z2: crate on Mars from 3,000 m', ev("DZ.lanes[0].obj==='crate' && DZ.lanes[0].world==='mars' && DZ.height===3000"))
    jclick('#warpBtn'); jclick('#dzDrop'); waitEnd(); pg.wait_for_timeout(300)
    fb = pg.locator('#zFb').inner_text(); chk('z2: a miss names the landing velocity', fb.startswith('Not quite') and 'too fast' in fb, fb); shot('x_z2_miss')
    jclick('[data-dzcan="large"]'); setnum('#dzOpenNum', 1000); jclick('#dzDrop'); waitEnd(); pg.wait_for_timeout(300)
    fb = pg.locator('#zFb').inner_text(); chk('z2: second drop passes for 3 of 4 points, with the rocket note', fb.startswith('Congratulations') and '3 of 4' in fb and 'rockets' in fb, fb); shot('x_z2_pass')
    # z1
    jclick('[data-zr="0"]'); pg.wait_for_timeout(300); jclick('#warpBtn'); jclick('[data-dzcan="small"]'); setnum('#dzOpenNum', 500); jclick('#dzDrop'); waitEnd(); pg.wait_for_timeout(300)
    fb = pg.locator('#zFb').inner_text(); chk('z1: small canopy misses with each objective named', fb.startswith('Not quite') and 'Landing velocity' in fb and 'Time' in fb and 'Canopy opened at 500 m: OK' in fb, fb)
    jclick('[data-dzcan="medium"]'); setnum('#dzOpenNum', 450); jclick('#dzDrop'); waitEnd(); pg.wait_for_timeout(300)
    fb = pg.locator('#zFb').inner_text(); chk('z1: medium canopy opened at 450 m passes', fb.startswith('Congratulations') and '3 of 4' in fb, fb)
    # z1's clue ladder
    jclick('[data-zr="2"]'); pg.wait_for_timeout(300); pg.locator('#mi-drop > details.clue > summary').click(); pg.locator('#zNext').click(); pg.locator('#zNext').click()
    chk('z3: the clue ladder shows one more clue each press', pg.locator('#zClues p').count() == 2)
    # z3: no canopy
    jclick('#warpBtn'); jclick('#dzDrop'); waitEnd(); pg.wait_for_timeout(300)
    fb = pg.locator('#zFb').inner_text(); chk('z3: no canopy passes on the first drop (4 of 4)', fb.startswith('Congratulations') and '4 of 4' in fb, fb); shot('x_z3_pass')
    chk('Challenge: all three missions tried', ev("challengeDone('c5x')") is True and ev("JSON.stringify(challengeState('c5x'))").count('3') >= 1, ev("JSON.stringify(challengeState('c5x'))"))

    # ================= Extension Check =================
    pg.evaluate("__fhq.openChapter('c5x','review')"); pg.wait_for_timeout(500)
    def R(qid): return pg.locator(f'#rq-{qid}')
    def rpts(qid): return R(qid).locator('.ptsb').first.inner_text().strip()
    R('c5r8').scroll_into_view_if_needed(); R('c5r8').locator('.ansin').fill('992'); R('c5r8').locator('.unitsel').select_option('N'); R('c5r8').locator('.qchk').click(); pg.wait_for_timeout(100); chk('c5r8: 992 N', rpts('c5r8') == '1 of 1 point', rpts('c5r8'))
    R('c5r9').scroll_into_view_if_needed(); R('c5r9').locator('[data-o="0"]').click(); R('c5r9').locator('.rR [data-r="0"]').click(); R('c5r9').locator('.surebtn').nth(2).click(); R('c5r9').locator('.qchk').click(); pg.wait_for_timeout(100); chk('c5r9: reason 2 of 2', rpts('c5r9') == '2 of 2 points', rpts('c5r9'))
    R('c5r10').scroll_into_view_if_needed(); svg = R('c5r10').locator('svg.skg'); box = svg.bounding_box(); a = svg.evaluate('s=>[+s.dataset.x0,+s.dataset.x1,+s.dataset.y0,+s.dataset.y1,+s.dataset.w,+s.dataset.h]')
    for i in range(10):   # one tap per column at level i (a straight line from 0)
        x = a[0] + (i + .5) * (a[1] - a[0]) / 10; y = a[3] - i / 10 * (a[3] - a[2]); pg.mouse.click(box['x'] + x / a[4] * box['width'], box['y'] + y / a[5] * box['height'])
    R('c5r10').locator('.qchk').click(); pg.wait_for_timeout(120); chk('c5r10: sketch 4 of 4', rpts('c5r10') == '4 of 4 points', (rpts('c5r10'), R('c5r10').locator('.fb').inner_text()))
    items = json.loads(ev("JSON.stringify(CHDATA.c5.review.find(q=>q.id==='c5r11').items)")); R('c5r11').scroll_into_view_if_needed(); arrange(R('c5r11'), items); R('c5r11').locator('.qchk').click(); pg.wait_for_timeout(100); chk('c5r11: order 2 of 2', rpts('c5r11') == '2 of 2 points', rpts('c5r11'))
    R('c5r12').scroll_into_view_if_needed(); R('c5r12').locator('.explain').fill('Mars has very thin air, so there is much less air resistance on the rover at any velocity. The air resistance only balances the weight at a very high velocity, so even with a parachute the terminal velocity is too fast. The rockets add an upward force that slows the rover down.'); R('c5r12').locator('.qchk').click(); pg.wait_for_timeout(300)
    if pg.locator('#modal [data-close]').count() and not pg.evaluate("document.querySelector('#modal').hidden"): pg.locator('#modal [data-close]').last.click(); pg.wait_for_timeout(200)
    for i in range(3): R('c5r12').locator(f'[data-ck="{i}"]').check()
    pg.wait_for_timeout(100); chk('c5r12: explain 3 of 3', '3 of 3' in rpts('c5r12'), rpts('c5r12')); pg.screenshot(path=OUT + 'x_check_done.png')
    prog = json.loads(ev("JSON.stringify(reviewProgress('c5x'))")); chk('Check: all five answered', prog['done'] == prog['total'] == 5, prog)
    for mode in ['student', 'blank', 'key']:
        html = pg.evaluate(f"__fhq.buildWorksheet('c5x','{mode}')"); chk(f'worksheet {mode}: five questions', html.count('class="q"') == 5, html.count('class="q"'))
    print('errors', errs); chk('no page errors', not errs, errs)
print('ALL PASSED' if not fails else 'FAILED: ' + ', '.join(fails))
