"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/dashboard";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { notificationsApi } from "@/lib/api";
import { Notification } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";

type FilterType = "all" | "unread" | "read";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { addNotification } = useAppStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { read?: boolean } = {};
      if (activeFilter === "unread") {
        params.read = false;
      } else if (activeFilter === "read") {
        params.read = true;
      }

      const response = await notificationsApi.getNotifications({
        limit: 50,
        offset: 0,
        ...params,
      });

      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setTotal(response.total);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
      setError(err.message || "Failed to load notifications.");
      addNotification({
        userId: user?.id || "temp",
        type: "error",
        title: "Error",
        message: err.message || "Failed to load notifications.",
        read: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [activeFilter]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (processingIds.has(notificationId)) return;

    setProcessingIds((prev) => new Set(prev).add(notificationId));
    try {
      await notificationsApi.markAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err);
      addNotification({
        userId: user?.id || "temp",
        type: "error",
        title: "Error",
        message: err.message || "Failed to mark notification as read.",
        read: false,
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      const count = await notificationsApi.markAllAsRead();
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      addNotification({
        userId: user?.id || "temp",
        type: "success",
        title: "All Read",
        message: `${count} notification${count !== 1 ? "s" : ""} marked as read.`,
        read: false,
      });
    } catch (err: any) {
      console.error("Failed to mark all as read:", err);
      addNotification({
        userId: user?.id || "temp",
        type: "error",
        title: "Error",
        message: err.message || "Failed to mark all notifications as read.",
        read: false,
      });
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (processingIds.has(notificationId)) return;

    setProcessingIds((prev) => new Set(prev).add(notificationId));
    try {
      await notificationsApi.deleteNotification(notificationId);
      // Update local state
      const deleted = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setTotal((prev) => prev - 1);
      if (deleted && !deleted.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error("Failed to delete notification:", err);
      addNotification({
        userId: user?.id || "temp",
        type: "error",
        title: "Error",
        message: err.message || "Failed to delete notification.",
        read: false,
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  const getIconForType = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case "info":
        return <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case "error":
        return <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <BellIcon className="w-5 h-5 text-neutral-gray600 dark:text-neutral-gray400" />;
    }
  };

  const getBadgeVariant = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "success" as const;
      case "info":
        return "default" as const;
      case "warning":
        return "warning" as const;
      case "error":
        return "error" as const;
      default:
        return "default" as const;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="bg-blue-600 text-white">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-neutral-gray600 dark:text-neutral-gray400">
            Manage your notifications and stay updated
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3">
            <Button
              variant={activeFilter === "all" ? "primary" : "outline"}
              onClick={() => setActiveFilter("all")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={activeFilter === "unread" ? "primary" : "outline"}
              onClick={() => setActiveFilter("unread")}
              size="sm"
            >
              Unread
            </Button>
            <Button
              variant={activeFilter === "read" ? "primary" : "outline"}
              onClick={() => setActiveFilter("read")}
              size="sm"
            >
              Read
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              size="sm"
            >
              {isMarkingAll ? "Marking..." : "Mark All as Read"}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Loading notifications...
            </p>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadNotifications}>Retry</Button>
          </Card>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<BellIcon className="w-16 h-16 text-neutral-gray400 dark:text-neutral-gray500" />}
            title="No Notifications"
            description={
              activeFilter === "all"
                ? "You don't have any notifications yet."
                : activeFilter === "unread"
                ? "You're all caught up! No unread notifications."
                : "No read notifications to display."
            }
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-all ${
                  !notification.read
                    ? "bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500"
                    : "bg-neutral-white dark:bg-neutral-gray800"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIconForType(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                          {notification.title}
                        </h3>
                        <Badge variant={getBadgeVariant(notification.type)}>
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="default" className="bg-blue-600 text-white">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-neutral-gray500 dark:text-neutral-gray500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={processingIds.has(notification.id)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Mark as read"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      disabled={processingIds.has(notification.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Total Count */}
        {!isLoading && !error && notifications.length > 0 && (
          <div className="mt-6 text-center text-sm text-neutral-gray600 dark:text-neutral-gray400">
            Showing {notifications.length} of {total} notification{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

