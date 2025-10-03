import { MapPin, Building, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AreaStats {
  medianPrice: number;
  timeToSell: number;
  trend: "up" | "down" | "stable";
}

interface IntelToolkitProps {
  areaStats?: AreaStats;
  buildingInfo?: { status: string; notes?: string };
  similars?: Array<{ id: string; title: string; score: number }>;
}

export function IntelToolkit({ areaStats, buildingInfo, similars = [] }: IntelToolkitProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Toolkit informativo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="area" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="area">Via/Quartiere</TabsTrigger>
            <TabsTrigger value="building">Edificio</TabsTrigger>
            <TabsTrigger value="similars">Simili</TabsTrigger>
          </TabsList>

          <TabsContent value="area" className="space-y-4 mt-4">
            {areaStats ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Prezzo mediano</p>
                    <p className="text-lg font-bold">{areaStats.medianPrice.toLocaleString()} €/mq</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Tempo medio</p>
                    <p className="text-lg font-bold">{areaStats.timeToSell} giorni</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate("/map")}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Apri in mappa
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8 text-sm">
                Dati area non disponibili
              </p>
            )}
          </TabsContent>

          <TabsContent value="building" className="space-y-4 mt-4">
            {buildingInfo ? (
              <>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Stato: {buildingInfo.status}</p>
                  {buildingInfo.notes && (
                    <p className="text-xs text-muted-foreground">{buildingInfo.notes}</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8 text-sm">
                Info edificio non disponibili
              </p>
            )}
          </TabsContent>

          <TabsContent value="similars" className="space-y-3 mt-4">
            {similars.length > 0 ? (
              <>
                {similars.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{item.title}</p>
                      <span className="text-xs font-semibold text-primary">
                        {Math.round(item.score * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8 text-sm">
                Nessun immobile simile trovato
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
