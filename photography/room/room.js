/* Photography room: the small things JavaScript adds to pages that already
   work without it. The wall: enlarge one board, or switch walls on a phone.
   The sheet: circles that draw once in view, a loupe on fine pointers, and
   press-and-hold zoom on touch. Everywhere: the viewer, which opens a print
   or a frame over the page and steps through its wall or sheet. Pages are
   written by tools/build-photography.py; this file is written by hand.

   Loaded synchronously in the <head>, so html.js is set before the body
   is drawn and the no-JavaScript layout never flashes. It cannot be an
   inline script: the site's Content-Security-Policy allows scripts from
   'self' only. Everything else waits for the document. */
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ---------- image addresses ----------
     /cdn-cgi/image/ only exists on the live zone. On localhost (the same
     test as photography/js/image-url.js) the original files are used. */
  var loc = window.location;
  var local = loc.protocol === 'file:' || loc.hostname === 'localhost' ||
    loc.hostname === '127.0.0.1' || loc.hostname === '';
  if (local) {
    document.querySelectorAll('img[data-orig]').forEach(function (img) {
      img.removeAttribute('srcset');
      img.src = img.getAttribute('data-orig');
    });
  }
  var imageURL = function (path, width) {
    if (local) return path;
    return '/cdn-cgi/image/width=' + width + ',fit=scale-down,format=auto/' + path.replace(/^\//, '');
  };

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
      // A print opens the viewer (below). Anywhere else on one of the two
      // boards side by side enlarges that board.
      if (e.target.closest('a')) return;
      var board = e.target.closest('.board-frame');
      if (board && !phone.matches && !walls.hasAttribute('data-focus')) {
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
  if (sheet) {
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
          loupe.style.backgroundImage = 'url("' + imageURL(link.getAttribute('data-v-src'), 1600) + '")';
        }
        loupe.style.backgroundSize = (r.width * ZOOM) + 'px ' + (r.height * ZOOM) + 'px';
        loupe.style.backgroundPosition =
          (SIZE / 2 - (e.clientX - r.left) * ZOOM) + 'px ' + (SIZE / 2 - (e.clientY - r.top) * ZOOM) + 'px';
        loupe.style.transform = 'translate(' + (e.clientX - SIZE / 2) + 'px,' + (e.clientY - SIZE / 2) + 'px)';
        loupe.hidden = false;
      });
      sheet.addEventListener('pointerleave', function () { loupe.hidden = true; current = null; });
      sheet.addEventListener('click', function () { loupe.hidden = true; });
      window.addEventListener('scroll', function () { loupe.hidden = true; }, { passive: true });
    }

    // Touch: press and hold 300ms zooms the frame 2.3x inside its own border,
    // following the finger, and dims the rest. A short tap opens the viewer.
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
    // A press-and-hold ends in a click; it must neither follow the link nor
    // open the viewer.
    sheet.addEventListener('click', function (e) {
      if (swallowClick && e.target.closest('.frame-photo')) e.preventDefault();
    });
  }

  /* ---------- the viewer ----------
     Opens over the page from any link carrying data-v-src inside a
     [data-v-list], and steps through that list. The address follows the
     photograph shown, so a copied address opens its own page; one history
     entry is added on opening, so the back button closes the viewer. */
  var viewer = null, ui = {}, items = [], index = 0, opener = null, pushed = false;
  var touchX = null, touchY = null;

  var el = function (tag, cls, parent, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  };

  var build = function () {
    viewer = el('div', 'viewer', document.body);
    viewer.hidden = true;
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-label', 'Photograph viewer');
    var bar = el('div', 'viewer-bar', viewer);
    ui.context = el('p', 'viewer-context', bar);
    ui.count = el('p', 'viewer-count', bar);
    ui.close = el('button', 'viewer-close', bar, '×');
    ui.close.type = 'button';
    ui.close.setAttribute('aria-label', 'Close the viewer');
    var stage = el('div', 'viewer-stage', viewer);
    ui.img = el('img', 'viewer-img', stage);
    ui.img.decoding = 'async';
    ui.prev = el('button', 'viewer-step viewer-prev', viewer, '←');
    ui.prev.type = 'button';
    ui.prev.setAttribute('aria-label', 'Previous photograph');
    ui.next = el('button', 'viewer-step viewer-next', viewer, '→');
    ui.next.type = 'button';
    ui.next.setAttribute('aria-label', 'Next photograph');
    var cap = el('div', 'viewer-cap', viewer);
    ui.title = el('h2', 'viewer-title', cap);
    ui.title.id = 'viewer-title';
    ui.desc = el('p', 'viewer-desc', cap);
    ui.meta = el('p', 'viewer-meta', cap);
    ui.from = el('a', 'viewer-from', el('p', '', cap));
    ui.wall = el('a', 'viewer-wall', el('p', '', cap));
    ui.hint = el('p', 'viewer-hint', viewer,
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
        ? '← → to browse · Esc to close' : 'Swipe to browse');
    ui.hint.hidden = true;
    viewer.setAttribute('aria-labelledby', 'viewer-title');

    ui.close.addEventListener('click', close);
    ui.prev.addEventListener('click', function () { step(-1); });
    ui.next.addEventListener('click', function () { step(1); });
    ui.img.addEventListener('load', function () { ui.img.classList.remove('is-loading'); });
    stage.addEventListener('click', function (e) { if (e.target === stage) close(); });

    viewer.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { touchX = null; return; }
      touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
    }, { passive: true });
    viewer.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
      touchX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    });
  };

  // The smallest Cloudflare width that fills the stage on this screen.
  var widthFor = function (w, h) {
    var dpr = window.devicePixelRatio || 1;
    var need = Math.min(window.innerWidth, window.innerHeight * 0.8 * w / h) * dpr;
    var ladder = [800, 1200, 1600, 2000];
    for (var i = 0; i < ladder.length; i += 1) if (ladder[i] >= need) return ladder[i];
    return 2000;
  };

  var srcFor = function (link) {
    var w = +link.getAttribute('data-v-w'), h = +link.getAttribute('data-v-h');
    return imageURL(link.getAttribute('data-v-src'), widthFor(w, h));
  };

  var setLine = function (node, text, href) {
    node.parentNode.hidden = !text;
    node.textContent = text || '';
    if (href !== undefined) node.href = href || '';
  };

  var show = function (i) {
    index = i;
    var link = items[i], d = function (k) { return link.getAttribute('data-v-' + k) || ''; };
    if (!reduce) ui.img.classList.add('is-loading');
    ui.img.width = +d('w'); ui.img.height = +d('h');
    ui.img.alt = d('desc');
    ui.img.src = srcFor(link);
    if (ui.img.complete) ui.img.classList.remove('is-loading');
    ui.count.textContent = (i + 1) + ' / ' + items.length;
    ui.title.textContent = d('title');
    ui.desc.textContent = d('desc');
    ui.meta.hidden = !d('meta');
    ui.meta.textContent = d('meta');
    setLine(ui.from, d('from'), d('from-href'));
    setLine(ui.wall, d('wall'), d('wall-href'));
    ui.prev.disabled = i === 0;
    ui.next.disabled = i === items.length - 1;
    var href = link.getAttribute('href');
    if (pushed) history.replaceState({ roomViewer: true }, '', href);
    [i - 1, i + 1].forEach(function (n) {
      if (n >= 0 && n < items.length) { var pre = new Image(); pre.src = srcFor(items[n]); }
    });
  };

  var step = function (by) {
    var n = index + by;
    if (n >= 0 && n < items.length) show(n);
  };

  // The hint shows the first HINT_TIMES times the viewer opens in this
  // browser. Storage can be missing or blocked; then it simply shows.
  var HINT_TIMES = 3, HINT_KEY = 'room-viewer-opens';
  var hintWanted = function () {
    try {
      var seen = parseInt(window.localStorage.getItem(HINT_KEY), 10) || 0;
      window.localStorage.setItem(HINT_KEY, String(seen + 1));
      return seen < HINT_TIMES;
    } catch (err) {
      return true;
    }
  };

  var open = function (link) {
    if (!viewer) build();
    ui.hint.hidden = !hintWanted();
    var list = link.closest('[data-v-list]');
    items = Array.prototype.slice.call(list.querySelectorAll('a[data-v-src]'));
    opener = link;
    ui.context.textContent = list.getAttribute('data-v-context') || '';
    history.pushState({ roomViewer: true }, '', link.getAttribute('href'));
    pushed = true;
    show(items.indexOf(link));
    viewer.hidden = false;
    document.body.classList.add('viewer-open');
    ui.close.focus();
  };

  var finish = function () {
    viewer.hidden = true;
    document.body.classList.remove('viewer-open');
    if (opener) opener.focus({ preventScroll: false });
  };

  // Closing goes back through history, so the address returns to the page
  // the viewer was opened on; popstate then hides the viewer.
  function close() {
    if (pushed) { history.back(); return; }
    finish();
  }

  window.addEventListener('popstate', function () {
    if (viewer && !viewer.hidden) { pushed = false; finish(); }
  });

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest('a[data-v-src]');
    if (!link || !link.closest('[data-v-list]')) return;
    e.preventDefault();
    open(link);
  });

  /* ---------- a photograph page ----------
     Left and right arrows follow the page's own previous and next links,
     except while typing in a field. */
  var steps = document.querySelector('.photo-steps');
  if (steps) {
    document.addEventListener('keydown', function (e) {
      if (viewer && !viewer.hidden) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      var rel = e.key === 'ArrowLeft' ? 'prev' : e.key === 'ArrowRight' ? 'next' : null;
      var link = rel && steps.querySelector('a[rel="' + rel + '"]');
      if (link) { e.preventDefault(); window.location.href = link.href; }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!viewer || viewer.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); return; }
    if (e.key === 'Tab') {
      // Keep focus inside the viewer while it is open.
      var focusable = Array.prototype.filter.call(
        viewer.querySelectorAll('button, a[href]'),
        function (n) { return !n.disabled && n.offsetParent !== null; });
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || !viewer.contains(document.activeElement))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !viewer.contains(document.activeElement))) {
        e.preventDefault(); first.focus();
      }
    }
  });
});
