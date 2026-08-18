// Recommendation Engine — scores and ranks candidates with full breakdown.

import type {
  Reel,
  InterestFingerprint,
  EngineConfig,
  ScoreBreakdown,
  Recommendation,
} from './types';
import type { CandidateResult } from './candidateGenerator';
import type { HypeDetector, HypeResult } from './hypeDetector';
import type { ExplorationEngine } from './explorationEngine';
import type { ExplanationService } from './explanationService';
import type { ConfidenceService } from './confidenceService';

export interface RecommendationEngine {
  rank(
    candidates: CandidateResult[],
    fingerprint: InterestFingerprint,
    config: EngineConfig,
    hypeDetector: HypeDetector,
    exploration: ExplorationEngine,
    explanation: ExplanationService,
    confidence: ConfidenceService
  ): Recommendation[];
}

export function createRecommendationEngine(): RecommendationEngine {
  return {
    rank(candidates, fingerprint, config, hypeDetector, exploration, explanation, confidence): Recommendation[] {
      const alreadyRecommended: string[] = [];
      const scored: Recommendation[] = [];

      for (const candidate of candidates) {
        const reel = candidate.reel;
        const hypeResult = hypeDetector.score(reel);

        const explorationScore = exploration.explorationScore(reel, fingerprint, alreadyRecommended);

        // Adjust educational value by learning/entertainment bias
        const biasAdj = config.learningEntertainmentBias;
        const adjustedEduValue = reel.educationalValue * biasAdj + (100 - reel.educationalValue) * (1 - biasAdj) * 0.3;

        const breakdown: ScoreBreakdown = {
          interestMatch: candidate.interestMatch,
          semanticSimilarity: candidate.semanticScore,
          educationalValue: Math.round(adjustedEduValue),
          exploration: explorationScore,
          hypeRisk: hypeResult.hypeRisk,
          finalScore: 0,
        };

        // Weighted final score
        const w = config.scoringWeights;
        let final =
          candidate.interestMatch * w.interestMatch +
          candidate.semanticScore * w.semanticSimilarity +
          adjustedEduValue * w.educationalValue +
          explorationScore * w.exploration;

        final += candidate.diversityBonus ?? 0;
        final -= candidate.narrowTopicPenalty ?? 0;

        // Hype penalty
        final -= hypeResult.hypeRisk * w.hypePenalty;

        breakdown.finalScore = Math.max(0, Math.min(100, Math.round(final)));

        const conf = confidence.compute(breakdown, fingerprint);
        const exp = explanation.explain(reel, fingerprint, breakdown, candidate.rankingEvidence);

        scored.push({
          reel,
          scores: breakdown,
          category: reel.category,
          difficulty: reel.difficulty,
          confidence: conf.label,
          confidenceScore: conf.score,
          explanation: exp.explanation,
          evidenceChips: exp.evidenceChips,
          whyThisRecommendation: exp.whyThisRecommendation,
        });
      }

      // Sort by final score
      scored.sort((a, b) => b.scores.finalScore - a.scores.finalScore);

      // Diversify
      const diversified = exploration.diversify(scored);

      // Track top recommendations for exploration scoring
      for (const rec of diversified.slice(0, 6)) {
        alreadyRecommended.push(rec.reel.id);
      }

      return diversified;
    },
  };
}
