"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Property {
  id: string;
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  zone?: string;
  price?: number;
}

interface SatelliteMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  height?: string;
}

export function SatelliteMap({
  properties,
  onPropertyClick,
  height = "400px",
}: SatelliteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([45.4642, 9.19], 13); // Milan center

      // Add satellite layer
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEE, Getmapping, Aerogrid, IGN, IGP, UPR-EEA, minus b.v. and GIS User Community',
          maxZoom: 18,
        }
      ).addTo(map.current);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for properties
    const bounds = L.latLngBounds([]);
    properties.forEach((property) => {
      // Generate consistent coords based on location (demo purposes)
      const lat = (property.latitude || 45.4642) + Math.random() * 0.05 - 0.025;
      const lng = (property.longitude || 9.19) + Math.random() * 0.05 - 0.025;

      const marker = L.marker([lat, lng])
        .bindPopup(
          `<div class="p-2">
            <h4 class="font-semibold text-sm">${property.title}</h4>
            <p class="text-xs text-gray-600">${property.location}</p>
            ${property.price ? `<p class="text-sm font-medium text-blue-600">€${property.price.toLocaleString("it-IT")}</p>` : ""}
          </div>`
        )
        .addTo(map.current!);

      marker.on("click", () => {
        onPropertyClick?.(property);
      });

      markersRef.current.push(marker);
      bounds.extend([lat, lng]);
    });

    // Fit bounds if markers exist
    if (markersRef.current.length > 0) {
      map.current?.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Cleanup on unmount
    };
  }, [properties, onPropertyClick]);

  return (
    <div
      ref={mapContainer}
      style={{
        height,
        borderRadius: "0.5rem",
        border: "1px solid var(--border)",
      }}
      className="w-full"
    />
  );
}
