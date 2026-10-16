(function () {
  "use strict";

  function ensureOverlay() {
    var root = document.getElementById("work-overlay");
    if (root) return root;
    root = document.createElement("div");
    root.id = "work-overlay";
    root.className = "work-overlay";
    root.setAttribute("hidden", "");
    root.innerHTML =
      '<div class="work-overlay__backdrop" data-close></div>' +
      '<div class="work-overlay__panel" role="dialog" aria-modal="true" aria-labelledby="work-overlay-title">' +
      '<button type="button" class="work-overlay__close" data-close aria-label="Закрыть">×</button>' +
      '<a class="work-overlay__media" target="_blank" rel="noopener">' +
      '<img alt="" />' +
      '<span class="work-overlay__media-hint" aria-hidden="true"></span>' +
      "</a>" +
      '<div class="work-overlay__body">' +
      '<p class="work-overlay__kicker"></p>' +
      '<h2 class="work-overlay__title" id="work-overlay-title"></h2>' +
      '<p class="work-overlay__text"></p>' +
      '<a class="work-overlay__link" href="#" target="_blank" rel="noopener" hidden>Смотреть проект</a>' +
      "</div></div>";
    document.body.appendChild(root);
    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) close();
    });
    return root;
  }

  /** Переносы только по смыслу (: / ·), без разрыва слова посередине */
  function formatTitle(raw) {
    var t = String(raw || "").trim();
    t = t.replace(/:\s+/g, ":\n");
    t = t.replace(/\s·\s/g, "\n");
    return t;
  }

  function setMediaLink(media, url) {
    if (url) {
      media.setAttribute("href", url);
      media.setAttribute("aria-label", "Смотреть проект");
      media.classList.add("is-linked");
      media.removeAttribute("tabindex");
    } else {
      media.removeAttribute("href");
      media.removeAttribute("aria-label");
      media.classList.remove("is-linked");
      media.setAttribute("tabindex", "-1");
    }
  }

  function open(work) {
    if (!work) return;
    var root = ensureOverlay();
    var kicker = root.querySelector(".work-overlay__kicker");
    var title = root.querySelector(".work-overlay__title");
    var text = root.querySelector(".work-overlay__text");
    var link = root.querySelector(".work-overlay__link");
    var media = root.querySelector(".work-overlay__media");
    var projectUrl = work.link || "";

    if (work.layout === "strip3" && work.images && work.images.length) {
      media.innerHTML = work.images
        .map(function (src) {
          return '<span class="work-overlay__strip" style="background-image:url(\'' + src + "')\"></span>";
        })
        .join("") + '<span class="work-overlay__media-hint" aria-hidden="true"></span>';
      media.classList.add("work-overlay__media--strip");
    } else {
      media.classList.remove("work-overlay__media--strip");
      media.innerHTML =
        '<img alt="" />' +
        '<span class="work-overlay__media-hint" aria-hidden="true"></span>';
      var img = media.querySelector("img");
      img.src = work.image;
      img.alt = work.title || "";
    }

    setMediaLink(media, projectUrl);
    kicker.textContent = work.kicker || "";
    title.textContent = formatTitle(work.title);
    text.textContent = work.body || work.short || "";
    if (projectUrl) {
      link.href = projectUrl;
      link.hidden = false;
    } else {
      link.hidden = true;
    }
    root.removeAttribute("hidden");
    document.body.classList.add("overlay-open");
    root.querySelector(".work-overlay__close").focus();
  }

  function close() {
    var root = document.getElementById("work-overlay");
    if (!root) return;
    root.setAttribute("hidden", "");
    document.body.classList.remove("overlay-open");
  }

  function openById(id) {
    var map = window.SPUTNIK_WORK_BY_ID || {};
    open(map[id]);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-work]");
    if (!btn) return;
    e.preventDefault();
    openById(btn.getAttribute("data-work"));
  });

  window.SputnikWorkOverlay = { open: open, openById: openById, close: close };
})();
