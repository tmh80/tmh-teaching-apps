#!/usr/bin/env python3
"""Clean up a downloaded graphic. Each subcommand reads IN and writes OUT.

  clean.py trim     IN OUT [--pad 8]                  crop empty space (PNG or SVG -> PNG)
  clean.py nobg     IN OUT [--tol 28]                 remove a flat background (flood fill from the edges)
  clean.py flip     IN OUT                            mirror left-right (make animals face the same way)
  clean.py recolour IN OUT --palette "#2f7f8f,#4fb3a9,#eef3f0"
                                                     SVG: map each fill colour to the nearest palette colour
                                                     PNG: remap by brightness onto the palette (dark -> light)
  clean.py tint     IN OUT --colour "#46505f"         SVG/PNG silhouette: make every filled pixel one colour
  clean.py trace    IN OUT.svg [--colours 8]          raster -> vector (vtracer); keeps parts reshapeable
  clean.py svgmin   IN OUT.svg [--digits 1]           strip metadata/comments, round numbers (smaller files)
  clean.py shrink   IN OUT.webp [--max 512] [--q 80]  resize + compress photos for embedding
"""
import argparse, io, re, sys
import numpy as np
from PIL import Image, ImageOps


def raster(path, width=1024):
    if path.endswith(".svg"):
        import cairosvg
        return Image.open(io.BytesIO(cairosvg.svg2png(url=path, output_width=width))).convert("RGBA")
    return Image.open(path).convert("RGBA")


def hex2rgb(h):
    h = h.lstrip("#"); h = "".join(c * 2 for c in h) if len(h) == 3 else h
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def trim(a):
    im = raster(a.inp); bb = im.getbbox()
    im = im.crop(bb) if bb else im
    im = ImageOps.expand(im, a.pad, (0, 0, 0, 0)); im.save(a.out)


def nobg(a):
    import cv2
    im = np.array(raster(a.inp)); rgb = im[:, :, :3].copy(); h, w = rgb.shape[:2]
    mask = np.zeros((h + 2, w + 2), np.uint8); t = (a.tol,) * 3
    for seed in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        if mask[seed[1] + 1, seed[0] + 1] == 0:
            cv2.floodFill(rgb, mask, seed, (0, 0, 0), t, t, cv2.FLOODFILL_MASK_ONLY | cv2.FLOODFILL_FIXED_RANGE | (255 << 8) | 8)
    bg = mask[1:-1, 1:-1] > 0
    alpha = im[:, :, 3].copy(); alpha[bg] = 0
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0)  # soften the cut edge
    im[:, :, 3] = alpha; Image.fromarray(im).save(a.out)


def flip(a):
    if a.inp.endswith(".svg") and a.out.endswith(".svg"):
        s = open(a.inp).read(); vb = re.search(r'viewBox="([^"]+)"', s)
        x, y, w, h = map(float, vb.group(1).split())
        body = s[s.index(">", s.index("<svg")) + 1: s.rindex("</svg>")]
        head = s[: s.index(">", s.index("<svg")) + 1]
        open(a.out, "w").write(f'{head}<g transform="translate({2*x+w},0) scale(-1,1)">{body}</g></svg>')
    else:
        ImageOps.mirror(raster(a.inp)).save(a.out)


def nearest(c, pal):
    return min(pal, key=lambda p: sum((x - y) ** 2 for x, y in zip(c, p)))


def recolour(a):
    pal = [hex2rgb(p) for p in a.palette.split(",")]
    if a.inp.endswith(".svg"):
        s = open(a.inp).read()
        def sub(m):
            c = nearest(hex2rgb(m.group(0)), pal); return "#%02x%02x%02x" % c
        s = re.sub(r"#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b", sub, s)
        open(a.out, "w").write(s)
    else:
        im = np.array(raster(a.inp)).astype(float); lum = im[:, :, :3] @ [0.299, 0.587, 0.114]
        pal_sorted = sorted(pal, key=lambda p: 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2])
        idx = np.clip((lum / 256 * len(pal_sorted)).astype(int), 0, len(pal_sorted) - 1)
        im[:, :, :3] = np.array(pal_sorted)[idx]; Image.fromarray(im.astype(np.uint8)).save(a.out)


def tint(a):
    c = a.colour
    if a.inp.endswith(".svg"):
        s = open(a.inp).read()
        s = re.sub(r'fill="(?!none)[^"]*"', f'fill="{c}"', s); s = re.sub(r"fill:\s*(?!none)[^;\"]+", f"fill:{c}", s)
        if "fill=" not in s:
            s = s.replace("<svg", f'<svg fill="{c}"', 1)
        open(a.out, "w").write(s)
    else:
        im = np.array(raster(a.inp)); im[:, :, :3] = hex2rgb(c); Image.fromarray(im).save(a.out)


def trace(a):
    import vtracer, tempfile, os
    src = a.inp
    if src.endswith(".svg"):
        sys.exit("already a vector")
    tmp = tempfile.mktemp(suffix=".png"); raster(src).save(tmp)
    vtracer.convert_image_to_svg_py(tmp, a.out, colormode="color", hierarchical="stacked", mode="spline",
                                    filter_speckle=6, color_precision=max(1, min(8, a.colours)), layer_difference=24,
                                    corner_threshold=60, length_threshold=4.0, splice_threshold=45, path_precision=2)
    os.remove(tmp); print("traced ->", a.out)


def svgmin(a):
    s = open(a.inp).read()
    s = re.sub(r"<\?xml[^>]*>|<!DOCTYPE[^>]*>|<!--.*?-->|<metadata.*?</metadata>|<title>.*?</title>|<desc>.*?</desc>", "", s, flags=re.S)
    s = re.sub(r"\s(inkscape|sodipodi):[a-zA-Z-]+=\"[^\"]*\"", "", s)
    s = re.sub(r"<(sodipodi|inkscape):[^>]*/>", "", s)
    d = a.digits
    rnd = lambda m: f"{float(m.group(0)):.{d}f}".rstrip("0").rstrip(".") if d else str(round(float(m.group(0))))
    # round path data and coordinates only; never transforms/viewBox/offsets (a 0.1 scale must not become 0)
    s = re.sub(r'\b(d|points|x|y|x1|y1|x2|y2|cx|cy|r|rx|ry|width|height)="([^"]*)"',
               lambda m: f'{m.group(1)}="' + re.sub(r"-?\d+\.\d+", rnd, m.group(2)) + '"', s)
    s = re.sub(r">\s+<", "><", s).strip()
    open(a.out, "w").write(s); print(f"{a.out}: {len(s)/1024:.1f} KB")


def shrink(a):
    im = raster(a.inp); im.thumbnail((a.max, a.max), Image.LANCZOS)
    kw = {"quality": a.q, "method": 6}
    if not im.getextrema()[3][0] < 255:
        im = im.convert("RGB")
    im.save(a.out, **kw); import os; print(f"{a.out}: {os.path.getsize(a.out)/1024:.1f} KB, {im.size}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest="cmd", required=True)
    def add(name, fn, *extra):
        p = sp.add_parser(name); p.add_argument("inp"); p.add_argument("out")
        for args, kw in extra: p.add_argument(*args, **kw)
        p.set_defaults(fn=fn)
    add("trim", trim, (("--pad",), dict(type=int, default=8)))
    add("nobg", nobg, (("--tol",), dict(type=int, default=28)))
    add("flip", flip)
    add("recolour", recolour, (("--palette",), dict(required=True)))
    add("tint", tint, (("--colour",), dict(required=True)))
    add("trace", trace, (("--colours",), dict(type=int, default=6)))
    add("svgmin", svgmin, (("--digits",), dict(type=int, default=1)))
    add("shrink", shrink, (("--max",), dict(type=int, default=512)), (("--q",), dict(type=int, default=80)))
    a = ap.parse_args(); a.fn(a)
