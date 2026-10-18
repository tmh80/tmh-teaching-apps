#!/usr/bin/env python3
"""Friendly makeover: turn a one-colour silhouette (e.g. PhyloPic) into a soft, styled vector.

Usage: makeover.py SILHOUETTE.svg OUT.svg --style style.json [--flip] [--eye 0.9,0.4,0.18] [--stripes 7] [--gills 0.8]
                  [--colours back,back2,belly,belly2,line,stripe] [--png preview.png]

style.json (a sim's style card) supplies the defaults, for example:
  {"outline": 0.011, "highlight": 0.28, "split": 0.55, "eye_style": "big",
   "colours": {"back":"#6f7d92","back2":"#93a1b4","belly":"#f6f3ee","belly2":"#e8e2da","line":"#3e4757","stripe":"#1e4f63"}}

--eye  x-fraction along the body (0 = left), y-fraction of body depth at that x, radius as fraction of depth
--flip mirror so the animal faces right (sims draw animals facing right by convention)
Output stays a vector, so it can be recoloured or reshaped later.
"""
import argparse, io, json, re
import cairosvg, numpy as np
from PIL import Image


def read_sil(p):
    s = open(p).read()
    vb = [float(x) for x in re.search(r'viewBox="([^"]+)"', s).group(1).split()]
    inner = s[s.index(">", s.index("<svg")) + 1: s.rindex("</svg>")]
    inner = re.sub(r"<metadata.*?</metadata>", "", inner, flags=re.S)
    inner = re.sub(r'fill="(?!none)[^"]*"', 'fill="#000"', inner)
    inner = re.sub(r'\sstroke(-width)?="[^"]*"', '', inner)  # let the outline layer's stroke show through
    return vb, inner


def mask_of(vb, body, flipT, width=600):
    W, H = vb[2], vb[3]
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]} {vb[1]} {W} {H}" width="{width}" height="{int(width*H/W)}"><g transform="{flipT}">{body}</g></svg>'
    return np.array(Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode()))).split()[-1]) > 128, width / W


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sil"); ap.add_argument("out"); ap.add_argument("--style", required=True)
    ap.add_argument("--flip", action="store_true"); ap.add_argument("--eye", default="0.88,0.38,0.17")
    ap.add_argument("--stripes", type=int, default=0); ap.add_argument("--gills", type=float, default=0)
    ap.add_argument("--colours"); ap.add_argument("--png")
    a = ap.parse_args()
    st = json.load(open(a.style)); c = dict(st["colours"])
    if a.colours:
        c.update(zip(["back", "back2", "belly", "belly2", "line", "stripe"], a.colours.split(",")))
    vb, body = read_sil(a.sil); X0, Y0, W, H = vb
    flipT = f"translate({2*X0+W},0) scale(-1,1)" if a.flip else ""
    m, sc = mask_of(vb, body, flipT)
    ys, xs = np.nonzero(m)
    x0, x1, y0, y1 = X0 + xs.min() / sc, X0 + xs.max() / sc, Y0 + ys.min() / sc, Y0 + ys.max() / sc
    def col_span(fx):
        cy = np.nonzero(m[:, min(m.shape[1] - 1, int((fx - X0) * sc))])[0]
        return (Y0 + cy.min() / sc, Y0 + cy.max() / sc) if len(cy) else (y0, y1)
    ex_f, ey_f, er_f = map(float, a.eye.split(","))
    hx = x0 + (x1 - x0) * ex_f; top, bot = col_span(hx); ey = top + (bot - top) * ey_f; er = (bot - top) * er_f
    ow = W * st.get("outline", 0.011); pad = W * 0.06; split = st.get("split", 0.55)
    sm = re.search(r"scale\(([-\d.]+)", body); inner = abs(float(sm.group(1))) if sm else 1.0  # potrace files scale paths by 0.1
    sil = f'<g transform="{flipT}">{body}</g>'
    stripes = ""
    for i in range(a.stripes):
        x = x0 + (x1 - x0) * (0.28 + 0.5 * i / a.stripes); w = (x1 - x0) * 0.025; t, b = col_span(x)
        stripes += (f'<path d="M{x:.1f},{t-2:.1f} q{w*2:.1f},{(b-t)*.18:.1f} 0,{(b-t)*.32:.1f} q{-w*2:.1f},{(b-t)*.12:.1f} 0,{(b-t)*.16:.1f}" '
                    f'stroke="{c.get("stripe", c["line"])}" stroke-width="{w:.1f}" fill="none" stroke-linecap="round" opacity=".85"/>')
    gills = ""
    if a.gills:
        for i in range(5):
            x = x0 + (x1 - x0) * (a.gills - i * 0.018); t, b = col_span(x)
            gills += (f'<path d="M{x:.1f},{t+(b-t)*.3:.1f} q{-(x1-x0)*.008:.1f},{(b-t)*.15:.1f} 0,{(b-t)*.3:.1f}" stroke="{c["line"]}" '
                      f'stroke-width="{ow*.7:.1f}" fill="none" stroke-linecap="round" opacity=".6"/>')
    hl = st.get("highlight", 0.28)
    out = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0-pad:.1f} {y0-pad:.1f} {x1-x0+2*pad:.1f} {y1-y0+2*pad:.1f}">
<defs><clipPath id="b">{sil}</clipPath>
<linearGradient id="g" x1="0" y1="{y0:.1f}" x2="0" y2="{y1:.1f}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="{c['back']}"/><stop offset="{split-0.08:.2f}" stop-color="{c['back2']}"/><stop offset="{split+0.04:.2f}" stop-color="{c['belly']}"/><stop offset="1" stop-color="{c['belly2']}"/></linearGradient></defs>
<g fill="{c['line']}" stroke="{c['line']}" stroke-width="{ow*2/inner:.2f}" stroke-linejoin="round" stroke-linecap="round">{sil}</g>
<g clip-path="url(#b)"><rect x="{X0}" y="{Y0}" width="{W}" height="{H}" fill="url(#g)"/>{stripes}
<ellipse cx="{x0+(x1-x0)*.55:.1f}" cy="{y0+(y1-y0)*.32:.1f}" rx="{(x1-x0)*.28:.1f}" ry="{(y1-y0)*.07:.1f}" fill="#fff" opacity="{hl}"/></g>
{gills}<circle cx="{hx:.1f}" cy="{ey:.1f}" r="{er*1.25:.1f}" fill="#fff" stroke="{c['line']}" stroke-width="{ow*.8:.1f}"/>
<circle cx="{hx+er*.25:.1f}" cy="{ey+er*.1:.1f}" r="{er*.7:.1f}" fill="#2b2230"/><circle cx="{hx+er*.45:.1f}" cy="{ey-er*.25:.1f}" r="{er*.25:.1f}" fill="#fff"/>
</svg>'''
    open(a.out, "w").write(out)
    if a.png:
        cairosvg.svg2png(url=a.out, write_to=a.png, output_width=600)
    print(a.out, f"{len(out)/1024:.1f} KB")


if __name__ == "__main__":
    main()
