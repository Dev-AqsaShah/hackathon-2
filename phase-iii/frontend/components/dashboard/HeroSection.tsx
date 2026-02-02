'use client';

/**
 * Hero Section Component
 *
 * Features:
 * - Animated robot avatar
 * - "Ask Anything" text with gradient
 * - New Task button with glow effect
 * - Animated background particles
 */

import { useRouter } from 'next/navigation';
import { RobotAvatar } from '@/components/ui/RobotAvatar';

interface HeroSectionProps {
  userName?: string;
}

export function HeroSection({ userName = 'User' }: HeroSectionProps) {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-8 md:p-12">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Floating particles - using fixed positions to avoid hydration mismatch */}
        {[
          { left: 5, top: 10, delay: 0, duration: 8 },
          { left: 15, top: 80, delay: 1, duration: 10 },
          { left: 25, top: 30, delay: 2, duration: 12 },
          { left: 35, top: 60, delay: 0.5, duration: 9 },
          { left: 45, top: 20, delay: 1.5, duration: 11 },
          { left: 55, top: 70, delay: 2.5, duration: 8 },
          { left: 65, top: 40, delay: 3, duration: 10 },
          { left: 75, top: 90, delay: 0.8, duration: 12 },
          { left: 85, top: 15, delay: 1.8, duration: 9 },
          { left: 95, top: 50, delay: 2.8, duration: 11 },
          { left: 10, top: 45, delay: 3.5, duration: 8 },
          { left: 30, top: 85, delay: 4, duration: 10 },
          { left: 50, top: 25, delay: 0.3, duration: 12 },
          { left: 70, top: 55, delay: 1.3, duration: 9 },
          { left: 90, top: 75, delay: 2.3, duration: 11 },
        ].map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Robot Avatar */}
        <div className="flex-shrink-0">
          <RobotAvatar size="xl" />
        </div>

        {/* Text Content */}
        <div className="flex-1 text-center md:text-left">
          {/* Greeting */}
          <p className="text-slate-400 text-lg mb-2 animate-fade-in">
            Hello, <span className="text-cyan-400 font-medium">{userName}</span>
          </p>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in-up">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              Ask Anything
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-lg md:text-xl mb-8 max-w-xl animate-fade-in-up animation-delay-200">
            Your AI-powered assistant is ready to help you manage tasks,
            answer questions, and boost your productivity.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-fade-in-up animation-delay-400">
            {/* Primary: New Task Button */}
            <button
              onClick={() => router.push('/chat')}
              className="
                group relative px-8 py-4 rounded-xl
                bg-gradient-to-r from-cyan-500 to-blue-500
                text-white font-semibold text-lg
                shadow-lg shadow-cyan-500/25
                hover:shadow-xl hover:shadow-cyan-500/40
                hover:scale-105 active:scale-95
                transition-all duration-300
                overflow-hidden
              "
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <span className="relative flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </span>
            </button>

            {/* Secondary: View Tasks Button */}
            <button
              onClick={() => {
                const tasksSection = document.getElementById('tasks-section');
                tasksSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="
                px-8 py-4 rounded-xl
                bg-slate-800/50 border border-slate-700
                text-slate-300 font-semibold text-lg
                hover:bg-slate-700/50 hover:border-cyan-500/50
                hover:text-white
                transition-all duration-300
              "
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                View Tasks
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </div>
  );
}

export default HeroSection;
