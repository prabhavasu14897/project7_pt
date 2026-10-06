# CareNow — Claude Code Addendum

This is an additive instruction set for an existing Claude/Claude Code project.

Do NOT reinstall, replace, or recreate Impeccable or Claude configuration.

Before implementing CareNow:
1. Read the project's existing CLAUDE.md and preserve its existing rules.
2. Read `DESIGN.md`.
3. Read `REFERENCE_IMAGES.md`.
4. Read `.impeccable/context.md`.
5. Read `.impeccable/skills/*` relevant to the current screen.
6. Read `config/product.config.ts`.

If the existing project already has a design-token or component system, extend it rather than creating a second system.

## Reference image priority
Use:
- mobile reference for mobile journey and density
- desktop reference for desktop composition

Do not treat the generated reference as authoritative for medical/legal requirements. Healthcare safety rules in the CareNow context take priority.

## Implementation rule
Build shared components before duplicating page UI.

Common visual components:
Header, SearchBar, Button, Input, Tabs, Badge, Card, CategoryCard, ProductCard, ProviderCard, Rating, UploadBox, StatusTimeline, PriceBreakdown, EmptyState, ErrorState, BottomNav.

Common content and theme belong in `config/product.config.ts`.

## Screen-by-screen workflow
For each screen:
1. Identify its matching reference area.
2. Identify reusable components.
3. Pull content from config/mock data.
4. Implement desktop and mobile behavior.
5. Add meaningful interaction states.
6. Compare visually against the reference.
7. Fix spacing, typography, hierarchy and responsive behavior.
8. Only then move to the next screen.

## Do not
- overwrite existing project conventions without need
- duplicate global components
- hardcode repeated CareNow content
- create separate colors for individual screens
- create a separate header for each page
- make prescription medicines directly purchasable before verification
