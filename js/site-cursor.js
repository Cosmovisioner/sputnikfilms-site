(function () {
  "use strict";

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!fine.matches) return;

  var root = document.body;
  var cur = document.getElementById("site-cursor");
  if (!root || !cur) return;

  var x = -100;
  var y = -100;
  var tx = -100;
  var ty = -100;
  var inside = false;
  var hotSel =
    "a, button, .award-pill, .tile, .ms-tile, [role='button'], .contact-finale__mail, .contact-finale__tg, .rail a, .work-overlay__media.is-linked, .work-overlay__link";

  function onMove(e) {
    tx = e.clientX;
    ty = e.clientY;
  }

  function setHot(on) {
    cur.classList.toggle("is-hot", !!on);
  }

  root.classList.add("site-cursor-on");
  cur.classList.add("is-on");
  inside = true;

  window.addEventListener("mousemove", onMove, { passive: true });

  document.addEventListener(
    "mouseover",
    function (e) {
      var t = e.target;
      if (!(t instanceof Element)) return;
      setHot(!!t.closest(hotSel));
    },
    true
  );

  document.addEventListener(
    "mouseout",
    function (e) {
      var related = e.relatedTarget;
      if (related instanceof Element && related.closest(hotSel)) return;
      var t = e.target;
      if (t instanceof Element && t.closest(hotSel)) setHot(false);
    },
    true
  );

  window.addEventListener("mouseleave", function () {
    inside = false;
    cur.classList.remove("is-on", "is-hot");
  });

  window.addEventListener("mouseenter", function () {
    inside = true;
    cur.classList.add("is-on");
  });

  (function loop() {
    if (inside) {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      cur.style.transform = "translate3d(" + x + "px," + y + "px,0)";
    }
    requestAnimationFrame(loop);
  })();
})();
