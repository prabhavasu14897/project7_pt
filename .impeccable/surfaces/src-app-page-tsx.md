---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/features/home"]
---

# Home / Dashboard

Scope: `/` (src/app/page.tsx, src/features/home/*). Mode: Operate (signed-in consumer dashboard). Extension of the established CareNow world (DESIGN.md + reference boards); no concept roll, because the request is precisely specified and pinned to the reference boards.

Audience/job: a signed-in adult (self-first, family second) checking an order in progress and starting the next task in one tap. Prototype audience: stakeholder demo, so every control must lead somewhere.

## Direction contract

THESIS: Home is a personal care dashboard, not a catalogue. The user's live prescription order sits beside the hero, so "safety in progress" is the first proof. It refuses the marketing-banner-plus-icon-grid home.

OWN-WORLD: The inherited CareNow system. Cool white ground, white cards with hairline cool borders and a restrained card shadow, a deep-teal hero field with a clinician photo plate on its right edge, category-toned icon tiles, Manrope 800 for display, and amber only for prescription review.

STORY: The user sees where their order is, picks a service, repeats a past order, compares verified providers and leaves reassured by the trust strip.

FIRST VIEWPORT: Desktop 1440 has a 72px header, then a hero (8/12) next to an active-order card (4/12) at equal height of about 300px. The hero has a 32px/800 h1, subtitle, white primary CTA and a ghost "Upload prescription" link, with the photo filling the right ~42% edge to edge. The card has a greeting, order id, amber "Under review" badge, a 6-step progress bar and a Track order button. The five category tiles start above the fold. Mobile 390 has a compact header and search, a 184px hero, the active-order card, then the category row.

FORM: Established-world extension, structure 1 of 1 (reference-board hierarchy). Seed: none (concept-seed not run for a pinned, precisely specified surface). Signature interaction: "Add" on an OTC item increments the header cart count and flips to "Added". Prescription items never offer Add; they route to upload.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
