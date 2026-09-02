import React from 'react';
import { Loader2 } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  suppressSound?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  suppressSound = false,
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97]';

  const variantStyles = {
    primary: 'bg-[#16835B] hover:bg-[#0F6246] text-white shadow-sm hover:shadow focus:ring-[#16835B]',
    secondary: 'bg-[#F4F5F1] hover:bg-[#EAECE6] text-[#171A18] border border-[#E1E5E1] focus:ring-[#16835B]',
    outline: 'bg-white hover:bg-[#F8F9F6] text-[#171A18] border border-[#E1E5E1] hover:border-[#CBD3CC] focus:ring-[#16835B]',
    ghost: 'bg-transparent hover:bg-[#F4F5F1] text-[#5F6762] hover:text-[#171A18] focus:ring-[#16835B]',
    danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 focus:ring-rose-500',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-12',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading && !suppressSound) {
      soundEffects.playPop();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
