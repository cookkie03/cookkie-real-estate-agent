"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MapPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="container max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alla home
        </Button>

        <div className="text-center py-16">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Mappa Copertura Zone</h1>
          <p className="text-lg text-muted-foreground">
            Coming soon: Visualizzazione interattiva zone con heatmap e filtri avanzati
          </p>
        </div>
      </div>
    </div>
  );
}
