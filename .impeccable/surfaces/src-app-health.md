---
version: 1
slug: "src-app-health"
primary_target: "src/app/health"
related_targets: ["src/app/profile","src/features/health","src/features/profile"]
---

# Personal area: Health and Profile / Settings

Scope: /health (overview), /health/reports, /health/reports/[id], /health/reminders, /health/insights/[id], /profile and /profile/[section], signed-out state. Mode: Operate (Health has Read moments in insights and reports).

Audience and job: Ananya keeps her own and her family's care in one place: what's next, what came back, what to remember. Settings are infrequent, quick edits.

Confirmed answers (2026-10-07): live journey state plus seeded history; reports show values beside the lab's printed range, no verdicts or colours; logout shows a signed-out screen with sign back in; insights are short general-information explainers linked to the user's own activity.

Constraints: no diagnostic claims, no normal/abnormal flags, no health scores; consumer, not clinical; reuse CareNow components; completed screens keep their design.

## Direction contract
THESIS: Health is a family care diary, not a dashboard: "who, what's next, what came back", in the order a person asks it. Refuses the vitals-tile grid, charts and scores of the clinical-dashboard default.
OWN-WORLD: the incumbent CareNow world: cool white ground, white bordered cards, teal primary, soft-blue info, Manrope, pill badges for status only, lucide line icons in tinted tiles.
STORY: the visitor sees whose health they are viewing, the next thing that will happen, today's reminders they can tick off, then reports, prescriptions and past activity; explainers sit last as calm reading.
FIRST VIEWPORT: h1 "Health" with the family member chips directly under it; a "Coming up" card pairing the next appointment with today's reminders (tick-off buttons); on desktop a right column carries reports ready to read. Primary action: tick a reminder or open the next appointment.
FORM: established-world extension (no concept roll; brief precise); code-led.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
