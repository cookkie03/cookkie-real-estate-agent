"use client";

import { useState } from "react";
import { Globe, Play, Pause, Download, Settings, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  baseUrl: string;
  description: string;
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
  const [sources] = useState<ScrapingSource[]>([
    { id: "idealista", name: "Idealista.it", baseUrl: "https://www.idealista.it", description: "Portale leader in Spagna e Italia", status: "ready" },
    { id: "casait", name: "Casa.it", baseUrl: "https://www.casa.it", description: "Annunci immobiliari italiani", status: "ready" },
    { id: "immobiliare", name: "Immobiliare.it", baseUrl: "https://www.immobiliare.it", description: "Il portale immobiliare più visitato in Italia", status: "ready" },
  ]);

  // Selected source (SINGLE selection only - backend supports one source at a time)
  const [selectedSource, setSelectedSource] = useState<string>("idealista");

  // Search criteria
  const [criteria, setCriteria] = useState<SearchCriteria>({
    city: "",
    contractType: "sale",
  });

  // Scraping state
  const [isRunning, setIsRunning] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [scrapedCount, setScrapedCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // Results
  const [results, setResults] = useState<any[]>([]);

  // Map UI source IDs to backend portal names
  const sourceToPortalMap: Record<string, string> = {
    idealista: "immobiliare_it",  // Backend only has immobiliare_it for now
    casait: "casa_it",
    immobiliare: "immobiliare_it",
  };

  // Start scraping (real backend integration)
  const handleStartScraping = async () => {
    setIsRunning(true);
    setProgress(0);
    setScrapedCount(0);
    setDuplicateCount(0);
    setResults([]);
    setStatusMessage("Avvio scraping...");

    try {
      // Map UI source to backend portal
      const portalName = sourceToPortalMap[selectedSource];
      if (!portalName) {
        throw new Error(`Portal ${selectedSource} not supported`);
      }

      // Map contract type to Italian
      const contractType = criteria.contractType === "sale" ? "vendita" :
                           criteria.contractType === "rent" ? "affitto" : "vendita";

      // Create job request
      const jobRequest = {
        portal: portalName,
        location: criteria.city.toLowerCase(),
        contract_type: contractType,
        property_type: criteria.propertyType,
        price_min: criteria.priceMin ? parseFloat(criteria.priceMin) : undefined,
        price_max: criteria.priceMax ? parseFloat(criteria.priceMax) : undefined,
        rooms_min: criteria.roomsMin ? parseInt(criteria.roomsMin) : undefined,
        max_pages: 3,  // Default to 3 pages
      };

      // Start job
      const response = await fetch("http://localhost:8000/scraping/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobRequest),
      });

      if (!response.ok) {
        throw new Error(`Failed to start scraping: ${response.statusText}`);
      }

      const jobStatus = await response.json();
      setCurrentJobId(jobStatus.job_id);
      setStatusMessage(`Job avviato: ${jobStatus.job_id}`);

      // Poll for status
      pollJobStatus(jobStatus.job_id);

    } catch (error) {
      console.error("Scraping error:", error);
      setStatusMessage(`Errore: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsRunning(false);
    }
  };

  // Poll job status
  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/scraping/jobs/${jobId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch job status");
        }

        const status = await response.json();

        // Update status message
        setStatusMessage(`Status: ${status.status}`);

        // Update progress (estimate based on status)
        if (status.status === "running") {
          setProgress((prev) => Math.min(prev + 5, 90));
        } else if (status.status === "completed") {
          setProgress(100);
          setScrapedCount(status.listings_found || 0);
          setDuplicateCount(status.listings_found - status.listings_saved || 0);

          // Fetch results
          await fetchJobResults(jobId);

          clearInterval(interval);
          setIsRunning(false);
          setActiveTab("results");
        } else if (status.status === "failed") {
          setStatusMessage(`Errore: ${status.error || 'Unknown error'}`);
          clearInterval(interval);
          setIsRunning(false);
        }

      } catch (error) {
        console.error("Poll error:", error);
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 2000);  // Poll every 2 seconds
  };

  // Fetch job results
  const fetchJobResults = async (jobId: string) => {
    try {
      // Fetch properties from scraping
      const response = await fetch(
        `http://localhost:8000/scraping/properties?source=scraping&page=1&page_size=50`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();

      // Transform to UI format
      const transformedResults = data.properties.map((prop: any) => ({
        id: prop.id,
        title: prop.title || "Immobile senza titolo",
        price: prop.price_sale || prop.price_rent || 0,
        rooms: prop.rooms || 0,
        sqm: prop.sqm || 0,
        source: prop.source,
        url: prop.source_url || "#",
        isDuplicate: false,  // Backend handles deduplication
      }));

      setResults(transformedResults);

    } catch (error) {
      console.error("Error fetching results:", error);
    }
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
              <CardTitle>Sorgente Dati</CardTitle>
              <CardDescription>
                Seleziona il portale da cui acquisire i dati (una sorgente alla volta)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedSource} onValueChange={setSelectedSource}>
                <div className="space-y-3">
                  {sources.map((source) => (
                    <div
                      key={source.id}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer",
                        selectedSource === source.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/30"
                      )}
                      onClick={() => setSelectedSource(source.id)}
                    >
                      <RadioGroupItem value={source.id} id={source.id} className="mt-1" />
                      <div className="flex items-start gap-3 flex-1">
                        <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <Label htmlFor={source.id} className="font-medium cursor-pointer">
                            {source.name}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {source.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {source.baseUrl}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="pt-2 text-sm text-muted-foreground">
                Sorgente selezionata: <span className="font-medium">{sources.find(s => s.id === selectedSource)?.name}</span>
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
              disabled={!criteria.city || !selectedSource}
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
                  <p>• Sorgente: {sources.find(s => s.id === selectedSource)?.name || "Nessuna"}</p>
                  <p>• Località: {criteria.city}{criteria.zone && `, ${criteria.zone}`}</p>
                  <p>• Contratto: {criteria.contractType === "sale" ? "Vendita" : criteria.contractType === "rent" ? "Affitto" : "Entrambi"}</p>
                  {criteria.priceMin && <p>• Prezzo min: €{criteria.priceMin}</p>}
                  {criteria.priceMax && <p>• Prezzo max: €{criteria.priceMax}</p>}
                </div>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    {statusMessage}
                  </p>
                </div>
              )}

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
