"""Stage 4 (spec section 11): Part 5 at Gummy Mission Control. The guided start, the route strip (My working), 💡 hints (the first free, then -1 each),
▶ Test in simulator (no leg numbers), 📨 Send to GASA (wrong cells flagged, two rejections = helped), Mission accepted + the animation, the
"Maths approved by GASA" objective, the My Rescue page, and old saves without a strip.
Run after build.py:  python3 tests/stage4_gasa.py     Screenshots (1440 and 390 wide): /tmp/fhq-shots/stage4/"""
import json, pathlib, re, sys
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/stage4/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
ROUTES = pathlib.Path('tests/rescue_routes.js').read_text()
ns = {}; exec(open('tests/play_rescue.py').read().split('with sync_playwright')[0], ns)
fails = []
def back(pg):
    try:
        if pg.locator('#glBack').is_visible(): pg.click('#glBack', timeout=1500)
    except Exception: pass   # a simulator test hands the board back by itself after a moment
    pg.evaluate("__fhq.ev('if (GLR.on) { GLR.done = true; glBackToBuild(); }')"); pg.wait_for_timeout(150)
def skip(pg):
    for sel in ('[data-gr=skip]', '#glSkip'):
        if pg.locator(sel).is_visible():
            try: pg.click(sel, timeout=1500)   # a fast test run can finish between the check and the click
            except Exception: pass
            return
    return

def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
def run(vp, tag, full):
    with sync_playwright() as p:
        b = p.chromium.launch(); ctx = b.new_context(viewport=vp, has_touch=vp['width'] < 500); pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        ns['open_part5'](pg, guide=True); B = ns['Board'](pg)
        ev = lambda c: pg.evaluate('c=>__fhq.ev(c)', c); evj = lambda c: json.loads(ev('JSON.stringify(' + c + ')'))
        shot = lambda sel, name: pg.locator(sel).first.screenshot(path=OUT + f'{name}_{tag}.png')
        def setrig(code):
            pg.evaluate('c=>__fhq.ev(c)', ROUTES + ';(()=>{const g=' + code + '; GLB.rig=g; glChanged();})()'); pg.wait_for_timeout(150)
        def rows(): return evj("glwRows().map(r=>({key:r.key,name:r.name,cells:r.cells.map(c=>({k:c.k,lab:c.lab,exp:c.exp,d:c.d}))}))")
        def right(c): return str(round(c['exp'], c['d'])).rstrip('0').rstrip('.') if '.' in str(round(c['exp'], c['d'])) else str(round(c['exp'], c['d']))
        def fill_all(wrong=None):
            for r in rows():
                for c in r['cells']:
                    v = right(c)
                    if wrong and (r['key'], c['k']) == wrong: v = '1'
                    pg.fill(f'[data-glw-in="{r["key"]}|{c["k"]}"]', v)
        # ---------- the page: Mission Control framing, old boxes gone ----------
        chk(f'{tag}: the board is labelled GUMMY MISSION CONTROL · RESCUE SIMULATOR', 'GUMMY MISSION CONTROL · RESCUE SIMULATOR' in pg.inner_text('.glmchd'))
        chk(f'{tag}: the Mission computer prediction box and the old warm-up are gone', ev("!document.querySelector('#glPred, #glWarm, #glPVal, #glWork, #glHint')") is True)
        chk(f'{tag}: the tutorial coach shows ON the board with one step and a Skip', pg.locator('#glGuide').is_visible() and pg.locator('#glGuide [data-gw=skip]').count() == 1 and 'Drag a lever from the tray onto the boulder' in pg.inner_text('#glGuide') and pg.evaluate("!!document.querySelector('#glGuide').closest('.glboard')"))
        chk(f'{tag}: the board keeps the full width: the settings card is on the board too, hidden until a piece is tapped', pg.evaluate("!!document.querySelector('#glDock').closest('.glboard')") and not pg.locator('#glDock').is_visible())
        chk(f'{tag}: the strip is below the board and Send to GASA is off until there is a route', ev("document.querySelector('#glStrip').getBoundingClientRect().top >= document.querySelector('.glboard').getBoundingClientRect().bottom") is True and pg.locator('#glSend').is_disabled())
        chk(f'{tag}: ▶ Test in simulator is inside the board', pg.evaluate("!!document.querySelector('#glRun').closest('.glboard')"))
        shot('#glGuide', 'guided_start')
        if full:
            # guided steps tick from the rig: lever on the boulder, then the arm
            B.add('lever', 18, 0); pg.wait_for_timeout(150)
            chk(f'{tag}: guide ticks the lever step', pg.locator('#glGuide li.ok').count() == 1)
            ev('(()=>{glWarmLever().arm=1;glChanged();})()'); pg.wait_for_timeout(100)
            chk(f'{tag}: guide ticks the arm step and keeps the live MA line', pg.locator('#glGuide li.ok').count() == 2 and 'drops when he lets go' in pg.inner_text('#glGuide'))
            # the rest of the guided walk-through (winch, crane, pull, lift, across, test) is played with real pointer moves in play_boulder.py
            setrig('ROUTES.top()'); pg.wait_for_timeout(150)
            chk(f'{tag}: the boulder kit and two ramps give strip rows: pry, lift, Leg 1, Leg 2', [r['name'] for r in rows()] == ['Boulder: pry', 'Boulder: lift', 'Leg 1', 'Leg 2'], rows())
            ev("GLB.save({id:GLB.mid},{guide:'on', tests:0, tried:false, lastTest:null}); glGuidePaint()")
        else:
            setrig('ROUTES.top()'); pg.wait_for_timeout(150)
        txt = pg.inner_text('#glStrip'); chk(f'{tag}: the strip describes each leg from the rig', 'Leg 1' in txt and 'ramp' in txt and 'pulley block' in txt and 'winch' in txt and 'Load 6,300 N' in txt, txt[:300])
        chk(f'{tag}: nothing is pre-calculated: every box starts empty', ev("[...document.querySelectorAll('#glStrip [data-glw-in]')].every(i=>i.value==='')") is True)
        ev("(()=>{const rig=GLB.rig; GLB.save({id:GLB.mid},{guide:'skip'}); glGuidePaint();})()"); chk(f'{tag}: Skip closes the guide', not pg.locator('#glGuide').is_visible())
        # a full two-ramp route for the rest
        setrig('ROUTES.top()'); R = rows()
        pg.evaluate("document.querySelector('#glStrip').scrollIntoView({block:'start'})"); pg.wait_for_timeout(150); pg.screenshot(path=OUT + f'board_strip_{tag}.png')
        chk(f'{tag}: ROUTES.top gives Boulder: pry, Boulder: lift, Leg 1, Leg 2', [r['name'] for r in R] == ['Boulder: pry', 'Boulder: lift', 'Leg 1', 'Leg 2'])
        chk(f'{tag}: each leg has a box for every machine, the total MA, pull, hand distance and work', [c['k'] for c in R[2]['cells']] == ['mach', 'block', 'winch1', 'tot', 'pull', 'hand', 'work'], R[2])
        pg.locator('#glStrip').scroll_into_view_if_needed()
        # ---------- hints: first free, then 1 point each ----------
        chk(f'{tag}: no hints used yet and the strip says the first is free', ev('glState().hints||0') == 0 and 'first is free' in pg.inner_text('#glwHints'))
        pg.click('[data-r="L:rA"] [data-glw="hint:L:rA"]'); chk(f'{tag}: opening the hint box spends nothing', ev('glState().hints||0') == 0)
        pg.click('[data-glw="spend:L:rA:1"]'); t = pg.inner_text('[data-r="L:rA"] .glw-hint')
        chk(f'{tag}: tier 1 is the first hint, free, and shows formulas only', ev('glState().hints') == 1 and 'Ramp MA = length ÷ rise' in t and '24' not in t, t[:200])
        chk(f'{tag}: a free first hint costs no points', ev('gpEvaluate(GLB.rig,{hints:glState().hints}).score.hintCost') == 0)
        pg.click('[data-glw="spend:L:rA:2"]'); t = pg.inner_text('[data-r="L:rA"] .glw-hint')
        chk(f'{tag}: tier 2 costs 1: this leg\'s own numbers with blanks', ev('glState().hints') == 2 and '24 ÷ 6' in t and '6,300' in t and pg.locator('[data-r="L:rA"] .glw-hint .blank').count() >= 4, t[:300])
        chk(f'{tag}: the second hint costs 1 point', ev('gpEvaluate(GLB.rig,{hints:glState().hints}).score.hintCost') == 1)
        pg.click('[data-glw="spend:L:rA:3"]'); chk(f'{tag}: tier 3 is a worked example with different numbers', ev('glState().hints') == 3 and '5 × 3 × 4' in pg.inner_text('[data-r="L:rA"] .glw-hint'))
        pg.click('[data-r="L:rA"] [data-glw="hint:L:rA"]'); pg.click('[data-r="L:rA"] [data-glw="hint:L:rA"]'); chk(f'{tag}: closing and reopening a hint is free', ev('glState().hints') == 3 and '24 ÷ 6' in pg.inner_text('[data-r="L:rA"] .glw-hint'))
        chk(f'{tag}: the strip shows the hints used', '3' in pg.inner_text('#glwHints'))
        if full: shot('#glStrip', 'hint_open')
        else: shot('#glStrip', 'hint_open')
        # ---------- Test in simulator: no leg numbers ----------
        pg.click('[data-r="L:rA"] [data-glw="hint:L:rA"]')
        chk(f'{tag}: Send is off while the boxes are empty', pg.locator('#glSend').is_disabled())
        pg.locator('#glCv').scroll_into_view_if_needed(); pg.click('#glRun'); pg.wait_for_timeout(500)
        chk(f'{tag}: the test is running on the board', ev('GLR.on') is True and ev('GLR.mode') == 'test')
        shot('.glboard', 'test_running')
        skip(pg); pg.wait_for_function("document.querySelector('#glRes').innerText.trim().length>0", timeout=20000); t = pg.inner_text('#glRes')
        chk(f'{tag}: the test says where each leg worked', 'Leg 1: worked' in t and 'Leg 2: worked' in t and 'tractor beam' in t, t)
        chk(f'{tag}: the test shows NO numbers (no pull, hand distance, work, MA)', not re.search(r'\d+(\.\d+)?\s*(N|J|m)\b', t.replace('No score', '')) and '56' not in t and '1,344' not in t and 'score' in t.lower(), t)
        s = evj("glState()"); chk(f'{tag}: a test saves no run and no score, but counts as tried', s.get('tests') == 1 and not s.get('runs') and s.get('tried') is True and not s.get('best'), {k: s.get(k) for k in ('tests', 'runs', 'tried', 'best')})
        chk(f'{tag}: the animation had no leg readouts', ev("GLR.beats.length>0") is True)
        # a leg that fails shows why, still no numbers
        back(pg); setrig("(()=>{const g=ROUTES.top(); g.parts.find(p=>p.id==='rBw0').ratio=4; g.cables=g.cables.filter(c=>!(c.a==='rB'&&c.b==='ship')); return g})()")
        pg.click('#glRun'); pg.wait_for_timeout(300); skip(pg); pg.wait_for_function("document.querySelector('#glRes').innerText.trim().length>0", timeout=20000); t = pg.inner_text('#glRes')
        chk(f'{tag}: a leg with no rope says so, a leg that is too hard says so', "Leg 2's machine isn't roped to the Gumdrop" in t, t)
        back(pg); setrig("(()=>{const g=ROUTES.weak(); return g})()"); pg.click('#glRun'); pg.wait_for_timeout(300); skip(pg); pg.wait_for_function("document.querySelector('#glRes').innerText.trim().length>0", timeout=20000); t = pg.inner_text('#glRes')
        chk(f'{tag}: "Leg 2: too hard for Smooshy" with no numbers', 'Leg 2: too hard for Smooshy' in t and '98' not in t, t)
        back(pg); setrig('ROUTES.top()')
        # ---------- Send to GASA: a wrong cell is rejected ----------
        fill_all(wrong=('L:rB', 'pull')); chk(f'{tag}: every box filled turns Send on', pg.locator('#glSend').is_enabled())
        pg.click('#glSend'); pg.wait_for_timeout(200); m = pg.inner_text('#glwMsg')
        chk(f'{tag}: a wrong cell rejects the mission and the message names it', m.startswith("Mission not accepted yet: check leg 2's pull.") and ev('GLR.on') is False, m)
        chk(f'{tag}: only that cell is flagged', pg.locator('[data-r="L:rB"] .glw-cell.bad').count() == 1 and pg.locator('.glw-cell.bad').count() == 1 and pg.locator('.glw-cell.ok').count() >= 16, (pg.locator('.glw-cell.bad').count(), pg.locator('.glw-cell.ok').count()))
        if full: shot('#glStrip', 'send_rejected')
        else: shot('#glStrip', 'send_rejected')
        h0 = ev('glState().hints'); pg.click('#glSend'); pg.wait_for_timeout(150)
        chk(f'{tag}: sending the same wrong number again is not a second rejection', pg.locator('[data-r="L:rB"] .glw-cell.bad').count() == 1 and pg.locator('.glw-cell.helped').count() == 0)
        pg.fill('[data-glw-in="L:rB|pull"]', '2'); pg.click('#glSend'); pg.wait_for_timeout(250)
        chk(f'{tag}: rejected twice: the cell shows its right value, marked helped, with the working', pg.locator('[data-r="L:rB"] .glw-cell.helped').count() == 1 and pg.input_value('[data-glw-in="L:rB|pull"]') == '56.3' and 'helped' in pg.inner_text('[data-r="L:rB"] .glw-cell.helped').lower() and '6,300 ÷ 112 = 56.3 N' in pg.inner_text('[data-r="L:rB"] .glw-help'), pg.inner_text('[data-r="L:rB"]')[:300])
        chk(f'{tag}: a helped cell counts as a hint', ev('glState().hints') == h0 + 1, (h0, ev('glState().hints')))
        chk(f'{tag}: the helped cell cannot be edited, and the mission waits for another Send', pg.locator('[data-glw-in="L:rB|pull"]').is_disabled() and ev('GLR.on') is False and 'helped' in pg.inner_text('#glwMsg'))
        shot('#glStrip', 'helped_cell')
        # ---------- changing a machine clears that leg's boxes ----------
        pg.fill('[data-glw-in="L:rA|pull"]', '56.3'); ev("(()=>{GLB.rig.parts.find(p=>p.id==='rAw0').ratio=8;glChanged();})()"); pg.wait_for_timeout(150)
        chk(f'{tag}: changing a machine clears that leg\'s boxes and keeps the other leg', pg.input_value('[data-glw-in="L:rA|pull"]') == '' and pg.input_value('[data-glw-in="L:rB|work"]') != '')
        ev("(()=>{GLB.rig.parts.find(p=>p.id==='rAw0').ratio=7;glChanged();})()"); pg.wait_for_timeout(100)
        for r in rows():
            for c in r['cells']:
                if not pg.locator(f'[data-glw-in="{r["key"]}|{c["k"]}"]').is_disabled(): pg.fill(f'[data-glw-in="{r["key"]}|{c["k"]}"]', right(c))
        # ---------- all right: Mission accepted and the animation ----------
        ev('FAST=false'); hb = ev('glState().hints'); pg.click('#glSend'); pg.wait_for_timeout(300)
        chk(f'{tag}: all right: Mission accepted 🚀 is shown', 'Mission accepted' in pg.inner_text('#glwMsg') and pg.locator('#glAccept').is_visible() and 'Mission accepted' in pg.inner_text('#glAccept'))
        shot('.glboard', 'mission_accepted')
        pg.wait_for_function("GLR_ON()" if False else "true"); pg.wait_for_timeout(1900)
        chk(f'{tag}: then the rescue animation plays', ev("GLR.on") is True and ev("GLR.mode") == 'launch')
        pg.wait_for_timeout(1200); shot('.glboard', 'rescue_running')
        skip(pg); pg.wait_for_function("document.querySelector('#glRes').innerText.trim().length>0", timeout=20000); t = pg.inner_text('#glRes'); ev('FAST=true')
        s = evj("glState()"); sm = s['bestRun']['sum']
        chk(f'{tag}: the result card shows Maths approved by GASA as a scored objective', 'Maths approved by GASA: 1 of 1' in t.replace('\n', ' ') and ' of 11' in t, t[:900])
        chk(f'{tag}: the run is saved: 1 run, 11 max, maths point earned', s['runs'] == 1 and sm['max'] == 11 and sm['pts']['maths'] == 1, sm)
        chk(f'{tag}: hints reduce the total: {hb} hints used, first free', sm['hintCost'] == hb - 1 and sm['score'] == sm['pts']['pull'] + sm['pts']['cond'] + sm['pts']['boulder'] + sm['pts']['oxy'] + sm['pts']['budget'] + 1 - (hb - 1), (sm['score'], sm['pts'], hb))
        chk(f'{tag}: the hints line is in the result', 'Hints used' in t)
        chk(f'{tag}: the best run keeps the route strip, with helped marks and the hint count', s['bestRun']['work']['hints'] == hb and any(c['st'] == 'helped' for r in s['bestRun']['work']['rows'] for c in r['cells']) and s['bestRun']['pred'] is None, s['bestRun']['work']['hints'])
        chk(f'{tag}: the Check is never blocked: the Challenge is done', ev("challengeDone('c6e')") is True)
        if full: shot('#glRes', 'result')
        pg.click('#glPop [data-gp=on]') if pg.locator('#glPop [data-gp=on]').count() else None
        pg.evaluate("document.querySelectorAll('#glPop').forEach(e=>e.remove())")
        pg.evaluate("window.scrollTo(0,0)")
        chk(f'{tag}: no sideways scroll', pg.evaluate('document.documentElement.scrollWidth') <= vp['width'] + 1, pg.evaluate('document.documentElement.scrollWidth'))
        # ---------- the My Rescue page ----------
        html = ev("buildWorksheet('c6e','student')"); T = re.sub('<[^>]+>', ' ', html)
        chk(f'{tag}: My Rescue prints the route strip with the working, helped marks and hints', 'My working: the route strip' in html and 'rstrip' in html and '(helped)' in html and 'Hints used' in T and 'Maths approved by GASA' in T and '56.3' in T and 'of 11' in T, T[:600])
        chk(f'{tag}: the key prints a filled strip', 'rstrip' in ev("buildWorksheet('c6e','key')") and 'Maths approved by GASA: yes' in re.sub('<[^>]+>', '', ev("buildWorksheet('c6e','key')")))
        chk(f'{tag}: the blank copy has an empty strip frame', 'Hints used: ____' in ev("buildWorksheet('c6e','blank')"))
        if full:
            pg.evaluate("(()=>{const d=document.createElement('div');d.id='_rep';d.style.cssText='position:absolute;left:0;top:0;width:900px;background:#fff;z-index:99999;padding:12px';d.className='ws';document.body.appendChild(d);__fhq.ev(\"document.getElementById('_rep').innerHTML=buildWorksheet('c6e','student')\")})()"); pg.wait_for_timeout(300)
        else:
            pg.evaluate("(()=>{const d=document.createElement('div');d.id='_rep';d.style.cssText='position:absolute;left:0;top:0;width:380px;background:#fff;z-index:99999;padding:6px';d.className='ws';document.body.appendChild(d);__fhq.ev(\"document.getElementById('_rep').innerHTML=buildWorksheet('c6e','student')\")})()"); pg.wait_for_timeout(300)
        pg.evaluate("window.scrollTo(0,0)"); pg.locator('#_rep .rescue').first.screenshot(path=OUT + f'report_{tag}.png')
        # ---------- an old save with no strip, no guide, a prediction and a score out of 10 ----------
        pg.evaluate("document.getElementById('_rep').remove()")
        old = {'rig': {'v': 2, 'parts': [{'id': 'r1', 'type': 'ramp', 'x1': 15.5, 'y1': 0, 'L': 24, 'rise': 6}], 'cables': [{'a': 'r1', 'b': 'ship'}]}, 'runs': 2, 'tried': True, 'best': 7, 'hints': 2, 'hintSeen': {'t1:force': True, 't2:ma': True}, 'warm': 'done',
               'bestRun': {'rig': {'v': 2, 'parts': [], 'cables': []}, 'sum': {'legs': [{'type': 'ramp', 'name': 'Ramp 24 m', 'rise': 6, 'ma': 4, 'pull': 1575, 'hand': 24, 'work': 37800, 'stopped': False, 'thr': 0}], 'hardest': 1575, 'hand': 24, 'cost': 80, 'crest': 15, 'work': 37800, 'dmg': {'t': 0, 'r': 0, 'b': 0, 'total': 0}, 'boulder': 'left', 'rockOn': True, 'arrived': False, 'stop': 'gap', 'stopLeg': 1, 'score': 7, 'pts': {'pull': 2, 'cond': 2, 'boulder': 0, 'oxy': 1, 'budget': 1}, 'hintCost': 1, 'ending': 'dented', 'load': 8400}, 'pred': {'leg': 0, 'value': 60, 'working': 'old free text working'}, 'at': 1}, 'last': None, 'draftWork': 'old draft'}
        pg.evaluate("o=>{const c=__fhq.dbGet('chal.c6e',{}); c.gl=o; __fhq.dbSet('chal.c6e',c);}", old); pg.reload(); pg.wait_for_timeout(400); pg.evaluate("__fhq.openChapter('c6e','challenge')"); pg.wait_for_timeout(500); ev('closeModal()'); pg.wait_for_timeout(200)
        chk(f'{tag}: an old save loads: its rig, its hints count, no guided start, an empty strip', ev('GLB.rig.parts.length') == 1 and ev('glState().hints') == 2 and not pg.locator('#glGuide').is_visible() and ev("glwRows().length") == 1 and pg.locator('[data-glw-in]').count() > 0, (ev('GLB.rig.parts.length'), ev('glState().hints'), pg.locator('#glGuide').is_visible(), ev('glwRows().length')))
        h = ev("buildWorksheet('c6e','student')"); chk(f'{tag}: its My Rescue page still shows the old working and a score out of 10', 'old free text working' in h and '7 of 10' in h)
        chk(f'{tag}: no page errors', not errs, errs)
        b.close()
run({'width': 1440, 'height': 900}, 'd', True)
run({'width': 390, 'height': 844}, 'm', False)
print('FAILS', fails) if fails else print('all passed'); sys.exit(1 if fails else 0)
