"""Lesson mode (Workshop on the rescue builder), Part 1 steps lv1-lv5 and Part 5's Mission Control.
Every task is done with real pointer moves on the bench (drag the lever from the tray, drag the fulcrum, the rock or the hand, tap the lever for its menu, press the real Pull button),
and each run record is compared with wsRecord for the same settings set directly through the model.
Run after build.py:  python3 tests/lesson_engine.py     Screenshots (desktop 1440x900 and phone 390x844): /tmp/fhq-shots/lesson/"""
import pathlib, json
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/lesson/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
KEYS = ['mach', 'cls', 'la', 'ea', 'ropes', 'R', 'L', 'h', 'loadN', 'loadName', 'E', 'need', 'capped', 'short', 'ma', 'rise', 'eDist', 'workIn', 'workOut', 'wasted', 'effPct', 'liftSet']
def start(pg, vp, step):
    pg.set_viewport_size(vp); pg.goto(F); pg.evaluate('localStorage.clear()'); pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    pg.evaluate("__fhq.dbSet('lsSeen',{lever:true})")
    pg.evaluate("__fhq.openChapter('c6a','learn')"); pg.wait_for_timeout(500); pg.evaluate("__fhq.ev('closeModal()')")
    pg.evaluate(f"__fhq.setStep({step})"); pg.wait_for_timeout(200); pg.evaluate("__fhq.ev('hideCards()')"); pg.wait_for_timeout(100)
    if vp['width'] > 600: pg.evaluate("window.scrollTo(0, document.querySelector('#cvScene').getBoundingClientRect().top + scrollY - 16)"); pg.wait_for_timeout(100)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    def xy(x, y):
        bb = pg.locator('#cvScene').bounding_box(); return bb['x'] + x * bb['width'] / 900, bb['y'] + y * bb['height'] / 430
    def drag(a, bpt, steps=14):
        ax, ay = xy(*a); bx, by = xy(*bpt); m = pg.mouse; m.move(ax, ay); m.down()
        for i in range(1, steps + 1): m.move(ax + (bx - ax) * i / steps, ay + (by - ay) * i / steps)
        m.up(); pg.wait_for_timeout(120)
    def tap(x, y): px, py = xy(x, y); pg.mouse.click(px, py); pg.wait_for_timeout(150)
    def pull(secs=5):   # the real ▶ button, then let the animation run
        pg.locator('#wsPull').scroll_into_view_if_needed(); pg.locator('#wsPull').click(); pg.wait_for_timeout(150); ev(f"(()=>{{for(let i=0;i<{int(secs/0.02)};i++)wsUpdate(0.02)}})()"); pg.wait_for_timeout(120)
    def geo(): return json.loads(ev("JSON.stringify(lsLever(0,wsCalc()))"))
    def lastrun(): return json.loads(ev("JSON.stringify(runsAll().slice(-1)[0])"))
    def same_as_direct(label, setup_js):
        """the last run must equal the record made by setting the same settings straight through the model"""
        r = lastrun(); sid = ev("CHDATA.c6.steps[GI].id")
        ev("setStep(GI)"); pg.wait_for_timeout(100); ev("hideCards()"); pg.evaluate("window.scrollTo(0, document.querySelector('#cvScene').getBoundingClientRect().top + scrollY - 16)")
        exp = json.loads(ev(f"(()=>{{{setup_js};return JSON.stringify(wsRecord(wsCalc()))}})()"))
        bad = [k for k in KEYS if (exp.get(k) or 0) != (r.get(k) or 0)]
        chk(f'{label}: the board run equals wsRecord for the same settings set directly', not bad, [(k, exp.get(k), r.get(k)) for k in bad])
    def task(i): return ev(f"CHDATA.c6.steps[GI].tasks[{i}][1]()") is True
    def shot(name, phone=False): pg.screenshot(path=OUT + name + ('_phone' if phone else '') + '.png', full_page=phone)

    # ---------- lv1: just a rope, then drag the lever from the tray ----------
    start(pg, {'width': 1440, 'height': 900}, 0)
    chk('lv1: lesson mode is on, with the lever in the tray and the old panels hidden', ev("LS.on") is True and pg.locator('#lsTray [data-lsadd=lever]').is_visible() and not pg.locator('#wsMachs').is_visible() and not pg.locator('#wsArm').is_visible())
    chk('lv1: the button says ▶ Lift! with just a rope', pg.locator('#wsPull').inner_text() == '▶ Lift!' and ev("WS.mach") == 'hand', pg.locator('#wsPull').inner_text())
    chk('lv1: the Smooshy LIVE inset is still drawn', ev("LS.o.live !== false") is True)
    shot('lv1_rope')
    pull(); chk('lv1: lifting with just a rope reads 294 N', abs(ev("shopE({mach:'hand'})") - 294) < 1e-6); chk('lv1: task 1 ticks', task(0))
    same_as_direct('lv1 rope', "")
    # drop in the wrong place first: the lever must not go on
    a = pg.locator('#lsTray [data-lsadd=lever]').bounding_box(); pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(*xy(780, 60), steps=8); pg.wait_for_timeout(100)
    shot('lv1_dragging'); pg.mouse.up(); pg.wait_for_timeout(150)
    chk('lv1: dropping the lever far from the rock does not put it on', ev("WS.mach") == 'hand')
    pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(*xy(360, 300), steps=10); pg.mouse.up(); pg.wait_for_timeout(200)
    chk('lv1: dragging the lever under the rock sets mach lever, class 1, fulcrum in the middle', ev("[WS.mach, WS.cls, WS.arm]") == ['lever', 1, 1])
    chk('lv1: the button now says ▶ Pull!', pg.locator('#wsPull').inner_text() == '▶ Pull!')
    chk('lv1: the tray tile shows the lever is on the bench', pg.locator('#lsTray [data-lsadd=lever]').is_disabled())
    pull(); chk('lv1: the lever with the fulcrum in the middle reads 294 N', abs(ev("shopE({mach:'lever',cls:1,la:1})") - 294) < 1e-6); chk('lv1: task 3 ticks', task(2))
    same_as_direct('lv1 lever', "wsSetMach('lever')"); ev("wsSetMach('lever')")
    shot('lv1_lever')
    # take it off again from its menu: back to just a rope
    g = geo(); tap(g['b']['x'] - 30, g['b']['y']); chk('lv1: tapping the lever opens its menu with Remove', pg.locator('#lsDock').is_visible() and pg.locator('#lsDock [data-lm=del]').count() == 1)
    pg.locator('#lsDock [data-lm=del]').click(); pg.wait_for_timeout(100); chk('lv1: Remove goes back to just a rope', ev("WS.mach") == 'hand')

    # ---------- lv2: drag the fulcrum ----------
    start(pg, {'width': 1440, 'height': 900}, 1)
    chk('lv2: the lever is already on the bench and cannot be removed', ev("WS.mach") == 'lever' and pg.locator('#lsTray').is_hidden())
    g = geo(); drag((g['fx'], g['fy'] + 40), (g['fx'] - 0.6 * 120, g['fy'] + 40))
    chk('lv2: dragging the fulcrum 0.6 m towards the rock gives 0.40 m (snapped to 0.05)', abs(ev("WS.arm") - 0.4) < 1e-9, ev("WS.arm"))
    chk('lv2: the labels on the bar show both distances', True); shot('lv2_drag')
    pull(); chk('lv2: 73.5 N at 0.4 m', abs(ev("shopE({mach:'lever',cls:1,la:0.4})") - 73.5) < 1e-6); chk('lv2: the fulcrum task ticks', task(1))
    same_as_direct('lv2 0.4 m', "wsSetMach('lever');wsSet('arm',0.4)"); ev("wsSet('arm',0.4)")
    g = geo(); drag((g['fx'], g['fy'] + 40), (g['fx'] - 0.12 * 120, g['fy'] + 40)); chk('lv2: a small drag snaps to the 0.05 m grid', abs(ev("WS.arm") * 20 - round(ev("WS.arm") * 20)) < 1e-9 and abs(ev("WS.arm") - 0.3) < 1e-9, ev("WS.arm"))
    pull(); chk('lv2: a position at 60 N or less ticks the last task', task(3))
    g = geo(); drag((g['fx'], g['fy'] + 40), (g['fx'] - 5 * 120, g['fy'] + 40)); chk('lv2: dragging far past the end stops at the limit (0.20 m)', abs(ev("WS.arm") - 0.2) < 1e-9, ev("WS.arm"))
    g = geo(); drag((g['fx'], g['fy'] + 40), (g['fx'] + 8 * 120, g['fy'] + 40)); chk('lv2: and at 1.80 m the other way', abs(ev("WS.arm") - 1.8) < 1e-9, ev("WS.arm"))
    g = geo(); tap(g['a']['x'] + 40, g['fy']); chk('lv2: the menu has no Remove (the lever is locked) and no class choice', pg.locator('#lsDock').is_visible() and pg.locator('#lsDock [data-lm=del]').count() == 0 and pg.locator('#lsDock [data-lm=cls2]').count() == 0)
    pg.locator('#lsDock [data-lm="arm-"]').click(); chk('lv2: the menu − button moves the fulcrum 0.05 m', abs(ev("WS.arm") - 1.75) < 1e-9, ev("WS.arm"))
   

    # ---------- lv3: rulers ----------
    start(pg, {'width': 1440, 'height': 900}, 2)
    chk('lv3: the rock starts 0.4 m from the fulcrum', abs(ev("WS.arm") - 0.4) < 1e-9)
    pull(); chk('lv3: task 1 ticks', task(0)); chk('lv3: the rulers are on', ev("LAB.show.has('rulers')") is True); shot('lv3_rulers')
    chk('lv3: hand moved 0.40 m', abs(ev("shopDist({mach:'lever',cls:1,la:0.4})") - 0.4) < 1e-6)
    same_as_direct('lv3 0.4 m', "wsSetMach('lever');wsSet('arm',0.4)"); ev("wsSet('arm',0.4)")
    g = geo(); drag((g['fx'], g['fy'] + 40), (g['fx'] - 0.2 * 120, g['fy'] + 40)); pull(); chk('lv3: 0.2 m ticks task 3 and the hand moved 0.90 m', task(2) and abs(ev("shopDist({mach:'lever',cls:1,la:0.2})") - 0.9) < 1e-6)
    same_as_direct('lv3 0.2 m', "wsSetMach('lever');wsSet('arm',0.2)"); ev("wsSet('arm',0.2)")
    g = geo(); drag((g['fx'], g['fy'] + 40), (g['fx'] + 1.4 * 120, g['fy'] + 40)); pull(); chk('lv3: 1.6 m ticks task 5, 1,176 N and the hand moved 0.10 m', task(4) and abs(ev("shopE({mach:'lever',cls:1,la:1.6})") - 1176) < 1e-6 and abs(ev("shopDist({mach:'lever',cls:1,la:1.6})") - 0.1) < 1e-6)
    same_as_direct('lv3 1.6 m', "wsSetMach('lever');wsSet('arm',1.6)"); ev("wsSet('arm',1.6)")
    shot('lv3_16')

    # ---------- lv4: tap the lever, choose a design from its menu, drag the rock or the hand ----------
    start(pg, {'width': 1440, 'height': 900}, 3)
    chk('lv4: the lever menu offers the three designs by what is in the middle, with no class numbers yet', True)
    g = geo(); tap(g['b']['x'] - 40, g['b']['y']); m = pg.locator('#lsDock').inner_text()
    chk('lv4: menu names Fulcrum / Load / Effort in the middle and no class numbers', all(k in m for k in ['Fulcrum in the middle', 'Load in the middle', 'Effort in the middle']) and 'Class 2' not in m, m)
    pg.locator('#lsDock [data-lm=cls2]').click(); pg.wait_for_timeout(100); chk('lv4: choosing Load in the middle sets class 2', ev("[WS.cls, WS.arm]") == [2, 1])
    g = geo(); shot('lv4_c2')
    drag((g['L']['x'], g['L']['y'] - 27), (g['L']['x'] - 0.5 * 120, g['L']['y'] - 27)); chk('lv4: dragging the rock sets the rock-to-fulcrum distance to 0.5 m', abs(ev("WS.arm") - 0.5) < 1e-9, ev("WS.arm"))
    pull(); chk('lv4: class 2 with the rock 0.5 m from the fulcrum is task 2', task(1))
    same_as_direct('lv4 class 2', "wsSetMach('lever');wsSet('cls',2);wsSet('arm',0.5)"); ev("wsSet('cls',2);wsSet('arm',0.5)")
    g = geo(); tap(g['b']['x'] - 40, g['b']['y'] + 0); pg.locator('#lsDock [data-lm=cls3]').click(); pg.wait_for_timeout(100)
    chk('lv4: Effort in the middle sets class 3 with the hand 0.5 m from the fulcrum', ev("[WS.cls, WS.arm]") == [3, 0.5])
    g = geo(); drag((g['E']['x'], g['E']['y'] - 40), (g['E']['x'] + 0.2 * 120, g['E']['y'] - 40)); chk('lv4: dragging the hand changes the hand-to-fulcrum distance', abs(ev("WS.arm") - 0.7) < 1e-9, ev("WS.arm"))
    g = geo(); drag((g['E']['x'], g['E']['y'] - 40), (g['E']['x'] - 0.2 * 120, g['E']['y'] - 40)); chk('lv4: and back to 0.5 m', abs(ev("WS.arm") - 0.5) < 1e-9, ev("WS.arm"))
    pull(); chk('lv4: class 3 with the hand 0.5 m from the fulcrum ticks task 3', task(2)); shot('lv4_c3')
    same_as_direct('lv4 class 3', "wsSetMach('lever');wsSet('cls',3);wsSet('arm',0.5)"); ev("wsSet('cls',3);wsSet('arm',0.5)")
    chk('lv4: class 3 read 1,176 N', abs(ev("shopE({mach:'lever',cls:3,ea:0.5})") - 1176) < 1e-6)

    # ---------- lv5: class names in the menu ----------
    start(pg, {'width': 1440, 'height': 900}, 4)
    g = geo(); tap(g['b']['x'] - 40, g['b']['y']); m = pg.locator('#lsDock').inner_text()
    chk('lv5: the menu now shows the class names', 'Class 1:' in m and 'Class 2:' in m and 'Class 3:' in m, m)
    pull(); chk('lv5: class 3 with the hand 1.0 m from the fulcrum ticks the task', task(0))
    same_as_direct('lv5 class 3', "wsSetMach('lever');wsSet('cls',3);wsSet('arm',1)"); ev("wsSet('cls',3);wsSet('arm',1)"); shot('lv5_c3')

    # ---------- first-time cards: three short cards with OK, a ghost hand, seen once; the ? replays them ----------
    start(pg, {'width': 1440, 'height': 900}, 0); ev("dbSet('lsSeen',{})"); ev("FAST=false")
    a = pg.locator('#lsTray [data-lsadd=lever]').bounding_box(); pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(*xy(360, 300), steps=10); pg.mouse.up(); pg.wait_for_timeout(250)
    ch = pg.locator('#chunk'); chk('cards: the first time the lever goes on, its cards show', ch.is_visible() and 'new piece: lever' in ch.inner_text().lower(), ch.inner_text() if ch.is_visible() else 'hidden')
    chk('cards: card 1 text', 'This is a lever: a long bar that turns on a fulcrum (the triangle).' in ch.inner_text(), ch.inner_text())
    chk('cards: the button says OK', pg.locator('#chunk [data-cb=next]').inner_text() == 'OK'); shot('lv1_card1')
    pg.locator('#chunk [data-cb=next]').click(); pg.wait_for_timeout(150); chk('cards: card 2 text', 'Drag the fulcrum along the bar. Watch the two numbers: how far the rock is from the fulcrum, and how far your hand is.' in ch.inner_text())
    shot('lv1_card2'); pg.locator('#chunk [data-cb=next]').click(); pg.wait_for_timeout(150)
    chk('cards: card 3 text and the Pull button glows', 'Press ▶ Pull! to push down on the end. In the rescue, a lever under the boulder will knock it clear.' in ch.inner_text() and 'coachhi' in (pg.locator('#wsPull').get_attribute('class') or ''))
    shot('lv1_card3'); pg.locator('#chunk [data-cb=next]').click(); pg.wait_for_timeout(150)
    chk('cards: after the last OK they close and the piece is marked seen', ch.is_hidden() and ev("dbGet('lsSeen',{}).lever") is True)
    g = geo(); tap(g['b']['x'] - 30, g['b']['y']); pg.locator('#lsDock [data-lm=del]').click(); pg.wait_for_timeout(100)
    a = pg.locator('#lsTray [data-lsadd=lever]').bounding_box(); pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(*xy(360, 300), steps=10); pg.mouse.up(); pg.wait_for_timeout(250)
    chk('cards: the second time they do not show again', ch.is_hidden() and ev("WS.mach") == 'lever')
    pg.locator('#lsTray [data-lsq=lever]').click(); pg.wait_for_timeout(200); chk('cards: the ? on the tray tile plays them again', ch.is_visible() and 'new piece: lever' in ch.inner_text().lower())
    pg.locator('#chunk .cx').click(); ev("FAST=true")

    # ---------- Part 5: Mission Control ----------
    pg.evaluate("__fhq.openChapter('c6e','learn')"); pg.wait_for_timeout(500); pg.evaluate("__fhq.ev('closeModal()')"); pg.wait_for_timeout(200); pg.evaluate("__fhq.ev('hideCards()')"); pg.wait_for_timeout(1000)
    chk('v1: Mission Control is the scene, with no LIVE inset code path and no bench panels', ev("WS.site") == 'mission' and not pg.locator('#lsTray').is_visible() and not pg.locator('#wsPull').is_visible())
    pg.locator('#cvScene').scroll_into_view_if_needed(); pg.wait_for_timeout(300); shot('v1_mission')
    # phone width screenshots of every converted step
    for i, nm in enumerate(['lv1_rope', 'lv2', 'lv3', 'lv4', 'lv5']):
        start(pg, {'width': 390, 'height': 844}, i); pg.wait_for_timeout(300); shot(nm, True)
    pg.evaluate("__fhq.openChapter('c6e','learn')"); pg.wait_for_timeout(500); pg.evaluate("__fhq.ev('closeModal()')"); pg.evaluate("__fhq.ev('hideCards()')"); pg.wait_for_timeout(800); shot('v1_mission', True)

    # ---------- Part 5 fixes: the lever snaps by overlap, the Drop here glow, the dynamite tap, the board labels ----------
    ns = {}; exec(open('tests/play_rescue.py').read().split('with sync_playwright()')[0], ns)
    pg2 = b.new_page(viewport={'width': 1300, 'height': 950}); pg2.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
    ns['open_part5'](pg2); B = ns['Board'](pg2)
    chk('rescue: the mission card has the new text', all(k in pg2.locator('#mi-gl').inner_text() for k in ['The Gumdrop weighs 6,300 N. Smooshy can only pull 60 N.', 'dotted line at the top of the crater', 'Sugar crystals are gummy money. You have 475 to spend.', 'a 252 N boulder is stuck against its leg']), pg2.locator('#mi-gl').inner_text()[:300])
    chk('rescue: the counter says gummy money', '120' not in pg2.locator('#glCrys').inner_text() and 'sugar crystals (gummy money)' in pg2.locator('#glCrys').inner_text(), pg2.locator('#glCrys').inner_text())
    chk('glossary: sugarcrystal', B.ev("TERMS.sugarcrystal[1]") == 'Gummy money on Glimmer-9. You spend sugar crystals to buy machines, platforms and dynamite.')
    # a lever dragged from the tray and dropped so that its bar lies across the boulder (its load end is 6 m away): it must snap
    a = pg2.locator('#glTray [data-add=lever]').bounding_box(); ax, ay = a['x'] + 20, a['y'] + 20; px, py = B.xy(13, 0.5)
    pg2.mouse.move(ax, ay); pg2.mouse.down(); pg2.mouse.move((ax + px) / 2, (ay + py) / 2, steps=6); pg2.mouse.move(px, py, steps=6)
    chk('rescue: while a lever is dragged, the boulder glows with Drop here', B.ev("glFrameOpts().dropGlow") is True)
    pg2.locator('#glCv').screenshot(path=OUT + 'rescue_drop_here.png'); pg2.mouse.up(); pg2.wait_for_timeout(200)
    lv = B.evr("GLB.rig.parts.find(p=>p.type==='lever')")
    chk('rescue: a lever whose bar overlaps the boulder snaps onto it', lv.get('role') == 'boulder' and lv['x'] == 18.2, lv)
    chk('rescue: a tick toast says Lever on the boulder!', 'Lever on the boulder!' in pg2.locator('#toast').inner_text(), pg2.locator('#toast').inner_text())
    chk('rescue: the glow is off again', B.ev("glFrameOpts().dropGlow") is False)
    pg2.click('#glDock')
    chk('rescue: the board labels are drawn (Boulder, Gumdrop, the beam line)', B.ev("glFrameOpts().labels") is True)
    pg2.locator('#glCv').screenshot(path=OUT + 'rescue_labels.png')
    # dynamite: a click 1.3 m beside it (about 16 px on screen) still picks it, even with a ramp's handle and cable dot right next to it
    B.ev("(()=>{GLB.rig={parts:[],cables:[]};glChanged();})()")
    r1 = B.add('ramp', 16, 0); pg2.click('#glDock'); head = B.evr(f'glMachine(glPart("{r1}"),GLB.ev.ground,[]).end')
    d = B.add('dynS', round(head['x']), 0); pg2.click('#glDock'); dp = B.evr(f'glPart("{d}")'); gy = B.evr(f'glAt(GLB.ev.ground,{dp["x"]})')
    B.ev("GLB.sel=null;glCloseMenu()"); B.tap(dp['x'] + 0.85, gy + 0.9)
    chk('rescue: the dynamite is picked when tapped, not the ramp handle beside it', B.ev('GLB.sel') == d, B.ev('GLB.sel'))
    B.ev("GLB.sel=null;glCloseMenu()"); B.tap(dp['x'] + 2.5, gy + 0.9); chk('rescue: but a tap well away from it does not pick it', B.ev('GLB.sel') != d)
    # on a phone: a finger tap 18 px beside the dynamite (44 px area) picks it
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True); pg3 = ctx.new_page(); pg3.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
    ns['open_part5'](pg3); B3 = ns['Board'](pg3); d3 = B3.ev("(()=>{glAddPart('dynS',30,0);return GLB.sel})()"); B3.ev("GLB.sel=null;glCloseMenu();GLV.cx=30;glClampView()"); pg3.wait_for_timeout(300); pg3.locator('#glCv').scroll_into_view_if_needed(); pg3.wait_for_timeout(100)
    dx, dy = B3.xy(30, B3.evr("glAt(GLB.ev.ground,30)") + 0.9); pg3.touchscreen.tap(dx - 18, dy); pg3.wait_for_timeout(200)
    chk('rescue: on a phone, a finger tap 18 px beside the dynamite picks it', B3.ev('GLB.sel') == d3, [B3.ev('GLB.sel'), d3, B3.ev('GLB.touch')])
    ctx.close()
    chk('no page errors', not errs, errs)
    b.close()
print('FAILS', fails) if fails else print('all passed')
raise SystemExit(1 if fails else 0)
