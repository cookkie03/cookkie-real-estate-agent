/**
 * CRM IMMOBILIARE - Zone Selector Component
 *
 * Hierarchical zone selector with drill-down navigation:
 * Multi-Comune → Singolo Comune → Zona Catastale → Edifici
 *
 * Features:
 * - 3-level hierarchy navigation
 * - Urgency stats per level
 * - Back button navigation
 * - Loading/error states
 *
 * @module components/map/ZoneSelector
 * @since v3.2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, MapPin, Building2, Layers, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUrgencyColor, getUrgencyEmoji } from '@/lib/map/urgency-colors';

interface ZoneStats {
  totalBuildings: number;
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  avgUrgency: number;
  urgencyDistribution: Record<number, number>;
}

interface ComuneData extends ZoneStats {
  comune: string;
}

interface ZoneData extends ZoneStats {
  zone: string;
}

interface BuildingData {
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

type Level = 'multi' | 'comune' | 'zone';

interface ZoneSelectorProps {
  onBuildingSelect?: (buildingId: string, coordinates: { lat: number; lng: number }) => void;
  onZoneChange?: (level: Level, filters: { comune?: string; cadastralZone?: string }) => void;
  className?: string;
}

export function ZoneSelector({ onBuildingSelect, onZoneChange, className }: ZoneSelectorProps) {
  const [level, setLevel] = useState<Level>('multi');
  const [selectedComune, setSelectedComune] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const [comuni, setComuni] = useState<ComuneData[]>([]);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [buildings, setBuildings] = useState<BuildingData[]>([]);

  const [globalStats, setGlobalStats] = useState<ZoneStats | null>(null);
  const [comuneStats, setComuneStats] = useState<ZoneStats | null>(null);
  const [zoneStats, setZoneStats] = useState<ZoneStats | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data based on current level
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let url = '/api/zones?level=' + level;
        if (level === 'comune' && selectedComune) {
          url += `&comune=${encodeURIComponent(selectedComune)}`;
        } else if (level === 'zone' && selectedComune && selectedZone) {
          url += `&comune=${encodeURIComponent(selectedComune)}&cadastralZone=${encodeURIComponent(selectedZone)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Errore sconosciuto');
        }

        if (level === 'multi') {
          setComuni(data.comuni || []);
          setGlobalStats(data.stats);
          onZoneChange?.('multi', {});
        } else if (level === 'comune') {
          setZones(data.zones || []);
          setComuneStats(data.stats);
          onZoneChange?.('comune', { comune: selectedComune || undefined });
        } else if (level === 'zone') {
          setBuildings(data.buildings || []);
          setZoneStats(data.stats);
          onZoneChange?.('zone', { comune: selectedComune || undefined, cadastralZone: selectedZone || undefined });
        }
      } catch (err) {
        console.error('[ZoneSelector] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Errore nel caricamento');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [level, selectedComune, selectedZone]);

  // Navigate to comune level
  const handleComuneClick = (comune: string) => {
    setSelectedComune(comune);
    setLevel('comune');
  };

  // Navigate to zone level
  const handleZoneClick = (zone: string) => {
    setSelectedZone(zone);
    setLevel('zone');
  };

  // Navigate back
  const handleBack = () => {
    if (level === 'zone') {
      setSelectedZone(null);
      setLevel('comune');
    } else if (level === 'comune') {
      setSelectedComune(null);
      setLevel('multi');
    }
  };

  // Handle building selection
  const handleBuildingClick = (building: BuildingData) => {
    onBuildingSelect?.(building.id, building.coordinates);
  };

  return (
    <div className={cn("bg-background border rounded-lg shadow-lg", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {level !== 'multi' && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-muted rounded"
                aria-label="Indietro"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <Layers className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-sm">
                {level === 'multi' && 'Tutti i Comuni'}
                {level === 'comune' && selectedComune}
                {level === 'zone' && `${selectedComune} - Zona ${selectedZone}`}
              </h3>
              <p className="text-xs text-muted-foreground">
                {level === 'multi' && `${globalStats?.totalBuildings || 0} edifici`}
                {level === 'comune' && `${comuneStats?.totalBuildings || 0} edifici, ${zones.length} zone`}
                {level === 'zone' && `${zoneStats?.totalBuildings || 0} edifici`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 max-h-96 overflow-y-auto">
        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Caricamento...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Level 1: Comuni List */}
            {level === 'multi' && (
              <div className="space-y-2">
                {comuni.map((comune) => (
                  <button
                    key={comune.comune}
                    onClick={() => handleComuneClick(comune.comune)}
                    className="w-full p-3 hover:bg-muted rounded-lg transition-colors text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{comune.comune}</div>
                        <div className="text-xs text-muted-foreground">
                          {comune.totalBuildings} edifici, {comune.activeProperties} immobili
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {getUrgencyEmoji(Math.round(comune.avgUrgency))}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Level 2: Zones List */}
            {level === 'comune' && (
              <div className="space-y-2">
                {zones.map((zone) => (
                  <button
                    key={zone.zone}
                    onClick={() => handleZoneClick(zone.zone)}
                    className="w-full p-3 hover:bg-muted rounded-lg transition-colors text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">Zona {zone.zone}</div>
                        <div className="text-xs text-muted-foreground">
                          {zone.totalBuildings} edifici, {zone.activeProperties} immobili
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {getUrgencyEmoji(Math.round(zone.avgUrgency))}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Level 3: Buildings List */}
            {level === 'zone' && (
              <div className="space-y-2">
                {buildings.map((building) => (
                  <button
                    key={building.id}
                    onClick={() => handleBuildingClick(building)}
                    className="w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{building.address}</div>
                        <div className="text-xs text-muted-foreground">
                          {building.stats.active} immobili attivi
                        </div>
                      </div>
                      <span className="text-xs">
                        {getUrgencyEmoji(Math.round(building.stats.avgUrgency))}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
