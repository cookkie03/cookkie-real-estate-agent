import { useState } from "react";
import { Search, Phone, MessageCircle, ExternalLink, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Contact {
  id: string;
  name: string;
  role: "buyer" | "seller" | "owner";
  phone?: string;
  lastTouchDays?: number;
  budget?: string;
}

interface QuickDialerProps {
  contacts: Contact[];
}

const roleColors = {
  buyer: "bg-accent/10 text-accent border-accent/20",
  seller: "bg-primary/10 text-primary border-primary/20",
  owner: "bg-muted text-muted-foreground border-border",
};

export function QuickDialer({ contacts }: QuickDialerProps) {
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Rubrica intelligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca contatti..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Nessun contatto trovato
            </p>
          ) : (
            filtered.map((contact) => (
              <div
                key={contact.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{contact.name}</p>
                      <Badge variant="outline" className={roleColors[contact.role]}>
                        {contact.role}
                      </Badge>
                    </div>
                    {contact.budget && (
                      <p className="text-xs text-muted-foreground mb-1">
                        Budget: {contact.budget}
                      </p>
                    )}
                    {contact.lastTouchDays !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        Ultimo contatto: {contact.lastTouchDays} giorni fa
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
