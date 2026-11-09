"""Lesson mode and the crane trolley (spec section 14): the u3 unmarked practice task with its reveal, and the k4 two-leg practice (crane, then ramp).
Run after build.py:  python3 tests/lesson_trolley.py     Screenshots: /tmp/fhq-shots/trolley/"""
import json, pathlib
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/trolley/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c); J = lambda code: json.loads(ev('JSON.stringify(' + code + ')'))
    def start(sec, sid):
        pg.goto(F); pg.evaluate('localStorage.clear()'); pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
        pg.evaluate("__fhq.dbSet('lsSeen',{lever:true,crane:true,block:true,winch:true,ramp:true,jack:true,cables:true,platform:true})")
        pg.evaluate(f"__fhq.openChapter('{sec}','learn')"); pg.wait_for_timeout(500); pg.evaluate("__fhq.ev('closeModal()')")
        i = ev(f"CHDATA.{sec}.steps.findIndex(s=>s.id==='{sid}')"); pg.evaluate(f"__fhq.setStep({i})"); pg.wait_for_timeout(200); pg.evaluate("__fhq.ev('hideCards()')"); pg.wait_for_timeout(100)
        pg.evaluate("window.scrollTo(0, document.querySelector('#cvScene').getBoundingClientRect().top + scrollY - 16)"); pg.wait_for_timeout(100)
    def xy(x, y):
        bb = pg.locator('#cvScene').bounding_box(); return bb['x'] + x * bb['width'] / 900, bb['y'] + y * bb['height'] / 430
    def tray_drop(piece, target, steps=12):
        a = pg.locator(f'#lsTray [data-lsadd={piece}]').bounding_box(); pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(*xy(*target), steps=steps); pg.wait_for_timeout(60); pg.mouse.up(); pg.wait_for_timeout(200)
    def zc(piece, i=0): z = J(f"lsZones('{piece}')")[i]; return ((z['x0'] + z['x1']) / 2, (z['y0'] + z['y1']) / 2)
    def end(k): e = J("lsEnds()")[k]; return (e['x'], e['y'])
    def drag(a, bpt, steps=10):
        ax, ay = xy(*a); bx, by = xy(*bpt); m = pg.mouse; m.move(ax, ay); m.down()
        for i in range(1, steps + 1): m.move(ax + (bx - ax) * i / steps, ay + (by - ay) * i / steps)
        m.up(); pg.wait_for_timeout(120)
    def dk(k): pg.locator(f'#lsDock [data-lm="{k}"]').click(); pg.wait_for_timeout(80)
    def pull(secs=6):
        pg.locator('#wsPull').scroll_into_view_if_needed(); pg.locator('#wsPull').click(); pg.wait_for_timeout(150); ev(f"(()=>{{for(let i=0;i<{int(secs/0.02)};i++)wsUpdate(0.02)}})()"); pg.wait_for_timeout(120)
    def task(i): return ev(f"CHDATA[CH.id].steps[GI].tasks[{i}][1]()") is True
    # ---------- u3: the unmarked practice task ----------
    start('c6c', 'u3'); n = ev("CHDATA[CH.id].steps[GI].tasks.length")
    tray_drop('crane', zc('crane')); tray_drop('block', end('top')); dk('lift:2')
    for _ in range(4): dk('ropes+')
    chk('u3: six ropes and a 2 m lift', ev("[WS.ropes, WS.lift]") == [6, 2], ev("[WS.ropes, WS.lift]"))
    chk('u3: the crane panel has Move across, Left and Right', all(w in pg.inner_text('#lsDock') for w in ('Move across', 'Left', 'Right')))
    last = n - 1
    chk('u3: the practice task is the last one, and it has a need (the lift or Move across throbs)', ev(f"!!CHDATA[CH.id].steps[GI].tasks[{last}][2].need") is True)
    for _ in range(2): dk('across+')
    chk('u3: 1 m across is not on the shelf: nothing to set it on, ▶ is off', ev("[lsAcross(), lsTroOk(), lsGate()]") == [1, False, False], ev("[lsAcross(), lsTroOk(), lsGate()]"))
    dk('across+'); dk('across+'); dk('across+'); dk('across+'); chk('u3: 3 m across: the shelf is under it, so ▶ is on', ev("[lsAcross(), lsTroOk(), lsGate()]") == [3, True, True], ev("[lsAcross(), lsTroOk(), lsGate()]"))
    pg.wait_for_timeout(200); pg.screenshot(path=OUT + '03_u3_practice_move_across.png')
    pull(); ev("(()=>{for(let i=0;i<40;i++)wsUpdate(0.02)})()")
    chk('u3: the pull is the same maths as before (6 ropes, 2 m: 12 m of rope)', ev("shopHas({ mach: 'pulley', ropes: 6, rise: 2 })") is True and abs(ev("shopDist({ mach: 'pulley', ropes: 6, rise: 2 })") - 12) < 0.01)
    chk('u3: carrying the crate onto the shelf is noted', ev("!!S.flags.u3carried") is True)
    chk('u3: not ticked until the answer has been shown', task(last) is False)
    pg.evaluate("document.querySelector('#rail [data-tkrev]').scrollIntoView({block:'center'})"); pg.wait_for_timeout(100)
    chk('u3: the answer is hidden until the tap', pg.locator('#rail .tkrev').is_hidden())
    pg.click('#rail [data-tkrev]'); pg.wait_for_timeout(200)
    t = pg.inner_text('#rail .tkrev'); chk('u3: one tap shows "No. Work = force × distance moved upwards against its weight. Moving across adds no lifting work."', t.startswith('No. Work = force × distance moved upwards against its weight. Moving across adds no lifting work.'), t)
    chk('u3: now the task ticks', task(last) is True)
    # ---------- k3: crane, then ramp (screenshot of leg 1 and the finished route) ----------
    start('c6d', 'k4'); pg.wait_for_timeout(300)
    tray_drop('crane', zc('crane')); dk('lift:1.5'); dk('across+'); dk('across+'); dk('across+'); dk('across+'); dk('across+'); dk('across+'); pg.wait_for_timeout(200)
    chk('k4: leg 1 is set (crane over the crate, 3 m across onto the shelf)', ev("lsTwoLeg1()") is True)
    tray_drop('ramp', zc('ramp')); drag(end('g'), end('rt')); pg.wait_for_timeout(200)
    chk('k4: crane then ramp saves k3two (built); the run is still to do', ev("lsK3Done() && dbGet('k3two', false) && !dbGet('k4run', false)") is True)
    pg.screenshot(path=OUT + '05_k4_crane_then_ramp.png')
    chk('no page errors', not errs, errs)
    b.close()
print('lesson trolley:', 'ALL PASS' if not fails else f'{len(fails)} FAIL'); print('errors', errs)
raise SystemExit(1 if fails else 0)
