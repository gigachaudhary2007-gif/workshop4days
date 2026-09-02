import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export interface MorphingButtonProps {
  children?: React.ReactNode;
  onClick?: () => Promise<void> | void;
  isLoading?: boolean;
  isSuccess?: boolean;
  variant?: 'lime' | 'emerald' | 'dark' | 'violet';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  successText?: string;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
}

export const MorphingButton: React.FC<MorphingButtonProps> = ({
  children = 'Continue',
  onClick,
  isLoading: controlledLoading,
  isSuccess: controlledSuccess,
  variant = 'lime',
  size = 'md',
  className = '',
  disabled = false,
  icon,
  successText,
  type = 'button',
  id,
}) => {
  const { playPop, playSuccess } = useSound();
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalSuccess, setInternalSuccess] = useState(false);

  const loading = controlledLoading !== undefined ? controlledLoading : internalLoading;
  const success = controlledSuccess !== undefined ? controlledSuccess : internalSuccess;

  const handleClick = async () => {
    if (disabled || loading || success) return;
    playPop();

    if (onClick) {
      if (controlledLoading === undefined) {
        setInternalLoading(true);
        try {
          await onClick();
          setInternalLoading(false);
          setInternalSuccess(true);
          playSuccess();
          setTimeout(() => {
            setInternalSuccess(false);
          }, 1800);
        } catch {
          setInternalLoading(false);
        }
      } else {
        onClick();
      }
    }
  };

  // Aesthetics based on video
  const variantStyles = {
    lime: {
      idle: 'bg-[#B6FF00] hover:bg-[#A3E600] text-[#121915] shadow-md hover:shadow-lg',
      badge: 'bg-[#121915] text-white',
      loading: 'bg-[#121915] text-[#B6FF00]',
      success: 'bg-[#10E862] text-white shadow-[0_0_20px_rgba(16,232,98,0.5)]',
    },
    emerald: {
      idle: 'bg-[#16835B] hover:bg-[#0F6246] text-white shadow-md hover:shadow-lg',
      badge: 'bg-white/20 text-white',
      loading: 'bg-[#0F6246] text-white',
      success: 'bg-[#10E862] text-white shadow-[0_0_20px_rgba(16,232,98,0.5)]',
    },
    dark: {
      idle: 'bg-[#171A18] hover:bg-[#252A27] text-white shadow-md',
      badge: 'bg-white/15 text-white',
      loading: 'bg-[#171A18] text-[#10E862]',
      success: 'bg-[#10E862] text-white shadow-[0_0_20px_rgba(16,232,98,0.5)]',
    },
    violet: {
      idle: 'bg-[#5B3A9B] hover:bg-[#4C2E85] text-white shadow-md',
      badge: 'bg-white/20 text-white',
      loading: 'bg-[#381F68] text-[#E0C9FF]',
      success: 'bg-[#10E862] text-white shadow-[0_0_20px_rgba(16,232,98,0.5)]',
    },
  }[variant];

  const sizeStyles = {
    sm: { height: 'h-9', text: 'text-xs', pillPadding: 'px-4', circle: 'w-9 h-9' },
    md: { height: 'h-11 sm:h-12', text: 'text-sm sm:text-base font-bold', pillPadding: 'px-6', circle: 'w-11 sm:w-12 h-11 sm:h-12' },
    lg: { height: 'h-14', text: 'text-base sm:text-lg font-extrabold', pillPadding: 'px-8', circle: 'w-14 h-14' },
  }[size];

  return (
    <div className="relative inline-flex items-center justify-center">
      <motion.button
        type={type}
        id={id}
        disabled={disabled || loading}
        onClick={handleClick}
        layout
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        className={`relative inline-flex items-center justify-center overflow-hidden rounded-full font-bold select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles.height} ${
          success
            ? `${sizeStyles.circle} ${variantStyles.success}`
            : loading
            ? `${sizeStyles.circle} ${variantStyles.loading}`
            : `${sizeStyles.pillPadding} ${variantStyles.idle}`
        } ${className}`}
      >
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="flex items-center justify-center"
            >
              <Check className="w-5 h-5 stroke-[3]" />
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="flex items-center justify-between w-full gap-3 sm:gap-4"
            >
              <span className={sizeStyles.text}>{children}</span>
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5 ${variantStyles.badge}`}
              >
                {icon || <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
