import type { AnalysisResult } from '@/engine/types';
import { GlassCard, SectionTitle } from '@/components/GlassCard';
import { TrendingUp, Sparkles, Award, Compass, Activity } from 'lucide-react';
import { labelOf } from '@/lib/labels';

interface EvolutionPageProps {
  analysis: AnalysisResult;
}

export function EvolutionPage({ analysis }: EvolutionPageProps) {
  const evolution = analysis.evolution;
  const trackedInterests = ['gaming', 'programming', 'software_engineering', 'ai_ml', 'hardware'];
  const colors: Record<string, string> = {
    gaming: '#f43f5e',
    programming: '#ec4899',
    software_engineering: '#a855f7',
    ai_ml: '#8b5cf6',
    hardware: '#6366f1',
  };
  const labels: Record<string, string> = {
    gaming: labelOf('gaming'),
    programming: labelOf('programming'),
    software_engineering: labelOf('software_engineering'),
    ai_ml: labelOf('ai_ml'),
    hardware: labelOf('hardware'),
  };

  const maxVal = 100;
  const chartWidth = 600;
  const chartHeight = 250;
  const padding = { top: 20, right: 20, bottom: 30, left: 30 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;
  const weeks = evolution.points.map((p) => p.label);
  const xStep = innerW / (weeks.length - 1);

  const xScale = (i: number) => padding.left + i * xStep;
  const yScale = (v: number) => padding.top + innerH - (v / maxVal) * innerH;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6 fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-1">Interest Evolution</h2>
        <p className="text-sm text-gray-400">How your interests have shifted over the past few weeks.</p>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <InsightCard
          icon={<TrendingUp size={18} />}
          title="Biggest Shift"
          value={labelOf(evolution.biggestShift.concept)}
          detail={`${evolution.biggestShift.direction} ${Math.abs(evolution.biggestShift.delta)}%`}
          color="text-pink-400"
          delay={1}
        />
        <InsightCard
          icon={<Sparkles size={18} />}
          title="Emerging Interest"
          value={labelOf(evolution.emergingInterest)}
          detail="Fastest growing"
          color="text-violet-400"
          delay={2}
        />
        <InsightCard
          icon={<Award size={18} />}
          title="Strongest Interest"
          value={labelOf(evolution.strongestInterest)}
          detail="Most dominant"
          color="text-emerald-400"
          delay={3}
        />
        <InsightCard
          icon={<Compass size={18} />}
          title="Next Discovery"
          value={evolution.nextDiscovery}
          detail="Suggested area"
          color="text-amber-400"
          delay={4}
        />
      </div>

      {/* Chart */}
      <GlassCard className="mb-6 fade-in-up stagger-5" hover={false}>
        <SectionTitle icon={<Activity size={16} />} title="Interest Trends" subtitle="Weekly interest score evolution" />
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[500px]" style={{ height: 'auto' }}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={v}>
                <line
                  x1={padding.left}
                  y1={yScale(v)}
                  x2={chartWidth - padding.right}
                  y2={yScale(v)}
                  stroke="rgba(168, 85, 247, 0.1)"
                  strokeWidth="1"
                />
                <text x={padding.left - 8} y={yScale(v) + 4} textAnchor="end" className="fill-gray-500" style={{ fontSize: '9px' }}>
                  {v}
                </text>
              </g>
            ))}

            {/* X labels */}
            {weeks.map((label, i) => (
              <text key={label} x={xScale(i)} y={chartHeight - 8} textAnchor="middle" className="fill-gray-400" style={{ fontSize: '9px' }}>
                {label}
              </text>
            ))}

            {/* Lines */}
            {trackedInterests.map((interest) => {
              const points = evolution.points.map((p, i) => `${xScale(i)},${yScale(p.interests[interest] ?? 0)}`).join(' ');
              const color = colors[interest];
              return (
                <g key={interest}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                  />
                  {evolution.points.map((p, i) => (
                    <circle
                      key={i}
                      cx={xScale(i)}
                      cy={yScale(p.interests[interest] ?? 0)}
                      r="3"
                      fill={color}
                      opacity="0.9"
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {trackedInterests.map((interest) => (
            <div key={interest} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: colors[interest] }}></span>
              <span className="text-xs text-gray-300">{labels[interest]}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Insight text */}
      <GlassCard className="fade-in-up stagger-6">
        <SectionTitle icon={<TrendingUp size={16} />} title="AI Insight" subtitle="What the evolution pattern reveals" />
        <p className="text-sm text-gray-300 leading-relaxed">{evolution.insight}</p>
      </GlassCard>
    </div>
  );
}

function InsightCard({ icon, title, value, detail, color, delay }: { icon: React.ReactNode; title: string; value: string; detail: string; color: string; delay: number }) {
  return (
    <div className={`glass-card p-4 fade-in-up stagger-${delay}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <span className="text-xs text-gray-400">{title}</span>
      </div>
      <div className={`text-base font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{detail}</div>
    </div>
  );
}

