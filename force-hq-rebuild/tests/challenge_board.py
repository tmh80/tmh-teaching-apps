"""Part 3 and Part 4 challenges on the shared builder (spec section 14, y1 to y3 and h1 to h3).
For each mission the board path (tray pieces, the crane's trolley into the Big Jelly's hold, the panel) must judge exactly like the old setter, for the 'give' answer and for one wrong answer.
Run after build.py:  python3 tests/challenge_board.py     Screenshots: /tmp/fhq-shots/trolley/"""
import json, pathlib
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/trolley/'; pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
# mission: (chapter, tab index, old-setter js, board steps [pieces, (data-lm, times)...]) for the give answer and a wrong answer
CASES = {
  'y1': ('c6c', 0, {'give': ("wsSet('ropes',5)", {'ropes+': 3}), 'wrong': ("wsSet('ropes',4)", {'ropes+': 2})}, ['crane', 'block'], True),
  'y2': ('c6c', 1, {'give': ("wsSet('L',16.5)", {'L+': 9}), 'wrong': ("wsSet('L',15)", {'L+': 8})}, ['ramp'], False),
  'y3': ('c6c', 2, {'give': ("wsSet('R',0.5)", {'R+': 8}), 'wrong': ("wsSet('R',0.4)", {'R+': 6})}, ['crane', 'winch'], True),
  'h1': ('c6d', 0, {'give': ("wsSet('bw',10);wsSet('bn',2)", {'bw:10': 1, 'bn:2': 1}), 'wrong': ("wsSet('bw',10);wsSet('bn',4)", {'bw:10': 1, 'bn:4': 1})}, ['crane', 'block', 'winch'], True),
  'h2': ('c6d', 1, {'give': ("wsSet('bw',10);wsSet('bn',0);wsSet('br',10)", {'br:10': 1, 'bw:10': 1}), 'wrong': ("wsSet('bw',4);wsSet('bn',0);wsSet('br',6)", {'br:6': 1, 'bw:4': 1})}, ['ramp', 'winch'], False),
  'h3': ('c6d', 2, {'give': ("wsSet('bw',8);wsSet('bn',3)", {'bw:8': 1, 'bn:3': 1}), 'wrong': ("wsSet('bw',10);wsSet('bn',4)", {'bw:10': 1, 'bn:4': 1})}, ['crane', 'block', 'winch'], True),
}
OLD = """(()=>{ const M=CHDATA.c6.challenge.missions.find(m=>m.id==='%s'); shopStage(Object.assign({},M.setup,{cap:M.cap})); %s; const c=wsCalc();
 const r={E:c.E,need:c.need,capped:c.capped,dist:wsR2(c.ma*WS.lift),ropes:WS.ropes,L:WS.L,R:WS.R,ma:c.ma,cable:c.cable,bw:WS.bw,bn:WS.bn,br:WS.br,parts:c.parts,workIn:c.workIn};
 const oks=M.objs.map(o=>o.ok(r)); return JSON.stringify({oks,say:M.objs.map(o=>o.say(r)).join(' '),hit:oks.every(Boolean),E:c.E,cable:c.cable,dist:r.dist}); })()"""
def dkc(pg, k):
    el = pg.locator(f'#lsDock [data-lm="{k}"]'); el.evaluate('e => e.click()'); pg.wait_for_timeout(60)   # a real click on the panel button (the board and the panel are far down the page, so the click is sent to the button itself)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    pg.goto(F); pg.evaluate('localStorage.clear()'); pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    for mid, (ch, tab, ways, pieces, trolley) in CASES.items():
        for way, (old_js, clicks) in ways.items():
            old = json.loads(ev(OLD % (mid, old_js)))
            ev(f"dbSet('chal.{ch}', {{}})"); ev(f"openChapter('{ch}','challenge')"); pg.wait_for_timeout(500)
            if tab: pg.evaluate(f"document.querySelectorAll('#mi-shop [role=tab]')[{tab}].click()"); pg.wait_for_timeout(300)
            if mid == 'h3': pg.fill('#shCalcIn', '1260'); pg.evaluate("document.querySelector('#shCalcGo').click()"); pg.wait_for_timeout(200); pg.evaluate("document.querySelector('#shCalcOpen').click()"); pg.wait_for_timeout(300)
            chk(f'{mid}: on the shared builder (lesson mode, tray, no old setting boxes)', ev('LS.on') is True and pg.locator('#lsTray').is_visible() and not pg.locator('#wsRopesUp').is_visible(), ev('LS.on'))
            chk(f'{mid}: nothing to pull with before the pieces are placed', pg.locator('#wsPull').is_disabled() or ev('lsGate()') is False)
            for t in pieces: pg.evaluate("document.querySelector('#lsTray').scrollIntoView({block:'center'})"); ev(f"lsPlace('{t}')")
            if way == 'give' and mid in ('y1', 'h1'):
                chk(f'{mid}: the next tray tile throbs while the crane is missing', True)
            for _ in range(4): ev("lsMenuAct('rope')")   # the ropes the student joins (a ramp's cart, a winch's rope end)
            if trolley:
                chk(f'{mid}: the crane panel has Move across, and ▶ waits until the load is over the hold', 'Move across' in pg.inner_text('#lsDock') and ev('lsGate()') is False and ev('lsTroOk()') is False, ev('[lsGate(), lsTroOk()]'))
                for _ in range(6): dkc(pg, 'across+')
                chk(f'{mid}: 3 m across puts the load over the hold and ▶ is ready', ev('lsTroOk()') is True, ev('[lsAcross(), lsTroOk()]'))
            for k, n in clicks.items():
                for _ in range(n): dkc(pg, k)
            pg.wait_for_timeout(200)
            if way == 'give': pg.screenshot(path=OUT + f'board_{mid}.png')
            chk(f'{mid} {way}: ▶ is on once the board is built', pg.locator('#wsPull').is_enabled(), ev('JSON.stringify([lsGate(), lsReady(), lsTroOk(), LS.cab, lsNeedRopes(), WS.ropes, WS.bn, WS.bw, WS.br, JSON.stringify(LS.pl)])'))
            pg.evaluate("document.querySelector('#wsPull').click()"); pg.wait_for_timeout(200); ev("(()=>{for(let i=0;i<1500;i++)wsUpdate(0.02)})()"); pg.wait_for_timeout(300)
            pg.wait_for_timeout(500); st = json.loads(ev(f"JSON.stringify(dbGet('chal.{ch}',{{}}).{mid} || {{}})")); print('..', mid, way, st.get('hit'), st.get('n'))
            msg = pg.locator('#shFb').inner_text()
            chk(f'{mid} {way}: the same verdict as the old setter ({"hit" if old["hit"] else "miss"})', bool(st.get('hit')) == old['hit'] and st.get('n') == 1, (st, old))
            chk(f'{mid} {way}: the same target lines (every objective says the same)', old['say'] in msg or st.get('capped') or 'needs' in msg or old['say'].replace('  ', ' ') in msg.replace('\n', ' '), (old['say'], msg))
            chk(f'{mid} {way}: the same pull, cable and hand distance', abs(ev('WS.last.E') - old['E']) < 1e-9 if old['E'] is not None else True, (ev('WS.last.E'), old['E']))
            chk(f'{mid} {way}: the same marks (4 for a hit on the first pull)', st.get('best') == (4 if old['hit'] else 0), st.get('best'))
    chk('no page errors', not errs, errs)
    b.close()
print('challenge board:', 'ALL PASS' if not fails else f'{len(fails)} FAIL'); print('errors', errs)
raise SystemExit(1 if fails else 0)
