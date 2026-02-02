'use client';

/**
 * Chat Message Component
 *
 * Displays a single message bubble with user/assistant styling.
 * Per constitution: Frontend must be a thin presentation layer only.
 */

import { cn } from '@/lib/utils';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export function Message({ role, content, timestamp }: MessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none dark:bg-gray-800 dark:text-gray-100'
        )}
      >
        {/* Message content */}
        <div className="whitespace-pre-wrap break-words">
          {formatContent(content)}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div
            className={cn(
              'text-xs mt-1',
              isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {formatTime(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Format message content, handling task lists and special formatting.
 */
function formatContent(content: string): React.ReactNode {
  // Check if content looks like a task list (numbered items)
  if (content.includes('\n1.') || content.match(/^\d+\./m)) {
    const lines = content.split('\n');
    return (
      <div>
        {lines.map((line, index) => {
          // Check if line is a numbered task
          const taskMatch = line.match(/^(\d+)\.\s*(.+)$/);
          if (taskMatch) {
            const [, number, text] = taskMatch;
            // Check for completion status
            const isCompleted = text.includes('[completed]') || text.includes('✓');
            const displayText = text.replace('[completed]', '').replace('✓', '').trim();

            return (
              <div
                key={index}
                className={cn(
                  'py-1',
                  isCompleted && 'line-through text-gray-500'
                )}
              >
                <span className="font-medium">{number}.</span> {displayText}
              </div>
            );
          }
          return <div key={index}>{line}</div>;
        })}
      </div>
    );
  }

  return content;
}

/**
 * Format timestamp for display.
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export default Message;
