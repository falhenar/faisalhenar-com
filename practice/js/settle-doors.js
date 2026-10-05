/*
  Practice hub: after arrival the door drawings rest (October 2026).
  Adds .settled to <html> once the arrival drawing is over; from then on
  practice.css draws a door again only while it is hovered or focused.
  A separate file, not inline: the site's Content-Security-Policy
  (script-src 'self') blocks inline scripts on the live domain.

  The English hub draws its dharma wheel first and the doors after it
  (.after-wheel), so it settles later: 1.6s of wheel, the last door's
  1.25s stagger and its 2.4s drawing. On touch devices the doors draw as
  they scroll into view instead (/js/draw-on-view.js) and there is no
  hover to redraw them, so there is nothing to settle.
*/
(function(){
  var d = document.documentElement;
  if (d.classList.contains('draw-on-view')) return;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wait = document.querySelector('.after-wheel') ? 5400 : 3800;
  setTimeout(function(){ d.classList.add('settled'); }, still ? 0 : wait);
})();
