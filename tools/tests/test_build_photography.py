"""The photography room's builder: what changed in October 2026.

Between-walks sheets, retired addresses that keep forwarding, and the room's
own block in sitemap.xml. The pages themselves are checked by the builder's
own page checks and by tools/validate-site.py.
"""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

TOOLS = Path(__file__).resolve().parents[1]
REPO = TOOLS.parent

_spec = importlib.util.spec_from_file_location("photography_builder", TOOLS / "build-photography.py")
builder = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(builder)


def load(name):
    return json.loads((REPO / "photography" / "data" / name).read_text(encoding="utf-8"))


class RoomTests(unittest.TestCase):
    def setUp(self):
        self.photos = {p["id"]: p for p in load("photos.json")}
        data = load("sheets.json")
        self.sheets, self.retired = data["sheets"], data.get("retired", {"sheets": {}, "photos": {}})
        self.walls, self.meta = load("walls.json"), load("photo-meta.json")
        builder.configure_sheet_addresses(self.sheets)

    def room(self):
        return builder.Room(self.photos, self.sheets, self.walls, self.meta)

    def test_the_data_holds_together(self):
        builder.validate(self.photos, self.sheets, self.walls, self.meta, self.retired)

    def test_a_retired_sheet_forwards_to_the_contact_sheets(self):
        moved = builder.redirects(self.room(), {"sheets": {"loose": None}, "photos": {}})
        self.assertEqual(moved["/photography/sheets/loose/"], "/photography/sheets/")
        self.assertEqual(moved["/photography/room/sheets/loose/"], "/photography/sheets/")

    def test_a_removed_photograph_forwards_to_its_sheet_or_to_the_sheets(self):
        sheet = self.sheets[0]
        gone = sheet["frames"][-1]
        moved = builder.redirects(self.room(), {"sheets": {}, "photos": {gone: sheet["id"], "fh-9999": "no-such-sheet"}})
        self.assertEqual(moved["/photography/p/%s/" % gone], builder.sheet_url(sheet["id"]))
        self.assertEqual(moved["/photography/p/fh-9999/"], "/photography/sheets/")

    def test_a_retired_id_cannot_come_back(self):
        any_id = next(iter(self.photos))
        with self.assertRaises(SystemExit) as caught:
            builder.validate(self.photos, self.sheets, self.walls, self.meta, {"sheets": {}, "photos": {any_id: None}})
        self.assertIn("retired but still in photos.json", str(caught.exception))
        with self.assertRaises(SystemExit):
            builder.validate(self.photos, self.sheets, self.walls, self.meta,
                             {"sheets": {self.sheets[0]["id"]: None}, "photos": {}})

    def test_between_walks_frames_show_their_own_place(self):
        between = next(s for s in self.sheets if s["kind"] == "between")
        page = builder.sheet_page(self.room(), between, {"base": "1", "menu": "1"})
        for frame in between["frames"]:
            if self.meta[frame]["place"]:
                self.assertIn('<span class="frame-place">%s</span>' % builder.esc(self.meta[frame]["place"]), page)

    def test_the_work_table_shows_the_latest_walk_not_a_between_walks_sheet(self):
        sheets = copy.deepcopy(self.sheets)
        between = next(s for s in sheets if s["kind"] == "between")
        sheets.remove(between)
        sheets.insert(0, between)
        builder.configure_sheet_addresses(sheets)
        room = builder.Room(self.photos, sheets, self.walls, self.meta)
        table = builder.work_table(room)
        self.assertNotIn(between["title"], table)

    def test_the_sitemap_lists_every_page_once_but_no_photograph(self):
        room = self.room()
        block = builder.sitemap_block(room)
        self.assertEqual(block.count("<loc>https://faisalhenar.com/photography/sheets/"), len(self.sheets) + 1)
        self.assertEqual(block.count("<loc>https://faisalhenar.com/photography/p/"), 0)
        sitemap = (REPO / "sitemap.xml").read_text(encoding="utf-8")
        self.assertIn(block, sitemap)


if __name__ == "__main__":
    unittest.main()
