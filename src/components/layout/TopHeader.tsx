import React from 'react';
import { Menu, Sparkles, Flame, Plus } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E1E5E1] px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle & View title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[#5F6762] hover:text-[#171A18] hover:bg-[#F4F5F1] transition-colors"
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
                      repeatDelay: 2,
                      duration: 1.8,
                      ease: 'easeInOut',
                    }}
                    className="inline-flex items-center justify-center text-amber-500"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-500/30" />
                  </motion.span>
                  <span className="bg-gradient-to-r from-[#0F6246] via-[#16835B] to-[#10E862] bg-clip-text text-transparent font-extrabold tracking-tight">
                    Study to Shine
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 text-[#0F6246] border border-emerald-200/60 hidden sm:inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Learning Hub
                  </span>
                </motion.span>
              ) : (
                <span>{getPageTitle(currentView)}</span>
              )}

              {currentView === 'doubt-solver' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F6246]">
                  Active AI
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Solve Doubt CTA if not already on Doubt Solver */}
          {currentView !== 'doubt-solver' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigate('doubt-solver')}
              leftIcon={<Plus className="w-4 h-4 text-[#16835B]" />}
              className="hidden sm:inline-flex"
            >
              Ask a Doubt
            </Button>
          )}

          {/* Daily Streak Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F9F6] border border-[#E1E5E1] text-xs font-semibold text-[#171A18]">
            <Flame className="w-4 h-4 text-emerald-600" />
            <span>{user.streakDays || 5}d Streak</span>
          </div>

          {/* User Profile trigger */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-emerald-100 text-[#16835B] font-bold text-xs flex items-center justify-center border border-emerald-200 hover:ring-2 hover:ring-[#16835B]/20 transition-all overflow-hidden"
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
