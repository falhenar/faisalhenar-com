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
  index.html
  css/
```

Each section (photography, practice) is self-contained — its own css/js/photos
live inside its own folder. The homepage just links out to each one.

## 1. Put it on GitHub Pages (free hosting)

1. Go to github.com and create a free account if you don't have one.
2. Create a new repository. Name it exactly: `faisalhenar-com` (or anything you like).
3. Upload all the files/folders from this project into that repository
   (there's an "Add file → Upload files" button on the repo page — you can
   drag the whole folder in).
4. In the repository, go to **Settings → Pages**.
5. Under "Source", choose the `main` branch and `/ (root)`, then Save.
6. GitHub will give you a link like `https://yourusername.github.io/faisalhenar-com`
   — that's your site, live. It can take a minute or two to appear.

## 2. Connect your domain (faisalhenar.com)

1. In the same repo, go to **Settings → Pages → Custom domain**, and type
   `faisalhenar.com`. Save.
2. This creates a file called `CNAME` in your repo automatically — leave it.
3. Go to where you bought the domain (Namecheap) → your domain's **DNS settings**.
4. Add these records (Namecheap calls this "Advanced DNS"):
   - Four **A records**, host `@`, pointing to:
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
   - One **CNAME record**, host `www`, pointing to `yourusername.github.io`
5. DNS changes can take up to a few hours to fully activate. Once it does,
   back in GitHub Pages settings, tick **"Enforce HTTPS"** so your site loads
   securely (padlock icon).

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
  photos numbered like frames on a contact sheet — built around black and
  white work.

## Before pushing changes live

There's no build step or CI, so whatever you push to `main` is live within a
minute or two. Before running `git push`:

1. Open the changed page(s) locally in a browser (double-click the .html
   file, or use a local server) — check it actually looks right.
2. If you changed `config.js` (added a photo/album), double-check the file
   paths match real filenames — a typo here fails silently (broken image,
   not an error).
3. Then commit and push.
