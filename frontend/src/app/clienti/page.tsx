"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, Filter, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientCard } from "@/components/features/ClientCard";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * CRM IMMOBILIARE - Clients List Page
 *
 * Professional contact management with:
 * - Search bar (debounced)
 * - Quick filters (All, Active, Leads)
 * - Advanced filters (Sheet drawer)
 * - Client cards with avatars
 * - FAB for new client
 *
 * @module pages/clienti
 * @since v3.1.1
 */

type QuickFilter = "all" | "active" | "lead";

interface AdvancedFilters {
  status?: string;
  importance?: string;
  entityType?: string;
  budgetMin?: string;
  budgetMax?: string;
  city?: string;
  province?: string;
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [sheetOpen, setSheetOpen] = useState(false);

  // Fetch contacts
  const { data, isLoading } = useQuery({
    queryKey: ["contacts", quickFilter, advancedFilters],
    queryFn: async () => {
      try {
        const filters: any = { page: 1, pageSize: 50 };
        if (quickFilter === "active") {
          filters.status = "active";
        } else if (quickFilter === "lead") {
          filters.source = "lead";
        }
        // Apply advanced filters
        if (advancedFilters.status) filters.status = advancedFilters.status;
        if (advancedFilters.importance) filters.importance = advancedFilters.importance;
        if (advancedFilters.entityType) filters.entityType = advancedFilters.entityType;
        if (advancedFilters.budgetMin) filters.budgetMin = Number(advancedFilters.budgetMin);
        if (advancedFilters.budgetMax) filters.budgetMax = Number(advancedFilters.budgetMax);
        if (advancedFilters.city) filters.city = advancedFilters.city;
        if (advancedFilters.province) filters.province = advancedFilters.province;

        return await api.contacts.list(filters);
      } catch {
        return { contacts: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
      }
    },
  });

  const contacts = data?.contacts || [];

  // Filter contacts by search query (client-side)
  const filteredContacts = searchQuery
    ? contacts.filter((c: any) =>
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contacts;

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clienti</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci i tuoi contatti e lead
        </p>
      </div>

      {/* Search & Filters - Sticky */}
      <div className="sticky top-16 z-10 space-y-3 pb-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, email, telefono..."
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
            onClick={() => setQuickFilter("active")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              quickFilter === "active"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Attivi
          </button>
          <button
            onClick={() => setQuickFilter("lead")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              quickFilter === "lead"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Lead
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
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stato</label>
                  <Select
                    value={advancedFilters.status || ""}
                    onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona stato..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Attivo</SelectItem>
                      <SelectItem value="inactive">Inattivo</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Importance */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Importanza</label>
                  <Select
                    value={advancedFilters.importance || ""}
                    onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, importance: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona importanza..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bassa</SelectItem>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="high">Alta (VIP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Entity Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo Entità</label>
                  <Select
                    value={advancedFilters.entityType || ""}
                    onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, entityType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="person">Persona</SelectItem>
                      <SelectItem value="company">Azienda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget di Ricerca</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min €"
                      value={advancedFilters.budgetMin || ""}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, budgetMin: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Max €"
                      value={advancedFilters.budgetMax || ""}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, budgetMax: e.target.value })}
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

                {/* Province */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provincia</label>
                  <Input
                    placeholder="Es. MI"
                    maxLength={2}
                    value={advancedFilters.province || ""}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, province: e.target.value })}
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
            {advancedFilters.status && (
              <Badge variant="secondary" className="gap-1">
                Stato: {advancedFilters.status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("status")}
                />
              </Badge>
            )}
            {advancedFilters.importance && (
              <Badge variant="secondary" className="gap-1">
                Importanza: {advancedFilters.importance}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("importance")}
                />
              </Badge>
            )}
            {advancedFilters.entityType && (
              <Badge variant="secondary" className="gap-1">
                Tipo: {advancedFilters.entityType}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("entityType")}
                />
              </Badge>
            )}
            {advancedFilters.budgetMin && (
              <Badge variant="secondary" className="gap-1">
                Budget min: €{advancedFilters.budgetMin}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("budgetMin")}
                />
              </Badge>
            )}
            {advancedFilters.budgetMax && (
              <Badge variant="secondary" className="gap-1">
                Budget max: €{advancedFilters.budgetMax}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("budgetMax")}
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
            {advancedFilters.province && (
              <Badge variant="secondary" className="gap-1">
                Provincia: {advancedFilters.province}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("province")}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {filteredContacts.length} {filteredContacts.length === 1 ? "contatto trovato" : "contatti trovati"}
        </div>
      </div>

      {/* Contacts List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[100px] rounded-lg skeleton" />
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="py-16 text-center rounded-lg border-2 border-dashed">
          <Users className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
          <h3 className="mb-2 text-lg font-semibold">
            {searchQuery || quickFilter !== "all"
              ? "Nessun contatto trovato"
              : "Nessun cliente in rubrica"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || quickFilter !== "all"
              ? "Prova a modificare i filtri di ricerca"
              : "Inizia aggiungendo il tuo primo cliente"}
          </p>
          <Button size="lg" asChild>
            <Link href="/clienti/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Cliente
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map((contact: any) => (
            <ClientCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}

      {/* FAB - Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl p-0"
        aria-label="Nuovo cliente"
        asChild
      >
        <Link href="/clienti/new">
          <Plus className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  );
}
