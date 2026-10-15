"""The hub's sutta of the day: which entry shows, and its link to a Reflection.

render-daily-sutta.js is run under Node against the real
practice/data/daily-sutta.json and practice/data/reflections/published.json,
with a stand-in document, a stand-in fetch and a fixed date. Skipped where
Node is not installed; nothing here is a build step.
"""
import json
from pathlib import Path
import shutil
import subprocess
import unittest

REPO = Path(__file__).resolve().parents[2]

HARNESS = r"""
const vm = require('vm');
const input = JSON.parse(require('fs').readFileSync(0, 'utf8'));
async function run(day, files) {
  const appended = [];
  const el = () => ({ appendChild: c => appended.push(c), remove() { this.removed = true; }, hidden: false,
                      parentNode: { hidden: false }, textContent: '', innerHTML: '', href: '' });
  const nodes = { 'sutta-of-day': el(), 'sutta-of-day-link': el(), 'sutta-of-day-text': el(),
                  'sutta-of-day-source': el(), 'nb-sutta-more': el(), 'nb-sutta-tr': el() };
  const RealDate = Date;
  class FixedDate extends RealDate {
    constructor(...a) { if (a.length) super(...a); else super(RealDate.UTC(1970, 0, 1) + day * 86400000 + 12 * 3600000); }
    getFullYear() { return this.getUTCFullYear(); } getMonth() { return this.getUTCMonth(); } getDate() { return this.getUTCDate(); }
  }
  const fetch = url => files[url] === undefined
    ? Promise.resolve({ ok: false })
    : Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(files[url])) });
  const context = vm.createContext({ Date: FixedDate, fetch, Promise, encodeURIComponent,
    document: { getElementById: id => nodes[id], createElement: () => ({}) } });
  vm.runInContext(input.renderer, context);
  for (let i = 0; i < 20; i++) await new Promise(r => setImmediate(r));
  const link = appended.find(c => c.className === 'sutta-of-day-reflection');
  return { text: nodes['sutta-of-day-text'].innerHTML, href: nodes['sutta-of-day-link'].href,
           more: nodes['nb-sutta-more'].href, tr: nodes['nb-sutta-tr'].textContent,
           removed: !!nodes['sutta-of-day'].removed, link: link ? link.href : null };
}
(async () => {
  const files = { 'data/daily-sutta.json': input.daily, 'data/reflections/published.json': input.published };
  const daily = JSON.parse(input.daily);
  const rotation = daily.entries.filter(e => e.rotation !== 'resting');
  const out = { picks: [], found: null };
  for (let day = 0; day < rotation.length; day++) {
    const r = await run(day, files);
    out.picks.push(r.href === rotation[day % rotation.length].url && r.more === r.href);
    if (r.link && !out.found) out.found = { day, link: r.link };
  }
  if (out.found) {
    const published = JSON.parse(input.published);
    const slug = decodeURIComponent(out.found.link.replace(/^reflections\//, '').replace(/\.html$/, ''));
    const without = { version: 1, reflections: published.reflections.filter(r => r.slug !== slug) };
    out.withoutIt = (await run(out.found.day, Object.assign({}, files, { 'data/reflections/published.json': JSON.stringify(without) }))).link;
    out.noIndex = (await run(out.found.day, { 'data/daily-sutta.json': input.daily })).link;
  }
  const empty = { version: 1, entries: daily.entries.map(e => Object.assign({}, e, { rotation: 'resting' })) };
  out.allResting = (await run(0, { 'data/daily-sutta.json': JSON.stringify(empty) })).removed;
  out.missing = (await run(0, {})).removed;
  process.stdout.write(JSON.stringify(out));
})();
"""


@unittest.skipUnless(shutil.which("node"), "Node is not installed")
class DailySuttaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        sources = {
            "renderer": (REPO / "practice" / "js" / "render-daily-sutta.js").read_text(encoding="utf-8"),
            "daily": (REPO / "practice" / "data" / "daily-sutta.json").read_text(encoding="utf-8"),
            "published": (REPO / "practice" / "data" / "reflections" / "published.json").read_text(encoding="utf-8"),
        }
        run = subprocess.run(["node", "-e", HARNESS], input=json.dumps(sources),
                             capture_output=True, text=True, encoding="utf-8", timeout=120)
        if run.returncode != 0:
            raise AssertionError(run.stderr)
        cls.result = json.loads(run.stdout)

    def test_each_day_shows_the_next_entry_in_rotation(self):
        """Resting entries are skipped, so the cycle is the rotation, in file order."""
        self.assertTrue(self.result["picks"])
        self.assertTrue(all(self.result["picks"]))

    def test_the_link_follows_the_published_reflections(self):
        found = self.result["found"]
        self.assertIsNotNone(found, "no day in the rotation matches a published Reflection")
        self.assertRegex(found["link"], r"^reflections/[a-z0-9-]+\.html$")
        self.assertIsNone(self.result["withoutIt"], "an unlisted Reflection must not be linked")
        self.assertIsNone(self.result["noIndex"], "no index of Reflections means no link, not an error")

    def test_the_block_is_removed_when_nothing_can_be_shown(self):
        self.assertTrue(self.result["allResting"])
        self.assertTrue(self.result["missing"])


if __name__ == "__main__":
    unittest.main()
