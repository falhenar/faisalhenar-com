/*
  RENDER: LATEST REFLECTION (hub, Reflections door)
  -------------------------------------------------
  Fills the "Latest: <title>" line inside the Reflections door on
  practice/index.html with the most recently published entry from
  suttas-config.js: the same "published" test the archive uses, a
  non-empty `note` plus an `added` date.

  Until October 2026 this filled a separate "Latest reflection" block
  above the room grid, with a teaser and a link. That block was dropped
  when the hub got its drawn doors; the one line inside the door replaces
  it. The whole door already links to the archive, so the line is text,
  not a link.

  Deliberately NO date, so a quiet month never reads as neglect.
  If nothing is published, the line stays hidden. The markup ships with
  `hidden` set, so the same is true with JS off.
*/
(function(){

  var line = document.querySelector('[data-latest-reflection]');
  if (!line) return;
  if (typeof SUTTAS === 'undefined' || !Array.isArray(SUTTAS)) return;

  var latest = SUTTAS
    .filter(function(s){ return s.note && s.note.trim().length > 0 && s.added; })
    .sort(function(a, b){
      return (new Date(b.added) - new Date(a.added)) || (SUTTAS.indexOf(a) - SUTTAS.indexOf(b));
    })[0];

  if (!latest || !latest.title) return;

  line.textContent = 'Latest: ' + latest.title;
  line.hidden = false;

})();
