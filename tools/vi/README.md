# Vietnamese practice pages (draft)

`build_vi_pages.py` writes the four Vietnamese meditation pages from the English pages:
`practice/sitting-meditation-vi.html`, `walking-meditation-vi.html`, `mindful-prostration-vi.html`
and `mindful-prostration-steps-vi.html`. Do not edit those by hand. Change the wording here, then run

    python3 tools/vi/build_vi_pages.py

- `instructions-en.json` / `instructions-vi.json` are copies of the Sati Timer app's
  `app/src/main/assets/instructions*.json`. The app and the site share one text. After the
  Vietnamese review, fix the app's file, copy it here again, and rebuild.
- `vi_data.py` holds everything else: page titles, image descriptions, the 41 prostration
  plates (word + description), and the draft note.
- The script stops if a block of the sheet text can't be found in the English page, and lists any
  English left on a page. So when an English page changes, rerun it and it will tell you.

**Status (October 2026): unlisted drafts.** They carry `noindex`, have no hreflang, are not
linked from the English or Dutch pages, the hub or the sitemap, and say "Bản nháp" on the page.
To publish after the review: drop the noindex and the draft note in the builder, add hreflang
and "Also available in Vietnamese" links on the English and Dutch pages, add them to the
sitemap, and make the PDFs.

Figures: `tools/figures/build_vi.py` makes the `-vi.png` diagrams the same way `build_nl.py` does.
Fonts: Inter, Lora and IBM Plex Mono have a `vietnamese` subset in /fonts (see fonts/LICENSE.md).
