/*
  NOTEBOOK: DRAWING-IN (October 2026)
  ------------------------------------
  The drawings ink themselves in with CSS alone (notebook.css: .ink, with
  pathLength="1" on every stroke and a --d delay per drawing, copied from
  the design boards). This file holds the two things CSS cannot do:

  1. The hub's arrival sequence plays on every load and reload, and again
     when the page comes back from the back/forward cache. Loaded in
     <head>, so the class is on before the body is drawn.
  2. NB.restart(): replays a one-off movement on an element (the pen tips,
     the bell rings) by taking its class off and putting it back.

  Under prefers-reduced-motion nothing animates: the CSS has no motion
  outside a no-preference query, and restart() does nothing.

  A separate file, not inline: the site's Content-Security-Policy
  (script-src 'self') blocks inline scripts.
*/
(function () {
  'use strict';
  var html = document.documentElement;
  var still = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function restart(el, cls) {
    if (!el || still) return;
    el.classList.remove(cls);
    void el.getBoundingClientRect();
    el.classList.add(cls);
  }

  window.NB = { still: still, restart: restart };

  if (html.hasAttribute('data-arrival') && !still) {
    html.classList.add('nb-arrive');
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      html.classList.remove('nb-arrive');
      void html.offsetWidth;   // let the animations end before they start again
      html.classList.add('nb-arrive');
    });
  }
})();
