'use client';

/**
 * Premium TaskItem Component
 *
 * Features:
 * - Dark theme with glass morphism
 * - Visual status indicators
 * - Hover effects
 * - Completion toggle
 * - Edit and delete actions
 * - Confirmation modal for delete
 * - Responsive design
 */

import { Task } from '@/types/task';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [isHovered, setIsHovered] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(task.completed);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Handle toggle completion
  const handleToggleComplete = async () => {
    if (isToggling) return;

    setIsToggling(true);
    // Optimistic update
    setLocalCompleted(!localCompleted);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setLocalCompleted(localCompleted);
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Failed to update task',
          message: error.detail || 'Please try again',
        });
        return;
      }

      addToast({
        type: 'success',
        title: localCompleted ? 'Task marked as pending' : 'Task completed!',
      });

      // Refresh the page to get updated data
      router.refresh();
    } catch (error) {
      // Revert optimistic update on error
      setLocalCompleted(localCompleted);
      addToast({
        type: 'error',
        title: 'Failed to update task',
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsToggling(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Failed to delete task',
          message: error.detail || 'Please try again',
        });
        return;
      }

      addToast({
        type: 'success',
        title: 'Task deleted',
        message: 'The task has been removed',
      });

      setShowDeleteModal(false);
      router.refresh();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to delete task',
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit - navigate to edit page
  const handleEdit = () => {
    router.push(`/tasks/${task.id}/edit`);
  };

  const isCompleted = localCompleted;

  return (
    <>
      <div
        className={`
          group relative rounded-2xl border transition-all duration-300 ease-out
          ${isCompleted
            ? 'bg-dark-800/30 border-dark-700/30'
            : 'bg-dark-800/50 border-dark-700/50 hover:bg-dark-800/70 hover:border-dark-600/50 hover:shadow-card-hover'
          }
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Completion checkbox - now clickable */}
            <div className="flex-shrink-0 pt-0.5">
              <button
                type="button"
                onClick={handleToggleComplete}
                disabled={isToggling}
                className={`
                  w-6 h-6 rounded-lg border-2 flex items-center justify-center
                  transition-all duration-200 cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:ring-offset-2 focus:ring-offset-dark-900
                  disabled:cursor-wait
                  ${isCompleted
                    ? 'bg-success-500 border-success-500 hover:bg-success-400'
                    : 'border-dark-600 bg-dark-800 hover:border-accent-500 group-hover:border-dark-500'
                  }
                  ${isToggling ? 'animate-pulse' : ''}
                `}
                aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {isCompleted && (
                  <svg
                    className="w-4 h-4 text-white animate-check"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Task content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3
                className={`
                  text-base font-medium leading-tight transition-colors duration-200
                  ${isCompleted ? 'text-dark-500 line-through' : 'text-dark-100'}
                `}
              >
                {task.title}
              </h3>

              {/* Description */}
              {task.description && (
                <p
                  className={`
                    mt-1.5 text-sm leading-relaxed truncate-2
                    ${isCompleted ? 'text-dark-600' : 'text-dark-400'}
                  `}
                >
                  {task.description}
                </p>
              )}

              {/* Metadata row */}
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                {/* Status badge */}
                <span
                  className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${isCompleted
                      ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                      : 'bg-warning-500/20 text-warning-400 border border-warning-500/30'
                    }
                  `}
                >
                  <span
                    className={`
                      w-1.5 h-1.5 rounded-full
                      ${isCompleted ? 'bg-success-400' : 'bg-warning-400'}
                    `}
                  />
                  {isCompleted ? 'Completed' : 'Pending'}
                </span>

                {/* Separator */}
                <span className="w-1 h-1 rounded-full bg-dark-700" />

                {/* Created date */}
                <span className="flex items-center gap-1.5 text-xs text-dark-500">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(task.created_at)}
                </span>
              </div>
            </div>

            {/* Action buttons - now functional */}
            <div
              className={`
                flex-shrink-0 flex items-center gap-2
                transition-opacity duration-200
                ${isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-50'}
              `}
            >
              <button
                type="button"
                onClick={handleEdit}
                className="p-2 rounded-lg text-dark-400 hover:text-accent-400 hover:bg-accent-500/10
                           transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                title="Edit task"
                aria-label="Edit task"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="p-2 rounded-lg text-dark-400 hover:text-error-400 hover:bg-error-500/10
                           transition-colors focus:outline-none focus:ring-2 focus:ring-error-500/50"
                title="Delete task"
                aria-label="Delete task"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Subtle accent border on left for pending tasks */}
        {!isCompleted && (
          <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-accent-500 to-accent-600 rounded-full" />
        )}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
