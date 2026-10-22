import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "validate-site.py"
SPEC = importlib.util.spec_from_file_location("website_validator", SCRIPT)
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)


class WebsiteValidatorTests(unittest.TestCase):
    def test_current_site_is_valid_and_validation_is_read_only(self):
        before = {
            path.relative_to(validator.ROOT).as_posix(): (path.stat().st_size, path.stat().st_mtime_ns)
            for path in validator.ROOT.rglob("*") if path.is_file()
        }
        report = validator.validate()
        after = {
            path.relative_to(validator.ROOT).as_posix(): (path.stat().st_size, path.stat().st_mtime_ns)
            for path in validator.ROOT.rglob("*") if path.is_file()
        }
        self.assertTrue(report["valid"], report["issues"])
        self.assertEqual(before, after)

    def test_malformed_json_is_reported_not_raised(self):
        original = validator.ROOT
        with tempfile.TemporaryDirectory() as temporary:
            validator.ROOT = Path(temporary)
            (validator.ROOT / "broken.json").write_text("{not valid json", encoding="utf-8")
            issues = []
            try:
                result = validator.read_json("broken.json", issues, "Test")
            finally:
                validator.ROOT = original
        self.assertIsNone(result)
        self.assertEqual(issues[0]["code"], "malformed-json")

    def test_local_path_cannot_leave_site_root(self):
        original = validator.ROOT
        with tempfile.TemporaryDirectory() as temporary:
            validator.ROOT = Path(temporary)
            try:
                target = validator.local_target("index.html", "../private.txt")
            finally:
                validator.ROOT = original
        self.assertEqual(target[1], "outside")

    def _hreflang_issues(self, source_html, mirror_html):
        """Run the language-pair checks over a throwaway pair of pages."""
        original = validator.ROOT
        with tempfile.TemporaryDirectory() as temporary:
            validator.ROOT = Path(temporary)
            practice = validator.ROOT / "practice"
            (practice / "data").mkdir(parents=True)
            (practice / "foo.html").write_text(source_html, encoding="utf-8")
            (practice / "foo-nl.html").write_text(mirror_html, encoding="utf-8")
            (practice / "data" / "nl-mirrors.json").write_text(
                json.dumps({"pairs": [{"source": "practice/foo.html", "mirror": "practice/foo-nl.html", "synced_to": "0" * 40}]}),
                encoding="utf-8",
            )
            parsed_pages = {}
            for name in ("practice/foo.html", "practice/foo-nl.html"):
                page = validator.Page()
                page.feed((validator.ROOT / name).read_text(encoding="utf-8"))
                page.close()
                parsed_pages[name] = page
            try:
                issues = []
                validator.validate_data(issues, parsed_pages)
            finally:
                validator.ROOT = original
        return [item for item in issues if item["code"] == "hreflang"]

    COMPLETE_SET = (
        '<link rel="alternate" hreflang="en" href="https://faisalhenar.com/practice/foo.html">'
        '<link rel="alternate" hreflang="nl" href="https://faisalhenar.com/practice/foo-nl.html">'
        '<link rel="alternate" hreflang="x-default" href="https://faisalhenar.com/practice/foo.html">'
    )

    def test_complete_language_set_passes(self):
        self.assertEqual(self._hreflang_issues(self.COMPLETE_SET, self.COMPLETE_SET), [])

    def test_missing_reciprocal_hreflang_is_enforced(self):
        source_html = '<link rel="alternate" hreflang="nl" href="https://faisalhenar.com/practice/foo-nl.html">'
        mirror_html = "<p>no hreflang back to the English page</p>"
        paths = [item["path"] for item in self._hreflang_issues(source_html, mirror_html)]
        self.assertIn("practice/foo-nl.html", paths)

    def test_missing_self_reference_and_x_default_are_enforced(self):
        """The September 2026 regression: both pages linked each other, but
        neither declared itself and no page declared x-default, which leaves
        the set incomplete as far as Google is concerned."""
        source_html = '<link rel="alternate" hreflang="nl" href="https://faisalhenar.com/practice/foo-nl.html">'
        mirror_html = '<link rel="alternate" hreflang="en" href="https://faisalhenar.com/practice/foo.html">'
        issues = self._hreflang_issues(source_html, mirror_html)
        languages = {item["message"].split("=")[1].split(" ")[0] for item in issues}
        self.assertEqual(languages, {"en", "nl", "x-default"})
        self.assertEqual({item["path"] for item in issues}, {"practice/foo.html", "practice/foo-nl.html"})

    def test_required_dependency_relationships_are_declared(self):
        declarations = {item["id"]: item for item in validator.DEPENDENCIES}
        self.assertLessEqual({"archive", "latest Reflection line", "daily-sutta matching"}, set(declarations["reflections"]["effects"]))
        self.assertLessEqual({"wall", "contact sheets", "Everything", "photograph pages", "image files"}, set(declarations["photography"]["effects"]))
        self.assertIn("Reading room", declarations["reading"]["effects"])
        self.assertIn("Talks room", declarations["talks"]["effects"])
        self.assertIn("structured data", declarations["places"]["effects"])

    def test_every_data_file_has_a_schema_beside_it(self):
        for relative, _area, _dependency in validator.SCHEMA_FILES:
            with self.subTest(relative=relative):
                self.assertTrue((validator.ROOT / relative.replace(".json", ".schema.json")).is_file())



class NoindexSitemapTests(unittest.TestCase):
    """A page we ask search engines to skip is not expected in the sitemap.

    The sitemap is the list we ask them to read, so listing a page there while
    telling them not to index it is a contradiction. Today the only such page
    is the redirect left behind when a Reflection is withdrawn.
    """

    def noindex_pages(self, markup):
        parser = validator.Page()
        parser.feed(markup)
        parser.close()
        return any(tag == "meta" and attrs.get("name", "").lower() == "robots"
                   and "noindex" in attrs.get("content", "").lower()
                   for tag, attrs in parser.attrs)

    def test_a_noindex_page_is_recognised(self):
        self.assertTrue(self.noindex_pages('<meta name="robots" content="noindex, follow">'))
        self.assertTrue(self.noindex_pages('<meta name="ROBOTS" content="NOINDEX">'))

    def test_an_ordinary_page_is_not(self):
        self.assertFalse(self.noindex_pages('<meta name="description" content="A page.">'))
        self.assertFalse(self.noindex_pages('<meta name="robots" content="follow">'))


class UnlistedSitemapTests(unittest.TestCase):
    """Photograph pages are public and indexable but left out of the sitemap.

    The exception is meant to be narrow: only pages under photography/p/,
    never the contact sheets or any other page.
    """

    def unlisted(self, page):
        return page.startswith(validator.UNLISTED_PREFIXES)

    def test_a_photograph_page_is_unlisted(self):
        self.assertTrue(self.unlisted("photography/p/fh-0010/index.html"))

    def test_other_pages_are_not(self):
        for page in ("practice/meditation.html", "photography/sheets/between-walks-2026-06/index.html",
                     "photography/index.html", "photography/everything/index.html", "index.html"):
            with self.subTest(page=page):
                self.assertFalse(self.unlisted(page))


class BaseStylesheetTests(unittest.TestCase):
    """Every page loads css/base.css, and loads it first.

    The shared chrome lives in one file now. A page that misses it renders
    the menu, the skip link and the reset unstyled, and a page that loads
    it after its section stylesheet lets the shared rules win where the
    section's should. Both are easy to ship on a page nobody happened to
    open, so neither is left to the eye.
    """

    def issues_for(self, markup):
        original = validator.ROOT
        with tempfile.TemporaryDirectory() as temporary:
            validator.ROOT = Path(temporary)
            (validator.ROOT / "page.html").write_text(markup, encoding="utf-8")
            try:
                found = []
                parser = validator.Page()
                parser.feed(markup)
                parser.close()
                # exercise only the base-stylesheet rule, on its own
                sheets = [a.get("href", "") for t, a in parser.attrs
                          if t == "link" and a.get("rel", "").lower() == "stylesheet"]
                import re as _re
                base_at = next((i for i, h in enumerate(sheets) if "css/base.css" in h), None)
                section_at = next((i for i, h in enumerate(sheets)
                                   if _re.search(r"css/(?:hub|practice|style)\.css", h)), None)
                if base_at is None:
                    found.append("missing")
                elif section_at is not None and base_at > section_at:
                    found.append("order")
                return found
            finally:
                validator.ROOT = original

    def test_a_page_without_the_base_stylesheet_is_caught(self):
        self.assertEqual(self.issues_for(
            '<link rel="stylesheet" href="css/practice.css?v=1">'), ["missing"])

    def test_a_page_loading_it_last_is_caught(self):
        self.assertEqual(self.issues_for(
            '<link rel="stylesheet" href="css/practice.css?v=1">'
            '<link rel="stylesheet" href="/css/base.css?v=1">'), ["order"])

    def test_the_right_order_passes(self):
        self.assertEqual(self.issues_for(
            '<link rel="stylesheet" href="/css/base.css?v=1">'
            '<link rel="stylesheet" href="css/practice.css?v=1">'), [])


class TalksRedirectTests(unittest.TestCase):
    """Listening and Watching are gone as rooms; their addresses must still reach Talks."""

    REDIRECT = ('<meta name="robots" content="noindex, follow">'
                '<meta http-equiv="refresh" content="0; url=talks.html">'
                '<script src="js/notebook/redirect-talks.js?v=1"></script>')
    SCRIPT = "var hash = window.location.hash.slice(1); window.location.replace('talks.html' + (hash ? '#' + hash : ''));"

    def issues(self, listening, watching, script):
        original = validator.ROOT
        with tempfile.TemporaryDirectory() as temporary:
            validator.ROOT = Path(temporary)
            (validator.ROOT / "practice" / "js" / "notebook").mkdir(parents=True)
            (validator.ROOT / "practice" / "listening.html").write_text(listening, encoding="utf-8")
            (validator.ROOT / "practice" / "watching.html").write_text(watching, encoding="utf-8")
            (validator.ROOT / "practice" / "js" / "notebook" / "redirect-talks.js").write_text(script, encoding="utf-8")
            issues = []
            try:
                validator.validate_data(issues, {})
            finally:
                validator.ROOT = original
        names = {"practice/listening.html", "practice/watching.html", "practice/js/notebook/redirect-talks.js"}
        return sorted(item["path"] for item in issues if item["path"] in names)

    def test_both_redirects_pass(self):
        self.assertEqual(self.issues(self.REDIRECT, self.REDIRECT, self.SCRIPT), [])

    def test_a_page_that_stops_redirecting_or_drops_the_anchor_is_reported(self):
        no_script = self.REDIRECT.replace("js/notebook/redirect-talks.js", "js/other.js")
        self.assertEqual(self.issues("<p>Listening is back</p>", no_script, self.SCRIPT),
                         ["practice/listening.html", "practice/watching.html"])
        self.assertEqual(self.issues(self.REDIRECT, self.REDIRECT, "window.location.replace('talks.html');"),
                         ["practice/js/notebook/redirect-talks.js"])

    def test_anchors_on_the_old_pages_are_checked_against_talks(self):
        original = validator.ROOT
        with tempfile.TemporaryDirectory() as temporary:
            validator.ROOT = Path(temporary)
            (validator.ROOT / "practice" / "data").mkdir(parents=True)
            (validator.ROOT / "practice" / "data" / "talks.json").write_text(json.dumps(
                {"sections": [{"id": "teachers", "items": [{"id": "ajahn-brahm", "aliases": ["listen-ajahn-brahm"]}]}]}), encoding="utf-8")
            try:
                ids = validator.rendered_ids("practice/listening.html")
            finally:
                validator.ROOT = original
        self.assertEqual(ids, {"teachers", "ajahn-brahm", "listen-ajahn-brahm"})


class ReflectionPageStateTests(unittest.TestCase):
    """Listed, unlisted and no-longer-published Reflection pages stay distinct."""

    ARTICLE = "<p>The article.</p>"
    NOINDEX = '<meta name="robots" content="noindex, follow">'
    REDIRECT = NOINDEX + '<meta http-equiv="refresh" content="0; url=../reflections.html">'
    SUTTAS = [{"id": "a", "slug": "alpha", "note": "Note.", "added": "2026-01-01"},
              {"id": "b", "slug": "beta", "note": "Note.", "added": "2026-02-01"}]

    def issues(self, pages, archived, unlisted=()):
        original = validator.ROOT
        with tempfile.TemporaryDirectory() as temporary:
            validator.ROOT = Path(temporary)
            (validator.ROOT / "practice").mkdir(parents=True)
            (validator.ROOT / "practice" / "reflections.html").write_text(
                "".join(f'<a href="reflections/{slug}.html">' for slug in archived), encoding="utf-8")
            parsed = {}
            for slug, markup in pages.items():
                page = validator.Page(); page.feed(markup); page.close()
                parsed[f"practice/reflections/{slug}.html"] = page
            issues = []
            try:
                validator.validate_reflection_pages(issues, self.SUTTAS, list(unlisted), parsed)
            finally:
                validator.ROOT = original
        return sorted(item["path"] for item in issues)

    def test_all_three_states_pass_when_built(self):
        pages = {"alpha": self.ARTICLE, "beta": self.NOINDEX + self.ARTICLE, "gamma": self.REDIRECT}
        self.assertEqual(self.issues(pages, ["alpha"], unlisted=["b"]), [])

    def test_nothing_unlisted_means_every_published_page_is_listed(self):
        self.assertEqual(self.issues({"alpha": self.ARTICLE, "beta": self.ARTICLE}, ["alpha", "beta"]), [])

    def test_a_stale_build_is_reported_page_by_page(self):
        # beta is unlisted in the data but the pages and archive were not rebuilt.
        self.assertEqual(self.issues({"alpha": self.ARTICLE, "beta": self.ARTICLE}, ["alpha", "beta"], unlisted=["b"]),
                         ["practice/reflections/beta.html"])
        # An unlisted article must not be a redirect: that is unpublishing.
        self.assertEqual(self.issues({"alpha": self.ARTICLE, "beta": self.REDIRECT}, ["alpha"], unlisted=["b"]),
                         ["practice/reflections/beta.html"])
        # A listed article must not carry noindex, and a missing page is reported.
        self.assertEqual(self.issues({"alpha": self.NOINDEX + self.ARTICLE}, ["alpha"]),
                         ["practice/reflections/alpha.html", "practice/reflections/beta.html"])


class ReflectionDataTests(unittest.TestCase):
    """The Reflection files themselves: details, text, sections."""

    def issues(self, files, unlisted=()):
        original = validator.ROOT
        with tempfile.TemporaryDirectory() as temporary:
            validator.ROOT = Path(temporary)
            folder = validator.ROOT / "practice" / "data" / "reflections"
            folder.mkdir(parents=True)
            schema = original / "practice" / "data" / "reflections" / "reflection.schema.json"
            (folder / "reflection.schema.json").write_text(schema.read_text(encoding="utf-8"), encoding="utf-8")
            (folder / "sections.json").write_text(json.dumps({
                "version": 1, "sections": [{"id": "s", "title": "S", "note": "", "order": "chronological"}],
                "sequence": [name[:-3] for name in files], "unlisted": list(unlisted)}), encoding="utf-8")
            for name, text in files.items():
                (folder / name).write_text(text, encoding="utf-8")
            issues = []
            try:
                validator.read_reflections(issues, validator._load_sitedata())
            finally:
                validator.ROOT = original
        return sorted((item["path"], item["code"]) for item in issues)

    GOOD = '---\nid: "a"\nbook: "s"\ntitle: "A"\nadded: "2026-01-01"\n---\nText.\n'

    def test_a_good_file_passes(self):
        self.assertEqual(self.issues({"a.md": self.GOOD}), [])

    def test_a_broken_file_is_reported_by_name(self):
        self.assertEqual(self.issues({"a.md": "no details"}), [("practice/data/reflections/a.md", "reflection-schema")])
        self.assertIn(("practice/data/reflections/a.md", "reflection-schema"),
                      self.issues({"a.md": self.GOOD.replace('added: "2026-01-01"', 'added: "1 January"')}))

    def test_an_em_dash_in_the_text_is_caught_and_in_the_excerpt_is_not(self):
        dashed = self.GOOD.replace("Text.", "Text \u2014 here.")
        self.assertIn(("practice/data/reflections/a.md", "visible-copy-punctuation"), self.issues({"a.md": dashed}))
        quoted = self.GOOD.replace('title: "A"', 'title: "A"\nexcerpt: "old\u2014"')
        self.assertEqual(self.issues({"a.md": quoted}), [])

    def test_unlisting_something_unpublished_is_reported(self):
        self.assertEqual(self.issues({"a.md": self.GOOD}, unlisted=["nope"]),
                         [("practice/data/reflections/sections.json", "reflection-schema")])


class SchemaTests(unittest.TestCase):
    """The schema reader shared by the validator, the builders and the Website Manager."""

    def setUp(self):
        self.sitedata = validator._load_sitedata()

    def test_problems_are_named_in_plain_words(self):
        schema = {"type": "object", "required": ["text"], "additionalProperties": False,
                  "properties": {"text": {"type": "string", "minLength": 1}, "themes": {"type": "array", "uniqueItems": True}}}
        self.assertEqual(self.sitedata.check({"text": "x"}, schema), [])
        problems = self.sitedata.check({"themes": ["a", "a"], "extra": 1}, schema)
        self.assertEqual(len(problems), 3)
        self.assertTrue(any("missing 'text'" in p for p in problems))
        self.assertTrue(any("twice" in p for p in problems))
        self.assertTrue(any("not allowed" in p for p in problems))

    def test_refs_dates_and_links(self):
        schema = {"$defs": {"d": {"type": "string", "format": "date"}}, "type": "array", "items": {"$ref": "#/$defs/d"}}
        self.assertEqual(self.sitedata.check(["2026-01-31"], schema), [])
        self.assertEqual(len(self.sitedata.check(["2026-02-31", "31 January"], schema)), 2)
        self.assertEqual(self.sitedata.check("https://faisalhenar.com/", {"format": "https"}), [])
        self.assertEqual(len(self.sitedata.check("http://faisalhenar.com/", {"format": "https"})), 1)


if __name__ == "__main__":
    unittest.main()
