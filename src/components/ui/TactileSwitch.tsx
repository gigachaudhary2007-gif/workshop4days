import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

interface TactileSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  id?: string;
}

export const TactileSwitch: React.FC<TactileSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  disabled = false,
  id,
}) => {
  const { playToggle } = useSound();

  const handleToggle = () => {
    if (disabled) return;
    const next = !checked;
    playToggle(next);
    onChange(next);
  };

  const dimensions = {
    sm: { track: 'w-10 h-6 p-0.5', thumb: 'w-5 h-5', translate: 16, icon: 10 },
    md: { track: 'w-13 h-7.5 p-1', thumb: 'w-5.5 h-5.5', translate: 22, icon: 12 },
    lg: { track: 'w-16 h-9 p-1', thumb: 'w-7 h-7', translate: 28, icon: 14 },
  }[size];

  return (
    <div className="flex items-center justify-between gap-3">
      {(label || description) && (
        <div className="flex flex-col cursor-pointer" onClick={handleToggle}>
          {label && (
            <span className="text-sm font-semibold text-[#171A18] select-none">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-[#5F6762] select-none">
              {description}
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        disabled={disabled}
        onClick={handleToggle}
        className={`relative inline-flex items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#16835B]/30 focus:ring-offset-2 ${dimensions.track} ${
          checked
            ? 'bg-[#10E862] shadow-[0_0_14px_rgba(16,232,98,0.45)]'
            : 'bg-[#1E2321] hover:bg-[#2A302D]'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <motion.div
          animate={{
            x: checked ? dimensions.translate : 0,
            scale: [1, 1.12, 1],
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className={`${dimensions.thumb} rounded-full bg-white shadow-md flex items-center justify-center`}
        >
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="text-[#0D9447] stroke-[3]" size={dimensions.icon} />
            </motion.div>
          )}
        </motion.div>
      </button>
    </div>
  );
};
