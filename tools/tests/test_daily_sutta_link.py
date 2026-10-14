"""The hub's daily sutta links to a Reflection on it, unless that Reflection is unlisted.

render-daily-sutta.js is run under Node against the real suttas-config.js and
daily-sutta-config.js, with a stand-in document and a fixed date. Skipped
where Node is not installed; nothing here is a build step.
"""
import json
from pathlib import Path
import shutil
import subprocess
import unittest

REPO = Path(__file__).resolve().parents[2]
JS = REPO / "practice" / "js"

HARNESS = r"""
const vm = require('vm');
const [suttas, daily, renderer] = JSON.parse(require('fs').readFileSync(0, 'utf8'));
function run(day, declaration) {
  const appended = [];
  const el = () => ({ appendChild: c => appended.push(c), remove() {}, hidden: false });
  const nodes = { 'sutta-of-day': el(), 'sutta-of-day-link': el(), 'sutta-of-day-text': el(), 'sutta-of-day-source': el() };
  const RealDate = Date;
  class FixedDate extends RealDate {
    constructor(...a) { if (a.length) super(...a); else super(RealDate.UTC(1970, 0, 1) + day * 86400000 + 12 * 3600000); }
    getFullYear() { return this.getUTCFullYear(); } getMonth() { return this.getUTCMonth(); } getDate() { return this.getUTCDate(); }
  }
  const context = vm.createContext({ Date: FixedDate, document: { getElementById: id => nodes[id], createElement: () => ({}) } });
  vm.runInContext(suttas + '\n' + declaration + '\n' + daily + '\n' + renderer, context);
  const link = appended.find(c => c.className === 'sutta-of-day-reflection');
  return link ? link.href : null;
}
const pool = vm.runInNewContext(daily + '\nDAILY_SUTTAS.filter(s => s && s.text && s.url).length');
let found = null;
for (let day = 0; day < pool && !found; day++) { const href = run(day, ''); if (href) found = { day, href }; }
const result = { found };
if (found) {
  const slug = decodeURIComponent(found.href.replace(/^reflections\//, '').replace(/\.html$/, ''));
  const all = vm.runInNewContext(suttas + '\nSUTTAS');
  const id = all.find(s => s.slug === slug).id;
  const other = all.find(s => s.id !== id).id;
  result.id = id;
  result.unlisted = run(found.day, 'const MANAGER_WITHDRAWN_REFLECTIONS = ' + JSON.stringify([id]) + ';');
  result.otherUnlisted = run(found.day, 'const MANAGER_WITHDRAWN_REFLECTIONS = ' + JSON.stringify([other]) + ';');
  result.emptyDeclaration = run(found.day, 'const MANAGER_WITHDRAWN_REFLECTIONS = [];');
}
process.stdout.write(JSON.stringify(result));
"""


@unittest.skipUnless(shutil.which("node"), "Node is not installed")
class DailySuttaReflectionLinkTests(unittest.TestCase):
    def test_the_link_follows_the_unlisting_declaration(self):
        sources = [(JS / name).read_text(encoding="utf-8")
                   for name in ("suttas-config.js", "daily-sutta-config.js", "render-daily-sutta.js")]
        run = subprocess.run(["node", "-e", HARNESS], input=json.dumps(sources),
                             capture_output=True, text=True, encoding="utf-8", timeout=60)
        self.assertEqual(run.returncode, 0, run.stderr)
        result = json.loads(run.stdout)
        self.assertIsNotNone(result["found"], "no day in the rotation matches a published Reflection")
        href = result["found"]["href"]
        self.assertRegex(href, r"^reflections/[a-z0-9-]+\.html$")
        self.assertIsNone(result["unlisted"], "an unlisted Reflection is still linked from the daily sutta")
        self.assertEqual(result["otherUnlisted"], href)
        self.assertEqual(result["emptyDeclaration"], href)


if __name__ == "__main__":
    unittest.main()
