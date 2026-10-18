#!/usr/bin/env python3
"""Fallback: slice a sprite sheet Tom made in another AI tool into separate, clean pieces.

Usage: slice_sheet.py SHEET.png OUTDIR [--names shark,mackerel,seal] [--tol 30] [--min 0.001] [--trace] [--pad 6]

- Background colour is read from the sheet's corners and removed (works best on a flat, plain background).
- Each separate object becomes OUTDIR/<name>.png (transparent, trimmed). Pieces are ordered
  left-to-right in rows, top to bottom, which is the order --names are applied in.
- Tiny specks (smaller than --min of the sheet area, default 0.1%) are ignored; small detached bits that sit close to
  a big piece (a fin tip, a whisker) are merged into it.
- --trace also writes OUTDIR/<name>.svg (vector) for parts that need reshaping.
- Writes OUTDIR/slices.png, a numbered preview to check against.
"""
import argparse, os
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser(); ap.add_argument("sheet"); ap.add_argument("outdir")
ap.add_argument("--names", default=""); ap.add_argument("--tol", type=int, default=30)
ap.add_argument("--min", type=float, default=0.001); ap.add_argument("--trace", action="store_true"); ap.add_argument("--pad", type=int, default=6)
a = ap.parse_args(); os.makedirs(a.outdir, exist_ok=True)
im = np.array(Image.open(a.sheet).convert("RGBA")); h, w = im.shape[:2]
if im[:, :, 3].min() < 250:            # already transparent
    fg = im[:, :, 3] > 20
else:
    corners = np.array([im[2, 2, :3], im[2, w - 3, :3], im[h - 3, 2, :3], im[h - 3, w - 3, :3]], float)
    bg = np.median(corners, axis=0)
    fg = np.abs(im[:, :, :3].astype(float) - bg).max(axis=2) > a.tol
fg = cv2.morphologyEx(fg.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
grow = cv2.dilate(fg, np.ones((15, 15), np.uint8))          # join nearby bits of the same sprite
n, lab, stats, _ = cv2.connectedComponentsWithStats(grow, 8)
boxes = [stats[i] for i in range(1, n) if stats[i][4] >= a.min * h * w]
rowh = np.median([b[3] for b in boxes]) if boxes else 1
boxes.sort(key=lambda b: (round(b[1] / rowh), b[0]))
names = [s.strip() for s in a.names.split(",") if s.strip()]
prev = Image.fromarray(im).convert("RGB"); d = ImageDraw.Draw(prev)
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", max(14, h // 40))
for k, (x, y, bw, bh, _) in enumerate(boxes):
    name = names[k] if k < len(names) else f"piece-{k+1:02d}"
    x0, y0 = max(0, x - a.pad), max(0, y - a.pad); x1, y1 = min(w, x + bw + a.pad), min(h, y + bh + a.pad)
    piece = im[y0:y1, x0:x1].copy()
    alpha = (fg[y0:y1, x0:x1] * 255).astype(np.uint8)
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
    piece[:, :, 3] = np.minimum(piece[:, :, 3], alpha)
    out = os.path.join(a.outdir, name + ".png"); Image.fromarray(piece).save(out)
    if a.trace:
        import vtracer
        vtracer.convert_image_to_svg_py(out, out[:-4] + ".svg", colormode="color", hierarchical="stacked", mode="spline",
                                        filter_speckle=6, color_precision=6, layer_difference=24, path_precision=2)
    d.rectangle([x0, y0, x1, y1], outline="#e0311f", width=3); d.text((x0 + 4, y0 + 2), f"{k+1} {name}", fill="#e0311f", font=font)
    print(f"{k+1}: {name} {x1-x0}x{y1-y0}px -> {out}")
prev.save(os.path.join(a.outdir, "slices.png"))
if names and len(names) != len(boxes):
    print(f"WARNING: {len(names)} names but {len(boxes)} pieces found. Check slices.png and adjust --tol / --min.")
