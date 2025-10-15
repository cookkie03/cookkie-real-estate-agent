"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BriefingItem {
  label: string;
  value: string | number;
  type: "info" | "warning" | "success" | "alert";
  icon?: React.ReactNode;
}

interface DailyBriefingProps {
  items?: BriefingItem[];
  isLoading?: boolean;
}

const getTypeStyles = (type: string) => {
  const baseStyle = "p-3 rounded-lg border-l-4";
  switch (type) {
    case "alert":
      return `${baseStyle} border-l-priority-high bg-priority-high-bg`;
    case "warning":
      return `${baseStyle} border-l-warning bg-warning-bg`;
    case "success":
      return `${baseStyle} border-l-success bg-success-bg`;
    default:
      return `${baseStyle} border-l-info bg-info-bg`;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "alert":
      return <AlertCircle className="h-4 w-4 text-priority-high" />;
    case "warning":
      return <TrendingUp className="h-4 w-4 text-warning" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    default:
      return <Brain className="h-4 w-4 text-info" />;
  }
};

export function DailyBriefing({ items, isLoading }: DailyBriefingProps) {
  const defaultItems: BriefingItem[] = [
    {
      label: "Appuntamenti oggi",
      value: "3 incontri programmati",
      type: "info",
    },
    {
      label: "Azioni urgenti",
      value: "2 follow-up critici in scadenza",
      type: "alert",
    },
    {
      label: "Lead interessanti",
      value: "5 nuovi match trovati",
      type: "success",
    },
    {
      label: "Performace",
      value: "Incremento 12% rispetto a ieri",
      type: "success",
    },
  ];

  const displayItems = items || defaultItems;

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Briefing giornaliero AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </>
          ) : (
            displayItems.map((item, idx) => (
              <div key={idx} className={getTypeStyles(item.type)}>
                <div className="flex items-start gap-3">
                  {getTypeIcon(item.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {item.label}
                    </p>
                    <p className="font-medium text-sm">{item.value}</p>
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
