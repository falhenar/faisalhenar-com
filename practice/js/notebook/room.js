/*
  NOTEBOOK: THE ROOM PATTERN (October 2026)
  ------------------------------------------
  One pattern for all five rooms: a list on the left and the chosen item in
  a panel on the right (900px and wider), the item opening in place under
  its own line on narrower screens.

  Every item's full text is already in the page, inside its .nb-detail
  (written in the HTML, or rendered from the room's data file before this
  runs). Choosing an item reveals it; nothing is loaded. On a desktop the
  detail is copied into the panel; on a phone it is shown where it is.

  Markup this reads:
    [data-room]            the room; data-page names the page for cross-links,
                           data-open the item to start on, data-open-group the
                           group to start open (accordion rooms)
    .nb-acc                an accordion group (one open at a time)
    .nb-item               an item: id is its anchor; data-alias holds old
                           anchors that should open it too
    .nb-row                the item's line (a button)
    .nb-detail             the item's text
    .nb-panel              the panel; [data-move] inside it is the drawing's
                           one movement, replayed on each new choice

  "Elsewhere in the notebook" comes from practice/data/crosslinks.json,
  keyed "<page>#<item id>", and is added to each detail it names.

  An address with #id opens that item (or that group), so old links and
  links between rooms land on the right thing.
*/
(function () {
  'use strict';

  var WIDE = window.matchMedia('(min-width: 900px)');
  var NB = window.NB || { still: true, restart: function () {} };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Focus moved by the script (arriving from a link) shows no ring; the
  // keyboard's own focus still does (notebook.css, :focus-visible).
  function quietFocus(node) {
    node.setAttribute('data-quiet-focus', '');
    node.addEventListener('blur', function () { node.removeAttribute('data-quiet-focus'); }, { once: true });
    node.focus({ preventScroll: true });
  }

  function addAlso(detail, links) {
    if (!links || !links.length || $('.nb-also', detail)) return;
    var box = el('div', 'nb-also');
    box.appendChild(el('h4', 'nb-also-h', 'Elsewhere in the notebook'));
    links.forEach(function (l) {
      var a = el('a');
      a.href = l.href;
      a.appendChild(el('span', 'nb-also-t', l.t));
      a.appendChild(el('span', 'nb-also-r', l.room));
      box.appendChild(a);
    });
    detail.appendChild(box);
  }

  function Room(root) {
    this.root = root;
    this.panel = $('.nb-panel', root);
    this.panelBody = this.panel ? $('.nb-panel-body', this.panel) : null;
    this.items = $$('.nb-item', root);
    this.groups = $$('.nb-acc', root);
    this.current = null;
    var self = this;

    this.items.forEach(function (item) {
      var row = $('.nb-row', item);
      if (!row) return;
      row.addEventListener('click', function () { self.choose(item, { user: true }); });
    });
    this.groups.forEach(function (group) {
      var btn = $('.nb-acc-btn', group);
      if (!btn) return;
      btn.addEventListener('click', function () {
        self.openGroup(btn.getAttribute('aria-expanded') === 'true' ? null : group);
      });
    });

    WIDE.addEventListener('change', function () { self.layout(); });
    window.addEventListener('hashchange', function () { self.fromHash(true); });

    var startGroup = root.getAttribute('data-open-group');
    if (startGroup) this.openGroup(document.getElementById(startGroup));
    var start = document.getElementById(root.getAttribute('data-open') || '') || this.items[0];
    if (!this.fromHash(false) && start) this.choose(start, { quiet: true });

    var src = root.getAttribute('data-crosslinks');
    if (src) {
      fetch(src, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (data) {
        var page = root.getAttribute('data-page') || '';
        self.items.forEach(function (item) {
          addAlso($('.nb-detail', item), data[page + '#' + item.id]);
        });
        if (self.current) self.render(self.current, false);
      }).catch(function () {});
    }
  }

  Room.prototype.groupOf = function (item) {
    for (var i = 0; i < this.groups.length; i++) if (this.groups[i].contains(item)) return this.groups[i];
    return null;
  };

  Room.prototype.openGroup = function (group) {
    this.groups.forEach(function (g) {
      var on = g === group;
      var btn = $('.nb-acc-btn', g), body = $('.nb-acc-body', g);
      if (btn) btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (btn) { var s = $('.nb-acc-sign', btn); if (s) s.textContent = on ? '−' : '+'; }
      if (body) {
        var was = !body.hidden;
        body.hidden = !on;
        if (on && !was) NB.restart(body, 'swap');
      }
    });
  };

  // Desktop: aria-pressed, the panel. Phone: aria-expanded, in place.
  Room.prototype.layout = function () {
    var wide = WIDE.matches, cur = this.current;
    this.items.forEach(function (item) {
      var row = $('.nb-row', item), detail = $('.nb-detail', item), sign = $('.nb-sign', item);
      var on = item === cur;
      if (!row || !detail) return;
      if (wide) {
        row.removeAttribute('aria-expanded');
        row.setAttribute('aria-pressed', on ? 'true' : 'false');
        detail.hidden = true;
        detail.classList.remove('nb-inplace');
      } else {
        row.removeAttribute('aria-pressed');
        row.setAttribute('aria-expanded', on ? 'true' : 'false');
        detail.hidden = !on;
        detail.classList.toggle('nb-inplace', on);
      }
      if (sign) sign.textContent = on && !wide ? '−' : '+';
    });
    if (wide && cur) this.render(cur, false);
  };

  Room.prototype.render = function (item, moved) {
    if (!this.panelBody) return;
    var detail = $('.nb-detail', item);
    this.panelBody.innerHTML = '';
    var copy = el('div', 'swap');
    Array.prototype.forEach.call(detail.childNodes, function (n) { copy.appendChild(n.cloneNode(true)); });
    this.panelBody.appendChild(copy);
    if (moved) {
      var move = $('[data-move]', this.panel);
      if (move) NB.restart(move, move.getAttribute('data-move'));
    }
    var needle = $('[data-needle]', this.panel);
    if (needle) {
      var k = this.items.indexOf(item), n = this.items.length;
      needle.style.transform = 'translateX(' + (n > 1 ? (k / (n - 1) * 24) : 0).toFixed(1) + 'px)';
    }
  };

  Room.prototype.choose = function (item, opts) {
    opts = opts || {};
    var wide = WIDE.matches;
    if (!wide && opts.user && item === this.current) {
      // a second tap on an open line closes it
      this.current = null;
      this.layout();
      return;
    }
    var changed = item !== this.current;
    this.current = item;
    var group = this.groupOf(item);
    if (group && $('.nb-acc-btn', group).getAttribute('aria-expanded') !== 'true') this.openGroup(group);
    this.layout();
    if (wide) this.render(item, changed && !opts.quiet);
    else if (changed && !opts.quiet) NB.restart($('.nb-detail', item), 'open-in');
  };

  // Opens the item or group named in the address and scrolls to it.
  // Returns true if it did. `live` is true after a hashchange, false on load.
  Room.prototype.fromHash = function (live) {
    var id = decodeURIComponent((window.location.hash || '').slice(1));
    if (!id) return false;
    var target = document.getElementById(id);
    if (!target || !this.root.contains(target)) {
      target = null;
      for (var i = 0; i < this.items.length; i++) {
        var aliases = (this.items[i].getAttribute('data-alias') || '').split(/\s+/);
        if (aliases.indexOf(id) >= 0) { target = this.items[i]; break; }
      }
    }
    if (!target) return false;
    if (target.classList.contains('nb-item')) {
      this.choose(target, { quiet: !live });
    } else if (target.classList.contains('nb-acc')) {
      this.openGroup(target);
      var first = $('.nb-item', target);
      if (first) this.choose(first, { quiet: true });
    } else {
      return false;
    }
    var row = $('.nb-row', target) || $('.nb-acc-btn', target) || target;
    setTimeout(function () {
      target.scrollIntoView({ block: 'start', behavior: NB.still ? 'auto' : 'smooth' });
      if (row.focus) quietFocus(row);
    }, 0);
    return true;
  };

  window.NotebookRoom = { init: function (root) { return new Room(root); }, addAlso: addAlso };

  $$('[data-room]').forEach(function (root) {
    if (!root.hasAttribute('data-rendered-by')) new Room(root);
  });
})();
