/**
 * CRM IMMOBILIARE - Map Filter Panel Component
 *
 * Advanced filters for the interactive map.
 * Filters by comune, property type, contract type, price range, etc.
 *
 * Features:
 * - Comune multi-select
 * - Property type multi-select
 * - Contract type filter
 * - Price range slider
 * - Rooms filter
 * - Reset filters button
 *
 * @module components/map/FilterPanel
 * @since v3.2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MapFilters {
  comuni?: string[];
  propertyTypes?: string[];
  contractType?: 'sale' | 'rent' | null;
  priceMin?: number;
  priceMax?: number;
  roomsMin?: number;
  roomsMax?: number;
}

interface FilterPanelProps {
  availableComuni: string[];
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  className?: string;
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Appartamento' },
  { value: 'villa', label: 'Villa' },
  { value: 'office', label: 'Ufficio' },
  { value: 'garage', label: 'Box/Garage' },
  { value: 'land', label: 'Terreno' },
  { value: 'shop', label: 'Negozio' },
];

export function FilterPanel({
  availableComuni,
  filters,
  onFiltersChange,
  className,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Local state for controlled inputs
  const [selectedComuni, setSelectedComuni] = useState<string[]>(filters.comuni || []);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(filters.propertyTypes || []);
  const [contractType, setContractType] = useState<'sale' | 'rent' | null>(filters.contractType || null);
  const [priceMin, setPriceMin] = useState<number | undefined>(filters.priceMin);
  const [priceMax, setPriceMax] = useState<number | undefined>(filters.priceMax);
  const [roomsMin, setRoomsMin] = useState<number | undefined>(filters.roomsMin);
  const [roomsMax, setRoomsMax] = useState<number | undefined>(filters.roomsMax);

  // Apply filters
  const handleApplyFilters = () => {
    onFiltersChange({
      comuni: selectedComuni.length > 0 ? selectedComuni : undefined,
      propertyTypes: selectedPropertyTypes.length > 0 ? selectedPropertyTypes : undefined,
      contractType: contractType || undefined,
      priceMin,
      priceMax,
      roomsMin,
      roomsMax,
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedComuni([]);
    setSelectedPropertyTypes([]);
    setContractType(null);
    setPriceMin(undefined);
    setPriceMax(undefined);
    setRoomsMin(undefined);
    setRoomsMax(undefined);
    onFiltersChange({});
  };

  // Count active filters
  const activeFiltersCount =
    (selectedComuni.length > 0 ? 1 : 0) +
    (selectedPropertyTypes.length > 0 ? 1 : 0) +
    (contractType ? 1 : 0) +
    (priceMin !== undefined || priceMax !== undefined ? 1 : 0) +
    (roomsMin !== undefined || roomsMax !== undefined ? 1 : 0);

  return (
    <div className={cn("bg-background border rounded-lg shadow-lg", className)}>
      {/* Header */}
      <div
        className="p-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-semibold text-sm">Filtri</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-4 border-t space-y-4">
          {/* Comuni Filter */}
          <div>
            <label className="text-xs font-medium mb-2 block">Comuni</label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {availableComuni.map((comune) => (
                <label key={comune} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedComuni.includes(comune)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedComuni([...selectedComuni, comune]);
                      } else {
                        setSelectedComuni(selectedComuni.filter(c => c !== comune));
                      }
                    }}
                    className="rounded"
                  />
                  <span>{comune}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="text-xs font-medium mb-2 block">Tipo Immobile</label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {PROPERTY_TYPES.map((type) => (
                <label key={type.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedPropertyTypes.includes(type.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPropertyTypes([...selectedPropertyTypes, type.value]);
                      } else {
                        setSelectedPropertyTypes(selectedPropertyTypes.filter(t => t !== type.value));
                      }
                    }}
                    className="rounded"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contract Type Filter */}
          <div>
            <label className="text-xs font-medium mb-2 block">Contratto</label>
            <div className="flex gap-2">
              <Button
                variant={contractType === 'sale' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContractType(contractType === 'sale' ? null : 'sale')}
                className="flex-1"
              >
                Vendita
              </Button>
              <Button
                variant={contractType === 'rent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContractType(contractType === 'rent' ? null : 'rent')}
                className="flex-1"
              >
                Affitto
              </Button>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-xs font-medium mb-2 block">Prezzo (€)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMin || ''}
                onChange={(e) => setPriceMin(e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 px-2 py-1 text-sm border rounded"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceMax || ''}
                onChange={(e) => setPriceMax(e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>

          {/* Rooms Range */}
          <div>
            <label className="text-xs font-medium mb-2 block">Locali</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                min="1"
                max="10"
                value={roomsMin || ''}
                onChange={(e) => setRoomsMin(e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 px-2 py-1 text-sm border rounded"
              />
              <input
                type="number"
                placeholder="Max"
                min="1"
                max="10"
                value={roomsMax || ''}
                onChange={(e) => setRoomsMax(e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="flex-1"
              disabled={activeFiltersCount === 0}
            >
              <X className="h-3 w-3 mr-1" />
              Resetta
            </Button>
            <Button
              size="sm"
              onClick={handleApplyFilters}
              className="flex-1"
            >
              Applica Filtri
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
