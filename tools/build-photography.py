# -*- coding: utf-8 -*-
"""Write the static pages of the photography room at /photography/room/.

The room is two walls of prints and, behind them, the contact sheets each
print was circled on, and a page for every photograph. Everything is laid
out here, at build time, so the pages work with JavaScript off and look the
same on every build: circles, handwriting wobble and the positions on the
boards all come from seeded randomness keyed on the photograph's id.

Reads (never writes):
  photography/data/photos.json       the master collection: src, w, h, alt
  photography/data/sheets.json       contact sheets, newest first
  photography/data/walls.json        the two walls, in hanging order
  photography/data/photo-meta.json   tone, place, local capture time, and
                                     an "alt" that overrides photos.json
                                     until the same edit reaches it

Writes (see BUILD):
  photography/room/index.html                   the wall
  photography/room/sheets/index.html            every contact sheet
  photography/room/sheets/<sheet-id>/index.html one per sheet
  photography/room/p/<photo-id>/index.html      one per photograph
  photography/room/everything/index.html        every photograph, newest first

room.css and room.js beside the pages are written by hand, not by this tool.
No page carries an inline script: the live Content-Security-Policy runs
scripts from files on the site only. What room.js's viewer needs travels in
data- attributes on the links.

Before writing anything the build checks the data, then every generated
page: one h1, a title, a canonical link, noindex, and every internal link
resolving to a generated page, an id on it, or a file in the site.

Run from the repository root:  python3 tools/build-photography.py
"""
import hashlib, html, json, math, os, random, re
from urllib.parse import urlsplit

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ORIGIN = "https://faisalhenar.com"
DATA = os.path.join(ROOT, "photography", "data")
ROOM = os.path.join(ROOT, "photography", "room")
ROOM_URL = "/photography/room/"
SHEETS_URL = ROOM_URL + "sheets/"
EVERYTHING_URL = ROOM_URL + "everything/"

# What gets built. Later phases add to this list.
BUILD = ["wall", "sheets-index", "sheets", "photographs", "everything"]

ROOM_CSS_VERSION = "5"
ROOM_JS_VERSION = "5"

MAX_CIRCLED = 4
MAX_WALL = 12
WALL_SEEDS = {"bw": 1, "colour": 4}
WALL_NAMES = {"bw": "Black and white", "colour": "Colour"}
WALL_LABELS = {"bw": "black and white", "colour": "colour"}
MARK_WORDS = {"bw": "wall", "colour": "colour"}
FASTENERS = ["pin-red", "pin-blue", "pin-yellow", "two-pins", "clip", "tape-corners", "tape-top"]
MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]
IMAGE_WIDTHS = (400, 800, 1200)
EVERYTHING_WIDTHS = (300, 600)
ROW_HEIGHT = {"computer": 200, "phone": 120}
COUNTRIES = ("Suriname", "Vietnam")
PAGE_WIDTHS = (800, 1200, 2000)
OG_WIDTH = 1200
BOARD_WIDTH = 1312


def read(path):
    with open(path, encoding="utf-8", newline="") as handle:
        return handle.read()


def write(path, text):
    # LF endings, enforced for the whole repository by .gitattributes.
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)


def load(name):
    return json.loads(read(os.path.join(DATA, name)))


def esc(value):
    return html.escape(value, quote=True)


# ---------- seeded drawing: circles, handwriting, boards ----------

def seed_of(s):
    """A stable number from an id."""
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16)


def loop_path(seed, passes=1, overshoot=0.3, wob=0.035, cx=50, cy=40, rx=47, ry=36):
    r = random.Random(seed)
    tilt = math.radians(r.uniform(-7, 7)); t0 = r.uniform(0, 2 * math.pi)
    a = [r.uniform(-wob, wob) for _ in range(3)]; p = [r.uniform(0, 6.3) for _ in range(3)]
    span = 2 * math.pi * passes + overshoot; n = int(70 * passes) + 12; pts = []
    for k in range(n + 1):
        t = t0 + span * k / n
        g = 1 + a[0] * math.sin(2 * t + p[0]) + a[1] * math.sin(3 * t + p[1]) + a[2] * math.sin(5 * t + p[2])
        g *= 1 + 0.045 * (k / n)
        x = rx * g * math.cos(t); y = ry * g * math.sin(t)
        X = cx + x * math.cos(tilt) - y * math.sin(tilt); Y = cy + x * math.sin(tilt) + y * math.cos(tilt)
        pts.append(f"{X:.2f} {Y:.2f}")
    return "M" + " L".join(pts)


def jitter_spans(text, seed):
    """Handwriting wobble: one inline-block span per letter."""
    r = random.Random(seed); out = []
    for ch in text:
        if ch == " ": out.append(" "); continue
        out.append(f'<span style="display:inline-block;transform:rotate({r.uniform(-6,6):.1f}deg) translateY({r.uniform(-1.6,1.6):.1f}px)">{esc(ch)}</span>')
    return "".join(out)


def board_layout(items, seed, portrait, cw=305):
    """items: ids in wall order; portrait: ids taller than wide. Returns (positions, board_height)."""
    r = random.Random(seed); pos = []; y = 60; rowh = 0
    for n, i in enumerate(items):
        c = n % 4
        if c == 0 and n: y += rowh + 80; rowh = 0
        w = r.randint(190, 215) if i in portrait else r.randint(262, 296)
        h = (w - 16) * (4 / 3 if i in portrait else 0.75) + 16
        x = 40 + c * cw + (cw - w) // 2 + r.randint(-18, 18) - 20
        yy = y + r.randint(0, 26); rowh = max(rowh, h + 26)
        pos.append({"id": i, "x": x, "y": round(yy), "w": w, "rot": round(r.uniform(-2.6, 2.6), 1)})
    return pos, int(y + rowh + 90)


def circle_svg(photo_id, extra_class=""):
    d = loop_path(seed_of(photo_id))
    return (f'<svg class="circle{extra_class}" viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
            f'<path d="{d}" pathLength="100" stroke-width="1.25" opacity="0.92"/>'
            f'<path d="{d}" pathLength="100" stroke-width="0.5" opacity="0.45" transform="translate(0.6 0.5)"/>'
            '</svg>')


# ---------- images: the same Cloudflare URLs as photography/js/image-url.js ----------

def original(photo):
    return "/photography/" + photo["src"]


def cf_image(photo, width):
    return f"/cdn-cgi/image/width={width},fit=scale-down,format=auto/photography/{photo['src']}"


def img_tag(photo, sizes, src_width=800, widths=IMAGE_WIDTHS, lazy=True):
    widths = [w for w in widths if w <= photo["w"]] or [photo["w"]]
    srcset = ", ".join(f"{cf_image(photo, w)} {w}w" for w in widths)
    loading = 'loading="lazy" decoding="async"' if lazy else 'fetchpriority="high" decoding="async"'
    return (f'<img src="{cf_image(photo, src_width)}" srcset="{srcset}" sizes="{sizes}" '
            f'data-orig="{original(photo)}" width="{photo["w"]}" height="{photo["h"]}" '
            f'alt="{esc(photo["alt"])}" {loading}>')


# ---------- what is known about one photograph ----------

def photo_url(photo_id):
    return f"{ROOM_URL}p/{photo_id}/"


def sheet_url(sheet_id):
    return f"{SHEETS_URL}{sheet_id}/"


def fmt_day(date, year=True):
    y, m, d = date.split("-")
    return f"{int(d)} {MONTHS[int(m) - 1]}" + (f" {y}" if year else "")


def fmt_moment(stamp):
    """'2026-06-08T11:05' -> '8 June 2026, 11:05'."""
    date, clock = stamp.split("T")
    return f"{fmt_day(date)}, {clock}"


def fmt_range(first, last):
    """A date or date range from two 'YYYY-MM-DD' strings."""
    if first == last: return fmt_day(first)
    if first[:7] == last[:7]: return f"{int(first[8:])} to {fmt_day(last)}"
    if first[:4] == last[:4]: return f"{fmt_day(first, year=False)} to {fmt_day(last)}"
    return f"{fmt_day(first)} to {fmt_day(last)}"


class Room:
    """The four data files, joined: everything a page needs about a photograph."""

    def __init__(self, photos, sheets, walls, meta):
        self.sheets, self.walls, self.meta = sheets, walls, meta
        # photo-meta "alt" overrides photos.json until the edit reaches it.
        self.photos = {i: dict(p, alt=meta.get(i, {}).get("alt") or p["alt"]) for i, p in photos.items()}
        self.sheet_of = {i: s for s in sheets for i in s["frames"]}
        self.wall_of = {p["id"]: (t, n, p["title"]) for t in ("bw", "colour") for n, p in enumerate(walls[t], 1)}

    def frame_no(self, i):
        return self.sheet_of[i]["frames"].index(i) + 1

    def heading(self, i):
        if i in self.wall_of: return self.wall_of[i][2]
        return f"Frame {self.frame_no(i)}, {self.sheet_of[i]['title']}"

    def place_line(self, i):
        m = self.meta[i]
        return " · ".join(x for x in (m["place"], fmt_moment(m["captured"]) if m["captured"] else "") if x)

    def from_label(self, i):
        return f"From {self.sheet_of[i]['title']}, frame {self.frame_no(i)}"

    def from_href(self, i):
        return f"{sheet_url(self.sheet_of[i]['id'])}#frame-{self.frame_no(i)}"

    def wall_line(self, i):
        if i not in self.wall_of: return ""
        tone, n, _ = self.wall_of[i]
        return f"On the {WALL_LABELS[tone]} wall, place {n}"

    def wall_href(self, i):
        return f"{ROOM_URL}#wall-{self.wall_of[i][0]}" if i in self.wall_of else ""

    def viewer_attrs(self, i):
        """Everything room.js's viewer shows, on the link that opens it."""
        p = self.photos[i]
        attrs = {
            "data-v-src": original(p), "data-v-w": p["w"], "data-v-h": p["h"],
            "data-v-title": self.heading(i), "data-v-desc": p["alt"],
            "data-v-meta": self.place_line(i),
            "data-v-from": self.from_label(i), "data-v-from-href": self.from_href(i),
            "data-v-wall": self.wall_line(i), "data-v-wall-href": self.wall_href(i),
        }
        return " ".join(f'{k}="{esc(str(v))}"' for k, v in attrs.items())


# ---------- validation of the data ----------

def validate(photos, sheets, walls, meta):
    problems = []
    seen = {}
    for sheet in sheets:
        for i in sheet["frames"]:
            if i in seen: problems.append(f"{i} is on two sheets: {seen[i]} and {sheet['id']}.")
            seen[i] = sheet["id"]
            if i not in photos: problems.append(f"{i} on sheet {sheet['id']} is not in photos.json.")
            if i not in meta: problems.append(f"{i} on sheet {sheet['id']} has no entry in photo-meta.json.")
        if len(sheet["frames"]) != len(set(sheet["frames"])): problems.append(f"Sheet {sheet['id']} lists a frame twice.")
        for i in sheet["circled"]:
            if i not in sheet["frames"]: problems.append(f"{i} is circled on {sheet['id']} but is not one of its frames.")
        if len(sheet["circled"]) > MAX_CIRCLED: problems.append(f"Sheet {sheet['id']} has {len(sheet['circled'])} circled; at most {MAX_CIRCLED}.")
    for i in meta:
        if i not in seen: problems.append(f"{i} is in photo-meta.json but on no sheet.")
        if meta[i].get("country") not in COUNTRIES: problems.append(f"{i} has no country (one of {', '.join(COUNTRIES)}) in photo-meta.json.")
        if not meta[i].get("captured"): problems.append(f"{i} has no capture time, so it cannot be placed on Everything.")
    circled = {i for s in sheets for i in s["circled"]}
    for tone in ("bw", "colour"):
        prints = walls.get(tone, [])
        if len(prints) > MAX_WALL: problems.append(f"The {tone} wall has {len(prints)} prints; at most {MAX_WALL}.")
        for p in prints:
            i = p["id"]
            if i not in circled: problems.append(f"{i} hangs on the {tone} wall but is not circled on any sheet.")
            if i in meta and meta[i]["tone"] != tone: problems.append(f"{i} is {meta[i]['tone']} but hangs on the {tone} wall.")
            if not p.get("title"): problems.append(f"{i} on the {tone} wall has no title.")
    hung = [p["id"] for t in ("bw", "colour") for p in walls.get(t, [])]
    if len(hung) != len(set(hung)): problems.append("A print hangs twice.")
    if problems:
        raise SystemExit("ERROR: the photography room data does not hold together:\n  " + "\n  ".join(problems))


# ---------- validation of the pages ----------

ATTR_RE = re.compile(r'\s(href|src|srcset|data-orig|data-v-src|data-v-from-href|data-v-wall-href)="([^"]*)"')
ID_RE = re.compile(r'\sid="([^"]+)"')


def check_pages(pages):
    """Every generated page: one h1, a title, canonical, noindex; every internal link resolves."""
    by_url = {"/" + os.path.relpath(path, ROOT).replace(os.sep, "/")[:-len("index.html")]: text
              for path, text in pages.items()}
    ids = {url: set(ID_RE.findall(text)) for url, text in by_url.items()}
    problems = []
    for url, text in by_url.items():
        if len(re.findall(r"<h1[\s>]", text)) != 1: problems.append(f"{url}: needs exactly one h1.")
        if not re.search(r"<title>[^<]+</title>", text): problems.append(f"{url}: has no title.")
        if f'<link rel="canonical" href="{ORIGIN}{url}">' not in text: problems.append(f"{url}: canonical link missing or wrong.")
        if '<meta name="robots" content="noindex">' not in text: problems.append(f"{url}: not marked noindex.")
        for attr, value in ATTR_RE.findall(text):
            refs = [part.strip().split(" ")[0] for part in value.split(", ")] if attr == "srcset" else [value]
            for ref in refs:
                if not ref or not ref.startswith("/") or ref.startswith("//"): continue
                if ref.startswith("/cdn-cgi/image/"): ref = "/" + ref.split("/", 4)[4]
                parts = urlsplit(ref); path, frag = parts.path, parts.fragment
                if path in by_url:
                    if frag and frag not in ids[path]: problems.append(f"{url}: {attr} {ref} points to a missing id.")
                    continue
                target = os.path.join(ROOT, path.lstrip("/").replace("/", os.sep))
                if path.endswith("/"): target = os.path.join(target, "index.html")
                if not os.path.isfile(target): problems.append(f"{url}: {attr} {ref} does not resolve.")
    if problems:
        raise SystemExit("ERROR: the generated room pages have problems:\n  " + "\n  ".join(sorted(set(problems))))


# ---------- shared page parts ----------

def room_nav(section, total):
    """The room's own row of sections, under the site header."""
    items = [("wall", "The wall", ROOM_URL, ""), ("sheets", "Contact sheets", SHEETS_URL, ""),
             ("everything", "Everything", EVERYTHING_URL, f' <span class="room-nav-n">{total}</span>')]
    links = "".join(
        f'\n    <a href="{href}"' + (' aria-current="page"' if key == section else '') + f'>{label}{extra}</a>'
        for key, label, href, extra in items)
    return f'  <nav class="room-nav" aria-label="Photography room">{links}\n  </nav>\n'


def head(title, description, url, versions, og_image=None, section="wall", total=0):
    og = og_image or ("https://faisalhenar.com/images/og-image.png", 1200, 630)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<title>{esc(title)} · Faisal Henar</title>
<meta name="description" content="{esc(description)}">
<link rel="canonical" href="{ORIGIN}{url}">
<meta property="og:title" content="{esc(title)} · Faisal Henar">
<meta property="og:description" content="{esc(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{ORIGIN}{url}">
<meta property="og:image" content="{og[0]}">
<meta property="og:image:width" content="{og[1]}">
<meta property="og:image:height" content="{og[2]}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)} · Faisal Henar">
<meta name="twitter:description" content="{esc(description)}">
<meta name="twitter:image" content="{og[0]}">
<link rel="preload" href="/photography/fonts/familjen-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/base.css?v={versions['base']}">
<link rel="stylesheet" href="/photography/room/room.css?v={ROOM_CSS_VERSION}">
<script src="/photography/room/room.js?v={ROOM_JS_VERSION}"></script>
<!-- Cloudflare Web Analytics -->
<script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{{"token": "68bb7041afa74c9ea4d36891d27ae977"}}'></script>
<!-- End Cloudflare Web Analytics -->
</head>
<body class="room">

  <a class="skip-link" href="#main">Skip to content</a>

  <header class="hub-topline" id="top" tabindex="-1">
    <a class="top-link" href="/">&larr; faisalhenar.com</a>
    <div class="menu" data-menu>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu-panel" data-menu-btn>Menu</button>
      <nav class="menu-panel" id="site-menu-panel" data-menu-panel aria-label="Site sections">
        <a href="/">Home</a>
        <a href="/practice/">Practice</a>
        <a href="/photography/" class="current" aria-current="page">Photography</a>
        <a href="/elsewhere.html">Elsewhere</a>
        <a href="/note.html">A note from me</a>
        <a href="/contact.html">Contact</a>
      </nav>
    </div>
  </header>
""" + room_nav(section, total)


def foot(versions):
    return f"""
  <footer class="site-footer">
    <nav class="footer-nav" aria-label="More">
      <a href="/note.html">A note from me</a>
      <a href="/contact.html">Contact</a>
      <a href="/elsewhere.html">Elsewhere</a>
    </nav>
    <span>© <span id="year"></span> Faisal Henar</span>
    <noscript>
      <nav class="footer-nav" aria-label="Site sections">
        <a href="/">Home</a>
        <a href="/practice/">Practice</a>
        <a href="/photography/">Photography</a>
      </nav>
    </noscript>
  </footer>

  <script src="/js/menu.js?v={versions['menu']}"></script>
</body>
</html>
"""


def crumbs(*links):
    return '<p class="room-crumb">' + " · ".join(f'<a href="{href}">{esc(text)}</a>' for text, href in links) + "</p>"


# ---------- the wall ----------

def fastener(photo_id):
    kind = random.Random(seed_of(photo_id) + 7).choice(FASTENERS)
    return f'<span class="fastener fastener--{kind}" aria-hidden="true"></span>'


def wall_section(room, tone):
    prints = room.walls[tone]; photos = room.photos
    portrait = {p["id"] for p in prints if photos[p["id"]]["h"] > photos[p["id"]]["w"]}
    positions, height = board_layout([p["id"] for p in prints], WALL_SEEDS[tone], portrait)
    other = "colour" if tone == "bw" else "bw"
    figures, items = [], []
    for n, (p, pos) in enumerate(zip(prints, positions), 1):
        i = p["id"]; photo = photos[i]
        shape = "portrait" if i in portrait else "landscape"
        from_link = f'<a href="{room.from_href(i)}">{esc(room.sheet_of[i]["title"])}, frame {room.frame_no(i)}</a>'
        figures.append(f"""          <figure class="print print--{shape}" style="--x:{pos['x']};--y:{pos['y']};--w:{pos['w']};--rot:{pos['rot']}deg">
            <a class="print-photo" href="{photo_url(i)}" {room.viewer_attrs(i)}>{img_tag(photo, "(max-width: 760px) calc(100vw - 48px), 24vw")}</a>
            {fastener(i)}
            <span class="pencil" aria-hidden="true">{jitter_spans(str(n), seed_of(i) + 1)}</span>
            <figcaption class="print-cap"><span class="print-title">{esc(p['title'])}</span> <span class="print-from">from {from_link}</span></figcaption>
          </figure>""")
        items.append(f'          <li><span class="list-n">{n}</span> <span class="list-title">{esc(p["title"])}</span> <span class="list-from">from {from_link}</span></li>')
    return f"""    <section class="wall wall--{tone}" id="wall-{tone}" data-wall="{tone}" aria-labelledby="wall-{tone}-title">
      <div class="wall-head">
        <h2 id="wall-{tone}-title">{WALL_NAMES[tone]} <span class="wall-count">{len(prints)} prints</span></h2>
        <button class="wall-enlarge js-only" type="button" data-enlarge="{tone}" aria-controls="wall-{tone}">Click to enlarge</button>
      </div>
      <div class="wall-tools js-only" role="group" aria-label="Walls">
        <button type="button" data-show="both">Both walls</button>
        <button type="button" data-enlarge="{other}">{WALL_NAMES[other]} wall</button>
      </div>
      <div class="board-frame">
        <div class="board" style="--h:{height}" data-board="{tone}" data-v-list data-v-context="{WALL_NAMES[tone]} wall">
{chr(10).join(figures)}
          <span class="board-label" aria-hidden="true">{jitter_spans(WALL_LABELS[tone], seed_of(tone) + 5)}</span>
        </div>
      </div>
      <ol class="wall-list">
{chr(10).join(items)}
      </ol>
    </section>"""


def wall_page(room, versions):
    latest = room.sheets[0]
    description = "Two walls of photographs by Faisal Henar, one in black and white and one in colour, each print first circled on a contact sheet."
    body = f"""
  <main id="main" tabindex="-1" class="room-main">
    <div class="room-head">
      <h1>The wall</h1>
      <p class="room-line">Two walls: one in black and white, one in colour. Each photograph was circled on a contact sheet first.</p>
      <p class="room-latest">Latest sheet: <a href="{sheet_url(latest['id'])}">{esc(latest['title'])}</a> · <a href="{SHEETS_URL}">All contact sheets</a></p>
    </div>

    <div class="wall-switch js-only" role="group" aria-label="Choose a wall">
      <button type="button" data-pick="bw" aria-pressed="true">Black and white</button>
      <button type="button" data-pick="colour" aria-pressed="false">Colour</button>
    </div>

    <div class="walls" data-walls data-pick="bw">
{wall_section(room, "bw")}
{wall_section(room, "colour")}
    </div>
  </main>
"""
    return head("The wall", description, ROOM_URL, versions, section="wall", total=len(room.sheet_of)) + body + foot(versions)


# ---------- the contact sheets ----------

def sheet_meta_line(room, sheet, with_times=True):
    parts = []
    if sheet["places"]: parts.append(", ".join(sheet["places"]))
    stamps = sorted(room.meta[i]["captured"] for i in sheet["frames"] if room.meta[i]["captured"])
    if stamps:
        if with_times:
            same_day = stamps[0][:10] == stamps[-1][:10]
            show = (lambda s: s[11:]) if same_day else (lambda s: f"{fmt_day(s[:10], year=False)} {s[11:]}")
            parts.append(f"{show(stamps[0])} to {show(stamps[-1])}")
        else:
            parts.append(fmt_range(stamps[0][:10], stamps[-1][:10]))
    n = len(sheet["frames"])
    parts.append(f"{n} frame{'' if n == 1 else 's'}")
    return " · ".join(esc(p) for p in parts)


def sheet_page(room, sheet, versions):
    n = len(sheet["frames"])
    frames = []
    for k, i in enumerate(sheet["frames"], 1):
        photo = room.photos[i]
        circled = i in sheet["circled"]
        extra = ""
        if circled: extra += "\n          " + circle_svg(i)
        if i in room.wall_of:
            tone, place, _ = room.wall_of[i]
            extra += f'\n          <span class="wall-mark" aria-hidden="true">{jitter_spans(f"{MARK_WORDS[tone]} {place}", seed_of(i) + 3)}</span>'
        label = f"Frame {k}" + (", circled" if circled else "")
        if i in room.wall_of: label += f", place {room.wall_of[i][1]} on the {WALL_LABELS[room.wall_of[i][0]]} wall"
        place = f'<span class="frame-place">{esc(room.meta[i]["place"])}</span>' if sheet["kind"] == "loose" and room.meta[i]["place"] else ""
        frames.append(f"""        <figure class="frame{' frame--circled' if circled else ''}" id="frame-{k}">
          <a class="frame-photo" href="{photo_url(i)}" {room.viewer_attrs(i)} aria-describedby="frame-{k}-cap">{img_tag(photo, "(max-width: 559px) 45vw, (max-width: 999px) 30vw, 19vw", 400)}</a>
          <figcaption class="frame-cap" id="frame-{k}-cap"><span class="sr-only">{esc(label)}</span><span aria-hidden="true">{k} ▸ {k}A</span>{place}</figcaption>{extra}
        </figure>""")
    line = f'\n      <p class="room-line">{esc(sheet["line"])}</p>' if sheet["line"] else ""
    description = f"A contact sheet of photographs by Faisal Henar: {sheet['title']}, {n} frames."
    body = f"""
  <main id="main" tabindex="-1" class="room-main">
    <div class="room-head">
      <h1>{esc(sheet['title'])}</h1>
      <p class="sheet-meta">{sheet_meta_line(room, sheet)}</p>{line}
    </div>

    <div class="sheet" data-sheet>
      <p class="sheet-edge" aria-hidden="true">faisalhenar.com ▸ {esc(sheet['title'])} ▸ {n} frames</p>
      <div class="sheet-grid" data-v-list data-v-context="{esc(sheet['title'])}">
{chr(10).join(frames)}
      </div>
    </div>
  </main>
"""
    return head(sheet["title"], description, sheet_url(sheet["id"]), versions, section="sheets", total=len(room.sheet_of)) + body + foot(versions)


def sheets_index(room, versions):
    entries = []
    for sheet in room.sheets:
        picks = sheet["circled"] or sheet["frames"][:3]
        thumbs = []
        for i in picks:
            ring = circle_svg(i, " circle--small") if sheet["circled"] else ""
            thumbs.append(f'          <span class="strip-frame">{img_tag(room.photos[i], "120px", 400, (400,))}{ring}</span>')
        entries.append(f"""      <li class="sheet-entry">
        <h2><a href="{sheet_url(sheet['id'])}">{esc(sheet['title'])}</a></h2>
        <p class="sheet-meta">{sheet_meta_line(room, sheet, with_times=False)}</p>
        <a class="sheet-strip" href="{sheet_url(sheet['id'])}" tabindex="-1" aria-hidden="true">
{chr(10).join(thumbs)}
        </a>
      </li>""")
    description = "Every contact sheet in Faisal Henar's photography room: each walk, day and trip, newest first."
    body = f"""
  <main id="main" tabindex="-1" class="room-main">
    <div class="room-head">
      <h1>Contact sheets</h1>
      <p class="room-line">Every walk, day and trip, newest first. Circled frames are the ones that made it onto a wall.</p>
    </div>

    <ol class="sheet-list">
{chr(10).join(entries)}
    </ol>
  </main>
"""
    return head("Contact sheets", description, SHEETS_URL, versions, section="sheets", total=len(room.sheet_of)) + body + foot(versions)


# ---------- a page per photograph ----------

def photo_page(room, i, versions):
    photo = room.photos[i]; sheet = room.sheet_of[i]; k = room.frame_no(i)
    frames = sheet["frames"]
    prev_id = frames[k - 2] if k > 1 else None
    next_id = frames[k] if k < len(frames) else None
    nav = []
    if prev_id: nav.append(f'<a class="step step--prev" href="{photo_url(prev_id)}" rel="prev">&larr; Frame {k - 1}</a>')
    if next_id: nav.append(f'<a class="step step--next" href="{photo_url(next_id)}" rel="next">Frame {k + 1} &rarr;</a>')
    lines = []
    if room.place_line(i): lines.append(f'<p class="photo-meta">{esc(room.place_line(i))}</p>')
    lines.append(f'<p class="photo-from"><a href="{room.from_href(i)}">{esc(room.from_label(i))}</a></p>')
    if i in room.wall_of: lines.append(f'<p class="photo-wall"><a href="{room.wall_href(i)}">{esc(room.wall_line(i))}</a></p>')
    og_h = round(OG_WIDTH * photo["h"] / photo["w"])
    og = (f"{ORIGIN}{cf_image(photo, OG_WIDTH)}", OG_WIDTH, og_h)
    body = f"""
  <main id="main" tabindex="-1" class="room-main photo-main">
    {crumbs((sheet["title"], sheet_url(sheet["id"])))}
    <figure class="photo">
      <div class="photo-frame">{img_tag(photo, "(max-width: 760px) 100vw, 90vw", 1200, PAGE_WIDTHS, lazy=False)}</div>
      <figcaption class="photo-cap">
        <h1>{esc(room.heading(i))}</h1>
        <p class="photo-desc">{esc(photo['alt'])}</p>
        {chr(10).join("        " + l if n else l for n, l in enumerate(lines))}
      </figcaption>
    </figure>
    <nav class="photo-steps" aria-label="Frames on this sheet">
      {chr(10).join(nav)}
    </nav>
  </main>
"""
    return head(room.heading(i), photo["alt"], photo_url(i), versions, og, section="sheets", total=len(room.sheet_of)) + body + foot(versions)


# ---------- everything ----------

def everything_page(room, versions):
    order = sorted(room.sheet_of, key=lambda i: (room.meta[i]["captured"], i), reverse=True)
    months, current = [], None
    for i in order:
        key = room.meta[i]["captured"][:7]
        if key != current:
            months.append((key, [])); current = key
        months[-1][1].append(i)
    sections = []
    for key, ids in months:
        y, m = key.split("-")
        items = []
        for i in ids:
            p = room.photos[i]; r = p["w"] / p["h"]
            sizes = f'(max-width: 760px) {round(r * ROW_HEIGHT["phone"])}px, {round(r * ROW_HEIGHT["computer"])}px'
            items.append(
                f'          <a class="ev-item" href="{photo_url(i)}" style="--r:{r:.4f}" '
                f'data-place="{room.meta[i]["country"].lower()}" data-tone="{room.meta[i]["tone"]}" {room.viewer_attrs(i)}>'
                f'{img_tag(p, sizes, 300, EVERYTHING_WIDTHS)}</a>')
        sections.append(f"""      <section class="ev-month" aria-labelledby="month-{key}" data-month>
        <h2 class="ev-month-head" id="month-{key}">{MONTHS[int(m) - 1]} {y}</h2>
        <div class="ev-grid">
{chr(10).join(items)}
        </div>
      </section>""")

    def group(name, label, options):
        buttons = "".join(
            f'\n          <button type="button" data-filter="{name}" data-value="{value}" aria-pressed="' + ("true" if value == "all" else "false") + f'">{text}</button>'
            for value, text in options)
        return f"""        <div class="filter-group" role="group" aria-label="{label}">
          <span class="filter-label" aria-hidden="true">{label}</span>{buttons}
        </div>"""

    total = len(order)
    places = [("all", "All")] + [(c.lower(), c) for c in COUNTRIES]
    tones = [("all", "All"), ("bw", "Black and white"), ("colour", "Colour")]
    description = "Every photograph in Faisal Henar's photography room, newest first, by place and by black and white or colour."
    body = f"""
  <main id="main" tabindex="-1" class="room-main">
    <div class="room-head">
      <h1>Everything</h1>
      <p class="room-line">Every photograph I kept, newest first.</p>
    </div>

    <div class="filters js-only" data-filters>
{group("place", "Place", places)}
{group("tone", "Tone", tones)}
      <p class="filter-count" aria-live="polite">Showing <span data-count>{total}</span> of {total}</p>
    </div>

    <div class="everything" data-everything data-v-list data-v-context="Everything">
{chr(10).join(sections)}
    </div>
  </main>
"""
    return head("Everything", description, EVERYTHING_URL, versions, section="everything", total=total) + body + foot(versions)


def check_everything(text, ids):
    """Every photograph exactly once on Everything."""
    found = re.findall(r'class="ev-item" href="/photography/room/p/([^/]+)/"', text)
    counts = {i: found.count(i) for i in set(found) | set(ids)}
    wrong = sorted(f"{i} appears {n} times" for i, n in counts.items() if n != 1)
    if wrong:
        raise SystemExit("ERROR: Everything must show every photograph exactly once:\n  " + "\n  ".join(wrong))


# ---------- main ----------

def main():
    photos = {p["id"]: p for p in load("photos.json")}
    sheets = load("sheets.json")["sheets"]
    walls = load("walls.json")
    meta = load("photo-meta.json")
    validate(photos, sheets, walls, meta)
    room = Room(photos, sheets, walls, meta)

    folio = read(os.path.join(ROOT, "photography", "index.html"))
    base = re.search(r'css/base\.css\?v=(\d+)', folio)
    menu = re.search(r'js/menu\.js\?v=(\d+)', folio)
    if not base or not menu:
        raise SystemExit("ERROR: could not read the base.css and menu.js versions from photography/index.html.")
    versions = {"base": base.group(1), "menu": menu.group(1)}

    pages = {}
    if "wall" in BUILD:
        pages[os.path.join(ROOM, "index.html")] = wall_page(room, versions)
    if "sheets-index" in BUILD:
        pages[os.path.join(ROOM, "sheets", "index.html")] = sheets_index(room, versions)
    if "sheets" in BUILD:
        for sheet in sheets:
            pages[os.path.join(ROOM, "sheets", sheet["id"], "index.html")] = sheet_page(room, sheet, versions)
    if "photographs" in BUILD:
        for i in room.sheet_of:
            pages[os.path.join(ROOM, "p", i, "index.html")] = photo_page(room, i, versions)

    if "everything" in BUILD:
        path = os.path.join(ROOM, "everything", "index.html")
        pages[path] = everything_page(room, versions)
        check_everything(pages[path], room.sheet_of)

    check_pages(pages)

    written = 0
    for path, markup in pages.items():
        if not os.path.exists(path) or read(path) != markup:
            write(path, markup)
            written += 1
    print("Photography room: %d sheets, %d prints on the walls, %d pages built, %d rewritten."
          % (len(sheets), len(walls["bw"]) + len(walls["colour"]), len(pages), written))


if __name__ == "__main__":
    main()
