"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Calendar,
  MessageSquare,
  Eye,
  ChevronRight,
  AlertCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface ActionClient {
  id: string;
  name: string;
  priority?: "high" | "medium" | "low";
  lastContact?: string;
}

interface ActionCategory {
  id: string;
  type: "call" | "visit" | "email" | "meeting" | "follow_up" | "review";
  label: string;
  count: number;
  clients: ActionClient[];
  color:
    | "priority-high"
    | "priority-medium"
    | "priority-low"
    | "warning"
    | "success";
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface ActionCategoriesProps {
  categories?: ActionCategory[];
  onViewAll?: () => void;
}

const defaultCategories: ActionCategory[] = [
  {
    id: "1",
    type: "call",
    label: "Chiamate urgenti",
    count: 5,
    color: "priority-high",
    icon: Phone,
    description: "Clienti richiedono follow-up immediato",
    clients: [
      { id: "1", name: "Mario Rossi", priority: "high", lastContact: "3 giorni fa" },
      { id: "2", name: "Laura Bianchi", priority: "high", lastContact: "5 giorni fa" },
    ],
  },
  {
    id: "2",
    type: "visit",
    label: "Visite programmate",
    count: 3,
    color: "warning",
    icon: Calendar,
    description: "Appuntamenti di oggi e domani",
    clients: [
      { id: "3", name: "Giuseppe Verdi", priority: "medium" },
      { id: "4", name: "Anna Neri", priority: "medium" },
    ],
  },
  {
    id: "3",
    type: "follow_up",
    label: "Follow-up post visita",
    count: 4,
    color: "priority-medium",
    icon: MessageSquare,
    description: "Clienti da contattare dopo visita",
    clients: [
      { id: "5", name: "Paolo Gialli", priority: "medium" },
    ],
  },
  {
    id: "4",
    type: "review",
    label: "Nuovi lead",
    count: 2,
    color: "success",
    icon: TrendingUp,
    description: "Nuovi potenziali clienti da contattare",
    clients: [
      { id: "6", name: "Marco Blu", priority: "low" },
    ],
  },
];

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "high":
      return "bg-priority-high-bg text-priority-high border-priority-high/20";
    case "medium":
      return "bg-warning-bg text-warning border-warning/20";
    default:
      return "bg-priority-low-bg text-priority-low border-priority-low/20";
  }
};

const getCategoryBgColor = (color: string) => {
  switch (color) {
    case "priority-high":
      return "bg-priority-high-bg border-priority-high/20";
    case "priority-medium":
      return "bg-priority-medium-bg border-priority-medium/20";
    case "priority-low":
      return "bg-priority-low-bg border-priority-low/20";
    case "warning":
      return "bg-warning-bg border-warning/20";
    case "success":
      return "bg-success-bg border-success/20";
    default:
      return "bg-muted/30 border-border";
  }
};

export function ActionCategories({
  categories = defaultCategories,
  onViewAll,
}: ActionCategoriesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Categorie azioni
        </h2>
        <Link href="/actions">
          <Button variant="ghost" size="sm" className="gap-2">
            Vedi tutto
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.id}
              className={`border ${getCategoryBgColor(category.color)} cursor-pointer hover:shadow-md transition-shadow`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-background/50">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">{category.label}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    {category.count}
                  </Badge>
                </div>
              </CardHeader>

              {category.clients.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    {category.clients.slice(0, 2).map((client) => (
                      <div
                        key={client.id}
                        className="p-2 rounded-lg bg-background/40 hover:bg-background/60 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {client.name}
                          </p>
                          {client.lastContact && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {client.lastContact}
                            </p>
                          )}
                        </div>
                        {client.priority && (
                          <Badge
                            variant="outline"
                            className={`ml-2 flex-shrink-0 text-xs ${getPriorityColor(
                              client.priority
                            )}`}
                          >
                            {client.priority === "high"
                              ? "Urgente"
                              : client.priority === "medium"
                              ? "Medio"
                              : "Basso"}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {category.clients.length > 2 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          +{category.clients.length - 2} altri
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
