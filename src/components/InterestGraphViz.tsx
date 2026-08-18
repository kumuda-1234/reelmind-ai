import type { InterestGraph as GraphData } from '@/engine/types';
import { cn } from '@/lib/utils';

interface InterestGraphVizProps {
  graph: GraphData;
  height?: number;
  className?: string;
}

export function InterestGraphViz({ graph, height = 500, className }: InterestGraphVizProps) {
  const maxWeight = Math.max(...graph.nodes.map((n) => n.weight), 1);

  const nodeRadius = (weight: number) => {
    const base = graph.nodes.find((n) => n.isCentral) ? 14 : 8;
    return base + (weight / maxWeight) * 10;
  };

  const nodeColor = (level: number, isCentral?: boolean) => {
    if (isCentral) return '#ec4899';
    if (level === 2) return '#a855f7';
    if (level === 1) return '#c084fc';
    return '#d8b4fe';
  };

  return (
    <div className={cn('relative w-full', className)} style={{ height }}>
      <svg viewBox="0 0 500 500" className="w-full h-full">
        <defs>
          <radialGradient id="centralGlow">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Central glow */}
        {graph.nodes.find((n) => n.isCentral) && (
          <circle
            cx={250}
            cy={250}
            r={80}
            fill="url(#centralGlow)"
          />
        )}

        {/* Edges */}
        {graph.edges.map((edge, i) => {
          const source = graph.nodes.find((n) => n.id === edge.source);
          const target = graph.nodes.find((n) => n.id === edge.target);
          if (!source || !target) return null;
          const opacity = Math.min(0.8, edge.weight / 100 + 0.2);
          const strokeWidth = Math.max(0.5, (edge.weight / 100) * 2.5);
          return (
            <line
              key={`${edge.source}-${edge.target}-${i}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="url(#edgeGradient)"
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={edge.source.includes('--') ? '4 4' : undefined}
            />
          );
        })}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          const r = nodeRadius(node.weight);
          const color = nodeColor(node.level, node.isCentral);
          return (
            <g key={node.id} className={node.isCentral ? 'node-glow' : ''}>
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={color}
                opacity={node.isCentral ? 1 : 0.85}
                filter="url(#glow)"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={r + 3}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.3"
              />
              <text
                x={node.x}
                y={node.y + r + 12}
                textAnchor="middle"
                className="fill-gray-300 pointer-events-none"
                style={{ fontSize: node.isCentral ? '11px' : '9px', fontWeight: node.isCentral ? 700 : 500 }}
              >
                {node.label}
              </text>
              {node.isCentral && (
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  className="fill-white pointer-events-none"
                  style={{ fontSize: '9px', fontWeight: 700 }}
                >
                  {node.weight}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
