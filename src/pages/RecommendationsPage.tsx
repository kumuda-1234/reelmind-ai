import { useState } from 'react';
import type { AnalysisResult, Recommendation } from '@/engine/types';
import { GlassCard, SectionTitle } from '@/components/GlassCard';
import { ScoreBar } from '@/components/ScoreBar';
import { Badge } from '@/components/Badge';
import { confidenceColor, difficultyColor, scoreTextColor } from '@/lib/utils';
import { Target, Shield, Check, X, Play, ThumbsUp, ThumbsDown, Sparkles, AlertTriangle } from 'lucide-react';

interface RecommendationsPageProps {
  analysis: AnalysisResult;
}

export function RecommendationsPage({ analysis }: RecommendationsPageProps) {
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});

  const handleFeedback = (reelId: string, useful: boolean) => {
    setFeedback((prev) => ({ ...prev, [reelId]: useful ? 'up' : 'down' }));
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6 fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-1">Recommendations</h2>
        <p className="text-sm text-gray-400">AI-curated technology reels with full transparency on scoring and hype filtering.</p>
      </div>

      {/* AI Hype Shield section */}
      <GlassCard className="mb-6 fade-in-up stagger-1" hover={false}>
        <SectionTitle icon={<Shield size={16} />} title="AI Hype Shield" subtitle="Filtered clickbait vs recommended substance" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Filtered */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <X size={16} className="text-red-400" />
              </div>
              <span className="text-sm font-semibold text-red-300">Filtered: High Hype Risk</span>
            </div>
            <div className="space-y-2">
              {analysis.hypeShield.filtered.map((item) => (
                <div key={item.reel.id} className="glass-card-flat p-3 border-red-500/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-200 truncate">{item.reel.title}</div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.reason}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">Hype Risk</span>
                          <span className="text-xs font-semibold text-red-400">{item.hypeRisk}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">Edu Value</span>
                          <span className="text-xs font-semibold text-gray-400">{item.educationalValue}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Check size={16} className="text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-emerald-300">Recommended: Substance Over Hype</span>
            </div>
            <div className="space-y-2">
              <div className="glass-card-flat p-3 border-emerald-500/20">
                <div className="flex items-start gap-2">
                  <Sparkles size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-200 truncate">{analysis.hypeShield.recommendedAlternative.reel.title}</div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{analysis.hypeShield.recommendedAlternative.explanation}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">Hype Risk</span>
                        <span className="text-xs font-semibold text-emerald-400">{analysis.hypeShield.recommendedAlternative.scores.hypeRisk}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">Edu Value</span>
                        <span className="text-xs font-semibold text-emerald-400">{analysis.hypeShield.recommendedAlternative.scores.educationalValue}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">Match</span>
                        <span className="text-xs font-semibold text-emerald-400">{analysis.hypeShield.recommendedAlternative.scores.interestMatch}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-emerald-300 font-medium italic">
              {analysis.hypeShield.message}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* All recommendations */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white tracking-wide px-1">All Recommendations ({analysis.recommendations.length})</h3>
        {analysis.recommendations.map((rec, i) => (
          <RecommendationCard
            key={rec.reel.id}
            rec={rec}
            index={i}
            feedback={feedback[rec.reel.id]}
            onFeedback={(useful) => handleFeedback(rec.reel.id, useful)}
          />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({
  rec,
  index,
  feedback,
  onFeedback,
}: {
  rec: Recommendation;
  index: number;
  feedback?: 'up' | 'down';
  onFeedback: (useful: boolean) => void;
}) {
  return (
    <GlassCard className={`fade-in-up stagger-${Math.min(index + 1, 6)}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Reel info */}
        <div className="lg:col-span-1">
          <div className="flex gap-3">
            <div
              className="w-20 h-28 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, hsl(${rec.reel.thumbnailHue}, 70%, 25%), hsl(${rec.reel.thumbnailHue + 30}, 60%, 15%))`,
              }}
            >
              <Play size={22} className="text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white leading-snug">{rec.reel.title}</h4>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{rec.reel.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="category">{rec.category}</Badge>
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${difficultyColor(rec.difficulty)}`}>
                  {rec.difficulty}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${confidenceColor(rec.confidence)}`}>
                  {rec.confidence}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Scores */}
        <div className="lg:col-span-1">
          <div className="text-xs font-semibold text-gray-400 mb-2">Score Breakdown</div>
          <div className="space-y-2">
            <ScoreBar label="Interest Match" value={rec.scores.interestMatch} delay={index * 50} />
            <ScoreBar label="Semantic Similarity" value={rec.scores.semanticSimilarity} delay={index * 50 + 50} />
            <ScoreBar label="Educational Value" value={rec.scores.educationalValue} delay={index * 50 + 100} />
            <ScoreBar label="Exploration" value={rec.scores.exploration} delay={index * 50 + 150} />
            <ScoreBar label="Hype Risk" value={rec.scores.hypeRisk} delay={index * 50 + 200} color="from-red-400 to-red-600" />
          </div>
          <div className="mt-3 flex items-center justify-between glass-card-flat px-3 py-2">
            <span className="text-xs text-gray-400">Final Score</span>
            <span className={`text-lg font-bold ${scoreTextColor(rec.scores.finalScore)}`}>{rec.scores.finalScore}</span>
          </div>
        </div>

        {/* Right: Explanation + feedback */}
        <div className="lg:col-span-1">
          <div className="text-xs font-semibold text-gray-400 mb-2">Why This Recommendation</div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {rec.evidenceChips.map((chip, i) => (
              <Badge key={i} variant="category">{chip}</Badge>
            ))}
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-3">{rec.explanation}</p>
          <div className="flex gap-2">
            {feedback ? (
              <div className="flex-1 text-center py-2 text-xs text-emerald-300 font-medium">
                {feedback === 'up' ? 'Marked as useful' : 'Marked as not relevant'}
              </div>
            ) : (
              <>
                <button
                  onClick={() => onFeedback(true)}
                  className="flex-1 ghost-btn px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5"
                >
                  <ThumbsUp size={13} /> Useful
                </button>
                <button
                  onClick={() => onFeedback(false)}
                  className="flex-1 ghost-btn px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5"
                >
                  <ThumbsDown size={13} /> Not Relevant
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
