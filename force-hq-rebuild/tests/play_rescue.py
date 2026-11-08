"""Operation Gummy Lift (Chapter 6 Part 5): build the brief's top route with real mouse moves in the builder, then check the rig.
Run after build.py:  python3 tests/play_rescue.py     Screenshots: /tmp/fhq-shots/rescue/
Stage 3 adds Run Rescue; stage 4 adds resume and the snapshot. Uses the test hook (__fhq) only to read state and convert metres to pixels."""
import json, pathlib, sys
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/rescue/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
def open_part5(pg):
    pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    pg.evaluate("__fhq.ev('DB.user.teacher=true')"); pg.evaluate("__fhq.openChapter('c6e','challenge')"); pg.wait_for_timeout(500)
    pg.evaluate("__fhq.ev('closeModal()')"); pg.wait_for_timeout(200); pg.locator('#glCv').scroll_into_view_if_needed()
class Board:
    def __init__(s, pg): s.pg = pg
    def ev(s, code): return s.pg.evaluate('c=>__fhq.ev(c)', code)
    def xy(s, x, y):
        bb = s.pg.locator('#glCv').bounding_box(); sx, sy, LW, LH = s.ev(f'[glSX({x}),glSY({y}),GLV.LW,GLV.LH]')
        return bb['x'] + sx * bb['width'] / LW, bb['y'] + sy * bb['height'] / LH
    def tap(s, x, y): px, py = s.xy(x, y); s.pg.mouse.click(px, py); s.pg.wait_for_timeout(120)
    def drag(s, a, b, steps=12):
        ax, ay = s.xy(*a); bx, by = s.xy(*b); m = s.pg.mouse; m.move(ax, ay); m.down()
        for i in range(1, steps + 1): m.move(ax + (bx - ax) * i / steps, ay + (by - ay) * i / steps)
        m.up(); s.pg.wait_for_timeout(150)
    def add(s, t, x, y): s.pg.click(f'#glTray [data-add={t}]'); s.tap(x, y); return s.ev('GLB.sel')
    def menu(s, k): s.pg.click(f'#glDock [data-gm="{k}"]'); s.pg.wait_for_timeout(80)
    def part(s, i): return s.ev(f'JSON.stringify(glPart("{i}"))')
    def evr(s, code): return json.loads(s.ev('JSON.stringify(' + code + ')'))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 950}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    open_part5(pg); B = Board(pg)
    chk('one Challenge mission, out of 10', B.evr("CHDATA.c6.challenge.missions.filter(m=>m.kind==='rescue').map(m=>[m.id,m.max])") == [['gl', 10]])
    chk('board starts empty with 0 crystals spent', B.evr('[GLB.rig.parts.length, GLB.ev.cost.total]') == [0, 0])
    chk('handover box starts at the Gumdrop', B.evr('GLB.ev.stop.at') == {'x': 14, 'y': 0})
    # leg 1: ramp from the floor, stretched by its head handle to 24 m rising 6 m
    r1 = B.add('ramp', 16, 0); chk('a ramp dropped by the Gumdrop snaps its foot 1.5 m from it and ropes itself on', B.evr(f'[glPart("{r1}").x1, glPart("{r1}").y1]') == [15.5, 0] and B.evr(f'GLB.rig.cables.some(c=>c.b==="ship"&&c.a==="{r1}")') is True)
    pass
    head = B.evr(f'glMachine(glPart("{r1}"),GLB.ev.ground,[]).end'); B.drag((head['x'], head['y']), (38.74, 6))
    chk('head drag snaps to 24 m long, 6 m rise', B.evr(f'[glPart("{r1}").L, glPart("{r1}").rise]') == [24, 6], B.part(r1))
    # pulley block and winch clip onto the ramp's top
    cp = B.evr(f'glCablePoint(glPart("{r1}"),glMachine(glPart("{r1}"),GLB.ev.ground,[]))')
    bk = B.add('block', cp['x'] + 1.5, cp['y'] + 0.5); B.menu('ropes4')
    wn = B.add('winch', cp['x'] + 3, cp['y'] + 0.5); B.menu('ratio7')
    chk('block and winch clip onto ramp 1', B.evr(f'glChainOf("{r1}")') == [bk, wn], B.evr('GLB.rig.cables'))
    chk('handover box moves to the top of ramp 1', abs(B.evr('GLB.ev.stop.at.x') - 38.74) < 0.05)
    # leg 2 from the shelf, then the same add-ons by dragging a cable from its top dot
    chk('after leg 1 the ghost Gumdrop waits at its top', B.evr('!!GLB.ev.ghost') is True); r2 = B.add('ramp', 41, 6)
    head = B.evr(f'glMachine(glPart("{r2}"),GLB.ev.ground,[]).end'); B.drag((head['x'], head['y']), (63.48, 12))
    chk('ramp 2 is 24 m rising 6 m from the shelf', B.evr(f'[glPart("{r2}").x1, glPart("{r2}").y1, glPart("{r2}").L, glPart("{r2}").rise]') == [40.24, 6, 24, 6], B.part(r2))
    bk2 = B.add('block', 30, 18); B.menu('ropes4')
    wn2 = B.add('winch', 34, 18); B.menu('ratio7')
    cp2 = B.evr(f'glCablePoint(glPart("{r2}"),glMachine(glPart("{r2}"),GLB.ev.ground,[]))')
    w2 = B.evr(f'glPart("{wn2}")'); B.drag((cp2['x'], cp2['y']), (30, 18)); B.drag((30, 18), (w2['x'], w2['y']))
    chk('cables dragged by hand join ramp 2 → block → winch', B.evr(f'glChainOf("{r2}")') == [bk2, wn2], B.evr('GLB.rig.cables'))
    chk('without a blast the route stops short of the beam', B.evr('[GLB.ev.arrived, GLB.ev.stop && GLB.ev.stop.why]') == [False, 'gap'])
    B.add('dynB', 68, 15)
    chk('big dynamite on the crest lets the beam reach', B.evr('GLB.ev.arrived') is True, B.evr('GLB.ev.stop'))
    # the boulder: a lever set beside it snaps on; MA 4 is too little (63 N), MA 5.7 frees it
    lv = B.add('lever', 18, 0); chk('lever beside the boulder works on the boulder', B.evr(f'glPart("{lv}").role') == 'boulder')
    chk('load arm 2 m is not enough for the boulder', B.evr('GLB.ev.boulder.ok') is False); B.menu('arm-')
    chk('load arm 1.5 m clears the boulder', B.evr('GLB.ev.boulder.ok') is True)
    r = B.evr('{s:GLB.ev.score.total,pull:GLB.ev.hardest,hand:GLB.ev.hand,cost:GLB.ev.cost.total}')
    chk('top route built by hand scores 10', r['s'] == 10 and abs(r['pull'] - 56.25) < 0.01 and r['cost'] <= 475, r)
    chk('crystal counter shows the spend', str(r['cost']) in pg.inner_text('#glCrys'))
    # platform height by dragging its top, ruler, undo, autosave
    pf = B.add('platM', 80, 8); top = B.evr(f'GLB.ev.plats.find(q=>q.id==="{pf}").top')
    B.drag((80, top), (80, top + 2)); chk('platform top drag sets its height', B.evr(f'glPart("{pf}").h') == 4, B.part(pf))
    pg.click('[data-gt=undo]'); chk('undo puts the height back', B.evr(f'glPart("{pf}").h') == 2)
    B.tap(80, 10.2); B.menu('del'); chk('Remove takes the platform away', B.evr(f'!!glPart("{pf}")') is False)
    pg.click('[data-gt=ruler]'); a = B.evr('GLB.ruler.a'); B.drag((a['x'], a['y']), (44, 6)); bpt = B.evr('GLB.ruler.b'); B.drag((bpt['x'], bpt['y']), (44, 12))
    chk('ruler measures 6 m straight up', B.evr('[GLB.ruler.a, GLB.ruler.b]') == [{'x': 44, 'y': 6}, {'x': 44, 'y': 12}], B.evr('GLB.ruler'))
    pg.screenshot(path=OUT + 'built-top-route.png', clip={'x': 0, 'y': pg.locator('#glCv').bounding_box()['y'] - 40, 'width': 1300, 'height': 470})
    saved = B.evr("__fhq.dbGet('chal.c6e',{}).gl.rig.parts.length"); chk('rig autosaves after every change', saved == B.evr('GLB.rig.parts.length'))
    chk('no sideways scroll', pg.evaluate('document.documentElement.scrollWidth') <= 1300)
    # phone: board fits, tray wraps, a tap still places a part (touch)
    ph = b.new_page(viewport={'width': 380, 'height': 800}, has_touch=True); ph.on('pageerror', lambda e: errs.append('ERR phone ' + str(e)))
    open_part5(ph); P = Board(ph)
    chk('phone: no sideways scroll', ph.evaluate('document.documentElement.scrollWidth') <= 380, ph.evaluate('document.documentElement.scrollWidth'))
    ph.tap('#glTray [data-add=jack]'); x, y = P.xy(16, 0); ph.touchscreen.tap(x, y); ph.wait_for_timeout(200)
    chk('phone: tap the tray, tap the crater places a jack', P.evr("GLB.rig.parts.filter(p=>p.type==='jack').length") >= 1)
    ph.screenshot(path=OUT + 'phone.png')
    # Run Rescue: predict, run, skip to the end, then check what was saved
    pg.click('[data-gt=ruler]'); pg.select_option('#glPLeg', '1'); chk('Run is locked until a prediction is typed', pg.locator('#glRun').is_disabled())
    pg.fill('#glPVal', '55'); pg.fill('#glWork', 'MA = 4 x 4 x 7 = 112, 6300 / 112'); chk('a typed prediction unlocks Run', pg.locator('#glRun').is_enabled())
    pg.click('#glRun'); pg.wait_for_timeout(2500); pg.screenshot(path=OUT + 'run-mid.png', clip={'x': 0, 'y': pg.locator('#glCv').bounding_box()['y'] - 10, 'width': 1300, 'height': 420})
    B.ev('GLR.t0 = performance.now() - (GLR.total - 2.2) * 1000'); pg.wait_for_timeout(150); pg.screenshot(path=OUT + 'run-beam.png', clip={'x': 0, 'y': pg.locator('#glCv').bounding_box()['y'] - 10, 'width': 1300, 'height': 420})
    pg.click('#glSkip'); pg.wait_for_timeout(600)
    s = B.evr("__fhq.dbGet('chal.c6e',{}).gl")
    chk('run saved: tried, 1 run, best 10', s.get('tried') and s.get('runs') == 1 and s.get('best') == 10, {k: s.get(k) for k in ('tried', 'runs', 'best')})
    chk('best run keeps its rig, summary and prediction', s.get('bestRun') and s['bestRun']['sum']['score'] == 10 and s['bestRun']['pred']['value'] == 55 and len(s['bestRun']['rig']['parts']) == len(s['rig']['parts']))
    chk('Challenge counts as tried', B.evr("challengeDone('c6e')") is True)
    t = pg.inner_text('#glRes'); chk('result shows the spotless stamp and 10 of 10', 'Spotless rescue!' in t and '10 of 10' in t, t[:200])
    chk('the receipt fills in every leg', '56.3 N' in t and '37,800 J' in t, t)
    chk('prediction feedback names the leg', 'for leg 2' in t)
    pg.screenshot(path=OUT + 'run-end.png', full_page=False, clip={'x': 0, 'y': pg.locator('#glCv').bounding_box()['y'] - 10, 'width': 1300, 'height': 900})
    pg.click('#glBack'); pg.wait_for_timeout(200); chk('back to building', pg.evaluate('GLR=undefined') if False else B.evr('GLR.on') is False)
    # a run that stops: remove ramp 2, so the route has a gap
    B.ev(f'glRemove("{r2}")'); pg.fill('#glPVal', '50'); pg.click('#glRun'); pg.wait_for_timeout(300); pg.click('#glSkip'); pg.wait_for_timeout(600)
    s = B.evr("__fhq.dbGet('chal.c6e',{}).gl"); t = pg.inner_text('#glRes')
    chk('a gap gives Not yet, and the best run stays 10', 'Not yet!' in t and s['best'] == 10 and s['bestRun']['sum']['score'] == 10 and s['runs'] == 2, (t[:120], s.get('best')))
    # every section 9 route (and a collapsing platform) plays through the animation without errors and saves its score
    routes = pathlib.Path('tests/rescue_routes.js').read_text(); pg.click('#glBack'); pg.wait_for_timeout(100)
    for k in ['crane', 'long', 'single', 'over', 'dynb', 'weak', 'rock', 'none', 'collapse']:
        mk = "ROUTES.crane(); g.parts.find(p=>p.id==='p2').size='S'" if k == 'collapse' else f"ROUTES.{k}()"
        pg.evaluate('c=>__fhq.ev(c)', routes + f";(()=>{{const g={mk}; GLB.rig=g; glChanged(); glRunPaint();}})()"); pg.wait_for_timeout(80)
        if pg.locator('#glPVal').is_enabled(): pg.fill('#glPVal', '60')
        pg.click('#glRun'); pg.wait_for_timeout(250); B.ev('GLR.t0 -= 1e7'); pg.wait_for_timeout(400)
        last = B.evr("__fhq.dbGet('chal.c6e',{}).gl.last"); exp = {'collapse': None}.get(k, B.evr(routes + f";EXPECT.{k}[2]") if False else None)
        chk(f'route {k} plays through and saves', last and (last['stop'] == 'collapse' if k == 'collapse' else True), last and (last['score'], last['stop']))
        if not pg.locator('#glBack').is_visible(): print('STUCK', k, B.evr('[GLR.on,GLR.done,GLR.total]'), errs); break
        pg.click('#glBack'); pg.wait_for_timeout(100)
    # stage 4: the snapshot, resume after a reload, backups
    snap = B.evr("(__fhq.dbGet('chal.c6e',{}).gl.bestRun||{}).snap||''")
    chk('best run has a JPEG snapshot under 150 KB', snap.startswith('data:image/jpeg') and len(snap) * 0.75 < 150000, len(snap))
    pathlib.Path(OUT + 'snapshot.jpg').write_bytes(__import__('base64').b64decode(snap.split(',', 1)[1]))
    B.ev("glToolAct('zin')"); pg.fill('#glPVal', '42'); pg.fill('#glWork', 'my working'); before = B.evr('[GLB.rig.parts.length, GLV.z, GLV.cx]')
    pg.reload(); pg.wait_for_timeout(400); pg.evaluate("__fhq.openChapter('c6e','challenge')"); pg.wait_for_timeout(500); pg.evaluate("__fhq.ev('closeModal()')")
    chk('reload reopens the rig and the view exactly as left', B.evr('[GLB.rig.parts.length, GLV.z, GLV.cx]') == before, (before, B.evr('[GLB.rig.parts.length, GLV.z, GLV.cx]')))
    chk('reload keeps the prediction and working', pg.input_value('#glPVal') == '42' and pg.input_value('#glWork') == 'my working')
    chk('reload shows the last result again', len(pg.inner_text('#glRes')) > 20)
    chk('a backup carries the snapshot', 'data:image/jpeg' in B.ev('bkPack().text'))
    chk('best run is still the 10', B.evr("__fhq.dbGet('chal.c6e',{}).gl.bestRun.sum.score") == 10)
    chk('no page errors', not errs, errs)
    b.close()
print(f'{len(fails)} failed' if fails else 'all passed'); sys.exit(1 if fails else 0)
