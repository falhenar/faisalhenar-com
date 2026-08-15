/*
  THE PHOTOGRAPHY PAGE
  --------------------
  Renders both halves of photography/index.html: the curated Exhibition
  (from EXHIBITION in config.js) and, beneath it, the Index (every
  photograph in PHOTOS, newest first). One viewer serves both; the only
  difference between them is which ordered set it is handed.

  Layout is entirely CSS (see the folio block in css/style.css). This
  file decides grouping and order, and sets exactly one geometric value:
  each frame's share of a shared row, which is its aspect ratio. Nothing
  here measures the page, positions anything, or reads the viewport.
*/
(function () {
  const exhibitionEl = document.getElementById('exhibition');
  const indexEl = document.getElementById('index-grid');
  if (typeof PHOTOS === 'undefined' || typeof EXHIBITION === 'undefined') return;

  /*
    Requested source widths. The Exhibition column is 820px, so a
    full-width frame displays at 820, a narrow one near 510, and half of
    a shared row near 400. Asking Cloudflare for roughly 1.4x the display
    width keeps the photograph sharp on a 2x screen without pulling a
    2000px original for something shown at 400. The viewer always gets
    the large version.
  */
  const SRC_WIDTH = { single: 1200, narrow: 760, shared: 620, thumb: 320, viewer: 2000 };

  // natural: keep the photograph's own proportions (the Exhibition). The
  // Index passes false and lets its CSS hold every cell to one shape.
  function buildFrame(id, srcWidth, grow, eager, natural) {
    const p = PHOTOS[id];

    const img = document.createElement('img');
    img.src = cfImage(p.src, srcWidth);
    img.alt = p.alt;
    img.width = p.w;
    img.height = p.h;
    // Reserves each photograph's real proportions before it loads, so
    // nothing moves as images stream in. No photograph is cropped here.
    if (natural) img.style.aspectRatio = p.w + ' / ' + p.h;
    img.setAttribute('decoding', 'async');
    img.setAttribute('loading', eager ? 'eager' : 'lazy');
    if (p.color) img.classList.add('is-color');

    const button = document.createElement('button');
    button.type = 'button';
    button.appendChild(img);

    const figure = document.createElement('figure');
    figure.className = 'frame';
    // A shared row divides itself by the photographs' own shapes: with
    // flex-basis 0 and flex-grow set to the aspect ratio, the widths come
    // out in proportion to the ratios, which is the same as saying both
    // photographs end up the same height. See css/style.css.
    if (grow) figure.style.setProperty('--grow', grow);
    figure.appendChild(button);

    return { figure: figure, button: button };
  }

  /* ---------- the Exhibition ---------- */

  const exhibitionOrder = [];
  const exhibitionRows = [];

  EXHIBITION.forEach(function (entry) {
    const ids = (entry && entry.row ? entry.row : []).filter(function (id) { return !!PHOTOS[id]; });
    if (!ids.length) return;
    const indexes = ids.map(function (id) { exhibitionOrder.push(id); return exhibitionOrder.length - 1; });
    exhibitionRows.push({ ids: ids, indexes: indexes, entry: entry });
  });

  if (!exhibitionOrder.length) return;

  const exhibitionItems = exhibitionOrder.map(function (id) {
    const p = PHOTOS[id];
    return { url: cfImage(p.src, SRC_WIDTH.viewer), alt: p.alt, color: !!p.color };
  });

  /* ---------- the Index ----------
     Every photograph in the collection, newest first. The Exhibition is
     a selection and says nothing about when a photograph arrived; the
     Index is the whole thing and is ordered by "added" so a returning
     visitor can see what is new without a "recent" section intruding on
     the sequence above. Ties keep their order in PHOTOS, which is
     stable, so the grid never reshuffles between loads. */
  const indexOrder = Object.keys(PHOTOS).sort(function (a, b) {
    const da = PHOTOS[a].added || '';
    const db = PHOTOS[b].added || '';
    if (da === db) return 0;
    return da < db ? 1 : -1;
  });

  const indexItems = indexOrder.map(function (id) {
    const p = PHOTOS[id];
    return { url: cfImage(p.src, SRC_WIDTH.viewer), alt: p.alt, color: !!p.color };
  });

  /* ---------- one viewer, two sets ---------- */

  let viewer = null;
  if (typeof createPhotoViewer === 'function') {
    viewer = createPhotoViewer({
      root: document.getElementById('lightbox'),
      stage: document.getElementById('lightbox-stage'),
      img: document.getElementById('lightbox-img'),
      closeBtn: document.getElementById('lightbox-close'),
      prevBtn: document.getElementById('lightbox-prev'),
      nextBtn: document.getElementById('lightbox-next'),
      fsBtn: document.getElementById('lightbox-fullscreen')
      // No captionEl and no onBoundary: the viewer shows the photograph
      // and close/previous/next only, and paging stops at either end of
      // whichever set it was opened with.
    });
  }

  function opener(items, i, button) {
    return function () {
      if (viewer) viewer.open(items, i, button);
    };
  }

  /* ---------- print the Exhibition ---------- */

  exhibitionRows.forEach(function (row, rowIndex) {
    const entry = row.entry;
    const shared = row.ids.length > 1;

    const el = document.createElement('div');
    el.className = 'row';
    if (!shared) el.classList.add(entry.width === 'narrow' ? 'row--narrow' : 'row--single');
    if (entry.turn) el.classList.add('row--turn');

    const srcWidth = shared ? SRC_WIDTH.shared
      : (entry.width === 'narrow' ? SRC_WIDTH.narrow : SRC_WIDTH.single);

    row.ids.forEach(function (id, i) {
      const p = PHOTOS[id];
      // Aspect ratio, optionally nudged by config so one photograph in a
      // shared row carries a little more of it. Only the ratio between
      // the two values matters.
      const weight = (entry.weight && entry.weight[i]) || 1;
      const grow = shared ? ((p.w / p.h) * weight).toFixed(4) : null;

      const built = buildFrame(id, srcWidth, grow, rowIndex === 0, true);
      built.button.setAttribute(
        'aria-label',
        'Open photograph, ' + (row.indexes[i] + 1) + ' of ' + exhibitionOrder.length
      );
      built.button.addEventListener('click', opener(exhibitionItems, row.indexes[i], built.button));
      el.appendChild(built.figure);
    });

    exhibitionEl.appendChild(el);
  });

  /* ---------- print the Index ---------- */

  if (indexEl) {
    indexOrder.forEach(function (id, i) {
      const built = buildFrame(id, SRC_WIDTH.thumb, null, false, false);
      built.button.setAttribute(
        'aria-label',
        'Open photograph, ' + (i + 1) + ' of ' + indexOrder.length + ' in the index'
      );
      built.button.addEventListener('click', opener(indexItems, i, built.button));
      // The grid styles the button directly; the figure wrapper the
      // Exhibition needs would only add a box here.
      indexEl.appendChild(built.button);
    });

    const countEl = document.getElementById('index-count');
    if (countEl) countEl.textContent = indexOrder.length + ' photographs';
  }
})();
