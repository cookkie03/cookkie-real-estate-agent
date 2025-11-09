/**
 * CRM IMMOBILIARE - Layer Switcher Component
 *
 * Toggle between satellite and street map layers.
 *
 * @module components/map/LayerSwitcher
 * @since v3.2.0
 */

'use client';

import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayerSwitcherProps {
  currentLayer: 'satellite' | 'streets';
  onLayerChange: (layer: 'satellite' | 'streets') => void;
  className?: string;
}

export function LayerSwitcher({ currentLayer, onLayerChange, className }: LayerSwitcherProps) {
  return (
    <div className={cn("bg-background border rounded-lg shadow-lg p-3", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Layers className="h-4 w-4" />
        <span className="font-semibold text-sm">Tipo Mappa</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onLayerChange('satellite')}
          className={cn(
            "flex-1 px-3 py-2 rounded text-xs font-medium transition-colors",
            currentLayer === 'satellite'
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          🛰️ Satellite
        </button>
        <button
          onClick={() => onLayerChange('streets')}
          className={cn(
            "flex-1 px-3 py-2 rounded text-xs font-medium transition-colors",
            currentLayer === 'streets'
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          🗺️ Stradale
        </button>
      </div>
    </div>
  );
}
