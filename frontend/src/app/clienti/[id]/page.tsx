"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Users, Mail, Phone, MapPin, ArrowLeft, Star } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, formatPhone } from "@/lib/utils";
import { CONTACT_TYPE_LABELS, CONTACT_STATUS_LABELS, IMPORTANCE_LABELS } from "@/lib/constants";

/**
 * Client Detail Page
 * View detailed information about a contact/client
 */
export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["contact", id],
    queryFn: () => api.contacts.get(id),
    enabled: !!id,
  });

  const contact = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton" />
        <div className="h-64 skeleton" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="py-12 text-center">
        <Users className="mx-auto mb-4 h-12 w-12 opacity-20" />
        <h3 className="text-lg font-medium">Cliente non trovato</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <a
          href="/clienti"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai clienti
        </a>
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-medium text-primary">
            {contact.firstName[0]}{contact.lastName[0]}
          </div>
          <div className="flex-1">
            <h1 className="page-header mb-2">{contact.firstName} {contact.lastName}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge text={CONTACT_TYPE_LABELS[contact.type as keyof typeof CONTACT_TYPE_LABELS]} />
              <Badge text={CONTACT_STATUS_LABELS[contact.status as keyof typeof CONTACT_STATUS_LABELS]} />
              <Badge text={`Importanza: ${IMPORTANCE_LABELS[contact.importance as keyof typeof IMPORTANCE_LABELS]}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="stat-card">
          <h2 className="section-header">Informazioni di Contatto</h2>
          <div className="space-y-3">
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                  {formatPhone(contact.phone)}
                </a>
              </div>
            )}
            {contact.city && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{contact.city}</span>
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <h2 className="section-header">Dettagli</h2>
          <div className="space-y-2 text-sm">
            {contact.source && (
              <div>
                <span className="text-muted-foreground">Provenienza:</span>{" "}
                <span className="font-medium">{contact.source}</span>
              </div>
            )}
            {contact.leadScore && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Lead Score:</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{contact.leadScore}/100</span>
                </div>
              </div>
            )}
            {contact.lastContactDate && (
              <div>
                <span className="text-muted-foreground">Ultimo Contatto:</span>{" "}
                <span className="font-medium">{formatDate(contact.lastContactDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {contact.notes && (
        <div className="stat-card">
          <h2 className="section-header">Note</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
        </div>
      )}

      {/* Related Data */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="stat-card">
          <h2 className="section-header">Richieste</h2>
          <p className="text-sm text-muted-foreground">Le richieste di questo cliente appariranno qui</p>
        </div>

        <div className="stat-card">
          <h2 className="section-header">Attività</h2>
          <p className="text-sm text-muted-foreground">Lo storico delle attività apparirà qui</p>
        </div>
      </div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      {text}
    </span>
  );
}
