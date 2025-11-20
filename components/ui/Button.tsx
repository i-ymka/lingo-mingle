import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = [
    'w-full',
    'flex items-center justify-center gap-2',
    'font-semibold',
    'text-base',
    'py-3 px-6',
    'rounded-lg', // iOS style: 12px
    'min-h-touch-large', // 48px touch target
    'border',
    'focus:outline-none focus:ring-3 focus:ring-primary/30',
    'transition-all duration-base ease-ios',
    'active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
  ].join(' ');

  const variantClasses = {
    // Primary with gradient (iOS 2025 style)
    primary: [
      'bg-gradient-to-br from-primary to-primary-dark',
      'text-primary-content',
      'border-transparent',
      'shadow-float hover:shadow-elevated',
      'hover:from-primary-dark hover:to-primary',
    ].join(' '),

    // Secondary/Ghost style
    secondary: [
      'bg-transparent',
      'text-primary',
      'border-2 border-primary',
      'hover:bg-primary/10',
      'shadow-none',
    ].join(' '),

    // Danger
    danger: [
      'bg-error',
      'text-white',
      'border-transparent',
      'hover:bg-error/90',
      'shadow-soft',
    ].join(' '),

    // Ghost (no border)
    ghost: [
      'bg-transparent',
      'text-primary',
      'border-transparent',
      'hover:bg-primary/10',
      'shadow-none',
    ].join(' '),

    // Outline
    outline: [
      'bg-transparent',
      'text-text-main',
      'border-2 border-base-300',
      'hover:bg-base-200',
      'shadow-none',
    ].join(' '),
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
