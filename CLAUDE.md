# faisalhenar.com — Project Context for Claude Code

## What this is
A personal website: photography, Buddhist practice, reading, writing, and
personal projects. Plain HTML/CSS/JS, no build tools, no frameworks, no
package.json. Hosted on GitHub Pages with a custom domain (faisalhenar.com),
DNS via Namecheap.

## Tone and priorities
This site favors depth over volume, and calm over promotional. Match that in
any copy you write: plain English, short sentences, no marketing language,
no filler adjectives. See the site's own README.md for the full design
philosophy if unsure.

Design-wise: simplicity, generous whitespace, timeless typography, no
animation without a clear purpose. Don't introduce trendy effects.

## Structure
- `index.html` + `css/hub.css` — homepage ("hub"), links to each section
- `photography/` — self-contained: its own css/js/photos
- `practice/` — self-contained: its own css
- Each section folder should stay self-contained. Don't cross-wire css/js
  between sections.

## Photography section specifics
See README.md § "Add your own albums" for the actual process — don't
duplicate those instructions here, they can drift out of sync.

The one thing worth restating because it's easy to forget: resize photos to
~2000px on the long edge before adding them. Flag it if asked to add photos
that look oversized.

## Practice section specifics
- `practice/index.html` is a hub linking to `reading.html`, `listening.html`,
  `watching.html`, `places.html` (in that order — I. through IV.).
- Reflections is built: a featured widget on `practice/index.html`
  (`#reflections-featured`) plus a full archive at `practice/reflections.html`,
  both fed by `practice/js/suttas-config.js` via `render-reflections.js`. An
  entry only publishes once it has both a `note` and an `added` date — see
  the config file's own comments for the full field reference.
- `watching.html` lists YouTube channels only, no documentaries or embeds —
  plain links in the same `.entry` pattern as `listening.html`. Don't add
  YouTube embeds/iframes (third-party tracking) or thumbnail images
  (copyright, and it'd be the only non-authored imagery on the site).
- In `places.html`, Wat Chom Tong must stay first in the monasteries list;
  new entries go below it, not above.

## Git / environment
- Repo lives locally at a path outside OneDrive (moved deliberately — do not
  suggest OneDrive, Dropbox, or other syncing services as a repo location).
- No CI/CD — GitHub Pages serves the repo directly on push to `main`.
  There is no build step, so there is nothing to break by "forgetting to
  build" — but also nothing catches errors before they go live. Take care
  with anything pushed straight to `main`.
- No `.github/workflows/` currently. Don't add GitHub Actions unless
  explicitly asked — this is a deliberately simple, low-maintenance setup.

## What NOT to do
- Don't introduce a build step, bundler, or framework (React, Vue, static
  site generator, etc.) without being explicitly asked. This is a plain
  HTML/CSS/JS site by choice, not by accident.
- Don't add tracking/analytics scripts unless asked.
- Don't restructure the section folders (photography/, practice/) without
  discussing it first — they're deliberately self-contained.
