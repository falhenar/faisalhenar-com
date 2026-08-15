/*
  PHOTOGRAPHY DATA
  ----------------
  This file has three parts, in order:

  1. PHOTOS      - every photograph the site knows about. The single
                    source of truth: source path, size, colour treatment,
                    alt text, and the date it was added.
  2. EXHIBITION  - the curated, hand-ordered sequence for the main
                    Photography page (photography/index.html), rendered
                    by js/render-exhibition.js.
  3. ALBUMS      - album.html still runs on this shape, kept around while
                    the old album pages remain live alongside the new
                    Exhibition. Rather than keep a second copy of every
                    photo's data, ALBUMS is built automatically from
                    PHOTOS + ALBUM_META below, each time the page loads.
                    Edit PHOTOS and ALBUM_META; never edit ALBUMS by hand.

  Stage 4 retires ALBUM_META and this adapter, once the Index page also
  exists and album.html is retired.
*/

/*
  1. PHOTOS
  ---------
  One entry per photograph, keyed by a short stable id. The id is what
  EXHIBITION (and, later, ALBUM_META) uses to refer to a photo, so it
  must never change once a photo has one, even if the photo is moved,
  resequenced, or renamed on disk.

  id      -> short, human-editable, stable. Prefixes so far: "vn" for the
             first (black & white) Vietnam roll, "vc" for the colour
             Vietnam roll, "sr" for Suriname. Two-digit sequence within
             each prefix. Pick a new short prefix for a new place or roll.
  src     -> path to the file inside photos/, same as before.
  w, h    -> intrinsic pixel dimensions of the original file. Used so a
             future layout can reserve the right space and preserve each
             photo's real proportions without a layout shift. See the
             note at the bottom of this file for how these were measured
             and how to fill them in for a new photo.
  color   -> true shows the photo in its original colour; false applies
             the site's black & white treatment. Same meaning as the old
             per-album "color" flag, now per photo.
  alt     -> a plain, factual description of what is in the frame.
             Everything below was written by looking at the photograph,
             not by the photographer, and is marked TEMP ALT below for
             that reason. Replace TEMP ALT entries with the photographer's
             own description when there's time; nothing depends on the
             marker itself, it is a note for a human, not code.
  added   -> the date this photo entered the collection, used later to
             sort the Index newest-first. See the dating note below.
*/

const PHOTOS = {
  // --- Vietnam Streets (black & white) -------------------------------
  "vn-01": {
    src: "photos/first-roll/P6030666.jpg",
    w: 1350, h: 1800, color: false,
    alt: "Black and white photograph of a man reading a book at a cafe table, a standing fan and bookshelves behind him.", // TEMP ALT
    added: "2026-07-28"
  },
  "vn-02": {
    src: "photos/first-roll/P6241167.jpg",
    w: 1800, h: 1350, color: false,
    alt: "Black and white photograph of a man standing by a gate with a house number sign reading 47 Au Co, palm trees behind him.", // TEMP ALT
    added: "2026-07-28"
  },
  "vn-03": {
    src: "photos/first-roll/P6271115.jpg",
    w: 1800, h: 1350, color: false,
    alt: "Black and white photograph of two young men fishing from a riverside promenade, boats moored across the water.", // TEMP ALT
    added: "2026-07-28"
  },
  "vn-04": {
    src: "photos/first-roll/P6281299.jpg",
    w: 1800, h: 1350, color: false,
    alt: "Black and white photograph of a woman in a knitted hat grilling meat on a street-side barbecue, smoke rising.", // TEMP ALT
    added: "2026-07-28"
  },
  "vn-05": {
    src: "photos/first-roll/P6281389.jpg",
    w: 1800, h: 1350, color: false,
    alt: "Black and white photograph of a woman in a conical hat laughing beside a market cart piled with vegetables.", // TEMP ALT
    added: "2026-07-28"
  },
  "vn-06": {
    src: "photos/first-roll/P6281404.jpg",
    w: 1800, h: 1350, color: false,
    alt: "Black and white photograph of a man crouched beside baskets of oranges at a market, a cigarette in his mouth.", // TEMP ALT
    added: "2026-07-28"
  },
  "vn-07": {
    src: "photos/first-roll/P6301905.jpg",
    w: 1350, h: 1800, color: false,
    alt: "Black and white photograph of two women with their hair in buns, standing close together in low light.", // TEMP ALT
    added: "2026-07-28"
  },
  "vn-08": {
    src: "photos/first-roll/P6301922.jpg",
    w: 1800, h: 1350, color: false,
    alt: "Black and white photograph of four men sitting outside a shop, one wearing a painted mask, another making a hand gesture.", // TEMP ALT
    added: "2026-07-28"
  },
  "vn-09": {
    src: "photos/first-roll/P6271096.jpg",
    w: 2000, h: 1500, color: false,
    alt: "Black and white photograph of an older man sitting on a doorstep in a narrow alley, a pho restaurant sign behind him.", // TEMP ALT
    added: "2026-08-05"
  },

  // --- Vietnam Streets, in Color --------------------------------------
  "vc-01": {
    src: "photos/vietnam-streets-color/P6050611.jpg",
    w: 2000, h: 1500, color: true,
    alt: "Color photograph of two men on motorbikes stopped beside a street food cart, under a red PHOTO shop sign.", // TEMP ALT
    added: "2026-07-29"
  },
  "vc-02": {
    src: "photos/vietnam-streets-color/P6080541.jpg",
    w: 2000, h: 1500, color: true,
    alt: "Color photograph of a shirtless man pulling a checked shirt over his head, seen through a market doorway.", // TEMP ALT
    added: "2026-07-29"
  },
  "vc-03": {
    src: "photos/vietnam-streets-color/P6080906.jpg",
    w: 2000, h: 1500, color: true,
    alt: "Color photograph of roadside drink and noodle stalls under palm trees, a Vietnamese flag flying above.", // TEMP ALT
    added: "2026-07-29"
  },
  "vc-04": {
    src: "photos/vietnam-streets-color/P6080910.jpg",
    w: 2000, h: 1500, color: true,
    alt: "Color photograph of a boy, a man and a woman in a conical hat talking on a street, a white rooster perched on a covered cart behind them.", // TEMP ALT
    added: "2026-07-29"
  },
  "vc-05": {
    src: "photos/vietnam-streets-color/P6250883.jpg",
    w: 2000, h: 1500, color: true,
    alt: "Color photograph of a man standing on a beach under a large umbrella, a striped deck chair beside him.", // TEMP ALT
    added: "2026-07-29"
  },
  "vc-06": {
    src: "photos/vietnam-streets-color/P6271105.jpg",
    w: 2000, h: 1500, color: true,
    alt: "Color photograph of moored fishing boats strung with small Vietnamese flags, two people working on deck.", // TEMP ALT
    added: "2026-07-29"
  },

  // --- Suriname Streets -------------------------------------------------
  "sr-01": {
    src: "photos/suriname-streets/P7231377.jpg",
    w: 1440, h: 1080, color: false,
    alt: "Black and white photograph of a woman in a headwrap crossing a street at dusk, motorbikes passing on either side.", // TEMP ALT
    added: "2026-07-31"
  },
  "sr-02": {
    src: "photos/suriname-streets/P7231325.jpg",
    w: 1440, h: 1080, color: false,
    alt: "Black and white photograph of passengers stepping off a small ferry onto a muddy riverbank.", // TEMP ALT
    added: "2026-07-31"
  },
  "sr-03": {
    src: "photos/suriname-streets/P7231351.jpg",
    w: 1440, h: 1080, color: false,
    alt: "Black and white photograph of two women walking past each other on a street, one glancing back over her shoulder.", // TEMP ALT
    added: "2026-07-31"
  },
  "sr-04": {
    src: "photos/suriname-streets/P7231574.jpg",
    w: 1440, h: 1080, color: false,
    alt: "Black and white photograph of a woman wearing headphones walking past a pharmacy sign reading Apotheek Esculaap.", // TEMP ALT
    added: "2026-07-31"
  },
  "sr-05": {
    src: "photos/suriname-streets/P7231379.jpg",
    w: 1440, h: 1080, color: false,
    alt: "Black and white photograph of a man sitting on a chair outside a shopfront, another man walking toward the camera.", // TEMP ALT
    added: "2026-07-31"
  },
  "sr-06": {
    src: "photos/suriname-streets/P7231561.jpg",
    w: 1440, h: 1080, color: false,
    alt: "Black and white photograph of a woman under a large black umbrella on a sunlit street.", // TEMP ALT
    added: "2026-07-31"
  },
  "sr-07": {
    src: "photos/suriname-streets/P7231512.jpg",
    w: 1440, h: 1080, color: false,
    alt: "Black and white photograph of women walking through an outdoor market between rows of covered stalls.", // TEMP ALT
    added: "2026-07-31"
  },
  "sr-08": {
    src: "photos/suriname-streets/Busses20260723.jpg",
    w: 2000, h: 1500, color: false,
    alt: "Black and white photograph of minibuses queued on a street, backlit by low morning sun.", // TEMP ALT
    added: "2026-08-05"
  },
  "sr-09": {
    src: "photos/suriname-streets/Kwatta-markt20260805-01.jpg",
    w: 2000, h: 1500, color: false,
    alt: "Black and white photograph of two women talking across a market stall piled with coconuts and vegetables.", // TEMP ALT
    added: "2026-08-05"
  },
  "sr-10": {
    src: "photos/suriname-streets/kwattamarkt20260805-2.jpg",
    w: 2000, h: 1500, color: false,
    alt: "Black and white photograph of shoppers at a market stall, a child peeking over a pile of chili peppers.", // TEMP ALT
    added: "2026-08-05"
  },
  "sr-11": {
    src: "photos/suriname-streets/P8091370 (Groot).jpg",
    w: 1440, h: 1080, color: false,
    alt: "Black and white photograph of a horse statue on a wooded mound in a park, people resting on a bench below.", // TEMP ALT
    added: "2026-08-15"
  },
  "sr-12": {
    src: "photos/suriname-streets/P8091271 (Groot).jpg",
    w: 1440, h: 1080, color: false,
    alt: "Black and white photograph of a girl looking at her phone at a market stall, a woman with a tray of goods beside her.", // TEMP ALT
    added: "2026-08-15"
  }
};

/*
  How w/h were filled in for these 27: read directly from each original
  file's own pixel dimensions (Python's Pillow, one pass over photos/).
  For a new photo, do the same before adding it here: open the original
  file's properties (Preview, Finder "Get Info", or any image tool) and
  copy its width and height in pixels. No build step reads this
  automatically; it is one extra pair of numbers per photo, not
  meaningfully different from typing the file name.

  How "added" was filled in: these photos predate this field, so there
  was no author-recorded addition date to use. The best available signal
  was the date each file was first committed to the site's git history,
  which is what is used above (date only, no time). That is a real,
  checkable date, just not necessarily the date the photo was taken or
  chosen; EXIF capture dates on the first-roll files, for comparison, run
  about three to six weeks earlier. Going forward, set "added" to the
  actual day you add a new photo to this file.
*/

/*
  2. EXHIBITION
  -------------
  The curated sequence on photography/index.html, rendered by
  js/render-exhibition.js.

  The Exhibition is 15 of the 27 photographs, in a hand-chosen order,
  following a manual review of the full collection. It was 23 until a
  second pass cut it back: a sequence a reader finishes is worth more
  than a sequence that shows everything. vn-03, vn-06, vn-07, vn-08,
  vc-06, sr-01, sr-03, sr-05, sr-07, sr-08, sr-09 and sr-10 are
  deliberately not listed below. They stay in PHOTOS, so they still
  appear in the Index and in the legacy albums; they are just not part
  of this particular sequence.

  THE ROW GRAMMAR

  The page is one centred column, and the only unit is a row. A row holds
  one photograph or two, and there is nothing else to configure: no
  per-photograph size, no left/right offset, no spacing vocabulary. The
  earlier "duo / plate / size / align / space" model is gone, along with
  the dark field it was designed for.

    { row: ["id"] }              one photograph across the full column.
                                 Use it where a photograph earns the
                                 presence; it is the tallest thing the
                                 page can do.

    { row: ["id"],
      width: "narrow" }          one photograph at about 62% of the
                                 column, centred. A pause. Used sparingly.

    { row: ["idA", "idB"] }      two photographs sharing the row, left to
                                 right in reading order. Their widths come
                                 from their own proportions, so both end
                                 up the same height and neither is
                                 cropped. A landscape next to a portrait
                                 lands near 64/36 by itself.

  Two optional flags, both rare:

    weight: [a, b]               multiplies each photograph's share of a
                                 two-photograph row. Keep it near 1. Used
                                 once, so vc-05 carries its row.
    turn: true                   a slightly longer pause above this row.
                                 Used exactly twice, at the two points
                                 where the sequence changes register.

  MOVEMENTS (not labelled on the page; they only guide the sequence)
    I     Vietnam, monochrome    vn-01, vn-02, vn-09, vn-04, vn-05
    II    Vietnam, colour        vc-01 .. vc-05
    III   Suriname, monochrome   sr-02, sr-04, sr-06, sr-12, sr-11

  Five photographs each. That is a consequence of the edit rather than a
  rule, and nothing on the page announces it.

  Ten rows: five shared, three full-column singles, one narrow single,
  and one full-column single opening each of the last two movements. The
  sequence opens on a shared row and closes on sr-11 alone, narrow and
  centred.
*/

const EXHIBITION = [
  // I. Vietnam, monochrome. vn-01 and vn-02 open in conversation; vn-09
  // takes the room to itself; vn-04 and vn-05 close the movement together.
  { row: ["vn-01", "vn-02"] },
  { row: ["vn-09"] },
  { row: ["vn-04", "vn-05"] },

  // II. Colour. vc-01 announces the change alone.
  { row: ["vc-01"], turn: true },
  { row: ["vc-02", "vc-03"] },
  { row: ["vc-04", "vc-05"], weight: [1, 1.25] },

  // III. Suriname, back to monochrome. sr-12 stands alone before the
  // ending, and sr-11 closes the sequence on its own, narrow.
  { row: ["sr-02"], turn: true },
  { row: ["sr-04", "sr-06"] },
  { row: ["sr-12"] },
  { row: ["sr-11"], width: "narrow" }
];

/*
  3. ALBUMS (compatibility layer for the current site)
  -----------------------------------------------------
  album.html and the photography index still expect an ALBUMS array
  shaped like { slug, title, color, photos: [srcPaths] }, with an
  optional per-album alt fallback. ALBUM_META below records only what
  albums add on top of PHOTOS: which photos belong to the album, in
  what order, and the album's slug/title. The adapter beneath it builds
  the exact ALBUMS shape the existing render-home.js and render-album.js
  already read, resolving each id against PHOTOS. This is deliberately
  the only place photo ids turn back into full photo objects for the
  old pages, so PHOTOS stays the single source of truth: nothing here
  duplicates a src, a dimension, or an alt text, it only looks them up.

  This whole section is temporary. It goes away in Stage 4, when
  album.html is retired.
*/

const ALBUM_META = [
  { slug: "first-roll", title: "Vietnam Streets",
    photos: ["vn-01", "vn-02", "vn-03", "vn-04", "vn-05", "vn-06", "vn-07", "vn-08", "vn-09"] },
  { slug: "vietnam-streets-color", title: "Vietnam Streets, in Color",
    photos: ["vc-01", "vc-02", "vc-03", "vc-04", "vc-05", "vc-06"] },
  { slug: "suriname-streets", title: "Suriname Streets",
    photos: ["sr-01", "sr-02", "sr-03", "sr-04", "sr-05", "sr-06", "sr-07", "sr-08", "sr-09", "sr-10", "sr-11", "sr-12"] }
];

const ALBUMS = ALBUM_META.map(function (meta) {
  const photoIds = meta.photos;
  const photoObjs = photoIds.map(function (id) { return PHOTOS[id]; });
  return {
    slug: meta.slug,
    title: meta.title,
    // Every photo in a given album currently shares one colour treatment,
    // so the first photo's value stands for the whole album, matching the
    // old per-album "color" flag exactly.
    color: !!(photoObjs[0] && photoObjs[0].color),
    photos: photoObjs.map(function (p) { return p.src; }),
    // Per-photo alt, same length and order as "photos", so the renderers
    // can show each photo's own description instead of one album-wide
    // fallback. render-home.js and render-album.js fall back to the old
    // title-based text if this is ever missing for some reason.
    photoAlts: photoObjs.map(function (p) { return p.alt; })
  };
});
