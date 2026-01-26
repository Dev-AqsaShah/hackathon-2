'use client';

/**
 * TaskItem Component - Client Component
 *
 * Displays a single task with:
 * - Title and description
 * - Completion status checkbox (disabled for now, will enable in US4)
 * - Edit and Delete buttons (will implement handlers in later stories)
 */

import { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Completion Checkbox (disabled for now) */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={task.completed}
            disabled
            className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
          )}

          {/* Metadata */}
          <div className="mt-2 text-xs text-gray-500">
            Created: {new Date(task.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex space-x-2">
          <button
            type="button"
            disabled
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Edit
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
