/*
  RENDER: REFLECTIONS
  --------------------
  Reads BOOKS and SUTTAS from suttas-config.js and renders published
  entries (anything with a non-empty `note` and an `added` date) into
  #reflections-list on practice/reflections.html. Entries are grouped
  into one block per book, in BOOKS's key order; within a block, most
  recent first. Each book block gets a heading + short note (same
  section-label / section-dek pattern used elsewhere on the site), and
  is only rendered once it has at least one published entry. A plain
  empty-state message is shown if nothing has been published anywhere
  yet. Each entry collapses to its title and byline; opening it reveals
  the excerpt, the reflection and the source link. Same <details>
  pattern as the teacher bios in places.html, just scaled up to cover
  the whole entry.

  `added` is expected as an ISO date string, e.g. "2026-08-03".

  Each entry gets id="r-<entry id>" on its <details>, so other pages can
  deep-link a single reflection. Arriving with a matching #hash opens that
  entry and scrolls to it; without one, everything stays collapsed as
  before. See render-daily-sutta.js, which links here when the sutta of
  the day happens to be one that has been written about.
*/
(function(){

  function publishedEntries(){
    return SUTTAS
      .filter(function(s){ return s.note && s.note.trim().length > 0 && s.added; })
      .slice()
      .sort(function(a, b){ return new Date(b.added) - new Date(a.added); });
  }

  function publishedByBook(){
    var all = publishedEntries();
    return Object.keys(BOOKS).map(function(key){
      var entries = all.filter(function(s){ return s.book === key; });
      if (BOOKS[key].order === 'structural') {
        entries = entries.slice().sort(function(a, b){ return SUTTAS.indexOf(a) - SUTTAS.indexOf(b); });
      }
      return {
        key: key,
        book: BOOKS[key],
        entries: entries
      };
    }).filter(function(group){ return group.entries.length > 0; });
  }

  function fmtDate(iso){
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function fmtMeta(s){
    var parts = [s.ref];
    if (s.label) parts.push(s.label);
    if (s.translator && s.translator !== 'sujato') parts.push('trans. ' + s.translator);
    parts.push(fmtDate(s.added));
    return parts.join(' &middot; ');
  }

  function excerptMarkup(s){
    if (!s.excerpt) return '';
    var lines = s.excerpt.split('\n').map(function(line){ return line.trim(); }).filter(Boolean);
    return (
      '<a class="reflections-excerpt-link" href="' + s.url + '" target="_blank" rel="noopener">' +
        '<blockquote class="reflections-excerpt">' + lines.join('<br>') + '</blockquote>' +
      '</a>'
    );
  }

  function noteMarkup(s){
    if (!s.note) return '';
    var paragraphs = s.note.split(/\n\s*\n/).map(function(p){ return p.trim(); }).filter(Boolean);
    return paragraphs.map(function(p){
      return '<p class="reflection-note">' + p + '</p>';
    }).join('');
  }

  function entryMarkup(s){
    return (
      '<article class="entry reflection-entry">' +
        '<details class="reflection" id="r-' + s.id + '">' +
          '<summary>' +
            '<span class="reflection-head">' +
              '<h3 class="entry-title">' + s.title + '</h3>' +
              '<span class="entry-by mono">' + fmtMeta(s) + '</span>' +
            '</span>' +
          '</summary>' +
          '<div class="reflection-body">' +
            excerptMarkup(s) +
            noteMarkup(s) +
            '<a class="entry-link" href="' + s.url + '" target="_blank" rel="noopener">Read on SuttaCentral &rarr;</a>' +
          '</div>' +
        '</details>' +
      '</article>'
    );
  }

  function bookBlockMarkup(group){
    return (
      '<section class="section">' +
        '<h2 class="section-label">' + group.book.title + '</h2>' +
        '<p class="section-dek">' + group.book.note + '</p>' +
        group.entries.map(entryMarkup).join('') +
      '</section>'
    );
  }

  // --- Archive page: practice/reflections.html ---
  var list = document.getElementById('reflections-list');
  if (list) {
    var groups = publishedByBook();
    list.innerHTML = groups.length > 0
      ? groups.map(bookBlockMarkup).join('')
      : '<section class="section"><p class="reflections-empty">Nothing published yet. The first entry will appear here once it exists.</p></section>';

    // Landing on #r-<id> opens that entry rather than dropping the reader on a
    // wall of collapsed titles. Runs after innerHTML, so the browser's own
    // hash scroll (which fired before this list existed) is redone here.
    (function openHashed(){
      var hash = window.location.hash;
      if (!hash || hash.length < 2) return;
      var target;
      try { target = list.querySelector(hash); } catch (err) { return; }
      if (!target || target.tagName !== 'DETAILS') return;
      target.open = true;
      target.scrollIntoView({ block: 'start' });
    })();
  }

})();
