# faisalhenar.com — setup guide

This is a plain HTML/CSS/JS site. No build tools, no installs needed.

## How the site is organized

```
index.html            → the homepage (front door to everything)
contact.html           → contact page
note.html              → "a note from me" page
css/hub.css            → homepage styling
css/note.css           → note.html styling

photography/           → the photography section
  index.html            → the folio: a curated Exhibition, then an Index
                          of the whole collection
  css/, js/, photos/    → styling, logic, and your photo files

practice/               → the Buddhism/practice section
  index.html            → hub linking to the six rooms
  reflections.html, reading.html, listening.html, watching.html,
  places.html, meditation.html
  css/, js/             → styling, and the configs the rooms render from
```

Each section (photography, practice) is self-contained — its own css/js/photos
live inside its own folder. The homepage just links out to each one.

## 3. Add photographs

Photography content has two authoritative data files:

- `photography/data/photos.json` is the ordered master collection.
- `photography/data/exhibition.json` is the curated sequence.

The private local Photography Manager validates and updates these files. The
instructions below describe the data for maintenance and recovery.

### How the Photography page is built

It is one page with two halves, and they answer different questions.

- **The Exhibition** is a curated sequence: a selection, hand-ordered, most
  of the collection deliberately left out. It comes from `exhibition.json`.
- **The Index** below it is the whole collection in the approved sequence
  stored directly in `photos.json`. The private manager starts new work
  newest first, then preserves the manually approved order.

So a new photograph appears in the Index automatically. It joins the
Exhibition only if you decide it belongs there.

### The two data files

- **`photos.json`** contains one object per photograph. Each has a short stable
  id (`vn-01`, `sr-12`). The id is how the Exhibition refers to it, so it
  never changes once given, even if the file is moved or renamed.
- **`exhibition.json`** contains the curated sequence, written as rows. See
  below.

### To add a photograph

1. Use the Photography Manager to prepare a finished JPEG or TIFF. It creates
   an sRGB JPEG at no more than 2560px on the long edge and places it under
   `photography/photos/<year>/`.
2. Add an object to `photos.json`:

   ```json
   {
     "id": "fh-0001",
     "src": "photos/2026/fh-0001.jpg",
     "w": 2560,
     "h": 1920,
     "color": false,
     "alt": "A plain description of what is in the frame.",
     "added": "2026-08-20"
   }
   ```

   - `src` is relative to `photography/`, so it starts with `photos/`.
   - `w` and `h` are the file's real pixel dimensions. They reserve the
     right space before the image loads, so nothing jumps on the page.
     Wrong numbers mean a visible layout shift.
   - `color: true` keeps the photograph in colour; `false` applies the
     site's black and white treatment.
   - `alt` describes the photograph for someone who cannot see it.
   - `added` is the date it entered the collection. This, and only this,
     is what orders the Index.

3. Decide whether it enters the Exhibition. Most photographs should not.
   If it does, add it to a row in `exhibition.json` at the point in the
   sequence where it belongs.

### The Exhibition rows

The page is one centred column and the only unit is a row. There are three
kinds, and nothing else to configure:

```json
{ "row": ["sr-04", "sr-06"] }
{ "row": ["sr-12"] }
{ "row": ["sr-11"], "width": "narrow" }
```

Two flags, both rare: `weight: [1, 1.25]` nudges one photograph's share of
a shared row, and `turn: true` puts a longer pause above a row where the
sequence changes register.

A shared row divides itself by the photographs' own proportions, so both
end up the same height and neither is cropped. You do not choose widths.

To remove a photograph from the sequence, take its id out of
`exhibition.json`. It stays in `photos.json`, so it remains in the Index.
Removing a photograph from the master collection is a separate operation.

## 4. Adding reflections and quotes

Same idea as albums — one config file each, no code to touch.

**Reflections** (the Practice → Reflections room):
`practice/js/suttas-config.js`. Its legacy `BOOKS` object defines the visible
page sections, and `SUTTAS` holds the source-ordered Reflection queue. A
Reflection may include a sutta or other source, but source fields are optional.
An entry appears only when both `note` and `added` are filled. Structural page
sections follow source order; chronological sections show the newest published
entry first, using source order to break same-date ties.

**Quotes** (the shuffled quote block on the Practice hub):
`practice/js/quotes-config.js`. Each entry needs `text`, `author`, and a
`source` that's actually checkable — no quote goes in without one. See the
comment block at the top of that file for translator/sourcing notes.

**Sutta of the day** (the dated block at the foot of the Practice hub):
`practice/js/daily-sutta-config.js`. One entry per sutta, each with `text`,
`ref` and a SuttaCentral `url`. The entry shown is chosen from the calendar
date, so everyone sees the same one on a given day and it changes at midnight.
Adding entries just lengthens the cycle. When the day's sutta is one you have
written a reflection on, the block links through to it automatically, matched
on `ref` against `suttas-config.js`, so the two lists cannot drift apart.

**Latest Reflection** (the featured block on the Practice hub) is also derived
from `suttas-config.js` by `practice/js/render-latest-reflection.js`. The same
published-entry rule used by the archive selects the newest dated Reflection.

**Reading shelf** (`practice/reading.html`): book entries live in
`practice/data/reading.json` and are rendered by `practice/js/render-reading.js`
inside the page's fixed visual layout. Use Website Manager's Reading screen to
add, edit, remove, or reorder books without editing the page markup.

**Elsewhere** (`elsewhere.html`): a plain hand-edited page, no config.

## Writing style

`STYLE.md` carries one hard rule: no em dashes in visible copy, with verbatim
quotation exempt. `.github/workflows/no-em-dash.yml` checks every push to
`main` and fails the run if it finds one. It reports only. It does not edit
your writing, so when it fails, fix the line yourself and push again.

## Notes

- Every photograph on the site is one of Faisal's own, in
  `photography/photos/<album-slug>/`. There are no placeholder images.
- Photos are served through Cloudflare's image resizing, so the originals in
  `photos/` are never touched. `photography/js/image-url.js` rewrites each
  request through `/cdn-cgi/image/`, which resizes and re-encodes to AVIF or
  WebP depending on the browser. This needs Image Resizing switched on for the
  zone in the Cloudflare dashboard. If it is ever turned off, those requests
  404 and no photograph loads.
- The design is deliberately quiet. The Photography page is a light folio:
  warm off-white ground, one centred 820px column, photographs sitting
  directly on the paper with no border, card or shadow. Hovering one draws
  a thin accent line just outside the frame; the photograph itself is never
  altered.
- Black and white is the default. Colour is a per-photograph decision (the
  `color` field in `photos.json`), used where the colour is the point.

## Before pushing changes live

There's no build step, so changes go live immediately. Before pushing:

1. Serve the repository on localhost and open changed pages in a browser. A
   local server is required because browsers do not fetch JSON from `file:`
   pages.
2. Run `python3 tools/validate-site.py`. It performs the same read-only
   whole-site validation used by Website Manager and GitHub Actions, including
   Photography data, public links and assets, metadata, language pairs,
   structured data, cache versions, and declared renderer dependencies.
3. Commit and push.
