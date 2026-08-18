import { cn, scoreTextColor } from '@/lib/utils';

interface ScoreBarProps {
  label: string;
  value: number; // 0-100
  max?: number;
  color?: string;
  showValue?: boolean;
  delay?: number;
}

export function ScoreBar({ label, value, color, showValue = true, delay = 0 }: ScoreBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const barColor = color ?? (pct >= 75 ? 'from-emerald-400 to-green-500' : pct >= 50 ? 'from-amber-400 to-orange-500' : pct >= 25 ? 'from-pink-400 to-rose-500' : 'from-red-400 to-red-600');

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        {showValue && (
          <span className={cn('font-semibold tabular-nums', scoreTextColor(pct))}>{pct}%</span>
        )}
      </div>
      <div className="score-bar">
        <div
          className={cn('score-bar-fill bg-gradient-to-r', barColor)}
          style={{ width: `${pct}%`, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}
