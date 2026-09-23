/*
  THE PHOTOGRAPHY EXHIBITION
  --------------------------
  Renders the curated Exhibition in photography/index.html from
  data/exhibition.json. The complete Index now has its own page. Paging
  forward from the eleventh photograph reaches a named ending, and going
  on from there into the rest of the collection is a deliberate answer
  to it rather than another press of Next.

  Layout is entirely CSS (see the folio block in css/style.css). This
  file decides grouping and order, and sets exactly one geometric value:
  each frame's share of a shared row, which is its aspect ratio. Nothing
  here measures the page, positions anything, or reads the viewport.
*/
function renderPhotography() {
  const exhibitionEl = document.getElementById('exhibition');
  if (typeof PHOTOS === 'undefined' || typeof EXHIBITION === 'undefined') {
    throw new Error('Photography data was not loaded.');
  }

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
  function buildFrame(id, srcWidth, grow, eager, natural, slot) {
    const p = PHOTOS[id];

    const img = document.createElement('img');
    img.src = cfImage(p.src, srcWidth);
    // srcWidth above is the fallback for a browser with no srcset support
    // and for local preview; everywhere else the pair below decides.
    if (slot) {
      const set = cfSrcset(p.src, slot.maxCss, p.w);
      if (set) {
        img.srcset = set;
        img.sizes = slot.sizes;
      }
    }
    img.alt = p.alt;
    img.width = p.w;
    img.height = p.h;
    // Reserves each photograph's real proportions before it loads, so
    // nothing moves as images stream in. No photograph is cropped here.
    if (natural) img.style.aspectRatio = p.w + ' / ' + p.h;
    img.setAttribute('decoding', 'async');
    img.setAttribute('loading', eager ? 'eager' : 'lazy');

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

  /*
    How wide a frame is actually drawn, written as the browser needs to
    hear it. The column is 820px with 32px of padding, so it is fluid
    between 620 and 884px of viewport and fixed above that; below 620 the
    rows stop sharing and every frame takes the whole column. `fraction`
    is the share of the row this frame holds: 1 for a single, 0.62 for a
    narrow one, and for a shared row the same proportion the flex-grow
    above gives it. These have to stay in step with the folio block in
    css/style.css.
  */
  function frameSlot(fraction, shared) {
    const g = shared ? 1 : 0;
    const f = fraction.toFixed(4);
    const wide = Math.round(fraction * (820 - 20 * g));
    return {
      sizes: [
        '(max-width: 480px) calc(100vw - 32px)',
        '(max-width: 620px) calc(100vw - 44px)',
        '(max-width: 720px) calc((100vw - ' + (44 + 14 * g) + 'px) * ' + f + ')',
        '(max-width: 884px) calc((100vw - ' + (64 + 20 * g) + 'px) * ' + f + ')',
        wide + 'px'
      ].join(', '),
      // The widest it is ever drawn is either its share of the full
      // column, or the whole column at the 620px stacking point, which
      // for a narrow or shared frame is the larger of the two.
      maxCss: Math.max(wide, 576)
    };
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
    return { url: cfImage(p.src, SRC_WIDTH.viewer), alt: p.alt };
  });

  /* ---------- the Index ----------
     Every photograph in the collection, in the approved sequence stored
     in photos.json. New photographs are placed first by default; the
     private manager can then refine the sequence deliberately.

     LOAD-BEARING: this relies on Object.keys returning the order the
     keys were inserted, which data-loader.js takes from the file order
     of photos.json. JavaScript guarantees that only for keys that are
     not integer-like strings: a key such as "42" would be hoisted to
     the front and silently reorder the public Index. Every id is
     fh-NNNN or a two-letter slug, so the guarantee holds. If the id
     format ever changes, replace this with an explicit array built
     while reading the file. */
  const indexOrder = Object.keys(PHOTOS);

  const indexLinkCountEl = document.getElementById('index-link-count');
  if (indexLinkCountEl) indexLinkCountEl.textContent = indexOrder.length + ' photographs';

  // Manual addition, not generated by PhotographyManager's renderer
  // migration. If that migration path is ever triggered again, verify
  // this block survives the rewrite.
  const exhibitionIdSet = {};
  exhibitionOrder.forEach(function (id) { exhibitionIdSet[id] = true; });

  // The set the viewer moves to once the turn is accepted: the eleven of
  // the Exhibition, then every other photograph in Index order. The first
  // eleven keep their places, so "continue" simply opens this set at 11.
  // The Index page is unaffected: it has its own renderer,
  // render-index.js, which builds its own set.
  const continuousOrder = exhibitionOrder.concat(
    indexOrder.filter(function (id) { return !exhibitionIdSet[id]; })
  );
  const continuousItems = continuousOrder.map(function (id) {
    const p = PHOTOS[id];
    return { url: cfImage(p.src, SRC_WIDTH.viewer), alt: p.alt };
  });

  /* ---------- one viewer, two sets ---------- */

  /*
    Two sets, and which one the viewer is holding matters.

    Opening a frame gives the viewer the eleven photographs of the
    Exhibition and nothing else, so its counts say "photo 03 of 11" and
    mean it. Pressing Next on the eleventh does not quietly hand over
    the other ninety-six: it ends the selection and offers the rest,
    which is the turn recorded as Decision 1 in the roadmap. Accepting
    swaps in the continuous set, where the same photograph is number 12
    of 107 and the counts are again true.
  */
  let viewer = null;
  let inExhibition = true;

  if (typeof createPhotoViewer === 'function') {
    viewer = createPhotoViewer({
      root: document.getElementById('lightbox'),
      stage: document.getElementById('lightbox-stage'),
      img: document.getElementById('lightbox-img'),
      closeBtn: document.getElementById('lightbox-close'),
      prevBtn: document.getElementById('lightbox-prev'),
      nextBtn: document.getElementById('lightbox-next'),
      fsBtn: document.getElementById('lightbox-fullscreen'),
      // No captionEl: the viewer shows the photograph and
      // close/previous/next only.
      onBoundary: function (direction) {
        if (direction === 'next' && inExhibition) showTurn();
      },
      boundaryLabel: {
        next: function () {
          return inExhibition
            ? 'End of the Exhibition. Continue into the Index'
            : 'Last photograph';
        }
      }
    });
  }

  /* ---------- the turn ---------- */

  const turnEl = document.getElementById('turn');
  const turnContinueBtn = document.getElementById('turn-continue');
  const turnStopBtn = document.getElementById('turn-stop');
  const turnCountEl = document.getElementById('turn-count');
  if (turnCountEl) turnCountEl.textContent = indexOrder.length + ' photographs';

  /*
    How many photographs the selection holds, in words, wherever the page
    says so. It used to say "Eleven photographs" in two places in the HTML,
    which was true on the day it was written and would have gone on being
    said after the twelfth was hung. The Exhibition is a curated sequence
    and its length is meant to change, so the sentence has to count.
  */
  const NUMBER_WORDS = ['no', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
    'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
    'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
    'Twenty'];

  function countInWords(n) {
    // Past twenty a numeral reads better than a word, and a selection that
    // large has stopped being a selection anyway.
    const word = (n >= 0 && n < NUMBER_WORDS.length) ? NUMBER_WORDS[n] : String(n);
    return word + (n === 1 ? ' photograph' : ' photographs');
  }

  document.querySelectorAll('[data-exhibition-count]').forEach(function (el) {
    el.textContent = countInWords(exhibitionOrder.length);
  });

  // The frame the current viewing started from. Focus goes back to it if
  // the visitor stops at the turn, so the page does not lose its place.
  let viewerOrigin = null;

  const turnReady = !!(turnEl && turnContinueBtn && turnStopBtn && viewer);

  function showTurn() {
    if (!turnReady) return;
    // Close the viewer without handing focus back to the page: the turn
    // takes the screen and owns focus until it is answered.
    viewer.close({ restoreFocus: false });
    turnEl.hidden = false;
    document.body.style.overflow = 'hidden';
    turnContinueBtn.focus();
  }

  function hideTurn() {
    turnEl.hidden = true;
    document.body.style.overflow = '';
  }

  function continueIntoIndex() {
    hideTurn();
    inExhibition = false;
    // The eleventh photograph of the Exhibition is the eleventh of the
    // continuous set too, so carrying on means opening at index 11.
    viewer.open(continuousItems, exhibitionOrder.length, viewerOrigin);
  }

  function stopAtTurn() {
    hideTurn();
    if (viewerOrigin && viewerOrigin.focus) {
      try { viewerOrigin.focus({ preventScroll: true }); } catch (err) { viewerOrigin.focus(); }
    }
  }

  if (turnReady) {
    turnContinueBtn.addEventListener('click', continueIntoIndex);
    turnStopBtn.addEventListener('click', stopAtTurn);
    // The turn has its own keys because the viewer is closed behind it:
    // Escape answers "stop here", and Tab stays between the two answers.
    turnEl.addEventListener('keydown', function (e) {
      const key = e.key === 'Esc' ? 'Escape' : e.key;
      if (key === 'Escape') { e.preventDefault(); stopAtTurn(); return; }
      if (key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === turnContinueBtn) {
        e.preventDefault(); turnStopBtn.focus();
      } else if (!e.shiftKey && document.activeElement === turnStopBtn) {
        e.preventDefault(); turnContinueBtn.focus();
      }
    });
  }

  function opener(items, i, button) {
    return function () {
      if (!viewer) return;
      viewerOrigin = button;
      inExhibition = (items === exhibitionItems);
      viewer.open(items, i, button);
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

    // The grow values first, because a shared row's frames are sized in
    // proportion to them and `sizes` has to say so.
    const grows = row.ids.map(function (id, i) {
      const p = PHOTOS[id];
      // Aspect ratio, optionally nudged by config so one photograph in a
      // shared row carries a little more of it. Only the ratio between
      // the two values matters.
      const weight = (entry.weight && entry.weight[i]) || 1;
      return (p.w / p.h) * weight;
    });
    const growTotal = grows.reduce(function (a, b) { return a + b; }, 0);

    row.ids.forEach(function (id, i) {
      const grow = shared ? grows[i].toFixed(4) : null;
      const fraction = shared
        ? grows[i] / growTotal
        : (entry.width === 'narrow' ? 0.62 : 1);

      const built = buildFrame(id, srcWidth, grow, rowIndex === 0, true, frameSlot(fraction, shared));
      built.button.setAttribute(
        'aria-label',
        'Open photograph, ' + (row.indexes[i] + 1) + ' of ' + exhibitionOrder.length
      );
      built.button.addEventListener('click', opener(exhibitionItems, row.indexes[i], built.button));
      el.appendChild(built.figure);
    });

    exhibitionEl.appendChild(el);
  });

}

function showPhotographyDataError(error) {
  var exhibitionEl = document.getElementById('exhibition');
  if (exhibitionEl) {
    exhibitionEl.textContent = 'The photographs could not be loaded. Please try again later.';
    exhibitionEl.setAttribute('role', 'status');
  }
  if (window.console && console.error) console.error(error);
}

if (window.PHOTOGRAPHY_DATA_READY) {
  window.PHOTOGRAPHY_DATA_READY.then(renderPhotography).catch(showPhotographyDataError);
} else {
  showPhotographyDataError(new Error('Photography data loader is missing.'));
}
