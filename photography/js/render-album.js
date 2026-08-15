(function(){
  if (typeof ALBUMS === 'undefined' || !Array.isArray(ALBUMS)) return;

  // Author-written config, not user input. Escaped anyway: a straight double
  // quote in a title or alt would close the attribute it sits in.
  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('a');
  const album = ALBUMS.find(function(a){ return a.slug === slug; });

  const roll = document.getElementById('roll');
  const rollEnd = document.getElementById('roll-end');
  const titleEl = document.getElementById('album-title');
  const metaEl = document.getElementById('album-meta');

  if (!album) {
    titleEl.textContent = 'Album not found';
    metaEl.textContent = 'Check the link, or go back to all albums.';
    document.title = 'Album not found · Faisal Henar Photography';
    if (rollEnd) rollEnd.hidden = true;
    return;
  }

  titleEl.textContent = album.title;
  metaEl.textContent = album.photos.length + ' frames';
  document.title = album.title + ' · Faisal Henar Photography';

  // Each album is a distinct page as far as search and sharing are concerned.
  // Without this they all canonicalize to bare album.html, and every album
  // shares one generic description and title. Both are fixed here.
  (function setPageMeta(){
    var url = 'https://faisalhenar.com/photography/album.html?a=' + encodeURIComponent(album.slug);

    function meta(sel, attr, name, value){
      if (!value) return;
      var el = document.head.querySelector(sel);
      if (!el){
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    }

    var link = document.querySelector('link[rel="canonical"]');
    if (!link){
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;

    var title = album.title + ' · Faisal Henar Photography';
    meta('meta[property="og:url"]', 'property', 'og:url', url);
    meta('meta[property="og:title"]', 'property', 'og:title', title);
    meta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    if (album.note){
      meta('meta[name="description"]', 'name', 'description', album.note);
      meta('meta[property="og:description"]', 'property', 'og:description', album.note);
      meta('meta[name="twitter:description"]', 'name', 'twitter:description', album.note);
    }
  })();

  // The album's own words, if it has any. Optional by design.
  (function renderNote(){
    var noteEl = document.getElementById('album-note');
    if (!noteEl) return;
    if (!album.note){ noteEl.hidden = true; return; }
    noteEl.textContent = album.note;
    noteEl.hidden = false;
  })();

  // Falls back to the title if an album has no alt yet.
  function altFor(a){
    return a.alt || (a.title + ', photograph');
  }

  // Per-photo alt, now that config.js supplies one alt per photo (via the
  // PHOTOS registry, resolved into album.photoAlts by the ALBUMS adapter).
  // Falls back to the old album-wide text if photoAlts is ever missing,
  // so a hand-edited or older-shaped album config still renders.
  function photoAlt(a, i){
    return (a.photoAlts && a.photoAlts[i]) || altFor(a);
  }
  function coverAlt(a){
    return (a.photoAlts && a.photoAlts[0]) || altFor(a);
  }

  album.photos.forEach(function(src, i){
    const num = String(i + 1).padStart(2, '0');
    const label = album.slug.slice(0,2).toUpperCase() + '·' + num;
    const exposure = document.createElement('figure');
    exposure.className = 'exposure' + (album.color ? ' is-color' : '');
    exposure.innerHTML = `
      <button type="button" data-index="${i}" aria-label="Enlarge photo ${num}">
        <span class="frame-id mono">${esc(label)}</span>
        <span class="pic"><img src="${cfImage(src, 700)}" alt="${esc(photoAlt(album, i))}" loading="lazy"></span>
      </button>
    `;
    roll.appendChild(exposure);
  });

  // End of roll: a closing marker, then the next album in ALBUMS order.
  // Deliberately does not wrap around — the last album ends on "all albums"
  // rather than looping back to the first.
  (function renderRollEnd(){
    if (!rollEnd) return;

    const mark = document.createElement('p');
    mark.className = 'end-mark';
    mark.textContent = 'End of roll · ' + String(album.photos.length).padStart(2, '0') + ' frames';
    rollEnd.appendChild(mark);

    const pos = ALBUMS.indexOf(album);
    const next = (pos > -1 && pos < ALBUMS.length - 1) ? ALBUMS[pos + 1] : null;

    if (next) {
      const a = document.createElement('a');
      a.className = 'next-album' + (next.color ? ' is-color' : '');
      a.href = 'album.html?a=' + encodeURIComponent(next.slug);
      a.innerHTML = `
        <span class="thumb"><img src="${esc(cfImage(next.photos[0], 300))}" alt="${esc(coverAlt(next))}, cover" loading="lazy"></span>
        <span class="next-text">
          <span class="next-label">Next album</span>
          <span class="next-title">${esc(next.title)}</span>
          <span class="next-count">${next.photos.length} frames</span>
        </span>
      `;
      rollEnd.appendChild(a);
    }

    const all = document.createElement('a');
    all.className = 'all-albums';
    all.href = './';
    all.textContent = next ? 'All albums' : '← All albums';
    rollEnd.appendChild(all);
  })();

  // Fullscreen viewer, built on the shared module in viewer.js. Album
  // coupling (the caption text, and walking off either end of the roll
  // into the next album or back to the top) lives here, passed in as
  // small callbacks; the module itself knows nothing about albums.
  if (typeof createPhotoViewer !== 'function') return;

  const viewer = createPhotoViewer({
    root: document.getElementById('lightbox'),
    stage: document.getElementById('lightbox-stage'),
    img: document.getElementById('lightbox-img'),
    closeBtn: document.getElementById('lightbox-close'),
    prevBtn: document.getElementById('lightbox-prev'),
    nextBtn: document.getElementById('lightbox-next'),
    fsBtn: document.getElementById('lightbox-fullscreen'),
    captionEl: document.getElementById('lightbox-caption'),

    captionFor: function (photo, i){
      return album.title + ' · ' + String(i + 1).padStart(2, '0') + ' / ' + String(album.photos.length).padStart(2, '0');
    },

    boundaryLabel: {
      prev: function () { return 'Back to the top of the album'; },
      next: function () { return 'End of roll, back to the album'; }
    },

    // Neither arrow is ever dead. At the two ends of the roll they stop
    // advancing and start leaving: forward drops you at the end-of-roll
    // block where the next album waits, back returns you to the top of
    // the album. Focus moves with the scroll, or the two fight each other.
    onBoundary: function (direction){
      viewer.close({ restoreFocus: false });
      landAt(direction === 'next' ? 'end' : 'top');
    }
  });

  // Where the page should land once the viewer closes at a boundary.
  // preventScroll on focus, so focus doesn't yank the page before we
  // scroll it; the actual scroll happens next frame so leaving native
  // fullscreen (which relays out the page) doesn't fight it.
  function landAt(where){
    let anchor = null;
    if (where === 'end' && rollEnd && !rollEnd.hidden) anchor = rollEnd;
    if (where === 'top') anchor = document.querySelector('.album-header');
    if (!anchor) return;

    const target = anchor.querySelector('a');
    if (target){
      try { target.focus({ preventScroll: true }); } catch (err) { target.focus(); }
    }
    requestAnimationFrame(function(){
      // No behavior passed: inherits scroll-behavior, which reduced motion turns off.
      if (where === 'top') window.scrollTo({ top: 0 });
      else anchor.scrollIntoView({ block: 'center' });
    });
  }

  const viewerPhotos = album.photos.map(function (src, i) {
    return {
      url: cfImage(src, 2000),
      alt: photoAlt(album, i),
      color: !!album.color
    };
  });

  roll.addEventListener('click', function(e){
    const btn = e.target.closest('button[data-index]');
    if (!btn) return;
    const i = parseInt(btn.getAttribute('data-index'), 10);
    viewer.open(viewerPhotos, i, btn);
  });
})();
