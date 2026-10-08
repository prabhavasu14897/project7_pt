---
version: 1
slug: "src-features-welcome"
primary_target: "src/features/welcome"
related_targets: ["src/app/page.tsx"]
---

# Welcome / Splash

Scope: `/` (src/app/page.tsx, src/features/welcome). Mode: Persuade, at the scale of a splash: one promise, one action. Home moved to /home.

Confirmed answers (2026-10-07): splash replaces `/`, Home moves to /home; Get started → Home, Log in → /sign-in; desktop reuses the Home hero clinician photo; mobile uses a large logo mark with soft sparkles instead of the board's hand illustration; an honest safety line replaces the board's "Trusted by 5M+ customers".

Constraints: reference boards Splash/Welcome (desktop 1, mobile 1); no invented claims; existing tokens and Button inverse/inverseOutline on the deep-teal field only.

## Direction contract
THESIS: The front door says one thing, healthcare delivered, and opens one door. Refuses the feature-grid landing page and the stat-claim hero.
OWN-WORLD: the incumbent CareNow world: full-bleed deep-teal field (primary-deep), white Manrope 800 display, white inverse buttons, the heart-cross logo mark, the Home clinician photo plate.
STORY: the visitor recognises CareNow, reads the promise and the four services, sees the safety line, and taps Get started (or Log in).
FIRST VIEWPORT: desktop: full-viewport deep-teal field; left column inside the 1280 container: logo tile, "CareNow" display, tagline, services line, Get started (inverse, wide) and Log in (inverseOutline), safety line at the bottom; right ~50% the clinician photo, faded into the field on its left edge. Mobile: centred column, logo and wordmark, tagline, large logo mark in soft concentric rings with sparkles, then full-width Get started and "Already have an account? Log in" pinned to the bottom.
FORM: established-world extension (no concept roll; brief pinned to the reference boards); code-led. Motion: one staggered rise of the content on load, off under reduced motion.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
