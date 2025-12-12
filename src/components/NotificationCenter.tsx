import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Package,
  DollarSign,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
} from 'lucide-react';
import NotificationBadge from './ui/NotificationBadge';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  icon?: React.ReactNode;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;

    switch (notification.type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell icon trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
      >
        <NotificationBadge count={unreadCount} size="sm" pulse={unreadCount > 0}>
          <Bell className="h-5 w-5" />
        </NotificationBadge>
      </button>

      {/* Notification dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-default)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-[var(--text-secondary)]" />
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filter === 'unread'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="p-3 rounded-full bg-[var(--bg-tertiary)] mb-3">
                    <Bell className="h-6 w-6 text-[var(--text-tertiary)]" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-default)]">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 ${
                        !notification.read ? 'bg-[var(--color-primary-light)]/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg flex-shrink-0 ${getNotificationBg(notification.type)}`}>
                          {getNotificationIcon(notification)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <div className="flex items-center gap-1">
                              {!notification.read && onMarkAsRead && (
                                <button
                                  onClick={() => onMarkAsRead(notification.id)}
                                  className="p-1 hover:bg-[var(--bg-card)] rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={() => onDelete(notification.id)}
                                  className="p-1 hover:bg-[var(--bg-card)] rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer actions */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-[var(--border-default)] flex items-center gap-2">
                {unreadCount > 0 && onMarkAllAsRead && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all as read
                  </button>
                )}
                {onClearAll && (
                  <button
                    onClick={onClearAll}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear all
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;

