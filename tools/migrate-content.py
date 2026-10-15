# -*- coding: utf-8 -*-
"""Move the Practice content into plain data files (October 2026, for the new
Website Manager). Re-runnable: each part checks whether it has already been
done and skips itself if so, so it can be run again on a newer main.

  Reflections   practice/js/suttas-config.js
                -> practice/data/reflections/<id>.md (one per published
                   Reflection), sections.json (page sections, source order,
                   unlisted), queue.json (book passages not yet written)
  Daily Sutta   practice/js/daily-sutta-config.js -> practice/data/daily-sutta.json
  Quotes        practice/js/quotes-config.js -> practice/data/quotes.json
  Places        practice/places.html + places-nl.html -> practice/data/places.json,
                and BUILD markers in both pages for tools/build-places.py
  Photography   the "loose" contact sheet -> one "between walks" sheet per month
  Hub           practice/index.html stops loading the three old configs

The words are moved, never changed. Every part checks its own result: the
Places pages rebuilt from the new file must come out identical to the
pages they came from, and every Reflection must render the same HTML as
before.

Options:
  --old-manager-daily <draft.json>   the old Website Manager's private Daily
      Sutta store. Its resting entries and Curator records (origin, exact
      segments) are carried into daily-sutta.json.
  --dry-run                          report only, write nothing.

Run from the repository root:  python3 tools/migrate-content.py
Then: tools/build-reflections.py, tools/build-places.py,
tools/build-photography.py, tools/validate-site.py.
"""
import argparse
import html as htmllib
import importlib.util
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sitedata  # noqa: E402

ROOT = sitedata.ROOT
P = lambda *parts: os.path.join(ROOT, *parts)  # noqa: E731

# ---------- the old JavaScript configs ----------
# A strict reader for the data literals in the old configs. It parses and
# executes nothing. Moved here from tools/validate-site.py, which no longer
# reads JavaScript data.

IDENTIFIER = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]*")
NUMBER = re.compile(r"-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?")
UNSAFE_KEYS = {"__proto__", "prototype", "constructor"}


class DataParser:
    """Parse a strict JavaScript data literal. No JavaScript is executed."""
    def __init__(self, text, at): self.text, self.at, self.depth = text, at, 0
    def fail(self, message): raise ValueError(f"{message} at character {self.at}")
    def skip(self):
        while self.at < len(self.text):
            if self.text[self.at].isspace(): self.at += 1; continue
            if self.text.startswith("//", self.at):
                end = self.text.find("\n", self.at + 2); self.at = len(self.text) if end < 0 else end + 1; continue
            if self.text.startswith("/*", self.at):
                end = self.text.find("*/", self.at + 2)
                if end < 0: self.fail("Unclosed comment")
                self.at = end + 2; continue
            break
    def string(self):
        start = self.at; self.at += 1; escaped = False
        while self.at < len(self.text):
            char = self.text[self.at]; self.at += 1
            if escaped: escaped = False
            elif char == "\\": escaped = True
            elif char == '"': return json.loads(self.text[start:self.at])
            elif char in "\r\n": self.fail("Unescaped line break")
        self.fail("Unclosed string")
    def value(self):
        self.skip()
        if self.at >= len(self.text): self.fail("Expected value")
        char = self.text[self.at]
        if char == '"': return self.string()
        if char == "[": return self.array()
        if char == "{": return self.object()
        for literal, value in (("true", True), ("false", False), ("null", None)):
            if self.text.startswith(literal, self.at): self.at += len(literal); return value
        match = NUMBER.match(self.text, self.at)
        if match:
            self.at = match.end(); raw = match.group(0); return float(raw) if any(c in raw for c in ".eE") else int(raw)
        self.fail("Unsupported value")
    def enter(self):
        self.depth += 1
        if self.depth > 50: self.fail("Data nested too deeply")
    def array(self):
        self.enter(); output = []; self.at += 1; self.skip()
        while self.at < len(self.text) and self.text[self.at] != "]":
            output.append(self.value()); self.skip()
            if self.text[self.at] == "]": break
            if self.text[self.at] != ",": self.fail("Expected comma")
            self.at += 1; self.skip()
        if self.at >= len(self.text): self.fail("Unclosed array")
        self.at += 1; self.depth -= 1; return output
    def object(self):
        self.enter(); output = {}; self.at += 1; self.skip()
        while self.at < len(self.text) and self.text[self.at] != "}":
            if self.text[self.at] == '"': key = self.string()
            else:
                match = IDENTIFIER.match(self.text, self.at)
                if not match: self.fail("Expected property")
                key = match.group(0); self.at = match.end()
            if key in UNSAFE_KEYS or key in output: self.fail("Unsafe or duplicate property")
            self.skip()
            if self.at >= len(self.text) or self.text[self.at] != ":": self.fail("Expected colon")
            self.at += 1; output[key] = self.value(); self.skip()
            if self.text[self.at] == "}": break
            if self.text[self.at] != ",": self.fail("Expected comma")
            self.at += 1; self.skip()
        if self.at >= len(self.text): self.fail("Unclosed object")
        self.at += 1; self.depth -= 1; return output


def declaration(text, name):
    pattern = re.compile(rf"\bconst\s+{re.escape(name)}\s*=\s*")
    matches, at = [], 0
    while at < len(text):
        if text.startswith("//", at):
            end = text.find("\n", at + 2); at = len(text) if end < 0 else end + 1; continue
        if text.startswith("/*", at):
            end = text.find("*/", at + 2)
            if end < 0: raise ValueError("Unclosed comment")
            at = end + 2; continue
        if text[at] in "'\"`":
            quote = text[at]; at += 1; escaped = False
            while at < len(text):
                char = text[at]; at += 1
                if escaped: escaped = False
                elif char == "\\": escaped = True
                elif char == quote: break
            continue
        match = pattern.match(text, at)
        if match: matches.append(match.end()); at = match.end(); continue
        at += 1
    if len(matches) != 1: raise ValueError(f"Expected one const {name} declaration")
    parser = DataParser(text, matches[0]); value = parser.value(); parser.skip()
    if parser.at >= len(text) or text[parser.at] != ";": raise ValueError(f"{name} must end after one data value")
    return value



def js_declaration(text, name):
    return declaration(text, name)


class Plan:
    def __init__(self, dry):
        self.dry, self.writes, self.removes, self.notes = dry, {}, [], []

    def write(self, path, text):
        self.writes[path] = text

    def remove(self, path):
        self.removes.append(path)

    def note(self, line):
        self.notes.append(line)

    def apply(self):
        for path, text in self.writes.items():
            print(("  would write " if self.dry else "  wrote ") + os.path.relpath(path, ROOT).replace(os.sep, "/"))
            if not self.dry:
                sitedata.write_text(path, text)
        for path in self.removes:
            print(("  would remove " if self.dry else "  removed ") + os.path.relpath(path, ROOT).replace(os.sep, "/"))
            if not self.dry and os.path.exists(path):
                os.remove(path)


# ---------- Places ----------

PLACES_PAGES = {"en": P("practice", "places.html"), "nl": P("practice", "places-nl.html")}
LIST_OPEN, LIST_CLOSE = "<!-- BUILD:places -->", "<!-- /BUILD:places -->"
LD_OPEN, LD_CLOSE = "<!-- BUILD:places-ld -->", "<!-- /BUILD:places-ld -->"

SECTION_RE = re.compile(
    r'        <section class="nb-acc" id="(?P<gid>[^"]+)">\n'
    r'          <h2 class="nb-acc-h"><button[^\n]*<span class="nb-acc-t">(?P<title>[^<]*)</span>[^\n]*</h2>\n'
    r'          <div class="nb-acc-body" id="b-(?P=gid)" hidden>\n'
    r'(?:            <p class="nb-group-d">(?P<intro>[^\n]*)</p>\n)?'
    r'            <ul class="nb-rows">\n(?P<items>.*?)            </ul>\n'
    r'(?:            <p class="nb-quiet">(?P<after>[^\n]*)</p>\n)?'
    r'          </div>\n        </section>\n', re.S)
ITEM_RE = re.compile(
    r'            <li class="nb-item" id="(?P<id>[^"]+)">\n'
    r'              <button[^\n]*<span class="nb-row-t">(?P<name>[^<]*)</span>[^\n]*\n'
    r'              <div class="nb-detail" id="d-(?P=id)" hidden>\n'
    r'(?:                <div class="nb-d-where">(?P<where>[^<]*)</div>\n)?'
    r'                <div class="nb-d-sec">[^<]*</div>\n'
    r'                <h3 class="nb-d-t">[^<]*</h3>\n'
    r'                <div class="nb-d-by">(?P<by>[^<]*)</div>\n'
    r'(?P<texts>(?:                <p class="nb-d-text">[^\n]*</p>\n)+)'
    r'(?:                <p class="nb-d-note">(?P<note>[^<]*)</p>\n)?'
    r'                <div class="nb-d-links">(?P<links>[^\n]*)</div>\n'
    r'              </div>\n            </li>\n', re.S)
A_RE = re.compile(r'<a href="([^"]+)"( target="_blank" rel="noopener")?>([^<]+)</a>')


def unescape(text):
    return htmllib.unescape(text)


def html_to_markdown(fragment):
    """The page's HTML for an entry's text, as the writing desk's Markdown."""
    def link(m):
        url, external, text = m.group(1), bool(m.group(2)), m.group(3)
        if external != url.startswith(("http://", "https://")):
            raise SystemExit("ERROR: a link in Places opens %s although it %s: %s"
                             % ("in a new tab" if external else "in place", "is internal" if external else "goes to another site", url))
        return "[%s](%s)" % (unescape(text), unescape(url))
    out = A_RE.sub(link, fragment).replace("<em>", "*").replace("</em>", "*")
    if "<" in out:
        raise SystemExit("ERROR: Places text has markup the migration does not know: %s" % fragment[:120])
    return unescape(out)


def parse_places(text, lang):
    start = text.index('<div class="nb-list nb-phone-flat">\n') + len('<div class="nb-list nb-phone-flat">\n')
    end = text.index("      </div>\n\n      <aside class=\"nb-panel\"", start)
    body = text[start:end]
    groups, at = [], 0
    for m in SECTION_RE.finditer(body):
        if m.start() != at:
            raise SystemExit("ERROR: unexpected markup in the %s Places list near: %r" % (lang, body[at:at + 80]))
        at = m.end()
        items, iat = [], 0
        for im in ITEM_RE.finditer(m.group("items")):
            if im.start() != iat:
                raise SystemExit("ERROR: unexpected markup in a %s Places entry near: %r" % (lang, m.group("items")[iat:iat + 80]))
            iat = im.end()
            texts = re.findall(r'<p class="nb-d-text">([^\n]*)</p>', im.group("texts"))
            link = re.match(r'<a class="nb-btn" href="([^"]+)" target="_blank" rel="noopener">', im.group("links"))
            items.append({
                "id": im.group("id"), "name": unescape(im.group("name")),
                "where": unescape(im.group("where") or ""), "by": unescape(im.group("by")),
                "text": "\n\n".join(html_to_markdown(t) for t in texts),
                "note": unescape(im.group("note") or ""),
                "link": unescape(link.group(1)) if link else "",
            })
        if iat != len(m.group("items")):
            raise SystemExit("ERROR: the end of a %s Places group was not understood." % lang)
        groups.append({"id": m.group("gid"), "title": unescape(m.group("title")),
                       "intro_html": m.group("intro") or "", "after_html": m.group("after") or "", "items": items})
    if at != len(body):
        raise SystemExit("ERROR: the end of the %s Places list was not understood: %r" % (lang, body[at:at + 80]))
    ld = re.search(r'<script type="application/ld\+json">\n(.*?)\n</script>', text, re.S)
    return groups, json.loads(ld.group(1))["@graph"]


def search_from_ld(objects, lang):
    """{name: search details} from one page's JSON-LD."""
    out = {}
    for obj in objects:
        keys = list(obj)
        s = {"type": obj["@type"]}
        if obj["@type"] == "Person":
            expected = ["@type", "name"] + [k for k in ("alternateName", "jobTitle", "birthDate", "deathDate", "sameAs") if k in obj]
            for k in ("alternateName", "birthDate", "deathDate", "sameAs"):
                if k in obj:
                    s[k] = obj[k]
            if "jobTitle" in obj:
                s["jobTitle"] = {lang: obj["jobTitle"]}
        else:
            expected = ["@type", "name"] + [k for k in ("url", "founder", "address", "description") if k in obj]
            if "url" in obj:
                s["url"] = obj["url"]
            if "founder" in obj:
                s["founder"] = obj["founder"]["name"]
            if "address" in obj:
                if obj["address"].get("addressLocality"):
                    s["locality"] = obj["address"]["addressLocality"]
                s["country"] = obj["address"]["addressCountry"]
            if "description" in obj:
                s["description"] = {lang: obj["description"]}
        if keys != expected:
            raise SystemExit("ERROR: the structured data for %r is in an unexpected shape." % obj["name"])
        out[obj["name"]] = s
    return out


def add_markers(text):
    if LIST_OPEN in text:
        return text
    text = text.replace('<div class="nb-list nb-phone-flat">\n',
                        '<div class="nb-list nb-phone-flat">\n        ' + LIST_OPEN + "\n", 1)
    text = text.replace("        </section>\n      </div>\n\n      <aside class=\"nb-panel\"",
                        "        </section>\n        " + LIST_CLOSE + "\n      </div>\n\n      <aside class=\"nb-panel\"", 1)
    text = text.replace('<script type="application/ld+json">', LD_OPEN + '\n<script type="application/ld+json">', 1)
    head_end = text.index("</head>")
    ld_end = text.rindex("</script>", 0, text.index('<link rel="stylesheet"')) + len("</script>")
    if ld_end > head_end:
        raise SystemExit("ERROR: could not place the structured data markers in Places.")
    return text[:ld_end] + "\n" + LD_CLOSE + text[ld_end:]


def migrate_places(plan):
    data_path = P("practice", "data", "places.json")
    pages = {lang: sitedata.read_text(path) for lang, path in PLACES_PAGES.items()}
    if os.path.exists(data_path) and all(LIST_OPEN in t for t in pages.values()):
        plan.note("Places: already migrated.")
        return
    parsed = {lang: parse_places(text, lang) for lang, text in pages.items()}
    en_groups, nl_groups = parsed["en"][0], parsed["nl"][0]
    if len(en_groups) != len(nl_groups):
        raise SystemExit("ERROR: the English and Dutch Places pages have different groups.")
    en_search, nl_search = search_from_ld(parsed["en"][1], "en"), search_from_ld(parsed["nl"][1], "nl")
    order = [o["name"] for o in parsed["en"][1]]
    groups = []
    for eg, ng in zip(en_groups, nl_groups):
        if [i["id"] for i in eg["items"]] != [i["id"] for i in ng["items"]]:
            raise SystemExit("ERROR: the group %r lists different entries in English and Dutch." % eg["title"])
        entries = []
        for ei, ni in zip(eg["items"], ng["items"]):
            if ei["name"] != ni["name"] or ei["link"] != ni["link"]:
                raise SystemExit("ERROR: %r has a different name or link in Dutch." % ei["name"])
            entry = {"id": ei["id"], "name": ei["name"]}
            if ei["link"]:
                entry["link"] = ei["link"]
            entry["dutch"] = "checked"
            for lang, item in (("en", ei), ("nl", ni)):
                words = {"by": item["by"]}
                if item["where"]:
                    words["where"] = item["where"]
                words["text"] = item["text"]
                if item["note"]:
                    words["note"] = item["note"]
                entry[lang] = words
            if ei["name"] in en_search:
                s = dict(en_search[ei["name"]])
                n = nl_search[ei["name"]]
                for key in ("jobTitle", "description"):
                    if key in s:
                        s[key] = {"en": s[key]["en"], "nl": n[key]["nl"]}
                entry["search"] = s
            entries.append(entry)
        group = {}
        for lang, g in (("en", eg), ("nl", ng)):
            words = {"id": g["id"], "title": g["title"]}
            if g["intro_html"]:
                words["intro_html"] = g["intro_html"]
            if g["after_html"]:
                words["after_html"] = g["after_html"]
            group[lang] = words
        group["entries"] = entries
        groups.append(group)
    in_order = [e["name"] for g in groups for e in g["entries"] if e.get("search")]
    if in_order != order:
        raise SystemExit("ERROR: the structured data in Places is not in the order of the page.")
    opened = re.search(r'<div class="nb-room[^>]*? data-open="([^"]*)"', pages["en"]).group(1)
    data = {"version": 1, "open": opened, "groups": groups}

    # The proof: the pages rebuilt from the new file are the pages we started from.
    spec = importlib.util.spec_from_file_location("build_places", os.path.join(HERE, "build-places.py"))
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    builder.check(data)
    marked = {lang: add_markers(text) for lang, text in pages.items()}
    rebuilt = builder.build(data, marked)
    for lang in pages:
        if rebuilt[lang] != marked[lang]:
            a, b = marked[lang], rebuilt[lang]
            at = next(i for i in range(min(len(a), len(b))) if a[i] != b[i]) if a[:min(len(a), len(b))] != b[:min(len(a), len(b))] else min(len(a), len(b))
            raise SystemExit("ERROR: the %s Places page rebuilt from places.json differs from the original at:\n  was: %r\n  now: %r"
                             % (lang, a[max(0, at - 60):at + 60], b[max(0, at - 60):at + 60]))
    plan.write(data_path, sitedata.dump_json(data))
    for lang, path in PLACES_PAGES.items():
        if marked[lang] != pages[lang]:
            plan.write(path, marked[lang])
    plan.note("Places: %d groups, %d entries; both pages rebuild identically." % (
        len(groups), sum(len(g["entries"]) for g in groups)))


# ---------- Reflections ----------

SUTTAS_CONFIG = P("practice", "js", "suttas-config.js")
REFL_DIR = P("practice", "data", "reflections")
QUEUE_KEYS = ("id", "book", "part", "section", "label", "title", "ref", "suttaTitle", "translator", "url",
              "sourceTitle", "sourceAuthor", "sourceLocation", "sourceUrl", "excerpt")


def old_note_paragraphs(note):
    """What the old builder wrote for a note: its paragraphs, raw."""
    return [p.strip() for p in re.split(r"\n\s*\n", note) if p.strip()]


def migrate_reflections(plan):
    if not os.path.exists(SUTTAS_CONFIG):
        plan.note("Reflections: already migrated.")
        return
    text = sitedata.read_text(SUTTAS_CONFIG)
    books = js_declaration(text, "BOOKS")
    suttas = js_declaration(text, "SUTTAS")
    unlisted = js_declaration(text, "MANAGER_WITHDRAWN_REFLECTIONS") if re.search(
        r"\bconst\s+MANAGER_WITHDRAWN_REFLECTIONS\b", text) else []
    sections = {"version": 1,
                "sections": [{"id": key, "title": b["title"], "note": b["note"], "order": b["order"]} for key, b in books.items()],
                "sequence": [e["id"] for e in suttas],
                "unlisted": list(unlisted)}
    queue, written = [], 0
    for entry in suttas:
        note, added = (entry.get("note") or ""), entry.get("added")
        if note.strip() and added:
            details = {k: v for k, v in entry.items() if k != "note" and not (k == "excerpt" and v == "")}
            if "<" in note.replace("<em>", "").replace("</em>", ""):
                raise SystemExit("ERROR: %s has markup in its note the migration does not know." % entry["id"])
            if "*" in note or re.search(r"\[[^\]]*\]\(", note):
                raise SystemExit("ERROR: %s has * or [..](..) in its note, which Markdown would read as markup." % entry["id"])
            body = note.replace("<em>", "*").replace("</em>", "*")
            rendered = [h for _, h in sitedata.render_text(body)]
            if rendered != old_note_paragraphs(note):
                raise SystemExit("ERROR: %s would not render the same from Markdown." % entry["id"])
            if sitedata.plain_text(body) != re.sub(r"\s+", " ", htmllib.unescape(re.sub(r"<[^>]+>", "", note))).strip():
                raise SystemExit("ERROR: %s would not read the same as plain text." % entry["id"])
            plan.write(os.path.join(REFL_DIR, entry["id"] + ".md"), sitedata.dump_reflection(details, body))
            written += 1
        elif note.strip():
            raise SystemExit("ERROR: %s has a written note but no date: a draft. Move it to the Website Manager "
                             "as a draft first; only published Reflections go in the site." % entry["id"])
        else:
            queue.append({k: entry[k] for k in QUEUE_KEYS if k in entry and not (k == "excerpt" and entry[k] == "")})
    plan.write(os.path.join(REFL_DIR, "sections.json"), sitedata.dump_json(sections))
    plan.write(os.path.join(REFL_DIR, "queue.json"), sitedata.dump_json({"version": 1, "passages": queue}))
    plan.remove(SUTTAS_CONFIG)
    plan.note("Reflections: %d published, %d queued, %d unlisted." % (written, len(queue), len(unlisted)))


# ---------- Daily Sutta ----------

DAILY_CONFIG = P("practice", "js", "daily-sutta-config.js")
DAILY_DATA = P("practice", "data", "daily-sutta.json")
CURATOR_ID = re.compile(r"^curator-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$")


def sutta_id(url):
    match = re.match(r"^https://suttacentral\.net/([a-z]+[0-9][0-9.-]*)/", url)
    return match.group(1) if match else ""


def curator_entry(payload):
    """A Daily Sutta entry from a Curator handoff (schema 1): English only."""
    return {
        "id": "curator-" + payload["selection_id"],
        "title": payload["canonical_title"],
        "ref": payload["canonical_reference"],
        "translator": payload["translator"],
        "url": "https://suttacentral.net/%s/en/%s" % (payload["sutta_id"], payload["translator"]),
        "text": "".join(s["cached_english_text"] for s in payload["frozen_source_text"]),
    }


def migrate_daily(plan, old_store):
    if not os.path.exists(DAILY_CONFIG):
        plan.note("Daily Sutta: already migrated.")
        return
    entries = js_declaration(sitedata.read_text(DAILY_CONFIG), "DAILY_SUTTAS")
    records, resting = {}, []
    if old_store:
        store = sitedata.read_json(old_store)
        curator = store.get("curator") or {"records": {}, "inactive_manual": []}
        records = curator["records"]
        resting = [dict(e, _resting=True) for e in curator["inactive_manual"]]
        for sid, record in records.items():
            if record["manager_state"] == "in_pool" and record["rotation_state"] == "inactive":
                resting.append(dict(curator_entry(record["payload"]), _resting=True))
    out, seen = [], set()
    for entry in entries + resting:
        if entry["id"] in seen:
            raise SystemExit("ERROR: the Daily Sutta id %r appears twice." % entry["id"])
        seen.add(entry["id"])
        item = {k: entry[k] for k in ("id", "title", "ref", "translator", "url", "text")}
        match = CURATOR_ID.match(entry["id"])
        item["origin"] = "curator" if match else "older"
        item["rotation"] = "resting" if entry.get("_resting") else "in_rotation"
        item["sutta_id"] = sutta_id(entry["url"])
        if match:
            item["selection_id"] = match.group(1)
            record = records.get(match.group(1))
            if record:
                item["segment_ids"] = list(record["payload"]["candidate_segment_ids"])
        out.append(item)
    data = {"version": 1, "entries": out}
    rotation = [e for e in out if e["rotation"] == "in_rotation"]
    if [{k: e[k] for k in ("id", "title", "ref", "translator", "url", "text")} for e in rotation] != entries:
        raise SystemExit("ERROR: the Daily Sutta rotation would not match the old list exactly.")
    plan.write(DAILY_DATA, sitedata.dump_json(data))
    plan.remove(DAILY_CONFIG)
    plan.note("Daily Sutta: %d entries, %d in rotation, %d resting%s." % (
        len(out), len(rotation), len(out) - len(rotation), "" if old_store else " (no old manager store given)"))


# ---------- Quotes ----------

QUOTES_CONFIG = P("practice", "js", "quotes-config.js")
QUOTES_DATA = P("practice", "data", "quotes.json")


def migrate_quotes(plan):
    if not os.path.exists(QUOTES_CONFIG):
        plan.note("Quotes: already migrated.")
        return
    text = sitedata.read_text(QUOTES_CONFIG)
    quotes = js_declaration(text, "QUOTES")
    header = text[text.index("/*") + 2:text.index("*/")]
    sourcing = header[header.index("  Sourcing:"):].rstrip()
    notes = [re.sub(r"^  ", "", line) for line in sourcing.split("\n")]
    # The comments above an entry belong to it: a Verification link, and
    # the occasional note on a batch.
    body = text[text.index("const QUOTES = ["):text.index("\n];")]
    pending, attached = [], []
    for line in body.split("\n")[1:]:
        if line.startswith("  //"):
            pending.append(line[4:].strip())
        elif line == "  {":
            attached.append(pending)
            pending = []
    if len(attached) != len(quotes) or pending:
        raise SystemExit("ERROR: could not match the quote comments to their quotes.")
    out = []
    for quote, comments in zip(quotes, attached):
        item = {k: quote[k] for k in ("text", "author", "source", "themes")}
        if set(quote) - set(item):
            raise SystemExit("ERROR: a quote has fields the migration does not know: %s" % sorted(set(quote) - set(item)))
        links = [c[len("Verification:"):].strip() for c in comments if c.startswith("Verification:")]
        others = [c for c in comments if not c.startswith("Verification:")]
        if len(links) > 1:
            raise SystemExit("ERROR: a quote has two verification links.")
        if links:
            item["verification"] = links[0]
        if others:
            item["comment"] = " ".join(others)
        out.append(item)
    plan.write(QUOTES_DATA, sitedata.dump_json({"version": 1, "sourcing": notes, "quotes": out}))
    plan.remove(QUOTES_CONFIG)
    plan.note("Quotes: %d, %d with a verification link." % (len(out), sum(1 for q in out if "verification" in q)))


# ---------- Photography: the loose sheet ----------

SHEETS = P("photography", "data", "sheets.json")
META = P("photography", "data", "photo-meta.json")
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]


def between_walks_title(month):
    """The title of the sheet for the single photographs of one month."""
    return "Between walks, %s %s" % (MONTHS[int(month[5:]) - 1], month[:4])


def migrate_loose(plan):
    data = sitedata.read_json(SHEETS)
    loose = [s for s in data["sheets"] if s["kind"] == "loose"]
    if not loose:
        plan.note("Photography: no loose sheet left.")
        return
    meta = sitedata.read_json(META)
    sheets = [s for s in data["sheets"] if s["kind"] != "loose"]
    retired = data.get("retired", {"sheets": {}, "photos": {}})
    made = []
    for old in loose:
        months = {}
        for frame in old["frames"]:
            months.setdefault(meta[frame]["captured"][:7], []).append(frame)
        for month, frames in sorted(months.items(), reverse=True):
            frames.sort(key=lambda i: meta[i]["captured"])
            sheet_id = "between-walks-" + month
            if any(s["id"] == sheet_id for s in sheets):
                raise SystemExit("ERROR: a sheet %s already exists." % sheet_id)
            places = []
            for frame in frames:
                if meta[frame]["place"] and meta[frame]["place"] not in places:
                    places.append(meta[frame]["place"])
            sheet = {"id": sheet_id, "title": between_walks_title(month), "line": "", "kind": "between",
                     "places": places, "frames": frames, "circled": [i for i in frames if i in old["circled"]]}
            first = min(meta[i]["captured"] for i in frames)
            # Sheets are newest first, by the day each one starts: the new
            # sheet goes before the first sheet that starts earlier.
            at = next((k for k, s in enumerate(sheets)
                       if min(meta[i]["captured"] for i in s["frames"]) < first), len(sheets))
            sheets.insert(at, sheet)
            made.append(sheet)
        for address in {old["id"], old.get("address", old["id"]), *old.get("previous_addresses", [])}:
            retired["sheets"][address] = "split into one between-walks sheet per month, October 2026"
    data = {"sheets": sheets, "retired": retired}
    plan.write(SHEETS, sitedata.dump_json(data, sitedata.json_indent(SHEETS)))
    plan.note("Photography: the loose sheet became %s." % ", ".join("%s (%d)" % (s["title"], len(s["frames"])) for s in made))


# ---------- the sitemap's photography block ----------

SITEMAP = P("sitemap.xml")


def migrate_sitemap(plan):
    """Gather the photography entries of sitemap.xml between BUILD markers,
    where tools/build-photography.py writes them from now on."""
    text = plan.writes.get(SITEMAP) or sitedata.read_text(SITEMAP)
    if "<!-- BUILD:photography -->" in text:
        plan.note("Sitemap: already migrated.")
        return
    entries = list(re.finditer(r"  <url>\n    <loc>https://faisalhenar\.com/photography/[^<]*</loc>\n"
                               r"(?:    <lastmod>[^<]*</lastmod>\n)?  </url>\n", text))
    if not entries:
        raise SystemExit("ERROR: sitemap.xml has no photography entries to gather.")
    first = entries[0].start()
    for m in reversed(entries):
        text = text[:m.start()] + text[m.end():]
    text = text[:first] + "<!-- BUILD:photography -->\n<!-- /BUILD:photography -->\n" + text[first:]
    plan.write(SITEMAP, text)
    plan.note("Sitemap: %d photography entries gathered for the builder." % len(entries))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--old-manager-daily")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    plan = Plan(args.dry_run)
    migrate_places(plan)
    migrate_reflections(plan)
    migrate_daily(plan, args.old_manager_daily)
    migrate_quotes(plan)
    migrate_loose(plan)
    migrate_sitemap(plan)
    for line in plan.notes:
        print(line)
    plan.apply()


if __name__ == "__main__":
    main()
