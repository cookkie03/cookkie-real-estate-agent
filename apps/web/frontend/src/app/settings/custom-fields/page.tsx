/**
 * CRM IMMOBILIARE - Custom Fields Management Page
 *
 * Allows users to create, edit, and manage custom fields for entities
 *
 * @module app/settings/custom-fields
 * @since v3.1.1
 */

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Settings2,
  Home,
  Users,
  Building,
  FileText,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { CustomFieldDefinition, EntityType } from "@/lib/custom-fields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomFieldDialog } from "@/components/custom-fields/custom-field-dialog";

export default function CustomFieldsPage() {
  const queryClient = useQueryClient();
  const [selectedEntity, setSelectedEntity] = useState<EntityType>("Property");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [deletingField, setDeletingField] = useState<CustomFieldDefinition | null>(null);

  // Fetch custom fields
  const { data: fieldsData, isLoading } = useQuery({
    queryKey: ["custom-fields", selectedEntity],
    queryFn: async () => {
      const response = await fetch(`/api/custom-fields?entityType=${selectedEntity}&isActive=true`);
      if (!response.ok) throw new Error("Errore nel caricamento dei campi");
      return response.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (fieldId: string) => {
      const response = await fetch(`/api/custom-fields/${fieldId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Errore nell'eliminazione del campo");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-fields"] });
      setDeletingField(null);
    },
  });

  const customFields: CustomFieldDefinition[] = fieldsData?.customFields || [];

  const entityIcons: Record<EntityType, any> = {
    Property: Home,
    Contact: Users,
    Building: Building,
    Request: FileText,
    Activity: Calendar,
  };

  const entityLabels: Record<EntityType, string> = {
    Property: "Immobili",
    Contact: "Contatti",
    Building: "Edifici",
    Request: "Richieste",
    Activity: "Attività",
  };

  const fieldTypeLabels: Record<string, string> = {
    text: "Testo",
    number: "Numero",
    date: "Data",
    boolean: "Sì/No",
    select: "Selezione",
    multiselect: "Selezione Multipla",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">Campi Personalizzati</h1>
          </div>
          <p className="text-muted-foreground">
            Aggiungi campi custom per personalizzare i dati che raccogli
          </p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Campo
        </Button>
      </div>

      {/* Entity Tabs */}
      <Tabs
        value={selectedEntity}
        onValueChange={(value) => setSelectedEntity(value as EntityType)}
      >
        <TabsList className="grid w-full grid-cols-5">
          {(Object.keys(entityIcons) as EntityType[]).map((entity) => {
            const Icon = entityIcons[entity];
            return (
              <TabsTrigger key={entity} value={entity} className="gap-2">
                <Icon className="h-4 w-4" />
                {entityLabels[entity]}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(entityIcons) as EntityType[]).map((entity) => (
          <TabsContent key={entity} value={entity} className="mt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : customFields.length === 0 ? (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Settings2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  Nessun campo personalizzato
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Aggiungi il tuo primo campo custom per {entityLabels[entity].toLowerCase()}
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crea Campo
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {customFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{field.label}</h3>
                        <Badge variant="secondary">
                          {fieldTypeLabels[field.fieldType] || field.fieldType}
                        </Badge>
                        {field.required && (
                          <Badge variant="destructive">Obbligatorio</Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Nome: <code className="rounded bg-muted px-1">{field.name}</code></span>
                        {field.section && <span>Sezione: {field.section}</span>}
                        <span>Ordine: {field.displayOrder}</span>
                      </div>
                      {field.options && Array.isArray(field.options) && field.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {field.options.slice(0, 5).map((option, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                          {field.options.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{field.options.length - 5} altre
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingField(field)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingField(field)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create/Edit Dialog */}
      <CustomFieldDialog
        open={isCreateDialogOpen || editingField !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingField(null);
          }
        }}
        entityType={selectedEntity}
        field={editingField || undefined}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["custom-fields"] });
          setIsCreateDialogOpen(false);
          setEditingField(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deletingField !== null}
        onOpenChange={(open) => !open && setDeletingField(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elimina Campo Personalizzato</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare il campo &ldquo;{deletingField?.label}&rdquo;?
              <br />
              <strong className="text-destructive">
                Questa azione eliminerà anche tutti i valori esistenti per questo campo.
              </strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingField(null)}
              disabled={deleteMutation.isPending}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingField && deleteMutation.mutate(deletingField.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminazione..." : "Elimina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
