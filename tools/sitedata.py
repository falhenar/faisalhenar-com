# -*- coding: utf-8 -*-
"""Shared readers and writers for the site's content files.

Since October 2026 the content of the Practice section lives in plain data
files that a tool can edit safely: JSON for the collections, one Markdown
file per published Reflection. This module is the one place that knows
their formats. The builders, tools/validate-site.py and the Website Manager
all import it from this repository, so the three can never disagree about
what a valid file is. The Website Manager never carries a copy.

  JSON         dump_json / write_json: two-space indent, UTF-8 as itself,
               LF, one trailing newline. Every data file is written this
               way, so a change shows up in git as the lines that changed.
  Reflections  parse_reflection / dump_reflection: details at the top,
               between two --- lines, one "key: <JSON value>" per line;
               FH's text below, kept exactly as written.
  Markdown     render_text: the three things the writing desk offers.
               *italic*, [a link](https://...), and a paragraph starting
               with "> " for a quotation. Paragraphs are separated by a
               blank line; a single line break stays inside its paragraph.
  Schemas      check: a small, strict subset of JSON Schema (see the
               docstring of check). Schemas sit next to the data they
               describe, named <file>.schema.json.

No dependencies beyond the standard library.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


# ---------- files ----------

def read_text(path):
    with open(path, encoding="utf-8", newline="") as handle:
        return handle.read()


def write_text(path, text):
    """Write with LF endings (the repository's rule, .gitattributes) via a
    temporary file, so a reader never sees half a file."""
    folder = os.path.dirname(path)
    if folder:
        os.makedirs(folder, exist_ok=True)
    temp = path + ".tmp-write"
    with open(temp, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)
    os.replace(temp, path)


def read_json(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def dump_json(value, indent=2):
    return json.dumps(value, ensure_ascii=False, indent=indent) + "\n"


def json_indent(path, default=2):
    """The indent an existing JSON file is written with. The photography
    files use one space, the Practice files two; each keeps its own, so a
    change never shows up as the whole file rewritten."""
    try:
        with open(path, encoding="utf-8") as handle:
            handle.readline()
            second = handle.readline()
    except OSError:
        return default
    spaces = len(second) - len(second.lstrip(" "))
    return spaces if spaces in (1, 2, 4) else default


def write_json(path, value, indent=None):
    write_text(path, dump_json(value, json_indent(path) if indent is None else indent))


def site_path(*parts, root=None):
    return os.path.join(root or ROOT, *parts)


# ---------- Reflections: one Markdown file each ----------

FENCE = "---"
# The order the details are written in. Keys not listed here are written
# after these, in the order they came.
REFLECTION_KEYS = ("id", "slug", "book", "part", "section", "label", "title", "ref",
                   "suttaTitle", "translator", "url", "sourceTitle", "sourceAuthor",
                   "sourceLocation", "sourceUrl", "excerpt", "added", "summary", "origin")


def parse_reflection(text):
    """(details, body). Raises ValueError with a plain message if the file
    does not have the shape dump_reflection writes."""
    if not text.startswith(FENCE + "\n"):
        raise ValueError("the file must start with a --- line")
    end = text.find("\n" + FENCE + "\n", len(FENCE))
    if end < 0:
        raise ValueError("the details at the top must end with a --- line")
    details = {}
    for number, line in enumerate(text[len(FENCE) + 1:end].split("\n"), 2):
        if not line.strip():
            continue
        match = re.fullmatch(r"([A-Za-z][A-Za-z0-9_]*): (.*)", line)
        if not match:
            raise ValueError("line %d of the details is not 'key: value'" % number)
        key, raw = match.groups()
        if key in details:
            raise ValueError("line %d repeats %r" % (number, key))
        try:
            details[key] = json.loads(raw)
        except ValueError:
            raise ValueError("line %d: the value of %r is not valid" % (number, key))
    return details, text[end + len(FENCE) + 2:]


def dump_reflection(details, body):
    keys = [k for k in REFLECTION_KEYS if k in details] + [k for k in details if k not in REFLECTION_KEYS]
    lines = [FENCE] + ["%s: %s" % (k, json.dumps(details[k], ensure_ascii=False)) for k in keys] + [FENCE]
    return "\n".join(lines) + "\n" + body


# ---------- the writing desk's Markdown ----------

ITALIC = re.compile(r"\*(?=\S|\s+\S)(.+?)\*", re.S)
LINK = re.compile(r"\[([^\]\n]+)\]\((https?://[^\s)]+|(?:\.\./|/)?[A-Za-z0-9_./#-]+)\)")


def escape(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _link(match):
    text, url = match.group(1), match.group(2).replace('"', "%22")
    # A link to another site opens in a new tab, as everywhere on the site.
    extra = ' target="_blank" rel="noopener"' if url.startswith(("http://", "https://")) else ""
    return '<a href="%s"%s>%s</a>' % (url, extra, text)


def render_inline(text):
    """One paragraph's text to HTML: escaped, then links, then italics."""
    out = LINK.sub(_link, escape(text))
    return ITALIC.sub(lambda m: "<em>%s</em>" % m.group(1), out)


def paragraphs(body):
    return [p.strip() for p in re.split(r"\n\s*\n", body) if p.strip()]


def render_text(body):
    """[(kind, html)] for each paragraph: kind is "p" or "quote"."""
    out = []
    for para in paragraphs(body):
        lines = para.split("\n")
        if all(line.startswith(">") for line in lines):
            inner = "\n".join(re.sub(r"^>\s?", "", line) for line in lines)
            out.append(("quote", render_inline(inner.strip())))
        else:
            out.append(("p", render_inline(para)))
    return out


def plain_text(body):
    """The body as plain words: no markup, one space between words."""
    text = re.sub(r"<[^>]+>", "", " ".join(html for _, html in render_text(body)))
    text = text.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
    return re.sub(r"\s+", " ", text).strip()


# ---------- schemas ----------

def schema_path(data_path):
    base = data_path[:-5] if data_path.endswith(".json") else data_path
    return base + ".schema.json"


def load_schema(path):
    return read_json(path)


_TYPES = {"object": dict, "array": list, "string": str, "boolean": bool, "null": type(None)}


def _is(value, kind):
    if kind == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if kind == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    return isinstance(value, _TYPES[kind])


def check(value, schema, where="", root=None):
    """Problems with value against schema, as plain sentences; [] if none.

    Supported: type (one or a list), enum, const, properties, required,
    additionalProperties (true, false or a schema), items, minItems,
    maxItems, uniqueItems, minLength, maxLength, pattern (searched, so
    anchor it), format "date" (YYYY-MM-DD) and "https", $defs with
    "$ref": "#/$defs/<name>", and oneOf. Anything else in a schema is
    ignored, so a description can sit anywhere.
    """
    root = root if root is not None else schema
    here = where or "the file"
    if "$ref" in schema:
        name = schema["$ref"].split("/")[-1]
        return check(value, root["$defs"][name], where, root)
    if "oneOf" in schema:
        results = [check(value, option, where, root) for option in schema["oneOf"]]
        if sum(1 for r in results if not r) != 1:
            best = min(results, key=len)
            return best or ["%s matches more than one allowed shape." % here]
        return []
    problems = []
    kinds = schema.get("type")
    if kinds:
        kinds = [kinds] if isinstance(kinds, str) else kinds
        if not any(_is(value, k) for k in kinds):
            return ["%s should be %s." % (here, " or ".join(kinds))]
    if "const" in schema and value != schema["const"]:
        problems.append("%s should be %s." % (here, json.dumps(schema["const"], ensure_ascii=False)))
    if "enum" in schema and value not in schema["enum"]:
        problems.append("%s should be one of %s." % (here, ", ".join(json.dumps(v, ensure_ascii=False) for v in schema["enum"])))
    if isinstance(value, str):
        if len(value) < schema.get("minLength", 0):
            problems.append("%s is empty or too short." % here)
        if "maxLength" in schema and len(value) > schema["maxLength"]:
            problems.append("%s is longer than %d characters." % (here, schema["maxLength"]))
        if "pattern" in schema and not re.search(schema["pattern"], value):
            problems.append("%s is not in the expected form." % here)
        fmt = schema.get("format")
        if fmt == "date":
            import datetime
            try:
                if datetime.date.fromisoformat(value).isoformat() != value:
                    raise ValueError
            except ValueError:
                problems.append("%s should be a date written YYYY-MM-DD." % here)
        elif fmt == "https" and not re.match(r"^https://[^\s/]+\.[^\s]+$", value):
            problems.append("%s should be an https:// link." % here)
    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            problems.append("%s needs at least %d item(s)." % (here, schema["minItems"]))
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            problems.append("%s has more than %d items." % (here, schema["maxItems"]))
        if schema.get("uniqueItems"):
            seen = []
            for item in value:
                if item in seen:
                    problems.append("%s lists %s twice." % (here, json.dumps(item, ensure_ascii=False)))
                    break
                seen.append(item)
        if "items" in schema:
            for number, item in enumerate(value, 1):
                problems.extend(check(item, schema["items"], "%s item %d" % (where or "item", number) if not where else "%s, item %d" % (where, number), root))
    if isinstance(value, dict):
        properties = schema.get("properties", {})
        for key in schema.get("required", []):
            if key not in value:
                problems.append("%s is missing %r." % (here, key))
        extra = schema.get("additionalProperties", True)
        for key, item in value.items():
            name = "%s %r" % (where, key) if where else repr(key)
            if key in properties:
                problems.extend(check(item, properties[key], name, root))
            elif extra is False:
                problems.append("%s has %r, which is not allowed." % (here, key))
            elif isinstance(extra, dict):
                problems.extend(check(item, extra, name, root))
    return problems


def check_file(data_path, value=None):
    """Problems with a data file against the schema beside it."""
    if value is None:
        value = read_json(data_path)
    return check(value, load_schema(schema_path(data_path)))
