/* Madonna edition — progressive enhancement only (the page is complete without JS).
   Progress line tinted by the current track's era colour, nav state over the
   hero, current-track indicator, side-rail scroll-spy, mobile menu, WAI-ARIA
   tabs (mixing-desk readings and the album explorer), a pause control for the
   persistent hero/disc animations, and a native <dialog> lightbox with
   closedby="any" plus a click-outside fallback for browsers without it. */
(function () {
    "use strict";

    var root = document.documentElement;
    var nav = document.querySelector(".site-nav");
    var bar = document.querySelector(".progress-bar");
    var hero = document.querySelector(".site-hero");
    var now = document.querySelector(".nav-now");
    var railLinks = Array.prototype.slice.call(document.querySelectorAll(".chapter-rail a[href^='#']"));
    var targets = railLinks
        .map(function (a) {
            var el = document.getElementById(a.getAttribute("href").slice(1));
            return { link: a, el: el, label: a.getAttribute("data-label"), era: el ? el.getAttribute("data-era") : null };
        })
        .filter(function (t) { return t.el; });

    var lastY = window.scrollY;
    var ticking = false;
    var current = null;

    function onScroll() {
        var y = window.scrollY;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";

        if (nav && hero) {
            var overHero = y < hero.offsetHeight - nav.offsetHeight - 10;
            nav.classList.toggle("is-top", overHero && !nav.classList.contains("open"));
        }

        if (targets.length) {
            var probe = y + window.innerHeight * 0.35;
            var active = null;
            targets.forEach(function (t) { if (t.el.offsetTop <= probe) active = t; });
            var last = targets[targets.length - 1].el;
            if (active && active.el === last && probe > last.offsetTop + last.offsetHeight) active = null;
            if (active !== current) {
                current = active;
                targets.forEach(function (t) {
                    if (t === active) t.link.setAttribute("aria-current", "true");
                    else t.link.removeAttribute("aria-current");
                });
                if (now) now.textContent = active ? active.label : "";
                if (active && active.era) root.style.setProperty("--current-era", active.era);
                else root.style.removeProperty("--current-era");
            }
        }

        if (nav && !nav.classList.contains("open") && !nav.contains(document.activeElement)) {
            if (y > 600 && y > lastY + 6) nav.classList.add("is-hidden");
            else if (y < lastY - 6 || y <= 600) nav.classList.remove("is-hidden");
        }
        lastY = y;
        ticking = false;
    }
    window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    // Mobile menu
    var toggle = document.querySelector(".nav-toggle");
    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            onScroll();
        });
        nav.addEventListener("click", function (e) {
            if (e.target.closest("a[href^='#']")) {
                nav.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
                var d = nav.querySelector("details[open]");
                if (d) d.removeAttribute("open");
            }
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && nav.classList.contains("open")) {
                nav.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
                toggle.focus();
            }
        });
    }
    // Close the desktop "Tracklist" menu when clicking elsewhere or pressing Escape
    var menu = document.querySelector(".nav-chapters");
    document.addEventListener("click", function (e) {
        if (menu && menu.open && !menu.contains(e.target)) menu.removeAttribute("open");
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menu && menu.open) {
            menu.removeAttribute("open");
            menu.querySelector("summary").focus();
        }
    });

    // Tabs (WAI-ARIA pattern) — used by the mixing-desk readings and the album explorer
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
            if (list.classList.contains("era-tabs") && typeof tab.scrollIntoView === "function") {
                var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
            }
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

    // Pause / play the persistent decorative motion (hero beams, ticker, spinning discs)
    var motion = document.querySelector(".motion-toggle");
    if (motion) {
        var KEY = "madonna-motion-paused";
        var stored = null;
        try { stored = window.localStorage.getItem(KEY); } catch (err) { stored = null; }
        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        function setPaused(p) {
            document.body.classList.toggle("motion-paused", p);
            motion.setAttribute("aria-pressed", p ? "true" : "false");
            motion.textContent = p ? "Play motion" : "Pause motion";
        }
        setPaused(stored === "1" || (stored === null && reduced));
        motion.addEventListener("click", function () {
            var p = !document.body.classList.contains("motion-paused");
            setPaused(p);
            try { window.localStorage.setItem(KEY, p ? "1" : "0"); } catch (err) { /* storage unavailable */ }
        });
    }

    // Lightbox: native <dialog closedby="any">; Escape closes; focus returns to the opener.
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
        dialog.querySelector(".lightbox-close").addEventListener("click", function () { dialog.close(); });
        // Fallback for browsers without closedby support: close on backdrop clicks.
        if (!("closedBy" in HTMLDialogElement.prototype)) {
            dialog.addEventListener("click", function (event) {
                if (event.target !== dialog) return;
                var r = dialog.getBoundingClientRect();
                var inside = r.top <= event.clientY && event.clientY <= r.top + r.height &&
                             r.left <= event.clientX && event.clientX <= r.left + r.width;
                if (!inside) dialog.close();
            });
        }
        dialog.addEventListener("close", function () { if (opener) opener.focus(); });
    }
})();
