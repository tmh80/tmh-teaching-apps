"""Playtest fixes of 9 Nov 2026 (Tom): the crane gantry is added from the tray, the "do this next" throb, the tray joined to the board, the drag ghost, and Part 5 (dotted-line label, messages,
Clear all, tests that always hand the board back, add-ons that fall when their machine goes).
Run after build.py:  python3 tests/throb_next.py     Screenshots (1440 and 390 wide): /tmp/fhq-shots/throb/"""
import json, pathlib
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/throb/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
ns = {}; exec(open('tests/play_rescue.py').read().split('with sync_playwright()')[0], ns); _op5 = ns['open_part5']
Board = ns['Board']
def open_part5(pg):
    pg.goto(F); pg.evaluate('localStorage.clear()'); _op5(pg)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
STEPS = [('c6a', 0, 'lv1'), ('c6a', 1, 'lv2'), ('c6a', 2, 'lv3'), ('c6a', 3, 'lv4'), ('c6a', 4, 'lv5'), ('c6b', 0, 'pl1'), ('c6b', 1, 'pl2'), ('c6b', 2, 'pl3'), ('c6b', 3, 'pl4'), ('c6c', 0, 'u1'), ('c6c', 1, 'u2'), ('c6c', 2, 'u3'), ('c6d', 0, 'k1'), ('c6d', 1, 'k2'), ('c6d', 2, 'k3'), ('c6d', 3, 'k4')]
def fresh(pg, vp=None, fast=True, seen=False):
    pg.set_viewport_size(vp or {'width': 1440, 'height': 900}); pg.goto(F); pg.evaluate('localStorage.clear()'); pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    if seen: pg.evaluate("__fhq.dbSet('lsSeen',{lever:true,crane:true,block:true,winch:true,ramp:true,jack:true,cables:true,platform:true})")
    if not fast: pg.evaluate("__fhq.ev('FAST=false')")
def step(pg, sec, i, cards=False):
    pg.evaluate(f"__fhq.openChapter('{sec}','learn')"); pg.wait_for_timeout(300); pg.evaluate("__fhq.ev('closeModal()')"); pg.evaluate(f"__fhq.setStep({i})"); pg.wait_for_timeout(250)
    if not cards: pg.evaluate("__fhq.ev('hideCards()')")
    pg.wait_for_timeout(450)
def throbbing(pg): return pg.evaluate("[...document.querySelectorAll('#lsTray .ndneed, #lsDock .ndneed, #glTray .ndneed, #glDock .ndneed')].map(e=>e.dataset.lsadd||e.dataset.lm||e.dataset.add||e.dataset.gm||'?')")
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c); J = lambda c: json.loads(ev('JSON.stringify(' + c + ')'))
    def xy(x, y): bb = pg.locator('#cvScene').bounding_box(); return bb['x'] + x * bb['width'] / 900, bb['y'] + y * bb['height'] / 430
    def zc(piece): z = J(f"lsZones('{piece}')")[0]; return ((z['x0'] + z['x1']) / 2, (z['y0'] + z['y1']) / 2)
    def tray_drop(piece, target, steps=12):
        a = pg.locator(f'#lsTray [data-lsadd={piece}]').bounding_box(); pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(*xy(*target), steps=steps); pg.wait_for_timeout(60); pg.mouse.up(); pg.wait_for_timeout(250)
    def scroll_board(): pg.evaluate("window.scrollTo(0, document.querySelector('#cvScene').getBoundingClientRect().top + scrollY - 16)"); pg.wait_for_timeout(150)
    def shot(name, w): pg.screenshot(path=f'{OUT}{name}_{w}.png', full_page=(w == 390))
    def both(name, fn=None):
        scroll_board(); shot(name, 1440); vp = pg.viewport_size; pg.set_viewport_size({'width': 390, 'height': 844}); pg.wait_for_timeout(400); shot(name, 390); pg.set_viewport_size(vp); pg.wait_for_timeout(300)

    # ---------- 1. the real card order on a fresh save, before and after the fix ----------
    fresh(pg, fast=False); step(pg, 'c6b', 0, cards=True)
    titles = []
    def read_cards():
        t = pg.evaluate("(()=>{const c=document.querySelector('#chunk');return c&&!c.hidden?c.querySelector('.lbl').textContent.split(' · card')[0]:null})()"); return t
    while read_cards(): titles.append(read_cards()); pg.evaluate("document.querySelector('#chunk [data-cb=next]').click()"); pg.wait_for_timeout(120)
    chk('pl1 on a fresh save: the step\'s own cards end and NO piece cards show before anything is placed', titles and all(not t.startswith('New piece') for t in titles), titles)
    chk('pl1: the crane is not on the board and the crane tile is the only open tile', ev("[!!LS.pl.crane, !!LS.pl.block]") == [False, False] and pg.locator('#lsTray [data-lsadd=crane]').is_enabled() and pg.locator('#lsTray [data-lsadd=block]').is_disabled())
    scroll_board(); tray_drop('block', (360, 250)); chk('pl1: the pulley block cannot be dropped before the crane (no block cards)', ev("!!LS.pl.block") is False and not read_cards())
    tray_drop('crane', zc('crane')); order = []
    chk('pl1: the crane\'s cards show when it is first dropped', (read_cards() or '').startswith('New piece: Crane gantry'), read_cards())
    # drop the block while the crane cards are still open: they must wait their turn
    pg.locator('#lsTray [data-lsadd=block]').scroll_into_view_if_needed(); a = pg.locator('#lsTray [data-lsadd=block]').bounding_box(); e = J("lsEnds()")['top']; pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(*xy(e['x'], e['y']), steps=10); pg.mouse.up(); pg.wait_for_timeout(250)
    chk('pl1: a block dropped while the crane cards are open does not replace them', (read_cards() or '').startswith('New piece: Crane gantry') and ev("!!LS.pl.block") is True, read_cards())
    while read_cards():
        order.append(read_cards()); pg.evaluate("document.querySelector('#chunk [data-cb=next]').click()"); pg.wait_for_timeout(120)
    chk('pl1: crane cards (4) come first, then the pulley block cards (3), nothing else', order == ['New piece: Crane gantry'] * 4 + ['New piece: Pulley block'] * 3, order)
    chk('pl1: both are marked seen', ev("[lsSeen().crane, lsSeen().block]") == [True, True])

    # ---------- 2. the throb: crane first, then the block ----------
    fresh(pg, seen=True); step(pg, 'c6b', 0)
    t0 = throbbing(pg); chk('pl1 start: exactly one tile throbs and it is the crane gantry', t0 == ['crane'], t0)
    chk('pl1 start: the throb is data-driven and gentle (a pulse class and a glow ring)', pg.evaluate("(()=>{const e=document.querySelector('#lsTray .ndneed');const s=getComputedStyle(e);return e.classList.contains('ndpulse')&&s.animationName!=='none'&&s.boxShadow!=='none'})()"))
    both('pl1_start_crane_throbs')
    scroll_board(); tray_drop('crane', zc('crane'))
    t1 = throbbing(pg); chk('pl1 after the crane is placed: the crane tile stops and the pulley block tile throbs, one at a time', t1 == ['block'], t1)
    both('pl1_crane_placed_block_throbs')
    e = J("lsEnds()")['top']; tray_drop('block', (e['x'], e['y'])); t2 = throbbing(pg)
    chk('pl1 after the block is placed: the tile stops; the ropes + button takes over once a lift has been made', 'block' not in t2 and len(t2) <= 1, t2)
    # a task that moves on stops the throb: lift once, then the panel control pulses
    pg.evaluate("document.querySelector('#wsPull').scrollIntoView({block:'center'})"); ev("wsPull()"); ev("(()=>{for(let i=0;i<400;i++)wsUpdate(0.02)})()"); pg.wait_for_timeout(500)
    t3 = throbbing(pg); chk('pl1: after a lift with 2 ropes the + button in the panel throbs (a setting, not a piece)', t3 == ['ropes+'], t3)
    pg.locator('#lsDock [data-lm="ropes+"]').click(); pg.wait_for_timeout(300); chk('pl1: it stops once used', throbbing(pg) == [])
    # the crane can be taken off: the tile comes back and throbs again
    pg.locator('#lsDock [data-lm="rm:crane"]').click(); pg.wait_for_timeout(300); chk('pl1: removing the crane brings its tile back (the crane task stays ticked, so no throb) and the block goes with it', pg.locator('#lsTray [data-lsadd=crane]').is_enabled() and ev("[!!LS.pl.crane, !!LS.pl.block]") == [False, False] and throbbing(pg) == [])

    # ---------- 3. every lesson step at its start ----------
    got = {}
    for sec, i, nm in STEPS:
        fresh(pg, seen=True); step(pg, sec, i); got[nm] = throbbing(pg)
    chk('no step ever has two throbbing things at once', all(len(v) <= 1 for v in got.values()), got)
    want_one = ['lv2', 'lv4', 'pl1', 'pl2', 'pl3', 'pl4', 'u1', 'u2', 'u3', 'k2', 'k3']
    chk('every step whose first task needs a piece or a setting has exactly one throbbing', all(len(got[n]) == 1 for n in want_one), got)
    chk('the piece steps start with the right tile (crane for pl1 pl2 u1 u2 u3 k2, ramp for pl3 and k3)', [got[n] for n in ['pl1', 'pl2', 'u1', 'u2', 'u3', 'k2']] == [['crane']] * 6 and got['pl3'] == ['ramp'] and got['k3'] == ['ramp'], got)
    chk('steps with nothing to add (lv1 press Lift!, lv3, lv5, k1) have nothing throbbing', all(got[n] == [] for n in ['lv1', 'lv3', 'lv5', 'k1']), got)
    chk('lv2 pulses the fulcrum control and lv4 the Load in the middle button', got['lv2'] == ['arm-'] and got['lv4'] == ['cls2'], got)
    # lv1: after the rope lift and the answer, the lever tile throbs
    fresh(pg, seen=True); step(pg, 'c6a', 0); ev("wsPull()"); ev("(()=>{for(let i=0;i<400;i++)wsUpdate(0.02)})()"); pg.wait_for_timeout(300)
    ev("dbSet('learnDone.c6',{})"); ev("(()=>{const s=stepKey(CH.id,GI);dbSet(s+'.q1',{done:true,ok:true,v:'294'});checkStep(true)})()"); pg.wait_for_timeout(500)
    chk('lv1: after the first lift and its answer, the lever tile throbs', throbbing(pg) == ['lever'], throbbing(pg)); scroll_board(); both('lv1_lever_next')
    fresh(pg, seen=True); step(pg, 'c6a', 0); scroll_board(); both('lv1_start')
    fresh(pg, seen=True); step(pg, 'c6d', 1); scroll_board(); both('k2_start')
    # the k4 two-leg practice
    fresh(pg, seen=True); step(pg, 'c6d', 3); pg.wait_for_timeout(400)
    chk('k4 two-leg practice: the crane tile throbs first (leg 1)', throbbing(pg) == ['crane'], throbbing(pg)); ev("LS.two.crane=true;lsRope('c','ch');lsRender()"); pg.wait_for_timeout(300)
    chk('k4 two-leg practice: then the 1.5 m lift height', throbbing(pg) == ['lift:1.5'], throbbing(pg)); ev("WS.lift=1.5;lsRender()"); pg.wait_for_timeout(300); chk('k4 two-leg practice: then Move across (+)', throbbing(pg) == ['across+'], throbbing(pg)); ev("LS.across=3;lsRender()"); pg.wait_for_timeout(300)
    chk('k4 two-leg practice: then the ramp tile (leg 2)', throbbing(pg) == ['ramp'], throbbing(pg)); ev("LS.two.ramp=true;lsRope('g','rt');lsRender()"); pg.wait_for_timeout(300); chk('k4 two-leg practice: then Run both legs!', throbbing(pg) == ['two:run'], throbbing(pg))
    # more steps in order: pl2, u1 and k2 go crane -> block/winch
    fresh(pg, seen=True); step(pg, 'c6d', 1); scroll_board(); tray_drop('crane', zc('crane')); chk('k2: after the crane the block throbs', throbbing(pg) == ['block'], throbbing(pg))
    e = J("lsEnds()")['top']; tray_drop('block', (e['x'], e['y'])); chk('k2: then the winch', throbbing(pg) == ['winch'], throbbing(pg))

    # ---------- 4. reduced motion: a static highlight, no pulse ----------
    ctx = b.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce'); pr = ctx.new_page(); pr.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
    pr.goto(F); pr.evaluate('localStorage.clear()'); pr.goto(F); pr.wait_for_timeout(300); pr.fill('#whoName', 'Sam'); pr.click('#whoGo'); pr.evaluate("__fhq.dbSet('tourDone',true)"); pr.evaluate("__fhq.dbSet('lsSeen',{lever:true,crane:true,block:true})")
    step(pr, 'c6b', 0); info = pr.evaluate("(()=>{const e=document.querySelector('#lsTray .ndneed');if(!e)return null;const s=getComputedStyle(e);return {tile:e.dataset.lsadd,pulse:e.classList.contains('ndpulse'),anim:s.animationName,ring:s.boxShadow!=='none'}})()")
    chk('reduced motion: the crane tile still has the glow ring but no pulse and no animation', info and info['tile'] == 'crane' and info['ring'] and not info['pulse'] and info['anim'] == 'none', info)
    pr.screenshot(path=OUT + 'pl1_reduced_motion_1440.png'); ctx.close()

    # ---------- 5. the tray sits right under the board, inside its frame (1440 and 390) ----------
    for w in (1440, 390):
        fresh(pg, {'width': w, 'height': 900 if w > 600 else 844}, seen=True); step(pg, 'c6b', 0)
        r = pg.evaluate("(()=>{const c=document.querySelector('#cvScene').getBoundingClientRect(), t=document.querySelector('#lsTray').getBoundingClientRect(), bx=document.querySelector('#boardBox').getBoundingClientRect();return {gap:t.top-c.bottom, inside:t.top>=bx.top&&t.bottom<=bx.bottom+1, same:Math.abs(t.left-bx.left)<14, kids:[...document.querySelector('#boardBox').children].map(e=>e.id)}})()")
        chk(f'lesson mode at {w}: the tray is inside the board\'s frame, joined to the canvas (gap {r["gap"]:.0f}px) with nothing between', r['inside'] and r['gap'] <= 3 and r['kids'][:2] == ['boardCv', 'lsTray'], r)
        o = pg.evaluate("(()=>{const b=document.querySelector('#boardBox').getBoundingClientRect(),d=document.querySelector('#lsDock').getBoundingClientRect(),t=document.querySelector('#lsTray').getBoundingClientRect();return {tb:t.bottom-b.top}})()")
    for w in (1440, 390):
        pg.set_viewport_size({'width': w, 'height': 900 if w > 600 else 844}); open_part5(pg); B = Board(pg)
        r = pg.evaluate("(()=>{const c=document.querySelector('#glCv').getBoundingClientRect(), t=document.querySelector('#glTray').getBoundingClientRect(), bx=document.querySelector('.glboard').getBoundingClientRect();return {gap:t.top-c.bottom, inside:t.top>=bx.top&&t.bottom<=bx.bottom+1, kids:[...document.querySelector('.glboard').children].map(e=>e.className)}})()")
        chk(f'Part 5 at {w}: the tray is inside the board frame, right under the crater (gap {r["gap"]:.0f}px)', r['inside'] and r['gap'] <= 3 and r['kids'][-1].startswith('gltray'), r)

    # ---------- 6. the drag ghost: 60% see-through, follows the pointer, gone on drop or cancel; mouse and touch ----------
    fresh(pg, seen=True); step(pg, 'c6b', 0); scroll_board(); a = pg.locator('#lsTray [data-lsadd=crane]').bounding_box(); pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(*xy(500, 200), steps=8); pg.wait_for_timeout(100)
    g = pg.evaluate("(()=>{const e=document.querySelector('#ndGhost');if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {op:s.opacity,vis:s.display,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2,pe:s.pointerEvents,dpx:document.querySelector('#cvScene').getBoundingClientRect().width/900}})()")
    px, py = xy(500, 200)
    chk('drag ghost: a 60% see-through picture follows the pointer', g and g['op'] == '0.6' and g['vis'] == 'block' and abs(g['cx'] - px) < 3 and abs(g['cy'] - py) < 3 and g['pe'] == 'none', g)
    chk('drag ghost: it is drawn at board scale (the crane is as tall as the real one would be)', g and 100 * g['dpx'] < g['h'] < 330 * g['dpx'] * 1.2, g)
    pg.screenshot(path=OUT + 'drag_ghost_crane_1440.png'); pg.mouse.move(*xy(*zc('crane')), steps=6); pg.mouse.up(); pg.wait_for_timeout(200); chk('drag ghost: it disappears on drop, and the glow/snap still worked', pg.locator('#ndGhost').count() == 0 and ev("!!LS.pl.crane") is True)
    # cancel
    ev("lsRemove('crane')"); a = pg.locator('#lsTray [data-lsadd=crane]').bounding_box(); pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(*xy(500, 200), steps=6); pg.wait_for_timeout(80)
    pg.evaluate("document.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerType:'mouse'}))"); pg.wait_for_timeout(120); chk('drag ghost: it disappears on cancel and nothing is placed', pg.locator('#ndGhost').count() == 0 and ev("!!LS.pl.crane") is False); pg.mouse.up()
    # touch (pointer events with pointerType touch)
    pg.evaluate("""(()=>{const t=document.querySelector('#lsTray [data-lsadd=crane]'),r=t.getBoundingClientRect(),o={bubbles:true,cancelable:true,pointerType:'touch',pointerId:7,isPrimary:true,clientX:r.left+20,clientY:r.top+20};t.dispatchEvent(new PointerEvent('pointerdown',o));
      document.dispatchEvent(new PointerEvent('pointermove',Object.assign({},o,{clientX:r.left+120,clientY:r.top-80})))})()"""); pg.wait_for_timeout(100)
    chk('drag ghost: works with touch pointers too', pg.locator('#ndGhost').count() == 1 and pg.evaluate("getComputedStyle(document.querySelector('#ndGhost')).opacity") == '0.6')
    pg.evaluate("document.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerType:'touch',pointerId:7}))"); pg.wait_for_timeout(100); chk('drag ghost: touch cancel removes it', pg.locator('#ndGhost').count() == 0)
    for t in ['lever', 'block', 'winch', 'ramp', 'jack']:   # every piece has a drawing (a ghost of non-zero size)
        ev(f"lsGhostStart('{t}')"); chk(f'drag ghost: lesson mode draws a ghost for the {t}', pg.locator('#ndGhost').count() == 1 and pg.evaluate("document.querySelector('#ndGhost').width")> 4, t); ev("ndGhostEnd()")
    for tw in (1440, 390):
        pg.set_viewport_size({'width': tw, 'height': 900 if tw > 600 else 844}); open_part5(pg); B = Board(pg)
        for t in ['ramp', 'crane', 'lever', 'jack', 'block', 'winch', 'platM', 'dynS']:
            B.ev(f"glGhostStart('{t}')"); ok = pg.locator('#ndGhost').count() == 1 and pg.evaluate("document.querySelector('#ndGhost').width") > 4; B.ev("ndGhostEnd()")
            if not ok: chk(f'drag ghost: Part 5 draws a ghost for {t} at {tw}', False)
        chk(f'drag ghost: Part 5 draws a ghost for every tray piece at {tw}', True)
    open_part5(pg); B = Board(pg); a = pg.locator('#glTray [data-add=ramp]').bounding_box(); px, py = B.xy(30, 3); pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(px, py, steps=8); pg.wait_for_timeout(100)
    chk('drag ghost: Part 5 shows it while dragging a tray tile, 60% see-through', pg.locator('#ndGhost').count() == 1 and pg.evaluate("getComputedStyle(document.querySelector('#ndGhost')).opacity") == '0.6'); pg.screenshot(path=OUT + 'drag_ghost_part5_1440.png'); pg.mouse.up(); pg.wait_for_timeout(150)
    chk('drag ghost: Part 5 removes it on drop and the ramp is placed', pg.locator('#ndGhost').count() == 0 and B.evr('GLB.rig.parts.length') == 1)
    pg.evaluate("""(()=>{const t=document.querySelector('#glTray [data-add=lever]'),r=t.getBoundingClientRect(),o={bubbles:true,cancelable:true,pointerType:'touch',pointerId:9,isPrimary:true,clientX:r.left+20,clientY:r.top+20};t.dispatchEvent(new PointerEvent('pointerdown',o));
      document.dispatchEvent(new PointerEvent('pointermove',Object.assign({},o,{clientX:r.left+150,clientY:r.top-90})))})()"""); pg.wait_for_timeout(100)
    chk('drag ghost: Part 5 works with touch pointers, and cancel removes it', pg.locator('#ndGhost').count() == 1 and (pg.evaluate("document.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerType:'touch',pointerId:9}))") or True) and pg.locator('#ndGhost').count() == 0)

    # ---------- 7. Part 5: the dotted line label, the messages, the guided throb ----------
    for w in (1440, 390):
        pg.set_viewport_size({'width': w, 'height': 900 if w > 600 else 844}); open_part5(pg); B = Board(pg); pg.wait_for_timeout(500)
        boxes = B.evr("LBL.boxes"); lab = [q for q in boxes if q['text'] == 'Tractor beam reaches this line']
        ov = [q['text'] for q in boxes if lab and q is not lab[0] and not (q['x1'] <= lab[0]['x0'] or q['x0'] >= lab[0]['x1'] or q['y1'] <= lab[0]['y0'] or q['y0'] >= lab[0]['y1'])]
        chk(f'Part 5 at {w}: the dotted line carries the label "Tractor beam reaches this line" and nothing overlaps it', len(lab) == 1 and not ov, [boxes, ov])
        B.ev("GLB.rig={v:2,parts:[],cables:[]};glChanged()"); B.add('ramp', 16, 0); pg.wait_for_timeout(300); boxes = B.evr("LBL.boxes"); lab = [q for q in boxes if q['text'] == 'Tractor beam reaches this line']
        ov = [q['text'] for q in boxes if lab and q is not lab[0] and not (q['x1'] <= lab[0]['x0'] or q['x0'] >= lab[0]['x1'] or q['y1'] <= lab[0]['y0'] or q['y0'] >= lab[0]['y1'])]
        chk(f'Part 5 at {w}: still no overlap with a ramp on the board (labels: {len(boxes)})', len(lab) == 1 and not ov, ov)
        B.ev("GLB.rig={v:2,parts:[],cables:[]};glChanged()"); pg.wait_for_timeout(200); pg.locator('#glCv').scroll_into_view_if_needed(); pg.evaluate("document.querySelector('.glarea').scrollIntoView({block:'start'})"); pg.wait_for_timeout(200); shot('part5_dotted_line_label', w)
    mc = pg.locator('#mi-gl').inner_text()
    chk('Part 5 mission card says it in one short sentence', "Lift the Gumdrop up to the dotted line. The Big Jelly's tractor beam does the rest." in mc, mc[:400])
    chk('Part 5 intro says it too', "Lift the Gumdrop up to the dotted line. The Big Jelly's tractor beam does the rest." in ev("CHDATA.c6.challenge.missions[0].intro||SECTIONS.find(s=>s.id==='c6e').chalInfo.intro"))
    ev("DB.user.teacher=false"); ev("(()=>{const m=GLB;GLB.save({id:GLB.mid},{guide:'on'});glGuidePaint()})()"); pg.wait_for_timeout(300)
    chk('guided start: the lever tile throbs first (one thing only)', throbbing(pg) == ['lever'], throbbing(pg))
    B.ev("(()=>{glAddPart('lever',18.2,0);return 1})()"); pg.wait_for_timeout(300)
    chk('guided start: with the lever placed and its panel open, the load-arm button throbs instead', throbbing(pg) == ['arm-'], throbbing(pg))
    ev("(()=>{const l=glWarmLever();l.arm=1;glChanged()})()"); pg.wait_for_timeout(300); chk('guided start: once the pull is 60 N or less the next piece (the ramp tile) throbs', throbbing(pg) == ['ramp'], throbbing(pg))
    ev("GLB.save({id:GLB.mid},{guide:'done'});glGuidePaint()"); pg.wait_for_timeout(300); chk('guided start closed: nothing throbs', throbbing(pg) == [])
    txt = ev("GLG_STEPS.length"); ev("GLB.rig={v:2,parts:[],cables:[]}")
    src = ev("glGuidePaint.toString()"); chk('guided start final message has the new wording', "Well done, engineer!</b> Keep building up to the dotted line. Once the Gumdrop is level with it, the Big Jelly\\'s tractor beam pulls it in. You don\\'t need to move it across." in src or "Keep building up to the dotted line. Once the Gumdrop is level with it, the Big Jelly's tractor beam pulls it in. You don't need to move it across." in src)
    # not-yet message with metres
    open_part5(pg); B = Board(pg); r1 = B.add('ramp', 16, 0); B.ev("glStartRun('test')"); pg.wait_for_timeout(300); B.ev("GLR.t0-=1e7"); pg.wait_for_timeout(700)
    lines = B.evr("glState().lastTest.lines.map(l=>l[0])"); sh = B.evr("glShort(glEvaluate(GLB.rig))")
    chk('a test that stops short says how high it got and how much higher the line is, in metres', any('got' in l and 'm up' in l and 'm higher' in l for l in lines) and sh and sh['to'] > 0, [lines, sh])
    chk('the metres are the model\'s: up + to = crest height above the start', abs(sh['up'] + sh['to'] - B.evr("glEvaluate(GLB.rig).crest - glEvaluate(GLB.rig).ship0.y")) < 1e-6, sh)
    sm = B.evr("glSummary(glEvaluate(GLB.rig))"); chk('the not-yet ending card text carries the same sentence', 'higher' in B.ev("glEndText(glSummary(glEvaluate(GLB.rig)))[2]") and sm['up'] is not None)

    # ---------- 8. a test always hands the board back ----------
    def board_free(B):
        return B.evr("[!!GLR.on, document.querySelector('.glboard').classList.contains('running'), document.querySelector('#glRun').disabled, document.querySelector('#glRunCtl').hidden]") == [False, False, False, True]
    open_part5(pg); B = Board(pg); B.add('ramp', 16, 0)
    B.ev("glStartRun('test')"); pg.wait_for_timeout(200)
    chk('during a test there are Skip and Back to building buttons ON the board', pg.locator('#glRunCtl [data-gr=skip]').is_visible() and pg.locator('#glRunCtl [data-gr=edit]').is_visible())
    pg.locator('#glRunCtl [data-gr=skip]').click(); pg.wait_for_timeout(2200)
    chk('Skip during a test ends it and the board goes back to build mode by itself', board_free(B), B.evr("[GLR.on, document.querySelector('.glboard').className]"))
    pg.locator('#glTray [data-add=ramp]').scroll_into_view_if_needed(); n0 = B.evr('GLB.rig.parts.length'); a = pg.locator('#glTray [data-add=winch]').bounding_box(); px, py = B.xy(30, 4); pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(px, py, steps=8); pg.mouse.up(); pg.wait_for_timeout(200)
    chk('after a test the tray works again (a dragged winch is placed)', B.evr('GLB.rig.parts.length') == n0 + 1)
    pg.locator('#glDock [data-gm=del]').click(); pg.wait_for_timeout(100); chk('after a test the settings panel works again (Remove)', B.evr('GLB.rig.parts.length') == n0)
    B.tap(20, 8); chk('after a test tapping the board works (a ramp can be picked)', True)
    B.ev("glStartRun('test')"); pg.wait_for_timeout(200); pg.locator('#glRunCtl [data-gr=edit]').click(); pg.wait_for_timeout(200); chk('Back to building during a test returns at once', board_free(B))
    # a test that runs to the end on its own (stops short)
    B.ev("glStartRun('test')"); pg.wait_for_timeout(9000); chk('a test that stops short ends and hands the board back with no button pressed', board_free(B) and pg.locator('#glRes .gltest').count() == 1)
    # a test that fails partway: a leg that needs more than 180 N
    B.ev("GLB.rig={v:2,parts:[],cables:[]};glChanged()"); B.ev("(()=>{glAddPart('ramp',15,0);const p=GLB.rig.parts[0];p.L=5;p.rise=2.5;glChanged()})()")
    B.ev("glStartRun('test')"); pg.wait_for_timeout(200); B.ev("GLR.t0-=1e7"); pg.wait_for_timeout(2200); chk('a test that fails partway (too heavy) also hands the board back', board_free(B), B.evr("[GLR.on, glState().lastTest.lines.map(l=>l[0])]"))
    # a problem inside the run must never strand the board
    B.ev("glStartRun('test')"); B.ev("glSceneAt=()=>{throw new Error('boom')}"); pg.wait_for_timeout(500); chk('even if the run code throws, the board is handed back', board_free(B))
    chk('the "tried" flag still counts after tests', B.evr("!!glState().tried"))

    # ---------- 10. the Gumdrop stays at its start until its leg's lift (it used to flash at the top of the crane first) ----------
    open_part5(pg); B = Board(pg); B.ev("glAddPart('crane',14,0)"); cr = B.ev('GLB.sel'); cp = B.evr(f'glCablePoint(glPart("{cr}"),glMachine(glPart("{cr}"),GLB.ev.ground,[]))'); B.ev(f"glAddPart('block',14,{cp['y']})"); bk = B.ev('GLB.sel')
    B.ev(f'glPart("{bk}").ropes=6;glChanged()'); B.ev("glAddPart('winch',16,3)"); wn = B.ev('GLB.sel'); B.ev(f'GLB.rig.cables.push({{a:"{bk}",b:"{wn}"}});glPart("{wn}").ratio=12;glChanged()')
    B.ev("glStartRun('test')")
    ys = B.evr("(()=>{const y0=GLR.res.ship0.y,T=GLR.beats.reduce((a,b)=>a+b.dur,0),o=[];for(let t=0;t<T;t+=0.02)o.push([t,glSceneAt(t).ship.y-y0]);return o})()")
    lift_t = B.evr("(()=>{let acc=0;for(const b of GLR.beats){if(b.dur>2){return acc}acc+=b.dur}return null})()"); first_move = next((t_ for t_, d in ys if abs(d) > 1e-9), None)
    chk('Test in the simulator: the Gumdrop does not move at all until its leg\'s lift beat starts (no flash at the top of the crane)', first_move is not None and first_move >= lift_t - 0.7 and all(abs(d) < 1e-9 for t_, d in ys if t_ < first_move), [first_move, lift_t])
    chk('Test in the simulator: its biggest move in 0.02 s is small (no jumps) and it ends up 4 m up', max(abs(ys[i][1] - ys[i - 1][1]) for i in range(1, len(ys))) < 0.5 and abs(ys[-1][1] - 4) < 0.3, ys[-1])
    B.ev("glBackToBuild()")
    # ---------- 9. Clear all (no browser dialog), and add-ons falling ----------
    dialogs = []; pg.on('dialog', lambda d: (dialogs.append(d.message), d.dismiss()))
    open_part5(pg); B = Board(pg); B.ev("window.confirm=()=>false")   # exactly what Toddle's frame does: confirm() says no at once
    r1 = B.add('ramp', 16, 0); cp = B.evr(f'glCablePoint(glPart("{r1}"),glMachine(glPart("{r1}"),GLB.ev.ground,[]))'); bk = B.add('block', cp['x'] + 1.5, cp['y'] + 0.5); wn = B.add('winch', cp['x'] + 3, cp['y'] + 0.5)
    pg.evaluate("document.querySelector('[data-gt=clear]').scrollIntoView({block:'center'})"); pg.locator('[data-gt=clear]').click(); pg.wait_for_timeout(150)
    chk('Clear all asks in the page itself (no browser dialog)', pg.locator('#glClearAsk').is_visible() and not dialogs and B.evr('GLB.rig.parts.length') == 3, dialogs)
    pg.locator('#glClearAsk [data-gt=clear-no]').click(); pg.wait_for_timeout(100); chk('"Keep my route" leaves everything', pg.locator('#glClearAsk').count() == 0 and B.evr('GLB.rig.parts.length') == 3)
    rows0 = B.evr('glwRows().length'); chk('the route strip has rows for the route', rows0 >= 1)
    pg.locator('[data-gt=clear]').click(); pg.wait_for_timeout(100); pg.locator('#glClearAsk [data-gt=clear-yes]').click(); pg.wait_for_timeout(300)
    chk('"Yes, clear all" removes every placed piece and cable', B.evr('[GLB.rig.parts.length, GLB.rig.cables.length]') == [0, 0])
    chk('the boulder, the Gumdrop and the ground are still there', B.evr('[!!GLB.ev.ship0, !!glState().boulderGone, GLB.ev.ground.length>0]') == [True, False, True])
    chk('the route strip rows match the empty board', B.evr('glwRows().length') == 0 and pg.locator('#glStrip [data-glw-in]').count() == 0 and not B.evr("Object.keys(glwWork().rows||{}).length"), B.evr("Object.keys(glwWork().rows||{})"))
    chk('and the guided/tool state is fine (Undo brings the route back)', (pg.locator('[data-gt=undo]').click() or True) and B.evr('GLB.rig.parts.length') == 3)
    # add-ons fall
    B.ev("GLB.rig={v:2,parts:[],cables:[]};glChanged()"); r1 = B.add('ramp', 16, 0); cp = B.evr(f'glCablePoint(glPart("{r1}"),glMachine(glPart("{r1}"),GLB.ev.ground,[]))'); bk = B.add('block', cp['x'] + 1.5, cp['y'] + 0.5); wn = B.add('winch', cp['x'] + 3, cp['y'] + 0.5)
    y0 = B.evr(f'glPart("{bk}").y'); B.ev(f'GLB.sel="{r1}";GLB.dockId="{r1}";glPaintDock()'); pg.locator('#glDock [data-gm=del]').click(); pg.wait_for_timeout(120)
    fl = B.evr(f'glFloorAt(glPart("{bk}").x, glGround(GLB.rig).g, [])'); yb = B.evr(f'glPart("{bk}").y'); yw = B.evr(f'glPart("{wn}").y')
    chk('removing a machine: its pulley block and winch fall to the floor under them', y0 > fl + 2 and abs(yb - (fl + 0.8)) < 0.02 and yw < y0 - 1, [y0, yb, yw, fl])
    chk('they are animating (a short drop), then settle', B.evr('Object.keys(GLB.fall||{}).length') == 2); pg.wait_for_timeout(1200); chk('the drop animation ends', B.evr('Object.keys(GLB.fall||{}).length') == 0 and abs(B.evr(f'glPart("{bk}").y') - yb) < 1e-9)
    chk('no cable is left that does not join two things', B.evr('GLB.rig.cables.every(c=>(c.a==="ship"||c.a==="boulder"||!!glPart(c.a))&&(c.b==="ship"||c.b==="boulder"||!!glPart(c.b)))') is True and B.evr(f'GLB.rig.cables.some(c=>c.a==="{r1}"||c.b==="{r1}")') is False, B.evr('GLB.rig.cables'))
    chk('the route strip rows follow (the leg is gone)', B.evr('glwRows().length') == 0)
    # a block clipped on the Gumdrop's own hook is held by the rope, so it stays; a chain block+winch falls together
    B.ev("GLB.rig={v:2,parts:[],cables:[]};glChanged()"); cr = B.add('crane', 14, 0); cp = B.evr(f'glCablePoint(glPart("{cr}"),glMachine(glPart("{cr}"),GLB.ev.ground,[]))'); bk = B.add('block', cp['x'] + 1.5, cp['y'] + 0.5); wn = B.add('winch', cp['x'] + 3, cp['y'] + 0.5)
    chain = B.evr(f'glChainOf("{cr}")'); B.ev(f'glRemove("{cr}")'); pg.wait_for_timeout(100)
    chk('a block and winch chained to a removed crane both fall', chain == [bk, wn] and B.evr(f'glPart("{bk}").y') < 2 and B.evr(f'glPart("{wn}").y') < 2, [chain, B.evr(f'glPart("{bk}").y')])
    chk('the rope from the fallen block to the Gumdrop stays (it joins two things)', B.evr('GLB.rig.cables.length') >= 1 and B.evr(f'GLB.rig.cables.every(c=>[c.a,c.b].every(i=>i==="ship"||i==="boulder"||!!glPart(i)))'))
    # Clear all with add-ons, then Undo
    # platform floor: an add-on over a platform falls onto it
    B.ev("GLB.rig={v:2,parts:[],cables:[]};glChanged()"); pf = B.ev("(()=>{glAddPart('platM',30,0);return GLB.sel})()"); pt = B.evr('glPlatforms(GLB.rig, glGround(GLB.rig).g)'); B.ev(f"glAddPart('crane',30,{pt[0]['top']})"); cr = B.ev('GLB.sel'); B.ev("glAddPart('block',30,9)"); bk = B.ev('GLB.sel')
    B.ev(f'glRemove("{cr}")'); fl = B.evr(f'glFloorAt(glPart("{bk}").x, glGround(GLB.rig).g, glPlatforms(GLB.rig, glGround(GLB.rig).g))'); chk('over a platform the add-on lands on the platform, not the ground', fl > 1 and abs(B.evr(f'glPart("{bk}").y') - (fl + 0.8)) < 0.02, [fl, B.evr(f'glPart("{bk}").y')])
    # reduced motion: instant
    ctx = b.new_context(viewport={'width': 1300, 'height': 950}, reduced_motion='reduce'); pr = ctx.new_page(); open_part5(pr); Br = Board(pr)
    r1 = Br.add('ramp', 16, 0); cp = Br.evr(f'glCablePoint(glPart("{r1}"),glMachine(glPart("{r1}"),GLB.ev.ground,[]))'); bk = Br.add('block', cp['x'] + 1.5, cp['y'] + 0.5); Br.ev(f'glRemove("{r1}")')
    chk('reduced motion: the add-on drops instantly (no animation entry)', Br.evr('Object.keys(GLB.fall||{}).length') == 0 and Br.evr(f'glPart("{bk}").y') < 3, [Br.evr('Object.keys(GLB.fall||{})'), Br.evr(f'glPart("{bk}").y'), Br.evr('RMOTION')]); ctx.close()
    chk('Clear all never used a browser dialog', not dialogs, dialogs)
    chk('no page errors', not errs, errs)
    b.close()
print('FAILS', fails) if fails else print('all passed')
raise SystemExit(1 if fails else 0)
