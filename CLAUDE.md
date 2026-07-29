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
- The **only** file to touch to add/remove/reorder albums is
  `photography/js/config.js`. Never hardcode album data elsewhere.
- Photos live in `photography/photos/<slug>/`.
- **Before adding new photos, resize to ~2000px on the long edge.** Full-size
  camera/Lightroom exports are too large for this repo (slow site, git bloat,
  possible GitHub file-size rejections). If asked to add photos and they look
  oversized, flag this before committing.
- Album URLs: `photography/album.html?a=<slug>`.

## Practice section specifics
- `practice/index.html` is a hub linking to `reading.html`, `listening.html`,
  `places.html`. A "Reflections" section is planned but not yet built —
  don't assume its shape.
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

## Homepage placeholder
"Room III" on the homepage is an intentional placeholder for a future
section (undecided — possibly writing/blog, possibly project pages). Don't
fill it in speculatively.

## What NOT to do
- Don't introduce a build step, bundler, or framework (React, Vue, static
  site generator, etc.) without being explicitly asked. This is a plain
  HTML/CSS/JS site by choice, not by accident.
- Don't add tracking/analytics scripts unless asked.
- Don't restructure the section folders (photography/, practice/) without
  discussing it first — they're deliberately self-contained.
