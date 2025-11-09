/**
 * CRM IMMOBILIARE - Interactive Map Page
 *
 * Full-screen interactive map with all buildings and properties.
 *
 * @module app/mappa
 * @since v3.2.0
 */

"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Map as MapIcon, AlertCircle } from 'lucide-react';
import { LegendPanel } from '@/components/map/LegendPanel';
import { LayerSwitcher } from '@/components/map/LayerSwitcher';
import { QuickFilters } from '@/components/map/QuickFilters';
import { BuildingDetailSheet } from '@/components/map/BuildingDetailSheet';
import { Button } from '@/components/ui/button';

// Dynamic import for InteractiveMap (Leaflet doesn't support SSR)
const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap').then(mod => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
);

interface Building {
  id: string;
  code: string;
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

interface BuildingsResponse {
  success: boolean;
  buildings: Building[];
  count: number;
}

export default function MapPage() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map controls state
  const [layerType, setLayerType] = useState<'satellite' | 'streets'>('satellite');
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);
  const [hideSold, setHideSold] = useState(false);

  // Building detail sheet state
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch buildings
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/buildings/geo');

        if (!response.ok) {
          throw new Error('Errore nel caricamento dei dati');
        }

        const data: BuildingsResponse = await response.json();

        if (!data.success) {
          throw new Error('Errore nel caricamento dei dati');
        }

        setBuildings(data.buildings);
      } catch (err) {
        console.error('[MapPage] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  // Calculate urgency distribution for legend
  const urgencyDistribution = buildings.reduce((acc, building) => {
    const urgency = Math.round(building.stats.avgUrgency);
    acc[urgency] = (acc[urgency] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Handle building click - Open detail sheet
  const handleBuildingClick = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setIsSheetOpen(true);
  };

  // Close sheet
  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    // Delay clearing selectedBuildingId to allow sheet closing animation
    setTimeout(() => setSelectedBuildingId(null), 300);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="h-16 border-b bg-background px-4 flex items-center gap-4 shrink-0 z-10">
        <Link href="/immobili">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Mappa Interattiva</h1>
          <p className="text-xs text-muted-foreground">
            {isLoading ? 'Caricamento...' : `${buildings.length} edifici`}
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Loading State */}
        {isLoading && (
          <div className="h-full flex items-center justify-center bg-muted">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Caricamento mappa...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="h-full flex items-center justify-center bg-muted">
            <div className="text-center max-w-md px-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Errore di caricamento</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Ricarica pagina
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && buildings.length === 0 && (
          <div className="h-full flex items-center justify-center bg-muted">
            <div className="text-center">
              <MapIcon className="h-12 w-12 opacity-20 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessun edificio trovato</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Non ci sono edifici con coordinate da visualizzare
              </p>
              <Link href="/immobili">
                <Button>Vai agli immobili</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Map with Controls */}
        {!isLoading && !error && buildings.length > 0 && (
          <>
            {/* Desktop Layout: Floating Controls */}
            <div className="hidden md:block">
              {/* Legend Panel - Top Left */}
              <LegendPanel
                distribution={urgencyDistribution}
                total={buildings.length}
                className="absolute top-4 left-4 z-[1000] max-w-xs"
              />

              {/* Layer Switcher - Top Right */}
              <LayerSwitcher
                currentLayer={layerType}
                onLayerChange={setLayerType}
                className="absolute top-4 right-4 z-[1000]"
              />

              {/* Quick Filters - Below Layer Switcher */}
              <QuickFilters
                showOnlyUrgent={showOnlyUrgent}
                hideSold={hideSold}
                onToggleUrgent={() => setShowOnlyUrgent(!showOnlyUrgent)}
                onToggleSold={() => setHideSold(!hideSold)}
                className="absolute top-20 right-4 z-[1000]"
              />
            </div>

            {/* Mobile Layout: Bottom Sheet */}
            <div className="md:hidden">
              <div className="absolute bottom-4 left-4 right-4 z-[1000] space-y-2">
                <LegendPanel
                  distribution={urgencyDistribution}
                  total={buildings.length}
                />
                <div className="flex gap-2">
                  <LayerSwitcher
                    currentLayer={layerType}
                    onLayerChange={setLayerType}
                    className="flex-1"
                  />
                  <QuickFilters
                    showOnlyUrgent={showOnlyUrgent}
                    hideSold={hideSold}
                    onToggleUrgent={() => setShowOnlyUrgent(!showOnlyUrgent)}
                    onToggleSold={() => setHideSold(!hideSold)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Map */}
            <InteractiveMap
              buildings={buildings}
              layerType={layerType}
              showOnlyUrgent={showOnlyUrgent}
              hideSold={hideSold}
              onBuildingClick={handleBuildingClick}
            />
          </>
        )}
      </div>

      {/* Building Detail Sheet */}
      <BuildingDetailSheet
        buildingId={selectedBuildingId}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
      />
    </div>
  );
}
