# -*- coding: utf-8 -*-
"""Write one static page per published Reflection, plus the archive list on
practice/reflections.html and the Reflection entries in sitemap.xml.

Until September 2026 the eight Reflections lived inside one accordion on one
page. Nothing could be linked to with a preview, nothing could be found by
someone searching for the sutta, and the page itself rendered a few hundred
characters of visible text. The writing was there; the page was hiding it.

This tool changes none of the writing. It reads practice/js/suttas-config.js
and lays the same words out as pages.

  practice/reflections/<slug>.html   one per published Reflection
  practice/reflections.html          the archive, between its BUILD markers
  sitemap.xml                        the Reflection pages, between its markers

A Reflection is published when `note` is non-empty and `added` holds a date.
Queued entries are ignored and get no page.

SLUGS ARE FROZEN. The first time an entry is published this tool works a slug
out from its title and writes it back into suttas-config.js as a `slug` field.
After that the slug is read, never recomputed, so editing a title later does
not move a page that people may already have linked to. To move a page on
purpose, change the slug by hand and leave a redirect behind.

Run from the repository root:  python3 tools/build-reflections.py
Then run tools/validate-site.py, which checks the result.
"""
import datetime, html, importlib.util, os, re, sys, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ORIGIN = "https://faisalhenar.com"
OUT_DIR = os.path.join(ROOT, "practice", "reflections")

# The JavaScript data reader already written for the validator. It parses a
# strict data literal and executes nothing.
_spec = importlib.util.spec_from_file_location("site_validator", os.path.join(HERE, "validate-site.py"))
_validator = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_validator)
declaration = _validator.declaration

CONFIG = os.path.join(ROOT, "practice", "js", "suttas-config.js")
# "Elsewhere in the notebook": the same data the room pages read.
CROSSLINKS_PATH = os.path.join(ROOT, "practice", "data", "crosslinks.json")
CROSSLINKS = {}
ARCHIVE = os.path.join(ROOT, "practice", "reflections.html")
SITEMAP = os.path.join(ROOT, "sitemap.xml")

MARK_OPEN = "<!-- BUILD:reflections -->"
MARK_CLOSE = "<!-- /BUILD:reflections -->"


def read(path):
    with open(path, encoding="utf-8", newline="") as handle:
        return handle.read()


def write(path, text):
    # LF endings, enforced for the whole repository by .gitattributes.
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)


def esc(value):
    """Escape for both text and double-quoted attributes.

    Deliberately not html.escape's quote=True, which also turns every
    apostrophe into &#x27;. Attributes here are always double-quoted, so an
    apostrophe is safe, and "In the Buddha's Words" should read as itself in
    the source of the page as well as on it.
    """
    return (str(value).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def slugify(title):
    text = unicodedata.normalize("NFKD", title)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower().replace("'", "").replace("’", "")
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text


def fmt_date(iso):
    return datetime.date.fromisoformat(iso).strftime("%d %B %Y").lstrip("0")


def strip_tags(value):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", value)).strip()


def description(entry):
    """The opening of the note, cut at a word boundary.

    The note is the only honest summary available: anything else would be a
    sentence written about the writing rather than the writing itself.
    """
    text = html.unescape(strip_tags(entry["note"]))
    if len(text) <= 155:
        return text
    cut = text[:155]
    space = cut.rfind(" ")
    if space > 80:
        cut = cut[:space]
    return cut.rstrip(" ,;:.") + "..."


def subtitle(entry):
    """Reference and source title, for the Reflection's own page."""
    reference = entry.get("ref") or entry.get("sourceLocation") or ""
    source = entry.get("sourceTitle") or entry.get("suttaTitle") or ""
    if not reference:
        return esc(source) if source else ""
    return esc(reference) + (" &middot; " + esc(source) if source else "")


def archive_reference(entry):
    """The shorter form, for the contents page: one name for the text, not two.

    The Pali title is carried on the Reflection's own page, under the
    heading, where there is room for it. Here it is the difference between
    every row fitting on one line and the longest one folding its date onto
    a second, which made the list look like two different designs.

    The "from" that marks an excerpt is dropped here for the same reason it
    is kept there. A contents column answers which text; the reader learns
    it is a passage the moment they open the page, which is when it starts
    to matter. Leaving it in put one lowercase word in a column of bare
    references, four times over once the queue is published.
    """
    reference = (entry.get("ref") or entry.get("sourceLocation")
                 or entry.get("sourceTitle") or entry.get("suttaTitle") or "")
    return esc(re.sub(r"^from\s+", "", reference.strip(), flags=re.I))


def structural(entry):
    parts = []
    if entry.get("label"):
        parts.append(esc(entry["label"]))
    if entry.get("translator") and entry["translator"] != "sujato":
        parts.append("trans. " + esc(entry["translator"]))
    return " &middot; ".join(parts)


def source_url(entry):
    return entry.get("sourceUrl") or entry.get("url") or ""


def source_label(url):
    return "Read on SuttaCentral" if re.match(r"^https://(?:www\.)?suttacentral\.net(?:/|$)", url, re.I) else "Read the source"


# How a translator key in suttas-config.js is named under the excerpt.
TRANSLATORS = {"sujato": "Bhikkhu Sujato"}


def excerpt_markup(entry, indent):
    if not entry.get("excerpt"):
        return ""
    lines = [line.strip() for line in entry["excerpt"].split("\n") if line.strip()]
    quote = '<blockquote class="reflections-excerpt">' + "<br>\n".join(lines) + "</blockquote>"
    url = source_url(entry)
    if not url:
        block = quote
    else:
        block = ('<a class="reflections-excerpt-link" href="' + esc(url) + '" target="_blank" rel="noopener">'
                 + quote + "</a>")
    # The translator directly under the passage (October 2026), so the
    # sutta's words and whose English they are read as one block, set
    # apart from the reflection that follows.
    if entry.get("translator"):
        name = TRANSLATORS.get(entry["translator"], entry["translator"])
        block += '\n<p class="reflections-excerpt-credit mono">Translated by ' + esc(name) + "</p>"
    return "\n".join(indent + line for line in block.split("\n")) + "\n"


def note_markup(entry, indent):
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", entry["note"]) if p.strip()]
    # The note deliberately carries HTML: some entries have an inline link to
    # SuttaCentral inside the prose. It is written raw here for the same
    # reason render-reflections.js wrote it raw.
    return "".join(indent + '<p class="reflection-note">' + p + "</p>\n" for p in paragraphs)


def page_order(books, published):
    """Published entries, grouped by section, in the order that section uses."""
    groups = []
    for key in books:
        entries = [e for e in published if e.get("book") == key]
        if books[key].get("order") == "structural":
            entries.sort(key=lambda e: e["_index"])
        else:
            entries.sort(key=lambda e: (e["added"], e["_index"]), reverse=True)
        if entries:
            groups.append({"key": key, "section": books[key], "entries": entries})
    return groups


NAV = """          <a href="../../">Home</a>
          <a href="../" class="current" aria-current="true">Practice</a>
          <a href="../../photography/">Photography</a>
          <a href="../../elsewhere.html">Elsewhere</a>
          <a href="../../note.html">A note from me</a>
          <a href="../../contact.html">Contact</a>"""

# The Reflections notebook, small, above the title (October 2026): the same
# drawing as on the Practice hub's shelf. It inks itself in on arrival
# (notebook.css), then stays still.
ICON = ('<svg class="nb-art nb-art-small ink" width="60" height="50" viewBox="0 0 120 100" stroke-width="2.2" '
        'aria-hidden="true" focusable="false" style="--d: .1s">'
        '<rect pathLength="1" x="30" y="24" width="54" height="76" rx="3"></rect>'
        '<path class="open" pathLength="1" d="M38 24 L38 100"></path>'
        '<rect class="open" pathLength="1" x="50" y="40" width="24" height="12"></rect>'
        '<rect class="moss" pathLength="1" x="92" y="44" width="6" height="56" rx="3"></rect></svg>')

NUMBERS = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
           "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen",
           "Nineteen", "Twenty"]


def in_words(n):
    return NUMBERS[n] if n < len(NUMBERS) else str(n)


def sentences(text):
    return [s for s in re.split(r"(?<=[.!?])\s+(?=[A-Z“\"'‘])", text.strip()) if s]


def opening(entry, at_least=200):
    """The opening of the note, in whole sentences and word for word: what
    the Reflections room shows in its panel before the reader goes on to the
    page. Never the sutta passage: that belongs to the page itself."""
    first = re.split(r"\n\s*\n", entry["note"].strip())[0]
    text = html.unescape(strip_tags(first))
    out = []
    for sentence in sentences(text):
        out.append(sentence)
        if len(" ".join(out)) >= at_least:
            break
    return " ".join(out)


def also_markup(key, indent, base=""):
    """Elsewhere in the notebook, from practice/data/crosslinks.json."""
    links = CROSSLINKS.get(key) or []
    if not links:
        return ""
    rows = [indent + '<div class="nb-also">', indent + '  <h2 class="nb-also-h">Elsewhere in the notebook</h2>']
    for link in links:
        href = link["href"]
        if base and not re.match(r"^(?:[a-z]+:|/|#)", href):
            href = base + href
        rows.append(indent + '  <a href="' + esc(href) + '"><span class="nb-also-t">' + esc(link["t"])
                    + '</span><span class="nb-also-r">' + esc(link["room"]) + "</span></a>")
    rows.append(indent + "</div>")
    return "\n".join(rows) + "\n"


def nav_markup(previous, total):
    """Before it in the book (the anthology only, where there is one), and
    the archive with the count of published Reflections."""
    rows = []
    if previous:
        rows.append('      <a class="nb-ref-step" rel="prev" href="' + esc(previous["slug"]) + '.html">'
                    '<span class="nb-ref-step-l">&larr; Before it in the book</span>'
                    '<span class="nb-ref-step-t">' + esc(previous["title"]) + "</span></a>")
    rows.append('      <a class="nb-ref-step nb-ref-step-all" href="../reflections.html">'
                '<span class="nb-ref-step-l">All reflections &rarr;</span>'
                '<span class="nb-ref-step-t">' + in_words(total) + " so far</span></a>")
    return ('    <nav class="nb-ref-nav" aria-label="More reflections">\n' + "\n".join(rows) + "\n    </nav>\n")


def page_markup(entry, previous, total, section, css_version, base_version, menu_version, draw_version="1"):
    url = ORIGIN + "/practice/reflections/" + entry["slug"] + ".html"
    title = esc(entry["title"]) + " &middot; Reflections &middot; Faisal Henar"
    desc = esc(description(entry))
    sub = subtitle(entry)
    struct = structural(entry)
    url_source = source_url(entry)

    ld = [
        "{",
        '  "@context": "https://schema.org",',
        '  "@type": "Article",',
        '  "headline": ' + jsonstr(entry["title"]) + ",",
        '  "description": ' + jsonstr(description(entry)) + ",",
        '  "datePublished": ' + jsonstr(entry["added"]) + ",",
        '  "inLanguage": "en",',
        '  "author": { "@type": "Person", "name": "Faisal Henar" },',
        '  "publisher": { "@type": "Person", "name": "Faisal Henar" },',
        '  "isPartOf": { "@type": "Blog", "name": ' + jsonstr(section["title"]) + ', "url": "' + ORIGIN + '/practice/reflections.html" },',
        '  "mainEntityOfPage": { "@type": "WebPage", "@id": "' + url + '" }' + ("," if url_source else ""),
    ]
    if url_source:
        ld.append('  "citation": ' + jsonstr(url_source))
    ld.append("}")

    parts = []
    parts.append("<!DOCTYPE html>")
    parts.append('<html lang="en">')
    parts.append("<head>")
    parts.append('<meta charset="UTF-8">')
    parts.append('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    parts.append('<link rel="icon" href="/favicon.ico" sizes="any">')
    parts.append('<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">')
    parts.append('<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">')
    parts.append('<link rel="apple-touch-icon" href="/apple-touch-icon.png">')
    parts.append("<title>" + title + "</title>")
    parts.append('<meta name="description" content="' + desc + '">')
    parts.append('<link rel="canonical" href="' + url + '">')
    parts.append('<meta property="og:title" content="' + title + '">')
    parts.append('<meta property="og:description" content="' + desc + '">')
    parts.append('<meta property="og:type" content="article">')
    parts.append('<meta property="og:url" content="' + url + '">')
    parts.append('<meta property="article:published_time" content="' + esc(entry["added"]) + '">')
    parts.append('<meta property="og:image" content="' + ORIGIN + '/images/og-image.png">')
    parts.append('<meta property="og:image:width" content="1200">')
    parts.append('<meta property="og:image:height" content="630">')
    parts.append('<meta name="twitter:card" content="summary_large_image">')
    parts.append('<meta name="twitter:title" content="' + title + '">')
    parts.append('<meta name="twitter:description" content="' + desc + '">')
    parts.append('<meta name="twitter:image" content="' + ORIGIN + '/images/og-image.png">')
    # base.css first, then the section's own: the shared chrome is drawn by
    # the first and re-tuned by the second, so the order is load-bearing.
    parts.append('<link rel="stylesheet" href="/css/base.css?v=' + base_version + '">')
    parts.append('<link rel="stylesheet" href="../css/notebook.css?v=' + css_version + '">')
    parts.append('<script src="../js/notebook/draw.js?v=' + draw_version + '"></script>')
    parts.append('<script type="application/ld+json">')
    parts.extend(ld)
    parts.append("</script>")
    parts.append("<!-- Cloudflare Web Analytics -->")
    parts.append("<script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{\"token\": \"68bb7041afa74c9ea4d36891d27ae977\"}'></script>")
    parts.append("<!-- End Cloudflare Web Analytics -->")
    parts.append("</head>")
    parts.append('<body class="nb-page nb-reflection-page">')
    parts.append("")
    parts.append('  <a class="skip-link" href="#main">Skip to content</a>')
    parts.append("")
    parts.append('  <header class="room-header">')
    parts.append('    <a class="mark" href="/">Faisal Henar / Paramaribo</a>')
    parts.append('    <div class="room-header-right">')
    parts.append('      <span class="section-label">I · Practice</span>')
    parts.append('      <div class="menu" data-menu>')
    parts.append('        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu-panel" data-menu-btn>Menu</button>')
    parts.append('        <nav class="menu-panel" id="site-menu-panel" data-menu-panel aria-label="Site sections">')
    parts.append(NAV)
    parts.append("        </nav>")
    parts.append("      </div>")
    parts.append("    </div>")
    parts.append("  </header>")
    parts.append("")
    parts.append('  <main id="main" class="nb-main" tabindex="-1">')
    parts.append('  <article class="nb-ref">')
    top = esc(section["title"]) + (" &middot; " + struct if struct else "")
    parts.append('    <div class="nb-topline"><a class="nb-back" href="../reflections.html">&larr; Reflections</a><span>' + top + "</span></div>")
    parts.append("    " + ICON)
    parts.append('    <h1 class="nb-ref-h1">' + esc(entry["title"]) + "</h1>")
    parts.append('    <div class="nb-ref-meta fade-in" style="--d: .7s">' + (sub + " &middot; " if sub else "") + fmt_date(entry["added"]) + "</div>")
    if entry.get("excerpt"):
        lines = [line.strip() for line in entry["excerpt"].split("\n") if line.strip()]
        parts.append('    <figure class="nb-ref-passage fade-in" style="--d: .9s">')
        parts.append('      <blockquote class="reflections-excerpt">' + "<br>\n".join(lines) + "</blockquote>")
        credit = []
        if entry.get("translator"):
            credit.append("Translated by " + esc(TRANSLATORS.get(entry["translator"], entry["translator"])))
        if url_source:
            label = "read the whole sutta" if source_label(url_source) == "Read on SuttaCentral" else "read the source"
            credit.append('<a href="' + esc(url_source) + '" target="_blank" rel="noopener">' + label + '<span aria-hidden="true">&#8239;↗</span></a>')
        if credit:
            parts.append('      <figcaption class="nb-ref-credit">' + " &middot; ".join(credit) + "</figcaption>")
        parts.append("    </figure>")
    parts.append('    <div class="nb-ref-note fade-in" style="--d: 1.1s">')
    parts.append(note_markup(entry, "      ").rstrip("\n"))
    parts.append("    </div>")
    also = also_markup("reflections.html#" + entry["slug"], "    ", "../")
    if also:
        parts.append(also.rstrip("\n"))
    parts.append(nav_markup(previous, total).rstrip("\n"))
    parts.append("  </article>")
    parts.append("  </main>")
    parts.append("")
    parts.append('  <footer class="site-footer">')
    parts.append('    <nav class="footer-nav" aria-label="More">')
    parts.append('      <a href="../../note.html">A note from me</a>')
    parts.append('      <a href="../../contact.html">Contact</a>')
    parts.append('      <a href="../../elsewhere.html">Elsewhere</a>')
    parts.append("    </nav>")
    parts.append('    <div class="footer-meta">')
    parts.append('      <span>&copy; <span id="year"></span> Faisal Henar</span>')
    parts.append("      <span>Built quietly, updated slowly</span>")
    parts.append("    </div>")
    parts.append("    <noscript>")
    parts.append('      <nav class="footer-nav" aria-label="Site sections">')
    parts.append('        <a href="../../">Home</a>')
    parts.append('        <a href="../">Practice</a>')
    parts.append('        <a href="../../photography/">Photography</a>')
    parts.append("      </nav>")
    parts.append("    </noscript>")
    parts.append("  </footer>")
    parts.append("")
    parts.append('  <script src="../../js/menu.js?v=' + menu_version + '"></script>')
    parts.append("</body>")
    parts.append("</html>")
    return "\n".join(parts) + "\n"


def jsonstr(value):
    import json
    return json.dumps(value, ensure_ascii=False)


def withdrawn_markup(slug, css_version, base_version, menu_version):
    """The page left behind when a Reflection stops being published.

    Deleting it would break every link anyone has shared, and leaving the
    essay up would defeat the point of withdrawing it. So the text goes and
    the address stays, pointing at the archive. Nothing is destroyed: publish
    the entry again and this file is overwritten with the Reflection.

    It is marked noindex, which is also what keeps it out of the sitemap;
    tools/validate-site.py treats those two as the same decision.
    """
    url = ORIGIN + "/practice/reflections/" + slug + ".html"
    title = "Withdrawn &middot; Reflections &middot; Faisal Henar"
    desc = "This reflection is no longer published. The others are in the archive."
    return "\n".join([
        "<!DOCTYPE html>",
        '<html lang="en">',
        "<head>",
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<meta name="robots" content="noindex, follow">',
        '<meta http-equiv="refresh" content="0; url=../reflections.html">',
        '<link rel="icon" href="/favicon.ico" sizes="any">',
        "<title>" + title + "</title>",
        '<meta name="description" content="' + desc + '">',
        '<link rel="canonical" href="' + url + '">',
        '<meta property="og:title" content="' + title + '">',
        '<meta property="og:description" content="' + desc + '">',
        '<meta property="og:type" content="website">',
        '<meta property="og:url" content="' + url + '">',
        '<meta property="og:image" content="' + ORIGIN + '/images/og-image.png">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<link rel="stylesheet" href="/css/base.css?v=' + base_version + '">',
        '<link rel="stylesheet" href="../css/notebook.css?v=' + css_version + '">',
        "</head>",
        '<body class="reflection-page">',
        "",
        '  <main id="main" tabindex="-1">',
        '  <h1 class="room-title">Withdrawn</h1>',
        '  <p class="room-dek">This reflection is no longer published. '
        '<a href="../reflections.html">The others are here</a>.</p>',
        "  </main>",
        "",
        '  <script src="../../js/menu.js?v=' + menu_version + '"></script>',
        "</body>",
        "</html>",
    ]) + "\n"


def archive_markup(groups, latest=None):
    """The Reflections room (October 2026): a list on the left, the chosen
    Reflection in a panel on the right, opening in place on a phone. Each
    item carries its reference line, date, the opening of the note and the
    two links; never the sutta passage, which stays on the page itself.

    latest: the slug of the most recently published entry, which gets a
    small "Latest" label in place; the order of the list is unchanged. The
    old #r-<id> anchors of the accordion archive open the same item."""
    out = []
    for group in groups:
        key = group["key"]
        out.append('        <section class="nb-group" id="' + esc(key) + '">')
        out.append('          <h2 class="nb-group-h">' + esc(group["section"]["title"]) + "</h2>")
        out.append('          <p class="nb-group-d">' + group["section"]["note"] + "</p>")
        out.append('          <ul class="nb-rows">')
        for entry in group["entries"]:
            slug = esc(entry["slug"])
            line = archive_reference(entry)
            mark = ("Latest &middot; " if entry["slug"] == latest else "") + line
            out.append('            <li class="nb-item" id="' + slug + '" data-alias="r-' + esc(entry["id"]) + '">')
            out.append('              <button class="nb-row" type="button" aria-pressed="false" aria-controls="d-' + slug + '">'
                       '<span class="nb-row-l"><span class="nb-dot"></span><span class="nb-row-t">' + esc(entry["title"]) + "</span></span>"
                       '<span class="nb-row-r">' + mark + '<span class="nb-sign" aria-hidden="true">+</span></span></button>')
            out.append('              <div class="nb-detail" id="d-' + slug + '" hidden>')
            out.append('                <div class="nb-d-where">' + fmt_date(entry["added"]) + "</div>")
            out.append('                <div class="nb-d-sec">' + esc(group["section"]["title"]) + "</div>")
            out.append('                <h3 class="nb-d-t">' + esc(entry["title"]) + "</h3>")
            by = [b for b in (subtitle(entry), structural(entry)) if b]
            if by:
                out.append('                <div class="nb-d-by">' + " &middot; ".join(by) + "</div>")
            out.append('                <p class="nb-d-text">' + esc(opening(entry)) + "</p>")
            links = ['<a class="nb-btn" href="reflections/' + slug + '.html">Read the reflection</a>']
            url = source_url(entry)
            if url and source_label(url) == "Read on SuttaCentral":
                links.append('<a class="nb-btn" href="' + esc(url) + '" target="_blank" rel="noopener">The sutta on SuttaCentral'
                             '<span class="ext" aria-hidden="true">&#8239;↗</span></a>')
            out.append('                <div class="nb-d-links">' + "".join(links) + "</div>")
            out.append("              </div>")
            out.append("            </li>")
        out.append("          </ul>")
        out.append("        </section>")
    return "\n".join(out)


def splice(text, block, label):
    start = text.find(MARK_OPEN)
    end = text.find(MARK_CLOSE)
    if start < 0 or end < 0 or end < start:
        raise SystemExit("ERROR: %s has no BUILD:reflections markers." % label)
    return text[:start + len(MARK_OPEN)] + "\n" + block + "\n" + text[end:]


def sitemap_markup(groups):
    rows = []
    for group in groups:
        for entry in group["entries"]:
            rows.append("  <url>")
            rows.append("    <loc>" + ORIGIN + "/practice/reflections/" + esc(entry["slug"]) + ".html</loc>")
            rows.append("    <lastmod>" + esc(entry["added"]) + "</lastmod>")
            rows.append("  </url>")
    return "\n".join(rows)


def freeze_slugs(text, published):
    """Give any newly published entry a slug, once, and write it into the config."""
    added = []
    for entry in published:
        if entry.get("slug"):
            continue
        slug = slugify(entry["title"])
        taken = {e.get("slug"): e["id"] for e in published if e.get("slug")}
        if not slug:
            raise SystemExit(
                "ERROR: %s has a title with no letters or digits in it, so no slug can be "
                "worked out. Give it a slug by hand in suttas-config.js." % entry["id"]
            )
        if slug in taken:
            # Deliberately not "-2". A URL is permanent and a person should
            # choose it, not inherit a number from whichever entry happened to
            # be published first. The Website Manager refuses the same way, so
            # the two agree; see SPEC-reflection-publishing.md in that project.
            raise SystemExit(
                "ERROR: %s and %s would both be published at /practice/reflections/%s.html.\n"
                "Give one of them a slug by hand in suttas-config.js, then run this again."
                % (taken[slug], entry["id"], slug)
            )
        entry["slug"] = slug
        needle = '    id: "%s",\n' % entry["id"]
        if text.count(needle) != 1:
            raise SystemExit("ERROR: could not find a single id line for %r in suttas-config.js." % entry["id"])
        text = text.replace(needle, needle + '    slug: "%s",\n' % slug)
        added.append((entry["id"], slug))
    return text, added


def main():
    config_text = read(CONFIG)
    books = declaration(config_text, "BOOKS")
    suttas = declaration(config_text, "SUTTAS")
    for index, entry in enumerate(suttas):
        entry["_index"] = index
    published = [e for e in suttas if (e.get("note") or "").strip() and e.get("added")]

    config_text, minted = freeze_slugs(config_text, published)
    if minted:
        write(CONFIG, config_text)
        for entry_id, slug in minted:
            print("  slug frozen: %s -> %s" % (entry_id, slug))

    archive_text = read(ARCHIVE)
    # The generated pages have to carry the same ?v= as every hand-written
    # page, or validate-site.py reports the stylesheet at two versions. They
    # are read from the archive page rather than written here, so bumping a
    # version is still one edit followed by a run of this tool.
    css_version = re.search(r'css/notebook\.css\?v=(\d+)', archive_text)
    base_version = re.search(r'css/base\.css\?v=(\d+)', archive_text)
    menu_version = re.search(r'js/menu\.js\?v=(\d+)', archive_text)
    if not css_version or not base_version or not menu_version:
        raise SystemExit("ERROR: could not read the asset versions from practice/reflections.html.")
    css_version, base_version, menu_version = css_version.group(1), base_version.group(1), menu_version.group(1)
    draw_version = re.search(r'js/notebook/draw\.js\?v=(\d+)', archive_text)
    draw_version = draw_version.group(1) if draw_version else "1"
    global CROSSLINKS
    try:
        import json
        with open(CROSSLINKS_PATH, encoding="utf-8") as handle:
            CROSSLINKS = json.load(handle)
    except FileNotFoundError:
        CROSSLINKS = {}

    groups = page_order(books, published)

    os.makedirs(OUT_DIR, exist_ok=True)
    written, wanted = 0, set()
    for group in groups:
        entries = group["entries"]
        for position, entry in enumerate(entries):
            previous = entries[position - 1] if position > 0 else None
            following = entries[position + 1] if position + 1 < len(entries) else None
            name = entry["slug"] + ".html"
            wanted.add(name)
            markup = page_markup(entry, previous if group["section"].get("order") == "structural" else None,
                                 sum(len(g["entries"]) for g in groups), group["section"], css_version, base_version, menu_version, draw_version)
            path = os.path.join(OUT_DIR, name)
            if not os.path.exists(path) or read(path) != markup:
                write(path, markup)
                written += 1

    retired = 0
    for name in sorted(n for n in os.listdir(OUT_DIR) if n.endswith(".html") and n not in wanted):
        path = os.path.join(OUT_DIR, name)
        markup = withdrawn_markup(name[:-5], css_version, base_version, menu_version)
        if read(path) != markup:
            write(path, markup)
            retired += 1
            print("  withdrawn: practice/reflections/%s now redirects to the archive" % name)

    # Same rule as the hub's "Latest:" line (render-latest-reflection.js):
    # the newest `added` date, and on a tie the entry earlier in the config.
    newest = min(published, key=lambda e: (-int(e["added"].replace("-", "")), e["_index"]), default=None)
    archive_text = splice(archive_text, archive_markup(groups, newest and newest.get("slug")), "practice/reflections.html")
    if newest:
        # The room opens on the newest Reflection, and its footer says when
        # the room last changed: both follow the config, not the markup.
        archive_text = re.sub(r'(<div class="nb-room[^>]*?) data-open="[^"]*"',
                              lambda m: m.group(1) + ' data-open="' + newest["slug"] + '"', archive_text)
        month = datetime.date.fromisoformat(newest["added"]).strftime("%B %Y")
        archive_text = re.sub(r'(<time data-room-changed datetime=")[^"]*(">)[^<]*(</time>)',
                              lambda m: m.group(1) + newest["added"][:7] + m.group(2) + month + m.group(3), archive_text)
    write(ARCHIVE, archive_text)
    write(SITEMAP, splice(read(SITEMAP), sitemap_markup(groups), "sitemap.xml"))

    total = sum(len(g["entries"]) for g in groups)
    print("Reflections: %d published, %d page%s rewritten%s, archive and sitemap updated."
          % (total, written, "" if written == 1 else "s",
             ", %d withdrawn" % retired if retired else ""))


if __name__ == "__main__":
    main()
