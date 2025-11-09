"use client";

import { useState } from "react";
import { Globe, Play, Pause, Download, Settings, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * CRM IMMOBILIARE - Web Scraping Tool
 *
 * Automated property data collection from real estate portals:
 * - Source configuration (Idealista, Casa.it, Immobiliare.it)
 * - Search criteria setup
 * - Progress tracking
 * - Duplicate detection
 * - Bulk import to portfolio
 *
 * @module pages/scraping
 * @since v3.1.1
 */

interface ScrapingSource {
  id: string;
  name: string;
  enabled: boolean;
  baseUrl: string;
  status: "ready" | "running" | "completed" | "error";
}

interface SearchCriteria {
  city: string;
  zone?: string;
  contractType: "sale" | "rent" | "both";
  propertyType?: string;
  priceMin?: string;
  priceMax?: string;
  roomsMin?: string;
}

export default function ScrapingPage() {
  const [activeTab, setActiveTab] = useState<"config" | "execute" | "results">("config");

  // Sources configuration
  const [sources, setSources] = useState<ScrapingSource[]>([
    { id: "idealista", name: "Idealista.it", enabled: true, baseUrl: "https://www.idealista.it", status: "ready" },
    { id: "casait", name: "Casa.it", enabled: true, baseUrl: "https://www.casa.it", status: "ready" },
    { id: "immobiliare", name: "Immobiliare.it", enabled: false, baseUrl: "https://www.immobiliare.it", status: "ready" },
  ]);

  // Search criteria
  const [criteria, setCriteria] = useState<SearchCriteria>({
    city: "",
    contractType: "sale",
  });

  // Scraping state
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrapedCount, setScrapedCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);

  // Mock results
  const [results, setResults] = useState<any[]>([]);

  // Toggle source
  const toggleSource = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Start scraping (mock implementation)
  const handleStartScraping = () => {
    setIsRunning(true);
    setProgress(0);
    setScrapedCount(0);
    setDuplicateCount(0);
    setResults([]);

    // Mock progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setScrapedCount(42);
          setDuplicateCount(8);
          setActiveTab("results");

          // Mock results
          setResults([
            {
              id: "1",
              title: "Appartamento in vendita - Via Roma 123",
              price: 250000,
              rooms: 3,
              sqm: 85,
              source: "idealista",
              url: "https://www.idealista.it/...",
              isDuplicate: false,
            },
            {
              id: "2",
              title: "Bilocale zona Centrale",
              price: 180000,
              rooms: 2,
              sqm: 65,
              source: "casait",
              url: "https://www.casa.it/...",
              isDuplicate: true,
            },
            // ... more results
          ]);

          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  // Stop scraping
  const handleStopScraping = () => {
    setIsRunning(false);
  };

  // Import selected properties
  const handleImportResults = () => {
    alert("Importazione in corso... (funzionalità in sviluppo)");
  };

  const enabledSourcesCount = sources.filter((s) => s.enabled).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scraping Tool</h1>
        <p className="text-muted-foreground mt-1">
          Acquisisci automaticamente immobili dai principali portali immobiliari
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configurazione
          </TabsTrigger>
          <TabsTrigger value="execute">
            <Play className="h-4 w-4 mr-2" />
            Esecuzione
          </TabsTrigger>
          <TabsTrigger value="results">
            <Download className="h-4 w-4 mr-2" />
            Risultati
            {results.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {results.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Configuration */}
        <TabsContent value="config" className="space-y-4">
          {/* Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Sorgenti Dati</CardTitle>
              <CardDescription>
                Seleziona i portali da cui acquisire i dati
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">{source.baseUrl}</p>
                    </div>
                  </div>
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={() => toggleSource(source.id)}
                  />
                </div>
              ))}

              <div className="pt-2 text-sm text-muted-foreground">
                {enabledSourcesCount} {enabledSourcesCount === 1 ? "sorgente selezionata" : "sorgenti selezionate"}
              </div>
            </CardContent>
          </Card>

          {/* Search Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Criteri di Ricerca</CardTitle>
              <CardDescription>
                Definisci i parametri di ricerca per lo scraping
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* City */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Città *</label>
                  <Input
                    placeholder="Es. Milano"
                    value={criteria.city}
                    onChange={(e) => setCriteria({ ...criteria, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zona</label>
                  <Input
                    placeholder="Es. Centro"
                    value={criteria.zone || ""}
                    onChange={(e) => setCriteria({ ...criteria, zone: e.target.value })}
                  />
                </div>
              </div>

              {/* Contract Type & Property Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contratto *</label>
                  <Select
                    value={criteria.contractType}
                    onValueChange={(value: any) => setCriteria({ ...criteria, contractType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Vendita</SelectItem>
                      <SelectItem value="rent">Affitto</SelectItem>
                      <SelectItem value="both">Entrambi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipologia</label>
                  <Select
                    value={criteria.propertyType || ""}
                    onValueChange={(value) => setCriteria({ ...criteria, propertyType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tutte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Appartamento</SelectItem>
                      <SelectItem value="house">Casa</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Fascia di Prezzo (€)</label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={criteria.priceMin || ""}
                    onChange={(e) => setCriteria({ ...criteria, priceMin: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={criteria.priceMax || ""}
                    onChange={(e) => setCriteria({ ...criteria, priceMax: e.target.value })}
                  />
                </div>
              </div>

              {/* Rooms */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Locali (min)</label>
                <Input
                  type="number"
                  placeholder="Numero minimo locali"
                  value={criteria.roomsMin || ""}
                  onChange={(e) => setCriteria({ ...criteria, roomsMin: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={() => setActiveTab("execute")}
              disabled={!criteria.city || enabledSourcesCount === 0}
            >
              Continua all&apos;Esecuzione
            </Button>
          </div>
        </TabsContent>

        {/* Tab 2: Execution */}
        <TabsContent value="execute" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Esecuzione Scraping</CardTitle>
              <CardDescription>
                Avvia il processo di acquisizione dati
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <p className="font-medium">Riepilogo Configurazione</p>
                <div className="text-sm space-y-1">
                  <p>• Sorgenti: {enabledSourcesCount} attive ({sources.filter((s) => s.enabled).map((s) => s.name).join(", ")})</p>
                  <p>• Località: {criteria.city}{criteria.zone && `, ${criteria.zone}`}</p>
                  <p>• Contratto: {criteria.contractType === "sale" ? "Vendita" : criteria.contractType === "rent" ? "Affitto" : "Entrambi"}</p>
                  {criteria.priceMin && <p>• Prezzo min: €{criteria.priceMin}</p>}
                  {criteria.priceMax && <p>• Prezzo max: €{criteria.priceMax}</p>}
                </div>
              </div>

              {/* Progress */}
              {isRunning && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Acquisiti: {scrapedCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span>Duplicati: {duplicateCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                {!isRunning ? (
                  <Button size="lg" onClick={handleStartScraping}>
                    <Play className="h-4 w-4 mr-2" />
                    Avvia Scraping
                  </Button>
                ) : (
                  <Button size="lg" variant="destructive" onClick={handleStopScraping}>
                    <Pause className="h-4 w-4 mr-2" />
                    Ferma Scraping
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Results */}
        <TabsContent value="results" className="space-y-4">
          {results.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Download className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nessun risultato</h3>
                <p className="text-sm text-muted-foreground">
                  Avvia uno scraping per vedere i risultati qui
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {results.length} {results.length === 1 ? "immobile trovato" : "immobili trovati"}
                    {" • "}
                    {results.filter((r) => r.isDuplicate).length} duplicati
                  </p>
                </div>
                <Button onClick={handleImportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Importa Selezionati
                </Button>
              </div>

              <div className="space-y-3">
                {results.map((result) => (
                  <Card key={result.id} className={cn(result.isDuplicate && "opacity-60")}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{result.title}</h4>
                            {result.isDuplicate && (
                              <Badge variant="secondary" className="text-xs">
                                Duplicato
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {result.source}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>€{result.price.toLocaleString()}</span>
                            <span>{result.rooms} locali</span>
                            <span>{result.sqm} m²</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            Visualizza
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
