import { TrendingDown, Home, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeedEvent {
  id: string;
  type: "new" | "discount" | "sold";
  title: string;
  time: string;
  zone?: string;
  price?: string;
}

interface ActivityFeedProps {
  events: FeedEvent[];
}

const typeConfig = {
  new: { icon: Home, color: "bg-primary/10 text-primary border-primary/20", label: "Nuovo" },
  discount: { icon: TrendingDown, color: "bg-warning/10 text-warning border-warning/20", label: "Ribasso" },
  sold: { icon: DollarSign, color: "bg-success/10 text-success border-success/20", label: "Venduto" },
};

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Annunci recenti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 text-sm">
            Nessuna attività recente
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => {
              const config = typeConfig[event.type];
              const Icon = config.icon;
              return (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-muted/50">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                        {event.zone && (
                          <span className="text-xs text-muted-foreground">{event.zone}</span>
                        )}
                      </div>
                      <p className="font-medium text-sm mb-1">{event.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{event.time}</span>
                        {event.price && (
                          <>
                            <span>•</span>
                            <span className="font-semibold">{event.price}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
