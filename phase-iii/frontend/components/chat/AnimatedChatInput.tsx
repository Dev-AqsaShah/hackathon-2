'use client';

/**
 * Animated Chat Input Component
 *
 * Features:
 * - Glowing border on focus
 * - Animated send button
 * - Auto-resize textarea
 * - Keyboard shortcuts
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface AnimatedChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AnimatedChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
}: AnimatedChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      {/* Glow effect when focused */}
      <div
        className={`
          absolute -inset-0.5 rounded-2xl
          bg-gradient-to-r from-cyan-500 to-blue-500
          opacity-0 blur transition-opacity duration-300
          ${isFocused ? 'opacity-50' : ''}
        `}
      />

      {/* Input container */}
      <div
        className={`
          relative flex items-end gap-2 p-3
          bg-slate-800/90 backdrop-blur-sm
          border rounded-2xl
          transition-all duration-300
          ${isFocused ? 'border-cyan-500/50' : 'border-slate-700/50'}
        `}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="
            flex-1 bg-transparent resize-none
            text-slate-200 placeholder:text-slate-500
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            text-sm md:text-base
            max-h-[150px]
          "
        />

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          className={`
            flex-shrink-0 p-3 rounded-xl
            transition-all duration-300
            ${message.trim() && !disabled
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105 active:scale-95'
              : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }
          `}
        >
          {disabled ? (
            // Loading spinner
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
          ) : (
            // Send icon
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Helper text */}
      <p className="mt-2 text-xs text-slate-500 text-center">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">Enter</kbd> to send,{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
}

export default AnimatedChatInput;
