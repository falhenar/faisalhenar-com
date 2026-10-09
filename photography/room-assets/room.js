/* Photography room: the small things JavaScript adds to pages that already
   work without it. The wall: the prints pin themselves in once a session,
   enlarge one board, or swipe between the walls on a phone. The sheets:
   circles that draw once in view. The sheet: the walk line answering the
   frames, a loupe on fine pointers, press-and-hold zoom on touch, and a
   swipe to the sheet either side. Everything: the place and tone filters,
   kept in the address. Everywhere: the viewer, which opens a print, frame
   or photograph over the page and steps through what is visible. Pages are
   written by tools/build-photography.py; this file is written by hand.

   Loaded synchronously in the <head>, so html.js is set before the body
   is drawn and the no-JavaScript layout never flashes. It cannot be an
   inline script: the site's Content-Security-Policy allows scripts from
   'self' only. Everything else waits for the document. */
document.documentElement.classList.add('js');

// The wall's arrival plays once per browser session. The class goes on now,
// before the body is drawn; the wall marks it seen once it is there.
try {
  if (!window.sessionStorage.getItem('room-arrived')) document.documentElement.classList.add('arrive');
} catch (err) { /* no storage: no arrival, the prints simply hang */ }

// Sheet to sheet: the new page learns from the old which way the reader
// went (a swipe or a binder link), so the view transition slides that way.
window.addEventListener('pagereveal', function (e) {
  var way = null;
  try {
    way = window.sessionStorage.getItem('room-sheet-way');
    window.sessionStorage.removeItem('room-sheet-way');
  } catch (err) { /* no storage: the browser's own cross-fade */ }
  if (e.viewTransition && (way === 'earlier' || way === 'later')) e.viewTransition.types.add('to-' + way);
});

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
    try { window.sessionStorage.setItem('room-arrived', '1'); } catch (err) { /* see above */ }

    // Arrival: each print pins in at its turn in wall order (85ms apart,
    // the colour wall 40ms behind), but not before its photograph is there,
    // or 1.5s have passed. A slow print simply joins later. Under reduced
    // motion a print just appears once loaded.
    if (document.documentElement.classList.contains('arrive')) {
      var t0 = Date.now(), WAIT = 1500;
      walls.querySelectorAll('.print').forEach(function (print) {
        var img = print.querySelector('img');
        var turn = 120 + (+print.style.getPropertyValue('--i') || 0) * 85 + (print.closest('.wall--colour') ? 40 : 0);
        var pinned = false;
        var pin = function () {
          if (pinned) return;
          pinned = true;
          setTimeout(function () { print.classList.add('is-pinned'); }, reduce ? 0 : Math.max(0, turn - (Date.now() - t0)));
        };
        if (!img || (img.complete && img.naturalWidth)) pin();
        else {
          img.addEventListener('load', pin);
          img.addEventListener('error', pin);
          setTimeout(pin, WAIT);
        }
      });
    }
    var phone = window.matchMedia('(max-width: 999px)');
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

    // Phone and tablet: the two walls sit in one row that snaps, one to a
    // screen. A label scrolls to its wall; the wall in view presses its label.
    var switcher = document.querySelectorAll('[data-pick]');
    var press = function (tone) {
      switcher.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pick') === tone)); });
    };
    switcher.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = walls.querySelector('[data-wall="' + btn.getAttribute('data-pick') + '"]');
        press(btn.getAttribute('data-pick'));
        walls.scrollTo({ left: target.offsetLeft - walls.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    if ('IntersectionObserver' in window) {
      var inView = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && phone.matches) press(en.target.getAttribute('data-wall'));
        });
      }, { root: walls, threshold: 0.6 });
      sections.forEach(function (s) { inView.observe(s); });
    }

    if (phone.addEventListener) phone.addEventListener('change', setInert);
  }

  /* ---------- circles ----------
     On a sheet and on the list of sheets, circles draw once, the first
     time they are seen. */
  var circled = document.querySelectorAll('.frame--circled');
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

  /* ---------- the sheet ---------- */
  var sheet = document.querySelector('[data-sheet]');
  if (sheet) {
    // The walk line: a frame lights its tick, a tick lights its frame.
    var ticks = document.querySelectorAll('[data-tick]');
    if (ticks.length) {
      var lit = null;
      var light = function (k, withFrame) {
        if (lit !== null) {
          document.querySelectorAll('[data-tick="' + lit + '"], [data-frame="' + lit + '"]').forEach(function (n) { n.classList.remove('is-lit'); });
        }
        lit = k;
        if (k === null) return;
        var lights = document.querySelectorAll('[data-tick="' + k + '"]' + (withFrame ? ', [data-frame="' + k + '"]' : ''));
        lights.forEach(function (n) { n.classList.add('is-lit'); });
      };
      var fromFrame = function (e) {
        var f = e.target.closest && e.target.closest('[data-frame]');
        light(f ? f.getAttribute('data-frame') : null, false);
      };
      sheet.addEventListener('mouseover', fromFrame);
      sheet.addEventListener('mouseleave', function () { light(null); });
      sheet.addEventListener('focusin', fromFrame);
      sheet.addEventListener('focusout', function () { light(null); });
      var ruler = ticks[0].parentNode;
      ruler.addEventListener('mouseover', function (e) {
        var t = e.target.closest('[data-tick]');
        light(t ? t.getAttribute('data-tick') : null, true);
      });
      ruler.addEventListener('mouseleave', function () { light(null); });
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

    var zoomEnded = 0;
    var endZoom = function () {
      clearTimeout(timer); timer = null;
      if (!zoomed) return;
      zoomEnded = Date.now();
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
        zoomedAt = Date.now();
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

    /* Swipe between sheets (phones and tablets). A horizontal swipe on the
       page goes to the earlier sheet (right) or the later one (left), with
       the viewer's thresholds. Not from the screen edges (the iPhone's back
       gesture), not with two fingers, not during or just after a
       press-and-hold zoom, not on a long press of a link, a form control
       or anything that scrolls sideways, and not while pinch-zoomed. The
       binder links stay the main way. */
    var binderLinks = document.querySelectorAll('[data-binder]');
    var remember = function (way) {
      try { window.sessionStorage.setItem('room-sheet-way', way); } catch (err) { /* a plain load */ }
    };
    binderLinks.forEach(function (a) {
      a.addEventListener('click', function () { remember(a.getAttribute('data-binder')); });
    });
    // A swipe may start on a frame: the frames are most of the sheet. It
    // only stops being a swipe when the finger rested long enough to become
    // a press (the zoom's hold timer fired, or it stayed within SLOP for
    // LONG ms before moving). Earlier the whole gesture's length counted,
    // so any unhurried swipe across the frames was dropped.
    var EDGE = 24, LONG = 500;
    var swipe = null, zoomedAt = 0;
    var scrollsSideways = function (node) {
      for (; node && node !== document.body; node = node.parentElement) {
        var ox = window.getComputedStyle(node).overflowX;
        if ((ox === 'auto' || ox === 'scroll') && node.scrollWidth > node.clientWidth) return true;
      }
      return false;
    };
    document.addEventListener('touchstart', function (e) {
      swipe = null;
      var t = e.touches[0];
      var why = e.touches.length !== 1 ? 'two fingers'
        : viewer && !viewer.hidden ? 'viewer is open'
        : t.clientX < EDGE || t.clientX > window.innerWidth - EDGE ? 'started at the screen edge'
        : window.visualViewport && window.visualViewport.scale > 1.01 ? 'page is pinch-zoomed'
        : e.target.closest('input, select, textarea, button, [contenteditable]') ? 'started on a control'
        : scrollsSideways(e.target) ? 'started on something that scrolls sideways'
        : Date.now() - zoomEnded < 400 ? 'just after a zoom' : '';
      if (why) return;
      swipe = { x: t.clientX, y: t.clientY, lx: t.clientX, ly: t.clientY, at: Date.now(), link: !!e.target.closest('a'), moved: false, why: '' };
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (!swipe) return;
      if (e.touches.length !== 1) { swipe.why = 'two fingers'; return; }
      var t = e.touches[0];
      swipe.lx = t.clientX; swipe.ly = t.clientY;
      if (!swipe.moved && (Math.abs(t.clientX - swipe.x) > SLOP || Math.abs(t.clientY - swipe.y) > SLOP)) {
        swipe.moved = true;
        if (swipe.link && Date.now() - swipe.at >= LONG) swipe.why = 'long press on a link';
      }
    }, { passive: true });
    var endSwipe = function (e, how) {
      var s = swipe; swipe = null;
      if (!s) return;
      var c = e.changedTouches && e.changedTouches[0];
      var x = c ? c.clientX : s.lx, y = c ? c.clientY : s.ly;
      if (how === 'touchcancel') { x = s.lx; y = s.ly; }
      var dx = x - s.x, dy = y - s.y;
      var why = (zoomedAt >= s.at ? 'became a press-and-hold zoom' : '') || s.why
        || (viewer && !viewer.hidden ? 'viewer is open' : '')
        || (!(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) ? 'not a horizontal swipe' : '');
      var link = !why && document.querySelector('[data-binder="' + (dx > 0 ? 'earlier' : 'later') + '"]');
      if (!why && !link) why = 'no ' + (dx > 0 ? 'earlier' : 'later') + ' sheet';
      if (why) return;
      remember(link.getAttribute('data-binder'));
      window.location.href = link.href;
    };
    document.addEventListener('touchend', function (e) { endSwipe(e, 'touchend'); });
    // A browser that takes the gesture over sends touchcancel instead of
    // touchend; the last position seen still tells which way it went.
    document.addEventListener('touchcancel', function (e) { endSwipe(e, 'touchcancel'); });

    // The hint shows on touch screens, on the first SWIPE_TIMES sheets seen
    // in this browser. Storage can be missing or blocked; then it shows.
    var SWIPE_TIMES = 3, SWIPE_KEY = 'room-sheet-visits';
    var hint = document.querySelector('[data-swipe-hint]');
    if (hint && binderLinks.length && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      try {
        var visits = parseInt(window.localStorage.getItem(SWIPE_KEY), 10) || 0;
        window.localStorage.setItem(SWIPE_KEY, String(visits + 1));
        hint.hidden = visits >= SWIPE_TIMES;
      } catch (err) {
        hint.hidden = false;
      }
    }
  }

  /* ---------- everything ----------
     Place and tone filters. They combine, they live in the address
     (?place=vietnam&tone=bw) so a filtered view can be shared and reloaded,
     and they tell the viewer what to call the list it steps through. */
  var every = document.querySelector('[data-everything]');
  var filters = document.querySelector('[data-filters]');
  if (every && filters) {
    var NAMES = {
      place: { all: '', suriname: 'Suriname', vietnam: 'Vietnam' },
      tone: { all: '', bw: 'black and white', colour: 'colour' }
    };
    var state = { place: 'all', tone: 'all' };
    var params = new URLSearchParams(window.location.search);
    Object.keys(state).forEach(function (key) {
      var value = params.get(key);
      if (value && Object.prototype.hasOwnProperty.call(NAMES[key], value)) state[key] = value;
    });
    var photos = every.querySelectorAll('.ev-item');
    var months = every.querySelectorAll('[data-month]');
    var buttons = filters.querySelectorAll('[data-filter]');
    var count = filters.querySelector('[data-count]');

    var apply = function (remember) {
      var shown = 0;
      photos.forEach(function (a) {
        var show = (state.place === 'all' || a.getAttribute('data-place') === state.place) &&
          (state.tone === 'all' || a.getAttribute('data-tone') === state.tone);
        a.hidden = !show;
        if (show) shown += 1;
      });
      months.forEach(function (m) {
        var n = m.querySelectorAll('.ev-item:not([hidden])').length;
        m.hidden = !n;
        var c = m.querySelector('[data-month-count]');
        if (c) c.textContent = n + (n === 1 ? ' print' : ' prints');
      });
      count.textContent = shown;
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', String(state[b.getAttribute('data-filter')] === b.getAttribute('data-value')));
      });
      every.setAttribute('data-v-context',
        ['Everything', NAMES.place[state.place], NAMES.tone[state.tone]].filter(Boolean).join(', '));
      if (remember) {
        var query = new URLSearchParams(window.location.search);
        Object.keys(state).forEach(function (key) {
          if (state[key] === 'all') query.delete(key); else query.set(key, state[key]);
        });
        var q = query.toString();
        history.replaceState(history.state, '', window.location.pathname + (q ? '?' + q : '') + window.location.hash);
      }
    };

    filters.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (!b) return;
      state[b.getAttribute('data-filter')] = b.getAttribute('data-value');
      apply(true);
    });
    apply(false);
  }

  /* ---------- the viewer ----------
     Opens over the page from any link carrying data-v-src inside a
     [data-v-list], and steps through that list. The address follows the
     photograph shown, so a copied address opens its own page; one history
     entry is added on opening, so the back button closes the viewer. */
  var viewer = null, ui = {}, items = [], index = 0, opener = null, pushed = false;
  var touchX = null, touchY = null;
  var full = false, idleTimer = null;
  var ICON_ENTER = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M2 7V2h5M13 2h5v5M18 13v5h-5M7 18H2v-5"/></svg>';
  var ICON_EXIT = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M7 2v5H2M18 7h-5V2M13 18v-5h5M2 13h5v5"/></svg>';

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
    ui.full = el('button', 'viewer-full', bar);
    ui.full.type = 'button';
    ui.full.innerHTML = ICON_ENTER;
    ui.full.setAttribute('aria-label', 'Full screen');
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
        ? '← → to browse · F full screen · Esc to close' : 'Swipe to browse');
    ui.hint.hidden = true;
    viewer.setAttribute('aria-labelledby', 'viewer-title');

    ui.close.addEventListener('click', close);
    ui.full.addEventListener('click', toggleFull);
    ['mousemove', 'touchstart', 'keydown'].forEach(function (type) {
      viewer.addEventListener(type, wake, { passive: true });
    });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (type) {
      document.addEventListener(type, function () { setFull(!!fullElement()); });
    });
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

  // The smallest Cloudflare width that fills the stage on this screen (in
  // full screen, the whole screen).
  var widthFor = function (w, h) {
    var dpr = window.devicePixelRatio || 1;
    var need = Math.min(window.innerWidth, window.innerHeight * (full ? 1 : 0.8) * w / h) * dpr;
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

  /* Full screen: the photograph alone on black, the controls fading out
     after IDLE ms without movement, touch or key. The Fullscreen API where
     there is one; elsewhere (iPhone) the same look inside the window. */
  var IDLE = 2000;
  var fullElement = function () { return document.fullscreenElement || document.webkitFullscreenElement || null; };
  var canFull = function () {
    return !!(viewer && (viewer.requestFullscreen || viewer.webkitRequestFullscreen) &&
      (document.fullscreenEnabled || document.webkitFullscreenEnabled));
  };
  var wake = function () {
    if (!viewer) return;
    viewer.classList.remove('is-idle');
    clearTimeout(idleTimer);
    if (full) idleTimer = setTimeout(function () { viewer.classList.add('is-idle'); }, IDLE);
  };
  var setFull = function (on) {
    if (!viewer || full === on) return;
    full = on;
    viewer.classList.toggle('is-full', on);
    ui.full.innerHTML = on ? ICON_EXIT : ICON_ENTER;
    ui.full.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen');
    wake();
    if (items[index]) ui.img.src = srcFor(items[index]);
  };
  function toggleFull() {
    if (full) { leaveFull(); return; }
    if (canFull()) {
      var go = viewer.requestFullscreen ? viewer.requestFullscreen() : viewer.webkitRequestFullscreen();
      if (go && go.catch) go.catch(function () { setFull(true); });
    } else {
      setFull(true);
    }
  }
  function leaveFull() {
    if (fullElement()) {
      var out = document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
      if (out && out.catch) out.catch(function () { setFull(false); });
    } else {
      setFull(false);
    }
  }

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
    // Only what is on show: Everything hides filtered-out photographs.
    items = Array.prototype.filter.call(list.querySelectorAll('a[data-v-src]'),
      function (a) { return !a.closest('[hidden]'); });
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
    if (full) leaveFull();
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
    // "Look through them one by one": the viewer, from the first photograph
    // on show (Everything's filters hide the rest). Without JavaScript the
    // link is that photograph's own page.
    var look = e.target.closest('[data-look]');
    if (look) {
      var first = Array.prototype.find.call(document.querySelectorAll('[data-everything] a[data-v-src]'),
        function (a) { return !a.closest('[hidden]'); });
      if (!first) return;
      e.preventDefault();
      open(first);
      opener = look;
      return;
    }
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
    if (e.key === 'Escape') { e.preventDefault(); if (full) leaveFull(); else close(); return; }
    if ((e.key === 'f' || e.key === 'F') && !e.altKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); toggleFull(); return; }
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
