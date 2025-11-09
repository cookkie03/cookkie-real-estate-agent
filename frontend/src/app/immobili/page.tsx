"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Plus, Filter, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { propertiesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyCard } from "@/components/features/PropertyCard";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPreview } from "@/components/map/MapPreview";

/**
 * CRM IMMOBILIARE - Properties List Page
 *
 * Professional property portfolio management with:
 * - Search bar (debounced)
 * - Quick filters (pills: All, Sale, Rent)
 * - Advanced filters (Sheet drawer)
 * - Property cards grid
 * - FAB for new property
 *
 * @module pages/immobili
 * @since v3.1.1
 */

type QuickFilter = "all" | "sale" | "rent";

interface AdvancedFilters {
  propertyType?: string;
  priceMin?: string;
  priceMax?: string;
  roomsMin?: string;
  roomsMax?: string;
  bathroomsMin?: string;
  surfaceMin?: string;
  surfaceMax?: string;
  city?: string;
  zone?: string;
}

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [sheetOpen, setSheetOpen] = useState(false);

  // Fetch properties
  const { data, isLoading } = useQuery({
    queryKey: ["properties", quickFilter, advancedFilters],
    queryFn: async () => {
      try {
        const filters: any = { page: 1, pageSize: 50 };
        if (quickFilter !== "all") {
          filters.contractType = quickFilter;
        }
        // Apply advanced filters
        if (advancedFilters.propertyType) filters.propertyType = advancedFilters.propertyType;
        if (advancedFilters.priceMin) filters.priceMin = Number(advancedFilters.priceMin);
        if (advancedFilters.priceMax) filters.priceMax = Number(advancedFilters.priceMax);
        if (advancedFilters.roomsMin) filters.roomsMin = Number(advancedFilters.roomsMin);
        if (advancedFilters.roomsMax) filters.roomsMax = Number(advancedFilters.roomsMax);
        if (advancedFilters.bathroomsMin) filters.bathroomsMin = Number(advancedFilters.bathroomsMin);
        if (advancedFilters.surfaceMin) filters.surfaceMin = Number(advancedFilters.surfaceMin);
        if (advancedFilters.surfaceMax) filters.surfaceMax = Number(advancedFilters.surfaceMax);
        if (advancedFilters.city) filters.city = advancedFilters.city;
        if (advancedFilters.zone) filters.zone = advancedFilters.zone;

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

  // Count active advanced filters
  const activeFiltersCount = Object.values(advancedFilters).filter(Boolean).length;

  // Clear all advanced filters
  const clearAdvancedFilters = () => {
    setAdvancedFilters({});
  };

  // Remove single filter
  const removeFilter = (key: keyof AdvancedFilters) => {
    setAdvancedFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

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

          {/* Advanced Filters Sheet */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border text-sm hover:bg-accent">
                <Filter className="h-4 w-4" />
                Filtri avanzati
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtri Avanzati</SheetTitle>
              </SheetHeader>

              <div className="space-y-4 py-6">
                {/* Property Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipologia</label>
                  <Select
                    value={advancedFilters.propertyType || ""}
                    onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, propertyType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipologia..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Appartamento</SelectItem>
                      <SelectItem value="house">Casa</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="studio">Monolocale</SelectItem>
                      <SelectItem value="loft">Loft</SelectItem>
                      <SelectItem value="office">Ufficio</SelectItem>
                      <SelectItem value="commercial">Commerciale</SelectItem>
                      <SelectItem value="land">Terreno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prezzo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min €"
                      value={advancedFilters.priceMin || ""}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, priceMin: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Max €"
                      value={advancedFilters.priceMax || ""}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, priceMax: e.target.value })}
                    />
                  </div>
                </div>

                {/* Rooms */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Camere</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={advancedFilters.roomsMin || ""}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, roomsMin: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={advancedFilters.roomsMax || ""}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, roomsMax: e.target.value })}
                    />
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bagni (min)</label>
                  <Input
                    type="number"
                    placeholder="Numero minimo bagni"
                    value={advancedFilters.bathroomsMin || ""}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, bathroomsMin: e.target.value })}
                  />
                </div>

                {/* Surface Area */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Superficie (m²)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min m²"
                      value={advancedFilters.surfaceMin || ""}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, surfaceMin: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Max m²"
                      value={advancedFilters.surfaceMax || ""}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, surfaceMax: e.target.value })}
                    />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Città</label>
                  <Input
                    placeholder="Es. Milano"
                    value={advancedFilters.city || ""}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, city: e.target.value })}
                  />
                </div>

                {/* Zone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zona</label>
                  <Input
                    placeholder="Es. Centro"
                    value={advancedFilters.zone || ""}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, zone: e.target.value })}
                  />
                </div>
              </div>

              <SheetFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearAdvancedFilters}
                  disabled={activeFiltersCount === 0}
                >
                  Azzera filtri
                </Button>
                <Button type="button" onClick={() => setSheetOpen(false)}>
                  Applica
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Badges */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {advancedFilters.propertyType && (
              <Badge variant="secondary" className="gap-1">
                Tipo: {advancedFilters.propertyType}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("propertyType")}
                />
              </Badge>
            )}
            {advancedFilters.priceMin && (
              <Badge variant="secondary" className="gap-1">
                Min: €{advancedFilters.priceMin}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("priceMin")}
                />
              </Badge>
            )}
            {advancedFilters.priceMax && (
              <Badge variant="secondary" className="gap-1">
                Max: €{advancedFilters.priceMax}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("priceMax")}
                />
              </Badge>
            )}
            {advancedFilters.roomsMin && (
              <Badge variant="secondary" className="gap-1">
                Camere min: {advancedFilters.roomsMin}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("roomsMin")}
                />
              </Badge>
            )}
            {advancedFilters.roomsMax && (
              <Badge variant="secondary" className="gap-1">
                Camere max: {advancedFilters.roomsMax}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("roomsMax")}
                />
              </Badge>
            )}
            {advancedFilters.bathroomsMin && (
              <Badge variant="secondary" className="gap-1">
                Bagni min: {advancedFilters.bathroomsMin}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("bathroomsMin")}
                />
              </Badge>
            )}
            {advancedFilters.surfaceMin && (
              <Badge variant="secondary" className="gap-1">
                Superficie min: {advancedFilters.surfaceMin}m²
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("surfaceMin")}
                />
              </Badge>
            )}
            {advancedFilters.surfaceMax && (
              <Badge variant="secondary" className="gap-1">
                Superficie max: {advancedFilters.surfaceMax}m²
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("surfaceMax")}
                />
              </Badge>
            )}
            {advancedFilters.city && (
              <Badge variant="secondary" className="gap-1">
                Città: {advancedFilters.city}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("city")}
                />
              </Badge>
            )}
            {advancedFilters.zone && (
              <Badge variant="secondary" className="gap-1">
                Zona: {advancedFilters.zone}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("zone")}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {filteredProperties.length} {filteredProperties.length === 1 ? "immobile trovato" : "immobili trovati"}
        </div>
      </div>

      {/* Map Preview */}
      {!isLoading && filteredProperties.length > 0 && (
        <MapPreview
          filters={{
            city: advancedFilters.city,
          }}
        />
      )}

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
          <Button size="lg" asChild>
            <Link href="/immobili/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Immobile
            </Link>
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
        asChild
      >
        <Link href="/immobili/new">
          <Plus className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  );
}
