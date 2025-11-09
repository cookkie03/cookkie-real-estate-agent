/**
 * CRM IMMOBILIARE - Custom Fields Hook
 *
 * React hook for loading and saving custom field values
 *
 * @module hooks/use-custom-fields
 * @since v3.1.1
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EntityType, CustomFieldDefinition, prepareValuesForSave } from "@/lib/custom-fields";

interface UseCustomFieldsOptions {
  entityType: EntityType;
  entityId?: string;
  enabled?: boolean;
}

/**
 * Hook for managing custom fields
 */
export function useCustomFields({ entityType, entityId, enabled = true }: UseCustomFieldsOptions) {
  const queryClient = useQueryClient();

  // Fetch field definitions
  const {
    data: definitionsData,
    isLoading: isLoadingDefinitions,
  } = useQuery({
    queryKey: ["custom-field-definitions", entityType],
    queryFn: async () => {
      const response = await fetch(
        `/api/custom-fields?entityType=${entityType}&isActive=true`
      );
      if (!response.ok) throw new Error("Errore nel caricamento delle definizioni");
      return response.json();
    },
    enabled,
  });

  const definitions: CustomFieldDefinition[] = definitionsData?.customFields || [];

  // Fetch field values (only if entityId is provided)
  const {
    data: valuesData,
    isLoading: isLoadingValues,
  } = useQuery({
    queryKey: ["custom-field-values", entityType, entityId],
    queryFn: async () => {
      if (!entityId) return null;

      const response = await fetch(
        `/api/custom-fields/values?entityType=${entityType}&entityId=${entityId}`
      );
      if (!response.ok) throw new Error("Errore nel caricamento dei valori");
      return response.json();
    },
    enabled: enabled && !!entityId,
  });

  // Save values mutation
  const saveMutation = useMutation({
    mutationFn: async (formValues: Record<string, any>) => {
      if (!entityId) {
        throw new Error("entityId è richiesto per salvare i valori");
      }

      const valuesToSave = prepareValuesForSave(formValues, definitions);

      const response = await fetch("/api/custom-fields/values", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          values: valuesToSave,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore nel salvataggio");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["custom-field-values", entityType, entityId],
      });
    },
  });

  // Extract values into a flat object for form initialization
  const initialValues: Record<string, any> = {};
  if (valuesData?.fields) {
    for (const fieldWithValue of valuesData.fields) {
      initialValues[fieldWithValue.field.name] = fieldWithValue.value;
    }
  }

  return {
    // Field definitions
    definitions,
    isLoadingDefinitions,

    // Field values
    values: valuesData?.fields || [],
    initialValues,
    isLoadingValues,

    // Save mutation
    saveValues: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    saveSuccess: saveMutation.isSuccess,

    // Combined loading state
    isLoading: isLoadingDefinitions || isLoadingValues,
  };
}
