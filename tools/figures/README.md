# Meditation figure sources

FH's eight drawings for the meditation instruction sheets, and the two
small scripts that turn them into the PNGs in
`practice/images/meditation/`. Nothing here is served to visitors.

`sources/` holds the drawings as supplied, on an off-white ground. The
originals are JPEG; FH's October 2026 redraws are PNG (`sit-posture.png`,
`sit-chair.png`, `walk-stand.png`). The build scripts take the PNG when one
exists, and pad the translated `sit-posture` and `walk-stand` to the English
size so every language shows at the same scale.
**Do not redraw them.** If a sheet needs a new figure, ask FH.

- `proc.py` makes the transparent PNG: alpha from darkness (white above
  236 goes fully transparent, so paper noise does not survive as grey
  haze), ink set to pure black, trimmed to the drawn content with a 12px
  margin. `python3 proc.py sources/sit-posture.jpg out.png` reproduces
  the committed English PNGs exactly.
- `build_nl.py` makes the Dutch figures. Seven of the eight drawings have
  English words inside the artwork. For each one it whites out the
  caption, measures the original lettering, and sets the Dutch wording in
  Patrick Hand (bundled here, SIL Open Font License), which matches the
  hand-lettered look of the originals. Run it from this directory; it
  writes the `-nl.png` files straight into `practice/images/meditation/`.
- `build_vi.py` makes the Vietnamese figures (`-vi.png`) the same way, reusing the
  rectangles from `build_nl.py`. The wording follows the Vietnamese sheets: `phồng` / `xẹp`,
  `quay lại`, `chạm`. Patrick Hand covers Vietnamese.
- `find_text.py` locates the text blocks in a drawing, which is how the
  rectangles in `build_nl.py` were found. Useful if a drawing is ever
  replaced and the coordinates move.

The Dutch wording follows the Dutch sheets: `rijzen` / `vallen`,
`keren`, `duimtoppen tegen elkaar`. Keep the two in step if either
changes. `sit-chair` carries no text, so the Dutch sheet uses the English
file.

After changing any figure, regenerate the affected PDFs. See
`claude/meditation-instruction-sheets.md` in the project for how.

## The prostration plates

Since October 2026 the 41 plates in `practice/images/prostration/` are FH's
own redraws of the whole sequence: kneeling A and B, then `step-01` to
`step-39`. His files are large, so they stay outside the repository, in
`C:\Dev\faisalhenar.com\Prostration redraws` (`prostration-redrawn-A.png`,
`-B.png`, `-01.png` ... `-39.png`). Steps 28 to 31 are the same drawings as 8
to 11, because the positions repeat on the way up.

`build-prostration-figures.py "<that folder>"` composes two figures on the
prostration sheet from the same redraws, in English, Dutch and Vietnamese:
`pros-kneel` (plates A and B) and `pros-three` (plates 7, 9 and 20), with
the labels set in Patrick Hand. `build_nl.py` and `build_vi.py` no longer
touch those two.

`build-prostration-plates.py "<that folder>"` makes the plates. It uses each
drawing as drawn: paper to transparent and line to the site's ink (the same
level curve as `proc.py`), one shared scale for all 41 so their relative
sizes hold, then each drawing centred in the 1056 x 882 frame and stood on a
common baseline. Output is a 16-level palette PNG, about 35 KB a plate.

The earlier plates were cut from the Sirimangalo step sheets and traced to
SVG line (`cut-prostration-plates.py`, `recolor_plates.py`, `tolines.py`,
`place_plates.py`, with the sheets in `sources/prostration-sheet-*.jpg`).
Those scripts are kept for the record and are no longer part of the build.
The noting word is set as HTML text on the page, not in the artwork, which
is what lets one set of images serve every language.

The two step-by-step pages (`practice/mindful-prostration-steps.html` and
`-nl.html`) are kept as pages, not generated: the noting word and the
description of each position are edited in the HTML itself, in both
languages. (The old builder, `build-prostration-steps.py`, and its data
file were retired with the Practice redesign in October 2026.)
