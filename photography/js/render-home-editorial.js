(function(){
  const hero = document.getElementById('hero');
  const toc = document.getElementById('toc');

  // First album becomes the hero feature; rest form the table of contents
  const [featured, ...rest] = ALBUMS;
  const romanish = ['I','II','III','IV','V','VI','VII','VIII'];

  hero.innerHTML = `
    <div class="hero-image">
      <img src="${featured.photos[0]}" alt="">
    </div>
    <div class="hero-text">
      <div class="eyebrow">Featured &middot; Vol. ${romanish[0]}</div>
      <h1>${featured.title}</h1>
      <p class="dek">${featured.photos.length} frames from this collection, shared here as the opening feature of the edition.</p>
      <a class="cta" href="album-editorial.html?a=${encodeURIComponent(featured.slug)}">Read the full spread &rarr;</a>
    </div>
  `;

  ALBUMS.forEach(function(album, i){
    const row = document.createElement('a');
    row.href = `album-editorial.html?a=${encodeURIComponent(album.slug)}`;
    row.className = 'toc-row';
    row.innerHTML = `
      <div class="num">${romanish[i] || (i+1)}</div>
      <div class="thumb"><img src="${album.photos[0]}" alt="" loading="lazy"></div>
      <div class="title">${album.title}</div>
      <div class="count">${album.photos.length} frames</div>
    `;
    toc.appendChild(row);
  });
})();
