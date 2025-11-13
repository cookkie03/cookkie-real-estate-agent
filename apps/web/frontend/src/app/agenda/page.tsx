"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Plus, List, CalendarDays, Save, Filter, X, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * CRM IMMOBILIARE - Agenda/Activities Page
 *
 * Calendar and activities management with:
 * - List view with filters
 * - Advanced filters (Sheet drawer)
 * - Calendar view (placeholder)
 * - Quick add activity dialog
 *
 * @module pages/agenda
 * @since v3.1.1
 */

type QuickFilter = "all" | "today" | "week" | "overdue";

interface AdvancedFilters {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  contactId?: string;
  propertyId?: string;
}

export default function AgendaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "meeting",
    date: "",
    time: "",
  });

  const queryClient = useQueryClient();

  // Fetch activities
  const { data, isLoading } = useQuery({
    queryKey: ["activities", quickFilter, advancedFilters],
    queryFn: async () => {
      try {
        const filters: any = { page: 1, pageSize: 50 };
        // Apply advanced filters
        if (advancedFilters.type) filters.type = advancedFilters.type;
        if (advancedFilters.dateFrom) filters.dateFrom = advancedFilters.dateFrom;
        if (advancedFilters.dateTo) filters.dateTo = advancedFilters.dateTo;
        if (advancedFilters.contactId) filters.contactId = advancedFilters.contactId;
        if (advancedFilters.propertyId) filters.propertyId = advancedFilters.propertyId;

        return await api.activities.list(filters);
      } catch {
        return { activities: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
      }
    },
  });

  // Create activity mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const dateTime = formData.date && formData.time
        ? new Date(`${formData.date}T${formData.time}`)
        : new Date();

      return await api.activities.create({
        ...formData,
        date: dateTime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        type: "meeting",
        date: "",
        time: "",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const activities = data?.activities || [];

  // Filter activities by search query (client-side)
  const filteredActivities = searchQuery
    ? activities.filter((a: any) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activities;

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

  // Get default date/time for form
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci appuntamenti e attività
          </p>
        </div>
      </div>

      {/* Search & Filters - Sticky */}
      <div className="sticky top-16 z-10 space-y-3 pb-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca attività..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* View Toggle */}
      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendario
            </TabsTrigger>
          </TabsList>
        </div>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          {/* Quick Filters */}
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
              Tutte
            </button>
            <button
              onClick={() => setQuickFilter("today")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                quickFilter === "today"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              Oggi
            </button>
            <button
              onClick={() => setQuickFilter("week")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                quickFilter === "week"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              Questa settimana
            </button>
            <button
              onClick={() => setQuickFilter("overdue")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                quickFilter === "overdue"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              Scadute
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
                  {/* Activity Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo Attività</label>
                    <Select
                      value={advancedFilters.type || ""}
                      onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Incontro</SelectItem>
                        <SelectItem value="viewing">Visita immobile</SelectItem>
                        <SelectItem value="call">Chiamata</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="task">Attività generica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Periodo</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Da</label>
                        <Input
                          type="date"
                          value={advancedFilters.dateFrom || ""}
                          onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateFrom: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">A</label>
                        <Input
                          type="date"
                          value={advancedFilters.dateTo || ""}
                          onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateTo: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact ID (placeholder for future implementation) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente (ID)</label>
                    <Input
                      placeholder="ID cliente (opzionale)"
                      value={advancedFilters.contactId || ""}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, contactId: e.target.value })}
                    />
                  </div>

                  {/* Property ID (placeholder for future implementation) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Immobile (ID)</label>
                    <Input
                      placeholder="ID immobile (opzionale)"
                      value={advancedFilters.propertyId || ""}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, propertyId: e.target.value })}
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
              {advancedFilters.type && (
                <Badge variant="secondary" className="gap-1">
                  Tipo: {advancedFilters.type}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("type")}
                  />
                </Badge>
              )}
              {advancedFilters.dateFrom && (
                <Badge variant="secondary" className="gap-1">
                  Da: {advancedFilters.dateFrom}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("dateFrom")}
                  />
                </Badge>
              )}
              {advancedFilters.dateTo && (
                <Badge variant="secondary" className="gap-1">
                  A: {advancedFilters.dateTo}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("dateTo")}
                  />
                </Badge>
              )}
              {advancedFilters.contactId && (
                <Badge variant="secondary" className="gap-1">
                  Cliente: {advancedFilters.contactId}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("contactId")}
                  />
                </Badge>
              )}
              {advancedFilters.propertyId && (
                <Badge variant="secondary" className="gap-1">
                  Immobile: {advancedFilters.propertyId}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("propertyId")}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Activities List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 rounded-lg skeleton" />
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="py-16 text-center rounded-lg border-2 border-dashed">
              <CalendarIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
              <h3 className="mb-2 text-lg font-semibold">
                {quickFilter !== "all"
                  ? "Nessuna attività trovata"
                  : "Nessuna attività in agenda"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {quickFilter !== "all"
                  ? "Prova a modificare i filtri di ricerca"
                  : "Inizia aggiungendo un appuntamento o un'attività"}
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuova Attività
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuova Attività</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <ActivityForm formData={formData} setFormData={setFormData} today={today} now={now} />
                    <div className="flex gap-3 justify-end">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Annulla
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {createMutation.isPending ? "Salvataggio..." : "Salva"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex gap-4 rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{activity.title}</h3>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(activity.date).toLocaleString("it-IT")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      Visualizza
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <div className="rounded-lg border bg-card p-12 text-center">
            <CalendarDays className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold mb-2">Vista Calendario</h3>
            <p className="text-sm text-muted-foreground">
              Vista calendario con integrazione in arrivo nella prossima implementazione
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* FAB with Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl p-0"
            aria-label="Nuova attività"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nuova Attività</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ActivityForm formData={formData} setFormData={setFormData} today={today} now={now} />
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={createMutation.isPending}>
                Annulla
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Salvataggio..." : "Salva"}
              </Button>
            </div>
            {createMutation.isError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                Errore durante il salvataggio. Riprova.
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Activity Form Component
 */
function ActivityForm({
  formData,
  setFormData,
  today,
  now
}: {
  formData: any;
  setFormData: (data: any) => void;
  today: string;
  now: string;
}) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo *</label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meeting">Incontro</SelectItem>
            <SelectItem value="viewing">Visita immobile</SelectItem>
            <SelectItem value="call">Chiamata</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="task">Attività generica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Titolo *</label>
        <Input
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Es. Visita appartamento con Mario Rossi"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Data *</label>
          <Input
            required
            type="date"
            value={formData.date || today}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Ora *</label>
          <Input
            required
            type="time"
            value={formData.time || now}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Note</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Aggiungi dettagli sull'attività..."
          rows={3}
        />
      </div>
    </>
  );
}
