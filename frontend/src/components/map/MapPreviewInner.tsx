/**
 * CRM IMMOBILIARE - Map Preview Inner Component
 *
 * Inner component with actual Leaflet map implementation.
 * Separated for dynamic import (SSR disabled).
 *
 * @module components/map/MapPreviewInner
 * @since v3.2.0
 */

'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { getUrgencyColor, getUrgencyEmoji } from '@/lib/map/urgency-colors';
import 'leaflet/dist/leaflet.css';
import type { LatLngTuple } from 'leaflet';

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

interface MapPreviewInnerProps {
  buildings: Building[];
}

export default function MapPreviewInner({ buildings }: MapPreviewInnerProps) {
  // Calculate center as average of all coordinates
  const center: LatLngTuple = buildings.length > 0
    ? [
        buildings.reduce((sum, b) => sum + b.coordinates.lat, 0) / buildings.length,
        buildings.reduce((sum, b) => sum + b.coordinates.lng, 0) / buildings.length
      ]
    : [45.4711, 8.9203]; // Default: Corbetta center

  // Calculate appropriate zoom level based on spread
  const getZoom = () => {
    if (buildings.length === 0) return 13;
    if (buildings.length === 1) return 15;

    // Calculate distance span
    const lats = buildings.map(b => b.coordinates.lat);
    const lngs = buildings.map(b => b.coordinates.lng);
    const latSpan = Math.max(...lats) - Math.min(...lats);
    const lngSpan = Math.max(...lngs) - Math.min(...lngs);
    const maxSpan = Math.max(latSpan, lngSpan);

    // Zoom levels (approximate)
    if (maxSpan > 0.5) return 10;  // Wide area
    if (maxSpan > 0.2) return 11;  // Large area
    if (maxSpan > 0.1) return 12;  // Medium area
    if (maxSpan > 0.05) return 13; // Small area
    return 14; // Very small area
  };

  useEffect(() => {
    // Fix Leaflet default marker icon issue with Next.js
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="h-[280px] rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={getZoom()}
        className="h-full w-full"
        zoomControl={false}
        dragging={true}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={true}
      >
        {/* Satellite Tiles - Esri World Imagery (Free) */}
        <TileLayer
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />

        {/* Building Markers */}
        {buildings.map(building => {
          const urgencyColor = getUrgencyColor(building.stats.avgUrgency);
          const urgencyEmoji = getUrgencyEmoji(building.stats.avgUrgency);

          return (
            <CircleMarker
              key={building.id}
              center={[building.coordinates.lat, building.coordinates.lng]}
              radius={8}
              fillColor={urgencyColor}
              color="#ffffff"
              weight={2}
              fillOpacity={0.9}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold mb-1">
                    {urgencyEmoji} {building.address}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {building.city}
                  </p>
                  <div className="mt-2 pt-2 border-t text-xs space-y-1">
                    <p>
                      <span className="font-medium">Immobili:</span> {building.stats.total}
                    </p>
                    <p>
                      <span className="font-medium">Attivi:</span> {building.stats.active}
                    </p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
