/**
 * Dashboard Loading State
 *
 * Displayed while dashboard page is loading
 * Next.js automatically shows this during Suspense boundaries
 */

import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function DashboardLoading() {
  return (
    <div className="py-12">
      <LoadingSpinner message="Loading your tasks..." size="lg" />
    </div>
  );
}
