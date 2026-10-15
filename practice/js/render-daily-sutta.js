/*
  RENDER: SUTTA OF THE DAY
  --------------------------
  Reads practice/data/daily-sutta.json and renders one entry into
  #sutta-of-day on practice/index.html.

  Unlike the quote-of-the-moment widget (one per page load, shuffled,
  tracked in localStorage), this rotation is deterministic and date-based:
  the same entry shows to every visitor on a given calendar day, and it
  changes at local midnight. No storage, no state to lose.

  Only entries "in_rotation" take part; a resting entry stays in the file
  but is not shown. Index = days-since-epoch (from the visitor's local
  calendar date) mod the number in rotation. Using Date.UTC() on the local
  y/m/d, rather than Date.now()/86400000, avoids the index drifting
  mid-afternoon for visitors west of UTC. Growing the list just extends
  the cycle; it doesn't need a migration.

  The whole quoted block is a link to the sutta's SuttaCentral page,
  matching the pattern already used for reflection excerpts. The foot of
  the page gets the same link ("Read the whole sutta") and the translator.

  If the data is missing or empty the whole block is removed, along with
  its foot, so the page never shows an empty frame.

  When today's sutta is one FH has published a reflection on, a second
  line links through to it. That match is read live from
  practice/data/reflections/published.json (written by
  tools/build-reflections.py, listed Reflections only) rather than being
  duplicated into the daily data, so the two lists can never drift out of
  sync. Refs are compared loosely: "from AN 3.36" and "AN 2.37 (abridged)"
  name the same sutta as "AN 3.36" and "AN 2.37".
*/
(function(){

  var block  = document.getElementById('sutta-of-day');
  var linkEl = document.getElementById('sutta-of-day-link');
  var textEl = document.getElementById('sutta-of-day-text');
  var srcEl  = document.getElementById('sutta-of-day-source');
  if (!block || !linkEl || !textEl || !srcEl) return;
  var more = document.getElementById('nb-sutta-more');
  var tr = document.getElementById('nb-sutta-tr');

  function get(url) {
    return fetch(url, { cache: 'no-cache' }).then(function(r){
      if (!r.ok) throw new Error(url);
      return r.json();
    });
  }

  function empty() {
    block.remove();
    if (more) more.parentNode.hidden = true;
  }

  get('data/daily-sutta.json').then(function(data){
    var pool = (data && Array.isArray(data.entries) ? data.entries : []).filter(function(s){
      return s && s.text && s.url && s.rotation !== 'resting';
    });
    if (pool.length === 0) { empty(); return; }

    var now = new Date();
    var dayNum = Math.floor(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000
    );
    var idx = ((dayNum % pool.length) + pool.length) % pool.length;

    var sutta = pool[idx];
    var lines = sutta.text.split('\n').map(function(line){ return line.trim(); }).filter(Boolean);
    textEl.innerHTML = lines.map(escapeHtml).join('<br>\n');
    linkEl.href = sutta.url;
    if (more) more.href = sutta.url;
    if (tr && (!sutta.translator || sutta.translator === 'sujato')) tr.textContent = 'tr. Bhikkhu Sujato';

    var meta = sutta.ref || '';
    if (sutta.translator && sutta.translator !== 'sujato') {
      meta += (meta ? ' · trans. ' : 'trans. ') + sutta.translator;
    }
    srcEl.textContent = meta;
    if (!meta) srcEl.hidden = true;

    linkReflection(sutta);
  }).catch(empty);

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- link to the reflection, if there is one ---

  function normRef(r){
    return String(r || '')
      .replace(/^from\s+/i, '')      // "from AN 3.36"    -> "AN 3.36"
      .replace(/\s*\(.*\)\s*$/, '')  // "AN 2.37 (abridged)" -> "AN 2.37"
      .trim()
      .toLowerCase();
  }

  function linkReflection(sutta) {
    var todaysRef = normRef(sutta.ref);
    if (!todaysRef) return;
    // Only listed Reflections are in published.json, each with the slug of
    // its page: an unlisted one keeps its page but is not pointed to here.
    get('data/reflections/published.json').then(function(data){
      var reflections = data && Array.isArray(data.reflections) ? data.reflections : [];
      var match = reflections.filter(function(s){
        return s && s.slug && normRef(s.ref) === todaysRef;
      })[0];
      if (!match) return;
      var link = document.createElement('a');
      link.className = 'sutta-of-day-reflection';
      link.href = 'reflections/' + encodeURIComponent(match.slug) + '.html';
      link.textContent = 'I have written a reflection on this one →';
      block.appendChild(link);
    }).catch(function(){});
  }

})();
