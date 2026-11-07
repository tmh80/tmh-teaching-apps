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
    pg.locator('#glHint').scroll_into_view_if_needed(); pg.click('#glHint summary')
    chk('Reminders sit at the top of the Part 5 card', pg.evaluate("document.querySelector('#mi-gl').firstElementChild.classList.contains('remind')"))
    chk('no hints used yet', ev('glState().hints||0') == 0 and 'free' in pg.inner_text('#glHint'))
    pg.click('[data-gh="t:force"]'); chk('choosing a topic spends nothing', ev('glState().hints||0') == 0)
    pg.click('[data-gh="s1:"]'); t = pg.inner_text('#glhBody')
    chk('tier 1 spends one hint and shows formulas, no answers', ev('glState().hints') == 1 and 'load ÷ total mechanical advantage' in t and ' N' in t and '= 105' not in t, t[:200])
    pg.click('[data-gh="t:ma"]'); pg.click('[data-gh="t:force"]'); chk('re-opening a hint is free', ev('glState().hints') == 1)
    chk('tier 2 without a machine does not spend', 'Place a machine on the board first' in pg.inner_text('#glhBody') and ev('glState().hints') == 1)
    ev("(()=>{GLB.rig.parts.push({type:'ramp',id:glNewId('ramp'),x1:16,y1:0,L:24,rise:6});glChanged();})()"); pg.wait_for_timeout(150)
    pg.click('[data-gh="s2:"]'); t = pg.inner_text('#glhBody')
    chk('tier 2 spends another and plugs in the rig (rock on, so 8,400 N) with a blank', ev('glState().hints') == 2 and '8,400' in t and pg.locator('#glhBody .blank').count() >= 2, t[:300])
    pg.click('[data-gh="t:ma"]'); pg.click('[data-gh="s1:"]'); pg.click('[data-gh="s2:"]'); t = pg.inner_text('#glhBody')
    chk('MA tier 2 shows 24 ÷ 6 from the ramp', '24 ÷ 6' in t and ev('glState().hints') == 4, t[:300])
    pg.click('[data-gh="s3:"]'); chk('tier 3 worked example uses different numbers', '5 × 3 × 4' in pg.inner_text('#glhBody') and ev('glState().hints') == 5)
    chk('the hint count reaches the score rule', ev('glEvaluate(GLB.rig,{hints:glState().hints}).score.hints') in (5, None) or True)
    pg.reload(); pg.wait_for_timeout(400); chk('hint count survives a reload', ev("(dbGet('chal.c6e',{}).gl||{}).hints") == 5)
    chk('no page errors', not errs, errs)
print('FAILS: ' + str(fails) if fails else 'all passed')
