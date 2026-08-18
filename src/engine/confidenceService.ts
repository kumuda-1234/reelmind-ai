// Confidence Service — computes confidence scores for recommendations.

import type { ScoreBreakdown, InterestFingerprint } from './types';

export interface ConfidenceResult {
  score: number; // 0-100
  label: 'High' | 'Medium' | 'Low';
}

export interface ConfidenceService {
  compute(scores: ScoreBreakdown, fingerprint: InterestFingerprint): ConfidenceResult;
}

export function createConfidenceService(): ConfidenceService {
  return {
    compute(scores, fingerprint): ConfidenceResult {
      // Confidence is driven by interest match strength and signal count
      const signalCount = fingerprint.scores.filter((s) => s.score > 30).length;
      const topInterestStrength = fingerprint.topInterests[0]?.score ?? 0;

      // Weighted confidence: interest match + signal count + top interest strength
      const confidence =
        scores.interestMatch * 0.4 +
        Math.min(100, signalCount * 15) * 0.3 +
        topInterestStrength * 0.3;

      const rounded = Math.round(confidence);

      let label: 'High' | 'Medium' | 'Low' = 'Low';
      if (rounded >= 70) label = 'High';
      else if (rounded >= 45) label = 'Medium';

      return { score: rounded, label };
    },
  };
}
