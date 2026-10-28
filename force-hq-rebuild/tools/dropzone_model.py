#!/usr/bin/env python3
"""Drop Zone physics reference model (Chapter 5). The JS engine must match these numbers.

Air resistance D = c * airFactor * v^2, with c chosen per object so that on Earth (100% air)
the object's terminal velocity is VT_EARTH. airFactor = planet air density (relative to Earth) x (1 - removed%).
Canopy: c grows over CANOPY_OPEN seconds (linear in canopy area) from the closed value to the canopy value.
Fixed time step 0.01 s, semi-implicit Euler, exactly like the existing engines (Fast-forward only runs more steps per frame).
"""
import math
G_EARTH = 9.8
PLANETS = {  # g in N/kg, air density relative to Earth
  'earth':   (9.8, 1.0),
  'moon':    (1.6, 0.0),
  'mars':    (3.7, 0.016),
  'venus':   (8.9, 53.0),
  'titan':   (1.4, 4.4),
  'jupiter': (24.8, 0.13),
}
OBJ = {  # mass kg, Earth terminal velocity m/s (100% air)
  'feather':     (0.002, 0.6),
  'basketball':  (0.6, 20.0),
  'crate':       (40.0, 38.0),
  'para':        (75.0, 54.0),   # parachutist, canopy closed
}
CANOPY_VT = {'small': 9.0, 'medium': 6.0, 'large': 4.5}   # Earth terminal velocity of the PARACHUTIST with this canopy open
CAN_OK = ('crate', 'para')   # objects that can carry a canopy
# The canopy adds its own air-resistance constant, fixed by the parachutist numbers above:
def ccan(name): m, vt = OBJ['para']; return m * G_EARTH / CANOPY_VT[name]**2 - m * G_EARTH / vt**2
CANOPY_OPEN = 3.0
DT = 0.01

def cval(m, vt): return m * G_EARTH / vt**2

def run(obj, planet='earth', removed=0, height=500, canopy=None, open_at=None, snaps=(), tmax=3000):
    m, vt = OBJ[obj]; g, rho = PLANETS[planet]; f = rho * (1 - removed / 100)
    c0 = cval(m, vt); c1 = c0 + ccan(canopy) if canopy else c0
    t = 0.0; v = 0.0; y = height; opened = None; out = {'top': 0, 'snaps': [], 'peakDec': 0, 'peakD': 0}
    k = 0
    while y > 0 and t < tmax:
        if canopy and opened is None and open_at is not None and t >= open_at - 1e-9: opened = t
        frac = 0 if opened is None else min(1, (t - opened) / CANOPY_OPEN)
        c = c0 + (c1 - c0) * frac
        W = m * g; D = c * f * v * abs(v); R = W - D; a = R / m
        if k < len(snaps) and t >= snaps[k] - 1e-9:
            out['snaps'].append(dict(t=round(t, 2), v=round(v, 2), y=round(y, 1), W=round(W, 2), D=round(D, 2), R=round(R, 2), a=round(a, 3))); k += 1
        out['peakDec'] = max(out['peakDec'], -a); out['peakD'] = max(out['peakD'], D)
        v += a * DT; y -= v * DT; t += DT; out['top'] = max(out['top'], v)
    out.update(land=round(v, 2), time=round(t, 1))
    return out

def vterm(obj, planet='earth', removed=0, canopy=None):
    m, vt = OBJ[obj]; g, rho = PLANETS[planet]; f = rho * (1 - removed / 100)
    if f == 0: return math.inf
    c = cval(m, vt) + (ccan(canopy) if canopy else 0)
    return math.sqrt(m * g / (c * f))

def reach95(vt, g):
    """time and distance to reach 95% of terminal velocity, from rest (v^2 drag)"""
    if vt == math.inf: return math.inf, math.inf
    t = vt / g * math.atanh(0.95); d = vt**2 / g * math.log(math.cosh(math.atanh(0.95))); return t, d

if __name__ == '__main__':
    print('Terminal velocity (m/s); time / distance to reach 95%')
    for p, (g, rho) in PLANETS.items():
        row = []
        for o in OBJ:
            vt = vterm(o, p); t, d = reach95(vt, g)
            row.append(f"{o} {vt:.3g} ({t:.3g} s, {d:.4g} m)" if vt != math.inf else f"{o} no limit")
        for o in CAN_OK:
            for cn in CANOPY_VT:
                row.append(f"{o}+{cn} {vterm(o, p, canopy=cn):.3g}" if rho else f"{o}+{cn} no limit")
        print(f"{p:8s} g={g}: " + '; '.join(row))

def run_h(obj, planet, height, canopy=None, open_h=None, removed=0):
    """like run(), but the canopy opens automatically when the object falls past open_h metres"""
    m, vt = OBJ[obj]; g, rho = PLANETS[planet]; f = rho * (1 - removed / 100)
    c0 = cval(m, vt); c1 = c0 + ccan(canopy) if canopy else c0
    t = 0.0; v = 0.0; y = height; opened = None; peak = 0
    while y > 0 and t < 5000:
        if canopy and opened is None and open_h is not None and y <= open_h: opened = t
        frac = 0 if opened is None else min(1, (t - opened) / CANOPY_OPEN)
        c = c0 + (c1 - c0) * frac; a = (m * g - c * f * v * abs(v)) / m
        peak = max(peak, -a); v += a * DT; y -= v * DT; t += DT
    return round(v, 2), round(t, 1), round(peak / 9.8, 1)

MISSIONS = [  # id, object, planet, height, max landing velocity, max time (s) or None
  ('m1', 'para', 'earth', 1500, 7.0, 120),
  ('m2', 'crate', 'mars', 3000, 20.0, None),
  ('m3', 'crate', 'venus', 1000, 6.0, 240),
]
def mission_grid():
    for mid, o, p, H, vmax, tmax in MISSIONS:
        print(f"\n{mid}: {o} on {p} from {H} m, land under {vmax} m/s" + (f" within {tmax} s" if tmax else ''))
        v, t, _ = run_h(o, p, H); print(f"   no canopy: lands {v} m/s after {t} s -> {'PASS' if v < vmax and (not tmax or t <= tmax) else 'fail'}")
        for cn in CANOPY_VT:
            ok = []
            for oh in range(0, H + 1, 50 if H > 1200 else 20):
                v, t, pk = run_h(o, p, H, cn, oh)
                if v < vmax and (not tmax or t <= tmax): ok.append(oh)
            print(f"   {cn:6s}: passes when opened at {min(ok)}–{max(ok)} m" if ok else f"   {cn:6s}: never passes", end='')
            if ok: v, t, pk = run_h(o, p, H, cn, ok[len(ok)//2]); print(f"   (e.g. open at {ok[len(ok)//2]} m: lands {v} m/s after {t} s, peak {pk} g)")
            else: print()
if __name__ == '__main__': mission_grid()
