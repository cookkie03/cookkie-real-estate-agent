"use client";

import { useState, useEffect } from "react";
import { Mail, Inbox, Send, Archive, RefreshCw, Filter, User, Building2, AlertCircle, Clock, Paperclip } from "lucide-react";
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
 * CRM IMMOBILIARE - Email (Gmail Integration)
 *
 * Visualizzazione email da contatti CRM tramite Gmail API.
 * Filtra solo le email dai clienti presenti nel database CRM.
 *
 * Features:
 * - Lista email da contatti CRM
 * - Filtri per cliente, proprietà, stato, direzione
 * - Visualizzazione dati AI-parsed (intent, urgency, sentiment)
 * - Mark as read/unread
 * - Thread view
 *
 * @module pages/email
 * @since v5.0.0
 */

interface EmailParticipant {
  name?: string;
  email: string;
}

interface EmailMessage {
  id: string;
  threadId: string;
  direction: "inbound" | "outbound";
  status: "unread" | "read" | "archived" | "deleted";
  from: EmailParticipant;
  to: EmailParticipant[];
  cc?: EmailParticipant[];
  subject: string;
  textContent: string;
  htmlContent?: string;
  snippet?: string;
  attachments?: any[];
  sentAt: string;
  receivedAt: string;
  readAt?: string;
  labels: string[];
  contactId?: string;
  propertyId?: string;
  parsedData?: {
    intent?: string;
    propertyRequirements?: any;
    urgency?: "low" | "medium" | "high";
    sentiment?: "positive" | "neutral" | "negative";
    suggestedActions?: string[];
  };
  isParsed: boolean;
  priorityScore?: number;
  needsAction?: boolean;
}

export default function EmailPage() {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load emails on mount
  useEffect(() => {
    if (FEATURE_FLAGS.EMAIL_READ) {
      loadEmails();
    }
  }, [filterStatus, filterDirection]);

  // Load emails from API
  const loadEmails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterDirection !== "all") params.append("direction", filterDirection);
      params.append("limit", "100");

      // TODO: Add authentication token
      const response = await fetch(
        `${API_BASE_URL}/gmail/contacts/emails?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to load emails: ${response.statusText}`);
      }

      const data = await response.json();
      setEmails(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore caricamento email");
      console.error("Error loading emails:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync inbox
  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);

    try {
      // TODO: Add authentication token
      const response = await fetch(
        `${API_BASE_URL}/gmail/sync?maxResults=50&parseContent=true`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Reload emails after sync
      await loadEmails();

      alert(`✅ Sincronizzati ${data.count} messaggi`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sincronizzazione");
      console.error("Error syncing inbox:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Mark as read/unread
  const toggleReadStatus = async (email: EmailMessage) => {
    try {
      const endpoint = email.status === "read"
        ? `${API_BASE_URL}/gmail/messages/${email.id}/unread`
        : `${API_BASE_URL}/gmail/messages/${email.id}/read`;

      // TODO: Add authentication token
      const response = await fetch(endpoint, { method: "POST" });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      // Update local state
      setEmails(emails.map(e =>
        e.id === email.id
          ? { ...e, status: email.status === "read" ? "unread" : "read" as any }
          : e
      ));
    } catch (err) {
      console.error("Error toggling read status:", err);
      alert("Errore aggiornamento stato");
    }
  };

  // Filter emails by search query
  const filteredEmails = emails.filter(email => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      email.subject.toLowerCase().includes(query) ||
      email.from.email.toLowerCase().includes(query) ||
      email.from.name?.toLowerCase().includes(query) ||
      email.textContent.toLowerCase().includes(query)
    );
  });

  // Group emails by date
  const groupedEmails = filteredEmails.reduce((acc, email) => {
    const date = new Date(email.receivedAt).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(email);
    return acc;
  }, {} as Record<string, EmailMessage[]>);

  // Get intent badge color
  const getIntentBadgeColor = (intent?: string) => {
    switch (intent) {
      case "property_inquiry": return "bg-blue-500";
      case "viewing_request": return "bg-green-500";
      case "complaint": return "bg-red-500";
      case "feedback": return "bg-purple-500";
      default: return "bg-gray-500";
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

  // Get sentiment emoji
  const getSentimentEmoji = (sentiment?: string) => {
    switch (sentiment) {
      case "positive": return "😊";
      case "negative": return "😞";
      default: return "😐";
    }
  };

  // Format date
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!FEATURE_FLAGS.EMAIL_READ) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            La funzionalità Email è disabilitata. Contatta l'amministratore.
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
            <Mail className="h-8 w-8" />
            Email
          </h1>
          <p className="text-muted-foreground mt-1">
            Email da contatti CRM ({filteredEmails.length} messaggi)
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
            {isSyncing ? "Sincronizzazione..." : "Sincronizza"}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Cerca</label>
              <Input
                placeholder="Cerca per oggetto, mittente, contenuto..."
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
                  <SelectItem value="unread">Non letti</SelectItem>
                  <SelectItem value="read">Letti</SelectItem>
                  <SelectItem value="archived">Archiviati</SelectItem>
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

      {/* Email List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento email...</p>
        </div>
      ) : filteredEmails.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nessuna email trovata. Prova a sincronizzare la inbox.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEmails).map(([date, dayEmails]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {date}
              </h2>

              <div className="space-y-2">
                {dayEmails.map((email) => (
                  <Card
                    key={email.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      email.status === "unread" && "border-l-4 border-l-blue-500",
                      email.needsAction && "border-l-4 border-l-red-500",
                      selectedEmail?.id === email.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Email info */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-2">
                            {email.direction === "inbound" ? (
                              <Inbox className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Send className="h-4 w-4 text-green-500" />
                            )}

                            <span className="font-semibold truncate">
                              {email.from.name || email.from.email}
                            </span>

                            <span className="text-sm text-muted-foreground">
                              {formatTime(email.receivedAt)}
                            </span>

                            {email.status === "unread" && (
                              <Badge variant="default" className="text-xs">
                                Nuovo
                              </Badge>
                            )}

                            {email.attachments && email.attachments.length > 0 && (
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          {/* Subject */}
                          <h3 className="font-medium mb-1 truncate">{email.subject}</h3>

                          {/* Snippet */}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {email.snippet || email.textContent.substring(0, 150) + "..."}
                          </p>

                          {/* AI Parsed Data */}
                          {email.isParsed && email.parsedData && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {email.parsedData.intent && (
                                <Badge
                                  className={cn("text-xs", getIntentBadgeColor(email.parsedData.intent))}
                                >
                                  {email.parsedData.intent.replace("_", " ")}
                                </Badge>
                              )}

                              {email.parsedData.urgency && (
                                <Badge
                                  className={cn("text-xs", getUrgencyBadgeColor(email.parsedData.urgency))}
                                >
                                  {email.parsedData.urgency}
                                </Badge>
                              )}

                              {email.parsedData.sentiment && (
                                <Badge variant="outline" className="text-xs">
                                  {getSentimentEmoji(email.parsedData.sentiment)} {email.parsedData.sentiment}
                                </Badge>
                              )}

                              {email.contactId && (
                                <Badge variant="secondary" className="text-xs">
                                  <User className="h-3 w-3 mr-1" />
                                  Cliente CRM
                                </Badge>
                              )}

                              {email.propertyId && (
                                <Badge variant="secondary" className="text-xs">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Proprietà collegata
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-col items-end gap-2">
                          {email.priorityScore !== undefined && (
                            <Badge
                              variant={email.priorityScore >= 70 ? "destructive" : "outline"}
                              className="text-xs"
                            >
                              Priorità: {email.priorityScore}
                            </Badge>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReadStatus(email);
                            }}
                          >
                            {email.status === "read" ? "Segna come non letto" : "Segna come letto"}
                          </Button>
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

      {/* Email Detail Modal/Sidebar (Selected Email) */}
      {selectedEmail && (
        <Card className="fixed bottom-0 right-0 w-full md:w-2/3 lg:w-1/2 max-h-[80vh] overflow-y-auto shadow-2xl border-2">
          <CardHeader className="sticky top-0 bg-background z-10 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>{selectedEmail.subject}</CardTitle>
                <CardDescription>
                  Da: {selectedEmail.from.name || selectedEmail.from.email}
                  <br />
                  A: {selectedEmail.to.map(t => t.email).join(", ")}
                  <br />
                  {new Date(selectedEmail.receivedAt).toLocaleString("it-IT")}
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedEmail(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* AI Parsed Data */}
            {selectedEmail.isParsed && selectedEmail.parsedData && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Analysis:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {selectedEmail.parsedData.intent && (
                      <li>Intent: {selectedEmail.parsedData.intent}</li>
                    )}
                    {selectedEmail.parsedData.urgency && (
                      <li>Urgency: {selectedEmail.parsedData.urgency}</li>
                    )}
                    {selectedEmail.parsedData.sentiment && (
                      <li>Sentiment: {selectedEmail.parsedData.sentiment}</li>
                    )}
                    {selectedEmail.parsedData.suggestedActions && selectedEmail.parsedData.suggestedActions.length > 0 && (
                      <li>Suggested Actions: {selectedEmail.parsedData.suggestedActions.join(", ")}</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Email Content */}
            <div className="prose prose-sm max-w-none">
              {selectedEmail.htmlContent ? (
                <div dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }} />
              ) : (
                <pre className="whitespace-pre-wrap font-sans">{selectedEmail.textContent}</pre>
              )}
            </div>

            {/* Attachments */}
            {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Allegati ({selectedEmail.attachments.length})
                </h4>
                <ul className="space-y-1">
                  {selectedEmail.attachments.map((att, idx) => (
                    <li key={idx} className="text-sm">
                      📎 {att.filename} ({Math.round(att.size / 1024)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
