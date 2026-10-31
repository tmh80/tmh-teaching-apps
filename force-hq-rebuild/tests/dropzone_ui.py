"""Drop Zone scene and controls in Explore: drop, pause, step back, snapshot, canopy, compare lanes, worlds, landing, runs, Journal.
Run after build.py:  python3 tests/dropzone_ui.py   (screenshots go to /tmp/fhq-shots/dz/)"""
import json, os, pathlib, sys
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/dz/'; os.makedirs(OUT, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1400, 'height': 1000}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(F); pg.wait_for_timeout(300)
    ev = lambda code: pg.evaluate(f'__fhq.ev({json.dumps(code)})')
    pg.evaluate("__fhq.resetDB(); __fhq.dbSet('user',{name:'Test Student',cls:'7A'})"); pg.reload(); pg.wait_for_timeout(300)
    ev("openExploreDrop()"); pg.wait_for_timeout(400)
    pg.screenshot(path=OUT + '01_idle.png')
    chk('Drop button visible', pg.locator('#dzDrop').is_visible()); chk('pause visible', pg.locator('#dzPause').is_visible())
    chk('pause disabled before the drop', pg.locator('#dzPause').is_disabled())
    chk('tug-of-war panels hidden', not pg.locator('#reads').is_visible() and not pg.locator('#ptiles').is_visible())
    chk('altitude readout 600', '600' in pg.locator('#dz-A-readH').inner_text(), pg.locator('#dz-A-readH').inner_text())
    # drop at fast-forward, then pause
    pg.locator('#warpBtn').click(); pg.locator('#dzDrop').click(); pg.wait_for_timeout(900)
    chk('running', ev('DZ.started && !DZ.ended && S.running'))
    pg.wait_for_timeout(600); pg.locator('#dzPause').click(); pg.wait_for_timeout(200)
    t = ev('DZ.viewT'); chk('paused with a time', ev('DZ.paused') and t > 2, t)
    pg.screenshot(path=OUT + '02_paused.png')
    chk('paused banner drawn / step buttons enabled', pg.locator('#dzBack').is_enabled())
    pg.locator('#dzBack').click(); t2 = ev('DZ.viewT'); chk('step back 0.5 s', abs(t - t2 - 0.5) < 0.06, (t, t2))
    pg.locator('#dzFwd').click(); chk('step forward', abs(ev('DZ.viewT') - t) < 0.06)
    pg.locator('#dzBack').click(); pg.locator('#dzBack').click()
    pg.locator('#dzSnap').click(); pg.wait_for_timeout(150)
    sn = ev("dbGet('dz.snaps',[])"); chk('snapshot saved', len(sn) == 1, sn)
    if sn:
        s = sn[0]; chk('snapshot numbers', abs(s['W'] - 392) < 0.01 and abs(s['R'] - (s['W'] - s['D'])) < 0.01 and s['cstate'] == 'closed' and abs(s['t'] - (t - 1.0)) < 0.06, s)
        chk('snapshot weight 392', abs(s['W'] - 392) < 1e-6)
    # resume from the earlier moment: the history is cut back
    rw = ev("(()=>{const before=DZ.lanes[0].t, want=DZ.viewT; dzPlay(); return [before, want, DZ.lanes[0].t, DZ.paused, DZ.lanes[0].hist.length];})()")
    chk('play rewinds to the viewed time', abs(rw[2] - rw[1]) < 0.011 and rw[0] - rw[2] > 0.9 and rw[3] is False, rw)
    chk('history cut back to the viewed time', rw[4] == round(rw[1] * 10), rw)
    # wait to terminal then landing
    pg.wait_for_function("__fhq.ev('DZ.ended')", timeout=60000)
    chk('landed', ev('DZ.lanes[0].landed') and abs(ev('DZ.lanes[0].landV') - 38) < 0.3, ev('DZ.lanes[0].landV'))
    pg.screenshot(path=OUT + '03_landed.png')
    runs = ev("runsAll().filter(r=>r.kind==='drop')"); chk('one drop run saved', len(runs) == 1 and runs[0]['out'] == 'landed' and abs(runs[0]['time'] - 18.5) < 0.2, runs[0] if runs else None)
    txt = ev("runText(runsAll().filter(r=>r.kind==='drop')[0])"); print('RUN TEXT:', txt)
    chk('run text mentions terminal velocity', 'terminal velocity of 38.0 m/s' in txt and 'landed after 18.' in txt, txt)
    print('SNAP TEXT:', ev("runText(runsAll().filter(r=>r.kind==='snap')[0])"))
    pg.locator('#dzDrop').click(); pg.wait_for_timeout(300); chk('Drop again works', ev('DZ.started && !DZ.ended'))
    # change controls while running is refused
    pg.locator('[data-dzobj="feather"]').click(force=True); chk('cannot change while falling', ev("DZ.lanes[0].obj") == 'crate')
    pg.locator('#resetBtn').click(); chk('reset to idle', ev('!DZ.started') and ev('DZ.lanes[0].y') == 600)
    # skydiver with a canopy
    pg.locator('[data-dzobj="para"]').click(); pg.locator('[data-dzcan="medium"]').click(); pg.locator('#dzHNum').fill('1500'); pg.locator('#dzHNum').press('Enter')
    chk('skydiver medium 1500 m set', ev("DZ.lanes[0].obj+DZ.lanes[0].canopy+DZ.height") == 'paramedium1500')
    pg.locator('#dzDrop').click(); pg.wait_for_function("__fhq.ev('DZ.lanes[0].t > 22')", timeout=30000)
    pg.screenshot(path=OUT + '04_fall.png')
    pg.locator('#dzOpen').click(); pg.wait_for_timeout(700); pg.screenshot(path=OUT + '05_opening.png')
    pg.wait_for_function("__fhq.ev('DZ.lanes[0].fr >= 1')", timeout=20000); pg.wait_for_timeout(2500); pg.screenshot(path=OUT + '06_open.png')
    chk('canopy open', ev('DZ.lanes[0].opened') is not None and ev('DZ.lanes[0].peakDec') / 9.8 > 1.5, ev('DZ.lanes[0].peakDec'))
    pg.wait_for_function("__fhq.ev('DZ.ended')", timeout=120000)
    r = ev("runsAll().filter(r=>r.kind==='drop').pop()"); print('RUN TEXT:', ev("runText(runsAll().filter(r=>r.kind==='drop').pop())"))
    chk('canopy run slowed to about 6.0', r['vt2'] is not None and abs(r['vt2'] - 6.0) < 0.1 and r['landV'] < 7, (r['vt2'], r['landV']))
    chk('Slow landing', ev('DZ.lanes[0].landV') < 7)
    pg.screenshot(path=OUT + '07_soft.png')
    # two lanes
    pg.locator('#resetBtn').click(); pg.locator('[data-dzcan="none"]').click(); pg.locator('#dzTwo').check(); pg.wait_for_timeout(200)
    pg.locator('[data-dzedit="1"]').click(); pg.locator('[data-dzobj="feather"]').click(); pg.locator('[data-dzworld="moon"]').click()
    chk('lane B edited, lane A kept', ev("DZ.lanes[1].obj+DZ.lanes[1].world+DZ.lanes[0].obj") == 'feathermoonpara')
    pg.locator('#dzHNum').fill('300'); pg.locator('#dzHNum').press('Enter'); ev('S.warp=1'); pg.locator('#dzDrop').click(); pg.wait_for_timeout(2500); pg.screenshot(path=OUT + '08_two.png')
    pg.locator('#dzPause').click(); pg.wait_for_timeout(200); pg.screenshot(path=OUT + '09_two_paused.png'); pg.locator('#dzPause').click()
    ev('S.warp=8'); pg.wait_for_function("__fhq.ev('DZ.ended')", timeout=60000); pg.screenshot(path=OUT + '10_two_landed.png')
    chk('two runs saved', len(ev("runsAll().filter(r=>r.kind==='drop' && r.two)")) == 2)
    # every world
    ev("DZ.two=false;DZ.edit=0"); pg.locator('#resetBtn').click()
    for w in ['earth', 'moon', 'mars', 'venus', 'titan', 'jupiter']:
        pg.locator(f'[data-dzworld="{w}"]').click(); pg.locator('[data-dzobj="basketball"]').click(); pg.wait_for_timeout(250); pg.screenshot(path=OUT + f'w_{w}.png')
    pg.locator('#dzDrop').click(); pg.wait_for_timeout(1200); pg.screenshot(path=OUT + 'w_jupiter_fall.png')
    # held by the helicopter: still, so the resultant and acceleration are 0 and the rope arrow is drawn; the helicopter climbs after release
    pg.locator('#journalClose, [data-close]').first.click() if pg.locator('#journal').is_visible() else None
    ev("dzReset(); DZ.two=false; DZ.lanes[0].obj='crate'; DZ.lanes[0].world='earth'; DZ.lanes[0].removed=0; dzLaneReset(DZ.lanes[0], DZ.height)"); pg.wait_for_timeout(200)
    held = ev("(()=>{const v=dzAt(DZ.lanes[0]);return [v.W,v.R,v.a,dzHeliRise(DZ.lanes[0],v.t)]})()")
    chk('held crate: weight 392 N, resultant 0, acceleration 0, no climb yet', abs(held[0]-392)<1e-6 and held[1]==0 and held[2]==0 and held[3]==0, held)
    ev("dzDrop(); S.running=false; (()=>{const L=DZ.lanes[0]; while(L.t<1-1e-9) dzStep(L);})()")
    rel = ev("(()=>{const v=dzAt(DZ.lanes[0]);return [v.R,v.a]})()"); chk('after release the resultant is back (weight minus air resistance)', rel[0] > 300 and rel[1] > 7, rel)
    # the helicopter's climb matches a step-by-step run of its own forces (lift fixed at the old hover value, drag 104 v^2 times the air factor)
    for w, rm in (('earth', 0), ('mars', 0), ('moon', 0), ('earth', 50)):
        got = ev("(()=>{const L=dzNewLane('T'); L.obj='crate'; L.world=%r; L.removed=%d; L.started=true; const m=40,g=dzWorld(L).g,f=dzFactor(L); let v=0,y=0; for(let i=0;i<800;i++){const a=(m*g-104*f*v*Math.abs(v))/1180; v+=a*0.01; y+=v*0.01;} return [y, dzHeliRise(L,8)];})()" % (w, rm))
        chk(f'helicopter climb after 8 s ({w}, {rm}% removed) matches the step-by-step run', abs(got[0]-got[1]) < 0.02 * max(0.05, got[0]) + 0.01, got)
    # speed effects draw without errors at several speeds, in one lane and two, with and without air
    for tag, setup in (('earth', "dzReset(); DZ.two=false; DZ.lanes[0].world='earth'; DZ.lanes[0].removed=0"), ('vacuum', "dzReset(); DZ.two=false; DZ.lanes[0].world='earth'; DZ.lanes[0].removed=100"), ('moon', "dzReset(); DZ.two=false; DZ.lanes[0].world='moon'"), ('two', "dzReset(); DZ.two=true; DZ.lanes[1].world='mars'")):
        ev(setup + "; DZ.lanes.forEach(L=>{L.obj='crate'; dzLaneReset(L, DZ.height)}); dzDrop(); S.running=false")
        for t in (2, 8, 17):
            ev("(()=>{DZ.lanes.filter(L=>dzActive().includes(L)).forEach(L=>{while(L.t<%s-1e-9 && !L.landed) dzStep(L);});})()" % t); pg.wait_for_timeout(100)
        pg.locator('#cvScene').screenshot(path=OUT + f'fx_{tag}.png')
    ev("DZ.two=false")
    # Journal runs tab shows the drops and snapshots
    pg.locator('[data-journal]').first.click(); pg.wait_for_timeout(300)
    chk('journal lists snapshot and runs', 'Snapshot' in pg.locator('#journal').inner_text() and 'You dropped' in pg.locator('#journal').inner_text())
    pg.screenshot(path=OUT + '11_journal.png')
    chk('no page errors', not errs, errs[:3])
    b.close()
print('ALL PASSED' if not fails else f'{len(fails)} FAILED'); sys.exit(1 if fails else 0)
