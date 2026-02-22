/* ==============================================
   TYPEWRITER ANIMATION
   ============================================== */

(function () {
  'use strict';

  const typewriterEl = document.getElementById('typewriter');
  const cursorEl = document.querySelector('.cursor');

  if (!typewriterEl) return;

  const text = "Hello, I'm Aman Tewary";
  let charIndex = 0;

  function typeWriter() {
    if (charIndex < text.length) {
      typewriterEl.textContent += text.charAt(charIndex);
      charIndex++;
      // Variable speed: slightly slower on spaces for realism
      const delay = text.charAt(charIndex) === ' ' ? 120 : 55 + Math.random() * 45;
      setTimeout(typeWriter, delay);
    }
    // Cursor keeps blinking after typing via CSS animation
  }

  // Small delay before starting so page load settles
  setTimeout(typeWriter, 600);


  /* ==============================================
     MOBILE NAV TOGGLE
     ============================================== */

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen.toString());
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }


  /* ==============================================
     SMOOTH SCROLL
     ============================================== */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Close mobile menu if open
      if (navLinks) {
        navLinks.classList.remove('open');
        navToggle && navToggle.setAttribute('aria-expanded', 'false');
      }

      // Account for sticky nav height
      const navEl = document.querySelector('.nav');
      const navHeight = navEl ? navEl.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });


  /* ==============================================
     MOTION ONE — SCROLL ANIMATIONS
     ============================================== */

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Respect user preference: show everything immediately
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('visible');
    });
  } else {
    import('https://cdn.jsdelivr.net/npm/motion@11/+esm')
      .then(function (m) {
        var animate = m.animate;
        var inView  = m.inView;
        var scroll  = m.scroll;
        var stagger = m.stagger;

        // --- Scroll progress bar ---
        var progressEl = document.getElementById('scroll-progress');
        if (progressEl) {
          scroll(function (progress) {
            progressEl.style.width = (progress * 100) + '%';
          });
        }

        // --- Individual card / timeline item reveals ---
        // Each element slides up 24px and fades in as it enters the viewport
        document.querySelectorAll('.card, .timeline-item').forEach(function (el) {
          var stop = inView(el, function () {
            animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.5, easing: 'ease-out' });
            stop();
          }, { margin: '-8% 0px 0px 0px' });
        });

        // --- Section headers ---
        document.querySelectorAll('.section-header').forEach(function (el) {
          var stop = inView(el, function () {
            animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: 0.4, easing: 'ease-out' });
            stop();
          }, { margin: '-8% 0px 0px 0px' });
        });

        // --- Staggered skill tags ---
        // The whole grid triggers once, then all tags stagger in 40ms apart
        var skillsGrid = document.querySelector('.skills-grid');
        if (skillsGrid) {
          var tags = skillsGrid.querySelectorAll('.skill-tag');
          var stopTags = inView(skillsGrid, function () {
            animate(tags, { opacity: [0, 1], y: [12, 0] }, {
              duration: 0.3,
              easing: 'ease-out',
              delay: stagger(0.04)
            });
            stopTags();
          }, { margin: '-5% 0px 0px 0px' });
        }

      })
      .catch(function () {
        // CDN failed or runtime error — reveal all page content
        // 1. Fade-in elements: add .visible to trigger the CSS fallback animation
        document.querySelectorAll('.fade-in').forEach(function (el) {
          el.style.opacity = '';
          el.classList.add('visible');
        });
        // 2. Other animated targets: clear any inline opacity Motion One set before failing
        document.querySelectorAll('.section-header, .skill-tag').forEach(function (el) {
          el.style.opacity = '';
        });
      });
  }


  /* ==============================================
     ACTIVE NAV LINK ON SCROLL
     ============================================== */

  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length && navAnchors.length) {
    const navEl = document.querySelector('.nav');

    function updateActiveNav() {
      const navHeight = navEl ? navEl.offsetHeight : 60;
      const scrollPos = window.scrollY + navHeight + 20;

      let current = '';
      sections.forEach(function (section) {
        if (section.offsetTop <= scrollPos) {
          current = section.id;
        }
      });

      navAnchors.forEach(function (anchor) {
        anchor.classList.remove('active');
        const href = anchor.getAttribute('href');
        if (href === '#' + current) {
          anchor.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav(); // run once on load
  }

})();
