"use client";

import { LucideIcon } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";

export interface QuickAction {
  type: string;
  label: string;
  count: number;
  icon: LucideIcon;
  variant: "urgent" | "success" | "warning" | "default";
  route: string;
}

interface QuickActionPillsProps {
  actions: QuickAction[];
  onActionClick?: (route: string) => void;
}

export function QuickActionPills({ actions, onActionClick }: QuickActionPillsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <div
          key={action.type}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <StatCard
            label={action.label}
            value={action.count}
            icon={action.icon}
            variant={action.variant}
            onClick={() => onActionClick?.(action.route)}
          />
        </div>
      ))}
    </div>
  );
}
