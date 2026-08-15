/*
  PHOTO VIEWER (shared fullscreen module)
  ----------------------------------------
  Extracted from the album lightbox in render-album.js. Same interaction
  behaviour, generalised so the future Exhibition and Index pages can use
  it too: it knows nothing about albums, titles, slugs, or "next album"
  navigation. A caller hands it a DOM structure and a set of photos to
  show; everything album-specific (captions, walking off the end into
  the next album) stays in the page that calls this module, passed in as
  small optional callbacks.

  USAGE

    const viewer = createPhotoViewer({
      root:       document.getElementById('lightbox'),
      stage:      document.getElementById('lightbox-stage'),
      img:        document.getElementById('lightbox-img'),
      closeBtn:   document.getElementById('lightbox-close'),
      prevBtn:    document.getElementById('lightbox-prev'),
      nextBtn:    document.getElementById('lightbox-next'),
      fsBtn:      document.getElementById('lightbox-fullscreen'),   // optional
      captionEl:  document.getElementById('lightbox-caption'),      // optional

      // Optional. Called instead of the default "clamp and stay put"
      // behaviour when Next/Prev is pressed at the end of the set.
      // Receives 'next' or 'prev'. If omitted, the viewer simply stays
      // on the boundary photo and marks the button as at-limit.
      onBoundary: function (direction) { ... },

      // Optional. Text shown in captionEl for photo i (0-based) out of
      // a set of `total`. If omitted, no caption is shown.
      captionFor: function (photo, i, total) { ... },

      // Optional. Overrides the default aria-label given to Prev/Next
      // when sitting on the first/last photo. Each receives no args and
      // returns a string.
      boundaryLabel: { prev: function () {...}, next: function () {...} }
    });

    viewer.open(photos, startIndex, originEl);
    // photos: array of { url, alt, color }
    //   url   -> already-resolved image URL for full-size viewing
    //            (the caller applies cfImage or any other helper first;
    //            this module has no opinion on image hosting).
    //   alt   -> accessible name for the image; also used to build the
    //            default aria-label ("<alt>, photo 3 of 40") unless
    //            labelFor is supplied.
    //   color -> optional; toggles the 'is-color' class on the image.
    // startIndex: which photo to open on.
    // originEl: the element to return focus to when the viewer closes
    //           normally (click Close, Escape, click outside, or a
    //           boundary with no onBoundary handler). Optional.

    viewer.close();                        // normal close, restores focus
    viewer.close({ restoreFocus: false }); // boundary close: caller will
                                            // move focus itself

  Behaviour preserved from the original album lightbox: focus moves to
  Close on open and returns to the origin element on close; a focus trap
  keeps Tab inside the dialog; Escape closes (except while in native
  fullscreen, where the browser owns Escape); Left/Right arrows page,
  with legacy "Left"/"Right"/"Esc" key names normalised; horizontal touch
  swipe pages; native fullscreen is offered only where supported (so not
  on iOS Safari) and its state is reflected on the fullscreen button;
  the two neighbouring photos are preloaded so paging doesn't flash; the
  body's scroll is locked while the viewer is open; focus calls use
  preventScroll so moving focus doesn't itself yank the page; keydown
  is bound on both window and document (capture phase) because some
  browsers route keys to the fullscreen element first, with a flag to
  ignore the resulting duplicate sighting of the same event.

  Behaviour deliberately not preserved: the viewer no longer knows how
  to walk off the end of one set into another (that was album-specific);
  callers that want that get it back via onBoundary. There is no visible
  caption unless a page supplies captionFor, and there is no position
  counter ("3 / 40") built in.
*/
function createPhotoViewer(config) {
  const root = config.root;
  const stage = config.stage;
  const img = config.img;
  const closeBtn = config.closeBtn;
  const prevBtn = config.prevBtn;
  const nextBtn = config.nextBtn;
  const fsBtn = config.fsBtn || null;
  const captionEl = config.captionEl || null;
  const onBoundary = typeof config.onBoundary === 'function' ? config.onBoundary : null;
  const captionFor = typeof config.captionFor === 'function' ? config.captionFor : null;
  const boundaryLabel = config.boundaryLabel || {};

  let photos = [];
  let currentIndex = 0;
  let lastFocused = null;

  // Native fullscreen is not available everywhere (notably iOS Safari,
  // which only allows it on <video>). Only offer the button where it works.
  const fsEnabled = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  if (fsBtn) fsBtn.hidden = !fsEnabled;

  function fsElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  function requestFs(el) {
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  }
  function exitFs() {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  }

  function defaultLabelFor(i) {
    const p = photos[i];
    return (p && p.alt ? p.alt : 'Photograph') +
      ', photo ' + String(i + 1).padStart(2, '0') + ' of ' + String(photos.length).padStart(2, '0');
  }

  // Warm the neighbouring frames so arrow/swipe navigation doesn't flash.
  function preloadNeighbours(i) {
    [i - 1, i + 1].forEach(function (n) {
      if (n < 0 || n >= photos.length) return;
      const pre = new Image();
      pre.src = photos[n].url;
    });
  }

  function showAt(i) {
    currentIndex = i;
    const photo = photos[i];
    img.src = photo.url;
    img.alt = defaultLabelFor(i);
    img.classList.toggle('is-color', !!photo.color);
    if (captionEl) {
      if (captionFor) {
        captionEl.textContent = captionFor(photo, i, photos.length);
      } else {
        captionEl.textContent = '';
      }
    }

    const atStart = (i === 0);
    const atEnd = (i === photos.length - 1);

    prevBtn.classList.toggle('is-start', atStart);
    prevBtn.setAttribute('aria-label', atStart
      ? (boundaryLabel.prev ? boundaryLabel.prev() : 'Previous photo')
      : 'Previous photo');
    prevBtn.title = atStart && boundaryLabel.prev ? '' : '';

    nextBtn.classList.toggle('is-end', atEnd);
    nextBtn.setAttribute('aria-label', atEnd
      ? (boundaryLabel.next ? boundaryLabel.next() : 'Next photo')
      : 'Next photo');
    nextBtn.title = atEnd && boundaryLabel.next ? '' : '';

    preloadNeighbours(i);
  }

  function goNext() {
    if (currentIndex < photos.length - 1) { showAt(currentIndex + 1); return; }
    if (onBoundary) onBoundary('next');
  }
  function goPrev() {
    if (currentIndex > 0) { showAt(currentIndex - 1); return; }
    if (onBoundary) onBoundary('prev');
  }

  function open(items, startIndex, originEl) {
    photos = items || [];
    lastFocused = originEl || document.activeElement;
    root.hidden = false;
    root.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    showAt(startIndex || 0);
    closeBtn.focus();
  }

  function close(opts) {
    const restoreFocus = !opts || opts.restoreFocus !== false;
    if (fsElement()) exitFs();
    root.classList.remove('is-open');
    root.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
    if (restoreFocus && lastFocused && lastFocused.focus) {
      try { lastFocused.focus({ preventScroll: true }); } catch (err) { lastFocused.focus(); }
    }
    lastFocused = null;
  }

  function toggleFullscreen() {
    if (!fsBtn) return;
    if (fsElement()) { exitFs(); return; }
    const p = requestFs(root);
    if (p && p.catch) p.catch(function () { /* denied, the overlay is still full-bleed */ });
  }

  function syncFsButton() {
    if (!fsBtn) return;
    const on = !!fsElement();
    fsBtn.textContent = on ? 'Exit full screen' : 'Full screen';
    fsBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  document.addEventListener('fullscreenchange', syncFsButton);
  document.addEventListener('webkitfullscreenchange', syncFsButton);

  closeBtn.addEventListener('click', function () { close(); });
  if (fsBtn) fsBtn.addEventListener('click', toggleFullscreen);
  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);
  // Clicking the empty space around the photo closes the viewer.
  stage.addEventListener('click', function (e) {
    if (e.target === stage) close();
  });

  // Capture phase, so nothing lower in the tree can swallow these keys
  // before we see them. Bound to window as well as document: when the
  // viewer is the native fullscreen element, some browsers route key
  // events there first.
  function onKeydown(e) {
    // Bound twice (window + document); ignore the second sighting.
    if (e.lightboxSeen) return;
    e.lightboxSeen = true;

    if (!root.classList.contains('is-open')) return;
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;

    // e.key is normalised here because older engines report "Left"/"Right"/"Esc".
    var key = e.key;
    if (key === 'Left') key = 'ArrowLeft';
    if (key === 'Right') key = 'ArrowRight';
    if (key === 'Esc') key = 'Escape';

    if (key === 'Escape') {
      // In native fullscreen the browser handles Escape itself; don't also close.
      if (!fsElement()) { e.preventDefault(); close(); }
      return;
    }
    if (key === 'f' || key === 'F') {
      if (fsEnabled && fsBtn) { e.preventDefault(); toggleFullscreen(); }
      return;
    }
    if (key === 'ArrowLeft') {
      e.preventDefault(); // otherwise the page also tries to scroll
      goPrev();
      return;
    }
    if (key === 'ArrowRight') {
      e.preventDefault();
      goNext();
      return;
    }

    // Keep Tab inside the dialog while it is open.
    if (key === 'Tab') {
      const focusable = Array.prototype.filter.call(
        root.querySelectorAll('button:not([disabled]):not([hidden])'),
        function (el) { return el.offsetParent !== null; }
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }
  document.addEventListener('keydown', onKeydown, true);
  window.addEventListener('keydown', onKeydown, true);

  // Swipe navigation (touch devices)
  var touchStartX = 0, touchStartY = 0;
  var SWIPE_THRESHOLD = 40;

  root.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  root.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    // Deliberately bounded, unlike the arrows and keys: a swipe is a
    // continuous gesture that's easy to overshoot, and an unresponsive
    // swipe leaves no dead control on screen the way a greyed-out arrow
    // does. This intentionally does not call onBoundary.
    if (dx < 0 && currentIndex < photos.length - 1) showAt(currentIndex + 1);
    if (dx > 0 && currentIndex > 0) showAt(currentIndex - 1);
  }, { passive: true });

  return {
    open: open,
    close: close,
    currentIndex: function () { return currentIndex; }
  };
}
