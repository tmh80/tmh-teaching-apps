"""Observation question types for Chapter 5: freeze (freeze-frame table), spot (tap the moment on a graph) and sketch (sketch the graph).
Run after build.py:  python3 tests/obs_types.py     Screenshots: /tmp/fhq-shots/obs/
Test questions are pushed into Chapter 1 Foundation's Check at run time, so no chapter has to use the new types yet."""
import json, os, pathlib, re
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/obs/'; os.makedirs(OUT, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)

FRZ_JS = """(id, obj) => ({id, type:'freeze', p:'Fill in the table from your three paused moments.', obj, cols:[['W','Weight (N)'],['D','Air resistance (N)'],['R','Resultant (N)'],['motion','Velocity']],
  rows:[{label:'Just after it leaves the helicopter', when:s=>s.cstate==='closed'&&s.v<12&&s.a>0.5, whenMsg:'Pause in the first second of the fall.'},
        {label:'About halfway to its top velocity', when:s=>s.v>=15&&s.v<=23, whenMsg:'Pause when the velocity is between 15 and 23 m/s.'},
        {label:'After it has stopped speeding up', when:s=>Math.abs(s.a)<0.2, whenMsg:'Pause once the velocity has stopped going up.'}],
  example:[[392,25,367,0],[392,108.6,283.4,0],[392,391.2,0.8,1]]})"""
SPOT_JS = """(id, ts) => { const g = () => { const r = dzSimulate({obj:'para', world:'earth', height:1500, canopy:'medium', openAt:20, every:0.5}); return {lines:[{pts:r.pts.filter(p=>p[0]<=40), col:'#1f5f8b'}], tMax:40, vMax:60, vStep:10, tStep:5}; };
  const T = [{ask:'Tap where the canopy opened.', t:[19.5,21], why:'The velocity starts to fall at 20 s.'}, {ask:'Tap a moment when the air resistance was bigger than the weight.', t:[20.1,23.5], why:'Just after it opens.'}];
  return {id, type:'spot', p:'Here is a velocity–time graph of a skydive.', graph:g, targets:T.slice(0, ts)}; }"""
SK_JS = """id => ({id, type:'sketch', p:'A crate is dropped on the Moon. Sketch its velocity for the first 10 seconds.', xLabel:'Time (s)', yLabel:'Velocity downwards (m/s)', cols:10, levels:10, xTicks:['0','1','2','3','4','5','6','7','8','9'], yMax:16, model:[0,1,2,3,4,5,6,7,8,9], look:'A straight line rising from zero.',
  checks:[['Starts at zero', p=>p[0]<=0.5], ['Speeds up all the way', p=>p.every((v,i)=>i===0||v>p[i-1])], ['Speeds up by the same amount every second', p=>{const d=p.slice(1).map((v,i)=>v-p[i]); return Math.max(...d)-Math.min(...d)<=1;}], ['Never levels off', p=>p[9]-p[8]>=0.5]]})"""

def pts(pg, qid): return pg.locator(f'#rq-{qid} .ptsb').first.inner_text().strip()
def fb(pg, qid): return pg.locator(f'#rq-{qid} .qitem > .fb').inner_text()

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1100, 'height': 1000}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
    pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Mia'); pg.click('#whoGo')
    ev = lambda code: pg.evaluate(f'__fhq.ev({json.dumps(code)})')
    pg.evaluate("__fhq.dbSet('tourDone',true)")
    # question objects are built inside the app so their functions work
    ev("window.__mk = {frz: %s, spot: %s, sk: %s}" % (FRZ_JS, SPOT_JS, SK_JS))
    ev("""(()=>{ const R = CHDATA.c1f.review; [__mk.frz('qz1','crate'), __mk.frz('qz2','crate'), __mk.frz('qz3','crate'), __mk.spot('qs1',1), __mk.spot('qs2',1), __mk.spot('qs3',2), __mk.sk('qk1'), __mk.sk('qk2'), __mk.sk('qk3')].forEach(q => R.push(q)); })()""")
    pg.evaluate("__fhq.openChapter('c1f','review'); __fhq.ev(\"DB['revOpen_c1f']=true\"); __fhq.renderReview('c1f')"); pg.wait_for_timeout(300)
    shot = lambda qid, name: (pg.locator(f'#rq-{qid}').scroll_into_view_if_needed(), pg.locator(f'#rq-{qid}').screenshot(path=OUT + name + '.png'))
    adv = lambda sec: ev(f"(()=>{{for(let i=0;i<{int(sec/0.02)};i++)dzUpdate(0.02)}})()")

    # ================= freeze =================
    chk('freeze: three moment rows, 12 boxes', pg.locator('#rq-qz1 .frzrow').count() == 3 and pg.locator('#rq-qz1 .frzin').count() == 12)
    shot('qz1', 'freeze_start')
    chk('freeze: no buttons to press, and each row says when to pause', pg.locator('#rq-qz1 .frzbtn').count() == 0 and 'Pause' in pg.locator('#rq-qz1 .frzat').nth(0).inner_text() and 'by itself' in pg.locator('#rq-qz1 .frzat').nth(0).inner_text())
    ev("dropSetup({height:600, a:{obj:'crate', world:'earth', removed:0}}); resetSim(); dzDrop()")
    adv(0.6); ev('dzPause()'); ev('frzAuto()'); pg.wait_for_timeout(300)
    chk('freeze: pausing in the first second fills row 1 by itself', 'Paused at 0.6 s' in pg.locator('#rq-qz1 .frzat').nth(0).inner_text(), pg.locator('#rq-qz1 .frzat').nth(0).inner_text())
    chk('freeze: only row 1 took it', 'by itself' in pg.locator('#rq-qz1 .frzat').nth(1).inner_text() and 'by itself' in pg.locator('#rq-qz1 .frzat').nth(2).inner_text())
    chk('freeze: attaching also saved a snapshot in the Journal, with a picture', ev("dbGet('dz.snaps',[]).length") == 1 and ev("runsAll().filter(r=>r.kind==='snap'&&r.snap&&r.snap.img).length") == 1)
    ev('frzAuto()'); pg.wait_for_timeout(200)
    chk('freeze: the same moment is not saved twice', ev("dbGet('dz.snaps',[]).length") == 1)
    ev('dzPlay()'); adv(0.8); ev('dzPause()'); ev('frzAuto()'); pg.wait_for_timeout(300)
    chk('freeze: a moment that fits no row attaches nothing', pg.locator('#rq-qz1 .frzat').nth(1).inner_text().startswith('⏸') and ev("dbGet('dz.snaps',[]).length") == 1, pg.locator('#rq-qz1 .frzat').nth(1).inner_text())
    ev('dzPlay()'); adv(0.7); ev('dzPause()'); ev('frzAuto()'); pg.wait_for_timeout(300)
    v = ev('DZ.lanes[0].v'); print('v at row 2 =', round(v, 1))
    chk('freeze: row 2 fills in at a fair velocity', 'Paused at' in pg.locator('#rq-qz1 .frzat').nth(1).inner_text() and pg.locator('#rq-qz1 .frzat').nth(2).inner_text().startswith('⏸'), (v, pg.locator('#rq-qz1 .frzat').nth(1).inner_text()))
    ev('dzPlay()'); adv(10); ev('dzPause()'); ev('frzAuto()'); pg.wait_for_timeout(300)
    chk('freeze: row 3 fills in at terminal velocity', 'Paused at' in pg.locator('#rq-qz1 .frzat').nth(2).inner_text(), pg.locator('#rq-qz1 .frzat').nth(2).inner_text())
    pg.locator('#rq-qz1 .frzredo').nth(2).click(); pg.wait_for_timeout(200)
    chk('freeze: Pick another moment clears a row', pg.locator('#rq-qz1 .frzat').nth(2).inner_text().startswith('⏸'))
    ev('dzPlay()'); adv(1.0); ev('dzPause()'); ev('frzAuto()'); pg.wait_for_timeout(300)
    chk('freeze: and the next fitting pause fills it again', 'Paused at' in pg.locator('#rq-qz1 .frzat').nth(2).inner_text(), pg.locator('#rq-qz1 .frzat').nth(2).inner_text())
    pg.locator('#rq-qz1 .qchk').click(); chk('freeze: empty boxes are refused', 'Fill in every box' in fb(pg, 'qz1'), fb(pg, 'qz1'))
    snaps = ev("dbGet('review.c1f.qz1').v.rows.map(r=>r.snap)")
    def truth(s):
        r = s['W'] - s['D']; return [s['W'], s['D'], r, 0 if s['a'] > 0.2 else (1 if s['a'] >= -0.2 else 2)]
    def fill(qid, snaps, wrong=None):
        for ri, s in enumerate(snaps):
            tr = truth(s)
            for ci, k in enumerate(['W', 'D', 'R', 'motion']):
                loc = pg.locator(f'#rq-{qid} .frzin[data-ri="{ri}"][data-k="{k}"]')
                val = tr[ci]
                if wrong and (ri, k) in wrong: val = wrong[(ri, k)]
                if k == 'motion': loc.select_option(str(val))
                else: loc.fill(str(round(val, 1)) if not isinstance(val, str) else val)
    fill('qz1', snaps); shot('qz1', 'freeze_filled')
    pg.evaluate("__fhq.renderReview('c1f')"); pg.wait_for_timeout(200)
    chk('freeze: a half-done table survives a re-draw', pg.locator('#rq-qz1 .frzin[data-ri="2"][data-k="D"]').input_value() != '' and 'Paused at' in pg.locator('#rq-qz1 .frzat').nth(2).inner_text())
    pg.locator('#rq-qz1 .qchk').click(); pg.wait_for_timeout(100)
    chk('freeze: all right = 12 of 12', pts(pg, 'qz1') == '12 of 12 points', (pts(pg, 'qz1'), fb(pg, 'qz1'))); chk('freeze: locked and green', pg.locator('#rq-qz1 .frzin.right').count() == 12 and pg.locator('#rq-qz1 .frzin').first.is_disabled())
    print('freeze values', [truth(s) for s in snaps])
    # second table: reuse the same snapshots, some wrong
    ev("(()=>{const st=dbGet('review.c1f.qz1'); dbSet('review.c1f.qz2',{v:{rows:st.v.rows.map(r=>({snap:r.snap,vals:{}}))}});})()"); pg.evaluate("__fhq.renderReview('c1f')"); pg.wait_for_timeout(200)
    fill('qz2', snaps, wrong={(0, 'W'): 400, (1, 'R'): 'x', (2, 'motion'): 0, (2, 'D'): 100})
    pg.locator('#rq-qz2 .qchk').click(); pg.wait_for_timeout(100)
    chk('freeze: wrong boxes lose marks (8 of 12)', pts(pg, 'qz2') == '8 of 12 points', pts(pg, 'qz2'))
    chk('freeze: four red boxes, each with the right value in green', pg.locator('#rq-qz2 .frzin.wrong').count() == 4 and pg.locator('#rq-qz2 .corr').count() == 4, pg.locator('#rq-qz2 .corr').all_inner_texts())
    shot('qz2', 'freeze_wrong')
    # wrong object
    ev("dzReset(); dropSetup({height:600, a:{obj:'para', world:'earth', removed:0}}); resetSim(); dzDrop()"); adv(0.6); ev('dzPause()')
    pg.wait_for_timeout(300); chk('freeze: a table about the crate ignores a skydiver pause', pg.locator('#rq-qz3 .frzat').nth(0).inner_text().startswith('⏸'), pg.locator('#rq-qz3 .frzat').nth(0).inner_text())

    # ================= spot =================
    svg = pg.locator('#rq-qs1 svg'); svg.scroll_into_view_if_needed()
    def tap(qid, t, tmax=40):
        box = pg.locator(f'#rq-{qid} svg').bounding_box(); a = pg.locator(f'#rq-{qid} svg').evaluate('s=>[+s.dataset.x0,+s.dataset.x1,+s.dataset.y0,+s.dataset.y1,+s.dataset.w,+s.dataset.h]')
        x = box['x'] + (a[0] + t / tmax * (a[1] - a[0])) / a[4] * box['width']; y = box['y'] + (a[2] + a[3]) / 2 / a[5] * box['height']
        pg.mouse.click(x, y)
    pg.locator('#rq-qs1 .qchk').click(); chk('spot: asks for a marker first', 'place your marker' in fb(pg, 'qs1'), fb(pg, 'qs1'))
    tap('qs1', 20.4); chk('spot: marker placed and read out', re.fullmatch(r'Your marker: 20\.\d s', pg.locator('#rq-qs1 .spotread').inner_text()) is not None, pg.locator('#rq-qs1 .spotread').inner_text())
    chk('spot: marker drawn', pg.locator('#rq-qs1 .tapg circle').count() == 1)
    tap('qs1', 10); chk('spot: tapping again moves the marker', re.fullmatch(r'Your marker: (9\.\d|10) s', pg.locator('#rq-qs1 .spotread').inner_text()) is not None and pg.locator('#rq-qs1 .tapg circle').count() == 1)
    tap('qs1', 20.4); shot('qs1', 'spot_placed')
    pg.evaluate("__fhq.renderReview('c1f')"); pg.wait_for_timeout(200); chk('spot: marker survives a re-draw', 'Your marker: 20.' in pg.locator('#rq-qs1 .spotread').inner_text(), pg.locator('#rq-qs1 .spotread').inner_text())
    pg.locator('#rq-qs1 .qchk').click(); pg.wait_for_timeout(100)
    chk('spot: right moment = 1 of 1', pts(pg, 'qs1') == '1 of 1 point', (pts(pg, 'qs1'), fb(pg, 'qs1'))); chk('spot: green band shown', pg.locator('#rq-qs1 svg .tapg rect').count() == 1)
    tap('qs2', 5); pg.locator('#rq-qs2 .qchk').click(); pg.wait_for_timeout(100)
    chk('spot: wrong moment = 0 and the band shows the right place', pts(pg, 'qs2') == '0 of 1 point' and pg.locator('#rq-qs2 svg .tapg rect').count() == 1 and 'green band' in fb(pg, 'qs2'), (pts(pg, 'qs2'), fb(pg, 'qs2'))); shot('qs2', 'spot_wrong')
    # keyboard
    pg.locator('#rq-qs3 svg').focus(); pg.keyboard.press('ArrowRight'); chk('spot: arrow keys place a marker (middle, then one step)', 'Marker 1: 21 s' in pg.locator('#rq-qs3 .spotread').inner_text(), pg.locator('#rq-qs3 .spotread').inner_text())
    pg.keyboard.press('ArrowLeft'); pg.keyboard.press('ArrowRight'); chk('spot: arrow keys move it', 'Marker 1: 21 s' in pg.locator('#rq-qs3 .spotread').inner_text(), pg.locator('#rq-qs3 .spotread').inner_text())
    chk('spot: two targets show two buttons', pg.locator('#rq-qs3 .spotb').count() == 2)
    pg.locator('#rq-qs3 .spotb').nth(1).click(); tap('qs3', 22); chk('spot: second marker', re.search(r'Marker 2: (21\.9|22)', pg.locator('#rq-qs3 .spotread').inner_text()) is not None, pg.locator('#rq-qs3 .spotread').inner_text())
    shot('qs3', 'spot_two')
    pg.locator('#rq-qs3 .qchk').click(); pg.wait_for_timeout(100); chk('spot: two right = 2 of 2', pts(pg, 'qs3') == '2 of 2 points', (pts(pg, 'qs3'), fb(pg, 'qs3')))

    # ================= sketch =================
    def dot(qid, col, lvl):
        box = pg.locator(f'#rq-{qid} svg.skg').bounding_box(); a = pg.locator(f'#rq-{qid} svg.skg').evaluate('s=>[+s.dataset.x0,+s.dataset.x1,+s.dataset.y0,+s.dataset.y1,+s.dataset.w,+s.dataset.h]')
        cw = (a[1] - a[0]) / 10; x = box['x'] + (a[0] + (col + .5) * cw) / a[4] * box['width']; y = box['y'] + (a[3] - lvl / 10 * (a[3] - a[2])) / a[5] * box['height']
        pg.mouse.click(x, y)
    pg.locator('#rq-qk1 svg.skg').scroll_into_view_if_needed(); shot('qk1', 'sketch_empty')
    pg.locator('#rq-qk1 .qchk').click(); chk('sketch: every column needed', 'every column' in fb(pg, 'qk1'), fb(pg, 'qk1'))
    for c in range(10): dot('qk1', c, c)
    chk('sketch: ten dots joined by a line', pg.locator('#rq-qk1 svg.skg circle').count() == 10 and pg.locator('#rq-qk1 svg.skg polyline').count() == 1)
    shot('qk1', 'sketch_right'); pg.evaluate("__fhq.renderReview('c1f')"); pg.wait_for_timeout(200)
    chk('sketch: dots survive a re-draw', pg.locator('#rq-qk1 svg.skg circle').count() == 10)
    pg.locator('#rq-qk1 .qchk').click(); pg.wait_for_timeout(100)
    chk('sketch: straight line = 4 of 4', pts(pg, 'qk1') == '4 of 4 points', (pts(pg, 'qk1'), fb(pg, 'qk1'))); chk('sketch: four green chips', pg.locator('#rq-qk1 .skchip.ok').count() == 4); shot('qk1', 'sketch_locked_right')
    # drag across the grid sets several columns
    pg.locator('#rq-qk2 svg.skg').scroll_into_view_if_needed(); box = pg.locator('#rq-qk2 svg.skg').bounding_box(); a = pg.locator('#rq-qk2 svg.skg').evaluate('s=>[+s.dataset.x0,+s.dataset.x1,+s.dataset.y0,+s.dataset.y1,+s.dataset.w,+s.dataset.h]')
    px = lambda c: box['x'] + (a[0] + (c + .5) * (a[1] - a[0]) / 10) / a[4] * box['width']; py = lambda l: box['y'] + (a[3] - l / 10 * (a[3] - a[2])) / a[5] * box['height']
    pg.mouse.move(px(0), py(5)); pg.mouse.down()
    for c in range(1, 10): pg.mouse.move(px(c), py(5), steps=3)
    pg.mouse.up()
    chk('sketch: dragging across sets every column', pg.locator('#rq-qk2 svg.skg circle').count() == 10, pg.locator('#rq-qk2 svg.skg circle').count())
    pg.locator('#rq-qk2 .qchk').click(); pg.wait_for_timeout(100)
    print('flat dots', ev("dbGet('review.c1f.qk2').v"))
    chk('sketch: a flat line at level 5 gets 1 of 4 (only "same amount every second" holds)', pts(pg, 'qk2') == '1 of 4 points', pts(pg, 'qk2'))
    chk('sketch: wrong sketch shows the model in green', pg.locator('#rq-qk2 svg.skg polyline[stroke="#1c9a5a"]').count() == 1 and pg.locator('#rq-qk2 .skchip.no').count() >= 3); shot('qk2', 'sketch_wrong')
    # keyboard
    pg.locator('#rq-qk3 svg.skg').focus()
    pg.keyboard.press('ArrowUp'); pg.keyboard.press('ArrowUp'); pg.keyboard.press('ArrowRight'); pg.keyboard.press('ArrowUp')
    d = ev("dbGet('review.c1f.qk3').v"); chk('sketch: arrow keys set dots', d[0] == 2 and d[1] == 1, d)

    # ================= worksheets =================
    ev("(()=>{const R=CHDATA.c1f.review; window.__keep=R.slice(); CHDATA.c1f.review=R.filter(q=>/^q[zsk]/.test(q.id));})()")
    for mode in ['student', 'blank', 'key']:
        html = pg.evaluate(f"__fhq.buildWorksheet('c1f','{mode}')")
        chk(f'worksheet {mode}: has all nine questions', html.count('class="q"') == 9, html.count('class="q"'))
        chk(f'worksheet {mode}: freeze table, graph and sketch grid', 'Paused at' in html and html.count('<svg') >= 6)
    key = pg.evaluate("__fhq.buildWorksheet('c1f','key')"); chk("key: freeze says students' values will differ", "students' will differ" in key and 'Look for' in key)
    stu = pg.evaluate("__fhq.buildWorksheet('c1f','student')"); chk('student: freeze snapshot times and the X markers print in blue', 'class="stu"' in stu and stu.count('#1a56db') > 5)
    sch = pg.evaluate("__fhq.schemeText('c1f')"); chk('scheme has freeze, spot and sketch lines', 'consistency' in sch and 'Accept 19.5 to 21 s' in sch and 'Starts at zero' in sch, sch[-900:])
    pg.evaluate("document.body.insertAdjacentHTML('beforeend','<div id=wsprev style=background:#fff;padding:10px></div>')")
    open(OUT + 'ws_key.html', 'w').write(key); open(OUT + 'ws_student.html', 'w').write(stu)
    ev("CHDATA.c1f.review=window.__keep")

    # phone width
    pg2 = b.new_page(viewport={'width': 390, 'height': 900}); pg2.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
    pg2.goto(F); pg2.wait_for_timeout(300); pg2.fill('#whoName', 'Mia'); pg2.click('#whoGo'); pg2.evaluate("__fhq.dbSet('tourDone',true)")
    pg2.evaluate("code=>__fhq.ev(code)", "window.__mk = {frz: %s, spot: %s, sk: %s}" % (FRZ_JS, SPOT_JS, SK_JS))
    pg2.evaluate("code=>__fhq.ev(code)", "(()=>{const R=CHDATA.c1f.review; [__mk.frz('qz1','crate'), __mk.spot('qs3',2), __mk.sk('qk1')].forEach(q=>R.push(q));})()")
    pg2.evaluate("__fhq.openChapter('c1f','review'); __fhq.ev(\"DB['revOpen_c1f']=true\"); __fhq.renderReview('c1f')"); pg2.wait_for_timeout(300)
    for qid in ['qz1', 'qs3', 'qk1']: pg2.locator(f'#rq-{qid}').scroll_into_view_if_needed(); pg2.locator(f'#rq-{qid}').screenshot(path=OUT + f'phone_{qid}.png')
    wide = [q for q in ['qz1', 'qs3', 'qk1'] if pg2.evaluate(f"document.querySelector('#rq-{q}').scrollWidth") > pg2.evaluate(f"document.querySelector('#rq-{q}').clientWidth") + 1 or pg2.locator(f'#rq-{q}').bounding_box()['x'] + pg2.locator(f'#rq-{q}').bounding_box()['width'] > 391]
    chk('phone (390 px): the new questions fit the screen', not wide, wide)
    # dark mode
    pg.emulate_media(color_scheme='dark')
    for qid in ['qz1', 'qs3', 'qk1']: pg.locator(f'#rq-{qid}').scroll_into_view_if_needed(); pg.locator(f'#rq-{qid}').screenshot(path=OUT + f'dark_{qid}.png')
    print('errors', errs); chk('no page errors', not errs, errs)
print('ALL PASSED' if not fails else 'FAILED: ' + ', '.join(fails))
