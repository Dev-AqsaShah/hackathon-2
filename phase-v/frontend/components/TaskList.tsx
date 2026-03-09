/**
 * Premium TaskList Component
 *
 * Features:
 * - Dark theme styling
 * - Premium empty state
 * - Animated list items
 * - Status filtering (visual)
 */

import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import Link from 'next/link';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="glass-card p-12 text-center animate-fade-in">
        {/* Illustration */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-dark-800/50 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-dark-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>

        {/* Text */}
        <h3 className="text-xl font-semibold text-dark-100">No tasks yet</h3>
        <p className="mt-2 text-dark-400 max-w-sm mx-auto">
          Your task list is empty. Create your first task to get started and stay organized.
        </p>

        {/* Action */}
        <div className="mt-8">
          <Link
            href="/tasks/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                       bg-gradient-to-r from-accent-600 to-accent-500 text-white font-medium
                       shadow-lg shadow-accent-500/25
                       hover:from-accent-500 hover:to-accent-400 hover:shadow-accent-500/40
                       transition-all duration-200 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Task
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-10 pt-8 border-t border-dark-700/50">
          <p className="text-xs text-dark-500 uppercase tracking-wider mb-4">Quick Tips</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-dark-800/30">
              <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="text-sm text-dark-300 font-medium">Be specific</p>
              <p className="mt-1 text-xs text-dark-500">Clear titles help you stay focused</p>
            </div>
            <div className="p-4 rounded-xl bg-dark-800/30">
              <div className="w-8 h-8 rounded-lg bg-success-500/20 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-dark-300 font-medium">Complete tasks</p>
              <p className="mt-1 text-xs text-dark-500">Check off items as you finish</p>
            </div>
            <div className="p-4 rounded-xl bg-dark-800/30">
              <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm text-dark-300 font-medium">Stay consistent</p>
              <p className="mt-1 text-xs text-dark-500">Daily reviews boost productivity</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Task list
  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TaskItem task={task} />
        </div>
      ))}
    </div>
  );
}
