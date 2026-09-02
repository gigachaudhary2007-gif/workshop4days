import React from 'react';
import { motion } from 'motion/react';
import { useSound } from '../../context/SoundContext';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  variant = 'light',
  className = '',
}: SegmentedControlProps<T>) {
  const { playTabSwitch } = useSound();

  const handleSelect = (val: T) => {
    if (val !== value) {
      playTabSwitch();
      onChange(val);
    }
  };

  const sizeClasses = {
    sm: 'p-1 text-xs gap-1',
    md: 'p-1.5 text-xs sm:text-sm gap-1.5',
    lg: 'p-2 text-sm sm:text-base gap-2',
  }[size];

  const itemPadding = {
    sm: 'py-1 px-3',
    md: 'py-1.5 px-4',
    lg: 'py-2 px-5',
  }[size];

  const containerStyles =
    variant === 'dark'
      ? 'bg-[#181C1A] border border-[#2B312E] text-[#9EA7A2]'
      : 'bg-[#F2F4F0] border border-[#E1E5E1] text-[#5F6762]';

  const activeStyles =
    variant === 'dark'
      ? 'text-[#171A18] font-bold'
      : 'text-[#171A18] font-bold';

  return (
    <div
      className={`relative inline-flex items-center rounded-2xl ${containerStyles} ${sizeClasses} ${className}`}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-xl transition-colors duration-200 select-none whitespace-nowrap ${itemPadding} ${
              isActive ? activeStyles : 'hover:text-[#171A18]'
            }`}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>

            {isActive && (
              <motion.div
                layoutId="segmentedControlActivePill"
                className="absolute inset-0 z-[-1] rounded-xl bg-white shadow-sm border border-black/5"
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 35,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
