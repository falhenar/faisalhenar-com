/*
  NOTEBOOK: ROOMS RENDERED FROM DATA (October 2026)
  --------------------------------------------------
  Reading and Talks keep their lists in JSON, as the live Reading, Listening
  and Watching pages did (practice/data/reading.json, practice/data/talks.json).
  This fills the room pattern from that data, then hands the room to room.js.

  Reading: the shelves, their headings and descriptions are written in
  reading.html; each [data-list="<collection id>"] is filled with that
  collection's books, the same split render-reading.js used.
  Talks: the six sections and their sources all come from talks.json.

  Inline links in the data use the same [text](url) form as before.
*/
(function () {
  'use strict';

  var root = document.querySelector('[data-room][data-src]');
  if (!root) return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function inline(parent, value) {
    var pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g, cursor = 0, m;
    value = value || '';
    while ((m = pattern.exec(value))) {
      parent.appendChild(document.createTextNode(value.slice(cursor, m.index)));
      var a = el('a', '', m[1]);
      a.href = m[2];
      if (/^https?:/i.test(m[2])) { a.rel = 'noopener'; a.target = '_blank'; }
      parent.appendChild(a);
      cursor = pattern.lastIndex;
    }
    parent.appendChild(document.createTextNode(value.slice(cursor)));
    return parent;
  }

  function ext(label, href) {
    var a = el('a', 'nb-btn', label);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    var e = el('span', 'ext', ' ↗');
    e.setAttribute('aria-hidden', 'true');
    a.appendChild(e);
    return a;
  }

  // one item, in the same markup the static rooms use
  function item(o) {
    var li = el('li', 'nb-item');
    li.id = o.id;
    if (o.aliases && o.aliases.length) li.setAttribute('data-alias', o.aliases.join(' '));
    var row = el('button', 'nb-row');
    row.type = 'button';
    row.setAttribute('aria-pressed', 'false');
    row.setAttribute('aria-controls', 'd-' + o.id);
    var l = el('span', 'nb-row-l');
    l.appendChild(el('span', 'nb-dot'));
    l.appendChild(el('span', 'nb-row-t', o.title));
    var r = el('span', 'nb-row-r', o.tag || '');
    var sign = el('span', 'nb-sign', '+');
    sign.setAttribute('aria-hidden', 'true');
    r.appendChild(sign);
    row.appendChild(l);
    row.appendChild(r);
    li.appendChild(row);

    var d = el('div', 'nb-detail');
    d.id = 'd-' + o.id;
    d.hidden = true;
    d.appendChild(el('div', 'nb-d-sec', o.sec));
    d.appendChild(el('h3', 'nb-d-t', o.title));
    if (o.by) d.appendChild(el('div', 'nb-d-by', o.by));
    if (o.text) d.appendChild(inline(el('p', 'nb-d-text'), o.text));
    (o.notes || []).forEach(function (n) { if (n) d.appendChild(inline(el('p', 'nb-d-note'), n)); });
    var links = el('div', 'nb-d-links');
    (o.links || []).forEach(function (x) { links.appendChild(ext(x[0], x[1])); });
    d.appendChild(links);
    li.appendChild(d);
    return li;
  }

  function peek(titles) {
    return titles.slice(0, 3).join(', ') + (titles.length > 3 ? ', …' : '');
  }

  function setGroup(group, titles, word) {
    var n = group.querySelector('[data-count]');
    if (n) n.textContent = titles.length + ' ' + word(titles.length);
    var p = group.querySelector('.nb-acc-peek');
    if (p) p.textContent = peek(titles);
  }

  function reading(data) {
    var byId = {};
    data.collections.forEach(function (c) { byId[c.id] = c; });
    root.querySelectorAll('.nb-acc').forEach(function (group) {
      var shelf = group.querySelector('.nb-acc-t').textContent;
      var titles = [];
      group.querySelectorAll('[data-list]').forEach(function (list) {
        var c = byId[list.getAttribute('data-list')];
        if (!c) return;
        var sub = list.getAttribute('data-sub');
        c.books.forEach(function (b) {
          titles.push(b.title);
          var buy = /^buy\b/i.test(b.meta || '');
          list.appendChild(item({
            id: b.id, title: b.title, tag: buy ? 'to buy' : (/^free\b/i.test(b.meta || '') ? 'free' : ''),
            sec: shelf + (sub ? ' · ' + sub : ''), by: b.author, text: b.description, notes: [b.meta],
            links: b.url ? [[buy ? 'Where to buy' : 'Read online', b.url]] : []
          }));
        });
      });
      setGroup(group, titles, function (n) { return n === 1 ? 'book' : 'books'; });
    });
  }

  function talks(data) {
    var list = root.querySelector('.nb-list');
    data.sections.forEach(function (s) {
      var group = el('section', 'nb-acc');
      group.id = s.id;
      var h = el('h2', 'nb-acc-h');
      var btn = el('button', 'nb-acc-btn');
      btn.type = 'button';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', 'b-' + s.id);
      var top = el('span', 'nb-acc-top');
      top.appendChild(el('span', 'nb-acc-t', s.title));
      var n = el('span', 'nb-acc-n');
      n.appendChild(el('span', '', '')).setAttribute('data-count', '');
      n.appendChild(document.createTextNode(' · '));
      n.appendChild(el('span', 'nb-acc-sign', '+'));
      top.appendChild(n);
      btn.appendChild(top);
      btn.appendChild(el('span', 'nb-acc-peek'));
      h.appendChild(btn);
      group.appendChild(h);
      var body = el('div', 'nb-acc-body');
      body.id = 'b-' + s.id;
      body.hidden = true;
      if (s.intro) body.appendChild(el('p', 'nb-group-d', s.intro));
      var ul = el('ul', 'nb-rows');
      s.items.forEach(function (t) {
        var links = [];
        if (t.listen) links.push(['Listen', t.listen]);
        if (t.watch) links.push(['Watch', t.watch]);
        ul.appendChild(item({
          id: t.id, aliases: t.aliases, title: t.title,
          tag: links.map(function (x) { return x[0].toLowerCase(); }).join(' · '),
          sec: s.title, by: t.author, text: t.description, notes: [t.note, t.meta], links: links
        }));
      });
      body.appendChild(ul);
      group.appendChild(body);
      list.appendChild(group);
      setGroup(group, s.items.map(function (t) { return t.title; }), function (k) { return k === 1 ? 'source' : 'sources'; });
    });
  }

  fetch(root.getAttribute('data-src'), { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('data');
    return r.json();
  }).then(function (data) {
    if (root.getAttribute('data-kind') === 'talks') talks(data); else reading(data);
    var updated = document.querySelector('[data-updated]');
    if (updated && data.updated) { updated.dateTime = data.updated.datetime; updated.textContent = data.updated.label; }
    window.NotebookRoom.init(root);
  }).catch(function () {
    var list = root.querySelector('.nb-list');
    if (list) list.appendChild(el('p', 'nb-group-d', root.getAttribute('data-error') || ''));
  });
})();
