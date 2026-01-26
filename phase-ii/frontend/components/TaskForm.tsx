'use client';

/**
 * TaskForm Component - Reusable Task Creation/Edit Form
 *
 * Features:
 * - Title and description inputs with validation
 * - Client-side validation (title required, max lengths)
 * - Loading state during API call
 * - Error handling and display
 * - Cancel button
 * - Mobile-first responsive design
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { validateTaskForm } from '@/lib/validation';
import { TaskCreateInput, Task } from '@/types/task';

interface TaskFormProps {
  initialData?: Task;
  userId: number;
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

    // Call API
    setLoading(true);
    try {
      if (mode === 'create') {
        // Create new task
        const response = await apiClient.post<Task>(
          `/api/${userId}/tasks`,
          formData
        );

        if (response.error) {
          throw new Error(response.error.detail || 'Failed to create task');
        }

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        // Edit existing task (will implement in US5)
        const response = await apiClient.put<Task>(
          `/api/${userId}/tasks/${initialData!.id}`,
          formData
        );

        if (response.error) {
          throw new Error(response.error.detail || 'Failed to update task');
        }

        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Task form error:', error);

      // Handle API errors
      if (error.message?.includes('Unauthorized')) {
        setApiError('Session expired. Please sign in again.');
        setTimeout(() => router.push('/signin'), 2000);
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

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {mode === 'create' ? 'Create New Task' : 'Edit Task'}
      </h1>

      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            maxLength={1000}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter task title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {title.length}/1000 characters
          </p>
        </div>

        {/* Description Textarea */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            maxLength={5000}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter task description (optional)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {description.length}/5000 characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </span>
            ) : (
              mode === 'create' ? 'Create Task' : 'Save Changes'
            )}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-2 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
