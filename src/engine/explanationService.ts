// Explanation Service — generates evidence-based explanations for recommendations.

import type { Reel, InterestFingerprint, ScoreBreakdown } from './types';
import { CONCEPT_MAP } from './taxonomy';
import type { CandidateResult } from './candidateGenerator';

export interface ExplanationResult {
  explanation: string;
  evidenceChips: string[];
  whyThisRecommendation: string;
}

export interface ExplanationService {
  explain(reel: Reel, fingerprint: InterestFingerprint, scores: ScoreBreakdown, rankingEvidence?: CandidateResult['rankingEvidence']): ExplanationResult;
}

export function createExplanationService(): ExplanationService {
  return {
    explain(reel, fingerprint, scores, rankingEvidence): ExplanationResult {
      const reelConcepts = new Set(reel.semanticConcepts);

      // Find matching interests: direct concept overlap or ancestor relationship
      const matchingInterests = fingerprint.scores
        .filter((s) => {
          if (reelConcepts.has(s.concept)) return true;
          // Check if any reel concept is a descendant of this interest
          return reel.semanticConcepts.some((rc) => {
            const entry = CONCEPT_MAP[rc];
            return entry?.parents.includes(s.concept);
          });
        })
        .sort((a, b) => b.score - a.score);

      // Build evidence chips from actual interaction evidence
      const evidenceChips: string[] = [];
      const topInterests = matchingInterests.slice(0, 4);

      for (const interest of topInterests) {
        const label = CONCEPT_MAP[interest.concept]?.label ?? interest.concept;
        if (interest.direct) {
          evidenceChips.push(`${label} interaction`);
        } else {
          evidenceChips.push(`Inferred ${label.toLowerCase()} interest`);
        }
      }

      // Add evidence from actual reel titles the student interacted with
      const directEvidence = fingerprint.scores
        .filter((s) => s.direct && s.score > 40)
        .flatMap((s) => s.evidence)
        .slice(0, 2);
      for (const ev of directEvidence) {
        if (evidenceChips.length < 5) {
          evidenceChips.push(`Watched: ${ev}`);
        }
      }

      const strongSignals = fingerprint.scores.filter((s) => s.score > 50).length;
      if (strongSignals > 0 && evidenceChips.length < 5) {
        evidenceChips.push(`${strongSignals} strong interest signals`);
      }
      if (rankingEvidence?.adjacentInterest && evidenceChips.length < 5) {
        const label = CONCEPT_MAP[rankingEvidence.adjacentInterest]?.label ?? rankingEvidence.adjacentInterest;
        evidenceChips.push(`Adjacent to ${label}`);
      }

      // Build explanation referencing actual evidence
      const interestNames = topInterests
        .map((s) => CONCEPT_MAP[s.concept]?.label ?? s.concept)
        .slice(0, 3);

      const reelTopics = reel.topics.map((t) => CONCEPT_MAP[t]?.label ?? t).join(' and ');
      const topInterestLabel = CONCEPT_MAP[fingerprint.topInterests[0]?.concept]?.label ?? 'software engineering';

      const broadLabels = (rankingEvidence?.broadInterest ?? [])
        .map((concept) => CONCEPT_MAP[concept]?.label ?? concept)
        .slice(0, 2);
      const broadReason = broadLabels.length > 0
        ? ` It is prioritized for its connection to your broader ${broadLabels.join(' and ')} interest.`
        : '';
      const explanation = `Recommended because you strongly interacted with ${interestNames.join(', ')} content. This Reel connects those interests to ${reelTopics}, extending your inferred interest in ${topInterestLabel}.${broadReason}`;

      const diversityReason = rankingEvidence?.adjacentInterest
        ? ' A small adjacent-topic boost was applied without overriding relevance.'
        : '';
      const repetitionReason = rankingEvidence?.repeatedTopic
        ? ` Repetition of ${CONCEPT_MAP[rankingEvidence.repeatedTopic]?.label ?? rankingEvidence.repeatedTopic} was limited in favor of broader learning.`
        : '';
      const whyThisRecommendation = `This recommendation bridges your demonstrated ${interestNames[0] ?? 'technology'} interest with ${reel.category}. Interest match: ${scores.interestMatch}%, educational value: ${scores.educationalValue}%, hype risk: ${scores.hypeRisk}%. The system chose substance over hype.${diversityReason}${repetitionReason}`;

      return { explanation, evidenceChips: evidenceChips.slice(0, 5), whyThisRecommendation };
    },
  };
}
