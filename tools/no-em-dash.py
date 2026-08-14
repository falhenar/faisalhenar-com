#!/usr/bin/env python3
"""
no-em-dash.py — keep em dashes out of the visible copy on faisalhenar.com.

WHAT IT LOOKS AT
  Only text a visitor (or a search engine) can actually read:
    * HTML  the text between tags, plus the attributes that render or get
            indexed: <title>, meta content, alt, title, aria-label,
            placeholder.
    * JS    string literals in the content config files and the renderers.
  It ignores code, CSS, HTML comments, <script> and <style> blocks, and JS
  comments. An em dash in a comment hurts nobody.

WHAT IT LEAVES ALONE
  Verbatim quotation. A line from a book or a sutta translation is not your
  copy, and silently repunctuating it would be misquoting. The exempt fields
  are listed in QUOTE_FIELDS below.

  Any single line can also be exempted by putting the marker
  `no-em-dash: allow` in a comment on that line.

USAGE
  python3 tools/no-em-dash.py          report findings, exit 1 if any
  python3 tools/no-em-dash.py --fix    repair what can be repaired safely,
                                       then report anything left over
"""

import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

INCLUDE_GLOBS = ["**/*.html", "**/*.js"]

SKIP_DIRS = {".git", ".github", "fonts", "images", "tools", "node_modules"}

# Fields holding verbatim quotation. Punctuation there belongs to the source,
# not to you. Paths are relative to the repo root.
QUOTE_FIELDS = {
    "practice/js/quotes-config.js": {"text", "source"},
    "practice/js/daily-sutta-config.js": {"text"},
    "practice/js/suttas-config.js": {"excerpt"},
}

# Attribute values a visitor or a search engine reads.
VISIBLE_ATTRS = {"content", "alt", "title", "aria-label", "placeholder"}

ALLOW_MARKER = "no-em-dash: allow"

# The character, the horizontal bar, and the three HTML spellings.
EM_CHARS = "—―"
EM_RE = re.compile(f"[{EM_CHARS}]")
ENTITY_RE = re.compile(r"&(?:mdash|#8212|#[xX]2014);")
HIT_RE = re.compile(f"[{EM_CHARS}]|&(?:mdash|#8212|#[xX]2014);")

CLOSERS = ",;:.!?"

# Page titles on this site are separated by a middle dot, not a dash
# ("Reading · Practice · Faisal Henar"). A dash in <title>, og:title or
# twitter:title becomes that separator rather than a comma.
TITLE_SEPARATOR = " · "
TITLE_ATTRS = ("og:title", "twitter:title", 'name="title"', "name='title'")

# ---------------------------------------------------------------------------
# Region extraction
# ---------------------------------------------------------------------------

HTML_BLIND = re.compile(
    r"<!--.*?-->|<script\b[^>]*>.*?</script\s*>|<style\b[^>]*>.*?</style\s*>",
    re.S | re.I,
)
JS_BLIND = re.compile(r"/\*.*?\*/|//[^\n]*", re.S)
ATTR_RE = re.compile(r"""([\w:-]+)\s*=\s*(["'])(.*?)\2""", re.S)
TAG_RE = re.compile(r"<[^>]*>", re.S)
JS_STRING_RE = re.compile(r"""(["'`])((?:\\.|(?!\1)[^\\])*)\1""", re.S)
JS_KEY_RE = re.compile(r"""([A-Za-z_$][\w$]*)\s*:\s*$""")


def _blank(text, pattern):
    """Blank out comments and code blocks, keeping every offset and line
    number intact. Returns (masked_text, blanked_spans)."""
    out = list(text)
    spans = []
    for m in pattern.finditer(text):
        spans.append((m.start(), m.end()))
        for i in range(m.start(), m.end()):
            if out[i] != "\n":
                out[i] = " "
    return "".join(out), spans


def _subtract(start, end, blind):
    """Yield the parts of [start, end) that do not sit inside a blanked span.
    Regions are found in the masked text but read from the original, so the
    blanked parts have to be cut out or comment text comes back to life."""
    pieces = [(start, end)]
    for b_start, b_end in blind:
        nxt = []
        for p_start, p_end in pieces:
            if b_end <= p_start or b_start >= p_end:
                nxt.append((p_start, p_end))
                continue
            if p_start < b_start:
                nxt.append((p_start, b_start))
            if b_end < p_end:
                nxt.append((b_end, p_end))
        pieces = nxt
    for p_start, p_end in pieces:
        if p_end > p_start:
            yield p_start, p_end


def _enclosing_tag(masked, index):
    start = masked.rfind("<", 0, index)
    end = masked.find(">", index)
    return masked[start:end] if start != -1 and end != -1 else ""


def html_regions(text):
    masked, blind = _blank(text, HTML_BLIND)

    def emit(start, end, label):
        for s, e in _subtract(start, end, blind):
            yield s, e, label

    for m in ATTR_RE.finditer(masked):
        if m.group(1).lower() not in VISIBLE_ATTRS:
            continue
        tag = _enclosing_tag(masked, m.start()).lower()
        is_title = any(marker in tag for marker in TITLE_ATTRS)
        label = "page title" if is_title else f"{m.group(1)} attribute"
        yield from emit(m.start(3), m.end(3), label)

    pos, opener = 0, ""
    for tag in TAG_RE.finditer(masked):
        if tag.start() > pos:
            label = "page title" if opener.startswith("<title") else "text"
            yield from emit(pos, tag.start(), label)
        opener = tag.group(0).lower()
        pos = tag.end()
    if pos < len(masked):
        yield from emit(pos, len(masked), "text")


def js_regions(text, rel):
    exempt = QUOTE_FIELDS.get(rel, set())
    masked, blind = _blank(text, JS_BLIND)
    for m in JS_STRING_RE.finditer(masked):
        key_match = JS_KEY_RE.search(masked[max(0, m.start() - 40): m.start()])
        key = key_match.group(1) if key_match else None
        if key in exempt:
            continue
        label = f"{key} field" if key else "string"
        for s, e in _subtract(m.start(2), m.end(2), blind):
            yield s, e, label


# ---------------------------------------------------------------------------
# Repair
# ---------------------------------------------------------------------------

def _is_fixable(segment, start, end):
    """A dash with real text on both sides can become a comma. One that opens
    or closes the segment has no obvious replacement."""
    return bool(segment[:start].strip()) and bool(segment[end:].strip())


def _repair(segment, label="text"):
    """Repunctuate one region. Returns (new_segment, unresolved_count).

    In a page title the dash becomes the site's middle-dot separator.
    Elsewhere it becomes a comma, which is what a copy editor does most of
    the time. A dash that opens or closes the text has no obvious
    replacement, so it is left alone and reported instead."""
    segment = ENTITY_RE.sub("—", segment)
    out, cursor, unresolved = [], 0, 0

    for m in EM_RE.finditer(segment):
        if m.start() < cursor:
            continue
        if not _is_fixable(segment, m.start(), m.end()):
            unresolved += 1
            continue

        before = segment[cursor:m.start()]
        trailing_ws = before[len(before.rstrip()):]
        content = before[:len(before) - len(trailing_ws)]
        out.append(content)

        if label == "page title":
            out.append(TITLE_SEPARATOR)
            cursor = m.end()
            while cursor < len(segment) and segment[cursor] in " \t":
                cursor += 1
            continue

        if content and content[-1] not in CLOSERS:
            out.append(",")
        out.append(trailing_ws if "\n" in trailing_ws else " ")

        cursor = m.end()
        while cursor < len(segment) and segment[cursor] in " \t":
            cursor += 1

    out.append(segment[cursor:])
    return "".join(out), unresolved


# ---------------------------------------------------------------------------
# Scanning
# ---------------------------------------------------------------------------

class Finding:
    def __init__(self, path, line, label, excerpt, fixable):
        self.path, self.line, self.label = path, line, label
        self.excerpt, self.fixable = excerpt, fixable


def _line_of(text, index):
    return text.count("\n", 0, index) + 1


def _context(text, index, width=52):
    start = max(0, index - width)
    end = min(len(text), index + width)
    snippet = re.sub(r"\s+", " ", text[start:end]).strip()
    return ("…" if start else "") + snippet + ("…" if end < len(text) else "")


def _line_allows(text, index):
    start = text.rfind("\n", 0, index) + 1
    end = text.find("\n", index)
    return ALLOW_MARKER in (text[start:] if end == -1 else text[start:end])


def scan_file(path, fix):
    rel = path.relative_to(ROOT).as_posix()
    original = path.read_text(encoding="utf-8")
    text = original
    regions = list(html_regions(text) if path.suffix == ".html"
                   else js_regions(text, rel))

    findings, edits = [], []
    for start, end, label in regions:
        segment = text[start:end]
        hits = [h for h in HIT_RE.finditer(segment)
                if not _line_allows(text, start + h.start())]
        if not hits:
            continue

        for h in hits:
            findings.append(Finding(
                rel,
                _line_of(text, start + h.start()),
                label,
                _context(text, start + h.start()),
                _is_fixable(segment, h.start(), h.end()),
            ))

        if fix:
            repaired, _ = _repair(segment, label)
            if repaired != segment:
                edits.append((start, end, repaired))

    changed = False
    if fix and edits:
        for start, end, repaired in sorted(edits, reverse=True):
            text = text[:start] + repaired + text[end:]
        if text != original:
            path.write_text(text, encoding="utf-8")
            changed = True
            findings = [f for f in findings if not f.fixable]

    return findings, changed


def iter_files():
    for pattern in INCLUDE_GLOBS:
        for path in sorted(ROOT.glob(pattern)):
            parts = path.relative_to(ROOT).parts[:-1]
            if any(part in SKIP_DIRS for part in parts):
                continue
            yield path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fix", action="store_true",
                        help="repair what can be repaired safely")
    args = parser.parse_args()

    findings, changed = [], []
    for path in iter_files():
        found, was_changed = scan_file(path, args.fix)
        findings.extend(found)
        if was_changed:
            changed.append(path.relative_to(ROOT).as_posix())

    if changed:
        print("Repaired:")
        for name in changed:
            print(f"  {name}")
        print()

    if not findings:
        print("No em dashes in visible copy.")
        return 0

    print("Em dashes in visible copy:\n")
    for f in sorted(findings, key=lambda f: (f.path, f.line)):
        note = "" if f.fixable else "   (no safe automatic replacement)"
        print(f"  {f.path}:{f.line}  [{f.label}]{note}")
        print(f"      {f.excerpt}\n")
    print(f"{len(findings)} left to deal with by hand.")
    print(f"If a line is verbatim quotation, add `{ALLOW_MARKER}` in a comment")
    print("on that line, or add its field to QUOTE_FIELDS in this script.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
