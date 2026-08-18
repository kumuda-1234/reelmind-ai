// Evolution Analyzer — tracks how interests change over time.

import type { Interaction, Reel, EngineConfig, EvolutionResult, EvolutionPoint } from './types';
import type { BehaviorAnalyzer } from './behaviorAnalyzer';
import type { ContentAnalyzer } from './contentAnalyzer';
import type { InterestInference } from './interestInference';
import { CONCEPT_MAP } from './taxonomy';

const TRACKED_INTERESTS = ['gaming', 'programming', 'software_engineering', 'ai_ml', 'hardware'];

export interface EvolutionAnalyzer {
  analyze(
    interactions: Interaction[],
    reels: Reel[],
    behavior: BehaviorAnalyzer,
    content: ContentAnalyzer,
    inference: InterestInference,
    config: EngineConfig
  ): EvolutionResult;
}

export function createEvolutionAnalyzer(): EvolutionAnalyzer {
  return {
    analyze(interactions, reels, behavior, content, inference, config): EvolutionResult {
      const weeks = [1, 2, 3, 4];
      const points: EvolutionPoint[] = [];

      for (const week of weeks) {
        const weekInteractions = interactions.filter((i) => i.week === week);
        if (weekInteractions.length === 0) {
          points.push({
            week,
            label: week === 4 ? 'Current' : `Week ${week}`,
            interests: Object.fromEntries(TRACKED_INTERESTS.map((k) => [k, 0])),
          });
          continue;
        }

        const fingerprint = inference.infer(weekInteractions, reels, behavior, content, config);
        const scoreMap = new Map(fingerprint.scores.map((s) => [s.concept, s.score]));

        points.push({
          week,
          label: week === 4 ? 'Current' : `Week ${week}`,
          interests: Object.fromEntries(
            TRACKED_INTERESTS.map((k) => [k, scoreMap.get(k) ?? 0])
          ),
        });
      }

      // Compute biggest shift (week 1 vs current)
      const first = points[0]?.interests ?? {};
      const last = points[points.length - 1]?.interests ?? {};
      let biggestShiftConcept = 'software_engineering';
      let biggestShiftDelta = 0;
      for (const k of TRACKED_INTERESTS) {
        const delta = (last[k] ?? 0) - (first[k] ?? 0);
        if (Math.abs(delta) > Math.abs(biggestShiftDelta)) {
          biggestShiftDelta = delta;
          biggestShiftConcept = k;
        }
      }

      // Emerging interest: low in early weeks, high in current
      let emergingInterest = 'programming';
      let emergingDelta = -Infinity;
      for (const k of TRACKED_INTERESTS) {
        const early = Math.max(points[0]?.interests[k] ?? 0, points[1]?.interests[k] ?? 0);
        const current = last[k] ?? 0;
        const delta = current - early;
        if (delta > emergingDelta) {
          emergingDelta = delta;
          emergingInterest = k;
        }
      }

      // Strongest interest in current week
      let strongestInterest = 'software_engineering';
      let strongestScore = 0;
      for (const k of TRACKED_INTERESTS) {
        if ((last[k] ?? 0) > strongestScore) {
          strongestScore = last[k] ?? 0;
          strongestInterest = k;
        }
      }

      // Next discovery suggestion
      const nextDiscoveryMap: Record<string, string> = {
        software_engineering: 'System Design',
        programming: 'Backend Engineering',
        ai_ml: 'Data Science',
        hardware: 'Cloud Infrastructure',
        gaming: 'GPU Programming',
      };

      const shiftLabel = CONCEPT_MAP[biggestShiftConcept]?.label ?? biggestShiftConcept;
      const strongestLabel = CONCEPT_MAP[strongestInterest]?.label ?? strongestInterest;
      const emergingLabel = CONCEPT_MAP[emergingInterest]?.label ?? emergingInterest;

      let insight: string;
      if (biggestShiftConcept === strongestInterest) {
        insight = `Your interactions have shifted strongly toward ${strongestLabel}. ${emergingLabel} is your fastest-growing emerging interest.`;
      } else {
        const direction = biggestShiftDelta > 0 ? 'rising' : 'declining';
        insight = `Your interactions show ${shiftLabel} ${direction} while ${strongestLabel} is now your strongest interest. ${emergingLabel} is your fastest-growing emerging interest.`;
      }

      return {
        points,
        biggestShift: {
          concept: biggestShiftConcept,
          delta: Math.round(biggestShiftDelta),
          direction: biggestShiftDelta > 0 ? 'rising' : 'declining',
        },
        emergingInterest,
        strongestInterest,
        nextDiscovery: nextDiscoveryMap[strongestInterest] ?? 'System Design',
        insight,
      };
    },
  };
}
