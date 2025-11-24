# @crm-immobiliare/shared-types

Shared TypeScript types, DTOs (Data Transfer Objects), and interfaces for CRM Immobiliare.

## Features

- **Type Safety**: Strong typing for all entities
- **DTOs**: Request/Response validation with Zod
- **Enums**: Shared enumerations
- **API Contracts**: Standardized API interfaces

## Usage

```typescript
import {
  PropertyEntity,
  CreatePropertyDto,
  CreatePropertyDtoSchema,
  PropertyStatus,
  ApiResponse,
} from '@crm-immobiliare/shared-types';

// Validate DTO
const result = CreatePropertyDtoSchema.safeParse(data);

// Use types
const response: ApiResponse<PropertyEntity> = {
  success: true,
  data: property,
};
```

## Structure

- **enums/** - Shared enumerations
- **entities/** - Business entity types
- **dtos/** - Data Transfer Objects with Zod validation
- **api/** - API request/response contracts

## Validation

All DTOs use Zod for runtime validation:

```typescript
const result = CreatePropertyDtoSchema.safeParse(userInput);
if (result.success) {
  // result.data is typed and validated
} else {
  // result.error contains validation errors
}
```
