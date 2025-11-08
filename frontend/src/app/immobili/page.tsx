"use client";

import { useState } from "react";
import { Building2, Plus, Filter, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { propertiesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyCard } from "@/components/features/PropertyCard";
import { cn } from "@/lib/utils";

/**
 * CRM IMMOBILIARE - Properties List Page
 *
 * Professional property portfolio management with:
 * - Search bar (debounced)
 * - Quick filters (pills: All, Sale, Rent)
 * - Property cards grid
 * - FAB for new property
 *
 * @module pages/immobili
 * @since v3.1.1
 */

type QuickFilter = "all" | "sale" | "rent";

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  // Fetch properties
  const { data, isLoading } = useQuery({
    queryKey: ["properties", quickFilter],
    queryFn: async () => {
      try {
        const filters: any = { page: 1, pageSize: 50 };
        if (quickFilter !== "all") {
          filters.contractType = quickFilter;
        }
        return await propertiesApi.list(filters);
      } catch {
        return { properties: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
      }
    },
  });

  const properties = data?.properties || [];

  // Filter properties by search query (client-side)
  const filteredProperties = searchQuery
    ? properties.filter((p: any) =>
        `${p.street} ${p.city} ${p.zone || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : properties;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Immobili</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci il tuo portafoglio immobiliare
          </p>
        </div>
      </div>

      {/* Search & Filters - Sticky */}
      <div className="sticky top-16 z-10 space-y-3 pb-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per indirizzo, città, zona..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Quick Filters Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickFilter("all")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              quickFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Tutti
          </button>
          <button
            onClick={() => setQuickFilter("sale")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              quickFilter === "sale"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Vendita
          </button>
          <button
            onClick={() => setQuickFilter("rent")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              quickFilter === "rent"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Affitto
          </button>

          {/* Advanced Filters Button */}
          <button className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border text-sm hover:bg-accent">
            <Filter className="h-4 w-4" />
            Filtri avanzati
          </button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {filteredProperties.length} {filteredProperties.length === 1 ? "immobile trovato" : "immobili trovati"}
        </div>
      </div>

      {/* Properties List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[140px] rounded-lg skeleton" />
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="py-16 text-center rounded-lg border-2 border-dashed">
          <Building2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
          <h3 className="mb-2 text-lg font-semibold">
            {searchQuery || quickFilter !== "all"
              ? "Nessun immobile trovato"
              : "Nessun immobile in portafoglio"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || quickFilter !== "all"
              ? "Prova a modificare i filtri di ricerca"
              : "Inizia aggiungendo il tuo primo immobile"}
          </p>
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Immobile
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProperties.map((property: any) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* FAB - Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl p-0"
        aria-label="Nuovo immobile"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
