"use client";

import { Calendar, Phone, MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AgendaItem } from "@/types";

interface MiniAgendaProps {
  items: AgendaItem[];
}

export function MiniAgenda({ items }: MiniAgendaProps) {
  const router = useRouter();

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agenda di oggi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nessun appuntamento oggi — crea da /agenda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Agenda di oggi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-primary">{item.time}</span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="font-medium truncate">{item.client}</span>
                </div>
                <p className="text-sm mb-1">{item.title}</p>
                {item.address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.address}
                  </p>
                )}
              </div>
              <Button size="sm" variant="ghost" className="shrink-0">
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/agenda")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Vedi tutto
        </Button>
      </CardContent>
    </Card>
  );
}
