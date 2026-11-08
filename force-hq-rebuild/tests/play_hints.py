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
    ev("(()=>{GLB.rig.parts.push({type:'ramp',id:glNewId('ramp'),x1:16,y1:0,L:24,rise:6});glChanged();})()"); pg.wait_for_timeout(150)
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
    pg.reload(); pg.wait_for_timeout(400); chk('hint count survives a reload', ev("(dbGet('chal.c6e',{}).gl||{}).hints") == 3)
    chk('no page errors', not errs, errs)
print('FAILS: ' + str(fails) if fails else 'all passed')
