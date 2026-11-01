"""Workshop numbers: the JS machine maths (4a-workshop.js, wsCalc) must reproduce tools/workshop_model.py.
Run from force-hq-rebuild after build.py:  python3 tests/workshop_numbers.py
Covers Parts 1 and 2 (levers lv1-lv5; pulleys, wheels and ramps pl1-pl4). Later Parts add their cases as they are built."""
import json, pathlib, sys
sys.path.insert(0, 'tools')
import workshop_model as M
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri()
fails = []; n = 0
def chk(name, cond, extra=''):
    global n; n += 1
    if not cond: print('FAIL ' + name + ' ' + str(extra)); fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(F); pg.wait_for_timeout(300)
    calc = lambda o: pg.evaluate(f'__fhq.ev({json.dumps("wsCalc(" + json.dumps(o) + ")")})')
    near = lambda a, b, t=1e-6: abs(a - b) <= t
    # w1: lever class 1, 294 N rock, lift 0.10 m
    for la in (1.0, 0.8, 0.5, 0.4, 0.3, 0.2):
        ma, ea, _ = M.ma_lever(1, la); c = calc(dict(mach='lever', cls=1, arm=la, load=294, lift=0.1))
        chk(f'lever c1 la={la} MA', near(c['ma'], ma, 1e-6), c['ma']); chk(f'lever c1 la={la} effort', near(c['E'], M.effort(294, ma)), c['E'])
        chk(f'lever c1 la={la} end moves', near(c['eDist'], round(ma * 0.1, 2)), c['eDist'])
    # w2: class 2 and class 3
    c = calc(dict(mach='lever', cls=2, arm=0.5, load=294, lift=0.1)); chk('class 2 load 0.5 m', near(c['E'], 73.5), c['E'])
    c = calc(dict(mach='lever', cls=3, arm=0.5, load=294, lift=0.1)); chk('class 3 effort 0.5 m', near(c['E'], 1176.0), c['E'])
    chk('class 3 has MA below 1', c['ma'] < 1)
    chk('class 3: the rock rises 0.40 m and the hand moves 0.10 m', near(c['rise'], 0.4) and near(c['eDist'], 0.1), (c['rise'], c['eDist']))
    c = calc(dict(mach='lever', cls=3, arm=1.0, load=294, lift=0.1)); chk('class 3 hand 1.0 m: 588 N, hand moves 0.20 m', near(c['E'], 588.0) and near(c['eDist'], 0.2), (c['E'], c['eDist']))
    # Part 1 lv1: lifting by hand needs the whole weight
    c = calc(dict(mach='hand', load=294, lift=0.1)); chk('by hand: 294 N, hand moves 0.10 m', near(c['E'], 294.0) and near(c['eDist'], 0.1), (c['E'], c['eDist']))
    # lever travel limit
    c = calc(dict(mach='lever', cls=1, arm=0.2, load=294, lift=0.5)); chk('lever stops early', c['short'] and near(c['rise'], round(1.5 / 9, 2)), (c['short'], c['rise']))
    # w3: pulleys, 235.2 N, 1 m
    for r in range(1, 7):
        c = calc(dict(mach='pulley', ropes=r, load=235.2, lift=1.0)); chk(f'pulley {r} ropes effort', near(c['E'], M.effort(235.2, r)), c['E']); chk(f'pulley {r} rope pulled', near(c['eDist'], float(r)), c['eDist'])
    # w4: winch and ramp
    for R_, E in ((0.1, 98.0), (0.25, 39.2)):
        c = calc(dict(mach='winch', R=R_, axle=0.05, load=196, lift=1.0)); chk(f'winch {R_}', near(c['E'], E), c['E'])
    for L_, E in ((2, 245.0), (5, 98.0)):
        c = calc(dict(mach='ramp', L=L_, h=1, load=490)); chk(f'ramp {L_}', near(c['E'], E) and near(c['rise'], 1.0), (c['E'], c['rise']))
    # w5: wedge, screw, ice
    for t, E in ((10, 600.0), (5, 300.0), (4, 240.0), (2, 120.0)):
        c = calc(dict(mach='wedge', thick=t, load=1200)); chk(f'wedge {t} cm', near(c['E'], E), c['E'])
    for pit, E, turns in ((1.0, 25.0, 20), (0.5, 12.5, 40)):
        c = calc(dict(mach='screw', per=120, pitch=pit, load=3000, lift=0.2)); chk(f'screw pitch {pit}', near(c['E'], E) and near(c['turns'], turns), (c['E'], c['turns']))
    for t, E, ok in ((10, 250.0, False), (5, 125.0, False), (4, 100.0, False), (2, 50.0, True)):
        c = calc(dict(mach='wedge', thick=t, load=500)); chk(f'ice wedge {t} cm', near(c['E'], E) and (c['E'] <= 60) == ok, c['E'])
    # a cap: Smooshy's 60 N
    c = calc(dict(mach='pulley', ropes=3, load=235.2, lift=1.0, cap=60)); chk('cap 60 N is not hit by 78.4 N? it is', c['capped'] and c['rise'] == 0)
    chk('no page errors', not errs, errs[:3])
    b.close()
print(f'{n} checks, {len(fails)} failed'); sys.exit(1 if fails else 0)
