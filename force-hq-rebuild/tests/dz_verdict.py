"""Drop Zone landing label (dzVerdict) and rounded judging. Run after build.py: python3 tests/dz_verdict.py"""
import pathlib
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); fails = []
def chk(n, c, x=''):
    print(('PASS ' if c else 'FAIL ') + n + (' ' + str(x) if (x and not c) else '')); c or fails.append(n)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(F); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo')
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    def V(mi, lv, t, oy, obj='crate', mode='challenge', mask=False):
        return ev(f"(()=>{{ LAB.mode='{mode}'; DZ.mission = {('CHDATA.c5.challenge.missions[%d]' % mi) if mi is not None else 'null'}; const v = dzVerdict({{landV:{lv}, landT:{t}, openY:{'null' if oy is None else oy}, canopy:'large', obj:'{obj}'}}, new Set({['readV'] if mask else []})); return v.text + '|' + (v.col===C.good?'good':v.col===C.bad?'bad':v.col===C.hazard?'hazard':'ink'); }})()")
    r = V(1, 16.2, 100, 1200); chk('M2 Mars 16.2 m/s is green', r.startswith('✓ On target! Landed at 16.2 m/s (target: slower than 20 m/s)') and r.endswith('good'), r)
    r = V(1, 23.4, 100, 1200); chk('M2 23.4 is red too fast', r.startswith('✗ Too fast for this delivery: 23.4 m/s (target: slower than 20 m/s)') and r.endswith('bad'), r)
    r = V(2, 6.5, 200, None); chk('M3 Venus 6.5 m/s is red', r.endswith('bad') and 'Too fast' in r, r)
    r = V(0, 6.96, 100, 450); chk('M1 6.96 m/s shows 7.0 and fails', 'Too fast' in r and '7.0 m/s' in r, r)
    r = V(0, 5.0, 135, 450); chk('M1 slow time is yellow', r.startswith('Landed gently, but took 135 s (target: within 120 s)') and r.endswith('hazard'), r)
    r = V(0, 5.0, 100, 240); chk('M1 low canopy is yellow', r.startswith('Landed gently, but the canopy opened at 240 m (target: above 300 m)'), r)
    r = V(0, 5.0, 100, None); chk('M1 never opened is yellow', 'never opened' in r and r.endswith('hazard'), r)
    r = V(None, 38.0, 20, None, mode='guided'); chk('Learn is neutral', r == 'Landed at 38.0 m/s|ink', r)
    r = V(None, 38.0, 20, None, obj='para', mode='guided'); chk('skydiver gets the guide', 'a safe landing for a person is under 7 m/s' in r, r)
    r = V(None, 38.0, 20, None, mode='guided', mask=True); chk('masked velocity stays hidden', '38' not in r, r)
    # judging: the objectives use the rounded values
    for mi, lv, want in [(0, 6.96, False), (0, 6.94, True), (1, 19.96, False), (2, 5.96, False)]:
        got = ev(f"(()=>{{ const m = CHDATA.c5.challenge.missions[{mi}]; const r={{landV:Math.round({lv}*10)/10,time:100,openH:450}}; return m.objs.find(o=>o.k==='v').ok(r); }})()")
        chk(f'mission {mi+1} landing {lv} m/s judged on rounded value -> {want}', got == want, got)
    say = ev("(()=>{ const m = CHDATA.c5.challenge.missions[0]; const r={landV:16.2,time:135,openH:240}; return m.objs.map(o=>o.say(r)).join(' | '); })()")
    chk('say wording', 'Landing velocity: 16.2 m/s. Target: slower than 7 m/s. ✗' in say and 'Time: 135 s. Target: within 120 s. ✗' in say and 'Canopy opened at 240 m. Target: above 300 m. ✗' in say, say)
    chk('no console errors', not errs, errs); print('errors', errs)
    b.close()
raise SystemExit(1 if fails else 0)
