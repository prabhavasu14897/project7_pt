---
target: CareNow provider services
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:D:\\prototype\\project7\\src\\features\\booking"
timestamp: 2026-10-07T02-57-44Z
slug: src-features-booking
---
Method: dual-agent (A: design review · B: detector and browser evidence)

# Critique: CareNow provider services (Doctors, Doctor Details, Home Care, Health Packages, booking, confirmation, Orders bookings)

## Design Health Score: 25/40 (Acceptable)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Booking summary omitted the chosen slot and mode |
| 2 | Match with the real world | 2 | "Track" for appointments; "Cash on delivery" for a nurse visit; "1 services" |
| 3 | User control and freedom | 3 | No reschedule; an unverified doctor is a dead end |
| 4 | Consistency and standards | 2 | Slot picker keyboard model differed from RadioCardGroup; home care has no detail page |
| 5 | Error prevention | 2 | No patient selection; no fasting note beside early slots; no Rx step for injections |
| 6 | Recognition rather than recall | 2 | Pay step hid the time; prep and MRP saving lost at booking |
| 7 | Flexibility and efficiency | 3 | URL filters, slot preselection, "Next available" hints |
| 8 | Aesthetic and minimalist design | 3 | Calm; identical icon tiles add noise |
| 9 | Error recovery | 3 | Payment failure copy is excellent |
| 10 | Help and documentation | 2 | Nothing on what happens next |

Detector: CLI [] (0 findings). In-browser: one first-viewport-column-overflow on /book/home-care/nurse-visit at desktop (judged a false positive: sticky summary). No overflow, 1 h1 per page, no console errors.
Browser: card title links 21px on /doctors and /health-packages; booking "Details" link 43.5px wide; SlotPicker role=radio buttons with no arrow keys (Enter/Space worked).

## Priority Issues
- [P1] No "who is this for" and no service-specific safety (fasting, injection Rx). Command: /impeccable harden
- [P1] Pay step hides what is being bought (time, mode, address). Command: /impeccable clarify
- [P2] No faces or evidence (initials, identical tiles, no reviews, no home-care detail). Command: /impeccable bolder
- [P2] Slot picker keyboard and status semantics (closed days by colour only). Command: /impeccable audit
- [P2] Delivery-flow copy leaking into services ("Track", "Cash on delivery", "Paid … COD", "1 services", "Verified doctors" with a pending one). Command: /impeccable clarify

## Persona red flags
- Casey: time picker deep below About on mobile; disabled "Pick a time" bar; chosen time out of view at Pay.
- Jordan: Home Care Book goes straight to payment; providers differ only by rating; no next steps on confirmation.
- Sam: radio buttons without arrow keys; disabled buttons without reasons; 21px title links.
