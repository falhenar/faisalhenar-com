# faisalhenar.com — setup guide

This is a plain HTML/CSS/JS site. No build tools, no installs needed.

## How the site is organized

```
index.html            → the homepage (front door to everything)
css/hub.css            → homepage styling

photography/           → the photography section
  index.html            → album grid homepage
  album.html            → displays one album's photos
  css/, js/, photos/    → styling, logic, and your photo files

practice/               → the Buddhism/practice section
  index.html            → hub linking to the five rooms
  reflections.html, reading.html, listening.html, watching.html, places.html
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
2. On Namecheap's DNS settings, add:
   - Four **A records** (`@`) → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - One **CNAME record** (`www`) → `yourusername.github.io`
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

## 4. Sharing an album

Every album has its own link, for example:
`https://faisalhenar.com/photography/album.html?a=first-roll`

Anyone with that link can view that album directly — you don't need to
share the whole homepage. The `a=` part matches the album's `slug` in
`config.js`.

## Notes

- The placeholder photos are pulled from picsum.photos so you can preview the
  layout. Replace them with your own photos in `photos/` and update the
  `photos` array in `config.js` to point at your files instead.
- The design is deliberately quiet: black background, one warm accent color,
  photos numbered like frames on a contact sheet — built primarily around
  black and white work, with color used where an album calls for it (see
  the `color` field in `config.js`).

## Before pushing changes live

There's no build step, so changes go live immediately. Before pushing:

1. Open changed pages locally and verify they display correctly.
2. If you changed `config.js`, check file paths match real filenames (typos fail silently).
3. Commit and push.
