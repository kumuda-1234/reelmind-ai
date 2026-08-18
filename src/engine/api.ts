// API Layer — simulated REST client.
// Mirrors a Node/Express backend with service-based architecture.
// All services are modular and independent from UI. The data layer is
// replaceable: swap these functions for real fetch() calls to a backend
// without changing any UI code.

import type {
  AnalysisResult,
  EngineConfig,
  FeedbackEntry,
  Reel,
  Interaction,
  Recommendation,
} from './types';
import { createEngine } from './orchestrator';
import { SEED_REELS, SEED_INTERACTIONS, CANDIDATE_REELS, DEFAULT_CONFIG } from './seedData';

const engine = createEngine();

// Simulated in-memory data store (replaceable with real database)
let config: EngineConfig = { ...DEFAULT_CONFIG };
let feedbackStore: FeedbackEntry[] = [];

// ─── Simulated API endpoints ──────────────────────────────────────────────

export const api = {
  // GET /api/reels
  async getReels(): Promise<Reel[]> {
    return SEED_REELS;
  },

  // GET /api/interactions
  async getInteractions(): Promise<Interaction[]> {
    return SEED_INTERACTIONS;
  },

  // GET /api/candidates
  async getCandidates(): Promise<Reel[]> {
    return CANDIDATE_REELS;
  },

  // GET /api/config
  async getConfig(): Promise<EngineConfig> {
    return config;
  },

  // PUT /api/config
  async updateConfig(newConfig: Partial<EngineConfig>): Promise<EngineConfig> {
    config = { ...config, ...newConfig };
    return config;
  },

  // POST /api/analyze — runs the full recommendation pipeline
  async analyze(): Promise<AnalysisResult> {
    return engine.analyze(SEED_REELS, SEED_INTERACTIONS, CANDIDATE_REELS, config, feedbackStore);
  },

  // Demo-only analysis path. Callers own the in-memory interaction list; seed data is never mutated.
  async analyzeWithInteractions(interactions: Interaction[]): Promise<AnalysisResult> {
    return engine.analyze(SEED_REELS, interactions, CANDIDATE_REELS, config, feedbackStore);
  },

  // GET /api/feedback
  async getFeedback(): Promise<FeedbackEntry[]> {
    return feedbackStore;
  },

  // POST /api/feedback
  async submitFeedback(recommendationReelId: string, useful: boolean): Promise<{ success: boolean }> {
    feedbackStore.push({
      id: `f${feedbackStore.length + 1}`,
      recommendationReelId,
      useful,
      timestamp: Date.now(),
    });
    return { success: true };
  },
};

// Re-export types and services for UI convenience
export type { AnalysisResult, Recommendation, Reel, Interaction, EngineConfig, FeedbackEntry };
export { SEED_REELS, SEED_INTERACTIONS, CANDIDATE_REELS, DEFAULT_CONFIG };
