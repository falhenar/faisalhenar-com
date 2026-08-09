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
      return {
        key: key,
        book: BOOKS[key],
        entries: all.filter(function(s){ return s.book === key; })
      };
    }).filter(function(group){ return group.entries.length > 0; });
  }

  function fmtDate(iso){
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function fmtMeta(s){
    var translatorNote = (s.translator && s.translator !== 'sujato')
      ? ' &middot; trans. ' + s.translator
      : '';
    return s.ref + ' &middot; ' + s.label + translatorNote + ' &middot; ' + fmtDate(s.added);
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
        '<details class="reflection">' +
          '<summary>' +
            '<span class="reflection-head">' +
              '<span class="entry-title">' + s.title + '</span>' +
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
        '<div class="section-label">' + group.book.title + '</div>' +
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
  }

})();
