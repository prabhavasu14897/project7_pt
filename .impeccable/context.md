# Impeccable Context — CareNow

## Product identity
CareNow is a healthcare marketplace. The visual metaphor is **food-delivery convenience with healthcare safety**.

Do not turn it into:
- a hospital ERP,
- a doctor-only dashboard,
- a generic pharmacy catalogue,
- a clinical records system.

## Reference interpretation
Two reference collages are provided:
- Mobile flow: use for journey sequencing and mobile information hierarchy.
- Website flow: use for desktop composition and complete feature coverage.

The references contain generated placeholder data. Replace/reuse content through the product config rather than copying scattered strings.

## Design personality
Keywords:
- trustworthy
- calm
- accessible
- modern
- consumer
- efficient
- reassuring

Avoid:
- sterile hospital aesthetics
- excessive blue
- neon
- overly futuristic UI
- dense admin tables
- excessive rounded-pill UI

## Core user journeys

### Medicine — OTC
Home → Medicines → Search/filter → Product detail → Add to cart → Checkout → Payment → Tracking → Delivered

### Medicine — Prescription
Home → Medicines → Prescription medicine → Product detail → Upload prescription → Verification pending → Approved → Add to cart → Checkout → Payment → Tracking → Delivered

### Lab test
Home → Lab Tests → Test listing → Test detail → Choose date/time → Address → Payment → Technician tracking → Completed

### Doctor
Home → Doctors → Specialty/search → Doctor profile → Select consultation type → Time slot → Payment → Appointment confirmation

### Home care
Home → Home Care → Service listing → Service detail → Choose date/time → Address → Payment → Booking confirmation

## Global UI
Desktop:
- top header
- centered max-width content
- search prominently available
- profile/location/cart actions

Mobile:
- compact header
- search
- content cards
- bottom navigation

## Shared visual primitives
All pages should use:
- Button
- SearchBar
- Input
- Tabs
- Badge
- Card
- ProductCard
- ServiceCard
- ProviderCard
- Rating
- Price
- StatusTimeline
- UploadBox
- Modal/Drawer
- Header
- BottomNav

## Prescription UX
Never imply that a prescription medicine can be fulfilled before required verification.
Show the current status prominently:
Uploaded → Under review → Approved / Needs clarification → Preparing → Out for delivery → Delivered.

## Content architecture
All navigation, categories, theme tokens, labels and demo data belong in:
`config/product.config.ts`

If a screen needs new reusable static content, add it to config instead of hardcoding it in a component.
