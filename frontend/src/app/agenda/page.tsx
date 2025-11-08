"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, Plus, List, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * CRM IMMOBILIARE - Agenda/Activities Page
 *
 * Calendar and activities management with:
 * - List view with filters
 * - Calendar view (placeholder)
 * - Quick add activity
 *
 * @module pages/agenda
 * @since v3.1.1
 */

type QuickFilter = "all" | "today" | "week" | "overdue";

export default function AgendaPage() {
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  // Fetch activities
  const { data, isLoading } = useQuery({
    queryKey: ["activities", quickFilter],
    queryFn: async () => {
      try {
        const filters: any = { page: 1, pageSize: 50 };
        // Add date filters based on quickFilter
        return await api.activities.list(filters);
      } catch {
        return { activities: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
      }
    },
  });

  const activities = data?.activities || [];

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
              <Button size="lg" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Nuova Attività
              </Button>
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
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
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

      {/* FAB */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl p-0"
        aria-label="Nuova attività"
        disabled
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
