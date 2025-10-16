/**
 * PAGE TEMPLATE - RealEstate AI
 * 
 * Template standard per pagine secondarie (accessibili dalla toolbar)
 * Usa questo template come base per creare nuove pagine coerenti con il design system
 * 
 * ISTRUZIONI:
 * 1. Copia questo file in src/app/[nome-pagina]/page.tsx
 * 2. Sostituisci [NOME_PAGINA] con il nome della tua pagina
 * 3. Personalizza le sezioni secondo le necessità
 * 4. Mantieni la struttura base per coerenza
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus,
  // Aggiungi altre icone necessarie da lucide-react
} from "lucide-react";

export default function [NOME_PAGINA]Page() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - Sostituisci con dati reali
  const items = [
    {
      id: 1,
      title: "Item 1",
      description: "Descrizione item 1",
      status: "active",
    },
    // Aggiungi altri items
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* ============================================
          HEADER - Barra superiore con navigazione
          ============================================ */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center gap-4 px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Home
          </Button>
          
          {/* Page Title */}
          <h1 className="text-xl font-bold">[NOME PAGINA]</h1>
        </div>
      </header>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <div className="container px-4 py-8">
        
        {/* ============================================
            SEARCH AND ACTIONS BAR
            Barra con ricerca e azioni principali
            ============================================ */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtri
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo
            </Button>
          </div>
        </div>

        {/* ============================================
            STATS CARDS (Opzionale)
            Card con statistiche principali
            ============================================ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Totale</CardDescription>
              <CardTitle className="text-3xl">24</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Attivi</CardDescription>
              <CardTitle className="text-3xl text-green-600">18</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Attesa</CardDescription>
              <CardTitle className="text-3xl text-orange-600">4</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completati</CardDescription>
              <CardTitle className="text-3xl text-blue-600">2</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* ============================================
            MAIN CONTENT GRID
            Grid principale con card items
            ============================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card 
              key={item.id} 
              className="overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-105"
            >
              {/* Card Image/Icon Area (Opzionale) */}
              <div className="aspect-video bg-muted relative">
                <div className="absolute top-2 right-2">
                  <Badge variant={item.status === "active" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </div>
                {/* Placeholder per immagine o icona */}
                <div className="flex items-center justify-center h-full">
                  <div className="h-16 w-16 text-muted-foreground/30">
                    {/* Icona placeholder */}
                  </div>
                </div>
              </div>
              
              {/* Card Header */}
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              
              {/* Card Content */}
              <CardContent>
                {/* Contenuto specifico della card */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Dettagli aggiuntivi
                  </span>
                  <Button variant="ghost" size="sm">
                    Visualizza
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ============================================
            EMPTY STATE (Opzionale)
            Mostra quando non ci sono items
            ============================================ */}
        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <div className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30">
                {/* Icona empty state */}
              </div>
              <p className="text-lg font-semibold mb-2">
                Nessun elemento trovato
              </p>
              <p className="text-sm">
                Inizia aggiungendo il tuo primo elemento
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Primo Elemento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * VARIANTI COMUNI
 * 
 * 1. LISTA CON TABS
 * Aggiungi prima del search bar:
 * 
 * <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
 *   <TabsList className="grid w-full grid-cols-4">
 *     <TabsTrigger value="all">Tutti</TabsTrigger>
 *     <TabsTrigger value="active">Attivi</TabsTrigger>
 *     <TabsTrigger value="pending">In Attesa</TabsTrigger>
 *     <TabsTrigger value="completed">Completati</TabsTrigger>
 *   </TabsList>
 * </Tabs>
 * 
 * 
 * 2. LAYOUT A DUE COLONNE
 * Sostituisci il grid principale con:
 * 
 * <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 *   <div className="space-y-6">
 *     {/* Colonna sinistra *\/}
 *   </div>
 *   <div className="space-y-6">
 *     {/* Colonna destra *\/}
 *   </div>
 * </div>
 * 
 * 
 * 3. LISTA SEMPLICE (senza grid)
 * Sostituisci il grid con:
 * 
 * <div className="space-y-4">
 *   {items.map((item) => (
 *     <Card key={item.id} className="hover:shadow-md transition-shadow">
 *       {/* Card content *\/}
 *     </Card>
 *   ))}
 * </div>
 * 
 * 
 * 4. CON SIDEBAR
 * Avvolgi il content in:
 * 
 * <div className="flex gap-6">
 *   <aside className="w-64 space-y-4">
 *     {/* Sidebar content *\/}
 *   </aside>
 *   <main className="flex-1">
 *     {/* Main content *\/}
 *   </main>
 * </div>
 */

/**
 * ANIMAZIONI CONSIGLIATE
 * 
 * Per elementi che appaiono in sequenza:
 * <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
 * 
 * Per card hover:
 * className="hover:shadow-lg hover:scale-105 transition-all"
 * 
 * Per transizioni smooth:
 * className="transition-colors duration-200"
 */

/**
 * RESPONSIVE PATTERNS
 * 
 * Grid responsive:
 * grid-cols-1 md:grid-cols-2 lg:grid-cols-3
 * 
 * Flex responsive:
 * flex-col md:flex-row
 * 
 * Spacing responsive:
 * p-4 md:p-6 lg:p-8
 * 
 * Visibility responsive:
 * hidden md:block  (nascosto mobile, visibile desktop)
 * block md:hidden  (visibile mobile, nascosto desktop)
 */
