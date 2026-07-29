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
    document.title = 'Album not found — Faisal Henar Photography';
    return;
  }

  titleEl.textContent = album.title;
  metaEl.textContent = album.photos.length + ' frames';
  document.title = album.title + ' — Faisal Henar Photography';

  album.photos.forEach(function(src, i){
    const num = String(i + 1).padStart(2, '0');
    const exposure = document.createElement('figure');
    exposure.className = 'exposure';
    exposure.innerHTML = `
      <div class="frame-id mono">${album.slug.slice(0,2).toUpperCase()}·${num}</div>
      <div class="pic">
        <img src="${src}" alt="" loading="lazy">
      </div>
    `;
    roll.appendChild(exposure);
  });
})();
