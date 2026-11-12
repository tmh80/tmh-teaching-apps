"""Operation Gummy Lift (Chapter 6 Part 5): the rescue model in 4f-gummylift.js against brief section 9, plus the rules that stop a run.
Run from force-hq-rebuild after build.py:  python3 tests/rescue_numbers.py"""
import json, pathlib
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); ROUTES = pathlib.Path('tests/rescue_routes.js').read_text()
fails = []; n = 0
def chk(name, cond, extra=''):
    global n; n += 1
    if not cond: print('FAIL ' + name + ' ' + str(extra)); fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto(F); pg.wait_for_timeout(300)
    def ev(code): return json.loads(pg.evaluate('c=>__fhq.ev(c)', ROUTES + '\n;JSON.stringify((()=>{' + code + '})())'))
    out = ev("EXPECT.rock=[56.25,1344,2]; const o={}; for (const k in ROUTES) { const r=gpEvaluate(ROUTES[k]()); o[k]={pull:r.hardest,hand:r.hand,score:r.score.total,cost:r.cost.total,dmg:r.dmg.total,work:r.work,crest:r.crest,ok:r.arrived,ending:r.score.ending,stop:r.stop}; } o.exp=EXPECT; return o;")
    for k, (pull, hand, score) in out['exp'].items():
        r = out[k]
        chk(f'{k}: hardest pull {pull}', abs(r['pull'] - pull) < 0.06, r['pull']); chk(f'{k}: hand travel {hand}', abs(r['hand'] - hand) < 1, r['hand'])
        chk(f'{k}: score {score}', r['score'] == score, (r['score'], r['stop'])); chk(f'{k}: budget 475 or less (the crane route is over by the boulder kit: open decision for Tom)', k in ('none', 'crane') or r['cost'] <= 475, r['cost'])
    chk('top route work 75,600 J (crest blasted to 12 m)', abs(out['top']['work'] - 75600) < 1, out['top']['work'])
    chk('two 30 m ramps, no blast: work 94,500 J', abs(out['long']['work'] - 94500) < 1, out['long']['work'])
    chk('crest blasted to about 12 m', 12 <= out['top']['crest'] < 12.5, out['top']['crest']); chk('unblasted crest 15 m', out['long']['crest'] == 15)
    chk('spotless / dented / not yet endings', (out['top']['ending'], out['dynb']['ending'], out['none']['ending']) == ('spotless', 'dented', 'notyet'))
    chk('boulder blast within 6 m adds 15%', abs(out['dynb']['dmg'] - 15) < 1e-6, out['dynb']['dmg'])
    chk('boulder left on, 24 m ramp: the landing leg is pulled off (100% damage, ending torn)', out['rock']['dmg'] == 100 and out['rock']['ending'] == 'torn', (out['rock']['dmg'], out['rock']['ending']))
    # rules that stop the run where the fault is
    r = ev("const g=ROUTES.top(); g.parts=g.parts.filter(p=>p.id!=='d1'); const r=gpEvaluate(g); return {ok:r.arrived,stop:r.stop}")
    chk('without the crest blast, the top route cannot reach the tractor beam', not r['ok'] and r['stop']['why'] == 'gap', r)
    r = ev("const g=rig([[{id:'rA',type:'ramp',x1:20,y1:0,L:12,rise:2},4,[7]]],BL); const r=gpEvaluate(g), l=r.legs[0]; return {given:l.given,simple:l.simple,force:l.force,dist:l.dist,work:l.work,ma:l.ropeMA}")
    chk('a ramp whose foot is 6 m from the Gumdrop is not a textbook leg: the Gumdrop is dragged to it, and GASA gives the force and distance', r['given'] is True and r['simple'] is False and r['force'] > 2000 and r['dist'] > 5 and r['ma'] == 28, r)
    r = ev("const g=ROUTES.top(); g.parts.find(p=>p.id==='rB').x1=45; const r=gpEvaluate(g); return {stop:r.stop,legs:r.legs.length}")
    chk('a second ramp that cuts through the crater floor is reported as a broken machine after leg 1', r['stop']['why'] == 'broken' and r['legs'] == 1 and r['stop']['id'] == 'rB', r)
    r = ev("const g=ROUTES.crane(); g.parts.find(p=>p.id==='p2').size='S'; const r=gpEvaluate(g); return {stop:r.stop,over:r.plats.filter(q=>q.over).map(q=>q.id)}")
    chk('small platform under the ramp head and lever collapses', r['stop'] and r['stop']['why'] == 'collapse' and r['over'] == ['p2'], r)
    r = ev("const g={parts:[{id:'r',type:'ramp',x1:16,y1:0,L:30,rise:16}],cables:[{a:'r',b:'ship'}]}; return gpEvaluate(g).legs[0].faults")
    chk('ramp steeper than rise 0.5 of length is refused', 'steep' in r, r)
    r = ev("const g={parts:[{id:'r',type:'ramp',x1:20,y1:0,L:30,rise:12}],cables:[]}; return gpEvaluate(g).stop")
    chk('a ramp with no rope to the Gumdrop does nothing: norope', r['why'] == 'norope', r)
    r = ev("const g={parts:[{id:'r',type:'ramp',x1:41,y1:6,L:20,rise:4}],cables:[]}; return glMachine(g.parts[0],glGround(g).g,[]).faults")
    chk('the bulge blocks a long, shallow ramp from the shelf', 'ground' in r, r)
    r = ev("const g={parts:[{id:'r',type:'ramp',x1:41,y1:6,L:20,rise:4},{id:'d',type:'dyn',big:true,x:54}],cables:[]}; const G=glGround(g); return glMachine(g.parts[0],G.g,[]).faults")
    chk('blasting the bulge clears that shallow ramp', 'ground' not in r, r)
    r = ev("const g={parts:[{id:'r',type:'ramp',x1:14.5,y1:0,L:30,rise:12},{id:'p',type:'platform',size:'L',x:42,h:6}],cables:[]}; return gpEvaluate(g).arrived")
    chk('one big ramp without blasting the crest is not enough', r is False)
    r = ev("const g=ROUTES.top(); const r=gpEvaluate(g,{hints:3}); return r.score")
    chk('hints: first free, then -1 each', r['total'] == 8, r)
    r = ev("const g=ROUTES.weak(); const r=gpEvaluate(g,{hints:9}); return r.score.total")
    chk('hint cost never takes a rescue below 1', r == 1, r)
    r = ev("const g={parts:[{id:'c',type:'crane',x:14,rise:15}],cables:[{a:'c',b:'ship'}]}; return gpEvaluate(g).legs[0].faults")
    chk('crane rise is limited', 'rise' in r, r)
    r = ev("const g={parts:[{id:'l',type:'lever',x:14,arm:0.8,rise:1,dir:1}],cables:[]}; return gpEvaluate(g).legs[0].faults")
    chk('lever MA above 9 is refused', 'fulcrum' in r, r)
    r = ev("const g={parts:[{id:'j',type:'jack',x:14,rise:2}].concat(BL),cables:[]}; const r=gpEvaluate(g); return [r.legs[0].pull, r.legs[0].hand]")
    chk('screw jack: MA 120, hand travel 240 m for 2 m', abs(r[0] - 52.5) < 1e-6 and abs(r[1] - 240) < 1e-6, r)
    chk('no page errors', not errs, errs)
    b.close()
print(f'{n - len(fails)}/{n} rescue checks passed'); raise SystemExit(1 if fails else 0)
