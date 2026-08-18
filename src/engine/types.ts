// ReelMind AI — Engine type definitions

export type ReelCategory =
  | 'AI'
  | 'DSA'
  | 'Java'
  | 'HLD'
  | 'Cybersecurity'
  | 'Cloud'
  | 'Hardware'
  | 'Career'
  | 'Backend'
  | 'DevOps'
  | 'Programming'
  | 'Entertainment'
  | 'Gaming'
  | 'News';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type InteractionType =
  | 'skip'
  | 'short_watch'
  | 'normal_watch'
  | 'full_watch'
  | 'replay'
  | 'like'
  | 'save';

export interface Reel {
  id: string;
  title: string;
  description: string;
  transcript: string;
  creator: string;
  category: ReelCategory;
  topics: string[];
  semanticConcepts: string[];
  educationalValue: number; // 0-100
  hypeIndicators: string[];
  difficulty: Difficulty;
  duration: number; // seconds
  thumbnailHue: number; // 0-360 for gradient generation
  isCandidate?: boolean;
}

export interface Interaction {
  id: string;
  reelId: string;
  type: InteractionType;
  watchCompletion: number; // 0-1
  timestamp: number; // ms epoch
  week: number; // 1-based week index for evolution
}

export interface BehaviorWeight {
  type: InteractionType;
  weight: number;
}

export interface ConceptNode {
  id: string;
  label: string;
  level: number; // 0 = reel topic, 1 = mid, 2 = broad interest
  parents: string[];
  weight: number;
}

export interface ConceptEdge {
  source: string;
  target: string;
  weight: number;
}

export interface InterestScore {
  concept: string;
  score: number; // 0-100
  direct: boolean;
  evidence: string[];
}

export interface InterestFingerprint {
  scores: InterestScore[];
  topInterests: InterestScore[];
  hiddenInterests: InterestScore[];
}

export interface GraphNode {
  id: string;
  label: string;
  level: number;
  x: number;
  y: number;
  weight: number;
  isCentral?: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface InterestGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centralNode: string;
}

export interface ScoreBreakdown {
  interestMatch: number;
  semanticSimilarity: number;
  educationalValue: number;
  exploration: number;
  hypeRisk: number; // 0-100, higher = more hype
  finalScore: number; // 0-100
}

export interface Recommendation {
  reel: Reel;
  scores: ScoreBreakdown;
  category: ReelCategory;
  difficulty: Difficulty;
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number; // 0-100
  explanation: string;
  evidenceChips: string[];
  whyThisRecommendation: string;
}

export interface HypeFilteredItem {
  reel: Reel;
  hypeRisk: number;
  educationalValue: number;
  interestMatch: number;
  reason: string;
}

export interface HypeShieldResult {
  filtered: HypeFilteredItem[];
  recommendedAlternative: Recommendation;
  message: string;
}

export interface EvolutionPoint {
  week: number;
  label: string;
  interests: Record<string, number>;
}

export interface EvolutionResult {
  points: EvolutionPoint[];
  biggestShift: { concept: string; delta: number; direction: string };
  emergingInterest: string;
  strongestInterest: string;
  nextDiscovery: string;
  insight: string;
}

export interface DiscoveryBalance {
  learning: number; // 0-100
  entertainment: number; // 0-100
  message: string;
}

export interface ExploreTopic {
  topic: string;
  category: ReelCategory;
  reason: string;
  relevance: number;
  exampleReel: Reel;
}

export interface FeedbackEntry {
  id: string;
  recommendationReelId: string;
  useful: boolean;
  timestamp: number;
}

export interface AnalysisResult {
  currentReel: Reel;
  currentInteraction: Interaction;
  interestDetected: string;
  whyDetected: string;
  fingerprint: InterestFingerprint;
  hiddenInterest: InterestScore;
  graph: InterestGraph;
  recommendations: Recommendation[];
  hypeShield: HypeShieldResult;
  evolution: EvolutionResult;
  discoveryBalance: DiscoveryBalance;
  exploreTopics: ExploreTopic[];
  pipeline: PipelineStage[];
}

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'done';
  detail: string;
}

export interface ScoringWeights {
  interestMatch: number;
  semanticSimilarity: number;
  educationalValue: number;
  exploration: number;
  hypePenalty: number;
}

export interface EngineConfig {
  behaviorWeights: Record<InteractionType, number>;
  scoringWeights: ScoringWeights;
  learningEntertainmentBias: number; // 0 = all entertainment, 1 = all learning
}
