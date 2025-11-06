"use client";

import { Home, Plus } from "lucide-react";

export default function BuildingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Censimento Edifici</h1>
          <p className="text-muted-foreground">
            Gestisci il database degli edifici
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nuovo Edificio
        </button>
      </div>

      <div className="stat-card">
        <div className="py-12 text-center">
          <Home className="mx-auto mb-4 h-12 w-12 opacity-20" />
          <h3 className="mb-2 text-lg font-medium">Censimento Edifici</h3>
          <p className="text-sm text-muted-foreground">
            I tuoi edifici appariranno qui
          </p>
        </div>
      </div>
    </div>
  );
}
