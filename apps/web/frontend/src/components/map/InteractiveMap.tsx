/**
 * CRM IMMOBILIARE - Interactive Map Component
 *
 * Full-screen interactive map with all controls and features.
 * Used in /mappa page.
 *
 * Features:
 * - Full viewport height
 * - Zoom controls
 * - Building markers with urgency colors
 * - Click marker → show building details
 * - Layer switcher (satellite/stradale)
 * - Legend panel
 * - Quick filters
 *
 * @module components/map/InteractiveMap
 * @since v3.2.0
 */

'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import { getUrgencyColor, getUrgencyEmoji, getAllUrgencyLevels } from '@/lib/map/urgency-colors';
import { Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { LatLngTuple } from 'leaflet';

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

interface InteractiveMapProps {
  buildings: Building[];
  onBuildingClick?: (buildingId: string) => void;
  layerType?: 'satellite' | 'streets';
  showOnlyUrgent?: boolean;
  hideSold?: boolean;
}

export function InteractiveMap({
  buildings,
  onBuildingClick,
  layerType = 'satellite',
  showOnlyUrgent = false,
  hideSold = false
}: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Fix Leaflet default marker icon issue with Next.js
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  // Filter buildings based on quick filters
  const filteredBuildings = buildings.filter(building => {
    // Filter: Show only urgent (>=4)
    if (showOnlyUrgent && building.stats.avgUrgency < 4) {
      return false;
    }

    // Filter: Hide sold (=0)
    if (hideSold && building.stats.avgUrgency === 0) {
      return false;
    }

    return true;
  });

  // Calculate center as average of all coordinates
  const center: LatLngTuple = filteredBuildings.length > 0
    ? [
        filteredBuildings.reduce((sum, b) => sum + b.coordinates.lat, 0) / filteredBuildings.length,
        filteredBuildings.reduce((sum, b) => sum + b.coordinates.lng, 0) / filteredBuildings.length
      ]
    : [45.4711, 8.9203]; // Default: Corbetta center

  // Calculate appropriate zoom level
  const getZoom = () => {
    if (filteredBuildings.length === 0) return 13;
    if (filteredBuildings.length === 1) return 15;

    const lats = filteredBuildings.map(b => b.coordinates.lat);
    const lngs = filteredBuildings.map(b => b.coordinates.lng);
    const latSpan = Math.max(...lats) - Math.min(...lats);
    const lngSpan = Math.max(...lngs) - Math.min(...lngs);
    const maxSpan = Math.max(latSpan, lngSpan);

    if (maxSpan > 0.5) return 10;
    if (maxSpan > 0.2) return 11;
    if (maxSpan > 0.1) return 12;
    if (maxSpan > 0.05) return 13;
    return 14;
  };

  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Tile layer URLs
  const tileUrls = {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  const tileAttribution = {
    satellite: 'Tiles &copy; Esri',
    streets: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  };

  return (
    <MapContainer
      center={center}
      zoom={getZoom()}
      className="h-full w-full"
      zoomControl={false}
      scrollWheelZoom={true}
    >
      {/* Zoom Control - Bottom Right */}
      <ZoomControl position="bottomright" />

      {/* Tile Layer */}
      <TileLayer
        attribution={tileAttribution[layerType]}
        url={tileUrls[layerType]}
        maxZoom={19}
      />

      {/* Building Markers */}
      {filteredBuildings.map(building => {
        const urgencyColor = getUrgencyColor(building.stats.avgUrgency);
        const urgencyEmoji = getUrgencyEmoji(building.stats.avgUrgency);

        return (
          <CircleMarker
            key={building.id}
            center={[building.coordinates.lat, building.coordinates.lng]}
            radius={10}
            fillColor={urgencyColor}
            color="#ffffff"
            weight={2}
            fillOpacity={0.9}
            eventHandlers={{
              click: () => {
                if (onBuildingClick) {
                  onBuildingClick(building.id);
                }
              }
            }}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <p className="font-semibold mb-1 text-base">
                  {urgencyEmoji} {building.address}
                </p>
                <p className="text-muted-foreground text-xs mb-2">
                  {building.city}
                </p>
                <div className="space-y-1 pt-2 border-t text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Totale immobili:</span>
                    <span className="font-medium">{building.stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Attivi:</span>
                    <span className="font-medium">{building.stats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Codice:</span>
                    <span className="font-mono text-xs">{building.code}</span>
                  </div>
                </div>
                {onBuildingClick && (
                  <button
                    onClick={() => onBuildingClick(building.id)}
                    className="mt-3 w-full text-center text-xs bg-primary text-primary-foreground py-1.5 rounded hover:bg-primary/90 transition-colors"
                  >
                    Vedi Dettagli
                  </button>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
