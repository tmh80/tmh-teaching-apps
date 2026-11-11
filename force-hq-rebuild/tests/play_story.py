"""Part 5 story: the Glimmer-9 opening text, the guided lever warm-up, the three ending cards and the stopping-point pop-up.
Run after build.py:  python3 tests/play_story.py"""
import json, pathlib
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
src = pathlib.Path('dist/test.html').read_text()
chk('opening mentions Mission Control, Smooshy working each machine, climbing back in and the tractor beam', all(k in src for k in ['Welcome to Gummy Mission Control', 'work each machine you build', 'climbs back in', 'tractor beam']))
chk('no three-stage wording is left in Part 5', 'three stages' not in src and 'stage 3 needs' not in src)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 950}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
    ev = lambda c: pg.evaluate('c=>__fhq.ev(c)', c)
    pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    ev('DB.user.teacher=true'); pg.evaluate("__fhq.openChapter('c6e','challenge')"); pg.wait_for_timeout(500); ev('closeModal()'); pg.wait_for_timeout(200)
    chk('the guided start shows on a fresh board', pg.locator('#glGuide').is_visible())
    pg.locator('#glCv').scroll_into_view_if_needed()
    pg.click('#glTray [data-add=lever]')
    sx, sy, LW, LH = ev('[glSX(18.2),glSY(0),GLV.LW,GLV.LH]'); bb = pg.locator('#glCv').bounding_box()
    pg.mouse.click(bb['x'] + sx * bb['width'] / LW, bb['y'] + sy * bb['height'] / LH); pg.wait_for_timeout(200)
    chk('lever snaps onto the boulder', json.loads(ev('JSON.stringify(glWarmLever()&&glWarmLever().role)')) == 'boulder')
    chk('arm 2 m shows a failing pull, no clear message', '63' in pg.inner_text('#glGuide') and 'rolls free' not in pg.inner_text('#glGuide'), pg.inner_text('#glGuide')[:300])
    ev('(()=>{glWarmLever().arm=1.5;glChanged();})()'); pg.wait_for_timeout(150)
    chk('arm 1.5 m lifts the boulder but it drops back: the guide asks for a winch', 'drops when he lets go' in pg.inner_text('#glGuide') and 'winch' in pg.inner_text('#glGuide'), pg.inner_text('#glGuide')[:300])
    ev("GLB.save({id:GLB.mid},{guide:'skip'}); glGuidePaint()"); pg.wait_for_timeout(100)
    chk('skipping the guide closes it and is remembered', not pg.locator('#glGuide').is_visible() and ev('glState().guide') == 'skip')
    # endings
    ev("glShowEnding({ending:'dented',score:7,dmg:{t:10,r:0,b:0,total:10},stop:null},{first:true,better:true})"); pg.wait_for_timeout(100)
    t = pg.inner_text('#glPop'); chk('dented card names the cause and score', 'Dented' in t and 'thrusters' in t and '7 of 11' in t, t[:200])
    hd = pg.locator('#glPop .glpophd').bounding_box(); pg.mouse.move(hd['x'] + 20, hd['y'] + 8); pg.mouse.down(); pg.mouse.move(hd['x'] + 120, hd['y'] + 90, steps=6); pg.mouse.up()
    nb = pg.locator('#glPop').bounding_box(); chk('ending card is draggable', abs(nb['x'] - (hd['x'] - 20 + 0)) > 20 or nb['y'] > hd['y'] + 40)
    pg.click('#glPop [data-gp=on]'); pg.wait_for_timeout(100)
    chk('first rescue then shows the stopping-point pop-up with Save my work', 'good place to stop' in pg.inner_text('#glPop') and pg.locator('#glPop [data-gp=save]').count() == 1)
    pg.click('#glPop [data-gp=on]'); pg.wait_for_timeout(50); chk('Keep going closes it', pg.locator('#glPop').count() == 0)
    ev("glShowEnding({ending:'spotless',score:10,dmg:{total:0},stop:null},{first:false,better:true})"); pg.wait_for_timeout(100)
    chk('spotless card', 'Spotless' in pg.inner_text('#glPop')); pg.click('#glPop [data-gp=on]'); pg.wait_for_timeout(50)
    chk('no stop pop-up when it is not the first rescue', pg.locator('#glPop').count() == 0)
    ev("glShowEnding({ending:'notyet',score:null,dmg:{total:0},stop:'collapse'},{first:false,better:false})"); pg.wait_for_timeout(100)
    t = pg.inner_text('#glPop'); chk('not-yet card explains the stop and invites another go', 'Not yet' in t and 'platform' in t and 'Check' in t, t[:200])
    pg.click('#glPop [data-gp=on]')
    chk('no page errors', not errs, errs)
print('FAILS: ' + str(fails) if fails else 'all passed')
