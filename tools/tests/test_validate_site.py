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

    def test_javascript_data_is_parsed_without_execution(self):
        with self.assertRaisesRegex(ValueError, "Unsupported value"):
            validator.declaration("const ITEMS = process.exit(1);", "ITEMS")
        with self.assertRaisesRegex(ValueError, "Unsafe"):
            validator.declaration('const ITEMS = {__proto__: {polluted: true}};', "ITEMS")

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

    def test_malformed_javascript_data_raises(self):
        with self.assertRaises(ValueError):
            validator.declaration("const ITEMS = [1, 2,", "ITEMS")

    def test_local_path_cannot_leave_site_root(self):
        original = validator.ROOT
        with tempfile.TemporaryDirectory() as temporary:
            validator.ROOT = Path(temporary)
            try:
                target = validator.local_target("index.html", "../private.txt")
            finally:
                validator.ROOT = original
        self.assertEqual(target[1], "outside")

    def test_reciprocal_hreflang_is_enforced(self):
        original = validator.ROOT
        with tempfile.TemporaryDirectory() as temporary:
            validator.ROOT = Path(temporary)
            practice = validator.ROOT / "practice"
            (practice / "data").mkdir(parents=True)
            source_html = '<link rel="alternate" hreflang="nl" href="https://faisalhenar.com/practice/foo-nl.html">'
            mirror_html = "<p>no hreflang back to the English page</p>"
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
        hreflang_issues = [item for item in issues if item["code"] == "hreflang"]
        self.assertEqual([item["path"] for item in hreflang_issues], ["practice/foo-nl.html"])

    def test_required_dependency_relationships_are_declared(self):
        declarations = {item["id"]: item for item in validator.DEPENDENCIES}
        self.assertEqual(set(declarations["reflections"]["effects"]), {"archive", "latest Reflection widget", "daily-sutta matching"})
        self.assertEqual(set(declarations["photography"]["effects"]), {"Exhibition", "Index", "viewer", "image files"})
        self.assertIn("Reading shelf", declarations["reading"]["effects"])


if __name__ == "__main__":
    unittest.main()
