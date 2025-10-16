"use client";

import { useState } from "react";
import { Plus, Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ClientiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Mock counts per tab
  const tabCounts = {
    all: 24,
    hot: 5,
    warm: 8,
    cold: 7,
    inactive: 4,
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Clienti</h1>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuovo Cliente
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto">
              <TabsTrigger value="all" className="gap-2">
                Tutti
                <Badge variant="secondary" className="ml-1">{tabCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="hot" className="gap-2">
                Hot
                <Badge variant="secondary" className="ml-1">{tabCounts.hot}</Badge>
              </TabsTrigger>
              <TabsTrigger value="warm" className="gap-2">
                Warm
                <Badge variant="secondary" className="ml-1">{tabCounts.warm}</Badge>
              </TabsTrigger>
              <TabsTrigger value="cold" className="gap-2">
                Cold
                <Badge variant="secondary" className="ml-1">{tabCounts.cold}</Badge>
              </TabsTrigger>
              <TabsTrigger value="inactive" className="gap-2">
                Inattivi
                <Badge variant="secondary" className="ml-1">{tabCounts.inactive}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search & Filters */}
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca clienti per nome, email, telefono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtri
            </Button>
            <Button variant="outline">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Ordina
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container px-4 py-6">
        <div className="text-center py-12 text-muted-foreground">
          <p>Pagina clienti in costruzione...</p>
          <p className="text-sm mt-2">I componenti ClientCard verranno implementati a breve</p>
        </div>
      </div>
    </div>
  );
}
