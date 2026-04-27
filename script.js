/* ── Hero background slideshow ───────────────────────────────── */
(function () {
  const slides = document.querySelectorAll('.hero-bg');
  if (slides.length < 2) return;
  let current = 0;

  function show(index) {
    const prev = slides[current];
    prev.classList.add('hero-bg-fading');
    prev.addEventListener('transitionend', () => {
      prev.classList.remove('active', 'hero-bg-fading');
    }, { once: true });
    current = (index + slides.length) % slides.length;
    const next = slides[current];
    next.style.animation = 'none';
    void next.offsetWidth; // force reflow to restart animation
    next.style.animation = '';
    next.classList.add('active');
  }

  setInterval(() => show(current + 1), 7000);
})();

/* ── Mobile nav ──────────────────────────────────────────────── */
const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── Interactive cards (stat / feature / mini / cta) ────────── */
document.querySelectorAll('.interactive-card').forEach(card => {
  card.addEventListener('click', function () {
    const wasActive = this.classList.contains('is-active');
    const group = this.closest('.quick-stats, .card-grid, .event-cards, .cta-banner');
    if (group) {
      group.querySelectorAll('.interactive-card').forEach(c => c.classList.remove('is-active'));
    }
    if (!wasActive) this.classList.add('is-active');
  });
});

/* ── Scroll reveal ───────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Year ────────────────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Gallery fade slider ─────────────────────────────────────── */
(function () {
  const images  = document.querySelectorAll('.gallery-img');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const dotsEl  = document.getElementById('galleryDots');
  if (!images.length || !dotsEl) return;

  let current = 0;
  let timer;

  function buildDots() {
    dotsEl.innerHTML = '';
    images.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Show image ' + (i + 1));
      dot.addEventListener('click', () => { show(i); resetTimer(); });
      dotsEl.appendChild(dot);
    });
  }

  function show(index) {
    images[current].classList.remove('active');
    dotsEl.children[current].classList.remove('active');
    current = (index + images.length) % images.length;
    images[current].classList.add('active');
    dotsEl.children[current].classList.add('active');
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), 6000);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { show(current - 1); resetTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { show(current + 1); resetTimer(); });

  const wrapper = document.querySelector('.gallery-slider-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => clearInterval(timer));
    wrapper.addEventListener('mouseleave', resetTimer);
  }

  buildDots();
  resetTimer();
})();

/* ── Reviews scroll-snap slider ──────────────────────────────── */
(function () {
  const scroll  = document.getElementById('reviewsScroll');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  const dotsEl  = document.getElementById('reviewsDots');
  if (!scroll) return;

  const slides = Array.from(scroll.querySelectorAll('.review-slide'));
  let activeIdx = 0;
  let autoTimer;
  let scrollEndTimer;

  function getGap() {
    return parseFloat(getComputedStyle(scroll).gap) || 20;
  }
  function getSlideW() {
    return slides[0] ? slides[0].offsetWidth + getGap() : 340;
  }
  function getVisible() {
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 940) return 2;
    return 3;
  }
  function getMaxIdx() {
    return Math.max(0, slides.length - getVisible());
  }

  function buildDots() {
    if (!dotsEl) return;
    const max = getMaxIdx();
    dotsEl.innerHTML = '';
    for (let i = 0; i <= max; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.setAttribute('aria-label', 'Review group ' + (i + 1));
      dot.addEventListener('click', () => { goTo(i); resetAutoTimer(); });
      dotsEl.appendChild(dot);
    }
    syncDots();
  }

  function syncDots() {
    if (!dotsEl) return;
    Array.from(dotsEl.children).forEach((d, i) => d.classList.toggle('active', i === activeIdx));
    if (prevBtn) prevBtn.disabled = activeIdx === 0;
    if (nextBtn) nextBtn.disabled = activeIdx >= getMaxIdx();
  }

  function goTo(index) {
    const max = getMaxIdx();
    activeIdx = Math.max(0, Math.min(index, max));
    scroll.scrollTo({ left: activeIdx * getSlideW(), behavior: 'smooth' });
    syncDots();
  }

  scroll.addEventListener('scroll', () => {
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => {
      const sw = getSlideW();
      if (!sw) return;
      const idx = Math.round(scroll.scrollLeft / sw);
      if (idx !== activeIdx) {
        activeIdx = Math.max(0, Math.min(idx, getMaxIdx()));
        syncDots();
      }
    }, 80);
  }, { passive: true });

  function resetAutoTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(activeIdx >= getMaxIdx() ? 0 : activeIdx + 1), 5000);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(activeIdx - 1); resetAutoTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(activeIdx + 1); resetAutoTimer(); });

  scroll.addEventListener('mouseenter', () => clearInterval(autoTimer));
  scroll.addEventListener('mouseleave', resetAutoTimer);

  let touchStartX = 0;
  scroll.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  scroll.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 50) { goTo(dx < 0 ? activeIdx + 1 : activeIdx - 1); resetAutoTimer(); }
  }, { passive: true });

  window.addEventListener('resize', () => { buildDots(); goTo(activeIdx); });

  slides.forEach(slide => {
    const card = slide.querySelector('.review-card');
    if (!card) return;
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('is-active');
      slides.forEach(s => s.querySelector('.review-card')?.classList.remove('is-active'));
      if (!wasActive) card.classList.add('is-active');
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  buildDots();
  goTo(0);
  resetAutoTimer();
})();

/* ── Highlight today's opening hours ────────────────────────── */
(function () {
  const today = new Date().getDay();
  document.querySelectorAll('.hours-table tr').forEach(row => {
    const days = (row.dataset.day || '').split(',').map(Number);
    if (days.includes(today)) row.classList.add('hours-today');
  });
})();
