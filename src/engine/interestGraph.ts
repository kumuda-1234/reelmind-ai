// Interest Graph — builds a cross-domain knowledge graph from inferred interests.

import type { Interaction, Reel, EngineConfig, InterestGraph, GraphNode, GraphEdge } from './types';
import type { InterestFingerprint } from './types';
import type { BehaviorAnalyzer } from './behaviorAnalyzer';
import type { ContentAnalyzer } from './contentAnalyzer';
import { CONCEPT_MAP, getAncestors, TAXONOMY } from './taxonomy';

export interface InterestGraphBuilder {
  build(
    fingerprint: InterestFingerprint,
    interactions: Interaction[],
    reels: Reel[],
    behavior: BehaviorAnalyzer,
    content: ContentAnalyzer,
    config: EngineConfig
  ): InterestGraph;
}

export function createInterestGraphBuilder(): InterestGraphBuilder {
  return {
    build(fingerprint, interactions, reels, behavior, content, config): InterestGraph {
      const reelMap = new Map(reels.map((r) => [r.id, r]));

      // Collect concepts that have meaningful scores
      const activeConcepts = new Set<string>();
      for (const s of fingerprint.scores) {
        if (s.score > 10) activeConcepts.add(s.concept);
      }

      // Find the central node — highest scoring broad interest
      const broadScores = fingerprint.scores
        .filter((s) => CONCEPT_MAP[s.concept]?.level >= 1 && s.score > 20)
        .sort((a, b) => b.score - a.score);
      const centralNode = broadScores[0]?.concept ?? 'software_engineering';

      // Build node set: active concepts + central + their ancestors
      const nodeConcepts = new Set<string>([centralNode]);
      for (const c of activeConcepts) {
        nodeConcepts.add(c);
        for (const a of getAncestors(c)) nodeConcepts.add(a);
      }

      // Position nodes in concentric rings by level
      const nodes: GraphNode[] = [];
      const byLevel: Record<number, string[]> = { 0: [], 1: [], 2: [] };
      for (const c of nodeConcepts) {
        const level = CONCEPT_MAP[c]?.level ?? 0;
        byLevel[level]?.push(c);
      }

      const scoreMap = new Map(fingerprint.scores.map((s) => [s.concept, s.score]));

      for (const level of [0, 1, 2]) {
        const concepts = byLevel[level] ?? [];
        const radius = level === 0 ? 180 : level === 1 ? 100 : 0;
        concepts.forEach((concept, i) => {
          const angle = (i / Math.max(concepts.length, 1)) * Math.PI * 2 - Math.PI / 2;
          nodes.push({
            id: concept,
            label: CONCEPT_MAP[concept]?.label ?? concept,
            level,
            x: 250 + radius * Math.cos(angle),
            y: 250 + radius * Math.sin(angle),
            weight: scoreMap.get(concept) ?? 5,
            isCentral: concept === centralNode,
          });
        });
      }

      // Build edges from taxonomy parent relationships
      const edgeSet = new Set<string>();
      const edges: GraphEdge[] = [];
      for (const concept of nodeConcepts) {
        const entry = CONCEPT_MAP[concept];
        if (!entry) continue;
        for (const parent of entry.parents) {
          if (nodeConcepts.has(parent)) {
            const key = `${concept}->${parent}`;
            if (!edgeSet.has(key)) {
              edgeSet.add(key);
              const childWeight = scoreMap.get(concept) ?? 5;
              const parentWeight = scoreMap.get(parent) ?? 5;
              edges.push({
                source: concept,
                target: parent,
                weight: Math.max(childWeight, parentWeight),
              });
            }
          }
        }
      }

      // Add cross-domain related edges (glowing connections)
      for (const concept of nodeConcepts) {
        const entry = CONCEPT_MAP[concept];
        if (!entry) continue;
        for (const related of entry.related) {
          if (nodeConcepts.has(related) && related !== concept) {
            const key = [concept, related].sort().join('--');
            const edgeKey = `rel:${key}`;
            if (!edgeSet.has(edgeKey)) {
              edgeSet.add(edgeKey);
              edges.push({
                source: concept,
                target: related,
                weight: Math.min(scoreMap.get(concept) ?? 5, scoreMap.get(related) ?? 5) * 0.6,
              });
            }
          }
        }
      }

      return { nodes, edges, centralNode };
    },
  };
}
