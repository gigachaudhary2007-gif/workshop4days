import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Folder, BookOpen, ChevronRight, Sparkles, FileText, ArrowUpRight } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { StudentNotebookNote } from '../../types';

export interface StudyFolderData {
  id: string;
  name: string;
  subject: string;
  description: string;
  theme: 'lime' | 'violet' | 'emerald' | 'dark';
  noteCount: number;
  recentTopics: string[];
}

interface InteractiveStudyFolderProps {
  folder: StudyFolderData;
  notes?: StudentNotebookNote[];
  onOpenFolder: (folder: StudyFolderData) => void;
  onQuickAdd?: (folder: StudyFolderData) => void;
}

export const InteractiveStudyFolder: React.FC<InteractiveStudyFolderProps> = ({
  folder,
  notes = [],
  onOpenFolder,
  onQuickAdd,
}) => {
  const { playPop, playFolderOpen } = useSound();
  const [isHovered, setIsHovered] = useState(false);
  const [plusRotated, setPlusRotated] = useState(false);

  // Folder theme styling based on the user's video
  const isLime = folder.theme === 'lime';
  const isViolet = folder.theme === 'violet';
  const isEmerald = folder.theme === 'emerald';

  const themeConfig = {
    lime: {
      bg: 'bg-[#B6FF00]',
      textPrimary: 'text-[#121915]',
      textSecondary: 'text-[#1F2E23]/80',
      border: 'border-[#9FE600]',
      btnBg: 'bg-[#121915] text-[#B6FF00] hover:bg-black',
      deckColor: 'bg-[#121915]',
      tagBg: 'bg-black/10 text-[#121915]',
    },
    violet: {
      bg: 'bg-[#5B3A9B]',
      textPrimary: 'text-white',
      textSecondary: 'text-[#E3D3FF]/80',
      border: 'border-[#4B2F82]',
      btnBg: 'bg-[#B6FF00] text-[#121915] hover:bg-white',
      deckColor: 'bg-[#3A2268]',
      tagBg: 'bg-white/15 text-white',
    },
    emerald: {
      bg: 'bg-[#16835B]',
      textPrimary: 'text-white',
      textSecondary: 'text-emerald-100/80',
      border: 'border-[#0F6246]',
      btnBg: 'bg-white text-[#16835B] hover:bg-emerald-50',
      deckColor: 'bg-[#0F6246]',
      tagBg: 'bg-white/15 text-white',
    },
    dark: {
      bg: 'bg-[#181C1A]',
      textPrimary: 'text-white',
      textSecondary: 'text-[#9EA7A2]',
      border: 'border-[#2B312E]',
      btnBg: 'bg-[#B6FF00] text-[#121915] hover:bg-[#A3E600]',
      deckColor: 'bg-[#2A302D]',
      tagBg: 'bg-white/10 text-[#B6FF00]',
    },
  }[folder.theme];

  const handleCardClick = () => {
    playFolderOpen();
    onOpenFolder(folder);
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPop();
    setPlusRotated((prev) => !prev);
    if (onQuickAdd) {
      onQuickAdd(folder);
    } else {
      onOpenFolder(folder);
    }
  };

  // 6 rectangular paper sheets fanning out in pinwheel orbit as seen in the video!
  const pinwheelSheets = [
    { angle: 0, delay: 0 },
    { angle: 60, delay: 0.05 },
    { angle: 120, delay: 0.1 },
    { angle: 180, delay: 0.15 },
    { angle: 240, delay: 0.2 },
    { angle: 300, delay: 0.25 },
  ];

  return (
    <motion.div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`relative group rounded-3xl p-6 sm:p-7 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 border ${themeConfig.bg} ${themeConfig.border} flex flex-col justify-between min-h-[220px] sm:min-h-[240px]`}
    >
      {/* Top Header info */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${themeConfig.tagBg}`}>
            <Folder className="w-3.5 h-3.5" />
            {folder.subject}
          </span>
          <span className={`text-xs font-semibold ${themeConfig.textSecondary}`}>
            {folder.noteCount} {folder.noteCount === 1 ? 'Note' : 'Notes'}
          </span>
        </div>

        <h3 className={`text-xl sm:text-2xl font-black tracking-tight leading-tight line-clamp-2 ${themeConfig.textPrimary}`}>
          {folder.name}
        </h3>

        <p className={`text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed font-medium ${themeConfig.textSecondary}`}>
          {folder.description}
        </p>
      </div>

      {/* Bottom Area: Dynamic Interactive Elements */}
      <div className="relative z-10 mt-6 pt-4 flex items-end justify-between">
        {/* Recent topics / chip preview */}
        <div className="flex flex-wrap gap-1.5 max-w-[65%]">
          {folder.recentTopics.slice(0, 2).map((topic, i) => (
            <span
              key={i}
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-lg backdrop-blur-sm truncate max-w-[140px] ${
                isLime ? 'bg-black/10 text-[#121915]' : 'bg-white/10 text-white/90'
              }`}
            >
              #{topic}
            </span>
          ))}
        </div>

        {/* Right Corner: Distinctive Animated Graphic from the Video! */}
        {isViolet ? (
          // Rotating overlapping fan of study cards (from the violet card in user video)
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
            <motion.div
              animate={{
                rotate: isHovered ? [0, 360] : [0, 180, 360],
              }}
              transition={{
                duration: isHovered ? 8 : 22,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="relative w-16 h-16 sm:w-20 sm:h-20"
            >
              {pinwheelSheets.map((item, idx) => (
                <motion.div
                  key={idx}
                  style={{
                    transformOrigin: '50% 120%',
                    rotate: `${item.angle}deg`,
                  }}
                  animate={{
                    scale: isHovered ? 1.08 : 1,
                  }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-4 sm:w-5 h-8 sm:h-9 rounded-md bg-[#845EC2]/60 border border-[#B685FF]/40 shadow-xs backdrop-blur-sm"
                />
              ))}
            </motion.div>

            {/* Center Floating Plus trigger */}
            <motion.button
              type="button"
              onClick={handlePlusClick}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className={`absolute z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform ${themeConfig.btnBg}`}
              title="Add note in folder"
            >
              <motion.div animate={{ rotate: plusRotated || isHovered ? 45 : 0 }}>
                <Plus className="w-4 h-4 stroke-[3]" />
              </motion.div>
            </motion.button>
          </div>
        ) : (
          // Electric Lime Card with the signature rotating circular Plus Button (from the lime card in user video)
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={handlePlusClick}
              whileHover={{ scale: 1.12, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors ${themeConfig.btnBg}`}
              title="Add note or open folder"
            >
              <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Decorative background optical shimmer */}
      <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
    </motion.div>
  );
};
