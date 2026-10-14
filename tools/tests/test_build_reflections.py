import contextlib
import importlib.util
import io
import json
from pathlib import Path
import re
import shutil
import tempfile
import unittest


TOOLS = Path(__file__).resolve().parents[1]
REPO = TOOLS.parent

_spec = importlib.util.spec_from_file_location("reflection_builder", TOOLS / "build-reflections.py")
builder = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(builder)

_vspec = importlib.util.spec_from_file_location("website_validator_for_builder", TOOLS / "validate-site.py")
validator = importlib.util.module_from_spec(_vspec)
_vspec.loader.exec_module(validator)


class SlugTests(unittest.TestCase):
    def test_slugs_are_lowercase_words_joined_by_hyphens(self):
        self.assertEqual(builder.slugify("The Simile of the Mountain"), "the-simile-of-the-mountain")
        self.assertEqual(builder.slugify("Taking Care of Ourselves, We Take Care of Others"),
                         "taking-care-of-ourselves-we-take-care-of-others")

    def test_diacritics_and_apostrophes_are_folded_not_dropped_into_gaps(self):
        self.assertEqual(builder.slugify("Pabbatūpamasutta"), "pabbatupamasutta")
        self.assertEqual(builder.slugify("In the Buddha’s Words"), "in-the-buddhas-words")

    def test_a_frozen_slug_is_never_recomputed(self):
        """The point of freezing: a retitled Reflection keeps its URL."""
        text = '  {\n    id: "x-1",\n    title: "Old Title",\n  },\n'
        published = [{"id": "x-1", "title": "A Completely New Title", "slug": "old-title"}]
        after, minted = builder.freeze_slugs(text, published)
        self.assertEqual(minted, [])
        self.assertEqual(after, text)
        self.assertEqual(published[0]["slug"], "old-title")

    def test_a_new_slug_is_written_into_the_config_once(self):
        text = '  {\n    id: "x-1",\n    title: "Aging and Death",\n  },\n'
        published = [{"id": "x-1", "title": "Aging and Death"}]
        after, minted = builder.freeze_slugs(text, published)
        self.assertEqual(minted, [("x-1", "aging-and-death")])
        self.assertIn('    slug: "aging-and-death",\n', after)
        self.assertEqual(after.count('slug: "aging-and-death"'), 1)

    def test_two_entries_that_would_share_a_url_are_refused_by_name(self):
        """A URL is permanent, so a person chooses it rather than inheriting a number."""
        text = '  {\n    id: "a",\n    title: "Same",\n  },\n  {\n    id: "b",\n    title: "Same",\n  },\n'
        published = [{"id": "a", "title": "Same"}, {"id": "b", "title": "Same"}]
        with self.assertRaises(SystemExit) as caught:
            builder.freeze_slugs(text, published)
        message = str(caught.exception)
        self.assertIn("a", message)
        self.assertIn("b", message)
        self.assertIn("same.html", message)

    def test_a_title_with_nothing_sluggable_is_refused(self):
        text = '  {\n    id: "a",\n    title: "...",\n  },\n'
        with self.assertRaises(SystemExit):
            builder.freeze_slugs(text, [{"id": "a", "title": "..."}])


class DescriptionTests(unittest.TestCase):
    def test_markup_is_stripped_and_the_text_is_cut_at_a_word(self):
        note = "<p>A note with <a href=\"#\">a link</a> inside it.</p> " + "word " * 60
        result = builder.description({"note": note})
        self.assertNotIn("<", result)
        self.assertTrue(result.endswith("..."))
        self.assertLessEqual(len(result), 158)
        self.assertNotIn("wor...", result)

    def test_a_short_note_is_used_whole_and_unchanged(self):
        result = builder.description({"note": "Short enough to stand on its own."})
        self.assertEqual(result, "Short enough to stand on its own.")


class ArchiveReferenceTests(unittest.TestCase):
    """The contents column answers which text, and nothing else."""

    def test_the_pali_title_stays_on_the_page_not_in_the_list(self):
        entry = {"ref": "SN 3.3", "suttaTitle": "Jar\u0101mara\u1e47asutta"}
        self.assertEqual(builder.archive_reference(entry), "SN 3.3")
        self.assertEqual(builder.subtitle(entry), "SN 3.3 &middot; Jar\u0101mara\u1e47asutta")

    def test_the_excerpt_qualifier_is_dropped_in_the_list_and_kept_on_the_page(self):
        entry = {"ref": "from AN 3.36", "suttaTitle": "Devad\u016btasutta"}
        self.assertEqual(builder.archive_reference(entry), "AN 3.36")
        self.assertTrue(builder.subtitle(entry).startswith("from AN 3.36"))

    def test_only_a_leading_from_is_dropped(self):
        self.assertEqual(builder.archive_reference({"ref": "Fromage 1.1"}), "Fromage 1.1")
        self.assertEqual(builder.archive_reference({"ref": "AN 3.36, from the section on messengers"}),
                         "AN 3.36, from the section on messengers")

    def test_an_entry_with_no_sutta_reference_falls_back_to_its_source(self):
        self.assertEqual(builder.archive_reference({"sourceLocation": "chapter 4"}), "chapter 4")
        self.assertEqual(builder.archive_reference({"sourceTitle": "The Island"}), "The Island")
        self.assertEqual(builder.archive_reference({}), "")


class OrderTests(unittest.TestCase):
    BOOKS = {"spine": {"title": "Spine", "note": "", "order": "structural"},
             "kept": {"title": "Kept", "note": "", "order": "chronological"}}

    def entries(self):
        return [
            {"id": "s1", "book": "spine", "title": "One", "added": "2026-03-01", "_index": 0},
            {"id": "s2", "book": "spine", "title": "Two", "added": "2026-01-01", "_index": 1},
            {"id": "k1", "book": "kept", "title": "Early", "added": "2026-01-01", "_index": 2},
            {"id": "k2", "book": "kept", "title": "Late", "added": "2026-05-01", "_index": 3},
        ]

    def test_a_structural_section_keeps_the_source_order_not_the_dates(self):
        groups = builder.page_order(self.BOOKS, self.entries())
        spine = next(g for g in groups if g["key"] == "spine")
        self.assertEqual([e["id"] for e in spine["entries"]], ["s1", "s2"])

    def test_a_chronological_section_is_newest_first(self):
        groups = builder.page_order(self.BOOKS, self.entries())
        kept = next(g for g in groups if g["key"] == "kept")
        self.assertEqual([e["id"] for e in kept["entries"]], ["k2", "k1"])

    def test_a_section_with_nothing_published_is_not_rendered(self):
        groups = builder.page_order(self.BOOKS, [e for e in self.entries() if e["book"] == "kept"])
        self.assertEqual([g["key"] for g in groups], ["kept"])


class WithdrawnPageTests(unittest.TestCase):
    """What happens to the page when a Reflection stops being published.

    Deleting it would break every link anyone had shared. Leaving the essay up
    would defeat the point of withdrawing it. So the text goes and the address
    stays, pointing at the archive.
    """

    def markup(self):
        return builder.withdrawn_markup("some-reflection", "53", "1", "3")

    def test_the_essay_is_gone_and_the_address_still_answers(self):
        page = self.markup()
        self.assertIn('http-equiv="refresh"', page)
        self.assertIn("../reflections.html", page)
        self.assertIn("Withdrawn", page)

    def test_it_asks_not_to_be_indexed(self):
        """Which is also what keeps it out of the sitemap; see validate-site.py."""
        self.assertIn('name="robots" content="noindex', self.markup())

    def test_it_still_carries_what_every_page_must_carry(self):
        """A page that fails the site validator is not a usable way to withdraw."""
        page = self.markup()
        for required in ('rel="canonical"', 'property="og:title"', 'property="og:description"',
                         'property="og:type"', 'property="og:url"', 'property="og:image"'):
            with self.subTest(required=required):
                self.assertIn(required, page)
        self.assertIn("/practice/reflections/some-reflection.html", page)


class BuildRunTests(unittest.TestCase):
    """Whole builds, run against temporary copies, never the real tree."""

    PATHS = ("CONFIG", "ARCHIVE", "SITEMAP", "OUT_DIR", "CROSSLINKS_PATH")

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "practice" / "reflections").mkdir(parents=True)
        (self.root / "practice" / "js").mkdir()
        (self.root / "practice" / "data").mkdir()
        shutil.copy(REPO / "practice" / "reflections.html", self.root / "practice" / "reflections.html")
        shutil.copy(REPO / "sitemap.xml", self.root / "sitemap.xml")
        self.saved = {name: getattr(builder, name) for name in self.PATHS}
        builder.CONFIG = str(self.root / "practice" / "js" / "suttas-config.js")
        builder.ARCHIVE = str(self.root / "practice" / "reflections.html")
        builder.SITEMAP = str(self.root / "sitemap.xml")
        builder.OUT_DIR = str(self.root / "practice" / "reflections")
        builder.CROSSLINKS_PATH = str(self.root / "practice" / "data" / "crosslinks.json")

    def tearDown(self):
        for name, value in self.saved.items():
            setattr(builder, name, value)
        self.tmp.cleanup()

    def build(self):
        with contextlib.redirect_stdout(io.StringIO()):
            builder.main()

    def snapshot(self):
        return {p.relative_to(self.root).as_posix(): p.read_bytes()
                for p in sorted(self.root.rglob("*")) if p.is_file()}

    def text(self, relative):
        return (self.root / relative).read_text(encoding="utf-8")


class CurrentSiteTests(BuildRunTests):
    def test_a_copy_of_the_real_site_rebuilds_byte_for_byte(self):
        """No declaration in the live config: the output is what is committed."""
        shutil.copy(REPO / "practice" / "js" / "suttas-config.js", builder.CONFIG)
        shutil.copy(REPO / "practice" / "data" / "crosslinks.json", builder.CROSSLINKS_PATH)
        for page in (REPO / "practice" / "reflections").glob("*.html"):
            shutil.copy(page, Path(builder.OUT_DIR) / page.name)
        before = self.snapshot()
        self.build()
        self.assertEqual(before, self.snapshot())


class UnlistingTests(BuildRunTests):
    """Unlisting keeps the article at its address and takes it out of discovery.

    It is not withdrawal: an entry that stops being published (empty note or
    no date) still turns into a redirect to the archive.
    """

    ROBOTS = '<meta name="robots" content="noindex, follow">'
    BOOKS = {"spine": {"title": "Spine", "note": "In order.", "order": "structural"},
             "kept": {"title": "Kept", "note": "By date.", "order": "chronological"}}

    def setUp(self):
        super().setUp()
        self.suttas = [
            {"id": "s1", "book": "spine", "title": "One", "slug": "one", "ref": "SN 1.1", "note": "First note.", "added": "2026-01-01"},
            {"id": "s2", "book": "spine", "title": "Two", "slug": "two", "ref": "SN 1.2", "note": "Second note.", "added": "2026-02-01"},
            {"id": "s3", "book": "spine", "title": "Three", "slug": "three", "ref": "SN 1.3", "note": "Third note.", "added": "2026-03-01"},
            {"id": "k1", "book": "kept", "title": "Kept", "slug": "kept", "ref": "AN 4.4", "note": "Kept note.", "added": "2026-04-01"},
            {"id": "q1", "book": "kept", "title": "Queued", "ref": "AN 5.5", "note": "", "added": ""},
        ]

    def configure(self, unlisted=None, raw=None):
        text = ("const BOOKS = " + json.dumps(self.BOOKS, indent=2) + ";\n\n"
                + "const SUTTAS = [\n" + ",\n".join(
                    "  {\n" + "".join("    %s: %s,\n" % (k, json.dumps(v)) for k, v in entry.items()) + "  }"
                    for entry in self.suttas) + "\n];\n")
        if raw is not None:
            text += "\n" + raw + "\n"
        elif unlisted is not None:
            text += "\nconst MANAGER_WITHDRAWN_REFLECTIONS = " + json.dumps(unlisted) + ";\n"
        Path(builder.CONFIG).write_text(text, encoding="utf-8", newline="\n")

    def page(self, slug):
        return self.text("practice/reflections/%s.html" % slug)

    def test_no_declaration_and_an_empty_one_build_the_same_site(self):
        self.configure()
        self.build()
        before = {k: v for k, v in self.snapshot().items() if not k.endswith("suttas-config.js")}
        self.configure(unlisted=[])
        self.build()
        after = {k: v for k, v in self.snapshot().items() if not k.endswith("suttas-config.js")}
        self.assertEqual(before, after)

    def test_an_unlisted_article_stays_whole_at_its_address_and_leaves_discovery(self):
        self.configure(unlisted=["s2"])
        self.build()
        page = self.page("two")
        self.assertEqual(page.count('name="robots"'), 1)
        self.assertIn(self.ROBOTS, page)
        self.assertIn("Second note.", page)
        self.assertNotIn('http-equiv="refresh"', page)
        self.assertIn('<link rel="canonical" href="https://faisalhenar.com/practice/reflections/two.html">', page)
        archive, sitemap = self.text("practice/reflections.html"), self.text("sitemap.xml")
        self.assertNotIn("reflections/two.html", archive)
        self.assertNotIn('id="two"', archive)
        self.assertNotIn("/practice/reflections/two.html", sitemap)
        for listed in ("one", "three", "kept"):
            with self.subTest(listed=listed):
                self.assertNotIn('name="robots"', self.page(listed))
                self.assertIn("reflections/%s.html" % listed, archive)
                self.assertIn("/practice/reflections/%s.html" % listed, sitemap)
                self.assertIn("Three so far", self.page(listed))
        # The previous link steps over it, from listed and unlisted pages alike.
        self.assertIn('rel="prev" href="one.html"', self.page("three"))
        self.assertIn('rel="prev" href="one.html"', page)
        self.assertNotIn("two.html", self.page("three"))

    def test_unlisting_the_newest_and_then_everything_leaves_no_stale_state(self):
        self.configure(unlisted=["k1"])
        self.build()
        archive = self.text("practice/reflections.html")
        self.assertIn('data-open="three"', archive)
        self.assertEqual(archive.count("Latest &middot;"), 1)
        self.assertIn('id="three"', archive.split("Latest &middot;")[0].rsplit("<li", 1)[1])
        self.assertIn('datetime="2026-03">March 2026</time>', archive)

        self.configure(unlisted=["s1", "s2", "s3", "k1"])
        self.build()
        archive, sitemap = self.text("practice/reflections.html"), self.text("sitemap.xml")
        self.assertIn('data-open=""', archive)
        self.assertNotIn("nb-item", archive)
        self.assertNotIn("Latest &middot;", archive)
        self.assertNotIn("/practice/reflections/", sitemap)
        for slug in ("one", "two", "three", "kept"):
            with self.subTest(slug=slug):
                self.assertIn(self.ROBOTS, self.page(slug))
                self.assertNotIn('rel="prev"', self.page(slug))
                self.assertIn("None so far", self.page(slug))

    def test_relisting_restores_the_site_byte_for_byte(self):
        self.configure()
        self.build()
        before = {k: v for k, v in self.snapshot().items() if not k.endswith("suttas-config.js")}
        self.configure(unlisted=["s2", "k1"])
        self.build()
        self.configure(unlisted=[])
        self.build()
        after = {k: v for k, v in self.snapshot().items() if not k.endswith("suttas-config.js")}
        self.assertEqual(before, after)

    def test_a_retitled_relisted_article_keeps_its_address(self):
        self.configure(unlisted=["s2"])
        self.build()
        self.suttas[1]["title"] = "Two, Renamed"
        self.configure(unlisted=[])
        self.build()
        page = self.page("two")
        self.assertIn("Two, Renamed", page)
        self.assertNotIn('name="robots"', page)
        self.assertIn("reflections/two.html", self.text("practice/reflections.html"))
        self.assertIn("/practice/reflections/two.html", self.text("sitemap.xml"))
        self.assertFalse((Path(builder.OUT_DIR) / "two-renamed.html").exists())

    def test_losing_eligibility_still_redirects_and_is_not_unlisting(self):
        self.configure()
        self.build()
        self.suttas[1]["note"] = ""
        for unlisted in (None, ["s2"]):
            with self.subTest(unlisted=unlisted):
                self.configure(unlisted=unlisted)
                self.build()
                page = self.page("two")
                self.assertIn('http-equiv="refresh"', page)
                self.assertNotIn("Second note.", page)
                self.assertEqual(page, builder.withdrawn_markup("two", *self.versions()))

    def versions(self):
        archive = self.text("practice/reflections.html")
        return tuple(re.search(pattern, archive).group(1) for pattern in
                     (r"css/notebook\.css\?v=(\d+)", r"css/base\.css\?v=(\d+)", r"js/menu\.js\?v=(\d+)"))

    def test_an_invalid_declaration_is_refused_by_name(self):
        cases = {
            "const MANAGER_WITHDRAWN_REFLECTIONS = [\"s2\";": "could not be read",
            "const MANAGER_WITHDRAWN_REFLECTIONS = {\"s2\": true};": "array of Reflection id strings",
            "const MANAGER_WITHDRAWN_REFLECTIONS = [2];": "array of Reflection id strings",
            "const MANAGER_WITHDRAWN_REFLECTIONS = [\"s2\", \"s2\"];": "more than once: s2",
            "const MANAGER_WITHDRAWN_REFLECTIONS = [\"nope\"];": "no Reflection with that id: nope",
        }
        for raw, message in cases.items():
            with self.subTest(raw=raw):
                self.configure(raw=raw)
                before = self.snapshot()
                with self.assertRaises(SystemExit) as caught:
                    self.build()
                self.assertIn("MANAGER_WITHDRAWN_REFLECTIONS", str(caught.exception))
                self.assertIn(message, str(caught.exception))
                self.assertEqual(before, self.snapshot())

    def test_a_second_build_changes_no_bytes(self):
        self.suttas.append({"id": "k2", "book": "kept", "title": "Fresh One", "ref": "AN 6.6", "note": "New.", "added": "2026-05-01"})
        self.configure(unlisted=["s2"])
        self.build()
        first = self.snapshot()
        self.assertIn('slug: "fresh-one"', self.text("practice/js/suttas-config.js"))
        self.build()
        self.assertEqual(first, self.snapshot())

    def test_no_next_link_is_generated(self):
        self.configure(unlisted=["s2"])
        self.build()
        for page in Path(builder.OUT_DIR).glob("*.html"):
            with self.subTest(page=page.name):
                text = page.read_text(encoding="utf-8")
                self.assertNotIn('rel="next"', text)
                self.assertNotIn("Next", text)


class QuotationExemptionTests(unittest.TestCase):
    """STYLE.md exempts verbatim quotation from the punctuation rule.

    A generated Reflection page renders the `excerpt` field, which is already
    exempt in the config, into a blockquote. If the page check did not follow
    the exemption, publishing a translation that uses an em dash would fail
    the build and the only fix would be to misquote it.
    """
    def visible(self, markup):
        page = validator.Page()
        page.feed(markup)
        page.close()
        return page.visible

    def test_an_em_dash_inside_a_blockquote_is_not_our_copy(self):
        text = self.visible('<p>Ours.</p><blockquote>the truth of the good never gets old—</blockquote>')
        self.assertFalse(any(token in value for value in text for token in validator.FORBIDDEN))

    def test_an_em_dash_in_our_own_prose_is_still_caught(self):
        text = self.visible('<p>Ours—and wrong.</p>')
        self.assertTrue(any(token in value for value in text for token in validator.FORBIDDEN))

    def test_the_exemption_closes_with_the_blockquote(self):
        text = self.visible('<blockquote>quoted\u2014fine</blockquote><p>Ours\u2014and wrong.</p>')
        self.assertTrue(any(token in value for value in text for token in validator.FORBIDDEN))


if __name__ == "__main__":
    unittest.main()
