# CareNow Healthcare Marketplace Skill

## Marketplace mental model
Use the familiar pattern:
Browse → Compare → Select → Verify if needed → Book/Cart → Pay → Track

## Provider trust
Where relevant, show:
- provider name
- rating
- estimated time
- service mode
- price
- verification state

## Prescription safety
For prescription medicines:
- Show "Prescription required" before the user commits.
- Offer upload.
- Show verification status.
- Do not automatically mark approval.
- Allow a clarification/rejection state.
- Only expose fulfillment after verification.

## Restricted items
Do not create a normal purchase flow for restricted/controlled medicines. Provide a clear unavailable/special-process message.

## Medical language
Do not make diagnostic claims.
AI/report explanations must be framed as informational and should encourage professional consultation for clinical decisions.
