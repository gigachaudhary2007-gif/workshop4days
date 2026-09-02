import React from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export const AudioFeedbackButton: React.FC = () => {
  const { isMuted, toggleMute } = useSound();

  return (
    <motion.button
      type="button"
      onClick={toggleMute}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none text-xs font-semibold ${
        !isMuted
          ? 'bg-[#121915] text-[#10E862] border-[#2A342D] shadow-[0_0_12px_rgba(16,232,98,0.2)]'
          : 'bg-[#F4F5F1] text-[#89918C] border-[#E1E5E1] hover:text-[#171A18]'
      }`}
      title={isMuted ? 'Unmute interaction sounds' : 'Mute interaction sounds'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {!isMuted ? (
          <Volume2 className="w-4 h-4 text-[#10E862]" />
        ) : (
          <VolumeX className="w-4 h-4 text-[#89918C]" />
        )}
      </div>

      <span className="hidden sm:inline">
        {!isMuted ? 'Sound FX On' : 'Muted'}
      </span>

      {/* Animated Sound Wave Bars when active (like in user video!) */}
      {!isMuted && (
        <div className="flex items-center gap-0.5 h-3">
          <motion.span
            animate={{ height: ['4px', '12px', '6px', '10px', '4px'] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
            className="w-0.5 rounded-full bg-[#10E862]"
          />
          <motion.span
            animate={{ height: ['8px', '4px', '12px', '5px', '8px'] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
            className="w-0.5 rounded-full bg-[#10E862]"
          />
          <motion.span
            animate={{ height: ['5px', '11px', '4px', '13px', '5px'] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="w-0.5 rounded-full bg-[#10E862]"
          />
        </div>
      )}
    </motion.button>
  );
};
