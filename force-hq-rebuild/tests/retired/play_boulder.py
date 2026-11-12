"""The boulder as a two-leg job, and as the tutorial: play the coach from the first step to "Start my rescue" with real pointer moves, check every step, the held boulder,
the ghost boulder, the route strip rows and the run. Screenshots go to /tmp/fhq-shots/boulder/ (1300 px and 400 px wide).
Run after build.py:  python3 tests/play_boulder.py"""
import json, pathlib, sys
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/boulder/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
ns = {}; exec(open('tests/play_rescue.py').read().split('with sync_playwright')[0], ns)
Board, skip = ns['Board'], ns['skip']
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
def open5(pg, real=True):
    """Open Part 5 on a fresh save. real=True: the build students get (home view zoomed in, no test shortcuts)."""
    pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    pg.evaluate("__fhq.ev('DB.user.teacher=true')")
    if real: pg.evaluate("__fhq.ev('FAST=false')")
    pg.evaluate("__fhq.openChapter('c6e','challenge')"); pg.wait_for_timeout(500); pg.evaluate("__fhq.ev('closeModal()')"); pg.wait_for_timeout(200)
    pg.evaluate("__fhq.ev('glIntroEnd()')"); pg.locator('#glCv').scroll_into_view_if_needed(); pg.wait_for_timeout(200)
def shot(pg, name, h=None, w=None):
    pg.wait_for_timeout(200); bb = pg.locator('#glCv').bounding_box(); W = w or pg.viewport_size['width']
    pg.screenshot(path=OUT + name + '.png', clip={'x': 0, 'y': max(0, bb['y'] - 6), 'width': W, 'height': h or bb['height'] + 12})
def shot_el(pg, sel, name):
    pg.locator(sel).scroll_into_view_if_needed(); pg.wait_for_timeout(150); pg.locator(sel).screenshot(path=OUT + name + '.png')
def times(pg):
    """The time of the first frame in which each narration line shows, found by walking the animation's own scene function."""
    return json.loads(pg.evaluate("c=>__fhq.ev(c)", "(()=>{const o={};for(let t=0;t<GLR.total;t+=0.05){const S=glSceneAt(t);if(S.narr&&!(S.narr in o))o[S.narr]=+t.toFixed(2);}return JSON.stringify(o);})()"))
def at(pg, t):
    """Show the run frozen at time t (seconds of animation): the scene function is pinned to t, and the clock is slowed right down so the run does not end."""
    pg.evaluate("c=>__fhq.ev(c)", f"(()=>{{ if(!window.__sceneOrig) window.__sceneOrig=glSceneAt; const o=window.__sceneOrig; glSceneAt=()=>o({t}); GLR.speed=0.0001; }})()"); pg.wait_for_timeout(120)
def unfreeze(pg): pg.evaluate("c=>__fhq.ev(c)", "(()=>{ if(window.__sceneOrig) glSceneAt=window.__sceneOrig; window.__sceneOrig=null; })()")
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 950}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    open5(pg); B = Board(pg)
    guide = lambda: pg.inner_text('#glGuide')
    chk('the coach opens on a fresh board with the lever step', pg.locator('#glGuide').is_visible() and 'lever' in guide() and 'step 1' in guide(), guide()[:200])
    shot(pg, 'step1-lever')
    # 1. drag a lever from the tray onto the boulder
    t = pg.locator('#glTray [data-add=lever]').bounding_box(); tx, ty = t['x'] + t['width'] / 2, t['y'] + t['height'] / 2; bx, by = B.xy(18.6, 0.6)
    pg.mouse.move(tx, ty); pg.mouse.down(); pg.mouse.move(tx + 20, ty - 20, steps=4); pg.mouse.move(bx, by, steps=12); pg.mouse.up(); pg.wait_for_timeout(250)
    lv = B.ev('glWarmLever()&&glWarmLever().id'); chk('a lever dragged onto the boulder snaps on', bool(lv) and B.evr(f'glPart("{lv}").role') == 'boulder' and B.evr(f'glPart("{lv}").x') == 18.2)
    chk('step 2: the coach asks for a shorter load arm and shows the pull', 'load arm' in guide() and '63' in guide() and '60 N is his limit' in guide(), guide()[:300])
    shot(pg, 'step2-arm')
    B.tap(18.2, 0.4); B.menu('arm-')
    chk('arm 1.5 m: Smooshy can lift it, so the coach moves on to the winch step', B.evr('GLB.ev.boulder.pry.easy') is True and B.evr('GLB.ev.boulder.pry.ok') is False and 'drops when he lets go' in guide(), guide()[:300])
    chk('the boulder stays jammed: lever pulls, nothing holds it', B.evr('GLB.ev.boulder.stage') == 'jammed' and 'nothing holds it up' in pg.inner_text('#glDock'), pg.inner_text('#glDock'))
    shot(pg, 'step3-winch')
    # 3. a winch on the lever's pulling end
    # drag the winch from the tray: every place it can clip on glows while it is carried
    t = pg.locator('#glTray [data-add=winch]').bounding_box(); tx, ty = t['x'] + t['width'] / 2, t['y'] + t['height'] / 2; wx, wy = B.xy(34, 4)
    pg.mouse.move(tx, ty); pg.mouse.down(); pg.mouse.move(tx + 20, ty - 20, steps=4); pg.mouse.move(wx, wy, steps=10); pg.wait_for_timeout(250)
    chk('while a winch is carried, the lever\'s pulling end glows with "clips on here"', B.evr('glClipNow().length') == 1 and any(q['text'] == 'clips on here' for q in B.evr('LBL.boxes')), [q['text'] for q in B.evr('LBL.boxes')])
    shot(pg, 'clip-glow')
    px, py = B.xy(30, 2.2); pg.mouse.move(px, py, steps=8); pg.mouse.up(); pg.wait_for_timeout(250)
    chk('a winch dropped near the pulling end clips on and locks the boulder up', B.evr('GLB.ev.boulder.pry.ok') is True and B.evr('GLB.ev.boulder.stage') == 'held' and B.evr('glChainOf("' + lv + '").length') == 1, B.evr('GLB.rig.cables'))
    chk('step 4: the coach asks for a crane on the held boulder', 'crane gantry' in guide() and 'held up' in guide(), guide()[:300])
    shot(pg, 'held-boulder')
    # 4. a crane over the boulder
    pg.click('#glTray [data-add=crane]'); B.tap(18.7, 0.5)
    cr = B.ev('glWarmCrane()&&glWarmCrane().id'); chk('a crane dropped on the boulder snaps to it and works on it', bool(cr) and B.evr(f'[glPart("{cr}").role, glPart("{cr}").x, glPart("{cr}").on]') == ['boulder', 18.7, 'ground'])
    chk('the crane is not roped to the Gumdrop, and its card says it is hooked to the boulder', B.evr(f'GLB.rig.cables.some(c=>c.a==="ship"||c.b==="ship")') is False and 'Crane gantry (on the boulder)' in pg.inner_text('#glDock') and '✓ hooked to the boulder' in pg.inner_text('#glDock'), pg.inner_text('#glDock'))
    chk('step 5: too heavy with a bare crane (252 N)', B.evr('GLB.ev.boulder.move.why') == 'heavy' and 'pulley block' in guide() and 'Too heavy' in guide(), guide()[:300])
    shot(pg, 'step5-pull')
    pg.click('#glTray [data-add=winch]'); B.tap(20.5, 7.4)
    ws = B.evr('GLB.rig.parts.filter(p=>p.type==="winch").map(p=>p.id)'); w2 = [w for w in ws if w != B.evr('glChainOf("' + lv + '")[0]')][0]
    chk('a winch clips onto the crane', B.evr(f'glChainOf("{cr}")') == [w2], B.evr('GLB.rig.cables'))
    B.menu('ratio6')
    chk('winch x6: Smooshy pulls 42 N', abs(B.evr('GLB.ev.boulder.move.pull') - 42) < 0.01 and 'Smooshy can manage this lift' in guide() or 'Lifts' in guide(), guide()[:300])
    chk('step 6 asks for a lift of 5.5 m or more', 'Lifts' in guide() and '5.5' in guide(), guide()[:300])
    B.tap(18.7, 4); 
    for i in range(3): B.menu('rise+')
    chk('Lifts 5.5 m', B.evr(f'glPart("{cr}").rise') == 5.5)
    shot(pg, 'step7-across')
    chk('step 7 asks for Left and Move across', 'Move across' in guide() and 'Left' in guide(), guide()[:300])
    B.menu('dirL')
    for i in range(15): B.menu('across+')
    chk('across 7.5 m to the left sets the boulder down clear of the Gumdrop', B.evr(f'glPart("{cr}").across') == -7.5 and B.evr('GLB.ev.boulder.ok') is True and B.evr('GLB.ev.boulder.stage') == 'clear', B.evr('GLB.ev.boulder'))
    chk('step 8 asks for the test', 'Test in simulator' in guide(), guide()[:300])
    B.ev('GLB.sel=null; glCloseMenu()'); shot(pg, 'ghost-boulder')
    chk('the board shows the ghost boulder tag and the set-down spot', any('Boulder after leg 2' == q['text'] for q in B.evr('LBL.boxes')) and any('Sets down here' == q['text'] for q in B.evr('LBL.boxes')), [q['text'] for q in B.evr('LBL.boxes')])
    # the route strip: two boulder rows
    rows = B.evr('glwRows().map(r=>[r.key,r.name,r.cells.map(c=>c.k)])')
    chk('the strip has Boulder: pry and Boulder: lift', rows == [['B', 'Boulder: pry', ['mach', 'winch1', 'tot', 'pull']], ['B2', 'Boulder: lift', ['winch1', 'tot', 'pull', 'hand']]], rows)
    shot_el(pg, '#glStrip', 'strip-two-rows')
    # 5. test in simulator
    pg.locator('#glCv').scroll_into_view_if_needed(); pg.click('#glRun'); pg.wait_for_timeout(300)
    T = times(pg); print(T)
    for name, key in [('run-pry', 'rises off'), ('run-lift', 'lifts into the air'), ('run-carry', 'carries the boulder'), ('run-lower', 'lowers the boulder')]:
        k = [x for x in T if key in x]
        if k: at(pg, T[k[0]] + 0.9); shot(pg, name)
        else: chk('the run has a beat: ' + key, False, list(T))
    unfreeze(pg); B.ev('GLR.speed=3'); B.ev('GLR.t0=performance.now()-(GLR.total-1)*1000/3'); pg.wait_for_function("__fhq.ev('GLR.done')", timeout=40000); pg.wait_for_timeout(1800)
    lines = B.evr("glState().lastTest.lines.map(l=>l[0])")
    chk('the test says the boulder is pried up and held, then lifted clear', 'The boulder is pried up and held' in lines and 'The boulder is lifted clear' in lines, lines)
    chk('the test counts as tried', B.evr('glState().tests') == 1)
    chk('the coach now shows the end card with Start my rescue', 'Start my rescue' in guide() and 'Two machines, one after the other' in guide(), guide()[:300])
    shot(pg, 'end-card')
    pg.click('#glGuide [data-gw=keep]'); pg.wait_for_timeout(150)
    chk('Start my rescue closes the coach for good, and the boulder machines stay', B.evr('glState().guide') == 'done' and B.evr('GLB.rig.parts.filter(p=>p.role==="boulder").length') == 2)
    chk('no page errors (1300 px)', not errs, errs)
    # ---------- the same board on a phone ----------
    ph = b.new_page(viewport={'width': 400, 'height': 900}, has_touch=True); ph.on('pageerror', lambda e: errs.append('ERR phone ' + str(e)))
    open5(ph); P = Board(ph)
    ph.evaluate("c=>__fhq.ev(c)", "(()=>{GLB.rig={v:2,parts:[{id:'bl',type:'lever',role:'boulder',x:18.2,arm:1,rise:1,dir:1},{id:'blw',type:'winch',ratio:4,x:29.8,y:1.9},{id:'bc',type:'crane',role:'boulder',x:18.7,rise:6,across:-8,adir:-1,on:'ground'},{id:'bcw',type:'winch',ratio:6,x:20.5,y:7.4}],cables:[{a:'bl',b:'blw'},{a:'bc',b:'bcw'}]};glChanged();})()")
    chk('phone: no sideways scroll', ph.evaluate('document.documentElement.scrollWidth') <= 400, ph.evaluate('document.documentElement.scrollWidth'))
    ph.locator('#glCv').scroll_into_view_if_needed(); shot(ph, 'phone-board', w=400)
    shot_el(ph, '#glStrip', 'phone-strip')
    ph.evaluate("c=>__fhq.ev(c)", "GLB.save({id:GLB.mid},{guide:'on',tut:{n0:0}}); glGuidePaint()"); ph.locator('#glGuide').scroll_into_view_if_needed(); ph.wait_for_timeout(200)
    shot_el(ph, '#glGuide', 'phone-coach')
    chk('no page errors (phone)', not errs, errs)
print('FAILS: ' + str(fails) if fails else 'all passed')
