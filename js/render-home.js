(function(){
  const sheet = document.getElementById('contact-sheet');

  ALBUMS.forEach(function(album, i){
    const num = String(i + 1).padStart(2, '0');
    const cover = album.photos[0];

    const frame = document.createElement('article');
    frame.className = 'frame';
    frame.innerHTML = `
      <div class="frame-id mono">FH · ${num}</div>
      <a class="thumb-link" href="album.html?a=${encodeURIComponent(album.slug)}" aria-label="Open album: ${album.title}">
        <div class="thumb">
          <img src="${cover}" alt="" loading="lazy">
        </div>
      </a>
      <div class="meta">
        <a class="title" href="album.html?a=${encodeURIComponent(album.slug)}">${album.title}</a>
        <span class="count mono">${album.photos.length} frames</span>
      </div>
    `;
    sheet.appendChild(frame);
  });
})();
