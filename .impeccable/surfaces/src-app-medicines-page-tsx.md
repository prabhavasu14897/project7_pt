---
version: 1
slug: "src-app-medicines-page-tsx"
primary_target: "src/app/medicines/page.tsx"
related_targets: ["src/features/medicines","src/app/medicines/[id]/page.tsx"]
---

# Medicine Listing + Medicine Details

Scope: `/medicines` (src/app/medicines/page.tsx) and `/medicines/[id]` (src/app/medicines/[id]/page.tsx), in src/features/medicines/*. Mode: Operate. This extends the established CareNow world, following desktop panels 5–6 and 9 and mobile panels 5–6 on the reference boards.

Job: find a medicine, compare pharmacies, and act according to its dispensing rule. OTC: choose quantity and add to cart. Prescription: upload, then a pharmacist verifies before anything reaches the cart. Restricted: no purchase path, only an explanation and a doctor alternative.

## Direction contract

THESIS: The dispensing rule decides the interface. Every card and detail page leads with the rule, and only the action that rule allows is offered. A pharmacy is a real choice with its own price and stock. This refuses the catalogue where every medicine has the same "Add" button.

OWN-WORLD: The inherited CareNow system: cool white ground, hairline cards, the medicines tone tile, teal for primary actions, amber only for prescription review, soft red only for restricted items. Manrope.

STORY: The listing filters by category chip, OTC/Prescription, and sort, all held in the URL. Each card shows rule, rating, price, the default pharmacy and stock in words. The detail page shows the summary, a purchase panel that changes per rule, the pharmacy choice, then description, uses and side effects.

FIRST VIEWPORT: Listing at 1440: h1 with a count, full-width search, the chip row, then the OTC/Prescription switch and sort on the row below, the upload entry, and a three-column card grid. Detail at 1440: breadcrumb, a summary card on the left (7/12) and a purchase panel plus pharmacy list on the right (5/12), with the info tabs under the summary. Phones read summary → purchase → pharmacies → info.

FORM: Established-world extension, structure 1 of 1. Seed: none. Authority: reference/new-work.md section 3, "Never run the script for a local extension or a precisely specified narrow request; shape those directly." Signature interaction: changing the pharmacy re-prices the page, and Add to cart with a quantity updates the header cart count and confirms inline.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
