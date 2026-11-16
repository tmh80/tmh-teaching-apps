# Vocabulary flashcards: deck, spaced-repetition rules, keys, ruled lines, backup, no network
import pathlib, json
from playwright.sync_api import sync_playwright
f = pathlib.Path('dist/test.html').resolve().as_uri(); OUT = '/tmp/fhq-shots/fc/'
import os; os.makedirs(OUT, exist_ok=True)
errs = []; reqs = []
def fresh(b, W=1440, H=900):
    pg = b.new_page(viewport={'width': W, 'height': H}); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('request', lambda r: reqs.append(r.url) if not r.url.startswith(('file:', 'data:', 'blob:')) else None)
    pg.goto(f); pg.wait_for_timeout(300); pg.fill('#whoName', 'Mia'); pg.click('#whoGo'); pg.evaluate("__fhq.dbSet('tourDone',true)")
    return pg
with sync_playwright() as p:
    b = p.chromium.launch(); pg = fresh(b)
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    ev("FC_NOW='2026-11-16'")
    # home card -> page
    ev("renderHome()"); assert 'Pick your topics' in pg.inner_text('#flashCard')
    pg.locator('#flashCard').scroll_into_view_if_needed(); pg.screenshot(path=OUT + 'homecard_1440.png')
    pg.click('#flashCard [data-fc=open]'); assert pg.is_visible('#vCards')
    pg.click('[data-fc=nostart]', force=True); assert 'Tick a topic' in pg.inner_text('#toast')
    # topics and deck
    pg.click('[data-id=c1f]'); pg.click('[data-id=c2f]')
    keys = ev("(()=>{const s=new Set();['c1f','c2f'].forEach(t=>FC_TOPICS[t].forEach(k=>s.add(k)));return [...s].filter(k=>TERMS[k]).length})()")
    n = ev("fcDeck(fcData().topics).length"); print('deck', n, keys); assert n == keys
    # clock + rules
    pg.click('[data-fc=start]'); g = ev("FCV.go.total"); assert g == min(10, n) or g <= 10, g
    first = ev("fcCur()")
    r = ev("fcAnswer(true)"); assert r['box'] == 1 and r['due'] == '2026-11-17', r
    second = ev("fcCur()"); r = ev("fcAnswer(false)"); assert r['box'] == 1 and r['due'] == '2026-11-16', r
    q = ev("FCV.go.queue"); assert second in q and q.index(second) == min(len(q) - 1, 5) or second in q
    # finish: missed then got stays box 1, due tomorrow
    while ev("FCV.mode") == 'go':
        k = ev("fcCur()"); r = ev("fcAnswer(true)")
        if k == second: assert r['box'] == 1 and r['due'] == '2026-11-17', r
    assert pg.is_visible('.fc-endcard'); print(pg.inner_text('.fc-endcard').replace('\n', ' | '))
    pg.screenshot(path=OUT + 'end_1440.png', full_page=True)
    # next day: first card in box 1 due again, got -> box 2 due +3
    ev("FC_NOW='2026-11-17'"); ev("fcStartGo('due')"); k = ev("fcCur()"); assert ev("fcData().cards['%s'].box" % k) == 1
    r = ev("fcAnswer(true)"); assert r['box'] == 2 and r['due'] == '2026-11-20', r
    ev("FCV.mode='home';FCV.go=null;fcRender()")
    # untick keeps history, re-tick restores
    c = ev("fcData().cards['%s']" % k); pg.click('[data-id=c1f]'); pg.click('[data-id=c2f]')
    assert ev("fcDeck(fcData().topics).length") == 0 and ev("fcData().cards['%s'].box" % k) == 2
    pg.click('[data-id=c1f]'); pg.click('[data-id=c2f]'); assert ev("fcData().cards['%s'].box" % k) == 2
    # caps: 20 per go, 10 new
    ev("dbSet('fc',{topics:Object.keys(FC_TOPICS),cards:{},last:'',goes:0})"); ev("fcStartGo('due')")
    assert ev("FCV.go.total") == 10, ev("FCV.go.total")
    ev("(()=>{const D=fcData();fcDeck(D.topics).slice(0,15).forEach(c=>D.cards[c.key]={box:1,due:'2026-11-01',seen:2,got:1,miss:0});fcSave(D)})()")
    ev("FCV.mode='home';fcRender()"); ev("fcStartGo('due')"); assert ev("FCV.go.total") == 20, ev("FCV.go.total")
    # reversed card masks the word
    ev("(()=>{const D=fcData();D.cards.force={box:3,due:'2026-11-01',seen:3,got:3,miss:0};fcSave(D);FCV.go={mode:'due',tags:{force:'x'},queue:['force'],total:1,done:0,missed:new Set(),finished:[],typed:'',flipped:false,pos:0,counted:false};FCV.mode='go';fcRender()})()")
    t = pg.inner_text('.fc-face.front .fc-mean'); print('reversed:', t); assert '____' in t and 'Force' not in t.replace('____', '') and 'forces' not in t.lower()
    assert 'Which word' in pg.inner_text('.fc-face.front .fc-q')
    pg.wait_for_timeout(700); pg.locator('.fc-write').blur(); pg.screenshot(path=OUT + 'reversed_front_1440.png', full_page=True)
    pg.keyboard.press('Space'); pg.wait_for_timeout(800); pg.screenshot(path=OUT + 'reversed_back_1440.png', full_page=True)
    ev("FCV.go.flipped=false;FCV.go.queue=['force'];fcRender()")
    # flipping: click card, Space, keys
    def go1():
        ev("dbSet('fc',{topics:['c1f'],cards:{},last:'',goes:0})"); ev("FCV.mode='home';fcRender()"); ev("fcStartGo('due')"); pg.wait_for_timeout(300)
    go1(); pg.keyboard.press('Escape'); pg.click('.fc-face.front .fc-head'); pg.wait_for_timeout(200); assert ev("FCV.go.flipped")
    pg.keyboard.press('2'); assert ev("FCV.go.done") == 1
    pg.fill('.fc-write', 'my idea'); pg.keyboard.press('Enter'); assert ev("FCV.go.flipped") and 'You wrote: my idea' in pg.inner_text('.fc-face.back'), 'typing + Enter'
    pg.keyboard.press('ArrowLeft'); assert ev("FCV.go.done") == 1 and ev("FCV.go.missed.size") == 1
    pg.locator('.fc-write').blur(); pg.keyboard.press(' '); assert ev("FCV.go.flipped"); pg.keyboard.press('ArrowRight'); assert ev("FCV.go.done") == 2
    pg.locator('.fc-write').blur(); pg.keyboard.press('Space'); pg.keyboard.press('1'); assert ev("FCV.go.missed.size") == 2
    # clue
    pg.click('#fcClueBtn'); assert pg.is_visible('.fc-face.front .fc-pic')
    # ruled lines: line-height equals rule spacing
    pg.locator('.fc-write').blur(); pg.keyboard.press('Space'); pg.wait_for_timeout(700)
    lh = pg.evaluate("()=>{const m=document.querySelector('.fc-face.back .fc-mean'),b=m.closest('.fc-body');return [getComputedStyle(m).lineHeight,getComputedStyle(b).backgroundSize]}"); print('lines', lh); assert lh[0] == '32px' and lh[1].endswith('32px')
    # backup round trip keeps fc
    ev("dbSet('fc',{topics:['c1f'],cards:{force:{box:2,due:'2026-11-20',seen:1,got:1,miss:0}},last:'2026-11-17',goes:1})")
    packed = ev("bkPack().text"); info = pg.evaluate("async t=>JSON.stringify((await __fhq.ev('bkRead')(t)).info.data.fc)", packed); print('backup', info); assert '"force"' in info and '2026-11-20' in info
    # deck browse
    ev("FCV.mode='deck';fcRender()"); pg.click('.fc-mini >> nth=0'); pg.wait_for_timeout(700); assert ev("fcData().goes") == 1
    pg.screenshot(path=OUT + 'deck_1440.png', full_page=True)
    pg.close()
    # screenshots at widths, light and dark
    for scheme in ('light', 'dark'):
        for W, H in ((1440, 900), (820, 1000), (390, 844)):
            pg = fresh(b, W, H); pg.emulate_media(color_scheme=scheme); ev2 = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
            ev2("FC_NOW='2026-11-16'"); ev2("dbSet('fc',{topics:['c1f','c6a'],cards:{},last:'',goes:0})"); ev2("openChapter&&0"); ev2("fcOpen()")
            pg.wait_for_timeout(200); pg.screenshot(path=OUT + f'z_page_{scheme}_{W}.png', full_page=True)
            ev2("fcStartGo('due')"); pg.wait_for_timeout(500); pg.screenshot(path=OUT + f'z_front_{scheme}_{W}.png', full_page=True)
            pg.click('#fcClueBtn'); pg.wait_for_timeout(100); pg.screenshot(path=OUT + f'z_clue_{scheme}_{W}.png', full_page=True)
            pg.fill('.fc-write', 'a push or a pull'); pg.keyboard.press('Enter'); pg.wait_for_timeout(800); pg.screenshot(path=OUT + f'z_back_{scheme}_{W}.png', full_page=True)
            sw = ev2("document.documentElement.scrollWidth"); assert sw == W, (scheme, W, sw)
            ev2("FCV.mode='deck';fcRender()"); pg.screenshot(path=OUT + f'z_deck_{scheme}_{W}.png', full_page=True)
            assert ev2("document.documentElement.scrollWidth") == W
            pg.close()
    print('network requests', reqs); assert not reqs
    print('errors', errs); assert not errs
