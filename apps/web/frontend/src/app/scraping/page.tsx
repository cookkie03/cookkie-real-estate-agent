"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, Play, Pause, Download, Settings, CheckCircle2, AlertCircle, Eye, Database } from "lucide-react";
import { connectToScrapingJob } from "@/lib/websocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/constants";

/**
 * CRM IMMOBILIARE - Universal Scraping Engine
 *
 * Three-mode scraping system:
 * 1. Real Estate Portals: Immobiliare.it, Casa.it, Idealista.it
 * 2. External CRMs: User's custom URLs to external CRMs they have access to
 * 3. Institutional Portals: For planimetries, photos, cadastral data
 *
 * Features:
 * - Headful mode with visible browser
 * - Real-time browser streaming (screenshots)
 * - Auto-populate database
 * - Progress tracking
 *
 * @module pages/scraping
 * @since v4.0.0
 */

type ScrapingMode = "portal" | "crm" | "institutional";

interface ScrapingConfig {
  mode: ScrapingMode;

  // Portal mode
  portal?: "immobiliare.it" | "casa.it" | "idealista.it";
  city?: string;
  zone?: string;
  contractType?: "sale" | "rent";
  propertyType?: string;
  priceMin?: string;
  priceMax?: string;
  surfaceMin?: string;
  surfaceMax?: string;
  roomsMin?: string;

  // CRM/Institutional mode
  customUrl?: string;

  // Common settings
  headfulMode: boolean;
  autoImport: boolean;
  maxPages?: number;
}

interface JobStatus {
  id: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  portal: string;
  searchUrl: string;
  progress: number;
  currentPage?: number;
  error?: string;
  result?: {
    propertiesFound: number;
    propertiesImported: number;
    propertiesDuplicated: number;
    propertiesSkipped: number;
    pagesScraped: number;
    errors: string[];
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export default function ScrapingPage() {
  const [activeTab, setActiveTab] = useState<"config" | "execute" | "results">("config");

  // Scraping configuration
  const [config, setConfig] = useState<ScrapingConfig>({
    mode: "portal",
    portal: "immobiliare.it",
    contractType: "sale",
    headfulMode: false,
    autoImport: true,
    maxPages: 3,
  });

  // Scraping state
  const [isRunning, setIsRunning] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobStatus | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);

  // Refs
  const logsEndRef = useRef<HTMLDivElement>(null);
  const disconnectWebSocketRef = useRef<(() => void) | null>(null);

  // Update config helper
  const updateConfig = (updates: Partial<ScrapingConfig>) => {
    setConfig({ ...config, ...updates });
  };

  // Add log message
  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (disconnectWebSocketRef.current) {
        disconnectWebSocketRef.current();
      }
    };
  }, []);

  // Build search URL for portal mode
  const buildSearchUrl = async (): Promise<string> => {
    if (config.mode === "portal" && config.city) {
      const params: any = {
        portal: config.portal,
        city: config.city,
        contractType: config.contractType,
        propertyType: config.propertyType,
        priceMin: config.priceMin ? parseFloat(config.priceMin) : undefined,
        priceMax: config.priceMax ? parseFloat(config.priceMax) : undefined,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/scraping/build-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error("Failed to build search URL");
        }

        const data = await response.json();
        return data.url;
      } catch (error) {
        addLog(`Error building URL: ${error}`);
        return "";
      }
    } else if (config.mode === "crm" || config.mode === "institutional") {
      return config.customUrl || "";
    }

    return "";
  };

  // Start scraping
  const handleStartScraping = async () => {
    setIsRunning(true);
    setLogs([]);
    setResults([]);
    addLog("Starting scraping job...");

    try {
      // Build search URL
      const searchUrl = await buildSearchUrl();

      if (!searchUrl) {
        throw new Error("Invalid search URL");
      }

      addLog(`Search URL: ${searchUrl}`);

      // Create job request
      const jobRequest: any = {
        portal: config.portal,
        searchUrl,
        maxPages: config.maxPages || 3,
        maxProperties: 100,
        importToDatabase: config.autoImport,
        deduplication: true,
        headful: config.headfulMode,
        mode: config.mode,
      };

      // Add filters for portal mode
      if (config.mode === "portal") {
        jobRequest.contractType = config.contractType;
        jobRequest.propertyType = config.propertyType;
        jobRequest.city = config.city;
        jobRequest.priceMin = config.priceMin ? parseFloat(config.priceMin) : undefined;
        jobRequest.priceMax = config.priceMax ? parseFloat(config.priceMax) : undefined;
        jobRequest.surfaceMin = config.surfaceMin ? parseFloat(config.surfaceMin) : undefined;
        jobRequest.surfaceMax = config.surfaceMax ? parseFloat(config.surfaceMax) : undefined;
      }

      // TODO: Add authentication token
      const response = await fetch(`${API_BASE_URL}/scraping/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to start scraping job");
      }

      const job: JobStatus = await response.json();
      setCurrentJob(job);
      addLog(`Job created: ${job.id}`);
      addLog(`Status: ${job.status}`);

      // Connect to WebSocket for real-time updates
      const disconnect = connectToScrapingJob(job.id, {
        onProgress: (event) => {
          addLog(`Progress: ${event.progress}% (Page ${event.currentPage || 0})`);
          setCurrentJob((prev) => prev ? { ...prev, progress: event.progress, currentPage: event.currentPage } : null);
        },
        onCompleted: (event) => {
          addLog(`Scraping completed!`);
          addLog(`Found: ${event.propertiesFound} properties`);
          addLog(`Imported: ${event.propertiesImported} properties`);
          setCurrentJob((prev) => prev ? {
            ...prev,
            status: "completed",
            progress: 100,
            result: {
              propertiesFound: event.propertiesFound,
              propertiesImported: event.propertiesImported,
              propertiesDuplicated: 0,
              propertiesSkipped: 0,
              pagesScraped: 0,
              errors: [],
            },
          } : null);
          setIsRunning(false);
          setActiveTab("results");
        },
        onFailed: (event) => {
          addLog(`Scraping failed: ${event.error}`);
          setCurrentJob((prev) => prev ? { ...prev, status: "failed", error: event.error } : null);
          setIsRunning(false);
        },
        onScreenshot: (event) => {
          // Update screenshot for headful mode
          setCurrentScreenshot(event.screenshot);
        },
        onLog: (event) => {
          addLog(`[${event.level.toUpperCase()}] ${event.message}`);
        },
      });

      // Store disconnect function for cleanup
      disconnectWebSocketRef.current = disconnect;
    } catch (error) {
      addLog(`ERROR: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsRunning(false);
    }
  };


  // Stop scraping
  const handleStopScraping = async () => {
    if (!currentJob) return;

    try {
      await fetch(`${API_BASE_URL}/scraping/jobs/${currentJob.id}`, {
        method: "DELETE",
      });

      addLog("Scraping stopped");
      setIsRunning(false);

      // Disconnect WebSocket
      if (disconnectWebSocketRef.current) {
        disconnectWebSocketRef.current();
        disconnectWebSocketRef.current = null;
      }
    } catch (error) {
      addLog(`Error stopping scraping: ${error}`);
    }
  };

  // Validate configuration
  const isConfigValid = (): boolean => {
    if (config.mode === "portal") {
      return !!config.city && !!config.portal;
    } else {
      return !!config.customUrl;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Universal Scraping Engine</h1>
        <p className="text-muted-foreground mt-1">
          Acquisisci automaticamente immobili da portali, CRM esterni e fonti istituzionali
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
            {currentJob?.result && (
              <Badge variant="secondary" className="ml-2">
                {currentJob.result.propertiesImported}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Configuration */}
        <TabsContent value="config" className="space-y-4">
          {/* Scraping Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Modalità di Scraping</CardTitle>
              <CardDescription>
                Seleziona il tipo di sorgente da cui acquisire i dati
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={config.mode} onValueChange={(v: any) => updateConfig({ mode: v })}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="portal">
                    <Globe className="h-4 w-4 mr-2" />
                    Portali Immobiliari
                  </TabsTrigger>
                  <TabsTrigger value="crm">
                    <Database className="h-4 w-4 mr-2" />
                    CRM Esterni
                  </TabsTrigger>
                  <TabsTrigger value="institutional">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Enti Istituzionali
                  </TabsTrigger>
                </TabsList>

                {/* Portal Mode */}
                <TabsContent value="portal" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Portale *</Label>
                    <Select value={config.portal} onValueChange={(v: any) => updateConfig({ portal: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immobiliare.it">Immobiliare.it</SelectItem>
                        <SelectItem value="casa.it">Casa.it</SelectItem>
                        <SelectItem value="idealista.it">Idealista.it</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Città *</Label>
                      <Input
                        placeholder="Es. Milano"
                        value={config.city || ""}
                        onChange={(e) => updateConfig({ city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Zona</Label>
                      <Input
                        placeholder="Es. Centro"
                        value={config.zone || ""}
                        onChange={(e) => updateConfig({ zone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contratto *</Label>
                      <Select
                        value={config.contractType}
                        onValueChange={(v: any) => updateConfig({ contractType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">Vendita</SelectItem>
                          <SelectItem value="rent">Affitto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipologia</Label>
                      <Select
                        value={config.propertyType || ""}
                        onValueChange={(v) => updateConfig({ propertyType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tutte" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appartamento">Appartamento</SelectItem>
                          <SelectItem value="casa">Casa</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Fascia di Prezzo (€)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={config.priceMin || ""}
                        onChange={(e) => updateConfig({ priceMin: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={config.priceMax || ""}
                        onChange={(e) => updateConfig({ priceMax: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Superficie (m²)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={config.surfaceMin || ""}
                        onChange={(e) => updateConfig({ surfaceMin: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={config.surfaceMax || ""}
                        onChange={(e) => updateConfig({ surfaceMax: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* CRM Mode */}
                <TabsContent value="crm" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>URL del CRM *</Label>
                    <Input
                      type="url"
                      placeholder="https://crm-esterno.example.com/properties"
                      value={config.customUrl || ""}
                      onChange={(e) => updateConfig({ customUrl: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Inserisci l&apos;URL completo della pagina da cui estrarre i dati.
                      Assicurati di avere accesso al CRM.
                    </p>
                  </div>
                </TabsContent>

                {/* Institutional Mode */}
                <TabsContent value="institutional" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>URL Portale Istituzionale *</Label>
                    <Input
                      type="url"
                      placeholder="https://portale-istituzionale.gov.it/..."
                      value={config.customUrl || ""}
                      onChange={(e) => updateConfig({ customUrl: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Inserisci l&apos;URL del portale istituzionale da cui scaricare planimetrie,
                      foto o dati catastali.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Avanzate</CardTitle>
              <CardDescription>
                Configura opzioni avanzate di scraping
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Headful Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Visibile</Label>
                  <p className="text-xs text-muted-foreground">
                    Mostra il browser Chromium in tempo reale durante lo scraping
                  </p>
                </div>
                <Switch
                  checked={config.headfulMode}
                  onCheckedChange={(checked) => updateConfig({ headfulMode: checked })}
                />
              </div>

              {/* Auto Import */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Importazione Automatica</Label>
                  <p className="text-xs text-muted-foreground">
                    Salva automaticamente gli immobili trovati nel database
                  </p>
                </div>
                <Switch
                  checked={config.autoImport}
                  onCheckedChange={(checked) => updateConfig({ autoImport: checked })}
                />
              </div>

              {/* Max Pages */}
              <div className="space-y-2">
                <Label>Numero Massimo di Pagine</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={config.maxPages || 3}
                  onChange={(e) => updateConfig({ maxPages: parseInt(e.target.value) || 3 })}
                />
                <p className="text-xs text-muted-foreground">
                  Massimo 50 pagine per job (consigliato: 3-5)
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={() => setActiveTab("execute")}
              disabled={!isConfigValid()}
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
                  <p>• Modalità: {config.mode === "portal" ? "Portali Immobiliari" : config.mode === "crm" ? "CRM Esterni" : "Enti Istituzionali"}</p>
                  {config.mode === "portal" && (
                    <>
                      <p>• Portale: {config.portal}</p>
                      <p>• Località: {config.city}{config.zone && `, ${config.zone}`}</p>
                      <p>• Contratto: {config.contractType === "sale" ? "Vendita" : "Affitto"}</p>
                    </>
                  )}
                  {(config.mode === "crm" || config.mode === "institutional") && (
                    <p>• URL: {config.customUrl}</p>
                  )}
                  <p>• Browser visibile: {config.headfulMode ? "Sì" : "No"}</p>
                  <p>• Auto-import: {config.autoImport ? "Sì" : "No"}</p>
                  <p>• Pagine max: {config.maxPages}</p>
                </div>
              </div>

              {/* Progress */}
              {currentJob && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm text-muted-foreground">{currentJob.progress}%</span>
                  </div>
                  <Progress value={currentJob.progress} className="h-2" />
                  {currentJob.result && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Trovati: {currentJob.result.propertiesFound}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span>Importati: {currentJob.result.propertiesImported}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span>Duplicati: {currentJob.result.propertiesDuplicated}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                        <span>Skippati: {currentJob.result.propertiesSkipped}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Browser Stream */}
              {config.headfulMode && isRunning && (
                <div className="p-4 rounded-lg border border-dashed">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">Browser Stream (Live)</span>
                    <Badge variant="outline" className="ml-auto">
                      {currentScreenshot ? "Connesso" : "In attesa..."}
                    </Badge>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-900 rounded overflow-hidden">
                    {currentScreenshot ? (
                      <img
                        src={`data:image/png;base64,${currentScreenshot}`}
                        alt="Browser screenshot"
                        className="w-full h-auto"
                      />
                    ) : (
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                          In attesa del primo screenshot...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Logs */}
              <div className="space-y-2">
                <Label>Logs</Label>
                <div className="h-48 overflow-y-auto p-3 rounded-lg bg-black text-green-400 font-mono text-xs">
                  {logs.length === 0 ? (
                    <p className="text-gray-500">In attesa di avvio...</p>
                  ) : (
                    <>
                      {logs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                      <div ref={logsEndRef} />
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                {!isRunning ? (
                  <Button size="lg" onClick={handleStartScraping} disabled={!isConfigValid()}>
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
          {!currentJob?.result ? (
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
            <Card>
              <CardHeader>
                <CardTitle>Risultati Scraping</CardTitle>
                <CardDescription>
                  Job ID: {currentJob.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
                    <p className="text-sm text-green-600 dark:text-green-400">Trovati</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {currentJob.result.propertiesFound}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <p className="text-sm text-blue-600 dark:text-blue-400">Importati</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {currentJob.result.propertiesImported}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
                    <p className="text-sm text-orange-600 dark:text-orange-400">Duplicati</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {currentJob.result.propertiesDuplicated}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pagine</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {currentJob.result.pagesScraped}
                    </p>
                  </div>
                </div>

                {currentJob.result.errors.length > 0 && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                      Errori ({currentJob.result.errors.length})
                    </p>
                    <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
                      {currentJob.result.errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button onClick={() => setActiveTab("config")}>
                    Configura Nuovo Scraping
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
