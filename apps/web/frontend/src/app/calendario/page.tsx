"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { API_BASE_URL } from "@/lib/constants";
import { FEATURE_FLAGS } from "@/lib/feature-flags";

/**
 * CRM IMMOBILIARE - Calendario (Read-Only)
 *
 * Visualizzazione eventi Google Calendar in sola lettura.
 * NON permette la creazione o modifica di eventi (per requisiti utente).
 *
 * Features:
 * - Sincronizzazione eventi da Google Calendar
 * - Visualizzazione eventi upcoming
 * - Filtro per tipo (meeting, viewing, personal)
 * - Read-only mode (no create/edit/delete)
 *
 * @module pages/calendario
 * @since v4.0.0
 */

interface CalendarEvent {
  id: string;
  googleEventId: string;
  type: string;
  status: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  organizer?: string;
  attendees?: string[];
  metadata?: any;
  lastSyncedAt?: string;
}

export default function CalendarioPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Load events on mount
  useEffect(() => {
    if (FEATURE_FLAGS.CALENDAR_READ) {
      loadEvents();
    }
  }, []);

  // Load events from API
  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const maxResults = 50;
      const timeMin = new Date().toISOString();

      // TODO: Add authentication token
      const response = await fetch(
        `${API_BASE_URL}/calendar/events?maxResults=${maxResults}&timeMin=${timeMin}`
      );

      if (!response.ok) {
        throw new Error(`Failed to load events: ${response.statusText}`);
      }

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
      setLastSync(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore caricamento eventi");
      console.error("Error loading events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync from Google Calendar
  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 days

      // TODO: Add authentication token
      const response = await fetch(
        `${API_BASE_URL}/calendar/sync?timeMin=${timeMin}&timeMax=${timeMax}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const stats = await response.json();
      console.log("Sync completed:", stats);

      // Reload events after sync
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sincronizzazione");
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter events by type
  const filteredEvents = events.filter((event) => {
    if (filterType === "all") return true;
    return event.type === filterType;
  });

  // Group events by date
  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {};

    events.forEach((event) => {
      const date = new Date(event.startTime).toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(event);
    });

    return grouped;
  };

  const groupedEvents = groupEventsByDate(filteredEvents);

  // Format time
  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get event type badge color
  const getEventTypeBadge = (type: string) => {
    const colors: { [key: string]: string } = {
      meeting: "bg-blue-100 text-blue-800",
      viewing: "bg-green-100 text-green-800",
      personal: "bg-gray-100 text-gray-800",
    };

    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (!FEATURE_FLAGS.CALENDAR_READ) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
        <Alert>
          <AlertDescription>
            La funzionalità calendario è disabilitata.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground mt-1">
            Visualizzazione eventi Google Calendar (solo lettura)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastSync && (
            <span className="text-sm text-muted-foreground">
              Ultimo aggiornamento: {lastSync.toLocaleTimeString("it-IT")}
            </span>
          )}
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Sincronizzazione..." : "Sincronizza"}
          </Button>
        </div>
      </div>

      {/* Read-only notice */}
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          Modalità solo lettura: puoi visualizzare gli eventi ma non crearli o modificarli.
          Per aggiungere eventi, usa Google Calendar direttamente.
        </AlertDescription>
      </Alert>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("all")}
        >
          Tutti ({events.length})
        </Button>
        <Button
          variant={filterType === "meeting" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("meeting")}
        >
          Meeting ({events.filter((e) => e.type === "meeting").length})
        </Button>
        <Button
          variant={filterType === "viewing" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("viewing")}
        >
          Visite ({events.filter((e) => e.type === "viewing").length})
        </Button>
        <Button
          variant={filterType === "personal" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("personal")}
        >
          Personali ({events.filter((e) => e.type === "personal").length})
        </Button>
      </div>

      {/* Events List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-4">Caricamento eventi...</p>
          </CardContent>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun evento</h3>
            <p className="text-sm text-muted-foreground">
              {filterType === "all"
                ? "Non ci sono eventi in programma"
                : `Nessun evento di tipo "${filterType}"`}
            </p>
            <Button onClick={handleSync} className="mt-4" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizza da Google Calendar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <div key={date} className="space-y-3">
              <h2 className="text-lg font-semibold capitalize">{date}</h2>
              <div className="space-y-3">
                {dayEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-base">{event.title}</CardTitle>
                            <Badge className={getEventTypeBadge(event.type)}>
                              {event.type}
                            </Badge>
                            {event.status && event.status !== "confirmed" && (
                              <Badge variant="outline">{event.status}</Badge>
                            )}
                          </div>
                          {event.description && (
                            <CardDescription>{event.description}</CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.isAllDay ? (
                            <span>Tutto il giorno</span>
                          ) : (
                            <span>
                              {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </span>
                          )}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.organizer && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{event.organizer}</span>
                          </div>
                        )}
                      </div>
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Partecipanti:</span>
                          <div className="flex flex-wrap gap-1">
                            {event.attendees.map((attendee, i) => (
                              <Badge key={i} variant="secondary">
                                {attendee}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {event.googleEventId && (
                        <div className="flex justify-end pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={`https://calendar.google.com/calendar/event?eid=${event.googleEventId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Apri in Google Calendar
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
