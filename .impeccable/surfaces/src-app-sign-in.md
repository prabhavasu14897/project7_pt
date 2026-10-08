---
version: 1
slug: "src-app-sign-in"
primary_target: "src/app/sign-in"
related_targets: ["src/features/auth"]
---

# Sign In

Scope: /sign-in (sign in, forgot-password step inside the card, success hand-off). Mode: Operate.

Audience and job: a returning CareNow user (or a stakeholder in a demo) gets back to their care in seconds; a forgotten password never dead-ends.

Confirmed answers (2026-10-07): forgot password runs as a step inside the sign-in card, Create account goes to /sign-up (placeholder until built); one demo account (the profile's email or mobile + demo password) signs in, anything else gets a specific reason; focused page as in the reference Login board: logo only, no marketplace header, search or bottom nav.

Constraints: one responsive implementation; existing tokens, Manrope, Button/Input/Card/Notice; no new palette; no invented claims; no real auth.

## Direction contract
THESIS: Signing in is a pause on the way back to care, not a gate: the form is the page's single job, the brand panel only reminds why CareNow is safe. Refuses the full-bleed stock-photo login and the marketing-heavy split screen.
OWN-WORLD: the incumbent CareNow world: cool white ground, one white bordered card, teal primary actions, deep-teal brand band as on Home, Manrope, lucide line icons, soft notices for state.
STORY: the visitor recognises CareNow, sees the reasons it is safe (verified providers, pharmacist checks, secure payment, tracking), signs in or recovers a password, and lands on Home.
FIRST VIEWPORT: desktop: two columns inside the 1280 container, left deep-teal panel (logo, tagline as h2, four trust lines, faint heart-cross mark), right a 440px card with h1 "Welcome back", identifier, password with show/hide, forgot link, full-width Sign in, or-divider, Google, create-account line, privacy line. Mobile: logo, then the same card full width at 16px gutters; the panel reduces to nothing but the logo and tagline.
FORM: established-world extension (no concept roll; brief precise); code-led.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
