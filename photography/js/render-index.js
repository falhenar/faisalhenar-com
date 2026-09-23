(function () {
  'use strict';

  var desktop = document.getElementById('desktop-index');
  var phone = document.getElementById('phone-index');
  var count = document.getElementById('index-count');
  var desktopPattern = [
    { name: 'a', size: 2 },
    { name: 'b', size: 2 },
    { name: 'c', size: 3 },
    { name: 'd', size: 1 }
  ];

  function photoUrl(photo, width) {
    return cfImage('../' + photo.src, width);
  }

  function createButton(photo, index, total, eager, sourceWidth, viewer) {
    var image = document.createElement('img');
    image.src = photoUrl(photo, sourceWidth);
    image.alt = photo.alt;
    image.width = photo.w;
    image.height = photo.h;
    image.decoding = 'async';
    image.loading = eager ? 'eager' : 'lazy';

    var button = document.createElement('button');
    button.type = 'button';
    button.appendChild(image);
    button.addEventListener('click', function () {
      viewer.open(viewer.items, index, button);
    });
    return button;
  }

  function createFigure(photo, index, total, eager, sourceWidth, viewer) {
    var figure = document.createElement('figure');
    figure.className = 'editorial-photo';
    figure.appendChild(createButton(photo, index, total, eager, sourceWidth, viewer));
    return figure;
  }

  function renderDesktop(photos, viewer) {
    var photoIndex = 0;
    var patternIndex = 0;
    while (photoIndex < photos.length) {
      var pattern = desktopPattern[patternIndex % desktopPattern.length];
      var band = document.createElement('div');
      band.className = 'editorial-band band-' + pattern.name;
      var end = Math.min(photoIndex + pattern.size, photos.length);
      for (var index = photoIndex; index < end; index += 1) {
        band.appendChild(createFigure(photos[index], index, photos.length, index < 3, 1200, viewer));
      }
      desktop.appendChild(band);
      photoIndex = end;
      patternIndex += 1;
    }
  }

  function renderPhone(photos, viewer) {
    for (var index = 0; index < photos.length; index += 2) {
      var pair = document.createElement('div');
      pair.className = 'phone-pair ' + ((index / 2) % 2 === 0 ? 'pair-left' : 'pair-right');
      pair.appendChild(createFigure(photos[index], index, photos.length, index < 2, 760, viewer));
      if (photos[index + 1]) {
        pair.appendChild(createFigure(photos[index + 1], index + 1, photos.length, index < 2, 760, viewer));
      }
      phone.appendChild(pair);
    }
  }

  /*
    One branch, not both.

    The two layouts are different enough that CSS alone cannot express
    one from the other, so the page keeps two containers. Building both
    of them, though, put 214 <img> elements on a page that shows 107,
    and left a phone with three eager desktop-width photographs it would
    never display. So only the matching branch is built, and the other
    is built if and when the viewport crosses the breakpoint. The value
    below has to stay in step with the one in css/index.css.
  */
  var PHONE_QUERY = '(max-width: 680px)';
  var phoneQuery = window.matchMedia ? window.matchMedia(PHONE_QUERY) : null;
  var builtBranch = null;

  function renderBranch(photos, viewer) {
    var wanted = (phoneQuery && phoneQuery.matches) ? 'phone' : 'desktop';
    if (wanted === builtBranch) return;
    desktop.textContent = '';
    phone.textContent = '';
    if (wanted === 'phone') {
      renderPhone(photos, viewer);
    } else {
      renderDesktop(photos, viewer);
    }
    builtBranch = wanted;
  }

  function watchBranch(photos, viewer) {
    if (!phoneQuery) return;
    var onChange = function () { renderBranch(photos, viewer); };
    if (phoneQuery.addEventListener) {
      phoneQuery.addEventListener('change', onChange);
    } else if (phoneQuery.addListener) {
      // Safari before 14.
      phoneQuery.addListener(onChange);
    }
  }

  function showError(error) {
    count.textContent = 'The Index could not be loaded';
    count.setAttribute('role', 'alert');
    if (window.console && console.error) console.error(error);
  }

  fetch('../data/photos.json', { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('Could not load the photography data.');
      return response.json();
    })
    .then(function (photos) {
      if (!Array.isArray(photos) || !photos.length) {
        throw new Error('The photography data is empty or invalid.');
      }

      var viewer = createPhotoViewer({
        root: document.getElementById('lightbox'),
        stage: document.getElementById('lightbox-stage'),
        img: document.getElementById('lightbox-img'),
        closeBtn: document.getElementById('lightbox-close'),
        prevBtn: document.getElementById('lightbox-prev'),
        nextBtn: document.getElementById('lightbox-next'),
        fsBtn: document.getElementById('lightbox-fullscreen')
      });
      viewer.items = photos.map(function (photo) {
        return { url: photoUrl(photo, 2000), alt: photo.alt };
      });

      count.textContent = photos.length + ' photographs';
      renderBranch(photos, viewer);
      watchBranch(photos, viewer);
    })
    .catch(showError);
})();
