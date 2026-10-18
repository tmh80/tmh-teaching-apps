#!/usr/bin/env python3
"""Search free graphics sources and download candidates with licence metadata.

Usage examples
  search.py shark --sources iconify,phylopic --out /tmp/fg/shark
  search.py "Scomber scombrus" --sources phylopic --out /tmp/fg/mackerel   (PhyloPic wants scientific names)
  search.py beaker --sources bioicons,iconify --out /tmp/fg/beaker
  search.py saturn --sources nasa --out /tmp/fg/saturn
  search.py "plant cell diagram" --sources wikimedia --out /tmp/fg/cell
  search.py --kenney planets --out /tmp/fg/planets          (downloads a whole CC0 Kenney pack)

Every downloaded file gets a record in <out>/candidates.json:
  id, source, title, file, licence, bucket (free|credit|reject), author, source_url, notes
Rejected-licence items are listed but NOT downloaded.
"""
import argparse, io, json, os, subprocess, sys, zipfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fg_common import http_get, http_json, classify_licence, slug, save_candidates, CACHE, REJECT

# Icon sets worth searching on Iconify (others are mostly UI icons). Licence is read live per set.
ICONIFY_SETS = ["fluent-emoji-flat", "fluent-emoji", "noto", "twemoji", "game-icons", "openmoji",
                "emojione", "streamline-emojis", "fxemoji"]


def iconify(q, out, n):
    res = http_json("https://api.iconify.design/search", {"query": q, "limit": 200})
    icons = [i for i in res.get("icons", []) if i.split(":")[0] in ICONIFY_SETS]
    if not icons and len(q.split()) > 1:  # emoji names are short: retry with each word
        for w in q.split()[::-1]:
            icons = [i for i in http_json("https://api.iconify.design/search", {"query": w, "limit": 200}).get("icons", [])
                     if i.split(":")[0] in ICONIFY_SETS]
            if icons:
                break
    icons.sort(key=lambda i: ICONIFY_SETS.index(i.split(":")[0]))
    sets = sorted({i.split(":")[0] for i in icons})
    info = http_json("https://api.iconify.design/collections", {"prefixes": ",".join(sets)}) if sets else {}
    recs = []
    for name in icons[: n * 3]:
        pre, ic = name.split(":")
        lic = info.get(pre, {}).get("license", {})
        bucket, lname = classify_licence(lic.get("spdx") or lic.get("title"))
        rec = dict(id=f"iconify:{name}", source="Iconify / " + info.get(pre, {}).get("name", pre), title=ic,
                   licence=lic.get("title", "?"), bucket=bucket, author=info.get(pre, {}).get("author", {}).get("name", ""),
                   source_url=f"https://icon-sets.iconify.design/{pre}/{ic}/", notes="", file="")
        if bucket != REJECT:
            f = os.path.join(out, f"iconify-{pre}-{slug(ic)}.svg")
            open(f, "w").write(http_get(f"https://api.iconify.design/{pre}/{ic}.svg", {"width": 512}))
            rec["file"] = f
        recs.append(rec)
        if sum(1 for r in recs if r["file"]) >= n:
            break
    return recs


def phylopic_build():
    return http_json("https://api.phylopic.org/")["build"]


def phylopic(q, out, n):
    b = phylopic_build()
    nodes = http_json("https://api.phylopic.org/nodes", {"build": b, "filter_name": q.lower(), "page": 0, "embed_items": "true"})
    items = nodes.get("_embedded", {}).get("items", [])
    if not items:
        auto = http_json("https://api.phylopic.org/autocomplete", {"build": b, "query": q.lower()})
        print("PhyloPic: no exact node. It needs scientific names. Suggestions:", auto.get("matches", [])[:10], file=sys.stderr)
        return []
    recs = []
    for node in items[:2]:
        imgs = http_json("https://api.phylopic.org/images", {"build": b, "filter_clade": node["uuid"], "embed_items": "true",
                                                            "embed_specificNode": "true", "page": 0})
        for it in imgs.get("_embedded", {}).get("items", []):
            L = it["_links"]; bucket, lname = classify_licence(L["license"]["href"])
            sp = it.get("_embedded", {}).get("specificNode", {}).get("names", [[{"text": "?"}]])[0][0]["text"]
            author = it.get("attribution") or (L.get("contributor") or {}).get("title", "")
            rec = dict(id=f"phylopic:{it['uuid']}", source="PhyloPic", title=sp, licence=lname, bucket=bucket, author=author,
                       source_url=f"https://www.phylopic.org/images/{it['uuid']}", notes="silhouette (single black shape)", file="")
            vec = L.get("vectorFile", {}).get("href")
            if bucket != REJECT and vec:
                f = os.path.join(out, f"phylopic-{slug(sp)}-{it['uuid'][:8]}.svg")
                open(f, "w").write(http_get(vec)); rec["file"] = f
            recs.append(rec)
            if sum(1 for r in recs if r["file"]) >= n:
                return recs
    return recs


def bioicons_repo():
    d = os.path.join(CACHE, "bioicons")
    if not os.path.isdir(os.path.join(d, ".git")):
        os.makedirs(CACHE, exist_ok=True)
        subprocess.run(["git", "clone", "-q", "--depth", "1", "--filter=blob:none", "--sparse",
                        "https://github.com/duerrsimon/bioicons", d], check=True, timeout=600)
    return d


def bioicons(q, out, n):
    d = bioicons_repo()
    paths = subprocess.run(["git", "-C", d, "ls-tree", "-r", "--name-only", "HEAD"], capture_output=True, text=True).stdout.split()
    words = q.lower().split()
    svgs = [p for p in paths if p.endswith(".svg")]
    hits = [p for p in svgs if all(w in p.lower() for w in words)]
    if not hits:  # fall back to files matching most of the words (e.g. "conical flask" -> any "flask")
        scored = sorted(((sum(w in p.lower() for w in words), p) for p in svgs), reverse=True)
        hits = [p for sc, p in scored if sc > 0]
    hits = hits[: n * 2]
    if not hits:
        return []
    recs = []
    for h in hits:
        parts = h.split("/")  # static/icons/<licence>/<category>/<author>/<file>
        lic = parts[2].replace("cc-by-", "CC BY ").replace("cc-0", "CC0").replace("mit", "MIT")
        bucket, lname = classify_licence(lic)
        rec = dict(id=f"bioicons:{h}", source="Bioicons" + (" (Servier Medical Art)" if parts[4] == "Servier" else ""),
                   title=parts[-1][:-4], licence=lic, bucket=bucket, author=parts[4].replace("_", " ").replace("-", " "),
                   source_url="https://bioicons.com/", notes=f"category: {parts[3]}", file="")
        if bucket != REJECT:  # git fetches just this one file on demand (the clone is blob-less)
            body = subprocess.run(["git", "-C", d, "show", f"HEAD:{h}"], capture_output=True, text=True, timeout=120).stdout
            if body.strip():
                f = os.path.join(out, f"bioicons-{slug(parts[-1][:-4])}.svg")
                open(f, "w").write(body); rec["file"] = f
        recs.append(rec)
        if sum(1 for r in recs if r["file"]) >= n:
            break
    return recs


def nasa(q, out, n):
    res = http_json("https://images-api.nasa.gov/search", {"q": q, "media_type": "image"})
    recs = []
    for it in res["collection"]["items"][: n * 2]:
        dd = it["data"][0]; href = it["links"][0]["href"]
        credit = dd.get("secondary_creator") or dd.get("photographer") or ""
        notes = "NASA imagery is generally public domain; NASA logos/insignia are not. "
        bucket = "free"
        if credit and "nasa" not in credit.lower():
            bucket, notes = "credit", notes + f"Third-party credit listed: {credit}. Check before use."
        f = os.path.join(out, f"nasa-{slug(dd['nasa_id'])}.jpg")
        try:  # each item lists the sizes that actually exist; prefer medium, then small, then large
            sizes = http_json(it["href"])
            pick = next((u for want in ("~medium.", "~small.", "~large.") for u in sizes if want in u and u.lower().endswith((".jpg", ".png"))), href)
        except Exception:
            pick = href
        open(f, "wb").write(http_get(pick.replace("http://", "https://"), binary=True))
        recs.append(dict(id=f"nasa:{dd['nasa_id']}", source="NASA Image Library", title=dd.get("title", ""), licence="Public domain (NASA)",
                         bucket=bucket, author=credit or dd.get("center", "NASA"),
                         source_url=f"https://images.nasa.gov/details/{dd['nasa_id']}", notes=notes, file=f))
        if len(recs) >= n:
            break
    return recs


def wikimedia(q, out, n):
    api = "https://commons.wikimedia.org/w/api.php"
    res = http_json(api, {"action": "query", "list": "search", "srsearch": q + " filetype:bitmap|drawing", "srnamespace": 6,
                          "format": "json", "srlimit": n * 3}, pause=1)
    recs = []
    for hit in res.get("query", {}).get("search", []):
        title = hit["title"]
        info = http_json(api, {"action": "query", "titles": title, "prop": "imageinfo", "iiprop": "url|extmetadata|mime",
                               "iiurlwidth": 500, "format": "json"}, pause=2)  # 500px is a standard Wikimedia thumb size; others get rate-limited
        page = next(iter(info["query"]["pages"].values()))
        if "imageinfo" not in page:
            continue
        ii = page["imageinfo"][0]; m = ii.get("extmetadata", {})
        lic = m.get("LicenseShortName", {}).get("value", "") or m.get("License", {}).get("value", "")
        bucket, lname = classify_licence(lic)
        import re
        artist = re.sub("<[^>]+>", "", m.get("Artist", {}).get("value", "")).strip()[:80]
        rec = dict(id=f"wikimedia:{title}", source="Wikimedia Commons", title=title[5:], licence=lic or "unknown", bucket=bucket,
                   author=artist, source_url=ii.get("descriptionurl", ""), notes="check the file page: some show a person or logo", file="")
        if bucket != REJECT:
            ext = ".svg" if ii.get("mime") == "image/svg+xml" else ".png"
            url = ii["url"] if ext == ".svg" else ii.get("thumburl", ii["url"])
            f = os.path.join(out, f"wikimedia-{slug(title[5:])}{ext}")
            open(f, "wb").write(http_get(url, binary=True, pause=1)); rec["file"] = f
        recs.append(rec)
        if sum(1 for r in recs if r["file"]) >= n:
            break
    return recs


def kenney_pack(pack, out):
    import re
    page = http_get(f"https://kenney.nl/assets/{pack}")
    z = re.findall(rf"https://kenney.nl/media/pages/assets/{pack}/[^\"]*\.zip", page)
    if not z:
        sys.exit(f"Kenney pack '{pack}' not found. Browse https://kenney.nl/assets for pack names.")
    d = os.path.join(out, f"kenney-{pack}")
    zipfile.ZipFile(io.BytesIO(http_get(z[0], binary=True))).extractall(d)
    lic = "CC0" if re.search(r"CC0|publicdomain/zero", page) else "check License.txt"
    files = [os.path.join(r, f) for r, _, fs in os.walk(d) for f in fs if f.lower().endswith((".png", ".svg"))]
    recs = [dict(id=f"kenney:{pack}/{os.path.relpath(f, d)}", source="Kenney", title=os.path.basename(f), licence=lic,
                 bucket=classify_licence(lic)[0], author="Kenney (kenney.nl)", source_url=f"https://kenney.nl/assets/{pack}",
                 notes="game art pack", file=f) for f in files]
    print(f"Kenney '{pack}': {len(files)} images in {d}")
    return recs


SOURCES = {"iconify": iconify, "phylopic": phylopic, "bioicons": bioicons, "nasa": nasa, "wikimedia": wikimedia}

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("query", nargs="?")
    ap.add_argument("--sources", default="iconify,phylopic")
    ap.add_argument("--out", required=True)
    ap.add_argument("--max", type=int, default=6, help="max downloads per source")
    ap.add_argument("--kenney", help="download a Kenney pack by its URL name, e.g. planets, fish-pack, physics-assets")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    recs = []
    if a.kenney:
        recs += kenney_pack(a.kenney, a.out)
    if a.query:
        for s in a.sources.split(","):
            try:
                got = SOURCES[s.strip()](a.query, a.out, a.max)
                recs += got
                print(f"{s}: {sum(1 for r in got if r['file'])} downloaded, {sum(1 for r in got if not r['file'])} rejected/skipped")
                if not got:
                    print(f"  {s}: nothing found. Try a synonym or the technical name (conical flask -> Erlenmeyer; "
                          f"great white shark -> Carcharodon carcharias for PhyloPic).")
            except Exception as e:
                print(f"{s}: FAILED ({e}). Treat as unreachable for now and try the next source.", file=sys.stderr)
    p = save_candidates(a.out, recs)
    for r in recs:
        if not r["file"] and r["bucket"] == REJECT:
            print(f"  rejected licence: {r['title']} ({r['licence']})")
    print("candidates:", p)
