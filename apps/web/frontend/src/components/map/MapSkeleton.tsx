/**
 * CRM IMMOBILIARE - Map Loading Skeleton
 *
 * Loading skeleton shown while map data is fetching.
 * Provides visual feedback and prevents layout shift.
 *
 * @module components/map/MapSkeleton
 * @since v3.2.0
 */

'use client';

import { Loader2 } from 'lucide-react';

export function MapSkeleton() {
  return (
    <div className="h-full w-full bg-muted relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-muted-foreground/20 rounded animate-pulse mx-auto" />
            <div className="h-3 w-32 bg-muted-foreground/10 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </div>

      {/* Skeleton controls (simulating real UI) */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        {/* Legend skeleton */}
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-3 w-64 shadow-lg">
          <div className="h-4 w-24 bg-muted rounded animate-pulse mb-3" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Filter skeleton */}
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-3 w-64 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Layer switcher skeleton */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Simulated map markers */}
      <div className="absolute inset-0">
        {[
          { top: '20%', left: '30%' },
          { top: '40%', left: '60%' },
          { top: '60%', left: '40%' },
          { top: '70%', left: '70%' },
          { top: '30%', left: '80%' },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-6 h-6 bg-primary/30 rounded-full animate-pulse"
            style={{ top: pos.top, left: pos.left, animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
