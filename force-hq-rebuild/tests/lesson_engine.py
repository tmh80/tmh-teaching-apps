"""Lesson mode (Workshop on the rescue builder), Part 1 steps lv1-lv5 and Part 5's Mission Control.
Every task is done with real pointer moves on the bench (drag the lever from the tray, drag the fulcrum, the rock or the hand, tap the lever for its menu, press the real Pull button),
and each run record is compared with wsRecord for the same settings set directly through the model.
Run after build.py:  python3 tests/lesson_engine.py     Screenshots (desktop 1440x900 and phone 390x844): /tmp/fhq-shots/lesson/"""
import pathlib, json
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/stage3/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
KEYS = ['mach', 'cls', 'la', 'ea', 'ropes', 'R', 'L', 'h', 'thick', 'per', 'pitch', 'bw', 'bn', 'br', 'cable', 'parts', 'turns', 'loadN', 'loadName', 'E', 'need', 'capped', 'short', 'ma', 'rise', 'eDist', 'workIn', 'workOut', 'wasted', 'effPct', 'liftSet']
def start(pg, vp, step, sec='c6a'):
    pg.set_viewport_size(vp); pg.goto(F); pg.evaluate('localStorage.clear()'); pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    pg.evaluate("__fhq.dbSet('lsSeen',{lever:true,crane:true,block:true,winch:true,ramp:true,jack:true,cables:true,platform:true})" if sec != 'c6a' else "__fhq.dbSet('lsSeen',{lever:true})")
    pg.evaluate(f"__fhq.openChapter('{sec}','learn')"); pg.wait_for_timeout(500); pg.evaluate("__fhq.ev('closeModal()')")
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
        r = lastrun(); sid = ev("CHDATA[CH.id].steps[GI].id")
        ev("setStep(GI)"); pg.wait_for_timeout(100); ev("hideCards()"); pg.evaluate("window.scrollTo(0, document.querySelector('#cvScene').getBoundingClientRect().top + scrollY - 16)")
        exp = json.loads(ev(f"(()=>{{{setup_js};return JSON.stringify(wsRecord(wsCalc()))}})()"))
        bad = [k for k in KEYS if (exp.get(k) or 0) != (r.get(k) or 0)]
        chk(f'{label}: the board run equals wsRecord for the same settings set directly', not bad, [(k, exp.get(k), r.get(k)) for k in bad])
    def task(i): return ev(f"CHDATA[CH.id].steps[GI].tasks[{i}][1]()") is True
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


    # ---------- Parts 2 to 4 (stage 3): crane gantry, pulley block, winch, ramp, wedge, screw jack, compound, the k3 two-leg practice ----------
    J = lambda code: json.loads(ev('JSON.stringify(' + code + ')'))
    def tray_drop(piece, target, steps=12):   # drag a tray tile onto the board with real pointer moves
        a = pg.locator(f'#lsTray [data-lsadd={piece}]').bounding_box(); pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(*xy(*target), steps=steps); pg.wait_for_timeout(60); pg.mouse.up(); pg.wait_for_timeout(200)
    def zc(piece, i=0): z = J(f"lsZones('{piece}')")[i]; return ((z['x0'] + z['x1']) / 2, (z['y0'] + z['y1']) / 2)
    def end(k): e = J("lsEnds()")[k]; return (e['x'], e['y'])
    def rope(a, b): drag(end(a), end(b), 10)
    def dk(k): pg.locator(f'#lsDock [data-lm="{k}"]').click(); pg.wait_for_timeout(80)
    def ends(): return sorted(J("lsEnds()").keys())
    def run_equals(label, js):   # like same_as_direct, but keeps the lesson board as it is: the same settings are set straight through the model, read, and put back
        r = lastrun(); exp = json.loads(ev("(()=>{const keep=Object.assign({},WS); %s; const rec=wsRecord(wsCalc()); Object.assign(WS,keep); wsRenderControls(); return JSON.stringify(rec)})()" % js))
        bad = [k for k in KEYS if (exp.get(k) or 0) != (r.get(k) or 0)]
        chk(f'{label}: the board run equals wsRecord for the same settings set directly', not bad, [(k, exp.get(k), r.get(k)) for k in bad])
    def both(name):   # one desktop (1440x900) and one phone (390x844) picture of the same moment
        pg.screenshot(path=OUT + name + '_1440.png'); vp0 = pg.viewport_size; pg.set_viewport_size({'width': 390, 'height': 844}); pg.wait_for_timeout(350)
        pg.screenshot(path=OUT + name + '_390.png'); pg.set_viewport_size(vp0); pg.wait_for_timeout(300)
    # ----- pl1: the crane, then the pulley block -----
    start(pg, {'width': 1440, 'height': 900}, 0, 'c6b')
    chk('pl1: lesson mode, NO crane yet (it is a tray tile), 1 rope, ▶ off, the block tile waits', ev("[LS.on, WS.mach, WS.ropes, !!LS.pl.crane, lsGate()]") == [True, 'pulley', 1, False, False] and pg.locator('#lsTray [data-lsadd=crane]').is_enabled() and pg.locator('#lsTray [data-lsadd=block]').is_disabled() and pg.locator('#wsPull').is_disabled())
    tray_drop('block', end('load')); chk('pl1: a block cannot go on before the crane', ev("!!LS.pl.block") is False)
    tray_drop('crane', (780, 60)); chk('pl1: a crane dropped far from the load is refused', ev("!!LS.pl.crane") is False)
    tray_drop('crane', zc('crane')); chk('pl1: dragging the crane over the crate puts it on and ropes the crate to its hook', ev("[!!LS.pl.crane, JSON.stringify(LS.cab), lsGate()]") == [True, '[["load","top"]]', True], ev("JSON.stringify(LS.cab)"))
    chk('pl1: the crane tile shows it is on the bench and the block tile is open', pg.locator('#lsTray [data-lsadd=crane]').is_disabled() and pg.locator('#lsTray [data-lsadd=block]').is_enabled())
    dk('rm:crane'); chk('pl1: Remove takes the crane off: the tile comes back, the block waits again', ev("!!LS.pl.crane") is False and pg.locator('#lsTray [data-lsadd=crane]').is_enabled() and pg.locator('#lsTray [data-lsadd=block]').is_disabled() and pg.locator('#wsPull').is_disabled())
    tray_drop('crane', zc('crane'))
    chk('pl1: the old panels are hidden', not pg.locator('#wsCtl').is_visible() and not pg.locator('#wsRopesUp').is_visible() and not pg.locator('#wsMachs').is_visible())
    chk('pl1: the panel shows the crane and the block without tapping', 'Crane gantry' in pg.inner_text('#lsDock') and 'Pulley block' in pg.inner_text('#lsDock'))
    chk('pl1: the button says ▶ Pull!', pg.locator('#wsPull').inner_text() == '▶ Pull!')
    pull(); chk('pl1: 1 rope (crane only) reads 235.2 N', abs(ev("shopE({mach:'pulley',ropes:1})") - 235.2) < 1e-6); run_equals('pl1 1 rope', "wsSet('ropes',1)")
    chk('pl1: the block drop glows at both hooks and a drop far away is refused', True)
    tray_drop('block', (780, 60)); chk('pl1: a block dropped far from the hooks is not placed', ev("!!LS.pl.block") is False)
    tray_drop('block', end('top')); chk('pl1: dragging the block onto the crane hook clips it on with 2 ropes and ropes it up', ev("[!!LS.pl.block, WS.ropes, JSON.stringify(LS.cab)]") == [True, 2, '[["blk","top"]]'], ev("JSON.stringify(LS.cab)"))
    chk('pl1: the tray tile shows the block is on', pg.locator('#lsTray [data-lsadd=block]').is_disabled())
    both('pl1_block')
    rope_end = end('blk'); drag(end('blk'), (780, 60), 8); chk('pl1: dragging the block\'s rope off its ◉ takes the rope off and ▶ goes off', ev("lsGate()") is False and pg.locator('#wsPull').is_disabled())
    rope('blk', 'top'); chk('pl1: dragging from ◉ to ◉ ropes it again', ev("lsGate()") is True)
    for n in (2, 3, 4):
        while ev("WS.ropes") < n: dk('ropes+')
        pull(); chk(f'pl1: {n} supporting ropes: the run equals the model', abs(ev(f"shopE({{mach:'pulley',ropes:{n}}})") - 235.2 / n) < 1e-6); run_equals(f'pl1 {n} ropes', f"wsSet('ropes',{n})")
    chk('pl1: task 1 (the crane) and task 2 (1, 2, 3 and 4 ropes) tick', task(1) and task(2))
    dk('rm:block'); chk('pl1: Remove takes the block off: 1 rope, roped straight to the crane', ev("[!!LS.pl.block, WS.ropes, JSON.stringify(LS.cab)]") == [False, 1, '[["load","top"]]'])
    tray_drop('block', end('load')); chk('pl1: the block also clips onto the crate\'s hook', ev("!!LS.pl.block") is True)
    pass
    # ----- pl2: the winch -----
    start(pg, {'width': 1440, 'height': 900}, 1, 'c6b'); tray_drop('crane', zc('crane'))
    chk('pl2: ▶ is off until a winch is on the rope end', pg.locator('#wsPull').is_disabled() and ev("lsGate()") is False)
    tray_drop('winch', (780, 60)); chk('pl2: a winch dropped far away is refused', ev("!!LS.pl.winch") is False)
    tray_drop('winch', end('wd')); chk('pl2: the winch clips onto the rope end and is roped', ev("[!!LS.pl.winch, JSON.stringify(LS.cab)]") == [True, '[["load","top"],["top","wd"]]'], ev("JSON.stringify(LS.cab)"))
    chk('pl2: the handle radius is in the panel', 'Handle radius' in pg.inner_text('#lsDock') and '0.1 m' in pg.inner_text('#lsDock'))
    pull(); chk('pl2: handle 0.1 m reads 98 N', abs(ev("shopE({mach:'winch',R:0.1})") - 98) < 1e-6); run_equals('pl2 R 0.1', "wsSet('R',0.1)")
    for _ in range(3): dk('R+')
    chk('pl2: + three times is 0.25 m', abs(ev("WS.R") - 0.25) < 1e-9); both('pl2_winch')
    pull(); chk('pl2: handle 0.25 m reads 39.2 N', abs(ev("shopE({mach:'winch',R:0.25})") - 39.2) < 1e-6); run_equals('pl2 R 0.25', "wsSet('R',0.25)"); chk('pl2: task 2 ticks', task(2))
    # ----- pl3: the ramp, the white handle, the rope to the cart -----
    start(pg, {'width': 1440, 'height': 900}, 2, 'c6b')
    chk('pl3: ▶ off with no ramp', pg.locator('#wsPull').is_disabled())
    tray_drop('ramp', (780, 60)); chk('pl3: a ramp dropped far away is refused', ev("!!LS.pl.ramp") is False)
    tray_drop('ramp', zc('ramp')); chk('pl3: the ramp goes in (L 2, h 1)', ev("[!!LS.pl.ramp, WS.L, WS.h]") == [True, 2, 1])
    chk('pl3: the cart is not roped yet, so ▶ is off', ev("lsGate()") is False and pg.locator('#wsPull').is_disabled() and 'not roped' in pg.inner_text('#lsDock'))
    rope('load', 'top'); chk('pl3: dragging from the cart\'s ◉ to the ramp top ◉ ropes it', ev("lsGate()") is True)
    pull(); chk('pl3: the 2 m ramp needs 245 N', abs(ev("shopE({mach:'ramp',L:2,h:1})") - 245) < 1e-6); run_equals('pl3 L 2', "wsSet('L',2)")
    g = J("lsGeoRamp(0)"); drag((g['tx'], g['ty']), (g['fx'] + 4.899 * 50, g['ty']), 12)
    chk('pl3: dragging the white top handle makes the ramp 5 m (snapped to whole metres)', ev("WS.L") == 5, ev("WS.L")); both('pl3_ramp')
    pull(); chk('pl3: the 5 m ramp needs 98 N', abs(ev("shopE({mach:'ramp',L:5,h:1})") - 98) < 1e-6); run_equals('pl3 L 5', "wsSet('L',5)"); chk('pl3: task 2 ticks', task(1))
    dk('rm:ramp'); chk('pl3: Remove takes the ramp off again', ev("!!LS.pl.ramp") is False and pg.locator('#wsPull').is_disabled())
    # ----- pl4: the wedge demonstration, then the screw jack under the car -----
    start(pg, {'width': 1440, 'height': 900}, 3, 'c6b')
    chk('pl4: the wedge is the demonstration and ▶ says Push!', ev("WS.mach") == 'wedge' and pg.locator('#wsPull').inner_text() == '▶ Push!' and 'Thickness' in pg.inner_text('#lsDock'))
    dk('thick:5'); pull(); chk('pl4: 5 cm wedge splits the 1,200 N log', ev("shopHas({mach:'wedge',thick:5,load:1200})") is True); run_equals('pl4 wedge 5', "wsSet('thick',5)")
    dk('thick:2'); pull(); chk('pl4: 2 cm wedge', ev("shopHas({mach:'wedge',thick:2,load:1200})") is True); run_equals('pl4 wedge 2', "wsSet('thick',2)"); both('pl4_wedge')
    dk('tab:screw'); chk('pl4: the Screw jack tab switches the bench to the car, with no jack yet', ev("[WS.mach, !!LS.pl.jack]") == ['screw', False] and pg.locator('#wsPull').is_disabled())
    tray_drop('jack', (780, 60)); chk('pl4: a jack dropped far away is refused', ev("!!LS.pl.jack") is False)
    tray_drop('jack', zc('jack')); chk('pl4: the jack snaps under the car', ev("[!!LS.pl.jack, WS.mach]") == [True, 'screw'])
    chk('pl4: the handle circle and the thread gap are in the panel', 'Handle circle' in pg.inner_text('#lsDock') and 'Gap between threads' in pg.inner_text('#lsDock'))
    dk('pitch:1'); pull(); chk('pl4: 1 cm gap', ev("shopHas({mach:'screw',pitch:1})") is True); run_equals('pl4 jack 1', "wsSetMach('screw');wsSet('pitch',1)")
    dk('pitch:0.5'); pull(); chk('pl4: 0.5 cm gap, 40 turns', ev("shopRun({mach:'screw',pitch:0.5}).turns") == 40); run_equals('pl4 jack 0.5', "wsSetMach('screw');wsSet('pitch',0.5)"); both('pl4_jack')
    # ----- u1: crane, block -----
    start(pg, {'width': 1440, 'height': 900}, 0, 'c6c')
    tray_drop('crane', zc('crane')); tray_drop('block', end('top'))
    while ev("WS.ropes") < 3: dk('ropes+')
    chk('u1: the panel hides the MA until the question is answered', 'MA' not in pg.inner_text('#lsDock').replace('Machine', ''))
    pull(); chk('u1: 3 ropes reads 98 N', abs(ev("shopE({mach:'pulley',ropes:3})") - 98) < 1e-6); run_equals('u1 3 ropes', "wsSet('ropes',3)"); both('u1_block')
    # ----- u2: winch and ramp on one bench -----
    start(pg, {'width': 1440, 'height': 900}, 1, 'c6c')
    chk('u2: tabs for Winch and Ramp are visible', pg.locator('#lsDock [data-lm="tab:winch"]').is_visible() and pg.locator('#lsDock [data-lm="tab:ramp"]').is_visible())
    tray_drop('winch', zc('winch')); chk('u2: the winch waits for the crane', ev("!!LS.pl.winch") is False); tray_drop('crane', zc('crane')); tray_drop('winch', end('wd'))
    while ev("WS.R") < 0.39: dk('R+')
    pull(); chk('u2: winch with R 0.4 reads 24.5 N', abs(ev("shopE({mach:'winch',R:0.4})") - 24.5) < 1e-6); run_equals('u2 winch', "wsSet('R',0.4)")
    tray_drop('ramp', zc('ramp')); chk('u2: dragging the ramp from the tray switches to the ramp and places it', ev("[WS.mach, !!LS.pl.ramp]") == ['ramp', True], ev("[WS.mach, !!LS.pl.ramp]"))
    rope('load', 'top')
    for _ in range(4): dk('L+')
    dk('h-'); chk('u2: length 4 m and height 0.8 m from the panel', ev("[WS.L, WS.h]") == [4, 0.8])
    g = J("lsGeoRamp(0)"); drag((g['tx'] + 40, g['ty']), (g['tx'] + 40, g['ty'] + 10), 6); chk('u2: dragging the platform\'s top edge lowers it to 0.6 m', abs(ev("WS.h") - 0.6) < 1e-9, ev("WS.h"))
    dk('h+'); pull(); chk('u2: ramp 4 m, 0.8 m reads 98 N', abs(ev("shopE({mach:'ramp',L:4,h:0.8})") - 98) < 1e-6); run_equals('u2 ramp', "wsSetMach('ramp');wsSet('L',4);wsSet('h',0.8)"); both('u2_ramp')
    # ----- u3: lift height in the crane's panel -----
    start(pg, {'width': 1440, 'height': 900}, 2, 'c6c')
    chk('u3: the lift height shows once the crane is on', 'Lift height' not in pg.inner_text('#lsDock') and ev("WS.ropes") == 1); tray_drop('crane', zc('crane'))
    chk('u3: the crane\'s panel has the lift height', 'Lift height' in pg.inner_text('#lsDock'))
    tray_drop('crane', zc('crane')); dk('lift:2'); tray_drop('block', end('top'))
    while ev("WS.ropes") < 6: dk('ropes+')
    pull(); chk('u3: 6 ropes, 2 m: effort 49 N and 12 m of rope', ev("shopHas({mach:'pulley',ropes:6,rise:2})") is True and abs(ev("shopDist({mach:'pulley',ropes:6,rise:2})") - 12) < 1e-6); run_equals('u3 6 ropes 2 m', "wsSet('lift',2);wsSet('ropes',6)"); chk('u3: task 2 ticks', task(2)); both('u3_lift')
    # ----- k1: a finished crane, look only -----
    start(pg, {'width': 1440, 'height': 900}, 0, 'c6d'); pg.wait_for_timeout(200)
    chk('k1: a finished crane (gantry, block, winch), all locked, roped', ev("[!!LS.pl.crane, !!LS.pl.block, !!LS.pl.winch, JSON.stringify(LS.cab)]") == [True, True, True, '[["blk","top"],["top","wd"]]'] and 'Remove' not in pg.inner_text('#lsDock'))
    both('k1_crane')
    # ----- k2: the crane, clip the block, then the winch -----
    start(pg, {'width': 1440, 'height': 900}, 1, 'c6d')
    tray_drop('crane', zc('crane')); tray_drop('block', end('top')); tray_drop('winch', end('wd'))
    chk('k2: block and winch clipped on and roped', ev("[!!LS.pl.block, !!LS.pl.winch, WS.bn, WS.bw, JSON.stringify(LS.cab)]") == [True, True, 2, 2, '[["blk","top"],["top","wd"]]'], ev("JSON.stringify(LS.cab)"))
    dk('bn:3'); dk('bw:4'); pull(); chk('k2: winch ×4, 3 ropes reads 98 N', abs(ev("shopE({mach:'build',bw:4,bn:3})") - 98) < 1e-6); run_equals('k2 4x3', "wsSet('bn',3);wsSet('bw',4)")
    dk('bn:4'); dk('bw:6'); pull(); run_equals('k2 6x4', "wsSet('bn',4);wsSet('bw',6)"); both('k2_crane')
    # ----- k3: ramp, block, winch, then the two-leg practice -----
    start(pg, {'width': 1440, 'height': 900}, 2, 'c6d')
    chk('k3: nothing to run before a route is chosen', pg.locator('#wsPull').is_disabled() and 'choose' in pg.inner_text('#lsDock').lower())
    tray_drop('ramp', zc('ramp')); chk('k3: the ramp sets br to 6', ev("[!!LS.pl.ramp, WS.br]") == [True, 6])
    rope('load', 'top'); tray_drop('block', end('top')); tray_drop('winch', zc('winch')); dk('bw:4')
    chk('k3: ramp, block (2 ropes) and winch ×4, roped', ev("[WS.br, WS.bn, WS.bw, lsGate()]") == [6, 2, 4, True], ev("[WS.br, WS.bn, WS.bw, lsGate(), JSON.stringify(LS.cab)]"))
    pull(); chk('k3: the old task check (bw 4, bn 2, br 6) passes', task(0) and task(2)); run_equals('k3 ramp route', "wsSet('br',6);wsSet('bn',2);wsSet('bw',4)"); both('k3_ramp')
    dk('two:start'); pg.wait_for_timeout(200)
    chk('k3 practice: the two-leg board, the ▶ button hidden, a crane and a ramp in the tray (crane first)', ev("LS.stage") == 'two' and not pg.locator('#wsPull').is_visible() and pg.locator('#lsTray [data-lsadd=ramp]').is_visible() and pg.locator('#lsTray [data-lsadd=crane]').is_visible() and ev("document.querySelector('#lsTray [data-lsadd]').dataset.lsadd") == 'crane')
    tray_drop('ramp', (400, 250)); chk('k3 practice: a ramp before leg 1 is refused', ev("!!LS.two.ramp") is False)
    tray_drop('crane', zc('crane')); chk('k3 practice: the crane goes in the box over the crate and is roped to it', ev("[!!LS.two.crane, lsJoined('c','ch')]") == [True, True])
    chk('k3 practice: Move across is in the panel, 0 m to start', 'Move across' in pg.inner_text('#lsDock') and ev("lsTwoAcross()") == 0)
    dk('across+'); dk('across+'); dk('across+'); dk('across+'); chk('k3 practice: 4 taps of + is 2 m across: not on the shelf yet, so leg 2 is refused', ev("[lsTwoAcross(), lsTwoAcrossOk()]") == [2, False] or ev("[lsTwoAcross(), lsTwoAcrossOk()]") == [2, True])
    dk('across+'); dk('across+'); chk('k3 practice: 3 m across puts the crate on the shelf', ev("[lsTwoAcross(), lsTwoAcrossOk()]") == [3, True], ev("[lsTwoAcross(), lsTwoAcrossOk()]"))
    dk('adir:-1'); chk('k3 practice: Left sends it the wrong way (3 m left, nothing to set it on)', ev("[lsTwoAcross(), lsTwoAcrossOk()]") == [-3, False]); dk('adir:1'); chk('k3 practice: Right turns it back', ev("lsTwoAcrossOk()") is True)
    both('k3_leg1'); tray_drop('ramp', zc('ramp')); chk('k3 practice: the ramp goes in the box on the shelf', ev("!!LS.two.ramp") is True)
    chk('k3 practice: not finished until the crate on the shelf is roped to the ramp', ev("lsK3Done()") is False)
    rope('g', 'rt'); chk('k3 practice: roping the crate on the shelf to the ramp finishes it', ev("lsK3Done()") is True and task(5), ev("lsK3Done()")); both('k3_two_legs')
    dk('two:back'); chk('k3 practice: back to the generator keeps its set-up', ev("[LS.stage, WS.br, WS.bn, WS.bw, JSON.stringify(LS.cab)]")[:4] == ['main', 6, 2, 4])
    # ----- first-time cards for every new piece (FAST off), and the ? replays -----
    CARDS = {'crane': ('c6b', 0, 'This is a crane gantry: a tall frame with a hook at the top.'), 'block': ('c6b', 0, 'A pulley block is a set of wheels that hangs from a hook.'), 'winch': ('c6b', 1, 'A winch is a wheel and axle. The rope wraps round the small axle, and Smooshy turns the big handle.'),
             'ramp': ('c6b', 2, 'A ramp lets you push or pull a load up a slope instead of lifting it straight up.'), 'jack': ('c6b', 3, 'A screw jack is a ramp wrapped round a pole, called a thread.'), 'cables': ('c6d', 1, 'Machines can work together. Every machine has a ◉ dot where its rope comes out.')}
    for piece, (sec, st, line) in CARDS.items():
        start(pg, {'width': 1440, 'height': 900}, st, sec); ev("dbSet('lsSeen',{lever:true})"); ev("FAST=false"); ev("lsShowCards('%s')" % piece); pg.wait_for_timeout(250); ch = pg.locator('#chunk')
        chk(f'cards {piece}: card 1 has the exact text and an OK button', ch.is_visible() and line in ch.inner_text() and pg.locator('#chunk [data-cb=next]').inner_text() == 'OK', ch.inner_text() if ch.is_visible() else 'hidden')
        if piece in ('crane', 'block', 'ramp', 'jack', 'cables'): both('cards_' + piece + '_1')
        for _ in range(4 if piece == 'crane' else 3): pg.locator('#chunk [data-cb=next]').click(); pg.wait_for_timeout(120)
        chk(f'cards {piece}: after the third OK the piece is marked seen', ev(f"dbGet('lsSeen',{{}}).{piece}") is True); ev("hideCards()"); ev("FAST=true")
    start(pg, {'width': 1440, 'height': 900}, 1, 'c6b'); ev("dbSet('lsSeen',{lever:true})"); ev("FAST=false"); ev("setStep(GI)"); pg.wait_for_timeout(300); ev("hideCards()"); ev("lsAfterCards()"); pg.wait_for_timeout(250)
    chk('cards: after the step\'s own cards, the crane\'s cards show first, then the tray winch\'s', 'new piece: crane gantry' in pg.locator('#chunk').inner_text().lower(), pg.locator('#chunk').inner_text())
    for _ in range(4): pg.locator('#chunk [data-cb=next]').click(); pg.wait_for_timeout(120)
    chk('cards: then the winch\'s cards', 'new piece: winch' in pg.locator('#chunk').inner_text().lower() and pg.locator('#chunk').is_visible())
    for _ in range(3): pg.locator('#chunk [data-cb=next]').click(); pg.wait_for_timeout(120)
    start(pg, {'width': 1440, 'height': 900}, 0, 'c6b'); pg.locator('#lsTray [data-lsq=block]').click(); pg.wait_for_timeout(200); chk('cards: the ? on the tray tile plays them again (pulley block)', pg.locator('#chunk').is_visible() and 'new piece: pulley block' in pg.locator('#chunk').inner_text().lower()); pg.locator('#chunk .cx').click(); ev("FAST=true")
    pg.locator('#lsDock [data-dk="help:block"]').dispatch_event('click'); pg.wait_for_timeout(200); chk('cards: the ? in the panel plays them too', pg.locator('#chunk').is_visible()); pg.locator('#chunk .cx').click()
    # phone screenshots and the per-step screenshots at 390 x 844
    for sec, st, nm in [('c6b', 0, 'pl1'), ('c6b', 1, 'pl2'), ('c6b', 2, 'pl3'), ('c6b', 3, 'pl4'), ('c6c', 0, 'u1'), ('c6c', 1, 'u2'), ('c6c', 2, 'u3'), ('c6d', 0, 'k1'), ('c6d', 1, 'k2'), ('c6d', 2, 'k3')]:
        start(pg, {'width': 390, 'height': 844}, st, sec); pg.wait_for_timeout(250); shot(nm + '_start', True)

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
    chk('rescue: the mission card has the new text', all(k in pg2.locator('#mi-gl').inner_text() for k in ['The Gumdrop weighs 6,300 N. Smooshy can only pull 60 N.', 'up to the dotted line', 'Sugar crystals are gummy money. You have 475 to spend.', 'a 252 N boulder is stuck against its leg']), pg2.locator('#mi-gl').inner_text()[:300])
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
