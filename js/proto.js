(function () {
  var mark = document.querySelector(".nameplate");
  var pin = document.querySelector(".hero-pin");
  var left = document.querySelector(".name-l");
  var right = document.querySelector(".name-r");
  if (!mark || !pin || !left || !right) return;

  function room() {
    var cs = getComputedStyle(pin);
    return pin.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }

  function fit() {
    var max = room();
    var lo = 40;
    var hi = Math.max(max * 0.55, 80);
    var best = lo;
    var i;
    for (i = 0; i < 30; i += 1) {
      var mid = (lo + hi) / 2;
      mark.style.fontSize = mid + "px";
      var used = left.offsetWidth + right.offsetWidth + Math.max(48, max * 0.12);
      if (used <= max) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    mark.style.fontSize = best + "px";
    var guard = 0;
    while (
      left.offsetWidth + right.offsetWidth + Math.max(48, max * 0.12) > max + 1 &&
      guard < 20
    ) {
      best -= 0.5;
      mark.style.fontSize = best + "px";
      guard += 1;
    }
  }

  function boot() {
    fit();
    mark.style.transform = "";
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
  } else {
    boot();
  }
  window.addEventListener("load", boot);
  window.addEventListener("resize", fit);
})();

(function () {
  var mast = document.querySelector(".projects-mast");
  var chapter = document.querySelector(".projects-chapter");
  if (!mast || !chapter) return;

  var ticking = false;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function paint() {
    ticking = false;
    var rect = chapter.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    // 0 — глава только входит снизу; 1 — центр главы в центре экрана
    var raw = (vh - rect.top) / (vh * 0.55 + rect.height * 0.35);
    var t = Math.max(0, Math.min(1, raw));
    var e = easeOutCubic(t);
    var scale = 0.86 + e * 0.2;
    var opacity = 0.18 + e * 0.82;
    mast.style.transform = "scale(" + scale.toFixed(4) + ")";
    mast.style.opacity = opacity.toFixed(3);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(paint);
    }
  }

  paint();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
})();
