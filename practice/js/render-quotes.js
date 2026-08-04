/*
  RENDER: QUOTE OF THE MOMENT
  ----------------------------
  Reads QUOTES from quotes-config.js and renders one into #quote-featured
  on practice/index.html.

  Order is a shuffled cycle, not an independent coin-flip per load: the
  list is shuffled once, then walked one quote per page load, so every
  quote appears before any of them repeats. Position is kept in
  localStorage, so the cycle survives across visits in the same browser.
  Changing the length of the list starts a fresh cycle, and a new cycle
  never opens with the quote that closed the previous one.

  If localStorage is unavailable — private browsing, file:// in some
  browsers, storage switched off — it falls back to a plain random pick.
  If the config is missing or empty the whole block is removed, so the
  page never shows an empty frame.
*/
(function(){

  var STORE_KEY = 'practice-quote-cycle';

  var block  = document.getElementById('quote-featured');
  var textEl = document.getElementById('quote-text');
  var attrEl = document.getElementById('quote-attr');
  var srcEl  = document.getElementById('quote-source');
  if (!block || !textEl || !attrEl || !srcEl) return;

  // typeof, not window.QUOTES: `const QUOTES` in the config is a global
  // lexical binding and never lands on window. Guarded at all because a
  // bare reference to a config that failed to load throws, which would
  // take the rest of this script down with it.
  var pool = (typeof QUOTES !== 'undefined' && Array.isArray(QUOTES))
    ? QUOTES.filter(function(q){ return q && q.text; })
    : [];

  if (pool.length === 0) {
    block.remove();
    return;
  }

  function readState(){
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !Array.isArray(s.order) || typeof s.i !== 'number') return null;
      return s;
    } catch (e) {
      return null;   // storage blocked, or what's stored isn't ours
    }
  }

  function writeState(s){
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {}
  }

  function shuffled(n){
    var order = [];
    for (var i = 0; i < n; i++) order.push(i);
    for (var j = n - 1; j > 0; j--){          // Fisher-Yates
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = order[j]; order[j] = order[k]; order[k] = tmp;
    }
    return order;
  }

  function nextIndex(){
    var state = readState();
    var last = (state && typeof state.last === 'number') ? state.last : -1;

    // rebuild when nothing is stored, the list changed length, or the
    // previous cycle ran out
    if (!state || state.n !== pool.length || state.i >= state.order.length){
      state = { n: pool.length, order: shuffled(pool.length), i: 0, last: last };
      if (pool.length > 1 && state.order[0] === last){
        state.order[0] = state.order[1];
        state.order[1] = last;
      }
    }

    var idx = state.order[state.i];
    if (typeof idx !== 'number' || idx < 0 || idx >= pool.length){
      return Math.floor(Math.random() * pool.length);   // stored order is junk
    }

    state.i += 1;
    state.last = idx;
    writeState(state);
    return idx;
  }

  // author and source render as separate lines: sources here run to 130-odd
  // characters (translator, volume, talk date), which is unreadable in the
  // uppercase treatment the author name gets. Same split the room pages use
  // between .entry-source and .entry-by.
  var quote = pool[nextIndex()];
  textEl.textContent = quote.text;
  attrEl.textContent = quote.author || '';
  srcEl.textContent  = quote.source || '';
  if (!quote.source) srcEl.hidden = true;

})();
