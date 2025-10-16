/**
 * React Query Hook for AI-Powered Matching
 */

import { useMutation, useQuery } from '@tanstack/react-query';

interface MatchEnhanceRequest {
  request_id: string;
  property_id: string;
  algorithmic_score: number;
}

interface MatchEnhanceResponse {
  success: boolean;
  algorithmicScore: number;
  finalScore: number;
  aiAnalysis: string;
}

export function useAIMatchEnhance() {
  return useMutation<MatchEnhanceResponse, Error, MatchEnhanceRequest>({
    mutationFn: async (data) => {
      const response = await fetch('/api/ai/matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nel matching AI');
      }

      return response.json();
    },
  });
}

export function useAIMatchingStatus() {
  return useQuery({
    queryKey: ['ai-matching-status'],
    queryFn: async () => {
      const response = await fetch('/api/ai/matching');
      if (!response.ok) {
        throw new Error('Backend AI non disponibile');
      }
      return response.json();
    },
    refetchInterval: 30000,
    retry: 3,
  });
}
