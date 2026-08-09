(function(){
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

  album.photos.forEach(function(src, i){
    const num = String(i + 1).padStart(2, '0');
    const label = album.slug.slice(0,2).toUpperCase() + '·' + num;
    const exposure = document.createElement('figure');
    exposure.className = 'exposure' + (album.color ? ' is-color' : '');
    exposure.innerHTML = `
      <button type="button" data-index="${i}" aria-label="Enlarge photo ${num}">
        <span class="frame-id mono">${label}</span>
        <span class="pic"><img src="${cfImage(src, 700)}" alt="" loading="lazy"></span>
      </button>
    `;
    roll.appendChild(exposure);
  });

  // End of roll: a closing marker, then the next album in ALBUMS order.
  // Deliberately does not wrap around — the last album ends on "all albums"
  // rather than looping back to the first.
  (function renderRollEnd(){
    if (!rollEnd) return;

    function esc(s){
      return String(s).replace(/[&<>"]/g, function(c){
        return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
      });
    }

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
        <span class="thumb"><img src="${esc(cfImage(next.photos[0], 300))}" alt="" loading="lazy"></span>
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
    all.href = 'index.html';
    all.textContent = next ? 'All albums' : '← All albums';
    rollEnd.appendChild(all);
  })();

  // Lightbox behavior, with previous/next (non-looping)
  const lightbox = document.getElementById('lightbox');
  const lightboxStage = document.getElementById('lightbox-stage');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxFs = document.getElementById('lightbox-fullscreen');

  let currentIndex = 0;
  let lastFocused = null;

  // Native fullscreen is not available everywhere (notably iOS Safari, which
  // only allows it on <video>). Only offer the button where it will work.
  const fsEnabled = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  if (fsEnabled) lightboxFs.hidden = false;

  function fsElement(){
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  function requestFs(el){
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  }
  function exitFs(){
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  }

  function labelFor(i){
    return album.title + ' · frame ' + String(i + 1).padStart(2, '0') +
           ' of ' + String(album.photos.length).padStart(2, '0');
  }
  function captionFor(i){
    return album.title + ' &middot; ' + String(i + 1).padStart(2, '0') + ' / ' + String(album.photos.length).padStart(2, '0');
  }

  // Warm the neighbouring frames so arrow/swipe navigation doesn't flash.
  function preloadNeighbours(i){
    [i - 1, i + 1].forEach(function(n){
      if (n < 0 || n >= album.photos.length) return;
      const img = new Image();
      img.src = cfImage(album.photos[n], 2000);
    });
  }

  function showAt(i){
    currentIndex = i;
    lightboxImg.src = cfImage(album.photos[i], 2000);
    lightboxImg.alt = labelFor(i);
    lightboxImg.classList.toggle('is-color', !!album.color);
    lightboxCaption.innerHTML = captionFor(i);

    // Neither arrow is ever dead. At the two ends of the roll they stop
    // advancing and start leaving: forward drops you at the end-of-roll block
    // where the next album waits, back returns you to the top of the album.
    const atStart = (i === 0);
    const atEnd = (i === album.photos.length - 1);

    lightboxPrev.classList.toggle('is-start', atStart);
    lightboxPrev.setAttribute('aria-label', atStart ? 'Back to the top of the album' : 'Previous photo');
    lightboxPrev.title = atStart ? 'Start of roll' : '';

    lightboxNext.classList.toggle('is-end', atEnd);
    lightboxNext.setAttribute('aria-label', atEnd ? 'End of roll, back to the album' : 'Next photo');
    lightboxNext.title = atEnd ? 'End of roll' : '';

    preloadNeighbours(i);
  }

  // Right arrow, next button and left-swipe all come through here.
  function goNext(){
    if (currentIndex < album.photos.length - 1){ showAt(currentIndex + 1); return; }
    closeLightbox({ to: 'end' });
  }
  // Left arrow, prev button and right-swipe.
  function goPrev(){
    if (currentIndex > 0){ showAt(currentIndex - 1); return; }
    closeLightbox({ to: 'top' });
  }

  function openLightbox(i){
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    showAt(i);
    lightboxClose.focus();
  }

  // Where the page should land once the viewer closes. Default is the thumbnail
  // we came from; walking off either end of the roll lands somewhere onward
  // instead. Focus moves with the scroll, or the two fight each other.
  function landAt(where){
    let anchor = null;
    if (where === 'end' && rollEnd && !rollEnd.hidden) anchor = rollEnd;
    if (where === 'top') anchor = document.querySelector('.album-header');
    if (!anchor) return false;

    const target = anchor.querySelector('a');
    // preventScroll, so focus doesn't yank the page before we scroll it.
    if (target){
      try { target.focus({ preventScroll: true }); } catch (err) { target.focus(); }
    }
    // Leaving native fullscreen relays out the page; scroll on the next frame.
    requestAnimationFrame(function(){
      // No behavior passed: inherits scroll-behavior, which reduced motion turns off.
      if (where === 'top') window.scrollTo({ top: 0 });
      else anchor.scrollIntoView({ block: 'center' });
    });
    return true;
  }

  function closeLightbox(opts){
    if (fsElement()) exitFs();
    lightbox.classList.remove('is-open');
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';

    const landed = landAt(opts && opts.to);
    if (!landed && lastFocused && lastFocused.focus) lastFocused.focus();
    lastFocused = null;
  }

  function toggleFullscreen(){
    if (fsElement()) { exitFs(); return; }
    const p = requestFs(lightbox);
    if (p && p.catch) p.catch(function(){ /* denied — the overlay is still full-bleed */ });
  }

  function syncFsButton(){
    const on = !!fsElement();
    lightboxFs.textContent = on ? 'Exit full screen' : 'Full screen';
    lightboxFs.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  document.addEventListener('fullscreenchange', syncFsButton);
  document.addEventListener('webkitfullscreenchange', syncFsButton);

  roll.addEventListener('click', function(e){
    const btn = e.target.closest('button[data-index]');
    if (!btn) return;
    openLightbox(parseInt(btn.getAttribute('data-index'), 10));
  });
  lightboxClose.addEventListener('click', function(){ closeLightbox(); });
  lightboxFs.addEventListener('click', toggleFullscreen);
  lightboxPrev.addEventListener('click', goPrev);
  lightboxNext.addEventListener('click', goNext);
  // Clicking the empty space around the photo closes the viewer.
  lightboxStage.addEventListener('click', function(e){
    if (e.target === lightboxStage) closeLightbox();
  });

  // Capture phase, so nothing lower in the tree can swallow these keys before
  // we see them. Bound to window as well as document: when the lightbox is the
  // native fullscreen element, some browsers route key events there first.
  function onKeydown(e){
    // Bound twice (window + document), so ignore the second sighting of an event.
    if (e.lightboxSeen) return;
    e.lightboxSeen = true;

    if (!lightbox.classList.contains('is-open')) return;
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;

    // e.key is normalised here because older engines report "Left"/"Right"/"Esc".
    var key = e.key;
    if (key === 'Left') key = 'ArrowLeft';
    if (key === 'Right') key = 'ArrowRight';
    if (key === 'Esc') key = 'Escape';

    if (key === 'Escape'){
      // In native fullscreen the browser handles Escape itself; don't also close.
      if (!fsElement()) { e.preventDefault(); closeLightbox(); }
      return;
    }
    if (key === 'f' || key === 'F'){
      if (fsEnabled) { e.preventDefault(); toggleFullscreen(); }
      return;
    }
    if (key === 'ArrowLeft'){
      e.preventDefault();  // otherwise the page also tries to scroll
      goPrev();
      return;
    }
    if (key === 'ArrowRight'){
      e.preventDefault();
      goNext();
      return;
    }

    // Keep Tab inside the dialog while it is open.
    if (key === 'Tab'){
      const focusable = Array.prototype.filter.call(
        lightbox.querySelectorAll('button:not([disabled]):not([hidden])'),
        function(el){ return el.offsetParent !== null; }
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first){
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last){
        e.preventDefault(); first.focus();
      }
    }
  }
  document.addEventListener('keydown', onKeydown, true);
  window.addEventListener('keydown', onKeydown, true);

  // Swipe navigation (touch devices)
  var touchStartX = 0, touchStartY = 0;
  var SWIPE_THRESHOLD = 40;

  lightbox.addEventListener('touchstart', function(e){
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    // Deliberately bounded, unlike the arrows and keys. A swipe is a continuous
    // gesture that's easy to overshoot, and an unresponsive swipe leaves no dead
    // control on screen the way a greyed-out arrow does. Swap in goNext/goPrev
    // if you'd rather have it fully symmetric.
    if (dx < 0 && currentIndex < album.photos.length - 1) showAt(currentIndex + 1);
    if (dx > 0 && currentIndex > 0) showAt(currentIndex - 1);
  }, { passive: true });
})();
