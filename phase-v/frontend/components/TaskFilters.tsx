'use client';

/**
 * TaskFilters — search query, status, priority, and sort controls.
 * Renders as a client component; parent passes onChange callback.
 */

import { useState, useEffect } from 'react';
import { TaskFilters, Priority } from '@/types/task';

interface TaskFiltersProps {
  filters: TaskFilters;
  onChange: (f: TaskFilters) => void;
}

export function TaskFiltersBar({ filters, onChange }: TaskFiltersProps) {
  const [query, setQuery] = useState(filters.query ?? '');

  // Debounce text input 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== filters.query) {
        onChange({ ...filters, query });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const set = (patch: Partial<TaskFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-dark-700 bg-dark-800/50
                     text-dark-100 placeholder:text-dark-500 text-sm
                     focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        />
      </div>

      {/* Status filter */}
      <select
        value={filters.status ?? 'all'}
        onChange={(e) => set({ status: e.target.value as TaskFilters['status'] })}
        className="h-10 px-3 rounded-xl border border-dark-700 bg-dark-800/50 text-dark-300 text-sm
                   focus:outline-none focus:ring-2 focus:ring-accent-500/50"
      >
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="overdue">Overdue</option>
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority ?? ''}
        onChange={(e) => set({ priority: e.target.value as Priority | '' })}
        className="h-10 px-3 rounded-xl border border-dark-700 bg-dark-800/50 text-dark-300 text-sm
                   focus:outline-none focus:ring-2 focus:ring-accent-500/50"
      >
        <option value="">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
        <option value="none">None</option>
      </select>

      {/* Sort */}
      <select
        value={`${filters.sort_by ?? 'created_at'}:${filters.sort_dir ?? 'desc'}`}
        onChange={(e) => {
          const [sort_by, sort_dir] = e.target.value.split(':') as [TaskFilters['sort_by'], TaskFilters['sort_dir']];
          set({ sort_by, sort_dir });
        }}
        className="h-10 px-3 rounded-xl border border-dark-700 bg-dark-800/50 text-dark-300 text-sm
                   focus:outline-none focus:ring-2 focus:ring-accent-500/50"
      >
        <option value="created_at:desc">Newest first</option>
        <option value="created_at:asc">Oldest first</option>
        <option value="due_date:asc">Due date (soon)</option>
        <option value="priority:asc">Priority (high→low)</option>
      </select>
    </div>
  );
}
