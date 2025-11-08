"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Ruler,
  DoorOpen,
  Bath,
  Phone,
  Calendar,
  Edit,
  Home,
  Zap,
  TreePine,
  Car,
  Flame,
  Wind,
  Shield,
  Waves,
} from "lucide-react";
import { propertiesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  PROPERTY_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * CRM IMMOBILIARE - Property Detail Page
 *
 * Professional property detail page with:
 * - Hero section with gallery (placeholder)
 * - Tabbed content (Info, Details, Documents, History)
 * - Sticky bottom action bar
 * - Quick stats and comprehensive information
 *
 * @module pages/immobili/[id]
 * @since v3.1.1
 */

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertiesApi.get(id),
    enabled: !!id,
  });

  const property = data?.property;

  // Get price
  const price = property?.contractType === "sale"
    ? property?.priceSale
    : property?.priceRentMonthly;

  // Format price
  const formattedPrice = price
    ? new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(price)
    : "Prezzo da definire";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 skeleton" />
        <div className="h-[400px] skeleton rounded-lg" />
        <div className="h-96 skeleton rounded-lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-16 text-center">
        <Building2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
        <h3 className="text-lg font-semibold mb-2">Immobile non trovato</h3>
        <p className="text-sm text-muted-foreground mb-4">
          L'immobile che stai cercando non esiste o è stato rimosso.
        </p>
        <Button onClick={() => router.push("/immobili")}>
          Torna agli immobili
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
          onClick={() => router.push("/immobili")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna agli immobili
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative mb-6">
        {/* Gallery Placeholder */}
        <div className="relative h-[400px] rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Building2 className="h-20 w-20 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {property.photosCount > 0
                  ? `${property.photosCount} foto disponibili`
                  : "Nessuna foto disponibile"}
              </p>
            </div>
          </div>

          {/* Overlay Actions - Top */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-background/80 backdrop-blur hover:bg-background"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-background/80 backdrop-blur hover:bg-background"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Info Below Gallery */}
        <div className="mt-4 space-y-3">
          {/* Contract Type Badge + Price */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant={property.contractType === "sale" ? "default" : "secondary"} className="mb-2">
                {CONTRACT_TYPE_LABELS[property.contractType as keyof typeof CONTRACT_TYPE_LABELS]}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold">
                {formattedPrice}
                {property.contractType === "rent" && (
                  <span className="text-lg text-muted-foreground">/mese</span>
                )}
              </h1>
              {property.condominiumFees && property.condominiumFees > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  + {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(property.condominiumFees)} spese condominiali
                </p>
              )}
            </div>

            {/* Property Code */}
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Codice</p>
              <p className="font-mono text-sm font-medium">{property.code}</p>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-lg font-semibold">
              {property.street}{property.civic && `, ${property.civic}`}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {property.zone && `${property.zone} • `}{property.city}, {property.province}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            {property.sqmCommercial && (
              <div className="flex items-center gap-1.5">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{property.sqmCommercial} m²</span>
              </div>
            )}
            {property.rooms && (
              <div className="flex items-center gap-1.5">
                <DoorOpen className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{property.rooms} locali</span>
              </div>
            )}
            {property.bedrooms && (
              <div className="flex items-center gap-1.5">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{property.bedrooms} camere</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{property.bathrooms} bagni</span>
              </div>
            )}
            {property.floor && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Piano {property.floor}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="details">Dettagli</TabsTrigger>
          <TabsTrigger value="documents">Documenti</TabsTrigger>
          <TabsTrigger value="history">Storico</TabsTrigger>
        </TabsList>

        {/* Tab 1: Info */}
        <TabsContent value="info" className="space-y-4">
          {/* Type & Category */}
          <div className="rounded-lg border bg-card p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tipologia</p>
                <p className="font-medium">
                  {PROPERTY_TYPE_LABELS[property.propertyType as keyof typeof PROPERTY_TYPE_LABELS] || property.propertyType}
                </p>
              </div>
              {property.propertyCategory && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Categoria</p>
                  <p className="font-medium capitalize">{property.propertyCategory}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-2">Descrizione</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {property.description}
              </p>
            </div>
          )}

          {/* Features Grid */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">Caratteristiche</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {property.hasElevator && <FeatureBadge icon={Zap} label="Ascensore" />}
              {property.hasParking && <FeatureBadge icon={Car} label="Parcheggio" />}
              {property.hasGarage && <FeatureBadge icon={Home} label="Garage" />}
              {property.hasGarden && <FeatureBadge icon={TreePine} label="Giardino" />}
              {property.hasTerrace && <FeatureBadge icon={Home} label="Terrazza" />}
              {property.hasBalcony && <FeatureBadge icon={Home} label="Balcone" />}
              {property.hasCellar && <FeatureBadge icon={Home} label="Cantina" />}
              {property.hasAttic && <FeatureBadge icon={Home} label="Soffitta" />}
              {property.hasSwimmingPool && <FeatureBadge icon={Waves} label="Piscina" />}
              {property.hasFireplace && <FeatureBadge icon={Flame} label="Camino" />}
              {property.hasAlarm && <FeatureBadge icon={Shield} label="Allarme" />}
              {property.hasAirConditioning && <FeatureBadge icon={Wind} label="Aria condizionata" />}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Details */}
        <TabsContent value="details" className="space-y-4">
          {/* Specifications */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">Specifiche tecniche</h3>
            <div className="space-y-2">
              {property.condition && (
                <DetailRow label="Stato" value={property.condition} />
              )}
              {property.heatingType && (
                <DetailRow label="Riscaldamento" value={property.heatingType} />
              )}
              {property.energyClass && (
                <DetailRow label="Classe energetica" value={property.energyClass} />
              )}
              {property.yearBuilt && (
                <DetailRow label="Anno costruzione" value={property.yearBuilt.toString()} />
              )}
              {property.yearRenovated && (
                <DetailRow label="Anno ristrutturazione" value={property.yearRenovated.toString()} />
              )}
            </div>
          </div>

          {/* Cadastral Data */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">Dati catastali</h3>
            <div className="space-y-2">
              <DetailRow label="Zona" value={property.zone || "Non specificata"} />
              <DetailRow label="Foglio" value="—" />
              <DetailRow label="Particella" value="—" />
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Documents */}
        <TabsContent value="documents" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Sistema documenti in arrivo nella prossima fase
            </p>
          </div>
        </TabsContent>

        {/* Tab 4: History */}
        <TabsContent value="history" className="space-y-4">
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
              <Phone className="h-4 w-4 mr-2" />
              Contatta
            </Button>
            <Button variant="outline" className="flex-1" disabled>
              <Calendar className="h-4 w-4 mr-2" />
              Visita
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
 * Feature Badge Component
 */
function FeatureBadge({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2 text-sm">
      <Icon className="h-4 w-4 text-primary" />
      <span>{label}</span>
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
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
