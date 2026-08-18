// Exploration Engine — computes novelty/exploration score and diversifies recommendations.

import type { Reel, InterestFingerprint, ScoreBreakdown } from './types';
import { CONCEPT_MAP, getAncestors } from './taxonomy';

export interface ExplorationEngine {
  explorationScore(
    reel: Reel,
    fingerprint: InterestFingerprint,
    alreadyRecommended: string[]
  ): number;
  diversify<T extends { reel: Reel; scores: ScoreBreakdown }>(
    recommendations: T[]
  ): T[];
}

export function createExplorationEngine(): ExplorationEngine {
  return {
    explorationScore(reel, fingerprint, _alreadyRecommended): number {
      const directInterests = new Set(
        fingerprint.scores.filter((s) => s.direct).map((s) => s.concept)
      );

      const reelConcepts = reel.semanticConcepts;
      const newConcepts = reelConcepts.filter((c) => !directInterests.has(c));
      const noveltyRatio = reelConcepts.length > 0 ? newConcepts.length / reelConcepts.length : 0;

      // Must be adjacent (connected via taxonomy) to have exploration value
      const allInterestConcepts = new Set(fingerprint.scores.map((s) => s.concept));
      const isAdjacent = reelConcepts.some((c) => {
        const ancestors = getAncestors(c);
        return ancestors.some((a) => allInterestConcepts.has(a));
      });

      if (!isAdjacent) return 10;

      return Math.round(40 + noveltyRatio * 60);
    },

    diversify(recommendations): typeof recommendations {
      const result: typeof recommendations = [];
      const usedCategories = new Set<string>();
      const sorted = [...recommendations].sort((a, b) => b.scores.finalScore - a.scores.finalScore);

      for (const rec of sorted) {
        if (!usedCategories.has(rec.reel.category) || result.length >= sorted.length - 2) {
          result.push(rec);
          usedCategories.add(rec.reel.category);
        }
      }

      for (const rec of sorted) {
        if (!result.includes(rec)) result.push(rec);
      }

      return result;
    },
  };
}
