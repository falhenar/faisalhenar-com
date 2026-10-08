/*
  NOTEBOOK: THE PROSTRATION, STEP BY STEP (October 2026)
  -------------------------------------------------------
  The page's HTML holds every plate, grouped by section: that is the "All
  positions" view, and what a reader without JavaScript gets. This adds
  "One at a time": one large plate with its number, its noted word and its
  description (the plate's own alt text), Previous and Next, the four
  sections to jump between, and a thin row of marks showing the position.
  At the last plate of a section that has a note, the note is shown.

  Opens on plate 1. An address like #12 opens plate 12; #A and #B the two
  kneeling positions. Re-runs after the language switch (sheet.js) swaps the
  page's content.
*/
(function () {
  'use strict';

  var NB = window.NB || { still: true, restart: function () {} };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function init() {
    var main = $('main.nb-steps');
    if (!main) return;
    var one = $('.nb-st-one', main), all = $('.nb-st-all', main), views = $('.nb-views', main);
    var of = main.getAttribute('data-of') || 'of';
    var plates = [];
    $$('.nb-st-sec', main).forEach(function (sec, si) {
      var picks = $$('.nb-st-pick', sec);
      var note = $('.nb-st-note', sec);
      picks.forEach(function (b, pi) {
        var img = $('img', b);
        plates.push({
          n: $('.step-num', b).textContent.trim(), w: $('.step-word', b).textContent.trim(),
          src: img.getAttribute('src'), alt: img.getAttribute('alt'), si: si, h: sec.getAttribute('data-sec'),
          note: pi === picks.length - 1 && note ? note.innerHTML : '', button: b
        });
      });
    });
    if (!plates.length) return;
    var total = plates.length, i = 0;

    var jumps = $('.nb-st-jumps', main), ticks = $('.nb-st-ticks', main), stage = $('.nb-st-stage', main);
    jumps.innerHTML = '';
    ticks.innerHTML = '';
    $$('.nb-st-sec', main).forEach(function (sec, si) {
      var count = $$('.nb-st-pick', sec).length;
      var b = el('button', 'nb-st-jump');
      b.type = 'button';
      b.appendChild(document.createTextNode(sec.getAttribute('data-sec') + ' '));
      b.appendChild(el('span', 'nb-st-jump-n', String(count)));
      b.addEventListener('click', function () {
        for (var k = 0; k < total; k++) if (plates[k].si === si) { show(k, true); break; }
      });
      jumps.appendChild(b);
    });
    plates.forEach(function () { ticks.appendChild(el('span', 'nb-st-tick')); });

    function show(k, moved) {
      i = Math.max(0, Math.min(total - 1, k));
      var p = plates[i];
      stage.innerHTML = '';
      var wrap = el('div', 'nb-st-view' + (moved && !NB.still ? ' swap' : ''));
      var fig = el('div', 'nb-st-img');
      var img = el('img');
      img.src = p.src; img.alt = p.alt;
      fig.appendChild(img);
      var cap = el('div', 'nb-st-cap');
      cap.appendChild(el('div', 'nb-st-pos', p.h + ' · ' + (i + 1) + ' ' + of + ' ' + total));
      var big = el('div', 'nb-st-big');
      big.appendChild(el('span', 'nb-st-num', p.n));
      big.appendChild(el('span', 'nb-st-word', p.w));
      cap.appendChild(big);
      cap.appendChild(el('p', 'nb-st-alt', p.alt));
      if (p.note) { var n = el('p', 'nb-st-note1'); n.innerHTML = p.note; cap.appendChild(n); }
      wrap.appendChild(fig);
      wrap.appendChild(cap);
      stage.appendChild(wrap);
      $$('.nb-st-jump', jumps).forEach(function (b, si) {
        b.setAttribute('aria-pressed', si === p.si ? 'true' : 'false');
      });
      $$('.nb-st-tick', ticks).forEach(function (t, k2) {
        t.className = 'nb-st-tick' + (k2 === i ? ' is-on' : (k2 < i ? ' is-past' : ''));
      });
      $$('.nb-st-btn', main).forEach(function (b) {
        var d = +b.getAttribute('data-step');
        b.disabled = d < 0 ? i === 0 : i === total - 1;
      });
      if (moved) history.replaceState(null, '', '#' + p.n);
    }

    function view(v) {
      one.hidden = v !== 'one';
      all.hidden = v === 'one';
      $$('.nb-vw', main).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-view') === v ? 'true' : 'false'); });
    }

    $$('.nb-vw', main).forEach(function (b) { b.addEventListener('click', function () { view(b.getAttribute('data-view')); }); });
    $$('.nb-st-btn', main).forEach(function (b) {
      b.addEventListener('click', function () { show(i + (+b.getAttribute('data-step')), true); });
    });
    plates.forEach(function (p, k) {
      p.button.addEventListener('click', function () { view('one'); show(k, true); one.scrollIntoView({ block: 'start', behavior: NB.still ? 'auto' : 'smooth' }); });
    });
    main.addEventListener('keydown', function (e) {
      if (one.hidden || /input|select|textarea/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') show(i + 1, true);
      if (e.key === 'ArrowLeft') show(i - 1, true);
    });

    views.hidden = false;
    var want = decodeURIComponent((location.hash || '').slice(1)).toUpperCase();
    var start = 0;
    for (var k = 0; k < total; k++) if (plates[k].n.toUpperCase() === want) start = k;
    view('one');
    show(start, false);
  }

  init();
  document.addEventListener('nb:swapped', init);
})();
