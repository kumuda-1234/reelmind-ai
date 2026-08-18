// Hype Detector — identifies and scores clickbait/hype technology content.

import type { Reel } from './types';
import type { ContentAnalyzer, AnalyzedContent } from './contentAnalyzer';

export interface HypeResult {
  reel: Reel;
  hypeRisk: number; // 0-100
  educationalValue: number;
  reason: string;
}

export interface HypeDetector {
  score(reel: Reel): HypeResult;
  scoreAll(reels: Reel[]): HypeResult[];
}

const HYPE_INDICATOR_WEIGHTS: Record<string, number> = {
  guarantee: 25,
  clickbait_title: 20,
  urgency: 15,
  job_promise: 20,
  all_caps: 10,
  time_pressure: 15,
  no_experience_needed: 15,
  replacement_claim: 25,
  doom_narrative: 15,
  sensationalist: 20,
};

export function createHypeDetector(content: ContentAnalyzer): HypeDetector {
  return {
    score(reel: Reel): HypeResult {
      const analyzed = content.analyze(reel);
      let hypeRisk = 0;
      const reasons: string[] = [];

      for (const indicator of analyzed.hypeIndicators) {
        hypeRisk += HYPE_INDICATOR_WEIGHTS[indicator] ?? 10;
        reasons.push(indicator.replace(/_/g, ' '));
      }

      // Low educational value amplifies hype risk
      if (analyzed.educationalValue < 20) {
        hypeRisk += 20;
        reasons.push('low educational substance');
      }
      if (analyzed.educationalValue < 10) {
        hypeRisk += 10;
      }

      hypeRisk = Math.min(100, hypeRisk);

      const reason = reasons.length > 0
        ? `Flagged for: ${reasons.slice(0, 3).join(', ')}`
        : 'Clean content — no hype indicators detected';

      return {
        reel,
        hypeRisk: Math.round(hypeRisk),
        educationalValue: analyzed.educationalValue,
        reason,
      };
    },
    scoreAll(reels: Reel[]): HypeResult[] {
      return reels.map((r) => this.score(r));
    },
  };
}
