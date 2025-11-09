"use client";

import { useState } from "react";
import { Search, Plus, Filter, User, MapPin, Euro, Home, Target, Calendar, Trash2, Edit, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

/**
 * CRM IMMOBILIARE - Requests List Page
 *
 * Complete requests management:
 * - List all client requests
 * - Filters by status, urgency, client
 * - View details and matches
 * - Edit and delete
 *
 * @module pages/richieste
 * @since v3.2.0
 */

interface Request {
  id: string;
  code: string;
  requestType: string;
  contractType: string;
  status: string;
  urgency: string;
  searchCities: string[];
  searchZones: string[];
  propertyTypes: string[];
  priceMin?: number;
  priceMax?: number;
  roomsMin?: number;
  roomsMax?: number;
  createdAt: string;
  expiresAt?: string;
  contact: {
    id: string;
    fullName: string;
    primaryPhone?: string;
    primaryEmail?: string;
  };
  _count?: {
    matches: number;
  };
}

export default function RequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch requests from API
  const { data, isLoading } = useQuery({
    queryKey: ["requests", statusFilter, urgencyFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (urgencyFilter !== "all") params.append("urgency", urgencyFilter);

      const response = await fetch(`/api/requests?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }
      return response.json();
    },
  });

  const requests: Request[] = data?.requests || [];

  // Filter by search term (client name, city)
  const filteredRequests = requests.filter((request) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      request.contact.fullName.toLowerCase().includes(term) ||
      request.searchCities.some((city) => city.toLowerCase().includes(term)) ||
      request.code.toLowerCase().includes(term)
    );
  });

  // Status badge variants
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

  // Request type label
  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case "search_buy":
        return "Cerca acquisto";
      case "search_rent":
        return "Cerca affitto";
      case "valuation":
        return "Valutazione";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Richieste Clienti</h1>
          <p className="text-muted-foreground">
            Gestisci le richieste di ricerca immobili e genera abbinamenti AI
          </p>
        </div>
        <Button asChild>
          <Link href="/richieste/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuova Richiesta
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca cliente, città, codice..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tutti gli stati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="active">Attive</SelectItem>
                <SelectItem value="paused">In pausa</SelectItem>
                <SelectItem value="satisfied">Soddisfatte</SelectItem>
                <SelectItem value="cancelled">Annullate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tutte le urgenze" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le urgenze</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Bassa</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-muted-foreground">
              <Filter className="h-4 w-4 mr-2" />
              {filteredRequests.length} richieste
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Caricamento richieste...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <h3 className="mb-2 text-lg font-medium">Nessuna richiesta trovata</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || urgencyFilter !== "all"
                  ? "Prova a modificare i filtri di ricerca"
                  : "Crea la prima richiesta per iniziare"}
              </p>
              {!searchTerm && statusFilter === "all" && urgencyFilter === "all" && (
                <Button asChild>
                  <Link href="/richieste/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuova Richiesta
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codice</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ricerca</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgenza</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-accent/50">
                    <TableCell className="font-mono text-sm">
                      {request.code}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{request.contact.fullName}</p>
                          {request.contact.primaryEmail && (
                            <p className="text-xs text-muted-foreground">
                              {request.contact.primaryEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {getRequestTypeLabel(request.requestType)}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {request.contractType === "sale" ? "Vendita" : "Affitto"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{request.searchCities.join(", ")}</span>
                        </div>
                        {request.searchZones.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {request.searchZones.join(", ")}
                          </div>
                        )}
                        {request.propertyTypes.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Home className="h-3 w-3" />
                            <span>{request.propertyTypes.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {request.priceMin || request.priceMax ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Euro className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {request.priceMin?.toLocaleString() || "0"} -{" "}
                            {request.priceMax?.toLocaleString() || "∞"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Non specificato</span>
                      )}
                      {(request.roomsMin || request.roomsMax) && (
                        <div className="text-xs text-muted-foreground">
                          {request.roomsMin}+ locali
                        </div>
                      )}
                    </TableCell>

                    <TableCell>{getStatusBadge(request.status)}</TableCell>

                    <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {request._count?.matches || 0}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/richieste/${request.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/richieste/${request.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {filteredRequests.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredRequests.filter((r) => r.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">Richieste attive</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredRequests.filter((r) => r.urgency === "high").length}
              </div>
              <p className="text-xs text-muted-foreground">Urgenza alta</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredRequests.reduce((sum, r) => sum + (r._count?.matches || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Match totali</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {Math.round(
                  filteredRequests.reduce((sum, r) => sum + (r._count?.matches || 0), 0) /
                    filteredRequests.length
                )}
              </div>
              <p className="text-xs text-muted-foreground">Match per richiesta</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
