import { useState } from 'react';
import type { AnalysisResult } from '@/engine/types';
import { GlassCard, SectionTitle } from '@/components/GlassCard';
import { ScoreBar } from '@/components/ScoreBar';
import { Badge } from '@/components/Badge';
import { PipelineViz } from '@/components/PipelineViz';
import { InterestGraphViz } from '@/components/InterestGraphViz';
import { formatDuration, scoreTextColor, confidenceColor, difficultyColor } from '@/lib/utils';
import { labelOf } from '@/lib/labels';
import {
  Sparkles,
  Brain,
  Target,
  Shield,
  TrendingUp,
  Compass,
  Eye,
  Zap,
  Play,
  ThumbsUp,
  ThumbsDown,
  Network,
  Film,
  Scale,
  Check,
} from 'lucide-react';

interface OverviewPageProps {
  analysis: AnalysisResult | null;
  onAnalyze: () => void;
  analyzing: boolean;
  onNavigate: (page: string) => void;
}

export function OverviewPage({ analysis, onAnalyze, analyzing, onNavigate }: OverviewPageProps) {
  const [pipelineTrigger, setPipelineTrigger] = useState(0);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  const handleAnalyze = () => {
    setPipelineTrigger((t) => t + 1);
    onAnalyze();
  };

  if (!analysis) {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Hero */}
        <section className="text-center py-12 lg:py-20 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-flat mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            <span className="text-xs font-medium text-pink-300 tracking-wide">AI ANALYSIS READY</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight max-w-3xl mx-auto">
            Understand what your feed is <span className="gradient-text">really telling you.</span>
          </h1>
          <p className="text-gray-400 text-base lg:text-lg max-w-2xl mx-auto mb-8">
            ReelMind discovers hidden technology interests from the content you already watch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="gradient-btn px-6 py-3 rounded-xl text-sm flex items-center gap-2 min-w-[180px] justify-center"
            >
              {analyzing ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Analyze My Feed
                </>
              )}
            </button>
            <button
              onClick={() => onNavigate('interest-map')}
              className="ghost-btn px-6 py-3 rounded-xl text-sm flex items-center gap-2 min-w-[180px] justify-center"
            >
              <Network size={16} />
              Explore Interests
            </button>
          </div>
        </section>

        {/* Feature preview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { icon: <Brain size={20} />, title: 'Interest Inference', desc: 'Semantic analysis of your scrolling patterns' },
            { icon: <Shield size={20} />, title: 'AI Hype Shield', desc: 'Filters clickbait and rewards substance' },
            { icon: <Network size={20} />, title: 'Cross-Domain Graph', desc: 'Visualizes hidden interest connections' },
            { icon: <TrendingUp size={20} />, title: 'Interest Evolution', desc: 'Tracks how your interests shift over time' },
          ].map((f, i) => (
            <div key={f.title} className={`glass-card p-5 fade-in-up stagger-${i + 1}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-violet-400/20 flex items-center justify-center text-pink-400 mb-3">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const topRec = analysis.recommendations[0];
  const hidden = analysis.hiddenInterest;
  const fingerprint = analysis.fingerprint;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
      <PipelineViz
        stages={analysis.pipeline}
        trigger={pipelineTrigger}
        onComplete={() => {}}
      />

      {/* Hero summary */}
      <div className="glass-card p-6 lg:p-8 mb-6 fade-in-up">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} className="text-pink-400" />
              <span className="text-xs font-medium text-pink-300 tracking-wide">ANALYSIS COMPLETE</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">
              Your feed says you're into <span className="gradient-text">{fingerprint.topInterests[0] ? labelOf(fingerprint.topInterests[0].concept) : 'Software Engineering'}</span>
            </h2>
            <p className="text-gray-400 text-sm mt-2 max-w-2xl">
              {analysis.whyDetected}
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="gradient-btn px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 flex-shrink-0"
          >
            <Sparkles size={15} className={analyzing ? 'animate-spin' : ''} />
            Re-Analyze
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Reel */}
          <GlassCard className="fade-in-up stagger-1">
            <SectionTitle icon={<Film size={16} />} title="Current Reel" subtitle="The most recent content you interacted with" />
            <div className="flex gap-4">
              <div
                className="w-24 h-32 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, hsl(${analysis.currentReel.thumbnailHue}, 70%, 25%), hsl(${analysis.currentReel.thumbnailHue + 30}, 60%, 15%))`,
                }}
              >
                <Play size={24} className="text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{analysis.currentReel.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{analysis.currentReel.creator}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="category">{analysis.currentReel.category}</Badge>
                  <Badge>{formatDuration(analysis.currentReel.duration)}</Badge>
                  <Badge variant="difficulty">{analysis.currentReel.difficulty}</Badge>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  <span className="text-pink-300 font-medium capitalize">{analysis.currentInteraction.type.replace(/_/g, ' ')}</span>
                  <span className="mx-1.5 text-gray-600">·</span>
                  <span>{Math.round(analysis.currentInteraction.watchCompletion * 100)}% watched</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* AI Interest Detected */}
          <GlassCard className="fade-in-up stagger-2">
            <SectionTitle icon={<Zap size={16} />} title="AI Interest Detected" subtitle="Semantic inference from this interaction" />
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl font-bold gradient-text">{analysis.interestDetected}</div>
            </div>
            <p className="text-sm text-gray-400">{analysis.whyDetected}</p>
          </GlassCard>

          {/* AI Interest Fingerprint */}
          <GlassCard className="fade-in-up stagger-3">
            <SectionTitle icon={<Brain size={16} />} title="AI Interest Fingerprint" subtitle="Your inferred interest profile" />
            <div className="space-y-3">
              {fingerprint.topInterests.map((interest, i) => (
                <div key={interest.concept}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 font-medium">{labelOf(interest.concept)}</span>
                      {interest.direct ? (
                        <Badge variant="success">Direct</Badge>
                      ) : (
                        <Badge variant="warning">Inferred</Badge>
                      )}
                    </div>
                    <span className={scoreTextColor(interest.score) + ' font-semibold tabular-nums'}>{interest.score}%</span>
                  </div>
                  <ScoreBar label="Interest Strength" value={interest.score} showValue={false} delay={i * 80} />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Hidden Interest Discovery */}
          <GlassCard className="fade-in-up stagger-4">
            <SectionTitle icon={<Eye size={16} />} title="Hidden Interest Discovery" subtitle="Something we discovered" />
            <div className="text-lg font-semibold text-white mb-2">
              You may be more interested in <span className="gradient-text">{labelOf(hidden.concept)}</span> than you realize.
            </div>
            <p className="text-sm text-gray-400 mb-4">
              The system found repeated connections between {hidden.evidence.slice(0, 4).map((e) => e).join(', ')}.
            </p>
            <div className="flex flex-wrap gap-2">
              {hidden.evidence.map((evidence) => (
                <Badge key={evidence} variant="category">{evidence}</Badge>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-gray-500">Confidence:</span>
              <span className={scoreTextColor(hidden.score) + ' font-semibold'}>{hidden.score}%</span>
            </div>
          </GlassCard>

          {/* Interest Map Preview */}
          <GlassCard className="fade-in-up stagger-5" hover={false}>
            <SectionTitle icon={<Network size={16} />} title="Interest Map Preview" subtitle="Cross-domain interest connections" />
            <InterestGraphViz graph={analysis.graph} height={400} />
            <button
              onClick={() => onNavigate('interest-map')}
              className="ghost-btn w-full mt-4 px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <Network size={15} />
              View Full Interest Map
            </button>
          </GlassCard>
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* Recommended Tech Reel */}
          {topRec && (
            <GlassCard className="fade-in-up stagger-2 reveal" hover={false}>
              <SectionTitle icon={<Target size={16} />} title="Recommended Tech Reel" subtitle="Top AI pick for you" />
              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-semibold text-white leading-snug">{topRec.reel.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{topRec.reel.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="category">{topRec.category}</Badge>
                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${difficultyColor(topRec.difficulty)}`}>
                    {topRec.difficulty}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${confidenceColor(topRec.confidence)}`}>
                    {topRec.confidence} Confidence
                  </span>
                </div>
                <div className="space-y-2 pt-2">
                  <ScoreBar label="Technology Relevance" value={topRec.scores.semanticSimilarity} delay={200} />
                  <ScoreBar label="Interest Match" value={topRec.scores.interestMatch} delay={300} />
                  <ScoreBar label="Educational Value" value={topRec.scores.educationalValue} delay={400} />
                  <ScoreBar label="Hype Risk" value={topRec.scores.hypeRisk} delay={500} color="from-red-400 to-red-600" />
                </div>
                <button className="gradient-btn w-full px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-2">
                  <Play size={15} />
                  Watch Recommendation
                </button>
              </div>
            </GlassCard>
          )}

          {/* Why This Recommendation */}
          {topRec && (
            <GlassCard className="fade-in-up stagger-3">
              <SectionTitle icon={<Sparkles size={16} />} title="Why This Recommendation" subtitle="Evidence-based reasoning" />
              <div className="flex flex-wrap gap-2 mb-3">
                {topRec.evidenceChips.map((chip, i) => (
                  <Badge key={i} variant="category">{chip}</Badge>
                ))}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{topRec.explanation}</p>
            </GlassCard>
          )}

          {/* AI Hype Shield */}
          <GlassCard className="fade-in-up stagger-4">
            <SectionTitle icon={<Shield size={16} />} title="AI Hype Shield" subtitle="Substance over clickbait" />
            <div className="space-y-2">
              {analysis.hypeShield.filtered.slice(0, 2).map((item) => (
                <div key={item.reel.id} className="glass-card-flat p-3 border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={12} className="text-red-400" />
                    <span className="text-xs text-red-300 font-medium">Filtered</span>
                  </div>
                  <p className="text-xs text-gray-300 truncate">{item.reel.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                    <span className="text-red-400">Hype: {item.hypeRisk}%</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-400">Edu: {item.educationalValue}%</span>
                  </div>
                </div>
              ))}
              <div className="glass-card-flat p-3 border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-xs text-emerald-300 font-medium">Recommended Instead</span>
                </div>
                <p className="text-xs text-gray-300 truncate">{topRec?.reel.title}</p>
                <p className="text-[10px] text-emerald-400 mt-1">{analysis.hypeShield.message}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('recommendations')}
              className="ghost-btn w-full mt-3 px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              View All Recommendations
            </button>
          </GlassCard>

          {/* Learning / Entertainment Balance */}
          <GlassCard className="fade-in-up stagger-5">
            <SectionTitle icon={<Scale size={16} />} title="Discovery Balance" subtitle="Learning vs Entertainment" />
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1">Learning</div>
                <div className="text-2xl font-bold text-violet-300">{analysis.discoveryBalance.learning}%</div>
              </div>
              <div className="text-gray-600 text-xl">/</div>
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1">Entertainment</div>
                <div className="text-2xl font-bold text-pink-300">{analysis.discoveryBalance.entertainment}%</div>
              </div>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-violet-400" style={{ width: `${analysis.discoveryBalance.learning}%` }} />
              <div className="bg-gradient-to-r from-pink-500 to-pink-400" style={{ width: `${analysis.discoveryBalance.entertainment}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-3 italic">{analysis.discoveryBalance.message}</p>
          </GlassCard>

          {/* Interest Evolution preview */}
          <GlassCard className="fade-in-up stagger-6">
            <SectionTitle icon={<TrendingUp size={16} />} title="Interest Evolution" subtitle="How interests changed" />
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Biggest shift</span>
                <span className="text-pink-300 font-medium capitalize">{labelOf(analysis.evolution.biggestShift.concept)} {analysis.evolution.biggestShift.direction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Emerging interest</span>
                <span className="text-violet-300 font-medium">{labelOf(analysis.evolution.emergingInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Strongest interest</span>
                <span className="text-emerald-300 font-medium">{labelOf(analysis.evolution.strongestInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Next discovery</span>
                <span className="text-amber-300 font-medium">{analysis.evolution.nextDiscovery}</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('evolution')}
              className="ghost-btn w-full mt-3 px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              View Full Evolution
            </button>
          </GlassCard>

          {/* Recommendation Feedback */}
          {topRec && (
            <GlassCard className="fade-in-up stagger-6">
              <SectionTitle icon={<ThumbsUp size={16} />} title="Recommendation Feedback" subtitle="Help improve recommendations" />
              {feedbackGiven ? (
                <div className="text-center py-3">
                  <div className="text-emerald-400 text-sm font-medium">Thanks for your feedback!</div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setFeedbackGiven('up')}
                    className="flex-1 ghost-btn px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <ThumbsUp size={15} />
                    Useful
                  </button>
                  <button
                    onClick={() => setFeedbackGiven('down')}
                    className="flex-1 ghost-btn px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <ThumbsDown size={15} />
                    Not Relevant
                  </button>
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </div>

      {/* Explore Beyond Your Feed */}
      <GlassCard className="mt-6 fade-in-up">
        <SectionTitle icon={<Compass size={16} />} title="Explore Beyond Your Feed" subtitle="Adjacent technology topics to discover" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {analysis.exploreTopics.map((topic) => (
            <button
              key={topic.topic}
              onClick={() => onNavigate('explore')}
              className="glass-card-flat p-3 text-left hover:border-pink-500/30 transition-all group"
            >
              <div className="text-sm font-semibold text-white group-hover:gradient-text transition-all">{topic.topic}</div>
              <div className="text-[10px] text-gray-400 mt-1">{topic.relevance}% match</div>
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}


