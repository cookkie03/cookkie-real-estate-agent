"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Toolbar } from "@/components/Toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  LayoutGrid,
  List,
  Phone,
  Mail,
  User,
  Filter,
  Plus,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  type: "buyer" | "seller" | "owner";
  priority: "alta" | "media" | "bassa";
  status: "attivo" | "in_trattativa" | "concluso";
  budgetMin?: number;
  budgetMax?: number;
  zone?: string;
  lastContact?: string;
  notes?: string;
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Mario",
    surname: "Rossi",
    email: "mario.rossi@email.com",
    phone: "+39 345 123 4567",
    type: "buyer",
    priority: "alta",
    status: "attivo",
    budgetMin: 350000,
    budgetMax: 450000,
    zone: "Brera",
    lastContact: "12 ore fa",
  },
  {
    id: "2",
    name: "Laura",
    surname: "Bianchi",
    email: "laura.bianchi@email.com",
    phone: "+39 348 765 4321",
    type: "buyer",
    priority: "alta",
    status: "attivo",
    budgetMin: 200000,
    budgetMax: 300000,
    zone: "Isola",
    lastContact: "3 giorni fa",
  },
  {
    id: "3",
    name: "Giuseppe",
    surname: "Verdi",
    phone: "+39 340 987 6543",
    type: "seller",
    priority: "media",
    status: "in_trattativa",
    zone: "City Life",
    lastContact: "25 giorni fa",
  },
  {
    id: "4",
    name: "Anna",
    surname: "Neri",
    phone: "+39 333 456 7890",
    type: "owner",
    priority: "bassa",
    status: "attivo",
    lastContact: "45 giorni fa",
  },
  {
    id: "5",
    name: "Paolo",
    surname: "Gialli",
    email: "paolo.gialli@email.com",
    phone: "+39 347 234 5678",
    type: "buyer",
    priority: "media",
    status: "attivo",
    budgetMin: 500000,
    budgetMax: 600000,
    zone: "Navigli",
    lastContact: "8 giorni fa",
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "alta":
      return "bg-priority-high-bg text-priority-high border-priority-high/20";
    case "media":
      return "bg-warning-bg text-warning border-warning/20";
    default:
      return "bg-priority-low-bg text-priority-low border-priority-low/20";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "attivo":
      return "bg-success-bg text-success border-success/20";
    case "in_trattativa":
      return "bg-warning-bg text-warning border-warning/20";
    case "concluso":
      return "bg-muted/30 text-muted-foreground border-border";
    default:
      return "bg-muted/30 text-muted-foreground border-border";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "buyer":
      return "Acquirente";
    case "seller":
      return "Venditore";
    case "owner":
      return "Proprietario";
    default:
      return type;
  }
};

export default function ClientsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredClients = mockClients.filter((c) => {
    const matchesSearch =
      `${c.name} ${c.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery);

    const matchesType = filterType === "all" || c.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <TopBar
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="flex-1 flex lg:ml-20">
        <Toolbar />

        <div className="flex-1 overflow-auto pb-20 lg:pb-0 mb-16">
          <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
            {/* Header */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Clienti</h1>
                  <p className="text-muted-foreground mt-1">
                    {filteredClients.length} clienti trovati
                  </p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuovo cliente
                </Button>
              </div>

              {/* Search & Filters */}
              <div className="flex gap-3 flex-col lg:flex-row lg:items-center">
                <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cerca per nome, email o telefono..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 rounded-lg border bg-card text-sm outline-none"
                  >
                    <option value="all">Tutti i tipi</option>
                    <option value="buyer">Acquirenti</option>
                    <option value="seller">Venditori</option>
                    <option value="owner">Proprietari</option>
                  </select>

                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>

                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Content */}
            {viewMode === "grid" ? (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map((client) => (
                  <Card
                    key={client.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">
                              {client.name} {client.surname}
                            </h3>
                            <Badge variant="outline" className="text-xs mt-1">
                              {getTypeLabel(client.type)}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(client.priority)}
                        >
                          {client.priority === "alta"
                            ? "Urgente"
                            : client.priority === "media"
                            ? "Medio"
                            : "Basso"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Contact Info */}
                      <div className="space-y-2">
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="pt-2 border-t space-y-2 text-xs">
                        {client.zone && (
                          <div>
                            <p className="text-muted-foreground">Zone preferite</p>
                            <p className="font-medium">{client.zone}</p>
                          </div>
                        )}
                        {client.budgetMin && client.budgetMax && (
                          <div>
                            <p className="text-muted-foreground">Budget</p>
                            <p className="font-medium">
                              €{(client.budgetMin / 1000).toFixed(0)}k - €{(client.budgetMax / 1000).toFixed(0)}k
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Ultimo contatto</p>
                          <p className="font-medium">{client.lastContact || "Mai"}</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="pt-2 border-t">
                        <Badge
                          variant="outline"
                          className={getStatusColor(client.status)}
                        >
                          {client.status === "attivo"
                            ? "Attivo"
                            : client.status === "in_trattativa"
                            ? "In trattativa"
                            : "Concluso"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>
            ) : (
              <section className="space-y-2">
                {filteredClients.map((client) => (
                  <Card
                    key={client.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 lg:gap-6">
                        {/* Avatar */}
                        <div className="hidden lg:flex h-12 w-12 rounded-full bg-primary/10 flex-shrink-0 items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {client.name} {client.surname}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(client.type)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getPriorityColor(client.priority)}
                            >
                              {client.priority === "alta"
                                ? "Urgente"
                                : client.priority === "media"
                                ? "Medio"
                                : "Basso"}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                            {client.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {client.phone}
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground">
                            Ultimo contatto: {client.lastContact || "Mai"}
                          </p>
                        </div>

                        {/* Budget & Status */}
                        <div className="text-right flex-shrink-0">
                          {client.budgetMin && (
                            <p className="text-sm font-medium text-primary">
                              €{(client.budgetMin / 1000).toFixed(0)}k
                            </p>
                          )}
                          <Badge
                            variant="outline"
                            className={getStatusColor(client.status)}
                          >
                            {client.status === "attivo"
                              ? "Attivo"
                              : client.status === "in_trattativa"
                              ? "Trattativa"
                              : "Concluso"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
