"""calcorder ("Work it out, then order"): marking, error carried forward, shuffled rows, one go, save and reload, worksheet, answer key text.
Run after build.py: python3 tests/calcorder.py"""
import json, pathlib
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); fails = []
def chk(n, c, x=''):
    print(('PASS ' if c else 'FAIL ') + n + (' ' + str(x) if (x and not c) else '')); c or fails.append(n)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 1000}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(F); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    Q = "CHDATA.c5.review.find(q=>q.id==='c5r11')"
    # scoring rules (the function the sim uses)
    sc = lambda vals, ord_: json.loads(ev(f"JSON.stringify((()=>{{const s=coScore({Q},{json.dumps(vals)},{json.dumps(ord_)});return [s.calc,s.order,s.total]}})())"))
    ok = [56, 64, 148, 356, 392, 992]; asc = [0, 1, 2, 3, 4, 5]
    chk('all right + right order = 5', sc(ok, asc) == [3, 2, 5], sc(ok, asc))
    v = ok[:]; v[5] = 900; chk('one wrong value, right order = 2 + 2', sc(v, asc) == [2, 2, 4], sc(v, asc))
    v = ok[:]; v[0] = 1000; chk('one wrong value that changes the order: own order accepted = 2 + 2', sc(v, [1, 2, 3, 4, 5, 0]) == [2, 2, 4], sc(v, [1, 2, 3, 4, 5, 0]))
    v = ok[:]; v[0] = 1000; chk('one wrong value, order not matching either = 2 + 0', sc(v, [5, 4, 3, 2, 1, 0]) == [2, 0, 2], sc(v, [5, 4, 3, 2, 1, 0]))
    v = ok[:]; v[0] = 1; v[1] = 1; chk('four right = 2', sc(v, asc)[0] == 2)
    v = [56, 64, 1, 1, 1, 1]; chk('two right = 1', sc(v, asc)[0] == 1)
    v = [56, 1, 1, 1, 1, 1]; chk('one right = 0', sc(v, asc)[0] == 0)
    chk('neighbours swapped, right values = 3 + 1 only when own values disagree', sc(ok, [1, 0, 2, 3, 4, 5]) == [3, 1, 4], sc(ok, [1, 0, 2, 3, 4, 5]))
    chk('all values the same cannot earn the order marks', sc([5] * 6, [3, 1, 4, 0, 5, 2])[1] == 0)
    chk('tolerance 0.5 N is accepted', sc([56.4, 64, 148, 356, 392, 992], asc)[0] == 3)
    chk('qMarks is 5', ev(f"qMarks({Q})") == 5); chk('QMIN has the type', ev("QMIN.calcorder") == 3)
    # in the sim
    def openCheck():
        pg.evaluate("__fhq.openChapter('c5x','review')"); pg.wait_for_timeout(500)
        ca = pg.get_by_text('Continue anyway')
        if ca.count() and ca.first.is_visible(): ca.first.click(); pg.wait_for_timeout(400)
    openCheck(); R = pg.locator('#rq-c5r11'); R.scroll_into_view_if_needed()
    rows = [int(x) for x in R.locator('.cotbl tr[data-it]').evaluate_all("r=>r.map(e=>e.dataset.it)")]
    chk('table rows are never in sorted order', rows != sorted(rows) and rows != sorted(rows, reverse=True), rows)
    cards = [int(x) for x in R.locator('.ordcard').evaluate_all("r=>r.map(e=>e.dataset.it)")]; chk('cards start shuffled too', cards != sorted(cards), cards)
    R.locator('.qchk').click(); pg.wait_for_timeout(100)
    chk('blank boxes: asks for numbers, stays unlocked', 'number in every box' in R.locator('.fb').inner_text() and R.locator('.ptsb').count() == 0)
    for it in range(6): R.locator(f'.coin[data-it="{it}"]').fill(str(ok[it] if it != 2 else 150))   # Mars 150 N: wrong (148)
    pg.reload(); pg.wait_for_timeout(500); openCheck(); R = pg.locator('#rq-c5r11'); R.scroll_into_view_if_needed()
    chk('typed values are saved before checking', R.locator('.coin[data-it="2"]').input_value() == '150', R.locator('.coin[data-it="2"]').input_value())
    for want in range(6):   # arrange the cards in the right order
        while True:
            cur = [int(x) for x in R.locator('.ordcard').evaluate_all("r=>r.map(e=>e.dataset.it)")]; j = cur.index(want)
            if j == want: break
            R.locator('.ordcard').nth(j).locator('[data-mv="-1"]').click()
    R.locator('.qchk').click(); pg.wait_for_timeout(150)
    pts = R.locator('.ptsb').first.inner_text().strip(); chk('Mars 150 wrong, order right: 4 of 5', pts == '4 of 5 points', pts)
    chk('correct value shown beside the wrong box', '148' in R.locator('.cotbl').inner_text())
    chk('correct order shown underneath', 'Correct order' in R.inner_text() and 'Titan, The Moon, Mars, Venus, Earth, Jupiter' in R.inner_text())
    chk('the after sentence shows', 'thicker air than Earth' in R.locator('.fb').inner_text())
    chk('inputs and button locked', R.locator('.coin').first.is_disabled() and R.locator('.qchk').is_hidden())
    pg.reload(); pg.wait_for_timeout(500); openCheck(); R = pg.locator('#rq-c5r11')
    chk('still locked with the same points after a reload', R.locator('.ptsb').first.inner_text().strip() == '4 of 5 points')
    # the paper worksheet, blank template and answer key
    stu = pg.evaluate("__fhq.buildWorksheet('c5x','student')"); blank = pg.evaluate("__fhq.buildWorksheet('c5x','blank')"); key = pg.evaluate("__fhq.buildWorksheet('c5x','key')")
    chk('student sheet has the typed 150 N in blue', 'class="stu">150 N' in stu, '150 N' in stu)
    chk('blank template has the table and no answers', 'Weight of the crate (N)' in blank and not any(f'{w} N' in blank for w in ['56', '64', '148', '356', '392', '992']))
    chk('answer key has all six weights', all(f'{w} N' in key for w in ['56', '64', '148', '356', '392', '992']))
    mi = ev(f"markItem({Q}, 3)"); chk('marking line has values, order and the rule', '992' in mi and 'Error carried forward' in mi and '3 marks' in mi, mi[:120])
    # no other question that names a world is missing its g
    for qid, need in [('c5r10', 'g = 1.6 N/kg'), ('c5r8', 'g = 24.8')]: chk(qid + ' gives g', need in ev(f"CHDATA.c5.review.find(q=>q.id==='{qid}').p"))
    chk('Learn q4 (Ana) gives g', 'g = 1.6 N/kg' in ev("CHDATA.c5.steps.find(s=>s.id==='p2').qs.find(q=>q.id==='q4').p"))
    chk('world info card has the six-world table', all(f'<td>{n}</td>' in ev("INFO.dworld.cards[0].html") for n in ['Earth', 'Moon', 'Mars', 'Venus', 'Titan', 'Jupiter']))
    print('errors', errs); chk('no page errors', not errs, errs); b.close()
raise SystemExit(1 if fails else 0)
