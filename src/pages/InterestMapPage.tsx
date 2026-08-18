import type { AnalysisResult } from '@/engine/types';
import { GlassCard, SectionTitle } from '@/components/GlassCard';
import { InterestGraphViz } from '@/components/InterestGraphViz';
import { Badge } from '@/components/Badge';
import { Network, Eye, Sparkles } from 'lucide-react';

interface InterestMapPageProps {
  analysis: AnalysisResult;
}

export function InterestMapPage({ analysis }: InterestMapPageProps) {
  const graph = analysis.graph;
  const centralNode = graph.nodes.find((n) => n.isCentral);
  const connectedNodes = graph.edges
    .filter((e) => e.source === graph.centralNode || e.target === graph.centralNode)
    .map((e) => (e.source === graph.centralNode ? e.target : e.source));

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6 fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-1">Interest Map</h2>
        <p className="text-sm text-gray-400">Cross-domain knowledge graph showing how your interests connect.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph */}
        <div className="lg:col-span-2">
          <GlassCard className="fade-in-up stagger-1" hover={false}>
            <SectionTitle
              icon={<Network size={16} />}
              title="Cross-Domain Interest Graph"
              subtitle="Glowing connections reveal hidden interest pathways"
            />
            <InterestGraphViz graph={graph} height={550} />
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                Central Interest
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-violet-500"></span>
                Broad Interest
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-300"></span>
                Specific Topic
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gradient-to-r from-pink-500 to-violet-500"></span>
                Strong Connection
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {/* Central interest */}
          {centralNode && (
            <GlassCard className="fade-in-up stagger-2">
              <SectionTitle icon={<Sparkles size={16} />} title="Central Inferred Interest" subtitle="The hub of your interest graph" />
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 shadow-lg shadow-violet-500/30 mb-3">
                  <Network size={28} className="text-white" />
                </div>
                <div className="text-xl font-bold gradient-text">{centralNode.label}</div>
                <div className="text-sm text-gray-400 mt-1">Interest strength: {centralNode.weight}%</div>
              </div>
            </GlassCard>
          )}

          {/* Connected interests */}
          <GlassCard className="fade-in-up stagger-3">
            <SectionTitle icon={<Eye size={16} />} title="Connected Interests" subtitle="Directly linked to the central node" />
            <div className="space-y-2">
              {connectedNodes.map((nodeId) => {
                const node = graph.nodes.find((n) => n.id === nodeId);
                if (!node) return null;
                return (
                  <div key={nodeId} className="glass-card-flat p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">{node.label}</div>
                      <div className="text-[10px] text-gray-400">
                        {node.level === 0 ? 'Specific topic' : node.level === 1 ? 'Mid-level domain' : 'Broad interest'}
                      </div>
                    </div>
                    <Badge variant={node.level >= 1 ? 'category' : 'default'}>{node.weight}%</Badge>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Supporting evidence */}
          <GlassCard className="fade-in-up stagger-4">
            <SectionTitle icon={<Sparkles size={16} />} title="Supporting Evidence" subtitle="Reels that contributed to this graph" />
            <div className="space-y-2">
              {analysis.hiddenInterest.evidence.map((evidence) => (
                <div key={evidence} className="glass-card-flat p-3">
                  <div className="text-xs text-gray-300">{evidence}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
