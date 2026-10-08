# CareNow — Claude Project Instructions

## Read first
Before changing UI or architecture, read:
1. `DESIGN.md`
2. `config/product.config.ts`
3. `.impeccable/context.md`
4. `.impeccable/skills/design-system.md`
5. `.impeccable/skills/components.md`

## Goal
Build CareNow as a polished healthcare marketplace inspired by the convenience of food-delivery apps.

Core experience:
Discover → Select → Verify if required → Book/Add to cart → Pay → Track → Receive.

## Architecture rules
- Prefer reusable components.
- Keep product content, navigation, labels, theme tokens and demo data in `config/product.config.ts`.
- Do not hardcode content inside reusable components.
- Avoid `any` in TypeScript.
- Keep page-specific orchestration separate from reusable UI.
- Use typed data models.
- Keep medicine prescription state explicit.
- Keep provider/pharmacy data configurable.

## Visual rules
Follow `DESIGN.md` exactly unless the user explicitly requests a new direction.
Use Manrope.
Use the CareNow teal/blue healthcare palette from the config.
Use restrained shadows and rounded cards.
Maintain generous whitespace.

## Implementation sequence
1. Configure tokens/content.
2. Build app shell.
3. Build shared primitives.
4. Build Home.
5. Build Explore/listing pages.
6. Build details.
7. Build prescription upload/verification.
8. Build cart/checkout.
9. Build order tracking.
10. Build lab tests/doctors/home care.
11. Build profile/orders/health.
12. Add responsive refinements and states.

## Interaction rules
Every primary button must have a meaningful outcome in the prototype.
Use local mock state where backend functionality is not available.
Do not fake successful prescription approval immediately; demonstrate a pending verification state first.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
