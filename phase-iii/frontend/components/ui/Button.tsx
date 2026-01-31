/**
 * Premium Button Component
 *
 * Features:
 * - Multiple variants (primary, secondary, danger, ghost, outline)
 * - Multiple sizes (xs, sm, md, lg)
 * - Loading state with spinner
 * - Icon support (left/right)
 * - Full width option
 * - Glass effect variant
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center font-medium
    rounded-xl transition-all duration-200 ease-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900
    disabled:pointer-events-none disabled:opacity-50
    active:scale-[0.98]
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-accent-600 to-accent-500 text-white
      shadow-lg shadow-accent-500/25
      hover:from-accent-500 hover:to-accent-400 hover:shadow-accent-500/40
      focus-visible:ring-accent-500
    `,
    secondary: `
      bg-dark-800 text-dark-100 border border-dark-700
      hover:bg-dark-700 hover:border-dark-600
      focus-visible:ring-dark-500
    `,
    danger: `
      bg-error-600/90 text-white
      hover:bg-error-500 shadow-lg shadow-error-500/20
      focus-visible:ring-error-500
    `,
    ghost: `
      bg-transparent text-dark-300
      hover:bg-dark-800 hover:text-dark-100
      focus-visible:ring-dark-500
    `,
    outline: `
      bg-transparent text-accent-400 border border-accent-500/50
      hover:bg-accent-500/10 hover:border-accent-500
      focus-visible:ring-accent-500
    `,
  };

  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs gap-1.5',
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const LoadingSpinner = () => (
    <svg
      className="animate-spin w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          {loadingText || children}
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
