#!/usr/bin/env python3
"""Force HQ Chapter 6 (the Workshop): reference numbers for every task, mission and rescue stage.
Ideal machines: no friction, weightless bars, pulleys and ropes. g = 9.8 N/kg on Earth, 4.2 N/kg on Planet Glimmer-9.
Part 5 adds real machines (friction): effort = load ÷ (MA × efficiency); distances don't change.
Every judgement uses the numbers students see: forces to 0.1 N, distances to 0.01 m, MA to 0.01. 'At most' limits are inclusive.
Run: python3 tools/workshop_model.py   (prints every value used in docs/Chapter6_Workshop_Script.md)"""
import itertools
G_EARTH, G_GLIM = 9.8, 4.2
r1 = lambda x: round(x + 1e-9, 1)

# ---------- one machine ----------
def ma_lever(cls, x, bar=2.0):
    """class 1: x = load arm (fulcrum slides); class 2: x = load arm (fulcrum at one end, effort at the other);
    class 3: x = effort arm (fulcrum at one end, load at the other). Returns (MA, effort arm, load arm)."""
    if cls == 1: ea, la = bar - x, x
    elif cls == 2: ea, la = bar, x
    else: ea, la = x, bar
    return ea / la, ea, la
ma_pulley = lambda ropes: ropes                       # supporting ropes
ma_winch = lambda handle_r, axle_r=0.05: handle_r / axle_r
ma_ramp = lambda length, height: length / height
ma_wedge = lambda length, thick: length / thick
ma_screw = lambda per_turn, pitch: per_turn / pitch   # same units for both
effort = lambda load, ma: r1(load / ma)

# ---------- real machines (Part 5, Explore): efficiency of each part; a compound machine multiplies them ----------
EFF = {'lever': .95, 'winch': .90, 'ramp': .75, 'wedge': .40, 'screw': .30}
PULLEY_EFF = {1: .95, 2: .90, 3: .85, 4: .80, 5: .75, 6: .70}
def real_lift(load, rise, ma, eff):
    E = r1(load / (ma * eff)); out = round(load * rise); win = round(load * rise / eff)
    return dict(E=E, workOut=out, workIn=win, wasted=win - out, eff=round(out / win * 100, 1))
def builder(load, rise, route=None, ropes=0, w=0, real=False):
    """route = ramp/track length in m (None = straight up); ropes = 0 for no pulley block; w = 0 for no winch."""
    L = route or rise
    ma = (L / rise) * (ropes or 1) * (w or 1)
    eff = 1.0
    if real:
        if route: eff *= EFF['ramp']
        if ropes: eff *= PULLEY_EFF[ropes]
        if w: eff *= EFF['winch']
    E = r1(load / (ma * eff)); win = round(load * rise / eff)
    return dict(MA=ma, eff=eff, E=E, cable=(ropes or 1) * L, travel=ma * rise, workIn=win, parts=(route is not None) + (ropes > 0) + (w > 0))
effort_dist = lambda ma, load_dist: round(ma * load_dist, 2)

def lift(load, ma, load_dist, cap=None, max_travel=None):
    """What the Workshop's Pull! does. cap = the most the puller can give (Smooshy 60 N);
    max_travel = how far the effort end can move (levers only). Returns a dict like the JS run record."""
    E = effort(load, ma)
    if cap is not None and E > cap: return dict(ok=False, why='too heavy', E=cap, need=E, rise=0)
    rise = load_dist
    if max_travel is not None and ma * load_dist > max_travel: rise = round(max_travel / ma, 3)
    return dict(ok=rise >= load_dist - 1e-9, E=E, rise=rise, eDist=effort_dist(ma, rise), workIn=r1(E * ma * rise), workOut=r1(load * rise))

def show(title, rows):
    print('\n--- ' + title)
    for r in rows: print('  ', r)

if __name__ == '__main__':
    rock = 30 * G_EARTH
    show('w1 lever class 1, 30 kg rock = 294 N, bar 2 m, lift 0.10 m',
         [(f'load arm {la}', f'MA {ma_lever(1, la)[0]:.2f}', f'E {effort(rock, ma_lever(1, la)[0])} N', f'end moves {effort_dist(ma_lever(1, la)[0], 0.10)} m') for la in [1.0, 0.8, 0.5, 0.4, 0.3, 0.2]])
    show('lv3 fulcrum close to the hand (MA below 1, so the rock rises 0.40 m)', [('rock 1.6 m from the fulcrum', effort(rock, ma_lever(1, 1.6)[0]), f'hand moves {effort_dist(ma_lever(1, 1.6)[0], 0.40)} m')])
    show('lv1 by hand (MA 1)', [('by hand', effort(rock, 1), 'hand moves 0.10 m')])
    show('lv4/lv5 classes 2 and 3 (the rock rises 0.40 m with the effort in the middle)', [('class 2, load 0.5 m', effort(rock, ma_lever(2, 0.5)[0])), ('class 3, effort 0.5 m', effort(rock, ma_lever(3, 0.5)[0]), f'hand moves {effort_dist(ma_lever(3, 0.5)[0], 0.40)} m'), ('class 3, effort 1.0 m', effort(rock, ma_lever(3, 1.0)[0]), f'hand moves {effort_dist(ma_lever(3, 1.0)[0], 0.40)} m')])
    crate = 24 * G_EARTH
    show('w3 pulleys, 24 kg crate = 235.2 N, lift 1.0 m', [(n, effort(crate, n), f'rope {n * 1.0} m') for n in range(1, 7)])
    show('w4 winch, 196 N bucket, axle 0.05 m', [(R, ma_winch(R), effort(196, ma_winch(R))) for R in [0.1, 0.25]])
    show('w4 ramp, 490 N cart up 1.0 m', [(L, effort(490, ma_ramp(L, 1.0))) for L in [2, 5]])
    show('w5 wedge, log needs 1,200 N, 20 cm long', [(t, effort(1200, ma_wedge(20, t))) for t in [10, 5, 4, 2]])
    show('w5 screw jack, 3,000 N, handle 120 cm per turn, lift 20 cm', [(p, effort(3000, ma_screw(120, p)), f'{20 / p:.0f} turns') for p in [1.0, 0.5]])
    show('w5 toolbox: space ice needs 500 N, 20 cm wedge, limit 60 N', [(t, effort(500, ma_wedge(20, t)), effort(500, ma_wedge(20, t)) <= 60) for t in [10, 5, 4, 2]])
    c294 = 30 * G_EARTH
    show('u1 MA, 294 N crate', [(n, effort(c294, n), round(c294 / effort(c294, n), 2)) for n in [3, 6]])
    show('u2 shortcuts', [('winch 0.4/0.05 MA', ma_winch(0.4)), ('ramp 4 m / 0.8 m on 490 N', effort(490, ma_ramp(4, 0.8))),
                         ('mystery lever 1.5/0.3 on 392 N', effort(392, 1.5 / 0.3)), ('calcorder 600 N', [(k, effort(600, m)) for k, m in [('crowbar', 6), ('pulley', 3), ('winch', 8), ('ramp', 5), ('fishing rod', 0.5)]])])
    show('u3 work, 294 N crate', [lift(c294, 6, 2.0), lift(c294, 3, 1.0)])
    # ---------- Part 2 challenge (limit 60 N) ----------
    show('y1 pulley: 245 N tank, 3 m, rope <= 15 m', [(n, effort(245, n), 3 * n, effort(245, n) <= 60 and 3 * n <= 15) for n in range(1, 7)])
    show('y2 ramp: 784 N barrel, 1.2 m, space <= 18 m', [(L, effort(784, ma_ramp(L, 1.2)), effort(784, ma_ramp(L, 1.2)) <= 60 and L <= 18) for L in [x * 1.5 for x in range(2, 15)]])
    show('y3 winch: 490 N engine, axle 0.05, handle <= 0.5 m', [(R, effort(490, ma_winch(R)), effort(490, ma_winch(R)) <= 60 and R <= 0.5) for R in [0.35, 0.4, 0.45, 0.5, 0.55, 0.6]])
    # ---------- Part 3 ----------
    show('k2 crane, 1,176 N, lift 2 m', [('winch x4, 3 ropes', effort(1176, 12)), ('winch x6, 4 ropes', effort(1176, 24), 'handle travel', effort_dist(24, 2))])
    show('k3 builder demo, 2,352 N generator up 2 m: ramp 6 m (MA 3) x pulley 2 x winch x4', [(3 * 2 * 4, effort(2352, 24), effort_dist(24, 2))])
    WINCH = [2, 4, 6, 8, 10]
    def build(load, rise, limitE, cable, travel, paths, ropes=(1, 2, 3, 4), winches=WINCH):
        out = []
        for (pn, L), n, w in itertools.product(paths.items(), ropes, winches):
            ma = L / rise * n * w; E = effort(load, ma)
            ok = (E <= limitE, n * L <= cable, ma * rise <= travel)
            if all(ok): out.append((pn, f'{n} ropes', f'winch x{w}', f'MA {ma:g}', f'E {E}', f'cable {n * L:g}', f'travel {ma * rise:g}'))
        return out
    show('h1 nose cone 1,960 N up 6 m, E<=100, cable<=30, travel<=150', build(1960, 6, 100, 30, 150, {'straight up': 6}))
    show('h2 rover 3,920 N up 2 m, E<=80, cable<=40, travel<=120', build(3920, 2, 80, 40, 120, {'straight up 2 m': 2, 'ramp 4 m': 4, 'ramp 6 m': 6, 'ramp 10 m': 10}))
    show('h3 Glimmer-9: 300 kg = 1,260 N up 10 m, E<=60, cable<=40, travel<=250', build(300 * G_GLIM, 10, 60, 40, 250, {'straight up': 10}))
    # ---------- Part 4: the rescue ----------
    ship, boulder = 1500 * G_GLIM, 60 * G_GLIM
    print('\n=== Rescue: ship', ship, 'N, boulder', boulder, 'N, MA to lift the ship straight up with 60 N:', ship / 60)
    s1 = []
    for la in [x / 100 for x in range(20, 101, 5)]:
        ma = ma_lever(1, la)[0]; E = effort(boulder, ma); rise = round(1.5 / ma, 3)
        s1.append((f'load arm {la:.2f}', f'MA {ma:.2f}', f'E {E}', f'rise {rise}', 'PASS' if E <= 60 and rise >= 0.25 else ''))
    show('sm1 lever: bar 2 m, push down at most 1.5 m, boulder must rise >= 0.25 m', s1)
    jack = 0.6 * ship
    show(f'sm2 screw jack: load {jack:g} N, lift 40 cm, turns <= 50',
         [(f'{c} m per turn', f'pitch {p} cm', f'MA {ma_screw(c * 100, p):g}', f'E {effort(jack, ma_screw(c * 100, p))}', f'{40 / p:g} turns',
           'PASS' if effort(jack, ma_screw(c * 100, p)) <= 60 and 40 / p <= 50 else '') for c in [0.6, 1.2, 1.8] for p in [0.2, 0.5, 1.0]])
    show('sm3 haul: 6,300 N up 15 m, E<=60, cable<=240, handle travel<=2,400', build(ship, 15, 60, 240, 2400,
         {'straight up the wall': 15, 'steep track 30 m': 30, 'medium track 45 m': 45, 'gentle track 75 m': 75}))
    print('\nSmooshy\'s work hauling the ship (any machine):', ship * 15, 'J')

    # ---------- Part 5: real machines ----------
    show('e1 real pulley, 600 N, 4 ropes, lift 2 m', [real_lift(600, 2, 4, PULLEY_EFF[4])])
    show('e2 real pulley, 2 ropes', [real_lift(600, 2, 2, PULLEY_EFF[2])])
    show('e2 winch 0.25 m and screw jack (3,000 N, 120/1.0)', [real_lift(600, 2, 5, EFF['winch']), real_lift(3000, 0.2, 120, EFF['screw'])])
    def mission(name, load, rise, Emax, budget, routes):
        rows = []
        for L, n, w in itertools.product(routes, [0, 1, 2, 3, 4], [0] + WINCH):
            if L is None and not n and not w: continue
            b = builder(load, rise, L, n, w, real=True)
            if b['E'] <= Emax and b['workIn'] <= budget:
                rows.append((L or 'straight', f'{n} ropes', f'x{w}', f'MA {b["MA"]:g}', f'eff {b["eff"] * 100:.1f}%', f'E {b["E"]}', f'work in {b["workIn"]}'))
        show(name, rows)
    mission('g1 dome panel 600 N up 5 m, E<=60, budget 3,800 J', 600, 5, 60, 3800, [None])
    mission('g2 water tank 2,000 N up 3 m, E<=60, budget 10,000 J', 2000, 3, 60, 10000, [None, 6, 9, 15])
    mission('g3 night shift 300 N up 6 m, E<=60, budget 2,000 J', 300, 6, 60, 2000, [None])
    calc = [(k, round(1200 / win * 100, 1)) for k, win in [('Lever', 1250), ('Pulley system', 1500), ('Dusty ramp', 1600), ('Wedge', 3000), ('Screw jack', 4000)]]
    show('c6r24 efficiencies (most efficient first)', calc)

    # ---------- build tasks (perfect machines) ----------
    def task(name, load, rise, ok, routes=(None,), extra=None):
        rows = []
        for L, n, w in itertools.product(routes, [0, 1, 2, 3, 4], [0] + WINCH):
            if L is None and not n and not w: continue
            b = builder(load, rise, L, n, w)
            if ok(b): rows.append(((L or 'straight'), f'{n} ropes', f'x{w}', f'MA {b["MA"]:g}', f'E {b["E"]}', f'cable {b["cable"]:g}', f'travel {b["travel"]:g}') + ((extra(L, n, w),) if extra else ()))
        return rows
    show('bt1 1,960 N up 4 m: E<300, cable<=16, travel<=40', task('bt1', 1960, 4, lambda b: b['E'] < 300 and b['cable'] <= 16 and b['travel'] <= 40))
    cost = lambda L, n, w: {None: 0, 6: 10, 9: 20, 15: 40}[L] + 15 * n + 5 * w
    bt2 = task('bt2', 4900, 3, lambda b: b['E'] <= 100 and b['cable'] <= 60, routes=(None, 6, 9, 15), extra=lambda L, n, w: f'cost {cost(L, n, w)}')
    bt2 = sorted([r for r in bt2 if int(r[-1].split()[1]) <= 120], key=lambda r: int(r[-1].split()[1]))
    show(f'bt2 4,900 N up 3 m: E<=100, cable<=60, cost<=120 ({len(bt2)} pass; cheapest first)', bt2)
    show('bt3 1,176 N up 2 m: builds with MA exactly 24', task('bt3', 1176, 2, lambda b: abs(b['MA'] - 24) < 1e-9, routes=(None, 4, 6, 10)))
    for world, g in [('Earth', 9.8), ('Mars', 3.7), ('Moon', 1.6)]:
        load = 400 * g
        ok = task('bt4', load, 2, lambda b: b['E'] <= 60 and b['cable'] <= 40, routes=(None, 4, 6, 10))
        best = min(float(r[3].split()[1]) for r in ok)
        print(f'\n--- bt4 {world}: weight {load:g} N, MA needed {load / 60:.2f}, smallest working MA {best:g}')
