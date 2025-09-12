import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = [
    'w-full',
    'font-semibold',
    'text-lg',
    'py-4 px-6',
    'rounded-xl',
    'shadow-md hover:shadow-lg',
    'border border-transparent',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'transition-all active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' ');
  
  const variantClasses = {
    primary: 'bg-primary text-primary-content hover:opacity-90 focus:ring-primary',
    secondary: 'bg-secondary text-primary-content hover:opacity-90 focus:ring-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-primary hover:bg-primary/10 focus:ring-primary',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
