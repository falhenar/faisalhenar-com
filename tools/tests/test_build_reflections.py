import importlib.util
from pathlib import Path
import unittest


TOOLS = Path(__file__).resolve().parents[1]

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

    def test_two_entries_with_the_same_title_do_not_share_a_url(self):
        text = '  {\n    id: "a",\n    title: "Same",\n  },\n  {\n    id: "b",\n    title: "Same",\n  },\n'
        published = [{"id": "a", "title": "Same"}, {"id": "b", "title": "Same"}]
        _, minted = builder.freeze_slugs(text, published)
        self.assertEqual([slug for _id, slug in minted], ["same", "same-2"])


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
