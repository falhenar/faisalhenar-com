/*
  Practice hub: after arrival the door drawings rest (October 2026).
  Adds .settled to <html> once the arrival drawing is over; from then on
  practice.css draws a door again only while it is hovered or focused.
  A separate file, not inline: the site's Content-Security-Policy
  (script-src 'self') blocks inline scripts on the live domain.
*/
(function(){
  var d = document.documentElement;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(function(){ d.classList.add('settled'); }, still ? 0 : 3800);
})();
