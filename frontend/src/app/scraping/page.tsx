"use client";

import { Globe, Play } from "lucide-react";

export default function ScrapingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Web Scraping</h1>
        <p className="text-muted-foreground">
          Importa immobili da portali immobiliari
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <h3 className="font-medium mb-2">Immobiliare.it</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Importa annunci da Immobiliare.it
          </p>
          <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-accent w-full justify-center">
            <Play className="h-4 w-4" />
            Avvia Scraping
          </button>
        </div>

        <div className="stat-card">
          <h3 className="font-medium mb-2">Casa.it</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Importa annunci da Casa.it
          </p>
          <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-accent w-full justify-center">
            <Play className="h-4 w-4" />
            Avvia Scraping
          </button>
        </div>

        <div className="stat-card">
          <h3 className="font-medium mb-2">Idealista</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Importa annunci da Idealista
          </p>
          <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-accent w-full justify-center">
            <Play className="h-4 w-4" />
            Avvia Scraping
          </button>
        </div>
      </div>

      <div className="stat-card">
        <h2 className="section-header">Cronologia Scraping</h2>
        <p className="text-sm text-muted-foreground">
          Lo storico delle operazioni di scraping apparirà qui
        </p>
      </div>
    </div>
  );
}
