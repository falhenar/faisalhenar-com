/*
  RENDER: REFLECTIONS
  --------------------
  Reads SUTTAS from suttas-config.js and renders published entries
  (anything with a non-empty `note` and an `added` date) into
  #reflections-list on practice/reflections.html — the full archive,
  most recent first, with a plain empty-state message if nothing has
  been published yet. The reflection text itself sits behind a
  <details> toggle, the same pattern as the teacher bios in places.html.

  `added` is expected as an ISO date string, e.g. "2026-08-03".
*/
(function(){

  function publishedEntries(){
    return SUTTAS
      .filter(function(s){ return s.note && s.note.trim().length > 0 && s.added; })
      .slice()
      .sort(function(a, b){ return new Date(b.added) - new Date(a.added); });
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
    return (
      '<details class="entry-bio">' +
        '<summary>Read the reflection</summary>' +
        paragraphs.map(function(p){ return '<p>' + p + '</p>'; }).join('') +
      '</details>'
    );
  }

  function entryMarkup(s){
    return (
      '<article class="entry reflection-entry">' +
        '<p class="entry-title">' + s.title + '</p>' +
        '<p class="entry-by mono">' + fmtMeta(s) + '</p>' +
        excerptMarkup(s) +
        noteMarkup(s) +
        '<a class="entry-link" href="' + s.url + '" target="_blank" rel="noopener">Read on SuttaCentral &rarr;</a>' +
      '</article>'
    );
  }

  // --- Archive page: practice/reflections.html ---
  var list = document.getElementById('reflections-list');
  if (list) {
    var all = publishedEntries();
    list.innerHTML = all.length > 0
      ? all.map(entryMarkup).join('')
      : '<p class="reflections-empty">Nothing published yet. The first entry will appear here once it exists.</p>';
  }

})();
