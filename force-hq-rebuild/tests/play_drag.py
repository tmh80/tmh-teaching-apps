"""Operation Gummy Lift on the pulling model: just drag the Gumdrop out with a winch post ("build a load of pulleys").
With real pointer moves: place a winch post on the plain beyond the crest, give it 4 ropes and two x10 winches, rope it to the Gumdrop, clear the boulder with a lever,
send the maths to GASA and run it. The rescue is reached and the hull is wrecked. Then take the lever away: the boulder is still on, the landing leg is pulled off, and the ending is "torn".
Run after build.py:  python3 tests/play_drag.py     Screenshots: /tmp/fhq-shots/wiring/ (builder, mid-drag, torn ending, route strip; 1300 px and 400 px wide)."""
import json, pathlib, sys
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/wiring/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
ns = {}; exec(open('tests/play_rescue.py').read().split('with sync_playwright')[0], ns)
open_part5, send_right, Board, skip = ns['open_part5'], ns['send_right'], ns['Board'], ns['skip']
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
def clip(pg, w, h=520):
    bb = pg.locator('#glCv').bounding_box(); return {'x': 0, 'y': max(0, bb['y'] - 20), 'width': w, 'height': h}
RIG = ("{v:2,parts:[{id:'bl',type:'lever',role:'boulder',x:19,arm:1,rise:0.5,dir:1},{id:'pb',type:'block',ropes:4,x:77,y:8.8},{id:'pw1',type:'winch',ratio:10,x:79,y:8.75},{id:'pw2',type:'winch',ratio:10,x:81,y:8.75}],"
       "cables:[{a:'ship',b:'pb'},{a:'pb',b:'pw1'},{a:'pw1',b:'pw2'}]}")
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 950}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    open_part5(pg); B = Board(pg)
    pg.evaluate("__fhq.ev(\"DB.user.teacher=false; (()=>{const st=dbGet('chal.c6e',{}); st.gl=Object.assign(st.gl||{},{guide:'skip'}); dbSet('chal.c6e',st);})(); glGuidePaint();\")")
    # 1. a pulley block on the open plain beyond the crest
    bk = B.add('block', 77, 9); B.menu('ropes4')
    chk('a pulley block can be dropped on open ground', B.evr(f'glPart("{bk}").x') == 77 and B.evr(f'glPart("{bk}").ropes') == 4, B.part(bk))
    pt = B.evr(f'glPart("{bk}")'); hook = B.evr('glShipDots()[0]')
    B.drag((pt['x'], pt['y']), (hook['x'], hook['y']))
    chk('dragging a rope from the block to the Gumdrop ropes the post to the Gumdrop', B.evr(f'GLB.rig.cables.some(c=>c.a==="ship"&&c.b==="{bk}")') is True, B.evr('GLB.rig.cables'))
    chk('the block is a winch post and stands on the ground', B.evr(f'glIsPost("{bk}")') is True and abs(B.evr(f'glPart("{bk}").y') - 8.8) < 0.3, B.part(bk))
    w1 = B.add('winch', 79.5, 9); B.menu('ratio10'); w2 = B.add('winch', 82, 9); B.menu('ratio10')
    chk('two winches clip onto the post, each x10', B.evr(f'glChainOf("{bk}")') == [w1, w2] and B.evr(f'[glPart("{w1}").ratio, glPart("{w2}").ratio]') == [10, 10], B.evr('GLB.rig.cables'))
    d = pg.inner_text('#glDock')
    chk('the settings panel shows the post: ropes, winches and total MA', 'Winch post' in d and '4 pulley ropes' in d and 'winch ×10' in d and 'MA 400' in d, d)
    chk('the post is a leg that drags: no free nudge, force 2,100 N or more', B.evr('GLB.ev.legs[0].type') == 'drag' and B.evr('GLB.ev.legs[0].force') >= 2100 and B.evr('GLB.ev.legs[0].given') is True, B.evr('GLB.ev.legs[0]'))
    # the post can be moved with the pointer
    px = B.evr(f'glPart("{bk}").x'); B.drag((px, B.evr(f'glPart("{bk}").y')), (px - 1, B.evr(f'glPart("{bk}").y'))); chk('the post can be moved', B.evr(f'glPart("{bk}").x') == px - 1, B.evr(f'glPart("{bk}").x'))
    B.drag((px - 1, B.evr(f'glPart("{bk}").y')), (px, B.evr(f'glPart("{bk}").y')))
    # 2. the boulder: a lever beside it, load arm 1.5 m
    lv = B.add('lever', 18, 0); B.menu('arm-')
    chk('the lever clears the boulder', B.evr('GLB.ev.boulder.ok') is True)
    chk('dragging the whole way reaches the tractor beam', B.evr('GLB.ev.arrived') is True, B.evr('[GLB.ev.stop, GLB.ev.legs.map(l=>[l.type,l.force,l.pull])]'))
    chk('the route is a wrecked rescue: 3 points at most, hull 60% or worse', B.evr('GLB.ev.score.ending') == 'wrecked' and B.evr('GLB.ev.score.total') <= 3 and B.evr('GLB.ev.dmg.total') >= 60, B.evr('[GLB.ev.score, GLB.ev.dmg]'))
    pg.screenshot(path=OUT + 'builder_drag_route_1300.png', clip=clip(pg, 1300))
    # 3. the route strip: the force and distance are given, and only rope MA, pull and hand distance are asked
    chk('the strip row gives the force and distance and asks for rope MA, pull and hand distance', 'Dragging here needs' in pg.inner_text('#glStrip') and pg.locator('[data-r="L:' + bk + '"] .glw-cell').count() == 6 and pg.locator('[data-r="L:' + bk + '"] .glw-cell:has-text("Work")').count() == 0, pg.inner_text('#glStrip')[:300])
    pg.locator('#glStrip').scroll_into_view_if_needed(); pg.screenshot(path=OUT + 'route_strip_given_1300.png', clip={'x': 0, 'y': max(0, pg.locator('#glStrip').bounding_box()['y'] - 10), 'width': 1300, 'height': 520})
    # 4. send it and watch the run
    send_right(pg); pg.wait_for_timeout(600)
    pg.wait_for_function('GLR.on===true', timeout=8000)
    B.ev('GLR.t0 = performance.now() - GLR.total * 0.55 * 1000'); pg.wait_for_timeout(250)
    hull = B.evr('GLR.hull'); chk('the Hull meter fills during the run', hull > 5, hull)
    chk('the run tells the story in a plain sentence', 'drag' in pg.inner_text('#glRes').lower() or 'scrape' in pg.inner_text('#glRes').lower(), pg.inner_text('#glRes'))
    pg.screenshot(path=OUT + 'run_mid_drag_1300.png', clip=clip(pg, 1300, 560))
    skip(pg); pg.wait_for_function("document.querySelector('#glRes').innerText.trim().length>0 && GLR.done", timeout=20000); pg.wait_for_timeout(300)
    s = B.evr("__fhq.dbGet('chal.c6e',{}).gl.last")
    chk('the rescue is reached and the ending is wrecked', s['arrived'] is True and s['ending'] == 'wrecked' and s['score'] <= 3, s)
    chk('the result lists where the hull damage came from', 'dragging over rough ground' in pg.inner_text('#glRes'), pg.inner_text('#glRes')[:400])
    chk('the wrecked ending card appears', 'Wrecked, but home!' in pg.inner_text('#glPop'), pg.inner_text('#glPop') if pg.locator('#glPop').count() else 'no card')
    if pg.locator('#glPop [data-gp]').count(): pg.click('#glPop [data-gp]')
    pg.click('#glBack') if pg.locator('#glBack').is_visible() else None
    # 5. take the lever away: the boulder is still on, so the landing leg is pulled off
    B.ev(f'glRemove("{lv}")'); pg.wait_for_timeout(150)
    chk('without the lever the boulder is still on', B.evr('GLB.ev.rockOn') is True)
    chk('the ending is torn: 2 points at most, the strain is 700 N', B.evr('GLB.ev.score.ending') == 'torn' and B.evr('GLB.ev.score.total') <= 2 and B.evr('GLB.ev.torn.strain') == 700 and B.evr('GLB.ev.dmg.torn') == 100, B.evr('[GLB.ev.score, GLB.ev.torn]'))
    send_right(pg); pg.wait_for_timeout(600); pg.wait_for_function('GLR.on===true', timeout=8000)
    B.ev('GLR.t0 = performance.now() - GLR.total * 0.2 * 1000'); pg.wait_for_timeout(250)
    chk('the run narrates the tear with the strain and the 500 N limit', 'ripped off' in pg.inner_text('#glRes') and '700 N' in pg.inner_text('#glRes') and '500 N' in pg.inner_text('#glRes'), pg.inner_text('#glRes'))
    skip(pg); pg.wait_for_function("GLR.done", timeout=20000); pg.wait_for_timeout(300)
    s = B.evr("__fhq.dbGet('chal.c6e',{}).gl.last")
    chk('the saved run says torn', s['ending'] == 'torn' and s['score'] <= 2 and s['torn']['strain'] == 700, s)
    chk('the pulled-apart ending card appears', 'Pulled apart!' in pg.inner_text('#glPop'), pg.inner_text('#glPop') if pg.locator('#glPop').count() else 'no card')
    pg.screenshot(path=OUT + 'torn_ending_1300.png', clip=clip(pg, 1300, 700))
    chk('attempting is always enough to move on: the Challenge counts as tried', B.evr("challengeDone('c6e')") is True)
    chk('no sideways scroll', pg.evaluate('document.documentElement.scrollWidth') <= 1300)
    chk('no page errors (1300 px)', not errs, errs)
    # 6. the same four pictures at 400 px wide, from the same rig
    ph = b.new_page(viewport={'width': 400, 'height': 900}, has_touch=True); ph.on('pageerror', lambda e: errs.append('ERR phone ' + str(e))); open_part5(ph); P = Board(ph)
    ph.evaluate("__fhq.ev(\"(()=>{const st=dbGet('chal.c6e',{}); st.gl=Object.assign(st.gl||{},{guide:'skip'}); dbSet('chal.c6e',st); glGuidePaint();})()\")")
    P.ev(f"GLB.rig={RIG}; glChanged();"); ph.wait_for_timeout(300); ph.locator('#glCv').scroll_into_view_if_needed(); ph.wait_for_timeout(200)
    ph.screenshot(path=OUT + 'builder_drag_route_400.png'); ph.locator('#glStrip').scroll_into_view_if_needed(); ph.wait_for_timeout(150); ph.screenshot(path=OUT + 'route_strip_given_400.png')
    chk('phone: no sideways scroll', ph.evaluate('document.documentElement.scrollWidth') <= 400, ph.evaluate('document.documentElement.scrollWidth'))
    P.ev("glStartRun('launch')"); ph.wait_for_timeout(300); P.ev('GLR.t0 = performance.now() - GLR.total * 0.55 * 1000'); ph.wait_for_timeout(250); ph.locator('#glCv').scroll_into_view_if_needed(); ph.screenshot(path=OUT + 'run_mid_drag_400.png')
    P.ev('GLR.t0 -= 1e7'); ph.wait_for_function('GLR.done', timeout=20000); ph.wait_for_timeout(300)
    P.ev("(()=>{GLB.rig.parts=GLB.rig.parts.filter(p=>p.id!=='bl'); glChanged();})()"); P.ev("glBackToBuild()") if P.evr('GLR.on') else None
    P.ev("glStartRun('launch')"); ph.wait_for_timeout(300); P.ev('GLR.t0 -= 1e7'); ph.wait_for_function('GLR.done', timeout=20000); ph.wait_for_timeout(400); ph.screenshot(path=OUT + 'torn_ending_400.png')
    chk('phone: the pulled-apart card is on screen', 'Pulled apart!' in ph.inner_text('#glPop'))
    chk('no page errors', not errs, errs)
    b.close()
print(f'{len(fails)} failed: {fails}' if fails else 'all passed'); sys.exit(1 if fails else 0)
