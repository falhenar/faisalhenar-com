(function(){
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('a');
  const album = ALBUMS.find(function(a){ return a.slug === slug; });

  const roll = document.getElementById('roll');
  const titleEl = document.getElementById('album-title');
  const metaEl = document.getElementById('album-meta');

  if (!album) {
    titleEl.textContent = 'Album not found';
    metaEl.textContent = 'Check the link, or go back to all albums.';
    document.title = 'Album not found · Faisal Henar Photography';
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
        <span class="pic"><img src="${src}" alt="" loading="lazy"></span>
      </button>
    `;
    roll.appendChild(exposure);
  });

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
    return album.title + ' — frame ' + String(i + 1).padStart(2, '0') +
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
      img.src = album.photos[n];
    });
  }

  function showAt(i){
    currentIndex = i;
    lightboxImg.src = album.photos[i];
    lightboxImg.alt = labelFor(i);
    lightboxImg.classList.toggle('is-color', !!album.color);
    lightboxCaption.innerHTML = captionFor(i);
    lightboxPrev.disabled = (i === 0);
    lightboxNext.disabled = (i === album.photos.length - 1);
    preloadNeighbours(i);
  }

  function openLightbox(i){
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    showAt(i);
    lightboxClose.focus();
  }

  function closeLightbox(){
    if (fsElement()) exitFs();
    lightbox.classList.remove('is-open');
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
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
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxFs.addEventListener('click', toggleFullscreen);
  lightboxPrev.addEventListener('click', function(){
    if (currentIndex > 0) showAt(currentIndex - 1);
  });
  lightboxNext.addEventListener('click', function(){
    if (currentIndex < album.photos.length - 1) showAt(currentIndex + 1);
  });
  // Clicking the empty space around the photo closes the viewer.
  lightboxStage.addEventListener('click', function(e){
    if (e.target === lightboxStage) closeLightbox();
  });

  document.addEventListener('keydown', function(e){
    if (!lightbox.classList.contains('is-open')) return;

    if (e.key === 'Escape'){
      // In native fullscreen the browser handles Escape itself; don't also close.
      if (!fsElement()) closeLightbox();
      return;
    }
    if (e.key === 'f' || e.key === 'F'){
      if (fsEnabled) toggleFullscreen();
      return;
    }
    if (e.key === 'ArrowLeft' && currentIndex > 0) showAt(currentIndex - 1);
    if (e.key === 'ArrowRight' && currentIndex < album.photos.length - 1) showAt(currentIndex + 1);

    // Keep Tab inside the dialog while it is open.
    if (e.key === 'Tab'){
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
  });

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
    if (dx < 0 && currentIndex < album.photos.length - 1) showAt(currentIndex + 1);
    if (dx > 0 && currentIndex > 0) showAt(currentIndex - 1);
  }, { passive: true });
})();
