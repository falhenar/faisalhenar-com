/*
  NOTEBOOK: THE INSTRUCTION SHEETS (October 2026)
  ------------------------------------------------
  One page that arranges itself three ways: desktop (a side column that
  stays in view), phone (one column) and print (A4, two columns). The page's
  own order is the phone and print order; on a desktop the glossary of notes
  is moved up into the side column, and moved back while printing.

  The language switch swaps English and Dutch in place: it reads the twin
  page (each language keeps its full text in its own HTML and its own
  address), puts its header labels, content and footer into this page, and
  changes the address with history.replaceState, so the URL always names
  the language on screen. Without JavaScript it is never shown a reason to
  run: the buttons sit beside two plain pages that link to each other.
*/
(function () {
  'use strict';

  var WIDE = window.matchMedia('(min-width: 900px)');
  var NB = window.NB || { still: true };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var observer = null;

  function placeGloss(forPrint) {
    var gloss = $('.nb-gloss'), slot = $('.nb-side-gloss'), home = $('.nb-credit');
    if (!gloss || !slot || !home) return;
    if (WIDE.matches && !forPrint) { if (gloss.parentNode !== slot) slot.appendChild(gloss); }
    else if (gloss.nextElementSibling !== home) home.parentNode.insertBefore(gloss, home);
  }

  function outline() {
    if (observer) observer.disconnect();
    var links = $$('.nb-ol');
    if (!links.length || !('IntersectionObserver' in window)) return;
    function mark(id) {
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) mark(e.target.id); });
    }, { rootMargin: '-20% 0px -70% 0px' });
    $$('.nb-sec').forEach(function (s) { observer.observe(s); });
    mark('s1');
  }

  function setup() {
    placeGloss(false);
    outline();
    $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });
    $$('.nb-lg').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-pressed') === 'true') return;
        swap(b);
      });
    });
  }

  var busy = false;
  function swap(button) {
    var main = $('main.nb-sheet');
    var twin = main && main.getAttribute('data-twin');
    if (!twin || busy) return;
    busy = true;
    fetch(twin, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(twin);
      return r.text();
    }).then(function (text) {
      var doc = new DOMParser().parseFromString(text, 'text/html');
      var next = $('main.nb-sheet', doc);
      if (!next) throw new Error('no sheet');
      document.documentElement.lang = doc.documentElement.lang;
      document.title = doc.title;
      [['.skip-link', 'textContent'], ['.room-header .section-label', 'textContent'], ['.menu-panel', 'innerHTML'],
       ['.site-footer', 'innerHTML']].forEach(function (p) {
        var here = $(p[0]), there = $(p[0], doc);
        if (here && there) here[p[1]] = there[p[1]];
      });
      var printTitle = $('#nb-print-title'), nextPrint = $('#nb-print-title', doc);
      if (printTitle && nextPrint) printTitle.textContent = nextPrint.textContent;
      var canonical = $('link[rel="canonical"]'), nextCanonical = $('link[rel="canonical"]', doc);
      if (canonical && nextCanonical) canonical.href = nextCanonical.href;
      main.replaceWith(document.importNode(next, true));
      var year = document.getElementById('year');
      if (year) year.textContent = new Date().getFullYear();
      history.replaceState(null, '', twin + window.location.hash);
      setup();
      document.dispatchEvent(new CustomEvent('nb:swapped'));
      var same = $('.nb-lg[data-lang="' + button.getAttribute('data-lang') + '"]');
      if (same) same.focus();
    }).catch(function () {
      window.location.href = twin;   // the plain way still works
    }).then(function () { busy = false; });
  }

  WIDE.addEventListener('change', function () { placeGloss(false); });
  window.addEventListener('beforeprint', function () { placeGloss(true); });
  window.addEventListener('afterprint', function () { placeGloss(false); });
  setup();
})();
