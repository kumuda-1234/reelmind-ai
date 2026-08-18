import { useEffect, useState } from 'react';
import { Bookmark, Heart, Play, Radio, RotateCcw, SkipForward } from 'lucide-react';
import type { AnalysisResult, InteractionType, Reel } from '@/engine/types';
import { SEED_REELS } from '@/engine/seedData';
import { labelOf } from '@/lib/labels';
import { Badge } from './Badge';
import { GlassCard, SectionTitle } from './GlassCard';

interface LiveDemoPanelProps {
  analysis: AnalysisResult;
  analyzing: boolean;
  interactionCount: number;
  onInteraction: (reelId: string, type: InteractionType, watchCompletion: number) => Promise<void>;
  onReset: () => Promise<void>;
}

const DEMO_REEL_IDS = ['r1', 'r2', 'r3', 'r4'];
const DEMO_REELS = DEMO_REEL_IDS.map((id) => SEED_REELS.find((reel) => reel.id === id)).filter(
  (reel): reel is Reel => Boolean(reel)
);

export function LiveDemoPanel({ analysis, analyzing, interactionCount, onInteraction, onReset }: LiveDemoPanelProps) {
  const [watchingReelId, setWatchingReelId] = useState<string | null>(null);
  const [watchSecond, setWatchSecond] = useState(0);
  const [status, setStatus] = useState('Ready — choose an interaction to see the pipeline respond.');
  const busy = analyzing || watchingReelId !== null;
  const topInterest = analysis.fingerprint.topInterests[0];
  const topRecommendation = analysis.recommendations[0];

  useEffect(() => {
    if (!watchingReelId) return;
    const timer = window.setInterval(() => {
      setWatchSecond((second) => {
        if (second >= 4) {
          window.clearInterval(timer);
          void recordInteraction(watchingReelId, 'short_watch', 0.6);
          return 5;
        }
        return second + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  // recordInteraction is intentionally defined in component scope; watching state drives this timer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchingReelId]);

  const recordInteraction = async (reelId: string, type: InteractionType, watchCompletion: number) => {
    setStatus('Interaction recorded — re-analyzing interests...');
    try {
      await onInteraction(reelId, type, watchCompletion);
      setStatus('Recommendation updated using the existing AI pipeline.');
    } catch {
      setStatus('Update failed. Try the interaction again.');
    } finally {
      setWatchingReelId(null);
      setWatchSecond(0);
    }
  };

  const startWatch = (reelId: string) => {
    if (busy) return;
    setStatus('Watching... the short-watch signal will be recorded at 5 seconds.');
    setWatchSecond(0);
    setWatchingReelId(reelId);
  };

  const reset = async () => {
    if (busy) return;
    setStatus('Restoring the original seeded interaction state...');
    try {
      await onReset();
      setStatus('Demo reset — original seeded analysis restored.');
    } catch {
      setStatus('Reset failed. Please try again.');
    }
  };

  return (
    <GlassCard className="mb-6 fade-in-up" hover={false}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <SectionTitle icon={<Radio size={16} />} title="Live Demo / Interaction Mode" subtitle="Interact with seeded reels and watch ReelMind update without a reload." />
        <button onClick={reset} disabled={busy} className="ghost-btn px-3 py-2 rounded-xl text-xs disabled:opacity-50">
          <RotateCcw size={13} className="inline mr-1.5" /> Reset Demo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {DEMO_REELS.map((reel) => (
          <div key={reel.id} className="glass-card-flat p-3 border-violet-400/15">
            <div className="flex items-start gap-2 mb-3">
              <div className="w-8 h-10 rounded-lg flex-shrink-0" style={{ background: `linear-gradient(135deg, hsl(${reel.thumbnailHue}, 70%, 32%), hsl(${reel.thumbnailHue + 30}, 60%, 17%))` }} />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white leading-snug line-clamp-2">{reel.title}</div>
                <div className="mt-1"><Badge variant="category">{reel.category}</Badge></div>
              </div>
            </div>
            {watchingReelId === reel.id && (
              <div className="mb-2 text-[10px] text-pink-300">Watching... {watchSecond}s / 5s <span className="inline-block w-12 h-1 ml-1 rounded bg-white/10 align-middle overflow-hidden"><span className="block h-full bg-pink-400 transition-all" style={{ width: `${watchSecond * 20}%` }} /></span></div>
            )}
            <div className="grid grid-cols-5 gap-1">
              <DemoButton label="Skip" icon={<SkipForward size={12} />} disabled={busy} onClick={() => void recordInteraction(reel.id, 'skip', 0)} />
              <DemoButton label="Watch" icon={<Play size={12} />} disabled={busy} onClick={() => startWatch(reel.id)} />
              <DemoButton label="Replay" icon={<RotateCcw size={12} />} disabled={busy} onClick={() => void recordInteraction(reel.id, 'replay', 1)} />
              <DemoButton label="Like" icon={<Heart size={12} />} disabled={busy} onClick={() => void recordInteraction(reel.id, 'like', 1)} />
              <DemoButton label="Save" icon={<Bookmark size={12} />} disabled={busy} onClick={() => void recordInteraction(reel.id, 'save', 1)} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-3">
        <div className="glass-card-flat p-3 border-pink-500/20">
          <div className="text-xs font-semibold text-pink-300 mb-1">Live AI Signal</div>
          <div className="text-[11px] text-gray-400">{status}</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <Signal label="Latest interaction" value={`${analysis.currentInteraction.type.replace(/_/g, ' ')} · ${analysis.currentReel.category}`} />
          <Signal label="Inferred interest" value={topInterest ? labelOf(topInterest.concept) : '—'} />
          <Signal label="Interest confidence" value={topInterest ? `${topInterest.score}%` : '—'} />
          <Signal label="Recommended next topic" value={topRecommendation ? `${topRecommendation.category} · ${topRecommendation.scores.interestMatch}% match` : '—'} />
        </div>
      </div>
      <div className="mt-2 text-[10px] text-gray-500">{interactionCount} live interaction{interactionCount === 1 ? '' : 's'} added in memory. Hype Shield remains active.</div>
    </GlassCard>
  );
}

function DemoButton({ label, icon, disabled, onClick }: { label: string; icon: React.ReactNode; disabled: boolean; onClick: () => void }) {
  return <button aria-label={label} title={label} disabled={disabled} onClick={onClick} className="ghost-btn min-h-8 rounded-lg text-gray-300 flex items-center justify-center disabled:opacity-40">{icon}</button>;
}

function Signal({ label, value }: { label: string; value: string }) {
  return <div className="glass-card-flat p-2 border-white/5 min-w-0"><div className="text-[10px] text-gray-500">{label}</div><div className="mt-0.5 text-gray-200 font-medium truncate" title={value}>{value}</div></div>;
}
