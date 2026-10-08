/*
  Listening and Watching became one room, Talks (October 2026). GitHub Pages
  cannot redirect on the server, so these two pages send the reader on from
  here, keeping the anchor: talks.html knows every old entry id (each source
  lists the ids it replaced), and the old section ids are mapped below.
  The page's meta refresh and its visible link do the same without
  JavaScript, minus the anchor.
*/
(function () {
  'use strict';
  var SECTIONS = { 'starting-out': 'first-look', 'practising': 'teachers', 'sitting-in': 'monasteries' };
  var hash = window.location.hash.slice(1);
  if (SECTIONS[hash]) hash = SECTIONS[hash];
  window.location.replace('talks.html' + (hash ? '#' + hash : ''));
})();
