/**
 * CRM IMMOBILIARE - Dynamic Custom Fields Component
 *
 * Renders custom fields dynamically based on definitions
 * Integrates with react-hook-form
 *
 * @module components/custom-fields/dynamic-custom-fields
 * @since v3.1.1
 */

"use client";

import { UseFormRegister, Control, FieldErrors } from "react-hook-form";
import { EntityType, groupFieldsBySection } from "@/lib/custom-fields";
import { useCustomFields } from "@/hooks/use-custom-fields";
import { CustomFieldRenderer } from "./field-renderers";
import { Separator } from "@/components/ui/separator";

interface DynamicCustomFieldsProps {
  entityType: EntityType;
  entityId?: string;
  register: UseFormRegister<any>;
  control: Control<any>;
  errors?: FieldErrors;
  section?: string; // Optional: filter by section
}

/**
 * DynamicCustomFields Component
 *
 * Renders all active custom fields for an entity type
 * Automatically groups by section if available
 *
 * @example
 * ```tsx
 * <DynamicCustomFields
 *   entityType="Property"
 *   entityId={propertyId}
 *   register={form.register}
 *   control={form.control}
 *   errors={form.formState.errors}
 *   section="Dati Generali"
 * />
 * ```
 */
export function DynamicCustomFields({
  entityType,
  entityId,
  register,
  control,
  errors,
  section,
}: DynamicCustomFieldsProps) {
  const { definitions, isLoadingDefinitions } = useCustomFields({
    entityType,
    entityId,
  });

  if (isLoadingDefinitions) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (definitions.length === 0) {
    return null; // No custom fields defined
  }

  // Filter by section if specified
  const filteredFields = section
    ? definitions.filter((field) => field.section === section)
    : definitions;

  if (filteredFields.length === 0) {
    return null;
  }

  // Group by section
  const groupedFields = groupFieldsBySection(filteredFields);

  return (
    <div className="space-y-6">
      {Array.from(groupedFields.entries()).map(([sectionName, fields], idx) => (
        <div key={sectionName}>
          {/* Section header (only if not filtering by section) */}
          {!section && groupedFields.size > 1 && (
            <>
              {idx > 0 && <Separator className="my-6" />}
              <h3 className="mb-4 text-lg font-semibold">{sectionName}</h3>
            </>
          )}

          {/* Fields grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => {
              const error = errors?.[field.name];
              const errorMessage = error?.message as string | undefined;

              return (
                <div
                  key={field.id}
                  className={
                    field.fieldType === "boolean" ||
                    field.fieldType === "multiselect"
                      ? "md:col-span-2"
                      : ""
                  }
                >
                  <CustomFieldRenderer
                    field={field}
                    register={register}
                    control={control}
                    error={errorMessage}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Custom Fields Display Component
 *
 * Read-only display of custom field values
 * Used in detail/view pages
 */
interface CustomFieldsDisplayProps {
  entityType: EntityType;
  entityId: string;
}

export function CustomFieldsDisplay({ entityType, entityId }: CustomFieldsDisplayProps) {
  const { values, isLoading } = useCustomFields({ entityType, entityId });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (!values || values.length === 0) {
    return null;
  }

  // Filter out fields with null/undefined values
  const fieldsWithValues = values.filter(
    (fv) => fv.value !== null && fv.value !== undefined && fv.value !== ""
  );

  if (fieldsWithValues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Campi Personalizzati</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {fieldsWithValues.map(({ field, value }) => (
          <div key={field.id} className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {field.label}
            </p>
            <p className="text-sm">
              {formatDisplayValue(value, field.fieldType)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Format value for display
 */
function formatDisplayValue(value: any, fieldType: string): string {
  if (value === null || value === undefined) return "-";

  switch (fieldType) {
    case "boolean":
      return value ? "Sì" : "No";

    case "date":
      return new Date(value).toLocaleDateString("it-IT");

    case "number":
      return new Intl.NumberFormat("it-IT").format(value);

    case "multiselect":
      return Array.isArray(value) ? value.join(", ") : String(value);

    default:
      return String(value);
  }
}
