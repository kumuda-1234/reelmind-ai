// Candidate Generator — generates recommendation candidates based on inferred interests.

import type { Reel, InterestFingerprint } from './types';
import { CONCEPT_MAP, semanticSimilarity, getAncestors } from './taxonomy';

export interface CandidateResult {
  reel: Reel;
  interestMatch: number; // 0-100
  semanticScore: number; // 0-100
  diversityBonus?: number;
  narrowTopicPenalty?: number;
  rankingEvidence?: {
    broadInterest: string[];
    adjacentInterest?: string;
    repeatedTopic?: string;
  };
}

export interface CandidateGenerator {
  generate(
    candidates: Reel[],
    fingerprint: InterestFingerprint,
    consumedReelIds: string[]
  ): CandidateResult[];
}

export function createCandidateGenerator(): CandidateGenerator {
  return {
    generate(candidates, fingerprint, consumedReelIds): CandidateResult[] {
      const interestConcepts = fingerprint.scores
        .filter((s) => s.score > 15)
        .map((s) => s.concept);

      const scoreMap = new Map(fingerprint.scores.map((s) => [s.concept, s.score]));
      const strongBroadInterests = fingerprint.scores.filter(
        (s) => (CONCEPT_MAP[s.concept]?.level ?? 0) >= 1 && s.score >= 40
      );
      const directNarrowInterests = fingerprint.scores.filter(
        (s) => s.direct && (CONCEPT_MAP[s.concept]?.level ?? 0) === 0 && s.score >= 35
      );

      return candidates
        .filter((c) => !consumedReelIds.includes(c.id))
        .map((reel) => {
          let matchSum = 0;
          let matchCount = 0;

          for (const concept of reel.semanticConcepts) {
            // Direct concept match
            const score = scoreMap.get(concept);
            if (score !== undefined) {
              const level = CONCEPT_MAP[concept]?.level ?? 0;
              matchSum += score * (level === 0 ? 0.75 : level === 1 ? 1 : 1.2);
              matchCount++;
            }
            // Ancestor match — reel concept rolls up into an inferred interest
            for (const ancestor of getAncestors(concept)) {
              const aScore = scoreMap.get(ancestor);
              if (aScore !== undefined) {
                const ancestorLevel = CONCEPT_MAP[ancestor]?.level ?? 0;
                const broadWeight = ancestorLevel >= 2 ? 1.35 : ancestorLevel === 1 ? 1.1 : 1;
                matchSum += aScore * 0.6 * broadWeight;
                matchCount++;
              }
            }
          }

          const interestMatch = matchCount > 0 ? Math.min(100, matchSum / matchCount) : 0;
          const semScore = semanticSimilarity(reel.semanticConcepts, interestConcepts) * 100;

          const reelConceptsAndAncestors = new Set(
            reel.semanticConcepts.flatMap((concept) => [concept, ...getAncestors(concept)])
          );
          const broadInterest = strongBroadInterests
            .filter((interest) => reelConceptsAndAncestors.has(interest.concept))
            .map((interest) => interest.concept);
          const repeatedTopic = directNarrowInterests.find((interest) => reel.semanticConcepts.includes(interest.concept));
          const adjacentInterest = directNarrowInterests.find((interest) =>
            !reel.semanticConcepts.includes(interest.concept) &&
            (CONCEPT_MAP[interest.concept]?.related ?? []).some((related) => reel.semanticConcepts.includes(related))
          );
          const diversityBonus = broadInterest.length > 0 && adjacentInterest ? 4 : 0;
          const hasAdjacentExpansion = repeatedTopic && reel.semanticConcepts.some(
            (concept) => concept !== repeatedTopic.concept && !getAncestors(repeatedTopic.concept).includes(concept)
          );
          const narrowTopicPenalty = repeatedTopic ? (hasAdjacentExpansion ? 3 : 7) : 0;

          return {
            reel,
            interestMatch: Math.round(interestMatch),
            semanticScore: Math.round(semScore),
            diversityBonus,
            narrowTopicPenalty,
            rankingEvidence: {
              broadInterest,
              adjacentInterest: adjacentInterest?.concept,
              repeatedTopic: repeatedTopic?.concept,
            },
          };
        })
        .sort((a, b) => b.interestMatch - a.interestMatch);
    },
  };
}
