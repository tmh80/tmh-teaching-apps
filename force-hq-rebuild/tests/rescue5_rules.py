"""Rules of the new rescue board, checked on the test board (proto/Rescue-Core-Board.html) with the debug hook window.__board.
Run:  python3 tests/rescue5_rules.py"""
import pathlib, sys
from playwright.sync_api import sync_playwright
F = pathlib.Path('proto/Rescue-Core-Board.html').resolve().as_uri(); fails = []
def chk(n, c, x=''):
    print(('PASS ' if c else 'FAIL ') + n + (' ' + str(x) if (x and not c) else ''))
    if not c: fails.append(n)
def H(i, t, mount, to, **k): d = dict(id=i, type=t, x=0, y=0, mount=mount, to=to); d.update(k); return d
def route(r1=20):
    return [dict(id='a', type='pole', x=44, h=6), H('a1', 'winch', 'a', 'a2', ratio=r1), H('a2', 'pulley', 'a', None, ropes=4, hooked=True),
      dict(id='b', type='crane', x=45.5, lift=7, across=4.5, hooked=True), H('b1', 'winch', 'b', 'b2', ratio=16), H('b2', 'pulley', 'b', 'b', ropes=8),
      dict(id='d', type='pole', x=84, h=6), H('d1', 'winch', 'd', 'd2', ratio=20), H('d2', 'pulley', 'd', None, ropes=8, hooked=True)]
S = "()=>{const e=window.__board.ev;return {won:e.won,total:e.total,legs:e.legs.map(l=>({t:l.m.type,needs:Math.round(l.pl.needs),gives:l.gives,ok:l.ok,pull:l.pull})),st:Object.values(e.st).filter(s=>!s.ok).map(s=>s.text)}}"
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1280, 'height': 1000}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(F); pg.wait_for_timeout(300)
    pg.evaluate("p=>{window.__board.parts=p}", route()); r = pg.evaluate(S)
    chk('pull, crane, pull wins in 3 legs', r['won'] and len(r['legs']) == 3, r)
    chk('the force needed: 3,107 N dragged, 6,300 N lifted', [l['needs'] for l in r['legs']] == [3107, 6300, 3107], r['legs'])
    chk('one rule: 60 N x total MA', [round(l['gives']) for l in r['legs']] == [4800, 7680, 9600], r['legs'])
    chk('Smooshy never pulls more than 60 N here', all(l['pull'] <= 60 for l in r['legs']))
    chk('cost is 260 crystals', r['total'] == 260, r['total'])
    pg.evaluate("p=>{window.__board.parts=p}", route(8)); r = pg.evaluate(S)
    chk('too little MA on leg 1 stops the route', not r['won'] and not r['legs'][0]['ok'], r)
    pg.evaluate("p=>{window.__board.parts=p}", []); r = pg.evaluate(S); chk('an empty board has no legs', not r['won'] and not r['legs'])
    chk('no page errors', not errs, errs[:3]); b.close()
print('FAILS', fails); sys.exit(1 if fails else 0)
