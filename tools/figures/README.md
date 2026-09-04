# Meditation figure sources

FH's eight drawings for the meditation instruction sheets, and the two
small scripts that turn them into the PNGs in
`practice/images/meditation/`. Nothing here is served to visitors.

`sources/` holds the drawings as supplied, JPEG on an off-white ground.
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

`sources/prostration-sheet-1.jpg` to `-3.jpg` are the three step sheets the
Sirimangalo team sent FH, showing every position of one prostration. They are
used with their permission, and are credited on the pages that show them.

`cut-prostration-plates.py` cuts them into the 41 plates in
`practice/images/prostration/`: kneeling A and B, then `step-01` to
`step-39`. It finds the panels by their pale blue ground, which leaves the
English caption under each panel behind, and drops the dark frame that the
panels on sheet 2 carry. The drawings themselves are untouched. The noting
word is set as HTML text on the page instead, which is what lets one set of
images serve both the English and the Dutch page.

`../build-prostration-steps.py` writes the two step-by-step pages from
`../prostration-steps-data.py`, where the noting word and the description of
each position live in both languages. Edit the wording there, not in the
HTML, and rerun it.
