#!/usr/bin/env python3
"""Turn finished graphics into one JavaScript block to paste into a sim, so the offline file stays self-contained.

Usage: embed.py OUT.js FILE [FILE ...] [--name ART] [--max 512] [--q 80] [--budget-kb 1500]

- SVGs are minified and kept as text (smallest, sharp at any size, parts still editable).
- PNG/JPG/WebP are resized to --max px on the longest side and stored as WebP data URIs.
- Writes:  const ART={shark:{type:'svg',src:'data:image/svg+xml;...'},...};
           plus ART_IMG(name) -> a ready-to-draw Image (cached), for canvas drawImage.
- Prints each item's size and the total, and warns when the total passes --budget-kb.
Keys come from file names (shark-friendly.svg -> sharkFriendly).
"""
import argparse, base64, io, os, re, sys, urllib.parse
from PIL import Image

ap = argparse.ArgumentParser(); ap.add_argument("out"); ap.add_argument("files", nargs="+")
ap.add_argument("--name", default="ART"); ap.add_argument("--max", type=int, default=512); ap.add_argument("--q", type=int, default=80)
ap.add_argument("--budget-kb", type=int, default=1500)
a = ap.parse_args()


def key(p):
    k = re.sub(r"[^a-zA-Z0-9]+", " ", os.path.splitext(os.path.basename(p))[0]).split()
    return (k[0].lower() + "".join(w.capitalize() for w in k[1:])) if k else "art"


def svg_uri(s):
    s = re.sub(r"<\?xml[^>]*>|<!DOCTYPE[^>]*>|<!--.*?-->|<metadata.*?</metadata>", "", s, flags=re.S)
    s = re.sub(r"-?\d+\.\d{2,}", lambda m: f"{float(m.group(0)):.1f}", s)
    s = re.sub(r">\s+<", "><", s).strip()
    if "xmlns=" not in s:
        s = s.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)
    return "data:image/svg+xml;charset=utf-8," + urllib.parse.quote(s, safe=" =:/;,'\"#()-.")


entries, total = [], 0
seen = set()
for f in a.files:
    k = key(f)
    if k in seen:  # same name, different format (fish.png + fish.svg) -> fishSvg
        k += os.path.splitext(f)[1][1:].capitalize()
    seen.add(k)
    if f.lower().endswith(".svg"):
        uri, t = svg_uri(open(f).read()), "svg"
    else:
        im = Image.open(f); im.thumbnail((a.max, a.max), Image.LANCZOS)
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA")
        b = io.BytesIO(); im.save(b, "WEBP", quality=a.q, method=6)
        uri, t = "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode(), "webp"
    kb = len(uri) / 1024; total += kb
    print(f"  {k:<24} {t:<5} {kb:7.1f} KB")
    entries.append(f"{k}:{{type:'{t}',src:'{uri.replace(chr(39), '%27')}'}}")
js = (f"/* Embedded graphics: see shared/assets/CREDITS.md for sources and licences */\n"
      f"const {a.name}={{\n" + ",\n".join(entries) + "};\n"
      f"const {a.name}_CACHE={{}};function {a.name}_IMG(k){{if(!{a.name}_CACHE[k]){{const i=new Image();i.src={a.name}[k].src;{a.name}_CACHE[k]=i}}return {a.name}_CACHE[k]}}\n")
open(a.out, "w").write(js)
print(f"total {total:.1f} KB -> {a.out}")
if total > a.budget_kb:
    print(f"WARNING: over the {a.budget_kb} KB budget. Shrink photos (--max 384 / --q 70) or swap rasters for vectors.", file=sys.stderr)
