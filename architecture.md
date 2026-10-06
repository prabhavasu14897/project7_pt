# CareNow Prototype Architecture

## Suggested structure

```text
src/
  app/
  components/
    ui/
    marketplace/
    healthcare/
    navigation/
    feedback/
  config/
  data/
  features/
    home/
    medicines/
    labs/
    doctors/
    home-care/
    checkout/
    orders/
    health/
    profile/
  lib/
  types/
```

## Separation

### config
Brand, theme, navigation, categories and static copy.

### data
Typed mock data that can later be replaced by API calls.

### components
Reusable visual components only.

### features
Page/feature orchestration and feature-specific state.

### lib
Utilities, formatters and validation.

### types
Shared TypeScript models.

## Future backend
Keep provider/product/order models API-friendly.
Avoid coupling UI components directly to database models.

Potential future domains:
- users
- providers
- pharmacies
- medicines
- prescriptions
- prescription-verifications
- lab-tests
- doctors
- appointments
- home-care-services
- carts
- orders
- payments
- deliveries
- notifications
