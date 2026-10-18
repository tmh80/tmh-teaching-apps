"""Shared helpers for the find-graphics scripts: polite HTTP, licence sorting, metadata."""
import json, os, re, time, urllib.parse, urllib.request, urllib.error

UA = "TMHTeachingApps-find-graphics/1.0 (https://github.com/tmh80/tmh-teaching-apps; teacher, educational use)"
CACHE = os.path.expanduser("~/.cache/find-graphics")


def http_get(url, params=None, binary=False, tries=4, pause=0.0, timeout=30):
    """GET with a proper User-Agent and back-off on 429/5xx (Wikimedia rate-limits hard)."""
    if params:
        url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    delay = 3
    for attempt in range(tries):
        if pause:
            time.sleep(pause)
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data = r.read()
                return data if binary else data.decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < tries - 1:
                time.sleep(delay); delay *= 2; continue
            raise
        except urllib.error.URLError:
            if attempt < tries - 1:
                time.sleep(delay); delay *= 2; continue
            raise


def http_json(url, params=None, **kw):
    return json.loads(http_get(url, params, **kw))


# ---------------------------------------------------------------- licences
# FREE   = use without credit (credit still recorded in CREDITS.md as good practice)
# CREDIT = allowed, but the sim must show a credit line (About/Credits panel)
# REJECT = never use (share-alike, non-commercial, no-derivatives, unknown)
FREE = "free"; CREDIT = "credit"; REJECT = "reject"


def classify_licence(text):
    """Return (bucket, short_name) from a licence name or URL."""
    t = (text or "").lower().strip()
    if not t:
        return REJECT, "unknown"
    if any(k in t for k in ("-nc", " nc", "noncommercial", "non-commercial", "by-nc")):
        return REJECT, short_name(t)
    if any(k in t for k in ("-nd", " nd", "noderiv", "no-deriv")):
        return REJECT, short_name(t)
    if any(k in t for k in ("-sa", " sa", "sharealike", "share-alike", "share alike", "gpl", "gfdl", "copyleft")):
        return REJECT, short_name(t)
    if any(k in t for k in ("cc0", "publicdomain/zero", "public domain", "public-domain", "pdm", "publicdomain/mark",
                            "no known copyright", "us-gov", "pd-usgov", "pd-nasa")):
        return FREE, short_name(t)
    if re.search(r"\b(mit|apache|isc|unlicense|bsd|ofl)\b", t):
        return FREE, short_name(t)
    if re.search(r"\bcc[ -]?by\b", t) or "licenses/by/" in t or "attribution" in t:
        return CREDIT, short_name(t)
    return REJECT, short_name(t)


def short_name(t):
    t = t.lower()
    m = re.search(r"licenses/([a-z-]+)/([\d.]+)", t)
    if m:
        return "CC " + m.group(1).upper() + " " + m.group(2)
    if "publicdomain/zero" in t or "cc0" in t:
        return "CC0"
    if "public" in t and "domain" in t:
        return "Public domain"
    return t[:40]


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-")[:48] or "item"


def save_candidates(outdir, items):
    """Append to outdir/candidates.json (one record per downloaded file)."""
    path = os.path.join(outdir, "candidates.json")
    old = []
    if os.path.exists(path):
        old = json.load(open(path))
    seen = {c["file"] for c in old}
    old += [c for c in items if c["file"] not in seen]
    json.dump(old, open(path, "w"), indent=1)
    return path
