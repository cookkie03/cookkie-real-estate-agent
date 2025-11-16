"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Target,
  Sparkles,
  User,
  MapPin,
  Home,
  Euro,
  Calendar,
  CheckCircle,
  Activity as ActivityIcon,
  Building2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

/**
 * CRM IMMOBILIARE - Request Detail Page
 *
 * Complete request view with tabs:
 * - Dettagli: Full request information
 * - Match AI: Property matches for this request
 * - Storico: Activity timeline
 *
 * @module pages/richieste/[id]
 * @since v3.2.0
 */

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  const [activeTab, setActiveTab] = useState("details");

  // Fetch request details
  const { data: requestData, isLoading } = useQuery({
    queryKey: ["request", requestId],
    queryFn: async () => {
      const response = await fetch(`/api/requests/${requestId}`);
      if (!response.ok) throw new Error("Failed to fetch request");
      return response.json();
    },
  });

  // Fetch matches for this request (Deterministic Algorithm)
  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ["property-matches", requestId],
    queryFn: async () => {
      // Using NestJS deterministic matching endpoint
      const response = await fetch(
        `http://localhost:3001/api/matching/clients/${requestId}/properties?minScore=40&maxResults=20`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: activeTab === "matches",
  });

  const request = requestData?.request;
  const matches = matchesData || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Caricamento richiesta...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Richiesta non trovata</h2>
        <p className="text-muted-foreground mb-4">
          La richiesta che stai cercando non esiste o è stata eliminata.
        </p>
        <Button onClick={() => router.push("/richieste")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alle Richieste
        </Button>
      </div>
    );
  }

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-600">Attiva</Badge>;
      case "paused":
        return <Badge variant="secondary">In pausa</Badge>;
      case "satisfied":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Soddisfatta</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annullata</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Urgency badge
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">Media</Badge>;
      case "low":
        return <Badge variant="outline">Bassa</Badge>;
      default:
        return null;
    }
  };

  // Score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-blue-600 dark:text-blue-400";
    if (score >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{request.code}</h1>
                {getStatusBadge(request.status)}
                {getUrgencyBadge(request.urgency)}
              </div>
              <p className="text-muted-foreground mt-1">
                Cliente: <Link href={`/clienti/${request.contact.id}`} className="underline">{request.contact.fullName}</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/richieste/${requestId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Modifica
            </Link>
          </Button>
          <Button variant="destructive" className="opacity-50 cursor-not-allowed" disabled>
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Dettagli</TabsTrigger>
          <TabsTrigger value="matches">
            Match AI
            {matches.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {matches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">Storico</TabsTrigger>
        </TabsList>

        {/* TAB 1: Details */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{request.contact.fullName}</p>
                </div>
                {request.contact.primaryEmail && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{request.contact.primaryEmail}</p>
                  </div>
                )}
                {request.contact.primaryPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefono</p>
                    <p className="font-medium">{request.contact.primaryPhone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Request Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Tipo Richiesta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">
                    {request.requestType === "search_buy"
                      ? "Cerca acquisto"
                      : request.requestType === "search_rent"
                      ? "Cerca affitto"
                      : "Valutazione"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contratto</p>
                  <p className="font-medium">
                    {request.contractType === "sale" ? "Vendita" : "Affitto"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Creazione</p>
                  <p className="font-medium">
                    {formatRelativeTime(request.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Criteri di Ricerca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Città</p>
                  <div className="flex flex-wrap gap-2">
                    {request.searchCities?.map((city: string) => (
                      <Badge key={city} variant="secondary">
                        {city}
                      </Badge>
                    ))}
                  </div>
                </div>

                {request.searchZones && request.searchZones.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Zone</p>
                    <div className="flex flex-wrap gap-2">
                      {request.searchZones.map((zone: string) => (
                        <Badge key={zone} variant="outline">
                          {zone}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {request.propertyTypes && request.propertyTypes.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tipologie</p>
                  <div className="flex flex-wrap gap-2">
                    {request.propertyTypes.map((type: string) => (
                      <Badge key={type} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget & Size */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Budget & Dimensioni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {(request.priceMin || request.priceMax) && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fascia Prezzo</p>
                    <p className="font-medium">
                      €{request.priceMin?.toLocaleString() || "0"} - €
                      {request.priceMax?.toLocaleString() || "∞"}
                    </p>
                  </div>
                )}

                {(request.sqmMin || request.sqmMax) && (
                  <div>
                    <p className="text-sm text-muted-foreground">Metri Quadri</p>
                    <p className="font-medium">
                      {request.sqmMin || "0"} - {request.sqmMax || "∞"} m²
                    </p>
                  </div>
                )}

                {(request.roomsMin || request.roomsMax) && (
                  <div>
                    <p className="text-sm text-muted-foreground">Locali</p>
                    <p className="font-medium">
                      {request.roomsMin || "0"} - {request.roomsMax || "∞"}
                    </p>
                  </div>
                )}

                {request.bedroomsMin && (
                  <div>
                    <p className="text-sm text-muted-foreground">Camere Minime</p>
                    <p className="font-medium">{request.bedroomsMin}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          {(request.requiresElevator ||
            request.requiresParking ||
            request.requiresGarden ||
            request.requiresTerrace) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Caratteristiche Richieste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {request.requiresElevator && <Badge>Ascensore</Badge>}
                  {request.requiresParking && <Badge>Parcheggio</Badge>}
                  {request.requiresGarage && <Badge>Garage</Badge>}
                  {request.requiresGarden && <Badge>Giardino</Badge>}
                  {request.requiresTerrace && <Badge>Terrazza</Badge>}
                  {request.requiresBalcony && <Badge>Balcone</Badge>}
                  {request.requiresCellar && <Badge>Cantina</Badge>}
                  {request.requiresSwimmingPool && <Badge>Piscina</Badge>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {request.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{request.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 2: Match Deterministico */}
        <TabsContent value="matches" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Abbinamenti Deterministici per questa richiesta
              </h3>
              <p className="text-sm text-muted-foreground">
                Immobili che corrispondono ai criteri (algoritmo matematico, no AI)
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Algoritmo Deterministico 7 componenti
            </Badge>
          </div>

          {matchesLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
              <p className="text-muted-foreground">Caricamento match...</p>
            </div>
          ) : matches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="mx-auto mb-4 h-12 w-12 opacity-20" />
                <h3 className="text-lg font-semibold mb-2">Nessun match trovato</h3>
                <p className="text-sm text-muted-foreground">
                  Nessun immobile corrisponde ai criteri della richiesta
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matches.map((match: any, index: number) => {
                const score = Math.round(match.totalScore || 0);
                const breakdown = match.scoreBreakdown || {};
                const qualityCategory =
                  score >= 80 ? 'excellent' :
                  score >= 60 ? 'good' :
                  score >= 40 ? 'fair' : 'poor';

                return (
                  <Card key={index} className={cn(
                    "border-2",
                    score >= 70 && "border-green-300 bg-green-50/50 dark:bg-green-950/20"
                  )}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                        {/* Score Badge */}
                        <div className="flex flex-col items-center gap-1 min-w-[70px]">
                          <div
                            className={cn(
                              "text-4xl font-bold tabular-nums",
                              getScoreColor(score)
                            )}
                          >
                            {score}
                          </div>
                          <Progress value={score} className="h-2 w-full" />
                          <Badge
                            variant={qualityCategory === 'excellent' ? 'default' : 'outline'}
                            className={cn(
                              qualityCategory === 'excellent' && "bg-green-600",
                              qualityCategory === 'good' && "bg-blue-600 text-white",
                              qualityCategory === 'fair' && "bg-orange-600 text-white"
                            )}
                          >
                            {qualityCategory === 'excellent' ? 'Eccellente' :
                             qualityCategory === 'good' ? 'Buono' :
                             qualityCategory === 'fair' ? 'Discreto' : 'Scarso'}
                          </Badge>
                        </div>

                        {/* Property Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-lg">
                                  {match.propertyId || "Immobile"}
                                </h4>
                                {score >= 70 && (
                                  <Badge className="bg-green-600">
                                    <Star className="h-3 w-3 mr-1" />
                                    Ottimo Match
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                ID: {match.propertyId}
                              </p>
                            </div>
                          </div>

                          {/* Score Breakdown */}
                          <div className="space-y-2 mb-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Breakdown Score (7 componenti)
                            </p>
                            <div className="grid gap-2">
                              {/* Zona - 25% */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">🗺️ Zona</span>
                                  <span className="text-muted-foreground">
                                    {Math.round(breakdown.zone || 0)}/100 (peso 25%)
                                  </span>
                                </div>
                                <Progress
                                  value={breakdown.zone || 0}
                                  className="h-1.5"
                                />
                              </div>

                              {/* Budget - 20% */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">💰 Budget</span>
                                  <span className="text-muted-foreground">
                                    {Math.round(breakdown.budget || 0)}/100 (peso 20%)
                                  </span>
                                </div>
                                <Progress
                                  value={breakdown.budget || 0}
                                  className="h-1.5"
                                />
                              </div>

                              {/* Tipologia - 15% */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">🏠 Tipologia</span>
                                  <span className="text-muted-foreground">
                                    {Math.round(breakdown.type || 0)}/100 (peso 15%)
                                  </span>
                                </div>
                                <Progress
                                  value={breakdown.type || 0}
                                  className="h-1.5"
                                />
                              </div>

                              {/* Superficie - 15% */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">📐 Superficie</span>
                                  <span className="text-muted-foreground">
                                    {Math.round(breakdown.surface || 0)}/100 (peso 15%)
                                  </span>
                                </div>
                                <Progress
                                  value={breakdown.surface || 0}
                                  className="h-1.5"
                                />
                              </div>

                              {/* Disponibilità - 10% */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">📅 Disponibilità</span>
                                  <span className="text-muted-foreground">
                                    {Math.round(breakdown.availability || 0)}/100 (peso 10%)
                                  </span>
                                </div>
                                <Progress
                                  value={breakdown.availability || 0}
                                  className="h-1.5"
                                />
                              </div>

                              {/* Priorità - 10% */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">⭐ Priorità</span>
                                  <span className="text-muted-foreground">
                                    {Math.round(breakdown.priority || 0)}/100 (peso 10%)
                                  </span>
                                </div>
                                <Progress
                                  value={breakdown.priority || 0}
                                  className="h-1.5"
                                />
                              </div>

                              {/* Affinità - 5% */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">💝 Affinità</span>
                                  <span className="text-muted-foreground">
                                    {Math.round(breakdown.affinity || 0)}/100 (peso 5%)
                                  </span>
                                </div>
                                <Progress
                                  value={breakdown.affinity || 0}
                                  className="h-1.5"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-3 border-t">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/immobili/${match.propertyId}`}>
                                <Building2 className="h-4 w-4 mr-2" />
                                Vedi Immobile
                              </Link>
                            </Button>
                            <Button size="sm">Crea Proposta</Button>
                          </div>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: Activity History */}
        <TabsContent value="activity">
          <Card>
            <CardContent className="py-12 text-center">
              <ActivityIcon className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">Storico Attività</h3>
              <p className="text-sm text-muted-foreground">
                Le attività relative a questa richiesta appariranno qui
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
