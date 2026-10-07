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

/* --- Reviews: duplicate the cards once so the marquee loops seamlessly --- */
(function () {
  var grid = document.querySelector('.reviews-grid');
  if (!grid || grid.dataset.cloned) return;
  grid.dataset.cloned = '1';
  var originals = Array.prototype.slice.call(grid.children);
  originals.forEach(function (card) {
    var clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    grid.appendChild(clone);
  });
})();

/* --- Reviews: click a screenshot to open it in a lightbox gallery --- */
(function () {
  var grid = document.querySelector('.reviews-grid');
  if (!grid) return;
  var shots = Array.prototype.slice.call(grid.querySelectorAll('.rev-shot'));
  var total = shots.length / 2; // second half are the marquee clones
  if (!total) return;

  var items = shots.slice(0, total).map(function (fig) {
    var img = fig.querySelector('img');
    return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' };
  });

  shots.forEach(function (fig, i) {
    fig.dataset.index = i % total;
    if (i < total) {
      fig.tabIndex = 0;
      fig.setAttribute('role', 'button');
      fig.setAttribute('aria-label', 'Open review ' + (i + 1) + ' of ' + total);
    }
  });

  // build the lightbox once
  var lb = document.createElement('div');
  lb.className = 'rev-lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Review gallery');
  lb.hidden = true;
  lb.innerHTML =
    '<button type="button" class="rev-lb-close" aria-label="Close gallery">&times;</button>' +
    '<button type="button" class="rev-lb-nav rev-lb-prev" aria-label="Previous review">&#8249;</button>' +
    '<figure class="rev-lb-stage"><img class="rev-lb-img" alt=""></figure>' +
    '<button type="button" class="rev-lb-nav rev-lb-next" aria-label="Next review">&#8250;</button>' +
    '<div class="rev-lb-count"></div>' +
    '<div class="rev-lb-thumbs"></div>';
  document.body.appendChild(lb);

  var imgEl = lb.querySelector('.rev-lb-img');
  var countEl = lb.querySelector('.rev-lb-count');
  var thumbsEl = lb.querySelector('.rev-lb-thumbs');
  var closeBtn = lb.querySelector('.rev-lb-close');
  var current = 0;
  var lastFocus = null;

  var thumbs = items.map(function (it, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'rev-lb-thumb';
    b.setAttribute('aria-label', 'Show review ' + (i + 1));
    var t = document.createElement('img');
    t.src = it.src;
    t.alt = '';
    b.appendChild(t);
    b.addEventListener('click', function () { show(i); });
    thumbsEl.appendChild(b);
    return b;
  });

  function show(i) {
    current = (i + total) % total;
    imgEl.src = items[current].src;
    imgEl.alt = items[current].alt;
    countEl.textContent = (current + 1) + ' / ' + total;
    thumbs.forEach(function (b, k) { b.classList.toggle('is-active', k === current); });
    thumbs[current].scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.classList.add('rev-lb-open');
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    closeBtn.focus();
  }

  function close() {
    lb.classList.remove('is-open');
    document.body.classList.remove('rev-lb-open');
    setTimeout(function () { lb.hidden = true; }, 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  grid.addEventListener('click', function (e) {
    var fig = e.target.closest('.rev-shot');
    if (fig) open(parseInt(fig.dataset.index, 10) || 0);
  });
  grid.addEventListener('keydown', function (e) {
    var fig = e.target.closest && e.target.closest('.rev-shot');
    if (fig && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      open(parseInt(fig.dataset.index, 10) || 0);
    }
  });

  lb.querySelector('.rev-lb-prev').addEventListener('click', function () { show(current - 1); });
  lb.querySelector('.rev-lb-next').addEventListener('click', function () { show(current + 1); });
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('rev-lb-stage')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });

  // swipe left/right on touch screens
  var startX = null;
  lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
