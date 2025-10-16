"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Toolbar } from "@/components/Toolbar";
import { SatelliteMap } from "@/components/SatelliteMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  LayoutGrid,
  List,
  MapPin,
  DollarSign,
  Home,
  Filter,
  Map,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Property {
  id: string;
  title: string;
  type: "appartamento" | "villa" | "terreno" | "locale";
  price: number;
  surface: number;
  rooms: number;
  baths: number;
  location: string;
  zone: string;
  image?: string;
  status: "disponibile" | "venduto" | "riservato";
  createdAt: string;
}

const mockProperties: Property[] = [
  {
    id: "1",
    title: "Trilocale con terrazzo",
    type: "appartamento",
    price: 485000,
    surface: 95,
    rooms: 3,
    baths: 2,
    location: "Via Brera 42, Milano",
    zone: "Brera",
    status: "disponibile",
    createdAt: "2 ore fa",
  },
  {
    id: "2",
    title: "Bilocale ristrutturato",
    type: "appartamento",
    price: 320000,
    surface: 60,
    rooms: 2,
    baths: 1,
    location: "Corso Garibaldi 15, Milano",
    zone: "Isola",
    status: "disponibile",
    createdAt: "5 ore fa",
  },
  {
    id: "3",
    title: "Attico panoramico",
    type: "villa",
    price: 890000,
    surface: 150,
    rooms: 4,
    baths: 3,
    location: "Via Montenapoleone 8, Milano",
    zone: "City Life",
    status: "riservato",
    createdAt: "1 giorno fa",
  },
  {
    id: "4",
    title: "Villa indipendente",
    type: "villa",
    price: 1250000,
    surface: 200,
    rooms: 5,
    baths: 4,
    location: "Via San Siro 22, Milano",
    zone: "San Siro",
    status: "disponibile",
    createdAt: "1 giorno fa",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "disponibile":
      return "bg-success-bg text-success border-success/20";
    case "venduto":
      return "bg-muted/30 text-muted-foreground border-border";
    case "riservato":
      return "bg-warning-bg text-warning border-warning/20";
    default:
      return "bg-muted/30 text-muted-foreground border-border";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "disponibile":
      return "Disponibile";
    case "venduto":
      return "Venduto";
    case "riservato":
      return "Riservato";
    default:
      return status;
  }
};

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const filteredProperties = mockProperties.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <TopBar
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="flex-1 flex lg:ml-20">
        <Toolbar />

        <div className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
            {/* Header */}
            <section className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">Immobili</h1>
                <p className="text-muted-foreground mt-1">
                  {filteredProperties.length} proprietà nel database
                </p>
              </div>

              {/* Search & Filters */}
              <div className="flex gap-3 flex-col lg:flex-row lg:items-center">
                <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cerca per indirizzo o titolo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Content */}
            {viewMode === "grid" ? (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProperties.map((property) => (
                  <Card
                    key={property.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    {/* Image Placeholder */}
                    <div className="h-48 bg-gradient-subtle rounded-t-lg flex items-center justify-center">
                      <Home className="h-12 w-12 text-muted-foreground" />
                    </div>

                    <CardContent className="pt-4 space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-sm line-clamp-2">
                            {property.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getStatusColor(property.status)}
                          >
                            {getStatusLabel(property.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 py-2 border-y">
                        <div>
                          <p className="text-xs text-muted-foreground">Superficie</p>
                          <p className="font-medium text-sm">{property.surface}m²</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Stanze</p>
                          <p className="font-medium text-sm">{property.rooms}+{property.baths}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Prezzo</p>
                          <p className="font-semibold text-primary">
                            €{property.price.toLocaleString("it-IT")}
                          </p>
                        </div>
                        <Badge variant="secondary">{property.zone}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>
            ) : (
              <section className="space-y-2">
                {filteredProperties.map((property) => (
                  <Card
                    key={property.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 lg:gap-6">
                        {/* Icon */}
                        <div className="hidden lg:flex p-3 rounded-lg bg-muted/30">
                          <Home className="h-6 w-6 text-muted-foreground" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">
                              {property.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={getStatusColor(property.status)}
                            >
                              {getStatusLabel(property.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {property.location}
                            </div>
                            <span>•</span>
                            <span>{property.surface}m²</span>
                            <span>•</span>
                            <span>{property.rooms} stanze</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Aggiunto {property.createdAt}
                          </p>
                        </div>

                        {/* Price & Zone */}
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-primary">
                            €{(property.price / 1000).toFixed(0)}k
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {property.zone}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
