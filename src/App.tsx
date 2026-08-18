import { useState, useCallback, useEffect } from 'react';
import type { AnalysisResult, Interaction, InteractionType } from '@/engine/types';
import { api } from '@/engine/api';
import { SEED_INTERACTIONS } from '@/engine/seedData';
import { Sidebar, type PageId } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { OverviewPage } from '@/pages/OverviewPage';
import { ReelIntelligencePage } from '@/pages/ReelIntelligencePage';
import { InterestMapPage } from '@/pages/InterestMapPage';
import { RecommendationsPage } from '@/pages/RecommendationsPage';
import { EvolutionPage } from '@/pages/EvolutionPage';
import { ExplorePage } from '@/pages/ExplorePage';

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [demoInteractions, setDemoInteractions] = useState<Interaction[]>([]);

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await api.analyze();
      setAnalysis(result);
    } catch (e) {
      setError('Unable to run analysis. Please try again.');
      console.error('Analysis error:', e);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page as PageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDemoInteraction = useCallback(async (
    reelId: string,
    type: InteractionType,
    watchCompletion: number
  ) => {
    const interaction: Interaction = {
      id: `demo-${Date.now()}-${demoInteractions.length + 1}`,
      reelId,
      type,
      watchCompletion,
      timestamp: Date.now(),
      week: 4,
    };
    const updatedInteractions = [...demoInteractions, interaction];
    setAnalyzing(true);
    setError(null);
    try {
      const result = await api.analyzeWithInteractions([...SEED_INTERACTIONS, ...updatedInteractions]);
      setDemoInteractions(updatedInteractions);
      setAnalysis(result);
    } catch (e) {
      setError('Unable to update the live demo. Please try again.');
      console.error('Live demo analysis error:', e);
      throw e;
    } finally {
      setAnalyzing(false);
    }
  }, [demoInteractions]);

  const handleResetDemo = useCallback(async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await api.analyze();
      setDemoInteractions([]);
      setAnalysis(result);
    } catch (e) {
      setError('Unable to reset the live demo. Please try again.');
      console.error('Live demo reset error:', e);
      throw e;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  // Auto-run analysis on first load so the demo works immediately
  useEffect(() => {
    if (!analysis && !analyzing) {
      handleAnalyze();
    }
  }, [analysis, analyzing, handleAnalyze]);

  const renderPage = () => {
    if (error) {
      return (
        <div className="px-4 lg:px-8 py-20 max-w-2xl mx-auto text-center">
          <div className="glass-card p-8">
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button onClick={handleAnalyze} className="gradient-btn px-5 py-2.5 rounded-xl text-sm">
              Retry Analysis
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'overview':
        return (
          <OverviewPage
            analysis={analysis}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
            onNavigate={handleNavigate}
            onDemoInteraction={handleDemoInteraction}
            onResetDemo={handleResetDemo}
            demoInteractionCount={demoInteractions.length}
          />
        );
      case 'reel-intelligence':
        return analysis ? <ReelIntelligencePage analysis={analysis} /> : <LoadingState />;
      case 'interest-map':
        return analysis ? <InterestMapPage analysis={analysis} /> : <LoadingState />;
      case 'recommendations':
        return analysis ? <RecommendationsPage analysis={analysis} /> : <LoadingState />;
      case 'evolution':
        return analysis ? <EvolutionPage analysis={analysis} /> : <LoadingState />;
      case 'explore':
        return analysis ? <ExplorePage analysis={analysis} /> : <LoadingState />;
      default:
        return (
          <OverviewPage
            analysis={analysis}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
            onNavigate={handleNavigate}
            onDemoInteraction={handleDemoInteraction}
            onResetDemo={handleResetDemo}
            demoInteractionCount={demoInteractions.length}
          />
        );
    }
  };

  return (
    <div className="min-h-screen relative flex">
      <div className="ambient-bg" />

      <Sidebar
        current={currentPage}
        onNavigate={handleNavigate}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 relative z-10 min-w-0">
        <TopBar onOpenMobile={() => setMobileSidebarOpen(true)} />
        <main className="pb-12">{renderPage()}</main>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="px-4 lg:px-8 py-20 max-w-2xl mx-auto text-center">
      <div className="glass-card p-8">
        <div className="inline-flex items-center gap-3 text-violet-300">
          <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Running AI analysis pipeline...</span>
        </div>
      </div>
    </div>
  );
}

export default App;
