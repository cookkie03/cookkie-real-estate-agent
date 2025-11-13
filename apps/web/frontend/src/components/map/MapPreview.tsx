/**
 * CRM IMMOBILIARE - Map Preview Component
 *
 * Static preview map showing property distribution with urgency colors.
 * Displayed in /immobili page above property list.
 *
 * Features:
 * - Read-only map (280px height)
 * - Building markers with urgency colors
 * - Auto-center on operational area (Corbetta + nearby)
 * - Click anywhere → navigate to full map
 *
 * @module components/map/MapPreview
 * @since v3.2.0
 */

'use client';

import { useEffect, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet (no SSR)
const DynamicMap = dynamic(
  () => import('./MapPreviewInner'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] flex items-center justify-center bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
);

interface Building {
  id: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  stats: {
    total: number;
    active: number;
    avgUrgency: number;
  };
}

interface MapPreviewProps {
  filters?: {
    city?: string;
    minUrgency?: number;
  };
}

export function MapPreview({ filters }: MapPreviewProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBuildings() {
      try {
        setIsLoading(true);
        setError(null);

        // Build query params
        const params = new URLSearchParams();
        if (filters?.city) params.set('city', filters.city);
        if (filters?.minUrgency) params.set('minUrgency', String(filters.minUrgency));

        const response = await fetch(`/api/buildings/geo?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch buildings');
        }

        const data = await response.json();

        if (data.success) {
          setBuildings(data.buildings);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        console.error('[MapPreview] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBuildings();
  }, [filters]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Anteprima Mappa
          </CardTitle>
          {!isLoading && buildings.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {buildings.length} {buildings.length === 1 ? 'edificio' : 'edifici'}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {error ? (
          <div className="h-[280px] flex flex-col items-center justify-center bg-muted rounded-lg mx-4 mb-4">
            <MapPin className="h-12 w-12 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              Impossibile caricare la mappa
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {error}
            </p>
          </div>
        ) : isLoading ? (
          <div className="h-[280px] flex items-center justify-center bg-muted rounded-lg mx-4 mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : buildings.length === 0 ? (
          <div className="h-[280px] flex flex-col items-center justify-center bg-muted rounded-lg mx-4 mb-4">
            <MapPin className="h-12 w-12 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              Nessun edificio da visualizzare
            </p>
          </div>
        ) : (
          <>
            <div className="px-4">
              <DynamicMap buildings={buildings} />
            </div>
          </>
        )}

        <div className="p-4 pt-3">
          <Button
            variant="outline"
            className="w-full"
            asChild
            disabled={isLoading || buildings.length === 0}
          >
            <Link href="/mappa">
              🗺️ Apri Mappa Completa
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
