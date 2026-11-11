"""Part 5 board, Tom's 11 Nov 2026 play-test: the crane lowers the load onto whatever is below (only the lift is in the maths); a part stands where the student put it
(a platform added later never lifts it; the settings card has "Stands on"); tapping again picks the piece underneath; the opening shot pans from the Big Jelly to the Gumdrop
and settles zoomed in; the settings card and the tutorial coach sit on the board.   Run after build.py:  python3 tests/board_ux.py"""
import sys
from playwright.sync_api import sync_playwright
ns = {}; exec(open('tests/play_rescue.py').read().split('with sync_playwright')[0], ns)
F, open_part5, Board = ns['F'], ns['open_part5'], ns['Board']
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 950}); errs = []
    pg.on('pageerror', lambda e: errs.append(e.message)); pg.on('console', lambda m: m.type in ('warning', 'error') and errs.append(m.text))
    open_part5(pg); B = Board(pg)
    # 1. the crane lowers
    B.ev("GLB.rig={v:2,parts:[{id:'bl',type:'lever',role:'boulder',x:18.2,arm:1.5,rise:0.5,dir:1},{id:'c1',type:'crane',x:14,rise:4,across:8,adir:1,on:'ground'},{id:'p1',type:'platform',size:'L',x:22,h:1.5},{id:'b1',type:'block',ropes:4,x:15,y:8},{id:'w1',type:'winch',ratio:10,x:9,y:1,on:'ground'},{id:'w2',type:'winch',ratio:4,x:7,y:1,on:'ground'}],cables:[{a:'c1',b:'ship'},{a:'c1',b:'b1'},{a:'b1',b:'w1'},{a:'w1',b:'w2'}]}; glChanged();")
    l = B.evr('GLB.ev.legs[0]'); top = B.evr('GLB.ev.plats[0].top'); sp = B.evr('glSetSpot(glPart("c1"), glMachine(glPart("c1"), GLB.ev.ground, GLB.ev.plats), GLB.ev.ground, GLB.ev.plats)')
    chk('a crane lifting 4 m sets the Gumdrop down on a platform about 1.5 m high: it lowers it', abs(l['end']['y'] - top) < 0.01 and l['end']['x'] == 22 and not l['faults'], l['end'])
    chk('only the lift is in the maths: work = 6,300 N x 4 m, distance 4 m', abs(l['work'] - 6300 * 4) < 1 and abs(l['dist'] - 4) < 1e-6 and l['simple'] is True, (l['work'], l['dist']))
    chk('the board marks the same spot, with no fault', abs(sp['y'] - top) < 0.01 and not sp.get('blocked'), sp)
    B.ev("glPart('p1').h=1.5; glPart('c1').across=-6; glChanged();"); sp = B.evr('glSetSpot(glPart("c1"), glMachine(glPart("c1"), GLB.ev.ground, GLB.ev.plats), GLB.ev.ground, GLB.ev.plats)')
    chk('with nothing but ground below, it lowers onto the ground', abs(sp['y'] - B.evr('glAt(GLB.ev.ground, 8)')) < 0.01 and not sp.get('blocked'), sp)
    B.ev("GLB.dockId='c1'; glPaintDock()"); chk('the crane card says only the lift goes into the maths', 'Only the lift goes into your maths' in pg.inner_text('#glDock'))
    # 2. a part stands where the student put it
    B.ev("GLB.rig={v:2,parts:[],cables:[]}; GLB.sel=null; glCloseMenu(); glChanged();")
    jk = B.add('jack', 30, 1); y0 = B.evr(f'glMachine(glPart("{jk}"), GLB.ev.ground, GLB.ev.plats).start.y'); B.ev('GLB.sel=null; glCloseMenu()')
    pl = B.add('platM', 30, 1); B.ev('GLB.sel=null; glCloseMenu()')
    chk('a platform can be added over a screw jack', B.evr('GLB.rig.parts.length') == 2, B.evr('GLB.rig.parts'))
    chk('and the jack stays on the ground: the platform does not lift it', abs(B.evr(f'glMachine(glPart("{jk}"), GLB.ev.ground, GLB.ev.plats).start.y') - y0) < 1e-6 and B.evr(f'glPart("{jk}").on') == 'ground')
    B.ev(f"GLB.sel='{jk}'; glOpenMenu('{jk}')"); t = pg.inner_text('#glDock')
    chk('the settings card offers Stands on: Ground or Platform', 'Stands on' in t and 'Ground' in t and 'Platform' in t, t)
    pg.click(f'#glDock [data-gm="on:{pl}"]'); pg.wait_for_timeout(100)
    chk('choosing Platform puts it on the platform', abs(B.evr(f'glMachine(glPart("{jk}"), GLB.ev.ground, GLB.ev.plats).start.y') - B.evr('GLB.ev.plats[0].top')) < 1e-6)
    pg.click('#glDock [data-gm="on:ground"]'); pg.wait_for_timeout(100); B.ev('GLB.sel=null; glCloseMenu()')
    w = B.add('winch', 30.5, B.evr('GLB.ev.plats[0].top') + 0.4); chk('a winch dropped on the platform top stands on the platform', B.evr(f'glPart("{w}").on') == pl, B.part(w)); B.ev('GLB.sel=null; glCloseMenu()')
    w2 = B.add('winch', 29, 0.9); chk('a winch dropped under the deck stands on the ground', B.evr(f'glPart("{w2}").on') == 'ground', B.part(w2)); B.ev('GLB.sel=null; glCloseMenu()')
    # 3. tap again for the piece underneath
    gy = B.evr('glAt(GLB.ev.ground, 30)'); B.tap(30, gy + 0.5); s1 = B.evr('GLB.sel'); B.tap(30, gy + 0.5); s2 = B.evr('GLB.sel'); B.tap(30, gy + 0.5); s3 = B.evr('GLB.sel')
    chk('tapping the same spot again picks the next piece underneath, then comes round again', s1 and s2 and s1 != s2 and s3 in (s1, s2, jk, pl, w2), (s1, s2, s3))
    chk('the status line says pieces are on top of each other', 'on top of each other' in pg.inner_text('#glStatus'), pg.inner_text('#glStatus'))
    B.ev(f"GLB.sel='{jk}'; glOpenMenu('{jk}')"); x0 = B.evr(f'glPart("{jk}").x'); B.ev('glCloseMenu()'); B.drag((30.7, gy + 0.9), (33.7, gy + 0.9))
    chk('the picked piece is the one that drags, even with others over it', abs(B.evr(f'glPart("{jk}").x') - (x0 + 3)) < 0.6 and abs(B.evr(f'glPart("{pl}").x') - 30) < 1e-6, (B.part(jk), B.part(pl)))
    # 4. layout: both cards are on the board, and the board has the full width
    chk('the settings card and the tutorial are inside the board', pg.evaluate("!!document.querySelector('#glDock').closest('.glboard') && !!document.querySelector('#glGuide').closest('.glboard')"))
    chk('the board is as wide as its panel', pg.evaluate("document.querySelector('.glboard').getBoundingClientRect().width >= document.querySelector('.glarea').getBoundingClientRect().width - 2"))
    B.ev('GLB.sel=null; glCloseMenu()'); pg.wait_for_timeout(100); chk('with nothing picked the settings card is hidden', not pg.locator('#glDock').is_visible())
    chk('no sideways scroll', pg.evaluate('document.documentElement.scrollWidth') <= 1300)
    # 5. the opening shot and the zoomed-in home view (the real build, not the test shortcut)
    pg.goto(F); pg.evaluate('localStorage.clear()'); pg.reload(); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    pg.evaluate("__fhq.ev('FAST=false; DB.user.teacher=true')"); pg.evaluate("__fhq.openChapter('c6e','challenge')"); pg.wait_for_timeout(500); pg.evaluate("__fhq.ev('closeModal()')"); pg.wait_for_timeout(300)
    v0 = B.evr('[!!GLB.intro, GLV.z, GLV.cx]'); chk('a first visit opens on the Big Jelly, zoomed in', v0[0] is True and v0[1] > 1.3 and v0[2] > 60, v0)
    chk('the tutorial waits until the opening shot is over', not pg.locator('#glGuide').is_visible())
    pg.wait_for_timeout(3600); v1 = B.evr('GLV.cx'); chk('the camera pans left towards the Gumdrop', v1 < v0[2] - 5, (v0, v1))
    pg.locator('#glCv').scroll_into_view_if_needed(); bb = pg.locator('#glCv').bounding_box(); pg.mouse.click(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] - 40); pg.wait_for_timeout(250)
    v2 = B.evr('[!!GLB.intro, GLV.z, GLV.cx, GLB.rig.parts.length]'); chk('a tap skips it and lands in the home view: zoomed in on the crater, nothing placed', v2[0] is False and abs(v2[1] - 1.6) < 1e-6 and 25 < v2[2] < 35 and v2[3] == 0, v2)
    chk('then the tutorial coach appears', pg.locator('#glGuide').is_visible())
    pg.click('[data-gt=zall]'); chk('the whole-crater button still shows everything', B.evr('GLV.z') == 1)
    pg.evaluate("__fhq.openChapter('c6e','challenge')"); pg.wait_for_timeout(500); pg.evaluate("__fhq.ev('closeModal()')"); pg.wait_for_timeout(200); chk('the opening shot plays once only', B.evr('!!GLB.intro') is False)
    chk('no page errors', not errs, errs)
    b.close()
print(f'{len(fails)} failed: {fails}' if fails else 'all passed'); sys.exit(1 if fails else 0)
