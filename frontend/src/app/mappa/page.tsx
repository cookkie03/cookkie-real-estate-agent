"use client";

import { Map } from "lucide-react";

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Mappa Interattiva</h1>
        <p className="text-muted-foreground">
          Visualizza tutti gli immobili e edifici sulla mappa
        </p>
      </div>

      <div className="stat-card">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Map className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <h3 className="mb-2 text-lg font-medium">Mappa Interattiva</h3>
            <p className="text-sm text-muted-foreground">
              La mappa con gli immobili apparirà qui
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
