(function(){
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('a');
  const album = ALBUMS.find(function(a){ return a.slug === slug; });

  const spread = document.getElementById('spread');
  const titleEl = document.getElementById('album-title');
  const metaEl = document.getElementById('album-meta');
  const folioEl = document.getElementById('folio-album');

  if (!album) {
    titleEl.textContent = 'Album not found';
    metaEl.textContent = 'Check the link, or go back to contents.';
    document.title = 'Album not found — Faisal Henar Photography';
    return;
  }

  titleEl.textContent = album.title;
  metaEl.textContent = album.photos.length + ' frames';
  folioEl.textContent = album.title;
  document.title = album.title + ' — Faisal Henar Photography';

  album.photos.forEach(function(src, i){
    const num = String(i + 1).padStart(2, '0');
    const fig = document.createElement('figure');
    fig.innerHTML = `
      <img src="${src}" alt="" loading="lazy">
      <figcaption>${album.title} &middot; ${num}</figcaption>
    `;
    spread.appendChild(fig);
  });
})();
