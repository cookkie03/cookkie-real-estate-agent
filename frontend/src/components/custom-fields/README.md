# Custom Fields System - Integration Guide

Sistema completo di campi personalizzati dinamici per CRM Immobiliare.

## 📚 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Form Integration](#form-integration)
- [Display Integration](#display-integration)

---

## Overview

Il sistema Custom Fields permette agli utenti di aggiungere campi personalizzati a qualsiasi entità (Property, Contact, Building, Request, Activity) tramite GUI, senza modificare codice.

**Features:**
- ✅ 6 tipi di campo: text, number, date, boolean, select, multiselect
- ✅ Validazione tipo-specifica (min/max, pattern, required)
- ✅ Integrazione react-hook-form
- ✅ Storage polimorfico (Entity-Attribute-Value pattern)
- ✅ UI management completa (/settings/custom-fields)

---

## Architecture

### Components

```
components/custom-fields/
├── custom-field-dialog.tsx       # CRUD UI for field definitions
├── dynamic-custom-fields.tsx     # Form integration component
├── field-renderers.tsx           # Type-specific renderers
└── README.md                     # This file
```

### Hooks

```typescript
useCustomFields({
  entityType: "Property",
  entityId: "prop-123",
  enabled: true
})
```

Returns: `{ definitions, values, initialValues, saveValues, isLoading }`

### API Endpoints

- `GET /api/custom-fields?entityType=Property` - List definitions
- `POST /api/custom-fields` - Create definition
- `PUT /api/custom-fields/:id` - Update definition
- `DELETE /api/custom-fields/:id` - Delete definition
- `GET /api/custom-fields/values?entityType=X&entityId=Y` - Get values
- `PUT /api/custom-fields/values` - Save values (batch)

---

## Usage Examples

### 1. Display Custom Fields (Read-Only)

```tsx
import { CustomFieldsDisplay } from "@/components/custom-fields/dynamic-custom-fields";

export function PropertyDetail({ propertyId }: { propertyId: string }) {
  return (
    <div>
      <h2>Property Details</h2>

      {/* Standard fields */}
      <p>Price: €250,000</p>
      <p>Size: 80 m²</p>

      {/* Custom fields (auto-loaded) */}
      <CustomFieldsDisplay
        entityType="Property"
        entityId={propertyId}
      />
    </div>
  );
}
```

**Output:**
```
Campi Personalizzati
┌─────────────────────────────┐
│ Numero Protocollo: 12345    │
│ Classe Acustica: Classe II  │
│ Anno Ristrutturazione: 2020 │
└─────────────────────────────┘
```

---

### 2. Form Integration with react-hook-form

#### Complete Example

```tsx
import { useForm } from "react-hook-form";
import { DynamicCustomFields } from "@/components/custom-fields/dynamic-custom-fields";
import { useCustomFields } from "@/hooks/use-custom-fields";

export function PropertyForm({ propertyId }: { propertyId?: string }) {
  // Initialize custom fields hook
  const { initialValues, saveValues } = useCustomFields({
    entityType: "Property",
    entityId: propertyId,
  });

  // Setup form with custom fields initial values
  const form = useForm({
    defaultValues: {
      // Standard fields
      street: "",
      city: "",
      price: 0,

      // Custom fields (loaded from API)
      ...initialValues,
    },
  });

  const onSubmit = async (data: any) => {
    // 1. Save standard fields
    const standardData = {
      street: data.street,
      city: data.city,
      price: data.price,
    };
    const property = await saveProperty(standardData);

    // 2. Save custom fields
    const customFieldsData = Object.keys(initialValues).reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {} as Record<string, any>);

    await saveValues(customFieldsData);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Standard Fields */}
      <Input {...form.register("street")} placeholder="Via..." />
      <Input {...form.register("city")} placeholder="Città..." />

      {/* Custom Fields (dynamic) */}
      <DynamicCustomFields
        entityType="Property"
        entityId={propertyId}
        register={form.register}
        control={form.control}
        errors={form.formState.errors}
      />

      <Button type="submit">Salva</Button>
    </form>
  );
}
```

---

### 3. Filtered by Section

```tsx
<DynamicCustomFields
  entityType="Property"
  entityId={propertyId}
  register={form.register}
  control={form.control}
  section="Dati Generali"  // Only show fields in this section
/>
```

---

## API Reference

### DynamicCustomFields

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `entityType` | `EntityType` | Yes | "Property", "Contact", "Building", "Request", "Activity" |
| `entityId` | `string` | No | ID for loading existing values |
| `register` | `UseFormRegister` | Yes | react-hook-form register |
| `control` | `Control` | Yes | react-hook-form control |
| `errors` | `FieldErrors` | No | Form errors object |
| `section` | `string` | No | Filter by section name |

**Behavior:**
- Auto-loads field definitions for entityType
- Auto-loads values if entityId provided
- Renders fields grouped by section
- Validates using field-specific rules

---

### CustomFieldsDisplay

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `entityType` | `EntityType` | Yes | Entity type |
| `entityId` | `string` | Yes | Entity ID |

**Behavior:**
- Read-only display
- Auto-formats values (dates, booleans, numbers)
- Hides fields with null/empty values
- Groups by section

---

### useCustomFields

**Options:**

```typescript
{
  entityType: EntityType;
  entityId?: string;
  enabled?: boolean;  // Default: true
}
```

**Returns:**

```typescript
{
  // Definitions
  definitions: CustomFieldDefinition[];
  isLoadingDefinitions: boolean;

  // Values
  values: CustomFieldWithValue[];
  initialValues: Record<string, any>;  // For form.defaultValues
  isLoadingValues: boolean;

  // Mutations
  saveValues: (formValues: Record<string, any>) => Promise<void>;
  isSaving: boolean;
  saveError: Error | null;
  saveSuccess: boolean;

  // Combined
  isLoading: boolean;
}
```

---

## Form Integration

### Step-by-Step Guide

#### 1. Add hook

```tsx
const { initialValues, saveValues } = useCustomFields({
  entityType: "Property",
  entityId: propertyId,
});
```

#### 2. Merge with defaultValues

```tsx
const form = useForm({
  defaultValues: {
    ...standardDefaults,
    ...initialValues,  // ← Custom fields
  },
});
```

#### 3. Render fields

```tsx
<DynamicCustomFields
  entityType="Property"
  entityId={propertyId}
  register={form.register}
  control={form.control}
  errors={form.formState.errors}
/>
```

#### 4. Save on submit

```tsx
const onSubmit = async (data) => {
  // Save standard fields
  await saveStandardFields(data);

  // Extract and save custom fields
  const customData = extractCustomFields(data, initialValues);
  await saveValues(customData);
};
```

---

## Display Integration

### In Detail Pages

```tsx
// Property detail page
<TabsContent value="details">
  {/* Standard fields */}
  <PropertySpecs property={property} />

  {/* Custom fields */}
  <div className="rounded-lg border bg-card p-4">
    <CustomFieldsDisplay
      entityType="Property"
      entityId={property.id}
    />
  </div>
</TabsContent>
```

### In List Items

```tsx
// Property card
{customFields.length > 0 && (
  <div className="mt-2 text-xs text-muted-foreground">
    {customFields.map(field => (
      <span key={field.id}>
        {field.label}: {formatValue(field.value)}
      </span>
    ))}
  </div>
)}
```

---

## Field Types

### Supported Types

| Type | Input | Validation | Storage |
|------|-------|------------|---------|
| **text** | `<Input type="text">` | maxLength, pattern | `valueText` |
| **number** | `<Input type="number">` | min, max, int, positive | `valueNumber` |
| **date** | `<Input type="date">` | minDate, maxDate | `valueDate` |
| **boolean** | `<Switch>` | - | `valueBoolean` |
| **select** | `<Select>` | options array | `valueJson` |
| **multiselect** | `<Checkbox>` group | options array, min 1 | `valueJson` |

---

## Validation Rules

### Text

```typescript
validationRules: {
  maxLength: 100,
  pattern: "^[A-Z0-9]+$",
  patternMessage: "Solo maiuscole e numeri"
}
```

### Number

```typescript
validationRules: {
  min: 0,
  max: 1000,
  int: true,
  positive: true
}
```

### Date

```typescript
validationRules: {
  minDate: "2020-01-01",
  maxDate: "2030-12-31"
}
```

---

## Best Practices

### ✅ DO

- Use `section` prop to organize fields in tabs/accordions
- Load custom fields on entity creation pages (entityId undefined)
- Validate custom fields server-side (API does this automatically)
- Use `CustomFieldsDisplay` for read-only views
- Cache definitions client-side (React Query handles this)

### ❌ DON'T

- Don't modify field `name` after creation (breaks existing values)
- Don't skip validation on save
- Don't render custom fields without react-hook-form
- Don't hardcode field definitions in code
- Don't bypass the API for CRUD operations

---

## Troubleshooting

### Custom fields not showing

**Check:**
1. Are there active custom fields? (`/settings/custom-fields`)
2. Is `entityType` correct?
3. Is `useCustomFields` hook called correctly?

### Values not saving

**Check:**
1. Is `entityId` provided to `useCustomFields`?
2. Is `saveValues()` called after form submit?
3. Check browser console for API errors

### Validation not working

**Check:**
1. Is `errors` prop passed to `DynamicCustomFields`?
2. Are validation rules configured correctly?
3. Is field marked as `required`?

---

## Examples Repository

See full examples in:
- `/app/immobili/[id]/page.tsx` - Display integration
- `/app/settings/custom-fields/page.tsx` - Management UI
- `/components/custom-fields/custom-field-dialog.tsx` - CRUD operations

---

**Made with ❤️ for CRM Immobiliare v3.1.1**
