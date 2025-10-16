"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Toolbar } from "@/components/Toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgendaItem {
  id: string;
  time: string;
  title: string;
  clientName: string;
  address?: string;
  phone?: string;
  email?: string;
  type: "call" | "visit" | "meeting" | "review";
  status: "scheduled" | "completed" | "cancelled";
}

const mockAgendaItems: AgendaItem[] = [
  {
    id: "1",
    time: "10:00",
    title: "Visita trilocale",
    clientName: "Mario Rossi",
    address: "Via Torino 42, Milano",
    phone: "+39 345 123 4567",
    type: "visit",
    status: "scheduled",
  },
  {
    id: "2",
    time: "12:30",
    title: "Consultazione telefonica",
    clientName: "Laura Bianchi",
    phone: "+39 348 765 4321",
    type: "call",
    status: "scheduled",
  },
  {
    id: "3",
    time: "14:30",
    title: "Riunione follow-up",
    clientName: "Giuseppe Verdi",
    address: "Corso Buenos Aires 15, Milano",
    type: "meeting",
    status: "scheduled",
  },
  {
    id: "4",
    time: "16:00",
    title: "Presentazione nuova proprietà",
    clientName: "Anna Neri",
    address: "Via Brera 12, Milano",
    type: "visit",
    status: "scheduled",
  },
  {
    id: "5",
    time: "17:30",
    title: "Revisione contratti",
    clientName: "Ufficio",
    type: "review",
    status: "scheduled",
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "visit":
      return "bg-primary/10 text-primary border-primary/20";
    case "call":
      return "bg-accent/10 text-accent border-accent/20";
    case "meeting":
      return "bg-warning/10 text-warning border-warning/20";
    case "review":
      return "bg-muted/30 text-muted-foreground border-border";
    default:
      return "bg-muted/30 text-muted-foreground border-border";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "visit":
      return "Visita";
    case "call":
      return "Chiamata";
    case "meeting":
      return "Riunione";
    case "review":
      return "Revisione";
    default:
      return type;
  }
};

export default function AgendaPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const todayItems = mockAgendaItems.filter((i) => i.status !== "cancelled");
  const completedCount = todayItems.filter(
    (i) => i.status === "completed"
  ).length;
  const remainingCount = todayItems.filter(
    (i) => i.status === "scheduled"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <TopBar
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="flex-1 flex lg:ml-20">
        <Toolbar />

        <div className="flex-1 overflow-auto pb-20 lg:pb-0 mb-16">
          <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
            {/* Header */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Calendar className="h-8 w-8 text-primary" />
                    Agenda
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Visualizza i tuoi appuntamenti
                  </p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuovo appuntamento
                </Button>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center justify-between bg-card rounded-lg border p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentDate(
                      new Date(currentDate.setDate(currentDate.getDate() - 1))
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="text-center flex-1">
                  <p className="font-semibold">
                    {currentDate.toLocaleDateString("it-IT", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentDate(
                      new Date(currentDate.setDate(currentDate.getDate() + 1))
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-warning-bg border">
                  <p className="text-xs text-muted-foreground mb-1">Da fare</p>
                  <p className="text-2xl font-bold text-warning">
                    {remainingCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success-bg border">
                  <p className="text-xs text-muted-foreground mb-1">
                    Completati
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {completedCount}
                  </p>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section className="space-y-3">
              {todayItems.length > 0 ? (
                todayItems.map((item, idx) => (
                  <div key={item.id}>
                    {/* Time divider */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-sm font-semibold text-muted-foreground px-2 bg-background">
                        {item.time}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Item card */}
                    <Card
                      className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow mb-3 ${
                        item.type === "visit"
                          ? "border-l-primary"
                          : item.type === "call"
                          ? "border-l-accent"
                          : "border-l-warning"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4 lg:gap-6">
                          {/* Left: Title & Type */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold text-lg">
                                {item.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className={getTypeColor(item.type)}
                              >
                                {getTypeLabel(item.type)}
                              </Badge>
                            </div>

                            <p className="text-sm font-medium text-muted-foreground mb-3">
                              {item.clientName}
                            </p>

                            {/* Contact Details */}
                            <div className="space-y-2">
                              {item.address && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  {item.address}
                                </div>
                              )}
                              {item.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                  <Phone className="h-4 w-4 flex-shrink-0" />
                                  {item.phone}
                                </div>
                              )}
                              {item.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                  <Mail className="h-4 w-4 flex-shrink-0" />
                                  {item.email}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex gap-2 flex-shrink-0">
                            {item.status === "scheduled" && (
                              <>
                                <Button size="sm" variant="outline">
                                  Completa
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  Annulla
                                </Button>
                              </>
                            )}
                            {item.status === "completed" && (
                              <Badge className="bg-success">Completato</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">
                      Nessun appuntamento programmato per oggi
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
