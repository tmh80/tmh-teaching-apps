#!/usr/bin/env python3
"""Render every candidate in a folder into one labelled PNG so Tom can pick by number.

Usage: contact_sheet.py <candidates folder> [--out sheet.png] [--bg "#7fb3d6"] [--cols 5]
Each tile shows: number, source, licence bucket (green = free, amber = credit needed).
"""
import argparse, io, json, os, sys
import cairosvg
from PIL import Image, ImageDraw, ImageFont

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONTB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def load(path, box):
    if path.endswith(".svg"):
        im = Image.open(io.BytesIO(cairosvg.svg2png(url=path, output_width=box * 2))).convert("RGBA")
    else:
        im = Image.open(path).convert("RGBA")
    bb = im.getbbox()
    if bb:
        im = im.crop(bb)
    s = min((box - 16) / im.width, (box - 16) / im.height)
    return im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder"); ap.add_argument("--out"); ap.add_argument("--bg", default="#ffffff"); ap.add_argument("--cols", type=int, default=5)
    a = ap.parse_args()
    recs = [r for r in json.load(open(os.path.join(a.folder, "candidates.json"))) if r["file"] and os.path.exists(r["file"])]
    if not recs:
        sys.exit("no downloaded candidates")
    C, cap = 220, 54
    rows = (len(recs) + a.cols - 1) // a.cols
    img = Image.new("RGB", (a.cols * (C + 12) + 12, rows * (C + cap + 12) + 12), "#fbf7ef")
    d = ImageDraw.Draw(img); f = ImageFont.truetype(FONT, 13); fb = ImageFont.truetype(FONTB, 16)
    for i, r in enumerate(recs):
        x, y = 12 + (i % a.cols) * (C + 12), 12 + (i // a.cols) * (C + cap + 12)
        d.rounded_rectangle([x, y, x + C, y + C], 14, fill=a.bg, outline="#e6dccb")
        try:
            im = load(r["file"], C)
            img.paste(im, (x + (C - im.width) // 2, y + (C - im.height) // 2), im)
        except Exception as e:
            d.text((x + 10, y + C // 2), "can't render", fill="red", font=f)
        col = {"free": "#2e7d4f", "credit": "#b26a00"}.get(r["bucket"], "#b00020")
        d.text((x + 8, y + 6), str(i + 1), fill="#3b2f2a", font=fb)
        d.text((x, y + C + 4), r["source"][:30], fill="#3b2f2a", font=f)
        d.text((x, y + C + 22), f"{r['licence'][:22]} · {'no credit needed' if r['bucket']=='free' else 'credit needed'}", fill=col, font=f)
        r["sheet_number"] = i + 1
    out = a.out or os.path.join(a.folder, "sheet.png")
    img.save(out)
    json.dump(recs, open(os.path.join(a.folder, "sheet-index.json"), "w"), indent=1)
    print(out, img.size)


if __name__ == "__main__":
    main()
