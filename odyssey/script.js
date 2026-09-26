/* ═══════════════════════════════════════════════════════════════
   THE ODYSSEY — Interactive Magazine Website
   JavaScript: Scroll animations, tabs, lightbox, navigation
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── READING PROGRESS BAR ───
    const progressBar = document.getElementById('progressBar');
    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = progress + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });

    // ─── RIGHT-SIDE CHAPTER NAVIGATION (scroll-spy) ───
    const chapterNavItems = document.querySelectorAll('.chapter-nav-item');
    const navSections = [];
    chapterNavItems.forEach(item => {
        const id = item.getAttribute('data-section');
        const el = document.getElementById(id);
        if (el) navSections.push({ id, el, navItem: item });
    });

    function updateChapterNav() {
        const scrollPos = window.scrollY + window.innerHeight * 0.35;
        let activeId = navSections[0]?.id;
        for (const sec of navSections) {
            if (sec.el.offsetTop <= scrollPos) {
                activeId = sec.id;
            }
        }
        chapterNavItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-section') === activeId);
        });
    }
    window.addEventListener('scroll', updateChapterNav, { passive: true });
    updateChapterNav();

    // Smooth scroll on click
    chapterNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(item.getAttribute('data-section'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ─── SMOOTH SCROLL FOR NAV LINKS ───
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                // Close mobile nav if open
                document.getElementById('main-nav').classList.remove('open');
            }
        });
    });

    // ─── TIMELINE CLICK TO NAVIGATE ───
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('click', () => {
            const chapter = item.dataset.chapter;
            const target = document.getElementById(chapter);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ─── TABS (Circe multi-reading) ───
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            const parent = btn.closest('.multi-reading');

            // Deactivate all
            parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Activate clicked
            btn.classList.add('active');
            document.getElementById('tab-' + tabName).classList.add('active');
        });
    });

    // ─── NAVIGATION HIDE/SHOW ON SCROLL ───
    let lastScroll = 0;
    const nav = document.getElementById('main-nav');

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 400) {
            if (currentScroll > lastScroll + 5) {
                nav.style.transform = 'translateY(-100%)';
            } else if (currentScroll < lastScroll - 5) {
                nav.style.transform = 'translateY(0)';
            }
        } else {
            nav.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // ─── PARALLAX EFFECT ON CHAPTER HEROES ───
    const chapterHeroes = document.querySelectorAll('.chapter-hero-img');
    function updateParallax() {
        chapterHeroes.forEach(img => {
            const rect = img.parentElement.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const scrolled = (rect.top / window.innerHeight);
                img.style.objectPosition = `center ${30 + scrolled * 20}%`;
            }
        });
    }
    window.addEventListener('scroll', updateParallax, { passive: true });

    // ─── KEYBOARD ACCESSIBILITY ───
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            document.getElementById('main-nav').classList.remove('open');
        }
    });

    console.log('🏛️ The Odyssey — A School of Homecoming');
    console.log('Ithaca exists in Odysseus\' mind long before it exists beneath his feet.');
});

// ─── LIGHTBOX FUNCTIONS ───
function openLightbox(element) {
    const img = element.querySelector('img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}
