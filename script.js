/**
 * EAZY DEZYN - INTERACTIVE SCRIPTS
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. FAQ Accordion Interaction
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other accordion items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 1b. Curriculum Accordion Interaction
  const currModules = document.querySelectorAll('.curr-module-item');
  currModules.forEach((item) => {
    const headerBtn = item.querySelector('.curr-module-header');
    if (!headerBtn) return;

    headerBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close other modules
      currModules.forEach((other) => {
        if (other !== item) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.curr-module-header');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          const otherChevron = other.querySelector('.curr-chevron svg');
          if (otherChevron) otherChevron.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
        }
      });

      if (isActive) {
        item.classList.remove('active');
        headerBtn.setAttribute('aria-expanded', 'false');
        const chevron = item.querySelector('.curr-chevron svg');
        if (chevron) chevron.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
      } else {
        item.classList.add('active');
        headerBtn.setAttribute('aria-expanded', 'true');
        const chevron = item.querySelector('.curr-chevron svg');
        if (chevron) chevron.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
      }
    });
  });

  // 2. Sticky Bottom CTA Bar Visibility on Scroll
  const stickyCtaBar = document.getElementById('stickyCtaBar');
  const heroSection = document.getElementById('top');
  const pricingSection = document.getElementById('pricing');

  const handleStickyBarVisibility = () => {
    if (!stickyCtaBar || !heroSection) return;

    const heroBottom = heroSection.getBoundingClientRect().bottom;
    const pricingRect = pricingSection ? pricingSection.getBoundingClientRect() : null;

    // Show sticky bar after scrolling past hero section
    const pastHero = heroBottom < 0;
    // Optionally hide when inside pricing section to avoid redundancy
    const inPricing = pricingRect && pricingRect.top < window.innerHeight && pricingRect.bottom > 0;

    if (pastHero && !inPricing) {
      stickyCtaBar.classList.add('visible');
    } else {
      stickyCtaBar.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleStickyBarVisibility, { passive: true });
  handleStickyBarVisibility();

  // 3. Hero & Curriculum Video Card click jumps to Demo Section
  const openDemoBtn = document.getElementById('openDemoBtn');
  const heroVideoCard = document.getElementById('heroVideoCard');
  const currVideoCard = document.getElementById('currVideoCard');
  const currPlayBtn = document.getElementById('currPlayBtn');

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (openDemoBtn) openDemoBtn.addEventListener('click', scrollToDemo);
  if (heroVideoCard) heroVideoCard.addEventListener('click', scrollToDemo);
  if (currVideoCard) currVideoCard.addEventListener('click', scrollToDemo);
  if (currPlayBtn) currPlayBtn.addEventListener('click', scrollToDemo);

  // 4. Subtle 3D tilt effect on hover for PDF preview card
  const pdfCard = document.querySelector('.pdf-card');
  if (pdfCard && window.matchMedia('(hover: hover)').matches) {
    const container = pdfCard.parentElement;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / rect.height) * 12;
      const rotateY = (x / rect.width) * 12;

      pdfCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    container.addEventListener('mouseleave', () => {
      pdfCard.style.transform = 'rotate(-1.5deg)';
    });
  }

  // 5. Scroll Trigger & Interactive 3D Parallax with Paper Buster Explosion
  const whyNeedSection = document.getElementById('whyNeedIt');
  const floatItems = document.querySelectorAll('#whyNeedIt .float-item');
  const canvas = document.getElementById('paperBusterCanvas');
  let confettiActive = false;

  // Multi-Cannon Paper Buster Animation
  function launchPaperBuster() {
    if (!canvas || !whyNeedSection) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = whyNeedSection.offsetWidth;
    let height = canvas.height = whyNeedSection.offsetHeight;

    const particles = [];
    const colors = ['#45B28D', '#A7F3D0', '#FCD34D', '#F59E0B', '#FFFFFF', '#6EE7B7', '#FF7A59'];
    const totalCount = 85;

    for (let i = 0; i < totalCount; i++) {
      // 3 Origin Points (Left, Center, Right)
      const originX = (i % 3 === 0) ? width * 0.18 : (i % 3 === 1 ? width * 0.5 : width * 0.82);
      const originY = height * 0.55;

      const angle = (originX < width * 0.35)
        ? (-Math.PI / 2 + (Math.random() * 0.9 - 0.1))
        : (originX > width * 0.65)
          ? (-Math.PI / 2 - (Math.random() * 0.9 - 0.1))
          : (-Math.PI / 2 + (Math.random() * 1.4 - 0.7));

      const speed = Math.random() * 16 + 9;

      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: Math.random() * 11 + 6,
        h: Math.random() * 16 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotX: Math.random() * 360,
        rotY: Math.random() * 360,
        rotZ: Math.random() * 360,
        rotSpeedX: (Math.random() - 0.5) * 14,
        rotSpeedY: (Math.random() - 0.5) * 16,
        rotSpeedZ: (Math.random() - 0.5) * 10,
        opacity: 1,
        gravity: 0.28,
        drag: 0.968,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.04,
        isRibbon: Math.random() > 0.65
      });
    }

    let animId;
    const startTime = performance.now();

    function draw(now) {
      ctx.clearRect(0, 0, width, height);
      let active = 0;

      particles.forEach((p) => {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 1.4;
        p.y += p.vy;

        p.rotX += p.rotSpeedX;
        p.rotY += p.rotSpeedY;
        p.rotZ += p.rotSpeedZ;

        if (p.y > height * 0.88 || now - startTime > 2400) {
          p.opacity -= 0.022;
        }

        if (p.opacity > 0 && p.y < height + 40) {
          active++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotZ * Math.PI) / 180);
          ctx.scale(Math.cos((p.rotX * Math.PI) / 180), Math.sin((p.rotY * Math.PI) / 180));
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;

          if (p.isRibbon) {
            ctx.beginPath();
            ctx.roundRect(-p.w / 2, -p.h * 1.4, p.w, p.h * 2.8, 3);
            ctx.fill();
          } else {
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          }
          ctx.restore();
        }
      });

      if (active > 0 && now - startTime < 3800) {
        animId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
        cancelAnimationFrame(animId);
      }
    }

    animId = requestAnimationFrame(draw);
  }

  if (whyNeedSection) {
    // Trigger when user approaches / focuses on the section
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          whyNeedSection.classList.add('in-view');
          if (!confettiActive) {
            confettiActive = true;
            launchPaperBuster();
          }
        } else {
          whyNeedSection.classList.remove('in-view');
          confettiActive = false;
        }
      });
    }, {
      threshold: 0.25,
      rootMargin: '40px 0px -40px 0px'
    });

    observer.observe(whyNeedSection);

    // Dynamic 3D Mouse Parallax on Desktop
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      whyNeedSection.addEventListener('mousemove', (e) => {
        const rect = whyNeedSection.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width - 0.5; // Range -0.5 to 0.5
        const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

        floatItems.forEach((item) => {
          const depth = parseFloat(item.getAttribute('data-depth') || '0.6');
          const moveX = mouseX * 32 * depth;
          const moveY = mouseY * 32 * depth;
          item.style.setProperty('--parallax-x', `${moveX}px`);
          item.style.setProperty('--parallax-y', `${moveY}px`);
        });
      });

      whyNeedSection.addEventListener('mouseleave', () => {
        floatItems.forEach((item) => {
          item.style.setProperty('--parallax-x', '0px');
          item.style.setProperty('--parallax-y', '0px');
        });
      });
    }
  }
});

