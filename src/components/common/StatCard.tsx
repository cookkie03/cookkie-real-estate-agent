import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  variant?: "default" | "urgent" | "success" | "warning" | "primary" | "accent";
  onClick?: () => void;
  className?: string;
}

const variantStyles = {
  default: "bg-card hover:bg-muted/50 border-border",
  urgent: "bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20 hover:border-destructive/30",
  success: "bg-gradient-to-br from-success/10 to-success/5 border-success/20 hover:border-success/30",
  warning: "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 hover:border-warning/30",
  primary: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/30",
  accent: "bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover:border-accent/30",
};

const iconStyles = {
  default: "text-primary",
  urgent: "text-destructive",
  success: "text-success",
  warning: "text-warning",
  primary: "text-primary",
  accent: "text-accent",
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-muted-foreground",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "default",
  onClick,
  className,
}: StatCardProps) {
  const TrendIcon = trend ? trendIcons[trend.direction] : null;

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        variantStyles[variant],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className={cn("p-2 rounded-lg bg-background/50", iconStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {trend && TrendIcon && (
            <div className={cn("flex items-center gap-1 text-sm", trendColors[trend.direction])}>
              <TrendIcon className="h-4 w-4" />
              <span className="font-medium">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
