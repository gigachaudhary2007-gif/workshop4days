import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  Headphones,
  FileText,
  Newspaper,
  BookOpen,
  X,
  Sparkles
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
      icon: <Headphones className="w-4 h-4 text-[#10E862]" />,
      bg: 'bg-[#121915]',
      border: 'border-[#222E26]',
      text: 'text-white',
    },
    {
      id: 'doubt-solver' as AppView,
      label: 'Ask AI Doubt',
      icon: <HelpCircle className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-white',
      border: 'border-[#E1E5E1]',
      text: 'text-[#171A18]',
    },
    {
      id: 'news-paper' as AppView,
      label: 'Daily News Paper',
      icon: <Newspaper className="w-4 h-4 text-blue-600" />,
      bg: 'bg-white',
      border: 'border-[#E1E5E1]',
      text: 'text-[#171A18]',
    },
    {
      id: 'my-notes' as AppView,
      label: 'Digital Notebook',
      icon: <BookOpen className="w-4 h-4 text-amber-600" />,
      bg: 'bg-white',
      border: 'border-[#E1E5E1]',
      text: 'text-[#171A18]',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
      {/* Floating Staggered Action Items (From Video 2 template) */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-3 pointer-events-auto">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20, scale: 0.7 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 24,
                    delay: (menuItems.length - 1 - index) * 0.05,
                  },
                }}
                exit={{
                  opacity: 0,
                  y: 15,
                  scale: 0.7,
                  transition: { duration: 0.15 },
                }}
                className="flex items-center gap-2.5 group cursor-pointer"
                onClick={() => handleAction(item.id)}
              >
                {/* Tooltip Label */}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 rounded-xl bg-[#171A18] text-white text-xs font-bold shadow-lg border border-[#2B342E] whitespace-nowrap opacity-90 group-hover:opacity-100"
                >
                  {item.label}
                </motion.span>

                {/* Circular Action Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  className={`w-11 h-11 rounded-full ${item.bg} ${item.border} border shadow-xl flex items-center justify-center cursor-pointer transition-transform`}
                >
                  {item.icon}
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button (4 dots / grid icon that rotates into X like Video 2) */}
      <motion.button
        type="button"
        onClick={toggleMenu}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer pointer-events-auto border transition-all ${
          isOpen
            ? 'bg-[#171A18] text-white border-[#2A342D]'
            : 'bg-gradient-to-tr from-[#0F6246] to-[#16835B] text-white border-emerald-400/40 shadow-[0_8px_25px_rgba(22,131,91,0.4)]'
        }`}
        title={isOpen ? 'Close Quick Menu' : 'Open Study Action Menu'}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="flex items-center justify-center"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            /* 4-dot Grid Icon as shown in jitter.video template */
            <div className="grid grid-cols-2 gap-1.5 w-5 h-5 items-center justify-center p-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
            </div>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};
