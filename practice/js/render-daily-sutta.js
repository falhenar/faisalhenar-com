/*
  RENDER: SUTTA OF THE DAY
  --------------------------
  Reads DAILY_SUTTAS from daily-sutta-config.js and renders one into
  #sutta-of-day on practice/index.html.

  Unlike the quote-of-the-moment widget (one per page load, shuffled,
  tracked in localStorage), this rotation is deterministic and date-based:
  the same entry shows to every visitor on a given calendar day, and it
  changes at local midnight. No storage, no state to lose.

  Index = days-since-epoch (from the visitor's local calendar date) mod
  the pool length. Using UTC.Date() on the local y/m/d, rather than
  Date.now()/86400000, avoids the index drifting mid-afternoon for
  visitors west of UTC. Growing the list just extends the cycle; it
  doesn't need a migration.

  The whole quoted block is a link to the sutta's SuttaCentral page,
  matching the pattern already used for reflection excerpts.

  If the config is missing or empty the whole block is removed, so the
  page never shows an empty frame.
*/
(function(){

  var block  = document.getElementById('sutta-of-day');
  var linkEl = document.getElementById('sutta-of-day-link');
  var textEl = document.getElementById('sutta-of-day-text');
  var srcEl  = document.getElementById('sutta-of-day-source');
  if (!block || !linkEl || !textEl || !srcEl) return;

  // typeof, not window.DAILY_SUTTAS — same reasoning as render-quotes.js.
  var pool = (typeof DAILY_SUTTAS !== 'undefined' && Array.isArray(DAILY_SUTTAS))
    ? DAILY_SUTTAS.filter(function(s){ return s && s.text && s.url; })
    : [];

  if (pool.length === 0) {
    block.remove();
    return;
  }

  var now = new Date();
  var dayNum = Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000
  );
  var idx = ((dayNum % pool.length) + pool.length) % pool.length;

  var sutta = pool[idx];
  var lines = sutta.text.split('\n').map(function(line){ return line.trim(); }).filter(Boolean);
  textEl.innerHTML = lines.join('<br>');
  linkEl.href = sutta.url;

  var meta = sutta.ref || '';
  if (sutta.translator && sutta.translator !== 'sujato') {
    meta += (meta ? ' · trans. ' : 'trans. ') + sutta.translator;
  }
  srcEl.textContent = meta;
  if (!meta) srcEl.hidden = true;

})();
