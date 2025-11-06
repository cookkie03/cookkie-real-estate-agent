"use client";

import { Target, Sparkles } from "lucide-react";

export default function MatchingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Matching AI</h1>
        <p className="text-muted-foreground">
          Trova le corrispondenze perfette tra richieste e immobili
        </p>
      </div>

      <div className="stat-card">
        <div className="py-12 text-center">
          <div className="relative mx-auto mb-4 h-12 w-12">
            <Target className="h-12 w-12 opacity-20" />
            <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-medium">Matching Intelligente</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Utilizza l'AI per trovare le migliori corrispondenze
          </p>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Genera Match
          </button>
        </div>
      </div>
    </div>
  );
}
