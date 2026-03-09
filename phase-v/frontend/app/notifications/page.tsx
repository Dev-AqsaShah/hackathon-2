'use client';

/**
 * Notifications Page — full history with pagination and "Mark all read" button.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationList } from '@/components/notifications/NotificationList';

const DEFAULT_USER_ID = 'default-user';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead } =
    useNotifications(DEFAULT_USER_ID);

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-dark-100">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-dark-400">{unreadCount} unread</p>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-xl text-sm font-medium text-accent-400 border border-accent-500/30
                         hover:bg-accent-500/10 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notification list */}
        {loading && notifications.length === 0 ? (
          <div className="py-16 text-center text-dark-500">Loading...</div>
        ) : (
          <NotificationList
            notifications={notifications}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
          />
        )}
      </div>
    </div>
  );
}
