import React, { useState } from 'react';
import { Menu, Sparkles, Flame, Plus, Search, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { AppView, User } from '../../types';
import { Button } from '../ui/Button';

interface TopHeaderProps {
  currentView: AppView;
  user: User;
  onOpenMobileMenu: () => void;
  onNavigate: (view: AppView) => void;
  onOpenSettings: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  user,
  onOpenMobileMenu,
  onNavigate,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getPageTitle = (view: AppView) => {
    switch (view) {
      case 'home':
        return 'Study to Shine';
      case 'doubt-solver':
        return 'AI Doubt Solver';
      case 'ai-notes':
        return 'AI Notes & Analysis';
      case 'news-paper':
        return 'News Paper';
      case 'my-notes':
        return 'My Notes & Notebook';
      case 'settings':
        return 'Settings & Preferences';
      default:
        return 'Study to Shine';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('doubt-solver');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/65 backdrop-blur-2xl border-b border-white/80 px-4 sm:px-6 py-3 shadow-[0_4px_24px_rgba(15,98,70,0.02)] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle & View title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[#5F6762] hover:text-[#171A18] hover:bg-white/80 transition-colors"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#171A18] tracking-tight flex items-center gap-2">
              {currentView === 'home' ? (
                /* Animated Study to Shine Title with Shining Sparkles & Shimmer */
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 group cursor-default"
                >
                  <motion.span
                    animate={{
                      rotate: [0, 15, -10, 15, 0],
                      scale: [1, 1.15, 1, 1.1, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatDelay: 3,
                      duration: 2,
                      ease: 'easeInOut',
                    }}
                    className="inline-flex items-center justify-center"
                  >
                    <Sparkles className="w-4 h-4 text-[#16835B] fill-emerald-500/25" />
                  </motion.span>
                  <span className="bg-gradient-to-r from-[#0F6246] via-[#16835B] to-[#10E862] bg-clip-text text-transparent font-extrabold tracking-tight">
                    Study to Shine
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/70 text-[#0F6246] border border-emerald-200/50 hidden sm:inline-flex items-center gap-1 backdrop-blur-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Learning Hub
                  </span>
                </motion.span>
              ) : (
                <span>{getPageTitle(currentView)}</span>
              )}

              {currentView === 'doubt-solver' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F6246] border border-emerald-200/60">
                  Active AI
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Center: Search pill bar (as shown in iOS liquid glass reference) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-4 relative"
        >
          <Search className="w-4 h-4 text-[#89918C] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, doubts, topics..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-white/70 backdrop-blur-md border border-white/90 text-[#171A18] placeholder-[#89918C] focus:outline-none focus:bg-white/90 focus:border-[#16835B]/40 focus:ring-2 focus:ring-[#16835B]/10 transition-all shadow-2xs"
          />
        </form>

        {/* Right Actions: Ask Doubt, Streak, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Solve Doubt CTA if not already on Doubt Solver */}
          {currentView !== 'doubt-solver' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigate('doubt-solver')}
              leftIcon={<Plus className="w-4 h-4 text-[#16835B]" />}
              className="hidden sm:inline-flex bg-white/70 backdrop-blur-md border border-white/80 hover:bg-white/90 shadow-2xs"
            >
              Ask a Doubt
            </Button>
          )}

          {/* Daily Streak Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-xs font-bold text-[#171A18] shadow-2xs">
            <Flame className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
            <span>{user.streakDays || 5}d Streak</span>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#5F6762] hover:text-[#171A18] hover:bg-white/90 shadow-2xs transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
          </button>

          {/* User Profile trigger */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-emerald-100/90 text-[#16835B] font-bold text-xs flex items-center justify-center border border-emerald-200/80 hover:ring-2 hover:ring-[#16835B]/20 transition-all overflow-hidden shadow-2xs"
            title="Account settings"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
