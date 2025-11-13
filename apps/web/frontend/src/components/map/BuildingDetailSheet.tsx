/**
 * CRM IMMOBILIARE - Building Detail Sheet Component
 *
 * Side sheet showing building details and properties list.
 * Triggered by clicking a building marker on the map.
 *
 * Features:
 * - Building information (address, year, floors, elevator, etc.)
 * - List of all properties in the building
 * - Quick navigation to property detail
 * - Urgency indicators
 * - Loading/error states
 *
 * @module components/map/BuildingDetailSheet
 * @since v3.2.0
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Building2, MapPin, Calendar, Ruler, Users, Phone, Mail, ArrowRight, Loader2, AlertCircle, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUrgencyColor, getUrgencyEmoji } from '@/lib/map/urgency-colors';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface BuildingDetail {
  id: string;
  code: string;
  address: {
    street: string;
    civic: string;
    city: string;
    province: string;
    zip?: string | null;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  cadastral: {
    sheet?: string | null;
    particle?: string | null;
    zone?: string | null;
  };
  info: {
    yearBuilt?: number | null;
    totalFloors?: number | null;
    totalUnits?: number | null;
    hasElevator: boolean;
    condition?: string | null;
  };
  census: {
    lastSurveyDate?: string | null;
    nextSurveyDue?: string | null;
    unitsSurveyed: number;
    unitsInterested: number;
  };
  administrator?: {
    name: string;
    phone?: string | null;
    email?: string | null;
  } | null;
  stats: {
    total: number;
    active: number;
    sold: number;
    avgUrgency: number | null;
  };
  notes?: string | null;
}

interface Property {
  id: string;
  code: string;
  status: string;
  visibility: string;
  type: string;
  contractType: string;
  location: {
    street: string;
    civic: string;
    internal?: string | null;
    floor?: string | null;
  };
  size: {
    sqm?: number | null;
    rooms?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
  };
  price: {
    sale?: number | null;
    rentMonthly?: number | null;
  };
  urgency: {
    score: number;
    lastActivity?: string | null;
  };
  title?: string | null;
  photosCount: number;
}

interface BuildingDetailSheetProps {
  buildingId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BuildingDetailSheet({ buildingId, isOpen, onClose }: BuildingDetailSheetProps) {
  const [building, setBuilding] = useState<BuildingDetail | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch building details when opened
  useEffect(() => {
    if (!isOpen || !buildingId) {
      return;
    }

    const fetchBuilding = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/buildings/${buildingId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Errore nel caricamento');
        }

        setBuilding(data.building);
        setProperties(data.properties || []);
      } catch (err) {
        console.error('[BuildingDetailSheet] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuilding();
  }, [buildingId, isOpen]);

  // Format condition label
  const getConditionLabel = (condition: string | null | undefined) => {
    const labels: Record<string, string> = {
      excellent: 'Ottimo',
      good: 'Buono',
      fair: 'Discreto',
      poor: 'Mediocre',
      needs_renovation: 'Da ristrutturare',
    };
    return condition ? labels[condition] || condition : '-';
  };

  // Format property type label
  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      apartment: 'Appartamento',
      villa: 'Villa',
      office: 'Ufficio',
      garage: 'Box/Garage',
      land: 'Terreno',
      shop: 'Negozio',
      warehouse: 'Magazzino',
    };
    return labels[type] || type;
  };

  // Format status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Bozza',
      available: 'Disponibile',
      option: 'Opzione',
      sold: 'Venduto',
      rented: 'Affittato',
      suspended: 'Sospeso',
      archived: 'Archiviato',
    };
    return labels[status] || status;
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Caricamento...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button onClick={onClose}>Chiudi</Button>
            </div>
          </div>
        )}

        {!isLoading && !error && building && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {building.address.street} {building.address.civic}
              </SheetTitle>
              <SheetDescription>
                {building.address.city}, {building.address.province}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Building Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Informazioni Edificio</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Anno costruzione</div>
                    <div className="font-medium">{building.info.yearBuilt || '-'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Piani</div>
                    <div className="font-medium">{building.info.totalFloors || '-'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Unità totali</div>
                    <div className="font-medium">{building.info.totalUnits || '-'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Ascensore</div>
                    <div className="font-medium">{building.info.hasElevator ? 'Sì' : 'No'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Condizioni</div>
                    <div className="font-medium">{getConditionLabel(building.info.condition)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Zona catastale</div>
                    <div className="font-medium">{building.cadastral.zone || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Administrator */}
              {building.administrator && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Amministratore</h3>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{building.administrator.name}</span>
                    </div>
                    {building.administrator.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${building.administrator.phone}`} className="hover:underline">
                          {building.administrator.phone}
                        </a>
                      </div>
                    )}
                    {building.administrator.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${building.administrator.email}`} className="hover:underline">
                          {building.administrator.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="text-2xl font-bold">{building.stats.active}</div>
                    <div className="text-muted-foreground">Attivi</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{building.stats.sold}</div>
                    <div className="text-muted-foreground">Venduti</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {building.stats.avgUrgency != null ? building.stats.avgUrgency.toFixed(1) : '-'}
                    </div>
                    <div className="text-muted-foreground">Urgency</div>
                  </div>
                </div>
              </div>

              {/* Properties List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">
                  Immobili ({properties.length})
                </h3>

                {properties.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nessun immobile in questo edificio
                  </p>
                )}

                <div className="space-y-2">
                  {properties.map((property) => (
                    <Link
                      key={property.id}
                      href={`/immobili/${property.id}`}
                      onClick={onClose}
                      className="block p-4 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Home className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-sm truncate">
                              {property.location.internal || property.location.floor || property.code}
                            </span>
                            <span className="text-xs">
                              {getUrgencyEmoji(property.urgency.score)}
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground mb-2">
                            {getPropertyTypeLabel(property.type)} - {getStatusLabel(property.status)}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {property.size.sqm && (
                              <span>{property.size.sqm} m²</span>
                            )}
                            {property.size.rooms && (
                              <span>{property.size.rooms} locali</span>
                            )}
                            {property.price.sale && (
                              <span className="font-medium text-foreground">
                                €{property.price.sale.toLocaleString()}
                              </span>
                            )}
                            {property.price.rentMonthly && (
                              <span className="font-medium text-foreground">
                                €{property.price.rentMonthly.toLocaleString()}/mese
                              </span>
                            )}
                          </div>
                        </div>

                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {building.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Note</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {building.notes}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
