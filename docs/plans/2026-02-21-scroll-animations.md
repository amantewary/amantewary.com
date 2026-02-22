# Scroll & Reveal Animations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the portfolio's scroll-triggered animations from basic CSS fade-in to Motion One-powered slide-ups with stagger and a scroll progress bar.

**Architecture:** Motion One is dynamically imported from jsDelivr CDN inside the existing main.js IIFE. If import fails, the CSS `.fade-in`/`.visible` fallback activates. `prefers-reduced-motion` is checked before any animation runs. All motion is GPU-composited (opacity + transform only).

**Tech Stack:** Motion One v11 (ESM, `https://cdn.jsdelivr.net/npm/motion@11/+esm`), vanilla JS, no build step.

---

## Files to Change

- `index.html` — add one `<div>` element after `<body>`
- `style.css` — add progress bar styles; update `.fade-in` to remove `transform` (Motion One sets it inline)
- `main.js` — replace lines 97–137 (IntersectionObserver block) with Motion One code

---

### Task 1: Add scroll progress bar element + CSS

**Files:**
- Modify: `index.html` — add element right after `<body>` tag (line 13)
- Modify: `style.css` — add progress bar block after the `:root` variables block (after line 19)

**Step 1: Add the HTML element**

In `index.html`, add immediately after `<body>` (before `<!-- Navigation -->`):

```html
  <div id="scroll-progress" aria-hidden="true"></div>
```

**Step 2: Add CSS for the progress bar**

In `style.css`, add a new block immediately after the `:root` closing brace (after line 19):

```css
/* ==============================================
   SCROLL PROGRESS BAR
   ============================================== */
#scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  width: 0%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  z-index: 9998; /* below CRT overlay at 9999 */
  pointer-events: none;
}
```

**Step 3: Update `.fade-in` in style.css**

Find the existing `.fade-in` block (around line 719) and replace it:

```css
/* ==============================================
   FADE-IN SCROLL ANIMATION
   ============================================== */
.fade-in {
  opacity: 0;
  /* transform is set inline by Motion One; only opacity needed for CSS fallback */
}

.fade-in.visible {
  opacity: 1;
  transform: none;
  transition: opacity 0.55s ease, transform 0.55s ease;
}
```

**Step 4: Verify visually**

Open `index.html` in a browser (file:// or local server). Confirm:
- No progress bar visible on page load
- Page content looks normal (no broken layout from the opacity:0 on `.fade-in` elements)
- Cards and timeline items are invisible initially (they'll be revealed by JS)

**Step 5: Commit**

```bash
git add index.html style.css
git commit -m "feat: add scroll progress bar HTML/CSS and update fade-in base styles"
```

---

### Task 2: Wire up Motion One in main.js

**Files:**
- Modify: `main.js` — replace the IntersectionObserver block (lines 97–137) with Motion One code

**Step 1: Identify the block to delete**

The block to replace is the entire `INTERSECTION OBSERVER — FADE IN ON SCROLL` section (lines 97–137 in the original file). It starts with the comment and ends with `}` closing the `if (fadeElements.length && ...` block including the `else` fallback.

**Step 2: Replace that block with the following code**

```js
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
          inView(el, function () {
            animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.5, easing: 'ease-out' });
          }, { margin: '-8% 0px 0px 0px' });
        });

        // --- Section headers ---
        document.querySelectorAll('.section-header').forEach(function (el) {
          inView(el, function () {
            animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: 0.4, easing: 'ease-out' });
          }, { margin: '-8% 0px 0px 0px' });
        });

        // --- Staggered skill tags ---
        // The whole grid triggers once, then all tags stagger in 40ms apart
        var skillsGrid = document.querySelector('.skills-grid');
        if (skillsGrid) {
          var tags = skillsGrid.querySelectorAll('.skill-tag');
          inView(skillsGrid, function () {
            animate(tags, { opacity: [0, 1], y: [12, 0] }, {
              duration: 0.3,
              easing: 'ease-out',
              delay: stagger(0.04)
            });
          }, { margin: '-5% 0px 0px 0px' });
        }

      })
      .catch(function () {
        // CDN failed — activate CSS fallback immediately
        document.querySelectorAll('.fade-in').forEach(function (el) {
          el.classList.add('visible');
        });
      });
  }
```

**Step 3: Verify in browser (normal flow)**

Open the page in a browser. Verify:
- Scrolling down: green progress bar grows at the top of the viewport
- Cards and timeline items slide up smoothly as they enter the screen
- Section headers (`$ about.sh`, `$ work --history`, etc.) slide in
- Skill tags stagger in one by one (watch closely — 40ms gap between each)
- No console errors

**Step 4: Verify reduced-motion fallback**

In Chrome DevTools → Rendering → enable "Emulate CSS media feature prefers-reduced-motion: reduce". Reload.
Expected: All content is immediately visible. No slide or fade animations. No progress bar animation (scroll width still updates but no motion for content).

**Step 5: Verify CDN failure fallback**

In DevTools → Network → Offline mode. Reload.
Expected: All content is visible (`.catch()` runs, adds `.visible` to all `.fade-in` elements). No blank or invisible sections.

**Step 6: Commit**

```bash
git add main.js
git commit -m "feat: replace IntersectionObserver with Motion One scroll animations and stagger"
```

---

### Task 3: Push to GitHub

**Step 1: Push**

```bash
git push
```

**Step 2: Verify on GitHub**

Open https://github.com/amantewary/amantewary.com — confirm both new commits appear on `main`.

**Step 3: (Optional) Vercel deploy**

If Vercel is connected to the repo, it will auto-deploy. Check the Vercel dashboard for a successful deployment, then verify the live site at https://amantewary.com.
