"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Toolbar } from "@/components/Toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Zap,
  Search,
  Loader,
  AlertCircle,
  CheckCircle,
  Play,
} from "lucide-react";

interface ScrapingJob {
  id: string;
  source: string;
  status: "idle" | "running" | "completed" | "error";
  itemsFound?: number;
  progress?: number;
  error?: string;
}

interface MatchingResult {
  clientId: string;
  clientName: string;
  matchedProperties: Array<{
    propertyId: string;
    propertyTitle: string;
    matchScore: number;
    reason: string;
  }>;
}

export default function ToolsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrapingJobs, setScrapingJobs] = useState<ScrapingJob[]>([
    {
      id: "idealista",
      source: "Idealista.it",
      status: "idle",
    },
    {
      id: "immobiliare",
      source: "Immobiliare.it",
      status: "idle",
    },
    {
      id: "subito",
      source: "Subito.it",
      status: "idle",
    },
  ]);
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  const handleStartScraping = (jobId: string) => {
    setScrapingJobs((jobs) =>
      jobs.map((job) =>
        job.id === jobId ? { ...job, status: "running", progress: 0 } : job
      )
    );

    // Simulate scraping
    setTimeout(() => {
      setScrapingJobs((jobs) =>
        jobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: "completed",
                itemsFound: Math.floor(Math.random() * 50) + 5,
                progress: 100,
              }
            : job
        )
      );
    }, 2000);
  };

  const handleRunMatching = () => {
    setIsMatching(true);

    // Simulate matching algorithm
    setTimeout(() => {
      setMatchingResults([
        {
          clientId: "1",
          clientName: "Mario Rossi",
          matchedProperties: [
            {
              propertyId: "1",
              propertyTitle: "Trilocale con terrazzo",
              matchScore: 92,
              reason: "Budget compatibile, zona preferita",
            },
            {
              propertyId: "4",
              propertyTitle: "Villa indipendente",
              matchScore: 78,
              reason: "Caratteristiche simili",
            },
          ],
        },
        {
          clientId: "2",
          clientName: "Laura Bianchi",
          matchedProperties: [
            {
              propertyId: "2",
              propertyTitle: "Bilocale ristrutturato",
              matchScore: 88,
              reason: "Budget e zona corrispondenti",
            },
          ],
        },
      ]);
      setIsMatching(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Loader className="h-4 w-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "error":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "running":
        return "In esecuzione";
      case "completed":
        return "Completato";
      case "error":
        return "Errore";
      default:
        return "Non avviato";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <TopBar
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="flex-1 flex lg:ml-20">
        <Toolbar />

        <div className="flex-1 overflow-auto pb-20 lg:pb-0 mb-16">
          <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
            {/* Header */}
            <section>
              <h1 className="text-3xl font-bold">Tools Avanzati</h1>
              <p className="text-muted-foreground mt-2">
                Strumenti per automazione, scraping e matching intelligente
              </p>
            </section>

            {/* Tabs */}
            <Tabs defaultValue="scraping" className="space-y-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="scraping" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Scraping Dati</span>
                  <span className="sm:hidden">Scraping</span>
                </TabsTrigger>
                <TabsTrigger value="matching" className="gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Matching</span>
                </TabsTrigger>
              </TabsList>

              {/* Scraping Tab */}
              <TabsContent value="scraping" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Scraping da Portali Immobiliari</CardTitle>
                    <CardDescription>
                      Importa automaticamente annunci dai principali portali immobiliari
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      {scrapingJobs.map((job) => (
                        <Card key={job.id} className="border-l-4 border-l-primary/30">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{job.source}</h3>
                                  <Badge
                                    variant="outline"
                                    className={getStatusColor(job.status)}
                                  >
                                    {getStatusIcon(job.status)}
                                    <span className="ml-1 text-xs">
                                      {getStatusLabel(job.status)}
                                    </span>
                                  </Badge>
                                </div>

                                {job.status === "running" && job.progress !== undefined && (
                                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-primary h-full transition-all duration-300"
                                      style={{ width: `${job.progress}%` }}
                                    />
                                  </div>
                                )}

                                {job.status === "completed" && job.itemsFound && (
                                  <p className="text-sm text-green-600">
                                    ✓ {job.itemsFound} annunci trovati
                                  </p>
                                )}

                                {job.status === "error" && job.error && (
                                  <p className="text-sm text-red-600">{job.error}</p>
                                )}

                                <p className="text-xs text-muted-foreground mt-2">
                                  Ultimo aggiornamento: Mai
                                </p>
                              </div>

                              <Button
                                onClick={() => handleStartScraping(job.id)}
                                disabled={job.status === "running"}
                                size="sm"
                                className="gap-2"
                              >
                                <Play className="h-4 w-4" />
                                {job.status === "running" ? "In corso..." : "Avvia"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-900">
                      <p>
                        💡 <strong>Nota:</strong> Lo scraping è configurato per importare
                        automaticamente gli annunci dai principali portali. I dati verranno
                        sincronizzati quotidianamente.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Matching Tab */}
              <TabsContent value="matching" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Matching Intelligente Immobili-Clienti</CardTitle>
                    <CardDescription>
                      Algoritmo AI per abbinare automaticamente immobili ai clienti in base
                      alle preferenze
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleRunMatching}
                      disabled={isMatching}
                      size="lg"
                      className="w-full gap-2"
                    >
                      {isMatching ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Analizzando clienti e immobili...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Esegui Matching
                        </>
                      )}
                    </Button>

                    {matchingResults.length > 0 && (
                      <div className="space-y-4 mt-6">
                        <h3 className="font-semibold text-lg">Risultati Matching</h3>

                        {matchingResults.map((result) => (
                          <Card key={result.clientId} className="border-l-4 border-l-success">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                  {result.clientName}
                                </CardTitle>
                                <Badge variant="secondary">
                                  {result.matchedProperties.length} match
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {result.matchedProperties.map((prop) => (
                                  <div
                                    key={prop.propertyId}
                                    className="p-3 rounded-lg bg-muted/30 border"
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <div className="flex-1">
                                        <p className="font-medium text-sm">
                                          {prop.propertyTitle}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {prop.reason}
                                        </p>
                                      </div>
                                      <Badge
                                        className="flex-shrink-0"
                                        style={{
                                          backgroundColor:
                                            prop.matchScore >= 85
                                              ? "rgb(34, 197, 94)"
                                              : prop.matchScore >= 70
                                              ? "rgb(34, 197, 94)"
                                              : "rgb(59, 130, 246)",
                                        }}
                                      >
                                        {prop.matchScore}%
                                      </Badge>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className="bg-success h-full"
                                        style={{ width: `${prop.matchScore}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {!matchingResults.length && !isMatching && (
                      <div className="p-4 rounded-lg bg-muted/30 border text-sm text-center text-muted-foreground">
                        <p>
                          Fai clic su "Esegui Matching" per iniziare l'analisi. L'algoritmo
                          analizzerà i preferenze dei clienti e troverà gli immobili più
                          idonei.
                        </p>
                      </div>
                    )}

                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-900">
                      <p>
                        🤖 <strong>Algoritmo:</strong> L'AI analizza budget, zone preferite,
                        caratteristiche richieste e lo storico delle transazioni per trovare
                        i migliori abbinamenti.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
