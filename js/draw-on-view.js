/*
  Draw the doors as they come into view, on touch devices (October 2026).

  On a device without hover there is no hover redraw, and the doors on the
  Practice hub, the Dutch hub and the landing page all drew at once on
  arrival, mostly below the fold where nobody saw it. Here each door draws
  once, when at least half of its drawing has scrolled into view; a door
  already visible on arrival draws straight away. Once per door per page
  view: a drawn door is not observed again.

  Loaded in the <head>, not deferred, so the class below is on <html>
  before the first paint and a door is never shown drawn and then undrawn.
  The CSS hides the strokes only under html.draw-on-view, so with
  JavaScript off, without IntersectionObserver, with a mouse, or with
  reduced motion, nothing here applies and the doors show as before.
*/
(function(){
  var d = document.documentElement;
  if (!window.matchMedia || !('IntersectionObserver' in window)) return;
  if (!window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  d.classList.add('draw-on-view');

  function start(){
    var doors = document.querySelectorAll('.drawn-doors .ic, .rooms .door-sign');
    var seen = new IntersectionObserver(function(entries){
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].intersectionRatio >= 0.5) {
          entries[i].target.classList.add('drawn');
          seen.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.5 });
    for (var i = 0; i < doors.length; i++) seen.observe(doors[i]);
  }

  // Watch only once the page has fully loaded, web fonts included. Before
  // that the fallback fonts set shorter text, a door can sit in view for a
  // moment, get drawn, and then be pushed below the fold.
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
