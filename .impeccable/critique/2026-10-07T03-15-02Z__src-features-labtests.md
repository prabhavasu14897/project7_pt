---
target: Lab Tests screens
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:D:\\prototype\\project7\\src\\features\\labTests"
timestamp: 2026-10-07T03-15-02Z
slug: src-features-labtests
closed: true
---
# Critique: Lab Tests flow (/lab-tests, /lab-tests/[id])
Method: dual-agent (A: design review, B: detector + browser)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Live count, struck past slots, CTA swap; confirmation has no next-step status |
| 2 | Match real world | 3 | Plain language; per-test star ratings are odd |
| 3 | User control | 3 | Lab/slot/address re-asked on /book |
| 4 | Consistency | 2 | Listing "Book" opens detail; "Choose a lab" vs "Choose a provider"; day vs slot selected styles |
| 5 | Error prevention | 2 | Fasting tests bookable at 10 am today |
| 6 | Recognition | 3 | Confirmation drops prep instruction |
| 7 | Flexibility | 2 | No earliest-slot shortcut; chips overflow on mobile with no cue |
| 8 | Minimalist | 2 | ~7 rows per card; "Home collection" repeated |
| 9 | Error recovery | 3 | Today fully greyed after 10 am instead of auto-advancing |
| 10 | Help | 2 | No "what happens at the visit", no test-vs-package guidance |
| **Total** | | **25/40** | Acceptable |

## Specificity
Competent, mostly category-interchangeable. Keep: collection band, "Before your test" beside slots, per-lab prices. Missing: ETA-style earliest-slot signal; identical flask tiles.
Detector: CLI 0 findings (src/features/labTests, src/app/lab-tests). Browser: clean on list/detail at 1440/390; 1 `first-viewport-column-overflow` on /book/lab-test/thyroid (low confidence). 36px targets: 7 category chips, 13 card Book links.

## Priority issues
- [P1] Fasting tests bookable at unworkable times; no auto-advance when today is exhausted. harden
- [P1] Lab/slot/address chosen twice (detail then /book); /book should be review & pay. distill
- [P1] Flat confirmation for a home visit: add status timeline, repeat prep, night-before reminder, demote Cancel. onboard/delight
- [P2] Dense, identical listing cards; drop repeated Home collection, "from ₹449 at 2 labs", category icons, 44px targets. distill/layout
- [P2] Listing "Book" doesn't book; rename "View & book" or make card the link. clarify

## Persona red flags
Casey: chip overflow, booking ~1000px down, payment 5th card. Jordan: no visit explanation, labs undifferentiated. Riley: fasting today, lab switch silently clears slot, band above empty state. Ananya for Lakshmi/Aarav: patient chosen late, prep says "you", report sharing unexplained.

## Minor
/book header card empty; stretched "What's included"; "Test price" vs "To pay"; floating "10 tests".

## Questions
Earliest-slot as headline? Lead with concerns? Show the report moment at confirmation?
