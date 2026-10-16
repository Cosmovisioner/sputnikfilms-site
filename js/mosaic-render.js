(function () {
  "use strict";
  var works = window.SPUTNIK_WORKS || [];
  var mount = document.getElementById("ms-mount");
  if (!mount || !works.length) return;
  /* если витрина уже вшита в HTML — не пересобирать */
  if (mount.querySelector(".grid, .spread-row, .c-grid")) return;
  var variant = mount.getAttribute("data-variant") || "b";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  /** Многословные названия → две строки по смыслу (динамика плитки) */
  function titleLines(raw) {
    var t = String(raw || "").trim();
    if (!t) return { stacked: false, html: "" };

    var m;
    m = t.match(/^(.+?:)\s+(.+)$/);
    if (m) return { stacked: true, html: linePair(m[1], m[2]) };

    m = t.match(/^(.+?)\s*[×]\s*(.+)$/);
    if (m) return { stacked: true, html: linePair(m[1] + " ×", m[2]) };

    var words = t.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      var cut = balanceCut(words);
      return {
        stacked: true,
        html: linePair(words.slice(0, cut).join(" "), words.slice(cut).join(" "))
      };
    }

    m = t.match(/^(.+)-(.+)$/);
    if (m && m[1].length >= 3 && m[2].length >= 3) {
      return { stacked: true, html: linePair(m[1] + "-", m[2]) };
    }

    return { stacked: false, html: esc(t) };
  }

  function balanceCut(words) {
    var best = 1;
    var bestScore = Infinity;
    for (var i = 1; i < words.length; i++) {
      var left = words.slice(0, i).join(" ").length;
      var right = words.slice(i).join(" ").length;
      var score = Math.abs(left - right);
      if (i === 1 && words[0].length <= 3) score += 4;
      if (i === words.length - 1 && words[words.length - 1].length <= 3) score += 4;
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    return best;
  }

  function linePair(a, b) {
    return (
      '<span class="name-line">' + esc(a) + "</span>" +
      '<span class="name-line">' + esc(b) + "</span>"
    );
  }

  function titleHeading(tag, className, raw) {
    var tl = titleLines(raw);
    var cls = className + (tl.stacked ? " name--stacked" : "");
    return "<" + tag + ' class="' + cls + '">' + tl.html + "</" + tag + ">";
  }

  function renderA() {
    var html = "";
    works.forEach(function (w, i) {
      var flip = i % 2 === 1 ? " spread-row--flip" : "";
      html +=
        '<article class="spread-row' + flip + '" data-work="' + esc(w.id) + '" role="button" tabindex="0">' +
        '<figure class="spread-visual"><img src="' + esc(w.image) + '" alt="" loading="lazy" /></figure>' +
        '<div class="spread-copy">' +
        '<p class="spread-kicker">' + esc(w.kicker) + "</p>" +
        titleHeading("h2", "spread-title", w.title) +
        '<p class="spread-lead">' + esc(w.short) + "</p>" +
        '<span class="spread-go">Смотреть кейс</span>' +
        "</div></article>";
    });
    mount.innerHTML = html;
  }

  function tileMeta(w) {
    return (
      '<div class="tile-copy">' +
      '<span class="kicker">' + esc(w.kicker) + "</span>" +
      titleHeading("h2", "name", w.title) +
      "</div>"
    );
  }

  function tileHero(w) {
    return (
      '<a class="tile tile--hero" href="#" data-work="' + esc(w.id) + '">' +
      '<div class="bg" style="background-image:url(\'' + esc(w.image) + "')\"></div>" +
      '<div class="shade"></div>' +
      tileMeta(w) +
      "</a>"
    );
  }

  function tilePair(w, end) {
    if (w.layout === "strip3" && w.images && w.images.length) {
      var imgs = w.images
        .map(function (src) {
          return '<span class="strip-cell" style="background-image:url(\'' + esc(src) + "')\"></span>";
        })
        .join("");
      return (
        '<a class="tile tile--strip3' + (end ? " tile--end" : "") + '" href="#" data-work="' + esc(w.id) + '">' +
        '<div class="strip3">' + imgs + "</div>" +
        '<div class="shade"></div>' +
        tileMeta(w) +
        "</a>"
      );
    }
    return (
      '<a class="tile' + (end ? " tile--end" : "") + '" href="#" data-work="' + esc(w.id) + '">' +
      '<div class="bg" style="background-image:url(\'' + esc(w.image) + "')\"></div>" +
      '<div class="shade"></div>' +
      tileMeta(w) +
      "</a>"
    );
  }

  function renderB() {
    /* Крупные (hero:true); пары rest с учётом pairWith */
    var heroes = works.filter(function (w) {
      return w.hero;
    });
    var pool = works.filter(function (w) {
      return !w.hero;
    });
    var byId = {};
    pool.forEach(function (w) {
      byId[w.id] = w;
    });
    var used = {};
    var html = '<div class="grid">';

    function nextFree() {
      for (var i = 0; i < pool.length; i++) {
        if (!used[pool[i].id]) return pool[i];
      }
      return null;
    }

    function isLockedFree(w) {
      return !!(w.pairWith && byId[w.pairWith] && !used[w.pairWith]);
    }

    function takePair() {
      var a = nextFree();
      if (!a) return null;
      used[a.id] = true;
      var b = null;
      if (isLockedFree(a)) {
        b = byId[a.pairWith];
        used[b.id] = true;
      } else {
        for (var i = 0; i < pool.length; i++) {
          var cand = pool[i];
          if (used[cand.id] || isLockedFree(cand)) continue;
          b = cand;
          used[b.id] = true;
          break;
        }
      }
      return { a: a, b: b };
    }

    heroes.forEach(function (h) {
      html += tileHero(h);
      var pair = takePair();
      if (!pair) return;
      if (pair.b) {
        html += tilePair(pair.a, false);
        html += tilePair(pair.b, true);
      } else {
        html += tilePair(pair.a, true);
      }
    });
    while (true) {
      var more = takePair();
      if (!more) break;
      if (more.b) {
        html += tilePair(more.a, false);
        html += tilePair(more.b, true);
      } else {
        html += tileHero(more.a);
      }
    }
    html += "</div>";
    mount.innerHTML = html;
  }

  function renderC() {
    var html = '<div class="c-grid">';
    works.forEach(function (w, i) {
      var wide = w.hero || i % 3 === 0 ? " c-card--wide" : "";
      html +=
        '<a class="c-card' + wide + '" href="#" data-work="' + esc(w.id) + '">' +
        '<img src="' + esc(w.image) + '" alt="" loading="lazy" />' +
        '<div class="c-plate">' +
        '<span class="c-kicker">' + esc(w.kicker) + "</span>" +
        titleHeading("h2", "c-name", w.title) +
        '<p class="c-lead">' + esc(w.short) + "</p>" +
        "</div></a>";
    });
    html += "</div>";
    mount.innerHTML = html;
  }

  if (variant === "a") renderA();
  else if (variant === "c") renderC();
  else renderB();

  mount.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest("[data-work]");
    if (!el) return;
    e.preventDefault();
    el.click();
  });
})();
