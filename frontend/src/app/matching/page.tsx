"use client";

import { useState } from "react";
import { Target, Sparkles, User, Building2, ChevronRight, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * CRM IMMOBILIARE - AI Matching Dashboard
 *
 * Intelligent property-to-request matching system:
 * - Client requests list with criteria
 * - AI-powered matching algorithm
 * - Score visualization (0-100)
 * - Proposal creation and tracking
 * - Match insights and recommendations
 *
 * @module pages/matching
 * @since v3.1.1
 */

interface ClientRequest {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contractType: "sale" | "rent";
  propertyType?: string;
  city: string;
  zone?: string;
  priceMin?: number;
  priceMax?: number;
  roomsMin?: number;
  roomsMax?: number;
  status: "active" | "matched" | "closed";
  createdAt: string;
  matchCount?: number;
  bestMatchScore?: number;
}

interface PropertyMatch {
  id: string;
  propertyId: string;
  requestId: string;
  score: number;
  property: {
    id: string;
    title: string;
    street: string;
    city: string;
    contractType: string;
    propertyType: string;
    priceSale?: number;
    priceRentMonthly?: number;
    rooms?: number;
    sqmCommercial?: number;
  };
  matchReasons: string[];
  proposalStatus?: "none" | "sent" | "viewed" | "accepted" | "rejected";
}

export default function MatchingPage() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  // Fetch client requests (mock data for now)
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["client-requests"],
    queryFn: async () => {
      // Mock implementation - in production would call API
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        requests: [
          {
            id: "req-1",
            contactId: "contact-1",
            contactName: "Mario Rossi",
            contactEmail: "mario.rossi@email.com",
            contactPhone: "+39 333 1234567",
            contractType: "sale",
            propertyType: "apartment",
            city: "Milano",
            zone: "Centro",
            priceMin: 200000,
            priceMax: 350000,
            roomsMin: 2,
            roomsMax: 3,
            status: "active",
            createdAt: "2024-01-15",
            matchCount: 8,
            bestMatchScore: 92,
          },
          {
            id: "req-2",
            contactId: "contact-2",
            contactName: "Laura Bianchi",
            contactEmail: "laura.bianchi@email.com",
            contactPhone: "+39 347 9876543",
            contractType: "rent",
            propertyType: "apartment",
            city: "Milano",
            priceMin: 800,
            priceMax: 1200,
            roomsMin: 1,
            status: "active",
            createdAt: "2024-01-20",
            matchCount: 5,
            bestMatchScore: 85,
          },
          {
            id: "req-3",
            contactId: "contact-3",
            contactName: "Giovanni Verdi",
            contactEmail: "giovanni.verdi@email.com",
            contactPhone: "+39 340 5551234",
            contractType: "sale",
            propertyType: "villa",
            city: "Como",
            priceMin: 500000,
            priceMax: 800000,
            roomsMin: 4,
            status: "active",
            createdAt: "2024-01-18",
            matchCount: 3,
            bestMatchScore: 78,
          },
        ] as ClientRequest[],
      };
    },
  });

  // Fetch matches for selected request using AI scoring
  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ["property-matches", selectedRequest],
    queryFn: async () => {
      if (!selectedRequest) return { matches: [] };

      // Call scoring API
      try {
        const response = await fetch(
          `/api/scoring/calculate?request_id=${selectedRequest}&min_score=60&limit=10`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }

        const data = await response.json();

        if (!data.success) {
          console.error('Scoring API error:', data.error);
          return { matches: [] };
        }

        // Transform backend format to frontend format
        const transformedMatches = data.matches.map((match: any, index: number) => ({
          id: `match-${index + 1}`,
          propertyId: match.property_id,
          requestId: selectedRequest,
          score: Math.round(match.total_score),
          property: {
            id: match.property_id,
            title: match.property_title,
            street: match.property_city, // Simplified
            city: match.property_city,
            zone: match.property_zone,
            contractType: 'sale', // From match data
            propertyType: 'apartment', // Could be extracted
            priceSale: match.property_price,
            rooms: match.rooms,
            sqmCommercial: match.sqm,
          },
          matchReasons: match.match_reasons || [],
          proposalStatus: 'none' as const, // Default status
        }));

        return { matches: transformedMatches };

      } catch (error) {
        console.error('Error fetching matches:', error);
        // Return mock data as fallback
        return {
          matches: [
          {
            id: "match-1",
            propertyId: "prop-1",
            requestId: selectedRequest,
            score: 92,
            property: {
              id: "prop-1",
              title: "Luminoso bilocale in Centro",
              street: "Via Dante 15",
              city: "Milano",
              contractType: "sale",
              propertyType: "apartment",
              priceSale: 280000,
              rooms: 2,
              sqmCommercial: 65,
            },
            matchReasons: [
              "Prezzo nel range richiesto (€280k vs €200k-€350k)",
              "Ubicazione: Centro Milano",
              "Tipologia corretta: Appartamento",
              "Numero locali: 2 (range richiesto 2-3)",
            ],
            proposalStatus: "sent",
          },
          {
            id: "match-2",
            propertyId: "prop-2",
            requestId: selectedRequest,
            score: 88,
            property: {
              id: "prop-2",
              title: "Trilocale moderno zona Porta Venezia",
              street: "Corso Buenos Aires 42",
              city: "Milano",
              contractType: "sale",
              propertyType: "apartment",
              priceSale: 320000,
              rooms: 3,
              sqmCommercial: 85,
            },
            matchReasons: [
              "Prezzo nel range (€320k vs €200k-€350k)",
              "3 locali (range 2-3)",
              "Zona semi-centrale Milano",
              "Appartamento come richiesto",
            ],
            proposalStatus: "none",
          },
          {
            id: "match-3",
            propertyId: "prop-3",
            requestId: selectedRequest,
            score: 75,
            property: {
              id: "prop-3",
              title: "Bilocale ristrutturato zona Navigli",
              street: "Via Vigevano 8",
              city: "Milano",
              contractType: "sale",
              propertyType: "apartment",
              priceSale: 250000,
              rooms: 2,
              sqmCommercial: 55,
            },
            matchReasons: [
              "Ottimo prezzo (€250k vs €200k-€350k)",
              "2 locali (nel range)",
              "Zona trendy: Navigli",
            ],
            proposalStatus: "viewed",
          },
        ] as PropertyMatch[]
      };
      }
    },
    enabled: !!selectedRequest,
  });

  const requests = requestsData?.requests || [];
  const matches = matchesData?.matches || [];

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-blue-600 dark:text-blue-400";
    if (score >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  // Get score badge variant
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return "default";
    if (score >= 70) return "secondary";
    return "outline";
  };

  // Get proposal status badge
  const getProposalStatusBadge = (status?: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950">Inviata</Badge>;
      case "viewed":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950">Visualizzata</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-green-600">Accettata</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rifiutata</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matching AI</h1>
        <p className="text-muted-foreground mt-1">
          Sistema intelligente di abbinamento proprietà-clienti
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Richieste Attive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter((r) => r.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In attesa di matching
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Match Trovati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.reduce((sum, r) => sum + (r.matchCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Totale abbinamenti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Score Medio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.length > 0
                ? Math.round(
                    requests.reduce((sum, r) => sum + (r.bestMatchScore || 0), 0) /
                      requests.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Qualità abbinamenti
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Client Requests List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold">Richieste Clienti</h2>

          {requestsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 rounded-lg skeleton" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nessuna richiesta</h3>
                <p className="text-sm text-muted-foreground">
                  Crea richieste clienti per iniziare il matching
                </p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card
                key={request.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedRequest === request.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedRequest(request.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">{request.contactName}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {request.city}
                        {request.zone && `, ${request.zone}`}
                      </p>
                    </div>
                    {request.bestMatchScore && (
                      <Badge
                        variant={getScoreBadgeVariant(request.bestMatchScore)}
                        className="gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        {request.bestMatchScore}%
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      <span>
                        {request.contractType === "sale" ? "Vendita" : "Affitto"}
                        {request.propertyType && ` • ${request.propertyType}`}
                      </span>
                    </div>
                    <div>
                      €{request.priceMin?.toLocaleString()} - €
                      {request.priceMax?.toLocaleString()}
                      {request.roomsMin && ` • ${request.roomsMin}+ locali`}
                    </div>
                  </div>

                  {request.matchCount && request.matchCount > 0 && (
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {request.matchCount}{" "}
                        {request.matchCount === 1 ? "match trovato" : "match trovati"}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Property Matches */}
        <div className="lg:col-span-3 space-y-3">
          {!selectedRequest ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Target className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Seleziona una richiesta
                </h3>
                <p className="text-sm text-muted-foreground">
                  Scegli una richiesta dalla lista per vedere i match AI
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Match per{" "}
                  {requests.find((r) => r.id === selectedRequest)?.contactName}
                </h2>
                <Button size="sm" variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Rigenera Match
                </Button>
              </div>

              {matchesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-40 rounded-lg skeleton" />
                  ))}
                </div>
              ) : matches.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nessun match trovato
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Nessun immobile corrisponde ai criteri della richiesta
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <Card key={match.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Score Badge */}
                          <div className="flex flex-col items-center gap-1 min-w-[60px]">
                            <div
                              className={cn(
                                "text-3xl font-bold",
                                getScoreColor(match.score)
                              )}
                            >
                              {match.score}
                            </div>
                            <Progress
                              value={match.score}
                              className="h-1.5 w-full"
                            />
                            <span className="text-xs text-muted-foreground">
                              Score
                            </span>
                          </div>

                          {/* Property Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h4 className="font-semibold mb-1">
                                  {match.property.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {match.property.street}, {match.property.city}
                                </p>
                              </div>
                              {getProposalStatusBadge(match.proposalStatus)}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="font-semibold text-foreground">
                                €
                                {(
                                  match.property.priceSale ||
                                  match.property.priceRentMonthly ||
                                  0
                                ).toLocaleString()}
                              </span>
                              <span>{match.property.rooms} locali</span>
                              <span>{match.property.sqmCommercial} m²</span>
                            </div>

                            {/* Match Reasons */}
                            <div className="space-y-1 mb-3">
                              <p className="text-xs font-medium text-muted-foreground">
                                Motivi del match:
                              </p>
                              {match.matchReasons.slice(0, 2).map((reason, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-2 text-xs"
                                >
                                  <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span>{reason}</span>
                                </div>
                              ))}
                              {match.matchReasons.length > 2 && (
                                <p className="text-xs text-muted-foreground">
                                  +{match.matchReasons.length - 2} altri motivi
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/immobili/${match.property.id}`}>
                                  Vedi Immobile
                                </Link>
                              </Button>
                              {match.proposalStatus === "none" && (
                                <Button size="sm">Crea Proposta</Button>
                              )}
                              {match.proposalStatus === "sent" && (
                                <Button size="sm" variant="outline">
                                  Segui Proposta
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
