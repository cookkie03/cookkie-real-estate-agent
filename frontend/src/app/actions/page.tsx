"use client";

import { CheckSquare, Plus } from "lucide-react";

export default function ActionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Azioni Suggerite</h1>
          <p className="text-muted-foreground">
            Le azioni suggerite dall'AI per aumentare le conversioni
          </p>
        </div>
      </div>

      <div className="stat-card">
        <div className="py-12 text-center">
          <CheckSquare className="mx-auto mb-4 h-12 w-12 opacity-20" />
          <h3 className="mb-2 text-lg font-medium">Azioni Suggerite</h3>
          <p className="text-sm text-muted-foreground">
            L'AI suggerirà azioni prioritarie basate sui tuoi dati
          </p>
        </div>
      </div>
    </div>
  );
}
