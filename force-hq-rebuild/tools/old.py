#!/usr/bin/env python3
"""Pull one piece of code out of the OLD Force HQ build, so you never read the whole 550 KB file.

Usage (from force-hq-rebuild/):
  python3 tools/old.py list                 # every function and constant name in the old build
  python3 tools/old.py list sled            # names containing "sled"
  python3 tools/old.py drawSled genQ SLED_M # print those definitions (brace-matched)
  python3 tools/old.py grep "husky"         # lines (trimmed) that mention a word

The old build is ../force-hq/Force-HQ.html in the repo (override with OLD=path).
"""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OLD = os.environ.get('OLD') or os.path.join(HERE, '..', '..', 'force-hq', 'Force-HQ.html')
src = open(OLD, encoding='utf-8').read()

def names():
  out = set(re.findall(r'function ([A-Za-z_$][\w$]*)\s*\(', src))
  out |= set(re.findall(r'(?:const|let|var) ([A-Za-z_$][\w$]*)\s*=', src))
  return sorted(out, key=str.lower)

def grab(name):
  m = re.search(r'(?:^|[;\s{}])((?:async\s+)?function\s+' + re.escape(name) + r'\s*\(|(?:const|let|var)\s+' + re.escape(name) + r'\s*=)', src)
  if not m: return None
  i = m.start(1); j = i; depth = 0; brace = False; q = None
  isfn = src[i:i + 9].lstrip().startswith(('function', 'async'))
  while j < len(src):
    c = src[j]
    if q:
      if c == '\\': j += 2; continue
      if c == q: q = None
    elif c in '\'"`': q = c
    elif c in '{[(':
      depth += 1
      if c == '{': brace = True
    elif c in '}])':
      depth -= 1
      if isfn and c == '}' and depth == 0: return src[i:j + 1]
    elif not isfn and depth == 0 and c in ';\n' and j > m.end(1): return src[i:j + 1].rstrip()
    j += 1
  return src[i:i + 2000]

a = sys.argv[1:]
if not a or a[0] == 'list':
  f = a[1].lower() if len(a) > 1 else ''
  print(' '.join(n for n in names() if f in n.lower()))
elif a[0] == 'grep':
  for k, line in enumerate(src.split('\n')):
    if a[1].lower() in line.lower(): print(k + 1, line.strip()[:220])
else:
  for n in a:
    g = grab(n); print(f'// ===== {n} =====\n' + (g if g else '(not found)') + '\n')
