// types/state.ts
// Frontend state management types for React components

import { Task, TaskCreateInput, TaskUpdateInput } from "./task";

/**
 * Task list UI state
 * Represents the current state of the task list on the dashboard
 */
export interface TaskListState {
  /** Array of tasks (empty if no tasks) */
  tasks: Task[];

  /** Loading state (true during API fetch) */
  loading: boolean;

  /** Error message (null if no error) */
  error: string | null;
}

/**
 * Task form UI state
 * Represents the state of task creation/edit forms
 */
export interface TaskFormState {
  /** Current form data */
  data: TaskCreateInput | TaskUpdateInput;

  /** Validation errors (field name → error message) */
  errors: {
    title?: string;
    description?: string;
  };

  /** Submission state (true during API request) */
  submitting: boolean;

  /** Submission error (null if no error) */
  error: string | null;
}

/**
 * Authentication form state
 * Used for signin/signup forms
 */
export interface AuthFormState {
  /** Loading state during authentication */
  loading: boolean;

  /** Error message (null if no error) */
  error: string | null;
}
