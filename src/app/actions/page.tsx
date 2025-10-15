"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Toolbar } from "@/components/Toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Calendar,
  MessageSquare,
  Eye,
  Filter,
  Plus,
  Zap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Action {
  id: string;
  type: "call" | "visit" | "email" | "follow_up" | "review";
  title: string;
  description: string;
  clientName: string;
  priority: "alta" | "media" | "bassa";
  status: "da_fare" | "in_corso" | "completata";
  dueDate: string;
  daysOverdue?: number;
}

const mockActions: Action[] = [
  {
    id: "1",
    type: "call",
    title: "Chiamata di follow-up",
    description: "Discutere della visita di oggi",
    clientName: "Mario Rossi",
    priority: "alta",
    status: "da_fare",
    dueDate: "Oggi",
  },
  {
    id: "2",
    type: "visit",
    title: "Visita immobile",
    description: "Trilocale Via Brera 42",
    clientName: "Laura Bianchi",
    priority: "alta",
    status: "da_fare",
    dueDate: "Oggi, 14:30",
  },
  {
    id: "3",
    type: "email",
    title: "Invia contratto proposta",
    description: "Allega documentazione",
    clientName: "Giuseppe Verdi",
    priority: "media",
    status: "da_fare",
    dueDate: "Domani",
  },
  {
    id: "4",
    type: "follow_up",
    title: "Follow-up post visita",
    description: "Chiedere impressioni e interessi",
    clientName: "Anna Neri",
    priority: "media",
    status: "in_corso",
    dueDate: "Domani",
  },
  {
    id: "5",
    type: "review",
    title: "Aggiornamento dati proprietà",
    description: "Verificare foto e descrizione",
    clientName: "Sistema",
    priority: "bassa",
    status: "completata",
    dueDate: "Ieri",
    daysOverdue: 1,
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "call":
      return Phone;
    case "visit":
      return Calendar;
    case "email":
      return MessageSquare;
    case "follow_up":
      return Eye;
    default:
      return AlertCircle;
  }
};

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
    case "completata":
      return "text-success";
    case "in_corso":
      return "text-warning";
    default:
      return "text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completata":
      return <CheckCircle2 className="h-5 w-5" />;
    case "in_corso":
      return <AlertCircle className="h-5 w-5" />;
    default:
      return null;
  }
};

export default function ActionsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredActions = mockActions.filter((a) => {
    const matchesPriority = filterPriority === "all" || a.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    return matchesPriority && matchesStatus;
  });

  const actionsByStatus = {
    da_fare: filteredActions.filter((a) => a.status === "da_fare").length,
    in_corso: filteredActions.filter((a) => a.status === "in_corso").length,
    completata: filteredActions.filter((a) => a.status === "completata").length,
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <TopBar
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="flex-1 flex lg:ml-20">
        <Toolbar />

        <div className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
            {/* Header */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Zap className="h-8 w-8 text-primary" />
                    Azioni
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Gestisci le tue attività e follow-up
                  </p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuova azione
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-priority-high-bg border">
                  <p className="text-xs text-muted-foreground mb-1">Da fare</p>
                  <p className="text-2xl font-bold text-priority-high">
                    {actionsByStatus.da_fare}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning-bg border">
                  <p className="text-xs text-muted-foreground mb-1">In corso</p>
                  <p className="text-2xl font-bold text-warning">
                    {actionsByStatus.in_corso}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success-bg border">
                  <p className="text-xs text-muted-foreground mb-1">
                    Completate
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {actionsByStatus.completata}
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3 flex-wrap">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-card text-sm outline-none"
                >
                  <option value="all">Tutte le priorità</option>
                  <option value="alta">Priorità Alta</option>
                  <option value="media">Priorità Media</option>
                  <option value="bassa">Priorità Bassa</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-card text-sm outline-none"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="da_fare">Da fare</option>
                  <option value="in_corso">In corso</option>
                  <option value="completata">Completata</option>
                </select>

                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </section>

            {/* Actions List */}
            <section className="space-y-3">
              {filteredActions.length > 0 ? (
                filteredActions.map((action) => {
                  const TypeIcon = getTypeIcon(action.type);
                  return (
                    <Card
                      key={action.id}
                      className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                        action.priority === "alta"
                          ? "border-l-priority-high"
                          : action.priority === "media"
                          ? "border-l-warning"
                          : "border-l-priority-low"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4 lg:gap-6">
                          {/* Icon */}
                          <div className="hidden lg:flex p-3 rounded-lg bg-muted/30 flex-shrink-0">
                            <TypeIcon className="h-6 w-6 text-muted-foreground" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold">{action.title}</h3>
                              <Badge
                                variant="outline"
                                className={getPriorityColor(action.priority)}
                              >
                                {action.priority === "alta"
                                  ? "Urgente"
                                  : action.priority === "media"
                                  ? "Medio"
                                  : "Basso"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {action.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Cliente: {action.clientName}</span>
                              <span>•</span>
                              <span>{action.dueDate}</span>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="flex-shrink-0">
                            {action.status === "completata" ? (
                              <div className="text-center">
                                <CheckCircle2 className="h-6 w-6 text-success mx-auto" />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Completata
                                </p>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline">
                                {action.status === "da_fare"
                                  ? "Inizia"
                                  : "Completa"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">
                      Nessuna azione trovata con i filtri selezionati
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
