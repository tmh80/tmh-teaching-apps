"""Part 5 hint tree: tiers, spending (first free, then -1, re-reading is free), the student's own numbers, Reminders above "Do this".
Run after build.py:  python3 tests/play_hints.py"""
import pathlib
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); fails = []
def chk(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (' ' + str(extra) if (extra and not cond) else ''))
    if not cond: fails.append(name)
g = pathlib.Path('src/js/40-guided.js').read_text(); c = pathlib.Path('src/js/45-challenge.js').read_text()
chk('guided pages put Reminders above Do this', g.index('remindersHTML()') < g.index('>Do this<'))
chk('shop course puts Reminders first in the card', c.index("card.innerHTML = `${remindersHTML()}") > 0)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1300, 'height': 950}); errs = []
    pg.on('pageerror', lambda e: errs.append('ERR ' + str(e)))
    ev = lambda code: pg.evaluate('c=>__fhq.ev(c)', code)
    pg.goto(F); pg.wait_for_timeout(300); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    ev('DB.user.teacher=true'); pg.evaluate("__fhq.openChapter('c6e','challenge')"); pg.wait_for_timeout(500); ev('closeModal()'); pg.wait_for_timeout(200)
    chk('Reminders sit at the top of the Part 5 card', pg.evaluate("document.querySelector('#mi-gl').firstElementChild.classList.contains('remind')"))
    ev("(()=>{const id=glNewId('ramp'); GLB.rig.parts.push({type:'ramp',id:id,x1:15.5,y1:0,L:24,rise:6}); GLB.rig.cables.push({a:id,b:'ship'},{a:id,b:'zb'},{a:'zb',b:'zw'}); GLB.rig.parts.push({id:'zb',type:'block',ropes:4},{id:'zw',type:'winch',ratio:7}); GLB.rig.parts.push({id:'bl',type:'lever',role:'boulder',x:19,arm:1,rise:0.5,dir:1},{id:'blw',type:'winch',ratio:2},{id:'bc',type:'crane',role:'boulder',x:18.7,rise:6,across:-8,adir:-1,on:'ground'},{id:'bcw',type:'winch',ratio:6}); GLB.rig.cables.push({a:'bl',b:'blw'},{a:'bc',b:'bcw'}); glChanged();})()"); pg.wait_for_timeout(150)
    key = ev("glwRows().find(r=>r.key.startsWith('L:')).key")
    pg.locator('#glStrip').scroll_into_view_if_needed()
    chk('no hints used yet', ev('glState().hints||0') == 0 and 'first is free' in pg.inner_text('#glwHints'))
    pg.click(f'[data-r="{key}"] [data-glw="hint:{key}"]'); chk('opening the hint box spends nothing', ev('glState().hints||0') == 0)
    pg.click(f'[data-glw="spend:{key}:1"]'); t = pg.inner_text(f'[data-r="{key}"] .glw-hint')
    chk('tier 1 spends one hint and shows formulas, no answers', ev('glState().hints') == 1 and 'Ramp MA = length ÷ rise' in t and '24 ÷ 6' not in t, t[:200])
    pg.click(f'[data-glw="spend:{key}:2"]'); t = pg.inner_text(f'[data-r="{key}"] .glw-hint')
    chk('tier 2 costs 1 more and plugs in this rig with a blank', ev('glState().hints') == 2 and '24 ÷ 6' in t and pg.locator(f'[data-r="{key}"] .glw-hint .blank').count() >= 1, t[:300])
    pg.click(f'[data-glw="spend:{key}:3"]'); chk('tier 3 worked example uses different numbers and costs 1 more', '5 × 3 × 4' in pg.inner_text(f'[data-r="{key}"] .glw-hint') and ev('glState().hints') == 3)
    pg.click(f'[data-r="{key}"] [data-glw="hint:{key}"]'); pg.click(f'[data-r="{key}"] [data-glw="hint:{key}"]'); chk('re-opening a hint is free', ev('glState().hints') == 3)
    chk('the hint count reaches the score rule', ev('glScore({arrived:true,hardest:50,rockOn:false,dmg:{total:0},boulder:{ok:true},hand:1,cost:{total:0}},glState().hints,true).hintCost') == 2)
    # a leg with a drag in it (a winch post): GASA gives the force, and the hints are force ÷ MA
    ev("(()=>{GLB.rig={v:2,parts:[{id:'pb',type:'block',ropes:4,x:77,y:9},{id:'pw1',type:'winch',ratio:10,x:79,y:9},{id:'pw2',type:'winch',ratio:10,x:81,y:9}],cables:[{a:'ship',b:'pb'},{a:'pb',b:'pw1'},{a:'pw1',b:'pw2'}]}; glChanged();})()"); pg.wait_for_timeout(200)
    row = ev("JSON.stringify(glwRows().map(r=>({key:r.key,given:!!r.given,cells:r.cells.map(c=>c.k)})))"); import json as _j; row = _j.loads(row)
    chk('a winch post leg is a given-force row asking for rope MA, pull and hand distance only', len(row) >= 1 and row[0]['given'] and row[0]['cells'][-3:] == ['tot', 'pull', 'hand'] and 'work' not in row[0]['cells'] and 'mach' not in row[0]['cells'], row)
    k2 = row[0]['key']; pg.locator('#glStrip').scroll_into_view_if_needed()
    chk('the strip gives the force and the distance and the work', 'Dragging here needs' in pg.inner_text(f'[data-r="{k2}"]') and ' N over ' in pg.inner_text(f'[data-r="{k2}"]') and 'worked out the work' in pg.inner_text(f'[data-r="{k2}"]'), pg.inner_text(f'[data-r="{k2}"]')[:300])
    pg.click(f'[data-r="{k2}"] [data-glw="hint:{k2}"]'); pg.click(f'[data-glw="spend:{k2}:1"]'); t = pg.inner_text(f'[data-r="{k2}"] .glw-hint')
    chk('drag leg tier 1: pull = force ÷ mechanical advantage', 'pull = force ÷ mechanical advantage' in t.replace('Smooshy\'s ', ''), t[:300])
    pg.click(f'[data-glw="spend:{k2}:2"]'); t = pg.inner_text(f'[data-r="{k2}"] .glw-hint')
    chk('drag leg tier 2: the leg\'s own force with blanks', ' ÷ ' in t and 'Rope MA' in t and pg.locator(f'[data-r="{k2}"] .glw-hint .blank').count() >= 2, t[:300])
    pg.click(f'[data-glw="spend:{k2}:3"]'); t = pg.inner_text(f'[data-r="{k2}"] .glw-hint')
    chk('drag leg tier 3: a worked example with different numbers', '1,000 N' in t and '= 20' in t, t[:300])
    pg.reload(); pg.wait_for_timeout(400); chk('hint count survives a reload', ev("(dbGet('chal.c6e',{}).gl||{}).hints") == 6)
    chk('no page errors', not errs, errs)
print('FAILS: ' + str(fails) if fails else 'all passed')
