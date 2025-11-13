"use client";

import Link from "next/link";
import { Building2, Heart, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  PROPERTY_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
} from "@/lib/constants";

/**
 * CRM IMMOBILIARE - Property Card Component
 *
 * Professional property card for list views with:
 * - Thumbnail (120x120) with type badge
 * - Property info (type, address, price, details)
 * - Favorite heart icon
 * - Match badge (optional)
 *
 * @module features/PropertyCard
 * @since v3.1.1
 */

interface PropertyCardProps {
  property: {
    id: string;
    code: string;
    contractType: string;
    propertyType: string;
    street: string;
    civic?: string | null;
    city: string;
    province: string;
    zone?: string | null;
    priceSale?: number | null;
    priceRentMonthly?: number | null;
    sqmCommercial?: number | null;
    rooms?: number | null;
    bedrooms?: number | null;
    status: string;
    photosCount: number;
  };
  matchScore?: number; // 0-100 if from matching
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
}

export function PropertyCard({
  property,
  matchScore,
  isFavorite = false,
  onFavoriteToggle,
}: PropertyCardProps) {
  // Get price based on contract type
  const price = property.contractType === "sale"
    ? property.priceSale
    : property.priceRentMonthly;

  // Format price
  const formattedPrice = price
    ? new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(price)
    : "Prezzo da definire";

  // Build address string
  const addressLine1 = `${property.street}${property.civic ? `, ${property.civic}` : ""}`;
  const addressLine2 = property.zone
    ? `${property.zone} • ${property.city}`
    : property.city;

  // Build details string
  const details: string[] = [];
  if (property.sqmCommercial) details.push(`${property.sqmCommercial} m²`);
  if (property.rooms) details.push(`${property.rooms} locali`);
  if (property.bedrooms) details.push(`${property.bedrooms} camere`);

  return (
    <Link
      href={`/immobili/${property.id}`}
      className="flex gap-4 rounded-lg border bg-card p-3 transition-all hover:shadow-md hover:bg-accent/50"
    >
      {/* Thumbnail */}
      <div className="relative h-[120px] w-[120px] flex-shrink-0">
        <div className="h-full w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {property.photosCount > 0 ? (
            // TODO: Load actual thumbnail when media system is implemented
            <div className="relative h-full w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground/40" />
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                {property.photosCount} foto
              </div>
            </div>
          ) : (
            <Building2 className="h-12 w-12 text-muted-foreground/40" />
          )}
        </div>

        {/* Contract Type Badge */}
        <Badge
          variant={property.contractType === "sale" ? "default" : "secondary"}
          className="absolute top-2 left-2 text-xs"
        >
          {CONTRACT_TYPE_LABELS[property.contractType as keyof typeof CONTRACT_TYPE_LABELS]}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* Top Section */}
        <div>
          {/* Type & City */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-muted-foreground">
              {PROPERTY_TYPE_LABELS[property.propertyType as keyof typeof PROPERTY_TYPE_LABELS] || property.propertyType}
            </p>

            {/* Match Score Badge */}
            {matchScore !== undefined && matchScore > 0 && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-semibold",
                  matchScore >= 80 && "border-green-500 text-green-700 bg-green-50",
                  matchScore >= 60 && matchScore < 80 && "border-blue-500 text-blue-700 bg-blue-50",
                  matchScore < 60 && "border-orange-500 text-orange-700 bg-orange-50"
                )}
              >
                {matchScore}% match
              </Badge>
            )}
          </div>

          {/* Address */}
          <h3 className="font-semibold text-base mb-0.5 line-clamp-1">
            {addressLine1}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3" />
            {addressLine2}
          </p>
        </div>

        {/* Bottom Section */}
        <div className="flex items-end justify-between">
          {/* Details */}
          <div className="text-sm text-muted-foreground">
            {details.length > 0 ? details.join(" • ") : "Dettagli da completare"}
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-xl font-bold text-foreground">
              {formattedPrice}
            </p>
            {property.contractType === "rent" && (
              <p className="text-xs text-muted-foreground">/mese</p>
            )}
          </div>
        </div>
      </div>

      {/* Favorite Icon */}
      <div className="flex-shrink-0">
        <button
          onClick={(e) => {
            e.preventDefault();
            onFavoriteToggle?.(property.id);
          }}
          className="p-2 rounded-full hover:bg-accent transition-colors"
          aria-label="Aggiungi ai preferiti"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground hover:text-red-500"
            )}
          />
        </button>
      </div>
    </Link>
  );
}
