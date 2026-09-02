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
  Flame,
  Star
} from 'lucide-react';
import { AppView, User } from '../../types';
import { soundEffects } from '../../utils/soundEffects';
import { Study3DAnimation } from '../ui/Study3DAnimation';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: User;
  onOpenSettings: () => void;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  showAnimationPreview?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenSettings,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
  showAnimationPreview = true,
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
          className="fixed inset-0 bg-[#171A18]/20 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 w-64 bg-white/65 backdrop-blur-2xl border-r border-white/80 flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-[4px_0_30px_rgba(15,98,70,0.02)] shrink-0 overflow-y-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Upper Section: Logo, Navigation, and Clean Fitted Animation */}
        <div className="flex-1 flex flex-col min-h-0 justify-between">
          <div>
            <div className="px-5 py-5 border-b border-white/80 flex items-center justify-between shrink-0">
              <div
                onClick={() => handleItemClick('home')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/85 border border-emerald-200/80 shadow-[0_4px_16px_rgba(22,131,91,0.12)] flex items-center justify-center text-[#16835B] group-hover:scale-105 transition-all">
                  <Sparkles className="w-5 h-5 text-[#16835B]" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-[#171A18] tracking-tight leading-none group-hover:text-[#16835B] transition-colors">
                    Study to Shine
                  </h1>
                  <p className="text-[11px] text-[#5F6762] font-medium mt-1">
                    Learn smarter, Shine brighter.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Items (Translucent Liquid Glass Highlight for active) */}
            <nav className="p-3 space-y-1 mt-2 shrink-0">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#DCEFE7]/85 to-[#EEF7F3]/70 text-[#0F6246] border border-emerald-300/60 shadow-[0_4px_16px_rgba(22,131,91,0.08)] backdrop-blur-md'
                        : 'text-[#5F6762] hover:text-[#171A18] hover:bg-white/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`transition-colors ${
                          isActive ? 'text-[#16835B]' : 'text-[#89918C] group-hover:text-[#16835B]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[#16835B] text-white'
                            : 'bg-white/80 text-[#5F6762] border border-emerald-100'
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
          </div>

          {/* Clean 3D WebGL Animation running to Vishal Patel with NO extra bottom space */}
          {showAnimationPreview && (
            <div className="flex-1 min-h-[160px] px-3 pt-1 pb-1.5 flex flex-col">
              <Study3DAnimation className="w-full flex-1" />
            </div>
          )}
        </div>

        {/* Bottom Section: Profile, Settings & Upgrade to Pro */}
        <div className="p-3 border-t border-emerald-200/60 space-y-2 bg-white/40 backdrop-blur-md">
          {/* User Profile Pill (Vishal Patel) */}
          <div
            onClick={onOpenSettings}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-white/70 hover:bg-white/90 border border-white/80 shadow-2xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-100/90 text-[#16835B] font-bold text-sm flex items-center justify-center border border-emerald-200 shrink-0 overflow-hidden shadow-2xs">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#171A18] truncate group-hover:text-[#16835B] transition-colors">
                  {user.name}
                </p>
                <p className="text-[11px] text-[#5F6762] truncate">
                  {user.gradeLevel || 'Class 12 • Science'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#89918C] group-hover:text-[#16835B] transition-colors shrink-0" />
          </div>

          {/* Upgrade to Pro / Mentorship Pill Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#0F6246] bg-gradient-to-r from-emerald-100/70 to-[#DCEFE7]/80 hover:from-emerald-100 hover:to-[#DCEFE7] border border-emerald-200/80 shadow-2xs transition-all cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/20" />
            <span>Upgrade to Pro</span>
          </button>
        </div>
      </aside>
    </>
  );
};
