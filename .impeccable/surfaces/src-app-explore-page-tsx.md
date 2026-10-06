---
version: 1
slug: "src-app-explore-page-tsx"
primary_target: "src/app/explore/page.tsx"
related_targets: ["src/features/explore"]
---

# Explore / Categories

Scope: `/explore` (src/app/explore/page.tsx, src/features/explore/*). Mode: Operate (search and browse). An extension of the established CareNow world (DESIGN.md + reference boards: desktop panel 4 "Search / Explore", mobile panel 4 "Explore / Categories", desktop panel 5 "Popular Categories"). No concept roll: the request is precisely specified and pinned to the boards.

Audience/job: a signed-in adult finding a medicine, test, doctor, home-care service or package, or a nearby provider, in as few taps as possible. Confirmed decisions: categories filter in place on Explore (`?category=`), and category URLs (/medicines etc.) redirect here; the only filter is "Verified only".

## Direction contract

THESIS: Explore is one URL-driven listing. Search, category, concern and the verified filter all live in the address, so every tap has a real outcome and every state can be shared. It refuses the dead-end hub of category icons that lead to empty pages.

OWN-WORLD: The inherited CareNow system: cool white ground, hairline-bordered white cards with restrained shadow, category-toned icon tiles, teal chips for the active category, Manrope. Amber appears only for prescription review.

STORY: The visitor searches or picks a category, narrows by a health concern or "Verified only", sees honest prescription rules on every medicine, and acts (Add, Book, Upload prescription, Track order, View provider).

FIRST VIEWPORT: Desktop 1440: h1 "Explore", a full-width large search field, then one row of category chips (All + 5) with "Verified only" on the right; below that, "All healthcare services" as three-across category rows. Mobile 390: compact header without the duplicate search, h1, search, a horizontally scrolling chip row, the verified toggle, then the service rows stacked as in mobile panel 4.

FORM: Established-world extension, structure 1 of 1. Seed: none. Authority: reference/new-work.md section 3, "Never run the script for a local extension or a precisely specified narrow request; shape those directly." The request names every section and pins the reference boards. Signature interaction: chips and concern tiles rewrite the URL in place (router.replace, no scroll jump), and category chips show live result counts while a search or concern is active.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
