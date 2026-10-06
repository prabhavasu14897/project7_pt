# CareNow — Design System

## Product
**CareNow**
Healthcare, delivered to your doorstep.

CareNow is a healthcare marketplace with a familiar delivery-app experience:
**Discover → Select → Verify (when required) → Book/Cart → Pay → Track → Receive**

The prototype should feel like a polished consumer product, not a hospital ERP.

## Reference images
Use the two supplied CareNow reference collages as visual direction:
1. Mobile journey collage — complete patient/order flow.
2. Website desktop collage — complete responsive web journey.

Treat the references as visual direction, not as pixel-perfect source material. Preserve the information architecture, hierarchy, spacing rhythm, component language, and interaction patterns while improving consistency and readability.

## Design principles
1. Consumer-first: simple like a food-delivery marketplace.
2. Healthcare-safe: prescription requirements are explicit.
3. Trust-first: provider, verification, delivery and payment states are visible.
4. Progressive disclosure: show only the information needed for the current step.
5. Reusable: use shared components instead of page-specific markup.
6. Responsive: desktop-first composition must translate naturally to tablet/mobile.
7. Calm visual language: avoid overly clinical or alarming UI except for true warnings.
8. Real product feel: loading, empty, error, pending, verified, cancelled and completed states should be designed.

## Visual direction
- Style: premium healthcare consumer marketplace.
- Primary surface: very light cool white.
- Brand accent: teal.
- Secondary accent: soft blue.
- Success: green.
- Warning: amber.
- Critical: red, used sparingly.
- Text: deep blue-gray.
- Borders: soft cool gray.
- Cards: white with subtle borders and restrained shadows.
- Radius: 12–18px for cards, 10–14px for controls, pill only for tags/statuses.
- Typography: Manrope preferred.
- Body density: comfortable; avoid dashboard-like information overload.

## Layout
- Max content width: 1280px.
- Desktop page gutters: 32–64px.
- Tablet gutters: 24px.
- Mobile gutters: 16px.
- Base spacing unit: 4px.
- Main content spacing: 24–32px.
- Section spacing: 40–56px.
- Desktop header: compact and persistent.
- Mobile: bottom navigation for primary destinations.

## Information architecture
Primary navigation:
- Home
- Explore
- Orders
- Health
- Profile

Marketplace categories:
- Medicines
- Lab Tests
- Doctors
- Home Care
- Health Packages

## Critical medicine workflow
Medicine eligibility is not hardcoded as a generic rule. The pharmacy/provider determines applicable requirements.

### OTC / non-prescription
Browse → Details → Add to cart → Checkout → Payment → Delivery tracking

### Prescription medicine
Browse → Details → Upload prescription → Pharmacy verification → Approved → Cart → Checkout → Payment → Delivery tracking

### Restricted / controlled
Do not implement purchasing in the MVP. Show an appropriate unavailable/special-process state instead.

## Required states
Every important workflow should account for:
- Default
- Loading
- Empty
- Error
- Disabled
- Pending verification
- Approved
- Rejected / needs clarification
- Processing
- Out for delivery
- Completed
- Cancelled

## Accessibility
- Minimum touch target: 44×44px.
- Visible focus states.
- Never use color alone for status.
- Form fields need labels.
- Error messages should explain how to recover.
- Maintain readable contrast.
- Avoid excessive motion.
- Respect prefers-reduced-motion.

## Content rules
Use realistic static demo content from `config/product.config.ts`.
Do not scatter CareNow names, service names, prices, doctor names, pharmacy names, labels, or navigation items throughout components.

## Component rules
Build shared components first:
Button, IconButton, Input, SearchBar, Select, Tabs, Badge, Card, Avatar, Rating, ServiceCard, ProductCard, ProviderCard, StatusTimeline, PriceBreakdown, UploadBox, EmptyState, ErrorState, Modal, Drawer, Header, BottomNav, Sidebar, Breadcrumbs.

Page components should compose these primitives.

Shared components and variants added with Home and Explore:
- SectionHeader: section title (h2) with an optional trailing link action; supplies the heading id for `aria-labelledby`.
- TrustStrip: one quiet muted panel of safety promises, icon in a white circle plus title and description; dividers between items on desktop.
- OrderStatusCard: one in-progress order as a card with a status badge, contents, segmented progress bar backed by visible step text, and a single next action; `stacked` or `split` layout.
- Button `inverse` / `inverseOutline`: only on solid deep-teal (primary-deep) bands, such as the Home hero; never on light surfaces.
- ProviderCard `pendingLabel`: a not-yet-verified provider shows a neutral badge with a clock icon, never a success tone.
- Card actions take an explicit accessible label, and a pressed state when they toggle.
- Placeholder text and struck-through MRP use text-muted; text-subtle is too low-contrast for readable text.

## Do not
- Create a separate design system for each page.
- Hardcode platform/category names inside UI components.
- Use giant gradients or glassmorphism everywhere.
- Make every card clickable without clear affordance.
- Present prescription medicines as freely purchasable before verification.
- Claim that an AI explanation is a diagnosis.
