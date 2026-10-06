# CareNow Reference Image Workflow

The prototype has two visual reference boards supplied by the product designer.

## Reference A — Mobile journey
`reference-images/carenow-mobile-flow.png`

Use this reference primarily for:
- screen sequence
- mobile information hierarchy
- medicine/prescription flow
- checkout and order tracking
- lab/doctor/home-care patterns
- card proportions and content density

## Reference B — Desktop website
`reference-images/carenow-desktop-screens.png`

Use this reference primarily for:
- desktop layout
- header/navigation
- marketplace listing grids
- detail pages
- checkout layout
- provider/service discovery
- profile/settings composition

## Important
These are visual references, not pixel-perfect implementation specifications.

Preserve:
- overall product personality
- information hierarchy
- navigation model
- card language
- spacing rhythm
- marketplace journey

Improve where needed:
- readability
- responsive behavior
- accessibility
- component consistency
- typography
- interaction states

Do not blindly copy generated text, prices, provider names or medical claims from the images. Use `config/product.config.ts` as the content source of truth.

## Impeccable instruction
When evaluating or generating a screen, compare it against the relevant reference board first, then apply `DESIGN.md` and the existing project design system.

Do not introduce a new visual direction unless explicitly requested.
