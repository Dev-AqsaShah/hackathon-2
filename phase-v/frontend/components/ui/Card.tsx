/**
 * Premium Card Component
 *
 * Features:
 * - Dark theme with glass morphism
 * - Hover effects
 * - Multiple variants
 * - Header, title, description, content, footer sections
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'outlined' | 'elevated';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className = '',
  variant = 'default',
  hover = false,
  padding = 'md',
}: CardProps) {
  const variantClasses = {
    default: 'bg-dark-800/50 border border-dark-700/50 shadow-card',
    glass: 'bg-dark-800/40 backdrop-blur-xl border border-dark-700/50 shadow-card',
    outlined: 'bg-transparent border border-dark-700/50',
    elevated: 'bg-dark-800/70 border border-dark-700/50 shadow-lg',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover
    ? 'transition-all duration-300 ease-out hover:border-dark-600/50 hover:shadow-card-hover hover:bg-dark-800/70 hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`
        rounded-2xl
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverClasses}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardSectionProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: CardSectionProps) {
  return (
    <h3 className={`text-xl font-semibold text-dark-100 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: CardSectionProps) {
  return (
    <p className={`text-sm text-dark-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: CardSectionProps) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardSectionProps) {
  return (
    <div className={`mt-6 pt-4 border-t border-dark-700/50 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Stat Card - For displaying metrics/stats
 */
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className = '' }: StatCardProps) {
  return (
    <Card variant="glass" padding="md" className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dark-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-dark-100">{value}</p>
          {trend && (
            <p
              className={`mt-1 text-sm ${
                trend.isPositive ? 'text-success-400' : 'text-error-400'
              }`}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-accent-500/20 text-accent-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
