'use client';

import { Notification } from '@/types/task';

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: number) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
}

export function NotificationList({ notifications, onMarkRead, onMarkAllRead }: NotificationListProps) {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const typeIcon = (type: string) => {
    if (type === 'overdue') return '⚠️';
    if (type === 'reminder') return '🔔';
    return '📌';
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-2">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onMarkAllRead}
            className="text-sm text-accent-400 hover:text-accent-300 transition-colors"
          >
            Mark all read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-4xl mb-4">🔔</div>
          <p className="text-dark-400 text-sm">No notifications yet</p>
          <p className="text-dark-600 text-xs mt-1">You&apos;ll see overdue alerts and reminders here</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl border p-4 transition-all cursor-pointer hover:bg-dark-800/70
              ${n.is_read
                ? 'bg-dark-800/30 border-dark-700/30'
                : 'bg-dark-800/60 border-dark-700/60'
              }`}
            onClick={() => !n.is_read && onMarkRead(n.id)}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5">{typeIcon(n.notification_type)}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.is_read ? 'text-dark-400' : 'text-dark-100'}`}>
                  {n.content}
                </p>
                <p className="mt-1 text-xs text-dark-500">{formatTime(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <span className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-accent-500" />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
