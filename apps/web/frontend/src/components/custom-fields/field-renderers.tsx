/**
 * CRM IMMOBILIARE - Custom Field Renderers
 *
 * Type-specific renderers for custom fields
 *
 * @module components/custom-fields/field-renderers
 * @since v3.1.1
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomFieldDefinition } from "@/lib/custom-fields";
import { UseFormRegister, Control, Controller } from "react-hook-form";

interface FieldRendererProps {
  field: CustomFieldDefinition;
  register?: UseFormRegister<any>;
  control?: Control<any>;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
}

/**
 * Text Field Renderer
 */
export function TextFieldRenderer({ field, register, error }: FieldRendererProps) {
  const rules = (field.validationRules as Record<string, any>) || {};

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={field.name}
        {...(register ? register(field.name, {
          required: field.required ? `${field.label} è obbligatorio` : false,
          maxLength: rules.maxLength ? {
            value: rules.maxLength,
            message: `Massimo ${rules.maxLength} caratteri`
          } : undefined,
        }) : {})}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/**
 * Number Field Renderer
 */
export function NumberFieldRenderer({ field, register, error }: FieldRendererProps) {
  const rules = (field.validationRules as Record<string, any>) || {};

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={field.name}
        type="number"
        step="any"
        {...(register ? register(field.name, {
          required: field.required ? `${field.label} è obbligatorio` : false,
          valueAsNumber: true,
          min: rules.min !== undefined ? {
            value: rules.min,
            message: `Minimo ${rules.min}`
          } : undefined,
          max: rules.max !== undefined ? {
            value: rules.max,
            message: `Massimo ${rules.max}`
          } : undefined,
        }) : {})}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/**
 * Date Field Renderer
 */
export function DateFieldRenderer({ field, register, error }: FieldRendererProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={field.name}
        type="date"
        {...(register ? register(field.name, {
          required: field.required ? `${field.label} è obbligatorio` : false,
        }) : {})}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/**
 * Boolean Field Renderer
 */
export function BooleanFieldRenderer({ field, control, error }: FieldRendererProps) {
  if (!control) return null;

  return (
    <div className="space-y-2">
      <Controller
        name={field.name}
        control={control}
        rules={{
          required: field.required ? `${field.label} è obbligatorio` : false,
        }}
        render={({ field: controlField }) => (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
            <Switch
              id={field.name}
              checked={controlField.value || false}
              onCheckedChange={controlField.onChange}
            />
          </div>
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/**
 * Select Field Renderer
 */
export function SelectFieldRenderer({ field, control, error }: FieldRendererProps) {
  if (!control) return null;

  const options = (field.options as string[]) || [];

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        name={field.name}
        control={control}
        rules={{
          required: field.required ? `${field.label} è obbligatorio` : false,
        }}
        render={({ field: controlField }) => (
          <Select
            value={controlField.value || ""}
            onValueChange={controlField.onChange}
          >
            <SelectTrigger className={error ? "border-destructive" : ""}>
              <SelectValue placeholder={`Seleziona ${field.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/**
 * MultiSelect Field Renderer
 */
export function MultiSelectFieldRenderer({ field, control, error }: FieldRendererProps) {
  if (!control) return null;

  const options = (field.options as string[]) || [];

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        name={field.name}
        control={control}
        rules={{
          required: field.required ? `${field.label} è obbligatorio` : false,
          validate: (value) => {
            if (field.required && (!value || value.length === 0)) {
              return `Seleziona almeno un'opzione`;
            }
            return true;
          }
        }}
        render={({ field: controlField }) => (
          <div className="space-y-2 rounded-lg border p-3">
            {options.map((option) => {
              const isChecked = Array.isArray(controlField.value)
                ? controlField.value.includes(option)
                : false;

              return (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${option}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(controlField.value)
                        ? controlField.value
                        : [];

                      if (checked) {
                        controlField.onChange([...currentValues, option]);
                      } else {
                        controlField.onChange(
                          currentValues.filter((v: string) => v !== option)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`${field.name}-${option}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/**
 * Main Field Renderer - Dispatches to specific renderer based on field type
 */
export function CustomFieldRenderer(props: FieldRendererProps) {
  const { field } = props;

  switch (field.fieldType) {
    case "text":
      return <TextFieldRenderer {...props} />;
    case "number":
      return <NumberFieldRenderer {...props} />;
    case "date":
      return <DateFieldRenderer {...props} />;
    case "boolean":
      return <BooleanFieldRenderer {...props} />;
    case "select":
      return <SelectFieldRenderer {...props} />;
    case "multiselect":
      return <MultiSelectFieldRenderer {...props} />;
    default:
      return null;
  }
}
