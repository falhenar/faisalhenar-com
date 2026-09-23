/*
  REFLECTIONS: KEEPING OLD LINKS WORKING
  ---------------------------------------
  Until September 2026 this file built the whole archive in the browser:
  every Reflection collapsed into an accordion on practice/reflections.html,
  each one addressable only as #r-<id> on that page. The essays are now
  static pages of their own, written by tools/build-reflections.py, and the
  archive is a plain contents list generated into the page. There is nothing
  left to render.

  What is left is the promise made to anyone who ever shared a link. A URL
  of the form

      practice/reflections.html#r-itbw-1-1-1

  still has to arrive at the Reflection it named. GitHub Pages serves static
  files and cannot redirect, so the redirect happens here, in the one place
  that knows which id belongs to which page: suttas-config.js, where every
  published entry carries a frozen `slug`.

  location.replace, not location.href: the old URL should not sit in the
  back button, waiting to bounce the reader forward again.

  This file can be deleted only once those links are certain to be gone,
  which is to say not for years.
*/
(function(){

  var hash = window.location.hash;
  if (!hash || hash.indexOf('#r-') !== 0) return;
  if (typeof SUTTAS === 'undefined' || !Array.isArray(SUTTAS)) return;

  var id = hash.slice(3);
  var match = SUTTAS.filter(function(s){
    return s && s.id === id && s.slug && s.note && s.note.trim().length > 0 && s.added;
  })[0];
  if (!match) return;

  window.location.replace('reflections/' + encodeURIComponent(match.slug) + '.html');

})();
