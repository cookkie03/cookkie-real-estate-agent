# @crm-immobiliare/utils

Shared utility functions for CRM Immobiliare.

## Features

- **Validation**: Italian tax code, VAT, phone, email, coordinates
- **Formatting**: Currency, dates, phone numbers, addresses
- **Crypto**: UUID generation, hashing, masking sensitive data
- **Common Utils**: Debounce, throttle, retry, deep clone, groupBy, distance calculation

## Usage

```typescript
import {
  formatCurrency,
  formatDate,
  isValidTaxCode,
  calculateDistance,
  debounce,
} from '@crm-immobiliare/utils';

// Format currency
formatCurrency(250000); // "€ 250.000"

// Validate tax code
isValidTaxCode('RSSMRA85M01H501Z'); // true

// Calculate distance
const distance = calculateDistance(45.4642, 9.1900, 45.4408, 9.2064); // 2.5 km

// Debounce function
const debouncedSearch = debounce((query: string) => {
  console.log('Searching:', query);
}, 300);
```

## Modules

- **validation/** - Input validation utilities
- **formatting/** - Output formatting utilities
- **crypto/** - Cryptographic and encoding utilities
- **index.ts** - Common utilities (debounce, retry, etc.)
