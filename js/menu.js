/* Site menu: opens on click, and on hover for fine-pointer devices.
   Shared by every page. Keep this the only copy. */
(function () {
  'use strict';

  // Only devices with a real pointer get hover. On touch screens a "hover"
  // is really the first tap, which would open and immediately close the menu.
  var canHover = window.matchMedia
    ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
    : false;

  var CLOSE_DELAY = 180; // ms of grace when the pointer leaves

  // Collected so the two document-level listeners below can be registered once
  // instead of once per menu. With a single menu per page the old arrangement
  // worked; it would have fired N times the day a page carried two.
  var menus = [];

  document.querySelectorAll('[data-menu]').forEach(function (menu) {
    var btn = menu.querySelector('[data-menu-btn]');
    var panel = menu.querySelector('[data-menu-panel]');
    if (!btn || !panel) return;

    // Markup ships without `hidden` so the panel is a plain visible link
    // list when JS doesn't run. Close it here once JS is confirmed running.
    panel.hidden = true;

    var closeTimer = null;
    // Set when a click closes the menu, so the pointer still resting on the
    // button does not immediately reopen it.
    var hoverBlocked = false;

    function cancelClose() {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    }

    function openMenu() {
      cancelClose();
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      cancelClose();
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }

    function closeSoon() {
      cancelClose();
      closeTimer = setTimeout(closeMenu, CLOSE_DELAY);
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.hidden) {
        openMenu();
      } else {
        closeMenu();
        hoverBlocked = true;
      }
    });

    if (canHover) {
      menu.addEventListener('mouseenter', function () {
        if (!hoverBlocked) openMenu();
      });

      menu.addEventListener('mouseleave', function () {
        hoverBlocked = false;
        closeSoon();
      });
    }

    // Keyboard: leaving the menu entirely closes it.
    menu.addEventListener('focusout', function (e) {
      if (!menu.contains(e.relatedTarget)) closeMenu();
    });

    menus.push({ menu: menu, btn: btn, panel: panel, close: closeMenu });
  });

  document.addEventListener('click', function (e) {
    menus.forEach(function (m) {
      if (!m.menu.contains(e.target)) m.close();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    menus.forEach(function (m) {
      if (m.panel.hidden) return;
      m.close();
      m.btn.focus();
    });
  });
})();
