/**
 * Premium Input Component
 *
 * Features:
 * - Dark theme styling with glass effect
 * - Label support
 * - Error state with message
 * - Helper text
 * - Icon support (left/right)
 * - Character counter
 * - Disabled and readonly states
 */

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showCharCount?: boolean;
  maxLength?: number;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      showCharCount = false,
      maxLength,
      className = '',
      id,
      value,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-dark-300 mb-2"
          >
            {label}
            {props.required && <span className="text-error-400 ml-1">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            value={value}
            maxLength={maxLength}
            className={`
              flex h-11 w-full rounded-xl
              border bg-dark-800/50 backdrop-blur-sm
              px-4 py-2.5 text-sm text-dark-100
              placeholder:text-dark-500
              transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0
              disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-dark-800/30
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${
                error
                  ? 'border-error-500/50 focus-visible:ring-error-500/50 focus-visible:border-error-500/50'
                  : 'border-dark-700 focus-visible:ring-accent-500/50 focus-visible:border-accent-500/50'
              }
              ${className}
            `}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Bottom row: error/helper and char count */}
        <div className="flex justify-between items-start mt-1.5 gap-4">
          {/* Error or helper text */}
          <div className="flex-1 min-w-0">
            {error && <p className="text-sm text-error-400">{error}</p>}
            {!error && helperText && (
              <p className="text-xs text-dark-500">{helperText}</p>
            )}
          </div>

          {/* Character counter */}
          {showCharCount && maxLength && (
            <p
              className={`text-xs flex-shrink-0 ${
                charCount >= maxLength ? 'text-error-400' : 'text-dark-500'
              }`}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Premium Textarea Component
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount = false,
      maxLength,
      className = '',
      id,
      value,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-dark-300 mb-2"
          >
            {label}
            {props.required && <span className="text-error-400 ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          rows={rows}
          className={`
            flex w-full rounded-xl
            border bg-dark-800/50 backdrop-blur-sm
            px-4 py-3 text-sm text-dark-100
            placeholder:text-dark-500
            transition-all duration-200 resize-none
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-dark-800/30
            ${
              error
                ? 'border-error-500/50 focus-visible:ring-error-500/50 focus-visible:border-error-500/50'
                : 'border-dark-700 focus-visible:ring-accent-500/50 focus-visible:border-accent-500/50'
            }
            ${className}
          `}
          {...props}
        />

        {/* Bottom row: error/helper and char count */}
        <div className="flex justify-between items-start mt-1.5 gap-4">
          {/* Error or helper text */}
          <div className="flex-1 min-w-0">
            {error && <p className="text-sm text-error-400">{error}</p>}
            {!error && helperText && (
              <p className="text-xs text-dark-500">{helperText}</p>
            )}
          </div>

          {/* Character counter */}
          {showCharCount && maxLength && (
            <p
              className={`text-xs flex-shrink-0 ${
                charCount >= maxLength ? 'text-error-400' : 'text-dark-500'
              }`}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
