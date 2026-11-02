"""Fails if any Check question has no MYP obj tag; prints each sheet's strands for comparison with the spec table (6a)."""
import pathlib, sys, json
from playwright.sync_api import sync_playwright
F = pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'test.html'
EXPECT = {'c1f': 'A i, ii', 'c1x': 'A i, ii', 'c2f': 'A i, ii, iii', 'c2x': 'A i, ii, iii · D i, iii', 'c3f': 'A i, ii',
          'c3x': 'A ii, iii', 'c4f': 'A i, ii', 'c4x': 'A ii, iii · D i, iii', 'c5f': 'A i, ii, iii', 'c5x': 'A ii, iii · D i, iii', 'c6a': 'A i, ii, iii', 'c6b': 'A i, ii, iii', 'c6c': 'A ii, iii', 'c6d': 'A i, ii'}
bad = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto(F.as_uri()); pg.wait_for_timeout(300)
    data = pg.evaluate("""__fhq.ev('JSON.stringify(SECTIONS.map(s=>({id:s.id,qs:CHDATA[s.id].review.map(q=>({id:q.id,obj:q.obj||null})),short:strandsShort(sheetStrands(s.id))})))')""")
    data = json.loads(data)
    valid = {'Ai', 'Aii', 'Aiii', 'Di', 'Dii', 'Diii'}
    for s in data:
        for q in s['qs']:
            if not q['obj'] or any(o not in valid for o in q['obj']): bad.append(f"{s['id']} {q['id']} has no valid obj: {q['obj']}")
        ok = EXPECT.get(s['id']) == s['short']
        print(s['id'], s['short'], 'OK' if ok else 'DIFFERS from table: ' + str(EXPECT.get(s['id'])))
        if not ok: bad.append(f"{s['id']} strands {s['short']} != {EXPECT.get(s['id'])}")
    # strands never on student or blank sheets
    for c in [s['id'] for s in data]:
        for mode in ('student', 'blank'):
            html = pg.evaluate(f"__fhq.ev('wsSheetHTML(\"{c}\",\"{mode}\")')")
            if 'MYP' in html: bad.append(f'{c} {mode} sheet shows MYP')
        for mode in ('key', 'scheme'):
            html = pg.evaluate(f"__fhq.ev('wsSheetHTML(\"{c}\",\"{mode}\")')")
            if 'MYP' not in html: bad.append(f'{c} {mode} sheet has no MYP tag')
    b.close()
print('errors', errs + bad)
sys.exit(1 if errs or bad else 0)
