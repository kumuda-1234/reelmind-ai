import type { AnalysisResult } from '@/engine/types';
import { GlassCard, SectionTitle } from '@/components/GlassCard';
import { ScoreBar } from '@/components/ScoreBar';
import { Badge } from '@/components/Badge';
import { Compass, ArrowRight, Play } from 'lucide-react';
import { labelOf } from '@/lib/labels';

interface ExplorePageProps {
  analysis: AnalysisResult;
}

export function ExplorePage({ analysis }: ExplorePageProps) {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6 fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-1">Explore Beyond Your Feed</h2>
        <p className="text-sm text-gray-400">Adjacent technology topics the AI thinks you'll find valuable, based on your inferred interests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {analysis.exploreTopics.map((topic, i) => (
          <GlassCard key={topic.topic} className={`fade-in-up stagger-${Math.min(i + 1, 6)}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-white">{topic.topic}</h3>
                <Badge variant="category" className="mt-1">{topic.category}</Badge>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold gradient-text">{topic.relevance}%</div>
                <div className="text-[10px] text-gray-500">relevance</div>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-4">{topic.reason}</p>

            <ScoreBar label="Interest Match" value={topic.relevance} showValue={false} delay={i * 80} />

            {/* Example reel */}
            <div className="mt-4 glass-card-flat p-3">
              <div className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">Example Reel</div>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-14 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, hsl(${topic.exampleReel.thumbnailHue}, 70%, 25%), hsl(${topic.exampleReel.thumbnailHue + 30}, 60%, 15%))`,
                  }}
                >
                  <Play size={12} className="text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{topic.exampleReel.title}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{topic.exampleReel.creator}</div>
                </div>
              </div>
            </div>

            <button className="ghost-btn w-full mt-3 px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2">
              Explore Topic
              <ArrowRight size={13} />
            </button>
          </GlassCard>
        ))}
      </div>

      {/* Summary banner */}
      <GlassCard className="mt-6 fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-violet-400/20 flex items-center justify-center text-pink-400 flex-shrink-0">
            <Compass size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Why these topics?</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              These areas are semantically adjacent to your strongest inferred interest in {labelOf(analysis.fingerprint.topInterests[0]?.concept ?? 'software_engineering')}.
              Exploring them helps you discover useful technology topics without creating a repetitive feed.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
