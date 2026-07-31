/*
  RENDER: REFLECTIONS
  --------------------
  Reads SUTTAS from suttas-config.js and renders published entries
  (anything with a non-empty `note` and an `added` date) in two places:

  1. #reflections-featured on practice/index.html — the single most
     recent entry, hidden entirely if nothing has been published yet.
  2. #reflections-list on practice/reflections.html — the full archive,
     most recent first, with a plain empty-state message if nothing
     has been published yet.

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
    return '<blockquote class="reflections-excerpt">' + lines.join('<br>') + '</blockquote>';
  }

  function noteMarkup(s){
    if (!s.note) return '';
    var paragraphs = s.note.split(/\n\s*\n/).map(function(p){ return p.trim(); }).filter(Boolean);
    return paragraphs.map(function(p){ return '<p class="entry-note">' + p + '</p>'; }).join('');
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

  // --- Hub widget: practice/index.html ---
  var featured = document.getElementById('reflections-featured');
  if (featured) {
    var entries = publishedEntries();
    if (entries.length > 0) {
      featured.innerHTML =
        '<div class="reflections-eyebrow">Reflections</div>' +
        entryMarkup(entries[0]) +
        '<a class="reflections-more" href="reflections.html">Past entries &rarr;</a>';
      featured.hidden = false;
    }
    // if nothing published yet, leave it hidden — no placeholder, no gap
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
