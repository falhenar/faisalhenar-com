#!/usr/bin/env python3
"""Read-only whole-site validator used locally and by GitHub Actions."""

from __future__ import annotations

import argparse
from collections import defaultdict
from datetime import date
from html.parser import HTMLParser
import json
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
IDENTIFIER = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]*")
NUMBER = re.compile(r"-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?")
UNSAFE_KEYS = {"__proto__", "prototype", "constructor"}

DEPENDENCIES = (
    {"id": "reflections", "label": "Reflections", "sources": ("practice/js/suttas-config.js",), "consumers": ("practice/reflections.html", "practice/js/render-reflections.js", "practice/index.html", "practice/js/render-latest-reflection.js", "practice/js/daily-sutta-config.js", "practice/js/render-daily-sutta.js"), "effects": ("archive", "latest Reflection widget", "daily-sutta matching")},
    {"id": "quotes", "label": "Quotes", "sources": ("practice/js/quotes-config.js",), "consumers": ("practice/index.html", "practice/js/render-quotes.js"), "effects": ("Practice quote",)},
    {"id": "daily-sutta", "label": "Daily Sutta", "sources": ("practice/js/daily-sutta-config.js", "practice/js/suttas-config.js"), "consumers": ("practice/index.html", "practice/js/render-daily-sutta.js"), "effects": ("daily rotation", "matching published Reflection link")},
    {"id": "reading", "label": "Reading", "sources": ("practice/data/reading.json",), "consumers": ("practice/reading.html", "practice/js/render-reading.js"), "effects": ("Reading shelf",)},
    {"id": "listening", "label": "Listening", "sources": ("practice/data/listening.json",), "consumers": ("practice/listening.html", "practice/js/render-shelf.js"), "effects": ("Listening shelf",)},
    {"id": "watching", "label": "Watching", "sources": ("practice/data/watching.json",), "consumers": ("practice/watching.html", "practice/js/render-shelf.js"), "effects": ("Watching shelf",)},
    {"id": "photography", "label": "Photography", "sources": ("photography/data/photos.json", "photography/data/exhibition.json"), "consumers": ("photography/index.html", "photography/js/data-loader.js", "photography/js/render-exhibition.js", "photography/js/viewer.js", "photography/js/image-url.js", "photography/photos/"), "effects": ("Exhibition", "Index", "viewer", "image files")},
    {"id": "language-pairs", "label": "English and Dutch pages", "sources": ("practice/data/nl-mirrors.json",), "consumers": ("practice/*-nl.html", "practice/*.html"), "effects": ("reciprocal hreflang", "translation drift review")},
)


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
        elif tag in {"script", "style", "template"}: self.hidden += 1
        for key in ("alt", "title", "aria-label", "content"):
            if values.get(key): self.visible.append(values[key])

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "script" and self.ld:
            self.ld -= 1; self.json_ld.append("".join(self.ld_parts)); self.ld_parts = []
        elif tag in {"script", "style", "template"} and self.hidden: self.hidden -= 1

    def handle_data(self, data):
        if self.ld: self.ld_parts.append(data)
        elif not self.hidden and data.strip(): self.visible.append(data)


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


def javascript_strings(text):
    """Yield string literal text while skipping JavaScript comments."""
    at = 0
    while at < len(text):
        if text.startswith("//", at):
            end = text.find("\n", at + 2); at = len(text) if end < 0 else end + 1; continue
        if text.startswith("/*", at):
            end = text.find("*/", at + 2); at = len(text) if end < 0 else end + 2; continue
        if text[at] not in "'\"`": at += 1; continue
        quote = text[at]; at += 1; output = []; escaped = False
        while at < len(text):
            char = text[at]; at += 1
            if escaped: output.append(char); escaped = False
            elif char == "\\": escaped = True
            elif char == quote: break
            else: output.append(char)
        yield "".join(output)


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
    sources = {"practice/reading.html": ("practice/data/reading.json", "books"), "practice/listening.html": ("practice/data/listening.json", "items"), "practice/watching.html": ("practice/data/watching.json", "items")}
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
    pages = sorted({path.relative_to(ROOT).as_posix() for folder in (ROOT, ROOT / "practice", ROOT / "photography") for path in folder.glob("*.html")})
    parsed, versions = {}, defaultdict(set)
    for relative in pages:
        try: text = (ROOT / relative).read_text(encoding="utf-8")
        except Exception as exc: issues.append(issue("unreadable-file", "Pages", relative, str(exc))); continue
        parser = Page(); parser.feed(text); parser.close(); parsed[relative] = parser
        expected = page_url(relative); special = relative == "404.html"
        canonical = [attrs.get("href") for tag, attrs in parser.attrs if tag == "link" and attrs.get("rel", "").lower() == "canonical"]
        if not special and canonical != [expected]: issues.append(issue("canonical", "Metadata", relative, f"Canonical URL must be exactly {expected}."))
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
        expected = {page_url(page) for page in pages if page != "404.html"}
        for url in sorted(expected - actual): issues.append(issue("sitemap", "Sitemap", "sitemap.xml", f"Missing public page: {url}."))
        for url in sorted(actual - expected): issues.append(issue("sitemap", "Sitemap", "sitemap.xml", f"Unknown public page: {url}."))
    except Exception as exc: issues.append(issue("sitemap", "Sitemap", "sitemap.xml", str(exc)))
    return pages, parsed, versions


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
    for shelf, key in (("reading", "books"), ("listening", "items"), ("watching", "items")):
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
        page = (ROOT / f"practice/{shelf}.html").read_text(encoding="utf-8"); renderer_path = "practice/js/render-reading.js" if shelf == "reading" else "practice/js/render-shelf.js"; renderer = (ROOT / renderer_path).read_text(encoding="utf-8")
        missing = [collection["id"] for collection in data["collections"] if f'data-{("reading" if shelf == "reading" else "shelf")}-list="{collection["id"]}"' not in page]
        dynamic = shelf == "reading" and 'data-reading-teachings' in page and 'function readingTarget(collection)' in renderer
        if missing and not dynamic: issues.append(issue("renderer-contract", shelf.title(), renderer_path, "Collections have no render target: " + ", ".join(missing) + ".", (shelf,)))
    configs = (("QUOTES", "practice/js/quotes-config.js", "Quotes"), ("DAILY_SUTTAS", "practice/js/daily-sutta-config.js", "Daily Sutta"), ("BOOKS", "practice/js/suttas-config.js", "Reflections"), ("SUTTAS", "practice/js/suttas-config.js", "Reflections"))
    values = {}
    for name, relative, area in configs:
        try: values[name] = declaration((ROOT / relative).read_text(encoding="utf-8"), name)
        except Exception as exc: issues.append(issue("javascript-data", area, relative, str(exc), ("reflections" if name in {"BOOKS", "SUTTAS"} else "daily-sutta" if name == "DAILY_SUTTAS" else "quotes",)))
    if isinstance(values.get("QUOTES"), list): counts["quotes"] = len(values["QUOTES"])
    if isinstance(values.get("DAILY_SUTTAS"), list): counts["daily_suttas"] = len(values["DAILY_SUTTAS"])
    if isinstance(values.get("SUTTAS"), list): counts["reflections"] = len(values["SUTTAS"])
    books = values.get("BOOKS", {}); reflection_ids = set()
    if not isinstance(books, dict): issues.append(issue("reflection-schema", "Reflections", "practice/js/suttas-config.js", "BOOKS must be an object.", ("reflections",)))
    else:
        for section_id, section in books.items():
            if not ID.fullmatch(section_id) or not isinstance(section, dict) or set(section) != {"title", "note", "order"} or section.get("order") not in {"structural", "chronological"} or not isinstance(section.get("title"), str) or not section["title"].strip(): issues.append(issue("reflection-schema", "Reflections", "practice/js/suttas-config.js", f"Section {section_id!r} has an invalid schema.", ("reflections",)))
    for number, item in enumerate(values.get("SUTTAS", []) if isinstance(values.get("SUTTAS"), list) else [], 1):
        if not isinstance(item, dict) or not all(key in item for key in ("id", "book", "title", "note", "added")): issues.append(issue("reflection-schema", "Reflections", "practice/js/suttas-config.js", f"Reflection {number} has an invalid schema.", ("reflections",))); continue
        if item["id"] in reflection_ids or item["book"] not in books: issues.append(issue("reflection-schema", "Reflections", "practice/js/suttas-config.js", f"Reflection {number} has a duplicate id or unknown section.", ("reflections",)))
        reflection_ids.add(item["id"])
        for field, value in item.items():
                if field != "excerpt" and isinstance(value, str) and any(token.lower() in value.lower() for token in FORBIDDEN): issues.append(issue("visible-copy-punctuation", "Visible copy", "practice/js/suttas-config.js", f"Reflection {number} field {field} contains forbidden punctuation.", ("reflections",))); break
    quotes = values.get("QUOTES")
    if not isinstance(quotes, list): issues.append(issue("javascript-data", "Quotes", "practice/js/quotes-config.js", "QUOTES must be an array.", ("quotes",)))
    else:
        for number, item in enumerate(quotes, 1):
            if not isinstance(item, dict) or not {"text", "author", "source", "themes"}.issubset(item) or not all(isinstance(item.get(field), str) and item[field].strip() for field in ("text", "author", "source")) or not isinstance(item.get("themes"), list) or not all(isinstance(theme, str) and theme for theme in item.get("themes", [])): issues.append(issue("javascript-data", "Quotes", "practice/js/quotes-config.js", f"Quote {number} has an invalid schema.", ("quotes",)))
            elif any(token.lower() in item["author"].lower() for token in FORBIDDEN): issues.append(issue("visible-copy-punctuation", "Visible copy", "practice/js/quotes-config.js", f"Quote {number} author contains forbidden punctuation.", ("quotes",)))
    daily = values.get("DAILY_SUTTAS"); daily_refs, daily_ids = set(), set()
    if not isinstance(daily, list): issues.append(issue("javascript-data", "Daily Sutta", "practice/js/daily-sutta-config.js", "DAILY_SUTTAS must be an array.", ("daily-sutta",)))
    else:
        for number, item in enumerate(daily, 1):
            valid = isinstance(item, dict) and set(item) == {"id", "title", "ref", "translator", "url", "text"} and all(isinstance(item.get(field), str) and item[field].strip() for field in ("id", "title", "ref", "translator", "url", "text")) and re.fullmatch(r"[a-z0-9]+(?:[.-][a-z0-9]+)*", item["id"]) and item["id"] not in daily_ids
            parsed = urlsplit(item.get("url", "")) if isinstance(item, dict) else None
            if not valid or parsed.scheme != "https" or parsed.hostname != "suttacentral.net" or item["ref"] in daily_refs: issues.append(issue("javascript-data", "Daily Sutta", "practice/js/daily-sutta-config.js", f"Daily entry {number} has an invalid schema, URL, or duplicate ref.", ("daily-sutta",)))
            else:
                daily_refs.add(item["ref"]); daily_ids.add(item["id"])
                if any(any(token.lower() in item[field].lower() for token in FORBIDDEN) for field in ("id", "title", "ref", "translator")): issues.append(issue("visible-copy-punctuation", "Visible copy", "practice/js/daily-sutta-config.js", f"Daily entry {number} contains forbidden punctuation outside verbatim text.", ("daily-sutta",)))
    manifest = read_json("practice/data/nl-mirrors.json", issues, "Language pairs"); pairs = manifest.get("pairs", []) if isinstance(manifest, dict) else []
    for number, pair in enumerate(pairs, 1):
        if not isinstance(pair, dict) or set(pair) != {"source", "mirror", "synced_to"} or not re.fullmatch(r"[0-9a-f]{40}", str(pair.get("synced_to", ""))): issues.append(issue("language-manifest", "Language pairs", "practice/data/nl-mirrors.json", f"Pair {number} has an invalid schema.", ("language-pairs",))); continue
        for page, language, other in ((pair["source"], "nl", pair["mirror"]), (pair["mirror"], "en", pair["source"])):
            parser = parsed_pages.get(page); expected = page_url(other)
            links = [] if parser is None else [attrs.get("href") for tag, attrs in parser.attrs if tag == "link" and attrs.get("rel", "").lower() == "alternate" and attrs.get("hreflang", "").lower() == language]
            if links != [expected]: issues.append(issue("hreflang", "Language pairs", page, f"Reciprocal hreflang={language} must point to {expected}.", ("language-pairs",)))
    counts["language_pairs"] = len(pairs)
    contracts = (
        ("reflections", "practice/reflections.html", ("js/suttas-config.js", "js/render-reflections.js"), "The Reflection archive must load its data and renderer."),
        ("reflections", "practice/index.html", ("js/suttas-config.js", "js/render-latest-reflection.js"), "The Practice hub must load Reflection data and the latest-Reflection renderer."),
        ("daily-sutta", "practice/index.html", ("js/daily-sutta-config.js", "js/suttas-config.js", "js/render-daily-sutta.js"), "The Practice hub must load daily data, Reflection data, and the daily renderer."),
        ("photography", "photography/index.html", ("js/data-loader.js", "js/image-url.js", "js/viewer.js", "js/render-exhibition.js"), "Photography must load its data, image URL helper, viewer, and Exhibition/Index renderer."),
    )
    for dependency, relative, markers, message in contracts:
        try: text = (ROOT / relative).read_text(encoding="utf-8")
        except OSError: continue
        if any(marker not in text for marker in markers): issues.append(issue("renderer-contract", dependency.replace("-", " ").title(), relative, message, (dependency,)))
    try: daily_renderer = (ROOT / "practice/js/render-daily-sutta.js").read_text(encoding="utf-8")
    except OSError: daily_renderer = ""
    if not all(marker in daily_renderer for marker in ("DAILY_SUTTAS", "SUTTAS", "normRef(s.ref) === todaysRef")): issues.append(issue("renderer-contract", "Daily Sutta", "practice/js/render-daily-sutta.js", "Daily-sutta Reflection matching is missing or incomplete.", ("daily-sutta", "reflections")))
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
    inventory = {"pages": len(pages), "data_files": len(list((ROOT / "practice/data").glob("*.json"))) + len(list((ROOT / "photography/data").glob("*.json"))), "renderers": len(list(ROOT.glob("**/js/render-*.js"))), "images": len([path for path in ROOT.glob("**/*") if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".avif"}]), "pdfs": len(list(ROOT.glob("**/*.pdf"))), "shared_assets": len(versions), **counts}
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
