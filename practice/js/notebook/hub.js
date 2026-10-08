/*
  NOTEBOOK: THE PRACTICE HUB (October 2026)
  ------------------------------------------
  The shelf of five objects and the notebook that opens on today.

  Today is written in index.html and filled by the live widgets:
  render-daily-sutta.js (sutta of the day) and render-quotes.js (the line on
  the wall card). This file adds today's date, the "Lately" line and the five
  room spreads, and turns the pages.

  Each room's spread is built from that room's own data, never from a copy:
  the room pages themselves (reflections.html, meditation.html,
  places.html: their intro and their items) and the two data files
  (reading.json, talks.json). Counts are counted, not written down. If a
  room cannot be read, its spread is left out and the contents line still
  links to the room.

  Desktop turns the page (two halves of 0.36s, forward or back by page
  order). A phone slides (0.32s out, 0.38s in), but first brings the
  notebook into view: chosen from the shelf, the notebook is mostly below
  the fold, and a slide played there is never seen. Under reduced motion
  the page simply changes.

  On a phone the pages can also be swiped (fix round 4): left for the next
  page, right for the previous one, the page following the finger. A
  finished swipe calls go(), the same as the page-foot links and the
  contents, so everything else is as for a tap. See "swiping" below.
*/
(function () {
  'use strict';

  var NB = window.NB || { still: true, restart: function () {} };
  var WIDE = window.matchMedia('(min-width: 900px)');
  var ORDER = ['today', 'refl', 'med', 'read', 'talks', 'places'];
  var ROOMS = {
    refl: { num: 'one', page: 2, title: 'Reflections', href: 'reflections.html', label: 'Latest' },
    med: { num: 'two', page: 4, title: 'Meditation', href: 'meditation.html', label: 'Made for this practice' },
    read: { num: 'three', page: 6, title: 'Reading', href: 'reading.html', label: 'A book I return to' },
    talks: { num: 'four', page: 8, title: 'Talks', href: 'talks.html', label: 'If you want somewhere to start' },
    places: { num: 'five', page: 10, title: 'Places & Community', href: 'places.html', label: 'Where I have sat longest' }
  };
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function txt(node) { return node ? node.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function sentences(s) { return (s || '').split(/(?<=[.!?])\s+(?=[A-Z“"'])/); }
  // "16 September 2026", as the room writes its dates (Safari will not parse it)
  var FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function parseDate(s) {
    var m = /^(\d{1,2}) (\w+) (\d{4})$/.exec(s || '');
    return m ? new Date(+m[3], FULL.indexOf(m[2]), +m[1]) : new Date(0);
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  var book = $('.nb-book');
  if (!book) return;
  var halfL = $('[data-half="l"]', book), halfR = $('[data-half="r"]', book);

  // ---- today: the date, the sutta's link and translator ----

  var now = new Date();
  var dateEl = $('#nb-date');
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(',', '');
  }
  (function () {
    var link = $('#sutta-of-day-link'), more = $('#nb-sutta-more'), tr = $('#nb-sutta-tr');
    if (!document.getElementById('sutta-of-day')) {
      // render-daily-sutta.js removes the block when there is nothing to show
      if (more) more.parentNode.hidden = true;
      return;
    }
    if (more && link) more.href = link.href;
    // The same entry render-daily-sutta.js chose: index by local calendar day.
    var pool = (typeof DAILY_SUTTAS !== 'undefined' && Array.isArray(DAILY_SUTTAS))
      ? DAILY_SUTTAS.filter(function (s) { return s && s.text && s.url; }) : [];
    if (!pool.length || !tr) return;
    var day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    var s = pool[((day % pool.length) + pool.length) % pool.length];
    if (!s.translator || s.translator === 'sujato') tr.textContent = 'tr. Bhikkhu Sujato';
  })();

  // ---- spreads ----

  function head(left, right) {
    var h = el('div', 'nb-pg-head');
    h.appendChild(el('span', '', left));
    h.appendChild(el('span', '', right));
    return h;
  }

  function turnButton(id, back) {
    var b = el('button', 'nb-turn', back ? '← ' + title(id) : title(id) + ' →');
    b.type = 'button';
    b.setAttribute('data-go', id);
    return b;
  }
  function title(id) { return id === 'today' ? 'Today' : ROOMS[id].title; }

  function spread(id, d) {
    var R = ROOMS[id], i = ORDER.indexOf(id);
    var L = el('section', 'nb-pg nb-pg-l');
    L.setAttribute('data-page', id);
    L.setAttribute('aria-label', R.title);
    L.appendChild(head('Room ' + R.num + ' of five', d.count));
    L.appendChild(el('h2', 'nb-pg-h', R.title));
    L.appendChild(el('p', 'nb-pg-intro', d.intro));
    if (d.feat) {
      L.appendChild(el('div', 'nb-pg-gap'));
      L.appendChild(el('div', 'nb-pg-label', R.label));
      var ft = el('a', 'nb-pg-ftitle', d.feat.title);
      ft.href = d.feat.href;
      L.appendChild(ft);
      if (d.feat.text) L.appendChild(el('p', 'nb-pg-ftext', d.feat.text));
      if (d.feat.meta) L.appendChild(el('div', 'nb-pg-meta', d.feat.meta));
    }
    L.appendChild(el('div', 'nb-pg-fill'));
    var lf = el('div', 'nb-pg-foot');
    lf.appendChild(turnButton(ORDER[i - 1], true));
    L.appendChild(lf);

    var Rp = el('section', 'nb-pg nb-pg-r');
    Rp.setAttribute('data-page', id);
    Rp.setAttribute('aria-label', 'Contents');
    Rp.appendChild(head('Contents', 'p. ' + R.page));
    Rp.appendChild(el('div', 'nb-pg-gap'));
    d.rows.forEach(function (r) {
      var a = el('a', 'nb-crow');
      a.href = r.href;
      a.appendChild(el('span', 'nb-crow-t', r.t));
      a.appendChild(el('span', 'nb-crow-n', r.n));
      Rp.appendChild(a);
    });
    var enter2 = el('a', 'nb-moss nb-enter-phone', 'Enter ' + R.title + ' →');
    enter2.href = R.href;
    Rp.appendChild(enter2);
    Rp.appendChild(el('div', 'nb-pg-fill'));
    var rf = el('div', 'nb-pg-foot nb-pg-foot-r');
    var enter = el('a', 'nb-moss', 'Enter ' + R.title + ' →');
    enter.href = R.href;
    rf.appendChild(enter);
    var prev = el('span', 'nb-pg-prev');
    prev.appendChild(turnButton(ORDER[i - 1], true));
    rf.insertBefore(prev, enter);
    if (i < ORDER.length - 1) rf.appendChild(turnButton(ORDER[i + 1], false));
    Rp.appendChild(rf);

    halfL.appendChild(L);
    halfR.appendChild(Rp);
    var c = $('[data-count="' + id + '"]');
    if (c) c.textContent = d.count + ' · p. ' + R.page;
    wire(L); wire(Rp);
    ready[id] = true;
    if (saved === id && current === 'today') reopen(id);
  }

  // ---- reading the rooms ----

  function page(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url);
      return r.text();
    }).then(function (t) { return new DOMParser().parseFromString(t, 'text/html'); });
  }
  function json(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(url); return r.json(); });
  }
  function items(doc) {
    return $$('.nb-item', doc).map(function (li) {
      return {
        id: li.id, t: txt($('.nb-row-t', li)), tag: txt($('.nb-row-r', li)).replace(/\+$/, '').trim(),
        where: txt($('.nb-d-where', li)), by: txt($('.nb-d-by', li)),
        text: $$('.nb-d-text', li).map(txt), note: txt($('.nb-d-note', li)), li: li
      };
    });
  }
  // A reflection's own page, from its "Read the reflection" link in the
  // room; an entry without one falls back to its item in the room.
  function reflHref(x) {
    var a = $('.nb-d-links a[href^="reflections/"]', x.li);
    return a ? a.getAttribute('href') : 'reflections.html#' + x.id;
  }
  function find(sentencesOf, re) {
    var s = sentences(sentencesOf);
    for (var i = 0; i < s.length; i++) if (re.test(s[i])) return s[i];
    return s[0] || '';
  }

  var jobs = {
    refl: function () {
      return page('reflections.html').then(function (doc) {
        var list = items(doc);
        var dated = list.map(function (x) { return { x: x, d: parseDate(x.where) }; })
          .sort(function (a, b) { return b.d - a.d; });
        var newest = dated[0] && dated[0].x;
        if (newest) {
          var lately = $('#nb-lately'), link = $('#nb-lately-link');
          var ref = newest.tag.replace(/^Latest\s*·\s*/, '');
          link.textContent = '';
          link.appendChild(document.createTextNode('A reflection on ' + ref + ', '));
          link.appendChild(el('em', '', newest.t));
          link.href = reflHref(newest);
          $('#nb-lately-date').textContent = newest.where;
          lately.hidden = false;
        }
        return {
          count: plural(list.length, 'entry', 'entries'),
          intro: txt($('.nb-intro', doc)),
          feat: newest && { title: newest.t, href: reflHref(newest),
            text: sentences(newest.text[0]).slice(0, 2).join(' '),
            meta: newest.tag.replace(/^Latest\s*·\s*/, '') + ' · ' + newest.where },
          rows: dated.slice(0, 12).map(function (o) {
            return { t: o.x.t, n: o.d.getDate() + ' ' + MONTHS[o.d.getMonth()], href: reflHref(o.x) };
          })
        };
      });
    },
    med: function () {
      return page('meditation.html').then(function (doc) {
        var list = items(doc);
        var sheets = list.filter(function (x) { return /^sheet/.test(x.tag); }).length;
        var timer = list.filter(function (x) { return x.id === 'sati-timer'; })[0];
        var rows = list.map(function (x) { return { t: x.t, n: x.tag, href: 'meditation.html#' + x.id }; });
        var prose = $('.nb-prose', doc);
        if (prose) rows.push({ t: txt($('h2', prose)), n: 'note', href: 'meditation.html#' + prose.id });
        return {
          count: plural(sheets, 'sheet', 'sheets') + ' · 1 timer',
          intro: txt($('.nb-intro', doc)),
          feat: timer && { title: timer.t, href: 'meditation.html#sati-timer', text: find(timer.text[0], /^It does the timing/), meta: 'Works offline' },
          rows: rows
        };
      });
    },
    read: function () {
      return Promise.all([page('reading.html'), json('data/reading.json')]).then(function (r) {
        var doc = r[0], data = r[1], byId = {}, unique = {};
        data.collections.forEach(function (c) {
          byId[c.id] = c;
          c.books.forEach(function (b) { unique[b.title] = true; });
        });
        var rows = $$('.nb-acc', doc).map(function (g) {
          var n = 0;
          $$('[data-list]', g).forEach(function (l) { n += (byId[l.getAttribute('data-list')] || { books: [] }).books.length; });
          return { t: txt($('.nb-acc-t', g)), n: String(n), href: 'reading.html#' + g.id };
        });
        var f = byId['return'] && byId['return'].books[0];
        return {
          count: plural(Object.keys(unique).length, 'book', 'books'),
          intro: txt($('.nb-intro', doc)),
          feat: f && { title: f.title, href: 'reading.html#' + f.id, text: sentences(f.description)[0], meta: f.author + ' · ' + f.meta },
          rows: rows
        };
      });
    },
    talks: function () {
      return Promise.all([page('talks.html'), json('data/talks.json')]).then(function (r) {
        var doc = r[0], data = r[1], n = 0, start = null;
        data.sections.forEach(function (s) {
          n += s.items.length;
          s.items.forEach(function (t) { if (t.note && !start) start = t; });
        });
        var note = start ? start.note.split(': ') : [];
        return {
          count: plural(n, 'source', 'sources'),
          intro: txt($('.nb-intro', doc)),
          feat: start && { title: start.title, href: 'talks.html#' + start.id,
            text: note.length > 1 ? note[1].charAt(0).toUpperCase() + note[1].slice(1) : '', meta: start.author },
          rows: data.sections.map(function (s) { return { t: s.title, n: String(s.items.length), href: 'talks.html#' + s.id }; })
        };
      });
    },
    places: function () {
      return page('places.html').then(function (doc) {
        // the teachers are people, not places: the count and the contents
        // start with the places themselves, as on the board
        var groups = $$('.nb-acc', doc).filter(function (g) { return g.id !== 'teachers'; });
        var n = 0;
        var rows = groups.map(function (g) {
          var k = $$('.nb-item', g).length;
          n += k;
          return { t: txt($('.nb-acc-t', g)), n: String(k), href: 'places.html#' + g.id };
        });
        var w = items(doc).filter(function (x) { return x.id === 'wat-chom-tong'; })[0];
        return {
          count: plural(n, 'place', 'places'),
          intro: txt($('.nb-intro', doc)),
          feat: w && { title: w.t, href: 'places.html#wat-chom-tong', text: find(w.text[0], /longest retreat/),
            meta: w.note.split(' · ').pop() },
          rows: rows
        };
      });
    }
  };

  var ready = { today: true };
  ORDER.slice(1).forEach(function (id) {
    jobs[id]().then(function (d) { spread(id, d); }).catch(function () {
      // leave the room out; its contents line still links to the room
      $$('[data-go="' + id + '"]').forEach(function (b) { b.removeAttribute('data-go'); });
    });
  });

  // ---- turning ----

  var current = 'today', busy = false, picked = false;

  // A page turn never adds a history entry, so one Back leaves the hub. The
  // page is kept in the current entry's state instead, so a reload (and a
  // return to the hub by Back or Forward) opens the page you were on,
  // without a turn. Any other arrival opens on Today.
  var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
  var saved = (nav.type === 'reload' || nav.type === 'back_forward') && history.state && history.state.nb || null;
  function remember(id) {
    try { history.replaceState({ nb: id }, ''); } catch (e) {}
  }
  function reopen(id) {
    var from = pages(current), to = pages(id);
    if (!to[0] || !to[1]) return;
    current = id;
    shelf(id);
    from.forEach(function (n) { n.classList.remove('is-on'); });
    to.forEach(function (n) { n.classList.add('is-on'); });
  }

  function pages(id) { return [$('.nb-pg-l[data-page="' + id + '"]', halfL), $('.nb-pg-r[data-page="' + id + '"]', halfR)]; }

  function shelf(id) {
    $$('.nb-obj').forEach(function (b) {
      var on = b.getAttribute('data-go') === id;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.classList.toggle('is-on', on);
      if (on && picked) {
        NB.restart($('.nb-obj-art', b), 'settle');
        NB.restart($('.nb-uline', b), 'uline');
        if (id === 'med') NB.restart($('.hub-ripple', b), 'ripple');
      }
    });
  }

  function clean(nodes) {
    nodes.forEach(function (n) {
      if (!n) return;
      n.classList.remove('fl-out-l', 'fl-in-r', 'fl-out-r', 'fl-in-l', 'sl-out-l', 'sl-in-r', 'sl-out-r', 'sl-in-l', 'is-over', 'is-under');
      n.style.transform = '';
      n.style.transition = '';
      n.style.removeProperty('--sx');
    });
  }

  // offset: on a phone, how far a swipe had dragged the page (px); the
  // slide out starts there.
  function go(id, offset) {
    if (busy || id === current || !ready[id]) return;
    var from = pages(current), to = pages(id);
    if (!to[0] || !to[1]) return;
    var fwd = ORDER.indexOf(id) > ORDER.indexOf(current);
    picked = true;
    current = id;
    remember(id);
    shelf(id);
    var still = NB.still;
    if (still) {
      clean(from);
      from.forEach(function (n) { n.classList.remove('is-on'); });
      to.forEach(function (n) { n.classList.add('is-on'); });
      return after();
    }
    busy = true;
    if (!WIDE.matches && outOfView()) intoView(function () { turn(from, to, fwd, offset); });
    else turn(from, to, fwd, offset);
  }

  function turn(from, to, fwd, offset) {
    to.forEach(function (n) { n.classList.add('is-on'); });
    var wide = WIDE.matches;
    if (wide) {
      // forward: the right page turns over to the left; back: the reverse
      if (fwd) {
        from[0].classList.add('is-under'); to[0].classList.add('is-over', 'fl-in-r');
        from[1].classList.add('is-over', 'fl-out-l');
      } else {
        from[0].classList.add('is-over', 'fl-out-r');
        from[1].classList.add('is-under'); to[1].classList.add('is-over', 'fl-in-l');
      }
    } else {
      from.forEach(function (n) {
        // a swipe: the slide out starts where the finger let go
        n.style.setProperty('--sx', (offset || 0) + 'px');
        n.style.transform = '';
        n.style.transition = '';
        n.classList.add('is-over', fwd ? 'sl-out-l' : 'sl-out-r');
      });
      to.forEach(function (n) { n.classList.add(fwd ? 'sl-in-r' : 'sl-in-l'); });
    }
    setTimeout(function () {
      from.forEach(function (n) { n.classList.remove('is-on'); });
      clean(from.concat(to));
      busy = false;
      after();
    }, wide ? 760 : 480);
  }

  function outOfView() {
    var top = book.getBoundingClientRect().top;
    return top < 0 || top > window.innerHeight * 0.6;
  }

  // Scrolls the notebook to the top of the screen, then calls done (when
  // the scroll ends, or after 700ms where scrollend is not supported).
  function intoView(done) {
    var called = false;
    function finish() {
      if (called) return;
      called = true;
      window.removeEventListener('scrollend', finish);
      done();
    }
    window.addEventListener('scrollend', finish);
    setTimeout(finish, 700);
    book.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function after() {
    if (!WIDE.matches && outOfView()) book.scrollIntoView({ behavior: NB.still ? 'auto' : 'smooth', block: 'start' });
  }

  function wire(root) {
    $$('[data-go]', root).forEach(function (b) {
      b.addEventListener('click', function (e) {
        var id = b.getAttribute('data-go');
        if (!id || !ready[id]) return; // not loaded: a link keeps working as a link
        e.preventDefault();
        go(id);
      });
    });
  }
  wire(document);
  shelf(null);

  // ---- swiping (phone layout only) ----
  //
  // Pointer events, touch and pen only. touch-action: pan-y on the
  // notebook (notebook.css) leaves vertical scrolling to the browser, which
  // then cancels the pointer; a gesture becomes a swipe only once it has
  // moved more than SLOP px sideways and more than RATIO times as far
  // sideways as down. Touches that start within EDGE px of either side of
  // the screen are left to the browser's own back gesture. On release the
  // page turns if it was dragged past a quarter of its width or flicked at
  // FLICK px/ms or faster; otherwise it springs back. At the first and the
  // last page it only gives a little (RESIST) and springs back. Under
  // reduced motion the page does not follow the finger, and a swipe turns
  // it without a slide.

  var SLOP = 10, RATIO = 1.5, EDGE = 24, FLICK = 0.3, RESIST = 0.25, RESIST_MAX = 48;
  var g = null, justSwiped = false;

  function neighbour(dir) {
    var id = ORDER[ORDER.indexOf(current) + dir];
    return id && ready[id] ? id : null;
  }
  function moveTo(x, animate) {
    pages(current).forEach(function (n) {
      if (!n) return;
      n.style.transition = animate ? 'transform .3s cubic-bezier(.3,.1,.2,1)' : '';
      n.style.transform = x ? 'translateX(' + x + 'px)' : '';
    });
  }
  function release() {
    if (g && g.captured) { try { book.releasePointerCapture(g.id); } catch (e) {} }
    g = null;
  }

  book.addEventListener('pointerdown', function (e) {
    if (WIDE.matches || busy || g || e.pointerType === 'mouse' || !e.isPrimary) return;
    if (e.clientX < EDGE || e.clientX > window.innerWidth - EDGE) return;
    // samples: recent positions for the flick speed, from the touch-down on
    // (Chrome merges quick moves into one event per frame, so a flick may
    // bring a single move)
    g = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: 0, swiping: false, captured: false, samples: [{ x: 0, t: e.timeStamp }] };
  });

  book.addEventListener('pointermove', function (e) {
    if (!g || e.pointerId !== g.id) return;
    var dx = e.clientX - g.x0, dy = e.clientY - g.y0;
    if (!g.swiping) {
      if (Math.abs(dx) > SLOP && Math.abs(dx) > RATIO * Math.abs(dy)) {
        g.swiping = true;
        try { book.setPointerCapture(g.id); g.captured = true; } catch (err) {}
      } else if (Math.abs(dy) > SLOP) {
        g = null;      // a scroll: the browser has it
        return;
      } else {
        return;
      }
    }
    e.preventDefault();
    var t = e.timeStamp;
    g.samples.push({ x: dx, t: t });
    while (g.samples.length > 2 && t - g.samples[0].t > 100) g.samples.shift();
    var target = neighbour(dx < 0 ? 1 : -1);
    g.x = target ? dx : (dx < 0 ? -1 : 1) * Math.min(Math.abs(dx) * RESIST, RESIST_MAX);
    if (!NB.still) moveTo(g.x, false);
  });

  book.addEventListener('pointerup', function (e) {
    if (!g || e.pointerId !== g.id) return;
    var was = g;
    release();
    if (!was.swiping) return;
    justSwiped = true;
    setTimeout(function () { justSwiped = false; }, 0);
    var dx = e.clientX - was.x0, dir = dx < 0 ? 1 : -1, target = neighbour(dir);
    var s = was.samples;
    s.push({ x: dx, t: e.timeStamp });
    while (s.length > 2 && e.timeStamp - s[0].t > 100) s.shift();
    var v = (s[s.length - 1].x - s[0].x) / Math.max(1, s[s.length - 1].t - s[0].t);
    var width = book.getBoundingClientRect().width;
    var far = Math.abs(dx) > width / 4, fast = Math.abs(v) >= FLICK && (v < 0) === (dx < 0);
    if (target && (far || fast)) go(target, NB.still ? 0 : was.x);
    else moveTo(0, !NB.still);
  });

  book.addEventListener('pointercancel', function (e) {
    if (!g || e.pointerId !== g.id) return;
    var was = g;
    release();
    if (was.swiping) moveTo(0, !NB.still);
  });

  // a swipe that ends on a link must not also follow it
  book.addEventListener('click', function (e) {
    if (justSwiped) { e.preventDefault(); e.stopPropagation(); }
  }, true);
})();
