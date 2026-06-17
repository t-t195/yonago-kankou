/* Number Second LP — main.js（最小インタラクション）
   方針: 原則最小。アコーディオンは <details> をHTML標準で使うのでJS不要。
   ここではモバイルナビの開閉のみ。 */
(function () {
  "use strict";

  // モバイルナビ開閉
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    // ナビ内リンクをタップしたら閉じる
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }
})();
