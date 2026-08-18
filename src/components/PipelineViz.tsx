import { useEffect, useState } from 'react';
import type { PipelineStage } from '@/engine/types';
import { cn } from '@/lib/utils';
import { Check, Loader2, Circle } from 'lucide-react';

interface PipelineVizProps {
  stages: PipelineStage[];
  onComplete: () => void;
  trigger: number; // increment to restart
}

export function PipelineViz({ stages, onComplete, trigger }: PipelineVizProps) {
  const [activeStage, setActiveStage] = useState(-1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setDone(false);
    setActiveStage(0);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= stages.length) {
        clearInterval(interval);
        setDone(true);
        setTimeout(onComplete, 300);
      } else {
        setActiveStage(i);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [trigger]);

  if (trigger === 0) return null;

  return (
    <div className="glass-card p-6 mb-6 reveal">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-pink-500 pulse-glow"></div>
        <span className="text-sm font-semibold text-white">AI Analysis Pipeline</span>
      </div>
      <div className="space-y-2.5">
        {stages.map((stage, i) => {
          const isActive = i === activeStage && !done;
          const isDone = done || i < activeStage;
          return (
            <div
              key={stage.name}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                isActive && 'bg-pink-500/10 border border-pink-500/30',
                isDone && 'bg-emerald-500/5 border border-emerald-500/20',
                !isActive && !isDone && 'border border-transparent'
              )}
            >
              <div className="flex-shrink-0">
                {isDone ? (
                  <Check size={16} className="text-emerald-400" />
                ) : isActive ? (
                  <Loader2 size={16} className="text-pink-400 animate-spin" />
                ) : (
                  <Circle size={16} className="text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <div className={cn('text-sm font-medium', isDone ? 'text-white' : isActive ? 'text-pink-300' : 'text-gray-500')}>
                  {stage.name}
                </div>
                {isActive && <div className="text-xs text-gray-400 mt-0.5">{stage.detail}</div>}
              </div>
              {isDone && <span className="text-xs text-emerald-400">Complete</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
