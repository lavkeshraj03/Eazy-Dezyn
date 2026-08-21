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
