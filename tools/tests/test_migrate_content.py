"""tools/migrate-content.py: it reads the old configs safely, and running it
again on migrated content changes nothing."""
import contextlib
import importlib.util
import io
from pathlib import Path
import sys
import unittest

TOOLS = Path(__file__).resolve().parents[1]

_spec = importlib.util.spec_from_file_location("content_migration", TOOLS / "migrate-content.py")
migration = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(migration)


class OldConfigReaderTests(unittest.TestCase):
    def test_javascript_data_is_parsed_without_execution(self):
        with self.assertRaisesRegex(ValueError, "Unsupported value"):
            migration.declaration("const ITEMS = process.exit(1);", "ITEMS")
        with self.assertRaisesRegex(ValueError, "Unsafe"):
            migration.declaration('const ITEMS = {__proto__: {polluted: true}};', "ITEMS")

    def test_malformed_javascript_data_raises(self):
        with self.assertRaises(ValueError):
            migration.declaration("const ITEMS = [1, 2,", "ITEMS")

    def test_a_plain_data_literal_is_read(self):
        self.assertEqual(migration.declaration('// a note\nconst ITEMS = [{id: "a", n: 2, ok: true}];', "ITEMS"),
                         [{"id": "a", "n": 2, "ok": True}])


class RerunTests(unittest.TestCase):
    def test_a_second_run_on_migrated_content_plans_nothing(self):
        plan = migration.Plan(dry=True)
        with contextlib.redirect_stdout(io.StringIO()):
            migration.migrate_places(plan)
            migration.migrate_reflections(plan)
            migration.migrate_daily(plan, None)
            migration.migrate_quotes(plan)
            migration.migrate_loose(plan)
            migration.migrate_sitemap(plan)
        self.assertEqual(plan.writes, {})
        self.assertEqual(plan.removes, [])
        self.assertTrue(all("already" in note or "no loose" in note for note in plan.notes), plan.notes)


if __name__ == "__main__":
    unittest.main()
