"use client";

import { Search, Plus } from "lucide-react";

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Richieste</h1>
          <p className="text-muted-foreground">Gestisci le richieste di ricerca dei clienti</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nuova Richiesta
        </button>
      </div>

      <div className="stat-card">
        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 opacity-20" />
          <h3 className="mb-2 text-lg font-medium">Richieste</h3>
          <p className="text-sm text-muted-foreground">
            Le richieste di ricerca dei clienti appariranno qui
          </p>
        </div>
      </div>
    </div>
  );
}
