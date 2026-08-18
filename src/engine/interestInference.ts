// Interest Inference — infers broader interests from weighted interactions.
// This is the core intelligence: NOT keyword matching, but semantic roll-up.

import type { Interaction, Reel, EngineConfig, InterestScore, InterestFingerprint } from './types';
import type { BehaviorAnalyzer, BehaviorProfile } from './behaviorAnalyzer';
import type { ContentAnalyzer, AnalyzedContent } from './contentAnalyzer';
import { getAncestors, CONCEPT_MAP } from './taxonomy';

export interface InterestInference {
  infer(
    interactions: Interaction[],
    reels: Reel[],
    behavior: BehaviorAnalyzer,
    content: ContentAnalyzer,
    config: EngineConfig
  ): InterestFingerprint;
}

export function createInterestInference(): InterestInference {
  return {
    infer(
      interactions: Interaction[],
      reels: Reel[],
      behavior: BehaviorAnalyzer,
      content: ContentAnalyzer,
      config: EngineConfig
    ): InterestFingerprint {
      const reelMap = new Map(reels.map((r) => [r.id, r]));
      const profile = behavior.buildProfile(interactions, config);
      const contentCache = new Map<string, AnalyzedContent>();

      // Aggregate concept scores weighted by interaction strength
      const conceptScores = new Map<string, { score: number; evidence: Set<string>; direct: boolean }>();

      for (const wi of profile.weighted) {
        const reel = reelMap.get(wi.interaction.reelId);
        if (!reel) continue;

        let analyzed = contentCache.get(reel.id);
        if (!analyzed) {
          analyzed = content.analyze(reel);
          contentCache.set(reel.id, analyzed);
        }

        const weight = Math.max(0, wi.weight); // skip (negative) doesn't boost
        if (weight === 0) continue;

        // Direct concepts from the reel
        for (const concept of analyzed.concepts) {
          const existing = conceptScores.get(concept) ?? { score: 0, evidence: new Set<string>(), direct: true };
          existing.score += weight;
          existing.evidence.add(reel.title);
          existing.direct = true;
          conceptScores.set(concept, existing);
        }

        // Propagate to ancestors (broader interests) — this is the key inference
        for (const concept of analyzed.concepts) {
          for (const ancestor of getAncestors(concept)) {
            const existing = conceptScores.get(ancestor) ?? { score: 0, evidence: new Set<string>(), direct: false };
            existing.score += weight * 0.7; // broader interests get discounted propagation
            existing.evidence.add(reel.title);
            // Don't overwrite direct=true with false — a concept seen directly stays direct
            existing.direct = existing.direct || false;
            conceptScores.set(ancestor, existing);
          }
        }
      }

      // Normalize to 0-100
      const maxScore = Math.max(...Array.from(conceptScores.values()).map((v) => v.score), 1);
      const allScores: InterestScore[] = Array.from(conceptScores.entries())
        .map(([concept, data]) => {
          const entry = CONCEPT_MAP[concept];
          return {
            concept,
            score: Math.round((data.score / maxScore) * 100),
            direct: data.direct,
            evidence: Array.from(data.evidence).slice(0, 5),
          };
        })
        .filter((s) => CONCEPT_MAP[s.concept])
        .sort((a, b) => b.score - a.score);

      const topInterests = allScores.slice(0, 7);
      // Hidden interests = broader (level >= 1) interests that were inferred (not directly watched as a specific topic)
      const directConceptSet = new Set<string>();
      for (const wi of profile.weighted) {
        const reel = reelMap.get(wi.interaction.reelId);
        if (reel && wi.weight > 0) {
          for (const c of reel.semanticConcepts) {
            directConceptSet.add(c);
          }
        }
      }
      const hiddenInterests = allScores.filter(
        (s) => !directConceptSet.has(s.concept) && CONCEPT_MAP[s.concept]?.level >= 1 && s.score > 20
      );

      return { scores: allScores, topInterests, hiddenInterests };
    },
  };
}
