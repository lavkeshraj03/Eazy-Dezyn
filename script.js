/* ==========================================================
   EAZY DEZYN — script.js
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===================== VIDEO MODAL =====================
  const modal        = document.getElementById('videoModal');
  const iframe       = document.getElementById('videoIframe');
  const closeBtn     = document.getElementById('closeModal');
  const VIDEO_URL    = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';

  const openVideoModal = () => {
    if (!modal) return;
    iframe.src = VIDEO_URL;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    if (!modal) return;
    iframe.src = '';
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // All video trigger buttons
  const videoTriggers = [
    document.getElementById('heroVideoCard'),
    document.getElementById('heroPlayBtn'),
    document.getElementById('heroWatchBtn'),
    document.getElementById('learnPlayBtn'),
    document.getElementById('currPlayBtn'),
    document.getElementById('finalWatchDemoBtn'),
  ];

  videoTriggers.forEach(btn => {
    if (btn) btn.addEventListener('click', openVideoModal);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeVideoModal);

  // Close on overlay click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeVideoModal();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoModal();
  });


  // ===================== CURRICULUM ACCORDION =====================
  const currAccordion = document.getElementById('currAccordion');
  if (currAccordion) {
    const cards = currAccordion.querySelectorAll('.acc-card');
    cards.forEach(card => {
      const btn = card.querySelector('.acc-btn');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');
        // Close all
        cards.forEach(c => {
          c.classList.remove('open');
          const b = c.querySelector('.acc-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        // Open clicked if it was closed
        if (!isOpen) {
          card.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }


  // ===================== FAQ ACCORDION =====================
  const faqList = document.getElementById('faqList');
  if (faqList) {
    const items = faqList.querySelectorAll('.faq-item');
    items.forEach(item => {
      const btn = item.querySelector('.faq-btn');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close all
        items.forEach(i => {
          i.classList.remove('open');
          const b = i.querySelector('.faq-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        // Open clicked if it was closed
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }


  // ===================== SMOOTH SCROLL =====================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerH = document.querySelector('.site-header')?.offsetHeight || 64;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // ===================== HEADER SHADOW ON SCROLL =====================
  const header = document.getElementById('mainHeader');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 2px 16px rgba(30, 43, 36, 0.07)';
      } else {
        header.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

});

/* --- Ghosted timeline: section pins, cards reveal one by one as you scroll (GSAP) --- */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  var section = document.querySelector('.ghosted-section');
  var wrap = document.querySelector('.ghosted-timeline-wrap');
  if (!section || !wrap) return;
  var rows = wrap.querySelectorAll('.timeline-row');
  var nodes = wrap.querySelectorAll('.timeline-node');
  var line = wrap.querySelector('.timeline-line');

  // Left column: title, lead and subtext ease in one after another when the section enters view
  var leftItems = section.querySelectorAll('.ghosted-title, .ghosted-lead, .ghosted-subtext');
  gsap.from(leftItems, {
    opacity: 0,
    x: -40,
    y: 24,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.18,
    scrollTrigger: { trigger: section, start: 'top 70%', once: true }
  });

  // Re-measure once fonts/images have loaded so the pin spacing is exact
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });

  ScrollTrigger.matchMedia({
    // Desktop: pin the section, first card visible, each scroll step reveals the next
    '(min-width: 901px)': function () {
      gsap.set(rows, { opacity: 0, y: 60 });
      gsap.set(nodes, { scale: 0 });
      gsap.set(line, { scaleY: 0, transformOrigin: 'top' });

      var tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=' + rows.length * 50 + '%',
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });

      rows.forEach(function (row, i) {
        tl.to(row, { opacity: 1, y: 0, duration: 1 }, i)
          .to(nodes[i], { scale: 1, duration: 0.5, ease: 'back.out(3)' }, i)
          .to(line, { scaleY: (i + 1) / rows.length, duration: 1, ease: 'none' }, i);
      });
      tl.to({}, { duration: 0.3 }); // short hold after the last card
    },

    // Mobile: no pinning, each card reveals as it scrolls into view
    '(max-width: 900px)': function () {
      rows.forEach(function (row) {
        gsap.from(row, {
          opacity: 0, y: 40, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 88%', once: true }
        });
      });
    }
  });
})();

/* --- "Why do you need it?" / CLOSE PROJECTS section: one scrubbed GSAP parallax timeline --- */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  var section = document.getElementById('mm-section');
  if (!section) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', function () {
    var tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });

    // parallax groups; the n200 group holds all 4 copies of the Rs 200 note so they move as one
    var groups = [
      { group: 'n200',     speed: 1.6,  rot: 20 },
      { group: 'n500',     speed: 0.5,  rot: -16 },
      { group: 'c1',       speed: 0.6,  isCoin: true },
      { group: 'c2',       speed: 1.7,  isCoin: true },
      { group: 'shouse',   speed: 0.35, rot: 10 },
      { group: 'h2-large', speed: 0.6,  rot: -12 },
      { group: 'h3-small', speed: 0.4,  rot: 8 },
      { group: 'h4-large', speed: 1.8,  rot: -14 }
    ];

    groups.forEach(function (item) {
      var els = section.querySelectorAll('[data-group="' + item.group + '"]');
      if (!els.length) return;
      if (item.isCoin) {
        // coins fake a 3D spin with scaleX keyframes
        tl.fromTo(els, { y: 120 * item.speed, force3D: true }, {
          y: -120 * item.speed, force3D: true, duration: 1, ease: 'none',
          keyframes: { scaleX: [1, 0.5, 1, 0.5, 1] }
        }, 0);
      } else {
        tl.fromTo(els,
          { y: 120 * item.speed, rotation: -item.rot / 2, force3D: true },
          { y: -120 * item.speed, rotation: item.rot / 2, force3D: true, duration: 1, ease: 'none' }, 0);
      }
    });
  });
})();
