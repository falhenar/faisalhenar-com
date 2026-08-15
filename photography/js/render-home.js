(function(){
  const sheet = document.getElementById('contact-sheet');
  if (!sheet || typeof ALBUMS === 'undefined' || !Array.isArray(ALBUMS)) return;

  // config.js is author-written, not user input, so this is not an XSS guard.
  // It is here because a title or alt containing a straight double quote would
  // otherwise close the attribute it sits in and break the markup, and that
  // failure looks like a rendering bug rather than a data problem.
  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  }

  // Falls back to the title if an album has no alt yet, so a missing field
  // degrades to something readable rather than to silence.
  function altFor(album){
    return album.alt || (album.title + ', photograph');
  }

  ALBUMS.forEach(function(album, i){
    const num = String(i + 1).padStart(2, '0');
    const cover = album.photos[0];

    const frame = document.createElement('article');
    frame.className = 'frame' + (album.color ? ' is-color' : '');
    frame.innerHTML = `
      <div class="frame-id mono">FH · ${num}</div>
      <a class="thumb-link" href="album.html?a=${encodeURIComponent(album.slug)}" aria-label="Open album: ${esc(album.title)}">
        <div class="thumb">
          <img src="${cfImage(cover, 800)}" alt="${esc(altFor(album))}, cover"${i === 0 ? '' : ' loading="lazy"'}>
        </div>
      </a>
      <div class="meta">
        <a class="title" href="album.html?a=${encodeURIComponent(album.slug)}">${esc(album.title)}</a>
        <span class="count mono">${album.photos.length} frames</span>
      </div>
    `;
    sheet.appendChild(frame);
  });
})();
