---
target: CareNow Home / Dashboard
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:D:\\prototype\\project7\\src\\app\\page.tsx"
target_fingerprint: "sha256:7ba7fcbb01143d5565664dd7b14532d2b998b442bcdee7db55eae8c3fd2ff6fe"
target_path: "D:\\prototype\\project7\\src\\app\\page.tsx"
timestamp: 2026-10-06T14-53-43Z
slug: src-app-page-tsx
---
Method: dual-agent (A: design review · B: detector and browser evidence)

# Critique: CareNow Home / Dashboard (src/app/page.tsx), run 2

## Design Health Score: 23/40 (Acceptable)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | No submitted time; steps unnamed |
| 2 | Match with the real world | 3 | Static "Good morning"; OTC jargon; medicines under "services" |
| 3 | User control and freedom | 2 | "Added" silently removes; Order Again isn't a reorder |
| 4 | Consistency and standards | 2 | Two Track order buttons; quick actions duplicate categories; provider button zig-zag |
| 5 | Error prevention | 3 | Prescription items guarded; in-order item routes to tracking |
| 6 | Recognition rather than recall | 3 | Unlabelled bar segments; "+1 more" hides an item |
| 7 | Flexibility and efficiency | 2 | No one-tap reorder; no family switching |
| 8 | Aesthetic and minimalist design | 2 | Five browse sections under one personal card; 3,090px mobile page |
| 9 | Error recovery | 2 | No rejected or needs-clarification design on Home |
| 10 | Help and documentation | 1 | No contact-pharmacist or support link |

## Design Specificity
Only the top ~400px (order-first block, upload strip, in-order Amoxicillin card) is CareNow's own; the rest is a generic marketplace template. The desktop teal panel is the loudest block and carries a generic slogan.
Automated scan: CLI [] and the in-page detector found nothing at either viewport (last run's placeholder contrast and flat mobile type are fixed). Browser:
- no overflow; heading outline correct;
- card title links are 21px tall with no enlarged hit area;
- "Book" is repeated 4-6 times and "View" twice;
- desktop focus zig-zags in the Popular grid;
- mobile bottom nav comes last in focus order;
- 36px buttons and chips have 44px hit areas (pass).
Discounted: the claim that the cart badge doesn't update (the code renders the count; the reviewer didn't click Add).

## Priority Issues
- [P1] The desktop teal panel outshouts the order (slogan, duplicate Explore button, three competing primary buttons). Command: /impeccable quieter
- [P1] The order card under-reassures: no submitted time, unnamed steps, "+1 more", no contact, no clarification state. Command: /impeccable clarify
- [P2] Redundant information architecture: quick actions duplicate categories; Order Again isn't a reorder; Track order appears twice. Command: /impeccable distill
- [P2] Impersonal catalogue below the fold; no reasons or family; provider grid misaligned; long scroll. Command: /impeccable shape
- [P2] Accessibility and state: repeated button names; Added toggle has no pressed state or announcement; 21px title links; desktop focus zig-zag; extra tab stop on the provider panel (Tabs.tsx:140); static greeting. Command: /impeccable audit

## Persona Red Flags
- Casey: 3,090px page; nine near-identical tiles; two Track order buttons; silent removal.
- Jordan: OTC; unnamed steps; Categories vs Quick actions; both See all links go to the same page; duplicate Explore; no help.
- Sam: repeated "Book" names; no pressed state; extra tab stop; bottom nav last; "+1 more".

## Minor Observations
- Desktop Track order sits far from the status it acts on.
- In-order Amoxicillin still shows "29% off".
- Uniform section gaps don't separate "mine" from "browse".
- Identical initials avatars across provider types.
- No unread state on the bell.
- Mobile category labels wrap.

## Questions to Consider
- Why is a slogan the most dominant element on desktop?
- Is the photo-hero fallback the right no-order dashboard?
- Where does Ananya's family live on Home?
