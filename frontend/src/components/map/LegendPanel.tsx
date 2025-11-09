/**
 * CRM IMMOBILIARE - Legend Panel Component
 *
 * Collapsible legend showing urgency levels and distribution.
 *
 * @module components/map/LegendPanel
 * @since v3.2.0
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { getAllUrgencyLevels } from '@/lib/map/urgency-colors';
import { cn } from '@/lib/utils';

interface LegendPanelProps {
  distribution?: Record<number, number>;
  total?: number;
  className?: string;
}

export function LegendPanel({ distribution, total, className }: LegendPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const levels = getAllUrgencyLevels();

  return (
    <div className={cn("bg-background border rounded-lg shadow-lg", className)}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span className="font-semibold text-sm">Legenda Urgenza</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-2">
          {levels.map(level => {
            const count = distribution?.[level.score] || 0;

            return (
              <div
                key={level.score}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: level.hex }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">
                      {level.emoji} {level.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {level.description}
                    </span>
                  </div>
                </div>
                {distribution && (
                  <span className="text-xs font-mono text-muted-foreground">
                    ({count})
                  </span>
                )}
              </div>
            );
          })}

          {/* Total */}
          {total !== undefined && (
            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Totale edifici:</span>
                <span>{total}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
