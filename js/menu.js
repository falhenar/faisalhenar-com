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

  document.querySelectorAll('[data-menu]').forEach(function (menu) {
    var btn = menu.querySelector('[data-menu-btn]');
    var panel = menu.querySelector('[data-menu-panel]');
    if (!btn || !panel) return;

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

    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) {
        closeMenu();
        btn.focus();
      }
    });
  });
})();
