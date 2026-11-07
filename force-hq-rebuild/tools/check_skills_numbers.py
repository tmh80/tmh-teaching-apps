#!/usr/bin/env python3
"""Check every number in the Skills section scripts (docs/Skills_*_Script.md). Run: python3 tools/check_skills_numbers.py"""
fails = 0
def chk(label, got, want, tol=1e-9):
    global fails
    ok = abs(got - want) <= tol
    fails += not ok
    print(('ok  ' if ok else 'FAIL'), label, round(got, 4), '' if ok else f'(script says {want})')
brake = lambda m, v, F: m * v * v / (2 * F)
# c2s Learn 1: 36 N brake at 2.4 m/s
for m, d in [(20, 1.6), (40, 3.2), (60, 4.8), (80, 6.4), (50, 4.0)]: chk(f'c2s Learn crate {m} kg', brake(m, 2.4, 36), d)
# c2s Learn 2 Mark it: Jo's 30 kg crate
for F, d in [(24, 3.6), (48, 1.8)]: chk(f'c2s Jo brake {F} N', brake(30, 2.4, F), d)
# c2s Check: 8,000 kg truck, 40,000 N, 20 m/s
for L, d in [(0, 40), (2000, 50), (4000, 60), (6000, 70), (8000, 80)]: chk(f'c2s truck cargo {L} kg', brake(8000 + L, 20, 40000), d)
chk('c2s truck deceleration empty', 40000 / 8000, 5.0); chk('c2s truck deceleration full', 40000 / 16000, 2.5)
# Priya's spring worked example: roughly 2 cm per 100 g (real data, so within 0.15 cm)
for g, cm in [(100, 2.0), (200, 4.1), (300, 5.9), (400, 8.0)]: chk(f'c2s Priya spring {g} g', g / 50, cm, 0.15)
print('\nALL NUMBERS OK' if not fails else f'\n{fails} FAILED'); raise SystemExit(1 if fails else 0)
