"""Places & Community: both pages, in English and Dutch, from one file."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

TOOLS = Path(__file__).resolve().parents[1]
REPO = TOOLS.parent

_spec = importlib.util.spec_from_file_location("places_builder", TOOLS / "build-places.py")
builder = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(builder)


def pages():
    return {"en": (REPO / "practice" / "places.html").read_text(encoding="utf-8"),
            "nl": (REPO / "practice" / "places-nl.html").read_text(encoding="utf-8")}


def data():
    return json.loads((REPO / "practice" / "data" / "places.json").read_text(encoding="utf-8"))


class PlacesTests(unittest.TestCase):
    def test_the_committed_pages_are_what_the_data_builds(self):
        texts = pages()
        self.assertEqual(builder.build(data(), texts), texts)

    def test_an_edit_reaches_its_own_language_only(self):
        d = data()
        entry = d["groups"][0]["entries"][0]
        entry["en"]["by"] = "A new line under the name"
        built = builder.build(d, pages())
        self.assertIn("A new line under the name", built["en"])
        self.assertNotIn("A new line under the name", built["nl"])
        self.assertEqual(built["nl"], pages()["nl"])

    def test_counts_and_the_peek_follow_the_entries(self):
        d = data()
        group = d["groups"][0]
        group["entries"].append(dict(copy.deepcopy(group["entries"][0]), id="another-teacher", name="Another Teacher"))
        built = builder.build(d, pages())
        self.assertIn("3 entries · ", built["en"])
        self.assertIn('<span class="nb-acc-n">3 · ', built["nl"])
        self.assertIn('id="another-teacher"', built["nl"])

    def test_links_in_the_text_open_like_the_rest_of_the_page(self):
        d = data()
        d["groups"][0]["entries"][0]["en"]["text"] = "See [the sheet](meditation.html) and [elsewhere](https://example.org/)."
        built = builder.build(d, pages())["en"]
        self.assertIn('<a href="meditation.html">the sheet</a>', built)
        self.assertIn('<a href="https://example.org/" target="_blank" rel="noopener">elsewhere</a>', built)

    def test_structured_data_comes_from_the_entries(self):
        d = data()
        d["groups"][1]["entries"][0]["search"]["description"]["nl"] = "Een nieuwe beschrijving."
        built = builder.build(d, pages())
        self.assertIn('"description": "Een nieuwe beschrijving."', built["nl"])
        self.assertNotIn("Een nieuwe beschrijving.", built["en"])

    def test_the_room_opens_on_the_chosen_entry_in_both_languages(self):
        d = data()
        d["open"] = "ajahn-tong-sirimangalo"
        built = builder.build(d, pages())
        self.assertIn('data-open-group="teachers" data-open="ajahn-tong-sirimangalo"', built["en"])
        self.assertIn('data-open-group="leraren" data-open="ajahn-tong-sirimangalo"', built["nl"])

    def test_bad_data_is_refused_with_its_reason(self):
        d = data()
        d["groups"][0]["entries"][1]["id"] = d["groups"][0]["entries"][0]["id"]
        with self.assertRaises(SystemExit) as caught:
            builder.check(d)
        self.assertIn("used twice", str(caught.exception))
        d = data()
        d["groups"][0]["entries"][0]["dutch"] = "maybe"
        with self.assertRaises(SystemExit):
            builder.check(d)


if __name__ == "__main__":
    unittest.main()
