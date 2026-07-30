(function(){
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('a');
  const album = ALBUMS.find(function(a){ return a.slug === slug; });

  const roll = document.getElementById('roll');
  const titleEl = document.getElementById('album-title');
  const metaEl = document.getElementById('album-meta');
  const footerTagEl = document.getElementById('footer-tag');

  if (!album) {
    titleEl.textContent = 'Album not found';
    metaEl.textContent = 'Check the link, or go back to all albums.';
    document.title = 'Album not found — Faisal Henar Photography';
    return;
  }

  titleEl.textContent = album.title;
  metaEl.textContent = album.photos.length + ' frames';
  document.title = album.title + ' — Faisal Henar Photography';
  footerTagEl.textContent = album.color ? 'Color' : 'Black & White';

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
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let currentIndex = 0;

  function captionFor(i){
    return album.title + ' &middot; ' + String(i + 1).padStart(2, '0') + ' / ' + String(album.photos.length).padStart(2, '0');
  }

  function showAt(i){
    currentIndex = i;
    lightboxImg.src = album.photos[i];
    lightboxImg.classList.toggle('is-color', !!album.color);
    lightboxCaption.innerHTML = captionFor(i);
    lightboxPrev.disabled = (i === 0);
    lightboxNext.disabled = (i === album.photos.length - 1);
  }

  function openLightbox(i){
    showAt(i);
    lightbox.classList.add('is-open');
  }
  function closeLightbox(){
    lightbox.classList.remove('is-open');
    lightboxImg.src = '';
  }

  roll.addEventListener('click', function(e){
    const btn = e.target.closest('button[data-index]');
    if (!btn) return;
    openLightbox(parseInt(btn.getAttribute('data-index'), 10));
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function(){
    if (currentIndex > 0) showAt(currentIndex - 1);
  });
  lightboxNext.addEventListener('click', function(){
    if (currentIndex < album.photos.length - 1) showAt(currentIndex + 1);
  });
  lightbox.addEventListener('click', function(e){
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function(e){
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && currentIndex > 0) showAt(currentIndex - 1);
    if (e.key === 'ArrowRight' && currentIndex < album.photos.length - 1) showAt(currentIndex + 1);
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
