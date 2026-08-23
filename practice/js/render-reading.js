(function () {
  "use strict";

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function appendInline(parent, value) {
    var pattern = /\[([^\]]+)\]\((https?:\/\/[^)]+|#[a-z0-9-]+)\)/gi;
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

  function title(book, level) {
    var heading = element(level, "entry-title");
    if (!book.url) {
      heading.textContent = book.title;
      return heading;
    }
    var link = element("a", "", book.title);
    link.href = book.url;
    link.rel = "noopener";
    var external = element("span", "ext", "\u202f↗");
    external.setAttribute("aria-hidden", "true");
    link.appendChild(external);
    heading.appendChild(link);
    return heading;
  }

  function details(book, level) {
    var fragment = document.createDocumentFragment();
    fragment.appendChild(title(book, level));
    fragment.appendChild(element("p", "entry-by", book.author));
    if (book.description) {
      var description = element("p", book.descriptionStyle === "reflection" ? "reading-reflection" : "entry-note");
      appendInline(description, book.description);
      fragment.appendChild(description);
    }
    if (book.meta) {
      var meta = element("p", "entry-meta mono");
      appendInline(meta, book.meta);
      fragment.appendChild(meta);
    }
    return fragment;
  }

  function renderBook(book, collection, index) {
    if (collection.kind === "path") {
      var item = element("li");
      item.appendChild(element("span", "reading-path-n", String(index + 1)));
      var body = element("div");
      body.appendChild(details(book, "h3"));
      item.appendChild(body);
      return item;
    }
    var article = element("article", collection.kind === "return" ? "return-book" : "book-entry");
    if (collection.kind === "return" && book.wide) article.classList.add("return-book--wide");
    if (book.id) article.id = book.id;
    article.appendChild(details(book, collection.kind === "talk" ? "h4" : "h3"));
    return article;
  }

  function showError() {
    document.querySelectorAll("[data-reading-list]").forEach(function (target, index) {
      if (index !== 0) return;
      var message = element("p", "entry-note", "The reading shelf could not be loaded. Please try again later.");
      target.appendChild(message);
    });
  }

  fetch("data/reading.json", {cache: "no-cache"}).then(function (response) {
    if (!response.ok) throw new Error("Reading data request failed.");
    return response.json();
  }).then(function (data) {
    var counts = {"teachings-talks": 0};
    data.collections.forEach(function (collection) {
      var target = document.querySelector('[data-reading-list="' + collection.id + '"]');
      if (!target) return;
      collection.books.forEach(function (book, index) {
        target.appendChild(renderBook(book, collection, index));
      });
      if (collection.kind === "talk") counts["teachings-talks"] += collection.books.length;
      else counts[collection.id] = collection.books.length;
    });
    Object.keys(counts).forEach(function (id) {
      var target = document.querySelector('[data-reading-count="' + id + '"]');
      if (target) target.textContent = String(counts[id]);
    });
    var updated = document.querySelector("[data-reading-updated]");
    if (updated && data.updated) {
      updated.dateTime = data.updated.datetime;
      updated.textContent = data.updated.label;
    }
  }).catch(showError);
}());
