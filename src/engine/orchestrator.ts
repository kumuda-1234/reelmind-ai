// Analysis Orchestrator — runs the full recommendation pipeline end-to-end.

import type {
  Reel,
  Interaction,
  EngineConfig,
  AnalysisResult,
  Recommendation,
  PipelineStage,
  HypeShieldResult,
  DiscoveryBalance,
  ExploreTopic,
  InterestScore,
  FeedbackEntry,
} from './types';
import { createContentAnalyzer } from './contentAnalyzer';
import { createBehaviorAnalyzer } from './behaviorAnalyzer';
import { createInterestInference } from './interestInference';
import { createInterestGraphBuilder } from './interestGraph';
import { createCandidateGenerator } from './candidateGenerator';
import { createRecommendationEngine } from './recommendationEngine';
import { createHypeDetector } from './hypeDetector';
import { createExplorationEngine } from './explorationEngine';
import { createExplanationService } from './explanationService';
import { createConfidenceService } from './confidenceService';
import { createEvolutionAnalyzer } from './evolutionAnalyzer';
import { CONCEPT_MAP } from './taxonomy';

export interface ReelMindEngine {
  analyze(
    reels: Reel[],
    interactions: Interaction[],
    candidates: Reel[],
    config: EngineConfig,
    feedback: FeedbackEntry[]
  ): AnalysisResult;
}

export function createEngine(): ReelMindEngine {
  const content = createContentAnalyzer();
  const behavior = createBehaviorAnalyzer();
  const inference = createInterestInference();
  const graphBuilder = createInterestGraphBuilder();
  const candidateGen = createCandidateGenerator();
  const recEngine = createRecommendationEngine();
  const hypeDetector = createHypeDetector(content);
  const exploration = createExplorationEngine();
  const explanation = createExplanationService();
  const confidence = createConfidenceService();
  const evolution = createEvolutionAnalyzer();

  return {
    analyze(reels, interactions, candidates, config, feedback): AnalysisResult {
      const pipeline: PipelineStage[] = [
        { name: 'Analyze Interactions', status: 'pending', detail: 'Processing interaction history' },
        { name: 'Understand Content', status: 'pending', detail: 'Semantic content analysis' },
        { name: 'Discover Hidden Interests', status: 'pending', detail: 'Inferring broader interests' },
        { name: 'Build Interest Map', status: 'pending', detail: 'Constructing cross-domain graph' },
        { name: 'Filter Hype Content', status: 'pending', detail: 'AI Hype Shield activation' },
        { name: 'Rank Candidates', status: 'pending', detail: 'Scoring recommendations' },
        { name: 'Recommend & Explain', status: 'pending', detail: 'Generating explanations' },
      ];

      // 1. Current reel = most recent interaction
      const sortedInteractions = [...interactions].sort((a, b) => b.timestamp - a.timestamp);
      const currentInteraction = sortedInteractions[0];
      const currentReel = reels.find((r) => r.id === currentInteraction.reelId)!;

      pipeline[0].status = 'done';

      // 2. Content analysis (done implicitly via inference)
      pipeline[1].status = 'done';

      // 3. Infer interests
      const fingerprint = inference.infer(interactions, reels, behavior, content, config);
      pipeline[2].status = 'done';

      // Hidden interest = highest scoring non-direct broad interest
      const hiddenInterest: InterestScore = fingerprint.hiddenInterests[0] ?? {
        concept: 'software_engineering',
        score: fingerprint.topInterests[0]?.score ?? 0,
        direct: false,
        evidence: fingerprint.topInterests.slice(0, 4).map((s) => CONCEPT_MAP[s.concept]?.label ?? s.concept),
      };

      // 4. Build interest graph
      const graph = graphBuilder.build(fingerprint, interactions, reels, behavior, content, config);
      pipeline[3].status = 'done';

      // 5. Hype shield
      const consumedIds = reels.map((r) => r.id);
      const hypeResults = hypeDetector.scoreAll(candidates);
      const hypeFiltered = hypeResults
        .filter((h) => h.hypeRisk >= 50)
        .map((h) => ({
          reel: h.reel,
          hypeRisk: h.hypeRisk,
          educationalValue: h.educationalValue,
          interestMatch: 0,
          reason: h.reason,
        }));
      pipeline[4].status = 'done';

      // 6. Generate candidates & rank
      const candidateResults = candidateGen.generate(candidates, fingerprint, consumedIds);
      const recommendations = recEngine.rank(
        candidateResults,
        fingerprint,
        config,
        hypeDetector,
        exploration,
        explanation,
        confidence
      );
      pipeline[5].status = 'done';

      // 7. Build hype shield result with recommended alternative
      const topRec = recommendations[0];
      const hypeShield: HypeShieldResult = {
        filtered: hypeFiltered,
        recommendedAlternative: topRec,
        message: 'AI chose substance over hype.',
      };
      pipeline[6].status = 'done';

      // Evolution analysis
      const evolutionResult = evolution.analyze(interactions, reels, behavior, content, inference, config);

      // Discovery balance
      const learningContent = reels.filter((r) => r.educationalValue >= 40);
      const entertainmentContent = reels.filter((r) => r.educationalValue < 40);
      const totalInteractions = interactions.length;
      const learningInteractions = interactions.filter((i) => {
        const reel = reels.find((r) => r.id === i.reelId);
        return reel && reel.educationalValue >= 40;
      }).length;
      const learningPct = totalInteractions > 0 ? Math.round((learningInteractions / totalInteractions) * 100) : 50;
      const discoveryBalance: DiscoveryBalance = {
        learning: learningPct,
        entertainment: 100 - learningPct,
        message: 'We are not stopping entertainment. We are making your existing scrolling more useful.',
      };

      // Explore topics (adjacent areas)
      const exploreTopics: ExploreTopic[] = buildExploreTopics(fingerprint, recommendations, candidates);

      // Interest detected for current reel
      const currentReelConcepts = currentReel.semanticConcepts;
      const detectedInterest = currentReelConcepts
        .map((c) => CONCEPT_MAP[c]?.label ?? c)
        .slice(0, 2)
        .join(' / ');

      const whyDetected = `This reel contains concepts related to ${currentReelConcepts.map((c) => CONCEPT_MAP[c]?.label ?? c).join(', ')}. Combined with your interaction pattern (${currentInteraction.type.replace(/_/g, ' ')}), it contributes to your inferred interest in ${CONCEPT_MAP[fingerprint.topInterests[0]?.concept]?.label ?? 'software engineering'}.`;

      return {
        currentReel,
        currentInteraction,
        interestDetected: detectedInterest,
        whyDetected,
        fingerprint,
        hiddenInterest,
        graph,
        recommendations,
        hypeShield,
        evolution: evolutionResult,
        discoveryBalance,
        exploreTopics,
        pipeline,
      };
    },
  };
}

function buildExploreTopics(
  fingerprint: import('./types').InterestFingerprint,
  recommendations: Recommendation[],
  candidates: Reel[]
): ExploreTopic[] {
  const exploreCategories: { topic: string; category: import('./types').ReelCategory; reason: string }[] = [
    { topic: 'System Design', category: 'HLD', reason: 'Natural progression from your DSA and programming interests — learn how large systems are architected.' },
    { topic: 'Cloud Computing', category: 'Cloud', reason: 'Your hardware and developer-tools interest connects to cloud infrastructure where modern apps run.' },
    { topic: 'Backend Engineering', category: 'Backend', reason: 'Your Java and programming interests extend directly into building server-side applications and APIs.' },
    { topic: 'DevOps', category: 'DevOps', reason: 'Bridge between development and deployment — adjacent to your software engineering interest.' },
    { topic: 'Cybersecurity', category: 'Cybersecurity', reason: 'You engaged with cybersecurity news — explore how to build secure systems proactively.' },
    { topic: 'AI / ML', category: 'AI', reason: 'Your AI technology interaction suggests curiosity about how intelligent systems actually work.' },
  ];

  return exploreCategories.map((e) => {
    const exampleReel = candidates.find((c) => c.category === e.category && !c.hypeIndicators.length) ?? candidates[0];
    const relevanceMap = new Map(fingerprint.scores.map((s) => [s.concept, s.score]));
    let relevance = 50;
    const matching = recommendations.find((r) => r.reel.category === e.category);
    if (matching) relevance = matching.scores.interestMatch;
    return { ...e, relevance, exampleReel };
  });
}
