/* Story Magazine starter script (no dependencies).
   Adapted from the final Odyssey build: progress bar, chapter scroll-spy,
   hide-on-scroll nav, interpretive tabs, image lightbox.
   Deliberately NOT included: scroll-reveal that hides content until an
   observer fires (caused blank gaps in the Odyssey build) and scroll parallax. */
(function () {
    "use strict";

    var nav = document.querySelector(".site-nav");
    var bar = document.querySelector(".progress-bar");
    var railLinks = Array.prototype.slice.call(document.querySelectorAll(".chapter-rail a[href^='#']"));
    var targets = railLinks
        .map(function (a) { return { link: a, el: document.getElementById(a.getAttribute("href").slice(1)) }; })
        .filter(function (t) { return t.el; });

    var lastY = window.scrollY;
    var ticking = false;

    function onScroll() {
        var y = window.scrollY;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";

        if (targets.length) {
            var probe = y + window.innerHeight * 0.35;
            var active = null;
            targets.forEach(function (t) { if (t.el.offsetTop <= probe) active = t; });
            targets.forEach(function (t) {
                if (t === active) t.link.setAttribute("aria-current", "true");
                else t.link.removeAttribute("aria-current");
            });
        }

        if (nav && !nav.classList.contains("open") && !nav.contains(document.activeElement)) {
            if (y > 400 && y > lastY + 5) nav.classList.add("is-hidden");
            else if (y < lastY - 5 || y <= 400) nav.classList.remove("is-hidden");
        }
        lastY = y;
        ticking = false;
    }
    window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    // Mobile menu toggle
    var toggle = document.querySelector(".nav-toggle");
    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
        nav.addEventListener("click", function (e) {
            if (e.target.closest("a[href^='#']")) {
                nav.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
                var d = nav.querySelector("details[open]");
                if (d) d.removeAttribute("open");
            }
        });
    }

    // Interpretive tabs (WAI-ARIA tabs pattern, arrow-key navigation)
    document.querySelectorAll("[role='tablist']").forEach(function (list) {
        var tabs = Array.prototype.slice.call(list.querySelectorAll("[role='tab']"));
        function select(tab, focus) {
            tabs.forEach(function (t) {
                var on = t === tab;
                t.setAttribute("aria-selected", on ? "true" : "false");
                t.tabIndex = on ? 0 : -1;
                var panel = document.getElementById(t.getAttribute("aria-controls"));
                if (panel) panel.hidden = !on;
            });
            if (focus) tab.focus();
        }
        tabs.forEach(function (tab, i) {
            tab.addEventListener("click", function () { select(tab, false); });
            tab.addEventListener("keydown", function (e) {
                var n = null;
                if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
                if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
                if (e.key === "Home") n = tabs[0];
                if (e.key === "End") n = tabs[tabs.length - 1];
                if (n) { e.preventDefault(); select(n, true); }
            });
        });
    });

    // Lightbox using native <dialog>: Escape closes, focus returns to opener.
    var dialog = document.getElementById("lightbox");
    if (dialog && typeof dialog.showModal === "function") {
        var dImg = dialog.querySelector("img");
        var dCap = dialog.querySelector(".lightbox-caption");
        var opener = null;
        document.querySelectorAll(".art-open").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var img = btn.querySelector("img");
                opener = btn;
                dImg.src = img.currentSrc || img.src;
                dImg.alt = img.alt;
                if (dCap) dCap.textContent = btn.getAttribute("data-caption") || img.alt;
                dialog.showModal();
            });
        });
        dialog.addEventListener("click", function (e) {
            if (e.target === dialog || e.target.closest(".lightbox-close")) dialog.close();
        });
        dialog.addEventListener("close", function () { if (opener) opener.focus(); });
    }
})();
