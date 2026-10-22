# -*- coding: utf-8 -*-
"""Write one static page per published Reflection, plus the archive list on
practice/reflections.html and the Reflection entries in sitemap.xml.

Until September 2026 the eight Reflections lived inside one accordion on one
page. Nothing could be linked to with a preview, nothing could be found by
someone searching for the sutta, and the page itself rendered a few hundred
characters of visible text. The writing was there; the page was hiding it.

This tool changes none of the writing. Since October 2026 it reads the
Reflections from plain files in practice/data/reflections/ (see
tools/sitedata.py for their format):

  <id>.md          one per published Reflection: its details at the top,
                   FH's text below
  sections.json    the page sections, the source order of every entry
                   ("sequence"), and the unlisted ones
  queue.json       passages of the book not yet written: details, no text

and lays the same words out as pages.

  practice/reflections/<slug>.html   one per published Reflection
  practice/reflections.html          the archive, between its BUILD markers
  sitemap.xml                        the Reflection pages, between its markers
  practice/data/reflections/published.json
                                     the listed Reflections (id, slug, ref),
                                     read by the Practice hub to link the
                                     sutta of the day to its Reflection

A Reflection is published when its file exists, its text is not empty and
`added` holds a date. Queued passages get no page.

UNLISTED is not the same as unpublished. sections.json "unlisted", written
by the Website Manager, names published Reflections to take out of
discovery. Each keeps its whole page at its permanent URL, gains
`<meta name="robots" content="noindex, follow">`, and leaves the archive, the
sitemap and every generated "before it" link. Take the id out again and it is
listed again at the same URL. A Reflection whose file is removed is
different: its page becomes a redirect to the archive.

SLUGS ARE FROZEN. The first time an entry is published this tool works a slug
out from its title and writes it back into its file as `slug`. After that the
slug is read, never recomputed, so editing a title later does not move a page
that people may already have linked to. To move a page on purpose, change the
slug by hand and leave a redirect behind.

Run from the repository root:  python3 tools/build-reflections.py
Then run tools/validate-site.py, which checks the result.
"""
import datetime, html, os, re, sys, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ORIGIN = "https://faisalhenar.com"
OUT_DIR = os.path.join(ROOT, "practice", "reflections")

sys.path.insert(0, HERE)
import sitedata  # noqa: E402

DATA_DIR = os.path.join(ROOT, "practice", "data", "reflections")
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
    if entry.get("summary"):
        return entry["summary"]
    text = sitedata.plain_text(entry["note"])
    if len(text) <= 155:
        return text
    cut = text[:155]
    space = cut.rfind(" ")
    if space > 80:
        cut = cut[:space]
    return cut.rstrip(" ,;:.") + "..."


def clean_ref(entry):
    """The sutta reference for the page title: "from AN 3.36" -> "AN 3.36",
    "AN 2.37 (abridged)" -> "AN 2.37". Empty when there is none. The
    Website Manager's search preview uses this same rule."""
    ref = re.sub(r"^from\s+", "", entry.get("ref") or "", flags=re.I)
    return re.sub(r"\s*\([^)]*\)\s*$", "", ref).strip()


def page_title(entry):
    """<title>, og:title and twitter:title, unescaped."""
    ref = clean_ref(entry)
    return entry["title"] + (" (" + ref + ")" if ref else "") + " · Reflections · Faisal Henar"


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


# How a translator key in a Reflection's details is named under the excerpt.
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
    """FH's text, from the writing desk's Markdown (tools/sitedata.py): a
    paragraph per blank-line break, a "> " paragraph as a quotation."""
    out = []
    for kind, markup in sitedata.render_text(entry["note"]):
        if kind == "quote":
            out.append(indent + '<blockquote class="reflections-excerpt">' + markup + "</blockquote>\n")
        else:
            out.append(indent + '<p class="reflection-note">' + markup + "</p>\n")
    return "".join(out)


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
    text = sitedata.plain_text(first)
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


def page_markup(entry, previous, total, section, css_version, base_version, menu_version, draw_version="1", unlisted=False):
    url = ORIGIN + "/practice/reflections/" + entry["slug"] + ".html"
    title = esc(page_title(entry))
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
        '  "isPartOf": { "@type": "Blog", "name": "Reflections", "url": "' + ORIGIN + '/practice/reflections.html" },',
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
    if unlisted:
        parts.append('<meta name="robots" content="noindex, follow">')
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
    parts.append('<script data-goatcounter="https://falhenar.goatcounter.com/count" async src="/js/count.js"></script>')
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
    parts.append('      <a href="/colophon.html">Built quietly, updated slowly</a>')
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


def freeze_slugs(published):
    """Give any newly published entry a slug, once, and write it into its file."""
    added = []
    for entry in published:
        if entry.get("slug"):
            continue
        slug = slugify(entry["title"])
        taken = {e.get("slug"): e["id"] for e in published if e.get("slug")}
        if not slug:
            raise SystemExit(
                "ERROR: %s has a title with no letters or digits in it, so no slug can be "
                "worked out. Give it a slug by hand in its file." % entry["id"]
            )
        if slug in taken:
            # Deliberately not "-2". A URL is permanent and a person should
            # choose it, not inherit a number from whichever entry happened to
            # be published first. The Website Manager refuses the same way.
            raise SystemExit(
                "ERROR: %s and %s would both be published at /practice/reflections/%s.html.\n"
                "Give one of them a slug by hand in its file, then run this again."
                % (taken[slug], entry["id"], slug)
            )
        entry["slug"] = slug
        details, body = sitedata.parse_reflection(read(entry["_path"]))
        details["slug"] = slug
        write(entry["_path"], sitedata.dump_reflection(details, body))
        added.append((entry["id"], slug))
    return added


def load(root=None):
    """(sections, entries, unlisted ids) from practice/data/reflections/.

    Entries are the published Reflections and the queued passages, in
    source order (sections.json "sequence"), each a dict with the old
    field names: the details, `note` (the text) and `added`."""
    folder = os.path.join(root, "practice", "data", "reflections") if root else DATA_DIR
    problems = []
    sections = sitedata.read_json(os.path.join(folder, "sections.json"))
    queue = sitedata.read_json(os.path.join(folder, "queue.json"))
    problems += ["sections.json: " + p for p in sitedata.check_file(os.path.join(folder, "sections.json"), sections)]
    problems += ["queue.json: " + p for p in sitedata.check_file(os.path.join(folder, "queue.json"), queue)]
    if problems:
        raise SystemExit("ERROR: the Reflections data does not hold together:\n  " + "\n  ".join(problems))
    schema = sitedata.load_schema(os.path.join(folder, "reflection.schema.json"))
    books = {s["id"]: {"title": s["title"], "note": s["note"], "order": s["order"]} for s in sections["sections"]}
    entries = {}
    for name in sorted(os.listdir(folder)):
        if not name.endswith(".md"):
            continue
        path = os.path.join(folder, name)
        try:
            details, body = sitedata.parse_reflection(read(path))
        except ValueError as exc:
            problems.append("%s: %s." % (name, exc)); continue
        problems += ["%s: %s" % (name, p) for p in sitedata.check(details, schema)]
        if details.get("id") != name[:-3]:
            problems.append("%s: its id must be %r, the name of the file." % (name, name[:-3]))
        entries[details.get("id")] = dict(details, note=body, _path=path)
    for passage in queue["passages"]:
        if passage["id"] in entries:
            problems.append("%s is both published and in queue.json." % passage["id"])
        entries[passage["id"]] = dict(passage, note="", added=None)
    order = sections["sequence"]
    for key in sorted(set(entries) - set(order)):
        problems.append("%s is not in the sequence in sections.json." % key)
    for key in sorted(set(order) - set(entries)):
        problems.append("sections.json lists %s in its sequence, but there is no such Reflection or passage." % key)
    for key, entry in entries.items():
        if entry.get("book") not in books:
            problems.append("%s names the section %r, which sections.json does not have." % (key, entry.get("book")))
    for key in sections["unlisted"]:
        if key not in entries or not entries[key]["note"].strip():
            problems.append("sections.json unlists %s, which is not a published Reflection." % key)
    if problems:
        raise SystemExit("ERROR: the Reflections data does not hold together:\n  " + "\n  ".join(problems))
    suttas = [entries[key] for key in order]
    for index, entry in enumerate(suttas):
        entry["_index"] = index
    return books, suttas, set(sections["unlisted"])


def main():
    books, suttas, hidden = load()
    published = [e for e in suttas if (e.get("note") or "").strip() and e.get("added")]
    listed = [e for e in published if e["id"] not in hidden]

    for entry_id, slug in freeze_slugs(published):
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

    # Every published entry gets its page, unlisted or not; only the listed
    # ones are counted, linked to from a neighbour, or shown in the archive.
    groups = page_order(books, published)
    listed_groups = page_order(books, listed)
    total = len(listed)

    os.makedirs(OUT_DIR, exist_ok=True)
    written, wanted = 0, set()
    for group in groups:
        in_order = group["section"].get("order") == "structural"
        previous = None
        for entry in group["entries"]:
            name = entry["slug"] + ".html"
            wanted.add(name)
            markup = page_markup(entry, previous if in_order else None, total, group["section"],
                                 css_version, base_version, menu_version, draw_version, entry["id"] in hidden)
            path = os.path.join(OUT_DIR, name)
            if not os.path.exists(path) or read(path) != markup:
                write(path, markup)
                written += 1
            if entry["id"] not in hidden:
                previous = entry

    retired = 0
    for name in sorted(n for n in os.listdir(OUT_DIR) if n.endswith(".html") and n not in wanted):
        path = os.path.join(OUT_DIR, name)
        markup = withdrawn_markup(name[:-5], css_version, base_version, menu_version)
        if read(path) != markup:
            write(path, markup)
            retired += 1
            print("  withdrawn: practice/reflections/%s now redirects to the archive" % name)

    # The newest listed Reflection: the latest `added` date, and on a tie the
    # entry earlier in the source order.
    newest = min(listed, key=lambda e: (-int(e["added"].replace("-", "")), e["_index"]), default=None)
    archive_text = splice(archive_text, archive_markup(listed_groups, newest and newest.get("slug")), "practice/reflections.html")
    # The room opens on the newest Reflection, and its footer says when
    # the room last changed: both follow the data, not the markup. With
    # nothing listed the room opens on nothing and the date is left alone.
    archive_text = re.sub(r'(<div class="nb-room[^>]*?) data-open="[^"]*"',
                          lambda m: m.group(1) + ' data-open="' + (newest["slug"] if newest else "") + '"', archive_text)
    if newest:
        month = datetime.date.fromisoformat(newest["added"]).strftime("%B %Y")
        archive_text = re.sub(r'(<time data-room-changed datetime=")[^"]*(">)[^<]*(</time>)',
                              lambda m: m.group(1) + newest["added"][:7] + m.group(2) + month + m.group(3), archive_text)
    write(ARCHIVE, archive_text)
    write(SITEMAP, splice(read(SITEMAP), sitemap_markup(listed_groups), "sitemap.xml"))
    index = {"version": 1, "reflections": [{"id": e["id"], "slug": e["slug"], "ref": e.get("ref", "")}
                                             for g in listed_groups for e in g["entries"]]}
    published_path = os.path.join(DATA_DIR, "published.json")
    if not os.path.exists(published_path) or read(published_path) != sitedata.dump_json(index):
        sitedata.write_json(published_path, index)

    print("Reflections: %d published%s, %d page%s rewritten%s, archive and sitemap updated."
          % (len(published), ", %d unlisted" % (len(published) - total) if total < len(published) else "",
             written, "" if written == 1 else "s", ", %d withdrawn" % retired if retired else ""))


if __name__ == "__main__":
    main()
