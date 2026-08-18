import { Search, Bell, Menu } from 'lucide-react';

interface TopBarProps {
  onOpenMobile: () => void;
}

export function TopBar({ onOpenMobile }: TopBarProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="sticky top-0 z-30 px-4 lg:px-8 py-4 backdrop-blur-xl bg-[#0a0612]/70 border-b border-violet-500/10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="lg:hidden w-9 h-9 rounded-lg glass-card-flat flex items-center justify-center text-gray-300"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-white">
              {greeting} <span className="inline-block animate-pulse">👋</span>
            </h1>
            <p className="text-xs lg:text-sm text-gray-400 hidden sm:block">
              Your feed has more to say than you think.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl glass-card-flat text-sm w-56 lg:w-72">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search interests, reels..."
              className="bg-transparent outline-none text-gray-200 placeholder-gray-500 flex-1"
            />
          </div>

          {/* Notifications */}
          <button className="relative w-9 h-9 rounded-xl glass-card-flat flex items-center justify-center text-gray-300 hover:text-white transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500"></span>
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/20">
            S
          </div>
        </div>
      </div>
    </header>
  );
}
