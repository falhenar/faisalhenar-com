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

## 1. Put it on GitHub Pages (free hosting)

1. Create a repository named `faisalhenar-com` and upload all files.
2. Go to **Settings → Pages**.
3. Under "Source", choose the `main` branch and `/ (root)`, then Save.
4. GitHub provides a live link (takes 1–2 minutes to appear).

## 2. Connect your domain (faisalhenar.com)

1. In the same repo, go to **Settings → Pages → Custom domain**, enter `faisalhenar.com`, and save.
   This creates a `CNAME` file in the repo automatically — leave it, deleting it breaks the domain.
2. DNS for this site is hosted at Cloudflare, not the registrar. If you're
   setting this up fresh: point your domain's nameservers at Cloudflare,
   then in the Cloudflare dashboard add:
   - Four **A records** (`@`) → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - One **CNAME record** (`www`) → `yourusername.github.io`
   (Namecheap, or whoever you registered through, only handles registration
   once the nameservers point elsewhere — its DNS panel won't reflect
   anything after that.)
3. DNS activates in a few hours. Then tick **"Enforce HTTPS"** in GitHub Pages settings.

## 3. Add photographs

Everything lives in one file: `photography/js/config.js`. You do not need to
touch any other file to add or remove a photograph.

### How the Photography page is built

It is one page with two halves, and they answer different questions.

- **The Exhibition** is a curated sequence: a selection, hand-ordered, most
  of the collection deliberately left out. It comes from `EXHIBITION`.
- **The Index** below it is the whole collection, newest first. It needs no
  list of its own; it is every entry in `PHOTOS`, sorted by `added`.

So a new photograph appears in the Index automatically. It joins the
Exhibition only if you decide it belongs there.

### The three lists in `config.js`

- **`PHOTOS`** — one entry per photograph, keyed by a short stable id
  (`vn-01`, `sr-12`). The id is how the other lists refer to it, so it
  never changes once given, even if the file is moved or renamed.
- **`EXHIBITION`** — the curated sequence, written as rows. See below.

### To add a photograph

1. Resize it to around 2000px on the long edge, and put it in a folder
   under `photography/photos/` — lowercase, hyphens instead of spaces.
2. Add an entry to `PHOTOS`:

   ```js
   "sr-13": {
     src: "photos/suriname-streets/P8091402.jpg",
     w: 2000, h: 1500, color: false,
     alt: "A plain description of what is in the frame.",
     added: "2026-08-20"
   },
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
   If it does, add it to a row in `EXHIBITION` at the point in the
   sequence where it belongs.

### The Exhibition rows

The page is one centred column and the only unit is a row. There are three
kinds, and nothing else to configure:

```js
{ row: ["sr-04", "sr-06"] }          // two photographs sharing one row
{ row: ["sr-12"] }                   // one, full column width
{ row: ["sr-11"], width: "narrow" }  // one, ~62% and centred. A pause.
```

Two flags, both rare: `weight: [1, 1.25]` nudges one photograph's share of
a shared row, and `turn: true` puts a longer pause above a row where the
sequence changes register.

A shared row divides itself by the photographs' own proportions, so both
end up the same height and neither is cropped. You do not choose widths.

To remove a photograph from the sequence, take its id out of `EXHIBITION`.
It stays in `PHOTOS`, so it remains in the Index. Deleting the `PHOTOS`
entry removes it from the site entirely.

## 4. Adding reflections and quotes

Same idea as albums — one config file each, no code to touch.

**Reflections** (the Practice → Reflections room):
`practice/js/suttas-config.js`. Each entry is a sutta reading with an
optional excerpt and your own `note`. An entry only appears on the site
once `note` is filled in — leave it empty to queue a reading without
publishing it yet. Order on the page follows the order you *wrote* notes
in, not the order entries sit in the file.

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
  `color` field in `config.js`), used where the colour is the point.

## Before pushing changes live

There's no build step, so changes go live immediately. Before pushing:

1. Open changed pages locally and verify they display correctly.
2. If you changed `config.js`, check file paths match real filenames (typos fail silently).
3. Commit and push.
