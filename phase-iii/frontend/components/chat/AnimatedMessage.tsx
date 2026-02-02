'use client';

/**
 * Animated Chat Message Component
 *
 * Features:
 * - Slide-in animation for messages
 * - Different styles for user/assistant
 * - Typing indicator
 * - Timestamp display
 */

import { useEffect, useState } from 'react';
import { RobotAvatar } from '@/components/ui/RobotAvatar';

interface AnimatedMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isNew?: boolean;
}

export function AnimatedMessage({ role, content, timestamp, isNew = false }: AnimatedMessageProps) {
  const [isVisible, setIsVisible] = useState(!isNew);
  const isUser = role === 'user';

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  // Format content - handle task lists
  const formatContent = (text: string) => {
    // Check for numbered lists
    if (text.includes('\n') && text.match(/^\d+\./m)) {
      const lines = text.split('\n');
      return (
        <div className="space-y-1">
          {lines.map((line, index) => {
            const taskMatch = line.match(/^(\d+)\.\s*(.+)$/);
            if (taskMatch) {
              const [, number, taskText] = taskMatch;
              const isCompleted = taskText.toLowerCase().includes('completed') || taskText.includes('✓');
              return (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${isCompleted ? 'opacity-60' : ''}`}
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-medium">
                    {number}
                  </span>
                  <span className={isCompleted ? 'line-through' : ''}>
                    {taskText.replace('[completed]', '').replace('✓', '').trim()}
                  </span>
                </div>
              );
            }
            return line ? <div key={index}>{line}</div> : null;
          })}
        </div>
      );
    }
    return text;
  };

  return (
    <div
      className={`
        flex gap-3 mb-4
        ${isUser ? 'flex-row-reverse' : 'flex-row'}
        ${isVisible ? 'animate-message-in' : 'opacity-0 translate-y-4'}
        transition-all duration-300 ease-out
      `}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0">
          <RobotAvatar size="sm" />
        </div>
      )}

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm shadow-lg shadow-cyan-500/20">
          You
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-3
          ${isUser
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-sm'
            : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm'
          }
          shadow-lg
          ${isUser ? 'shadow-cyan-500/10' : 'shadow-black/20'}
        `}
      >
        {/* Message content */}
        <div className="whitespace-pre-wrap break-words text-sm md:text-base">
          {formatContent(content)}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div
            className={`
              text-xs mt-2 opacity-60
              ${isUser ? 'text-cyan-100' : 'text-slate-400'}
            `}
          >
            {new Intl.DateTimeFormat('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }).format(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnimatedMessage;
