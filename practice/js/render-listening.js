(function () {
  "use strict";

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* accepts absolute URLs, same-page hashes and same-site relative paths.
     render-reading.js allows only the first two; worth back-porting there. */
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

  function title(show) {
    var heading = element("h3", "entry-title");
    if (!show.url) {
      heading.textContent = show.title;
      return heading;
    }
    var link = element("a", "", show.title);
    link.href = show.url;
    link.rel = "noopener";
    var external = element("span", "ext", " ↗");
    external.setAttribute("aria-hidden", "true");
    link.appendChild(external);
    heading.appendChild(link);
    return heading;
  }

  function renderShow(show) {
    var article = element("article", "book-entry");
    if (show.id) article.id = show.id;
    article.appendChild(title(show));
    article.appendChild(element("p", "entry-by", show.author));
    if (show.description) {
      var description = element("p", "entry-note");
      appendInline(description, show.description);
      article.appendChild(description);
    }
    if (show.meta) {
      var meta = element("p", "entry-meta mono");
      appendInline(meta, show.meta);
      article.appendChild(meta);
    }
    return article;
  }

  function showError() {
    var target = document.querySelector("[data-listening-list]");
    if (!target) return;
    target.appendChild(element("p", "entry-note", "This list could not be loaded. Please try again later."));
  }

  fetch("data/listening.json", {cache: "no-cache"}).then(function (response) {
    if (!response.ok) throw new Error("Listening data request failed.");
    return response.json();
  }).then(function (data) {
    data.collections.forEach(function (collection) {
      var target = document.querySelector('[data-listening-list="' + collection.id + '"]');
      if (!target) return;
      collection.shows.forEach(function (show) {
        target.appendChild(renderShow(show));
      });
      var count = document.querySelector('[data-listening-count="' + collection.id + '"]');
      if (count) count.textContent = String(collection.shows.length);
    });
    var updated = document.querySelector("[data-listening-updated]");
    if (updated && data.updated) {
      updated.dateTime = data.updated.datetime;
      updated.textContent = data.updated.label;
    }
  }).catch(showError);
}());
