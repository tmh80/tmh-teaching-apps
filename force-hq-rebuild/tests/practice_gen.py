"""Maths Gym question generator (prGen, 66-practice-gen.js): 3,000 questions per level for each opts combination.
Every answer is recomputed here in Python from the numbers stated in the question (q.given). Run after build.py: python3 tests/practice_gen.py"""
import pathlib, json, math, re
from playwright.sync_api import sync_playwright
F = pathlib.Path('dist/test.html').resolve().as_uri(); fails = []
N = 3000
def chk(n, c, x=''):
    print(('PASS ' if c else 'FAIL ') + n + (' ' + str(x)[:600] if (x and not c) else '')); c or fails.append(n)

def show(v):   # how a stated number appears in the question: up to 4 dp, no trailing zeros, commas from 1,000
    s = f'{v:.4f}'.rstrip('0').rstrip('.'); i, _, d = s.partition('.')
    if len(i) > 3: i = f'{int(i):,}'
    return i + ('.' + d if d else '')

def exact(kind, find, g):
    G = g.get('g', 9.8)
    if kind in ('findF', 'findFbrake', 'decF'): return g['m'] * g['a']
    if kind in ('findA', 'findAbrake', 'decA'): return g['F'] / g['m']
    if kind in ('findM', 'decM'): return g['F'] / g['a']
    if kind in ('fricA', 'oppA'): return (g['P'] - g['f']) / g['m']
    if kind == 'fricM': return (g['P'] - g['f']) / g['a']
    if kind == 'needPull': return g['m'] * g['a'] + g['f']
    if kind == 'findFric': return g['P'] - g['m'] * g['a']
    if kind in ('weightF', 'worldF'): return g['W'] / G * g['a']
    if kind in ('weightA', 'worldA'): return g['F'] / (g['W'] / G)
    if kind == 'dvF': return g['m'] * (g['v'] - g['u']) / g['t']
    if kind == 'dvM': return g['F'] / ((g['v'] - g['u']) / g['t'])
    if kind == 'brakeDv': return g['m'] * (g['u'] - g['v']) / g['t']
    if kind == 'engine': return g['m'] * (g['v'] - g['u']) / g['t'] + g['f']
    if kind == 'weightFric': return (g['P'] - g['f']) / (g['W'] / G)
    if kind == 'fall': return (g['m'] * G - g['f']) / g['m']
    if kind == 'compare': return abs(g['FA'] / g['mA'] - g['FB'] / g['mB'])
    if kind == 'massDv': return (g['P'] - g['f']) / ((g['v'] - g['u']) / g['t'])
    if kind == 'unitsG': m = g['mg'] / 1000; return m * g['a'] if find == 'F' else g['F'] / m
    if kind == 'unitsT': m = g['mt'] * 1000; return m * g['a'] if find == 'F' else g['F'] / m
    raise KeyError(kind)

def tol_of(v, dp): return max(0.5 / 10 ** dp, abs(v) * 0.01 if abs(v) >= 1000 else 0)

# one in-page pass per level: compact summaries plus the text checks that need the page (prMatchTrap, determinism)
JS = r"""(()=>{ const L = %d, O = %s, out = [];
  for (let s = 0; s < %d; s++) {
    const q = prGen(L, s, O), j = JSON.stringify(q), again = JSON.stringify(prGen(L, s, O));
    const txt = [q.p, q.work].concat(q.hints, q.traps.map(t => t.say)).join(' | ');
    out.push({ k: q.kind, f: q.find, g: q.given, a: q.ans, d: q.dp, t: q.tol, u: q.unit, th: q.thing, w: q.world, u2: q.units2, st: q.steps, p: q.p,
      tr: q.traps.map(t => [t.ans, t.key, t.tol]), bad: /NaN|undefined|null|Infinity|\[object/.test(txt), speed: /speed/i.test(txt), wletter: /\bW\b/.test(txt),
      same: j === again, match: q.traps.every(t => prMatchTrap(q, t.ans) === t && prMatchTrap(q, String(t.ans)) === t), rightNull: prMatchTrap(q, q.ans) === null && prMatchTrap(q, q.ansText) === null,
      nh: q.hints.length, wl: q.workLines.length, step1: q.steps < 2 || /^Step 1/.test(q.hints[0]) || /Step 1/.test(q.hints[0]), workSteps: q.steps < 2 || q.workLines.some(x => /^Step 2:/.test(x)),
      leak: q.hints[2].includes(q.ansText + ' ' + q.unit), pic: q.pic && q.pic.thing === q.thing && Array.isArray(q.pic.arrows), arrows: q.pic.arrows.length,
      num: q.type === 'num' && q.ladder === true && q.units.join() === 'N,kg,m/s,m/s²' && q.id === 'pr' + L + '_' + s });
  }
  return out; })()"""

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(F); pg.wait_for_timeout(400); pg.fill('#whoName', 'Sam'); pg.click('#whoGo')
    ev = lambda c: pg.evaluate("c=>__fhq.ev(c)", c)
    things = {t['key']: t for t in ev("PR_THINGS")}
    kinds = ev("Object.fromEntries(Object.entries(PR_KINDS).map(([k, v]) => [k, {level: v.level, gate: v.gate || null, steps: v.steps}]))")
    WORLDS = {'moon': 1.6, 'mars': 3.7, 'venus': 8.9, 'titan': 1.4, 'jupiter': 24.8}
    chk('about 30 objects in PR_THINGS', 28 <= len(things) <= 34, len(things))
    chk('every object has the fields', all(all(f in t for f in ('key', 'name', 'pic', 'm', 'a', 'push')) and t['m'][0] < t['m'][1] and t['a'][0] < t['a'][1] for t in things.values()))
    for lv in range(1, 7):
        n_lv = sum(1 for k in kinds.values() if k['level'] == lv)
        chk(f'level {lv}: 2 or more kinds', n_lv >= 2, n_lv)
    COMBOS = [('{}', {}), ('worlds', {'worlds': True}), ('units', {'units': True}), ('both', {'worlds': True, 'units': True})]
    sample_json = {}
    for name, O in COMBOS:
        for lv in range(1, 7):
            R = ev(JS % (lv, json.dumps(O), N)); tag = f'L{lv} {name}'
            P = {k: [] for k in ('wrong', 'unreal', 'whole', 'round', 'bad', 'speed', 'trap', 'gate', 'same', 'match', 'shown', 'hints', 'steps', 'leak', 'pic', 'num', 'wletter', 'trapsome')}
            seen = set()
            for i, r in enumerate(R):
                k, g, a, dp, tol = r['k'], r['g'], r['a'], r['d'], r['t']; seen.add(k)
                kd = kinds[k]
                if kd['level'] != lv: P['gate'].append((i, k, 'level'))
                if kd['gate'] and not O.get(kd['gate']): P['gate'].append((i, k))
                if r['w'] and not O.get('worlds'): P['gate'].append((i, k, 'world'))
                if r['u2'] and not O.get('units'): P['gate'].append((i, k, 'units2'))
                # the answer, recomputed from the stated numbers, rounded as asked
                G = dict(g);
                if r['w']: chk_g = WORLDS[r['w']]; G['g'] = G.get('g', chk_g)
                if r['w'] and abs(G['g'] - WORLDS[r['w']]) > 1e-9: P['wrong'].append((i, 'world g', G['g']))
                if not r['w'] and 'g' in G and G['g'] != 9.8: P['wrong'].append((i, 'earth g', G['g']))
                e = exact(k, r['f'], G); want = round(e, dp)
                if abs(want - a) > 1e-9 or abs(e - a) > tol + 1e-9: P['wrong'].append((i, k, g, e, a, dp))
                if abs(tol - tol_of(a, dp)) > 1e-9: P['wrong'].append((i, 'tol', tol, tol_of(a, dp)))
                # realistic
                u = r['u']
                if u == 'm/s²' and not (0.05 <= a <= 400): P['unreal'].append((i, k, a, u))
                if u == 'N' and not (0.01 <= a <= 200000): P['unreal'].append((i, k, a, u))
                if u == 'kg':
                    lo, hi = things[r['th']]['m']
                    if not (lo <= a <= hi): P['unreal'].append((i, k, r['th'], a))
                for mk in ('m', 'mA', 'mB'):   # stated masses sit in the object's range
                    if mk in g:
                        th = things[g['thing2']] if mk == 'mB' else things[r['th']]
                        if not (th['m'][0] <= g[mk] <= th['m'][1]): P['unreal'].append((i, k, mk, g[mk], th['key']))
                if 'mg' in g and not (things[r['th']]['m'][0] * 1000 <= g['mg'] <= things[r['th']]['m'][1] * 1000): P['unreal'].append((i, 'mg', g['mg']))
                if 'mt' in g and not (things[r['th']]['m'][0] / 1000 - 1e-9 <= g['mt'] <= things[r['th']]['m'][1] / 1000 + 1e-9): P['unreal'].append((i, 'mt', g['mt']))
                if 'W' in g:
                    mm = g['W'] / G['g']; lo, hi = things[r['th']]['m']
                    if not (lo <= mm <= hi): P['unreal'].append((i, 'mass from weight', mm))
                if 't' in g and not (0.05 <= g['t'] <= 120): P['unreal'].append((i, 't', g['t']))
                for fk in ('F', 'P', 'f', 'W', 'FA', 'FB'):   # stated forces are readable sizes
                    if fk in g and not (0.01 <= g[fk] <= 200000): P['unreal'].append((i, k, fk, g[fk]))
                if lv >= 2 and abs(a - round(a)) < 1e-9: P['whole'].append((i, k, a))
                if lv >= 2 and f'Give your answer to {dp} decimal place' not in r['p']: P['round'].append((i, r['p']))
                if r['bad']: P['bad'].append((i, r['p']))
                if r['speed']: P['speed'].append((i, r['p']))
                if r['wletter']: P['wletter'].append(i)
                if not r['same']: P['same'].append(i)
                if not (r['match'] and r['rightNull']): P['match'].append(i)
                if r['nh'] != 3 or r['wl'] < 2: P['hints'].append(i)
                if not (r['step1'] and r['workSteps']) or r['st'] != kd['steps']: P['steps'].append((i, k))
                if r['leak']: P['leak'].append(i)
                if not r['pic'] or (r['arrows'] and r['arrows'] < 2): P['pic'].append(i)
                if not r['num']: P['num'].append(i)
                if r['tr']: P['trapsome'].append(i)
                for nk, v in g.items():   # every stated number is in the question exactly as written
                    if nk in ('thing2', 'g') or isinstance(v, str): continue
                    if show(v) not in r['p'] and not (nk == 'u' and v == 0 and 'from still' in r['p']) and not (nk == 'v' and v == 0 and 'comes to a stop' in r['p']): P['shown'].append((i, nk, v, r['p'])); break
                if 'g' in g and show(G['g']) not in r['p']: P['shown'].append((i, 'g', r['p']))
                vals = [(x[0], x[2]) for x in r['tr']]
                for j, (tv, tt) in enumerate(vals):
                    if abs(tv - a) <= max(tol, tt) or any(abs(tv - vals[m][0]) <= max(tt, vals[m][1]) for m in range(j)): P['trap'].append((i, k, a, r['tr'])); break
            want_kinds = {kk for kk, v in kinds.items() if v['level'] == lv and (not v['gate'] or O.get(v['gate']))}
            chk(f'{tag}: every kind appears', seen == want_kinds, (sorted(seen), sorted(want_kinds)))
            chk(f'{tag}: answers recomputed from the stated numbers are right and rounded as asked', not P['wrong'], P['wrong'][:3])
            chk(f'{tag}: answers and givens are realistic', not P['unreal'], P['unreal'][:3])
            if lv >= 2: chk(f'{tag}: no whole-number answers', not P['whole'], P['whole'][:3])
            if lv >= 2: chk(f'{tag}: the question states the rounding', not P['round'], P['round'][:2])
            chk(f'{tag}: every stated number shown exactly', not P['shown'], P['shown'][:2])
            chk(f'{tag}: no NaN/undefined/null in any text', not P['bad'], P['bad'][:2])
            chk(f'{tag}: never "speed"; no letter W', not P['speed'] and not P['wletter'], (P['speed'][:2], P['wletter'][:3]))
            chk(f'{tag}: traps differ from the answer and each other', not P['trap'], P['trap'][:3])
            chk(f'{tag}: most questions have a trap', len(P['trapsome']) > 0.9 * N, len(P['trapsome']))
            chk(f'{tag}: prMatchTrap finds each trap, never the right answer', not P['match'], P['match'][:5])
            chk(f'{tag}: worlds/units only when allowed', not P['gate'], P['gate'][:3])
            chk(f'{tag}: same seed gives the same question', not P['same'], P['same'][:5])
            chk(f'{tag}: 3 hints, step names, worked answer, hint 3 never gives the answer', not P['hints'] and not P['steps'] and not P['leak'], (P['hints'][:3], P['steps'][:3], P['leak'][:3]))
            chk(f'{tag}: num question shape and picture', not P['num'] and not P['pic'], (P['num'][:3], P['pic'][:3]))
            sample_json[(name, lv)] = ev(f"JSON.stringify([0, 17, 999, 2999].map(s => prGen({lv}, s, {json.dumps(O)})))")
    # same seed, separate calls, still the same question; different seeds vary
    for (name, lv), js in list(sample_json.items())[:6]:
        O = dict(COMBOS)[name] if False else [o for n_, o in COMBOS if n_ == name][0]
        chk(f'repeat call identical ({name} L{lv})', ev(f"JSON.stringify([0, 17, 999, 2999].map(s => prGen({lv}, s, {json.dumps(O)})))") == js)
    vary = ev("new Set(Array.from({length: 200}, (_, s) => prGen(3, s, {}).p)).size")
    chk('different seeds give different questions', vary >= 195, vary)
    # opts.recent: avoids the kinds seen in the last 3 questions where it can
    rec = ev("""(()=>{ let bad = 0; for (let s = 0; s < 500; s++) { for (const L of [4, 5, 6]) { const ks = PR_LEVEL_KINDS[L - 1]; const recent = ks.slice(0, 3); const q = prGen(L, s, { recent, worlds: true, units: true }); if (recent.includes(q.kind)) bad++; } } return bad; })()""")
    chk('opts.recent avoids the last 3 kinds', rec == 0, rec)
    old = ev("[mq(1, 5).p, mq(4, 9).ans, typeof MBMORE]")
    chk('Chapter 3 mq() still works', isinstance(old[0], str) and len(old[0]) > 20 and old[2] == 'function', old)
    chk('no console errors', not errs, errs); print('errors', errs)
    b.close()
print('ALL PASSED' if not fails else f'{len(fails)} FAILED')
raise SystemExit(1 if fails else 0)
