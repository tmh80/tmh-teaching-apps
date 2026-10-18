#!/usr/bin/env python3
"""Add a graphic to shared/assets/ and record it in shared/assets/CREDITS.md in one step.

Usage:
  credits.py add CANDIDATES.json --id "phylopic:545d45f0-..." --to shared/assets/animals/shark-silhouette.svg \
             --used-in "Adapt Lab" [--changes "flipped; recoloured"] [--from-file EDITED.svg]
  credits.py own --to shared/assets/animals/seal-friendly.svg --made-by "Tom, with <tool name>" --used-in "Adapt Lab"
  credits.py check                     # every file in shared/assets has a CREDITS row, and every row has a file

Run from the repo root. Refuses anything whose licence bucket is 'reject'.
"""
import argparse, json, os, shutil, sys
from datetime import date

CRED = "shared/assets/CREDITS.md"
HEADER = ("| File | What it is | Source | Author | Licence | Credit needed? | Changes made | Used in |\n"
          "|---|---|---|---|---|---|---|---|\n")


def rows():
    if not os.path.exists(CRED):
        return []
    return [l for l in open(CRED).read().splitlines() if l.startswith("| `")]


def write_row(row):
    text = open(CRED).read() if os.path.exists(CRED) else "# Graphics credits\n\n" + HEADER
    if HEADER.splitlines()[0] not in text:
        text += "\n" + HEADER
    path = row.split("`")[1]
    lines = [l for l in text.splitlines() if not l.startswith(f"| `{path}`")]
    # insert after the last table row (or after the header)
    idx = max([i for i, l in enumerate(lines) if l.startswith("|")] or [len(lines) - 1])
    lines.insert(idx + 1, row)
    open(CRED, "w").write("\n".join(lines) + "\n")


def cmd_add(a):
    recs = json.load(open(a.candidates)); r = next((x for x in recs if x["id"] == a.id), None)
    if not r:
        sys.exit(f"id not found: {a.id}")
    if r["bucket"] == "reject":
        sys.exit(f"REFUSED: licence '{r['licence']}' is not free to use.")
    os.makedirs(os.path.dirname(a.to), exist_ok=True)
    src = a.from_file or r["file"]
    if os.path.abspath(src) != os.path.abspath(a.to):
        shutil.copy(src, a.to)
    need = "No" if r["bucket"] == "free" else "**Yes**: show in the sim's credits panel"
    write_row(f"| `{a.to}` | {r['title']} | [{r['source']}]({r['source_url']}) | {r['author'] or 'unknown'} | {r['licence']} | {need} | "
              f"{a.changes or 'none'} | {a.used_in} |")
    print("added", a.to)


def cmd_own(a):
    if not os.path.exists(a.to):
        sys.exit(f"put the file at {a.to} first")
    write_row(f"| `{a.to}` | {a.what or os.path.basename(a.to)} | Made for this repo ({date.today()}) | {a.made_by} | "
              f"Tom's own (school use) | No | {a.changes or 'none'} | {a.used_in} |")
    print("added", a.to)


def cmd_check(a):
    listed = {l.split("`")[1] for l in rows()}
    files = {os.path.join(r, f) for r, _, fs in os.walk("shared/assets") for f in fs
             if not f.endswith(".md") and not f.startswith(".") and not f.endswith(".json")}
    missing, orphan = sorted(files - listed), sorted(listed - files)
    for m in missing: print("NO CREDIT ROW:", m)
    for o in orphan: print("ROW BUT NO FILE:", o)
    print("ok" if not (missing or orphan) else "fix the lines above"); sys.exit(1 if missing or orphan else 0)


ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest="cmd", required=True)
p = sp.add_parser("add"); p.add_argument("candidates"); p.add_argument("--id", required=True); p.add_argument("--to", required=True)
p.add_argument("--used-in", required=True); p.add_argument("--changes"); p.add_argument("--from-file"); p.set_defaults(fn=cmd_add)
p = sp.add_parser("own"); p.add_argument("--to", required=True); p.add_argument("--made-by", required=True); p.add_argument("--used-in", required=True)
p.add_argument("--what"); p.add_argument("--changes"); p.set_defaults(fn=cmd_own)
p = sp.add_parser("check"); p.set_defaults(fn=cmd_check)
a = ap.parse_args(); a.fn(a)
