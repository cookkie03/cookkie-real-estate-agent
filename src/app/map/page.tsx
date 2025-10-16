"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Toolbar } from "@/components/Toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Search,
  Filter,
  Home,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Zone {
  name: string;
  properties: number;
  clients: number;
  avgPrice: number;
  trend: "up" | "down" | "stable";
}

const mockZones: Zone[] = [
  {
    name: "Brera",
    properties: 24,
    clients: 8,
    avgPrice: 450000,
    trend: "up",
  },
  {
    name: "Isola",
    properties: 18,
    clients: 12,
    avgPrice: 380000,
    trend: "up",
  },
  {
    name: "Navigli",
    properties: 15,
    clients: 6,
    avgPrice: 420000,
    trend: "stable",
  },
  {
    name: "City Life",
    properties: 12,
    clients: 5,
    avgPrice: 680000,
    trend: "up",
  },
  {
    name: "San Siro",
    properties: 9,
    clients: 3,
    avgPrice: 550000,
    trend: "down",
  },
  {
    name: "Montenapoleone",
    properties: 6,
    clients: 2,
    avgPrice: 950000,
    trend: "up",
  },
];

export default function MapPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredZones = mockZones.filter((z) =>
    z.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <TopBar
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="flex-1 flex lg:ml-20">
        <Toolbar />

        <div className="flex-1 overflow-auto pb-20 lg:pb-0 mb-16">
          <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
            {/* Header */}
            <section className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">Mappa - Zone</h1>
                <p className="text-muted-foreground mt-1">
                  Visualizza proprietà e clienti per zona geografica
                </p>
              </div>

              {/* Search */}
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cerca zone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  />
                </div>

                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </section>

            {/* Map Placeholder */}
            <section className="w-full h-80 rounded-lg border bg-gradient-subtle flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Mappa interattiva - In implementazione
                </p>
              </div>
            </section>

            {/* Zones Grid */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Zone disponibili</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredZones.map((zone) => (
                  <Card
                    key={zone.name}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{zone.name}</CardTitle>
                        {zone.trend === "up" ? (
                          <Badge
                            variant="secondary"
                            className="bg-success-bg text-success"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            In salita
                          </Badge>
                        ) : zone.trend === "down" ? (
                          <Badge
                            variant="secondary"
                            className="bg-priority-high-bg text-priority-high"
                          >
                            In calo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Stabile</Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Home className="h-4 w-4 text-primary" />
                            <p className="text-xs text-muted-foreground">
                              Proprietà
                            </p>
                          </div>
                          <p className="text-xl font-bold">{zone.properties}</p>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-accent" />
                            <p className="text-xs text-muted-foreground">
                              Clienti
                            </p>
                          </div>
                          <p className="text-xl font-bold">{zone.clients}</p>
                        </div>
                      </div>

                      {/* Average Price */}
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground mb-1">
                          Prezzo medio
                        </p>
                        <p className="text-lg font-semibold text-primary">
                          €{(zone.avgPrice / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Summary Stats */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-lg bg-card border hover:shadow-md transition-shadow">
                <p className="text-xs text-muted-foreground mb-2">Total zones</p>
                <p className="text-2xl font-bold">
                  {mockZones.length}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border hover:shadow-md transition-shadow">
                <p className="text-xs text-muted-foreground mb-2">Total properties</p>
                <p className="text-2xl font-bold">
                  {mockZones.reduce((acc, z) => acc + z.properties, 0)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border hover:shadow-md transition-shadow">
                <p className="text-xs text-muted-foreground mb-2">Total clients</p>
                <p className="text-2xl font-bold">
                  {mockZones.reduce((acc, z) => acc + z.clients, 0)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border hover:shadow-md transition-shadow">
                <p className="text-xs text-muted-foreground mb-2">Avg price</p>
                <p className="text-2xl font-bold text-primary">
                  €{(
                    mockZones.reduce((acc, z) => acc + z.avgPrice, 0) /
                    mockZones.length /
                    1000
                  ).toFixed(0)}k
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
