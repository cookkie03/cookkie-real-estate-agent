import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatPillProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: "default" | "urgent" | "success" | "warning";
  onClick?: () => void;
}

const variantStyles = {
  default: "bg-card hover:bg-muted/50 border-border",
  urgent: "bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20 hover:border-destructive/30",
  success: "bg-gradient-to-br from-success/10 to-success/5 border-success/20 hover:border-success/30",
  warning: "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 hover:border-warning/30",
};

const iconStyles = {
  default: "text-primary",
  urgent: "text-destructive",
  success: "text-success",
  warning: "text-warning",
};

export function StatPill({ label, value, icon: Icon, variant = "default", onClick }: StatPillProps) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${variantStyles[variant]}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-background/50 ${iconStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground truncate">{label}</p>
        </div>
      </div>
    </Card>
  );
}
