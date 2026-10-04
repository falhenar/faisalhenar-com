/* Photography room: the small things JavaScript adds to pages that already
   work without it. The wall: enlarge one board, or switch walls on a phone.
   The sheet: circles that draw once in view, a loupe on fine pointers, and
   press-and-hold zoom on touch. Pages are written by
   tools/build-photography.py; this file is written by hand.

   Loaded synchronously in the <head>, so html.js is set before the body
   is drawn and the no-JavaScript layout never flashes. It cannot be an
   inline script: the site's Content-Security-Policy allows scripts from
   'self' only. Everything else waits for the document. */
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ---------- local preview ----------
     /cdn-cgi/image/ only exists on the live zone. On localhost (the same
     test as photography/js/image-url.js) swap in the original files. */
  var loc = window.location;
  if (loc.protocol === 'file:' || loc.hostname === 'localhost' ||
      loc.hostname === '127.0.0.1' || loc.hostname === '') {
    document.querySelectorAll('img[data-orig]').forEach(function (img) {
      img.removeAttribute('srcset');
      img.src = img.getAttribute('data-orig');
    });
    document.querySelectorAll('a[data-orig]').forEach(function (a) {
      a.href = a.getAttribute('data-orig');
    });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the wall ---------- */
  var walls = document.querySelector('[data-walls]');
  if (walls) {
    var phone = window.matchMedia('(max-width: 760px)');
    var sections = walls.querySelectorAll('[data-wall]');

    var setInert = function () {
      var focus = walls.getAttribute('data-focus');
      sections.forEach(function (s) {
        s.inert = !phone.matches && !!focus && s.getAttribute('data-wall') !== focus;
      });
    };

    var enlarge = function (tone) {
      walls.setAttribute('data-focus', tone);
      setInert();
      var tools = walls.querySelector('.wall--' + tone + ' .wall-tools button');
      if (tools) tools.focus({ preventScroll: true });
      var top = walls.getBoundingClientRect().top + window.pageYOffset - 16;
      if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    };

    var both = function (from) {
      walls.removeAttribute('data-focus');
      setInert();
      var btn = walls.querySelector('.wall--' + from + ' .wall-enlarge');
      if (btn) btn.focus({ preventScroll: true });
    };

    walls.addEventListener('click', function (e) {
      var t = e.target.closest('[data-enlarge], [data-show]');
      if (t) {
        if (t.hasAttribute('data-show')) both(t.closest('[data-wall]').getAttribute('data-wall'));
        else enlarge(t.getAttribute('data-enlarge'));
        return;
      }
      // Two boards side by side: a click anywhere on one enlarges it.
      var board = e.target.closest('.board-frame');
      if (board && !phone.matches && !walls.hasAttribute('data-focus')) {
        e.preventDefault();
        enlarge(board.closest('[data-wall]').getAttribute('data-wall'));
      }
    });

    var switcher = document.querySelectorAll('[data-pick]');
    switcher.forEach(function (btn) {
      if (btn === walls) return;
      btn.addEventListener('click', function () {
        var tone = btn.getAttribute('data-pick');
        walls.setAttribute('data-pick', tone);
        switcher.forEach(function (b) {
          if (b !== walls) b.setAttribute('aria-pressed', String(b === btn));
        });
      });
    });

    if (phone.addEventListener) phone.addEventListener('change', setInert);
  }

  /* ---------- the sheet ---------- */
  var sheet = document.querySelector('[data-sheet]');
  if (!sheet) return;

  // Circles draw once, the first time they are seen.
  var circled = sheet.querySelectorAll('.frame--circled');
  if (reduce || !('IntersectionObserver' in window)) {
    circled.forEach(function (f) { f.classList.add('is-drawn'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-drawn'); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    circled.forEach(function (f) { io.observe(f); });
  }

  // Where the photograph actually sits inside its letterboxed frame.
  var imageRect = function (img) {
    var box = img.getBoundingClientRect();
    var ratio = img.naturalWidth && img.naturalHeight
      ? img.naturalWidth / img.naturalHeight
      : img.width / img.height;
    var w = box.width, h = box.width / ratio;
    if (h > box.height) { h = box.height; w = h * ratio; }
    return { left: box.left + (box.width - w) / 2, top: box.top + (box.height - h) / 2, width: w, height: h };
  };

  // Loupe: a 120px ring at 2.5x, following a fine pointer over a frame.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var SIZE = 120, ZOOM = 2.5;
    var loupe = document.createElement('div');
    loupe.className = 'loupe';
    loupe.hidden = true;
    loupe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(loupe);
    var current = null;

    sheet.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var link = e.target.closest('.frame-photo');
      var img = link && link.querySelector('img');
      if (!img) { loupe.hidden = true; current = null; return; }
      var r = imageRect(img);
      if (e.clientX < r.left || e.clientX > r.left + r.width ||
          e.clientY < r.top || e.clientY > r.top + r.height) { loupe.hidden = true; return; }
      if (current !== link) {
        current = link;
        loupe.style.backgroundImage = 'url("' + link.href + '")';
      }
      loupe.style.backgroundSize = (r.width * ZOOM) + 'px ' + (r.height * ZOOM) + 'px';
      loupe.style.backgroundPosition =
        (SIZE / 2 - (e.clientX - r.left) * ZOOM) + 'px ' + (SIZE / 2 - (e.clientY - r.top) * ZOOM) + 'px';
      loupe.style.transform = 'translate(' + (e.clientX - SIZE / 2) + 'px,' + (e.clientY - SIZE / 2) + 'px)';
      loupe.hidden = false;
    });
    sheet.addEventListener('pointerleave', function () { loupe.hidden = true; current = null; });
    window.addEventListener('scroll', function () { loupe.hidden = true; }, { passive: true });
  }

  // Touch: press and hold 300ms zooms the frame 2.3x inside its own border,
  // following the finger, and dims the rest. A short tap follows the link.
  var HOLD = 300, SLOP = 10;
  var timer = null, zoomed = null, start = null, swallowClick = false;

  var origin = function (link, touch) {
    var b = link.getBoundingClientRect();
    var x = Math.min(Math.max((touch.clientX - b.left) / b.width, 0), 1);
    var y = Math.min(Math.max((touch.clientY - b.top) / b.height, 0), 1);
    var img = link.querySelector('img');
    img.style.setProperty('--zx', (x * 100) + '%');
    img.style.setProperty('--zy', (y * 100) + '%');
  };

  var endZoom = function () {
    clearTimeout(timer); timer = null;
    if (!zoomed) return;
    zoomed.classList.remove('is-zoomed');
    sheet.classList.remove('is-zooming');
    zoomed = null;
    swallowClick = true;
    setTimeout(function () { swallowClick = false; }, 400);
  };

  sheet.addEventListener('touchstart', function (e) {
    var link = e.target.closest('.frame-photo');
    if (!link || e.touches.length > 1) { endZoom(); return; }
    var t = e.touches[0];
    start = { x: t.clientX, y: t.clientY };
    timer = setTimeout(function () {
      zoomed = link.closest('.frame');
      origin(link, t);
      zoomed.classList.add('is-zoomed');
      sheet.classList.add('is-zooming');
    }, HOLD);
  }, { passive: true });

  sheet.addEventListener('touchmove', function (e) {
    var t = e.touches[0];
    if (zoomed) {
      e.preventDefault();
      origin(zoomed.querySelector('.frame-photo'), t);
    } else if (timer && (Math.abs(t.clientX - start.x) > SLOP || Math.abs(t.clientY - start.y) > SLOP)) {
      clearTimeout(timer); timer = null;
    }
  }, { passive: false });

  sheet.addEventListener('touchend', endZoom);
  sheet.addEventListener('touchcancel', endZoom);
  sheet.addEventListener('contextmenu', function (e) {
    if (zoomed || swallowClick) e.preventDefault();
  });
  sheet.addEventListener('click', function (e) {
    if (swallowClick && e.target.closest('.frame-photo')) e.preventDefault();
  });
});
