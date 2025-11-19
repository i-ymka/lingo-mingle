import React, { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
}

const Input: React.FC<InputProps> = ({ label, id, icon, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-text-muted mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`mt-1 block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-3 bg-base-200 text-text-main border border-base-300 rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;