import type { AnalysisResult } from '@/engine/types';
import { GlassCard, SectionTitle } from '@/components/GlassCard';
import { ScoreBar } from '@/components/ScoreBar';
import { Badge } from '@/components/Badge';
import { formatDuration, confidenceColor, difficultyColor } from '@/lib/utils';
import { labelOf } from '@/lib/labels';
import { Film, Eye, Brain, Target, Shield, Sparkles, Play, Clock, User } from 'lucide-react';
import { SEED_REELS, SEED_INTERACTIONS } from '@/engine/seedData';
import type { Reel, Interaction } from '@/engine/types';

interface ReelIntelligencePageProps {
  analysis: AnalysisResult;
}

export function ReelIntelligencePage({ analysis }: ReelIntelligencePageProps) {
  const currentReel = analysis.currentReel;
  const topRec = analysis.recommendations[0];

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6 fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-1">Reel Intelligence</h2>
        <p className="text-sm text-gray-400">Deep dive into the AI's analysis of your most recent reel interaction.</p>
      </div>

      {/* Required output format */}
      <GlassCard className="mb-6 fade-in-up stagger-1" hover={false}>
        <SectionTitle icon={<Sparkles size={16} />} title="AI Analysis Report" subtitle="Complete recommendation output" />
        <div className="space-y-4">
          {/* Current Reel */}
          <ReportRow label="CURRENT REEL">
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-20 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, hsl(${currentReel.thumbnailHue}, 70%, 25%), hsl(${currentReel.thumbnailHue + 30}, 60%, 15%))`,
                }}
              >
                <Play size={18} className="text-white/70" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{currentReel.title}</div>
                <div className="text-xs text-gray-400">{currentReel.creator} · {currentReel.category} · {formatDuration(currentReel.duration)}</div>
              </div>
            </div>
          </ReportRow>

          <ReportRow label="INTEREST DETECTED">
            <span className="text-pink-300 font-semibold">{analysis.interestDetected}</span>
          </ReportRow>

          <ReportRow label="WHY">
            <span className="text-gray-300 text-sm">{analysis.whyDetected}</span>
          </ReportRow>

          {topRec && (
            <>
              <ReportRow label="RECOMMENDED TECH REEL">
                <span className="text-white font-semibold">{topRec.reel.title}</span>
              </ReportRow>

              <ReportRow label="CATEGORY">
                <Badge variant="category">{topRec.category}</Badge>
              </ReportRow>

              <ReportRow label="WHY THIS RECOMMENDATION">
                <span className="text-gray-300 text-sm">{topRec.whyThisRecommendation}</span>
              </ReportRow>

              <ReportRow label="DIFFICULTY">
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${difficultyColor(topRec.difficulty)}`}>
                  {topRec.difficulty}
                </span>
              </ReportRow>

              <ReportRow label="CONFIDENCE">
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${confidenceColor(topRec.confidence)}`}>
                  {topRec.confidence} ({topRec.confidenceScore}%)
                </span>
              </ReportRow>
            </>
          )}
        </div>
      </GlassCard>

      {/* Score breakdown */}
      {topRec && (
        <GlassCard className="mb-6 fade-in-up stagger-2">
          <SectionTitle icon={<Target size={16} />} title="Recommendation Score Breakdown" subtitle="How the AI scored this recommendation" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <ScoreBar label="Interest Match Score" value={topRec.scores.interestMatch} delay={100} />
            <ScoreBar label="Semantic Similarity Score" value={topRec.scores.semanticSimilarity} delay={200} />
            <ScoreBar label="Educational Value Score" value={topRec.scores.educationalValue} delay={300} />
            <ScoreBar label="Exploration Score" value={topRec.scores.exploration} delay={400} />
            <ScoreBar label="Hype Risk Score" value={topRec.scores.hypeRisk} delay={500} color="from-red-400 to-red-600" />
            <ScoreBar label="Final Recommendation Score" value={topRec.scores.finalScore} delay={600} color="from-pink-400 to-violet-500" />
          </div>
        </GlassCard>
      )}

      {/* All consumed reels with interaction history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="fade-in-up stagger-3">
          <SectionTitle icon={<Film size={16} />} title="Consumed Reels" subtitle="Your interaction history" />
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {SEED_INTERACTIONS
              .slice()
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((interaction) => {
                const reel = SEED_REELS.find((r) => r.id === interaction.reelId);
                if (!reel) return null;
                return (
                  <ReelInteractionRow key={interaction.id} reel={reel} interaction={interaction} />
                );
              })}
          </div>
        </GlassCard>

        <GlassCard className="fade-in-up stagger-4">
          <SectionTitle icon={<Brain size={16} />} title="Interest Evidence" subtitle="Supporting evidence for inferred interests" />
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {analysis.fingerprint.topInterests.map((interest) => (
              <div key={interest.concept} className="glass-card-flat p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{labelOf(interest.concept)}</span>
                  {interest.direct ? <Badge variant="success">Direct</Badge> : <Badge variant="warning">Inferred</Badge>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {interest.evidence.map((e) => (
                    <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function ReportRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-white/5 last:border-0">
      <div className="text-xs font-semibold text-gray-500 tracking-wider w-48 flex-shrink-0">{label}</div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function ReelInteractionRow({ reel, interaction }: { reel: Reel; interaction: Interaction }) {
  return (
    <div className="glass-card-flat p-3 flex items-center gap-3">
      <div
        className="w-12 h-16 rounded-lg flex-shrink-0 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, hsl(${reel.thumbnailHue}, 70%, 25%), hsl(${reel.thumbnailHue + 30}, 60%, 15%))`,
        }}
      >
        <Play size={14} className="text-white/70" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-white truncate">{reel.title}</div>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
          <User size={10} /> {reel.creator}
          <Clock size={10} /> {formatDuration(reel.duration)}
        </div>
        <div className="text-[10px] text-pink-300 mt-1 capitalize">
          {interaction.type.replace(/_/g, ' ')} · {Math.round(interaction.watchCompletion * 100)}% watched
        </div>
      </div>
    </div>
  );
}

