"use client";

import { Sparkles, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ActionItem {
  id: string;
  label: string;
  reason: string;
  score?: number;
}

interface ActionList {
  title: string;
  icon: any;
  items: ActionItem[];
  variant?: "default" | "success" | "warning";
}

interface SuggestedActionsProps {
  lists: ActionList[];
}

const variantStyles = {
  default: "border-l-primary",
  success: "border-l-success",
  warning: "border-l-warning",
};

export function SuggestedActions({ lists }: SuggestedActionsProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Azioni suggerite dalla AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {lists.map((list, idx) => {
          const Icon = list.icon;
          return (
            <div key={idx} className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {list.title}
              </h3>
              <div className="space-y-2">
                {list.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Nessuna azione al momento
                  </p>
                ) : (
                  list.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border-l-4 bg-card hover:bg-muted/30 transition-colors cursor-pointer ${
                        variantStyles[list.variant || "default"]
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm mb-1">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.reason}</p>
                        </div>
                        {item.score !== undefined && (
                          <span className="text-xs font-bold text-primary whitespace-nowrap">
                            {Math.round(item.score * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/actions")}
        >
          Vedi tutte le azioni
        </Button>
      </CardContent>
    </Card>
  );
}
