// Content Analyzer — understands reel content semantically.
// API-ready: this interface is designed so a real LLM/embedding layer can replace
// the rule-based semantic extraction without changing downstream services.

import type { Reel } from './types';
import { CONCEPT_MAP, getAncestors } from './taxonomy';

export interface AnalyzedContent {
  reelId: string;
  concepts: string[];
  broadInterests: string[];
  educationalValue: number;
  hypeIndicators: string[];
  difficulty: string;
  isHype: boolean;
}

export interface ContentAnalyzer {
  analyze(reel: Reel): AnalyzedContent;
  analyzeAll(reels: Reel[]): AnalyzedContent[];
}

function computeHype(reel: Reel): { isHype: boolean; indicators: string[] } {
  const indicators = [...reel.hypeIndicators];
  const title = reel.title.toLowerCase();
  const hypePhrases = ['guarantee', 'in 7 days', 'replace all', 'one tool', 'will replace'];
  for (const phrase of hypePhrases) {
    if (title.includes(phrase) && !indicators.includes(phrase)) {
      indicators.push(phrase);
    }
  }
  const isHype = indicators.length >= 2 || reel.educationalValue < 20;
  return { isHype, indicators };
}

export function createContentAnalyzer(): ContentAnalyzer {
  return {
    analyze(reel: Reel): AnalyzedContent {
      const concepts = [...reel.semanticConcepts];
      // Expand to ancestors for broad interest detection
      const broadSet = new Set<string>();
      for (const c of concepts) {
        for (const a of getAncestors(c)) broadSet.add(a);
      }
      const broadInterests = Array.from(broadSet).filter((c) => CONCEPT_MAP[c]?.level >= 1);

      const { isHype, indicators } = computeHype(reel);

      return {
        reelId: reel.id,
        concepts,
        broadInterests,
        educationalValue: reel.educationalValue,
        hypeIndicators: indicators,
        difficulty: reel.difficulty,
        isHype,
      };
    },
    analyzeAll(reels: Reel[]): AnalyzedContent[] {
      return reels.map((r) => this.analyze(r));
    },
  };
}
