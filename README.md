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
  index.html            → album grid homepage
  album.html            → displays one album's photos
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

## 3. Add your own albums

Everything lives in one file: `photography/js/config.js`. You do not need to
touch any other file to add, remove, or edit albums.

To add a new album:
1. Make a new folder inside `photography/photos/`, named after your album,
   e.g. `photography/photos/summer-in-paramaribo/` — lowercase, hyphens
   instead of spaces.
2. Put your photo files in that folder. Keep them resized to around 2000px
   on the long edge before uploading, so the site stays fast and GitHub
   doesn't reject them for being too large.
3. Open `photography/js/config.js` in any text editor, copy the existing
   `{ ... }` block (the "first-roll" one), and edit it:
   - `slug`: the folder name you just made
   - `title`: the name shown on the site
   - `photos`: list each filename, like `"photos/summer-in-paramaribo/01.jpg"`
4. Save the file, upload the changed files to GitHub — the live site updates
   automatically.

To remove an album, delete its block from `config.js`.
To reorder albums, reorder the blocks — they appear on the homepage in that order.

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

## 5. Sharing an album

Every album has its own link, for example:
`https://faisalhenar.com/photography/album.html?a=first-roll`

Anyone with that link can view that album directly — you don't need to
share the whole homepage. The `a=` part matches the album's `slug` in
`config.js`.

## Notes

- Every photograph on the site is one of Faisal's own, in
  `photography/photos/<album-slug>/`. There are no placeholder images.
- Photos are served through Cloudflare's image resizing, so the originals in
  `photos/` are never touched. `photography/js/image-url.js` rewrites each
  request through `/cdn-cgi/image/`, which resizes and re-encodes to AVIF or
  WebP depending on the browser. This needs Image Resizing switched on for the
  zone in the Cloudflare dashboard. If it is ever turned off, those requests
  404 and no photograph loads.
- The design is deliberately quiet: black background, one warm accent color,
  photos numbered like frames on a contact sheet — built primarily around
  black and white work, with color used where an album calls for it (see
  the `color` field in `config.js`).

## Before pushing changes live

There's no build step, so changes go live immediately. Before pushing:

1. Open changed pages locally and verify they display correctly.
2. If you changed `config.js`, check file paths match real filenames (typos fail silently).
3. Commit and push.
