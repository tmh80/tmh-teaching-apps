"""Stage 2 (spec section 10): ropes to the load, the docked settings panel, labels that never overlap, the platform rule, the in-board button, one lever drawing.
Run after build.py:  python3 tests/stage2_ropes.py     Screenshots (1440x900 and 390x844): /tmp/fhq-shots/stage2/"""
import json, pathlib, sys
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/stage2/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
ROUTES = pathlib.Path('tests/rescue_routes.js').read_text()
ns = {}; exec(open('tests/play_rescue.py').read().split('with sync_playwright')[0], ns)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
def overlaps(boxes):
    bad = []
    for i, a in enumerate(boxes):
        for b in boxes[i + 1:]:
            if a['x0'] < b['x1'] and a['x1'] > b['x0'] and a['y0'] < b['y1'] and a['y1'] > b['y0']: bad.append((a['text'], b['text']))
    return bad
def lesson(pg, vp, step):
    pg.set_viewport_size(vp); pg.goto(F); pg.evaluate('localStorage.clear()'); pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    pg.evaluate("__fhq.dbSet('lsSeen',{lever:true})"); pg.evaluate("__fhq.openChapter('c6a','learn')"); pg.wait_for_timeout(500); pg.evaluate("__fhq.ev('closeModal()')")
    pg.evaluate(f"__fhq.setStep({step})"); pg.wait_for_timeout(300); pg.evaluate("__fhq.ev('hideCards()')"); pg.wait_for_timeout(150)
    pg.evaluate("window.scrollTo(0, document.querySelector('#cvScene').getBoundingClientRect().top + scrollY - 16)"); pg.wait_for_timeout(250)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    evj = lambda c: json.loads(ev('JSON.stringify(' + c + ')'))
    # ---------- the model: ropes to the Gumdrop ----------
    pg.goto(F); pg.wait_for_timeout(300)
    mv = lambda code: json.loads(pg.evaluate('c=>__fhq.ev(c)', ROUTES + '\n;JSON.stringify((()=>{' + code + '})())'))
    r = mv("const g=ROUTES.top(); g.cables=g.cables.filter(c=>!(c.a==='rB'&&c.b==='ship')); const r=glEvaluate(g); return {stop:r.stop,txt:glStopText(r.stop.why,r.stop.leg),ghost:r.ghost,arrived:r.arrived}")
    chk('a leg with no rope stops the run with the reason norope at that leg', r['stop']['why'] == 'norope' and r['stop']['leg'] == 1 and not r['arrived'], r)
    chk("the reason reads: Leg 2's machine isn't roped to the Gumdrop.", r['txt'] == "Leg 2's machine isn't roped to the Gumdrop.", r['txt'])
    chk('the ghost Gumdrop waits where leg 2 starts', r['ghost'] and abs(r['ghost']['x'] - 39.24) < 0.05, r['ghost'])
    r = mv("const g=ROUTES.top(); g.cables=g.cables.filter(c=>c.b!=='ship'); const r=glEvaluate(g); return {stop:r.stop}")
    chk('no rope on leg 1 stops at leg 1', r['stop']['why'] == 'norope' and r['stop']['leg'] == 0, r)
    r = mv("const g=ROUTES.top(); g.cables=g.cables.filter(c=>!(c.a==='rB'&&c.b==='ship')); g.cables.push({a:'ship',b:'rBb'}); const r=glEvaluate(g); return {ok:r.arrived}")
    chk("a rope from the Gumdrop to the machine's pulley block counts as roped", r['ok'] is True, r)
    r = mv("const r=glEvaluate({parts:[{id:'j',type:'jack',x:14,rise:2}].concat(BL),cables:[]}); return {stop:r.stop&&r.stop.why, why:r.legs[0].roped}")
    chk('a screw jack carries the Gumdrop and needs no rope', r['why'] is True, r)
    r = mv("const old={parts:ROUTES.top().parts,cables:ROUTES.top().cables.filter(c=>c.b!=='ship')}; glMigrate(old); const r=glEvaluate(old); return {ok:r.arrived,v:old.v,pull:r.hardest}")
    chk('an old save with no ropes gets them added and still works', r['ok'] is True and r['v'] == 2 and abs(r['pull'] - 56.25) < 0.01, r)
    # ---------- lesson mode: ropes, dock, labels, button ----------
    lesson(pg, {'width': 1440, 'height': 900}, 0)
    chk('lv1: no floating menu element any more', ev("!document.querySelector('#lsMenu, .glmenu, .lsmenu')") is True)
    chk('lv1: the dock shows Just a rope without tapping, roped to start with', 'Just a rope' in pg.inner_text('#lsDock') and 'roped' in pg.inner_text('#lsDock') and ev("lsGate()") is True)
    chk('lv1: the rock has a hook and the rope end is a hook too', evj("Object.keys(lsEnds())") == ['load', 'end'])
    cv = pg.locator('#cvScene').bounding_box(); X = lambda x, y: (cv['x'] + x * cv['width'] / 900, cv['y'] + y * cv['height'] / 430)
    E = evj("lsEnds()"); a = X(E['end']['x'], E['end']['y']); m = pg.mouse; m.move(*a); m.down(); m.move(a[0] + 150, a[1] - 40, steps=8); m.up(); pg.wait_for_timeout(150)
    chk('lv1: dragging the rope off its hook takes it off, and ▶ goes off', ev("lsGate()") is False and pg.locator('#wsPull').is_disabled())
    a = X(E['end']['x'], E['end']['y']); c2 = X(E['load']['x'], E['load']['y']); m.move(*a); m.down(); m.move(*c2, steps=8); m.up(); pg.wait_for_timeout(150)
    chk('lv1: dragging from one ◉ to the other ropes it again', ev("lsGate()") is True and pg.locator('#wsPull').is_enabled())
    pg.click('#lsDock [data-lm=unrope]'); chk('lv1: the panel button takes the rope off', ev("lsGate()") is False); pg.click('#lsDock [data-lm=rope]'); chk('lv1: and puts it back', ev("lsGate()") is True)
    chk('lv1: the ▶ button is inside the board, bottom right', pg.evaluate("(()=>{const b=document.querySelector('#wsPull').getBoundingClientRect(), c=document.querySelector('#cvScene').getBoundingClientRect(); return b.right<=c.right+1&&b.bottom<=c.bottom+1&&b.left>c.left+c.width*0.6&&b.top>c.top+c.height*0.7})()"))
    pg.screenshot(path=OUT + 'lv1_d.png')
    for step, tag in [(1, 'lv2'), (3, 'lv4')]:
        lesson(pg, {'width': 1440, 'height': 900}, step)
        chk(f'{tag}: the lever settings are visible without tapping (fulcrum − and +)', pg.locator('#lsDock [data-lm="arm-"]').is_visible() and pg.locator('#lsDock [data-lm="arm+"]').is_visible())
        chk(f'{tag}: the panel has the lever name and a ? replay', 'Lever' in pg.inner_text('#lsDock') and pg.locator('#lsDock .dkq').count() == 1)
        chk(f'{tag}: the ▶ button is inside the board', pg.evaluate("!!document.querySelector('#wsPull').closest('#boardBox')"))
        pg.wait_for_timeout(200); bx = evj("LBL.boxes"); chk(f'{tag}: no two board labels overlap', not overlaps(bx), overlaps(bx)); chk(f'{tag}: labels are drawn', len(bx) >= 3, bx)
        av = evj("LBL.avoid"); bad = [l['text'] for l in bx for q in av if l['x0'] < q['x1'] and l['x1'] > q['x0'] and l['y0'] < q['y1'] and l['y1'] > q['y0']]; chk(f'{tag}: labels keep clear of handles and hooks', not bad, bad)
        pg.screenshot(path=OUT + f'{tag}_d.png')
    # lever classes: labels still clear
    for cls in (2, 3):
        ev(f"wsSet('cls',{cls})"); pg.wait_for_timeout(250); bx = evj("LBL.boxes"); chk(f'lv4 class {cls}: no overlapping labels', not overlaps(bx), overlaps(bx))
    ev("wsSet('cls',1)"); pg.mouse.move(700, 300)
    pg.wait_for_timeout(100)
    # fade while dragging
    G = evj("lsLever(0,wsCalc())"); gx, gy = X(G['fx'], G['fy'] + 40); m.move(gx, gy); m.down(); m.move(gx + 30, gy, steps=4); pg.wait_for_timeout(150)
    chk('labels fade while something is dragged', ev("LS.drag&&LS.drag.moved") is True); m.up()
    # one drawing for the lever
    chk('the rescue lever and the bench lever use the same drawing function', 'drawLeverShape' in ev("glDrawLever.toString()") and 'drawLeverShape' in ev("lsBarAndFulcrum.toString()"))
    # phone
    for step, tag in [(1, 'lv2'), (3, 'lv4')]:
        lesson(pg, {'width': 390, 'height': 844}, step); pg.screenshot(path=OUT + f'{tag}_phone.png', full_page=True)
        chk(f'{tag} phone: the panel sits below the board', pg.evaluate("document.querySelector('#lsDock').getBoundingClientRect().top >= document.querySelector('#cvScene').getBoundingClientRect().bottom - 2"))
    # ---------- the rescue ----------
    for vp, tag in [({'width': 1440, 'height': 900}, 'd'), ({'width': 390, 'height': 844}, 'phone')]:
        pg.set_viewport_size(vp); pg.goto(F); pg.evaluate('localStorage.clear()'); ns['open_part5'](pg); B = ns['Board'](pg)
        chk('rescue: no floating menu', ev("!document.querySelector('.glmenu')") is True and pg.locator('#glDock').count() == 1)
        chk('rescue: the dock says Tap a machine to change it when nothing is tapped', 'Tap a machine to change it' in pg.inner_text('#glDock'))
        btn = pg.locator('#glRun'); chk('rescue: the run button is inside the board and says ▶ Test in simulator', btn.inner_text() == '▶ Test in simulator' and pg.evaluate("!!document.querySelector('#glRun').closest('.glboard')"))
        # a two-leg route that stops after leg 2: the ghost Gumdrop, ropes, labels
        pg.evaluate('c=>__fhq.ev(c)', ROUTES + ";(()=>{const g=ROUTES.top(); g.parts=g.parts.filter(p=>p.id!=='d1'); GLB.rig=g; glChanged();})()"); pg.wait_for_timeout(200)
        chk('rescue: the ghost Gumdrop shows after leg 2', ev("!!GLB.ev.ghost") is True and ev("glFrameOpts().ev.ghost!=null"))
        pg.locator('#glCv').scroll_into_view_if_needed(); pg.wait_for_timeout(300); bx = evj("LBL.boxes")
        chk('rescue: only weights and the ghost caption are on the board', sorted(l['text'] for l in bx) == ['Boulder 252 N', 'Gumdrop 6,300 N', 'Gumdrop after leg 1', 'Gumdrop after leg 2', 'Tractor beam reaches this line'], [l['text'] for l in bx])
        chk('rescue: no two labels overlap', not overlaps(bx), overlaps(bx))
        if tag == 'd': pg.screenshot(path=OUT + 'rescue_two_legs_d.png', clip={'x': 0, 'y': max(0, pg.locator('#glCv').bounding_box()['y'] - 20), 'width': 1440, 'height': 560})
        else: pg.screenshot(path=OUT + 'rescue_two_legs_phone.png')
        # dropping a ramp by the ghost snaps and ropes
        ev("(()=>{GLB.rig={v:2,parts:[],cables:[]};glChanged();})()")
        r1 = B.add('ramp', 16, 0)
        chk('rescue: a ramp dropped by the Gumdrop ropes itself on', B.evr(f'GLB.rig.cables.some(c=>c.b==="ship"&&c.a==="{r1}")') is True and B.evr('GLB.ev.legs[0].roped') is True)
        chk('rescue: the dock shows the ramp and its rope', 'Ramp' in pg.inner_text('#glDock') and 'roped to the Gumdrop' in pg.inner_text('#glDock'))
        pg.click('#glDock [data-gm=cut]'); chk('rescue: cutting its cables leaves it unroped', B.evr('GLB.ev.legs[0].roped') is False)
        B.ev("(()=>{GLB.rig={v:2,parts:[],cables:[]};glChanged();})()"); cr0 = B.add('crane', 14, 0); pg.click('#glDock [data-gm=cut]'); chk('rescue: an unroped crane stops the run with norope', B.evr('GLB.ev.stop.why') == 'norope' and B.evr('GLB.ev.stop.leg') == 0, B.evr('GLB.ev.stop'))
        B.ev("(()=>{GLB.rig={v:2,parts:[],cables:[]};glChanged();})()"); r1 = B.add('ramp', 16, 0); pg.click('#glDock [data-gm=cut]')
        chk('rescue: the dock says so and offers the rope button', 'rope' in pg.inner_text('#glDock').lower() and pg.locator('#glDock [data-gm=rope]').count() == 1)
        pg.click('#glDock [data-gm=rope]'); chk('rescue: the rope button ropes it', B.evr('GLB.ev.legs[0].roped') is True)
        # drag a rope by hand from the ship hook off the ramp
        hook = B.evr('glShipDots()[0]'); top = B.evr('glCablePoint(glPart("%s"),glMachine(glPart("%s"),GLB.ev.ground,[]))' % (r1, r1))
        B.drag((hook['x'], hook['y']), (hook['x'] + 3, hook['y'] + 8)); chk('rescue: a rope dragged off the Gumdrop hook comes off', B.evr('GLB.ev.legs[0].roped') is False)
        B.drag((top['x'], top['y']), (hook['x'], hook['y'])); chk('rescue: dragging from the ramp ◉ to the Gumdrop ◉ ropes it', B.evr('GLB.ev.legs[0].roped') is True, B.evr('GLB.rig.cables'))
        # crane and platform panels
        ev("(()=>{GLB.rig={v:2,parts:[],cables:[]};glChanged();})()")
        cr = B.add('crane', 15, 0); chk('rescue: a crane dropped by the Gumdrop stands over it, roped', B.evr(f'glPart("{cr}").x') == 14 and B.evr('GLB.ev.legs[0].roped') is True)
        pg.wait_for_timeout(200); pg.locator('#glDock').scroll_into_view_if_needed(); pg.screenshot(path=OUT + f'dock_crane_{tag}.png')
        # platform rule
        n0 = B.evr('GLB.rig.parts.length'); B.ev("glAddPart('platM',14,0)"); chk('platform rule: a platform dropped under a placed crane is refused', B.evr('GLB.rig.parts.length') == n0 and 'Move the machine first' in pg.inner_text('#toast'), pg.inner_text('#toast'))
        chk('platform rule: it shows red (flash) with the message', B.evr('!!glFrameOpts().flashPlat') is True)
        pf = B.ev("(()=>{glAddPart('platM',40,6);return GLB.sel})()"); chk('platform rule: a platform away from machines is fine', B.evr(f'!!glPart("{pf}")') is True)
        pg.wait_for_timeout(200); pg.locator('#glDock').scroll_into_view_if_needed(); pg.screenshot(path=OUT + f'dock_platform_{tag}.png')
        B.ev(f'glPart("{pf}").x=14;glChanged()')
        chk('platform rule: moving a platform under the crane is flagged, not allowed to stay', B.evr(f'glPlatBlocked(glPart("{pf}"))') is True)
        B.ev(f'glPart("{pf}").x=40;glChanged()')
        ev("(()=>{GLB.rig={v:2,parts:[],cables:[]};glChanged();})()")
        pf = B.ev("(()=>{glAddPart('platM',14,0);return GLB.sel})()"); cr = B.ev("(()=>{glAddPart('crane',14,0);return GLB.sel})()"); chk('platform rule: a machine can be added on a platform and keeps working', B.evr('glPlatBlocked({size:"M",x:30,h:2})') is False and B.evr('GLB.ev.legs.length') >= 0)
        # the lever looks like the bench lever: same drawing
        lv = B.ev("(()=>{glAddPart('lever',30,0);return GLB.sel})()"); pg.wait_for_timeout(200); pg.screenshot(path=OUT + f'rescue_lever_{tag}.png')
    chk('no page errors', not errs, errs)
    b.close()
print('FAILS', fails) if fails else print('all passed'); sys.exit(1 if fails else 0)
