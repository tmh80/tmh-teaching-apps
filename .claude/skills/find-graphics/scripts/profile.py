#!/usr/bin/env python3
"""Measure a silhouette's outline as numbers, so code-drawn creatures (e.g. Adapt Lab's trait-driven
bodies) can borrow real proportions without embedding the picture.

Usage: profile.py SILHOUETTE.svg [--flip] [--n 12] [--json out.json]
Prints depth (height/length) and, at N+1 points from tail (0) to snout (1), the top and bottom edge
as fractions of the half-depth around the mid-line (-1 = top of deepest point, +1 = bottom).
That is the format used by FISH_LOOK in adapt-lab (top:[[s,v],...], bot:[[s,v],...]).
Check the result against the picture: fins sticking out of the outline show up as spikes; drop them
and draw fins as separate parts.
"""
import argparse, io, json
import cairosvg, numpy as np
from PIL import Image

ap = argparse.ArgumentParser(); ap.add_argument("svg"); ap.add_argument("--flip", action="store_true")
ap.add_argument("--n", type=int, default=12); ap.add_argument("--json")
a = ap.parse_args()
m = np.array(Image.open(io.BytesIO(cairosvg.svg2png(url=a.svg, output_width=1200))).split()[-1]) > 128
if a.flip:
    m = m[:, ::-1]
ys, xs = np.nonzero(m); m = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
H, W = m.shape
spans = []
for i in range(a.n + 1):
    c = np.nonzero(m[:, min(W - 1, int(i / a.n * (W - 1)))])[0]
    spans.append((i / a.n, c.min(), c.max()) if len(c) else (i / a.n, None, None))
# body mid-line and half-depth from the middle 60% of the body (ignores tail and snout)
mid = [(t + b) / 2 for s, t, b in spans if t is not None and 0.2 <= s <= 0.8]
half = max((b - t) / 2 for s, t, b in spans if t is not None and 0.2 <= s <= 0.8)
y_mid = float(np.median(mid))
top = [[round(s, 3), round((t - y_mid) / half, 2)] for s, t, b in spans if t is not None]
bot = [[round(s, 3), round((b - y_mid) / half, 2)] for s, t, b in spans if t is not None]
res = {"depth": round(2 * half / W, 3), "top": top, "bot": bot}
print(json.dumps(res))
if a.json:
    json.dump(res, open(a.json, "w"), indent=1)
