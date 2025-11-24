/**
 * CRM IMMOBILIARE - Urgency Recalculation Button
 *
 * Trigger manual urgency recalculation for properties.
 * Can be used for single property, building, or global recalc.
 *
 * @module components/urgency/UrgencyRecalcButton
 * @since v3.2.0
 */

'use client';

import { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UrgencyRecalcButtonProps {
  propertyId?: string;
  buildingId?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onComplete?: () => void;
}

export function UrgencyRecalcButton({
  propertyId,
  buildingId,
  variant = 'outline',
  size = 'default',
  className,
  onComplete,
}: UrgencyRecalcButtonProps) {
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Determine scope
  const scope = propertyId
    ? 'property'
    : buildingId
    ? 'building'
    : 'global';

  const scopeLabels = {
    property: 'questo immobile',
    building: 'tutti gli immobili di questo edificio',
    global: 'tutti gli immobili',
  };

  const handleRecalculate = async () => {
    // Confirm with user
    const confirmMessage = scope === 'global'
      ? 'Ricalcolare urgency per TUTTI gli immobili? Questa operazione può richiedere alcuni secondi.'
      : `Ricalcolare urgency per ${scopeLabels[scope]}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsRecalculating(true);

      let url = '/api/urgency/recalculate';
      const params = new URLSearchParams();

      if (propertyId) {
        params.append('propertyId', propertyId);
      } else if (buildingId) {
        params.append('buildingId', buildingId);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Errore nel ricalcolo');
      }

      alert(`✅ ${data.message}\n\nImmobili aggiornati: ${data.updated}\nEdifici aggiornati: ${data.buildingsUpdated}`);

      onComplete?.();
    } catch (error) {
      console.error('[UrgencyRecalcButton] Error:', error);
      alert('❌ Errore nel ricalcolo urgency: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleRecalculate}
      disabled={isRecalculating}
    >
      {isRecalculating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {size !== 'icon' && (
        <span className="ml-2">
          {isRecalculating ? 'Ricalcolo...' : 'Ricalcola Urgency'}
        </span>
      )}
    </Button>
  );
}
