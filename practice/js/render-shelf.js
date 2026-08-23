(function () {
  "use strict";

  /* Shared renderer for shelf-style rooms (Listening, Watching). Reads the
     JSON path from data-shelf-src on <main> and fills every element carrying
     data-shelf-list with the matching collection. Reading still uses
     render-reading.js: it has three extra layouts (return, path, talk) that
     would only complicate this one. Migrate it if those ever go away. */

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* accepts absolute URLs, same-page hashes and same-site relative paths */
  function appendInline(parent, value) {
    var pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
    var cursor = 0;
    var match;
    while ((match = pattern.exec(value))) {
      parent.appendChild(document.createTextNode(value.slice(cursor, match.index)));
      var link = element("a", "", match[1]);
      link.href = match[2];
      if (/^https?:/i.test(match[2])) link.rel = "noopener";
      parent.appendChild(link);
      cursor = pattern.lastIndex;
    }
    parent.appendChild(document.createTextNode(value.slice(cursor)));
  }

  function title(item) {
    var heading = element("h3", "entry-title");
    if (!item.url) {
      heading.textContent = item.title;
      return heading;
    }
    var link = element("a", "", item.title);
    link.href = item.url;
    link.rel = "noopener";
    var external = element("span", "ext", " ↗");
    external.setAttribute("aria-hidden", "true");
    link.appendChild(external);
    heading.appendChild(link);
    return heading;
  }

  function renderItem(item) {
    var article = element("article", "book-entry");
    if (item.id) article.id = item.id;
    article.appendChild(title(item));
    article.appendChild(element("p", "entry-by", item.author));
    if (item.description) {
      var description = element("p", "entry-note");
      appendInline(description, item.description);
      article.appendChild(description);
    }
    if (item.meta) {
      var meta = element("p", "entry-meta mono");
      appendInline(meta, item.meta);
      article.appendChild(meta);
    }
    return article;
  }

  function showError() {
    var target = document.querySelector("[data-shelf-list]");
    if (!target) return;
    target.appendChild(element("p", "entry-note", "This list could not be loaded. Please try again later."));
  }

  var root = document.querySelector("[data-shelf-src]");
  if (!root) return;

  fetch(root.getAttribute("data-shelf-src"), {cache: "no-cache"}).then(function (response) {
    if (!response.ok) throw new Error("Shelf data request failed.");
    return response.json();
  }).then(function (data) {
    data.collections.forEach(function (collection) {
      var target = document.querySelector('[data-shelf-list="' + collection.id + '"]');
      if (!target) return;
      collection.items.forEach(function (item) {
        target.appendChild(renderItem(item));
      });
      var count = document.querySelector('[data-shelf-count="' + collection.id + '"]');
      if (count) count.textContent = String(collection.items.length);
    });
    var updated = document.querySelector("[data-shelf-updated]");
    if (updated && data.updated) {
      updated.dateTime = data.updated.datetime;
      updated.textContent = data.updated.label;
    }
  }).catch(showError);
}());
