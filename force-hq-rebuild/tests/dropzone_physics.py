"""Drop Zone physics: the JS engine (46-dropzone.js) must reproduce tools/dropzone_model.py.
Run from force-hq-rebuild after build.py:  python3 tests/dropzone_physics.py
Checks: terminal velocity on every world / object / canopy (within 0.5%), runs against the Python model (landing velocity, time, top, snapshots),
the canopy opening (peak g), and the challenge feasibility grid (pass/fail edges within one 20 m step)."""
import json, math, pathlib, sys
sys.path.insert(0, 'tools')
import dropzone_model as M
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri()
fails = []
def chk(name, cond, extra=''):
    if not cond: print('FAIL ' + name + ' ' + str(extra)); fails.append(name)
    return cond
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(F); pg.wait_for_timeout(300)
    ev = lambda code: pg.evaluate(f'__fhq.ev({json.dumps(code)})')
    # 1. terminal velocities
    n = 0
    for planet in M.PLANETS:
        for obj in M.OBJ:
            for rem in (0, 50):
                want = M.vterm(obj, planet, rem); got = ev(f"dzVterm({obj!r},{planet!r},{rem})")
                n += 1
                if want == math.inf: chk(f'vt {obj} {planet} {rem}% is infinite', got is None or got > 1e12, got)
                else: chk(f'vt {obj} {planet} {rem}%', abs(got - want) / want < 0.005, (want, got))
        for obj in M.CAN_OK:
            for cn in M.CANOPY_VT:
                want = M.vterm(obj, planet, 0, cn); got = ev(f"dzVterm({obj!r},{planet!r},0,{cn!r})"); n += 1
                if want == math.inf: chk(f'vt {obj}+{cn} {planet} infinite', got is None or got > 1e12, got)
                else: chk(f'vt {obj}+{cn} {planet}', abs(got - want) / want < 0.005, (want, got))
    # the Earth numbers in the script's table
    for obj, vt in (('feather', 0.6), ('basketball', 20), ('crate', 38), ('para', 54)): chk(f'Earth vt {obj}', abs(ev(f"dzVterm('{obj}','earth',0)") - vt) < 1e-6)
    for cn, v in (('small', 9.0), ('medium', 6.0), ('large', 4.5)): chk(f'skydiver {cn}', abs(ev(f"dzVterm('para','earth',0,'{cn}')") - v) < 1e-6)
    for cn, v in (('small', 6.57), ('medium', 4.38), ('large', 3.29)): chk(f'crate {cn}', abs(ev(f"dzVterm('crate','earth',0,'{cn}')") - v) < 0.005)
    # 2. full runs against the Python model
    cases = [dict(obj='crate', planet='earth', removed=0, height=600, snaps=[0, 2, 6.4, 10]),
             dict(obj='para', planet='earth', removed=0, height=1500, snaps=[5, 20, 40]),
             dict(obj='feather', planet='earth', removed=0, height=100, snaps=[1]),
             dict(obj='basketball', planet='moon', removed=0, height=300, snaps=[3]),
             dict(obj='crate', planet='mars', removed=0, height=3000, snaps=[10, 30]),
             dict(obj='crate', planet='venus', removed=30, height=1000, snaps=[10]),
             dict(obj='para', planet='titan', removed=0, height=2000, snaps=[10, 100]),
             dict(obj='basketball', planet='jupiter', removed=0, height=500, snaps=[5]),
             dict(obj='para', planet='earth', removed=0, height=1500, canopy='medium', open_at=20.0, snaps=[18, 21, 22.5, 25, 60]),
             dict(obj='crate', planet='earth', removed=0, height=1000, canopy='large', open_at=12.0, snaps=[13, 15, 40])]
    for cs in cases:
        py = M.run(cs['obj'], cs['planet'], cs.get('removed', 0), cs['height'], cs.get('canopy'), cs.get('open_at'), cs['snaps'])
        js = ev("dzSimulate(%s)" % json.dumps(dict(obj=cs['obj'], world=cs['planet'], removed=cs.get('removed', 0), height=cs['height'], canopy=cs.get('canopy'), openAt=cs.get('open_at'), snaps=cs['snaps'])))
        tag = f"{cs['obj']}/{cs['planet']}/{cs['height']}m/{cs.get('canopy')}"
        chk('land velocity ' + tag, abs(js['land'] - py['land']) < 0.01, (py['land'], js['land']))
        chk('time ' + tag, abs(round(js['time'], 1) - py['time']) < 0.051, (py['time'], js['time']))
        chk('top ' + tag, abs(js['top'] - py['top']) < 0.01, (py['top'], js['top']))
        chk('peak deceleration ' + tag, abs(js['peakDec'] - py['peakDec']) < 0.01, (py['peakDec'], js['peakDec']))
        for a, b2 in zip(py['snaps'], js['snaps']):
            chk('snap v ' + tag, abs(a['v'] - b2['v']) < 0.006, (a, b2)); chk('snap y ' + tag, abs(a['y'] - b2['y']) < 0.06, (a, b2))
            chk('snap W ' + tag, abs(a['W'] - b2['W']) < 0.006, (a, b2)); chk('snap D ' + tag, abs(a['D'] - b2['D']) < 0.006, (a, b2)); chk('snap R ' + tag, abs(a['R'] - b2['R']) < 0.006, (a, b2))
    # the worked example in the script: a crate from 600 m on Earth reaches 38.0 m/s and lands after 18.5 s
    r = ev("dzSimulate({obj:'crate',world:'earth',height:600})"); chk('crate 600 m lands after 18.5 s', round(r['time'], 1) == 18.5, r['time']); chk('crate 600 m top 38.0', abs(r['top'] - 38.0) < 0.06, r['top'])
    chk('terminal velocity noticed (vt1)', r['vt1'] is not None and abs(r['vt1'] - 38) < 0.3, r['vt1'])
    # opening peak is about 3 to 7 g
    r = ev("dzSimulate({obj:'para',world:'earth',height:1500,canopy:'small',openAt:20})"); chk('peak g in 3..7', 3 <= r['peakG'] <= 7.5, r['peakG'])
    # 3. the challenge grid: automatic opening heights
    mism = 0
    for mid, o, pl, H, vmax, tmax in M.MISSIONS:
        for cn in ('small', 'medium', 'large'):
            step = 50 if H > 1200 else 20
            for oh in range(0, H + 1, step):
                v, t, pk = M.run_h(o, pl, H, cn, oh)
                py_ok = v < vmax and (not tmax or t <= tmax)
                js = ev("dzSimulate({obj:'%s',world:'%s',height:%d,canopy:'%s',openH:%d})" % (o, pl, H, cn, oh))
                js_ok = js['land'] < vmax and (not tmax or round(js['time'], 1) <= tmax)
                if py_ok != js_ok: mism += 1; print('grid mismatch', mid, cn, oh, (v, t), (js['land'], js['time']))
    chk('challenge grid agrees everywhere', mism == 0, mism)
    chk('no page errors', not errs, errs[:3])
    b.close()
print('ALL PASSED' if not fails else f'{len(fails)} FAILED'); sys.exit(1 if fails else 0)
