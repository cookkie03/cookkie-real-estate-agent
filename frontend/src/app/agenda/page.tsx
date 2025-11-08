"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Plus, List, CalendarDays, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * CRM IMMOBILIARE - Agenda/Activities Page
 *
 * Calendar and activities management with:
 * - List view with filters
 * - Calendar view (placeholder)
 * - Quick add activity dialog
 *
 * @module pages/agenda
 * @since v3.1.1
 */

type QuickFilter = "all" | "today" | "week" | "overdue";

export default function AgendaPage() {
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
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
    queryKey: ["activities", quickFilter],
    queryFn: async () => {
      try {
        const filters: any = { page: 1, pageSize: 50 };
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
          </div>

          {/* Activities List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 rounded-lg skeleton" />
              ))}
            </div>
          ) : activities.length === 0 ? (
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
              {activities.map((activity: any) => (
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
