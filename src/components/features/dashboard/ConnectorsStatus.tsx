"use client";

import { Plug, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Connector } from "@/types";

interface ConnectorsStatusProps {
  connectors: Connector[];
}

const statusConfig = {
  connected: { icon: CheckCircle, color: "text-success", badge: "bg-success/10 text-success border-success/20" },
  error: { icon: XCircle, color: "text-destructive", badge: "bg-destructive/10 text-destructive border-destructive/20" },
  pending: { icon: Clock, color: "text-muted-foreground", badge: "bg-muted text-muted-foreground border-border" },
};

export function ConnectorsStatus({ connectors }: ConnectorsStatusProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5" />
          Connettori & Scraping
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {connectors.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 text-sm">
            Nessun connettore configurato
          </p>
        ) : (
          connectors.map((conn, idx) => {
            const config = statusConfig[conn.status];
            const StatusIcon = config.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <StatusIcon className={`h-5 w-5 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{conn.name}</p>
                      {conn.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Ultimo sync: {conn.lastSync}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={config.badge}>
                    {conn.status}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/connectors")}
        >
          Configura connettori
        </Button>
      </CardContent>
    </Card>
  );
}
