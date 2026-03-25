import React from 'react';
import { cn } from '../../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid-green' | 'outline-gray' | 'outline-green';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'solid-green', size = 'md', className, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-md transition-colors duration-200 cursor-pointer';
  
  const variants = {
    'solid-green': 'bg-[#1b5e3a] text-white hover:bg-[#14472b]',
    'outline-gray': 'bg-transparent text-gray-700 hover:text-brand-red text-sm font-medium',
    'outline-green': 'bg-white text-[#1b5e3a] border-2 border-[#1b5e3a] hover:bg-[#f0fdf4]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'w-full py-3.5 text-base',
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};