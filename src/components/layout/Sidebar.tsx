import React from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  FileText,
  Newspaper,
  BookOpen,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  Flame
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppView, User } from '../../types';
import { soundEffects } from '../../utils/soundEffects';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: User;
  onOpenSettings: () => void;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenSettings,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems: Array<{
    id: AppView;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'home',
      label: 'Home',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'doubt-solver',
      label: 'Doubt Solver',
      icon: <HelpCircle className="w-5 h-5" />,
      badge: 'AI',
    },
    {
      id: 'ai-notes',
      label: 'AI Notes',
      icon: <FileText className="w-5 h-5" />,
      badge: 'Audio',
    },
    {
      id: 'news-paper',
      label: 'News Paper',
      icon: <Newspaper className="w-5 h-5" />,
      badge: 'Hindi/En',
    },
    {
      id: 'my-notes',
      label: 'My Notes',
      icon: <BookOpen className="w-5 h-5" />,
    },
  ];

  const handleItemClick = (view: AppView) => {
    if (view !== currentView) {
      soundEffects.playWhoosh();
    } else {
      soundEffects.playPop();
    }
    onNavigate(view);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#171A18]/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md border-r border-[#E1E5E1] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section: Logo & Brand */}
        <div>
          <div className="px-5 py-5 border-b border-[#E1E5E1] flex items-center justify-between">
            <div
              onClick={() => handleItemClick('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#16835B] group-hover:bg-[#0F6246] transition-colors flex items-center justify-center text-white shadow-sm shadow-[#16835B]/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[#171A18] tracking-tight leading-none group-hover:text-[#16835B] transition-colors">
                  Study to Shine
                </h1>
                <p className="text-[11px] text-[#89918C] font-medium mt-0.5">
                  Learn &bull; Understand &bull; Shine
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 mt-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#89918C] mb-2">
              Menu
            </p>
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-emerald-50/90 text-[#0F6246] font-semibold shadow-2xs'
                      : 'text-[#5F6762] hover:text-[#171A18] hover:bg-[#F4F5F1]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive ? 'text-[#16835B]' : 'text-[#89918C] group-hover:text-[#171A18]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-[#16835B] text-white'
                          : 'bg-[#F4F5F1] text-[#5F6762] border border-[#E1E5E1]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-4 h-4 text-[#16835B]" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Daily Streak Highlight */}
          <div className="mx-3 mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-[#F8F9F6] border border-emerald-100/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-[#16835B]">
                  <Flame className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171A18]">{user.streakDays || 5} Day Streak</p>
                  <p className="text-[10px] text-[#5F6762]">Consistent practice!</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#16835B] bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                +150 XP
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Profile, Settings & Logout */}
        <div className="p-3 border-t border-[#E1E5E1] space-y-1 bg-[#F8F9F6]/50">
          {/* User Profile Pill */}
          <div
            onClick={onOpenSettings}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F4F5F1] transition-colors cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#16835B] font-bold text-sm flex items-center justify-center border border-emerald-200 shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#171A18] truncate group-hover:text-[#16835B] transition-colors">
                {user.name}
              </p>
              <p className="text-[11px] text-[#89918C] truncate">{user.gradeLevel || user.email}</p>
            </div>
          </div>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#5F6762] hover:text-[#171A18] hover:bg-[#F4F5F1] transition-colors"
          >
            <Settings className="w-4 h-4 text-[#89918C]" />
            <span>Settings</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
