import React, { useState } from 'react';
import { motion } from 'motion/react';
import { soundEffects } from '../../utils/soundEffects';

interface AnimatedEmojiButtonProps {
  emoji?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'light' | 'dark' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  showWavingArcs?: boolean;
}

export const AnimatedEmojiButton: React.FC<AnimatedEmojiButtonProps> = ({
  emoji = '👋',
  label = 'Hey Vishal!',
  onClick,
  className = '',
  variant = 'light',
  size = 'md',
  showWavingArcs = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    soundEffects.playPop();
    if (onClick) onClick();
  };

  const variantStyles = {
    light:
      'bg-white/80 backdrop-blur-md hover:bg-white/95 text-[#171A18] border-white/80 shadow-[0_4px_16px_rgba(15,98,70,0.05)] hover:shadow-md hover:border-[#16835B]/30',
    brand:
      'bg-[#16835B] hover:bg-[#0F6246] text-white border-transparent shadow-[0_4px_14px_rgba(22,131,91,0.25)]',
    dark: 'bg-[#121915]/90 backdrop-blur-md hover:bg-[#1A241E] text-white border-[#2A342D] shadow-md',
  };

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-2 rounded-full',
    md: 'px-5 py-2 text-sm sm:text-base gap-2.5 rounded-full',
    lg: 'px-6 py-3 text-base sm:text-lg gap-3 rounded-full',
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => {
        setIsHovered(true);
        soundEffects.playPop();
      }}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      className={`relative inline-flex items-center font-bold tracking-tight select-none cursor-pointer border transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {/* Waving Hand Container with Soft Emerald Motion Waving Arcs */}
      <div className="relative inline-flex items-center justify-center">
        {showWavingArcs && (
          <>
            {/* Left waving motion arcs */}
            <motion.svg
              viewBox="0 0 16 24"
              className="absolute -left-2.5 sm:-left-3 w-3 sm:w-3.5 h-4 sm:h-5 text-emerald-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              animate={
                isHovered
                  ? {
                      opacity: [0.4, 1, 0.4],
                      scale: [0.85, 1.15, 0.85],
                    }
                  : {
                      opacity: [0.3, 0.9, 0.3],
                      scale: [0.9, 1.05, 0.9],
                    }
              }
              transition={{
                repeat: Infinity,
                duration: isHovered ? 0.6 : 1.2,
                ease: 'easeInOut',
              }}
            >
              <path d="M12 4 C6 8, 6 16, 12 20" />
              <path d="M6 7 C2 10, 2 14, 6 17" opacity="0.75" />
            </motion.svg>

            {/* Right waving motion arcs */}
            <motion.svg
              viewBox="0 0 16 24"
              className="absolute -right-2.5 sm:-right-3 -top-1 w-3 sm:w-3.5 h-4 sm:h-5 text-emerald-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              animate={
                isHovered
                  ? {
                      opacity: [1, 0.4, 1],
                      scale: [1.15, 0.85, 1.15],
                    }
                  : {
                      opacity: [0.9, 0.3, 0.9],
                      scale: [1.05, 0.9, 1.05],
                    }
              }
              transition={{
                repeat: Infinity,
                duration: isHovered ? 0.6 : 1.2,
                ease: 'easeInOut',
              }}
            >
              <path d="M4 4 C10 8, 10 16, 4 20" />
              <path d="M10 7 C14 10, 14 14, 10 17" opacity="0.75" />
            </motion.svg>
          </>
        )}

        {/* Animated Rotating Waving Emoji */}
        <motion.span
          animate={
            isHovered
              ? {
                  rotate: [0, 24, -18, 24, -12, 18, 0],
                  scale: [1, 1.25, 1.25, 1.25, 1.2, 1.1, 1],
                }
              : {
                  rotate: [0, 14, -10, 14, -6, 10, 0],
                }
          }
          transition={{
            repeat: Infinity,
            repeatDelay: isHovered ? 0.2 : 1.8,
            duration: 1.1,
            ease: 'easeInOut',
          }}
          className="inline-block origin-bottom-center text-xl sm:text-2xl leading-none z-10"
        >
          {emoji}
        </motion.span>
      </div>

      <span className="font-extrabold text-[#171A18] tracking-tight ml-1">{label}</span>
    </motion.button>
  );
};
