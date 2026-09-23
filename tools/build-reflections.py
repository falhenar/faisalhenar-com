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

ICON = """  <svg class="room-header-icon" viewBox="0 0 120 170" aria-hidden="true">
    <rect x="16" y="12" width="88" height="146" rx="3"></rect>
    <line x1="32" y1="50" x2="88" y2="50"></line>
    <line x1="32" y1="66" x2="88" y2="66"></line>
    <line x1="32" y1="82" x2="66" y2="82"></line>
    <circle class="fill-dot" cx="32" cy="106" r="3"></circle>
    <line x1="44" y1="106" x2="88" y2="106"></line>
  </svg>"""


def nav_markup(previous, following, section_title):
    """Previous and next inside the same section.

    Deliberately within the section and not across the whole archive: the
    anthology section has a reading order and the other one does not, and
    walking a reader out of one into the other would imply a sequence that
    was never there.
    """
    rows = []
    if previous:
        rows.append('      <a class="reflection-step reflection-step-prev" rel="prev" href="' + esc(previous["slug"]) + '.html">'
                    '<span class="reflection-step-label mono">Previous</span>'
                    '<span class="reflection-step-title">' + esc(previous["title"]) + "</span></a>")
    if following:
        rows.append('      <a class="reflection-step reflection-step-next" rel="next" href="' + esc(following["slug"]) + '.html">'
                    '<span class="reflection-step-label mono">Next</span>'
                    '<span class="reflection-step-title">' + esc(following["title"]) + "</span></a>")
    inner = "\n".join(rows)
    return ('    <nav class="reflection-nav" aria-label="' + esc(section_title) + '">\n'
            + (inner + "\n" if inner else "")
            + '      <a class="reflection-step reflection-step-all" href="../reflections.html">'
              '<span class="reflection-step-label mono">All</span>'
              '<span class="reflection-step-title">Reflections</span></a>\n'
            + "    </nav>\n")


def page_markup(entry, previous, following, section, css_version, menu_version):
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
    parts.append('<link rel="stylesheet" href="../css/practice.css?v=' + css_version + '">')
    parts.append('<script type="application/ld+json">')
    parts.extend(ld)
    parts.append("</script>")
    parts.append("<!-- Cloudflare Web Analytics -->")
    parts.append("<script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{\"token\": \"68bb7041afa74c9ea4d36891d27ae977\"}'></script>")
    parts.append("<!-- End Cloudflare Web Analytics -->")
    parts.append("</head>")
    parts.append('<body class="reflection-page">')
    parts.append("")
    parts.append('  <a class="skip-link" href="#main">Skip to content</a>')
    parts.append("")
    parts.append('  <header class="room-header">')
    parts.append('    <a class="mark" href="../../">Faisal Henar</a>')
    parts.append('    <div class="room-header-right">')
    parts.append('      <span class="section-label">Practice</span>')
    parts.append('      <div class="menu" data-menu>')
    parts.append('        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu-panel" data-menu-btn>Menu</button>')
    parts.append('        <nav class="menu-panel" id="site-menu-panel" data-menu-panel aria-label="Site sections">')
    parts.append(NAV)
    parts.append("        </nav>")
    parts.append("      </div>")
    parts.append("    </div>")
    parts.append("  </header>")
    parts.append("")
    parts.append(ICON)
    parts.append("")
    parts.append('  <main id="main" tabindex="-1">')
    parts.append('  <a class="back-link" href="../reflections.html">&larr; Reflections</a>')
    parts.append('  <h1 class="room-title">' + esc(entry["title"]) + "</h1>")
    if sub:
        parts.append('  <p class="reflection-subtitle reflection-page-subtitle">' + sub + "</p>")
    meta = [esc(section["title"])]
    if struct:
        meta.append(struct)
    meta.append(fmt_date(entry["added"]))
    parts.append('  <p class="reflection-structural reflection-page-meta mono">' + " &middot; ".join(meta) + "</p>")
    parts.append("")
    parts.append('    <article class="section reflection-article">')
    body = excerpt_markup(entry, "      ") + note_markup(entry, "      ")
    parts.append(body.rstrip("\n"))
    if url_source:
        parts.append('      <a class="entry-link" href="' + esc(url_source) + '" target="_blank" rel="noopener">'
                     + source_label(url_source) + " &rarr;</a>")
    parts.append("    </article>")
    parts.append("")
    parts.append(nav_markup(previous, following, section["title"]).rstrip("\n"))
    parts.append("")
    parts.append("  </main>")
    parts.append("")
    parts.append('  <footer class="site-footer">')
    parts.append('    <nav class="footer-nav" aria-label="More">')
    parts.append('      <a href="../../note.html">A note from me</a>')
    parts.append('      <a href="../../contact.html">Contact</a>')
    parts.append('      <a href="../../elsewhere.html">Elsewhere</a>')
    parts.append("    </nav>")
    parts.append('    <span>&copy; <span id="year"></span> Faisal Henar</span>')
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


def archive_markup(groups):
    out = []
    for group in groups:
        out.append('    <section class="section">')
        out.append('      <h2 class="section-label">' + esc(group["section"]["title"]) + "</h2>")
        out.append('      <p class="section-dek">' + group["section"]["note"] + "</p>")
        out.append('      <ol class="reflection-index">')
        for entry in group["entries"]:
            line = archive_reference(entry)
            out.append('        <li class="reflection-index-item">')
            out.append('          <a href="reflections/' + esc(entry["slug"]) + '.html">')
            out.append('            <span class="reflection-index-title">' + esc(entry["title"]) + "</span>")
            out.append('            <span class="reflection-index-meta mono">'
                       + (line + " &middot; " if line else "") + fmt_date(entry["added"]) + "</span>")
            out.append("          </a>")
            out.append("        </li>")
        out.append("      </ol>")
        out.append("    </section>")
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
        base, number = slug, 2
        taken = {e.get("slug") for e in published if e.get("slug")}
        while slug in taken:
            slug = "%s-%d" % (base, number)
            number += 1
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
    css_version = re.search(r'css/practice\.css\?v=(\d+)', archive_text)
    menu_version = re.search(r'js/menu\.js\?v=(\d+)', archive_text)
    if not css_version or not menu_version:
        raise SystemExit("ERROR: could not read the asset versions from practice/reflections.html.")
    css_version, menu_version = css_version.group(1), menu_version.group(1)

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
            markup = page_markup(entry, previous, following, group["section"], css_version, menu_version)
            path = os.path.join(OUT_DIR, name)
            if not os.path.exists(path) or read(path) != markup:
                write(path, markup)
                written += 1

    stale = sorted(n for n in os.listdir(OUT_DIR) if n.endswith(".html") and n not in wanted)
    if stale:
        print("  NOTE: these pages no longer match a published Reflection and were left in place:")
        for name in stale:
            print("    practice/reflections/" + name)
        print("  Unpublishing is rare enough that this tool does not delete. Remove them by hand,")
        print("  and leave a redirect if the page was ever public.")

    write(ARCHIVE, splice(archive_text, archive_markup(groups), "practice/reflections.html"))
    write(SITEMAP, splice(read(SITEMAP), sitemap_markup(groups), "sitemap.xml"))

    total = sum(len(g["entries"]) for g in groups)
    print("Reflections: %d published, %d page%s rewritten, archive and sitemap updated."
          % (total, written, "" if written == 1 else "s"))


if __name__ == "__main__":
    main()
