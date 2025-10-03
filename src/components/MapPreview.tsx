import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MapPreviewProps {
  zones?: Array<{ name: string; dormant: number; inSale: number; owned: number }>;
}

export function MapPreview({ zones = [] }: MapPreviewProps) {
  const navigate = useNavigate();

  const total = zones.reduce((acc, z) => ({
    dormant: acc.dormant + z.dormant,
    inSale: acc.inSale + z.inSale,
    owned: acc.owned + z.owned,
  }), { dormant: 0, inSale: 0, owned: 0 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mappa copertura zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.1),transparent_50%)]" />
          <div className="relative z-10 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Anteprima mappa</p>
          </div>
        </div>

        {zones.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Dormienti</p>
              <p className="text-lg font-bold">{total.dormant}</p>
            </div>
            <div className="p-2 rounded bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">In vendita</p>
              <p className="text-lg font-bold">{total.inSale}</p>
            </div>
            <div className="p-2 rounded bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Tuoi</p>
              <p className="text-lg font-bold">{total.owned}</p>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/map")}
        >
          Apri mappa completa
        </Button>
      </CardContent>
    </Card>
  );
}
