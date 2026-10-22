#!/usr/bin/env python3
"""Read-only whole-site validator used locally and by GitHub Actions."""

from __future__ import annotations

import argparse
import importlib.util
from collections import defaultdict
from datetime import date
from html.parser import HTMLParser
import json
import posixpath
from pathlib import Path, PurePosixPath
import re
import sys
import types
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = "https://faisalhenar.com"
FORBIDDEN = ("\u2014", "\u2015", "&mdash;", "&#8212;", "&#x2014;")
ID = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

DEPENDENCIES = (
    {"id": "reflections", "label": "Reflections", "sources": ("practice/data/reflections/",), "consumers": ("practice/reflections.html", "practice/reflections/", "tools/build-reflections.py", "tools/sitedata.py", "practice/index.html", "practice/js/notebook/hub.js", "practice/js/render-daily-sutta.js"), "effects": ("archive", "latest Reflection line", "daily-sutta matching")},
    {"id": "quotes", "label": "Quotes", "sources": ("practice/data/quotes.json",), "consumers": ("practice/index.html", "practice/js/render-quotes.js"), "effects": ("Practice quote",)},
    {"id": "daily-sutta", "label": "Daily Sutta", "sources": ("practice/data/daily-sutta.json", "practice/data/reflections/published.json"), "consumers": ("practice/index.html", "practice/js/render-daily-sutta.js"), "effects": ("daily rotation", "matching published Reflection link")},
    {"id": "reading", "label": "Reading", "sources": ("practice/data/reading.json",), "consumers": ("practice/reading.html", "practice/js/notebook/render-room-data.js", "practice/js/notebook/hub.js"), "effects": ("Reading room", "hub count")},
    {"id": "talks", "label": "Talks", "sources": ("practice/data/talks.json",), "consumers": ("practice/talks.html", "practice/js/notebook/render-room-data.js", "practice/js/notebook/hub.js", "practice/listening.html", "practice/watching.html", "practice/js/notebook/redirect-talks.js"), "effects": ("Talks room", "hub count", "old Listening and Watching links")},
    {"id": "places", "label": "Places & Community", "sources": ("practice/data/places.json",), "consumers": ("practice/places.html", "practice/places-nl.html", "tools/build-places.py", "practice/js/notebook/hub.js"), "effects": ("Places room in English and Dutch", "structured data", "hub spread")},
    {"id": "photography", "label": "Photography", "sources": ("photography/data/photos.json", "photography/data/sheets.json", "photography/data/walls.json", "photography/data/photo-meta.json", "photography/data/exhibition.json"), "consumers": ("photography/index.html", "photography/sheets/", "photography/everything/", "photography/p/", "photography/room-assets/", "photography/photos/", "tools/build-photography.py"), "effects": ("wall", "contact sheets", "Everything", "photograph pages", "image files")},
    {"id": "crosslinks", "label": "Elsewhere in the notebook", "sources": ("practice/data/crosslinks.json",), "consumers": ("practice/js/notebook/room.js", "tools/build-reflections.py"), "effects": ("links between the rooms",)},
    {"id": "language-pairs", "label": "English and Dutch pages", "sources": ("practice/data/nl-mirrors.json", "practice/data/places.json"), "consumers": ("practice/*-nl.html", "practice/*.html"), "effects": ("reciprocal hreflang", "translation drift review")},
)

# Data files checked against the schema beside them (<name>.schema.json),
# with the dependency each belongs to. tools/sitedata.py reads the schemas;
# the Website Manager reads the same ones, so the two can never disagree.
SCHEMA_FILES = (
    ("practice/data/daily-sutta.json", "Daily Sutta", "daily-sutta"),
    ("practice/data/quotes.json", "Quotes", "quotes"),
    ("practice/data/places.json", "Places & Community", "places"),
    ("practice/data/reading.json", "Reading", "reading"),
    ("practice/data/talks.json", "Talks", "talks"),
    ("practice/data/crosslinks.json", "Elsewhere in the notebook", "crosslinks"),
    ("practice/data/reflections/sections.json", "Reflections", "reflections"),
    ("practice/data/reflections/queue.json", "Reflections", "reflections"),
    ("practice/data/reflections/published.json", "Reflections", "reflections"),
    ("photography/data/photos.json", "Photography", "photography"),
    ("photography/data/sheets.json", "Photography", "photography"),
    ("photography/data/walls.json", "Photography", "photography"),
    ("photography/data/photo-meta.json", "Photography", "photography"),
)

# English pages whose Dutch mirror is written from data rather than kept by
# hand, so they are not in nl-mirrors.json; their hreflang is still checked.
GENERATED_PAIRS = ({"source": "practice/places.html", "mirror": "practice/places-nl.html"},)
# Photograph pages are public and indexable but deliberately not in the
# sitemap; the contact sheets link to them.
UNLISTED_PREFIXES = ("photography/p/",)


def _load_sitedata():
    spec = importlib.util.spec_from_file_location("sitedata_for_validator", Path(__file__).resolve().parent / "sitedata.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def issue(code, area, path, message, dependencies=()):
    return {"code": code, "area": area, "path": path, "message": message, "dependencies": list(dependencies)}


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.attrs, self.links, self.visible, self.json_ld = [], [], [], []
        self.ids, self.hidden, self.ld, self.ld_parts = set(), 0, 0, []

    def handle_starttag(self, tag, attrs):
        values = {key.lower(): value or "" for key, value in attrs}
        tag = tag.lower(); self.attrs.append((tag, values))
        if values.get("id"): self.ids.add(values["id"])
        for key in ("href", "src", "poster"):
            if values.get(key): self.links.append((key, values[key]))
        if tag == "script" and values.get("type", "").lower() == "application/ld+json":
            self.ld += 1; self.ld_parts = []
        # A blockquote is quoted material, not our copy. STYLE.md exempts the
        # `excerpt` field from the punctuation rule because repunctuating a
        # translation is misquoting it; a blockquote on a page is that same
        # field rendered, so the exemption has to follow it here.
        elif tag in {"script", "style", "template", "blockquote"}: self.hidden += 1
        for key in ("alt", "title", "aria-label", "content"):
            if values.get(key): self.visible.append(values[key])

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "script" and self.ld:
            self.ld -= 1; self.json_ld.append("".join(self.ld_parts)); self.ld_parts = []
        elif tag in {"script", "style", "template", "blockquote"} and self.hidden: self.hidden -= 1

    def handle_data(self, data):
        if self.ld: self.ld_parts.append(data)
        elif not self.hidden and data.strip(): self.visible.append(data)


def read_json(relative, issues, area):
    try: return json.loads((ROOT / relative).read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        issues.append(issue("malformed-json", area, relative, f"Could not read valid JSON: {exc}")); return None


def jpeg_size(path):
    """Read JPEG dimensions without decoding or changing the image."""
    start_of_frame = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
    with path.open("rb") as source:
        if source.read(2) != b"\xff\xd8": raise ValueError("not a JPEG")
        while True:
            byte = source.read(1)
            if not byte: raise ValueError("JPEG has no size marker")
            if byte != b"\xff": continue
            marker = source.read(1)
            while marker == b"\xff": marker = source.read(1)
            code = marker[0]
            if code in {0xD8, 0xD9} or 0xD0 <= code <= 0xD7: continue
            length_bytes = source.read(2)
            if len(length_bytes) != 2: raise ValueError("truncated JPEG")
            length = int.from_bytes(length_bytes, "big")
            if length < 2: raise ValueError("invalid JPEG segment")
            if code in start_of_frame:
                payload = source.read(5)
                if len(payload) != 5: raise ValueError("truncated JPEG size")
                return int.from_bytes(payload[3:5], "big"), int.from_bytes(payload[1:3], "big")
            source.seek(length - 2, 1)


def page_url(relative):
    if relative == "index.html": return ORIGIN + "/"
    if relative.endswith("/index.html"): return ORIGIN + "/" + relative[:-10]
    return ORIGIN + "/" + relative


def rendered_ids(page):
    sources = {"practice/reading.html": ("practice/data/reading.json", "books")}
    if page in {"practice/talks.html", "practice/listening.html", "practice/watching.html"}:
        # Talks (October 2026): every source, and the old Listening and
        # Watching ids it replaced, which open the same source. The two old
        # pages are redirects that carry the anchor on to Talks.
        try:
            data = json.loads((ROOT / "practice/data/talks.json").read_text(encoding="utf-8"))
            return {i for s in data["sections"] for item in s["items"] for i in [item["id"], *item.get("aliases", [])]} | {s["id"] for s in data["sections"]}
        except Exception: return set()
    source = sources.get(page)
    if not source: return set()
    try:
        data = json.loads((ROOT / source[0]).read_text(encoding="utf-8"))
        return {item["id"] for collection in data["collections"] for item in collection[source[1]] if item.get("id")}
    except Exception: return set()


def local_target(page, raw):
    parsed = urlsplit(raw.strip())
    if not raw or raw.startswith(("#", "mailto:", "tel:", "data:", "javascript:")): return None
    absolute = False
    if parsed.scheme or parsed.netloc:
        if parsed.scheme not in {"http", "https"} or parsed.netloc.casefold() != "faisalhenar.com": return None
        path = unquote(parsed.path).lstrip("/"); absolute = True
    else:
        path = unquote(parsed.path); absolute = path.startswith("/"); path = path.lstrip("/")
    # A Cloudflare-resized image, /cdn-cgi/image/<options>/<path>, is served
    # from <path>; that is the file that has to exist.
    if absolute and path.startswith("cdn-cgi/image/") and path.count("/") >= 3: path = path.split("/", 3)[3]
    parts = [] if absolute else list(PurePosixPath(page).parent.parts)
    for part in PurePosixPath(path).parts:
        if part in {"", ".", "/"}: continue
        if part == "..":
            if not parts: return None, "outside", parsed.fragment
            parts.pop()
        else: parts.append(part)
    target = ROOT.joinpath(*parts)
    if raw.endswith("/") or target.is_dir(): target /= "index.html"; parts.append("index.html")
    return target, PurePosixPath(*parts).as_posix(), parsed.fragment


def validate_pages(issues):
    page_folders = (ROOT, ROOT / "practice", ROOT / "practice" / "reflections", ROOT / "photography", ROOT / "photography" / "index")
    pages = {path.relative_to(ROOT).as_posix() for folder in page_folders for path in folder.glob("*.html")}
    # The photography room is generated into folders of its own (sheets,
    # Everything, a page per photograph) and leaves redirect pages at the
    # older addresses. Every one of them is a page, so every one is checked.
    pages |= {path.relative_to(ROOT).as_posix() for path in (ROOT / "photography").rglob("*.html")
              if "photos" not in path.relative_to(ROOT / "photography").parts}
    pages = sorted(pages)
    parsed, versions = {}, defaultdict(set)
    for relative in pages:
        try: text = (ROOT / relative).read_text(encoding="utf-8")
        except Exception as exc: issues.append(issue("unreadable-file", "Pages", relative, str(exc))); continue
        parser = Page(); parser.feed(text); parser.close(); parsed[relative] = parser
        expected = page_url(relative); special = relative == "404.html"
        # A redirect page (meta refresh, noindex) names as its canonical either
        # the page it sends the reader to (practice/listening.html and
        # watching.html since the Talks room, October 2026) or its own address
        # (a withdrawn Reflection, like the photography room's redirects).
        # The target is normalised: "../reflections.html" from
        # practice/reflections/ is practice/reflections.html (October 2026;
        # before that no withdrawn Reflection could pass).
        accepted = {expected}
        refresh = [attrs.get("content", "") for tag, attrs in parser.attrs if tag == "meta" and attrs.get("http-equiv", "").lower() == "refresh"]
        robots = " ".join(attrs.get("content", "") for tag, attrs in parser.attrs if tag == "meta" and attrs.get("name", "").lower() == "robots")
        if refresh and "url=" in refresh[0] and "noindex" in robots and not re.match(r"\s*(?:/|[a-z]+:)", refresh[0].split("url=", 1)[1]):
            target = posixpath.normpath(PurePosixPath(PurePosixPath(relative).parent, refresh[0].split("url=", 1)[1].strip()).as_posix())
            expected = page_url(target)
            accepted.add(expected)
        canonical = [attrs.get("href") for tag, attrs in parser.attrs if tag == "link" and attrs.get("rel", "").lower() == "canonical"]
        if not special and (len(canonical) != 1 or canonical[0] not in accepted): issues.append(issue("canonical", "Metadata", relative, f"Canonical URL must be exactly {expected}."))
        expected = canonical[0] if len(canonical) == 1 and canonical[0] in accepted else expected
        # Every page loads css/base.css, and loads it before its section
        # stylesheet: base draws the shared chrome and the section file
        # re-tunes it, so the order decides which one wins. A page that
        # misses it renders the menu, the skip link and the reset unstyled,
        # which is easy to ship and easy not to notice on a page you did
        # not happen to open. Caught here rather than by eye.
        sheets = [attrs.get("href", "") for tag, attrs in parser.attrs
                  if tag == "link" and attrs.get("rel", "").lower() == "stylesheet"]
        base_at = next((i for i, href in enumerate(sheets) if "css/base.css" in href), None)
        section_at = next((i for i, href in enumerate(sheets)
                           if re.search(r"css/(?:hub|practice|style)\.css", href)), None)
        if base_at is None:
            issues.append(issue("base-stylesheet", "Pages", relative, "Every page must load css/base.css."))
        elif section_at is not None and base_at > section_at:
            issues.append(issue("base-stylesheet", "Pages", relative, "css/base.css must load before the section stylesheet."))
        og = {attrs.get("property"): attrs.get("content") for tag, attrs in parser.attrs if tag == "meta" and attrs.get("property", "").startswith("og:")}
        for key in (() if special else ("og:title", "og:description", "og:type", "og:url", "og:image")):
            if not og.get(key): issues.append(issue("open-graph", "Metadata", relative, f"Missing {key}."))
        if not special and og.get("og:url") != expected: issues.append(issue("open-graph", "Metadata", relative, "og:url must match canonical."))
        for block in parser.json_ld:
            try: value = json.loads(block)
            except json.JSONDecodeError as exc: issues.append(issue("json-ld", "Metadata", relative, str(exc))); continue
            values = value.get("@graph", []) if isinstance(value, dict) and "@graph" in value else ([value] if isinstance(value, dict) else value)
            if isinstance(value, dict) and value.get("@context") != "https://schema.org": issues.append(issue("json-ld", "Metadata", relative, "JSON-LD requires schema.org context."))
            if not isinstance(values, list) or any(not isinstance(item, dict) or not item.get("@type") for item in values): issues.append(issue("json-ld", "Metadata", relative, "Each JSON-LD object requires @type."))
        if any(any(token.lower() in value.lower() for token in FORBIDDEN) for value in parser.visible): issues.append(issue("visible-copy-punctuation", "Visible copy", relative, "Visible copy contains forbidden punctuation."))
    for relative, parser in parsed.items():
        for attribute, raw in parser.links:
            target_info = local_target(relative, raw)
            if target_info is None: continue
            target, target_relative, fragment = target_info
            if target_relative == "outside" or not target.is_file(): issues.append(issue("missing-local-target", "Links and assets", relative, f"{attribute}={raw!r} does not resolve to a local file.")); continue
            if fragment and target.suffix.lower() == ".html":
                target_page = parsed.get(target_relative)
                available = (target_page.ids if target_page else set()) | rendered_ids(target_relative)
                if fragment not in available: issues.append(issue("missing-fragment", "Links and assets", relative, f"Link {raw!r} points to a missing id."))
            if target.suffix.lower() in {".css", ".js"}:
                query = dict(pair.split("=", 1) if "=" in pair else (pair, "") for pair in urlsplit(raw).query.split("&") if pair)
                versions[target_relative].add(query.get("v", ""))
    for asset, found in versions.items():
        if len(found) > 1: issues.append(issue("cache-version", "Shared assets", asset, "References use inconsistent cache versions."))
    punctuation_path = ROOT / "tools/no-em-dash.py"
    try:
        punctuation = types.ModuleType("visible_copy_validator")
        punctuation.__file__ = str(punctuation_path)
        exec(compile(punctuation_path.read_text(encoding="utf-8"), str(punctuation_path), "exec"), punctuation.__dict__)
        for path in sorted(ROOT.glob("**/js/*.js")):
            relative = path.relative_to(ROOT).as_posix(); text = path.read_text(encoding="utf-8")
            if any(punctuation.HIT_RE.search(text[start:end]) for start, end, _label in punctuation.js_regions(text, relative)):
                issues.append(issue("visible-copy-punctuation", "Visible copy", relative, "A JavaScript string contains forbidden punctuation."))
    except Exception as exc:
        issues.append(issue("validator-runtime", "Visible copy", "tools/no-em-dash.py", f"JavaScript visible-copy validation could not run: {exc}"))
    try:
        tree = ET.parse(ROOT / "sitemap.xml"); namespace = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        actual = {node.text.strip() for node in tree.findall("s:url/s:loc", namespace) if node.text}
        # A page marked noindex is one we have asked search engines to leave
        # alone, and the sitemap is the list we ask them to read. The two are
        # the same decision, so a noindex page is expected to be absent rather
        # than reported as missing. Today that is the withdrawn-Reflection
        # redirect, which keeps a shared link working without being a page.
        noindex = {relative for relative, parser in parsed.items()
                   if any(tag == "meta" and attrs.get("name", "").lower() == "robots"
                          and "noindex" in attrs.get("content", "").lower()
                          for tag, attrs in parser.attrs)}
        expected = {page_url(page) for page in pages
                    if page != "404.html" and page not in noindex and not page.startswith(UNLISTED_PREFIXES)}
        for url in sorted(expected - actual): issues.append(issue("sitemap", "Sitemap", "sitemap.xml", f"Missing public page: {url}."))
        for url in sorted(actual - expected): issues.append(issue("sitemap", "Sitemap", "sitemap.xml", f"Unknown public page: {url}."))
    except Exception as exc: issues.append(issue("sitemap", "Sitemap", "sitemap.xml", str(exc)))
    return pages, parsed, versions


def read_reflections(issues, sitedata):
    """(published entries, unlisted ids) from practice/data/reflections/, or
    None if the files cannot be read. Each entry is its details plus `note`,
    the text."""
    folder, area = "practice/data/reflections", ("reflections",)
    try:
        sections = json.loads((ROOT / folder / "sections.json").read_text(encoding="utf-8"))
        schema = json.loads((ROOT / folder / "reflection.schema.json").read_text(encoding="utf-8"))
    except Exception as exc:
        issues.append(issue("reflection-schema", "Reflections", folder, f"The Reflections data could not be read: {exc}", area)); return None
    entries = []
    for path in sorted((ROOT / folder).glob("*.md")):
        relative = path.relative_to(ROOT).as_posix()
        try: details, body = sitedata.parse_reflection(path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc: issues.append(issue("reflection-schema", "Reflections", relative, f"Not a Reflection file: {exc}.", area)); continue
        for problem in sitedata.check(details, schema): issues.append(issue("reflection-schema", "Reflections", relative, problem, area))
        if details.get("id") != path.stem: issues.append(issue("reflection-schema", "Reflections", relative, "The id must be the name of the file.", area))
        if not body.strip(): issues.append(issue("reflection-schema", "Reflections", relative, "A published Reflection needs its text.", area))
        for key, value in details.items():
            if key != "excerpt" and isinstance(value, str) and any(token.lower() in value.lower() for token in FORBIDDEN): issues.append(issue("visible-copy-punctuation", "Visible copy", relative, f"The {key} contains forbidden punctuation.", area)); break
        own = "\n".join(line for line in body.split("\n") if not line.startswith(">"))  # a "> " quotation is not ours
        if any(token.lower() in own.lower() for token in FORBIDDEN): issues.append(issue("visible-copy-punctuation", "Visible copy", relative, "The text contains forbidden punctuation.", area))
        entries.append(dict(details, note=body))
    sequence = sections.get("sequence", []) if isinstance(sections, dict) else []
    sections_ids = {s.get("id") for s in sections.get("sections", [])} if isinstance(sections, dict) else set()
    for entry in entries:
        if entry.get("id") not in sequence: issues.append(issue("reflection-schema", "Reflections", f"{folder}/sections.json", f"{entry.get('id')} is not in the sequence.", area))
        if entry.get("book") not in sections_ids: issues.append(issue("reflection-schema", "Reflections", f"{folder}/{entry.get('id')}.md", f"Unknown section {entry.get('book')!r}.", area))
    hidden = sections.get("unlisted", []) if isinstance(sections, dict) else []
    if not isinstance(hidden, list) or set(hidden) - {e.get("id") for e in entries}:
        issues.append(issue("reflection-schema", "Reflections", f"{folder}/sections.json", "unlisted must name published Reflections only.", area)); hidden = []
    for entry in entries:  # listed Reflections carry FH's own search description
        if entry.get("id") in hidden: continue
        summary = entry.get("summary") or ""
        if not summary.strip(): issues.append(issue("reflection-summary", "Reflections", f"{folder}/{entry.get('id')}.md", "Reflection has no search description.", area))
        elif len(summary) > 170: issues.append(issue("reflection-summary", "Reflections", f"{folder}/{entry.get('id')}.md", "Search description is longer than 170 characters.", area))
    return entries, hidden


def validate_reflection_pages(issues, suttas, hidden, parsed_pages):
    """Every page under practice/reflections/ is in exactly one of three states.

    Listed: a published entry, a full article, in the archive (and so, by the
    noindex rule, in the sitemap). Unlisted: a published entry named in
    sections.json "unlisted", still a full article at its URL but noindex
    and absent from the archive. No longer published: a noindex redirect to
    the archive. A page in the wrong state means the builder has not been run
    since the data changed.
    """
    area = ("reflections",)
    try: archive = (ROOT / "practice/reflections.html").read_text(encoding="utf-8")
    except OSError as exc: issues.append(issue("reflection-page", "Reflections", "practice/reflections.html", str(exc), area)); return
    published = {item["slug"]: item["id"] for item in suttas if isinstance(item, dict) and isinstance(item.get("slug"), str) and isinstance(item.get("note"), str) and item["note"].strip() and item.get("added")}
    for item in suttas:
        if isinstance(item, dict) and item.get("note", "").strip() and not isinstance(item.get("slug"), str):
            issues.append(issue("reflection-page", "Reflections", f"practice/data/reflections/{item.get('id')}.md", "A published Reflection has no slug yet. Run tools/build-reflections.py.", area))
    pages = {PurePosixPath(page).stem for page in parsed_pages if PurePosixPath(page).parent.as_posix() == "practice/reflections"}
    for slug in sorted(pages | set(published)):
        page = f"practice/reflections/{slug}.html"; parser = parsed_pages.get(page)
        if parser is None: issues.append(issue("reflection-page", "Reflections", page, "Published Reflection has no page. Run tools/build-reflections.py.", area)); continue
        metas = [attrs for tag, attrs in parser.attrs if tag == "meta"]
        noindex = any(attrs.get("name", "").lower() == "robots" and "noindex" in attrs.get("content", "").lower() for attrs in metas)
        redirect = any(attrs.get("http-equiv", "").lower() == "refresh" for attrs in metas)
        listed = f'href="reflections/{slug}.html"' in archive
        if slug not in published: ok = redirect and noindex and not listed
        elif published[slug] in hidden: ok = noindex and not redirect and not listed
        else: ok = not noindex and not redirect and listed
        if not ok: issues.append(issue("reflection-page", "Reflections", page, "Reflection page does not match its listed, unlisted or unpublished state. Run tools/build-reflections.py.", area))


def validate_data(issues, parsed_pages):
    counts = {}
    photos = read_json("photography/data/photos.json", issues, "Photography")
    exhibition = read_json("photography/data/exhibition.json", issues, "Photography")
    by_id, sources = {}, set()
    if not isinstance(photos, list): issues.append(issue("photography-schema", "Photography", "photography/data/photos.json", "Must contain an ordered array.", ("photography",))); photos = []
    for number, photo in enumerate(photos, 1):
        required = {"id", "src", "w", "h", "color", "alt", "added"}
        if not isinstance(photo, dict) or set(photo) != required: issues.append(issue("photography-schema", "Photography", "photography/data/photos.json", f"Photo {number} has an invalid schema.", ("photography",))); continue
        photo_id, src = photo["id"], photo["src"]
        if not isinstance(photo_id, str) or not ID.fullmatch(photo_id) or photo_id in by_id: issues.append(issue("photography-schema", "Photography", "photography/data/photos.json", f"Photo {number} has an invalid or duplicate id.", ("photography",)))
        else: by_id[photo_id] = photo
        if not isinstance(src, str) or not src.startswith("photos/") or ".." in PurePosixPath(src).parts or src.casefold() in sources: issues.append(issue("photography-schema", "Photography", "photography/data/photos.json", f"Photo {number} has an unsafe or duplicate path.", ("photography",))); continue
        sources.add(src.casefold()); target = ROOT / "photography" / Path(src)
        if not target.is_file(): issues.append(issue("missing-image", "Photography", src, "Referenced image is missing.", ("photography",)))
        else:
            try:
                if jpeg_size(target) != (photo["w"], photo["h"]): issues.append(issue("image-dimensions", "Photography", src, "Image dimensions do not match photos.json.", ("photography",)))
            except Exception as exc: issues.append(issue("missing-image", "Photography", src, f"Image is unreadable: {exc}", ("photography",)))
        if not isinstance(photo["alt"], str) or not photo["alt"].strip() or not isinstance(photo["color"], bool): issues.append(issue("photography-schema", "Photography", "photography/data/photos.json", f"Photo {number} needs alt text and a boolean color value.", ("photography",)))
        try:
            if date.fromisoformat(photo["added"]).isoformat() != photo["added"]: raise ValueError
        except Exception: issues.append(issue("photography-schema", "Photography", "photography/data/photos.json", f"Photo {number} has an invalid date.", ("photography",)))
    used = set()
    if not isinstance(exhibition, list): issues.append(issue("photography-schema", "Photography", "photography/data/exhibition.json", "Must contain rows.", ("photography",))); exhibition = []
    for number, row in enumerate(exhibition, 1):
        ids = row.get("row") if isinstance(row, dict) else None
        if not isinstance(row, dict) or set(row) - {"row", "width", "weight", "turn"} or not isinstance(ids, list) or len(ids) not in {1, 2}: issues.append(issue("photography-schema", "Photography", "photography/data/exhibition.json", f"Row {number} has unsupported fields or does not contain one or two ids.", ("photography",))); continue
        for photo_id in ids:
            if photo_id not in by_id or photo_id in used: issues.append(issue("photography-schema", "Photography", "photography/data/exhibition.json", f"Row {number} has a missing or repeated photo id.", ("photography",)))
            used.add(photo_id)
        if "turn" in row and not isinstance(row["turn"], bool): issues.append(issue("photography-schema", "Photography", "photography/data/exhibition.json", f"Row {number} turn must be boolean.", ("photography",)))
        if len(ids) == 1 and (row.get("width", "full") not in {"full", "narrow"} or "weight" in row): issues.append(issue("photography-schema", "Photography", "photography/data/exhibition.json", f"Row {number} has invalid single-photo layout fields.", ("photography",)))
        if len(ids) == 2 and ("width" in row or ("weight" in row and row["weight"] not in ([1, 1], [1.25, 1], [1, 1.25]))): issues.append(issue("photography-schema", "Photography", "photography/data/exhibition.json", f"Row {number} has invalid pair layout fields.", ("photography",)))
    counts.update({"photos": len(photos), "exhibition_rows": len(exhibition), "exhibition_photos": len(used)})
    for shelf, key in (("reading", "books"),):
        relative = f"practice/data/{shelf}.json"; data = read_json(relative, issues, shelf.title())
        if not isinstance(data, dict) or set(data) != {"version", "updated", "collections"} or data.get("version") != 1 or not isinstance(data.get("collections"), list): issues.append(issue("shelf-schema", shelf.title(), relative, "Shelf has an invalid top-level schema.", (shelf,))); continue
        ids = set(); total = 0
        for collection in data["collections"]:
            collection_fields = {"id", "title", "kind", key} if shelf == "reading" else {"id", "kind", key}
            if not isinstance(collection, dict) or set(collection) != collection_fields or not isinstance(collection.get(key), list): issues.append(issue("shelf-schema", shelf.title(), relative, "Collection has an invalid schema.", (shelf,))); continue
            for item in collection[key]:
                total += 1; item_id = item.get("id") if isinstance(item, dict) else None
                allowed = {"id", "title", "author", "url", "description", "meta"} | ({"descriptionStyle", "wide"} if shelf == "reading" else set())
                required = {"id", "title", "author", "url", "description", "meta"} | ({"descriptionStyle"} if shelf == "reading" else set())
                if not isinstance(item, dict) or set(item) - allowed or not required.issubset(item): issues.append(issue("shelf-schema", shelf.title(), relative, "Shelf item has unsupported or missing fields.", (shelf,))); continue
                if not isinstance(item_id, str) or not ID.fullmatch(item_id) or item_id in ids: issues.append(issue("shelf-schema", shelf.title(), relative, "Shelf item has an invalid or duplicate id.", (shelf,)))
                ids.add(item_id)
                if not isinstance(item, dict) or not all(isinstance(item.get(field), str) and item[field].strip() for field in ("title", "author")): issues.append(issue("shelf-schema", shelf.title(), relative, "Shelf item requires title and author.", (shelf,)))
                if not all(isinstance(item.get(field), str) for field in ("url", "description", "meta")): issues.append(issue("shelf-schema", shelf.title(), relative, "Shelf item text and link fields must be strings.", (shelf,)))
                elif item["url"] and urlsplit(item["url"]).scheme not in {"http", "https"}: issues.append(issue("shelf-schema", shelf.title(), relative, "Shelf item URL must use HTTP or HTTPS.", (shelf,)))
                if shelf == "reading" and (item.get("descriptionStyle") not in {"note", "reflection"} or ("wide" in item and not isinstance(item["wide"], bool))): issues.append(issue("shelf-schema", shelf.title(), relative, "Reading layout fields are invalid.", (shelf,)))
        counts[shelf] = total
        if shelf == "reading":
            page = (ROOT / "practice/reading.html").read_text(encoding="utf-8")
            missing = [collection["id"] for collection in data["collections"] if f'data-list="{collection["id"]}"' not in page]
            if missing: issues.append(issue("renderer-contract", "Reading", "practice/reading.html", "Collections have no render target: " + ", ".join(missing) + ".", (shelf,)))
    talks = read_json("practice/data/talks.json", issues, "Talks"); seen = set(); total = 0
    if not isinstance(talks, dict) or set(talks) != {"version", "updated", "sections"} or not isinstance(talks.get("sections"), list): issues.append(issue("shelf-schema", "Talks", "practice/data/talks.json", "Talks has an invalid top-level schema.", ("talks",)))
    else:
        for section in talks["sections"]:
            if not isinstance(section, dict) or set(section) != {"id", "title", "intro", "items"} or not ID.fullmatch(str(section.get("id"))): issues.append(issue("shelf-schema", "Talks", "practice/data/talks.json", "Section has an invalid schema.", ("talks",))); continue
            for item in section["items"]:
                total += 1
                if not isinstance(item, dict) or not {"id", "aliases", "title", "author", "description", "meta", "listen", "watch"}.issubset(item) or set(item) - {"id", "aliases", "title", "author", "description", "meta", "listen", "watch", "note"}: issues.append(issue("shelf-schema", "Talks", "practice/data/talks.json", "Source has unsupported or missing fields.", ("talks",))); continue
                for i in [item["id"], *item["aliases"]]:
                    if not ID.fullmatch(i) or i in seen: issues.append(issue("shelf-schema", "Talks", "practice/data/talks.json", f"Invalid or duplicate id {i!r}.", ("talks",)))
                    seen.add(i)
                links = [item[k] for k in ("listen", "watch") if item[k]]
                if not links or any(urlsplit(u).scheme not in {"http", "https"} for u in links): issues.append(issue("shelf-schema", "Talks", "practice/data/talks.json", f"Source {item['id']} needs a listen or watch link over HTTP(S).", ("talks",)))
        counts["talks"] = total
    # The content files, each against the schema beside it.
    try: sitedata = _load_sitedata()
    except Exception as exc:
        issues.append(issue("validator-runtime", "Data", "tools/sitedata.py", f"The data reader could not load: {exc}")); return counts
    values = {}
    for relative, area, dependency in SCHEMA_FILES:
        value = read_json(relative, issues, area)
        if value is None: continue
        values[relative] = value
        try: schema = json.loads((ROOT / sitedata.schema_path(relative)).read_text(encoding="utf-8"))
        except Exception as exc:
            issues.append(issue("schema", area, sitedata.schema_path(relative), f"The schema could not be read: {exc}", (dependency,))); continue
        for problem in sitedata.check(value, schema)[:20]:
            issues.append(issue("schema", area, relative, problem, (dependency,)))
    # Reflections: the Markdown files, then their pages.
    reflections = read_reflections(issues, sitedata)
    if reflections is not None:
        entries, hidden = reflections
        counts["reflections"] = len(entries)
        validate_reflection_pages(issues, entries, hidden, parsed_pages)
        listed = values.get("practice/data/reflections/published.json")
        if isinstance(listed, dict):
            named = {(r.get("id"), r.get("slug")) for r in listed.get("reflections", []) if isinstance(r, dict)}
            wanted = {(e.get("id"), e.get("slug")) for e in entries if e.get("id") not in hidden}
            if named != wanted: issues.append(issue("reflection-page", "Reflections", "practice/data/reflections/published.json", "The list of published Reflections is out of date. Run tools/build-reflections.py.", ("reflections", "daily-sutta")))
    queue = values.get("practice/data/reflections/queue.json")
    if isinstance(queue, dict): counts["reflections_queued"] = len(queue.get("passages", []))
    # Quotes and the Daily Sutta: what the schema cannot say.
    quotes = values.get("practice/data/quotes.json")
    if isinstance(quotes, dict) and isinstance(quotes.get("quotes"), list):
        counts["quotes"] = len(quotes["quotes"])
        for number, item in enumerate(quotes["quotes"], 1):
            if isinstance(item, dict) and isinstance(item.get("author"), str) and any(token.lower() in item["author"].lower() for token in FORBIDDEN): issues.append(issue("visible-copy-punctuation", "Visible copy", "practice/data/quotes.json", f"Quote {number} author contains forbidden punctuation.", ("quotes",)))
    daily = values.get("practice/data/daily-sutta.json")
    if isinstance(daily, dict) and isinstance(daily.get("entries"), list):
        ids = [item.get("id") for item in daily["entries"] if isinstance(item, dict)]
        for twice in sorted({i for i in ids if ids.count(i) > 1}): issues.append(issue("schema", "Daily Sutta", "practice/data/daily-sutta.json", f"The id {twice!r} is used twice.", ("daily-sutta",)))
        rotation = [item for item in daily["entries"] if isinstance(item, dict) and item.get("rotation") == "in_rotation"]
        counts["daily_suttas"] = len(daily["entries"]); counts["daily_suttas_in_rotation"] = len(rotation)
        for number, item in enumerate(daily["entries"], 1):
            if not isinstance(item, dict): continue
            if any(isinstance(item.get(field), str) and any(token.lower() in item[field].lower() for token in FORBIDDEN) for field in ("id", "title", "ref", "translator")): issues.append(issue("visible-copy-punctuation", "Visible copy", "practice/data/daily-sutta.json", f"Daily entry {number} contains forbidden punctuation outside verbatim text.", ("daily-sutta",)))
            if (item.get("origin") == "curator") != ("selection_id" in item): issues.append(issue("schema", "Daily Sutta", "practice/data/daily-sutta.json", f"Daily entry {number}: a Curator entry, and only a Curator entry, carries its selection_id.", ("daily-sutta",)))
    # Places: the pages must be what tools/build-places.py writes from the data.
    places = values.get("practice/data/places.json")
    if isinstance(places, dict) and not [p for p in issues if p["path"] == "practice/data/places.json"]:
        counts["places"] = sum(len(g.get("entries", [])) for g in places.get("groups", []))
        try:
            spec = importlib.util.spec_from_file_location("places_builder_for_validator", Path(__file__).resolve().parent / "build-places.py")
            builder = importlib.util.module_from_spec(spec); spec.loader.exec_module(builder)
            texts = {"en": (ROOT / "practice/places.html").read_text(encoding="utf-8"), "nl": (ROOT / "practice/places-nl.html").read_text(encoding="utf-8")}
            built = builder.build(places, texts)
            for lang, page in (("en", "practice/places.html"), ("nl", "practice/places-nl.html")):
                if built[lang] != texts[lang]: issues.append(issue("places-page", "Places & Community", page, "The page does not match practice/data/places.json. Run tools/build-places.py.", ("places",)))
        except SystemExit as exc: issues.append(issue("places-page", "Places & Community", "practice/places.html", str(exc), ("places",)))
        except Exception as exc: issues.append(issue("validator-runtime", "Places & Community", "tools/build-places.py", f"The Places check could not run: {exc}", ("places",)))
    manifest = read_json("practice/data/nl-mirrors.json", issues, "Language pairs"); pairs = manifest.get("pairs", []) if isinstance(manifest, dict) else []
    for number, pair in enumerate([*pairs, *GENERATED_PAIRS], 1):
        if number > len(pairs) and not (ROOT / pair["source"]).exists(): continue
        if number <= len(pairs) and (not isinstance(pair, dict) or set(pair) != {"source", "mirror", "synced_to"} or not re.fullmatch(r"[0-9a-f]{40}", str(pair.get("synced_to", "")))): issues.append(issue("language-manifest", "Language pairs", "practice/data/nl-mirrors.json", f"Pair {number} has an invalid schema.", ("language-pairs",))); continue
        # Every page in a language set must declare the whole set, including
        # itself, plus an x-default. Google treats a set without a
        # self-reference as incomplete and may ignore it. Checking the
        # reciprocal link alone let three of ten pages drift (September 2026).
        for page in (pair["source"], pair["mirror"]):
            parser = parsed_pages.get(page)
            for language, other in (("en", pair["source"]), ("nl", pair["mirror"]), ("x-default", pair["source"])):
                expected = page_url(other)
                links = [] if parser is None else [attrs.get("href") for tag, attrs in parser.attrs if tag == "link" and attrs.get("rel", "").lower() == "alternate" and attrs.get("hreflang", "").lower() == language]
                if links != [expected]: issues.append(issue("hreflang", "Language pairs", page, f"hreflang={language} must be declared exactly once and point to {expected}.", ("language-pairs",)))
    counts["language_pairs"] = len(pairs) + len(GENERATED_PAIRS)
    contracts = (
        ("reflections", "practice/reflections.html", ("<!-- BUILD:reflections -->", "js/notebook/room.js"), "The Reflection archive must carry its generated list and the room script."),
        ("reflections", "practice/index.html", ("js/render-daily-sutta.js", "js/notebook/hub.js"), "The Practice hub must load the daily renderer, which links to Reflections, and the hub script."),
        ("quotes", "practice/index.html", ("js/render-quotes.js",), "The Practice hub must load the quote renderer."),
        ("quotes", "practice/js/render-quotes.js", ("data/quotes.json",), "The quote renderer must read practice/data/quotes.json."),
        ("places", "practice/places.html", ("<!-- BUILD:places -->", "<!-- /BUILD:places -->", "<!-- BUILD:places-ld -->", "<!-- /BUILD:places-ld -->", "js/notebook/room.js"), "The Places page must carry its generated list, its structured data and the room script."),
        ("places", "practice/places-nl.html", ("<!-- BUILD:places -->", "<!-- /BUILD:places -->", "<!-- BUILD:places-ld -->", "<!-- /BUILD:places-ld -->", "js/notebook/room.js"), "The Dutch Places page must carry its generated list, its structured data and the room script."),
        ("reading", "practice/reading.html", ("data/reading.json", "js/notebook/render-room-data.js", "js/notebook/room.js"), "The Reading room must load its data and renderers."),
        ("talks", "practice/talks.html", ("data/talks.json", "js/notebook/render-room-data.js", "js/notebook/room.js"), "The Talks room must load its data and renderers."),
        # Old links to the retired Listening and Watching pages must still
        # reach Talks, with their anchor (redirect-talks.js) or without it.
        ("talks", "practice/listening.html", ('name="robots" content="noindex', 'http-equiv="refresh" content="0; url=talks.html"', "js/notebook/redirect-talks.js"), "Listening must stay a redirect to Talks that keeps the anchor."),
        ("talks", "practice/watching.html", ('name="robots" content="noindex', 'http-equiv="refresh" content="0; url=talks.html"', "js/notebook/redirect-talks.js"), "Watching must stay a redirect to Talks that keeps the anchor."),
        ("talks", "practice/js/notebook/redirect-talks.js", ("window.location.hash", "location.replace('talks.html'"), "The Talks redirect must carry the anchor on to talks.html."),
        ("daily-sutta", "practice/index.html", ("js/render-daily-sutta.js",), "The Practice hub must load the daily renderer."),
        ("photography", "photography/index.html", ("/photography/room-assets/room.css", "/photography/room-assets/room.js"), "The photography wall must load the room's stylesheet and script."),
    )
    for dependency, relative, markers, message in contracts:
        try: text = (ROOT / relative).read_text(encoding="utf-8")
        except OSError: continue
        if any(marker not in text for marker in markers): issues.append(issue("renderer-contract", dependency.replace("-", " ").title(), relative, message, (dependency,)))
    try: daily_renderer = (ROOT / "practice/js/render-daily-sutta.js").read_text(encoding="utf-8")
    except OSError: daily_renderer = ""
    if not all(marker in daily_renderer for marker in ("data/daily-sutta.json", "data/reflections/published.json", "'resting'", "normRef(s.ref) === todaysRef")): issues.append(issue("renderer-contract", "Daily Sutta", "practice/js/render-daily-sutta.js", "Daily-sutta Reflection matching is missing or incomplete.", ("daily-sutta", "reflections")))
    return counts


def validate():
    issues = []
    pages, parsed, versions = validate_pages(issues)
    counts = validate_data(issues, parsed)
    dependencies = []
    for item in DEPENDENCIES:
        record = {key: list(value) if isinstance(value, tuple) else value for key, value in item.items()}; record["missing"] = [path for path in record["sources"] + record["consumers"] if "*" not in path and not (ROOT / path.rstrip("/")).exists()]; dependencies.append(record)
        issues.extend(issue("dependency", record["label"], path, "Declared dependency path is missing.", (record["id"],)) for path in record["missing"])
    for finding in issues:
        if finding["dependencies"]: continue
        path = finding["path"]
        for declaration in DEPENDENCIES:
            for candidate in declaration["sources"] + declaration["consumers"]:
                if path == candidate or (candidate.endswith("/") and path.startswith(candidate)) or ("*" in candidate and PurePosixPath(path).match(candidate)):
                    finding["dependencies"].append(declaration["id"]); break
    issues.sort(key=lambda item: (item["area"].lower(), item["path"].lower(), item["code"], item["message"]))
    groups = defaultdict(list)
    for item in issues: groups[item["area"]].append(item)
    inventory = {"pages": len(pages), "data_files": len([p for folder in ("practice/data", "practice/data/reflections", "photography/data") for p in (ROOT / folder).glob("*") if p.suffix in {".json", ".md"} and not p.name.endswith(".schema.json")]), "renderers": len(list(ROOT.glob("**/js/render-*.js"))), "images": len([path for path in ROOT.glob("**/*") if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".avif"}]), "pdfs": len(list(ROOT.glob("**/*.pdf"))), "shared_assets": len(versions), **counts}
    return {"valid": not issues, "issues": issues, "groups": dict(groups), "inventory": inventory, "dependencies": dependencies}


def main():
    parser = argparse.ArgumentParser(); parser.add_argument("--json", action="store_true"); args = parser.parse_args(); report = validate()
    if args.json: print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        for area, items in report["groups"].items():
            print(f"[{area}]")
            for item in items: print(f"ERROR: {item['path']}: {item['message']}")
            print()
        if report["valid"]: print(json.dumps(report["inventory"], indent=2))
    return 0 if report["valid"] else 1


if __name__ == "__main__": sys.exit(main())
