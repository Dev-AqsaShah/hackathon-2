'use client';

/**
 * Premium TaskForm Component
 *
 * Features:
 * - Dark theme styling
 * - Title and description inputs with validation
 * - Character counters
 * - Loading states
 * - Error handling
 * - Responsive design
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateTaskForm } from '@/lib/validation';
import { TaskCreateInput, Task } from '@/types/task';
import { Button } from '@/components/ui/Button';

interface TaskFormProps {
  initialData?: Task;
  userId: string | number;
  mode: 'create' | 'edit';
}

export function TaskForm({ initialData, userId, mode }: TaskFormProps) {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});
    setApiError('');

    // Prepare form data
    const formData: TaskCreateInput = {
      title,
      description: description || undefined,
    };

    // Client-side validation
    const validationErrors = validateTaskForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Call Next.js API routes (which proxy to the backend with JWT auth)
    setLoading(true);
    try {
      if (mode === 'create') {
        // Create new task via Next.js API route
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to create task');
        }

        // Redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      } else {
        // Edit existing task via Next.js API route
        const response = await fetch(`/api/tasks/${initialData!.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to update task');
        }

        // Redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Task form error:', error);

      // Handle API errors
      if (error.message?.includes('Unauthorized')) {
        setApiError('Session expired. Please sign in again.');
        setTimeout(() => router.push('/login'), 2000);
      } else if (error.message?.includes('422')) {
        setApiError('Validation error. Please check your inputs.');
      } else {
        setApiError(error.message || 'Failed to save task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancel button
   */
  const handleCancel = () => {
    router.push('/dashboard');
  };

  const titleMaxLength = 1000;
  const descriptionMaxLength = 5000;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-card p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark-100">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h1>
          <p className="mt-1 text-dark-400">
            {mode === 'create'
              ? 'Add a new task to your list'
              : 'Update your task details'}
          </p>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-error-500/10 border border-error-500/30 animate-fade-in">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-error-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-error-400">{apiError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-dark-300 mb-2">
              Task Title <span className="text-error-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                maxLength={titleMaxLength}
                placeholder="What needs to be done?"
                className={`
                  w-full h-12 pl-12 pr-4 rounded-xl
                  border bg-dark-800/50 backdrop-blur-sm
                  text-dark-100 placeholder:text-dark-500
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.title
                    ? 'border-error-500/50 focus:ring-error-500/50'
                    : 'border-dark-700 focus:ring-accent-500/50 focus:border-accent-500/50'
                  }
                `}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <div>
                {errors.title && (
                  <p className="text-sm text-error-400">{errors.title}</p>
                )}
              </div>
              <p className={`text-xs ${
                title.length >= titleMaxLength ? 'text-error-400' : 'text-dark-500'
              }`}>
                {title.length}/{titleMaxLength}
              </p>
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-dark-300 mb-2">
              Description <span className="text-dark-500">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                maxLength={descriptionMaxLength}
                rows={5}
                placeholder="Add more details about this task..."
                className={`
                  w-full px-4 py-3 rounded-xl
                  border bg-dark-800/50 backdrop-blur-sm
                  text-dark-100 placeholder:text-dark-500
                  transition-all duration-200 resize-none
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.description
                    ? 'border-error-500/50 focus:ring-error-500/50'
                    : 'border-dark-700 focus:ring-accent-500/50 focus:border-accent-500/50'
                  }
                `}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <div>
                {errors.description && (
                  <p className="text-sm text-error-400">{errors.description}</p>
                )}
              </div>
              <p className={`text-xs ${
                description.length >= descriptionMaxLength ? 'text-error-400' : 'text-dark-500'
              }`}>
                {description.length}/{descriptionMaxLength}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              fullWidth
              isLoading={loading}
              loadingText={mode === 'create' ? 'Creating...' : 'Saving...'}
            >
              {mode === 'create' ? 'Create Task' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Tips section for create mode */}
      {mode === 'create' && (
        <div className="mt-6 p-5 rounded-2xl bg-dark-800/30 border border-dark-700/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-dark-300">Pro tip</p>
              <p className="mt-1 text-xs text-dark-500">
                Be specific with your task titles. Instead of "Work on project", try "Write introduction section for Q4 report".
                Clear tasks are easier to complete!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
