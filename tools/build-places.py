# -*- coding: utf-8 -*-
"""Write the Places & Community room, in English and Dutch, from one file.

Until October 2026 practice/places.html and practice/places-nl.html were
edited by hand, and tools/check-nl-mirrors.py watched the pair for drift.
Now every entry lives once in practice/data/places.json, with its English
and Dutch side by side and a marker saying whether the Dutch has been
checked against the English. This tool writes, in both pages:

  the list of groups and entries   between <!-- BUILD:places --> markers
  the structured data (JSON-LD)    between <!-- BUILD:places-ld --> markers
  which entry the room opens on    the data-open-group and data-open
                                   attributes of the room

Everything else on the two pages (head, intro, the chain of rooms, footer)
is still hand-written and stays as it is.

The text of an entry is the writing desk's Markdown (tools/sitedata.py):
[a link](https://...) and *italic*. A link to another site opens in a new
tab, as it always has on this page.

Run from the repository root:  python3 tools/build-places.py
Then run tools/validate-site.py.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sitedata  # noqa: E402

ROOT = sitedata.ROOT
DATA = os.path.join(ROOT, "practice", "data", "places.json")
PAGES = {"en": os.path.join(ROOT, "practice", "places.html"),
         "nl": os.path.join(ROOT, "practice", "places-nl.html")}
LIST = ("<!-- BUILD:places -->", "<!-- /BUILD:places -->")
LD = ("<!-- BUILD:places-ld -->", "<!-- /BUILD:places-ld -->")
EXT = '<span class="ext" aria-hidden="true">&#8239;↗</span>'


def esc(value):
    return str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def count(n, lang):
    if lang == "nl":
        return str(n)
    return "%d %s" % (n, "entry" if n == 1 else "entries")


def peek(names):
    shown = ", ".join(names[:3])
    return esc(shown + (", …" if len(names) > 3 else ""))


def row_right(where):
    """The short form on the row: the last part of where it is."""
    return where.split(",")[-1].strip() if where else ""


def entry_markup(entry, group_title, lang):
    words = entry[lang]
    eid = esc(entry["id"])
    name = esc(entry["name"])
    rows = []
    rows.append('            <li class="nb-item" id="%s">' % eid)
    rows.append('              <button class="nb-row" type="button" aria-pressed="false" aria-controls="d-%s">'
                '<span class="nb-row-l"><span class="nb-dot"></span><span class="nb-row-t">%s</span></span>'
                '<span class="nb-row-r">%s<span class="nb-sign" aria-hidden="true">+</span></span></button>'
                % (eid, name, esc(row_right(words.get("where", "")))))
    rows.append('              <div class="nb-detail" id="d-%s" hidden>' % eid)
    if words.get("where"):
        rows.append('                <div class="nb-d-where">%s</div>' % esc(words["where"]))
    rows.append('                <div class="nb-d-sec">%s</div>' % esc(group_title))
    rows.append('                <h3 class="nb-d-t">%s</h3>' % name)
    rows.append('                <div class="nb-d-by">%s</div>' % esc(words.get("by", "")))
    for kind, html in sitedata.render_text(words.get("text", "")):
        rows.append('                <p class="nb-d-text">%s</p>' % html)
    if words.get("note"):
        rows.append('                <p class="nb-d-note">%s</p>' % esc(words["note"]))
    link = ""
    if entry.get("link"):
        link = ('<a class="nb-btn" href="%s" target="_blank" rel="noopener">%s%s</a>'
                % (esc(entry["link"]), name, EXT))
    rows.append('                <div class="nb-d-links">%s</div>' % link)
    rows.append("              </div>")
    rows.append("            </li>")
    return rows


def list_markup(data, lang):
    out = []
    for group in data["groups"]:
        g = group[lang]
        gid = esc(g["id"])
        names = [e["name"] for e in group["entries"]]
        out.append('        <section class="nb-acc" id="%s">' % gid)
        out.append('          <h2 class="nb-acc-h"><button class="nb-acc-btn" type="button" aria-expanded="false" '
                   'aria-controls="b-%s"><span class="nb-acc-top"><span class="nb-acc-t">%s</span>'
                   '<span class="nb-acc-n">%s · <span class="nb-acc-sign">+</span></span></span>'
                   '<span class="nb-acc-peek">%s</span></button></h2>'
                   % (gid, esc(g["title"]), count(len(names), lang), peek(names)))
        out.append('          <div class="nb-acc-body" id="b-%s" hidden>' % gid)
        if g.get("intro_html"):
            out.append('            <p class="nb-group-d">%s</p>' % g["intro_html"])
        out.append('            <ul class="nb-rows">')
        for entry in group["entries"]:
            out.extend(entry_markup(entry, g["title"], lang))
        out.append("            </ul>")
        if g.get("after_html"):
            out.append('            <p class="nb-quiet">%s</p>' % g["after_html"])
        out.append("          </div>")
        out.append("        </section>")
    return "\n".join(out)


def search_object(entry, lang):
    s = entry["search"]
    obj = {"@type": s["type"], "name": entry["name"]}
    if s["type"] == "Person":
        for key in ("alternateName",):
            if s.get(key):
                obj[key] = s[key]
        if s.get("jobTitle"):
            obj["jobTitle"] = s["jobTitle"][lang]
        for key in ("birthDate", "deathDate", "sameAs"):
            if s.get(key):
                obj[key] = s[key]
    else:
        if s.get("url"):
            obj["url"] = s["url"]
        if s.get("founder"):
            obj["founder"] = {"@type": "Person", "name": s["founder"]}
        if s.get("country"):
            address = {"@type": "PostalAddress"}
            if s.get("locality"):
                address["addressLocality"] = s["locality"]
            address["addressCountry"] = s["country"]
            obj["address"] = address
        if s.get("description"):
            obj["description"] = s["description"][lang]
    return obj


def ld_markup(data, lang):
    graph = [search_object(e, lang) for g in data["groups"] for e in g["entries"] if e.get("search")]
    value = {"@context": "https://schema.org", "@graph": graph}
    return ('<script type="application/ld+json">\n' + json.dumps(value, ensure_ascii=False, indent=2)
            + "\n</script>")


def splice(text, marks, block, label):
    """Replace the lines between the two marker lines with block."""
    open_at, close_at = text.find(marks[0]), text.find(marks[1])
    if open_at < 0 or close_at < open_at:
        raise SystemExit("ERROR: %s has no %s markers." % (label, marks[0]))
    start = text.index("\n", open_at) + 1
    end = text.rfind("\n", 0, close_at) + 1
    return text[:start] + block + "\n" + text[end:]


def open_on(data, lang):
    """(group id, entry id) the room opens on, in this language."""
    for group in data["groups"]:
        for entry in group["entries"]:
            if entry["id"] == data.get("open"):
                return group[lang]["id"], entry["id"]
    first = data["groups"][0]
    return first[lang]["id"], first["entries"][0]["id"] if first["entries"] else ""


def check(data):
    problems = sitedata.check(data, sitedata.load_schema(sitedata.schema_path(DATA)))
    ids = [e["id"] for g in data.get("groups", []) for e in g.get("entries", [])] if not problems else []
    for i in sorted({i for i in ids if ids.count(i) > 1}):
        problems.append("The entry id %r is used twice." % i)
    for lang in ("en", "nl"):
        gids = [g[lang]["id"] for g in data.get("groups", [])] if not problems else []
        for i in sorted({i for i in gids if gids.count(i) > 1} | (set(gids) & set(ids))):
            problems.append("The %s group id %r is used twice." % (lang, i))
    if problems:
        raise SystemExit("ERROR: practice/data/places.json does not hold together:\n  " + "\n  ".join(problems))


def build(data, texts):
    """{lang: new page text} from the data and the current pages."""
    out = {}
    for lang, text in texts.items():
        text = splice(text, LIST, list_markup(data, lang), "places page (%s)" % lang)
        text = splice(text, LD, ld_markup(data, lang), "places page (%s)" % lang)
        group, item = open_on(data, lang)
        text = re.sub(r'(<div class="nb-room[^>]*?) data-open-group="[^"]*"', lambda m: m.group(1) + ' data-open-group="%s"' % group, text, count=1)
        text = re.sub(r'(<div class="nb-room[^>]*?) data-open="[^"]*"', lambda m: m.group(1) + ' data-open="%s"' % item, text, count=1)
        out[lang] = text
    return out


def main():
    data = sitedata.read_json(DATA)
    check(data)
    texts = {lang: sitedata.read_text(path) for lang, path in PAGES.items()}
    written = 0
    for lang, text in build(data, texts).items():
        if text != texts[lang]:
            sitedata.write_text(PAGES[lang], text)
            written += 1
    entries = sum(len(g["entries"]) for g in data["groups"])
    to_check = sum(1 for g in data["groups"] for e in g["entries"] if e.get("dutch") != "checked")
    print("Places: %d groups, %d entries, %d page%s rewritten%s." % (
        len(data["groups"]), entries, written, "" if written == 1 else "s",
        ", %d with Dutch still to check" % to_check if to_check else ""))


if __name__ == "__main__":
    main()
