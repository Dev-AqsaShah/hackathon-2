'use client';

/**
 * Typing Indicator Component
 *
 * Shows animated dots when the AI is "thinking"
 */

import { RobotAvatar } from '@/components/ui/RobotAvatar';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4 animate-fade-in">
      {/* Robot Avatar */}
      <div className="flex-shrink-0">
        <RobotAvatar size="sm" isThinking />
      </div>

      {/* Typing bubble */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
