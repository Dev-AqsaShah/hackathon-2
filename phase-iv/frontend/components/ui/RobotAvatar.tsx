'use client';

/**
 * Animated Robot Avatar Component
 *
 * Features:
 * - Blinking eyes animation
 * - Subtle floating animation
 * - Glowing effect
 * - Responsive sizing
 */

import { useEffect, useState } from 'react';

interface RobotAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isThinking?: boolean;
}

export function RobotAvatar({ size = 'lg', isThinking = false }: RobotAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const eyeSize = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6',
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse" />

      {/* Robot head */}
      <div
        className={`
          relative ${sizeClasses[size]}
          bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900
          rounded-2xl border-2 border-cyan-500/30
          shadow-lg shadow-cyan-500/20
          flex flex-col items-center justify-center
          ${isThinking ? 'animate-bounce' : 'animate-float'}
        `}
      >
        {/* Antenna */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="w-1 h-4 bg-slate-600 rounded-full" />
          <div className={`
            w-3 h-3 -mt-1 mx-auto rounded-full
            ${isThinking ? 'bg-yellow-400 animate-ping' : 'bg-cyan-400 animate-pulse'}
          `} />
        </div>

        {/* Face plate */}
        <div className="w-3/4 h-1/2 bg-slate-900/50 rounded-xl border border-slate-600/50 flex items-center justify-center gap-3 relative overflow-hidden">
          {/* Screen glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent" />

          {/* Left eye */}
          <div className={`
            ${eyeSize[size]} rounded-full
            ${isBlinking ? 'scale-y-0' : 'scale-y-100'}
            ${isThinking ? 'bg-yellow-400' : 'bg-cyan-400'}
            shadow-lg shadow-cyan-400/50
            transition-transform duration-75
          `} />

          {/* Right eye */}
          <div className={`
            ${eyeSize[size]} rounded-full
            ${isBlinking ? 'scale-y-0' : 'scale-y-100'}
            ${isThinking ? 'bg-yellow-400' : 'bg-cyan-400'}
            shadow-lg shadow-cyan-400/50
            transition-transform duration-75
          `} />
        </div>

        {/* Mouth / Speaker */}
        <div className="mt-2 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`
                w-1 bg-cyan-500/60 rounded-full
                ${isThinking ? 'animate-equalizer' : ''}
              `}
              style={{
                height: isThinking ? `${8 + Math.random() * 8}px` : '4px',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Side panels */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-8 bg-slate-700 rounded-l-lg border-l border-slate-600" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-8 bg-slate-700 rounded-r-lg border-r border-slate-600" />
      </div>
    </div>
  );
}

export default RobotAvatar;
