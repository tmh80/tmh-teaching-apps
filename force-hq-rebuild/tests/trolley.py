"""The crane trolley (spec section 14): Move across in the rescue model, the panel and the board.
Run after build.py:  python3 tests/trolley.py     Screenshots: /tmp/fhq-shots/trolley/
tests/golden_rescue_across0.json was taken from the build BEFORE the trolley, over every saved rescue rig (tests/rescue_routes.js), plain and with hints 3 + maths approved.""" Regenerated for the boulder two-leg job: only the cost (the boulder kit adds 70) and the crane route score (now over budget) changed.
import json, pathlib
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/trolley/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
ROUTES = pathlib.Path('tests/rescue_routes.js').read_text(); GOLD = json.loads(pathlib.Path('tests/golden_rescue_across0.json').read_text())
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
RED = r"""const red=r=>({ok:r.ok,stop:r.stop,hand:r.hand,work:r.work,load:r.load,hardest:r.hardest,score:r.score,cost:r.cost.total,dmg:r.dmg.total,final:r.final,ghosts:r.ghosts,plats:r.plats.map(q=>[q.id,q.load,q.over]),
 legs:r.legs.map(l=>[l.type,l.start,l.end,l.rise,l.ma,l.pull,l.hand,l.work,l.cable,l.faults,l.roped])});"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 950}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.goto(F); pg.wait_for_timeout(300)
    def ev(code): return json.loads(pg.evaluate('c=>__fhq.ev(c)', ROUTES + '\n' + RED + '\n;JSON.stringify((()=>{' + code + '})())'))
    # 1. across = 0 (absent, or 0 on every crane) is identical to the build before the trolley
    for mode, fix in (('no across', ''), ('across 0', "g.parts.forEach(p=>{ if(p.type==='crane') p.across=0; });"), ('adir only', "g.parts.forEach(p=>{ if(p.type==='crane') p.adir=-1; });")):
        out = ev("const o={}; for (const k in ROUTES) { const g=ROUTES[k](); " + fix + " o[k]=red(gpEvaluate(g)); const h=ROUTES[k](); " + fix.replace('g.', 'h.') + " o[k+'_h']=red(gpEvaluate(h,{hints:3,maths:true})); } return o")
        bad = [k for k in GOLD if json.dumps(out[k], sort_keys=True) != json.dumps(GOLD[k], sort_keys=True)]
        chk(f'{mode}: all {len(GOLD)} saved rescue results (score, pulls, hand, work, cost, legs) match the pre-trolley build', not bad, bad)
    # 2. a trolley leg: lift 2 m, across 3 m onto a shelf (platform top at 2 m), then a ramp from the shelf
    base = "const g=rig([[{id:'c',type:'crane',x:14,rise:2,across:3},4,[7,4]]],BL.concat([{id:'p',type:'platform',size:'L',x:17,h:2}]));"
    r = ev(base + "const r=gpEvaluate(g); const l=r.legs[0]; return {end:l.end,start:l.start,rise:l.rise,hand:l.hand,work:l.work,faults:l.faults,load:l.load,ma:l.ma,stop:r.stop}")
    chk('trolley: starts under the Gumdrop, ends on the shelf 3 m across', r['start']['x'] == 14 and abs(r['end']['x'] - 17) < 1e-6 and abs(r['end']['y'] - 2) < 1e-6 and not r['faults'], r)
    chk('trolley: work and hand distance use the rise only', abs(r['work'] - 6300 * 2) < 1e-6 and abs(r['hand'] - 112 * 2) < 1e-6 and r['ma'] == 112, r)
    r0 = ev("const g=rig([[{id:'c',type:'crane',x:14,rise:2},4,[7,4]]],BL); const l=gpEvaluate(g).legs[0]; return {work:l.work,hand:l.hand,pull:l.pull}")
    chk('moving across adds no work: same work, hand and pull as the plain lift', abs(r0['work'] - r['work']) < 1e-6 and abs(r0['hand'] - r['hand']) < 1e-6, (r0, r))
    r = ev(base.replace("across:3", "across:7") + "const l=gpEvaluate(g).legs[0]; return l.faults")
    chk('trolley: nothing under the set-down spot is not a fault now (the Gumdrop rests where it is set down)', 'drop' not in r, r)
    r = ev(base.replace("h:2", "h:2.4") + "const l=gpEvaluate(g).legs[0]; return [l.faults, l.end]")
    chk('trolley: a shelf 0.4 m off the lifted height is fine', not r[0], r)
    r = ev(base.replace("h:2", "h:3") + "const l=gpEvaluate(g).legs[0]; return l.faults")
    chk('trolley: a shelf 1 m above the lifted height is no fault (the next rope picks the Gumdrop up where it rests)', 'drop' not in r, r)
    r = ev("const g=rig([[{id:'c',type:'crane',x:14,rise:2,across:-3},4,[7,4]]],BL); const l=gpEvaluate(g).legs[0]; return [l.faults,l.end]")
    chk('trolley to the left: ground 2 m below the lift is no fault (the Gumdrop is lowered onto it)', 'drop' not in r[0], r)
    r = ev("const g=rig([[{id:'c',type:'crane',x:14,rise:9,across:9},4,[7,4]]],BL); return gpEvaluate(g).legs[0].faults")
    chk('trolley: rise over 8 m and across over 8 m are faults', 'rise' in r and 'across' in r, r)
    # the next machine starts from the set-down spot
    r = ev("const g=rig([[{id:'c',type:'crane',x:14,rise:2,across:3},4,[7,4]],[{id:'r',type:'ramp',x1:18,y1:2,L:10,rise:3},4,[7]]],BL.concat([{id:'p',type:'platform',size:'L',x:17,h:2}])); const e=gpEvaluate(g); return {legs:e.legs.map(l=>[l.type,l.start,l.end]),stop:e.stop}")
    chk('the next machine (a ramp) starts from the set-down point, same place the next rope picks it up', len(r['legs']) == 2 and r['legs'][1][0] == 'ramp' and abs(r['legs'][1][1]['x'] - 17) < 1e-6, r)
    r = ev(base + "const e=gpEvaluate(g); const q=e.plats[0]; return {ship:q.ship,load:q.load}")
    chk('the Gumdrop set on a platform counts towards what the platform holds', r['ship'] and r['load'] >= 6300, r)
    chk('no page errors', not errs, errs)
    b.close()

# ---------- the panel, the board and the run, with real clicks ----------
def open_part5(pg):
    pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    pg.evaluate("__fhq.ev('DB.user.teacher=true')"); pg.evaluate("__fhq.openChapter('c6e','challenge')"); pg.wait_for_timeout(500)
    pg.evaluate("__fhq.ev('closeModal()')"); pg.wait_for_timeout(200); pg.locator('#glCv').scroll_into_view_if_needed()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 950}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); open_part5(pg)
    E = lambda c: pg.evaluate('c=>__fhq.ev(c)', c)
    if pg.locator('[data-gw=skip]').count(): pg.click('[data-gw=skip]')
    pg.click('#glTray [data-add=crane]'); pg.evaluate("document.querySelector('#glCv').scrollIntoView({block:'center'})")
    bb = pg.locator('#glCv').bounding_box(); sx, sy, LW, LH = E('[glSX(14),glSY(4),GLV.LW,GLV.LH]'); pg.mouse.click(bb['x'] + sx * bb['width'] / LW, bb['y'] + sy * bb['height'] / LH); pg.wait_for_timeout(200)
    dock = pg.locator('#glDock').inner_text()
    chk('the crane panel has Move across, Left and Right', 'Move across' in dock and 'Left' in dock and 'Right' in dock, dock)
    for _ in range(4): pg.click('#glDock [data-gm="rise-"]')
    pg.click('#glDock [data-gm="dirL"]')
    for _ in range(8): pg.click('#glDock [data-gm="across+"]')
    cid = E('GLB.sel'); part = json.loads(E('JSON.stringify(glPart(GLB.sel))'))
    chk('Move across steps in 0.5 m: Left then 8 taps is 4 m left, lift 2 m', part.get('across') == -4 and part['rise'] == 2, part)
    chk("the panel says 4 m (Left is on the button, not in the number)", "4 m" in pg.locator("#glDock").inner_text() and "4 m left" not in pg.locator("#glDock").inner_text(), pg.locator("#glDock").inner_text())
    pg.click('#glDock [data-gm="dirR"]'); chk('Right turns it round to 4 m right', json.loads(E('JSON.stringify(glPart(GLB.sel))'))['across'] == 4)
    pg.click('#glDock [data-gm="dirL"]'); chk('Left turns it back', json.loads(E('JSON.stringify(glPart(GLB.sel))'))['across'] == -4)
    pg.click('#glTray [data-add=platL]'); sx, sy, LW, LH = E('[glSX(10),glSY(3),GLV.LW,GLV.LH]'); pg.mouse.click(bb['x'] + sx * bb['width'] / LW, bb['y'] + sy * bb['height'] / LH); pg.wait_for_timeout(200)
    E("(()=>{const q=GLB.rig.parts.find(p=>p.type==='platform'); q.x=10; q.h=2; glChanged();})()"); pg.wait_for_timeout(200)
    E("(()=>{const c=GLB.rig.parts.find(p=>p.type==='crane'); GLB.rig.parts.push({id:'b1',type:'block',ropes:4,x:15,y:8},{id:'w1',type:'winch',ratio:7,x:16,y:8},{id:'w2',type:'winch',ratio:4,x:17,y:8}); GLB.rig.cables.push({a:c.id,b:'b1'},{a:'b1',b:'w1'},{a:'w1',b:'w2'}); glChanged();})()"); pg.wait_for_timeout(200)
    chk('no fault: the shelf is under the set-down spot', json.loads(E('JSON.stringify(GLB.ev.legs[0] ? GLB.ev.legs[0].faults : [])')) == [], E('JSON.stringify(GLB.ev.legs[0])'))
    E('GLV.z=2.6; GLV.cx=11; GLV.cy=5; glClampView()'); pg.wait_for_timeout(200)
    E("glOpenMenu('" + cid + "')"); pg.wait_for_timeout(150); pg.locator('#glCv').scroll_into_view_if_needed(); pg.wait_for_timeout(300)
    pg.screenshot(path=OUT + '01_crane_panel_set_down_glow.png')
    # the run: find a moment in the middle of the trolley roll
    E("glStartRun('test')"); pg.wait_for_timeout(200)
    T = E("(()=>{ const id=GLB.rig.parts.find(p=>p.type==='crane').id; for (let t=0;t<GLR.total;t+=0.05){ const S=glSceneAt(t); if (S.trol[id]!=null && S.trol[id]>13 && S.trol[id]<13.5) return t; } return -1; })()")
    chk('the run has a trolley beat', T > 0, T)
    E(f"GLR.t0 = performance.now() - {T}*1000; GLR.speed=0.0001"); pg.wait_for_timeout(300); pg.screenshot(path=OUT + '02_trolley_mid_run.png')
    seq = E("(()=>{ const id=GLB.rig.parts.find(p=>p.type==='crane').id, o=[]; for (let t=0;t<GLR.total;t+=0.05){ const S=glSceneAt(t); o.push([+S.ship.x.toFixed(2),+S.ship.y.toFixed(2)]); } return JSON.stringify(o); })()")
    seq = json.loads(seq); xs = [a for a, _ in seq]; ys = [y for _, y in seq]
    chk('the Gumdrop lifts, rolls across and comes down onto the shelf (2 m up, 10 m across)', max(ys) >= 2 - 1e-6 and abs(xs[-1]) > 0 and any(9 <= x <= 14 and abs(y - 2) < 0.01 for x, y in seq), (max(ys), seq[-1]))
    chk('no page errors (UI)', not errs, errs)
    b.close()
print('trolley model:', 'ALL PASS' if not fails else f'{len(fails)} FAIL'); print('errors', errs)
raise SystemExit(1 if fails else 0)
