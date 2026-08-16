/* Loads the ordered master collection and the curated Exhibition. */
(function () {
  function loadJson(path) {
    return fetch(path, { credentials: 'same-origin' }).then(function (response) {
      if (!response.ok) throw new Error('Could not load ' + path + ': ' + response.status);
      return response.json();
    });
  }

  window.PHOTOGRAPHY_DATA_READY = Promise.all([
    loadJson('data/photos.json'),
    loadJson('data/exhibition.json')
  ]).then(function (loaded) {
    var photos = loaded[0];
    var exhibition = loaded[1];
    if (!Array.isArray(photos) || !Array.isArray(exhibition)) {
      throw new Error('Photography data has an invalid shape.');
    }

    var registry = {};
    photos.forEach(function (photo) {
      if (!photo || typeof photo.id !== 'string' || registry[photo.id]) {
        throw new Error('Photography data contains an invalid or duplicate ID.');
      }
      var copy = {};
      Object.keys(photo).forEach(function (key) {
        if (key !== 'id') copy[key] = photo[key];
      });
      registry[photo.id] = copy;
    });

    window.PHOTOS = registry;
    window.EXHIBITION = exhibition;
  });
})();
