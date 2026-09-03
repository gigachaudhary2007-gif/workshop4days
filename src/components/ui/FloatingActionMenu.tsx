import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  Headphones,
  Newspaper,
  BookOpen,
  X,
  Sparkles,
} from 'lucide-react';
import { AppView } from '../../types';
import { soundEffects } from '../../utils/soundEffects';

interface FloatingActionMenuProps {
  onNavigate: (view: AppView) => void;
  currentView: AppView;
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
  onNavigate,
  currentView,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    soundEffects.playPop();
    setIsOpen(!isOpen);
  };

  const handleAction = (view: AppView) => {
    soundEffects.playWhoosh();
    onNavigate(view);
    setIsOpen(false);
  };

  const menuItems = [
    {
      id: 'ai-notes' as AppView,
      label: 'Audio Lesson & Notes',
      icon: <Headphones className="w-4 h-4 text-[#16835B]" />,
      bg: 'bg-white/80 backdrop-blur-xl border-white/90 text-[#171A18]',
    },
    {
      id: 'doubt-solver' as AppView,
      label: 'Ask AI Doubt',
      icon: <HelpCircle className="w-4 h-4 text-[#16835B]" />,
      bg: 'bg-white/80 backdrop-blur-xl border-white/90 text-[#171A18]',
    },
    {
      id: 'news-paper' as AppView,
      label: 'Daily News Paper',
      icon: <Newspaper className="w-4 h-4 text-[#16835B]" />,
      bg: 'bg-white/80 backdrop-blur-xl border-white/90 text-[#171A18]',
    },
    {
      id: 'my-notes' as AppView,
      label: 'Digital Notebook',
      icon: <BookOpen className="w-4 h-4 text-[#16835B]" />,
      bg: 'bg-white/80 backdrop-blur-xl border-white/90 text-[#171A18]',
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* Floating Staggered Action Items (Liquid Glass Style) */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-3 pointer-events-auto">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 380,
                    damping: 24,
                    delay: (menuItems.length - 1 - index) * 0.04,
                  },
                }}
                exit={{
                  opacity: 0,
                  y: 12,
                  scale: 0.8,
                  transition: { duration: 0.15 },
                }}
                className="flex items-center gap-2.5 group cursor-pointer"
                onClick={() => handleAction(item.id)}
              >
                {/* Tooltip Label in Translucent Glass */}
                <span className="px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-xl text-[#171A18] text-xs font-bold shadow-[0_4px_20px_rgba(15,98,70,0.06)] border border-white/90 whitespace-nowrap">
                  {item.label}
                </span>

                {/* Circular Glass Action Bubble */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  className={`w-11 h-11 rounded-full ${item.bg} border shadow-[0_6px_20px_rgba(15,98,70,0.08)] flex items-center justify-center cursor-pointer transition-all hover:border-[#16835B]/40 hover:shadow-lg`}
                >
                  {item.icon}
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button: Liquid Glass AI Assistant with Breathing Animation */}
      <div className="flex flex-col items-center pointer-events-auto">
        <motion.button
          type="button"
          onClick={toggleMenu}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all border ${
            isOpen
              ? 'bg-white/90 backdrop-blur-2xl text-[#171A18] border-white shadow-[0_12px_32px_rgba(15,98,70,0.12)]'
              : 'bg-white/75 backdrop-blur-2xl text-[#16835B] border-white/90 shadow-[0_10px_32px_rgba(22,131,91,0.22)] animate-glass-breathe hover:bg-white/90 hover:border-emerald-300'
          }`}
          title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant Menu'}
        >
          {/* Liquid Glass Inner Refraction Highlight */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-80"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(220, 239, 231, 0.4) 45%, transparent 70%)',
            }}
          />

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="relative z-10 flex items-center justify-center"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-[#171A18]" />
            ) : (
              <Sparkles className="w-6 h-6 text-[#16835B] fill-emerald-500/25" />
            )}
          </motion.div>
        </motion.button>

        {/* Micro-label below button exactly as shown in the reference screenshot */}
        <span className="text-[11px] font-bold text-[#5F6762] tracking-tight mt-1 px-2 py-0.5 rounded-md bg-white/60 backdrop-blur-md border border-white/80 shadow-2xs">
          AI Assistant
        </span>
      </div>
    </div>
  );
};
