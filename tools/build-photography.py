# -*- coding: utf-8 -*-
"""Write the static pages of the photography room at /photography/room/.

The room is two walls of prints and, behind them, the contact sheets each
print was circled on. Everything is laid out here, at build time, so the
pages work with JavaScript off and look the same on every build: circles,
handwriting wobble and the positions on the boards all come from seeded
randomness keyed on the photograph's id.

Reads (never writes):
  photography/data/photos.json       the master collection: src, w, h, alt
  photography/data/sheets.json       contact sheets, newest first
  photography/data/walls.json        the two walls, in hanging order
  photography/data/photo-meta.json   tone, place and local capture time

Writes:
  photography/room/index.html                   the wall
  photography/room/sheets/<sheet-id>/index.html one per sheet in BUILD_SHEETS

room.css and room.js beside the pages are written by hand, not by this tool.
The pages carry the same ?v= as the rest of the site for base.css and
menu.js, read from photography/index.html.

Run from the repository root:  python3 tools/build-photography.py
"""
import hashlib, html, json, math, os, random, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ORIGIN = "https://faisalhenar.com"
DATA = os.path.join(ROOT, "photography", "data")
ROOM = os.path.join(ROOT, "photography", "room")
ROOM_URL = "/photography/room/"

# Sheets that get a page. Later phases add to this list; a sheet not listed
# here is named in plain text wherever it is mentioned, never linked.
BUILD_SHEETS = [
    "2026-09-04-dawn-to-the-churches",
]

ROOM_CSS_VERSION = "2"
ROOM_JS_VERSION = "2"

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
LARGE_WIDTH = 2000
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


def circle_svg(photo_id):
    d = loop_path(seed_of(photo_id))
    return ('<svg class="circle" viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
            f'<path d="{d}" pathLength="100" stroke-width="1.25" opacity="0.92"/>'
            f'<path d="{d}" pathLength="100" stroke-width="0.5" opacity="0.45" transform="translate(0.6 0.5)"/>'
            '</svg>')


# ---------- images: the same Cloudflare URLs as photography/js/image-url.js ----------

def original(photo):
    return "/photography/" + photo["src"]


def cf_image(photo, width):
    return f"/cdn-cgi/image/width={width},fit=scale-down,format=auto/photography/{photo['src']}"


def img_tag(photo, sizes, src_width=800):
    widths = [w for w in IMAGE_WIDTHS if w <= photo["w"]] or [photo["w"]]
    srcset = ", ".join(f"{cf_image(photo, w)} {w}w" for w in widths)
    return (f'<img src="{cf_image(photo, src_width)}" srcset="{srcset}" sizes="{sizes}" '
            f'data-orig="{original(photo)}" width="{photo["w"]}" height="{photo["h"]}" '
            f'alt="{esc(photo["alt"])}" loading="lazy" decoding="async">')


def large_href(photo):
    return f'href="{cf_image(photo, LARGE_WIDTH)}" data-orig="{original(photo)}"'


# ---------- validation ----------

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
    for name in BUILD_SHEETS:
        if name not in {s["id"] for s in sheets}: problems.append(f"BUILD_SHEETS names {name}, which is not in sheets.json.")
    if problems:
        raise SystemExit("ERROR: the photography room data does not hold together:\n  " + "\n  ".join(problems))


# ---------- shared page parts ----------

def head(title, description, url, versions):
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
<meta property="og:image" content="https://faisalhenar.com/images/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)} · Faisal Henar">
<meta name="twitter:description" content="{esc(description)}">
<meta name="twitter:image" content="https://faisalhenar.com/images/og-image.png">
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
"""


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


def sheet_url(sheet_id):
    return f"{ROOM_URL}sheets/{sheet_id}/"


def frame_ref(sheet, photo_id, built):
    """'<sheet title>, frame <n>': a link when the sheet has a page, plain text otherwise."""
    n = sheet["frames"].index(photo_id) + 1
    text = f"{esc(sheet['title'])}, frame {n}"
    if sheet["id"] in built:
        return f'<a href="{sheet_url(sheet["id"])}#frame-{n}">{text}</a>'
    return text


# ---------- the wall ----------

def fastener(photo_id):
    kind = random.Random(seed_of(photo_id) + 7).choice(FASTENERS)
    return f'<span class="fastener fastener--{kind}" aria-hidden="true"></span>'


def wall_section(tone, prints, photos, sheet_of, built):
    portrait = {p["id"] for p in prints if photos[p["id"]]["h"] > photos[p["id"]]["w"]}
    positions, height = board_layout([p["id"] for p in prints], WALL_SEEDS[tone], portrait)
    other = "colour" if tone == "bw" else "bw"
    figures, items = [], []
    for n, (p, pos) in enumerate(zip(prints, positions), 1):
        i = p["id"]; photo = photos[i]; sheet = sheet_of[i]
        shape = "portrait" if i in portrait else "landscape"
        if sheet["id"] in built:
            target = f'href="{sheet_url(sheet["id"])}#frame-{sheet["frames"].index(i) + 1}"'
        else:
            target = large_href(photo)
        figures.append(f"""          <figure class="print print--{shape}" style="--x:{pos['x']};--y:{pos['y']};--w:{pos['w']};--rot:{pos['rot']}deg">
            <a class="print-photo" {target}>{img_tag(photo, "(max-width: 760px) calc(100vw - 48px), 24vw")}</a>
            {fastener(i)}
            <span class="pencil" aria-hidden="true">{jitter_spans(str(n), seed_of(i) + 1)}</span>
            <figcaption class="print-cap"><span class="print-title">{esc(p['title'])}</span> <span class="print-from">from {frame_ref(sheet, i, built)}</span></figcaption>
          </figure>""")
        items.append(f'          <li><span class="list-n">{n}</span> <span class="list-title">{esc(p["title"])}</span> <span class="list-from">from {frame_ref(sheet, i, built)}</span></li>')
    count = len(prints)
    return f"""    <section class="wall wall--{tone}" id="wall-{tone}" data-wall="{tone}" aria-labelledby="wall-{tone}-title">
      <div class="wall-head">
        <h2 id="wall-{tone}-title">{WALL_NAMES[tone]} <span class="wall-count">{count} prints</span></h2>
        <button class="wall-enlarge js-only" type="button" data-enlarge="{tone}" aria-controls="wall-{tone}">Click to enlarge</button>
      </div>
      <div class="wall-tools js-only" role="group" aria-label="Walls">
        <button type="button" data-show="both">Both walls</button>
        <button type="button" data-enlarge="{other}">{WALL_NAMES[other]} wall</button>
      </div>
      <div class="board-frame">
        <div class="board" style="--h:{height}" data-board="{tone}">
{chr(10).join(figures)}
          <span class="board-label" aria-hidden="true">{jitter_spans(WALL_LABELS[tone], seed_of(tone) + 5)}</span>
        </div>
      </div>
      <ol class="wall-list">
{chr(10).join(items)}
      </ol>
    </section>"""


def wall_page(photos, sheets, walls, sheet_of, versions, built):
    latest = sheets[0]
    latest_ref = (f'<a href="{sheet_url(latest["id"])}">{esc(latest["title"])}</a>'
                  if latest["id"] in built else esc(latest["title"]))
    description = "Two walls of photographs by Faisal Henar, one in black and white and one in colour, each print first circled on a contact sheet."
    body = f"""
  <main id="main" tabindex="-1" class="room-main">
    <div class="room-head">
      <h1>The wall</h1>
      <p class="room-line">Two walls: one in black and white, one in colour. Each photograph was circled on a contact sheet first.</p>
      <p class="room-latest">Latest sheet: {latest_ref}</p>
    </div>

    <div class="wall-switch js-only" role="group" aria-label="Choose a wall">
      <button type="button" data-pick="bw" aria-pressed="true">Black and white</button>
      <button type="button" data-pick="colour" aria-pressed="false">Colour</button>
    </div>

    <div class="walls" data-walls data-pick="bw">
{wall_section("bw", walls["bw"], photos, sheet_of, built)}
{wall_section("colour", walls["colour"], photos, sheet_of, built)}
    </div>
  </main>
"""
    return head("The wall", description, ROOM_URL, versions) + body + foot(versions)


# ---------- a contact sheet ----------

def fmt_time(stamp, with_day):
    date, clock = stamp.split("T")
    if not with_day: return clock
    _, month, day = date.split("-")
    return f"{int(day)} {MONTHS[int(month) - 1]} {clock}"


def sheet_meta_line(sheet, meta):
    parts = []
    if sheet["places"]: parts.append(", ".join(sheet["places"]))
    times = sorted(meta[i]["captured"] for i in sheet["frames"] if meta[i]["captured"])
    if times:
        same_day = times[0][:10] == times[-1][:10]
        parts.append(f"{fmt_time(times[0], not same_day)} to {fmt_time(times[-1], not same_day)}")
    n = len(sheet["frames"])
    parts.append(f"{n} frame{'' if n == 1 else 's'}")
    return " · ".join(esc(p) for p in parts)


def sheet_page(sheet, photos, meta, walls, versions):
    marks = {p["id"]: (t, n) for t in ("bw", "colour") for n, p in enumerate(walls[t], 1)}
    n = len(sheet["frames"])
    frames = []
    for k, i in enumerate(sheet["frames"], 1):
        photo = photos[i]
        circled = i in sheet["circled"]
        extra = ""
        if circled: extra += "\n          " + circle_svg(i)
        if i in marks: extra += f'\n          <span class="wall-mark" aria-hidden="true">{jitter_spans(f"{MARK_WORDS[marks[i][0]]} {marks[i][1]}", seed_of(i) + 3)}</span>'
        label = f"Frame {k}" + (", circled" if circled else "")
        if i in marks: label += f", print {marks[i][1]} on the {WALL_LABELS[marks[i][0]]} wall"
        frames.append(f"""        <figure class="frame{' frame--circled' if circled else ''}" id="frame-{k}">
          <a class="frame-photo" {large_href(photo)} aria-describedby="frame-{k}-cap">{img_tag(photo, "(max-width: 559px) 45vw, (max-width: 999px) 30vw, 19vw", 400)}</a>
          <figcaption class="frame-cap" id="frame-{k}-cap"><span class="sr-only">{esc(label)}</span><span aria-hidden="true">{k} ▸ {k}A</span></figcaption>{extra}
        </figure>""")
    line = f'\n      <p class="room-line">{esc(sheet["line"])}</p>' if sheet["line"] else ""
    description = f"A contact sheet of photographs by Faisal Henar: {sheet['title']}, {n} frames."
    body = f"""
  <main id="main" tabindex="-1" class="room-main">
    <div class="room-head">
      <p class="room-crumb"><a href="{ROOM_URL}">The wall</a></p>
      <h1>{esc(sheet['title'])}</h1>
      <p class="sheet-meta">{sheet_meta_line(sheet, meta)}</p>{line}
    </div>

    <div class="sheet" data-sheet>
      <p class="sheet-edge" aria-hidden="true">faisalhenar.com ▸ {esc(sheet['title'])} ▸ {n} frames</p>
      <div class="sheet-grid">
{chr(10).join(frames)}
      </div>
    </div>
  </main>
"""
    return head(sheet["title"], description, sheet_url(sheet["id"]), versions) + body + foot(versions)


# ---------- main ----------

def main():
    photos = {p["id"]: p for p in load("photos.json")}
    sheets = load("sheets.json")["sheets"]
    walls = load("walls.json")
    meta = load("photo-meta.json")
    validate(photos, sheets, walls, meta)

    folio = read(os.path.join(ROOT, "photography", "index.html"))
    base = re.search(r'css/base\.css\?v=(\d+)', folio)
    menu = re.search(r'js/menu\.js\?v=(\d+)', folio)
    if not base or not menu:
        raise SystemExit("ERROR: could not read the base.css and menu.js versions from photography/index.html.")
    versions = {"base": base.group(1), "menu": menu.group(1)}

    sheet_of = {i: s for s in sheets for i in s["frames"]}
    built = set(BUILD_SHEETS)
    pages = {os.path.join(ROOM, "index.html"): wall_page(photos, sheets, walls, sheet_of, versions, built)}
    for sheet in sheets:
        if sheet["id"] in built:
            pages[os.path.join(ROOM, "sheets", sheet["id"], "index.html")] = sheet_page(sheet, photos, meta, walls, versions)

    written = 0
    for path, markup in pages.items():
        if not os.path.exists(path) or read(path) != markup:
            write(path, markup)
            written += 1
    print("Photography room: %d sheets, %d prints on the walls, %d page%s built, %d rewritten."
          % (len(sheets), len(walls["bw"]) + len(walls["colour"]), len(pages),
             "" if len(pages) == 1 else "s", written))


if __name__ == "__main__":
    main()
