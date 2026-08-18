// Behavior Analyzer — weights interactions by type and watch completion.

import type { Interaction, EngineConfig, Reel } from './types';

export interface WeightedInteraction {
  interaction: Interaction;
  weight: number;
}

export interface BehaviorProfile {
  weighted: WeightedInteraction[];
  totalEngagement: number;
  interactionCounts: Record<string, number>;
}

export interface BehaviorAnalyzer {
  weightInteraction(interaction: Interaction, config: EngineConfig): number;
  buildProfile(interactions: Interaction[], config: EngineConfig): BehaviorProfile;
  getReelInteractions(reelId: string, interactions: Interaction[]): Interaction[];
}

export function createBehaviorAnalyzer(): BehaviorAnalyzer {
  return {
    weightInteraction(interaction: Interaction, config: EngineConfig): number {
      const base = config.behaviorWeights[interaction.type] ?? 0;
      // Scale positive interactions by watch completion
      if (base > 0) {
        return base * (0.5 + 0.5 * interaction.watchCompletion);
      }
      return base;
    },

    buildProfile(interactions: Interaction[], config: EngineConfig): BehaviorProfile {
      const weighted: WeightedInteraction[] = interactions.map((i) => ({
        interaction: i,
        weight: this.weightInteraction(i, config),
      }));
      const totalEngagement = weighted.reduce((sum, w) => sum + w.weight, 0);
      const interactionCounts: Record<string, number> = {};
      for (const w of weighted) {
        const reel = w.interaction.reelId;
        interactionCounts[reel] = (interactionCounts[reel] ?? 0) + 1;
      }
      return { weighted, totalEngagement, interactionCounts };
    },

    getReelInteractions(reelId: string, interactions: Interaction[]): Interaction[] {
      return interactions.filter((i) => i.reelId === reelId);
    },
  };
}
