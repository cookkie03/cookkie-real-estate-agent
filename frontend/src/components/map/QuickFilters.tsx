/**
 * CRM IMMOBILIARE - Quick Filters Component
 *
 * Quick filter toggles for map visualization.
 *
 * @module components/map/QuickFilters
 * @since v3.2.0
 */

'use client';

import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickFiltersProps {
  showOnlyUrgent: boolean;
  hideSold: boolean;
  onToggleUrgent: () => void;
  onToggleSold: () => void;
  className?: string;
}

export function QuickFilters({
  showOnlyUrgent,
  hideSold,
  onToggleUrgent,
  onToggleSold,
  className
}: QuickFiltersProps) {
  return (
    <div className={cn("bg-background border rounded-lg shadow-lg p-3", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-4 w-4" />
        <span className="font-semibold text-sm">Filtri Rapidi</span>
      </div>

      <div className="space-y-2">
        {/* Only Urgent */}
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={showOnlyUrgent}
            onChange={onToggleUrgent}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
          />
          <span className="text-xs group-hover:text-foreground transition-colors">
            🔴 Solo urgenti (≥4)
          </span>
        </label>

        {/* Hide Sold */}
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={hideSold}
            onChange={onToggleSold}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
          />
          <span className="text-xs group-hover:text-foreground transition-colors">
            ⚫ Nascondi venduti
          </span>
        </label>
      </div>
    </div>
  );
}
