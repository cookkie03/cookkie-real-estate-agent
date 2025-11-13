"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  MessageSquare,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * CRM IMMOBILIARE - Client Detail Page
 *
 * Professional client detail with avatar, contact info, and tabs
 *
 * @module pages/clienti/[id]
 * @since v3.1.1
 */

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["contact", id],
    queryFn: () => api.contacts.get(id),
    enabled: !!id,
  });

  const contact = data?.contact;

  // Get initials
  const initials = contact?.firstName && contact?.lastName
    ? `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
    : contact?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || "?";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 skeleton" />
        <div className="h-40 skeleton rounded-lg" />
        <div className="h-96 skeleton rounded-lg" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="py-16 text-center">
        <Users className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
        <h3 className="text-lg font-semibold mb-2">Cliente non trovato</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Il cliente che stai cercando non esiste o è stato rimosso.
        </p>
        <Button onClick={() => router.push("/clienti")}>
          Torna ai clienti
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-0 pb-20">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/clienti")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai clienti
        </Button>
      </div>

      {/* Hero Section */}
      <div className="mb-6 space-y-4">
        {/* Avatar + Name */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {contact.fullName}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Codice: {contact.code}
                </p>
              </div>

              {/* Importance Badge */}
              {contact.importance === "high" && (
                <Badge variant="destructive">VIP</Badge>
              )}
            </div>

            {/* Contact Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              {contact.primaryPhone && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = `tel:${contact.primaryPhone}`}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  {contact.primaryPhone}
                </Button>
              )}
              {contact.primaryEmail && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = `mailto:${contact.primaryEmail}`}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  {contact.primaryEmail}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        {(contact.city || contact.province) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {contact.city}{contact.province && `, ${contact.province}`}
            </span>
          </div>
        )}
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="requests">Richieste</TabsTrigger>
          <TabsTrigger value="activity">Attività</TabsTrigger>
        </TabsList>

        {/* Tab 1: Info */}
        <TabsContent value="info" className="space-y-4">
          {/* Contact Details */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">Dettagli Contatto</h3>
            <div className="space-y-2">
              <DetailRow label="Status" value={contact.status} />
              <DetailRow label="Importanza" value={contact.importance} />
              {contact.entityType && (
                <DetailRow label="Tipo entità" value={contact.entityType} />
              )}
            </div>
          </div>

          {/* Address */}
          {contact.street && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-3">Indirizzo</h3>
              <div className="space-y-2">
                <DetailRow label="Via" value={`${contact.street}${contact.civic ? `, ${contact.civic}` : ''}`} />
                <DetailRow label="Città" value={contact.city || "—"} />
                <DetailRow label="CAP" value={contact.zip || "—"} />
              </div>
            </div>
          )}

          {/* Budget */}
          {(contact.budgetMin || contact.budgetMax) && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-3">Budget di Ricerca</h3>
              <div className="space-y-2">
                {contact.budgetMin && (
                  <DetailRow
                    label="Budget minimo"
                    value={new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(contact.budgetMin)}
                  />
                )}
                {contact.budgetMax && (
                  <DetailRow
                    label="Budget massimo"
                    value={new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(contact.budgetMax)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-2">Note</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {contact.notes}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Requests */}
        <TabsContent value="requests" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Sistema richieste in arrivo nella prossima fase
            </p>
          </div>
        </TabsContent>

        {/* Tab 3: Activity */}
        <TabsContent value="activity" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Storico attività in arrivo nella prossima fase
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto p-4">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" disabled>
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button variant="outline" className="flex-1" disabled>
              <Calendar className="h-4 w-4 mr-2" />
              Appuntamento
            </Button>
            <Button variant="default" className="flex-1" disabled>
              <Edit className="h-4 w-4 mr-2" />
              Modifica
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Detail Row Component
 */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium capitalize">{value}</span>
    </div>
  );
}
