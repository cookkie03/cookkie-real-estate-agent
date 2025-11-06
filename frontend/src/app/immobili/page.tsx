"use client";

import { Building2, Plus, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency, formatSquareMeters } from "@/lib/utils";
import { PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants";

/**
 * Properties List Page
 * Browse all properties with filters
 */
export default function PropertiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      try {
        return await api.properties.list({ page: 1, pageSize: 20 });
      } catch {
        return { data: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 } };
      }
    },
  });

  const properties = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Immobili</h1>
          <p className="text-muted-foreground">
            Gestisci il tuo portafoglio immobiliare
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nuovo Immobile
        </button>
      </div>

      {/* Filters */}
      <div className="stat-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filtri disponibili: città, stato, tipo, prezzo</span>
        </div>
      </div>

      {/* Properties List */}
      <div className="stat-card">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 skeleton" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <h3 className="mb-2 text-lg font-medium">Nessun immobile</h3>
            <p className="text-sm text-muted-foreground">
              Inizia aggiungendo il tuo primo immobile
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {properties.map((property: any) => (
              <a
                key={property.id}
                href={`/immobili/${property.id}`}
                className="data-table-row flex items-center gap-4 p-4"
              >
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">
                    {property.street}, {property.city}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {PROPERTY_TYPE_LABELS[property.propertyType as keyof typeof PROPERTY_TYPE_LABELS] || property.propertyType}
                    {property.squareMeters && ` • ${formatSquareMeters(property.squareMeters)}`}
                    {property.rooms && ` • ${property.rooms} locali`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(property.price)}</p>
                  <p className="text-sm text-muted-foreground">
                    {PROPERTY_STATUS_LABELS[property.status as keyof typeof PROPERTY_STATUS_LABELS] || property.status}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-accent">
            Precedente
          </button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Pagina {data.pagination.page} di {data.pagination.totalPages}
          </span>
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-accent">
            Successiva
          </button>
        </div>
      )}
    </div>
  );
}
