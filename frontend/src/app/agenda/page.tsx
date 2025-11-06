"use client";

import { Calendar, Plus } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Agenda</h1>
          <p className="text-muted-foreground">
            Gestisci i tuoi appuntamenti e visite
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nuovo Evento
        </button>
      </div>

      <div className="stat-card">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <h3 className="mb-2 text-lg font-medium">Calendario</h3>
            <p className="text-sm text-muted-foreground">
              Il calendario con gli appuntamenti apparirà qui
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
