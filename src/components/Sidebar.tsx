import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Sparkles,
  Network,
  Target,
  TrendingUp,
  Compass,
  Settings,
  User,
  Brain,
} from 'lucide-react';

export type PageId =
  | 'overview'
  | 'reel-intelligence'
  | 'interest-map'
  | 'recommendations'
  | 'evolution'
  | 'explore';

interface SidebarProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'reel-intelligence', label: 'Reel Intelligence', icon: <Sparkles size={18} /> },
  { id: 'interest-map', label: 'Interest Map', icon: <Network size={18} /> },
  { id: 'recommendations', label: 'Recommendations', icon: <Target size={18} /> },
  { id: 'evolution', label: 'Interest Evolution', icon: <TrendingUp size={18} /> },
  { id: 'explore', label: 'Explore', icon: <Compass size={18} /> },
];

export function Sidebar({ current, onNavigate, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-64 z-50 lg:z-0',
          'flex flex-col p-4 gap-2',
          'glass-card-flat border-y-0 border-l-0',
          'transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ borderRadius: 0 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <div className="text-base font-bold gradient-text">ReelMind</div>
            <div className="text-[10px] text-gray-500 tracking-widest uppercase">AI Tech Discovery</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile();
              }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                'text-left',
                current === item.id
                  ? 'bg-gradient-to-r from-pink-500/15 to-violet-500/15 text-white border border-violet-400/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              <span className={current === item.id ? 'text-pink-400' : ''}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Engine status */}
        <div className="px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-xs text-emerald-300 font-medium">AI Engine Online</span>
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col gap-1">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <Settings size={18} />
            Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <User size={18} />
            Profile
          </button>
        </div>
      </aside>
    </>
  );
}
