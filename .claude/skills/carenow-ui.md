# CareNow UI Skill

Use this skill whenever implementing or refining CareNow UI.

## Source of truth
- `DESIGN.md` = design principles
- `config/product.config.ts` = content/theme/navigation/demo data
- `.impeccable/context.md` = product context
- `.impeccable/skills/*` = focused design rules

## Before coding
Inspect existing components and tokens.
Reuse them.
Do not introduce duplicate Button/Card/SearchBar implementations.

## Before creating a new component
Ask:
1. Is this reusable across at least two screens?
2. Can an existing component support it with a variant?
3. Does it contain business logic that should stay outside the UI?

## Static content
Put product copy, categories, navigation and mock marketplace data in config/data files.
Never scatter hardcoded CareNow content across JSX/TSX.

## Visual QA
Check:
- desktop
- tablet
- mobile
- loading
- empty
- error
- success
- prescription pending
- prescription approved
- prescription clarification

## Acceptance
The result should feel like one coherent product, not a collection of generated pages.
