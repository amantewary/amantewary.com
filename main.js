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
     INTERSECTION OBSERVER — FADE IN ON SCROLL
     ============================================== */

  const fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          // Stagger sibling cards
          const parent = entry.target.parentElement;
          const siblings = parent ? parent.querySelectorAll('.fade-in') : [];
          let delay = 0;

          siblings.forEach(function (sibling, idx) {
            if (sibling === entry.target) {
              delay = idx * 80;
            }
          });

          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: make all visible immediately if IntersectionObserver unavailable
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
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
