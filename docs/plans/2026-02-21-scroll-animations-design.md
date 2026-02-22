# Design: Scroll & Reveal Animations with Motion One

**Date:** 2026-02-21
**Status:** Approved

---

## Goal

Upgrade the portfolio site's scroll-triggered animations from a basic CSS fade-in to a polished, professional Motion One implementation. Target aesthetic: subtle, precise — similar to Linear or Stripe.

---

## Architecture

- **Library:** [Motion One](https://motion.dev) loaded via ESM CDN import inside `main.js`
- **No build step required** — existing vanilla JS + static file setup unchanged
- **Fallback:** Dynamic `import()` with `.catch()` — if CDN fails, existing CSS `.fade-in` / `.visible` class approach takes over
- **Reduced motion:** If `prefers-reduced-motion: reduce` matches, JS animation calls are skipped; CSS opacity-only transitions handle it

---

## Components & Animations

### 1. Scroll Progress Bar
- 2px fixed bar at top of viewport, accent color
- Grows from 0% → 100% width as user scrolls the page
- Driven by Motion One's `scroll()` binding on `window`

### 2. Card / Timeline Item Reveal
- Targets: `.card`, `.timeline-item`
- Animation: `{ opacity: [0, 1], y: [24, 0] }` — 24px upward slide + fade
- Duration: 0.5s, `easeOut` easing
- Trigger: `inView()` at 8% threshold, `once: true`

### 3. Staggered Sibling Cards
- Applies to: edu grid, skills grid, cert grid (groups of sibling cards)
- Uses Motion One's `stagger(0.08)` helper (80ms between each card)
- Replaces the current manual `setTimeout` stagger logic

### 4. Section Header Draw-In
- Targets: `h2.section-header`
- A `::after` pseudo-element underline animates `scaleX` from 0 → 1 on scroll entry
- Reinforces precision aesthetic without being distracting

---

## Error Handling

- CDN failure → silent catch → CSS fallback activates
- `IntersectionObserver` not available → CSS fallback (already handled)
- `prefers-reduced-motion` → skip Motion One calls, CSS handles opacity only
- All `inView()` calls use `once: true` — elements don't re-animate on scroll-back

---

## Files Changed

- `main.js` — replace IntersectionObserver block with Motion One `inView()` + `animate()` + `scroll()` calls; dynamic import for Motion One
- `style.css` — add scroll progress bar element styles; add `h2.section-header::after` underline styles; update `.fade-in` initial state to use `transform: translateY(24px)` as starting state

---

## Out of Scope

- Dark/light theme toggle
- Interactive terminal
- Custom cursor effects
- Any new sections or content changes
