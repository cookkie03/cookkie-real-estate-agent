"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Building2, MapPin, Ruler, DoorOpen, Bath, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatSquareMeters, formatDate } from "@/lib/utils";
import { PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants";

/**
 * Property Detail Page
 * View detailed information about a property
 */
export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => api.properties.get(id),
    enabled: !!id,
  });

  const property = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton" />
        <div className="h-64 skeleton" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-12 text-center">
        <Building2 className="mx-auto mb-4 h-12 w-12 opacity-20" />
        <h3 className="text-lg font-medium">Immobile non trovato</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <a
          href="/immobili"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna agli immobili
        </a>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-header">{property.street}, {property.city}</h1>
            <p className="text-muted-foreground">
              Codice: {property.code}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{formatCurrency(property.price)}</p>
            <p className="text-sm text-muted-foreground">
              {PROPERTY_STATUS_LABELS[property.status as keyof typeof PROPERTY_STATUS_LABELS]}
            </p>
          </div>
        </div>
      </div>

      {/* Image Gallery Placeholder */}
      <div className="stat-card">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <Building2 className="h-16 w-16 text-muted-foreground opacity-20" />
        </div>
      </div>

      {/* Property Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="stat-card">
          <h2 className="section-header">Dettagli</h2>
          <div className="space-y-3">
            <DetailRow icon={MapPin} label="Indirizzo" value={`${property.street} ${property.streetNumber || ''}, ${property.city}`} />
            <DetailRow icon={Building2} label="Tipo" value={PROPERTY_TYPE_LABELS[property.propertyType as keyof typeof PROPERTY_TYPE_LABELS]} />
            {property.squareMeters && (
              <DetailRow icon={Ruler} label="Superficie" value={formatSquareMeters(property.squareMeters)} />
            )}
            {property.rooms && (
              <DetailRow icon={DoorOpen} label="Locali" value={property.rooms.toString()} />
            )}
            {property.bathrooms && (
              <DetailRow icon={Bath} label="Bagni" value={property.bathrooms.toString()} />
            )}
          </div>
        </div>

        <div className="stat-card">
          <h2 className="section-header">Caratteristiche</h2>
          <div className="flex flex-wrap gap-2">
            {property.hasElevator && <Badge text="Ascensore" />}
            {property.hasParking && <Badge text="Parcheggio" />}
            {property.hasGarden && <Badge text="Giardino" />}
            {property.hasBalcony && <Badge text="Balcone" />}
            {property.energyClass && <Badge text={`Classe ${property.energyClass}`} />}
          </div>
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <div className="stat-card">
          <h2 className="section-header">Descrizione</h2>
          <p className="text-muted-foreground">{property.description}</p>
        </div>
      )}

      {/* Owner */}
      {property.owner && (
        <div className="stat-card">
          <h2 className="section-header">Proprietario</h2>
          <p className="font-medium">{property.owner.firstName} {property.owner.lastName}</p>
          {property.owner.phone && <p className="text-sm text-muted-foreground">{property.owner.phone}</p>}
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
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
