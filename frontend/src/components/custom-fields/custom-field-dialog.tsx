/**
 * CRM IMMOBILIARE - Custom Field Dialog Component
 *
 * Dialog for creating and editing custom field definitions
 *
 * @module components/custom-fields/custom-field-dialog
 * @since v3.1.1
 */

"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CustomFieldDefinition, EntityType, FieldType } from "@/lib/custom-fields";

interface CustomFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: EntityType;
  field?: CustomFieldDefinition;
  onSuccess: () => void;
}

export function CustomFieldDialog({
  open,
  onOpenChange,
  entityType,
  field,
  onSuccess,
}: CustomFieldDialogProps) {
  const isEditing = !!field;

  const [formData, setFormData] = useState({
    name: "",
    label: "",
    fieldType: "text" as FieldType,
    required: false,
    section: "",
    displayOrder: 0,
    validationRules: {} as Record<string, any>,
    options: [] as string[],
  });

  const [newOption, setNewOption] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or field changes
  useEffect(() => {
    if (open) {
      if (field) {
        setFormData({
          name: field.name,
          label: field.label,
          fieldType: field.fieldType,
          required: field.required,
          section: field.section || "",
          displayOrder: field.displayOrder,
          validationRules: (field.validationRules as Record<string, any>) || {},
          options: (field.options as string[]) || [],
        });
      } else {
        setFormData({
          name: "",
          label: "",
          fieldType: "text",
          required: false,
          section: "",
          displayOrder: 0,
          validationRules: {},
          options: [],
        });
      }
      setErrors({});
      setNewOption("");
    }
  }, [open, field]);

  // Auto-generate name from label
  const handleLabelChange = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      label,
      // Auto-generate name only if not editing
      name: isEditing
        ? prev.name
        : label
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, "_")
            .substring(0, 50),
    }));
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = "Il label è obbligatorio";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Il nome è obbligatorio";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.name)) {
      newErrors.name = "Il nome può contenere solo lettere, numeri e underscore";
    }

    if (["select", "multiselect"].includes(formData.fieldType) && formData.options.length === 0) {
      newErrors.options = "Aggiungi almeno un'opzione";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = isEditing ? `/api/custom-fields/${field.id}` : "/api/custom-fields";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          entityType,
          validationRules: Object.keys(data.validationRules).length > 0 ? data.validationRules : undefined,
          options: data.options.length > 0 ? data.options : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore nel salvataggio");
      }

      return response.json();
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;
    saveMutation.mutate(formData);
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, newOption.trim()],
      }));
      setNewOption("");
      setErrors((prev) => ({ ...prev, options: "" }));
    }
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const fieldTypeOptions = [
    { value: "text", label: "Testo" },
    { value: "number", label: "Numero" },
    { value: "date", label: "Data" },
    { value: "boolean", label: "Sì/No" },
    { value: "select", label: "Selezione" },
    { value: "multiselect", label: "Selezione Multipla" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifica Campo" : "Nuovo Campo Personalizzato"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica le proprietà del campo personalizzato"
              : `Aggiungi un nuovo campo custom per ${entityType}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">
              Label (nome visualizzato) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="label"
              placeholder="es. Numero Protocollo, Classe Acustica"
              value={formData.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className={errors.label ? "border-destructive" : ""}
            />
            {errors.label && (
              <p className="text-sm text-destructive">{errors.label}</p>
            )}
          </div>

          {/* Name (slug) */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome (slug interno) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="es. numero_protocollo"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isEditing}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Il nome non può essere modificato dopo la creazione
              </p>
            )}
          </div>

          {/* Field Type */}
          <div className="space-y-2">
            <Label htmlFor="fieldType">
              Tipo Campo <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.fieldType}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, fieldType: value as FieldType }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options (for select/multiselect) */}
          {["select", "multiselect"].includes(formData.fieldType) && (
            <div className="space-y-2">
              <Label>
                Opzioni <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Aggiungi opzione..."
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                />
                <Button type="button" onClick={addOption} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors.options && (
                <p className="text-sm text-destructive">{errors.options}</p>
              )}
              {formData.options.length > 0 && (
                <div className="space-y-1 rounded-md border p-3">
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded bg-muted px-3 py-2 text-sm"
                    >
                      <span>{option}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Validation Rules (type-specific) */}
          {formData.fieldType === "text" && (
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="text-sm font-semibold">Regole di Validazione</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxLength">Lunghezza Massima</Label>
                  <Input
                    id="maxLength"
                    type="number"
                    placeholder="es. 100"
                    value={formData.validationRules.maxLength || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        validationRules: {
                          ...prev.validationRules,
                          maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {formData.fieldType === "number" && (
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="text-sm font-semibold">Regole di Validazione</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min">Valore Minimo</Label>
                  <Input
                    id="min"
                    type="number"
                    placeholder="es. 0"
                    value={formData.validationRules.min ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        validationRules: {
                          ...prev.validationRules,
                          min: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Valore Massimo</Label>
                  <Input
                    id="max"
                    type="number"
                    placeholder="es. 1000"
                    value={formData.validationRules.max ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        validationRules: {
                          ...prev.validationRules,
                          max: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section */}
          <div className="space-y-2">
            <Label htmlFor="section">Sezione UI (opzionale)</Label>
            <Input
              id="section"
              placeholder="es. Dati Generali, Caratteristiche"
              value={formData.section}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, section: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Raggruppa i campi in sezioni nei form
            </p>
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="displayOrder">Ordine di Visualizzazione</Label>
            <Input
              id="displayOrder"
              type="number"
              placeholder="0"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  displayOrder: parseInt(e.target.value) || 0,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Ordina i campi custom (0 = primo)
            </p>
          </div>

          {/* Required */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="required">Campo Obbligatorio</Label>
              <p className="text-xs text-muted-foreground">
                L&apos;utente dovrà compilare questo campo
              </p>
            </div>
            <Switch
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, required: checked }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            Annulla
          </Button>
          <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
            {saveMutation.isPending
              ? "Salvataggio..."
              : isEditing
              ? "Aggiorna"
              : "Crea Campo"}
          </Button>
        </DialogFooter>

        {saveMutation.isError && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {(saveMutation.error as Error).message}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
