/* 株式会社ナンバーセカンド — main.js
   最小限のvanilla JS（jQuery不使用）
   ① モバイルナビ開閉  ② fade-up スクロール表示  ③ コピーライト年  ④ アンカースムーススクロール */
(function () {
  "use strict";

  /* ① モバイルナビ開閉 */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("global-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "メニューを開く");
      }
    });
  }

  /* ② fade-up（IntersectionObserver。未対応環境は即表示） */
  var targets = document.querySelectorAll(".fade-up");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ③ コピーライト年 */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ④ 問い合わせフォーム（送信先未設定のたたき台用ガード）
     TODO: 本番フォーム接続後はこのハンドラを外し、action/method を有効化する */
  var form = document.querySelector(".contact-form");
  if (form && form.getAttribute("action") === "#") {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var note = form.querySelector(".contact-form__note");
      if (note) {
        note.textContent = "※ 現在は試作版のため送信先が未接続です。お急ぎの場合は LINE・お電話をご利用ください。";
        note.style.color = "#b00020";
      }
    });
  }
})();
