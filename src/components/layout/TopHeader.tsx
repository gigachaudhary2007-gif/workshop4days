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
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2.5 rounded-xl text-[#5F6762] hover:text-[#171A18] hover:bg-white/80 active:bg-emerald-50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-bold text-[#171A18] tracking-tight flex items-center gap-1.5 sm:gap-2 truncate">
              {currentView === 'home' ? (
                /* Animated Study to Shine Title with Shining Sparkles & Shimmer */
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 group cursor-default truncate"
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
                    className="inline-flex items-center justify-center shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16835B] fill-emerald-500/25" />
                  </motion.span>
                  <span className="bg-gradient-to-r from-[#0F6246] via-[#16835B] to-[#10E862] bg-clip-text text-transparent font-extrabold tracking-tight truncate">
                    Study to Shine
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/70 text-[#0F6246] border border-emerald-200/50 hidden md:inline-flex items-center gap-1 backdrop-blur-xs shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Learning Hub
                  </span>
                </motion.span>
              ) : (
                <span className="truncate">{getPageTitle(currentView)}</span>
              )}

              {currentView === 'doubt-solver' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F6246] border border-emerald-200/60 shrink-0 hidden xs:inline-block">
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
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
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
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-xs font-bold text-[#171A18] shadow-2xs cursor-pointer hover:bg-white/90 transition-all min-h-[36px]"
            title={`${user.streakDays || 5} days study streak`}
          >
            <Flame className="w-4 h-4 text-emerald-600 fill-emerald-600/20 shrink-0" />
            <span className="whitespace-nowrap">{user.streakDays || 5}d<span className="hidden sm:inline"> Streak</span></span>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#5F6762] hover:text-[#171A18] hover:bg-white/90 shadow-2xs transition-all cursor-pointer min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
          </button>

          {/* User Profile trigger */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100/90 text-[#16835B] font-bold text-xs flex items-center justify-center border border-emerald-200/80 hover:ring-2 hover:ring-[#16835B]/20 transition-all overflow-hidden shadow-2xs cursor-pointer shrink-0"
            title="Account settings"
            aria-label="Account profile and settings"
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
