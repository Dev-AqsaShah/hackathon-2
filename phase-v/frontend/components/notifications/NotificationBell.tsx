'use client';

/**
 * NotificationBell — shows unread count badge and dropdown of recent notifications.
 */

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/task';
import Link from 'next/link';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(userId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const recent = notifications.slice(0, 5);

  const typeIcon = (type: string) => {
    if (type === 'overdue') return '⚠️';
    if (type === 'reminder') return '🔔';
    return '📌';
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-700/50
                   transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        aria-label={`${unreadCount} unread notifications`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center
                           rounded-full bg-red-500 text-white text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-dark-700 bg-dark-900/95
                        backdrop-blur-sm shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
            <h3 className="text-sm font-semibold text-dark-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs text-accent-400 hover:text-accent-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          {recent.length === 0 ? (
            <div className="py-8 text-center text-sm text-dark-500">
              No notifications yet
            </div>
          ) : (
            <ul>
              {recent.map((n: Notification) => (
                <li
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`px-4 py-3 border-b border-dark-800 cursor-pointer transition-colors
                             hover:bg-dark-800/50 ${!n.is_read ? 'bg-dark-800/30' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5">{typeIcon(n.notification_type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight ${n.is_read ? 'text-dark-400' : 'text-dark-100'}`}>
                        {n.content}
                      </p>
                      <p className="mt-1 text-xs text-dark-500">{formatTime(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-accent-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          <div className="px-4 py-3">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-accent-400 hover:text-accent-300 transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
