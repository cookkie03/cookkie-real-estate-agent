import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: "urgent" | "high" | "medium" | "low";
  size?: "sm" | "md";
  className?: string;
}

const priorityConfig = {
  urgent: {
    label: "Urgente",
    className: "bg-priority-urgent/10 text-priority-urgent border-priority-urgent/20 hover:bg-priority-urgent/20",
  },
  high: {
    label: "Alta",
    className: "bg-priority-high/10 text-priority-high border-priority-high/20 hover:bg-priority-high/20",
  },
  medium: {
    label: "Media",
    className: "bg-priority-medium/10 text-priority-medium border-priority-medium/20 hover:bg-priority-medium/20",
  },
  low: {
    label: "Bassa",
    className: "bg-priority-low/10 text-priority-low border-priority-low/20 hover:bg-priority-low/20",
  },
};

const sizeStyles = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-1",
};

export function PriorityBadge({ priority, size = "md", className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium transition-colors",
        config.className,
        sizeStyles[size],
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
