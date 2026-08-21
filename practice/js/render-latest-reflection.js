/*
  RENDER: LATEST REFLECTION (hub widget)
  --------------------------------------
  Fills #latest-reflection on practice/index.html with the most recently
  published entry from suttas-config.js — the same "published" test the
  archive uses: a non-empty `note` plus an `added` date.

  What it shows, and why:
  - an eyebrow, "Latest reflection", because the Reflections room card sits
    a few centimetres below and the widget has to say what makes it different;
  - the title, linking to reflections.html#r-<id>, which render-reflections.js
    already knows how to open and scroll to;
  - a subtitle of "ref · sutta title" (or the generic source fields for
    non-sutta entries) — the same line the archive shows once an entry opens;
  - the opening of the note, trimmed to whole sentences, as a teaser;
  - a link to the archive.

  Deliberately NO date. The archive carries dates; the hub does not, so a
  quiet month never reads as neglect on the landing page of the section.

  If nothing is published, the section stays hidden — no placeholder, no gap.
  The markup ships with `hidden` set, so the same is true with JS off.
*/
(function(){

  var TEASER_MAX = 180; // characters; trimmed at a sentence boundary, never mid-sentence

  var root = document.getElementById('latest-reflection');
  if (!root) return;
  if (typeof SUTTAS === 'undefined' || !Array.isArray(SUTTAS)) return;

  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  }

  /* `note` deliberately carries HTML (keepers-1 has an inline <a>), so the
     teaser is taken as plain text: the browser parses the markup, we read
     back the text, which also decodes any entities correctly. */
  function plainText(html){
    var d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }

  /* Keep whole sentences up to TEASER_MAX. If even the first sentence is
     longer than that, keep it whole anyway — a slightly long teaser is
     better than a cut that lands mid-thought. No ellipsis either way. */
  function teaser(note){
    var text = plainText(note.split(/\n\s*\n/)[0] || '');
    if (text.length <= TEASER_MAX) return text;
    var sentences = text.match(/[^.!?]+[.!?]+(?:["'”’]?)\s*/g);
    if (!sentences || !sentences.length) return text;
    var out = '';
    for (var i = 0; i < sentences.length; i++) {
      var next = (out + sentences[i]);
      if (i > 0 && next.trim().length > TEASER_MAX) break;
      out = next;
    }
    return out.trim();
  }

  function subtitle(s){
    var reference = s.ref || s.sourceLocation || '';
    var sourceTitle = s.sourceTitle || s.suttaTitle || '';
    if (!reference) return sourceTitle;
    return reference + (sourceTitle ? ' · ' + sourceTitle : '');
  }

  var latest = SUTTAS
    .filter(function(s){ return s.note && s.note.trim().length > 0 && s.added; })
    .slice()
    .sort(function(a, b){
      return (new Date(b.added) - new Date(a.added)) || (SUTTAS.indexOf(a) - SUTTAS.indexOf(b));
    })[0];

  if (!latest) return;

  var sub = subtitle(latest);
  var lead = teaser(latest.note);

  root.innerHTML =
    '<h2 class="latest-reflection-eyebrow mono">Latest reflection</h2>' +
    '<h3 class="latest-reflection-title">' +
      '<a href="reflections.html#r-' + esc(latest.id) + '">' + esc(latest.title) + '</a>' +
    '</h3>' +
    (sub ? '<p class="latest-reflection-sub mono">' + esc(sub) + '</p>' : '') +
    (lead ? '<p class="latest-reflection-teaser">' + esc(lead) + '</p>' : '') +
    '<a class="latest-reflection-more mono" href="reflections.html">Past entries &rarr;</a>';

  root.hidden = false;

})();
