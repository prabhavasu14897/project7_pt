# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: adults in Indian cities ordering healthcare for themselves (medicines, lab tests, doctor consults, home care), on mobile first and desktop second. Secondary: the same adult acting for family members (parents, children), via the family-members path.

Current audience of the prototype: stakeholders (investors/clients) clicking through the end-to-end journey in a demo.

## Product Purpose
CareNow is a healthcare marketplace that makes getting care feel as easy as a food-delivery app: Discover → Select → Verify (when required) → Book/Add to cart → Pay → Track → Receive. Success for the prototype is a stakeholder believing the whole journey works: every primary button leads somewhere plausible, backed by local mock state.

## Positioning
Delivery-app convenience with healthcare safety built in: prescription medicines are never purchasable before a pharmacist verifies the prescription, and that verification is visible as a real pending state, not an instant approval.

## Operating Context
- Medicine rules are set per pharmacy/provider: OTC (add to cart), prescription (upload → pharmacist verification → approved → cart), restricted/controlled (no purchase; special-process message).
- Provider trust signals (verification, rating, ETA, distance, price) are shown wherever a choice is made.
- No backend: all behaviour runs on local mock state; content and demo data live in `config/product.config.ts`.

## Capabilities and Constraints
- Stack: Next.js (App Router), React, TypeScript, Tailwind v4, lucide icons.
- Content, navigation, labels, theme tokens and demo data must come from `config/product.config.ts`; reusable components hold no product copy.
- Currency INR, locale en-IN.
- Undecided: authentication flow, real payments, real provider integrations.

## Brand Commitments
- Name: CareNow. Tagline: "Healthcare, delivered to your doorstep."
- Visual direction is pinned by DESIGN.md and the two reference boards in `reference-images/` (Manrope, teal/blue palette).
- Calm, reassuring, consumer-first; never clinical-ERP, never alarming outside true warnings.

## Evidence on Hand
- Reference boards: `reference-images/carenow-desktop-screens.png`, `reference-images/carenow-mobile-flow.png` (generated placeholder data, not real content).
- No real customer counts, testimonials, partner agreements or ratings exist. Pharmacy names, doctors and ratings in config are demo data and must not be presented as endorsements or real statistics. Do not invent claims such as "Trusted by 5M+".

## Product Principles
1. Convenience without cutting safety corners: verification steps are explicit and honest.
2. Trust is shown, not claimed: verification, ratings, ETAs and prices are visible at the point of choice.
3. One journey, many services: medicines, tests, doctors and home care share one pattern.
4. Every action has an outcome: no dead buttons in the prototype.

## Accessibility & Inclusion
44×44px touch targets, visible focus, status never by colour alone, labelled form fields, reduced-motion respected, readable contrast (WCAG AA).
