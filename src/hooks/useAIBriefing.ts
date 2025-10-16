/**
 * React Query Hook for Daily Briefing
 */

import { useQuery } from '@tanstack/react-query';

interface BriefingResponse {
  success: boolean;
  date: string;
  briefing: string;
  generated_at: string;
}

export function useDailyBriefing() {
  return useQuery<BriefingResponse, Error>({
    queryKey: ['daily-briefing'],
    queryFn: async () => {
      const response = await fetch('/api/ai/briefing');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nella generazione del briefing');
      }

      return response.json();
    },
    // Briefing is cached for 1 hour
    staleTime: 1000 * 60 * 60,
    // Refetch briefing every 2 hours in background
    refetchInterval: 1000 * 60 * 120,
  });
}

export function useRefreshBriefing() {
  return useQuery<BriefingResponse, Error>({
    queryKey: ['daily-briefing-refresh'],
    queryFn: async () => {
      const response = await fetch('/api/ai/briefing');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nella generazione del briefing');
      }

      return response.json();
    },
    enabled: false, // Only run when explicitly called
  });
}
