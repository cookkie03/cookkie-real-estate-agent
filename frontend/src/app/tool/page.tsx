"use client";

import { Wrench, Database, Server, Activity } from "lucide-react";

export default function ToolPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Strumenti di Sistema</h1>
        <p className="text-muted-foreground">
          Monitoraggio e strumenti tecnici
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-950 p-3">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Database</h3>
              <p className="text-sm text-muted-foreground">Stato e statistiche</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stato:</span>
              <span className="font-medium text-green-600">✓ Connesso</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-green-100 dark:bg-green-950 p-3">
              <Server className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Backend API</h3>
              <p className="text-sm text-muted-foreground">Stato del server</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Endpoint:</span>
              <span className="font-medium text-xs">
                {process.env.NEXT_PUBLIC_API_URL || "localhost:3001"}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-purple-100 dark:bg-purple-950 p-3">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium">AI Tools</h3>
              <p className="text-sm text-muted-foreground">Servizi AI</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stato:</span>
              <span className="font-medium">In attesa di configurazione</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-orange-100 dark:bg-orange-950 p-3">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium">Logs</h3>
              <p className="text-sm text-muted-foreground">Log di sistema</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">I log di sistema appariranno qui</p>
          </div>
        </div>
      </div>
    </div>
  );
}
