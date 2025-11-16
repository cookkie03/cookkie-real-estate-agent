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
import { api } from "@/lib/api";

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

  // Fetch client requests from API
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["client-requests"],
    queryFn: async () => {
      const response = await api.requests.list({ status: "active" });
      const data = response.data;

      // Transform to match interface
      const transformedRequests = data.requests?.map((req: any) => ({
        id: req.id,
        contactId: req.contactId,
        contactName: req.contact?.fullName || "N/D",
        contactEmail: req.contact?.primaryEmail,
        contactPhone: req.contact?.primaryPhone,
        contractType: req.contractType,
        propertyType: req.propertyTypes?.[0],
        city: req.searchCities?.[0] || "N/D",
        zone: req.searchZones?.[0],
        priceMin: req.priceMin,
        priceMax: req.priceMax,
        roomsMin: req.roomsMin,
        roomsMax: req.roomsMax,
        status: req.status,
        createdAt: req.createdAt,
        matchCount: req._count?.matches || 0,
        bestMatchScore: 0, // Will be calculated
      })) || [];

      return { requests: transformedRequests };
    },
  });

  // Fetch matches for selected request using deterministic algorithm
  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ["property-matches", selectedRequest],
    queryFn: async () => {
      if (!selectedRequest) return { matches: [] };

      try {
        // First, get the request to find the contactId
        const requestData = requests.find((r) => r.id === selectedRequest);
        if (!requestData || !requestData.contactId) {
          console.error('Request or contactId not found');
          return { matches: [] };
        }

        // Call NestJS matching API with contactId
        const response = await api.matching.findPropertiesForClient(
          requestData.contactId,
          {
            minScore: 60,
            limit: 10,
            includeBreakdown: true,
          }
        );

        const matchResults = response.data?.matches || [];

        // Transform backend format to frontend format
        const transformedMatches = matchResults.map((match: any, index: number) => ({
          id: `match-${match.propertyId}-${index}`,
          propertyId: match.propertyId,
          requestId: selectedRequest,
          score: Math.round(match.totalScore),
          property: {
            id: match.propertyId,
            title: match.property?.title || 'N/D',
            street: match.property?.street || '',
            city: match.property?.city || '',
            zone: match.property?.zone,
            contractType: match.property?.contractType || 'sale',
            propertyType: match.property?.propertyType || 'apartment',
            priceSale: match.property?.priceSale,
            priceRentMonthly: match.property?.priceRentMonthly,
            rooms: match.property?.rooms,
            sqmCommercial: match.property?.sqmCommercial,
          },
          matchReasons: match.scoreBreakdown
            ? Object.entries(match.scoreBreakdown).map(([key, value]: [string, any]) =>
                `${key}: ${Math.round(value?.score || 0)}%`
              )
            : [],
          proposalStatus: 'none' as const,
        }));

        return { matches: transformedMatches };

      } catch (error) {
        console.error('Error fetching matches:', error);
        return { matches: [] };
      }
    },
    enabled: !!selectedRequest && requests.length > 0,
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
        <h1 className="text-3xl font-bold tracking-tight">Richieste & Matching</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci le richieste clienti e genera abbinamenti intelligenti
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
