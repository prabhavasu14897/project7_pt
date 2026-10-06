---
target: CareNow Home / Dashboard
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:D:\\prototype\\project7\\src\\app\\page.tsx"
target_fingerprint: "sha256:7ba7fcbb01143d5565664dd7b14532d2b998b442bcdee7db55eae8c3fd2ff6fe"
target_path: "D:\\prototype\\project7\\src\\app\\page.tsx"
timestamp: 2026-10-06T14-29-42Z
slug: src-app-page-tsx
---
Method: dual-agent (A: design review · B: detector and browser evidence)

# Critique: CareNow Home / Dashboard (src/app/page.tsx)

## Design Health Score: 24/40 (Acceptable)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | No time since upload; "Step 2 of 6" has no stage name |
| 2 | Match with the real world | 3 | "OTC" is jargon; the pharmacist note reads like a job title |
| 3 | User control and freedom | 2 | Tapping "Added" silently removes the item from the cart |
| 4 | Consistency and standards | 2 | Quick actions repeat the categories; sections ordered differently by viewport; "% off" inconsistent across cards |
| 5 | Error prevention | 3 | Amoxicillin card asks for a prescription already under review |
| 6 | Recognition rather than recall | 3 | Providers show initials only |
| 7 | Flexibility and efficiency | 2 | "Order Again" opens a list instead of reordering |
| 8 | Aesthetic and minimalist design | 2 | 7 sections; categories and quick actions overlap; mobile slogan hero |
| 9 | Error recovery | 2 | No path shown for a rejected prescription |
| 10 | Help and documentation | 2 | No contact-pharmacist or support link on the order card |

## Design Specificity
About 60% generic. Specific to CareNow: the order card, prescription routing, India-specific details. Generic: a marketing hero with a stock photo (hard seam against the teal) and a standard grid below. The contract said Home refuses the banner-plus-grid layout; the build does not.
Automated scan: code scan of Home files returned [] (0 findings). The detector run in the live page found:
- low-contrast search placeholder, 2.7:1, desktop and mobile;
- flat-type-hierarchy on mobile, 20/17/15px headings (1.18 step).
Browser: no overflow; one h1; image alt present; several card buttons visually 36px tall (the shared Button expands the hit area to 44px); city picker 40px tall.

## Priority Issues
- [P1] The Amoxicillin "Upload prescription" card contradicts the active order. Fix: cross-check the active order in popularAction/homeData. Command: /impeccable harden
- [P1] The marketing hero outranks the live order, especially on mobile; upload is hidden on mobile; categories are cut off behind the nav. Command: /impeccable layout
- [P2] Quick actions duplicate the categories. Replace them with personal shortcuts (one-tap reorder, repeat test, family) or remove them. Command: /impeccable distill
- [P2] The order card lacks time since upload, a stage name, contact and a rejection path. Command: /impeccable clarify
- [P2] Accessibility: placeholder and MRP contrast; focus order broken by the CSS reorder; buttons named only "Book"/"View"; silent cart removal; flat mobile type scale. Command: /impeccable audit

## Persona Red Flags
- Casey (mobile): slogan-first viewport; no upload button on mobile; silent removal on "Added"; wrapped quick-action labels.
- Jordan (first-timer): "Lab Tests" vs "Book a Lab Test"; OTC; unnamed steps; "did my upload fail?"; provider "See all" opens Explore.
- Sam (screen reader/keyboard): tab order jumps; repeated "Book" names; low contrast.

## Minor Observations
- Provider action buttons zig-zag on desktop; mobile cards without a price show a lone "View" row.
- Category labels wrap on mobile, so baselines don't line up.
- The greeting is fixed in config.
- The trust strip repeats what the order card shows.
- The demo-data notice is the last thing a stakeholder reads.
- No family context anywhere.

## Questions to Consider
- Why is anything more important than the order under review?
- Should "who is this for" be part of the dashboard?
- What does Home look like when the prescription is rejected?
