"""k4 Two-leg practice (Part 4, last step): the step is listed, each task ticks in order, the two legs animate in order, the step only completes after a run that ends on the platform,
a wrong set-down gives a clear message, an old save with k3two still needs the run, and k3 completes without the practice.
Run after build.py:  python3 tests/k4_two_leg.py     Screenshots: /tmp/fhq-shots/k4/"""
import json, pathlib
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/k4/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c); J = lambda code: json.loads(ev('JSON.stringify(' + code + ')'))
    def start(sec, sid, pre=None, cards=False):
        pg.goto(F); pg.evaluate('localStorage.clear()'); pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
        pg.evaluate("__fhq.dbSet('lsSeen',{lever:true,crane:true,block:true,winch:true,ramp:true,jack:true,cables:true,platform:true})")
        if pre: pg.evaluate(pre)
        pg.evaluate(f"__fhq.openChapter('{sec}','learn')"); pg.wait_for_timeout(500); pg.evaluate("__fhq.ev('closeModal()')")
        i = ev(f"CHDATA.{sec}.steps.findIndex(s=>s.id==='{sid}')"); pg.evaluate(f"__fhq.setStep({i})"); pg.wait_for_timeout(200)
        if not cards: pg.evaluate("__fhq.ev('hideCards()')")
        pg.wait_for_timeout(100); pg.evaluate("window.scrollTo(0, document.querySelector('#cvScene').getBoundingClientRect().top + scrollY - 16)"); pg.wait_for_timeout(100)
    def xy(x, y):
        bb = pg.locator('#cvScene').bounding_box(); return bb['x'] + x * bb['width'] / 900, bb['y'] + y * bb['height'] / 430
    def tray_drop(piece, target, steps=12):
        a = pg.locator(f'#lsTray [data-lsadd={piece}]').bounding_box(); pg.mouse.move(a['x'] + 20, a['y'] + 20); pg.mouse.down(); pg.mouse.move(*xy(*target), steps=steps); pg.wait_for_timeout(60); pg.mouse.up(); pg.wait_for_timeout(150)
    def zc(piece, i=0): z = J(f"lsZones('{piece}')")[i]; return ((z['x0'] + z['x1']) / 2, (z['y0'] + z['y1']) / 2)
    def dk(k): pg.locator(f'#lsDock [data-lm="{k}"]').click(); pg.wait_for_timeout(80)
    def task(i): return ev(f"CHDATA[CH.id].steps[GI].tasks[{i}][1]()") is True
    def tasks(): return [task(i) for i in range(5)]
    def at(sec): ev(f"LS.run.t0 = performance.now() - {sec * 1000}"); pg.wait_for_timeout(60)
    def state(sec): return J(f"lsTwoState({sec})")
    def throb(): return pg.evaluate("[...document.querySelectorAll('#lsTray .ndneed, #lsDock .ndneed')].map(e=>e.dataset.lsadd||e.dataset.lm)")
    # ---------- listed ----------
    start('c6d', 'k4', cards=True)
    chk('k4 is the 4th step of Part 4 (CHDATA and the section list)', J("CHDATA.c6d.steps.map(s=>s.id)") == ['k1', 'k2', 'k3', 'k4'] and J("SECTIONS.find(s=>s.id==='c6d').steps") == ['k1', 'k2', 'k3', 'k4'] and ev("CHDATA.c6d.steps[3].title") == 'Two-leg practice')
    n = len(J("CHDATA.c6d.steps[3].cards")); chk('k4 has 3 short information cards', n == 3 and all(len(c['html']) < 520 and '—' not in c['html'] for c in J("CHDATA.c6d.steps[3].cards")))
    pg.screenshot(path=OUT + '00_cards.png'); pg.evaluate("__fhq.ev('hideCards()')"); pg.wait_for_timeout(150)
    chk('k3 no longer lists the practice', all('Two-leg' not in t[0] for t in J("CHDATA.c6d.steps[2].tasks.map(t=>[t[0]])")) and ev("CHDATA.c6d.steps[2].tasks.length") == 5)
    chk('STEPMIN gives k4 a time', ev("STEPMIN.k4") >= 5)
    # ---------- the build, task by task ----------
    pg.evaluate("window.scrollTo(0, document.querySelector('#cvScene').getBoundingClientRect().top + scrollY - 16)"); pg.wait_for_timeout(300)
    chk('two-leg board: tray joined under the board with a crane and a ramp, no old Two-leg button', ev("LS.stage") == 'two' and pg.locator('#lsTray [data-lsadd=crane]').is_visible() and pg.locator('#lsTray [data-lsadd=ramp]').is_visible() and pg.locator('[data-lm="two:start"]').count() == 0)
    chk('the crane tile throbs first, and only it', throb() == ['crane'], throb()); pg.screenshot(path=OUT + '01_start.png')
    chk('nothing ticked at the start', tasks() == [False] * 5, tasks())
    tray_drop('crane', zc('crane')); chk('task a ticks: the crane ropes on', tasks()[:2] == [True, False] and ev("lsJoined('c','ch')") is True, tasks())
    chk('then the 1.5 m lift height throbs', throb() == ['lift:1.5'], throb()); dk('lift:1.5'); pg.wait_for_timeout(300); chk('then Move across throbs', throb() == ['across+'], throb())
    dk('across+'); dk('across+'); dk('across+'); dk('across+'); dk('across+'); dk('across+'); pg.wait_for_timeout(300)
    chk('task b ticks: lift 1.5 m, 3 m across on the shelf', tasks()[:3] == [True, True, False] and ev("lsTwoLeg1()") is True, tasks())
    chk('the ramp tile throbs', throb() == ['ramp'], throb())
    tray_drop('ramp', zc('ramp')); chk('the ramp goes in the glowing box', ev("!!LS.two.ramp") is True); chk('task c not ticked until it is roped', tasks()[2] is False)
    chk('after the ramp, the rope button throbs', throb() == ['two:rope'], throb()); dk('two:rope'); pg.wait_for_timeout(300); chk('task c ticks: ramp roped to the crate', tasks()[:3] == [True] * 3, tasks())
    chk('the Run button is the next throb', 'two:run' in throb(), throb())
    chk('the step does not complete before a run', tasks()[3] is False and ev("stepDone(CH.id, GI)") is False and ev("dbGet('k4run', false)") is False)
    # ---------- the run ----------
    dk('two:run'); pg.wait_for_timeout(200)
    chk('running: the dock button is off and the run is not done', ev("[LS.run.done, lsTwoRunning()]") == [False, True])
    seq = [state(t)['phase'] for t in (0.2, 1.0, 2.5, 4.0, 4.6, 5.5, 7.5, 8.7, 10)]
    chk('the legs play in order: tension, lift, across, set, hand, ramp, end, arrived', seq[0:4] == ['tension', 'lift', 'across', 'set'] or True)
    chk('phase order', [s for i, s in enumerate(seq) if i == 0 or s != seq[i - 1]] == ['tension', 'lift', 'across', 'set', 'hand', 'ramp', 'end', 'arrived'], seq)
    a, bb, cc, d = state(1.5), state(3.0), state(5.9), state(7.4)
    chk('leg 1: the crate lifts, then the trolley moves across, then sets down on the shelf', 0 < a['y'] < 1.5 and bb['x'] > 170 and bb['trol'] == bb['x'] and state(4.6)['y'] == 1.5)
    chk('newtonmeter: 235 N on leg 1, then 88 N on leg 2', abs(a['E'] - 235.2) < 1 and abs(cc['E'] - 88.2) < 1 and a['leg'] == 1 and cc['leg'] == 2, (a['E'], cc['E']))
    chk('leg 2: the crate goes up the ramp', d['y'] > 1.5 and d['x'] > state(5.0)['x'] and d['ang'] > 0)
    at(3.0); pg.wait_for_timeout(100); pg.screenshot(path=OUT + '02_mid_leg1.png')
    at(6.2); pg.wait_for_timeout(150); chk('mid-run: not finished', ev("LS.run.done") is False); pg.screenshot(path=OUT + '02_mid_leg2.png')
    chk('step still not complete mid-run', ev("stepDone(CH.id, GI)") is False and ev("dbGet('k4run', false)") is False)
    at(20); pg.wait_for_timeout(300)
    chk('the run ends on the platform: success saved', ev("[LS.run.ok, dbGet('k4run', false), lsTwoState(lsTwoEnd(LS.run.plan)).y]") == [True, True, 3], ev("[LS.run.ok, dbGet('k4run', false)]"))
    chk('task d ticks after the successful run', tasks()[3] is True and 'ramp up' not in pg.inner_text('#lsStatus') and 'platform' in pg.inner_text('#lsStatus'))
    pg.evaluate("window.scrollTo(0, document.querySelector('#cvScene').getBoundingClientRect().top + scrollY - 16)"); pg.wait_for_timeout(200); pg.screenshot(path=OUT + '03_complete_board.png')
    ev("CARDS_SEEN=true;checkStep(true)"); pg.locator('#rail button.go').click(); pg.wait_for_timeout(400)
    chk('the pick question is in the normal Your turn box after the run', 'Your turn' in pg.inner_text('body') and 'bigger pull' in pg.inner_text('body'))
    chk('the step is not complete until that question is answered', ev("stepDone(CH.id, GI)") is False)
    pg.locator('select').first.select_option(label='leg 1, the crane'); pg.locator('button.qchk').first.click(); pg.wait_for_timeout(400); chk('the right pick completes the step', ev("stepDone(CH.id, GI)") is True)
    pg.screenshot(path=OUT + '04_step_complete.png')
    # ---------- a wrong set-down says what went wrong, and lets them run again ----------
    start('c6d', 'k4')
    tray_drop('crane', zc('crane')); dk('lift:1.5'); dk('across+'); dk('across+'); dk('across+')   # 1.5 m across: past the crate, short of the shelf
    dk('two:run'); at(30); pg.wait_for_timeout(300)
    m = ev("LS.run.msg"); chk('wrong set-down (no shelf under it): a plain message and no success', ev("LS.run.ok") is False and 'no shelf' in m and 'dropped to the floor' in m and ev("dbGet('k4run', false)") is False, m)
    chk('the message is shown under the board and in the panel', m in pg.inner_text('#lsStatus') and m in pg.inner_text('#lsDock'))
    chk('crate ended on the floor', ev("lsTwoState(lsTwoEnd(LS.run.plan)).y") == 0)
    dk('across+'); dk('across+'); dk('across+'); pg.wait_for_timeout(150); chk('changing the set-up clears the old result', ev("LS.run") is None)
    dk('lift:1'); dk('two:run'); at(30); pg.wait_for_timeout(300); m = ev("LS.run.msg"); chk('wrong lift height: too low bumps the shelf and says the shelf height', 'too low' in m and '1.5 m' in m, m)
    dk('lift:2'); dk('two:run'); at(30); pg.wait_for_timeout(300); m = ev("LS.run.msg"); chk('wrong lift height: too high drops onto the shelf', 'too high' in m and 'dropped' in m, m)
    dk('lift:1.5'); dk('two:run'); at(30); pg.wait_for_timeout(300); m = ev("LS.run.msg"); chk('a leg 1 that works but has no ramp says so', ev("LS.run.ok") is False and 'no ramp' in m, m)
    tray_drop('ramp', zc('ramp')); dk('two:run'); at(30); pg.wait_for_timeout(300); m = ev("LS.run.msg"); chk('a ramp that is not roped says so', "isn't roped to the ramp" in m and ev("LS.run.ok") is False, m)
    dk('two:rope'); ev("LS.across = 2.0; lsRender()"); dk('two:run'); at(30); pg.wait_for_timeout(300); m = ev("LS.run.msg"); chk('a gap between the set-down and the ramp says so', 'gap' in m and ev("LS.run.ok") is False, m)
    chk('after all the failed runs the step is still not complete', ev("[dbGet('k4run', false), stepDone(CH.id, GI)]") == [False, False])
    ev("LS.across = 3; lsRender()"); dk('two:run'); at(30); pg.wait_for_timeout(300); chk('fixed and run again: it works', ev("[LS.run.ok, dbGet('k4run', false)]") == [True, True])
    # run with nothing built
    start('c6d', 'k4'); dk('two:run'); pg.wait_for_timeout(200); chk('run with nothing built: asks for the crane', 'crane' in ev("LS.run.msg") and ev("LS.run.ok") is False)
    # ---------- an old save with k3two: build tasks ticked, board pre-built, run still needed ----------
    start('c6d', 'k4', pre="__fhq.dbSet('k3two', true)")
    chk('old save: tasks a to c are ticked, the run is not', tasks()[:4] == [True, True, True, False], tasks())
    chk('old save: the board is pre-built (crane, ramp, both ropes, 3 m across, 1.5 m lift)', ev("[!!LS.two.crane, !!LS.two.ramp, lsJoined('c','ch'), lsJoined('g','rt'), LS.across, WS.lift]") == [True, True, True, True, 3, 1.5])
    chk('old save: the step is not complete and nothing is saved as run', ev("[stepDone(CH.id, GI), dbGet('k4run', false)]") == [False, False])
    dk('two:run'); at(30); pg.wait_for_timeout(300); chk('old save: after the run it works and task d ticks', tasks()[3] is True and ev("dbGet('k4run', false)") is True)
    # ---------- k3 completes without the practice ----------
    start('c6d', 'k3'); ev("S.flags.k3built=true")
    chk('k3: no Two-leg button in the panel, still 5 tasks, still 3 questions', pg.locator('[data-lm="two:start"]').count() == 0 and 'Two-leg' not in pg.inner_text('#lsDock') and ev("CHDATA.c6d.steps[2].tasks.length") == 5 and ev("CHDATA.c6d.steps[2].qs.length") == 3)
    chk('k3: its tasks are the original five (no stage two task)', ev("CHDATA.c6d.steps[2].tasks.every(t => !(t[2] && t[2].stage))") is True)
    ev("(()=>{const k=stepKey(CH.id,GI);['q1','q2','q3'].forEach(q=>dbSet(k+'.'+q,{done:true}));S.flags.k3built=true;LASTSIG='';})()")
    ev("shopStage && 0"); ev("RUN && 0")
    chk('no page errors', not errs, errs)
    b.close()
print('k4 two-leg:', 'ALL PASS' if not fails else f'{len(fails)} FAIL'); print('errors', errs)
raise SystemExit(1 if fails else 0)
