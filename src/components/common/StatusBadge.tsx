import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type: "client" | "property";
  size?: "sm" | "md";
  className?: string;
}

const clientStatusConfig: Record<string, { label: string; className: string }> = {
  hot: {
    label: "Hot",
    className: "bg-client-hot/10 text-client-hot border-client-hot/20 hover:bg-client-hot/20",
  },
  warm: {
    label: "Warm",
    className: "bg-client-warm/10 text-client-warm border-client-warm/20 hover:bg-client-warm/20",
  },
  cold: {
    label: "Cold",
    className: "bg-client-cold/10 text-client-cold border-client-cold/20 hover:bg-client-cold/20",
  },
  inactive: {
    label: "Inattivo",
    className: "bg-client-inactive/10 text-client-inactive border-client-inactive/20 hover:bg-client-inactive/20",
  },
  active: {
    label: "Attivo",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  },
  archived: {
    label: "Archiviato",
    className: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  },
};

const propertyStatusConfig: Record<string, { label: string; className: string }> = {
  available: {
    label: "Disponibile",
    className: "bg-property-available/10 text-property-available border-property-available/20 hover:bg-property-available/20",
  },
  reserved: {
    label: "Riservato",
    className: "bg-property-reserved/10 text-property-reserved border-property-reserved/20 hover:bg-property-reserved/20",
  },
  sold: {
    label: "Venduto",
    className: "bg-property-sold/10 text-property-sold border-property-sold/20 hover:bg-property-sold/20",
  },
  rented: {
    label: "Affittato",
    className: "bg-property-sold/10 text-property-sold border-property-sold/20 hover:bg-property-sold/20",
  },
  draft: {
    label: "Bozza",
    className: "bg-property-draft/10 text-property-draft border-property-draft/20 hover:bg-property-draft/20",
  },
  suspended: {
    label: "Sospeso",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
  },
  archived: {
    label: "Archiviato",
    className: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  },
};

const sizeStyles = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-1",
};

export function StatusBadge({ status, type, size = "md", className }: StatusBadgeProps) {
  const config = type === "client"
    ? clientStatusConfig[status] || clientStatusConfig.active
    : propertyStatusConfig[status] || propertyStatusConfig.draft;

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
