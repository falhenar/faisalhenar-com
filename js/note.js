/* The note's signature (note.html / note-nl.html) writes itself once,
   when it has scrolled fully into view. Without JavaScript, or with
   reduced motion, it is simply there. */
(function () {
  var sig = document.querySelector('.note-sig');
  if (!sig || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  sig.classList.add('is-waiting');
  var io = new IntersectionObserver(function (entries) {
    if (entries.some(function (e) { return e.isIntersecting; })) {
      sig.classList.remove('is-waiting');
      sig.classList.add('is-signed');
      io.disconnect();
    }
  }, { threshold: 1 });
  // Watch the line, not the name: the hidden name's clip-path counts
  // against it, so it would never be seen as in view.
  io.observe(sig.parentNode);
})();
