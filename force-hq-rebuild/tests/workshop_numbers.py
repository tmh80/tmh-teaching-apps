"""Workshop numbers: the JS machine maths (4a-workshop.js, wsCalc) must reproduce tools/workshop_model.py.
Run from force-hq-rebuild after build.py:  python3 tests/workshop_numbers.py
Covers Parts 1 to 4 (levers lv1-lv5; pulleys, wheels and ramps pl1-pl4; mechanical advantage and work u1-u3, loading jobs y1-y3, Check c6r12-c6r17). Later Parts add their cases as they are built."""
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
    c = calc(dict(mach='lever', cls=1, arm=1.6, load=294, lift=0.1)); chk('class 1, fulcrum near the hand (rock 1.6 m): 1176 N, rock up 0.40 m, hand 0.10 m', near(c['E'], 1176.0) and near(c['rise'], 0.4) and near(c['eDist'], 0.1), (c['E'], c['rise'], c['eDist']))
    c = calc(dict(mach='lever', cls=1, arm=1.0, load=294, lift=0.1)); chk('class 1 in the middle (MA 1) still lifts 0.10 m', near(c['rise'], 0.1), c['rise'])
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
    # ---------- Part 3 (c6c): u1 to u3, y1 to y3, Check c6r12 to c6r17 ----------
    c294 = 30 * M.G_EARTH
    for r_, E in ((3, 98.0), (6, 49.0)):
        c = calc(dict(mach='pulley', ropes=r_, load=294, lift=1.0)); chk(f'u1 {r_} ropes: effort', near(c['E'], E) and near(c['E'], M.effort(c294, r_)), c['E']); chk(f'u1 {r_} ropes: MA = load / effort', near(294 / c['E'], r_, 0.05), 294 / c['E'])
    c = calc(dict(mach='winch', R=0.4, axle=0.05, load=196, lift=1.0)); chk('u2 winch 0.4/0.05: MA 8, effort 24.5 N', near(c['ma'], 8) and near(c['E'], 24.5) and near(c['E'], M.effort(196, M.ma_winch(0.4))), (c['ma'], c['E']))
    c = calc(dict(mach='ramp', L=4, h=0.8, load=490)); chk('u2 ramp 4 m / 0.8 m: MA 5, effort 98 N', near(c['ma'], 5) and near(c['E'], 98.0) and near(c['E'], M.effort(490, M.ma_ramp(4, 0.8))), (c['ma'], c['E']))
    c = calc(dict(mach='lever', cls=1, arm=0.4, load=294, lift=0.1)); chk('u2 lever worked example: 0.4 m / 1.6 m: MA 4, effort 73.5 N', near(c['ma'], 4) and near(c['E'], 73.5), (c['ma'], c['E']))
    c = calc(dict(mach='pulley', ropes=6, load=294, lift=2.0)); chk('u3 6 ropes, 2 m: 49 N, 12 m of rope', near(c['E'], 49.0) and near(c['eDist'], 12.0), (c['E'], c['eDist']))
    chk('u3 work in = work out = 588 J', near(c['workIn'], 588) and near(c['workOut'], 588) and near(49.0 * 12.0, 588) and near(294 * 2, 588), (c['workIn'], c['workOut']))
    c = calc(dict(mach='pulley', ropes=6, load=294, lift=1.0)); chk('u3 worked example: 294 N lifted 1 m is 294 J', near(c['workOut'], 294), c['workOut'])
    # the pictures use the Part 2 crate: 235.2 N with 4 ropes needs 58.8 N, MA 4
    c = calc(dict(mach='pulley', ropes=4, load=235.2, lift=1.0)); chk('picture: 235.2 / 58.8 = 4', near(c['E'], 58.8) and near(235.2 / c['E'], 4, 1e-6), c['E'])
    # y1: oxygen tank, 245 N, 3 m, at most 60 N and 15 m of rope: only 5 ropes passes
    ok1 = []
    for r_ in range(1, 7):
        c = calc(dict(mach='pulley', ropes=r_, load=245, lift=3.0, cap=60)); good = (not c['capped']) and r_ * 3.0 <= 15
        ok1.append(r_ if good else None)
        if r_ == 4: chk('y1 4 ropes need 61.3 N (capped)', c['capped'] and near(c['need'], 61.3), c['need'])
        if r_ == 5: chk('y1 5 ropes: 49.0 N, 15 m', near(c['E'], 49.0) and near(r_ * 3.0, 15.0), (c['E'],))
        if r_ == 6: chk('y1 6 ropes: 40.8 N but 18 m of rope', near(c['E'], 40.8) and near(r_ * 3.0, 18.0), c['E'])
    chk('y1: only 5 ropes passes', [x for x in ok1 if x] == [5], ok1)
    # y2: fuel barrel, 784 N, 1.2 m high, ramp 3 to 21 m in 1.5 m steps, at most 60 N and 18 m
    good2 = []
    for i in range(13):
        L_ = 3 + 1.5 * i; c = calc(dict(mach='ramp', L=L_, h=1.2, load=784, cap=60))
        if (not c['capped']) and L_ <= 18: good2.append(L_)
        if L_ == 15: chk('y2 15 m needs 62.7 N (capped)', c['capped'] and near(c['need'], 62.7), c['need'])
        if L_ == 16.5: chk('y2 16.5 m: 57.0 N', near(c['E'], 57.0), c['E'])
        if L_ == 18: chk('y2 18 m: 52.3 N', near(c['E'], 52.3), c['E'])
    chk('y2: 16.5 m and 18 m pass; nothing else', good2 == [16.5, 18.0], good2)
    # y3: spare engine, 490 N, winch handle 0.10 to 0.60 m in 0.05 steps, at most 60 N and 0.5 m
    good3 = []
    for i in range(11):
        R_ = round(0.10 + 0.05 * i, 2); c = calc(dict(mach='winch', R=R_, axle=0.05, load=490, lift=2.0, cap=60))
        if (not c['capped']) and R_ <= 0.5 + 1e-9: good3.append(R_)
        if R_ == 0.4: chk('y3 0.40 m needs 61.3 N (capped)', c['capped'] and near(c['need'], 61.3), c['need'])
        if R_ == 0.45: chk('y3 0.45 m: 54.4 N', near(c['E'], 54.4), c['E'])
        if R_ == 0.5: chk('y3 0.50 m: 49.0 N', near(c['E'], 49.0), c['E'])
    chk('y3: 0.45 m and 0.5 m pass; nothing else', good3 == [0.45, 0.5], good3)
    # Check numbers
    chk('c6r12: 4500 / 18 = 250', near(4500 / 18, 250)); chk('c6r13: 120 x 15 = 1800 J (Leo wrote 8 J)', near(120 * 15, 1800) and near(120 / 15, 8))
    chk('c6r15: handle 0.36 / axle 0.04 = 9, 540 / 9 = 60 N', near(0.36 / 0.04, 9) and near(M.effort(540, 9), 60.0))
    c = calc(dict(mach='winch', R=0.36, axle=0.04, load=540, lift=1.0)); chk('c6r15 in the engine too: 60.0 N', near(c['ma'], 9) and near(c['E'], 60.0), (c['ma'], c['E']))
    chk('c6r16: 5 ropes, 650 N, 3 m: 130 N and 15 m of rope', near(M.effort(650, 5), 130.0) and near(5 * 3, 15))
    c = calc(dict(mach='pulley', ropes=5, load=650, lift=3.0)); chk('c6r16 in the engine too', near(c['E'], 130.0) and near(c['eDist'], 15.0), (c['E'], c['eDist']))
    chk('c6r17: 600 / 60 = 10 ropes, 20 m of rope, 60 x 20 = 600 x 2 = 1200 J', near(600 / 60, 10) and near(10 * 2, 20) and near(60 * 20, 1200) and near(600 * 2, 1200))
    chk('u2 q3: ramp 6 m / 1.5 m = 4', near(6 / 1.5, 4))
    # ---------- Part 4 (c6d): k2, k3 and the builder missions h1 to h3 ----------
    def bcheck(name, load, rise, route, ropes, w, **kw):
        m = M.builder(load, rise, route or None, ropes, w); c = calc(dict(mach='build', load=load, lift=rise, br=route or 0, bn=ropes, bw=w, **kw))
        chk(f'{name}: MA', near(c['ma'], m['MA'], 1e-6), (c['ma'], m['MA'])); chk(f'{name}: effort', near(c['E'], m['E'], 1e-6), (c['E'], m['E']))
        chk(f'{name}: cable', near(c['cable'], m['cable'], 1e-6), (c['cable'], m['cable'])); chk(f'{name}: hand travel', near(c['eDist'], round(m['travel'], 2), 1e-6), (c['eDist'], m['travel']))
        return m
    m = bcheck('k2 winch x4, 3 ropes', 1176, 2, 0, 3, 4); chk('k2: MA 12, 98 N, 24 m of hand travel', near(m['MA'], 12) and near(m['E'], 98.0) and near(m['travel'], 24))
    m = bcheck('k2 check winch x6, 4 ropes', 1176, 2, 0, 4, 6); chk('k2: MA 24, 49 N, 48 m', near(m['MA'], 24) and near(m['E'], 49.0) and near(m['travel'], 48))
    m = bcheck('k3 winch x4, 2 ropes, 6 m ramp', 2352, 2, 6, 2, 4); chk('k3: MA 24, 98 N, 48 m of hand travel, 12 m of cable', near(m['MA'], 24) and near(m['E'], 98.0) and near(m['travel'], 48) and near(m['cable'], 12))
    chk('k3 q3: 4 x 5 = 20, 1800 / 20 = 90 N (Leo added)', near(4 * 5, 20) and near(1800 / 20, 90))
    chk('c6r19: 6 x 3 = 18, 2700 / 18 = 150 N', near(6 * 3, 18) and near(2700 / 18, 150))
    def grid(load, rise, routes, cap, cable_max, travel_max):
        ok = []
        for r_ in routes:
            for n_ in (0, 2, 3, 4):
                for w_ in (0, 2, 4, 6, 8, 10):
                    m = M.builder(load, rise, r_ or None, n_, w_)
                    if m['E'] <= cap and m['cable'] <= cable_max and m['travel'] <= travel_max: ok.append((r_, n_, w_))
        return ok
    g1 = grid(1960, 6, [0], 100, 30, 150); chk('h1: 2 ropes x10, 3 ropes x8 and 4 ropes x6 pass', set(g1) == {(0, 2, 10), (0, 3, 8), (0, 4, 6)}, g1)
    g2 = grid(3920, 2, [0, 4, 6, 10], 80, 40, 120); print('h2 passing builds:', g2); chk('h2: at least four builds pass, including the 10 m ramp with winch x10 and no block', len(g2) >= 4 and (10, 0, 10) in g2 and (0, 2, 10) not in g2, g2)
    g3 = grid(1260, 10, [0], 60, 40, 250); chk('h3: 3 ropes x8 and 4 ropes x6 pass', set(g3) == {(0, 3, 8), (0, 4, 6)}, g3)
    chk('h3: weight on Glimmer-9 is 300 x 4.2 = 1260 N', near(300 * 4.2, 1260))
    c = calc(dict(mach='build', load=1960, lift=6, br=0, bn=2, bw=4, cap=100)); chk('h1: 2 ropes x4 (MA 8) needs 245 N: capped', c['capped'] and near(c['need'], 245.0), c['need'])
    # ---------- Extension (c6f): real machines, efficiency and the energy budget ----------
    c = calc(dict(mach='pulley', ropes=4, load=600, lift=2.0, real=True)); chk('p5a real 4 ropes: 187.5 N, work in 1500 J, efficiency 80%', near(c['E'], 187.5) and near(c['workIn'], 1500) and near(c['effPct'], 80.0) and near(c['eDist'], 8.0), (c['E'], c['workIn'], c['effPct']))
    c = calc(dict(mach='pulley', ropes=4, load=600, lift=2.0)); chk('p5a perfect 4 ropes: 150 N', near(c['E'], 150.0))
    c = calc(dict(mach='pulley', ropes=2, load=600, lift=2.0, real=True)); chk('p5b real 2 ropes: 333.3 N, 90%', near(c['E'], 333.3) and near(c['effPct'], 90.0), (c['E'], c['effPct']))
    c = calc(dict(mach='winch', R=0.25, axle=0.05, load=600, lift=2.0, real=True)); chk('p5b real winch 0.25 m: 133.3 N, 90%', near(c['E'], 133.3) and near(c['effPct'], 90.0), (c['E'], c['effPct']))
    c = calc(dict(mach='screw', per=120, pitch=1.0, load=3000, lift=0.2, real=True)); chk('p5b real screw jack: 30%', near(c['effPct'], 30.0), c['effPct'])
    def rgrid(load, rise, routes, cap, budget):
        ok = []
        for r_ in routes:
            for n_ in (0, 2, 3, 4):
                for w_ in (0, 2, 4, 6, 8, 10):
                    m = M.builder(load, rise, r_ or None, n_, w_, True)
                    if m['E'] <= cap and m['workIn'] <= budget: ok.append((r_, n_, w_))
        return ok
    def rchk(name, load, rise, br, bn, bw):
        m = M.builder(load, rise, br or None, bn, bw, True); c = calc(dict(mach='build', load=load, lift=rise, br=br, bn=bn, bw=bw, real=True))
        chk(f'{name}: JS = model (effort, work in)', near(c['E'], m['E'], 1e-6) and near(c['workIn'], m['workIn'], 1), (c['E'], m['E'], c['workIn'], m['workIn']))
    g = rgrid(600, 5, [0], 60, 3800); print('gb1 passing builds:', g); chk('gb1: 2 ropes x8 and x10 pass; 3 ropes and a lone winch do not', (0, 2, 8) in g and (0, 2, 10) in g and not any(x[1] == 3 for x in g) and not any(x[1] == 0 for x in g), g)
    rchk('gb1 2 ropes x8', 600, 5, 0, 2, 8)
    g = rgrid(2000, 3, [0, 6, 9, 15], 60, 10000); print('gb2 passing builds:', g); chk('gb2: 15 m track + winch x10 passes; 15 m track + 2 ropes + x8 passes', (15, 0, 10) in g and (15, 2, 8) in g and (9, 2, 10) in g, g)
    rchk('gb2 15 m track + winch x10', 2000, 3, 15, 0, 10)
    g = rgrid(300, 6, [0], 60, 2000); print('gb3 passing builds:', g); chk('gb3: only the winch alone (x6, x8, x10) passes', set(g) == {(0, 0, 6), (0, 0, 8), (0, 0, 10)}, g)
    c = calc(dict(mach='build', load=300, lift=6, br=0, bn=0, bw=6, real=True)); chk('gb3 edge: winch x6 needs 55.6 N and exactly 2,000 J', near(c['E'], 55.6) and c['workIn'] <= 2000, (c['E'], c['workIn']))
    chk('c6r27: 2000/2500 = 80%', near(2000 / 2500 * 100, 80)); chk('c6r29: efficiencies 96, 80, 75, 40, 30', [round(1200 / w * 100) for w in (1250, 1500, 1600, 3000, 4000)] == [96, 80, 75, 40, 30])
    chk('c6r30: 1200/1500 = 80%', near(1200 / 1500 * 100, 80))
    # ---------- Build tasks bt1 to bt4 (the model grids, matched to the JS) ----------
    W_, N_ = [0, 2, 4, 6, 8, 10], [0, 2, 3, 4]
    def btgrid(load, rise, routes):
        for br in routes:
            for n_ in N_:
                for w_ in W_: yield br, n_, w_, M.builder(load, rise, br or None, n_, w_)
    price = lambda br, n_, w_: {0: 0, 6: 10, 9: 20, 15: 40}[br] + 15 * n_ + 5 * w_
    g = [(br, n_, w_) for br, n_, w_, m in btgrid(1960, 4, [0]) if m['E'] < 300 and m['cable'] <= 16 and m['travel'] <= 40]; print('bt1 passing builds:', g)
    chk('bt1: exactly winch x8, x10, 2 ropes + x4 and 4 ropes + x2 pass; the model build is winch x4 + 2 ropes', set(g) == {(0, 0, 8), (0, 0, 10), (0, 2, 4), (0, 4, 2)}, g)
    g = sorted((price(br, n_, w_), br, n_, w_) for br, n_, w_, m in btgrid(4900, 3, [0, 6, 9, 15]) if m['E'] <= 100 and m['cable'] <= 60 and price(br, n_, w_) <= 120); print('bt2 passing builds:', len(g), g[:3])
    chk('bt2: 16 builds pass; the cheapest is the 15 m ramp + winch x10 at 90 credits, then 95', len(g) == 16 and g[0] == (90, 15, 0, 10) and g[1][0] == 95, g[:3])
    g = [(br, n_, w_) for br, n_, w_, m in btgrid(1176, 2, [0, 4, 6, 10]) if abs(m['MA'] - 24) < 1e-9]; print('bt3 MA-24 builds:', g)
    chk('bt3: seven MA-24 builds; four of them use three parts; 49 N and 48 m for all', len(g) == 7 and sum((br > 0) + (n_ > 0) + (w_ > 0) == 3 for br, n_, w_ in g) == 4 and all(near(M.builder(1176, 2, br or None, n_, w_)['E'], 49) and near(M.builder(1176, 2, br or None, n_, w_)['travel'], 48) for br, n_, w_ in g), g)
    for world, gg, mn in (('earth', 9.8, 72), ('mars', 3.7, 30), ('moon', 1.6, 12)):
        L_ = round(400 * gg, 1); ok = sorted((m['MA'], br, n_, w_) for br, n_, w_, m in btgrid(L_, 2, [0, 4, 6, 10]) if m['E'] <= 60 and m['cable'] <= 40)
        chk(f'bt4 {world}: weight {L_} N, the smallest working MA is {mn}', ok and near(ok[0][0], mn), ok[:2])
    for nm, load, rise, br, bn, bw in (('bt1 model', 1960, 4, 0, 2, 4), ('bt2 model', 4900, 3, 15, 0, 10), ('bt3 model', 1176, 2, 6, 2, 4), ('bt4 Earth model', 3920, 2, 6, 3, 8), ('bt4 Mars model', 1480, 2, 0, 3, 10), ('bt4 Moon model', 640, 2, 0, 2, 6)):
        m = M.builder(load, rise, br or None, bn, bw); c = calc(dict(mach='build', load=load, lift=rise, br=br, bn=bn, bw=bw)); chk(f'{nm}: JS = model (effort, cable, hand travel)', near(c['E'], m['E'], 1e-6) and near(c['cable'], m['cable']) and near(c['eDist'], m['travel']), (c['E'], m['E']))
    chk('bt4 typed answers: 400 x 9.8, 3.7, 1.6 and the MAs needed 65.3, 24.7, 10.7', [400 * x for x in (9.8, 3.7, 1.6)] == [3920.0, 1480.0, 640.0] or all(near(a, b, 1e-6) for a, b in zip([400 * x for x in (9.8, 3.7, 1.6)], (3920, 1480, 640))) and [round(w_ / 60, 1) for w_ in (3920, 1480, 640)] == [65.3, 24.7, 10.7])
    chk('no page errors', not errs, errs[:3])
    b.close()
print(f'{n} checks, {len(fails)} failed'); sys.exit(1 if fails else 0)
