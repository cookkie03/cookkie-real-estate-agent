"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Filter, Plus, Home, MapPin, Euro, Bed, Bath, Square } from "lucide-react";

export default function ImmobiliPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data per gli immobili
  const immobili = [
    {
      id: 1,
      tipo: "Appartamento",
      indirizzo: "Via Torino 42, Milano",
      prezzo: 350000,
      mq: 85,
      locali: 3,
      bagni: 2,
      status: "Disponibile",
      immagine: "/placeholder.svg"
    },
    {
      id: 2,
      tipo: "Villa",
      indirizzo: "Corso Buenos Aires 15, Milano",
      prezzo: 850000,
      mq: 220,
      locali: 5,
      bagni: 3,
      status: "In trattativa",
      immagine: "/placeholder.svg"
    },
    {
      id: 3,
      tipo: "Attico",
      indirizzo: "Via Montenapoleone 8, Milano",
      prezzo: 1200000,
      mq: 150,
      locali: 4,
      bagni: 3,
      status: "Disponibile",
      immagine: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Home
          </Button>
          <h1 className="text-xl font-bold">Immobili</h1>
        </div>
      </header>

      <div className="container px-4 py-8">
        {/* Search and Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca immobili per indirizzo, tipo, zona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtri
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Immobile
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Totale Immobili</CardDescription>
              <CardTitle className="text-3xl">24</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Disponibili</CardDescription>
              <CardTitle className="text-3xl text-green-600">18</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Trattativa</CardDescription>
              <CardTitle className="text-3xl text-orange-600">4</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Venduti (mese)</CardDescription>
              <CardTitle className="text-3xl text-blue-600">2</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Immobili List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {immobili.map((immobile) => (
            <Card key={immobile.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video bg-muted relative">
                <div className="absolute top-2 right-2">
                  <Badge variant={immobile.status === "Disponibile" ? "default" : "secondary"}>
                    {immobile.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-center h-full">
                  <Home className="h-16 w-16 text-muted-foreground/30" />
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{immobile.tipo}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {immobile.indirizzo}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                    <Euro className="h-5 w-5" />
                    {immobile.prezzo.toLocaleString()}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Square className="h-4 w-4" />
                    {immobile.mq} m²
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    {immobile.locali} locali
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    {immobile.bagni} bagni
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
