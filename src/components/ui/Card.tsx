import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = true,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border border-[#E1E5E1] p-5 sm:p-6 transition-all duration-200 ${
        glass
          ? 'bg-white/90 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(22,131,91,0.03)]'
          : 'bg-white shadow-sm'
      } ${
        hoverable ? 'hover:shadow-md hover:border-[#16835B]/30 hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
