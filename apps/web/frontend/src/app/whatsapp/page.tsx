"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, Image, FileText, MapPin, RefreshCw, Filter, User, Building2, AlertCircle, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/constants";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { cn } from "@/lib/utils";

/**
 * CRM IMMOBILIARE - WhatsApp (Business API Integration)
 *
 * Visualizzazione messaggi WhatsApp da contatti CRM.
 * Filtra solo i messaggi dai clienti presenti nel database CRM.
 *
 * Features:
 * - Lista messaggi da contatti CRM
 * - Filtri per cliente, proprietà, stato, direzione, tipo
 * - Supporto media (immagini, documenti)
 * - Visualizzazione dati AI-parsed (intent, urgency)
 * - Indicatori di stato (sent, delivered, read)
 *
 * @module pages/whatsapp
 * @since v5.0.0
 */

interface WhatsAppMedia {
  id?: string;
  url?: string;
  mimeType?: string;
  caption?: string;
  filename?: string;
}

interface WhatsAppLocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

interface WhatsAppMessage {
  id: string;
  direction: "inbound" | "outbound";
  status: "sent" | "delivered" | "read" | "failed";
  type: "text" | "image" | "document" | "audio" | "video" | "location" | "template" | "interactive";
  from: string;
  to: string;
  text?: string;
  media?: WhatsAppMedia;
  location?: WhatsAppLocation;
  timestamp: string;
  contactId?: string;
  propertyId?: string;
  parsedData?: {
    intent?: string;
    requirements?: any;
    urgency?: "low" | "medium" | "high";
  };
  isParsed: boolean;
}

export default function WhatsAppPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load messages on mount
  useEffect(() => {
    if (FEATURE_FLAGS.WHATSAPP_READ) {
      loadMessages();
    }
  }, [filterStatus, filterDirection, filterType]);

  // Load messages from API
  const loadMessages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterDirection !== "all") params.append("direction", filterDirection);
      if (filterType !== "all") params.append("type", filterType);
      params.append("limit", "100");

      // TODO: Add authentication token
      const response = await fetch(
        `${API_BASE_URL}/whatsapp/contacts/messages?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.statusText}`);
      }

      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore caricamento messaggi");
      console.error("Error loading messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter messages by search query
  const filteredMessages = messages.filter(msg => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.text?.toLowerCase().includes(query) ||
      msg.from.toLowerCase().includes(query) ||
      msg.media?.caption?.toLowerCase().includes(query)
    );
  });

  // Group messages by contact (phone number)
  const groupedMessages = filteredMessages.reduce((acc, msg) => {
    const contact = msg.direction === "inbound" ? msg.from : msg.to;
    if (!acc[contact]) acc[contact] = [];
    acc[contact].push(msg);
    return acc;
  }, {} as Record<string, WhatsAppMessage[]>);

  // Get message type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="h-4 w-4" />;
      case "document": return <FileText className="h-4 w-4" />;
      case "location": return <MapPin className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "read": return "bg-green-500";
      case "delivered": return "bg-blue-500";
      case "sent": return "bg-yellow-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  // Get urgency badge color
  const getUrgencyBadgeColor = (urgency?: string) => {
    switch (urgency) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-400";
    }
  };

  // Format phone number
  const formatPhone = (phone: string) => {
    // Simple formatting for Italian numbers
    if (phone.startsWith("+39")) {
      return phone.replace("+39", "+39 ");
    }
    return phone;
  };

  // Format time
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!FEATURE_FLAGS.WHATSAPP_READ) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            La funzionalità WhatsApp è disabilitata. Contatta l'amministratore.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="h-8 w-8 text-green-600" />
            WhatsApp
          </h1>
          <p className="text-muted-foreground mt-1">
            Messaggi da contatti CRM ({filteredMessages.length} messaggi)
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={loadMessages}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Cerca</label>
              <Input
                placeholder="Cerca per testo, numero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Stato</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="read">Letti</SelectItem>
                  <SelectItem value="delivered">Consegnati</SelectItem>
                  <SelectItem value="sent">Inviati</SelectItem>
                  <SelectItem value="failed">Falliti</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Direzione</label>
              <Select value={filterDirection} onValueChange={setFilterDirection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="inbound">In entrata</SelectItem>
                  <SelectItem value="outbound">In uscita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="text">Testo</SelectItem>
                  <SelectItem value="image">Immagine</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                  <SelectItem value="location">Posizione</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Message List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento messaggi...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nessun messaggio trovato. I messaggi in arrivo verranno salvati automaticamente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([contact, contactMessages]) => (
            <div key={contact}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                {formatPhone(contact)}
                <Badge variant="secondary" className="text-xs">
                  {contactMessages.length} messaggi
                </Badge>
              </h2>

              <div className="space-y-2">
                {contactMessages.map((msg) => (
                  <Card
                    key={msg.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      msg.direction === "inbound" && "border-l-4 border-l-green-500",
                      msg.direction === "outbound" && "border-l-4 border-l-blue-500",
                      selectedMessage?.id === msg.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Message info */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(msg.type)}

                            <span className="text-sm font-medium">
                              {msg.direction === "inbound" ? "Ricevuto" : "Inviato"}
                            </span>

                            <span className="text-sm text-muted-foreground">
                              {formatDate(msg.timestamp)} {formatTime(msg.timestamp)}
                            </span>

                            <Badge className={cn("text-xs", getStatusBadgeColor(msg.status))}>
                              {msg.status}
                            </Badge>
                          </div>

                          {/* Content */}
                          {msg.type === "text" && msg.text && (
                            <p className="text-sm mb-2 line-clamp-3">{msg.text}</p>
                          )}

                          {msg.type === "image" && msg.media && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Image className="h-4 w-4" />
                              <span>Immagine</span>
                              {msg.media.caption && (
                                <span className="text-xs">- {msg.media.caption}</span>
                              )}
                            </div>
                          )}

                          {msg.type === "document" && msg.media && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <span>Documento: {msg.media.filename}</span>
                            </div>
                          )}

                          {msg.type === "location" && msg.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {msg.location.name || "Posizione"} - {msg.location.address}
                              </span>
                            </div>
                          )}

                          {/* AI Parsed Data */}
                          {msg.isParsed && msg.parsedData && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {msg.parsedData.intent && (
                                <Badge variant="outline" className="text-xs">
                                  {msg.parsedData.intent.replace("_", " ")}
                                </Badge>
                              )}

                              {msg.parsedData.urgency && (
                                <Badge
                                  className={cn("text-xs", getUrgencyBadgeColor(msg.parsedData.urgency))}
                                >
                                  Urgenza: {msg.parsedData.urgency}
                                </Badge>
                              )}

                              {msg.contactId && (
                                <Badge variant="secondary" className="text-xs">
                                  <User className="h-3 w-3 mr-1" />
                                  Cliente CRM
                                </Badge>
                              )}

                              {msg.propertyId && (
                                <Badge variant="secondary" className="text-xs">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Proprietà collegata
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right: Type badge */}
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className="text-xs">
                            {msg.type}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail Modal/Sidebar (Selected Message) */}
      {selectedMessage && (
        <Card className="fixed bottom-0 right-0 w-full md:w-2/3 lg:w-1/2 max-h-[80vh] overflow-y-auto shadow-2xl border-2">
          <CardHeader className="sticky top-0 bg-background z-10 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedMessage.type)}
                  {selectedMessage.type.toUpperCase()}
                </CardTitle>
                <CardDescription>
                  {selectedMessage.direction === "inbound" ? "Da" : "A"}: {formatPhone(selectedMessage.direction === "inbound" ? selectedMessage.from : selectedMessage.to)}
                  <br />
                  {new Date(selectedMessage.timestamp).toLocaleString("it-IT")}
                  <br />
                  Stato: <Badge className={cn("text-xs ml-1", getStatusBadgeColor(selectedMessage.status))}>{selectedMessage.status}</Badge>
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedMessage(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* AI Parsed Data */}
            {selectedMessage.isParsed && selectedMessage.parsedData && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Analysis:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {selectedMessage.parsedData.intent && (
                      <li>Intent: {selectedMessage.parsedData.intent}</li>
                    )}
                    {selectedMessage.parsedData.urgency && (
                      <li>Urgency: {selectedMessage.parsedData.urgency}</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Text Content */}
            {selectedMessage.type === "text" && selectedMessage.text && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedMessage.text}</p>
              </div>
            )}

            {/* Image */}
            {selectedMessage.type === "image" && selectedMessage.media && (
              <div className="space-y-2">
                {selectedMessage.media.url ? (
                  <img
                    src={selectedMessage.media.url}
                    alt="WhatsApp image"
                    className="max-w-full rounded-lg"
                  />
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg text-center">
                    <Image className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Immagine (ID: {selectedMessage.media.id})
                    </p>
                  </div>
                )}
                {selectedMessage.media.caption && (
                  <p className="text-sm text-muted-foreground">{selectedMessage.media.caption}</p>
                )}
              </div>
            )}

            {/* Document */}
            {selectedMessage.type === "document" && selectedMessage.media && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedMessage.media.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedMessage.media.mimeType}
                      </p>
                    </div>
                  </div>
                  {selectedMessage.media.url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={selectedMessage.media.url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Scarica
                      </a>
                    </Button>
                  )}
                </div>
                {selectedMessage.media.caption && (
                  <p className="text-sm text-muted-foreground mt-3">{selectedMessage.media.caption}</p>
                )}
              </div>
            )}

            {/* Location */}
            {selectedMessage.type === "location" && selectedMessage.location && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    {selectedMessage.location.name && (
                      <p className="font-medium">{selectedMessage.location.name}</p>
                    )}
                    {selectedMessage.location.address && (
                      <p className="text-sm text-muted-foreground">{selectedMessage.location.address}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Lat: {selectedMessage.location.latitude}, Lng: {selectedMessage.location.longitude}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild className="w-full">
                  <a
                    href={`https://www.google.com/maps?q=${selectedMessage.location.latitude},${selectedMessage.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apri in Google Maps
                  </a>
                </Button>
              </div>
            )}

            {/* Contact & Property Links */}
            <div className="flex gap-2">
              {selectedMessage.contactId && (
                <Badge variant="secondary">
                  <User className="h-3 w-3 mr-1" />
                  Cliente CRM: {selectedMessage.contactId}
                </Badge>
              )}
              {selectedMessage.propertyId && (
                <Badge variant="secondary">
                  <Building2 className="h-3 w-3 mr-1" />
                  Proprietà: {selectedMessage.propertyId}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
